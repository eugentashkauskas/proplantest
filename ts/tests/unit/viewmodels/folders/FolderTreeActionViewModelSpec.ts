describe("Module ap-viewmodels - foldersTreeAction", () => {
    
    let ControllersManager: ap.controllers.ControllersManager, Utility: ap.utility.UtilityHelper, UserContext: ap.utility.UserContext;
    let vm: ap.viewmodels.folders.FolderTreeActionViewModel;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject(function (_Utility_, _ControllersManager_) {
        ControllersManager = _ControllersManager_;
        Utility = _Utility_;
        let project = new ap.models.projects.Project(Utility)
        project.createByJson(
            {
                UserAccessRight: {
                    CanAddFolder: true
                }
            });
        spyOn(ControllersManager.mainController, "currentProject").and.returnValue(project);
    }));

    describe("Feature constructor", () => {
        describe("WHEN foldersTreeAction is init", () => {
            beforeEach(() => {
                specHelper.userContext.stub(Utility);
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake((moduleName) => {
                    if (moduleName === ap.models.licensing.Module.Module_DocStructExportExcel) return true;
                    if (moduleName === ap.models.licensing.Module.Module_ProjectStructure) return true;
                    if (moduleName === ap.models.licensing.Module.Module_VisibilityManagement) return true;
                    return false;
                });
                vm = new ap.viewmodels.folders.FolderTreeActionViewModel(Utility, ControllersManager);
            });
            it("THEN, there are 4 actions", () => {
                expect(vm.actions.length).toEqual(4);
            });
            it("THEN, 1st action is Export excel", () => {
                expect(vm.actions[0].name).toEqual("foldertree.exportexcel");
            });
            it("THEN, exportexcel action is visible", () => {
                expect(vm.actions[0].isVisible).toBeTruthy();
            });
            it("THEN, exportexcel action is enabled", () => {
                expect(vm.actions[0].isEnabled).toBeTruthy();
            });
            it("THEN, 2nd action is importstructure", () => {
                expect(vm.actions[1].name).toEqual("foldertree.importstructure");
            });
            it("THEN, importstructure action is visible", () => {
                expect(vm.actions[1].isVisible).toBeTruthy();
            });
            it("THEN, importstructure action is enabled", () => {
                expect(vm.actions[1].isEnabled).toBeTruthy();
            });
            it("THEN, 3rd action is expand all", () => {
                expect(vm.actions[2].name).toEqual("foldertree.expandall");
            });
            it("THEN, expandall action is visible", () => {
                expect(vm.actions[2].isVisible).toBeTruthy();
            });
            it("THEN, expandall action is not enabled", () => {
                expect(vm.actions[2].isEnabled).toBeFalsy();
            });
            it("THEN, 4th action is collapse all", () => {
                expect(vm.actions[3].name).toEqual("foldertree.collapseall");
            });
            it("THEN, exportexcel action is visible", () => {
                expect(vm.actions[3].isVisible).toBeTruthy();
            });
            it("THEN, exportexcel action is not enabled", () => {
                expect(vm.actions[3].isEnabled).toBeFalsy();
            });
        });
    });
    describe("Feature actionClick", () => {
        let action: ap.viewmodels.home.ActionViewModel;
        let callback: jasmine.Spy;
        beforeEach(() => {
            specHelper.userContext.stub(Utility);
            spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.returnValue(true);
            callback = jasmine.createSpy("callback");
        });
        describe("WHEN actionclick is called with correct action", () => {
            beforeEach(() => {
                vm = new ap.viewmodels.folders.FolderTreeActionViewModel(Utility, ControllersManager);
            });
            describe("WHEN actionclick is called with foldertree.exportexcel", () => {
                beforeEach(() => {
                    spyOn(ControllersManager.reportController, "exportFolderStructure");
                    vm.actionClick("foldertree.exportexcel");
                });
                it("THEN, exportFolderStructure is called", () => {
                    expect(ControllersManager.reportController.exportFolderStructure).toHaveBeenCalled();
                });
            });
            describe("WHEN actionclick is called with foldertree.importstructure", () => {
                beforeEach(() => {
                    vm.on("importstructurefromproject", callback, this);
                    vm.actionClick("foldertree.importstructure");
                });
                it("THEN, event importstructurefromproject is raised", () => {
                    expect(callback).toHaveBeenCalled();
                });
            });
            describe("WHEN actionclick is called with foldertree.collapseall", () => {
                beforeEach(() => {
                    vm.on("collapseall", callback, this);
                    vm.actionClick("foldertree.collapseall");
                });
                it("THEN, event collapseall is raised", () => {
                    expect(callback).toHaveBeenCalled();
                });
            });
            describe("WHEN actionclick is called with foldertree.expandall", () => {
                beforeEach(() => {
                    vm.on("expandall", callback, this);
                    vm.actionClick("foldertree.expandall");
                });
                it("THEN, event expandallis raised", () => {
                    expect(callback).toHaveBeenCalled();
                });
            });
        });
        describe("WHEN actionclick is called with incorrect action", () => {
            beforeEach(() => {
                vm = new ap.viewmodels.folders.FolderTreeActionViewModel(Utility, ControllersManager);
            });
            describe("WHEN the action is null", () => {
                it("THEN, error is throw", () => {
                    expect(() => {
                        vm.actionClick(null);
                    }).toThrowError("The 'null' action does not exist");
                });
            });
            describe("WHEN the action is not valid", () => {
                it("THEN, error is throw", () => {
                    expect(() => {
                        vm.actionClick("urgentnote");
                    }).toThrowError("The 'urgentnote' action does not exist");
                });
            });
        });
    });
});