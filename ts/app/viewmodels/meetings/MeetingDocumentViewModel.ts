module ap.viewmodels.meetings {
    import documents = ap.models.documents;
    import Meeting = ap.models.meetings.Meeting;
    export class MeetingDocumentViewModel extends ap.viewmodels.EntityViewModel implements IDispose {

        // meeting
        public get meeting(): Meeting {
            return this._meeting;
        }

        public set meeting(value: Meeting) {
            this._meeting = value;
        }

        // displayOrder
        public get displayOrder(): number {
            return this._displayOrder;
        }

        public set displayOrder(value: number) {
            this._displayOrder = value;
        }

        // document
        public get document(): documents.Document {
            return this._document;
        }

        public set document(value: documents.Document) {
            this._document = value;
        }

        public get meetingDocument(): ap.models.meetings.MeetingDocument {
            return <ap.models.meetings.MeetingDocument>this.originalEntity;
        }

        copySource(): void {
            if (this.meetingDocument !== null) {
                this._displayOrder = this.meetingDocument.DisplayOrder;
                this._meeting = this.meetingDocument.Meeting;
                this._document = this.meetingDocument.Document;
            }
        }

        public postChanges() {
            if (this.meetingDocument !== null) {
                this.meetingDocument.DisplayOrder = this._displayOrder;
                this.meetingDocument.Meeting = this._meeting;
                this.meetingDocument.Document = this._document;
            }
        }

        constructor(utility: utility.UtilityHelper, parentListVm?: BaseListEntityViewModel, index?: number) {
            super(utility, parentListVm, index);
        }

        private _displayOrder: number = 0;
        private _meeting: Meeting = null;
        private _document: documents.Document = null;
    }
}