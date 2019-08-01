module ap.viewmodels.projects {

    export enum ImportType {
        IssueType,
        Room,
        Folder,
        Status,
        Meeting
    }

    export abstract class ImportExcelViewModel implements IDispose {

        /**
        * An indicator of whether dialog of import is reopened
        **/
        public get isReopenedDialog(): boolean {
            return this._isReopenedDialog;
        }

        /**
         * Type of the import
         */
        get importType(): ImportType {
            return this._importType;
        }

        /**
         * The unique name of the excel file
         */
        get uniqueFileName(): string {
            return this._uniqueFileName;
        }

        /**
         * The name of the excel file
         */
        get fileName(): string {
            return this._fileName;
        }

        /**
        * The name of tab
        */
        get title(): string {
            return this._title;
        }

        /**
        * Set/update name of the tab
        **/
        set title(title: string) {
            this._title = title;
        }

        /**
         * An indicator of whether it is possible to import excel or not
         */
        get canImport(): boolean {
            return !StringHelper.isNullOrEmpty(this._uniqueFileName);
        }

        /**
         * An indicator of whether a user has imported a correct excel data
         */
        get isBadData(): boolean {
            return this._isBadData;
        }

        /**
         * Data imported from excel
         */
        get importedData(): ap.models.Entity[] {
            if (this._importedData) {
                return this._importedData.slice();
            }
            return null;
        }

        /**
         * A translation key for a title of the uploading popup
         */
        get titleKey(): string {
            return this._titleKey;
        }

        /**
         * A translation key for a description of the uploading popup
         */
        get descriptionKey(): string {
            return this._descriptionKey;
        }

        /**
         * A path to a sample image to show in the uploading popup
         */
        get sampleImagePath(): string {
            return this._sampleImagePath;
        }

        /**
         * This method uploads a given file to a server. It should be called when a user selects an excel
         * file.
         * @param file an excel file selected by a user
         * @returns a promise which will be resolved when a given file is loaded
         */
        uploadExcelFile(files: File[]): angular.IPromise<string> {
            if (!files || files.length === 0)
                throw new Error("File is mandatory");
            let file = files[0];
            let deferred = this.$q.defer<string>();

            this._uploadedFile = file;
            this.controllersManager.importExcelController.uploadExcelFile(file).then((uniqueFileName: string) => {
                this._uniqueFileName = uniqueFileName;
                this._fileName = file.name;
                deferred.resolve(uniqueFileName);
            }, (error) => {
                this._uploadedFile = null;
                deferred.reject(error);
            });

            return deferred.promise;
        }

        /**
         * This method clears the uploaded/uploading excel file.
         * @returns a promise which is resolved when the current excel file is removed
         */
        removeExcelFile(): angular.IPromise<any> {
            let deferred = this.$q.defer();

            this.controllersManager.importExcelController.cancelExcelFile(this._uploadedFile).then(() => {
                this._uniqueFileName = null;
                this._uploadedFile = null;
                deferred.resolve();
            }, (error) => {
                deferred.reject(error);
            });

            return deferred.promise;
        }

        /**
         * This method reads data from the uploaded excel file.
         * @returns a promise which will be resolved when the file is read
         * @throws Will throw an error if called when canImport property is false
         */
        import(): angular.IPromise<ap.models.Entity[]> {
            if (!this.canImport) {
                throw new Error("Import is not allowed.");
            }

            let deferred = this.$q.defer<ap.models.Entity[]>();

            this.controllersManager.importExcelController.readExcelContent(this._uniqueFileName).then((excelData: string[][]) => {
                this.createImportedData(excelData).then((importedData: ap.models.Entity[]) => {
                    this._isBadData = false;
                    this._importedData = importedData;
                    this.$mdDialog.hide();
                    deferred.resolve(this.importedData);
                }, () => {
                    this._isBadData = true;
                    this._importedData = null;
                    this.$mdDialog.hide(this.hasRetryAbility);
                    if (!this.hasRetryAbility) {
                        this.controllersManager.mainController.showErrorKey("app.err.ImportExcel_badData", "app.err.title.ImportExcel_badData", null, null);
                    }
                    deferred.reject("BadData");
                });
            }, (error) => {
                // An error message will be shown automatically by the readExcelContent method
                deferred.reject(error);
            });

            return deferred.promise;
        }

        dispose() {

        }

        /**
         * This method checks whether the imported data is valid and creates a list of entites based on it.
         * It has to resolve its promise with the created list of entities if the excel data is valid. If
         * data is invalid, it has to reject the promise.
         * @param excelData data read from the file
         * @returns a promise which will be resolved when a list of entities is created or rejected if the
         * given data is invalid.
         */
        protected abstract createImportedData(excelData: string[][]): angular.IPromise<ap.models.Entity[]>;

        /**
        * This method is needed to close the modal dialog
        **/
        public cancel() {
            this.$mdDialog.hide();
        }

        constructor(protected $q: angular.IQService, protected $mdDialog: angular.material.IDialogService, protected controllersManager: ap.controllers.ControllersManager, importType: ImportType, titleKey: string, descriptionKey: string, sampleImagePath: string, title?: string, private hasRetryAbility?: boolean, private _isReopenedDialog: boolean = false) {
            this._importType = importType;
            this._uploadedFile = null;
            this._uniqueFileName = null;
            this._isBadData = false;
            this._importedData = null;
            this._titleKey = titleKey;
            this._descriptionKey = descriptionKey;
            this._sampleImagePath = sampleImagePath;
            this._title = title;
        }

        private _importType: ImportType;
        private _uploadedFile: File;
        private _uniqueFileName: string;
        private _fileName: string;
        protected _isBadData: boolean;
        protected _importedData: ap.models.Entity[];
        protected _titleKey: string;
        protected _descriptionKey: string;
        protected _sampleImagePath: string;
        private _title: string;
    }

}
