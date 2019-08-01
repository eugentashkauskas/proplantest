module ap.viewmodels {

    export class MultiSelectorListViewModel extends GenericPagedListViewModels {

        /**
        * Getter/setter for _searchText property
        **/
        public get searchText(): string {
            return this._searchText;
        }

        public set searchText(val: string) {
            if (val !== this._searchText) {
                this._searchText = val;
                this.load(true);
            }
        }

        /**
        * Return checked values text
        **/
        public get checkedValuesText() {
            return this._checkedValuesText;
        }

        /**
        * Return checked ids array
        **/
        public get checkedIds() {
            return this._checkedIds;
        }

        /**
        * Set checked ids array. Load the corresponding entities to build checkedValuesText
        **/
        public set checkedIds(ids: string[]) {
            if (!this.isIdsLoaded)
                throw new Error("Cannot call checkedIds before to load ids");
            this._checkedIds = !ids ? [] : ids;
            this._checkedEntities.clear();
            let options = new ap.services.apiHelper.ApiOption();
            options.onlyPathToLoadData = this.options.onlyPathToLoadData;

            // check which entities are not loaded to only load these ones and take the others from the cache
            let idsToLoad: string[] = [];
            let alreadyLoadedEntities: ap.models.Entity[] = [];
            this.checkedIds.forEach((id: string) => {
                if (!this._loadedEntities.containsKey(id)) {
                    idsToLoad.push(id);
                } else {
                    alreadyLoadedEntities.push(this._loadedEntities.getValue(id));
                }
            });

            // When checked ids are specified, we need to load only the item corresponding to checked ids
            if (this.ids && this.ids.length > 0) {
                if (idsToLoad && idsToLoad.length > 0) {
                    this._listController.getEntityList(this._entityName, idsToLoad, this._pathToLoad, options).then((args: ap.services.apiHelper.ApiResponse) => {
                        if (args.data) {
                            args.data.forEach((item: ap.models.Entity) => {
                                if (!this._loadedEntities.containsKey(item.Id)) {
                                    // add the element to the loaded dictionary
                                    this._loadedEntities.add(item.Id, item);
                                }
                            });
                        }
                        this.initCheckedEntities([...alreadyLoadedEntities, ...args.data]); // concat the already loaded entities with the loaded ones from the API
                        this.buildCheckedValuesText();
                    });
                } else {
                    this.initCheckedEntities(alreadyLoadedEntities);
                    this.buildCheckedValuesText();
                }
            }
            else {
                this._checkedIds = [];
                this._checkedEntities.clear();
                this.buildCheckedValuesText();
            }

            // check the already loaded entities
            this.checkViewModels();
        }

        /**
        * This method is used to load data to the list
        **/
        public load(force: boolean = false): angular.IPromise<boolean> {
            let defer: ng.IDeferred<boolean> = this.$q.defer();
            if (!this.isIdsLoaded || force) {
                let searchFilter = this.buildSearchedTextFilter();
                this.loadIds(searchFilter).then(() => {
                    this.loadNextPage().then(() => {
                        defer.resolve(true);
                    });
                });
            } else {
                defer.resolve(false);
            }
            return defer.promise;
        }

        /**
         * This method is to initialized the view model with the checked entities.
         **/
        private initCheckedEntities(entities: ap.models.Entity[]) {
            let entity: ap.models.Entity;
            if (entities.length > 0) {
                for (let i = 0; i < entities.length; i++) {
                    entity = entities[i];
                    if (this._checkedEntities.containsKey(entity.Id)) {
                        this._checkedEntities.remove(entity.Id);
                    }
                    this._checkedEntities.add(entity.Id, entity);
                }
            }
        }

        /*
        * This private method checks/unchecked the loaded Vms if their ids are on the checkedIds dictionary or not
        */
        private checkViewModels() {
            this.sourceItems.forEach((item: IEntityViewModel) => {
                if (!!item) {
                    // if the item is loaded and it's entity id is in the checked dictionary -> check it
                    if (this._checkedIds.indexOf(item.originalEntity.Id) >= 0) {
                        if (!item.isChecked)
                            item.isChecked = true;
                    } else {
                        if (item.isChecked)
                            item.isChecked = false;
                    }
                }
            });
        }

        /**
         * When an item is checked/unchecked, we need to update data, checkedIds values and the text to display.
         **/
        protected itemIsCheckedChanged(item: IEntityViewModel) {
            let idx = this._checkedIds.indexOf(item.originalEntity.Id);
            if (item.isChecked && idx < 0) { // the item is check but not in the checkIds list -> need to add it
                this._checkedIds.push(item.originalEntity.Id);
                this._checkedEntities.add(item.originalEntity.Id, item.originalEntity);
            }
            else if (!item.isChecked && idx >= 0) {
                this._checkedIds.splice(idx, 1);
                this._checkedEntities.remove(item.originalEntity.Id);
            }
            this.buildCheckedValuesText();
            super.itemIsCheckedChanged(item);
        }

        /**
        * Build checked values text and pass it into variable
        **/
        protected buildCheckedValuesText() {
            this._checkedValuesText = "";
            let entities = this._checkedEntities.values();
            if (entities.length > 0) {
                let textArray = [];
                for (let i = 0; i < entities.length; i++) {
                    textArray.push(this.getEntityText(entities[i]));
                }
                this._checkedValuesText = textArray.join(", ");
            }
        }

        protected _onPageLoaded(pageDesc: PageDescription, itemList: IEntityViewModel[]): void {
            super._onPageLoaded(pageDesc, itemList);

            itemList.forEach((item: IEntityViewModel) => {
                if (!this._loadedEntities.containsKey(item.originalEntity.Id)) {
                    // add the element to the loaded dictionary
                    this._loadedEntities.add(item.originalEntity.Id, item.originalEntity);
                }

                // when the item is loaded, checks it if it's in the checkedids
                if (this._checkedIds.indexOf(item.originalEntity.Id) >= 0) {
                    item.isChecked = true;
                }
            });
        }

        /**
         * This method is used to know the text to use for each checked entities.
         **/
        protected getEntityText(entity: ap.models.Entity): string {
            return !entity ? "" : entity.Id.toString();
        }

        protected buildSearchedTextFilter(): string {
            let filter: string = undefined;
            let props = this._propsSearchedText;
            let filterProps = [];
            if (props && props.length > 0 && !StringHelper.isNullOrEmpty(this._searchText)) {
                let query = this._searchText;
                for (let i = 0; i < props.length; i++) {
                    filterProps.push(Filter.contains(props[i], "\"" + query + "\""));
                }
                if (filterProps.length > 1) {
                    filter = "Filter.Or(" + filterProps.join(",") + ")";
                } else if (filterProps.length === 1) {
                    filter = filterProps[0];
                }
            }
            return filter;
        }

        public getItemText(item: IEntityViewModel): string {
            if (item) {
                return this.getEntityText(item.originalEntity);
            }
            return "";
        }

        constructor(private utility: ap.utility.UtilityHelper, protected _listController: ap.controllers.ListController, protected $q: angular.IQService, options: GenericPagedListOptions, public filter: string = undefined) {
            super(utility, _listController, $q, options, filter);
            this.isDeferredLoadingMode = true;
        }

        protected _checkedValuesText: string = "";
        protected _checkedEntities: Dictionary<string, ap.models.Entity> = new Dictionary<string, ap.models.Entity>(); // dictionary used to store the checked entities with their id as key
        protected _propsSearchedText: string[];
        private _searchText: string = "";
        private _checkedIds: string[] = []; // array containing the list of checked ids
        private _loadedEntities: Dictionary<string, ap.models.Entity> = new Dictionary<string, ap.models.Entity>(); // dictionary used to store the loaded entities
    }
}