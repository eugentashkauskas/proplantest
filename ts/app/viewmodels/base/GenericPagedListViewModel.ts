module ap.viewmodels {

    /**
    * Describes a page of elements within a list
    ** The list of ids
    ** If the page is loaded
    */
    export class PageDescription {
        constructor(public idsList: any[] = [], public isLoaded: boolean = false) {
        }
    }

    /**
    * Helps override the default behavior of getItemAtIndex
    */
    export class GetItemAtIndexParameter {

        public get caller(): any {
            return this._caller;
        }

        public get overridenCall(): (index: number) => IEntityViewModel {
            return this._overridenCall;
        }

        public get customItemCount(): () => number {
            return this._customItemCount;
        }

        constructor(private _caller: any, private _overridenCall: (index: number) => IEntityViewModel, private _customItemCount: () => number) {
        }
    }

    /**
     * This interface is to have an object being able to create a parameter object for an item to create in a list.
     **/
    export interface ItemParameterBuilder {
        createItemParameter(itemIndex: number, dataSource: any, pageDesc: PageDescription, loadPageSuccessHandlerParameter: LoadPageSuccessHandlerParameter, utility: ap.utility.UtilityHelper): ItemConstructorParameter;
    }

    /**
     * This is use to create a predefined item which has been addded in the list
     **/
    export class PredefinedItemParameter {

        /**
        * The index where the item should be added
        **/
        public get itemIndex(): number {
            return this._itemIndex;
        }

        /**
        * The id to add to the list
        **/
        public get id(): string {
            return this._id;
        }

        /**
         * Set id that will be added to the list
         **/
        public set id(id: string) {
            this._id = id;
        }

        /**
        * The item to add to the list
        **/
        public get item(): IEntityViewModel {
            return this._item;
        }

        /**
        * The label of the item
        **/
        public get label(): string {
            return this._label;
        }

        constructor(private _itemIndex: number, private _id: string, private _item: IEntityViewModel, private _label: string = null) { }
    }

    export class GenericPagedListOptions {
        public get displayDetailLoading(): boolean {
            return this._displayDetailLoading;
        }

        public get displayLoading(): boolean {
            return this._displayLoading;
        }

        public get entityName(): string {
            return this._entityName;
        }

        public get pathToLoad(): string {
            return this._pathToLoad;
        }

        public get sortOrder(): string {
            return this._sortOrder;
        }

        public get pageSize(): number {
            return this._pageSize;
        }

        /**
         * This property returns the constructor to build the item in the list. itemParameters is a class to specify parameters to the constructor of the item
         **/
        public get itemConstructor(): new (utility: ap.utility.UtilityHelper, q: angular.IQService, parentListVm?: BaseListEntityViewModel, itemParameters?: ItemConstructorParameter) => IEntityViewModel {
            return this._itemConstructor;
        }

        /**
         * This property is to specify a custom builder for parameter to create for each item to created in the list
         **/
        public get itemParameterBuilder(): ItemParameterBuilder {
            return this._itemParameterBuilder;
        }


        public get onlyPathToLoadData(): boolean {
            return this._onlyPathToLoadData;
        }

        public get customEntityIds(): string {
            return this._customEntityIds;
        }

        public get isGetIdsCustom(): boolean {
            return this._isGetIdsCustom;
        }

        public get nbPropertiesToCheck(): number {
            return this._nbPropertiesToCheck;
        }

        /**
         * This is the list of predefined items to add in the list at specific index (ex: "Add new status..." in the list of status)
         **/
        public get predefinedItems(): PredefinedItemParameter[] {
            return this._predefinedItems;
        }

        /**
         * This method is to apply something first to ids loaded just after the load of these ids.
         **/
        public get idsLoaded(): (items: any[]) => void {
            return this.idsLoadedHandler;
        }

        /**
        * Accessor to the method type parameter used to call the API
        */
        public get requestMethodType() {
            return this._requestMethodType;
        }

        /**
        * Accessor to getItemAtIndexParameter object
        */
        public get getItemAtIndexParameter(): GetItemAtIndexParameter {
            return this._getItemAtIndexParameter;
        }

        /**
         * To build option for list workspace
         * @param entityName the entity's name the list will display. The genericpagedListViewModel will be build on this kind of entity
         * @param itemConstructor the constructor to use to create an item viewmodel. By default, it will be EntityItemViewModel
         * @param pathToLoad This is the list of properties to load from the entity to display in the list
         * @param sortOrder This is the default sort order to apply to the list
         * @param pageSize This is the number of item to load in the list
         * @param displayLoading To know if when loading data, the application must display the loading and then, the app is disabled while this time.
         * @param onlyPathToLoadData Boolean to know if the PathToLoad contains the full path of all properties to load and then, only these property will be loaded
         * @param customEntityIds To define if the real kind of entity to call from the api is not the one define in the entityName params
         * @param isGetIdsCustom Boolean to know if to get the ids of each entity, it is necessary to use the generic api call or custom one
         * @param itemParameterBuilder ItemParameterBuilder if defined, the genericPagedList will used this builder to create the parameter needed to create each item of the list
         * @param nbPropertiesToCheck it's the number of propreties we have to check
         **/

        constructor(entityName: string, itemConstructor?: new (utility: ap.utility.UtilityHelper, q: angular.IQService, parentListVm?: BaseListEntityViewModel) => IEntityViewModel,
            pathToLoad?: string, sortOrder?: string, pageSize: number = 50, displayLoading: boolean = false, onlyPathToLoadData: boolean = false, customEntityIds: string = null, isGetIdsCustom: boolean = false,
            itemParameterBuilder?: ItemParameterBuilder, nbPropertiesToCheck: number = null, private _predefinedItems: PredefinedItemParameter[] = null, private idsLoadedHandler: (items: any[]) => void = null,
            requestMethodType = ap.services.apiHelper.MethodType.Get, displayDetailLoading: boolean = false, private _getItemAtIndexParameter: GetItemAtIndexParameter = null) {
            this._entityName = entityName;
            this._itemConstructor = itemConstructor;
            this._itemParameterBuilder = itemParameterBuilder;
            this._pageSize = pageSize;
            this._pathToLoad = pathToLoad;
            this._sortOrder = sortOrder;
            this._onlyPathToLoadData = onlyPathToLoadData;
            this._customEntityIds = customEntityIds;
            this._isGetIdsCustom = isGetIdsCustom;
            this._displayLoading = displayLoading;
            this._displayDetailLoading = displayDetailLoading;
            this._nbPropertiesToCheck = nbPropertiesToCheck;
            this._requestMethodType = requestMethodType;

            if (!this._itemConstructor)
                this._itemConstructor = ap.viewmodels.EntityItemViewModel;
            if (!this._itemParameterBuilder)
                this._itemParameterBuilder = null;
            if (!this._pageSize)
                this._pageSize = 50;
            if (this._pathToLoad === undefined)
                this._pathToLoad = null;
            if (this._sortOrder === undefined)
                this._sortOrder = null;
        }

        private _entityName: string;
        private _itemConstructor: new (utility: ap.utility.UtilityHelper, q: angular.IQService, parentListVm?: BaseListEntityViewModel, itemParameters?: ItemConstructorParameter) => IEntityViewModel;
        private _itemParameterBuilder: ItemParameterBuilder;
        private _pathToLoad: string;
        private _sortOrder: string;
        private _pageSize: number;
        private _displayLoading: boolean;
        private _displayDetailLoading: boolean;
        private _onlyPathToLoadData: boolean;
        private _customEntityIds: string;
        private _isGetIdsCustom: boolean;
        private _nbPropertiesToCheck: number;
        private _requestMethodType: ap.services.apiHelper.MethodType;
    }

    /**
     * This class is to contains parameters when a page of the list is loaded. This is the base class containing the id of items loaded in the page.
     * Then, for specific list, it is possible to create a class inheriting this one to add parameter
     **/
    export class LoadPageSuccessHandlerParameter {

        /**
         * This is the list of id retrieve in the page just loaded
         **/
        public get idsToRetreive(): string[] {
            return this._idsToRetreive;
        }

        constructor(idsToRetreive: string[]) {
            this._idsToRetreive = idsToRetreive;
        }

        private _idsToRetreive: string[];
    }

    /**
     * This class will be used to create the each item of the list. It will contains all necessary parameter to create this item correctly. Can be inherited for specific list
     **/
    export class ItemConstructorParameter {

        /**
         * This is the index of the item to create in the list 
         **/
        public get itemIndex(): number {
            return this._itemIndex;
        }

        /**
         * This is the data retrieved from the api on which the item must be based to be created.
         **/
        public get dataSource(): any {
            return this._dataSource;
        }

        /**
         * This is the loaded page description on which the item is belonging. 
         **/
        public get pageDesc(): PageDescription {
            return this._pageDesc;
        }

        /**
         * This is the parameter used to load the page on which the item must be created
         **/
        public get pageLoadedParameters(): LoadPageSuccessHandlerParameter {
            return this._pageLoadedParameters;
        }

        public get utility(): ap.utility.UtilityHelper {
            return this._utility;
        }

        constructor(itemIndex: number, dataSource: any, pageDesc: PageDescription, pageLoadedParameters: LoadPageSuccessHandlerParameter, utility: ap.utility.UtilityHelper) {
            this._itemIndex = itemIndex;
            this._dataSource = dataSource;
            this._pageDesc = pageDesc;
            this._pageLoadedParameters = pageLoadedParameters;
            this._utility = utility;
        }

        private _itemIndex: number;
        private _dataSource: any;
        private _pageDesc: PageDescription;
        private _pageLoadedParameters: LoadPageSuccessHandlerParameter;
        private _utility: ap.utility.UtilityHelper;
    }

    export class GenericPagedListViewModels extends ListEntityViewModel {

        public get options(): GenericPagedListOptions {
            return this._options;
        }

        public get nbPages(): number {
            return this._pages.length;
        }

        public get filter(): string {
            return this._filter;
        }

        public set filter(filter: string) {
            this._filter = filter;
        }

        public get isIdsLoaded(): boolean {
            return this._isIdsLoaded;
        }

        public get customParams(): Array<ap.services.apiHelper.ApiCustomParam> {
            return this._customParams;
        }

        public get isDeferredLoadingMode(): boolean {
            return this._isDeferredLoadingMode;
        }

        public set isDeferredLoadingMode(value: boolean) {
            this._isDeferredLoadingMode = value;
        }

        public get ids(): any[] {
            return this._listIds;
        }

        /**
        * Dictionnay which contains for each ids its level
        * Only relevant for items with levels (issuetype, rooms, folders)
        */
        public get idLevels(): Dictionary<string, number> {
            return this._idLevels;
        }

        /**
        * To known the list contains duplicated items
        **/
        public get isDuplicated(): boolean {
            return this._isDuplicated;
        }

        /**
        * Get idValuesDictionary, a dictionary where the key is the id of the entity and the values are the properties to check
        **/
        public get idValuesDictionary() {
            return this._idValuesDictionary;
        }

        /**
        *
        **/
        public get valuesIdsDictionary() {
            return this._valuesIdsDictionary;
        }

        /**
        * Method use to know if the item has been changed
        **/
        public getChangedItems(): IEntityViewModel[] {
            let tab: IEntityViewModel[] = [];

            // this inner function returns true if the item has changed.  Used in the filter function
            function predicate(entityViewModel: ap.viewmodels.EntityViewModel) {
                return entityViewModel && entityViewModel.hasChanged;
            }

            tab = this.sourceItems.filter(predicate);
            if (this.useCacheSystem) {
                // first filter is to check if the item hasChanged  and the second to see if it's not already in the tab
                tab = tab.concat(this._cacheData.values().filter(predicate).filter((entityViewModel: ap.viewmodels.EntityViewModel) => { return tab.indexOf(entityViewModel) < 0; }));
            }
            return tab;
        }

        /**
        * Method use to get all duplicated item of the list
        **/
        public getDuplicatedItems(): IEntityViewModel[] {
            let tab: IEntityViewModel[] = [];
            for (let i = 0; i < this.sourceItems.length; i++) {
                if (this.sourceItems[i] && this.sourceItems[i].isDuplicated) {
                    tab.push(this.sourceItems[i]);
                }
            }
            return tab;
        }

        /**
         * Method called after the selectedAll property has been changed
         */
        protected afterSelectedAllChanged() {
            super.afterSelectedAllChanged();
            if (this.selectedAll) {
                let unCanCheckedItemIds = this.getUncheckedItemIds();
                this.listidsChecked = this.ids.filter((item) => {
                    return unCanCheckedItemIds.indexOf(item) < 0;
                });
            } else if (this.selectedAll === false) {
                this.listidsChecked = [];
            }
        }

        protected getUncheckedItemIds(): string[] {
            return this.getUncheckedLoadedItems().map((item) => {
                return item.originalEntity.Id;
            });
        }

        protected updateItemCheckState(loadedPage: IEntityViewModel[]) {
            if (this.listidsChecked.length > 0) {
                loadedPage.forEach((item) => {
                    if (this.listidsChecked.indexOf(item.originalEntity.Id) >= 0) {
                        item.defaultChecked = true;
                    }
                });
            }
        }

        /**
        * Method use to get the cache which contains all loaded item vm
        **/
        protected get cacheData(): Dictionary<string, IEntityViewModel> {
            return this._cacheData;
        }

        /**
        * To cache the data and reuse when the page load again
        **/
        public get useCacheSystem(): boolean {
            return this._useCacheSystem;
        }

        public set useCacheSystem(val: boolean) {
            if (val !== this._useCacheSystem) {
                this._useCacheSystem = val;
                if (!this._useCacheSystem && this._cacheData) {
                    this._cacheData.clear();
                }
            }
        }

        /**
         * Initialize the defaultChecked property of a list of items based on the selectAll property
         * Called each time a page is loaded
         * @param items Page of loaded items
         */
        initializeDefaultCheckedItems(items?: IEntityViewModel[]) {
            let changeIsChecked: (item: IEntityViewModel) => void = (item: IEntityViewModel) => {
                if (item && item.originalEntity) {
                    item.defaultChecked = this.selectedAll === true || this.selectedAll === undefined; // use default check to not raise the check event for each item
                }
            };

            if (items) {
                items.forEach((item: IEntityViewModel) => {
                    changeIsChecked(item);
                    if (item.originalEntity && this.listidsChecked.indexOf(item.originalEntity.Id) > -1) {
                        item.defaultChecked = true; // use default check to not raise the check event for each item
                    } else {
                        item.defaultChecked = false;
                    }
                });
            } else {
                this.sourceItems.forEach((item: IEntityViewModel) => {
                    changeIsChecked(item);
                });
            }
        }

        /**
         * Adds the given entity to the cache
         * @param entityViewModel an entity to cache
         * @throws an error if caching is disabled
         */
        public addIntoCache(entityViewModel: IEntityViewModel) {
            if (!this.useCacheSystem) {
                throw new Error("Caching is disabled for this list view model");
            }

            this.beforeAddIntoCache(entityViewModel);

            this._cacheData.add(entityViewModel.originalEntity.Id, entityViewModel);
        }

        protected beforeAddIntoCache(entityViewModel: IEntityViewModel): void {
            // logic to be done before adding an element in the cache
        }

        /**
        * Method used to remove an item (the item in param)
        * @param item -> the item to remove
        **/
        public removeItem(item: EntityViewModel) {
            let indexPage: number;
            let page: PageDescription;
            if (!item || item === null) {
                throw new Error("The item cannot be null or undefined");
            }
            if (!this.isIdsLoaded) {
                throw new Error("The ids are not loaded");
            }
            indexPage = this.getPageIndex(item.originalEntity.Id);
            if (indexPage === -1) {
                throw new Error("The page is not found");
            } else {
                page = this.getPage(indexPage);
                let position = page.idsList.indexOf(item.originalEntity.Id);
                page.idsList.splice(position, 1);

                if (this.useCacheSystem) {
                    this._cacheData.remove(item.originalEntity.Id);
                }

                let entityPosition: number = this.sourceItems.indexOf(item);
                this.sourceItems.splice(entityPosition, 1);
                this._setCount(this._count - 1);
                this._listener.raise("itemremoved", new ItemRemovedEvent(entityPosition, item));
            }
        }

        /**
        * Check if item checking is allowed
        * @param {IEntityViewModel} item Item to be checked
        **/
        public isItemCheckAllowed(item: IEntityViewModel) {
            if (!item)
                return false;
            return true;
        }

        // Public methods
        on(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.on(eventName, callback, caller);
        }
        off(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.off(eventName, callback, caller);
        }

        /**
         * The method will return the item index in the list of a specific item'id
         * @param id this is the id of the item for which we want to know the item index
         **/
        getItemIndex(id: string): number {
            for (let i: number = 0; i < this._listIds.length; i++) {
                if (this.IsIdOfItem(id, this._listIds[i])) {
                    return i;
                }
            }

            return -1;
        }

        /**
        * This method return the index of the element in the specified page
        * @param id string The id of the element
        * @pageDesc PageDescription The page to look for the id
        */
        getPageItemIndex(id: string, pageDesc: PageDescription): number {
            return pageDesc.idsList.indexOf(id);
        }

        /**
         * The method will return the item at a specific index of the list
         * @param index this is the researched index of the item in the list
         **/
        getItemAtIndex(index: number) {
            // AP-10003: this is to adapt old logic (with some unit test) 
            //           that in case the sourceItems is directly set then we just need to return specific item (if existed)
            if (this.isDeferredLoadingMode === false) {

                if (index >= this.sourceItems.length) {
                    if (this.isLoading === false)
                        this.loadNextPage();
                    return null;
                }
                return this.sourceItems[index];
            }

            if (this.isLoading === true) return null;

            if (this._isIdsLoaded === false) {
                this.loadIds(this._filter).then((completedArgs: ap.services.apiHelper.ApiResponse) => {
                    return this.getItemAtIndex(index);
                }, () => {
                    this.changeIsLoading(false);
                    return null;
                });
            } else {

                if (index !== undefined && index !== null && (index < 0 || index >= this.sourceItems.length)) {
                    // GetitemAtIndex is called with index > getLength()
                    // https://github.com/angular/material/issues/6844
                    // throw new Error("Index out of range (index=" + index + " count=" + this.sourceItems.length + ")");

                } else if (index !== undefined && index !== null) {

                    if (index >= this._listIds.length && this._options && this._options.getItemAtIndexParameter) {
                        // if there more items than ids -> means custom items have been added into the list
                        return this._options.getItemAtIndexParameter.overridenCall.call(this._options.getItemAtIndexParameter.caller, index);
                    }

                    // When implement insert function, the item of the page can over the page size, then we can not base on the pageSize to get the correct page index
                    let pageIndex = this.getPageIndexOfItemAt(index);
                    let page = this._pages[pageIndex];

                    if (page && page.isLoaded) {
                        this.previousAndNextPages(pageIndex);
                        return !this.sourceItems[index] ? null : this.sourceItems[index];
                    }
                    else {
                        this.loadPage(pageIndex).then((completedArgs: ap.services.apiHelper.ApiResponse) => {
                            this.previousAndNextPages(pageIndex);
                            return this.getItemAtIndex(index);
                        }, () => {
                            this.changeIsLoading(false);
                            return null;
                        });
                    }
                }
            }
        }
        // Required for infinitescroll
        // For infinite scroll behavior, we always return a slightly higher
        // number than the previously loaded items.
        // AP-10003: now swith to Deferred Loading, so need to return real items number
        getLength(): number {
            if (this.isDeferredLoadingMode === false) {
                if (this.isLoaded === false)
                    return this.sourceItems.length + 5;
                return this.count + 2;
            } else if (this.options.getItemAtIndexParameter) {
                return this.count + this.options.getItemAtIndexParameter.customItemCount.call(this.options.getItemAtIndexParameter.caller);
            }

            return this.count;
        }

        getPage(index: number): PageDescription {
            let pd: PageDescription = this._pages[index];
            return new PageDescription(pd.idsList, pd.isLoaded);
        }

        /**
         * This function is used to add a parameter to the api request. 
         * @param name this is the name of the parameter 
         * @param value this is the value of the parameter
         **/
        addCustomParam(name: string, value: string) {
            if (this._customParams === null)
                this._customParams = [];
            this._customParams.push(new ap.services.apiHelper.ApiCustomParam(name, value));
        }

        /**
         * This function is used to remove a custom parameter added 
         * @param name The name of the parameter to remove
         **/
        removeCustomParam(name: string) {
            if (this._customParams !== null) {
                let len = this._customParams.length;
                for (let i = 0; i < len; i++) {
                    if (this._customParams[i].name === name) {
                        this._customParams.splice(i, 1);
                        break;
                    }
                }
            }
        }

        /** 
         * This function is used to clear all the custom parameters added
         **/
        clearCustomParams() {
            this._customParams = [];
        }

        /** 
         * Overrider base class so that when need to clrear we consider as id loaded to avoid some code to load again
         **/
        clear(): void {
            super.clear();
            this._isIdsLoaded = true;
        }

        /**
         * This function is used to retrieve a CustomParam added by its name. It returns true if found
         * @param name the name of the custom parameter to find
         **/
        getParam(name: string): ap.services.apiHelper.ApiCustomParam {
            if (this._customParams !== null) {
                let len = this._customParams.length;
                for (let i = 0; i < len; i++) {
                    if (this._customParams[i].name === name) {
                        return this._customParams[i];
                    }
                }
            }
            return null;
        }

        /**
         * This function is used to know if a custom parameter exists with a specific name
         * @param name the name of the custom parameter to check if already exists
         **/
        containsParam(name: string): boolean {
            let found: boolean = false;
            let i: number = 0;

            if (this._customParams === null)
                return found;

            let lenght = this._customParams.length;

            while (!found && i < lenght) {
                found = this._customParams[i].name === name;

                i++;
            }

            return found;
        }

        /**
         * Clears caches of a loader which is used by the list view model
         */
        clearLoaderCache() {
            this._listController.reset(this._entityName);

            if (this.options.customEntityIds !== null) {
                // Clear ids if they have different entity name
                this._listController.reset(this.options.customEntityIds);
            }
        }

        /**
         * This function is used to load the ids corresponding to a specific filter concatenated to the default one. 
         * @param filter the filter to apply to retrieve the ids of entities we want to load
         **/
        loadIds(filter: string = null, param: any = null): angular.IPromise<ap.services.apiHelper.ApiResponse> {
            this.onLoadItems(null, false);
            this._pages = [];
            this._listIds = [];
            this._isIdsLoaded = false;

            let fullFilter;
            this._filter = filter;
            if (this._defaultFilter !== undefined && this._defaultFilter !== null && this._filter && this._filter !== null)
                fullFilter = "Filter.And(" + this._defaultFilter + "," + this._filter + ")";
            else if (this._defaultFilter && this._defaultFilter !== null)
                fullFilter = this._defaultFilter;
            else if (this._filter && this._filter !== null)
                fullFilter = this._filter;
            this._setCount(null);

            this.changeIsLoading(true);
            let self = this;
            let options = new ap.services.apiHelper.ApiOption();
            options.showDetailBusy = this.options.displayDetailLoading;
            options.async = !this._options.displayLoading;
            if (this._customParams !== null)
                options.customParams = this._customParams;

            let entityName: string = this._entityName;
            if (this.options.customEntityIds !== null)
                entityName = this.options.customEntityIds;

            let url: string = "rest/" + entityName;

            if (this.options.isGetIdsCustom) {
                return this._listController.getEntityIdsCustom(url, this.options.requestMethodType, param, options)
                    .then(function (completedArgs: ap.services.apiHelper.ApiResponse) {
                        return self.loadIdsCompleted(completedArgs);

                    }, function (reason: any) {
                        self.changeIsLoading(false);
                        self._pages.push(new PageDescription([], true));
                        self._isIdsLoaded = true;
                        return self.$q.reject(reason);
                    });
            } else {
                return this._listController.getEntityIds(entityName, fullFilter, this._sortOrder, options, false)
                    .then(function (completedArgs: ap.services.apiHelper.ApiResponse) {
                        return self.loadIdsCompleted(completedArgs);

                    }, function (reason) {
                        self.changeIsLoading(false);
                        self._pages.push(new PageDescription([], true));
                        self._isIdsLoaded = true;
                        return self.$q.reject(reason);
                    });
            }
        }

        /**
         * This method is to build the id object for the idsList. Sometimes, the ids returned from the api contains more info of id. It will be good sometimes to split the value in a more complex object
         * @param item the id value received from the api
         **/
        protected buildIdInfo(id: any): any {
            return id;
        }

        /**
         * This method raises the idsLoaded event.
         * It can be overrided to add behavior to an object when the ids are loaded
         **/
        protected onIdsLoaded() {
            this._listener.raise("idsloaded", this._isIdsLoaded);
        }

        protected loadIdsCompleted(completedArgs: ap.services.apiHelper.ApiResponse): ap.services.apiHelper.ApiResponse {
            this.setIds(completedArgs.data);
            return completedArgs;
        }

        /**
        * This method is used to specified the list ids for the GenericPagedListViewModels
        * @param items is the array of ids
        **/
        protected setIds(items: any[]) {
            this.clear();
            let pageDesc: PageDescription = null;
            // This part add some predefined ids to the list threw the list options
            if (this.options.predefinedItems && this.options.predefinedItems.length > 0) {
                let array: any[] = [];
                for (let i = 0; i < this.options.predefinedItems.length; i++) {
                    let item = this.options.predefinedItems[i];
                    if (items.indexOf(item.id) === -1) {
                        items.splice(item.itemIndex, 0, item.id);
                    }
                }
            }
            if (this.options.idsLoaded)
                this.options.idsLoaded(items);

            // get the length after idsLoaded() because the ids array can be modified by subclasses
            let len = items.length;
            if (len === 0) { // The list is empty, we need to specify that first page is loaded but without items
                this._pages.push(new PageDescription([], true));
            }
            else {
                for (let i = 0; i < len; i++) {
                    if (i % this.options.pageSize === 0) {
                        pageDesc = new PageDescription();
                        this._pages.push(pageDesc);
                    }
                    pageDesc.idsList.push(this.buildIdInfo(items[i]));
                }
            }

            this._listIds = items;
            this._isIdsLoaded = true;
            this.changeIsLoading(false);
            this.onIdsLoaded();

            let cpt = items && items !== null ? items.length : 0;

            if (cpt !== this.count)
                this._setCount(cpt);
            if (this._isDeferredLoadingMode)
                this.sourceItems = new Array(this._listIds.length); // AP-10002: allow to load random page so we need to init fixed size of source items
            else
                this.sourceItems = [];

            this._setLoaded();
        }

        loadNextPage(): angular.IPromise<ap.services.apiHelper.ApiResponse> {
            for (let i = 0; i < this._pages.length; i++) {
                if (this._pages[i].isLoaded === false) {
                    return this.loadPage(i, null);
                }
            }
            return this.loadPage(0, null);
        }

        loadPage(index: number, filter?: string): angular.IPromise<ap.services.apiHelper.ApiResponse> {
            let deferred = this.$q.defer<ap.services.apiHelper.ApiResponse>();
            if (this._isIdsLoaded === false) { // Ids wasn't yet loaded
                this.loadIds(filter).then((args: ap.services.apiHelper.ApiResponse) => {
                    if (args.data.length > 0)
                        this._loadPageHandler(deferred, index);
                    return args;
                }, () => {
                    deferred.reject();
                    return deferred.promise;
                });
            }
            else {
                if (this.isLoaded === false)
                    this._loadPageHandler(deferred, index);
                else
                    deferred.resolve();
            }
            return deferred.promise;
        }

        onLoadItems(items: IEntityViewModel[], isSelectedFirst?: boolean): void {
            this._pages = [];
            this._listIds = [];
            this._isIdsLoaded = false;
            super.onLoadItems(items, isSelectedFirst);
        }

        // Private methods
        protected _setLoaded(): void {
            let oldValue = this._isLoaded;
            if (this._isDeferredLoadingMode) {
                if (this.sourceItems !== undefined && this._isIdsLoaded && this._listIds !== undefined
                    && this.sourceItems.length === this._listIds.length) {
                    // this._isLoaded = this.sourceItems.length === this._listIds.length;
                    this._isLoaded = true;
                    for (let item of this.sourceItems) {
                        if (item === undefined) {
                            this._isLoaded = false;
                            break;
                        }
                    }
                } else {
                    this._isLoaded = false;
                }
            }
            else {
                if (this.sourceItems !== undefined && this._isIdsLoaded && this._listIds !== undefined)
                    this._isLoaded = this.sourceItems.length === this._listIds.length;
            }

            if (this._listIds !== undefined && this._listIds.length === 0)
                this.changeIsLoading(false);
            if (this._isLoaded !== oldValue)
                this._listener.raise("isLoadedChanged", this._isLoaded);
        }

        protected _onPageLoaded(pageDesc: PageDescription, itemList: IEntityViewModel[]): void {
            pageDesc.isLoaded = true;

            let idxPage = this._pages.indexOf(pageDesc);
            if (idxPage < 0) {
                // This situation is possible when we are trying to re-load a list from a server
                // while a previous loading is still in progress (for example, when a user changes
                // a set of filters applied to a list)
                console.warn("The loaded page index is not found.");
                return;
            }
            idxPage = idxPage * this.options.pageSize;

            let len = itemList.length;

            // AP-10002: now allow to load random page
            // if (this.sourceItems !== null && this.sourceItems.length !== idxPage) throw "Error: page loaded isn't the next one " + this.sourceItems.length + "/" + idxPage;
            if (len > 0) {
                for (let i = 0; i < len; i++) {
                    let item: IEntityViewModel = <EntityViewModel>itemList[i];
                    if (item) {
                        if (item instanceof ap.viewmodels.EntityViewModel)
                            item.on("propertychanged", this.itemPropertyChanged, this);
                        if (item.originalEntity && this.listidsChecked.indexOf(item.originalEntity.Id) >= 0) {
                            item.defaultChecked = true;
                        }
                        this.sourceItems[idxPage + i] = itemList[i];
                    }
                }
            }
            if (this._listController.getSelectedId(this.entityName)) {
                this.selectEntity(this._listController.getSelectedId(this.entityName));
            }
            this._setLoaded();
            this.changeIsLoading(false);
            this._listener.raise("pageloaded", itemList);
            this.updateItemCheckState(itemList);
        }

        /**
         * This method returns the list of ids corresponding to a specific page
         * @param pageDesc The page for which we need to retrieve the list of ids.
         **/
        protected getPageIds(pageDesc: PageDescription): string[] {
            let ids: string[] = [];
            let idsLen: number = pageDesc.idsList.length;
            for (let idxId: number = 0; idxId < idsLen; idxId++) {
                ids.push(pageDesc.idsList[idxId]);
            }

            return ids;
        }

        /**
         * This function is used to call the api to load the entity corresponding to a specific page
         * @param deferred this is the deferred to use to resolve/reject the async call to the api
         * @param index this is the index of the page to load
         **/
        protected _loadPageHandler(deferred: angular.IDeferred<ap.services.apiHelper.ApiResponse>, index: number) {
            let lenPage: number = this._pages.length;
            let pageDesc: PageDescription = null;

            if (this._pages.length <= index)
                throw new Error("The index is out of range");

            pageDesc = this._pages[index];

            let pageids: string[] = this.getPageIds(pageDesc);
            let idsToLoad: string[] = [];
            if (this._useCacheSystem) {
                for (let i = 0; i < pageids.length; i++) {
                    if (!this._cacheData.containsKey(pageids[i]))
                        idsToLoad.push(pageids[i]);
                }
            }
            else
                idsToLoad = pageids;

            let result: IEntityViewModel[];

            if (idsToLoad.length > 0) {
                this.changeIsLoading(true);
                let options = new ap.services.apiHelper.ApiOption();
                options.async = !this.options.displayLoading;
                options.onlyPathToLoadData = this.options.onlyPathToLoadData;
                options.showDetailBusy = this.options.displayDetailLoading;
                if (this._customParams !== null)
                    options.customParams = this._customParams;
                this._listController.getEntityList(this._entityName, idsToLoad, this._pathToLoad, options).then((args: ap.services.apiHelper.ApiResponse) => {
                    let parameters = this.createPageLoadedSuccessHandlerParams(idsToLoad);
                    let arrayItem = this.loadPageSuccessHandler(args, pageDesc, index, this.$utility, this.$q, this.options.itemConstructor, parameters);

                    // After the items created, for each we raise one event
                    for (let i = 0; i < arrayItem.length; i++) {
                        let item = <IEntityViewModel>arrayItem[i];

                        if (item) this._listener.raise("itemcreated", item);
                        if (this._useCacheSystem) {
                            this._cacheData.add(item.originalEntity.Id, item);
                        }
                    }
                    if (!this._useCacheSystem)
                        result = arrayItem;
                    else {
                        result = new Array<IEntityViewModel>(pageids.length);
                        for (let i = 0; i < pageids.length; i++) {
                            let item = this._cacheData.getValue(pageids[i]);
                            result[i] = item;
                        }
                    }
                    // Need to update sourceItems
                    this._onPageLoaded(pageDesc, result);
                    deferred.resolve();

                }, () => {
                    this.changeIsLoading(false);
                    deferred.reject();
                    return deferred.promise;
                });
            }
            else {
                result = new Array<IEntityViewModel>(pageids.length);
                for (let i = 0; i < pageids.length; i++) {
                    let item = this._cacheData.getValue(pageids[i]);
                    result[i] = item;
                }
                this._onPageLoaded(pageDesc, result);
                deferred.resolve();
            }
        }

        /**
         * This method will compare an id with the item's id.
         * The classes that inherit from GenericPageListViewModel must override the method if the IdsList contains something else that simple ids (such as LevelId)
         * @param itemId is the id of the item 
         * @param pageItem is the "object" representing an item in a page
         **/
        protected IsIdOfItem(itemId: string, item: any): boolean {
            return itemId === item;
        }

        /**
         * This method will compare an id with the page item's id.
         * The classes that inherit from GenericPageListViewModel must override the method if the page IdsList contains something else that simple ids (such as LevelId)
         * @param itemId is the id of the item 
         * @param pageItem is the "object" representing an item in a page
         **/
        protected IsIdOfPageItem(itemId: string, pageItem: any): boolean {
            return itemId === pageItem;
        }

        /**
         * This method will return the page index of the page which contains the itemId
         * @param itemId is the item need to find the page index
         **/
        public getPageIndex(itemId: string): number {

            if (this._pages && this._pages !== null && this._pages.length > 0) {
                for (let i = 0; i < this._pages.length; i++) {
                    let page: PageDescription = this._pages[i];
                    if (page.idsList && page.idsList !== null && page.idsList.length > 0) {
                        for (let j = 0; j < page.idsList.length; j++) {
                            let pageId: string = page.idsList[j];
                            if (this.IsIdOfPageItem(itemId, pageId))
                                return i;
                        }
                    }
                }
            }
            return -1;
        }

        public refresh() {
            if (this._isRefreshing === true)
                return;

            this._isRefreshing = true;
            let self = this;
            this.refreshAndSelect(null).then(() => {
                self._isRefreshing = false;
            }, () => {
                self._isRefreshing = false;
            });
        }

        protected refreshAndSelect(idToSelect?: string): angular.IPromise<ap.services.apiHelper.ApiResponse> {
            let deferred: ng.IDeferred<ap.services.apiHelper.ApiResponse> = this.$q.defer();
            let self = this;
            this.clearLoaderCache();
            this.loadIds().then(function (completedArgs: ap.services.apiHelper.ApiResponse) {
                let pageIndex = 0;
                if (idToSelect)
                    pageIndex = self.getPageIndex(idToSelect);

                if (pageIndex < 0) // folder does not exist anymore
                    pageIndex = 0;

                self.loadPage(pageIndex, null).then(function (completedArgs: ap.services.apiHelper.ApiResponse) {
                    deferred.resolve(completedArgs);

                }, function (reason) {
                    deferred.reject(reason);
                });
            }, function (reason) {
                deferred.reject(reason);
            });
            return deferred.promise;
        }

        /**
         * This method checks if the Vm contains duplicated items
         */
        public checkIsDuplicated(arrayItem: IEntityViewModel[] = null) {
            let isDuplicated: boolean = false;
            let items: IEntityViewModel[];
            if (this.sourceItems.length > 0 && this.sourceItems[0] !== undefined /* first item added and it's empty*/) {
                items = this.sourceItems;
            } else {
                items = arrayItem;
            }
            if (items !== null) {
                for (let i = 0; i < items.length; i++) {
                    if (items[i] && items[i].isDuplicated) {
                        isDuplicated = true;
                        break;
                    }
                }
            }
            this._isDuplicated = isDuplicated;
        }

        /**
         * This method load previous and next page
         * @param currentPageIndex - index of current page
         */
        private previousAndNextPages(currentPageIndex: number) {
            if (currentPageIndex !== 0 && !this._pages[currentPageIndex - 1].isLoaded) {
                // console.log("current page index: " + currentPageIndex + " page to  load: " + (currentPageIndex - 1));
                this.loadPage(currentPageIndex - 1).then(() => {
                    if (currentPageIndex > 1 && !this._pages[currentPageIndex - 2].isLoaded) {
                        // console.log("second page to load " + (currentPageIndex - 2));
                        this.loadPage(currentPageIndex - 2);
                    }
                });
            }

            if (currentPageIndex !== this._pages.length - 1 && !this._pages[currentPageIndex + 1].isLoaded) {
                // console.log("current page index: " + currentPageIndex + " page to  load: " + (currentPageIndex + 1));
                this.loadPage(currentPageIndex + 1).then(() => {
                    if (currentPageIndex < this._pages.length - 2 && !this._pages[currentPageIndex + 2].isLoaded) {
                        // console.log("second page to load " + (currentPageIndex + 2));

                        this.loadPage(currentPageIndex + 2);
                    }
                });
            }
        }

        /**
         * Method use to set an item as duplicated (or not) depends of the propreties to check
         * @param itemVm the viewmodel to check
         **/
        protected checkForDuplicatedItems(itemVm: IEntityViewModel, arrayItem: IEntityViewModel[] = []) {
            let oldValue: string;
            // The item is duplicated if one of boolean is false and not duplicated is all are true
            let checkIdIsDuplicated: KeyValue<string, boolean>[] = [];
            // Need to check every propreties of the item (exemple : chapter -> code = 1 proprety to check)
            for (let i = 0; i < this.options.nbPropertiesToCheck; i++) {
                // Create a keyValue to set all propreties to false (when there are duplicated the value is set to true)
                checkIdIsDuplicated.push(new KeyValue(this.getCurrentEntityViewModelValuesToCheck(itemVm)[i].key, false));
                let currentValueIdsDictionary: IDictionary<string, string[]> = this.valuesIdsDictionary[i]; // <Key = Value; Value = Entities ids which have the same property value>
                // check the valueIdsDictionnary with the old one when the item has been updated
                oldValue = this.idValuesDictionary.getValue(itemVm.originalEntity.Id)[i].value;

                // if the value is different, it means that the proprety has changed
                if (oldValue !== this.getCurrentEntityViewModelValuesToCheck(itemVm)[i].value) {
                    let duplicatedIds = currentValueIdsDictionary.getValue(oldValue);

                    // so we can removed the id
                    let index = duplicatedIds.indexOf(itemVm.originalEntity.Id);
                    duplicatedIds.splice(index, 1);

                    // Check whether other duplicates are still duplicates
                    for (let i = 0, ilen = duplicatedIds.length; i < ilen; i++) {
                        let duplicate: IEntityViewModel = this.getEntityById(duplicatedIds[i]);
                        if (!duplicate) {
                            for (let k = 0, klen = arrayItem.length; k < klen; k++) {
                                if (arrayItem[k].isDuplicated && arrayItem[k].originalEntity.Id === duplicatedIds[i]) {
                                    duplicate = arrayItem[k];
                                    break;
                                }
                            }
                        }
                        if (!duplicate) {
                            // A duplicate view model is not found.
                            continue;
                        }

                        // We should check whether this entity still has some duplicates
                        duplicate.isDuplicated = false;

                        let duplicateProperties: KeyValue<string, string>[] = this.getCurrentEntityViewModelValuesToCheck(duplicate);
                        for (let k = 0, klen = duplicateProperties.length; k < klen; k++) {
                            let duplicateProperty: KeyValue<string, string> = duplicateProperties[k];
                            let valueIds: string[] = this.valuesIdsDictionary[k].getValue(duplicateProperty.value);
                            if (valueIds && valueIds.length > 1) {
                                // So, this entity still has duplicates
                                duplicate.isDuplicated = true;
                                break;
                            }
                        }
                    }

                    if (duplicatedIds.length === 0) {
                        currentValueIdsDictionary.remove(oldValue);
                    }

                    // Let's pretend that this entity doesn't have duplicates for now. We'll check it later.
                    checkIdIsDuplicated[i].value = false;

                    // and update the value
                    this.idValuesDictionary.getValue(itemVm.originalEntity.Id)[i].value = this.getCurrentEntityViewModelValuesToCheck(itemVm)[i].value;
                }

                // get the key(s) of the not loaded item which have the same property value as the current one
                let notLoadedDuplicated: string[] = [];
                let values = this.idValuesDictionary.values();
                for (let j = 0; j < values.length; j++) {
                    if (this.idValuesDictionary.values()[j][i].value === this.getCurrentEntityViewModelValuesToCheck(itemVm)[i].value) {
                        notLoadedDuplicated.push(this.idValuesDictionary.keys()[j]);
                    }
                }

                // check the valueIdsDictionnary with the new value of the item/ or when it's loaded
                if (this.valuesIdsDictionary[i].containsKey(this.getCurrentEntityViewModelValuesToCheck(itemVm)[i].value)) {
                    let duplicatedItemsIds: string[] = this.valuesIdsDictionary[i].getValue(this.getCurrentEntityViewModelValuesToCheck(itemVm)[i].value);
                    let itemId: string = itemVm.originalEntity.Id;


                    for (let i = 0, len = duplicatedItemsIds.length; i < len; i++) {
                        if (duplicatedItemsIds[i] === itemId) {
                            continue;
                        }

                        let duplicatedItem = this.getEntityById(duplicatedItemsIds[i]);
                        if (duplicatedItem) {
                            duplicatedItem.isDuplicated = true;
                        }
                    }
                    if (duplicatedItemsIds.indexOf(itemId) < 0) {
                        duplicatedItemsIds.push(itemId);
                    }


                    checkIdIsDuplicated[i].value = duplicatedItemsIds.length > 1;
                } else {
                    this.valuesIdsDictionary[i].add(this.getCurrentEntityViewModelValuesToCheck(itemVm)[i].value, [itemVm.originalEntity.Id]);
                    if (notLoadedDuplicated.length < 2) {
                        checkIdIsDuplicated[i].value = false;
                    } else {
                        checkIdIsDuplicated[i].value = true;
                    }
                }
            }

            // if one proprety is true, it means that the itemVm is duplicated
            let item = this.getEntityById(itemVm.originalEntity.Id) || itemVm;
            item.isDuplicated = false;
            for (let i = 0; i < this.options.nbPropertiesToCheck; i++) {
                if (checkIdIsDuplicated[i].value === true) {
                    item.isDuplicated = true;
                }
            }
            this.checkIsDuplicated(arrayItem);
        }

        /**
         * This method return an array of keyValue containing the proprety to check and the value of a given entity viewModel
         * @param entityVm: the entity we take the id to get the array of keyValue
         **/
        protected getCurrentEntityViewModelValuesToCheck(entityVm: IEntityViewModel): KeyValue<string, string>[] {
            throw new ap.misc.NotImplementedException();
        }

        /**
         * This method is used to init dictionary data, writing vm's data with the needed order to the dictionaries
         * @param entityVm The entity we take the id to get the array of keyValue and init its data in the 
         **/
        protected initDuplicatedData(entityVm: IEntityViewModel) {
            let valuesToCheck = this.getCurrentEntityViewModelValuesToCheck(entityVm);
            if (this.idValuesDictionary.containsKey(entityVm.originalEntity.Id)) {
                this.idValuesDictionary.getValue(entityVm.originalEntity.Id).forEach((field: KeyValue<string, string>) => {
                    valuesToCheck.forEach((newValField: KeyValue<string, string>) => {
                        if (field.key === newValField.key)
                            field.value = newValField.value;
                    });
                });
            } else {
                this.idValuesDictionary.add(entityVm.originalEntity.Id, valuesToCheck);
            }
            valuesToCheck.forEach((keyValue: KeyValue<string, string>, index: number) => {
                let valsIds = this.valuesIdsDictionary[index];
                if (valsIds.containsKey(keyValue.value)) {
                    let valueIds = valsIds.getValue(keyValue.value);
                    if (valueIds.indexOf(entityVm.originalEntity.Id) < 0) {
                        valueIds.push(entityVm.originalEntity.Id);
                    }
                } else {
                    valsIds.add(keyValue.value, [entityVm.originalEntity.Id]);
                }
            });
        }

        /**
         * This method is used to removed dictionary data
         * @param entityVm for delete data 
         **/
        protected removeDuplicatedData(entityVm: IEntityViewModel) {
            let valuesToCheck = this.getCurrentEntityViewModelValuesToCheck(entityVm);
            this.idValuesDictionary.remove(entityVm.originalEntity.Id);
            valuesToCheck.forEach((keyValue: KeyValue<string, string>, index: number) => {
                let valsIds = this.valuesIdsDictionary[index];
                valsIds.remove(keyValue.value);
            });
        }

        /**
         * This method is used to clear dictionary data about duplicated items
         */
        protected clearDuplicatedData() {
            this.idValuesDictionary.clear();
            for (let i = 0, len = this._options.nbPropertiesToCheck; i < len; i++) {
                this.valuesIdsDictionary[i].clear();
            }
        }

        /**
         * This method creates a class used as parameters for the loadPageSuccessHandler.  In GenericPagedListViewModel, it only contains the list of ids
         * @param ids string[] The list of entities ids which have been loaded
         * @return LoadPageSuccesshandlerParameter
         */
        protected createPageLoadedSuccessHandlerParams(ids: string[]): LoadPageSuccessHandlerParameter {
            return new LoadPageSuccessHandlerParameter(ids);
        }

        /**
         * This method will be called when a page has been successfully loaded but before to create items. This methods should be overriden for specific list if some behavior must be done before to create items.
         * @param arrayItem this is the arrayItem where the item will be created
         * @param index this is the index of the loaded page
         * @param pageDesc this is the pageDescription just loaded
         * @param createItemVmHandler this is the constructor to use to create an item
         * @param parameters THis is the parameter used to load the page
         **/
        protected beforeLoadPageSuccessHandler(arrayItem: IEntityViewModel[], index: number, pageDesc: PageDescription, createItemVmHandler?: new (utility: ap.utility.UtilityHelper, q: angular.IQService, parentListVm?: BaseListEntityViewModel, itemParameters?: ItemConstructorParameter) => IEntityViewModel, pageLoadedParameters?: LoadPageSuccessHandlerParameter) {
            // abstract
        }

        /**
         * This method will be called when a page has been successfully loaded after item has been created.This methods should be overriden for specific list if some behavior must be done after items created.
         * @param arrayItem this is the arrayItem where the item will be created
         * @param index this is the index of the loaded page
         * @param pageDesc this is the pageDescription just loaded
         * @param createItemVmHandler this is the constructor to use to create an item
         * @param parameters THis is the parameter used to load the page
         **/
        protected afterLoadPageSuccessHandler(arrayItem: IEntityViewModel[], index: number, pageDesc: PageDescription, createItemVmHandler?: new (utility: ap.utility.UtilityHelper, q: angular.IQService, parentListVm?: BaseListEntityViewModel, itemParameters?: ItemConstructorParameter) => IEntityViewModel, _pageLoadedParameters?: LoadPageSuccessHandlerParameter) {
            // abstract
        }

        /**
         * This method is to create the parameter necessary to create the item. Need to be overriden for specific list if more paramater are necessary.
         * @param itemItem this is the index where the item will placed in the list
         * @param dataSource this is the data source on which the item will be based (data retrieve from the api)
         * @param pageDesc this is the pageDescription just loaded on which the item is belonging to
         * @param pageLoadedParameters THis is the parameter used to load the page
         **/
        protected createItemConstructorParameter(itemIndex: number, dataSource: any, pageDesc: PageDescription, pageLoadedParameters: LoadPageSuccessHandlerParameter, utility: ap.utility.UtilityHelper): ItemConstructorParameter {
            return new ItemConstructorParameter(itemIndex, dataSource, pageDesc, pageLoadedParameters, utility);
        }

        /**
         * This method is called when a page was successfully loaded to build each corresponding item
         * @param args this is the response received from the api
         * @param pageDesc this is the pageDescription just loaded
         * @param index This is the index of the loaded page
         * @param utility Utility service
         * @param q Q Service for promise
         * @param createItemVmHandler this is the constructor to use to create an item
         * @param pageLoadedParameters THis is the parameter used to load the page
         **/
        protected loadPageSuccessHandler(args: ap.services.apiHelper.ApiResponse, pageDesc: PageDescription,
            index: number, utility: ap.utility.UtilityHelper, q: angular.IQService,
            createItemVmHandler?: new (utility: ap.utility.UtilityHelper, q: angular.IQService, parentListVm?: BaseListEntityViewModel, itemParameters?: ItemConstructorParameter) => IEntityViewModel,
            pageLoadedParameters?: LoadPageSuccessHandlerParameter): IEntityViewModel[] {

            let items = args.data;
            let arrayItem = new Array<IEntityViewModel>(pageDesc.idsList.length);
            let len: number = items.length;
            this.beforeLoadPageSuccessHandler(arrayItem, index, pageDesc, createItemVmHandler, pageLoadedParameters);

            // If there is predefined items need to add them to the list
            if (this.options.predefinedItems) {
                for (let j = 0; j < this.options.predefinedItems.length; j++) {
                    for (let i = 0; i < pageDesc.idsList.length; i++) {
                        if (this.options.predefinedItems[j].id === pageDesc.idsList[i]) {
                            arrayItem[i] = this.options.predefinedItems[j].item;
                        }
                    }
                }
            }

            let newItem: IEntityViewModel, entityItem, orderedIdx;
            for (let i: number = 0; i < len; i++) {
                entityItem = items[i];
                if (createItemVmHandler) {
                    let itemConstructorParameter: ItemConstructorParameter = null;
                    if (this.options.itemParameterBuilder !== null) // If there is an option to create the parameter for the item, we will use the one defined in the option
                        itemConstructorParameter = this.options.itemParameterBuilder.createItemParameter((this.options.pageSize * index) + i, entityItem, pageDesc, pageLoadedParameters, utility);
                    else // Else, use the generic one defined in the parent list view model
                        itemConstructorParameter = this.createItemConstructorParameter((this.options.pageSize * index) + i, entityItem, pageDesc, pageLoadedParameters, utility);
                    newItem = new createItemVmHandler(utility, q, this, itemConstructorParameter);
                    newItem.init(entityItem);
                }
                else
                    newItem = entityItem;

                // When use cached, the loaded items can be smaller than the index of the item in the page 
                if (!this._useCacheSystem)
                    orderedIdx = this.getPageItemIndex(entityItem.Id, pageDesc);
                else
                    orderedIdx = i;

                arrayItem[orderedIdx] = newItem;
            }

            this.afterLoadPageSuccessHandler(arrayItem, index, pageDesc, createItemVmHandler, pageLoadedParameters);

            return arrayItem;
        }

        /**
         * This method is override for restoring previously checked entity from listController
         * @param item checked entity
         */
        protected itemIsCheckedChanged(item: IEntityViewModel) {
            super.itemIsCheckedChanged(item);
            this._listController.setCheckedIds(this.entityName, this.listidsChecked);
        }

        /**
         * This method is override for restoring previously selected entity from listController
         * @param item selected entity
         */
        protected _setSelectedViewModel(item: IEntityViewModel) {
            super._setSelectedViewModel(item);
            if (this.sourceItems && this.sourceItems.length > 0) {
                this._listController.setSelectedId(this.entityName, item ? item.originalEntity.Id : null);
            }
        }

        /**
         * To insert the item in to the list at the specified index
         * @param index the position to insert the item
         * @param item  the item will be insert
         **/
        insertItem(index: number, item: EntityViewModel, forceUpdated: boolean = false) {
            if (!item)
                throw new Error("item is mandatory");
            if (this._isIdsLoaded === false)
                throw new Error("Cannot insert the item when isIdsLoaded = false");
            if (index < 0 || index > this.count)
                throw new Error("Invalid index");
            let pageIndex: number;
            if (index === this._count)
                pageIndex = this._pages.length - 1;
            else
                pageIndex = this.getPageIndexOfItemAt(index);

            let page: PageDescription = this._pages[pageIndex];

            if (page.isLoaded) {
                let currentItem: IEntityViewModel = this.sourceItems[index];
                if (currentItem) {
                    // insert the item id into this page
                    let currentItemIndexInPage = page.idsList.indexOf(currentItem.originalEntity.Id);
                    page.idsList.splice(currentItemIndexInPage, 0, item.originalEntity.Id);
                } else {
                    // this is the case when we want to add an item at the last position of the list
                    page.idsList.push(item.originalEntity.Id);
                }
            }
            else {
                // Check that the index is the begin of the not loaded page or not by get the page of the pre index
                pageIndex = this.getPageIndexOfItemAt(index - 1);
                let prePage: PageDescription = this._pages[pageIndex];
                if ((prePage === null || !prePage.isLoaded) && !forceUpdated) {
                    throw new Error("Cannot insert into not loaded page");
                } else if (prePage === null && forceUpdated) {
                    this.loadPage(pageIndex).then(() => {
                        prePage = this._pages[pageIndex];
                        prePage.idsList.push(item.originalEntity.Id);
                    });
                } else {
                    prePage.idsList.push(item.originalEntity.Id);
                }
                // add the item id into pre page
            }
            // add the item into the cache
            if (this._useCacheSystem)
                this._cacheData.add(item.originalEntity.Id, item);
            // insert the item id into the ids list
            this._listIds.splice(index, 0, item.originalEntity.Id);

            this.sourceItems.splice(index, 0, item);
            this._setCount(this._count + 1);
            this._listener.raise("iteminserted", new ItemInsertedEvent(index, item));
        }

        /**
         * Use to get the index of the page contains the item at the index
         * @param itemIndex the index of the item
         **/
        getPageIndexOfItemAt(itemIndex: number): number {
            if (itemIndex < 0 || itemIndex >= this.count) {
                throw new Error("Invalid item index");
            }

            let checkedItemsCount = 0;
            for (let i = 0; i < this._pages.length; i++) {
                let page = this._pages[i];
                checkedItemsCount += page.idsList.length;
                if (itemIndex < checkedItemsCount || (i === this._pages.length - 1 && page.idsList.length < this.options.pageSize)) {
                    return i;
                }
            }
        }

        /**
         * This function will returns the entity corresponding to the specified Id from the list. If a cache system is
         * in use at the moment, this method takes in account cached items as well.
         * @param id the searched id
         * @returns the first found view model or null if no item is found
         */
        public getEntityById(id: string): IEntityViewModel {
            let entity: IEntityViewModel = super.getEntityById(id);
            if (entity !== null) {
                return entity;
            }

            if (this.useCacheSystem && this._cacheData.containsKey(id)) {
                return this._cacheData.getValue(id);
            }

            return null;
        }

        /**
         * dispose method
         **/
        dispose() {
            super.dispose();
            this._cacheData.clear();
        }
        /**
         * This is the constructor to create a GenericPagedListViewModel
         * @param utility This is the utilityHelper object to use to make utils call like translation...
         * @param api This the api helper to make call of the aproplan api
         * @param $q This is the $q object to use to create promise when getting data async from the api
         * @param options This options to know how to create the list and how to get data from the api
         * @param defaultFilter This is the default filter to apply while retrieve the entity collection form the API. Later, it is possible to concatenate another filter to this default one
         **/
        constructor(utility: ap.utility.UtilityHelper, protected _listController: ap.controllers.ListController, protected $q: angular.IQService, options: GenericPagedListOptions, defaultFilter?: string) {
            super(utility, options.entityName, options.pathToLoad, options.sortOrder, defaultFilter);
            this._options = options;
            this._listener.addEventsName(["pageloaded", "idsloaded", "itemcreated", "itemremoved", "propertychanged", "itemchecked"]);
            if (this._options.nbPropertiesToCheck && this._options.nbPropertiesToCheck !== null) {
                this._idValuesDictionary = new Dictionary<string, KeyValue<string, string>[]>();
                this._valuesIdsDictionary = new Array<Dictionary<string, string[]>>(this._options.nbPropertiesToCheck);
                for (let i = 0; i < this._options.nbPropertiesToCheck; i++) {
                    this._valuesIdsDictionary[i] = new Dictionary<string, string[]>();
                }
            }
            this._isDuplicated = false;
            let restoreCheckedIds = this._listController.getCheckedIds(this.entityName);
            if (restoreCheckedIds.length > 0) {
                this.listidsChecked = restoreCheckedIds;
            }
            this._idLevels = new Dictionary<string, number>();
        }

        protected _isIdsLoaded: boolean = false;
        protected _pages: PageDescription[] = [];
        protected _listIds: any[] = [];
        protected _idValuesDictionary: IDictionary<string, KeyValue<string, string>[]> = new Dictionary<string, KeyValue<string, string>[]>();
        protected _valuesIdsDictionary: IDictionary<string, string[]>[] = [];
        protected _idLevels: Dictionary<string, number>;

        private _isDuplicated: boolean;
        private _filter: string = null;
        private _customParams: Array<ap.services.apiHelper.ApiCustomParam> = null;

        protected _isDeferredLoadingMode: boolean = false;
        protected _options: GenericPagedListOptions;
        protected _isRefreshing: boolean = false;
        private _cacheData: Dictionary<string, IEntityViewModel> = new Dictionary<string, IEntityViewModel>();
        private _useCacheSystem: boolean = false;
    }
}