module ap.viewmodels.meetingcontacts {

    /**
     * Class representing the list of access rights of each user of a meeting
     */
    export class UserMeetingAccessRightListViewModel implements IDispose {

        /**
        * This property is to get the currentPageNumber
        **/
        public get currentPageNumber(): number {
            return this._currentPageNumber;
        }

        /**
        * This is the list of elements bound to the view
        **/
        public get currentContactList(): ap.viewmodels.meetingcontacts.MeetingContactViewModel[] {
            return this._currentContactList;
        }

        /**
        * This is the list of meetingAccessRightUserItemList
        **/
        public get meetingAccessRightUserItemList(): ap.viewmodels.meetingcontacts.MeetingAccessRightUserItemViewModel[] {
            return this._meetingAccessRightUserItemList;
        }

        /**
        * This is the list of the access of the list
        **/
        public get accessRightList(): ap.models.accessRights.MeetingAccessRight[] {
            return this._accessRightList;
        }

        /**
        * This property is to increment the currentPageNumber
        **/
        public incrementCurrentPageNumber() {
            this._currentPageNumber++;
            this.updateContactList();
            this.privateUpdateCurrentContactInfo();
        }

        /**
         * Updates the current contactInfo array of each item of the list (when a page changes)
         */
        privateUpdateCurrentContactInfo() {
            this._meetingAccessRightUserItemList.forEach((item: ap.viewmodels.meetingcontacts.MeetingAccessRightUserItemViewModel) => {
                item.initCurrentPageInfoList(this._currentPageNumber, 0);
            });
        }

        /**
       * This property is to decrement the currentPageNumber
       **/
        public decrementCurrentPageNumber() {
            this._currentPageNumber--;
            this.updateContactList();
            this.privateUpdateCurrentContactInfo();
        }

        /**
        * This property is to know if there is a next page
        **/
        public get nextPage(): boolean {
            return this._currentPageNumber < this._numberOfPage - 1;
        }

        /**
        * This property is to know if there is a previous page
        **/
        public get previousPage(): boolean {
            return this._currentPageNumber > 0;
        }

        /**
        * Method use to get screenInfo
        **/
        public get screenInfo(): ap.misc.ScreenInfo {
            return this._screenInfo;
        }

        /**
        * Returns the available access right for the current user
        **/
        public get availableAccessRights(): KeyValue<ap.models.accessRights.AccessRightLevel, String>[] {
            return this._availableAccessRights;
        }

        /**
        * Method use to update the list of contacts
        **/
        public updateContactList() {
            this._currentContactList = [];
            let startIndex = this.currentPageNumber * 10;
            let itemToCheck: ap.viewmodels.meetingcontacts.MeetingContactViewModel;
            let lastIndex: number;
            let lengthOfItems: number = this.meetingContactList.length - startIndex;

            if (lengthOfItems - 10 < 0) {
                itemToCheck = this.meetingContactList[this.meetingContactList.length - 1];
                lastIndex = this.meetingContactList.length;
            } else {
                itemToCheck = this.meetingContactList[startIndex + 9];
                lastIndex = startIndex + 10;
            }
            for (let i = startIndex; i < lastIndex; i++) {
                this._currentContactList.push(this.meetingContactList[i]);
            }
        }

        /**
        * Method use to create the array of MeetingAccessRightUserItemViewModel
        * Use to bind the aceess right in the view
        **/
        private initMeetingAccessRightUserItemList() {
            this.meetingAccessRightUserItemList.splice(0);
            this._meetingConcernList.splice(0);
            let param: ap.viewmodels.projectcontacts.UserProjectAccessRightItemParameter = new ap.viewmodels.projectcontacts.UserProjectAccessRightItemParameter(0, null, null, null, this.$utility, this._controllersManager);
            for (let i = 0; i < this.meetingContactList.length; i++) {
                this._meetingConcernList.push(this.meetingContactList[i].originalMeetingContact);
            }

            this.meetingAccessRightUserItemList.push(this.initAccessRightItemVm("UserAccess", "User access", projectcontacts.ValueType.Selector));

            this.meetingAccessRightUserItemList.push(this.initAccessRightItemVm("List", "List", projectcontacts.ValueType.Empty));
            this.meetingAccessRightUserItemList.push(this.initAccessRightItemVm("CanAddDoc", "Add document", projectcontacts.ValueType.Simple));
            this.meetingAccessRightUserItemList.push(this.initAccessRightItemVm("CanGenerateReport", "Generate report", projectcontacts.ValueType.Simple));
            this.meetingAccessRightUserItemList.push(this.initAccessRightItemVm("CanCreateNextMeeting", "Create next occurrence", projectcontacts.ValueType.Simple));

            this.meetingAccessRightUserItemList.push(this.initAccessRightItemVm("Points", "Points", projectcontacts.ValueType.Empty));

            this.meetingAccessRightUserItemList.push(this.initAccessRightItemVm("CanEdit", "Edit", projectcontacts.ValueType.Simple));
            this.meetingAccessRightUserItemList.push(this.initAccessRightItemVm("CanAddPoint", "Add", projectcontacts.ValueType.Simple));
            this.meetingAccessRightUserItemList.push(this.initAccessRightItemVm("CanDeletePoint", "Delete", projectcontacts.ValueType.Simple));
            this.meetingAccessRightUserItemList.push(this.initAccessRightItemVm("CanAddComment", "Add comment", projectcontacts.ValueType.Simple));
            this.meetingAccessRightUserItemList.push(this.initAccessRightItemVm("CanArchiveComment", "Archive comment", projectcontacts.ValueType.Simple));
            this.meetingAccessRightUserItemList.push(this.initAccessRightItemVm("CanDeleteComment", "Delete comment", projectcontacts.ValueType.Simple));
            this.meetingAccessRightUserItemList.push(this.initAccessRightItemVm("CanAddPointDocument", "Add document to point", projectcontacts.ValueType.Simple));
            this.meetingAccessRightUserItemList.push(this.initAccessRightItemVm("CanDeletePointDocument", "Delete point's document", projectcontacts.ValueType.Simple));
            this.meetingAccessRightUserItemList.push(this.initAccessRightItemVm("CanEditPointStatus", "Edit status", projectcontacts.ValueType.Simple));
            this.meetingAccessRightUserItemList.push(this.initAccessRightItemVm("CanEditPointIssueType", "Edit category", projectcontacts.ValueType.Simple));
            this.meetingAccessRightUserItemList.push(this.initAccessRightItemVm("CanEditPointInCharge", "Edit user in charge", projectcontacts.ValueType.Simple));
            this.meetingAccessRightUserItemList.push(this.initAccessRightItemVm("CanViewOnlyPointInCharge", "View only in charge", projectcontacts.ValueType.Simple));

            this.meetingAccessRightUserItemList.push(this.initAccessRightItemVm("Forms", "Forms", projectcontacts.ValueType.Empty));

            this.meetingAccessRightUserItemList.push(this.initAccessRightItemVm("CanEdit", "Can edit meta data", projectcontacts.ValueType.Simple));
            this.meetingAccessRightUserItemList.push(this.initAccessRightItemVm("CanAddPoint", "Add", projectcontacts.ValueType.Simple));
            this.meetingAccessRightUserItemList.push(this.initAccessRightItemVm("CanDeletePoint", "Delete", projectcontacts.ValueType.Simple));
            this.meetingAccessRightUserItemList.push(this.initAccessRightItemVm("CanAddComment", "Add comment", projectcontacts.ValueType.Simple));
            this.meetingAccessRightUserItemList.push(this.initAccessRightItemVm("CanArchiveComment", "Archive comment", projectcontacts.ValueType.Simple));
            this.meetingAccessRightUserItemList.push(this.initAccessRightItemVm("CanDeleteComment", "Delete comment", projectcontacts.ValueType.Simple));
            this.meetingAccessRightUserItemList.push(this.initAccessRightItemVm("CanAddPointDocument", "Add document", projectcontacts.ValueType.Simple));
            this.meetingAccessRightUserItemList.push(this.initAccessRightItemVm("CanDeletePointDocument", "Delete form's document", projectcontacts.ValueType.Simple));
            this.meetingAccessRightUserItemList.push(this.initAccessRightItemVm("CanEditPointStatus", "Edit status", projectcontacts.ValueType.Simple));
            this.meetingAccessRightUserItemList.push(this.initAccessRightItemVm("CanEditPointIssueType", "Edit category", projectcontacts.ValueType.Simple));
            this.meetingAccessRightUserItemList.push(this.initAccessRightItemVm("CanEditPointInCharge", "Edit user in charge", projectcontacts.ValueType.Simple));
            this.meetingAccessRightUserItemList.push(this.initAccessRightItemVm("CanViewOnlyPointInCharge", "View only users in charge", projectcontacts.ValueType.Simple));

            this.meetingAccessRightUserItemList.push(this.initAccessRightItemVm("", "All", projectcontacts.ValueType.Simple));
        }

        /**
         * Update the info of the contact when his access right has changed in order to update the check mark displayed on each row for this contact
         * @param info MeetingContactInfoViewModel The updated contact
         */
        private updateList(info: ap.viewmodels.projectcontacts.MeetingContactInfoViewModel) {
            for (let i = 0; i < this._meetingAccessRightUserItemList.length; i++) {
                this._meetingAccessRightUserItemList[i].updateInfo(info);
            }
            for (let i = 0; i < this.meetingContactList.length; i++) {
                if (this.meetingContactList[i].originalMeetingContact.Id === info.contact.Id) {
                    this.meetingContactList[i].level = ap.models.accessRights.AccessRightLevel[info.selectedAccessRight];
                }
            }
            this.checkEditAccess();
        }

        /**
         * Initialize and return new item viewmodel object
         * @param accessName A name of access right
         * @param label A label of an access right, needed to display it as "access right name"
         * @param valueType Value type - simple, selector or empty
         * @param contactDetails An array of loaded entities
         */
        private initAccessRightItemVm(accessName: string, label: string, valueType: projectcontacts.ValueType) {
            let meetingAccessRightUserItemViewModel: ap.viewmodels.meetingcontacts.MeetingAccessRightUserItemViewModel = new ap.viewmodels.meetingcontacts.MeetingAccessRightUserItemViewModel(this.$utility, this.$q, null, accessName, label, valueType, this._meetingConcernList, new ap.viewmodels.projectcontacts.UserProjectAccessRightItemParameter(0, null, null, null, this.$utility, this._controllersManager), this._accessRightList);
            meetingAccessRightUserItemViewModel.initCurrentPageInfoList(this.currentPageNumber, 0);
            meetingAccessRightUserItemViewModel.on("selectedaccessrightchanged", this.updateList, this);
            return meetingAccessRightUserItemViewModel;
        }

        /**
        * Method use to know what need to be shown in the view (methode use in the view)
        * Check if the type of the MeetingAccessRightUserItemViewModel
        * @param access : the access which contains the contacts
        * @param contact : the contact which will brings the ContactInfoViewModel, need to know which type is the cell in the view
        **/
        public checkType(access: ap.viewmodels.meetingcontacts.MeetingAccessRightUserItemViewModel, contact: ap.viewmodels.meetingcontacts.MeetingContactViewModel): number {
            if (access && contact) {
                let contactDetailsInfo = new Dictionary<string, any>();
                contactDetailsInfo = access.getContactsData(0);
                let info: ap.viewmodels.projectcontacts.ContactInfoViewModel = contactDetailsInfo.getValue(contact.originalEntity.Id);
                if (info.type === ap.viewmodels.projectcontacts.ValueType.Empty) {
                    return 0;
                }
                if (info.type === ap.viewmodels.projectcontacts.ValueType.Header) {
                    return 1;
                }
                if (info.type === ap.viewmodels.projectcontacts.ValueType.Selector) {
                    return 2;
                }
                if (info.type === ap.viewmodels.projectcontacts.ValueType.Simple) {
                    return 3;
                }
            }
        }

        /**
        * Method use to know what to show in the cell of the view
        * @param access : the access which contains the contacts
        * @param contact : the contact which will brings the ContactInfoViewModel, need to know the value to bind in the cell
        **/
        public getItemValue(access: ap.viewmodels.meetingcontacts.MeetingAccessRightUserItemViewModel, contact: ap.viewmodels.meetingcontacts.MeetingContactViewModel): any {
            if (access && contact) {
                if (access.label === "All") {
                    if (contact.level === "Admin") {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    let contactDetailsInfo = new Dictionary<string, any>();
                    contactDetailsInfo = access.getContactsData(0);
                    let info: ap.viewmodels.projectcontacts.ContactInfoViewModel = contactDetailsInfo.getValue(contact.originalEntity.Id);
                    return info.value;
                }
            }
        }

        /**
        * Methode use to get then set the correct accessRight of the different contacts
        **/
        public initMeetingAccessRights() {
            this._controllersManager.accessRightController.geAccessRights("Meeting").then((result: models.accessRights.MeetingAccessRight[]) => {
                this._accessRightList = result;
                this.updateContactList();
                for (let i = 0; i < this.meetingContactList.length; i++) {
                    // set the current access right of each user
                    (<models.meetings.MeetingConcern>this.meetingContactList[i].originalEntity).Meeting.UserAccessRight = result.filter(x => ap.models.accessRights.AccessRightLevel[x.Level] === this.meetingContactList[i].level)[0];
                }
                this.initMeetingAccessRightUserItemList();
            });
        }

        /**
        * Method use to manage actions
        **/
        private actionClickedHandler(action: string) {
            switch (action) {
                case "meeting.managecontacts.edit":
                    this._editMode();
                    break;
                case "meeting.managecontacts.save":
                    this._save();
                    break;
                case "meeting.managecontacts.cancel":
                    this._cancel();
                    break;
            }
        }

        /**
         * Computes the visibility of the different actions of the screen
         */
        private checkEditAccess() {
            if (this._meeting && !this._meeting.IsSystem && (this._meeting.UserAccessRight.CanEdit || this._currentProject.UserAccessRight.CanEditAllList))
                this._editAction.isVisible = !this.screenInfo.isEditMode;
            else
                this._editAction.isVisible = false;

            this._saveAction.isVisible = this._screenInfo.isEditMode;
            this._saveAction.isEnabled = false;
            if (this.meetingAccessRightUserItemList[0]) {
                this._saveAction.isEnabled = this.meetingAccessRightUserItemList[0].hasChanged;
            }

            this._cancelAction.isVisible = this._screenInfo.isEditMode;
            this._cancelAction.isEnabled = this._screenInfo.isEditMode;
        }

        /**
        * Makes the screen go to edit mode
        **/
        private _editMode() {
            this._screenInfo.isEditMode = true;
            this.checkEditAccess();
            this._listener.raise("editmodechanged", new base.EditModeEvent(this));
        }

        /**
        * Makes the screen go to read mode
        **/
        private _cancel() {
            this._screenInfo.isEditMode = false;
            this.checkEditAccess();
            this._listener.raise("editmodechanged", new base.EditModeEvent(this, false, true));
        }

        /**
        * Method use to save the changes made by the user
        **/
        private _save() {
            let dirtyItems: ap.models.meetings.MeetingConcern[] = [];
            for (let i = 0; i < this.meetingAccessRightUserItemList[0].currentInfoList.length; i++) {
                if (this.meetingAccessRightUserItemList[0].currentInfoList[i].hasChanged) {
                    this.meetingAccessRightUserItemList[0].currentInfoList[i].postChanges();
                    dirtyItems.push(this.meetingAccessRightUserItemList[0].currentInfoList[i].contact);
                }
            }
            this._controllersManager.meetingController.updateMeetingConcerns(this._controllersManager.mainController.currentMeeting, dirtyItems).then((meetingConcerns: ap.models.meetings.MeetingConcern[]) => {
                this.initMeetingAccessRights();
                this._screenInfo.isEditMode = false;
                this.checkEditAccess();
                this._listener.raise("editmodechanged", new base.EditModeEvent(this));
            });
        }

        /**
         * This method is used to initialize the screen
         */
        public initScreen() {
            this._editAction = new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "meeting.managecontacts.edit", this.$utility.rootUrl + "Images/html/icons/ic_create_black_48px.svg", false, null, "Edit", true);
            this._saveAction = new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "meeting.managecontacts.save", this.$utility.rootUrl + "Images/html/icons/ic_save_black_48px.svg", false, null, "Save", false);
            this._cancelAction = new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "meeting.managecontacts.cancel", this.$utility.rootUrl + "Images/html/icons/ic_cancel_black_48px.svg", false, null, "Cancel", false);
            let actions = [this._editAction, this._saveAction, this._cancelAction];

            this._screenInfo = new ap.misc.ScreenInfo(this.$utility, "meeting.managecontacts", ap.misc.ScreenInfoType.List, actions, null, null, null, null, false);
            this._screenInfo.on("actionclicked", this.actionClickedHandler, this);
            this.checkEditAccess();
        }

        on(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.on(eventName, callback, caller);
        }
        off(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.off(eventName, callback, caller);
        }

        /*
        * Dispose the  object
        */
        public dispose() {
            this._screenInfo.off("actionclicked", this.actionClickedHandler, this);
        }

        constructor(private $utility: ap.utility.UtilityHelper, private _api: ap.services.apiHelper.Api, private $q: angular.IQService, private _controllersManager: ap.controllers.ControllersManager, private _servicesManager: ap.services.ServicesManager, private meetingContactList: ap.viewmodels.meetingcontacts.MeetingContactViewModel[]) {
            this._meeting = this._controllersManager.mainController.currentMeeting;
            this._currentProject = this._controllersManager.mainController.currentProject();
            this._listener = this.$utility.EventTool.implementsListener(["editmodechanged"]);

            this._numberOfPage = this.meetingContactList.length / 10;
            this._numberOfPage = Math.ceil(this._numberOfPage);
            this.initMeetingAccessRights();
            this.initScreen();
        }

        private _currentPageNumber: number = 0;
        private _numberOfPage: number;
        private _accessRightList: ap.models.accessRights.MeetingAccessRight[]; // all of the existing access rights for a meeting
        private _currentContactList: ap.viewmodels.meetingcontacts.MeetingContactViewModel[];
        private _meetingConcernList: ap.models.meetings.MeetingConcern[] = [];
        private _meetingAccessRightUserItemList: ap.viewmodels.meetingcontacts.MeetingAccessRightUserItemViewModel[] = []; // = the sourceItems of the list
        private _availableAccessRights: KeyValue<ap.models.accessRights.AccessRightLevel, String>[] = []; // available access rights for the user
        private _meeting: ap.models.meetings.Meeting;
        private _currentProject: ap.models.projects.Project;
        private _listener: ap.utility.IListenerBuilder;
        private _screenInfo: ap.misc.ScreenInfo;
        private _editAction: ap.viewmodels.home.ActionViewModel;
        private _saveAction: ap.viewmodels.home.ActionViewModel;
        private _cancelAction: ap.viewmodels.home.ActionViewModel;
    }
}