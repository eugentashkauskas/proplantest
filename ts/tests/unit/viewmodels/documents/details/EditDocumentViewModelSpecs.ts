describe("Module ap-viewmodels - EditDocumentViewModel", () => {

    let $rootScope: angular.IRootScopeService, $scope: angular.IScope;
    let Utility: ap.utility.UtilityHelper, UserContext: ap.utility.UserContext;
    let vm: ap.viewmodels.documents.EditDocumentViewModel;
    let docVm: ap.viewmodels.documents.DocumentViewModel;
    let doc: ap.models.documents.Document;
    let DocumentController: ap.controllers.DocumentController;
    let MainController: ap.controllers.MainController;
    let ControllersManager: ap.controllers.ControllersManager;
    let ServicesManager: ap.services.ServicesManager;
    let $mdDialog: angular.material.IDialogService;
    let $q: angular.IQService;
    let $timeout: angular.ITimeoutService;
    let $mdSidenav, Api: ap.services.apiHelper.Api;

    beforeEach(() => {
        let $window = specHelper.createWindowStub();
        $window.navigator.userLanguage = undefined;
        $window.navigator.language = 'en_US';
        angular.mock.module(function ($provide) {
            $provide.value('$window', $window);
            $provide.value('$mdDialog', $mdDialog);
            $mdSidenav = specHelper.utility.stubToggleMdSideNav($provide);
        });
    });

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
        angular.mock.module(function ($provide) {
            $provide.factory('$mdDialog', ["$q", function ($q) {
                return specHelper.utility.stubShowMdDialog($q);
            }]);
        });
    });

    beforeEach(inject(function (_$q_, _Api_, _$rootScope_, _UserContext_, _Utility_, _DocumentController_, _$mdDialog_, _$timeout_, _MainController_, _ControllersManager_, _ServicesManager_) {
        Utility = _Utility_;
        UserContext = _UserContext_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        DocumentController = _DocumentController_;
        ControllersManager = _ControllersManager_;
        ServicesManager = _ServicesManager_;
        MainController = _MainController_;
        specHelper.utility.stubRootUrl(Utility);
        specHelper.userContext.stub(Utility);
        Api = _Api_;
        $q = _$q_;
        $mdDialog = _$mdDialog_;
        $timeout = _$timeout_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();

        doc = new ap.models.documents.Document(Utility);

        doc.FolderPath = "123";
        doc.Name = "test name";
        doc.Author = new ap.models.actors.User(Utility);
        doc.Author.Alias = "author@vn.netika.com";
        doc.Author.DisplayName = "Author Display";
        doc.Date = new Date(Date.now());
        doc.Subject = "Test subject";
        doc.References = "Test references";
        doc.Scale = 0.5;
        doc.UploadedBy = new ap.models.actors.User(Utility);
        doc.UploadedBy.Alias = "upload@vn.netika.com";
        doc.Author = new ap.models.actors.User(Utility);
        doc.Author.Alias = "upload@vn.netika.com";
        doc.SmallThumbWidth = 20;
        doc.SmallThumbHeight = 20;
        doc.RotateAngle = 90;
        doc.TilesPath = "123/456";
        doc.ImageUrl = "123/789";
        doc.VersionCount = 1;
        doc.IsArchived = true;
        doc.Versions = [];
        let v = new ap.models.documents.Version(Utility);
        v.VersionIndex = 0;
        doc.Versions.push(v);

        let project: ap.models.projects.Project = new ap.models.projects.Project(Utility);
        project.createByJson({
            Id: "12"
        });
        project.UserAccessRight = new ap.models.accessRights.ProjectAccessRight(Utility);
        spyOn(MainController, "currentProject").and.returnValue(project);

        spyOn(Utility.Translator, "getTranslation").and.callFake(function (key) {
            if (key === "app.document.addversion.title")
                return "Add a version to {0}";
            if (key === "app.document.editmetadata.title")
                return "Edit metadata of the document";
            if (key === "app.document.uploadfile_fail")
                return "Fail to upload the file {0}";
            if (key === "app.err.general_error")
                return "ERROR";
            if (key === "app.document.addversion.wrong_workingfile")
                return "The file extension '{0}' is not allow for working file";
        });
        specHelper.general.initStub(ap.viewmodels.notes.AddEditNoteViewModel, "initMeetingSelector");
        let noteWorkspaceVm: ap.viewmodels.notes.NoteWorkspaceViewModel;
        noteWorkspaceVm = new ap.viewmodels.notes.NoteWorkspaceViewModel($scope, $mdSidenav, Utility, Api, $q, $mdDialog, $timeout, null, null, null, ControllersManager, ServicesManager, null, false);

        specHelper.general.spyProperty(ap.viewmodels.documents.DocumentViewModel.prototype, "noteWorkspaceVm", specHelper.PropertyAccessor.Get).and.returnValue(noteWorkspaceVm);
        
    }));
    afterEach(() => {
        specHelper.general.offSpyProperty(ap.viewmodels.documents.DocumentViewModel.prototype, "noteWorkspaceVm", specHelper.PropertyAccessor.Get);
        specHelper.general.removeStub(ap.viewmodels.notes.AddEditNoteViewModel, "initMeetingSelector");
    });

    function createDocumentVm() {
        return new ap.viewmodels.documents.DocumentViewModel(Utility, $q, ControllersManager, ServicesManager);
    }

    describe("Constructor", () => {
        describe("WHEN EditDocumentViewModel is on new entity", () => {
            beforeEach(() => {
                docVm = createDocumentVm();
                docVm.init(doc);

                vm = new ap.viewmodels.documents.EditDocumentViewModel(Utility, $mdDialog, $timeout, $q, $scope, ControllersManager, ServicesManager, docVm);
            });
            it("THEN, DocumentViewModel is expected", () => {
                expect(vm.documentViewModel).toBe(docVm);
            });
            it("THEN, Can save", () => {
                expect(vm.canSave).toBeTruthy();
            });
        });

        describe("WHEN EditDocumentViewModel is on existing entity", () => {
            beforeEach(() => {
                docVm = createDocumentVm();

                let docJSON = {
                    Id: "28A2D91F-C098-40D2-8729-91E66785F424",
                    EntityVersion: 1,
                    IsArchived: true,
                    VersionCount: 0,
                    Author: new ap.models.actors.User(Utility)
                };
                doc.createByJson(docJSON);
                docVm.init(doc);

                vm = new ap.viewmodels.documents.EditDocumentViewModel(Utility, $mdDialog, $timeout, $q, $scope, ControllersManager, ServicesManager, docVm);
            });
            it("THEN, DocumentViewModel is expected", () => {
                expect(vm.documentViewModel).toBe(docVm);
            });
            it("THEN, Cannot save", () => {
                expect(vm.canSave).toBeFalsy();
            });
            it("THEN, the title is correct", () => {
                expect(vm.title).toEqual("Edit metadata of the document");
            });
        });

        describe("WHEN EditDocumentViewModel is for add new version", () => {
            beforeEach(() => {
                docVm = createDocumentVm();
                let docJSON = {
                    Id: "D1",
                    Name: "Doc1",
                    VersionCount: 0,
                    Author: new ap.models.actors.User(Utility)
                };
                doc.createByJson(docJSON);
                docVm.init(doc);
                vm = new ap.viewmodels.documents.EditDocumentViewModel(Utility, $mdDialog, $timeout, $q, $scope, ControllersManager, ServicesManager, docVm, true, "Versions", "Pages");
            });
            it("THEN, the vm is defined", () => {
                expect(vm).toBeDefined();
            });
            it("THEN, isToAddVersion is true", () => {
                expect(vm.isToAddVersion).toBeTruthy();
            });
            it("THEN, the originalDocumentViewModel is dedined", () => {
                expect(vm.originalDocumentViewModel).toBe(docVm);
            });
            it("THEN, DocumentViewModel is null", () => {
                expect(vm.documentViewModel).toBeNull();
            });
            it("THEN, the title is correct", () => {
                expect(vm.title).toEqual("Add a version to Doc1");
            });
        });
    });

    describe("Feature: canSave", () => {
        describe("Check canSave in Edit mode", () => {
            beforeEach(() => {
                docVm = createDocumentVm();
                let docJSON = {
                    Id: "28A2D91F-C098-40D2-8729-91E66785F424",
                    EntityVersion: 1,
                    IsArchived: true,
                    Name: "name",
                    Subject: "subject",
                    References: "references",
                    VersionCount: 0,
                    Author: new ap.models.actors.User(Utility)
                };
                doc.createByJson(docJSON);
                docVm.init(doc);
                vm = new ap.viewmodels.documents.EditDocumentViewModel(Utility, $mdDialog, $timeout, $q, $scope, ControllersManager, ServicesManager, docVm);
            });
            describe("WHEN nothing change", () => {
                it("THEN, cannot save", () => { expect(vm.canSave).toBeFalsy(); });
            });
            describe("WHEN name is empty", () => {
                beforeEach(() => { docVm.name = ""; });
                it("THEN, cannot save", () => {
                    expect(vm.canSave).toBeFalsy();
                });
            });
            describe("WHEN subject is empty", () => {
                beforeEach(() => { docVm.subject = ""; });
                it("THEN, can save", () => {
                    expect(vm.canSave).toBeTruthy();
                });
            });
            describe("WHEN references is empty", () => {
                beforeEach(() => { docVm.references = ""; });
                it("THEN, can save", () => {
                    expect(vm.canSave).toBeTruthy();
                });
            });
            describe("WHEN There is pendding upload source document", () => {
                let file: File;
                let uploadDef: angular.IDeferred<any>;
                beforeEach(() => {
                    uploadDef = $q.defer();
                    spyOn(DocumentController, "uploadDocument").and.returnValue(uploadDef.promise);
                    let fileJson = {
                        name: "testpicture.png"
                    };
                    file = <File>fileJson;
                    vm.addSourceFile([file]);
                });
                it("THEN, can NOT save", () => {
                    expect(vm.canSave).toBeFalsy();
                });
            });
        });

        describe("Check canSave in add version mode", () => {
            let versionFile: File;
            let cancelDocumentToUploadDefered;
            let uploadDef: angular.IDeferred<any>;

            beforeEach(() => {
                cancelDocumentToUploadDefered = $q.defer();
                uploadDef = $q.defer();

                let fileJson = { name: "testpdf.pdf" };
                versionFile = <File>fileJson;

                spyOn(DocumentController, "uploadDocument").and.returnValue(uploadDef.promise);
                spyOn(DocumentController, "cancelUploadDocument").and.returnValue(cancelDocumentToUploadDefered.promise);

                docVm = createDocumentVm();
                let docJSON = {
                    Id: "D1",
                    VersionCount: 0,
                    Author: new ap.models.actors.User(Utility)
                };
                doc.createByJson(docJSON);
                docVm.init(doc);
                vm = new ap.viewmodels.documents.EditDocumentViewModel(Utility, $mdDialog, $timeout, $q, $scope, ControllersManager, ServicesManager, docVm, true, "Versions", "Pages");
            });
            
            it("canSave = false by default", () => { expect(vm.canSave).toBeFalsy(); });
            it("canSave = true after add a file", () => {
                vm.addVersion(versionFile);
                uploadDef.resolve();
                $rootScope.$apply();

                expect(vm.canSave).toBeTruthy();
            });
            it("canSave = fasle when all files removed", () => {
                vm.addVersion(versionFile);
                uploadDef.resolve();
                vm.removeWorkingFile();
                cancelDocumentToUploadDefered.resolve();
                $rootScope.$apply();
                expect(vm.canSave).toBeFalsy();
            });
        });
    });

    describe("Feature: Save", () => {
        describe("WHEN call save method for edit mode", () => {
            beforeEach(() => {
                docVm = createDocumentVm();
                docVm.init(doc);

                vm = new ap.viewmodels.documents.EditDocumentViewModel(Utility, $mdDialog, $timeout, $q, $scope, ControllersManager, ServicesManager, docVm);
                spyOn(DocumentController, "saveDocument");

                vm.save();
            });
            it("THEN, documentController.saveDocument is called to save the document", () => {
                expect(DocumentController.saveDocument).toHaveBeenCalledWith(doc);
            });
        });

        describe("WHEN call save method for add version mode", () => {
            let versionFile: File;
            let saveNewVersionDefered;
            let uploadDef: angular.IDeferred<any>;
            beforeEach(() => {
                saveNewVersionDefered = $q.defer();
                uploadDef = $q.defer();

                let fileJson = { name: "testpdf.pdf" };
                versionFile = <File>fileJson;
                spyOn(DocumentController, "uploadDocument").and.returnValue(uploadDef.promise);
                spyOn(DocumentController, "saveNewVersion").and.returnValue(saveNewVersionDefered.promise);
                docVm = createDocumentVm();
                let docJSON = {
                    Id: "D1",
                    Name: "OldName",
                    VersionCount: 0,
                    Author: new ap.models.actors.User(Utility)
                };
                doc.createByJson(docJSON);
                docVm.init(doc);
                vm = new ap.viewmodels.documents.EditDocumentViewModel(Utility, $mdDialog, $timeout, $q, $scope, ControllersManager, ServicesManager, docVm, true, "Versions", "Pages");
                vm.addVersion(versionFile);
                uploadDef.resolve();
                $rootScope.$apply();
            });
            it("THEN name of version will be keep if documentToUpload.keepOldName = true", () => {
                vm.documentToUpload.keepOldName = true;
                vm.save();
                expect((<ap.models.documents.Document>vm.documentToUpload.document).Name).toEqual("OldName");
            });
            it("THEN name of version will be version name if documentToUpload.keepOldName = false", () => {
                vm.documentToUpload.keepOldName = false;
                vm.save();
                expect((<ap.models.documents.Document>vm.documentToUpload.document).Name).toEqual("testpdf");
            });

            it("THEN, documentController.saveNewVersion method will be call", () => {
                vm.save();
                expect(DocumentController.saveNewVersion).toHaveBeenCalledWith(vm.documentToUpload, "Versions", "Pages");
            });
        });

        describe("WHEN save or add version finish", () => {
            beforeEach(() => {
                docVm = createDocumentVm();
                docVm.init(doc);
                vm = new ap.viewmodels.documents.EditDocumentViewModel(Utility, $mdDialog, $timeout, $q, $scope, ControllersManager, ServicesManager, docVm);
                
            });
            it("THEN, close dialog when documentcontroller fire event 'documentupdated'", () => {
                specHelper.general.raiseEvent(DocumentController, "documentupdated", new ap.controllers.EntityUpdatedEvent<ap.models.documents.Document>(doc));
                expect($mdDialog.hide).toHaveBeenCalled();
            });
            it("THEN, close dialog when documentcontroller fire event 'versionadded'", () => {
                specHelper.general.raiseEvent(DocumentController, "versionadded", null);
                expect($mdDialog.hide).toHaveBeenCalled();
            });
        });
    });

    describe("Feature: Cancel", () => {
        describe("WHEN call cancel method and NOT pennding source document to upload", () => {
            beforeEach(() => {
                docVm = createDocumentVm();
                docVm.init(doc);

                vm = new ap.viewmodels.documents.EditDocumentViewModel(Utility, $mdDialog, $timeout, $q, $scope, ControllersManager, ServicesManager, docVm);

                vm.cancel();
            });
            it("THEN, hide dialog", () => {
                expect($mdDialog.hide).toHaveBeenCalled();
            });
        });
        describe("WHEN call cancel method and pennding source document to upload", () => {
            let cancelDef: angular.IDeferred<any>;
            let uploadDef: angular.IDeferred<any>;
            beforeEach(() => {
                cancelDef = $q.defer();
                uploadDef = $q.defer();

                docVm = createDocumentVm();
                docVm.init(doc);
                
                vm = new ap.viewmodels.documents.EditDocumentViewModel(Utility, $mdDialog, $timeout, $q, $scope, ControllersManager, ServicesManager, docVm);

                spyOn(DocumentController, "uploadDocument").and.returnValue(uploadDef.promise);

                let fileJson = {
                    name: "testpicture.png"
                };
                let file = <File>fileJson;

                vm.addSourceFile([file]);
                uploadDef.resolve();
                $rootScope.$apply();

                spyOn(DocumentController, "cancelUploadDocument").and.returnValue(cancelDef.promise);
                vm.cancel();
                cancelDef.resolve(vm.documentToUpload);
                $rootScope.$apply();
            });
            it("THEN, DocumentController.cancelUploadDocument is called", () => {
                expect(DocumentController.cancelUploadDocument).toHaveBeenCalledWith(vm.documentToUpload);
            });
            it("THEN, documentViewModel.documentSourceFile is empty", () => {
                expect(docVm.documentSourceFile).toBeNull();
            });
            it("THEN, hide dialog", () => {
                expect($mdDialog.hide).toHaveBeenCalled();
            });
        });
    });

    describe("Feature: removeSourceFile without confirm", () => {
        let uploadDef: angular.IDeferred<any>;
        beforeEach(() => {
            uploadDef = $q.defer();

            docVm = createDocumentVm();
            docVm.init(doc);
            spyOn(DocumentController, "uploadDocument").and.returnValue(uploadDef.promise);
            vm = new ap.viewmodels.documents.EditDocumentViewModel(Utility, $mdDialog, $timeout, $q, $scope, ControllersManager, ServicesManager, docVm);

            let fileJson = {
                name: "testpicture.png"
            };
            let file = <File>fileJson;

            vm.addSourceFile([file]);
            uploadDef.resolve();

            let cancelDef = $q.defer();
            spyOn(DocumentController, "cancelUploadDocument").and.returnValue(cancelDef.promise);

            vm.removeSourceFile(false);

            cancelDef.resolve(vm.documentToUpload);
            $rootScope.$apply();
        });
        it("THEN, DocumentController.cancelUploadDocument is called", () => {
            expect(DocumentController.cancelUploadDocument).toHaveBeenCalledWith(vm.documentToUpload, ap.controllers.DocumentToUploadType.SourceFile);
        });
        it("THEN, sourceFile is null", () => {
            expect(vm.documentToUpload.sourceFile).toBeNull();
        });
        it("THEN, hasSourceFile is false", () => {
            expect(vm.hasSourceFile).toBeFalsy();
        });
        it("THEN, documentViewModel.documentSourceFile is empty", () => {
            expect(docVm.documentSourceFile).toEqual("");
        });
        it("THEN, will throw error of the source file is removed", () => {
            expect(function () { vm.removeSourceFile(false) }).toThrowError("Sourcefile already empty");
        });
    });

    describe("Feature: removeSourceFile with confirm", () => {
        describe("WHEN call removeSourceFile method and the answer is confirmed", () => {
            let cofirmKeyCalled: string;
            let rejectKeyCalled: string;
            let cancelDef: angular.IDeferred<any>;
            let uploadDef: angular.IDeferred<any>;

            beforeEach(() => {
                uploadDef = $q.defer();
                spyOn(DocumentController, "uploadDocument").and.returnValue(uploadDef.promise);
                docVm = createDocumentVm();
                docVm.init(doc);
                let fileJson = {
                    name: "testpicture.png"
                };
                let file = <File>fileJson;

                vm = new ap.viewmodels.documents.EditDocumentViewModel(Utility, $mdDialog, $timeout, $q, $scope, ControllersManager, ServicesManager, docVm);

                vm.addSourceFile([file]);

                uploadDef.resolve();
                
                let cancelDef = $q.defer();
                spyOn(DocumentController, "cancelUploadDocument").and.returnValue(cancelDef.promise);                

                spyOn(MainController, "showConfirmKey").and.callFake(function (message, title, callback, isMultiLines, confirmKey, rejectKey) {
                    cofirmKeyCalled = confirmKey;
                    rejectKeyCalled = rejectKey;
                    callback(ap.controllers.MessageResult.Positive);
                });

                vm.removeSourceFile();

                cancelDef.resolve();
                $scope.$apply();
            });
            it("THEN, MainController.showConfirmKey is called", () => {
                expect(MainController.showConfirmKey).toHaveBeenCalled();
            });
            it("THEN, MainController.showConfirmKey is called with confirmKey is 'Remove'", () => {
                expect(cofirmKeyCalled).toEqual("Remove");
            });
            it("THEN, MainController.showConfirmKey is called with rejectKey is 'Cancel'", () => {
                expect(rejectKeyCalled).toEqual("Cancel");
            });
            it("THEN, documentDetailViewModel.documentSourceFile is empty", () => {
                expect(docVm.documentSourceFile).toEqual("");
            });
            it("THEN, DocumentController.cancelUploadDocument is called", () => {
                expect(DocumentController.cancelUploadDocument).toHaveBeenCalledWith(vm.documentToUpload, ap.controllers.DocumentToUploadType.SourceFile);
            });
        });

        describe("WHEN call removeSourceFile method and the answer is rejected", () => {
            let cofirmKeyCalled: string;
            let rejectKeyCalled: string;
            let uploadDef: angular.IDeferred<any>;
            beforeEach(() => {
                uploadDef = $q.defer();

                spyOn(DocumentController, "uploadDocument").and.returnValue(uploadDef.promise);

                docVm = createDocumentVm();
                docVm.init(doc);
                let fileJson = {
                    name: "testpicture.png"
                };
                let file = <File>fileJson;

                vm = new ap.viewmodels.documents.EditDocumentViewModel(Utility, $mdDialog, $timeout, $q, $scope, ControllersManager, ServicesManager, docVm);
                vm.addSourceFile([file]);
                uploadDef.resolve();

                spyOn(MainController, "showConfirmKey").and.callFake(function (message, title, callback, isMultiLines, confirmKey, rejectKey) {
                    cofirmKeyCalled = confirmKey;
                    rejectKeyCalled = rejectKey;
                    callback(ap.controllers.MessageResult.Negative);
                });
                vm.removeSourceFile();
            });            
            it("docVm.documentSourceFile is NOT changed", () => {
                expect(docVm.documentSourceFile).toEqual("testpicture.png");
            });
        });
    });

    describe("Feature: addSourceFile", () => {
        describe("WHEN call addSourceFile method with 2 files", () => {
            let file: File;
            beforeEach(() => {
                docVm = createDocumentVm();
                docVm.init(doc);

                spyOn(MainController, "showErrorKey");

                vm = new ap.viewmodels.documents.EditDocumentViewModel(Utility, $mdDialog, $timeout, $q, $scope, ControllersManager, ServicesManager, docVm);

                let fileJson = {
                    name: "testpicture.png"
                };
                file = <File>fileJson;

                vm.addSourceFile([file, file]);
            });
            it("THEN, error is show", () => {
                expect(MainController.showErrorKey).toHaveBeenCalledWith("app.document.select_namyfiles", "app.err.general_error", null, null);
            });
        });

        describe("WHEN call addSourceFile method with a file and the upload fail", () => {
            let file: File;
            let uploadFailDef: angular.IDeferred<any>;
            let failDocToUpload: ap.misc.DocumentToUpload;
            beforeEach(() => {
                docVm = createDocumentVm();
                docVm.init(doc);

                let uploadFailDef = $q.defer();
                spyOn(DocumentController, "uploadDocument").and.returnValue(uploadFailDef.promise);
                spyOn(MainController, "showErrorKey");

                vm = new ap.viewmodels.documents.EditDocumentViewModel(Utility, $mdDialog, $timeout, $q, $scope, ControllersManager, ServicesManager, docVm);

                let fileJson = {
                    name: "testpicture.png"
                };
                file = <File>fileJson;

                failDocToUpload = new ap.misc.DocumentToUpload(Utility, doc);
                failDocToUpload.uploadFailError = "upload failed";               

                vm.addSourceFile([file]);

                uploadFailDef.reject(failDocToUpload);
                $rootScope.$apply();
            });
            it("THEN, Error is shown", () => {
                expect(MainController.showErrorKey).toHaveBeenCalledWith("app.document.uploadsource_fail", "app.err.general_error", "upload failed", null);
            });
        });

        describe("WHEN call addSourceFile method with a file and the uploading is cancel by the server", () => {
            let file: File;
            let uploadFailDef: angular.IDeferred<any>;
            let failDocToUpload: ap.misc.DocumentToUpload;
            beforeEach(() => {
                docVm = createDocumentVm();
                docVm.init(doc);

                let uploadFailDef = $q.defer();
                spyOn(DocumentController, "uploadDocument").and.returnValue(uploadFailDef.promise);
                spyOn(MainController, "showErrorKey");

                vm = new ap.viewmodels.documents.EditDocumentViewModel(Utility, $mdDialog, $timeout, $q, $scope, ControllersManager, ServicesManager, docVm);

                let fileJson = {
                    name: "testpicture.png"
                };
                file = <File>fileJson;

                failDocToUpload = new ap.misc.DocumentToUpload(Utility, doc);
                failDocToUpload.uploadFailError = "CANCEL";

                vm.addSourceFile([file]);

                uploadFailDef.reject(failDocToUpload);
                $rootScope.$apply();
            });
            it("THEN, Error is not shown", () => {
                expect(MainController.showErrorKey).not.toHaveBeenCalled();
            });
        });
    });

    describe("Feature: addVersion", () => {
        let uploadDef: angular.IDeferred<any>;
        let file: File;
        let sourceFile: File;

        beforeEach(() => {
            uploadDef = $q.defer();
            spyOn(DocumentController, "uploadDocument").and.returnValue(uploadDef.promise);

            docVm = createDocumentVm();
            docVm.init(doc);
            
            vm = new ap.viewmodels.documents.EditDocumentViewModel(Utility, $mdDialog, $timeout, $q, $scope, ControllersManager, ServicesManager, docVm, true);
            let fileJson = {
                name: "testpicture.png"
            };
            file = <File>fileJson;

            let sourceFileJson = {
                name: "testdoc.doc"
            };
            sourceFile = <File>sourceFileJson;
        });
        describe("WHEN addVersion was called at the first time with the working file", () => {
            it("THEN, the _documentToUpload will be created with correct file", () => {
                vm.addVersion(file);
                expect(vm.documentToUpload).toBeDefined();
                expect(vm.documentToUpload).not.toBeNull();
                expect(vm.documentToUpload.workingFile).toBe(file);
            });

            it("THEN, the DocumentController.uploadDocument will be called", () => {
                vm.addVersion(file);
                expect(DocumentController.uploadDocument).toHaveBeenCalledWith(vm.documentToUpload);
            });

            it("THEN, hasDocumentToUpload = true", () => {
                vm.addVersion(file);
                expect(vm.hasDocumentToUpload).toBeTruthy();
            });
            it("THEN, hasWorkingFile = true", () => {
                vm.addVersion(file);
                expect(vm.hasWorkingFile).toBeTruthy();
            });
            it("THEN, newVersionName is correct with the file name", () => {
                vm.addVersion(file);
                expect(vm.newVersionName).toEqual("testpicture");
            });
            it("THEN, hasSourceFile = false", () => {
                vm.addVersion(file);
                expect(vm.hasSourceFile).toBeFalsy();
            });

            it("THEN, will show the error if the uploading have error and the file will remove", () => {
                spyOn(MainController, "showError");

                vm.addVersion(file);
                vm.documentToUpload.uploadFailError = "error";
                vm.documentToUpload.workingFileStatus = ap.misc.UploadStatus.InProgress;
                vm.documentToUpload.workingFileStatus = ap.misc.UploadStatus.Failed;
                uploadDef.reject(vm.documentToUpload);
                $rootScope.$apply();
                expect(MainController.showError).toHaveBeenCalledWith("Fail to upload the file testpicture.png", "ERROR", "error", null);
                expect(vm.hasWorkingFile).toBeFalsy();
            });

            it("THEN, the file will removed and not show the message if the uploading is cancel by the server", () => {
                spyOn(MainController, "showError");
                vm.addVersion(file);
                vm.documentToUpload.uploadFailError = "CANCEL";
                vm.documentToUpload.workingFileStatus = ap.misc.UploadStatus.InProgress;
                vm.documentToUpload.workingFileStatus = ap.misc.UploadStatus.Failed;
                uploadDef.reject(vm.documentToUpload);
                $rootScope.$apply();
                expect(MainController.showError).not.toHaveBeenCalled();
                expect(vm.hasWorkingFile).toBeFalsy();
            });


        });
        describe("WHEN addVersion was called at the first time with the source file", () => {
            it("THEN, the _documentToUpload will be created with correct file", () => {
                vm.addVersion(sourceFile);
                expect(vm.documentToUpload).toBeDefined();
                expect(vm.documentToUpload).not.toBeNull();
                expect(vm.documentToUpload.sourceFile).toBe(sourceFile);
                expect(vm.documentToUpload.workingFile).toBeNull();
            });

            it("THEN, the DocumentController.uploadDocument will be called", () => {
                vm.addVersion(sourceFile);
                expect(DocumentController.uploadDocument).toHaveBeenCalledWith(vm.documentToUpload);
            });

            it("THEN, hasDocumentToUpload = true", () => {
                vm.addVersion(sourceFile);
                expect(vm.hasDocumentToUpload).toBeTruthy();
            });
            it("THEN, hasSourceFile = true", () => {
                vm.addVersion(sourceFile);
                expect(vm.hasSourceFile).toBeTruthy();
            });
            it("THEN, hasWorkingFile = false", () => {
                vm.addVersion(sourceFile);
                expect(vm.hasWorkingFile).toBeFalsy();
            });
            it("THEN, newVersionName is correct with the file name", () => {
                vm.addVersion(sourceFile);
                expect(vm.newVersionName).toEqual("testdoc");
            });
            it("THEN, hasSourceFile = true", () => {
                vm.addVersion(sourceFile);
                expect(vm.hasSourceFile).toBeTruthy();
            });
            it("THEN, will show the error if the uploading have error and the file will remove", () => {
                spyOn(MainController, "showError");

                vm.addVersion(sourceFile);
                vm.documentToUpload.uploadFailError = "error";
                vm.documentToUpload.sourceFileStatus = ap.misc.UploadStatus.InProgress;
                vm.documentToUpload.sourceFileStatus = ap.misc.UploadStatus.Failed;
                uploadDef.reject(vm.documentToUpload);
                $rootScope.$apply();
                expect(MainController.showError).toHaveBeenCalledWith("Fail to upload the file testdoc.doc", "ERROR", "error", null);
                expect(vm.hasSourceFile).toBeFalsy();
            });

        });
        describe("WHEN addVersion was called at the second time with the source file", () => {
            beforeEach(() => {
                vm.addVersion(file);
                uploadDef.resolve();
                $rootScope.$apply();
            });
            it("THEN, the documentToUpload.updateSourceFile will be called", () => {
                spyOn(vm.documentToUpload, "updateSourceFile").and.callThrough();
                let testSourceFile = <File>({ name: "testdoc.doc" });
                vm.addVersion(testSourceFile);
                $rootScope.$apply();
                expect(vm.documentToUpload.updateSourceFile).toHaveBeenCalledWith(testSourceFile);
            });
            it("THEN, hasSourceFile = true", () => {
                spyOn(vm.documentToUpload, "updateSourceFile").and.callThrough();
                let testSourceFile = <File>({ name: "testdoc.doc" });
                vm.addVersion(testSourceFile);
                $rootScope.$apply();
                expect(vm.hasSourceFile).toBeTruthy();
            });
        });
        describe("WHEN addVersion was called at the first time and the second time with the source file", () => {
            beforeEach(() => {
                spyOn(MainController, "showError");
                vm.addVersion(sourceFile);
                uploadDef.resolve();
                $rootScope.$apply();
                let testSourceFile = <File>({ name: "testdoc.doc" });
                vm.addVersion(testSourceFile);
                $rootScope.$apply();

            });
            it("THEN, the error message will show to the user", () => {

                expect(MainController.showError).toHaveBeenCalledWith("The file extension 'doc' is not allow for working file", "ERROR", null, null);
            });
            it("THEN, the working file still null", () => {
                expect(vm.documentToUpload.workingFile).toBeNull();
            });
            
        });
    });

    describe("Feature: removeWorkingFile", () => {
        let uploadDef: angular.IDeferred<any>;
        let cancelDef: angular.IDeferred<any>;
        beforeEach(() => {
            uploadDef = $q.defer();
            cancelDef = $q.defer();
            spyOn(DocumentController, "uploadDocument").and.returnValue(uploadDef.promise);
            spyOn(DocumentController, "cancelUploadDocument").and.returnValue(cancelDef.promise);

            docVm = createDocumentVm();
            docVm.init(doc);
            
            vm = new ap.viewmodels.documents.EditDocumentViewModel(Utility, $mdDialog, $timeout, $q, $scope, ControllersManager, ServicesManager, docVm, true);

            let fileJson = {
                name: "testpicture.png"
            };
            let file = <File>fileJson;

            vm.addVersion(file);

            uploadDef.resolve();

            $rootScope.$apply();
        });
        it("THEN, DocumentController.cancelUploadDocument is called", () => {
            vm.removeWorkingFile();
            expect(DocumentController.cancelUploadDocument).toHaveBeenCalledWith(vm.documentToUpload, ap.controllers.DocumentToUploadType.WorkingFile);
        });
        it("THEN, documentToUpload is null and hasWorkingFile is false", () => {
            vm.removeWorkingFile();
            cancelDef.resolve(vm.documentToUpload);
            $rootScope.$apply();
            expect(vm.documentToUpload).toBeNull();
            expect(vm.hasWorkingFile).toBeNull();
        });
    });
});