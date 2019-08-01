module ap.viewmodels.projects {
    export class IssueTypeNoteSubjectViewModel extends IssueTypeNoteSubjectBaseViewModel implements ap.component.dragAndDrop.IDraggableEntityViewModel {

        public get dragId() {
            return this.originalEntity.Id;
        }

        public get rowExpanded(): boolean {
            return this._rowExpanded;
        }

        public set rowExpanded(b: boolean) {
            this._rowExpanded = b;
        }

        public get issueTypeNoteSubject(): ap.models.projects.IssueTypeNoteSubject {
            return <ap.models.projects.IssueTypeNoteSubject>this.originalEntity;
        }

        public get issueTypeViewModel(): IssueTypeViewModel {
            return this._issueTypeViewModel;
        }

        public set issueTypeViewModel(issueTypeVm: IssueTypeViewModel) {
            this._issueTypeViewModel = issueTypeVm;
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
            let deleteAction = ap.viewmodels.home.ActionViewModel.getAction(this._actions, "notesubject.delete");
            return deleteAction !== null && deleteAction.isVisible && deleteAction.isEnabled;
        }

        /**
         * Enables or disables an ability to delete the chapter
         */
        public set isRemovable(val: boolean) {
            let deleteAction = ap.viewmodels.home.ActionViewModel.getAction(this._actions, "notesubject.delete");
            if (deleteAction !== null) {
                deleteAction.isVisible = false;
                deleteAction.isEnabled = false;
            }
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
            this._issueTypeViewModel = null;
        }

        public copySource() {
            super.copySource();
            if (this.issueTypeNoteSubject) {
                if (this.issueTypeNoteSubject.IssueType) {
                    this._issueTypeViewModel = new ap.viewmodels.projects.IssueTypeViewModel(this.$utility);
                    this._issueTypeViewModel.init(this.issueTypeNoteSubject.IssueType);
                } else {
                    this._issueTypeViewModel = null;
                }
            }
        }

        public postChanges() {
            super.postChanges();
        }

        /**
        * Method use to know if the view model has changed
        **/
        public get hasChanged(): boolean {
            if (this.originalEntity.IsNew && this.isMarkedToDelete) {
                return false;
            }
            if (this.subject !== this.issueTypeNoteSubject.Subject || this.displayOrder !== this.issueTypeNoteSubject.DisplayOrder || this.issueTypeNoteSubject.DefaultDescription !== this.defaultDescription || this.isMarkedToDelete) {
                return true;
            }
            return this.computeHasChanged();
        }

        /**
         * Methode use to manage the differents actions
         **/
        public actionClicked(name: string) {
            if (name === "notesubject.insert") {
                this._listener.raise("insertrowrequested", this);
            }
            if (name === "notesubject.delete") {
                this._isMarkedToDelete = true;
                this.rowExpanded = false;
                this._actions[1].isVisible = false;
                this.raisePropertyChanged("delete", true, this);
            }
        }

        /**
        * Methode use to undo delete
        **/
        public undoDelete() {
            this._isMarkedToDelete = false;
            this._actions[1].isVisible = true;
            this.raisePropertyChanged("undelete", true, this);
        }

        on(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.on(eventName, callback, caller);
        }
        off(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.off(eventName, callback, caller);
        }

        constructor(utility: ap.utility.UtilityHelper, q?: angular.IQService, parentList?: BaseListEntityViewModel, itemParameters?: ItemConstructorParameter) {
            super(utility, parentList, itemParameters);
            this._issueTypeViewModel = null;
            this._listener.addEventsName(["insertrowrequested", "deleterowrequested", "entitydropped"]);
            this._actions = [
                new ap.viewmodels.home.ActionViewModel(utility, utility.EventTool, "notesubject.insert", utility.rootUrl + "Images/html/icons/ic_add_black_48px.svg", true, null, "Add subject", true),
                new ap.viewmodels.home.ActionViewModel(utility, utility.EventTool, "notesubject.delete", utility.rootUrl + "Images/html/icons/ic_delete_black_48px.svg", true, null, "Delete subject", !this._isMarkedToDelete)
            ];
        }
        private _rowExpanded: boolean = false;
        private _issueTypeViewModel: IssueTypeViewModel;
        private _isMarkedToDelete: boolean = false;
        private _actions: ap.viewmodels.home.ActionViewModel[];
        private _moveUpAvailable: boolean = false;
        private _moveDownAvailable: boolean = false;
    }
}