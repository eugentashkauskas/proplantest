module ap.viewmodels.folders {

    /**
     * This class will be used to create the each item of the list. It will contains all necessary parameter to create this item correctly.
    * The class inherits from ItemConstructorParameter
     **/
    export class FolderItemConstructorParameter extends ItemConstructorParameter {

        /**
         * This is the level of the item in the tree view
         **/
        public get level(): number {
            return this._level;
        }

        /**
         *  Return parent folder's ID 
         **/
        public get parentEntityId() {
            return this._parentEntityId;
        }

        /**
         * To know if the item is expanded or not
         **/
        public get isExpanded(): boolean {
            return this._isExpanded;
        }

        /**
         * To know if it is for document module
         **/
        public get withActions(): boolean {
            return this._withActions;
        }

        /**
        * To get the project controller
        **/
        public get projectController(): ap.controllers.ProjectController {
            return this.$controllersManager.projectController;
        }

        /**
        * To get the main controller
        **/
        public get mainController(): ap.controllers.MainController {
            return this.$controllersManager.mainController;
        }

        public get documentController(): ap.controllers.DocumentController {
            return this.$controllersManager.documentController;
        }

        constructor(itemIndex: number, item: any, pageDesc: PageDescription, pageLoadedParameters: LoadPageSuccessHandlerParameter, utility: ap.utility.UtilityHelper, private $controllersManager: ap.controllers.ControllersManager, private _withActions: boolean, level?: number, parentEntityId?: string) {
            super(itemIndex, item, pageDesc, pageLoadedParameters, utility);
            let folderItem = <ap.models.projects.Folder>item;
            // change entity name
            if (folderItem.Creator && !folderItem.ParentFolderId && folderItem.FolderType !== ap.models.projects.FolderType[ap.models.projects.FolderType.Custom]) {
                folderItem.OriginalName = folderItem.Name;

                let fType: string = ap.models.projects.FolderType[ap.models.projects.FolderType.Photo];

                if (folderItem.Creator.Id !== utility.UserContext.CurrentUser().Id) {
                    let prefix = folderItem.FolderType === fType ? utility.Translator.getTranslation("Pictures") : utility.Translator.getTranslation("Reports");
                    folderItem.Name = prefix + " - " + folderItem.Creator.Alias;
                }
                else {
                    folderItem.Name = folderItem.FolderType === fType ? utility.Translator.getTranslation("My pictures") : utility.Translator.getTranslation("My reports");
                }
                folderItem.ParentFolderId = folderItem.FolderType === fType ? ap.models.projects.Folder.PhotosStepFolderId : ap.models.projects.Folder.ReportsStepFolderId;
            } else if (!folderItem.ParentFolderId && folderItem.FolderType === ap.models.projects.FolderType[ap.models.projects.FolderType.Custom]) {
                folderItem.ParentFolderId = ap.models.projects.Folder.DocumentStepFolderId;
            }

            // init isExpanded
            let expandedFoldersId: string[] = this.projectController.getFolderStructureStateFromLocalStorage();
            this._isExpanded = expandedFoldersId.indexOf(item.Id) >= 0 ||
                item.Id === ap.models.projects.Folder.PhotosStepFolderId ||
                item.Id === ap.models.projects.Folder.DocumentStepFolderId ||
                item.Id === ap.models.projects.Folder.ReportsStepFolderId;
            this._level = level;
            this._parentEntityId = parentEntityId;
        }

        private _level: number;
        private _isExpanded: boolean;
        private _parentEntityId: string;
    }

    export class FoldersPagedListViewModel extends GenericPagedListViewModels {

        public get docFolderVm() {
            return <ap.viewmodels.folders.FolderItemViewModel>this.sourceItems[this._docFolderIndex];
        }

        /** 
        * Property to know the current filter of the documents lists
        */
        public set currentDocumentsFilter(newValue: string) {
            this._currentDocumentsFilter = newValue;

            this._updateFoldersPlansNumber();
        }

        /** 
        * This method for get folders which change visiblity
        */
        public getChangedVisibilityFolders(includeRootFolders?: boolean): FolderItemViewModel[] {
            let foldersVms = <FolderItemViewModel[]>this.sourceItems;
            let changedFolders: FolderItemViewModel[] = [];
            if (includeRootFolders) {
                for (let i = 0; i < foldersVms.length; i++) {
                    if (foldersVms[i] && foldersVms[i].getChangedFolderVisibilities().length > 0 && !foldersVms[i].isRootFolder) {
                        changedFolders.push(foldersVms[i]);
                    }
                }
            } else {
                for (let i = 0; i < foldersVms.length; i++) {
                    if (foldersVms[i] && foldersVms[i].getChangedFolderVisibilities().length > 0) {
                        changedFolders.push(foldersVms[i]);
                    }
                }
            }
            return changedFolders;
        }

        /**
         * Raise an event to rebuild tree lists
         */
        public rebuildTreeList() {
            this._listener.raise("needtoreindex");
        }

        /**
         * clear id/level dictionary when ids are loaded (list is refreshed)
         */
        public loadIds(filter: string = null, param: any = null): angular.IPromise<ap.services.apiHelper.ApiResponse> {
            this._idLevels.clear();
            return super.loadIds(filter, param);
        }

        /**
         * Override method "setIds" to separate ids from its levels
         * @param items An array of id objects of type {Id: string, Level: string}
         */
        protected setIds(items: any) {
            let idsList: Array<string> = new Array<string>(items.length);
            items.forEach((idObject: any, index: number) => {
                this._idLevels.add(idObject.Id, idObject.Object);
                if (idObject.Id === ap.models.projects.Folder.DocumentStepFolderId)
                    this._docFolderIndex = this._idLevels.count - 1;
                if (idObject.Id === ap.models.projects.Folder.PhotosStepFolderId)
                    this._photoFolderIndex = this._idLevels.count - 1;
                if (idObject.Id === ap.models.projects.Folder.ReportsStepFolderId)
                    this._reportFolderIndex = this._idLevels.count - 1;
                idsList[index] = idObject.Id;
            });
            super.setIds(idsList);
        }

        /**
        * This method will be called when a page has been successfully loaded after item has been created.
        * This method has several purposes:
        *     - It created the public/photo/report folder if they were in the page.
        *     - It subscribe to the isExpanded event of the loaded elements.
        *     - It call the method to select and expand the first folder having documents.
        *     - It call the method to load the plan number of the loaded folders.
        * @param arrayItem this is the arrayItem where the item will be created
        * @param index this is the last index loaded before to load the current page
        * @param pageDesc this is the pageDescription just loaded
        * @param createItemVmHandler this is the constructor to use to create an item
        * @param pageLoadedParameters THis is the parameter used to load the page
        **/
        protected afterLoadPageSuccessHandler(arrayItem: IEntityViewModel[], index: number, pageDesc: PageDescription, createItemVmHandler?: new (utility: ap.utility.UtilityHelper, q: angular.IQService, parentListVm?: BaseListEntityViewModel, itemParameters?: ItemConstructorParameter) => ap.viewmodels.folders.FolderItemViewModel, pageLoadedParameters?: LoadPageSuccessHandlerParameter) {
            // subscribe to events of the items and update hasChildren property
            let j: number;
            let lenghtArray: number = arrayItem.length;
            let isAllCollapsed: boolean = true;
            let firstIndex: number = this.options.pageSize * index;
            for (j = 0; j < lenghtArray; j++) {
                let currentItem: ap.viewmodels.folders.FolderItemViewModel = <ap.viewmodels.folders.FolderItemViewModel>arrayItem[j];
                if (!currentItem) {
                    currentItem = this.getRootFolder(j, pageDesc, createItemVmHandler, pageLoadedParameters);
                    arrayItem[j] = currentItem;
                }
                if (isAllCollapsed)
                    isAllCollapsed = !currentItem.isExpanded;
                let currentIndx: number = firstIndex + j;
                let level: number = this._idLevels.getValue(pageDesc.idsList[j]);
                let hasChildren = currentIndx + 1 < this.ids.length && this._idLevels.getValue(this.ids[currentItem.index + 1]) > level;
                (<ap.viewmodels.folders.FolderItemViewModel>arrayItem[j]).hasChildren = hasChildren;
                // folders which don't have children are expanded
                if (!hasChildren) {
                    (<ap.viewmodels.folders.FolderItemViewModel>arrayItem[j]).setExpanded(true);
                }
                let parentId = currentItem.originalFolder.ParentFolderId;
                // prevent drag&drop for photos and reports folders
                if (parentId === ap.models.projects.Folder.PhotosStepFolderId || parentId === ap.models.projects.Folder.ReportsStepFolderId) {
                    currentItem.preventDragging = true;
                }
            }
            let cachedSelectedFolderId: string = this._controllersManager.projectController.getLastSelectedFolderId();
            let needSelectFirstFolder: boolean = !this._idLevels.containsKey(cachedSelectedFolderId);
            // only select and expand the first folder with document if there is no cached folder or the cached folder was not visible any more and there is no folder selected
            if (needSelectFirstFolder && !this.selectedViewModel) {
                // call to get the first folder with documents to select
                this._selectedFolderWithDocuments();
            }
            // Load plans numbers if need
            if (this._needLoadPlansNumbers) {
                let pageFoldersIds = pageDesc.idsList.slice();
                let newItemsLength = this.sourceItems.length + arrayItem.length;
                if (this._docFolderIndex >= this.sourceItems.length && this._docFolderIndex < newItemsLength) {
                    pageFoldersIds.splice(this._docFolderIndex - this.sourceItems.length + 1, 1); // need to add "+1" to get the correct index
                }
                if (this._photoFolderIndex >= this.sourceItems.length && this._photoFolderIndex < newItemsLength) {
                    pageFoldersIds.splice(this._photoFolderIndex - this.sourceItems.length + 1, 1);
                }
                if (this._reportFolderIndex >= this.sourceItems.length && this._reportFolderIndex < newItemsLength) {
                    pageFoldersIds.splice(this._reportFolderIndex - this.sourceItems.length + 1, 1);
                }
                this._loadPlansNumbers(pageFoldersIds, arrayItem, this._currentDocumentsFilter);
            }
        }

        /**
         * Create and return root folder viewmodel for
         * @param folderIdIndex Root folder's index
         * @param pageDesc Page description
         * @param createItemVmHandler Item constructor
         * @param pageLoadedParameters Parameters object
         */
        private getRootFolder(folderIdIndex: number, pageDesc: PageDescription, createItemVmHandler?: new (utility: ap.utility.UtilityHelper, q: angular.IQService, parentListVm?: BaseListEntityViewModel, itemParameters?: ItemConstructorParameter) => ap.viewmodels.folders.FolderItemViewModel, pageLoadedParameters?: LoadPageSuccessHandlerParameter): ap.viewmodels.folders.FolderItemViewModel {
            let rootFolderModel = new ap.models.projects.Folder(this.$utility);
            let folderId = pageDesc.idsList[folderIdIndex];
            rootFolderModel.createByJson({ Id: folderId });
            let rootFolderIndex: number = 0;
            switch (folderId) {
                case ap.models.projects.Folder.DocumentStepFolderId:
                    rootFolderModel.Name = this.$utility.Translator.getTranslation("My documents");
                    rootFolderModel.FolderType = "Custom";
                    rootFolderIndex = this._docFolderIndex;
                    break;
                case ap.models.projects.Folder.PhotosStepFolderId:
                    rootFolderModel.Name = this.$utility.Translator.getTranslation("Pictures");
                    rootFolderModel.FolderType = "Photo";
                    rootFolderIndex = this._photoFolderIndex;
                    break;
                case ap.models.projects.Folder.ReportsStepFolderId:
                    rootFolderModel.Name = this.$utility.Translator.getTranslation("Reports");
                    rootFolderModel.FolderType = "Report";
                    rootFolderIndex = this._reportFolderIndex;
                    break;
            }
            let rootVm = new createItemVmHandler(this.$utility, this.$q, this, new FolderItemConstructorParameter(rootFolderIndex, rootFolderModel, pageDesc, pageLoadedParameters, this.$utility, this._controllersManager, this._withActions, 0));
            rootVm.init(rootFolderModel);
            return rootVm;
        }

        /**
        * This method manage the update of plans number per folder.
        * It should be called at least when the filter of the list changes.
        * @param filterView string To know if the filter is set to archived, active or all
        */
        private _updateFoldersPlansNumber(): void {
            let loadedItemsIds = this.getLoadedItemsIds();
            if (this._docFolderIndex)
                loadedItemsIds.splice(this._docFolderIndex, 1);
            if (this._photoFolderIndex)
                loadedItemsIds.splice(this._photoFolderIndex, 1);
            if (this._reportFolderIndex)
                loadedItemsIds.splice(this._reportFolderIndex, 1);
            if (this._isIdsLoaded === true)
                this._loadPlansNumbers(loadedItemsIds, this.sourceItems, this._currentDocumentsFilter);
        }

        /**
        * This method is to create the parameter necessary to create the item. 
        * @param itemIndex this is the index where the item will placed in the list
        * @param item This is the entity item
        * @param pageDesc this is the pageDescription just loaded on which the item is belonging to
        * @param pageLoadedParameters This is the parameter used to load the page
        * @param utility This is the Utility service
        **/
        protected createItemConstructorParameter(itemIndex: number, item: ap.models.Entity, pageDesc: PageDescription, pageLoadedParameters: LoadPageSuccessHandlerParameter, utility: ap.utility.UtilityHelper): ItemConstructorParameter {
            let itemLevel = this._idLevels.getValue(item.Id);
            return new FolderItemConstructorParameter(this.ids.indexOf(item.Id), item, pageDesc, pageLoadedParameters, utility, this._controllersManager, this._withActions, itemLevel);
        }

        /**
         * Override setSelectedViewModel method to save its expanded state to the local storage
         * and reduce an amount of events raised due to list initialization
         * @param val Selected folder viewmodel
         */
        protected _setSelectedViewModel(val: IEntityViewModel) {
            if (this._selectedViewModel === val) {
                return;
            }

            super._setSelectedViewModel(val);

            if (this._selectedViewModel && this._selectedViewModel.originalEntity)
                this._controllersManager.projectController.saveLastSelectedFolderIdToLocalStorage(this._selectedViewModel.originalEntity.Id);
        }

        /*
        * This method calls the API to get the first folder of the project which has documents to select it.
        */
        private _selectedFolderWithDocuments() {
            this._serviceManager.folderService.getFirstFolderIdContainingDocuments(this._controllersManager.mainController.currentProject().Id).then((apiResponse: ap.services.apiHelper.ApiResponse) => {
                this.selectEntity(apiResponse.data);
                if (this.selectedViewModel) {
                    let folderVm = <ap.viewmodels.folders.FolderItemViewModel>this.selectedViewModel;
                    folderVm.setExpanded(true);
                    this._saveExpandedStateToStorage(folderVm);
                    let index = folderVm.index;
                    if ((<ap.viewmodels.folders.FolderItemViewModel>this.selectedViewModel).isExpanded === true) {
                        while (index > 0) {
                            let currentItem = <ap.viewmodels.folders.FolderItemViewModel>this.sourceItems[index];
                            index--;
                            let prevItem = <ap.viewmodels.folders.FolderItemViewModel>this.sourceItems[index];
                            if (prevItem.level === currentItem.level - 1 && !prevItem.isExpanded) {
                                prevItem.setExpanded(true);
                                this._saveExpandedStateToStorage(prevItem);
                            }
                        }
                    }
                    this.rebuildTreeList();
                }
            });
        }

        /*
        * This method calls the API to get the number of documents per folder
        * @param idCollectionToRetreive The list of documents ids for which the requets is done
        */
        private _loadPlansNumbers(folderIds: string[], folderItems: ap.viewmodels.IEntityViewModel[], filterDocuments?: string) {
            // make the call to the API to get the documents numbers
            let options: ap.services.apiHelper.ApiOption = new ap.services.apiHelper.ApiOption();
            options.async = true;
            options.customParams.push(new ap.services.apiHelper.ApiCustomParam("ids", folderIds.join(",")));
            if (!!filterDocuments)
                options.customParams.push(new ap.services.apiHelper.ApiCustomParam("documentsearch", filterDocuments));
            options.showDetailBusy = this.isForManageModule;
            return this._api.getApiResponse("rest/folderdocumentcount", ap.services.apiHelper.MethodType.Get, null, null, options)
                .then((response: ap.services.apiHelper.ApiResponse) => {
                    if (!response || !response.data) {
                        throw new Error("Can not receive documents count for the folders");
                    }
                    response.data.forEach((planNumber: { Id: string, Object: number }) => {
                        for (let i = 0; i < folderItems.length; i++) {
                            let item = <ap.viewmodels.folders.FolderItemViewModel>folderItems[i];
                            if (item.originalEntity.Id === planNumber.Id) {
                                item.planNumber = planNumber.Object;
                                break;
                            }
                        }
                    });
                });
        }

        /**
        * This method update the plans count of the selected folder
        */
        public updateCurrentFolderPlansCount(plansCount: number) {
            if (this.selectedViewModel) {
                (<ap.viewmodels.folders.FolderItemViewModel>this.selectedViewModel).planNumber = plansCount;
            }
        }

        /**
         * Listen to the item's properties changes and process its event
         * @param args PropertyChangedEventArgs object
         */
        protected itemPropertyChanged(args: ap.viewmodels.base.PropertyChangedEventArgs) {
            let folderVm = <ap.viewmodels.folders.FolderItemViewModel>args.caller;
            switch (args.propertyName) {
                case "isChecked":
                    this.itemIsCheckedChanged(folderVm);
                    break;
                case "isExpanded":
                    this.selectEntity(folderVm.originalEntity.Id);
                    this._saveExpandedStateToStorage(folderVm);
                    break;
            }
        }

        /**
         * Restores a state of the list based on the last selected folder id
         * @returns a promise which is resolved when a list of loaded and a correct
         * entity is selected
         */
        public restoreState(): angular.IPromise<ap.services.apiHelper.ApiResponse> {
            let selectedFolderId = this.getLastFolderIdToSelect();

            // This logic is based on the super.refreshAndSelect method
            return this.loadIds().then(() => {
                let targetPageIndex = 0;
                if (selectedFolderId) {
                    targetPageIndex = this.getPageIndex(selectedFolderId);
                }

                if (targetPageIndex < 0) {
                    // folder does not exist anymore
                    targetPageIndex = 0;
                }

                return this.loadPage(targetPageIndex, null).then((completedArgs: ap.services.apiHelper.ApiResponse) => {
                    this.selectEntity(selectedFolderId);
                    return completedArgs;
                });
            });
        }

        /**
         * This method refresh the list of folders and keep the selected folder selected after the refresh if it's still in the list
         * @param idToSelect? string The id of the folder to select after the refresh
         * @return IPromise<ApiResponse> The promise from the API
         */
        public refreshAndSelect(idToSelect?: string): angular.IPromise<ap.services.apiHelper.ApiResponse> {
            this._idLevels.clear();
            let selectedFolderId = this.getLastFolderIdToSelect(idToSelect);

            return super.refreshAndSelect(selectedFolderId).then((completedArgs: ap.services.apiHelper.ApiResponse) => {
                this.selectEntity(selectedFolderId);
                return completedArgs;
            });
        }

        /**
         * Determines what folder id to select choosing between the given one (if any) or
         * the last selected folder id
         * @param idToSelect a predefined folder id to select if available
         * @returns a folder id to select or undefined
         */
        private getLastFolderIdToSelect(idToSelect?: string): string {
            let selectedFolderId = idToSelect;

            if (!idToSelect) {
                let selectedFolderIdCache = this._controllersManager.projectController.getLastSelectedFolderId();
                if (selectedFolderIdCache) {
                    selectedFolderId = selectedFolderIdCache;
                }
            }

            return selectedFolderId;
        }

        /*
        * This method will add the id of an expanded folder to the local storage and remove the id of a not expanded folder from the local storage
        * @param folderVm The folder for which the event has been raised
        */
        private _saveExpandedStateToStorage(folderVm: TreeEntityViewModel) {
            let expandedFoldersIds: string[] = this._controllersManager.projectController.getFolderStructureStateFromLocalStorage();

            if (folderVm.isExpanded) {
                if (expandedFoldersIds.indexOf(folderVm.originalEntity.Id) < 0) {
                    // need to add it to the list of expanded folders
                    expandedFoldersIds.push(folderVm.originalEntity.Id);
                }
            } else {
                let index: number = expandedFoldersIds.indexOf(folderVm.originalEntity.Id);
                if (index >= 0) {
                    // need to remove it from the expanded list
                    expandedFoldersIds.splice(index, 1);
                }
            }

            this._controllersManager.projectController.saveFolderStructureStateToLocalStorage(expandedFoldersIds);
        }

        constructor(utility: ap.utility.UtilityHelper, protected _api: ap.services.apiHelper.Api, protected $q: angular.IQService, private $timeout: angular.ITimeoutService, private _serviceManager: ap.services.ServicesManager,
            private _controllersManager: ap.controllers.ControllersManager, isForDocumentModule: boolean,
            treeItemVmHandler?: new (utility: ap.utility.UtilityHelper, q: angular.IQService, parentListVm?: BaseListEntityViewModel, itemParameters?: FolderItemConstructorParameter) => IEntityViewModel,
            pathToLoad?: string, sortOrder?: string, defaultFilter?: string, loadPlansNumbers: boolean = false, pageSize: number = 50, private isForManageModule: boolean = false) {
            super(utility, _controllersManager.listController, $q, new GenericPagedListOptions("Folder", treeItemVmHandler, pathToLoad, sortOrder, pageSize, false, false, "projectfolderidsandlevels", true, undefined, undefined, undefined, undefined, undefined, isForManageModule));
            this._listener.addEventsName(["needtoreindex"]);
            this._isDeferredLoadingMode = true;
            this._withActions = isForDocumentModule;
            this._needLoadPlansNumbers = loadPlansNumbers;
        }

        private _needLoadPlansNumbers: boolean = false;
        private _withActions: boolean;
        private _currentDocumentsFilter: string;
        private _docFolderIndex: number = 0;
        private _photoFolderIndex: number = 0;
        private _reportFolderIndex: number = 0;
    }
}