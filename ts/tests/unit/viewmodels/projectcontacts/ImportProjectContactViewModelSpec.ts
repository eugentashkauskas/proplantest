describe("Module ap-viewmodels - ImportContactsViewModel", () => {
    let Utility: ap.utility.UtilityHelper, $q: angular.IQService, $timeout: angular.ITimeoutService,
        MainController: ap.controllers.MainController, $scope: ng.IScope, $rootScope: angular.IRootScopeService,
        $mdDialog: angular.material.IDialogService, ControllersManager: ap.controllers.ControllersManager, Api: ap.services.apiHelper.Api,
        vm: ap.viewmodels.projectcontacts.ImportProjectContactViewModel;
    let ServicesManager: ap.services.ServicesManager;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");

        angular.mock.module(($provide) => {
            $provide.factory('$mdDialog', ["$q", ($q) => {
                return specHelper.utility.stubShowMdDialog($q);
            }]);
        });
    });

    beforeEach(inject((_$rootScope_, _Utility_, _$q_, _MainController_, _$mdDialog_, _ControllersManager_, _$timeout_, _ServicesManager_) => {
        Utility = _Utility_;
        $q = _$q_;
        MainController = _MainController_;
        $rootScope = _$rootScope_;
        $mdDialog = _$mdDialog_;
        $scope = $rootScope.$new();
        ControllersManager = _ControllersManager_;
        ServicesManager = _ServicesManager_;
        $timeout = _$timeout_;
        let currentProject = new ap.models.projects.Project(Utility);
        currentProject.createByJson({ Id: "35a2c5d6-0e00-43e9-ada8-ce4f3fadb16e" });
        spyOn(MainController, "currentProject").and.returnValue(currentProject);
    }));

    beforeEach(() => {
        specHelper.userContext.stub(Utility);
        spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake((name) => {
            if (name === ap.models.licensing.Module.Module_VisibilityManagement)
                return true;
            return false;
        });
        vm = new ap.viewmodels.projectcontacts.ImportProjectContactViewModel(Utility, $q, Api, ControllersManager, $mdDialog, $timeout, ServicesManager);
    });

    describe("Feature: ImportContactViewModel", () => {
        describe("WHEN the constructor is called", () => {
            it("THEN, the ViewModel is created", () => {
                expect(vm).toBeDefined();
            });

            it("THEN, the projectSelectorViewModel is defined", () => {
                expect(vm.projectSelectorViewModel).toBeDefined();
            });

            it("THEN, the projectContactListVm is defined", () => {
                expect(vm.projectContactListVm).toBeDefined();
            });
        });
    });
});