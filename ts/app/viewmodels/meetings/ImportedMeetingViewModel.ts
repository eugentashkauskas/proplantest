module ap.viewmodels.meetings {

    export class ImportedMeetingViewModel extends ap.viewmodels.EntityViewModel {

        public get originalMeeting() {
            return <ap.models.meetings.Meeting>this.originalEntity;
        }

        /**
         * Public property title
         */
        public get title(): string {
            return this._title;
        }

        /**
         * Public property code
         */
        public get code(): string {
            return this._code;
        }

        /**
         * Public property numberingType
         */
        public get numberingType(): ap.models.meetings.MeetingNumberingType {
            return this._numberingType;
        }

        /**
         * Public property visibleNumberingType
         */
        public get visibleNumberingType(): string {
            return this._visibleNumberingType;
        }

        /**
         * Public property floor
         */
        public get floor(): string {
            return this._floor;
        }

        /**
         * Public property building
         */
        public get building(): string {
            return this._building;
        }

        /**
         * Public property header
         */
        public get header(): string {
            return this._header;
        }

        /**
         * Public property footer
         */
        public get footer(): string {
            return this._footer;
        }

        /**
         * Public property error
         */
        public get error(): string {
            return this._error;
        }

        /**
         * Public set property isValid
         */
        public set setIsValid(val: boolean) {
            this._isValid = val;
        }

        /**
         * Public set property error
         */
        public set error(errorValue: string) {
            this._error = errorValue;
        }

        /**
         * public method is used to make short title from title
         */
        public shortTitle(): string {
            return this.title.length > 12 ? this.title.slice(0, 12) + "..." : this.title;
        }

        /**
         * Private method compute private property visibleNumberingType
         */
        private computeVisibleNumberingType() {
            switch (this._numberingType) {
                    case ap.models.meetings.MeetingNumberingType.Sequential:
                        this._visibleNumberingType = this.$utility.Translator.getTranslation("app.MeetingNumberingType.Sequential");
                        break;
                    case ap.models.meetings.MeetingNumberingType.OccSequential:
                        this._visibleNumberingType = this.$utility.Translator.getTranslation("app.MeetingNumberingType.OccSequential");
                        break;
                    case ap.models.meetings.MeetingNumberingType.CodeSequential:
                        this._visibleNumberingType = this.$utility.Translator.getTranslation("app.MeetingNumberingType.CodeSequential");
                        break;
                    case ap.models.meetings.MeetingNumberingType.CodeOccSequential:
                        this._visibleNumberingType = this.$utility.Translator.getTranslation("app.MeetingNumberingType.CodeOccSequential");
                        break;
                }
        }

        /**
         * This function is used to update the ViewModel's properties with the entity
         */
        public copySource() {
            this._title = this.originalMeeting.Title;
            this._code = this.originalMeeting.Code;
            this._numberingType = this.originalMeeting.NumberingType;
            this._floor = this.originalMeeting.Floor;
            this._building = this.originalMeeting.Building;
            this._header = this.originalMeeting.Header;
            this._footer = this.originalMeeting.Floor;
            if (this._numberingType || this._numberingType === 0) {
                this.computeVisibleNumberingType();
            }
        }

        constructor(protected $utility: utility.UtilityHelper) {
            super($utility);
        }

        private _title: string;
        private _code: string;
        private _numberingType: ap.models.meetings.MeetingNumberingType;
        private _floor: string;
        private _building: string;
        private _header: string;
        private _footer: string;
        private _visibleNumberingType: string;
        private _error: string;
    }
}