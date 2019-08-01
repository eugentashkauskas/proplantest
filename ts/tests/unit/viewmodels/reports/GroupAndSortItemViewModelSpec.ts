'use strict';
describe("Module ap-viewmodels - reports", () => {
    var nmp = ap.viewmodels.reports;
    var MainController: ap.controllers.MainController, Utility: ap.utility.UtilityHelper, Api: ap.services.apiHelper.Api, UserContext: ap.utility.UserContext, UIStateController: ap.controllers.UIStateController;
    var $controller: angular.IControllerService, $rootScope: angular.IRootScopeService, $scope: angular.IScope, _deferred: angular.IDeferred<ap.services.apiHelper.ApiResponse>,
        $q: angular.IQService, $timeout: angular.ITimeoutService, $compile: angular.ICompileService;

    var goupAndSortItemViewModel: ap.viewmodels.reports.GroupAndSortItemViewModel = null;

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

    describe("Feature GroupAndSortItemViewModel: init values", () => {
        describe("WHEN the GroupAndSortItemViewModel is created", () => {
            it("THEN I can get an instance of my viewmodel with default values", () => {
                goupAndSortItemViewModel = new ap.viewmodels.reports.GroupAndSortItemViewModel(Utility);
                expect(goupAndSortItemViewModel.propertyName).toBeNull();
                expect(goupAndSortItemViewModel.isAscending).toBeFalsy();
                
                goupAndSortItemViewModel.isAscending = true;                
                expect(goupAndSortItemViewModel.isAscending).toEqual(true);
            });
        });
    });

    describe("Feature: columnDefNote", () => {
        describe("WHEN set columnDefNote", () => {
            let columDef: ap.models.reports.ReportColumnDefNote;
            beforeEach(() => {
                goupAndSortItemViewModel = new ap.viewmodels.reports.GroupAndSortItemViewModel(Utility);
                columDef = new ap.models.reports.ReportColumnDefNote(Utility);
                columDef.PropertyName = "Code";

                goupAndSortItemViewModel.columnDefNote = columDef;
            });
            it("THEN getter should return same value", () => {
                expect(goupAndSortItemViewModel.columnDefNote).toEqual(columDef)
            });
            it("THEN property value changed follow the column set", () => {
                expect(goupAndSortItemViewModel.propertyName).toEqual("Code");
            });
        });
    });
});   