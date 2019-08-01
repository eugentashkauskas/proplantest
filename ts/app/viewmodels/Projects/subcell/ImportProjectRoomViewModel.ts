module ap.viewmodels.projects {
    export class ImportProjectRoomViewModel implements IDispose {
        /**
        * Method use to get parentCellListVm
        **/
        public get parentCellListVm(): ap.viewmodels.projects.ParentCellListViewModel {
            return this._parentCellListVm;
        }

        /**
        * Method use to get subCellListVm
        **/
        public get subCellListVm(): ap.viewmodels.projects.SubCellListViewModel {
            return this._subCellListVm;
        }

        /**
        * The project to select
        **/
        public get projectSelector(): ap.viewmodels.projects.ProjectSelectorViewModel {
            return this._projectSelector;
        }

        /**
         * Determines whether the popup is loading data from the server at the moment
         */
        public get isDialogBusy(): boolean {
            return this._isDialogBusy;
        }

        /**
        * Method use to close the pop up
        **/
        public cancel() {
            this.dispose();
            this.$mdDialog.hide();
        }

        /**
        * Method use to disable or enable the import button
        **/
        public get importbuttonDisable(): boolean {
            return this._parentCellListVm.getCheckedItems().length === 0;
        }

        /**
        * Method use to get all the rooms checked 
        * @return parentCell[]: the list of parentCell checked with their subCells linked
        **/
        public import() {
            let rooms: ap.models.projects.ParentCell[] = [];
            let parentCellsChecked = this._parentCellListVm.getCheckedItems();
            if (parentCellsChecked && parentCellsChecked.length > 0) {
                for (let i = 0; i < parentCellsChecked.length; i++) {
                    let selectedParent = <ap.models.projects.ParentCell>parentCellsChecked[i].originalEntity;
                    let parentCell: ap.models.projects.ParentCell = new ap.models.projects.ParentCell(this.$utility, selectedParent.Code, selectedParent.Description, this._controllersManager.mainController.currentProject().Id);
                    parentCell.SubCells = [];
                    let subCellsChecked = this._subCellListVm.checkedItemsDict.getValue(selectedParent.Id);

                    if (subCellsChecked && subCellsChecked.length > 0) {
                        subCellsChecked.forEach((subCellChecked) => {
                            let subCell = new ap.models.projects.SubCell(this.$utility, subCellChecked.Code, subCellChecked.Description);
                            subCell.ParentCell = parentCell;
                            parentCell.SubCells.push(subCell);
                        });
                    }
                    rooms.push(parentCell);
                }
            }
            this._listener.raise("importroomfromproject", rooms);

            this.$mdDialog.hide();
        }

        /**
        * Method use to check/uncheck every subCell of the parentCell in param
        * @param parentCell: the parentCell which has been checked/unchecked
        **/
        public checkedRooms(room: any) {
            if (room instanceof ParentCellViewModel) {
                this.parentCellListVm.selectedViewModel = <ParentCellViewModel>room;
                this.parentIsChecked(<ParentCellViewModel>room);
            }
            if (room instanceof SubCellViewModel) {
                this.subCellListVm.selectedViewModel = <SubCellViewModel>room;
                this.subCellIsChecked(<SubCellViewModel>room);
            }
        }

        /**
        * Method use to load the cell ids
        **/
        public load(): void {
            this._dicCell.clear();
            let url = "rest/cellhierarchiesids";
            let options: ap.services.apiHelper.ApiOption = new ap.services.apiHelper.ApiOption();
            let currentProj: ap.models.projects.Project = this._controllersManager.mainController.currentProject();
            options.customParams.push(new ap.services.apiHelper.ApiCustomParam("projectId", this.projectSelector.selectedProjectId));
            options.customParams.push(new ap.services.apiHelper.ApiCustomParam("baseentityname", "parentcell"));
            this._api.getApiResponse(url, ap.services.apiHelper.MethodType.Get, null, null, options).then((response: ap.services.apiHelper.ApiResponse) => {
                let collection = response.data;
                let num: string = null;
                let id: string = null;
                let currentParentCellId: string = null;
                let itemId: string = null;
                for (let i = 0; i < collection.length; i++) {
                    itemId = collection[i];
                    num = itemId.substr(itemId.length - 1);
                    id = itemId.substr(0, itemId.length - 1);
                    if (num === "0") {
                        currentParentCellId = id;
                        this._dicCell.add(id, []);
                    }
                    if (num === "1") {
                        this._dicCell.getValue(currentParentCellId).push(id);
                    }
                }
                this._parentCellListVm.specifyIds(this._dicCell.keys());
            });
        }

        /**
        * Dispose method
        */
        public dispose() {
            this._api.off("showdetailbusy", this.onDataLoadingChanged, this);

            // this._roomsChecked.clear();
            this._projectSelector.off("selectedItemChanged", this._projectSelectorSelectedItemChanged, this);
            this._parentCellListVm.dispose();
            if (this._parentCellListVm) {
                this._parentCellListVm.off("selectedItemChanged", this._handlerSelectedParentCellChanged, this);
                this._parentCellListVm.off("itemchecked", this.checkedRooms, this);
                this._parentCellListVm.dispose();
            }
            if (this._subCellListVm) {
                this._subCellListVm.off("itemchecked", this.checkedRooms, this);
                this._subCellListVm.dispose();
            }
        }


        /**
        * This method is used to keep the last selected project make by the user
        * @param selectedProjectVm is the selected project
        **/
        private _projectSelectorSelectedItemChanged(selectedProjectVm: ap.viewmodels.projects.ProjectSelectorViewModel) {
            if (selectedProjectVm && selectedProjectVm !== null) {
                this._subCellListVm.checkedItemsDict.clear();
                this._subCellListVm.specifyIds([]);
                this.load();
            }
        }

        /**
        * Method used to check/uncheck the parentCell in param
        * @param parentCell: the parentCell which has been checked/unchecked
        **/
        private parentIsChecked(parent: ap.viewmodels.projects.ParentCellViewModel) {
            let subCells: ap.models.projects.SubCell[] = [...parent.parentCell.SubCells];
            if (!subCells && subCells.length === 0)
                return;
            if (!this.subCellListVm.checkedItemsDict.containsKey(parent.parentCell.Id) && parent.isChecked) {
                this.subCellListVm.setCheckedAllItems(true, parent.originalEntity.Id, subCells);
            } else if (!parent.isChecked) {
                this.subCellListVm.setCheckedAllItems(false, parent.originalEntity.Id);
            }
        }

        /**
        * Method used to check/uncheck the subCell in param
        * @param subCell: the subCell which has been checked/unchecked
        **/
        private subCellIsChecked(subCellVm: ap.viewmodels.projects.SubCellViewModel) {
            let parentCellVm = <ap.viewmodels.projects.ParentCellViewModel>this._parentCellListVm.getEntityById(subCellVm.subCell.ParentCell.Id);
            if (subCellVm.isChecked === true) {
                parentCellVm.isChecked = true;
            } else {
                let needToUncheckParent = !this._subCellListVm.checkedItemsDict.containsKey(parentCellVm.parentCell.Id) ||
                    this._subCellListVm.checkedItemsDict.getValue(parentCellVm.parentCell.Id).length === 0;
                if (needToUncheckParent) {
                    parentCellVm.isChecked = false;
                }
            }
        }

        /**
         * Method called when the event selectedItemChanged is raised by parentCellListVm
         **/
        private _handlerSelectedParentCellChanged() {
            this._subCellListVm.parentCellVm = <ParentCellViewModel>this._parentCellListVm.selectedViewModel;
            if (this._parentCellListVm.selectedViewModel && (<ParentCellViewModel>this._parentCellListVm.selectedViewModel).originalEntity.Id) {
                let parentCellId: string = (<ParentCellViewModel>this._parentCellListVm.selectedViewModel).originalEntity.Id;
                this._subCellListVm.clear();
                this._subCellListVm.specifyIds(this._dicCell.getValue(parentCellId)).then(() => {
                    let self = this;
                    loadEveryPages(0); // Need to load all pages to be able to select all rooms level 2
                    function loadEveryPages(nbPages: number) {
                        self._subCellListVm.loadNextPage().then(() => {
                            if (self._subCellListVm.nbPages !== nbPages) {
                                loadEveryPages(++nbPages);
                            } else { // When all subcells loaded call checkedRooms to check or uncheck all the subcells 
                                self.checkedRooms(<ParentCellViewModel>self._parentCellListVm.selectedViewModel);
                            }
                        });
                    }
                    this._subCellListVm.parentCellUpdated(<ParentCellViewModel>this._parentCellListVm.selectedViewModel);
                });
            }
        }

        /**
         * A handler for the showdetailbusy event of the Api service
         * @param isLoadingActive an indicator of whether the loading process is active at the moment
         */
        private onDataLoadingChanged(isLoadingActive: boolean) {
            this._isDialogBusy = isLoadingActive;
        }

        on(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.on(eventName, callback, caller);
        }
        off(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.off(eventName, callback, caller);
        }

        constructor(private $utility: ap.utility.UtilityHelper, private $q: angular.IQService, private _api: ap.services.apiHelper.Api, private _controllersManager: ap.controllers.ControllersManager, private _projectService: ap.services.ProjectService, private _servicesManager: ap.services.ServicesManager, private $mdDialog: angular.material.IDialogService, $timeout: angular.ITimeoutService) {
            this._dicCell = new Dictionary<string, string[]>();

            this._api.on("showdetailbusy", this.onDataLoadingChanged, this);

            this._parentCellListVm = new ap.viewmodels.projects.ParentCellListViewModel(this.$utility, this.$q, this._controllersManager, this._projectService, true);
            this._subCellListVm = new ap.viewmodels.projects.SubCellListViewModel(this.$utility, this.$q, this._controllersManager, this._servicesManager);
            this._projectSelector = new ap.viewmodels.projects.ProjectSelectorViewModel(this.$utility, this.$q, this._controllersManager, $timeout, true);
            this.projectSelector.on("selectedItemChanged", this._projectSelectorSelectedItemChanged, this);
            this.parentCellListVm.on("selectedItemChanged", this._handlerSelectedParentCellChanged, this);
            this.parentCellListVm.on("itemchecked", this.checkedRooms, this);
            this.subCellListVm.on("itemchecked", this.checkedRooms, this);
            this._listener = this.$utility.EventTool.implementsListener(["importroomfromproject"]);
            this.projectSelector.load();
        }

        private _listener: ap.utility.IListenerBuilder;
        private _dicCell: IDictionary<string, string[]>;
        private _parentCellListVm: ap.viewmodels.projects.ParentCellListViewModel;
        private _subCellListVm: ap.viewmodels.projects.SubCellListViewModel;
        private _projectSelector: ap.viewmodels.projects.ProjectSelectorViewModel;
        private _isDialogBusy: boolean = false;
    }
}