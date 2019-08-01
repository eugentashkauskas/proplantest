describe("Module ap-viewmodels - AddMeetingConcernsViewModel", () => {
    let Utility: ap.utility.UtilityHelper,
        $q: angular.IQService,
        $timeout: angular.ITimeoutService,
        ContactController: ap.controllers.ContactController,
        MainController: ap.controllers.MainController,
        ServicesManager: ap.services.ServicesManager,
        $scope: ng.IScope,
        $rootScope: angular.IRootScopeService,
        $mdDialog: angular.material.IDialogService,
        ControllersManager: ap.controllers.ControllersManager,
        Api: ap.services.apiHelper.Api,
        vm: ap.viewmodels.meetingcontacts.AddMeetingConcernsViewModel;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");

        angular.mock.module(($provide) => {
            $provide.factory('$mdDialog', ["$q", function ($q) {
                return specHelper.utility.stubShowMdDialog($q);
            }]);
        });
    });

    beforeEach(inject((_$rootScope_, _Utility_, _Api_, _$q_, _ContactController_, _MainController_, _$mdDialog_, _ControllersManager_, _ServicesManager_, _$timeout_) => {
        Utility = _Utility_;
        Api = _Api_;
        $q = _$q_;
        ServicesManager = _ServicesManager_;
        ContactController = _ContactController_;
        MainController = _MainController_;
        $rootScope = _$rootScope_;
        $mdDialog = _$mdDialog_;
        $scope = $rootScope.$new();
        ControllersManager = _ControllersManager_;
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
    })


    describe("Feature: ImportContactViewModel", () => {
        let contactUsersDefer: angular.IDeferred<string[]>;
        let apiIdsDefer: angular.IDeferred<ap.services.apiHelper.ApiResponse>;
        let apiEntitiesDefer: angular.IDeferred<ap.services.apiHelper.ApiResponse>;
        beforeEach(() => {
            contactUsersDefer = $q.defer();
            apiIdsDefer = $q.defer();
            apiEntitiesDefer = $q.defer();
            spyOn(ControllersManager.contactController, "getContactsUsersIdsOnProject").and.returnValue(contactUsersDefer.promise);
            spyOn(Api, "getApiResponse").and.returnValue(apiIdsDefer.promise);
            spyOn(Api, "getEntityList").and.returnValue(apiEntitiesDefer.promise);
            vm = new ap.viewmodels.meetingcontacts.AddMeetingConcernsViewModel(Utility, Api, $q, $timeout, ControllersManager, ServicesManager, $mdDialog, ["123"]);
            contactUsersDefer.resolve([]);
            apiIdsDefer.resolve(new ap.services.apiHelper.ApiResponse(["test-list-entity-id"]));
            apiEntitiesDefer.resolve(new ap.services.apiHelper.ApiResponse([]));
            $rootScope.$apply();
        });
        
        describe("WHEN the constructor is called", () => {
            it("THEN, the ViewModel is created", () => {
                expect(vm).toBeDefined();
            });

            it("THEN, the projectContactListVm is defined", () => {
                expect(vm.projectContactListVm).toBeDefined();
            });
            it("THEN, the projectContactListVm will load data", () => {
                expect(Api.getApiResponse).toHaveBeenCalled();
                expect(Api.getEntityList).toHaveBeenCalled();
            });
            it("THEN, contact users ids requested", () => {
                expect(ControllersManager.contactController.getContactsUsersIdsOnProject).toHaveBeenCalled();
            });
        });
    });
}); 