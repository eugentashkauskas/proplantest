module ap.viewmodels.projectcontacts {

    /**
     * Class to manage the lists access rights of users in the project
     * @class
     */
    export class UserAccessRightsListViewModel extends ListWorkspaceViewModel {

        /**
        * Use to get the contactHeaderViewModel (contains the list of contacts)
        **/
        public get contactHeaderViewModel(): ContactHeaderViewModel {
            return this._contactHeaderViewModel;
        }

        /**
        * Method use to get screenInfo
        **/
        public get screenInfo(): ap.misc.ScreenInfo {
            return this._screenInfo;
        }

        /**
         * This method is used to initialize the screen meeting access screen
         */
        public initScreen() {
            this._editAction = new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "projectmanage.edit", this.$utility.rootUrl + "Images/html/icons/ic_create_black_48px.svg", false, null, "Edit participants access rights", true);
            this._saveAction = new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "projectmanage.save", this.$utility.rootUrl + "Images/html/icons/ic_save_black_48px.svg", false, null, "Save changes", false);
            this._cancelAction = new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "projectmanage.cancel", this.$utility.rootUrl + "Images/html/icons/ic_cancel_black_48px.svg", false, null, "Cancel changes", false);
            let actions = [this._editAction, this._saveAction, this._cancelAction];
            this._screenInfo = new ap.misc.ScreenInfo(this.$utility, "projectmanage.listAccess", ap.misc.ScreenInfoType.List, actions, null, null, null, null, false);
            this._screenInfo.on("actionclicked", this.actionClickedHandler, this);
            this.checkEditAccess();
        }

        /*
        * Dispose the object
        */
        public dispose() {
            if (this.listVm) {
                this.listVm.dispose();
            }
            if (this.contactHeaderViewModel) {
                this.contactHeaderViewModel.dispose();
            }
            this._screenInfo.dispose();
        }

        /**
        * Methode use to get the links between the meetings and the contacts of the project
        **/
        private getMeetingConcernsOfUsers(loadedMeetings?: MeetingItemLinksViewModel[], contactIds?: string[]) {
            if (this.listVm.isIdsLoaded && this.contactHeaderViewModel.isIdsLoaded && this.listVm.getPage(0).isLoaded) {

                let itemsToCheck: MeetingItemLinksViewModel[] = loadedMeetings ? loadedMeetings : <MeetingItemLinksViewModel[]>this.listVm.sourceItems.slice();

                // get current contact ids
                let contactsIds: string[] = [];
                let meetingsIds: string[] = [];
                for (let i = 0; i < this.contactHeaderViewModel.currentContactList.length; i++) {
                    for (let j: number = 0; j < itemsToCheck.length; j++) {
                        if ((itemsToCheck[j] && !itemsToCheck[j].currentInfoList[i].meetingConcern) || !!itemsToCheck[j].meeting.IsPublic) {
                            let currentContactId: string = (<models.projects.ContactDetails>this.contactHeaderViewModel.currentContactList[i].originalEntity).User.Id;
                            if (contactsIds.indexOf(currentContactId) < 0) {
                                contactsIds.push(currentContactId);
                            }

                            if (meetingsIds.indexOf(itemsToCheck[j].originalEntity.Id) < 0) {
                                meetingsIds.push(itemsToCheck[j].originalEntity.Id);
                            }
                        }
                    }
                }

                this.loadMeetingConcerns(itemsToCheck, contactsIds, meetingsIds);
            }
        }

        /**
         * Load meetingConcerns entities which are links between users and meetings.
         * @param itemsToCheck Meetings to for which MeetingConcerns are loaded
         * @param contactsIds Contacts for which MeetingConcerns are loaded
         * @param meetingsIds Meetings ids to for which MeetingConcerns are loaded
         * @param forceUpdate Force refresh data after they're saved in the DB
         */
        private loadMeetingConcerns(itemsToCheck: MeetingItemLinksViewModel[], contactsIds?: string[], meetingsIds?: string[], afterSave: boolean = false) {
            if (meetingsIds.length || contactsIds.length) {

                let meetingConcernParam: ap.models.meetings.MeetingConcernParams = new ap.models.meetings.MeetingConcernParams(meetingsIds, contactsIds);
                this._servicesManager.meetingService.getMeetingConcernAccess(meetingConcernParam, true).then((meetingConcerns: ap.models.meetings.MeetingConcern[]) => {

                    for (let i = 0; i < itemsToCheck.length; i++) {
                        if (!itemsToCheck[i]) {
                            continue; // it means the meeting is not yet loaded
                        }
                        if (afterSave) {
                            this.updateMeetingConcerns(<MeetingItemLinksViewModel>itemsToCheck[i], meetingConcerns, /*0, contactsLength, */ true /*, contactListToUpdateDic*/);
                        } else {
                            // startIndex and endIndex are used to only update the contact of the currentPage
                            this.updateMeetingConcerns(<MeetingItemLinksViewModel>itemsToCheck[i], meetingConcerns, /*startIndex, endIndex*/);
                        }
                    }
                });
            }
        }

        /**
         * Methode used to update the meetingConcerns
         * @param itemToCheck the List which has been updated
         * @param meetingConcerns the link found
         * @param startIndex the start index of the array
         * @param endIndex the end index of the array
         * @param afterSave use to know if this method is called after the save method
         * @param contactList the dictionnary which contains the ids of the item updated and there positions in the list
         */
        private updateMeetingConcerns(itemToCheck: MeetingItemLinksViewModel, meetingConcerns: ap.models.meetings.MeetingConcern[], /*startIndex: number, endIndex: number,*/ afterSave: boolean = false /*, contactList: IDictionary<string, number> = null*/) {
            let contactsLength: number = this.contactHeaderViewModel.sourceItems.length;
            let currentPage: number = this.contactHeaderViewModel.currentPageNumber;
            let startIndex: number = currentPage * this.contactHeaderViewModel.pageSize;
            let endIndex: number = startIndex + this.contactHeaderViewModel.pageSize < contactsLength ? startIndex + this.contactHeaderViewModel.pageSize : contactsLength;
            let contactsLengthToCheck: number = afterSave ? endIndex : this.contactHeaderViewModel.currentContactList.length;

            for (let j = 0; j < contactsLengthToCheck; j++) {

                let linkFound: boolean = false;
                // Search if a link correspond to the meeting and the contact
                for (let x = 0; x < meetingConcerns.length; x++) {
                    if ((meetingConcerns[x].Meeting.Id === itemToCheck.originalEntity.Id) &&
                        ((!afterSave && meetingConcerns[x].User.Id === (<ap.models.projects.ContactDetails>this.contactHeaderViewModel.currentContactList[j].originalEntity).User.Id) ||
                            (afterSave && this.contactHeaderViewModel.sourceItems[j] && meetingConcerns[x].User.Id === (<ap.models.projects.ContactDetails>this.contactHeaderViewModel.sourceItems[j].originalEntity).User.Id))) {

                        if (!afterSave) {
                            itemToCheck.currentInfoList[j].meeting = itemToCheck.meeting; // meetingConcerns[x].Meeting;
                            itemToCheck.currentInfoList[j].meetingConcern = meetingConcerns[x];
                            itemToCheck.currentInfoList[j].selectedAccessRight = meetingConcerns[x].AccessRightLevel;
                            itemToCheck.currentInfoList[j].value = meetingConcerns[x].AccessRightLevel;
                        } else {
                            itemToCheck.infoList[j].meeting = itemToCheck.meeting; // meetingConcerns[x].Meeting;
                            itemToCheck.infoList[j].meetingConcern = meetingConcerns[x];
                            itemToCheck.infoList[j].selectedAccessRight = meetingConcerns[x].AccessRightLevel;
                            itemToCheck.infoList[j].value = meetingConcerns[x].AccessRightLevel;
                        }

                        linkFound = true;
                        break;
                    }
                }
                // If the list is private and no links were found, need to set the access right to "not invited"
                if (linkFound === false && !itemToCheck.meeting.IsPublic && !afterSave) {
                    let meetingConcern: models.meetings.MeetingConcern = new ap.models.meetings.MeetingConcern(this.$utility);
                    meetingConcern.Meeting = (<models.meetings.Meeting>itemToCheck.originalEntity);
                    meetingConcern.AccessRightLevel = null;
                    meetingConcern.User = afterSave ? (<models.projects.ContactDetails>this.contactHeaderViewModel.sourceItems[j].originalEntity).User :
                        (<models.projects.ContactDetails>this.contactHeaderViewModel.currentContactList[j].originalEntity).User;
                    itemToCheck.currentInfoList[j].meeting = meetingConcern.Meeting;
                    itemToCheck.currentInfoList[j].meetingConcern = meetingConcern;
                    itemToCheck.currentInfoList[j].selectedAccessRight = 6;
                    itemToCheck.currentInfoList[j].value = null;
                }
            }
        }

        /**
        * Method use to save the changes made by the user
        **/
        private save() {
            let rowToKeep: MeetingItemLinksViewModel[] = [];
            let saveString: string = "";
            let contactsIds: string[];
            let contactsFromMeeting: IDictionary<string, IDictionary<string, number>> = new Dictionary<string, IDictionary<string, number>>();
            let contactsValues: IDictionary<string, number[]> = new Dictionary<string, number[]>();
            let meetingUpdated: ap.viewmodels.projectcontacts.MeetingItemLinksViewModel[] = [];

            // use to initialize cells of removed contacts to "Not invited"
            // let meetingConcernsRemoved: IDictionary<string, MeetingConcernsRemovedParams> = new Dictionary<string, MeetingConcernsRemovedParams>();
            let meetingConcernsRemoved: IDictionary<string, ap.models.actors.User[]> = new Dictionary<string, ap.models.actors.User[]>();

            // Keep only the row where there is at least one item changed
            for (let x = 0; x < this.listVm.sourceItems.length; x++) {
                if (this.listVm.sourceItems[x] && (<MeetingItemLinksViewModel>this.listVm.sourceItems[x]).getChangedItems().length > 0) {
                    rowToKeep.push(<MeetingItemLinksViewModel>this.listVm.sourceItems[x]);
                }
            }

            // Fill both dictionnaries contactsFromMeeting and contactsValues
            // contactsFromMeeting contains the id of the meeting (key) and a dictionnary with the key -> userId and the value -> valueToSave (value)
            // contactsValues contains the user id (key) and an array of valuesToSave (value)
            // valueToSave is a number from 0 to 6 used to know the value of the dropdown (accessRigth). The number 6 means that nothing changes for this contact in this list
            for (let y = 0; y < rowToKeep.length; y++) {
                for (let i = 0; i < rowToKeep[y].infoList.length; i++)
                    if (rowToKeep[y].infoList[i].meetingConcern) {
                        let value: number = rowToKeep[y].infoList[i].valueToSave;
                        let currentUser: ap.models.actors.User = rowToKeep[y].infoList[i].meetingConcern.User;
                        let currentMeeting: ap.models.meetings.Meeting = rowToKeep[y].infoList[i].meetingConcern.Meeting;
                        let currentUserId: string = currentUser.Id;
                        let currentMeetingId: string = currentMeeting.Id;

                        if (contactsValues.containsKey(currentUserId)) {
                            contactsValues.getValue(currentUserId).push(value);
                        } else {
                            contactsValues.add(currentUserId, [value]);
                        }

                        if (value === 0) {
                            if (!meetingConcernsRemoved.containsKey(currentMeetingId)) {
                                meetingConcernsRemoved.add(currentMeetingId, [currentUser]);
                            } else {
                                meetingConcernsRemoved.getValue(currentMeetingId).push(currentUser);
                            }
                        }

                        if (contactsFromMeeting.containsKey(currentMeetingId)) {
                            contactsFromMeeting.getValue(currentMeetingId).add(currentUserId, value);
                        } else {
                            let dic = new Dictionary<string, number>();
                            dic.add(currentUserId, value);
                            contactsFromMeeting.add(currentMeetingId, dic);
                            meetingUpdated.push(rowToKeep[y]);
                        }
                    }
            }

            contactsIds = contactsValues.keys();

            // Remove contacts with no changes (means if the values of the array of the dictionary contactsValues are all equal to 6)
            let deleteColumns: boolean = true;
            for (let m = 0; m < contactsIds.length; m++) {
                let values = contactsValues.getValue(contactsIds[m]);
                for (let n = 0; n < values.length; n++) {
                    if (values[n] !== 6) {
                        deleteColumns = false;
                        break;
                    }
                }
                if (deleteColumns) {
                    contactsValues.remove(contactsIds[m]);
                }
                deleteColumns = true;
            }


            contactsIds = contactsValues.keys();
            let meetingsIds: string[] = contactsFromMeeting.keys();

            // Start to generate the string to send to the API
            for (let i = 0; i < contactsIds.length - 1; i++) {
                saveString = saveString + contactsIds[i] + ",";
            }

            saveString = saveString + contactsIds[contactsIds.length - 1] + "/";

            for (let i = 0; i < meetingsIds.length; i++) {
                let contactsIdsOfMeetings: IDictionary<string, number> = contactsFromMeeting.getValue(meetingsIds[i]);
                saveString = saveString + meetingsIds[i] + ",";
                for (let j = 0; j < contactsIds.length; j++) {
                    saveString = saveString + contactsIdsOfMeetings.getValue(contactsIds[j]);
                }
                saveString = saveString + "/";
            }
            saveString = saveString.slice(0, saveString.length - 1);
            // End of the string to send to the API

            this._servicesManager.meetingService.updateMeetingConcernAccess(saveString, this.$controllersManager.mainController.currentProject().Id).then(() => {
                this._changedItems.splice(0);
                this.goToReadMode();
                this.loadMeetingConcerns(meetingUpdated, contactsIds, meetingsIds, true);
                this.resetRemovedContacts(meetingConcernsRemoved);
            });
        }

        /**
         * Reset removed contacts to not invited
         * @param meetingConcernsRemoved To know which users 
         */
        private resetRemovedContacts(meetingConcernsRemoved: IDictionary<string, ap.models.actors.User[]>) {
            let length: number = meetingConcernsRemoved.values().length;
            let keys: string[] = meetingConcernsRemoved.keys();

            // first loop through all meetings updated
            for (let i: number = 0; i < length; i++) {
                let removedUsers: ap.models.actors.User[] = meetingConcernsRemoved.getValue(keys[i]);
                let userRemovedLength: number = removedUsers.length;
                let currentMeetingItemVm: MeetingItemLinksViewModel = <MeetingItemLinksViewModel>this.listVm.getEntityById(keys[i]);

                // then loop through all users removed from that meeting
                for (let j = 0; j < userRemovedLength; j++) {

                    let userFound: boolean = false;

                    // find the current elements in the grid
                    for (let k: number = 0; k < currentMeetingItemVm.infoList.length; k++) {

                        if (currentMeetingItemVm.infoList[k] && currentMeetingItemVm.infoList[k].meetingConcern && currentMeetingItemVm.infoList[k].meetingConcern.User.Id === removedUsers[j].Id) {

                            userFound = true;

                            if (!currentMeetingItemVm.meeting.IsPublic) {

                                // it's found and the meeting is not public -> set 'Not invited'
                                let meetingConcern: models.meetings.MeetingConcern = new ap.models.meetings.MeetingConcern(this.$utility);
                                meetingConcern.Meeting = currentMeetingItemVm.meeting;
                                meetingConcern.User = removedUsers[j];
                                meetingConcern.AccessRightLevel = null;
                                currentMeetingItemVm.infoList[k].meeting = meetingConcern.Meeting;
                                currentMeetingItemVm.infoList[k].meetingConcern = meetingConcern;
                                currentMeetingItemVm.infoList[k].resetSelectedAccessRight(6);
                                currentMeetingItemVm.infoList[k].value = null;
                            }
                        }

                        if (userFound) {
                            removedUsers.splice(j, 1);
                            userRemovedLength--;

                            break;
                        }
                    }
                }
            }
        }

        /**
        * Method use to manage actions
        **/
        private actionClickedHandler(action: string) {
            switch (action) {
                case "projectmanage.edit":
                    this.goToEditMode();
                    break;
                case "projectmanage.save":
                    let currentProject: ap.models.projects.Project = this.$controllersManager.mainController.currentProject();
                    this._servicesManager.toolService.sendEvent("cli-action-save project participants project rights",
                        new Dictionary([
                            new KeyValue("cli-action-save project participants project rights-screenname", "projects"),
                            new KeyValue("cli-action-save project participants project rights-project name", currentProject.Name),
                            new KeyValue("cli-action-save project participants project rights-project id", currentProject.Id)
                        ])
                    );

                    this.save();
                    break;
                case "projectmanage.cancel":
                    this.getMeetingConcernsOfUsers();
                    this.goToReadMode();
                    break;
            }
        }

        /**
        * Method use to go to the read mode
        **/
        private goToReadMode() {
            this.screenInfo.isEditMode = false;
            this.checkEditAccess();
            this._listener.raise("editmodechanged", new base.EditModeEvent(this));
        }

        /**
        * Method use to go to the edit mode
        **/
        private goToEditMode() {
            this.screenInfo.isEditMode = true;
            this.checkEditAccess();
            this._listener.raise("editmodechanged", new base.EditModeEvent(this));
        }

        /**
        * Private method used to know if the user can edit meetings rights
        **/
        private checkEditAccess() {
            if (this.$utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_MeetingAccessRight)) {
                this._editAction.isVisible = !this._screenInfo.isEditMode;
            } else {
                this._editAction.isVisible = false;
            }
            this._saveAction.isVisible = this._screenInfo.isEditMode;
            this._saveAction.isEnabled = this._screenInfo.isEditMode && (this._changedItems.length > 0);
            this._cancelAction.isVisible = this._screenInfo.isEditMode;
            this._cancelAction.isEnabled = this._screenInfo.isEditMode;
        }

        /**
        * Use to push or remove changed items from _changedItems array
        * @param info the ProjectContactInfoInMeetingViewModel which accessrigth has been changed
        **/
        private checkHasChanged(info: ap.viewmodels.projectcontacts.ProjectContactInfoInMeetingViewModel) {
            if (info.meetingConcern.AccessRightLevel === null) {
                if (info.selectedAccessRight !== 6) {
                    if (this._changedItems.indexOf(info) === -1) {
                        this._changedItems.push(info);
                    }
                } else {
                    if (this._changedItems.indexOf(info) > -1) {
                        this._changedItems.splice(this._changedItems.indexOf(info), 1);
                    }
                }
            } else if (info.meetingConcern.AccessRightLevel !== info.selectedAccessRight) {
                if (this._changedItems.indexOf(info) === -1) {
                    this._changedItems.push(info);
                }
            } else {
                if (this._changedItems.indexOf(info) > -1) {
                    this._changedItems.splice(this._changedItems.indexOf(info), 1);
                }
            }
            this.checkEditAccess();
        }

        /**
        * This method init the MeetingItemLinksViewModel when the page is loaded
        * @param itemsVm -> the list of MeetingItemLinksViewModel loaded
        **/
        private pageLoadedHandler(itemsVm: MeetingItemLinksViewModel[]) {
            if (!itemsVm)
                return;

            // initialize each Vm
            itemsVm.forEach((item: MeetingItemLinksViewModel) => {
                for (let j = 0; j < this.contactHeaderViewModel.count; j++) {
                    this.initInfoViewModel(item, <ContactHeaderItemViewModel>this.contactHeaderViewModel.sourceItems[j], j);
                }
                // initialize each Vm of the current page with a contact
                let currentPage: number = this.contactHeaderViewModel.currentPageNumber;
                let startIndex: number = currentPage * this.contactHeaderViewModel.pageSize;
                let endIndex: number = startIndex + this.contactHeaderViewModel.pageSize < this.contactHeaderViewModel.count ? startIndex + this.contactHeaderViewModel.pageSize : this.contactHeaderViewModel.count;
                let contactMeetingInfo: ap.viewmodels.projectcontacts.ProjectContactInfoInMeetingViewModel[] = item.infoList.slice(startIndex, endIndex);

                this.setContactToMeetingInfo(contactMeetingInfo, this.contactHeaderViewModel.currentContactList);
                item.currentVisibilityPage = currentPage;
            });

            this.getMeetingConcernsOfUsers(itemsVm);
        }

        /**
         * Method used to create the infoViewModel for the loaded contact only if it's not yet existing otherwise we would erase the data changed by the user
         * @param item the item where we need to put infoViewModel in it
         */
        private initInfoViewModel(item: MeetingItemLinksViewModel, contact: ContactHeaderItemViewModel, index: number) {
            if (contact && !item.infoList[index]) {
                let info: ap.viewmodels.projectcontacts.ProjectContactInfoInMeetingViewModel = new ap.viewmodels.projectcontacts.ProjectContactInfoInMeetingViewModel(this.$utility, ValueType.Selector, null, this.$controllersManager.mainController.currentProject());
                info.on("selectedaccessrightchanged", this.checkHasChanged, this);
                item.infoList.push(info);

                // if a vm isPublic need to get the project access
                if ((<models.meetings.Meeting>item.originalEntity).IsPublic) {
                    let meetingConcern: models.meetings.MeetingConcern = new ap.models.meetings.MeetingConcern(this.$utility);
                    meetingConcern.Meeting = <models.meetings.Meeting>item.originalEntity;
                    meetingConcern.AccessRightLevel = (<models.projects.ContactDetails>this.contactHeaderViewModel.sourceItems[index].originalEntity).AccessRightLevel;
                    meetingConcern.User = (<models.projects.ContactDetails>this.contactHeaderViewModel.sourceItems[index].originalEntity).User;

                    item.infoList[index].meetingConcern = meetingConcern;
                    item.infoList[index].meeting = <models.meetings.Meeting>item.originalEntity;
                    item.infoList[index].selectedAccessRight = meetingConcern.AccessRightLevel;
                    item.infoList[index].value = meetingConcern.AccessRightLevel;
                }
            }
        }

        /**
        * Method use to set the contact to each cells (ProjectContactInfoInMeetingViewModel)
        * @param contactMeetingInfo the list of ProjectContactInfoInMeetingViewModel (represents a cell)
        * @param contacts the list of visible contacts
        **/
        private setContactToMeetingInfo(contactMeetingInfo: ap.viewmodels.projectcontacts.ProjectContactInfoInMeetingViewModel[], contacts: ContactHeaderItemViewModel[]) {
            let i: number = 0;
            contactMeetingInfo.forEach((info: ap.viewmodels.projectcontacts.ProjectContactInfoInMeetingViewModel) => {
                if (!info.contact) {
                    if (contacts[i]) {
                        info.contact = <ap.models.projects.ContactDetails>contacts[i].originalEntity;
                    }
                }
                i++; // take the next contact
            });
        }

        /**
         * Refresh the list
         */
        private loadList(refresh: boolean = false) {
            if (this.contactHeaderViewModel.currentContactList && this.contactHeaderViewModel.currentContactList.length) {
                this.load();
            } else {
                this.contactHeaderViewModel.on("pageChanged", this.contactPageChangedHandler, this);
            }
        }

        /**
        * Method use to init the different cells with the new contacts loaded
        **/
        private contactPageChangedHandler() {
            if (this.listVm.isIdsLoaded && this.contactHeaderViewModel.isIdsLoaded) {
                let currentPage: number = this.contactHeaderViewModel.currentPageNumber;
                let startIndex: number = currentPage * this.contactHeaderViewModel.pageSize;
                let endIndex: number = startIndex + this.contactHeaderViewModel.pageSize < this.contactHeaderViewModel.count ? startIndex + this.contactHeaderViewModel.pageSize : this.contactHeaderViewModel.count;
                let contactsList: ContactHeaderItemViewModel[] = <ContactHeaderItemViewModel[]>this.contactHeaderViewModel.sourceItems.slice(startIndex, endIndex);
                this.listVm.sourceItems.forEach((meetingLinks: ap.viewmodels.projectcontacts.MeetingItemLinksViewModel) => {
                    if (meetingLinks) {
                        if (meetingLinks.infoList.length < endIndex) {
                            for (let i = startIndex; i < endIndex; i++) {
                                this.initInfoViewModel(meetingLinks, <ContactHeaderItemViewModel>this.contactHeaderViewModel.sourceItems[i], i);
                            }
                        }
                        // Set the page of the Vm to force it to update the current visibility list
                        meetingLinks.currentVisibilityPage = currentPage;
                        this.setContactToMeetingInfo(meetingLinks.currentInfoList, contactsList);
                    }
                });
                this.getMeetingConcernsOfUsers();
            } else {
                this.load();
            }
        }

        /**
        * This method is overrided to build the default filter to get the entities.
        **/
        protected buildCustomFilter(): angular.IPromise<string> {
            let deferred = this.$q.defer<string>();
            let filter: string;
            filter = Filter.eq("Project.Id", this.$controllersManager.mainController.currentProject().Id);
            filter = Filter.and(filter, Filter.isFalse("IsSystem"));
            filter = Filter.and(filter, Filter.isFalse("IsArchived"));
            deferred.resolve(filter);
            return deferred.promise;
        }

        constructor($utility: ap.utility.UtilityHelper, $q: angular.IQService, private _controllersManager: ap.controllers.ControllersManager, private _servicesManager: ap.services.ServicesManager, $timeout: angular.ITimeoutService, private _selectedContactsIds?: string[]) {
            super($utility, _controllersManager, $q, new GenericPagedListOptions("Meeting", ap.viewmodels.projectcontacts.MeetingItemLinksViewModel, "UserAccessRight", "titleasc", 50, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, true));
            this._listener.addEventsName(["editmodechanged"]);
            this._contactHeaderViewModel = new ContactHeaderViewModel($utility, $q, _controllersManager, false, this._selectedContactsIds);
            this.initScreen();
            this.loadList();
            this.listVm.on("pageloaded", this.pageLoadedHandler, this);
        }
        private _initProjectContactInfoInMeetingViewModel: boolean = false;
        private _contactHeaderViewModel: ContactHeaderViewModel;
        private _screenInfo: ap.misc.ScreenInfo;
        private _editAction: home.ActionViewModel;
        private _saveAction: home.ActionViewModel;
        private _cancelAction: home.ActionViewModel;
        private _isSomethingChanged: boolean = false;
        private _changedItems: ap.viewmodels.projectcontacts.ProjectContactInfoInMeetingViewModel[] = [];
    }
}