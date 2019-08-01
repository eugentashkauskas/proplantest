module ap.viewmodels.meetings {
    export class MeetingSelectorViewModel extends ListWorkspaceViewModel {

        public get selectedMeetingId(): string {
            return this.selectedItem ? (<ap.models.meetings.Meeting>this.selectedItem.originalEntity).Id : null;
        }

       /*
       * To bind with directive, avoid using listVM.SelectdViewModel becasue it may set null when no result
       */
        public get selectedItem(): IEntityViewModel {
            return this._selectedItem;
        }

        /*
        * To bind with directive, avoid using listVM.SelectdViewModel becasue it may set null when no result
        */
        public set selectedItem(value: IEntityViewModel) {
            if (this._selectedItem === null || value === null || this._selectedItem.originalEntity.Id !== value.originalEntity.Id) {
                this._selectedItem = value;
                this._listener.raise("selectedItemChanged", value);
            }
        }

        /**
        * This method is used to create the filter of the searchText
        * We make the search on Title property of the meeting
        **/
        protected buildSearchedTextFilter(): string {
            if (this.searchedText && !StringHelper.isNullOrEmpty(this.searchedText))
                return Filter.contains("Title", "\"" + this.searchedText + "\"");
            return undefined;
        }

        /**
        * This method is used to create the custom/base filter for the list
        * We filter the meeting on the current project
        **/
        protected buildCustomFilter(): angular.IPromise<string> {
            let self = this;
            let deferred: ng.IDeferred<string> = this.$q.defer();
            let result: string = undefined;
            let currentProject = this.$controllersManager.mainController.currentProject();
            result = Filter.and(Filter.eq("Project.Id", currentProject.Id), Filter.isFalse("IsArchived"));
            if (this._onlyUserResponsible) {
                this.loadMeetingAccessRight().then(() => {
                    let canAddPointLevel: string[] = [];
                    if (self._listMeetingAccessRight && self._listMeetingAccessRight !== null) {
                        for (let i = 0; i < this._listMeetingAccessRight.length; i++) {
                            if (self._listMeetingAccessRight[i].CanAddPoint)
                                canAddPointLevel.push(ap.models.accessRights.AccessRightLevel[self._listMeetingAccessRight[i].Level]);
                        }
                    }
                    let userResponsibleFilter: string = "";

                    let filterMeetingConcern: string = Filter.and(Filter.in("AccessRightLevel", canAddPointLevel), Filter.eq("User.Id", self.$utility.UserContext.CurrentUser().Id));
                    filterMeetingConcern = Filter.and(filterMeetingConcern, Filter.isFalse("IsDisabled"));
                    let filterMeeting: string = Filter.exists("MeetingConcerns", filterMeetingConcern);

                    let publicFilter: string = Filter.isTrue("IsPublic");
                    publicFilter = Filter.and(publicFilter, Filter.not(Filter.exists("MeetingConcerns", Filter.and(Filter.eq("User.Id", self.$utility.UserContext.CurrentUser().Id), Filter.isFalse("IsDisabled")))));

                    publicFilter = Filter.and(publicFilter, Filter.exists("Project.Contacts", Filter.and(Filter.in("AccessRightLevel", canAddPointLevel), Filter.eq("User.Id", self.$utility.UserContext.CurrentUser().Id))));

                    userResponsibleFilter = Filter.or(filterMeeting, publicFilter);

                    result = Filter.and(result, userResponsibleFilter);

                    if (this._defaultMeetingToLoad !== null) {
                        result = Filter.or(result, Filter.eq("Id", this._defaultMeetingToLoad));
                    }

                    deferred.resolve(result);
                });
            }
            else {
                deferred.resolve(result);
            }
            return deferred.promise;
        }

        /**
        * This method is used to load the list of meeting accesstight from the controller to keep to build the filter
        **/
        private loadMeetingAccessRight(): angular.IPromise<boolean> {
            let seft = this;
            let deferred: ng.IDeferred<boolean> = this.$q.defer();
            if (seft._listMeetingAccessRight !== null && seft._listMeetingAccessRight.length > 0)
                deferred.resolve(true);
            else {
                seft._listMeetingAccessRight = [];
                seft.$controllersManager.accessRightController.geAccessRights("Meeting", true).then((rights: ap.models.accessRights.AccessRight[]) => {
                    for (let i = 0; i < rights.length; i++) {
                        let meetingAccessRight = <ap.models.accessRights.MeetingAccessRight>rights[i];
                        seft._listMeetingAccessRight.push(meetingAccessRight);
                    }
                    deferred.resolve(true);
                });
            }
            return deferred.promise;
        }

        /**
         * Updates a list of available meeting and selects a meeting with the given ID
         * @param meetingId an id of the meeting to select
         */
        public selectMeetingById(meetingId: string): angular.IPromise<any> {
            let deferred = this.$q.defer();
            this.searchedText = null;
            if (meetingId !== null) {
                this.load(meetingId).then((list: GenericPagedListViewModels) => {
                    this.listVm.selectEntity(meetingId); // need to concatenate 1 to have a sub cell id
                    this.selectedItem = this.listVm.selectedViewModel;
                    deferred.resolve();
                }, () => {
                    deferred.reject();
                });
            } else {
                deferred.reject();
            }

            return deferred.promise;
        }

        constructor($utility: ap.utility.UtilityHelper, $q: angular.IQService, $controllersManager: ap.controllers.ControllersManager,
            $timeout: angular.ITimeoutService, onlyUserResponsible: boolean = true, defaultMeetingToLoad: string = null, private predefinedItems: PredefinedItemParameter[] = null) {
            super($utility, $controllersManager, $q, new GenericPagedListOptions("Meeting", MeetingItemViewModel, "Title,Code,Date", "issystemdesc,issystemispublictitle", 50, false, true, undefined, undefined, undefined, undefined, predefinedItems));
            this._listener.addEventsName(["selectedItemChanged"]);
            this._onlyUserResponsible = onlyUserResponsible;
            this._defaultMeetingToLoad = defaultMeetingToLoad;
        }

        private _onlyUserResponsible: boolean;
        private _listMeetingAccessRight: ap.models.accessRights.MeetingAccessRight[] = null;
        private _selectedItem: IEntityViewModel = null;

        // AP-12029: in case to prevent user is subcontractor but need to edit the point then we always get the meeting with specific id
        private _defaultMeetingToLoad: string;
    }
}