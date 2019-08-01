module ap.viewmodels.projectcontacts {

    export class ProjectContactsWorkspaceViewModel implements IDispose {

        /**
         * Public accessor to the contacts list
         */
        public get projectContactListVm(): ProjectContactListViewModel {
            return this._projectContactListVm;
        }

        /**
         * Public accessor to the full contact details
         */
        public get contactInfo(): ap.viewmodels.projects.ContactDetailsViewModel {
            return this._contactInfo;
        }

        /**
        * Getter of the public paneWidth property
        */
        public get paneWidth(): number {
            return this._paneWidth;
        }

        public get showDetailPaneBusy(): boolean {
            return this._showDetailPaneBusy;
        }

        dispose() {
            if (this._projectContactListVm) {
                this.projectContactListVm.dispose();
            }
            if (this._controllersManager.contactController) {
                this._controllersManager.contactController.off("invitecontactsclicked", this._inviteContactsClickedHandler, this);
                this._controllersManager.contactController.off("editcontactrequested", this.contactEditRequested, this);
            }
            if (this._contactInfo) {
                this._contactInfo.dispose();
            }
            this._controllersManager.uiStateController.off("mainflowstatechanged", this._handlerMainFlowStateChange, this);

            this.Api.off("showdetailbusy", this.changeVisibleDetailPaneBusy, this);
        }

        private _handleAddActionEvents(action: ap.controllers.AddActionClickEvent) {
            let actionName = action.name;
            switch (actionName) {
                case "projectcontact.import":
                    this.showImportParticipantsDialog();
                    break;
                case "projectcontact.add":
                    this.showAddParticipantDialog();
                    break;
            }
        }

        private showImportParticipantsDialog() {
            // send event to Segment.IO
            this.$servicesManager.toolService.sendEvent("cli-action-import user to the project", new Dictionary([new KeyValue("cli-action-import user to the project-screenname", "projects")]));

            let importProjectContactViewModel = new ap.viewmodels.projectcontacts.ImportProjectContactViewModel(this.Utility, this.$q, this.Api, this._controllersManager, this.$mdDialog, this.$timeout, this.$servicesManager);
            this._controllersManager.mainController.showBusy();

            let importController = ($scope: angular.IScope, $timeout: angular.ITimeoutService) => {
                $scope["vm"] = importProjectContactViewModel;
            };
            importController.$inject = ["$scope", "$timeout"];
            this.$mdDialog.show({
                clickOutsideToClose: true,
                preserveScope: true,
                templateUrl: "me/PartialView?module=ProjectContacts&name=ProjectImportContacts",
                fullscreen: true,
                controller: importController,
                onComplete: () => {
                    this._controllersManager.mainController.hideBusy();
                }
            }).then(() => {
                this._projectContactListVm.load();
            });
        }

        /**
         * Displays a popup for adding new contacts to the project
         */
        private showAddParticipantDialog() {
            // send event to Segment.IO
            this.$servicesManager.toolService.sendEvent("cli-action-add user to the project", new Dictionary([new KeyValue("cli-action-add user to the project-screenname", "projects")]));

            let addProjectContactViewModel = new ap.viewmodels.projectcontacts.AddProjectContactViewModel(this.Utility, this.Api, this.$q, this.$timeout, this.$mdDialog, this._controllersManager, this.$servicesManager.contactService);
            this._controllersManager.mainController.showBusy();

            let addParticipantController = ($scope: angular.IScope, $timeout: angular.ITimeoutService) => {
                $scope["vm"] = addProjectContactViewModel;
            };
            addParticipantController.$inject = ["$scope", "$timeout"];
            this.$mdDialog.show({
                clickOutsideToClose: true,
                preserveScope: true,
                templateUrl: "me/PartialView?module=ProjectContacts&name=ProjectAddContact",
                fullscreen: true,
                controller: addParticipantController,
                onComplete: () => {
                    this._controllersManager.mainController.hideBusy();
                }
            }).then(() => {
                this._projectContactListVm.load();
            });
        }

        /**
         * Opens a popup to ask the user in which language he wants to invite the contact
         * @param contact ContactDetails The contact to invite
         */
        private _inviteContactsClickedHandler(contact: ap.models.projects.ContactDetails[]) {
            let inviteContactsViewModel: ap.viewmodels.projectcontacts.InviteContactsViewModel;
            inviteContactsViewModel = new ap.viewmodels.projectcontacts.InviteContactsViewModel(this.Utility, this.$mdDialog, contact, this._controllersManager.contactController, this.$q, this._controllersManager.mainController);
            inviteContactsViewModel.on("contactsinvited", this.closeMultiActionRequest, this);

            let inviteController = ($scope: angular.IScope, $timeout: angular.ITimeoutService) => {
                $scope["vm"] = inviteContactsViewModel;
                $scope.$on("$destroy", () => {
                    inviteContactsViewModel.dispose();
                });
            };
            inviteController.$inject = ["$scope", "$timeout"];
            this.$mdDialog.show({
                clickOutsideToClose: false,
                preserveScope: true,
                templateUrl: "me/PartialView?module=ProjectContacts&name=InviteContactsDialog",
                fullscreen: true,
                controller: inviteController
            });
        }

        /**
        * Method use to close multi action mode
        */
        private closeMultiActionRequest() {
            this._projectContactListVm.closeMultiActions();
        }

        /**
         * This is heandler callback method needs to catch opening info panel event
         */
        private _contactInfoOpenedHandler(contactInfo: models.projects.ContactDetails) {
            if (!this._projectContactListVm.selectedContactVm || this._isEditPopupOpened)
                return;
            this._contactInfo = new ap.viewmodels.projects.ContactDetailsViewModel(this.Utility, this.Api, this.$q, this._controllersManager, this.$mdDialog);
            this._contactInfo.init(contactInfo);
            // send a Google Analytics event when the project info is opened
            this.Utility.sendGaPageViewEvent("participantInfo");
        }

        /**
         * Handler method for handling edit contact action process
         * @param item selected ContactDetails entity
         */
        private contactEditRequested(item: ap.models.projects.ContactDetails) {
            this._isEditPopupOpened = true;
            this._controllersManager.contactController.getFullContactDetails(item.Id).then((contactDetail: ap.models.projects.ContactDetails) => {
                let editContactInfo = new ap.viewmodels.projects.ContactDetailsViewModel(this.Utility, this.Api, this.$q, this._controllersManager, this.$mdDialog);
                editContactInfo.init(contactDetail);
                this.showEditContactDialog(editContactInfo);
            });
        }

        /**
         * Show edit contact dialog
         * @param editContactInfo
         */
        private showEditContactDialog(editContactInfo: ap.viewmodels.projects.ContactDetailsViewModel) {
            this._controllersManager.mainController.showBusy();

            let editController = ($scope: angular.IScope) => {
                this._controllersManager.mainController.hideBusy();
                $scope["vm"] = editContactInfo;
            };
            editController.$inject = ["$scope"];
            this.$mdDialog.show({
                clickOutsideToClose: false,
                templateUrl: "me/PartialView?module=ProjectContacts&name=EditParticipantInfoDialog",
                fullscreen: true,
                controller: editController
            }).then((updateContactDetails: ap.models.projects.ContactDetails) => {
                this._controllersManager.mainController.hideBusy();
                if (updateContactDetails) {
                    editContactInfo.dispose();
                    editContactInfo = null;
                    this.updateContact(updateContactDetails);
                }
            }).finally(() => {
                this._isEditPopupOpened = false;
            });
        }

        /**
        * Method used to update contactInfo
        **/
        private updateContact(updateContactDetails: ap.models.projects.ContactDetails) {
            if (this._contactInfo)
                this._contactInfo.init(updateContactDetails);
        }

        /**
         * This method use for restore page state after refresh page
         */
        private checkItems(loadedItems: ProjectContactItemViewModel[]) {
            if (!(!!this.projectContactListVm.screenInfo.checkedEntitiesId && this.projectContactListVm.screenInfo.checkedEntitiesId.length > 0))
                return;
            loadedItems.forEach((item: ProjectContactItemViewModel) => {
                if (this.projectContactListVm.screenInfo.checkedEntitiesId.indexOf(item.originalEntity.Id) >= 0)
                    item.defaultChecked = true;
            });
            this.projectContactListVm.gotoMultiActions();
        }

        /**
        * Handler method called when the selected contact of the contacts list has changed
        * @param vm the entityViewModel selected in the list
        **/
        private loadContactInfoData() {
            if (this._projectContactListVm.selectedContactVm) {
                this._controllersManager.contactController.getFullContactDetails(this._projectContactListVm.selectedContactVm.originalContactItem.Id, true).then((loadedContact: ap.models.projects.ContactDetails) => {
                    this._contactInfoOpenedHandler(loadedContact);
                });
            }
        }

        /**
         * Handler method called after the main flow state has changed
         */
        private _handlerMainFlowStateChange() {
            if (this._controllersManager.uiStateController.mainFlowState === ap.controllers.MainFlow.Contacts) {
                this._controllersManager.uiStateController.off("mainflowstatechanged", this._handlerMainFlowStateChange, this);

                this._projectContactListVm.listVm.clearLoaderCache();
                this._projectContactListVm.load(this._projectContactListVm.screenInfo.selectedEntityId).then(() => {
                    if (this._projectContactListVm.screenInfo.isInfoOpened) {
                        this._projectContactListVm.openInfoPanel();
                    }
                });
            }
        }

        public widthChangedHandler(value: number) {
            this.Utility.Storage.Local.set("contactinfopanewidth", value);
            this._paneWidth = value;
        }

        private changeVisibleDetailPaneBusy(showBusy: boolean) {
            this._showDetailPaneBusy = showBusy;
        }

        static $inject = ["$scope", "ControllersManager", "Utility", "Api", "$q", "$timeout", "$mdDialog", "ServicesManager"];
        constructor(private $scope: angular.IScope, private _controllersManager: ap.controllers.ControllersManager, private Utility: ap.utility.UtilityHelper, private Api: ap.services.apiHelper.Api,
            private $q: angular.IQService, private $timeout: angular.ITimeoutService, private $mdDialog: angular.material.IDialogService, private $servicesManager: ap.services.ServicesManager) {

            this._projectContactListVm = new ap.viewmodels.projectcontacts.ProjectContactListViewModel(this.Utility, $q, _controllersManager, $timeout, $servicesManager);
            if (this.Utility.Storage.Local.get("contactinfopanewidth")) {
                this._paneWidth = this.Utility.Storage.Local.get("contactinfopanewidth");
            }

            this.Api.on("showdetailbusy", this.changeVisibleDetailPaneBusy, this);

            this._controllersManager.uiStateController.updateScreenInfo(this._projectContactListVm.screenInfo);
            this._controllersManager.mainController.initScreen(this._projectContactListVm.screenInfo);

            this.projectContactListVm.screenInfo.on("addactionclicked", this._handleAddActionEvents, this);
            this.projectContactListVm.listVm.on("pageloaded", this.checkItems, this);
            this.projectContactListVm.on("openinfopanel", this.loadContactInfoData, this);

            if (this._controllersManager.uiStateController.mainFlowState === ap.controllers.MainFlow.Contacts) {
                this._handlerMainFlowStateChange();
            } else {
                this._controllersManager.uiStateController.on("mainflowstatechanged", this._handlerMainFlowStateChange, this);
            }
            this._controllersManager.contactController.on("invitecontactsclicked", this._inviteContactsClickedHandler, this);
            this._controllersManager.contactController.on("editcontactrequested", this.contactEditRequested, this);
            this._controllersManager.contactController.on("updatecontactrequested", this.updateContact, this);

            this.$servicesManager.toolService.sendEvent("cli-menu-open participants", new Dictionary([new KeyValue("cli-menu-open participants-screenname", "projects")]));

            $scope.$on("$destroy", () => {
                this.dispose();
            });
        }

        // private _views: ap.misc.IViewInfo;
        private _projectContactListVm: ProjectContactListViewModel = null;
        private _isEditPopupOpened: boolean = false;
        private _contactInfo: ap.viewmodels.projects.ContactDetailsViewModel;
        private _paneWidth: number;
        private _showDetailPaneBusy: boolean = false;
    }
}