describe("Module ap-viewmodels - projects - ProjectActionViewModel", () => {
    var Utility: ap.utility.UtilityHelper,
        MainController: ap.controllers.MainController,
        ProjectController: ap.controllers.ProjectController,
        project: ap.models.projects.Project,
        projectActionVM: ap.viewmodels.projects.ProjectActionViewModel;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject(function (_MainController_, _ProjectController_, _Utility_) {
        Utility = _Utility_;
        MainController = _MainController_;
        ProjectController = _ProjectController_;
        specHelper.userContext.stub(Utility);
        specHelper.utility.stubRootUrl(Utility);
    }));

    beforeEach(function () {
        project = new ap.models.projects.Project(Utility);
        project.Name = "My project";
        project.Code = "PR1";
        project.StartDate = new Date();
        project.EndDate = new Date();
        project.LogoUrl = "pr1.png";
        project.Address = "New York";
        project.ZipCode = "123123";
        project.UserAccessRight = new ap.models.accessRights.ProjectAccessRight(Utility);
        project.UserAccessRight.createByJson({
            CanEdit: true
        });
        project.Creator = new ap.models.actors.User(Utility);
        project.Creator.createByJson({
            Id: "test-user-id"
        });

        projectActionVM = new ap.viewmodels.projects.ProjectActionViewModel(Utility, MainController, ProjectController, project);
    });

    describe("Feature: constructor", () => {
        describe("WHEN the vm is created", () => {
            it("THEN, vm should be defined", () => {
                expect(projectActionVM).toBeDefined();
            });
            it("THEN, actions should contain 4 item", () => {
                expect(projectActionVM.actions.length).toBe(5);
            });
            it("THEN, action should be 'info'", () => {
                expect(projectActionVM.actions[0].name).toEqual("project.info");
            });
            it("THEN, action should be 'projectconfig'", () => {
                expect(projectActionVM.actions[1].name).toEqual("project.configure");
            });
            it("THEN, action should be 'projectarchive'", () => {
                expect(projectActionVM.actions[2].name).toEqual("project.archive");
            });
            it("THEN, action should be 'projectunarchive'", () => {
                expect(projectActionVM.actions[3].name).toEqual("project.unarchive");
            });
            it("THEN, action should be 'projectdelete'", () => {
                expect(projectActionVM.actions[4].name).toEqual("project.delete");
            });
        });
    });

    describe("Feature updateProject", () => {
        describe("WHEN updateProject is called", () => {
            beforeEach(() => {
                projectActionVM = new ap.viewmodels.projects.ProjectActionViewModel(Utility, MainController, ProjectController, project);
                project.Name = "Project updated";
                project.IsActive = false;
                projectActionVM.updateProject(project);
            });
            it("THEN, the project is updated", () => {
                expect(projectActionVM.project.Name).toEqual("Project updated");
            });
            it("THEN, computeActionsVisibility is called", () => {
                expect(projectActionVM.actions[2].isVisible).toBeFalsy();
            });
        });
    });

    describe("Feature: actionClick", () => {
        describe("WHEN actionClick called with project.info", () => {
            beforeEach(() => {
                spyOn(ProjectController, "showProjectInfo");
                projectActionVM.actionClick("project.info");
            });
            it("THEN, ProjectController.showProjectInfo should be called with good params", () => {
                expect(ProjectController.showProjectInfo).toHaveBeenCalledWith(projectActionVM.project);
            });
        });
        describe("WHEN actionClick called with project.configure", () => {
            beforeEach(() => {
                spyOn(MainController, "currentProject");
                projectActionVM.actionClick("project.configure");
            });
            it("THEN, MainController.currentProject should be called with good params", () => {
                expect(MainController.currentProject).toHaveBeenCalledWith(project, ap.controllers.MainFlow.ProjectConfig);
            });
        });
        describe("WHEN actionClick called with project.archive", () => {
            beforeEach(() => {
                spyOn(ProjectController, "archiveProject");
                projectActionVM.actionClick("project.archive");
            });
            it("THEN, ProjectController.changeProjectArchiveFlag should be called with good params", () => {
                expect(ProjectController.archiveProject).toHaveBeenCalledWith(project);
            });
        });
        describe("WHEN actionClick called with project.unarchive", () => {
            beforeEach(() => {
                spyOn(ProjectController, "unarchiveProject");
                projectActionVM.actionClick("project.unarchive");
            });
            it("THEN, ProjectController.changeProjectArchiveFlag should be called with good params", () => {
                expect(ProjectController.unarchiveProject).toHaveBeenCalledWith(project);
            });
        });
        describe("WHEN actionClick called with project.delete", () => {
            beforeEach(() => {
                spyOn(ProjectController, "deleteProject");
                projectActionVM.actionClick("project.delete");
            });
            it("THEN, ProjectController.deleteProject should be called with good params", () => {
                expect(ProjectController.deleteProject).toHaveBeenCalledWith(project);
            });
        });
    });

    describe("Featuer: computeActionInfoVisibility", () => {
        describe("WHEN withInfo is set to false", () => {
            beforeEach(() => {
                projectActionVM = new ap.viewmodels.projects.ProjectActionViewModel(Utility, MainController, ProjectController, project);
                projectActionVM.withInfo = false;
            });
            it("THEN, project.info.isVisible = false", () => {
                expect(projectActionVM.actions[0].isVisible).toBeFalsy();
            });
            it("THEN, project.info.isEnabled = false", () => {
                expect(projectActionVM.actions[0].isEnabled).toBeFalsy();
            });
        });
        describe("WHEN withInfo is set to true", () => {
            beforeEach(() => {
                projectActionVM = new ap.viewmodels.projects.ProjectActionViewModel(Utility, MainController, ProjectController, project, false);
                projectActionVM.withInfo = true;
            });
            it("THEN, project.info.isVisible = false", () => {
                expect(projectActionVM.actions[0].isVisible).toBeTruthy();
            });
            it("THEN, project.info.isEnabled = false", () => {
                expect(projectActionVM.actions[0].isEnabled).toBeTruthy();
            });
        });
        describe("WHEN the project is deleted", () => {
            beforeEach(() => {
                project.delete();

                projectActionVM = new ap.viewmodels.projects.ProjectActionViewModel(Utility, MainController, ProjectController, project);
            });
            it("THEN, project.info.isVisible = false", () => {
                expect(projectActionVM.actions[0].isVisible).toBeFalsy();
            });
            it("THEN, project.info.isEnabled = false", () => {
                expect(projectActionVM.actions[0].isEnabled).toBeFalsy();
            });
        });
        describe("WHEN the project is not deleted", () => {
            beforeEach(() => {
                projectActionVM = new ap.viewmodels.projects.ProjectActionViewModel(Utility, MainController, ProjectController, project);
            });
            it("THEN, project.info.isVisible = false", () => {
                expect(projectActionVM.actions[0].isVisible).toBeTruthy();
            });
            it("THEN, project.info.isEnabled = false", () => {
                expect(projectActionVM.actions[0].isEnabled).toBeTruthy();
            });
        });
    });

    describe("Featuer: computeActionsVisibility", () => {
        describe("WHEN the project is deleted", () => {
            beforeEach(() => {
                project.delete();
                projectActionVM = new ap.viewmodels.projects.ProjectActionViewModel(Utility, MainController, ProjectController, project);
            });
            
            it("THEN, project.configure.isVisible = false", () => {
                expect(projectActionVM.actions[1].isVisible).toBeFalsy();
            });
            it("THEN, project.configure.isEnabled = false", () => {
                expect(projectActionVM.actions[1].isEnabled).toBeFalsy();
            });
            it("THEN, project.archive.isVisible = false", () => {
                expect(projectActionVM.actions[2].isVisible).toBeFalsy();
            });
            it("THEN, project.archive.isEnabled = false", () => {
                expect(projectActionVM.actions[2].isEnabled).toBeFalsy();
            });
            it("THEN, project.unarchive.isVisible = false", () => {
                expect(projectActionVM.actions[3].isVisible).toBeFalsy();
            });
            it("THEN, project.unarchive.isEnabled = false", () => {
                expect(projectActionVM.actions[3].isEnabled).toBeFalsy();
            });
            it("THEN, project.delete.isVisible = false", () => {
                expect(projectActionVM.actions[4].isVisible).toBeFalsy();
            });
            it("THEN, project.delete.isEnabled = false", () => {
                expect(projectActionVM.actions[4].isEnabled).toBeFalsy();
            });
        });            
        describe("WHEN a computeActionsVisibility called and Project.UserAccessRight.CanEdit = true", () => {
            describe("WHEN the project is active", () => {
                beforeEach(() => {
                    project.UserAccessRight.CanEdit = true;
                    project.IsActive = true;
                    projectActionVM = new ap.viewmodels.projects.ProjectActionViewModel(Utility, MainController, ProjectController, project);
                });
                it("THEN, project.configure.isVisible = true", () => {
                    expect(projectActionVM.actions[1].isVisible).toBeTruthy();
                });
                it("THEN, project.configure.isEnabled = true", () => {
                    expect(projectActionVM.actions[1].isEnabled).toBeTruthy();
                });
                it("THEN, project.archive.isVisible = true", () => {
                    expect(projectActionVM.actions[2].isVisible).toBeTruthy();
                });
                it("THEN, project.archive.isEnabled = true", () => {
                    expect(projectActionVM.actions[2].isEnabled).toBeTruthy();
                });
                it("THEN, project.unarchive.isVisible = false", () => {
                    expect(projectActionVM.actions[3].isVisible).toBeFalsy();
                });
                it("THEN, project.unarchive.isEnabled = false", () => {
                    expect(projectActionVM.actions[3].isEnabled).toBeFalsy();
                });
                it("THEN, project.delete.isVisible = true", () => {
                    expect(projectActionVM.actions[4].isVisible).toBeTruthy();
                });
                it("THEN, project.delete.isEnabled = false", () => {
                    expect(projectActionVM.actions[4].isEnabled).toBeFalsy();
                });
                describe("WHEN a user is a creator of the project", () => {
                    beforeEach(() => {
                        project.Creator = Utility.UserContext.CurrentUser();
                        projectActionVM = new ap.viewmodels.projects.ProjectActionViewModel(Utility, MainController, ProjectController, project);
                    });
                    it("THEN, project.delete.isEnabled = true", () => {
                        expect(projectActionVM.actions[4].isEnabled).toBeTruthy();
                    });
                });
            });
            describe("WHEN the project is NOT active", () => {
                beforeEach(() => {
                    project.UserAccessRight.CanEdit = true;
                    project.IsActive = false;
                    projectActionVM = new ap.viewmodels.projects.ProjectActionViewModel(Utility, MainController, ProjectController, project);
                });
                it("THEN, project.configure.isVisible = true", () => {
                    expect(projectActionVM.actions[1].isVisible).toBeTruthy();
                });
                it("THEN, project.configure.isEnabled = true", () => {
                    expect(projectActionVM.actions[1].isEnabled).toBeTruthy();
                });
                it("THEN, project.archive.isVisible = false", () => {
                    expect(projectActionVM.actions[2].isVisible).toBeFalsy();
                });
                it("THEN, project.archive.isEnabled = false", () => {
                    expect(projectActionVM.actions[2].isEnabled).toBeFalsy();
                });
                it("THEN, project.unarchive.isVisible = true", () => {
                    expect(projectActionVM.actions[3].isVisible).toBeTruthy();
                });
                it("THEN, project.unarchive.isEnabled = true", () => {
                    expect(projectActionVM.actions[3].isEnabled).toBeTruthy();
                });
                it("THEN, project.delete.isVisible = true", () => {
                    expect(projectActionVM.actions[4].isVisible).toBeTruthy();
                });
                it("THEN, project.delete.isEnabled = false", () => {
                    expect(projectActionVM.actions[4].isEnabled).toBeFalsy();
                });
            });
        });
        describe("WHEN a computeActionsVisibility called and Project.UserAccessRight.CanEdit = false", () => {
            describe("WHEN the project is active", () => {
                beforeEach(() => {
                    project.UserAccessRight.CanEdit = false;
                    project.IsActive = true;
                    projectActionVM = new ap.viewmodels.projects.ProjectActionViewModel(Utility, MainController, ProjectController, project);
                });
                it("THEN, project.configure.isVisible = true", () => {
                    expect(projectActionVM.actions[1].isVisible).toBeTruthy();
                });
                it("THEN, project.configure.isEnabled = false", () => {
                    expect(projectActionVM.actions[1].isEnabled).toBeFalsy();
                });
                it("THEN, project.archive.isVisible = true", () => {
                    expect(projectActionVM.actions[2].isVisible).toBeTruthy();
                });
                it("THEN, project.archive.isEnabled = false", () => {
                    expect(projectActionVM.actions[2].isEnabled).toBeFalsy();
                });
                it("THEN, project.unarchive.isVisible = false", () => {
                    expect(projectActionVM.actions[3].isVisible).toBeFalsy();
                });
                it("THEN, project.unarchive.isEnabled = false", () => {
                    expect(projectActionVM.actions[3].isEnabled).toBeFalsy();
                });
                it("THEN, project.delete.isVisible = true", () => {
                    expect(projectActionVM.actions[4].isVisible).toBeTruthy();
                });
                it("THEN, project.delete.isEnabled = false", () => {
                    expect(projectActionVM.actions[4].isEnabled).toBeFalsy();
                });
            });
            describe("WHEN the project is NOT active", () => {
                beforeEach(() => {
                    project.UserAccessRight.CanEdit = false;
                    project.IsActive = false;
                    projectActionVM = new ap.viewmodels.projects.ProjectActionViewModel(Utility, MainController, ProjectController, project);
                });
                it("THEN, project.configure.isVisible = true", () => {
                    expect(projectActionVM.actions[1].isVisible).toBeTruthy();
                });
                it("THEN, project.configure.isEnabled = false", () => {
                    expect(projectActionVM.actions[1].isEnabled).toBeFalsy();
                });
                it("THEN, project.archive.isVisible = false", () => {
                    expect(projectActionVM.actions[2].isVisible).toBeFalsy();
                });
                it("THEN, project.archive.isEnabled = false", () => {
                    expect(projectActionVM.actions[2].isEnabled).toBeFalsy();
                });
                it("THEN, project.unarchive.isVisible = true", () => {
                    expect(projectActionVM.actions[3].isVisible).toBeTruthy();
                });
                it("THEN, project.unarchive.isEnabled = false", () => {
                    expect(projectActionVM.actions[3].isEnabled).toBeFalsy();
                });
                it("THEN, project.delete.isVisible = true", () => {
                    expect(projectActionVM.actions[4].isVisible).toBeTruthy();
                });
                it("THEN, project.delete.isEnabled = false", () => {
                    expect(projectActionVM.actions[4].isEnabled).toBeFalsy();
                });
            });
        });
    });
    //describe("Feature: toggleRight", () => {
    //    describe("WHEN, toggleRight is called", () => {
    //        beforeEach(() => {
    //            project.UserAccessRight.CanEdit = true;
    //            project.IsActive = true;
    //            projectActionVM = new ap.viewmodels.projects.ProjectActionViewModel(Utility, MainController, ProjectController, project);
    //            projectActionVM.toggleRight();
    //        });
    //        it("THEN, check _isProjectInfoOpened property must be true", () => {
    //            expect(projectActionVM.isProjectInfoOpened).toBeTruthy();
    //        });
    //    });
    //});
}); 