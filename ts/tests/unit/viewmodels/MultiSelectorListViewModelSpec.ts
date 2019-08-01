'use strict';

class MultiSelectorListViewModelImpl extends ap.viewmodels.MultiSelectorListViewModel {
    getEntityText(entity: ap.models.Entity): string {
        return super.getEntityText(entity);
    }
    itemIsCheckedChanged(item: ap.viewmodels.IEntityViewModel) {
        super.itemIsCheckedChanged(item);
    }
}

describe("Module ap-viewmodels: MultiSelectorListViewModel", () => {
    let Utility: ap.utility.UtilityHelper;
    let Api: ap.services.apiHelper.Api;
    let $q: angular.IQService;
    let $rootScope: angular.IRootScopeService;
    let apiOpt: ap.services.apiHelper.ApiOption;
    let vm: MultiSelectorListViewModelImpl;
    let ListController: ap.controllers.ListController;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-controllers");
    });

    beforeEach(inject(function (_Utility_, _Api_, _$q_, _$rootScope_, _ListController_) {
        Utility = _Utility_;
        Api = _Api_;
        $q = _$q_;
        $rootScope = _$rootScope_;
        ListController = _ListController_;
    }));

    beforeEach(() => {
        let options = new ap.viewmodels.GenericPagedListOptions("ContactDetails", null, null, null, 2);
        vm = new MultiSelectorListViewModelImpl(Utility, ListController, $q, options);
    });

    function createEntity(id: string): ap.models.Entity {
        let entity: ap.models.Entity = new ap.models.projects.ContactDetails(Utility);
        entity.createByJson({ Id: id });
        return entity;
    }

    class ApiResponseMock {
        public reply(args: any) {
            let response = new ap.services.apiHelper.ApiResponse(args)
            this.deferred.resolve(response);
            this.$rootScope.$apply();
        }

        constructor(private apiMethodName: keyof ap.services.apiHelper.Api, private Api: ap.services.apiHelper.Api, private $q: angular.IQService, private $rootScope: angular.IRootScopeService) {
            this.deferred = $q.defer();
            spyOn(Api, apiMethodName).and.returnValue(this.deferred.promise);
        }

        private deferred: angular.IDeferred<any>;
    }

    describe("Feature: MultiSelectorListViewModel", () => {
        describe("WHEN MultiSelectorListViewModel is created", () => {
            it("THEN, checkedIds property is an empty array", () => {
                expect(vm.checkedIds).toBeDefined();
                expect(vm.checkedIds.length).toEqual(0);
            });
            it("THEN, checkedValuesText is an empty string", () => {
                expect(vm.checkedValuesText).toBeDefined();
                expect(vm.checkedValuesText).toEqual("");
            });
            it("THEN, deffered mode is enabled", () => {
                expect(vm.isDeferredLoadingMode).toBeTruthy();
            });
            it("THEN, list data is not loaded", () => {
                expect(vm.isIdsLoaded).toBeFalsy();
            });
        });
    });

    describe("Feature: checkedIds", () => {
        describe("WHEN ids are not loaded", () => {
            
            describe("AND checked ids are specified", () => {
                
                it("THEN, an error is thrown", () => {
                    expect(() => {
                        vm.checkedIds = ["testDetailsId"];
                    }).toThrowError("Cannot call checkedIds before to load ids");
                });
            });
        });

        describe("WHEN ids are loaded", () => {
            let testEntityId: string;
            let testEntity: ap.models.Entity;
            beforeEach(() => {
                testEntityId = "testDetailsId";
                testEntity = createEntity(testEntityId);

                let loadIdsApiMock = new ApiResponseMock("getEntityIds", Api, $q, $rootScope);
                vm.loadIds();
                loadIdsApiMock.reply([testEntityId]);
            });
            describe("AND checked ids are not specified", () => {
                beforeEach(() => {
                    let getEntityListApiMock = new ApiResponseMock("getEntityList", Api, $q, $rootScope);
                    vm.checkedIds = [];
                    getEntityListApiMock.reply([]);
                });
                it("THEN checkIds is empty", () => {
                    expect(vm.checkedIds.length).toEqual(0);
                });
                it("THEN checkedValuesText is empty", () => {
                    expect(vm.checkedValuesText).toEqual("");
                });
            });
            describe("AND checked ids are specified", () => {
                beforeEach(() => {
                    let getEntityListApiMock = new ApiResponseMock("getEntityList", Api, $q, $rootScope);
                    vm.checkedIds = [testEntityId];
                    getEntityListApiMock.reply([testEntity]);
                });
                it("THEN, checked entities are loaded", () => {
                    expect(Api.getEntityList).toHaveBeenCalled();
                });
                it("THEN, checkedIds property is set", () => {
                    expect(vm.checkedIds.length).toEqual(1);
                    expect(vm.checkedIds[0]).toEqual(testEntityId);
                });
                it("THEN, checkedValuesText is set", () => {
                    expect(vm.checkedValuesText).toEqual(testEntityId);
                });
            });
        });

        describe("WHEN ids are loaded", () => {
            let entityIds: string[];
            let entity: ap.models.Entity;
            let secondEntity: ap.models.Entity;
            let defEntity: angular.IDeferred<any>;

            beforeEach(() => {
                entityIds = ["testDetailsId", "testDetailsId1"];
                entity = createEntity(entityIds[0]);
                secondEntity = createEntity(entityIds[1]);

                defEntity = $q.defer();

                let loadIdsApiMock = new ApiResponseMock("getEntityIds", Api, $q, $rootScope);
                vm.loadIds();
                loadIdsApiMock.reply(entityIds);
            });

            describe("AND checked ids is specicied", () => {
                beforeEach(() => {
                    spyOn(Api, "getEntityList").and.callFake(() => {
                        return defEntity.promise;
                    });
                    vm.checkedIds = [entityIds[0]];
                    defEntity.resolve(new ap.services.apiHelper.ApiResponse([entity]));
                    $rootScope.$apply();

                    defEntity = $q.defer();
                    vm.checkedIds = entityIds;

                    defEntity.resolve(new ap.services.apiHelper.ApiResponse([secondEntity]));
                    $rootScope.$apply();
                });
                it("THEN, Api.getEntitylist is called with only the not loaded entities ids", () => {
                    let options = new ap.services.apiHelper.ApiOption();
                    options.onlyPathToLoadData = vm.options.onlyPathToLoadData;
                    expect((<jasmine.Spy>Api.getEntityList).calls.count()).toBe(2);
                    expect((<jasmine.Spy>Api.getEntityList).calls.argsFor(1)[4]).toEqual(["testDetailsId1"]);
                });
                it("THEN, checkValues is with the values of the 2 entities", () => {
                    expect(vm.checkedValuesText).toEqual("testDetailsId, testDetailsId1");
                });
            });
        });
    });

    describe("Feature: pageLoaded", () => {

        let defEntities: angular.IDeferred<any>;
        let defIds: angular.IDeferred<any>;

        beforeEach(() => {
            defEntities = $q.defer();
            defIds = $q.defer();
            spyOn(Api, "getEntityIds").and.returnValue(defIds.promise);
            spyOn(Api, "getEntityList").and.callFake(() => {
                return defEntities.promise;
            });

            // load  the first page (page size = 2)
            vm.loadNextPage();

            defIds.resolve(new ap.services.apiHelper.ApiResponse(["1", "2", "3"]));
            defEntities.resolve(new ap.services.apiHelper.ApiResponse([createEntity("1"), createEntity("2")]));
            $rootScope.$apply();

            defEntities = $q.defer();
            vm.checkedIds = ["1", "2", "3"];
            // resolve for the geEntityList of the third element
            defEntities.resolve(new ap.services.apiHelper.ApiResponse([createEntity("3")]));
            $rootScope.$apply();

            // load the last element
            defEntities = $q.defer();
            vm.loadNextPage();
            defEntities.resolve(new ap.services.apiHelper.ApiResponse([createEntity("3")]));
            $rootScope.$apply();
        });

        describe("WHEN a page is loaded", () => {
            it("THEN, check the item which ids are in the checkedIds array", () => {
                expect(vm.sourceItems[0].isChecked).toBeTruthy();
                expect(vm.sourceItems[1].isChecked).toBeTruthy();
                expect(vm.sourceItems[2].isChecked).toBeTruthy();
            });
        });
    });

    describe("Feature: buildCheckedValuesText", () => {
        let testEntityId1: string;
        let testEntityId2: string;
        let testEntity1: ap.models.Entity;
        let testEntity2: ap.models.Entity;

        beforeEach(() => {
            testEntityId1 = "testEntity1";
            testEntityId2 = "testEntity2";
            testEntity1 = createEntity(testEntityId1);
            testEntity2 = createEntity(testEntityId2);

            let loadIdsApiMock = new ApiResponseMock("getEntityIds", Api, $q, $rootScope);
            vm.loadIds();
            loadIdsApiMock.reply([testEntityId1, testEntityId2]);
        });

        describe("WHEN no entities are checked", () => {
            beforeEach(() => {
                let getEntityListApiMock = new ApiResponseMock("getEntityList", Api, $q, $rootScope);
                vm.checkedIds = [];
                getEntityListApiMock.reply([]);
            });
            it("THEN, checkedValuesText is an empty string", () => {
                expect(vm.checkedValuesText).toEqual("");
            });
        });

        describe("WHEN one entity is checked", () => {
            beforeEach(() => {
                let getEntityListApiMock = new ApiResponseMock("getEntityList", Api, $q, $rootScope);
                vm.checkedIds = [testEntityId1];
                getEntityListApiMock.reply([testEntity1]);
            });
            it("THEN, checkedValuesText contains a selected id", () => {
                expect(vm.checkedValuesText).toEqual(testEntityId1);
            });
        });

        describe("WHEN multiple entities are checked", () => {
            beforeEach(() => {
                let getEntityListApiMock = new ApiResponseMock("getEntityList", Api, $q, $rootScope);
                vm.checkedIds = [testEntityId1, testEntityId2];
                getEntityListApiMock.reply([testEntity1, testEntity2]);
            });
            it("THEN, checkedValuesText contains all checked ids separated by comma", () => {
                let expectedText = testEntityId1 + ", " + testEntityId2;
                expect(vm.checkedValuesText).toEqual(expectedText);
            });
        });
    });

    describe("Feature: getEntityText", () => {
        let result: string;
        describe("WHEN entity is not passed", () => {
            beforeEach(() => {
                result = vm.getEntityText(null);
            });
            it("THEN an empty string is returned", () => {
                expect(result).toEqual("");
            });
        });
        describe("WHEN entity is passed", () => {
            let entity: ap.models.Entity;
            beforeEach(() => {
                entity = createEntity("testDetailsId");
                result = vm.getEntityText(entity);
            });
            it("THEN the id field is used to get text", () => {
                expect(result).toEqual(entity.Id.toString());
            });
        });
    });

    describe("Feature: getItemText", () => {
        let result: string;
        
        describe("WHEN entity is not passed", () => {
            beforeEach(() => {
                result = vm.getItemText(null);
            });
            it("THEN an empty string is returned", () => {
                expect(result).toEqual("");
            });
        });
        describe("WHEN entity is passed", () => {
            let entity: ap.viewmodels.IEntityViewModel;
            beforeEach(() => {
                entity = new ap.viewmodels.EntityViewModel(Utility)
                entity.init(createEntity("testDetailsId"));
                result = vm.getItemText(entity);
            });
            it("THEN the id field is used to get text", () => {
                expect(result).toEqual(entity.originalEntity.Id.toString());
            });
        });
    });

    describe("Feature: itemIsCheckedChanged", () => {
        let testEntityId: string;
        let testEntity: ap.models.Entity;
        let itemModel: ap.viewmodels.EntityViewModel;

        beforeEach(() => {
            testEntityId = "testEntity";
            testEntity = createEntity(testEntityId);
            itemModel = new ap.viewmodels.EntityViewModel(Utility, vm);
            itemModel.init(testEntity);

            let loadIdsApiMock = new ApiResponseMock("getEntityIds", Api, $q, $rootScope);
            vm.loadIds();
            loadIdsApiMock.reply([testEntityId]);
        });

        describe("WHEN a given item becomes checked", () => {
            beforeEach(() => {
                itemModel.isChecked = true;
                vm.itemIsCheckedChanged(itemModel);
            });
            it("THEN it is added to checked ids", () => {
                expect(vm.checkedIds.length).toEqual(1);
                expect(vm.checkedIds[0]).toEqual(testEntityId);
            });
            it("THEN it is added to checkedValuesText", () => {
                expect(vm.checkedValuesText).toEqual(testEntityId);
            });
        });

        describe("WHEN a given item becomes not checked", () => {
            beforeEach(() => {
                let getEntityListApiMock = new ApiResponseMock("getEntityList", Api, $q, $rootScope);
                vm.checkedIds = [testEntityId];
                getEntityListApiMock.reply([testEntity]);

                itemModel.isChecked = false;
                vm.itemIsCheckedChanged(itemModel);
            });
            it("THEN it is removed from the checked ids", () => {
                expect(vm.checkedIds.length).toEqual(0);
            });
            it("THEN it is removed from the checkedValuesText", () => {
                expect(vm.checkedValuesText).toEqual("");
            });
        });
    });

    describe("Feature: load", () => {
        let testEntityIds: string[];
        let testEntitiesArray: ap.models.Entity[];
        let deferredIds, deferredEntities;
        beforeEach(() => {
            testEntityIds = ["test-entity-id-1", "test-entity-id-2"];
            testEntitiesArray = [createEntity(testEntityIds[0]), createEntity(testEntityIds[1])];
            deferredIds = $q.defer();
            deferredEntities = $q.defer();
            spyOn(Api, "getEntityIds").and.returnValue(deferredIds.promise);
            spyOn(Api, "getEntityList").and.returnValue(deferredEntities.promise);
        });
        describe("WHEN load method is called", () => {
            
            beforeEach(() => {
                spyOn(vm, "loadNextPage").and.callThrough();
            });
            it("THEN, data ids added to the list", () => {
                vm.load();
                expect(vm.isLoading).toBeTruthy();
                deferredIds.resolve(new ap.services.apiHelper.ApiResponse(testEntityIds));
                $rootScope.$apply();
                expect(vm.isIdsLoaded).toBeTruthy();
                expect(Api.getEntityIds).toHaveBeenCalled();                
            });
            it("and first list page loaded", () => {
                let loadCallback = jasmine.createSpy("callback");
                vm.load().then((success: boolean) => {
                    loadCallback(success);
                });
                deferredIds.resolve(new ap.services.apiHelper.ApiResponse(testEntityIds));
                $rootScope.$apply();
                expect(vm.loadNextPage).toHaveBeenCalled();
                deferredEntities.resolve(new ap.services.apiHelper.ApiResponse(testEntitiesArray));
                $rootScope.$apply();
                expect(Api.getEntityList).toHaveBeenCalled();
                expect(vm.sourceItems.length).toEqual(2);
                expect(vm.sourceItems[0].originalEntity.Id).toEqual("test-entity-id-1");
                expect(vm.sourceItems[1].originalEntity.Id).toEqual("test-entity-id-2");
                expect(loadCallback).toHaveBeenCalledWith(true);
            });
        });
    });
});