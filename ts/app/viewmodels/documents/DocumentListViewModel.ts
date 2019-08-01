module ap.viewmodels.documents {
    /**
     * This class is used to create the parameter needed for each item.
     **/
    export class DocumentItemParameterBuilder implements ItemParameterBuilder {
        public get isMeetingDocument(): boolean {
            return this._isMeetingDocument;
        }

        createItemParameter(itemIndex: number, dataSource: any, pageDesc: PageDescription, parameters: LoadPageSuccessHandlerParameter, utility: ap.utility.UtilityHelper): ItemConstructorParameter {
            return new DocumentItemParameter(itemIndex, dataSource, pageDesc, parameters, utility, this.documentController, this.mainController, this.meetingController, this.isMeetingDocument);
        }

        constructor(private documentController: ap.controllers.DocumentController, private mainController: ap.controllers.MainController, private meetingController: ap.controllers.MeetingController, private _isMeetingDocument: boolean = false) { }
    }

    /**
     * Helper Class to know which documents (and which version) to display on screen
     */
    export class DocumentPreviewEvent {

        /**
         * Get the document id to display
         */
        public get documentId() {
            return this._documentId;
        }

        /**
         * Get the document's version id to display
         */
        public get versionId() {
            return this._versionId;
        }

        /**
         * To know if the document to open is a meeting or not
         */
        public get isReport(): boolean {
            return this._isReport;
        }

        constructor(private _documentId: string, private _versionId?: string, private _isReport?: boolean) { }
    }

    export class DocumentListViewModel extends ListWorkspaceViewModel implements IDispose {

        /**
        * Method used to know if the item in param is the last of the list
        * @param item the note we want to know if it is the last of the list
        **/
        public isLast(item: ap.viewmodels.documents.DocumentItemViewModel): boolean {
            if (item && this.listVm.sourceItems[this.listVm.sourceItems.length - 1] && this.listVm.sourceItems[this.listVm.sourceItems.length - 1].originalEntity) {
                if (this.meeting !== null && this.meeting !== undefined) {
                    let itemParent = (<ap.viewmodels.documents.DocumentItemViewModel>this.listVm.sourceItems[this.listVm.sourceItems.length - 1]).parentEntity;
                    if (itemParent && itemParent.Id === item.parentEntity.Id) {
                        return true;
                    }
                } else if (this.listVm.sourceItems[this.listVm.sourceItems.length - 1].originalEntity.Id === item.originalEntity.Id) {
                    return true;
                }
            }
            return false;
        }

        /**
        * Return actions displayed in a status bar
        **/
        public get statusActions(): Array<ap.viewmodels.home.ActionViewModel> {
            return this._statusActions;
        }

        public get isChrome(): boolean {
            return this.$utility.isChrome();
        }

        /**
        * Method used to enable/disable the drag and drop in document list
        * For exemple in document selector
        **/
        public get isNeedingDrag(): boolean {
            return this._isNeedingDrag;
        }

        /**
        * Property to know if the list is in a selector
        **/
        public get isSelector(): boolean {
            return this._isSelector;
        }

        public set isListInSelector(value: boolean) {
            this._isSelector = value;
            this._isNeedingDrag = !value;
        }

        /**
        * To know the current folder which the list document is show
        * - Undefined means to clear document's list.
        * - Null means no folder selected, all document are wanted.
        **/
        public get folder(): ap.models.projects.Folder {
            return this._folder;
        }

        public set folder(value: ap.models.projects.Folder) {
            if (this._meeting !== null) {
                throw new Error("Cannot set folder if has MeetingDocument");
            }

            if (value !== this._folder) {
                this._folder = value;
                this.$controllersManager.mainController.closeMultiActionsMode();
                // When folder list is refreshed it set the folder is undefined in this case we dont need to reload, just clear items"
                if (this._folder === undefined) {
                    this.listVm.clear();
                } else {
                    this.load(this._itemToSelect).then(() => {
                        this._listener.raise("folderchanged", this._folder);
                    });
                }

                this.closeMultiActions();
                if (this._addAccessRight)
                    this._addAccessRight.folder = this._folder;
                this.calculateAddActionAccess();
                this.calculatePrintActionAccess();
                if (this._folder === undefined) {
                    this._listener.raise("folderchanged", this._folder);
                }
            }
        }

        /**
         *  To know if the predefined filter active or archived is selected. Null means both are not selected.
         **/
        public get hasActiveFilter(): boolean {
            return this._hasActiveFilter;
        }

        /**
         * This property will specify the parameter of the list if the list should be displayed in the main screen.
         **/
        public get screenInfo(): ap.misc.documents.DocumentListScreenInfo {
            return this._screenInfo;
        }

        /**
         * This property is id for  Meeting
         **/
        public get meeting(): ap.models.meetings.Meeting {
            return this._meeting;
        }

        /**
        * Used to know if we can sort or not (sort not available in meetings)
        */
        public get canSort(): boolean {
            return this._canSort;
        }

        /*
        * Public getter to get the view type of the list
        * @returnValue View.Thumb or View.Grid
        */
        public get view(): View {
            return this._view;
        }

        /*
        * Public setter to set a value to the view property
        */
        public set view(newValue: View) {
            if (this._view !== newValue) {
                this._view = newValue;
                if (!this._isDocumentSelector)
                    this.$utility.Storage.Local.set("documents.view", this._view);
                this.toggleView(true);
            }
        }

        /**
        * Returns true if some items are checked (not all)
        * Returns false in the other cases
        */
        public get isIndeterminate(): boolean {
            return this._isIndeterminate;
        }

        /**
        * Public setter to set a value to check if view model created from document selector 
        */
        public set isDocumentSelector(val: boolean) {
            this._isDocumentSelector = val;
        }

        /**
         * Determines whether a list of document is available and can be used
         */
        public get isListVmReady(): boolean {
            return this._isListVmReady;
        }

        /**
         * Calls on `ischeckedchanged` event. Checks number of selected poinst with number of uploaded points. If it is equal - set selected = true, otherwise - false.
         */
        public checkSelectedAll(isPageLoaded?: boolean) {
            let checkedItemsLength: number = this.listVm.listidsChecked.length;
            let listLength: number = this.listVm.ids.length;

            if (this.listVm.isIdsLoaded && listLength > 0) {
                this.listVm.selectedAll = listLength === checkedItemsLength || (this.listVm.selectedAll && isPageLoaded);
                this._isIndeterminate = !this.listVm.selectedAll && checkedItemsLength > 0;
            }
        }

        /**
         * Add or remove the id of the checked/unchecked document to/from the ids of checked documents
         */
        private itemIsCheckedChanged(item: IEntityViewModel) {
            if (item.isChecked) {
                if (this.listVm.listidsChecked.indexOf(item.originalEntity.Id) < 0) {
                    this.listVm.listidsChecked.push(item.originalEntity.Id);
                }
            } else {
                if (this.listVm.listidsChecked.indexOf(item.originalEntity.Id) >= 0) {
                    this.listVm.listidsChecked.splice(this.listVm.listidsChecked.indexOf(item.originalEntity.Id), 1);
                }
            }
        }

        /*
        * Event handler when there is an item checked
        * @param item: the item when it happen
        */
        private itemCheckedChange(item: ap.viewmodels.documents.DocumentItemViewModel) {
            // first add the id to the lists of checked ids (or remove it in case of item unchecked)
            this.itemIsCheckedChanged(item);

            this.checkSelectedAll();

            this.manageMultiActionMode();
        }

        /**
         * Manage the multi action mode
         */
        private manageMultiActionMode() {
            if (!this._isForDocumentModule) {
                return;
            }

            if (this.listVm.listidsChecked.length > 0)
                this.gotoMultiActions();
            else if (this.listVm.listidsChecked.length === 0) {
                this.closeMultiActions();
                this.$controllersManager.mainController.closeMultiActionsMode();
            }

            // then update the nb of checked items in the multi action mode and update the screenInfo
            if (this._isMultiActions && this._multiActions) {
                this._multiActions.itemsChecked = this.listVm.listidsChecked;
            }

            this.updateScreenInfoCheckedItems();
        }

        /**
         * Update the nb of checkedItems in the screenInfo (useful to keep the checked items checked after a refresh)
         */
        private updateScreenInfoCheckedItems() {
            if (this._isForDocumentModule) {
                this._screenInfo.checkedEntitiesId = this.listVm.listidsChecked.slice();
            }
        }

        /**
         * Tells if all items should be checked or not
         */
        public toggleAll() {
            this.listVm.selectedAll = !this.listVm.selectedAll;

            this.listVm.initializeDefaultCheckedItems();

            this.checkSelectedAll();

            this.manageMultiActionMode();
        }

        /**
        * Method to change the current view of documents: List -> Grid or Grid -> List
        **/
        public documnentListStatusActionClick(actionName: string) {
            switch (actionName) {
                case "documentsthumbs":
                case "documentsgrid":
                    this.view = (this.view !== View.Thumb) ? View.Thumb : View.Grid;
                    break;
            }
        }
        /*
        * When the change of the view mode, we need to tell listVM change the way it load data
        * @param withRefresh: when the call from constructor then we dont need to refresh data in this case, otherwise need to refresh data
        */
        private toggleView(withRefresh: boolean = false) {
            this.listVm.isDeferredLoadingMode = this._view !== View.Thumb;

            // Update visibility of actions
            if (this._documentsGridModeAction) {
                this._documentsGridModeAction.isVisible = this._view === View.Grid;
            }
            if (this._documentsThumbsModeAction) {
                this._documentsThumbsModeAction.isVisible = this._view === View.Thumb;
            }

            if (withRefresh) this.refresh();
        }

        /*
        * This method is used to refresh the list of document
        * @param documentToSelect is the document will be select after refresh
        */
        public refresh(documentToSelect?: string): angular.IPromise<ap.viewmodels.GenericPagedListViewModels> {
            if (documentToSelect) {
                this._itemToSelect = documentToSelect;
            }
            this.listVm.clearLoaderCache();
            return this.load(this._itemToSelect);
        }

        public load(documentToSelect?: string): angular.IPromise<GenericPagedListViewModels> {
            if (this._sortState && !this._docListOptions.isMeetingDocument) {
                this.listVm.changeSortOrder(this._sortState.toQueryParam());
            }
            if (this.isThumbView) {
                documentToSelect = null;
            }
            this._currentLoadingPromise = super.load(documentToSelect).finally(() => {
                this._currentLoadingPromise = null;
            });
            this._isListVmReady = true;
            return this._currentLoadingPromise;
        }

        /**
         * Handles a situation when a user has scrolled a list of document to the end. We
         * should load a next page of documents in this case.
         * This method is used directly in the template.
         */
        public onListScrolledToEnd() {
            if (this._currentLoadingPromise) {
                return;
            }

            // We should only trigger loading of a next page when a previous page is completelly
            // loaded. Otherwise it is possible that the same page will be loaded several times.
            this._currentLoadingPromise = this.listVm.loadNextPage().then(() => {
                return this.listVm;
            }).finally(() => {
                this._currentLoadingPromise = null;
            });
        }

        /*
        * Public getter to which view is currently set
        */
        public get isThumbView(): boolean {
            return this._view === View.Thumb;
        }

        /**
         * This method is overrided to know on which properties the searchText must apply the search
         **/
        protected getSearchedTextProperties(): string[] {
            return this._propsSearchedText;
        }

        /**
         * This method is overrided to add customParam while the API call to get entities. We want to have the correct display name of each contact in the list
         **/
        protected createCustomParams() {
            if (this._docListOptions) {
                if (this._docListOptions.isMeetingDocument) {
                    this.listVm.addCustomParam("ppactions", "updatedisplaynamesfromcontacts,updatemeetingpointscount");
                } else {
                    this.listVm.addCustomParam("ppactions", "updatedisplaynamesfromcontacts");
                }
            }
        }

        /**
         * This method is overrided to build the default filter to get the entities. Get document not archived on current project and selected folder
         **/
        protected buildCustomFilter(): angular.IPromise<string> {
            let deferred: ng.IDeferred<string> = this.$q.defer();
            deferred.resolve(this.buildDocumentsFilter());
            return deferred.promise;
        }

        /**
         * Build the default filter for the documents
         */
        private buildDocumentsFilter(): string {
            let currentProjectId = utility.UtilityHelper.createEmptyGuid();
            let currentProject = this.$controllersManager.mainController.currentProject();
            if (currentProject)
                currentProjectId = currentProject.Id;

            let currentMeeting;
            let prefix: string = (<DocumentItemParameterBuilder>this.listVm.options.itemParameterBuilder).isMeetingDocument ? "Document." : "";
            let filter = "Filter.Eq(" + prefix + "Folder.Project.Id," + currentProjectId + ")";
            if (this._docListOptions && this._docListOptions.isMeetingDocument) {
                currentMeeting = this.$controllersManager.mainController.currentMeeting;
                filter = Filter.and(filter, Filter.eq("Meeting.Id", currentMeeting.Id));
            }

            if (this._folder && this._folder !== null) {
                filter = "Filter.And(" + filter + ",Filter.Eq(" + prefix + "FolderId," + this._folder.Id + "))";
            }

            if (this._screenInfo && this._screenInfo.mainSearchInfo) {
                if (this._isForDocumentModule) {
                    if (this.screenInfo.mainSearchInfo.filterString !== null) {
                        filter = Filter.and(filter, this.screenInfo.mainSearchInfo.filterString);
                        if (this.screenInfo.mainSearchInfo.hasPredefinedFilterCriterion("Archived"))
                            this._hasActiveFilter = false;
                        else if (this.screenInfo.mainSearchInfo.hasPredefinedFilterCriterion("Active"))
                            this._hasActiveFilter = true;
                    }
                    else
                        this._hasActiveFilter = null;
                }
                else {
                    filter = Filter.and(filter, "Filter.IsFalse(IsArchived)");
                }
            } else {
                filter = Filter.and(filter, "Filter.IsFalse(IsArchived)");
            }

            return filter;
        }

        /**
        * This method will set selected entity
        **/
        public selectEntity(entity: EntityViewModel): boolean {
            if (!entity) return false;

            let documentVm = <DocumentItemViewModel>entity;
            let allowSelect = ((documentVm.isArchived && this._hasActiveFilter === false) || (!documentVm.isArchived && this._hasActiveFilter === true) || this._hasActiveFilter === null) && entity.originalEntity.Id !== ap.utility.UtilityHelper.createEmptyGuid();

            if (allowSelect === true) {
                if (this.selectedEntity) {
                    this.selectedEntity.isShowingMetaData = false;
                }
                this.listVm.selectEntity(entity.originalEntity.Id);
                if (this.isSelector)
                    entity.isChecked = !entity.isChecked;
            }
            return allowSelect;
        }

        /**
         * This method handle download action for a document item
         **/
        private downloadDocument(docItemVm: DocumentItemViewModel) {
            if (docItemVm !== null && docItemVm.originalDocument != null) {
                let plan: ap.models.documents.Document = <ap.models.documents.Document>docItemVm.originalEntity;
                this.$controllersManager.documentController.downloadDocument(plan);
            }
        }

        /**
         * This method will call the openDocument with the id of the document to open
         **/
        private previewDocumentHandler(item: DocumentItemViewModel) {
            this.openDocument(item.originalDocument.Id);
        }

        /**
         * This method will show popup with user send report
         * @param document - viewModel of report document that will be send to recepients
         */
        reportDocumentHandler(document: ap.viewmodels.documents.DocumentItemViewModel) {
            let documentsReportController = ($scope: angular.IScope) => {
                $scope["vm"] = new ap.viewmodels.reports.ReportEmailViewModel($scope, this.$utility, this._api, this.$q, this.$mdDialog, document, this.$controllersManager, this.$servicesManager);
            };
            documentsReportController.$inject = ["$scope"];
            this.$mdDialog.show({
                clickOutsideToClose: false,
                templateUrl: "me/PartialView?module=Report&name=SendReportByEmail",
                fullscreen: true,
                controller: documentsReportController
            });

            // send event to Segment.IO
            this.$servicesManager.toolService.sendEvent("cli-action-share report", new Dictionary([new KeyValue("cli-action-share report-screenname", "documents")]));
        }

        /**
         * When some pages are loaded, items are created. This method is to handle when the user clicks on the action download of one item.
         * @param docItem this is the documentItemViewModel on which the user clicked the action
         **/
        private documentItemCreated(docItem: DocumentItemViewModel | ap.viewmodels.ItemInsertedEvent): void {
            if (docItem instanceof ap.viewmodels.ItemInsertedEvent) {
                docItem.item.on("downloadclicked", this.downloadDocument, this);
                docItem.item.on("previewclicked", this.previewDocumentHandler, this);
                docItem.item.on("reportclicked", this.reportDocumentHandler, this);
            } else {
                docItem.on("downloadclicked", this.downloadDocument, this);
                docItem.on("previewclicked", this.previewDocumentHandler, this);
                docItem.on("reportclicked", this.reportDocumentHandler, this);
            }
        }

        /**
        * This property needs to get selected entity.
        **/
        public get selectedEntity(): DocumentItemViewModel {
            return this._selectedEntity;
        }

        /**
        * This method is to handle when a document item is selected in the list.
        * @param docItem this is the documentItemViewModel that has been selected
        **/
        private selectedDocumentItemChanged(docItem: DocumentItemViewModel): void {
            if (this._selectedEntity) {
                this._selectedEntity.isShowingMetaData = false;
            }
            this._selectedEntity = docItem;
            if (this._addAction && this._addAction !== null) {
                if (this.meeting == null) {
                    this._addAction.clearSubActions();
                } else {
                    for (let i = this._addAction.subActions.length - 1; i >= 0; i--) {
                        if (this._addSubActions.indexOf(this._addAction.subActions[i]) < 0) {
                            this._addAction.subActions.splice(i, 1);
                        }
                    }
                }
            }
            if (docItem) {
                this.saveSelectedItem(docItem.originalEntity.Id);
                if (this._addAction && this._addAction !== null && docItem.documentActionViewModel && docItem.documentActionViewModel !== null && docItem.documentActionViewModel.addActions) {
                    this._addAction.addSubActions(docItem.documentActionViewModel.addActions);
                }
                if (this._isForDocumentModule) {
                    this._screenInfo.selectedEntityId = docItem.originalDocument.Id;
                }
            }
        }

        /**
         * Handle clicks on actions available when several items are checked
         * @param actionName
         */
        private multiactionClick(actionName: string) {
            switch (actionName) {
                case "document.download":
                    let checkedItems = this.listVm.getCheckedItems();
                    if (checkedItems.length === 1) {
                        this.downloadDocument(<ap.viewmodels.documents.DocumentItemViewModel>checkedItems[0]);
                        this.$controllersManager.mainController.closeMultiActionsMode();
                    } else if (checkedItems.length > 1) {
                        let ids: string[] = this.listVm.listidsChecked;
                        if (!!this.$controllersManager.mainController.currentMeeting) {
                            this.$servicesManager.documentService.getdocumentsIdsFromMeetingDocument(ids).then((documentsIds: string[]) => {
                                this.$controllersManager.documentController.downloadSeveralDocuments(documentsIds).then(() => {
                                    this.$controllersManager.mainController.closeMultiActionsMode();
                                });
                            });
                        } else {
                            this.$controllersManager.documentController.downloadSeveralDocuments(ids).then(() => {
                                this.$controllersManager.mainController.closeMultiActionsMode();
                            });
                        }
                    }
                    break;
                case "printnotelist":
                    this.printReport();
                    break;
                case "document.move":
                    this.multiActionMove();
                    break;
            }
        }

        /**
        * Method called when the user has clicked on the "move" button from the multi action bar
        */
        private multiActionMove() {
            this.$servicesManager.toolService.sendEvent("cli-menu-move documents", new Dictionary([new KeyValue("cli-menu-open documents-screenname", "projects")]));

            if (this.listVm.listidsChecked.length >= 100) {
                this.$controllersManager.mainController.showToast("app.doc.move.disabled", null);
            } else {
                this._listener.raise("movetoanotherfolderhandler");
            }
        }

        /*
        * This method will create the list of multiActionsViewModel (private property: _multiActions)
        * Note that: multiple call can be ignore becasue it is not necessary to call many time 
        */
        public gotoMultiActions() {
            if (this._isMultiActions === true) return;

            this._isMultiActions = true;
            let checkedItems = this.listVm.getCheckedItems().map((entity: EntityViewModel) => { return entity.originalEntity.Id; });
            let dowloadAction = new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "document.download", this.$utility.rootUrl + "Images/html/icons/ic_get_app_black_24px.svg", true, null, "Download", true);
            let moveAction = new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "document.move", this.$utility.rootUrl + "Images/html/icons/moveto.svg", true, null, "Move", true);
            if ((this.folder && this.folder.FolderType === "Report") || !this.folder) {
                // the action is only available if there is a folder selected which is not the report folder
                moveAction.isVisible = false;
            }
            let actions: ap.viewmodels.home.ActionViewModel[] = [];
            actions.push(moveAction, this._printAction, dowloadAction);
            this._multiActions = new ap.viewmodels.home.MultiActionsViewModel(this.$utility, actions, checkedItems); // the checked event will raise for one time so reduce one
            this._multiActions.on("actionClicked", this.multiactionClick, this);
            this.$controllersManager.mainController.gotoMultiActionsMode(this._multiActions);
        }

        /*
        * Return if it is in multi-actions mode, can be used to hide download action of each document
        */
        public get isMultiActions(): boolean {
            return this._isMultiActions;
        }

        /**
         * This method will closes the multiactions mode if activated.
         **/
        public closeMultiActions() {
            if (this._isMultiActions) {
                this._isMultiActions = false;
                this._multiActions.itemsChecked = [];
                this._multiActions.off("actionClicked", this.multiactionClick, this);

                this.listVm.listidsChecked = [];

                this.listVm.selectedAll = false;

                this.listVm.initializeDefaultCheckedItems();

                this.checkSelectedAll();

                this.updateScreenInfoCheckedItems();
                this.$controllersManager.mainController.closeMultiActionsMode();
            }
        }

        /*
        * Finish multiaction and remove events, also uncheck all items
        */
        private multiActionsCloseRequested() {
            this.closeMultiActions();
        }

        /**
        * The main actions of the document list
        **/
        public get mainActions(): Array<ap.viewmodels.home.ActionViewModel> {
            return this._mainActions;
        }

        /**
        * The Add action of the document list
        **/
        public get addAction(): ap.viewmodels.home.ActionViewModel {
            return this._addAction;
        }

        /**
        * The access right for add action
        **/
        public get addAccessRight(): ap.models.accessRights.DocumentAccessRight {
            return this._addAccessRight;
        }

        /**
        * The drag options 
        **/
        public get dragOptions(): ap.component.dragAndDrop.DragOptions {
            return this._dragOptions;
        }

        /**
        * Method to get the current sortState
         **/
        public get SortState(): ap.misc.sort.DocumentListSortingInfo {
            if (this.canSort) {
                return this._sortState;
            } else {
                return null;
            }
        }

        /**
         * This method handles click events on documents displayed in the list
         * @param documentVm a view models of a document that is clicked
         */
        public handleDocumentClickedEvent(documentVm: ap.viewmodels.documents.DocumentItemViewModel) {
            if (!documentVm) {
                return;
            }

            let isDocumentValid = documentVm.isArchived !== this.hasActiveFilter || this.hasActiveFilter === null;
            if (!isDocumentValid || documentVm.isDeleted || !this._isForDocumentModule) {
                return;
            }

            // It is needed to select the clicked document in order to update the info panel if it is opened
            this.listVm.selectEntity(documentVm.originalDocument.Id);
            if (this.screenInfo.isInfoOpened) {
                return;
            }

            let previewAction = ap.viewmodels.home.ActionViewModel.getAction(documentVm.documentActionViewModel.actions, "document.preview");
            if (previewAction.isVisible && previewAction.isEnabled) {
                documentVm.actionClick(previewAction.name);
            } else {
                this.showToastForProcessingDoc(documentVm);
            }
        }

        /**
         * This method will open the document item specified, it means to select the item specified in the list and to build the pictureViewModel on the document viewModel
         * @param id this is the id of the item to select and to open in pictureViewModel
         **/
        public openDocument(documentId: string, versionId?: string) {
            let targetDocumentId = null;
            let isReport = false;

            if (!StringHelper.isNullOrWhiteSpace(documentId)) {
                // Ensure that the target document is selected in the list
                this.listVm.selectEntity(documentId);

                let selectedItem = <DocumentItemViewModel>this.listVm.selectedViewModel;

                if (selectedItem && selectedItem.originalDocument.Id === documentId && !selectedItem.isDeleted) {
                    if (selectedItem.originalDocument.ProcessingStatus = models.documents.ProcessingStatus.FullyCompleted) {
                        targetDocumentId = selectedItem.meetingDocument ? selectedItem.meetingDocument.Id : selectedItem.originalDocument.Id;
                        isReport = selectedItem.originalDocument.IsReport;
                    } else {
                        this.showToastForProcessingDoc(selectedItem);
                    }
                }
            }

            if (!targetDocumentId) {
                throw new Error("Document Id is not defined");
            }

            this._listener.raise("previewclicked", new DocumentPreviewEvent(targetDocumentId, versionId, isReport));
        }

        /**
         * This public method is used to show toast if document is still processing
         * @param docItemVm instance of DocumentItemViewModel. selected processing item from list
         */
        public showToastForProcessingDoc(docItemVm: ap.viewmodels.documents.DocumentItemViewModel): void {
            if (docItemVm.originalDocument.IsReport) {
                if (docItemVm.isProcessing) {
                    this.$controllersManager.mainController.showToast("app.report.doc.process.msg", null);
                } else if (docItemVm.originalDocument.ProcessingStatus === models.documents.ProcessingStatus.GenerationReportFailed || docItemVm.originalDocument.ProcessingStatus === models.documents.ProcessingStatus.TilesProcessingFailed) {
                    this.$controllersManager.mainController.showToast("app.report.process.failed.message", null);
                }
            } else {
                if (docItemVm.originalDocument.Status === models.documents.DocumentStatus.NotUploaded || docItemVm.originalDocument.ProcessingStatus === models.documents.ProcessingStatus.UploadFailed) {
                    this.$controllersManager.mainController.showToast("app.doc.uploadfailed.msg", null);
                } else if (docItemVm.originalDocument.ProcessingStatus === models.documents.ProcessingStatus.TilesProcessingFailed) {
                    this.$controllersManager.mainController.showToast("app.doc.processfailed.msg", null);
                } else if (docItemVm.isProcessing) {
                    this.$controllersManager.mainController.showToast("app.doc.process.msg", null);
                }
            }
        }

        /**
        * This method is used to print the document report
        **/
        public printReport() {
            let self = this;
            if (this._reportDialogOpening === true) return;
            this._reportDialogOpening = true;
            this._reportHelper.showPrintDocumentReportGenerator(this).then((result: ap.viewmodels.reports.ReportGeneratorResponse) => {
                self.$controllersManager.mainController.closeMultiActionsMode();
                this._reportDialogOpening = false;
            }, () => {
                this._reportDialogOpening = false;
            });
        }

        /**
        * This method is used to keep the last selected item and then used to reselect this item 
        **/
        public saveSelectedItem(itemId: string) {
            this.$utility.Storage.Session.set("document.lastselecteditem", itemId);
            this._itemToSelect = itemId;
        }

        private onSortStateChanged() {
            this._sortState.saveToStorage();
            this.listVm.changeSortOrder(this._sortState.toQueryParam());
            this.load(this._itemToSelect);
        }

        /**
         ** Need to remove 'downloadclicked' for all items
         **/
        public dispose() {
            super.dispose();

            if (this._multiActions) {
                this._multiActions.dispose();
                this._multiActions = null;
            }

            if (this._dragOptions) {
                this._dragOptions.dispose();
                this._dragOptions = null;
            }

            if (this._sortState) {
                this._sortState.dispose();
                this._sortState = null;
            }

            if (this._screenInfo) {
                this.screenInfo.dispose();
                this._screenInfo = null;
            }

            if (this._reportHelper) {
                this._reportHelper.dispose();
                this._reportHelper = null;
            }

            this.$controllersManager.mainController.off("multiactioncloserequested", this.multiActionsCloseRequested, this);
            this.$controllersManager.mainController.off("currentmeetingchanged", this.handleCurrentMeetingChanged, this);
            this.$controllersManager.documentController.off("opendocumentrequested", this.handleDocumentOpenRequest, this);
            this.$controllersManager.documentController.off("documentmoved", this.documentMovedHandler, this);
            this.$controllersManager.documentController.off("deletedocumentrequested", this.handleDeleteDocumentRequest, this);
        }

        /**
         * This method create the property on which it will possible to make filter for the document list.
         **/
        private buildScreen($timeout: angular.ITimeoutService) {

            // screen infor only when _isForDocumentModule
            if (this._isForDocumentModule) {
                let advancedFilter: ap.misc.AdvancedFilter[] = [];
                advancedFilter.push(new ap.misc.AdvancedFilter(new ap.misc.PropertyInfo(this._entityPrefix + "Name", null, false, ap.misc.PropertyType.String), null));
                advancedFilter.push(new ap.misc.AdvancedFilter(new ap.misc.PropertyInfo(this._entityPrefix + "UploadedDate", "Upload date", false, ap.misc.PropertyType.Date), misc.AdvancedFilter.pastDateShortcuts));
                advancedFilter.push(new ap.misc.AdvancedFilter(new ap.misc.PropertyInfo(this._entityPrefix + "UploadedBy.Person.Name", "Uploader", false, ap.misc.PropertyType.String), null));

                let predefinedFilter = [];

                predefinedFilter.push(new ap.misc.PredefinedFilter("Active", "Active documents", true, Filter.isFalse(this._entityPrefix + "IsArchived"), null, ["Archived"]));
                predefinedFilter.push(new ap.misc.PredefinedFilter("Archived", "Archived documents", true, Filter.isTrue(this._entityPrefix + "IsArchived"), null, ["Active"]));

                let mainSearchInfo = new misc.MainSearchInfo(this.$utility, $timeout, null, advancedFilter, predefinedFilter);
                mainSearchInfo.isVisible = true;
                mainSearchInfo.isEnabled = true;
                this._documentsGridModeAction = new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "documentsgrid", this.$utility.rootUrl + "Images/html/icons/thumb_view.svg", !this.isThumbView, null, "Thumb view", true);
                this._documentsThumbsModeAction = new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "documentsthumbs", this.$utility.rootUrl + "Images/html/icons/ic_view_list_black_48px.svg", this.isThumbView, null, "Grid view", true);

                this._printAction = new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "printnotelist", this.$utility.rootUrl + "Images/html/icons/ic_print_black_48px.svg", false, null, "Generate report", false);
                this.calculatePrintActionAccess();

                this._statusActions = [this._documentsGridModeAction, this._documentsThumbsModeAction];

                this._mainActions = [];

                this._mainActions = this._mainActions.concat([
                    this._printAction,
                    new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "refresh", this.$utility.rootUrl + "Images/html/icons/ic_refresh_black_48px.svg", true, null, "Refresh list", true)
                ]);

                if (this._docListOptions.isMeetingDocument) {
                    let attachDocumentAction = new ap.viewmodels.home.SubActionViewModel(this.$utility, this.$utility.EventTool, "meetingdocument.attachdocument", this.$utility.rootUrl + "/Images/html/icons/ic_attach_file_black_48px.svg", true, false, false, "Attach documents of the project", false, false);
                    this._addSubActions = [attachDocumentAction];
                    this._addAction = new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "meetingdocument.uploaddocument", this.$utility.rootUrl + "/Images/html/icons/ic_add_black_48px.svg", false, this._addSubActions, "Add document", false, false);
                } else {
                    this._addAction = new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "document.uploaddoc", this.$utility.rootUrl + "/Images/html/icons/ic_add_black_48px.svg", false, null, "Upload document", false, false, new ap.misc.Shortcut("c"));
                }
                this._screenInfo = new ap.misc.documents.DocumentListScreenInfo(this.$utility, this._mainActions, this._addAction, mainSearchInfo);
            }
        }

        /**
        * This method is used to check the user can do print report or not
        **/
        private calculatePrintActionAccess() {
            if (!!this._printAction) {
                this._printAction.isVisible = !!this._folder && !this._folder.IsPublic;
                this._printAction.isEnabled = this.$utility.UserContext.CurrentUser().NbReportGenerated < this.$utility.UserContext.licenseAccess.NbReport;
            }
        }

        /**
        * This method is used to check the user can do Add action or not
        **/
        private calculateAddActionAccess() {
            if (this._addAction !== null) {

                if (this._meeting !== null) {
                    this._addAction.isEnabled = this._addAccessRight.canAddMeetingDoc || this._addAccessRight.canUploadMeetingDoc;
                    if (!this._addAction.isEnabled) {
                        this._addAction.clearSubActions();
                    } else {
                        let attachDocumentAction = ap.viewmodels.home.ActionViewModel.getAction(this._addSubActions, "meetingdocument.attachdocument");
                        attachDocumentAction.isEnabled = this._addAccessRight.canAddMeetingDoc;
                        this._addAction.isEnabled = this._addAccessRight.canUploadMeetingDoc;
                    }
                }
                else
                    this._addAction.isEnabled = this._addAccessRight.canUploadDoc || this._addAccessRight.canUploadPicture;
                this._addAction.isVisible = this._addAccessRight.canUploadDoc || this._addAccessRight.canUploadPicture || this._addAccessRight.canAddMeetingDoc || this._addAccessRight.canUploadMeetingDoc;
            }
        }

        protected handleDocumentOpenRequest(data: ap.controllers.OpenDocumentRequestedEvent) {
            if (data.versionId)
                this.openDocument(data.documentId, data.versionId);
            else
                this.openDocument(data.documentId);
        }

        /**
        * Handler for tracking changes of the current meeting
        * @param meeting New current meeting value
        **/
        private handleCurrentMeetingChanged(meeting: ap.models.meetings.Meeting) {
            if (this._docListOptions.isMeetingDocument) {
                this._meeting = meeting;
                this._canSort = this._meeting === null;
                this._addAccessRight = new ap.models.accessRights.DocumentAccessRight(this.$utility, null, this.$controllersManager.mainController.currentProject(), this._meeting, this._folder);
                this.calculateAddActionAccess();
            }
        }

        /**
         * Called when the server processed the dropped document
         * @param documentMoved: Document that was moved
         */
        private documentMovedHandler(documentMoved: ap.models.documents.MoveDocumentResult) {
            let dragged: DocumentItemViewModel;
            let dropped: DocumentItemViewModel;
            this.listVm.sourceItems.forEach(item => {
                if (item.originalEntity.Id === documentMoved.DocumentChangeResult.DocumentChanged.Id) {
                    documentMoved.DocumentChangeResult.DocumentChanged.Author = (<DocumentItemViewModel>item).originalDocument.Author;
                    documentMoved.DocumentChangeResult.DocumentChanged.AuthorName = (<DocumentItemViewModel>item).originalDocument.AuthorName;
                    documentMoved.DocumentChangeResult.DocumentChanged.UploadedBy = (<DocumentItemViewModel>item).originalDocument.UploadedBy;
                    documentMoved.DocumentChangeResult.DocumentChanged.UploadedByName = (<DocumentItemViewModel>item).originalDocument.UploadedByName;
                    item.init(documentMoved.DocumentChangeResult.DocumentChanged);
                }
                if (item.originalEntity.Id === documentMoved.SourceDocumentId)
                    dragged = <DocumentItemViewModel>item;
                if (item.originalEntity.Id === documentMoved.TargetDocumentId)
                    dropped = <DocumentItemViewModel>item;
            });
            this._listVm.sourceItems.splice(dragged.index, 1);
            this._listVm.sourceItems.splice(dropped.index, 0, dragged);
            // update indexes after moving documents
            let minIndex = Math.min(dragged.index, dropped.index);
            let maxIndex = Math.max(dragged.index, dropped.index);
            if (maxIndex >= this._listVm.sourceItems.length)
                throw new Error("Element index is more than items length");
            for (let i = minIndex; i <= maxIndex; i++) {
                this.listVm.sourceItems[i].index = i;
            }
            if (this.$utility.isIE()) {
                this.manageMoveItemsActions();
            }
        }

        /**
        * Method used to update the visibility of move actions on every items of the list
        **/
        private manageMoveItemsActions() {
            for (let i = 0; i < this.listVm.sourceItems.length; i++) {
                let item: DocumentItemViewModel = <DocumentItemViewModel>this.listVm.sourceItems[i];
                if (item.documentActionViewModel) {
                    item.moveUpAvailable = true;
                    item.moveDownAvailable = true;
                    if (i === 0 || !this._folder) {
                        item.moveUpAvailable = false;
                    }
                    if (i === this.listVm.count - 1 || !this._folder) {
                        item.moveDownAvailable = false;
                    }
                }
            }
        }

        /**
        * This method is called when the user clicks on the delete document button.
        **/
        private handleDeleteDocumentRequest(docInfo: ap.models.accessRights.DocumentAccessRight) {
            let self = this;
            let deleteDocViewModel: ap.viewmodels.documents.DeleteDocumentViewModel =
                new ap.viewmodels.documents.DeleteDocumentViewModel(docInfo, this.$mdDialog, this.$utility, this.$controllersManager.documentController);
            this.$controllersManager.mainController.showBusy();

            let deleteDocumentController = ($scope: angular.IScope) => {
                $scope["vm"] = deleteDocViewModel;
            };
            deleteDocumentController.$inject = ["$scope"];
            this.$mdDialog.show({
                clickOutsideToClose: false,
                preserveScope: true,
                templateUrl: "me/PartialView?module=Document&name=DeleteDocumentDialog",
                fullscreen: true,
                controller: deleteDocumentController,
                onComplete: () => {
                    this.$controllersManager.mainController.hideBusy();
                }
            }).then((response: ap.controllers.DeleteDocumentResponse) => {
                if (deleteDocViewModel.availableVersions && deleteDocViewModel.availableVersions.selectedViewModel && deleteDocViewModel.availableVersions.selectedViewModel.originalEntity instanceof ap.models.documents.Version) {
                    this.$controllersManager.documentController.beforeDeleteDocument(response, docInfo.document, deleteDocViewModel.deleteOption, <ap.models.documents.Version>deleteDocViewModel.availableVersions.selectedViewModel.originalEntity);
                } else {
                    this.$controllersManager.documentController.beforeDeleteDocument(response, docInfo.document, deleteDocViewModel.deleteOption);
                }
            }, (error) => {
                this.$controllersManager.mainController.hideBusy();
                deleteDocViewModel = null;
            });
        }

        /**
         * Called when document dropped
         * @param entireData: Contains element that was dragged and element on which place it was dropped.
         */
        private documentDroppedHandler(entireData: ap.component.dragAndDrop.DropEntityEvent) {
            let moveType = entireData.dragTarget.displayOrder > entireData.dropTarget.displayOrder ? ap.models.projects.MoveType.Before : ap.models.projects.MoveType.After;
            this.$controllersManager.documentController.moveDocument(entireData.dragTarget.dragId, entireData.dropTarget.dragId, moveType);
        }

        /**
         * Add event listaner for documents
         */
        private pageDocumentsListLoaded(items: ap.viewmodels.documents.DocumentItemViewModel[]) {
            let dicIdsLoad: Dictionary<string, DocumentItemViewModel> = new Dictionary<string, DocumentItemViewModel>();
            items.map((item, index) => {
                item.on("documentdropped", this.documentDroppedHandler, this);
                if (this._isForDocumentModule) {
                    item.on("droppedintofolder", this.movedIntoFolderMovedHandler, this);
                }
                item.on("propertychanged", this.handleItemPropertiesChangedHandler, this);
                if (item.originalEntity) {
                    // Need to check if it is a meeting document or not
                    if (item.meetingDocument) {
                        dicIdsLoad.add(item.meetingDocument.Id, item);
                    }
                    else {
                        dicIdsLoad.add(item.originalEntity.Id, item);
                    }
                }
            });

            this.loadDocumentStats(dicIdsLoad);

            this.listVm.initializeDefaultCheckedItems(items);

            this.checkSelectedAll(true);

            if (this.$utility.isIE()) {
                this.manageMoveItemsActions();
            }
            // Fix for AP-17736 -> case when folders are open and documents are in thumb view on a big screen
            // There is enough place for 50 elements so the scrollbar doesn't appear -> need to force the load of the next page
            // only do it for the second page
            if (this.isThumbView && this.listVm.ids.length > this.listVm.sourceItems.length && !this.listVm.getPage(1).isLoaded) {
                this.listVm.loadNextPage();
            }
        }

        /**
         * Load the statistics of each loaded documents (number of points on it, number of versions)
         * @param dicIdsLoad
         */
        public loadDocumentStats(dicIdsLoad: Dictionary<string, DocumentItemViewModel>) {
            let opt = new ap.services.apiHelper.ApiOption();
            opt.async = true;
            if (dicIdsLoad.count > 0) {
                let idDoc = dicIdsLoad.values().map((item: DocumentItemViewModel) => { return item.originalEntity.Id; });
                let filterNoteDocs = "Filter.And(Filter.In(Document.Id," + idDoc.join(",") + "),Filter.IsFalse(Note.IsArchived)" + (this._docListOptions.isMeetingDocument ? (",Filter.Eq(Note.Meeting.Id," + this.$controllersManager.mainController.currentMeeting.Id + ")") : ")") + ")";
                this._api.getApiResponseStatList("notedocumentstats", "Document.Id", filterNoteDocs, opt).then((res) => {
                    if (res.data && res.data.length > 0) {
                        res.data[0].forEach((stat: ap.models.stats.StatResult) => {
                            if (this._docListOptions.isMeetingDocument) {
                                dicIdsLoad.values().filter((item: DocumentItemViewModel) => {
                                    return item.originalEntity.Id === stat.GroupByValue;
                                }).forEach((item: DocumentItemViewModel) => {
                                    item.notesCount = stat.Count;
                                });
                            } else {
                                let item = dicIdsLoad.getValue(stat.GroupByValue);
                                item.notesCount = stat.Count;
                            }
                        });
                        dicIdsLoad.values().forEach((item) => {
                            if (item.notesCount < 0)
                                item.notesCount = 0;
                        });
                    }
                });
            }
        }

        /**
         * Add draggable entity to the drag options when document's viewmodel is clicked
         * @param documentVm Document's viewmodel entity
         */
        public addDraggableEntity(documentVm: DocumentItemViewModel) {
            if (!documentVm)
                return;
            this._dragOptions.clearDraggable();
            this._dragOptions.addDraggable(documentVm);
        }

        /**
         * Raise dragstartdocument event
         */
        private dragStartHandler() {
            this._listener.raise("dragstartdocument", true);
        }

        /**
         * Raise dragenddocument event
         */
        private dragEndHandler() {
            this._listener.raise("dragenddocument");
        }

        /**
         * Called when droppedintofolder event raised
         */
        movedIntoFolderMovedHandler(dropTargetEvent: ap.component.dragAndDrop.DropEntityEvent) {
            this._listener.raise("droppedintofolder", dropTargetEvent);

        }

        /**
         * Handle item's properties changed, update screen info data
         * @param args Changed property arguments
         */
        private handleItemPropertiesChangedHandler(args: ap.viewmodels.base.PropertyChangedEventArgs) {
            if (!this._screenInfo)
                return;
            let docItemVm = <ap.viewmodels.documents.DocumentItemViewModel>args.caller;
            switch (args.propertyName) {
                case "isShowingMetaData":
                    this.listVm.selectEntity(docItemVm.originalDocument.Id);
                    this._screenInfo.isInfoOpened = docItemVm.isShowingMetaData;
                    break;
            }
        }

        private _handlerMainFlowStateChange(): void {
            if (this.$controllersManager.uiStateController.mainFlowState === ap.controllers.MainFlow.Documents || this.$controllersManager.uiStateController.mainFlowState === ap.controllers.MainFlow.MeetingDocuments) {
                if (this.$controllersManager.uiStateController.mainFlowStateParam) {
                    this.$controllersManager.uiStateController.off("mainflowstatechanged", this._handlerMainFlowStateChange, this);
                }
                this._addAccessRight = new ap.models.accessRights.DocumentAccessRight(this.$utility, null, this.$controllersManager.mainController.currentProject(), this._meeting, this._folder);
                this.calculateAddActionAccess();
            }
        }

        /**
         * Determines a name that is used by storage to store a sorting state of the list
         * @param isForDocumentModule an indicator
         */
        private static getSortingStorageName(isForDocumentModule: boolean): string {
            if (isForDocumentModule) {
                return "documents.documentmodule";
            } else {
                return "documents";
            }
        }

        /**
         * Method to delete sorting models saved in storage
         * @param utility an instance of the utility helper of the application
         */
        public static resetSortingInfo(utility: ap.utility.UtilityHelper) {
            ap.misc.sort.SortingInfo.removeFromStorage(utility, DocumentListViewModel.getSortingStorageName(true));
            ap.misc.sort.SortingInfo.removeFromStorage(utility, DocumentListViewModel.getSortingStorageName(false));
        }

        constructor(private $scope: ng.IScope, private $mdDialog: angular.material.IDialogService, $utility: ap.utility.UtilityHelper, private _api: ap.services.apiHelper.Api, $q: angular.IQService, $timeout: angular.ITimeoutService, $controllersManager: ap.controllers.ControllersManager, private $servicesManager: ap.services.ServicesManager, private _docListOptions: ap.viewmodels.documents.DocumentListOptions,
            folder?: ap.models.projects.Folder, isForDocumentModule: boolean = false, docVmNoteWorkspaceOptions?: ap.viewmodels.documents.DocumentVmNoteWorkspaceOption, getItemAtIndexParameter?: viewmodels.GetItemAtIndexParameter) {
            super($utility, $controllersManager, $q, new GenericPagedListOptions(_docListOptions.isMeetingDocument ? "MeetingDocument" : "Document", DocumentItemViewModel, _docListOptions.getPathToLoad(), undefined, undefined, undefined, undefined, undefined, undefined,
                new DocumentItemParameterBuilder($controllersManager.documentController, $controllersManager.mainController, $controllersManager.meetingController, _docListOptions.isMeetingDocument), undefined, undefined, undefined, undefined, undefined, getItemAtIndexParameter));

            if (this._docListOptions.isMeetingDocument) {
                this._entityPrefix = "Document.";
            }
            this._isForDocumentModule = isForDocumentModule;
            this._meeting = null;
            if (this._docListOptions.isMeetingDocument) {
                this._meeting = this.$controllersManager.mainController.currentMeeting;
                this._canSort = this._meeting === null;
                this.$controllersManager.mainController.on("currentmeetingchanged", this.handleCurrentMeetingChanged, this);
            }

            let sortingStorageName = DocumentListViewModel.getSortingStorageName(isForDocumentModule);
            this._sortState = ap.misc.sort.SortingInfo.createFromStorage(ap.misc.sort.DocumentListSortingInfo, $utility, sortingStorageName);
            this._sortState.on("sortingchanged", this.onSortStateChanged, this);

            this._itemToSelect = this.$utility.Storage.Session.get("document.lastselecteditem");
            this.buildScreen($timeout);

            this._view = this.$utility.Storage.Local.get("documents.view");
            if (this._view === null || !this._isForDocumentModule)
                this._view = View.Grid;
            this.toggleView();

            let keySortView = (this._docListOptions.isMeetingDocument ? "meetingdocs." : "documents.") + "sortView";

            this.listVm.on("itemcreated", this.documentItemCreated, this);
            this.listVm.on("iteminserted", this.documentItemCreated, this);
            this.listVm.on("selectedItemChanged", this.selectedDocumentItemChanged, this);
            this.listVm.on("pageloaded", this.pageDocumentsListLoaded, this);
            this.$controllersManager.documentController.on("documentmoved", this.documentMovedHandler, this);

            this._propsSearchedText = ["name"];

            this._folder = folder;

            if (this.$controllersManager.uiStateController.mainFlowState === ap.controllers.MainFlow.Documents || this.$controllersManager.uiStateController.mainFlowState === ap.controllers.MainFlow.MeetingDocuments) {
                this._addAccessRight = new ap.models.accessRights.DocumentAccessRight($utility, null, this.$controllersManager.mainController.currentProject(), this._meeting, this._folder);
                this.calculateAddActionAccess();
            } else {
                this.$controllersManager.uiStateController.on("mainflowstatechanged", this._handlerMainFlowStateChange, this);
            }

            this.$controllersManager.mainController.on("multiactioncloserequested", this.multiActionsCloseRequested, this);
            this.$controllersManager.documentController.on("opendocumentrequested", this.handleDocumentOpenRequest, this);
            this.$controllersManager.documentController.on("deletedocumentrequested", this.handleDeleteDocumentRequest, this);
            this.listVm.on("isCheckedChanged", this.itemCheckedChange, this);
            this._reportHelper = new ap.viewmodels.reports.ReportHelper(this.$scope, this.$q, $timeout, this.$mdDialog, this.$utility, this._api, this.$servicesManager, this.$controllersManager);
            this._dragOptions = new ap.component.dragAndDrop.DragOptions(this.$utility);
            this._listener.addEventsName(["documentopened", "documentclosed", "documentdropped", "dragstartdocument", "dragenddocument", "droppedintofolder", "folderchanged", "previewclicked", "movetoanotherfolderhandler"]);
        }

        private _meeting: ap.models.meetings.Meeting;
        private _entityPrefix: string = "";
        private _screenInfo: ap.misc.documents.DocumentListScreenInfo;
        private _propsSearchedText: string[];
        private _folder: ap.models.projects.Folder;
        private _view: View;
        private _hasActiveFilter: boolean = null; // To know if the predefined filter active or archived is selected. Null means both are not selected.
        private _multiActions: ap.viewmodels.home.MultiActionsViewModel;
        private _isMultiActions: boolean;
        private _isForDocumentModule: boolean;
        private _itemToSelect: string;
        private _documentsGridModeAction: ap.viewmodels.home.ActionViewModel = null;
        private _documentsThumbsModeAction: ap.viewmodels.home.ActionViewModel = null;
        private _mainActions: Array<ap.viewmodels.home.ActionViewModel> = null;
        private _addAccessRight: ap.models.accessRights.DocumentAccessRight = null;
        private _addAction: ap.viewmodels.home.ActionViewModel = null;
        private _addSubActions: ap.viewmodels.home.SubActionViewModel[] = [];
        private _selectedEntity: DocumentItemViewModel;
        private _printAction: ap.viewmodels.home.ActionViewModel = null;
        private _reportHelper: ap.viewmodels.reports.ReportHelper;
        private _reportDialogOpening: boolean = false;
        private _dragOptions: ap.component.dragAndDrop.DragOptions;
        private _sortState: ap.misc.sort.DocumentListSortingInfo;
        private _canSort: boolean = true;
        private _isIndeterminate: boolean = false;
        private _isDocumentSelector: boolean = false;
        private _isNeedingDrag: boolean = true;
        private _isSelector: boolean = false;
        private _statusActions: Array<ap.viewmodels.home.ActionViewModel> = null;
        // This flag determines whether a listVm is fully setup and ready to be used in a view
        private _isListVmReady: boolean = false;
        private _currentLoadingPromise: angular.IPromise<GenericPagedListViewModels> = null;
    }
}