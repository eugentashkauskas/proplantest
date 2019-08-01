module ap.viewmodels.projects {
    export class RoomSelectorViewModel extends ListWorkspaceViewModel {
        protected getSearchedTextProperties(): string[] {
            return this._propsSearchedText;
        }

        protected createCustomParams() {
            super.createCustomParams();
            let currentProject = this.$controllersManager.mainController.currentProject();
            if (!currentProject) // We force an empty guid then, we are sure that the api doesn't throw error if a call is done
                this._listVm.addCustomParam("projectid", ap.utility.UtilityHelper.createEmptyGuid());
            else
                this._listVm.addCustomParam("projectid", currentProject.Id);

            if (!StringHelper.isNullOrEmpty(this.searchedText))
                this._listVm.addCustomParam("baseentityname", "SubCell");
        }

        public get selectedRoomId(): string {
            return this.selectedItem ? (<ap.models.projects.CellHierarchy>this.selectedItem.originalEntity).EntityId : null;
        }
        /*
       * To bind with directive, avoid using listVM.SelectdViewModel becasue it may set null when no result
       */
        public get selectedItem(): IEntityViewModel {
            return this._selectedItem;
        }

        /*
        * To bind with directive, avoid using listVM.SelectdViewModel because it may set null when no result
        */
        public set selectedItem(value: IEntityViewModel) {
            if (this._selectedItem === null || value === null || this._selectedItem.originalEntity.Id !== value.originalEntity.Id) {
                this._selectedItem = value;
                if (this._selectedItem) {
                    let parentEntityId: string = (<ap.models.projects.CellHierarchy>this._selectedItem.originalEntity).ParentEntityId;
                    let parentEntity = this.listVm.sourceItems.filter((item: EntityItemViewModel) => {
                        return (<ap.models.projects.CellHierarchy>item.originalEntity).EntityId === parentEntityId;
                    });
                    if (parentEntity.length === 0) {
                        this.load(parentEntityId).then(() => {
                            let parentEntity = this.listVm.sourceItems.filter((item: EntityItemViewModel) => {
                                return (<ap.models.projects.CellHierarchy>item.originalEntity).EntityId === parentEntityId;
                            });
                            (<RoomHierarchyItemViewModel>this.selectedItem).roomDisplayName = (<ap.models.projects.CellHierarchy>parentEntity[0].originalEntity).Description + "/" + (<ap.models.projects.CellHierarchy>this._selectedItem.originalEntity).Description;

                            this._parentCell = <ap.models.projects.CellHierarchy>parentEntity[0].originalEntity;
                        });
                    } else {
                        (<RoomHierarchyItemViewModel>this.selectedItem).roomDisplayName = (<ap.models.projects.CellHierarchy>parentEntity[0].originalEntity).Description + "/" + (<ap.models.projects.CellHierarchy>this._selectedItem.originalEntity).Description;

                        this._parentCell = <ap.models.projects.CellHierarchy>parentEntity[0].originalEntity;
                    }
                }
            }
            this._listener.raise("selectedItemChanged", value);
        }

        /*
        * This method is used to returned to parent cell of the selected sub cell
        */
        public getParentCell(): ap.models.projects.CellHierarchy {
            return this._parentCell;
        }

        /**
         * Updates a list of available rooms and selects a room with the given ID
         * @param roomId an id of the room to select
         */
        public selectRoomById(roomId: string): angular.IPromise<any> {
            let deferred = this.$q.defer();

            this.searchedText = null;
            if (roomId !== null) {
                this.load(roomId + "1").then((list: GenericPagedListViewModels) => {
                    this.listVm.selectEntity(roomId + "1"); // need to concatenate 1 to have a sub cell id
                    this.selectedItem = this.listVm.selectedViewModel;
                    deferred.resolve();
                }, () => {
                    deferred.reject();
                });
            } else {
                this.listVm.selectEntity(null);
                this.selectedItem = null;
                deferred.reject();
            }

            return deferred.promise;
        }

        /**
        * @override
        */
        dispose() {
            super.dispose();

            if (this._parentCell) {
                this._parentCell = null;
            }

            if (this._selectedItem) {
                this._selectedItem.dispose();
                this._selectedItem = null;
            }
        }

        constructor($utility: ap.utility.UtilityHelper, $q: angular.IQService, _controllersManager: ap.controllers.ControllersManager,
            $timeout: angular.ITimeoutService, private predefinedItems: PredefinedItemParameter[] = null) {
            super($utility, _controllersManager, $q, new GenericPagedListOptions("CellHierarchy", RoomHierarchyItemViewModel, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, predefinedItems, (items) => {
                // The goal is to avoid to display Room Level 1 for which there is no children
                if (items) {
                    let predefinedItemClear = ap.utility.UtilityHelper.createHierarchyGuid(ap.utility.UtilityHelper.createEmptyGuid());
                    for (let i = 0; i < items.length; i++) {
                        let item = items[i];
                        if (item !== predefinedItemClear) {
                            let nextItem = i >= items.length - 1 ? null : items[i + 1];
                            if (item[ap.utility.UtilityHelper.guidLength] === "0" && (nextItem === null || nextItem[ap.utility.UtilityHelper.guidLength] === "0")) { // means that room level 1 and no children (next item is also a level 1)
                                items.splice(i, 1);
                                i--; // because we removed the current item, the next item to check must be the same index as the next one was moved to previous entry.
                            }
                        }
                    }
                }
            }));
            this._propsSearchedText = ["Code", "Description", "ParentCell.Code", "ParentCell.Description"];
            this._listener.addEventsName(["selectedItemChanged"]);
        }

        private _propsSearchedText: string[];
        private _selectedItem: IEntityViewModel = null;
        private _parentCell: ap.models.projects.CellHierarchy = null;
    }
}