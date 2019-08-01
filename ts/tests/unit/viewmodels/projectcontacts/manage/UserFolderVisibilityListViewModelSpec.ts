describe("Module ap-viewmodels - UserFolderVisibilityListViewModel", () => {
    let vm: ap.viewmodels.projectcontacts.UserFolderVisibilityListViewModel;
    let Utility: ap.utility.UtilityHelper;
    let $q: angular.IQService;
    let Api: ap.services.apiHelper.Api;
    let $timeout: ng.ITimeoutService;
    let controllersManager: ap.controllers.ControllersManager;
    let servicesManager: ap.services.ServicesManager;
    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
        angular.mock.module("ap-services");
    });
    beforeEach(inject((_Utility_, _$q_, _Api_, _ControllersManager_, _$timeout_, _ServicesManager_) => {
        Utility = _Utility_;
        servicesManager = _ServicesManager_;
        $q = _$q_;
        Api = _Api_;
        $timeout = _$timeout_;
        controllersManager = _ControllersManager_;
        specHelper.userContext.stub(Utility);
        spyOn(controllersManager.mainController, "currentProject").and.returnValue("1");
    }));

    describe("Feature Constructor", () => {
        let vm: ap.viewmodels.projectcontacts.UserFolderVisibilityListViewModel;
        describe("When ContactHeaderViewModel is created", () => {
            beforeEach(() => {
                let def = $q.defer();
                spyOn(Api, "getApiResponse").and.returnValue(def.promise);
                spyOn(Api, "getEntityIds").and.returnValue(def.promise);
                vm = new ap.viewmodels.projectcontacts.UserFolderVisibilityListViewModel(Utility, $timeout, Api, $q, controllersManager, servicesManager);
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