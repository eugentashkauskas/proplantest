module ap.viewmodels.cloud {

    export class DropboxViewModel implements ap.utility.IListener, IDispose {

        public get viewFolders() {
            return this._viewFolders;
        }

        public get files() {
            return this._files;
        }

        on(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.on(eventName, callback, caller);
        }
        off(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.off(eventName, callback, caller);
        }

        /**
         * Returns list of cloud storages.
         */
        public get cloudStorages(): ap.models.cloud.CloudStorage[] {
            return this._cloudStorages;
        }

        /*
         * Get the current selected dropbox account
         */
        public get selectedItem() {
            return this._selectedItem;
        }

        /*
         * Calls on select dropbox account
         */
        public set selectedItem(value) {
            this._selectedItem = value;
            this._viewFolders = [];
            this.selecedDropboxFolderChanged("", true);
        }

        /**
         * Return current selected folder
         */
        public get selectedFolder() {
            return this._selectedFolder;
        }

        /**
         * Set current selected
         * @param fodler - folder that will be set
         */
        public set selectedFolder(folder: ap.viewmodels.cloud.ExternalCloudFileViewModel) {
            this._selectedFolder = folder;
            let cloudPath = folder.externalCloudFile.CloudPath;
            if (!cloudPath)
                cloudPath = "";
            if (!this._selectedFolder.isExpanded) {
                this.selecedDropboxFolderChanged(cloudPath, true);
            } else {
                this.collapseFodler();
                this.selecedDropboxFolderChanged(cloudPath, false);
            }
        }

        public dispose() {
            this._files.forEach((file: ap.viewmodels.cloud.ExternalCloudFileViewModel) => {
                file.dispose();
            });
            this._rootFiles.forEach((file: ap.viewmodels.cloud.ExternalCloudFileViewModel) => {
                file.dispose();
            });
        }

        /**
         * Show the files of the selected folders
         */
        public showFiles(folder: ap.viewmodels.cloud.ExternalCloudFileViewModel) {
            this._selectedFolder = folder;
            let cloudPath = folder.externalCloudFile.CloudPath;
            if (!cloudPath)
                cloudPath = "";
            this.selecedDropboxFolderChanged(cloudPath, false);
        }

        /**
         * Remove child folders from viewFolders array
         */
        private collapseFodler() {
            let folderIndex: number = this.getSelectedFolderIndex(false);
            let folderLevel: number = this._selectedFolder.level;
            let countFolders: number = 0;
            let splicedArray = this.viewFolders.slice(folderIndex + 1);
            for (let folder in splicedArray) {
                if (splicedArray[folder].level > folderLevel)
                    countFolders++;
                else if (splicedArray[folder].level === folderLevel)
                    break;
            }
            if (countFolders > 0)
                this.viewFolders.splice(folderIndex + 1, countFolders);
            this.viewFolders[folderIndex].isExpanded = false;
        }

        /*
         * Calls on click Add button and will open new tab for adding dropbox account
         */
        addAccount() {
            this.cloudService.getDropboxUrl().then((url: string) => {
                if (url) {
                    this.utility.openPopup(url);
                    if (this._timerInterval === undefined) {
                        this._timerInterval = this.$interval(() => {
                            this.cloudService.getCloudStorageCount().then((count: number) => {
                                if (count !== this._cloudStorages.length) {
                                    this.cloudService.getCloudStorage().then((storages: ap.models.cloud.CloudStorage[]) => {
                                        this._cloudStorages = storages;
                                        this.$interval.cancel(this._timerInterval);
                                        this._timerInterval = undefined;
                                    });
                                }
                            });
                        }, 500);
                    }
                }
            });
        }

        /**
         * Calls on select dropbox account or change selected folder
         */
        selecedDropboxFolderChanged(cloudPath: string, expandFolder: boolean) {
            this._files = [];
            this._rootFiles = [];
            this.cloudService.getCloudFile(this._selectedItem.TokenPath, cloudPath).then((resp: ap.models.cloud.ExternalCloudFile) => {
                let folderIndex: number = this.getSelectedFolderIndex(expandFolder);
                let lengthBefore = this.viewFolders.length;
                if (folderIndex === undefined && this.viewFolders.length === 0) {
                    this._folders[0].isExpanded = true;
                    this.viewFolders.push(this._folders[0]);
                }

                for (let obj in resp.Children) {
                    if (resp.Children[obj].IsDirectory && expandFolder) {
                        let externalCloudFolder = this.createCloudFileVM(resp.Children[obj]);
                        externalCloudFolder.isExpanded = false;
                        externalCloudFolder.canExpand = true;
                        if (folderIndex >= 0) {
                            externalCloudFolder.level = this.viewFolders[folderIndex].level + 1;
                            let insertIndex = folderIndex + parseInt(obj) + 1;
                            this.viewFolders.splice(insertIndex, 0, externalCloudFolder);
                        } else {
                            externalCloudFolder.level = 1;
                            this.viewFolders.push(externalCloudFolder);
                        }
                    } else if (!resp.Children[obj].IsDirectory) {
                        let externalCloudFile = this.createCloudFileVM(resp.Children[obj]);
                        this._files.push(externalCloudFile);
                        this._rootFiles.push(externalCloudFile);
                    }
                }

                if (lengthBefore === this.viewFolders.length && folderIndex && expandFolder)
                    this.viewFolders[folderIndex].canExpand = false;
            });
        }

        /**
         * Return external file VM object with cloud file
         * @param cloudFileData - cloud file that will contains external file VM
         */
        private createCloudFileVM(cloudFileData) {
            let externalCloudFileVM = new ap.viewmodels.cloud.ExternalCloudFileViewModel(this.utility);
            let cloudFile = new ap.models.cloud.ExternalCloudFile(this.utility);
            cloudFile.createByJson(cloudFileData);
            externalCloudFileVM.init(cloudFile);
            if (!externalCloudFileVM.externalCloudFile.IsDirectory) {
                externalCloudFileVM.on("propertychanged", this.itemCheckedChangedHandler, this);
            }
            return externalCloudFileVM;
        }

        /**
         * Return index of selected in view folders array 
         */
        private getSelectedFolderIndex(expandFolder: boolean) {
            let folderIndex: number;
            this.viewFolders.forEach((item, index: number) => {
                if (item.externalCloudFile.CloudPath === this._selectedFolder.externalCloudFile.CloudPath) {
                    folderIndex = index;
                    if (expandFolder)
                        this.viewFolders[index].isExpanded = true;
                }
            });
            return folderIndex;
        }

        /**
         * Raise an event containing the files to import.
         */
        public requestImport() {
            let documentsToImport: ap.models.cloud.CloudDocument[] = [];
            this._files.forEach((file: ExternalCloudFileViewModel) => {
                if (file.isChecked) {
                    let importDocument = new ap.models.cloud.CloudDocument(this.utility);
                    importDocument.Status = ap.models.cloud.CloudDocumentStatus.New;
                    importDocument.CloudStorageId = this._selectedItem.Id;
                    importDocument.CloudStorage = this._selectedItem;
                    importDocument.CloudPath = file.externalCloudFile.CloudPath;
                    importDocument.FileSize = file.externalCloudFile.Length;
                    documentsToImport.push(importDocument);
                }
            });
            this._listener.raise("importdocumentsrequested", documentsToImport);
        }

        /**
        * Return true if checked documents' count 
        **/
        public get allowImport(): boolean {
            return this._filesToImportCount > 0;
        }

        /** Updates checked documents' count when document item is checked/unchecked
         * @param args "propertychanged" arguments object
         */
        private itemCheckedChangedHandler(args: ap.viewmodels.base.PropertyChangedEventArgs) {
            if (args.propertyName === "isChecked") {
                this._filesToImportCount += (<ap.viewmodels.cloud.ExternalCloudFileViewModel>args.caller).isChecked ? 1 : -1;
            }
        }

        constructor(private utility: ap.utility.UtilityHelper, private $interval: angular.IIntervalService, private cloudService: ap.services.CloudService) {
            this.cloudService.getCloudStorage().then((storages: ap.models.cloud.CloudStorage[]) => {
                this._cloudStorages = storages;
            });
            this._listener = this.utility.EventTool.implementsListener(["importdocumentsrequested"]);
            let DropboxFolder = new ap.viewmodels.cloud.ExternalCloudFileViewModel(this.utility);
            let cloudFile = new ap.models.cloud.ExternalCloudFile(this.utility);
            cloudFile.IsDirectory = true;
            cloudFile.Name = "Dropbox";
            DropboxFolder.init(cloudFile);
            DropboxFolder.isExpanded = true;
            this._folders.push(DropboxFolder);
            this._selectedFolder = this._folders[0];
        }

        private _cloudStorages: ap.models.cloud.CloudStorage[];
        private _selectedItem: ap.models.cloud.CloudStorage = null;
        private _folders: ap.viewmodels.cloud.ExternalCloudFileViewModel[] = [];
        private _viewFolders: ap.viewmodels.cloud.ExternalCloudFileViewModel[] = [];
        private _files: ap.viewmodels.cloud.ExternalCloudFileViewModel[] = [];
        private _selectedFolder: ap.viewmodels.cloud.ExternalCloudFileViewModel;
        private _rootFiles: ap.viewmodels.cloud.ExternalCloudFileViewModel[] = [];
        private _filesToImportCount: number = 0;
        private _listener: ap.utility.IListenerBuilder;
        private _timerInterval: angular.IPromise<any>;
    }

}