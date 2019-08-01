describe("Module ap-viewmodels - ReportGenerator", () => {
    let nmp = ap.viewmodels.reports;
    let MainController: ap.controllers.MainController, Utility: ap.utility.UtilityHelper, Api: ap.services.apiHelper.Api, UserContext: ap.utility.UserContext, ReportController: ap.controllers.ReportController;
    let $controller: angular.IControllerService, $rootScope: angular.IRootScopeService, $scope: angular.IScope, _deferred: angular.IDeferred<ap.services.apiHelper.ApiResponse>, $q: angular.IQService, $timeout: angular.ITimeoutService;
    let $mdDialog: angular.material.IDialogService;
    let MeetingController: ap.controllers.MeetingController;
    let ProjectController: ap.controllers.ProjectController;
    let ServicesManager: ap.services.ServicesManager;

    let reportGeneratorViewModel: ap.viewmodels.reports.ReportGeneratorViewModel = null;
    let selectedCommentIds: string[];
    let allCommentIds: string[];

    beforeEach(() => {
        let $window = specHelper.createWindowStub();
        $window.navigator.userLanguage = undefined;
        $window.navigator.language = 'en_US';
        angular.mock.module(function ($provide) {
            $provide.value('$window', $window);
            $provide.value('$mdDialog', $mdDialog);
        });
    });

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");

        angular.mock.module(function ($provide) {
            $provide.factory('$mdDialog', ["$q", function ($q) {
                return specHelper.utility.stubShowMdDialog($q);
            }]);
        });
    });

    beforeEach(inject(function (_$rootScope_, _$q_, _$timeout_, _UserContext_, _Utility_, _Api_, _MainController_, _ReportController_, _$controller_, _$mdDialog_, _MeetingController_, _ProjectController_, _ServicesManager_) {
        MainController = _MainController_;
        ReportController = _ReportController_;
        MeetingController = _MeetingController_;
        ProjectController = _ProjectController_;
        ServicesManager = _ServicesManager_;
        Utility = _Utility_;
        UserContext = _UserContext_;
        $mdDialog = _$mdDialog_;
        Api = _Api_;
        $q = _$q_;
        $rootScope = _$rootScope_;
        $timeout = _$timeout_;
        _deferred = $q.defer();
        $controller = _$controller_;
        $scope = $rootScope.$new();
        specHelper.utility.stubRootUrl(Utility);
        specHelper.userContext.stub(Utility);
        Utility.Storage.Session.clear();
        specHelper.utility.stubStorageSet(Utility);

        spyOn(Utility.Translator, "getTranslation").and.callFake(function (key) {
            if (key === "app.report.ReportPointToPrintType_All")
                return "All points";
            if (key === "app.report.ReportPointToPrintType_Selected")
                return "Selected points";
            if (key === "Generate report")
                return "Generate report";
            if (key === "Send report by mail")
                return "Send report by mail";
            if (key === "app.report_individualreport_no_userincharge_title")
                return "No users in charge";
            if (key === "app.report_individualreport_no_userincharge_message")
                return "The report cannot be created because there are no users in charge of points for the selected points.";
            if (key === "app.report_save_individualreport_confirm_message")
                return "{0} don't have users in charge. Therefore, they won't be included in the report. Do you want to save the report anyway?";
            if (key === "app.report_send_individualreport_confirm_message")
                return "{0} don't have users in charge. Therefore, they won't be included in the report. Do you want to send the report anyway?";

        });
        spyOn(MainController, "currentProject").and.returnValue(
            {
                Id: "b360cb6d-ca54-4b93-a564-a469274eb68a",
                Name: "Welcome Project",
                Code: "PR1"
            }
        );

        selectedCommentIds = [];
        selectedCommentIds.push("C1");

        allCommentIds = [];
        allCommentIds.push("C1");
        allCommentIds.push("C3");
        allCommentIds.push("C3");
        let deferTitles = $q.defer();
        spyOn(ReportController, "getReportTitleHistory").and.returnValue(deferTitles.promise);
        deferTitles.resolve(["test", "test2"])
    }));

    // spy Segment.IO calls
    beforeEach(() => {
        spyOn(ServicesManager.toolService, "sendEvent").and.returnValue($q.defer().promise);
    });

    let createVm = (selectedCommentIds: string[], allCommentIds: string[], accessRight: ap.models.accessRights.PointReportAccessRight,
        pointToPrintType: ap.viewmodels.reports.ReportPointToPrintType = ap.viewmodels.reports.ReportPointToPrintType.All, isNoPointSelected: boolean = false, meeting: ap.models.meetings.Meeting = null) => {
        return new ap.viewmodels.reports.ReportGeneratorViewModel($scope, Utility, $q, $mdDialog, $timeout, Api, ReportController, MainController, MeetingController, ProjectController, ServicesManager, selectedCommentIds, allCommentIds, accessRight, pointToPrintType, isNoPointSelected);
    };

    describe("Feature Constructor", () => {

        beforeEach(() => {
            spyOn(ap.viewmodels.reports.ReportTemplateListViewModel.prototype, "load");
            spyOn(ap.viewmodels.identificationfiles.languages.LanguageListViewModel.prototype, "selectByCode");
        });

        describe("WHEN the ReportGeneratorViewModel is created for entire project", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get).and.returnValue(null);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get);
            });

            it("THEN I can get an instance of ReportGeneratorViewModel", () => {
                reportGeneratorViewModel = createVm(selectedCommentIds, allCommentIds, null);
                expect(reportGeneratorViewModel).toBeDefined();
            });
            it("AND default values are fill correctly", () => {
                let reportAccessRight = new ap.models.accessRights.PointReportAccessRight(Utility);
                reportGeneratorViewModel = createVm(selectedCommentIds, allCommentIds, reportAccessRight);
                expect(reportGeneratorViewModel.reportConfig).toBeDefined();
                expect(reportGeneratorViewModel.templateSelector).toBeDefined();
                expect(reportGeneratorViewModel.languageSelector).toBeDefined();
                expect(reportGeneratorViewModel.pointToPrintType).toEqual(nmp.ReportPointToPrintType.All);
                expect(reportGeneratorViewModel.pointToPrintValues.length).toEqual(2);
                expect(reportGeneratorViewModel.canSave).toBeFalsy();
                expect(reportGeneratorViewModel.accessRight).toBeDefined();
            });

            it("AND templateSelector.load method will called with isMeetingReport = false", () => {
                reportGeneratorViewModel = createVm(selectedCommentIds, allCommentIds, null);
                expect(ap.viewmodels.reports.ReportTemplateListViewModel.prototype.load).toHaveBeenCalledWith(null, false);
            });

            it("AND, languageSelector.selectByCode method will called", () => {
                reportGeneratorViewModel = createVm(selectedCommentIds, allCommentIds, null);
                expect(ap.viewmodels.identificationfiles.languages.LanguageListViewModel.prototype.selectByCode).toHaveBeenCalledWith(Utility.UserContext.LanguageCode());
            });
        });

        describe("WHEN the currentMeeting === null", () => {
            beforeEach(() => {
                reportGeneratorViewModel = createVm(selectedCommentIds, allCommentIds, null);
            });
            it("THEN the reportConfig is a ReportConfigViewModel", () => {
                expect(reportGeneratorViewModel.reportConfig instanceof ap.viewmodels.reports.ReportConfigViewModel).toBeTruthy();
            });
            it("THEN the method isMeetingReportConfig return false", () => {
                expect(reportGeneratorViewModel.isMeetingReportConfig).toEqual(false);
            });
        });

        describe("WHEN the currentMeeting is defined", () => {
            let currentMeeting: ap.models.meetings.Meeting;
            beforeEach(() => {
                currentMeeting = new ap.models.meetings.Meeting(Utility);
                currentMeeting.IsSystem = false;
                currentMeeting.Title = "meetingTitle"
                specHelper.general.spyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get).and.returnValue(currentMeeting);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get);
            });
            it("THEN the reportConfig is a MeetingReportConfigViewModel", () => {
                reportGeneratorViewModel = createVm(selectedCommentIds, allCommentIds, null);

                expect(reportGeneratorViewModel.reportConfig instanceof ap.viewmodels.reports.MeetingReportConfigViewModel).toBeTruthy();
            });
            it("THEN the method isMeetingReportConfig return true", () => {
                reportGeneratorViewModel = createVm(selectedCommentIds, allCommentIds, null);
                expect(reportGeneratorViewModel.isMeetingReportConfig).toEqual(true);
            });
        });

        describe("WHEN the ReportGeneratorViewModel is created for the system meeting", () => {
            beforeEach(() => {
                let currentMeeting: ap.models.meetings.Meeting = new ap.models.meetings.Meeting(Utility);
                currentMeeting.IsSystem = true;
                specHelper.general.spyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get).and.returnValue(currentMeeting);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get);
            });

            it("THEN templateSelector.load method will called with isMeetingReport = false", () => {
                reportGeneratorViewModel = createVm(selectedCommentIds, allCommentIds, null);
                expect(ap.viewmodels.reports.ReportTemplateListViewModel.prototype.load).toHaveBeenCalledWith(null, false);
            });
        });

        describe("WHEN the ReportGeneratorViewModel is created for the not system meeting", () => {
            beforeEach(() => {
                let currentMeeting: ap.models.meetings.Meeting = new ap.models.meetings.Meeting(Utility);
                currentMeeting.IsSystem = false;
                currentMeeting.Occurrence = 1;
                currentMeeting.Title = "Meeting 1";
                specHelper.general.spyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get).and.returnValue(currentMeeting);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get);
            });

            it("THEN templateSelector.load method will called with isMeetingReport = true", () => {
                reportGeneratorViewModel = createVm(selectedCommentIds, allCommentIds, null);
                expect(ap.viewmodels.reports.ReportTemplateListViewModel.prototype.load).toHaveBeenCalledWith(null, true);
            });
            it("AND the default title will be fill", () => {
                reportGeneratorViewModel = createVm(selectedCommentIds, allCommentIds, null);
                expect(reportGeneratorViewModel.reportConfig.reportTitles.searchText).toEqual("PR1" + " - " + "Meeting 1" + " - N°1");
            });
        });
    });

    describe("Feature canSave", () => {
        let hasNoteList: boolean;
        let hasNoteDetail: boolean;
        describe("When reportConfig can save", () => {
            beforeEach(() => {

                spyOn(ap.viewmodels.reports.ReportTemplateListViewModel.prototype, "load");
                reportGeneratorViewModel = createVm(selectedCommentIds, allCommentIds, null);
                spyOn(reportGeneratorViewModel.reportConfig, "canSave").and.returnValue(true);

            });

            it("THEN canSave = true", () => {
                expect(reportGeneratorViewModel.canSave).toBeTruthy();
            });
        });

        describe("When reportConfig can NOT save", () => {
            beforeEach(() => {

                spyOn(ap.viewmodels.reports.ReportTemplateListViewModel.prototype, "load");
                reportGeneratorViewModel = createVm(selectedCommentIds, allCommentIds, null);
                spyOn(reportGeneratorViewModel.reportConfig, "canSave").and.returnValue(false);

            });

            it("THEN canSave = false", () => {
                expect(reportGeneratorViewModel.canSave).toBeFalsy();
            });
        });
    });

    describe("Feature onSelectedTemplateChanged", () => {
        describe("WHEN the 'selectedItemChanged' event was fired from the templateSelector", () => {
            beforeEach(() => {
                spyOn(ap.viewmodels.reports.ReportTemplateListViewModel.prototype, "load");
                reportGeneratorViewModel = createVm(selectedCommentIds, allCommentIds, null);
                spyOn(reportGeneratorViewModel.reportConfig, "setTemplate");
            });
            it("THEN, the reportConfig.setTemplate method will called if the selected template is defined", () => {
                let entity = new ap.models.reports.ProjectReportTemplate(Utility);
                entity.createByJson({ Id: "1" });
                let viewModel = new ap.viewmodels.reports.ReportConfigItemViewModel(Utility);
                viewModel.init(entity);
                specHelper.general.raiseEvent(reportGeneratorViewModel.templateSelector, "selectedItemChanged", viewModel);
                expect(reportGeneratorViewModel.reportConfig.setTemplate).toHaveBeenCalledWith(entity);

            });
            it("THEN, the reportConfig.setTemplate method will not called if the selected template is null", () => {
                specHelper.general.raiseEvent(reportGeneratorViewModel.templateSelector, "selectedItemChanged", null);
                expect(reportGeneratorViewModel.reportConfig.setTemplate).not.toHaveBeenCalled();
            });
        });
    });

    describe("Feature getPointToPrintTypeDisplay method", () => {
        describe("WHEN getPointToPrintTypeDisplay method is called with the ReportPointToPrintType", () => {
            beforeEach(() => {
                spyOn(ap.viewmodels.reports.ReportTemplateListViewModel.prototype, "load");
                reportGeneratorViewModel = createVm(selectedCommentIds, allCommentIds, null);
            });
            it("THEN return the correct value when call with ReportPointToPrintType.All", () => {
                let result: string = reportGeneratorViewModel.getPointToPrintTypeDisplay(ap.viewmodels.reports.ReportPointToPrintType.All);
                expect(Utility.Translator.getTranslation).toHaveBeenCalledWith("app.report.ReportPointToPrintType_All");
                expect(result).toEqual("All points");
            });
            it("THEN return the correct value when call with ReportPointToPrintType.Selected", () => {
                let result: string = reportGeneratorViewModel.getPointToPrintTypeDisplay(ap.viewmodels.reports.ReportPointToPrintType.Selected);
                expect(Utility.Translator.getTranslation).toHaveBeenCalledWith("app.report.ReportPointToPrintType_Selected");
                expect(result).toEqual("Selected points");
            });
        });
    });

    describe("Feature canSelectPointPrintType", () => {
        beforeEach(() => {
            spyOn(ap.viewmodels.reports.ReportTemplateListViewModel.prototype, "load");
        });
        describe("WHEN the vm was init with isNoPointSelected = true", () => {
            beforeEach(() => {
                reportGeneratorViewModel = createVm(selectedCommentIds, allCommentIds, null, ap.viewmodels.reports.ReportPointToPrintType.All, true);
            });
            it("THEN, canSelectPointPrintType return true with 'All'", () => {
                expect(reportGeneratorViewModel.canSelectPointPrintType(ap.viewmodels.reports.ReportPointToPrintType.All)).toBeTruthy();
            });
            it("AND, canSelectPointPrintType return false with 'Selected'", () => {
                expect(reportGeneratorViewModel.canSelectPointPrintType(ap.viewmodels.reports.ReportPointToPrintType.Selected)).toBeFalsy();
            });
        });
        describe("WHEN the vm was init with isNoPointSelected = false", () => {
            beforeEach(() => {
                reportGeneratorViewModel = createVm(selectedCommentIds, allCommentIds, null, ap.viewmodels.reports.ReportPointToPrintType.All, false);
            });
            it("THEN, canSelectPointPrintType always return true", () => {
                expect(reportGeneratorViewModel.canSelectPointPrintType(ap.viewmodels.reports.ReportPointToPrintType.All)).toBeTruthy();
                expect(reportGeneratorViewModel.canSelectPointPrintType(ap.viewmodels.reports.ReportPointToPrintType.Selected)).toBeTruthy();
            });
        });
    });

    describe("Feature generate method", () => {
        beforeEach(() => {
            spyOn(ap.viewmodels.reports.ReportTemplateListViewModel.prototype, "load");
            spyOn(ap.viewmodels.identificationfiles.languages.LanguageListViewModel.prototype, "selectByCode");
            specHelper.general.spyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get).and.returnValue({ originalEntity: { Id: "123" } });
        });
        afterEach(() => {
            specHelper.general.offSpyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get)
        });
        describe("WHEN the generate method is called and isIndividualReport = false", () => {
            beforeEach(() => {
                reportGeneratorViewModel = createVm(selectedCommentIds, allCommentIds, null);

                spyOn(reportGeneratorViewModel.reportConfig, "postChanges").and.callFake(() => { });
                reportGeneratorViewModel.generate();
            });
            it("THEN reportConfig.postChanges have been called", () => {
                expect(reportGeneratorViewModel.reportConfig.postChanges).toHaveBeenCalled();
            });
            it("THEN mdDialog.hide method will be called with value ReportGeneratorResponse.Generate", () => {
                expect($mdDialog.hide).toHaveBeenCalledWith(nmp.ReportGeneratorResponse.Generate);
            });
        });

        describe("WHEN the generate method is called and isIndividualReport = true", () => {
            let deferredEmptyUserIncharge;

            beforeEach(() => {
                deferredEmptyUserIncharge = $q.defer();

                specHelper.general.spyProperty(ap.viewmodels.reports.ReportGeneratorViewModel.prototype, "hasGenerateByUserInChargeAccess", specHelper.PropertyAccessor.Get).and.returnValue(true);
                reportGeneratorViewModel = createVm(selectedCommentIds, allCommentIds, null);
                reportGeneratorViewModel.isIndividualReport = true;
                spyOn(ReportController, "emptyUserInChargeFromReportCount").and.returnValue(deferredEmptyUserIncharge.promise);
                spyOn(reportGeneratorViewModel.reportConfig, "postChanges").and.callFake(() => { });

                spyOn(MainController, "showMessage");
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.reports.ReportGeneratorViewModel.prototype, "hasGenerateByUserInChargeAccess", specHelper.PropertyAccessor.Get);
            });

            it("THEN reportController.emptyUserInChargeFromReportCount have been called with list selected ids if pointToPrintType = 'Selected'", () => {
                reportGeneratorViewModel.pointToPrintType = ap.viewmodels.reports.ReportPointToPrintType.Selected;
                reportGeneratorViewModel.generate();
                expect(ReportController.emptyUserInChargeFromReportCount).toHaveBeenCalledWith(selectedCommentIds);
            });

            it("THEN reportController.emptyUserInChargeFromReportCount have been called with list selected ids if pointToPrintType = 'All'", () => {
                reportGeneratorViewModel.pointToPrintType = ap.viewmodels.reports.ReportPointToPrintType.All;
                reportGeneratorViewModel.generate();
                expect(ReportController.emptyUserInChargeFromReportCount).toHaveBeenCalledWith(allCommentIds);
            });

            it("THEN if the result >= selectedCommentIds, the message will show to the user and the postchange method is not called", () => {
                reportGeneratorViewModel.pointToPrintType = ap.viewmodels.reports.ReportPointToPrintType.All;
                reportGeneratorViewModel.generate();
                deferredEmptyUserIncharge.resolve(4);
                $rootScope.$apply();
                expect(MainController.showMessage).toHaveBeenCalledWith("The report cannot be created because there are no users in charge of points for the selected points.", "No users in charge", null);
                expect(reportGeneratorViewModel.reportConfig.postChanges).not.toHaveBeenCalled();
            });

            it("THEN if the result = 0, reportConfig.postChanges, mdDialog.hide have been called", () => {
                reportGeneratorViewModel.pointToPrintType = ap.viewmodels.reports.ReportPointToPrintType.All;
                reportGeneratorViewModel.generate();
                deferredEmptyUserIncharge.resolve(0);
                $rootScope.$apply();
                expect(reportGeneratorViewModel.reportConfig.postChanges).toHaveBeenCalled();
                expect($mdDialog.hide).toHaveBeenCalledWith(nmp.ReportGeneratorResponse.Generate);
            });

            it("THEN if the result > 0, the confirm message show to the user", () => {
                spyOn(MainController, "showConfirm");
                reportGeneratorViewModel.pointToPrintType = ap.viewmodels.reports.ReportPointToPrintType.All;
                reportGeneratorViewModel.generate();
                deferredEmptyUserIncharge.resolve(1);
                $rootScope.$apply();
                expect((<jasmine.Spy>MainController.showConfirm).calls.count()).toEqual(1);
                expect((<jasmine.Spy>MainController.showConfirm).calls.argsFor(0)[0]).toEqual("1 don't have users in charge. Therefore, they won't be included in the report. Do you want to save the report anyway?");
                expect((<jasmine.Spy>MainController.showConfirm).calls.argsFor(0)[1]).toEqual("No users in charge");
            });

            it("THEN if the user select 'Ok', reportConfig.postChanges, mdDialog.hide have been called", () => {
                spyOn(MainController, "showConfirm").and.callFake(function (message, title, callback) {
                    callback(ap.controllers.MessageResult.Positive);
                });
                reportGeneratorViewModel.pointToPrintType = ap.viewmodels.reports.ReportPointToPrintType.All;
                reportGeneratorViewModel.generate();
                deferredEmptyUserIncharge.resolve(1);
                $rootScope.$apply();

                expect(reportGeneratorViewModel.reportConfig.postChanges).toHaveBeenCalled();
                expect($mdDialog.hide).toHaveBeenCalledWith(nmp.ReportGeneratorResponse.Generate);
            });

            it("THEN if the user select 'Cancel', reportConfig.postChanges, mdDialog.hide have not called", () => {
                spyOn(MainController, "showConfirm").and.callFake(function (message, title, callback) {
                    callback(ap.controllers.MessageResult.Negative);
                });
                reportGeneratorViewModel.pointToPrintType = ap.viewmodels.reports.ReportPointToPrintType.All;
                reportGeneratorViewModel.generate();
                deferredEmptyUserIncharge.resolve(1);
                $rootScope.$apply();

                expect(reportGeneratorViewModel.reportConfig.postChanges).not.toHaveBeenCalled();
                expect($mdDialog.hide).not.toHaveBeenCalled();
            });
        });
    });

    describe("Feature preview method", () => {
        let callback: jasmine.Spy;
        beforeEach(() => {
            spyOn(ap.viewmodels.reports.ReportTemplateListViewModel.prototype, "load");
            spyOn(ap.viewmodels.identificationfiles.languages.LanguageListViewModel.prototype, "selectByCode");
            callback = jasmine.createSpy("callback");
            reportGeneratorViewModel = createVm(selectedCommentIds, allCommentIds, null);
            reportGeneratorViewModel.on("previewrequested", function () {
                callback();
            }, this);
        });

        describe("WHEN the preview method is called", () => {

            beforeEach(() => {
                spyOn(reportGeneratorViewModel.reportConfig, "postChanges").and.callFake(() => { });
                reportGeneratorViewModel.preview();
            });
            it("THEN reportConfig.postChanges have been called", () => {
                expect(reportGeneratorViewModel.reportConfig.postChanges).toHaveBeenCalled();
            });
            it("THEN the 'previewrequested' will be fire", () => {
                expect(callback).toHaveBeenCalled();
            });
        });

        describe("WHEN the preview method is called and isIndividualReport = true", () => {
            let deferredEmptyUserIncharge;

            beforeEach(() => {
                deferredEmptyUserIncharge = $q.defer();
                specHelper.general.spyProperty(ap.viewmodels.reports.ReportGeneratorViewModel.prototype, "hasGenerateByUserInChargeAccess", specHelper.PropertyAccessor.Get).and.returnValue(true);

                reportGeneratorViewModel.isIndividualReport = true;

                spyOn(ReportController, "emptyUserInChargeFromReportCount").and.returnValue(deferredEmptyUserIncharge.promise);
                spyOn(reportGeneratorViewModel.reportConfig, "postChanges").and.callFake(() => { });
                spyOn(MainController, "showMessage");

            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.reports.ReportGeneratorViewModel.prototype, "hasGenerateByUserInChargeAccess", specHelper.PropertyAccessor.Get);
            });

            it("THEN reportController.emptyUserInChargeFromReportCount have been called with list selected ids if pointToPrintType = 'Selected'", () => {
                reportGeneratorViewModel.pointToPrintType = ap.viewmodels.reports.ReportPointToPrintType.Selected;
                reportGeneratorViewModel.preview();
                expect(ReportController.emptyUserInChargeFromReportCount).toHaveBeenCalledWith(selectedCommentIds);
            });

            it("THEN reportController.emptyUserInChargeFromReportCount have been called with list selected ids if pointToPrintType = 'All'", () => {
                reportGeneratorViewModel.pointToPrintType = ap.viewmodels.reports.ReportPointToPrintType.All;
                reportGeneratorViewModel.preview();
                expect(ReportController.emptyUserInChargeFromReportCount).toHaveBeenCalledWith(allCommentIds);
            });

            it("THEN if the result >= selectedCommentIds, the message will show to the user and the postchange method is not called", () => {
                reportGeneratorViewModel.pointToPrintType = ap.viewmodels.reports.ReportPointToPrintType.All;
                reportGeneratorViewModel.preview();
                deferredEmptyUserIncharge.resolve(4);
                $rootScope.$apply();
                expect(MainController.showMessage).toHaveBeenCalledWith("The report cannot be created because there are no users in charge of points for the selected points.", "No users in charge", null);
                expect(reportGeneratorViewModel.reportConfig.postChanges).not.toHaveBeenCalled();
            });

            it("THEN if the result >= 0, reportConfig.postChanges, the 'previewrequested' will be fire", () => {
                reportGeneratorViewModel.pointToPrintType = ap.viewmodels.reports.ReportPointToPrintType.All;
                reportGeneratorViewModel.preview();
                deferredEmptyUserIncharge.resolve(1);
                $rootScope.$apply();
                expect(reportGeneratorViewModel.reportConfig.postChanges).toHaveBeenCalled();
                expect(callback).toHaveBeenCalled();
            });
        });
    });

    describe("Feature cancel method", () => {
        describe("WHEN the cancel method is called", () => {
            it("THEN the mdDialog.cancel method will be called", () => {
                reportGeneratorViewModel = createVm(selectedCommentIds, allCommentIds, null);
                reportGeneratorViewModel.cancel();
                expect($mdDialog.cancel).toHaveBeenCalled();
            });
        });
    });

    describe("Feature hide method", () => {
        describe("WHEN the hide method is called", () => {
            it("THEN the mdDialog.hide method will be called with undefined", () => {
                reportGeneratorViewModel = createVm(selectedCommentIds, allCommentIds, null);
                reportGeneratorViewModel.hide();
                expect($mdDialog.hide).toHaveBeenCalled();
            });
        });
    });

    describe("Feature: Destroy", () => {

        beforeEach(() => {
            reportGeneratorViewModel = createVm(selectedCommentIds, allCommentIds, null);

            reportGeneratorViewModel.dispose();
        });

        describe("WHEN detroy is called", () => {
            it("THEN, templateSelector is null", () => {
                expect(reportGeneratorViewModel.templateSelector).toBeNull();
            });

            it("THEN, the languageSelector is null", () => {
                expect(reportGeneratorViewModel.languageSelector).toBeNull();
            });
        });
    });

    describe("Feature: hasGenerateByUserInCharge", () => {
        beforeEach(() => {
            let accessRight: ap.models.accessRights.PointReportAccessRight = new ap.models.accessRights.PointReportAccessRight(Utility);
            reportGeneratorViewModel = createVm(selectedCommentIds, allCommentIds, accessRight, ap.viewmodels.reports.ReportPointToPrintType.All, true);
        });
        it("hasGenerateByUserInCharge = true when accessRight.hasGenerateByUserInCharge = true", () => {
            specHelper.general.spyProperty(ap.models.accessRights.PointReportAccessRight.prototype, "hasGenerateByUserInCharge", specHelper.PropertyAccessor.Get).and.returnValue(true);
            expect(reportGeneratorViewModel.hasGenerateByUserInChargeAccess).toBeTruthy();
            specHelper.general.offSpyProperty(ap.models.accessRights.PointReportAccessRight.prototype, "hasGenerateByUserInCharge", specHelper.PropertyAccessor.Get);
        });
        it("hasGenerateByUserInCharge = false when accessRight.hasGenerateByUserInCharge = false", () => {
            specHelper.general.spyProperty(ap.models.accessRights.PointReportAccessRight.prototype, "hasGenerateByUserInCharge", specHelper.PropertyAccessor.Get).and.returnValue(false);
            expect(reportGeneratorViewModel.hasGenerateByUserInChargeAccess).toBeFalsy();
            specHelper.general.offSpyProperty(ap.models.accessRights.PointReportAccessRight.prototype, "hasGenerateByUserInCharge", specHelper.PropertyAccessor.Get);
        });
    });

    describe("Feature: isIndividualReport setter", () => {
        beforeEach(() => {
            reportGeneratorViewModel = createVm(selectedCommentIds, allCommentIds, null, ap.viewmodels.reports.ReportPointToPrintType.All, true);
        });
        it("Will throw error when the user can not access GenerateByUserInCharge", () => {
            specHelper.general.spyProperty(ap.viewmodels.reports.ReportGeneratorViewModel.prototype, "hasGenerateByUserInChargeAccess", specHelper.PropertyAccessor.Get).and.returnValue(false);
            expect(function () { reportGeneratorViewModel.isIndividualReport = true; }).toThrowError("Cannot access to generate report by user incharge");
            specHelper.general.offSpyProperty(ap.viewmodels.reports.ReportGeneratorViewModel.prototype, "hasGenerateByUserInChargeAccess", specHelper.PropertyAccessor.Get);
        });
        it("Will set correct when the user can access GenerateByUserInCharge", () => {
            specHelper.general.spyProperty(ap.viewmodels.reports.ReportGeneratorViewModel.prototype, "hasGenerateByUserInChargeAccess", specHelper.PropertyAccessor.Get).and.returnValue(true);
            reportGeneratorViewModel.isIndividualReport = true;
            expect(reportGeneratorViewModel.isIndividualReport).toBeTruthy();
            expect(reportGeneratorViewModel.reportConfig.isIndividualReport).toBeTruthy();
            specHelper.general.offSpyProperty(ap.viewmodels.reports.ReportGeneratorViewModel.prototype, "hasGenerateByUserInChargeAccess", specHelper.PropertyAccessor.Get);
        });
    });

    describe("Feature: canGoToSendByMail", () => {
        beforeEach(() => {
            spyOn(ap.viewmodels.reports.ReportTemplateListViewModel.prototype, "load");
            reportGeneratorViewModel = createVm(selectedCommentIds, allCommentIds, null);
        });
        it("canGoToSendByMail return true when canSave = true", () => {
            specHelper.general.spyProperty(ap.viewmodels.reports.ReportGeneratorViewModel.prototype, "canSave", specHelper.PropertyAccessor.Get).and.returnValue(true);
            expect(reportGeneratorViewModel.canGoToSendByMail).toBeTruthy();
            specHelper.general.offSpyProperty(ap.viewmodels.reports.ReportGeneratorViewModel.prototype, "canSave", specHelper.PropertyAccessor.Get);
        });
        it("canGoToSendByMail return false when canSave = false", () => {
            specHelper.general.spyProperty(ap.viewmodels.reports.ReportGeneratorViewModel.prototype, "canSave", specHelper.PropertyAccessor.Get).and.returnValue(false);
            expect(reportGeneratorViewModel.canGoToSendByMail).toBeFalsy();
            specHelper.general.offSpyProperty(ap.viewmodels.reports.ReportGeneratorViewModel.prototype, "canSave", specHelper.PropertyAccessor.Get);
        });
    });

    describe("Feature: goToMailConfig", () => {
        beforeEach(() => {
            spyOn(ap.viewmodels.reports.ReportTemplateListViewModel.prototype, "load");
            reportGeneratorViewModel = createVm(selectedCommentIds, allCommentIds, null);
        });
        describe("WHEN goToMailConfig called and canGoToSendByMail = false", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.viewmodels.reports.ReportGeneratorViewModel.prototype, "canGoToSendByMail", specHelper.PropertyAccessor.Get).and.returnValue(false);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.reports.ReportGeneratorViewModel.prototype, "canGoToSendByMail", specHelper.PropertyAccessor.Get);
            });
            it("THEN, the error will be throw", () => {
                expect(function () { reportGeneratorViewModel.goToMailConfig(); }).toThrowError("Can not go to send mail step");
            });
        });
        describe("WHEN goToMailConfig called and canGoToSendByMail = true", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.viewmodels.reports.ReportGeneratorViewModel.prototype, "canGoToSendByMail", specHelper.PropertyAccessor.Get).and.returnValue(true);
                spyOn(reportGeneratorViewModel.reportConfig, "initSendReportViewModel");

            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.reports.ReportGeneratorViewModel.prototype, "canGoToSendByMail", specHelper.PropertyAccessor.Get);
            });
            it("THEN, the step will become 'SendByMail'", () => {
                reportGeneratorViewModel.goToMailConfig();
                expect(reportGeneratorViewModel.step).toEqual(ap.viewmodels.reports.ReportGeneratorStep.SendByMail);
            });
            it("THEN, the SendReportViewModel will be init", () => {
                reportGeneratorViewModel.goToMailConfig();
                expect(reportGeneratorViewModel.sendReportViewModel).toBeDefined();
                expect(reportGeneratorViewModel.sendReportViewModel).not.toBeNull();
            });
            it("AND THEN, initSendReportViewModel will be called with selectedCommentIds if pointToPrintType = Selected", () => {
                reportGeneratorViewModel.pointToPrintType = ap.viewmodels.reports.ReportPointToPrintType.Selected;
                reportGeneratorViewModel.goToMailConfig();
                expect(reportGeneratorViewModel.reportConfig.initSendReportViewModel).toHaveBeenCalledWith(reportGeneratorViewModel.sendReportViewModel, selectedCommentIds, false);
            });
            it("AND THEN, initSendReportViewModel will be called with allCommentIds if pointToPrintType = All", () => {
                reportGeneratorViewModel.pointToPrintType = ap.viewmodels.reports.ReportPointToPrintType.All;
                reportGeneratorViewModel.goToMailConfig();
                expect(reportGeneratorViewModel.reportConfig.initSendReportViewModel).toHaveBeenCalledWith(reportGeneratorViewModel.sendReportViewModel, allCommentIds, true);
            });
        });
    });

    describe("Feature: goBackToConfig", () => {
        beforeEach(() => {
            spyOn(ap.viewmodels.reports.ReportTemplateListViewModel.prototype, "load");
            reportGeneratorViewModel = createVm(selectedCommentIds, allCommentIds, null);
        });
        describe("WHEN goBackToConfig called", () => {
            it("THEN, the step will become 'Configuration'", () => {
                reportGeneratorViewModel.goBackToConfig();
                expect(reportGeneratorViewModel.step).toEqual(ap.viewmodels.reports.ReportGeneratorStep.Configuration);
            });
        });

    });

    describe("Feature sendByMail", () => {
        beforeEach(() => {
            spyOn(ap.viewmodels.reports.ReportTemplateListViewModel.prototype, "load");
            spyOn(ap.viewmodels.identificationfiles.languages.LanguageListViewModel.prototype, "selectByCode");
        });
        describe("WHEN the sendByMail method is called", () => {
            beforeEach(() => {
                reportGeneratorViewModel = createVm(selectedCommentIds, allCommentIds, null);
                spyOn(reportGeneratorViewModel.reportConfig, "postChanges").and.callFake(() => { });
                reportGeneratorViewModel.sendByMail();
            });
            it("THEN reportConfig.postChanges have been called", () => {
                expect(reportGeneratorViewModel.reportConfig.postChanges).toHaveBeenCalled();
            });
            it("THEN mdDialog.hide method will be called with value ReportGeneratorResponse.Send", () => {
                expect($mdDialog.hide).toHaveBeenCalledWith(nmp.ReportGeneratorResponse.Send);
            });
        });
        describe("WHEN the sendByMail method is called and isIndividualReport = true", () => {
            let deferredEmptyUserIncharge;
            beforeEach(() => {
                deferredEmptyUserIncharge = $q.defer();
                specHelper.general.spyProperty(ap.viewmodels.reports.ReportGeneratorViewModel.prototype, "hasGenerateByUserInChargeAccess", specHelper.PropertyAccessor.Get).and.returnValue(true);
                reportGeneratorViewModel = createVm(selectedCommentIds, allCommentIds, null);
                reportGeneratorViewModel.isIndividualReport = true;

                spyOn(ReportController, "emptyUserInChargeFromReportCount").and.returnValue(deferredEmptyUserIncharge.promise);
                spyOn(reportGeneratorViewModel.reportConfig, "postChanges").and.callFake(() => { });

                spyOn(MainController, "showMessage");



            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.reports.ReportGeneratorViewModel.prototype, "hasGenerateByUserInChargeAccess", specHelper.PropertyAccessor.Get);
            });

            it("THEN reportController.emptyUserInChargeFromReportCount have been called with list selected ids if pointToPrintType = 'Selected'", () => {
                reportGeneratorViewModel.pointToPrintType = ap.viewmodels.reports.ReportPointToPrintType.Selected;
                reportGeneratorViewModel.sendByMail();
                expect(ReportController.emptyUserInChargeFromReportCount).toHaveBeenCalledWith(selectedCommentIds);
            });
            it("THEN reportController.emptyUserInChargeFromReportCount have been called with list selected ids if pointToPrintType = 'All'", () => {
                reportGeneratorViewModel.pointToPrintType = ap.viewmodels.reports.ReportPointToPrintType.All;
                reportGeneratorViewModel.sendByMail();
                expect(ReportController.emptyUserInChargeFromReportCount).toHaveBeenCalledWith(allCommentIds);
            });
            it("THEN if the result >= selectedCommentIds, the message will show to the user and the postchange method is not called", () => {
                reportGeneratorViewModel.pointToPrintType = ap.viewmodels.reports.ReportPointToPrintType.All;
                reportGeneratorViewModel.sendByMail();
                deferredEmptyUserIncharge.resolve(4);
                $rootScope.$apply();
                expect(MainController.showMessage).toHaveBeenCalledWith("The report cannot be created because there are no users in charge of points for the selected points.", "No users in charge", null);
                expect(reportGeneratorViewModel.reportConfig.postChanges).not.toHaveBeenCalled();
            });
            it("THEN if the result = 0, reportConfig.postChanges, mdDialog.hide have been called", () => {
                reportGeneratorViewModel.pointToPrintType = ap.viewmodels.reports.ReportPointToPrintType.All;
                reportGeneratorViewModel.sendByMail();
                deferredEmptyUserIncharge.resolve(0);
                $rootScope.$apply();
                expect(reportGeneratorViewModel.reportConfig.postChanges).toHaveBeenCalled();
                expect($mdDialog.hide).toHaveBeenCalledWith(nmp.ReportGeneratorResponse.Send);
            });
            it("THEN if the result > 0, the confirm message show to the user", () => {
                spyOn(MainController, "showConfirm");
                reportGeneratorViewModel.pointToPrintType = ap.viewmodels.reports.ReportPointToPrintType.All;
                reportGeneratorViewModel.sendByMail();
                deferredEmptyUserIncharge.resolve(1);
                $rootScope.$apply();
                expect((<jasmine.Spy>MainController.showConfirm).calls.count()).toEqual(1);
                expect((<jasmine.Spy>MainController.showConfirm).calls.argsFor(0)[0]).toEqual("1 don't have users in charge. Therefore, they won't be included in the report. Do you want to send the report anyway?");
                expect((<jasmine.Spy>MainController.showConfirm).calls.argsFor(0)[1]).toEqual("No users in charge");
            });
            it("THEN if the user select 'Ok', reportConfig.postChanges, mdDialog.hide have been called", () => {
                spyOn(MainController, "showConfirm").and.callFake(function (message, title, callback) {
                    callback(ap.controllers.MessageResult.Positive);
                });
                reportGeneratorViewModel.pointToPrintType = ap.viewmodels.reports.ReportPointToPrintType.All;
                reportGeneratorViewModel.sendByMail();
                deferredEmptyUserIncharge.resolve(1);
                $rootScope.$apply();

                expect(reportGeneratorViewModel.reportConfig.postChanges).toHaveBeenCalled();
                expect($mdDialog.hide).toHaveBeenCalledWith(nmp.ReportGeneratorResponse.Send);
            });
            it("THEN if the user select 'Cancel', reportConfig.postChanges, mdDialog.hide have not called", () => {
                spyOn(MainController, "showConfirm").and.callFake(function (message, title, callback) {
                    callback(ap.controllers.MessageResult.Negative);
                });
                reportGeneratorViewModel.pointToPrintType = ap.viewmodels.reports.ReportPointToPrintType.All;
                reportGeneratorViewModel.sendByMail();
                deferredEmptyUserIncharge.resolve(1);
                $rootScope.$apply();

                expect(reportGeneratorViewModel.reportConfig.postChanges).not.toHaveBeenCalled();
                expect($mdDialog.hide).not.toHaveBeenCalled();
            });

        });
    });

    describe("Feature canSend", () => {
        beforeEach(() => {
            spyOn(ap.viewmodels.reports.ReportTemplateListViewModel.prototype, "load");
            reportGeneratorViewModel = createVm(selectedCommentIds, allCommentIds, null);
            specHelper.general.spyProperty(ap.viewmodels.reports.ReportGeneratorViewModel.prototype, "canGoToSendByMail", specHelper.PropertyAccessor.Get).and.returnValue(true);
            spyOn(reportGeneratorViewModel.reportConfig, "initSendReportViewModel");
        });
        afterEach(() => {
            specHelper.general.offSpyProperty(ap.viewmodels.reports.ReportGeneratorViewModel.prototype, "canGoToSendByMail", specHelper.PropertyAccessor.Get);
        });
        it("canSend return false when canSave = false", () => {
            specHelper.general.spyProperty(ap.viewmodels.reports.ReportGeneratorViewModel.prototype, "canSave", specHelper.PropertyAccessor.Get).and.returnValue(false);
            expect(reportGeneratorViewModel.canSend).toBeFalsy();
            specHelper.general.offSpyProperty(ap.viewmodels.reports.ReportGeneratorViewModel.prototype, "canSave", specHelper.PropertyAccessor.Get);
        });
        it("canSend return false when sendReportViewModel is null", () => {
            specHelper.general.spyProperty(ap.viewmodels.reports.ReportGeneratorViewModel.prototype, "canSave", specHelper.PropertyAccessor.Get).and.returnValue(true);
            specHelper.general.spyProperty(ap.viewmodels.reports.ReportGeneratorViewModel.prototype, "sendReportViewModel", specHelper.PropertyAccessor.Get).and.returnValue(null);

            expect(reportGeneratorViewModel.canSend).toBeFalsy();

            specHelper.general.offSpyProperty(ap.viewmodels.reports.ReportGeneratorViewModel.prototype, "canSave", specHelper.PropertyAccessor.Get);
            specHelper.general.offSpyProperty(ap.viewmodels.reports.ReportGeneratorViewModel.prototype, "sendReportViewModel", specHelper.PropertyAccessor.Get);
        });
        it("canSend return false when sendReportViewModel.maySend = false", () => {
            reportGeneratorViewModel.goToMailConfig();

            specHelper.general.spyProperty(ap.viewmodels.reports.ReportGeneratorViewModel.prototype, "canSave", specHelper.PropertyAccessor.Get).and.returnValue(true);
            specHelper.general.spyProperty(ap.viewmodels.reports.SendReportViewModel.prototype, "maySend", specHelper.PropertyAccessor.Get).and.returnValue(false);

            expect(reportGeneratorViewModel.canSend).toBeFalsy();

            specHelper.general.offSpyProperty(ap.viewmodels.reports.ReportGeneratorViewModel.prototype, "canSave", specHelper.PropertyAccessor.Get);
            specHelper.general.offSpyProperty(ap.viewmodels.reports.SendReportViewModel.prototype, "maySend", specHelper.PropertyAccessor.Get);
        });
        it("canSend return true when canSave = true and sendReportViewModel.maySend = true", () => {
            reportGeneratorViewModel.goToMailConfig();

            specHelper.general.spyProperty(ap.viewmodels.reports.ReportGeneratorViewModel.prototype, "canSave", specHelper.PropertyAccessor.Get).and.returnValue(true);
            specHelper.general.spyProperty(ap.viewmodels.reports.SendReportViewModel.prototype, "maySend", specHelper.PropertyAccessor.Get).and.returnValue(true);

            expect(reportGeneratorViewModel.canSend).toBeTruthy();

            specHelper.general.offSpyProperty(ap.viewmodels.reports.ReportGeneratorViewModel.prototype, "canSave", specHelper.PropertyAccessor.Get);
            specHelper.general.offSpyProperty(ap.viewmodels.reports.SendReportViewModel.prototype, "maySend", specHelper.PropertyAccessor.Get);
        });
    });

    describe("Feature title", () => {
        beforeEach(() => {
            spyOn(ap.viewmodels.reports.ReportTemplateListViewModel.prototype, "load");
            reportGeneratorViewModel = createVm(selectedCommentIds, allCommentIds, null);
            specHelper.general.spyProperty(ap.viewmodels.reports.ReportGeneratorViewModel.prototype, "canGoToSendByMail", specHelper.PropertyAccessor.Get).and.returnValue(true);
            spyOn(reportGeneratorViewModel.reportConfig, "initSendReportViewModel");
        });
        afterEach(() => {
            specHelper.general.offSpyProperty(ap.viewmodels.reports.ReportGeneratorViewModel.prototype, "canGoToSendByMail", specHelper.PropertyAccessor.Get);
        });
        it("title = 'Generate report' when in Configuration step", () => {
            expect(reportGeneratorViewModel.title).toEqual("Generate report");
        });
        it("title = 'Send report by mail' when in SendByMail step", () => {
            reportGeneratorViewModel.goToMailConfig();
            expect(reportGeneratorViewModel.title).toEqual("Send report by mail");
        });
    });

    describe("Feature downloadExcel", () => {
        let callback: jasmine.Spy;
        beforeEach(() => {
            spyOn(ap.viewmodels.reports.ReportTemplateListViewModel.prototype, "load");
            spyOn(ap.viewmodels.identificationfiles.languages.LanguageListViewModel.prototype, "selectByCode");
            callback = jasmine.createSpy("callback");
            reportGeneratorViewModel = createVm(selectedCommentIds, allCommentIds, null);
            reportGeneratorViewModel.on("downloadexcelrequested", function () {
                callback();
            }, this);
        });
        describe("WHEN the downloadExcel method is called", () => {

            beforeEach(() => {
                spyOn(reportGeneratorViewModel.reportConfig, "postChanges").and.callFake(() => { });
                reportGeneratorViewModel.downloadExcel();
            });
            it("THEN reportConfig.postChanges have been called", () => {
                expect(reportGeneratorViewModel.reportConfig.postChanges).toHaveBeenCalled();
            });
            it("THEN the 'downloadexcelrequested' will be fire", () => {
                expect(callback).toHaveBeenCalled();
            });
        });
    });

    describe("Feature downloadoriginalPlans", () => {
        let callback: jasmine.Spy;
        beforeEach(() => {
            spyOn(ap.viewmodels.reports.ReportTemplateListViewModel.prototype, "load");
            spyOn(ap.viewmodels.identificationfiles.languages.LanguageListViewModel.prototype, "selectByCode");
            callback = jasmine.createSpy("callback");
            reportGeneratorViewModel = createVm(selectedCommentIds, allCommentIds, null);
            reportGeneratorViewModel.on("downloadoriginalplansrequested", function () {
                callback();
            }, this);
        });
        describe("WHEN the downloadoriginalPlans method is called", () => {

            beforeEach(() => {
                spyOn(reportGeneratorViewModel.reportConfig, "postChanges").and.callFake(() => { });
                reportGeneratorViewModel.downloadoriginalPlans();
            });
            it("THEN reportConfig.postChanges have been called", () => {
                expect(reportGeneratorViewModel.reportConfig.postChanges).toHaveBeenCalled();
            });
            it("THEN the 'downloadoriginalplansrequested' will be fire", () => {
                expect(callback).toHaveBeenCalled();
            });
        });
    });

    describe("Feature: canSaveTemplate", () => {
        beforeEach(() => {
            spyOn(ap.viewmodels.reports.ReportTemplateListViewModel.prototype, "load");
            reportGeneratorViewModel = createVm(selectedCommentIds, allCommentIds, null);
        });
        it("canSaveTemplate return true when canSave = true", () => {
            spyOn(reportGeneratorViewModel.reportConfig, "canSave").and.returnValue(true);
            expect(reportGeneratorViewModel.canSaveTemplate).toBeTruthy();
        });
        it("canSaveTemplate return false when canSave = false", () => {
            spyOn(reportGeneratorViewModel.reportConfig, "canSave").and.returnValue(false);
            expect(reportGeneratorViewModel.canSaveTemplate).toBeFalsy();
        });
    });

    describe("Feature: saveTemplate", () => {

        let reportConfigBase: ap.models.reports.ReportConfigBase;
        let reportConfigBase2: ap.models.reports.ReportConfigBase;

        beforeEach(() => {
            // spy this method called in copySource for ReportConfigViewModel
            spyOn(ReportController, "getReportColumnDefNote").and.returnValue($q.defer().promise);

            // Initialize the ViewModel
            spyOn(ap.viewmodels.reports.ReportTemplateListViewModel.prototype, "load");
            reportGeneratorViewModel = new ap.viewmodels.reports.ReportGeneratorViewModel($scope, Utility, $q, $mdDialog, $timeout, Api, ReportController, MainController, MeetingController, ProjectController, ServicesManager, selectedCommentIds, allCommentIds, null);

            // define a base configViewModel
            reportConfigBase = new ap.models.reports.ReportConfigBase(Utility);
            let reportConfigItemViewModel: ap.viewmodels.reports.ReportConfigItemViewModel = new ap.viewmodels.reports.ReportConfigItemViewModel(Utility);
            reportConfigItemViewModel.init(reportConfigBase);
            specHelper.general.spyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get).and.returnValue(reportConfigItemViewModel);

            spyOn(ReportController, "createReportTemplate").and.returnValue($q.defer().promise);

            // spy the reportConfig of the ViewModel
            let reportConfigViewModel: ap.viewmodels.reports.ReportConfigViewModel = new ap.viewmodels.reports.ReportConfigViewModel(Utility, MainController, new ap.models.accessRights.PointReportAccessRight(Utility), ReportController);
            reportConfigBase2 = new ap.models.reports.ReportConfigBase(Utility);
            reportConfigViewModel.init(reportConfigBase2);
            specHelper.general.spyProperty(ap.viewmodels.reports.ReportConfigViewModel.prototype, "isSortOptionsEnabled", specHelper.PropertyAccessor.Get).and.returnValue(false);
            specHelper.general.spyProperty(ap.viewmodels.reports.ReportGeneratorViewModel.prototype, "reportConfig", specHelper.PropertyAccessor.Get).and.returnValue(reportConfigViewModel);

            // spy groupAndSort called in postChanges
            let groupAndSortViewModel = new ap.viewmodels.reports.GroupAndSortViewModel(Utility, []);
            spyOn(groupAndSortViewModel, "postChanges");
            specHelper.general.spyProperty(ap.viewmodels.reports.ReportConfigViewModel.prototype, "groupAndSort", specHelper.PropertyAccessor.Get).and.returnValue(groupAndSortViewModel);

            reportGeneratorViewModel.templateSavingChoice = "xxx";
            reportGeneratorViewModel.saveTemplate();
        });

        afterEach(() => {
            specHelper.general.offSpyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get);
            specHelper.general.offSpyProperty(ap.viewmodels.reports.ReportGeneratorViewModel.prototype, "reportConfig", specHelper.PropertyAccessor.Get);
            specHelper.general.offSpyProperty(ap.viewmodels.reports.ReportConfigViewModel.prototype, "groupAndSort", specHelper.PropertyAccessor.Get);
            specHelper.general.offSpyProperty(ap.viewmodels.reports.ReportConfigViewModel.prototype, "isSortOptionsEnabled", specHelper.PropertyAccessor.Get);
        });

        describe("WHEN saveTemplate is called", () => {
            it("THEN, reportController.createReportTemplate is called with a new template created from the reportConfig, the saving choise and the config", () => {
                expect((<ap.models.reports.MeetingReportConfigBase>(<jasmine.Spy>ReportController.createReportTemplate).calls.argsFor(0)[0]).Id).toBe(reportConfigBase2.Id); // check that the id of the template is the id of the reportConfig
                expect((<jasmine.Spy>ReportController.createReportTemplate).calls.argsFor(0)[1]).toBe("xxx");
                expect((<jasmine.Spy>ReportController.createReportTemplate).calls.argsFor(0)[2]).toBe(reportConfigBase);
            });
        });
    });
});   