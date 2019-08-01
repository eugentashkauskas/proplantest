describe("Module ap-viewmodels - ContactHeaderViewModel", () => {
    let Utility: ap.utility.UtilityHelper,
        $q: angular.IQService,
        $timeout: angular.ITimeoutService,
        $mdDialog: angular.material.IDialogService,
        Api: ap.services.apiHelper.Api,
        ContactService: ap.services.ContactService,
        vm: ap.viewmodels.projectcontacts.ContactHeaderViewModel;
    let controllersManager: ap.controllers.ControllersManager;
    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");

        angular.mock.module(($provide) => {
            $provide.factory("$mdDialog", ["$q", ($q) => {
                return specHelper.utility.stubShowMdDialog($q);
            }]);
        });
    });

    beforeEach(inject((_Utility_, _$q_, _Api_, _ControllersManager_) => {
        Utility = _Utility_;
        $q = _$q_;
        Api = _Api_;
        controllersManager = _ControllersManager_;
    }));

    describe("Feature Constructor", () => {
        let vm: ap.viewmodels.projectcontacts.ContactHeaderViewModel;
        describe("When ContactHeaderViewModel is created", () => {
            beforeEach(() => {
                let def = $q.defer();
                spyOn(controllersManager.mainController, "currentProject").and.returnValue("1");
                spyOn(Api, "getApiResponse").and.returnValue(def.promise);
                spyOn(Api, "getEntityIds").and.returnValue(def.promise);
                vm = new ap.viewmodels.projectcontacts.ContactHeaderViewModel(Utility, $q, controllersManager);
            });
            it("Then the viewModel is defined", () => {
                expect(vm).toBeDefined();
            });
            it("Then loadPage is called", () => {
                expect(Api.getEntityIds).toHaveBeenCalled();
            });
        });
    });
});