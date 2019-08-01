module ap.viewmodels.meetings {

    /**
     * This class is the parameter needed to create an item DocumentItemViewModel
     **/
    export class MeetingItemParameter extends ItemConstructorParameter {
        public get mainController(): ap.controllers.MainController {
            return this.$mainController;
        }

        public get meetingController(): ap.controllers.MeetingController {
            return this.$meetingController;
        }

        constructor(itemIndex: number, dataSource: any, pageDesc: PageDescription, parameters: LoadPageSuccessHandlerParameter, utility: ap.utility.UtilityHelper, private $mainController: ap.controllers.MainController, private $meetingController: ap.controllers.MeetingController) {
            super(itemIndex, dataSource, pageDesc, parameters, utility);
        }
    }

    export class MeetingItemViewModel extends ap.viewmodels.EntityViewModel implements IDispose {
        /**
        * This is the author of the meeting
        **/
        public authorName: string;
        /**
        * This is the title of the meeting
        **/
        public title: string;
        /**
        * This is the code of the meeting
        **/
        public code: string;
        /**
        * This is the date of the meeting
        **/
        public date: Date;
        /**
        * This is the number of note on this meeting
        **/
        public notesCount: number = -1;
        /**
        * This is the number of participant on this meeting
        **/
        public participantsCount: number = -1;
        /**
        * This is the number of meeting document on this meeting
        **/
        public documentsCount: number = -1;
        /**
        * To know that the user has the access to the create next meeting or not
        **/
        public hasAccessCreateNextMeeting: boolean;

        /**
        * To know the meeting is archived or not
        **/
        public isArchived: boolean;

        /**
         * This is the code with a Max size of 3 chars and for System public meeting, the result is PuL and for the private system, the result is PrL. Else equals to null.
         **/
        public get shortened(): string {
            if (!StringHelper.isNullOrWhiteSpace(this.code)) {
                if (this.originalEntity && this.meeting.IsSystem) {
                    if (this.meeting.IsPublic) return "PuL";
                    else
                        return "PrL";
                }
                if (this.code.length > 3)
                    return this.code.slice(0, 3);
                return this.code;
            }
            return null;
        }

        public get dateFormatted(): string {
            return this._dateFormatted;
        }

        /**
        * To know that the user has the right to create next meeting
        **/
        public canCreateNextMeeting: boolean;

        public get meeting(): ap.models.meetings.Meeting {
            return <ap.models.meetings.Meeting>this.originalEntity;
        }

        /**
         * A view model to manage actions of the meeting
         */
        public get meetingActionViewModel(): MeetingActionViewModel {
            return this._meetingActionViewModel;
        }

        /** 
         * To know if the item set system - chapter cannot be selected
         * Example: item for Create new item
         **/
        public get isSystemEntity(): boolean {
            return this._isSystemEntity;
        }

        copySource(): void {
            super.copySource();
            if (this.meeting && this.meeting !== null) {
                this.code = this.meeting.Code;

                this.date = this.meeting.Date;
                if (this.date)
                    this._dateFormatted = this.date.format(DateFormat.Standard);
                else
                    this._dateFormatted = "";

                if (this.meeting.MeetingAuthor)
                    this.authorName = this.meeting.MeetingAuthor.DisplayName;
                else
                    this.authorName = "";

                this.title = this.meeting.TitleFormatted; // ap.models.meetings.Meeting.computeTitle(this.$utility, this.meeting);
                this.isArchived = this.meeting.IsArchived;

                this.hasAccessCreateNextMeeting = this.$utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_CreateNextMeeting)
                    && !this.meeting.IsSystem
                    && (this.meeting.NumberingType === ap.models.meetings.MeetingNumberingType.OccSequential || this.meeting.NumberingType === ap.models.meetings.MeetingNumberingType.CodeOccSequential);
                this.canCreateNextMeeting = this.meeting.UserAccessRight && this.meeting.UserAccessRight !== null && this.meeting.UserAccessRight.CanCreateNextMeeting;

                this.computeTitle();
                if (this.meeting.IsPublic && !this.meeting.MeetingAuthor && this._parameters && this._parameters.mainController.currentProject())
                    // a check is made to verify there is a project in the MainController because it can be undefined in case the user switches projects quickly
                    this.authorName = this._parameters.mainController.currentProject().Creator.DisplayName;
            } else {
                this.initData();
            }

            this.buildActions();
        }

        /**
         * Builds a list of available actions for a meeting
         */
        private buildActions() {
            if (this._meetingActionViewModel || !this.meeting || !this._parameters) {
                return;
            }

            this._meetingActionViewModel = new MeetingActionViewModel(this.$utility, this._parameters.mainController, this._parameters.meetingController, this.meeting);
        }

        private computeTitle() {
            this.title = !!this.meeting && this.meeting.TitleFormatted; // ap.models.meetings.Meeting.computeTitle(this.$utility, this.meeting);
            if (this.meeting.IsSystem) {
                if (this._parameters !== null) {
                    let currentProject = this._parameters.mainController.currentProject();
                    this.title = this.$utility.Translator.getTranslation("app.list_of_project").format(this.title, "({0}) {1}".format(currentProject ? currentProject.Code : "", currentProject ? currentProject.Name : ""));
                }
            }
        }

        /**
        * This method will called when the lanuguage of the user was changed
        **/
        private languageChanged() {
            this.computeTitle();
        }
        /**
        * This method is used to init the default data for the VM
        **/
        private initData() {
            this.code = null;
            this.date = null;
            this._dateFormatted = "";
            this.authorName = null;
            this.notesCount = -1;
            this.participantsCount = -1;
            this.documentsCount = -1;
            this.title = null;
            this.hasAccessCreateNextMeeting = false;
            this.canCreateNextMeeting = false;
        }

        public dispose() {
            super.dispose();
            this.$utility.Translator.off("languagechanged", this.languageChanged, this);
            if (this._parameters && this._parameters.meetingController) {
                this._parameters.meetingController.off("meetingarchived", this.refreshMeeting, this);
                this._parameters.meetingController.off("meetingunarchived", this.refreshMeeting, this);
            }
            if (this._meetingActionViewModel) {
                this._meetingActionViewModel.dispose();
            }
        }

        /**
        * This method use for refresh viewModel after update
        **/
        private refreshMeeting(meetingUpdatedEventArgs: ap.controllers.EntityUpdatedEvent<ap.models.meetings.Meeting>) {
            if (meetingUpdatedEventArgs && meetingUpdatedEventArgs.entity && meetingUpdatedEventArgs.entity !== null) {
                if (meetingUpdatedEventArgs.entity.Id === this.meeting.Id) {
                    this.init(meetingUpdatedEventArgs.entity);
                }
            }
        }

        constructor(utility: ap.utility.UtilityHelper, q: angular.IQService, parentListVm?: ap.viewmodels.BaseListEntityViewModel, parameters?: ItemConstructorParameter, private _isSystemEntity: boolean = false) {
            super(utility, parentListVm, parameters ? parameters.itemIndex : null);
            if (parameters && parameters instanceof MeetingItemParameter) {
                this._parameters = <MeetingItemParameter>parameters;
            }
            else
                this._parameters = null;

            let vm = this;
            if (this._parameters && this._parameters.meetingController) {
                this._parameters.meetingController.on("meetingarchived", this.refreshMeeting, this);
                this._parameters.meetingController.on("meetingunarchived", this.refreshMeeting, this);
            }
            this.$utility.Translator.on("languagechanged", this.languageChanged, vm);
            this.initData();
        }

        private _parameters: MeetingItemParameter;
        private _dateFormatted: string;
        private _meetingActionViewModel: MeetingActionViewModel;
    }
}