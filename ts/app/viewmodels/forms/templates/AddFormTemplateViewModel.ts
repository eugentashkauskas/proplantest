module ap.viewmodels.forms.templates {
    export enum AddFormTemplateStates {
        Primary,
        SelectTemplates
    }
    export class AddFormTemplateViewModel implements IDispose {

        public get downloadTemplatesVm(): DownloadTemplatesViewModel {
            return this._downloadTemplatesVm;
        }

        public get title(): string {
            return this._title;
        }

        public get stateOfDialog(): string {
            return AddFormTemplateStates[this._stateOfDialog];
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
            this.$mdDialog.cancel();
        }

        /**
         * Method use for switch between sections: Primary, SelectTemplates
         * @param newState
         */
        public changeDialogState(newState: string) {
            this._stateOfDialog = AddFormTemplateStates[newState];
            if (this._stateOfDialog === AddFormTemplateStates.SelectTemplates) {
                this._title = this.$utility.Translator.getTranslation("Select templates to update");
                if (!this._downloadTemplatesVm) {
                    this._downloadTemplatesVm = new DownloadTemplatesViewModel(this.$utility, this._api, this.$q, this.$timeout, this.$scope, this.$controllersManager, this.$mdDialog);
                }
            } else {
                this._title = this.$utility.Translator.getTranslation("Add a new template");
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
            let promises: angular.IPromise<ap.controllers.FormImportResult<ap.models.forms.FormTemplate>>[] = [];
            this._canUpload = false;
            this._dropedFiles.forEach((file: File) => {
                let promise = this.$controllersManager.formController.importFormTemplates(file);
                promises.push(promise);
            });

            this.$q.all(promises).then((results) => {
                let error = "";
                for (let i = 0; i < results.length; i++) {
                    let res = results[i];
                    if (res.errors !== null) {
                        error += res.errors + "\n\n";
                    }
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

        public dispose() {
            if (this._downloadTemplatesVm) {
                this._downloadTemplatesVm.dispose();
                this._downloadTemplatesVm = null;
            }
        }

        constructor(private $utility: ap.utility.UtilityHelper, private $mdDialog: angular.material.IDialogService, private _api: ap.services.apiHelper.Api, private $q: angular.IQService, private $timeout: angular.ITimeoutService, private $scope: angular.IScope, private $controllersManager: ap.controllers.ControllersManager) {
            this._title = this.$utility.Translator.getTranslation("Add a new template");

            this.$scope.$on("$destroy", () => {
                this.dispose();
            });
        }
        private _linkToUpload: string = "https://docs.google.com/a/aproplan.com/spreadsheets/d/1fJwln7W_nWewV9nOe6TkCS52JhWPOZHGqX4N2wVk3zQ/export?format=xlsx";
        private _stateOfDialog: AddFormTemplateStates = AddFormTemplateStates.Primary;
        private _downloadTemplatesVm: DownloadTemplatesViewModel = null;
        private _title: string;
        private _canUpload: boolean = false;
        private _dropedFiles: File[];
    }
}