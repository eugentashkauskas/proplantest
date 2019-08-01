describe("Module ap-viewmodels - ImportExcelMeetingViewModel", () => {
    let $rootScope: angular.IRootScopeService, $scope: angular.IScope;
    let Utility: ap.utility.UtilityHelper, UserContext: ap.utility.UserContext;
    let $q: angular.IQService;
    let controllersManager: ap.controllers.ControllersManager;
    let $mdDialog: angular.material.IDialogService;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
        angular.mock.module("ap-components");
        angular.mock.module(function ($provide) {
            $provide.factory('$mdDialog', ["$q", function ($q) {
                return specHelper.utility.stubShowMdDialog($q);
            }]);
        });
    });
    beforeEach(inject(function (_$rootScope_, _UserContext_, _Utility_, _$q_, _ControllersManager_, _$mdDialog_) {
        Utility = _Utility_;
        UserContext = _UserContext_;
        $rootScope = _$rootScope_;
        $mdDialog = _$mdDialog_;
        $q = _$q_;
        controllersManager = _ControllersManager_;
        $scope = $rootScope.$new();
    }));

    describe("Feature: cunstructor", () => {
        let vm: ap.viewmodels.meetings.ImportExcelMeetingViewModel;
        beforeEach(() => {
            vm = new ap.viewmodels.meetings.ImportExcelMeetingViewModel(Utility, $q, $mdDialog, controllersManager);
        });

        it("THEN, ImportExcelMeetingViewModel is defined", () => {
            expect(vm).toBeDefined();
        });
    });
});