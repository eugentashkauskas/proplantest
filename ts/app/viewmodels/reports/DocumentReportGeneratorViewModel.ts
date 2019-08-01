module ap.viewmodels.reports {
    /**
    * Enum to define which documents should be printed:
    *   - All (all documents of the list)
    *   - Selected (only the selected documents of the list)
    */
    export enum ReportDocumentToPrintType {
        All,
        Selected
    }

    export class DocumentReportGeneratorViewModel implements utility.IListener, IDispose {

        /**
        * To know the current step of the ReportGeneratorViewModel
        **/
        public get step(): ReportGeneratorStep {
            return this._step;
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
        * The documentReportParams getter
        **/
        public get documentReportParams(): ap.misc.DocumentReportParams {
            return this._documentReportParams;
        }

        /**
        * The option of document to print make by the user
        **/
        public get documentToPrintType(): ReportDocumentToPrintType {
            return this._documentToPrintType;
        }

        public set documentToPrintType(value: ReportDocumentToPrintType) {
            this._documentToPrintType = value;
        }

        /**
        * To show the option of document to print : All documents or Selected documents
        **/
        public get documentToPrintValues(): ReportDocumentToPrintType[] {
            return this._documentToPrintValues;
        }

        /**
        * Get the content of addInfo
        **/
        public get addInfoContent(): string {
            return this._addInfoContent;
        }

        /**
        * Set the content of addInfo
        **/
        public set addInfoContent(s: string) {
            this._addInfoContent = s;
        }

        /**
        * Get title of the report
        **/
        public get title(): string {
            return this._title;
        }

        /**
        * Set title of the report
        **/
        public set title(title: string) {
            this._title = title;
        }

        /**
        * The title of step the dialog
        **/
        public get titleReportStep(): string {
            if (this._step === ReportGeneratorStep.Configuration)
                return this.utility.Translator.getTranslation("Generate report");
            return "Send report by mail";
        }

        /**
        * To known if the user can go to the settings to send the report by mail
        **/
        public get canGoToSendByMail(): boolean {
            return !StringHelper.isNullOrWhiteSpace(this._title) && this._title.length <= 255;
        }


        /**
        * To known if the user can go to the settings to send the report by mail
        **/
        public get canSave(): boolean {
            return !StringHelper.isNullOrWhiteSpace(this._title) && this._title.length <= 255;
        }

        /**
        * To known can send the report or not
        **/
        public get canSend(): boolean {
            return this.canSave && this._sendReportViewModel !== null
                && this._sendReportViewModel.maySend;
        }

        /**
        * This method is to go back to the configuration step of the report
        **/
        goBackToConfig() {
            this._step = ReportGeneratorStep.Configuration;
        }

        /**
        * This method is used to get the display of the ReportDocumentToPrintType regarding to the language
        * @param reportDocumentToPrintType is the ReportDocumentToPrintType need to get the display text
        **/
        getDocumentToPrintTypeDisplay(reportDocumentToPrintType: ReportDocumentToPrintType): string {
            return this.utility.Translator.getTranslation("app.report.ReportDocumentToPrintType_" + ReportDocumentToPrintType[reportDocumentToPrintType]);
        }

        /**
        * This method is used to check that can selected the ReportDocumentToPrintType
        * When ReportDocumentToPrintType == All -> return true
        * When ReportDocumentToPrintType == Selected -> return true if _isNoPointSelected == false
        * @param reportPointToPrintType is the ReportDocumentToPrintType need to check
        **/
        canSelectDocumentPrintType(reportPointToPrintType: ReportDocumentToPrintType): boolean {
            if (reportPointToPrintType === ReportDocumentToPrintType.All)
                return true;
            if (this._selectedDocumentsIds.length === 0)
                return false;
            return true;
        }

        /**
        * This method is to go to the second step of the configuration of report.
        **/
        goToMailConfig() {
            if (!this.canGoToSendByMail)
                throw new Error("Can not go to send mail step");
            this._step = ReportGeneratorStep.SendByMail;
            this.initSendReportViewModel();
        }

        /**
        * This method is used to cancel the report creation
        **/
        cancel() {
            this.$mdDialog.cancel();
        }

        /**
        * This method is used to preview the report
        **/
        preview() {
            if (!this.checkReportDocumentsValid()) {
                this.showErrorOfInvalidDocuments();
                return;
            }
            this.generateReport();
            this._listener.raise("documentreportrequested", "preview");
        }

        /**
        * This method is used to generate the report
        **/
        save() {
            if (!this.checkReportDocumentsValid()) {
                this.cancel();
                this.showErrorOfInvalidDocuments();
                return;
            }
            this.generateReport();
            this._listener.raise("documentreportrequested", "save");
            this.$mdDialog.hide();
        }

        /**
        * This method is used to send the report
        **/
        sendByMail() {
            if (!this.checkReportDocumentsValid()) {
                this.cancel();
                this.showErrorOfInvalidDocuments();
                return;
            }
            this.generateReport();
            this._sendReportViewModel.createNewContacts().then(() => {
                this._sendReportViewModel.initReportParams(this._documentReportParams);
                this._listener.raise("documentreportrequested", "send");
                this.$mdDialog.hide();
            });
        }

        /**
        * This method use for created documentReportParams
        **/
        private generateReport() {
            this._documentReportParams = new ap.misc.DocumentReportParams(this.utility);
            this._documentReportParams.AdditionalInformation = this._addInfoContent;
            this._documentReportParams.reportTitle = this._title;
            this._documentReportParams.languageCode = this.utility.UserContext.LanguageCode();
            this._documentReportParams.FolderId = this._folderId;
            if (this._documentToPrintType === ReportDocumentToPrintType.Selected) {
                this._documentReportParams.idsToPrint = this._selectedDocumentsIds;
            } else {
                this._documentReportParams.idsToPrint = [];
            }
        }

        /**
         * This method need for show error popup and close report generator popup
         */
        private showErrorOfInvalidDocuments() {
            this.mainController.showMessage(this.utility.Translator.getTranslation("app.report.document.error_message"), this.utility.Translator.getTranslation("app.report.document.error_title"), null, ap.controllers.MessageButtons.Ok);
        }

        /**
        * This method use for check validation documents
        **/
        private checkReportDocumentsValid(): boolean {
            let hasExcelOrReportDocuments: boolean = false;
            let itemsForCheck: ap.viewmodels.documents.DocumentItemViewModel[] = this._documentToPrintType === ReportDocumentToPrintType.Selected ? this._selectedDocuments : <ap.viewmodels.documents.DocumentItemViewModel[]>this._listDocuments.listVm.sourceItems;
            for (let i = 0; i < itemsForCheck.length; i++) {
                if (itemsForCheck[i] && itemsForCheck[i].originalDocument && (itemsForCheck[i].originalDocument.FileType === ap.models.documents.FileType.Unknown || itemsForCheck[i].originalDocument.IsReport)) {
                    hasExcelOrReportDocuments = true;
                    break;
                }
            }
            return !hasExcelOrReportDocuments;
        }

        /**
        * This method use for created SendReportViewModel
        **/
        private initSendReportViewModel() {
            if (this._sendReportViewModel === null)
                this._sendReportViewModel = new SendReportViewModel(this.utility, this._api, this.$q, this.projectController, this.reportController, this.mainController, this.contactService);
            this._sendReportViewModel.subject = this._title;
            this._sendReportViewModel.pdfName = this._title + ".pdf";
            let currentUser: ap.models.actors.User = <ap.models.actors.User>this.utility.UserContext.CurrentUser();
            this._sendReportViewModel.body = this.utility.Translator.getTranslation("app.report.document_send_message").format(this._sendReportViewModel.subject, currentUser.DisplayName);
            this._sendReportViewModel.recipientsSelector.initUsers([currentUser]);
        }

        public dispose() {
            this._listener.clear();
        }

        on(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.on(eventName, callback, caller);
        }
        off(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.off(eventName, callback, caller);
        }

        constructor(private $scope: ng.IScope, private utility: ap.utility.UtilityHelper, private $q: angular.IQService, private $mdDialog: angular.material.IDialogService, private $timeout: angular.ITimeoutService, private _api: ap.services.apiHelper.Api, private reportController: ap.controllers.ReportController, private mainController: ap.controllers.MainController, private projectController: ap.controllers.ProjectController, private contactService: ap.services.ContactService, private _listDocuments: ap.viewmodels.documents.DocumentListViewModel) {
            this._eventHelper = this.utility.EventTool;
            this._listener = this._eventHelper.implementsListener(["documentreportrequested"]);
            this._selectedDocuments = <ap.viewmodels.documents.DocumentItemViewModel[]>this._listDocuments.listVm.getCheckedItems();
            this._selectedDocuments.forEach(item => { this._selectedDocumentsIds.push((<ap.viewmodels.documents.DocumentItemViewModel>item).originalDocument.Id); });
            this._folderId = this._listDocuments.folder.Id;
            this._documentToPrintType = this._selectedDocumentsIds.length > 0 ? ReportDocumentToPrintType.Selected : ReportDocumentToPrintType.All;
            this._documentToPrintValues = [];
            this._documentToPrintValues.push(ReportDocumentToPrintType.All);
            this._documentToPrintValues.push(ReportDocumentToPrintType.Selected);
        }

        private _selectedDocuments: ap.viewmodels.documents.DocumentItemViewModel[];
        private _selectedDocumentsIds: string[] = [];
        private _folderId: string;

        private _listener: ap.utility.IListenerBuilder;
        private _eventHelper: ap.utility.EventHelper;
        private _sendReportViewModel: SendReportViewModel = null;
        private _step: ReportGeneratorStep = ReportGeneratorStep.Configuration;
        private _documentToPrintType: ReportDocumentToPrintType = ReportDocumentToPrintType.All;
        private _documentToPrintValues: ReportDocumentToPrintType[] = null;
        private _documentReportParams: ap.misc.DocumentReportParams = null;
        private _addInfoContent: string = "";
        private _title: string = null;
    }
}