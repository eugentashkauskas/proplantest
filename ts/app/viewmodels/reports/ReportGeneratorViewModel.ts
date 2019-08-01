module ap.viewmodels.reports {

    /**
    * Enum to define which points should be printed:
    *   - All (all points of the list)
    *   - Selected (only the selected points of the list)
    */
    export enum ReportPointToPrintType {
        All,
        Selected
    }

    /**
    * Enum to know which type of action is performed with the report.
    *   - Preview (preview of the report)
    *   - Generated (the report is generated and saved in the report folder)
    *   - Send (the report is generated and sent to the selected participants)
    */
    export enum ReportGeneratorResponse {
        Preview,
        Generate,
        Send,
        OpenSystemSaveTemplate,
        OpenCustomSaveTemplate,
        CloseSaveTemplate
    }
    /**
    * To known the current step of the report generator process
    **/
    export enum ReportGeneratorStep {
        Configuration,
        SendByMail
    }

    export class ReportGeneratorViewModel implements utility.IListener, IDispose {

        /**
         * If the report is generated for a meeting, this is the meeting for which the report is generated
         **/
        public get meeting(): ap.models.meetings.Meeting {
            return this._meeting;
        }

        public get reportConfig(): ReportConfigViewModel {
            return this._reportConfig;
        }

        /**
        * The name of the new template
        **/
        public get newTemplateName(): string {
            return this._newTemplateName;
        }

        public set newTemplateName(name: string) {
            this._newTemplateName = name;
        }

        /**
       * The choice of the user about create a new template or override it
       **/
        public get templateSavingChoice(): string {
            return this._templateSavingChoice;
        }

        public set templateSavingChoice(choice: string) {
            this._templateSavingChoice = choice;
        }

        public get isSaveButtonDisable(): boolean {
            if (!this.templateSelector || !this.templateSelector.selectedViewModel) return true;
            else if ((<ap.models.reports.ReportConfigBase>this.templateSelector.selectedViewModel.originalEntity).IsSystem) {
                return StringHelper.isNullOrEmpty(this.newTemplateName);
            } else if (this.templateSavingChoice === "create") {
                return StringHelper.isNullOrEmpty(this.newTemplateName);
            } else if (this.templateSavingChoice === "override") {
                return false;
            } else {
                return true;
            }
        }

        /**
        * The SendReportViewModel to send the report by mail
        **/
        public get sendReportViewModel(): SendReportViewModel {
            return this._sendReportViewModel;
        }

        /**
        * Work around: add the dummy setter without implementation to bind with the md-chips
        **/
        public set sendReportViewModel(val: SendReportViewModel) {
        }
        /**
        * The option of point to print make by the user
        **/
        public get pointToPrintType(): ReportPointToPrintType {
            return this._pointToPrintType;
        }

        public set pointToPrintType(value: ReportPointToPrintType) {
            this._pointToPrintType = value;
        }
        /**
        * To show the option of point to print : All points or Selected points
        **/
        public get pointToPrintValues(): ReportPointToPrintType[] {
            return this._pointToPrintValues;
        }

        /**
        * To show the list of report template and allow select the template for print
        **/
        public get templateSelector(): ap.viewmodels.reports.ReportTemplateListViewModel {
            return this._templateSelector;
        }

        /**
        * To know if the report config is meeting type or not
        * Used in _DisplayOptions.cshtml
        **/
        public get isMeetingReportConfig(): boolean {
            return this._isMeetingReportConfig;
        }

        /**
        * To show the list of language for print the report
        **/
        public get languageSelector(): ap.viewmodels.identificationfiles.languages.LanguageListViewModel {
            return this._languageSelector;
        }

        /**
        * To know that can save the report or not
        **/
        public get canSave(): boolean {
            return this._reportConfig.canSave() && ((this.isIndividualReport && this.canGenerateIndividualReport) || !this.isIndividualReport);
        }

        /**
        * To generate the report per user incharge
        **/
        public get isIndividualReport(): boolean {
            return this._reportConfig.isIndividualReport;
        }

        public set isIndividualReport(val: boolean) {
            if (!this.hasGenerateByUserInChargeAccess)
                throw new Error("Cannot access to generate report by user incharge");
            this._reportConfig.isIndividualReport = val;

            this.checkCanGenerateIndividualReport();
        }

        /**
        * To know if a report per user in charge can be generated
        **/
        public get canGenerateIndividualReport(): boolean {
            return this._canGenerateIndividualReport;
        }

        public set canGenerateIndividualReport(newValue: boolean) {
            this._canGenerateIndividualReport = newValue;
        }

        /**
        * To know the user has the access to generate report by user incharge
        **/
        public get hasGenerateByUserInChargeAccess(): boolean {
            return this._accessRight && this._accessRight !== null && this._accessRight.hasGenerateByUserInCharge;
        }

        /**
       * To access access right set of curent user on report fucntion
       **/
        public get accessRight(): ap.models.accessRights.PointReportAccessRight {
            return this._accessRight;
        }

        /**
        * To known if the user can go to the settings to send the report by mail
        **/
        public get canGoToSendByMail(): boolean {
            return this.canSave;
        }

        /**
        * To known can send the report or not
        **/
        public get canSend(): boolean {
            return this.canSave && this._sendReportViewModel !== null
                && this._sendReportViewModel.maySend;
        }
        /**
        * To know the current step of the ReportGeneratorViewModel
        **/
        public get step(): ReportGeneratorStep {
            return this._step;
        }

        /**
        * Used to know if the template can be deleted or not
        **/
        public get canDeleteTemplate(): boolean {
            return this._canDeleteTemplate;
        }

        /**
        * The title of the dialog
        **/
        public get title(): string {
            if (this._step === ReportGeneratorStep.Configuration)
                return this.$utility.Translator.getTranslation("Generate report");
            return this.$utility.Translator.getTranslation("Send report by mail");
        }

        /**
         * This property to know if the current config can be saved
         */
        public get canSaveTemplate(): boolean {
            return this._reportConfig.canSave();
        }

        /**
        * This method is to go to the second step of the configuration of report.
        **/
        goToMailConfig() {
            if (!this.canGoToSendByMail) {
                throw new Error("Can not go to send mail step");
            }

            this._step = ReportGeneratorStep.SendByMail;

            if (this._sendReportViewModel === null) {
                this._sendReportViewModel = new SendReportViewModel(this.$utility, this._api, this.$q, this.projectController, this.reportController, this.mainController, this.$servicesManager.contactService);
            }

            let usercommentids: string[] = this._selectedCommentIds;
            if (this.mainController && this.mainController.multiActions) {
                usercommentids = this.mainController.multiActions.itemsChecked;
            }
            if (this._pointToPrintType === ReportPointToPrintType.All) {
                usercommentids = this._allCommentIds;
            }

            this._reportConfig.initSendReportViewModel(this._sendReportViewModel, usercommentids, this._pointToPrintType === ReportPointToPrintType.All);
        }

        /**
        * This method is to go back to the configuration step of the report
        **/
        goBackToConfig() {
            this._step = ReportGeneratorStep.Configuration;
        }

        /**
        * This method is used to send the report
        **/
        sendByMail() {
            let self = this;
            if (this.isIndividualReport) {
                this.checkIndividualReportBeforeSave(ReportGeneratorResponse.Send).then(() => {
                    self.reportConfig.postChanges();
                    self.$mdDialog.hide(ReportGeneratorResponse.Send);
                });
            }
            else {
                self.reportConfig.postChanges();
                self.$mdDialog.hide(ReportGeneratorResponse.Send);
            }

        }

        /**
        * Method use to delete the selected template
        **/
        public deleteTemplate() {
            this.reportController.deleteReportTemplate(<ap.models.reports.ReportConfigBase>this.templateSelector.selectedViewModel.originalEntity);
        }

        /**
        * Use to raise event to open save template popup
        **/
        public saveTemplateRequest() {
            if ((<ap.models.reports.ReportConfigBase>this.templateSelector.selectedViewModel.originalEntity).IsSystem) {
                this._listener.raise("savesystemtemplatepopupopened");
            } else {
                this._listener.raise("savecustomtemplatepopupopened");
            }
        }

        /**
        * Use to save the template
        **/
        public saveTemplate() {
            let newTemplate: any;
            let config: ap.models.reports.ReportConfigBase = <ap.models.reports.ReportConfigBase>this.templateSelector.selectedViewModel.originalEntity;
            // Need to get the changes made by the user
            this.reportConfig.postChanges();

            if (config.IsSystem) {
                this.templateSavingChoice = null;
            }

            // Need to know if it is a meeting or project template
            if (config instanceof ap.models.reports.MeetingReportTemplate) {
                newTemplate = new ap.models.reports.MeetingReportTemplate(this.$utility);
            } else {
                newTemplate = new ap.models.reports.ProjectReportTemplate(this.$utility);
            }

            // Copy the user's config
            newTemplate.copyFrom(this.reportConfig.originalEntity, true);
            newTemplate.User = this.$utility.UserContext.CurrentUser();

            // If it is a new template need to set the new name
            if (config.IsSystem || this.templateSavingChoice === "create") {
                newTemplate.Name = this.newTemplateName;
            }

            // send Segment.IO event
            this.$servicesManager.toolService.sendEvent("cli-action-save report template", new Dictionary([new KeyValue("cli-action-save report template-screenname", this._isMeetingReportConfig ? "lists" : "projects")]));

            this.reportController.createReportTemplate(newTemplate, this.templateSavingChoice, config).then((result: ap.models.reports.ReportConfigBase) => {
                let item: ap.viewmodels.reports.ReportConfigItemViewModel = new ap.viewmodels.reports.ReportConfigItemViewModel(this.$utility);
                item.init(result);
                // Add the new template to the list
                this.templateSelector.sourceItems.push(item);
                // Select the new template
                this.templateSelector.selectedViewModel = item;
                this._newTemplateName = "";
                this._listener.raise("savetemplatepopupclosed", this);
            });
        }

        /**
        * This method is used to generate the report
        **/
        generate() {
            let self = this;
            if (this.isMeetingReportConfig) {
                this.$utility.Storage.Local.set("selectedmeetingreporttemplate", this.templateSelector.selectedViewModel.originalEntity.Id);
            } else {
                this.$utility.Storage.Local.set("selectedprojectreporttemplate", this.templateSelector.selectedViewModel.originalEntity.Id);
            }

            if (this.isIndividualReport) {
                this.checkIndividualReportBeforeSave(ReportGeneratorResponse.Generate).then(() => {
                    self.reportConfig.postChanges();
                    self.$mdDialog.hide(ReportGeneratorResponse.Generate);
                });
            }
            else {
                self.reportConfig.postChanges();
                self.$mdDialog.hide(ReportGeneratorResponse.Generate);
            }
        }

        /**
        * This method is used to preview the report
        **/
        preview() {
            let self = this;
            if (this.isIndividualReport) {
                this.checkIndividualReportBeforeSave(ReportGeneratorResponse.Preview).then(() => {
                    self.reportConfig.postChanges();
                    self._listener.raise("previewrequested", this);
                });
            }
            else {
                self.reportConfig.postChanges();
                self._listener.raise("previewrequested", this);
            }
        }

        /**
        * This method is used to download the excel file of the report
        **/
        downloadExcel() {
            this.reportConfig.postChanges();

            // send Segment.IO event
            this.$servicesManager.toolService.sendEvent("cli-action-download report excel", new Dictionary([new KeyValue("cli-action-download report excel-screenname", this._isMeetingReportConfig ? "lists" : "projects")]));

            this._listener.raise("downloadexcelrequested", this);
        }
        /**
        * This method is used to download the original plans of the report
        **/
        downloadoriginalPlans() {
            this.reportConfig.postChanges();

            // send Segment.IO event
            this.$servicesManager.toolService.sendEvent("cli-action-download report PDF", new Dictionary([new KeyValue("cli-action-download report PDF-screenname", this._isMeetingReportConfig ? "lists" : "projects")]));

            this._listener.raise("downloadoriginalplansrequested", this);
        }

        /**
        * This method is used to cancel the report template saving
        **/
        cancelSavingTemplate() {
            this._newTemplateName = "";
            this._listener.raise("savetemplatepopupclosed", this);
        }

        /**
        * This method is used to cancel the report creation
        **/
        cancel() {
            this.$mdDialog.cancel();
        }

        /**
        * This method is used to hide the report creation
        **/
        hide() {
            this.$mdDialog.hide();
        }

        /**
        * This method is used to get the display of the ReportPointToPrintType regarding to the language
        * @param reportPointToPrintType is the ReportPointToPrintType need to get the display text
        **/
        getPointToPrintTypeDisplay(reportPointToPrintType: ReportPointToPrintType): string {
            return this.$utility.Translator.getTranslation("app.report.ReportPointToPrintType_" + ReportPointToPrintType[reportPointToPrintType]);
        }

        /**
        * This method is used to check that can selected the ReportPointToPrintType
        * When ReportPointToPrintType == All -> return true
        * When ReportPointToPrintType == Selected -> return true if _isNoPointSelected == false
        * @param reportPointToPrintType is the ReportPointToPrintType need to check
        **/
        canSelectPointPrintType(reportPointToPrintType: ReportPointToPrintType): boolean {
            if (reportPointToPrintType === ReportPointToPrintType.All)
                return true;
            if (this._isNoPointSelected)
                return false;
            return true;
        }
        /**
        * This method is called when the select template have been changed
        * @param item is the current selected template
        **/
        private onSelectedTemplateChanged(item: ap.viewmodels.reports.ReportConfigItemViewModel) {
            if (item && item !== null) {
                this._reportConfig.setTemplate(item.reportconfig);
                if (!item.reportconfig.IsSystem) {
                    this._canDeleteTemplate = true;
                } else {
                    this._canDeleteTemplate = false;
                }
            }
        }

        /**
        * Method use to select the next available template
        **/
        public selectNextTemplate() {
            let index: number;
            for (let i = 0; i < this.templateSelector.sourceItems.length; i++) {
                if (this.templateSelector.sourceItems[i].isSelected) {
                    index = i;
                }
            }
            if (this.templateSelector.sourceItems.length - 1 <= index) {
                this.onSelectedTemplateChanged(<ap.viewmodels.reports.ReportConfigItemViewModel>this.templateSelector.sourceItems[index - 1]);
                this.templateSelector.selectedViewModel = this.templateSelector.sourceItems[index - 1];
                this.templateSelector.sourceItems.splice(index, 1);
            } else {
                this.onSelectedTemplateChanged(<ap.viewmodels.reports.ReportConfigItemViewModel>this.templateSelector.sourceItems[index + 1]);
                this.templateSelector.selectedViewModel = this.templateSelector.sourceItems[index + 1];
                this.templateSelector.sourceItems.splice(index, 1);
            }
        }

        /**
        * Check if an individual report can be generated
        */
        private checkCanGenerateIndividualReport() {
            if (this._pointToPrintType === ReportPointToPrintType.Selected) {
                this.canGenerateIndividualReport = this._selectedCommentIds.length > 0;
            }
            else {
                this.canGenerateIndividualReport = this._allCommentIds.length > 0;
            }
        }

        /**
        * This method is used to check can save/send report when is individual report
        * @param action is the current action (Preview, Generate, Send)
        **/
        private checkIndividualReportBeforeSave(action: ReportGeneratorResponse): angular.IPromise<any> {
            let self = this;
            let deferred = this.$q.defer();
            if (this.isIndividualReport) {
                let pointsNoIncharge: number = undefined;
                let userCommentIds: string[] = null;
                if (this._pointToPrintType === ReportPointToPrintType.Selected) {
                    userCommentIds = this._selectedCommentIds;
                    pointsNoIncharge = this._numberEmptyInchargePointForSelectedIds;
                }
                else {
                    userCommentIds = this._allCommentIds;
                    pointsNoIncharge = this._numberEmptyInchargePointForAllIds;
                }
                if (pointsNoIncharge === undefined) {
                    if (!userCommentIds || userCommentIds.length === 0) {
                        let title: string = self.$utility.Translator.getTranslation("app.err.report_incharge_no_point_title");
                        let message: string = self.$utility.Translator.getTranslation("app.err.report_incharge_no_point_msg");
                        self.mainController.showMessage(message, title, null);
                        deferred.reject();
                    } else {
                        this.reportController.emptyUserInChargeFromReportCount(userCommentIds).then((result) => {
                            if (self._pointToPrintType === ReportPointToPrintType.Selected)
                                self._numberEmptyInchargePointForSelectedIds = result;
                            else
                                self._numberEmptyInchargePointForAllIds = result;
                            self.processPointsNoIncharge(result, userCommentIds.length, action, deferred);
                        }, (error) => {
                            deferred.reject();
                        });

                    }
                }
                else {
                    self.processPointsNoIncharge(pointsNoIncharge, userCommentIds.length, action, deferred);
                }
            }
            else
                deferred.resolve();

            return deferred.promise;
        }
        /**
        * This method is used to process the message if have points no user incharge for individual report
        * @param pointsNoIncharge is number of point have no in charge
        * @param numberSelectedPoint is number of points for print report
        * @param action is the current action
        * @param deferred is the defer of the action promise
        **/
        private processPointsNoIncharge(pointsNoIncharge: number, numberSelectedPoint: number, action: ReportGeneratorResponse, deferred: any) {
            let self = this;
            let title: string = self.$utility.Translator.getTranslation("app.report_individualreport_no_userincharge_title");
            let message: string = self.$utility.Translator.getTranslation("app.report_individualreport_no_userincharge_message");
            if (pointsNoIncharge >= numberSelectedPoint) {
                self.mainController.showMessage(message, title, null);
                deferred.reject();
            }
            else if (pointsNoIncharge > 0 && action !== ReportGeneratorResponse.Preview) {
                if (action === ReportGeneratorResponse.Generate)
                    message = self.$utility.Translator.getTranslation("app.report_save_individualreport_confirm_message").format(pointsNoIncharge.toString());
                else
                    message = self.$utility.Translator.getTranslation("app.report_send_individualreport_confirm_message").format(pointsNoIncharge.toString());

                self.mainController.showConfirm(message, title, (confirm) => {
                    if (confirm === ap.controllers.MessageResult.Positive)
                        deferred.resolve();
                    else
                        deferred.reject();
                });
            }
            else {
                deferred.resolve();
            }
        }

        public dispose() {
            this._listener.clear();
            this.reportController.off("templatedeleted", this.selectNextTemplate, this);
            if (this.templateSelector) {
                this.templateSelector.dispose();
                this._templateSelector = null;
            }
            if (this._languageSelector) {
                this._languageSelector.dispose();
                this._languageSelector = null;
            }
        }

        on(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.on(eventName, callback, caller);
        }
        off(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.off(eventName, callback, caller);
        }

        constructor(private $scope: ng.IScope, private $utility: ap.utility.UtilityHelper, private $q: angular.IQService, private $mdDialog: angular.material.IDialogService, private $timeout: angular.ITimeoutService,
            private _api: ap.services.apiHelper.Api, private reportController: ap.controllers.ReportController, private mainController: ap.controllers.MainController, private meetingController: ap.controllers.MeetingController, private projectController: ap.controllers.ProjectController, private $servicesManager: ap.services.ServicesManager,
            private _selectedCommentIds: string[], private _allCommentIds: string[], private _accessRight: ap.models.accessRights.PointReportAccessRight,
            pointToPrintType: ReportPointToPrintType = ReportPointToPrintType.All, isNoPointSelected: boolean = false, meeting: ap.models.meetings.Meeting = null) {

            this._eventHelper = this.$utility.EventTool;
            this._listener = this._eventHelper.implementsListener(["previewrequested", "downloadexcelrequested", "downloadoriginalplansrequested", "savetemplatepopupclosed", "savesystemtemplatepopupopened", "savecustomtemplatepopupopened"]);
            this.reportController.on("templatedeleted", this.selectNextTemplate, this);
            this._step = ReportGeneratorStep.Configuration;
            this._isNoPointSelected = isNoPointSelected;
            if (meeting === null)
                meeting = this.mainController.currentMeeting;

            this._meeting = meeting;
            let loadMeetingTemplate: boolean = false;
            if (meeting && meeting !== null && !meeting.IsSystem) {
                this._reportConfig = new ap.viewmodels.reports.MeetingReportConfigViewModel($utility, this.mainController, this._accessRight, this.reportController, this.meetingController);
                this._isMeetingReportConfig = true;
                let projectCode = this.mainController.currentProject().Code;
                if (projectCode.length > 100) {
                    projectCode = projectCode.slice(0, 100);
                }
                let meetingTitle = meeting.Title;
                if (meetingTitle.length > 100) {
                    meetingTitle = meetingTitle.slice(0, 100);
                }
                this._reportConfig.reportTitles.searchText = projectCode + " - " + meetingTitle + " - N°" + meeting.Occurrence;
                loadMeetingTemplate = true;
            } else {
                this._reportConfig = new ap.viewmodels.reports.ReportConfigViewModel($utility, this.mainController, this._accessRight, this.reportController);
            }
            this._pointToPrintType = pointToPrintType;
            this._pointToPrintValues = [];
            this._pointToPrintValues.push(ReportPointToPrintType.All);
            this._pointToPrintValues.push(ReportPointToPrintType.Selected);
            this._templateSelector = new ap.viewmodels.reports.ReportTemplateListViewModel(this.$utility, this.$q, this.reportController);
            this.templateSelector.on("selectedItemChanged", this.onSelectedTemplateChanged, this);
            let reportIdtoSelect: string;
            if (this.isMeetingReportConfig) {
                reportIdtoSelect = this.$utility.Storage.Local.get("selectedmeetingreporttemplate");
            } else {
                reportIdtoSelect = this.$utility.Storage.Local.get("selectedprojectreporttemplate");
            }
            this.templateSelector.load(reportIdtoSelect, loadMeetingTemplate);

            this._languageSelector = new ap.viewmodels.identificationfiles.languages.LanguageListViewModel(this.$utility, this.$q, this.mainController);
            this._languageSelector.selectByCode(this.$utility.UserContext.LanguageCode());

            this.checkCanGenerateIndividualReport();
        }

        private _meeting: ap.models.meetings.Meeting;
        private _reportConfig: ReportConfigViewModel = null;
        private _isMeetingReportConfig: boolean = false;
        private _pointToPrintType: ReportPointToPrintType = ReportPointToPrintType.All;
        private _pointToPrintValues: ReportPointToPrintType[] = null;
        private _templateSelector: ap.viewmodels.reports.ReportTemplateListViewModel = null;
        private _languageSelector: ap.viewmodels.identificationfiles.languages.LanguageListViewModel = null;
        protected _listener: ap.utility.IListenerBuilder;
        protected _eventHelper: ap.utility.EventHelper;
        private _isNoPointSelected: boolean = false;
        private _step: ReportGeneratorStep = ReportGeneratorStep.Configuration;
        private _sendReportViewModel: SendReportViewModel = null;
        private _numberEmptyInchargePointForSelectedIds: number = undefined;
        private _numberEmptyInchargePointForAllIds: number = undefined;
        private _canDeleteTemplate: boolean = false;
        private _newTemplateName: string = null;
        private _templateSavingChoice: string = null;
        private _canGenerateIndividualReport: boolean;
    }
}