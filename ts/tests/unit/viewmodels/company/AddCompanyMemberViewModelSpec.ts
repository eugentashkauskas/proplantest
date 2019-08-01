describe("Module ap-viewmodels - AddCompanyMemberViewModel", () => {
    let Utility: ap.utility.UtilityHelper;
    let $mdDialog: angular.material.IDialogService;
    let MainController: ap.controllers.MainController;
    let CompanyController: ap.controllers.CompanyController;
    let $q: angular.IQService;
    let Api: ap.services.apiHelper.Api;
    let vm: ap.viewmodels.company.AddCompanyMemberViewModel;
    let $timeout: ng.ITimeoutService;
    beforeEach(() => {
        angular.mock.module(function ($provide) {
            $provide.value('$mdDialog', $mdDialog);
        });
        angular.mock.module("ap-viewmodels");
        angular.mock.module("matchMedia");
    });

    beforeEach(inject((_Api_: ap.services.apiHelper.Api, _Utility_: ap.utility.UtilityHelper, _$mdDialog_: angular.material.IDialogService, _MainController_: ap.controllers.MainController, _$q_: angular.IQService, _CompanyController_: ap.controllers.CompanyController, _$timeout_: ng.ITimeoutService) => {
        Utility = _Utility_;
        Api = _Api_;
        $mdDialog = _$mdDialog_;
        $q = _$q_;
        MainController = _MainController_;
        CompanyController = _CompanyController_;
        $timeout = _$timeout_;
        specHelper.userContext.stub(Utility);
    }));

    function createVm(): ap.viewmodels.company.AddCompanyMemberViewModel {
        return new ap.viewmodels.company.AddCompanyMemberViewModel(Utility, $mdDialog, MainController, CompanyController, Api, $q, $timeout);
    }

    describe("Feature: constructor", () => {
        describe("WHEN the constructor is called", () => {
            beforeEach(() => {
                vm = createVm();
            });

            it("THEN the view model is created", () => {
                expect(vm).toBeDefined();
            });
        });
    });
});