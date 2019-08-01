describe("Module ap-viewmodels - DocumentSelectorViewModel", () => {
    let $controller: ng.IControllerService;
    let vm: ap.viewmodels.documents.DocumentSelectorViewModel;
    let MainController: ap.controllers.MainController;
    let ProjectController: ap.controllers.ProjectController;
    let DocumentController: ap.controllers.DocumentController;
    let Utility: ap.utility.UtilityHelper;
    let _deferred: angular.IDeferred<ap.services.apiHelper.ApiResponse>;
    let FolderListVm: ap.viewmodels.folders.FolderListViewModel;
    let UserContext: ap.utility.UserContext;
    let $q: angular.IQService;
    let $rootScope: angular.IRootScopeService;
    let $scope: angular.IScope;
    let $timeout: angular.ITimeoutService;
    let $mdDialog: angular.material.IDialogService;
    let mdDialogDeferred: angular.IDeferred<any>;
    let Api: ap.services.apiHelper.Api;
    let FolderService: ap.services.FolderService;
    let $location: angular.ILocationService;
    let ReportController: ap.controllers.ReportController;
    let $interval: angular.IIntervalService;
    let $anchorScroll: angular.IAnchorScrollService;
    let $mdSidenav: angular.material.ISidenavService;
    let NoteController: ap.controllers.NoteController;
    let ReportService: ap.services.ReportService;
    let AccessRightController: ap.controllers.AccessRightController;
    let ControllersManager: ap.controllers.ControllersManager;
    let ServicesManager: ap.services.ServicesManager;

    beforeEach(() => {
        let $window = specHelper.createWindowStub();
        $window.navigator.userLanguage = undefined;
        $window.navigator.language = 'en_US';
        angular.mock.module(function ($provide) {
            $provide.value('$window', $window);
            $mdSidenav = specHelper.utility.stubToggleMdSideNav($provide);
        });
    });

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
        angular.mock.module("ap-services");

        angular.mock.module(function ($provide) {
            $provide.factory('$mdDialog', ["$q", function ($q) {
                return specHelper.utility.stubShowMdDialog($q);
            }]);
        });
    });

    beforeEach(inject(function (_$q_, _$controller_, _$rootScope_, _MainController_, _ProjectController_, _DocumentController_, _Utility_, _UserContext_, _$mdDialog_, _Api_, _$timeout_, _FolderService_,
        _$location_, _ReportController_, _$interval_, _$anchorScroll_, _NoteController_, _ReportService_, _AccessRightController_, _ControllersManager_, _ServicesManager_) {
        $controller = _$controller_;
        MainController = _MainController_;
        ProjectController = _ProjectController_;
        DocumentController = _DocumentController_;
        AccessRightController = _AccessRightController_;
        ControllersManager = _ControllersManager_;
        ServicesManager = _ServicesManager_;
        Utility = _Utility_;
        UserContext = _UserContext_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        $q = _$q_;
        $mdDialog = _$mdDialog_;
        Api = _Api_;
        $timeout = _$timeout_;
        FolderService = _FolderService_;
        $location = _$location_;
        ReportController = _ReportController_;
        $interval = _$interval_;
        $anchorScroll = _$anchorScroll_;
        NoteController = _NoteController_;
        ReportService = _ReportService_;
        _deferred = $q.defer();

        modelSpecHelper.setUtilityModule(_Utility_);
        specHelper.userContext.stub(_Utility_);
        specHelper.utility.stubRootUrl(_Utility_);

        spyOn(Utility.Translator, "getTranslation").and.callFake(function (key) {
            return "$" + key;
        });

        spyOn(Utility.Translator, "initLanguage");

        spyOn(MainController, "currentProject").and.returnValue(
            {
                Id: "b360cb6d-ca54-4b93-a564-a469274eb68a",
                Name: "Welcome Project"
            }
        );
        
        spyOn(MainController, "licenseAccess").and.returnValue(new ap.models.licensing.LicenseAccess(Utility));
        spyOn(MainController.licenseAccess(), "hasAccess").and.returnValue(true);
    }));

    beforeEach(() => {
        spyOn(ap.viewmodels.folders.FolderListViewModel.prototype, "refresh");
        spyOn(ap.viewmodels.documents.DocumentListViewModel.prototype, "load");

        vm = new ap.viewmodels.documents.DocumentSelectorViewModel($scope, $mdDialog, Utility, Api, $q, $timeout, "Select document", "Save", $mdSidenav, $location, $anchorScroll, $interval, ControllersManager, ServicesManager);
    });

    describe("Feature: Default values", () => {
        it("Can init the instance with default values", () => {
            expect(vm).toBeDefined();
            expect(vm.workspace).toBeDefined();
            expect(vm.actionKey).toBe("Save");
            expect(vm.titleKey).toBe("Select document");
        });
    });

    describe("Feature: cancel method", () => {
        describe("When cancel method was called ", () => {
            it("THEN the $mdDialog.cancel method must be called", () => {
                vm.cancel();
                expect($mdDialog.cancel).toHaveBeenCalled();
            });
        });
    });
    
    describe("Feature: save method", () => {
        describe("When save method was called ", () => {
            it("THEN the selectionaccepted event will be fire and $mdDialog.hide method must be called", () => {
                let eventHandlerSpy: jasmine.Spy = jasmine.createSpy("eventHandler");
                vm.on("selectionaccepted", eventHandlerSpy, this);
                vm.save();
                expect(eventHandlerSpy).toHaveBeenCalled();
                expect($mdDialog.hide).toHaveBeenCalled();
            });
        });
    });

    describe("Feature: get checkedDocuments", () => {
        describe("When get checkedDocuments was called ", () => {
            it("THEN the getCheckedItems method of the listVM must be called", () => {
                spyOn(ap.viewmodels.BaseListEntityViewModel.prototype, "getCheckedItems").and.callThrough();
                let result = vm.checkedDocuments;
                expect(ap.viewmodels.BaseListEntityViewModel.prototype.getCheckedItems).toHaveBeenCalled();
            });
        });
    });
});