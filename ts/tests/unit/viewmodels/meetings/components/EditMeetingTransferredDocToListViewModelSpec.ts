describe("Module ap-viewmodels - EditMeetingTransferredDocToListViewModel", () => {
    let vm: ap.viewmodels.meetings.EditMeetingTransferredDocToListViewModel;
    let Utility: ap.utility.UtilityHelper, Api: ap.services.apiHelper.Api;
    let $q: angular.IQService, $timeout: angular.ITimeoutService, $rootScope: angular.IRootScopeService;
    let ControllersManager: ap.controllers.ControllersManager;
    let $mdDialog: angular.material.IDialogService

    beforeEach(() => {
        let $window = specHelper.createWindowStub();
        $window.navigator.userLanguage = undefined;
        $window.navigator.language = 'en_US';
        angular.mock.module(($provide) => {
            $provide.value('$window', $window);
        });
    });

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-services");
        angular.mock.module("ap-viewmodels");

        angular.mock.module(($provide) => {
            $provide.factory('$mdDialog', ["$q", ($q) => {
                return specHelper.utility.stubShowMdDialog($q);
            }]);
        });
    });

    beforeEach(inject((_$rootScope_, _$q_, _$timeout_, _$compile_, _Utility_, _Api_, _$mdDialog_, _ControllersManager_) => {
        Utility = _Utility_;
        $q = _$q_;
        Api = _Api_;
        $timeout = _$timeout_;
        $rootScope = _$rootScope_;
        $mdDialog = _$mdDialog_;
        ControllersManager = _ControllersManager_;

        specHelper.utility.stubRootUrl(Utility);
        specHelper.userContext.stub(Utility);
        specHelper.utility.stubStorageSet(Utility);
    }));

    afterEach(() => {
        vm = undefined;
    });

    let createVm: () => void = () => {
        let meetingTransferredDocToListVm = new ap.viewmodels.meetings.MeetingTransferredDocToListViewModel(Utility, Api, $q, $mdDialog, ControllersManager);
        vm = new ap.viewmodels.meetings.EditMeetingTransferredDocToListViewModel(Utility, $mdDialog, "doc_name", meetingTransferredDocToListVm);
    };

    describe("Constructor", () => {

        beforeEach(() => {
            createVm();
        });

        describe("When the constructor is called", () => {
            it("THEN the ViewModel is created",  () => {
                expect(vm).toBeDefined();
            })
        });
    });
});  