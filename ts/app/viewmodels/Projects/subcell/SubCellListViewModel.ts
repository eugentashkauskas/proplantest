module ap.viewmodels.projects {

    export class SubCellListViewModel extends GenericPagedListViewModels {

        /*
        * Public setter to the parentCellVm property
        * This property is to know to which parentCell are linked the subcells
        */
        public set parentCellVm(newValue: ap.viewmodels.projects.ParentCellViewModel) {
            if (this._parentCellVm !== newValue) {
                if (this._parentCellVm) {
                    this._parentCellVm.off("parentcellupdated", this.parentCellUpdated, this);
                }

                this._parentCellVm = newValue;
                if (this._parentCellVm) {
                    this._parentCellVm.on("parentcellupdated", this.parentCellUpdated, this);
                }
                if (this._parentCellVm && !this._parentCellVm.isMarkedToDelete) {
                    this._addAction.isEnabled = true;
                    this._addAction.isVisible = true;
                }
            }
        }


        /**
        * Used to set the validity from parent controller 
        **/
        public setValidityFromChild(value: boolean) {
            this._isValid = value;
            this._addAction.isEnabled = this._isValid;
        }

        /**
        * This method use for get isValid
        **/
        public get isValid(): boolean {
            return this._isValid;
        }

        /*
        * Setter to the isValid property
        */
        private setIsValid(isValid: boolean) {
            if (this._isValid !== isValid) {
                this._isValid = isValid;
                if (this._parentCellVm && !this._parentCellVm.isMarkedToDelete) {
                    this._addAction.isEnabled = isValid;
                }
                this._listener.raise("propertychanged", new base.PropertyChangedEventArgs("isValid", this._isValid, this));
            }
        }

        /*
        * This private methods checks if there are invalid items
        */
        private checkIsValid() {
            this._listener.raise("checkSubCellsOk");
            this.setIsValid(this._invalidItems.length === 0 && !this.isDuplicated);
        }

        /**
        * This method use for set isEnabled action in items
        **/
        public updateItemsActionsState(enable: boolean) {
            this.sourceItems.forEach((item: ap.viewmodels.projects.SubCellViewModel) => {
                if (enable) {
                    item.enableActions();
                } else {
                    if (this._invalidItems.indexOf(item) < 0) {
                        item.disableActions();
                    }
                }
            });
        }

        public get checkedItemsDict(): Dictionary<string, ap.models.projects.SubCell[]> {
            return this._checkedItemsDict;
        }

        /*
        * Handler method called when the property of an item is changed
        */
        private subCellPropertyChanged(args: base.PropertyChangedEventArgs) {
            if (args.propertyName === "code") {
                this.checkForDuplicatedItems(<SubCellViewModel>args.caller);
            }
            else if (args.propertyName === "isChecked") {
                this.requestChecked(<SubCellViewModel>args.caller);
            }
            else if (args.propertyName === "isValid") {
                if (!(<SubCellViewModel>args.caller).isValid()) {
                    this._invalidItems.push(args.caller);
                } else if (this._invalidItems.indexOf(args.caller) > -1) {
                    this._invalidItems.splice(this._invalidItems.indexOf(args.caller), 1);
                }
            }
            else if (args.propertyName === "delete") {
                if (!(<SubCellViewModel>args.caller).isValid() && (<SubCellViewModel>args.caller).isMarkedToDelete) {
                    if (this._invalidItems.indexOf(args.caller) > -1) {
                        this._invalidItems.splice(this._invalidItems.indexOf(args.caller), 1);
                    }
                }
                (<SubCellViewModel>args.caller).isDuplicated = false;

                let keys = this.valuesIdsDictionary[0].keys();
                for (let i = 0; i < keys.length; i++) {
                    let v = this.valuesIdsDictionary[0].getValue(keys[i]);
                    let index = v.indexOf((<SubCellViewModel>args.caller).originalEntity.Id);
                    if (index !== -1) {
                        v.splice(index, 1);
                        this.valuesIdsDictionary[0].remove(keys[i]);
                        if (v.length !== 0) {
                            this.valuesIdsDictionary[0].add(keys[i], v);
                        }
                    }
                    this.idValuesDictionary.remove((<SubCellViewModel>args.caller).originalEntity.Id);
                }

                let duplicatedItems = this.getDuplicatedItems();
                duplicatedItems = duplicatedItems.filter((dup: SubCellViewModel) => {
                    return dup.code === (<SubCellViewModel>args.caller).code;
                });
                if (duplicatedItems.length === 1) {
                    duplicatedItems[0].isDuplicated = false;
                    this.checkIsDuplicated();
                    if (!StringHelper.isNullOrEmpty((<SubCellViewModel>duplicatedItems[0]).code)) {
                        this._invalidItems = [];
                    }
                }
            }
            else if (args.propertyName === "undelete") {
                if (!(<SubCellViewModel>args.caller).isValid() && !(<SubCellViewModel>args.caller).isMarkedToDelete) {
                    this._invalidItems.push(args.caller);
                }

                if (this.valuesIdsDictionary[0].containsKey((<SubCellViewModel>args.caller).code)) {
                    let value = this.valuesIdsDictionary[0].getValue((<SubCellViewModel>args.caller).code);
                    value.push((<SubCellViewModel>args.caller).originalEntity.Id);
                    this.valuesIdsDictionary[0].remove((<SubCellViewModel>args.caller).code);
                    this.valuesIdsDictionary[0].add((<SubCellViewModel>args.caller).code, value);
                } else {
                    this.valuesIdsDictionary[0].add((<SubCellViewModel>args.caller).code, [(<SubCellViewModel>args.caller).originalEntity.Id]);
                }

                this.initDuplicatedData(<SubCellViewModel>args.caller);
                this.checkForDuplicatedItems(<SubCellViewModel>args.caller);
            }
            this.checkIsValid();
            this.hasChanged = (<SubCellViewModel>args.caller).hasChanged;
        }

        private requestChecked(subCellVm: ap.viewmodels.projects.SubCellViewModel) {
            if (subCellVm.isChecked) {
                if (this._checkedItemsDict.containsKey(subCellVm.subCell.ParentCell.Id)) {
                    let arrSubCells = this._checkedItemsDict.getValue(subCellVm.subCell.ParentCell.Id);
                    if (arrSubCells.filter(item => item.Id === subCellVm.subCell.Id).length === 0)
                        arrSubCells.push(subCellVm.subCell);
                } else {
                    this._checkedItemsDict.add(subCellVm.parentCellViewModel.originalEntity.Id, [subCellVm.subCell]);
                }
            } else if (this._checkedItemsDict.containsKey(subCellVm.subCell.ParentCell.Id)) {
                let arrSubCells = this._checkedItemsDict.getValue(subCellVm.subCell.ParentCell.Id);
                for (let i = 0; i < arrSubCells.length; i++) {
                    if (arrSubCells[i].Id === subCellVm.subCell.Id) {
                        arrSubCells.splice(i, 1);
                        break;
                    }
                }
                if (arrSubCells.length === 0) {
                    this._checkedItemsDict.remove(subCellVm.subCell.ParentCell.Id);
                }
            }

            this._listener.raise("itemchecked", subCellVm);
        }

        /**
        * This method is specify the ids of entities to load to avoid to load them from the api
        * @param ids is the list ids for the list
        **/
        specifyIds(ids: string[]): angular.IPromise<any> {
            this.setIds(ids);
            return this.preloadDuplicatedData(ids);
        }

        /**
         * This method fetches and initializes information about duplicated values in the list. Unlike the loadPage method, this method
         * loads a minimal possible amount of information about all items in the list in one request. Otherwise it may not be possible
         * to perform duplicates check for new items if not a whole list is loaded in the UI.
         * @param ids a list of ids for the list
         */
        private preloadDuplicatedData(ids: string[]): angular.IPromise<any> {
            this.clearDuplicatedData();

            if (this.useCacheSystem === true) {
                // Init duplicated data for imported rooms
                for (let i = 0; i < ids.length; i++) {
                    if (this.cacheData.containsKey(ids[i])) {
                        let subCellVm = <SubCellViewModel>this.cacheData.getValue(ids[i]);
                        this.initDuplicatedData(subCellVm);
                        this.checkForDuplicatedItems(subCellVm);
                    }
                }
            }

            // Init duplicated data for regular rooms
            return this._serviceManager.projectService.getProjectCells(ids, "Id,Code", true, false, true).then((cells: ap.models.projects.CellBase[]) => {
                for (let i = 0; i < cells.length; i++) {
                    let subCellVm = new SubCellViewModel(this.$utility);
                    subCellVm.init(cells[i]);
                    this.initDuplicatedData(subCellVm);
                }

                if (this.isLoaded) {
                    // If some real items are already loaded, than we have to check them for duplicates.
                    // It was impossible to perform this check when they were loaded.
                    for (let cell of this.sourceItems) {
                        this.checkForDuplicatedItems(cell);
                    }
                }
            });
        }

        protected getCurrentEntityViewModelValuesToCheck(entityVm: IEntityViewModel): KeyValue<string, string>[] {
            if (entityVm && entityVm !== null) {
                let subCell = <SubCellViewModel>entityVm;
                let code: string;
                if (subCell.code) {
                    code = subCell.code.toUpperCase();
                } else {
                    code = subCell.code;
                }
                return [new KeyValue("Code", code)];
            }
        }

        /**
        * This property is actions array
        **/
        public get actions(): ap.viewmodels.home.ActionViewModel[] {
            return this._actions;
        }

        /**
        * Methode use to know if something has changed on the list to set the save button enable or disable
        * @param newValue true or false it depends if the list contains a changed element
        **/
        private set hasChanged(newValue: boolean) {
            this._hasChanged = newValue;
            this._listener.raise("hasChanged", this._hasChanged);
        }

        /**
        * This method for handler action clicked
        **/
        public actionClickedHandler(name: string) {
            if (name === "subcells.add") {
                this.subCellInsertRequested();
            }
        }

        /**
        * This method use for disable actions
        **/
        public disableActions() {
            this._actions.forEach((action) => {
                action.isEnabled = false;
            });
        }

        /**
        * This method use for enable actions
        **/
        public enableActions() {
            this._actions.forEach((action) => {
                action.isEnabled = true;
            });
        }

        /*
        * Cancel the vm ans reset the hasChanged flag
        */
        public cancel() {
            let modifiedIssueType: ap.viewmodels.projects.SubCellViewModel[] = <ap.viewmodels.projects.SubCellViewModel[]>this.getChangedItems();
            for (let i = 0; i < modifiedIssueType.length; i++) {
                let subCellVm: ap.viewmodels.projects.SubCellViewModel;
                subCellVm = modifiedIssueType[i];

                if (subCellVm.originalEntity.IsNew) {
                    let code: string;
                    if (subCellVm.code) {
                        code = subCellVm.code.toUpperCase();
                    } else {
                        code = subCellVm.code;
                    }
                    let v = this.valuesIdsDictionary[0].getValue(code);
                    if (v) {
                        let index = v.indexOf(subCellVm.originalEntity.Id);
                        if (index !== -1) {
                            v.splice(index, 1);
                            this.valuesIdsDictionary[0].remove(code);
                            if (v.length !== 0) {
                                this.valuesIdsDictionary[0].add(code, v);
                            }
                        }
                    }
                    this.idValuesDictionary.remove(subCellVm.originalEntity.Id);
                    this.sourceItems.splice(this.sourceItems.indexOf(subCellVm), 1);
                    this._setCount(this._count - 1);
                }
            }
            this.specifyIds([]);
            this.setIsValid(true);
            this._invalidItems.splice(0);
            this.hasChanged = false;
        }

        public parentCellUpdated(parentCell: ap.viewmodels.projects.ParentCellViewModel) {
            if (parentCell) {
                for (let i = 0; i < this.sourceItems.length; i++) {
                    if (<SubCellViewModel>this.sourceItems[i]) {
                        (<SubCellViewModel>this.sourceItems[i]).parentCellViewModel = parentCell;
                    }
                }

                if (parentCell.isMarkedToDelete) {
                    this._listener.raise("needToUnselect");
                }
            }
        }

        protected afterLoadPageSuccessHandler(arrayItem: IEntityViewModel[], index: number, pageDesc: PageDescription, createItemVmHandler?: new (utility: ap.utility.UtilityHelper, q: angular.IQService, parentListVm?: BaseListEntityViewModel, itemParameters?: ItemConstructorParameter) => IEntityViewModel, _pageLoadedParameters?: LoadPageSuccessHandlerParameter) {
            let checkedItems: ap.models.projects.SubCell[] = [];
            if (!!this._parentCellVm && this._checkedItemsDict.containsKey(this._parentCellVm.originalEntity.Id)) {
                checkedItems = this._checkedItemsDict.getValue(this._parentCellVm.originalEntity.Id);
            }
            for (let i = 0; i < arrayItem.length; i++) {
                if (arrayItem[i]) {
                    let item = <SubCellViewModel>arrayItem[i];
                    if (checkedItems.length > 0 && checkedItems.filter(entity => entity.Id === item.subCell.Id).length > 0) {
                        item.defaultChecked = true;
                    }
                    item.parentCellViewModel = this._parentCellVm;
                    arrayItem[i].on("insertrowrequested", this.subCellInsertRequested, this);
                    arrayItem[i].on("propertychanged", this.subCellPropertyChanged, this);

                    if (this.idValuesDictionary.count > 0) {
                        // Duplicated data is already loaded, so we can check for duplicates.
                        // Otherwise duplicates will be checked once duplicated data is loaded by the preloadDuplicatedData method.
                        this.checkForDuplicatedItems(arrayItem[i], arrayItem);
                    }
                }
            }
        }

        /**
        * Method use to update modifications before saving
        **/
        public postChange(): ap.models.custom.ProjectRoomModification {
            let modifiedSubCells: ap.viewmodels.projects.SubCellViewModel[] = <ap.viewmodels.projects.SubCellViewModel[]>this.getChangedItems();
            let projectRoomModification: ap.models.custom.ProjectRoomModification = new ap.models.custom.ProjectRoomModification(this.$utility, this._controllersManager.mainController.currentProject().Id);
            for (let i = 0; i < modifiedSubCells.length; i++) {
                let subCellVm: ap.viewmodels.projects.SubCellViewModel = modifiedSubCells[i];
                if (subCellVm.isMarkedToDelete && !subCellVm.originalEntity.IsNew) {
                    projectRoomModification.SubCellsToDelete.push(subCellVm.originalEntity.Id);
                }
                if (subCellVm.hasChanged && !subCellVm.isMarkedToDelete && !subCellVm.parentCellViewModel.isMarkedToDelete) {
                    subCellVm.postChanges();
                    projectRoomModification.SubCellsToUpdate.push(<ap.models.projects.SubCell>subCellVm.originalEntity);
                }
                if ((subCellVm.isMarkedToDelete || subCellVm.parentCellViewModel.isMarkedToDelete) && subCellVm.originalEntity.IsNew) {
                    let code: string;
                    if (subCellVm.code) {
                        code = subCellVm.code.toUpperCase();
                    } else {
                        code = subCellVm.code;
                    }
                    let v = this.valuesIdsDictionary[0].getValue(code);
                    if (v) {
                        let index = v.indexOf(subCellVm.originalEntity.Id);
                        if (index !== -1) {
                            v.splice(index, 1);
                            this.valuesIdsDictionary[0].remove(subCellVm.code);
                            if (v.length !== 0) {
                                this.valuesIdsDictionary[0].add(subCellVm.code, v);
                            }
                        }
                        this.idValuesDictionary.remove(subCellVm.originalEntity.Id);
                        this.sourceItems.splice(this.sourceItems.indexOf(subCellVm), 1);
                        this._setCount(this._count - 1);
                    }

                    // Remove from the cache is exists
                    this.cacheData.remove(subCellVm.originalEntity.Id);
                }
            }
            return projectRoomModification;
        }

        /**
         * This method inserts the given sub-cell into the cache. It is meant to work with data imported from excel
         * @param subCell a sub-cell to insert
         */
        public insertImportedItem(subCell: SubCellViewModel) {
            this._idValuesDictionary.add((subCell).originalEntity.Id, [new KeyValue("Code", subCell.code.toUpperCase())]);
            subCell.on("insertrowrequested", this.subCellInsertRequested, this);
            subCell.on("propertychanged", this.subCellPropertyChanged, this);

            // Need to remove these lines when AP-14225 is resolved
            if (this.valuesIdsDictionary.length === 0) {
                this.valuesIdsDictionary.push(new Dictionary<string, string[]>());
            }

            if (this.valuesIdsDictionary[0].containsKey(subCell.code)) {
                let value = this.valuesIdsDictionary[0].getValue(subCell.code);
                value.push(subCell.originalEntity.Id);
                this.valuesIdsDictionary[0].remove(subCell.code);
                this.valuesIdsDictionary[0].add(subCell.code, value);
            } else {
                this.valuesIdsDictionary[0].add(subCell.code, [subCell.originalEntity.Id]);
            }

            this.checkForDuplicatedItems(subCell);
            this.initDuplicatedData(subCell);
            this.addIntoCache(subCell);
            this.hasChanged = true;
            this.checkIsValid();
        }

        /**
        * To insert a row when it rasie insert event
        **/
        private subCellInsertRequested(subCell?: SubCellViewModel) {
            let itemIndex = subCell ? this.sourceItems.indexOf(subCell) : this.sourceItems.length - 1;
            let newItem = new SubCellViewModel(this.$utility);
            let newEntity = new ap.models.projects.SubCell(this.$utility);

            newEntity.ParentCell = <ap.models.projects.ParentCell>this._parentCellVm.originalEntity;

            let itemAfter: SubCellViewModel, itemBefore: SubCellViewModel;
            if (itemIndex >= 0) {
                itemAfter = <SubCellViewModel>this.getItemAtIndex(itemIndex + 1);
                itemBefore = <SubCellViewModel>this.getItemAtIndex(itemIndex);
            }
            // to increase others display order
            if (itemAfter && subCell) {
                newEntity.DisplayOrder = Math.round((subCell.displayOrder + itemAfter.displayOrder) / 2);
            } else if (subCell) {
                // case when we are at the last element of the list
                newEntity.DisplayOrder = subCell.displayOrder + 10000;
            } else {
                if (!itemBefore) {
                    newEntity.DisplayOrder = this.sourceItems.length !== 0 ? this.sourceItems.length + 10000 : 1;
                }
                else {
                    newEntity.DisplayOrder = itemBefore.displayOrder + 10000;
                }
            }

            newItem.init(newEntity);
            this._updateDictionaries(newItem);
            newItem.on("insertrowrequested", this.subCellInsertRequested, this);
            newItem.on("propertychanged", this.subCellPropertyChanged, this);
            // Need to remove these lines when AP-14225 is resolved
            if (this.valuesIdsDictionary.length === 0) {
                this.valuesIdsDictionary.push(new Dictionary<string, string[]>());
            }
            this.initDuplicatedData(newItem);
            this.insertItem(itemIndex + 1, newItem, true);
            this.selectEntity(newEntity.Id);
            // special UI logic to focus on new row
            ViewHelper.delayFocusElement(newItem.originalEntity.Id);
            this._invalidItems.push(newItem);
            this.checkIsValid();
            this.hasChanged = true;
            this.checkIsValid();
        }

        /**
        * Method use to set the values of the new item into both dictionaries
        **/
        private _updateDictionaries(newItem: SubCellViewModel) {
            // Need to remove these lines when AP-14225 is resolved
            if (this.valuesIdsDictionary.length !== 1) {
                this.valuesIdsDictionary.push(new Dictionary<string, string[]>());
            }
            this._idValuesDictionary.add(newItem.originalEntity.Id, [new KeyValue("Code", null)]);
            if (this.valuesIdsDictionary[0].containsKey(null)) {
                let value = this.valuesIdsDictionary[0].getValue(null);
                value.push(newItem.originalEntity.Id);
                this.valuesIdsDictionary[0].remove(null);
                this.valuesIdsDictionary[0].add(null, value);
            } else {
                this.valuesIdsDictionary[0].add(null, [newItem.originalEntity.Id]);
            }
        }

        /**
        * This method use for set isChecked for items and save/remove in dictionary
        **/
        public setCheckedAllItems(check: boolean, id: string, subCells?: ap.models.projects.SubCell[]) {
            this._checkedItemsDict.remove(id);
            if (check && subCells.length > 0) {
                this._checkedItemsDict.add(id, subCells);
            }
            if (this.isLoaded && this.sourceItems.length > 0 && this._parentCellVm.originalEntity.Id === id && (!check || check && subCells.length > 0)) {
                this.sourceItems.forEach((item) => { item.defaultChecked = check; });
            }
        }

        constructor(utility: ap.utility.UtilityHelper, $q: angular.IQService, private _controllersManager: ap.controllers.ControllersManager, private _serviceManager: ap.services.ServicesManager) {
            super(utility, _controllersManager.listController, $q, new GenericPagedListOptions("SubCell", SubCellViewModel, "ParentCell", "DisplayOrder", 50, false, false, null, false, null, 1, undefined, undefined, undefined, true));
            this.isDeferredLoadingMode = true;
            this._addAction = new ap.viewmodels.home.ActionViewModel(utility, utility.EventTool, "subcells.add", "/Images/html/icons/ic_add_black_48px.svg", false, null, "Add room level 2", false); // the button is hidden and disabled by default
            this._actions = [];
            this._invalidItems = [];
            this._isValid = true;
            this._actions.push(this._addAction);
            this._listener.addEventsName(["checkSubCellsOk", "needToUnselect"]);
            this._valuesIdsDicSubCell.push(this._valuesIdsDictionary[0]);
        }

        private _addAction: ap.viewmodels.home.ActionViewModel;
        private _actions: ap.viewmodels.home.ActionViewModel[];
        private _checkedItemsDict: Dictionary<string, ap.models.projects.SubCell[]> = new Dictionary<string, ap.models.projects.SubCell[]>();
        private _subCellsCode: ap.models.projects.SubCell[] = [];
        private _hasChanged: boolean = false;
        private _parentCellVm: ap.viewmodels.projects.ParentCellViewModel;
        private _invalidItems: SubCellViewModel[];
        private _isValid: boolean;
        private _valuesIdsDicSubCell: IDictionary<string, string[]>[] = [];
    }
}