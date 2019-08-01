describe("Module ap-viewmodels - SubCellListViewModel", () => {
    let Utility: ap.utility.UtilityHelper;
    let Api: ap.services.apiHelper.Api;
    let vm: ap.viewmodels.projects.SubCellListViewModel;
    let ControllersManager: ap.controllers.ControllersManager;
    let $q: angular.IQService;
    let $rootScope: angular.IRootScopeService;
    let ServicesManager: ap.services.ServicesManager;
    let parentCellVm: ap.viewmodels.projects.ParentCellViewModel;
    class SubCellListVm extends ap.viewmodels.projects.SubCellListViewModel {

        checkForDuplicatedItems(itemVm: ap.viewmodels.IEntityViewModel) { }
        
        constructor(utility: ap.utility.UtilityHelper, protected $q: angular.IQService, _controllersManager: ap.controllers.ControllersManager, _serviceManager: ap.services.ServicesManager) {
            super(utility, $q, _controllersManager, _serviceManager);
        }
    }

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject(function (_Utility_, _$q_, _$rootScope_, _Api_, _ControllersManager_, _ServicesManager_) {
        Utility = _Utility_;
        Api = _Api_;
        $q = _$q_;
        $rootScope = _$rootScope_;
        ControllersManager = _ControllersManager_;
        ServicesManager = _ServicesManager_;
        parentCellVm = new ap.viewmodels.projects.ParentCellViewModel(Utility);
    }));

    describe("Feature: constructor", () => {
        describe("WHEN i request to create the SubCellListViewModel", () => {
            beforeEach(() => {
                vm = new ap.viewmodels.projects.SubCellListViewModel(Utility, $q, ControllersManager, ServicesManager);
            });
            it("THEN, the vm will created with default values", () => {
                expect(vm).toBeDefined();
                expect(vm.options.pageSize).toBe(50);
                expect(vm.options.displayLoading).toBeFalsy();
                expect(vm.options.isGetIdsCustom).toBeFalsy();
                expect(vm.entityName).toBe("SubCell");
                expect(vm.sortOrder).toBe("DisplayOrder");
                expect(vm.pathToLoad).toBe("ParentCell");
                expect(vm.isDeferredLoadingMode).toBeTruthy();
            });
            it("THEN, the vm will created check actions)", () => {
                expect(vm.actions.length).toBe(1);
                expect(vm.actions[0].name).toEqual("subcells.add");
            });

            it("THEN the addAction is disabled and hidden by default", () => {
                expect(vm.actions[0].isEnabled).toBeFalsy();
                expect(vm.actions[0].isVisible).toBeFalsy();
            });
        });
    });
    describe("Feature: specifyIds", () => {
        let ids: string[];
        let parentCell1: ap.models.projects.ParentCell;
        let subCell1: ap.models.projects.SubCell;
        let subCell2: ap.models.projects.SubCell;
        let subCell3: ap.models.projects.SubCell;
        let deferredLoad: any;
        let subCellVm1: ap.viewmodels.projects.SubCellViewModel;
        let subCellVm2: ap.viewmodels.projects.SubCellViewModel;
        let subCellVm3: ap.viewmodels.projects.SubCellViewModel;
        let idValues: IDictionary<string, KeyValue<string, string>[]>;
        beforeEach(() => {
            ids = ["1", "2", "3"];
            vm = new ap.viewmodels.projects.SubCellListViewModel(Utility, $q, ControllersManager, ServicesManager);
            let parentVm = new ap.viewmodels.projects.ParentCellViewModel(Utility);
            parentVm.init(new ap.models.projects.ParentCell(Utility));
            vm.parentCellVm = parentVm;
            deferredLoad = $q.defer();
            spyOn(ServicesManager.projectService, "getProjectCells").and.returnValue(deferredLoad.promise);
            parentCell1 = new ap.models.projects.ParentCell(Utility);
            subCellVm1 = new ap.viewmodels.projects.SubCellViewModel(Utility);
            subCell1 = new ap.models.projects.SubCell(Utility);
            subCell1.createByJson({ Id: "1", Code: "Code1" });
            subCellVm1.init(subCell1);
            subCellVm2 = new ap.viewmodels.projects.SubCellViewModel(Utility);
            subCell2 = new ap.models.projects.SubCell(Utility);
            subCell2.createByJson({ Id: "2", Code: "Code2" });
            subCellVm2.init(subCell2);
            subCellVm3 = new ap.viewmodels.projects.SubCellViewModel(Utility);
            subCell3 = new ap.models.projects.SubCell(Utility);
            subCell3.createByJson({ Id: "3", Code: "Code3" });
            subCellVm3.init(subCell3);

            idValues = new Dictionary<string, KeyValue<string, string>[]>();
            idValues.add("1", [new KeyValue("Code", "CODE1")]);
            idValues.add("2", [new KeyValue("Code", "CODE2")]);
            idValues.add("3", [new KeyValue("Code", "CODE3")]);

            specHelper.general.spyProperty(ap.models.projects.ParentCell.prototype, "SubCells", specHelper.PropertyAccessor.Get).and.returnValue([subCell1, subCell2, subCell3]);

            vm.specifyIds(ids);

            deferredLoad.resolve([subCell1, subCell2, subCell3]);
            $rootScope.$apply();
        });
        afterEach(() => {
            specHelper.general.offSpyProperty(ap.models.projects.ParentCell.prototype, "SubCells", specHelper.PropertyAccessor.Get);
        });
        describe("WHEN specifyIds is called with the list of ids", () => {
            it("THEN, the list vm will be set with the given ids", () => {
                expect(vm.count).toEqual(3);
            });
            it("AND sourceitems will be updated", () => {
                expect(vm.sourceItems.length).toEqual(3);
            });
            it("Then, idValuesDictionary is updated", () => {
                expect(vm.idValuesDictionary).toEqual(idValues);
            });
            it("THEN the addAction becomes enabled and visible", () => {
                expect(vm.actions[0].isEnabled).toBeTruthy();
                expect(vm.actions[0].isVisible).toBeTruthy();
            });
            it("THEN getProjectCell is called", () => {
                expect(ServicesManager.projectService.getProjectCells).toHaveBeenCalledWith(ids, "Id,Code", true, false, true);
            });
        });
        describe("WHEN specifyIds is called ids and loadNextPage is called after", () => {
            beforeEach(() => {
                spyOn(vm, "loadIds").and.callThrough();
                spyOn(Api, "getEntityList").and.callFake(() => {
                    let defer = $q.defer();
                    return defer.promise;
                });
                vm.loadNextPage();
            });
            it("THEN, the load of ids is not called", () => {
                expect(vm.loadIds).not.toHaveBeenCalled();
            });
            it("BUT The api is called to load the list regarding the ids", () => {
                expect(Api.getEntityList).toHaveBeenCalled();
            });
            it("Then, idValuesDictionary is updated", () => {
                expect(vm.idValuesDictionary).toEqual(idValues);
            });
        });
    });

    describe("Item actions", () => {
        let _deferred: any;
        let deferredLoad: any;
        let subCellList: SubCellListVm;
        let subCells: ap.models.projects.SubCell[] = [];
        let subCell: ap.models.projects.SubCell;
        let ids: string[];
        let subCellVM: ap.viewmodels.projects.SubCellViewModel;
        beforeEach(() => {
            deferredLoad = $q.defer();
            spyOn(ServicesManager.projectService, "getProjectCells").and.returnValue(deferredLoad.promise);
            subCell = new ap.models.projects.SubCell(Utility);
            subCell.createByJson({ Id: "0", Code: "CH", Description: "chapter", DisplayOrder: 0 });
            subCells.push(subCell);

            _deferred = $q.defer();
            spyOn(Api, "getEntityList").and.returnValue(_deferred.promise);

            subCellList = new SubCellListVm(Utility, $q, ControllersManager, ServicesManager);

            let parentVm = new ap.viewmodels.projects.ParentCellViewModel(Utility);
            parentVm.init(new ap.models.projects.ParentCell(Utility));
            subCellList.parentCellVm = parentVm;

            spyOn(subCellList, "clear");
            spyOn(subCellList, "checkForDuplicatedItems");

            ids = [subCell.Id];
            subCellList.specifyIds(ids);
            subCellList.loadNextPage();
            _deferred.resolve(new ap.services.apiHelper.ApiResponse(subCells));
            $rootScope.$apply();

            specHelper.general.raiseEvent(subCellList.getItemAtIndex(0), "insertrowrequested", subCellList.getItemAtIndex(0));
        });
        describe("WHEN, Item action raise insertrowrequested", () => {
            it("THEN, there is 2 items (add one)", () => {
                expect(subCellList.count).toEqual(2);
                subCellVM = <ap.viewmodels.projects.SubCellViewModel>subCellList.getItemAtIndex(1);
                expect(subCellVM.subCell.IsNew).toBeTruthy();
            });
        });
    });
    describe("afterLoadPageSuccessHandler", () => {
        let _deferred: any;
        let deferredLoad: any;
        let subCellList: SubCellListVm;
        let subCells: ap.models.projects.SubCell[] = [];
        let subCell: ap.models.projects.SubCell;
        let ids: string[];
        let subCellVM: ap.viewmodels.projects.SubCellViewModel;
        beforeEach(() => {
            deferredLoad = $q.defer();
            spyOn(ServicesManager.projectService, "getProjectCells").and.returnValue(deferredLoad.promise);

            subCell = new ap.models.projects.SubCell(Utility);
            subCell.createByJson({ Id: "0", Code: "CH", Description: "chapter", DisplayOrder: 0 });
            subCells.push(subCell);

            _deferred = $q.defer();
            spyOn(Api, "getEntityList").and.returnValue(_deferred.promise);

            subCellList = new SubCellListVm(Utility, $q, ControllersManager, ServicesManager);
            spyOn(subCellList, "clear");
            spyOn(subCellList, "checkForDuplicatedItems");
            ids = [subCell.Id];
            subCellList.specifyIds(ids);
            deferredLoad.resolve(subCells);
            $rootScope.$apply();

            subCellList.loadNextPage();
            _deferred.resolve(new ap.services.apiHelper.ApiResponse(subCells));
            $rootScope.$apply();
        });
        describe("WHEN, afterLoadPageSuccessHandler is called", () => {
            it("THEN, checkForDuplicatedItems is called", () => {
                expect(subCellList.checkForDuplicatedItems).toHaveBeenCalled();
            });
        });
    });

    describe("Feature: actionClickedHandler", () => {
        beforeEach(() => {
            vm = new ap.viewmodels.projects.SubCellListViewModel(Utility, $q, ControllersManager, ServicesManager);
            let parentVm = new ap.viewmodels.projects.ParentCellViewModel(Utility);
            parentVm.init(new ap.models.projects.ParentCell(Utility));
            vm.parentCellVm = parentVm;

            let idDic: IDictionary<string, string[]> = new Dictionary<string, string[]>();
            vm.valuesIdsDictionary.push(idDic);
        });
        describe("WHEN call actionClicedHandler with action name", () => {
            beforeEach(() => {
                spyOn(vm, "insertItem");
                vm.actionClickedHandler(vm.actions[0].name);
            });
            it("THEN checked insertItem must be called", () => {
                expect(vm.insertItem).toHaveBeenCalled();
            });
        });
    });
    describe("Feature: disableActions", () => {
        beforeEach(() => {
            vm = new ap.viewmodels.projects.SubCellListViewModel(Utility, $q, ControllersManager, ServicesManager);
        });
        describe("WHEN call disableActions ", () => {
            beforeEach(() => {
                vm.disableActions();
            });
            it("THEN action is disabled", () => {
                expect(vm.actions[0].isEnabled).toBeFalsy();
            });
        });
    });
    describe("Feature: enableActions", () => {
        beforeEach(() => {
            vm = new ap.viewmodels.projects.SubCellListViewModel(Utility, $q, ControllersManager, ServicesManager);
        });
        describe("WHEN call disableActions after disableActions called", () => {
            beforeEach(() => {
                vm.disableActions();
                vm.enableActions();
            });
            it("THEN action is enabled", () => {
                expect(vm.actions[0].isEnabled).toBeTruthy();
            });
        });
    });
    describe("Feature: postChange", () => {
        let subCellList: ap.viewmodels.projects.SubCellListViewModel;
        let viewModelsToDelete: ap.viewmodels.projects.SubCellViewModel;
        let viewModelsToUpdate: ap.viewmodels.projects.SubCellViewModel;
        let subCell1: ap.models.projects.SubCell;
        let subCell2: ap.models.projects.SubCell;
        let projectRoomModification: ap.models.custom.ProjectRoomModification;
        let project: ap.models.projects.Project;
        beforeEach(() => {
            project = new ap.models.projects.Project(Utility);
            spyOn(ControllersManager.mainController, "currentProject").and.returnValue(project);
            subCell1 = new ap.models.projects.SubCell(Utility);
            subCell1.createByJson({ Id: "12345" });
            subCell2 = new ap.models.projects.SubCell(Utility);
            subCell2.createByJson({ Id: "56789" });
            subCellList = new ap.viewmodels.projects.SubCellListViewModel(Utility, $q, ControllersManager, ServicesManager);
            projectRoomModification = new ap.models.custom.ProjectRoomModification(Utility, project.Id);
            viewModelsToDelete = new ap.viewmodels.projects.SubCellViewModel(Utility);
            viewModelsToDelete.init(subCell1);
            viewModelsToDelete.parentCellViewModel = parentCellVm;
            viewModelsToDelete.actionClicked("subcell.delete");
            viewModelsToUpdate = new ap.viewmodels.projects.SubCellViewModel(Utility);
            viewModelsToUpdate.init(subCell2);
            viewModelsToUpdate.parentCellViewModel = parentCellVm;
            viewModelsToUpdate.code = "aaa";
            spyOn(viewModelsToUpdate, "postChanges");
        });
        describe("WHEN postChange is called with entity to delete and update", () => {
            describe("WHEN entities to delete are not new", () => {
                beforeEach(() => {
                    projectRoomModification.SubCellsToDelete.push(viewModelsToDelete.originalEntity.Id);
                    projectRoomModification.SubCellsToUpdate.push(<ap.models.projects.SubCell>viewModelsToUpdate.originalEntity);
                    spyOn(subCellList, "getChangedItems").and.returnValue([viewModelsToDelete, viewModelsToUpdate]);
                });
                it("THEN ProjectPunchlists.SubCellsToDelete is not empty", () => {
                    expect(subCellList.postChange()).toEqual(projectRoomModification);
                });
                it("THEN ProjectPunchList.SubCellsToUpdate is not empty", () => {
                    expect(subCellList.postChange()).toEqual(projectRoomModification);
                });
            });
            describe("WHEN entities to delete are new", () => {
                beforeEach(() => {
                    subCell1 = new ap.models.projects.SubCell(Utility);
                    viewModelsToDelete = new ap.viewmodels.projects.SubCellViewModel(Utility);
                    viewModelsToDelete.init(subCell1);
                    viewModelsToDelete.code = "code";
                    viewModelsToDelete.parentCellViewModel = parentCellVm;
                    viewModelsToDelete.actionClicked("subcell.delete");
                    subCellList.sourceItems = [viewModelsToDelete];
                    projectRoomModification.SubCellsToDelete.push(viewModelsToDelete.originalEntity.Id);
                    spyOn(subCellList, "getChangedItems").and.returnValue([viewModelsToDelete]);
                    subCellList.valuesIdsDictionary[0].add("CODE", [subCell1.Id]);
                    subCellList.idValuesDictionary.add(subCell1.Id, null);
                    subCellList.postChange();
                });
                it("THEN subCell is removed from source items", () => {
                    expect(subCellList.sourceItems.indexOf(viewModelsToDelete)).toEqual(-1);
                });
                it("THEN subCell.Id is removed from idValuesDictionary", () => {
                    expect(subCellList.idValuesDictionary.containsKey(subCell1.Id)).toBeFalsy();
                });
                it("THEN subCell.Id is removed from valuesIdsDictionary", () => {
                    expect(subCellList.valuesIdsDictionary[0].containsKey(viewModelsToDelete.code)).toBeFalsy();
                });
            });
        });
        describe("WHEN postChange is called with no entity to delete and update", () => {
            beforeEach(() => {
                spyOn(subCellList, "getChangedItems").and.returnValue([]);
            });
            it("THEN ProjectPunchList.SubCellsToDelete is empty", () => {
                expect(subCellList.postChange()).toEqual(projectRoomModification);
            });
            it("THEN ProjectPunchList.SubCellsToUpdate is empty", () => {
                expect(subCellList.postChange()).toEqual(projectRoomModification);
            });
        });
    });

    describe("Feature: subCellInsertRequested", () => {
        let _deferred: angular.IDeferred<any>;
        let subCellList: SubCellListVm;
        let subCells: ap.models.projects.SubCell[];
        let subCell: ap.models.projects.SubCell;
        let subCell2: ap.models.projects.SubCell;
        let ids: string[];
        let subCellVM: ap.viewmodels.projects.SubCellViewModel;
        let deferredLoadSubCells: angular.IDeferred<any>;
        let subCellCode;
        let parentVm: ap.viewmodels.projects.ParentCellViewModel;
        let callback: jasmine.Spy;
        beforeEach(() => {
            subCells = [];
            deferredLoadSubCells = $q.defer();
            spyOn(ServicesManager.projectService, "getProjectCells").and.returnValue(deferredLoadSubCells.promise);

            subCell = new ap.models.projects.SubCell(Utility);
            subCell.createByJson({ Id: "0", Code: "CH", Description: "subCell", DisplayOrder: 0 });
            subCell2 = new ap.models.projects.SubCell(Utility);
            subCell2.createByJson({ Id: "1", Code: "CH1", Description: "subCell1", DisplayOrder: 1 })
            subCellCode = [{ Id: "1", Code: "CH", SubCells: [subCell] }];

            _deferred = $q.defer();
            spyOn(Api, "getEntityList").and.callFake(() => {
                return _deferred.promise
            });

            subCellList = new SubCellListVm(Utility, $q, ControllersManager, ServicesManager);
            callback = jasmine.createSpy("callback");
            subCellList.on("propertychanged", callback, this);
            parentVm = new ap.viewmodels.projects.ParentCellViewModel(Utility);
            parentVm.init(new ap.models.projects.ParentCell(Utility));
            subCellList.parentCellVm = parentVm;

            spyOn(subCellList, "clear");
            spyOn(subCellList, "checkForDuplicatedItems");

        });
        describe("WHEN call subCellInsertRequested and list of subCell is empty", () => {
            beforeEach(() => {
                ids = [];
                subCellList.specifyIds(ids);
                deferredLoadSubCells.resolve([]);
                subCellList.loadNextPage();
                _deferred.resolve(new ap.services.apiHelper.ApiResponse([]));
                $rootScope.$apply();
                let idDic: IDictionary<string, string[]> = new Dictionary<string, string[]>();
                subCellList.valuesIdsDictionary.push(idDic);
                subCellList.actionClickedHandler("subcells.add");
                subCellVM = <ap.viewmodels.projects.SubCellViewModel>subCellList.getItemAtIndex(0);
            });
            afterEach(() => {
                subCells = [];
                ids = [];
            });
            it("THEN add new SubCell with displayOrder = 1", () => {
                expect(subCellVM.originalEntity.IsNew).toBeTruthy();
                expect(subCellVM.displayOrder).toBe(1);
            })

            it("THEN the new SubCell has a parentCell defined", () => {
                expect(subCellVM.subCell.ParentCell.Id).toBe(parentVm.originalEntity.Id);
            });
            it("THEN, the projectId of the parentCell is set to the Id of the currentProject", () => {
                expect(subCellList.idValuesDictionary.containsKey(subCellVM.originalEntity.Id)).toBeTruthy();
            });
            it("THEN, _invalidItems.length = 1 and _isValid = false", () => {
                expect(subCellList.isValid).toBeFalsy();
                expect(callback).toHaveBeenCalled();
                expect(subCellList.isDuplicated).toBeFalsy();
            });
        });
        describe("WHEN call subCellInsertRequested and list of subCell has 51 entity", () => {
            beforeEach(() => {
                subCells.push(subCell);
                subCells.push(subCell2);
                ids = [subCell.Id, subCell2.Id];
                subCellCode[0].SubCells.push(subCell2);
                let subCellsSecondPage: ap.models.projects.SubCell[] = [];
                for (let id = 2; id <= 51; id++) {
                    let subCellLoop = new ap.models.projects.SubCell(Utility);
                    subCellLoop.createByJson({ Id: id.toString(), Code: "CH" + id, Description: "subCell" + id, DisplayOrder: id });
                    if (id <= 49)
                        subCells.push(subCellLoop);
                    else
                        subCellsSecondPage.push(subCellLoop);
                    ids.push(subCellLoop.Id);
                    subCellCode[0].SubCells.push(subCellLoop);
                }

                subCellList.specifyIds(ids);
                deferredLoadSubCells.resolve(subCellCode);
                subCellList.loadNextPage();
                _deferred.resolve(new ap.services.apiHelper.ApiResponse(subCells));
                $rootScope.$apply();

                _deferred = $q.defer();
                _deferred.resolve(new ap.services.apiHelper.ApiResponse(subCellsSecondPage));
                let idDic: IDictionary<string, string[]> = new Dictionary<string, string[]>();
                subCellList.valuesIdsDictionary.push(idDic);
                subCellList.actionClickedHandler("subcells.add");
                $rootScope.$apply();
            });
            afterEach(() => {
                subCells = [];
                ids = [];
            });
            it("THEN add new SubCell with displayOrder = this.sourceItems.length + 10000", () => {
                expect(Api.getEntityList).toHaveBeenCalled();
                expect((<ap.viewmodels.projects.SubCellViewModel>subCellList.sourceItems[52]).originalEntity.IsNew).toBeTruthy();
                expect((<ap.viewmodels.projects.SubCellViewModel>subCellList.sourceItems[52]).displayOrder).toBe(10052);
            })
            it("THEN, the projectId of the parentCell is set to the Id of the currentProject", () => {
                expect(subCellList.idValuesDictionary.containsKey((<ap.viewmodels.projects.SubCellViewModel>subCellList.sourceItems[52]).originalEntity.Id)).toBeTruthy();
            });
            it("THEN, isValid = false", () => {
                expect(subCellList.isValid).toBeFalsy();
            });
        });
        describe("WHEN call subCellInsertRequested and list of subCell has 1 entity", () => {
            beforeEach(() => {
                subCells = [];
                subCells.push(subCell);
                subCellCode = [{ Id: "1", Code: "CH", SubCells: [subCell] }];
                ids = [subCell.Id];
                subCellList.specifyIds(ids);
                deferredLoadSubCells.resolve(subCellCode);
                subCellList.loadNextPage();

                _deferred.resolve(new ap.services.apiHelper.ApiResponse(subCells));
                $rootScope.$apply();
                subCellList.actionClickedHandler("subcells.add");
                subCellVM = <ap.viewmodels.projects.SubCellViewModel>subCellList.getItemAtIndex(1);
            });
            it("THEN add new SubCell with displayOrder = 10000", () => {
                expect(subCellVM.originalEntity.IsNew).toBeTruthy();
                expect(subCellVM.displayOrder).toBe(10000);
            })
            it("THEN, the projectId of the parentCell is set to the Id of the currentProject", () => {
                expect(subCellList.idValuesDictionary.containsKey(subCellVM.originalEntity.Id)).toBeTruthy();
            });
            it("THEN, isValid = false", () => {
                expect(subCellList.isValid).toBeFalsy();
            });
        });
    });

    describe("Feature: insertImportedItem", () => {
        let listVm: SubCellListVm;
        let importedItem: ap.viewmodels.projects.SubCellViewModel;
        let changedCallback: jasmine.Spy;

        beforeEach(() => {
            listVm = new SubCellListVm(Utility, $q, ControllersManager, ServicesManager);
            listVm.useCacheSystem = true;

            let importedEntity = new ap.models.projects.SubCell(Utility);
            importedEntity.createByJson({
                Id: "test-id",
                Code: "test-code",
                Description: "test-description"
            });

            importedItem = new ap.viewmodels.projects.SubCellViewModel(Utility);
            importedItem.init(importedEntity);

            changedCallback = jasmine.createSpy("hasChangedCallback");
            listVm.on("hasChanged", <(args?: any) => void>changedCallback, null);

            spyOn(listVm, "addIntoCache").and.callThrough();
            spyOn(listVm, "checkForDuplicatedItems").and.callThrough();
        });

        describe("WHEN an imported item is given", () => {
            beforeEach(() => {
                listVm.insertImportedItem(importedItem);
            });

            it("THEN it is added to the cache", () => {
                expect(listVm.addIntoCache).toHaveBeenCalledWith(importedItem);
            });
        });

        describe("WHEN a code of the imported item is changed", () => {
            beforeEach(() => {
                listVm.insertImportedItem(importedItem);
                importedItem.code = "new-code";
            });

            it("THEN the hasChanged event is fired", () => {
                expect(changedCallback).toHaveBeenCalled();
            });
        });

        describe("WHEN a description of the imported item is changed", () => {
            beforeEach(() => {
                listVm.insertImportedItem(importedItem);
                importedItem.description = "new-description";
            });

            it("THEN the hasChanged event is fired", () => {
                expect(changedCallback).toHaveBeenCalled();
            });
        });
    });

    describe("Feature setHasCHanged", () => {
        let _deferred: any;
        let subCellList: SubCellListVm;
        let subCells: ap.models.projects.SubCell[] = [];
        let subCell: ap.models.projects.SubCell;
        let ids: string[];
        let subCellVM: ap.viewmodels.projects.SubCellViewModel;
        let callbackPropretyChanged;
        let args: ap.viewmodels.base.PropertyChangedEventArgs;
        beforeEach(() => {
            subCell = new ap.models.projects.SubCell(Utility);
            subCells.push(subCell);

            _deferred = $q.defer();
            spyOn(Api, "getEntityList").and.returnValue(_deferred.promise);

            subCellList = new SubCellListVm(Utility, $q, ControllersManager, ServicesManager);
            let getProjectCellsDef = $q.defer();
            spyOn(ServicesManager.projectService, "getProjectCells").and.returnValue(getProjectCellsDef.promise);
            spyOn(subCellList, "clear");
            spyOn(subCellList, "checkForDuplicatedItems");

            ids = [subCell.Id];
            subCellList.specifyIds(ids);
            subCellList.loadNextPage();
            _deferred.resolve(new ap.services.apiHelper.ApiResponse(subCells));
            $rootScope.$apply();

            callbackPropretyChanged = jasmine.createSpy("callback");
            subCellList.on("hasChanged", callbackPropretyChanged, this);

            specHelper.general.raiseEvent(subCellList.getItemAtIndex(0), "propertychanged", new ap.viewmodels.base.PropertyChangedEventArgs("description", "123", subCellList.getItemAtIndex(0)));
        });
        it("THEN, hasChanged event is raised", () => {
            expect(callbackPropretyChanged).toHaveBeenCalledWith(true);
        });
    });
    describe("Feature: isValid", () => {
        let _deferred: any;
        let subCellList: SubCellListVm;
        let subCells: ap.models.projects.SubCell[];
        let subCell: ap.models.projects.SubCell;
        let ids: string[];
        let subCellVM: ap.viewmodels.projects.SubCellViewModel;
        let args: ap.viewmodels.base.PropertyChangedEventArgs;
        beforeEach(() => {
            subCells = [];
            _deferred = $q.defer();
            spyOn(Api, "getEntityList").and.returnValue(_deferred.promise);
            subCellList = new SubCellListVm(Utility, $q, ControllersManager, ServicesManager);
            let getProjectCellsDef = $q.defer();
            spyOn(ServicesManager.projectService, "getProjectCells").and.returnValue(getProjectCellsDef.promise);
            spyOn(subCellList, "clear");
            spyOn(subCellList, "checkForDuplicatedItems");
        });
        describe("WHEN code item changed with isValid false", () => {
            beforeEach(() => {
                subCell = new ap.models.projects.SubCell(Utility);
                subCell.Code = null;
                subCells.push(subCell);
                ids = [subCell.Id];
                subCellList.specifyIds(ids);
                subCellList.loadNextPage();
                _deferred.resolve(new ap.services.apiHelper.ApiResponse(subCells));
                $rootScope.$apply();
                subCellVM = <ap.viewmodels.projects.SubCellViewModel>subCellList.getItemAtIndex(0);
                subCellVM.code = "   ";
                specHelper.general.raiseEvent(subCellVM, "propertychanged", new ap.viewmodels.base.PropertyChangedEventArgs("isValid", "123", subCellVM));
            });
            it("THEN isValid should be false", () => {
                expect(subCellList.isValid).toBeFalsy();
            });
        });
        describe("WHEN code item changed with isValid true", () => {
            beforeEach(() => {
                subCell = new ap.models.projects.SubCell(Utility);
                subCells.push(subCell);
                ids = [subCell.Id];
                subCellList.specifyIds(ids);
                subCellList.loadNextPage();
                _deferred.resolve(new ap.services.apiHelper.ApiResponse(subCells));
                $rootScope.$apply();
                subCellVM = <ap.viewmodels.projects.SubCellViewModel>subCellList.getItemAtIndex(0);
                subCellVM.code = "sssss";
                subCellVM.description = "fgdsdfs";

            });
            it("THEN isValid should be true", () => {
                expect(subCellList.isValid).toBeTruthy();
            });
        });
    });
    describe("Feature: setIsValid", () => {
        let _deferred: any;
        let subCellList: SubCellListVm;
        let subCells: ap.models.projects.SubCell[];
        let subCell: ap.models.projects.SubCell;
        let ids: string[];
        let subCellVM: ap.viewmodels.projects.SubCellViewModel;
        let args: ap.viewmodels.base.PropertyChangedEventArgs;
        beforeEach(() => {
            subCells = [];
            _deferred = $q.defer();
            spyOn(Api, "getEntityList").and.returnValue(_deferred.promise);
            subCellList = new SubCellListVm(Utility, $q, ControllersManager, ServicesManager);
            let getProjectCellsDef = $q.defer();
            spyOn(ServicesManager.projectService, "getProjectCells").and.returnValue(getProjectCellsDef.promise);
            spyOn(subCellList, "clear");
            spyOn(subCellList, "checkForDuplicatedItems");
        });
        describe("WHEN code item changed with isValid false", () => {
            let callback;
            beforeEach(() => {
                subCell = new ap.models.projects.SubCell(Utility);
                callback = jasmine.createSpy("callback");
                subCellList.on("propertychanged", () => { callback(); }, subCellList);

                subCell.Code = null;
                subCells.push(subCell);
                ids = [subCell.Id];
                subCellList.specifyIds(ids);
                subCellList.loadNextPage();
                _deferred.resolve(new ap.services.apiHelper.ApiResponse(subCells));
                $rootScope.$apply();
                subCellVM = <ap.viewmodels.projects.SubCellViewModel>subCellList.getItemAtIndex(0);
                subCellVM.code = "   ";
                specHelper.general.raiseEvent(subCellVM, "propertychanged", new ap.viewmodels.base.PropertyChangedEventArgs("isValid", "123", subCellVM));
            });
            it("THEN isValid should be false", () => {
                expect(subCellList.isValid).toBeFalsy();
            });
            it("THEN event propertychanged should be raised", () => {
                expect(callback).toHaveBeenCalled();
            });
        });

    });

    describe("Feature: updateItemsActionsState", () => {
        let _deferred: any;
        let subCellList: SubCellListVm;
        let subCells: ap.models.projects.SubCell[];
        let subCell: ap.models.projects.SubCell;
        let ids: string[];
        let subCellVM: ap.viewmodels.projects.SubCellViewModel;
        let args: ap.viewmodels.base.PropertyChangedEventArgs;
        beforeEach(() => {
            subCells = [];
            _deferred = $q.defer();
            spyOn(Api, "getEntityList").and.returnValue(_deferred.promise);
            subCellList = new SubCellListVm(Utility, $q, ControllersManager, ServicesManager);
            let getProjectCellsDef = $q.defer();
            spyOn(ServicesManager.projectService, "getProjectCells").and.returnValue(getProjectCellsDef.promise);
            spyOn(subCellList, "clear");
            spyOn(subCellList, "checkForDuplicatedItems");
            subCell = new ap.models.projects.SubCell(Utility);

            subCells.push(subCell);
            ids = [subCell.Id];
            subCellList.specifyIds(ids);
            subCellList.loadNextPage();
            _deferred.resolve(new ap.services.apiHelper.ApiResponse(subCells));
            $rootScope.$apply();
            subCellVM = <ap.viewmodels.projects.SubCellViewModel>subCellList.getItemAtIndex(0);
            subCellVM.code = "fdsdfdsf";
            subCellVM.description = "fdsdfdsf";

        });
        describe("WHEN call updateItemsActionsState with enabled is true", () => {

            beforeEach(() => {
                subCellVM.disableActions();
                subCellList.updateItemsActionsState(true);
            });
            it("THEN actions in items should be enabled", () => {
                expect(subCellVM.actions[0].isEnabled).toBeTruthy();
            });
        });
        describe("WHEN call updateItemsActionsState with enabled is false", () => {
            beforeEach(() => {
                subCellList.updateItemsActionsState(false);
            });
            it("THEN actions in items should be disabled", () => {
                expect(subCellVM.actions[0].isEnabled).toBeFalsy();
            });
        });
    });
    describe("Feature cancel", () => {
        let _deferred: any;
        let subCellList: SubCellListVm;
        let subCells: ap.models.projects.SubCell[] = [];
        let subCell: ap.models.projects.SubCell;
        let ids: string[];
        let subCellVM: ap.viewmodels.projects.SubCellViewModel;
        let callbackPropretyChanged;
        let args: ap.viewmodels.base.PropertyChangedEventArgs;
        beforeEach(() => {
            subCell = new ap.models.projects.SubCell(Utility);
            subCells.push(subCell);

            _deferred = $q.defer();
            spyOn(Api, "getEntityList").and.returnValue(_deferred.promise);

            subCellList = new SubCellListVm(Utility, $q, ControllersManager, ServicesManager);
            let getProjectCellsDef = $q.defer();
            spyOn(ServicesManager.projectService, "getProjectCells").and.returnValue(getProjectCellsDef.promise);
            spyOn(subCellList, "clear");
            spyOn(subCellList, "checkForDuplicatedItems");

            ids = [subCell.Id];
            subCellList.specifyIds(ids);
            subCellList.loadNextPage();
            _deferred.resolve(new ap.services.apiHelper.ApiResponse(subCells));
            $rootScope.$apply();

            (<ap.viewmodels.projects.SubCellViewModel>subCellList.getItemAtIndex(0)).description = "blablabla";

            callbackPropretyChanged = jasmine.createSpy("callback");
            subCellList.on("hasChanged", callbackPropretyChanged, this);
            subCellList.valuesIdsDictionary[0].add(null, [subCell.Id]);
            subCellList.idValuesDictionary.add(subCell.Id, null);
            subCellList.cancel();
        });
        describe("WEN cancel is called", () => {
            it("THEN, hasChanged event is raised with false", () => {
                expect(callbackPropretyChanged).toHaveBeenCalledWith(false);
            });
        });
    });

});

