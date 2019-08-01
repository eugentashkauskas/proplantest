module ap.viewmodels.notes {
    export class NoteCommentViewModel extends EntityViewModel {

        public actions: ap.viewmodels.home.ActionViewModel[];

        public get comment(): string {
            return this._comment;
        }

        public set comment(value: string) {
            if (this._comment !== value) {
                this._comment = value;

                this.isDisabled = (StringHelper.isNullOrEmpty(this._comment) || StringHelper.isNullOrWhiteSpace(this._comment)) && this.isEditMode;
            }
        }
        /**
         * To know if the comment is archived or not
         **/
        public get isArchived(): boolean {
            return this._isArchived;
        }

        public set isArchived(val: boolean ) {
            this._isArchived = val;
        }

        public get isFirstComment(): boolean {
            return this._isFirstComment;
        }

        public get numComment(): string {
            return this._number;
        }

        public get hasNumber(): boolean {
            return this._hasNumber;
        }

        public get fromDisplayName(): string {
            return this._fromDisplayName;
        }

        public get canArchive(): boolean {
            return this._canArchive;
        }

        public get canUnarchive(): boolean {
            return this._canUnarchive;
        }

        public get canEdit(): boolean {
            return this._canEdit;
        }

        public get canDelete(): boolean {
            return this._canDelete;
        }

        public get isRead(): boolean {
            return this._isRead;
        }

        public get dateFormated(): string {
            return this.date.relativeFormat();
        }

        /**
         * This property build the sentence to specyf when the item has been created and by who. Ex: Yesterday by John Smith
         **/
        public get title(): string {
            return this._title;
        }

        public get noteComment(): ap.models.notes.NoteComment {
            return <ap.models.notes.NoteComment>this.originalEntity;
        }

        public get date(): Date {
            return this._date;
        }

        public get note(): ap.models.notes.Note {
            return <ap.models.notes.Note>this._parentEntity;
        }

        public get noteAccessRight(): ap.models.accessRights.NoteAccessRight {
            return this._noteAccessRight;
        }

        /**
         * Public getter is used for getting isEditMode property
         **/
        public get isEditMode(): boolean {
            return this._isEditMode;
        }

        /**
         * Public setter is used for set value to isEditMode property
         **/
        public set isEditMode(value: boolean) {
            this._isEditMode = value;

            this.isDisabled = StringHelper.isNullOrEmpty(this._comment) || StringHelper.isNullOrWhiteSpace(this._comment);
        }

        /*
        * this had been called when copy source to calculate _canDelete access right
        */
        private checkCanDeleteComment(): void {
            this._canDelete = this._isFirstComment === false && !!this.noteAccessRight && this.noteAccessRight.checkCanDeleteComment(this.noteComment);
        }

        /**
        * This method will check the user can archive the comment or not
        **/
        private checkCanArchiveComment(): void {
            if (this.noteAccessRight === undefined || this.noteAccessRight === null)
                this._canArchive = false;
            else
                this._canArchive = this.noteAccessRight.checkCanArchiveComment(this.noteComment);
        }

        /**
        * This method will check the user can unarchive the comment or not
        **/
        public checkCanUnarchiveComment(): void {
            if (this.noteAccessRight === undefined || this.noteAccessRight === null)
                this._canUnarchive = false;
            else
                this._canUnarchive = this.noteAccessRight.checkCanArchiveComment(this.noteComment, true);
        }

        /**
        * This method will check the user can edit the comment or not
        **/
        private checkCanEditComment(): void {
            if (this.noteAccessRight === undefined || this.noteAccessRight === null)
                this._canEdit = false;
            else
                this._canEdit = this.noteAccessRight.checkCanEditComment(this.noteComment);
        }

        public copySource() {
            if (this.noteComment) {
                this._noteAccessRight = new ap.models.accessRights.NoteAccessRight(this.$utility, this.note);

                this.comment = this.noteComment.Comment;
                this._isRead = this.noteComment.IsRead;
                if (this.noteComment.From)
                    this._fromDisplayName = this.noteComment.From.DisplayName;
                this._number = this.noteComment.Code;
                this._isFirstComment = this.noteComment.IsFirst;
                this._isArchived = this.noteComment.IsArchived;
                this._hasNumber = this.numComment !== undefined && this.numComment !== null && this.numComment !== "";
                this._date = this.noteComment.Date;

                this._canArchive = false;
                this._canDelete = false;
                this._canEdit = false;
                this._canUnarchive = false;
                this.checkCanDeleteComment();
                this.checkCanArchiveComment();
                this.checkCanUnarchiveComment();
                this.checkCanEditComment();

                this.buildTitle();
            }
            else {
                this.initData();
            }

            this.buildActions();
        }

        /**
         * This method will build the title of the comment to know who is the author and when the item has been created. Ex: Yesterday by John Smith
         **/
        private buildTitle() {
            if (!!this._date && !!this.fromDisplayName)
                this._title = this.$utility.Translator.getTranslation("app.notes.comment_title").format(this.numComment, this.fromDisplayName);
            else
                this._title = "";
        }

        /*
        * Build list of actions acording to current access right
        */
        private buildActions() {
            this.actions = [];
            if (this.canEdit)
                this.actions.push(new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "notecomment.edit", this.$utility.rootUrl + "Images/html/icons/ic_create_black_48px.svg", true, null, "Edit", true));
            if (this.canDelete)
                this.actions.push(new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "notecomment.delete", this.$utility.rootUrl + "Images/html/icons/ic_delete_black_24px.svg", true, null, "Delete", true));
            if (this.canArchive)
                this.actions.push(new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "notecomment.archive", this.$utility.rootUrl + "Images/html/icons/ic_archive_black_48px.svg", true, null, "Archive", true));
            if (this.canUnarchive)
                this.actions.push(new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "notecomment.unarchive", this.$utility.rootUrl + "Images/html/icons/ic_unarchive_black_48px.svg", true, null, "Unarchive", true));
        }

         /**
         * This function is used to specify that one action has been clicked. Then, it raised the corresponding event. If the event name is not found then, a exception is thrown
         * @param name this is the name of the event. 
         **/
        public actionClick(name: string) {
            let action = ap.viewmodels.home.ActionViewModel.getAction(this.actions, name);
            if (!action) {
                throw new Error("The action " + name + " is not available");
            }

            switch (name) {
                case "notecomment.edit":
                    this.isEditMode = true;
                    this._listener.raise("editcommentrequested", this);
                    break;
                case "notecomment.delete":
                    this._mainController.showConfirm(this.noteComment.Comment
                        , this.$utility.Translator.getTranslation("app.notes.deletecomment_confirm_title"), (confirm) => {
                        if (confirm === ap.controllers.MessageResult.Positive) {
                            this._noteController.deleteComment(this.noteComment);
                        }
                    }, true /*isMultilines*/);
                    break;
                case "notecomment.archive":
                    this._noteController.archiveComment(this.noteComment, this.parentEntity.Id);
                    break;
                case "notecomment.unarchive":
                    this._noteController.unarchiveComment(this.noteComment, this.parentEntity.Id);
                    break;
            }
        }

        public postChanges() {
            if (this.noteComment) {
                this.noteComment.Comment = this.comment;
            }
        }

        private initData() {
            this._noteAccessRight = null;

            this._comment = "";
            this._isRead = false;
            this._isFirstComment = false;
            this._number = "";
            this._isArchived = false;
            this._canArchive = false;
            this._canDelete = false;
            this._canEdit = false;
            this._canUnarchive = false;
            this._fromDisplayName = "";
            this._hasNumber = false;
            this._date = null;

            this.buildTitle();
        }
        /**
        * This method was called when a notecomment was archived or unarchived from the NoteController.
        * We will update the updated properties into this VM
        * @param comment : is the updated notecomment 
        **/
        private _onCommentIsArchivedUpdated(comment: ap.models.notes.NoteComment) {
            if (comment && comment.Id === this.noteComment.Id) {
                this.copySource();
            }
        }

        /**
         * Language changed handler
         */
        private _languageChanged() {
            this.buildTitle();
        }

        public dispose() {
            super.dispose();
            if (this._noteController) {
                this._noteController.off("commentarchived", this._onCommentIsArchivedUpdated, this);
                this._noteController.off("commentunarchived", this._onCommentIsArchivedUpdated, this);
            }
            this.$utility.Translator.off("languagechanged", this._languageChanged, this);
        }

        constructor(utility: ap.utility.UtilityHelper, private _noteController: ap.controllers.NoteController, private _mainController: ap.controllers.MainController) {
            super(utility);
            let vm = this;
            this._listener.addEventsName(["editcommentrequested"]);
            this.initData();
            // Register events from notecontroller to update the vm
            this.$utility.Translator.on("languagechanged", this._languageChanged, vm);
            this._noteController.on("commentarchived", this._onCommentIsArchivedUpdated, vm);
            this._noteController.on("commentunarchived", this._onCommentIsArchivedUpdated, vm);
        }

        private _comment: string;
        private _isFirstComment: boolean;
        private _isArchived: boolean;
        private _number: string;
        private _hasNumber: boolean;
        private _canArchive: boolean;
        private _canUnarchive: boolean;
        private _canEdit: boolean;
        private _canDelete: boolean;
        private _isRead: boolean;
        private _fromDisplayName: string;
        private _date: Date;
        private _hasChanged: boolean;
        private _title: string = "";
        private _isEditMode: boolean = false;
        private _noteAccessRight: ap.models.accessRights.NoteAccessRight;
    }
}