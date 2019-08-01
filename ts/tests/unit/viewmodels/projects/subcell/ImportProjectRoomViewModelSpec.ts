describe("Module ap-viewmodels - projects - ImportProjectRoomViewModel", () => {
    let Utility: ap.utility.UtilityHelper,
        MainController: ap.controllers.MainController,
        ProjectController: ap.controllers.ProjectController,
        Api: ap.services.apiHelper.Api,
        $q: angular.IQService,
        $timeout: angular.ITimeoutService,
        $mdDialog: angular.material.IDialogService;
    let $rootScope: angular.IRootScopeService;
    let ControllersManager: ap.controllers.ControllersManager;
    let ProjectService: ap.services.ProjectService;
    let spiedCurrentProject: ap.models.projects.Project;
    let defProjectService;
    let ServiceManager: ap.services.ServicesManager;
    class ParentCellListV extends ap.viewmodels.projects.ParentCellListViewModel {

        afterLoadPageSuccessHandler(arrayItem: ap.viewmodels.IEntityViewModel[], index: number, pageDesc: ap.viewmodels.PageDescription, createItemVmHandler?: new (utility: ap.utility.UtilityHelper, q: angular.IQService, parentListVm?: ap.viewmodels.BaseListEntityViewModel, itemParameters?: ap.viewmodels.ItemConstructorParameter) => ap.viewmodels.IEntityViewModel, _pageLoadedParameters?: ap.viewmodels.LoadPageSuccessHandlerParameter) { }

        constructor(utility: ap.utility.UtilityHelper, $q: angular.IQService, _controllersManager: ap.controllers.ControllersManager, projectService: ap.services.ProjectService) {
            super(utility, $q, _controllersManager, projectService);
        }
    }
    class SubCellListV extends ap.viewmodels.projects.SubCellListViewModel {

        afterLoadPageSuccessHandler(arrayItem: ap.viewmodels.IEntityViewModel[], index: number, pageDesc: ap.viewmodels.PageDescription, createItemVmHandler?: new (utility: ap.utility.UtilityHelper, q: angular.IQService, parentListVm?: ap.viewmodels.BaseListEntityViewModel, itemParameters?: ap.viewmodels.ItemConstructorParameter) => ap.viewmodels.IEntityViewModel, _pageLoadedParameters?: ap.viewmodels.LoadPageSuccessHandlerParameter) { }

        constructor(utility: ap.utility.UtilityHelper, $q: angular.IQService, _controllersManager: ap.controllers.ControllersManager, _serviceManager: ap.services.ServicesManager) {
            super(utility, $q, _controllersManager, _serviceManager);
        }
    }

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
        angular.mock.module("ap-controllers");
        angular.mock.module(function ($provide) {
            $provide.factory('$mdDialog', ["$q", function ($q) {
                return specHelper.utility.stubShowMdDialog($q);
            }]);
        });
    });

    beforeEach(inject(function (_Utility_, _Api_, _MainController_, _ProjectController_, _$q_, _$rootScope_, _ControllersManager_, _ProjectService_, _$mdDialog_, _$timeout_, _ServicesManager_) {
        Utility = _Utility_;
        MainController = _MainController_;
        Api = _Api_;
        $q = _$q_;
        ProjectController = _ProjectController_;
        $mdDialog = _$mdDialog_;
        $timeout = _$timeout_;
        ProjectService = _ProjectService_;
        $rootScope = _$rootScope_;
        ControllersManager = _ControllersManager_;
        ServiceManager = _ServicesManager_;
        spiedCurrentProject = specHelper.mainController.stub(MainController, Utility);
    }));

    beforeEach(() => {
        specHelper.userContext.stub(Utility);
        defProjectService = $q.defer();
    });

    let vm: ap.viewmodels.projects.ImportProjectRoomViewModel;
    let tab: string[];
    let id1: string;
    let id2: string;
    let id3: string;
    let id4: string;
    let id5: string;
    let id6: string;
    let id7: string;
    let options: ap.services.apiHelper.ApiOption;
    let currentProj: ap.models.projects.Project;
    let defResponse: angular.IDeferred<any>;
    let deferDataParent: angular.IDeferred<any>;
    let parentCellVm: ap.viewmodels.projects.ParentCellViewModel;
    let subCellVm: ap.viewmodels.projects.SubCellViewModel;
    let parentCell: ap.models.projects.ParentCell;
    let subCell: ap.models.projects.SubCell;
    let defProject: any;
    beforeEach(() => {
        parentCell = new ap.models.projects.ParentCell(Utility);
        subCell = new ap.models.projects.SubCell(Utility);
        parentCellVm = new ap.viewmodels.projects.ParentCellViewModel(Utility);
        parentCellVm.init(parentCell);
        subCellVm = new ap.viewmodels.projects.SubCellViewModel(Utility);
        subCellVm.init(subCell);
        id1 = parentCellVm.originalEntity.Id;
        id2 = subCellVm.originalEntity.Id;
        id3 = ap.utility.UtilityHelper.createGuid();
        id4 = ap.utility.UtilityHelper.createGuid();
        id5 = ap.utility.UtilityHelper.createGuid();
        id6 = ap.utility.UtilityHelper.createGuid();
        id7 = ap.utility.UtilityHelper.createGuid();
        tab = [id1 + "0", id2 + "1", id3 + "1", id4 + "0", id5 + "1", id6 + "0", id7 + "1"];
        defProject = $q.defer();
        spyOn(Api, "getEntityIds").and.callFake((entityName: string) => {
            if (entityName === "Project") {
                return defProject.promise;
            }
        });
        specHelper.general.spyProperty(ap.viewmodels.projects.ProjectSelectorViewModel.prototype, "selectedProjectId", specHelper.PropertyAccessor.Get).and.returnValue("1");
    });
    afterEach(() => {
        specHelper.general.offSpyProperty(ap.viewmodels.projects.ProjectSelectorViewModel.prototype, "selectedProjectId", specHelper.PropertyAccessor.Get);
    });

    describe("WHEN the constructor is called", () => {
        let def: any;
        beforeEach(() => {
            def = $q.defer();
            vm = new ap.viewmodels.projects.ImportProjectRoomViewModel(Utility, $q, Api, ControllersManager, ProjectService, ServiceManager, $mdDialog, $timeout);
            def.resolve();
            $rootScope.$apply();
        });
        it("THEN parentCellListVm is defined", () => {
            expect(vm.parentCellListVm).toBeDefined();
        });
        it("THEN subCellListVm is defined", () => {
            expect(vm.subCellListVm).toBeDefined();
        });
        it("THEN .projectSelector.load is called", () => {
            expect(Api.getEntityIds).toHaveBeenCalled();
        });
    });

    describe("WHEN the methods parentIsChecked/subCellIsChecked is called", () => {
        let parentCell: ap.viewmodels.projects.ParentCellViewModel;
        let subCell1: ap.viewmodels.projects.SubCellViewModel;
        let subCell2: ap.viewmodels.projects.SubCellViewModel;
        let parentCellList: ap.viewmodels.projects.ParentCellListViewModel;
        let subCellList: ap.viewmodels.projects.SubCellListViewModel;
        let defGet: angular.IDeferred<any>;

        beforeEach(() => {
            defGet = $q.defer();
            let parent: ap.models.projects.ParentCell = new ap.models.projects.ParentCell(Utility);
            // let parent2: ap.models.projects.ParentCell = new ap.models.projects.ParentCell(Utility);

            let sub: ap.models.projects.SubCell = new ap.models.projects.SubCell(Utility);
            sub.ParentCell = parent;
            let sub2: ap.models.projects.SubCell = new ap.models.projects.SubCell(Utility);
            sub2.ParentCell = parent;

            parentCell = new ap.viewmodels.projects.ParentCellViewModel(Utility);
            parent.SubCells = [sub, sub2];
            parentCell.init(parent);
            vm = new ap.viewmodels.projects.ImportProjectRoomViewModel(Utility, $q, Api, ControllersManager, ProjectService, ServiceManager, $mdDialog, $timeout);
            vm.parentCellListVm.cancel();
            vm.subCellListVm.cancel();
            vm.parentCellListVm.sourceItems = [parentCell/*, parentCell2*/];
            
            parentCellList = new ap.viewmodels.projects.ParentCellListViewModel(Utility, $q, ControllersManager, ProjectService);
            parentCellList.sourceItems = [parentCell];

            subCell1 = new ap.viewmodels.projects.SubCellViewModel(Utility);
            subCell1.init(sub);
            subCell2 = new ap.viewmodels.projects.SubCellViewModel(Utility);
            subCell2.init(sub2);

            subCellList = new ap.viewmodels.projects.SubCellListViewModel(Utility, $q, ControllersManager, ServiceManager);
            subCellList.clear(); // call this method to mark list as loaded
            subCellList.sourceItems = [subCell1, subCell2];
            spyOn(vm.parentCellListVm, "getEntityById").and.returnValue(parentCell);
            spyOn(vm.subCellListVm, "getEntityById").and.callFake((id: string) => {
                if (id === subCell1.originalEntity.Id) { return subCell1; }
                if (id === subCell2.originalEntity.Id) { return subCell2; }
            });
            subCellList.parentCellVm = parentCell;
            specHelper.general.spyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "isLoaded", specHelper.PropertyAccessor.Get).and.returnValue(true);
            specHelper.general.spyProperty(ap.viewmodels.projects.ImportProjectRoomViewModel.prototype, "parentCellListVm", specHelper.PropertyAccessor.Get).and.returnValue(parentCellList);
            specHelper.general.spyProperty(ap.viewmodels.projects.ImportProjectRoomViewModel.prototype, "subCellListVm", specHelper.PropertyAccessor.Get).and.returnValue(subCellList);

        });

        afterEach(() => {
            specHelper.general.offSpyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "isLoaded", specHelper.PropertyAccessor.Get);
            specHelper.general.offSpyProperty(ap.viewmodels.projects.ImportProjectRoomViewModel.prototype, "parentCellListVm", specHelper.PropertyAccessor.Get);
            specHelper.general.offSpyProperty(ap.viewmodels.projects.ImportProjectRoomViewModel.prototype, "subCellListVm", specHelper.PropertyAccessor.Get);
        });

        describe("WHEN the parentCell is checked", () => {
            beforeEach(() => {
                vm.parentCellListVm.sourceItems[0].isChecked = true;
                vm.checkedRooms(parentCell);
            });
            it("THEN the children are checked too", () => {
                expect(vm.subCellListVm.sourceItems[0].isChecked).toBeTruthy();
                expect(vm.subCellListVm.sourceItems[1].isChecked).toBeTruthy();
            });
        });
        describe("WHEN the parentCell is unchecked", () => {
            beforeEach(() => {
                vm.parentCellListVm.sourceItems[0].isChecked = false;
                vm.checkedRooms(parentCell);
            });
            it("THEN the children are unchecked too", () => {
                expect(vm.subCellListVm.sourceItems[0].isChecked).toBeFalsy();
                expect(vm.subCellListVm.sourceItems[1].isChecked).toBeFalsy();
            });
        });        
        describe("WHEN the parentCell is checked, and a subCell is already checked and we want to unchecked it", () => {
            beforeEach(() => {
                vm.parentCellListVm.sourceItems[0].isChecked = true;
                vm.subCellListVm.sourceItems[0].isChecked = true;
                vm.checkedRooms(parentCell);
                vm.parentCellListVm.sourceItems[0].isChecked = false;
                vm.subCellListVm.sourceItems[0].isChecked = false;
                vm.checkedRooms(parentCell);
            });
            it("THEN the parentCell is unchecked", () => {
                expect(vm.parentCellListVm.sourceItems[0].isChecked).toBeFalsy();
                expect(vm.subCellListVm.sourceItems[1].isChecked).toBeFalsy();
            });
        });
        describe("WHEN the subCell is checked/ unchecked", () => {
            describe("WHEN the subCell's parentCell is not checked", () => {
                beforeEach(() => {
                    vm.parentCellListVm.sourceItems[0].isChecked = false;
                    vm.subCellListVm.sourceItems[0].isChecked = true;
                    vm.checkedRooms(vm.subCellListVm.sourceItems[0]);
                });
                it("THEN the parentCell is checked", () => {
                    expect(vm.parentCellListVm.sourceItems[0].isChecked).toBeTruthy();
                    expect(vm.subCellListVm.sourceItems[0].isChecked).toBeTruthy();
                });
            });
            describe("WHEN we want to uncheck the last subCell", () => {
                beforeEach(() => {
                    vm.parentCellListVm.sourceItems[0].isChecked = true;
                    vm.subCellListVm.sourceItems[0].isChecked = true;
                    vm.checkedRooms(vm.parentCellListVm.sourceItems[0]);
                    vm.subCellListVm.sourceItems[0].isChecked = false;
                    vm.checkedRooms(vm.subCellListVm.sourceItems[0]);
                });
                it("THEN the parentCell is unChecked too", () => {
                    expect(vm.parentCellListVm.sourceItems[0].isChecked).toBeFalsy();
                    expect(vm.subCellListVm.sourceItems[0].isChecked).toBeFalsy();
                });
            });
        });
    });

    describe("WHEN the method projectSelectorSelectedItemChanged is called", () => {
        beforeEach(() => {
            vm = new ap.viewmodels.projects.ImportProjectRoomViewModel(Utility, $q, Api, ControllersManager, ProjectService, ServiceManager, $mdDialog, $timeout);
            spyOn(vm, "load");
            spyOn(vm.subCellListVm, "specifyIds");
            specHelper.general.raiseEvent(vm.projectSelector, "selectedItemChanged", { Id: "selectedVm" });
        });
        it("THEN specifyIds is called", () => {
            expect(vm.subCellListVm.specifyIds).toHaveBeenCalled();
        });
        it("THEN loadidsdata is called", () => {
            expect(vm.load).toHaveBeenCalled();
        });
    });
});