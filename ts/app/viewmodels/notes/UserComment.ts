module ap.viewmodels.notes {
    export class UserCommentViewModel extends NoteItemViewModel {

        public originalId: string;
        public date: Date;
        public uniqueInCharge: string;
        public comment: ap.models.notes.NoteComment;

        constructor(utility: ap.utility.UtilityHelper, $q: angular.IQService, parentListVm?: ap.viewmodels.BaseListEntityViewModel, parameters?: UserCommentItemConstructorParameter) {
            super(utility, $q, parentListVm, parameters);

            this.comment = parameters ? parameters.comment : null;
            if (this.comment !== undefined && this.comment !== null) {
                this.date = this.comment.LastModificationDate;
                this._updateDateFormatted();
            }

            this.uniqueInCharge = null;
        }

        public get dateFormatted(): string {
            return this._dateFormatted;
        }

        public get id(): string {
            return this.originalId ? this.originalId.substring(0, 36) : "";
        }
    }
}