describe("Module ap-viewmodels - ProjectSelector", () => {
    let currentProject: ap.models.projects.Project;
    let vm: ap.viewmodels.projects.ProjectSelectorViewModel;
    let Utility: ap.utility.UtilityHelper, ControllersManager: ap.controllers.ControllersManager, Api: ap.services.apiHelper.Api;
    let AccessRightController: ap.controllers.AccessRightController;
    let $q: angular.IQService, $timeout: angular.ITimeoutService, $rootScope: angular.IRootScopeService;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-services");
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject(function (_$rootScope_, _$q_, _$timeout_, _$compile_, _Utility_, _Api_, _ControllersManager_, _AccessRightController_) {
        Utility = _Utility_;
        ControllersManager = _ControllersManager_;
        AccessRightController = _AccessRightController_;
        $q = _$q_;
        Api = _Api_;
        $timeout = _$timeout_;
        $rootScope = _$rootScope_;

        specHelper.utility.stubRootUrl(Utility);
        specHelper.userContext.stub(Utility);
        specHelper.utility.stubStorageSet(Utility);

        currentProject = new ap.models.projects.Project(Utility);
        let jsonProj = {
            Id: "P1",
            Name: "My project"
        };
        modelSpecHelper.fillEntityJson(jsonProj);
        currentProject.createByJson(jsonProj);
        spyOn(ControllersManager.mainController, "currentProject").and.callFake((val) => {
            if (!val)
                return currentProject;
        });;
    }));


    describe("Feature: selectedItem", () => {
        let projectVm1: ap.viewmodels.projects.ProjectItemViewModel;
        let projectVm2: ap.viewmodels.projects.ProjectItemViewModel;
        beforeEach(() => {
            let project1 = new ap.models.projects.Project(Utility);
            project1.createByJson({ Id: "1" });
            let project2 = new ap.models.projects.Project(Utility);
            project2.createByJson({ Id: "2" });

            projectVm1 = new ap.viewmodels.projects.ProjectItemViewModel(Utility, $q);
            projectVm1.init(project1);

            projectVm2 = new ap.viewmodels.projects.ProjectItemViewModel(Utility, $q);
            projectVm2.init(project2);

            vm = new ap.viewmodels.projects.ProjectSelectorViewModel(Utility, $q, ControllersManager, $timeout);
            vm.selectedItem = projectVm1;
        });
        describe("WHEN selectedItem is set with a different projectViewModel", () => {
            let callbackEvent: jasmine.Spy;
            beforeEach(() => {
                callbackEvent = jasmine.createSpy("callbackEvent");
                vm.on("selectedItemChanged", callbackEvent, this);
                vm.selectedItem = projectVm2;
            });
            it("THEN, the selectedItem will be update with the new one", () => {
                expect(vm.selectedItem).toEqual(projectVm2);
            });
            it("THEN, selectedItemChanged is raised", () => {
                expect(callbackEvent).toHaveBeenCalled();
            });
        });
        describe("WHEN selectedItem is set with the same projectViewModel", () => {
            let callbackEvent: jasmine.Spy;
            beforeEach(() => {
                callbackEvent = jasmine.createSpy("callbackEvent");
                vm.on("selectedItemChanged", callbackEvent, this);
                vm.selectedItem = projectVm1;
            });
            it("THEN selectedItemChanged is not raised", () => {
                expect(callbackEvent).not.toHaveBeenCalled();
            });
        });
    });

    describe("Feature: load", () => {
        let deferIds, deferData;
        let customFilter: string;

        describe("When the selector is not used in an import context", () => {
            beforeEach(() => {
                vm = new ap.viewmodels.projects.ProjectSelectorViewModel(Utility, $q, ControllersManager, $timeout);
                $rootScope.$apply();
                deferIds = $q.defer();
                deferData = $q.defer();
                
                spyOn(vm.listVm, "loadIds").and.callThrough();
                spyOn(Api, "getEntityIds").and.returnValue(deferIds.promise);
                spyOn(vm.listVm, "loadPage").and.callThrough();
                spyOn(Api, "getEntityList").and.returnValue(deferData.promise);
                spyOn($timeout, "cancel").and.callThrough();

                customFilter = Filter.isTrue("IsActive");
            });
            describe("WHEN load is called and there is no searchedText defined ", () => {
                beforeEach(() => {
                    vm.load();
                    $rootScope.$apply();
                });
                it("THEN loadIds of the listVm is called with the filter on the current project and the userResponsible filter", () => {
                    expect(vm.listVm.loadIds).toHaveBeenCalledWith(customFilter, undefined);
                });

            });
            describe("WHEN load is called and searchedText is defined", () => {
                let filter: string;
                beforeEach(() => {
                    vm.searchedText = "EL";
                    filter = Filter.contains("Name", "\"" + vm.searchedText + "\"");
                    filter = Filter.and(filter, customFilter);
                    vm.load();
                    $rootScope.$apply();
                });
                it("THEN, load is called with the filter inclued search text", () => {
                    expect(vm.listVm.loadIds).toHaveBeenCalledWith(filter, undefined);
                });
            });

            describe("WHEN load is called and the VM init with defaultMeetingToLoad", () => {
                let filter: string;
                let vm2: ap.viewmodels.projects.ProjectSelectorViewModel;
                beforeEach(() => {
                    filter = Filter.isTrue("IsActive");
                    vm2 = new ap.viewmodels.projects.ProjectSelectorViewModel(Utility, $q, ControllersManager, $timeout);
                    spyOn(vm2.listVm, "loadIds").and.callThrough();
                    spyOn(vm2.listVm, "loadPage").and.callThrough();
                    vm2.load();
                    $rootScope.$apply();
                });

                it("THEN loadIds of the listVm is called with the filter on the current project and the userResponsible filter nad also with filer on Id", () => {
                    expect(vm2.listVm.loadIds).toHaveBeenCalledWith(filter, undefined);
                });
            });
        });

        describe("When the selector is used in an import context", () => {
            beforeEach(() => {
                vm = new ap.viewmodels.projects.ProjectSelectorViewModel(Utility, $q, ControllersManager, $timeout, true);
                $rootScope.$apply();
                deferIds = $q.defer();
                deferData = $q.defer();

                spyOn(vm.listVm, "loadIds").and.callThrough();
                spyOn(Api, "getEntityIds").and.returnValue(deferIds.promise);
                spyOn(vm.listVm, "loadPage").and.callThrough();
                spyOn(Api, "getEntityList").and.returnValue(deferData.promise);
                spyOn($timeout, "cancel").and.callThrough();

                customFilter = Filter.and(Filter.isTrue("IsActive"), Filter.notEq("Id", currentProject.Id));
            });
            describe("WHEN load is called and there is no searchedText defined", () => {
                beforeEach(() => {
                    vm.load();
                    $rootScope.$apply();
                });
                it("THEN loadIds of the listVm is called and the filter excludes the current project", () => {
                    expect(vm.listVm.loadIds).toHaveBeenCalledWith(customFilter, undefined);
                });
            });
        });
    });
});   