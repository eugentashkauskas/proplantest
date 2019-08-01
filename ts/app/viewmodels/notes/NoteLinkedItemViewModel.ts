module ap.viewmodels.notes {

    /**
    * @class
    * Represent an linked note of a note
    */
    export class NoteLinkedItemViewModel extends NoteItemViewModel {

        /**
        * Get the link of the note
        */
        public get link(): string {
            return this._link;
        }

        copySource(): void {
            super.copySource();

            this.buildLink();
        }

        /**
        * Build a link to be able to quickly navigate to this note in a new tab
        */
        private buildLink() {
            this._link = this.$utility.rootUrl + "?ViewNote=" + this.originalNoteBase.Id;
        }

        /**
         * @constructor
         * @param utility UtilityHelper Class
         * @param $q $q
         * @param parentListVm ParentList of the item
         * @param parameters Parameters to build each element of the list
         */
        constructor(utility: ap.utility.UtilityHelper, $q: angular.IQService, parentListVm: ap.viewmodels.BaseListEntityViewModel, protected parameters?: UserCommentItemConstructorParameter) {
            super(utility, $q, parentListVm, parameters);
        }

        private _link: string;
    }
}