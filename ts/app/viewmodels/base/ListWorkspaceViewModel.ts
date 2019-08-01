module ap.viewmodels {
    /**
     * This class is used to create a view model that will show a virtual list of entities
     **/
    export class ListWorkspaceViewModel implements IDispose, utility.IListener {
        public get searchedText(): string {
            return this._searchedText;
        }

        /**
         * Property to know which kind of text is searched for the chapter hierarchy. When we set the value of this property, 
         * 
         * @param val the new value of the searchedText
         **/
        public set searchedText(val: string) {
            this._searchedText = val;
        }

        /**
         * Property to know if the selector should be enabled or not
         **/
        public get isEnabled(): boolean {
            return this._isEnabled;
        }

        public set isEnabled(val: boolean) {
            this._isEnabled = val;
        }

        /**
        * This is the index of the first item visible on the view
        **/
        public get topIndex(): number {
            return this._topIndex;
        }

        public set topIndex(top: number) {
            this._topIndex = top;
        }

        /**
        * This method is used to update the topIndex for the selected item
        * @param idToScroll is the id of the item need to scroll to 
        **/
        private scrollToItem(idToScroll: string) {
            this._topIndex = this.listVm.getItemIndex(idToScroll);
        }
        /**
         * This is the list view model containing all data corresponding to the searchedText and the current project.
         **/
        public get listVm(): GenericPagedListViewModels {
            return this._listVm;
        }

        /**
         * This function must be overrided if the api call need to be done with custom params. It is necessary to add custom param to the listVm property. Each time this method is called, the custom parameters list is cleared before.
         **/
        protected createCustomParams() {
        }

        protected buildSearchedTextFilter(): string {
            let filter: string = undefined;
            let props = this.getSearchedTextProperties();
            let filterProps = [];
            if (props && props.length > 0 && !StringHelper.isNullOrEmpty(this._searchedText)) {
                let query = this._searchedText;
                for (let i = 0; i < props.length; i++) {
                    filterProps.push(Filter.startsWith(props[i], "\"" + query + "\""));
                }
                if (filterProps.length > 0)
                    filter = "Filter.Or(" + filterProps.join(",") + ")";
            }
            return filter;
        }

        /**
         * This function must be overrided to build the filter. It is necessary to take account of the searchedText property.
         **/
        protected buildCustomFilter(): angular.IPromise<string> {
            let deferred: ng.IDeferred<string> = this.$q.defer();
            deferred.resolve(undefined);
            return deferred.promise;
        }
        /**
         * This function must will concatenate the filter corresponding to the searched text and custom one build by 'buidCustomFilter'.
         **/
        private buildFilter(): angular.IPromise<string> {
            let deferred: ng.IDeferred<string> = this.$q.defer();
            let searchFilter = this.buildSearchedTextFilter();
            this.buildCustomFilter().then((customFilter: string) => {
                let filter = undefined;
                if (searchFilter && customFilter)
                    filter = "Filter.And(" + searchFilter + "," + customFilter + ")";
                else if (searchFilter)
                    filter = searchFilter;
                else if (customFilter)
                    filter = customFilter;
                deferred.resolve(filter);
            });
            return deferred.promise;
        }

        /**
         * This method must be overrided to return the list of properties on which the searched text must be applied. Then, when the searchedText, the filter will be build on these properties. 
         **/
        protected getSearchedTextProperties(): string[] {
            return [];
        }

        /**
         * This method is to load the data, first all the ids corresponding to the searched text and finally the first page;
         **/
        public load(idToSelect?: string): angular.IPromise<GenericPagedListViewModels> {
            let deferred: ng.IDeferred<GenericPagedListViewModels> = this.$q.defer();
            this.buildParameters().then((finished: boolean) => {
                if (finished) {
                    this._listVm.loadIds(this.listVm.filter, this._customParam).then(() => {
                        let loadPageIndex = 0;
                        if (idToSelect && !StringHelper.isNullOrEmpty(idToSelect)) {
                            loadPageIndex = this.listVm.getPageIndex(idToSelect);
                            if (loadPageIndex < 0) loadPageIndex = 0;
                        }
                        this.listVm.loadPage(loadPageIndex).then(() => {
                            deferred.resolve(this.listVm);
                            if (idToSelect && !StringHelper.isNullOrEmpty(idToSelect)) {
                                // select the item and scroll to this item
                                this.listVm.selectEntity(idToSelect);
                                this.scrollToItem(idToSelect);
                            }
                        }, (err) => {
                            deferred.reject(err);
                        });
                    });
                }
            });

            return deferred.promise;
        }

        /**
        * This method is used to select the item from the list and retrun the promise of the selected viewmodel
        * @param id is the id of the item need to select
        * @param loadData to defined need to load the page containing the item if it have not loaded
        **/
        selectItem(id: string, loadData: boolean = true): angular.IPromise<IEntityViewModel> {
            let deferred: ng.IDeferred<IEntityViewModel>   = this.$q.defer();
            let loadedIds = this.listVm.getLoadedItemsIds();
            // When the item was loaded, then select this item
            if (loadedIds && loadedIds !== null && loadedIds.indexOf(id) >= 0) {
                this.listVm.selectEntity(id);
                deferred.resolve(this.listVm.selectedViewModel);
            }
            // When the item was not loaded and invoke load data
            else if (loadData) {
                // When the ids of the list was loaded, find the correct page and then load this page
                if (this.listVm.isIdsLoaded) {
                    this.selectItemAfterIdsLoaded(id, deferred);
                }
                else { // When the ids of the list was not loaded, then load the ids first and get the correct page
                    this.buildParameters().then((finished: boolean) => {
                        if (finished) {
                            this._listVm.loadIds(this.listVm.filter).then(() => {
                                this.selectItemAfterIdsLoaded(id, deferred);
                            });
                        }
                    });
                }
            }
            else // When the item was not loaded and not invoke load data
                deferred.reject();

            return deferred.promise;
        }

        /**
        * This method is used to get the correct page of and load this page then select the item
        * @param id is the item id need to select
        * @param deferred is the deferred of the promise from caller method
        **/
        private selectItemAfterIdsLoaded(id: string, deferred: angular.IDeferred<IEntityViewModel>) {
            let pageIndex = this.listVm.getPageIndex(id);
            if (pageIndex >= 0) {
                this.listVm.loadPage(pageIndex).then((completedArgs: ap.services.apiHelper.ApiResponse) => {
                    this.listVm.selectEntity(id);
                    deferred.resolve(this.listVm.selectedViewModel);
                }, function (reason) {
                    deferred.reject(reason);
                });
            }
            else
                deferred.resolve(null);
        }

        // Public Method 
        on(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.on(eventName, callback, caller);
        }
        off(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.off(eventName, callback, caller);
        }

        /**
        * This method is used to buid the params for the list before load the data
        * Will resolve the promise when all params are finished
        **/
        private buildParameters(): angular.IPromise<boolean> {
            let deferred: ng.IDeferred<boolean> = this.$q.defer();
            this._listVm.clearCustomParams();
            this.createCustomParams();
            this.buildFilter().then((filter: string) => {
                // set the filter of genericPagedListVm
                if (this.listVm) {
                    // the list may be dispose just before "resolveFilter" resolves
                    this.listVm.filter = filter;
                    deferred.resolve(true);
                } else {
                    deferred.resolve(false);
                }
            });
            return deferred.promise;
        }

        public dispose() {
            if (this._listVm) {
                this._listVm.dispose();
                this._listVm = null;
            }

            if (this._listener) {
                this._listener.clear();
                this._listener = null;
            }
        }

        /**
         * Builds a ListWorkspaceViewModel instance
         * @constructor
         * @param $utility Utility class
         * @param $controllersManager Contains the controllers
         * @param $q useful for async calls
         * @param options options to build the list
         * @param defaultFilter default filter to apply when loading data
         */
        constructor(protected $utility: ap.utility.UtilityHelper, protected $controllersManager: ap.controllers.ControllersManager, protected $q: angular.IQService, options: GenericPagedListOptions, defaultFilter?: string) {

            this._listVm = new ap.viewmodels.GenericPagedListViewModels($utility, $controllersManager.listController, $q, options, defaultFilter);

            // automatically initialize the filter.
            this.buildParameters();

            this._listVm.isDeferredLoadingMode = true;
            this._automaticLoad = true;

            let _self = this;

            this._eventHelper = this.$utility.EventTool;
            this._listener = this._eventHelper.implementsListener(["ischeckedchanged"]);
        }

        private _searchedText: string;
        protected _isEnabled: boolean;
        protected _listVm: GenericPagedListViewModels;
        protected _automaticLoad: boolean;
        protected _listener: ap.utility.IListenerBuilder;
        protected _eventHelper: ap.utility.EventHelper;
        private _topIndex: number = 0;
        protected _customParam: any;
    }
}