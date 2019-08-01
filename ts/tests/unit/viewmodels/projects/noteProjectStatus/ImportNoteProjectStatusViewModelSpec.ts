describe("Module ap-viewmodels - projects - ImportNoteProjectStatusViewModel", () => {
    let Utility: ap.utility.UtilityHelper,
        MainController: ap.controllers.MainController,
        ProjectController: ap.controllers.ProjectController,
        Api: ap.services.apiHelper.Api,
        $q: angular.IQService,
        $timeout: angular.ITimeoutService,
        $mdDialog: angular.material.IDialogService;
    let $rootScope: angular.IRootScopeService;
    let ControllersManager: ap.controllers.ControllersManager;
    let ProjectService: ap.services.ProjectService;
    let spiedCurrentProject: ap.models.projects.Project;
    let defProjectService;
    let meetingAccessRights: ap.models.accessRights.MeetingAccessRight;
    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
        angular.mock.module("ap-controllers");
        angular.mock.module(function ($provide) {
            $provide.factory('$mdDialog', ["$q", function ($q) {
                return specHelper.utility.stubShowMdDialog($q);
            }]);
        });
    });

    beforeEach(inject(function (_Utility_, _Api_, _MainController_, _ProjectController_, _$q_, _$rootScope_, _ControllersManager_, _ProjectService_, _$mdDialog_, _$timeout_) {
        Utility = _Utility_;
        MainController = _MainController_;
        Api = _Api_;
        $q = _$q_;
        ProjectController = _ProjectController_;
        $mdDialog = _$mdDialog_;
        $timeout = _$timeout_;
        ProjectService = _ProjectService_;
        $rootScope = _$rootScope_;
        ControllersManager = _ControllersManager_;
        spiedCurrentProject = specHelper.mainController.stub(MainController, Utility);
    }));

    beforeEach(() => {
        specHelper.userContext.stub(Utility);
        defProjectService = $q.defer();
    });

    let vm: ap.viewmodels.projects.ImportNoteProjectStatusViewModel;
    let tab: string[];
    let id1: string;
    let id2: string;
    let id3: string;
    let defProject;
    beforeEach(() => {
        meetingAccessRights = new ap.models.accessRights.MeetingAccessRight(Utility);
        defProject = $q.defer();
        spyOn(Api, "getEntityIds").and.callFake((entityName: string) => {
            if (entityName === "Project") {
                return defProject.promise;
            }
        });
        specHelper.general.spyProperty(ap.viewmodels.projects.ProjectSelectorViewModel.prototype, "selectedProjectId", specHelper.PropertyAccessor.Get).and.returnValue("1");
    });
    afterEach(() => {
        specHelper.general.offSpyProperty(ap.viewmodels.projects.ProjectSelectorViewModel.prototype, "selectedProjectId", specHelper.PropertyAccessor.Get);
    });

    describe("WHEN the constructor is called", () => {
        let def: any;
        beforeEach(() => {
            def = $q.defer();
            vm = new ap.viewmodels.projects.ImportNoteProjectStatusViewModel(Utility, $q, ControllersManager, Api, $mdDialog, meetingAccessRights, $timeout);
            def.resolve();
            $rootScope.$apply();
        });
        it("THEN noteProjectStatusListVm is defined", () => {
            expect(vm.noteProjectStatusListVm).toBeDefined();
        });
        it("THEN .projectSelector.load is called", () => {
            expect(Api.getEntityIds).toHaveBeenCalled();
        });
    });


    describe("WHEN the method projectSelectorSelectedItemChanged is called", () => {
        beforeEach(() => {
            vm = new ap.viewmodels.projects.ImportNoteProjectStatusViewModel(Utility, $q, ControllersManager, Api, $mdDialog, meetingAccessRights, $timeout);
            spyOn(vm, "loadData");
            specHelper.general.raiseEvent(vm.projectSelector, "selectedItemChanged", { Id: "selectedVm" });
        });
        it("THEN specifyIds is called", () => {
            expect(vm.loadData).toHaveBeenCalled();
        });
    });
}); 