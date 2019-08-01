'use strict';
describe("Module ap-viewmodels - ReportTemplateList", () => {
    var nmp = ap.viewmodels.reports;
    var MainController: ap.controllers.MainController, Utility: ap.utility.UtilityHelper, Api: ap.services.apiHelper.Api, UserContext: ap.utility.UserContext, ReportController: ap.controllers.ReportController;
    var $controller: angular.IControllerService, $rootScope: angular.IRootScopeService, $scope: angular.IScope, _deferred: angular.IDeferred<ap.services.apiHelper.ApiResponse>,
        $q: angular.IQService, $timeout: angular.ITimeoutService, $compile: angular.ICompileService;

    var reportTemplateListViewModel: ap.viewmodels.reports.ReportTemplateListViewModel = null;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });
    beforeEach(inject(function (_$rootScope_, _$q_, _$timeout_, _$compile_, _UserContext_, _Utility_, _Api_, _MainController_, _ReportController_, _$controller_) {
        MainController = _MainController_;
        ReportController = _ReportController_;
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
    }));

    describe("Feature constructor", () => {
        describe("WHEN the ReportTemplateListViewModel is created", () => {
            it("THEN I can get an instance of my viewmodel with default values", () => {
                reportTemplateListViewModel = new ap.viewmodels.reports.ReportTemplateListViewModel(Utility, $q, ReportController);
                expect(reportTemplateListViewModel).toBeDefined();
                expect(reportTemplateListViewModel.entityName).toEqual("ReportConfigBase");
                expect(reportTemplateListViewModel.pathToLoad).toBeNull();
                expect(reportTemplateListViewModel.sortOrder).toBeNull();
                expect(reportTemplateListViewModel.defaultFilter).toBeNull();

            });

        });
    });
    describe("Feature load method", () => {
       
        describe("Load project report template", () => {
            let defProjectTemplateList: angular.IDeferred<ap.models.reports.ProjectReportTemplate[]>;
            let templateList: ap.models.reports.ProjectReportTemplate[];

            beforeEach(() => {
                templateList = [];
                defProjectTemplateList = $q.defer();

                spyOn(ReportController, "getProjectTemplates").and.returnValue(defProjectTemplateList.promise);;
                spyOn(ap.viewmodels.reports.ReportConfigItemViewModel.prototype, "init");

                let template1 = new ap.models.reports.ProjectReportTemplate(Utility);
                template1.createByJson({ Id: "T1" });
                let template2 = new ap.models.reports.ProjectReportTemplate(Utility);
                template2.createByJson({ Id: "T2" });
                templateList.push(template1);
                templateList.push(template2);

                defProjectTemplateList.resolve(templateList);

                reportTemplateListViewModel = new ap.viewmodels.reports.ReportTemplateListViewModel(Utility, $q, ReportController);

                spyOn(reportTemplateListViewModel, "onLoadItems");
                spyOn(reportTemplateListViewModel, "selectEntity");

            });
            describe("WHEN 'load' method is called with the 'idToSelect'", () => {
                
                it("THEN, the ReportController.getProjectTemplates will be called", () => {
                    reportTemplateListViewModel.load("T2");
                    $rootScope.$apply();
                    expect(ReportController.getProjectTemplates).toHaveBeenCalled();
                });
                it("AND, the ReportConfigItemViewModel will be init", () => {
                    reportTemplateListViewModel.load("T2");
                    $rootScope.$apply();
                    expect((<jasmine.Spy>ap.viewmodels.reports.ReportConfigItemViewModel.prototype.init).calls.count()).toEqual(2);
                });

                it("AND, the onLoadItems method will be call with the list vm", () => {
                    reportTemplateListViewModel.load("T2");
                    $rootScope.$apply();
                    expect(reportTemplateListViewModel.onLoadItems).toHaveBeenCalled();
                });
                it("AND, the selectEntity method will be call with the given ids", () => {
                    reportTemplateListViewModel.load("T2");
                    $rootScope.$apply();
                    expect(reportTemplateListViewModel.selectEntity).toHaveBeenCalledWith("T2");
                });
            });
            describe("WHEN 'load' method is called without the 'idToSelect'", () => {
                it("THEN, the ReportController.getProjectTemplates will be called", () => {
                    reportTemplateListViewModel.load();
                    $rootScope.$apply();
                    expect(ReportController.getProjectTemplates).toHaveBeenCalled();
                });
                it("AND, the ReportConfigItemViewModel will be init", () => {
                    reportTemplateListViewModel.load();
                    $rootScope.$apply();
                    expect((<jasmine.Spy>ap.viewmodels.reports.ReportConfigItemViewModel.prototype.init).calls.count()).toEqual(2);
                });

                it("AND, the onLoadItems method will be call with the list vm", () => {
                    reportTemplateListViewModel.load();
                    $rootScope.$apply();
                    expect(reportTemplateListViewModel.onLoadItems).toHaveBeenCalled();
                });
                it("AND, the selectEntity method will be call with the first id", () => {
                    reportTemplateListViewModel.load();
                    $rootScope.$apply();
                    expect(reportTemplateListViewModel.selectEntity).toHaveBeenCalledWith("T1");
                });
            });
        });

        describe("WHEN load method is called with isMeetingReport = true", () => {
            let defMeetingTemplateList: angular.IDeferred<ap.models.reports.MeetingReportTemplate[]>;
            let templateList: ap.models.reports.MeetingReportTemplate[];

            beforeEach(() => {
                templateList = [];
                defMeetingTemplateList = $q.defer();

                spyOn(ReportController, "getMeetingTemplates").and.returnValue(defMeetingTemplateList.promise);;
                spyOn(ap.viewmodels.reports.ReportConfigItemViewModel.prototype, "init");

                let template1 = new ap.models.reports.MeetingReportTemplate(Utility);
                template1.createByJson({ Id: "T1" });
                let template2 = new ap.models.reports.MeetingReportTemplate(Utility);
                template2.createByJson({ Id: "T2" });
                templateList.push(template1);
                templateList.push(template2);

                defMeetingTemplateList.resolve(templateList);

                reportTemplateListViewModel = new ap.viewmodels.reports.ReportTemplateListViewModel(Utility, $q, ReportController);

                spyOn(reportTemplateListViewModel, "onLoadItems");
                spyOn(reportTemplateListViewModel, "selectEntity");

            });

            it("THEN, the ReportController.getMeetingTemplates will be called", () => {
                reportTemplateListViewModel.load(undefined, true);
                $rootScope.$apply();
                expect(ReportController.getMeetingTemplates).toHaveBeenCalled();
            });
            it("AND, the ReportConfigItemViewModel will be init", () => {
                reportTemplateListViewModel.load(undefined, true);
                $rootScope.$apply();
                expect((<jasmine.Spy>ap.viewmodels.reports.ReportConfigItemViewModel.prototype.init).calls.count()).toEqual(2);
            });

            it("AND, the onLoadItems method will be call with the list vm", () => {
                reportTemplateListViewModel.load(undefined, true);
                $rootScope.$apply();
                expect(reportTemplateListViewModel.onLoadItems).toHaveBeenCalled();
            });
            it("AND, the selectEntity method will be call with the first id", () => {
                reportTemplateListViewModel.load(undefined, true);
                $rootScope.$apply();
                expect(reportTemplateListViewModel.selectEntity).toHaveBeenCalledWith("T1");
            });
        });
    });
});    