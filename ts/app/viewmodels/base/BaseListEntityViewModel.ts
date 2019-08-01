module ap.viewmodels {
    /**
    * Argument for iteminserted event
    **/
    export class ItemInsertedEvent {
        public index: number;
        public item: IEntityViewModel;
        constructor(index: number, item: IEntityViewModel) {
            this.index = index;
            this.item = item;
        }
    }

    /**
    * Argument when the event itemremoved is raised
    **/
    export class ItemRemovedEvent {
        public index: number;
        public item: IEntityViewModel;
        constructor(index: number, item: IEntityViewModel) {
            this.index = index;
            this.item = item;
        }
    }

    export abstract class BaseListEntityViewModel implements utility.IListener, IVirtualInfiniteRepeat, IDispose {
        // Properties
        protected _listener: ap.utility.IListenerBuilder;
        protected _eventHelper: ap.utility.EventHelper;
        protected _isLoaded: boolean = false;
        protected _isLoading: boolean = false;
        protected _count: number = null;
        protected _selectedViewModel: IEntityViewModel = null;
        protected _lastCheckedItem: IEntityViewModel = null;
        protected _selectedAll: boolean = false;
        protected _isIndeterminate: boolean = false;
        public sourceItems: IEntityViewModel[] = [];
        /**
        * To known which points are checked in the list
        **/
        public listidsChecked: string[] = [];

        public get isLoaded(): boolean {
            return this._isLoaded;
        }

        /**
       * Getter of the public selectedAll property
       */
        public get isIndeterminate(): boolean {
            return this._isIndeterminate;
        }

        /**
        * Set of the public selectedAll property
        */
        public set isIndeterminate(isIndeterminate: boolean) {
            if (this._isIndeterminate !== isIndeterminate) {
                this._isIndeterminate = isIndeterminate;
            }
        }

        /**
       * Getter of the public selectedAll property
       */
        public get selectedAll(): boolean {
            return this._selectedAll;
        }

        /**
        * Set of the public selectedAll property
        */
        public set selectedAll(selectedAll: boolean) {
            if (this._selectedAll !== selectedAll) {
                this._selectedAll = selectedAll;
                this._isIndeterminate = false;
                this.afterSelectedAllChanged();
                this._listener.raise("selectedallchanged");
            }
        }

        /**
         * Protected method called after change selectedAll property and use for fill or clear array of checked ids
         */
        protected afterSelectedAllChanged() {
            this.sourceItems.forEach((item) => {
                if (!!item) {
                    item.defaultChecked = this.selectedAll && item.canChecked;
                }
                this.calculateCheckedIds(item);
            });
            if (this.selectedAll === false) {
                this.listidsChecked = [];
            }
        }

        /**
         * Method use for add or remove id of checked item
         * @param item
         */
        protected calculateCheckedIds(item: IEntityViewModel) {
            if (item.isChecked) {
                if (this.listidsChecked.indexOf(item.originalEntity.Id) < 0) {
                    this.listidsChecked.push(item.originalEntity.Id);
                }
            } else {
                if (this.listidsChecked.indexOf(item.originalEntity.Id) >= 0) {
                    this.listidsChecked.splice(this.listidsChecked.indexOf(item.originalEntity.Id), 1);
                }
            }
        }

        /**
         * This method is used to check the need to set selectedAll and isIndeterminate after any item is checked/unchecked
         */
        protected checkSelectedAll() {
            let needToCheckedAll = true;
            for (let i = 0; i <= this.sourceItems.length - 1; i++) {
                if (this.sourceItems[i] !== undefined && this.sourceItems[i].canChecked && !this.sourceItems[i].isChecked) {
                    needToCheckedAll = false;
                    break;
                }
            }
            this._selectedAll = needToCheckedAll;
            this._isIndeterminate = !this.selectedAll && this.listidsChecked.length > 0;
        }

        /**
         * This property is to know if data are being loaded from the api or not (ids or item's data)
         **/
        public get isLoading(): boolean {
            return this._isLoading;
        }

        protected changeIsLoading(val: boolean) {
            if (this._isLoading !== val) {
                this._isLoading = val;
                this._listener.raise("isLoadingChanged", this._isLoading);
            }
        }

        public get selectedViewModel(): IEntityViewModel {
            return this._selectedViewModel;
        }

        public set selectedViewModel(value: IEntityViewModel) {
            if (value && value.originalEntity) {
                this.selectEntity(value.originalEntity.Id);
            } else {
                this.selectEntity(null);
            }
        }

        /**
         * This property is to know how many data the list will contains
         **/
        public get count(): number {
            return this._count;
        }

        /**
        * Method use to know if the item has been changed
        **/
        public getChangedItems(): IEntityViewModel[] {
            return this.sourceItems.filter((entityViewModel: ap.viewmodels.EntityViewModel) => { return entityViewModel.hasChanged; });
        }

        /**
         * This function will returns the entity corresponding to a specific Id that the list contains
         * @param id this is the searched id
         **/
        public getEntityById(id: string): IEntityViewModel {
            if (!id || !this.sourceItems)
                return null;

            for (let i: number = 0; i < this.sourceItems.length; ++i) {
                if (!!this.sourceItems[i] && !!this.sourceItems[i].originalEntity && this.sourceItems[i].originalEntity.Id === id)
                    return this.sourceItems[i];
            }

            return null;
        }

        /**
         * Protected method called before an item is updated in 'updateItem' method
         * @return a object which can then be used in 'afterUpdateItem' method
         */
        protected beforeUpdateItem(updatedItem: ap.models.Entity, currentEntityViewModel: IEntityViewModel): any {
        }

        /**
         * Protected method called after an item has been updated in 'updateItem' method
         * @param param The parameter created by 'beforeUpdateItem'
         */
        protected afterUpdateItem(param: any, currentEntityViewModel: IEntityViewModel) {
        }

        /**
        * This method will update the list values with the entityUpdated in parameter. When data are updated, the event itemsUpdated is raised with all items updated in arguments
        * @param entityUpdated: This is the entity with new values
        **/
        public updateItem(entityUpdated: ap.models.Entity) {
            if (entityUpdated === undefined || entityUpdated === null) {
                throw new Error("updateitem_item_mandatory");
            }
            let itemsUpdated: IEntityViewModel[] = [];
            for (let i = 0; i < this.count; i++) {
                let item: IEntityViewModel = this.sourceItems[i];
                if (item && item.originalEntity && item.originalEntity !== null && item.originalEntity.Id === entityUpdated.Id) {

                    let param: any = this.beforeUpdateItem(entityUpdated, item);

                    // Update the saved note into the viewmodel
                    item.init(entityUpdated);
                    itemsUpdated.push(item);

                    this.afterUpdateItem(param, item);
                }
            }
            if (itemsUpdated.length > 0)
                this._listener.raise("itemsUpdated", itemsUpdated); // we make a raise to prevent that values has changed for the selected item
        }

        // Public Method 
        on(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.on(eventName, callback, caller);
        }
        off(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.off(eventName, callback, caller);
        }

        /**
         * Clear all the data (reset) in case we need a list become empty. Need to consider is not loading and all loaded to avoid reload unnecessary         
         **/
        clear(): void {
            this.onLoadItems(null);
            this._isLoaded = true;
            this.changeIsLoading(false);
        }

        /**
         * This function will set a specific entity of the list like selected if there is an entity corresponding to the id param in the list
         * @param id the id of the entity to set selected
         **/
        selectEntity(id: string) {
            if (id && this.sourceItems) {
                let length = this.sourceItems.length;
                for (let i = 0; i < length; i++) {
                    // check that sourceItems[i] exists because it can be a page not loaded yet and therefore, there is no originalEntity
                    if (this.sourceItems && this.sourceItems[i] && this.sourceItems[i].originalEntity && this.sourceItems[i].originalEntity.Id && this.sourceItems[i].originalEntity.Id.toLowerCase() === id.toLowerCase()) {
                        this._setSelectedViewModel(this.sourceItems[i]);
                        break;
                    }
                }
            } else {
                this._setSelectedViewModel(null);
            }
        }

        /**
         * Populate the sourceItems property with the items.  Also select the first item depending on the isSelectFirst parameter
         * @param items IEntityViewModel[] The items put in the sourceItems property
         * @param isSelectFirst boolean Select or not the first item
         */
        onLoadItems(items: IEntityViewModel[], isSelectFirst?: boolean): void {
            if (this.sourceItems && this._isLoaded !== undefined && this._selectedViewModel !== undefined) {

                // dispose the items of the list
                this._clearItems();

                this.sourceItems = items === null ? [] : items;

                if (this.sourceItems && this.sourceItems !== null && this.sourceItems.length > 0) {
                    for (let i = 0; i < this.sourceItems.length; i++) {
                        let item: IEntityViewModel = this.sourceItems[i];
                        if (item && item instanceof ap.viewmodels.EntityViewModel)
                            item.on("propertychanged", this.itemPropertyChanged, this);
                    }
                }

                let oldSelected = this._selectedViewModel;
                if (isSelectFirst && this.sourceItems.length > 0) {
                    this._setSelectedViewModel(this.sourceItems[0]);
                }
                else {
                    if (!oldSelected)
                        this._setSelectedViewModel(null);
                    else {
                        this._setSelectedViewModel(oldSelected);
                    }
                }

                this.changeIsLoading(false);
                this._setLoaded();

                if (items && items !== null) {
                    let cpt = items.length;
                    if (cpt !== this._count)
                        this._setCount(cpt);
                }
                else {
                    this._setSelectedViewModel(null);
                    this._setCount(null);
                }
            }
        }

        /**
         * Handler for property changes in the entity view models
         * @param args event parameters
         */
        protected itemPropertyChanged(args: ap.viewmodels.base.PropertyChangedEventArgs) {
            switch (args.propertyName) {
                case "isChecked":
                    this.itemIsCheckedChanged(<IEntityViewModel>args.caller);
                    break;
            }
        }

        /**
         * Add or remove the id of the checked/unchecked item to/from the ids of checked items
        **/
        protected itemIsCheckedChanged(item: IEntityViewModel) {
            this.calculateCheckedIds(item);
            this.checkSelectedAll();
            this._listener.raise("isCheckedChanged", item);
        }

        /**
        * This method returns the item at the specified index
        * @param index number The index of the element to get
        * @return The element at the specified index
        */
        getItemAtIndex(index: number): IEntityViewModel {
            if (index >= this.sourceItems.length) {
                return null;
            }
            return this.sourceItems[index];
        }

        /**
        * This method return the list of loaded entities ids
        * @return string[] The array containing the ids of the loaded entities
        */
        getLoadedItemsIds(): string[] {
            let ids: string[] = [];
            let i: number, len: number = this.sourceItems.length;

            for (i = 0; i < len; i++) {
                if (this.sourceItems[i] && this.sourceItems[i].originalEntity) {
                    ids.push(this.sourceItems[i].originalEntity.Id);
                }
            }

            return ids;
        }

        /**
        * This method return the list of loaded ViewModels
        * @return IEntityViewModel[] The array containing the loaded entities
        */
        getLoadedItems(): IEntityViewModel[] {
            let items: IEntityViewModel[] = [];
            let i: number, len: number = this.sourceItems.length;

            for (i = 0; i < len; i++) {
                if (this.sourceItems[i] && this.sourceItems[i].originalEntity) {
                    items.push(this.sourceItems[i]);
                }
            }

            return items;
        }

        /**
         * This method will returns all loaded items where isChecked equals true
         **/
        getCheckedItems(): IEntityViewModel[] {
            let checkedItems: IEntityViewModel[] = new Array<IEntityViewModel>();
            let i: number, length: number = this.getLength();

            for (i = 0; i < length; i++) {
                if (this.sourceItems[i] && this.sourceItems[i].isChecked) {
                    checkedItems.push(this.sourceItems[i]);
                }
            }

            return checkedItems;
        }

        /**
        * Method used to know all th unchecked items loaded
        **/
        getUncheckedLoadedItems(): IEntityViewModel[] {
            return this.sourceItems.filter((item: IEntityViewModel) => {
                return item.isChecked === false;
            });
        }

        // Required for infinitescroll
        // For infinite scroll behavior, we always return a slightly higher
        // number than the previously loaded items.
        getLength(): number {
            return this.count === null ? 0 : this.count;
        }

        dispose() {
            this._clearItems();
            this._listener.clear();
        }

        // -----------------------------
        // Protected and private methods
        // -----------------------------

        protected _setLoaded() {
            let oldValue = this._isLoaded;
            this._isLoaded = this.sourceItems !== undefined && this.sourceItems !== null;

            if (oldValue !== this._isLoaded)
                this._listener.raise("isLoadedChanged", this._isLoaded);
        }

        protected _setSelectedViewModel(val: IEntityViewModel) {
            if (val && this._selectedViewModel && val.originalEntity.Id === this._selectedViewModel.originalEntity.Id)
                return; // do nothing if the current selected item equals the new one

            if (this._selectedViewModel)
                this._selectedViewModel.isSelected = false;
            this._selectedViewModel = val;
            if (this._selectedViewModel)
                this._selectedViewModel.isSelected = true;
            this._listener.raise("selectedItemChanged", val);
        }

        protected _setCount(val) {
            this._count = val;
            this._listener.raise("countChanged", val);
        }

        protected _clearItems() {
            if (this.sourceItems) {
                let i: number;
                let length: number = this.sourceItems.length;

                for (i = 0; i < this.sourceItems.length; i++) {
                    let item: IEntityViewModel = this.sourceItems[i];
                    if (item) {
                        item.dispose();
                    }
                }
                // empty the array
                this.sourceItems.splice(0);
                this._count = 0;
            }
        }

        /**
         * This method unchecks all items checked of the list
         **/
        public uncheckAll() {
            let checkedItems = this.getCheckedItems();

            for (let i = 0; i < checkedItems.length; i++) {
                checkedItems[i].isChecked = false;
            }
        }

        /**
        * To insert the item in to the list at the specified index
        * @param index the the position to insert the item
        * @param item  the item will be insert
        **/
        insertItem(index: number, item: EntityViewModel) {
            if (!item)
                throw new Error("item is mandatory");
            if (this._isLoaded === false)
                throw new Error("Cannot insert the item when isLoaded = false");
            this.sourceItems.splice(index, 0, item);
            this._setCount(this._count + 1);
            this._listener.raise("iteminserted", new ItemInsertedEvent(index, item));
        }

        /**
         * This method checks several entities between the lastCheckedItem and given entity if the Shift key is pressed
         * @param entity a list entity that was checked or unchecked
         * @param event an information about an event which caused changes to the given entity
         */
        checkHandler(entity: EntityViewModel, event: JQueryEventObject) {
            let state: boolean = !entity.isChecked;
            if (event.shiftKey === true && !!this._lastCheckedItem) {
                let beginIndex = Math.min(this._lastCheckedItem.index, entity.index);
                let endIndex = Math.max(entity.index, this._lastCheckedItem.index);
                for (let i = 0; i < this.sourceItems.length; i++) {
                    let currentItem = this.sourceItems[i];
                    if (currentItem.index >= beginIndex && currentItem.index <= endIndex && currentItem !== entity) {
                        currentItem.isChecked = state;
                    } else if (currentItem.index > endIndex) {
                        break;
                    }
                }
                this._lastCheckedItem = null;
            } else {
                this._lastCheckedItem = entity;
            }
        }

        constructor(protected $utility: utility.UtilityHelper) {
            this._eventHelper = this.$utility.EventTool;
            this._listener = this._eventHelper.implementsListener(["isLoadedChanged", "selectedItemChanged", "countChanged", "itemsUpdated", "isCheckedChanged", "iteminserted", "hasChanged", "selectedallchanged", "isLoadingChanged"]);
        }
    }
}