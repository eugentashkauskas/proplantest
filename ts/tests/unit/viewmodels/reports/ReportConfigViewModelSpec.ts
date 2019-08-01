describe("Module ap-viewmodels - reports", () => {
    let nmp = ap.viewmodels.reports;
    let MainController: ap.controllers.MainController, Utility: ap.utility.UtilityHelper, Api: ap.services.apiHelper.Api, UserContext: ap.utility.UserContext, UIStateController: ap.controllers.UIStateController;
    let $controller: angular.IControllerService, $rootScope: angular.IRootScopeService, $scope: angular.IScope, _deferred: angular.IDeferred<ap.services.apiHelper.ApiResponse>,
        $q: angular.IQService, $timeout: angular.ITimeoutService, $compile: angular.ICompileService;

    let reportConfigViewModel: ap.viewmodels.reports.ReportConfigViewModel = null;
    let ReportController: ap.controllers.ReportController;
    let ProjectController: ap.controllers.ProjectController;
    let ContactService: ap.services.ContactService;

    let currentProject: ap.models.projects.Project;
    let projectlogoPath: string = null;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject(function (_$rootScope_, _$q_, _$timeout_, _$compile_, _UserContext_, _Utility_, _Api_, _MainController_, _UIStateController_, _ReportController_, _$controller_, _ProjectController_, _ContactService_) {
        MainController = _MainController_;
        ReportController = _ReportController_;
        UIStateController = _UIStateController_;
        ProjectController = _ProjectController_;
        ContactService = _ContactService_;
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

        currentProject = new ap.models.projects.Project(Utility);
        projectlogoPath = "project_logo.jpg";

        currentProject.createByJson({
            Id: "b360cb6d-ca54-4b93-a564-a469274eb68a",
            Name: "Welcome Project",
            Code: "PR1"
        });        

        spyOn(MainController, "currentProject").and.returnValue(currentProject);
        spyOn(currentProject, "getLogoPath").and.callFake(() => { return projectlogoPath; });
        let deferTitles = $q.defer();
        spyOn(ReportController, "getReportTitleHistory").and.returnValue(deferTitles.promise);
        deferTitles.resolve(["test", "test2"])
        spyOn(Utility.Translator, "getTranslation").and.callFake(function (key) {
            if (key === "app.project_report_template.summaryNoteList")
                return "Summary point list";
            if (key === "app.project_report_template.summaryNoteList")
                return "Summary point list";
            if (key === "app.report.default_send_message")
                return "Hello,\n\nI'd like to share with you my report '{0}' containing {1} points\n\nPlease find the report (and any attachments) at the end of this mail:\n- either displayed as (an) attachment(s), which you can download directly from this mail\n- or displayed as a link (in case the file size was too big), which will give you access to the file(s)\n\nBest regards,\n\n{2}";
            if (key === "Users in charge")
                return "Users in charge";
            if (key === "app.document.uploadfile_fail")
                return "Fail to upload the file {0}";
            if (key === "app.err.general_error")
                return "ERROR";
            return "[" + key + "]";
        });
        
    }));   

    describe("Feature ReportConfigViewModel: init values", () => {
        let projectreportconfig: ap.models.reports.ProjectReportConfig;
        let accessRight: ap.models.accessRights.PointReportAccessRight;

        beforeEach(() => {
            spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake(function (moduleCode) {
                if (moduleCode === "PRINT_ADD_INFO") {
                    return true;
                } else if (moduleCode === "PRINT_LAYOUT") {
                    return true;
                } else {
                    return false;
                }
            });

            projectreportconfig = new ap.models.reports.ProjectReportConfig(Utility);
            projectreportconfig.Code = "NOTELIST";
            projectreportconfig.Name = "List Of Point";

            accessRight = new ap.models.accessRights.PointReportAccessRight(Utility);

            reportConfigViewModel = new ap.viewmodels.reports.ReportConfigViewModel(Utility, MainController, accessRight, ReportController);
        });

        describe("WHEN the VM is created", () => {

            it("THEN, hasAddInfoModule is initialized", () => {
                expect(reportConfigViewModel.hasAddInfoModule).toBeTruthy();
            });

            it("THEN, hasLayoutModule is initialized", () => {
                expect(reportConfigViewModel.hasLayoutModule).toBeTruthy();
            });
        });

        describe("WHEN the ReportConfigViewModel is created", () => {

            beforeEach(() => {
                reportConfigViewModel.init(projectreportconfig);
            });

            it("THEN I expect that code equals my project code", () => {
                expect(reportConfigViewModel.code).toEqual(projectreportconfig.Code);
            });
            it("THEN I expect that name equals my project name", () => {
                expect(reportConfigViewModel.name).toEqual(projectreportconfig.Name);
            });
            it("THEN I expect that title = null", () => {
                expect(reportConfigViewModel.reportTitles.searchText).toBe("");
            });
            it("THEN I expect that language = null", () => {
                expect(reportConfigViewModel.language).toBeNull();
            });
            it("THEN I expect that logo = null", () => {
                expect(reportConfigViewModel.logos).toBeNull();
            });
            it("THEN I expect that noteColumn = null", () => {
                expect(reportConfigViewModel.noteColumn).toBeNull();
            });
            it("THEN I expect that groupsort = null", () => {
                expect(reportConfigViewModel.groupAndSort).toBeNull();
            });
            it("THEN I expect that isSortOptions equals false", () => {
                expect(reportConfigViewModel.isSortOptionsEnabled).toBeFalsy();
            });
            it("THEN I expect that comment author = Name", () => {
                expect(reportConfigViewModel.selectedAuthor).toEqual(ap.models.reports.ReportCommentAuthor.DisplayName);
            });
            it("THEN I expect that planpin = AllNoteDocuments", () => {
                expect(reportConfigViewModel.selectedPreviewPlanPin).toEqual(ap.models.reports.ReportPlanPreview.AllNoteDocuments);
            });
            it("THEN I expect that planDrawing = AllNoteDocuments", () => {
                expect(reportConfigViewModel.selectedPreviewPlanDrawing).toEqual(ap.models.reports.ReportPlanPreview.AllNoteDocuments);
            });
            it("THEN I expect that detailofpoint = WithPictures", () => {
                expect(reportConfigViewModel.selectedDetailOfPoint).toEqual(ap.models.reports.ReportNoteDetail.WithPictures);
            });
            it("THEN I expect that listPoint = WithPictures", () => {
                expect(reportConfigViewModel.selectedListOfPoints).toEqual(ap.models.reports.ReportNoteList.WithPictures);
            });
            it("THEN I expect that hasAddInfo = false", () => {
                expect(reportConfigViewModel.hasAddInfo).toBeFalsy();
            });
            it("THEN I expect that hasAddJoinExcel = false", () => {
                expect(reportConfigViewModel.hasJoinExcel).toBeFalsy();
            });
            it("THEN I expect that hasAuthorInfo = false", () => {
                expect(reportConfigViewModel.hasAuthorInfo).toBeFalsy();
            });
            it("THEN I expect that hasDetailOfPoints = false", () => {
                expect(reportConfigViewModel.hasDetailOfPoints).toBeFalsy();
            });
            it("THEN I expect that hasDisplayCreaDate = false", () => {
                expect(reportConfigViewModel.hasDisplayCreaDate).toBeFalsy();
            });
            it("THEN I expect that hasDisplaySubject = false", () => {
                expect(reportConfigViewModel.hasDisplaySubject).toBeFalsy();
            });
            it("THEN I expect that hasHideDate = false", () => {
                expect(reportConfigViewModel.hasHideDate).toBeFalsy();
            });
            it("THEN I expect that hasIncludeArchivedpoints = false", () => {
                expect(reportConfigViewModel.hasIncludeArchivedpoints).toBeFalsy();
            });
            it("THEN I expect that hasJoinPlan = false", () => {
                expect(reportConfigViewModel.hasJoinPlan).toBeFalsy();
            });
            it("THEN I expect that hasListOfPoints = false", () => {
                expect(reportConfigViewModel.hasListOfPoints).toBeFalsy();
            });
            it("THEN I expect that hasOnePointPage = false", () => {
                expect(reportConfigViewModel.hasOnePointPage).toBeFalsy();
            });
            it("THEN I expect that hasPlanPreviewDrawing = false", () => {
                expect(reportConfigViewModel.hasPlanPreviewDrawing).toBeFalsy();
            });
            it("THEN I expect that hasPlanPreviewPin = false", () => {
                expect(reportConfigViewModel.hasPlanPreviewPin).toBeFalsy();
            });
            it("THEN I expect that hasPrintPicture = false", () => {
                expect(reportConfigViewModel.hasPrintPicture).toBeFalsy();
            });
            it("THEN I expect that isIndividualReport = false", () => {
                expect(reportConfigViewModel.isIndividualReport).toBeFalsy();
            });
            it("THEN I expect that hasCover = false", () => {
                expect(reportConfigViewModel.hasCover).toBeFalsy();
            });
            it("THEN I expect that coverPdfPath = empty", () => {
                expect(reportConfigViewModel.coverPdfPath).toBe("");
            });
            it("THEN I expect that isCoverUploaded = false", () => {
                expect(reportConfigViewModel.isCoverUploaded).toBeFalsy();
            });            
        });
    });

    describe("Feature: sort options", () => {
        let hasSortOptions: boolean;
        let projectreportconfig: ap.models.reports.ProjectReportConfig;

        beforeEach(() => {
            hasSortOptions = false;
            projectreportconfig = new ap.models.reports.ProjectReportConfig(Utility);
            projectreportconfig.Code = "NOTELIST";
            projectreportconfig.Name = "List Of Point";            
            specHelper.general.spyProperty(ap.models.accessRights.PointReportAccessRight.prototype, "hasSortOptions", specHelper.PropertyAccessor.Get).and.callFake(() => {
                return hasSortOptions;
            });
        });
        afterEach(() => {
            specHelper.general.offSpyProperty(ap.models.accessRights.PointReportAccessRight.prototype, "hasSortOptions", specHelper.PropertyAccessor.Get);
        });
        describe("WHEN the viewModel is build has the user has not the rigth to see Sort section", () => {
            beforeEach(() => {
                reportConfigViewModel = new ap.viewmodels.reports.ReportConfigViewModel(Utility, MainController, new ap.models.accessRights.PointReportAccessRight(Utility), ReportController);
                reportConfigViewModel.init(projectreportconfig);
            });
            it("THEN, the hasSortOptions equals false", () => {
                expect(reportConfigViewModel.hasSortOptions).toBeFalsy();
            });
            it("THEN, the isSortOptionsEnabled equals false", () => {
                expect(reportConfigViewModel.isSortOptionsEnabled).toBeFalsy();
            });
        });
        describe("WHEN the viewModel is build has the user has the rigth to see Sort section", () => {
            beforeEach(() => {
                hasSortOptions = true;
                reportConfigViewModel = new ap.viewmodels.reports.ReportConfigViewModel(Utility, MainController, new ap.models.accessRights.PointReportAccessRight(Utility), ReportController);
                reportConfigViewModel.init(projectreportconfig);
            });
            it("THEN, the hasSortOptions equals false", () => {
                expect(reportConfigViewModel.hasSortOptions).toBeTruthy();
            });
        });
        describe("WHEN the viewModel has NoteList and NoteDetail to None", () => {
            beforeEach(() => {
                hasSortOptions = true;
                projectreportconfig.NoteList = ap.models.reports.ReportNoteList.None;
                projectreportconfig.NotesDetail = ap.models.reports.ReportNoteDetail.None;
                reportConfigViewModel = new ap.viewmodels.reports.ReportConfigViewModel(Utility, MainController, new ap.models.accessRights.PointReportAccessRight(Utility), ReportController);
                reportConfigViewModel.init(projectreportconfig);
            });
            it("THEN, the isSortOptionsEnabled equals false", () => {
                expect(reportConfigViewModel.isSortOptionsEnabled).toBeFalsy();
            });
        });
        describe("WHEN the viewModel has only NoteDetail to None", () => {
            beforeEach(() => {
                hasSortOptions = true;
                projectreportconfig.NoteList = ap.models.reports.ReportNoteList.None;
                projectreportconfig.NotesDetail = ap.models.reports.ReportNoteDetail.WithDocs;
                reportConfigViewModel = new ap.viewmodels.reports.ReportConfigViewModel(Utility, MainController, new ap.models.accessRights.PointReportAccessRight(Utility), ReportController);
                reportConfigViewModel.init(projectreportconfig);
            });
            it("THEN, the isSortOptionsEnabled equals true", () => {
                expect(reportConfigViewModel.isSortOptionsEnabled).toBeTruthy();
            });
        });
        describe("WHEN the viewModel has only NoteList equals to None", () => {
            beforeEach(() => {
                hasSortOptions = true;
                projectreportconfig.NoteList = ap.models.reports.ReportNoteList.Simple;
                projectreportconfig.NotesDetail = ap.models.reports.ReportNoteDetail.None;
                reportConfigViewModel = new ap.viewmodels.reports.ReportConfigViewModel(Utility, MainController, new ap.models.accessRights.PointReportAccessRight(Utility), ReportController);
                reportConfigViewModel.init(projectreportconfig);
            });
            it("THEN, the isSortOptionsEnabled equals true", () => {
                expect(reportConfigViewModel.isSortOptionsEnabled).toBeTruthy();
            });
        });
        describe("WHEN the viewModel has NoteList and NoteDetail different of None", () => {
            beforeEach(() => {
                hasSortOptions = true;
                projectreportconfig.NoteList = ap.models.reports.ReportNoteList.WithDocs;
                projectreportconfig.NotesDetail = ap.models.reports.ReportNoteDetail.WithoutDocs;
                reportConfigViewModel = new ap.viewmodels.reports.ReportConfigViewModel(Utility, MainController, new ap.models.accessRights.PointReportAccessRight(Utility), ReportController);
                reportConfigViewModel.init(projectreportconfig);
            });
            it("THEN, the isSortOptionsEnabled equals True", () => {
                expect(reportConfigViewModel.isSortOptionsEnabled).toBeTruthy();
            });
        });
    });

    describe("Feature ReportConfigViewModel: Receive values", () => {
        describe("WHEN the view model Post change", () => {
            let projectreportconfig: ap.models.reports.ProjectReportConfig;
            let language: ap.models.identFiles.Language;
            let columnsViewModel: ap.viewmodels.reports.ColumnsViewModel;
            let subjectColumn: ap.viewmodels.reports.ReportColumnViewModel;
            let roomColumn: ap.viewmodels.reports.ReportColumnViewModel;
            let columns: ap.viewmodels.reports.ReportColumnViewModel[];
            let subjectColumDef: ap.models.reports.ReportColumnDefNote;
            let roomColumDef: ap.models.reports.ReportColumnDefNote;
            let groupAndSortViewModel: ap.viewmodels.reports.GroupAndSortViewModel;
            let subjectItem: ap.viewmodels.reports.GroupAndSortItemViewModel;
            let roomItem: ap.viewmodels.reports.GroupAndSortItemViewModel;
            let reportLogo: ap.models.reports.ReportLogo;
            let reportLogoViewModel: ap.viewmodels.reports.ReportLogoViewModel;
            let accessRight: ap.models.accessRights.PointReportAccessRight;

            beforeEach(() => {
                specHelper.general.spyProperty(ap.models.accessRights.PointReportAccessRight.prototype, "hasSortOptions", specHelper.PropertyAccessor.Get).and.callFake(() => {
                    return true;
                });
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake(function (moduleCode) {
                    if (moduleCode === ap.models.licensing.Module.Module_PrintColumns)
                        return true;
                    else
                        return false;
                });

                projectreportconfig = new ap.models.reports.ProjectReportConfig(Utility);
                projectreportconfig.Code = "NOTELIST";
                projectreportconfig.Name = "List Of Point";
                projectreportconfig.GroupAndSorts = [];
                projectreportconfig.NoteList = ap.models.reports.ReportNoteList.Simple;

                accessRight = new ap.models.accessRights.PointReportAccessRight(Utility);
                reportConfigViewModel = new ap.viewmodels.reports.ReportConfigViewModel(Utility, MainController, accessRight, ReportController);
                reportConfigViewModel.init(projectreportconfig);

                reportConfigViewModel.code = "New code";
                reportConfigViewModel.name = "New name";
                reportConfigViewModel.reportTitles.searchText = "List of point";

                language = new ap.models.identFiles.Language(Utility);
                language.Code = "en";
                language.TranslationCode = "EN";
                reportConfigViewModel.language = language;

                reportConfigViewModel.isIndividualReport = true;

                columnsViewModel = new ap.viewmodels.reports.ColumnsViewModel(Utility, null, null);
                subjectColumn = new ap.viewmodels.reports.ReportColumnViewModel(Utility);

                subjectColumn.propertyName = "Subject";
                subjectColumn.displayOrder = 1;
                subjectColumn.isChecked = true;

                roomColumn = new ap.viewmodels.reports.ReportColumnViewModel(Utility);
                roomColumn.propertyName = "Room";
                roomColumn.displayOrder = 2;
                roomColumn.isChecked = true;

                columns = [subjectColumn, roomColumn];
                columnsViewModel.columnsAvailable = columns;
                reportConfigViewModel.noteColumn = columnsViewModel;
                
                subjectColumDef = new ap.models.reports.ReportColumnDefNote(Utility);
                subjectColumDef.PropertyName = "Subject";
                subjectColumDef.CanUseGroupBy = true;
                subjectColumDef.CanUseSort = true;
                subjectColumDef.IsVisible = true;

                roomColumDef = new ap.models.reports.ReportColumnDefNote(Utility);
                roomColumDef.PropertyName = "Room";
                roomColumDef.CanUseGroupBy = false;
                roomColumDef.CanUseSort = true;
                roomColumDef.IsVisible = true;

                groupAndSortViewModel = new ap.viewmodels.reports.GroupAndSortViewModel(Utility, [subjectColumDef, roomColumDef]);
                subjectItem = new ap.viewmodels.reports.GroupAndSortItemViewModel(Utility);

                subjectItem.columnDefNote = subjectColumDef;
                subjectItem.isAscending = true;
                roomItem = new ap.viewmodels.reports.GroupAndSortItemViewModel(Utility);

                roomItem.columnDefNote = roomColumDef;
                roomItem.isAscending = false;
                groupAndSortViewModel.groupAndSortItems = [subjectItem, roomItem];

                reportConfigViewModel.groupAndSort = groupAndSortViewModel;

                reportLogo = new ap.models.reports.ReportLogo(Utility);
                reportLogo.IsAllPages = true;
                reportLogo.Type = ap.models.reports.ReportLogoType.Project;
                reportLogo.Position = ap.models.reports.ReportLogoPosition.Middle;
                reportLogoViewModel = new ap.viewmodels.reports.ReportLogoViewModel(Utility, MainController, projectreportconfig.Id);
                reportLogoViewModel.init(reportLogo);

                reportConfigViewModel.logos = [reportLogoViewModel];

                reportConfigViewModel.hasCover = true;
                reportConfigViewModel.coverPdfPath = "testcover.pdf";

                reportConfigViewModel.hasDisplaySubject = true;

                reportConfigViewModel.postChanges();
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.models.accessRights.PointReportAccessRight.prototype, "hasSortOptions", specHelper.PropertyAccessor.Get);
            });
            describe("WHEN the view model Post change The Entity must update with VM values", () => {
                it("THEN the code = 'New code'", () => {
                    expect(reportConfigViewModel.code).toEqual("New code");
                });
                it("THEN the name = 'New name'", () => {
                    expect(reportConfigViewModel.name).toEqual("New name");
                });
                it("THEN I expect that title = 'List of point'", () => {
                    expect(reportConfigViewModel.reportTitles.searchText).toEqual("List of point");
                });
                it("THEN I expect that language = en", () => {
                    expect(reportConfigViewModel.language.Code).toEqual("en");
                });
                it("THEN I expect that reportconfig.IsIndividualReport = true", () => {
                    expect(reportConfigViewModel.reportconfig.IsIndividualReport).toBeTruthy();
                });
                it("THEN I expect that logo.length = 1", () => {
                    expect(reportConfigViewModel.logos.length).toEqual(1);
                });
                it("THEN I expect that noteColumn.length = 2", () => {
                    expect(reportConfigViewModel.noteColumn.columnsAvailable.length).toEqual(2);
                });
                it("THEN I expect that groupsort. length = 2", () => {
                    expect(reportConfigViewModel.groupAndSort.groupAndSortItems.length).toEqual(2);
                });
                it("AND THEN first group item is Subject", () => {
                    expect(reportConfigViewModel.reportconfig.GroupAndSorts[0].PropertyName).toEqual("Subject");
                });
                it("AND THEN first group item is asc", () => {
                    expect(reportConfigViewModel.reportconfig.GroupAndSorts[0].IsAscending).toBeTruthy();
                });
                it("AND THEN first group item have display order 0", () => {
                    expect(reportConfigViewModel.reportconfig.GroupAndSorts[0].DisplayOrder).toEqual(0);
                });
                it("AND THEN second sort item is Room", () => {
                    expect(reportConfigViewModel.reportconfig.GroupAndSorts[1].PropertyName).toEqual("Room");
                });
                it("AND THEN second sort item is desc", () => {
                    expect(reportConfigViewModel.reportconfig.GroupAndSorts[1].IsAscending).toBeFalsy();
                });
                it("AND THEN second sort item have display order 1", () => {
                    expect(reportConfigViewModel.reportconfig.GroupAndSorts[1].DisplayOrder).toEqual(1);
                });
                it("AND THEN there are 2 logo to print", () => {
                    expect(reportConfigViewModel.logos.length).toEqual(1);
                });
                it("AND THEN i expect that CoverPdfPath will update", () => {
                    expect(reportConfigViewModel.reportconfig.CoverPdfPath).toEqual("testcover.pdf");
                });
                it("AND THEN 2 note columns saved in to config", () => {
                    expect(reportConfigViewModel.reportconfig.NotesColumns.length).toEqual(2);
                });
                it("AND THEN note column 1 is Subject", () => {
                    expect(reportConfigViewModel.reportconfig.NotesColumns[0].PropertyName).toEqual("Subject");
                });
                it("AND THEN note column 1 display order = 0", () => {
                    expect(reportConfigViewModel.reportconfig.NotesColumns[0].DisplayOrder).toEqual(0);
                });
                it("AND THEN note column 2 is Room", () => {
                    expect(reportConfigViewModel.reportconfig.NotesColumns[1].PropertyName).toEqual("Room");
                });
                it("AND THEN note column 2 display order = 1", () => {
                    expect(reportConfigViewModel.reportconfig.NotesColumns[1].DisplayOrder).toEqual(1);
                });
                it("AND THEN i expect that isCoverUploaded = true", () => {
                    expect(reportConfigViewModel.isCoverUploaded).toBeTruthy();
                });
            });

            describe("WHEN the view model Post change second time after changing the group and sort and set hasCover = false", () => {               
                beforeEach(() => {
                    
                    projectreportconfig = new ap.models.reports.ProjectReportConfig(Utility);
                    projectreportconfig.Code = "XXX";
                    projectreportconfig.GroupAndSorts = [];
                    projectreportconfig.NoteList = ap.models.reports.ReportNoteList.Simple;

                    let accessRight = new ap.models.accessRights.PointReportAccessRight(Utility);
                    reportConfigViewModel = new ap.viewmodels.reports.ReportConfigViewModel(Utility, MainController, accessRight, ReportController);
                    reportConfigViewModel.init(projectreportconfig);

                    let subjectColumDef = new ap.models.reports.ReportColumnDefNote(Utility);
                    subjectColumDef.PropertyName = "Subject";
                    subjectColumDef.CanUseGroupBy = true;
                    subjectColumDef.CanUseSort = true;
                    subjectColumDef.IsVisible = true;

                    let roomColumDef = new ap.models.reports.ReportColumnDefNote(Utility);
                    roomColumDef.PropertyName = "Room";
                    roomColumDef.CanUseGroupBy = true;
                    roomColumDef.CanUseSort = true;
                    roomColumDef.IsVisible = true;

                    let issueColumDef = new ap.models.reports.ReportColumnDefNote(Utility);
                    issueColumDef.PropertyName = "IssueType";
                    issueColumDef.CanUseGroupBy = true;
                    issueColumDef.CanUseSort = true;
                    issueColumDef.IsVisible = true;

                    let noneColumDef = new ap.models.reports.ReportColumnDefNote(Utility);
                    noneColumDef.PropertyName = "None";

                    let groupAndSortViewModel = new ap.viewmodels.reports.GroupAndSortViewModel(Utility, [subjectColumDef, roomColumDef, issueColumDef]);

                    let subjectItem = new ap.viewmodels.reports.GroupAndSortItemViewModel(Utility);
                    subjectItem.columnDefNote = subjectColumDef;
                    subjectItem.isAscending = true;

                    let roomItem = new ap.viewmodels.reports.GroupAndSortItemViewModel(Utility);
                    roomItem.columnDefNote = roomColumDef;
                    roomItem.isAscending = true;

                    let issueItem = new ap.viewmodels.reports.GroupAndSortItemViewModel(Utility);
                    issueItem.columnDefNote = issueColumDef;
                    issueItem.isAscending = true;

                    groupAndSortViewModel.groupAndSortItems = [subjectItem, roomItem, issueItem];
                    reportConfigViewModel.groupAndSort = groupAndSortViewModel;

                    reportConfigViewModel.postChanges();

                    let noneItem = new ap.viewmodels.reports.GroupAndSortItemViewModel(Utility);
                    noneItem.columnDefNote = noneColumDef;

                    groupAndSortViewModel.groupAndSortItems = [subjectItem, noneItem, roomItem];

                    reportConfigViewModel.hasCover = false;

                    reportConfigViewModel.postChanges();
                });

                it("THEN, there is 2 items in sorts", () => { expect(reportConfigViewModel.reportconfig.GroupAndSorts.length).toEqual(2); });
                it("THEN, the first item in sorts is Subject", () => { expect(reportConfigViewModel.reportconfig.GroupAndSorts[0].PropertyName).toEqual("Subject"); });
                it("THEN, the second item in sorts is Room", () => { expect(reportConfigViewModel.reportconfig.GroupAndSorts[1].PropertyName).toEqual("Room"); });
                it("THEN, the CoverPdfPath is empty", () => { expect(reportConfigViewModel.reportconfig.CoverPdfPath).toEqual(""); });
            });
        });
        describe("Feature get enum liste", () => {
            beforeEach(() => {
                reportConfigViewModel = new ap.viewmodels.reports.ReportConfigViewModel(Utility, MainController, null, ReportController);
            });
            describe("When the methode reportCommentAuthorDisplay is called with display name", () => {
                let result: string = "";
                beforeEach(() => {
                    result = reportConfigViewModel.reportCommentAuthorDisplay(ap.models.reports.ReportCommentAuthor.DisplayName)
                });
                it("THEN the we get the translation of the correspond enum", () => {
                    expect(result).toEqual("[reportmodels.ReportCommentAuthor.displayname]");
                });
            });
            describe("When the methode reportCommentAuthorDisplay is called with company", () => {
                let result: string = "";
                beforeEach(() => {
                    result = reportConfigViewModel.reportCommentAuthorDisplay(ap.models.reports.ReportCommentAuthor.Company)
                });
                it("THEN the we get the translation of the correspond enum", () => {
                    expect(result).toEqual("[reportmodels.ReportCommentAuthor.company]");
                });
            });
            describe("When the methode reportCommentAuthorDisplay is called with role", () => {
                let result: string = "";
                beforeEach(() => {
                    result = reportConfigViewModel.reportCommentAuthorDisplay(ap.models.reports.ReportCommentAuthor.Role)
                });
                it("THEN the we get the translation of the correspond enum", () => {
                    expect(result).toEqual("[reportmodels.ReportCommentAuthor.role]");
                });
            });

            describe("When the methode reportNoteListDisplay is called with Simple", () => {
                let result: string = "";
                beforeEach(() => {
                    result = reportConfigViewModel.reportNoteListDisplay(ap.models.reports.ReportNoteList.Simple)
                });
                it("THEN the we get the translation of the correspond enum", () => {
                    expect(result).toEqual("[reportmodels.ReportNoteList.simple]");
                });
            });
            describe("When the methode reportNoteListDisplay is called with withdocs", () => {
                let result: string = "";
                beforeEach(() => {
                    result = reportConfigViewModel.reportNoteListDisplay(ap.models.reports.ReportNoteList.WithDocs)
                });
                it("THEN the we get the translation of the correspond enum", () => {
                    expect(result).toEqual("[reportmodels.ReportNoteList.withdocs]");
                });
            });
            describe("When the methode reportNoteListDisplay is called with withdocsandlocalizations", () => {
                let result: string = "";
                beforeEach(() => {
                    result = reportConfigViewModel.reportNoteListDisplay(ap.models.reports.ReportNoteList.WithDocsAndLocalizations)
                });
                it("THEN the we get the translation of the correspond enum", () => {
                    expect(result).toEqual("[reportmodels.ReportNoteList.withdocsandlocalizations]");
                });
            });
            describe("When the methode reportNoteListDisplay is called with Withpictures", () => {
                let result: string = "";
                beforeEach(() => {
                    result = reportConfigViewModel.reportNoteListDisplay(ap.models.reports.ReportNoteList.WithPictures)
                });
                it("THEN the we get the translation of the correspond enum", () => {
                    expect(result).toEqual("[reportmodels.ReportNoteList.withpictures]");
                });
            });

            describe("When the methode reportPlanPreviewDisplay is called with AllNoteDocuments", () => {
                let result: string = "";
                beforeEach(() => {
                    result = reportConfigViewModel.reportPlanPreviewDisplay(ap.models.reports.ReportPlanPreview.AllNoteDocuments)
                });
                it("THEN the we get the translation of the correspond enum", () => {
                    expect(result).toEqual("[reportmodels.ReportPlanPreview.allnotedocuments]");
                });
            });
            describe("When the methode reportPlanPreviewDisplay is called with MeetingDocuments", () => {
                let result: string = "";
                beforeEach(() => {
                    result = reportConfigViewModel.reportPlanPreviewDisplay(ap.models.reports.ReportPlanPreview.MeetingDocuments)
                });
                it("THEN the we get the translation of the correspond enum", () => {
                    expect(result).toEqual("[reportmodels.ReportPlanPreview.meetingdocuments]");
                });
            });

            describe("When the methode reportNoteDetailDisplay is called with WithDocs", () => {
                let result: string = "";
                beforeEach(() => {
                    result = reportConfigViewModel.reportNoteDetailDisplay(ap.models.reports.ReportNoteDetail.WithDocs)
                });
                it("THEN the we get the translation of the correspond enum", () => {
                    expect(result).toEqual("[reportmodels.ReportNoteDetail.withdocs]");
                });
            });
            describe("When the methode reportNoteDetailDisplay is called with WithDocsAndLocalization", () => {
                let result: string = "";
                beforeEach(() => {
                    result = reportConfigViewModel.reportNoteDetailDisplay(ap.models.reports.ReportNoteDetail.WithDocsAndLocalization)
                });
                it("THEN the we get the translation of the correspond enum", () => {
                    expect(result).toEqual("[reportmodels.ReportNoteDetail.withdocsandlocalization]");
                });
            });
            describe("When the methode reportNoteDetailDisplay is called with WithoutDocs", () => {
                let result: string = "";
                beforeEach(() => {
                    result = reportConfigViewModel.reportNoteDetailDisplay(ap.models.reports.ReportNoteDetail.WithoutDocs)
                });
                it("THEN the we get the translation of the correspond enum", () => {
                    expect(result).toEqual("[reportmodels.ReportNoteDetail.withoutdocs]");
                });
            });
            describe("When the methode reportNoteDetailDisplay is called with WithPictures", () => {
                let result: string = "";
                beforeEach(() => {
                    result = reportConfigViewModel.reportNoteDetailDisplay(ap.models.reports.ReportNoteDetail.WithPictures)
                });
                it("THEN the we get the translation of the correspond enum", () => {
                    expect(result).toEqual("[reportmodels.ReportNoteDetail.withpictures]");
                });
            });
        });
        describe("Feature setTemplate", () => {

            describe("WHEN setTemplate is called with an invalid object", () => {
                it("THEN an error is thrown", () => {
                    reportConfigViewModel = new ap.viewmodels.reports.ReportConfigViewModel(Utility, MainController, new ap.models.accessRights.PointReportAccessRight(Utility), ReportController);
                    expect(() => {
                        reportConfigViewModel.setTemplate(<any>new Point());
                    }).toThrow(new Error("Invalid report template"));
                });
            });

            describe("WHEN the setTemplate method is called with the ProjectReportTemplate", () => {
                let projectReportTemplate: ap.models.reports.ProjectReportTemplate;
                beforeEach(() => {
                    projectReportTemplate = new ap.models.reports.ProjectReportTemplate(Utility);
                    projectReportTemplate.Code = "summaryNoteList";
                    projectReportTemplate.IsSystem = true;

                    let accessRight = new ap.models.accessRights.PointReportAccessRight(Utility);
                    reportConfigViewModel = new ap.viewmodels.reports.ReportConfigViewModel(Utility, MainController, accessRight, ReportController);
                    reportConfigViewModel.selectedAuthor = ap.models.reports.ReportCommentAuthor.Company;
                    reportConfigViewModel.selectedPreviewPlanPin = ap.models.reports.ReportPlanPreview.AllNoteDocuments;
                    reportConfigViewModel.selectedPreviewPlanDrawing = ap.models.reports.ReportPlanPreview.MeetingDocuments;
                    reportConfigViewModel.selectedDetailOfPoint = ap.models.reports.ReportNoteDetail.WithDocs
                    reportConfigViewModel.selectedListOfPoints = ap.models.reports.ReportNoteList.Simple;
                    reportConfigViewModel.hasAddInfo = true;
                    reportConfigViewModel.hasJoinExcel = true;
                    reportConfigViewModel.hasAuthorInfo = true;
                    reportConfigViewModel.hasDetailOfPoints = true;
                    reportConfigViewModel.hasDisplayCreaDate = true;
                    reportConfigViewModel.hasDisplaySubject = true;
                    reportConfigViewModel.hasHideDate = true;
                    reportConfigViewModel.hasIncludeArchivedpoints = true;
                    reportConfigViewModel.hasJoinPlan = true;
                    reportConfigViewModel.hasListOfPoints = true;
                    reportConfigViewModel.hasOnePointPage = true;
                    reportConfigViewModel.hasPlanPreviewDrawing = true;
                    reportConfigViewModel.hasPlanPreviewPin = true;
                    reportConfigViewModel.hasPrintPicture = true;
                });
                it("THEN I expect that planpin = AllNoteDocuments", () => {
                    expect(reportConfigViewModel.selectedPreviewPlanPin).toEqual(ap.models.reports.ReportPlanPreview.AllNoteDocuments);
                });
                it("THEN I expect that planDrawing = MeetingDocuments", () => {
                    expect(reportConfigViewModel.selectedPreviewPlanDrawing).toEqual(ap.models.reports.ReportPlanPreview.MeetingDocuments);
                });
                it("THEN I expect that detailofpoint = WithDocs", () => {
                    expect(reportConfigViewModel.selectedDetailOfPoint).toEqual(ap.models.reports.ReportNoteDetail.WithDocs);
                });
                it("THEN I expect that planDrawing = Simple", () => {
                    expect(reportConfigViewModel.selectedListOfPoints).toEqual(ap.models.reports.ReportNoteList.Simple);
                });
                it("THEN I expect that comment author = Company", () => {
                    expect(reportConfigViewModel.selectedAuthor).toEqual(ap.models.reports.ReportCommentAuthor.Company);
                });
                it("THEN I expect that hasAddInfo = true", () => {
                    expect(reportConfigViewModel.hasAddInfo).toBeTruthy();
                });
                it("THEN I expect that hasAddJoinExcel = true", () => {
                    expect(reportConfigViewModel.hasJoinExcel).toBeTruthy();
                });
                it("THEN I expect that hasAuthorInfo = true", () => {
                    expect(reportConfigViewModel.hasAuthorInfo).toBeTruthy();
                });
                it("THEN I expect that hasDetailOfPoints = true", () => {
                    expect(reportConfigViewModel.hasDetailOfPoints).toBeTruthy();
                });
                it("THEN I expect that hasDisplayCreaDate = true", () => {
                    expect(reportConfigViewModel.hasDisplayCreaDate).toBeTruthy();
                });
                it("THEN I expect that hasDisplaySubject = true", () => {
                    expect(reportConfigViewModel.hasDisplaySubject).toBeTruthy();
                });
                it("THEN I expect that hasHideDate = true", () => {
                    expect(reportConfigViewModel.hasHideDate).toBeTruthy();
                });
                it("THEN I expect that hasIncludeArchivedpoints = true", () => {
                    expect(reportConfigViewModel.hasIncludeArchivedpoints).toBeTruthy();
                });
                it("THEN I expect that hasJoinPlan = true", () => {
                    expect(reportConfigViewModel.hasJoinPlan).toBeTruthy();
                });
                it("THEN I expect that hasListOfPoints = true", () => {
                    expect(reportConfigViewModel.hasListOfPoints).toBeTruthy();
                });
                it("THEN I expect that hasOnePointPage = true", () => {
                    expect(reportConfigViewModel.hasOnePointPage).toBeTruthy();
                });
                it("THEN I expect that hasPlanPreviewDrawing = true", () => {
                    expect(reportConfigViewModel.hasPlanPreviewDrawing).toBeTruthy();
                });
                it("THEN I expect that hasPlanPreviewPin = true", () => {
                    expect(reportConfigViewModel.hasPlanPreviewPin).toBeTruthy();
                });
                it("THEN I expect that hasPrintPicture = true", () => {
                    expect(reportConfigViewModel.hasPrintPicture).toBeTruthy();
                });
            });

            describe("When the set a template with notes columns", () => {
                let projectReportTemplate: ap.models.reports.ProjectReportTemplate;                
                beforeEach(() => {
                    projectReportTemplate = new ap.models.reports.ProjectReportTemplate(Utility);
                    let col1 = new ap.models.reports.ReportNoteColumn(Utility);
                    col1.PropertyName = "Col1";
                    let col2 = new ap.models.reports.ReportNoteColumn(Utility);
                    col2.PropertyName = "Col2";

                    projectReportTemplate.NotesColumns = [col1, col2];

                    let def_col1 = new ap.models.reports.ReportColumnDefNote(Utility);
                    def_col1.PropertyName = "Col1";
                    def_col1.CanHideCol = true;
                    def_col1.IsVisible = true;
                    let def_col2 = new ap.models.reports.ReportColumnDefNote(Utility);
                    def_col2.PropertyName = "Col2";
                    def_col2.CanHideCol = true;
                    def_col2.IsVisible = true;
                    let def_col3 = new ap.models.reports.ReportColumnDefNote(Utility);
                    def_col3.PropertyName = "Col3";
                    def_col3.CanHideCol = true;
                    def_col3.IsVisible = true;

                    let def = $q.defer();
                    let copyConfigDef = $q.defer();                    

                    spyOn(ReportController, "copyReportTemplateFiles").and.returnValue(copyConfigDef.promise);
                    spyOn(ReportController, "getReportColumnDefNote").and.returnValue(def.promise);
                    spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake(function (moduleCode) {
                        if (moduleCode === ap.models.licensing.Module.Module_PrintColumns)
                            return true;
                        else
                            return false;
                    });

                    let accessRight = new ap.models.accessRights.PointReportAccessRight(Utility);
                    reportConfigViewModel = new ap.viewmodels.reports.ReportConfigViewModel(Utility, MainController, accessRight, ReportController);
                    reportConfigViewModel.setTemplate(projectReportTemplate);

                    def.resolve([def_col1, def_col2, def_col3]);
                    copyConfigDef.resolve("1");

                    $rootScope.$apply();
                });
                it("THEN, the ReportController.copyReportTemplateFiles method wil be called", () => {
                    expect(ReportController.copyReportTemplateFiles).toHaveBeenCalled();
                });
                it("THEN, the ReportController.getReportColumnDefNote method wil be called", () => {
                    expect(ReportController.getReportColumnDefNote).toHaveBeenCalled();
                });
                it("THEN, there are 3 notecolumn init", () => {
                    expect(reportConfigViewModel.noteColumn.columnsAvailable.length).toEqual(3);
                });
                it("THEN, there are notecolumn 1 is checked", () => {
                    expect(reportConfigViewModel.noteColumn.columnsAvailable[0].isChecked).toBeTruthy();
                });
                it("THEN, there are notecolumn 1 is Col1", () => {
                    expect(reportConfigViewModel.noteColumn.columnsAvailable[0].propertyName).toBe("Col1");
                });
                it("THEN, there are notecolumn 2 is checked", () => {
                    expect(reportConfigViewModel.noteColumn.columnsAvailable[1].isChecked).toBeTruthy();
                });
                it("THEN, there are notecolumn 2 is Col2", () => {
                    expect(reportConfigViewModel.noteColumn.columnsAvailable[1].propertyName).toBe("Col2");
                });
                it("THEN, there are notecolumn 3 is NOT  checked", () => {
                    expect(reportConfigViewModel.noteColumn.columnsAvailable[2].isChecked).toBeFalsy();
                });
                it("THEN, there are notecolumn 3 is Col3", () => {
                    expect(reportConfigViewModel.noteColumn.columnsAvailable[2].propertyName).toBe("Col3");
                });
            });
        });
        describe("Feature setTemplate", () => {

            let originanCopyFrom = ap.models.reports.ReportConfigBase.prototype.copyFrom;

            describe("WHEN the setTemplate method is called", () => {
                let projectReportTemplate: ap.models.reports.ProjectReportTemplate;
                beforeEach(() => {

                    projectReportTemplate = new ap.models.reports.ProjectReportTemplate(Utility);
                    projectReportTemplate.Code = "summaryNoteList";
                    projectReportTemplate.IsSystem = true;

                    spyOn(ap.models.reports.ReportConfigBase.prototype, "copyFrom");

                    let accessRight = new ap.models.accessRights.PointReportAccessRight(Utility);
                    reportConfigViewModel = new ap.viewmodels.reports.ReportConfigViewModel(Utility, MainController, accessRight, ReportController);

                    let copyConfigDef = $q.defer();
                    spyOn(ReportController, "copyReportTemplateFiles").and.returnValue(copyConfigDef.promise); 
                    copyConfigDef.resolve("1");

                    let def = $q.defer();
                    spyOn(ReportController, "getReportColumnDefNote").and.returnValue(def.promise);
                    def.resolve([]);

                });

                afterEach(() => {
                    ap.models.reports.ReportConfigBase.prototype.copyFrom = originanCopyFrom;
                });

                it("THEN, the copyFrom method wil be called", () => {
                    reportConfigViewModel.setTemplate(projectReportTemplate);
                    $rootScope.$apply();
                    expect(ap.models.reports.ReportConfigBase.prototype.copyFrom).toHaveBeenCalledWith(projectReportTemplate);
                });
                it("AND, the vm will init with the ProjectReportConfig entity", () => {
                    reportConfigViewModel.setTemplate(projectReportTemplate);
                    $rootScope.$apply();
                    expect(reportConfigViewModel.reportconfig.EntityDiscriminator).toEqual("ProjectReportConfig");
                });
                it("AND, the title will equa to ProjectCode + ' - ' + Tranlatio of the Template code", () => {
                    reportConfigViewModel.setTemplate(projectReportTemplate);
                    $rootScope.$apply();
                    expect(reportConfigViewModel.reportTitles.searchText).toEqual("PR1" + " - " + "Summary point list");
                });
                it("OR, the title will equa to ProjectCode + ' - ' + Template.Name if the template is not system", () => {
                    projectReportTemplate.IsSystem = false;
                    projectReportTemplate.Name = "Template Name";
                    reportConfigViewModel.setTemplate(projectReportTemplate);
                    $rootScope.$apply();
                    expect(reportConfigViewModel.reportTitles.searchText).toEqual("PR1" + " - " + "Template Name");
                });
            });
        });
    });
    
    describe("Feature initSendReportViewModel", () => {
        let sendReportViewModel: ap.viewmodels.reports.SendReportViewModel;
        beforeEach(() => {

            sendReportViewModel = new ap.viewmodels.reports.SendReportViewModel(Utility, Api, $q, ProjectController, ReportController, MainController, ContactService);

            spyOn(sendReportViewModel.recipientsSelector, "initUsers").and.callThrough();
            spyOn(sendReportViewModel.recipientsSelector, "addItem").and.callThrough();

            let accessRight = new ap.models.accessRights.PointReportAccessRight(Utility);
            reportConfigViewModel = new ap.viewmodels.reports.ReportConfigViewModel(Utility, MainController, accessRight, ReportController);
            reportConfigViewModel.reportTitles.searchText = "Test send report";
            reportConfigViewModel.hasJoinExcel = true;

        });
        describe("WHEN initSendReportViewModel is called and the vm.isIndividualReport = false", () => {
            beforeEach(() => {
                reportConfigViewModel.isIndividualReport = false;
                reportConfigViewModel.initSendReportViewModel(sendReportViewModel, ["C1", "C2"], false);
            });
            it("THEN, the sendReportViewModel will be updated by values of the vm", () => {
                expect(sendReportViewModel.subject).toEqual("Test send report");
                expect(sendReportViewModel.pdfName).toEqual("Test send report.pdf");
                expect(sendReportViewModel.hasExcelAttachment).toBeTruthy();
                expect(sendReportViewModel.excelName).toEqual("Test send report.xlsx");
                expect(sendReportViewModel.body).toEqual("Hello,\n\nI'd like to share with you my report 'Test send report' containing 2 points\n\nPlease find the report (and any attachments) at the end of this mail:\n- either displayed as (an) attachment(s), which you can download directly from this mail\n- or displayed as a link (in case the file size was too big), which will give you access to the file(s)\n\nBest regards,\n\nJohn Doe");

            });
            it("AND, the recipientsSelector.initUsers will be called with the connected user", () => {
                expect(sendReportViewModel.recipientsSelector.initUsers).toHaveBeenCalledWith([<ap.models.actors.User>Utility.UserContext.CurrentUser()]);
                expect(sendReportViewModel.recipientsSelector.selectedContacts.length).toEqual(1);
            });
        });
        describe("WHEN initSendReportViewModel is called and the vm.isIndividualReport = true", () => {
            let listUsers: ap.models.actors.User[];
            let deferredGetUsers;
            let expectedFakeItem: ap.viewmodels.projects.ContactItemViewModel;

            beforeEach(() => {
                let user1: ap.models.actors.User = new ap.models.actors.User(Utility);
                user1.createByJson({ Id: "U1", DisplayName: "Sergio" });

                let user2: ap.models.actors.User = new ap.models.actors.User(Utility);
                user2.createByJson({ Id: "U2", DisplayName: "Renauld" });

                listUsers = [];

                listUsers.push(user1, user2);

                let tooltip: string = "Sergio" + "; " + "Renauld";
                expectedFakeItem = new ap.viewmodels.projects.ContactItemViewModel("Users in charge", null, null, null, false, true, tooltip);

                deferredGetUsers = $q.defer();
                spyOn(ReportController, "getUserInChargeForIndividualReport").and.returnValue(deferredGetUsers.promise);

                reportConfigViewModel.isIndividualReport = true;

            });
            it("THEN, the sendReportViewModel will be updated by values of the vm", () => {
                reportConfigViewModel.initSendReportViewModel(sendReportViewModel, ["C1", "C2"], false);
                expect(sendReportViewModel.subject).toEqual("Test send report");
                expect(sendReportViewModel.pdfName).toEqual("Test send report.pdf");
                expect(sendReportViewModel.hasExcelAttachment).toBeTruthy();
                expect(sendReportViewModel.excelName).toEqual("Test send report.xlsx");
                expect(sendReportViewModel.body).toEqual("Hello,\n\nI'd like to share with you my report 'Test send report' containing 2 points\n\nPlease find the report (and any attachments) at the end of this mail:\n- either displayed as (an) attachment(s), which you can download directly from this mail\n- or displayed as a link (in case the file size was too big), which will give you access to the file(s)\n\nBest regards,\n\nJohn Doe");

            });
            it("AND, the ReportController.getUserInChargeForIndividualReport with correct params", () => {
                reportConfigViewModel.initSendReportViewModel(sendReportViewModel, ["C1", "C2"], false);
                expect(ReportController.getUserInChargeForIndividualReport).toHaveBeenCalledWith(["C1", "C2"]);
            });

            it("AND, the recipientsSelector.addItem will be called to added the fake item", () => {
                reportConfigViewModel.initSendReportViewModel(sendReportViewModel, ["C1", "C2"], false);
                deferredGetUsers.resolve(listUsers);
                $rootScope.$apply();
                expect(sendReportViewModel.recipientsSelector.addItem).toHaveBeenCalledWith(expectedFakeItem, 0);
            });
            it("AND, the recipientsSelector.initUsers will be called with the connected user", () => {
                reportConfigViewModel.initSendReportViewModel(sendReportViewModel, ["C1", "C2"], false);
                deferredGetUsers.resolve(listUsers);
                $rootScope.$apply();
                expect(sendReportViewModel.recipientsSelector.initUsers).toHaveBeenCalledWith([<ap.models.actors.User>Utility.UserContext.CurrentUser()]);
            });
        });
    });

    describe("Feature: logo options", () => {
        let hasLogoOptions: boolean;
        let projectreportconfig: ap.models.reports.ProjectReportConfig;        
        beforeEach(() => {
            hasLogoOptions = false;
            projectreportconfig = new ap.models.reports.ProjectReportConfig(Utility);
            projectreportconfig.Code = "NOTELIST";
            projectreportconfig.Name = "List Of Point";
            projectreportconfig.GroupAndSorts = [];
            specHelper.general.spyProperty(ap.models.accessRights.PointReportAccessRight.prototype, "hasLogoOptions", specHelper.PropertyAccessor.Get).and.callFake(() => {
                return hasLogoOptions;
            });
        });
        afterEach(() => {
            specHelper.general.offSpyProperty(ap.models.accessRights.PointReportAccessRight.prototype, "hasLogoOptions", specHelper.PropertyAccessor.Get);
        });
        describe("WHEN the viewModel is build has the user has not the license for logo", () => {
            beforeEach(() => {
                reportConfigViewModel = new ap.viewmodels.reports.ReportConfigViewModel(Utility, MainController, new ap.models.accessRights.PointReportAccessRight(Utility), ReportController);
                reportConfigViewModel.init(projectreportconfig);
            });
            it("THEN, the hasListOfPoints equals false", () => {
                expect(reportConfigViewModel.hasListOfPoints).toBeFalsy();
            });
        });

        describe("WHEN init by report template with 2 logos", () => {
            let logo1, logo2: ap.models.reports.ReportLogo;
            beforeEach(() => {
                hasLogoOptions = true;
                projectreportconfig.Logos = [];
                logo1 = new ap.models.reports.ReportLogo(Utility);
                logo1.Type = ap.models.reports.ReportLogoType.Project;

                logo2 = new ap.models.reports.ReportLogo(Utility);
                logo2.Type = ap.models.reports.ReportLogoType.User;

                projectreportconfig.Logos.push(logo1);
                projectreportconfig.Logos.push(logo2);

                reportConfigViewModel = new ap.viewmodels.reports.ReportConfigViewModel(Utility, MainController, new ap.models.accessRights.PointReportAccessRight(Utility), ReportController);
                reportConfigViewModel.init(projectreportconfig);
            });
            it("THEN, there are 3 logos buid", () => {
                expect(reportConfigViewModel.logos.length).toEqual(3);
            });
            it("THEN, first logo is the first one from template", () => {
                expect(reportConfigViewModel.logos[0].logoType).toEqual(ap.models.reports.ReportLogoType[ap.models.reports.ReportLogoType.Project]);
            });
            it("THEN, second logo is the second one from template", () => {
                expect(reportConfigViewModel.logos[1].logoType).toEqual(ap.models.reports.ReportLogoType[ap.models.reports.ReportLogoType.User]);
            });
            it("THEN, 3rd logo is dummy one", () => {
                expect(reportConfigViewModel.logos[2].logoType).toEqual(ap.models.reports.ReportLogoType[ap.models.reports.ReportLogoType.None]);
            });
        });

        describe("WHEN with 2 logos and call post change", () => {
            let logo1: ap.models.reports.ReportLogo;
            beforeEach(() => {
                hasLogoOptions = true;
                projectreportconfig.Logos = [];
                logo1 = new ap.models.reports.ReportLogo(Utility);
                logo1.Type = ap.models.reports.ReportLogoType.Project;
                projectreportconfig.Logos.push(logo1);                

                reportConfigViewModel = new ap.viewmodels.reports.ReportConfigViewModel(Utility, MainController, new ap.models.accessRights.PointReportAccessRight(Utility), ReportController);
                reportConfigViewModel.init(projectreportconfig);

                reportConfigViewModel.logos[0].logoType = "User";
                reportConfigViewModel.logos[0].isAllPages = true;
                reportConfigViewModel.logos[1].logoType = "None";
                reportConfigViewModel.logos[2].logoType = "Project";                

                let subjectColumDef = new ap.models.reports.ReportColumnDefNote(Utility);
                subjectColumDef.PropertyName = "Subject";
                subjectColumDef.CanUseGroupBy = true;
                subjectColumDef.CanUseSort = true;

                let groupAndSortViewModel = new ap.viewmodels.reports.GroupAndSortViewModel(Utility, [subjectColumDef]);

                let subjectItem = new ap.viewmodels.reports.GroupAndSortItemViewModel(Utility);
                subjectItem.columnDefNote = subjectColumDef;
                subjectItem.isAscending = true;

                groupAndSortViewModel.groupAndSortItems = [subjectItem];

                reportConfigViewModel.groupAndSort = groupAndSortViewModel;

                reportConfigViewModel.postChanges();
            });
            it("THEN, there are 2 logos in final entity", () => {
                expect(reportConfigViewModel.reportconfig.Logos.length).toEqual(2);
            });
            it("THEN, first logo in final entity is type user", () => {
                expect(reportConfigViewModel.reportconfig.Logos[0].Type).toEqual(ap.models.reports.ReportLogoType.User);
            });
            it("THEN, first logo in final entity is all pages", () => {
                expect(reportConfigViewModel.reportconfig.Logos[0].IsAllPages).toBeTruthy();
            });
            it("THEN, second logo in final entity is type project", () => {
                expect(reportConfigViewModel.reportconfig.Logos[1].Type).toEqual(ap.models.reports.ReportLogoType.Project);
            });            
        });

        describe("WHEN perform change form 3 logos to 2 logos and call post change", () => {            
            beforeEach(() => {
                hasLogoOptions = true;
                projectreportconfig.Logos = [];
                let logo1 = new ap.models.reports.ReportLogo(Utility);
                logo1.Type = ap.models.reports.ReportLogoType.Project;

                let logo2 = new ap.models.reports.ReportLogo(Utility);
                logo2.Type = ap.models.reports.ReportLogoType.Project;

                let logo3 = new ap.models.reports.ReportLogo(Utility);
                logo3.Type = ap.models.reports.ReportLogoType.Project;

                projectreportconfig.Logos.push(logo1, logo2, logo3);

                // init VM
                reportConfigViewModel = new ap.viewmodels.reports.ReportConfigViewModel(Utility, MainController, new ap.models.accessRights.PointReportAccessRight(Utility), ReportController);
                reportConfigViewModel.init(projectreportconfig);

                reportConfigViewModel.logos[0].logoType = "None";                
                reportConfigViewModel.logos[1].logoType = "User";
                reportConfigViewModel.logos[1].isAllPages = true;

                reportConfigViewModel.logos[2].logoType = "Uploaded";
                reportConfigViewModel.logos[2].isAllPages = true;
                reportConfigViewModel.logos[2].path = "uploaded.jpg";

                let subjectColumDef = new ap.models.reports.ReportColumnDefNote(Utility);
                subjectColumDef.PropertyName = "Subject";
                subjectColumDef.CanUseGroupBy = true;
                subjectColumDef.CanUseSort = true;

                let groupAndSortViewModel = new ap.viewmodels.reports.GroupAndSortViewModel(Utility, [subjectColumDef]);

                let subjectItem = new ap.viewmodels.reports.GroupAndSortItemViewModel(Utility);
                subjectItem.columnDefNote = subjectColumDef;
                subjectItem.isAscending = true;

                groupAndSortViewModel.groupAndSortItems = [subjectItem];

                reportConfigViewModel.groupAndSort = groupAndSortViewModel;

                reportConfigViewModel.postChanges();
            });
            it("THEN, there are 2 logos in final entity", () => {
                expect(reportConfigViewModel.reportconfig.Logos.length).toEqual(2);
            });
            it("THEN, logo 1 in final entity is type user", () => {
                expect(reportConfigViewModel.reportconfig.Logos[0].Type).toEqual(ap.models.reports.ReportLogoType.User);
            });
            it("THEN, logo 1 in final entity is all pages", () => {
                expect(reportConfigViewModel.reportconfig.Logos[0].IsAllPages).toBeTruthy();
            });
            it("THEN, logo 2 in final entity is type uploaded", () => {
                expect(reportConfigViewModel.reportconfig.Logos[1].Type).toEqual(ap.models.reports.ReportLogoType.Uploaded);
            });
            it("THEN, logo 2 in final entity have custom path", () => {
                expect(reportConfigViewModel.reportconfig.Logos[1].Path).toEqual("uploaded.jpg");
            });
            it("THEN, logo 2 in final entity is all pages", () => {
                expect(reportConfigViewModel.reportconfig.Logos[1].IsAllPages).toBeTruthy();
            });
        });
    });

    describe("Feature: uploadCoverPage", () => {
        let docFile, pdfFile;
        let projectreportconfig: ap.models.reports.ProjectReportConfig;
        let deferredGetColumns;
        beforeEach(() => {
            docFile = <File>{ name: "testdoc.doc" };
            pdfFile = <File>{ name: "testpdf.pdf" };

            deferredGetColumns = $q.defer();
            
            spyOn(ReportController, "getReportColumnDefNote").and.returnValue(deferredGetColumns.promise);

            projectreportconfig = new ap.models.reports.ProjectReportConfig(Utility);
            projectreportconfig.Code = "NOTELIST";
            projectreportconfig.Name = "List Of Point";
            reportConfigViewModel = new ap.viewmodels.reports.ReportConfigViewModel(Utility, MainController, new ap.models.accessRights.PointReportAccessRight(Utility), ReportController);
            reportConfigViewModel.init(projectreportconfig);
        });
        describe("WHEN uploadCoverPage callled and hasCover = false", () => {
            it("THEN, the error will be throw", () => {
                reportConfigViewModel.hasCover = false;
                expect(function () { reportConfigViewModel.uploadCoverPage(pdfFile);}).toThrowError("Cannot uploadCoverPage when hasCover = false");
            });
        });
        describe("WHEN uploadCoverPage callled with file is null or undefined or not pdf file", () => {
            it("THEN, the error will be throw", () => {
                reportConfigViewModel.hasCover = true;
                expect(function () { reportConfigViewModel.uploadCoverPage(undefined); }).toThrowError("File is mandatory");
                expect(function () { reportConfigViewModel.uploadCoverPage(null); }).toThrowError("File is mandatory");
                
            });
        });
        describe("WHEN uploadCoverPage callled with file is not pdf file", () => {
            it("THEN, the mainController.showErrorKey will be called", () => {
                spyOn(MainController, "showErrorKey");
                reportConfigViewModel.hasCover = true;
                reportConfigViewModel.uploadCoverPage(docFile);
                expect(MainController.showErrorKey).toHaveBeenCalledWith("app.report.cover_pdf_only", "Only PDF allowed", null, null);
            });
        });

        describe("WHEN uploadCoverPage callled with pdf file and hasCover = true", () => {
            let deferredUploadFile;
            let expectedUrl: string = "";
            beforeEach(() => {
                deferredUploadFile = $q.defer();
                spyOn(Utility.FileHelper, "uploadFile").and.returnValue(deferredUploadFile.promise);
                spyOn(MainController, "showError");
                reportConfigViewModel.hasCover = true;
                expectedUrl = "UploadReportConfigFiles.ashx?GuidId={0}".format(reportConfigViewModel.reportconfig.Id);
            });
            it("THEN, FileHelper.uploadFile will called with correct param", () => {
                reportConfigViewModel.uploadCoverPage(pdfFile);
                expect(Utility.FileHelper.uploadFile).toHaveBeenCalledWith(expectedUrl, pdfFile, "testpdf.pdf");
            });
            it("AND THEN when upload finish, the coverPdfPath of the vm will update", () => {
                reportConfigViewModel.uploadCoverPage(pdfFile);
                deferredUploadFile.resolve("UploadedFileName");
                $rootScope.$apply();
                expect(reportConfigViewModel.coverPdfPath).toEqual("UploadedFileName");
            });
            it("AND THEN when upload failed, the message will show and the coverPdfPath is not updated", () => {
                reportConfigViewModel.uploadCoverPage(pdfFile);
                deferredUploadFile.reject("Have error when upload file");
                $rootScope.$apply();
                expect(MainController.showError).toHaveBeenCalledWith("Fail to upload the file testpdf.pdf", "ERROR", "Have error when upload file", null);
                expect(reportConfigViewModel.coverPdfPath).toEqual("");
            });
            it("AND THEN when uploading is cancel at server, the message will not show and the coverPdfPath is not updated", () => {
                reportConfigViewModel.uploadCoverPage(pdfFile);
                deferredUploadFile.reject("CANCEL");
                $rootScope.$apply();
                expect(MainController.showError).not.toHaveBeenCalled();
                expect(reportConfigViewModel.coverPdfPath).toEqual("");
            });

        });
    });   

    describe("Feature: cansave", () => {        
        describe("WHEN title is null", () => {
            beforeEach(() => {
                let accessRight = new ap.models.accessRights.PointReportAccessRight(Utility);
                reportConfigViewModel = new ap.viewmodels.reports.ReportConfigViewModel(Utility, MainController, accessRight, ReportController);                
                reportConfigViewModel.reportTitles.searchText = null                
            });
            it("THEN, canSave = flase", () => { expect(reportConfigViewModel.canSave()).toEqual(false); });        
        });
        describe("WHEN title is empty", () => {
            beforeEach(() => {
                let accessRight = new ap.models.accessRights.PointReportAccessRight(Utility);
                reportConfigViewModel = new ap.viewmodels.reports.ReportConfigViewModel(Utility, MainController, accessRight, ReportController);
                reportConfigViewModel.reportTitles.searchText = ""
                reportConfigViewModel.logos = [];
            });
            it("THEN, canSave = flase", () => { expect(reportConfigViewModel.canSave()).toEqual(false); });
        });

        describe("WHEN title is OK but no list and no detail", () => {
            beforeEach(() => {
                let accessRight = new ap.models.accessRights.PointReportAccessRight(Utility);
                reportConfigViewModel = new ap.viewmodels.reports.ReportConfigViewModel(Utility, MainController, accessRight, ReportController);
                reportConfigViewModel.reportTitles.searchText = "abc"
                reportConfigViewModel.hasListOfPoints = false;
                reportConfigViewModel.hasDetailOfPoints = false;
                reportConfigViewModel.logos = [];
            });
            it("THEN, canSave = flase", () => { expect(reportConfigViewModel.canSave()).toEqual(false); });
        });

        describe("WHEN title is OK and list/detail OK and logo OK", () => {
            beforeEach(() => {
                let accessRight = new ap.models.accessRights.PointReportAccessRight(Utility);
                reportConfigViewModel = new ap.viewmodels.reports.ReportConfigViewModel(Utility, MainController, accessRight, ReportController);
                reportConfigViewModel.reportTitles.searchText = "abc"
                reportConfigViewModel.hasListOfPoints = true;
                reportConfigViewModel.hasDetailOfPoints = true;

                let reportLogo = new ap.viewmodels.reports.ReportLogoViewModel(Utility, MainController, "abc");
                spyOn(reportLogo, "canSave").and.returnValue(true);

                reportConfigViewModel.logos = [reportLogo];                
            });
            it("THEN, canSave = true", () => { expect(reportConfigViewModel.canSave()).toEqual(true); });
        });

        describe("WHEN title is OK and list/detail OK and logo NOT OK", () => {
            beforeEach(() => {
                let accessRight = new ap.models.accessRights.PointReportAccessRight(Utility);
                reportConfigViewModel = new ap.viewmodels.reports.ReportConfigViewModel(Utility, MainController, accessRight, ReportController);
                reportConfigViewModel.reportTitles.searchText = "abc"
                reportConfigViewModel.hasListOfPoints = true;
                reportConfigViewModel.hasDetailOfPoints = true;

                let reportLogo = new ap.viewmodels.reports.ReportLogoViewModel(Utility, MainController, "abc");
                spyOn(reportLogo, "canSave").and.returnValue(false);

                reportConfigViewModel.logos = [reportLogo];
            });
            it("THEN, canSave = false", () => { expect(reportConfigViewModel.canSave()).toEqual(false); });
        });
    });
    describe("Feature: noteColumns", () => {
        let projectreportconfig: ap.models.reports.ProjectReportConfig;
        let accessRight: ap.models.accessRights.PointReportAccessRight;
        beforeEach(() => {
            spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake(function (moduleCode) {
                if (moduleCode === "PRINT_ADD_INFO") {
                    return true;
                } else if (moduleCode === "PRINT_LAYOUT") {
                    return true;
                } else {
                    return false;
                }
            });

            projectreportconfig = new ap.models.reports.ProjectReportConfig(Utility);
            projectreportconfig.Code = "NOTELIST";
            projectreportconfig.Name = "List Of Point";

            accessRight = new ap.models.accessRights.PointReportAccessRight(Utility);

            reportConfigViewModel = new ap.viewmodels.reports.ReportConfigViewModel(Utility, MainController, accessRight, ReportController);
        });
        describe("WHEN hasListOfPoints is true", () => {
            beforeEach(() => {
                reportConfigViewModel.hasListOfPoints = true;
                let columnsViewModel = new ap.viewmodels.reports.ColumnsViewModel(Utility, null, null);
                reportConfigViewModel.noteColumn = columnsViewModel;
            });
            it("THEN, noteColumn's drag&drop is true", () => {
                expect(reportConfigViewModel.noteColumn.dragOptions.isEnabled).toBeTruthy();
            });
        });
        describe("WHEN hasListOfPoints is false", () => {
            beforeEach(() => {
                reportConfigViewModel.hasListOfPoints = false;

                // initialize the columns
                let subjectColumn = new ap.viewmodels.reports.ReportColumnViewModel(Utility);
                subjectColumn.propertyName = "Subject";
                subjectColumn.displayOrder = 1;
                subjectColumn.isChecked = true;
                let roomColumn = new ap.viewmodels.reports.ReportColumnViewModel(Utility);
                roomColumn.propertyName = "Room";
                roomColumn.displayOrder = 2;
                roomColumn.isChecked = true;
                let columns = [subjectColumn, roomColumn];

                let projectreportconfig = new ap.models.reports.ProjectReportConfig(Utility);
                projectreportconfig.Code = "NOTELIST";
                projectreportconfig.Name = "List Of Point";

                // groups and sorts
                let subjectColumDef = new ap.models.reports.ReportColumnDefNote(Utility);
                subjectColumDef.PropertyName = "Subject";
                subjectColumDef.CanUseGroupBy = true;
                subjectColumDef.CanUseSort = true;
                let groupAndSortViewModel = new ap.viewmodels.reports.GroupAndSortViewModel(Utility, [subjectColumDef]);
                let subjectItem = new ap.viewmodels.reports.GroupAndSortItemViewModel(Utility);
                subjectItem.columnDefNote = subjectColumDef;
                subjectItem.isAscending = true;
                groupAndSortViewModel.groupAndSortItems = [subjectItem];
                

                let columnsViewModel = new ap.viewmodels.reports.ColumnsViewModel(Utility, null, null);
                reportConfigViewModel.init(projectreportconfig);
                reportConfigViewModel.noteColumn = columnsViewModel;
                reportConfigViewModel.groupAndSort = groupAndSortViewModel;

            });
            it("THEN, noteColumn's drag&drop is disabled", () => {
                expect(reportConfigViewModel.noteColumn.dragOptions.isEnabled).toBeFalsy();
            });

            describe("AND postChanges is called", () => {

                beforeEach(() => {
                    spyOn(reportConfigViewModel.noteColumn, "postChanges");

                    reportConfigViewModel.postChanges();
                });

                it("THEN, 'reportConfigViewModel.noteColumn.postChanges' is not called", () => {
                    expect(reportConfigViewModel.noteColumn.postChanges).not.toHaveBeenCalled();
                });
                it("THEN, 'reportConfigViewModel.reportconfig.NotesColumns' is empty", () => {
                    expect(reportConfigViewModel.reportconfig.NotesColumns.length).toBe(0);
                });
            });
        });  
    });
});