namespace ap.viewmodels.documents {

    /**
    * This class contains common feature for Project and Meeting document.
    **/
    export class DocumentUtilsViewModel implements IDispose {

        /**
        * This property is selected document in DocumentWorkspace
        **/
        public set document(val: DocumentItemViewModel) {
            if (this._document) {
                this._document.isShowingMetaData = false;
            }

            this._document = val;
            if (this.isDocumentMetadataOpened) {
                this._documentMetadataVm.loadDocument(this._document.originalEntity.Id);
                this._document.isShowingMetaData = true;
            } else {
                this._document.isShowingMetaData = false;
            }
            this.clearActions();
            if (this.document.documentActionViewModel && this._pictureViewerActions.length === 2) { // Means that the actions of the document are not added yet
                if (this.comesFromListPointsScreen) {
                    this._pictureViewerActions.splice(0);
                    this.pictureViewerActions.push(ap.viewmodels.home.ActionViewModel.getAction(this.document.documentActionViewModel.actions, "document.rotateright"));
                    this.pictureViewerActions.push(ap.viewmodels.home.ActionViewModel.getAction(this.document.documentActionViewModel.actions, "document.rotateleft"));
                    this.pictureViewerActions.push(ap.viewmodels.home.ActionViewModel.getAction(this.document.documentActionViewModel.actions, "document.download"));
                } else {
                    for (let i = this.document.documentActionViewModel.actions.length - 1; i > -1; i--) {
                        let action = this.document.documentActionViewModel.actions[i];
                        if (action.name !== "document.delete")
                            this._pictureViewerActions.splice(0, 0, action);
                    }
                }
            }
        }

        public get document(): DocumentItemViewModel {
            return this._document;
        }

        /**
        * Property used to know which actions should be displayed or not
        */
        public get comesFromListPointsScreen(): boolean {
            return this._comesFromListPointsScreen;
        }

        public set comesFromListPointsScreen(bool: boolean) {
            this._comesFromListPointsScreen = bool;
        }

        /**
        * This property is pictureViewModel for document
        **/
        public set pictureViewModel(val: PictureViewModel) {
            this._pictureViewModel = val;
        }

        public get pictureViewModel(): PictureViewModel {
            return this._pictureViewModel;
        }

        /**
         * Public accessor to get action for pictureViewer
         */
        public get pictureViewerActions(): home.ActionViewModel[] {
            return this._pictureViewerActions;
        }


        /**
         * Public accessor to know whether  a document is opened
         */
        public get isDocumentOpened(): boolean {
            return this._isDocumentOpened;
        }

        /**
         * Public accessor to know whether  a noteList in document is opened
         */
        public get isNotesVisible(): boolean {
            return this._isNotesVisible;
        }

        /**
         * Public accessor to know whether a window with metadata of a document is opened
         */
        public get isDocumentMetadataOpened(): boolean {
            return this._isDocumentMetadataOpened;
        }

        /**
         * Public getter to the document metadata
         */
        public get documentMetadataVm(): DocumentMetadataViewModel {
            return this._documentMetadataVm;
        }

        /**
         * Public getter to the document metadata
         */
        public get isCompareMode(): boolean {
            return this._isCompareMode;
        }

        /**
        * This method used for handle compare mode changed
        */
        public setCompareMode(val: boolean) {
            if (this._isCompareMode !== val) {
                this._isCompareMode = val;
            }
        }

        /**
        * This method opens a side pane with metainformation about the currently selected document
        */
        public openDocumentMetadata() {
            if (this._document) {
                this._document.isShowingMetaData = true;
                this._documentMetadataVm.loadDocument(this._document.originalEntity.Id);
            }
            this._isDocumentMetadataOpened = true;
        }

        /**
         * This method closes a side pane with metainformation about the currently selected document
         */
        public closeDocumentMetadata() {
            if (this.document) {
                this.document.isShowingMetaData = false;
            }
            this._isDocumentMetadataOpened = false;
        }

        /**
         * Private handler method to opened the download document popup when the event 'docdownloadsourcerequested' is raised
        **/
        private openDownloadDocumentPopup(data: ap.controllers.DocumentDownloadSourceEvent) {
            this.$controllersManager.mainController.showBusy();

            let downloadDocController = ($scope: angular.IScope, $timeout: angular.ITimeoutService) => {
                $scope["vm"] = new ap.viewmodels.documents.DownloadDocumentViewModel(data.document, data.version, this.$controllersManager.documentController, this.$mdDialog, this._utility);
            };
            downloadDocController.$inject = ["$scope", "$timeout"];
            this.$mdDialog.show({
                clickOutsideToClose: false,
                preserveScope: true,
                templateUrl: "me/PartialView?module=Document&name=DownloadDocumentDialog",
                fullscreen: true,
                controller: downloadDocController,
                onComplete: () => {
                    this.$controllersManager.mainController.hideBusy();
                }
            });
        }


        /**
        * Method use to show a toast when a version of a document is deleted
        **/
        private updateDocument() {
            this.$controllersManager.mainController.showToast("app.version.deleted", null);
        }

        /**
        * Public handler method executed when an action of the picture viewer is clicked.
        * This method is public because it's executed by the view
        * @param actionName this is the name of the action on which the user clicked
        */
        public handlePictureViewerActionClick(actionName: string): void {
            switch (actionName) {
                case "document.shownotes": this.showNotesList(); break;
                case "document.hidenotes":
                    this.hideNotesList();
                    if (!this._pictureViewModel.documentViewModel.noteWorkspaceVm.isNoteDetailOpened) {
                        this.$controllersManager.mainController.goBackToScreen(this._noteListScreenFullName);
                    }
                    this._noteListScreenFullName = undefined;
                    break;
                case "document.download":
                    if (this._isDocumentOpened === true && this._pictureViewModel && this._pictureViewModel.documentViewModel) {
                        this._pictureViewModel.documentViewModel.actionClick("document.download");
                    } else {
                        this.document.actionClick("document.download");
                    }
                    break;
                case "document.archive":
                    this.document.actionClick("document.archive");
                    break;
                case "document.unarchive":
                    this.document.actionClick("document.unarchive");
                    break;
                case "document.delete":
                    this.document.actionClick("document.delete");
                    break;
                case "document.edit":
                    this.document.actionClick("document.edit");
                    break;
                case "document.addversion":
                    this.document.actionClick("document.addversion");
                    break;
                case "document.rotateleft":
                    this.document.actionClick("document.rotateleft");
                    break;
                case "document.rotateright":
                    this.document.actionClick("document.rotateright");
                    break;
                case "pictureviewer.showversionscomparison":
                    this.document.actionClick("pictureviewer.showversionscomparison");
                    break;
                case "pictureviewer.hideversionscomparison":
                    this.document.actionClick("pictureviewer.hideversionscomparison");
                    break;
                case "report.sendByEmail":
                    this.document.actionClick("report.sendByEmail");
                    break;
                case "pictureviewer.viewnextdocument":
                    this.document.actionClick("pictureviewer.viewnextdocument");
                    break;
                case "pictureviewer.viewprevdocument":
                    this.document.actionClick("pictureviewer.viewprevdocument");
                    break;
            }
        }

        /*
        * Get current zoom level for document
        */
        public get currentZoomLevel() {
            return this._currentZoomLevel;
        }

        /*
        * Set current zoom level for document
        */
        public set currentZoomLevel(currentZoomLevel: number) {
            this._currentZoomLevel = currentZoomLevel;
        }

        /**
        * This method shows the notes lists of the current document
        */
        private showNotesList() {
            this._isNotesVisible = true;
            ap.viewmodels.home.ActionViewModel.getAction(this._pictureViewerActions, "document.hidenotes").isVisible = true;
            ap.viewmodels.home.ActionViewModel.getAction(this._pictureViewerActions, "document.shownotes").isVisible = false;
            this.$scope["noteWorkspaceVm"] = this._pictureViewModel.documentViewModel.noteWorkspaceVm;
            if (!this._pictureViewModel.documentViewModel.noteWorkspaceVm.isNoteDetailOpened) {
                this._noteListScreenFullName = this.$controllersManager.mainController.addScreen(this._pictureViewModel.documentViewModel.noteWorkspaceVm.noteListVm.screenInfo, true, true);
            }
        }

        /**
        * This method hides the notes lists of the current document
        */
        private hideNotesList() {
            this._isNotesVisible = false;
            ap.viewmodels.home.ActionViewModel.getAction(this._pictureViewerActions, "document.hidenotes").isVisible = false;
            ap.viewmodels.home.ActionViewModel.getAction(this._pictureViewerActions, "document.shownotes").isVisible = true;
        }

        /**
        * Dispose method
        */
        public dispose() {

            if (this._documentMetadataVm) {
                this._documentMetadataVm.dispose();
                this._documentMetadataVm = null;
            }

            if (this._pictureViewerActions) {
                for (let i: number = 0; i < this._pictureViewerActions.length; i++) {
                    this._pictureViewerActions[i].dispose();
                    this._pictureViewerActions[i] = null;
                }
                this._pictureViewerActions = null;
            }

            if (this.$controllersManager.documentController) {
                this.$controllersManager.documentController.off("opendocumentrequested", this.closeDocumentMetadata, this);
                this.$controllersManager.documentController.off("docdownloadsourcerequested", this.openDownloadDocumentPopup, this);
                this.$controllersManager.documentController.off("versiondeleted", this.updateDocument, this);
            }
            this._currentZoomLevel = 0;
        }

        /**
         * Clears the actions linked to the current document.  Only shownotes/hidenotes will remain because they belong to this ViewModel
         */
        private clearActions() {
            if (this._pictureViewerActions.length > 2) {
                for (let i = this._pictureViewerActions.length - 1; i >= 0; i--) {
                    if (this._pictureViewerActions[i].name !== "document.shownotes" && this._pictureViewerActions[i].name !== "document.hidenotes") {
                        this.pictureViewerActions.splice(i, 1);
                    }
                }
            }
        }

        constructor(private _utility: ap.utility.UtilityHelper, private $location: angular.ILocationService, private $q: angular.IQService, private $anchorScroll: angular.IAnchorScrollService, private $interval: angular.IIntervalService, private $scope: angular.IScope, private $mdDialog: angular.material.IDialogService, private $controllersManager: ap.controllers.ControllersManager) {
            this._documentMetadataVm = new DocumentMetadataViewModel(_utility, $interval, $q, $controllersManager, $location, $anchorScroll);
            this.$controllersManager.documentController.on("opendocumentrequested", this.closeDocumentMetadata, this);
            this.$controllersManager.documentController.on("docdownloadsourcerequested", this.openDownloadDocumentPopup, this);
            this.$controllersManager.documentController.on("versiondeleted", this.updateDocument, this);
            // actions displayed in the picture viewer
            this._pictureViewerActions = [];
            this._pictureViewerActions.push(new ap.viewmodels.home.ActionViewModel(this._utility, this._utility.EventTool, "document.shownotes", this._utility.rootUrl + "Images/html/icons/ic_list_white_24px.svg", true, null, "Show points list", true));
            this._pictureViewerActions.push(new ap.viewmodels.home.ActionViewModel(this._utility, this._utility.EventTool, "document.hidenotes", this._utility.rootUrl + "Images/html/icons/ic_close_white_24px.svg", false, null, "Hide points list", true));
            $scope.$on("$destroy", () => {
                this.dispose();
            });
        }

        private _pictureViewModel: PictureViewModel;
        private _documentOpenedScreenFullName: string;
        private _isDocumentOpened: boolean = false;
        private _pictureViewerActions: home.ActionViewModel[];
        private _noteListScreenFullName: string;
        private _isNotesVisible: boolean;
        private _isDocumentMetadataOpened: boolean = false;
        private _documentMetadataVm: DocumentMetadataViewModel = null;
        private _document: DocumentItemViewModel;
        private _currentZoomLevel: number = 0;
        private _isCompareMode: boolean = false;
        private _comesFromListPointsScreen: boolean = false;
    }
}