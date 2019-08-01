'use strict';
describe("Module ap-viewmodels - DeleteDocumentViewModel", () => {
    let nmp = ap.viewmodels.reports;
    let MainController: ap.controllers.MainController, Utility: ap.utility.UtilityHelper, Api: ap.services.apiHelper.Api,
        UserContext: ap.utility.UserContext;
    let $controller: angular.IControllerService, $rootScope: angular.IRootScopeService, $scope: angular.IScope, _deferred: angular.IDeferred<ap.services.apiHelper.ApiResponse>,
        $q: angular.IQService, $timeout: angular.ITimeoutService, $compile: angular.ICompileService;
    let mdDialogDeferred: angular.IDeferred<any>;
    let $mdDialog: angular.material.IDialogService;
    let DocumentController: ap.controllers.DocumentController;

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

        angular.mock.module(function ($provide) {
            $provide.factory('$mdDialog', ["$q", function ($q) {
                return specHelper.utility.stubShowMdDialog($q);
            }]);
        });
    });

    beforeEach(inject(function (_$rootScope_, _$q_, _$timeout_, _$compile_, _UserContext_, _Utility_, _Api_, _MainController_, _$controller_, _$mdDialog_, _DocumentController_) {
        MainController = _MainController_;
        Utility = _Utility_;
        UserContext = _UserContext_;
        DocumentController = _DocumentController_;
        $mdDialog = _$mdDialog_;
        Api = _Api_;
        $q = _$q_;
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $timeout = _$timeout_;
        _deferred = $q.defer();
        $controller = _$controller_;
        $scope = $rootScope.$new();
        specHelper.utility.stubRootUrl(Utility);
        specHelper.userContext.stub(Utility);
        Utility.Storage.Session.clear();
        specHelper.utility.stubStorageSet(Utility);
    }));

    function createViewModel(docInfo: ap.models.accessRights.DocumentAccessRight): ap.viewmodels.documents.DeleteDocumentViewModel {
        return new ap.viewmodels.documents.DeleteDocumentViewModel(docInfo, $mdDialog, Utility, DocumentController);
    }

    describe("Feature Constructor", () => {

        let delDocVm: ap.viewmodels.documents.DeleteDocumentViewModel;
        let doc: ap.models.documents.Document;
        let docInfo: ap.models.accessRights.DocumentAccessRight;
        let project: ap.models.projects.Project;

        describe("WHEN a DeleteDocumentViewModel is created", () => {

            beforeEach(() => {
                doc = new ap.models.documents.Document(Utility);
                doc.UploadedBy = new ap.models.actors.User(Utility);
                doc.Author = new ap.models.actors.User(Utility);
                doc.VersionCount = 1;
                let projectJson: any =
                    {
                        Code: 'PRJ',
                        Name: 'Project name',
                        IsActive: true,
                        Creator: modelSpecHelper.createUserJson("Ricca", "Eveline", "User1", false),
                        UserAccessRight: {
                            ModuleName: "The module project"
                        },
                    };
                modelSpecHelper.fillEntityJson(projectJson);

                project = new ap.models.projects.Project(Utility);
                project.createByJson(projectJson);
                docInfo = new ap.models.accessRights.DocumentAccessRight(Utility, doc, project, null);

                delDocVm = new ap.viewmodels.documents.DeleteDocumentViewModel(docInfo, $mdDialog, Utility, DocumentController);
            });

            it("THEN I can get an instance of the DeleteDocumentViewModel", () => {
                expect(delDocVm).toBeDefined();
            });

            it("THEN the document is correctly initialized", () => {
                expect(delDocVm.docInfo).toBe(docInfo);
            });

            it("THEN, hasSeveralVersions is correct", () => {
                expect(delDocVm.hasSeveralVersions).toBeTruthy();
            });
        });

        describe("WHEN a DeleteDocumentViewModel is created without a DocumentAccessRight", () => {
            it("THEN, an error is thrown", () => {
                expect(function () {
                    createViewModel(null);
                }).toThrowError("The DocumentAccessRight needs to be defined in order to be able to delete a document");
            });
        });
    });

    describe("Feature: canOnlyDeleteDoc", () => {

        let delDocVm: ap.viewmodels.documents.DeleteDocumentViewModel;
        let doc: ap.models.documents.Document;
        let docInfo: ap.models.accessRights.DocumentAccessRight;
        let project: ap.models.projects.Project;

        beforeEach(() => {
            doc = new ap.models.documents.Document(Utility);
            doc.VersionCount = 2;
            doc.UploadedBy = new ap.models.actors.User(Utility);
            doc.Author = new ap.models.actors.User(Utility);
            let projectJson: any =
                {
                    Code: 'PRJ',
                    Name: 'Project name',
                    IsActive: true,
                    Creator: Utility.UserContext.CurrentUser(),
                    UserAccessRight: {
                        ModuleName: "The module project"
                    },
                };
            modelSpecHelper.fillEntityJson(projectJson);

            project = new ap.models.projects.Project(Utility);
            project.createByJson(projectJson);
            docInfo = new ap.models.accessRights.DocumentAccessRight(Utility, doc, project, null);

            delDocVm = createViewModel(docInfo);
        });

        describe("WHEN the document has several versions AND is not a report AND the user is a Manager", () => {

            beforeEach(() => {
                specHelper.general.spyProperty(ap.models.accessRights.DocumentAccessRight.prototype, "canDeleteDoc", specHelper.PropertyAccessor.Get).and.returnValue(true);
                specHelper.general.spyProperty(ap.models.accessRights.DocumentAccessRight.prototype, "canDeleteVersion", specHelper.PropertyAccessor.Get).and.returnValue(false);
            });

            afterEach(() => {
                specHelper.general.offSpyProperty(ap.models.accessRights.DocumentAccessRight.prototype, "canDeleteDoc", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.models.accessRights.DocumentAccessRight.prototype, "canDeleteVersion", specHelper.PropertyAccessor.Get);
            });

            it("THEN, canOnlyDeleteDoc is true", () => {
                expect(delDocVm.canOnlyDeleteDoc).toBeTruthy();
            });
        });

        describe("WHEN the document has several versions AND is not a report AND the creator is an Admin", () => {

            beforeEach(() => {
                specHelper.general.spyProperty(ap.models.accessRights.DocumentAccessRight.prototype, "canDeleteDoc", specHelper.PropertyAccessor.Get).and.returnValue(true);
                specHelper.general.spyProperty(ap.models.accessRights.DocumentAccessRight.prototype, "canDeleteVersion", specHelper.PropertyAccessor.Get).and.returnValue(true);
            });

            afterEach(() => {
                specHelper.general.offSpyProperty(ap.models.accessRights.DocumentAccessRight.prototype, "canDeleteDoc", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.models.accessRights.DocumentAccessRight.prototype, "canDeleteVersion", specHelper.PropertyAccessor.Get);
            });

            it("THEN, canOnlyDeleteDoc is true", () => {
                expect(delDocVm.canOnlyDeleteDoc).toBeFalsy();
            });
        });
    });

    describe("Feature: Delete", () => {

        let spyHide: jasmine.Spy;
        let hideDeferred: angular.IDeferred<any>;

        let delDocVm: ap.viewmodels.documents.DeleteDocumentViewModel;
        let doc: ap.models.documents.Document;
        let docInfo: ap.models.accessRights.DocumentAccessRight;
        let project: ap.models.projects.Project;

        beforeEach(() => {
            spyHide = <jasmine.Spy>$mdDialog.hide;
            hideDeferred = $q.defer();
            spyHide.and.returnValue(hideDeferred.promise);

            doc = new ap.models.documents.Document(Utility);
            doc.VersionCount = 2;
            doc.UploadedBy = new ap.models.actors.User(Utility);
            doc.Author = new ap.models.actors.User(Utility);
            let projectJson: any =
                {
                    Code: 'PRJ',
                    Name: 'Project name',
                    IsActive: true,
                    Creator: Utility.UserContext.CurrentUser(),
                    UserAccessRight: {
                        ModuleName: "The module project"
                    },
                };
            modelSpecHelper.fillEntityJson(projectJson);

            project = new ap.models.projects.Project(Utility);
            project.createByJson(projectJson);
            docInfo = new ap.models.accessRights.DocumentAccessRight(Utility, doc, project, null);

            delDocVm = createViewModel(docInfo);
        });

        describe("WHEN the delete method is called AND the deleteOption is Entire", () => {

            beforeEach(() => {
                specHelper.general.spyProperty(ap.viewmodels.documents.DeleteDocumentViewModel.prototype, "deleteOption", specHelper.PropertyAccessor.Get).and.returnValue(ap.controllers.DeleteDocumentOptions.Entire);
            });

            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.documents.DeleteDocumentViewModel.prototype, "deleteOption", specHelper.PropertyAccessor.Get);
            });

            it("THEN, mdDialog.Hide is called with Entire", () => {
                delDocVm.delete();
                expect(spyHide).toHaveBeenCalledWith(ap.controllers.DeleteDocumentResponse.Entire);
            });
        });

        describe("WHEN the delete method is called AND the deleteOption is LastVersion", () => {

            beforeEach(() => {
                specHelper.general.spyProperty(ap.viewmodels.documents.DeleteDocumentViewModel.prototype, "deleteOption", specHelper.PropertyAccessor.Get).and.returnValue(ap.controllers.DeleteDocumentOptions.LastVersion);
            });

            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.documents.DeleteDocumentViewModel.prototype, "deleteOption", specHelper.PropertyAccessor.Get);
            });

            it("THEN, mdDialog.Hide is called with Version", () => {
                delDocVm.delete();
                expect(spyHide).toHaveBeenCalledWith(ap.controllers.DeleteDocumentResponse.Version);
            });
        });

        describe("WHEN the delete method is called AND the deleteOption is Version", () => {

            beforeEach(() => {
                specHelper.general.spyProperty(ap.viewmodels.documents.DeleteDocumentViewModel.prototype, "deleteOption", specHelper.PropertyAccessor.Get).and.returnValue(ap.controllers.DeleteDocumentOptions.Version);
            });

            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.documents.DeleteDocumentViewModel.prototype, "deleteOption", specHelper.PropertyAccessor.Get);
            });

            it("THEN, mdDialog.Hide is called with Version", () => {
                delDocVm.delete();
                expect(spyHide).toHaveBeenCalledWith(ap.controllers.DeleteDocumentResponse.Version);
            });
        });
    });

    describe("Feature: Cancel", () => {

        let spyCancel: jasmine.Spy;
        let cancelDeferred: angular.IDeferred<any>;

        let delDocVm: ap.viewmodels.documents.DeleteDocumentViewModel;
        let doc: ap.models.documents.Document;
        let docInfo: ap.models.accessRights.DocumentAccessRight;
        let project: ap.models.projects.Project;

        beforeEach(() => {
            spyCancel = <jasmine.Spy>$mdDialog.cancel;
            cancelDeferred = $q.defer();
            spyCancel.and.returnValue(cancelDeferred.promise);

            doc = new ap.models.documents.Document(Utility);
            doc.VersionCount = 2;
            doc.UploadedBy = new ap.models.actors.User(Utility);
            doc.Author = new ap.models.actors.User(Utility);
            let projectJson: any =
                {
                    Code: 'PRJ',
                    Name: 'Project name',
                    IsActive: true,
                    Creator: Utility.UserContext.CurrentUser(),
                    UserAccessRight: {
                        ModuleName: "The module project"
                    },
                };
            modelSpecHelper.fillEntityJson(projectJson);

            project = new ap.models.projects.Project(Utility);
            project.createByJson(projectJson);
            docInfo = new ap.models.accessRights.DocumentAccessRight(Utility, doc, project, null);

            delDocVm = createViewModel(docInfo);
        });

        describe("WHEN the cancel method is called", () => {

            it("THEN, mdDialog.Cancel", () => {
                delDocVm.cancel();
                expect(spyCancel).toHaveBeenCalled();
            });
        });
    });

    describe("Feature: getDeleteOptionDisplay", () => {

        let spyCancel: jasmine.Spy;
        let cancelDeferred: angular.IDeferred<any>;

        let delDocVm: ap.viewmodels.documents.DeleteDocumentViewModel;
        let doc: ap.models.documents.Document;
        let docInfo: ap.models.accessRights.DocumentAccessRight;
        let project: ap.models.projects.Project;

        beforeEach(() => {
            spyCancel = <jasmine.Spy>$mdDialog.cancel;
            cancelDeferred = $q.defer();
            spyCancel.and.returnValue(cancelDeferred.promise);

            doc = new ap.models.documents.Document(Utility);
            doc.VersionCount = 2;
            doc.UploadedBy = new ap.models.actors.User(Utility);
            doc.Author = new ap.models.actors.User(Utility);
            let projectJson: any =
                {
                    Code: 'PRJ',
                    Name: 'Project name',
                    IsActive: true,
                    Creator: Utility.UserContext.CurrentUser(),
                    UserAccessRight: {
                        ModuleName: "The module project"
                    },
                };
            modelSpecHelper.fillEntityJson(projectJson);

            project = new ap.models.projects.Project(Utility);
            project.createByJson(projectJson);
            docInfo = new ap.models.accessRights.DocumentAccessRight(Utility, doc, project, null);

            delDocVm = createViewModel(docInfo);
        });

        describe("WHEN the document is a document AND", () => {

            beforeEach(() => {
                specHelper.general.spyProperty(ap.viewmodels.documents.DeleteDocumentViewModel.prototype, "isReport", specHelper.PropertyAccessor.Get).and.returnValue(false);
            });

            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.documents.DeleteDocumentViewModel.prototype, "isReport", specHelper.PropertyAccessor.Get);
            });

            describe("WHEN the getDeleteOptionDisplay method is called with 'Entire'", () => {
                it("THEN, 'app.document.delete_document_options.entire' is returned", () => {
                    expect(delDocVm.getDeleteOptionDisplay(ap.controllers.DeleteDocumentOptions.Entire)).toEqual("[app.document.delete_document_options.entire]");
                });
            });

            describe("WHEN the getDeleteOptionDisplay method is called with 'LastVersion'", () => {
                it("THEN, 'app.document.delete_document_options.lastVersion' is returned", () => {
                    expect(delDocVm.getDeleteOptionDisplay(ap.controllers.DeleteDocumentOptions.LastVersion)).toEqual("[app.document.delete_document_options.lastversion]");
                });
            });
        });

        describe("WHEN the document is a Report AND", () => {

            beforeEach(() => {
                specHelper.general.spyProperty(ap.viewmodels.documents.DeleteDocumentViewModel.prototype, "isReport", specHelper.PropertyAccessor.Get).and.returnValue(true);
            });

            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.documents.DeleteDocumentViewModel.prototype, "isReport", specHelper.PropertyAccessor.Get);
            });

            describe("WHEN the getDeleteOptionDisplay method is called with 'Entire'", () => {
                it("THEN, 'app.document.delete_document_options.entire' is returned", () => {
                    expect(delDocVm.getDeleteOptionDisplay(ap.controllers.DeleteDocumentOptions.Entire)).toEqual("[app.document.delete_report_options.entire]");
                });
            });

            describe("WHEN the getDeleteOptionDisplay method is called with 'Version'", () => {
                it("THEN, 'app.document.delete_document_options.version' is returned", () => {
                    expect(delDocVm.getDeleteOptionDisplay(ap.controllers.DeleteDocumentOptions.Version)).toEqual("[app.document.delete_report_options.version]");
                });
            });
        });
    });

    describe("Feature: set deleteOption", () => {

        let delDocVm: ap.viewmodels.documents.DeleteDocumentViewModel;
        let doc: ap.models.documents.Document;
        let docInfo: ap.models.accessRights.DocumentAccessRight;
        let project: ap.models.projects.Project;
        let defVersions: angular.IDeferred<any>;

        beforeEach(() => {

            doc = new ap.models.documents.Document(Utility);
            doc.VersionCount = 2;
            doc.IsReport = true;
            doc.FileType = 4;
            doc.UploadedBy = new ap.models.actors.User(Utility);
            doc.Author = new ap.models.actors.User(Utility);
            defVersions = $q.defer();
            spyOn(DocumentController, "getVersions").and.returnValue(defVersions.promise);
        });

        describe("WHEN set deleteOption is called with 'Version' and the user is Admin and the document is a report", () => {

            beforeEach(() => {
                let projectJson: any =
                    {
                        Code: 'PRJ',
                        Name: 'Project name',
                        IsActive: true,
                        Creator: Utility.UserContext.CurrentUser(),
                        UserAccessRight: {
                            ModuleName: "The module project",
                            Level: 4
                        },
                    };
                modelSpecHelper.fillEntityJson(projectJson);

                project = new ap.models.projects.Project(Utility);
                project.createByJson(projectJson);
                docInfo = new ap.models.accessRights.DocumentAccessRight(Utility, doc, project, null);

                delDocVm = createViewModel(docInfo);

                delDocVm.deleteOption = ap.controllers.DeleteDocumentOptions.Version;
            });

            it("THEN, DocumentController.getVersions is called with the document", () => {
                expect(DocumentController.getVersions).toHaveBeenCalledWith(doc, false);
            });

            it("THEN, the versions collection is correctly initialized", () => {
                let versions: ap.models.documents.Version[] = [];
                versions.push(new ap.models.documents.Version(Utility));
                versions.push(new ap.models.documents.Version(Utility));

                defVersions.resolve(new ap.services.apiHelper.ApiResponse(versions));
                $rootScope.$apply();

                expect(delDocVm.availableVersions.getLength()).toBe(3); // 2 versions + the document
            });
        });

        describe("WHEN set deleteOption is called with 'Version' and the user is not an Admin and the document is a report", () => {

            beforeEach(() => {
                let projectJson: any =
                    {
                        Code: 'PRJ',
                        Name: 'Project name',
                        IsActive: true,
                        Creator: Utility.UserContext.CurrentUser(),
                        UserAccessRight: {
                            ModuleName: "The module project",
                            Level: 3
                        },
                    };
                modelSpecHelper.fillEntityJson(projectJson);

                project = new ap.models.projects.Project(Utility);
                project.createByJson(projectJson);
                docInfo = new ap.models.accessRights.DocumentAccessRight(Utility, doc, project, null);

                delDocVm = createViewModel(docInfo);

                delDocVm.deleteOption = ap.controllers.DeleteDocumentOptions.Version;
            });

            it("THEN, DocumentController.getVersions is called with the document", () => {
                expect(DocumentController.getVersions).toHaveBeenCalledWith(doc, true);
            });
        });

        describe("WHEN set deleteOption is called with LastVersion or Etire and the version list is loaded", () => {

            beforeEach(() => {
                let projectJson: any =
                    {
                        Code: 'PRJ',
                        Name: 'Project name',
                        IsActive: true,
                        Creator: Utility.UserContext.CurrentUser(),
                        UserAccessRight: {
                            ModuleName: "The module project",
                            Level: 4
                        },
                    };
                modelSpecHelper.fillEntityJson(projectJson);

                project = new ap.models.projects.Project(Utility);
                project.createByJson(projectJson);
                docInfo = new ap.models.accessRights.DocumentAccessRight(Utility, doc, project, null);

                delDocVm = createViewModel(docInfo);

                //  Initialize  the versions list
                delDocVm.deleteOption = ap.controllers.DeleteDocumentOptions.Version;

                let versions: ap.models.documents.Version[] = [];
                versions.push(new ap.models.documents.Version(Utility));
                versions.push(new ap.models.documents.Version(Utility));

                defVersions.resolve(new ap.services.apiHelper.ApiResponse(versions)); // load the list with 2 elements
                $rootScope.$apply();

                // change the deleteOption
                delDocVm.deleteOption = ap.controllers.DeleteDocumentOptions.Entire;
            });

            it("THEN, onloadItem(null) is called to empty the list", () => {
                expect(delDocVm.availableVersions.getLength()).toBe(0);
            });
        });
    });

    describe("Feature: canDelete", () => {

        let delDocVm: ap.viewmodels.documents.DeleteDocumentViewModel;
        let doc: ap.models.documents.Document;
        let docInfo: ap.models.accessRights.DocumentAccessRight;
        let project: ap.models.projects.Project;

        beforeEach(() => {

            doc = new ap.models.documents.Document(Utility);
            doc.VersionCount = 2;
            doc.IsReport = true;
            doc.FileType = 4;
            doc.UploadedBy = new ap.models.actors.User(Utility);
            doc.Author = new ap.models.actors.User(Utility);
            let projectJson: any =
                {
                    Code: 'PRJ',
                    Name: 'Project name',
                    IsActive: true,
                    Creator: Utility.UserContext.CurrentUser(),
                    UserAccessRight: {
                        ModuleName: "The module project",
                        Level: 4
                    },
                };
            modelSpecHelper.fillEntityJson(projectJson);

            project = new ap.models.projects.Project(Utility);
            project.createByJson(projectJson);
            docInfo = new ap.models.accessRights.DocumentAccessRight(Utility, doc, project, null);

            delDocVm = createViewModel(docInfo);
        });

        describe("WHEN canDelete is called and the deleteOption is Entire", () => {
            it("THEN, canDelete is TRUE", () => {
                delDocVm.deleteOption = ap.controllers.DeleteDocumentOptions.Entire;

                expect(delDocVm.canDelete).toBeTruthy();
            });
        });

        describe("WHEN canDelete is called and the deleteOption is LastVersion", () => {
            it("THEN, canDelete is TRUE", () => {
                delDocVm.deleteOption = ap.controllers.DeleteDocumentOptions.LastVersion;

                expect(delDocVm.canDelete).toBeTruthy();
            });
        });

        describe("WHEN canDelete is called and the deleteOption is Version and a version is selected", () => {

            beforeEach(() => {
                specHelper.general.spyProperty(ap.viewmodels.documents.DeleteDocumentViewModel.prototype, "deleteOption", specHelper.PropertyAccessor.Get).and.returnValue(ap.controllers.DeleteDocumentOptions.Version);

                let listVersions = new ap.viewmodels.ListEntityViewModel(Utility, "version", null, null, null);
                let versionVm = new ap.viewmodels.documents.VersionItemViewModel(Utility);
                versionVm.init(new ap.models.documents.Version(Utility));
                listVersions.onLoadItems([versionVm], true); // select the first item
                specHelper.general.spyProperty(ap.viewmodels.documents.DeleteDocumentViewModel.prototype, "availableVersions", specHelper.PropertyAccessor.Get).and.returnValue(listVersions);
            });

            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.documents.DeleteDocumentViewModel.prototype, "deleteOption", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.viewmodels.documents.DeleteDocumentViewModel.prototype, "availableVersions", specHelper.PropertyAccessor.Get);
            });

            it("THEN, canDelete is TRUE", () => {
                expect(delDocVm.canDelete).toBeTruthy();
            });
        });

        describe("WHEN canDelete is called and the deleteOption is Version and no version is selected", () => {

            beforeEach(() => {
                specHelper.general.spyProperty(ap.viewmodels.documents.DeleteDocumentViewModel.prototype, "deleteOption", specHelper.PropertyAccessor.Get).and.returnValue(ap.controllers.DeleteDocumentOptions.Version);

                let listVersions = new ap.viewmodels.ListEntityViewModel(Utility, "version", null, null, null);
                let versionVm = new ap.viewmodels.documents.VersionItemViewModel(Utility);
                versionVm.init(new ap.models.documents.Version(Utility));
                listVersions.onLoadItems([versionVm], false); // don't select the first item
                specHelper.general.spyProperty(ap.viewmodels.documents.DeleteDocumentViewModel.prototype, "availableVersions", specHelper.PropertyAccessor.Get).and.returnValue(listVersions);
            });

            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.documents.DeleteDocumentViewModel.prototype, "deleteOption", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.viewmodels.documents.DeleteDocumentViewModel.prototype, "availableVersions", specHelper.PropertyAccessor.Get);
            });

            it("THEN, canDelete is FALSE", () => {
                expect(delDocVm.canDelete).toBeFalsy();
            });
        });
    });
}); 