describe("Module ap-viewmodels - NoteProjectStatusViewModel", () => {
    let nmp = ap.viewmodels.projects;
    let MainController: ap.controllers.MainController, Utility: ap.utility.UtilityHelper, Api: ap.services.apiHelper.Api, UserContext: ap.utility.UserContext, UIStateController: ap.controllers.UIStateController;
    let $controller: angular.IControllerService, $rootScope: angular.IRootScopeService, $scope: angular.IScope, _deferred: angular.IDeferred<any>,
        $q: angular.IQService, $timeout: angular.ITimeoutService, $compile: angular.ICompileService;
    let ProjectController: ap.controllers.ProjectController, NoteController: ap.controllers.NoteController;
    let vm: ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel;
    let ControllersManager: ap.controllers.ControllersManager;

    let noteProjectStatusList;

    beforeEach(() => {
        noteProjectStatusList = {
            sourceItems: [
                {
                    Id: "a1989fce-db6a-4d2d-8830-08ebe8bbe49a",
                    Code: "InProgress",
                    Name: "In progress",
                    Color: "#23def5",
                    IsOnlyUsedByMeetingManager: false,
                    IsTodo: true,
                    IsDone: false,
                    DoneAction: false,
                    IsDisabled: false,
                    DisplayOrder: 0
                },
                {
                    Id: "242b0cf8-47f1-46c0-b00b-7a7de5569c5b",
                    Code: "Done",
                    Name: "Done",
                    Color: "#000000",
                    IsOnlyUsedByMeetingManager: false,
                    IsTodo: false,
                    IsDone: true,
                    DoneAction: true,
                    IsDisabled: false,
                    DisplayOrder: 1
                },
                {
                    Id: "94106981-482a-42c0-8928-4f03627657d0",
                    Code: "Cancelled",
                    Name: "Cancelled",
                    Color: "#ffddff",
                    IsOnlyUsedByMeetingManager: true,
                    IsTodo: false,
                    IsDone: false,
                    DoneAction: false,
                    IsDisabled: true,
                    DisplayOrder: 2
                }
            ]
        };
    });

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject(function (_$rootScope_, _$q_, _$timeout_, _$compile_, _UserContext_, _Utility_, _Api_, _MainController_, _UIStateController_, _$controller_, _ProjectController_, _NoteController_, _ControllersManager_) {
        MainController = _MainController_;
        ProjectController = _ProjectController_;
        ControllersManager = _ControllersManager_;
        UIStateController = _UIStateController_;
        Utility = _Utility_;
        UserContext = _UserContext_;
        NoteController = _NoteController_;
        Api = _Api_;
        vm = null;
        $q = _$q_;
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $timeout = _$timeout_;
        _deferred = $q.defer();
        $controller = _$controller_;
        $scope = $rootScope.$new();
        specHelper.userContext.stub(Utility);
        specHelper.utility.stubRootUrl(Utility);
        Utility.Storage.Session.clear();
        specHelper.utility.stubStorageSet(Utility);
    }));

    describe("Feature NoteProjectStatusViewModel", () => {
        let nps: ap.models.projects.NoteProjectStatus;
        let noteProjectStatusVm: ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel
        beforeEach(function () {
            noteProjectStatusVm = new ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel(Utility);
            nps = new ap.models.projects.NoteProjectStatus(Utility);
            nps.createByJson({
                Id: "67d9821b-6c15-46cf-99ea-7cd02a41add1"
            });
            nps.Code = "InProgress";
            nps.DisplayOrder = 2;
            nps.Name = "In progress";
            nps.IsDisabled = false;
            nps.Color = "#FFA726";
            nps.IsDone = false;
            nps.IsTodo = true;
            nps.IsOnlyUsedByMeetingManager = false;
            nps.DoneAction = false;
            nps.IsDisabled = false;
        });
        describe("WHEN a NoteProjectStatusViewModel is created with a NoteProjectStatus", () => {
            beforeEach(() => {
                noteProjectStatusVm.init(nps);
            });
            it("THEN, the ViewModel is correctly created with the values from the Entity", () => {
                expect(noteProjectStatusVm.color).toEqual("#FFA726");
                expect(noteProjectStatusVm.name).toEqual("In progress");
                expect(noteProjectStatusVm.isActive).toBeTruthy();
                expect(noteProjectStatusVm.isOnlyUsedByMeetingManager).toBeFalsy();
                expect(noteProjectStatusVm.isTodo).toBeTruthy();
                expect(noteProjectStatusVm.isDisabled).toBeFalsy();
                expect(noteProjectStatusVm.isDone).toBeFalsy();
                expect(noteProjectStatusVm.doneAction).toBeFalsy();
                expect(noteProjectStatusVm.id).toEqual("67d9821b-6c15-46cf-99ea-7cd02a41add1");
                expect(noteProjectStatusVm.subcontractorLabel).toEqual("To Do")
            });
        });
        describe("WHEN a NoteProjectStatusViewModel is created with a NoteProjectStatus and isDisabled is true", () => {
            beforeEach(() => {
                nps.IsDisabled = true;
                noteProjectStatusVm.init(nps);
            });
            it("THEN, the ViewModel is correctly created with the values from the Entity", () => {
                expect(noteProjectStatusVm.color).toEqual("#FFA726");
                expect(noteProjectStatusVm.name).toEqual("In progress");
                expect(noteProjectStatusVm.isActive).toBeFalsy();
                expect(noteProjectStatusVm.isDisabled).toBeTruthy();
                expect(noteProjectStatusVm.isOnlyUsedByMeetingManager).toBeFalsy();
                expect(noteProjectStatusVm.isTodo).toBeTruthy();
                expect(noteProjectStatusVm.isDone).toBeFalsy();
                expect(noteProjectStatusVm.doneAction).toBeFalsy();
                expect(noteProjectStatusVm.id).toEqual("67d9821b-6c15-46cf-99ea-7cd02a41add1");
                expect(noteProjectStatusVm.subcontractorLabel).toEqual("To Do");
                expect(noteProjectStatusVm.displayOrder).toEqual(2);
            });
        });
        describe("WHEN a NoteProjectStatusViewModel is created without a NoteProjectStatus", () => {
            beforeEach(() => {
                noteProjectStatusVm.init(undefined);
            });
            it("THEN, the ViewModel is correctly created with the default values", () => {
                expect(noteProjectStatusVm.color).toEqual("FFA726");
                expect(noteProjectStatusVm.name).toEqual("");
                expect(noteProjectStatusVm.isActive).toBeFalsy();
                expect(noteProjectStatusVm.isOnlyUsedByMeetingManager).toBeFalsy();
                expect(noteProjectStatusVm.isTodo).toBeFalsy();
                expect(noteProjectStatusVm.isDone).toBeFalsy();
                expect(noteProjectStatusVm.doneAction).toBeFalsy();
                expect(noteProjectStatusVm.subcontractorLabel).toEqual("Invisible");
                expect(noteProjectStatusVm.displayOrder).toEqual(0);
            });
        });
        describe("WHEN a NoteProjectStatusViewModel is created without a NoteProjectStatus with isDone = true", () => {
            beforeEach(() => {
                nps.IsDone = true;
                noteProjectStatusVm.init(nps);
            });
            it("THEN,noteProjectStatusVm.subcontractorLabel equal Done", () => {
                expect(noteProjectStatusVm.subcontractorLabel).toEqual("Done")
            });
        });

        describe("Feature postChange", () => {
            describe("When change values of Name, IsDisabled, Color, IsDone, IsTodo, IsOnlyUsedByMeetingManager, DoneAction and call postChange", () => {
                beforeEach(() => {
                    noteProjectStatusVm.init(nps);

                    noteProjectStatusVm.name = "Progress";
                    noteProjectStatusVm.isActive = false;
                    noteProjectStatusVm.color = "FFFFFF";
                    noteProjectStatusVm.isDone = true;
                    noteProjectStatusVm.isTodo = false;
                    noteProjectStatusVm.isOnlyUsedByMeetingManager = true;
                    noteProjectStatusVm.doneAction = true;

                    noteProjectStatusVm.postChanges();
                });
                it("THEN, entity.name = Progress", () => { expect(noteProjectStatusVm.noteProjectStatus.Name).toEqual("Progress"); });
                it("THEN, entity.color = FFFFFF", () => { expect(noteProjectStatusVm.noteProjectStatus.Color).toEqual("FFFFFF"); });
                it("THEN, entity.isDone = true", () => { expect(noteProjectStatusVm.noteProjectStatus.IsDone).toBeTruthy(); });
                it("THEN, entity.isTodo = false", () => { expect(noteProjectStatusVm.noteProjectStatus.IsTodo).toBeFalsy(); });
                it("THEN, entity.IsOnlyUsedByMeetingManager = true", () => { expect(noteProjectStatusVm.noteProjectStatus.IsOnlyUsedByMeetingManager).toBeTruthy(); });
                it("THEN, entity.DoneAction = true", () => { expect(noteProjectStatusVm.noteProjectStatus.DoneAction).toBeTruthy(); });
            });
        });

        describe("Feature actions", () => {
            describe("When VM init with new entity and IsDisabled = true", () => {
                beforeEach(() => {
                    nps = new ap.models.projects.NoteProjectStatus(Utility);
                    nps.IsDisabled = true;
                    noteProjectStatusVm.init(nps);
                });
                it("THEN, there are 2 actions available", () => { expect(noteProjectStatusVm.actions.length).toEqual(2); });
                it("THEN, action #1 is deleted", () => { expect(noteProjectStatusVm.actions[0].name).toEqual("delete"); });
                it("THEN, action #1 has short cut d", () => { expect(noteProjectStatusVm.actions[0].shortcut.char).toBe('d'); });
                it("THEN, action #1 has ctrl key for the shortcut", () => { expect(noteProjectStatusVm.actions[0].shortcut.specialKeys).toEqual([ap.misc.SpecialKeys.ctrlKey]); });

                it("THEN, action #2 is insert", () => { expect(noteProjectStatusVm.actions[1].name).toEqual("insert"); });
                it("THEN, action #2 has short cut i", () => { expect(noteProjectStatusVm.actions[1].shortcut.char).toBe('i'); });
                it("THEN, action #2 has ctrl key for the shortcut", () => { expect(noteProjectStatusVm.actions[1].shortcut.specialKeys).toEqual([ap.misc.SpecialKeys.ctrlKey]); });
            });

            describe("When VM init with existing entity and IsDisabled = false", () => {
                beforeEach(() => {
                    nps.IsDisabled = false; // active = true
                    noteProjectStatusVm.init(nps);
                });
                it("THEN, there are 3 actions available", () => { expect(noteProjectStatusVm.actions.length).toEqual(3); });
                it("THEN, action #1 is unactive", () => { expect(noteProjectStatusVm.actions[0].name).toEqual("unactive"); });
                it("THEN, action #1 is NOT visible", () => { expect(noteProjectStatusVm.actions[0].isVisible).toBeFalsy(); });
                it("THEN, action #1 is enabled", () => { expect(noteProjectStatusVm.actions[0].isEnabled).toBeTruthy(); });
                it("THEN, action #1 has short cut d", () => { expect(noteProjectStatusVm.actions[0].shortcut.char).toBe('d'); });
                it("THEN, action #1 has ctrl key for the shortcut", () => { expect(noteProjectStatusVm.actions[0].shortcut.specialKeys).toEqual([ap.misc.SpecialKeys.ctrlKey]); });

                it("THEN, action #2 is active", () => { expect(noteProjectStatusVm.actions[1].name).toEqual("active"); });
                it("THEN, action #2 is NOT visible", () => { expect(noteProjectStatusVm.actions[1].isVisible).toBeFalsy(); });
                it("THEN, action #2 is NOT enabled", () => { expect(noteProjectStatusVm.actions[1].isEnabled).toBeFalsy(); });
                it("THEN, action #2 has short cut d", () => { expect(noteProjectStatusVm.actions[1].shortcut.char).toBe('d'); });
                it("THEN, action #2 has ctrl key for the shortcut", () => { expect(noteProjectStatusVm.actions[1].shortcut.specialKeys).toEqual([ap.misc.SpecialKeys.ctrlKey]); });

                it("THEN, action #3 is insert", () => { expect(noteProjectStatusVm.actions[2].name).toEqual("insert"); });
                it("THEN, action #3 has short cut i", () => { expect(noteProjectStatusVm.actions[2].shortcut.char).toBe('i'); });
                it("THEN, action #3 has ctrl key for the shortcut", () => { expect(noteProjectStatusVm.actions[2].shortcut.specialKeys).toEqual([ap.misc.SpecialKeys.ctrlKey]); });
            });

            describe("When delete action click", () => {
                let callBack: jasmine.Spy;
                beforeEach(() => {
                    nps = new ap.models.projects.NoteProjectStatus(Utility);
                    nps.IsDisabled = true;
                    noteProjectStatusVm.init(nps);
                    callBack = jasmine.createSpy("deleterowrequested");
                    noteProjectStatusVm.on("deleterowrequested", callBack, this)

                    noteProjectStatusVm.actionClick("delete");
                });
                it("THEN, deleterowrequested event rasied", () => { expect(callBack).toHaveBeenCalled(); });
            });

            describe("When insert action click", () => {
                let callBack: jasmine.Spy;
                beforeEach(() => {
                    nps = new ap.models.projects.NoteProjectStatus(Utility);
                    nps.IsDisabled = true;
                    noteProjectStatusVm.init(nps);
                    callBack = jasmine.createSpy("insertrowrequested");
                    noteProjectStatusVm.on("insertrowrequested", callBack, this)

                    noteProjectStatusVm.actionClick("insert");
                });
                it("THEN, insertrowrequested event rasied", () => { expect(callBack).toHaveBeenCalled(); });
            });

            describe("When active action click", () => {
                let callBack: jasmine.Spy;
                beforeEach(() => {
                    nps.IsDisabled = true;
                    noteProjectStatusVm.init(nps);
                    noteProjectStatusVm.actionClick("active");
                });
                it("THEN, isActive = true", () => { expect(noteProjectStatusVm.isActive).toBeTruthy(); });

                it("THEN, the actions are refreshed AND unactive is enabled", () => {
                    expect(noteProjectStatusVm.actions[0].isEnabled).toBeTruthy();
                });

                it("THEN, the actions are refreshed AND active is disabled", () => {
                    expect(noteProjectStatusVm.actions[1].isEnabled).toBeFalsy();
                });
            });

            describe("When unactive action click", () => {
                beforeEach(() => {
                    nps.IsDisabled = false;
                    noteProjectStatusVm.init(nps);

                    noteProjectStatusVm.actionClick("unactive");
                });
                it("THEN, isActive = false", () => { expect(noteProjectStatusVm.isActive).toBeFalsy(); });

                it("THEN, the actions are refreshed AND unactive is disabled", () => {
                    expect(noteProjectStatusVm.actions[0].isEnabled).toBeFalsy();
                });

                it("THEN, the actions are refreshed AND active is enabled", () => {
                    expect(noteProjectStatusVm.actions[1].isEnabled).toBeTruthy();
                });
            });
        });
    });

    describe("Feature: NoteProjectStatusListViewModel", () => {

        let meetingAccessRight: ap.models.accessRights.MeetingAccessRight;

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
        });

        describe("WHEN I create a NoteProjectStatusListViewModel with an accessLevel > SubContractor", () => {
            it("THEN, a NoteProjectStatusListViewModel is created with the correct/default values", () => {
                meetingAccessRight.Level = ap.models.accessRights.AccessRightLevel.Admin;

                let statusList = new ap.viewmodels.projects.noteProjectStatus.NoteProjectStatuslistViewModel(Utility, ControllersManager, $q, true, meetingAccessRight, true);

                expect(statusList.isReadOnly).toBeTruthy();
                expect(statusList.entityName).toEqual("NoteProjectStatus");
                expect(statusList.meetingAccessRight.CanEditPointStatus).toBeTruthy();
                expect(statusList.canEditPointStatus).toBeFalsy(); // because it's readonly
            });

            it("THEN, hasSubcontractorStatusOnly is FALSE", () => {
                meetingAccessRight.Level = ap.models.accessRights.AccessRightLevel.Admin;

                let statusList = new ap.viewmodels.projects.noteProjectStatus.NoteProjectStatuslistViewModel(Utility, ControllersManager, $q, true, meetingAccessRight, true);

                expect(statusList.hasSubcontractorStatusOnly).toBeFalsy();
                expect(statusList.activeStatusOnly).toBeTruthy();
            });
        });
        describe("WHEN I create a NoteProjectStatusListViewModel with a SubContractor access right", () => {
            it("THEN, a NoteProjectStatusListViewModel is created with the correct/default values AND hasSubcontractorStatusOnly is TRUE", () => {
                meetingAccessRight.Level = ap.models.accessRights.AccessRightLevel.Subcontractor;

                let statusList = new ap.viewmodels.projects.noteProjectStatus.NoteProjectStatuslistViewModel(Utility, ControllersManager, $q, true, meetingAccessRight, false);

                expect(statusList.hasSubcontractorStatusOnly).toBeTruthy();
                expect(statusList.activeStatusOnly).toBeFalsy();
            });
        });

        describe("Feature: drag and drop status items", () => {
            let statusList: ap.viewmodels.projects.noteProjectStatus.NoteProjectStatuslistViewModel;
            let sourceEntities: ap.models.projects.NoteProjectStatus[];
            beforeEach(() => {
                statusList = new ap.viewmodels.projects.noteProjectStatus.NoteProjectStatuslistViewModel(Utility, ControllersManager, $q, true, meetingAccessRight, false);
                sourceEntities = [];
                noteProjectStatusList.sourceItems.forEach((statusItem) => {
                    let sourceEntity = new ap.models.projects.NoteProjectStatus(Utility);
                    sourceEntity.createByJson(statusItem);
                    sourceEntities.push(sourceEntity);
                });
                spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue(_deferred.promise);
            });

            describe("WHEN drop function is called", () => {
                let testViewModel = null;
                let dragStatus: ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel,
                    dropStatus: ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel;
                beforeEach(() => {
                    statusList.refresh(null);
                    _deferred.resolve(sourceEntities);
                    $rootScope.$apply();
                    dragStatus = <ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel>statusList.sourceItems[0]; // In progress
                    dropStatus = <ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel>statusList.sourceItems[1]; // Done
                    dragStatus.drop(dropStatus);
                });
                it("THEN, displayOrder property is recalculated AND columns are sorted properly", () => {
                    expect((<ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel>statusList.sourceItems[0]).name).toEqual("Done");
                    expect((<ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel>statusList.sourceItems[0]).displayOrder).toEqual(0);
                    expect((<ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel>statusList.sourceItems[1]).name).toEqual("In progress");
                    expect((<ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel>statusList.sourceItems[1]).displayOrder).toEqual(1);
                });
            });
        });
    });

    describe("Feature: searchText", () => {

        let meetingAccessRight: ap.models.accessRights.MeetingAccessRight;

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
        });

        describe("WHEN a value is set to searchText AND the get method is called", () => {
            it("THEN, the value of searchText is returned", () => {
                let statusList = new ap.viewmodels.projects.noteProjectStatus.NoteProjectStatuslistViewModel(Utility, ControllersManager, $q, true, meetingAccessRight, true);

                statusList.searchText = "12";

                expect(statusList.searchText).toBe("12");
            });
        });
    });

    describe("Feature: updateViewModel", () => {
        let noteProjectStatusVm: ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel;
        let status: ap.models.projects.NoteProjectStatus;
        let newNoteProjectStatusVm: ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel;
        let newStatus: ap.models.projects.NoteProjectStatus;
        beforeEach(() => {
            noteProjectStatusVm = new ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel(Utility);
            status = new ap.models.projects.NoteProjectStatus(Utility);
            status.createByJson({
                Id: "67d9821b-6c15-46cf-99ea-7cd02a41add1"
            });
            status.Code = "InProgress";
            status.DisplayOrder = 2;
            status.Name = "In progress";
            status.IsDisabled = false;
            status.Color = "#FFA726";
            status.IsDone = false;
            status.IsTodo = true;
            status.IsOnlyUsedByMeetingManager = false;
            status.DoneAction = false;

            noteProjectStatusVm.init(status);

            newNoteProjectStatusVm = new ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel(Utility);
            newStatus = new ap.models.projects.NoteProjectStatus(Utility);
            newStatus.createByJson({
                Id: "aaaaaaaa-6c15-46cf-99ea-7cd02a41add1"
            });
            newStatus.Code = "InProgress";
            newStatus.DisplayOrder = 4;
            newStatus.Name = "In progress";
            newStatus.IsDisabled = true;
            newStatus.Color = "#FFA725";
            newStatus.IsDone = true;
            newStatus.IsTodo = false;
            newStatus.IsOnlyUsedByMeetingManager = false;
            newStatus.DoneAction = true;

            newNoteProjectStatusVm.init(newStatus);

            noteProjectStatusVm.updateViewModel(newNoteProjectStatusVm);
        });
        it("THEN, the ViewModel is correctly updated with the new values", () => {
            expect(noteProjectStatusVm.color).toEqual("#FFA725");
            expect(noteProjectStatusVm.name).toEqual("In progress");
            expect(noteProjectStatusVm.isOnlyUsedByMeetingManager).toBeFalsy();
            expect(noteProjectStatusVm.isTodo).toBeFalsy();
            expect(noteProjectStatusVm.isActive).toBeFalsy();
            expect(noteProjectStatusVm.isDone).toBeTruthy();
            expect(noteProjectStatusVm.doneAction).toBeTruthy();
            expect(noteProjectStatusVm.id).toEqual("67d9821b-6c15-46cf-99ea-7cd02a41add1");
        });
    });

    describe("Feature: canEditPointStatus", () => {

        let meetingAccessRight: ap.models.accessRights.MeetingAccessRight;

        beforeEach(() => {
            meetingAccessRight = new ap.models.accessRights.MeetingAccessRight(Utility);
            meetingAccessRight.createByJson({
                ModuleName: 'Meeting',
                CanEdit: true,
                CanAddPoint: true,
                CanEditPoint: true,
                CanDeletePoint: false,
                CanEditPointStatus: true,
                CanAddComment: true,
                CanDeleteComment: false,
                CanArchiveComment: false,
                CanAddDoc: false,
                CanGenerateReport: true,
                CanCreateNextMeeting: false,
                CanEditAllPoint: false,
                CanViewOnlyPointInCharge: false
            });

            spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue(_deferred.promise);
        });

        describe("WHEN a status is selected from the list but AND the current one is only used by manager AND the current access right level is Contributor", () => {
            it("THEN, canEditPointStatus is FALSE", () => {
                meetingAccessRight.Level = ap.models.accessRights.AccessRightLevel.Contributor;

                let statusList = new ap.viewmodels.projects.noteProjectStatus.NoteProjectStatuslistViewModel(Utility, ControllersManager, $q, true, meetingAccessRight, true);
                statusList.refresh(<ap.models.projects.NoteProjectStatus>noteProjectStatusList[2]);

                _deferred.resolve(noteProjectStatusList.sourceItems);
                $rootScope.$apply();

                expect(statusList.canEditPointStatus).toBeFalsy();
            });
        });
        describe("WHEN a status is selected from the list but AND the current one is only used by manager AND the current access right level is Manager", () => {
            it("THEN, canEditPointStatus is True", () => {
                meetingAccessRight.Level = ap.models.accessRights.AccessRightLevel.Manager;

                let statusList = new ap.viewmodels.projects.noteProjectStatus.NoteProjectStatuslistViewModel(Utility, ControllersManager, $q, true, meetingAccessRight, true);
                statusList.refresh(<ap.models.projects.NoteProjectStatus>noteProjectStatusList[2]);

                _deferred.resolve(noteProjectStatusList.sourceItems);
                $rootScope.$apply();

                expect(statusList.canEditPointStatus).toBeFalsy();
            });
        });
    });

    describe("Feature: Refresh the list of status", () => {

        let meetingAccessRight: ap.models.accessRights.MeetingAccessRight;
        let callback: jasmine.Spy;

        beforeEach(() => {
            meetingAccessRight = new ap.models.accessRights.MeetingAccessRight(Utility);
            meetingAccessRight.createByJson({
                ModuleName: 'Meeting',
                Level: ap.models.accessRights.AccessRightLevel.Admin,
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

            spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue(_deferred.promise);

            callback = jasmine.createSpy("callback");
        });

        describe("WHEN, the refresh method is called AND the current user is not SubContractor", () => {
            it("THEN, the ProjectConctroller is called with null", () => {
                let statusList = new ap.viewmodels.projects.noteProjectStatus.NoteProjectStatuslistViewModel(Utility, ControllersManager, $q, true, meetingAccessRight, true);
                statusList.refresh(null);

                expect(ProjectController.getNoteProjectStatusList).toHaveBeenCalledWith(null, false);
            });
        });

        describe("WHEN, the refresh method is called with null and the list is not stored in ProjectController", () => {
            it("THEN, the ProjectConctroller is called as well as the API to get the list and store the result", () => {
                let statusList = new ap.viewmodels.projects.noteProjectStatus.NoteProjectStatuslistViewModel(Utility, ControllersManager, $q, true, meetingAccessRight, false);
                statusList.refresh(null).then(function (args) {
                    callback(args);
                });

                _deferred.resolve(noteProjectStatusList.sourceItems);
                $rootScope.$apply();

                expect(statusList.count).toEqual(3);
                expect(callback).toHaveBeenCalledWith(noteProjectStatusList.sourceItems);
            });
        });

        describe("WHEN the list refreshes", () => {
            let statusList: ap.viewmodels.projects.noteProjectStatus.NoteProjectStatuslistViewModel;

            beforeEach(() => {
                statusList = new ap.viewmodels.projects.noteProjectStatus.NoteProjectStatuslistViewModel(Utility, ControllersManager, $q, true, meetingAccessRight, false);
                statusList.refresh(null).then(function (args) {
                    callback(args);
                });

                _deferred.resolve(noteProjectStatusList.sourceItems);
                $rootScope.$apply();
            });

            it("THEN, the closingStatusId property is set", () => {
                expect(statusList.closingStatusId).toBe("242b0cf8-47f1-46c0-b00b-7a7de5569c5b");
            });
        });

        describe("WHEN, the refresh method is called with null and the list is not stored in ProjectController and the list load only active status", () => {
            it("THEN, the ProjectConctroller is called as well as the API to get the list and store the result", () => {
                let statusList = new ap.viewmodels.projects.noteProjectStatus.NoteProjectStatuslistViewModel(Utility, ControllersManager, $q, true, meetingAccessRight, true);
                statusList.refresh(null).then(function (args) {
                    callback(args);
                });

                _deferred.resolve(noteProjectStatusList.sourceItems);
                $rootScope.$apply();

                expect(statusList.count).toEqual(2);
                expect(callback).toHaveBeenCalledWith(noteProjectStatusList.sourceItems);
            });
        });

        describe("WHEN, the refresh method is called AND the access right level is SubContractor", () => {
            let statusList: ap.viewmodels.projects.noteProjectStatus.NoteProjectStatuslistViewModel;
            let fakeStatusToDo: ap.models.projects.NoteProjectStatus;
            let fakeStatusDone: ap.models.projects.NoteProjectStatus;
            let fakeStatusBlocked: ap.models.projects.NoteProjectStatus;

            beforeEach(() => {
                meetingAccessRight.Level = ap.models.accessRights.AccessRightLevel.Subcontractor;

                specHelper.mainController.stub(MainController, Utility);

                fakeStatusToDo = new ap.models.projects.NoteProjectStatus(Utility);
                fakeStatusToDo.createByJson({
                    Id: "a1989fce-db6a-4d2d-8830-08ebe8bbe49a",
                    Name: Utility.Translator.getTranslation("To Do"),
                    IsDone: false,
                    Color: "#FFA726"
                });

                fakeStatusDone = new ap.models.projects.NoteProjectStatus(Utility);
                fakeStatusDone.createByJson({
                    Id: "00000000-0000-0000-0000-000000000000",
                    Name: Utility.Translator.getTranslation("Done"),
                    IsDone: true,
                    Color: "#4CAF50"
                });

                fakeStatusBlocked = new ap.models.projects.NoteProjectStatus(Utility);
                fakeStatusBlocked.createByJson({
                    Id: "00000000-0000-0000-0000-000000000001",
                    Name: Utility.Translator.getTranslation("Blocked"),
                    IsDisabled: true,
                    IsDone: false,
                    IsBlocked: true,
                    IsBlockedAction: true,
                });

                statusList = new ap.viewmodels.projects.noteProjectStatus.NoteProjectStatuslistViewModel(Utility, ControllersManager, $q, true, meetingAccessRight, true);
                statusList.refresh(<ap.models.projects.NoteProjectStatus>{ Id: "a1989fce-db6a-4d2d-8830-08ebe8bbe49a", IsDone: false }).then(function (args) {
                    callback(args);
                });
            });

            it("THEN, the ProjectConctroller is called AND 2 fake items are returned and also stored", () => {
                expect(ProjectController.getNoteProjectStatusList).toHaveBeenCalledWith(<ap.models.projects.NoteProjectStatus>{ Id: "a1989fce-db6a-4d2d-8830-08ebe8bbe49a", IsDone: false }, false);

                let resultList: ap.models.projects.NoteProjectStatus[] = [fakeStatusToDo, fakeStatusDone];
                _deferred.resolve(resultList);
                $rootScope.$apply();

                expect(statusList.count).toEqual(2); // done status + fake undone status

                let fstStatus = <ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel>statusList.getItemAtIndex(0);
                let sndStatus = <ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel>statusList.getItemAtIndex(1);

                expect(fstStatus.name).toEqual("[To Do]");
                expect(fstStatus.color).toEqual("#FFA726");
                expect(sndStatus.name).toEqual("[Done]");
                expect(sndStatus.color).toEqual("#4CAF50");

                expect(callback).toHaveBeenCalledWith(resultList);
            });

            describe("AND a disabled blocked action is received", () => {
                let resultList: ap.models.projects.NoteProjectStatus[];

                beforeEach(() => {
                    resultList = [fakeStatusBlocked];
                    _deferred.resolve(resultList);
                    $rootScope.$digest();
                });

                it("THEN this action is stored", () => {
                    let status = <ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel>statusList.getItemAtIndex(0);
                    expect(status.name).toEqual("[Blocked]");
                });
            });
        });
    });

    describe("Feature: querySearch method", () => {
        let meetingAccessRight: ap.models.accessRights.MeetingAccessRight;
        let statusList: ap.viewmodels.projects.noteProjectStatus.NoteProjectStatuslistViewModel;

        beforeEach(() => {
            meetingAccessRight = new ap.models.accessRights.MeetingAccessRight(Utility);
            meetingAccessRight.createByJson({
                ModuleName: 'Meeting',
                Level: ap.models.accessRights.AccessRightLevel.Admin,
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

            spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue($q.resolve(noteProjectStatusList.sourceItems));

            statusList = new ap.viewmodels.projects.noteProjectStatus.NoteProjectStatuslistViewModel(Utility, ControllersManager, $q, true, meetingAccessRight, true);
        });

        describe("WHEN, the querySearch method is called with 'in' and NoteProjectStatusListViewModel was loaded and there is one element containing the search text", () => {
            beforeEach(() => {
                statusList.refresh(null);
                statusList.querySearch('in');
                $rootScope.$apply();
            });

            it("THEN, the result list contains only 1 element", () => {
                expect(statusList.getLength()).toEqual(1);
            });

            it("THEN, the element of the result list is 'In Progress'", () => {
                let status = (<ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel>statusList.getItemAtIndex(0));
                expect(status.name).toEqual("In progress");
            });
        });

        describe("WHEN querySearch is called with a string which is exactly the same as the name of 1 element in the list", () => {
            beforeEach(() => {
                spyOn(statusList, "selectEntity");

                statusList.refresh(null);
                $rootScope.$digest();

                statusList.querySearch("Done");
                $rootScope.$digest();
            });

            it("THEN, the element is automatically selected", () => {
                expect(statusList.selectEntity).toHaveBeenCalledWith(noteProjectStatusList.sourceItems[1].Id);
            });
        });

        describe("WHEN, the querySearch method is called and NoteProjectStatusListViewModel was not loaded", () => {
            beforeEach(() => {
                spyOn(statusList, "refresh").and.callThrough();
                statusList.querySearch('in');
                $rootScope.$digest();
            });

            it("THEN, the refresh method is called", () => {
                expect(statusList.refresh).toHaveBeenCalled();
            });

            it("THEN, the ProjectController.getNoteProjectStatusList method is called", () => {
                expect(ProjectController.getNoteProjectStatusList).toHaveBeenCalled();
            });

            it("THEN, the method refresh will be called and after that will return the list of NoteProjectStatusViewModel having name contains the search text ", () => {
                expect(statusList.getLength()).toEqual(1);

                let status = (<ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel>statusList.getItemAtIndex(0));
                expect(status.name).toEqual("In progress");
            });
        });

        describe("WHEN several searches are performed", () => {
            beforeEach(() => {
                statusList.refresh(null);
                $rootScope.$digest();

                statusList.querySearch("in");
                $rootScope.$digest();

                statusList.querySearch("do");
                $rootScope.$digest();
            });

            it("THEN consecutive search requests are able to return correct results", () => {
                expect(statusList.getLength()).toEqual(1);

                let status = (<ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel>statusList.getItemAtIndex(0));
                expect(status.name).toEqual("Done");
            });
        });
    });

    describe("Feature: validateStatus method", () => {

        let meetingAccessRight: ap.models.accessRights.MeetingAccessRight;
        let defStatusList;
        let statusList: ap.viewmodels.projects.noteProjectStatus.NoteProjectStatuslistViewModel;

        beforeEach(() => {
            meetingAccessRight = new ap.models.accessRights.MeetingAccessRight(Utility);
            meetingAccessRight.createByJson({
                ModuleName: 'Meeting',
                Level: ap.models.accessRights.AccessRightLevel.Admin,
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

            defStatusList = $q.defer();
            spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue(defStatusList.promise);

            statusList = new ap.viewmodels.projects.noteProjectStatus.NoteProjectStatuslistViewModel(Utility, ControllersManager, $q, true, meetingAccessRight, true);
        });

        describe("WHEN, the validateStatus method is called and the selectviewmodel is null", () => {

            let resultList: ap.viewmodels.projects.noteProjectStatus.NoteProjectStatuslistViewModel;

            beforeEach(() => {
                statusList.refresh(null);

                defStatusList.resolve(noteProjectStatusList.sourceItems);
                $rootScope.$apply();
                statusList.searchText = "in";
                statusList.querySearch('in').then((result) => {
                    resultList = result;
                });
            });

            it("THEN, the searchtext is undefined", () => {
                statusList.validateStatus();
                expect(statusList.searchText).toBeUndefined();
            });
        });

        describe("WHEN, the search text is empty adn selected item is null and validateStatus method is called with 'reset' param", () => {
            let resultList: ap.viewmodels.projects.noteProjectStatus.NoteProjectStatuslistViewModel;
            beforeEach(() => {
                statusList.refresh(null);

                defStatusList.resolve(noteProjectStatusList.sourceItems);
                $rootScope.$apply();

            });

            it("THEN, the searchtext is reset to previous value", () => {
                statusList.querySearch('in').then((result) => {
                    resultList = result;
                    statusList.selectedViewModel = resultList[0];
                    statusList.searchText = resultList[0].name;
                    statusList.searchText = null;
                    statusList.selectedViewModel = null;
                    statusList.validateStatus("reset");
                    expect(statusList.selectedViewModel).toBeDefined();
                    expect(statusList.searchText).toEqual(resultList[0].name);
                });
            });

        });

    });

    describe("Feature: isValid", () => {

        let nps: ap.models.projects.NoteProjectStatus;
        let noteProjectStatusVm: ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel

        beforeEach(() => {
            noteProjectStatusVm = new ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel(Utility);
            nps = new ap.models.projects.NoteProjectStatus(Utility);
            nps.createByJson({
                Id: "67d9821b-6c15-46cf-99ea-7cd02a41add1"
            });
            nps.Code = "InProgress";
            nps.DisplayOrder = 0;
            nps.IsDisabled = false;
            nps.Color = "#FFA726";
            nps.IsDone = false;
            nps.IsTodo = true;
            nps.IsOnlyUsedByMeetingManager = false;
            nps.DoneAction = false;
            nps.IsDisabled = false;
        });
        describe("WHEN, call isValid and NoteProjectStatus name is defined", () => {
            beforeEach(() => {
                nps.Name = "In Progress";
                noteProjectStatusVm.init(nps);
            });
            it("THEN, isValid return true", () => {
                expect(noteProjectStatusVm.isValid()).toBeTruthy();
            });
        });
        describe("WHEN, call isValid and NoteProjectStatus name is not defined", () => {
            beforeEach(() => {
                nps.Name = null;
                noteProjectStatusVm.init(nps);
            });
            it("THEN, isValid return false", () => {
                expect(noteProjectStatusVm.isValid()).toBeFalsy();
            });
        });
    });

    describe("Item actions", () => {
        let meetingAccessRight: ap.models.accessRights.MeetingAccessRight;
        beforeEach(() => {
            meetingAccessRight = new ap.models.accessRights.MeetingAccessRight(Utility);
            meetingAccessRight.createByJson({
                ModuleName: 'Meeting',
                Level: ap.models.accessRights.AccessRightLevel.Admin,
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

            spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue(_deferred.promise);
        });
        describe("WHEN, Item action raise insertrowrequested", () => {
            let statusList: ap.viewmodels.projects.noteProjectStatus.NoteProjectStatuslistViewModel;
            beforeEach(() => {
                statusList = new ap.viewmodels.projects.noteProjectStatus.NoteProjectStatuslistViewModel(Utility, ControllersManager, $q, true, meetingAccessRight, false);
                statusList.refresh(null);
                _deferred.resolve(noteProjectStatusList.sourceItems);
                $rootScope.$apply();

                specHelper.general.raiseEvent(statusList.getItemAtIndex(0), "insertrowrequested", statusList.getItemAtIndex(0));
            });

            it("THEN, there is 4 items (add one)", () => {
                expect(statusList.count).toEqual(4);
            });

            it("THEN, the item #2 is new entity", () => {
                let statusVM = <ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel>statusList.getItemAtIndex(1);
                expect(statusVM.noteProjectStatus.IsNew).toBeTruthy();
            });
        });

        describe("WHEN, new Item raise deleterowrequested", () => {
            let statusList: ap.viewmodels.projects.noteProjectStatus.NoteProjectStatuslistViewModel;
            beforeEach(() => {
                statusList = new ap.viewmodels.projects.noteProjectStatus.NoteProjectStatuslistViewModel(Utility, ControllersManager, $q, true, meetingAccessRight, false);
                statusList.refresh(null);
                _deferred.resolve(noteProjectStatusList.sourceItems);
                $rootScope.$apply();

                specHelper.general.raiseEvent(statusList.getItemAtIndex(0), "insertrowrequested", statusList.getItemAtIndex(0));
                specHelper.general.raiseEvent(statusList.getItemAtIndex(1), "deleterowrequested", statusList.getItemAtIndex(1));

            });

            it("THEN, there is 3 items (remove one)", () => {
                expect(statusList.count).toEqual(3);
            });
        });
    });

    describe("Feature: DoneAction", () => {
        let nps: ap.models.projects.NoteProjectStatus;
        let noteProjectStatusVm: ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel
        beforeEach(function () {
            noteProjectStatusVm = new ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel(Utility);
            nps = new ap.models.projects.NoteProjectStatus(Utility);
            nps.Code = "InProgress";
            nps.DisplayOrder = 0;
            nps.Name = "In progress";
            nps.IsDisabled = false;
            nps.Color = "#FFA726";
            nps.IsDone = false;
            nps.IsTodo = true;
            nps.IsOnlyUsedByMeetingManager = false;
            nps.DoneAction = false;
            nps.IsDisabled = false;
            noteProjectStatusVm.init(nps);
        });

        describe("WHEN the DoneAction is set for a status", () => {
            it("THEN, its actions are refreshed", () => {
                let deleteAction: ap.viewmodels.home.ActionViewModel = noteProjectStatusVm.actions.filter((action: ap.viewmodels.home.ActionViewModel, index: number) => {
                    return action.name === "delete"
                })[0];

                // before to set the status has done, we expect to be able to delete it
                expect(deleteAction.isEnabled).toBeTruthy();

                noteProjectStatusVm.doneAction = true;

                expect(deleteAction.isEnabled).toBeFalsy();
            });
        });
    });
    describe("Feature: getLength", () => {
        let meetingAccessRight: ap.models.accessRights.MeetingAccessRight;
        let statusList: ap.viewmodels.projects.noteProjectStatus.NoteProjectStatuslistViewModel;

        beforeEach(() => {
            meetingAccessRight = new ap.models.accessRights.MeetingAccessRight(Utility);
            meetingAccessRight.createByJson({
                ModuleName: 'Meeting',
                Level: ap.models.accessRights.AccessRightLevel.Admin,
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

            spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue($q.resolve(noteProjectStatusList.sourceItems));

            statusList = new ap.viewmodels.projects.noteProjectStatus.NoteProjectStatuslistViewModel(Utility, ControllersManager, $q, true, meetingAccessRight, true);
        });

        describe("WHEN data is loaded", () => {
            beforeEach(() => {
                statusList.refresh(null);
                $rootScope.$digest();
            });

            describe("WHEN a search request is not performed", () => {
                it("THEN it returns a length of the whole loaded list of statuses", () => {
                    expect(statusList.getLength()).toEqual(2);
                });
            });

            describe("WHEN a search request is performed", () => {
                beforeEach(() => {
                    statusList.querySearch("in");
                });

                it("THEN it returns a length of the filtered list of statuses", () => {
                    expect(statusList.getLength()).toEqual(1);
                });
            });
        });

        describe("WHEN no data is loaded", () => {
            it("THEN it returns zero", () => {
                expect(statusList.getLength()).toEqual(0);
            });
        });
    });

    describe("Feature: getItemAtIndex", () => {
        let meetingAccessRight: ap.models.accessRights.MeetingAccessRight;
        let statusList: ap.viewmodels.projects.noteProjectStatus.NoteProjectStatuslistViewModel;

        beforeEach(() => {
            meetingAccessRight = new ap.models.accessRights.MeetingAccessRight(Utility);
            meetingAccessRight.createByJson({
                ModuleName: 'Meeting',
                Level: ap.models.accessRights.AccessRightLevel.Admin,
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

            spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue($q.resolve(noteProjectStatusList.sourceItems));

            statusList = new ap.viewmodels.projects.noteProjectStatus.NoteProjectStatuslistViewModel(Utility, ControllersManager, $q, true, meetingAccessRight, true);
        });

        describe("WHEN data is loaded", () => {
            beforeEach(() => {
                statusList.refresh(null);
                $rootScope.$digest();
            });

            describe("WHEN a search request is not performed", () => {
                it("THEN it returns items from the loaded list of statuses", () => {
                    let status = (<ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel>statusList.getItemAtIndex(0));
                    expect(status.name).toEqual("In progress");
                });
            });

            describe("WHEN a search request is performed", () => {
                beforeEach(() => {
                    statusList.querySearch("do");
                    $rootScope.$digest();
                });

                it("THEN it returns items from the filtered list of statuses", () => {
                    let status = (<ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel>statusList.getItemAtIndex(0));
                    expect(status.name).toEqual("Done");
                });
            });
        });

        describe("WHEN a given index if out of range", () => {
            it("THEN it returns undefined", () => {
                expect(statusList.getItemAtIndex(-1)).toBeUndefined();
            });
        });
    });
}); 