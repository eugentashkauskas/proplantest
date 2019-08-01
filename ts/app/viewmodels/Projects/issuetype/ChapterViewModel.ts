module ap.viewmodels.projects {
    export class ChapterViewModel extends CodeEntityViewModel implements utility.IListener, ap.component.dragAndDrop.IDraggableEntityViewModel {

        public get chapter(): ap.models.projects.Chapter {
            return <ap.models.projects.Chapter>this.originalEntity;
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

        /**
        * Method used to know if it contains duplicated children
        **/
        public get hasInvalidChildren(): boolean {
            return this._hasInvalidChildren;
        }

        public set hasInvalidChildren(value: boolean) {
            this._hasInvalidChildren = value;
            this.checkIsValid();
        }

        /**
         * Determines whether the chapter view model is valid
         */
        protected validate(): boolean {
            let chapterValidationResult = super.validate();
            return chapterValidationResult && !this._hasInvalidChildren;
        }

        /**
        * Return true if item can be moved up
        **/
        public get moveUpAvailable() {
            return this._moveUpAvailable;
        }

        /**
        * Set visibility of moveUp action
        **/
        public set moveUpAvailable(moveUpAvailable: boolean) {
            this._moveUpAvailable = moveUpAvailable;
        }

        /**
        * Return true if item can be moved down
        **/
        public get moveDownAvailable() {
            return this._moveDownAvailable;
        }

        /**
        * Set visibility of moveDown action
        **/
        public set moveDownAvailable(moveDownAvailable: boolean) {
            this._moveDownAvailable = moveDownAvailable;
        }

        /**
        * Use to know if the chapter is marked as delete or not
        **/
        public get isMarkedToDelete(): boolean {
            return this._isMarkedToDelete;
        }

        /**
        * Use to know available actions on the item
        **/
        public get actions(): ap.viewmodels.home.ActionViewModel[] {
            return this._actions;
        }

        /**
        * Use to get the projectId of the chapterVm
        **/
        public get projectId(): string {
            return this._projectId;
        }

        /**
         * Determines whether it should be possible to delete the chapter
         */
        public get isRemovable(): boolean {
            let deleteAction = ap.viewmodels.home.ActionViewModel.getAction(this._actions, "chapter.delete");
            return deleteAction !== null && deleteAction.isVisible && deleteAction.isEnabled;
        }

        /**
         * Enables or disables an ability to delete the chapter
         */
        public set isRemovable(val: boolean) {
            let deleteAction = ap.viewmodels.home.ActionViewModel.getAction(this._actions, "chapter.delete");
            if (deleteAction !== null) {
                deleteAction.isVisible = false;
                deleteAction.isEnabled = false;
            }
        }

        protected initData() {
            super.initData();
            this._displayOrder = 0;
        }

        public buildProperty() {
            super.buildProperty();
            if (!this.chapter) {
                this.initData();
            } else {
                this._projectId = this.chapter.ProjectId;
                this.code = this.chapter.Code;
                this.description = this.chapter.Description;
                this._displayOrder = this.chapter.DisplayOrder;
            }
        }

        public postChanges() {
            if (this.chapter) {
                this.chapter.Code = this.code;
                this.chapter.Description = this.description;
                this.chapter.DisplayOrder = this.displayOrder;
            }
        }

        /**
        * Method use to know if the view model has changed
        **/
        public get hasChanged(): boolean {
            if (this.originalEntity.IsNew && this.isMarkedToDelete) {
                return false;
            }
            if (this.code !== this.chapter.Code || this.description !== this.chapter.Description || this.displayOrder !== this.chapter.DisplayOrder || this.isMarkedToDelete) {
                return true;
            }
            return this.computeHasChanged();
        }

        public get dragId() {
            return this.originalEntity.Id;
        }

        /**
         * Override method to allow drag and drop for the entity
         */
        public allowDrag() {
            return true;
        }

        /**
         * Override callback method, executed when entity is dropped
         * @param dropTarget
         */
        public drop(dropTarget: ap.component.dragAndDrop.IDraggableEntityViewModel) {
            this._listener.raise("entitydropped", new ap.component.dragAndDrop.DropEntityEvent(this, dropTarget));
            return false;
        }

        /**
        * Methode use to manage the differents actions
        **/
        public actionClicked(name: string) {
            if (name === "chapter.insert") {
                this._listener.raise("insertrowrequested", this);
            }
            if (name === "chapter.delete") {
                this._listener.raise("needtobeselected", this);
                this._isMarkedToDelete = true;
                this._actions[1].isVisible = false;
                this._listener.raise("parentchapterupdated", this);
                this.raisePropertyChanged("delete", true, this);
            }
        }

        /**
        * Methode use to undo delete
        **/
        public undoDelete() {
            this._isMarkedToDelete = false;
            this._actions[1].isVisible = true;
            this._listener.raise("parentchapterupdated", this);
            this.raisePropertyChanged("undelete", true, this);
        }

        /**
        * This method use for disabled all actions
        **/
        public disableActions() {
            this._actions.forEach((action) => {
                action.isEnabled = false;
            });
        }

        /**
        * This method use for enabled all actions
        **/
        public enableActions() {
            this._actions.forEach((action) => {
                action.isEnabled = true;
            });
        }

        on(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.on(eventName, callback, caller);
        }
        off(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.off(eventName, callback, caller);
        }

        constructor(utility: ap.utility.UtilityHelper, q?: angular.IQService, parentList?: BaseListEntityViewModel, itemParameters?: ItemConstructorParameter) {
            super(utility, parentList, itemParameters);

            this.setCodeMaxLength(50);
            this.setDescriptionMaxLength(255);

            this._listener.addEventsName(["insertrowrequested", "deleterowrequested", "parentchapterupdated", "needtobeselected", "entitydropped"]);
            this._displayOrder = 0;

            this._actions = [
                new ap.viewmodels.home.ActionViewModel(utility, utility.EventTool, "chapter.insert", utility.rootUrl + "Images/html/icons/ic_add_black_48px.svg", true, null, "Add category", true),
                new ap.viewmodels.home.ActionViewModel(utility, utility.EventTool, "chapter.delete", utility.rootUrl + "Images/html/icons/ic_delete_black_48px.svg", true, null, "Delete category", !this._isMarkedToDelete)
            ];
        }

        private _displayOrder: number = 0;
        private _isMarkedToDelete: boolean = false;
        private _actions: ap.viewmodels.home.ActionViewModel[];
        private _projectId: string = null;
        private _moveUpAvailable: boolean = false;
        private _moveDownAvailable: boolean = false;
        private _hasInvalidChildren: boolean = false;
    }
}
