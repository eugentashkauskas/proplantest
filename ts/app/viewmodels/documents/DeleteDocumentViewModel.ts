module ap.viewmodels.documents {

    /**
    * This class is the ViewModel of the confirmation popup to delete a document.
    */
    export class DeleteDocumentViewModel {

        /**
        * Public getter to the documentItemViewModel
        */
        public get docInfo(): ap.models.accessRights.DocumentAccessRight {
            return this._docInfo;
        }

        /**
        * Public property to know if the delete action is enabled or not in the view
        */
        public get canDelete(): boolean {
            let result: boolean = false;

            result = this.deleteOption === ap.controllers.DeleteDocumentOptions.Entire || this.deleteOption === ap.controllers.DeleteDocumentOptions.LastVersion ||
                (this.deleteOption === ap.controllers.DeleteDocumentOptions.Version && !!this.availableVersions && !!this.availableVersions.selectedViewModel);

            return result;
        }

        /**
        * Public getter to know if a document has several versions
        */
        public get hasSeveralVersions(): boolean {
            return this._docInfo.document.VersionCount > 0;
        }

        /**
        * Public getter to know if the current user can only delete the document and not some versions
        */
        public get canOnlyDeleteDoc(): boolean {
            let result: boolean = true;

            result = !this.isReport && this.hasSeveralVersions && this._docInfo.canDeleteDoc && !this._docInfo.canDeleteVersion;

            return result;
        }

        /**
        * Public getter to know if a user can delete a report's version
        */
        public get canDeleteReportVersion(): boolean {
            return this.isReport;
        }

        /**
        * Public getter to access the available delete options
        */
        public get deleteOptions(): ap.controllers.DeleteDocumentOptions[] {
            return this._deleteOptions;
        }

        /**
        * Public getter to have the selected delete option
        */
        public get deleteOption(): ap.controllers.DeleteDocumentOptions {
            return this._deleteOption;
        }

        /**
        * Public getter to the versions collection
        */
        public get availableVersions(): ap.viewmodels.ListEntityViewModel {
            return this._availableVersions;
        }

        /**
        * Public getter to know if the current document is a report
        */
        public get isReport(): boolean {
            return this._docInfo.document.IsReport;
        }

        /**
        * Public setter to set delete option value
        */
        public set deleteOption(newValue: ap.controllers.DeleteDocumentOptions) {
            this._deleteOption = newValue;

            if (this._deleteOption === ap.controllers.DeleteDocumentOptions.Version && this.isReport) {
                // the admin can delete any version of a report.  The others, only the versions they created
                this.loadVersions(this._docInfo.project.UserAccessRight.Level !== ap.models.accessRights.AccessRightLevel.Admin);
            } else {
                if (this._availableVersions) {
                    this._availableVersions.onLoadItems(null);
                }
            }
        }

        /**
        * Private method to load the available versions of a document a user can delete
        * @param onlyCreateByUser boolean Parameter to know if we load all the version of a document or only the ones created by the user
        */
        private loadVersions(onlyCreatedByUser: boolean) {
            let self = this;
            this._documentController.getVersions(this._docInfo.document, onlyCreatedByUser).then((apiResponse: ap.services.apiHelper.ApiResponse) => {
                self.initVersionsCollection(<ap.models.documents.Version[]>apiResponse.data);
            });
        }

        /**
        * Private method to initialize the versions collection.
        * @param versions Version[] The versions entities used to initialized the collection
        */
        private initVersionsCollection(versions: ap.models.documents.Version[]) {
            this._availableVersions = new ap.viewmodels.ListEntityViewModel(this.utility, "Version", null, null, null);

            let items: ap.viewmodels.documents.VersionItemViewModel[] = [];
            versions.forEach((version) => {
                let versionVm: ap.viewmodels.documents.VersionItemViewModel = new ap.viewmodels.documents.VersionItemViewModel(this.utility);
                versionVm.init(version);
                items.push(versionVm);
            });

            let lastVersionVm = new ap.viewmodels.documents.VersionItemViewModel(this.utility);
            lastVersionVm.init(this.docInfo.document);
            items.push(lastVersionVm);
            this._availableVersions.onLoadItems(items);
        }

        /**
        * Public method to cancel the deletion
        */
        public cancel(): void {
            this.$mdDialog.cancel();
        }

        /**
        * Public method to delete the document
        */
        public delete() {
            if (this.deleteOption === ap.controllers.DeleteDocumentOptions.Entire) {
                this.$mdDialog.hide(ap.controllers.DeleteDocumentResponse.Entire);
            } else if (this.deleteOption === ap.controllers.DeleteDocumentOptions.LastVersion || this.deleteOption === ap.controllers.DeleteDocumentOptions.Version) {
                this.$mdDialog.hide(ap.controllers.DeleteDocumentResponse.Version);
            }
        }

        /**
        * This method is used to get the display of the DeleteDocumentResponse regarding to the language
        * @param delOpt is the DeleteDocumentOptions which needs to be displayed
        **/
        public getDeleteOptionDisplay(delOpt: ap.controllers.DeleteDocumentOptions): string {
            if (this.isReport) {
                return this.utility.Translator.getTranslation("app.document.delete_report_options." + ap.controllers.DeleteDocumentOptions[delOpt].toLocaleLowerCase());
            } else {
                return this.utility.Translator.getTranslation("app.document.delete_document_options." + ap.controllers.DeleteDocumentOptions[delOpt].toLocaleLowerCase());
            }
        }

        constructor(private _docInfo: ap.models.accessRights.DocumentAccessRight, private $mdDialog: angular.material.IDialogService, private utility: ap.utility.UtilityHelper, private _documentController: ap.controllers.DocumentController) {

            if (!this._docInfo) {
                throw new Error("The DocumentAccessRight needs to be defined in order to be able to delete a document");
            }

            this._deleteOptions = [];
            this._deleteOptions.push(ap.controllers.DeleteDocumentOptions.Entire);
            if (!this.canOnlyDeleteDoc && !this.isReport)
                this._deleteOptions.push(ap.controllers.DeleteDocumentOptions.LastVersion);

            if (this.canDeleteReportVersion)
                this._deleteOptions.push(ap.controllers.DeleteDocumentOptions.Version);
        }

        private _deleteOptions: ap.controllers. DeleteDocumentOptions[];
        private _deleteOption: ap.controllers.DeleteDocumentOptions = ap.controllers.DeleteDocumentOptions.Entire;
        private _availableVersions: ap.viewmodels.ListEntityViewModel;
    }
}