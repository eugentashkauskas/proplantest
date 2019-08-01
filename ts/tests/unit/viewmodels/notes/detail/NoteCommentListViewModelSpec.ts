'use strict';
describe("Module ap-viewmodels - NoteCommentListViewModel", () => {
    let $rootScope: angular.IRootScopeService, $scope: angular.IScope;
    let Utility: ap.utility.UtilityHelper, UserContext: ap.utility.UserContext;
    let vm: ap.viewmodels.notes.NoteCommentListViewModel;
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
    let project: any;
    let date: Date;
    let meeting: any;
    let n: any;
    let currentProject: ap.models.projects.Project;

    let defActivity: ng.IDeferred<any>;
    let defActivityIds: ng.IDeferred<any>;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
        angular.mock.module("ap-services");
    });

    beforeEach(inject(function (_$rootScope_, _UserContext_, _Utility_, _NoteController_, _$q_, _MainController_, _DocumentController_, _NoteService_, _ProjectController_, _Api_, _ControllersManager_, _ServicesManager_) {
        Utility = _Utility_;
        UserContext = _UserContext_;
        NoteController = _NoteController_;
        DocumentController = _DocumentController_;
        ProjectController = _ProjectController_;
        $rootScope = _$rootScope_;
        $q = _$q_;
        Api = _Api_;
        MainController = _MainController_;
        NoteService = _NoteService_;
        ControllersManager = _ControllersManager_;
        ServicesManager = _ServicesManager_;
        $scope = $rootScope.$new();
        specHelper.utility.stubRootUrl(Utility);
        specHelper.userContext.stub(Utility);
        specHelper.utility.stubStorageSet(Utility);

        project = {};
        project.Name = "Welcome";
        project.UserAccessRight = new ap.models.accessRights.ProjectAccessRight(Utility);
        project.UserAccessRight.CanEdit = true;
        project.UserAccessRight.CanArchiveDoc = true;
        project.PhotoFolderId = "d660cb6d-ca54-4b93-a564-a46e874eb68a";
        date = new Date();
        date.setFullYear(2016);
        date.setMonth(2);
         
        meeting = {};
        meeting.Occurrence = 1;
        meeting.Title = "Sprint Review";

        n = {
            Id: "b360cb6d-ca54-4b93-a564-a469274eb68a",
            Subject: "Note 1",
            CodeNum: "1.01",
            IsUrgent: true,
            DueDate: new Date(2016, 2, 25),
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
                Name: "Status 1",
                Color: "111111"
            },
            Date: '/Date(1442565731890)/',
            Comments: [
                {
                    Id: "b8d13dfc-4124-4340-be59-fbc2b22db6a3",
                    IsRead: false,
                    IsFirst: true,
                    Comment: "First comment of the point",
                    IsArchived: false,
                    Date: '/Date(1442565731892)/'

                },
                {
                    Id: "459C9E80-9808-400C-96E6-C823AB16F07B",
                    IsRead: true,
                    IsFirst: false,
                    Comment: "Second comment of the point",
                    IsArchived: false,
                    Date: '/Date(1442565731891)/'
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
                Level: ap.models.accessRights.AccessRightLevel.Subcontractor
            }
        };

        currentProject = new ap.models.projects.Project(Utility);
        currentProject.createByJson({
            Id: "45152-56",
            Name: "test",
            UserAccessRight: {
                CanUploadDoc: true
            },
            PhotoFolderId: "45121004"
        });
        spyOn(MainController, "currentProject").and.callFake((val) => {
            if (val === undefined) {
                return currentProject;
            }
        });
    }));

    beforeEach(() => {
        defActivity = $q.defer();
        defActivityIds = $q.defer();

        spyOn(Api, "getApiResponse").and.callFake(function (url: string) {
            if (url.indexOf("rest/activitylogs") === 0)
                return defActivity.promise;
            if (url === "rest/activitylogsids")
                return defActivityIds.promise;
            if (url === "rest/activitylogsids")
            return null;
        });
        specHelper.general.spyProperty(ap.viewmodels.notes.NoteDocumentListViewModel.prototype, "isDisplayingPictureViewer", specHelper.PropertyAccessor.Get).and.returnValue(false);
    });

    beforeEach(() => {
        spyOn(ServicesManager.noteService, "getLinkedNotes").and.returnValue($q.defer().promise);
    });

    afterEach(() => {
        specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteDocumentListViewModel.prototype, "isDisplayingPictureViewer", specHelper.PropertyAccessor.Get);
    });

    let createNoteDetailVm = (noteId?: string, location?: angular.ILocationService, anchorScroll?: angular.IAnchorScrollService, interval?: angular.IIntervalService) => {
        return new ap.viewmodels.notes.NoteDetailViewModel(Utility, $mdDialog, $q, Api, ControllersManager, ServicesManager, noteId, location, anchorScroll, interval);
    };

    describe("Constructor", () => {
        describe("WHEN NoteCommentListViewModel is created without a Note", () => {
            it("THEN, default values are correctly fill AND the list is empty", () => {
                vm = new ap.viewmodels.notes.NoteCommentListViewModel(Utility, NoteController, MainController);

                expect(vm.entityName).toBe("NoteComment");
                expect(vm.defaultFilter).toBeNull();
                expect(vm.sortOrder).toBeNull();
                expect(vm.pathToLoad).toBeNull();
            });
        });

        describe("WHEN NoteCommentListViewModel is created with a Note", () => {
            it("THEN, default values are correctly fill AND note is filled with the given Note.Comments AND the note property of the commentsd doesn't have Comment to avoid circular reference", () => {
                let defNote: ng.IDeferred<any>;
                let defNoteStatus: ng.IDeferred<any>;

                defNote = $q.defer();
                defNoteStatus = $q.defer();

                spyOn(NoteController, "getFullNoteById").and.returnValue(defNote.promise);
                spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue(defNoteStatus.promise);

                let noteVm: ap.viewmodels.notes.NoteDetailViewModel = createNoteDetailVm();
                spyOn(noteVm, "gotoAnchor");
                noteVm.loadNote("b360cb6d-ca54-4b93-a564-a469274eb68a");

                let loadedNote = new ap.models.notes.Note(Utility);
                loadedNote.createByJson(n);
                defNote.resolve(loadedNote);
                $rootScope.$apply();

                vm = new ap.viewmodels.notes.NoteCommentListViewModel(Utility, NoteController, MainController, noteVm);

                expect(vm.entityName).toBe("NoteComment");
                expect(vm.defaultFilter).toBeNull();
                expect(vm.sortOrder).toBeNull();
                expect(vm.pathToLoad).toBeNull();

                expect(vm.count).toBe(2);

                expect(vm.firstComment.comment).toBe("First comment of the point");

                // check the note is not setted during the initCollection
                expect((<ap.viewmodels.notes.NoteCommentViewModel>vm.sourceItems[0]).noteComment.Note).toBeNull();
                expect((<ap.viewmodels.notes.NoteCommentViewModel>vm.sourceItems[1]).noteComment.Note).toBeNull();
            });
        });
    });

    describe("Feature: Archived comments", () => {
        let defNote: ng.IDeferred<any>;
        let defNoteStatus: ng.IDeferred<any>;
        let noteVm: ap.viewmodels.notes.NoteDetailViewModel;
        beforeEach(() => {
            n.Comments.push(
                {
                    Id: "B0CFCB41-77AB-49AC-9C4C-8515B8125F39",
                    IsRead: false,
                    IsFirst: true,
                    Comment: "First comment of the point",
                    IsArchived: true
                }
            );
            defNote = $q.defer();
            defNoteStatus = $q.defer();

            spyOn(NoteController, "getFullNoteById").and.returnValue(defNote.promise);
            spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue(defNoteStatus.promise);

            noteVm = createNoteDetailVm();
            spyOn(noteVm, "gotoAnchor");
            noteVm.loadNote("b360cb6d-ca54-4b93-a564-a469274eb68a");

            let loadedNote = new ap.models.notes.Note(Utility);
            loadedNote.createByJson(n);
            defNote.resolve(loadedNote);
            $rootScope.$apply();
        });
        describe("WHEN there are archived comments in the notes BUT isShowingArchive = FALSE", () => {
            
            it("THEN, the archived comments are not loaded in the ListViewModel", () => {
                vm = new ap.viewmodels.notes.NoteCommentListViewModel(Utility, NoteController, MainController, noteVm);

                expect(vm.isShowingArchive).toBeFalsy();
                expect(vm.count).toBe(2);
            });
        });

        describe("WHEN there are archived comments in the notes AND isShowingArchive = TRUE", () => {
            it("THEN, the archived comments are loaded in the ListViewModel", () => {
                vm = new ap.viewmodels.notes.NoteCommentListViewModel(Utility, NoteController, MainController, noteVm);
                vm.isShowingArchive = true;

                expect(vm.isShowingArchive).toBeTruthy();
                expect(vm.count).toBe(3);
            });
        });
    });

    describe("Feature: Empty list", () => {

        describe("WHEN the noteViewModel given through the constructor doesn't have a note", () => {
            it("THEN, the listViewModel is not populated", () => {
                let defNote: ng.IDeferred<any>;
                let defNoteStatus: ng.IDeferred<any>;

                defNote = $q.defer();
                defNoteStatus = $q.defer();

                spyOn(NoteController, "getFullNoteById").and.returnValue(defNote.promise);
                spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue(defNoteStatus.promise);

                let noteVm: ap.viewmodels.notes.NoteDetailViewModel = createNoteDetailVm();
                spyOn(noteVm, "gotoAnchor");
                noteVm.loadNote("b360cb6d-ca54-4b93-a564-a469274eb68a");

                defNote.resolve(undefined);
                $rootScope.$apply();

                vm = new ap.viewmodels.notes.NoteCommentListViewModel(Utility, NoteController, MainController, noteVm);

                expect(vm.count).toBe(0);
            });
        });
    });

    describe("Feature: PostChanges", () => {
        let vm: ap.viewmodels.notes.NoteCommentListViewModel;
        let n: ap.models.notes.Note;
        let noteVm: any;

        beforeEach(() => {
            n = new ap.models.notes.Note(Utility);
            noteVm = {
                noteBase: n
            };
            vm = new ap.viewmodels.notes.NoteCommentListViewModel(Utility, NoteController, MainController, <ap.viewmodels.notes.NoteDetailViewModel>noteVm);
        });

        describe("WHEN postChanges of the list is called with new comments", () => {
            it("THEN all the comments of the VM (not already in the Entity)  are copied to the entity", () => {
                let firstComment: ap.models.notes.NoteComment = new ap.models.notes.NoteComment(Utility);
                firstComment.IsFirst = true;
                firstComment.Comment = "My first little comment";
                let firstCommentVm = new ap.viewmodels.notes.NoteCommentViewModel(Utility, NoteController, MainController);
                firstCommentVm.init(firstComment);
                let comment: ap.models.notes.NoteComment = new ap.models.notes.NoteComment(Utility);
                comment.Comment = "My secoond comment";
                let commentVm = new ap.viewmodels.notes.NoteCommentViewModel(Utility, NoteController, MainController);
                commentVm.init(comment);
                vm.onLoadItems([firstCommentVm, commentVm]);

                expect(vm.count).toBe(2);
                expect((<ap.viewmodels.notes.NoteDetailViewModel>noteVm).noteBase.Comments).toBeNull();

                vm.postChanges();

                expect((<ap.viewmodels.notes.NoteDetailViewModel>noteVm).noteBase.Comments.length).toBe(2);
            });
        });

        describe("WHEN postChanges of the list is called with update comments", () => {
            it("THEN the comments of the entity are updated with the ones from the VM", () => {
                n = new ap.models.notes.Note(Utility);

                let firstComment: ap.models.notes.NoteComment = new ap.models.notes.NoteComment(Utility);
                firstComment.IsFirst = true;
                firstComment.Comment = "My first little comment";
                n.Comments = [];
                n.Comments.push(firstComment);
                noteVm = {
                    noteBase: n
                };
                vm.noteViewModel = noteVm;

                vm.firstComment.comment = "description updated";

                vm.postChanges();

                expect((<ap.viewmodels.notes.NoteDetailViewModel>noteVm).noteBase.Comments.length).toBe(1);
                expect((<ap.viewmodels.notes.NoteDetailViewModel>noteVm).noteBase.Comments[0].Comment).toBe("description updated");
                expect((<ap.viewmodels.notes.NoteDetailViewModel>noteVm).noteBase.Comments[0].Note).toBeNull();
            });
        });
    });

    describe("Feature: _onCommentArchived method", () => {
        describe("When commentarchived event was fired from NoteController and isShowingArchive = false ", () => {
            it("THEN the archived comment will be removed from the list", () => {
                n.Comments = [
                    {
                        Id: "b8d13dfc-4124-4340-be59-fbc2b22db6a3",
                        IsRead: false,
                        IsFirst: true,
                        Comment: "First comment of the point",
                        IsArchived: false,
                        Date: '/Date(1442565731893)/'
                    },
                    {
                        Id: "459C9E80-9808-400C-96E6-C823AB16F07B",
                        IsRead: true,
                        IsFirst: false,
                        Comment: "Second comment of the point",
                        IsArchived: false,
                        Date: '/Date(1442565731892)/'
                    },
                    {
                        Id: "3",
                        IsRead: false,
                        IsFirst: false,
                        Comment: "First comment of the point",
                        IsArchived: false,
                        Date: '/Date(1442565731891)/'
                    }
                ];

                
                let defNote: ng.IDeferred<any>;
                let defNoteStatus: ng.IDeferred<any>;

                defNote = $q.defer();
                defNoteStatus = $q.defer();

                spyOn(NoteController, "getFullNoteById").and.returnValue(defNote.promise);
                spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue(defNoteStatus.promise);

                let noteVm: ap.viewmodels.notes.NoteDetailViewModel = createNoteDetailVm();
                spyOn(noteVm, "gotoAnchor");
                noteVm.loadNote("b360cb6d-ca54-4b93-a564-a469274eb68a");

                let loadedNote = new ap.models.notes.Note(Utility);
                loadedNote.createByJson(n);
                defNote.resolve(loadedNote);
                $rootScope.$apply();

                vm = new ap.viewmodels.notes.NoteCommentListViewModel(Utility, NoteController, MainController, noteVm);

                vm.isShowingArchive = false;

                let commentUpdated: ap.models.notes.NoteComment = new ap.models.notes.NoteComment(Utility);
                commentUpdated.createByJson({ Id: "3", EntityVersion: 2, IsArchived: true });

                specHelper.general.raiseEvent(NoteController, "commentarchived", commentUpdated);

                $rootScope.$apply();

                expect(vm.count).toEqual(2);

            });
        });
        describe("When commentarchived event was fired from NoteController and isShowingArchive = true ", () => {
            it("THEN the archived comment will not be removed from the list", () => {
                n.Comments = [
                    {
                        Id: "b8d13dfc-4124-4340-be59-fbc2b22db6a3",
                        IsRead: false,
                        IsFirst: true,
                        Comment: "First comment of the point",
                        IsArchived: false,
                        Date: '/Date(1442565731893)/'
                    },
                    {
                        Id: "459C9E80-9808-400C-96E6-C823AB16F07B",
                        IsRead: true,
                        IsFirst: false,
                        Comment: "Second comment of the point",
                        IsArchived: false,
                        Date: '/Date(1442565731892)/'
                    },
                    {
                        Id: "3",
                        IsRead: false,
                        IsFirst: false,
                        Comment: "First comment of the point",
                        IsArchived: false,
                        Date: '/Date(1442565731891)/'
                    }
                ];

                let defNote: ng.IDeferred<any>;
                let defNoteStatus: ng.IDeferred<any>;

                defNote = $q.defer();
                defNoteStatus = $q.defer();

                spyOn(NoteController, "getFullNoteById").and.returnValue(defNote.promise);
                spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue(defNoteStatus.promise);

                let noteVm: ap.viewmodels.notes.NoteDetailViewModel = createNoteDetailVm();
                spyOn(noteVm, "gotoAnchor");
                noteVm.loadNote("b360cb6d-ca54-4b93-a564-a469274eb68a");

                let loadedNote = new ap.models.notes.Note(Utility);
                loadedNote.createByJson(n);
                defNote.resolve(loadedNote);
                $rootScope.$apply();

                vm = new ap.viewmodels.notes.NoteCommentListViewModel(Utility, NoteController, MainController, noteVm);

                vm.isShowingArchive = true;

                let commentUpdated: ap.models.notes.NoteComment = new ap.models.notes.NoteComment(Utility);
                commentUpdated.createByJson({ Id: "3", EntityVersion: 2, IsArchived: true });

                specHelper.general.raiseEvent(NoteController, "commentarchived", commentUpdated);

                $rootScope.$apply();

                expect(vm.count).toEqual(3);
            });
        });
    });

    describe("Feature: dispose method", () => {
       
        describe("When dispose method was called ", () => {
            it("THEN _noteController.off and the dispoese method of NoteCommentViewModel will be called", () => {
                n.Comments = [
                    {
                        Id: "b8d13dfc-4124-4340-be59-fbc2b22db6a3",
                        IsRead: false,
                        IsFirst: true,
                        Comment: "First comment of the point",
                        IsArchived: false,
                        Date: '/Date(1442565731893)/'
                    },
                    {
                        Id: "459C9E80-9808-400C-96E6-C823AB16F07B",
                        IsRead: true,
                        IsFirst: false,
                        Comment: "Second comment of the point",
                        IsArchived: false,
                        Date: '/Date(1442565731892)/'
                    },
                    {
                        Id: "3",
                        IsRead: false,
                        IsFirst: false,
                        Comment: "First comment of the point",
                        IsArchived: false,
                        Date: '/Date(1442565731891)/'
                    }
                ];

                let defNote: ng.IDeferred<any>;
                let defNoteStatus: ng.IDeferred<any>;

                defNote = $q.defer();
                defNoteStatus = $q.defer();

                spyOn(NoteController, "getFullNoteById").and.returnValue(defNote.promise);
                spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue(defNoteStatus.promise);

                let noteVm: ap.viewmodels.notes.NoteDetailViewModel = createNoteDetailVm();
                spyOn(noteVm, "gotoAnchor");
                noteVm.loadNote("b360cb6d-ca54-4b93-a564-a469274eb68a");

                let loadedNote = new ap.models.notes.Note(Utility);
                loadedNote.createByJson(n);
                defNote.resolve(loadedNote);
                $rootScope.$apply();

                vm = new ap.viewmodels.notes.NoteCommentListViewModel(Utility, NoteController, MainController, noteVm);

                vm.isShowingArchive = true;

                $rootScope.$apply();

                spyOn(NoteController, "off");
                spyOn(ap.viewmodels.notes.NoteCommentViewModel.prototype, "dispose");

                vm.dispose();

                $rootScope.$apply();

                expect(NoteController.off).toHaveBeenCalled();
                expect(ap.viewmodels.notes.NoteCommentViewModel.prototype.dispose).toHaveBeenCalled();
            });
        }); 
    });

    describe("Feature: haschanged method", () => {
        let vm: ap.viewmodels.notes.NoteCommentListViewModel;
        let noteVm: ap.viewmodels.notes.NoteDetailViewModel;

        beforeEach(() => {
           
            n.Comments = [
                {
                    Id: "b8d13dfc-4124-4340-be59-fbc2b22db6a3",
                    IsRead: false,
                    IsFirst: true,
                    Comment: "First comment of the point",
                    IsArchived: false,
                    Date: '/Date(1442565731892)/'
                },
                {
                    Id: "e01f3044-7d04-4d99-a82f-480825ca77b7",
                    IsRead: true,
                    IsFirst: false,
                    Comment: "Second comment of the point",
                    IsArchived: false,
                    Date: '/Date(1442565731891)/'
                },
                {
                    Id: "3",
                    IsRead: false,
                    IsFirst: false,
                    Comment: "Third comment of the point",
                    IsArchived: false,
                    Date: '/Date(1442565731890)/'
                }
            ];

            let defNote: ng.IDeferred<any>;
            let defNoteStatus: ng.IDeferred<any>;

            defNote = $q.defer();
            defNoteStatus = $q.defer();

            spyOn(NoteController, "getFullNoteById").and.returnValue(defNote.promise);
            spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue(defNoteStatus.promise);

            noteVm = createNoteDetailVm();
            spyOn(noteVm, "gotoAnchor");
            noteVm.loadNote("b360cb6d-ca54-4b93-a564-a469274eb68a");

            let loadedNote = new ap.models.notes.Note(Utility);
            loadedNote.createByJson(n);
            defNote.resolve(loadedNote);
            $rootScope.$apply();

            vm = new ap.viewmodels.notes.NoteCommentListViewModel(Utility, NoteController, MainController, noteVm);

            $rootScope.$apply();
        });
        
        describe("WHEN nothing is done, ", () => {

            it("THEN haschanged is false", () => {
                expect(vm.hasChanged).toBeFalsy();
            });
        });

        describe("WHEN a comment is changed, ", () => {

            it("THEN haschanged is true", () => {
                (<ap.viewmodels.notes.NoteCommentViewModel>vm.sourceItems[0]).comment = "New comment";              
                expect(vm.hasChanged).toBeTruthy();
            });
        });

        describe("WHEN a comment is added, ", () => {
            it("THEN haschanged is true", () => {
                let fourthcomment: ap.models.notes.NoteComment = new ap.models.notes.NoteComment(Utility);
                fourthcomment.Comment = "Fourth comment";
                let fourthCommentVm = new ap.viewmodels.notes.NoteCommentViewModel(Utility, NoteController, MainController);
                fourthCommentVm.init(fourthcomment);
                
                vm.onLoadItems([vm.sourceItems[0], vm.sourceItems[1], vm.sourceItems[2], fourthCommentVm]);

                expect(vm.count).toBe(4);
                expect(vm.hasChanged).toBeTruthy();
            });
        });

        describe("WHEN a comment is removed, ", () => {
            it("THEN haschanged is true", () => {
                vm.onLoadItems([vm.sourceItems[0], vm.sourceItems[1]]);

                expect(vm.count).toBe(2);
                expect(vm.hasChanged).toBeTruthy();
            });
        });

        describe("WHEN a comment has changed and postchange is called", () => {

            it("THEN haschanged is false", () => {
                (<ap.viewmodels.notes.NoteCommentViewModel>vm.sourceItems[0]).comment = "New comment";
                vm.postChanges();
                expect(vm.hasChanged).toBeFalsy();
            });
        });

        describe("WHEN a comment is added and postchange is called", () => {

            it("THEN haschanged is false", () => {
                let fourthcomment: ap.models.notes.NoteComment = new ap.models.notes.NoteComment(Utility);
                fourthcomment.Comment = "Fourth comment";
                let fourthCommentVm = new ap.viewmodels.notes.NoteCommentViewModel(Utility, NoteController, MainController);
                fourthCommentVm.init(fourthcomment);
                vm.onLoadItems([vm.sourceItems[0], vm.sourceItems[1], vm.sourceItems[2], fourthCommentVm]);

                expect(vm.count).toBe(4);
                expect(vm.hasChanged).toBeTruthy();

                vm.postChanges();

                expect(vm.hasChanged).toBeFalsy();
            });
        });

        describe("WHEN a comment is removed and postchange is called", () => {

            it("THEN haschanged is false", () => {
                vm.onLoadItems([vm.sourceItems[0], vm.sourceItems[1]]);

                expect(vm.count).toBe(2);
                expect(vm.hasChanged).toBeTruthy();

                vm.postChanges();

                expect(vm.hasChanged).toBeFalsy();
            });
        });
    });

    describe("Feature: needShowArchived feature", () => {
        let vm: ap.viewmodels.notes.NoteCommentListViewModel;
        let noteVm: ap.viewmodels.notes.NoteDetailViewModel;
        let loadedNote: ap.models.notes.Note;
        beforeEach(() => {

            let comment1: ap.models.notes.NoteComment = new ap.models.notes.NoteComment(Utility);
            comment1.createByJson({
                Id: "b8d13dfc-4124-4340-be59-fbc2b22db6a3",
                IsRead: false,
                IsFirst: true,
                Comment: "First comment of the point",
                IsArchived: false,
                Date: '/Date(1442565731892)/',
                Deleted: false
            });

            let comment2: ap.models.notes.NoteComment = new ap.models.notes.NoteComment(Utility);
            comment2.createByJson({
                Id: "e01f3044-7d04-4d99-a82f-480825ca77b7",
                IsRead: true,
                IsFirst: false,
                Comment: "Second comment of the point",
                IsArchived: false,
                Date: '/Date(1442565731891)/',
                Deleted: false
            });

            let comment3: ap.models.notes.NoteComment = new ap.models.notes.NoteComment(Utility);
            comment3.createByJson({
                Id: "3",
                IsRead: false,
                IsFirst: false,
                Comment: "Third comment of the point",
                IsArchived: false,
                Date: '/Date(1442565731890)/',
                Deleted: false
            });

            n.Comments = [comment1, comment2, comment3];

            let defNote: ng.IDeferred<any>;
            let defNoteStatus: ng.IDeferred<any>;

            defNote = $q.defer();
            defNoteStatus = $q.defer();

            spyOn(NoteController, "getFullNoteById").and.returnValue(defNote.promise);
            spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue(defNoteStatus.promise);

            noteVm = createNoteDetailVm();
            spyOn(noteVm, "gotoAnchor");
            noteVm.loadNote("b360cb6d-ca54-4b93-a564-a469274eb68a");

            loadedNote = new ap.models.notes.Note(Utility);
            loadedNote.createByJson(n);
            defNote.resolve(loadedNote);
            $rootScope.$apply();
        });

        describe("WHEN collection is initialized  AND there are no archived comment ", () => {
            beforeEach(() => {
                vm = new ap.viewmodels.notes.NoteCommentListViewModel(Utility, NoteController, MainController, noteVm);

                $rootScope.$apply();
            });

            it("THEN needShowArchived is false", () => {
                expect(vm.needShowArchive).toBeFalsy();
            });

            describe("WHEN a comment is archived", () => {

                beforeEach(() => {
                    loadedNote.Comments[2].IsArchived = true;
                    specHelper.general.raiseEvent(NoteController, "commentarchived", n.Comments[2]);
                });

                it("THEN needShowArchived is true", () => {
                    expect(vm.needShowArchive).toBeTruthy();
                });
            });
        });

        describe("WHEN collection is initialized  AND there are archived comments ", () => {
            beforeEach(() => {
                noteVm.note.Comments[2].IsArchived = true;

                vm = new ap.viewmodels.notes.NoteCommentListViewModel(Utility, NoteController, MainController, noteVm);

                $rootScope.$apply();
            });

            it("THEN needShowArchived is true", () => {
                expect(vm.needShowArchive).toBeTruthy();

            });

            describe("WHEN the archived comment is unarchived", () => {
                beforeEach(() => {
                    loadedNote.Comments[2].IsArchived = false;
                    specHelper.general.raiseEvent(NoteController, "commentunarchived", n.Comments[2]);
                });

                it("THEN needShowArchived is false", () => {
                    expect(vm.needShowArchive).toBeFalsy();
                });
            });

            describe("WHEN the archived comment is deleted", () => {
                beforeEach(() => {
                    let nd = loadedNote.Comments[2];
                    loadedNote.Comments.splice(2, 1);
                    specHelper.general.raiseEvent(NoteController, "commentdeleted", nd);
                });

                it("THEN needShowArchived is false", () => {
                    expect(vm.needShowArchive).toBeFalsy();
                });
            });
        });
    });

    describe("Feature: editcommentrequested", () => {
        describe("WHEN the item fire the event 'editcommentrequested'", () => {
            it("THEN, the event 'editcommentrequested' will be fire from the VM", () => {
                n.Comments = [
                    {
                        Id: "b8d13dfc-4124-4340-be59-fbc2b22db6a3",
                        IsRead: false,
                        IsFirst: true,
                        Comment: "First comment of the point",
                        IsArchived: false,
                        Date: '/Date(1442565731892)/'
                    },
                    {
                        Id: "459C9E80-9808-400C-96E6-C823AB16F07B",
                        IsRead: true,
                        IsFirst: false,
                        Comment: "Second comment of the point",
                        IsArchived: false,
                        Date: '/Date(1442565731891)/'
                    },
                    {
                        Id: "3",
                        IsRead: false,
                        IsFirst: false,
                        Comment: "First comment of the point",
                        IsArchived: false,
                        Date: '/Date(1442565731890)/'
                    }
                ];

                let defNote: ng.IDeferred<any>;
                let defNoteStatus: ng.IDeferred<any>;

                defNote = $q.defer();
                defNoteStatus = $q.defer();

                spyOn(NoteController, "getFullNoteById").and.returnValue(defNote.promise);
                spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue(defNoteStatus.promise);

                let noteVm: ap.viewmodels.notes.NoteDetailViewModel = createNoteDetailVm();
                spyOn(noteVm, "gotoAnchor");
                noteVm.loadNote("b360cb6d-ca54-4b93-a564-a469274eb68a");

                let loadedNote = new ap.models.notes.Note(Utility);
                loadedNote.createByJson(n);
                defNote.resolve(loadedNote);
                $rootScope.$apply();

                vm = new ap.viewmodels.notes.NoteCommentListViewModel(Utility, NoteController, MainController, noteVm);

                $rootScope.$apply();

                let callback = jasmine.createSpy("callback");

                vm.on("editcommentrequested", function () {
                    callback();
                }, this);
                specHelper.general.raiseEvent(vm.sourceItems[0], "editcommentrequested", vm.sourceItems[0]);

                expect(callback).toHaveBeenCalled();
            });
        });
    });
});