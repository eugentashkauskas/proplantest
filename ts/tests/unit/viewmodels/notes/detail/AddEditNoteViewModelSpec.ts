describe("Module ap-viewmodels - AddEditNoteViewModel", () => {
    let $rootScope: angular.IRootScopeService, $scope: angular.IScope;
    let Utility: ap.utility.UtilityHelper, UserContext: ap.utility.UserContext;
    let NoteController: ap.controllers.NoteController;
    let $q: angular.IQService;
    let mdDialogDeferred: angular.IDeferred<any>;
    let MainController: ap.controllers.MainController;
    let $mdDialog: angular.material.IDialogService;
    let $timeout: angular.ITimeoutService;
    let ProjectController: ap.controllers.ProjectController;
    let Api: ap.services.apiHelper.Api;
    let defNote: ng.IDeferred<any>;
    let defNoteStatus: ng.IDeferred<any>;
    let defAccessRight: ng.IDeferred<any>;
    let DocumentController: ap.controllers.DocumentController;
    let NoteService: ap.services.NoteService;
    let $location: angular.ILocationService;
    let $anchorScroll: angular.IAnchorScrollService;
    let $interval: angular.IIntervalService;
    let AccessRightController: ap.controllers.AccessRightController;
    let meetingAccessRights: ap.models.accessRights.AccessRight[];
    let ControllersManager: ap.controllers.ControllersManager;
    let ServicesManager: ap.services.ServicesManager;

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
        specHelper.general.spyProperty(ap.viewmodels.notes.NoteDocumentListViewModel.prototype, "isDisplayingPictureViewer", specHelper.PropertyAccessor.Get).and.returnValue(false);
    });

    afterEach(() => {
        specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteDocumentListViewModel.prototype, "isDisplayingPictureViewer", specHelper.PropertyAccessor.Get);
    });

    beforeEach(inject(function (_$q_, _$rootScope_, _MainController_, _Utility_, _UserContext_, _NoteController_, _$mdDialog_, _ProjectController_, _Api_, _DocumentController_, _AccessRightController_, _NoteService_, _$location_, _$anchorScroll_, _$interval_, _$timeout_,
        _ControllersManager_, _ServicesManager_) {
        MainController = _MainController_;
        DocumentController = _DocumentController_;
        AccessRightController = _AccessRightController_;
        modelSpecHelper.setUtilityModule(_Utility_);
        specHelper.userContext.stub(_Utility_);
        specHelper.utility.stubRootUrl(_Utility_);
        Utility = _Utility_;
        ServicesManager = _ServicesManager_;
        ControllersManager = _ControllersManager_;
        UserContext = _UserContext_;
        NoteController = _NoteController_;
        $rootScope = _$rootScope_;
        ProjectController = _ProjectController_;
        $scope = $rootScope.$new();
        $q = _$q_;
        $mdDialog = _$mdDialog_;
        Api = _Api_;
        NoteService = _NoteService_;

        $location = _$location_;
        $anchorScroll = _$anchorScroll_;
        $interval = _$interval_;
        $timeout = _$timeout_;

        spyOn(Utility.Translator, "getTranslation").and.callFake(function (key) {
            return "$" + key;
        });

        spyOn(Utility.Translator, "initLanguage");
        spyOn(MainController, "currentProject").and.returnValue({
            Id: "b360cb6d-ca54-4b93-a564-a469274eb68a",
            Name: "Welcome Project",
            Creator: Utility.UserContext.CurrentUser(),
            UserAccessRight: {
                CanConfig: true
            }
        });

        defAccessRight = $q.defer();
        spyOn(AccessRightController, "geAccessRights").and.returnValue(defAccessRight.promise);

        let accessRights = [{ Id: "M1", ModuleName: "Meeting", Level: ap.models.accessRights.AccessRightLevel.Admin, CanAddPoint: true },
        { Id: "M2", ModuleName: "Meeting", Level: ap.models.accessRights.AccessRightLevel.Manager, CanAddPoint: true },
        { Id: "M3", ModuleName: "Meeting", Level: ap.models.accessRights.AccessRightLevel.Contributor },
        { Id: "M4", ModuleName: "Meeting", Level: ap.models.accessRights.AccessRightLevel.Guest },
        { Id: "M5", ModuleName: "Meeting", Level: ap.models.accessRights.AccessRightLevel.Subcontractor }
        ];
        meetingAccessRights = [];
        for (let i = 0; i < accessRights.length; i++) {
            let meetingAccessRight: ap.models.accessRights.MeetingAccessRight = new ap.models.accessRights.MeetingAccessRight(Utility);
            meetingAccessRight.createByJson(accessRights[i]);
            meetingAccessRights.push(meetingAccessRight);
        }
        defAccessRight.resolve(accessRights);

        let defMeetingIds = $q.defer();
        let defMeetingData = $q.defer();

        let meetingIds = ["M1", "M2", "M3"];
        defMeetingIds.resolve(new ap.services.apiHelper.ApiResponse(meetingIds));

        let meetings = [{ Id: "M1" }, { Id: "M2" }, { Id: "M3" }];
        defMeetingData.resolve(new ap.services.apiHelper.ApiResponse(meetings));

        let defActivity: ng.IDeferred<any> = $q.defer();
        let defActivityIds: ng.IDeferred<any> = $q.defer();
        spyOn(Api, "getApiResponse").and.callFake((url: string) => {
            if (url.indexOf("rest/activitylogsids") === 0)
                return defActivityIds.promise;

            if (url.indexOf("rest/activitylogs") === 0)
                return defActivity.promise;

            if (url.indexOf("rest/accessrights") === 0)
                return defAccessRight.promise;

            if (url.indexOf("rest/meetingsids") === 0)
                return defMeetingIds.promise;

            if (url.indexOf("rest/meetings") === 0)
                return defMeetingData.promise;

            return null;
        });

        defNote = $q.defer();
        defNoteStatus = $q.defer();
        spyOn(NoteController, "createNewNote").and.returnValue(defNote.promise);
        spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue(defNoteStatus.promise);

        spyOn(MainController, "licenseAccess").and.returnValue(new ap.models.licensing.LicenseAccess(Utility));
        spyOn(MainController.licenseAccess(), "hasAccess").and.returnValue(true);

        let defSubject = $q.defer();
        spyOn(ControllersManager.projectController, "getIssueTypeNoteSubject").and.returnValue(defSubject.promise);
    }));

    beforeEach(() => {
        spyOn(ServicesManager.noteService, "getLinkedNotes").and.returnValue($q.defer().promise);
    });

    let createNoteDetailVm = (noteId?: string, location?: angular.ILocationService, anchorScroll?: angular.IAnchorScrollService, interval?: angular.IIntervalService) => {
        return new ap.viewmodels.notes.NoteDetailViewModel(Utility, $mdDialog, $q, Api, ControllersManager, ServicesManager, noteId, location, anchorScroll, interval);
    };

    let createAddEditVm = ($scope: angular.IScope) => {
        return new ap.viewmodels.notes.AddEditNoteViewModel(Utility, $mdDialog, $q, Api, $timeout, $scope, ControllersManager, ServicesManager, createNoteDetailVm());
    }

    describe("Feature: Default values", () => {
        let addEditVm: ap.viewmodels.notes.AddEditNoteViewModel;
        beforeEach(() => {
        });

        describe("WHEN a AddEditNoteViewModel is created", () => {
            beforeEach(() => {
                addEditVm = createAddEditVm($scope);
            });
            it("THEN it's default values are initialized", () => {

                expect(addEditVm).toBeDefined();
                expect(addEditVm.shortcutActions).toBeDefined();
                expect(addEditVm.noteDetailBaseViewModel).toBeDefined();
                expect(addEditVm.issueTypeSelectorViewModel).toBeDefined();
                expect(addEditVm.roomSelectorViewModel).toBeDefined();
                expect(addEditVm.contactSelectorViewModel).toBeDefined();
            });
            it("THEN create shortcutActions with save action", () => {
                expect(addEditVm.shortcutActions[0].name).toEqual("note.save");
            });
        });
        describe("WHEN a AddEditNoteViewModel is created with a noteVm in parameter", () => {
            let noteDetailsVm: ap.viewmodels.notes.NoteDetailViewModel;
            let note: ap.models.notes.Note;
            let defContacts: ng.IDeferred<any>;
            let backupMethod: any;
            let defLoad: ng.IDeferred<any>;

            beforeEach(() => {
                noteDetailsVm = createNoteDetailVm();

                note = new ap.models.notes.Note(Utility);
                note.createByJson({
                    Subject: "Test subject",
                    Meeting: {
                        Id: "M1"
                    },
                    IssueType: {
                        Id: "12"
                    },
                    NoteInCharge: [
                        {
                            Id: "555",
                            Tag: "Quentin"
                        },
                        {
                            Id: "666",
                            Tag: "Sergio"
                        }
                    ]
                });
                specHelper.general.spyProperty(ap.viewmodels.notes.NoteDetailBaseViewModel.prototype, "noteBase", specHelper.PropertyAccessor.Get).and.returnValue(note);

                backupMethod = ap.viewmodels.projects.IssueTypeSelectorViewModel.prototype.load;
                defLoad = $q.defer();
                spyOn(ap.viewmodels.projects.IssueTypeSelectorViewModel.prototype, "load").and.returnValue(defLoad.promise);

                defContacts = $q.defer();
                spyOn(ProjectController, "getIssueTypeLinkedContactDetails").and.returnValue(defContacts.promise);

            });

            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteDetailBaseViewModel.prototype, "noteBase", specHelper.PropertyAccessor.Get);

                ap.viewmodels.projects.IssueTypeSelectorViewModel.prototype.load = backupMethod;
            });

            it("THEN it's default values are initialized AND projectController.getIssueTypeLinkedContactDetails", () => {
                addEditVm = new ap.viewmodels.notes.AddEditNoteViewModel(Utility, $mdDialog, $q, Api, $timeout, $scope, ControllersManager, ServicesManager, noteDetailsVm);

                defLoad.resolve(null);
                $rootScope.$apply();

                expect(addEditVm).toBeDefined();
                expect(addEditVm.contactSelectorViewModel).toBeDefined();

                expect(ProjectController.getIssueTypeLinkedContactDetails).not.toHaveBeenCalled();
                expect(addEditVm.contactSelectorViewModel.selectedContacts.length).toBe(2);
            });

            it("THEN a subject of the given note is used as a search text for the subject list view model", () => {
                addEditVm = new ap.viewmodels.notes.AddEditNoteViewModel(Utility, $mdDialog, $q, Api, $timeout, $scope, ControllersManager, ServicesManager, noteDetailsVm);
                defLoad.resolve(null);
                $rootScope.$apply();

                expect(addEditVm.suggestedIssueTypeSubjectListViewModel.searchText).toEqual("Test subject");
            });
        });
    });

    describe("Feature: select default meeting", () => {
        let addEditVm: ap.viewmodels.notes.AddEditNoteViewModel;
        let noteDetailsVm: ap.viewmodels.notes.NoteDetailViewModel;
        beforeEach(() => {
            spyOn(ControllersManager.noteController, "getFullNoteById").and.returnValue($q.defer().promise);
            spyOn(ap.viewmodels.meetings.MeetingSelectorViewModel.prototype, "load").and.callThrough();
            spyOn(ap.viewmodels.meetings.MeetingSelectorViewModel.prototype, "selectItem").and.callThrough();
            spyOn(ap.viewmodels.meetings.MeetingSelectorViewModel.prototype, "selectMeetingById").and.callThrough();
            noteDetailsVm = createNoteDetailVm();
        });
        describe("WHEN the AddEditNoteViewModel is created for add new note and the user has not the Meeting module", () => {
            beforeEach(() => {
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.returnValue(false);
            });
            it("THEN, the meetingSelector.load method will call and after that select the first meeting (System public)", () => {
                addEditVm = new ap.viewmodels.notes.AddEditNoteViewModel(Utility, $mdDialog, $q, Api, $timeout, $scope, ControllersManager, ServicesManager, noteDetailsVm);
                $rootScope.$apply();
                expect(addEditVm.meetingSelector.load).toHaveBeenCalled();
                expect(addEditVm.meetingSelector.selectItem).toHaveBeenCalledWith("M1");

            });
        });
        describe("WHEN the AddEditNoteViewModel is created for add new note and the user has the Meeting module and currentmeeting is not null", () => {
            beforeEach(() => {
                let currentMeeting: ap.models.meetings.Meeting = new ap.models.meetings.Meeting(Utility);
                currentMeeting.createByJson({ Id: "M2" });
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.returnValue(true);
                specHelper.general.spyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get).and.returnValue(currentMeeting);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get);
            });

            it("THEN, the meetingSelector.selectItem method will call and the current meeting is select by default", () => {
                addEditVm = new ap.viewmodels.notes.AddEditNoteViewModel(Utility, $mdDialog, $q, Api, $timeout, $scope, ControllersManager, ServicesManager, noteDetailsVm);
                $rootScope.$apply();
                expect(addEditVm.meetingSelector.selectMeetingById).toHaveBeenCalledWith("M2");
            });
        });
        describe("WHEN the AddEditNoteViewModel is created for add new note and the user has the Meeting module and currentmeeting is null and the user had select the meeting before", () => {
            beforeEach(() => {
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.returnValue(true);
                spyOn(Utility.Storage.Session, "get").and.returnValue(["b360cb6d-ca54-4b93-a564-a469274eb68a", "M3"]);
                specHelper.general.spyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get).and.returnValue(null);

            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get);
            });

            it("THEN, the meetingSelector.selectItem method will call and the last selected meeting is select by default", () => {
                addEditVm = new ap.viewmodels.notes.AddEditNoteViewModel(Utility, $mdDialog, $q, Api, $timeout, $scope, ControllersManager, ServicesManager, noteDetailsVm);
                $rootScope.$apply();
                expect(addEditVm.meetingSelector.selectMeetingById).toHaveBeenCalledWith("M3");
            });
        });
        describe("WHEN the AddEditNoteViewModel is created for add new note and the user has the Meeting module and currentmeeting is null and the user had not select the meeting before", () => {
            beforeEach(() => {
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.returnValue(true);
                spyOn(Utility.Storage.Session, "get").and.returnValue(null);
                specHelper.general.spyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get).and.returnValue(null);

            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get);
            });

            it("THEN, the meetingSelector.load method will call and private meeting is select by default", () => {
                addEditVm = new ap.viewmodels.notes.AddEditNoteViewModel(Utility, $mdDialog, $q, Api, $timeout, $scope, ControllersManager, ServicesManager, noteDetailsVm);
                $rootScope.$apply();
                expect(addEditVm.meetingSelector.load).toHaveBeenCalled();
                expect(addEditVm.meetingSelector.selectItem).toHaveBeenCalledWith("M1");
            });
        });

        describe("WHEN the AddEditNoteViewModel is created for add new note and the user has the Meeting module and currentmeeting is null and the user had select the meeting in another project", () => {
            beforeEach(() => {
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.returnValue(true);
                spyOn(Utility.Storage.Session, "get").and.returnValue(["P2", "M2"]);
                specHelper.general.spyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get).and.returnValue(null);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get);
            });

            it("THEN, the meetingSelector.load method will call and private meeting is select by default", () => {
                addEditVm = new ap.viewmodels.notes.AddEditNoteViewModel(Utility, $mdDialog, $q, Api, $timeout, $scope, ControllersManager, ServicesManager, noteDetailsVm);
                $rootScope.$apply();
                expect(addEditVm.meetingSelector.load).toHaveBeenCalled();
                expect(addEditVm.meetingSelector.selectItem).toHaveBeenCalledWith("M1");
            });
        });

        describe("WHEN the AddEditNoteViewModel is created for edit a note", () => {
            beforeEach(() => {
                noteDetailsVm = createNoteDetailVm();
                let note = new ap.models.notes.Note(Utility);
                note.createByJson({
                    Meeting: {
                        Id: "M1"
                    },
                });
                specHelper.general.spyProperty(ap.viewmodels.notes.NoteDetailViewModel.prototype, "note", specHelper.PropertyAccessor.Get).and.returnValue(note);

                addEditVm = new ap.viewmodels.notes.AddEditNoteViewModel(Utility, $mdDialog, $q, Api, $timeout, $scope, ControllersManager, ServicesManager, noteDetailsVm);
                $rootScope.$apply();
            });

            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteDetailViewModel.prototype, "note", specHelper.PropertyAccessor.Get);
            });
            it("THEN, the meetingSelector.selectItem will call and the note's meeting is select by default", () => {
                expect(addEditVm.meetingSelector.selectItem).toHaveBeenCalledWith("M1");
            });
        });
    });

    describe("Feature: keep last selected meeting", () => {
        let addEditVm: ap.viewmodels.notes.AddEditNoteViewModel;
        let meetingItemVM: ap.viewmodels.meetings.MeetingItemViewModel;
        beforeEach(() => {
            meetingItemVM = new ap.viewmodels.meetings.MeetingItemViewModel(Utility, $q);
            let meeting = new ap.models.meetings.Meeting(Utility);
            meeting.createByJson({ Id: "M1" });
            meetingItemVM.init(meeting);
            spyOn(Utility.Storage.Session, "set").and.callThrough();
        });
        describe("WHEN the 'selectedItemChanged' was fired from the meetingSelector", () => {
            it("THEN, the Storage.Session.set will be called", () => {
                addEditVm = new ap.viewmodels.notes.AddEditNoteViewModel(Utility, $mdDialog, $q, Api, $timeout, $scope, ControllersManager, ServicesManager, createNoteDetailVm());
                specHelper.general.raiseEvent(addEditVm.meetingSelector, "selectedItemChanged", meetingItemVM);
                $rootScope.$apply();
                expect(Utility.Storage.Session.set).toHaveBeenCalledWith("selectedMeetingId", ["b360cb6d-ca54-4b93-a564-a469274eb68a", "M1"]);
            });
        });
    });

    describe("Feature: Save/Cancel", () => {
        let addEditVm: ap.viewmodels.notes.AddEditNoteViewModel;
        let noteDetailsVm: ap.viewmodels.notes.NoteDetailViewModel = null;
        let note: ap.models.notes.Note;
        beforeEach(() => {
            spyOn(NoteController, "saveNote").and.returnValue($q.defer().promise);
            note = new ap.models.notes.Note(Utility);
            note.createByJson({ Id: "n1", Meeting: { Id: "m1" } });
            noteDetailsVm = createNoteDetailVm();
            noteDetailsVm.init(note)
            addEditVm = new ap.viewmodels.notes.AddEditNoteViewModel(Utility, $mdDialog, $q, Api, $timeout, $scope, ControllersManager, ServicesManager, noteDetailsVm);
        });

        describe("WHEN cancel is called", () => {
            beforeEach(() => {
                spyOn(addEditVm.noteDetailViewModel, "cancel");
                addEditVm.cancel();
            });
            it("THEN noteDetailViewModel.cancel is called", () => {
                expect(addEditVm.noteDetailViewModel.cancel).toHaveBeenCalled();
            });
            it("THEN, the dialog is closed", () => {
                expect($mdDialog.hide).toHaveBeenCalled();
            });
            it("THEN, the edit mode of noteDetail VM is false", () => {
                expect(addEditVm.noteDetailViewModel.isEditMode).toBeFalsy();
            });
        });

        describe("WHEN save is called", () => {
            let chapterHierarchy: ap.models.projects.ChapterHierarchy;
            let cellHierarchy: ap.models.projects.CellHierarchy;

            beforeEach(() => {
                spyOn(addEditVm.noteDetailViewModel, "postChanges");
                spyOn(addEditVm.noteDetailViewModel.noteInChargeList, "fillNoteInCharge");
                cellHierarchy = null;
                chapterHierarchy = null;
                specHelper.general.spyProperty(ap.viewmodels.projects.IssueTypeSelectorViewModel.prototype, "selectedItem", specHelper.PropertyAccessor.Get).and.callFake(() => {
                    if (chapterHierarchy === null) return null;
                    return { originalEntity: chapterHierarchy };
                });
                specHelper.general.spyProperty(ap.viewmodels.projects.RoomSelectorViewModel.prototype, "selectedItem", specHelper.PropertyAccessor.Get).and.callFake(() => {
                    if (cellHierarchy === null) return null;
                    return { originalEntity: cellHierarchy };
                });
                let contactDetailsVm: ap.viewmodels.projects.ContactItemViewModel = new ap.viewmodels.projects.ContactItemViewModel("Quentin", "12");
                specHelper.general.spyProperty(ap.viewmodels.projects.ContactSelectorViewModel.prototype, "selectedContacts", specHelper.PropertyAccessor.Get).and.returnValue([]);

                let meetingItemVM = new ap.viewmodels.meetings.MeetingItemViewModel(Utility, $q);
                let meeting = new ap.models.meetings.Meeting(Utility);
                meeting.createByJson({ Id: "M1" });
                meetingItemVM.init(meeting);

                specHelper.general.spyProperty(ap.viewmodels.meetings.MeetingSelectorViewModel.prototype, "selectedItem", specHelper.PropertyAccessor.Get).and.returnValue(meetingItemVM);

                spyOn(addEditVm.issueTypeSelectorViewModel, "getParentChapter").and.returnValue(<ap.models.projects.ChapterHierarchy>{
                    EntityId: "12",
                    Code: "Code",
                    Description: "Description"
                });

                spyOn(addEditVm.roomSelectorViewModel, "getParentCell").and.returnValue(<ap.models.projects.CellHierarchy>{
                    EntityId: "13",
                    Code: "roomCode",
                    Description: "roomDescription"
                });

                spyOn(addEditVm, "canSave").and.returnValue(true);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.projects.IssueTypeSelectorViewModel.prototype, "selectedItem", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.viewmodels.projects.RoomSelectorViewModel.prototype, "selectedItem", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.viewmodels.projects.ContactSelectorViewModel.prototype, "selectedContacts", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.viewmodels.meetings.MeetingSelectorViewModel.prototype, "selectedItem", specHelper.PropertyAccessor.Get);
            });
            it("selectedIssueTypeId is null THEN, note.IssueType equals to null", () => {
                chapterHierarchy = null;
                addEditVm.save();
                expect(addEditVm.noteDetailViewModel.note.IssueType).toBeNull();
            });
            it("selectedIssueTypeId is NOT null THEN, note.IssueType equals to the selectedIssueTypeId of the view model", () => {
                chapterHierarchy = new ap.models.projects.ChapterHierarchy(Utility);
                chapterHierarchy.createByJson({
                    EntityId: "15",
                    Id: "151",
                    EntityName: "IssueType"
                });
                addEditVm.save();
                expect(addEditVm.noteDetailViewModel.note.IssueType.Id).toBe(chapterHierarchy.EntityId);
                expect(addEditVm.noteDetailViewModel.note.IssueType.Code).toBe(chapterHierarchy.Code);
                expect(addEditVm.noteDetailViewModel.note.IssueType.Description).toBe(chapterHierarchy.Description);
                expect(addEditVm.noteDetailViewModel.note.IssueType.ParentChapter.Id).toBe("12");
                expect(addEditVm.noteDetailViewModel.note.IssueType.ParentChapter.Code).toBe("Code");
                expect(addEditVm.noteDetailViewModel.note.IssueType.ParentChapter.Description).toBe("Description");
            });
            it("selectedRoomId is null THEN, note.IssueType equals to null", () => {
                cellHierarchy = null;
                addEditVm.save();
                expect(addEditVm.noteDetailViewModel.note.Cell).toBeNull();
            });
            it("selectedRoomId is NOT null THEN, note.Cell equals to the selectedRoomId of the view model", () => {
                cellHierarchy = new ap.models.projects.CellHierarchy(Utility);
                cellHierarchy.createByJson({
                    EntityId: "42",
                    Id: "420",
                    EntityName: "SubCell"
                });
                addEditVm.save();

                expect(addEditVm.noteDetailViewModel.note.Cell.Id).toBe(cellHierarchy.EntityId);
                expect(addEditVm.noteDetailViewModel.note.Cell.Code).toBe(cellHierarchy.Code);
                expect(addEditVm.noteDetailViewModel.note.Cell.Description).toBe(cellHierarchy.Description);
                expect(addEditVm.noteDetailViewModel.note.Cell.ParentCell.Id).toBe("13");
                expect(addEditVm.noteDetailViewModel.note.Cell.ParentCell.Code).toBe("roomCode");
                expect(addEditVm.noteDetailViewModel.note.Cell.ParentCell.Description).toBe("roomDescription");
            });
            it("selectedMeetingId is not null, then note.Meeting equals to the selectedMeetingId of the view model", () => {
                addEditVm.save();
                expect(addEditVm.noteDetailViewModel.note.Meeting.Id).toEqual("M1");
            });
            it("AND noteInChargeList.fillNoteInCharge is called", () => {
                addEditVm.save();
                expect(addEditVm.noteDetailViewModel.noteInChargeList.fillNoteInCharge).toHaveBeenCalled();
            });
        });
    });

    describe("Feature: copySubjectToDescription", () => {
        let addEditVm: ap.viewmodels.notes.AddEditNoteViewModel;
        let note: ap.models.notes.Note;

        beforeEach(() => {
            spyOn(NoteController, "getFullNoteById").and.returnValue(defNote.promise);
            note = new ap.models.notes.Note(Utility);
            let firstComment: ap.models.notes.NoteComment = new ap.models.notes.NoteComment(Utility);
            firstComment.IsFirst = true;
            firstComment.Note = note;
            firstComment.Date = new Date();
            firstComment.From = UserContext.CurrentUser();
            note.Comments = [];
            note.Comments.push(firstComment);

            addEditVm = createAddEditVm($scope);

            spyOn(addEditVm.noteDetailViewModel, "gotoAnchor");
            addEditVm.noteDetailViewModel.loadNote(note.Id);
            defNote.resolve(note);
            $rootScope.$apply();
        });

        describe("WHEN a call is made to copySubjectToDescription AND the note is NEW AND the subject is DEFINED AND the subject IS NOT Empty AND the first comment IS EMPTY", () => {
            it("THEN the first comment take the same value as the subject", () => {

                let spyGet = specHelper.general.spyProperty(ap.viewmodels.notes.NoteDetailBaseViewModel.prototype, "subject", specHelper.PropertyAccessor.Get).and.returnValue("This is my subject");

                addEditVm.copySubjectToDescription();

                $rootScope.$apply();

                expect(spyGet).toHaveBeenCalled();
                expect(addEditVm.noteDetailViewModel.noteCommentList.firstComment.comment).toBe("This is my subject");

                specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteDetailBaseViewModel.prototype, "subject", specHelper.PropertyAccessor.Get);

            });
        });

        describe("WHEN a call is made to copySubjectToDescription AND the note is NEW AND the subject is DEFINED AND the subject IS Empty AND the first comment IS EMPTY", () => {
            it("THEN the first comment is not set", () => {

                specHelper.general.spyProperty(ap.viewmodels.notes.NoteDetailBaseViewModel.prototype, "subject", specHelper.PropertyAccessor.Get).and.returnValue("");

                let spySet = specHelper.general.spyProperty(ap.viewmodels.notes.NoteCommentViewModel.prototype, "comment", specHelper.PropertyAccessor.Set);

                addEditVm.copySubjectToDescription();

                expect(spySet).not.toHaveBeenCalled();

                specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteDetailBaseViewModel.prototype, "subject", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteCommentViewModel.prototype, "comment", specHelper.PropertyAccessor.Set);
            });
        });

        describe("WHEN a call is made to copySubjectToDescription AND the note is NEW AND the subject is DEFINED AND the subject IS NOT Empty AND the first comment IS NOT EMPTY", () => {
            it("THEN the first comment is not set", () => {

                specHelper.general.spyProperty(ap.viewmodels.notes.NoteDetailBaseViewModel.prototype, "subject", specHelper.PropertyAccessor.Get).and.returnValue("This is my subject");
                addEditVm.noteDetailViewModel.noteCommentList.firstComment.comment = "This is my description";

                let spySet = specHelper.general.spyProperty(ap.viewmodels.notes.NoteCommentViewModel.prototype, "comment", specHelper.PropertyAccessor.Set);

                addEditVm.copySubjectToDescription();

                expect(spySet).not.toHaveBeenCalled();

                specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteDetailBaseViewModel.prototype, "subject", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteCommentViewModel.prototype, "comment", specHelper.PropertyAccessor.Set);
            });
        });

        describe("WHEN the note subject is not empty and setting subject to empty and calling copySubjectToDescription with 'reset' param", () => {
            it("THEN the previous subject is seleted", () => {

                specHelper.general.spyProperty(ap.viewmodels.notes.NoteDetailBaseViewModel.prototype, "subject", specHelper.PropertyAccessor.Get).and.returnValue("This is my subject");
                addEditVm.noteDetailViewModel.noteCommentList.firstComment.comment = "This is my description";

                let spySet = specHelper.general.spyProperty(ap.viewmodels.notes.NoteCommentViewModel.prototype, "comment", specHelper.PropertyAccessor.Set);

                addEditVm.copySubjectToDescription();

                addEditVm.noteDetailViewModel.subject = null;
                addEditVm.suggestedIssueTypeSubjectListViewModel.searchText = null;

                addEditVm.copySubjectToDescription("reset");
                expect(addEditVm.suggestedIssueTypeSubjectListViewModel.searchText).toBe("This is my subject");
                expect(addEditVm.noteDetailViewModel.subject).toBe("This is my subject");

                specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteDetailBaseViewModel.prototype, "subject", specHelper.PropertyAccessor.Get);

                specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteCommentViewModel.prototype, "comment", specHelper.PropertyAccessor.Set);
            });
        });
    });

    describe("Feature: updateSubjectFromSuggestedList", () => {
        let addEditVm: ap.viewmodels.notes.AddEditNoteViewModel;
        let note: ap.models.notes.Note;

        beforeEach(() => {
            note = new ap.models.notes.Note(Utility);
            addEditVm = createAddEditVm($scope);

            spyOn(addEditVm.noteDetailViewModel, "gotoAnchor");

            defNote.resolve(note);
            $rootScope.$apply();
            let firstComment = new ap.viewmodels.notes.NoteCommentViewModel(Utility, NoteController, MainController);
            firstComment.comment = "My comment";
            specHelper.general.spyProperty(ap.viewmodels.notes.NoteCommentListViewModel.prototype, "firstComment", specHelper.PropertyAccessor.Get).and.returnValue(firstComment);
        });
        afterEach(() => {
            specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteCommentListViewModel.prototype, "firstComment", specHelper.PropertyAccessor.Get);
        });
        describe("WHEN a call is made to updateSubjectFromSuggestedList ", () => {
            it("THEN the subject of the note becomes the value returned by the getSubject method of the suggestedIssueTypeSubjectListViewModel", () => {

                spyOn(addEditVm.suggestedIssueTypeSubjectListViewModel, "getSubject").and.returnValue("This is my subject");

                addEditVm.updateSubjectFromSuggestedList();

                $rootScope.$apply();

                expect(addEditVm.noteDetailViewModel.subject).toBe("This is my subject");
            });
        });
    });

    describe("Feature: setSubject", () => {
        let addEditVm: ap.viewmodels.notes.AddEditNoteViewModel;
        let note: ap.models.notes.Note;
        beforeEach(() => {
            note = new ap.models.notes.Note(Utility);
            note.Subject = "Subject";
            let firstComment: ap.models.notes.NoteComment = new ap.models.notes.NoteComment(Utility);
            firstComment.IsFirst = true;
            firstComment.Note = note;
            firstComment.Date = new Date();
            firstComment.From = UserContext.CurrentUser();
            note.Comments = [];
            note.Comments.push(firstComment);

            addEditVm = createAddEditVm($scope);

            spyOn(addEditVm.noteDetailViewModel, "gotoAnchor");

            defNote.resolve(note);
            $rootScope.$apply();
        });
        describe("When setSubject method was called with the subject", () => {
            it("THEN, the noteDetailViewModel.Subject will be update", () => {
                addEditVm.setSubject("aaa");
                $rootScope.$apply();
                expect(addEditVm.noteDetailViewModel.subject).toEqual("aaa");
            });
            it("THEN, suggestedIssueTypeSubjectListViewModel.searchText will be update if it undefined", () => {
                addEditVm.suggestedIssueTypeSubjectListViewModel.searchText = undefined;
                addEditVm.setSubject("aaa");
                $rootScope.$apply();
                expect(addEditVm.suggestedIssueTypeSubjectListViewModel.searchText).toEqual("aaa");
            });
        }
        );
    });
    describe("Feature: destroy", () => {
        let addEditVm: ap.viewmodels.notes.AddEditNoteViewModel;

        beforeEach(() => {
            addEditVm = createAddEditVm($scope);
        });

        describe("WHEN destroy is called", () => {
            it("THEN, the viewmodel unscribe of all events he was subscribed to", () => {
                spyOn(NoteController, "off");
                let spyIssueType = spyOn(addEditVm.issueTypeSelectorViewModel, "dispose");
                let spyRoom = spyOn(addEditVm.roomSelectorViewModel.listVm, "dispose");
                let spyContact = spyOn(addEditVm.contactSelectorViewModel, "dispose");
                addEditVm.dispose();

                expect(spyIssueType).toHaveBeenCalled();
                expect(spyRoom).toHaveBeenCalled();
                expect(spyContact).toHaveBeenCalled();
            });
        });
    });

    describe("Feature: Create the AddEditNoteViewModel", () => {
        let noteVm: ap.viewmodels.notes.NoteDetailViewModel;
        let defNote: angular.IDeferred<ap.models.notes.Note>;
        let defLoad: angular.IDeferred<ap.viewmodels.GenericPagedListViewModels>;
        let defLoadRoom: angular.IDeferred<ap.viewmodels.GenericPagedListViewModels>;
        let addEditVm: ap.viewmodels.notes.AddEditNoteViewModel;
        let spySelect: jasmine.Spy;
        let spyLoad: jasmine.Spy;
        let spyLoadRoom: jasmine.Spy;
        let backup, backupLoad, backupLoadRoom;

        let noteJson = {
            Id: "b360cb6d-ca54-4b93-a564-a469274eb68a",
            Subject: "Note 1",
            CodeNum: "1.01",
            IsUrgent: true,
            IsReadOnly: false,
            ProblemLocation: 2,
            Cell: {
                Id: "12",
                Code: "C1",
                Description: "Cell 1",
                ParentCell: {
                    Code: "P1",
                    Description: "ParentCell 1"
                }
            },
            IssueType: {
                Id: "14",
                Code: "IT1",
                Description: "IssueType 1",
                ParentChapter: {
                    Code: "PC1",
                    Description: "ParentChapter 1"
                }
            },
            From: {
                Alias: "aproplan@aproplan.com",
                Person: {
                    Name: "Quentin Luc"
                }
            },
            Comments: [
                {
                    Id: "2CB28A42-58DD-4294-85AB-41EE585F5AF4",
                    IsRead: false,
                    IsFirst: true,
                    Comment: "First comment of the point",
                    EntityVersion: 1,
                    Date: '/Date(1442565731892)/'
                },
                {
                    Id: "b8d13dfc-4124-4340-be59-fbc2b22db6a3",
                    IsRead: true,
                    IsFirst: false,
                    Comment: "Second comment of the point",
                    EntityVersion: 1,
                    Date: '/Date(1442565731892)/'
                }
            ],
            Meeting: {
                Id: "M1"
            },
            MeetingAccessRight:
                {
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
                    CanEditPointIssueType: true,
                    CanEditPointInCharge: true,
                    CanAddPointDocument: true,
                    CanDeletePointDocument: true,
                    Level: ap.models.accessRights.AccessRightLevel.Admin
                }
        };

        beforeEach(() => {

            defNote = $q.defer();
            defLoad = $q.defer();
            defLoadRoom = $q.defer();

            spyOn(NoteController, "getFullNoteById").and.returnValue(defNote.promise);
            spyOn(NoteController, "getAllowedNewFileType");

            let noteEntity: ap.models.notes.Note = new ap.models.notes.Note(Utility);
            noteEntity.createByJson(noteJson);

            noteVm = createNoteDetailVm("2", $location, $anchorScroll, $interval);

            defNote.resolve(noteEntity);
            $rootScope.$apply();

            backup = ap.viewmodels.GenericPagedListViewModels.prototype.selectEntity;
            spySelect = spyOn(ap.viewmodels.GenericPagedListViewModels.prototype, "selectEntity");
            backupLoad = ap.viewmodels.projects.IssueTypeSelectorViewModel.prototype.load;
            spyLoad = spyOn(ap.viewmodels.projects.IssueTypeSelectorViewModel.prototype, "load");
            spyLoad.and.returnValue(defLoad.promise);

            backupLoadRoom = ap.viewmodels.projects.RoomSelectorViewModel.prototype.load;
            spyLoadRoom = spyOn(ap.viewmodels.projects.RoomSelectorViewModel.prototype, "load");
            spyLoadRoom.and.returnValue(defLoadRoom.promise);

            addEditVm = new ap.viewmodels.notes.AddEditNoteViewModel(Utility, $mdDialog, $q, Api, $timeout, $scope, ControllersManager, ServicesManager, noteVm);
        });

        afterEach(() => {
            ap.viewmodels.GenericPagedListViewModels.prototype.selectEntity = backup;
            ap.viewmodels.projects.IssueTypeSelectorViewModel.prototype.load = backupLoad;
            ap.viewmodels.projects.RoomSelectorViewModel.prototype.load = backupLoadRoom;
        });

        describe("WHEN, a AddEditNoteViewModel is created with a noteDetailVm", () => {
            it("THEN, the Vm is built with the correct values", () => {

                expect(addEditVm.noteDetailViewModel).toBe(noteVm);
            });

            it("THEN, the vmSelector are initiliazed", () => {
                //spyLoad.res
                defLoad.resolve(null);
                defLoadRoom.resolve(null);
                $rootScope.$apply();

                expect(spySelect.calls.count()).toBe(3);

                expect(spySelect.calls.argsFor(0)[0]).toBe("121");
                expect(spySelect.calls.argsFor(1)[0]).toBe("141");
                expect(spySelect.calls.argsFor(2)[0]).toBe("M1"); //Select note's meeting
            });
        });
    });

    describe("Feature: maySave", () => {
        let noteVm: ap.viewmodels.notes.NoteDetailViewModel;
        let defNote: angular.IDeferred<ap.models.notes.Note>;
        let defLoad: angular.IDeferred<ap.viewmodels.GenericPagedListViewModels>;
        let defLoadRoom: angular.IDeferred<ap.viewmodels.GenericPagedListViewModels>;
        let defContact: angular.IDeferred<ap.services.apiHelper.ApiResponse>;
        let addEditVm: ap.viewmodels.notes.AddEditNoteViewModel;
        let spySelect: jasmine.Spy;
        let spyLoad: jasmine.Spy;
        let spyLoadRoom: jasmine.Spy;
        let chapterHierarchyEntityVM: ap.viewmodels.projects.ChapterHierarchyItemViewModel;
        let chapterHierarchyEntityVM2: ap.viewmodels.projects.ChapterHierarchyItemViewModel;
        let roomHierarchyEntityVM: ap.viewmodels.projects.RoomHierarchyItemViewModel;
        let roomHierarchyEntityVM2: ap.viewmodels.projects.RoomHierarchyItemViewModel;
        let meetingItemViewModel2: ap.viewmodels.meetings.MeetingItemViewModel;
        let noteJson = {
            Id: "b360cb6d-ca54-4b93-a564-a469274eb68a",
            Subject: "Note 1",
            CodeNum: "1.01",
            IsUrgent: true,
            IsReadOnly: false,
            ProblemLocation: 2,
            Cell: {
                Id: "12",
                Code: "C1",
                Description: "Cell 1",
                ParentCell: {
                    Code: "P1",
                    Description: "ParentCell 1"
                }
            },
            IssueType: {
                Id: "14",
                Code: "IT1",
                Description: "IssueType 1",
                ParentChapter: {
                    Code: "PC1",
                    Description: "ParentChapter 1"
                }
            },
            Status: {
                Id: "a1989fce-db6a-4d2d-8830-08ebe8bbe49a" //in progress
            },
            From: {
                Alias: "aproplan@aproplan.com",
                Person: {
                    Name: "Quentin Luc"
                }
            },
            Comments: [
                {
                    Id: "2CB28A42-58DD-4294-85AB-41EE585F5AF4",
                    IsRead: false,
                    IsFirst: true,
                    Comment: "First comment of the point",
                    EntityVersion: 1,
                    Date: '/Date(1442565731892)/'
                },
                {
                    Id: "b8d13dfc-4124-4340-be59-fbc2b22db6a3",
                    IsRead: true,
                    IsFirst: false,
                    Comment: "Second comment of the point",
                    EntityVersion: 1,
                    Date: '/Date(1442565731891)/'
                }
            ],
            Meeting: {
                Id: "M1"
            },
            MeetingAccessRight:
                {
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
                    CanEditPointIssueType: true,
                    CanEditPointInCharge: true,
                    CanAddPointDocument: true,
                    CanDeletePointDocument: true,
                    Level: ap.models.accessRights.AccessRightLevel.Admin
                }
        };

        beforeEach(() => {
            defNote = $q.defer();
            defLoad = $q.defer();
            defLoadRoom = $q.defer();
            defContact = $q.defer();

            spyOn(NoteController, "getFullNoteById").and.returnValue(defNote.promise);
            spyOn(NoteController, "getAllowedNewFileType");

            let noteEntity: ap.models.notes.Note = new ap.models.notes.Note(Utility);
            noteEntity.createByJson(noteJson);

            noteVm = createNoteDetailVm("2", $location, $anchorScroll, $interval);

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

            defNoteStatus.resolve(noteProjectStatusList);
            defNote.resolve(noteEntity);
            $rootScope.$apply();

            spyLoad = spyOn(ap.viewmodels.projects.IssueTypeSelectorViewModel.prototype, "load");
            spyLoad.and.returnValue(defLoad.promise);

            spyLoadRoom = spyOn(ap.viewmodels.projects.RoomSelectorViewModel.prototype, "load");
            spyLoadRoom.and.returnValue(defLoadRoom.promise);

            addEditVm = new ap.viewmodels.notes.AddEditNoteViewModel(Utility, $mdDialog, $q, Api, $timeout, $scope, ControllersManager, ServicesManager, noteVm);

            defLoad.resolve(null);
            defLoadRoom.resolve(null);
            $rootScope.$apply();

            let issueTypeJson = {
                EntityName: "IssueType",
                EntityId: "14",
                Id: "14",
                Code: "IT1",
                Description: "IssueType 1",
                ParentChapter: {
                    Code: "PC1",
                    Description: "ParentChapter 1"
                }
            }

            let issueTypeJson2 = {
                EntityName: "IssueType",
                EntityId: "15",
                Id: "15",
                Code: "IT2",
                Description: "IssueType 2",
                ParentChapter: {
                    Code: "PC1",
                    Description: "ParentChapter 1"
                }
            }

            spyOn(ProjectController, "getIssueTypeLinkedContactDetails").and.returnValue(defContact.promise);

            let chapterHierarchyEntity: ap.models.projects.ChapterHierarchy = new ap.models.projects.ChapterHierarchy(Utility);
            chapterHierarchyEntity.createByJson(issueTypeJson);
            chapterHierarchyEntityVM = new ap.viewmodels.projects.ChapterHierarchyItemViewModel(Utility, $q);
            chapterHierarchyEntityVM.init(chapterHierarchyEntity);

            let chapterHierarchyEntity2: ap.models.projects.ChapterHierarchy = new ap.models.projects.ChapterHierarchy(Utility);
            chapterHierarchyEntity2.createByJson(issueTypeJson2);
            chapterHierarchyEntityVM2 = new ap.viewmodels.projects.ChapterHierarchyItemViewModel(Utility, $q);
            chapterHierarchyEntityVM2.init(chapterHierarchyEntity2);

            addEditVm.issueTypeSelectorViewModel.listVm.sourceItems = [chapterHierarchyEntityVM, chapterHierarchyEntityVM2];
            addEditVm.issueTypeSelectorViewModel.listVm.selectedViewModel = chapterHierarchyEntityVM;

            defContact.resolve(new ap.services.apiHelper.ApiResponse([]));
            $rootScope.$apply();

            let cellJson = {
                EntityName: "SubCell",
                EntityId: "12",
                Id: "12",
                Code: "C1",
                Description: "Cell 1",
                ParentCell: {
                    Code: "P1",
                    Description: "ParentCell 1"
                }
            }

            let cellJson2 = {
                EntityName: "SubCell",
                EntityId: "11",
                Id: "11",
                Code: "C2",
                Description: "Cell 2",
                ParentCell: {
                    Code: "P1",
                    Description: "ParentCell 1"
                }
            }

            let cellHierarchyEntity: ap.models.projects.CellHierarchy = new ap.models.projects.CellHierarchy(Utility);
            cellHierarchyEntity.createByJson(cellJson);
            roomHierarchyEntityVM = new ap.viewmodels.projects.RoomHierarchyItemViewModel(Utility, $q);
            roomHierarchyEntityVM.init(cellHierarchyEntity);

            let cellHierarchyEntity2: ap.models.projects.CellHierarchy = new ap.models.projects.CellHierarchy(Utility);
            cellHierarchyEntity2.createByJson(cellJson2);
            roomHierarchyEntityVM2 = new ap.viewmodels.projects.RoomHierarchyItemViewModel(Utility, $q);
            roomHierarchyEntityVM2.init(cellHierarchyEntity2);

            addEditVm.roomSelectorViewModel.listVm.sourceItems = [roomHierarchyEntityVM, roomHierarchyEntityVM2];
            addEditVm.roomSelectorViewModel.listVm.selectedViewModel = roomHierarchyEntityVM;

            let meeting2 = new ap.models.meetings.Meeting(Utility);
            meeting2.createByJson({ Id: "M2" });
            meetingItemViewModel2 = new ap.viewmodels.meetings.MeetingItemViewModel(Utility, $q);
            meetingItemViewModel2.init(meeting2);

            $rootScope.$apply();
        });

        describe("WHEN NoteDetailsVM maySave is false and AddEditNoteViewModel hasChanged is false ", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.viewmodels.notes.NoteDetailViewModel.prototype, "maySave", specHelper.PropertyAccessor.Get).and.returnValue(false);
                specHelper.general.spyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "hasChanged", specHelper.PropertyAccessor.Get).and.returnValue(false);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteDetailViewModel.prototype, "maySave", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "hasChanged", specHelper.PropertyAccessor.Get);
            });
            it("THEN canSave is false", () => {
                expect(addEditVm.canSave()).toBeFalsy();
            });
        });

        describe("WHEN NoteDetailsVM maySave is true and AddEditNoteViewModel hasChanged is false ", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.viewmodels.notes.NoteDetailViewModel.prototype, "maySave", specHelper.PropertyAccessor.Get).and.returnValue(true);
                specHelper.general.spyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "hasChanged", specHelper.PropertyAccessor.Get).and.returnValue(false);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteDetailViewModel.prototype, "maySave", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "hasChanged", specHelper.PropertyAccessor.Get);
            });
            it("THEN canSave is false", () => {
                expect(addEditVm.canSave()).toBeFalsy();
            });
        });

        describe("WHEN NoteDetailsVM maySave is false and AddEditNoteViewModel hasChanged is true ", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.viewmodels.notes.NoteDetailViewModel.prototype, "maySave", specHelper.PropertyAccessor.Get).and.returnValue(false);
                specHelper.general.spyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "hasChanged", specHelper.PropertyAccessor.Get).and.returnValue(true);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteDetailViewModel.prototype, "maySave", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "hasChanged", specHelper.PropertyAccessor.Get);
            });
            it("THEN canSave is false", () => {
                expect(addEditVm.canSave()).toBeFalsy();
            });
        });

        describe("WHEN NoteDetailsVM maySave is true, hasEditMeeting is TRUE and AddEditNoteViewModel hasChanged is true and meetingSelector.selectedItem is null ", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.viewmodels.notes.NoteDetailViewModel.prototype, "maySave", specHelper.PropertyAccessor.Get).and.returnValue(true);
                specHelper.general.spyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "hasChanged", specHelper.PropertyAccessor.Get).and.returnValue(true);
                specHelper.general.spyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "hasEditMeeting", specHelper.PropertyAccessor.Get).and.returnValue(true);

            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteDetailViewModel.prototype, "maySave", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "hasChanged", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "hasEditMeeting", specHelper.PropertyAccessor.Get);
            });
            it("THEN canSave is false", () => {
                addEditVm.meetingSelector.selectedItem = null;
                expect(addEditVm.canSave()).toBeFalsy();
            });
        });

        describe("WHEN NoteDetailsVM maySave is true, hasEditMeeting is FALSE and AddEditNoteViewModel hasChanged is true and meetingSelector.selectedItem is null ", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.viewmodels.notes.NoteDetailViewModel.prototype, "maySave", specHelper.PropertyAccessor.Get).and.returnValue(true);
                specHelper.general.spyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "hasChanged", specHelper.PropertyAccessor.Get).and.returnValue(true);
                specHelper.general.spyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "hasEditMeeting", specHelper.PropertyAccessor.Get).and.returnValue(false);

            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteDetailViewModel.prototype, "maySave", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "hasChanged", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "hasEditMeeting", specHelper.PropertyAccessor.Get);
            });
            it("THEN canSave is true", () => {
                addEditVm.meetingSelector.selectedItem = null;
                expect(addEditVm.canSave()).toBeTruthy();
            });
        });

        describe("WHEN NoteDetailsVM maySave is true and AddEditNoteViewModel hasChanged is true and  meetingSelector.selectedItem is not null", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.viewmodels.notes.NoteDetailViewModel.prototype, "maySave", specHelper.PropertyAccessor.Get).and.returnValue(true);
                specHelper.general.spyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "hasChanged", specHelper.PropertyAccessor.Get).and.returnValue(true);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteDetailViewModel.prototype, "maySave", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "hasChanged", specHelper.PropertyAccessor.Get);
            });
            it("THEN canSave is true", () => {
                addEditVm.meetingSelector.selectedItem = meetingItemViewModel2;
                expect(addEditVm.canSave()).toBeTruthy();
            });
        });
    });

    describe("Feature: change the meeting of a point", () => {
        describe("WHEN a user add a point", () => {
            let addEditVm: ap.viewmodels.notes.AddEditNoteViewModel;
            let meeting: ap.models.meetings.Meeting;
            describe("AND has access to the meeting module", () => {
                beforeEach(() => {
                    spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.returnValue(true);
                });
                describe("WHEN he is in the meeting module (a meeting is selected)", () => {
                    beforeEach(() => {
                        meeting = new ap.models.meetings.Meeting(Utility);
                        meeting.Title = "myMeeting";
                        specHelper.general.spyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get).and.returnValue(meeting);
                        addEditVm = createAddEditVm($scope);
                    });
                    afterEach(() => {
                        specHelper.general.offSpyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get);
                    });
                    it("THEN he cannot change the meeting of the note", () => {
                        expect(addEditVm.canEditMeeting).toBeFalsy();
                    });
                });
                describe("WHEN he is in the meeting module (entire project)", () => {
                    beforeEach(() => {
                        specHelper.general.spyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get).and.returnValue(null);
                        addEditVm = createAddEditVm($scope);
                    });
                    afterEach(() => {
                        specHelper.general.offSpyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get);
                    });
                    it("THEN he can change the meeting of the note", () => {
                        expect(addEditVm.canEditMeeting).toBeTruthy();
                    });
                });
            });
            describe("AND has NOT access to the meeting module", () => {
                beforeEach(() => {
                    spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.returnValue(false);
                    addEditVm = createAddEditVm($scope);
                });
                it("THEN he cannot change the meeting of the note", () => {
                    expect(addEditVm.canEditMeeting).toBeFalsy();
                });
            });
        });
    });

    describe("Feature: handleShortcutAction", () => {
        let addEditVm: ap.viewmodels.notes.AddEditNoteViewModel;
        beforeEach(() => {
            addEditVm = createAddEditVm($scope);
        });

        describe("WHEN call handleShortcutAction with 'note.save'", () => {


            beforeEach(() => {
                specHelper.general.spyProperty(ap.viewmodels.notes.NoteDetailViewModel.prototype, "maySave", specHelper.PropertyAccessor.Get).and.returnValue(true);
                specHelper.general.spyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "hasChanged", specHelper.PropertyAccessor.Get).and.returnValue(true);
                specHelper.general.spyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "hasEditMeeting", specHelper.PropertyAccessor.Get).and.returnValue(false);
                spyOn(addEditVm, "save");
                addEditVm.handleShortcutAction("note.save");
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteDetailViewModel.prototype, "maySave", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "hasChanged", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "hasEditMeeting", specHelper.PropertyAccessor.Get);
            });
            it("THEN call save method", () => {
                expect(addEditVm.save).toHaveBeenCalled();
            });
        })
    })
});
