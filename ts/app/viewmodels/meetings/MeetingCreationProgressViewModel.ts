module ap.viewmodels.meetings {
    export class MeetingCreationProgressViewModel {
        /**
         * Public property titleKey
         */
        public get titleKey(): string {
            return this._titleKey;
        }

        /**
         * Public property descriptionKey
         */
        public get descriptionKey(): string {
            return this._descriptionKey;
        }

        /**
         * Public property meetings
         */
        public get meetings(): ap.models.meetings.Meeting[] {
            return this._meetings;
        }

        /**
         * Public property importedMeetings
         */
        public get importedMeetings(): ap.viewmodels.meetings.ImportedMeetingViewModel[] {
            return this._importedMeetings;
        }

        /**
         * Public property successMeetingsCount
         */
        public get successMeetingsCount(): number {
            return this._successMeetingsCount;
        }

        /**
         * Public property errorMeetingsCount
         */
        public get errorMeetingsCount(): number {
            return this._errorMeetingsCount;
        }

        /**
        * Public property meetingTitleErrorArr
        */
        public get meetingTitleErrorArr(): string[] {
            return this._meetingTitleErrorArr;
        }

        /**
         * Public property allowCancel
         */
        public get canClose() {
            return this._canClose;
        }

        /**
         * Hide popup window
         */
        public close() {
            this.$mdDialog.hide();
        }

        /**
         * Update descriptionKey 
         */
        private updateStatusTranslation() {
            if (this._errorMeetingsCount > 0) {
                this._descriptionKey = this.$utility.Translator.getTranslation("creation.progress.error.desc").format(this._successMeetingsCount.toString(), this._errorMeetingsCount.toString(), this._meetingTitleErrorStr);
            } else {
                this._descriptionKey = this.$utility.Translator.getTranslation("creation.progress.success.desc").format(this._successMeetingsCount.toString());
            }
        }

        /**
         * This function use to render imported meetings recursively and update description
         * @param meeting get each meeting from imported meetings
         */
        private importMeeting(meeting: ap.models.meetings.Meeting) {
            let importedMeetingVm = new ImportedMeetingViewModel(this.$utility);
            importedMeetingVm.init(meeting);
            let errors = this.validateMeeting(importedMeetingVm);
            if (errors && errors.length > 0) {
                this.handleImportError(errors, importedMeetingVm);
                this.onMeetingImport();
            } else {
                this.controllersManager.meetingController.saveMeeting(meeting, this._apiOption)
                    .then((updatedMeeting: ap.models.meetings.Meeting) => {
                        importedMeetingVm.init(updatedMeeting);
                        let importedMeetingVmIndex = this.calculateImportedMeetingVmIndex();
                        this._importedMeetings[importedMeetingVmIndex] = importedMeetingVm;
                        this._successMeetingsCount++;
                        this.onMeetingImport();
                    }).catch((errObj) => {
                        this.handleImportError(this.$utility.Translator.getTranslation("app.err." + errObj.ErrorCode) + " " + this.$utility.Translator.getTranslation("app.meeting.error_import"), importedMeetingVm);
                        this.onMeetingImport();
                    });
            }
        }

        /**
         * Private method which used to handle import meeting
         */
        private onMeetingImport() {
            this._importedMeetingsCount++;
            this.updateStatusTranslation();
            if (this._importedMeetingsCount < this._meetings.length) {
                this.importMeeting(this._meetings[this._importedMeetingsCount]);
            } else {
                this._canClose = true;
            }
        }

        /**
         * Private method which used to handle error imported 
         * @param errorStr - error string
         * @param importedMeetingVm - instance of ImportedMeetingViewModel
         */
        private handleImportError(errorStr: string, importedMeetingVm: ap.viewmodels.meetings.ImportedMeetingViewModel) {
            let errorMeetingVm = new ImportedMeetingViewModel(this.$utility);
            errorMeetingVm.error = errorStr;
            this.updateMettingTitleErrorArr(importedMeetingVm);
            this._meetingTitleErrorStr = this.meetingTitleErrorArr.join(", ");
            let importedMeetingVmIndex = this.calculateImportedMeetingVmIndex();
            this._importedMeetings[importedMeetingVmIndex] = importedMeetingVm;
            this._importedMeetings.splice(importedMeetingVmIndex + 1, 0, errorMeetingVm);
            this._errorMeetingsCount++;
        }

        /**
         * Private method which used to calculate index of ImportedMeetingViewModel instance
         */
        private calculateImportedMeetingVmIndex(): number {
            let importedMeetingRows = this._importedMeetingsCount;
            let errorMessageRows = this._errorMeetingsCount;
            return importedMeetingRows + errorMessageRows;
        }

        /**
         * This method is used to check meeting property 
         * @param meeting - instance of ImportedMeetingViewModel
         */
        private validateMeeting(meeting: ap.viewmodels.meetings.ImportedMeetingViewModel) {
            let errorArr: string[] = [];
            if (meeting.title && meeting.title.length > 255) {
                errorArr.push(this.$utility.Translator.getTranslation("app.meetings.creation.progress.valid.title.length"));
            }
            if (StringHelper.isNullOrEmpty(meeting.title)) {
                errorArr.push(this.$utility.Translator.getTranslation("app.meetings.creation.progress.valid.title.empty"));
            }
            if (meeting.code && meeting.code.length > 5) {
                errorArr.push(this.$utility.Translator.getTranslation("app.meetings.creation.progress.valid.code.length"));
            }
            if (StringHelper.isNullOrEmpty(meeting.code)) {
                errorArr.push(this.$utility.Translator.getTranslation("app.meetings.creation.progress.valid.code.empty"));
            }
            if (isNaN(meeting.numberingType)) {
                errorArr.push(this.$utility.Translator.getTranslation("app.meetings.creation.progress.valid.numberingType.empty"));
            }
            if (meeting.numberingType > 3) {
                errorArr.push(this.$utility.Translator.getTranslation("app.meetings.creation.progress.valid.numberingType"));
            }
            if (meeting.floor && meeting.floor.length > 255) {
                errorArr.push(this.$utility.Translator.getTranslation("app.meetings.creation.progress.valid.floor.length"));
            }
            if (meeting.building && meeting.building.length > 4000) {
                errorArr.push(this.$utility.Translator.getTranslation("app.meetings.creation.progress.valid.building.length"));
            }
            if (meeting.header && meeting.header.length > 4000) {
                errorArr.push(this.$utility.Translator.getTranslation("app.meetings.creation.progress.valid.header.length"));
            }
            if (meeting.footer && meeting.footer.length > 4000) {
                errorArr.push(this.$utility.Translator.getTranslation("app.meetings.creation.progress.valid.footer.length"));
            }
            return errorArr.join(". ");
        }

        /**
         * This method is used to update meetingTitleErrorArr
         * @param meeting - instance of ImportedMeetingViewModel
         */
        private updateMettingTitleErrorArr(meeting: ap.viewmodels.meetings.ImportedMeetingViewModel) {
            if (!StringHelper.isNullOrEmpty(meeting.title)) {
                this._meetingTitleErrorArr.push(meeting.shortTitle());
            }
            this.updateValidState(meeting);
        }

        /**
         * This method is used to update valid state if meeting has error
         * @param meeting - instance of ImportedMeetingViewModel
         */
        private updateValidState(meeting: ap.viewmodels.meetings.ImportedMeetingViewModel) {
            meeting.setIsValid = false;
        }

        constructor(protected $utility: ap.utility.UtilityHelper, protected $q: angular.IQService, protected $mdDialog: angular.material.IDialogService, protected controllersManager: ap.controllers.ControllersManager, protected _meetings: ap.models.meetings.Meeting[]) {
            this._canClose = false;
            this._importedMeetingsCount = 0;
            this._errorMeetingsCount = 0;
            this._successMeetingsCount = 0;
            this._importedMeetings = new Array(this.meetings.length);
            this._apiOption = new ap.services.apiHelper.ApiOption();
            this._apiOption.isShowBusy = false;
            this._apiOption.isShowError = false;
            this._apiOption.async = true;
            if (this._meetings && this._meetings.length > 0) {
                this.importMeeting(this._meetings[0]);
            }
            this.updateStatusTranslation();
        }

        private _titleKey: string = "Lists creation progress";
        private _descriptionKey: string = "";
        private _importedMeetingsCount: number;
        private _errorMeetingsCount: number;
        private _successMeetingsCount: number;
        private _importedMeetings: ap.viewmodels.meetings.ImportedMeetingViewModel[];
        private _apiOption: ap.services.apiHelper.ApiOption;
        private _canClose: boolean;
        private _visibleNumberingType: string[] = [];
        private _errorMessage: string;
        private _meetingTitleErrorArr: string[] = [];
        private _meetingTitleErrorStr: string = "";
    }
}