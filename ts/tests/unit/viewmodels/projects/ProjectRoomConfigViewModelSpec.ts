describe("Module ap-viewmodels - projects - ProjectRoomConfigViewModel", () => {

    class ParentCellListV extends ap.viewmodels.projects.ParentCellListViewModel {

        afterLoadPageSuccessHandler(arrayItem: ap.viewmodels.IEntityViewModel[], index: number, pageDesc: ap.viewmodels.PageDescription, createItemVmHandler?: new (utility: ap.utility.UtilityHelper, q: angular.IQService, parentListVm?: ap.viewmodels.BaseListEntityViewModel, itemParameters?: ap.viewmodels.ItemConstructorParameter) => ap.viewmodels.IEntityViewModel, _pageLoadedParameters?: ap.viewmodels.LoadPageSuccessHandlerParameter) { }

        checkForDuplicatedItems(itemVm: ap.viewmodels.IEntityViewModel) { }

        constructor(utility: ap.utility.UtilityHelper, protected $q: angular.IQService, _controllersManager: ap.controllers.ControllersManager, _projectService: ap.services.ProjectService) {
            super(utility, $q, _controllersManager, _projectService);
        }
    }
    class SubCellListV extends ap.viewmodels.projects.SubCellListViewModel {

        afterLoadPageSuccessHandler(arrayItem: ap.viewmodels.IEntityViewModel[], index: number, pageDesc: ap.viewmodels.PageDescription, createItemVmHandler?: new (utility: ap.utility.UtilityHelper, q: angular.IQService, parentListVm?: ap.viewmodels.BaseListEntityViewModel, itemParameters?: ap.viewmodels.ItemConstructorParameter) => ap.viewmodels.IEntityViewModel, _pageLoadedParameters?: ap.viewmodels.LoadPageSuccessHandlerParameter) { }

        checkForDuplicatedItems(itemVm: ap.viewmodels.IEntityViewModel) { }

        constructor(utility: ap.utility.UtilityHelper, protected $q: angular.IQService, _controllersManager: ap.controllers.ControllersManager, _servicesManager: ap.services.ServicesManager) {
            super(utility, $q, _controllersManager, _servicesManager);
        }
    }

    let Utility: ap.utility.UtilityHelper,
        MainController: ap.controllers.MainController,
        ProjectController: ap.controllers.ProjectController,
        Api: ap.services.apiHelper.Api,
        $q: angular.IQService;
    let $rootScope: angular.IRootScopeService;
    let ControllersManager: ap.controllers.ControllersManager;
    let spiedCurrentProject: ap.models.projects.Project;
    let ServicesManager: ap.services.ServicesManager;
    let $mdDialog: angular.material.IDialogService;
    let $timeout: angular.ITimeoutService;
    let tab: string[];
    let id1: string, id2: string, id3: string, id4: string, id5: string, id6: string, id7: string;

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

    beforeEach(inject(function (_Utility_, _Api_, _MainController_, _ProjectController_, _$q_, _$mdDialog_, _$rootScope_, _ControllersManager_, _ServicesManager_, _$timeout_) {
        Utility = _Utility_;
        MainController = _MainController_;
        ServicesManager = _ServicesManager_;
        Api = _Api_;
        $timeout = _$timeout_;
        $q = _$q_;
        $mdDialog = _$mdDialog_;
        ProjectController = _ProjectController_;
        $rootScope = _$rootScope_;
        ControllersManager = _ControllersManager_;
        spiedCurrentProject = specHelper.mainController.stub(MainController, Utility);
    }));

    // stub UserContext
    beforeEach(() => {
        specHelper.userContext.stub(Utility);
    });

    // spy Segment.IO calls
    beforeEach(() => {
        spyOn(ServicesManager.toolService, "sendEvent").and.returnValue($q.defer().promise);
    });

    describe("Feature: ProjectRoomConfigViewModel", () => {
        let vm: ap.viewmodels.projects.ProjectRoomConfigViewModel;

        let apiDataParentCell;
        let apiDataSubCell;
        let options: ap.services.apiHelper.ApiOption;
        let currentProj: ap.models.projects.Project;
        let defResponse: angular.IDeferred<any>;
        let def: angular.IDeferred<any>;
        let deferDataParentCell: angular.IDeferred<any>;
        let deferDataSubCell: angular.IDeferred<any>;
        let parentCellVm: ap.viewmodels.projects.ParentCellViewModel;
        let subCellVm: ap.viewmodels.projects.SubCellViewModel;
        let parentCell: ap.models.projects.ParentCell;
        let subCell: ap.models.projects.SubCell;

        beforeEach(() => {
            def = $q.defer();
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
            tab = [id1 + "0", id2 + "1", id3 + "1", id4 + "0", id5 + "1", id6 + "0", id7 + "1"];

            apiDataParentCell = [
                {
                    Id: id1,
                    Code: "Code 0",
                    Description: "Desc0"
                },
                {
                    Id: id4,
                    Code: "Code 1",
                    Description: "Desc1"
                },
                {
                    Id: id6,
                    Code: "Code 2",
                    Description: "Desc2"
                }
            ];

            apiDataSubCell = [
                {
                    Id: id2,
                    Code: "Code 0",
                    Description: "Desc0"
                },
                {
                    Id: id3,
                    Code: "Code 1",
                    Description: "Desc1"
                }
            ];
        });
        describe("WHEN the constructor is called", () => {
            beforeEach(() => {
                vm = new ap.viewmodels.projects.ProjectRoomConfigViewModel(Utility, $q, $mdDialog, Api, ControllersManager, ServicesManager, $timeout);

                defResponse = $q.defer();
                deferDataParentCell = $q.defer();
                deferDataSubCell = $q.defer();
                spyOn(ServicesManager.projectService, "getProjectCells").and.returnValue(def.promise);
                currentProj = ControllersManager.mainController.currentProject();
                options = new ap.services.apiHelper.ApiOption();
                options.customParams.push(new ap.services.apiHelper.ApiCustomParam("projectId", currentProj.Id));
                options.customParams.push(new ap.services.apiHelper.ApiCustomParam("baseentityname", "parentcell"));
                spyOn(Api, "getApiResponse").and.returnValue(defResponse.promise);
                vm.load();
                defResponse.resolve(new ap.services.apiHelper.ApiResponse(tab));
                $rootScope.$apply();
            });
            it("THEN parentCellListVm is defined", () => {
                expect(vm.parentCellListVm).toBeDefined();
            });
            it("THEN subCellListVm is defined", () => {
                expect(vm.subCellListVm).toBeDefined();
            });
            it("THEN screenInfo is defined", () => {
                expect(vm.screenInfo).toBeDefined();
            });
            it("THEN the name of the screen is 'project.roomconfig'", () => {
                expect(vm.screenInfo.name).toBe("project.roomconfig");
            });
            it("THEN, 4 actions are defined", () => {
                expect(vm.screenInfo.actions.length).toBe(4);
            });
            it("THEN, the first action is 'rooms.edit'", () => {
                expect(vm.screenInfo.actions[0].name).toBe("rooms.edit");
            });
            it("THEN, the second action is 'rooms.save'", () => {
                expect(vm.screenInfo.actions[1].name).toBe("rooms.save");
            });
            it("THEN, the third actions is 'rooms.cancel'", () => {
                expect(vm.screenInfo.actions[2].name).toBe("rooms.cancel");
            });
            it("THEN, the fourth action is 'rooms.import'", () => {
                expect(vm.screenInfo.actions[3].name).toBe("rooms.import");
            });
        });

        describe("WHEN the method load is called", () => {
            beforeEach(() => {
                vm = new ap.viewmodels.projects.ProjectRoomConfigViewModel(Utility, $q, $mdDialog, Api, ControllersManager, ServicesManager, $timeout);
                spyOn(ServicesManager.projectService, "getProjectCells").and.returnValue(def.promise);
                defResponse = $q.defer();
                deferDataParentCell = $q.defer();
                deferDataSubCell = $q.defer();
                currentProj = ControllersManager.mainController.currentProject();
                options = new ap.services.apiHelper.ApiOption();
                options.customParams.push(new ap.services.apiHelper.ApiCustomParam("projectId", currentProj.Id));
                options.customParams.push(new ap.services.apiHelper.ApiCustomParam("baseentityname", "parentcell"));
                options.showDetailBusy = true;
                spyOn(Api, "getApiResponse").and.returnValue(defResponse.promise);
                vm.load();
                defResponse.resolve(new ap.services.apiHelper.ApiResponse(tab));
                $rootScope.$apply();
            });
            it("THEN getApiResponse is called with correct param", () => {
                expect(Api.getApiResponse).toHaveBeenCalledWith("rest/cellhierarchiesids", ap.services.apiHelper.MethodType.Get, null, null, options);
            });
            it("THEN parentCellListVm is init", () => {
                expect(vm.parentCellListVm.count).toEqual(3);
                expect(vm.parentCellListVm.ids[0]).toEqual(id1);
                expect(vm.parentCellListVm.ids[1]).toEqual(id4);
                expect(vm.parentCellListVm.ids[2]).toEqual(id6);
            });
        });

        describe("WHEN the method handlerSelectedParentCellChanged is called", () => {
            let apiSpy: jasmine.Spy;
            let defProjectParentCells;
            let defProjectSubCells;
            beforeEach(() => {
                defProjectParentCells = $q.defer();
                defProjectSubCells = $q.defer();
                vm = new ap.viewmodels.projects.ProjectRoomConfigViewModel(Utility, $q, $mdDialog, Api, ControllersManager, ServicesManager, $timeout);
                spyOn((<ParentCellListV>vm.parentCellListVm), "afterLoadPageSuccessHandler");
                spyOn((<ParentCellListV>vm.parentCellListVm), "checkForDuplicatedItems");
                spyOn((<SubCellListV>vm.subCellListVm), "checkForDuplicatedItems");
                spyOn((<SubCellListV>vm.subCellListVm), "afterLoadPageSuccessHandler");
                spyOn(vm.subCellListVm, "parentCellUpdated");
                spyOn(ServicesManager.projectService, "getProjectCells").and.callFake((parentCellIds: string[], pathToLoad: string, onlyPathToLoadData: boolean, isParentCell: boolean) => {
                    if (isParentCell)
                        return defProjectParentCells.promise;
                    else
                        return defProjectSubCells.promise;

                });
                defResponse = $q.defer();
                deferDataParentCell = $q.defer();
                deferDataSubCell = $q.defer();
                currentProj = ControllersManager.mainController.currentProject();
                options = new ap.services.apiHelper.ApiOption();
                options.customParams.push(new ap.services.apiHelper.ApiCustomParam("projectId", currentProj.Id));
                options.customParams.push(new ap.services.apiHelper.ApiCustomParam("baseentityname", "parentcell"));
                spyOn(Api, "getApiResponse").and.returnValue(defResponse.promise);
                vm.load();
                defResponse.resolve(new ap.services.apiHelper.ApiResponse(tab));
                $rootScope.$apply();

                apiSpy = spyOn(Api, "getEntityList").and.callFake((entityName: string, filter?: string, pathToLoad?: string, sortOrder?: string, ids?: string[]) => {
                    if (entityName === "ParentCell") return deferDataParentCell.promise;
                    if (entityName === "SubCell") return deferDataSubCell.promise;
                });

                vm.parentCellListVm.loadNextPage();
                deferDataParentCell.resolve(new ap.services.apiHelper.ApiResponse(apiDataParentCell));
                deferDataSubCell.resolve(new ap.services.apiHelper.ApiResponse(apiDataSubCell));
                $rootScope.$apply();

                vm.parentCellListVm.selectedViewModel = parentCellVm;

                defProjectParentCells.resolve([]);
                defProjectSubCells.resolve([]);
                $rootScope.$apply();
            });
            it("THEN, the API.getEntityList method is called", () => {
                expect(apiSpy.calls.count()).toEqual(1);
                expect(apiSpy.calls.mostRecent().args[4]).toEqual([id1, id4, id6]);
            });
            it("THEN subCellListVm is init", () => {
                expect(vm.subCellListVm.count).toEqual(2);
                expect(vm.subCellListVm.ids[0]).toEqual(id2);
                expect(vm.subCellListVm.ids[1]).toEqual(id3);
            });
        });

        describe("WHEN method checkEditAccess is called", () => {
            let vm: ap.viewmodels.projects.ProjectRoomConfigViewModel;
            let proj: ap.models.projects.Project;
            let access: ap.models.accessRights.ProjectAccessRight;

            beforeEach(() => {
                access = new ap.models.accessRights.ProjectAccessRight(Utility);
                proj = new ap.models.projects.Project(Utility);
            });
            describe("WHEN button edit is visible", () => {
                describe("WHEN utility.UserContext.licenseAccess.hasAccess(projectRoomConfig) = true && isEditMode = false", () => {
                    beforeEach(() => {
                        spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake((name) => {
                            if (name === ap.models.licensing.Module.Module_ProjectRoomConfig) return true;
                            return false;
                        });
                        vm = new ap.viewmodels.projects.ProjectRoomConfigViewModel(Utility, $q, $mdDialog, Api, ControllersManager, ServicesManager, $timeout);
                    });
                    it("THEN vm.screenInfo.actions[0].isVisible = true", () => {
                        expect(vm.screenInfo.actions[0].isVisible).toEqual(true);
                        expect(vm.screenInfo.actions[0].isEnabled).toEqual(true);
                    });
                });
            });
            describe("WHEN button edit is enabled", () => {
                describe("WHEN currentProject().UserAccessRight.CanConfig == true && isEditMode = false", () => {
                    beforeEach(() => {
                        spiedCurrentProject.UserAccessRight.CanConfig = true;
                        vm = new ap.viewmodels.projects.ProjectRoomConfigViewModel(Utility, $q, $mdDialog, Api, ControllersManager, ServicesManager, $timeout);
                    });
                    it("THEN vm.screenInfo.actions[0].isEnabled = true", () => {
                        expect(vm.screenInfo.actions[0].isEnabled).toEqual(true);
                    });
                });
            });
            describe("WHEN button edit is not visible", () => {
                describe("WHEN utility.UserContext.licenseAccess.hasAccess(projectRoomConfig) = true && isEditMode = true", () => {
                    beforeEach(() => {
                        specHelper.general.spyProperty(ap.misc.ScreenInfo.prototype, "isEditMode", specHelper.PropertyAccessor.Get).and.returnValue(true);

                        spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake((name) => {
                            if (name === ap.models.licensing.Module.Module_ProjectRoomConfig) return true;
                            return false;
                        });
                        vm = new ap.viewmodels.projects.ProjectRoomConfigViewModel(Utility, $q, $mdDialog, Api, ControllersManager, ServicesManager, $timeout);
                    });
                    afterEach(() => {
                        specHelper.general.offSpyProperty(ap.misc.ScreenInfo.prototype, "isEditMode", specHelper.PropertyAccessor.Get);
                    });
                    it("THEN vm.screenInfo.actions[0].isVisible = false", () => {
                        expect(vm.screenInfo.actions[0].isVisible).toEqual(false);
                    });
                });
                describe("WHEN utility.UserContext.licenseAccess.hasAccess(projectRoomConfig) = false && isEditMode = true", () => {
                    beforeEach(() => {
                        specHelper.general.spyProperty(ap.misc.ScreenInfo.prototype, "isEditMode", specHelper.PropertyAccessor.Get).and.returnValue(true);

                        spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake((name) => {
                            if (name === ap.models.licensing.Module.Module_ProjectRoomConfig) return false;
                            return true;
                        });
                        vm = new ap.viewmodels.projects.ProjectRoomConfigViewModel(Utility, $q, $mdDialog, Api, ControllersManager, ServicesManager, $timeout);
                    });
                    afterEach(() => {
                        specHelper.general.offSpyProperty(ap.misc.ScreenInfo.prototype, "isEditMode", specHelper.PropertyAccessor.Get);
                    });
                    it("THEN vm.screenInfo.actions[0].isVisible = false", () => {
                        expect(vm.screenInfo.actions[0].isVisible).toEqual(false);
                    });
                });
                describe("WHEN utility.UserContext.licenseAccess.hasAccess(projectRoomConfig) = false && isEditMode = false", () => {
                    beforeEach(() => {
                        spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake((name) => {
                            if (name === ap.models.licensing.Module.Module_ProjectRoomConfig) return false;
                            return true;
                        });
                        vm = new ap.viewmodels.projects.ProjectRoomConfigViewModel(Utility, $q, $mdDialog, Api, ControllersManager, ServicesManager, $timeout);
                    });
                    it("THEN vm.screenInfo.actions[0].isVisible = false", () => {
                        expect(vm.screenInfo.actions[0].isVisible).toEqual(false);
                    });
                });
            });
            describe("WHEN button edit is not enabled", () => {
                describe("WHEN currentProject.UserAccessRight.CanConfig = true && isEditMode = true", () => {
                    beforeEach(() => {
                        spiedCurrentProject.UserAccessRight.CanConfig = true;
                        specHelper.general.spyProperty(ap.misc.ScreenInfo.prototype, "isEditMode", specHelper.PropertyAccessor.Get).and.returnValue(true);
                        vm = new ap.viewmodels.projects.ProjectRoomConfigViewModel(Utility, $q, $mdDialog, Api, ControllersManager, ServicesManager, $timeout);
                    });
                    afterEach(() => {
                        specHelper.general.offSpyProperty(ap.misc.ScreenInfo.prototype, "isEditMode", specHelper.PropertyAccessor.Get);
                    });
                    it("THEN vm.screenInfo.actions[0].isEnabled = false", () => {
                        expect(vm.screenInfo.actions[0].isEnabled).toEqual(false);
                    });
                });
                describe("WHEN currentProject.UserAccessRight.CanConfig = false && isEditMode = true", () => {
                    beforeEach(() => {
                        specHelper.general.spyProperty(ap.misc.ScreenInfo.prototype, "isEditMode", specHelper.PropertyAccessor.Get).and.returnValue(true);
                        spiedCurrentProject.UserAccessRight.CanConfig = false;
                        vm = new ap.viewmodels.projects.ProjectRoomConfigViewModel(Utility, $q, $mdDialog, Api, ControllersManager, ServicesManager, $timeout);
                    });
                    afterEach(() => {
                        specHelper.general.offSpyProperty(ap.misc.ScreenInfo.prototype, "isEditMode", specHelper.PropertyAccessor.Get);
                    });
                    it("THEN vm.screenInfo.actions[0].isEnabled = false", () => {
                        expect(vm.screenInfo.actions[0].isEnabled).toEqual(false);
                    });
                });
                describe("WHEN currentProject.UserAccessRight.CanConfig = false && isEditMode = false", () => {
                    beforeEach(() => {
                        spiedCurrentProject.UserAccessRight.CanConfig = false;
                        vm = new ap.viewmodels.projects.ProjectRoomConfigViewModel(Utility, $q, $mdDialog, Api, ControllersManager, ServicesManager, $timeout);
                    });
                    it("THEN vm.screenInfo.actions[0].isEnabled = false", () => {
                        expect(vm.screenInfo.actions[0].isEnabled).toEqual(false);
                    });
                });
            });
        });

        describe("WHEN has changed event is called", () => {
            beforeEach(() => {
                vm = new ap.viewmodels.projects.ProjectRoomConfigViewModel(Utility, $q, $mdDialog, Api, ControllersManager, ServicesManager, $timeout);
                specHelper.general.raiseEvent(vm.screenInfo, "actionclicked", "rooms.edit");
            });
            describe("WHEN no elements of the list are changed", () => {
                beforeEach(() => {
                    spyOn(vm.parentCellListVm, "getChangedItems").and.returnValue([]);
                    spyOn(vm.subCellListVm, "getChangedItems").and.returnValue([]);
                });
                it("THEN saveAction.isEnabled = false", () => {
                    expect(vm.screenInfo.actions[1].isEnabled).toBeFalsy();
                    expect(vm.screenInfo.actions[1].isVisible).toBeTruthy();
                });
            });
            describe("WHEN elements are not valid", () => {
                beforeEach(() => {
                    subCellVm.code = "";
                    spyOn(vm.parentCellListVm, "getChangedItems").and.returnValue([]);
                    spyOn(vm.subCellListVm, "getChangedItems").and.returnValue([subCellVm]);
                });
                it("THEN saveAction.isEnabled = false", () => {
                    expect(vm.screenInfo.actions[1].isEnabled).toBeFalsy();
                    expect(vm.screenInfo.actions[1].isVisible).toBeTruthy();
                });
            });
            describe("WHEN an element of the list is changed", () => {
                describe("WHEN it's a parentCell", () => {
                    beforeEach(() => {
                        spyOn(vm.parentCellListVm, "getChangedItems").and.returnValue([parentCellVm]);
                        spyOn(vm.subCellListVm, "getChangedItems").and.returnValue([]);
                        specHelper.general.raiseEvent(vm.parentCellListVm, "hasChanged", null);
                    });
                    it("THEN saveAction.isEnabled = false", () => {
                        expect(vm.screenInfo.actions[1].isEnabled).toBeTruthy();
                        expect(vm.screenInfo.actions[1].isVisible).toBeTruthy();
                    });
                });
                describe("WHEN it's a subcell", () => {
                    beforeEach(() => {
                        spyOn(vm.parentCellListVm, "getChangedItems").and.returnValue([]);
                        spyOn(vm.subCellListVm, "getChangedItems").and.returnValue([subCellVm]);
                        specHelper.general.raiseEvent(vm.subCellListVm, "hasChanged", null);
                    });
                    it("THEN saveAction.isEnabled = false", () => {
                        expect(vm.screenInfo.actions[1].isEnabled).toBeTruthy();
                        expect(vm.screenInfo.actions[1].isVisible).toBeTruthy();
                    });
                });
            });
            describe("WHEN two elements of the list are changed", () => {
                beforeEach(() => {
                    spyOn(vm.parentCellListVm, "getChangedItems").and.returnValue([parentCellVm]);
                    spyOn(vm.subCellListVm, "getChangedItems").and.returnValue([subCellVm]);
                    specHelper.general.raiseEvent(vm.parentCellListVm, "hasChanged", null);
                });
                it("THEN saveAction.isEnabled = false", () => {
                    expect(vm.screenInfo.actions[1].isEnabled).toBeTruthy();
                    expect(vm.screenInfo.actions[1].isVisible).toBeTruthy();
                });
            });
        });

        describe("WHEN method actionClickedHandler is called", () => {
            let callback: jasmine.Spy;
            beforeEach(() => {
                callback = jasmine.createSpy("callback");

                spiedCurrentProject.UserAccessRight.CanConfig = true;
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.returnValue(true);
                vm = new ap.viewmodels.projects.ProjectRoomConfigViewModel(Utility, $q, $mdDialog, Api, ControllersManager, ServicesManager, $timeout);
                vm.on("editmodechanged", callback, this);
            });
            describe("WHEN action is rooms.edit", () => {
                beforeEach(() => {
                    specHelper.general.raiseEvent(vm.screenInfo, "actionclicked", vm.screenInfo.actions[0].name);
                });
                it("THEN vm.screenInfo.isEditMode = true", () => {
                    expect(vm.screenInfo.isEditMode).toEqual(true);
                });
                it("THEN parentCellListVm.useCacheSystem = true", () => {
                    expect(vm.parentCellListVm.useCacheSystem).toEqual(true);
                });
                it("THEN subCellListVm.useCacheSystem = true", () => {
                    expect(vm.subCellListVm.useCacheSystem).toEqual(true);
                });
                it("THEN editmodechanged has been raised", () => {
                    expect(callback).toHaveBeenCalled();
                });
                it("THEN the visibility of button is changed", () => {
                    expect(vm.screenInfo.actions[0].isVisible).toBeFalsy();
                    expect(vm.screenInfo.actions[0].isEnabled).toBeFalsy();
                    expect(vm.screenInfo.actions[1].isVisible).toBeTruthy();
                    expect(vm.screenInfo.actions[1].isEnabled).toBeFalsy();
                    expect(vm.screenInfo.actions[2].isVisible).toBeTruthy();
                    expect(vm.screenInfo.actions[2].isEnabled).toBeTruthy();
                });
            });
            describe("WHEN action is rooms.save", () => {
                beforeEach(() => {
                    spyOn(vm, "save");
                    specHelper.general.raiseEvent(vm.screenInfo, "actionclicked", vm.screenInfo.actions[0].name);
                    specHelper.general.raiseEvent(vm.screenInfo, "actionclicked", vm.screenInfo.actions[1].name);
                });
                it("THEN save method is called", () => {
                    expect(vm.save).toHaveBeenCalled();
                });
            });
            describe("WHEN action is rooms.cancel", () => {
                beforeEach(() => {
                    spyOn(vm, "cancel");
                    specHelper.general.raiseEvent(vm.screenInfo, "actionclicked", vm.screenInfo.actions[0].name);
                    specHelper.general.raiseEvent(vm.screenInfo, "actionclicked", vm.screenInfo.actions[2].name);
                });
                it("THEN vm.screenInfo.isEditMode = false", () => {
                    expect(vm.cancel).toHaveBeenCalled();
                });
            });
        });
    });

    describe("Feature: Save", () => {

        let vm: ap.viewmodels.projects.ProjectRoomConfigViewModel;
        let callback: jasmine.Spy;
        let editModeCallback: jasmine.Spy;
        let projectRoomModificationParentCell: ap.models.custom.ProjectRoomModification;
        let projectRoomModificationSubCell: ap.models.custom.ProjectRoomModification;
        beforeEach(() => {
            spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake((moduleCode: string) => {
                if (moduleCode === "PROJECT_ROOM_CONFIG") {
                    return true;
                }
            });

            vm = new ap.viewmodels.projects.ProjectRoomConfigViewModel(Utility, $q, $mdDialog, Api, ControllersManager, ServicesManager, $timeout);

            callback = jasmine.createSpy("callback");
            vm.on("editmodechanged", callback, vm);

            spyOn(vm.parentCellListVm, "specifyIds");

            let parentCell1: ap.models.projects.ParentCell = new ap.models.projects.ParentCell(Utility);
            let parentCell2: ap.models.projects.ParentCell = new ap.models.projects.ParentCell(Utility);
            parentCell2.createByJson({ Code: "a", Id: "2" });
            let parentCell3: ap.models.projects.ParentCell = new ap.models.projects.ParentCell(Utility);

            let subCell1: ap.models.projects.SubCell = new ap.models.projects.SubCell(Utility);
            subCell1.ParentCell = parentCell1;
            let subCell2: ap.models.projects.SubCell = new ap.models.projects.SubCell(Utility);
            subCell2.createByJson({ Code: "a", ParentCell: parentCell3, Id: "3" });

            projectRoomModificationParentCell = new ap.models.custom.ProjectRoomModification(Utility, "1", [parentCell1, parentCell2], [], ["2"], []);
            projectRoomModificationSubCell = new ap.models.custom.ProjectRoomModification(Utility, "1", [], [subCell1, subCell2], [], ["3"]);
            let resultProjectRoomModification: ap.models.custom.ProjectRoomModification = new ap.models.custom.ProjectRoomModification(Utility, "1", [parentCell1, parentCell2], [subCell1, subCell2], ["2"], ["3"]);

            let def: any = $q.defer();
            spyOn(Api, "getApiResponse").and.returnValue(def.promise);
            vm.load();

            let dic: Dictionary<string, string[]> = new Dictionary<string, string[]>();
            dic.add(parentCell3.Id, []);
            dic.add(parentCell1.Id, [subCell1.Id]);
            let parentCellVm: ap.viewmodels.projects.ParentCellViewModel = new ap.viewmodels.projects.ParentCellViewModel(Utility);
            parentCellVm.init(parentCell2);
            specHelper.general.raiseEvent(vm.parentCellListVm, "iteminserted", new ap.viewmodels.ItemInsertedEvent(0, <ap.viewmodels.IEntityViewModel>parentCellVm));
            parentCellVm.init(parentCell3);
            specHelper.general.raiseEvent(vm.parentCellListVm, "iteminserted", new ap.viewmodels.ItemInsertedEvent(0, <ap.viewmodels.IEntityViewModel>parentCellVm));
            let defResponse: angular.IDeferred<any> = $q.defer();

            spyOn(ControllersManager.projectController, "updateProjectRoom").and.returnValue(defResponse.promise);
            spyOn(ControllersManager.mainController, "showConfirm").and.callFake(function (message, title, callback) {
                callback(ap.controllers.MessageResult.Positive);
            });

            spyOn(vm, "load").and.callThrough();
            editModeCallback = jasmine.createSpy("editModeCallback");
            vm.on("editmodechanged", editModeCallback, this);

            vm.save();
            defResponse.resolve(resultProjectRoomModification);
            $rootScope.$apply();
        });

        describe("WHEN save method is called with elements to save", () => {
            beforeEach(() => {
                spyOn(vm.parentCellListVm, "postChange").and.returnValue(projectRoomModificationParentCell);
                spyOn(vm.subCellListVm, "postChange").and.returnValue(projectRoomModificationSubCell);
            });
            it("THEN vm.screenInfo.isEditMode = false", () => {
                expect(vm.screenInfo.isEditMode).toBeFalsy();
            });
            it("THEN parentCellListVm.useCacheSystem = false", () => {
                expect(vm.parentCellListVm.useCacheSystem).toBeFalsy();
            });
            it("THEN subCellListVm.useCacheSystem = false", () => {
                expect(vm.subCellListVm.useCacheSystem).toBeFalsy();
            });

            it("THEN editmodechanged has been raised", () => {
                expect(callback).toHaveBeenCalled();
            });
            it("THEN specifyIds has been called with correct value", () => {
                expect(vm.load).toHaveBeenCalled();
            });
            it("THEN, the editmodechanged event is raised", () => {
                expect(editModeCallback).toHaveBeenCalled();
            });
            it("THEN, the actions buttons are updated", () => {
                expect(vm.screenInfo.actions[0].isVisible).toBeTruthy();
                expect(vm.screenInfo.actions[0].isEnabled).toBeTruthy();
                expect(vm.screenInfo.actions[1].isVisible).toBeFalsy();
                expect(vm.screenInfo.actions[1].isEnabled).toBeFalsy();
                expect(vm.screenInfo.actions[2].isVisible).toBeFalsy();
                expect(vm.screenInfo.actions[2].isEnabled).toBeFalsy();
            });
        });
        describe("WHEN save method is called with no element to save", () => {
            beforeEach(() => {
                spyOn(vm.parentCellListVm, "postChange");
                spyOn(vm.subCellListVm, "postChange");
            });
            it("THEN load is called", () => {
                expect(vm.load).toHaveBeenCalled();
            });
            it("THEN goToReadMode is called", () => {
                expect(callback).toHaveBeenCalled();
            });
        });
    });

    describe("Feature: Cancel", () => {

        let callback: jasmine.Spy;
        let vm: ap.viewmodels.projects.ProjectRoomConfigViewModel;

        beforeEach(() => {
            spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake((moduleCode: string) => {
                if (moduleCode === "PROJECT_ROOM_CONFIG") {
                    return true;
                }
            });

            vm = new ap.viewmodels.projects.ProjectRoomConfigViewModel(Utility, $q, $mdDialog, Api, ControllersManager, ServicesManager, $timeout);

            callback = jasmine.createSpy("callback");
            vm.on("editmodechanged", callback, vm);

            spyOn(vm.parentCellListVm, "specifyIds");

            let defResponse: angular.IDeferred<any> = $q.defer();
            spyOn(Api, "getApiResponse").and.returnValue(defResponse.promise);
            vm.load();
            defResponse.resolve(new ap.services.apiHelper.ApiResponse(tab));
            $rootScope.$apply();

            spyOn(vm.parentCellListVm, "cancel");
            spyOn(vm.subCellListVm, "cancel");

            spyOn(vm.subCellListVm, "specifyIds");
            spyOn(vm, "load");

            vm.cancel();
        });

        describe("WHEN cancel method is called", () => {
            it("THEN vm.screenInfo.isEditMode = false", () => {
                expect(vm.screenInfo.isEditMode).toEqual(false);
            });
            it("THEN parentCellListVm.useCacheSystem = false", () => {
                expect(vm.parentCellListVm.useCacheSystem).toEqual(false);
            });
            it("THEN subCellListVm.useCacheSystem = false", () => {
                expect(vm.subCellListVm.useCacheSystem).toEqual(false);
            });
            it("THEN editmodechanged has been raised", () => {
                expect(callback).toHaveBeenCalled();
            });
            it("THEN vm.parentCellListVm.specifyIds has been called", () => {
                expect(vm.parentCellListVm.specifyIds).toHaveBeenCalled();
            });
            it("THEN, parentCellListVm.cancel is called", () => {
                expect(vm.parentCellListVm.cancel).toHaveBeenCalled();
            });
            it("THEN, subcellListVm.cancel is called", () => {
                expect(vm.subCellListVm.cancel).toHaveBeenCalled();
            });
            it("THEN, parentCellListVm.selectedVm = null", () => {
                expect(vm.parentCellListVm.selectedViewModel).toEqual(null);
            });
            it("THEN, subcellListVm.specifyIds is called", () => {
                expect(vm.subCellListVm.specifyIds).toHaveBeenCalledWith([]);
            });
        });
    });

    describe("WHEN listPropertyChangedHandler is called", () => {

        let vm: ap.viewmodels.projects.ProjectRoomConfigViewModel;

        beforeEach(() => {
            let defProjectParentCells: angular.IDeferred<any> = $q.defer();
            let defProjectSubCells: angular.IDeferred<any> = $q.defer();
            let defResponse: angular.IDeferred<any> = $q.defer();
            let apiDataParentCell: angular.IDeferred<any> = $q.defer();
            let deferDataSubCell: angular.IDeferred<any> = $q.defer();
            let deferDataParentCell: angular.IDeferred<any> = $q.defer();

            let parentCell: ap.models.projects.ParentCell = new ap.models.projects.ParentCell(Utility);
            let subCell: ap.models.projects.SubCell = new ap.models.projects.SubCell(Utility);
            let parentCellVm: ap.viewmodels.projects.ParentCellViewModel = new ap.viewmodels.projects.ParentCellViewModel(Utility);
            parentCellVm.init(parentCell);
            let subCellVm: ap.viewmodels.projects.SubCellViewModel = new ap.viewmodels.projects.SubCellViewModel(Utility);
            subCellVm.init(subCell);

            vm = new ap.viewmodels.projects.ProjectRoomConfigViewModel(Utility, $q, $mdDialog, Api, ControllersManager, ServicesManager, $timeout);
            spyOn((<ParentCellListV>vm.parentCellListVm), "afterLoadPageSuccessHandler");
            spyOn((<ParentCellListV>vm.parentCellListVm), "checkForDuplicatedItems");
            spyOn((<SubCellListV>vm.subCellListVm), "checkForDuplicatedItems");
            spyOn(ServicesManager.projectService, "getProjectCells").and.callFake((parentCellIds: string[], pathToLoad: string, onlyPathToLoadData: boolean, isParentCell: boolean) => {
                if (isParentCell)
                    return defProjectParentCells.promise;
                else
                    return defProjectSubCells.promise;
            });

            let currentProj: ap.models.projects.Project = ControllersManager.mainController.currentProject();
            let options: ap.services.apiHelper.ApiOption = new ap.services.apiHelper.ApiOption();
            options.customParams.push(new ap.services.apiHelper.ApiCustomParam("projectId", currentProj.Id));
            options.customParams.push(new ap.services.apiHelper.ApiCustomParam("baseentityname", "parentcell"));
            spyOn(Api, "getApiResponse").and.returnValue(defResponse.promise);
            vm.load();
            defResponse.resolve(new ap.services.apiHelper.ApiResponse(tab));
            $rootScope.$apply();

            spyOn(Api, "getEntityList").and.callFake((entityName: string, filter?: string, pathToLoad?: string, sortOrder?: string, ids?: string[]) => {
                if (entityName === "ParentCell") return deferDataParentCell.promise;
                if (entityName === "SubCell") return deferDataSubCell.promise;
            });
            vm.parentCellListVm.loadNextPage();
            deferDataParentCell.resolve(new ap.services.apiHelper.ApiResponse(apiDataParentCell));
            deferDataSubCell.resolve(new ap.services.apiHelper.ApiResponse([
                {
                    Id: id2,
                    Code: "Code 0",
                    Description: "Desc0"
                },
                {
                    Id: id3,
                    Code: "Code 1",
                    Description: "Desc1"
                }
            ]));
            $rootScope.$apply();

            vm.parentCellListVm.selectedViewModel = parentCellVm;

            defProjectParentCells.resolve([]);
            defProjectSubCells.resolve([]);
            $rootScope.$apply();
        });
        describe("AND lists is valid", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.viewmodels.projects.SubCellListViewModel.prototype, "isValid", specHelper.PropertyAccessor.Get).and.returnValue(true);
                specHelper.general.spyProperty(ap.viewmodels.projects.ParentCellListViewModel.prototype, "isValid", specHelper.PropertyAccessor.Get).and.returnValue(true);
                spyOn(vm.parentCellListVm, "updateItemsActionsState");
                spyOn(vm.subCellListVm, "updateItemsActionsState");
                specHelper.general.raiseEvent(vm.parentCellListVm, "propertychanged", new ap.viewmodels.base.PropertyChangedEventArgs("isValid", "123", vm.parentCellListVm));
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.projects.SubCellListViewModel.prototype, "isValid", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.viewmodels.projects.ParentCellListViewModel.prototype, "isValid", specHelper.PropertyAccessor.Get);
            });
            it("THEN call updateItemsActionsState with true in all list", () => {
                expect(vm.subCellListVm.updateItemsActionsState).toHaveBeenCalledWith(true);
                expect(vm.parentCellListVm.updateItemsActionsState).toHaveBeenCalledWith(true);
            });
        });
        describe("AND lists is not valid", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.viewmodels.projects.SubCellListViewModel.prototype, "isValid", specHelper.PropertyAccessor.Get).and.returnValue(false);
                specHelper.general.spyProperty(ap.viewmodels.projects.ParentCellListViewModel.prototype, "isValid", specHelper.PropertyAccessor.Get).and.returnValue(false);
                spyOn(vm.parentCellListVm, "updateItemsActionsState");
                spyOn(vm.subCellListVm, "updateItemsActionsState");
                specHelper.general.raiseEvent(vm.parentCellListVm, "propertychanged", new ap.viewmodels.base.PropertyChangedEventArgs("isValid", "123", vm.parentCellListVm));
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.projects.SubCellListViewModel.prototype, "isValid", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.viewmodels.projects.ParentCellListViewModel.prototype, "isValid", specHelper.PropertyAccessor.Get);
            });
            it("THEN call updateItemsActionsState with false in all list", () => {
                expect(vm.subCellListVm.updateItemsActionsState).toHaveBeenCalledWith(false);
                expect(vm.parentCellListVm.updateItemsActionsState).toHaveBeenCalledWith(false);
            });
        });
    });

    describe("Feature: dipose", () => {

        let vm: ap.viewmodels.projects.ProjectRoomConfigViewModel;

        beforeEach(() => {
            spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake((moduleCode: string) => {
                if (moduleCode === "PROJECT_ROOM_CONFIG") {
                    return true;
                }
            });

            vm = new ap.viewmodels.projects.ProjectRoomConfigViewModel(Utility, $q, $mdDialog, Api, ControllersManager, ServicesManager, $timeout);

            spyOn(vm.parentCellListVm, "dispose");
            spyOn(vm.subCellListVm, "dispose");

            vm.dispose();
        });

        describe("WHEN dispose is called", () => {
            it("THEN, parentCellListVm.dispose is called", () => {
                expect(vm.parentCellListVm.dispose).toHaveBeenCalled();
            });

            it("THEN, subcellListVm.dispose is called", () => {
                expect(vm.subCellListVm.dispose).toHaveBeenCalled();
            });
        });
    });

    describe("Feature: import from excel", () => {
        let vm: ap.viewmodels.projects.ProjectRoomConfigViewModel;
        let testEntitiesData: ap.models.projects.ParentCell[];
        let testEntitySubCells1: ap.models.projects.SubCell[];
        let testEntitySubCells2: ap.models.projects.SubCell[];
        let deferDataParentCell: angular.IDeferred<any>;
        let deferIdsParentCell: angular.IDeferred<any>;
        beforeEach(() => {
            deferDataParentCell = $q.defer();
            deferIdsParentCell = $q.defer();

            spyOn(Api, "getEntityList").and.returnValue(deferDataParentCell.promise);
            spyOn(Api, "getEntityIds").and.returnValue(deferIdsParentCell.promise);
            deferIdsParentCell.resolve(new ap.services.apiHelper.ApiResponse([id2]));
            deferDataParentCell.resolve(new ap.services.apiHelper.ApiResponse([{
                Id: id2,
                Code: "Code 0",
                Description: "Desc0"
            }]));
            function getTestParentCell(code: string, description: string): ap.models.projects.ParentCell {
                let parentCell = new ap.models.projects.ParentCell(Utility);
                parentCell.Code = code;
                parentCell.Description = description;
                parentCell.SubCells = [];
                return parentCell;
            }
            function getTestSubCell(code: string, description: string) {
                let subCell = new ap.models.projects.SubCell(Utility);
                subCell.Code = code;
                subCell.Description = description;
                return subCell;
            }

            vm = new ap.viewmodels.projects.ProjectRoomConfigViewModel(Utility, $q, $mdDialog, Api, ControllersManager, ServicesManager, $timeout);
            testEntitiesData = new Array<ap.models.projects.ParentCell>(3);
            let testData1 = getTestParentCell("test-parent-code1", "test-parent-desc1");
            let testData2 = getTestParentCell("test-parent-code2", "test-parent-desc2");
            let testData3 = getTestParentCell("test-parent-code3", "test-parent-desc3");
            testEntitySubCells1 = [];
            testEntitySubCells2 = [];
            testEntitySubCells1.push(getTestSubCell("test-sub1-code1", "test-sub1-desc1"));
            testEntitySubCells1.push(getTestSubCell("test-sub1-code2", "test-sub1-desc2"));
            testEntitySubCells2.push(getTestSubCell("test-sub2-code1", "test-sub2-desc1"));
            
            testData1.SubCells = testData1.SubCells.concat(testEntitySubCells1);
            testData2.SubCells = testData2.SubCells.concat(testEntitySubCells2);
            testEntitiesData[0] = testData1;
            testEntitiesData[1] = testData2;
            testEntitiesData[2] = testData3;

            specHelper.general.spyProperty(ap.viewmodels.projects.ImportExcelViewModel.prototype, "importedData", specHelper.PropertyAccessor.Get).and.returnValue(testEntitiesData);
        });
        afterEach(() => {
            specHelper.general.offSpyProperty(ap.viewmodels.projects.ImportExcelViewModel.prototype, "importedData", specHelper.PropertyAccessor.Get);
        });
        describe("WHEN ScrenInfo's action import.excel is raised", () => {
            let insertSubItemSpy: jasmine.Spy;
            let insertParentItemSpy: jasmine.Spy;

            function getActionButtonByName(name): ap.viewmodels.home.ActionViewModel {
                if (!vm || !vm.screenInfo || !vm.screenInfo.actions) {
                    return null;
                }

                let actions = vm.screenInfo.actions;
                for (let i = 0, len = actions.length; i < len; i++) {
                    if (actions[i].name === name) {
                        return actions[i];
                    }
                }

                return null;
            }

            beforeEach(() => {
                vm.parentCellListVm.loadNextPage();
                $rootScope.$apply();
                insertSubItemSpy = spyOn(vm.subCellListVm, "insertImportedItem").and.callThrough();
                insertParentItemSpy = spyOn(vm.parentCellListVm, "insertImportedItem");
                specHelper.general.raiseEvent(vm.screenInfo, "actionclicked", "import.excel");
                (<any>$mdDialog["deferred"]).resolve();
                $rootScope.$apply();
            });

            it("THEN, go to the edit mode", () => {
                expect(vm.screenInfo.isEditMode).toBeTruthy();
            });
            it("THEN, parent cells list is filled with the parent cells data received from the import excel", () => {
                let vmAdded1 = (<ap.viewmodels.projects.ParentCellViewModel>insertParentItemSpy.calls.all()[0].args[0]);
                let vmAdded2 = (<ap.viewmodels.projects.ParentCellViewModel>insertParentItemSpy.calls.all()[1].args[0]);
                let vmAdded3 = (<ap.viewmodels.projects.ParentCellViewModel>insertParentItemSpy.calls.all()[2].args[0]);
                expect(insertParentItemSpy).toHaveBeenCalled();
                expect(insertParentItemSpy.calls.count()).toEqual(3);
                expect(vmAdded1.originalEntity.Id).toEqual(testEntitiesData[0].Id);
                expect(vmAdded1.parentCell.SubCells).toBeNull();
                expect(vmAdded2.originalEntity.Id).toEqual(testEntitiesData[1].Id);
                expect(vmAdded2.parentCell.SubCells).toBeNull();
                expect(vmAdded3.originalEntity.Id).toEqual(testEntitiesData[2].Id);
                expect(vmAdded3.parentCell.SubCells).toBeNull();
            });
            it("THEN, sub cells list is cleared", () => {
                expect(vm.subCellListVm.sourceItems.length).toEqual(0);
            });
            it("THEN, add sub cells to the lists's cache", () => {
                let vmAdded1 = (<ap.viewmodels.projects.SubCellViewModel>insertSubItemSpy.calls.all()[0].args[0]);
                let vmAdded2 = (<ap.viewmodels.projects.SubCellViewModel>insertSubItemSpy.calls.all()[1].args[0]);
                let vmAdded3 = (<ap.viewmodels.projects.SubCellViewModel>insertSubItemSpy.calls.all()[2].args[0]);
                expect(insertSubItemSpy).toHaveBeenCalled();
                expect(insertSubItemSpy.calls.count()).toEqual(3);
                expect(vmAdded1.originalEntity.Id).toEqual(testEntitySubCells1[0].Id);
                expect(vmAdded2.originalEntity.Id).toEqual(testEntitySubCells1[1].Id);
                expect(vmAdded3.originalEntity.Id).toEqual(testEntitySubCells2[0].Id);
            });
            it("THEN, the 'Edit' action button is hidden", () => {
                let editActionButton = getActionButtonByName("rooms.edit");
                expect(editActionButton.isVisible).toBeFalsy();
            });
            it("THEN, the 'Save' action button is visible", () => {
                let saveActionButton = getActionButtonByName("rooms.save");
                expect(saveActionButton.isVisible).toBeTruthy();
            });
            it("THEN, the 'Save' action button is enabled", () => {
                let saveActionButton = getActionButtonByName("rooms.save");
                expect(saveActionButton.isEnabled).toBeTruthy();
            });
            it("THEN, the 'Cancel' action button is visible", () => {
                let cancelActionButton = getActionButtonByName("rooms.cancel");
                expect(cancelActionButton.isVisible).toBeTruthy();
            });
            it("THEN, the 'Cancel' action button is enabled", () => {
                let cancelActionButton = getActionButtonByName("rooms.cancel");
                expect(cancelActionButton.isEnabled).toBeTruthy();
            });
        });        
    });
});