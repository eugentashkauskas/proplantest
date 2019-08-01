module ap.viewmodels.meetingcontacts {

    /**
     * ViewModel of one row of the access rights of a Meeting
     * Each ViewModel represents a specific access right and thus contains all the users and boolean values for each to tell if the user
     * has the access right or not
     */
    export class MeetingAccessRightUserItemViewModel extends ap.viewmodels.projectcontacts.AccessRightUsersItemViewModel {

        /**
        * Return current access right's label
        **/
        public get label() {
            return this._label;
        }

        /**
        * Return current info list to be displayed on the selected view page
        **/
        public get currentInfoList() {
            return this._currentInfoList;
        }

        /**
        * Use to know if at least one contact has his access right changed
        **/
        public get hasChanged(): boolean {
            return this._dirtyItems.length > 0;
        }

        /**
        * Method which put the changed item in _dirtyItems
        * @param val : the MeetingContactInfoViewModel which has changed
        **/
        public accessRightHasChanged(val: ap.viewmodels.projectcontacts.MeetingContactInfoViewModel) {
            if (val.hasChanged === true) {
                for (let i = 0; i < this._dirtyItems.length; i++) {
                    if (this._dirtyItems[i] === val.contact.Id) {
                        return;
                    }
                }
                this._dirtyItems.push(val.contact.Id);
            } else {
                for (let i = 0; i < this._dirtyItems.length; i++) {
                    if (this._dirtyItems[i] === val.contact.Id) {
                        this._dirtyItems.splice(i, 1);
                    }
                }
            }
        }

        /**
         * This method is called when we need to initialize contact's data for the current page
         * @param viewPage View page number The current page displayed on screen (10 contacts maximum)
         * @param listPage List page number Will always be 0 for this case because in a meeting, all the contacts are loaded by default
         */
        public initCurrentPageInfoList(viewPage: number, listPage: number) {
            let startViewIndex = viewPage * 10;
            let endViewIndex = startViewIndex + 10;
            let contactsData = this.getContactsData(listPage).values();
            if (contactsData) {
                if (endViewIndex >= contactsData.length)
                    endViewIndex = undefined;
                this._currentInfoList = (<ap.viewmodels.projectcontacts.MeetingContactInfoViewModel[]>contactsData).slice(startViewIndex, endViewIndex);
            }
        }

        /**
        * Methode use to raise selectedaccessrightchanged to update the table
        */
        private raiseSelectedAccess(info: ap.viewmodels.projectcontacts.MeetingContactInfoViewModel) {
            this._listener.raise("selectedaccessrightchanged", info);
        }

        /**
        * Method use to update the different cells depends of selectedAccessRight
        * @param info the ContactInfoViewModel which need to be updated with the correct value
        */
        public updateInfo(info: ap.viewmodels.projectcontacts.MeetingContactInfoViewModel) {
            for (let i = 0; i < this.currentInfoList.length; i++) {
                if ((<ap.viewmodels.projectcontacts.MeetingContactInfoViewModel>this.currentInfoList[i]).contact.Id === info.contact.Id) {
                    if (this._accessRights) {
                        for (let j = 0; j < this._accessRights.length; j++) {
                            if (this._accessRights[j].Level.toString() === info.selectedAccessRight.toString()) {
                                if (this.name === "" && this._accessRights[j].Level === ap.models.accessRights.AccessRightLevel.Admin) { // Admin has the access of All
                                    this.currentInfoList[i].value = true;
                                    break;
                                } else {
                                    this.currentInfoList[i].value = this._accessRights[j][this.name] === true;
                                    break;
                                }
                            }
                        }
                    } else {
                        this.currentInfoList[i].value = false;
                        break;
                    }
                }
            }
        }

        constructor(Utility: ap.utility.UtilityHelper, $q: angular.IQService, parentListVm?: BaseListEntityViewModel, accessName?: string, label?: string, type?: ap.viewmodels.projectcontacts.ValueType, contacts?: ap.models.meetings.MeetingConcern[], private parameters?: ap.viewmodels.projectcontacts.UserProjectAccessRightItemParameter, private _accessRights?: ap.models.accessRights.MeetingAccessRight[]) {
            super(Utility, $q, accessName, type);
            this._label = label;
            this._listener.addEventsName(["selectedaccessrightchanged"]);
            let contactDetailsInfo = new Dictionary<string, any>();
            if (contactDetailsInfo) {
                contacts.forEach((contact: ap.models.meetings.MeetingConcern) => {
                    let infoData = this.typeEnum === ap.viewmodels.projectcontacts.ValueType.Header ? contact.DisplayName :
                        this.typeEnum === ap.viewmodels.projectcontacts.ValueType.Selector ? contact.AccessRightLevel :
                            contact.Meeting.UserAccessRight[this.name] === true;
                    let meetingConcernInfoViewModel = new ap.viewmodels.projectcontacts.MeetingContactInfoViewModel(this.$utility, type, infoData, contact, this.parameters ? this.parameters.controllersManager.mainController.currentProject() : null, this.parameters.controllersManager.mainController.currentMeeting);
                    meetingConcernInfoViewModel.selectedAccessRight = contact.AccessRightLevel;
                    contactDetailsInfo.add(contact.Id, meetingConcernInfoViewModel);
                    meetingConcernInfoViewModel.on("selectedaccessrightchanged", this.raiseSelectedAccess, this);
                    meetingConcernInfoViewModel.on("haschangedchanged", this.accessRightHasChanged, this);
                });
                this.setContactsData(0, contactDetailsInfo);
                this.initCurrentPageInfoList(0, 0);
            }
        }

        private _label: string;
        private _currentInfoList: ap.viewmodels.projectcontacts.MeetingContactInfoViewModel[];
        private _dirtyItems: String[] = [];
    }
}