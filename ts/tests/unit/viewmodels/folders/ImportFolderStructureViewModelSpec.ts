import ImportFolderStructureViewModel = ap.viewmodels.folders.ImportFolderStructureViewModel;

describe("Module ap-viewmodels - ImportFolderStructureViewModel", () => {

    let ControllersManager: ap.controllers.ControllersManager, Utility: ap.utility.UtilityHelper;
    let $rootScope: angular.IRootScopeService, $scope: angular.IScope, $q: angular.IQService, $timeout: angular.ITimeoutService,
        Api: ap.services.apiHelper.Api, $mdDialog: angular.material.IDialogService, ServicesManager: ap.services.ServicesManager;
    let viewmodel: ImportFolderStructureViewModel;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");

        angular.mock.module(function ($provide) {
            $provide.factory('$mdDialog', ["$q", ($q) => {
                return specHelper.utility.stubShowMdDialog($q);
            }]);
        });
    });

    beforeEach(inject((_Utility_, _ControllersManager_, _$rootScope_, _Api_, _$mdDialog_, _ServicesManager_, _$timeout_, _$q_) => {
        ControllersManager = _ControllersManager_;
        Utility = _Utility_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        Api = _Api_;
        $mdDialog = _$mdDialog_;
        ServicesManager = _ServicesManager_;
        $timeout = _$timeout_;
        $q = _$q_;

        specHelper.userContext.stub(Utility);

        let project = new ap.models.projects.Project(Utility)
        project.createByJson(
            {
                UserAccessRight: {
                    CanAddFolder: true
                }
            });
        spyOn(ControllersManager.mainController, "currentProject").and.returnValue(project);
    }));

    /**
     * Returns an instance of ImportFolderStructureViewModel
     */
    let createVm: () => ImportFolderStructureViewModel = (): ImportFolderStructureViewModel => {
        return new ImportFolderStructureViewModel(Utility, ControllersManager, Api, $mdDialog, $q, $scope, $timeout, ServicesManager);
    }

    describe("Feature constructor", () => {
        describe("When I request to create the ViewModel", () => {

            beforeEach(() => {
                viewmodel = createVm();
            });

            it("THEN the ViewModel is created", () => {
                expect(viewmodel).toBeDefined();
                expect(viewmodel.folderListVm).toBeUndefined();
                expect(viewmodel.projectSelector).toBeDefined();
            });
        });
    });
});