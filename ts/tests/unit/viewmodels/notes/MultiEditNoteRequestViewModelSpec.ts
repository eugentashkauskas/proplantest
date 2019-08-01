describe("Module ap-viewmodels - MultiEditNoteRequestViewModel", () => {
    let $rootScope: angular.IRootScopeService, $scope: angular.IScope;
    let Utility: ap.utility.UtilityHelper, UserContext: ap.utility.UserContext;
    let $mdDialog: angular.material.IDialogService;
    let $controller: angular.IControllerService;
    let ControllersManager: ap.controllers.ControllersManager;
    let ServicesManager: ap.services.ServicesManager;
    let $q: angular.IQService;
    let Api: ap.services.apiHelper.Api;
    let $timeout: angular.ITimeoutService;
    let vm: ap.viewmodels.notes.MultiEditNoteRequestViewModel;
    let defNoteStatus: ng.IDeferred<any>;
    let defMultiEditController: ng.IDeferred<any>;
    let meetingAccessRight: ap.models.accessRights.MeetingAccessRight;
    let userCommentIds: string[];
    beforeEach(() => {
        let $window = specHelper.createWindowStub();
        $window.navigator.userLanguage = undefined;
        $window.navigator.language = 'en_US';
        angular.mock.module(function ($provide) {
            $provide.value('$window', $window);
            $provide.value('$mdDialog', $mdDialog);
        });
    });

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
        angular.mock.module("ap-services");

        angular.mock.module(function ($provide) {
            $provide.factory('$mdDialog', ["$q", function ($q) {
                return specHelper.utility.stubShowMdDialog($q);
            }]);
        });
    });

    beforeEach(inject(function (_$rootScope_, _Utility_, _UserContext_, _NoteController_, _$mdDialog_, _$controller_, _ControllersManager_, _$q_, _Api_, _$timeout_, _ServicesManager_) {
        Api = _Api_;
        $timeout = _$timeout_;
        modelSpecHelper.setUtilityModule(_Utility_);
        specHelper.userContext.stub(_Utility_);
        specHelper.utility.stubRootUrl(_Utility_);
        $q = _$q_;
        ControllersManager = _ControllersManager_;
        ServicesManager = _ServicesManager_;
        $controller = _$controller_;
        Utility = _Utility_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        $mdDialog = _$mdDialog_;

        defMultiEditController = $q.defer();
        defNoteStatus = $q.defer();
        spyOn(ControllersManager.projectController, "getNoteProjectStatusList").and.returnValue(defNoteStatus.promise);

        let noteProjectStatusList = [
            {
                Id: "a1989fce-db6a-4d2d-8830-08ebe8bbe49a",
                Code: "InProgress",
                Name: "In progress",
                Color: "#23def5",
                IsOnlyUsedByMeetingManager: false,
                IsTodo: true,
                IsDone: false,
                DoneAction: false,
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
            },
            {
                Id: "94106981-482a-42c0-8928-4f03627657d0",
                Code: "Cancelled",
                Name: "Cancelled",
                Color: "#ffddff",
                IsOnlyUsedByMeetingManager: false,
                IsTodo: false,
                IsDone: false,
                DoneAction: false,
            }
        ];
        let defLoad = $q.defer();
        spyOn(ap.viewmodels.projects.IssueTypeSelectorViewModel.prototype, "load").and.returnValue(defLoad.promise);
        let defLoad2 = $q.defer();
        spyOn(ap.viewmodels.projects.RoomSelectorViewModel.prototype, "load").and.returnValue(defLoad2.promise);
        userCommentIds = ["5899C636-7449-44A2-9184-0982407B2F0C0", "21C1E809-CCE5-41EF-BEDA-E3B85DD1D5061"];
        defNoteStatus.resolve(noteProjectStatusList);
        meetingAccessRight = new ap.models.accessRights.MeetingAccessRight(Utility);
        meetingAccessRight.CanEditPoint = true;
        meetingAccessRight.CanEditPointStatus = true;
        meetingAccessRight.CanEditPointIssueType = true;
        meetingAccessRight.CanEditPointInCharge = true;

        spyOn(ControllersManager.mainController, "currentProject").and.returnValue({
            Creator: Utility.UserContext.CurrentUser(),
            UserAccessRight: {
                CanConfig: true
            }
        });
    }));
    describe("Feature: constructor", () => {
        describe("WHEN a MultiEditNoteRequestViewModel is created", () => {
            beforeEach(() => {
                vm = <ap.viewmodels.notes.MultiEditNoteRequestViewModel>$controller("multiEditNoteRequestViewModel", { $scope: $scope });
            });
            it("THEN it's default values are initialized", () => {

                expect(vm).toBeDefined();
            });
        });
    });

    describe("Feature: canSave", () => {
        beforeEach(() => {
            vm = new ap.viewmodels.notes.MultiEditNoteRequestViewModel(Utility, $mdDialog, Api, $scope, $timeout, $q, ControllersManager, ServicesManager, meetingAccessRight, userCommentIds);
            $rootScope.$apply();
            specHelper.general.spyProperty(ap.viewmodels.projects.ContactSelectorViewModel.prototype, "selectedContacts", specHelper.PropertyAccessor.Get).and.returnValue([{ DisplayName: "test" }]);
            specHelper.general.spyProperty(ap.viewmodels.projects.IssueTypeSelectorViewModel.prototype, "selectedItem", specHelper.PropertyAccessor.Get).and.returnValue({});
            specHelper.general.spyProperty(ap.viewmodels.projects.RoomSelectorViewModel.prototype, "selectedItem", specHelper.PropertyAccessor.Get).and.returnValue({});
        });
        afterEach(() => {
            specHelper.general.offSpyProperty(ap.viewmodels.projects.ContactSelectorViewModel.prototype, "selectedContacts", specHelper.PropertyAccessor.Get);
            specHelper.general.offSpyProperty(ap.viewmodels.projects.IssueTypeSelectorViewModel.prototype, "selectedItem", specHelper.PropertyAccessor.Get);
            specHelper.general.offSpyProperty(ap.viewmodels.projects.RoomSelectorViewModel.prototype, "selectedItem", specHelper.PropertyAccessor.Get);
        });
        describe("WHEN there is no field checked", () => {
            it("THEN, canSave equals false", () => {
                expect(vm.canSave).toBeFalsy();
            });
        });
        describe("WHEN all fields are checked and filled", () => {
            beforeEach(() => {
                vm.subject = "My new status";
                vm.dueDate = new Date();
                vm.statusSelector.selectEntity("a1989fce-db6a-4d2d-8830-08ebe8bbe49a");
                vm.mustUpdateDueDate = true;
                vm.mustUpdateStatus = true;
                vm.mustUpdateSubject = true;
                vm.mustUpdateRoom = true;
                vm.mustUpdateIssueType = true;
                vm.mustUpdateInCharge = true;
            });
            it("THEN, canSave equals true", () => {
                expect(vm.canSave).toBeTruthy();
            });
        });
        describe("WHEN there at least one field checked but empty", () => {
            beforeEach(() => {
                vm.subject = "My new status";
                vm.dueDate = new Date();
                vm.mustUpdateDueDate = true;
                vm.mustUpdateStatus = true;
                vm.mustUpdateSubject = true;
                vm.mustUpdateRoom = true;
                vm.mustUpdateIssueType = true;
                vm.mustUpdateInCharge = true;
            });
            it("THEN, canSave equals false", () => {
                expect(vm.canSave).toBeFalsy();
            });
        });
        describe("WHEN there at least one field empty but not checked", () => {
            beforeEach(() => {
                vm.subject = "";
                vm.dueDate = new Date();
                vm.statusSelector.selectEntity("a1989fce-db6a-4d2d-8830-08ebe8bbe49a");
                vm.mustUpdateDueDate = true;
                vm.mustUpdateStatus = true;
                vm.mustUpdateSubject = false;
                vm.mustUpdateRoom = true;
                vm.mustUpdateIssueType = true;
                vm.mustUpdateInCharge = true;
            });
            it("THEN, canSave equals true", () => {
                expect(vm.canSave).toBeTruthy();
            });
        });
    });

    describe("Feature: fields access", () => {
        describe("WHEN the vm is created without specifying a meeting", () => {
            beforeEach(() => {
                vm = <ap.viewmodels.notes.MultiEditNoteRequestViewModel>$controller("multiEditNoteRequestViewModel", { $scope: $scope });
            });

            it("THEN, hasEditDueDate is false", () => {
                expect(vm.hasEditDueDate).toBeFalsy();
            });

            it("THEN, hasEditStatus is false", () => {
                expect(vm.hasEditStatus).toBeFalsy();
            });

            it("THEN, hasEditSubject is false", () => {
                expect(vm.hasEditSubject).toBeFalsy();
            });

            it("THEN, hasEditInCharge is false", () => {
                expect(vm.hasEditInCharge).toBeFalsy();
            });

            it("THEN, hasEditRoom is false", () => {
                expect(vm.hasEditRoom).toBeFalsy();
            });

            it("THEN, hasEditIssueType is false", () => {
                expect(vm.hasEditIssueType).toBeFalsy();
            });
        });

        describe("WHEN the vm is created with a meeting", () => {
            let meeting: ap.models.meetings.Meeting;
            beforeEach(() => {
                meeting = new ap.models.meetings.Meeting(Utility);
                let json: any = {};
                modelSpecHelper.fillEntityJson(json);
                json.Title = "My meeting";

                meeting.UserAccessRight = new ap.models.accessRights.MeetingAccessRight(Utility);
            });
            describe("AND the CanEditPoint equals false AND CanEditPointStatus equals false", () => {
                beforeEach(() => {
                    meeting.UserAccessRight.CanEditPoint = false;
                    meeting.UserAccessRight.CanEditPointStatus = false;
                    meeting.UserAccessRight.CanEditPointIssueType = false;
                    meeting.UserAccessRight.CanEditPointInCharge = false;
                    vm = new ap.viewmodels.notes.MultiEditNoteRequestViewModel(Utility, $mdDialog, Api, $scope, $timeout, $q, ControllersManager, ServicesManager, meeting.UserAccessRight, userCommentIds);
                });
                it("THEN, hasEditDueDate is false", () => {
                    expect(vm.hasEditDueDate).toBeFalsy();
                });

                it("THEN, hasEditStatus is false", () => {
                    expect(vm.hasEditStatus).toBeFalsy();
                });

                it("THEN, hasEditSubject is false", () => {
                    expect(vm.hasEditSubject).toBeFalsy();
                });

                it("THEN, hasEditInCharge is false", () => {
                    expect(vm.hasEditInCharge).toBeFalsy();
                });

                it("THEN, hasEditRoom is false", () => {
                    expect(vm.hasEditRoom).toBeFalsy();
                });

                it("THEN, hasEditIssueType is false", () => {
                    expect(vm.hasEditIssueType).toBeFalsy();
                });
            });
            describe("AND the CanEditPoint equals true AND CanEditPointStatus equals true", () => {
                beforeEach(() => {
                    meeting.UserAccessRight.CanEditPoint = true;
                    meeting.UserAccessRight.CanEditPointStatus = true;
                    meeting.UserAccessRight.CanEditPointIssueType = true;
                    meeting.UserAccessRight.CanEditPointInCharge = true;
                    vm = new ap.viewmodels.notes.MultiEditNoteRequestViewModel(Utility, $mdDialog, Api, $scope, $timeout, $q, ControllersManager, ServicesManager, meeting.UserAccessRight, userCommentIds);
                });
                it("THEN, hasEditDueDate is true", () => {
                    expect(vm.hasEditDueDate).toBeTruthy();
                });

                it("THEN, hasEditStatus is true", () => {
                    expect(vm.hasEditStatus).toBeTruthy();
                });

                it("THEN, hasEditSubject is true", () => {
                    expect(vm.hasEditSubject).toBeTruthy();
                });

                it("THEN, hasEditInCharge is true", () => {
                    expect(vm.hasEditInCharge).toBeTruthy();
                });

                it("THEN, hasEditRoom is true", () => {
                    expect(vm.hasEditRoom).toBeTruthy();
                });

                it("THEN, hasEditIssueType is true", () => {
                    expect(vm.hasEditIssueType).toBeTruthy();
                });
            });
            describe("AND the CanEditPoint equals false AND CanEditPointStatus equals true", () => {
                beforeEach(() => {
                    meeting.UserAccessRight.CanEditPoint = false;
                    meeting.UserAccessRight.CanEditPointStatus = true;
                    meeting.UserAccessRight.CanEditPointIssueType = true;
                    meeting.UserAccessRight.CanEditPointInCharge = true;
                    vm = new ap.viewmodels.notes.MultiEditNoteRequestViewModel(Utility, $mdDialog, Api, $scope, $timeout, $q, ControllersManager, ServicesManager, meeting.UserAccessRight, userCommentIds);
                });
                it("THEN, hasEditDueDate is false", () => {
                    expect(vm.hasEditDueDate).toBeFalsy();
                });

                it("THEN, hasEditStatus is true", () => {
                    expect(vm.hasEditStatus).toBeTruthy();
                });

                it("THEN, hasEditSubject is false", () => {
                    expect(vm.hasEditSubject).toBeFalsy();
                });

                it("THEN, hasEditInCharge is true", () => {
                    expect(vm.hasEditInCharge).toBeTruthy();
                });

                it("THEN, hasEditRoom is false", () => {
                    expect(vm.hasEditRoom).toBeFalsy();
                });

                it("THEN, hasEditIssueType is true", () => {
                    expect(vm.hasEditIssueType).toBeTruthy();
                });
            });
        });
    });

    describe("Feature: save", () => {
        let noteMultiEdit: ap.models.multiactions.NoteMultiEdit;
        let notesResult: ap.models.notes.Note[];
        let callback: jasmine.Spy;
        beforeEach(() => {

            notesResult = [new ap.models.notes.Note(Utility), new ap.models.notes.Note(Utility), new ap.models.notes.Note(Utility)];
            notesResult[0].createByJson({ "Id": "5899C636-7449-44A2-9184-0982407B2F0C" });
            notesResult[1].createByJson({ "Id": "21C1E809-CCE5-41EF-BEDA-E3B85DD1D506" });
            notesResult[2].createByJson({ "Id": "A233B33F-C852-48B4-83CE-CE700BF940B6" });
            callback = jasmine.createSpy("callback");
            noteMultiEdit = new ap.models.multiactions.NoteMultiEdit(Utility);
            vm = new ap.viewmodels.notes.MultiEditNoteRequestViewModel(Utility, $mdDialog, Api, $scope, $timeout, $q, ControllersManager, ServicesManager, meetingAccessRight, userCommentIds);
            spyOn(ControllersManager.noteController, "multiEditNotes").and.returnValue(defMultiEditController.promise);
            $rootScope.$apply();
        });
        describe("WHEN the vm has some input field", () => {
            let result: ap.models.multiactions.NoteMultiActionsResult;
            beforeEach(() => {
                vm.mustUpdateDueDate = true;
                vm.dueDate = new Date(2017, 3, 22);
                vm.mustUpdateSubject = true;
                vm.subject = "New subject";
                vm.mustUpdateStatus = true;
                vm.statusSelector.selectEntity("a1989fce-db6a-4d2d-8830-08ebe8bbe49a");
                noteMultiEdit.DueDate = vm.dueDate;
                noteMultiEdit.UpdateDueDate = true;
                noteMultiEdit.Subject = "New subject";
                noteMultiEdit.UpdateSubject = true;
                noteMultiEdit.StatusId = "a1989fce-db6a-4d2d-8830-08ebe8bbe49a";
                noteMultiEdit.UpdateStatus = true;
                let skipped = [new ap.models.multiactions.NotAppliedActionDescription("0E0DBE9B-587E-436A-84A7-C5AC6079F644", "Not access point", "11", ap.models.notes.NoteType.Note, ap.models.multiactions.NotAppliedReason.CannotChangeIssueType, ap.models.multiactions.MultiAction.ChangeIssueType)];
                result = new ap.models.multiactions.NoteMultiActionsResult(Utility, notesResult, skipped);
                vm.save();

                defMultiEditController.resolve(result);
                $rootScope.$apply();
            });
            it("THEN, NoteController is called with correct parameter", () => {
                expect(ControllersManager.noteController.multiEditNotes).toHaveBeenCalledWith(userCommentIds, noteMultiEdit);
            });
            it("THEN, mdDialog is resolved with the result of api call", () => {
                expect($mdDialog.hide).toHaveBeenCalledWith(result);
            });

        });

    });

    describe("Feature: postChanges", () => {
        let selectedRoom: ap.viewmodels.projects.RoomHierarchyItemViewModel;
        let selectedIssueType: ap.viewmodels.projects.ChapterHierarchyItemViewModel;
        let noteInChargeList: ap.viewmodels.projects.ContactItemViewModel[];
        let noteInCharge: ap.viewmodels.projects.ContactItemViewModel;
        let result: ap.models.multiactions.NoteMultiEdit;
        let date: Date;
        describe("When all fields are filled", () => {
            beforeEach(() => {
                noteInCharge = new ap.viewmodels.projects.ContactItemViewModel("Contact", "1");
                noteInChargeList = [noteInCharge];
                let issueType = new ap.models.projects.IssueType(Utility);
                issueType.createByJson({ Id: issueType.Id + "0" });
                selectedIssueType = new ap.viewmodels.projects.ChapterHierarchyItemViewModel(Utility, $q);
                selectedIssueType.init(issueType);
                let room = new ap.models.projects.SubCell(Utility);
                room.createByJson({ Id: room.Id + "0" });
                selectedRoom = new ap.viewmodels.projects.RoomHierarchyItemViewModel(Utility, $q);
                selectedRoom.init(room);
                vm = new ap.viewmodels.notes.MultiEditNoteRequestViewModel(Utility, $mdDialog, Api, $scope, $timeout, $q, ControllersManager, ServicesManager, meetingAccessRight, userCommentIds);
                $rootScope.$apply();
                specHelper.general.spyProperty(ap.viewmodels.notes.MultiEditNoteRequestViewModel.prototype, "canSave", specHelper.PropertyAccessor.Get).and.returnValue(true);
                specHelper.general.spyProperty(ap.viewmodels.projects.ContactSelectorViewModel.prototype, "selectedContacts", specHelper.PropertyAccessor.Get).and.returnValue(noteInChargeList);
                specHelper.general.spyProperty(ap.viewmodels.projects.IssueTypeSelectorViewModel.prototype, "selectedItem", specHelper.PropertyAccessor.Get).and.returnValue(selectedIssueType);
                specHelper.general.spyProperty(ap.viewmodels.projects.RoomSelectorViewModel.prototype, "selectedItem", specHelper.PropertyAccessor.Get).and.returnValue(selectedRoom);
                vm.subject = "My new subject";
                date = new Date();
                vm.dueDate = date;
                vm.statusSelector.selectEntity("a1989fce-db6a-4d2d-8830-08ebe8bbe49a");
                vm.mustUpdateDueDate = true;
                vm.mustUpdateStatus = true;
                vm.mustUpdateSubject = true;
                vm.mustUpdateRoom = true;
                vm.mustUpdateIssueType = true;
                vm.mustUpdateInCharge = true;

                result = vm.postChanges();
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.notes.MultiEditNoteRequestViewModel.prototype, "canSave", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.viewmodels.projects.ContactSelectorViewModel.prototype, "selectedContacts", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.viewmodels.projects.IssueTypeSelectorViewModel.prototype, "selectedItem", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.viewmodels.projects.RoomSelectorViewModel.prototype, "selectedItem", specHelper.PropertyAccessor.Get);
            });
            it("THEN, Due date is updated", () => {
                expect(result.DueDate).toEqual(date);
                expect(result.UpdateDueDate).toBeTruthy();
            });
            it("THEN,Subject is updated", () => {
                expect(result.Subject).toEqual("My new subject");
                expect(result.UpdateSubject).toBeTruthy();
            });
            it("THEN, Status is updated", () => {
                expect(result.StatusId).toEqual("a1989fce-db6a-4d2d-8830-08ebe8bbe49a");
                expect(result.UpdateStatus).toBeTruthy();
            });
            it("THEN, Room is updated", () => {
                expect(result.RoomId).toEqual(selectedRoom.originalEntity.Id.slice(0, selectedRoom.originalEntity.Id.length - 1));
                expect(result.UpdateRoom).toBeTruthy();
            });
            it("THEN, IssueType is updated", () => {
                expect(result.IssueTypeId).toEqual(selectedIssueType.originalEntity.Id.slice(0, selectedIssueType.originalEntity.Id.length - 1));
                expect(result.UpdateIssueType).toBeTruthy();
            });
            it("THEN, Note in charge is updated", () => {
                expect(result.NoteInCharge[0].Tag).toEqual("Contact");
                expect(result.NoteInCharge[0].UserId).toEqual("1");
                expect(result.UpdateNoteInCharge).toBeTruthy();
            });
        });

        describe("When room, issueType, and note in charge are empty", () => {
            beforeEach(() => {
                noteInCharge = new ap.viewmodels.projects.ContactItemViewModel("Contact", ap.utility.UtilityHelper.createEmptyGuid());
                noteInChargeList = [noteInCharge];
                let issueType = new ap.models.projects.IssueType(Utility);
                issueType.createByJson({ Id: "" });
                selectedIssueType = new ap.viewmodels.projects.ChapterHierarchyItemViewModel(Utility, $q);
                selectedIssueType.init(issueType);
                let room = new ap.models.projects.SubCell(Utility);
                room.createByJson({ Id: "" });
                selectedRoom = new ap.viewmodels.projects.RoomHierarchyItemViewModel(Utility, $q);
                selectedRoom.init(room);
                vm = new ap.viewmodels.notes.MultiEditNoteRequestViewModel(Utility, $mdDialog, Api, $scope, $timeout, $q, ControllersManager, ServicesManager, meetingAccessRight, userCommentIds);
                $rootScope.$apply();
                specHelper.general.spyProperty(ap.viewmodels.notes.MultiEditNoteRequestViewModel.prototype, "canSave", specHelper.PropertyAccessor.Get).and.returnValue(true);
                specHelper.general.spyProperty(ap.viewmodels.projects.ContactSelectorViewModel.prototype, "selectedContacts", specHelper.PropertyAccessor.Get).and.returnValue(noteInChargeList);
                specHelper.general.spyProperty(ap.viewmodels.projects.IssueTypeSelectorViewModel.prototype, "selectedItem", specHelper.PropertyAccessor.Get).and.returnValue(selectedIssueType);
                specHelper.general.spyProperty(ap.viewmodels.projects.RoomSelectorViewModel.prototype, "selectedItem", specHelper.PropertyAccessor.Get).and.returnValue(selectedRoom);
                vm.subject = "My new subject";
                date = new Date();
                vm.dueDate = date;
                vm.statusSelector.selectEntity("a1989fce-db6a-4d2d-8830-08ebe8bbe49a");
                vm.mustUpdateDueDate = true;
                vm.mustUpdateStatus = true;
                vm.mustUpdateSubject = true;
                vm.mustUpdateRoom = true;
                vm.mustUpdateIssueType = true;
                vm.mustUpdateInCharge = true;

                result = vm.postChanges();
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.notes.MultiEditNoteRequestViewModel.prototype, "canSave", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.viewmodels.projects.ContactSelectorViewModel.prototype, "selectedContacts", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.viewmodels.projects.IssueTypeSelectorViewModel.prototype, "selectedItem", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.viewmodels.projects.RoomSelectorViewModel.prototype, "selectedItem", specHelper.PropertyAccessor.Get);
            });
            it("THEN, Due date is updated", () => {
                expect(result.DueDate).toEqual(date);
                expect(result.UpdateDueDate).toBeTruthy();
            });
            it("THEN,Subject is updated", () => {
                expect(result.Subject).toEqual("My new subject");
                expect(result.UpdateSubject).toBeTruthy();
            });
            it("THEN, Status is updated", () => {
                expect(result.StatusId).toEqual("a1989fce-db6a-4d2d-8830-08ebe8bbe49a");
                expect(result.UpdateStatus).toBeTruthy();
            });
            it("THEN, Room is updated", () => {
                expect(result.RoomId).toEqual(null);
                expect(result.UpdateRoom).toBeTruthy();
            });
            it("THEN, IssueType is updated", () => {
                expect(result.IssueTypeId).toEqual(null);
                expect(result.UpdateIssueType).toBeTruthy();
            });
            it("THEN, Note in charge is updated", () => {
                expect(result.NoteInCharge.length).toEqual(0);
                expect(result.UpdateNoteInCharge).toBeTruthy();
            });
        });
    });
});