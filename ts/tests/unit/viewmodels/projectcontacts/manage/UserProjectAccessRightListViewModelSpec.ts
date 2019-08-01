describe("Module ap-viewmodels - UserProjectAccessRightListViewModel", () => {
    let Utility: ap.utility.UtilityHelper;
    let Api: ap.services.apiHelper.Api;
    let $q: angular.IQService;
    let $rootScope: angular.IRootScopeService;
    let ControllersManager: ap.controllers.ControllersManager;
    let vm: ap.viewmodels.projectcontacts.UserProjectAccessRightListViewModel;
    let $mdDialog: angular.material.IDialogService;
    let ServicesManager: ap.services.ServicesManager;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject(function (_Utility_, _Api_, _$q_, _$rootScope_, _ControllersManager_, _ServicesManager_) {
        Utility = _Utility_;
        Api = _Api_;
        $q = _$q_;
        ControllersManager = _ControllersManager_;
        ServicesManager = _ServicesManager_;
        $rootScope = _$rootScope_;
        specHelper.userContext.stub(Utility)
    }));

    beforeEach(() => {
        $mdDialog = specHelper.utility.stubShowMdDialog($q);
        let defProjectController = $q.defer();
        spyOn(ControllersManager.projectController, "getContactAddedInvitedByUser").and.returnValue(defProjectController.promise);
    });

    describe("Feature: constructor", () => {
        beforeEach(() => {
            specHelper.mainController.stub(ControllersManager.mainController, Utility);
            vm = new ap.viewmodels.projectcontacts.UserProjectAccessRightListViewModel(Utility, $q, $mdDialog, ControllersManager, ServicesManager);
        });
        describe("WHEN the list viewmodel is initialized", () => {
            it("THEN, list options are property set", () => {
                expect(vm).toBeDefined();
                expect(vm.options).toBeDefined();
                expect(vm.options.pathToLoad).toEqual("User");
                expect(vm.options.entityName).toEqual("ContactDetails");
                expect(vm.options.requestMethodType).toEqual(ap.services.apiHelper.MethodType.Post);
            });
        }); 
    });
});