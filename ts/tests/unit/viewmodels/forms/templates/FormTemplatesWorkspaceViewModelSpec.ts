describe("Module ap-viewmodels - FormTemplatesWorkspaceViewModel", () => {
    let Utility: ap.utility.UtilityHelper, ControllersManager: ap.controllers.ControllersManager;
    let vm: ap.viewmodels.forms.templates.FormTemplatesWorkspaceViewModel;
    let $scope: angular.IScope;
    let $rootScope: angular.IRootScopeService;
    let Api: ap.services.apiHelper.Api;
    let $q: angular.IQService;
    let $timeout: angular.ITimeoutService;
    let $mdDialog: angular.material.IDialogService;
    let def: ng.IDeferred<ap.models.actors.ManagedCompany>;
    let company: ap.models.actors.ManagedCompany;
    beforeEach(() => {
        let $window = specHelper.createWindowStub();
        angular.mock.module(function ($provide) {
            $provide.value('$window', $window);
            $provide.value('$mdDialog', $mdDialog);
        });

        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject((_Utility_, _ControllersManager_, _$rootScope_, _Api_, _$timeout_, _$q_, _$mdDialog_) => {
        Utility = _Utility_;
        ControllersManager = _ControllersManager_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        Api = _Api_;
        $timeout = _$timeout_;
        $q = _$q_;
        $mdDialog = _$mdDialog_;
        specHelper.userContext.stub(Utility);
    }));

    describe("Feature: constructor", () => {
        beforeEach(() => {
            def = $q.defer();
            spyOn(Api, "getApiResponse").and.returnValue(def.promise);
            spyOn(ControllersManager.companyController, "loadManagedCompany").and.returnValue(def.promise);
            vm = new ap.viewmodels.forms.templates.FormTemplatesWorkspaceViewModel(Utility, Api, $q, $timeout, $mdDialog, $scope, ControllersManager);
        });
        describe("WHEN the constructor is called", () => {
            it("THEN the ViewModel is created", () => {
                expect(vm).toBeDefined();
            });
            it("THEN the company is loaded", () => {
                expect(ControllersManager.companyController.loadManagedCompany).toHaveBeenCalled();
            });
        });
    });
    describe("Feature: Fab button visibility", () => {
        let defer: ng.IDeferred<ap.services.apiHelper.ApiResponse>;
        beforeEach(() => {
            def = $q.defer();
            defer = $q.defer();
            spyOn(Api, "getApiResponse").and.returnValue(defer.promise);
            spyOn(ControllersManager.companyController, "loadManagedCompany").and.returnValue(def.promise);
        });
        describe("WHEN the user has the right", () => {
            beforeEach(() => {
                spyOn(ControllersManager.companyController, "isCurrentUserAtLeastManager").and.returnValue(true);
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.returnValue(true);
                vm = new ap.viewmodels.forms.templates.FormTemplatesWorkspaceViewModel(Utility, Api, $q, $timeout, $mdDialog, $scope, ControllersManager);
                def.resolve();
                $rootScope.$apply();
            });
            it("THEN the button is visible", () => {
                expect(vm.listWorkspaceVm.screenInfo.addAction.isVisible).toBeTruthy();
            });
        });
        describe("WHEN the user has not the right", () => {
            beforeEach(() => {
                spyOn(ControllersManager.companyController, "isCurrentUserAtLeastManager").and.returnValue(false);
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.returnValue(false);
                vm = new ap.viewmodels.forms.templates.FormTemplatesWorkspaceViewModel(Utility, Api, $q, $timeout, $mdDialog, $scope, ControllersManager);
                def.resolve();
                $rootScope.$apply();
            });
            it("THEN the button is not visible", () => {
                expect(vm.listWorkspaceVm.screenInfo.addAction.isVisible).toBeFalsy();
            });
        });
    });
});
