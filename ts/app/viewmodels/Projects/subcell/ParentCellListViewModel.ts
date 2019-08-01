module ap.viewmodels.projects {

    export class ParentCellListViewModel extends GenericPagedListViewModels {

        /**
        * Method used to know if the browser is IE
        **/
        public isIE(): boolean {
            return this.$utility.isIE();
        }

        /**
        * This method use for get isValid
        **/
        public get isValid(): boolean {
            return this._isValid;
        }

        /**
        * This method return array of ActionViewModel
        **/
        public get actions(): ap.viewmodels.home.ActionViewModel[] {
            return this._actions;
        }

        /**
        * The way to know if one item has changed so the save button can be enable
        **/
        public get hasChanged(): boolean {
            return this._hasChanged;
        }

        /**
        * Methode use to know if something has changed on the list to set the save button enable or disable
        * @param newValue true or false it depends if the list contains a changed element
        **/
        private set setHasChanged(newValue: boolean) {
            this._hasChanged = newValue;
            this._listener.raise("hasChanged", this._hasChanged);
        }

        /**
        * Used to set the validity depends on children
        **/
        public setValidityFromChild(value: boolean) {
            this._isValid = value;
            this._addAction.isEnabled = this._isValid;
            this._isChildrensFault = !value;
        }

        /**
        * To know if the validity depends on a child
        **/
        public get isChildrensFault(): boolean {
            return this._isChildrensFault;
        }

        /*
        * Setter to the isValid property
        */
        private setIsValid(isValid: boolean) {
            if (this._isValid !== isValid) {
                this._isValid = isValid;
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
            this.sourceItems.forEach((item: ap.viewmodels.projects.ParentCellViewModel) => {
                if (enable) {
                    item.enableActions();
                } else if (this._invalidItems.indexOf(item) < 0) {
                    item.disableActions();
                }
                if (item.isDuplicated) {
                    item.enableActions();
                }
            });
        }

        /*
        * Handler method called when the property of an item is changed
        */
        protected itemPropertyChanged(args: base.PropertyChangedEventArgs) {
            super.itemPropertyChanged(args);
            switch (args.propertyName) {
                case "code":
                    this.checkForDuplicatedItems(<ParentCellViewModel>args.caller);
                    break;
                case "isChecked":
                    this.requestChecked(<ParentCellViewModel>args.caller);
                    break;
                case "isValid":
                    if (!(<ParentCellViewModel>args.caller).isValid()) {
                        this._invalidItems.push(args.caller);
                    } else if (this._invalidItems.indexOf(args.caller) > -1) {
                        this._invalidItems.splice(this._invalidItems.indexOf(args.caller), 1);
                    }
                    break;
                case "delete":
                    if (!(<ParentCellViewModel>args.caller).isValid() && (<ParentCellViewModel>args.caller).isMarkedToDelete) {
                        if (this._invalidItems.indexOf(args.caller) > -1) {
                            this._invalidItems.splice(this._invalidItems.indexOf(args.caller), 1);
                        }
                    }
                    (<ParentCellViewModel>args.caller).isDuplicated = false;

                    let keys = this.valuesIdsDictionary[0].keys();
                    for (let i = 0; i < keys.length; i++) {
                        let v = this.valuesIdsDictionary[0].getValue(keys[i]);
                        let index = v.indexOf((<ParentCellViewModel>args.caller).originalEntity.Id);
                        if (index !== -1) {
                            v.splice(index, 1);
                            this.valuesIdsDictionary[0].remove(keys[i]);
                            if (v.length !== 0) {
                                this.valuesIdsDictionary[0].add(keys[i], v);
                            }
                        }
                    }
                    this.idValuesDictionary.remove((<ParentCellViewModel>args.caller).originalEntity.Id);


                    let duplicatedItems = this.getDuplicatedItems();
                    duplicatedItems = duplicatedItems.filter((dup: ParentCellViewModel) => {
                        return dup.code === (<ParentCellViewModel>args.caller).code;
                    });
                    if (duplicatedItems.length === 1) {
                        duplicatedItems[0].isDuplicated = false;
                        this.checkIsDuplicated();
                        if (!StringHelper.isNullOrEmpty((<ParentCellViewModel>duplicatedItems[0]).code)) {
                            this._invalidItems = [];
                        }
                    }
                    break;
                case "undelete":
                    if (!(<ParentCellViewModel>args.caller).isValid() && !(<ParentCellViewModel>args.caller).isMarkedToDelete) {
                        this._invalidItems.push(args.caller);
                    }

                    if (this.valuesIdsDictionary[0].containsKey((<ParentCellViewModel>args.caller).code)) {
                        let value = this.valuesIdsDictionary[0].getValue((<ParentCellViewModel>args.caller).code);
                        value.push((<ParentCellViewModel>args.caller).originalEntity.Id);
                        this.valuesIdsDictionary[0].remove((<ParentCellViewModel>args.caller).code);
                        this.valuesIdsDictionary[0].add((<ParentCellViewModel>args.caller).code, value);
                    } else {
                        this.valuesIdsDictionary[0].add((<ParentCellViewModel>args.caller).code, [(<ParentCellViewModel>args.caller).originalEntity.Id]);
                    }

                    if (StringHelper.isNullOrEmpty((<ParentCellViewModel>args.caller).code)) {
                        if (StringHelper.isNullOrEmpty((<ParentCellViewModel>args.caller).description)) {
                            this._idValuesDictionary.add((<ParentCellViewModel>args.caller).originalEntity.Id, [new KeyValue("Code", null), new KeyValue("Description", null)]);
                        } else {
                            this._idValuesDictionary.add((<ParentCellViewModel>args.caller).originalEntity.Id, [new KeyValue("Code", null), new KeyValue("Description", (<ParentCellViewModel>args.caller).description.toUpperCase())]);
                        }
                    } else if (StringHelper.isNullOrEmpty((<ParentCellViewModel>args.caller).description)) {
                        this._idValuesDictionary.add((<ParentCellViewModel>args.caller).originalEntity.Id, [new KeyValue("Code", (<ParentCellViewModel>args.caller).code.toUpperCase()), new KeyValue("Description", null)]);
                    } else {
                        this._idValuesDictionary.add((<ParentCellViewModel>args.caller).originalEntity.Id, [new KeyValue("Code", (<ParentCellViewModel>args.caller).code.toUpperCase()), new KeyValue("Description", (<ParentCellViewModel>args.caller).description.toUpperCase())]);
                    }

                    this.initDuplicatedData(<ParentCellViewModel>args.caller);
                    this.checkForDuplicatedItems(<ParentCellViewModel>args.caller);
                    break;
            }
            this.checkIsDuplicated();
            this.checkIsValid();
            this.setHasChanged = (<ParentCellViewModel>args.caller).hasChanged;
        }

        private requestChecked(parentCell: ap.viewmodels.projects.ParentCellViewModel) {
            this._listener.raise("itemchecked", parentCell);
        }

        /**
        * Use to select item in list
        * @param item is item in list
        **/
        public selectItem(item: ParentCellViewModel) {
            if (this._isValid || item.originalEntity.IsNew) {
                this.selectedViewModel = item;
                return true;
            }
            return false;
        }

        /**
        * This method is specify the ids of entities to load to avoid to load them from the api
        * @param ids is the list ids for the list
        **/
        specifyIds(ids: string[]) {
            this.setIds(ids);
            this.preloadDuplicatedData(ids);
        }

        /**
         * This method fetches and initializes information about duplicated values in the list. Unlike the loadPage method, this method
         * loads a minimal possible amount of information about all items in the list in one request. Otherwise it may not be possible
         * to perform duplicates check for new items if not a whole list is loaded in the UI.
         * @param ids a list of ids for the list
         */
        private preloadDuplicatedData(ids: string[]) {
            this.projectService.getProjectCells(ids, "Id,Code", true, true, true).then((cells: ap.models.projects.CellBase[]) => {
                if (!cells) {
                    return;
                }

                // Initialize duplicated dictionaries
                this.clearDuplicatedData();
                for (let cell of cells) {
                    let cellVm = new ap.viewmodels.projects.ParentCellViewModel(this.$utility);
                    cellVm.init(cell);
                    this.initDuplicatedData(cellVm);
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
                let parentCellVm = <ParentCellViewModel>entityVm;
                let code = parentCellVm.code;
                if (code) {
                    code = code.toUpperCase();
                }
                return [new KeyValue("Code", code)];
            }
        }

        protected afterLoadPageSuccessHandler(arrayItem: IEntityViewModel[], index: number, pageDesc: PageDescription, createItemVmHandler?: new (utility: ap.utility.UtilityHelper, q: angular.IQService, parentListVm?: BaseListEntityViewModel, itemParameters?: ItemConstructorParameter) => IEntityViewModel, _pageLoadedParameters?: LoadPageSuccessHandlerParameter) {
            for (let i = 0; i < arrayItem.length; i++) {
                if (arrayItem[i]) {
                    arrayItem[i].on("insertrowrequested", this.parentCellInsertRequested, this);
                    arrayItem[i].on("needtobeselected", this.selectParentCell, this);
                    arrayItem[i].on("propertychanged", this.itemPropertyChanged, this);

                    if (this.idValuesDictionary.count > 0) {
                        // Duplicated data is already loaded, so we can check for duplicates.
                        // Otherwise duplicates will be checked once duplicated data is loaded by the preloadDuplicatedData method.
                        this.checkForDuplicatedItems(arrayItem[i], arrayItem);
                    }
                }
            }
        }

        /**
         * This method inserts the given parent cell into the cache. It is meant to work with data imported from excel
         * @param subCell a sub-cell to insert
         */
        public insertImportedItem(parentCell: ParentCellViewModel) {
            this.insertItem(this._count, parentCell, true);
        }

        insertItem(index: number, item: EntityViewModel, forceUpdated: boolean = false) {
            super.insertItem(index, item, forceUpdated);
            let vm = <ParentCellViewModel>item;
            vm.on("insertrowrequested", this.parentCellInsertRequested, this);
            vm.on("propertychanged", this.itemPropertyChanged, this);
            if (vm.originalEntity.IsNew && !StringHelper.isNullOrEmpty(vm.code) && !StringHelper.isNullOrEmpty(vm.description)) {
                this._idValuesDictionary.add((<ParentCellViewModel>item).originalEntity.Id, [new KeyValue("Code", (<ParentCellViewModel>item).code.toUpperCase()), new KeyValue("Description", (<ParentCellViewModel>item).description.toUpperCase())]);
                this.initDuplicatedData(item);
                // item.on("insertrowrequested", this.parentCellInsertRequested, this);
                item.on("needtobeselected", this.selectParentCell, this);
                // item.on("propertychanged", this.itemPropertyChanged, this);
                this.checkForDuplicatedItems(item);
            }
            this.setHasChanged = true;
            this.checkIsValid();
        }

        /**
        * To insert a row when it rasie insert event
        **/
        private parentCellInsertRequested(parentCell?: ParentCellViewModel) {
            let itemIndex = parentCell ? this.sourceItems.indexOf(parentCell) : this.sourceItems.length - 1;
            let newItem = new ParentCellViewModel(this.$utility);
            let newEntity = new ap.models.projects.ParentCell(this.$utility);
            newEntity.ProjectId = this._controllersManager.mainController.currentProject().Id;

            // to increase others display order
            let itemAfter, itemBefore;
            if (itemIndex >= 0) {
                itemBefore = <ParentCellViewModel>this.getItemAtIndex(itemIndex);
                itemAfter = <ParentCellViewModel>this.getItemAtIndex(itemIndex + 1);
            }
            if (itemAfter && parentCell) {
                newEntity.DisplayOrder = Math.round((parentCell.displayOrder + itemAfter.displayOrder) / 2);
            } else if (parentCell) {
                // case when we are at the last element of the list
                newEntity.DisplayOrder = parentCell.displayOrder + 10000;
            } else {
                if (!itemBefore)
                    newEntity.DisplayOrder = this.sourceItems.length !== 0 ? this.sourceItems.length + 10000 : 1;
                else
                    newEntity.DisplayOrder = itemBefore.displayOrder + 10000;
            }

            newItem.init(newEntity);
            this._idValuesDictionary.add(newItem.originalEntity.Id, [new KeyValue("Code", null)]);
            if (this.valuesIdsDictionary[0].containsKey(null)) {
                let value = this.valuesIdsDictionary[0].getValue(null);
                value.push(newItem.originalEntity.Id);
                this.valuesIdsDictionary[0].remove(null);
                this.valuesIdsDictionary[0].add(null, value);
            } else {
                this.valuesIdsDictionary[0].add(null, [newItem.originalEntity.Id]);
            }
            this.insertItem(itemIndex + 1, newItem, true);
            this.selectEntity(newEntity.Id);

            // special UI logic to focus on new row
            ViewHelper.delayFocusElement(newItem.originalEntity.Id);
            this._invalidItems.push(newItem);
            this.setHasChanged = true;
            this.checkForDuplicatedItems(newItem);
            this.checkIsDuplicated();
            this.checkIsValid();
        }

        /**
        * Method use to update modifications before saving
        **/
        public postChange(): ap.models.custom.ProjectRoomModification {
            let modifiedParentCells: ap.viewmodels.projects.ParentCellViewModel[] = <ap.viewmodels.projects.ParentCellViewModel[]>this.getChangedItems();
            let projectRoomModification: ap.models.custom.ProjectRoomModification = new ap.models.custom.ProjectRoomModification(this.$utility, this._controllersManager.mainController.currentProject().Id);
            for (let i = 0; i < modifiedParentCells.length; i++) {
                let parentCellVm: ap.viewmodels.projects.ParentCellViewModel = modifiedParentCells[i];
                if (parentCellVm.isMarkedToDelete && !parentCellVm.originalEntity.IsNew) {
                    projectRoomModification.ParentCellsToDelete.push(parentCellVm.originalEntity.Id);
                }
                if (parentCellVm.hasChanged && !parentCellVm.isMarkedToDelete) {
                    parentCellVm.postChanges();
                    projectRoomModification.ParentCellsToUpdate.push(<ap.models.projects.ParentCell>parentCellVm.originalEntity);
                }
                if (parentCellVm.isMarkedToDelete && parentCellVm.originalEntity.IsNew) {
                    let code: string;
                    if (parentCellVm.code) {
                        code = parentCellVm.code.toUpperCase();
                    } else {
                        code = parentCellVm.code;
                    }
                    let v = this.valuesIdsDictionary[0].getValue(code);
                    if (v) {
                        let index = v.indexOf(parentCellVm.originalEntity.Id);
                        if (index !== -1) {
                            v.splice(index, 1);
                            this.valuesIdsDictionary[0].remove(parentCellVm.code.toUpperCase());
                            if (v.length !== 0) {
                                this.valuesIdsDictionary[0].add(parentCellVm.code.toUpperCase(), v);
                            }
                        }
                    }
                    this.idValuesDictionary.remove(parentCellVm.originalEntity.Id);
                    this.sourceItems.splice(this.sourceItems.indexOf(parentCellVm), 1);
                    this._setCount(this._count - 1);
                }
            }
            return projectRoomModification;
        }

        /*
        * Cancel the vm ans reset the hasChanged flag
        */
        public cancel() {
            let modifiedParentCell: ap.viewmodels.projects.ParentCellViewModel[] = <ap.viewmodels.projects.ParentCellViewModel[]>this.getChangedItems();
            for (let i = 0; i < modifiedParentCell.length; i++) {
                let parentCellVm: ap.viewmodels.projects.ParentCellViewModel = modifiedParentCell[i];

                if (parentCellVm.originalEntity.IsNew && this.sourceItems.indexOf(parentCellVm) > -1) {
                    let code: string;
                    if (parentCellVm.code) {
                        code = parentCellVm.code.toUpperCase();
                    } else {
                        code = parentCellVm.code;
                    }
                    let v = this.valuesIdsDictionary[0].getValue(code);
                    if (v) {
                        let index = v.indexOf(parentCellVm.originalEntity.Id);
                        if (index !== -1) {
                            v.splice(index, 1);
                            this.valuesIdsDictionary[0].remove(code);
                            if (v.length !== 0) {
                                this.valuesIdsDictionary[0].add(code, v);
                            }
                        }
                    }
                    this.idValuesDictionary.remove(parentCellVm.originalEntity.Id);
                    this.sourceItems.splice(this.sourceItems.indexOf(parentCellVm), 1);
                    this._setCount(this._count - 1);
                }
            }
            this.setHasChanged = false;
            this.setIsValid(true);
            this._invalidItems.splice(0);
        }

        /**
        * This method is use to select the parentcell in param
        * @param the parentcell to be selected
        **/
        public selectParentCell(parentCell: ParentCellViewModel) {
            this.selectedViewModel = parentCell;
        }

        /*
        * Handler method when the actions of the list are clicked
        * @param actionName: string The name of the clicked action
        */
        public actionClickedHandler(actionName: string) {
            if (actionName === "cells.add")
                this.parentCellInsertRequested();
        }

        constructor(utility: ap.utility.UtilityHelper, protected $q: angular.IQService, private _controllersManager: ap.controllers.ControllersManager, private projectService: ap.services.ProjectService, private isForImportModule: boolean = false) {
            super(utility, _controllersManager.listController, $q, new GenericPagedListOptions("ParentCell", ParentCellViewModel, isForImportModule ? "SubCells" : null, "DisplayOrder", 50, false, false, null, false, null, 1, undefined, undefined, undefined, true));
            this._addAction = new ap.viewmodels.home.ActionViewModel(utility, utility.EventTool, "cells.add", "Images/html/icons/ic_add_black_48px.svg", true, null, "Add room level 1", true);
            this._actions = [];
            this._invalidItems = [];
            this._isValid = true;
            this._actions.push(this._addAction);
            this.isDeferredLoadingMode = true;
            this._listener.addEventsName(["checkSubCellsOk"]);
        }

        private _addAction: ap.viewmodels.home.ActionViewModel;
        private _actions: ap.viewmodels.home.ActionViewModel[];
        private _hasChanged: boolean = false;
        private _invalidItems: ParentCellViewModel[];
        private _isValid: boolean;
        private _isChildrensFault: boolean = false;
    }
}