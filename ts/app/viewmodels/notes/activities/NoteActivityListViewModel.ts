module ap.viewmodels.notes {
    export class NoteActivityListViewModel implements IDispose {

        public get noteViewModel(): ap.viewmodels.notes.NoteDetailBaseViewModel {
            return this._noteViewModel;
        }

        public set noteViewModel(noteVm: ap.viewmodels.notes.NoteDetailBaseViewModel) {
            if (this._noteViewModel !== noteVm) {
                this._noteViewModel = noteVm;
                this._loadList();
            }
        }

        /**
         * This method is to force the refresh of the list
         **/
        public refresh() {
            this._loadList();
        }

        /**
         * This method make the load of the activities corresponding to the note of the noteDetailViewModel
         **/
        private _loadList() {
            if (this._noteViewModel && this._noteViewModel.noteBase && !this._noteViewModel.noteBase.IsNew && this._noteViewModel.noteBase.Id) {

                let filter: string = "Filter.Eq(ParentEntityGuid, " + this._noteViewModel.noteBase.Id + ")";
                this.listVm.onLoadItems(null);
                this.listVm.loadPage(0, filter).then(() => {
                    this._isLoaded = this.listVm.isLoaded;
                });
            } else if (!this.noteViewModel || !this._noteViewModel.noteBase) {
                // clear the list is the parent vm is null
                this.listVm.clear();
            }
        }

        public dispose() {
            if (this.listVm) {
                this.listVm.off("pageloaded", this.handlePageLoaded, this);
                this.listVm.dispose();
            }
            this._controllersManager.noteController.off("notestatusupdated", this.handleNoteModifications, this);
            this._controllersManager.noteController.off("commentsaved", this.handleNoteModifications, this);
            this._controllersManager.noteController.off("documentdeleted", this.handleNoteModifications, this);
        }

        /**
         * This public getter is used to get private property activityItems
         **/
        public get activityItems(): IEntityViewModel[] {
            return this._activityItems;
        }

        /**
         * This public setter is used to set private property activityItems
         **/
        public set activityItems(val: IEntityViewModel[]) {
            this._activityItems = val;
        }

        /**
         * This public getter is used to get private property displayItems
         **/
        public get displayItems(): IEntityViewModel[] {
            return this._displayItems;
        }

        /**
         * This public setter is used to set private property displayItems
         **/
        public set displayItems(val: IEntityViewModel[]) {
            this._displayItems = val;
        }

        /**
         * This public getter is used to get private property isLoaded
         **/
        public get isLoaded(): boolean {
            return this._isLoaded;
        }

        /**
         * This private method is used to update displayItems
         **/
        public updateDisplayItems() {
            this.listVm.loadNextPage().then(() => {
                this._isLoaded = this.listVm.isLoaded;
            });
        }

        /**
         * This private method is used to handle pageloaded event
         * @param itemList List of loaded items
         **/
        private handlePageLoaded(itemList: IEntityViewModel[]) {
            this.displayItems.push(...itemList);
        }

        /**
         * When the point is updated (status, comment, document...), we need to refresh the list
         **/
        private handleNoteModifications() {
            this.refresh();
        }

        constructor(private _utility: ap.utility.UtilityHelper, private _api: ap.services.apiHelper.Api, private $q: angular.IQService, private _controllersManager: ap.controllers.ControllersManager, noteVm?: ap.viewmodels.notes.NoteDetailBaseViewModel) {
            let pathToLoad: string = "User";
            let defaultFilter: string = "Filter.Eq(ParentEntityName, Note))";

            let vm = this;
            this._controllersManager.noteController.on("notestatusupdated", vm.handleNoteModifications, vm);
            this._controllersManager.noteController.on("commentsaved", vm.handleNoteModifications, vm);
            this._controllersManager.noteController.on("documentdeleted", vm.handleNoteModifications, vm);

            this.listVm = new GenericPagedListViewModels(this._utility, this._controllersManager.listController, this.$q, new GenericPagedListOptions("ActivityLog", ap.viewmodels.activities.ActivityLogItemViewModel, pathToLoad, "date", 10), defaultFilter);
            this.listVm.on("pageloaded", this.handlePageLoaded, this);
            this.listVm.isDeferredLoadingMode = true;
            this.noteViewModel = noteVm;
        }

        public listVm: ap.viewmodels.GenericPagedListViewModels = null;

        private _noteViewModel: ap.viewmodels.notes.NoteDetailBaseViewModel = null;
        private _activityItems: IEntityViewModel[] = [];
        private _displayItems: IEntityViewModel[] = [];
        private _displayItemsCount: number = 10;
        private _isLoaded: boolean = false;
    }
}