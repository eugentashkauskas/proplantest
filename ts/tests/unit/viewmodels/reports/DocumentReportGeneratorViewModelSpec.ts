'use strict';
describe("Module ap-viewmodels - ReportGenerator", () => {
    let nmp = ap.viewmodels.reports;
    let MainController: ap.controllers.MainController, Utility: ap.utility.UtilityHelper, Api: ap.services.apiHelper.Api, UserContext: ap.utility.UserContext, ReportController: ap.controllers.ReportController;
    let $controller: angular.IControllerService, $rootScope: angular.IRootScopeService, $scope: angular.IScope, _deferred: angular.IDeferred<ap.services.apiHelper.ApiResponse>,
        $q: angular.IQService, $timeout: angular.ITimeoutService, $compile: angular.ICompileService;
    let mdDialogDeferred: angular.IDeferred<any>;
    let $mdDialog: angular.material.IDialogService;
    let ProjectController: ap.controllers.ProjectController;
    let ContactService: ap.services.ContactService;
    let DocumentListVm: ap.viewmodels.documents.DocumentListViewModel;
    let documentReportGeneratorViewModel: ap.viewmodels.reports.DocumentReportGeneratorViewModel = null;
    let selectedDocumentIds: string[];
    let allDocumentIds: string[];
    let ServicesManager: ap.services.ServicesManager;
    let ControllersManager: ap.controllers.ControllersManager;
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

    beforeEach(inject(function (_$rootScope_, _$q_, _$timeout_, _$compile_, _UserContext_, _Utility_, _Api_, _MainController_, _ReportController_, _$controller_, _$mdDialog_, _ProjectController_, _ContactService_, _ControllersManager_, _ServicesManager_) {
        ControllersManager = _ControllersManager_;
        ServicesManager = _ServicesManager_;
        MainController = _MainController_;
        ReportController = _ReportController_;
        ProjectController = _ProjectController_;
        ContactService = _ContactService_;
        Utility = _Utility_;
        UserContext = _UserContext_;
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

        
        spyOn(MainController, "currentProject").and.returnValue(
            {
                Id: "b360cb6d-ca54-4b93-a564-a469274eb68a",
                Name: "Welcome Project",
                Code: "PR1"
            }
        );
        let defResp = $q.defer();
        spyOn(Api, "getApiResponse").and.callFake(function (url, method) {
            return defResp.promise;
        });
        defResp.resolve([]);
        let def = $q.defer();
        spyOn(ControllersManager.accessRightController, "getMeetingAccessRight").and.returnValue(def.promise);
        def.resolve(null);
        DocumentListVm = new ap.viewmodels.documents.DocumentListViewModel($scope, $mdDialog, Utility, Api, $q, $timeout, ControllersManager, ServicesManager, new ap.viewmodels.documents.DocumentListOptions(), new ap.models.projects.Folder(Utility), true);
        $rootScope.$apply();
    }));
    describe("Feature Constructor", () => {

        describe("WHEN the ReportGeneratorViewModel is created for entire project", () => {
            it("THEN I can get an instance of ReportGeneratorViewModel", () => {
                documentReportGeneratorViewModel = new ap.viewmodels.reports.DocumentReportGeneratorViewModel($scope, Utility, $q, $mdDialog, $timeout, Api, ReportController, MainController, ProjectController, ContactService, DocumentListVm);
                expect(documentReportGeneratorViewModel).toBeDefined();
            });
        });
    });
});   