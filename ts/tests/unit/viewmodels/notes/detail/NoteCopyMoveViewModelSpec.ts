describe("Module ap-viewmodels - NoteCopyViewModel", () => {
    let Utility: ap.utility.UtilityHelper;
    let Api: ap.services.apiHelper.Api;
    let $q: angular.IQService;
    let ControllersManager: ap.controllers.ControllersManager;
    let $timeout: angular.ITimeoutService;
    let AccessRightController: ap.controllers.AccessRightController;
    let $mdDialog: angular.material.IDialogService;
    let vm: ap.viewmodels.notes.NoteCopyMoveViewModel;
  
    let $rootScope: angular.IRootScopeService;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
        angular.mock.module(function ($provide) {
            $provide.factory('$mdDialog', ["$q", function ($q) {
                return specHelper.utility.stubShowMdDialog($q);
            }]);
        });
    });

    beforeEach(inject(function (_Utility_, _Api_, _$q_, _ControllersManager_, _$timeout_, _AccessRightController_, _UserContext_, _$rootScope_) {
        Utility = _Utility_;
        Api = _Api_;
        $q = _$q_;
        $timeout = _$timeout_;
        ControllersManager = _ControllersManager_;
        AccessRightController = _AccessRightController_;
        $rootScope = _$rootScope_;
       
        specHelper.userContext.stub(Utility);
        specHelper.mainController.stub(ControllersManager.mainController, Utility);
    }));

    let createNoteCopyMoveViewModel = () => {
        return new ap.viewmodels.notes.NoteCopyMoveViewModel(Utility, Api, $q, ControllersManager, $timeout, AccessRightController, $mdDialog);
    }

    describe("Constructor", () => {
        describe("WHEN NoteCopyMoveViewModel is created", () => {
            beforeEach(() => {
                vm = createNoteCopyMoveViewModel();
                $rootScope.$apply();
            });
            it("THEN view model to be defined", () => {
                expect(vm).toBeDefined();
                expect(vm.meetingSelectorVM).toBeDefined();
            });
        });
    });
});