'use strict';
describe("Module ap-viewmodels - ReportConfigItemViewModel", () => {
    var nmp = ap.viewmodels.reports;
    var Utility: ap.utility.UtilityHelper;
    var UserContext: ap.utility.UserContext;
    var $controller: angular.IControllerService, $rootScope: angular.IRootScopeService, $scope: angular.IScope, _deferred: angular.IDeferred<ap.services.apiHelper.ApiResponse>,
        $compile: angular.ICompileService;
    let itemViewModel: ap.viewmodels.reports.ReportConfigItemViewModel = null;
    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });
    beforeEach(inject(function (_$rootScope_, _$compile_, _UserContext_, _Utility_, _$controller_) {
        Utility = _Utility_;
        UserContext = _UserContext_;
        $rootScope = _$rootScope_;
        $controller = _$controller_;
        $scope = $rootScope.$new();
        specHelper.utility.stubRootUrl(Utility);
        specHelper.userContext.stub(Utility);
        Utility.Storage.Session.clear();
        specHelper.utility.stubStorageSet(Utility);

        spyOn(Utility.Translator, "getTranslation").and.callFake(function (key) {
            if (key === "app.project_report_template.summaryNoteList")
                return "Summary point list";
            if (key === "app.meeting_report_template.standardNoteList")
                return "Standard list of points";
        });

    }));

    describe("Feature Constructor: init values", () => {
        describe("WHEN the ReportConfigItemViewModel is created", () => {
            it("THEN I can get an instance of my viewmodel with default values", () => {
                itemViewModel = new ap.viewmodels.reports.ReportConfigItemViewModel(Utility);
                expect(itemViewModel).toBeDefined();
                expect(itemViewModel.name).toBeNull();
            });
        });
    });

    describe("Feature copySource method", () => {
        let projectReportTemplate: ap.models.reports.ProjectReportTemplate;
        let meetingReportTemplate: ap.models.reports.MeetingReportTemplate;
        let projectReportConfig: ap.models.reports.ProjectReportConfig;
        beforeEach(() => {
            projectReportTemplate = new ap.models.reports.ProjectReportTemplate(Utility);
            projectReportTemplate.Code = "summaryNoteList";
            projectReportTemplate.Name = "ProjectReportTemplateName";

            meetingReportTemplate = new ap.models.reports.MeetingReportTemplate(Utility);
            meetingReportTemplate.Code = "standardNoteList";
            meetingReportTemplate.Name = "MeetingReportTemplateName";

            projectReportConfig = new ap.models.reports.ProjectReportConfig(Utility);
            projectReportConfig.Name = "ProjectReportConfigName";

            itemViewModel = new ap.viewmodels.reports.ReportConfigItemViewModel(Utility);

        });
        describe("WHEN the ReportConfigItemViewModel is init by the ProjectReportTemplate system", () => {
            it("THEN, the name of the vm is the translation of the template code", () => {
                projectReportTemplate.IsSystem = true;
                itemViewModel.init(projectReportTemplate);
                expect(itemViewModel.name).toEqual("Summary point list");
            });
        });
        describe("WHEN the ReportConfigItemViewModel is init by the ProjectReportTemplate not system", () => {
            it("THEN, the name of the vm is the name of the template", () => {
                projectReportTemplate.IsSystem = false;
                itemViewModel.init(projectReportTemplate);
                expect(itemViewModel.name).toEqual("ProjectReportTemplateName");
            });
        });
        describe("WHEN the ReportConfigItemViewModel is init by the MeetingReportTemplate system", () => {
            it("THEN, the name of the vm is the translation of the template code", () => {
                meetingReportTemplate.IsSystem = true;
                itemViewModel.init(meetingReportTemplate);
                expect(itemViewModel.name).toEqual("Standard list of points");
            });
        });
        describe("WHEN the ReportConfigItemViewModel is init by the MeetingReportTemplate not system", () => {
            it("THEN, the name of the vm is the name of the template", () => {
                meetingReportTemplate.IsSystem = false;
                itemViewModel.init(meetingReportTemplate);
                expect(itemViewModel.name).toEqual("MeetingReportTemplateName");
            });
        });
        describe("WHEN the ReportConfigItemViewModel is init by the ProjectReportConfig", () => {
            it("THEN, the name of the vm is the name of the ProjectReportConfig", () => {
                itemViewModel.init(projectReportConfig);
                expect(itemViewModel.name).toEqual("ProjectReportConfigName");
            });
        });
        
    });

});   