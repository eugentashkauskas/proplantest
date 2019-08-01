describe("Module ap-viewmodels - project issuetype config dialog", () => {
    let $rootScope: angular.IRootScopeService;
    let $mdDialog: angular.material.IDialogService;
    let vm: ap.viewmodels.projects.ProjectIssueTypeConfigDialogViewModel;
    let Utility: ap.utility.UtilityHelper;
    let $q: angular.IQService;
    let Api: ap.services.apiHelper.Api;
    let ControllersManager: ap.controllers.ControllersManager;
    let ServicesManager: ap.services.ServicesManager;
    let $timeout: angular.ITimeoutService;
    let $scope: angular.IScope;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
        angular.mock.module(function ($provide) {
            $provide.factory('$mdDialog', ["$q", function ($q) {
                return specHelper.utility.stubShowMdDialog($q);
            }]);
        });
    });

    beforeEach(inject(function (_$mdDialog_, _Utility_, _$q_, _Api_, _ControllersManager_, _ServicesManager_, _$timeout_, _$rootScope_) {
        $mdDialog = _$mdDialog_;
        Utility = _Utility_;
        $q = _$q_;
        Api = _Api_;
        ControllersManager = _ControllersManager_;
        ServicesManager = _ServicesManager_;
        $timeout = _$timeout_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        specHelper.userContext.stub(Utility);
    }));

    describe("Feature: ProjectIssueTypeConfigDialogViewModel constructor", () => {
        describe("WHEN, init ProjectIssueTypeConfigDialogViewModel", () => {
            let project: ap.models.projects.Project;
            let def: angular.IDeferred<ap.services.apiHelper.ApiResponse>;
            beforeEach(() => {
                def = $q.defer();
                let response: ap.services.apiHelper.ApiResponse = new ap.services.apiHelper.ApiResponse([]);
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake((moduleName: string) => { return true });
                project = new ap.models.projects.Project(Utility);
                spyOn(ControllersManager.mainController, "currentProject").and.returnValue(project);
                spyOn(Api, "getApiResponse").and.returnValue(def.promise);

                def.resolve(response);
                vm = new ap.viewmodels.projects.ProjectIssueTypeConfigDialogViewModel($scope, Utility, $q, Api, ControllersManager, ServicesManager, $mdDialog, $timeout);

                $rootScope.$apply();
            });

            it("THEN, viewmodel is defined", () => {
                expect(vm).toBeDefined();
            });
        });
        
    });
});