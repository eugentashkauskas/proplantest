describe("Module ap-viewmodels - MeetingDocumentWorkspaceViewModel", () => {
    let Utility: ap.utility.UtilityHelper;
    let vm: ap.viewmodels.meetings.MeetingDocumentWorkspaceViewModel;
    let $q: angular.IQService, $rootScope: angular.IRootScopeService, $scope: angular.IScope, $timeout: angular.ITimeoutService;
    let $location: angular.ILocationService, $anchorScroll: angular.IAnchorScrollService, $interval: angular.IIntervalService;
    let $mdDialog: angular.material.IDialogService;
    let Api: ap.services.apiHelper.Api;
    let ControllersManager: ap.controllers.ControllersManager; 
    let ServicesManager: ap.services.ServicesManager;
    let $mdSidenav;
    let meeting: ap.models.meetings.Meeting;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
        angular.mock.module("ap-services");
        angular.mock.module(function ($provide) {
            $provide.factory('$mdDialog', ["$q", function ($q) {
                return specHelper.utility.stubShowMdDialog($q);
            }]);
        });
        let $window = specHelper.createWindowStub();
        angular.mock.module(function ($provide) {
            $provide.value('$window', $window);
            $mdSidenav = specHelper.utility.stubToggleMdSideNav($provide);
        });
    });

    beforeEach(inject(function (_$q_, _$rootScope_, _ControllersManager_, _$timeout_, _$location_, _$anchorScroll_, _$interval_, _$mdDialog_, _Utility_, _Api_, _ServicesManager_, _$mdSidenav_) {
        Utility = _Utility_;
        $mdSidenav = _$mdSidenav_;
        ServicesManager = _ServicesManager_;
        $timeout = _$timeout_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        $q = _$q_;
        $location = _$location_;
        $anchorScroll = _$anchorScroll_;
        $interval = _$interval_;
        $mdDialog = _$mdDialog_;
        Api = _Api_;
        ControllersManager = _ControllersManager_;
        specHelper.userContext.stub(Utility);
        specHelper.utility.stubRootUrl(Utility);
    }));

    beforeEach(() => {
        meeting = new ap.models.meetings.Meeting(Utility);
        meeting.createByJson({ Id: "456" });
        let deferIds: angular.IDeferred<any> = $q.defer();
        let deferData: angular.IDeferred<any> = $q.defer();
        deferIds.resolve(new ap.services.apiHelper.ApiResponse([]));
        deferData.resolve(new ap.services.apiHelper.ApiResponse([]));
        spyOn(Api, "getEntityList").and.returnValue(deferData.promise);
        spyOn(Api, "getEntityIds").and.returnValue(deferIds.promise);
        specHelper.general.spyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get).and.returnValue(meeting);
        let def = $q.defer();
        spyOn(ControllersManager.accessRightController, "getMeetingAccessRight").and.returnValue(def.promise);
        def.resolve(null);
    });

    // spy Segment.IO calls
    beforeEach(() => {
        spyOn(ServicesManager.toolService, "sendEvent").and.returnValue($q.defer().promise);
    });

    afterEach(() => {
        specHelper.general.offSpyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get);
    });

    describe("Feature: Default values", () => {
        beforeEach(() => {

            vm = new ap.viewmodels.meetings.MeetingDocumentWorkspaceViewModel($scope, Utility, Api, $q, $timeout, $location, $anchorScroll, $interval, $mdDialog, ControllersManager, $mdSidenav, ServicesManager);
            $rootScope.$apply();
            $rootScope.$apply();
        });
        describe("WHEN constructor is call", () => {
            it("THEN documentListVm should be defined", () => {
                expect(vm.documentListVm).toBeDefined();
            });
            it("AND documentListVm is create with meeting id", () => {
                expect(vm.documentListVm.meeting).toBe(meeting);
            });
            it("THEN documentListVm.load should be call", () => {
                expect(Api.getEntityIds).toHaveBeenCalled();
            });
        });
    });

});