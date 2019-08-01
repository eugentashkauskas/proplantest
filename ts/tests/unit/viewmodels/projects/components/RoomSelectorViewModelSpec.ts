'use strict';
describe("Module ap-viewmodels - project's components - RoomSelector", () => {
    let currentProject: ap.models.projects.Project;
    let vm: ap.viewmodels.projects.RoomSelectorViewModel;
    let Utility: ap.utility.UtilityHelper, MainController: ap.controllers.MainController, Api: ap.services.apiHelper.Api;

    let NoteController: ap.controllers.NoteController;
    let ProjectController: ap.controllers.ProjectController;
    let DocumentController: ap.controllers.DocumentController;
    let ControllersManager: ap.controllers.ControllersManager;
    let $mdDialog: angular.material.IDialogService;
    let NoteService: ap.services.NoteService;
    let mdDialogDeferred: angular.IDeferred<any>;

    let defActivity: ng.IDeferred<any>;
    let defActivityIds: ng.IDeferred<any>;

    let $q: angular.IQService, $timeout: angular.ITimeoutService, $rootScope: angular.IRootScopeService;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(() => {
        angular.mock.module("ap-services");

        angular.mock.module(function ($provide) {
            $provide.factory('$mdDialog', ["$q", function ($q) {
                mdDialogDeferred = $q.defer();
                return {
                    show: jasmine.createSpy("show").and.returnValue(mdDialogDeferred.promise)
                };
            }]);
        });
    });

    beforeEach(inject(function (_$rootScope_, _$q_, _$timeout_, _$compile_, _UserContext_, _Utility_, _Api_, _MainController_, _UIStateController_, _ControllersManager_, _$controller_, _NoteController_, _ProjectController_,
        _DocumentController_, _NoteService_, _$mdDialog_) {
        Utility = _Utility_;
        MainController = _MainController_;
        $q = _$q_;
        Api = _Api_;
        $timeout = _$timeout_;
        $rootScope = _$rootScope_;

        NoteController = _NoteController_;
        ProjectController = _ProjectController_;
        DocumentController = _DocumentController_;
        ControllersManager = _ControllersManager_;
        NoteService = _NoteService_;
        $mdDialog = _$mdDialog_;

        currentProject = new ap.models.projects.Project(Utility);
        let jsonProj = {
            Name: "My project"
        };
        modelSpecHelper.fillEntityJson(jsonProj);
        currentProject.createByJson(jsonProj);
        spyOn(MainController, "currentProject").and.callFake((val) => {
            if (!val)
                return currentProject;
        });;
    }));

    describe("Feature: constructor", () => {

        describe("WHEN the viewmodel is created AND there is no project defined in the MainController", () => {
            it("THEN, the listVm contains a custom param with projectid = guid.empty", () => {
                currentProject = null;
                vm = new ap.viewmodels.projects.RoomSelectorViewModel(Utility, $q, ControllersManager, $timeout);

                expect(vm.listVm.options.entityName).toBe("CellHierarchy");
                expect(vm.listVm.options.itemConstructor).toEqual(ap.viewmodels.projects.RoomHierarchyItemViewModel);
            });
        });
    });
    describe("Feature: load", () => {
        let deferIds, deferData, apiParams: any[], apiIds: any[];
        beforeEach(() => {
            deferIds = $q.defer();
            deferData = $q.defer();
            vm = new ap.viewmodels.projects.RoomSelectorViewModel(Utility, $q, ControllersManager, $timeout);
            apiParams = [
                new ap.services.apiHelper.ApiCustomParam("projectid", currentProject.Id)
            ];
            apiIds = ["455620", "445541", "445125"];
            spyOn(vm.listVm, "loadIds").and.callThrough();
            spyOn(Api, "getEntityIds").and.returnValue(deferIds.promise);
            spyOn(vm.listVm, "loadPage").and.callThrough();
            spyOn(Api, "getEntityList").and.returnValue(deferData.promise);
            spyOn($timeout, "cancel").and.callThrough();
        });
        describe("WHEN load is called and there is a current project and there is no searchedText defined ", () => {
            it("THEN loadIds of the listVm is called with no filter", () => {
                vm.load();
                $rootScope.$apply();
                expect(vm.listVm.loadIds).toHaveBeenCalledWith(undefined, undefined);
            });
            it("AND customparams contains projectid = current project only", () => {
                vm.load();

                expect(vm.listVm.customParams).toEqual(apiParams);
            });
        });
        describe("WHEN load is called and there is NO current project", () => {
            it("THEN, the customParam contains an empty guid for the projectid", () => {
                currentProject = undefined;
                apiParams = [
                    new ap.services.apiHelper.ApiCustomParam("projectid", ap.utility.UtilityHelper.createEmptyGuid())
                ];

                vm.load();
                expect(vm.listVm.customParams).toEqual(apiParams);
            });
        });
        describe("WHEN load is called and there is a current project and there is a searchedText", () => {
            beforeEach(() => {
                vm.searchedText = "EL";
            });
            
            it("THEN, customparams contains projectid = current project AND baseentityname = IssueType AND Filter on searched text", () => {

                vm.load();
                apiParams.push(new ap.services.apiHelper.ApiCustomParam("baseentityname", "SubCell"));

                expect(vm.listVm.customParams).toEqual(apiParams);
            });
        });

        describe("WHEN a page is loaded without first-level parent cells with no child subcells", () => {
            let apiData: ap.models.projects.CellHierarchy[];

            beforeEach(() => {
                let apiData1 = new ap.models.projects.CellHierarchy(Utility);
                let apiData2 = new ap.models.projects.CellHierarchy(Utility);
                let apiData3 = new ap.models.projects.CellHierarchy(Utility);
                apiData1.createByJson({
                    Id: apiIds[0],
                    EntityName: "ParentCell",
                    EntityId: "45111",
                    ParentEntityId: "",
                    Code: "Code 0",
                    Description: "Desc0"
                });
                apiData2.createByJson({
                    Id: apiIds[1],
                    EntityId: "45112",
                    EntityName: "SubCell",
                    ParentEntityId: "45111",
                    Code: "Code 1",
                    Description: "Desc1"
                });
                apiData3.createByJson({
                    Id: apiIds[2],
                    EntityId: "45113",
                    EntityName: "SubCell",
                    ParentEntityId: "45111",
                    Code: "Code 3",
                    Description: "Desc3"
                });
                apiData = [apiData1, apiData2, apiData3];
            });

            it("THEN, sourceItems contains CellHiararchyItem corresponding to the loaded data", () => {
                vm.load();

                deferIds.resolve(new ap.services.apiHelper.ApiResponse(apiIds));
                $rootScope.$apply();

                deferData.resolve(new ap.services.apiHelper.ApiResponse(apiData));
                $rootScope.$apply();

                expect(vm.listVm.sourceItems.length).toBe(3);
                for (let i = 0; i < apiData.length; i++) {
                    expect(vm.listVm.sourceItems[i] instanceof ap.viewmodels.projects.RoomHierarchyItemViewModel).toBeTruthy();
                    expect(vm.listVm.sourceItems[i].originalEntity).toBe(apiData[i]);
                }
            });
        });
    });
    describe("Feature: selectedRoomId", () => {
        let cellHierarchy: ap.models.projects.CellHierarchy;
        beforeEach(() => {
            // Init Vm
            vm = new ap.viewmodels.projects.RoomSelectorViewModel(Utility, $q, ControllersManager, $timeout);
            cellHierarchy = new ap.models.projects.CellHierarchy(Utility);
            cellHierarchy.createByJson({
                EntityId: "42",
                Id: "420",
                EntityName: "SubCell"
            });
            specHelper.general.spyProperty(ap.viewmodels.projects.RoomSelectorViewModel.prototype, "selectedItem", specHelper.PropertyAccessor.Get).and.callFake(() => {
                if (cellHierarchy === null) return null;
                return {
                    originalEntity: cellHierarchy
                };
            });
        });

        afterEach(() => {
            specHelper.general.offSpyProperty(ap.viewmodels.projects.RoomSelectorViewModel.prototype, "selectedItem", specHelper.PropertyAccessor.Get);
        });
        describe("WHEN the selectedItem is not null", () => {
            it("THEN, the selectedRoomId returns the EntityId of the chapterHierarchy", () => {
                expect(vm.selectedRoomId).toBe(cellHierarchy.EntityId);
            });
        });
        describe("WHEN the selectedItem is null", () => {
            it("THEN, the selectedRoomId returns null", () => {
                cellHierarchy = null;
                expect(vm.selectedRoomId).toBeNull();
            });
        });
    });

    describe("Feature: getParentCell", () => {

        let deferIds, deferData, apiParams: any[], apiIds: any[];
        let apiData: ap.models.projects.CellHierarchy[];
        let spy: jasmine.Spy;

        beforeEach(() => {
            deferIds = $q.defer();
            deferData = $q.defer();
            vm = new ap.viewmodels.projects.RoomSelectorViewModel(Utility, $q, ControllersManager, $timeout);
            apiParams = [
                new ap.services.apiHelper.ApiCustomParam("projectid", currentProject.Id)
            ];
            apiIds = ["455620", "445541", "445125"];
            spyOn(Api, "getEntityIds").and.returnValue(deferIds.promise);
            spyOn(Api, "getEntityList").and.returnValue(deferData.promise);
            spyOn($timeout, "cancel").and.callThrough();

            let apiData1 = new ap.models.projects.CellHierarchy(Utility);
            let apiData2 = new ap.models.projects.CellHierarchy(Utility);
            let apiData3 = new ap.models.projects.CellHierarchy(Utility);
            apiData1.createByJson({
                Id: apiIds[0],
                EntityId: "45111",
                EntityName: "ParentCell",
                ParentEntityId: "",
                Code: "Code 0",
                Description: "Desc0"
            });
            apiData2.createByJson({
                Id: apiIds[1],
                EntityId: "45112",
                EntityName: "SubCell",
                ParentEntityId: "45111",
                Code: "Code 1",
                Description: "Desc1"
            });
            apiData3.createByJson({
                Id: apiIds[2],
                EntityId: "45113",
                EntityName: "SubCell",
                ParentEntityId: "45111",
                Code: "Code 3",
                Description: "Desc3"
            });

            apiData = [apiData1, apiData2, apiData3];

            vm.load();

            deferIds.resolve(new ap.services.apiHelper.ApiResponse(apiIds));
            $rootScope.$apply();

            deferData.resolve(new ap.services.apiHelper.ApiResponse(apiData));
            $rootScope.$apply();

            //spy = specHelper.general.spyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get);
        });

        //afterEach(() => {
        //    specHelper.general.offSpyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get);
        //});

        describe("WHEN getParentCell is called AND a room is selected", () => {
            it("THEN, the parentCell which id = Cell.ParentEntityid is returned", () => {
                //spy.and.returnValue({
                //    originalEntity: apiData[1]
                //})
                vm.selectedItem = vm.listVm.sourceItems[1];
                expect(vm.getParentCell()).toBe(apiData[0]);
            });
        });

        describe("WHEN getParentCell is called AND no room is selected", () => {
            it("THEN, null is returned", () => {
                //spy.and.returnValue(null);
                vm.selectedItem = null;
                expect(vm.getParentCell()).toBeNull();
            });
        });
    });
}); 