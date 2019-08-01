module ap.viewmodels.projects {

    export class ParentCellViewModel extends CodeEntityViewModel {

        public get parentCell(): ap.models.projects.ParentCell {
            return <ap.models.projects.ParentCell>this.originalEntity;
        }

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
        public setValidityFromImport(isValid: boolean) {
            this._isValid = isValid;
        }

        /**
        * Method used to know if it contains duplicated children
        **/
        public get hasDuplicatedChildren(): boolean {
            return this._hasDuplicatedChildren;
        }

        public set hasDuplicatedChildren(value: boolean) {
            this._hasDuplicatedChildren = value;
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

        protected computeHasChanged(): boolean {
            if (this.code !== this.parentCell.Code || this.description !== this.parentCell.Description || this.displayOrder !== this.parentCell.DisplayOrder || this.isMarkedToDelete) {
                return true;
            } else {
                return super.computeHasChanged();
            }
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
            let deleteAction = ap.viewmodels.home.ActionViewModel.getAction(this._actions, "parentcell.delete");
            return deleteAction !== null && deleteAction.isVisible && deleteAction.isEnabled;
        }

        /**
         * Enables or disables an ability to delete the chapter
         */
        public set isRemovable(val: boolean) {
            let deleteAction = ap.viewmodels.home.ActionViewModel.getAction(this._actions, "parentcell.delete");
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
        }

        public buildProperty() {
            super.buildProperty();
            if (!this.parentCell) {
                this.initData();
            } else {
                this.code = this.parentCell.Code;
                this.description = this.parentCell.Description;
                this._displayOrder = this.parentCell.DisplayOrder;
            }
        }

        /**
         * Methode use to manage the differents actions
         **/
        public actionClicked(name: string) {
            if (name === "parentcell.insert") {
                this._listener.raise("insertrowrequested", this);
            }
            if (name === "parentcell.delete") {
                this._listener.raise("needtobeselected", this);
                this._isMarkedToDelete = true;
                this._actions[1].isVisible = false;
                this._listener.raise("parentcellupdated", this);
                this.raisePropertyChanged("delete", false, this);
            }
        }

        /**
        * Methode use to undo delete
        **/
        public undoDelete() {
            this._isMarkedToDelete = false;
            this._actions[1].isVisible = true;
            this._listener.raise("parentcellupdated", this);
            this.raisePropertyChanged("undelete", true, this);
        }

        public postChanges() {
            if (this.parentCell) {
                this.parentCell.Code = this.code;
                this.parentCell.Description = this.description;
                this.parentCell.DisplayOrder = this.displayOrder;
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
            this._listener.addEventsName(["insertrowrequested", "parentcellupdated", "needtobeselected"]);
            this._actions = [
                new ap.viewmodels.home.ActionViewModel(utility, utility.EventTool, "parentcell.insert", utility.rootUrl + "Images/html/icons/ic_add_black_48px.svg", true, null, "Add room level 1", true),
                new ap.viewmodels.home.ActionViewModel(utility, utility.EventTool, "parentcell.delete", utility.rootUrl + "Images/html/icons/ic_delete_black_48px.svg", true, null, "Delete room level 1", !this._isMarkedToDelete)
            ];
        }

        private _displayOrder: number = 0;
        private _isMarkedToDelete: boolean = false;
        private _actions: ap.viewmodels.home.ActionViewModel[];
        private _hasDuplicatedChildren: boolean = false;
    }
}