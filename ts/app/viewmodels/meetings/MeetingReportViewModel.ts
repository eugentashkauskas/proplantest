module ap.viewmodels.meetings {
    import documents = ap.models.documents;
    import Meeting = ap.models.meetings.Meeting;
    export class MeetingReportViewModel extends ap.viewmodels.EntityViewModel implements IDispose {

        // versionId
        public get versionId(): string {
            return this._versionId;
        }

        public set versionId(value: string) {
            this._versionId = value;
        }

        // occurrence
        public get occurrence(): number {
            return this._occurrence;
        }

        public set occurrence(value: number) {
            this._occurrence = value;
        }

        // revision
        public get revision(): number {
            return this._revision;
        }

        public set revision(value: number) {
            this._revision = value;
        }

        // sentDate
        public get sentDate(): Date {
            return this._sentDate;
        }

        public set sentDate(value: Date) {
            this._sentDate = value;
        }

        // meeting
        public get meeting(): Meeting {
            return this._meeting;
        }

        public set meeting(value: Meeting) {
            this._meeting = value;
        }

        // document
        public get document(): documents.Document {
            return this._document;
        }

        public set document(value: documents.Document) {
            this._document = value;
        }


        public get meetingReport(): ap.models.meetings.MeetingReport {
            return <ap.models.meetings.MeetingReport>this.originalEntity;
        }

        copySource(): void {
            if (this.meetingReport !== null) {
                this._versionId = this.meetingReport.VersionId;
                this._occurrence = this.meetingReport.Occurrence;
                this._revision = this.meetingReport.Revision;
                this._sentDate = this.meetingReport.SentDate;
                this._meeting = this.meetingReport.Meeting;
                this._document = this.meetingReport.Document;
            }
        }

        public postChanges() {
            if (this.meetingReport !== null) {
                this.meetingReport.VersionId = this._versionId;
                this.meetingReport.Occurrence = this._occurrence;
                this.meetingReport.Revision = this._revision;
                this.meetingReport.SentDate = this._sentDate;
                this.meetingReport.Meeting = this._meeting;
                this.meetingReport.Document = this._document;
            }
        }

        constructor(utility: utility.UtilityHelper, parentListVm?: BaseListEntityViewModel, index?: number) {
            super(utility, parentListVm, index);
        }

        private _versionId: string = null;
        private _occurrence: number = 0;
        private _revision: number = 0;
        private _sentDate: Date = null;
        private _meeting: Meeting = null;
        private _document: documents.Document = null;
    }
}