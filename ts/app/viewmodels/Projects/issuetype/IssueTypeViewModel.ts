module ap.viewmodels.projects {
    export class IssueTypeViewModel extends CodeEntityViewModel implements ap.component.dragAndDrop.IDraggableEntityViewModel {

        public get issueType(): ap.models.projects.IssueType {
            return <ap.models.projects.IssueType>this.originalEntity;
        }

        public get dragId() {
            return this.originalEntity.Id;
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
        * Method used to know if it contains invalid children
        **/
        public get hasInvalidChildren(): boolean {
            return this._hasInvalidChildren;
        }

        public set hasInvalidChildren(value: boolean) {
            this._hasInvalidChildren = value;
            this.checkIsValid();
        }

        /**
         * Determines whether the issue type is valid or not
         */
        protected validate(): boolean {
            let issueTypeValidationResult = super.validate();
            return issueTypeValidationResult && !this._hasInvalidChildren;
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

        public get chapterViewModel(): ChapterViewModel {
            return this._chapterViewModel;
        }

        public set chapterViewModel(chapterVm: ChapterViewModel) {
            this._chapterViewModel = chapterVm;
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
         * Determines whether it should be possible to delete the chapter
         */
        public get isRemovable(): boolean {
            let deleteAction = ap.viewmodels.home.ActionViewModel.getAction(this._actions, "issuetype.delete");
            return deleteAction !== null && deleteAction.isVisible && deleteAction.isEnabled;
        }

        /**
         * Enables or disables an ability to delete the chapter
         */
        public set isRemovable(val: boolean) {
            let deleteAction = ap.viewmodels.home.ActionViewModel.getAction(this._actions, "issuetype.delete");
            if (deleteAction !== null) {
                deleteAction.isVisible = false;
                deleteAction.isEnabled = false;
            }
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

        protected initData() {
            super.initData();
            this._displayOrder = 0;
            this._chapterViewModel = null;
        }

        public buildProperty() {
            super.buildProperty();
            if (!this.issueType) {
                this.initData();
            } else {
                this.code = this.issueType.Code;
                this.description = this.issueType.Description;
                this._displayOrder = this.issueType.DisplayOrder;

                if (this.issueType.ParentChapter) {
                    this._chapterViewModel = new ap.viewmodels.projects.ChapterViewModel(this.$utility);
                    this._chapterViewModel.init(this.issueType.ParentChapter);
                }
                else {
                    this._chapterViewModel = null;
                }
            }
        }

        public postChanges() {
            if (this.issueType) {
                this.issueType.Code = this.code;
                this.issueType.Description = this.description;
                this.issueType.DisplayOrder = this.displayOrder;
            }
        }

        /**
        * Method use to know if the view model has changed
        **/
        public get hasChanged(): boolean {
            if (this.originalEntity.IsNew && this.isMarkedToDelete) {
                return false;
            }
            if (this.code !== this.issueType.Code || this.description !== this.issueType.Description || this.displayOrder !== this.issueType.DisplayOrder || this.isMarkedToDelete) {
                return true;
            }
            return this.computeHasChanged();
        }

        /**
        * Methode use to manage the differents actions
        **/
        public actionClicked(name: string) {
            if (name === "issuetype.insert") {
                this._listener.raise("insertrowrequested", this);
            }
            if (name === "issuetype.delete") {
                this._listener.raise("needtobeselected", this);
                this._isMarkedToDelete = true;
                this._actions[1].isVisible = false;
                this.issueTypeUpdated();
                this.raisePropertyChanged("delete", true, this);
            }
        }

        /**
        * Methode use to undo delete
        **/
        public undoDelete() {
            this._isMarkedToDelete = false;
            this._actions[1].isVisible = true;
            this.issueTypeUpdated();
            this.raisePropertyChanged("undelete", true, this);
        }

        /**
        * Methode use raise the event parentIssueTypeUpdated
        **/
        public issueTypeUpdated() {
            this._listener.raise("parentIssueTypeUpdated", this);
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

            this._listener.addEventsName(["insertrowrequested", "deleterowrequested", "parentIssueTypeUpdated", "needtobeselected", "entitydropped"]);
            this._displayOrder = 0;
            this._chapterViewModel = null;

            this._actions = [
                new ap.viewmodels.home.ActionViewModel(utility, utility.EventTool, "issuetype.insert", utility.rootUrl + "Images/html/icons/ic_add_black_48px.svg", true, null, "Add subcategory", true),
                new ap.viewmodels.home.ActionViewModel(utility, utility.EventTool, "issuetype.delete", utility.rootUrl + "Images/html/icons/ic_delete_black_48px.svg", true, null, "Delete subcategory", !this._isMarkedToDelete)
            ];
        }

        private _displayOrder: number = 0;
        private _chapterViewModel: ChapterViewModel;
        private _isMarkedToDelete: boolean = false;
        private _actions: ap.viewmodels.home.ActionViewModel[];
        private _moveUpAvailable: boolean = false;
        private _moveDownAvailable: boolean = false;
        private _hasInvalidChildren: boolean = false;
    }
}