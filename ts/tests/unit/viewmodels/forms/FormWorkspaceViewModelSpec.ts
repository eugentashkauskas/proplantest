describe("Module ap-viewmodels - FormListViewModel", () => {
    let Utility: ap.utility.UtilityHelper, ControllersManager: ap.controllers.ControllersManager;
    let ServicesManager: ap.services.ServicesManager, Api: ap.services.apiHelper.Api;
    let $timeout: ng.ITimeoutService, $anchorScroll: ng.IAnchorScrollService, $interval: ng.IIntervalService;
    let vm: ap.viewmodels.forms.FormWorkspaceViewModel;
    let $mdSidenav: angular.material.ISidenavService;
    let $scope: angular.IScope, $q: angular.IQService;
    let $rootScope: angular.IRootScopeService, $mdDialog: ng.material.IDialogService, $location: ng.ILocationService;

    beforeEach(() => {
        angular.mock.module("ngMaterial");
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject((_Utility_, _ControllersManager_, _$timeout_, _ServicesManager_, _$rootScope_, _$q_, _Api_, _$mdSidenav_, _$location_, _$anchorScroll_, _$interval_) => {
        Utility = _Utility_;
        ControllersManager = _ControllersManager_;
        ServicesManager = _ServicesManager_;
        $timeout = _$timeout_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        $q = _$q_;
        Api = _Api_;
        $mdSidenav = _$mdSidenav_;
        $mdDialog = specHelper.utility.stubShowMdDialog($q);
        $location = _$location_;
        $anchorScroll = _$anchorScroll_;
        $interval = _$interval_;
    }));

    describe("Feature: constructor", () => {
        beforeEach(() => {
            vm = new ap.viewmodels.forms.FormWorkspaceViewModel($scope, $mdSidenav, Utility, Api, $q, $mdDialog, $timeout, $location, $anchorScroll, $interval, ControllersManager, ServicesManager);
        });
        describe("WHEN the constructor is called", () => {
            it("THEN the ViewModel is created", () => {
                expect(vm).toBeDefined();
            });
        });
    });
});
