'use strict';
describe("Module ap-viewmodels - reports", () => {
    var nmp = ap.viewmodels.reports;
    var MainController: ap.controllers.MainController, Utility: ap.utility.UtilityHelper, Api: ap.services.apiHelper.Api, UserContext: ap.utility.UserContext, UIStateController: ap.controllers.UIStateController;
    var $controller: angular.IControllerService, $rootScope: angular.IRootScopeService, $scope: angular.IScope, _deferred: angular.IDeferred<ap.services.apiHelper.ApiResponse>,
        $q: angular.IQService, $timeout: angular.ITimeoutService, $compile: angular.ICompileService;

    var generateReportConfigViewModel: ap.viewmodels.reports.GenerateReportConfigViewModel = null;
    let ReportController: ap.controllers.ReportController;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });
    beforeEach(inject(function (_$rootScope_, _$q_, _$timeout_, _$compile_, _UserContext_, _Utility_, _Api_, _MainController_, _UIStateController_, _ReportController_, _$controller_) {
        MainController = _MainController_;
        ReportController = _ReportController_;
        UIStateController = _UIStateController_;
        Utility = _Utility_;
        UserContext = _UserContext_;
        Api = _Api_;
        $q = _$q_;
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $timeout = _$timeout_;
        _deferred = $q.defer();
        $controller = _$controller_;
        $scope = $rootScope.$new();
        specHelper.utility.stubRootUrl(Utility);
        specHelper.userContext.stub(Utility);
        Utility.Storage.Session.clear();
        specHelper.utility.stubStorageSet(Utility);
        let currentProject = {
            Id: "45152-56",
            Name: "test",
            Code: "PR",
            UserAccessRight: {
                CanUploadDoc: true
            },
            PhotoFolderId: "45121004"
        };
        spyOn(MainController, "currentProject").and.callFake((val) => {
            if (val === undefined) {
                return currentProject;
            }
        });
    }));

    describe("Feature GenerateReportConfigViewModel: init values", () => {
        describe("WHEN the GenerateReportConfigViewModel is created", () => {
            it("THEN I can get an instance of my viewmodel with default values", () => {
                var projectreportconfig: ap.models.reports.ProjectReportConfig;
                projectreportconfig = new ap.models.reports.ProjectReportConfig(Utility);
                projectreportconfig.Code = "NOTELIST";
                projectreportconfig.Name = "List Of Point";

                let accessRight = new ap.models.accessRights.PointReportAccessRight(Utility);
                var reportConfigViewModel = new ap.viewmodels.reports.ReportConfigViewModel(Utility, MainController, accessRight, ReportController);
                reportConfigViewModel.init(projectreportconfig);

                generateReportConfigViewModel = new ap.viewmodels.reports.GenerateReportConfigViewModel(Utility, reportConfigViewModel);
                expect(generateReportConfigViewModel.project).toBeNull();
                expect(generateReportConfigViewModel.listSelectedPointIds).toBeNull();
                expect(generateReportConfigViewModel.reportconfigViewModel.code).toEqual(projectreportconfig.Code);
                
            });

        });
    });

    describe("Feature GenerateReportConfigViewModel: set values", () => {
        describe("WHEN we set values for GenerateReportConfigViewModel", () => {
            it("THEN the values must be fill corect", () => {
                var projectreportconfig: ap.models.reports.ProjectReportConfig;
                projectreportconfig = new ap.models.reports.ProjectReportConfig(Utility);
                projectreportconfig.Code = "NOTELIST";
                projectreportconfig.Name = "List Of Point";

                var project = new ap.models.projects.Project(Utility);
                project.Code = "PRJ";
                project.Name = "Project name";

                var noteIds: string[] = [];
                for (var i = 0; i < 10; i++) {
                    noteIds[i] = ap.utility.UtilityHelper.createGuid();
                }

                let accessRight = new ap.models.accessRights.PointReportAccessRight(Utility);
                var reportConfigViewModel = new ap.viewmodels.reports.ReportConfigViewModel(Utility, MainController, accessRight, ReportController);
                reportConfigViewModel.init(projectreportconfig);

                generateReportConfigViewModel = new ap.viewmodels.reports.GenerateReportConfigViewModel(Utility, reportConfigViewModel);
                generateReportConfigViewModel.project = project;
                generateReportConfigViewModel.listSelectedPointIds = noteIds;

                expect(generateReportConfigViewModel.project.Code).toEqual(project.Code);
                expect(generateReportConfigViewModel.project.Name).toEqual(project.Name);
                expect(generateReportConfigViewModel.listSelectedPointIds.length).toEqual(10);

            });

        });
    });


});   