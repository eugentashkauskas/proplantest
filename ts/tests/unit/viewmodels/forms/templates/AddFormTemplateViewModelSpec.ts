describe("Module ap-viewmodels - AddFormTemplateViewModel", () => {
    let Utility: ap.utility.UtilityHelper;
    let vm: ap.viewmodels.forms.templates.AddFormTemplateViewModel;
    let $scope: angular.IScope;
    let $rootScope: angular.IRootScopeService;
    let $mdDialog: angular.material.IDialogService;
    let ControllersManager: ap.controllers.ControllersManager;
    let $q: angular.IQService;
    let Api: ap.services.apiHelper.Api;
    let $timeout: angular.ITimeoutService;
    beforeEach(() => {
        let $window = specHelper.createWindowStub();
        angular.mock.module(function ($provide) {
            $provide.value('$window', $window);
            $provide.value('$mdDialog', $mdDialog);
        });

        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject((_Utility_, _$rootScope_, _$mdDialog_, _$q_, _Api_, _$timeout_, _ControllersManager_) => {
        Utility = _Utility_;
        $rootScope = _$rootScope_;
        $mdDialog = _$mdDialog_;
        $scope = $rootScope.$new();
        Api = _Api_;
        $q = _$q_;
        $timeout = _$timeout_;
        ControllersManager = _ControllersManager_;
        specHelper.userContext.stub(Utility);
    }));

    describe("Feature: constructor", () => {
        beforeEach(() => {
            vm = new ap.viewmodels.forms.templates.AddFormTemplateViewModel(Utility, $mdDialog, Api, $q, $timeout, $scope, ControllersManager);
        });
        describe("WHEN the constructor is called", () => {
            it("THEN the ViewModel is created", () => {
                expect(vm).toBeDefined();
            });
        });
    });
});
