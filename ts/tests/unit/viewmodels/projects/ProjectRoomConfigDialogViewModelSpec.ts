describe("Module ap-viewmodels - ProjectRoomConfigDialogViewModel", () => {
    let $rootScope: angular.IRootScopeService;
    let $mdDialog: angular.material.IDialogService;
    let vm: ap.viewmodels.projects.ProjectRoomConfigDialogViewModel;
    let Utility: ap.utility.UtilityHelper;
    let $q: angular.IQService;
    let Api: ap.services.apiHelper.Api;
    let ControllersManager: ap.controllers.ControllersManager;
    let ServicesManager: ap.services.ServicesManager;
    let $timeout: angular.ITimeoutService;
    let project: ap.models.projects.Project;
    let def: angular.IDeferred<ap.services.apiHelper.ApiResponse>;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
        angular.mock.module(($provide) => {
            $provide.factory('$mdDialog', ["$q", ($q) => {
                return specHelper.utility.stubShowMdDialog($q);
            }]);
        });
    });

    beforeEach(inject((_$mdDialog_, _Utility_, _$q_, _Api_, _ControllersManager_, _ServicesManager_, _$timeout_, _$rootScope_) => {
        $mdDialog = _$mdDialog_;
        Utility = _Utility_;
        $q = _$q_;
        Api = _Api_;
        ControllersManager = _ControllersManager_;
        ServicesManager = _ServicesManager_;
        $timeout = _$timeout_;
        $rootScope = _$rootScope_;

        specHelper.userContext.stub(Utility);
    }));

    beforeEach(() => {
        spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake((moduleName: string) => { return true });
        project = new ap.models.projects.Project(Utility);
        spyOn(ControllersManager.mainController, "currentProject").and.returnValue(project);
        def = $q.defer();
        spyOn(Api, "getApiResponse").and.returnValue(def.promise);
    });

    let createVm: () => ap.viewmodels.projects.ProjectRoomConfigDialogViewModel = () => {
        return new ap.viewmodels.projects.ProjectRoomConfigDialogViewModel(Utility, $q, $mdDialog, Api, ControllersManager, ServicesManager, $timeout);
    }

    describe("Feature: ProjectRoomTypeConfigDialogViewModel constructor", () => {

        describe("WHEN, init ProjectRoomTypeConfigDialogViewModel", () => {
            beforeEach(() => {
                def.resolve(new ap.services.apiHelper.ApiResponse([]));
                vm = createVm();

                $rootScope.$apply();
            });

            it("THEN, viewmodel is defined", () => {
                expect(vm).toBeDefined();
            });
        });
    });
});