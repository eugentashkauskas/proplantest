describe("Module ap-viewmodel - CompanyUserWorkspaceViewModel", () => {
    let Api: ap.services.apiHelper.Api;
    let Utility: ap.utility.UtilityHelper;
    let ControllersManager: ap.controllers.ControllersManager;
    let ServicesManager: ap.services.ServicesManager;
    let $rootScope: angular.IRootScopeService;
    let $q: angular.IQService;
    let $scope: angular.IScope;
    let vm: ap.viewmodels.company.CompanyUserWorkspaceViewModel;
    let $mdDialog: angular.material.IDialogService;
    let $timeout: ng.ITimeoutService;
    beforeEach(() => {
        angular.mock.module(function ($provide) {
            $provide.value('$mdDialog', $mdDialog);
        });
        angular.mock.module("ap-viewmodels");
        angular.mock.module("matchMedia");
    });

    beforeEach(inject((_Api_: ap.services.apiHelper.Api, _Utility_: ap.utility.UtilityHelper, _ServicesManager_: ap.services.ServicesManager, _ControllersManager_: ap.controllers.ControllersManager, _$rootScope_: angular.IRootScopeService, _$q_: angular.IQService, _$mdDialog_, _$timeout_: ng.ITimeoutService) => {
        Api = _Api_;
        Utility = _Utility_;
        ServicesManager = _ServicesManager_;
        ControllersManager = _ControllersManager_;
        $rootScope = _$rootScope_;
        $q = _$q_;
        $mdDialog = _$mdDialog_;
        $timeout = _$timeout_;
        $scope = $rootScope.$new();
        specHelper.userContext.stub(Utility);
    }));

    function createVm(): ap.viewmodels.company.CompanyUserWorkspaceViewModel {
        return new ap.viewmodels.company.CompanyUserWorkspaceViewModel(Utility, $scope, ControllersManager, Api, $q, $mdDialog, $timeout, ServicesManager);
    }

    describe("Feature: constructor", () => {
        let company: ap.models.actors.ManagedCompany;
        beforeEach(() => {
            company = new ap.models.actors.ManagedCompany(Utility);
            company.createByJson({
                Id: "test-company-id"
            });
        })
        describe("WHEN the constructor is called", () => {
            describe("AND current company is not initialized", () => {
                beforeEach(() => {
                    let loadManagedCompanyResponse = $q.defer();
                    spyOn(ControllersManager.companyController, "loadManagedCompany").and.returnValue(loadManagedCompanyResponse.promise);
                    vm = createVm();
                })
                it("THEN, the vm is created, but view is not initialized", () => {
                    expect(vm).toBeDefined();
                    expect(vm.listWorkspaceVm).toBeUndefined();
                });
            });
            describe("AND current company is initialized", () => {
                beforeEach(() => {
                    let def = $q.defer();
                    specHelper.general.spyProperty(ap.controllers.CompanyController.prototype, "managedCompany", specHelper.PropertyAccessor.Get).and.returnValue(company);
                    spyOn(ControllersManager.mainController, "initScreen");
                    spyOn(Api, "getApiResponse").and.returnValue($q.defer().promise);
                    vm = createVm();
                    $rootScope.$apply();
                });
                afterEach(() => {
                    specHelper.general.offSpyProperty(ap.controllers.CompanyController.prototype, "managedCompany", specHelper.PropertyAccessor.Get);
                })
                it("THEN the view model is created AND view is initialized", () => {
                    expect(vm).toBeDefined();
                    expect(vm.listWorkspaceVm).toBeDefined();
                    expect(ControllersManager.mainController.initScreen).toHaveBeenCalled();
                    expect((<jasmine.Spy>ControllersManager.mainController.initScreen).calls.first().args[0].name).toEqual("companymembers");
                });
            });
            describe("AND current company was initialized after", () => {
                beforeEach(() => {

                    let def = $q.defer();
                    spyOn(ControllersManager.companyController, "loadManagedCompany").and.returnValue(def.promise);

                    spyOn(ControllersManager.mainController, "initScreen");
                    spyOn(Api, "getApiResponse").and.returnValue($q.defer().promise);

                    vm = createVm();

                    specHelper.general.spyProperty(ap.controllers.CompanyController.prototype, "managedCompany", specHelper.PropertyAccessor.Get).and.returnValue(company);
                    def.resolve();

                    $rootScope.$digest();
                });
                afterEach(() => {
                    specHelper.general.offSpyProperty(ap.controllers.CompanyController.prototype, "managedCompany", specHelper.PropertyAccessor.Get);
                })
                it("THEN the view model is created AND view is initialized", () => {
                    expect(vm).toBeDefined();
                    expect(vm.listWorkspaceVm).toBeDefined();
                    expect(ControllersManager.mainController.initScreen).toHaveBeenCalled();
                    expect((<jasmine.Spy>ControllersManager.mainController.initScreen).calls.first().args[0].name).toEqual("companymembers");
                });
            })
        });
    });
});
