describe("Module ap-viewmodels - ChapooSynchroPopupViewModel", () => {

    let Utility: ap.utility.UtilityHelper;
    let _deferred: angular.IDeferred<ap.services.apiHelper.ApiResponse>;
    let ServicesManager: ap.services.ServicesManager;
    let ControllersManager: ap.controllers.ControllersManager;
    let $mdDialog: angular.material.IDialogService, $q: angular.IQService;

    beforeEach(() => {
        let $window = specHelper.createWindowStub();
        angular.mock.module(function ($provide) {
            $provide.value('$window', $window);
            $provide.value('$mdDialog', $mdDialog);
        });

        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");

        angular.mock.module(function ($provide) {
            $provide.factory('$mdDialog', ["$q", function ($q) {
                return specHelper.utility.stubShowMdDialog($q);
            }]);
        });
    });

    beforeEach(inject(function (_Utility_, _ControllersManager_, _ServicesManager_, _$mdDialog_, _$q_) {
        Utility = _Utility_;
        specHelper.utility.stubRootUrl(Utility);
        specHelper.userContext.stub(Utility);
        ControllersManager = _ControllersManager_;
        ServicesManager = _ServicesManager_;
        $mdDialog = _$mdDialog_;
        $q = _$q_;
    }));

    describe("Feature: constructor", () => {
        let vm: ap.viewmodels.cloud.ChapooSynchroPopupViewModel;
        beforeEach(() => {
            let def = $q.defer();
            spyOn(ServicesManager.cloudService, "getFolderSyncInfo").and.returnValue(def.promise);
            let folder: ap.models.projects.Folder = new ap.models.projects.Folder(Utility);
            vm = new ap.viewmodels.cloud.ChapooSynchroPopupViewModel(Utility, $mdDialog, ServicesManager, ControllersManager, folder);
        });

        it("THEN, created with ", () => {
            expect(vm).toBeDefined();
            expect(vm.isConnectionInfoValid).toBeFalsy();
            expect(vm.folders).toEqual([]);
            expect(vm.folderSelected).toBeNull();
            expect(vm.isSync).toBeFalsy();
            expect(vm.password).toBeNull();
            expect(vm.user).toBeNull();
            expect(vm.server).toEqual("my.bricsys247.com");
            expect(vm.syncInfo).toBeUndefined();
            expect(vm.projectSelected).toBeNull();
            expect(vm.projects).toEqual([]);
        });
    });
}); 