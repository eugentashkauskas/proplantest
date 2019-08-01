describe("Module ap-viewmodel - CompanyMemberListViewModel", () => {
    let Api: ap.services.apiHelper.Api;
    let Utility: ap.utility.UtilityHelper;
    let ControllersManager: ap.controllers.ControllersManager;
    let $rootScope: angular.IRootScopeService;
    let $q: angular.IQService;
    let $scope: angular.IScope;
    let vm: ap.viewmodels.company.CompanyMemberListViewModel;
    let ServicesManager: ap.services.ServicesManager;

    beforeEach(() => {
        angular.mock.module("ap-viewmodels");
        angular.mock.module("matchMedia");
    });

    beforeEach(inject((_Api_: ap.services.apiHelper.Api, _Utility_: ap.utility.UtilityHelper, _ControllersManager_: ap.controllers.ControllersManager, _$rootScope_: angular.IRootScopeService, _$q_: angular.IQService) => {
        Api = _Api_;
        Utility = _Utility_;
        ControllersManager = _ControllersManager_;
        $rootScope = _$rootScope_;
        $q = _$q_;

        $scope = $rootScope.$new();
        specHelper.userContext.stub(Utility);
    }));

    function createVm(): ap.viewmodels.company.CompanyMemberListViewModel {
        return new ap.viewmodels.company.CompanyMemberListViewModel(Utility, $q, ControllersManager, ServicesManager);
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
