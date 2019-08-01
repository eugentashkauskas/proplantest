describe("Module ap-viewmodels - UserCategoryLinksListViewModel", () => {
    let vm: ap.viewmodels.projectcontacts.UserCategoryLinksListViewModel;
    let Utility: ap.utility.UtilityHelper;
    let $q: angular.IQService;
    let Api: ap.services.apiHelper.Api;
    let ControllersManager: ap.controllers.ControllersManager;
    let ServicesManager: ap.services.ServicesManager;
    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
        angular.mock.module("ap-services");
    });
    beforeEach(inject((_Utility_, _$q_, _Api_, _ControllersManager_, _ServicesManager_) => {
        Utility = _Utility_;
        $q = _$q_;
        Api = _Api_;
        ControllersManager = _ControllersManager_;
        ServicesManager = _ServicesManager_;
        spyOn(ControllersManager.mainController, "currentProject").and.returnValue("1");
    }));

    describe("Feature Constructor", () => {
        let vm: ap.viewmodels.projectcontacts.UserCategoryLinksListViewModel;
        describe("When ContactHeaderViewModel is created", () => {
            beforeEach(() => {
                let def = $q.defer();
                spyOn(Api, "getApiResponse").and.returnValue(def.promise);
                spyOn(Api, "getEntityIds").and.returnValue(def.promise);
                vm = new ap.viewmodels.projectcontacts.UserCategoryLinksListViewModel(Utility, $q, ControllersManager, ServicesManager);
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