describe("Module ap-viewmodels - ManageContactsWorkspaceViewModel", () => {
    let Utility: ap.utility.UtilityHelper;
    let controllersManager: ap.controllers.ControllersManager;
    let vm: ap.viewmodels.projectcontacts.ManageContactsWorkspaceViewModel;
    let $rootScope: angular.IRootScopeService;
    let ServicesManager: ap.services.ServicesManager;
    let $timeout: ng.ITimeoutService;
    let $scope: angular.IScope,
        $q: angular.IQService,
        Api: ap.services.apiHelper.Api;
    let $mdDialog: angular.material.IDialogService;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject(function (_Utility_, _ControllersManager_, _$rootScope_, _Api_, _$q_, _ServicesManager_, _$timeout_) {
        Utility = _Utility_;
        controllersManager = _ControllersManager_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        ServicesManager = _ServicesManager_;
        Api = _Api_;
        $timeout = _$timeout_;
        $q = _$q_;
    }));

    beforeEach(() => {
        specHelper.utility.stubUserConnected(Utility);
        specHelper.mainController.stub(controllersManager.mainController, Utility);
        $mdDialog = specHelper.utility.stubShowMdDialog($q);
    });

    // spy Segment.IO calls
    beforeEach(() => {
        spyOn(ServicesManager.toolService, "sendEvent").and.returnValue($q.defer().promise);
    });

    describe("Feature - constructor", () => {
        let testAccessRights: ap.models.accessRights.AccessRight;
        let testAccessRightsDefer: angular.IDeferred<ap.models.accessRights.AccessRight[]>;
        beforeEach(() => {
            testAccessRights = new ap.models.accessRights.ProjectAccessRight(Utility);
            testAccessRights.createByJson({
                Level: ap.models.accessRights.AccessRightLevel.Admin,
                CanConfig: true
            });
            testAccessRightsDefer = $q.defer();
            spyOn(controllersManager.accessRightController, "geAccessRights").and.returnValue(testAccessRightsDefer.promise);
            testAccessRightsDefer.resolve([testAccessRights]);
            $rootScope.$apply();
        });

        describe("WHEN workspace viewmodel is created", () => {
            beforeEach(() => {
                let def = $q.defer();
                spyOn(Api, "getApiResponse").and.returnValue(def.promise);
                spyOn(Api, "getEntityIds").and.returnValue(def.promise);
                vm = new ap.viewmodels.projectcontacts.ManageContactsWorkspaceViewModel($scope, $timeout, Utility, Api, $q, $mdDialog, controllersManager, ServicesManager);
            });
            it("THEN, screen info is initialized with the required parameters", () => {
                expect(vm.screenInfo).toBeDefined();
                expect(vm.screenInfo.name).toEqual("projectmanage");
                expect(vm.screenInfo.sType).toEqual(ap.misc.ScreenInfoType.Detail);
                expect(vm.screenInfo.isFullScreen).toBeTruthy();
            });
        });
    });
});