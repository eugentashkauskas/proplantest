module ap.viewmodels.notes {

    export class NoteColumnViewModel {

        /**
         * Public getter to get statusVisibility
         **/
        public get statusVisibility(): boolean {
            return this._statusVisibility;
        }

        /**
         * Public setter to set statusVisibility and update storage
         **/
        public set statusVisibility(statusVisibilityNew: boolean) {
            this._statusVisibility = statusVisibilityNew;
            this.saveToStorage("statusVisibility", statusVisibilityNew);
        }

        /**
         * Public getter to get numberVisibility
         **/
        public get numberVisibility(): boolean {
            return this._numberVisibility;
        }

        /**
         * Public setter to set numberVisibility and update storage
         **/
        public set numberVisibility(numberVisibilityNew: boolean) {
            this._numberVisibility = numberVisibilityNew;
            this.saveToStorage("numberVisibility", numberVisibilityNew);
        }

        /**
         * Public getter to get punchlistVisibility
         **/
        public get punchlistVisibility(): boolean {
            return this._punchlistVisibility;
        }

        /**
         * Public setter to set punchlistVisibility and update storage
         **/
        public set punchlistVisibility(punchlistVisibilityNew: boolean) {
            this._punchlistVisibility = punchlistVisibilityNew;
            this.saveToStorage("punchlistVisibility", punchlistVisibilityNew);
        }

        /**
         * Public getter to get subjectVisibility
         **/
        public get subjectVisibility(): boolean {
            return this._subjectVisibility;
        }

        /**
         * Public setter to set subjectVisibility and update storage
         **/
        public set subjectVisibility(subjectVisibilityNew: boolean) {
            this._subjectVisibility = subjectVisibilityNew;
            this.saveToStorage("subjectVisibility", subjectVisibilityNew);
        }

        /**
         * Public getter to get roomVisibility
         **/
        public get roomVisibility(): boolean {
            return this._roomVisibility;
        }

        /**
         * Public setter to set roomVisibility and update storage
         **/
        public set roomVisibility(roomVisibilityNew: boolean) {
            this._roomVisibility = roomVisibilityNew;
            this.saveToStorage("roomVisibility", roomVisibilityNew);
        }

        /**
         * Public getter to get dueDateVisibility
         **/
        public get dueDateVisibility(): boolean {
            return this._dueDateVisibility;
        }

        /**
         * Public setter to set dueDateVisibility and update storage
         **/
        public set dueDateVisibility(dueDateVisibilityNew: boolean) {
            this._dueDateVisibility = dueDateVisibilityNew;
            this.saveToStorage("dueDateVisibility", dueDateVisibilityNew);
        }

        /**
         * Public getter to get dueDateVisibility
         **/
        public get creationDateVisibility(): boolean {
            return this._creationDateVisibility;
        }

        /**
         * Public setter to set dueDateVisibility and update storage
         **/
        public set creationDateVisibility(creationDateVisibilityNew: boolean) {
            this._creationDateVisibility = creationDateVisibilityNew;
            this.saveToStorage("creationDateVisibility", creationDateVisibilityNew);
        }

        /**
         * Public getter to get inChargeVisibility
         **/
        public get inChargeVisibility(): boolean {
            return this._inChargeVisibility;
        }

        /**
         * Public setter to set inChargeVisibility and update storage
         **/
        public set inChargeVisibility(inChargeVisibilityNew: boolean) {
            this._inChargeVisibility = inChargeVisibilityNew;
            this.saveToStorage("inChargeVisibility", inChargeVisibilityNew);
        }

        /**
         * Public getter to get authorVisibility
         **/
        public get authorVisibility(): boolean {
            return this._authorVisibility;
        }

        /**
         * Public setter to set authorVisibility and update storage
         **/
        public set authorVisibility(authorVisibilityNew: boolean) {
            this._authorVisibility = authorVisibilityNew;
            this.saveToStorage("authorVisibility", authorVisibilityNew);
        }

        /**
         * Public getter to get listVisibility
         **/
        public get listVisibility(): boolean {
            return this._listVisibility;
        }

        /**
         * Public setter to set listVisibility and update storage
         **/
        public set listVisibility(listVisibilityNew: boolean) {
            this._listVisibility = listVisibilityNew;
            this.saveToStorage("listVisibility", listVisibilityNew);
        }

        /**
         * Public getter to get attachmentVisibility
         **/
        public get attachmentVisibility(): boolean {
            return this._attachmentVisibility;
        }

        /**
         * Public setter to set attachmentVisibility and update storage
         **/
        public set attachmentVisibility(attachmentVisibilityNew: boolean) {
            this._attachmentVisibility = attachmentVisibilityNew;
            this.saveToStorage("attachmentVisibility", attachmentVisibilityNew);
        }

        /**
         * This method is used to set all columns to true or false depends of the param value
         * @param value set to all columns, to be true or false
         */
        public selectAll(value: boolean) {
            this.statusVisibility = value;
            this.numberVisibility = value;
            this.punchlistVisibility = value;
            this.subjectVisibility = value;
            this.roomVisibility = value;
            this.dueDateVisibility = value;
            this.inChargeVisibility = value;
            this.authorVisibility = value;
            this.listVisibility = value;
            this.attachmentVisibility = value;
            this.creationDateVisibility = value;
        }

        /**
         * Stores a value of column visibility to the local storage
         * @param fieldName a name of a column
         * @param fieldVisibility an indicator of whether the column is visible of not
         */
        private saveToStorage(fieldName: string, fieldVisibility: boolean) {
            let storageKey = "notes.columnVisibility." + fieldName;
            this.$utility.Storage.Local.set(storageKey, fieldVisibility);
        }

        /**
         * Retrieves a value of column visibility from the local storage. If there is no information about the
         * given column in the storage, this column will be considered to be visible.
         * @param fieldName a name of the column
         * @returns an indicator of whether the column is visible of not
         */
        private getFromStorage(fieldName: string): boolean {
            let storageKey = "notes.columnVisibility." + fieldName;
            let fieldVisibility = this.$utility.Storage.Local.get(storageKey);
            if (fieldVisibility === null) {
                fieldVisibility = true;
            }
            return fieldVisibility;
        }

        constructor(private $utility: ap.utility.UtilityHelper) {
            this._statusVisibility = this.getFromStorage("statusVisibility");
            this._numberVisibility = this.getFromStorage("numberVisibility");
            this._punchlistVisibility = this.getFromStorage("punchlistVisibility");
            this._subjectVisibility = this.getFromStorage("subjectVisibility");
            this._roomVisibility = this.getFromStorage("roomVisibility");
            this._creationDateVisibility = this.getFromStorage("creationDateVisibility");
            this._dueDateVisibility = this.getFromStorage("dueDateVisibility");
            this._inChargeVisibility = this.getFromStorage("inChargeVisibility");
            this._authorVisibility = this.getFromStorage("authorVisibility");
            this._listVisibility = this.getFromStorage("listVisibility");
            this._attachmentVisibility = this.getFromStorage("attachmentVisibility");
        }

        private _statusVisibility: boolean;
        private _numberVisibility: boolean;
        private _punchlistVisibility: boolean;
        private _subjectVisibility: boolean;
        private _roomVisibility: boolean;
        private _dueDateVisibility: boolean;
        private _creationDateVisibility: boolean;
        private _inChargeVisibility: boolean;
        private _authorVisibility: boolean;
        private _listVisibility: boolean;
        private _attachmentVisibility: boolean;
    }
}
