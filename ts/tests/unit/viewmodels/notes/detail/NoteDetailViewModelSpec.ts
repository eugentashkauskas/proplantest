describe("Module ap-viewmodels - NoteDetail", () => {
    let $rootScope: angular.IRootScopeService, $scope: angular.IScope;
    let Utility: ap.utility.UtilityHelper, UserContext: ap.utility.UserContext;
    let vm: ap.viewmodels.notes.NoteDetailViewModel;
    let NoteController: ap.controllers.NoteController;
    let ProjectController: ap.controllers.ProjectController;
    let $q: angular.IQService;
    let Api: ap.services.apiHelper.Api;
    let mdDialogDeferred: angular.IDeferred<any>;
    let MainController: ap.controllers.MainController;
    let DocumentController: ap.controllers.DocumentController;
    let NoteService: ap.services.NoteService;
    let $mdDialog: angular.material.IDialogService, $mdSidenav;
    let n: any, project: any, meeting: any;
    let noteJson: any;
    let $timeout: angular.ITimeoutService;
    let ControllersManager: ap.controllers.ControllersManager;
    let ServicesManager: ap.services.ServicesManager;
    let $location: angular.ILocationService;
    let $anchorScroll: angular.IAnchorScrollService;
    let $interval: angular.IIntervalService;

    let changeAllAccess = (note: ap.models.notes.Note, val: boolean) => {
        note.MeetingAccessRight.CanEdit = val;
        note.MeetingAccessRight.CanAddPoint = val;
        note.MeetingAccessRight.CanEditPoint = val;
        note.MeetingAccessRight.CanDeletePoint = val;
        note.MeetingAccessRight.CanEditPointStatus = val;
        note.MeetingAccessRight.CanAddComment = val;
        note.MeetingAccessRight.CanDeleteComment = val;
        note.MeetingAccessRight.CanArchiveComment = val;
        note.MeetingAccessRight.CanAddDoc = val;
        note.MeetingAccessRight.CanGenerateReport = val;
        note.MeetingAccessRight.CanCreateNextMeeting = val;
        note.MeetingAccessRight.CanEditAllPoint = val;
        note.MeetingAccessRight.CanEditPointIssueType = val;
        note.MeetingAccessRight.CanEditPointInCharge = val;
        note.MeetingAccessRight.CanAddPointDocument = val;
        note.MeetingAccessRight.CanDeletePointDocument = val;
    };

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

    let currentProject;

    let defActivity: ng.IDeferred<any>;
    let defActivityIds, defMeetingAccessRigts: ng.IDeferred<any>;
    let defMeetingsIds: angular.IDeferred<ap.services.apiHelper.ApiResponse>;
    let defMeetings: angular.IDeferred<ap.services.apiHelper.ApiResponse>;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });

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
        specHelper.general.spyProperty(ap.viewmodels.notes.NoteDocumentListViewModel.prototype, "isDisplayingPictureViewer", specHelper.PropertyAccessor.Get).and.returnValue(false);
    });

    afterEach(() => {
        specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteDocumentListViewModel.prototype, "isDisplayingPictureViewer", specHelper.PropertyAccessor.Get);
    });

    beforeEach(inject(function (_$rootScope_, _$mdSidenav_, _UserContext_, _Utility_, _$timeout_, _NoteController_, _$q_, _MainController_, _DocumentController_, _NoteService_, _$mdDialog_, _ProjectController_, _Api_, _$location_, _$anchorScroll_, _$interval_, _ControllersManager_, _ServicesManager_) {
        Utility = _Utility_;
        UserContext = _UserContext_;
        NoteController = _NoteController_;
        DocumentController = _DocumentController_;
        ProjectController = _ProjectController_;
        $rootScope = _$rootScope_;
        $timeout = _$timeout_;
        $q = _$q_;
        Api = _Api_;
        $mdSidenav = _$mdSidenav_;
        MainController = _MainController_;
        NoteService = _NoteService_;
        ControllersManager = _ControllersManager_;
        ServicesManager = _ServicesManager_;
        $mdDialog = _$mdDialog_;
        $scope = $rootScope.$new();
        specHelper.utility.stubRootUrl(Utility);
        specHelper.userContext.stub(Utility);
        specHelper.utility.stubStorageSet(Utility);
        $interval = _$interval_;
        $anchorScroll = _$anchorScroll_;
        $location = _$location_;

        project = {};
        project.Name = "Welcome";
        project.UserAccessRight = new ap.models.accessRights.ProjectAccessRight(Utility);
        project.UserAccessRight.CanEdit = true;
        project.UserAccessRight.CanArchiveDoc = true;
        project.PhotoFolderId = "d660cb6d-ca54-4b93-a564-a46e874eb68a";
        let date = new Date();
        date.setFullYear(2016);
        date.setMonth(2);
        meeting = {};
        meeting.Id = "66a829a1-b87e-44f8-acca-169d68823612";
        meeting.Occurrence = 1;
        meeting.Title = "Sprint Review";
        meeting.Code = "CodeMeeting";
        n = {
            Id: "b360cb6d-ca54-4b93-a564-a469274eb68a",
            Subject: "Note 1",
            CodeNum: "1.01",
            IsUrgent: true,
            IsReadOnly: false,
            DueDate: new Date(2016, 2, 25),
            ProblemLocation: 2,
            From: {
                Alias: "aproplan@aproplan.com",
                Person: {
                    Name: "Quentin Luc"
                }
            },
            Cell: {
                Code: "C1",
                Description: "Cell 1",
                ParentCell: {
                    Code: "P1",
                    Description: "ParentCell 1"
                }
            },
            IssueType: {
                Code: "IT1",
                Description: "IssueType 1",
                ParentChapter: {
                    Code: "PC1",
                    Description: "ParentChapter 1"
                }
            },
            Status: {
                Id: "4a3f65dc-8c13-4199-a550-7ff97476f6fd",
                Name: "Status 1",
                Color: "111111"
            },
            Comments: [
                {
                    Id: "b8d13dfc-4124-4340-be59-fbc2b22db6a3",
                    IsRead: false,
                    IsFirst: true,
                    Comment: "First comment of the point",
                    Date: '/Date(1442565731892)/'
                },
                {
                    Id: "b8d13dfc-4124-4340-be59-fbc2b22db6a3",
                    IsRead: true,
                    IsFirst: false,
                    Comment: "Second comment of the point",
                    Date: '/Date(1442565731891)/'
                }
            ],
            NoteDocuments: [
                {
                    Id: "9C4734B2-83E2-4256-A544-27AF0F6C6FE6",
                    Document: {
                        VersionCount: 0,
                        Author: new ap.models.actors.User(Utility)
                    }
                },
                {
                    Id: "2A08520E-A7D2-40FA-8257-C0DD99D2C672",
                    Document: {
                        VersionCount: 0,
                        Author: new ap.models.actors.User(Utility)
                    }
                }
            ],
            NoteInCharge: [
                {
                    Tag: "Sergio",
                    IsContactInvitedOnProject: false
                },
                {
                    Tag: "Renauld",
                    IsContactInvitedOnProject: true
                }
            ],
            Project: project,
            Meeting: meeting,
            MeetingAccessRight:
            {
                CanEdit: false,
                CanAddPoint: false,
                CanEditPoint: false,
                CanDeletePoint: false,
                CanEditPointStatus: false,
                CanAddComment: false,
                CanDeleteComment: false,
                CanArchiveComment: false,
                CanAddDoc: false,
                CanGenerateReport: false,
                CanCreateNextMeeting: false,
                CanEditAllPoint: false,
                CanEditPointIssueType: false,
                CanEditPointInCharge: false,
                CanAddPointDocument: false,
                CanDeletePointDocument: false,
                Level: ap.models.accessRights.AccessRightLevel.Subcontractor
            },
            NoteAccessRight:
            {
            }
        };

        noteJson = {
            Id: "b360cb6d-ca54-4b93-a564-a469274eb68a",
            Subject: "Note 1",
            CodeNum: "1.01",
            IsUrgent: true,
            IsReadOnly: false,
            ProblemLocation: 2,
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
                    EntityVersion: 1
                },
                {
                    Id: "b8d13dfc-4124-4340-be59-fbc2b22db6a3",
                    IsRead: true,
                    IsFirst: false,
                    Comment: "Second comment of the point",
                    EntityVersion: 1
                }
            ],
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
            },
        };

        currentProject = {
            Id: "45152-56",
            Name: "test",
            UserAccessRight: {
                CanUploadDoc: true
            },
            PhotoFolderId: "45121004"
        };
        spyOn(MainController, "currentProject").and.callFake((val) => {
            if (val === undefined) {
                return currentProject;
            }
        });
        spyOn(Utility.Translator, "getTranslation").and.callFake((key) => {
            if (key === "app.err.adddoc_wrong_extensionMsg")
                return "{0} app.err.adddoc_wrong_extensionMsg";
            return "$" + key;
        });

        spyOn(ServicesManager.noteService, "getLinkedNotes").and.returnValue($q.defer().promise);

        defActivity = $q.defer();
        defActivityIds = $q.defer();
        defMeetingAccessRigts = $q.defer();
        defMeetingsIds = $q.defer();
        defMeetings = $q.defer();
        spyOn(Api, "getApiResponse").and.callFake(function (url: string) {
            if (url.indexOf("rest/activitylogsids") === 0) {
                return defActivityIds.promise;
            }
            if (url.indexOf("rest/activitylogs") === 0) {
                return defActivity.promise;
            }
            if (url.indexOf("rest/accessrights") === 0) {
                return defMeetingAccessRigts.promise;
            }
            if (url.indexOf("rest/meetingsids") === 0) {
                return defMeetingsIds.promise;
            }
            if (url.indexOf("rest/meetings") === 0) {
                return defMeetings.promise;
            }
            return null;
        });
        let noteWorkspaceVm: ap.viewmodels.notes.NoteWorkspaceViewModel;
        defMeetingsIds.resolve(new ap.services.apiHelper.ApiResponse(["66a829a1-b87e-44f8-acca-169d68823612"]));
        let responseMeeting = new ap.models.meetings.Meeting(Utility);
        responseMeeting.createByJson(meeting);
        defMeetings.resolve(new ap.services.apiHelper.ApiResponse([responseMeeting]));
        noteWorkspaceVm = new ap.viewmodels.notes.NoteWorkspaceViewModel($scope, $mdSidenav, Utility, Api, $q, $mdDialog, $timeout, null, null, null, ControllersManager, ServicesManager, null, false);        
        defMeetingAccessRigts.resolve(new ap.services.apiHelper.ApiResponse([noteJson.MeetingAccessRight]));

        specHelper.general.spyProperty(ap.viewmodels.documents.DocumentViewModel.prototype, "noteWorkspaceVm", specHelper.PropertyAccessor.Get).and.returnValue(noteWorkspaceVm);
    }));

    afterEach(() => {
        specHelper.general.offSpyProperty(ap.viewmodels.documents.DocumentViewModel.prototype, "noteWorkspaceVm", specHelper.PropertyAccessor.Get);
    });

    let createNoteDetailVm = (noteId?: string, location?: angular.ILocationService, anchorScroll?: angular.IAnchorScrollService, interval?: angular.IIntervalService) => {
        return new ap.viewmodels.notes.NoteDetailViewModel(Utility, $mdDialog, $q, Api, ControllersManager, ServicesManager, noteId, location, anchorScroll, interval);
    };

    describe("Constructor", () => {
        let defNoteStatus;
        beforeEach(() => {
            defNoteStatus = $q.defer();

            spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue(defNoteStatus.promise);
        });

        describe("WHEN NoteDetailViewModel is created without noteId", () => {
            beforeEach(() => {
                vm = createNoteDetailVm();
                spyOn(vm, "gotoAnchor");
            });
            it("THEN, default values are correctly fill (access = false, isEditMode = false..)", () => {
                expect(vm.status).toBeNull();
                expect(vm.subCell).toBeNull();
                expect(vm.note).toBeNull();
                expect(vm.selectedTab).toBe(ap.viewmodels.notes.NoteDetailTabs.Field);
                expect(vm.newComment).toBeNull();
            });
            it("THEN, the addAction is added to the screenInfo property of the VM", () => {
                expect(vm.screenInfo.addAction).not.toBeNull();
            });
        });

        describe("WHEN NoteDetailViewModel is created with a noteId", () => {
            beforeEach(() => {
                spyOn(NoteController, "getFullNoteById").and.returnValue($q.resolve({
                    Id: "5",
                    MeetingAccessRight: {
                        CanAddPoint: true
                    }
                }));

                vm = createNoteDetailVm();

                spyOn(vm, "gotoAnchor");
                spyOn(vm, "copySource");

                vm.loadNote("5");
                $rootScope.$apply();
            });

            it("THEN, NoteController.getFullNoteById is called with the id of the selected note from the List", () => {
                expect(NoteController.getFullNoteById).toHaveBeenCalledWith("5", false);
            });

            it("THEN, copySource is called with the Note received from the Controller", () => {
                expect(vm.copySource).toHaveBeenCalled();
            });
        });
    });

    describe("Feature: CopySource", () => {
        let defNote: ng.IDeferred<any>;
        let defNoteStatus;
        let note: ap.models.notes.Note;
        beforeEach(() => {
            defNoteStatus = $q.defer();

            note = new ap.models.notes.Note(Utility);
            note.createByJson(n);

            spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue(defNoteStatus.promise);
            defNoteStatus.resolve([<ap.models.projects.NoteProjectStatus>note.Status]);
            $rootScope.$apply();

            vm = createNoteDetailVm();
            spyOn(vm, "gotoAnchor");

        });

        describe("WHEN  VM call init with note is null", () => {
            beforeEach(() => {
                vm.init(null);
            });
            it("THEN, the properties of the VM are filled in with default values ", () => {
                vm.copySource();
                expect(vm.status).toBeNull();
                expect(vm.subCell).toBeNull();
                expect(vm.cellFullName).toBe("$None");
                expect(vm.problemLocation).toBe("$None");
            });
        });

        describe("WHEN VM call init with note have full info", () => {
            beforeEach(() => {
                vm.init(note);
            });

            it("THEN, the properties of the VM are filled in with the received data", () => {
                expect(vm.note.Id).toBe(note.Id);
                expect(vm.subCell).toBe(note.Cell);
                expect(vm.cellFullName).toBe(note.Cell.ParentCell.Description + " / " + note.Cell.Description);
                expect(vm.problemLocation).toBe(ap.models.notes.ProblemLocation[note.ProblemLocation]);
            });
            it("THEN, the status is loaded", () => {
                defNoteStatus.resolve([<ap.models.projects.NoteProjectStatus>n.Status]);
                $rootScope.$apply();
                expect(vm.status).toBe(note.Status);
            });
        });

        describe("WHEN VM call init with note have full info without Cell", () => {
            beforeEach(() => {
                note.Cell = undefined;
                vm.init(note);
            });
            it("THEN, the cellFullName property of VM will be empty data AND there is no error thrown", () => {
                expect(vm.cellFullName).toBe("$None");
            });
        });
    });

    describe("Load infos of the selected note", () => {
        let defNote: ng.IDeferred<any>;
        let defNoteStatus: ng.IDeferred<any>;
        let defNoteDocuments: ng.IDeferred<any>;

        let note: ap.models.notes.Note;

        beforeEach(() => {
            defNote = $q.defer();
            defNoteStatus = $q.defer();

            spyOn(NoteController, "getFullNoteById").and.returnValue(defNote.promise);

            spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue(defNoteStatus.promise);

            spyOn(Date.prototype, "getLocalDatePattern").and.returnValue("M/d/yyyy");

            note = new ap.models.notes.Note(Utility);
            note.createByJson(n);
            changeAllAccess(note, false);
            vm = createNoteDetailVm();
            spyOn(vm, "gotoAnchor");
            vm.loadNote("b360cb6d-ca54-4b93-a564-a469274eb68a");
        });

        describe("WHEN the VM is loaded for the first time AND a noteId is given in the constructor", () => {
            it("THEN, the data from the note are loaded using the API AND the properties of the VM are filled in with the received data", () => {
                let note = new ap.models.notes.Note(Utility);
                n.NoteAccessRight = new ap.models.accessRights.NoteAccessRight(Utility, note);
                note.createByJson(n);
                changeAllAccess(note, true);
                defNote.resolve(note);                
                defNoteStatus.resolve([<ap.models.projects.NoteProjectStatus>n.Status]);
                defActivityIds.resolve({ data: ["97cbaaf3-25c6-48ad-9055-aa26ca7dbeb0"] });
                defActivity.resolve({
                    data: [{
                        Id: "97cbaaf3-25c6-48ad-9055-aa26ca7dbeb0",
                        ActivityType: ap.models.activities.ActivityType.Add,
                        User: { Id: "36", DisplayName: "John Doe" },
                        Date: "\/Date(1458052220000)\/",
                        EntityName: "NoteProcessStatusHistory",
                        EntityCode: "456-987",
                        ParentEntityCode: "74874",
                        EntityDescription: "To Do"
                    }]
                });
                $rootScope.$apply();

                expect(vm.subject).toBe("Note 1");
                expect(vm.dueDate.getFullYear()).toBe(2016);
                expect(vm.dueDate.getMonth()).toBe(2);
                expect(vm.dueDateFormatted).toBe("3/25/2016");
                expect(vm.from.Person.Name).toBe("Quentin Luc");
                expect(vm.from.Alias).toBe("aproplan@aproplan.com");
                expect(vm.isUrgent).toBeTruthy();
                expect(vm.project).toBe(note.Project);
                expect(vm.status.Name).toBe("Status 1");
                expect(vm.status.Color).toBe("111111");
                expect(vm.issueType.Code).toBe("IT1");
                expect(vm.issueType.Description).toBe("IssueType 1");
                expect(vm.issueType.ParentChapter.Code).toBe("PC1");
                expect(vm.issueType.ParentChapter.Description).toBe("ParentChapter 1");
                expect(vm.subCell.Code).toBe("C1");
                expect(vm.subCell.Description).toBe("Cell 1");
                expect(vm.subCell.ParentCell.Code).toBe("P1");
                expect(vm.subCell.ParentCell.Description).toBe("ParentCell 1");
                expect(vm.category).toBe("ParentChapter 1 / IssueType 1");
                expect(vm.cellFullName).toBe("ParentCell 1 / Cell 1");
                expect(vm.problemLocation).toBe("Wall");
                expect(vm.meeting.Code).toBe("CodeMeeting");
                expect(vm.meeting.Title).toBe("Sprint Review");
                expect((<ap.viewmodels.notes.NoteInChargeViewModel>vm.noteInChargeList.getItemAtIndex(0)).tag).toBe("Sergio");
                expect((<ap.viewmodels.notes.NoteInChargeViewModel>vm.noteInChargeList.getItemAtIndex(1)).tag).toBe("Renauld");
                expect((<ap.viewmodels.notes.NoteInChargeViewModel>vm.noteInChargeList.getItemAtIndex(0)).isInvitedOnProject).toBeFalsy();
                expect((<ap.viewmodels.notes.NoteInChargeViewModel>vm.noteInChargeList.getItemAtIndex(1)).isInvitedOnProject).toBeTruthy();
                expect((<ap.viewmodels.notes.NoteCommentViewModel>vm.noteCommentList.getItemAtIndex(0)).comment).toBe("First comment of the point");
                expect((<ap.viewmodels.notes.NoteCommentViewModel>vm.noteCommentList.getItemAtIndex(1)).isRead).toBeTruthy();
                expect((<ap.viewmodels.activities.ActivityLogItemViewModel>vm.noteActivityList.listVm.getItemAtIndex(0)).activityType).toBe(ap.models.activities.ActivityType.Add);
                expect(vm.note.Id).toBe("b360cb6d-ca54-4b93-a564-a469274eb68a");
                expect(vm.isEditMode).toBeFalsy();
                expect(vm.meetingAccessRight).toBe(note.MeetingAccessRight);
            });
        });

        describe("WHEN the VM is loaded for the first time AND a noteId is given in the constructor AND a note is loaded without IssueType and Cell and meeting", () => {
            it("THEN, the data from the note are loaded using the API AND the properties of the VM are filled in with the received data AND there is no error thrown", () => {
                let note = new ap.models.notes.Note(Utility);
                note.createByJson(n);
                changeAllAccess(note, true);
                note.IssueType = undefined;
                note.Cell = undefined;
                note.Meeting = undefined;

                defNote.resolve(note);
                $rootScope.$apply();

                expect(vm.subject).toBe("Note 1");
                expect(vm.cellFullName).toBe("$None");
                expect(vm.meeting).toBeUndefined();
            });
        });

        describe("WHEN the VM is loaded for the first time AND a noteId is given in the constructor AND the note loaded is not from the current user", () => {
            it("THEN, the data from the note are loaded using the API AND the user can edit the note because he has the CanEditAllPoint accessRight", () => {
                let note = new ap.models.notes.Note(Utility);
                note.createByJson(n);
                changeAllAccess(note, false);

                note.MeetingAccessRight.CanEdit = true;
                note.MeetingAccessRight.CanAddPoint = true;
                note.MeetingAccessRight.CanEditPoint = true;
                note.MeetingAccessRight.CanEditAllPoint = true;
                note.MeetingAccessRight.Level = ap.models.accessRights.AccessRightLevel.Contributor;
                // To have a note not created by the current user
                note.From = new ap.models.actors.User(Utility);

                defNote.resolve(note);
                $rootScope.$apply();

                expect(vm.noteAccessRight.canEdit).toBeTruthy();
            });
        });

        describe("WHEN the VM is loaded for the first time AND a noteId is given in the constructor AND the note loaded is not from the current user", () => {
            it("THEN, the data from the note are loaded using the API AND the user can edit the note because he has the CanEditPointIssueType accessRight", () => {
                let note = new ap.models.notes.Note(Utility);
                note.createByJson(n);
                changeAllAccess(note, false);

                note.MeetingAccessRight.CanEditPointStatus = true;
                note.MeetingAccessRight.CanEditPointIssueType = true;
                note.MeetingAccessRight.Level = ap.models.accessRights.AccessRightLevel.Contributor;
                // To have a note not created by the current user
                note.From = new ap.models.actors.User(Utility);

                defNote.resolve(note);
                $rootScope.$apply();

                expect(vm.noteAccessRight.canEdit).toBeTruthy();
            });
        });

        describe("WHEN the VM is loaded for the first time AND a noteId is given in the constructor AND the note loaded is not from the current user", () => {
            it("THEN, the data from the note are loaded using the API AND the user can edit the note because he has the CanEditPointInCharge accessRight", () => {
                let note = new ap.models.notes.Note(Utility);
                note.createByJson(n);
                changeAllAccess(note, false);

                note.MeetingAccessRight.CanEditPointStatus = true;
                note.MeetingAccessRight.CanEditPointInCharge = true;
                note.MeetingAccessRight.Level = ap.models.accessRights.AccessRightLevel.Contributor;
                // To have a note not created by the current user
                note.From = new ap.models.actors.User(Utility);

                defNote.resolve(note);
                $rootScope.$apply();

                expect(vm.noteAccessRight.canEdit).toBeTruthy();
            });
        });

        describe("WHEN the VM is loaded for the first time AND a noteId is given in the constructor AND the note loaded is not from the current user", () => {
            it("THEN, the data from the note are loaded using the API AND the user cannot edit the note because he doesn't have the necessary access rights", () => {
                let note = new ap.models.notes.Note(Utility);
                note.createByJson(n);
                changeAllAccess(note, false);

                note.MeetingAccessRight.CanEditPointStatus = true;
                note.MeetingAccessRight.Level = ap.models.accessRights.AccessRightLevel.Contributor;

                // To have a note not created by the current user
                note.From = new ap.models.actors.User(Utility);

                defNote.resolve(note);
                $rootScope.$apply();

                expect(vm.noteAccessRight.canEdit).toBeFalsy();
            });
        });

        describe("WHEN the VM is loaded for the first time AND the note loaded is not from the current user AND he doesn't have the accessright to archive it", () => {
            it("THEN, canArchive = false", () => {
                let note = new ap.models.notes.Note(Utility);
                note.createByJson(n);
                changeAllAccess(note, false);

                note.MeetingAccessRight.CanEditPointStatus = true;
                note.MeetingAccessRight.Level = ap.models.accessRights.AccessRightLevel.Contributor;
                // To have a note not created by the current user
                note.From = new ap.models.actors.User(Utility);

                defNote.resolve(note);
                $rootScope.$apply();

                expect(vm.noteAccessRight.canArchive).toBeFalsy();
            });
        });

        describe("WHEN the VM is loaded for the first time AND the note is already archived AND the user has accessright to edit it", () => {
            it("THEN, canArchive = false", () => {
                let note = new ap.models.notes.Note(Utility);
                note.createByJson(n);
                changeAllAccess(note, false);

                note.MeetingAccessRight.CanEdit = true;
                note.MeetingAccessRight.CanEditPointStatus = true;
                note.MeetingAccessRight.CanEditAllPoint = true;
                note.MeetingAccessRight.Level = ap.models.accessRights.AccessRightLevel.Contributor;
                // To have a note not created by the current user
                note.From = new ap.models.actors.User(Utility);
                note.IsArchived = true;

                defNote.resolve(note);
                $rootScope.$apply();

                expect(vm.noteAccessRight.canArchive).toBeFalsy();
            });
        });

        describe("WHEN the VM is loaded with a noteId AND he has NOT the access CanAddPointDocument on list", () => {
            it("THEN, CanUploadDoc = false", () => {
                let note = new ap.models.notes.Note(Utility);
                note.createByJson(n);
                changeAllAccess(note, false);

                note.MeetingAccessRight.Level = ap.models.accessRights.AccessRightLevel.Contributor;

                // To have a note not created by the current user
                note.From = new ap.models.actors.User(Utility);
                note.IsArchived = true;

                defNote.resolve(note);
                $rootScope.$apply();

                expect(vm.noteAccessRight.canUploadDoc).toBeFalsy();
            });
        });

        describe("WHEN the VM is loaded with a noteId AND has the access CanAddPointDocument on list BUT note is readonly", () => {
            it("THEN, CanUploadDoc = false", () => {
                let note = new ap.models.notes.Note(Utility);
                note.createByJson(n);
                changeAllAccess(note, false);

                note.MeetingAccessRight.CanAddPointDocument = true;
                note.MeetingAccessRight.Level = ap.models.accessRights.AccessRightLevel.Contributor;

                // To have a note not created by the current user
                note.IsReadOnly = true;
                note.From = new ap.models.actors.User(Utility);
                note.IsArchived = true;

                defNote.resolve(note);
                $rootScope.$apply();

                expect(vm.noteAccessRight.canUploadDoc).toBeFalsy();
            });
        });

        describe("WHEN the VM is loaded with a noteId AND has the access CanAddPointDocument on list", () => {
            it("THEN, CanUploadDoc = true", () => {
                let note = new ap.models.notes.Note(Utility);
                note.createByJson(n);
                changeAllAccess(note, false);

                note.MeetingAccessRight.CanAddPointDocument = true;
                note.MeetingAccessRight.Level = ap.models.accessRights.AccessRightLevel.Contributor;

                // To have a note not created by the current user
                note.From = new ap.models.actors.User(Utility);
                note.IsArchived = true;

                defNote.resolve(note);
                $rootScope.$apply();

                expect(vm.noteAccessRight.canUploadDoc).toBeTruthy();
            });
        });

        describe("WHEN the VM is loaded with a noteId AND he has not the access to UploadDoc on project AND has CanAddPointDocument on list", () => {
            it("THEN, allowedNewFileType = [ 'png', 'jpg', 'jpeg', 'gif']", () => {
                let note = new ap.models.notes.Note(Utility);
                note.createByJson(n);
                changeAllAccess(note, false);

                note.MeetingAccessRight.CanAddPointDocument = true;
                currentProject.UserAccessRight.CanUploadDoc = false;
                note.MeetingAccessRight.Level = ap.models.accessRights.AccessRightLevel.Contributor;

                // To have a note not created by the current user
                note.From = new ap.models.actors.User(Utility);
                note.IsArchived = true;

                defNote.resolve(note);
                $rootScope.$apply();

                expect(vm.allowedNewFileType).toEqual(["png", "jpg", "jpeg", "gif"]);
            });
        });

        describe("WHEN the VM is loaded with a noteId AND he has the access to UploadDoc on project AND has CanAddPointDocument on list", () => {
            it("THEN, allowedNewFileType = ['*']", () => {
                let note = new ap.models.notes.Note(Utility);
                note.createByJson(n);
                changeAllAccess(note, false);
                note.MeetingAccessRight.CanAddPointDocument = true;
                currentProject.UserAccessRight.CanUploadDoc = true;

                note.MeetingAccessRight.Level = ap.models.accessRights.AccessRightLevel.Contributor;

                // To have a note not created by the current user
                note.From = new ap.models.actors.User(Utility);
                note.IsArchived = true;

                defNote.resolve(note);
                $rootScope.$apply();
                // For the moment, we accept only image because functionality to select folder doesn't exist -> photo only (copy from NoteDetailViewModel.ts)
                expect(vm.allowedNewFileType).toEqual(["*"]);
            });
        });

        describe("WHEN the VM is loaded with a noteId AND user has the access to CanAddComment on list", () => {
            it("THEN, CanAddComment = true", () => {
                changeAllAccess(note, false);

                note.MeetingAccessRight.CanEditPoint = true;
                note.MeetingAccessRight.CanAddComment = true;
                note.MeetingAccessRight.Level = ap.models.accessRights.AccessRightLevel.Contributor;

                // To have a note not created by the current user
                note.From = new ap.models.actors.User(Utility);
                note.IsArchived = true;

                defNote.resolve(note);
                $rootScope.$apply();

                let noteAccessRight: ap.models.accessRights.NoteAccessRight = new ap.models.accessRights.NoteAccessRight(Utility, note);

                expect(noteAccessRight.canAddComment).toBeTruthy();
            });
        });

        describe("WHEN the VM is loaded with a noteId AND user has the access CanEditPoint AND NOT CanAddComment on list", () => {
            it("THEN, CanAddComment = false", () => {
                changeAllAccess(note, false);
                note.MeetingAccessRight.CanEditPoint = true;

                note.MeetingAccessRight.Level = ap.models.accessRights.AccessRightLevel.Contributor;

                // To have a note not created by the current user
                note.From = new ap.models.actors.User(Utility);
                note.IsArchived = true;

                defNote.resolve(note);
                $rootScope.$apply();

                let noteAccessRight: ap.models.accessRights.NoteAccessRight = new ap.models.accessRights.NoteAccessRight(Utility, note);

                expect(noteAccessRight.canAddComment).toBeFalsy();
            });
        });

        describe("WHEN the VM is loaded with a noteId AND user has NOT the access CanEditPoint BUT has CanAddComment on list", () => {
            it("THEN, CanAddComment = true", () => {
                changeAllAccess(note, false);

                note.MeetingAccessRight.CanAddComment = true;
                note.MeetingAccessRight.Level = ap.models.accessRights.AccessRightLevel.Contributor;

                // To have a note not created by the current user
                note.From = new ap.models.actors.User(Utility);
                note.IsArchived = true;

                defNote.resolve(note);
                $rootScope.$apply();

                let noteAccessRight: ap.models.accessRights.NoteAccessRight = new ap.models.accessRights.NoteAccessRight(Utility, note);

                expect(noteAccessRight.canAddComment).toBeTruthy();
            });
        });

        describe("WHEN the VM is loaded with a noteId AND user has NOT the access CanEditPoint AND NOT CanAddComment on list", () => {
            it("THEN, CanAddComment = false", () => {
                changeAllAccess(note, false);

                note.MeetingAccessRight.Level = ap.models.accessRights.AccessRightLevel.Contributor;

                // To have a note not created by the current user
                note.From = new ap.models.actors.User(Utility);
                note.IsArchived = true;

                defNote.resolve(note);
                $rootScope.$apply();

                let noteAccessRight: ap.models.accessRights.NoteAccessRight = new ap.models.accessRights.NoteAccessRight(Utility, note);

                expect(noteAccessRight.canAddComment).toBeFalsy();
            });
        });

        describe("WHEN the VM is loaded with a noteId AND user has the access to CanEditPoint AND CanAddComment on list BUT note is readonly", () => {
            it("THEN, CanAddComment = false", () => {
                changeAllAccess(note, false);
                note.MeetingAccessRight.CanEditPoint = true;
                note.MeetingAccessRight.CanAddComment = true;

                note.MeetingAccessRight.Level = ap.models.accessRights.AccessRightLevel.Contributor;

                // To have a note not created by the current user
                note.IsReadOnly = true;
                note.From = new ap.models.actors.User(Utility);
                note.IsArchived = true;

                defNote.resolve(note);
                $rootScope.$apply();

                let noteAccessRight: ap.models.accessRights.NoteAccessRight = new ap.models.accessRights.NoteAccessRight(Utility, note);

                expect(noteAccessRight.canAddComment).toBeFalsy();
            });
        });

        describe("WHEN the VM is loaded with an incorrect noteId", () => {
            it("THEN it shows an error message to the user", () => {
                spyOn(MainController, "showError");

                vm.loadNote("111");

                defNote.reject(note);
                $rootScope.$apply();

                expect(MainController.showError).toHaveBeenCalledWith('$app.cannot.load.note.data', '$app.err.general_title', note, null);
            });
        });

        describe("WHEN the VM is loaded for the first time AND the note loaded is from the current user AND he have the accessright delete comment", () => {
            it("THEN, canDelete = false for first comment and canDelete = true for other comment", () => {
                let note = new ap.models.notes.Note(Utility);
                note.createByJson(n);
                changeAllAccess(note, false);

                note.MeetingAccessRight.CanDeleteComment = true;
                note.MeetingAccessRight.Level = ap.models.accessRights.AccessRightLevel.Admin;
                note.From = UserContext.CurrentUser();
                note.Comments[0].From = UserContext.CurrentUser();
                note.Comments[1].From = UserContext.CurrentUser();
                defNote.resolve(note);
                $rootScope.$apply();

                expect((<ap.viewmodels.notes.NoteCommentViewModel>vm.noteCommentList.getItemAtIndex(0)).canDelete).toBeFalsy();
                expect((<ap.viewmodels.notes.NoteCommentViewModel>vm.noteCommentList.getItemAtIndex(1)).canDelete).toBeTruthy();
            });
        });
    });

    describe("Feature: uploadDocuments", () => {
        let defNote: ng.IDeferred<any>;
        let defNoteStatus: ng.IDeferred<any>;
        let note: ap.models.notes.Note;
        let files: File[];
        beforeEach(() => {
            defNote = $q.defer();
            defNoteStatus = $q.defer();
            spyOn(NoteController, "getFullNoteById").and.returnValue(defNote.promise);
            spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue(defNoteStatus.promise);

            note = new ap.models.notes.Note(Utility);
            note.createByJson(n);
            changeAllAccess(note, false);
            vm = createNoteDetailVm();
            spyOn(vm, "gotoAnchor");
            vm.loadNote("b360cb6d-ca54-4b93-a564-a469274eb68a");

            changeAllAccess(note, false);
            note.MeetingAccessRight.CanAddPointDocument = true;
            currentProject.UserAccessRight.CanUploadDoc = true;

            files = [<File>{ name: "file1.png" }, <File>{ name: "file2.png" }];

            // To have a note not created by the current user
            note.From = new ap.models.actors.User(Utility);
            note.IsArchived = false;

            defNote.resolve(note);
            $rootScope.$apply();
        });

        describe("WHEN the dropFile method is called", () => {
            it("THE selectedTab becomes the attachments one", () => {
                vm.dropFiles(files);
                expect(vm.selectedTab).toBe(ap.viewmodels.notes.NoteDetailTabs.Attachments);
            });
        });
    });


    describe("Feature: commentsaved", () => {
        let defNote: angular.IDeferred<any>;
        let defStatus: angular.IDeferred<any>;

        let note: ap.models.notes.Note;
        let noteComment: ap.models.notes.NoteComment;
        let commentAddedEvent: ap.controllers.CommentSavedEvent;

        function resolveNote(noteJson: any) {
            note = new ap.models.notes.Note(Utility);
            note.createByJson(noteJson);
            defNote.resolve(note);
            $rootScope.$apply();
        }

        beforeEach(() => {
            defNote = $q.defer();
            defStatus = $q.defer();
            spyOn(NoteController, "getFullNoteById").and.returnValue(defNote.promise);
            spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue(defStatus.promise);

            vm = createNoteDetailVm();
            spyOn(vm, "gotoAnchor");
            vm.loadNote("b360cb6d-ca54-4b93-a564-a469274eb68a");
        });

        describe("WHEN commentsaved is raised from NoteController with the new CommentSavedEvent", () => {
            beforeEach(() => {
                resolveNote({
                    Id: "b360cb6d-ca54-4b93-a564-a469274eb68a"
                });

                noteComment = new ap.models.notes.NoteComment(Utility);
                noteComment.Note = note;
                noteComment.Date = ap.utility.UtilityHelper.convertJsonDate('/Date(1442565731892)/');
                spyOn(vm.noteCommentList.sourceItems, "unshift").and.callThrough();
            });

            describe("AND the note id returned in the event is the current note id", () => {
                let updatedNote: ap.models.notes.Note;
                beforeEach(() => {
                    updatedNote = new ap.models.notes.Note(Utility);
                    updatedNote.createByJson({
                        Id: "b360cb6d-ca54-4b93-a564-a469274eb68a",
                        EntityVersion: 12
                    });
                });

                it("THEN the notecomment is not pushed in the noteCommentList of NoteDetail", () => {
                    commentAddedEvent = new ap.controllers.CommentSavedEvent(noteComment, "otherNoteId", true, null);
                    specHelper.general.raiseEvent(NoteController, "commentsaved", commentAddedEvent);
                    expect(vm.noteCommentList.sourceItems.unshift).not.toHaveBeenCalled();
                });

                it("THEN the notecomment is pushed in the noteCommentList of NoteDetail if the CommentSavedEvent.noteId is equal to current noteId", () => {
                    commentAddedEvent = new ap.controllers.CommentSavedEvent(noteComment, note.Id, true, updatedNote);
                    specHelper.general.raiseEvent(NoteController, "commentsaved", commentAddedEvent);
                    expect((<ap.viewmodels.notes.NoteCommentViewModel>(<jasmine.Spy>vm.noteCommentList.sourceItems.unshift).calls.argsFor(0)[0]).noteComment.Id).toBe(noteComment.Id);
                });
            });
            describe("AND the current note entityversion is different than the one returned in the event", () => {
                let updatedNote: ap.models.notes.Note;
                beforeEach(() => {
                    updatedNote = new ap.models.notes.Note(Utility);
                    updatedNote.createByJson({
                        Id: "b360cb6d-ca54-4b93-a564-a469274eb68a",
                        EntityVersion: 12
                    });
                });
                it("THEN the EntityVersion of the note is updated", () => {
                    commentAddedEvent = new ap.controllers.CommentSavedEvent(noteComment, note.Id, true, updatedNote);
                    specHelper.general.raiseEvent(NoteController, "commentsaved", commentAddedEvent);
                    expect(vm.note.EntityVersion).toBe(12);
                });
            });

            describe("AND the note id returned in the event is different than the current note id", () => {
                let updatedNote: ap.models.notes.Note;
                beforeEach(() => {
                    updatedNote = new ap.models.notes.Note(Utility);
                    updatedNote.createByJson({
                        Id: "123",
                        EntityVersion: 12
                    });
                });
                it("THEN the notecomment is not pushed in the noteCommentList of NoteDetail", () => {
                    commentAddedEvent = new ap.controllers.CommentSavedEvent(noteComment, "otherNoteId", true, updatedNote);
                    specHelper.general.raiseEvent(NoteController, "commentsaved", commentAddedEvent);
                    expect(vm.noteCommentList.sourceItems.unshift).not.toHaveBeenCalled();
                });
            });
        });

        describe("WHEN commentsaved is raised from NoteController with the existing notecomment", () => {
            beforeEach(() => {
                resolveNote({
                    Id: "b360cb6d-ca54-4b93-a564-a469274eb68a",
                    Comments: [{ Id: "C1", Comment: "Comment1", Date: '/Date(1442565731892)/' }, { Id: "C2", Comment: "Comment2", Date: '/Date(1442565731891)/', EntityVersion: 2 }]
                });

                noteComment = new ap.models.notes.NoteComment(Utility);
                noteComment.createByJson({ Id: "C2", Comment: "Comment2 updated", Date: '/Date(1442565731893)/', EntityVersion: 10 });

                let updatedNote = new ap.models.notes.Note(Utility);
                updatedNote.createByJson({
                    Id: "b360cb6d-ca54-4b93-a564-a469274eb68a",
                    EntityVersion: 12
                });

                commentAddedEvent = new ap.controllers.CommentSavedEvent(noteComment, note.Id, false, updatedNote);

                specHelper.general.raiseEvent(NoteController, "commentsaved", commentAddedEvent);
            });

            it("THEN the notecomment is updated into the vm if the updated notecomment is on the current note", () => {
                expect((<ap.viewmodels.notes.NoteCommentViewModel>vm.noteCommentList.sourceItems[1]).comment).toBe("Comment2 updated");
            });

            it("THEN, the entityVersion of the noteComment entity is updated", () => {
                expect(vm.note.Comments[1].EntityVersion).toBe(10);
            });


            it("THEN the entityVersion of the note is updated", () => {
                noteComment = new ap.models.notes.NoteComment(Utility);
                noteComment.createByJson({ Id: "C3", Comment: "Comment3 updated", Date: '/Date(1442565731891)/' });

                commentAddedEvent = new ap.controllers.CommentSavedEvent(noteComment, note.Id, false, note);

                specHelper.general.raiseEvent(NoteController, "commentsaved", commentAddedEvent);
                expect(vm.note.EntityVersion).toBe(12);
            });
        });
    });

    describe("Feature: Update note status", () => {
        let defNote: ng.IDeferred<any>;
        let defNoteStatus: ng.IDeferred<any>;
        let defUpdateStatus: ng.IDeferred<any>;
        let defDoneStatus: ng.IDeferred<any>;

        beforeEach(() => {
            defNote = $q.defer();
            defNoteStatus = $q.defer();
            defUpdateStatus = $q.defer();
            defDoneStatus = $q.defer();
            spyOn(NoteController, "getFullNoteById").and.returnValue(defNote.promise);
            spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue(defNoteStatus.promise);
            spyOn(NoteController, "updateNoteStatus").and.returnValue(defUpdateStatus.promise);
            spyOn(NoteController, "changeDoneUndoneBlockedStatus").and.returnValue(defDoneStatus.promise);

            vm = createNoteDetailVm();
            spyOn(vm, "gotoAnchor");
            vm.loadNote("b360cb6d-ca54-4b93-a564-a469274eb68a");
        });
        describe("WHEN selectedItemChanged of the noteProjectStatusList is called AND the status is different than the current one", () => {
            it("THEN the current status of the VM is updated with the new one", () => {
                let note: ap.models.notes.Note = new ap.models.notes.Note(Utility);
                note.createByJson({
                    Id: "b360cb6d-ca54-4b93-a564-a469274eb68a",
                    Status: {
                        Id: "a1989fce-db6a-4d2d-8830-08ebe8bbe49a"
                    },
                    From: {
                        Id: "45de9da1-7935-4119-bdb8-98d92f159d08"
                    }
                });
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
                    CanViewOnlyPointInCharge: false
                });

                note.MeetingAccessRight = meetingAccessRight;

                //resolve the note requested by the ViewModel to refresh the StatusList in the CopySource method
                defNote.resolve(note);
                $rootScope.$apply();

                // resolve the loaded statuses
                defNoteStatus.resolve(noteProjectStatusList);
                $rootScope.$apply();

                vm.isEditMode = true;
                vm.noteProjectStatusList.selectEntity("242b0cf8-47f1-46c0-b00b-7a7de5569c5b");

                expect(vm.status.Name).toEqual(noteProjectStatusList[1].Name);
            });
        });
    });

    describe("Feature: Refresh note details after changed the note's status from the list", () => {
        describe("WHEN notestatusupdated is raised from NoteController", () => {
            beforeEach(() => {
                let defNote = $q.defer();
                let defStatus = $q.defer();
                spyOn(NoteController, "getFullNoteById").and.returnValue(defNote.promise);

                spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue(defStatus.promise);

                vm = createNoteDetailVm("b360cb6d-ca54-4b93-a564-a469274eb68a");
                spyOn(vm, "gotoAnchor");
                vm.loadNote("b360cb6d-ca54-4b93-a564-a469274eb68a");

                let n: ap.models.notes.Note = new ap.models.notes.Note(Utility);
                n.createByJson({ Id: "b360cb6d-ca54-4b93-a564-a469274eb68a" });
                defNote.resolve(n);
                $rootScope.$apply();

                (<any>NoteController)._listener.raise("notestatusupdated", { updatedNote: { Id: "b360cb6d-ca54-4b93-a564-a469274eb68a", EntityVersion: 2 }, newStatus: { Id: "baf99dac-8dde-4caa-9830-8b88625925c6" } });
            });
            it("THEN, the note in NoteDetailVM takes as value the updated note from the raise call", () => {
                expect(vm.note.EntityVersion).toEqual(2);
                expect(vm.note.Status.Id).toEqual("baf99dac-8dde-4caa-9830-8b88625925c6");
            });
            it("THEN, the note is reload", () => {
                expect(NoteController.getFullNoteById).toHaveBeenCalled();
            });

        });
    });

    describe("Feature: selected tab changed", () => {
        describe("WHEN a new value is set to SelectedTab property", () => {
            it("THEN the event 'propertychanged' is raised with the selectedTab property and old value of the selected tab", () => {
                let callbackEvent = jasmine.createSpy("callbackEvent");

                vm = createNoteDetailVm(null, $location, $anchorScroll, $interval);
                vm.on("propertychanged", callbackEvent, this);
                vm.selectedTab = ap.viewmodels.notes.NoteDetailTabs.Comments;

                expect(callbackEvent).toHaveBeenCalledWith(new ap.viewmodels.base.PropertyChangedEventArgs("selectedTab", ap.viewmodels.notes.NoteDetailTabs.Field, vm));
            });
        });
    });

    describe("Feature: scroll to the current tab when the note is loaded", () => {
        describe("WHEN a note is loaded", () => {
            it("THEN, goToAnchor is called to scroll to update the scroll offset of the selected tab", () => {
                let defNote = $q.defer();
                let defStatus = $q.defer();

                spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue(defStatus.promise);

                vm = createNoteDetailVm(null, $location, $anchorScroll, $interval);

                spyOn(NoteController, "getFullNoteById").and.returnValue(defNote.promise);
                spyOn(vm, "gotoAnchor");

                vm.loadNote("2");

                defNote.resolve(new ap.models.notes.Note(Utility));
                $rootScope.$apply();

                expect(vm.gotoAnchor).toHaveBeenCalledWith("Field", true);
            });
        });
    });

    describe("Feature: AddNote", () => {
        let defNote: angular.IDeferred<ap.models.notes.Note>;
        let hasAccessMeetingVisibility: boolean;
        beforeEach(() => {
            vm = createNoteDetailVm();

            defNote = $q.defer();

            spyOn(vm, "copySource")
            spyOn(NoteController, "createNewNote").and.returnValue(defNote.promise);
            spyOn(MainController, "licenseAccess").and.returnValue(new ap.models.licensing.LicenseAccess(Utility));
            spyOn(MainController.licenseAccess(), "hasAccess").and.callFake((code) => {
                if (code === ap.models.licensing.Module.Module_MeetingVisibility)
                    return hasAccessMeetingVisibility;
                return true;
            });
        });

        describe("WHEN a call is made to addNote", () => {

            it("THEN noteController.createNewNote is called", () => {
                vm.addNote();
                expect(NoteController.createNewNote).toHaveBeenCalled();
            });
            it("THEN, copySource is called to init the VM", () => {
                vm.addNote();
                defNote.resolve(new ap.models.notes.Note(Utility));
                $rootScope.$apply();
                expect(vm.copySource).toHaveBeenCalled();
            });
        });
    });

    describe("Feature: init", () => {
        let note: ap.models.notes.Note;

        beforeEach(() => {
            spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue($q.resolve());

            note = new ap.models.notes.Note(Utility);
            note.createByJson({
                Id: "test-id",
                Subject: "Test subject",
            });

            vm = createNoteDetailVm(null, $location, $anchorScroll, $interval);
            spyOn(vm, "gotoAnchor").and.callThrough();
        });

        describe("WHEN a note model is given", () => {
            beforeEach(() => {
                vm.init(note);
            });

            it("THEN the given model is used by the view model", () => {
                expect(vm.note).toEqual(note);
            });

            it("THEN a subject of the given model is used as a title", () => {
                expect(vm.screenInfo.title).toEqual("Test subject");
            });

            it("THEN a scroll bar is adjusted", () => {
                expect(vm.gotoAnchor).toHaveBeenCalled();
            });
        });
    });

    describe("Feature: note updated", () => {
        let note: ap.models.notes.Note;
        let defNote: angular.IDeferred<ap.models.notes.Note>;
        let defNoteStatus: angular.IDeferred<any>;

        beforeEach(() => {
            note = new ap.models.notes.Note(Utility);
            note.createByJson({
                Id: 2,
                EntityVersion: 4,
                Subject: "The point to become urgent",
                IsUrgent: false
            });
            defNote = $q.defer();
            defNoteStatus = $q.defer();

            spyOn(NoteController, "getFullNoteById").and.returnValue(defNote.promise);
            spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue(defNoteStatus.promise);
            vm = createNoteDetailVm("2", $location, $anchorScroll, $interval);

            defNote.resolve(note);
            $rootScope.$apply();

        });
        describe("WHEN the noteController raise the noteUpdated event with IsUrgent properties for a note with same id but not same reference", () => {
            let updatedNote: ap.models.notes.Note;
            beforeEach(() => {
                updatedNote = new ap.models.notes.Note(Utility);
                updatedNote.createByJson({
                    Id: 2,
                    EntityVersion: 5,
                    Subject: "The point to become urgent",
                    IsUrgent: true
                });
            });
            it("THEN, the view model is updated with this new values", () => {
                specHelper.general.raiseEvent(NoteController, "noteupdated", new ap.controllers.NoteBaseUpdatedEvent([updatedNote], ["IsUrgent"]));

                expect(vm.isUrgent).toBeTruthy();
            });
            it("THEN, the originalEntity is updated for this property", () => {
                specHelper.general.raiseEvent(NoteController, "noteupdated", new ap.controllers.NoteBaseUpdatedEvent([updatedNote], ["IsUrgent"]));

                expect((<ap.models.notes.Note>vm.originalEntity).IsUrgent).toBeTruthy();
            });
            it("THEN, the originalEntity is updated for EntityVersion", () => {
                specHelper.general.raiseEvent(NoteController, "noteupdated", new ap.controllers.NoteBaseUpdatedEvent([updatedNote], ["IsUrgent"]));
                expect(vm.originalEntity.EntityVersion).toBe(updatedNote.EntityVersion);
            });
        });
        describe("WHEN the noteController raise the noteUpdated event with IsUrgent properties for a note with same id and with same reference", () => {
            beforeEach(() => {
                note.createByJson({
                    Id: 2,
                    EntityVersion: 5,
                    Subject: "The point to become urgent",
                    IsUrgent: true
                });
            });
            it("THEN, the view model is updated with this new values", () => {
                specHelper.general.raiseEvent(NoteController, "noteupdated", new ap.controllers.NoteBaseUpdatedEvent([note], ["IsUrgent"]));

                expect(vm.isUrgent).toBeTruthy();
            });
            it("THEN, the originalEntity is equals to the note of the event", () => {
                specHelper.general.raiseEvent(NoteController, "noteupdated", new ap.controllers.NoteBaseUpdatedEvent([note], ["IsUrgent"]));

                expect(vm.originalEntity).toBe(note);
            });
        });
        describe("WHEN the noteController raise the noteUpdated event with IsArchived propertie", () => {
            beforeEach(() => {
                note.createByJson({
                    Id: 2,
                    EntityVersion: 5,
                    Subject: "The point to become urgent",
                    IsArchived: true
                });
            });
            it("THEN, the originalEntity is equals to the note of the event", () => {
                specHelper.general.raiseEvent(NoteController, "noteupdated", new ap.controllers.NoteBaseUpdatedEvent([note], ["IsArchived"]));
                expect(vm.originalEntity).toBe(note);
            });
        });
        describe("WHEN the noteController raise the noteUpdated event with Deleted propertie", () => {
            beforeEach(() => {
                note.createByJson({
                    Id: 2,
                    EntityVersion: 5,
                    Subject: "The point to become urgent",
                    Deleted: true
                });
            });
            it("THEN, the originalEntity is equals to the note of the event", () => {
                specHelper.general.raiseEvent(NoteController, "noteupdated", new ap.controllers.NoteBaseUpdatedEvent([note], ["Deleted"]));
                expect(vm.originalEntity).toBe(note);
            });
        });
    });

    describe("Feature: postChanges", () => {
        let note: ap.models.notes.Note;
        let defNote: angular.IDeferred<ap.models.notes.Note>;
        let defNoteStatus: angular.IDeferred<any>;
        let noteStatus: ap.models.projects.NoteProjectStatus;

        // Init
        beforeEach(() => {
            note = new ap.models.notes.Note(Utility);
            defNote = $q.defer();
            defNoteStatus = $q.defer();

            spyOn(NoteController, "getFullNoteById").and.returnValue(defNote.promise);
            spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue(defNoteStatus.promise);

            vm = createNoteDetailVm("2");

            spyOn(vm, "gotoAnchor");

            noteStatus = new ap.models.projects.NoteProjectStatus(Utility);
            noteStatus.Code = "Cancelled";
            specHelper.general.spyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get).and.returnValue(
                {
                    originalEntity: noteStatus
                }
            );

            defNote.resolve(new ap.models.notes.Note(Utility));
            $rootScope.$apply();
        });

        afterEach(() => {
            specHelper.general.offSpyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get);
        });
        //ICI
        describe("WHEN postChanges if called", () => {
            let date: Date;
            let firstInCharge: ap.models.notes.NoteInCharge;
            let secondInCharge: ap.models.notes.NoteInCharge;

            beforeEach(() => {
                // Change some properties of the VM
                vm.subject = "title";
                date = new Date(2017, 4, 10);
                vm.dueDate = date;
                vm.isUrgent = true;

                let cell: ap.models.projects.SubCell = new ap.models.projects.SubCell(Utility);
                cell.Code = "R2.1";
                vm.subCell = cell;

                vm.problemLocation = ap.models.notes.ProblemLocation[ap.models.notes.ProblemLocation.Floor];

                let firstComment: ap.models.notes.NoteComment = new ap.models.notes.NoteComment(Utility);
                firstComment.IsFirst = true;
                firstComment.Comment = "My first little comment";
                let firstCommentVm = new ap.viewmodels.notes.NoteCommentViewModel(Utility, NoteController, MainController);
                firstCommentVm.init(firstComment);
                let comment: ap.models.notes.NoteComment = new ap.models.notes.NoteComment(Utility);
                comment.Comment = "My secoond comment";
                let commentVm = new ap.viewmodels.notes.NoteCommentViewModel(Utility, NoteController, MainController);
                commentVm.init(comment);
                vm.noteCommentList.onLoadItems([firstCommentVm, commentVm]);

                // Incharge management
                firstInCharge = new ap.models.notes.NoteInCharge(Utility);
                firstInCharge.Tag = "UserA";
                firstInCharge.UserId = "123";

                secondInCharge = new ap.models.notes.NoteInCharge(Utility);
                secondInCharge.Tag = "CompanyA";

                let firstInChargeVM: ap.viewmodels.notes.NoteInChargeViewModel = new ap.viewmodels.notes.NoteInChargeViewModel(Utility);
                firstInChargeVM.init(firstInCharge);

                let secondInChargeVM: ap.viewmodels.notes.NoteInChargeViewModel = new ap.viewmodels.notes.NoteInChargeViewModel(Utility);
                secondInChargeVM.init(secondInCharge);

                vm.noteInChargeList.onLoadItems([firstInChargeVM, secondInChargeVM]);

                // action postChanges
                vm.postChanges();
            });
            it("THEN, the entity's Status are updated with the ViewModel's Status", () => {
                expect(vm.note.Status).toBe(noteStatus);
            });
            it("THEN, the entity's ProblemLocation are updated with the ViewModel's ProblemLocation", () => {
                expect(vm.note.ProblemLocation).toBe(ap.models.notes.ProblemLocation.Floor);
            });
        });
    });

    describe("Feature: deleteComment", () => {
        let defNote: angular.IDeferred<any>;
        let defStatus: angular.IDeferred<any>;
        let noteJSON: any;

        beforeEach(() => {
            noteJSON = {
                Subject: "My note",
                From: {
                    Id: "4"
                },
                Meeting: {
                },
                MeetingAccessRight: {
                    ModuleName: "Meeting",
                    Level: 2,
                    CanEdit: false,
                    CanEditPoint: false,
                    CanDeletePoint: false,
                    CanAddComment: false,
                    CanDeleteComment: false,
                    CanArchiveComment: false,
                    CanAddDoc: false,
                    CanEditAllPoint: false,
                    CanAddPointDocument: false,
                    CanDeletePointDocument: false,
                },
                IsArchived: false,
                Comments: [
                    {
                        Id: "b8d13dfc-4124-4340-be59-fbc2b22db6a3",
                        IsRead: false,
                        IsFirst: true,
                        Comment: "First comment of the point",
                        EntityVersion: 1,
                        Drawings: null,
                        Date: '/Date(1442565731892)/'
                    },
                    {
                        Id: "cb926576-35b4-4518-8131-79dbd89e13c6",
                        IsRead: true,
                        IsFirst: false,
                        Comment: "Second comment of the point",
                        EntityVersion: 1,
                        Drawings: null,
                        Date: '/Date(1442565731891)/'
                    }
                ]
            };
            defNote = $q.defer();
            defStatus = $q.defer();
            spyOn(NoteController, "getFullNoteById").and.returnValue(defNote.promise);
            spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue(defStatus.promise);

            vm = createNoteDetailVm();
            spyOn(vm, "gotoAnchor");
            vm.loadNote("b360cb6d-ca54-4b93-a564-a469274eb68a");
        })

        describe("WHEN user delete NoteComment when isFirst = false and created by him by click on delete action", () => {
            it("THEN, notedeleted event is raised and the comment is removed of noteCommentList", () => {

                let noteEntity: ap.models.notes.Note = new ap.models.notes.Note(Utility);
                noteEntity.createByJson(noteJSON);
                changeAllAccess(noteEntity, false);

                let deleteDefered = $q.defer();
                noteEntity.MeetingAccessRight.CanDeleteComment = true;
                noteEntity.IsReadOnly = false;
                noteEntity.Comments[0].From = UserContext.CurrentUser();
                noteEntity.Comments[1].From = UserContext.CurrentUser();

                deleteDefered.resolve(new ap.services.apiHelper.ApiResponse("success"));
                defNote.resolve(noteEntity);

                $rootScope.$apply();

                spyOn(vm.noteCommentList.sourceItems, "splice").and.callThrough();
                spyOn(noteEntity.Comments[1], "delete").and.callThrough();
                spyOn(Api, "deleteEntity").and.returnValue(deleteDefered.promise);

                // Spy on the message confirm and simulate confirm yes
                spyOn(MainController, "showConfirm").and.callFake(function (message, title, callback) {
                    expect(title).toEqual(Utility.Translator.getTranslation("app.notes.deletecomment_confirm_title"));
                    expect(message).toEqual(noteEntity.Comments[1].Comment);
                    callback(ap.controllers.MessageResult.Positive);
                });

                (<ap.viewmodels.notes.NoteCommentViewModel>vm.noteCommentList.getItemAtIndex(1)).actionClick("notecomment.delete");
                $rootScope.$apply();

                expect(noteEntity.Comments[1].EntityVersion).toEqual(2);
                expect(noteEntity.Comments[1].delete).toHaveBeenCalled();
                expect(vm.noteCommentList.sourceItems.splice).toHaveBeenCalledWith(1, 1);
                expect(vm.noteCommentList.sourceItems.length).toEqual(1);
            });
        })
    });

    describe("Feature: hasChanged", () => {
        let defNote: angular.IDeferred<any>;
        let defStatus: angular.IDeferred<any>;
        let noteJSON: any;

        beforeEach(() => {
            noteJSON = {
                Subject: "My note",
                From: {
                    Id: "4"
                },
                Meeting: {
                },
                MeetingAccessRight: {
                    ModuleName: "Meeting",
                    Level: 2,
                    CanEdit: false,
                    CanEditPoint: false,
                    CanDeletePoint: false,
                    CanAddComment: false,
                    CanDeleteComment: false,
                    CanArchiveComment: false,
                    CanAddDoc: false,
                    CanEditAllPoint: false,
                    CanAddPointDocument: false,
                    CanDeletePointDocument: false,
                },
                IsArchived: false,
                Comments: [
                    {
                        Id: "b8d13dfc-4124-4340-be59-fbc2b22db6a3",
                        IsRead: false,
                        IsFirst: true,
                        Comment: "First comment of the point",
                        EntityVersion: 1,
                        Drawings: null,
                        Date: '/Date(1442565731892)/'
                    },
                    {
                        Id: "cb926576-35b4-4518-8131-79dbd89e13c6",
                        IsRead: true,
                        IsFirst: false,
                        Comment: "Second comment of the point",
                        EntityVersion: 1,
                        Drawings: null,
                        Date: '/Date(1442565731891)/'
                    }
                ]
            };
            defNote = $q.defer();
            defStatus = $q.defer();
            spyOn(NoteController, "getFullNoteById").and.returnValue(defNote.promise);
            spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue(defStatus.promise);

            vm = createNoteDetailVm();
            spyOn(vm, "gotoAnchor");
            vm.loadNote("b360cb6d-ca54-4b93-a564-a469274eb68a");

            let noteEntity: ap.models.notes.Note = new ap.models.notes.Note(Utility);
            noteEntity.createByJson(noteJSON);

            defNote.resolve(noteEntity);
            $rootScope.$apply();
        })

        describe("WHEN nothing is done", () => {
            it("THEN haschanged is false", () => {
                expect(vm.hasChanged).toBeFalsy();
            });
        })

        describe("WHEN a subject is changed", () => {
            it("THEN haschanged is true", () => {
                vm.subject = "New subject";
                expect(vm.hasChanged).toBeTruthy();
            });
        })

        describe("WHEN a date is changed", () => {
            it("THEN haschanged is true", () => {
                vm.dueDate = new Date(2016, 1, 1);
                expect(vm.hasChanged).toBeTruthy();
            });
        })

        describe("WHEN a isUrgent is changed", () => {
            it("THEN haschanged is true", () => {
                vm.isUrgent = !vm.isUrgent;
                expect(vm.hasChanged).toBeTruthy();
            });
        })

        describe("WHEN a problemLocation is changed", () => {
            it("THEN haschanged is true", () => {
                vm.problemLocation = "New location";
                expect(vm.hasChanged).toBeTruthy();
            });
        })

        describe("WHEN subcell is changed", () => {
            it("THEN haschanged is true", () => {
                let cell: ap.models.projects.SubCell = new ap.models.projects.SubCell(Utility);
                cell.Code = "R2.1";
                vm.subCell = cell;
                expect(vm.hasChanged).toBeTruthy();
            });
        })

        describe("WHEN a noteInChargeList is changed", () => {

            it("THEN haschanged is true", () => {
                let contactItems: ap.viewmodels.projects.ContactItemViewModel[];
                let item1: ap.viewmodels.projects.ContactItemViewModel = new ap.viewmodels.projects.ContactItemViewModel("USERA", "111", "UserA@netika.com");
                let item2: ap.viewmodels.projects.ContactItemViewModel = new ap.viewmodels.projects.ContactItemViewModel("COMPANY1");
                let item3: ap.viewmodels.projects.ContactItemViewModel = new ap.viewmodels.projects.ContactItemViewModel("ROLE1");
                contactItems = [item1, item2, item3];
                vm.noteInChargeList.fillNoteInCharge(contactItems);
                expect(vm.hasChanged).toBeTruthy();
            });
        })

        describe("WHEN a noteCommentList is changed", () => {

            it("THEN haschanged is true", () => {
                (<ap.viewmodels.notes.NoteCommentViewModel>vm.noteCommentList.sourceItems[0]).comment = "New comment";
                expect(vm.hasChanged).toBeTruthy();
            });
        })

        describe("WHEN something has changed and postchange is called", () => {

            it("THEN haschanged is true", () => {
                vm.subject = "New subject";
                vm.dueDate = new Date(2016, 1, 1);
                vm.dueDate = new Date(2016, 1, 1);
                vm.isUrgent = !vm.isUrgent;
                vm.problemLocation = "New location";

                let cell: ap.models.projects.SubCell = new ap.models.projects.SubCell(Utility);
                cell.Code = "R2.1";
                vm.subCell = cell;

                let contactItems: ap.viewmodels.projects.ContactItemViewModel[];
                let item1: ap.viewmodels.projects.ContactItemViewModel = new ap.viewmodels.projects.ContactItemViewModel("USERA", "111", "UserA@netika.com");
                let item2: ap.viewmodels.projects.ContactItemViewModel = new ap.viewmodels.projects.ContactItemViewModel("COMPANY1");
                let item3: ap.viewmodels.projects.ContactItemViewModel = new ap.viewmodels.projects.ContactItemViewModel("ROLE1");
                contactItems = [item1, item2, item3];
                vm.noteInChargeList.fillNoteInCharge(contactItems);

                (<ap.viewmodels.notes.NoteCommentViewModel>vm.noteCommentList.sourceItems[0]).comment = "New comment";

                vm.postChanges();

                expect(vm.hasChanged).toBeTruthy();
            });
        })
    });

    describe("Feature: maySave", () => {
        let defNote: angular.IDeferred<any>;
        let defStatus: angular.IDeferred<any>;
        let noteJSON: any;

        describe("Feature: maySave with status", () => {
            beforeEach(() => {
                noteJSON = {
                    Subject: "My note",
                    From: {
                        Id: "4"
                    },
                    Meeting: {
                    },
                    MeetingAccessRight: {
                        ModuleName: "Meeting",
                        Level: 2,
                        CanEdit: false,
                        CanEditPoint: false,
                        CanDeletePoint: false,
                        CanAddComment: false,
                        CanDeleteComment: false,
                        CanArchiveComment: false,
                        CanAddDoc: false,
                        CanEditAllPoint: false,
                        CanAddPointDocument: false,
                        CanDeletePointDocument: false,
                    },
                    Status: {
                        Id: "a1989fce-db6a-4d2d-8830-08ebe8bbe49a" //in progress
                    },
                    IsArchived: false,
                    Comments: [
                        {
                            Id: "b8d13dfc-4124-4340-be59-fbc2b22db6a3",
                            IsRead: false,
                            IsFirst: true,
                            Comment: "First comment of the point",
                            EntityVersion: 1,
                            Drawings: null,
                            Date: '/Date(1442565731892)/'
                        },
                        {
                            Id: "cb926576-35b4-4518-8131-79dbd89e13c6",
                            IsRead: true,
                            IsFirst: false,
                            Comment: "Second comment of the point",
                            EntityVersion: 1,
                            Drawings: null,
                            Date: '/Date(1442565731891)/'
                        }
                    ]
                };
                defNote = $q.defer();
                defStatus = $q.defer();
                spyOn(NoteController, "getFullNoteById").and.returnValue(defNote.promise);
                spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue(defStatus.promise);

                vm = createNoteDetailVm();
                spyOn(vm, "gotoAnchor");
                vm.loadNote("b360cb6d-ca54-4b93-a564-a469274eb68a");

                let noteEntity: ap.models.notes.Note = new ap.models.notes.Note(Utility);
                noteEntity.createByJson(noteJSON);

                defNote.resolve(noteEntity);
                $rootScope.$apply();

                defStatus.resolve(noteProjectStatusList);
                $rootScope.$apply();
            })

            describe("WHEN in edit mode and a a status is selected ", () => {

                it("THEN the user can save the note when length of subject <= 255", () => {
                    vm.isEditMode = true;
                    expect(vm.maySave).toBeTruthy();
                });

                it("THEN the user cannot save the note when length of subject > 255", () => {
                    vm.isEditMode = true;
                    let subject = "Subject";
                    for (let i = 0; i < 10; i++)
                        subject += subject;
                    vm.subject = subject;
                    expect(vm.maySave).toBeFalsy();
                });

            });
            describe("WHEN in edit mode and no status selected and current status not equal null", () => {
                beforeEach(() => {
                    specHelper.general.spyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get).and.returnValue(null);
                });
                afterEach(() => {
                    specHelper.general.offSpyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get);
                });

                it("THEN the user cannot save the note", () => {
                    vm.isEditMode = true;
                    expect(vm.maySave).toBeTruthy();
                });
            });
        });

        describe("Feature: maySave with no status", () => {
            beforeEach(() => {
                noteJSON = {
                    Subject: "My note",
                    From: {
                        Id: "4"
                    },
                    Meeting: {
                    },
                    MeetingAccessRight: {
                        ModuleName: "Meeting",
                        Level: 2,
                        CanEdit: false,
                        CanEditPoint: false,
                        CanDeletePoint: false,
                        CanAddComment: false,
                        CanDeleteComment: false,
                        CanArchiveComment: false,
                        CanAddDoc: false,
                        CanEditAllPoint: false,
                        CanAddPointDocument: false,
                        CanDeletePointDocument: false,
                    },
                    IsArchived: false,
                    Comments: [
                        {
                            Id: "b8d13dfc-4124-4340-be59-fbc2b22db6a3",
                            IsRead: false,
                            IsFirst: true,
                            Comment: "First comment of the point",
                            EntityVersion: 1,
                            Drawings: null,
                            Date: '/Date(1442565731892)/'
                        },
                        {
                            Id: "cb926576-35b4-4518-8131-79dbd89e13c6",
                            IsRead: true,
                            IsFirst: false,
                            Comment: "Second comment of the point",
                            EntityVersion: 1,
                            Date: '/Date(1442565731891)/'
                        }
                    ]
                };
                defNote = $q.defer();
                defStatus = $q.defer();
                spyOn(NoteController, "getFullNoteById").and.returnValue(defNote.promise);
                spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue(defStatus.promise);

                vm = createNoteDetailVm();
                spyOn(vm, "gotoAnchor");
                vm.loadNote("b360cb6d-ca54-4b93-a564-a469274eb68a");

                let noteEntity: ap.models.notes.Note = new ap.models.notes.Note(Utility);
                noteEntity.createByJson(noteJSON);

                defNote.resolve(noteEntity);
                $rootScope.$apply();

                defStatus.resolve(noteProjectStatusList);
                $rootScope.$apply();
            })

            describe("WHEN not in edit mode and no status is selected ", () => {

                it("THEN the user cannot save the note", () => {
                    expect(vm.maySave).toBeFalsy();
                });
            });

            describe("WHEN in edit mode and no status is selected ", () => {

                it("THEN the user cannot save the note", () => {
                    vm.isEditMode = true;

                    expect(vm.maySave).toBeFalsy();
                });
            });
        });
    });

    describe("Feature: changeselectedTabOnScroll", () => {

        let defNoteStatus;

        beforeEach(() => {
            defNoteStatus = $q.defer();
            spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue(defNoteStatus.promise);

            vm = createNoteDetailVm(null, $location, $anchorScroll, $interval);
        });

        describe("WHEN changeselectedTabOnScroll is called with Comments", () => {
            it("THEN, the selectedTab is changed accordingly", () => {
                vm.changeselectedTabOnScroll("Comments");

                expect(vm.selectedTab).toBe(ap.viewmodels.notes.NoteDetailTabs["Comments"]);
            });
        });

        describe("WHEN changeselectedTabOnScroll is called just after gotoanchor", () => {
            it("THEN, the selected tab is not changed", () => {
                vm.selectedTab = ap.viewmodels.notes.NoteDetailTabs["History"];

                vm.changeselectedTabOnScroll("Comments");

                expect(vm.selectedTab).toBe(ap.viewmodels.notes.NoteDetailTabs["History"]);
            });
        });
    });

    describe("Feature: documentDeleted method", () => {
        let document: ap.models.documents.Document;
        let note: ap.models.notes.Note;
        let noteDetailVM: ap.viewmodels.notes.NoteDetailViewModel;

        beforeEach(() => {
            document = new ap.models.documents.Document(Utility);
            document.UploadedBy = new ap.models.actors.User(Utility);
            document.Author = new ap.models.actors.User(Utility);

            note = new ap.models.notes.Note(Utility);
            note.createByJson({
                Id: "BC372BF6-9A5E-4F26-A1A7 - 358D41150B65"
            });
            let notedocument = new ap.models.notes.NoteDocument(Utility);
            notedocument.createByJson({
                Id: "3"
            });

            let notedocument2 = new ap.models.notes.NoteDocument(Utility);
            notedocument2.createByJson({
                Id: "2"
            });
            notedocument2.Document = document;
            note.NoteDocuments = [];
            note.NoteDocuments.push(notedocument2);
            note.NoteDocuments.push(notedocument);

            specHelper.general.spyProperty(ap.viewmodels.notes.NoteDetailBaseViewModel.prototype, "noteBase", specHelper.PropertyAccessor.Get).and.returnValue(note);
            noteDetailVM = createNoteDetailVm();
        });

        afterEach(() => {
            specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteDetailBaseViewModel.prototype, "noteBase", specHelper.PropertyAccessor.Get);
        });

        describe("When documentDeleted event was fired from NoteController", () => {
            it("THEN the document will be removed from the list", () => {
                specHelper.general.raiseEvent(NoteController, "documentdeleted", note.NoteDocuments[0]);
                expect(noteDetailVM.noteBase.NoteDocuments.length).toEqual(1);
                expect(noteDetailVM.noteBase.NoteDocuments[0].Id).toEqual("3");
            });
        });
    });

    describe("Feature: clear", () => {
        let defNote: ng.IDeferred<any>;
        let defNoteStatus: ng.IDeferred<any>;
        let defNoteDocuments: ng.IDeferred<any>;
        let note: ap.models.notes.Note;
        beforeEach(() => {
            defNote = $q.defer();
            defNoteStatus = $q.defer();

            spyOn(NoteController, "getFullNoteById").and.returnValue(defNote.promise);

            spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue(defNoteStatus.promise);

            note = n;
            changeAllAccess(note, false);
            vm = createNoteDetailVm();
            spyOn(vm, "gotoAnchor");
            vm.loadNote("b360cb6d-ca54-4b93-a564-a469274eb68a");
        });
        describe("WHEN clear method was called ", () => {
            it("THEN the original entity and all fields will be reset", () => {
                $rootScope.$apply();
                vm.clear();
                expect(vm.note).toBeNull();
                expect(vm.status).toBeNull();
                expect(vm.subCell).toBeNull();
            });
        });
    });

    describe("Feature: cancelNewComment", () => {
        let noteDetailVM: ap.viewmodels.notes.NoteDetailViewModel;
        beforeEach(() => {
            noteDetailVM = createNoteDetailVm();
        });
        describe("WHEN the cancelNewComment is performed", () => {
            it("THEN, the newComment property will equal null", () => {
                noteDetailVM.cancelNewComment();
                expect(noteDetailVM.newComment).toBeNull();
            });
        });
    });

    describe("Feature: addNewComment", () => {
        let noteDetailVM: ap.viewmodels.notes.NoteDetailViewModel;
        beforeEach(() => {
            let myNewComment = "My new comment";
            noteDetailVM = createNoteDetailVm();
            noteDetailVM.newComment = myNewComment;
        });
        describe("WHEN the addNewComment is performed", () => {
            it("THEN, the saveComment will call", () => {
                let saveMethodSpy = spyOn(NoteController, "saveComment");
                noteDetailVM.addNewComment();
                expect(NoteController.saveComment).toHaveBeenCalled();
                expect(NoteController.saveComment).toHaveBeenCalled();
                expect(saveMethodSpy.calls.count()).toBe(1);
                expect(noteDetailVM.newComment).toBeNull();
                expect(<ap.models.notes.Note>saveMethodSpy.calls.argsFor(0)[1]).toBe(noteDetailVM.note);
            });
        });
        describe("WHEN the addNewComment is performed", () => {
            it("THEN, the saveComment will call", () => {
                let saveMethodSpy = spyOn(NoteController, "saveComment");
                noteDetailVM.addNewComment();
                expect(NoteController.saveComment).toHaveBeenCalled();
                expect(NoteController.saveComment).toHaveBeenCalled();
                expect(saveMethodSpy.calls.count()).toBe(1);
                expect(noteDetailVM.newComment).toBeNull();
                expect(<ap.models.notes.Note>saveMethodSpy.calls.argsFor(0)[1]).toBe(noteDetailVM.note);
            })
        });
    });
});