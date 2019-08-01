module ap.viewmodels.meetings {
    export class MeetingViewModel extends ap.viewmodels.EntityViewModel {
        /**
        * This is the author of the meeting
        **/
        public get author(): ap.models.actors.User {
            return this._author;
        }

        public set author(user: ap.models.actors.User) {
            if (!this._author || this.author.Id !== user.Id) {
                let oldAuthor = this._author;
                this._author = user;
                this.raisePropertyChanged("author", oldAuthor, this);
            }
        }

        /**
        * Use to know if the user chan change the author
        **/
        public get canChangeAuthor(): boolean {
            return this._canChangeAuthor;
        }

        /**
        * This is the suggestion of possible author
        **/
        public get authorsList(): ap.models.actors.User[] {
            return this._authorsList;
        }

        /**
        * This is the floor of the meeting
        **/
        public get floor(): string {
            return this._floor;
        }

        public set floor(floor: string) {
            if (this._floor !== floor) {
                let oldFloor = this._floor;
                this._floor = floor;
                this.raisePropertyChanged("floor", oldFloor, this);
            }
        }

        /**
        * This is the building of the meeting
        **/
        public get building(): string {
            return this._building;
        }

        public set building(building: string) {
            if (this._building !== building) {
                let oldBuilding = this._building;
                this._building = building;
                this.raisePropertyChanged("building", oldBuilding, this);
            }
        }

        /**
        * This is the header information of the meeting
        **/
        public get header(): string {
            return this._header;
        }

        public set header(header: string) {
            if (this._header !== header) {
                let oldHeader = this._header;
                this._header = header;
                this.raisePropertyChanged("header", oldHeader, this);
            }
        }

        /**
       * This is the remarks information of the meeting
       **/
        public get remarks(): string {
            return this._remarks;
        }

        public set remarks(remarks: string) {
            if (this._remarks !== remarks) {
                let oldRemarks = this._remarks;
                this._remarks = remarks;
                this.raisePropertyChanged("remarks", oldRemarks, this);
            }
        }

        /**
       * This is the footer information of the meeting
       **/
        public get footer(): string {
            return this._footer;
        }

        public set footer(footer: string) {
            if (this._footer !== footer) {
                let oldFooter = this._footer;
                this._footer = footer;
                this.raisePropertyChanged("footer", oldFooter, this);
            }
        }

        /**
        * This is the project of the meeting
        **/
        public get project(): ap.models.projects.Project {
            return this._project;
        }

        public set project(project: ap.models.projects.Project) {
            this._project = project;
        }

        /**
        * This is the access right of the user on the meeting
        **/
        public get meetingAccessRight(): ap.models.accessRights.MeetingAccessRight {
            return this._meetingAccessRight;
        }

        public set meetingAccessRight(access: ap.models.accessRights.MeetingAccessRight) {
            this._meetingAccessRight = access;
        }

        /**
        * This is the title of the meeting
        **/
        public get title(): string {
            return this._title;
        }

        public set title(title: string) {
            if (this._title !== title) {
                let oldTitle = this._title;
                this._title = title;
                this.raisePropertyChanged("title", oldTitle, this);
                this.titleChanged();
            }

        }

        /**
        * This is the code of the meeting
        **/
        public get code(): string {
            return this._code;
        }

        public set code(code: string) {
            if (this._code !== code) {
                let oldCode = this._code;
                this._code = code;
                this.checkIsValid();
                this.raisePropertyChanged("code", oldCode, this);
            }
        }

        /**
        * This is the date of the meeting
        **/
        public get date(): Date {
            return this._date;
        }

        public set date(date: Date) {
            if (this._date !== date) {
                let oldDate = this._date;
                this._date = date;
                this.checkIsValid();
                this.raisePropertyChanged("date", oldDate, this);
            }
        }

        /**
        * This property returns the `date` property formmated
        **/
        public get dateFormatted(): string {
            if (this._date) {
                return this._date.format(DateFormat.Standard);
            }
            return "";
        }

        /**
        * To know the meeting is archived or not
        **/
        public get isArchived(): boolean {
            return this._isArchived;
        }

        public set isArchived(isArchived: boolean) {
            this._isArchived = isArchived;
        }

        /**
        * This is the occurrence number of the meeting
        **/
        public get occurrence(): number {
            return this._occurrence;
        }

        public set occurrence(occurrence: number) {
            if (this._occurrence !== occurrence) {
                let oldOccurrence: number = this._occurrence;
                this._occurrence = occurrence;
                this.checkIsValid();
                this.raisePropertyChanged("occurrence", oldOccurrence, this);
            }
        }

        /**
        * Use to know if the date enter by the user is a valid date (used in the view
        **/
        public get minDate(): Date {
            return this._minDate;
        }

        /**
        * This is the meetingAccessRightHelper
        **/
        public get meetingAccessRightHelper(): ap.models.accessRights.MeetingAccessRightHelper {
            return this._meetingAccessRightHelper;
        }

        /**
        * This is the visibleNumberingTypes for selector
        **/
        public get visibleNumberingTypes(): KeyValue<ap.models.meetings.MeetingNumberingType, string>[] {
            return this._visibleNumberingTypes;
        }

        /**
        * This is the display Meeting Occurrence for display occurrence selector
        **/
        public get displayMeetingOccurrence(): boolean {
            if (this._selectedNumberingType === ap.models.meetings.MeetingNumberingType.Sequential || this._selectedNumberingType === ap.models.meetings.MeetingNumberingType.CodeSequential) {
                return false;
            }
            return true;
        }

        /**
        * This is the selectedNumberingType for selector
        **/
        public get selectedNumberingType(): ap.models.meetings.MeetingNumberingType {
            return this._selectedNumberingType;
        }

        public set selectedNumberingType(val: ap.models.meetings.MeetingNumberingType) {
            if (val === ap.models.meetings.MeetingNumberingType.CodeOccSequential && !this._meetingAccessRightHelper.hasAccessMeetingCodeOccSeqNumber)
                throw new Error("Cannot set numbering type to CodeOccSequential - license persmission");
            if (val === ap.models.meetings.MeetingNumberingType.CodeSequential && !this._meetingAccessRightHelper.hasAccessMeetingCodeSeqNumber)
                throw new Error("Cannot set numbering type to CodeSequential - license persmission");
            if (val === ap.models.meetings.MeetingNumberingType.OccSequential && !this._meetingAccessRightHelper.hasAccessMeetingOccSeqNumber)
                throw new Error("Cannot set numbering type to OccSequential - license persmission");

            this._selectedNumberingType = val;
            this._selectedNumberingTypeFormatted = this.getNumberingTypeName(this._selectedNumberingType);
            this.raisePropertyChanged("numberingType", null, this);

        }

        /**
         * A selected numbering type represented as a string
         */
        public get selectedNumberingTypeFormatted(): string {
            return this._selectedNumberingTypeFormatted;
        }

        public get showDetailPaneBusy(): boolean {
            return this._showDetailPaneBusy;
        }

        public set showDetailPaneBusy(value: boolean) {
            this._showDetailPaneBusy = value;
        }

        /**
        * Methode use to create a new occurence
        **/
        public createNextOccurrence() {
            this.date = new Date();
            this.occurrence = this.occurrence + 1;
        }

        dispose() {
            super.dispose();
            this.utility.Translator.off("languagechanged", this.updateVisibleNumberingTypesValues, this);
        }

        /**
        * Method use to ask the user if he wants that APROPLAN change his meeting code
        **/
        private titleChanged() {
            let newCode = StringHelper.isNullOrEmpty(this.title) ? "" : this.title.slice(0, 4).toUpperCase();
            if (StringHelper.isNullOrWhiteSpace(this.code) || this.code === undefined) {
                this.code = newCode;
            }
            else if (newCode !== this.code) {
                this.mainController.showConfirm(this.$utility.Translator.getTranslation("app.meetingdetail.titleChanged"), this.$utility.Translator.getTranslation("Update list code accordingly"), (confirm) => {
                    if (confirm === ap.controllers.MessageResult.Positive) {
                        this.code = newCode;
                    }
                    else
                        this.checkIsValid();
                });
            }
            else
                this.checkIsValid();
        }

        /**
         * Converts a numbering type from an enum to a string representation
         * @param numberingType a numbering type to convert
         * @returns a name of the passed numbering type or an empty string if a numbering type is not available
         */
        protected getNumberingTypeName(numberingType: ap.models.meetings.MeetingNumberingType): string {
            if (this.originalEntity)
                for (let i = 0, len = this._visibleNumberingTypes.length; i < len; i++) {
                    if (this._visibleNumberingTypes[i].key === numberingType) {
                        return this._visibleNumberingTypes[i].value;
                    }
                }
            return "";
        }

        /**
         * This method will check if the data of the meeting viewmodel are correct to be saved.
         */
        protected checkIsValid() {
            if (!this.header) this.header = "";
            if (!this.footer) this.footer = "";
            this.setIsValid = !StringHelper.isNullOrEmpty(this.title) && !StringHelper.isNullOrEmpty(this.code) && this.date && this.date >= this.minDate &&
                this.header.length < 4000 && this.footer.length < 4000 && this._occurrence !== undefined && this._occurrence >= 0;
        }

        protected computeHasChanged() {
            return this.meeting.IsNew ||
                this.code !== this.meeting.Code ||
                this.title !== this.meeting.Title ||
                this.occurrence !== this.meeting.Occurrence ||
                this.selectedNumberingType !== this.meeting.NumberingType ||
                this.date.getTime() !== this.meeting.Date.getTime() ||
                (this.meeting.MeetingAuthor && this.author.Id !== this.meeting.MeetingAuthor.Id) ||
                (this.meeting.Floor ? this.floor !== this.meeting.Floor : !StringHelper.isNullOrEmpty(this.floor)) ||
                (this.meeting.Building ? this.building !== this.meeting.Building : !StringHelper.isNullOrEmpty(this.building)) ||
                (this.meeting.Header ? this.header !== this.meeting.Header : !StringHelper.isNullOrEmpty(this.header)) ||
                (this.meeting.Footer ? this.footer !== this.meeting.Footer : !StringHelper.isNullOrEmpty(this.footer)) ||
                (this.meeting.Remarks ? this.remarks !== this.meeting.Remarks : !StringHelper.isNullOrEmpty(this.remarks));
        }

        /**
         * A list of available actions for _computeVisibleNumberingTypesthe meeting
         */
        public get meetingActionViewModel(): MeetingActionViewModel {
            return this._meetingActionViewModel;
        }

        /**
        * This method is used to init the default data for the VM
        **/
        private initData() {
            this._author = null;
            this._floor = null;
            this._project = null;
            this._building = null;
            this._header = null;
            this._remarks = null;
            this._footer = null;
            this._meetingAccessRight = null;
            this._title = null;
            this._code = null;
            this._date = null;
            this._isArchived = false;
            this._occurrence = 0;

            this._computeVisibleNumberingTypes();
            this._selectedNumberingType = ap.models.meetings.MeetingNumberingType.Sequential;
            this._selectedNumberingTypeFormatted = this.getNumberingTypeName(this._selectedNumberingType);
        }

        public get meeting(): ap.models.meetings.Meeting {
            return <ap.models.meetings.Meeting>this.originalEntity;
        }

        copySource(): void {
            super.copySource();
            if (this.meeting && this.meeting !== null) {
                this._floor = this.meeting.Floor;
                this._project = this.meeting.Project;
                this._building = this.meeting.Building;
                this._header = this.meeting.Header;
                this._remarks = this.meeting.Remarks;
                this._footer = this.meeting.Footer;
                this._meetingAccessRight = this.meeting.UserAccessRight;
                this._title = this.meeting.TitleFormatted; // ap.models.meetings.Meeting.computeTitle(this.$utility, this.meeting);
                this._code = this.meeting.Code;
                this._date = this.meeting.Date;
                this._isArchived = this.meeting.IsArchived;
                this._occurrence = this.meeting.Occurrence;
                this._meetingAccessRightHelper = new ap.models.accessRights.MeetingAccessRightHelper(this.$utility, this.meeting, this.project);
                this._canChangeAuthor = this._meetingAccessRightHelper.canChangeAuthor;

                this._computeVisibleNumberingTypes();
                this._selectedNumberingType = this.meeting.NumberingType;
                this._selectedNumberingTypeFormatted = this.getNumberingTypeName(this._selectedNumberingType);

                this.meetingController.getMeetingAuthorSuggestions(this.meeting, this._isForDetailPanel).then((result: ap.models.actors.User[]) => {
                    this._authorsList = result;
                    this.author = this.authorsList.filter((user: ap.models.actors.User) => { return user.Id === this.meeting.MeetingAuthor.Id; })[0];
                });
                this.checkIsValid();
            }
            else
                this.initData();

            this.buildActions();
        }

        public postChanges(wasNew: boolean = false) {
            if (this.meeting) {
                this.meeting.MeetingAuthor = this.author;
                this.meeting.Floor = this.floor;
                this.meeting.Project = this.project;
                this.meeting.Building = this.building;
                this.meeting.Header = this.header;
                this.meeting.Remarks = this.remarks;
                this.meeting.Footer = this.footer;
                this.meeting.UserAccessRight = this.meetingAccessRight;
                this.meeting.Title = this.title;
                this.meeting.Code = this.code;
                this.meeting.Date = this.date;
                this.meeting.IsArchived = this.isArchived;
                this.meeting.Occurrence = this.occurrence;
                this.meeting.NumberingType = this._selectedNumberingType;
                let hasMeetingModule = this.$utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_MeetingManagement);
                let hasPrivateModule = hasMeetingModule && this.$utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_MeetingVisibility);
                if (wasNew) {
                    this.meeting.IsPublic = !hasPrivateModule;
                }
            }
        }

        /**
         * Initializes a list of available actions for the meeting
         */
        private buildActions() {
            if (this._meetingActionViewModel || !this.meeting) {
                return;
            }

            this._meetingActionViewModel = new MeetingActionViewModel(this.$utility, this.mainController, this.meetingController, this.meeting);
        }

        /**
        * This method use for compute visibleNumberingTypes
        **/
        private _computeVisibleNumberingTypes() {
            this._visibleNumberingTypes = [new KeyValue<ap.models.meetings.MeetingNumberingType, string>(ap.models.meetings.MeetingNumberingType.Sequential, this.$utility.Translator.getTranslation("app.MeetingNumberingType.Sequential"))];
            if (this._meetingAccessRightHelper) {
                if (this._meetingAccessRightHelper.hasAccessMeetingOccSeqNumber)
                    this._visibleNumberingTypes.push(new KeyValue<ap.models.meetings.MeetingNumberingType, string>(ap.models.meetings.MeetingNumberingType.OccSequential, this.$utility.Translator.getTranslation("app.MeetingNumberingType.OccSequential")));
                if (this._meetingAccessRightHelper.hasAccessMeetingCodeSeqNumber)
                    this._visibleNumberingTypes.push(new KeyValue<ap.models.meetings.MeetingNumberingType, string>(ap.models.meetings.MeetingNumberingType.CodeSequential, this.$utility.Translator.getTranslation("app.MeetingNumberingType.CodeSequential")));
                if (this._meetingAccessRightHelper.hasAccessMeetingCodeOccSeqNumber)
                    this._visibleNumberingTypes.push(new KeyValue<ap.models.meetings.MeetingNumberingType, string>(ap.models.meetings.MeetingNumberingType.CodeOccSequential, this.$utility.Translator.getTranslation("app.MeetingNumberingType.CodeOccSequential")));
            }
        }

        /**
         * Update visible numbering types' values translation when app language is changed
         */
        private updateVisibleNumberingTypesValues() {
            if (this._visibleNumberingTypes) {
                this._visibleNumberingTypes.forEach((type: KeyValue<ap.models.meetings.MeetingNumberingType, string>) => {
                    switch (type.key) {
                        case ap.models.meetings.MeetingNumberingType.Sequential:
                            type.value = this.$utility.Translator.getTranslation("app.MeetingNumberingType.Sequential");
                            break;
                        case ap.models.meetings.MeetingNumberingType.OccSequential:
                            type.value = this.$utility.Translator.getTranslation("app.MeetingNumberingType.OccSequential");
                            break;
                        case ap.models.meetings.MeetingNumberingType.CodeSequential:
                            type.value = this.$utility.Translator.getTranslation("app.MeetingNumberingType.CodeSequential");
                            break;
                        case ap.models.meetings.MeetingNumberingType.CodeOccSequential:
                            type.value = this.$utility.Translator.getTranslation("app.MeetingNumberingType.CodeOccSequential");
                            break;
                    }
                });
            }
        }

        constructor(private utility: ap.utility.UtilityHelper, protected mainController: ap.controllers.MainController, protected meetingController: ap.controllers.MeetingController, parentListVm?: ap.viewmodels.BaseListEntityViewModel, index?: number, private _isForDetailPanel: boolean = false) {
            super(utility, parentListVm, index);
            this.initData();
            this.utility.Translator.on("languagechanged", this.updateVisibleNumberingTypesValues, this);
        }
        private _canChangeAuthor: boolean = false;
        private _author: ap.models.actors.User = null;
        private _authorsList: ap.models.actors.User[] = [];
        private _floor: string;
        private _project: ap.models.projects.Project;
        private _building: string;
        private _header: string;
        private _remarks: string;
        private _footer: string;
        private _meetingAccessRight: ap.models.accessRights.MeetingAccessRight;
        private _title: string;
        private _code: string;
        private _date: Date;
        private _isArchived: boolean;
        private _occurrence: number;
        private _meetingAccessRightHelper: ap.models.accessRights.MeetingAccessRightHelper;
        private _visibleNumberingTypes: KeyValue<ap.models.meetings.MeetingNumberingType, string>[];
        private _selectedNumberingType: ap.models.meetings.MeetingNumberingType;
        private _selectedNumberingTypeFormatted: string;
        private _meetingActionViewModel: MeetingActionViewModel;
        private _minDate: Date = new Date(1950, 0, 1);
        private _showDetailPaneBusy: boolean = false;
    }
}