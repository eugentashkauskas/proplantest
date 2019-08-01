describe("Module ap-viewmodels - FormListViewModel", () => {
    let Utility: ap.utility.UtilityHelper, ControllersManager: ap.controllers.ControllersManager;
    let ServicesManager: ap.services.ServicesManager, Api: ap.services.apiHelper.Api;
    let $timeout: ng.ITimeoutService;
    let vm: ap.viewmodels.forms.FormListViewModel;
    let $scope: angular.IScope, $q: angular.IQService;
    let $rootScope: angular.IRootScopeService, $mdDialog: ng.material.IDialogService;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject((_Utility_, _ControllersManager_, _$timeout_, _ServicesManager_, _$rootScope_, _$q_, _Api_) => {
        Utility = _Utility_;
        ControllersManager = _ControllersManager_;
        ServicesManager = _ServicesManager_;
        $timeout = _$timeout_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        $q = _$q_;
        Api = _Api_;
    }));

    describe("Feature: constructor", () => {
        beforeEach(() => {
            vm = new ap.viewmodels.forms.FormListViewModel($scope, Utility, Api, ControllersManager, $q, ServicesManager, $timeout, $mdDialog);
        });
        describe("WHEN the constructor is called", () => {
            it("THEN the ViewModel is created", () => {
                expect(vm).toBeDefined();
            });
        });
    });
});
