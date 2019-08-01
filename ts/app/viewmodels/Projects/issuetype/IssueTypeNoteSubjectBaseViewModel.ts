module ap.viewmodels.projects {
    export class IssueTypeNoteSubjectBaseViewModel extends EntityViewModel {

        public get issueTypeNoteSubjectBase(): ap.models.projects.IssueTypeNoteSubjectBase {
            return <ap.models.projects.IssueTypeNoteSubjectBase>this.originalEntity;
        }

        /**
         * A maximum length of the subject property
         */
        public get subjectMaxLength(): number {
            return 255;
        }

        /**
         * Determines whether the subject is valid or not
         */
        protected validate(): boolean {
            let isSubjectValid = !StringHelper.isNullOrWhiteSpace(this.subject) && this.subject.length < this.subjectMaxLength;
            return isSubjectValid && !this.isDuplicated;
        }

        /**
        * This method override EntityViewModel checkIsValid abstarct method
        **/
        protected checkIsValid() {
            let validationResult = this.validate();
            this.setIsValid = validationResult;
        }

        /**
         * This is the value of the default subject to use for the parent issue type
         **/
        public get subject(): string {
            return this._subject;
        }

        public set subject(_subject_: string) {
            let originalSubject = this._subject;
            this._subject = _subject_;
            this.raisePropertyChanged("subject", originalSubject, this);
            this.checkIsValid();
        }

        /**
         * When the entity is in a list, it is the order of the entity in the list regarding other entity
         **/
        public get displayOrder(): number {
            return this._displayOrder;
        }

        public set displayOrder(_displayOrder_: number) {
            if (_displayOrder_ !== this.displayOrder) {
                let oldValue: number = this._displayOrder;
                this._displayOrder = _displayOrder_;
                this.raisePropertyChanged("displayOrder", oldValue, this);
            }
        }

        /**
         * This is the value of the default description to use when create note on the parent issue type; (First comment)
         **/
        public get defaultDescription(): string {
            return this._defaultDescription;
        }

        public set defaultDescription(val: string) {
            let originaldescription = this._defaultDescription;
            this._defaultDescription = val;
            this.raisePropertyChanged("description", originaldescription, this);
        }

        protected initData() {
            this.defaultData();
        }

        private defaultData() {
            this._subject = "";
            this._displayOrder = 0;
            this._defaultDescription = "";
        }

        public copySource() {
            super.copySource();
            if (!this.issueTypeNoteSubjectBase) {
                this.initData();
            } else {
                this._subject = this.issueTypeNoteSubjectBase.Subject;
                this._displayOrder = this.issueTypeNoteSubjectBase.DisplayOrder;
                this._defaultDescription = this.issueTypeNoteSubjectBase.DefaultDescription;
            }
            this.checkIsValid();
        }

        public postChanges() {
            if (this.issueTypeNoteSubjectBase) {
                this.issueTypeNoteSubjectBase.Subject = this.subject;
                this.issueTypeNoteSubjectBase.DisplayOrder = this.displayOrder;
                this.issueTypeNoteSubjectBase.DefaultDescription = this.defaultDescription;
            }
        }

        constructor(utility: ap.utility.UtilityHelper, parentListVm?: BaseListEntityViewModel, itemParameters?: ItemConstructorParameter) {
            super(utility, parentListVm, itemParameters ? itemParameters.itemIndex : null);
            this.defaultData();
        }
        private _subject: string;
        private _displayOrder: number = 0;
        private _defaultDescription: string;
    }
}