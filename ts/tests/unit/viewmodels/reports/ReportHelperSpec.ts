describe("Module ap-viewmodels - ReportHelper", () => {
    let $rootScope: angular.IRootScopeService, $scope: angular.IScope, _deferred: angular.IDeferred<ap.services.apiHelper.ApiResponse>, $q: angular.IQService, $timeout: angular.ITimeoutService;
    let ControllersManager: ap.controllers.ControllersManager;
    let ServicesManager: ap.services.ServicesManager;
    let Utility: ap.utility.UtilityHelper, Api: ap.services.apiHelper.Api, UserContext: ap.utility.UserContext;
    let $mdDialog: angular.material.IDialogService;
    let mainFlowStateSpy: jasmine.Spy;
    let reportHelper: ap.viewmodels.reports.ReportHelper;

    beforeEach(() => {

        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");

        angular.mock.module(function ($provide) {
            $provide.factory('$mdDialog', ["$q", function ($q) {
                return specHelper.utility.stubShowMdDialog($q);
            }]);
        });
    });

    beforeEach(inject(function (_$rootScope_, _$q_, _$timeout_, _UserContext_, _Utility_, _Api_, _ControllersManager_, _ServicesManager_, _$mdDialog_) {
        $q = _$q_;
        $rootScope = _$rootScope_;
        $timeout = _$timeout_;
        _deferred = $q.defer();
        $scope = $rootScope.$new();
        Utility = _Utility_;
        UserContext = _UserContext_;
        $mdDialog = _$mdDialog_;
        Api = _Api_;
        ControllersManager = _ControllersManager_;
        ServicesManager = _ServicesManager_;
        specHelper.utility.stubRootUrl(Utility);
        specHelper.userContext.stub(Utility);
        specHelper.utility.stubStorageSet(Utility);
        mainFlowStateSpy = <jasmine.Spy>specHelper.general.spyProperty(ap.controllers.UIStateController.prototype, "mainFlowState", specHelper.PropertyAccessor.Get);
        mainFlowStateSpy.and.returnValue(ap.controllers.MainFlow.Points);
    }));

    // spy Segment.IO calls
    beforeEach(() => {
        spyOn(ServicesManager.toolService, "sendEvent").and.returnValue($q.defer().promise);
    });

    afterEach(() => {
        specHelper.general.offSpyProperty(ap.controllers.UIStateController.prototype, "mainFlowState", specHelper.PropertyAccessor.Get)
    });

    describe("Feature: Constructor", () => {
        beforeEach(() => {
            reportHelper = new ap.viewmodels.reports.ReportHelper($scope, $q, $timeout, $mdDialog, Utility, Api, ServicesManager, ControllersManager);
        })

        describe("WHEN a reportHelper is instanciated", () => {
            it("THEN, the object is defined", () => {
                expect(reportHelper).toBeDefined();
            });
        })
    });
});