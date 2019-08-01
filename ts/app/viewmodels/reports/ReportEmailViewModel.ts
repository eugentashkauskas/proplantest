module ap.viewmodels.reports {

    export class ReportEmailViewModel implements IDispose {

        /**
        * Returns true if the report can be send
        **/
        private get canSend() {
            return this._sendReportViewModel.recipientsSelector.selectedContacts.length > 0;
        }

        /**
        * SendReportViewModel property
        **/
        private get sendReportViewModel() {
            return this._sendReportViewModel;
        }

        private set sendReportViewModel(sendReportViewModel: ap.viewmodels.reports.SendReportByEmailViewModel) {
            this._sendReportViewModel = sendReportViewModel;
        }

        /**
        * This method is used to cancel the report creation
        **/
        cancel() {
            this.$mdDialog.cancel();
        }

        /**
        * This method is used to send the report
        **/
        sendByMail() {
            this._sendReportViewModel.createNewContacts().then((contactsCreated) => {
                let sendReportParams = this.getSendReportParams();
                this._controllerManager.reportController.sendReport(sendReportParams, this._documentItemVm.name, this.$mdDialog.cancel);
            });

            // send event to Segment.IO
            this._serviceManager.toolService.sendEvent("cli-action-share report", new Dictionary([new KeyValue("cli-action-share report-screenname", "documents")]));
        }

        /**
        * @implements Implementation of IDispose interface
        */
        public dispose() {
            if (this._sendReportViewModel) {
                this._sendReportViewModel.dispose();
                this._sendReportViewModel = null;
            }
        }

        private getSendReportParams(): ap.misc.SendReportParams {
            let sendReportParams = new ap.misc.SendReportParams(this.utility);
            sendReportParams.languageCode = this.utility.UserContext.LanguageCode();
            sendReportParams.versionPhysicalFolderId = this._documentItemVm.originalDocument.PhysicalFolderId;
            sendReportParams.recipientIds = [];
            this._sendReportViewModel.recipientsSelector.selectedContacts.forEach((item: ap.viewmodels.projects.ContactItemViewModel) => {
                sendReportParams.recipientIds.push(item.userId);
            });
            sendReportParams.mailSubject = this._sendReportViewModel.subject;
            sendReportParams.mailBody = this._sendReportViewModel.body;
            return sendReportParams;
        }

        constructor(private $scope: ng.IScope, private utility: ap.utility.UtilityHelper, private _api: ap.services.apiHelper.Api, private $q: angular.IQService,
            private $mdDialog: angular.material.IDialogService, private _documentItemVm: ap.viewmodels.documents.DocumentItemViewModel, private _controllerManager: ap.controllers.ControllersManager, private _serviceManager: ap.services.ServicesManager) {

            this._sendReportViewModel = new ap.viewmodels.reports.SendReportByEmailViewModel(this.utility, this._api, this.$q, this._controllerManager.projectController,
                this._controllerManager.reportController, this._controllerManager.mainController, this._serviceManager.contactService);

            this.sendReportViewModel.subject = _documentItemVm.name;
            let userCreatedReport = this._documentItemVm.originalDocument.Author;
            this._sendReportViewModel.recipientsSelector.initUsers([userCreatedReport]);
            this._sendReportViewModel.body = this.utility.Translator.getTranslation("app.report.default_mail_body").format("", this.utility.UserContext.CurrentUser().DisplayName);

            $scope.$on("$destroy", () => {
                this.dispose();
            });
        }

        private _sendReportViewModel: ap.viewmodels.reports.SendReportByEmailViewModel;
    }
}