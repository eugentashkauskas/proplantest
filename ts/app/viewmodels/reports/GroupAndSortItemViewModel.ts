module ap.viewmodels.reports {
    export class GroupAndSortItemViewModel {
        public get isAscending(): boolean {
            return this._isAscending;
        }
        public set isAscending(isAscending: boolean) {
            this._isAscending = isAscending;
        }
        public get propertyName(): string {
            return this._propertyName;
        }

        /*
        * This property to set/get column def note loaf from server which will be used for generate report
        */
        public get columnDefNote(): ap.models.reports.ReportColumnDefNote {
            return this._columnDefNote;
        }

        public set columnDefNote(value: ap.models.reports.ReportColumnDefNote) {
            this._columnDefNote = value;
            this._propertyName = this._columnDefNote.PropertyName;
        }

        constructor(utility: ap.utility.UtilityHelper) {
        }

        private _isAscending: boolean = false;
        private _propertyName: string = null;
        private _columnDefNote: ap.models.reports.ReportColumnDefNote = null;
    }
}