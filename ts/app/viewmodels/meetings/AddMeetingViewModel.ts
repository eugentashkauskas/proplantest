module ap.viewmodels.meetings {
    /**
     * This view model use for dialog window of create new meeting
     */
    export class AddMeetingViewModel extends MeetingGeneralViewModel {

        public get canSave(): boolean {
            return this.meetingVm.hasChanged && this.meetingVm.isValid();
        }

        public cancel() {
            this.$mdDialog.cancel();
        }

        public save() {
            this.meetingVm.postChanges(true);
            this.$controllersManager.meetingController.saveMeeting(this.meetingVm.meeting).then((meeting) => {
                this.$mdDialog.hide(meeting.Id);
            });
        }

        constructor(private utility: ap.utility.UtilityHelper, private $controllersManager: ap.controllers.ControllersManager, meetingViewModel: ap.viewmodels.meetings.MeetingViewModel, private $mdDialog: angular.material.IDialogService) {
            super(utility, $controllersManager, meetingViewModel);
        }

    }
}