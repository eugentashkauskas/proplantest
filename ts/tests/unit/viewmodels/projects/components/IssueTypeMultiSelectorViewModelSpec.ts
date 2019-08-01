﻿describe("Feature: IssueTypeMultiSelectorViewModel", () => {
    let Utility: ap.utility.UtilityHelper;
    let Api: ap.services.apiHelper.Api;
    let $q: angular.IQService;
    let $rootScope: angular.IRootScopeService;
    let controllersManager: ap.controllers.ControllersManager;
    let vm: ap.viewmodels.projects.IssueTypeMultiSelectorViewModel;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject(function (_Utility_, _Api_, _$q_, _$rootScope_, _ControllersManager_) {
        Utility = _Utility_;
        Api = _Api_;
        $q = _$q_;
        controllersManager = _ControllersManager_;
        $rootScope = _$rootScope_;
    }));

    beforeEach(() => {
        let project = new ap.models.projects.Project(Utility);
        project.createByJson({ Id: "test-project-id" });
        spyOn(controllersManager.mainController, "currentProject").and.returnValue(project);
        vm = new ap.viewmodels.projects.IssueTypeMultiSelectorViewModel(Utility, Api, $q, controllersManager);
    });

    describe("WHEN RoomMultiSelectorViewModel is created", () => {

        it("THEN, list options should be initialized properly", () => {
            expect(vm.entityName).toEqual("ChapterHierarchy");
        });
        it("THEN, the vm contains custom params projectid and baseentityname", () => {
            expect(vm.getParam("projectid").value).toEqual("test-project-id");
            expect(vm.getParam("baseentityname").value).toEqual("IssueType");
        });

    });
});