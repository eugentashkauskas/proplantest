namespace ap.viewmodels.documents {

    /**
    * Enum for the documents view possibilities
    */
    export enum View {
        Thumb,
        Grid
    }

    /**
    * Enum for the documents sorts possibilities
    */
    export enum SortView {
        Name,
        Date,
        Custom
    }

    /**
    * This class handles the logic of the documents screen.
    * It's made of 2 parts :
    *       - The folders list on the left.
    *       - The documents list on the right of the screen.
    * When the folders are displayed, only the documents of the selected folder are displayed.  Else all the documents are displayed.
    * When a double click is made on a document, the document is open in full screen in the picture viewer
    */
    export class DocumentWorkspaceViewModel implements IDispose {

        /**
        * Public getter to the folders list
        */
        public get folderListVm(): ap.viewmodels.folders.FolderListViewModel {
            return this._folderListVm;
        }

        /**
        * Public getter to the documents list
        */
        public get documentListVm(): ap.viewmodels.documents.DocumentListViewModel {
            return this._documentListVm;
        }

        /**
        * Public accessor for documentUtilsVm
        */
        public get documentUtilsVm(): ap.viewmodels.documents.DocumentUtilsViewModel {
            return this._documentUtilsVm;
        }


        /**
         * Public getter to the document metadata
         */
        public get documentMetadataVm(): ap.viewmodels.documents.DocumentMetadataViewModel {
            return this._documentUtilsVm.documentMetadataVm;
        }

        /**
        * Public getter to the documents list optiosn
        */
        public get docListOptions(): ap.viewmodels.documents.DocumentListOptions {
            return this._docListOptions;
        }

        /*
        * Getter of the property to know which elements shouyld be visible in the views       
        */
        public get workspaceElements(): ap.viewmodels.documents.DocumentWorkspaceElement {
            return this._workspaceElements;
        }

        /**
        * To know need to display actions on document item or not
        **/
        public get displayActions(): boolean {
            return this._displayActions;
        }

        /**
        * To know the workspace is used for document module of not
        **/
        public get isForDocumentModule(): boolean {
            return this._isForDocumentModule;
        }

        /**
         * Retrieves a model of a currently selected document
         */
        public get selectedDocumentVm(): ap.viewmodels.documents.DocumentItemViewModel {
            return this.documentListVm.selectedEntity;
        }

        /**
         * Retrieves an original model of a currently selected document
         */
        public get selectedDocument(): ap.models.documents.Document {
            if (this.selectedDocumentVm) {
                return this.selectedDocumentVm.originalDocument;
            } else {
                return null;
            }
        }

        /**
         * This is the handler when the selected folder changed in the folderListVM. It will be refresh the list of document if this element is displayed.
         **/
        private _selectedFolderChanged(folderVm: ap.viewmodels.folders.FolderItemViewModel) {
            if (this._documentListVm && (this._workspaceElements.hasFolderList || this._documentListVm.screenInfo.hasFolderList)) {
                this._documentListVm.folder = folderVm ? folderVm.originalFolder : undefined;
                if (this._isForDocumentModule === true && (this._workspaceElements.hasDocumentList === true || this._documentListVm.screenInfo.hasFolderList)) {
                    this._documentListVm.screenInfo.selectedFolderId = folderVm ? folderVm.originalFolder.Id : null;
                }
            }
        }

        /**
        * Getter of the public paneWidth property
        */
        public get paneWidth(): number {
            return this._paneWidth;
        }

        /**
         * Handler method called when a document is selected in the documents list
         */
        private selectedDocumentChanged(documentVm: ap.viewmodels.documents.DocumentItemViewModel) {
            if (!documentVm) {
                return;
            }
            this.documentMetadataVm.showDetailPaneBusy = true;
            this._documentUtilsVm.document = this.selectedDocumentVm;
            if (this._documentListVm.screenInfo.isInfoOpened === true && !this._documentUtilsVm.isDocumentMetadataOpened && this.selectedDocumentVm) {
                this._documentUtilsVm.openDocumentMetadata();
            }
        }

        public widthChangedHandler(value: number) {
            this._utility.Storage.Local.set("documentmetadatapanewidth", value);
            this._paneWidth = value;
        }

        /**
        * Dispose method
        */
        public dispose() {
            if (this.$controllersManager.mainController) {
                this.$controllersManager.mainController.off("currentprojectchanged", this.onCurrentProjectReady, this);
            }

            if (this.$controllersManager.documentController) {
                this.$controllersManager.documentController.off("editdocumentrequested", this.handleEditDocumentRequest, this);
                this.$controllersManager.documentController.off("documentdeleted", this.documentDeletedHandler, this);
                this.$controllersManager.documentController.off("addversionrequested", this.showAddVersionDialog, this);
                this.$controllersManager.documentController.off("documentmetadatarequested", this.showDocumentMetadata, this);
                this.$controllersManager.documentController.off("requestuploaddocument", this.uploadDocumentsIntoFolder, this);
            }
            this.$controllersManager.projectController.off("requestmovefolder", this.requestMoveFolder, this);

            this.$controllersManager.uiStateController.off("mainflowstatechanged", this.mainFlowStateChangedHandler, this);
            this._api.off("showdetailbusy", this.changeVisibleDetailPaneBusy, this);

            if (this._folderListVm) {
                this._folderListVm.dispose();
                this._folderListVm = null;
            }

            if (this.isForDocumentModule) {
                this.$controllersManager.reportController.off("navigatetoreport", this.navigateToReportHandler, this);
            }

            if (this._documentListVm) {
                this._documentListVm.dispose();
                this._documentListVm = null;
            }

            if (this.documentUtilsVm) {
                this.documentUtilsVm.dispose();
                this._documentUtilsVm = null;
            }

            if (this._addNewDocumentViewModel) {
                this._addNewDocumentViewModel.dispose();
                this._addNewDocumentViewModel = null;
            }
        }

        /**
        * This method is used to handle the events received from the MainController
        **/
        private _handleMainControllerEvents(action: string): void {
            switch (action) {
                case "foldersvisible":
                case "foldershidden":
                    this._toggleFoldersVisibility();
                    break;
                case "refresh":
                    this.refresh();
                    break;
                case "printnotelist":
                    this._documentListVm.printReport();
                    break;

            }
        }

        /*
        * To handle FAB actions
        */
        private handleAddActionEvents(action: ap.controllers.AddActionClickEvent): void {
            let actionName = action.name;
            switch (actionName) {
                case "document.uploaddoc":
                    this.showAddDocumentsDialog();
                    break;
            }
        }
        /**
        * This method is used to open the AddNewDocumentDialog
        * @param isReopened to know that we reopen the AddNewDocumentDialog after select the folder
        **/
        private showAddDocumentsDialog(isReopened: boolean = false, folder?: ap.models.projects.Folder) {
            if (!isReopened) {
                let onlyPicture: boolean = this._documentListVm.addAccessRight.canUploadPicture && !this._documentListVm.addAccessRight.canUploadDoc;
                this._uploadSourceFolder = this._documentListVm.folder;
                // When onlyPicture - Guest of the project and the user have not select the folder
                // Then we need to find the Photo folder of the user to upload
                if (onlyPicture && (this._uploadSourceFolder === undefined || this._uploadSourceFolder === null)) {
                    let photoFolder: ap.models.projects.Folder = new ap.models.projects.Folder(this._utility);
                    photoFolder.createByJson({ Id: this.$controllersManager.mainController.currentProject().PhotoFolderId });
                    this._uploadSourceFolder = photoFolder;
                }
                if (this._uploadSourceFolder && this._uploadSourceFolder.FolderType === ap.models.projects.FolderType[ap.models.projects.FolderType.Photo]) {
                    onlyPicture = true;
                }
                if (this._addNewDocumentViewModel)
                    this._addNewDocumentViewModel.dispose();
                this._addNewDocumentViewModel = new ap.viewmodels.documents.AddNewDocumentViewModel(this._utility, this.$controllersManager.documentController, this.$controllersManager.mainController, this.$mdDialog, this.$servicesManager.cloudService, this.$interval, onlyPicture, folder || this._uploadSourceFolder);
            }
            this.$controllersManager.mainController.showBusy();

            let newDocController = ($scope: angular.IScope, $timeout: angular.ITimeoutService) => {
                $scope["vm"] = this._addNewDocumentViewModel;
                this._addNewDocumentViewModel.on("importdropboxprocessed", this.importDropboxDocumentsHandler, this);
                $scope.$on("$destroy", () => {
                    this._addNewDocumentViewModel.off("importdropboxprocessed", this.importDropboxDocumentsHandler, this);
                });
            };
            newDocController.$inject = ["$scope", "$timeout"];
            this.$mdDialog.show({
                clickOutsideToClose: false,
                preserveScope: true,
                templateUrl: "me/PartialView?module=Document&name=AddNewDocumentDialog",
                fullscreen: true,
                controller: newDocController,
                onComplete: () => {
                    this.$controllersManager.mainController.hideBusy();
                }
            }).then((response) => {
                if (response && response instanceof ap.viewmodels.documents.AddNewDocumentResponse) {
                    let addNewDocumentResponse: ap.viewmodels.documents.AddNewDocumentResponse = <ap.viewmodels.documents.AddNewDocumentResponse>response;
                    if (addNewDocumentResponse && addNewDocumentResponse.status === ap.viewmodels.documents.AddDocumentStatus.RequestFolder) {
                        // Keep the files selected by the user
                        this._filesToUpload = addNewDocumentResponse.files;
                        // Open the folder selector to let the user select the folder
                        this.$mdDialog.hide();
                        this.showFolderSelector();
                    }
                }
                else if (response === ap.viewmodels.documents.AddDocumentStatus.Save) {
                    let lastDocumentAddedId: string;
                    if (this._addNewDocumentViewModel.newDocuments
                        && this._addNewDocumentViewModel.newDocuments !== null
                        && this._addNewDocumentViewModel.newDocuments.length > 0) {
                        for (let i = this._addNewDocumentViewModel.newDocuments.length - 1; i >= 0; i--) {
                            let document = this._addNewDocumentViewModel.newDocuments[i].document;
                            if (document && document !== null && !document.IsNew) {
                                lastDocumentAddedId = document.Id;
                                break;
                            }
                        }
                    }
                    this.refreshDocumentList(lastDocumentAddedId);
                    this.refreshFolderDocumentCount();
                }
            }, () => { this.$controllersManager.mainController.hideBusy(); });
        }

        /**
         * Import documents from dropbox handler
         * @param response Response handling status and list of cloud documents to be added to the project
         */
        private importDropboxDocumentsHandler(response: ap.viewmodels.documents.AddNewDocumentResponse) {
            this.$mdDialog.hide(); // hide dropbox files list popup
            if (!response)
                throw new Error("No response from dropbox import popup");
            switch (response.status) {
                case ap.viewmodels.documents.AddDocumentStatus.RequestFolder:
                    this._documentsToImport = response.documentsToImport;
                    this.$mdDialog.hide(); // hide "Add documents" popup
                    this.showFolderSelector(true);
                    break;
                case ap.viewmodels.documents.AddDocumentStatus.ImportDropbox:
                    this.$servicesManager.cloudService.importCloudDocuments(response.documentsToImport, this._uploadSourceFolder).then((documents: ap.models.documents.Document[]) => {
                        for (let i = documents.length; i >= 0; --i) {
                            let doc = documents[i];
                            if (!!doc) {
                                this.refreshDocumentList(doc.Id);
                                break;
                            }
                        }
                        this.refreshFolderDocumentCount();
                        this.$mdDialog.hide(); // hide "Add documenets" popup
                    });
                    break;
                case ap.viewmodels.documents.AddDocumentStatus.Cancel:
                    this.$mdDialog.hide(); // hide "Add documenets" popup
                    break;
            }
        }

        /**
        * This method is used to open the folder selector to let the user select folder for upload files
        **/
        private showFolderSelector(isForDropbox: boolean = false, isForMove: boolean = false, folderIdToMove?: string) {
            this.$controllersManager.mainController.showBusy();
            let folderSelectorVm: ap.viewmodels.folders.FolderSelectorViewModel;

            let folderSelectorController = ($scope: angular.IScope, $timeout: angular.ITimeoutService) => {
                folderSelectorVm = new ap.viewmodels.folders.FolderSelectorViewModel($scope, this.$mdDialog, this._utility, this._api, this.$q, $timeout, this.$mdSidenav, this.$location, this.$anchorScroll, this.$interval, this.$controllersManager, this.$servicesManager, isForMove, folderIdToMove);
                folderSelectorVm.titleKey = "app.document.select_folder_for_upload_title";
                if (isForDropbox) {
                    folderSelectorVm.on("mainactionclicked", this.onFolderSelectedForDropboxHandler, this);
                } else if (isForMove) {
                    folderSelectorVm.on("mainactionclicked", this.moveDocumentIntoFolder, this);
                } else if (folderIdToMove) {
                    folderSelectorVm.on("mainactionclicked", this.onFolderSelectedToMoveHandler, this);
                } else {
                    folderSelectorVm.on("mainactionclicked", this.onFolderSelectedHandler, this);
                }
                $scope["folderSelectorVm"] = folderSelectorVm;

            };
            folderSelectorController.$inject = ["$scope", "$timeout"];
            this.$mdDialog.show({
                clickOutsideToClose: false,
                templateUrl: "me/PartialView?module=Document&name=FolderSelector",
                fullscreen: true,
                controller: folderSelectorController,
                onComplete: () => {
                    this.$controllersManager.mainController.hideBusy();
                }
            }).then((response) => {
                if (response === "cancel" && isForMove) {
                    this.$servicesManager.toolService.sendEvent("cli-menu-move documents.cancel", new Dictionary([new KeyValue("cli-menu-open documents-screenname", "projects")]));
                }
            }, () => { this.$controllersManager.mainController.hideBusy(); });
        }

        /**
         * Handler method called after a folder has been selected to import the Dropbox documents
         */
        private onFolderSelectedForDropboxHandler(selectedFolder: ap.models.projects.Folder): void {
            this.$mdDialog.hide();
            if (this._documentsToImport) {
                this.$servicesManager.cloudService.importCloudDocuments(this._documentsToImport, selectedFolder).then((documents: ap.models.documents.Document[]) => {
                    this.refreshDocumentList();
                });
            }
        }

        /**
         * Move current folder into another folder
         * @param selectedFolder Drop target to move
         */
        private onFolderSelectedToMoveHandler(selectedFolder: ap.models.projects.Folder): void {
            this.$mdDialog.hide();
            let dragTargetFolder = <ap.viewmodels.folders.FolderItemViewModel>this.folderListVm.listVm.getEntityById(this._folderIdToMove);
            let dropTargetFolder = <ap.viewmodels.folders.FolderItemViewModel>this.folderListVm.listVm.getEntityById(selectedFolder.Id);
            dragTargetFolder.drop(dropTargetFolder, this._folderListVm.dragOptions.dropZones[1]);
        }

        /**
        * This method is used to reopen the add document dialog after the user select the folder 
        **/
        private onFolderSelectedHandler(selectedFolder: ap.models.projects.Folder) {
            this.$mdDialog.hide();
            this.showAddDocumentsDialog(true);
            if (this._filesToUpload) {
                this._addNewDocumentViewModel.addFiles(this._filesToUpload, selectedFolder);
            }
        }

        /**
        * This method is called when the user clicks on the Edit document button.
        **/
        private handleEditDocumentRequest(document: ap.models.documents.Document) {
            this.$controllersManager.mainController.showBusy();

            let editDocController = ($scope: angular.IScope, $timeout: angular.ITimeoutService) => {
                let docViewModel = new ap.viewmodels.documents.DocumentViewModel(this._utility, this.$q, this.$controllersManager, this.$servicesManager);
                docViewModel.init(document);
                let editDocViewModel = new ap.viewmodels.documents.EditDocumentViewModel(this._utility, this.$mdDialog, this.$timeout, this.$q, $scope, this.$controllersManager, this.$servicesManager, docViewModel);
                $scope["vm"] = editDocViewModel;
                $scope.$on("$destroy", () => {
                    editDocViewModel.dispose();
                });
            };
            editDocController.$inject = ["$scope", "$timeout"];
            this.$mdDialog.show({
                clickOutsideToClose: false,
                preserveScope: true,
                templateUrl: "me/PartialView?module=Document&name=EditDocumentDialog",
                fullscreen: true,
                controller: editDocController,
                onComplete: () => {
                    this.$controllersManager.mainController.hideBusy();
                }
            });
        }

        /**
        * This method is used to open the dialog to add version for the document
        **/
        private showAddVersionDialog(document: ap.models.documents.Document) {
            this.documentListVm.selectItem(document.Id);

            let listOption = this._workspaceElements.documentListOption;
            let pathToloadDocument: string = listOption.getPathToLoad();
            let pathToloadVersion: string = "";
            this.$controllersManager.mainController.showBusy();

            let editDocController = ($scope: angular.IScope, $timeout: angular.ITimeoutService) => {
                let docViewModel = new ap.viewmodels.documents.DocumentViewModel(this._utility, this.$q, this.$controllersManager, this.$servicesManager);
                docViewModel.init(document);
                let editDocViewModel = new ap.viewmodels.documents.EditDocumentViewModel(this._utility, this.$mdDialog, this.$timeout, this.$q, $scope, this.$controllersManager, this.$servicesManager, docViewModel, true, pathToloadDocument, pathToloadVersion);
                $scope["vm"] = editDocViewModel;
            };
            editDocController.$inject = ["$scope", "$timeout"];
            this.$mdDialog.show({
                clickOutsideToClose: false,
                preserveScope: true,
                templateUrl: "me/PartialView?module=Document&name=EditDocumentDialog",
                fullscreen: true,
                controller: editDocController,
                onComplete: () => {
                    this.$controllersManager.mainController.hideBusy();
                }
            }).then((result: EditDocumentDialogResult) => {
                if (result === EditDocumentDialogResult.VersionAdded) {
                    // A document model was completely replaced
                    // So, the old version of a model in the cache is not valid any more
                    this.documentListVm.listVm.clearLoaderCache();
                }
            });
        }


        /**
        * Handler method when a document is deleted from the documents list
        */
        private documentDeletedHandler(documentEvt: ap.controllers.EntityUpdatedEvent<ap.models.documents.Document>) {
            if (this._workspaceElements.hasFolderList) {
                // if the folders are visible, refresh the number of plans for the current folder to keep it up to date
                this.folderListVm.listVm.updateCurrentFolderPlansCount(this._documentListVm.listVm.ids.length - 1);
            }
        }

        /**
        * This method is used to refresh the documents list and the folders list if it is displayed
        **/
        private refresh() {
            if (this._workspaceElements.hasFolderList) {
                // Call the reset method manually in this case because we have to clear cache for both
                // folders and documents lists. If we don't do this the folders list won't reset cache
                // for the documents list
                this.$controllersManager.listController.reset();

                this._folderListVm.listVm.refreshAndSelect(this._documentListVm.screenInfo.selectedFolderId);
            } else {
                let selectedDocumentId = this._isForDocumentModule && this._workspaceElements.hasDocumentList ? this._documentListVm.screenInfo.selectedEntityId : null;
                this._documentListVm.refresh(selectedDocumentId);
            }
        }

        /**
        * This method is used to refresh the document list
        **/
        private refreshDocumentList(documentToSelect?: string) {
            this._documentListVm.refresh(documentToSelect);
        }

        /**
        * This method is used to refresh the document count of each folder on the list
        **/
        private refreshFolderDocumentCount() {
            if (this.workspaceElements.hasFolderList) {
                this._folderListVm.listVm.currentDocumentsFilter = this.documentListVm.screenInfo.mainSearchInfo.filterString;
            }
        }

        /**
        * This method is used to toggle the visiblity of the folders list of the workspace
        **/
        private _toggleFoldersVisibility() {
            this._workspaceElements.hasFolderList = !this._workspaceElements.hasFolderList;

            if (this._documentListVm && this._documentListVm !== null) {
                if (this._workspaceElements.hasFolderList) {
                    if (this._folderListVm.listVm.selectedViewModel) {
                        this._documentListVm.folder = <ap.models.projects.Folder>this._folderListVm.listVm.selectedViewModel.originalEntity;
                    } else {
                        this._documentListVm.folder = undefined;
                    }
                } else {
                    this._documentListVm.folder = null;
                }
            }

            this._mainActions[0].isVisible = this._workspaceElements.hasFolderList;
            this._mainActions[1].isVisible = !this._workspaceElements.hasFolderList;

            this._utility.Storage.Local.set("documents.foldersvisibility", this._workspaceElements.hasFolderList);
            this.folderListVm.refresh();
        }

        /**
        * This private handler method is called when the 'currentscreenchanged' event is raised after the user has closed the pictureViewer.
        * This method is used to close the initial pictureViewer if it's still displayed:
        *   - user opened a document
        *   - user opened the notes list
        *   - user opened a note
        *   - user opened a noteDocument
        *   - user close the pictureViewer -> the noteDocument is closed but not the first document so we need to close it
        */
        private currentScreenChangedHandler(currentScreenChangedArgs: ap.controllers.CurrentScreenChangedArgs) {
            this.$controllersManager.mainController.off("currentscreenchanged", this.currentScreenChangedHandler, this);
        }

        /**
        * Handler method when the criterions change
        */
        private criterionChangedHandler(args: any) {
            if (this.$controllersManager.mainController.currentProject()) {
                this.documentListVm.refresh();
                this.folderListVm.listVm.currentDocumentsFilter = this.documentListVm.screenInfo.mainSearchInfo.filterString;
            }
        }

        /**
         * Handler function for folders' drag processing. Need to disable drag options for documents list while dragging folder to prevend drag&drop logic from working in both ways
         * @param processingDrag Frag indicating that dragging started (true) or stopped (false)
         */
        private folderDragProcessingHandler(processDrag: boolean) {
            if (this.documentListVm) {
                this.documentListVm.dragOptions.isEnabled = !processDrag;
            }
        }

        /**
         * Restore folder documents when document's folder is set
         * @param folder Selected folder
         */
        private restoreFolderDocumentsHandler(folder: ap.models.projects.Folder) {
            if (folder) {
                this._documentListVm.off("folderchanged", this.restoreFolderDocumentsHandler, this);
            }
        }

        /**
         * Open document preview in picture viewer
         * @param event Preview event object
         */
        private openDocument(event: DocumentPreviewEvent) {
            let previewFlowStateParams = new ap.controllers.DocumentViewFlowStateParam(this._utility, event.documentId, event.versionId, null, this.$controllersManager.uiStateController.mainFlowState);
            previewFlowStateParams.documentIds = this.documentListVm.listVm.ids;
            this.$controllersManager.uiStateController.changeFlowState(ap.controllers.MainFlow.DocumentView, previewFlowStateParams);
        }

        /**
        * Handler method when the current project changes
        */
        private onCurrentProjectReady(currentProject: ap.models.projects.Project) {
            if (!currentProject) {
                return;
            }

            this.$controllersManager.mainController.off("currentprojectchanged", this.onCurrentProjectReady, this);

            this.initFoldersListVm();
            this.initDocumentListVm();

                if (!this._isForDocumentModule) {
                    this._folderListVm.listVm.currentDocumentsFilter = "Filter.IsFalse(IsArchived)";
            } else if (this._documentListVm) {
                this._folderListVm.listVm.currentDocumentsFilter = this._documentListVm.screenInfo.mainSearchInfo.criterions[0].filterString;
                }

            if (this._workspaceElements.hasFolderList) {
                let restorePromise = this._folderListVm.restoreState();

                if (this._isForDocumentModule) {
                    restorePromise.then(() => {
                        this.restoreFoldersState();
                    });
                }
            } else if (this._workspaceElements.hasDocumentList) {
                        this.restoreDocumentsState();
                    }
                }

        /**
         * Initializes a list of folders
         */
        private initFoldersListVm() {
            this._folderListVm = new ap.viewmodels.folders.FolderListViewModel(this.$scope, this._utility, this._api, this.$controllersManager, this.$mdDialog, this.$q, this.$timeout, this.$servicesManager, this.isForDocumentModule);
            this._folderListVm.on("processdragging", this.folderDragProcessingHandler, this);
            this._folderListVm.listVm.on("selectedItemChanged", this._selectedFolderChanged, this);
        }

        /**
         * Initializes a list of documents
         */
        private initDocumentListVm() {
            if (!this._workspaceElements.hasDocumentList) {
                return;
                }

            this._documentListVm = new ap.viewmodels.documents.DocumentListViewModel(this.$scope, this.$mdDialog, this._utility, this._api, this.$q, this.$timeout, this.$controllersManager, this.$servicesManager, this._workspaceElements.documentListOption, null, this.isForDocumentModule);

            this._documentListVm.listVm.on("idsloaded", this.documentsIdsLoaded, this);
            this._documentListVm.listVm.on("pageloaded", this.pageDocumentsLoaded, this);
            this._documentListVm.on("droppedintofolder", this.documentDroppedToFolder, this);
            this._documentListVm.on("dragstartdocument", this.documentIntoFolderStart, this);
            this._documentListVm.on("dragenddocument", this.documentIntoFolderEnd, this);
            this._documentListVm.on("movetoanotherfolderhandler", this.showFolderForMove, this);

            if (this._isForDocumentModule) {
                this._documentListVm.on("previewclicked", this.openDocument, this);
                this._documentListVm.listVm.on("selectedItemChanged", this.selectedDocumentChanged, this);

                if (this._documentListVm.screenInfo) {
                    this._mainActions = this._mainActions.concat(this._documentListVm.screenInfo.actions);
                    this._documentListVm.screenInfo.actions = this._mainActions;
                    this._documentListVm.screenInfo.on("actionclicked", this._handleMainControllerEvents, this);
                    this._documentListVm.screenInfo.on("addactionclicked", this.handleAddActionEvents, this);

                    if (this.$controllersManager.uiStateController.mainFlowStateParam) {
                        this.$controllersManager.uiStateController.openedViews = this.$controllersManager.uiStateController.mainFlowStateParam.openedViews;
                }
                    this.$controllersManager.uiStateController.updateScreenInfo(this._documentListVm.screenInfo);
                    this.$controllersManager.mainController.initScreen(this._documentListVm.screenInfo);

                    if (this._documentListVm.screenInfo.mainSearchInfo.criterions.length === 0) {
                        // If there are no default criterions defined, the default one should be the active documents
                        this._documentListVm.screenInfo.mainSearchInfo.addCriterion(this._documentListVm.screenInfo.mainSearchInfo.predefinedFilters[0]);
            }
        }
            }
        }

        /**
        * Handler method called when the documents ids are loaded
        */
        private documentsIdsLoaded() {
            if (this._workspaceElements.hasFolderList) {
                // if the folders are visible, refresh the number of plans for the current folder to keep it up to date
                this.folderListVm.listVm.updateCurrentFolderPlansCount(this._documentListVm.listVm.ids.length);
            }
        }

        /**
         * After toggle folder list enable/disable the drag and drop 
         */
        private pageDocumentsLoaded(items: ap.viewmodels.documents.DocumentItemViewModel[]) {
            if (this.documentListVm.listVm.sourceItems.length > 0 && !this._dragActivated)
                this._dragActivated = true;
            this.documentListVm.dragOptions.isEnabled = this._workspaceElements.hasFolderList;
            if (this._workspaceElements.hasDocumentList && this._isForDocumentModule) {
                this.restoreCheckedDocuments(items);
            }
        }

        /**
         * Called when document dropped to folder
         */
        private documentDroppedToFolder(dropEvent: ap.component.dragAndDrop.DropEntityEvent) {
            let folderId = dropEvent.dropTarget.dragId;

            let documentVms = <ap.viewmodels.documents.DocumentItemViewModel[]>this.documentListVm.listVm.getCheckedItems();
            if (documentVms.length === 0) {
                documentVms.push(<ap.viewmodels.documents.DocumentItemViewModel>dropEvent.dragTarget);
            }

            this.moveDocument(documentVms, folderId);
        }

        /**k
         * Handler of move multiaction
         */
        private showFolderForMove() {
            this._selectedDocuments = <ap.viewmodels.documents.DocumentItemViewModel[]>this.documentListVm.listVm.getCheckedItems();
            let notReports = this._selectedDocuments.filter((item: ap.viewmodels.documents.DocumentItemViewModel) => {
                return !item.originalDocument.IsReport;
            });
            let notProcessed = this._selectedDocuments.filter((item: ap.viewmodels.documents.DocumentItemViewModel) => {
                return item.isProcessing;
            });

            let processedError = this._selectedDocuments.filter((item: ap.viewmodels.documents.DocumentItemViewModel) => {
                return item.isProcessedError;
            });

            if (notReports.length !== this._selectedDocuments.length) {
                this.$controllersManager.mainController.showMessageKey("ap.moveDocument.report", "You can't change the location of a report", (result) => {
                    if (result === 0) {
                        this.showFolderSelector(false, true);
                    } else {
                        this.$servicesManager.toolService.sendEvent("cli-menu-move documents.cancel.report", new Dictionary([new KeyValue("cli-menu-open documents-screenname", "projects")]));
                        this.$mdDialog.hide();
                    }
                }, controllers.MessageButtons.CustomCancel, "Move");
            } else if (notProcessed.length > 0 && processedError.length > 0) {
                this.$controllersManager.mainController.showMessageKey("ap.moveDocument.brokenandprocessed", "Document(s) not ready & broken document(s) selected", null, controllers.MessageButtons.Ok);
            } else if (notProcessed.length > 0) {
                this.$controllersManager.mainController.showMessageKey("ap.moveDocument.processed", "Document(s) not ready selected", null, controllers.MessageButtons.Ok);
            } else if (processedError.length > 0) {
                this.$controllersManager.mainController.showMessageKey("ap.moveDocument.broken", "Broken document(s) selected", null, controllers.MessageButtons.Ok);
            } else {
                this.showFolderSelector(false, true);
            }
        }


        /**
         * Method used to move a or some documents to another folder
         */
        private moveDocumentIntoFolder(selectedFolder: ap.models.projects.Folder) {
            let documents = this._selectedDocuments.filter((item: ap.viewmodels.documents.DocumentItemViewModel) => {
                return !item.originalDocument.IsReport;
            });
            this.$mdDialog.hide();
            if (this._selectedDocuments[0].originalDocument.FolderId !== selectedFolder.Id) {
                this.moveDocument(documents, selectedFolder.Id);
            } else {
                this.documentListVm.closeMultiActions();
            }
        }

        /**
         * Method used to move a or some documents to another folder
         * @param documentVms the list of documents to move
         * @param folderId the id of the folder where to move the documents
         */
        private moveDocument(documentVms: ap.viewmodels.documents.DocumentItemViewModel[], folderId: string) {
            let documentsOriginals = documentVms.map(item => <ap.models.documents.Document>item.originalDocument);
            this.$controllersManager.documentController.moveDocumentsToFolder(documentsOriginals, folderId).then((documentsUpdated: ap.models.documents.Document[]) => {
                documentVms.forEach((docVm: ap.viewmodels.documents.DocumentItemViewModel) => {
                    this.documentListVm.listVm.removeItem(docVm);
                    docVm.dispose();
                });

                this.folderListVm.listVm.sourceItems.forEach((folder: ap.viewmodels.folders.FolderItemViewModel) => {
                    if (folder.originalFolder.Id === folderId)
                        folder.planNumber += documentsOriginals.length;
                });

                (<ap.viewmodels.folders.FolderItemViewModel>this.folderListVm.listVm.selectedViewModel).planNumber -= documentsOriginals.length;

                this.documentListVm.closeMultiActions();

                // Reset caches because we've just altered document lists, so they are not valid anymore
                this.documentListVm.listVm.clearLoaderCache();
            });
        }

        /**
         * Called when document dragging to folder
         */
        private documentIntoFolderStart(allowDropIntoFolder: boolean) {
            if (!allowDropIntoFolder)
                this.folderListVm.dragOptions.isEnabled = false;
        }

        /**
         * Called when document after dragging from folder
         */
        private documentIntoFolderEnd() {
            this.folderListVm.dragOptions.isEnabled = true;
        }

        /**
         * Restore the checked state of documents after a page refresh
         * @param items
         */
        private restoreCheckedDocuments(items: ap.viewmodels.documents.DocumentItemViewModel[]) {
            let docsScreenInfo = this.documentListVm.screenInfo;
            if (docsScreenInfo.checkedEntitiesId && docsScreenInfo.checkedEntitiesId.length) {
                this.documentListVm.listVm.sourceItems.forEach((item: ap.viewmodels.documents.DocumentItemViewModel) => {
                    if (docsScreenInfo.checkedEntitiesId.indexOf(item.originalDocument.Id) >= 0) {
                        item.defaultChecked = true;
                        // this.documentListVm.listVm.listidsChecked.push(item.originalDocument.Id);
                    }
                });
                if (this.documentListVm.isMultiActions) {
                    this.$controllersManager.mainController.multiActions.itemsChecked = docsScreenInfo.checkedEntitiesId;
                } else {
                    this.documentListVm.gotoMultiActions();
                }
                if (!!docsScreenInfo.checkedEntitiesId && docsScreenInfo.checkedEntitiesId.length > 0) {
                    this.documentListVm.listVm.listidsChecked = docsScreenInfo.checkedEntitiesId.slice();
                }
            }
        }

        /**
         * Restores the document workspace
         */
        private restoreDocumentsState() {
            let docsScreenInfo = this.documentListVm.screenInfo;

            // This method is called asynchronously, so it is possible that a flow state was changed to something else
            if (this.$controllersManager.mainController.uiStateController.mainFlowState === ap.controllers.MainFlow.Documents) {
                this.$controllersManager.uiStateController.updateScreenInfo(docsScreenInfo);
                this.$controllersManager.mainController.initScreen(docsScreenInfo);
                if (this._workspaceElements.hasDocumentList) {
                    this.folderListVm.listVm.currentDocumentsFilter = this.documentListVm.screenInfo.mainSearchInfo.filterString;

                    this.documentListVm.load(docsScreenInfo.selectedEntityId).then(() => {
                        if (docsScreenInfo.selectedEntityId) {
                            this.documentListVm.saveSelectedItem(docsScreenInfo.selectedEntityId);
                        }

                        if (this._documentListVm && this._documentListVm.screenInfo && this._documentListVm.screenInfo.mainSearchInfo) {
                            this._documentListVm.screenInfo.mainSearchInfo.on("criterionschanged", this.criterionChangedHandler, this);
                        }
                    });
                }
                this._documentListVm.listVm.off("pageloaded", this.restoreDocumentsState, this);
            } else {
                this.$controllersManager.uiStateController.on("mainflowstatechanged", this.mainFlowStateChangedHandler, this);
            }
        }

        private mainFlowStateChangedHandler() {
            this.restoreDocumentsState();

            this.$controllersManager.uiStateController.off("mainflowstatechanged", this.mainFlowStateChangedHandler, this);
        }

        private navigateToReportHandler(params: ap.controllers.INavigateToReportParams) {
            if (this._workspaceElements.hasFolderList) {
                if (!this.folderListVm.listVm.isLoaded) {
                    this.navigateToReportHandler(params);
                    return;
                }
                if (this.folderListVm.listVm.selectedViewModel.originalEntity.Id === params.folderId) {
                    this._documentListVm.listVm.selectEntity(params.documentId);
                } else {
                    this._documentListVm.saveSelectedItem(params.documentId);
                    this._folderListVm.listVm.selectEntity(params.folderId);
                }
                this.folderListVm.listVm.selectEntity(params.folderId);
            } else {
                if (!this._documentListVm.listVm.isLoaded) {
                    this.navigateToReportHandler(params);
                    return;
                }
                this._documentListVm.listVm.selectEntity(params.documentId);
            }
        }

        /**
         * Restore folders state when folders list is loaded
         * @param isLoaded Loading flag
         */
        private restoreFoldersState() {
                let docsScreenInfo = this.documentListVm.screenInfo;
                this.$controllersManager.mainController.initScreen(docsScreenInfo);

                if (docsScreenInfo.selectedFolderId) {
                    this._documentListVm.saveSelectedItem(docsScreenInfo.selectedEntityId);
                    this._folderListVm.listVm.selectEntity(docsScreenInfo.selectedFolderId);
                }

                if (this._documentListVm && this._documentListVm.screenInfo) {
                    this._documentListVm.screenInfo.mainSearchInfo.on("criterionschanged", this.criterionChangedHandler, this);
                }
            }

        /**
         * Show document metadata
         * @param document Document entity
         */
        private showDocumentMetadata(document: ap.models.documents.Document) {
            this.documentListVm.listVm.selectEntity(document.Id);
            let entityVm = <ap.viewmodels.documents.DocumentItemViewModel>this.documentListVm.listVm.selectedViewModel;
            this._documentUtilsVm.document = entityVm;
            this._documentUtilsVm.openDocumentMetadata();
        }


        private changeVisibleDetailPaneBusy(showBusy: boolean) {
            this.documentMetadataVm.showDetailPaneBusy = showBusy;
        }

        /**
         * Open add documents dialog for specified folder
         * @param folder Specified folder entity
         */
        private uploadDocumentsIntoFolder(folder: ap.models.projects.Folder) {
            this.showAddDocumentsDialog(false, folder);
        }

        /**
         * Request move folder into another folder
         * @param folderId ID of a folder to move
         */
        private requestMoveFolder(folderId: string) {
            this._folderIdToMove = folderId;
            this.showFolderSelector(false, false, this._folderIdToMove);
        }

        /*
        * @param workspaceElements: parameter used to specify which objects should be visible in the views
        */
        static $inject = ["$scope", "Utility", "Api", "$q", "$timeout", "$mdSidenav", "$mdDialog", "$location", "$anchorScroll", "$interval", "ControllersManager", "ServicesManager"];
        constructor(private $scope: ng.IScope, private _utility: ap.utility.UtilityHelper, private _api: ap.services.apiHelper.Api, private $q: angular.IQService, private $timeout: angular.ITimeoutService,
            private $mdSidenav: angular.material.ISidenavService, private $mdDialog: angular.material.IDialogService, private $location: angular.ILocationService,
            private $anchorScroll: angular.IAnchorScrollService, private $interval: angular.IIntervalService, private $controllersManager: ap.controllers.ControllersManager, private $servicesManager: ap.services.ServicesManager,
            workspaceElements: ap.viewmodels.documents.DocumentWorkspaceElement, isForDocumentModule: boolean = true) {

            if (this._utility.Storage.Local.get("documentmetadatapanewidth")) {
                this._paneWidth = this._utility.Storage.Local.get("documentmetadatapanewidth");
            }

            // init the workspace element
            this._workspaceElements = workspaceElements;
            if (!this._workspaceElements) {
                this._workspaceElements = new ap.viewmodels.documents.DocumentWorkspaceElement();
            }

            // get the foldersvisibility
            this._isForDocumentModule = isForDocumentModule;

            // AP-12768: checking status remembered for show/hide folder view only done for document module
            // for document selector, alwasy allow to show folder to allow user navigate through folders to select documents
            if (this._isForDocumentModule === true) {
                let foldersVisible: boolean = this._utility.Storage.Local.get("documents.foldersvisibility");
                if (foldersVisible !== null) {
                    this._workspaceElements.hasFolderList = foldersVisible;
                } else {
                    this._workspaceElements.hasFolderList = false;
                }
            } else {
                this._workspaceElements.hasFolderList = true;
            }

            this._displayActions = isForDocumentModule;

            // init the mainActions with the actions of the folders list and documents list
            this._mainActions = [
                new ap.viewmodels.home.ActionViewModel(this._utility, this._utility.EventTool, "foldersvisible", this._utility.rootUrl + "Images/html/icons/ic_folder_black_48px.svg", this._workspaceElements.hasFolderList, null, "Folders list visible", true),
                new ap.viewmodels.home.ActionViewModel(this._utility, this._utility.EventTool, "foldershidden", this._utility.rootUrl + "Images/html/icons/ic_folder_open_black_48px.svg", !this._workspaceElements.hasFolderList, null, "Folders list hidden", true)
            ];

            if (this._isForDocumentModule) {
                // send Segment.IO events
                this.$servicesManager.toolService.sendEvent("cli-menu-open documents", new Dictionary([new KeyValue("cli-menu-open documents-screenname", "projects")]));
                }

            this._documentUtilsVm = new DocumentUtilsViewModel(_utility, $location, $q, $anchorScroll, $interval, $scope, $mdDialog, $controllersManager);

            this._api.on("showdetailbusy", this.changeVisibleDetailPaneBusy, this);
            this.$controllersManager.documentController.on("editdocumentrequested", this.handleEditDocumentRequest, this);
            this.$controllersManager.documentController.on("addversionrequested", this.showAddVersionDialog, this);
            this.$controllersManager.documentController.on("documentdeleted", this.documentDeletedHandler, this);
            this.$controllersManager.documentController.on("documentmetadatarequested", this.showDocumentMetadata, this);
            this.$controllersManager.documentController.on("requestuploaddocument", this.uploadDocumentsIntoFolder, this);
            this.$controllersManager.projectController.on("requestmovefolder", this.requestMoveFolder, this);

            let currentProject = this.$controllersManager.mainController.currentProject();
            if (currentProject) {
                this.onCurrentProjectReady(currentProject);
            } else {
                this.$controllersManager.mainController.on("currentprojectchanged", this.onCurrentProjectReady, this);
            }

            $scope.$on("$destroy", () => {
                this.dispose();
            });
        }

        private _documentUtilsVm: DocumentUtilsViewModel;
        private _docListOptions: ap.viewmodels.documents.DocumentListOptions;
        private _workspaceElements: ap.viewmodels.documents.DocumentWorkspaceElement;
        private _folderListVm: ap.viewmodels.folders.FolderListViewModel;
        private _documentListVm: ap.viewmodels.documents.DocumentListViewModel = null;
        private _isForDocumentModule: boolean = true;
        private _displayActions: boolean;
        private _currentDocumentItemVm: ap.viewmodels.documents.DocumentItemViewModel;
        private _mainActions: ap.viewmodels.home.ActionViewModel[];
        private _addNewDocumentViewModel: ap.viewmodels.documents.AddNewDocumentViewModel; // Use to open the add document dialog
        private _filesToUpload: File[] = null; // User to keep the selected files make by the user
        private _documentsToImport: ap.models.cloud.CloudDocument[] = null;
        private _dragActivated; boolean = false; // Use to open the folder selector dialog
        private _uploadSourceFolder: ap.models.projects.Folder;
        private _views: ap.misc.IViewInfo[];
        private _paneWidth: number;
        private _selectedDocuments: ap.viewmodels.documents.DocumentItemViewModel[] = [];
        private _folderIdToMove: string;
    }
}