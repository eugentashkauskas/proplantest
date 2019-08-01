describe("Module ap-viewmodels - projects - ProjectStatusViewModel", () => {
    let Utility: ap.utility.UtilityHelper, ControllersManager: ap.controllers.ControllersManager, $q: angular.IQService, meetingAccessRight: ap.models.accessRights.MeetingAccessRight,
        Api: ap.services.apiHelper.Api, $timeout: angular.ITimeoutService, $mdDialog: angular.material.IDialogService;
    let ServicesManager: ap.services.ServicesManager;
    let MainController: ap.controllers.MainController;
    let hasProjectStatusConfig: boolean;
    let $rootScope: angular.IRootScopeService, $scope: angular.IScope;
    let currentProject: ap.models.projects.Project;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
        angular.mock.module("ap-controllers");
    });

    beforeEach(inject(function (_$rootScope_, _Utility_, _$q_, _ControllersManager_, _MainController_, _ServicesManager_) {
        Utility = _Utility_;
        ControllersManager = _ControllersManager_;
        ServicesManager = _ServicesManager_;
        $q = _$q_;
        MainController = _MainController_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();

        specHelper.userContext.stub(Utility);

        currentProject = new ap.models.projects.Project(Utility);
        currentProject.createByJson({
            Id: "b360cb6d-ca54-4b93-a564-a469274eb68a",
            Name: "Welcome Project",
            Address: "New York City"
        });

        currentProject.UserAccessRight = new ap.models.accessRights.ProjectAccessRight(Utility);
        currentProject.UserAccessRight.CanConfig = true;

        spyOn(MainController, "currentProject").and.returnValue(currentProject);

        hasProjectStatusConfig = true;

        spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake(function (moduleCode) {
            if (moduleCode === ap.models.licensing.Module.Module_ProjectStatusConfig)
                return hasProjectStatusConfig;
        });
    }));

    // spy Segment.IO calls
    beforeEach(() => {
        spyOn(ServicesManager.toolService, "sendEvent").and.returnValue($q.defer().promise);
    });

    let createVm = (selectedStatusId?: string) => {
        return new ap.viewmodels.projects.ProjectStatusViewModel(Utility, $q, ControllersManager, meetingAccessRight, Api, $mdDialog, ServicesManager, $timeout, selectedStatusId);
    };

    describe("Feature: ProjectStatusViewModel", () => {
        let meetingAccessRight: ap.models.accessRights.MeetingAccessRight;
        let vm: ap.viewmodels.projects.ProjectStatusViewModel;
        beforeEach(() => {
            meetingAccessRight = new ap.models.accessRights.MeetingAccessRight(Utility);
            meetingAccessRight.createByJson({
                ModuleName: 'Meeting',
                CanEdit: true,
                CanAddPoint: true,
                CanEditPoint: true,
                CanDeletePoint: true,
                CanEditPointStatus: true,
                CanAddComment: true,
                CanDeleteComment: true,
                CanArchiveComment: true,
                CanAddDoc: true,
                CanGenerateReport: true,
                CanCreateNextMeeting: true,
                CanEditAllPoint: true,
                CanViewOnlyPointInCharge: true
            });
            vm = createVm();
        });
        describe("WHEN the Constructor is called", () => {
            it("THEN the noteProjectStatusListVm is defined", () => {
                expect(vm.noteProjectStatusListVm).toBeDefined();
            });

            it("THEN, screenInfo existed", () => { expect(vm.screenInfo).toBeDefined(); });
            it("THEN, screenInfo with 4 actions", () => { expect(vm.screenInfo.actions.length).toEqual(4); });
            it("THEN, screenInfo isEditMode = false", () => { expect(vm.screenInfo.isEditMode).toBeFalsy(); });
            it("THEN, dragOptions isEnabled = false", () => { expect(vm.noteProjectStatusListVm.dragOptions.isEnabled).toBeFalsy(); });
            it("THEN, screenInfo type list", () => { expect(vm.screenInfo.sType).toEqual(ap.misc.ScreenInfoType.List); });

            it("THEN, screenInfo.actions[0] is status.edit", () => { expect(vm.screenInfo.actions[0].name).toEqual("status.edit"); });
            it("THEN, screenInfo.actions[0] is visible", () => { expect(vm.screenInfo.actions[0].isVisible).toBeTruthy(); });
            it("THEN, screenInfo.actions[0] is enabled", () => { expect(vm.screenInfo.actions[0].isEnabled).toBeTruthy(); });

            it("THEN, screenInfo.actions[1] is status.save", () => { expect(vm.screenInfo.actions[1].name).toEqual("status.save"); });
            it("THEN, screenInfo.actions[1] is NOT visible", () => { expect(vm.screenInfo.actions[1].isVisible).toBeFalsy(); });
            it("THEN, screenInfo.actions[1] is enabled", () => { expect(vm.screenInfo.actions[1].isEnabled).toBeTruthy(); });

            it("THEN, screenInfo.actions[2] is status.cancel", () => { expect(vm.screenInfo.actions[2].name).toEqual("status.cancel"); });
            it("THEN, screenInfo.actions[2] is NOT visible", () => { expect(vm.screenInfo.actions[2].isVisible).toBeFalsy(); });
            it("THEN, screenInfo.actions[2] is enabled", () => { expect(vm.screenInfo.actions[2].isEnabled).toBeTruthy(); });

            it("THEN, screenInfo.actions[3] is status.import", () => { expect(vm.screenInfo.actions[3].name).toEqual("status.import"); });
            it("THEN, screenInfo.actions[3] is NOT visible", () => { expect(vm.screenInfo.actions[3].isVisible).toBeTruthy(); });
            it("THEN, screenInfo.actions[3] is enabled", () => { expect(vm.screenInfo.actions[3].isEnabled).toBeTruthy(); });
        });

        describe("WHEN the Constructor is called and user dont have Module_ProjectStatusConfig in license", () => {
            beforeEach(() => {
                hasProjectStatusConfig = false;
                vm = createVm();
            });
            it("THEN the noteProjectStatusListVm is defined", () => {
                expect(vm.noteProjectStatusListVm).toBeDefined();
            });

            it("THEN, screenInfo existed", () => { expect(vm.screenInfo).toBeDefined(); });
            it("THEN, screenInfo with 4 actions", () => { expect(vm.screenInfo.actions.length).toEqual(4); });
            it("THEN, screenInfo isEditMode = false", () => { expect(vm.screenInfo.isEditMode).toBeFalsy(); });
            it("THEN, screenInfo type list", () => { expect(vm.screenInfo.sType).toEqual(ap.misc.ScreenInfoType.List); });

            it("THEN, screenInfo.actions[0] is status.edit", () => { expect(vm.screenInfo.actions[0].name).toEqual("status.edit"); });
            it("THEN, screenInfo.actions[0] is NOT visible", () => { expect(vm.screenInfo.actions[0].isVisible).toBeFalsy(); });
            it("THEN, screenInfo.actions[0] is enabled", () => { expect(vm.screenInfo.actions[0].isEnabled).toBeTruthy(); });

            it("THEN, screenInfo.actions[1] is status.save", () => { expect(vm.screenInfo.actions[1].name).toEqual("status.save"); });
            it("THEN, screenInfo.actions[1] is NOT visible", () => { expect(vm.screenInfo.actions[1].isVisible).toBeFalsy(); });
            it("THEN, screenInfo.actions[1] is enabled", () => { expect(vm.screenInfo.actions[1].isEnabled).toBeTruthy(); });

            it("THEN, screenInfo.actions[2] is status.cancel", () => { expect(vm.screenInfo.actions[2].name).toEqual("status.cancel"); });
            it("THEN, screenInfo.actions[2] is NOT visible", () => { expect(vm.screenInfo.actions[2].isVisible).toBeFalsy(); });
            it("THEN, screenInfo.actions[3] is enabled", () => { expect(vm.screenInfo.actions[2].isEnabled).toBeTruthy(); });

            it("THEN, screenInfo.actions[3] is status.import", () => { expect(vm.screenInfo.actions[3].name).toEqual("status.import"); });
            it("THEN, screenInfo.actions[3] is NOT visible", () => { expect(vm.screenInfo.actions[3].isVisible).toBeFalsy(); });
            it("THEN, screenInfo.actions[3] is enabled", () => { expect(vm.screenInfo.actions[3].isEnabled).toBeTruthy(); });
        });

        describe("WHEN the Constructor is called and user have Module_ProjectStatusConfig BUT dont have CanConfig access right", () => {
            beforeEach(() => {
                hasProjectStatusConfig = true;
                currentProject.UserAccessRight.CanConfig = false;
                vm = createVm();
            });
            it("THEN the noteProjectStatusListVm is defined", () => {
                expect(vm.noteProjectStatusListVm).toBeDefined();
            });

            it("THEN, screenInfo existed", () => { expect(vm.screenInfo).toBeDefined(); });
            it("THEN, screenInfo with 4 actions", () => { expect(vm.screenInfo.actions.length).toEqual(4); });
            it("THEN, screenInfo isEditMode = false", () => { expect(vm.screenInfo.isEditMode).toBeFalsy(); });
            it("THEN, screenInfo type list", () => { expect(vm.screenInfo.sType).toEqual(ap.misc.ScreenInfoType.List); });

            it("THEN, screenInfo.actions[0] is status.edit", () => { expect(vm.screenInfo.actions[0].name).toEqual("status.edit"); });
            it("THEN, screenInfo.actions[0] is visible", () => { expect(vm.screenInfo.actions[0].isVisible).toBeTruthy(); });
            it("THEN, screenInfo.actions[0] is NOT enabled", () => { expect(vm.screenInfo.actions[0].isEnabled).toBeFalsy(); });

            it("THEN, screenInfo.actions[1] is status.save", () => { expect(vm.screenInfo.actions[1].name).toEqual("status.save"); });
            it("THEN, screenInfo.actions[1] is NOT visible", () => { expect(vm.screenInfo.actions[1].isVisible).toBeFalsy(); });
            it("THEN, screenInfo.actions[1] is enabled", () => { expect(vm.screenInfo.actions[1].isEnabled).toBeTruthy(); });

            it("THEN, screenInfo.actions[2] is status.cancel", () => { expect(vm.screenInfo.actions[2].name).toEqual("status.cancel"); });
            it("THEN, screenInfo.actions[2] is NOT visible", () => { expect(vm.screenInfo.actions[2].isVisible).toBeFalsy(); });
            it("THEN, screenInfo.actions[3] is enabled", () => { expect(vm.screenInfo.actions[2].isEnabled).toBeTruthy(); });

            it("THEN, screenInfo.actions[3] is status.import", () => { expect(vm.screenInfo.actions[3].name).toEqual("status.import"); });
            it("THEN, screenInfo.actions[3] is NOT visible", () => { expect(vm.screenInfo.actions[3].isVisible).toBeTruthy(); });
            it("THEN, screenInfo.actions[3] is enabled", () => { expect(vm.screenInfo.actions[3].isEnabled).toBeFalsy(); });
        });


        describe("WHEN the method loadData is called", () => {
            let deferred: angular.IDeferred<any>;
            beforeEach(() => {
                deferred = $q.defer();
                spyOn(ControllersManager.projectController, "getNoteProjectStatusList").and.returnValue(deferred.promise);
                meetingAccessRight = new ap.models.accessRights.MeetingAccessRight(Utility);
                vm = createVm();
                vm.loadData();
            });
            it("THEN refresh is called", () => {
                expect(ControllersManager.projectController.getNoteProjectStatusList).toHaveBeenCalled();
            });
        });

        describe("Feature Switch to edit mode", () => {
            describe("When edit action click", () => {
                let callBack: jasmine.Spy;
                beforeEach(() => {
                    callBack = jasmine.createSpy("editmodechanged");
                    vm.on("editmodechanged", callBack, this);
                    specHelper.general.raiseEvent(vm.screenInfo, "actionclicked", "status.edit");
                });
                it("THEN, editmodechanged event raised", () => { expect(callBack).toHaveBeenCalled(); });
                it("THEN, screenInfo change to edit mode", () => { expect(vm.screenInfo.isEditMode).toBeTruthy(); });
                it("THEN, edit action is not visible any more", () => { expect(vm.screenInfo.actions[0].isVisible).toBeFalsy(); });
                it("THEN, save action is visible", () => { expect(vm.screenInfo.actions[1].isVisible).toBeTruthy(); });
                it("THEN, cancel action is visible", () => { expect(vm.screenInfo.actions[2].isVisible).toBeTruthy(); });
                it("THEN, drag and drop is enabled", () => { expect(vm.noteProjectStatusListVm.dragOptions.isEnabled).toBeTruthy(); });
            });
        });

        describe("Feature: addDraggable", () => {
            let draggableVm: ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel;
            beforeEach(() => {
                let draggableEntity = new ap.models.projects.NoteProjectStatus(Utility);
                draggableVm = new ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel(Utility);
                draggableVm.init(draggableEntity);
            });
            describe("WHEN we call addDraggable method with draggable entity", () => {
                let clearDraggableSpy: jasmine.Spy;
                beforeEach(() => {
                    clearDraggableSpy = spyOn(vm.noteProjectStatusListVm.dragOptions, "clearDraggable");
                    vm.noteProjectStatusListVm.addDraggable(draggableVm);
                })
                it("THEN, dragOptions draggable entities list will be cleaned", () => {
                    expect(clearDraggableSpy).toHaveBeenCalled();
                });
                it("THEN, draggable entity will be added to dragOptions", () => {
                    expect(vm.noteProjectStatusListVm.dragOptions.selectedData.length).toEqual(1);
                    expect(vm.noteProjectStatusListVm.dragOptions.selectedData[0]).toEqual(draggableVm);
                });
            });
        });

        describe("Feature Save action", () => {
            describe("When status name is NULL and call edit and save action click", () => {
                let callBack: jasmine.Spy;
                let dummyStatus: ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel;
                let saveDef: angular.IDeferred<any>;
                let refeshDef: angular.IDeferred<any>;

                beforeEach(() => {
                    dummyStatus = new ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel(Utility);
                    spyOn(dummyStatus, "postChanges");
                    spyOn(MainController, "showErrorKey");

                    saveDef = $q.defer<any>();
                    refeshDef = $q.defer<any>();
                    spyOn(ControllersManager.projectController, "saveNoteStatusList").and.returnValue(saveDef.promise);
                    spyOn(vm.noteProjectStatusListVm, "refresh").and.returnValue(refeshDef.promise);

                    vm.noteProjectStatusListVm.onLoadItems([dummyStatus]);
                    callBack = jasmine.createSpy("editmodechanged");
                    vm.on("editmodechanged", callBack, this);
                    specHelper.general.raiseEvent(vm.screenInfo, "actionclicked", "status.edit");
                    specHelper.general.raiseEvent(vm.screenInfo, "actionclicked", "status.save");

                    saveDef.resolve([]);
                    refeshDef.resolve([]);
                    $rootScope.$apply();
                });

                it("THEN, Error is shown", () => { expect(MainController.showErrorKey).toHaveBeenCalledWith("app.err.Status_InvalidData", "app.err.general_error", null, null); });
                it("THEN, status item.postChanges is NOT called", () => { expect(dummyStatus.postChanges).not.toHaveBeenCalled(); });
                it("THEN, projectController.saveNoteStatusList NOT called", () => { expect(ControllersManager.projectController.saveNoteStatusList).not.toHaveBeenCalled(); });
                it("THEN, editmodechanged event raised 1 times", () => { expect(callBack.calls.count()).toEqual(1); });

                it("THEN, screenInfo.isEditMode = true", () => { expect(vm.screenInfo.isEditMode).toBeTruthy(); });
                it("THEN, dragOptions.isEnabled = true", () => { expect(vm.noteProjectStatusListVm.dragOptions.isEnabled).toBeTruthy(); });

                it("THEN, edit action is NOT visible", () => { expect(vm.screenInfo.actions[0].isVisible).toBeFalsy(); });
                it("THEN, save action is visible", () => { expect(vm.screenInfo.actions[1].isVisible).toBeTruthy(); });
                it("THEN, cancel action is visible", () => { expect(vm.screenInfo.actions[2].isVisible).toBeTruthy(); });
            });

            describe("When call edit and save action click", () => {
                let callBack: jasmine.Spy;
                let dummyStatus: ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel;
                let saveDef: angular.IDeferred<any>;
                let refeshDef: angular.IDeferred<any>;
                beforeEach(() => {
                    dummyStatus = new ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel(Utility);
                    dummyStatus.name = "New Status";
                    spyOn(dummyStatus, "postChanges");

                    saveDef = $q.defer<any>();
                    refeshDef = $q.defer<any>();
                    spyOn(ControllersManager.projectController, "saveNoteStatusList").and.returnValue(saveDef.promise);
                    spyOn(vm.noteProjectStatusListVm, "refresh").and.returnValue(refeshDef.promise);

                    vm.noteProjectStatusListVm.onLoadItems([dummyStatus]);
                    callBack = jasmine.createSpy("editmodechanged");
                    vm.on("editmodechanged", callBack, this);
                    specHelper.general.raiseEvent(vm.screenInfo, "actionclicked", "status.edit");
                    specHelper.general.raiseEvent(vm.screenInfo, "actionclicked", "status.save");

                    saveDef.resolve([]);
                    refeshDef.resolve([]);
                    $rootScope.$apply();
                });
                it("THEN, status item have been called  postChanges", () => { expect(dummyStatus.postChanges).toHaveBeenCalled(); });
                it("THEN, projectController.saveNoteStatusList called", () => { expect(ControllersManager.projectController.saveNoteStatusList).toHaveBeenCalled(); });

                it("THEN, editmodechanged event raised 2 times", () => { expect(callBack.calls.count()).toEqual(2); });
                it("THEN, screenInfo change to edit mode = false", () => { expect(vm.screenInfo.isEditMode).toBeFalsy(); });
                it("THEN, drag and drop is disabled", () => { expect(vm.noteProjectStatusListVm.dragOptions.isEnabled).toBeFalsy(); });

                it("THEN, edit action is visible", () => { expect(vm.screenInfo.actions[0].isVisible).toBeTruthy(); });
                it("THEN, save action is NOT visible", () => { expect(vm.screenInfo.actions[1].isVisible).toBeFalsy(); });
                it("THEN, cancel action is NOT visible", () => { expect(vm.screenInfo.actions[2].isVisible).toBeFalsy(); });
            });

            describe("When call edit and cancel action click", () => {
                let callBack: jasmine.Spy;
                let dummyStatus: ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel;
                let refeshDef: angular.IDeferred<any>;
                beforeEach(() => {
                    dummyStatus = new ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel(Utility);
                    spyOn(dummyStatus, "postChanges");

                    spyOn(ControllersManager.projectController, "saveNoteStatusList");

                    vm.noteProjectStatusListVm.onLoadItems([dummyStatus]);
                    refeshDef = $q.defer<any>();
                    spyOn(vm.noteProjectStatusListVm, "refresh").and.returnValue(refeshDef.promise);

                    callBack = jasmine.createSpy("editmodechanged");
                    vm.on("editmodechanged", callBack, this);
                    specHelper.general.raiseEvent(vm.screenInfo, "actionclicked", "status.edit");
                    specHelper.general.raiseEvent(vm.screenInfo, "actionclicked", "status.cancel");

                    refeshDef.resolve([]);
                    $rootScope.$apply();
                });
                it("THEN, status item NOT have been called postChanges", () => { expect(dummyStatus.postChanges).not.toHaveBeenCalled(); });
                it("THEN, projectController.saveNoteStatusList NOT called", () => { expect(ControllersManager.projectController.saveNoteStatusList).not.toHaveBeenCalled(); });
                it("THEN, noteProjectStatusListVm.refresh is called", () => { expect(vm.noteProjectStatusListVm.refresh).toHaveBeenCalled(); });

                it("THEN, editmodechanged event raised 2 times", () => { expect(callBack.calls.count()).toEqual(2); });
                it("THEN, screenInfo change to edit mode = false", () => { expect(vm.screenInfo.isEditMode).toBeFalsy(); });
                it("THEN, drag and drop is disabled", () => { expect(vm.noteProjectStatusListVm.dragOptions.isEnabled).toBeFalsy(); });

                it("THEN, edit action is visible", () => { expect(vm.screenInfo.actions[0].isVisible).toBeTruthy(); });
                it("THEN, save action is NOT visible", () => { expect(vm.screenInfo.actions[1].isVisible).toBeFalsy(); });
                it("THEN, cancel action is NOT visible", () => { expect(vm.screenInfo.actions[2].isVisible).toBeFalsy(); });
            });
        });
    });
    describe("Feature: importStatus", () => {
        let noteProjectStatusList: ap.viewmodels.projects.noteProjectStatus.NoteProjectStatuslistViewModel;
        let statusVm1: ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel;
        let statusVm2: ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel;
        let statusVm3: ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel;
        let vm: ap.viewmodels.projects.ProjectStatusViewModel;
        beforeEach(() => {
            statusVm1 = new ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel(Utility);
            statusVm2 = new ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel(Utility);
            statusVm3 = new ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel(Utility);

            let status1: ap.models.projects.NoteProjectStatus = new ap.models.projects.NoteProjectStatus(Utility);
            status1.createByJson({
                Id: "a1989fce-db6a-4d2d-8830-08ebe8bbe49a"
            });
            status1.Code = "InProgress";
            status1.Name = "In progress";
            status1.Color = "#23def5";
            status1.IsOnlyUsedByMeetingManager = false;
            status1.IsTodo = true;
            status1.IsDone = false;
            status1.DoneAction = false;
            status1.IsDisabled = false;
            status1.DisplayOrder = 0;

            statusVm1.init(status1);

            let status2: ap.models.projects.NoteProjectStatus = new ap.models.projects.NoteProjectStatus(Utility);
            status2.createByJson({
                Id: "aaaaaaaa-db6a-4d2d-8830-08ebe8bbe49a"
            });
            status2.Code = "InProgress";
            status2.Name = "In progress";
            status2.Color = "#FFFFFF";
            status2.IsOnlyUsedByMeetingManager = true;
            status2.IsTodo = false;
            status2.IsDone = true;
            status2.DoneAction = false;
            status2.IsDisabled = false;
            status2.DisplayOrder = 1;

            statusVm2.init(status2);

            let status3: ap.models.projects.NoteProjectStatus = new ap.models.projects.NoteProjectStatus(Utility);
            status3.createByJson({
                Id: "bbbbbbbbe-db6a-4d2d-8830-08ebe8bbe49a"
            });
            status3.Code = null;
            status3.Name = "Custom";
            status3.Color = "#23def5";
            status3.IsOnlyUsedByMeetingManager = false;
            status3.IsTodo = false;
            status3.IsDone = true;
            status3.DoneAction = true;
            status3.IsDisabled = false;
            status3.DisplayOrder = 2;

            statusVm3.init(status3);

            vm = createVm();
            noteProjectStatusList = new ap.viewmodels.projects.noteProjectStatus.NoteProjectStatuslistViewModel(Utility, ControllersManager, $q, true, meetingAccessRight, false);
            noteProjectStatusList.sourceItems = [<ap.viewmodels.IEntityViewModel>statusVm1];
            specHelper.general.spyProperty(ap.viewmodels.projects.ProjectStatusViewModel.prototype, "noteProjectStatusListVm", specHelper.PropertyAccessor.Get).and.returnValue(noteProjectStatusList);
        });
        afterEach(() => {
            specHelper.general.offSpyProperty(ap.viewmodels.projects.ProjectStatusViewModel.prototype, "noteProjectStatusListVm", specHelper.PropertyAccessor.Get);
        });
        describe("WHEN import status is called", () => {
            beforeEach(() => {
                vm.importStatus([<ap.viewmodels.IEntityViewModel>statusVm2, <ap.viewmodels.IEntityViewModel>statusVm3]);
            });
            it("THEN the user is in edit mode", () => {
                expect(vm.screenInfo.isEditMode).toBeTruthy();
            });
            it("THEN the generic status are updated correctly", () => {
                expect((<ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel>vm.noteProjectStatusListVm.sourceItems[0]).color).toEqual("#FFFFFF");
                expect((<ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel>vm.noteProjectStatusListVm.sourceItems[0]).name).toEqual("In progress");
                expect((<ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel>vm.noteProjectStatusListVm.sourceItems[0]).isActive).toBeTruthy();
                expect((<ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel>vm.noteProjectStatusListVm.sourceItems[0]).isOnlyUsedByMeetingManager).toBeTruthy();
                expect((<ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel>vm.noteProjectStatusListVm.sourceItems[0]).isTodo).toBeFalsy();
                expect((<ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel>vm.noteProjectStatusListVm.sourceItems[0]).isDisabled).toBeFalsy();
                expect((<ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel>vm.noteProjectStatusListVm.sourceItems[0]).isDone).toBeTruthy();
                expect((<ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel>vm.noteProjectStatusListVm.sourceItems[0]).doneAction).toBeFalsy();
                expect((<ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel>vm.noteProjectStatusListVm.sourceItems[0]).id).toEqual("a1989fce-db6a-4d2d-8830-08ebe8bbe49a");
            });
            it("THEN the custom status are correctly added", () => {
                let newItem = <ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel>vm.noteProjectStatusListVm.sourceItems[1];
                expect(newItem.originalEntity.IsNew).toBeTruthy();
                expect(newItem.originalEntity.Id).not.toBe(statusVm3.originalEntity.Id);
                expect(newItem.color).toEqual("#23def5");
                expect(newItem.name).toEqual("Custom");
                expect(newItem.isActive).toBeTruthy();
                expect(newItem.isOnlyUsedByMeetingManager).toBeFalsy();
                expect(newItem.isTodo).toBeFalsy();
                expect(newItem.isDisabled).toBeFalsy();
                expect(newItem.isDone).toBeTruthy();
                expect(newItem.doneAction).toBeTruthy();
            });
            it("THEN the user is in edit mode", () => {
                expect(vm.noteProjectStatusListVm.closingStatusId).toEqual("bbbbbbbbe-db6a-4d2d-8830-08ebe8bbe49a");
            });
        });
        describe("WHEN import status is called with not active custom status", () => {
            beforeEach(() => {
                let status3: ap.models.projects.NoteProjectStatus = new ap.models.projects.NoteProjectStatus(Utility);
                status3.createByJson({
                    Id: "bbbbbbbbe-db6a-4d2d-8830-08ebe8bbe49a"
                });
                status3.Code = null;
                status3.Name = "Custom";
                status3.Color = "#23def5";
                status3.IsOnlyUsedByMeetingManager = false;
                status3.IsTodo = false;
                status3.IsDone = true;
                status3.DoneAction = true;
                status3.IsDisabled = true;
                status3.DisplayOrder = 2;

                statusVm3.init(status3);
                vm.importStatus([<ap.viewmodels.IEntityViewModel>statusVm2, <ap.viewmodels.IEntityViewModel>statusVm3]);
            });
            it("THEN the user is in edit mode", () => {
                expect(vm.screenInfo.isEditMode).toBeTruthy();
            });
            it("THEN the custom status are not added", () => {
                expect(vm.noteProjectStatusListVm.sourceItems.length).toEqual(1);
            });
        });
        describe("WHEN import status is called with custom status which has the same name of another custom", () => {
            beforeEach(() => {
                let statusVm4 = new ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel(Utility);
                let status4: ap.models.projects.NoteProjectStatus = new ap.models.projects.NoteProjectStatus(Utility);
                status4.createByJson({
                    Id: "bbbbbbbbe-db6a-4d2d-8830-08ebe8bbe49a"
                });
                status4.Code = null;
                status4.Name = "Custom";
                status4.Color = "#000000";
                status4.IsOnlyUsedByMeetingManager = false;
                status4.IsTodo = false;
                status4.IsDone = true;
                status4.DoneAction = true;
                status4.IsDisabled = true;
                status4.DisplayOrder = 1;

                statusVm4.init(status4);
                noteProjectStatusList.sourceItems = [<ap.viewmodels.IEntityViewModel>statusVm1, <ap.viewmodels.IEntityViewModel>statusVm4];
                vm.importStatus([<ap.viewmodels.IEntityViewModel>statusVm2, <ap.viewmodels.IEntityViewModel>statusVm3]);
            });
            it("THEN the user is in edit mode", () => {
                expect(vm.screenInfo.isEditMode).toBeTruthy();
            });
            it("THEN the custom status are not added", () => {
                expect(vm.noteProjectStatusListVm.sourceItems.length).toEqual(2);
            });
        });
    });
});