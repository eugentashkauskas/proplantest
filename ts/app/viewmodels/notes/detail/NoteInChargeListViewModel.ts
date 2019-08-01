module ap.viewmodels.notes {
    export class NoteInChargeListViewModel extends ListEntityViewModel {

        public get noteViewModel(): ap.viewmodels.notes.NoteDetailBaseViewModel {
            return this._noteViewModel;
        }

        public set noteViewModel(noteVm: ap.viewmodels.notes.NoteDetailBaseViewModel) {
            this._noteViewModel = noteVm;
            this._note = this.noteViewModel ? this._noteViewModel.noteBase : null;
            this.initCollection();
        }

        public get hasUninvitedContactOnProject(): boolean {
            return this._hasUninvitedContactOnProject;
        }

        public get hasChanged(): boolean {
            if (!this._note.NoteInCharge)
                this._note.NoteInCharge = [];

            if (this.sourceItems.length !== this._note.NoteInCharge.length)
                return true;

            // edit and added
            for (let sourceItem of this.sourceItems) {
                let sourceNoteInCharge: ap.models.notes.NoteInCharge = (<ap.viewmodels.notes.NoteInChargeViewModel>sourceItem).noteInCharge;

                let found: boolean = false;
                for (let noteInCharge of this._note.NoteInCharge) {
                    if (sourceNoteInCharge.Id === noteInCharge.Id) {
                        found = true; // the noteIncharge exist already -> we do not check for changes because a single NoteInCharge cannot be changed
                        break;
                    }
                }

                // the comment does not exist
                if (!found) {
                    return true;
                }
            }

            // removed
            for (let noteInCharge of this._note.NoteInCharge) {
                let found: boolean = false;
                for (let sourceItem of this.sourceItems) {
                    let sourceNoteInCharge: ap.models.notes.NoteInCharge = (<ap.viewmodels.notes.NoteInChargeViewModel>sourceItem).noteInCharge;
                    if (sourceNoteInCharge.Id === noteInCharge.Id) {
                        found = true;
                        break;
                    }

                }

                if (!found)
                    return true;

            }

            return false;
        }

        private initCollection(): void {
            let items: ap.viewmodels.notes.NoteInChargeViewModel[] = [];
            let self = this;

            if (this._note && this._note.NoteInCharge) {
                this._note.NoteInCharge.forEach((inCharge) => {
                    if (!self.hasUninvitedContactOnProject)
                        self._hasUninvitedContactOnProject = !inCharge.IsContactInvitedOnProject;

                    let noteInChargeVm: NoteInChargeViewModel = new NoteInChargeViewModel(this.$utility);
                    noteInChargeVm.init(inCharge);
                    items.push(noteInChargeVm);
                });
            }

            this.onLoadItems(items, false);
        }

        /**
         * This method will create and fill the list NoteInCharge from the list ContactItemViewModel make by the user
         * @param contactitems the given list ContactItemViewModel
         **/
        public fillNoteInCharge(contactitems: ap.viewmodels.projects.ContactItemViewModel[]) {
            // clear the current noteInCharge list
            this.clear();
            if (contactitems && contactitems !== null) {
                contactitems.forEach((item) => {
                    let noteInCharge: ap.models.notes.NoteInCharge = new ap.models.notes.NoteInCharge(this.$utility);
                    noteInCharge.Tag = item.displayText;
                    noteInCharge.UserId = item.userId;
                    let niVm: ap.viewmodels.notes.NoteInChargeViewModel = new ap.viewmodels.notes.NoteInChargeViewModel(this.$utility);
                    niVm.init(noteInCharge);
                    this.sourceItems.push(niVm);
                });
            }
        }

        /*
       * This method is used to post the list incharge from the vm into the note
       */
        postChanges(): void {
            let self = this;
            if (this._note && this._note.NoteInCharge && this._note.NoteInCharge !== null)
                this._note.NoteInCharge.splice(0, this._note.NoteInCharge.length);
            this.sourceItems.forEach((inchargeVm: ap.viewmodels.notes.NoteInChargeViewModel) => {
                inchargeVm.postChanges();
                if (self._note && !self._note.NoteInCharge || self._note && self._note.NoteInCharge === null) {
                    self._note.NoteInCharge = [];
                }
                if (self._note) {
                    self._note.NoteInCharge.push(inchargeVm.noteInCharge);
                }
            });
        }

        constructor(utility: ap.utility.UtilityHelper, noteVm?: ap.viewmodels.notes.NoteDetailBaseViewModel) {
            super(utility, "NoteInCharge", null, null, null);

            this._hasUninvitedContactOnProject = false;
            this.noteViewModel = noteVm;
        }

        private _noteViewModel: NoteDetailBaseViewModel;
        private _note: ap.models.notes.NoteBase;
        private _hasUninvitedContactOnProject: boolean;
    }
}