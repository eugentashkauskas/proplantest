describe("Module ap-viewmodels - AddProjectContactViewModel", () => {
    let Utility: ap.utility.UtilityHelper,
        $q: angular.IQService,
        $timeout: angular.ITimeoutService,
        $mdDialog: angular.material.IDialogService,
        Api: ap.services.apiHelper.Api,
        ControllersManager: ap.controllers.ControllersManager,
        ContactService: ap.services.ContactService,
        vm: ap.viewmodels.projectcontacts.AddProjectContactViewModel;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");

        angular.mock.module(($provide) => {
            $provide.factory("$mdDialog", ["$q", ($q) => {
                return specHelper.utility.stubShowMdDialog($q);
            }]);
        });
    });

    beforeEach(inject((_Utility_, _$q_, _$timeout_, _$mdDialog_, _Api_, _ControllersManager_, _ContactService_) => {
        Utility = _Utility_;
        $q = _$q_;
        $timeout = _$timeout_;
        $mdDialog = _$mdDialog_;
        Api = _Api_;
        ControllersManager = _ControllersManager_;
        ContactService = _ContactService_;
    }));

    beforeEach(() => {
        let currentProject = new ap.models.projects.Project(Utility);
        currentProject.createByJson({ Id: "test-current-project-id" });
        spyOn(ControllersManager.mainController, "currentProject").and.returnValue(currentProject);

        spyOn(ControllersManager.contactController, "getContactsUsersIdsOnProject").and.returnValue($q.resolve([]));

        vm = new ap.viewmodels.projectcontacts.AddProjectContactViewModel(Utility, Api, $q, $timeout, $mdDialog, ControllersManager, ContactService);
    });

    describe("Feature: constructor", () => {
        describe("WHEN the constructor is called", () => {
            it("THEN the ViewModel is created", () => {
                expect(vm).toBeDefined();
            });

            it("THEN the searchText is defined", () => {
                expect(vm.searchText).toBeDefined();
            });

            it("THEN the contactSelector is defined", () => {
                expect(vm.contactSelector).toBeDefined();
            });
        });
    });
});
