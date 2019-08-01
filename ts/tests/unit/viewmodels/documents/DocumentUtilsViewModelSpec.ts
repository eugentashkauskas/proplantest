describe("Module ap-viewmodels - DocumentUtils", () => {
    let $rootScope: angular.IRootScopeService, $scope: angular.IScope, $mdDialog: angular.material.IDialogService, $mdSidenav;
    let $q: angular.IQService;
    let Api: ap.services.apiHelper.Api;
    let $timeout: angular.ITimeoutService;
    let ServicesManager: ap.services.ServicesManager;
    // let $matchMedia: specHelper.matchMedia.stubMatchMedia;
    let $location: angular.ILocationService;
    let $anchorScroll: angular.IAnchorScrollService;
    let $interval: angular.IIntervalService;
    let Utility: ap.utility.UtilityHelper;
    let vm: ap.viewmodels.documents.DocumentUtilsViewModel;
    let ControllersManager: ap.controllers.ControllersManager;
    let DocumentController: ap.controllers.DocumentController, MainController: ap.controllers.MainController;
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
    beforeEach(inject((_$rootScope_, _$mdDialog_, _ControllersManager_, _$q_, _Utility_, _$location_, _$anchorScroll_, _$interval_, _DocumentController_, _MainController_, _Api_, _$timeout_, _ServicesManager_, _$mdSidenav_) => {
        $mdSidenav = _$mdSidenav_;
        ServicesManager = _ServicesManager_;
        $q = _$q_;
        Api = _Api_;
        $location = _$location_;
        $interval = _$interval_;
        $timeout = _$timeout_;
        Utility = _Utility_;
        $anchorScroll = _$anchorScroll_;
        $rootScope = _$rootScope_;
        MainController = _MainController_;
        DocumentController = _DocumentController_;
        ControllersManager = _ControllersManager_;
        $scope = $rootScope.$new();
        $mdDialog = _$mdDialog_;
        specHelper.userContext.stub(Utility);
        spyOn(MainController, "currentProject").and.returnValue(
            {
                Id: "b360cb6d-ca54-4b93-a564-a469274eb68a",
                Name: "Welcome Project",
                UserAccessRight: {
                    ModuleName: "The module project",
                    Level: 4
                }
        });
        vm = new ap.viewmodels.documents.DocumentUtilsViewModel(Utility, $location, $q, $anchorScroll, $interval, $scope, $mdDialog, ControllersManager);;
    }));

    describe("Constructor", () => {
        describe("WHEN DocumentUtilsViewModel is created", () => {
            it("THEN vm has default values", () => {
                expect(vm).toBeDefined();
                expect(vm.document).not.toBeDefined();
            });
            it("AND isDocumentMetadataOpened is false by default", () => {
                expect(vm.isDocumentMetadataOpened).toBeFalsy();
            });
            it("AND documentMetadataVm is defined by default", () => {
                expect(vm.documentMetadataVm).toBeDefined();
            });
            it("AND pictureViewerActions has two actions", () => {
                expect(vm.pictureViewerActions.length).toBe(2);
            });
        });
    });

    describe("Feature: opendocumentrequested", () => {
        let documentItem: ap.models.documents.Document;
        let documentItemVm: ap.viewmodels.documents.DocumentItemViewModel;

        beforeEach(() => {
            documentItem = new ap.models.documents.Document(Utility);
            documentItem.createByJson({ Id: "testId", IsArchived: false, Author: { Id: "Test" } });
            documentItemVm = new ap.viewmodels.documents.DocumentItemViewModel(Utility, $q, null, new ap.viewmodels.documents.DocumentItemParameter(null, null, null, null, Utility, DocumentController, MainController, ControllersManager.meetingController));
            documentItemVm.init(documentItem);
            documentItemVm.copySource();
            vm.document = documentItemVm;
            spyOn(vm.documentMetadataVm, "loadDocument").and.stub();
            vm.openDocumentMetadata();
        });

        describe("WHEN a opendocumentrequested event is raised on the DocumentController and isDocumentMetadataOpened is true", () => {
            beforeEach(() => {
                specHelper.general.raiseEvent(ControllersManager.documentController, "opendocumentrequested", documentItem);
            });

            it("THEN the isDocumentMetadataOpened attribute becomes false", () => {
                expect(vm.isDocumentMetadataOpened).toBeFalsy();
            });
        });
    });

    describe("Feature: docdownloadsourcerequested", () => {
        let documentItem: ap.models.documents.Document;
        let version: ap.models.documents.Version;
        beforeEach(() => {
            documentItem = new ap.models.documents.Document(Utility);
            documentItem.createByJson({ Id: "testId", IsArchived: false, Author: { Id: "Test" } });
            version = new ap.models.documents.Version(Utility);
            specHelper.general.raiseEvent(ControllersManager.documentController, "docdownloadsourcerequested", new ap.controllers.DocumentDownloadSourceEvent(documentItem, version));
        });

        describe("WHEN a docdownloadsourcerequested event is raised on the DocumentController ", () => {
            it("THEN show dialog window", () => {
                expect($mdDialog.show).toHaveBeenCalled();
            });
        });
    });

    describe("Feature: openDocumentMetadata", () => {
        let documentItem: ap.models.documents.Document;
        let documentItemVm: ap.viewmodels.documents.DocumentItemViewModel;

        beforeEach(() => {
            documentItem = new ap.models.documents.Document(Utility);
            documentItem.createByJson({ Id: "testId", IsArchived: false, Author: { Id: "Test" } });

            documentItemVm = new ap.viewmodels.documents.DocumentItemViewModel(Utility, $q, null, new ap.viewmodels.documents.DocumentItemParameter(null, null, null, null, Utility, DocumentController, MainController, ControllersManager.meetingController));
            documentItemVm.init(documentItem);
            documentItemVm.copySource();
            vm.document = documentItemVm;
            spyOn(vm.documentMetadataVm, "loadDocument").and.stub();
        });

        describe("WHEN the openDocumentMetadata method is called", () => {
            beforeEach(() => {
                vm.openDocumentMetadata();
            });

            it("THEN the isDocumentMetadataOpened attribute becomes true", () => {
                expect(vm.isDocumentMetadataOpened).toBeTruthy();
            });

            it("THEN loading of the selected document starts", () => {
                expect(vm.documentMetadataVm.loadDocument).toHaveBeenCalled();
            });

            it("THEN isShowingMetaData property of the selected document is set to true", () => {
                expect(vm.document.isShowingMetaData).toBeTruthy();
            });
        });

        describe("WHEN the openDocumentMetadata method is called twice", () => {
            beforeEach(() => {
                vm.openDocumentMetadata();
                vm.openDocumentMetadata();
            });

            it("THEN the isDocumentMetadataOpened attribute is not switched to false", () => {
                expect(vm.isDocumentMetadataOpened).toBeTruthy();
            });
        });
    });

    describe("Feature: closeDocumentMetadata", () => {
        let documentItem: ap.models.documents.Document;
        let documentItemVm: ap.viewmodels.documents.DocumentItemViewModel;

        beforeEach(() => {
            documentItem = new ap.models.documents.Document(Utility);
            documentItem.createByJson({ Id: "testId", IsArchived: false, Author: { Id: "Test" } });

            documentItemVm = new ap.viewmodels.documents.DocumentItemViewModel(Utility, $q, null, new ap.viewmodels.documents.DocumentItemParameter(null, null, null, null, Utility, DocumentController, MainController, ControllersManager.meetingController));
            documentItemVm.init(documentItem);
            documentItemVm.copySource();

            vm.document = documentItemVm;
            spyOn(vm.documentMetadataVm, "loadDocument").and.stub();
        });

        describe("WHEN the closeDocumentMetadata method is called", () => {
            beforeEach(() => {
                vm.openDocumentMetadata(); // Forse a popup to open
                vm.closeDocumentMetadata();
            });

            it("THEN the isDocumentMetadataOpened attribute becomes false", () => {
                expect(vm.isDocumentMetadataOpened).toBeFalsy();
            });

            it("THEN isShowingMetaData property of the selected document is set to false", () => {
                expect(vm.document.isShowingMetaData).toBeFalsy();
            });
        });

        describe("WHEN the closeDocumentMetadata method is called twice", () => {
            beforeEach(() => {
                vm.openDocumentMetadata(); // Forse a popup to open
                vm.closeDocumentMetadata();
            });

            it("THEN the isDocumentMetadataOpened attribute is not switched to true", () => {
                expect(vm.isDocumentMetadataOpened).toBeFalsy();
            });
        });
    });
});