module ap.viewmodels.meetings {
    import MeetingTransferredDocs = ap.models.meetings.MeetingTransferredDocs;
    export class MeetingTransferredDocsToViewModel extends ap.viewmodels.EntityViewModel implements IDispose {

        // tag
        public get tag(): string {
            return this._tag;
        }

        public set tag(value: string) {
            this._tag = value;
        }

        // userId
        public get userId(): string {
            return this._userId;
        }

        public set userId(value: string) {
            this._userId = value;
        }

        // meetingTransferredDocs
        public get meetingTransferredDocs(): MeetingTransferredDocs {
            return this._meetingTransferredDocs;
        }

        public set meetingTransferredDocs(value: MeetingTransferredDocs) {
            this._meetingTransferredDocs = value;
        }

        public get meetingTransferredDocsTo(): ap.models.meetings.MeetingTransferredDocsTo {
            return <ap.models.meetings.MeetingTransferredDocsTo>this.originalEntity;
        }

        copySource(): void {
            if (this.meetingTransferredDocsTo !== null) {
                this._tag = this.meetingTransferredDocsTo.Tag;
                this._meetingTransferredDocs = this.meetingTransferredDocsTo.MeetingTransferredDocs;
                this._userId = this.meetingTransferredDocsTo.UserId;
            }
        }

        public postChanges() {
            if (this.meetingTransferredDocsTo !== null) {
                this.meetingTransferredDocsTo.Tag = this._tag;
                this.meetingTransferredDocsTo.MeetingTransferredDocs = this._meetingTransferredDocs;
                this.meetingTransferredDocsTo.UserId = this._userId;
            }
        }

        constructor(utility: utility.UtilityHelper, parentListVm?: BaseListEntityViewModel, index?: number) {
            super(utility, parentListVm, index);
        }

        private _tag: string = null;
        private _meetingTransferredDocs: MeetingTransferredDocs = null;
        private _userId: string = null;
    }
}