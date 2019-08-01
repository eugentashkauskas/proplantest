describe("Module ap-viewmodels - meetingReports", () => {

    let MainController: ap.controllers.MainController, Utility: ap.utility.UtilityHelper, Api: ap.services.apiHelper.Api, UserContext: ap.utility.UserContext;
    let $rootScope: angular.IRootScopeService, $q: angular.IQService;

    var reportConfigViewModel: ap.viewmodels.reports.MeetingReportConfigViewModel = null;
    let ReportController: ap.controllers.ReportController;
    let MeetingController: ap.controllers.MeetingController;
    let ProjectController: ap.controllers.ProjectController;
    let ContactService: ap.services.ContactService;

    let currentProject: ap.models.projects.Project;
    let projectlogoPath: string = null;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject((_$rootScope_, _$q_, _UserContext_, _Utility_, _Api_, _MainController_, _ReportController_, _MeetingController_, _ProjectController_, _ContactService_) => {
        MainController = _MainController_;
        ReportController = _ReportController_;
        MeetingController = _MeetingController_;
        ProjectController = _ProjectController_;
        ContactService = _ContactService_;
        Utility = _Utility_;
        UserContext = _UserContext_;
        Api = _Api_;
        $q = _$q_;
        $rootScope = _$rootScope_;
        specHelper.utility.stubRootUrl(Utility);
        specHelper.userContext.stub(Utility);
        Utility.Storage.Session.clear();
        specHelper.utility.stubStorageSet(Utility);

        spyOn(Utility.Translator, "getTranslation").and.callFake(function (key) {
            if (key === "app.project_report_template.summaryNoteList")
                return "Summary point list";
            if (key === "app.report.default_send_message")
                return "Hello,\n\nI'd like to share with you my report '{0}' containing {1} points\n\nPlease find the report (and any attachments) at the end of this mail:\n- either displayed as (an) attachment(s), which you can download directly from this mail\n- or displayed as a link (in case the file size was too big), which will give you access to the file(s)\n\nBest regards,\n\n{2}";
        });
        
        currentProject = new ap.models.projects.Project(Utility);
        projectlogoPath = "project_logo.jpg";

        currentProject.createByJson({
            Id: "b360cb6d-ca54-4b93-a564-a469274eb68a",
            Name: "Welcome Project",
            Code: "PR1"
        });
        let deferTitles = $q.defer();
        spyOn(ReportController, "getReportTitleHistory").and.returnValue(deferTitles.promise);
        deferTitles.resolve(["test", "test2"])
        spyOn(MainController, "currentProject").and.returnValue(currentProject);
        spyOn(currentProject, "getLogoPath").and.callFake(() => { return projectlogoPath; });
    }));

    describe("Feature ReportConfigViewModel: init values", () => {
        let projectreportconfig: ap.models.reports.ProjectReportConfig;
        let accessRight: ap.models.accessRights.PointReportAccessRight;

        beforeEach(() => {
            projectreportconfig = new ap.models.reports.ProjectReportConfig(Utility);

            spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake(function (moduleCode) {
                if (moduleCode === ap.models.licensing.Module.Module_PrintColumns)
                    return true;
                if (moduleCode === ap.models.licensing.Module.Module_MeetingManagement) {
                    return true;
                }
                else
                    return false;
            });

            accessRight = new ap.models.accessRights.PointReportAccessRight(Utility);

            reportConfigViewModel = new ap.viewmodels.reports.MeetingReportConfigViewModel(Utility, MainController, accessRight, ReportController, MeetingController);
            reportConfigViewModel.init(projectreportconfig);
        });
        describe("WHEN the ReportConfigViewModel is created", () => {
            it("THEN I expect that hasReportHeader = false", () => {
                expect(reportConfigViewModel.hasReportHeader).toBeFalsy();
            });
            it("THEN I expect that hasReportFooter = false", () => {
                expect(reportConfigViewModel.hasReportFooter).toBeFalsy();
            });
            it("THEN I expect that hasTransferred = false", () => {
                expect(reportConfigViewModel.hasTransferred).toBeFalsy();
            });
            it("THEN I expect that hasAttendees = false", () => {
                expect(reportConfigViewModel.hasAttendees).toBeFalsy();
            });
            it("THEN I expect that hasColumnOptions = true", () => {
                expect(reportConfigViewModel.hasColumnOptions).toBeTruthy();
            });
        });
    });

    describe("Feature ReportConfigViewModel: Receive values", () => {
        let projectreportconfig: ap.models.reports.MeetingReportConfig;
        let accessRight: ap.models.accessRights.PointReportAccessRight;
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

        describe("WHEN the view model Post change The Entity must update with VM values", () => {
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

                projectreportconfig = new ap.models.reports.MeetingReportConfig(Utility);
                projectreportconfig.Code = "NOTELIST";
                projectreportconfig.Name = "List Of Point";
                projectreportconfig.GroupAndSorts = [];
                projectreportconfig.NoteList = ap.models.reports.ReportNoteList.Simple;
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake(function (moduleCode) {
                    if (moduleCode === ap.models.licensing.Module.Module_PrintColumns)
                        return true;
                    if (moduleCode === ap.models.licensing.Module.Module_MeetingManagement) {
                        return true;
                    }
                    else
                        return false;
                });

                accessRight = new ap.models.accessRights.PointReportAccessRight(Utility);
                reportConfigViewModel = new ap.viewmodels.reports.MeetingReportConfigViewModel(Utility, MainController, accessRight, ReportController, MeetingController);
                reportConfigViewModel.init(projectreportconfig);

                reportConfigViewModel.code = "New code";
                reportConfigViewModel.name = "New name";
                reportConfigViewModel.reportTitles.searchText = "List of point";

                language = new ap.models.identFiles.Language(Utility);
                language.Code = "en";
                language.TranslationCode = "EN";
                reportConfigViewModel.language = language;

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
                reportConfigViewModel.participantColumns = columnsViewModel;


                subjectColumDef = new ap.models.reports.ReportColumnDefNote(Utility);
                subjectColumDef.PropertyName = "Subject";
                subjectColumDef.CanUseGroupBy = true;
                subjectColumDef.CanUseSort = true;

                roomColumDef = new ap.models.reports.ReportColumnDefNote(Utility);
                roomColumDef.PropertyName = "Room";
                roomColumDef.CanUseGroupBy = false;
                roomColumDef.CanUseSort = true;

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

                reportConfigViewModel.hasAttendees = true;
                reportConfigViewModel.hasTransferred = true;
                reportConfigViewModel.hasReportHeader = true;
                reportConfigViewModel.hasReportFooter = true;

                reportConfigViewModel.postChanges();
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.models.accessRights.PointReportAccessRight.prototype, "hasSortOptions", specHelper.PropertyAccessor.Get);
            });
            it("THEN I expect that hasReportHeader = true", () => {
                expect(reportConfigViewModel.hasReportHeader).toBeTruthy();
            });
            it("THEN I expect that hasReportFooter = true", () => {
                expect(reportConfigViewModel.hasReportFooter).toBeTruthy();
            });
            it("THEN I expect that hasTransferred = true", () => {
                expect(reportConfigViewModel.hasTransferred).toBeTruthy();
            });
            it("THEN I expect that hasAttendees = true", () => {
                expect(reportConfigViewModel.hasAttendees).toBeTruthy();
            });
            it("THEN I expect 2 participant columns saved to meetingReportConfig", () => {
                expect(reportConfigViewModel.meetingReportConfig.ParticipantsColumns.length).toEqual(2);
            });
            it("THEN I expect participant column 1 is Subject", () => {
                expect(reportConfigViewModel.meetingReportConfig.ParticipantsColumns[0].PropertyName).toEqual("Subject");
            });
            it("THEN I expect participant column 2 is Room", () => {
                expect(reportConfigViewModel.meetingReportConfig.ParticipantsColumns[1].PropertyName).toEqual("Room");
            });

        });
    });
    describe("Feature setTemplate", () => {
        describe("When the setTemplate method is called", () => {
            let meetingReportTemplate: ap.models.reports.MeetingReportTemplate;
            let deferredGetColumns;
            beforeEach(() => {
                let colNoteDef = $q.defer();
                let copyConfigDef = $q.defer();

                deferredGetColumns = $q.defer();
                meetingReportTemplate = new ap.models.reports.MeetingReportTemplate(Utility);
                // spyOn(ap.models.reports.ReportConfigBase.prototype, "copyFrom");

                spyOn(ReportController, "getReportColumnDefParticipant").and.returnValue(deferredGetColumns.promise);
                spyOn(ReportController, "copyReportTemplateFiles").and.returnValue(copyConfigDef.promise);
                spyOn(ReportController, "getReportColumnDefNote").and.returnValue(colNoteDef.promise);

                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake(function (moduleCode) {
                    if (moduleCode === ap.models.licensing.Module.Module_PrintColumns)
                        return true;
                    if (moduleCode === ap.models.licensing.Module.Module_MeetingManagement) {
                        return true;
                    }
                    else
                        return false;
                });

                let accessRight = new ap.models.accessRights.PointReportAccessRight(Utility);
                reportConfigViewModel = new ap.viewmodels.reports.MeetingReportConfigViewModel(Utility, MainController, accessRight, ReportController, MeetingController);

                reportConfigViewModel.setTemplate(meetingReportTemplate);

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
                colNoteDef.resolve([def_col1, def_col2, def_col3]);
                deferredGetColumns.resolve([def_col1, def_col2, def_col3]);
                copyConfigDef.resolve("1");

                $rootScope.$apply();
            });
            it("THEN, the ReportController.getReportColumnDefParticipant is called", () => {
                expect(ReportController.getReportColumnDefParticipant).toHaveBeenCalled();
            });
            it("AND, the vm will init with the MeetingReportTemplate entity", () => {
                expect(reportConfigViewModel.reportconfig.EntityDiscriminator).toEqual("MeetingReportConfig");
            });
            it("AND, the title will be fill be null", () => {
                expect(reportConfigViewModel.reportTitles.searchText).toBe("");
            });
        });

        describe("When the set a template with participant columns", () => {
            let meetingReportTemplate: ap.models.reports.MeetingReportTemplate;
            beforeEach(() => {
                meetingReportTemplate = new ap.models.reports.MeetingReportTemplate(Utility);
                let col1 = new ap.models.reports.ReportParticipantColumn(Utility);
                col1.PropertyName = "Col1";
                col1.DisplayOrder = 0;
                let col2 = new ap.models.reports.ReportParticipantColumn(Utility);
                col2.PropertyName = "Col2";
                col2.DisplayOrder = 1;

                meetingReportTemplate.ParticipantsColumns = [col1, col2];

                let def_col1 = new ap.models.reports.ReportColumnDefParticipant(Utility);
                def_col1.PropertyName = "Col1";
                def_col1.CanHideCol = true;
                def_col1.IsVisible = true;
                let def_col2 = new ap.models.reports.ReportColumnDefParticipant(Utility);
                def_col2.PropertyName = "Col2";
                def_col2.CanHideCol = true;
                def_col2.IsVisible = true;
                let def_col3 = new ap.models.reports.ReportColumnDefParticipant(Utility);
                def_col3.PropertyName = "Col3";
                def_col3.CanHideCol = true;
                def_col3.IsVisible = true;

                let def = $q.defer();
                let deferredGetColumns = $q.defer();
                let copyConfigDef = $q.defer();

                spyOn(ReportController, "copyReportTemplateFiles").and.returnValue(copyConfigDef.promise);
                spyOn(ReportController, "getReportColumnDefNote").and.returnValue(deferredGetColumns.promise);
                spyOn(ReportController, "getReportColumnDefParticipant").and.returnValue(def.promise);

                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake(function (moduleCode) {
                    if (moduleCode === ap.models.licensing.Module.Module_PrintColumns)
                        return true;
                    if (moduleCode === ap.models.licensing.Module.Module_MeetingManagement) {
                        return true;
                    }
                    else
                        return false;
                });

                let accessRight = new ap.models.accessRights.PointReportAccessRight(Utility);
                reportConfigViewModel = new ap.viewmodels.reports.MeetingReportConfigViewModel(Utility, MainController, accessRight, ReportController, MeetingController);
                reportConfigViewModel.setTemplate(meetingReportTemplate);

                def.resolve([def_col1, def_col2, def_col3]);
                deferredGetColumns.resolve([]);
                copyConfigDef.resolve("1");

                $rootScope.$apply();
            });
            it("THEN, the ReportController.getReportColumnDefParticipant method wil be called", () => {
                expect(ReportController.getReportColumnDefParticipant).toHaveBeenCalled();
            });
            it("THEN, there are 3 participant clumns init", () => {
                expect(reportConfigViewModel.participantColumns.columnsAvailable.length).toEqual(3);
            });
            it("THEN, there are participant clumns 1 is checked", () => {
                expect(reportConfigViewModel.participantColumns.columnsAvailable[0].isChecked).toBeTruthy();
            });
            it("THEN, there are participant clumns 1 is Col1", () => {
                expect(reportConfigViewModel.participantColumns.columnsAvailable[0].propertyName).toBe("Col1");
            });
            it("THEN, there are participant clumns 2 is checked", () => {
                expect(reportConfigViewModel.participantColumns.columnsAvailable[1].isChecked).toBeTruthy();
            });
            it("THEN, there are participant clumns 2 is Col2", () => {
                expect(reportConfigViewModel.participantColumns.columnsAvailable[1].propertyName).toBe("Col2");
            });
            it("THEN, there are participant clumns 3 is NOT  checked", () => {
                expect(reportConfigViewModel.participantColumns.columnsAvailable[2].isChecked).toBeFalsy();
            });
            it("THEN, there are participant clumns 3 is Col3", () => {
                expect(reportConfigViewModel.participantColumns.columnsAvailable[2].propertyName).toBe("Col3");
            });
        });
    });

    describe("Feature: groups and sorts", () => {

        let meetingColumnDef, codeColumnDef, issueTypeColumnDef: ap.models.reports.ReportColumnDefNote;
        let getColumnsDef: angular.IDeferred<any>;
        let copyConfigDef: angular.IDeferred<any>;
        let def: angular.IDeferred<any>;
        let def_col1, def_col2, def_col3: ap.models.reports.ReportColumnDefParticipant;

        beforeEach(() => {
            spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake(function (moduleCode) {
                if (moduleCode === ap.models.licensing.Module.Module_MeetingManagement) {
                    return true;
                }
                else
                    return false;
            });

            meetingColumnDef = new ap.models.reports.ReportColumnDefNote(Utility);
            meetingColumnDef.PropertyName = "Meeting";
            meetingColumnDef.CanUseGroupBy = true;
            meetingColumnDef.CanUseSort = true;

            codeColumnDef = new ap.models.reports.ReportColumnDefNote(Utility);
            codeColumnDef.PropertyName = "Code";
            codeColumnDef.CanUseGroupBy = false;
            codeColumnDef.CanUseSort = true;

            issueTypeColumnDef = new ap.models.reports.ReportColumnDefNote(Utility);
            issueTypeColumnDef.PropertyName = "IssueType";
            issueTypeColumnDef.CanUseGroupBy = false;
            issueTypeColumnDef.CanUseSort = true;

            def_col1 = new ap.models.reports.ReportColumnDefParticipant(Utility);
            def_col1.PropertyName = "Col1";
            def_col1.CanHideCol = true;
            def_col1.IsVisible = true;
            def_col2 = new ap.models.reports.ReportColumnDefParticipant(Utility);
            def_col2.PropertyName = "Col2";
            def_col2.CanHideCol = true;
            def_col2.IsVisible = true;
            def_col3 = new ap.models.reports.ReportColumnDefParticipant(Utility);
            def_col3.PropertyName = "Col3";
            def_col3.CanHideCol = true;
            def_col3.IsVisible = true;

            getColumnsDef = $q.defer();
            copyConfigDef = $q.defer();
            def = $q.defer();

            spyOn(ReportController, "getReportColumnDefNote").and.returnValue(getColumnsDef.promise);
            spyOn(ReportController, "copyReportTemplateFiles").and.returnValue(copyConfigDef.promise);
            spyOn(ReportController, "getReportColumnDefParticipant").and.returnValue(def.promise);

            let accessRight = new ap.models.accessRights.PointReportAccessRight(Utility);
            reportConfigViewModel = new ap.viewmodels.reports.MeetingReportConfigViewModel(Utility, MainController, accessRight, ReportController, MeetingController);
        });

        describe("When the setTemplate method is called with the MeetingReportTemplate and groups/sorts empty", () => {
            let meetingReportTemplate: ap.models.reports.MeetingReportTemplate;
            beforeEach(() => {
                meetingReportTemplate = new ap.models.reports.MeetingReportTemplate(Utility);
                meetingReportTemplate.GroupAndSorts = [];

                reportConfigViewModel.setTemplate(meetingReportTemplate);

                def.resolve([def_col1, def_col2, def_col3]);
                getColumnsDef.resolve([meetingColumnDef, codeColumnDef, issueTypeColumnDef]);
                copyConfigDef.resolve("1");
                $rootScope.$apply();
            });
            it("THEN, ReportController.getReportColumnDefNote  have been called", () => {
                expect(ReportController.getReportColumnDefNote).toHaveBeenCalled();
            });

            it("THEN, groupAndSort.groupByProperties is init", () => {
                expect(reportConfigViewModel.groupAndSort.groupByProperties).toBeDefined();
            });
            it("THEN, groupAndSort.groupAndSortItems have 1 item", () => {
                expect(reportConfigViewModel.groupAndSort.groupByProperties.length).toEqual(1);
            });

            it("THEN, groupAndSort.groupAndSortItems[0] is for Meeting column", () => {
                expect(reportConfigViewModel.groupAndSort.groupByProperties[0].PropertyName).toEqual("Meeting");
            });

            it("THEN, groupAndSort.sortProperties have 4 items", () => {
                expect(reportConfigViewModel.groupAndSort.sortProperties.length).toEqual(4);
            });

            it("THEN, groupAndSort.sortProperties[0] is for None column", () => {
                expect(reportConfigViewModel.groupAndSort.sortProperties[0].PropertyName).toEqual("None");
            });

            it("THEN, groupAndSort.sortProperties[1] is for Meeting column", () => {
                expect(reportConfigViewModel.groupAndSort.sortProperties[1].PropertyName).toEqual("Meeting");
            });

            it("THEN, groupAndSort.sortProperties[2] is for Code column", () => {
                expect(reportConfigViewModel.groupAndSort.sortProperties[2].PropertyName).toEqual("Code");
            });
        });

        describe("When the setTemplate method is called with the MeetingReportTemplate contains groups and sorts", () => {
            let meetingReportTemplate: ap.models.reports.MeetingReportTemplate;
            beforeEach(() => {
                meetingReportTemplate = new ap.models.reports.MeetingReportTemplate(Utility);

                let meetingColumn = new ap.models.reports.ReportGroupAndSort(Utility);
                meetingColumn.DisplayOrder = 1;
                meetingColumn.PropertyName = "Meeting";
                meetingColumn.IsAscending = true;

                let codeColumn = new ap.models.reports.ReportGroupAndSort(Utility);
                codeColumn.DisplayOrder = 2;
                codeColumn.PropertyName = "Code";
                codeColumn.IsAscending = false;

                let issueTypeColumn = new ap.models.reports.ReportGroupAndSort(Utility);
                issueTypeColumn.DisplayOrder = 3;
                issueTypeColumn.PropertyName = "IssueType";
                issueTypeColumn.IsAscending = true;

                let dummyColumn = new ap.models.reports.ReportGroupAndSort(Utility);
                dummyColumn.DisplayOrder = 4;
                dummyColumn.PropertyName = "dummy";

                meetingReportTemplate.GroupAndSorts = [issueTypeColumn, meetingColumn, codeColumn, dummyColumn];

                reportConfigViewModel.setTemplate(meetingReportTemplate);

                def.resolve([def_col1, def_col2, def_col3]);
                getColumnsDef.resolve([meetingColumnDef, codeColumnDef, issueTypeColumnDef]);
                copyConfigDef.resolve("1");
                $rootScope.$apply();
            });
            it("THEN, groupAndSort contains 3 items", () => {
                expect(reportConfigViewModel.groupAndSort.groupAndSortItems.length).toEqual(3);
            });

            it("THEN, groupAndSort items[0] is meeting", () => {
                expect(reportConfigViewModel.groupAndSort.groupAndSortItems[0].propertyName).toEqual("Meeting");
            });

            it("THEN, groupAndSort items[0] is ASC", () => {
                expect(reportConfigViewModel.groupAndSort.groupAndSortItems[0].isAscending).toBeTruthy();
            });

            it("THEN, groupAndSort items[1] is Code", () => {
                expect(reportConfigViewModel.groupAndSort.groupAndSortItems[1].propertyName).toEqual("Code");
            });

            it("THEN, groupAndSort items[1] is DESC", () => {
                expect(reportConfigViewModel.groupAndSort.groupAndSortItems[1].isAscending).toBeFalsy();
            });

            it("THEN, groupAndSort items[2] is IssueType", () => {
                expect(reportConfigViewModel.groupAndSort.groupAndSortItems[2].propertyName).toEqual("IssueType");
            });

            it("THEN, groupAndSort items[2] is ASC", () => {
                expect(reportConfigViewModel.groupAndSort.groupAndSortItems[2].isAscending).toBeTruthy();
            });

        });

        describe("When the setTemplate method is called with the MeetingReportTemplate contains 1 group and sort column", () => {
            let meetingReportTemplate: ap.models.reports.MeetingReportTemplate;
            beforeEach(() => {
                meetingReportTemplate = new ap.models.reports.MeetingReportTemplate(Utility);

                let meetingColumn = new ap.models.reports.ReportGroupAndSort(Utility);
                meetingColumn.DisplayOrder = 1;
                meetingColumn.PropertyName = "Meeting";
                meetingColumn.IsAscending = true;

                meetingReportTemplate.GroupAndSorts = [meetingColumn];

                reportConfigViewModel.setTemplate(meetingReportTemplate);

                def.resolve([def_col1, def_col2, def_col3]);
                getColumnsDef.resolve([meetingColumnDef, codeColumnDef, issueTypeColumnDef]);
                copyConfigDef.resolve("1");
                $rootScope.$apply();
            });

            it("THEN, groupAndSort contains 3 items", () => {
                expect(reportConfigViewModel.groupAndSort.groupAndSortItems.length).toEqual(3);
            });

            it("THEN, groupAndSort contains items 2 is dummy one", () => {
                expect(reportConfigViewModel.groupAndSort.groupAndSortItems[1].propertyName).toEqual("None");
            });

            it("THEN, groupAndSort contains items 3 is dummy one", () => {
                expect(reportConfigViewModel.groupAndSort.groupAndSortItems[2].propertyName).toEqual("None");
            });

        });
    });

    describe("Feature: initSendReportViewModel", () => {
        let sendReportViewModel: ap.viewmodels.reports.SendReportViewModel;
        let getMeetingContactDeferred;
        let currentMeeting: ap.models.meetings.Meeting;
        let meetingConcerns: ap.models.meetings.MeetingConcern[];

        beforeEach(() => {
            getMeetingContactDeferred = $q.defer();

            spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake(function (moduleCode) {
                if (moduleCode === ap.models.licensing.Module.Module_MeetingManagement) {
                    return true;
                }
                else
                    return false;
            });

            currentMeeting = new ap.models.meetings.Meeting(Utility);
            currentMeeting.createByJson({ Id: "M2" });
            specHelper.general.spyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get).and.returnValue(currentMeeting);

            meetingConcerns = [];
            let meetingConcern1: ap.models.meetings.MeetingConcern = new ap.models.meetings.MeetingConcern(Utility);
            meetingConcern1.createByJson({
                Id: "M1",
                User: {
                    Id: "U1"
                },
                AccessRightLevel: ap.models.accessRights.AccessRightLevel.Admin
            });
            let meetingConcern2: ap.models.meetings.MeetingConcern = new ap.models.meetings.MeetingConcern(Utility);
            meetingConcern2.createByJson({
                Id: "M2",
                User: {
                    Id: "U2"
                },
                AccessRightLevel: ap.models.accessRights.AccessRightLevel.Manager
            });
            let meetingConcern3: ap.models.meetings.MeetingConcern = new ap.models.meetings.MeetingConcern(Utility);
            meetingConcern3.createByJson({
                Id: "M3",
                User: {
                    Id: "U3"
                },
                AccessRightLevel: ap.models.accessRights.AccessRightLevel.Subcontractor
            });

            meetingConcerns.push(meetingConcern1);
            meetingConcerns.push(meetingConcern2);
            meetingConcerns.push(meetingConcern3);

            spyOn(MeetingController, "getMeetingContacts").and.returnValue(getMeetingContactDeferred.promise);


            sendReportViewModel = new ap.viewmodels.reports.SendReportViewModel(Utility, Api, $q, ProjectController, ReportController, MainController, ContactService);

            spyOn(sendReportViewModel.recipientsSelector, "initUsers").and.callThrough();

            let accessRight = new ap.models.accessRights.PointReportAccessRight(Utility);
            reportConfigViewModel = new ap.viewmodels.reports.MeetingReportConfigViewModel(Utility, MainController, accessRight, ReportController, MeetingController);
            reportConfigViewModel.reportTitles.searchText = "Test send report";
            reportConfigViewModel.hasJoinExcel = true;
        });
        afterEach(() => {
            specHelper.general.offSpyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get);
        });
        describe("WHEN initSendReportViewModel is called and the vm.isIndividualReport = false", () => {
            beforeEach(() => {
                spyOn(ap.viewmodels.reports.ReportConfigViewModel.prototype, "initSendReportViewModel").and.callThrough();
            });
            it("THEN, the sendReportViewModel will be updated by values of the vm", () => {
                reportConfigViewModel.initSendReportViewModel(sendReportViewModel, ["C1", "C2"], false);
                expect(sendReportViewModel.subject).toEqual("Test send report");
                expect(sendReportViewModel.pdfName).toEqual("Test send report.pdf");
                expect(sendReportViewModel.hasExcelAttachment).toBeTruthy();
                expect(sendReportViewModel.excelName).toEqual("Test send report.xlsx");
                expect(sendReportViewModel.body).toEqual("Hello,\n\nI'd like to share with you my report 'Test send report' containing 2 points\n\nPlease find the report (and any attachments) at the end of this mail:\n- either displayed as (an) attachment(s), which you can download directly from this mail\n- or displayed as a link (in case the file size was too big), which will give you access to the file(s)\n\nBest regards,\n\nJohn Doe");

            });
            it("AND, the getMeetingContacts will be called to get the list of meeting participants", () => {
                reportConfigViewModel.initSendReportViewModel(sendReportViewModel, ["C1", "C2"], false);
                expect(MeetingController.getMeetingContacts).toHaveBeenCalledWith(currentMeeting);
            });
            it("AND THEN, the recipientsSelector.initUsers will be called", () => {
                reportConfigViewModel.initSendReportViewModel(sendReportViewModel, ["C1", "C2"], false);
                getMeetingContactDeferred.resolve(meetingConcerns);
                $rootScope.$apply();

                expect((<jasmine.Spy>sendReportViewModel.recipientsSelector.initUsers).calls.count()).toBe(2);
                expect((<jasmine.Spy>sendReportViewModel.recipientsSelector.initUsers).calls.argsFor(1)[0]).toEqual([meetingConcerns[0].User, meetingConcerns[1].User]);

                expect(sendReportViewModel.recipientsSelector.selectedContacts.length).toBe(2);
            });
        });
        describe("WHEN initSendReportViewModel is called and the vm.isIndividualReport = true", () => {
            beforeEach(() => {
                reportConfigViewModel.isIndividualReport = true;
                spyOn(ap.viewmodels.reports.ReportConfigViewModel.prototype, "initSendReportViewModel");
                reportConfigViewModel.initSendReportViewModel(sendReportViewModel, ["C1", "C2"], false);
            });
            it("THEN, the initSendReportViewModel method of base class will be called", () => {
                expect(ap.viewmodels.reports.ReportConfigViewModel.prototype.initSendReportViewModel).toHaveBeenCalledWith(sendReportViewModel, ["C1", "C2"], false);
            });
            it("AND the getMeetingContacts will not be called", () => {
                expect(MeetingController.getMeetingContacts).not.toHaveBeenCalled();
            });
        });
    });

    describe("Feature: noteColumns", () => {
        let projectreportconfig: ap.models.reports.ProjectReportConfig;
        let accessRight: ap.models.accessRights.PointReportAccessRight;
        beforeEach(() => {
            projectreportconfig = new ap.models.reports.ProjectReportConfig(Utility);

            spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake(function (moduleCode) {
                if (moduleCode === ap.models.licensing.Module.Module_PrintColumns)
                    return true;
                if (moduleCode === ap.models.licensing.Module.Module_MeetingManagement) {
                    return true;
                }
                else
                    return false;
            });

            accessRight = new ap.models.accessRights.PointReportAccessRight(Utility);

            reportConfigViewModel = new ap.viewmodels.reports.MeetingReportConfigViewModel(Utility, MainController, accessRight, ReportController, MeetingController);
            reportConfigViewModel.init(projectreportconfig);
        });
        describe("WHEN hasAttendies is true", () => {
            beforeEach(() => {
                reportConfigViewModel.hasAttendees = true;
                let columnsViewModel = new ap.viewmodels.reports.ColumnsViewModel(Utility, null, null);
                reportConfigViewModel.participantColumns = columnsViewModel;
            });
            it("THEN, noteColumn's drag&drop is true", () => {
                expect(reportConfigViewModel.participantColumns.dragOptions.isEnabled).toBeTruthy();
            });
        });
        describe("WHEN hasAttendies is false", () => {
            beforeEach(() => {
                reportConfigViewModel.hasAttendees = false;
                let columnsViewModel = new ap.viewmodels.reports.ColumnsViewModel(Utility, null, null);
                reportConfigViewModel.participantColumns = columnsViewModel;
            });
            it("THEN, noteColumn's drag&drop is disabled", () => {
                expect(reportConfigViewModel.participantColumns.dragOptions.isEnabled).toBeFalsy();
            });
        });
    });
});