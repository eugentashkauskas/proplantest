namespace ap.viewmodels.meetingcontacts {

    export class MeetingContactsWorkspaceViewModel implements IDispose {

        /**
        * Returns the contacts list
        */
        public get contactList() {
            return this._contactList;
        }

        /*
        * To handle FAB actions
        */
        private handleAddActionEvents(action: ap.controllers.AddActionClickEvent): void {
            let actionName = action.name;
            switch (actionName) {
                case "meetingcontacts.add":
                    this.showAddMeetingConcernsDialog();
                    break;
            }
        }

        /**
         * Show the dialog to add participants to the meeting
         */
        private showAddMeetingConcernsDialog() {
            // send event to Segment.IO
            this.servicesManager.toolService.sendEvent("cli-action-add user to a list", new Dictionary([new KeyValue("cli-action-add user to a list-screenname", "lists")]));

            let alreadyInvitedUsersIds: string[] = this._contactList.listVm.sourceItems.map((contact: MeetingContactViewModel) => { return contact.originalMeetingContact.User.Id; });
            let addMeetingConcernsVm = new ap.viewmodels.meetingcontacts.AddMeetingConcernsViewModel(this.Utility, this.Api, this.$q, this.$timeout, this._controllersManager, this.servicesManager, this.$mdDialog, alreadyInvitedUsersIds);
            this._controllersManager.mainController.showBusy();

            let addMeetingConcernController = ($scope: angular.IScope, $timeout: angular.ITimeoutService) => {
                $scope["vm"] = addMeetingConcernsVm;
            };
            addMeetingConcernController.$inject = ["$scope", "$timeout"];
            this.$mdDialog.show({
                clickOutsideToClose: true,
                templateUrl: "me/PartialView?module=MeetingContacts&name=AddMeetingConcernsDialog",
                fullscreen: true,
                controller: addMeetingConcernController,
                onComplete: () => {
                    this._controllersManager.mainController.hideBusy();
                }
            }).then(() => {
                this.contactList.load(this._controllersManager.mainController.currentMeeting);
            });
        }

        public dispose() {
            if (this._contactList) {
                this._contactList.dispose();
            }
            this._controllersManager.mainController.off("currentmeetingchanged", this.handleMainFlowStateChanged, this);
        }

        /**
         * Handler method called when the mainFlowStateChanged event is raised
         */
        private handleMainFlowStateChanged(): void {
            if (this._controllersManager.uiStateController.mainFlowState === ap.controllers.MainFlow.MeetingContacts) {
                if (this._controllersManager.mainController.currentMeeting) {
                    this._controllersManager.uiStateController.off("mainflowstatechanged", this.handleMainFlowStateChanged, this);
                    this._controllersManager.uiStateController.off("currentmeetingchanged", this.handleMainFlowStateChanged, this);

                    if (this._controllersManager.uiStateController.mainFlowStateParam) {
                        this._views = this._controllersManager.uiStateController.mainFlowStateParam.openedViews[0];
                    }
                    this.refresh();
                } else {
                    this._controllersManager.mainController.on("currentmeetingchanged", this.handleMainFlowStateChanged, this);
                }
            }
        }

        /**
         * Refresh the list
         */
        private refresh() {
            let idToSelect: string = null;
            if (this._views && this._views.selectedEntityId) {
                idToSelect = this._views.selectedEntityId;
            }
            if (this._controllersManager.mainController.currentMeeting) {
                this.contactList.load(this._controllersManager.mainController.currentMeeting, idToSelect);
            }
        }


        static $inject = ["$scope", "Utility", "ControllersManager", "ServicesManager", "Api", "$q", "$timeout", "$mdDialog"];
        constructor(private $scope: ng.IScope, private Utility: ap.utility.UtilityHelper, private _controllersManager: ap.controllers.ControllersManager, private servicesManager: ap.services.ServicesManager, private Api: ap.services.apiHelper.Api, private $q: angular.IQService, private $timeout: angular.ITimeoutService, private $mdDialog: angular.material.IDialogService) {
            this._contactList = new MeetingContactListViewModel(this.Utility, this._controllersManager.mainController, this._controllersManager.meetingController, this.$scope, this._controllersManager);
            this._controllersManager.uiStateController.updateScreenInfo(this._contactList.screenInfo);
            this._controllersManager.mainController.initScreen(this._contactList.screenInfo);

            if (this._controllersManager.uiStateController.mainFlowState === ap.controllers.MainFlow.MeetingContacts) {
                this.handleMainFlowStateChanged();
            } else {
                this._controllersManager.uiStateController.on("mainflowstatechanged", this.handleMainFlowStateChanged, this);
            }
            this._contactList.screenInfo.on("addactionclicked", this.handleAddActionEvents, this);

            $scope.$on("$destroy", () => {
                this.dispose();
            });

            this.servicesManager.toolService.sendEvent("cli-menu-open participants", new Dictionary([new KeyValue("cli-menu-open participants-screenname", "lists")]));
        }
        private _contactList: MeetingContactListViewModel;
        private _views: ap.misc.IViewInfo;
    }
}