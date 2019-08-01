module ap.viewmodels.notes {

    export enum CopyMoveStatus {
        SelectMeeting,
        CreateMeeting
    }

    export class NoteCopyMoveViewModel implements IDispose {

        // Public methods
        dispose(): void {
            this._meetingSelectorVM.dispose();
        }

        /**
         * This public getter is used to get meetingSelectorVM property
         */
        get meetingSelectorVM(): ap.viewmodels.meetings.MeetingSelectorViewModel {
            return this._meetingSelectorVM;
        }

        /**
         * This public method is used to handle cancel action
         */
        public cancel() {
            this.$mdDialog.cancel();
        }

        /**
         * This public method is used to handle accept action
         */
        public accept() {
            this.$mdDialog.hide(CopyMoveStatus.SelectMeeting);
        }

        /**
         * This public getter is used to get acceptTranslationKey property 
         */
        get acceptTranslationKey(): string {
            return this._acceptTranslationKey;
        }

        /**
         * This public method is used to check value of acceptTranslationKey property
         * @param isCopy boolean parameter 
         */
        public checkAcceptTranslationKey(isCopy: boolean): void {
            this._acceptTranslationKey = isCopy ? this.$utility.Translator.getTranslation("Copy") : this.$utility.Translator.getTranslation("Move");
        }

        /**
         * This method is used to fire requestnewmeeting event
         */
        private selectedItemChangedHandler() {
            if (this._meetingSelectorVM.listVm.selectedViewModel.originalEntity.Id === ap.utility.UtilityHelper.createEmptyGuid()) {
                this.$mdDialog.hide(CopyMoveStatus.CreateMeeting);
            }
        }

        /**
         * This method is used to handle isloadedchanged event
         * @param isLoaded boolean parametr is used to check loaded items
         */
        private isLoadedChangedHandler() {
            this._meetingSelectorVM.listVm.on("selectedItemChanged", this.selectedItemChangedHandler, this);
            this._meetingSelectorVM.listVm.off("pageloaded", this.isLoadedChangedHandler, this);
        }

        /**
         * This private method is used to init MeetingSelectorViewModel
         */
        private initMeetingSelector() {
            let zeroId = ap.utility.UtilityHelper.createEmptyGuid();
            let meeting: ap.models.meetings.Meeting = new ap.models.meetings.Meeting(this.$utility);
            meeting.createByJson({ Id: zeroId });
            let meetingItemViewModel: ap.viewmodels.meetings.MeetingItemViewModel = new ap.viewmodels.meetings.MeetingItemViewModel(this.$utility, this.$q, undefined, undefined, true);
            meetingItemViewModel.init(meeting);
            meetingItemViewModel.title = this.$utility.Translator.getTranslation("Create new meeting");
            let createNewMeeting: ap.viewmodels.PredefinedItemParameter = new ap.viewmodels.PredefinedItemParameter(0, zeroId, meetingItemViewModel);
            this._meetingSelectorVM = new meetings.MeetingSelectorViewModel(this.$utility, this.$q, this._controllersManager, this.$timeout, true, null, [createNewMeeting]);

            this._meetingSelectorVM.listVm.on("pageloaded", this.isLoadedChangedHandler, this);
        }

        constructor(private $utility: ap.utility.UtilityHelper, private _api: ap.services.apiHelper.Api, private $q: angular.IQService, private _controllersManager: ap.controllers.ControllersManager,
            private $timeout: angular.ITimeoutService, private accessRightController: ap.controllers.AccessRightController, private $mdDialog: angular.material.IDialogService) {

            this.initMeetingSelector();
        }
        private _meetingSelectorVM: ap.viewmodels.meetings.MeetingSelectorViewModel;
        private _acceptTranslationKey: string;
    }
}