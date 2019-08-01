module ap.viewmodels.meetings {
    export class MeetingDocumentWorkspaceViewModel implements IDispose {

        /**
        * Method to change the current view of documents: List -> Grid or Grid -> List
        **/
        private _toggleView() {
            if (this._documentListVm && this._documentListVm !== null) {
                this._documentListVm.view = (this._documentListVm.view !== ap.viewmodels.documents.View.Thumb) ? ap.viewmodels.documents.View.Thumb : ap.viewmodels.documents.View.Grid;

                this.$controllersManager.mainController.getMainAction("documentsgrid").isVisible = !this._documentListVm.isThumbView;
                this.$controllersManager.mainController.getMainAction("documentsthumbs").isVisible = this._documentListVm.isThumbView;
            }
        }

        /**
        * Public getter to the documents list
        */
        public get documentListVm(): ap.viewmodels.documents.DocumentListViewModel {
            return this._documentListVm;
        }

        /**
        * Return true if the list is empty.  False otherwise
        */
        public get isEmpty(): boolean {
            return this._isEmpty;
        }

        /**
        * Method use to bind the second picture view model to the view
        **/
        public get linkedNoteDocumentPictureViewModel(): ap.viewmodels.documents.PictureViewModel {
            if (this.currentDocumentViewModel !== null && this.currentDocumentViewModel.documentViewModel.noteWorkspaceVm.noteDetailVm.noteDocumentList.selectedViewModel !== null) {
                return (<ap.viewmodels.notes.NoteDocumentViewModel>this.currentDocumentViewModel.documentViewModel.noteWorkspaceVm.noteDetailVm.noteDocumentList.selectedViewModel).pictureViewModel;
            } else {
                return null;
            }
        }

        /**
        * Public getter to the current document picture
        */
        public get currentDocumentViewModel(): ap.viewmodels.documents.PictureViewModel {
            return this._currentDocumentViewModel;
        }

        /**
        * Handler method when the criterions change
        */
        private criterionChangedHandler() {
            this.documentListVm.refresh();
        }

        /**
         * Public getter to the document metadata
         */
        public get documentMetadataVm(): ap.viewmodels.documents.DocumentMetadataViewModel {
            return this._documentUtilsVm.documentMetadataVm;
        }

        /**
        * Get document utils
        **/
        public get documentUtilsVm(): ap.viewmodels.documents.DocumentUtilsViewModel {
            return this._documentUtilsVm;
        }

        /*
        * Public getter to know if only the first pictureViewer is displayed or the second
        */
        public get isShowingOriginalPictureViewer(): boolean {
            if (this._documentUtilsVm.pictureViewModel && this._documentUtilsVm.pictureViewModel.documentViewModel.noteWorkspaceVm && this._documentUtilsVm.pictureViewModel.documentViewModel.noteWorkspaceVm.noteDetailVm.noteDocumentList) {
                return !this._documentUtilsVm.pictureViewModel.documentViewModel.noteWorkspaceVm.noteDetailVm.noteDocumentList.isDisplayingPictureViewer;
            } else {
                return false;
            }
        }

        public dispose() {
            this.$controllersManager.mainController.off("currentmeetingchanged", this.handleCurrentMeetingChanged, this);
            this.$controllersManager.documentController.off("documentmetadatarequested", this.showDocumentMetadata, this);
            this._api.off("showdetailbusy", this.changeVisibleDetailPaneBusy, this);
            this._documentListVm.dispose();
            this._documentListVm = null;
        }

        /**
        * This method is used to handle the events received from the MainController
        **/
        private _handleMainControllerEvents(action: string): void {
            switch (action) {
                case "documentsthumbs":
                case "documentsgrid":
                    this._toggleView();
                    break;
                case "refresh":
                    this.refreshDocumentsList();
                    break;
                case "showmeetingreport":
                    this._showReport();
                    break;
            }
        }

        private refreshDocumentsList() {
            this._documentListVm.refresh(this._documentListVm.screenInfo.selectedEntityId).then(() => {
                if (this._documentListVm.screenInfo.selectedEntityId) {
                    if (this._documentListVm.screenInfo.isInfoOpened) {
                        this._documentUtilsVm.document = this._documentListVm.selectedEntity;
                        this._documentUtilsVm.openDocumentMetadata();
                    }
                }
            });
        }

        /*
        * To handle FAB actions
        */
        private handleAddActionEvents(action: ap.controllers.AddActionClickEvent): void {
            let actionName = action.name;
            switch (actionName) {
                case "meetingdocument.attachdocument":
                    this.importDocument();
                    break;
                case "meetingdocument.uploaddocument":
                    this._uploadDocumentMeeting();
                    break;
            }
        }

        /**
         * This method will be called when the user has clicked on the action to upload document.
         * A method displays the add file dialog window with project and current meeting.
         * @param isReopened an indicator of whether this method should show the old popup of a new popup
         */
        private _uploadDocumentMeeting(isReopened: boolean = false) {
            if (!isReopened) {
                let project = this.$controllersManager.mainController.currentProject();
                let meeting: ap.models.meetings.Meeting = this.$controllersManager.mainController.currentMeeting;
                let onlyPicture = !project.UserAccessRight.CanUploadDoc;
                let photoFolder: ap.models.projects.Folder = null;

                if (onlyPicture) {
                    photoFolder = new ap.models.projects.Folder(this.$utility);
                    photoFolder.createByJson({ Id: project.PhotoFolderId });
                }

                this._addNewDocumentVM = new ap.viewmodels.documents.AddNewDocumentViewModel(this.$utility, this.$controllersManager.documentController, this.$controllersManager.mainController, this.$mdDialog, this.$servicesManager.cloudService, this.$interval, onlyPicture, photoFolder, meeting.Title);
            }

            this._showUploadDocumentPopup().then((response) => {
                if (response && response instanceof ap.viewmodels.documents.AddNewDocumentResponse) {
                    this._onDocumentForUploadingAdded(<ap.viewmodels.documents.AddNewDocumentResponse>response);
                } else if (response === ap.viewmodels.documents.AddDocumentStatus.Save) {
                    this._onUploadedDocumentsSaved();
                }
            });
        }

        /**
         * Displays a popup to load a new document
         * @returns a promise that will be resolved once a popup is closed
         */
        private _showUploadDocumentPopup(): angular.IPromise<any> {
            this.$controllersManager.mainController.showBusy();

            let uploadDocController = ($scope: angular.IScope, $timeout: angular.ITimeoutService) => {
                $scope["vm"] = this._addNewDocumentVM;
            };
            uploadDocController.$inject = ["$scope", "$timeout"];
            return this.$mdDialog.show({
                clickOutsideToClose: false,
                preserveScope: true,
                ariaLabel: "Add new document to the list",
                templateUrl: "me/PartialView?module=Document&name=AddNewDocumentDialog",
                fullscreen: true,
                controller: uploadDocController,
                onComplete: () => {
                    this.$controllersManager.mainController.hideBusy();
                }
            });
        }

        /**
         * A handler for adding a new document to a list of uploaded documents
         * @param dialogResponse a response from files adding dialog that contains a list of selected files
         */
        private _onDocumentForUploadingAdded(dialogResponse: ap.viewmodels.documents.AddNewDocumentResponse) {
            // Keep the files selected by the user
            this._filesToUpload = dialogResponse.files;

            // Open the folder selector to let the user select the folder
            this.showFolderSelector();
        }

        /**
         * A handler for saving a list of chosen documents to a list
         */
        private _onUploadedDocumentsSaved() {
            let documents: ap.models.documents.Document[] = [];
            let saveResult = this._addNewDocumentVM.saveResult;
            for (let i = 0; i < saveResult.successList.length; i++) {
                documents.push(<ap.models.documents.Document>saveResult.successList[i].document);
            }

            this.$controllersManager.meetingController.addMeetingDocument(documents, this.$controllersManager.mainController.currentMeeting.Id).then(() => {
                let lastDocumentAddedId: string;
                let newDocuments = this._addNewDocumentVM.newDocuments;
                if (newDocuments && newDocuments.length) {
                    for (let i = newDocuments.length - 1; i >= 0; i--) {
                        let document = newDocuments[i].document;
                        if (document && !document.IsNew) {
                            lastDocumentAddedId = document.Id;
                            break;
                        }
                    }
                }

                this._documentListVm.refresh(lastDocumentAddedId);
            });
        }

        /**
         * This method is used to open the folder selector to let the user select folder for upload files
         */
        private showFolderSelector() {
            this.$controllersManager.mainController.showBusy();

            let folderSelectorController = ($scope: angular.IScope, $timeout: angular.ITimeoutService) => {
                this._folderSelectorVm = new ap.viewmodels.folders.FolderSelectorViewModel($scope, this.$mdDialog, this.$utility, this._api, this.$q, $timeout, this.$mdSidenav, this.$location, this.$anchorScroll, this.$interval, this.$controllersManager, this.$servicesManager);
                this._folderSelectorVm.titleKey = "app.document.select_folder_for_upload_title";
                this._folderSelectorVm.on("mainactionclicked", this.onFolderSelected, this);
                $scope["folderSelectorVm"] = this._folderSelectorVm;
            };
            folderSelectorController.$inject = ["$scope", "$timeout"];
            this.$mdDialog.show({
                clickOutsideToClose: false,
                preserveScope: true,
                templateUrl: "me/PartialView?module=Document&name=FolderSelector",
                fullscreen: true,
                controller: folderSelectorController,
                onComplete: () => {
                    this.$controllersManager.mainController.hideBusy();
                }
            });
        }

        /**
        * This method is used to reopen the add document dialog after the user select the folder 
        **/
        private onFolderSelected(selectedFolder: ap.models.projects.Folder) {
            this.$mdDialog.hide();
            this._addNewDocumentVM.addFiles(this._filesToUpload, selectedFolder);
            this._uploadDocumentMeeting(true);
        }

        /**
        * This method will be called when the user has clicked on the action to import document to the note (attach project's docs).
        * A dialog will be shown to display the folder structure and linked docs to let the user to select some of them.
        **/
        private importDocument() {
            this.$controllersManager.mainController.showBusy();
            let vm: ap.viewmodels.documents.DocumentSelectorViewModel = new ap.viewmodels.documents.DocumentSelectorViewModel(this.$scope, this.$mdDialog, this.$utility, this._api, this.$q, this.$timeout, "app.notes.select_documents_to_list", "Save", this.$mdSidenav,
                this.$location, this.$anchorScroll, this.$interval, this.$controllersManager, this.$servicesManager);
            vm.workspace.documentListVm.isListInSelector = true;
            let importDocController = ($scope: angular.IScope, $timeout: angular.ITimeoutService) => {
                $scope["vm"] = vm;
                $scope["documentWorkspaceVm"] = vm.workspace;
            };
            importDocController.$inject = ["$scope", "$timeout"];
            this.$mdDialog.show({
                clickOutsideToClose: true,
                preserveScope: true,
                templateUrl: "me/PartialView?module=Document&name=DocumentSelector",
                fullscreen: true,
                onComplete: () => {
                    this.$controllersManager.mainController.hideBusy();
                },
                controller: importDocController
            }).then((selectedDocuments: ap.viewmodels.documents.DocumentItemViewModel[]) => {
                vm.dispose();
                this._importDocumentAccepted(selectedDocuments);
            });
        }

        /**
         * This method will be called when the user has selected some documents in the project's structure to attach them to the Meeting. 
         * @param selectedDocuments DocumentItemViewModel checked in the popup in the dialog to select docs to import.
         **/
        private _importDocumentAccepted(selectedDocuments: ap.viewmodels.documents.DocumentItemViewModel[]) {
            let documents: ap.models.documents.Document[] = [];
            for (let i = 0; i < selectedDocuments.length; i++) {
                documents.push(selectedDocuments[i].originalDocument);
            }
            let _selt = this;
            this.$controllersManager.meetingController.addMeetingDocument(documents, this.$controllersManager.mainController.currentMeeting.Id).then(() => {
                this._documentListVm.refresh();
            });
        }

        /**
        * This method use for show Report for list in picture viewer
        **/
        private _showReport() {
            let meetingId = this.$controllersManager.mainController.currentMeeting.Id;
            this.$controllersManager.documentController.getMeetingReportStatus(meetingId).then((report: ap.models.meetings.MeetingReport) => {
                if (report !== null) {
                    if (report.Document.ProcessingStatus !== ap.models.documents.ProcessingStatus.GenerationReportFailed && report.Document.ProcessingStatus !== ap.models.documents.ProcessingStatus.TilesProcessingFailed) {
                        if (report.Document.ProcessingStatus === ap.models.documents.ProcessingStatus.FullyCompleted) {
                            this.documentListVm.screenInfo.showMeetingReport = true;
                            let previewFlowStateParams = new ap.controllers.DocumentViewFlowStateParam(this.$utility, report.Id, undefined, this.$controllersManager.mainController.currentMeeting.Id, this.$controllersManager.uiStateController.mainFlowState, undefined, undefined, true);
                            previewFlowStateParams.documentIds = this.documentListVm.listVm.ids;
                            this.$controllersManager.uiStateController.changeFlowState(ap.controllers.MainFlow.DocumentView, previewFlowStateParams);
                        } else {
                            this.$controllersManager.mainController.showMessageKey("app.report.process.message", "app.report.process.title", null, controllers.MessageButtons.Ok);
                        }
                    } else {
                        this.$controllersManager.mainController.showMessageKey("app.report.process.failed.message", "app.report.process.failed.title", null, controllers.MessageButtons.Ok);
                    }
                } else {
                    this.$controllersManager.mainController.showMessageKey("No report has been generated for this list yet", "No reports in list", null, controllers.MessageButtons.Ok);
                }
            });
        }

        /**
         * Open restored linked point details panel
         * @param isLoadedChanged List's loading status value
         */
        private openRestoredLinkedPoint(isLoadedChanged: boolean) {
            if (isLoadedChanged === true) {
                let noteWorkspaceVm = this._documentUtilsVm.pictureViewModel.documentViewModel.noteWorkspaceVm;
                let screenInfo: ap.misc.notes.NoteDetailScreenInfo = noteWorkspaceVm.noteDetailVm.screenInfo;
                let selectedNote: ap.viewmodels.notes.NoteItemViewModel = <ap.viewmodels.notes.NoteItemViewModel>noteWorkspaceVm.noteListVm.listVm.getEntityById(screenInfo.selectedEntityId);
                if (selectedNote) {
                    noteWorkspaceVm.noteListVm.selectEntity(selectedNote);
                    noteWorkspaceVm.toggleRight(selectedNote);
                }
                noteWorkspaceVm.noteListVm.listVm.off("isLoadedChanged", this.openRestoredLinkedPoint, this);
            }
        }

        /**
         * Handler method called when a document is selected in the documents list
         */
        private selectedDocumentChanged(documentVm: ap.viewmodels.documents.DocumentItemViewModel) {
            if (!documentVm) {
                return;
            }
            this._documentUtilsVm.document = documentVm;
        }



        /**
        * Handler for tracking changes of the current meeting
        * @param meeting New current meeting value
        **/
        private handleCurrentMeetingChanged() {
            let meeting = this.$controllersManager.mainController.currentMeeting;
            if (meeting) {
                // send event to Segment.IO
                this.$servicesManager.toolService.sendEvent("cli-menu-open documents", new Dictionary([new KeyValue("cli-menu-open documents-screenname", "lists")]));

                this.$controllersManager.uiStateController.updateScreenInfo(this._documentListVm.screenInfo);
                this.$controllersManager.mainController.initScreen(this._documentListVm.screenInfo);

                this.documentListVm.listVm.on("pageloaded", this.restoreDocumentsState, this);
                this.documentListVm.listVm.on("pageloaded", this.pageLoadedHandler, this);
                this.$controllersManager.uiStateController.off("mainflowstatechanged", this.handleCurrentMeetingChanged, this);
            }
        }

        /**
         * List's page loaded event handler
         * @param items
         */
        private pageLoadedHandler(items: ap.viewmodels.documents.DocumentItemViewModel[]) {
            // restore screen info
            let screenInfo = this._documentListVm.screenInfo;
            if (screenInfo.checkedEntitiesId && screenInfo.checkedEntitiesId.length) {
                items.forEach((item: ap.viewmodels.documents.DocumentItemViewModel) => {
                    if (screenInfo.checkedEntitiesId.indexOf(item.originalDocument.Id) >= 0) {
                        item.defaultChecked = true;
                    }
                });
                this.documentListVm.gotoMultiActions();
            }
        }

        /**
         * Restore documents page's previous state
         * @param isLoaded Flag indicates that documents list have been loaded
         */
        private restoreDocumentsState(items: ap.viewmodels.documents.DocumentItemViewModel[]) {
            if (this._documentListVm.screenInfo.selectedEntityId) {
                this._documentListVm.selectItem(this._documentListVm.screenInfo.selectedEntityId);
            }
            if (this._documentListVm.screenInfo.isInfoOpened) {
                this._documentUtilsVm.document = this._documentListVm.selectedEntity;
                this._documentUtilsVm.openDocumentMetadata();
            }
            if (this.documentListVm.screenInfo.showMeetingReport === true) {
                this._showReport();
            }
            this._documentListVm.listVm.off("pageloaded", this.restoreDocumentsState, this);
        }

        /**
        * Event handler when there is an item checked
        **/
        private itemCheckedChange() {
            let checkedItems = this._documentListVm.listVm.getCheckedItems();
            if (checkedItems.length > 0)
                this._documentListVm.gotoMultiActions();
            else if (checkedItems.length === 0)
                this._documentListVm.closeMultiActions();
        }

        /**
         * Open document preview in picture viewer
         * @param event Preview event object
         */
        private openDocument(event: ap.viewmodels.documents.DocumentPreviewEvent) {
            if (this._meetingReportVm && event.documentId === this._meetingReportVm.originalDocument.Id) {
                this._showReport();
            } else {
                let previewFlowStateParams = new ap.controllers.DocumentViewFlowStateParam(this.$utility, event.documentId, event.versionId, this.$controllersManager.mainController.currentMeeting.Id, this.$controllersManager.uiStateController.mainFlowState, undefined, undefined, event.isReport);
                previewFlowStateParams.documentIds = this.documentListVm.listVm.ids;
                this.$controllersManager.uiStateController.changeFlowState(ap.controllers.MainFlow.DocumentView, previewFlowStateParams);
            }
        }

        /**
         * Show document metadata
         * @param document Document entity
         */
        private showDocumentMetadata(document: ap.models.documents.Document) {
            let entityVm = <ap.viewmodels.documents.DocumentItemViewModel>this.documentListVm.listVm.getEntityById(document.Id);
            this.documentListVm.selectEntity(entityVm);
            this._documentUtilsVm.document = entityVm;
            this._documentUtilsVm.openDocumentMetadata();
        }

        private changeVisibleDetailPaneBusy(showBusy: boolean) {
            this.documentMetadataVm.showDetailPaneBusy = showBusy;
        }

        /**
        * Handler method called when the documents ids of the list are loaded
        */
        private documentsIdsLoaded(isIdsLoaded: boolean) {
            if (isIdsLoaded) {
                // get the document id of the meeting report
                this.$servicesManager.documentService.getMeetingReportDocument(this.$controllersManager.mainController.currentMeeting.Id, this._docWorkspaceElement.documentListOption.getPathToLoad()).then((apiResponse: services.apiHelper.ApiResponse) => {
                    if (apiResponse && apiResponse.data) {
                        this._meetingReportVm = new viewmodels.documents.DocumentItemViewModel(this.$utility, this.$q, this.documentListVm.listVm,
                            new ap.viewmodels.documents.DocumentItemParameter(0, apiResponse.data, null, null, this.$utility, this.$controllersManager.documentController, this.$controllersManager.mainController, this.$controllersManager.meetingController));
                        this._meetingReportVm.init(apiResponse.data);
                        this._meetingReportVm.isMeetingReport = true;
                        this.documentListVm.loadDocumentStats(new Dictionary([new KeyValue(this._meetingReportVm.originalDocument.Id, this._meetingReportVm)]));
                        if (this.documentListVm.listVm.isDeferredLoadingMode) {
                            // use virtual-repeat so sourceItems as the full length since the beginning
                            this.documentListVm.listVm.sourceItems.push(this._meetingReportVm);
                            this._meetingReportVm.on("previewclicked", this._showReport, this);
                        }
                        this._addedItemsCount = 1;

                        if (this.documentListVm.listVm.sourceItems.length <= 0) {
                            this.documentsPageLoaded();
                            this._isEmpty = false;
                        }

                    } else {
                        // isEmpty = false by default.  In this case there is no meetingReport so we check whether there are items in the list
                        this._isEmpty = this.documentListVm.listVm.sourceItems.length <= 0;
                    }
                });
            }
        }

        /**
         * Returns specific items to this list (a report in this case)
         * @param index The index of the item to get
         */
        private getItemAtIndex(index: number): viewmodels.documents.DocumentItemViewModel {
            if (index === this.documentListVm.listVm.sourceItems.length - 1) {
                return <viewmodels.documents.DocumentItemViewModel>this.documentListVm.listVm.sourceItems[index];
            }
        }

        /**
         * Returns the number of custom elements added to the list
         */
        private addedItemsCount(): number {
            return this._addedItemsCount;
        }

        /**
         * Handler method called when a page of documents is loaded
         * @param loadedItems The loaded items of this page
         */
        private documentsPageLoaded(loadedItems?: viewmodels.documents.DocumentItemViewModel[]) {
            if (this.documentListVm.listVm.isDeferredLoadingMode) {
                return;
            }

            if (!loadedItems || this.documentListVm.listVm.getItemIndex(loadedItems[loadedItems.length - 1].meetingDocument.Id) === this.documentListVm.listVm.ids.length - 1) {
                // the last page has been loaded
                // use ng-repeat so the sourceItems as the length of the loaded items
                this.documentListVm.listVm.sourceItems.push(this._meetingReportVm);
                this.documentListVm.listVm.count;
            }
        }

        static $inject = ["$scope", "Utility", "Api", "$q", "$timeout", "$location", "$anchorScroll", "$interval", "$mdDialog", "ControllersManager", "$mdSidenav", "ServicesManager"];
        constructor(private $scope: ng.IScope, private $utility: ap.utility.UtilityHelper, private _api: ap.services.apiHelper.Api, private $q: angular.IQService, private $timeout: angular.ITimeoutService,
            private $location: angular.ILocationService, private $anchorScroll: angular.IAnchorScrollService, private $interval: angular.IIntervalService, private $mdDialog: angular.material.IDialogService,
            private $controllersManager: ap.controllers.ControllersManager, private $mdSidenav: angular.material.ISidenavService, private $servicesManager: ap.services.ServicesManager) {

            this._api.on("showdetailbusy", this.changeVisibleDetailPaneBusy, this);

            this._isEmpty = false;
            this._addedItemsCount = 0;

            this._docWorkspaceElement = new ap.viewmodels.documents.DocumentWorkspaceElement(true);
            let docVmNoteWorkspaceOpt = new ap.viewmodels.documents.DocumentVmNoteWorkspaceOption($scope, this.$mdSidenav, this._api, this.$q, this.$mdDialog, this.$timeout, this.$location, this.$anchorScroll, this.$interval, this.$servicesManager);
            this._documentListVm = new ap.viewmodels.documents.DocumentListViewModel($scope, $mdDialog, $utility, _api, $q, $timeout, $controllersManager, $servicesManager, this._docWorkspaceElement.documentListOption, null, true, docVmNoteWorkspaceOpt,
                new viewmodels.GetItemAtIndexParameter(this, this.getItemAtIndex, this.addedItemsCount));

            if (this.documentListVm.screenInfo.mainSearchInfo.criterions.length === 0) { // If not default criterions defined, the default one should be the active documents
                this.documentListVm.screenInfo.mainSearchInfo.addCriterion(this.documentListVm.screenInfo.mainSearchInfo.predefinedFilters[0]);
            }
            this._mainActions = [];
            if (this._documentListVm && this._documentListVm.screenInfo) {
                this._mainActions = this._mainActions.concat(this.documentListVm.screenInfo.actions);
                this._documentListVm.screenInfo.actions = this._mainActions;

                this._documentListVm.screenInfo.on("actionclicked", this._handleMainControllerEvents, this);
                this._documentListVm.screenInfo.on("addactionclicked", this.handleAddActionEvents, this);
                if (this._documentListVm.screenInfo.mainSearchInfo) {
                    this._documentListVm.screenInfo.mainSearchInfo.on("criterionschanged", this.criterionChangedHandler, this);
                }
            }
            this._documentListVm.on("previewclicked", this.openDocument, this);
            this._documentListVm.listVm.on("isCheckedChanged", this.itemCheckedChange, this);
            this._documentListVm.listVm.on("selectedItemChanged", this.selectedDocumentChanged, this);
            this._documentListVm.listVm.on("idsloaded", this.documentsIdsLoaded, this);
            this._documentListVm.listVm.on("pageloaded", this.documentsPageLoaded, this);
            if (this.$controllersManager.mainController.currentMeeting) {
                this.handleCurrentMeetingChanged();
            } else {
                this.$controllersManager.mainController.on("currentmeetingchanged", this.handleCurrentMeetingChanged, this);
            }
            this._documentUtilsVm = new ap.viewmodels.documents.DocumentUtilsViewModel($utility, $location, $q, $anchorScroll, $interval, $scope, $mdDialog, $controllersManager);
            this.$controllersManager.documentController.on("documentmetadatarequested", this.showDocumentMetadata, this);

            $scope.$on("$destroy", () => {
                this.dispose();
            });
        }
        private _mainActions: ap.viewmodels.home.ActionViewModel[];
        private _documentListVm: ap.viewmodels.documents.DocumentListViewModel;
        private _documentUtilsVm: ap.viewmodels.documents.DocumentUtilsViewModel;
        private _currentDocumentViewModel: ap.viewmodels.documents.PictureViewModel = null;
        private _filesToUpload: File[] = null; // User to keep the selected files make by the user
        private _addNewDocumentVM: ap.viewmodels.documents.AddNewDocumentViewModel;
        private _folderSelectorVm: ap.viewmodels.folders.FolderSelectorViewModel;
        private _docWorkspaceElement: ap.viewmodels.documents.DocumentWorkspaceElement;
        private _meetingReportVm: viewmodels.documents.DocumentItemViewModel;
        private _isEmpty: boolean;
        private _addedItemsCount: number;
    }
}