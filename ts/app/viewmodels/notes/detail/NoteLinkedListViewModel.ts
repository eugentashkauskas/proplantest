module ap.viewmodels.notes {

    /**
    * @class
    * Class representing the linked note of a note
    */
    export class NoteLinkedListViewModel extends ListEntityViewModel implements IDispose {

        /*
        * Get the parentNoteVm of this list
        */
        public get parentNoteVm(): NoteDetailBaseViewModel {
            return this._parentNoteVm;
        }

        /*
        * Set the parentNoteVm of this list
        */
        public set parentNoteVm(newValue: NoteDetailBaseViewModel) {
            if (this._parentNoteVm !== newValue) {
                this._parentNoteVm = newValue;
            }

            this.initOriginalNote();
            this.initCollection();
        }

        /*
        * To know if the note has children notes
        */
        public get hasLinks(): boolean {
            return this._hasLinks;
        }

        /*
        * To know if the note has an origin note
        */
        public get hasOrigin(): boolean {
            return this._hasOrigin;
        }

        /*
        * Get the original note of this copy
        */
        public get originalNote(): NoteLinkedItemViewModel {
            return this._originalNote;
        }

        /*
        * Dispose the object instance
        */
        public dispose() {
            super.dispose();
        }

        /*
        * Initialize the collection of Linked notes
        */
        private initCollection() {
            this._clearItems();

            let items: NoteLinkedItemViewModel[] = [];
            if (this.parentNoteVm && this.parentNoteVm.noteBase) {
                this.$controllersManager.noteController.getLinkedNotes(this.parentNoteVm.noteBase.Id).then((linkedNotes: models.notes.NoteBase[]) => {
                    linkedNotes && linkedNotes.forEach((note: models.notes.NoteBase) => {
                        let noteItemViewModel: NoteLinkedItemViewModel = new NoteLinkedItemViewModel(this.$utility, this.$q, this, new UserCommentItemConstructorParameter(0, note, null, null, this.$utility, this.$controllersManager));
                        noteItemViewModel.init(note);
                        items.push(noteItemViewModel);
                    });
                    this.onLoadItems(items, false);
                    this._hasLinks = items.length > 0;
                });
            } else {
                this.onLoadItems(items, false);
                this._hasLinks = false;
            }
        }

        /**
        * Get the original note of this one if it's a copy
        */
        private initOriginalNote() {
            if (this.parentNoteVm && this.parentNoteVm.noteBase && this.parentNoteVm.noteBase.OriginalNoteId) {
                this.$controllersManager.noteController.getLinkedNotes(this.parentNoteVm.noteBase.OriginalNoteId, false).then((linkedNotes: models.notes.NoteBase[]) => {
                    if (linkedNotes && linkedNotes.length > 0) {
                        let noteItemViewModel: NoteLinkedItemViewModel = new NoteLinkedItemViewModel(this.$utility, this.$q, this, new UserCommentItemConstructorParameter(0, linkedNotes[0], null, null, this.$utility, this.$controllersManager));
                        noteItemViewModel.init(linkedNotes[0]);
                        this._originalNote = noteItemViewModel;
                        this._hasOrigin = true;
                    } else {
                        this._originalNote = null;
                        this._hasOrigin = false;
                    }
                });
            } else {
                this._originalNote = null;
                this._hasOrigin = false;
            }
        }

        /**
         * @constructor
         * @param $utility UtilityHelper Class
         */
        constructor($utility: utility.UtilityHelper, private $controllersManager: controllers.ControllersManager, private $q: angular.IQService, parentNoteVm?: NoteDetailBaseViewModel) {
            super($utility, "Note", undefined, undefined, undefined);

            this.parentNoteVm = parentNoteVm;
        }

        private _parentNoteVm: NoteDetailBaseViewModel;
        private _hasLinks: boolean;
        private _hasOrigin: boolean;
        private _originalNote: NoteLinkedItemViewModel;
    }
}