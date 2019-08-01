describe("Module ap-viewmodels - documents components - AddNewDocumentViewModel", () => {
    let Utility: ap.utility.UtilityHelper, UserContext: ap.utility.UserContext;
    let $q: angular.IQService;
    let DocumentController: ap.controllers.DocumentController;
    let MainController: ap.controllers.MainController;
    let eventHelper: ap.utility.EventHelper;
    let $mdDialog: angular.material.IDialogService;
    let $rootScope: angular.IRootScopeService;
    let cloudService: ap.services.CloudService;
    let interval: ng.IIntervalService;

    let vm: ap.viewmodels.documents.AddNewDocumentViewModel;
    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
        angular.mock.module(function ($provide) {
            $provide.factory('$mdDialog', ["$q", function ($q) {
                return specHelper.utility.stubShowMdDialog($q);
            }]);
        });
    });
    beforeEach(inject(function (_$rootScope_, _UserContext_, _Utility_, _$q_, _DocumentController_, _MainController_, _EventHelper_, _$mdDialog_) {
        Utility = _Utility_;
        UserContext = _UserContext_;
        $q = _$q_;
        $rootScope = _$rootScope_;
        DocumentController = _DocumentController_;
        MainController = _MainController_;
        eventHelper = _EventHelper_;
        $mdDialog = _$mdDialog_;

        specHelper.utility.stubUserConnected(Utility);
        spyOn(MainController, "currentProject").and.returnValue(
            {
                Id: "35a2c5d6-0e00-43e9-ada8-ce4d3fafb16e",
                IsActive: true,
                Name: "VBL",
                UserAccessRight: {
                    CanUploadDoc: true,
                    CanDownloadDoc: true
                }
            });
        spyOn(Utility.Translator, "getTranslation").and.callFake(function (key) {
            if (key === "app.err.adddoc_wrong_extensionMsg")
                return "The document {0} cannot be uploaded. This file extension is not accepted.";
            if (key === "app.err.adddoc_wrong_extensionTitle")
                return "Error during the upload of the document.";
            if (key === "app.document.upload_picture_title")
                return "Add pictures to the project <<{0}>>";
            if (key === "app.document.upload_document_title")
                return "Add documents to the project <<{0}>>";
            if (key === "app.document.uploadfile_fail")
                return "Fail to upload the file {0}";
            if (key === "app.err.general_error")
                return "ERROR";
            if (key === "app.err.adddoc_wrong_extensionMsg_onlyPicture") {
                return "app.err.adddoc_wrong_extensionMsg_onlyPicture";
            }
        });
    }));

    describe("AddNewDocumentResponse", () => {

        let addDocResponse: ap.viewmodels.documents.AddNewDocumentResponse;
        let files: File[];

        beforeEach(() => {
            files = [];
            files.push(new File([], "myfile.pdf"));
            addDocResponse = new ap.viewmodels.documents.AddNewDocumentResponse(files, null, ap.viewmodels.documents.AddDocumentStatus.Save);
        });

        describe("WHEN a AddNewDocumentResponse is created", () => {
            it("THEN the VM is initialized with the correct values", () => {
                expect(addDocResponse.files).toBe(files);
                expect(addDocResponse.status).toBe(ap.viewmodels.documents.AddDocumentStatus.Save);
            });
        });
    });

    describe("Factory: AddNewDocumentViewModel", () => {
        let files: File[];
        let deferredCancelUploadDocument: angular.IDeferred<any>;
        let deferredSaveDocumentToUpload: angular.IDeferred<ap.controllers.DocumentsToUploadResult>;
        let deferredUploadDocument: angular.IDeferred<ap.misc.DocumentToUpload>;

        beforeEach(() => {
            deferredCancelUploadDocument = $q.defer();
            deferredSaveDocumentToUpload = $q.defer();
            deferredUploadDocument = $q.defer();
            let pictureJson = {
                name: "testpicture.png"
            };
            let pdfJson = {
                name: "testDocument.pdf"
            };

            files = [];
            files.push(<File>pictureJson);
            files.push(<File>pdfJson);

            spyOn(ap.utility.UtilityHelper, "createGuid").and.returnValue("newid");
            spyOn(Utility.FileHelper, "correctFileName").and.callFake(function (fileName) {
                return fileName;
            });
            spyOn(MainController, "showError");

            spyOn(DocumentController, "uploadDocument").and.returnValue(deferredUploadDocument.promise);

            spyOn(DocumentController, "cancelUploadDocument").and.returnValue(deferredCancelUploadDocument.promise);
            spyOn(DocumentController, "saveDocumentToUpload").and.returnValue(deferredSaveDocumentToUpload.promise);
        });

        describe("Feature constructor", () => {
            it("The vm will be created with correct values", () => {
                vm = new ap.viewmodels.documents.AddNewDocumentViewModel(Utility, DocumentController, MainController, $mdDialog, cloudService, interval);
                expect(vm).toBeDefined();
                expect(vm.newDocuments).toBeUndefined();
                expect(vm.canSave).toBeFalsy();
            });
        });

        describe("Feature: title", () => {
            describe("WHEN the vm was init with onlyPicture = true", () => {
                it("THEN, title is build from the code 'app.document.upload_picture_title'", () => {
                    vm = new ap.viewmodels.documents.AddNewDocumentViewModel(Utility, DocumentController, MainController, $mdDialog, cloudService, interval, true);
                    expect(vm.title).toEqual("Add pictures to the project <<VBL>>");
                });

                it("THEN, isOnlyPicture is TRUE", () => {
                    expect(vm.isOnlyPicture).toBeTruthy();
                });
            });
            describe("WHEN the vm was init with onlyPicture = false", () => {
                it("THEN, title is build from the code 'app.document.upload_document_title'", () => {
                    vm = new ap.viewmodels.documents.AddNewDocumentViewModel(Utility, DocumentController, MainController, $mdDialog, cloudService, interval, false);
                    expect(vm.title).toEqual("Add documents to the project <<VBL>>");
                });
            });
        });

        describe("Feature addFiles", () => {
            describe("WHEN the vm have onlyPicture = true and addFiles was called with all files are not image", () => {
                beforeEach(() => {
                    files = [];
                    let pdf1Json = {
                        name: "testDocument1.pdf"
                    };
                    let pdf2Json = {
                        name: "testDocument2.pdf"
                    };
                    files.push(<File>pdf1Json);
                    files.push(<File>pdf2Json);

                    vm = new ap.viewmodels.documents.AddNewDocumentViewModel(Utility, DocumentController, MainController, $mdDialog, cloudService, interval, true);
                    vm.addFiles(files);
                });
                it("THEN, mainController.showError will be called", () => {
                    expect(MainController.showError).toHaveBeenCalledWith("app.err.adddoc_wrong_extensionMsg_onlyPicture", "Error during the upload of the document.", null, null);
                });
                it("AND DocumentController.uploadDocument have not called", () => {
                    expect(DocumentController.uploadDocument).not.toHaveBeenCalled();
                });
                it("AND $mdDialog.hide have not called", () => {
                    expect($mdDialog.hide).not.toHaveBeenCalled();
                });
            });
            describe("WHEN the vm have onlyPicture = true and no folder defined and addFiles was called with the file not image", () => {
                let addNewDocumentResponse: ap.viewmodels.documents.AddNewDocumentResponse;
                beforeEach(() => {
                    addNewDocumentResponse = new ap.viewmodels.documents.AddNewDocumentResponse([files[0]], null, ap.viewmodels.documents.AddDocumentStatus.RequestFolder);
                    vm = new ap.viewmodels.documents.AddNewDocumentViewModel(Utility, DocumentController, MainController, $mdDialog, cloudService, interval, true);
                    vm.addFiles(files);
                });
                it("THEN, mainController.showError will be called", () => {
                    expect(MainController.showError).toHaveBeenCalledWith("app.err.adddoc_wrong_extensionMsg_onlyPicture", "Error during the upload of the document.", null, null);
                });
                it("AND THEN, $mdDialog.hide will be called", () => {
                    expect($mdDialog.hide).toHaveBeenCalledWith(addNewDocumentResponse);
                });
            });
            describe("WHEN the vm have onlyPicture = true and have folder defined and addFiles was called with the file not image", () => {

                beforeEach(() => {
                    let folder = new ap.models.projects.Folder(Utility);
                    folder.Project = new ap.models.projects.Project(Utility);
                    vm = new ap.viewmodels.documents.AddNewDocumentViewModel(Utility, DocumentController, MainController, $mdDialog, cloudService, interval, true, folder);

                    vm.addFiles(files);
                });
                it("THEN, mainController.showError will be called", () => {
                    expect(MainController.showError).toHaveBeenCalledWith("app.err.adddoc_wrong_extensionMsg_onlyPicture", "Error during the upload of the document.", null, null);
                });
                it("AND THEN, DocumentController.uploadDocument will be called", () => {
                    expect((<jasmine.Spy>DocumentController.uploadDocument).calls.count()).toEqual(1);
                });
            });
            describe("WHEN the vm have onlyPicture = false and have folder defined adnd addFiles was called without folder", () => {
                let folder: ap.models.projects.Folder;
                beforeEach(() => {
                    folder = new ap.models.projects.Folder(Utility);
                    folder.Project = new ap.models.projects.Project(Utility);
                    vm = new ap.viewmodels.documents.AddNewDocumentViewModel(Utility, DocumentController, MainController, $mdDialog, cloudService, interval, false, folder);
                });
                it("THEN, the newDocuments property will be update with given files", () => {
                    vm.addFiles(files, folder);
                    expect(vm.newDocuments.length).toEqual(2);
                });
                it("AND THEN, DocumentController.uploadDocument will be called", () => {
                    vm.addFiles(files, folder);
                    expect((<jasmine.Spy>DocumentController.uploadDocument).calls.count()).toEqual(2);
                });

            });
            describe("WHEN the vm have onlyPicture = false and have not folder defined and addFiles was called without folder", () => {
                beforeEach(() => {
                    vm = new ap.viewmodels.documents.AddNewDocumentViewModel(Utility, DocumentController, MainController, $mdDialog, cloudService, interval, false, null);
                });
                it("THEN, $mdDialog.hide will be called", () => {
                    let addNewDocumentResponse: ap.viewmodels.documents.AddNewDocumentResponse = new ap.viewmodels.documents.AddNewDocumentResponse(files, null, ap.viewmodels.documents.AddDocumentStatus.RequestFolder);
                    vm.addFiles(files);
                    expect($mdDialog.hide).toHaveBeenCalledWith(addNewDocumentResponse);
                });
            });
            describe("WHEN the vm have not folder defined and addFiles was called with specified folder", () => {
                let folder: ap.models.projects.Folder;
                beforeEach(() => {
                    folder = new ap.models.projects.Folder(Utility);
                    folder.createByJson({ Id: "F1" });
                    vm = new ap.viewmodels.documents.AddNewDocumentViewModel(Utility, DocumentController, MainController, $mdDialog, cloudService, interval, false, null);
                });
                it("THEN, the folder will be set into the vm", () => {
                    vm.addFiles(files, folder);
                    expect((<jasmine.Spy>DocumentController.uploadDocument).calls.count()).toEqual(2);
                    expect(vm.newDocuments.length).toEqual(2);
                });
            });
            describe("WHEN addFiles was called and there is an error when upload the documents", () => {
                let folder: ap.models.projects.Folder;
                beforeEach(() => {
                    folder = new ap.models.projects.Folder(Utility);
                    folder.Project = new ap.models.projects.Project(Utility);
                    vm = new ap.viewmodels.documents.AddNewDocumentViewModel(Utility, DocumentController, MainController, $mdDialog, cloudService, interval, false, folder);
                });
                it("THEN, the error message will be show to the user", () => {
                    vm.addFiles(files, folder);
                    let documentToUpload: ap.misc.DocumentToUpload = vm.newDocuments[0];
                    documentToUpload.uploadFailError = "error";
                    deferredUploadDocument.reject(documentToUpload);
                    $rootScope.$apply();

                    expect(MainController.showError).toHaveBeenCalledWith("Fail to upload the file testpicture.png", "ERROR", "error", null);

                });

            });

            describe("WHEN addFiles was called and the file uploading is cancel by the server", () => {
                let folder: ap.models.projects.Folder;
                beforeEach(() => {
                    folder = new ap.models.projects.Folder(Utility);
                    folder.Project = new ap.models.projects.Project(Utility);
                    vm = new ap.viewmodels.documents.AddNewDocumentViewModel(Utility, DocumentController, MainController, $mdDialog, cloudService, interval, false, folder);
                });
                it("THEN, the error message will not show", () => {
                    vm.addFiles(files, folder);
                    let documentToUpload: ap.misc.DocumentToUpload = vm.newDocuments[0];
                    documentToUpload.uploadFailError = "CANCEL";
                    deferredUploadDocument.reject(documentToUpload);
                    $rootScope.$apply();
                    expect(MainController.showError).not.toHaveBeenCalled();
                });
            });

        });

        describe("Feature cancelDocument", () => {
            let folder: ap.models.projects.Folder;
            beforeEach(() => {
                folder = new ap.models.projects.Folder(Utility);
                folder.Project = new ap.models.projects.Project(Utility);
                vm = new ap.viewmodels.documents.AddNewDocumentViewModel(Utility, DocumentController, MainController, $mdDialog, cloudService, interval, false, folder);
                vm.addFiles(files);
                deferredUploadDocument.resolve(vm.newDocuments[0]);

                $rootScope.$apply();
            });

            it("THEN, documentController.cancelUploadDocument will be called", () => {
                let itemToRemove = vm.newDocuments[0];
                vm.cancelDocument(itemToRemove);
                deferredUploadDocument.resolve(vm.newDocuments[0]);
                $rootScope.$apply();
                expect(DocumentController.cancelUploadDocument).toHaveBeenCalledWith(itemToRemove);
            });

        });

        describe("Feature: canSave", () => {
            let folder: ap.models.projects.Folder;
            beforeEach(() => {
                folder = new ap.models.projects.Folder(Utility);
                folder.Project = new ap.models.projects.Project(Utility);
                vm = new ap.viewmodels.documents.AddNewDocumentViewModel(Utility, DocumentController, MainController, $mdDialog, cloudService, interval, false, folder);
                vm.addFiles(files);
                deferredUploadDocument.resolve(vm.newDocuments[0]);

                $rootScope.$apply();
            });
            it("THEN, canSave = true when have files added", () => {
                expect(vm.canSave).toBeTruthy();
            });
            it("THEN, canSave = false when all files are removed", () => {
                let file1 = vm.newDocuments[0];
                let file2 = vm.newDocuments[1]
                vm.cancelDocument(file1);
                vm.cancelDocument(file2);
                deferredCancelUploadDocument.resolve();
                $rootScope.$apply();
                expect(vm.canSave).toBeFalsy();
            });
        });

        describe("Feature cancel", () => {
            let folder: ap.models.projects.Folder;
            describe("WHEN there is files in the VM AND the user clicks on CANCEL", () => {
                beforeEach(() => {
                    folder = new ap.models.projects.Folder(Utility);
                    folder.Project = new ap.models.projects.Project(Utility);
                    vm = new ap.viewmodels.documents.AddNewDocumentViewModel(Utility, DocumentController, MainController, $mdDialog, cloudService, interval, false, folder);
                    vm.addFiles(files);
                    deferredUploadDocument.resolve(vm.newDocuments[0]);
                    $rootScope.$apply();
                });
                it("THEN, DocumentController.cancelUploadDocument will be called", () => {
                    vm.cancel();
                    expect((<jasmine.Spy>DocumentController.cancelUploadDocument).calls.count()).toEqual(2);
                    expect((<jasmine.Spy>DocumentController.cancelUploadDocument).calls.argsFor(0)[0]).toEqual(vm.newDocuments[0]);
                    expect((<jasmine.Spy>DocumentController.cancelUploadDocument).calls.argsFor(1)[0]).toEqual(vm.newDocuments[1]);
                });
                it("AND THEN, $mdDialog.hide will be called", () => {
                    vm.cancel();
                    deferredCancelUploadDocument.resolve();
                    $rootScope.$apply();
                    expect($mdDialog.hide).toHaveBeenCalledWith(ap.viewmodels.documents.AddDocumentStatus.Cancel);
                });
            });

            describe("WHEN there is no file in the VM AND the user clicks on CANCEL", () => {
                beforeEach(() => {
                    folder = new ap.models.projects.Folder(Utility);
                    folder.Project = new ap.models.projects.Project(Utility);
                    vm = new ap.viewmodels.documents.AddNewDocumentViewModel(Utility, DocumentController, MainController, $mdDialog, cloudService, interval, false, folder);

                    vm.cancel();
                    $rootScope.$apply();
                });
                it("THEN $mdDialog.hide is called with 'Cancel'", () => {
                    expect($mdDialog.hide).toHaveBeenCalledWith(ap.viewmodels.documents.AddDocumentStatus.Cancel);
                });
            });
        });
        describe("Feature save", () => {
            let folder: ap.models.projects.Folder;
            let callback: jasmine.Spy;
            beforeEach(() => {
                callback = jasmine.createSpy("successcallback");
                folder = new ap.models.projects.Folder(Utility);
                folder.Project = new ap.models.projects.Project(Utility);
                vm = new ap.viewmodels.documents.AddNewDocumentViewModel(Utility, DocumentController, MainController, $mdDialog, cloudService, interval, false, folder);

            });
            describe("WHEN save is called with a new document", () => {
                beforeEach(() => {
                    vm.addFiles(files);
                    deferredUploadDocument.resolve(vm.newDocuments[0]);
                    $rootScope.$apply();
                    specHelper.general.spyProperty(ap.viewmodels.documents.AddNewDocumentViewModel.prototype, "canSave", specHelper.PropertyAccessor.Get).and.returnValue(true);

                    vm.save();
                });
                afterEach(() => {
                    specHelper.general.offSpyProperty(ap.viewmodels.documents.AddNewDocumentViewModel.prototype, "canSave", specHelper.PropertyAccessor.Get);
                });
                it("THEN, DocumentController.saveDocumentToUpload will be called", () => {
                    expect(DocumentController.saveDocumentToUpload).toHaveBeenCalledWith(vm.newDocuments);
                });
                it("AND THEN, $mdDialog.hide will be called", () => {
                    deferredSaveDocumentToUpload.resolve();
                    $rootScope.$apply();
                    expect($mdDialog.hide).toHaveBeenCalledWith(ap.viewmodels.documents.AddDocumentStatus.Save);
                });
            });
            describe("WHEN save is called without a new document", () => {
                it("THEN, an error is thrown", () => {
                    expect(() => {
                        vm.save();
                    }).toThrowError("Cannot call save when canSave = false");
                });
            });
        });
    });
});