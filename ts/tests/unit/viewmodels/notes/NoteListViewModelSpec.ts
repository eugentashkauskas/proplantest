describe("Module ap-viewmodels - notes list", () => {

    let nmp = ap.viewmodels.notes;
    let MainController: ap.controllers.MainController, Utility: ap.utility.UtilityHelper, Api: ap.services.apiHelper.Api, UserContext: ap.utility.UserContext, UIStateController: ap.controllers.UIStateController;
    let $controller: angular.IControllerService, $rootScope: angular.IRootScopeService, $scope: angular.IScope, _deferred: angular.IDeferred<ap.services.apiHelper.ApiResponse>,
        $q: angular.IQService, $timeout: angular.ITimeoutService, $compile: angular.ICompileService;
    let ProjectController: ap.controllers.ProjectController;
    let NoteController: ap.controllers.NoteController;
    let MeetingController: ap.controllers.MeetingController;
    let ControllersManager: ap.controllers.ControllersManager;
    let ServicesManager: ap.services.ServicesManager;
    let AccessRightController: ap.controllers.AccessRightController;
    let ReportController: ap.controllers.ReportController;
    let ReportService: ap.services.ReportService;
    let ContactService: ap.services.ContactService;

    let mainFlowStateSpy: jasmine.Spy;

    let vm: ap.viewmodels.notes.NoteListViewModel;
    let $mdDialog: angular.material.IDialogService;
    let noteWorkspaceVm: ap.viewmodels.notes.NoteWorkspaceViewModel;
    let idsNotes = ['b360cb6d-ca54-4b93-a564-a469274eb68a', '35a2c5d6-0e00-43e9-ada8-ce4f3fadb16e', 'bf70c80f-3b76-4bf8-bef4-86c7b1d4aa60', 'bf70c80f-3b76-8jf8-bef4-8kreb1d4aa60'];
    let idsComment = ['b8d13dfc-4124-4340-be59-fbc2b22db6a30', 'caeb3a53-94b3-4bea-b724-b686a724e3c50', 'a501aee5-4997-4717-96f2-3ddd1f098bef0', '39d0d7b4-0477-400c-a421-405021f670e40'];
    let dataNotes = [
        {
            Id: "b360cb6d-ca54-4b93-a564-a469274eb68a",
            Subject: "Note 1",
            CodeNum: "1.01",
            From: {
                Person: {
                    Name: "Quentin Luc"
                }
            },
            Cell: {
                Code: "C1"
            },
            IssueType: null,
            Status: {
                Name: "Status 1",
                Color: "111111"
            },
            Comments: [
                {
                    Id: "b8d13dfc-4124-4340-be59-fbc2b22db6a3",
                    IsRead: false,
                    LastModificationDate: new Date(2016, 0, 2)
                }
            ],
            NoteInCharge: [
                {
                    Tag: "Sergio"
                },
                {
                    Tag: "Renauld"
                }
            ]
        },
        {
            Id: "35a2c5d6-0e00-43e9-ada8-ce4f3fadb16e",
            Subject: "Note 2",
            CodeNum: "2.02",
            From: {
                Person: {
                    Name: "Quentin Luc"
                }
            },
            Cell: {
                Code: "C2"
            },
            IssueType: null,
            Status: {
                Name: "Status 2",
                Color: "111111"
            },
            Comments: [
                {
                    Id: "caeb3a53-94b3-4bea-b724-b686a724e3c5",
                    IsRead: false,
                    LastModificationDate: new Date(2016, 0, 2)
                }
            ],
            NoteInCharge: [
                {
                    Tag: "Sergio"
                },
                {
                    Tag: "Renauld"
                }
            ]
        },
        {
            Id: "bf70c80f-3b76-4bf8-bef4-86c7b1d4aa60",
            Subject: "Note 3",
            CodeNum: "3.03",
            From: {
                Person: {
                    Name: "Quentin Luc"
                }
            },
            Cell: {
                Code: "C3"
            },
            IssueType: null,
            Status: {
                Name: "Status 3",
                Color: "111111"
            },
            Comments: [
                {
                    Id: "a501aee5-4997-4717-96f2-3ddd1f098bef",
                    IsRead: false,
                    LastModificationDate: new Date(2016, 0, 2)
                }
            ],
            NoteInCharge: [
                {
                    Tag: "Sergio"
                },
                {
                    Tag: "Renauld"
                }
            ]
        },
        {
            Id: "bf70c80f-3b76-8jf8-bef4-8kreb1d4aa60",
            Subject: "Note 4",
            CodeNum: "4.04",
            From: {
                Person: {
                    Name: "Quentin Luc"
                }
            },
            Cell: {
                Code: "C4"
            },
            IssueType: null,
            Status: {
                Name: "Status 4",
                Color: "111111"
            },
            Comments: [
                {
                    Id: "39d0d7b4-0477-400c-a421-405021f670e4",
                    IsRead: false,
                    LastModificationDate: new Date(2016, 0, 2)
                }
            ],
            NoteInCharge: [
                {
                    Tag: "Sergio"
                },
                {
                    Tag: "Renauld"
                }
            ]
        }];

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");

        angular.mock.module(function ($provide) {
            $provide.factory('$mdDialog', ["$q", function ($q) {
                return specHelper.utility.stubShowMdDialog($q);
            }]);
        });
    });

    beforeEach(inject(function (_$rootScope_, _$q_, _$timeout_, _$compile_, _UserContext_, _Utility_, _Api_, _ControllersManager_, _MainController_, _UIStateController_, _$controller_, _ProjectController_, _NoteController_, _ReportController_, _AccessRightController_, _ReportService_, _$mdDialog_, _MeetingController_, _ContactService_, _ServicesManager_) {
        MainController = _MainController_;
        UIStateController = _UIStateController_;
        Utility = _Utility_;
        UserContext = _UserContext_;
        ProjectController = _ProjectController_;
        NoteController = _NoteController_;
        ReportController = _ReportController_;
        AccessRightController = _AccessRightController_;
        MeetingController = _MeetingController_;
        ControllersManager = _ControllersManager_;
        ServicesManager = _ServicesManager_;
        ReportService = _ReportService_;
        ContactService = _ContactService_;
        $mdDialog = _$mdDialog_;
        Api = _Api_;
        vm = null;
        $q = _$q_;
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $timeout = _$timeout_;
        _deferred = $q.defer();
        $controller = _$controller_;
        $scope = $rootScope.$new();
        specHelper.utility.stubRootUrl(Utility);
        specHelper.userContext.stub(Utility);
        specHelper.utility.stubStorageSet(Utility);
        mainFlowStateSpy = <jasmine.Spy>specHelper.general.spyProperty(ap.controllers.UIStateController.prototype, "mainFlowState", specHelper.PropertyAccessor.Get);
        mainFlowStateSpy.and.returnValue(ap.controllers.MainFlow.Points);
        let _deferredCustom = $q.defer();
        spyOn(ControllersManager.customViewController, "getCustomViewList").and.returnValue(_deferredCustom.promise);
        _deferredCustom.resolve([]);
        spyOn(Utility.Translator, "getTranslation").and.callFake(function (key) {
            return "$" + key;
        });
    }));

    afterEach(() => {
        specHelper.general.offSpyProperty(ap.controllers.UIStateController.prototype, "mainFlowState", specHelper.PropertyAccessor.Get)
    });

    describe("Feature : userComment", () => {
        let n: ap.models.notes.Note;
        beforeEach(function () {
            specHelper.mainController.stub(MainController, Utility);
            n = new ap.models.notes.Note(Utility);
            n.CodeNum = "1.35";
            n.Code = "CODE 1.35";
            n.Subject = "Plumbing problem in the garage";
            n.From = new ap.models.actors.User(Utility);
            n.From.Person = new ap.models.actors.Person(Utility);
            n.From.Person.Name = "Quentin";

            n.DueDate = new Date();

            n.Cell = new ap.models.projects.SubCell(Utility);
            n.Cell.Code = "C1";

            n.IssueType = new ap.models.projects.IssueType(Utility);
            n.IssueType.Code = "IT1";
            n.IssueType.ParentChapter = new ap.models.projects.Chapter(Utility);
            n.IssueType.ParentChapter.Code = "CHA1";
            n.IsArchived = false;
            n.Comments = [];
            let comment: ap.models.notes.NoteComment = new ap.models.notes.NoteComment(Utility);
            comment.createByJson(
                {
                    Id: "a501aee5-4997-4717-96f2-3ddd1f098bef",
                    IsRead: true
                }
            );
            n.Comments.push(comment);

            n.Status = new ap.models.projects.NoteProjectStatus(Utility);
            n.Status.createByJson({
                Id: "9ed59a44-2df4-4f5e-8287-c579646d9c28"
            });
            n.Status.Name = "In Progress";
            n.Status.Color = "25d84b";
            n.Status.IsDone = false;

            n.NoteInCharge = [];

            let ni: ap.models.notes.NoteInCharge;
            ni = new ap.models.notes.NoteInCharge(Utility);
            ni.Tag = "Sergio";
            n.NoteInCharge.push(ni);

            n.MeetingAccessRight = null;
        });

        describe("WHEN an UserComment item is created with a note and comments is not defined", () => {
            it("THEN, the item is build with the correct values and comments = NULL", () => {
                n.Comments = [];
                let item = new ap.viewmodels.notes.NoteItemViewModel(Utility, $q, undefined, new ap.viewmodels.notes.UserCommentItemConstructorParameter(undefined, n, null, null, Utility, ControllersManager));
                item.init(n);

                expect(item.codeNum).toBe(n.CodeNum);
                expect(item.subject).toBe(n.Subject);
                expect(item.dueDate).toBe(n.DueDate);
                expect(item.dueDateFormatted).toBe(n.DueDate.format(DateFormat.Standard));
                expect(item.from).toBe(n.From.Person.Name);
                expect(item.room).toBe("C1");
                expect(item.category).toBe("CHA1/IT1");
                expect(item.inCharge).toEqual("Sergio");
                expect(item.inChargeList).toContain(jasmine.objectContaining({ Tag: "Sergio" }));
                expect(item.comment).not.toBeDefined();
            });
        });

        describe("WHEN an UserComment item is created with a note and projectController and noteController are defined", () => {
            it("THEN, the item is build with the correct values and Status is defined", () => {
                let defStatus = $q.defer();
                spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue(defStatus.promise);

                let item = new ap.viewmodels.notes.NoteItemViewModel(Utility, $q, null, new ap.viewmodels.notes.UserCommentItemConstructorParameter(null, n, null, null, Utility, ControllersManager));
                item.originalId = "a501aee5-4997-4717-96f2-3ddd1f098bef";
                item.originalId = "a501aee5-4997-4717-96f2-3ddd1f098bef";
                item.init(n);

                defStatus.resolve([n.Status]);
                $rootScope.$apply();

                expect(item.codeNum).toBe(n.CodeNum);
                expect(item.subject).toBe(n.Subject);
                expect(item.dueDate).toBe(n.DueDate);
                expect(item.dueDateFormatted).toBe(n.DueDate.format(DateFormat.Standard));
                expect(item.from).toBe(n.From.Person.Name);
                expect(item.room).toBe("C1");
                expect(item.category).toBe("CHA1/IT1");
                expect(item.inCharge).toEqual("Sergio");
                expect(item.inChargeList).toContain(jasmine.objectContaining({ Tag: "Sergio" }));
                expect(item.originalId).toBe("a501aee5-4997-4717-96f2-3ddd1f098bef");
                expect(item.status).toEqual("In Progress");
                expect(item.statusColor).toEqual("#25d84b");
            });
        });

        describe("WHEN an UserComment item is created with a note and a comment and meetingAccessRight and projectController and noteController", () => {
            it("THEN, the item is build with the correct values", () => {
                let meetingAccessRight: ap.models.accessRights.MeetingAccessRight = new ap.models.accessRights.MeetingAccessRight(Utility);
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

                n.MeetingAccessRight = meetingAccessRight;

                let defStatus = $q.defer();
                spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue(defStatus.promise);

                let item = new ap.viewmodels.notes.NoteItemViewModel(Utility, $q, null, new ap.viewmodels.notes.UserCommentItemConstructorParameter(null, n, null, null, Utility, ControllersManager, n.Comments[0]));
                item.originalId = "a501aee5-4997-4717-96f2-3ddd1f098bef";
                item.originalId = "a501aee5-4997-4717-96f2-3ddd1f098bef";
                item.init(n);

                defStatus.resolve([n.Status]);
                $rootScope.$apply();

                expect(item.codeNum).toBe(n.CodeNum);
                expect(item.subject).toBe(n.Subject);
                expect(item.from).toBe(n.From.Person.Name);
                expect(item.room).toBe("C1");
                expect(item.status).toBe("In Progress");
                expect(item.statusColor).toBe("#25d84b");
                expect(item.category).toBe("CHA1/IT1");
                expect(item.inCharge).toEqual("Sergio");
                expect(item.inChargeList).toContain(jasmine.objectContaining({ Tag: "Sergio" }));
                expect(item.originalId).toBe("a501aee5-4997-4717-96f2-3ddd1f098bef");
                expect(item.meetingAccessRight.Level).toEqual(ap.models.accessRights.AccessRightLevel.Admin);

                expect(ProjectController.getNoteProjectStatusList).toHaveBeenCalled();
            });
        });

        describe("WHEN an UserComment item is created with a note AND a comment and meetingAccessRight IS SubContractor AND Status IsDone AND projectController AND oteController", () => {
            it("THEN, the items is build with the correct values AND the Color = #4CAF50 AND StatusName = '[Done]'", () => {
                let meetingAccessRight: ap.models.accessRights.MeetingAccessRight = new ap.models.accessRights.MeetingAccessRight(Utility);
                meetingAccessRight.createByJson({
                    ModuleName: 'Meeting',
                    Level: ap.models.accessRights.AccessRightLevel.Subcontractor,
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

                n.MeetingAccessRight = meetingAccessRight;

                let defStatus = $q.defer();
                spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue(defStatus.promise);

                n.Status.IsDone = true;
                let item = new ap.viewmodels.notes.NoteItemViewModel(Utility, $q, null, new ap.viewmodels.notes.UserCommentItemConstructorParameter(null, n, null, null, Utility, ControllersManager, n.Comments[0]));
                item.originalId = "a501aee5-4997-4717-96f2-3ddd1f098bef"
                item.originalId = "a501aee5-4997-4717-96f2-3ddd1f098bef"
                item.init(n);

                defStatus.resolve([{ Id: "9ed59a44-2df4-4f5e-8287-c579646d9c28", Name: "[Done]", Color: "4CAF50", IsDone: true }]);
                $rootScope.$apply();

                expect(item.codeNum).toBe(n.CodeNum);
                expect(item.subject).toBe(n.Subject);
                expect(item.from).toBe(n.From.Person.Name);
                expect(item.room).toBe("C1");
                expect(item.status).toBe("[Done]");
                expect(item.statusColor).toBe("#4CAF50");
                expect(item.category).toBe("CHA1/IT1");
                expect(item.inCharge).toEqual("Sergio");
                expect(item.inChargeList).toContain(jasmine.objectContaining({ Tag: "Sergio" }));
                expect(item.originalId).toBe("a501aee5-4997-4717-96f2-3ddd1f098bef");
                expect(item.meetingAccessRight.Level).toEqual(ap.models.accessRights.AccessRightLevel.Subcontractor);
            });
        });
        describe("WHEN an UserComment item is created with a note AND a comment and meetingAccessRight IS SubContractor AND Status IsDone = FALSE AND projectController AND noteController", () => {
            it("THEN, the items is build with the correct values AND the Color = #4CAF50 AND StatusName = '[Done]'", () => {
                let meetingAccessRight: ap.models.accessRights.MeetingAccessRight = new ap.models.accessRights.MeetingAccessRight(Utility);
                meetingAccessRight.createByJson({
                    ModuleName: 'Meeting',
                    Level: ap.models.accessRights.AccessRightLevel.Subcontractor,
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

                n.MeetingAccessRight = meetingAccessRight;

                let defStatus = $q.defer();
                spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue(defStatus.promise);

                n.Status.IsDone = false;
                let item = new ap.viewmodels.notes.NoteItemViewModel(Utility, $q, null, new ap.viewmodels.notes.UserCommentItemConstructorParameter(undefined, n, null, null, Utility, ControllersManager, n.Comments[0]));
                item.originalId = "a501aee5-4997-4717-96f2-3ddd1f098bef";
                item.init(n);

                defStatus.resolve([{ Id: "9ed59a44-2df4-4f5e-8287-c579646d9c28", Name: "[To Do]", Color: "FFA726", IsDone: false }]);
                $rootScope.$apply();

                expect(item.codeNum).toBe(n.CodeNum);
                expect(item.subject).toBe(n.Subject);
                expect(item.from).toBe(n.From.Person.Name);
                expect(item.room).toBe("C1");
                expect(item.status).toBe("[To Do]");
                expect(item.statusColor).toBe("#FFA726");
                expect(item.category).toBe("CHA1/IT1");
                expect(item.inCharge).toEqual("Sergio");
                expect(item.inChargeList).toContain(jasmine.objectContaining({ Tag: "Sergio" }));
                expect(item.originalId).toBe("a501aee5-4997-4717-96f2-3ddd1f098bef");
                expect(item.meetingAccessRight.Level).toEqual(ap.models.accessRights.AccessRightLevel.Subcontractor);
            });
        });
    });

    describe("Feature: Read a note", () => {
        describe("WHEN a call is made to updateNoteIsRead of UserComment AND the note is not read", () => {
            it("THEN, NoteController.updateNoteIsRead is called with the note as parameter", () => {
                let defStatus = $q.defer();
                let defIsRead = $q.defer();
                spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue(defStatus.promise);

                let n = new ap.models.notes.Note(Utility);
                let item = new ap.viewmodels.notes.NoteItemViewModel(Utility, $q, null, new ap.viewmodels.notes.UserCommentItemConstructorParameter(null, n, null, null, Utility, ControllersManager));
                item.init(n);

                spyOn(NoteController, "updateNoteIsRead").and.returnValue(defIsRead.promise);

                item.updateNoteIsRead();
                expect(NoteController.updateNoteIsRead).toHaveBeenCalledWith(n);
            });
        });
        describe("WHEN a call is made to updateNoteIsRead of UserComment AND the note is not read", () => {
            it("THEN, NoteController.updateNoteIsRead is called AND the note is read", () => {
                let defStatus = $q.defer();
                let defIsRead = $q.defer();
                spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue(defStatus.promise);

                let n = new ap.models.notes.Note(Utility);
                let item = new ap.viewmodels.notes.NoteItemViewModel(Utility, $q, null, new ap.viewmodels.notes.UserCommentItemConstructorParameter(null, n, null, null, Utility, ControllersManager));
                item.init(n);

                spyOn(NoteController, "updateNoteIsRead").and.callThrough();
                spyOn(Api, "getApiResponse").and.returnValue(defIsRead.promise);

                item.updateNoteIsRead();
                expect(NoteController.updateNoteIsRead).toHaveBeenCalled();

                defIsRead.resolve();
                $rootScope.$apply();

                expect(item.originalNote.IsRead).toBeTruthy();
            });
        });
        describe("WHEN a call is made to updateNoteIsRead of UserComment AND the note is read", () => {
            it("THEN, NoteController.updateNoteIsRead is called with the note as parameter", () => {
                let defStatus = $q.defer();
                let defIsRead = $q.defer();
                spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue(defStatus.promise);

                let n = new ap.models.notes.Note(Utility);
                n.IsRead = true;
                let item = new ap.viewmodels.notes.NoteItemViewModel(Utility, $q, null, new ap.viewmodels.notes.UserCommentItemConstructorParameter(null, n, null, null, Utility, ControllersManager));
                item.init(n);

                spyOn(NoteController, "updateNoteIsRead").and.returnValue(defIsRead.promise);

                item.updateNoteIsRead();
                expect(NoteController.updateNoteIsRead).not.toHaveBeenCalled();
            });
        });
    });

    describe("Feature: Save the status of the list item", () => {
        let n: ap.models.notes.Note;
        let noteProjectStatusList = [];
        let status: ap.models.projects.NoteProjectStatus;

        beforeEach(() => {
            noteProjectStatusList = [
                {
                    Id: "a1989fce-db6a-4d2d-8830-08ebe8bbe49a",
                    Code: "InProgress",
                    Name: "In progress",
                    Color: "23def5",
                    IsOnlyUsedByMeetingManager: false,
                    IsTodo: true,
                    IsDone: false,
                    DoneAction: false,
                },
                {
                    Id: "242b0cf8-47f1-46c0-b00b-7a7de5569c5b",
                    Code: "Done",
                    Name: "Done",
                    Color: "000000",
                    IsOnlyUsedByMeetingManager: false,
                    IsTodo: false,
                    IsDone: true,
                    DoneAction: true,
                },
                {
                    Id: "94106981-482a-42c0-8928-4f03627657d0",
                    Code: "Cancelled",
                    Name: "Cancelled",
                    Color: "ffddff",
                    IsOnlyUsedByMeetingManager: false,
                    IsTodo: false,
                    IsDone: false,
                    DoneAction: false,
                }
            ];

            n = new ap.models.notes.Note(Utility);
            n.createByJson({
                Id: "b360cb6d-ca54-4b93-a564-a469274eb68a",
                Subject: "Save the status of a noteItem"
            });

            let user = new ap.models.actors.User(Utility);
            let person = new ap.models.actors.Person(Utility);
            person.createByJson({
                Name: "Quentin"
            });
            user.createByJson({
                Person: person,
                Id: "45de9da1-7935-4119-bdb8-98d92f159d08"
            });
            n.From = user;

            n.Cell = new ap.models.projects.SubCell(Utility);
            n.Cell.Code = "C1";

            n.IssueType = new ap.models.projects.IssueType(Utility);
            n.IssueType.Code = "IT1";
            n.IssueType.ParentChapter = new ap.models.projects.Chapter(Utility);
            n.IssueType.ParentChapter.Code = "CHA1";

            n.Comments = [];
            let comment: ap.models.notes.NoteComment = new ap.models.notes.NoteComment(Utility);
            comment.createByJson(
                {
                    Id: "a501aee5-4997-4717-96f2-3ddd1f098bef",
                    IsRead: true
                }
            );
            n.Comments.push(comment);

            let status = new ap.models.projects.NoteProjectStatus(Utility);
            status.createByJson({
                Id: "a1989fce-db6a-4d2d-8830-08ebe8bbe49a",
                Code: "InProgress",
                Name: "In progress",
                Color: "#23def5",
                IsOnlyUsedByMeetingManager: false,
                IsTodo: true,
                IsDone: false,
                DoneAction: false
            });
            n.Status = status;

            n.NoteInCharge = [];

            let ni: ap.models.notes.NoteInCharge;
            ni = new ap.models.notes.NoteInCharge(Utility);
            ni.Tag = "Sergio";
            n.NoteInCharge.push(ni);

            n.MeetingAccessRight = null;
        });

        describe("WHEN selectedItemChanged of the noteProjectStatusList is called AND the user IS NOT SubContractor AND the status is different than the current one", () => {
            it("THEN NoteController.updateNoteStatus is called AND the current note is refreshed with the one got from the API AND the status is refresehd with the status of the updated note", () => {
                let meetingAccessRight: ap.models.accessRights.MeetingAccessRight = new ap.models.accessRights.MeetingAccessRight(Utility);
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

                n.MeetingAccessRight = meetingAccessRight;

                let defNoteStatus = $q.defer();
                let defSave = $q.defer();
                spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue(defNoteStatus.promise);
                spyOn(NoteController, "updateNoteStatus").and.returnValue(defSave.promise);

                let item = new ap.viewmodels.notes.NoteItemViewModel(Utility, $q, null, new ap.viewmodels.notes.UserCommentItemConstructorParameter(null, n, null, null, Utility, ControllersManager, n.Comments[0]));
                item.init(n);

                defNoteStatus.resolve(noteProjectStatusList);
                $rootScope.$apply();

                item.noteProjectStatusList.selectEntity("242b0cf8-47f1-46c0-b00b-7a7de5569c5b");

                expect(NoteController.updateNoteStatus).toHaveBeenCalledWith(n, noteProjectStatusList[1]);

                let savedNote: ap.models.notes.Note = new ap.models.notes.Note(Utility);
                savedNote.createByJson({
                    Id: "b360cb6d-ca54-4b93-a564-a469274eb68a",
                    EntityVersion: 2,
                    Status: noteProjectStatusList[1]
                });
                defSave.resolve(savedNote);
                $rootScope.$apply();

                expect(item.originalNote.EntityVersion).toEqual(2);
                expect(item.subject).toBe("Save the status of a noteItem");
                expect(item.status).toEqual("Done");
                expect(item.statusColor).toEqual("#000000");
            });
        });

        describe("WHEN selectedItemChanged of the noteProjectStatusList is called AND the user IS NOT SubContractor AND the status is different than the current one BUT there is an error during the save", () => {
            it("THEN the selectedViewModel of the noteProjectStatusListViewModel is set to the original one", () => {
                let meetingAccessRight: ap.models.accessRights.MeetingAccessRight = new ap.models.accessRights.MeetingAccessRight(Utility);
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

                n.MeetingAccessRight = meetingAccessRight;

                let defNoteStatus = $q.defer();
                let defSave = $q.defer();
                spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue(defNoteStatus.promise);
                spyOn(NoteController, "updateNoteStatus").and.returnValue(defSave.promise);

                let item = new ap.viewmodels.notes.NoteItemViewModel(Utility, $q, null, new ap.viewmodels.notes.UserCommentItemConstructorParameter(null, n, null, null, Utility, ControllersManager, n.Comments[0]));
                item.init(n);

                defNoteStatus.resolve(noteProjectStatusList);
                $rootScope.$apply();

                item.noteProjectStatusList.selectEntity("242b0cf8-47f1-46c0-b00b-7a7de5569c5b");

                expect(NoteController.updateNoteStatus).toHaveBeenCalledWith(n, noteProjectStatusList[1]);

                let errorAgr = new ap.services.apiHelper.ServiceCompletedArgs("error data", "error context", new ap.services.apiHelper.ServiceError("error status",
                    "error context", [{ Message: "error message" }]));
                defSave.reject(errorAgr);
                $rootScope.$apply();

                expect(item.subject).toBe("Save the status of a noteItem");
                expect(item.status).toEqual("In progress");
                expect(item.statusColor).toEqual("#23def5");
                expect(item.noteProjectStatusList.selectedViewModel.originalEntity.Id).toEqual("a1989fce-db6a-4d2d-8830-08ebe8bbe49a");
            });
        });

        describe("WHEN selectedItemChanged of the noteProjectStatusList is called AND the user IS SubContractor AND the selected status is different than the current one AND IsDone", () => {
            it("THEN NoteController.updateNoteStatus is called AND the current note is refreshed with the one got from the API AND the status is refresehd with the selected one of the list", () => {
                let meetingAccessRight: ap.models.accessRights.MeetingAccessRight = new ap.models.accessRights.MeetingAccessRight(Utility);
                meetingAccessRight.createByJson({
                    ModuleName: 'Meeting',
                    Level: ap.models.accessRights.AccessRightLevel.Subcontractor,
                    CanEdit: true,
                    CanAddPoint: false,
                    CanEditPoint: false,
                    CanDeletePoint: true,
                    CanEditPointStatus: true,
                    CanAddComment: true,
                    CanDeleteComment: false,
                    CanArchiveComment: false,
                    CanAddDoc: true,
                    CanGenerateReport: true,
                    CanCreateNextMeeting: false,
                    CanEditAllPoint: false,
                    CanViewOnlyPointInCharge: true
                });

                n.MeetingAccessRight = meetingAccessRight;

                let defSave = $q.defer();
                let defStatus = $q.defer();
                spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue(defStatus.promise);
                spyOn(NoteController, "changeDoneUndoneBlockedStatus").and.returnValue(defSave.promise);

                let item = new ap.viewmodels.notes.NoteItemViewModel(Utility, $q, null, new ap.viewmodels.notes.UserCommentItemConstructorParameter(null, n, null, null, Utility, ControllersManager, n.Comments[0]));
                item.init(n);

                let statusList: ap.models.projects.NoteProjectStatus[] = [];
                let fakeStatusToDo: ap.models.projects.NoteProjectStatus = new ap.models.projects.NoteProjectStatus(Utility);
                fakeStatusToDo.createByJson({
                    Id: "a1989fce-db6a-4d2d-8830-08ebe8bbe49a",
                    Name: Utility.Translator.getTranslation("To Do"),
                    IsDone: false,
                    IsBlocked: false,
                    Color: "FFA726"
                });
                statusList.push(fakeStatusToDo);

                // add a fake item to handle Done
                let fakeStatusDone: ap.models.projects.NoteProjectStatus = new ap.models.projects.NoteProjectStatus(Utility);
                fakeStatusDone.createByJson({
                    Id: "00000000-0000-0000-0000-000000000000",
                    Name: Utility.Translator.getTranslation("Done"),
                    IsDone: true,
                    IsBlocked: false,
                    Color: "4CAF50"
                });
                statusList.push(fakeStatusDone);

                expect(ProjectController.getNoteProjectStatusList).toHaveBeenCalledWith(n.Status, false); //true, "a1989fce-db6a-4d2d-8830-08ebe8bbe49a", false
                defStatus.resolve(statusList);
                $rootScope.$apply();

                item.noteProjectStatusList.selectEntity("00000000-0000-0000-0000-000000000000");

                expect(NoteController.changeDoneUndoneBlockedStatus).toHaveBeenCalledWith("b360cb6d-ca54-4b93-a564-a469274eb68a", true, false);

                let savedNote: ap.models.notes.Note = new ap.models.notes.Note(Utility);
                savedNote.createByJson({
                    Id: "b360cb6d-ca54-4b93-a564-a469274eb68a",
                    EntityVersion: 2,
                    Status: noteProjectStatusList[1]
                });
                defSave.resolve(savedNote);
                $rootScope.$apply();

                expect(item.originalNote.EntityVersion).toEqual(2);
                expect(item.status).toEqual("$Done");
                expect(item.statusColor).toEqual("#4CAF50");
            });
        });

        describe("WHEN selectedItemChanged of the noteProjectStatusList is called AND the user IS SubContractor AND the selected status is different than the current one AND IsDone = FALSE", () => {
            it("THEN NoteController.updateNoteStatus is called AND the current note is refreshed with the one got from the API AND the status is refresehd with the selected one of the list", () => {
                let meetingAccessRight: ap.models.accessRights.MeetingAccessRight = new ap.models.accessRights.MeetingAccessRight(Utility);
                meetingAccessRight.createByJson({
                    ModuleName: 'Meeting',
                    Level: ap.models.accessRights.AccessRightLevel.Subcontractor,
                    CanEdit: true,
                    CanAddPoint: false,
                    CanEditPoint: false,
                    CanDeletePoint: true,
                    CanEditPointStatus: true,
                    CanAddComment: true,
                    CanDeleteComment: false,
                    CanArchiveComment: false,
                    CanAddDoc: true,
                    CanGenerateReport: true,
                    CanCreateNextMeeting: false,
                    CanEditAllPoint: false,
                    CanViewOnlyPointInCharge: true
                });

                n.MeetingAccessRight = meetingAccessRight;

                let defSave = $q.defer();
                let defStatus = $q.defer();
                spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue(defStatus.promise);
                spyOn(NoteController, "changeDoneUndoneBlockedStatus").and.returnValue(defSave.promise);

                n.Status.IsDone = true;
                let item = new ap.viewmodels.notes.NoteItemViewModel(Utility, $q, null, new ap.viewmodels.notes.UserCommentItemConstructorParameter(null, n, null, null, Utility, ControllersManager, n.Comments[0]));
                item.init(n);

                let statusList: ap.models.projects.NoteProjectStatus[] = [];
                let fakeStatusToDo: ap.models.projects.NoteProjectStatus = new ap.models.projects.NoteProjectStatus(Utility);
                fakeStatusToDo.createByJson({
                    Id: "00000000-0000-0000-0000-000000000000",
                    Name: Utility.Translator.getTranslation("To Do"),
                    IsDone: false,
                    IsBlocked: false,
                    Color: "FFA726"
                });
                statusList.push(fakeStatusToDo);

                // add a fake item to handle Done
                let fakeStatusDone: ap.models.projects.NoteProjectStatus = new ap.models.projects.NoteProjectStatus(Utility);
                fakeStatusDone.createByJson({
                    Id: "a1989fce-db6a-4d2d-8830-08ebe8bbe49a",
                    Name: Utility.Translator.getTranslation("Done"),
                    IsDone: true,
                    IsBlocked: false,
                    Color: "4CAF50"
                });
                statusList.push(fakeStatusDone);

                expect(ProjectController.getNoteProjectStatusList).toHaveBeenCalledWith(n.Status, false); //true, "a1989fce-db6a-4d2d-8830-08ebe8bbe49a", true
                defStatus.resolve(statusList);
                $rootScope.$apply();

                item.noteProjectStatusList.selectEntity("00000000-0000-0000-0000-000000000000");

                expect(NoteController.changeDoneUndoneBlockedStatus).toHaveBeenCalledWith("b360cb6d-ca54-4b93-a564-a469274eb68a", false, false);

                let savedNote: ap.models.notes.Note = new ap.models.notes.Note(Utility);
                savedNote.createByJson({
                    Id: "b360cb6d-ca54-4b93-a564-a469274eb68a",
                    EntityVersion: 2,
                    Status: noteProjectStatusList[0]
                });
                defSave.resolve(savedNote);
                $rootScope.$apply();

                expect(item.originalNote.EntityVersion).toEqual(2);
                expect(item.status).toEqual("$To Do");
                expect(item.statusColor).toEqual("#FFA726");
            });
        });
    });

    describe("Feature: Default values", () => {

        let defStat: angular.IDeferred<any>;
        let urlexpect = "rest/usercommentsids";
        let sts;
        let opt: ap.services.apiHelper.ApiOption;
        let pathtoload: string;
        let predefinedFilters: ap.misc.PredefinedFilter[];

        beforeEach(() => {
            defStat = $q.defer();
            urlexpect = "rest/usercommentsids";
            spyOn(Utility.Storage.Session, "get").and.returnValue(null);

            spyOn(Api, "getApiResponse").and.callFake(function (url, method) {
                if (url.indexOf("rest/usercommentsids") === 0 && method === ap.services.apiHelper.MethodType.Get)
                    return _deferred.promise;
                return null;
            });

            spyOn(Api, "getApiResponseStatList").and.callFake(function (url, method) {
                return defStat.promise;
            });

            specHelper.mainController.stub(MainController, Utility);

            sts = [
                [
                    {
                        Count: 1, // 1 note
                        GroupByValue: false // not archived
                    }
                ]
            ];

            opt = new ap.services.apiHelper.ApiOption();
            opt.async = false;
            pathtoload = "IsReadOnly,HasAttachment,Status.IsDone,Status.IsTodo,Status.IsBlocked,Status.IsBlockedAction,Status.IsOnlyUsedByMeetingManager,Subject,DueDate,IsUrgent,CodeNum,Code,ProjectNumSeq,MeetingNumSeq,EntityVersion,IsArchived,From.Person.Name,Cell.Code,Cell.Description,NoteInCharge.Tag,Date,";
            pathtoload += "IssueType.Code,IssueType.Description,IssueType.ParentChapter.Code,IssueType.ParentChapter.Description,NoteInCharge.UserId,Status.Color,Status.Name,Status.IsDisabled,Comments.LastModificationDate,Comments.IsRead,Meeting.Title,Meeting.Code,Meeting.NumberingType,Meeting.IsSystem";
        });

        describe("WHEN noteList ViewModel is created and the user have license Expert or higher", () => {
            beforeEach(() => {
                let def = $q.defer();
                specHelper.general.spyProperty(ap.viewmodels.GenericPagedListViewModels.prototype, "ids", specHelper.PropertyAccessor.Get).and.returnValue(["1", "2", "3"]);
                specHelper.general.spyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get).and.returnValue({ Id: "1" });
                spyOn(AccessRightController, "getMeetingAccessRight").and.returnValue(def.promise);
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake(function (moduleCode: string) {
                    if (moduleCode === ap.models.licensing.Module.Module_ListFilter)
                        return true;
                    return false;
                });

                predefinedFilters = [];
                predefinedFilters.push(new ap.misc.PredefinedFilter("Active", "Active points", true, undefined, new Dictionary([new KeyValue("isarchived", "false")]), ["Archived"]));
                predefinedFilters.push(new ap.misc.PredefinedFilter("Todo", "To do points", true, undefined, new Dictionary([new KeyValue("isdone", "false")]), ["Done"]));
                predefinedFilters.push(new ap.misc.PredefinedFilter("Done", "Done points", true, undefined, new Dictionary([new KeyValue("isdone", "true")]), ["Todo"]));
                predefinedFilters.push(new ap.misc.PredefinedFilter("Important", "Important points", true, undefined, new Dictionary([new KeyValue("isurgent", "true")])));
                predefinedFilters.push(new ap.misc.PredefinedFilter("Archived", "Archived points", true, undefined, new Dictionary([new KeyValue("isarchived", "true")]), ["Active"]));

                spyOn(ap.viewmodels.notes.NoteListViewModel.prototype, "refresh");

                vm = new ap.viewmodels.notes.NoteListViewModel($scope, Utility, Api, ControllersManager, $q, ServicesManager, $timeout, $mdDialog);

                def.resolve(null);
                $rootScope.$apply();

                vm.loadData();
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.GenericPagedListViewModels.prototype, "ids", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get);
            });
            it("THEN the ViewModel is defined", () => {
                expect(vm).toBeDefined();
                expect(vm.listVm).toBeDefined();
            });

            it("THEN the groupView is Date", () => {
                expect(vm.groupView).toBe("Date");
            });

            it("THEN the refresh method is called", () => {
                expect(ap.viewmodels.notes.NoteListViewModel.prototype.refresh).toHaveBeenCalled();
            });

            it("THEN the entityName of the list is 'Note'", () => {
                expect(vm.listVm.entityName).toBe("Note");
            });

            it("THEN the customEntituIds of the options is 'UserComment'", () => {
                expect(vm.listVm.options.customEntityIds).toBe("UserComment");
            });

            it("THEN the pathToLoad of the list is defined", () => {
                expect(vm.listVm.pathToLoad).toBe(pathtoload);
            });

            it("THEN the default filter is null", () => {
                expect(vm.listVm.defaultFilter).toBe(null);
            });

            it("THEN the pageSize of the list is 50", () => {
                expect(vm.listVm.options.pageSize).toBe(50);
            });

            it("THEN the DisplayLoading property of the options of the list is False", () => {
                expect(vm.listVm.options.displayLoading).toBeFalsy();
            });

            it("THEN the onlyPathToLoad property of the options of the list is TRUE", () => {
                expect(vm.listVm.options.onlyPathToLoadData).toBeTruthy();
            });

            it("THEN, the mainactions was created", () => {
                let mainActions = vm.mainActions;

                /*expect(mainActions[0].name).toBe("managenotescolumns");
                expect(mainActions[0].isEnabled).toBeTruthy();
                expect(mainActions[0].isVisible).toBeFalsy();
                expect(mainActions[0].translationKey).toBe("$Columns");
                expect(mainActions[0].iconSrc).toBe("https://app.aproplan.com/Images/html/icons/ic_view_week_black_48px.svg");
                expect(mainActions[0].hasSubActions).toBeFalsy();

                expect(mainActions[1].name).toBe("groupnotelist");
                expect(mainActions[1].isEnabled).toBeTruthy();
                expect(mainActions[1].isVisible).toBeTruthy();
                expect(mainActions[1].translationKey).toBe("$Group points");
                expect(mainActions[1].iconSrc).toBe("https://app.aproplan.com/Images/html/icons/ic_group_work_black_48px.svg");
                expect(mainActions[1].hasSubActions).toBeTruthy();
                expect(mainActions[1].subActions[0].name).toBe("groupnotelist.none");
                expect(mainActions[1].subActions[1].name).toBe("groupnotelist.status");
                expect(mainActions[1].subActions[2].name).toBe("groupnotelist.duedate");
                expect(mainActions[1].subActions[3].name).toBe("groupnotelist.date");
                expect(mainActions[1].subActions[4].name).toBe("groupnotelist.subcategory");
                expect(mainActions[1].subActions[5].name).toBe("groupnotelist.room2");*/

                expect(mainActions[0].name).toBe("printnotelist");
                expect(mainActions[0].isEnabled).toBeTruthy();
                expect(mainActions[0].isVisible).toBeTruthy();
                expect(mainActions[0].translationKey).toBe("$Generate report");
                expect(mainActions[0].iconSrc).toBe("https://app.aproplan.com/Images/html/icons/ic_print_black_48px.svg");
                expect(mainActions[0].hasSubActions).toBeFalsy();

                expect(mainActions[1].name).toBe("refreshnotelist");
                expect(mainActions[1].isEnabled).toBeTruthy();
                expect(mainActions[1].isVisible).toBeTruthy();
                expect(mainActions[1].translationKey).toBe("$Refresh list");
                expect(mainActions[1].iconSrc).toBe("https://app.aproplan.com/Images/html/icons/ic_refresh_black_48px.svg");
                expect(mainActions[1].hasSubActions).toBeFalsy();
            });

            it("THEN, the multiAction was created", () => {
                expect(vm.multiActionsViewModel).toBeDefined();
                expect(vm.multiActionsViewModel.actions[0].name).toEqual("printnotelist");
            });
            it("THEN, status bar actions was created", () => {
                let statusActions = vm.statusActions;
                expect(statusActions[0].name).toBe("groupnotelist");
                expect(statusActions[0].isEnabled).toBeTruthy();
                expect(statusActions[0].isVisible).toBeTruthy();
                expect(statusActions[0].translationKey).toBe("$Group by");
                expect(statusActions[0].iconSrc).toBe("https://app.aproplan.com/Images/html/icons/ic_group_work_black_48px.svg");
                expect(statusActions[0].hasSubActions).toBeTruthy();
                expect(statusActions[0].subActions[0].name).toBe("groupnotelist.none");
                expect(statusActions[0].subActions[1].name).toBe("groupnotelist.status");
                expect(statusActions[0].subActions[2].name).toBe("groupnotelist.duedate");
                expect(statusActions[0].subActions[3].name).toBe("groupnotelist.date");
                expect(statusActions[0].subActions[4].name).toBe("groupnotelist.subcategory");
                expect(statusActions[0].subActions[5].name).toBe("groupnotelist.room2");

                expect(statusActions[1].name).toBe("managenotescolumns");
                expect(statusActions[1].isEnabled).toBeTruthy();
                expect(statusActions[1].isVisible).toBeFalsy();
                expect(statusActions[1].translationKey).toBe("$Columns");
                expect(statusActions[1].iconSrc).toBe("https://app.aproplan.com/Images/html/icons/ic_view_week_black_48px.svg");
                expect(statusActions[1].hasSubActions).toBeFalsy();
            });
        });

        describe("WHEN noteList ViewModel is created and the user have license Pro or Free", () => {
            beforeEach(() => {
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake(function (moduleCode: string) {
                    if (moduleCode === ap.models.licensing.Module.Module_ListFilter)
                        return false;
                });

                predefinedFilters = [];
                predefinedFilters.push(new ap.misc.PredefinedFilter("Active", "Active points", true, undefined, new Dictionary([new KeyValue("isarchived", "false")]), ["Archived"]));
                predefinedFilters.push(new ap.misc.PredefinedFilter("Todo", "To do points", true, undefined, new Dictionary([new KeyValue("isdone", "false")]), ["Done"]));
                predefinedFilters.push(new ap.misc.PredefinedFilter("Done", "Done points", true, undefined, new Dictionary([new KeyValue("isdone", "true")]), ["Todo"]));
                predefinedFilters.push(new ap.misc.PredefinedFilter("Archived", "Archived points", true, undefined, new Dictionary([new KeyValue("isarchived", "true")]), ["Active"]));

                spyOn(ap.viewmodels.notes.NoteListViewModel.prototype, "refresh");

                vm = new ap.viewmodels.notes.NoteListViewModel($scope, Utility, Api, ControllersManager, $q, ServicesManager, $timeout, $mdDialog);
            });

            it("THEN the ViewModel is defined", () => {
                expect(vm).toBeDefined();
                expect(vm.listVm).toBeDefined();
            });
        });

        describe("WHEN noteList ViewModel is created with a planId", () => {

            beforeEach(() => {
                spyOn(ap.viewmodels.notes.NoteListViewModel.prototype, "refresh");

                vm = new ap.viewmodels.notes.NoteListViewModel($scope, Utility, Api, ControllersManager, $q, ServicesManager, $timeout, $mdDialog, true, "12");
                vm.loadData();
            });

            it("THEN the planId custom param exists", () => {
                expect(vm.listVm.containsParam("planid")).toBeTruthy();
            });
        });
    });

    describe("Feature: refresh", () => {
        let defStat: ng.IDeferred<any>;
        beforeEach(() => {
            let defApi = $q.defer();
            defStat = $q.defer();
            spyOn(Api, "getApiResponse").and.callFake(function (url, method) {
                if (url.indexOf("rest/usercommentsids") === 0 && method === ap.services.apiHelper.MethodType.Get)
                    return defApi.promise;
                return null;
            });

            spyOn(Api, "getApiResponseStatList").and.callFake(function (url, method) {
                return defStat.promise;
            });

            specHelper.mainController.stub(MainController, Utility);
            vm = new ap.viewmodels.notes.NoteListViewModel($scope, Utility, Api, ControllersManager, $q, ServicesManager, $timeout, $mdDialog);
            vm.loadData();
        });
        describe("WHEN the refresh method is called with point in the list", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.viewmodels.GenericPagedListViewModels.prototype, "ids", specHelper.PropertyAccessor.Get).and.returnValue(["1", "2"]);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.GenericPagedListViewModels.prototype, "ids", specHelper.PropertyAccessor.Get);
            });
            it("THEN, loadIds is called with active filter on the listVm AND when succeded loadNextPage is called AND the list is refreshed", () => {
                let _defPage = $q.defer();

                spyOn(vm.listVm, 'loadIds').and.returnValue(_deferred.promise);
                spyOn(vm.listVm, 'loadPage').and.returnValue(_defPage.promise);
                vm.refresh();

                expect(vm.archivedItemsCount).toBeNull(); //when refresh, set the values back to their initial value (null) because the list is loading
                expect(vm.unarchivedItemsCount).toBeNull();

                expect(vm.listVm.loadIds).toHaveBeenCalled();

                _deferred.resolve(new ap.services.apiHelper.ApiResponse({}));
                $rootScope.$apply();

                expect(vm.listVm.loadPage).toHaveBeenCalled();

                _defPage.resolve({ data: {} });
                $rootScope.$apply();
            });
        });
        describe("WHEN the refresh method is called but there is no point in the list", () => {
            it("THEN, notestats is called", () => {
                let _defPage = $q.defer();

                spyOn(vm.listVm, 'loadIds').and.returnValue(_deferred.promise);

                vm.refresh();
                expect(vm.listVm.loadIds).toHaveBeenCalled();

                _deferred.resolve(new ap.services.apiHelper.ApiResponse({}));
                $rootScope.$apply();

                expect(Api.getApiResponseStatList).toHaveBeenCalled();
            });
        });
        describe("WHEN the refresh method is called ", () => {
            it("THEN, the 'beginloaddata' event will be fire", () => {

                let callback = jasmine.createSpy("callback");

                let _defPage = $q.defer();

                spyOn(vm.listVm, 'loadIds').and.returnValue(_deferred.promise);

                vm.on("beginloaddata", function () {
                    callback();
                }, this);

                vm.refresh();

                expect(callback).toHaveBeenCalled();
            });
        });
        describe("WHEN the refresh method is called with the id to select ", () => {
            let noteProjectStatusDefer: angular.IDeferred<ap.models.projects.NoteProjectStatus[]>;
            beforeEach(() => {
                let _defPage = $q.defer();
                noteProjectStatusDefer = $q.defer();
                let testEntity = new ap.models.notes.Note(Utility);
                testEntity.createByJson({
                    Id: "b360cb6d-ca54-4b93-a564-a469274eb68a",
                    Comments: [{
                        Id: "b360cb6d-ca54-4b93-a564-a469274eb68a"
                    }]
                }, true);

                spyOn(ControllersManager.projectController, "getNoteProjectStatusList").and.returnValue(noteProjectStatusDefer.promise);
                spyOn(vm.listVm, 'loadIds').and.returnValue(_deferred.promise);
                spyOn(vm.listVm, 'loadPage').and.callFake(() => {
                    let itemVm = new ap.viewmodels.notes.NoteItemViewModel(Utility, $q, null,
                        new ap.viewmodels.notes.UserCommentItemConstructorParameter(undefined, testEntity, null, null, Utility, ControllersManager));
                    itemVm.init(testEntity);
                    itemVm.originalId = "b360cb6d-ca54-4b93-a564-a469274eb68a0";
                    vm.listVm.sourceItems = [itemVm];
                    return _defPage.promise;
                });

                _deferred.resolve(new ap.services.apiHelper.ApiResponse({}));
                _defPage.resolve({ data: {} });
                noteProjectStatusDefer.resolve([]);
                $rootScope.$apply();
                spyOn(vm.listVm, "getPageIndex").and.returnValue(0);
                spyOn(vm.listVm, "selectEntity");
                specHelper.general.spyProperty(ap.viewmodels.GenericPagedListViewModels.prototype, "ids", specHelper.PropertyAccessor.Get).and.returnValue(["1", "2"]);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.GenericPagedListViewModels.prototype, "ids", specHelper.PropertyAccessor.Get);
            });

            it("THEN, the listVm.getPageIndex was called", () => {
                vm.refresh("b360cb6d-ca54-4b93-a564-a469274eb68a0");
                $rootScope.$apply();
                expect(vm.listVm.getPageIndex).toHaveBeenCalledWith("b360cb6d-ca54-4b93-a564-a469274eb68a0");

            });

            it("AND, the listVm.loadPage was called with correct page", () => {
                vm.refresh("b360cb6d-ca54-4b93-a564-a469274eb68a0");
                $rootScope.$apply();
                expect(vm.listVm.loadPage).toHaveBeenCalledWith(0);

            });

            it("AND, the listVm.selectEntity was called", () => {
                vm.refresh("b360cb6d-ca54-4b93-a564-a469274eb68a0");
                $rootScope.$apply();
                expect(vm.listVm.selectEntity).toHaveBeenCalledWith("b360cb6d-ca54-4b93-a564-a469274eb68a");
            });

            it("AND, the topIndex will be update", () => {
                spyOn(vm.listVm, "getItemIndexWithGroup").and.returnValue(5);
                vm.refresh("b360cb6d-ca54-4b93-a564-a469274eb68a0");
                $rootScope.$apply();
                expect(vm.listVm.getItemIndexWithGroup).toHaveBeenCalledWith("b360cb6d-ca54-4b93-a564-a469274eb68a");
                expect(vm.topIndex).toEqual(5);
            });
        });
    });

    describe("Feature: Group points in list", () => {
        let defApi: ng.IDeferred<any>;
        let defStat: ng.IDeferred<any>;

        beforeEach(() => {
            defApi = $q.defer();
            defStat = $q.defer();
            spyOn(Api, "getApiResponse").and.callFake(function (url, method) {
                if (url.indexOf("rest/usercommentsids") === 0 && method === ap.services.apiHelper.MethodType.Get)
                    return defApi.promise;
                return null;
            });

            spyOn(Api, "getApiResponseStatList").and.callFake(function (url, method) {
                return defStat.promise;
            });
            specHelper.mainController.stub(MainController, Utility);

            vm = new ap.viewmodels.notes.NoteListViewModel($scope, Utility, Api, ControllersManager, $q, ServicesManager, $timeout, $mdDialog);

            spyOn(vm, "refresh");
        });

        describe("WHEN the user set the group to NoteGroup.Date", () => {
            it("THEN, the group is setted and the refresh method is called", () => {
                vm.groupView = "None"; // need this because date is the default group
                vm.groupView = "Date";

                expect(vm.groupView).toEqual("Date");
                expect(vm.listVm.getParam("groupby").value).toEqual("Date");
                expect(vm.refresh).toHaveBeenCalled();

                expect(vm.sortState.Mode).toEqual(ap.misc.sort.SortingMode.SingleColumn);
            });
        });

        describe("WHEN the user set the group to NoteGroup.None", () => {
            it("THEN, the group is setted and the refresh method is called", () => {
                vm.groupView = "None";

                expect(vm.groupView).toEqual("None");
                expect(vm.listVm.getParam("groupby").value).toEqual("None");
                expect(vm.refresh).toHaveBeenCalled();

                expect(vm.sortState.Mode).toEqual(ap.misc.sort.SortingMode.SingleColumn);
            });
        });

        describe("WHEN the user set the group to NoteGroup.SubCategory", () => {
            it("THEN, the group is setted and the refresh method is called", () => {
                vm.groupView = "SubCategory";

                expect(vm.groupView).toEqual("SubCategory");
                expect(vm.listVm.getParam("groupby").value).toEqual("PunchListItem");
                expect(vm.refresh).toHaveBeenCalled();

                expect(vm.sortState.Mode).toEqual(ap.misc.sort.SortingMode.SingleColumn);
            });
        });

        describe("WHEN the user set the group to NoteGroup.DueDate", () => {
            it("THEN, the group is setted and the refresh method is called", () => {
                vm.groupView = "DueDate";

                expect(vm.groupView).toEqual("DueDate");
                expect(vm.listVm.getParam("groupby").value).toEqual("DueDate");
                expect(vm.refresh).toHaveBeenCalled();

                expect(vm.sortState.Mode).toEqual(ap.misc.sort.SortingMode.SingleColumn);
            });
        });

        describe("WHEN the user set the group to NoteGroup.Status", () => {
            it("THEN, the group is setted and the refresh method is called", () => {
                vm.groupView = "Status";

                expect(vm.groupView).toEqual("Status");
                expect(vm.listVm.getParam("groupby").value).toEqual("Status");
                expect(vm.refresh).toHaveBeenCalled();

                expect(vm.sortState.Mode).toEqual(ap.misc.sort.SortingMode.SingleColumn);
            });
        });

        describe("WHEN the user set the group to NoteGroup.Room", () => {
            it("THEN, the group is setted and the refresh method is called", () => {
                vm.groupView = "Room";

                expect(vm.groupView).toEqual("Room");
                expect(vm.listVm.getParam("groupby").value).toEqual("Room");
                expect(vm.refresh).toHaveBeenCalled();

                expect(vm.sortState.Mode).toEqual(ap.misc.sort.SortingMode.SingleColumn);
            });
        });

        describe("WHEN the user set the group to NoteGroup.InCharge", () => {
            it("THEN, the group is setted and the refresh method is called", () => {
                vm.groupView = "InCharge";

                expect(vm.groupView).toEqual("InCharge");
                expect(vm.listVm.getParam("groupby").value).toEqual("InCharge");
                expect(vm.refresh).toHaveBeenCalled();

                expect(vm.sortState.Mode).toEqual(ap.misc.sort.SortingMode.SingleColumn);
            });
        });
    });

    describe("Feature: Save and restore list note group", () => {
        beforeEach(() => {
            specHelper.mainController.stub(MainController, Utility);

            vm = new ap.viewmodels.notes.NoteListViewModel($scope, Utility, Api, ControllersManager, $q, ServicesManager, $timeout, $mdDialog);
        });

        describe("WHEN groupView is changed", () => {
            it("THEN Storage.Session is called with 'note.groupView' and the new group value", () => {
                let status: string = "Status";

                vm.groupView = status;

                expect(vm.groupView).toEqual(status);
                expect(Utility.Storage.Session.set).toHaveBeenCalledWith("note.groupView", status);
            });
        });

        describe("WHEN the viewModel is created", () => {
            it("THEN groupView is initialized by calling Storage.Session with 'note.groupView' and groupView returns the value", () => {
                let status: string = "Status";
                spyOn(Utility.Storage.Session, "get").and.callFake(function (key) {
                    if (key === "note.groupView")
                        return status;
                    return null;
                });

                vm = new ap.viewmodels.notes.NoteListViewModel($scope, Utility, Api, ControllersManager, $q, ServicesManager, $timeout, $mdDialog);

                expect(Utility.Storage.Session.get).toHaveBeenCalledWith("note.groupView");
                expect(vm.groupView).toEqual(status);
                expect(vm.listVm.getParam("groupby").value).toEqual("Status");
            });
        });
    });

    describe("Feature: dispose", () => {
        describe("WHEN the dispose method is called", () => {
            it("THEN, the dispose method of the userCommentLIstVm is called", () => {
                spyOn(Api, "getApiResponse").and.returnValue($q.defer().promise);
                spyOn(Api, "getApiResponseStatList").and.returnValue($q.defer().promise);

                specHelper.mainController.stub(MainController, Utility);

                vm = new ap.viewmodels.notes.NoteListViewModel($scope, Utility, Api, ControllersManager, $q, ServicesManager, $timeout, $mdDialog);

                spyOn(vm.listVm, "dispose");
                vm.dispose();
                expect(vm.listVm).toBeNull();
            });
        });
    });

    describe("Feature: set planId", () => {

        beforeEach(() => {
            spyOn(Api, "getApiResponse").and.returnValue($q.defer().promise);
            spyOn(Api, "getApiResponseStatList").and.returnValue($q.defer().promise);

            specHelper.mainController.stub(MainController, Utility);

            vm = new ap.viewmodels.notes.NoteListViewModel($scope, Utility, Api, ControllersManager, $q, ServicesManager, $timeout, $mdDialog);

            spyOn(vm, "refresh");
        });

        describe("WHEN planId is set to a new value", () => {
            it("THEN, the refresh method is called", () => {
                vm.planId = "2";

                expect(vm.refresh).toHaveBeenCalled();
            });
        });

        describe("WHEN planId is set to the same value", () => {

            beforeEach(() => {
                vm.planId = "2";
            });

            it("THEN, the refresh method is not called", () => {
                vm.planId = "2";
                expect((<jasmine.Spy>vm.refresh).calls.count()).toEqual(1);
            });
        });
    });


    describe("Feature: multi actions", () => {
        beforeEach(() => {
            specHelper.mainController.stub(MainController, Utility);
            vm = new ap.viewmodels.notes.NoteListViewModel($scope, Utility, Api, ControllersManager, $q, ServicesManager, $timeout, $mdDialog);
        });

        describe("when invoke gotoMultiActions", () => {
            let calledAction: MultiActionsViewModel;
            let dummyChekedItems = [{ Id: "1" }, { Id: "2" }, { Id: "3" }];
            let idsChecked = ["1", "2", "3"];
            function getActionByName(name: string) {
                for (let i = 0, len = vm.multiActionsViewModel.actions.length; i < len; i++) {
                    if (vm.multiActionsViewModel.actions[i].name === name) {
                        return vm.multiActionsViewModel.actions[i];
                    }
                }
                return null;
            }

            beforeEach(() => {
                spyOn(vm.listVm, "getCheckedItems").and.returnValue(dummyChekedItems);
                spyOn(vm.listVm, "getCheckedIds").and.returnValue(idsChecked);
                vm.listVm.listidsChecked = idsChecked;
                spyOn(MainController, "gotoMultiActionsMode").and.callFake((multiActions: MultiActionsViewModel) => {
                    calledAction = multiActions;
                });
                mainFlowStateSpy.and.returnValue(ap.controllers.MainFlow.Points);

            });

            describe("when filtre = active", () => {
                beforeEach(() => {
                    spyOn(vm.screenInfo.mainSearchInfo, "hasPredefinedFilterCriterion").and.callFake((args: any) => {
                        if (args === 'Active') {
                            return true;
                        } else {
                            return false;
                        }
                    });

                    specHelper.general.spyProperty(ap.misc.ScreenInfo.prototype, "checkedEntitiesId", specHelper.PropertyAccessor.Get).and.returnValue(["2", "4"]);
                    vm.manageMultiActionsMode();
                });

                afterEach(() => {
                    specHelper.general.offSpyProperty(ap.misc.ScreenInfo.prototype, "checkedEntitiesId", specHelper.PropertyAccessor.Get);
                });
                it("THEN, MainController.gotoMultiActionsMode is called", () => {
                    expect(MainController.gotoMultiActionsMode).toHaveBeenCalled();
                });
                it("THEN, the 1st action's name is 'printnotelist'", () => {
                    expect(calledAction.actions[0].name).toBe("printnotelist");
                });
                it("THEN, the 2nd action's name is 'multiaction.edit'", () => {
                    expect(calledAction.actions[1].name).toBe("multiaction.edit");
                });
                it("THEN, the 3rd action's name is 'archive'", () => {
                    expect(calledAction.actions[2].name).toBe("archive");
                });
                it("THEN, the 4th action's name is 'unarchive'", () => {
                    expect(calledAction.actions[3].name).toBe("unarchive");
                });
                it("THEN, the 5th action's name is 'multiaction.copyto'", () => {
                    expect(calledAction.actions[4].name).toBe("multiaction.copyto");
                });
                it("THEN, the 6th action's name is 'multiaction.moveto'", () => {
                    expect(calledAction.actions[5].name).toBe("multiaction.moveto");
                });
                it("THEN, isMultiActions equals true ", () => {
                    expect(vm.isMultiActions).toBeTruthy();
                });
                it("THEN, the archive action is visible and enabled", () => {
                    let action = getActionByName("archive");
                    expect(action.isVisible).toBeTruthy();
                    expect(action.isEnabled).toBeTruthy();
                });
                it("THEN, the unarchive action is invisible and disabled", () => {
                    let action = getActionByName("unarchive");
                    expect(action.isVisible).toBeFalsy();
                    expect(action.isEnabled).toBeFalsy();
                });
            });
            describe("when filter = archived", () => {
                beforeEach(() => {
                    spyOn(vm.screenInfo.mainSearchInfo, "hasPredefinedFilterCriterion").and.callFake((args: any) => {
                        if (args === 'Archived') {
                            return true;
                        } else {
                            return false;
                        }
                    });
                    specHelper.general.spyProperty(ap.misc.ScreenInfo.prototype, "checkedEntitiesId", specHelper.PropertyAccessor.Get).and.returnValue(["2", "4"]);
                    vm.manageMultiActionsMode();
                });

                afterEach(() => {
                    specHelper.general.offSpyProperty(ap.misc.ScreenInfo.prototype, "checkedEntitiesId", specHelper.PropertyAccessor.Get);
                });
                it("THEN, MainController.gotoMultiActionsMode is called", () => {
                    expect(MainController.gotoMultiActionsMode).toHaveBeenCalled();
                });
                it("THEN, the 1st action's name is 'printnotelist'", () => {
                    expect(calledAction.actions[0].name).toBe("printnotelist");
                });
                it("THEN, the 2nd action's name is 'multiaction.edit'", () => {
                    expect(calledAction.actions[1].name).toBe("multiaction.edit");
                });
                it("THEN, the 3rd action's name is 'archive'", () => {
                    expect(calledAction.actions[2].name).toBe("archive");
                });
                it("THEN, the 4th action's name is 'unarchive'", () => {
                    expect(calledAction.actions[3].name).toBe("unarchive");
                });
                it("THEN, the 5th action's name is 'multiaction.copyto'", () => {
                    expect(calledAction.actions[4].name).toBe("multiaction.copyto");
                });
                it("THEN, the 6th action's name is 'multiaction.moveto'", () => {
                    expect(calledAction.actions[5].name).toBe("multiaction.moveto");
                });
                it("THEN, isMultiActions equals true ", () => {
                    expect(vm.isMultiActions).toBeTruthy();
                });
                it("THEN, the archive action is visible and enable", () => {
                    let action = getActionByName("archive");
                    expect(action.isVisible).toBeFalsy();
                    expect(action.isEnabled).toBeFalsy();
                });
                it("THEN, the unarchive action is visible and enable", () => {
                    let action = getActionByName("unarchive");
                    expect(action.isVisible).toBeTruthy();
                    expect(action.isEnabled).toBeTruthy();
                });
            });
            describe("when there is no filtre", () => {
                beforeEach(() => {
                    spyOn(vm.screenInfo.mainSearchInfo, "hasPredefinedFilterCriterion").and.callFake((args: any) => {
                        return false;
                    });
                    specHelper.general.spyProperty(ap.viewmodels.notes.NoteListViewModel.prototype, "archivedItemsCount", specHelper.PropertyAccessor.Get).and.returnValue(true);
                    specHelper.general.spyProperty(ap.viewmodels.notes.NoteListViewModel.prototype, "unarchivedItemsCount", specHelper.PropertyAccessor.Get).and.returnValue(false);

                    specHelper.general.spyProperty(ap.misc.ScreenInfo.prototype, "checkedEntitiesId", specHelper.PropertyAccessor.Get).and.returnValue(["2", "4"]);
                    vm.manageMultiActionsMode();
                });

                afterEach(() => {
                    specHelper.general.offSpyProperty(ap.misc.ScreenInfo.prototype, "checkedEntitiesId", specHelper.PropertyAccessor.Get);

                    specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteListViewModel.prototype, "archivedItemsCount", specHelper.PropertyAccessor.Get);
                    specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteListViewModel.prototype, "unarchivedItemsCount", specHelper.PropertyAccessor.Get);
                });
                it("THEN, MainController.gotoMultiActionsMode is called", () => {
                    expect(MainController.gotoMultiActionsMode).toHaveBeenCalled();
                });
                it("THEN, the 1st action's name is 'printnotelist'", () => {
                    expect(calledAction.actions[0].name).toBe("printnotelist");
                });
                it("THEN, the 2nd action's name is 'multiaction.edit'", () => {
                    expect(calledAction.actions[1].name).toBe("multiaction.edit");
                });
                it("THEN, the 3rd action's name is 'archive'", () => {
                    expect(calledAction.actions[2].name).toBe("archive");
                });
                it("THEN, the 4th action's name is 'unarchive'", () => {
                    expect(calledAction.actions[3].name).toBe("unarchive");
                });
                it("THEN, the 5th action's name is 'multiaction.copyto'", () => {
                    expect(calledAction.actions[4].name).toBe("multiaction.copyto");
                });
                it("THEN, the 6th action's name is 'multiaction.moveto'", () => {
                    expect(calledAction.actions[5].name).toBe("multiaction.moveto");
                });
                it("THEN, isMultiActions equals true ", () => {
                    expect(vm.isMultiActions).toBeTruthy();
                });
                it("THEN, the archive action is visible and enable", () => {
                    let action = getActionByName("archive");
                    expect(action.isVisible).toBeFalsy();
                    expect(action.isEnabled).toBeFalsy();
                });
                it("THEN, the unarchive action is visible and enable", () => {
                    let action = getActionByName("unarchive");
                    expect(action.isVisible).toBeTruthy();
                    expect(action.isEnabled).toBeTruthy();
                });
            });

            describe("WHEN a user has a MeetingManagement licence", () => {
                beforeEach(() => {
                    spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.returnValue(true);
                    specHelper.general.spyProperty(ap.misc.ScreenInfo.prototype, "checkedEntitiesId", specHelper.PropertyAccessor.Get).and.returnValue(["2", "4"]);
                    vm.manageMultiActionsMode();
                });

                afterEach(() => {
                    specHelper.general.offSpyProperty(ap.misc.ScreenInfo.prototype, "checkedEntitiesId", specHelper.PropertyAccessor.Get);
                });
                it("THEN, the 4th action name is 'multiaction.copyto'", () => {
                    expect(calledAction.actions[4].name).toBe("multiaction.copyto");
                });
                it("THEN, the 5th action name is 'multiaction.moveto'", () => {
                    expect(calledAction.actions[5].name).toBe("multiaction.moveto");
                });
                it("THEN, the 'multiaction.copyto' action is visible and enabled", () => {
                    let action = getActionByName("multiaction.copyto");
                    expect(action.isVisible).toBeTruthy();
                    expect(action.isEnabled).toBeTruthy();
                });
                it("THEN, the 'multiaction.moveto' action is visible and enabled", () => {
                    let action = getActionByName("multiaction.moveto");
                    expect(action.isVisible).toBeTruthy();
                    expect(action.isEnabled).toBeTruthy();
                });
            });

            describe("WHEN a user doesn't have a MeetingManagement licence", () => {
                beforeEach(() => {
                    Utility.UserContext.licenseAccess.AccessModules = [];
                    specHelper.general.spyProperty(ap.misc.ScreenInfo.prototype, "checkedEntitiesId", specHelper.PropertyAccessor.Get).and.returnValue(["2", "4"]);
                    vm.manageMultiActionsMode();
                });

                afterEach(() => {
                    specHelper.general.offSpyProperty(ap.misc.ScreenInfo.prototype, "checkedEntitiesId", specHelper.PropertyAccessor.Get);
                });
                it("THEN, the 4th action name is 'multiaction.copyto'", () => {
                    expect(calledAction.actions[4].name).toBe("multiaction.copyto");
                });
                it("THEN, the 5th action name is 'multiaction.moveto'", () => {
                    expect(calledAction.actions[5].name).toBe("multiaction.moveto");
                });
                it("THEN, the 'multiaction.copyto' action is not visible and disabled", () => {
                    let action = getActionByName("multiaction.copyto");
                    expect(action.isVisible).toBeFalsy();
                    expect(action.isEnabled).toBeFalsy();
                });
                it("THEN, the 'multiaction.moveto' action is not visible and disabled", () => {
                    let action = getActionByName("multiaction.moveto");
                    expect(action.isVisible).toBeFalsy();
                    expect(action.isEnabled).toBeFalsy();
                });
            });
        });

        describe("when invoke gotoMultiActions with false", () => {
            beforeEach(() => {
                let idsChecked = ["1", "2", "3"];
                spyOn(vm.listVm, "getCheckedIds").and.returnValue(idsChecked);
                spyOn(vm.listVm, "getCheckedItems").and.returnValue([{ Id: "1" }, { Id: "2" }, { Id: "3" }]);
                vm.listVm.listidsChecked = idsChecked;
                spyOn(MainController, "gotoMultiActionsMode");
                mainFlowStateSpy.and.returnValue(ap.controllers.MainFlow.Documents);
                specHelper.general.spyProperty(ap.misc.ScreenInfo.prototype, "checkedEntitiesId", specHelper.PropertyAccessor.Get).and.returnValue(["2", "4"]);
                vm.manageMultiActionsMode();
            });

            afterEach(() => {
                specHelper.general.offSpyProperty(ap.misc.ScreenInfo.prototype, "checkedEntitiesId", specHelper.PropertyAccessor.Get);
            });
            it("THEN, MainController.gotoMultiActionsMode is NOT called", () => {
                expect(MainController.gotoMultiActionsMode).not.toHaveBeenCalled();
            });
            it("THEN, isMultiActions equals true ", () => {
                expect(vm.isMultiActions).toBeTruthy();
            });
        });

        describe("WHEN itemCheked Changed", () => {
            let dummyChekedItems = [{
                originalEntity: {
                    Id: "1"
                }
            }];
            beforeEach(() => {
                let idsChecked = ["1"];
                spyOn(vm.listVm, "getCheckedIds").and.returnValue(idsChecked);
                spyOn(vm.listVm, "getCheckedItems").and.returnValue(dummyChekedItems);
                vm.listVm.listidsChecked = idsChecked;
                specHelper.general.raiseEvent(vm.listVm, "isCheckedChanged", null);
            });
            it("THEN, itemsChecked of multiaction equals to checked items number when this number changed", () => {
                expect(vm.multiActionsViewModel.itemsChecked.length).toEqual(dummyChekedItems.length);
            });
        });

        describe("WHEN invoke print action from multiactions mode", () => {
            let callbackPrint: jasmine.Spy;
            let printDefer: angular.IDeferred<any>;
            beforeEach(() => {
                spyOn(vm.listVm, "getCheckedIds").and.returnValue([]);
                vm.listVm.listidsChecked = [];
                mainFlowStateSpy.and.returnValue(ap.controllers.MainFlow.Points);
                spyOn(MainController, "closeMultiActionsMode")
                spyOn(vm, "printReport").and.callThrough();
                specHelper.general.raiseEvent(vm.multiActionsViewModel, "actionClicked", "printnotelist");
            });
            it("THEN, printReport method is called", () => {
                expect(vm.printReport).toHaveBeenCalled();
            });
        });

        describe("WHEN the multiactionclose of mainController is requested in multiactions mode", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.misc.ScreenInfo.prototype, "checkedEntitiesId", specHelper.PropertyAccessor.Get).and.returnValue(["2", "4"]);
                let idsChecked = ["2", "4"];
                spyOn(vm.listVm, "getCheckedIds").and.returnValue(idsChecked);
                vm.listVm.listidsChecked = idsChecked;
                vm.manageMultiActionsMode();
                spyOn(vm.listVm, "closeMultiActionMode");
                specHelper.general.raiseEvent(MainController, "multiactioncloserequested", undefined);
            });

            afterEach(() => {
                specHelper.general.offSpyProperty(ap.misc.ScreenInfo.prototype, "checkedEntitiesId", specHelper.PropertyAccessor.Get);
            });
            
            it("THEN, closeMultiActionMode is called to close the multi actions mode", () => {
                expect(vm.listVm.closeMultiActionMode).toHaveBeenCalled();
            });
        });
    });

    describe("Feature multiactionClick", () => {
        let def;
        let result: ap.models.multiactions.NoteMultiActionsResult;

        beforeEach(() => {
            def = $q.defer();
            specHelper.mainController.stub(MainController, Utility);
            vm = new ap.viewmodels.notes.NoteListViewModel($scope, Utility, Api, ControllersManager, $q, ServicesManager, $timeout, $mdDialog);
            spyOn(vm.listVm, "getCheckedItems").and.returnValue([{ originalId: "1" }, { originalId: "2" }]);
            vm.listVm.listidsChecked = ["1", "2"];
            spyOn(vm, "openMultiActionResultDialog");
            spyOn(ControllersManager.mainController, "showToast").and.returnValue($q.defer().promise);
        });

        describe("WHEN actionClicked is called with archive", () => {
            beforeEach(() => {
                spyOn(ControllersManager.noteController, "multiArchiveNote").and.returnValue(def.promise);
                specHelper.general.raiseEvent(vm.multiActionsViewModel, "actionClicked", "archive");
            });
            describe("WHEN there is no errors", () => {
                beforeEach(() => {
                    result = new ap.models.multiactions.NoteMultiActionsResult(Utility, [], []);
                    def.resolve(result);
                    $rootScope.$apply();
                });
                it("THEN the popup is no shown", () => {
                    expect(vm.openMultiActionResultDialog).not.toHaveBeenCalled();
                });
            });
            describe("WHEN there are some errors", () => {
                beforeEach(() => {
                    result = new ap.models.multiactions.NoteMultiActionsResult(Utility, [], [new ap.models.multiactions.NotAppliedActionDescription()]);
                    def.resolve(result);
                    $rootScope.$apply();
                });
                it("THEN the popup is shown", () => {
                    expect(vm.openMultiActionResultDialog).toHaveBeenCalled();
                });
            });
        });

        describe("WHEN actionClicked is called with unarchive", () => {
            beforeEach(() => {
                spyOn(ControllersManager.noteController, "multiUnarchiveNote").and.returnValue(def.promise);
                specHelper.general.raiseEvent(vm.multiActionsViewModel, "actionClicked", "unarchive");
            });
            describe("WHEN there is no errors", () => {
                beforeEach(() => {
                    result = new ap.models.multiactions.NoteMultiActionsResult(Utility, [], []);
                    def.resolve(result);
                    $rootScope.$apply();
                });
                it("THEN the popup is no shown", () => {
                    expect(vm.openMultiActionResultDialog).not.toHaveBeenCalled();
                });
            });
            describe("WHEN there are some errors", () => {
                beforeEach(() => {
                    result = new ap.models.multiactions.NoteMultiActionsResult(Utility, [], [new ap.models.multiactions.NotAppliedActionDescription()]);
                    def.resolve(result);
                    $rootScope.$apply();
                });
                it("THEN the popup is shown", () => {
                    expect(vm.openMultiActionResultDialog).toHaveBeenCalled();
                });
            });
        });

        describe("WHEN actionClicked is called with 'multiaction.moveto'", () => {
            let selectedMeetingVm: ap.viewmodels.meetings.MeetingItemViewModel;

            beforeEach(() => {
                let meeting = new ap.models.meetings.Meeting(Utility);
                meeting.createByJson({ Id: "test-meeting-id", Title: "Test meeting title" });

                selectedMeetingVm = new ap.viewmodels.meetings.MeetingItemViewModel(Utility, $q);
                selectedMeetingVm.init(meeting);

                spyOn(vm, "openMeetingSelectorDialog").and.returnValue($q.resolve(selectedMeetingVm));
                spyOn(vm, "refresh").and.stub();
                spyOn(ControllersManager.noteController, "moveToMultiAction").and.returnValue(def.promise);

                specHelper.general.raiseEvent(vm.multiActionsViewModel, "actionClicked", "multiaction.moveto");
                $rootScope.$digest();
            });

            it("THEN the meeting selection dialog is shown", () => {
                expect(vm.openMeetingSelectorDialog).toHaveBeenCalled();
            });

            it("THEN moveToMultiAction method of the NoteController is called with selected items and meeting", () => {
                expect(ControllersManager.noteController.moveToMultiAction).toHaveBeenCalledWith(["1", "2"], "test-meeting-id");
            });

            describe("WHEN there is no errors", () => {
                beforeEach(() => {
                    result = new ap.models.multiactions.NoteMultiActionsResult(Utility, [], []);
                    def.resolve(result);
                    $rootScope.$digest();
                });

                it("THEN the current list is refreshed", () => {
                    expect(vm.refresh).toHaveBeenCalled();
                });

                it("THEN the toast message about success is shown", () => {
                    expect(ControllersManager.mainController.showToast).toHaveBeenCalledWith("app.multi_move.success", null, "View", ["Test meeting title"]);
                });

                it("THEN the error popup is not shown", () => {
                    expect(vm.openMultiActionResultDialog).not.toHaveBeenCalled();
                });
            });

            describe("WHEN there are some errors", () => {
                beforeEach(() => {
                    result = new ap.models.multiactions.NoteMultiActionsResult(Utility, [], [new ap.models.multiactions.NotAppliedActionDescription()]);
                    def.resolve(result);
                    $rootScope.$digest();
                });

                it("THEN the error popup is shown", () => {
                    expect(vm.openMultiActionResultDialog).toHaveBeenCalled();
                });
            });
        });
    });

    describe("Feature: openMultiActionResultDialog method", () => {
        let result: ap.models.multiactions.NoteMultiActionsResult;
        beforeEach(() => {
            specHelper.mainController.stub(MainController, Utility);
            vm = new ap.viewmodels.notes.NoteListViewModel($scope, Utility, Api, ControllersManager, $q, ServicesManager, $timeout, $mdDialog);
        });
        describe("WHEN, call openMeetingSelectorDialog method", () => {
            let showSpy: jasmine.Spy;
            let listPopupScope: any;
            let openDefer: angular.IDeferred<any>;
            beforeEach(() => {
                showSpy = <jasmine.Spy>$mdDialog.show;
                openDefer = $q.defer();
                showSpy.and.callFake(function (printScope: any) {
                    listPopupScope = printScope;
                    return openDefer.promise;
                });
                result = new ap.models.multiactions.NoteMultiActionsResult(Utility);
                vm.openMultiActionResultDialog(result);

            });
            it("THEN, the dialog is showed", () => {
                expect(showSpy).toHaveBeenCalled();
            });
            it("THEN, the listPopupScope.templateUrl='me/PartialView?module=MultiActions&name=MultiActionsResultDialog'", () => {
                expect(listPopupScope.templateUrl).toEqual("me/PartialView?module=MultiActions&name=MultiActionsResultDialog");
            });
            it("THEN, the listPopupScope.clickOutsideToClose=false", () => {
                expect(listPopupScope.clickOutsideToClose).toBeFalsy();
            });
            it("THEN, the listPopupScope.preserveScope=true", () => {
                expect(listPopupScope.preserveScope).toBeTruthy()
            });
            it("THEN, the listPopupScope.fullscreen=true", () => {
                expect(listPopupScope.fullscreen).toBeTruthy()
            });
        });
    });

    describe("Feature: openMeetingSelectorDialog method", () => {
        var meetingAccessRights;
        var defAccessRight;
        let deferIds, deferData, apiIds: any[];
        beforeEach(() => {

            meetingAccessRights = [{ Id: "M1", ModuleName: "Meeting", Level: ap.models.accessRights.AccessRightLevel.Admin, CanAddPoint: true }
                , { Id: "M2", ModuleName: "Meeting", Level: ap.models.accessRights.AccessRightLevel.Manager, CanAddPoint: true }
                , { Id: "M3", ModuleName: "Meeting", Level: ap.models.accessRights.AccessRightLevel.Contributor }
                , { Id: "M4", ModuleName: "Meeting", Level: ap.models.accessRights.AccessRightLevel.Guest }
                , { Id: "M5", ModuleName: "Meeting", Level: ap.models.accessRights.AccessRightLevel.Subcontractor }
            ];
            deferIds = $q.defer();
            deferData = $q.defer();
            apiIds = ["455620", "445541", "445125"];
            spyOn(Api, "getEntityIds").and.returnValue(deferIds.promise);
            spyOn(Api, "getEntityList").and.returnValue(deferData.promise);
            defAccessRight = $q.defer();
            spyOn(AccessRightController, "geAccessRights").and.returnValue(defAccessRight.promise);
            defAccessRight.resolve(meetingAccessRights);
            specHelper.mainController.stub(MainController, Utility);
            spyOn(ap.viewmodels.identificationfiles.languages.LanguageListViewModel.prototype, "selectByCode");
            vm = new ap.viewmodels.notes.NoteListViewModel($scope, Utility, Api, ControllersManager, $q, ServicesManager, $timeout, $mdDialog);
        });
        describe("WHEN, call openMeetingSelectorDialog method", () => {
            let showSpy: jasmine.Spy;
            let listPopupScope: any;
            let openDefer: angular.IDeferred<any>;
            beforeEach(() => {
                showSpy = <jasmine.Spy>$mdDialog.show;
                openDefer = $q.defer();
                showSpy.and.callFake(function (printScope: any) {
                    listPopupScope = printScope;
                    return openDefer.promise;
                });
                spyOn(MainController, "showBusy").and.stub();
                spyOn(MainController, "hideBusy").and.stub();
                let apiData = [
                    {
                        Id: apiIds[0],
                        Code: "Code 0",
                        Title: "T0"
                    },
                    {
                        Id: apiIds[1],
                        Code: "Code 1",
                        Title: "T1"
                    },
                    {
                        Id: apiIds[2],
                        Code: "Code 2",
                        Title: "T2"
                    }
                ];
                vm.openMeetingSelectorDialog();
                deferIds.resolve(new ap.services.apiHelper.ApiResponse(apiIds));
                $rootScope.$apply();

                deferData.resolve(new ap.services.apiHelper.ApiResponse(apiData));
                $rootScope.$apply();

            });
            it("THEN, the dialog is showed", () => {
                expect(showSpy).toHaveBeenCalled();
            });
            it("THEN, the listPopupScope.templateUrl='me/ PartialView ? module = Meeting & name=MeetingSelectionDialog'", () => {
                expect(listPopupScope.templateUrl).toEqual("me/PartialView?module=Meeting&name=MeetingSelectionDialog");
            });
            it("THEN, the listPopupScope.clickOutsideToClose=false", () => {
                expect(listPopupScope.clickOutsideToClose).toBeFalsy();
            });
            it("THEN, the listPopupScope.preserveScope=true", () => {
                expect(listPopupScope.preserveScope).toBeTruthy()
            });
            it("THEN, the listPopupScope.fullscreen=true", () => {
                expect(listPopupScope.fullscreen).toBeTruthy()
            });
            it("THEN, the loading animation is shown", () => {
                expect(MainController.showBusy).toHaveBeenCalled();
            });
            it("THEN, the loading animation is hidden when a popup is displayed", () => {
                listPopupScope.onComplete();
                expect(MainController.hideBusy).toHaveBeenCalled();
            });
        });
    });

    xdescribe("Feature: printReport method", () => {
        beforeEach(() => {
            specHelper.mainController.stub(MainController, Utility);
            spyOn(ap.viewmodels.notes.NoteListViewModel.prototype, "refresh");
            spyOn(ap.viewmodels.reports.ReportTemplateListViewModel.prototype, "load");
            spyOn(ap.viewmodels.identificationfiles.languages.LanguageListViewModel.prototype, "selectByCode");
            vm = new ap.viewmodels.notes.NoteListViewModel($scope, Utility, Api, ControllersManager, $q, ServicesManager, $timeout, $mdDialog);
        });
        describe("WHEN, call printReport method", () => {
            let showSpy: jasmine.Spy;
            let printParam: any;
            let printDefer: angular.IDeferred<any>;
            beforeEach(() => {
                showSpy = <jasmine.Spy>$mdDialog.show;
                printDefer = $q.defer();
                showSpy.and.callFake(function (printScope: any) {
                    printParam = printScope;
                    return printDefer.promise;
                });
                spyOn(MainController, "showBusy").and.stub();
                spyOn(MainController, "hideBusy").and.stub();
                vm.printReport();
            });
            it("THEN, the dialog is showed", () => {
                expect(showSpy).toHaveBeenCalled();
            });
            it("THEN, the printParam.templateUrl='me/ PartialView ? module = Report & name=PointReportDialog'", () => {
                expect(printParam.templateUrl).toEqual("me/PartialView?module=Report&name=PointReportDialog");
            });
            it("THEN, the printParam.clickOutsideToClose=false", () => {
                expect(printParam.clickOutsideToClose).toBeFalsy();
            });
            it("THEN, the printParam.preserveScope=true", () => {
                expect(printParam.preserveScope).toBeTruthy()
            });
            it("THEN, the printParam.fullscreen=true", () => {
                expect(printParam.fullscreen).toBeTruthy()
            });
            it("THEN, the loading animation is shown", () => {
                expect(MainController.showBusy).toHaveBeenCalled();
            });
            it("THEN, the loading animation is hidden when a popup is displayed", () => {
                printParam.onComplete();
                expect(MainController.hideBusy).toHaveBeenCalled();
            });
        });

        describe("WHEN, call printReport method and the dialog resolved 'Generated'", () => {
            let showSpy: jasmine.Spy;
            let printParam: any;
            let printDefer: angular.IDeferred<any>;
            beforeEach(() => {
                spyOn(vm.listVm, "printReport").and.returnValue(_deferred.promise);
                showSpy = <jasmine.Spy>$mdDialog.show;
                printDefer = $q.defer();
                showSpy.and.returnValue(printDefer.promise);

                vm.printReport();
                printDefer.resolve(ap.viewmodels.reports.ReportGeneratorResponse.Generate);
                $rootScope.$apply();
            });
            it("THEN, listVm.printReport is called with 'Generate'", () => {
                expect(vm.listVm.printReport).toHaveBeenCalledWith(vm.reportGeneratorViewModel, ap.viewmodels.reports.ReportGeneratorResponse.Generate);
            });

        });

        describe("WHEN, call printReport method and the dialog resolved 'Send'", () => {
            let showSpy: jasmine.Spy;
            let printParam: any;
            let printDefer: angular.IDeferred<any>;
            beforeEach(() => {
                spyOn(vm.listVm, "printReport").and.returnValue(_deferred.promise);
                showSpy = <jasmine.Spy>$mdDialog.show;
                printDefer = $q.defer();
                showSpy.and.returnValue(printDefer.promise);

                vm.printReport();
                printDefer.resolve(ap.viewmodels.reports.ReportGeneratorResponse.Send);
                $rootScope.$apply();
            });
            it("THEN, listVm.printReport is called with 'Send'", () => {
                expect(vm.listVm.printReport).toHaveBeenCalledWith(vm.reportGeneratorViewModel, ap.viewmodels.reports.ReportGeneratorResponse.Send);
            });

        });
        describe("WHEN, call printReport method and the event 'previewrequested' was fired", () => {
            let showSpy: jasmine.Spy;
            let printParam: any;
            let printDefer: angular.IDeferred<any>;

            beforeEach(() => {
                showSpy = <jasmine.Spy>$mdDialog.show;
                printDefer = $q.defer();
                showSpy.and.callFake(function (printScope: any) {
                    printParam = printScope;
                    return printDefer.promise;
                });
                spyOn(vm.listVm, "printReport").and.returnValue(_deferred.promise);
                vm.printReport();
                specHelper.general.raiseEvent(vm.reportGeneratorViewModel, "previewrequested", vm.reportGeneratorViewModel);
                $rootScope.$apply();

            });
            it("THEN, listVm.printReport is called with preview = true", () => {
                expect(vm.listVm.printReport).toHaveBeenCalledWith(vm.reportGeneratorViewModel, ap.viewmodels.reports.ReportGeneratorResponse.Preview);
            });

        });

        describe("WHEN, call printReport method and the event 'downloadexcelrequested' was fired", () => {
            let showSpy: jasmine.Spy;
            let printParam: any;
            let printDefer: angular.IDeferred<any>;

            beforeEach(() => {
                showSpy = <jasmine.Spy>$mdDialog.show;
                printDefer = $q.defer();
                showSpy.and.callFake(function (printScope: any) {
                    printParam = printScope;
                    return printDefer.promise;
                });
                spyOn(ReportController, "exportExcel").and.returnValue(_deferred.promise);
                vm.printReport();
                specHelper.general.raiseEvent(vm.reportGeneratorViewModel, "downloadexcelrequested", vm.reportGeneratorViewModel);
                $rootScope.$apply();

            });
            it("THEN, listVm.exportExcel is called with the reportGeneratorViewModel", () => {
                expect(ReportController.exportExcel).toHaveBeenCalledWith(vm.reportGeneratorViewModel);
            });

        });
        describe("WHEN, call printReport method and the event 'downloadoriginalplansrequested' was fired", () => {
            let showSpy: jasmine.Spy;
            let printParam: any;
            let printDefer: angular.IDeferred<any>;

            beforeEach(() => {
                showSpy = <jasmine.Spy>$mdDialog.show;
                printDefer = $q.defer();
                showSpy.and.callFake(function (printScope: any) {
                    printParam = printScope;
                    return printDefer.promise;
                });
                spyOn(ReportController, "exportMeetingOriginalPlans").and.returnValue(_deferred.promise);
                vm.printReport();
                specHelper.general.raiseEvent(vm.reportGeneratorViewModel, "downloadoriginalplansrequested", vm.reportGeneratorViewModel);
                $rootScope.$apply();

            });
            it("THEN, listVm.exportExcel is called with the reportGeneratorViewModel", () => {
                expect(ReportController.exportMeetingOriginalPlans).toHaveBeenCalledWith(vm.reportGeneratorViewModel);
            });
        });
    });

    describe("Feature: filter on the current meeting", () => {
        describe("WHEN a meeting is selected", () => {
            let meeting: ap.models.meetings.Meeting;
            let project: ap.models.projects.Project;
            beforeEach(() => {
                project = new ap.models.projects.Project(this.Utility);
                spyOn(MainController, "currentProject").and.returnValue(project);
                meeting = new ap.models.meetings.Meeting(Utility);
                specHelper.general.spyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get).and.returnValue(meeting);
                vm = new ap.viewmodels.notes.NoteListViewModel($scope, Utility, Api, ControllersManager, $q, ServicesManager, $timeout, $mdDialog);
                vm.loadData();
            });
            beforeEach(() => {
                specHelper.general.offSpyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get);
            });

            it("THEN, the list is filtered to retreive only the notes of the meeting", () => {
                expect(vm.listVm.getParam("meetingid").value).toEqual(meeting.Id);
            });
        });
    });

    describe("Feature: selectEntity", () => {
        let noteItemVm: ap.viewmodels.notes.NoteItemViewModel;
        let note: ap.models.notes.Note;

        beforeEach(() => {
            spyOn(ap.viewmodels.notes.NoteListViewModel.prototype, "refresh");
            spyOn(Api, "getApiResponse").and.callFake(function (url, method) {
                if (url.indexOf("rest/usercommentsids") === 0 && method === ap.services.apiHelper.MethodType.Get)
                    return $q.defer().promise;
                return null;
            });

            spyOn(Api, "getApiResponseStatList").and.callFake(() => $q.defer().promise);
            specHelper.mainController.stub(MainController, Utility);
            spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue($q.when());

            noteItemVm = new ap.viewmodels.notes.NoteItemViewModel(Utility, $q, null, new ap.viewmodels.notes.UserCommentItemConstructorParameter(undefined, undefined, undefined, undefined, Utility, ControllersManager));
            note = new ap.models.notes.Note(Utility);
            note.createByJson({
                Id: '123'
            });

            noteItemVm.init(note);

            vm = new ap.viewmodels.notes.NoteListViewModel($scope, Utility, Api, ControllersManager, $q, ServicesManager, $timeout, $mdDialog);
            vm.loadData();
        });

        describe("WHEN a selectEntity called with bad params", () => {
            it("THEN, selectEntity should return false", () => {
                expect(vm.selectEntity(null)).toBeFalsy();
            });
        });

        describe("WHEN a selectEntity called with specified entity", () => {
            let isSelected: boolean;
            let originalEntity: ap.models.notes.Note;
            describe("AND entity.originalentity.id != createEmptyGuid", () => {
                beforeEach(() => {
                    spyOn(vm.listVm, "selectEntity");
                    originalEntity = new ap.models.notes.Note(Utility);
                    noteItemVm.init(<ap.models.Entity>originalEntity);
                    isSelected = vm.selectEntity(noteItemVm);
                });

                it("THEN, selectEntity should return true", () => {
                    expect(isSelected).toBeTruthy();
                });

                it("THEN, listvm.selectEntity should be called", () => {
                    expect(vm.listVm.selectEntity).toHaveBeenCalledWith(originalEntity.Id);
                });
            });

            describe("AND entity.originalentity.id = createEmptyGuid", () => {
                beforeEach(() => {
                    note.createByJson({ Id: ap.utility.UtilityHelper.createEmptyGuid() })

                    spyOn(vm.listVm, "selectEntity");
                    isSelected = vm.selectEntity(noteItemVm);
                });

                it("THEN, selectEntity should return false", () => {
                    expect(isSelected).toBeFalsy();
                    expect(vm.listVm.selectEntity).not.toHaveBeenCalled();
                });
            });
        });
    });

    describe("Feature: computeActionsAccess", () => {
        let defStat: angular.IDeferred<ap.services.apiHelper.ApiResponse>;
        beforeEach(() => {
            defStat = $q.defer();
            spyOn(Api, "getApiResponse").and.callFake(function (url, method) {
                if (url.indexOf("rest/usercommentsids") === 0 && method === ap.services.apiHelper.MethodType.Get)
                    return _deferred.promise;
                return null;
            });
            spyOn(Api, "getApiResponseStatList").and.callFake(function (url, method) {
                return defStat.promise;
            });
            specHelper.mainController.stub(MainController, Utility);
        });

        describe("WHEN the vm is init and current meeting is null", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.viewmodels.GenericPagedListViewModels.prototype, "ids", specHelper.PropertyAccessor.Get).and.returnValue(["1", "2", "3"]);
                vm = new ap.viewmodels.notes.NoteListViewModel($scope, Utility, Api, ControllersManager, $q, ServicesManager, $timeout, $mdDialog);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.GenericPagedListViewModels.prototype, "ids", specHelper.PropertyAccessor.Get);
            });
            it("THEN, pointReportAccessRight.canGenerate is true", () => {
                expect(vm.pointReportAccessRight.canGenerate).toBeTruthy();
            });
            it("AND, print action is not visible", () => {
                let action = ap.viewmodels.home.ActionViewModel.getAction(vm.multiActionsViewModel.actions, "printnotelist");
                expect(action.isVisible).toBeTruthy();
            });
        });

        describe("WHEN the vm is init and current meeting is undefined", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.viewmodels.GenericPagedListViewModels.prototype, "ids", specHelper.PropertyAccessor.Get).and.returnValue(["1", "2", "3"]);

                specHelper.general.spyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get).and.returnValue(undefined);

                vm = new ap.viewmodels.notes.NoteListViewModel($scope, Utility, Api, ControllersManager, $q, ServicesManager, $timeout, $mdDialog);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.GenericPagedListViewModels.prototype, "ids", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get);
            });
            it("THEN, pointReportAccessRight.canGenerate is true", () => {
                expect(vm.pointReportAccessRight.canGenerate).toBeTruthy();
            });
            it("AND, print action is not visible", () => {
                let action = ap.viewmodels.home.ActionViewModel.getAction(vm.multiActionsViewModel.actions, "printnotelist");
                expect(action.isVisible).toBeFalsy();
            });
        });
        describe("WHEN the vm is init and current meeting is not null", () => {
            let meeting: ap.models.meetings.Meeting;
            let defGetMeetingAccessRight;

            beforeEach(() => {
                defGetMeetingAccessRight = $q.defer();
                meeting = new ap.models.meetings.Meeting(Utility);
                meeting.createByJson({ Id: "M1" });
                meeting.Title = "myMeeting";
                specHelper.general.spyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get).and.returnValue(meeting);

                spyOn(AccessRightController, "getMeetingAccessRight").and.returnValue(defGetMeetingAccessRight.promise);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get);
            });

            it("THEN, AccessRightController.getMeetingAccessRight will be called", () => {
                vm = new ap.viewmodels.notes.NoteListViewModel($scope, Utility, Api, ControllersManager, $q, ServicesManager, $timeout, $mdDialog);
                expect(AccessRightController.getMeetingAccessRight).toHaveBeenCalledWith("M1");
            });

            it("AND pointReportAccessRight.canGenerate is true if the user have the right CanGenerateReport on the meeting", () => {
                let meetingAccessRight = new ap.models.accessRights.MeetingAccessRight(Utility);
                meetingAccessRight.CanGenerateReport = true;
                vm = new ap.viewmodels.notes.NoteListViewModel($scope, Utility, Api, ControllersManager, $q, ServicesManager, $timeout, $mdDialog);
                defGetMeetingAccessRight.resolve(meetingAccessRight);
                $rootScope.$apply();
                expect(vm.pointReportAccessRight.canGenerate).toBeTruthy();
                let action = ap.viewmodels.home.ActionViewModel.getAction(vm.multiActionsViewModel.actions, "printnotelist");
                expect(action.isVisible).toBeTruthy();
            });
            it("AND pointReportAccessRight.canGenerate is false if the user have not the right CanGenerateReport", () => {
                let meetingAccessRight = new ap.models.accessRights.MeetingAccessRight(Utility);
                meetingAccessRight.CanGenerateReport = false;
                vm = new ap.viewmodels.notes.NoteListViewModel($scope, Utility, Api, ControllersManager, $q, ServicesManager, $timeout, $mdDialog);
                defGetMeetingAccessRight.resolve(meetingAccessRight);
                $rootScope.$apply();
                expect(vm.pointReportAccessRight.canGenerate).toBeFalsy();
                let action = ap.viewmodels.home.ActionViewModel.getAction(vm.multiActionsViewModel.actions, "printnotelist");
                expect(action.isVisible).toBeFalsy();
            });
        });
    });

    describe("Feature: current note updated", () => {

        let note: ap.models.notes.Note;
        let updatedNote: ap.models.notes.Note;
        let noteItemVm: ap.viewmodels.notes.NoteItemViewModel;
        let oldActionVM: ap.viewmodels.notes.NoteActionsViewModel;
        beforeEach(() => {
            specHelper.mainController.stub(MainController, Utility);

            note = new ap.models.notes.Note(Utility);
            note.createByJson({
                Id: "n1"
            });

            let defStatus = $q.defer();
            spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue(defStatus.promise);

            noteItemVm = new ap.viewmodels.notes.NoteItemViewModel(Utility, $q, undefined, new ap.viewmodels.notes.UserCommentItemConstructorParameter(0, null, null, null, Utility, ControllersManager));
            noteItemVm.init(note);
            spyOn(noteItemVm.noteActionViewModel, "updateNote");
        });

        describe("WHEN the current note is updated", () => {

            beforeEach(() => {
                updatedNote = new ap.models.notes.Note(Utility);
                updatedNote.createByJson({
                    Id: "n1"
                });

                noteItemVm.init(updatedNote);
            });

            it("THEN noteActionsViewModel.updateNote is called", () => {
                expect(noteItemVm.noteActionViewModel.updateNote).toHaveBeenCalledWith(updatedNote);
            });
        });

        describe("WHEN VM is initialized with another note", () => {

            beforeEach(() => {
                oldActionVM = noteItemVm.noteActionViewModel;
                updatedNote = new ap.models.notes.Note(Utility);
                noteItemVm.init(updatedNote);
            });

            it("THEN noteItemVm has a new noteActionsViewModel", () => {
                expect(oldActionVM).not.toEqual(noteItemVm.noteActionViewModel);
            });
        });
    });

    describe("Feature: calculateSortOptions", () => {
        beforeEach(() => {
            spyOn(ap.viewmodels.notes.NoteListViewModel.prototype, "refresh");
            spyOn(Api, "getApiResponse").and.callFake(function (url, method) {
                if (url.indexOf("rest/usercommentsids") === 0 && method === ap.services.apiHelper.MethodType.Get)
                    return $q.defer().promise;
                return null;
            });

            spyOn(Api, "getApiResponseStatList").and.callFake(() => $q.defer().promise);
            specHelper.mainController.stub(MainController, Utility);

            vm = new ap.viewmodels.notes.NoteListViewModel($scope, Utility, Api, ControllersManager, $q, ServicesManager, $timeout, $mdDialog);
            vm.loadData();
        });

        describe("WHEN a calculateSortOptions called and groupView == Date and user has access to PanoramicView", () => {
            beforeEach(() => {
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake((moduleCode: string) => {
                    return moduleCode === ap.models.licensing.Module.Module_PanoramicView;
                });
                vm.groupView = "Status";
            });

            it("THEN the sorting mode should be MultiColumn", () => {
                expect(vm.sortState.Mode).toBe(ap.misc.sort.SortingMode.MultiColumn);
            });
        });

        describe("WHEN a calculateSortOptions called and groupView == Date and user don't has access to PanoramicView", () => {
            beforeEach(() => {
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake((moduleCode: string) => { return false; });
                vm.groupView = "Date";
            });

            it("THEN the sorting mode should be SingleColumn", () => {
                expect(vm.sortState.Mode).toBe(ap.misc.sort.SortingMode.SingleColumn);
            });
        });
    });


    describe("Feature: sortChangedHandler", () => {
        beforeEach(() => {
            spyOn(ap.viewmodels.notes.NoteListViewModel.prototype, "refresh");
            spyOn(Api, "getApiResponse").and.callFake(function (url, method) {
                if (url.indexOf("rest/usercommentsids") === 0 && method === ap.services.apiHelper.MethodType.Get)
                    return $q.defer().promise;
                return null;
            });

            spyOn(Api, "getApiResponseStatList").and.callFake(() => $q.defer().promise);
            specHelper.mainController.stub(MainController, Utility);

            vm = new ap.viewmodels.notes.NoteListViewModel($scope, Utility, Api, ControllersManager, $q, ServicesManager, $timeout, $mdDialog);
            vm.loadData();
        });

        describe("WHEN a call sortChangedHandler with good param", () => {
            beforeEach(() => {
                spyOn(vm.listVm, "removeCustomParam");
                spyOn(vm.listVm, "addCustomParam");
                vm.sortState.Status = ap.component.dataTable.SortType.Asc; // Triggers the "sortingchanged" event
            });

            it("THEN, 'sortdatas' should be removed from customparam", () => {
                expect(vm.listVm.removeCustomParam).toHaveBeenCalledWith("sortdatas");
            });

            it("THEN, addCustomParam should be called with 'sortdatas' and a string representation of the sorting state", () => {
                expect(vm.listVm.addCustomParam).toHaveBeenCalledWith("sortdatas", `[{"Property":"Status","IsAscending":true}]`);
            });

            it("THEN, vm.refresh should be called.", () => {
                expect(vm.refresh).toHaveBeenCalled();
            });
        });
    });

    describe("Feature: canChangeColOrder", () => {
        beforeEach(() => {
            specHelper.mainController.stub(MainController, Utility);
        });

        describe("WHEN user has access to Module_PanoramicView", () => {
            beforeEach(() => {
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake((moduleName: string) => true);
                vm = new ap.viewmodels.notes.NoteListViewModel($scope, Utility, Api, ControllersManager, $q, ServicesManager, $timeout, $mdDialog);
            });
            it("THEN canChangeColOrder should be true", () => {
                expect(vm.canChangeColOrder).toBe(true);
            });
        });

        describe("WHEN user doesn't have access to Module_PanoramicView", () => {
            beforeEach(() => {
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake((moduleName: string) => false);
                vm = new ap.viewmodels.notes.NoteListViewModel($scope, Utility, Api, ControllersManager, $q, ServicesManager, $timeout, $mdDialog);
            });

            it("THEN canChangeColOrder should be false", () => {
                expect(vm.canChangeColOrder).toBe(false);
            });
        });
    });

    describe("Feature: hasMeetingCol", () => {
        beforeEach(() => {
            specHelper.mainController.stub(MainController, Utility);
        });

        describe("WHEN 'Entire project' and user has the access to the module list", () => {
            beforeEach(() => {
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake((moduleName: string) => { return true });
                spyOn(MainController, "currentMeeting").and.returnValue(null);
                vm = new ap.viewmodels.notes.NoteListViewModel($scope, Utility, Api, ControllersManager, $q, ServicesManager, $timeout, $mdDialog);
            });

            it("THEN hasMeetingCol should be true", () => {
                expect(vm.hasMeetingCol).toBe(true);
            });
        });

        describe("WHEN 'Entire project' and user doesn't have access to the module list", () => {
            beforeEach(() => {
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake((moduleName: string) => { return false });
                spyOn(MainController, "currentMeeting").and.returnValue({});
                vm = new ap.viewmodels.notes.NoteListViewModel($scope, Utility, Api, ControllersManager, $q, ServicesManager, $timeout, $mdDialog);
            });

            it("THEN hasMeetingCol should be false", () => {
                expect(vm.hasMeetingCol).toBe(false);
            });
        });

        describe("WHEN no 'Entire project' and user has the access to the module list", () => {
            beforeEach(() => {
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake((moduleName: string) => { return false });
                spyOn(MainController, "currentMeeting").and.returnValue(null);
                vm = new ap.viewmodels.notes.NoteListViewModel($scope, Utility, Api, ControllersManager, $q, ServicesManager, $timeout, $mdDialog);
            });

            it("THEN hasMeetingCol should be false", () => {
                expect(vm.hasMeetingCol).toBe(false);
            });
        });
    });

    describe("Feature: advancedFilterListBuilder", () => {
        describe("WHEN, NoteListViewModel is created", () => {
            let filters: ap.misc.AdvancedFilter[];

            beforeEach(() => {
                let project = new ap.models.projects.Project(Utility);
                project.createByJson({ Id: "test-project-id" });
                spyOn(ControllersManager.mainController, "currentProject").and.returnValue(project)
            });
            beforeEach(() => {
                vm = new ap.viewmodels.notes.NoteListViewModel($scope, Utility, Api, ControllersManager, $q, ServicesManager, $timeout, $mdDialog);
            });

            it("THEN, AdvancedFilter for property Status is created with StatusAdvancedFilterList", () => {
                expect(vm.screenInfo.mainSearchInfo.propertiesFilters[1].advancedFilterListBuilder instanceof ap.viewmodels.notes.filters.StatusAdvancedFilterList).toBeTruthy();
            });
            it("THEN, AdvancedFilter for property Category is created with IssueTypeAdvancedFilterList", () => {
                expect(vm.screenInfo.mainSearchInfo.propertiesFilters[3].advancedFilterListBuilder instanceof ap.viewmodels.notes.filters.IssueTypeAdvancedFilterList).toBeTruthy();
            });
            it("THEN, AdvancedFilter for property List is created with ListAdvancedFilterList", () => {
                expect(vm.screenInfo.mainSearchInfo.propertiesFilters[8].advancedFilterListBuilder instanceof ap.viewmodels.notes.filters.ListAdvancedFilterList).toBeTruthy();
            });
            it("THEN, AdvancedFilter for property Room is created with RoomAdvancedFilterList", () => {
                expect(vm.screenInfo.mainSearchInfo.propertiesFilters[11].advancedFilterListBuilder instanceof ap.viewmodels.notes.filters.RoomAdvancedFilterList).toBeTruthy();
            });
            it("THEN, AdvancedFilter for property NoteInCharge.Tag is created with InChargeAdvancedFilterList", () => {
                expect(vm.screenInfo.mainSearchInfo.propertiesFilters[9].advancedFilterListBuilder instanceof ap.viewmodels.notes.filters.ContactAdvancedFilterList).toBeTruthy();
            });

            it("THEN 14 filters are defined for the list", () => {
                expect(vm.screenInfo.mainSearchInfo.propertiesFilters.length).toBe(14);
            });

            it("THEN Category, InCharge, Room and DueDate can be filtered on isNull", () => {
                expect(vm.screenInfo.mainSearchInfo.propertiesFilters[3].hasIsNullOperator).toBeTruthy();
                expect(vm.screenInfo.mainSearchInfo.propertiesFilters[9].hasIsNullOperator).toBeTruthy();
                expect(vm.screenInfo.mainSearchInfo.propertiesFilters[10].hasIsNullOperator).toBeTruthy();
                expect(vm.screenInfo.mainSearchInfo.propertiesFilters[11].hasIsNullOperator).toBeTruthy();
            });
            it("THEN CodeNum is a number filter", () => {
                expect(vm.screenInfo.mainSearchInfo.propertiesFilters[2].isNumberFilter).toBeTruthy();
            });

            it("THEN, Some properties have a string property type", () => {
                expect(vm.screenInfo.mainSearchInfo.propertiesFilters[1].property.propertyType).toBe(0);
                expect(vm.screenInfo.mainSearchInfo.propertiesFilters[2].property.propertyType).toBe(0);
                expect(vm.screenInfo.mainSearchInfo.propertiesFilters[3].property.propertyType).toBe(0);
                expect(vm.screenInfo.mainSearchInfo.propertiesFilters[4].property.propertyType).toBe(0);
                expect(vm.screenInfo.mainSearchInfo.propertiesFilters[5].property.propertyType).toBe(0);
                expect(vm.screenInfo.mainSearchInfo.propertiesFilters[8].property.propertyType).toBe(0);
                expect(vm.screenInfo.mainSearchInfo.propertiesFilters[9].property.propertyType).toBe(0);
                expect(vm.screenInfo.mainSearchInfo.propertiesFilters[11].property.propertyType).toBe(0);
                expect(vm.screenInfo.mainSearchInfo.propertiesFilters[12].property.propertyType).toBe(0);
            });

            it("THEN, some properties have a date property type", () => {
                expect(vm.screenInfo.mainSearchInfo.propertiesFilters[6].property.propertyType).toBe(ap.misc.PropertyType.Date);
                expect(vm.screenInfo.mainSearchInfo.propertiesFilters[7].property.propertyType).toBe(ap.misc.PropertyType.Date);
                expect(vm.screenInfo.mainSearchInfo.propertiesFilters[10].property.propertyType).toBe(ap.misc.PropertyType.Date);
            });

            it("THEN, some properties have a boolean property type", () => {
                expect(vm.screenInfo.mainSearchInfo.propertiesFilters[13].property.propertyType).toBe(ap.misc.PropertyType.Boolean);
            });
        });
    });
    describe("Feature: copyTo", () => {
        describe("WHEN, copy to action clicked, open the List selection popup with true", () => {
            describe("WHEN, selection popup created callback", () => {
                let meetingAccessRights;
                let defAccessRight;
                let deferIds, deferData, apiIds: any[];
                let openDefer: angular.IDeferred<ap.viewmodels.meetings.MeetingItemViewModel>;
                let copyToDef: angular.IDeferred<ap.models.multiactions.NoteMultiActionsResult>;
                let mivm: ap.viewmodels.meetings.MeetingItemViewModel;
                let meeting: ap.models.meetings.Meeting;
                let apiData: any[];
                beforeEach(() => {
                    meetingAccessRights = [{ Id: "M1", ModuleName: "Meeting", Level: ap.models.accessRights.AccessRightLevel.Admin, CanAddPoint: true }
                        , { Id: "M2", ModuleName: "Meeting", Level: ap.models.accessRights.AccessRightLevel.Manager, CanAddPoint: true }
                        , { Id: "M3", ModuleName: "Meeting", Level: ap.models.accessRights.AccessRightLevel.Contributor }
                        , { Id: "M4", ModuleName: "Meeting", Level: ap.models.accessRights.AccessRightLevel.Guest }
                        , { Id: "M5", ModuleName: "Meeting", Level: ap.models.accessRights.AccessRightLevel.Subcontractor }
                    ];
                    deferIds = $q.defer();
                    deferData = $q.defer();
                    apiIds = ["455620", "445541", "445125"];
                    spyOn(Api, "getEntityIds").and.returnValue(deferIds.promise);
                    spyOn(Api, "getEntityList").and.returnValue(deferData.promise);
                    defAccessRight = $q.defer();
                    spyOn(AccessRightController, "geAccessRights").and.returnValue(defAccessRight.promise);
                    defAccessRight.resolve(meetingAccessRights);
                    specHelper.mainController.stub(MainController, Utility);
                    spyOn(ap.viewmodels.identificationfiles.languages.LanguageListViewModel.prototype, "selectByCode");
                    vm = new ap.viewmodels.notes.NoteListViewModel($scope, Utility, Api, ControllersManager, $q, ServicesManager, $timeout, $mdDialog);

                    openDefer = $q.defer();
                    copyToDef = $q.defer();
                    spyOn(vm, "openMeetingSelectorDialog").and.returnValue(openDefer.promise);
                    spyOn(MainController, "showToast").and.returnValue($q.defer().promise);

                    meeting = new ap.models.meetings.Meeting(Utility);
                    meeting.createByJson({
                        Id: "1",
                        Code: "MY",
                        Title: "My first meeting for the test",
                        Comment: "Comment",
                        Building: "Netika",
                        Floor: "11",
                        Header: "Here is header",
                        Footer: "Here is footer",
                        Remarks: "Some remarks",
                        Occurrence: 25,
                        Revision: 1,
                        IsPublic: false,
                        IsSystem: false,
                        IsArchived: false,
                        Date: '/Date(1442565731892)/',
                        Type: 1,
                        NumberingType: 1,
                        NotesNumber: 100,
                        TotalNotesNumber: 1000,
                        DocumentsNumber: 5,
                        ParticipantsNumber: 10,
                        MeetingAuthor: {
                            Id: "B9937389-990B-4CE6-8A61-EBB9C986223A"
                        },
                        UserAccessRight: {
                            ModuleName: "The module meeting"
                        }
                    });
                    meeting.UserAccessRight.CanCreateNextMeeting = true;

                    mivm = new ap.viewmodels.meetings.MeetingItemViewModel(Utility, $q);
                    mivm.init(meeting);

                    let copyToSpy = spyOn(NoteController, "copyTo");
                    copyToSpy.and.returnValue(copyToDef.promise);
                    apiData = [
                        {
                            Id: apiIds[0],
                            Code: "Code 0",
                            Title: "T0"
                        },
                        {
                            Id: apiIds[1],
                            Code: "Code 1",
                            Title: "T1"
                        },
                        {
                            Id: apiIds[2],
                            Code: "Code 2",
                            Title: "T2"
                        }
                    ];
                });
                describe("WHEN, NoteController.copyTo is called AND there is no error", () => {
                    beforeEach(() => {
                        let note = new ap.models.notes.Note(Utility);
                        note.createByJson({ Meeting: { Title: "title" } });

                        let result: ap.models.multiactions.NoteMultiActionsResult = new ap.models.multiactions.NoteMultiActionsResult(Utility, [note], []);

                        specHelper.general.raiseEvent(vm.multiActionsViewModel, "actionClicked", "multiaction.copyto");

                        openDefer.resolve(mivm);
                        copyToDef.resolve(result);
                        deferIds.resolve(new ap.services.apiHelper.ApiResponse(apiIds));
                        deferData.resolve(new ap.services.apiHelper.ApiResponse(apiData));
                        $rootScope.$apply();
                    });
                    it("THEN, openTransferDialog must called", () => {
                        expect(vm.openMeetingSelectorDialog).toHaveBeenCalled();
                    });
                    it("THEN, show done message", () => {
                        expect(MainController.showToast).toHaveBeenCalled();
                    });
                });
                describe("WHEN, NoteController.copyTo is called AND there is error", () => {
                    beforeEach(() => {
                        let result: ap.models.multiactions.NoteMultiActionsResult = new ap.models.multiactions.NoteMultiActionsResult(Utility, [], [new ap.models.multiactions.NotAppliedActionDescription()]);

                        specHelper.general.raiseEvent(vm.multiActionsViewModel, "actionClicked", "multiaction.copyto");

                        openDefer.resolve(mivm);
                        copyToDef.resolve(result);
                        deferIds.resolve(new ap.services.apiHelper.ApiResponse(apiIds));
                        deferData.resolve(new ap.services.apiHelper.ApiResponse(apiData));
                        $rootScope.$apply();
                    });
                    it("THEN, $mdDialog.show must called", () => {
                        expect($mdDialog.show).toHaveBeenCalled();
                    });
                });
            });
        });
    });
});