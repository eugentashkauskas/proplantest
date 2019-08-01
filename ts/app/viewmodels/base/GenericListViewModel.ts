module ap.viewmodels {
    export class GenericListViewModel extends ListEntityViewModel {
        private _displayLoading: boolean = true;
        private _createItemVmHandler: new (utility: ap.utility.UtilityHelper, parentListVm?: BaseListEntityViewModel, index?: number) => IEntityViewModel;

        public get displayLoading(): boolean {
            return this._displayLoading;
        }
        // Methods
        load(filter: string): angular.IPromise<ap.services.apiHelper.ApiResponse> {
            let fullFilter;
            if (this._defaultFilter && this._defaultFilter !== null && filter && filter !== null)
                fullFilter = "Filter.And(" + this._defaultFilter + "," + filter + ")";
            else if (this._defaultFilter && this._defaultFilter !== null)
                fullFilter = this._defaultFilter;
            else if (filter && filter !== null)
                fullFilter = filter;
            this._setCount(null);
            let options = new ap.services.apiHelper.ApiOption();
            options.async = this._displayLoading === false;

            let self = this;
            this._isLoading = true;

            return this._api.getEntityList(this._entityName, fullFilter, this._pathToLoad, this._sortOrder, null,  options)
                .then(function (completedArgs: ap.services.apiHelper.ApiResponse) {
                    let arrayItem: IEntityViewModel[] = [];
                    let items: models.Entity[] = <models.Entity[]>completedArgs.data;
                    let len: number = items.length;
                    let itemVm;
                    for (let i: number = 0; i < len; i++) {

                        if (self._createItemVmHandler) {
                            itemVm = new self._createItemVmHandler(self.$utility, self, i);
                            itemVm.init(items[i]);
                            arrayItem.push(itemVm);
                        }
                        else {
                            itemVm = new EntityItemViewModel(self.$utility, self.$q, self, new ItemConstructorParameter(i, items[i], null, null, null));
                            itemVm.init(items[i]);
                            arrayItem.push(itemVm);
                        }
                    }
                    self.onLoadItems(arrayItem);
                    return completedArgs;

                }, function (reason: any) {
                    self._isLoading = false;
                    return self.$q.reject(reason);
                });
        }

        constructor(utility: ap.utility.UtilityHelper, protected _api: ap.services.apiHelper.Api, protected $q: angular.IQService, entityName: string,
            itemVmHandler?: new (utility: ap.utility.UtilityHelper, parentListVm?: BaseListEntityViewModel, index?: number) => IEntityViewModel, pathToLoad?: string,
            sortOrder?: string, defaultFilter?: string, displayLoading: boolean = true) {

            super(utility, entityName, pathToLoad, sortOrder, defaultFilter);
            this._displayLoading = displayLoading === undefined || displayLoading === null ? true : displayLoading;
            this._createItemVmHandler = itemVmHandler;

            this.onLoadItems(null);
        }
    }
}