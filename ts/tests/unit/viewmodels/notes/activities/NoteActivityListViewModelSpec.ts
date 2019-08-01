describe("Module ap-viewmodels - NoteActivityListViewModel", () => {
    let $rootScope: angular.IRootScopeService, $scope: angular.IScope;
    let Utility: ap.utility.UtilityHelper, UserContext: ap.utility.UserContext;
    let vm: ap.viewmodels.notes.NoteActivityListViewModel;
    let NoteController: ap.controllers.NoteController;
    let ProjectController: ap.controllers.ProjectController;
    let $q: angular.IQService;
    let MainController: ap.controllers.MainController;
    let DocumentController: ap.controllers.DocumentController;
    let NoteService: ap.services.NoteService;
    let $mdDialog: angular.material.IDialogService;
    let Api: ap.services.apiHelper.Api;
    let ControllersManager: ap.controllers.ControllersManager;
    let ServicesManager: ap.services.ServicesManager;
    let $timeout: angular.ITimeoutService;
    let $mdSidenav;
    let apiHelper = ap.services.apiHelper;

    let project: any = {};
    project.Name = "Welcome";
    project.UserAccessRight = new ap.models.accessRights.ProjectAccessRight(Utility);
    project.UserAccessRight.CanEdit = true;
    project.UserAccessRight.CanArchiveDoc = true;
    project.PhotoFolderId = "d660cb6d-ca54-4b93-a564-a46e874eb68a";
    let date = new Date();
    date.setFullYear(2016);
    date.setMonth(2);
    let meeting: any = {};
    meeting.Occurrence = 1;
    meeting.Title = "Sprint Review";

    let n: ap.models.notes.Note = new ap.models.notes.Note(Utility);

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
        angular.mock.module("ap-services");
        let $window = specHelper.createWindowStub();
        $window.navigator.userLanguage = undefined;
        $window.navigator.language = 'en_US';
        angular.mock.module(function ($provide) {
            $provide.value('$window', $window);
            $mdSidenav = specHelper.utility.stubToggleMdSideNav($provide);
        });
        angular.mock.module(function ($provide) {
            $provide.factory('$mdDialog', ["$q", function ($q) {
                return specHelper.utility.stubShowMdDialog($q);
            }]);
        });
    });

    beforeEach(inject(function (_$timeout_, _$rootScope_, _UserContext_, _Utility_, _NoteController_, _$q_, _MainController_, _DocumentController_, _NoteService_, _ProjectController_, _Api_, _ControllersManager_, _ServicesManager_) {
        Utility = _Utility_;
        UserContext = _UserContext_;
        NoteController = _NoteController_;
        DocumentController = _DocumentController_;
        ProjectController = _ProjectController_;
        $rootScope = _$rootScope_;
        $q = _$q_;
        $timeout = _$timeout_;
        Api = _Api_;
        MainController = _MainController_;
        NoteService = _NoteService_;
        ControllersManager = _ControllersManager_;
        ServicesManager = _ServicesManager_;
        $scope = $rootScope.$new();
        specHelper.utility.stubRootUrl(Utility);
        specHelper.userContext.stub(Utility);
        specHelper.utility.stubStorageSet(Utility);
        specHelper.utility.stubConvertJsonDate();

        // force isNew = false;
        n.createByJson({
            Id: n.Id
        });

        n.Subject = "Note 1";
        n.CodeNum = "1.01";
        n.IsUrgent = true;
        n.DueDate = new Date(2016, 2, 25);
        n.From = new ap.models.actors.User(Utility);
        n.From.Alias = "aproplan@aproplan.com";
        n.From.Person = new ap.models.actors.Person(Utility);
        n.From.Person.Name = "Quentin Luc";

        n.Cell = new ap.models.projects.SubCell(Utility);
        n.Cell.Code = "C1";
        n.Cell.Description = "Cell 1";
        n.Cell.ParentCell = new ap.models.projects.ParentCell(Utility);
        n.Cell.ParentCell.Code = "P1";
            n.Cell.ParentCell.Description = "ParentCell 1";
        n.IssueType = new ap.models.projects.IssueType(Utility);
        n.IssueType.Code = "IT1";
        n.IssueType.Description = "IssueType 1";
        n.IssueType.ParentChapter = new ap.models.projects.Chapter(Utility);
        n.IssueType.ParentChapter.Code = "PC1";
        n.IssueType.ParentChapter.Description = "ParentChapter 1";
        n.Status = new ap.models.projects.NoteProjectStatus(Utility);
        n.Status.Name = "Status 1";
        n.Status.Color = "111111";
        n.Comments = [
            new ap.models.notes.NoteComment(Utility),
            new ap.models.notes.NoteComment(Utility)
        ];
        n.Comments[0].IsRead = false;
        n.Comments[0].IsFirst = true;
        n.Comments[0].Comment = "First comment of the point";
        n.Comments[0].IsArchived = false;

        n.Comments[1].IsRead = true;
        n.Comments[1].IsFirst = false;
        n.Comments[1].Comment = "Second comment of the point";
        n.Comments[1].IsArchived = false;

        n.NoteInCharge = [
            new ap.models.notes.NoteInCharge(Utility),
            new ap.models.notes.NoteInCharge(Utility)
        ];

        n.NoteInCharge[0].Tag = "Sergio";
        n.NoteInCharge[0].IsContactInvitedOnProject = false;

        n.NoteInCharge[1].Tag = "Renauld";
        n.NoteInCharge[1].IsContactInvitedOnProject = true;

        n.NoteDocuments = [
            new ap.models.notes.NoteDocument(Utility),
            new ap.models.notes.NoteDocument(Utility)
        ]

        n.Project = project;
        n.Meeting = meeting;
        n.MeetingAccessRight = new ap.models.accessRights.MeetingAccessRight(Utility);

        n.MeetingAccessRight.CanEdit = true;
        n.MeetingAccessRight.CanAddPoint = true;
        n.MeetingAccessRight.CanEditPoint = true;
        n.MeetingAccessRight.CanDeletePoint = true;
        n.MeetingAccessRight.CanEditPointStatus = true;
        n.MeetingAccessRight.CanAddComment = true;
        n.MeetingAccessRight.CanDeleteComment = true;
        n.MeetingAccessRight.CanArchiveComment = true;
        n.MeetingAccessRight.CanAddDoc = true;
        n.MeetingAccessRight.CanGenerateReport = true;
        n.MeetingAccessRight.CanCreateNextMeeting = true;
        n.MeetingAccessRight.CanEditAllPoint = true;
        n.MeetingAccessRight.CanEditPointIssueType = true;
        n.MeetingAccessRight.CanEditPointInCharge = true;
        n.MeetingAccessRight.Level = ap.models.accessRights.AccessRightLevel.Subcontractor;

        specHelper.general.spyProperty(ap.viewmodels.notes.NoteDocumentListViewModel.prototype, "isDisplayingPictureViewer", specHelper.PropertyAccessor.Get).and.returnValue(false);
    }));

    beforeEach(() => {
        spyOn(ServicesManager.noteService, "getLinkedNotes").and.returnValue($q.defer().promise);
    });

    afterEach(() => {
        specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteDocumentListViewModel.prototype, "isDisplayingPictureViewer", specHelper.PropertyAccessor.Get);
    });

    let createNoteDetailVm = () => {
        return new ap.viewmodels.notes.NoteDetailViewModel(Utility, $mdDialog, $q, Api, ControllersManager, ServicesManager);
    };

    describe("Constructor", () => {

        describe("WHEN NoteActivityListViewModel is created without a NoteVm", () => {
            it("THEN default values are correctly filled AND the list is empty", () => {
                vm = new ap.viewmodels.notes.NoteActivityListViewModel(Utility, Api, $q, ControllersManager);

                expect(vm.listVm).toBeDefined();
                expect(vm.listVm.defaultFilter).toBe("Filter.Eq(ParentEntityName, Note))");
                expect(vm.listVm.sortOrder).toBe("date");
                expect(vm.listVm.pathToLoad).toBe("User");
            });
        });

        describe("WHEN NoteActivityListViewModel is created with a NoteVm", () => {
            let defNote: ng.IDeferred<any>;
            let defNoteStatus: ng.IDeferred<any>;
            let defActivity: ng.IDeferred<any>;
            let defActivityIds: ng.IDeferred<any>;

            beforeEach(() => {
                defNote = $q.defer();
                defNoteStatus = $q.defer();
                defActivity = $q.defer();
                defActivityIds = $q.defer();

                spyOn(NoteController, "getFullNoteById").and.returnValue(defNote.promise);

                spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue(defNoteStatus.promise);

                spyOn(Api, "getApiResponse").and.callFake(function (url: string) {
                    if (url.indexOf("rest/activitylogsids") === 0)
                        return defActivityIds.promise;

                    if (url.indexOf("rest/activitylogs") === 0)
                        return defActivity.promise;

                    return null;
                });
            });

            it("THEN the noteViewModel property is correctly setted", () => {
                let noteVm: ap.viewmodels.notes.NoteDetailViewModel = createNoteDetailVm();
                spyOn(noteVm, "gotoAnchor");
                noteVm.loadNote(n.Id);

                vm = new ap.viewmodels.notes.NoteActivityListViewModel(Utility, Api, $q, ControllersManager, noteVm);

                expect(vm.noteViewModel).toBe(noteVm);
            });

            it("THEN listVm is initialized and filled with the activity logs", () => {
                let noteVm: ap.viewmodels.notes.NoteDetailViewModel = createNoteDetailVm();
                spyOn(noteVm, "gotoAnchor");
                noteVm.loadNote(n.Id);
                defNote.resolve(n);
                $rootScope.$apply();

                spyOn(Api, "getEntityIds").and.callThrough();

                vm = new ap.viewmodels.notes.NoteActivityListViewModel(Utility, Api, $q, ControllersManager, noteVm);

                defActivityIds.resolve({ data: ["97cbaaf3-25c6-48ad-9055-aa26ca7dbeb0"] });
                $rootScope.$apply();

                let activityLog: ap.models.activities.ActivityLog = new ap.models.activities.ActivityLog(Utility);
                activityLog.createByJson({
                    Id: "97cbaaf3-25c6-48ad-9055-aa26ca7dbeb0",
                    ActivityType: ap.models.activities.ActivityType.Add,
                    User: { Id: "36", DisplayName: "John Doe" },
                    Date: "\/Date(1458052220000)\/",
                    EntityName: "NoteProcessStatusHistory",
                    EntityCode: "456-987",
                    ParentEntityCode: "74874",
                    EntityDescription: "To Do",
                    ParentEntityGuid: n.Id
                });

                defActivity.resolve({
                    data: [activityLog]
                });
                $rootScope.$apply();

                let options = new apiHelper.ApiOption(true);
                options.async = true;

                expect(Api.getEntityIds).toHaveBeenCalledWith("ActivityLog", "Filter.And(Filter.Eq(ParentEntityName, Note)),Filter.Eq(ParentEntityGuid, " + n.Id + "))", "date", options, false);
                expect(vm.listVm.sourceItems.length).toBe(1);
                expect((<ap.viewmodels.activities.ActivityLogItemViewModel>vm.listVm.sourceItems[0]).originalActivityLog).toEqual(activityLog);
            });
        });
    });

    describe("Feature: Get noteDetailViewModel", () => {
        let defNote: ng.IDeferred<any>;
        let defNoteStatus: ng.IDeferred<any>;
        let defActivity: ng.IDeferred<any>;
        let defActivityIds: ng.IDeferred<any>;

        beforeEach(() => {
            defNote = $q.defer();
            defNoteStatus = $q.defer();
            defActivity = $q.defer();
            defActivityIds = $q.defer();

            spyOn(NoteController, "getFullNoteById").and.returnValue(defNote.promise);

            spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue(defNoteStatus.promise);

            spyOn(Api, "getApiResponse").and.callFake(function (url: string) {
                if (url.indexOf("rest/activitylogsids") === 0)
                    return defActivityIds.promise;

                if (url.indexOf("rest/activitylogs") === 0)
                    return defActivity.promise;

                return null;
            });
        });
        describe("WHEN I set a new noteDetailViewModel", () => {
            it("THEN the noteDetailViewModel is changed AND the API is called to refresh the list", () => {
                let initialNoteDetailVM: ap.viewmodels.notes.NoteDetailViewModel = createNoteDetailVm();
                spyOn(initialNoteDetailVM, "gotoAnchor");
                initialNoteDetailVM.loadNote(n.Id);
                defNote.resolve(n);
                $rootScope.$apply();

                vm = new ap.viewmodels.notes.NoteActivityListViewModel(Utility, Api, $q, ControllersManager, initialNoteDetailVM);

                defActivityIds.resolve({ data: ["97cbaaf3-25c6-48ad-9055-aa26ca7dbeb0"] });
                $rootScope.$apply();

                let activityLog: ap.models.activities.ActivityLog = new ap.models.activities.ActivityLog(Utility);
                activityLog.createByJson({
                    Id: "97cbaaf3-25c6-48ad-9055-aa26ca7dbeb0",
                    ActivityType: ap.models.activities.ActivityType.Add,
                    User: { Id: "36", DisplayName: "John Doe" },
                    Date: "\/Date(1458052220000)\/",
                    EntityName: "NoteProcessStatusHistory",
                    EntityCode: "456-987",
                    ParentEntityCode: "74874",
                    EntityDescription: "To Do",
                    ParentEntityGuid: n.Id
                });

                let json0: any = {
                    data: [activityLog]
                };

                defActivity.resolve(json0);
                $rootScope.$apply();

                expect(vm.noteViewModel).toBe(initialNoteDetailVM);
                expect(vm.listVm.sourceItems.length).toBe(1);
                expect((<ap.viewmodels.activities.ActivityLogItemViewModel>vm.listVm.sourceItems[0]).originalActivityLog).toEqual(activityLog);

                defActivity = $q.defer();
                defActivityIds = $q.defer();

                let newNoteDetailVM: ap.viewmodels.notes.NoteDetailViewModel = createNoteDetailVm();
                spyOn(newNoteDetailVM, "gotoAnchor");
                newNoteDetailVM.loadNote("a360cb6d-ca54-4b93-a564-a469274eb68a");

                let nJSON: any = n.toJSON();
                nJSON.Id = "a360cb6d-ca54-4b93-a564-a469274eb68a";

                let n2: ap.models.notes.Note = new ap.models.notes.Note(Utility);
                n2.createByJson(nJSON);

                defNote.resolve(n2);
                $rootScope.$apply();

                vm.noteViewModel = newNoteDetailVM;

                defActivityIds.resolve({ data: ["97cbaaf3-25c6-48ad-9055-aa26ca7dbeb0", "86cbaaf3-25c6-48ad-9055-aa26ca7dbeb1"] });
                $rootScope.$apply();

                let activityLog0: ap.models.activities.ActivityLog = new ap.models.activities.ActivityLog(Utility);
                activityLog0.createByJson({
                    Id: "97cbaaf3-25c6-48ad-9055-aa26ca7dbeb0",
                    ActivityType: ap.models.activities.ActivityType.Add,
                    User: { Id: "36", DisplayName: "John Doe" },
                    Date: "\/Date(1458052220000)\/",
                    EntityName: "NoteProcessStatusHistory",
                    EntityCode: "456-987",
                    ParentEntityCode: "74874",
                    EntityDescription: "In progress",
                    ParentEntityGuid: n.Id
                });

                let activityLog1: ap.models.activities.ActivityLog = new ap.models.activities.ActivityLog(Utility);
                activityLog1.createByJson({
                    Id: "86cbaaf3-25c6-48ad-9055-aa26ca7dbeb1",
                    ActivityType: ap.models.activities.ActivityType.Add,
                    User: { Id: "36", DisplayName: "John Doe" },
                    Date: "\/Date(1458052220000)\/",
                    EntityName: "NoteProcessStatusHistory",
                    EntityCode: "789-987",
                    ParentEntityCode: "74474",
                    EntityDescription: "Done",
                    ParentEntityGuid: n.Id
                });

                let json1: any = {
                    data: [activityLog0, activityLog1]
                };

                defActivity.resolve(json1);
                $rootScope.$apply();

                expect(vm.noteViewModel.noteBase.Id).toBe(newNoteDetailVM.note.Id);
                expect(vm.listVm.sourceItems.length).toBe(2);
                expect((<ap.viewmodels.activities.ActivityLogItemViewModel>vm.listVm.sourceItems[0]).originalActivityLog).toEqual(activityLog0);
                expect((<ap.viewmodels.activities.ActivityLogItemViewModel>vm.listVm.sourceItems[1]).originalActivityLog).toEqual(activityLog1);
            });
        });
    });

    describe("Feature: refresh", () => {
        let defNote: ng.IDeferred<any>;
        let defNoteStatus: ng.IDeferred<any>;
        let defActivity: ng.IDeferred<any>;
        let defActivityIds: ng.IDeferred<any>;

        beforeEach(() => {
            defNote = $q.defer();
            defNoteStatus = $q.defer();
            defActivity = $q.defer();
            defActivityIds = $q.defer();

            spyOn(NoteController, "getFullNoteById").and.returnValue(defNote.promise);

            spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue(defNoteStatus.promise);

            spyOn(Api, "getApiResponse").and.callFake(function (url: string) {
                if (url.indexOf("rest/activitylogsids") === 0)
                    return defActivityIds.promise;

                if (url.indexOf("rest/activitylogs") === 0)
                    return defActivity.promise;

                return null;
            });

            let initialNoteDetailVM: ap.viewmodels.notes.NoteDetailViewModel = createNoteDetailVm();
            spyOn(initialNoteDetailVM, "gotoAnchor");
            initialNoteDetailVM.loadNote(n.Id);
            defNote.resolve(n);
            $rootScope.$apply();

            vm = initialNoteDetailVM.noteActivityList;
        });
        describe("WHEN refresh is called", () => {
            beforeEach(() => {
                spyOn(vm.listVm, "onLoadItems");
                vm.refresh();
            })
            it("THEN the activitylist is loaded again", () => {
                expect(vm.listVm.onLoadItems).toHaveBeenCalled();
            });
        });

        describe("WHEN the note status is updated", () => {
            beforeEach(() => {
                spyOn(vm, "refresh").and.callFake(() => { });
                specHelper.general.raiseEvent(NoteController, "notestatusupdated", { updatedNote: { Id: n.Id, EntityVersion: 2 }, newStatus: { Id: "baf99dac-8dde-4caa-9830-8b88625925c6" } });
            })
            it("THEN the activitylist is refreshed", () => {
                expect(vm.refresh).toHaveBeenCalled();
            });
        });

        describe("WHEN a comment is added", () => {
            beforeEach(() => {
                spyOn(vm, "refresh");
                let noteComment: ap.models.notes.NoteComment = new ap.models.notes.NoteComment(Utility);
                noteComment.Comment = "My comment";
                let noteCommentVM: ap.viewmodels.notes.NoteCommentViewModel = new ap.viewmodels.notes.NoteCommentViewModel(Utility, NoteController, MainController);
                noteCommentVM.init(noteComment, n);

                let updatedNote = new ap.models.notes.Note(Utility);
                updatedNote.createByJson({
                    Id: n.Id
                });
                let commentAddedEvent: ap.controllers.CommentSavedEvent = new ap.controllers.CommentSavedEvent(noteComment, n.Id, true, updatedNote);

                specHelper.general.raiseEvent(NoteController, "commentsaved", commentAddedEvent);
            })
            it("THEN the activitylist is refreshed", () => {
                expect(vm.refresh).toHaveBeenCalled();
            });
        });

        describe("WHEN a document linked to a note is deleted", () => {
            beforeEach(() => {
                spyOn(vm, "refresh").and.callFake(() => { });
                specHelper.general.raiseEvent(NoteController, "documentdeleted", n.NoteDocuments[0]);
            })
            it("THEN the activitylist is refreshed", () => {
                expect(vm.refresh).toHaveBeenCalled();
            });
        });
    });
});