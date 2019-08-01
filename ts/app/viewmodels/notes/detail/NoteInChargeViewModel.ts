module ap.viewmodels.notes {
    export class NoteInChargeViewModel extends EntityViewModel {
        public get displayName(): string {
            return this._displayName;
        }

        public get isInvitedOnProject(): boolean {
            return this._isInvitedOnProject;
        }

        public get tag(): string {
            return this._tag;
        }

        public get userId(): string {
            return this._userId;
        }

        public get noteInCharge(): ap.models.notes.NoteInCharge {
            return <ap.models.notes.NoteInCharge>this.originalEntity;
        }

        public copySource() {
            if (this.noteInCharge) {
                this._displayName = this.noteInCharge.Tag;
                this._tag = this.displayName;
                this._isInvitedOnProject = this.noteInCharge.IsContactInvitedOnProject;
                this._userId = this.noteInCharge.UserId;
            } else {
                this.initData();
            }
        }

        public postChanges() {
            super.postChanges();
            if (this.noteInCharge) {
                this.noteInCharge.Tag = this.tag;
                this.noteInCharge.UserId = this.userId;
            }
        }

        private initData() {
            this._tag = "";
            this._displayName = "";
            this._isInvitedOnProject = false;
            this._userId = null;
        }

        constructor(utility: ap.utility.UtilityHelper) {
            super(utility);
            this.initData();
        }

        private _displayName: string;
        private _isInvitedOnProject: boolean;
        private _tag: string;
        private _userId: string = null;
    }
}