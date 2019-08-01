module ap.viewmodels.forms {
    export enum ImportFormStates {
        Primary,
        SelectTemplates
    }

    export class ImportFormViewModel implements IDispose {

        public get downloadTemplatesVm(): templates.DownloadTemplatesViewModel {
            return this._downloadTemplatesVm;
        }

        public get title(): string {
            return this._title;
        }

        public get stateOfDialog(): string {
            return ImportFormStates[this._stateOfDialog];
        }

        public get canUpload(): boolean {
            return this._canUpload;
        }

        public get dropedFiles(): File[] {
            return this._dropedFiles;
        }

        /**
         * Method used to close the popup
         */
        public cancel() {
            this.$mdDialog.hide(this._importationDone);
        }

        /**
         * Method use for switch between sections: Primary, SelectTemplates
         * @param newState
         */
        public changeDialogState(newState: string) {
            this._stateOfDialog = ImportFormStates[newState];
            if (this._stateOfDialog === ImportFormStates.SelectTemplates) {
                this._title = this.$utility.Translator.getTranslation("Select templates to update");
                if (!this._downloadTemplatesVm) {
                    this._downloadTemplatesVm = new templates.DownloadTemplatesViewModel(this.$utility, this._api, this.$q, this.$timeout, this.$scope, this.$controllersManager, this.$mdDialog, templates.DownloadFormTemplateType.Form);
                }
            } else {
                this._title = this.$utility.Translator.getTranslation("Create forms");
            }
        }

        /**
         * This method used for download spreadsheet
         */
        public downloadSpreadsheet() {
            this.$utility.openPopup(this._linkToUpload);
        }

        /**
         * This method used for close popup and reload list
         */
        public upload() {
            let promises: angular.IPromise<ap.controllers.FormImportResult<ap.models.forms.Form>>[] = [];
            this._canUpload = false;
            this._dropedFiles.forEach((file: File) => {
                let promise = this.$controllersManager.formController.importForms(file);
                promises.push(promise);
            });

            this.$q.all(promises).then((results) => {
                this._dropedFiles = [];
                let error = "";
                for (let i = 0; i < results.length; i++) {
                    let res = results[i];
                    if (res.errors !== null) {
                        error += res.errors + "\n\n";
                    }
                    else
                        this._importationDone = true;
                }
                if (error !== "") {
                    this.$controllersManager.mainController.showError(error, this.$utility.Translator.getTranslation("app.err.general_error"), null, null);
                }
                else {
                    this._canUpload = true;
                    this.$mdDialog.hide(true);
                }
            });
        }

        /**
         * This metod used for handle dropped file 
         * @param files - excel files
         */
        public handleDroppedFiles(files: File[]) {
            if (files.length > 0) {
                this._dropedFiles = files;
                this._canUpload = true;
            }
        }

        /**
         * This method used for remove file from list 
         * @param index - file list item index
         */
        public removeFile(index: number) {
            this._dropedFiles.splice(index, 1);
            if (this._dropedFiles.length === 0)
                this._canUpload = false;
        }

        /**
        * Dispose the object
        */
        public dispose() {
            if (this._downloadTemplatesVm) {
                this._downloadTemplatesVm.dispose();
                this._downloadTemplatesVm = null;
            }

            this._dropedFiles = null;
        }

        constructor(private $utility: ap.utility.UtilityHelper, private $mdDialog: angular.material.IDialogService, private _api: ap.services.apiHelper.Api, private $q: angular.IQService, private $timeout: angular.ITimeoutService, private $scope: angular.IScope, private $controllersManager: ap.controllers.ControllersManager) {
            this._title = this.$utility.Translator.getTranslation("Create forms");

            this.$scope.$on("$destroy", () => {
                this.dispose();
            });
        }
        private _linkToUpload: string = "https://docs.google.com/a/aproplan.com/spreadsheets/d/1s4R9Ym4Pxfgt6J7J35M1x51VfCayeYEzdm3R-nFhgY4/export?format=xlsx";
        private _stateOfDialog: ImportFormStates = ImportFormStates.Primary;
        private _downloadTemplatesVm: templates.DownloadTemplatesViewModel = null;
        private _title: string;
        private _canUpload: boolean = false;
        private _dropedFiles: File[];
        private _importationDone: boolean = false;
    }
}