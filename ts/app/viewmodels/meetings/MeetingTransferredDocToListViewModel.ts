module ap.viewmodels.meetings {
    export class MeetingTransferredDocToListViewModel implements ap.utility.IListener, IDispose {

        on(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.on(eventName, callback, caller);
        }
        off(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.off(eventName, callback, caller);
        }

        /**
         * This is the user to list into a contactselector viewmodel
         **/
        public get contactSelectorViewModel(): ap.viewmodels.projects.ContactSelectorViewModel {
            return this._contactSelectorViewModel;
        }

        public get meetingTransferredDocViewModel(): MeetingTransferredDocViewModel {
            return this._meetingTransferredDocVm;
        }

        public set meetingTransferredDocViewModel(transferredDocVm: MeetingTransferredDocViewModel) {
            if (this._meetingTransferredDocVm !== transferredDocVm) {
                this._meetingTransferredDocVm = transferredDocVm;
                this._meetingTransferredDoc = this._meetingTransferredDocVm ? this._meetingTransferredDocVm.meetingTransferDoc : null;
            }

            this.initCollection();
        }

        private initCollection(): void {

            if (this._meetingTransferredDoc && this._meetingTransferredDoc.UsersTo) {
                this._contactSelectorViewModel.initUsers(this._meetingTransferredDoc.UsersTo);
            }
            else {
                this._contactSelectorViewModel.initUsers([]);
            }
        }

        /**
        * This method use for check changes in contacts
        **/
        public checkContactsSelectChanged(): boolean {
            let result: boolean = false;
            let originalValue = this._meetingTransferredDoc.UsersTo;
            let valueVm = this._contactSelectorViewModel.selectedContacts;
            if (valueVm && originalValue && valueVm.length !== originalValue.length) {
                result = true;
            } else if (originalValue) {
                for (let i = 0; i < valueVm.length; i++) {
                    let arrUsers = originalValue.filter((item) => {
                        return item.DisplayName === valueVm[i].displayText;
                    });
                    if (arrUsers.length === 0) {
                        result = true;
                        break;
                    }
                }
            }
            return result;
        }

        /**
         * This method will accept changes done in the contactSelectorViewModel to add or remove item in the list of MeetingTransferredDocTo
         */
        public postChanges() {
            if (!this._meetingTransferredDoc.UsersTo)
                this._meetingTransferredDoc.UsersTo = [];

            // Add new items
            this._contactSelectorViewModel.selectedContacts.forEach((contact) => {
                let key = contact.displayText + (contact.userId === null ? "-" : contact.userId);
                let alreadyExists = false;

                this._meetingTransferredDoc.UsersTo.forEach((item) => {
                    let keyOrigninal = item.Tag + (item.UserId === null ? "-" : item.UserId);
                    if (keyOrigninal === key)
                        alreadyExists = true;
                });
                if (!alreadyExists)
                    this._meetingTransferredDoc.UsersTo.push(new ap.models.meetings.MeetingTransferredDocsTo(this.$utility, contact.displayText, contact.userId));

            });

            // remove deleted items
            for (let i = this._meetingTransferredDoc.UsersTo.length - 1; i >= 0; i--) {
                let item = this._meetingTransferredDoc.UsersTo[i];
                let keyOrigninal = item.Tag + (item.UserId === null ? "-" : item.UserId);
                let isDeleted = true;
                this._contactSelectorViewModel.selectedContacts.forEach((contact) => {
                    let key = contact.displayText + (contact.userId === null ? "-" : contact.userId);
                    if (key === keyOrigninal)
                        isDeleted = false;
                });

                if (isDeleted)
                    this._meetingTransferredDoc.UsersTo.splice(i, 1);
            }

        }

        public dispose() {
            this._listener.clear();
            if (this._contactSelectorViewModel) {
                this._contactSelectorViewModel.dispose();
            }
        }

        /**
         * Open edit transferred contacts dialog window
         */
        public openEditContactsDialog() {
            let editContactController = ($scope: angular.IScope) => {
                let documentName = this._meetingTransferredDocVm ? this._meetingTransferredDocVm.name : null;
                $scope["vm"] = new ap.viewmodels.meetings.EditMeetingTransferredDocToListViewModel(this.$utility, this.$mdDialog, documentName, this);
            };
            editContactController.$inject = ["$scope"];
            this.$mdDialog.show({
                fullscreen: false,
                preserveScope: true,
                clickOutsideToClose: true,
                escapeToClose: true,
                templateUrl: "me/PartialView?module=Meeting&name=EditMeetingToListDialog",
                controller: editContactController
            }).then(() => {
                this._listener.raise("contactsupdated");
            });
        }

        constructor(private $utility: ap.utility.UtilityHelper, private _api: ap.services.apiHelper.Api, $q: angular.IQService, private $mdDialog: angular.material.IDialogService, private _controllersManager: ap.controllers.ControllersManager, meetingTransferredDocVm?: MeetingTransferredDocViewModel) {
            this._listener = $utility.EventTool.implementsListener(["contactsupdated"]);
            this._contactSelectorViewModel = new ap.viewmodels.projects.ContactSelectorViewModel($utility, _api, $q, _controllersManager.mainController, _controllersManager.projectController, true, true, false);
            this.meetingTransferredDocViewModel = meetingTransferredDocVm;
        }

        private _listener: ap.utility.IListenerBuilder;
        private _meetingTransferredDocVm: MeetingTransferredDocViewModel;
        private _meetingTransferredDoc: ap.models.meetings.MeetingTransferredDocs;
        private _contactSelectorViewModel: ap.viewmodels.projects.ContactSelectorViewModel;
    }
}