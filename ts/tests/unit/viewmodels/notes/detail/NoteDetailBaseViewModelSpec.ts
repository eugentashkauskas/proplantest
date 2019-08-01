describe("Module ap-viewmodels - NoteDetailBase", () => {
    let $rootScope: angular.IRootScopeService, $scope: angular.IScope;
    let Utility: ap.utility.UtilityHelper, UserContext: ap.utility.UserContext;
    let vm: NoteDetailVM;
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

    let fakeIds: string[];
    let fakeEntities: ap.models.Model[];

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
                    Date: new Date(),
                    Comment: "First comment of the point",
                    EntityVersion: 1
                },
                {
                    Id: "b8d13dfc-4124-4340-be59-fbc2b22db6a3",
                    IsRead: true,
                    IsFirst: false,
                    Date: new Date(),
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
        $rootScope.$apply();
        specHelper.general.spyProperty(ap.viewmodels.documents.DocumentViewModel.prototype, "noteWorkspaceVm", specHelper.PropertyAccessor.Get).and.returnValue(noteWorkspaceVm);
    }));

    beforeEach(() => {
        spyOn(ServicesManager.noteService, "getLinkedNotes").and.returnValue($q.defer().promise);
    });

    afterEach(() => {
        specHelper.general.offSpyProperty(ap.viewmodels.documents.DocumentViewModel.prototype, "noteWorkspaceVm", specHelper.PropertyAccessor.Get);
    });

    class NoteDetailVM extends ap.viewmodels.notes.NoteDetailBaseViewModel {
        public setNoteBase(note){
            super.setNoteBase(note);
        }
        constructor($utility: ap.utility.UtilityHelper, $mdDialog: angular.material.IDialogService, protected $q: angular.IQService, _api: ap.services.apiHelper.Api, protected $controllersManager: ap.controllers.ControllersManager, $servicesManager: ap.services.ServicesManager, noteId?: string,
            $location?: angular.ILocationService, $anchorScroll?: angular.IAnchorScrollService, $interval?: angular.IIntervalService) {
            super($utility, $mdDialog, $q, _api, $controllersManager, $servicesManager, noteId, $location, $anchorScroll, $interval);
        }
    }

    let createNoteDetailVm = (noteId?: string, location?: angular.ILocationService, anchorScroll?: angular.IAnchorScrollService, interval?: angular.IIntervalService) => {
        return new NoteDetailVM(Utility, $mdDialog, $q, Api, ControllersManager, ServicesManager, noteId, location, anchorScroll, interval);
    };

    describe("Constructor", () => {
        beforeEach(() => {
            vm = createNoteDetailVm();
            spyOn(vm, "gotoAnchor");
        });
        it("THEN, default values are correctly fill (access = false, isEditMode = false..)", () => {
            expect(vm.isSubcontractor).toBeFalsy();
            expect(vm.isEditMode).toBeFalsy();
            expect(vm.subject).toBe("");
            expect(vm.dueDate).toBeNull();
            expect(vm.dueDateFormatted).toBe("$None");
            expect(vm.category).toBe("$None");
            expect(vm.inCharge).toBe("$None");
            expect(vm.isUrgent).toBeFalsy();
            expect(vm.project).toBeNull();
            expect(vm.meeting).toBeNull();
            expect(vm.from).toBeNull();
            expect(vm.noteBase).toBeNull();
            expect(vm.allowedNewFileType).toEqual([]);
            expect(vm.noteInChargeList.count).toBe(0);
            expect(vm.noteDocumentList.count).toBe(0);
            expect(vm.noteCommentList.count).toBe(0);
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
            vm = createNoteDetailVm();
            spyOn(vm, "gotoAnchor");
        });

        describe("WHEN  VM call init with note is null", () => {
            beforeEach(() => {
                vm.setNoteBase(null);
            });
            it("THEN, the properties of the VM are filled in with default values ", () => {
                vm.copySource();
                expect(vm.subject).toBe("");
                expect(vm.dueDate).toBeNull();
                expect(vm.isUrgent).toBeFalsy();
                expect(vm.project).toBeNull();
                expect(vm.from).toBeNull();
                expect(vm.issueType).toBeNull();
                expect(vm.dueDateFormatted).toBe("$None");
                expect(vm.category).toBe("$None");
                expect(vm.inCharge).toBe("$None");
                expect(vm.meeting).toBeNull();
                expect(vm.noteInChargeList.count).toBe(0);
                expect(vm.noteDocumentList.count).toBe(0);
                expect(vm.noteCommentList.count).toBe(0);
            });
        });

        describe("WHEN VM call init with note have full info", () => {
            beforeEach(() => {
                vm.setNoteBase(note);
            });

            it("THEN, the properties of the VM are filled in with the received data", () => {
                expect(vm.noteBase.Id).toBe(note.Id);
                expect(vm.isEditMode).toBeFalsy();
                expect(vm.subject).toBe(note.Subject);
                expect(vm.dueDate).toBe(note.DueDate);
                expect(vm.isUrgent).toBe(note.IsUrgent);
                expect(vm.project).toBe(note.Project);

                expect(vm.from).toBe(note.From);
                expect(vm.issueType).toBe(note.IssueType);
                expect(vm.category).toBe(note.IssueType.ParentChapter.Description + " / " + note.IssueType.Description);

                expect(vm.meeting).toBe(note.Meeting);
            });
            it("THEN, the comment list is filled", () => {
                expect((<ap.viewmodels.notes.NoteCommentViewModel>vm.noteCommentList.getItemAtIndex(0)).noteComment).toBe(note.Comments[0]);
                expect((<ap.viewmodels.notes.NoteCommentViewModel>vm.noteCommentList.getItemAtIndex(1)).noteComment).toBe(note.Comments[1]);
            });
            it("THEN, the in charge user list is filled", () => {
                expect((<ap.viewmodels.notes.NoteInChargeViewModel>vm.noteInChargeList.getItemAtIndex(0)).noteInCharge).toBe(note.NoteInCharge[0]);
                expect((<ap.viewmodels.notes.NoteInChargeViewModel>vm.noteInChargeList.getItemAtIndex(1)).noteInCharge).toBe(note.NoteInCharge[1]);
            });
            it("THEN, the document list is filled", () => {
                expect((<ap.viewmodels.notes.NoteDocumentViewModel>vm.noteDocumentList.getItemAtIndex(0)).noteDocument).toBe(note.NoteDocuments[0]);
                expect((<ap.viewmodels.notes.NoteDocumentViewModel>vm.noteDocumentList.getItemAtIndex(1)).noteDocument).toBe(note.NoteDocuments[1]);
            });
            it("THEN, activity of the note is loaded", () => {
                defActivityIds.resolve(new ap.services.apiHelper.ApiResponse(["97cbaaf3-25c6-48ad-9055-aa26ca7dbeb0"]));

                defActivity.resolve(new ap.services.apiHelper.ApiResponse([{
                        Id: "97cbaaf3-25c6-48ad-9055-aa26ca7dbeb0",
                        ActivityType: ap.models.activities.ActivityType.Add,
                        User: { Id: "36", DisplayName: "John Doe" },
                        EntityName: "NoteProcessStatusHistory",
                        EntityCode: "456-987",
                        ParentEntityCode: "74874",
                        EntityDescription: "To Do"
                    }]));
                $rootScope.$apply();
                expect((<ap.viewmodels.activities.ActivityLogItemViewModel>vm.noteActivityList.listVm.getItemAtIndex(0)).activityType).toBe(ap.models.activities.ActivityType.Add);
            });
        });

        describe("WHEN VM call init with note have full info without IssueType", () => {

            beforeEach(() => {
                note.IssueType = undefined;
                vm.setNoteBase(note);
            });
            it("THEN, the category property of VM will be empty data AND there is no error thrown", () => {
                expect(vm.category).toBe("$None");
            });
        });

        describe("WHEN VM call init with note have full info without Meeting", () => {
            beforeEach(() => {
                note.Meeting = undefined;
                vm.setNoteBase(note);
            });
            it("THEN, the meeting property of VM will be empty data AND there is no error thrown", () => {
                expect(vm.meeting).toBeUndefined();
            });
        });
    });

    describe("Feature: Scroll to comments when a note is loaded", () => {
        let defNote: ng.IDeferred<any>;
        let note: ap.models.notes.Note;
        let $anchorScroll: any;

        beforeEach(() => {
            defNote = $q.defer();
            note = new ap.models.notes.Note(Utility);
            note.createByJson(n);
            $anchorScroll = jasmine.createSpy('anchorScroll');
            vm = createNoteDetailVm(null, $location, $anchorScroll, $interval);
        });
        describe("WHEN the user clicks on a tab to scroll and the location HASN'T changed", () => {
            it("THEN anchorScroll is called to scroll to the correct anchor", () => {
                spyOn($location, "hash").and.returnValue("anchortest");
                vm.gotoAnchor("test");

                expect($anchorScroll).toHaveBeenCalled();
            });
        });
        describe("WHEN the user clicks on a tab to scroll and the location HAS changed", () => {
            it("THEN anchorScroll is called to scroll to the correct anchor", () => {
                spyOn($location, "hash").and.returnValue("anchortest");
                vm.gotoAnchor("test222");

                expect($location.hash).toHaveBeenCalledWith("anchortest222");
            });
        });
    });

    describe("Feature: uploadDocuments", () => {
        let defNote: ng.IDeferred<any>;
        let note: ap.models.notes.Note;
        let files: File[];
        beforeEach(() => {
            defNote = $q.defer();
            spyOn(NoteController, "getFullNoteById").and.returnValue(defNote.promise);
            note = new ap.models.notes.Note(Utility);
            note.createByJson(noteJson);
            changeAllAccess(note, true);
            vm = createNoteDetailVm();
            vm.setNoteBase(note);
        });

        describe("WHEN the dropFile method is called", () => {
            it("THEN, the event filesdropped is raise with the list of files dropped", () => {
                let callback = jasmine.createSpy("callback");
                vm.on("filesdropped", callback, this);
                vm.dropFiles(files);
                expect(callback).toHaveBeenCalledWith(files);
            });
        });
    });

    describe("Feature: postChanges", () => {
        let note: ap.models.notes.Note;
        beforeEach(() => {
            note = new ap.models.notes.Note(Utility);
            vm = createNoteDetailVm("2");
            vm.setNoteBase(note);
            spyOn(vm, "gotoAnchor");
        });

        afterEach(() => {
            specHelper.general.offSpyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get);
        });
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
            it("THEN, the entity's subject are updated with the ViewModel's subject", () => {
                // expect
                expect(vm.noteBase.Subject).toBe("title");
            });
            it("THEN, the entity's subject are updated with the ViewModel's subject", () => {
                expect(vm.noteBase.DueDate).toBe(date);
            });
            it("THEN, the entity's DueDate are updated with the ViewModel's DueDate", () => {
                expect(vm.noteBase.DueDate).toBe(date);
            });
            it("THEN, the entity's Comments are updated with the ViewModel's Comments", () => {
                expect(vm.noteBase.Comments.length).toBe(2);
                expect(vm.noteBase.Comments[0].Comment).toBe("My first little comment");
            });
            it("THEN, the entity's NoteInCharge are updated with the ViewModel's NoteInCharge", () => {
                expect(vm.noteBase.NoteInCharge.length).toEqual(2);
                expect(vm.noteBase.NoteInCharge[0].Tag).toEqual(firstInCharge.Tag);
                expect(vm.noteBase.NoteInCharge[1].Tag).toEqual(secondInCharge.Tag);
            });
        });
        describe("WHEN the subject of the viewmodel is null and PostChanges is called", () => {
            it("THEN, the empty string is set to the Subject property of the entity when null", () => {
                vm.subject = null;
                vm.postChanges();

                expect(vm.noteBase.Subject).toBe("");
            });
        });
    });

    describe("Feature: documentDeleted method", () => {
        let document: ap.models.documents.Document;
        let note: ap.models.notes.Note;
        let noteDetailVM: ap.viewmodels.notes.NoteDetailBaseViewModel;

        beforeEach(() => {
            document = new ap.models.documents.Document(Utility);
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
        beforeEach(() => {
            vm = createNoteDetailVm();
            vm.clear();
        });
        describe("WHEN clear method was called ", () => {
            it("THEN the original entity is null", () => {
                $rootScope.$apply();
                vm.clear();
                expect(vm.noteBase).toBeNull();
                expect(vm.isSubcontractor).toBeFalsy();
                expect(vm.isEditMode).toBeFalsy();
                expect(vm.subject).toBe("");
                expect(vm.dueDate).toBeNull();
                expect(vm.dueDateFormatted).toBe("$None");
                expect(vm.category).toBe("$None");
                expect(vm.inCharge).toBe("$None");
                expect(vm.isUrgent).toBeFalsy();
                expect(vm.project).toBeNull();
                expect(vm.from).toBeNull();
                expect(vm.allowedNewFileType).toEqual([]);
                expect(vm.noteInChargeList.count).toBe(0);
                expect(vm.noteDocumentList.count).toBe(0);
                expect(vm.noteCommentList.count).toBe(0);
            });
        });
    });
});