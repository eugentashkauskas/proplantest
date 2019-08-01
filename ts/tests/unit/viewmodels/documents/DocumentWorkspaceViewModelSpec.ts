describe("Module ap-viewmodels - DocumentWorkspaceViewModel", () => {

    let $controller: ng.IControllerService, vm: ap.viewmodels.documents.DocumentWorkspaceViewModel, MainController: ap.controllers.MainController,
        Utility: ap.utility.UtilityHelper, _deferred: angular.IDeferred<ap.services.apiHelper.ApiResponse>, FolderListVm: ap.viewmodels.folders.FolderListViewModel,
        UserContext: ap.utility.UserContext, Api: ap.services.apiHelper.Api;
    let $q: angular.IQService, $rootScope: angular.IRootScopeService, $scope: angular.IScope, $mdSidenav, $timeout: angular.ITimeoutService;
    let DocumentController: ap.controllers.DocumentController;
    let MeetingController: ap.controllers.MeetingController;
    let $mdDialog: angular.material.IDialogService;
    let $location: angular.ILocationService;
    let ReportController: ap.controllers.ReportController;
    let $interval: angular.IIntervalService;
    let $anchorScroll: angular.IAnchorScrollService;
    let ControllersManager: ap.controllers.ControllersManager;
    let ServicesManager: ap.services.ServicesManager;

    beforeEach(() => {
        let $window = specHelper.createWindowStub();
        $window.navigator.userLanguage = undefined;
        $window.navigator.language = "en_US";
        angular.mock.module(function ($provide) {
            $provide.value("$window", $window);
            $mdSidenav = specHelper.utility.stubToggleMdSideNav($provide);
        });
    });

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module(function ($provide) {
            $provide.factory('$mdDialog', ["$q", function ($q) {
                return specHelper.utility.stubShowMdDialog($q);
            }]);
        });
        
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject(function (_$q_, _$controller_, _$rootScope_, _MainController_, _MeetingController_, _DocumentController_, _$timeout_, _Utility_, _UserContext_, _Api_,
        _$mdDialog_, _$location_, _ReportController_, _$interval_, _$anchorScroll_, _$mdSidenav_, _ServicesManager_, _ControllersManager_) {
        $controller = _$controller_;
        MainController = _MainController_;
        MeetingController = _MeetingController_;
        DocumentController = _DocumentController_;
        Utility = _Utility_;
        UserContext = _UserContext_;
        $timeout = _$timeout_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        $q = _$q_;
        Api = _Api_;
        $mdDialog = _$mdDialog_;
        $location = _$location_;
        ReportController = _ReportController_;
        $interval = _$interval_;
        $anchorScroll = _$anchorScroll_;
        $mdSidenav = _$mdSidenav_;
        ServicesManager = _ServicesManager_;
        ControllersManager = _ControllersManager_;

        _deferred = $q.defer();

        spyOn(Utility.Translator, "getTranslation").and.callFake(function (key) {
            return "$" + key;
        });

        spyOn(Utility.Translator, "initLanguage");

        specHelper.userContext.stub(Utility);
        specHelper.utility.stubRootUrl(Utility);

        specHelper.mainController.stub(MainController, Utility);
    }));

    // spy Segment.IO calls
    beforeEach(() => {
        spyOn(ServicesManager.toolService, "sendEvent").and.returnValue($q.defer().promise);
    });

    function createDocumentWorkspaceViewModel(isForDocumentModule: boolean = true, workspaceElt: ap.viewmodels.documents.DocumentWorkspaceElement = new ap.viewmodels.documents.DocumentWorkspaceElement()): ap.viewmodels.documents.DocumentWorkspaceViewModel {
        let vm: ap.viewmodels.documents.DocumentWorkspaceViewModel = new ap.viewmodels.documents.DocumentWorkspaceViewModel($scope, Utility, Api, $q, $timeout, $mdSidenav, $mdDialog, $location, $anchorScroll, $interval, ControllersManager, ServicesManager, workspaceElt, isForDocumentModule);
        return vm;
    }

    describe("Feature: Default values", () => {
        
        let defFoldersIds: angular.IDeferred<any>;

        beforeEach(() => {
            let defFoldersIds = $q.defer();

            spyOn(Api, "getApiResponse").and.callFake(function (url, method) {
                if (url.indexOf("rest/projectfolderidsandlevels") >= 0 && method === ap.services.apiHelper.MethodType.Get)
                    return defFoldersIds.promise;
                return null;
            });
        });

        it("can get an instance of my factory with default values", () => {
            vm = createDocumentWorkspaceViewModel();

            expect(vm).toBeDefined();
        });

        it("can get an instance of my factory with default values AND folderLisVm is defined", () => {
            vm = createDocumentWorkspaceViewModel();

            expect(vm.folderListVm).toBeDefined();
        });


        it("can get an instance of my factory with default values AND documentListVm is defined", () => {
            vm = createDocumentWorkspaceViewModel();

            expect(vm.documentListVm).toBeDefined();
        });


        it("can get an instance of my factory with default values AND workspaceElement is defined", () => {
            let errorCallback = jasmine.createSpy("errorCallback");
            try {
                vm = createDocumentWorkspaceViewModel();
            } catch (error) {
                errorCallback(error);
            }
            expect(vm.workspaceElements).toBeDefined();
            expect(errorCallback).not.toHaveBeenCalled();
        });

        it("can get an instance of my factory with workspaceelement.hasdocumentlist = false AND documentListVm is null", () => {
            spyOn(Utility.Storage.Local, "get").and.callFake((key: string) => {
                if (key === "documents.foldersvisibility") {
                    return true;
                }
            });
            let workSpaceElt = new ap.viewmodels.documents.DocumentWorkspaceElement();
            workSpaceElt.hasDocumentList = false;
            vm = new ap.viewmodels.documents.DocumentWorkspaceViewModel($scope, Utility, Api, $q, $timeout, $mdSidenav, $mdDialog, $location, $anchorScroll, $interval, ControllersManager, ServicesManager, workSpaceElt);

            expect(vm).toBeDefined();
            expect(vm.folderListVm).toBeDefined();
            expect(vm.documentListVm).toBeNull();
            expect(vm.workspaceElements).toBeDefined();
        });

        describe("WHEN DocumentWorkspaceElement is not given as parameter", () => {
            let storageFolderVis: boolean;
            beforeEach(() => {
                storageFolderVis = null;
                spyOn(Utility.Storage.Local, "get").and.callFake((key: string) => {
                    if (key === "documents.foldersvisibility") {
                        return storageFolderVis;
                    }
                });
            });
            describe("AND WHEN the foldervisibility is not in the storage", () => {
                beforeEach(() => {
                    storageFolderVis = null;
                });
                it("THEN, the document list is still created", () => {
                    vm = new ap.viewmodels.documents.DocumentWorkspaceViewModel($scope, Utility, Api, $q, $timeout, $mdSidenav, $mdDialog, $location, $anchorScroll, $interval, ControllersManager, ServicesManager, null);

                    expect(vm.documentListVm).toBeDefined();
                });

                it("foldersvisibility is not in the storage", () => {
                    vm = createDocumentWorkspaceViewModel(true, null);

                    expect(vm.workspaceElements.hasFolderList).toBeFalsy();
                });
                it("Folder is not visible AND folders visibility is not in the cache -> folder is null", () => {
                    vm = createDocumentWorkspaceViewModel(true, null);
                    expect(vm.documentListVm.folder).toBeNull();
                });
            });
            describe("AND WHEN the foldervisibility is in the storage equals false", () => {
                beforeEach(() => {
                    storageFolderVis = false;
                });
                it("can get an instance of my factory with default values AND foldersvisibility is in the storage", () => {
                    vm = createDocumentWorkspaceViewModel()

                    expect(vm.workspaceElements.hasFolderList).toBeFalsy();
                });

                it("foldersvisibility is getting from the storage AND the main actions to show/hide folder visibility is correctly init", () => {
                    vm = createDocumentWorkspaceViewModel();

                    expect(MainController.getMainAction("foldersvisible").isVisible).toBeFalsy();
                    expect(MainController.getMainAction("foldershidden").isVisible).toBeTruthy();
                });

                it("can get an instance of my factory with default values AND foldersvisibility is false", () => {
                    vm = createDocumentWorkspaceViewModel();
                    expect(vm.documentListVm.folder).toBeNull();
                });
            });
        });
        

        describe("WHEN isForDocumentModule is true", () => {
            beforeEach(() => {
                vm = createDocumentWorkspaceViewModel();
            });
            it("THEN, displayActions will be true", () => {
                
                expect(vm.displayActions).toBeTruthy();
            });
        });

        describe("WHEN isForDocumentModule is false", () => {
            it("THEN, displayActions will be false", () => {
                vm = createDocumentWorkspaceViewModel(false);
                expect(vm.displayActions).toBeFalsy();
            });
        });
    });

    describe("Feature: selectedFolderChanged", () => {

        let spySet: jasmine.Spy;

        beforeEach(() => {
            spySet = specHelper.general.spyProperty(ap.viewmodels.documents.DocumentListViewModel.prototype, "folder", specHelper.PropertyAccessor.Set);
            spyOn(Utility.Storage.Session, "get").and.returnValue(null);
        });

        afterEach(() => {
            specHelper.general.offSpyProperty(ap.viewmodels.documents.DocumentListViewModel.prototype, "folder", specHelper.PropertyAccessor.Set);
        });

        describe("WHEN folderListVm.selectedItemChanged is raised with a folderVm", () => {

            it("THEN, documentListVm.folder is set to the new value", () => {
                spyOn(Utility.Storage.Local, "get").and.callFake((key: string) => {
                    if (key === "documents.foldersvisibility") {
                        return true;
                    }
                });
                vm = createDocumentWorkspaceViewModel();

                let folderVm: ap.viewmodels.folders.FolderItemViewModel = new ap.viewmodels.folders.FolderItemViewModel(Utility, $q);
                let folder: ap.models.projects.Folder = new ap.models.projects.Folder(Utility);
                folder.createByJson({
                    Id: "12"
                });
                folderVm.init(folder);
                specHelper.general.raiseEvent(vm.folderListVm.listVm, "selectedItemChanged", folderVm);

                expect(spySet).toHaveBeenCalledWith(folder);
            });
        });

        describe("WHEN folderListVm.selectedItemChanged is raised with null", () => {
            it("THEN, documentListVm.folder is set to undefined", () => {
                spyOn(Utility.Storage.Local, "get").and.callFake((key: string) => {
                    if (key === "documents.foldersvisibility") {
                        return true;
                    }
                });
                vm = createDocumentWorkspaceViewModel();
                specHelper.general.raiseEvent(vm.folderListVm.listVm, "selectedItemChanged", null);

                expect(spySet).toHaveBeenCalledWith(undefined);
            });
        });

        describe("WHEN folderListVm.selectedItemChanged is raised AND the documentListViewModel is null", () => {
            it("THEN, documentListVm.folderId is not set", () => {
                spyOn(Utility.Storage.Local, "get").and.callFake((key: string) => {
                    if (key === "documents.foldersvisibility") {
                        return true;
                    }
                });
                let workSpaceElt = new ap.viewmodels.documents.DocumentWorkspaceElement();
                workSpaceElt.hasDocumentList = false;
                vm = createDocumentWorkspaceViewModel(true, workSpaceElt);
                specHelper.general.raiseEvent(vm.folderListVm.listVm, "selectedItemChanged", new ap.viewmodels.folders.FolderItemViewModel(Utility, $q));

                expect(spySet).not.toHaveBeenCalled();
            });
        });
    });

    describe("WHEN $destroy is called", () => {

        beforeEach(() => {
            vm = createDocumentWorkspaceViewModel();

            spyOn(vm, "dispose");
        });

        it("THEN the dispose method is called", () => {
            $scope.$destroy();

            expect(vm.dispose).toHaveBeenCalled();
        });
    });

    describe("Feature: Dispose", () => {

        beforeEach(() => {
            vm = createDocumentWorkspaceViewModel(true);

            spyOn(vm.folderListVm, "dispose");
            spyOn(MainController, "off");
            spyOn(vm.documentListVm, "dispose");
            spyOn(vm.documentListVm.listVm, "off");

            vm.dispose();
        });

        describe("WHEN the dispose method is called", () => {
            it("THEN, folderListVm is null", () => {
                expect(vm.folderListVm).toBeNull();
            });

            it("THEN, mainController.off is called", () => {
                expect(MainController.off).toHaveBeenCalled();
                expect((<jasmine.Spy>MainController.off).calls.count()).toBe(1);
            });

            it("THEN, documentlistVM is null", () => {
                expect(vm.documentListVm).toBeNull();
            });
        });
    });


    describe("Feature: Show/hide folders list", () => {

        let spyFId: jasmine.Spy;

        beforeEach(() => {
            specHelper.general.spyProperty(ap.controllers.UIStateController.prototype, "mainFlowState", specHelper.PropertyAccessor.Get).and.returnValue(ap.controllers.MainFlow.Documents);

            vm = createDocumentWorkspaceViewModel();

            spyOn(Utility.Storage.Local, "set");

            spyFId = specHelper.general.spyProperty(ap.viewmodels.documents.DocumentListViewModel.prototype, "folder", specHelper.PropertyAccessor.Set);
        });

        afterEach(() => {
            specHelper.general.offSpyProperty(ap.viewmodels.documents.DocumentListViewModel.prototype, "folder", specHelper.PropertyAccessor.Set);
            specHelper.general.offSpyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get);

            specHelper.general.offSpyProperty(ap.controllers.UIStateController.prototype, "mainFlowState", specHelper.PropertyAccessor.Get);
        });

        describe("WHEN the user clicks on the show folders button AND the folders list has a selected folder", () => {

            beforeEach(() => {
                specHelper.general.spyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get).and.returnValue({
                    originalEntity: {
                        Id: "2"
                    }
                });

                vm.workspaceElements.hasFolderList = false;
                vm.documentListVm.screenInfo.actionClick("foldersvisible");
            });

            it("THEN, the workspaceElement.hasFoldersList is TRUE", () => {
                expect(vm.workspaceElements.hasFolderList).toBeTruthy();
            });

            it("THEN, the current view is saved in the Storage", () => {
                expect(Utility.Storage.Local.set).toHaveBeenCalledWith("documents.foldersvisibility", true);
            });

            it("THEN, the list action is hidden", () => {
                expect(MainController.getMainAction("foldersvisible").isVisible).toBeTruthy();
            });

            it("THEN, the thumb action is visible", () => {
                expect(MainController.getMainAction("foldershidden").isVisible).toBeFalsy();
            });

            it("THEN, the folder property of documentListVm is set with the selected foder id from the list", () => {
                expect(spyFId).toHaveBeenCalledWith({
                    Id: "2"
                });
            });
        });

        describe("WHEN the user clicks on the show folders button AND the folders list hasn't a selected folder", () => {

            beforeEach(() => {
                vm.workspaceElements.hasFolderList = false;
                vm.documentListVm.screenInfo.actionClick("foldersvisible");

                specHelper.general.spyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get).and.returnValue(null);
            });

            it("THEN, the workspaceElement.hasFoldersList is TRUE", () => {
                expect(vm.workspaceElements.hasFolderList).toBeTruthy();
            });

            it("THEN, the current view is saved in the Storage", () => {
                expect(Utility.Storage.Local.set).toHaveBeenCalledWith("documents.foldersvisibility", true);
            });

            it("THEN, the list action is hidden", () => {
                expect(MainController.getMainAction("foldersvisible").isVisible).toBeTruthy();
            });

            it("THEN, the thumb action is visible", () => {
                expect(MainController.getMainAction("foldershidden").isVisible).toBeFalsy();
            });

            it("THEN, the folder property of documentListVm is set with the selected foder id from the list", () => {
                expect(spyFId).toHaveBeenCalledWith(undefined);
            });
        });

        describe("WHEN the user clicks on the hide folders button", () => {

            beforeEach(() => {
                vm.workspaceElements.hasFolderList = true;
                vm.documentListVm.screenInfo.actionClick("foldershidden");
            });

            it("THEN, the workspaceElement.hasFoldersList is FALSE", () => {
                expect(vm.workspaceElements.hasFolderList).toBeFalsy();
            });

            it("THEN, the current view is saved in the Storage", () => {
                expect(Utility.Storage.Local.set).toHaveBeenCalledWith("documents.foldersvisibility", false);
            });

            it("THEN, the list action is visible", () => {
                expect(MainController.getMainAction("foldersvisible").isVisible).toBeFalsy();
            });

            it("THEN, the thumb action is hidden", () => {
                expect(MainController.getMainAction("foldershidden").isVisible).toBeTruthy();
            });

            it("THEN, the folder property of documentListVm is set with the selected foder id from the list", () => {
                expect(spyFId).toHaveBeenCalledWith(null);
            });
        });
    });

    describe("Feature: MainActions available", () => {

        describe("WHEN init DocumentWorkspaceViewModel for documentmodule", () => {

            beforeEach(() => {
                vm = createDocumentWorkspaceViewModel();
            });

            it("THEN, the number of mainActions is 4", () => {
                expect(MainController.mainActions.length).toBe(4);
            });
        });

        describe("WHEN init DocumentWorkspaceViewModel not for documentmodule", () => {

            beforeEach(() => {
                vm = createDocumentWorkspaceViewModel(false);
            });

            it("THEN, the number of mainActions is 0", () => {
                expect(MainController.mainActions.length).toBe(0);
            });
        });
    });

    describe("Feature: refresh", () => {
        describe("WHEN the user click the refresh button", () => {
            let defer;
            beforeEach(() => {
                specHelper.general.spyProperty(ap.controllers.UIStateController.prototype, "mainFlowState", specHelper.PropertyAccessor.Get).and.returnValue(ap.controllers.MainFlow.Documents);
                defer = $q.defer(); 
                vm = createDocumentWorkspaceViewModel(true, null);

                spyOn(vm.documentListVm, "refresh");
                spyOn(vm.folderListVm.listVm, "refreshAndSelect").and.returnValue(defer.promise);
            });

            afterEach(() => {
                specHelper.general.offSpyProperty(ap.controllers.UIStateController.prototype, "mainFlowState", specHelper.PropertyAccessor.Get);
            });
            it("THEN if the folder list is not displayed the list of document is refreshed", () => {
                expect(vm.workspaceElements.hasFolderList).toBeFalsy();

                vm.documentListVm.screenInfo.actionClick("refresh");
                expect(vm.documentListVm.refresh).toHaveBeenCalled();
            });
            it("THEN if the folder list is displayed, the list of folder is refreshed", () => {
                vm.documentListVm.screenInfo.actionClick("foldersvisible");

                vm.documentListVm.screenInfo.actionClick("refresh");
                expect(vm.folderListVm.listVm.refreshAndSelect).toHaveBeenCalled();
            });
        });
    });

    describe("Feature: isForNoteModule", () => {

        beforeEach(() => {
            vm = createDocumentWorkspaceViewModel(false);
        });

        describe("WHEN the viewModel is created outside the document module", () => {
            it("THEN isForDocumentModule is false", () => {
                expect(vm.isForDocumentModule).toBeFalsy();
            });
        });
    });

    describe("Feature: openDownloadDocumentPopup", () => {
        let document: ap.models.documents.Document;
        let version: ap.models.documents.Version;

        describe("WHEN the event 'docdownloadsourcerequested' is raised from document controller", () => {
            beforeEach(() => {
                vm = createDocumentWorkspaceViewModel(false);
                document = new ap.models.documents.Document(Utility);
                version = modelSpecHelper.createFakeVersion(Utility, "v1", 1);

                specHelper.general.raiseEvent(DocumentController, "docdownloadsourcerequested", new ap.controllers.DocumentDownloadSourceEvent(document, version));
            });

            it("THEN, download document popup is showed to the user", () => {
                expect($mdDialog.show).toHaveBeenCalled();
            });
        });
    });

    describe("Feature: handleDeleteDocumentRequest", () => {

        let document: ap.models.documents.Document;
        let docInfo: ap.models.accessRights.DocumentAccessRight;
        let project: ap.models.projects.Project;

        beforeEach(() => {
            document = new ap.models.documents.Document(Utility);
            document.Author = new ap.models.actors.User(Utility);
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
            docInfo = new ap.models.accessRights.DocumentAccessRight(Utility, document, project, null);

            spyOn(Api, "getApiResponse").and.returnValue(_deferred.promise);
        });

        describe("WHEN the event 'deletedocumentrequested' is raised from document controller", () => {

            beforeEach(() => {
                vm = createDocumentWorkspaceViewModel(false);

                specHelper.general.raiseEvent(DocumentController, "deletedocumentrequested", docInfo);
            });

            it("THEN a confirmation popup is showed to the user", () => {
                expect($mdDialog.show).toHaveBeenCalled();
            });
        });

        describe("WHEN the dialog resolve with 'Entire'", () => {

            let showSpy: jasmine.Spy;
            let deleteDefer: angular.IDeferred<any>;

            beforeEach(() => {
                showSpy = <jasmine.Spy>$mdDialog.show;
                deleteDefer = $q.defer();
                showSpy.and.returnValue(deleteDefer.promise);

                vm = createDocumentWorkspaceViewModel(false);

                spyOn(DocumentController, "deleteDocument");

                specHelper.general.raiseEvent(DocumentController, "deletedocumentrequested", docInfo);

                deleteDefer.resolve(ap.controllers.DeleteDocumentResponse.Entire);
                $rootScope.$apply();
            });

            it("THEN DocumentController.DeleteDocument is called", () => {
                expect(DocumentController.deleteDocument).toHaveBeenCalledWith(docInfo.document);
            });
        });

        describe("WHEN the dialog resolve with 'Version' AND deleteOption is 'LastVersion'", () => {

            let showSpy: jasmine.Spy;
            let deleteDefer: angular.IDeferred<any>;

            beforeEach(() => {
                showSpy = <jasmine.Spy>$mdDialog.show;
                deleteDefer = $q.defer();
                showSpy.and.returnValue(deleteDefer.promise);

                vm = createDocumentWorkspaceViewModel(false);

                spyOn(DocumentController, "deleteVersion");

                specHelper.general.raiseEvent(DocumentController, "deletedocumentrequested", docInfo);

                specHelper.general.spyProperty(ap.viewmodels.documents.DeleteDocumentViewModel.prototype, "deleteOption", specHelper.PropertyAccessor.Get).and.returnValue(ap.controllers.DeleteDocumentOptions.LastVersion);

                deleteDefer.resolve(ap.controllers.DeleteDocumentResponse.Version);
                $rootScope.$apply();
            });

            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.documents.DeleteDocumentViewModel.prototype, "deleteOption", specHelper.PropertyAccessor.Get);
            });

            it("THEN DocumentController.deleteVersion is called", () => {
                expect(DocumentController.deleteVersion).toHaveBeenCalledWith(docInfo.document);
            });
        });

        describe("WHEN the dialog resolve with 'Version' AND deleteOption is 'Version'", () => {

            let showSpy: jasmine.Spy;
            let deleteDefer: angular.IDeferred<any>;
            let listVersions: ap.viewmodels.ListEntityViewModel;
            let versionVm: ap.viewmodels.documents.VersionItemViewModel;

            beforeEach(() => {
                showSpy = <jasmine.Spy>$mdDialog.show;
                deleteDefer = $q.defer();
                showSpy.and.returnValue(deleteDefer.promise);

                vm = createDocumentWorkspaceViewModel(false);

                spyOn(DocumentController, "deleteVersion");

                specHelper.general.raiseEvent(DocumentController, "deletedocumentrequested", docInfo);

                specHelper.general.spyProperty(ap.viewmodels.documents.DeleteDocumentViewModel.prototype, "deleteOption", specHelper.PropertyAccessor.Get).and.returnValue(ap.controllers.DeleteDocumentOptions.Version);

                listVersions = new ap.viewmodels.ListEntityViewModel(Utility, "version", null, null, null);
                versionVm = new ap.viewmodels.documents.VersionItemViewModel(Utility);
                versionVm.init(new ap.models.documents.Version(Utility));
                listVersions.onLoadItems([versionVm], true);
                specHelper.general.spyProperty(ap.viewmodels.documents.DeleteDocumentViewModel.prototype, "availableVersions", specHelper.PropertyAccessor.Get).and.returnValue(listVersions);
            });

            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.documents.DeleteDocumentViewModel.prototype, "deleteOption", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.viewmodels.documents.DeleteDocumentViewModel.prototype, "availableVersions", specHelper.PropertyAccessor.Get);
            });

            describe("AND the user chooses the last version (which is the document)", () => {

                beforeEach(() => {
                    let document: ap.models.documents.Document = new ap.models.documents.Document(Utility);
                    let lastVersionVm = new ap.viewmodels.documents.VersionItemViewModel(Utility);
                    lastVersionVm.init(document);
                    specHelper.general.spyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get).and.returnValue(lastVersionVm);

                    deleteDefer.resolve(ap.controllers.DeleteDocumentResponse.Version);
                    $rootScope.$apply();
                });

                afterEach(() => {
                    specHelper.general.offSpyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get);
                });

                it("THEN DocumentController.deleteVersion is called", () => {
                    expect(DocumentController.deleteVersion).toHaveBeenCalledWith(docInfo.document, null);
                });
            });

            describe("AND the user chooses a version BUT not the last", () => {

                beforeEach(() => {
                    deleteDefer.resolve(ap.controllers.DeleteDocumentResponse.Version);
                    $rootScope.$apply();
                });

                it("THEN DocumentController.deleteVersion is called", () => {
                    expect(DocumentController.deleteVersion).toHaveBeenCalledWith(docInfo.document, versionVm.originalVersion);
                });
            });
        });
    });


    

    

    describe("Feature: editdocumentrequested", () => {
        let document: ap.models.documents.Document;
        let dialogDefer: angular.IDeferred<any>;

        beforeEach(() => {
            document = new ap.models.documents.Document(Utility);            
        });

        describe("WHEN the event 'editdocumentrequested' is raised from document controller", () => {
            let calledDialogOptions: ng.material.IDialogOptions
            beforeEach(() => {
                vm = createDocumentWorkspaceViewModel(true);
                dialogDefer = $q.defer();

                let spy = <jasmine.Spy>$mdDialog.show;
                spy.and.callFake((dialogOptions: ng.material.IDialogOptions) => {
                    calledDialogOptions = dialogOptions;
                    return dialogDefer.promise;
                });                

                DocumentController.requestEditDocument(document);
                dialogDefer.resolve();
            });

            it("THEN a edit popup is showed to the user", () => {
                expect($mdDialog.show).toHaveBeenCalled();
            });
            it("THEN a edit popup is showed with correct template", () => {
                expect(calledDialogOptions.templateUrl).toBe("me/PartialView?module=Document&name=EditDocumentDialog");
            });
            it("THEN a edit popup is showed with clickOutsideToClose = fase", () => {
                expect(calledDialogOptions.clickOutsideToClose).toBeFalsy();
            });
            it("THEN a edit popup is showed with preserveScope = true", () => {
                expect(calledDialogOptions.preserveScope).toBeTruthy();
            });
            it("THEN a edit popup is showed with fullscreen = true", () => {
                expect(calledDialogOptions.fullscreen).toBeTruthy();
            });            
        });       
    });

    /*
    * TODO need to fix this test
    */
    xdescribe("Feature: criterionschanged", () => {

        let spyFilter: jasmine.Spy;
        let refreshDefer: angular.IDeferred<ap.services.apiHelper.ApiResponse>;


        beforeEach(() => {
            refreshDefer = $q.defer();
            spyOn(ap.viewmodels.folders.FolderListViewModel.prototype, "refresh");
            spyOn(ap.viewmodels.documents.DocumentListViewModel.prototype, "refresh").and.returnValue(refreshDefer.promise);
            vm = createDocumentWorkspaceViewModel(true);
            
            spyOn(vm.documentListVm.listVm, "getPage").and.returnValue({ isLoaded: true });
            vm.documentListVm.listVm.clear();
            spyFilter = specHelper.general.spyProperty(ap.viewmodels.folders.FoldersPagedListViewModel.prototype, "currentDocumentsFilter", specHelper.PropertyAccessor.Set);
            specHelper.general.spyProperty(ap.misc.MainSearchInfo.prototype, "filterString", specHelper.PropertyAccessor.Get).and.returnValue("Filter.Eq(IsArchived, False)");

            specHelper.general.raiseEvent(vm.documentListVm.screenInfo.mainSearchInfo, "criterionschanged", null);
            refreshDefer.resolve(new ap.services.apiHelper.ApiResponse({}));
            $rootScope.$apply();
        });

        afterEach(() => {
            specHelper.general.offSpyProperty(ap.viewmodels.folders.FoldersPagedListViewModel.prototype, "currentDocumentsFilter", specHelper.PropertyAccessor.Set);
            specHelper.general.offSpyProperty(ap.misc.MainSearchInfo.prototype, "filterString", specHelper.PropertyAccessor.Get);
        });

        describe("WHEN the criterionschanged event is raised by the MainSearch", () => {
            it("THEN, the documents list is refreshed", () => {
                expect(vm.documentListVm.refresh).toHaveBeenCalled();
            });

            it("THEN, currentDocumentsFilter of the folders list is set to the value of mainSearch.filterString", () => {
                expect(spyFilter).toHaveBeenCalledWith("Filter.Eq(IsArchived, False)");
            });
        });
    });

    describe("Feature: Document deleted", () => {

        beforeEach(() => {
            specHelper.general.spyProperty(ap.controllers.UIStateController.prototype, "mainFlowState", specHelper.PropertyAccessor.Get).and.returnValue(ap.controllers.MainFlow.Documents);

            spyOn(Utility.Storage.Local, "get").and.callFake((key: string) => {
                if (key === "documents.foldersvisibility") {
                    return true;
                }
            });

            vm = createDocumentWorkspaceViewModel(true);

            spyOn(vm.folderListVm.listVm, "updateCurrentFolderPlansCount");
            specHelper.general.spyProperty(ap.viewmodels.GenericPagedListViewModels.prototype, "ids", specHelper.PropertyAccessor.Get).and.returnValue(["1", "2", "3", "4"]);

            specHelper.general.raiseEvent(DocumentController, "documentdeleted", null);
        });

        afterEach(() => {
            specHelper.general.offSpyProperty(ap.controllers.UIStateController.prototype, "mainFlowState", specHelper.PropertyAccessor.Get);
            specHelper.general.offSpyProperty(ap.viewmodels.GenericPagedListViewModels.prototype, "ids", specHelper.PropertyAccessor.Get);
        });

        describe("WHEN documentdeleted event is raised from the DocumentController", () => {
            it("THEN vm.folderListVm.listVm.updateCurrentFolderPlansCount with the count of the documents ids - 1", () => {
                expect(vm.folderListVm.listVm.updateCurrentFolderPlansCount).toHaveBeenCalledWith(3);
            });
        });
    });

    describe("Feature: documents ids loaded", () => {

        beforeEach(() => {
            specHelper.general.spyProperty(ap.controllers.UIStateController.prototype, "mainFlowState", specHelper.PropertyAccessor.Get).and.returnValue(ap.controllers.MainFlow.Documents);
            specHelper.general.spyProperty(ap.viewmodels.GenericPagedListViewModels.prototype, "ids", specHelper.PropertyAccessor.Get).and.returnValue(["1", "2", "3", "4"]);
        });

        afterEach(() => {
            specHelper.general.offSpyProperty(ap.controllers.UIStateController.prototype, "mainFlowState", specHelper.PropertyAccessor.Get);
            specHelper.general.offSpyProperty(ap.viewmodels.GenericPagedListViewModels.prototype, "ids", specHelper.PropertyAccessor.Get);
        });

        describe("WHEN the ids of the documents lists are loaded AND the folders are visible", () => {

            beforeEach(() => {
                spyOn(Utility.Storage.Local, "get").and.callFake((key: string) => {
                    if (key === "documents.foldersvisibility") {
                        return true;
                    }
                });

                vm = createDocumentWorkspaceViewModel(true);
                spyOn(vm.folderListVm.listVm, "updateCurrentFolderPlansCount");

                specHelper.general.raiseEvent(vm.documentListVm.listVm, "idsloaded", null);
            });

            it("THEN, the planNumber of the current folder is updated with the ids count", () => {
                expect(vm.folderListVm.listVm.updateCurrentFolderPlansCount).toHaveBeenCalledWith(4);
            });
        });

        describe("WHEN the ids of the documents lists are loaded AND the folders not visible", () => {

            beforeEach(() => {
                let elt: ap.viewmodels.documents.DocumentWorkspaceElement = new ap.viewmodels.documents.DocumentWorkspaceElement();
                elt.hasFolderList = false;
                vm = createDocumentWorkspaceViewModel(true, elt);

                spyOn(vm.folderListVm.listVm, "updateCurrentFolderPlansCount");

                specHelper.general.raiseEvent(vm.documentListVm.listVm, "idsloaded", null);
            });

            it("THEN, the planNumber is updated", () => {
                expect(vm.folderListVm.listVm.updateCurrentFolderPlansCount).not.toHaveBeenCalled();
            });
        });
    });

    describe("Feature: upload document", () => {
        let dialogAddDocumentDefer: angular.IDeferred<any>;
        let dialogSelectFolderDefer: angular.IDeferred<any>;
        let calledDialogOptions: ng.material.IDialogOptions;
        let files: File[];
        let defFolderIds;
        let defPlansNum;
        let defDocIds;
        beforeEach(() => {
            files = [];
            dialogAddDocumentDefer = $q.defer();
            dialogSelectFolderDefer = $q.defer();

            defFolderIds = $q.defer();
            defPlansNum = $q.defer();
            defDocIds = $q.defer();

            let spy = <jasmine.Spy>$mdDialog.show;
            spy.and.callFake((dialogOptions: ng.material.IDialogOptions) => {
                calledDialogOptions = dialogOptions;
                if (calledDialogOptions.templateUrl === "me/PartialView?module=Document&name=AddNewDocumentDialog")
                    return dialogAddDocumentDefer.promise;
                else
                    return dialogSelectFolderDefer.promise;
            });
            spyOn(Api, "getApiResponse").and.callFake(function (url, method) {
                if (url.indexOf("rest/projectfolderidsandlevels") >= 0 && method === ap.services.apiHelper.MethodType.Get)
                    return defFolderIds.promise;
                else if (url.indexOf("rest/folderdocumentcount") >= 0 && method === ap.services.apiHelper.MethodType.Get)
                    return defPlansNum.promise;
                else if (url.indexOf("rest/documentsids") >= 0 && method === ap.services.apiHelper.MethodType.Get)
                    return defDocIds.promise;
                return null;
            });

            specHelper.general.spyProperty(ap.controllers.UIStateController.prototype, "mainFlowState", specHelper.PropertyAccessor.Get).and.returnValue(ap.controllers.MainFlow.Documents);

            vm = createDocumentWorkspaceViewModel(true);
            let fileJson = {
                name: "testdocument.pdf"
            };
            let file = <File>fileJson;
            files.push(file);

        });

        afterEach(() => {
            specHelper.general.offSpyProperty(ap.controllers.UIStateController.prototype, "mainFlowState", specHelper.PropertyAccessor.Get);
        });

        describe("WHEN the 'addactionclicked' event of the documentListVm.screenInfo was fired with event name 'document.uploaddoc'", () => {
            beforeEach(() => {
                let addAction: ap.controllers.AddActionClickEvent = new ap.controllers.AddActionClickEvent("document.uploaddoc", null);
                specHelper.general.raiseEvent(vm.documentListVm.screenInfo, "addactionclicked", addAction);
            });
            it("THEN a add document popup is showed to the user", () => {
                expect($mdDialog.show).toHaveBeenCalled();
            });
            it("THEN a add document popup is showed with correct template", () => {
                expect(calledDialogOptions.templateUrl).toBe("me/PartialView?module=Document&name=AddNewDocumentDialog");
            });
            it("THEN a add document popup is showed with clickOutsideToClose = fase", () => {
                expect(calledDialogOptions.clickOutsideToClose).toBeFalsy();
            });
            it("THEN a add document popup is showed with preserveScope = true", () => {
                expect(calledDialogOptions.preserveScope).toBeTruthy();
            });
            it("THEN a add document popup is showed with fullscreen = true", () => {
                expect(calledDialogOptions.fullscreen).toBeTruthy();
            });
        });

        describe("WHEN the add document dialog resolve with 'Save'", () => {
            let addedDocument: ap.models.documents.Document;
            let documentsToUpload: ap.misc.DocumentToUpload[];
            beforeEach(() => {
                
                addedDocument = new ap.models.documents.Document(Utility);
                addedDocument.createByJson({ Id: "D1" });
                specHelper.general.spyProperty(ap.misc.DocumentToUpload.prototype, "document", specHelper.PropertyAccessor.Get).and.returnValue(addedDocument);

                documentsToUpload = [];
                documentsToUpload.push(new ap.misc.DocumentToUpload(Utility, addedDocument));

                specHelper.general.spyProperty(ap.viewmodels.documents.AddNewDocumentViewModel.prototype, "newDocuments", specHelper.PropertyAccessor.Get).and.returnValue(documentsToUpload);
                
                spyOn(vm.documentListVm, "refresh").and.callFake(() => { });

                let addAction: ap.controllers.AddActionClickEvent = new ap.controllers.AddActionClickEvent("document.uploaddoc", null);
                specHelper.general.raiseEvent(vm.documentListVm.screenInfo, "addactionclicked", addAction);
                $scope.$apply();
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.misc.DocumentToUpload.prototype, "document", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.viewmodels.documents.AddNewDocumentViewModel.prototype, "newDocuments", specHelper.PropertyAccessor.Get);
            });

            it("THEN, the refresh method will be call to refresh the list", () => {
                dialogAddDocumentDefer.resolve(ap.viewmodels.documents.AddDocumentStatus.Save);
                $scope.$apply();
                expect(vm.documentListVm.refresh).toHaveBeenCalledWith("D1");
            });

            describe("AND the folders list  is visible", () => {

                let spySet: jasmine.Spy;

                beforeEach(() => {
                    spySet = specHelper.general.spyProperty(ap.viewmodels.folders.FoldersPagedListViewModel.prototype, "currentDocumentsFilter", specHelper.PropertyAccessor.Set);
                    specHelper.general.spyProperty(ap.viewmodels.documents.DocumentWorkspaceElement.prototype, "hasFolderList", specHelper.PropertyAccessor.Get).and.returnValue(true);

                    dialogAddDocumentDefer.resolve(ap.viewmodels.documents.AddDocumentStatus.Save);
                    $scope.$apply();
                });

                afterEach(() => {
                    specHelper.general.offSpyProperty(ap.viewmodels.folders.FoldersPagedListViewModel.prototype, "currentDocumentsFilter", specHelper.PropertyAccessor.Set);
                    specHelper.general.offSpyProperty(ap.viewmodels.documents.DocumentWorkspaceElement.prototype, "hasFolderList", specHelper.PropertyAccessor.Get);
                });

                it("THEN currentDocumentsFilter is set to the current filter to refresh the number of plans in the folder", () => {
                    expect(spySet).toHaveBeenCalledWith(vm.documentListVm.screenInfo.mainSearchInfo.filterString);
                });
            });
        });

        describe("WHEN the add document dialog resolve with the 'RequestFolder'", () => {
            beforeEach(() => {
                let addAction: ap.controllers.AddActionClickEvent = new ap.controllers.AddActionClickEvent("document.uploaddoc", null);
                specHelper.general.raiseEvent(vm.documentListVm.screenInfo, "addactionclicked", addAction);
                $scope.$apply();
            });

            it("THEN, the $mdDialog.show is show again with the folder selector dialog", () => {
                let addNewDocumentResponse: ap.viewmodels.documents.AddNewDocumentResponse = new ap.viewmodels.documents.AddNewDocumentResponse(files, null, ap.viewmodels.documents.AddDocumentStatus.RequestFolder);
                dialogAddDocumentDefer.resolve(addNewDocumentResponse);
                $scope.$apply();

                expect((<jasmine.Spy>$mdDialog.show).calls.count()).toEqual(2);
                expect(calledDialogOptions.templateUrl).toBe("me/PartialView?module=Document&name=FolderSelector");
                expect(calledDialogOptions.clickOutsideToClose).toBeFalsy();
                expect(calledDialogOptions.fullscreen).toBeTruthy();
            });
        });
    });

    describe("Feature: add version", () => {
        describe("WHEN the 'addversionrequested' event of the DocumentController is fired with event name 'document.addversion'", () => {
            let dialogDefer: angular.IDeferred<any>;
            let calledDialogOptions: ng.material.IDialogOptions
            beforeEach(() => {
                vm = createDocumentWorkspaceViewModel(true);

                dialogDefer = $q.defer();

                let spy = <jasmine.Spy>$mdDialog.show;
                spy.and.callFake((dialogOptions: ng.material.IDialogOptions) => {
                    calledDialogOptions = dialogOptions;
                    return dialogDefer.promise;
                });

                let document: ap.models.documents.Document = new ap.models.documents.Document(Utility);
                document.createByJson({Id: "D1"});

                let documentItemVM: ap.viewmodels.documents.DocumentItemViewModel = new ap.viewmodels.documents.DocumentItemViewModel(Utility, $q);
                documentItemVM.init(document);

                specHelper.general.spyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get).and.returnValue(documentItemVM);

                specHelper.general.raiseEvent(DocumentController, "addversionrequested", document);

                dialogDefer.resolve();
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get);
            });

            it("THEN a edit popup is showed to the user", () => {
                expect($mdDialog.show).toHaveBeenCalled();
            });
            it("THEN a edit popup is showed with correct template", () => {
                expect(calledDialogOptions.templateUrl).toBe("me/PartialView?module=Document&name=EditDocumentDialog");
            });
            it("THEN a edit popup is showed with clickOutsideToClose = fase", () => {
                expect(calledDialogOptions.clickOutsideToClose).toBeFalsy();
            });
            it("THEN a edit popup is showed with preserveScope = true", () => {
                expect(calledDialogOptions.preserveScope).toBeTruthy();
            });
            it("THEN a edit popup is showed with fullscreen = true", () => {
                expect(calledDialogOptions.fullscreen).toBeTruthy();
            });
        });       
    });

});