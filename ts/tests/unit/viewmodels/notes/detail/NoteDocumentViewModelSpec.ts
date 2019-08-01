describe("Module ap-viewmodels - NoteDocumentViewModel", () => {
    let Utility: ap.utility.UtilityHelper, UserContext: ap.utility.UserContext,
        MainController: ap.controllers.MainController, NoteController: ap.controllers.NoteController;
    let DocumentController: ap.controllers.DocumentController;
    let ControllersManager: ap.controllers.ControllersManager;
    let ServicesManager: ap.services.ServicesManager;
    let Api: ap.services.apiHelper.Api;
    let $scope: angular.IScope, $rootScope: angular.IRootScopeService, $mdSidenav, $timeout: angular.ITimeoutService, $mdDialog: angular.material.IDialogService;
    let vm: ap.viewmodels.notes.NoteDocumentViewModel;
    let $q: angular.IQService;
    let noteAccessRightSpec: jasmine.Spy;
    let doc: ap.models.documents.Document;
    let project: ap.models.projects.Project;

    function getActionsByName(viewmodel: ap.viewmodels.notes.NoteDocumentViewModel, name: string): ap.viewmodels.home.ActionViewModel {
        return ap.viewmodels.home.ActionViewModel.getAction(viewmodel.actions, name);
    }

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
        angular.mock.module(function ($provide) {
            $provide.factory('$mdDialog', ["$q", function ($q) {
                return specHelper.utility.stubShowMdDialog($q);
            }]);
        });
    });

    beforeEach(inject(function (_$rootScope_, _UserContext_, _MainController_, _Utility_, _$q_, _NoteController_, _DocumentController_, _ControllersManager_, _ServicesManager_) {
        Utility = _Utility_;
        MainController = _MainController_;
        NoteController = _NoteController_;
        UserContext = _UserContext_;
        DocumentController = _DocumentController_;
        ControllersManager = _ControllersManager_;
        ServicesManager = _ServicesManager_;
        $q = _$q_;
        specHelper.utility.stubRootUrl(Utility);
        specHelper.userContext.stub(Utility);
        specHelper.utility.stubStorageSet(Utility);

        doc = new ap.models.documents.Document(Utility);
        doc.UploadedBy = new ap.models.actors.User(Utility);
        doc.Author = new ap.models.actors.User(Utility);

        project = new ap.models.projects.Project(Utility);
        project.UserAccessRight = new ap.models.accessRights.ProjectAccessRight(Utility);
        project.UserAccessRight.CanDownloadDoc = true;
        spyOn(MainController, "currentProject").and.returnValue(project);
    }));

    beforeEach(() => {
        noteAccessRightSpec = specHelper.general.spyProperty(ap.viewmodels.notes.NoteDocumentViewModel.prototype, "noteAccessRight", specHelper.PropertyAccessor.Get);
    });
    afterEach(() => {
        specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteDocumentViewModel.prototype, "noteAccessRight", specHelper.PropertyAccessor.Get);
    });

    let createNoteDocViewModel = () => {
        return new ap.viewmodels.notes.NoteDocumentViewModel(Utility, $q, ControllersManager, ServicesManager);
    };

    describe("Constructor", () => {
        beforeEach(() => {
            specHelper.general.spyProperty(ap.viewmodels.notes.NoteDocumentListViewModel.prototype, "isDisplayingPictureViewer", specHelper.PropertyAccessor.Get).and.returnValue(false);
        });
        afterEach(() => {
            specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteDocumentListViewModel.prototype, "isDisplayingPictureViewer", specHelper.PropertyAccessor.Get);
        });
        describe("WHEN NoteDocumentViewModel is created without NoteDetailViewModel", () => {
            it("THEN, the properties are filled with the default values", () => {
                vm = createNoteDocViewModel();

                expect(vm.hasDrawings).toBeFalsy();
                expect(vm.canDelete).toBeFalsy();
                expect(vm.canDownload).toBeFalsy();
                expect(vm.canPreview).toBeFalsy();
                expect(vm.documentVm).toBeNull();
            });
        });

        describe("WHEN NoteDocument is created with a NoteDetailViewModel", () => {
            let noteDocument: ap.models.notes.NoteDocument;
            let noteAr: ap.models.accessRights.NoteAccessRight;
            beforeEach(() => {
                noteDocument = new ap.models.notes.NoteDocument(Utility);
                noteDocument.DisplayOrder = 2;
                if (!noteDocument.Drawings)
                    noteDocument.Drawings = [];
                noteDocument.Drawings.push(new ap.models.notes.Drawing(Utility));
                noteDocument.Document = doc;
                noteDocument.Document.Name = "test";
            });
            it("THEN, hasDrawings equals true when there are drawings on noteDocument", () => {
                vm = createNoteDocViewModel();
                vm.init(noteDocument);
                expect(vm.hasDrawings).toBeTruthy();
            });
            it("THEN, hasDrawings equals false when there are not drawnings on document", () => {
                vm = createNoteDocViewModel();
                noteDocument.Drawings = [];
                vm.init(noteDocument);
                expect(vm.hasDrawings).toBeFalsy();
            });
            it("THEN, noteDocument of the viewmodel equals the note document used to initialized the vm", () => {
                vm = createNoteDocViewModel();
                vm.init(noteDocument);
                expect(vm.noteDocument).toBe(noteDocument);
            });
        });
    });

    describe("Feature: Can preview", () => {

        let noteDocument: ap.models.notes.NoteDocument;

        beforeEach(() => {
            noteDocument = new ap.models.notes.NoteDocument(Utility);
            noteDocument.DisplayOrder = 2;

            vm = createNoteDocViewModel();
            specHelper.general.spyProperty(ap.viewmodels.notes.NoteDocumentListViewModel.prototype, "isDisplayingPictureViewer", specHelper.PropertyAccessor.Get).and.returnValue(false);
        });
        afterEach(() => {
            specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteDocumentListViewModel.prototype, "isDisplayingPictureViewer", specHelper.PropertyAccessor.Get);
        });

        xdescribe("WHEN the view model is initialized AND document is defined", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.viewmodels.documents.DocumentViewModel.prototype, "isProcessedSuccess", specHelper.PropertyAccessor.Get).and.returnValue(true);
                spyOn(NoteController, "requestDocumentPreview");
                noteDocument.Document = doc;
                noteDocument.Document.Name = "test";
                vm.init(noteDocument);
                vm.documentVm.isProcessedSuccess
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.documents.DocumentViewModel.prototype, "isProcessedSuccess", specHelper.PropertyAccessor.Get);
            });
            it("THEN, the canPreview equals to true", () => {
                expect(vm.canPreview).toBeTruthy();
            });
            it("THEN, the action Preview is visible", () => {
                let action = ap.viewmodels.home.ActionViewModel.getAction(vm.actions, "notedoc.preview");
                expect(action.isVisible).toBeTruthy();
            });
            it("THEN, noteController.requestDocumentPreview is called", () => {
                vm.actionClick("notedoc.preview");
                expect(NoteController.requestDocumentPreview).toHaveBeenCalledWith(vm);
            });
        });

        describe("WHEN the view models is initialized and document is not defined", () => {
            beforeEach(() => {
                vm.init(noteDocument);
            });

            it("THEN, the canPreview equals false", () => {
                expect(vm.canPreview).toBeFalsy();
            });
            it("THEN, the action Preview is not visible", () => {
                let action = getActionsByName(vm, "notedoc.preview");
                expect(action.isVisible).toBeFalsy();
            });
        });
    });

    describe("Feature: Can delete note document", () => {
        let noteDocument: ap.models.notes.NoteDocument;
        let noteAr: ap.models.accessRights.NoteAccessRight;

        beforeEach(() => {
            noteDocument = new ap.models.notes.NoteDocument(Utility);
            noteDocument.DisplayOrder = 2;
            noteDocument.Document = doc;
            noteDocument.Document.Name = "test";

            vm = createNoteDocViewModel();
            specHelper.general.spyProperty(ap.viewmodels.notes.NoteDocumentListViewModel.prototype, "isDisplayingPictureViewer", specHelper.PropertyAccessor.Get).and.returnValue(false);
        });
        afterEach(() => {
            specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteDocumentListViewModel.prototype, "isDisplayingPictureViewer", specHelper.PropertyAccessor.Get);
        });

        describe("WHEN user has CanDeleteDoc right on note", () => {
            beforeEach(() => {
                noteAr = new ap.models.accessRights.NoteAccessRight(Utility, null);
                spyOn(noteAr, "checkCanDeleteDoc").and.returnValue(true);
                noteAccessRightSpec.and.returnValue(noteAr);
                vm.init(noteDocument);
            });
            it("THEN canDelete = true", () => {
                expect(vm.canDelete).toBeTruthy();
            });
            it("THEN the action Delete is visible", () => {
                let action = getActionsByName(vm, "notedoc.delete");
                expect(action.isVisible).toBeTruthy();
            });
            it("THEN, the event deleteclicked is raised", () => {
                let callback = jasmine.createSpy("callback");
                vm.on("deleteclicked", callback, this);

                // Spy on the message confirm and simulate confirm yes
                spyOn(MainController, "showConfirm").and.callFake((message, title, callback) => {
                    expect(title).toEqual(Utility.Translator.getTranslation("app.notes.detachdocument_confirm_title"));
                    expect(message).toEqual(Utility.Translator.getTranslation("app.notes.detachdocument_confirm_message").format(noteDocument.Document.Name));
                    callback(ap.controllers.MessageResult.Positive);
                });

                vm.actionClick("notedoc.delete");

                expect(MainController.showConfirm).toHaveBeenCalled();
                expect(callback).toHaveBeenCalledWith(vm);
            });
        });

        describe("WHEN user hasn't CanDeleteDoc right on note", () => {

            beforeEach(() => {
                noteAr = new ap.models.accessRights.NoteAccessRight(Utility, null);
                spyOn(noteAr, "checkCanDeleteDoc").and.returnValue(false);
                noteAccessRightSpec.and.returnValue(noteAr);
                vm = createNoteDocViewModel();
                vm.init(noteDocument);
            });

            it("THEN canDelete = false", () => {
                expect(vm.canDelete).toBeFalsy();
            });
            it("THEN the action Delete is not visible", () => {
                let action = getActionsByName(vm, "notedoc.delete");
                expect(action.isVisible).toBeFalsy();
            });
            it("THEN the actionClick on notedoc.delete does nothing", () => {
                let callback = jasmine.createSpy("callback");
                vm.on("deleteclicked", callback, this);
                vm.actionClick("notedoc.delete");
                expect(callback).not.toHaveBeenCalled();
            });
        });
    });

    describe("Feature: checkCanDrawOnDoc", () => {
        let noteDocument: ap.models.notes.NoteDocument;
        let noteAr: ap.models.accessRights.NoteAccessRight;
        let json: any;
        beforeEach(() => {
            noteDocument = new ap.models.notes.NoteDocument(Utility);
            json = {
                EntityCreationUser: "111"
            };
            noteDocument.createByJson(json);
        });
        describe("WHEN the user can edit the entire point he can draw on document", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.models.accessRights.NoteBaseAccessRight.prototype, "canEditEntirePoint", specHelper.PropertyAccessor.Get).and.returnValue(true);
                specHelper.general.spyProperty(ap.models.accessRights.NoteAccessRight.prototype, "canAddComment", specHelper.PropertyAccessor.Get).and.returnValue(false);
                specHelper.general.spyProperty(ap.models.accessRights.NoteAccessRight.prototype, "canUploadDoc", specHelper.PropertyAccessor.Get).and.returnValue(false);
                specHelper.general.spyProperty(ap.models.accessRights.NoteAccessRight.prototype, "canImportDoc", specHelper.PropertyAccessor.Get).and.returnValue(false);
                noteAr = new ap.models.accessRights.NoteAccessRight(Utility, null);
                vm = createNoteDocViewModel();
                noteAccessRightSpec.and.returnValue(noteAr);
                vm.init(noteDocument);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.models.accessRights.NoteBaseAccessRight.prototype, "canEditEntirePoint", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.models.accessRights.NoteAccessRight.prototype, "canAddComment", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.models.accessRights.NoteAccessRight.prototype, "canUploadDoc", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.models.accessRights.NoteAccessRight.prototype, "canImportDoc", specHelper.PropertyAccessor.Get);
            });
            it("THEN hasEditAccess = true", () => {
                expect(vm.pictureViewModel.hasEditAccess).toBeTruthy();
            });

        });
        describe("WHEN the user can not add comment and cannot add doc", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.models.accessRights.NoteBaseAccessRight.prototype, "canEditEntirePoint", specHelper.PropertyAccessor.Get).and.returnValue(false);
                specHelper.general.spyProperty(ap.models.accessRights.NoteAccessRight.prototype, "canAddComment", specHelper.PropertyAccessor.Get).and.returnValue(false);
                specHelper.general.spyProperty(ap.models.accessRights.NoteAccessRight.prototype, "canUploadDoc", specHelper.PropertyAccessor.Get).and.returnValue(true);
                specHelper.general.spyProperty(ap.models.accessRights.NoteAccessRight.prototype, "canImportDoc", specHelper.PropertyAccessor.Get).and.returnValue(false);
                vm = createNoteDocViewModel();
                noteAccessRightSpec.and.returnValue(noteAr);
                vm.init(noteDocument);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.models.accessRights.NoteBaseAccessRight.prototype, "canEditEntirePoint", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.models.accessRights.NoteAccessRight.prototype, "canAddComment", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.models.accessRights.NoteAccessRight.prototype, "canUploadDoc", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.models.accessRights.NoteAccessRight.prototype, "canImportDoc", specHelper.PropertyAccessor.Get);
            });
            it("THEN hasEditAccess = false", () => {
                expect(vm.pictureViewModel.hasEditAccess).toBeFalsy();
            });
        });
        describe("WHEN the user can not add comment", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.models.accessRights.NoteBaseAccessRight.prototype, "canEditEntirePoint", specHelper.PropertyAccessor.Get).and.returnValue(false);
                specHelper.general.spyProperty(ap.models.accessRights.NoteAccessRight.prototype, "canAddComment", specHelper.PropertyAccessor.Get).and.returnValue(false);
                specHelper.general.spyProperty(ap.models.accessRights.NoteAccessRight.prototype, "canUploadDoc", specHelper.PropertyAccessor.Get).and.returnValue(true);
                specHelper.general.spyProperty(ap.models.accessRights.NoteAccessRight.prototype, "canImportDoc", specHelper.PropertyAccessor.Get).and.returnValue(true);
                vm = createNoteDocViewModel();
                noteAccessRightSpec.and.returnValue(noteAr);
                vm.init(noteDocument);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.models.accessRights.NoteBaseAccessRight.prototype, "canEditEntirePoint", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.models.accessRights.NoteAccessRight.prototype, "canAddComment", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.models.accessRights.NoteAccessRight.prototype, "canUploadDoc", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.models.accessRights.NoteAccessRight.prototype, "canImportDoc", specHelper.PropertyAccessor.Get);
            });
            it("THEN hasEditAccess = false", () => {
                expect(vm.pictureViewModel.hasEditAccess).toBeFalsy();
            });
        });
        describe("WHEN the user can not upload doc", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.models.accessRights.NoteBaseAccessRight.prototype, "canEditEntirePoint", specHelper.PropertyAccessor.Get).and.returnValue(false);
                specHelper.general.spyProperty(ap.models.accessRights.NoteAccessRight.prototype, "canAddComment", specHelper.PropertyAccessor.Get).and.returnValue(true);
                specHelper.general.spyProperty(ap.models.accessRights.NoteAccessRight.prototype, "canUploadDoc", specHelper.PropertyAccessor.Get).and.returnValue(false);
                specHelper.general.spyProperty(ap.models.accessRights.NoteAccessRight.prototype, "canImportDoc", specHelper.PropertyAccessor.Get).and.returnValue(true);
                vm = createNoteDocViewModel();
                noteAccessRightSpec.and.returnValue(noteAr);
                vm.init(noteDocument);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.models.accessRights.NoteBaseAccessRight.prototype, "canEditEntirePoint", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.models.accessRights.NoteAccessRight.prototype, "canAddComment", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.models.accessRights.NoteAccessRight.prototype, "canUploadDoc", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.models.accessRights.NoteAccessRight.prototype, "canImportDoc", specHelper.PropertyAccessor.Get);
            });
            it("THEN hasEditAccess = true", () => {
                expect(vm.pictureViewModel.hasEditAccess).toBeTruthy();
            });
        });
        describe("WHEN the user can not import doc", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.models.accessRights.NoteBaseAccessRight.prototype, "canEditEntirePoint", specHelper.PropertyAccessor.Get).and.returnValue(false);
                specHelper.general.spyProperty(ap.models.accessRights.NoteAccessRight.prototype, "canAddComment", specHelper.PropertyAccessor.Get).and.returnValue(true);
                specHelper.general.spyProperty(ap.models.accessRights.NoteAccessRight.prototype, "canUploadDoc", specHelper.PropertyAccessor.Get).and.returnValue(true);
                specHelper.general.spyProperty(ap.models.accessRights.NoteAccessRight.prototype, "canImportDoc", specHelper.PropertyAccessor.Get).and.returnValue(false);
                vm = createNoteDocViewModel();
                noteAccessRightSpec.and.returnValue(noteAr);
                vm.init(noteDocument);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.models.accessRights.NoteBaseAccessRight.prototype, "canEditEntirePoint", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.models.accessRights.NoteAccessRight.prototype, "canAddComment", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.models.accessRights.NoteAccessRight.prototype, "canUploadDoc", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.models.accessRights.NoteAccessRight.prototype, "canImportDoc", specHelper.PropertyAccessor.Get);
            });
            it("THEN hasEditAccess = true", () => {
                expect(vm.pictureViewModel.hasEditAccess).toBeTruthy();
            });
        });
        describe("WHEN the user can not import doc AND upload doc", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.models.accessRights.NoteBaseAccessRight.prototype, "canEditEntirePoint", specHelper.PropertyAccessor.Get).and.returnValue(false);
                specHelper.general.spyProperty(ap.models.accessRights.NoteAccessRight.prototype, "canAddComment", specHelper.PropertyAccessor.Get).and.returnValue(true);
                specHelper.general.spyProperty(ap.models.accessRights.NoteAccessRight.prototype, "canUploadDoc", specHelper.PropertyAccessor.Get).and.returnValue(false);
                specHelper.general.spyProperty(ap.models.accessRights.NoteAccessRight.prototype, "canImportDoc", specHelper.PropertyAccessor.Get).and.returnValue(false);
                vm = createNoteDocViewModel();
                noteAccessRightSpec.and.returnValue(noteAr);
                vm.init(noteDocument);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.models.accessRights.NoteBaseAccessRight.prototype, "canEditEntirePoint", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.models.accessRights.NoteAccessRight.prototype, "canAddComment", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.models.accessRights.NoteAccessRight.prototype, "canUploadDoc", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.models.accessRights.NoteAccessRight.prototype, "canImportDoc", specHelper.PropertyAccessor.Get);
            });
            it("THEN hasEditAccess = false", () => {
                expect(vm.pictureViewModel.hasEditAccess).toBeFalsy();
            });
        });
        describe("WHEN the user who's not the one who created doc and cannot edit the entire point", () => {
            beforeEach(() => {
                json = {
                    EntityCreationUser: "222"
                };
                noteDocument.createByJson(json);

                specHelper.general.spyProperty(ap.models.accessRights.NoteBaseAccessRight.prototype, "canEditEntirePoint", specHelper.PropertyAccessor.Get).and.returnValue(false);
                specHelper.general.spyProperty(ap.models.accessRights.NoteAccessRight.prototype, "canAddComment", specHelper.PropertyAccessor.Get).and.returnValue(true);
                specHelper.general.spyProperty(ap.models.accessRights.NoteAccessRight.prototype, "canUploadDoc", specHelper.PropertyAccessor.Get).and.returnValue(true);
                specHelper.general.spyProperty(ap.models.accessRights.NoteAccessRight.prototype, "canImportDoc", specHelper.PropertyAccessor.Get).and.returnValue(true);
                vm = createNoteDocViewModel();
                noteAccessRightSpec.and.returnValue(noteAr);
                vm.init(noteDocument);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.models.accessRights.NoteBaseAccessRight.prototype, "canEditEntirePoint", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.models.accessRights.NoteAccessRight.prototype, "canAddComment", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.models.accessRights.NoteAccessRight.prototype, "canUploadDoc", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.models.accessRights.NoteAccessRight.prototype, "canImportDoc", specHelper.PropertyAccessor.Get);
            });
            it("THEN hasEditAccess = false", () => {
                expect(vm.pictureViewModel.hasEditAccess).toBeFalsy();
            });
        });
        describe("WHEN the user who's not the one who created doc and can edit the entire point", () => {
            beforeEach(() => {
                json = {
                    EntityCreationUser: "222"
                };
                noteDocument.createByJson(json);

                specHelper.general.spyProperty(ap.models.accessRights.NoteBaseAccessRight.prototype, "canEditEntirePoint", specHelper.PropertyAccessor.Get).and.returnValue(true);
                specHelper.general.spyProperty(ap.models.accessRights.NoteAccessRight.prototype, "canAddComment", specHelper.PropertyAccessor.Get).and.returnValue(false);
                specHelper.general.spyProperty(ap.models.accessRights.NoteAccessRight.prototype, "canUploadDoc", specHelper.PropertyAccessor.Get).and.returnValue(false);
                specHelper.general.spyProperty(ap.models.accessRights.NoteAccessRight.prototype, "canImportDoc", specHelper.PropertyAccessor.Get).and.returnValue(false);
                vm = createNoteDocViewModel();
                noteAccessRightSpec.and.returnValue(noteAr);
                vm.init(noteDocument);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.models.accessRights.NoteBaseAccessRight.prototype, "canEditEntirePoint", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.models.accessRights.NoteAccessRight.prototype, "canAddComment", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.models.accessRights.NoteAccessRight.prototype, "canUploadDoc", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.models.accessRights.NoteAccessRight.prototype, "canImportDoc", specHelper.PropertyAccessor.Get);
            });
            it("THEN hasEditAccess = true", () => {
                expect(vm.pictureViewModel.hasEditAccess).toBeTruthy();
            });
        });
    });

    describe("Feature: checkPictureVmEditMode", () => {
        let noteDocument: ap.models.notes.NoteDocument;
        let noteAr: ap.models.accessRights.NoteAccessRight;
        let json: any;
        beforeEach(() => {
            noteDocument = new ap.models.notes.NoteDocument(Utility);
            json = {
                EntityCreationUser: "111"
            };
            noteDocument.createByJson(json);
        });
        describe("WHEN the user is on edit mode", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.viewmodels.documents.PictureViewModel.prototype, "hasEditAccess", specHelper.PropertyAccessor.Get).and.returnValue(true);
                vm = createNoteDocViewModel();
                vm.init(noteDocument);
                vm.isDisplayedInPictureViewer = true;
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.documents.PictureViewModel.prototype, "hasEditAccess", specHelper.PropertyAccessor.Get);
            });
            it("THEN hasEditAccess = true", () => {
                expect(vm.pictureViewModel.isEditMode).toBeTruthy();
            });

        });
        describe("WHEN the user has not the edit access", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.viewmodels.documents.PictureViewModel.prototype, "hasEditAccess", specHelper.PropertyAccessor.Get).and.returnValue(false);
                vm = createNoteDocViewModel();
                vm.init(noteDocument);
                vm.isDisplayedInPictureViewer = true;
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.documents.PictureViewModel.prototype, "hasEditAccess", specHelper.PropertyAccessor.Get);
            });
            it("THEN hasEditAccess = false", () => {
                expect(vm.pictureViewModel.isEditMode).toBeFalsy();
            });
        });
        describe("WHEN the user can isDisplayedInPictureViewer = false", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.viewmodels.documents.PictureViewModel.prototype, "hasEditAccess", specHelper.PropertyAccessor.Get).and.returnValue(false);
                vm = createNoteDocViewModel();
                vm.init(noteDocument);
                vm.isDisplayedInPictureViewer = false;
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.documents.PictureViewModel.prototype, "hasEditAccess", specHelper.PropertyAccessor.Get);
            });
            it("THEN hasEditAccess = false", () => {
                expect(vm.pictureViewModel.isEditMode).toBeFalsy();
            });
        });
    });

    describe("Feature: closedocument", () => {
        describe("WHEN the pictureViewModel raise the event closerequested", () => {
            let noteDocument: ap.models.notes.NoteDocument;
            let callback: jasmine.Spy;
            beforeEach(() => {
                callback = jasmine.createSpy("callback");
                noteDocument = new ap.models.notes.NoteDocument(Utility);
                noteDocument.Document = doc;

                vm = createNoteDocViewModel();
                vm.init(noteDocument);
                vm.on("documentclosed", callback, this);
                specHelper.general.spyProperty(ap.viewmodels.notes.NoteDocumentListViewModel.prototype, "isDisplayingPictureViewer", specHelper.PropertyAccessor.Get).and.returnValue(false);
                specHelper.general.raiseEvent(vm.pictureViewModel, "closerequested", callback);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteDocumentListViewModel.prototype, "isDisplayingPictureViewer", specHelper.PropertyAccessor.Get);
            });
            it("THEN, the event documentclosed is raised", () => {
                expect(callback).toHaveBeenCalled();
            });
        });
    });

    describe("Feature: download clicked", () => {

        let noteDocument: ap.models.notes.NoteDocument;

        beforeEach(() => {
            noteDocument = new ap.models.notes.NoteDocument(Utility);
            noteDocument.Document = doc;

            vm = createNoteDocViewModel();
            specHelper.general.spyProperty(ap.viewmodels.notes.NoteDocumentListViewModel.prototype, "isDisplayingPictureViewer", specHelper.PropertyAccessor.Get).and.returnValue(false);
        });
        afterEach(() => {
            specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteDocumentListViewModel.prototype, "isDisplayingPictureViewer", specHelper.PropertyAccessor.Get);
        });

        describe("WHEN one clicks on download of a noteDocument where canDownload = TRUE", () => {
            it("THEN, downloadclicked is raised", () => {
                noteDocument.Document.Status = ap.models.documents.DocumentStatus.Processed;
                vm.init(noteDocument);

                let callback = jasmine.createSpy("callback");
                vm.on("downloadclicked", callback, this);

                vm.actionClick("notedoc.download");

                expect(callback).toHaveBeenCalledWith(vm);
            });
        });

        describe("WHEN one clicks on download of a noteDocument where canDownload = FALSE", () => {
            it("THEN nothing happens", () => {
                noteDocument.Document.Status = ap.models.documents.DocumentStatus.NotUploaded;
                vm.init(noteDocument);

                let callback = jasmine.createSpy("callback");
                vm.on("downloadclicked", callback, this);
                vm.actionClick("notedoc.download");

                expect(callback).not.toHaveBeenCalled();
            });
        });

        describe("WHEN one clicks on download of a noteDocument where canDownload = FALSE", () => {
            it("THEN nothing happens", () => {
                noteDocument.Document.Status = ap.models.documents.DocumentStatus.Processed;
                project.UserAccessRight.CanDownloadDoc = false;
                vm.init(noteDocument);

                let callback = jasmine.createSpy("callback");
                vm.on("downloadclicked", callback, this);
                vm.actionClick("notedoc.download");

                expect(callback).not.toHaveBeenCalled();
            });
        });
    });
    describe("Feature: copySource method", () => {
        let noteDocument: ap.models.notes.NoteDocument;
        let json: any;
        let savedrawingsrequestedSpy: jasmine.Spy;

        beforeEach(() => {
            spyOn(ControllersManager.noteController, "saveDrawings").and.returnValue($q.defer().promise);
            noteDocument = new ap.models.notes.NoteDocument(Utility);
            json = {
                EntityCreationUser: "111"
            };

            savedrawingsrequestedSpy = jasmine.createSpy("savedrawingsrequested");
            noteDocument.createByJson(json);
            vm = createNoteDocViewModel();
            vm.init(noteDocument);
            vm.documentVm.on("savedrawingsrequested", savedrawingsrequestedSpy, this);
            vm.documentVm.saveDrawings(null, null, null, null);
        });

        afterEach(() => {
            vm.off("savedrawingsrequested", savedrawingsrequestedSpy, this);
        });

        describe("WHEN, copySource method called and savedrawingsrequested event is fired", () => {
            it("THEN, savedrawingsrequested handler function is executed", () => {
                expect(savedrawingsrequestedSpy).toHaveBeenCalled();

            });
            it("THEN, we have the note document in the callback", () => {
                expect(savedrawingsrequestedSpy.calls.argsFor(0)[0].noteDocument).toBe(noteDocument);
            });

            it("THEN, noteController.saveDrawings is called with correct params", () => {
                expect(ControllersManager.noteController.saveDrawings).toHaveBeenCalledWith(vm.noteDocument.Note, vm.noteDocument);
            });
        });
    });
});  