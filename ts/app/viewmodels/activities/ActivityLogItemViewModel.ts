module ap.viewmodels.activities {
    export class ActivityLogItemViewModel extends ap.viewmodels.EntityViewModel {

        public get originalActivityLog(): ap.models.activities.ActivityLog {
            return <ap.models.activities.ActivityLog>this.originalEntity;
        }

        public get date(): Date {
            return this._date;
        }


        public get activityType(): ap.models.activities.ActivityType {
            return this._activityType;
        }

        public get user(): ap.models.actors.User {
            return this._user;
        }

        public get userName(): string {
            if (this.user && this.user.DisplayName)
                return this.user.DisplayName;
            else
                return null;
        }

        public get userAcronym(): string {
            if (this.user && this.user.DisplayName)
                return this.user.DisplayName.acronym();
            else
                return null;
        }

        public get project(): ap.models.projects.Project {
            return this._project;
        }

        public get meeting(): ap.models.meetings.Meeting {
            return this._meeting;
        }

        public get folder(): ap.models.projects.Folder {
            return this._folder;
        }

        public get entityName(): string {
            return this._entityName;
        }

        public get activityEntityId(): string {
            return this._activityEntityId;
        }

        public get parentEntityId(): string {
            return this._parentEntityId;
        }

        /**
         * This property build the sentence to specyf when the item has been created and by who. Ex: Yesterday by John Smith
         **/
        public get dateByAuthorTitle(): string {
            return this._dateByAuthorTitle;
        }

        /**
         * This is the activity text translated in the language of the user
         **/
        public get translatedActivity(): string {
            return this._translatedActivity;
        }

        public get codeOrDescription1(): string {
            return this._codeOrDescription1;
        }

        public get codeOrDescription2(): string {
            return this._codeOrDescription2;
        }

        private getActivityTranslation() {
            switch (this._entityName) {
                case "Note":
                    this._translatedActivity = this.$utility.Translator.getTranslation("app.activity.createPoint").format(this._entityCode);
                    this._codeOrDescription1 = this._entityCode;
                    break;
                case "NoteProcessStatusHistory":
                    this._translatedActivity = this.$utility.Translator.getTranslation("app.activity.changeStatus").format(this._parentEntityDescription, this._entityDescription);
                    this._codeOrDescription1 = this._parentEntityDescription;
                    this._codeOrDescription2 = this._entityDescription;
                    break;
                case "Plan":
                    if (this._folder.FolderType !== ap.models.projects.FolderType[ap.models.projects.FolderType.Report])
                        this._translatedActivity = this.$utility.Translator.getTranslation("app.activity.uploadDocument").format(this._entityDescription);
                    else
                        this._translatedActivity = this.$utility.Translator.getTranslation("app.activity.generateReport").format(this._entityDescription);
                    this._codeOrDescription1 = this._entityDescription;
                    break;
                case "Version":
                    this._translatedActivity = this.$utility.Translator.getTranslation("app.activity.addVersion").format(this._entityDescription);
                    this._codeOrDescription1 = this._entityDescription;
                    break;
                case "NoteComment":
                    this._translatedActivity = this.$utility.Translator.getTranslation("app.activity.addComment").format(this._parentEntityCode);
                    this._codeOrDescription1 = this._parentEntityCode;
                    break;
                case "Meeting":
                    this._translatedActivity = this.$utility.Translator.getTranslation("app.activity.createMeeting").format(this._entityDescription);
                    this._codeOrDescription1 = this._entityDescription;
                    break;
            }
        }

        /**
         * This method will build the title of the comment to know who is the author and when the item has been created. Ex: Yesterday by John Smith
         **/
        private buildDateByAuthorTitle() {
            if (!!this._date && !!this.userName)
                this._dateByAuthorTitle = this.$utility.Translator.getTranslation("app.general.date_by_author").format(this.date.relativeFormat(), this.userName);
            else
                this._dateByAuthorTitle = "";
        }

        private _languageChanged() {
            this.buildDateByAuthorTitle();
            this.getActivityTranslation();
        }

        public dispose() {
            super.dispose();

            this.$utility.Translator.off("languagechanged", this._languageChanged, this);
        }

        copySource(): void {
            super.copySource();

            if (this.originalEntity) {
                this._date = this.originalActivityLog.Date;
                this._activityType = this.originalActivityLog.ActivityType;
                this._user = this.originalActivityLog.User;
                this._project = this.originalActivityLog.Project;
                this._meeting = this.originalActivityLog.Meeting;
                this._folder = this.originalActivityLog.Folder;

                this._entityName = this.originalActivityLog.EntityName;
                this._activityEntityId = this.originalActivityLog.ActivityEntityId;
                this._parentEntityId = this.originalActivityLog.ParentEntityId;
                this._parentEntityName = this.originalActivityLog.ParentEntityName;
                this._entityCode = this.originalActivityLog.EntityCode;
                this._entityDescription = this.originalActivityLog.EntityDescription;
                this._parentEntityCode = this.originalActivityLog.ParentEntityCode;
                this._parentEntityDescription = this.originalActivityLog.ParentEntityDescription;
                this._entityIsDeleted = this.originalActivityLog.EntityIsDeleted;

                this.getActivityTranslation();
                this.buildDateByAuthorTitle();
            }
            else {
                this.initData();
            }
        }

        private initData() {
            this._date = null;
            this._activityType = null;
            this._user = null;
            this._project = null;
            this._meeting = null;
            this._folder = null;

            this._entityName = null;
            this._activityEntityId = null;
            this._parentEntityId = null;
            this._parentEntityName = null;
            this._entityCode = null;
            this._entityDescription = null;
            this._parentEntityCode = null;
            this._parentEntityDescription = null;
            this._entityIsDeleted = null;

            this._translatedActivity = null;
            this._codeOrDescription1 = null;
            this._codeOrDescription2 = null;

            this.buildDateByAuthorTitle();
        }

        constructor(utility: ap.utility.UtilityHelper) {
            super(utility);
            let vm = this;
            this.$utility.Translator.on("languagechanged", this._languageChanged, vm);
            this.initData();
        }

        private _date: Date;
        private _activityType: ap.models.activities.ActivityType;
        private _user: ap.models.actors.User;
        private _project: ap.models.projects.Project;
        private _meeting: ap.models.meetings.Meeting;
        private _folder: ap.models.projects.Folder;

        private _translatedActivity: string;
        private _codeOrDescription1: string;
        private _codeOrDescription2: string;

        private _entityName: string;
        private _activityEntityId: string;
        private _parentEntityId: string;
        private _parentEntityName: string;
        private _entityCode: string;
        private _entityDescription: string;
        private _parentEntityCode: string;
        private _parentEntityDescription: string;
        private _entityIsDeleted: boolean;
        private _dateByAuthorTitle: string = "";
    }
}