describe("Module ap-viewmodels - foldersItemAction", () => {

    let nmp = ap.viewmodels.notes;
    let MainController: ap.controllers.MainController, ProjectController: ap.controllers.ProjectController, ReportController: ap.controllers.ReportController, Utility: ap.utility.UtilityHelper, Api: ap.services.apiHelper.Api, UserContext: ap.utility.UserContext, UIStateController: ap.controllers.UIStateController;
    let DocumentController: ap.controllers.DocumentController;
    let $controller: angular.IControllerService, $rootScope: angular.IRootScopeService, $scope: angular.IScope, _deferred: angular.IDeferred<ap.services.apiHelper.ApiResponse>,
        $q: angular.IQService, $timeout: angular.ITimeoutService, $compile: angular.ICompileService; let FolderService: ap.services.FolderService;
    let vm: ap.viewmodels.folders.FolderItemActionViewModel;
    let project: ap.models.projects.Project;
    let action: ap.viewmodels.home.ActionViewModel;
    let folder: ap.models.projects.Folder;
    let json: any;
    let hasLicenseProjectStructure: boolean;
    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject(function (_Utility_, _ProjectController_, _MainController_, _DocumentController_) {
        ProjectController = _ProjectController_;
        Utility = _Utility_;
        MainController = _MainController_;
        DocumentController = _DocumentController_;
    }));

    beforeEach(() => {
        hasLicenseProjectStructure = true;
        project = new ap.models.projects.Project(Utility);
        specHelper.userContext.stub(Utility);
        spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake((moduleName) => {
            if (moduleName === ap.models.licensing.Module.Module_ProjectStructure) return hasLicenseProjectStructure;
            return true;
        });
        json =
            {
                Name: 'Plans folder',
                ParentFolderId: "92ed37a5-b7f5-4f25-93c6-c3fb231b70fc",
                FolderType: '0',
                ImageUrl: "https://app.aproplan.com/folder/image.png",
                PlanNumber: 45,
                Id: "92ed37a5-b7f5-4f25-93c6-c3fb231b70ff",

                Creator: {
                    Id: "2"
                }
            };
    });

    describe("Feature constructor", () => {
        describe("WHEN foldersItemAction is init with true access right", () => {
            beforeEach(() => {
                let jsonProj: any =
                    {
                        Name: "My project",
                        IsActive: true,
                        UserAccessRight: {
                            CanEditFolder: true,
                            CanEditAllFolder: true,
                            CanAddFolder: true,
                            CanDeleteFolder: true
                        }
                    };

                project.createByJson(jsonProj);
                spyOn(MainController, "currentProject").and.returnValue(project);

                Utility.UserContext.CurrentUser().AllowSync = true;

                folder = new ap.models.projects.Folder(Utility);
                folder.createByJson(json);
                let folderItemVm = new ap.viewmodels.folders.FolderItemViewModel(Utility, $q);
                folderItemVm.init(folder);
                vm = new ap.viewmodels.folders.FolderItemActionViewModel(Utility, ProjectController, folderItemVm, MainController, DocumentController);
            });
            it("THEN, there are 2 action groups", () => {
                expect(vm.actionGroups).toBeDefined();
                expect(vm.actionGroups.length).toEqual(2);
            });
            it("THEN there are 2 actions in the 1st group and 6 actions in 2nd group", () => {
                expect(vm.actionGroups[0].actions.length).toEqual(2);
                expect(vm.actionGroups[1].actions.length).toEqual(6);
            });
            it("THEN, the 1st action of a 1st groups is 'Move up'", () => {
                expect(vm.actionGroups[0].actions[0].name).toEqual("folder.moveup");
            });
            it("THEN, the 2nd action of a 1st groups is 'Move up'", () => {
                expect(vm.actionGroups[0].actions[1].name).toEqual("folder.movedown");
            });

            it("THEN, 1st action of 2nd group is Add", () => {
                expect(vm.actionGroups[1].actions[0].name).toEqual("folder.add");
            });
            it("THEN, 2nd action of 2nd group is Edit", () => {
                expect(vm.actionGroups[1].actions[1].name).toEqual("folder.edit");
            });
            it("THEN, 3rd action of 2nd group is Synchronization", () => {
                expect(vm.actionGroups[1].actions[2].name).toEqual("folder.sync");
            });
            it("THEN, 4rd action of 2nd group is Synchronization", () => {
                expect(vm.actionGroups[1].actions[3].name).toEqual("folder.uploaddocument");
            });
            it("THEN, 5rd action of 2nd group is Synchronization", () => {
                expect(vm.actionGroups[1].actions[4].name).toEqual("folder.move");
            });
            it("THEN, 6th action is Delete", () => {
                expect(vm.actionGroups[1].actions[5].name).toEqual("folder.delete");
            });
            it("THEN, edit action is visible", () => {
                expect(vm.actionGroups[1].actions[0].isVisible).toBeTruthy();
            });
            it("THEN, edit action is enabled", () => {
                expect(vm.actionGroups[1].actions[0].isEnabled).toBeTruthy();
            });
            it("THEN, add action is visible", () => {
                expect(vm.actionGroups[1].actions[1].isVisible).toBeTruthy();
            });
            it("THEN, add action is enabled", () => {
                expect(vm.actionGroups[1].actions[1].isEnabled).toBeTruthy();
            });
            it("THEN, sync action is visible", () => {
                expect(vm.actionGroups[1].actions[2].isVisible).toBeTruthy();
            });
            it("THEN, sync action is enabled", () => {
                expect(vm.actionGroups[1].actions[2].isEnabled).toBeTruthy();
            });
            it("THEN, delete action is visible", () => {
                expect(vm.actionGroups[1].actions[5].isVisible).toBeTruthy();
            });
            it("THEN, delete action is enabled", () => {
                expect(vm.actionGroups[1].actions[5].isEnabled).toBeTruthy();
            });
        });

        describe("WHEN foldersItemAction is init with false acces right", () => {
            beforeEach(() => {
                let jsonProj: any =
                    {
                        Name: "My project",
                        IsActive: true,
                        UserAccessRight: {
                            CanEditFolder: false,
                            CanEditAllFolder: false,
                            CanAddFolder: false,
                            CanDeleteFolder: false
                        }
                    };
                Utility.UserContext.CurrentUser().AllowSync = false;

                project.createByJson(jsonProj);
                spyOn(MainController, "currentProject").and.returnValue(project);
                folder = new ap.models.projects.Folder(Utility);
                folder.createByJson(json);
                let folderItemVm = new ap.viewmodels.folders.FolderItemViewModel(Utility, $q);
                folderItemVm.init(folder);
                vm = new ap.viewmodels.folders.FolderItemActionViewModel(Utility, ProjectController, folderItemVm, MainController, DocumentController);
            });
            it("THEN, there are 6 actions", () => {
                expect(vm.actionGroups[1].actions.length).toEqual(6);
            });
            it("THEN, 1st action is Add", () => {
                expect(vm.actionGroups[1].actions[0].name).toEqual("folder.add");
            });
            it("THEN, 2nd action is Edit", () => {
                expect(vm.actionGroups[1].actions[1].name).toEqual("folder.edit");
            });
            it("THEN, 3rd action is Synchronization", () => {
                expect(vm.actionGroups[1].actions[2].name).toEqual("folder.sync");
            });
            it("THEN, 6th action is Delete", () => {
                expect(vm.actionGroups[1].actions[5].name).toEqual("folder.delete");
            });
            it("THEN, edit action is not visible", () => {
                expect(vm.actionGroups[1].actions[0].isVisible).toBeFalsy();
            });
            it("THEN, edit action is not enabled", () => {
                expect(vm.actionGroups[1].actions[0].isEnabled).toBeFalsy();
            });
            it("THEN, add action is not visible", () => {
                expect(vm.actionGroups[1].actions[1].isVisible).toBeFalsy();
            });
            it("THEN, add action is not enabled", () => {
                expect(vm.actionGroups[1].actions[1].isEnabled).toBeFalsy();
            });
            it("THEN, sync action is not visible", () => {
                expect(vm.actionGroups[1].actions[2].isVisible).toBeFalsy();
            });
            it("THEN, sync action is not enabled", () => {
                expect(vm.actionGroups[1].actions[2].isEnabled).toBeFalsy();
            });
            it("THEN, delete action is not visible", () => {
                expect(vm.actionGroups[1].actions[5].isVisible).toBeFalsy();
            });
            it("THEN, delete action is not enabled", () => {
                expect(vm.actionGroups[1].actions[5].isEnabled).toBeFalsy();
            });
        });
    });

    describe("Feature actionClick", () => {
        beforeEach(() => {
            let jsonProj: any =
                {
                    Name: "My project",
                    IsActive: true,
                    UserAccessRight: {
                        CanEditFolder: true,
                        CanEditAllFolder: true
                    }
                };

            project.createByJson(jsonProj);
            spyOn(MainController, "currentProject").and.returnValue(project);
            folder = new ap.models.projects.Folder(Utility);
            folder.createByJson(json);
        });

        describe("WHEN actionclick is called with correct action", () => {
            beforeEach(() => {
                let folderItemVm = new ap.viewmodels.folders.FolderItemViewModel(Utility, $q);
                folderItemVm.init(folder);
                vm = new ap.viewmodels.folders.FolderItemActionViewModel(Utility, ProjectController, folderItemVm, MainController, DocumentController);
            });
            describe("WHEN actionclick is called with folder.edit", () => {
                beforeEach(() => {
                    spyOn(ProjectController, "requestEditFolder");

                    action = new ap.viewmodels.home.ActionViewModel(Utility, Utility.EventTool, "folder.edit", Utility.rootUrl + "Images/html/icons/ic_create_black_48px.svg", false, null, "Edit", false);
                    vm.actionClick(action.name);
                });
                it("THEN, requestEditFolder is called", () => {
                    expect(ProjectController.requestEditFolder).toHaveBeenCalledWith(folder);
                });
            });
            describe("WHEN actionclick is called with folder.add", () => {
                beforeEach(() => {
                    spyOn(ProjectController, "requestAddFolder");

                    action = new ap.viewmodels.home.ActionViewModel(Utility, Utility.EventTool, "folder.add", Utility.rootUrl + "Images/html/icons/ic_create_black_48px.svg", false, null, "Add subfolder", false);
                    vm.actionClick(action.name);
                });
                it("THEN, requestAddFolder is called", () => {
                    expect(ProjectController.requestAddFolder).toHaveBeenCalledWith(folder);
                });
            });
            describe("WHEN actionclick is called with folder.sync", () => {
                beforeEach(() => {
                    spyOn(ProjectController, "syncChapoo");

                    vm.actionClick("folder.sync");
                });
                it("THEN, syncChapoo is called", () => {
                    expect(ProjectController.syncChapoo).toHaveBeenCalledWith(folder);
                });
            });
            describe("WHEN actionclick is called with folder.delete", () => {
                beforeEach(() => {
                    spyOn(ProjectController, "deleteFolder");

                    action = new ap.viewmodels.home.ActionViewModel(Utility, Utility.EventTool, "folder.delete", Utility.rootUrl + "Images/html/icons/ic_delete_black_48px.svg", false, null, "Delete folder", false);
                    vm.actionClick(action.name);
                });
                it("THEN, deleteFolder is called", () => {
                    expect(ProjectController.deleteFolder).toHaveBeenCalledWith(folder);
                });
            });
        });
        describe("WHEN actionclick is called with incorrect action", () => {
            beforeEach(() => {
                let folderItemVm = new ap.viewmodels.folders.FolderItemViewModel(Utility, $q);
                folderItemVm.init(folder);
                vm = new ap.viewmodels.folders.FolderItemActionViewModel(Utility, ProjectController, folderItemVm, MainController, DocumentController);
            });
            describe("WHEN the action is null", () => {
                it("THEN, error is throw", () => {
                    expect(() => {
                        vm.actionClick(null);
                    }).toThrowError("The action is null");
                });
            });
            describe("WHEN the action is not valid", () => {
                beforeEach(() => {
                    action = new ap.viewmodels.home.ActionViewModel(Utility, Utility.EventTool, "urgentnote", Utility.rootUrl + "Images/html/icons/ic_star_black_48px.svg", false, null, "Mark point as urgent", false);
                });
                it("THEN, error is throw", () => {
                    expect(() => {
                        vm.actionClick(action.name);
                    }).toThrowError("The 'urgentnote' action does not exist");
                });
            });
        });
    });
});