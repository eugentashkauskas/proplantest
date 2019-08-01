module ap.viewmodels.multiactions {

    export class MeetingMultiEditViewModel implements IDispose {

        public get canUpload(): boolean {
            return this._documentAccessRight.canUploadDoc || this._documentAccessRight.canUploadPicture;
        }

        /**
        * Use to know if the app is open in Internet Explorer
        * (need it in the view)
        **/
        public get isIE(): boolean {
            return this.$utility.isIE();
        }

        /**
        * Return viewmodel for add documents
        **/
        public get addNewDocumentVm(): ap.viewmodels.documents.AddNewDocumentViewModel {
            return this._addNewDocumentViewModel;
        }

        /**
        * Return documents which added to meetings
        **/
        public get documentsAddedToMeetings(): ap.models.documents.Document[] {
            return this._documentsAddedToMeetings;
        }

        /**
        * Return meeting multi-edit entity
        **/
        public get meetingMultiEdit() {
            return this._meetingMultiEdit;
        }

        /**
        * Return value of "Add participants" checkbox - checked/unchecked
        **/
        public get addedParticipants() {
            return this._addedParticipants;
        }

        /**
        * Return value of "Type of numbering" checkbox - checked/unchecked
        **/
        public get changedNumberingType() {
            return this._changedNumberingType;
        }

        public get selectedNumberingType() {
            return this._selectedNumberingType;
        }

        /**
        * Return value of "Add documents" checkbox - checked/unchecked
        **/
        public get addedDocuments() {
            return this._addedDocuments;
        }

        /**
        * Get search participants input text
        **/
        public get searchParticipantsText() {
            return this._searchParticipantsText;
        }

        /**
        * Set search participants input text
        **/
        public set searchParticipantsText(searchText: string) {
            this._searchParticipantsText = searchText;
        }

        /**
        * Get selected contact entity
        **/
        public get selectedContact() {
            return this._selectedContact;
        }

        /**
        * Set selected contact entity
        **/
        public set selectedContact(selectedContact: ap.viewmodels.projectcontacts.ProjectContactItemViewModel) {
            this._selectedContact = selectedContact;
        }

        /**
        * Set value of "Add participants" checkbox, if new value is false clear selected contacts and uncheck all contacts
        **/
        public set addedParticipants(newValue: boolean) {
            if (this._addedParticipants !== newValue) {
                this._addedParticipants = newValue;
                if (!this._addedParticipants) {
                    this._meetingMultiEdit.MeetingConcerns = [];
                    if (this._projectContacts) {
                        this._projectContacts.forEach((contact: ap.viewmodels.projectcontacts.ProjectContactItemViewModel) => {
                            if (contact.isChecked)
                                contact.isChecked = false;
                        });
                    }
                    this.computeCanSave();
                }
            }
        }

        /**
        * Set changed numbering type value, remove selected numbering type if value is false
        **/
        public set changedNumberingType(changedNumberingType: boolean) {
            if (this._changedNumberingType !== changedNumberingType) {
                this._changedNumberingType = changedNumberingType;
                if (!this._changedNumberingType) {
                    this._selectedNumberingType = null;
                    this.computeCanSave();
                }
            }
        }

        /**
        * Set selected numbering type, update "changedNumberingType" value to true
        **/
        public set selectedNumberingType(selectedNumberingType: ap.models.meetings.MeetingNumberingType) {
            this._selectedNumberingType = selectedNumberingType;
            this._changedNumberingType = true;
            this.computeCanSave();
        }

        public getNumberingTypeName(numberingType: ap.models.meetings.MeetingNumberingType) {
            let typeName = "";
            switch (numberingType) {
                case ap.models.meetings.MeetingNumberingType.CodeOccSequential:
                    typeName = this.$utility.Translator.getTranslation("app.MeetingNumberingType.CodeOccSequential");
                    break;
                case ap.models.meetings.MeetingNumberingType.CodeSequential:
                    typeName = this.$utility.Translator.getTranslation("app.MeetingNumberingType.CodeSequential");
                    break;
                case ap.models.meetings.MeetingNumberingType.OccSequential:
                    typeName = this.$utility.Translator.getTranslation("app.MeetingNumberingType.OccSequential");
                    break;
                case ap.models.meetings.MeetingNumberingType.Sequential:
                    typeName = this.$utility.Translator.getTranslation("app.MeetingNumberingType.Sequential");
                    break;
            }
            return typeName;
        }

        /**
        * Set value of "Add documents" checkbox, clear selected documents if new value is false
        **/
        public set addedDocuments(newValue: boolean) {
            if (this._addedDocuments !== newValue) {
                this._addedDocuments = newValue;
                if (!this._addedDocuments) {
                    this._meetingMultiEdit.Plans = [];
                    if (this.addNewDocumentVm.newDocuments && this.addNewDocumentVm.newDocuments.length > 0) {
                        this.addNewDocumentVm.newDocuments.splice(0);
                    }
                    this._documentsAddedToMeetings = [];
                    this.computeCanSave();
                }
            }
        }

        /**
         * Get project contacts by request string, load them from API if necessary
         */
        public loadProjectContacts(): angular.IPromise<ap.viewmodels.projectcontacts.ProjectContactItemViewModel[]> {
            let deferred: ng.IDeferred<ap.viewmodels.projectcontacts.ProjectContactItemViewModel[]> = this.$q.defer();
            if (!this._projectContacts) {
                this._controllersManager.mainController.showBusy();
                let currentProjectId = this._controllersManager.mainController.currentProject().Id;
                this._controllersManager.contactController.loadAllProjectContacts(currentProjectId, "User,IsInvited").then((contacts: ap.models.projects.ContactDetails[]) => {
                    this._projectContacts = new Array<ap.viewmodels.projectcontacts.ProjectContactItemViewModel>(contacts.length);
                    contacts.forEach((contact: ap.models.projects.ContactDetails, index: number) => {
                        contact.User.DefaultEmail = contact.User.Alias;
                        let contactVm = new ap.viewmodels.projectcontacts.ProjectContactItemViewModel(this.$utility, this.$q, null, null);
                        contactVm.init(contact);
                        this._projectContacts[index] = contactVm;
                    });
                    this._controllersManager.mainController.hideBusy();
                    deferred.resolve(this._projectContacts.filter((contact: ap.viewmodels.projectcontacts.ProjectContactItemViewModel) => {
                        return contact.email.indexOf(this._searchParticipantsText.toLowerCase(), 0) >= 0 && !contact.isChecked;
                    }));
                });
            } else {
                deferred.resolve(this._projectContacts.filter((contact: ap.viewmodels.projectcontacts.ProjectContactItemViewModel) => {
                    return contact.email.indexOf(this._searchParticipantsText.toLowerCase(), 0) >= 0 && !contact.isChecked;
                }));
            }
            return deferred.promise;
        }

        /**
        * Return true if user have added participants, plans or changed meeting's numbering type, and is available to save changes
        **/
        public get canSave() {
            return this._canSave;
        }

        /**
         * Remove participant from list of participants to be added to the meetings
         * @param item Participant entity to be removed
         */
        public removeParticipant(meetingConcern: ap.models.meetings.MeetingConcern) {
            let indexToRemove = this._meetingMultiEdit.MeetingConcerns.indexOf(meetingConcern);
            if (indexToRemove >= 0) {
                this._projectContacts.forEach((contact: ap.viewmodels.projectcontacts.ProjectContactItemViewModel) => {
                    if (contact.email === meetingConcern.User.Alias)
                        contact.isChecked = false;
                });
                this._meetingMultiEdit.MeetingConcerns.splice(indexToRemove, 1);
                this.computeCanSave();
            }
        }

        /**
        * Dispose the object
        */
        public dispose() {
            if (this._projectContacts) {
                for (let i: number = 0; i < this._projectContacts.length; i++) {
                    this._projectContacts[i].dispose();
                    this._projectContacts[i] = null;
                }
                this._projectContacts = null;
            }

            if (this._addNewDocumentViewModel) {
                this._addNewDocumentViewModel.dispose();
                this._addNewDocumentViewModel = null;
            }
        }

        /**
         * Add participant to the list of participants to be added to the meetings
         * @param participant Participant entity to be added
         */
        public addParticipant() {
            if (this._selectedContact) {
                this.addedParticipants = true;
                this._selectedContact.isChecked = true;
                let meetingConcern = new ap.models.meetings.MeetingConcern(this.$utility);
                meetingConcern.User = this._selectedContact.originalContactItem.User;
                meetingConcern.ContactDetails = this._selectedContact.originalContactItem;
                meetingConcern.AccessRightLevel = ap.models.accessRights.AccessRightLevel.Guest;
                meetingConcern.PresenceStatus = ap.models.meetings.MeetingPresenceStatus.Present;
                meetingConcern.IsInvitedOnProject = this._selectedContact.originalContactItem.IsInvited;
                this._meetingMultiEdit.MeetingConcerns.push(meetingConcern);
                this.computeCanSave();
                this._selectedContact = null;
                this._searchParticipantsText = "";
            }
        }

        /**
         * Update contact item's access rights
         * @param contactId Contact ID
         * @param accessRightLevelString New access right level string value
         */
        public updateContactAccessRight(contactDetailsItem: ap.viewmodels.projects.ContactItemViewModel, accessRightLevelString: string) {
            contactDetailsItem.contactDetails.AccessRightLevel = ap.models.accessRights.AccessRightLevel[accessRightLevelString];
        }

        /**
         * Save added contacts for multiple meetings
         */
        public postChange() {
            if (!this._canSave)
                throw new Error("Can not save data - no changes detected");
            if (this._selectedNumberingType)
                this._meetingMultiEdit.NumberingType = this._selectedNumberingType;
            if (this._documentsAddedToMeetings.length > 0) {
                this._meetingMultiEdit.Plans = this._documentsAddedToMeetings;
            }
            if (this._addNewDocumentViewModel.canSave) {
                this._addNewDocumentViewModel.save().then(() => {
                    this._saveMeetingMultiAction();
                });
            } else {
                this._saveMeetingMultiAction();
            }
        }

        /**
        * This method use for save changes for selected meetings
        **/
        private _saveMeetingMultiAction() {
            this._controllersManager.meetingController.meetingMultiAction(this.selectedMeetings, this._meetingMultiEdit).then((result: ap.models.multiactions.MeetingMultiActionResult) => {
                if (result.SkipedMeetingDescriptionList.length) {
                    let errorController = ($scope: angular.IScope) => {
                        $scope["vm"] = new ap.viewmodels.multiactions.MeetingMultiEditNotAppliedViewModel(this.$utility, this.$mdDialog, result.SkipedMeetingDescriptionList);
                    };
                    errorController.$inject = ["$scope"];
                    this.$mdDialog.show({
                        fullscreen: true,
                        clickOutsideToClose: true,
                        preserveScope: true,
                        multiple: true,
                        controller: errorController,
                        templateUrl: "me/PartialView?module=MultiActions&name=MultiActionsNotAppliedDialog"
                    });
                    this.$mdDialog.hide(result);
                } else {
                    this._controllersManager.mainController.showToast("meetings.multiedit.update", null, null, [result.Meetings.length.toString()]);
                    this.$mdDialog.hide(result);
                }
            });
        }

        /**
         * Cancel multi-edit popup window
         */
        public cancel() {
            this.$mdDialog.cancel();
        }


        /**
        * This method use for select folder for uploaded documents
        **/
        public addDocument(files: File[]) {
            this.showFolderSelector();
            this._filesToUpload = files;
        }

        /**
        * This method use for remove uploaded documents
        **/
        public removeDocument(document: ap.models.documents.Document) {
            if (this.addNewDocumentVm.newDocuments && this.addNewDocumentVm.newDocuments.length > 0) {
                for (let i = 0; i < this.addNewDocumentVm.newDocuments.length; i++) {
                    if (this.addNewDocumentVm.newDocuments[i].document.Id === document.Id) {
                        this.addNewDocumentVm.cancelDocument(this.addNewDocumentVm.newDocuments[i]);
                        break;
                    }
                }
            }
            this._removeDocumentForMeetings(document);
        }

        /**
         * This method is used to open the folder selector to let the user select folder for upload files
         */
        private showFolderSelector() {
            this._controllersManager.mainController.showBusy();

            let folderSelectorController = ($scope: angular.IScope, $timeout: angular.ITimeoutService) => {
                let folderSelectorVm = new ap.viewmodels.folders.FolderSelectorViewModel($scope, this.$mdDialog, this.$utility, this._api, this.$q, this.$timeout, this.$mdSidenav, this.$location, this.$anchorScroll, this.$interval, this._controllersManager, this.servicesManager);
                folderSelectorVm.titleKey = "app.document.select_folder_for_upload_title";
                folderSelectorVm.on("mainactionclicked", this.onFolderSelected, this);
                $scope["folderSelectorVm"] = folderSelectorVm;
            };
            folderSelectorController.$inject = ["$scope", "$timeout"];
            this.$mdDialog.show({
                clickOutsideToClose: false,
                multiple: true,
                templateUrl: "me/PartialView?module=Document&name=FolderSelector",
                fullscreen: true,
                controller: folderSelectorController,
                onComplete: () => {
                    this._controllersManager.mainController.hideBusy();
                }
            });
        }

        /**
        * This method will be called when the user has clicked on the action to import document 
        * A dialog will be shown to display the folder structure and linked docs to let the user to select some of them.
        **/
        public importDocument() {
            let self = this;
            this._controllersManager.mainController.showBusy();
            let vm: ap.viewmodels.documents.DocumentSelectorViewModel = new ap.viewmodels.documents.DocumentSelectorViewModel(this.$scope, this.$mdDialog, this.$utility, this._api, this.$q, this.$timeout, "app.notes.select_documents", "Save", this.$mdSidenav,
                this.$location, this.$anchorScroll, this.$interval, this._controllersManager, this.servicesManager);
            vm.workspace.documentListVm.isListInSelector = true;
            let importController = ($scope: angular.IScope, $timeout: angular.ITimeoutService) => {
                $scope["vm"] = vm;
                $scope["documentWorkspaceVm"] = vm.workspace;
            };
            importController.$inject = ["$scope", "$timeout"];
            this.$mdDialog.show({
                clickOutsideToClose: true,
                preserveScope: true,
                multiple: true,
                templateUrl: "me/PartialView?module=Document&name=DocumentSelector",
                fullscreen: true,
                onComplete: () => {
                    this._controllersManager.mainController.hideBusy();
                },
                controller: importController
            }).then(function (selectedDocuments: ap.viewmodels.documents.DocumentItemViewModel[]) {
                vm.dispose();
                self._addDocumentForMeetings(selectedDocuments.map(item => item.originalDocument));
            });
        }

        /**
        * This method use for check upload status document
        * @documentId - id checked document
        * return true - document is uploaded
        * return false  - document is uploading
        * return undefined  - uploading is fail
        **/
        public checkUploadingDocument(documentId: string): boolean {
            let documentToUpload: ap.misc.DocumentToUpload;
            if (!this._addNewDocumentViewModel.newDocuments) {
                return true;
            }
            for (let i = 0; i < this._addNewDocumentViewModel.newDocuments.length; i++) {
                if (this._addNewDocumentViewModel.newDocuments[i].document.Id === documentId) {
                    documentToUpload = this._addNewDocumentViewModel.newDocuments[i];
                    break;
                }
            }
            if (!!documentToUpload && documentToUpload.uploadStatus === 4) {
                return undefined;
            }
            return !documentToUpload || !!documentToUpload && documentToUpload.uploadStatus === 3;
        }

        /**
        * This method is used to reopen the add document dialog after the user select the folder 
        **/
        private onFolderSelected(selectedFolder: ap.models.projects.Folder) {
            this.$mdDialog.hide();
            this._addNewDocumentViewModel.addFiles(this._filesToUpload, selectedFolder);
            let documents: ap.models.documents.Document[] = this._addNewDocumentViewModel.newDocuments.map(item => <ap.models.documents.Document>item.document);
            this._addDocumentForMeetings(documents);
        }

        /**
        * This method use for add selected/uploaded documents
        **/
        private _addDocumentForMeetings(documents: ap.models.documents.Document[]) {
            for (let j = 0; j < documents.length; j++) {
                let canAdd = true;
                for (let i = 0; i < this._documentsAddedToMeetings.length; i++) {
                    if (documents[j].Id === this._documentsAddedToMeetings[i].Id) {
                        canAdd = false;
                        break;
                    }
                }
                if (canAdd)
                    this._documentsAddedToMeetings.push(documents[j]);
            }
            if (this._documentsAddedToMeetings.length > 0) {
                this.addedDocuments = true;
            }
            this.computeCanSave();
        }

        /**
        * This method use for remove selected/uploaded documents
        * @document - it document for remove from _documentsAddedToMeetings
        **/
        private _removeDocumentForMeetings(document: ap.models.documents.Document) {
            for (let i = 0; i < this._documentsAddedToMeetings.length; i++) {
                if (document.Id === this._documentsAddedToMeetings[i].Id) {
                    this._documentsAddedToMeetings.splice(i, 1);
                    break;
                }
            }
            if (this._documentsAddedToMeetings.length === 0) {
                this.addedDocuments = false;
            }
            this.computeCanSave();
        }

        /**
         * Check if user can save its changes
         */
        private computeCanSave() {
            this._canSave = (!!this._addedParticipants && this._meetingMultiEdit.MeetingConcerns.length > 0) || (this._changedNumberingType === true && !!this._selectedNumberingType) || (!!this._addedDocuments && this._documentsAddedToMeetings.length > 0);
        }

        constructor(private $utility: ap.utility.UtilityHelper, private $scope: ng.IScope, private _api: ap.services.apiHelper.Api, private $q: angular.IQService,
            private _controllersManager: ap.controllers.ControllersManager, private servicesManager: ap.services.ServicesManager, private $timeout: angular.ITimeoutService, private $mdDialog: angular.material.IDialogService, private $mdSidenav: angular.material.ISidenavService, private $location: angular.ILocationService, private $anchorScroll: angular.IAnchorScrollService, private $interval: angular.IIntervalService,
            private selectedMeetings: ap.models.meetings.Meeting[]) {
            this._addedParticipants = false;
            this._addedDocuments = false;
            let onlyPicture = !this._controllersManager.mainController.currentProject().UserAccessRight.CanUploadDoc;
            let photoFolder: ap.models.projects.Folder = null;
            if (onlyPicture) {
                photoFolder = new ap.models.projects.Folder(this.$utility);
                photoFolder.createByJson({ Id: this._controllersManager.mainController.currentProject().PhotoFolderId });
            }
            this._addNewDocumentViewModel = new ap.viewmodels.documents.AddNewDocumentViewModel(this.$utility, this._controllersManager.documentController, this._controllersManager.mainController, $mdDialog, this.servicesManager.cloudService, this.$interval, onlyPicture, photoFolder, undefined, true);
            this._meetingMultiEdit = new ap.models.multiactions.MeetingMultiEdit();
            this._canSave = false;
            this._selectedNumberingType = null;
            this._documentAccessRight = new ap.models.accessRights.DocumentAccessRight($utility, null, this._controllersManager.mainController.currentProject());

            $scope.$on("$destroy", () => {
                this.dispose();
            });
        }

        private _meetingMultiEdit: ap.models.multiactions.MeetingMultiEdit;
        private _documentAccessRight: ap.models.accessRights.DocumentAccessRight;
        private _projectContacts: ap.viewmodels.projectcontacts.ProjectContactItemViewModel[];
        private _addedParticipants: boolean;
        private _changedNumberingType: boolean;
        private _addedDocuments: boolean;
        private _addNewDocumentViewModel: ap.viewmodels.documents.AddNewDocumentViewModel;
        private _filesToUpload: File[];
        private _canSave: boolean;
        private _searchParticipantsText: string;
        private _documentsAddedToMeetings: ap.models.documents.Document[] = [];
        private _selectedContact: ap.viewmodels.projectcontacts.ProjectContactItemViewModel; // need this one to be set to null when contact is selected
        private _selectedNumberingType: ap.models.meetings.MeetingNumberingType; // need this property to track numbering type changes without running a watcher
    }
}