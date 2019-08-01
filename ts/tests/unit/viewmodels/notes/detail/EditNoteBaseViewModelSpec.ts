describe("Module ap-viewmodels - EditNoteBaseViewModel", () => {
    let $rootScope: angular.IRootScopeService, $scope: angular.IScope;
    let Utility: ap.utility.UtilityHelper, UserContext: ap.utility.UserContext;
    let NoteController: ap.controllers.NoteController;
    let $q: angular.IQService;
    let mdDialogDeferred: angular.IDeferred<any>;
    let MainController: ap.controllers.MainController;
    let $mdDialog: angular.material.IDialogService;
    let $controller: angular.IControllerService;
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

    beforeEach(inject(function (_$q_, _$controller_, _$rootScope_, _MainController_, _Utility_, _UserContext_, _NoteController_, _$mdDialog_, _ProjectController_, _Api_, _DocumentController_, _AccessRightController_, _NoteService_, _$location_, _$anchorScroll_, _$interval_, _$timeout_,
        _ControllersManager_, _ServicesManager_) {
        $controller = _$controller_;
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
        spyOn(NoteService, "getLinkedNotes").and.returnValue($q.defer().promise);
        spyOn(MainController, "licenseAccess").and.returnValue(new ap.models.licensing.LicenseAccess(Utility));
        spyOn(MainController.licenseAccess(), "hasAccess").and.returnValue(true);

        let defSubject = $q.defer();
        spyOn(ControllersManager.projectController, "getIssueTypeNoteSubject").and.returnValue(defSubject.promise);
    }));

    class MockVm extends ap.viewmodels.notes.EditNoteBaseViewModel {
        public canSave(): boolean { return true; }

        constructor(utility: ap.utility.UtilityHelper, mdDialog: angular.material.IDialogService, q: angular.IQService, api: ap.services.apiHelper.Api, timeout: angular.ITimeoutService,
            scope: ng.IScope, controllersManager: ap.controllers.ControllersManager, servicesManager: ap.services.ServicesManager, noteDetailBaseVm: ap.viewmodels.notes.NoteDetailBaseViewModel,
            document: ap.models.documents.Document = null, isForNoteModule: boolean = true, isforNoteDetail: boolean = false, isFirstInit: boolean = false) {
            super(utility, mdDialog, q, api, timeout, scope, controllersManager, servicesManager, noteDetailBaseVm, document, isForNoteModule, isforNoteDetail, isFirstInit);

            this.init(noteDetailBaseVm);
        }
    };

    let createVm = (noteDetailsVm: ap.viewmodels.notes.NoteDetailBaseViewModel) => {
        return new MockVm(Utility, $mdDialog, $q, Api, $timeout, $scope, ControllersManager, ServicesManager, noteDetailsVm);
    };

    let createNoteDetailVm = (noteId?: string, location?: angular.ILocationService, anchorScroll?: angular.IAnchorScrollService, interval?: angular.IIntervalService) => {
        let vm: ap.viewmodels.notes.NoteDetailBaseViewModel = new ap.viewmodels.notes.NoteDetailBaseViewModel(Utility, $mdDialog, $q, Api, ControllersManager, ServicesManager, noteId, location, anchorScroll, interval);
        vm.init(new ap.models.notes.Note(Utility));
        return vm;
    };

    describe("Feature: Default values", () => {
        let addEditVm: ap.viewmodels.notes.EditNoteBaseViewModel;

        describe("WHEN a EditNoteBaseViewModel is created", () => {
            beforeEach(() => {
                addEditVm = createVm(createNoteDetailVm()); // <ap.viewmodels.notes.EditNoteBaseViewModel>$controller("EditNoteBaseViewModel", { $scope: $scope });
            });
            it("THEN it's default values are initialized", () => {

                expect(addEditVm).toBeDefined();
                expect(addEditVm.noteDetailBaseViewModel).toBeDefined();
                expect(addEditVm.issueTypeSelectorViewModel).toBeDefined();
                expect(addEditVm.contactSelectorViewModel).toBeDefined();
            });
        });

        describe("WHEN a EditNoteBaseViewModel is created with a noteVm in parameter", () => {
            let noteDetailsVm: ap.viewmodels.notes.NoteDetailBaseViewModel;
            let note: ap.models.notes.Note;
            let defContacts: ng.IDeferred<any>;
            let backupMethod, backupInitUser: any;
            let defLoad: ng.IDeferred<any>;
            let spyInitUser: jasmine.Spy;

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
                noteDetailsVm.init(note);

                specHelper.general.spyProperty(ap.viewmodels.notes.NoteDetailBaseViewModel.prototype, "noteBase", specHelper.PropertyAccessor.Get).and.returnValue(note);

                backupMethod = ap.viewmodels.projects.IssueTypeSelectorViewModel.prototype.load;
                backupInitUser = ap.viewmodels.projects.ContactSelectorViewModel.prototype.initUsers;
                defLoad = $q.defer();
                spyOn(ap.viewmodels.projects.IssueTypeSelectorViewModel.prototype, "load").and.returnValue(defLoad.promise);

                defContacts = $q.defer();
                spyOn(ProjectController, "getIssueTypeLinkedContactDetails").and.returnValue(defContacts.promise);

                spyInitUser = spyOn(ap.viewmodels.projects.ContactSelectorViewModel.prototype, "initUsers");

                addEditVm = createVm(noteDetailsVm);

                defLoad.resolve(null);
                $rootScope.$apply();
            });

            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteDetailBaseViewModel.prototype, "noteBase", specHelper.PropertyAccessor.Get);

                ap.viewmodels.projects.IssueTypeSelectorViewModel.prototype.load = backupMethod;
                ap.viewmodels.projects.ContactSelectorViewModel.prototype.initUsers = backupInitUser;
            });

            it("THEN it's default values are initialized AND projectController.getIssueTypeLinkedContactDetails", () => {
                expect(spyInitUser).toHaveBeenCalledWith(note.NoteInCharge);
            });

            it("THEN a subject of the given note is used as a search text for the subject list view model", () => {
                expect(addEditVm.suggestedIssueTypeSubjectListViewModel.searchText).toEqual("Test subject");
            });
        });
    });

    describe("Feature: select default meeting", () => {
        let addEditVm: ap.viewmodels.notes.EditNoteBaseViewModel;
        let noteDetailsVm: ap.viewmodels.notes.NoteDetailBaseViewModel = null;
        beforeEach(() => {
            noteDetailsVm = createNoteDetailVm();
            spyOn(ap.viewmodels.meetings.MeetingSelectorViewModel.prototype, "load").and.callThrough();
            spyOn(ap.viewmodels.meetings.MeetingSelectorViewModel.prototype, "selectItem").and.callThrough();
            spyOn(ap.viewmodels.meetings.MeetingSelectorViewModel.prototype, "selectMeetingById").and.callThrough();
        });
        describe("WHEN the EditNoteBaseViewModel is created for add new note and the user has not the Meeting module", () => {
            beforeEach(() => {
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.returnValue(false);
                addEditVm = createVm(noteDetailsVm);
                $rootScope.$apply();
            });
            it("THEN, the meetingSelector.load method will call and after that select the first meeting (System public)", () => {
                expect(addEditVm.meetingSelector.load).toHaveBeenCalled();
                expect(addEditVm.meetingSelector.selectItem).toHaveBeenCalledWith("M1");

            });
        });
        describe("WHEN the EditNoteBaseViewModel is created for add new note and the user has the Meeting module and currentmeeting is not null", () => {
            beforeEach(() => {
                let currentMeeting: ap.models.meetings.Meeting = new ap.models.meetings.Meeting(Utility);
                currentMeeting.createByJson({ Id: "M2" });
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.returnValue(true);
                specHelper.general.spyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get).and.returnValue(currentMeeting);
                addEditVm = createVm(noteDetailsVm);
                $rootScope.$apply();
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get);
            });

            it("THEN, the meetingSelector.selectItem method will call and the current meeting is select by default", () => {
                expect(addEditVm.meetingSelector.selectMeetingById).toHaveBeenCalledWith("M2");
            });
        });
        describe("WHEN the EditNoteBaseViewModel is created for add new note and the user has the Meeting module and currentmeeting is null and the user had select the meeting before", () => {
            beforeEach(() => {
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.returnValue(true);
                spyOn(Utility.Storage.Session, "get").and.returnValue(["b360cb6d-ca54-4b93-a564-a469274eb68a", "M3"]);
                specHelper.general.spyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get).and.returnValue(null);

            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get);
            });

            it("THEN, the meetingSelector.selectItem method will call and the last selected meeting is select by default", () => {
                addEditVm = createVm(noteDetailsVm);
                $rootScope.$apply();
                expect(addEditVm.meetingSelector.selectMeetingById).toHaveBeenCalledWith("M3");
            });
        });
        describe("WHEN the EditNoteBaseViewModel is created for add new note and the user has the Meeting module and currentmeeting is null and the user had not select the meeting before", () => {
            beforeEach(() => {
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.returnValue(true);
                spyOn(Utility.Storage.Session, "get").and.returnValue(null);
                specHelper.general.spyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get).and.returnValue(null);

            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get);
            });

            it("THEN, the meetingSelector.load method will call and private meeting is select by default", () => {
                addEditVm = createVm(noteDetailsVm);
                $rootScope.$apply();
                expect(addEditVm.meetingSelector.load).toHaveBeenCalled();
                expect(addEditVm.meetingSelector.selectItem).toHaveBeenCalledWith("M1");
            });
        });

        describe("WHEN the EditNoteBaseViewModel is created for add new note and the user has the Meeting module and currentmeeting is null and the user had select the meeting in another project", () => {
            beforeEach(() => {
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.returnValue(true);
                spyOn(Utility.Storage.Session, "get").and.returnValue(["P2", "M2"]);
                specHelper.general.spyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get).and.returnValue(null);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get);
            });

            it("THEN, the meetingSelector.load method will call and private meeting is select by default", () => {
                addEditVm = createVm(noteDetailsVm);
                $rootScope.$apply();
                expect(addEditVm.meetingSelector.load).toHaveBeenCalled();
                expect(addEditVm.meetingSelector.selectItem).toHaveBeenCalledWith("M1");
            });
        });

        describe("WHEN the EditNoteBaseViewModel is created for edit a note", () => {
            beforeEach(() => {
                noteDetailsVm = createNoteDetailVm();
                let note = new ap.models.notes.Note(Utility);
                note.createByJson({
                    Meeting: {
                        Id: "M1"
                    },
                });
                specHelper.general.spyProperty(ap.viewmodels.notes.NoteDetailBaseViewModel.prototype, "noteBase", specHelper.PropertyAccessor.Get).and.returnValue(note);

                addEditVm = createVm(noteDetailsVm);
                $rootScope.$apply();
            });

            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteDetailBaseViewModel.prototype, "noteBase", specHelper.PropertyAccessor.Get);
            });
            it("THEN, the meetingSelector.selectItem will call and the note's meeting is select by default", () => {
                expect(addEditVm.meetingSelector.selectItem).toHaveBeenCalledWith("M1");
            });
        });
    });

    describe("Feature: Save/Cancel", () => {
        let addEditVm: ap.viewmodels.notes.EditNoteBaseViewModel;

        beforeEach(() => {
            addEditVm = createVm(createNoteDetailVm());
            addEditVm.noteDetailBaseViewModel.noteBase.createByJson({Id: "123"});
        });

        describe("WHEN cancel is called", () => {
            beforeEach(() => {
                spyOn(addEditVm.noteDetailBaseViewModel, "cancel");
            });
            it("THEN noteDetailBaseViewModel.cancel is called", () => {
                addEditVm.cancel();

                expect(addEditVm.noteDetailBaseViewModel.cancel).toHaveBeenCalled();

            });
            it("THEN, the dialog is closed", () => {
                addEditVm.cancel();

                expect($mdDialog.hide).toHaveBeenCalled();
            });
            it("THEN, the edit mode of noteDetail VM is false", () => {
                addEditVm.cancel();
                expect(addEditVm.noteDetailBaseViewModel.isEditMode).toBeFalsy();
            });
        });

        describe("WHEN save is called", () => {
            let chapterHierarchy: ap.models.projects.ChapterHierarchy;
            let cellHierarchy: ap.models.projects.CellHierarchy;

            beforeEach(() => {
                spyOn(addEditVm.noteDetailBaseViewModel, "postChanges");
                spyOn(NoteController, "saveNote");
                spyOn(addEditVm.noteDetailBaseViewModel.noteInChargeList, "fillNoteInCharge");
                cellHierarchy = null;
                chapterHierarchy = null;
                specHelper.general.spyProperty(ap.viewmodels.notes.NoteDetailBaseViewModel.prototype, "noteBase", specHelper.PropertyAccessor.Get).and.returnValue({ Id: "124-2124" });
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
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.projects.IssueTypeSelectorViewModel.prototype, "selectedItem", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.viewmodels.projects.RoomSelectorViewModel.prototype, "selectedItem", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteDetailBaseViewModel.prototype, "noteBase", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.viewmodels.projects.ContactSelectorViewModel.prototype, "selectedContacts", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.viewmodels.meetings.MeetingSelectorViewModel.prototype, "selectedItem", specHelper.PropertyAccessor.Get);
            });
            it("selectedIssueTypeId is null THEN, note.IssueType equals to null", () => {
                chapterHierarchy = null;
                addEditVm.save();
                expect(addEditVm.noteDetailBaseViewModel.noteBase.IssueType).toBeNull();
            });
            it("selectedIssueTypeId is NOT null THEN, note.IssueType equals to the selectedIssueTypeId of the view model", () => {
                chapterHierarchy = new ap.models.projects.ChapterHierarchy(Utility);
                chapterHierarchy.createByJson({
                    EntityId: "15",
                    Id: "151",
                    EntityName: "IssueType"
                });
                addEditVm.save();
                expect(addEditVm.noteDetailBaseViewModel.noteBase.IssueType.Id).toBe(chapterHierarchy.EntityId);
                expect(addEditVm.noteDetailBaseViewModel.noteBase.IssueType.Code).toBe(chapterHierarchy.Code);
                expect(addEditVm.noteDetailBaseViewModel.noteBase.IssueType.Description).toBe(chapterHierarchy.Description);
                expect(addEditVm.noteDetailBaseViewModel.noteBase.IssueType.ParentChapter.Id).toBe("12");
                expect(addEditVm.noteDetailBaseViewModel.noteBase.IssueType.ParentChapter.Code).toBe("Code");
                expect(addEditVm.noteDetailBaseViewModel.noteBase.IssueType.ParentChapter.Description).toBe("Description");
            });
            it("selectedMeetingId is not null, then note.Meeting equals to the selectedMeetingId of the view model", () => {
                addEditVm.save();
                expect(addEditVm.noteDetailBaseViewModel.noteBase.Meeting.Id).toEqual("M1");
            });
            it("AND noteInChargeList.fillNoteInCharge is called", () => {
                addEditVm.save();
                expect(addEditVm.noteDetailBaseViewModel.noteInChargeList.fillNoteInCharge).toHaveBeenCalled();
            });
        });
    });

    describe("Feature: copySubjectToDescription", () => {
        let addEditVm: ap.viewmodels.notes.EditNoteBaseViewModel;
        let note: ap.models.notes.Note;

        beforeEach(() => {
            note = new ap.models.notes.Note(Utility);
            let meeting: ap.models.meetings.Meeting = new ap.models.meetings.Meeting(Utility);
            let firstComment: ap.models.notes.NoteComment = new ap.models.notes.NoteComment(Utility);
            firstComment.IsFirst = true;
            firstComment.Note = note;
            firstComment.Date = new Date();
            firstComment.From = UserContext.CurrentUser();
            note.Comments = [];
            note.Comments.push(firstComment);
            note.Meeting = meeting;
            specHelper.general.spyProperty(ap.viewmodels.notes.NoteDetailBaseViewModel.prototype, "noteBase", specHelper.PropertyAccessor.Get).and.returnValue(note);

            addEditVm = createVm(createNoteDetailVm());

            spyOn(addEditVm.noteDetailBaseViewModel, "gotoAnchor");

            defNote.resolve(note);
            $rootScope.$apply();
        });
        afterEach(() => {
            specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteDetailBaseViewModel.prototype, "noteBase", specHelper.PropertyAccessor.Get);

        });
        describe("WHEN a call is made to copySubjectToDescription AND the note is NEW AND the subject is DEFINED AND the subject IS NOT Empty AND the first comment IS EMPTY", () => {
            it("THEN the first comment take the same value as the subject", () => {

                let spyGet = specHelper.general.spyProperty(ap.viewmodels.notes.NoteDetailBaseViewModel.prototype, "subject", specHelper.PropertyAccessor.Get).and.returnValue("This is my subject");

                addEditVm.copySubjectToDescription();

                $rootScope.$apply();

                expect(spyGet).toHaveBeenCalled();
                expect(addEditVm.noteDetailBaseViewModel.noteCommentList.firstComment.comment).toBe("This is my subject");

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
                addEditVm.noteDetailBaseViewModel.noteCommentList.firstComment.comment = "This is my description";

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
                addEditVm.noteDetailBaseViewModel.noteCommentList.firstComment.comment = "This is my description";

                let spySet = specHelper.general.spyProperty(ap.viewmodels.notes.NoteCommentViewModel.prototype, "comment", specHelper.PropertyAccessor.Set);

                addEditVm.copySubjectToDescription();

                addEditVm.noteDetailBaseViewModel.subject = null;
                addEditVm.suggestedIssueTypeSubjectListViewModel.searchText = null;

                addEditVm.copySubjectToDescription("reset");
                expect(addEditVm.suggestedIssueTypeSubjectListViewModel.searchText).toBe("This is my subject");
                expect(addEditVm.noteDetailBaseViewModel.subject).toBe("This is my subject");

                specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteDetailBaseViewModel.prototype, "subject", specHelper.PropertyAccessor.Get);

                specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteCommentViewModel.prototype, "comment", specHelper.PropertyAccessor.Set);
            });
        });
    });

    describe("Feature: updateSubjectFromSuggestedList", () => {
        let addEditVm: ap.viewmodels.notes.EditNoteBaseViewModel;
        let note: ap.models.notes.Note;

        beforeEach(() => {
            note = new ap.models.notes.Note(Utility);
            addEditVm = createVm(createNoteDetailVm());
            specHelper.general.spyProperty(ap.viewmodels.notes.NoteDetailBaseViewModel.prototype, "noteBase", specHelper.PropertyAccessor.Get).and.returnValue(note);

            spyOn(addEditVm.noteDetailBaseViewModel, "gotoAnchor");

            defNote.resolve(note);
            $rootScope.$apply();
            let firstComment = new ap.viewmodels.notes.NoteCommentViewModel(Utility, NoteController, MainController);
            firstComment.comment = "My comment";
            specHelper.general.spyProperty(ap.viewmodels.notes.NoteCommentListViewModel.prototype, "firstComment", specHelper.PropertyAccessor.Get).and.returnValue(firstComment);
        });
        afterEach(() => {
            specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteCommentListViewModel.prototype, "firstComment", specHelper.PropertyAccessor.Get);
            specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteDetailBaseViewModel.prototype, "noteBase", specHelper.PropertyAccessor.Get);

        });
        describe("WHEN a call is made to updateSubjectFromSuggestedList ", () => {
            it("THEN the subject of the note becomes the value returned by the getSubject method of the suggestedIssueTypeSubjectListViewModel", () => {

                spyOn(addEditVm.suggestedIssueTypeSubjectListViewModel, "getSubject").and.returnValue("This is my subject");

                addEditVm.updateSubjectFromSuggestedList();

                $rootScope.$apply();

                expect(addEditVm.noteDetailBaseViewModel.subject).toBe("This is my subject");
            });
        });
    });

    describe("Feature: setSubject", () => {
        let addEditVm: ap.viewmodels.notes.EditNoteBaseViewModel;
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

            addEditVm = createVm(createNoteDetailVm());

            spyOn(addEditVm.noteDetailBaseViewModel, "gotoAnchor");

            defNote.resolve(note);
            $rootScope.$apply();
        });
        describe("When setSubject method was called with the subject", () => {
            it("THEN, the noteDetailBaseViewModel.Subject will be update", () => {
                addEditVm.setSubject("aaa");
                $rootScope.$apply();
                expect(addEditVm.noteDetailBaseViewModel.subject).toEqual("aaa");
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

    describe("Feature: destroy, WHEN destroy is called", () => {
        let addEditVm: ap.viewmodels.notes.EditNoteBaseViewModel;
        let spyIssueType: any;
        let spyContact: any;
        beforeEach(() => {
            addEditVm = createVm(createNoteDetailVm());
            spyIssueType = spyOn(addEditVm.issueTypeSelectorViewModel, "dispose");
            spyContact = spyOn(addEditVm.contactSelectorViewModel, "dispose");
            addEditVm.dispose();
        });
        it("THEN, the viewmodel unscribe of all events he was subscribed to", () => {
            expect(spyIssueType).toHaveBeenCalled();
            expect(spyContact).toHaveBeenCalled();
        });
    });

    describe("Feature: issueTypeChanged", () => {
        let addEditVm: ap.viewmodels.notes.EditNoteBaseViewModel;

        beforeEach(() => {
            specHelper.general.initStub(MockVm, "hasIssueTypeChanged", function () { return true });
            addEditVm = createVm(createNoteDetailVm());
            specHelper.general.spyProperty(ap.viewmodels.notes.NoteDetailBaseViewModel.prototype, "noteBase", specHelper.PropertyAccessor.Get).and.returnValue({ Id: "124-2124", Subject: "aaa", Meeting: { Id: "987-654" } });
            spyOn(addEditVm.contactSelectorViewModel, "handleIssueTypeChanged");
            specHelper.general.spyProperty(ap.viewmodels.EntityViewModel.prototype, "hasChanged", specHelper.PropertyAccessor.Get).and.returnValue(true);
            spyOn(addEditVm, "hasChanged").and.returnValue(true);
        });
        afterEach(() => {
            specHelper.general.offSpyProperty(ap.viewmodels.EntityViewModel.prototype, "hasChanged", specHelper.PropertyAccessor.Get);
            specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteDetailBaseViewModel.prototype, "noteBase", specHelper.PropertyAccessor.Get);
            specHelper.general.removeStub(MockVm, "hasIssueTypeChanged");
        });

        describe("WHEN selectedItemChanged of issueType list is raised", () => {
            it("THEN, contactSelectorViewModel.handleIssueTypeChanged is called", () => {
                (<any>addEditVm.issueTypeSelectorViewModel)._listener.raise("selectedItemChanged", {
                    originalEntity: {
                        EntityId: "12"
                    }
                });
                expect(addEditVm.contactSelectorViewModel.handleIssueTypeChanged).toHaveBeenCalledWith("12");
            });
            it("THEN, SuggestedIssueTypeSubjectListViewModel.issuetypeId is set", () => {
                let spySetter: jasmine.Spy = specHelper.general.spyProperty(ap.viewmodels.projects.SuggestedIssueTypeSubjectListViewModel.prototype, "issueTypeId", specHelper.PropertyAccessor.Set).and.callThrough();
                (<any>addEditVm.issueTypeSelectorViewModel)._listener.raise("selectedItemChanged", {
                    originalEntity: {
                        EntityId: "12"
                    }
                });
                expect(spySetter).toHaveBeenCalledWith("12");
                expect(addEditVm.suggestedIssueTypeSubjectListViewModel.issueTypeId).toEqual("12");
            });

        });
    });

    describe("Feature: has changed", () => {
        let addEditVm: ap.viewmodels.notes.EditNoteBaseViewModel;
        beforeEach(() => {
            addEditVm = createVm(createNoteDetailVm());
        });
        describe("WHEN issueTypeSelectorViewModel or meetingSelector is null", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "issueTypeSelectorViewModel", specHelper.PropertyAccessor.Get).and.returnValue(null);
                specHelper.general.spyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "meetingSelector", specHelper.PropertyAccessor.Get).and.returnValue(null);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "issueTypeSelectorViewModel", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "meetingSelector", specHelper.PropertyAccessor.Get);
            });
            it("THEN haschanged is false", () => {
                expect(addEditVm.hasChanged).toBeFalsy();
            });
        });

        describe("WHEN selected issuetype has changed", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.viewmodels.EntityViewModel.prototype, "hasChanged", specHelper.PropertyAccessor.Get).and.returnValue(false);
                specHelper.general.spyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "contactSelectorViewModel", specHelper.PropertyAccessor.Get).and.returnValue({ selectedContacts: null })
                specHelper.general.spyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "issueTypeSelectorViewModel", specHelper.PropertyAccessor.Get).and.returnValue({ selectedIssueTypeId: "IssuetypeId2" });
                specHelper.general.spyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "meetingSelector", specHelper.PropertyAccessor.Get).and.returnValue({ selectedMeetingId: "MeetingId" });
                specHelper.general.spyProperty(ap.viewmodels.notes.NoteDetailBaseViewModel.prototype, "noteBase", specHelper.PropertyAccessor.Get).and.returnValue({ Meeting: { Id: "MeetingId" }, IssueType: { Id: "IssuetypeId" }, NoteInCharge: null });
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.EntityViewModel.prototype, "hasChanged", specHelper.PropertyAccessor.Get)
                specHelper.general.offSpyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "contactSelectorViewModel", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "issueTypeSelectorViewModel", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "meetingSelector", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteDetailBaseViewModel.prototype, "noteBase", specHelper.PropertyAccessor.Get);
            });
            it("THEN haschanged is true", () => {
                expect(addEditVm.hasChanged).toBeTruthy();
            });
        });

        describe("WHEN selected issuetype has not changed", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.viewmodels.EntityViewModel.prototype, "hasChanged", specHelper.PropertyAccessor.Get).and.returnValue(false);
                specHelper.general.spyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "contactSelectorViewModel", specHelper.PropertyAccessor.Get).and.returnValue({ selectedContacts: null })
                specHelper.general.spyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "issueTypeSelectorViewModel", specHelper.PropertyAccessor.Get).and.returnValue({ selectedIssueTypeId: "IssuetypeId" });
                specHelper.general.spyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "meetingSelector", specHelper.PropertyAccessor.Get).and.returnValue({ selectedMeetingId: "MeetingId" });
                specHelper.general.spyProperty(ap.viewmodels.notes.NoteDetailBaseViewModel.prototype, "noteBase", specHelper.PropertyAccessor.Get).and.returnValue({ Meeting: { Id: "MeetingId" }, IssueType: { Id: "IssuetypeId" }, NoteInCharge: null });
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.EntityViewModel.prototype, "hasChanged", specHelper.PropertyAccessor.Get)
                specHelper.general.offSpyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "contactSelectorViewModel", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "issueTypeSelectorViewModel", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "meetingSelector", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteDetailBaseViewModel.prototype, "noteBase", specHelper.PropertyAccessor.Get);
            });
            it("THEN haschanged is true", () => {
                expect(addEditVm.hasChanged).toBeFalsy();
            });
        });

        describe("WHEN selected meeting has changed", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.viewmodels.EntityViewModel.prototype, "hasChanged", specHelper.PropertyAccessor.Get).and.returnValue(false);
                specHelper.general.spyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "contactSelectorViewModel", specHelper.PropertyAccessor.Get).and.returnValue({ selectedContacts: null })
                specHelper.general.spyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "issueTypeSelectorViewModel", specHelper.PropertyAccessor.Get).and.returnValue({ selectedIssueTypeId: "IssuetypeId" });
                specHelper.general.spyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "meetingSelector", specHelper.PropertyAccessor.Get).and.returnValue({ selectedMeetingId: "MeetingId2" });
                specHelper.general.spyProperty(ap.viewmodels.notes.NoteDetailBaseViewModel.prototype, "noteBase", specHelper.PropertyAccessor.Get).and.returnValue({ Meeting: { Id: "MeetingId" }, IssueType: { Id: "IssuetypeId" }, NoteInCharge: null });
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.EntityViewModel.prototype, "hasChanged", specHelper.PropertyAccessor.Get)
                specHelper.general.offSpyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "contactSelectorViewModel", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "issueTypeSelectorViewModel", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "meetingSelector", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteDetailBaseViewModel.prototype, "noteBase", specHelper.PropertyAccessor.Get);
            });
            it("THEN haschanged is true", () => {
                expect(addEditVm.hasChanged).toBeTruthy();
            });
        });

        describe("WHEN selected meeting has not changed", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.viewmodels.EntityViewModel.prototype, "hasChanged", specHelper.PropertyAccessor.Get).and.returnValue(false);
                specHelper.general.spyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "contactSelectorViewModel", specHelper.PropertyAccessor.Get).and.returnValue({ selectedContacts: null })
                specHelper.general.spyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "issueTypeSelectorViewModel", specHelper.PropertyAccessor.Get).and.returnValue({ selectedIssueTypeId: "IssuetypeId" });
                specHelper.general.spyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "meetingSelector", specHelper.PropertyAccessor.Get).and.returnValue({ selectedMeetingId: "MeetingId" });
                specHelper.general.spyProperty(ap.viewmodels.notes.NoteDetailBaseViewModel.prototype, "noteBase", specHelper.PropertyAccessor.Get).and.returnValue({ Meeting: { Id: "MeetingId" }, IssueType: { Id: "IssuetypeId" }, NoteInCharge: null });
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.EntityViewModel.prototype, "hasChanged", specHelper.PropertyAccessor.Get)
                specHelper.general.offSpyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "contactSelectorViewModel", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "issueTypeSelectorViewModel", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "meetingSelector", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteDetailBaseViewModel.prototype, "noteBase", specHelper.PropertyAccessor.Get);
            });
            it("THEN haschanged is true", () => {
                expect(addEditVm.hasChanged).toBeFalsy();
            });
        });

        describe("WHEN hasInChargeChanged is true", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.viewmodels.EntityViewModel.prototype, "hasChanged", specHelper.PropertyAccessor.Get).and.returnValue(true);
                specHelper.general.spyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "contactSelectorViewModel", specHelper.PropertyAccessor.Get).and.returnValue({ selectedContacts: null })
                specHelper.general.spyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "issueTypeSelectorViewModel", specHelper.PropertyAccessor.Get).and.returnValue({ selectedIssueTypeId: "IssuetypeId" });
                specHelper.general.spyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "meetingSelector", specHelper.PropertyAccessor.Get).and.returnValue({ selectedMeetingId: "MeetingId" });
                specHelper.general.spyProperty(ap.viewmodels.notes.NoteDetailBaseViewModel.prototype, "noteBase", specHelper.PropertyAccessor.Get).and.returnValue({ Meeting: { Id: "MeetingId" }, IssueType: { Id: "IssuetypeId" }, NoteInCharge: { Id: "NoteIncharge" } });
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.EntityViewModel.prototype, "hasChanged", specHelper.PropertyAccessor.Get)
                specHelper.general.offSpyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "contactSelectorViewModel", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "issueTypeSelectorViewModel", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "meetingSelector", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteDetailBaseViewModel.prototype, "noteBase", specHelper.PropertyAccessor.Get);
            });
            it("THEN haschanged is true", () => {
                expect(addEditVm.hasChanged).toBeTruthy();
            });
        });
    });

    describe("Feature: hasEditMeeting", () => {
        let addEditVm: ap.viewmodels.notes.EditNoteBaseViewModel;
        let meeting: ap.models.meetings.Meeting;
        describe("WHEN has access to the meeting module", () => {
            beforeEach(() => {
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.returnValue(true);
                addEditVm = createVm(createNoteDetailVm());
                addEditVm.noteDetailBaseViewModel.noteBase.createByJson({ Id: "123", Meeting: { Id: "456" } });

            });
            it("THEN hasEditMeeting = true", () => {
                expect(addEditVm.hasEditMeeting).toBeTruthy();
            });
        });

        describe("WHEN has NOT access to the meeting module and in EDIT mode", () => {
            beforeEach(() => {
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.returnValue(false);
                specHelper.general.spyProperty(ap.models.Entity.prototype, "IsNew", specHelper.PropertyAccessor.Get).and.returnValue(false);

                let detail = createNoteDetailVm();
                detail.noteBase.createByJson({ Id: "123", Meeting: { Id: "456" } });
                addEditVm = createVm(detail);

                defNote.resolve(new ap.models.notes.Note(Utility));
                $rootScope.$apply();
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.models.Entity.prototype, "IsNew", specHelper.PropertyAccessor.Get);
            });
            it("THEN hasEditMeeting = false", () => {
                expect(addEditVm.hasEditMeeting).toBeFalsy();
            });
        });
    });

    describe("Feature: handleShortcutAction", () => {
        let addEditVm: ap.viewmodels.notes.EditNoteBaseViewModel;
        beforeEach(() => {
            addEditVm = createVm(createNoteDetailVm());
            spyOn(ap.viewmodels.projects.ContactSelectorViewModel.prototype, "initUsers").and.callThrough();

        });
        describe("WHEN call handleShortcutAction with 'note.save'", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "hasChanged", specHelper.PropertyAccessor.Get).and.returnValue(true);
                specHelper.general.spyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "hasEditMeeting", specHelper.PropertyAccessor.Get).and.returnValue(false);
                spyOn(addEditVm, "save");
                addEditVm.handleShortcutAction("note.save");
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "hasChanged", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "hasEditMeeting", specHelper.PropertyAccessor.Get);
            });
            it("THEN call save method", () => {
                expect(addEditVm.save).toHaveBeenCalled();
            });
        });
    });
});
