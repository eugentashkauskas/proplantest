xdescribe("Module ap-viewmodels - NoteDocumentListViewModel", () => {

    let $rootScope: angular.IRootScopeService, $scope: angular.IScope;
    let Utility: ap.utility.UtilityHelper, UserContext: ap.utility.UserContext;
    let vm: ap.viewmodels.notes.NoteDocumentListViewModel;
    let NoteController: ap.controllers.NoteController;
    let DocumentController: ap.controllers.DocumentController;
    let ProjectController: ap.controllers.ProjectController;
    let NoteService: ap.services.NoteService;
    let $mdDialog: angular.material.IDialogService;
    let $q: angular.IQService;
    let Api: ap.services.apiHelper.Api;
    let MainController: ap.controllers.MainController;
    let ControllersManager: ap.controllers.ControllersManager;
    let ServicesManager: ap.services.ServicesManager;
    let $mdSidenav;
    let $timeout: angular.ITimeoutService;
    let project: any = {};
    project.Name = "Welcome";
    project.UserAccessRight = new ap.models.accessRights.ProjectAccessRight(Utility);
    project.UserAccessRight.CanEdit = true;
    project.UserAccessRight.CanArchiveDoc = true;
    project.PhotoFolderId = "d660cb6d-ca54-4b93-a564-a46e874eb68a";
    let date = new Date();
    date.setFullYear(2016);
    date.setMonth(2);
    let meeting: any = {
        Id: "test-meeting-id",
        Occurrence: 1,
        Title: "Sprint Review"
    };
    let n: any = {
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
                Id: "b8d13dfc-4124-4340-be59-fbc2b22db6a3",
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
        NoteDocuments: [
            {
                Drawings: [
                    {
                        Scale: 0,
                        RenderCenterX: 0,
                        RenderCenterY: 0,
                        PageIndex: 0
                    }
                ],
                Document: {
                    Author: new ap.models.actors.User(Utility),
                    VersionCount: 0
                }
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

    let doc: ap.models.documents.Document;

    let defActivity: ng.IDeferred<any>;
    let defActivityIds, defMeetingAccessRigts: ng.IDeferred<any>;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
        angular.mock.module(function ($provide) {
            $provide.factory('$mdDialog', ["$q", function ($q) {
                return specHelper.utility.stubShowMdDialog($q);
            }]);
        });
        let $window = specHelper.createWindowStub();
        $window.navigator.userLanguage = undefined;
        $window.navigator.language = 'en_US';
        angular.mock.module(function ($provide) {
            $provide.value('$window', $window);
            $mdSidenav = specHelper.utility.stubToggleMdSideNav($provide);
        });
        
    });

    beforeEach(inject(function (_$rootScope_, _UserContext_, _Utility_, _$timeout_, _NoteController_, _$q_, _MainController_, _DocumentController_, _NoteService_, _$mdDialog_, _ProjectController_, _Api_, _ControllersManager_, _ServicesManager_) {
        Utility = _Utility_;
        UserContext = _UserContext_;
        NoteController = _NoteController_;
        NoteService = _NoteService_;
        ProjectController = _ProjectController_;
        $mdDialog = _$mdDialog_;
        DocumentController = _DocumentController_;
        ControllersManager = _ControllersManager_;
        ServicesManager = _ServicesManager_;
        $rootScope = _$rootScope_;
        $q = _$q_;
        Api = _Api_;
        $timeout = _$timeout_;
        MainController = _MainController_;
        $scope = $rootScope.$new();
        specHelper.utility.stubRootUrl(Utility);
        specHelper.userContext.stub(Utility);
        specHelper.utility.stubStorageSet(Utility);

        defActivity = $q.defer();
        defActivityIds = $q.defer();
        defMeetingAccessRigts = $q.defer();
        spyOn(Api, "getApiResponse").and.callFake(function (url: string) {
            if (url.indexOf("rest/activitylogs") === 0)
                return defActivity.promise;
            if (url === "rest/activitylogsids")
                return defActivityIds.promise;
            if (url.indexOf("rest/accessrights") === 0)
                return defMeetingAccessRigts.promise;
            return null;
        });

        doc = new ap.models.documents.Document(Utility);
        doc.UploadedBy = new ap.models.actors.User(Utility);
        doc.Author = new ap.models.actors.User(Utility);

        spyOn(MainController, "currentProject").and.returnValue(project);

        let noteWorkspaceVm: ap.viewmodels.notes.NoteWorkspaceViewModel;
        noteWorkspaceVm = new ap.viewmodels.notes.NoteWorkspaceViewModel($scope, $mdSidenav, Utility, Api, $q, $mdDialog, $timeout, null, null, null, ControllersManager, ServicesManager, null, false);
        defMeetingAccessRigts.resolve(new ap.services.apiHelper.ApiResponse(n.MeetingAccessRight));

        spyOn(noteWorkspaceVm.noteListVm.listVm, "getEntityById").and.returnValue({ hasAttachment: false });
        specHelper.general.spyProperty(ap.viewmodels.documents.DocumentViewModel.prototype, "noteWorkspaceVm", specHelper.PropertyAccessor.Get).and.returnValue(noteWorkspaceVm);
    }));

    beforeEach(() => {
        spyOn(ServicesManager.noteService, "getLinkedNotes").and.returnValue($q.defer().promise);
    });

    afterEach(() => {
        specHelper.general.offSpyProperty(ap.viewmodels.documents.DocumentViewModel.prototype, "noteWorkspaceVm", specHelper.PropertyAccessor.Get);
    });

    let createVm = (noteVm?: ap.viewmodels.notes.NoteDetailViewModel) => {
        return new ap.viewmodels.notes.NoteDocumentListViewModel(Utility, $q, ControllersManager, ServicesManager, $mdDialog, noteVm);
    };

    describe("Constructor", () => {
        beforeEach(() => {
            specHelper.general.spyProperty(ap.viewmodels.notes.NoteDocumentListViewModel.prototype, "isDisplayingPictureViewer", specHelper.PropertyAccessor.Get).and.returnValue(false);
        });
        afterEach(() => {
            specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteDocumentListViewModel.prototype, "isDisplayingPictureViewer", specHelper.PropertyAccessor.Get);
        });
        describe("WHEN NoteDocumentListViewModel is created without a NoteViewModel", () => {
            it("THEN, default values are correctly fill AND the list is empty", () => {
                vm = createVm();

                expect(vm.entityName).toBe("NoteDocument");
                expect(vm.defaultFilter).toBeNull();
                expect(vm.sortOrder).toBeNull();
                expect(vm.pathToLoad).toBeNull();
                expect(vm.sourceItems.length).toBe(0);
            });
        });

        describe("WHEN NoteDocumentListViewModel is created with a Note AND there are uninvited NoteInCharge users", () => {
            it("THEN, default values are correctly fill AND hasUninvitedContactOnProject = true", () => {
                let defNote: ng.IDeferred<any>;
                let defNoteStatus: ng.IDeferred<any>;

                defNote = $q.defer();
                defNoteStatus = $q.defer();

                spyOn(NoteController, "getFullNoteById").and.returnValue(defNote.promise);
                spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue(defNoteStatus.promise);

                let noteVm: ap.viewmodels.notes.NoteDetailViewModel = new ap.viewmodels.notes.NoteDetailViewModel(Utility, $mdDialog, $q, Api, ControllersManager, ServicesManager);
                spyOn(noteVm, "gotoAnchor");
                noteVm.loadNote("b360cb6d-ca54-4b93-a564-a469274eb68a");

                let fullNote = new ap.models.notes.Note(Utility);
                fullNote.createByJson(n);
                defNote.resolve(fullNote);
                $rootScope.$apply();

                vm = createVm(noteVm);

                expect(vm.entityName).toBe("NoteDocument");
                expect(vm.defaultFilter).toBeNull();
                expect(vm.sortOrder).toBeNull();
                expect(vm.pathToLoad).toBeNull();

                expect(vm.sourceItems.length).toBe(1);
            });
        });
    });

    describe("Feature nbUnprocessedDocument", () => {
        let noteDetailVM: ap.viewmodels.notes.NoteDetailViewModel;
        let noteDocumentListVM: ap.viewmodels.notes.NoteDocumentListViewModel;

        beforeEach(() => {
            spyOn(NoteController, "getFullNoteById").and.returnValue($q.defer().promise);
            spyOn(DocumentController, "registerDocumentStatusRefresh").and.returnValue(true);
            specHelper.general.spyProperty(ap.viewmodels.notes.NoteDocumentListViewModel.prototype, "isDisplayingPictureViewer", specHelper.PropertyAccessor.Get).and.returnValue(false);
            noteDetailVM = new ap.viewmodels.notes.NoteDetailViewModel(Utility, $mdDialog, $q, Api, ControllersManager, ServicesManager, "b360cb6d-ca54-4b93-a564-a469274eb68a");
        });

        afterEach(() => {
            specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteDocumentListViewModel.prototype, "isDisplayingPictureViewer", specHelper.PropertyAccessor.Get);
        });

        describe("WHEN the list view model is created and is not yet initialized with a parent notedetail viewmodel", () => {
            it("THEN, the nbUnprocessedDocument equals 0", () => {
                noteDocumentListVM = createVm();
                expect(noteDocumentListVM.nbUnprocessedDocument).toBe(0);
            });
        });

        describe("WHEN the list view model is created and the note detail contains 1 note document processed and 2 not processed", () => {
            let note: ap.models.notes.Note;
            let uploader: ap.models.actors.User;

            beforeEach(() => {
                uploader = new ap.models.actors.User(Utility);

                note = new ap.models.notes.Note(Utility);
                note.createByJson({
                    Id: "BC372BF6-9A5E-4F26-A1A7 - 358D41150B65",
                    NoteDocuments: [
                        {
                            Id: "1",
                            Document: {
                                Id: "1",
                                Status: ap.models.documents.DocumentStatus.NotUploaded,
                                VersionCount: 0,
                                PageCount: 1,
                                Author: uploader.toJSON()
                            }
                        },
                        {
                            Id: "2",
                            Document: {
                                Id: "2",
                                Status: ap.models.documents.DocumentStatus.Processed,
                                VersionCount: 0,
                                PageCount: 1,
                                Author: uploader.toJSON()
                            }
                        },
                        {
                            Id: "3",
                            Document: {
                                Id: "3",
                                Status: ap.models.documents.DocumentStatus.Uploaded,
                                VersionCount: 0,
                                PageCount: 1,
                                Author: uploader.toJSON()
                            }
                        }
                    ]
                });
                specHelper.general.spyProperty(ap.viewmodels.notes.NoteDetailBaseViewModel.prototype, "noteBase", specHelper.PropertyAccessor.Get).and.returnValue(note);
            });

            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteDetailBaseViewModel.prototype, "noteBase", specHelper.PropertyAccessor.Get);
            });

            it("THEN, nbUnprocessedDocument equals 2", () => {
                noteDocumentListVM = createVm(noteDetailVM);
                expect(noteDocumentListVM.nbUnprocessedDocument).toBe(2);
            });

            it("WHEN one of them is processed while user working, THEN, the number decreases to 1", () => {
                let deferFullDoc = $q.defer();
                spyOn(DocumentController, "getFullDocumentById").and.returnValue(deferFullDoc.promise)
                let document = new ap.models.documents.Document(Utility);
                document.createByJson({
                    Id: "3"
                });
                document.Author = new ap.models.actors.User(Utility);
                document.Status = ap.models.documents.DocumentStatus.Processed;
                noteDocumentListVM = createVm(noteDetailVM);
                deferFullDoc.resolve(document);
                specHelper.general.raiseEvent(DocumentController, "documentstatusrefreshed", document);
                $rootScope.$apply();
                expect(noteDocumentListVM.nbUnprocessedDocument).toBe(1);
            });

            it("WHEN new document is uploaded, then the number increases to 3", () => {
                let deferFullDoc = $q.defer();
                spyOn(DocumentController, "getFullDocumentById").and.returnValue(deferFullDoc.promise)
                noteDocumentListVM = createVm(noteDetailVM);
                let document = new ap.models.documents.Document(Utility);
                document.Status = ap.models.documents.DocumentStatus.Uploaded;
                document.Author = new ap.models.actors.User(Utility);
                document.UploadedBy = new ap.models.actors.User(Utility);

                deferFullDoc.resolve(document);


                let noteDocument = new ap.models.notes.NoteDocument(Utility);
                noteDocument.createByJson({
                    Id: "4",
                    Note: {
                        Id: note.Id
                    }
                });
                noteDocument.Document = document;
                $rootScope.$apply();
                specHelper.general.raiseEvent(NoteController, "notedocumentuploaded", noteDocument);
                expect(noteDocumentListVM.nbUnprocessedDocument).toBe(3);
            });
        });
    });

    describe("Feature: noteDocumentUploadedHandler", () => {

        describe("WHEN notedocumentuploaded is raised from NoteController", () => {

            let noteDetailVM: ap.viewmodels.notes.NoteDetailViewModel;
            let defNote: ng.IDeferred<any>;
            let defStatus: ng.IDeferred<any>;

            beforeEach(() => {
                defNote = $q.defer();
                defStatus = $q.defer();
                spyOn(NoteController, "getFullNoteById").and.returnValue(defNote.promise);
                spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue(defStatus.promise);
                specHelper.general.spyProperty(ap.viewmodels.notes.NoteDocumentListViewModel.prototype, "isDisplayingPictureViewer", specHelper.PropertyAccessor.Get).and.returnValue(false);
                noteDetailVM = new ap.viewmodels.notes.NoteDetailViewModel(Utility, $mdDialog, $q, Api, ControllersManager, ServicesManager);
                spyOn(noteDetailVM, "gotoAnchor");
                noteDetailVM.loadNote("b360cb6d-ca54-4b93-a564-a469274eb68a");
            });

            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteDocumentListViewModel.prototype, "isDisplayingPictureViewer", specHelper.PropertyAccessor.Get);
            });

            it("THEN if the noteDocument.note.Id is equal to the loaded note in NoteDetail, it's pushed in the noteDocumentList of NoteDetail", () => {
                let note: ap.models.notes.Note = new ap.models.notes.Note(Utility);
                note.createByJson({ Id: "b360cb6d-ca54-4b93-a564-a469274eb68a" });
                let document: ap.models.documents.Document = doc;
                defNote.resolve(note);
                $rootScope.$apply();

                let noteDocument: ap.models.notes.NoteDocument = new ap.models.notes.NoteDocument(Utility);
                noteDocument.Note = note;
                noteDocument.Document = document;
                let noteDocumentVM: ap.viewmodels.notes.NoteDocumentViewModel = new ap.viewmodels.notes.NoteDocumentViewModel(Utility, $q, ControllersManager, ServicesManager);
                noteDocumentVM.init(noteDocument, note);

                let noteDocumentListVM: ap.viewmodels.notes.NoteDocumentListViewModel = createVm(noteDetailVM);

                spyOn(noteDocumentListVM.sourceItems, "push").and.callThrough();
                spyOn(DocumentController, "registerDocumentStatusRefresh");

                (<any>NoteController)._listener.raise("notedocumentuploaded", noteDocument);

                $rootScope.$apply();
                
                expect(noteDocumentListVM.sourceItems[0].originalEntity).toBe(noteDocument);
                expect(DocumentController.registerDocumentStatusRefresh).toHaveBeenCalled();
            });

            it("THEN if the noteDocument.note.Id is not equal to the loaded note in NoteDetail, it's not pushed in the noteDocumentList of NoteDetail", () => {
                let note: ap.models.notes.Note = new ap.models.notes.Note(Utility);
                note.createByJson({ Id: "b360cb6d-ca54-4b93-a564-a469274eb68a" });
                let document: ap.models.documents.Document = doc;
                defNote.resolve(note);
                $rootScope.$apply();

                let noteDocument: ap.models.notes.NoteDocument = new ap.models.notes.NoteDocument(Utility);
                let otherNote: ap.models.notes.Note = new ap.models.notes.Note(Utility);
                otherNote.createByJson({ Id: "5" });
                noteDocument.Note = otherNote;
                noteDocument.Document = document;
                let noteDocumentVM: ap.viewmodels.notes.NoteDocumentViewModel = new ap.viewmodels.notes.NoteDocumentViewModel(Utility, $q, ControllersManager, ServicesManager);
                noteDocumentVM.init(noteDocument, note);

                let noteDocumentListVM: ap.viewmodels.notes.NoteDocumentListViewModel = createVm(noteDetailVM);

                spyOn(noteDocumentListVM.sourceItems, "push").and.callThrough();

                (<any>NoteController)._listener.raise("notedocumentuploaded", noteDocument);
                
                expect(note.NoteDocuments).toBeNull();
                expect(noteDocumentListVM.sourceItems.length).toBe(0);
            });
        });
    });

    describe("Feature: closePictureViewer", () => {
        describe("WHEN closePictureViewer is called and isDisplayingPictureViewer = true AND note detail list is not opened", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get).and.returnValue({
                    canPreview: false,
                    isDisplayedInPictureViewer: false
                });

                vm = createVm();

                spyOn(MainController, "goBackToScreen");

                vm.isDisplayingPictureViewer = true;

                vm.closePictureViewer();
            });

            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get);
            });

            it("THEN, after the call the isDisplayPictureViewer = false", () => {
                expect(vm.isDisplayingPictureViewer).toBeFalsy();
            });

            it("THEN, mainController.goBackToScreen should not be called", () => {
                expect(MainController.goBackToScreen).not.toHaveBeenCalled();
            });
        });
    });

    describe("Feature: isDisplayingPictureViewer", () => {
        let selectedVm: any;

        beforeEach(() => {

            spyOn(MainController, "addScreen");
            selectedVm = {
                canPreview: true,
                isDisplayedInPictureViewer: false,
                pictureViewModel: {
                    documentViewModel: {
                        screenInfo: { name: "123" }
                    }
                }
            };
            specHelper.general.spyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get).and.returnValue(selectedVm);
            vm = createVm();
        });

        afterEach(() => specHelper.general.offSpyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get));

        describe("WHEN isDisplayingPictureViewer set true and canPreview is true", () => {
            beforeEach(() => {
                vm.isDisplayingPictureViewer = true;
            });
            it("THEN, mainController.addScreen should be called with screenInfo taken from documentVm", () => {
                expect(MainController.addScreen).toHaveBeenCalledWith(selectedVm.pictureViewModel.documentViewModel.screenInfo, false);
            });

            it("THEN, isDisplayingPictureViewer should be true", () => {
                expect(vm.isDisplayingPictureViewer).toBeTruthy();
            });
        });

        describe("WHEN isDisplayingPictureViewer set true and canPreview is true", () => {
            beforeEach(() => {
                vm.isDisplayingPictureViewer = true;
            });
            it("THEN, mainController.addScreen should be called with screenInfo taken from documentVm", () => {
                expect(MainController.addScreen).toHaveBeenCalledWith(selectedVm.pictureViewModel.documentViewModel.screenInfo, false);
            });

            it("THEN, isDisplayingPictureViewer should be true", () => {
                expect(vm.isDisplayingPictureViewer).toBeTruthy();
            });
        });

        describe("WHEN isDisplayingPictureViewer set true and canPreview is true AND this screen info already added", () => {
            beforeEach(() => {
                let returnedScreenInfo = selectedVm.pictureViewModel.documentViewModel.screenInfo;
                specHelper.general.spyProperty(ap.controllers.MainController.prototype, "currentVisibleScreens", specHelper.PropertyAccessor.Get).and.returnValue([{ screen: returnedScreenInfo }]);
                vm.isDisplayingPictureViewer = true;
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.controllers.MainController.prototype, "currentVisibleScreens", specHelper.PropertyAccessor.Get);
            });
            it("THEN, mainController.addScreen should not be called", () => {
                expect(MainController.addScreen).not.toHaveBeenCalled();
            });

            it("THEN, isDisplayingPictureViewer should be true", () => {
                expect(vm.isDisplayingPictureViewer).toBeTruthy();
            });
        });

        describe("WHEN isDisplayingPictureViewer set true and canPreview is false", () => {
            beforeEach(() => {
                selectedVm.canPreview = false;
                vm.isDisplayingPictureViewer = true;
            });

            it("THEN, mainController.addScreen should be called with screenInfo taken from documentVm", () => {
                expect(MainController.addScreen).not.toHaveBeenCalled();
            });

            it("THEN, isDisplayingPictureViewer should be true", () => {
                expect(vm.isDisplayingPictureViewer).toBeTruthy();
            });
        });

        describe("WHEN isDisplayingPictureViewer set false and canPreview is true", () => {
            beforeEach(() => {
                selectedVm.canPreview = true;
                vm.isDisplayingPictureViewer = false;
            });

            it("THEN, mainController.addScreen should be called with screenInfo taken from documentVm", () => {
                expect(MainController.addScreen).not.toHaveBeenCalled();
            });

            it("THEN, isDisplayingPictureViewer should be true", () => {
                expect(vm.isDisplayingPictureViewer).toBeFalsy();
            });
        });
    });

    describe("Feature: previewDocument", () => {
        let note: ap.models.notes.Note;
        let noteDetailVM: ap.viewmodels.notes.NoteDetailViewModel;
        let uploader: ap.models.actors.User;

        describe("WHEN preview is required", () => {
            beforeEach(() => {
                uploader = new ap.models.actors.User(Utility);

                spyOn(MainController, "addScreen");

                note = new ap.models.notes.Note(Utility);
                note.createByJson({
                    Id: "BC372BF6-9A5E-4F26-A1A7 - 358D41150B65",
                    NoteDocuments: [
                        {
                            Id: "1",
                            Document: {
                                Id: "1",
                                Status: ap.models.documents.DocumentStatus.NotUploaded,
                                Author: uploader.toJSON(),
                                VersionCount: 0
                            }
                        },
                        {
                            Id: "2",
                            Document: {
                                Id: "2",
                                Status: ap.models.documents.DocumentStatus.Processed,
                                Author: uploader.toJSON(),
                                VersionCount: 0
                            }
                        },
                        {
                            Id: "3",
                            Document: {
                                Id: "3",
                                Status: ap.models.documents.DocumentStatus.Uploaded,
                                Author: uploader.toJSON(),
                                VersionCount: 0
                            }
                        }
                    ]
                });

                specHelper.general.spyProperty(ap.viewmodels.notes.NoteDetailBaseViewModel.prototype, "noteBase", specHelper.PropertyAccessor.Get).and.returnValue(note);
                noteDetailVM = new ap.viewmodels.notes.NoteDetailViewModel(Utility, $mdDialog, $q, Api, ControllersManager, ServicesManager);

                vm = createVm(noteDetailVM);

                vm.openDocumentInPictureViewer(<ap.viewmodels.notes.NoteDocumentViewModel>vm.sourceItems[1]);
            });

            afterEach(() => specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteDetailBaseViewModel.prototype, "noteBase", specHelper.PropertyAccessor.Get));

            it("THEN, the selected viewmodel becomes the NoteDocumentViewModel of the event and isDisplayingPictureViewer = true", () => {
                expect(vm.selectedViewModel).toBe(vm.sourceItems[1]);
                expect(vm.isDisplayingPictureViewer).toBeTruthy();
            });
        });
    });
    
    describe("Feature: DownloadClicked", () => {

        let document: ap.models.documents.Document;
        let note: ap.models.notes.Note;
        let noteDetailVM: ap.viewmodels.notes.NoteDetailViewModel;
        let noteDocument: ap.models.notes.NoteDocument;

        beforeEach(() => {
            document = new ap.models.documents.Document(Utility);
            document.createByJson({
                ImageUrl: "filename.pdf",
                Name: "filename",
                Id: "2",
                VersionCount: 0
            });
            document.Author = new ap.models.actors.User(Utility);

            note = new ap.models.notes.Note(Utility);
            noteDocument = new ap.models.notes.NoteDocument(Utility);
            noteDocument.Document = document;

            note.createByJson({
                Id: "BC372BF6-9A5E-4F26-A1A7 - 358D41150B65"
            });
            note.NoteDocuments = [];
            note.NoteDocuments.push(noteDocument);
            specHelper.general.spyProperty(ap.viewmodels.notes.NoteDocumentListViewModel.prototype, "isDisplayingPictureViewer", specHelper.PropertyAccessor.Get).and.returnValue(false);
            specHelper.general.spyProperty(ap.viewmodels.notes.NoteDetailBaseViewModel.prototype, "noteBase", specHelper.PropertyAccessor.Get).and.returnValue(note);
            noteDetailVM = new ap.viewmodels.notes.NoteDetailViewModel(Utility, $mdDialog, $q, Api, ControllersManager, ServicesManager);

            specHelper.general.spyProperty(ap.viewmodels.notes.NoteDocumentViewModel.prototype, "canDownload", specHelper.PropertyAccessor.Get).and.returnValue(true);
        });

        afterEach(() => {
            specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteDocumentListViewModel.prototype, "isDisplayingPictureViewer", specHelper.PropertyAccessor.Get);

            specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteDetailBaseViewModel.prototype, "noteBase", specHelper.PropertyAccessor.Get);

            specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteDocumentViewModel.prototype, "canDownload", specHelper.PropertyAccessor.Get);
        });

        describe("WHEN downloadclicked event is raised", () => {
            let docCalled: ap.models.documents.Document;
            let calledIndex = -1;
            beforeEach(() => {
                spyOn(DocumentController, "downloadDocument");

                vm = createVm(noteDetailVM);

                specHelper.general.raiseEvent(vm.sourceItems[0], "downloadclicked", vm.sourceItems[0]);
            })
            it("THEN, DocumentController.downloadDocument is called", () => {
                expect(DocumentController.downloadDocument).toHaveBeenCalledWith((<ap.viewmodels.notes.NoteDocumentViewModel>vm.sourceItems[0]).documentVm.originalEntity, undefined)
            });
        });
    });

    describe("Feature: openDocumentInPictureViewer", () => {

        let noteDocumentVM: ap.viewmodels.notes.NoteDocumentViewModel;
        let noteDocument: ap.models.notes.NoteDocument;
        let note: ap.models.notes.Note;
        let noteDetailVM: ap.viewmodels.notes.NoteDetailViewModel;

        describe("WHEN open openDocumentInPictureViewer is called", () => {
            beforeEach(() => {
                note = new ap.models.notes.Note(Utility);
                note.createByJson(n);
                noteDocument = new ap.models.notes.NoteDocument(Utility);
                noteDocument.createByJson({
                    Id: "test-note-doc-id",
                    Document: {
                        Id: "test-doc-id",
                        Author: {
                            Id: "111"
                        },
                        VersionCount: 0
                    }
                });

                noteDocumentVM = new ap.viewmodels.notes.NoteDocumentViewModel(Utility, $q, ControllersManager, ServicesManager);
                noteDocumentVM.init(noteDocument, note);
                spyOn(MainController, "addScreen");

                noteDetailVM = new ap.viewmodels.notes.NoteDetailViewModel(Utility, $mdDialog, $q, Api, ControllersManager, ServicesManager);
                vm = createVm(noteDetailVM);
                vm.openDocumentInPictureViewer(noteDocumentVM);
            });

            it("THEN selectedViewModel equal noteDocumentVM", () => {
                expect(vm.selectedViewModel).toEqual(noteDocumentVM);
            });

            it("THEN isDisplayingPictureViewer is true", () => {
                expect(vm.isDisplayingPictureViewer).toBeTruthy();
            });
        });
    });

    describe("Feature: documentDeleted method", () => {

        let document: ap.models.documents.Document;
        let note: ap.models.notes.Note;
        let noteDetailVM: ap.viewmodels.notes.NoteDetailViewModel;
        let noteDocumentListVM: ap.viewmodels.notes.NoteDocumentListViewModel;
        let noteDocument: ap.models.notes.NoteDocument;

        beforeEach(() => {
            document = new ap.models.documents.Document(Utility);
            document.createByJson({
                ImageUrl: "filename.pdf",
                Name: "filename",
                Id: "2",
                VersionCount: 0
            });
            document.Author = new ap.models.actors.User(Utility);
            document.VersionCount = 1;

            note = new ap.models.notes.Note(Utility);
            noteDocument = new ap.models.notes.NoteDocument(Utility);
            noteDocument.Document = document;

            note.createByJson({
                Id: "BC372BF6-9A5E-4F26-A1A7 - 358D41150B65"
            });
            note.NoteDocuments = [];
            note.NoteDocuments.push(noteDocument);
            specHelper.general.spyProperty(ap.viewmodels.notes.NoteDocumentListViewModel.prototype, "isDisplayingPictureViewer", specHelper.PropertyAccessor.Get).and.returnValue(false);
            specHelper.general.spyProperty(ap.viewmodels.notes.NoteDetailBaseViewModel.prototype, "noteBase", specHelper.PropertyAccessor.Get).and.returnValue(note);
            noteDetailVM = new ap.viewmodels.notes.NoteDetailViewModel(Utility, $mdDialog, $q, Api, ControllersManager, ServicesManager);
            noteDocumentListVM = createVm(noteDetailVM);
        });

        afterEach(() => {
            specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteDocumentListViewModel.prototype, "isDisplayingPictureViewer", specHelper.PropertyAccessor.Get);
            specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteDetailBaseViewModel.prototype, "noteBase", specHelper.PropertyAccessor.Get);
        });

        describe("When documentDeleted event was fired from NoteController", () => {
            it("THEN the document will be removed from the list", () => {
                specHelper.general.raiseEvent(NoteController, "documentdeleted", note.NoteDocuments[0]);
                expect(noteDocumentListVM.sourceItems.length).toEqual(0);
            });
        });
    });

    describe("Feature: actions management", () => {
        let noteDocumentListVM: ap.viewmodels.notes.NoteDocumentListViewModel;
        let noteVm: ap.viewmodels.notes.NoteDetailViewModel;
        let serviceDefer: angular.IDeferred<ap.models.notes.Note>;
        let note: ap.models.notes.Note;
        let defNoteStatus: ng.IDeferred<any>;
        beforeEach(() => {            
            noteVm = new ap.viewmodels.notes.NoteDetailViewModel(Utility, $mdDialog, $q, Api, ControllersManager, ServicesManager);
            serviceDefer = $q.defer();
            defNoteStatus = $q.defer();
            note = new ap.models.notes.Note(Utility);
            note.createByJson({
                Id: "b360cb6d-ca54-4b93-a564-a469274eb68a",
                MeetingAccessRight: {
                    CanAddPointDocument: true
                }
            });
            spyOn(NoteController, "getFullNoteById").and.returnValue(serviceDefer.promise);
            spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue(defNoteStatus.promise);
            noteVm.loadNote("b360cb6d-ca54-4b93-a564-a469274eb68a");
            
        });
        describe("WHEN user has right to upload documents from desktop", () => {
            beforeEach(() => {
                serviceDefer.resolve(note);
                $rootScope.$apply();
                noteDocumentListVM = createVm(noteVm);
            });
            it("THEN, upload button is visible and enabled", () => {
                expect(noteDocumentListVM.noteDocumentsActions[0].isVisible).toBeTruthy();
                expect(noteDocumentListVM.noteDocumentsActions[0].isEnabled).toBeTruthy();
                expect(noteDocumentListVM.noteDocumentsActions[1].isVisible).toBeTruthy();
                expect(noteDocumentListVM.noteDocumentsActions[1].isEnabled).toBeTruthy();
            });
        });
        describe("WHEN user does not have right to upload document from desktop and import from folders structure", () => {
            beforeEach(() => {
                note.MeetingAccessRight.CanAddPointDocument = false;
                serviceDefer.resolve(note);
                $rootScope.$apply();
                noteDocumentListVM = createVm(noteVm);
            });
            it("THEN, upload button is disabled and not visible", () => {
                expect(noteDocumentListVM.noteDocumentsActions[0].isVisible).toBeFalsy();
                expect(noteDocumentListVM.noteDocumentsActions[0].isEnabled).toBeFalsy();
                expect(noteDocumentListVM.noteDocumentsActions[1].isVisible).toBeFalsy();
                expect(noteDocumentListVM.noteDocumentsActions[1].isEnabled).toBeFalsy();
            });
        });
        describe("WHEN note's access rights have been changed", () => {
            let newNote: ap.models.notes.Note;
            let propsSpy: jasmine.Spy;
            beforeEach(() => {
                serviceDefer.resolve(note);
                $rootScope.$apply();
                noteDocumentListVM = createVm(noteVm);
                propsSpy = jasmine.createSpy("propertychangedSpy");
                noteVm.on("propertychanged", propsSpy, this);
                newNote = new ap.models.notes.Note(Utility);
                newNote.createByJson({
                    Id: "test-id",
                    MeetingAccessRight: {
                        CanAddPointDocument: false
                    }
                });
            });
            afterEach(() => {
                noteVm.off("propertychanged", propsSpy, this);
            });
            it("THEN, buttons visibility is recalculated", () => {
                expect(noteDocumentListVM.noteDocumentsActions[0].isVisible).toBeTruthy();
                expect(noteDocumentListVM.noteDocumentsActions[0].isEnabled).toBeTruthy();
                expect(noteDocumentListVM.noteDocumentsActions[1].isVisible).toBeTruthy();
                expect(noteDocumentListVM.noteDocumentsActions[1].isEnabled).toBeTruthy();
                noteVm.init(newNote);
                expect(noteDocumentListVM.noteDocumentsActions[0].isVisible).toBeFalsy();
                expect(noteDocumentListVM.noteDocumentsActions[0].isEnabled).toBeFalsy();
                expect(noteDocumentListVM.noteDocumentsActions[1].isVisible).toBeFalsy();
                expect(noteDocumentListVM.noteDocumentsActions[1].isEnabled).toBeFalsy();
                expect(propsSpy).toHaveBeenCalled();
                expect(propsSpy.calls.argsFor(0)[0].propertyName).toBe("meetingAccessRight");
            });
        })
    });
});