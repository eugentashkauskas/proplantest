module ap.viewmodels.projects {

    export class SubCellViewModel extends CodeEntityViewModel {

        public get subCell(): ap.models.projects.SubCell {
            return <ap.models.projects.SubCell>this.originalEntity;
        }

        /**
        * Display order of the subCell
        */
        public get displayOrder(): number {
            return this._displayOrder;
        }

        public set displayOrder(_displayOrder_: number) {
            if (_displayOrder_ !== this.displayOrder) {
                let oldValue: number = this._displayOrder;
                this._displayOrder = _displayOrder_;
                this.raisePropertyChanged("displayOrder", oldValue, this);
            }
        }

        protected computeHasChanged(): boolean {
            if (this.code !== this.subCell.Code || this.description !== this.subCell.Description || this.displayOrder !== this.subCell.DisplayOrder || this.isMarkedToDelete) {
                return true;
            } else {
                return super.computeHasChanged();
            }
        }

        /**
        * ViewModel of the ParentCell of this subCell
        */
        public get parentCellViewModel(): ParentCellViewModel {
            return this._parentCellViewModel;
        }

        public set parentCellViewModel(parentCellVm: ParentCellViewModel) {
            this._parentCellViewModel = parentCellVm;
        }

        /**
        * Use to know if the chapter is marked as delete or not
        **/
        public get isMarkedToDelete(): boolean {
            return this._isMarkedToDelete;
        }

        /**
         * Determines whether it should be possible to delete the chapter
         */
        public get isRemovable(): boolean {
            let deleteAction = ap.viewmodels.home.ActionViewModel.getAction(this._actions, "subcell.delete");
            return deleteAction !== null && deleteAction.isVisible && deleteAction.isEnabled;
        }

        /**
         * Enables or disables an ability to delete the chapter
         */
        public set isRemovable(val: boolean) {
            let deleteAction = ap.viewmodels.home.ActionViewModel.getAction(this._actions, "subcell.delete");
            if (deleteAction !== null) {
                deleteAction.isVisible = false;
                deleteAction.isEnabled = false;
            }
        }

        /**
        * Use to know available actions on the item
        **/
        public get actions(): ap.viewmodels.home.ActionViewModel[] {
            return this._actions;
        }

        protected initData() {
            super.initData();
            this._displayOrder = 0;
            this._parentCellViewModel = null;
        }

        public buildProperty() {
            super.buildProperty();
            if (!this.subCell) {
                this.initData();
            } else {
                this.code = this.subCell.Code;
                this.description = this.subCell.Description;
                this._displayOrder = this.subCell.DisplayOrder;

                if (this.subCell.ParentCell) {
                    this._parentCellViewModel = new ap.viewmodels.projects.ParentCellViewModel(this.$utility);
                    this._parentCellViewModel.init(this.subCell.ParentCell);
                }
                else {
                    this._parentCellViewModel = null;
                }
            }
        }

        /**
         * Methode use to manage the differents actions
         **/
        public actionClicked(name: string) {
            if (name === "subcell.insert") {
                this._listener.raise("insertrowrequested", this);
            }
            if (name === "subcell.delete") {
                this._isMarkedToDelete = true;
                this._actions[1].isVisible = false;
                this.raisePropertyChanged("delete", false, this);
            }
        }

        /**
        * This method use for enable actions
        **/
        public enableActions() {
            this._actions.forEach((action) => {
                action.isEnabled = true;
            });
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
        * Methode use to undo delete
        **/
        public undoDelete() {
            this._isMarkedToDelete = false;
            this._actions[1].isVisible = true;
            this.raisePropertyChanged("undelete", true, this);
        }

        public postChanges() {
            if (this.subCell) {
                this.subCell.Code = this.code;
                this.subCell.Description = this.description;
                this.subCell.DisplayOrder = this.displayOrder;
            }
        }


        on(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.on(eventName, callback, caller);
        }
        off(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.off(eventName, callback, caller);
        }

        constructor(utility: ap.utility.UtilityHelper) {
            super(utility);

            this.setCodeMaxLength(50);
            this.setDescriptionMaxLength(255);

            this._displayOrder = 0;
            this._parentCellViewModel = null;

            this._listener.addEventsName(["insertrowrequested"]);
            this._actions = [
                new ap.viewmodels.home.ActionViewModel(utility, utility.EventTool, "subcell.insert", utility.rootUrl + "Images/html/icons/ic_add_black_48px.svg", true, null, "Add room level 2", true),
                new ap.viewmodels.home.ActionViewModel(utility, utility.EventTool, "subcell.delete", utility.rootUrl + "Images/html/icons/ic_delete_black_48px.svg", true, null, "Delete room level 2", !this._isMarkedToDelete)
            ];
        }

        private _displayOrder: number = 0;
        private _parentCellViewModel: ParentCellViewModel;
        private _isMarkedToDelete: boolean = false;
        private _actions: ap.viewmodels.home.ActionViewModel[];
    }
}