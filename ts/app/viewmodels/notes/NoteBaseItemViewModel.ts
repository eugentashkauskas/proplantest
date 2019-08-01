module ap.viewmodels.notes {
    export class NoteBaseItemViewModel extends ap.viewmodels.EntityViewModel implements IDispose {

        public originalId: string;
        public uniqueInCharge: string;
        public codeNum: string;
        public date: Date;
        public subject: string;
        public from: string;
        public inCharge: string;
        public inChargeList: ap.models.notes.NoteInCharge[];
        public creationDate: Date;
        public dueDate: Date;
        public meetingAccessRight: ap.models.accessRights.MeetingAccessRight;
        public readOnly: boolean;
        public important: boolean;
        public code: string;
        public isArchived: boolean; // To know the point was archived or not
        public isRemoved: boolean; // To know the point was removed from the list (inclued deleted point or archived point on the active list)
        public isMoved: boolean; // To know the point was moved
        public meetingName: string;
        public comment: ap.models.notes.NoteComment;


        public get canChecked(): boolean {
            return !this.isMoved && !this.originalEntity.Deleted && ap.utility.UtilityHelper.createEmptyGuid() !== this.originalId;
        }

        public get id(): string {
            return this.originalId ? this.originalId.substring(0, 36) : "";
        }

        public get dateFormatted(): string {
            return this._dateFormatted;
        }

        public get creationDateFormatted(): string {
            return this._creationDateFormatted;
        }

        public get dueDateFormatted(): string {
            return this._dueDateFormatted;
        }

        public get hasAttachment(): boolean {
            return this._hasAttachment;
        }

        public set hasAttachment(hasAttachment: boolean) {
            this._hasAttachment = hasAttachment;
        }

        public get isRead(): boolean {
            return this.originalNoteBase && this.originalNoteBase.IsRead;
        }
        /**
         * This is the original note base used to build the view model
         **/
        public get originalNoteBase(): ap.models.notes.NoteBase {
            return <ap.models.notes.NoteBase>this.originalEntity;
        }

        /**
         * This method returns the value of of the item for a specific group field. 
         * @param groupName This is the name if the group: Date, DueDate, SubCategory, InCharge, None
         */
        public getGroupValue(groupName: string): string {
            if (StringHelper.isNullOrEmpty(groupName))
                return "";
            switch (groupName) {
                case "Date":
                    return this._getDateGroupName(false);
                case "DueDate":
                    return this._getDateGroupName(true);
                case "SubCategory":
                    return this._getSubCategoryGroupName();
                case "InCharge":
                    return this._getInChargeGroupName();
                case "None":
                    return "";
            }
            return "";
        }

        /**
         * This method return the value of the user in charge field of the item to build the group based on user in charge
         */
        private _getInChargeGroupName(): string {
            let groupName: string = "Nobody";

            if (this.uniqueInCharge) {
                groupName = this.uniqueInCharge;
            }

            return groupName;
        }

        /**
         * This getter is used to get value of private property category
         */
        public get category(): string {
            return this._category;
        }

        /**
         * This setter is used to set value of private property category
         */
        public set category(value: string) {
            this._category = value;
        }

        /**
         * This getter is used to get value of private property parentCategory
         */
        public get parentCategory(): string {
            return this._parentCategory;
        }

        /**
         * This setter is used to set value of private property parentCategory
         */
        public set parentCategory(value: string) {
            this._parentCategory = value;
        }

        /**
         * This getter is used to get value of private property subCategory
         */
        public get subCategory(): string {
            return this._subCategory;
        }

        /**
         * This setter is used to set value of private property subCategory
         */
        public set subCategory(value: string) {
            this._subCategory = value;
        }

        /**
         * This method return the value of a group depending of the date or due date of the item.
         * @param isDueDate To know if the group is build on the due date or date field of the item. 
         */
        protected _getDateGroupName(isDueDate: boolean = false): string {
            let date = isDueDate ? this.dueDate : this.date;
            if (!date)
                return isDueDate ? "No due date" : "No date";
            let dateShortcut: DateShortcut = date.getDateShortcut();
            let groupName: string;

            switch (dateShortcut) {
                case DateShortcut.ThisMonth:
                    groupName = "app.dateshortcut.ThisMonth";
                    break;
                case DateShortcut.ThisYear:
                    groupName = "app.dateshortcut.ThisYear";
                    break;
                case DateShortcut.LastMonth:
                    groupName = "app.dateshortcut.LastMonth";
                    break;
                case DateShortcut.LastYear:
                    groupName = "app.dateshortcut.LastYear";
                    break;
                case DateShortcut.LastWeek:
                    groupName = "app.dateshortcut.LastWeek";
                    break;
                case DateShortcut.ThisWeek:
                    groupName = isDueDate ? "app.dateshortcut.due.ThisWeek" : "app.dateshortcut.ThisWeek";
                    break;
                case DateShortcut.Older:
                    groupName = "app.dateshortcut.Older";
                    break;
                case DateShortcut.Today:
                    groupName = isDueDate ? "app.dateshortcut.due.Today" : "app.dateshortcut.Today";
                    break;
                case DateShortcut.Yesterday:
                    groupName = "app.dateshortcut.Yesterday";
                    break;
                case DateShortcut.Tomorrow:
                    groupName = isDueDate ? "app.dateshortcut.due.Tomorrow" : "app.dateshortcut.Tomorrow";
                    break;
                case DateShortcut.Newer:
                    groupName = isDueDate ? "app.dateshortcut.due.Newer" : "app.dateshortcut.Newer";
                    break;
                case DateShortcut.NextMonth:
                    groupName = isDueDate ? "app.dateshortcut.due.NextMonth" : "app.dateshortcut.NextMonth";
                    break;
                case DateShortcut.NextWeek:
                    groupName = isDueDate ? "app.dateshortcut.due.NextWeek" : "app.dateshortcut.NextWeek";
                    break;
                case DateShortcut.NextYear:
                    groupName = isDueDate ? "app.dateshortcut.due.NextYear" : "app.dateshortcut.NextYear";
                    break;
                default: groupName = "";
                    break;
            }

            return groupName;
        }

        /**
         * This method return the value of the issue type and parent of the item to build the group based on subcategory
         */
        protected _getSubCategoryGroupName(): string {
            let groupName: string = "";

            if (this.originalNoteBase.IssueType) {
                groupName = "(" + this.originalNoteBase.IssueType.ParentChapter.Code + ") " + this.originalNoteBase.IssueType.ParentChapter.Description + " / " + "(" + this.originalNoteBase.IssueType.Code + ") " + this.originalNoteBase.IssueType.Description;
            } else {
                groupName = "No category";
            }

            return groupName;
        }

        copySource(): void {
            super.copySource();
            this.$utility.Translator.off("languagechanged", this.generateMeetingName, this);
            if (this.originalEntity !== null) {

                if (this.originalNoteBase.MeetingAccessRight) {
                    this.meetingAccessRight = this.originalNoteBase.MeetingAccessRight;
                }

                this.codeNum = this.originalNoteBase.CodeNum;
                this.code = this.originalNoteBase.Code;
                this.subject = this.originalNoteBase.Subject;
                this.creationDate = this.originalNoteBase.Date;
                this.dueDate = this.originalNoteBase.DueDate;
                this.readOnly = this.originalNoteBase.IsReadOnly;
                this.important = this.originalNoteBase.IsUrgent;
                this.isArchived = this.originalNoteBase.IsArchived;
                this._hasAttachment = this.originalNoteBase.HasAttachment;
                if (this.dueDate)
                    this._dueDateFormatted = this.dueDate.format(DateFormat.Standard);
                else
                    this._dueDateFormatted = "";

                if (this.creationDate) {
                    this._creationDateFormatted = this.creationDate.format(DateFormat.Standard);
                }
                this._updateDateFormatted();

                if (this.originalNoteBase.Meeting) {
                    this.meetingName = this.originalNoteBase.Meeting.TitleFormatted;
                    if (this.originalNoteBase.Meeting.IsSystem) {
                        this.$utility.Translator.on("languagechanged", this.generateMeetingName, this);
                    }
                }

                if (this.originalNoteBase.From !== undefined && this.originalNoteBase.From !== null && this.originalNoteBase.From.Person !== undefined &&
                    this.originalNoteBase.From.Person !== null) {
                    this.from = this.originalNoteBase.From.Person.Name;
                }

                if (this.originalNoteBase.IssueType !== undefined && this.originalNoteBase.IssueType !== null &&
                    this.originalNoteBase.IssueType.ParentChapter !== undefined && this.originalNoteBase.IssueType.ParentChapter !== null) {
                    this.category = this.originalNoteBase.IssueType.ParentChapter.Code + "/" + this.originalNoteBase.IssueType.Code;
                    this.parentCategory = this.originalNoteBase.IssueType.ParentChapter.Code;
                    this.subCategory = this.originalNoteBase.IssueType.Code;
                } else {
                    this.category = ""; // clear the category field if the note is updated with an empty category
                    this.parentCategory = "";
                    this.subCategory = "";
                }

                this.inChargeList = this.originalNoteBase.NoteInCharge || [];
                this.inCharge = this.inChargeList.map((item: ap.models.notes.NoteInCharge) => {
                    return item.Tag;
                }).join(", ");
            }
        }

        private generateMeetingName() {
            this.meetingName = this.$utility.Translator.getTranslation(this.originalNoteBase.Meeting.Title);
        }

        /**
         * Calculates a formatted value of the date property
         */
        protected _updateDateFormatted() {
            if (this.date) {
                let dateShortcut: DateShortcut = this.date.getDateShortcut();
                switch (dateShortcut) {
                    case DateShortcut.Today:
                        this._dateFormatted = "app.dateshortcut.Today";
                        break;
                    case DateShortcut.Yesterday:
                        this._dateFormatted = "app.dateshortcut.Yesterday";
                        break;
                    default:
                        this._dateFormatted = this.date.format(DateFormat.Standard);
                }
            } else {
                this._dateFormatted = "";
            }
        }

        public dispose() {

        }

        constructor(protected utility: ap.utility.UtilityHelper, protected $q: angular.IQService, parentListVm: ap.viewmodels.BaseListEntityViewModel, protected parameters?: UserCommentItemConstructorParameter) {
            super(utility, parentListVm, parameters ? parameters.itemIndex : null);
            this._controllers = parameters ? parameters.controllersManager : null;

            if (!this._controllers || !this._controllers.projectController)
                throw new Error("Argument projectController cannot be null");

            this.comment = parameters ? parameters.comment : null;
            if (this.comment !== undefined && this.comment !== null) {
                this.date = this.comment.LastModificationDate;
                this._updateDateFormatted();
            }
            this.uniqueInCharge = null;
        }

        protected _controllers: ap.controllers.ControllersManager;
        protected _dueDateFormatted: string;
        protected _creationDateFormatted: string;
        protected _dateFormatted: string;
        protected _hasAttachment: boolean;

        private _category: string;
        private _parentCategory: string;
        private _subCategory: string;
    }

}