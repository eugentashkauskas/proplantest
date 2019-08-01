module ap.viewmodels.multiactions {
    export class MeetingMultiEditNotAppliedViewModel {

        /**
        * Return not applied actions list
        **/
        public get notAppliedActionDescList() {
            return this._notAppliedActionDescList;
        }

        /**
        * Close current popup window
        */
        public cancel() {
            this.$mdDialog.cancel();
        }

        /**
         * Get action's action name depending on the enum type
         * @param desc Not applied action description entity
         */
        public getActionName(desc: ap.models.multiactions.NotAppliedActionDescription) {
            let actionName = "";
            switch (desc.Action) {
                case ap.models.multiactions.MultiAction.AddParticipant:
                    actionName = this.$utility.Translator.getTranslation("app.MultiAction.AddParticipant");
                    break;
                case ap.models.multiactions.MultiAction.AddDocument:
                    actionName = this.$utility.Translator.getTranslation("app.MultiAction.AddDocument");
                    break;
                case ap.models.multiactions.MultiAction.ChangeNumberingType:
                    actionName = this.$utility.Translator.getTranslation("app.MultiAction.ChangeNumberingType");
                    break;
            }
            return actionName;
        }

        /**
         * Get action's reason name depending on the enum type
         * @param desc Not applied action description entity
         */
        public getReasonName(desc: ap.models.multiactions.NotAppliedActionDescription) {
            let reasonName = "";
            switch (desc.Reason) {
                case ap.models.multiactions.NotAppliedReason.ConcurrencyException:
                    switch (desc.Action) {
                        case ap.models.multiactions.MultiAction.AddParticipant:
                            reasonName = this.$utility.Translator.getTranslation("app.NotAppliedReason.alreadyAdded");
                            break;
                        default:
                            reasonName = this.$utility.Translator.getTranslation("app.NotAppliedReason.alreadyModified");
                    }
                    break;
                case ap.models.multiactions.NotAppliedReason.CannotAddParticipantsAccessRightLevel:
                    reasonName = this.$utility.Translator.getTranslation("app.NotAppliedReason.greaterAccessRight");
                    break;
                case ap.models.multiactions.NotAppliedReason.CannotAddParticipants:
                    reasonName = this.$utility.Translator.getTranslation("app.NotAppliedReason.noAddParticipantAccess");
                    break;
                case ap.models.multiactions.NotAppliedReason.CannotAddMeetingDocument:
                    reasonName = this.$utility.Translator.getTranslation("app.NotAppliedReason.noAddDocumentAccess");
                    break;
                case ap.models.multiactions.NotAppliedReason.CannotModifyMeeting:
                    reasonName = this.$utility.Translator.getTranslation("app.NotAppliedReason.noAddListAccess");
                    break;
            }
            return reasonName;
        }

        constructor(private $utility: ap.utility.UtilityHelper, private $mdDialog: angular.material.IDialogService, private _notAppliedActionDescList: ap.models.multiactions.NotAppliedActionDescription[]) {

        }
    }
}