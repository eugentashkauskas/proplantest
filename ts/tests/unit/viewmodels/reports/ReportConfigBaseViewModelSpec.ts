describe("Module ap-viewmodels - reports", () => {
    var nmp = ap.viewmodels.reports;
    var MainController: ap.controllers.MainController, Utility: ap.utility.UtilityHelper, Api: ap.services.apiHelper.Api, UserContext: ap.utility.UserContext, UIStateController: ap.controllers.UIStateController;
    var $controller: angular.IControllerService, $rootScope: angular.IRootScopeService, $scope: angular.IScope, _deferred: angular.IDeferred<ap.services.apiHelper.ApiResponse>,
        $q: angular.IQService, $timeout: angular.ITimeoutService, $compile: angular.ICompileService;

    var reportConfigBaseViewModel: ap.viewmodels.reports.ReportConfigBaseViewModel = null;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });
    beforeEach(inject(function (_$rootScope_, _$q_, _$timeout_, _$compile_, _UserContext_, _Utility_, _Api_, _MainController_, _UIStateController_, _$controller_) {
        MainController = _MainController_;
        UIStateController = _UIStateController_;
        Utility = _Utility_;
        UserContext = _UserContext_;
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

    describe("Feature ReportConfigBaseViewModel: init values", () => {
        describe("WHEN the ReportConfigBaseViewModel is created", () => {
            it("THEN I can get an instance of my viewmodel with default values", () => {
                var reportconfigbase: ap.models.reports.ReportConfigBase;
                reportconfigbase = new ap.models.reports.ReportConfigBase(Utility);
                reportconfigbase.Code = "NOTELIST";
                reportconfigbase.Name = "List Of Point";

                reportConfigBaseViewModel = new ap.viewmodels.reports.ReportConfigBaseViewModel(Utility);
                reportConfigBaseViewModel.init(reportconfigbase);

                expect(reportConfigBaseViewModel.code).toEqual(reportconfigbase.Code);
                expect(reportConfigBaseViewModel.name).toEqual(reportconfigbase.Name);

            });

        });
    });

    describe("Feature ReportConfigBaseViewModel: Post change", () => {
        describe("WHEN the view model Post change", () => {
            it("THEN The Entity must update with VM values", () => {
                var reportconfigbase: ap.models.reports.ReportConfigBase;
                reportconfigbase = new ap.models.reports.ReportConfigBase(Utility);
                reportconfigbase.Code = "NOTELIST";
                reportconfigbase.Name = "List Of Point";

                reportConfigBaseViewModel = new ap.viewmodels.reports.ReportConfigBaseViewModel(Utility);
                reportConfigBaseViewModel.init(reportconfigbase);

                reportConfigBaseViewModel.code = "New code";
                reportConfigBaseViewModel.name = "New name";

                reportConfigBaseViewModel.postChanges();

                expect(reportconfigbase.Code).toEqual("New code");
                expect(reportconfigbase.Name).toEqual("New name");

            });

        });
    });

});   