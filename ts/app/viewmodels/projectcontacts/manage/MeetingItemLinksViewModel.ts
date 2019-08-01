module ap.viewmodels.projectcontacts {
    export class MeetingItemLinksViewModel extends ap.viewmodels.meetings.MeetingItemViewModel {

       /**
       * Get current access right's label
       **/
        public get meetingName(): string {
            return (<models.meetings.Meeting>this.originalEntity).Title;
        }

        /**
       * Set current access right's label
       **/
        public set meetingName(title: string) {
           this._meetingName = title;
        }

        /**
        * Get the informations of the current contacts display in the view
        **/
        public get currentInfoList(): ap.viewmodels.projectcontacts.ProjectContactInfoInMeetingViewModel[] {
            return this._currentInfoList;
        }

        /**
        * Set the informations of the current contacts display in the view
        **/
        public set currentInfoList(currentList: ap.viewmodels.projectcontacts.ProjectContactInfoInMeetingViewModel[]) {
            this._currentInfoList = currentList;
        }

        /**
        * Get the informations of all the contacts display
        **/
        public get infoList(): ap.viewmodels.projectcontacts.ProjectContactInfoInMeetingViewModel[] {
            return this._infoList;
        }

        /**
        * Set the informations of all the contacts display
        **/
        public get hasChanged(): boolean {
            return this._dirtyItems.length > 0;
        }

        /**
        * Get the index of the current page
        */
        public get currentVisibilityPage(): number {
            return this._currentVisibilityPage;
        }

        /**
        * Set the index of the current page
        */
        public set currentVisibilityPage(newValue: number) {
            this._currentVisibilityPage = newValue;

            this.setCurrentMeetingAccessVisibility();
        }

        /**
        * Private member to initialize the current page
        */
        private setCurrentMeetingAccessVisibility() {
            // update the current visibilities when the page changes
            let startIndex: number = this._currentVisibilityPage * this._visibilityPageSize;
            let endIndex: number = startIndex + this._visibilityPageSize < this._infoList.length ? startIndex + this._visibilityPageSize : this._infoList.length;
            this._currentInfoList = this._infoList.slice(startIndex, endIndex);
        }

        /**
        * Method which put the changed item in _dirtyItems
        * @param val : the ProjectContactInfoInMeetingViewModel which has changed
        **/
        public accessRightHasChanged(val: ap.viewmodels.projectcontacts.ProjectContactInfoInMeetingViewModel) {
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
        * Method use to get the items which have been changed by the user
        **/
        public getChangedItems(): ap.viewmodels.projectcontacts.ProjectContactInfoInMeetingViewModel[] {
            let changedItems: ap.viewmodels.projectcontacts.ProjectContactInfoInMeetingViewModel[] = [];
            for (let i = 0; i < this.infoList.length; i++) {
                if (this.infoList[i].meetingConcern) {
                    if (this.infoList[i].meetingConcern.AccessRightLevel === null) {
                        if (this.infoList[i].selectedAccessRight !== 6) {
                            changedItems.push(this.infoList[i]);
                        }
                    } else if (this.infoList[i].meetingConcern.AccessRightLevel !== this.infoList[i].selectedAccessRight) {
                        changedItems.push(this.infoList[i]);
                    }
                }
            }
            return changedItems;
        }

        constructor(Utility: ap.utility.UtilityHelper, $q: angular.IQService, parentListVm?: ap.viewmodels.BaseListEntityViewModel, parameters?: ItemConstructorParameter) {
            super(Utility, $q, null, null);
            this._listener.addEventsName(["selectedaccessrightchanged"]);
        }

        private _currentInfoList: ap.viewmodels.projectcontacts.ProjectContactInfoInMeetingViewModel[] = [];
        private _infoList: ap.viewmodels.projectcontacts.ProjectContactInfoInMeetingViewModel[] = [];
        private _dirtyItems: string[] = [];
        private _meetingName: string;
        private _currentVisibilityPage: number;
        private _visibilityPageSize: number = 10;
    }
}