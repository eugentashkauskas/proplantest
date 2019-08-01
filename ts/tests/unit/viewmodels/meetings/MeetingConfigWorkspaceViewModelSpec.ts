describe("Module ap-viewmodels - MeetingConfigWorkspaceViewModel", () => {
    let $rootScope: angular.IRootScopeService, $scope: angular.IScope;
    let Utility: ap.utility.UtilityHelper, UserContext: ap.utility.UserContext;
    let $q: angular.IQService;
    let $timeout: angular.ITimeoutService;
    let $mdDialog: angular.material.IDialogService;
    let Api: ap.services.apiHelper.Api;
    let ControllersManager: ap.controllers.ControllersManager;
    let ServicesManager: ap.services.ServicesManager;
    let mdDialogDeferred: angular.IDeferred<any>;

    let vm: ap.viewmodels.meetings.MeetingConfigWorkspaceViewModel;
    let meeting: ap.models.meetings.Meeting;
    let controllersMeeting: ap.models.meetings.Meeting;
    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");

        angular.mock.module(function ($provide) {
            $provide.factory('$mdDialog', ["$q", function ($q) {
                return specHelper.utility.stubShowMdDialog($q);
            }]);
        });
    });
    beforeEach(inject(function (_$rootScope_, _ControllersManager_, _UserContext_, _Utility_, _$q_, _Api_, _$timeout_, _ServicesManager_, _$mdDialog_) {
        Utility = _Utility_;
        UserContext = _UserContext_;
        $rootScope = _$rootScope_;
        ControllersManager = _ControllersManager_;
        ServicesManager = _ServicesManager_;
        Api = _Api_;
        $q = _$q_;
        $timeout = _$timeout_;
        $mdDialog = _$mdDialog_;
        $scope = $rootScope.$new();
        specHelper.utility.stubRootUrl(Utility);
        specHelper.userContext.stub(Utility);
        specHelper.utility.stubStorageSet(Utility);
    }));
    beforeEach(() => {
        controllersMeeting = new ap.models.meetings.Meeting(Utility);
        controllersMeeting.createByJson({ Title: "ControllersMeeting", UserAccessRight: {CanEdit: true}});
        specHelper.general.spyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get).and.returnValue(controllersMeeting);
    });
    afterEach(() => {
        specHelper.general.offSpyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get);
    });
    describe("Feature: Constructor", () => {
        beforeEach(() => {
            meeting = new ap.models.meetings.Meeting(Utility);
            meeting.createByJson({ Title: "BaseMeeting", UserAccessRight: { CanEdit: true }});
        });
        describe("WHEN meeting is null", () => {
            beforeEach(() => {
                vm = new ap.viewmodels.meetings.MeetingConfigWorkspaceViewModel($scope, Utility, $q, ControllersManager, Api, $timeout, $mdDialog, ServicesManager, meeting);
            });
            it("THEN the meetingVm is correctly init", () => {
                expect(vm.meetingVm.meeting.Title).toEqual("BaseMeeting");
            });
        });
        describe("WHEN meeting is not null", () => {
            beforeEach(() => {
                vm = new ap.viewmodels.meetings.MeetingConfigWorkspaceViewModel($scope, Utility, $q, ControllersManager, Api, $timeout, $mdDialog, ServicesManager, null);
            });
            it("THEN the meetingVm is correctly init", () => {
                expect(vm.meetingVm.meeting.Title).toEqual("ControllersMeeting");
            });
        });
        describe("WHEN the user has access to reportInfo", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.models.accessRights.MeetingAccessRightHelper.prototype, "canAccessReportInfo", specHelper.PropertyAccessor.Get).and.returnValue(true);
                vm = new ap.viewmodels.meetings.MeetingConfigWorkspaceViewModel($scope, Utility, $q, ControllersManager, Api, $timeout, $mdDialog, ServicesManager, null);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.models.accessRights.MeetingAccessRightHelper.prototype, "canAccessReportInfo", specHelper.PropertyAccessor.Get);
            });
            it("THEN the hasReportInfoAccess is true", () => {
                expect(vm.hasReportInfoAccess).toBeTruthy();
            });
        });
        describe("WHEN the user has not access to reportInfo", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.models.accessRights.MeetingAccessRightHelper.prototype, "canAccessReportInfo", specHelper.PropertyAccessor.Get).and.returnValue(false);
                vm = new ap.viewmodels.meetings.MeetingConfigWorkspaceViewModel($scope, Utility, $q, ControllersManager, Api, $timeout, $mdDialog, ServicesManager, null);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.models.accessRights.MeetingAccessRightHelper.prototype, "canAccessReportInfo", specHelper.PropertyAccessor.Get);
            });
            it("THEN the hasReportInfoAccess is false", () => {
                expect(vm.hasReportInfoAccess).toBeFalsy();
            });
        });
        describe("WHEN the user has access to transferredDoc", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.models.accessRights.MeetingAccessRightHelper.prototype, "canAccessTransferredDoc", specHelper.PropertyAccessor.Get).and.returnValue(true);
                vm = new ap.viewmodels.meetings.MeetingConfigWorkspaceViewModel($scope, Utility, $q, ControllersManager, Api, $timeout, $mdDialog, ServicesManager, null);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.models.accessRights.MeetingAccessRightHelper.prototype, "canAccessTransferredDoc", specHelper.PropertyAccessor.Get);
            });
            it("THEN the hasTransferredDocAccess is true", () => {
                expect(vm.hasTransferredDocAccess).toBeTruthy();
            });
        });
        describe("WHEN the user has not access to transferredDoc", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.models.accessRights.MeetingAccessRightHelper.prototype, "canAccessTransferredDoc", specHelper.PropertyAccessor.Get).and.returnValue(false);
                vm = new ap.viewmodels.meetings.MeetingConfigWorkspaceViewModel($scope, Utility, $q, ControllersManager, Api, $timeout, $mdDialog, ServicesManager, null);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.models.accessRights.MeetingAccessRightHelper.prototype, "canAccessTransferredDoc", specHelper.PropertyAccessor.Get);
            });
            it("THEN the hasTransferredDocAccess is false", () => {
                expect(vm.hasTransferredDocAccess).toBeFalsy();
            });
        });
        describe("In every case", () => {
            beforeEach(() => {
                vm = new ap.viewmodels.meetings.MeetingConfigWorkspaceViewModel($scope, Utility, $q, ControllersManager, Api, $timeout, $mdDialog, ServicesManager, null);
            });
            it("THEN screen info init", () => {
                expect(vm.screenInfo).toBeDefined();
            });
            it("THEN selected tab = 0", () => {
                expect(vm.selectedTab).toEqual(0);
            });
        });
    });
});  