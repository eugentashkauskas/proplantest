module ap.viewmodels.notes {

    class NoteUpdatedParam {
        constructor(public isMoved: boolean = false) { }
    }

    /**
    * Class representing the Id of a Note and the type of Id
    */
    class GuidInfo {
        constructor(public key: string, public val: string) {
        }
    }

    class GroupIndex {
        constructor(public index: number, public item: IEntityViewModel) {
        }
    }

    /**
    * @class
    * This class represents the different possible ids of a note
    */
    export class NoteIdInfo {
        /**
         * @constructor
         * Create an instance of the object
         * @param noteId The Id of the Note when no group is applied to the list
         * @param inChargeId The Id of the Note when the list is grouped by UserInCharge
         * @param commentId The Id of the Note for the other cases
         */
        constructor(public noteId: string, public inChargeId: string, public commentId: string) {}
    }

    /**
    * Enum representing the different groups possible for the lists of notes
    */
    export enum NoteGroupType {
        None, Date, SubCategory, DueDate, InCharge, Status, Room
    }

    export class UserCommentItemConstructorParameter extends ItemConstructorParameter {

        public get projectController(): ap.controllers.ProjectController {
            return this._projectController;
        }

        public get noteController(): ap.controllers.NoteController {
            return this._noteController;
        }

        public get comment(): ap.models.notes.NoteComment {
            return this._comment;
        }

        public get controllersManager(): ap.controllers.ControllersManager {
            return this._controllersManager;
        }

        constructor(itemIndex: number, item: any, pageDesc: PageDescription, parameters: LoadPageSuccessHandlerParameter, utility: ap.utility.UtilityHelper,
            private _controllersManager: ap.controllers.ControllersManager, comment?: ap.models.notes.NoteComment) {
            super(itemIndex, item, pageDesc, parameters, utility);

            this._projectController = _controllersManager.projectController;
            this._noteController = _controllersManager.noteController;
            this._comment = comment;
        }

        private _projectController: ap.controllers.ProjectController;
        private _noteController: ap.controllers.NoteController;
        private _comment: ap.models.notes.NoteComment;
    }

    export class UserCommentPagedListViewModel extends GenericPagedListViewModels {

        /**
         * Method used to get the archived notes ids
         */
        public get archivedNoteIds(): string[] {
            return this._archivedNoteIds;
        }

        loadIds(filter?: string): angular.IPromise<ap.services.apiHelper.ApiResponse> {
            this._groupCount = 0;
            this._groupsList = [];
            this._indexes = [];
            this._dicGroups = new Dictionary<number, UserCommentViewModel>();

            this._addedItemsCount = 0;
            this._addedUserComment = [];
            this._dicGroupsOfUserComments.clear();

            let deferred = this.$q.defer<ap.services.apiHelper.ApiResponse>();

            // Combine several simultaneous API requests into one
            let cacheKey = filter || "";
            if (this._loadIdsCache.containsKey(cacheKey)) {
                this._loadIdsCache.getValue(cacheKey).push(deferred);
            } else {
                this._loadIdsCache.add(cacheKey, [deferred]);

                super.loadIds(filter).then((response: ap.services.apiHelper.ApiResponse) => {
                    let requestsQueue = this._loadIdsCache.getValue(cacheKey);
                    for (let request of requestsQueue) {
                        request.resolve(response);
                    }
                }, (reason) => {
                    let requestsQueue = this._loadIdsCache.getValue(cacheKey);
                    for (let request of requestsQueue) {
                        request.reject(reason);
                    }
                }).finally(() => {
                    this._loadIdsCache.remove(cacheKey);
                });
            }

            return deferred.promise;
        }

        /**
         * The id receive from the api contains the id of the entity + a number to know the type of this entity. Then, the value will be converted to GuidInfo
         * @param item the id value received from the api
         **/
        protected buildIdInfo(id: any): any {
            return new GuidInfo(id.substring(0, 36), id.substr(36));
        }


        _loadPageHandler(deferred: angular.IDeferred<ap.services.apiHelper.ApiResponse>, index: number) {
            let lenPage: number = this._pages.length;
            let pageDesc: PageDescription = null;

            if (this._pages.length <= index)
                throw new Error("The index is out of range");

            pageDesc = this._pages[index];

            let finalCommentFilter: string = "";
            let noteCommentFilter: string = "";
            let finalInChargeFilter: string = "";
            let noteInChargeFilter: string = "";
            let finalIdsFilter: string = "";
            let noteIdsFilter: string = "";
            let filter: string = "";
            let idsLen: number = pageDesc.idsList.length;
            let commentIndx: number = 0;
            let inChargeIndx: number = 0;
            let idsIndx: number = 0;
            this._noteCommentIdsWithIndexs = [];
            this._noteIdsWithIndexs = [];
            this._noteInChargeIdsWithIndexs = [];

            for (let idxId: number = 0; idxId < idsLen; idxId++) {
                // search in comments (-4 is archived item)
                if ((<GuidInfo>pageDesc.idsList[idxId]).val === "0" || (<GuidInfo>pageDesc.idsList[idxId]).val === "-4") {
                    this._noteCommentIdsWithIndexs[commentIndx] = [];
                    this._noteCommentIdsWithIndexs[commentIndx][0] = (<GuidInfo>pageDesc.idsList[idxId]).key;
                    this._noteCommentIdsWithIndexs[commentIndx][1] = idxId;
                    commentIndx++;

                    noteCommentFilter += (<GuidInfo>pageDesc.idsList[idxId]).key;
                    if (idxId < idsLen - 1)
                        noteCommentFilter += ",";
                }
                // search in noteincharge (-2 is archived item)
                if ((<GuidInfo>pageDesc.idsList[idxId]).val === "2" || (<GuidInfo>pageDesc.idsList[idxId]).val === "-2") {
                    this._noteInChargeIdsWithIndexs[inChargeIndx] = [];
                    this._noteInChargeIdsWithIndexs[inChargeIndx][0] = (<GuidInfo>pageDesc.idsList[idxId]).key;
                    this._noteInChargeIdsWithIndexs[inChargeIndx][1] = idxId;
                    inChargeIndx++;

                    noteInChargeFilter += (<GuidInfo>pageDesc.idsList[idxId]).key;
                    if (idxId < idsLen - 1)
                        noteInChargeFilter += ",";
                }
                // search in ids (-1 is archived item)
                if ((<GuidInfo>pageDesc.idsList[idxId]).val === "1" || (<GuidInfo>pageDesc.idsList[idxId]).val === "-1") {
                    this._noteIdsWithIndexs[idsIndx] = [];
                    this._noteIdsWithIndexs[idsIndx][0] = (<GuidInfo>pageDesc.idsList[idxId]).key;
                    this._noteIdsWithIndexs[idsIndx][1] = idxId;
                    idsIndx++;

                    noteIdsFilter += (<GuidInfo>pageDesc.idsList[idxId]).key;
                    if (idxId < idsLen - 1)
                        noteIdsFilter += ",";
                }
            }

            filter = "Filter.Lt(Id, 00000000-0000-0000-0000-000000000000)";

            if (this._noteCommentIdsWithIndexs.length > 0) {
                if (noteCommentFilter[noteCommentFilter.length - 1] === ",") {
                    noteCommentFilter = noteCommentFilter.substr(0, noteCommentFilter.length - 1);
                }
                finalCommentFilter = "Filter.Exists(Comments, Filter.In(Id, " + noteCommentFilter + "))";
                filter = "Filter.Or(" + filter + "," + finalCommentFilter + ")";
            }
            if (this._noteInChargeIdsWithIndexs.length > 0) {
                if (noteInChargeFilter[noteInChargeFilter.length - 1] === ",") {
                    noteInChargeFilter = noteInChargeFilter.substr(0, noteInChargeFilter.length - 1);
                }
                finalInChargeFilter = "Filter.Exists(NoteInCharge, Filter.In(Id, " + noteInChargeFilter + "))";
                filter = "Filter.Or(" + filter + "," + finalInChargeFilter + ")";
            }
            if (this._noteIdsWithIndexs.length > 0) {
                if (noteIdsFilter[noteIdsFilter.length - 1] === ",") {
                    noteIdsFilter = noteIdsFilter.substr(0, noteIdsFilter.length - 1);
                }
                finalIdsFilter = "Filter.In(Id, " + noteIdsFilter + ")";
                filter = "Filter.Or(" + filter + "," + finalIdsFilter + ")";
            }

            this._isLoading = true;
            let options = new ap.services.apiHelper.ApiOption();
            options.async = !this.options.displayLoading;
            options.onlyPathToLoadData = this.options.onlyPathToLoadData;
            options.customParams = this.customParams;

            this._api.getEntityList(this._entityName, filter, this._pathToLoad, null, null, options).then((args: ap.services.apiHelper.ApiResponse) => {
                let arrayItem: IEntityViewModel[] = this.loadPageSuccessHandler(args, pageDesc, index, this.$utility, this.$q, this.options.itemConstructor);

                if (!!this._groupDescription && this._groupDescription !== "None") {
                    // Update or create new groups
                    this._checkItemsGroup(arrayItem, this.$utility, index);
                }
                this._buildIndexes();

                // Need to update sourceItems
                this._onPageLoaded(pageDesc, arrayItem);
                deferred.resolve();

            }, () => {
                this._isLoading = false;
                deferred.reject();
            });
        }

        // Groups management
        private _checkItemsGroup(itemList: IEntityViewModel[], utility: ap.utility.UtilityHelper, pageIndex: number) {
            // check the item group
            // create a new group (fake item if necessary) and add it to the array
            // update the count property (_setCount)
            let len: number = itemList.length;
            let i: number;
            let groupName: string;

            for (i = 0; i < len; i++) {
                let item: ap.viewmodels.notes.UserCommentViewModel = <ap.viewmodels.notes.UserCommentViewModel>itemList[i];
                groupName = this._getGroupNameForItem(item);

                let groupsLength: number = this._groupsList.length;
                let j: number;
                let group: GroupIndex = null;
                let groupFound: boolean = false;

                // check in the group if the item already exists
                for (j = 0; j < groupsLength; j++) {
                    group = this._groupsList[j];
                    if ((<NoteBaseItemViewModel>group.item).originalEntity.Id === ap.utility.UtilityHelper.createEmptyGuid() && (<NoteBaseItemViewModel>group.item).subject === groupName) {
                        groupFound = true;
                        break;
                    }
                }

                if (groupFound && this._dicGroupsOfUserComments.containsKey(groupName)) {
                    this._dicGroupsOfUserComments.getValue(groupName).push(item);
                }
                // When the existed group was created by the the item that have index > this item
                if (groupFound && group.index >= (item.index + this._groupCount)) {
                    let groupIndex = group.index;
                    // Remove on _groupsList
                    let removeListIndex = -1;
                    for (let gi = 0; gi < this._groupsList.length; gi++) {
                        let gindex: GroupIndex = this._groupsList[gi];
                        if (gindex.index === groupIndex) {
                            removeListIndex = gi;
                            break;
                        }
                    }
                    if (removeListIndex >= 0) {
                        this._groupsList.splice(removeListIndex, 1);
                    }
                    // Remove on _dicGroups
                    this._dicGroups.remove(group.index);

                    // Create group and add again
                    let insertgroupIndex = 0;
                    for (j = 0; j < this._groupsList.length; j++) {
                        group = this._groupsList[j];
                        if (group.index <= item.index + this._groupCount) {
                            insertgroupIndex++;
                        }
                    }

                    let userCommentGroupVm = this._buildGroup(groupName, item.index + insertgroupIndex);
                    this._groupsList.push(new GroupIndex(userCommentGroupVm.index, userCommentGroupVm));
                    this._dicGroups.add(userCommentGroupVm.index, userCommentGroupVm);

                } else {
                    if (!groupFound) {
                        // create the group and add it to the group list
                        let insertgroupIndex = 0;
                        for (j = 0; j < this._groupsList.length; j++) {
                            group = this._groupsList[j];
                            if (group.index <= item.index + this._groupCount) {
                                insertgroupIndex++;
                            }
                        }

                        let newGroupIndex = item.index + insertgroupIndex;
                        let userCommentGroupVm = this._buildGroup(groupName, newGroupIndex);
                        this._groupsList.push(new GroupIndex(userCommentGroupVm.index, userCommentGroupVm));
                        this._dicGroups.add(userCommentGroupVm.index, userCommentGroupVm);
                        this._dicGroupsOfUserComments.add(groupName, [item]);

                        // Like we can scroll from the bottom to the top and then the all higher group at the bottom need to increase the index
                        for (j = 0; j < this._groupsList.length; j++) {
                            let group: GroupIndex = this._groupsList[j];
                            if (group.index > newGroupIndex) {
                                let vm: UserCommentViewModel = this._dicGroups.getValue(group.index);
                                this._dicGroups.remove(group.index);
                                group.index++;
                                this._dicGroups.add(group.index, vm);
                            }
                        }

                        this._groupCount++;

                        this._setCount(this.count + 1);
                    }
                }
            }
        }

        /**
        * Override from BaseListEntityViewModel
        * This function will set a specific entity of the list like selected if there is an entity corresponding to the id param in the list
        * @param id the id of the entity to set selected
         **/
        selectEntity(id: string) {
            if (id && this.sourceItems) {
                let length = this.sourceItems.length;
                for (let i = 0; i < length; i++) {
                    // check that sourceItems[i] exists because it can be a page not loaded yet and therefore, there is no originalEntity
                    /*this.sourceItems[i].originalEntity && this.sourceItems[i].originalEntity.Id && this.sourceItems[i].originalEntity.Id.toLowerCase() === id.toLowerCase()*/
                    /*(<UserCommentViewModel>this.sourceItems[i]).id.toLowerCase() === id.toLowerCase()*/
                    if (this.sourceItems && this.sourceItems[i] && this.sourceItems[i].originalEntity && this.sourceItems[i].originalEntity.Id && this.sourceItems[i].originalEntity.Id.toLowerCase() === id.toLowerCase()) {
                        this._setSelectedViewModel(this.sourceItems[i]);
                        break;
                    }
                }
            } else {
                this._setSelectedViewModel(null);
            }
        }

        /*
        * This method find the index and take into account with group
        */
        getItemIndexWithGroup(id: string): number {
            let pureIndex = super.getItemIndex(id);

            let foundMaxIndex = -1;
            if (pureIndex >= 0) {
                for (let i = 0; i < this._indexes.length; i++) {
                    if (this._indexes[i] === pureIndex)
                        foundMaxIndex = i;
                    if (this._indexes[i] > pureIndex && foundMaxIndex >= 0)
                        break;
                }
            }
            return foundMaxIndex;
        }

        private _buildGroup(groupName: string, index: number): UserCommentViewModel {
            let noteGroup: ap.models.notes.Note = new ap.models.notes.Note(this.$utility);
            noteGroup.createByJson({
                Id: ap.utility.UtilityHelper.createEmptyGuid(),
                Subject: groupName
            });
            let userCommentGroupVm: UserCommentViewModel = new UserCommentViewModel(this.$utility, this.$q, null, new UserCommentItemConstructorParameter(index, noteGroup, null, null, this.$utility, this._controllersManager));
            noteGroup.IsRead = true;
            userCommentGroupVm.init(noteGroup);

            return userCommentGroupVm;
        }

        private _buildIndexes() {
            let idsLength = this._listIds.length;
            let listItemsLength = idsLength + this._groupCount + this._addedItemsCount;
            this._indexes = new Array(listItemsLength);
            let currentIdIndx: number = 0;

            let keys: number[] = this._dicGroups.keys();
            for (let i = 0, len = keys.length; i < len; i++) {
                let group = this._dicGroups.getValue(keys[i]);
                this._indexes[group.index] = group.index;
            }

            // need to improve, should build the indexes only from a given index and no need to compute the index at each page
            // set the indexes for the items
            for (let j = 0; j < listItemsLength; j++) {
                if (this._indexes[j] === undefined || this._indexes[j] === null) {
                    this._indexes[j] = currentIdIndx;
                    currentIdIndx++;
                }
            }
        }

        getItemAtIndex(index: number) {
            if (this._dicGroups.containsKey(index)) {
                return this._dicGroups.getValue(index);
            }

            return super.getItemAtIndex(this._indexes[index]);
        }

        /**
         * This method will get the group name of a specific item depending of the current grouping mode
         * @param item The item for which the name of the group is necessary
         */
        private _getGroupNameForItem(item: ap.viewmodels.notes.NoteBaseItemViewModel): string {
            let groupName: string = item.getGroupValue(this._groupDescription);
            return groupName;
        }

        public get groupDescription(): string {
            return this._groupDescription;
        }

        public set groupDescription(group: string) {
            if (this._groupDescription !== group) {
                if (!StringHelper.isNullOrEmpty(group) && this._groups.indexOf(group) < 0)
                    throw new Error("Group is not found: " + group);
                this._groupDescription = group;
            }
        }
        // End of groups management

        /**
        * This method is used to print the point report and resolve the promise of ReportGeneratorResponse
        * @param reportGeneratorViewModel is the vm which contains the ReportConfig and params for print report
        * @param reportGeneratorResponse to known the action (preview or save or send) for the report
        **/
        public printReport(reportGeneratorViewModel: ap.viewmodels.reports.ReportGeneratorViewModel, reportGeneratorResponse: ap.viewmodels.reports.ReportGeneratorResponse): angular.IPromise<ap.viewmodels.reports.ReportGeneratorResponse> {
            let self = this;
            let deferedResult: angular.IDeferred<ap.viewmodels.reports.ReportGeneratorResponse> = this.$q.defer();
            let pointReportParams: ap.misc.PointReportParams = this.createPointReportParam(reportGeneratorViewModel);
            if (reportGeneratorResponse === ap.viewmodels.reports.ReportGeneratorResponse.Preview) {
                if (pointReportParams.customIdsToPrint.length > 50) {

                    this._controllersManager.mainController.showConfirmKey("app.report.confirm_preview_to_mail", "app.report.confirm_preview_title", (result) => {
                        if (result === ap.controllers.MessageResult.Positive) {
                            pointReportParams.customIdsToPrint = pointReportParams.customIdsToPrint.slice(0, 50);
                            this._controllersManager.reportController.printPointReport(pointReportParams, true, false, deferedResult);
                        }
                        else if (result === ap.controllers.MessageResult.LeftKey) {
                            pointReportParams.mailSubject = pointReportParams.reportTitle;
                            pointReportParams.mailBody = this.$utility.Translator.getTranslation("app.report.default_mail_body").format(pointReportParams.reportTitle, this.$utility.UserContext.CurrentUser().DisplayName);
                            pointReportParams.recipientIds = [];
                            pointReportParams.recipientIds.push(this.$utility.UserContext.CurrentUser().Id);
                            this._controllersManager.reportController.printPointReport(pointReportParams, false, true, deferedResult);
                        }
                        else {
                            deferedResult.reject();
                        }
                    }, false, "Preview", "Cancel", "SendByMail");
                }
                else {
                    this._controllersManager.reportController.getCountPlanPreview(pointReportParams).then((n: number) => {
                        if (n > 5) {
                            this._controllersManager.mainController.showConfirmKey("app.report.5_attachements", "app.report.5_attachements_title", (result) => {
                                if (result === ap.controllers.MessageResult.Positive) {
                                    pointReportParams.customIdsToPrint = pointReportParams.customIdsToPrint.slice(0, 50);
                                    this._controllersManager.reportController.printPointReport(pointReportParams, true, false, deferedResult);
                                }
                                else if (result === ap.controllers.MessageResult.LeftKey) {
                                    pointReportParams.mailSubject = pointReportParams.reportTitle;
                                    pointReportParams.mailBody = this.$utility.Translator.getTranslation("app.report.default_mail_body").format(pointReportParams.reportTitle, this.$utility.UserContext.CurrentUser().DisplayName);
                                    pointReportParams.recipientIds = [];
                                    pointReportParams.recipientIds.push(this.$utility.UserContext.CurrentUser().Id);
                                    this._controllersManager.reportController.printPointReport(pointReportParams, false, true, deferedResult);
                                }
                                else {
                                    deferedResult.reject();
                                }
                            }, false, "Preview", "Cancel", "SendByMail");
                        } else {
                            this._controllersManager.reportController.printPointReport(pointReportParams, true, false, deferedResult);
                        }
                    });
                }
            }
            else if (reportGeneratorResponse === ap.viewmodels.reports.ReportGeneratorResponse.Generate) {
                this._controllersManager.reportController.printPointReport(pointReportParams, false, false, deferedResult);
            }
            else if (reportGeneratorResponse === ap.viewmodels.reports.ReportGeneratorResponse.Send) {
                reportGeneratorViewModel.sendReportViewModel.createNewContacts().then((contactsCreated) => {
                    reportGeneratorViewModel.sendReportViewModel.initReportParams(pointReportParams);
                    this._controllersManager.reportController.printPointReport(pointReportParams, false, true, deferedResult);
                }, (error) => {
                    deferedResult.reject(error);
                });
            }
            return deferedResult.promise;
        }

        /**
        * Method used to get only checked items ids
        **/
        public getCheckedIds(): string[] {
            return this.listidsChecked;
        }

        protected calculateCheckedIds(item: NoteBaseItemViewModel) {
            if (item.isChecked) {
                if (this.listidsChecked.indexOf(item.originalId) < 0) {
                    this.listidsChecked.push(item.originalId);
                }
            } else {
                if (this.listidsChecked.indexOf(item.originalId) >= 0) {
                    this.listidsChecked.splice(this.listidsChecked.indexOf(item.originalId), 1);
                }
            }
        }

        protected getUncheckedItemIds(): string[] {
            return this.getUncheckedLoadedItems().map((item: NoteBaseItemViewModel) => {
                return item.originalId;
            });
        }

        protected updateItemCheckState(loadedPage: NoteBaseItemViewModel[]) {
            if (this.listidsChecked.length > 0) {
                loadedPage.forEach((item) => {
                    if (this.listidsChecked.indexOf(item.originalId) >= 0) {
                        item.defaultChecked = true;
                    }
                });
            }
        }

        /**
         * Determines whether the list contains not checked items
         */
        public hasNotCheckedItems(): boolean {
            for (let i = 0, len = this.sourceItems.length; i < len; i++) {
                let item = <NoteItemViewModel>this.sourceItems[i];
                if (item && !item.isChecked && !item.isMoved && !item.originalNote.Deleted) {
                    // moved and deleted items doesn't count as a part of the list anymore
                    return true;
                }
            }
            return false;
        }

        /**
         * Close the multi action mode by emptying the checked ids
         */
        public closeMultiActionMode() {
            this.listidsChecked = [];
            this.uncheckAll();
        }

        /**
        * This method is used to create the report param to print the report
        * @param reportGeneratorViewModel is the vm contains all properties for the report param
        **/
        public createPointReportParam(reportGeneratorViewModel: ap.viewmodels.reports.ReportGeneratorViewModel): ap.misc.PointReportParams {
            let pointReportParams: ap.misc.PointReportParams;
            let idsToPrint: string[] = [];
            if (reportGeneratorViewModel.pointToPrintType === ap.viewmodels.reports.ReportPointToPrintType.All) {
                idsToPrint = this._listIds;
            } else {
                let checkedItems = this.getCheckedIds();
                if (checkedItems.length === 0) {
                    if (this.selectedViewModel !== null) {
                        idsToPrint = [(<ap.viewmodels.notes.NoteBaseItemViewModel>this.selectedViewModel).originalId];
                    } else {
                        this._controllersManager.mainController.showMessageKey("app.report.no_point_selected_message", "app.err.general_title", null, ap.controllers.MessageButtons.Ok);
                    }
                }
                idsToPrint = checkedItems;
            }

            let loadedItems: NoteItemViewModel[] = <NoteItemViewModel[]>this.getLoadedItems();
            if (this.archivedNoteIds.length > 0 && reportGeneratorViewModel.reportConfig.hasIncludeArchivedpoints === false) {
                for (let i = 0; i < this.getLoadedItems().length; i++) {
                    if (loadedItems[i].isArchived && (idsToPrint.indexOf(loadedItems[i].id + "0") !== -1 || idsToPrint.indexOf(loadedItems[i].id + "1") !== -1 ||
                        idsToPrint.indexOf(loadedItems[i].id + "2") !== -1 || idsToPrint.indexOf(loadedItems[i].id + "3") !== -1)) {

                        let index = idsToPrint.indexOf((<NoteItemViewModel>this.getLoadedItems()[i]).id + "0");
                        if (index === -1)
                            index = idsToPrint.indexOf((<NoteItemViewModel>this.getLoadedItems()[i]).id + "1");
                        if (index === -1)
                            index = idsToPrint.indexOf((<NoteItemViewModel>this.getLoadedItems()[i]).id + "2");
                        if (index === -1)
                            index = idsToPrint.indexOf((<NoteItemViewModel>this.getLoadedItems()[i]).id + "3");
                        idsToPrint.splice(index, 1);
                    }
                }
            }

            let selectedLanguage = null;
            if (reportGeneratorViewModel.languageSelector.selectedViewModel && reportGeneratorViewModel.languageSelector.selectedViewModel !== null) {
                let languageVm: ap.viewmodels.identificationfiles.languages.LanguageViewModel = <ap.viewmodels.identificationfiles.languages.LanguageViewModel>reportGeneratorViewModel.languageSelector.selectedViewModel;
                if (languageVm !== null)
                    selectedLanguage = languageVm.originalLanguage;
            }

            let reportMeetingId: string;
            if (reportGeneratorViewModel.meeting && reportGeneratorViewModel.meeting !== null && !reportGeneratorViewModel.meeting.IsSystem)
                reportMeetingId = reportGeneratorViewModel.meeting.Id;
            pointReportParams = this._controllersManager.reportController.createPointReportParams(reportGeneratorViewModel.reportConfig.reportconfig,
                reportGeneratorViewModel.reportConfig.reportTitles.searchText, selectedLanguage, idsToPrint, reportGeneratorViewModel.isIndividualReport, reportMeetingId);

            return pointReportParams;
        }

        /**
        * This method will return the page index of the page which contains the itemId
        * @param itemId is the item need to find the page index
        **/
        public getPageIndex(itemId: string): number {
            let result: number = -1;
            if (this._pages && this._pages !== null && this._pages.length > 0) {
                for (let i = 0; i < this._pages.length; i++) {
                    let page: PageDescription = this._pages[i];
                    if (page.idsList && page.idsList !== null && page.idsList.length > 0) {
                        for (let j = 0; j < page.idsList.length; j++) {
                            let idGuidInfo: GuidInfo = page.idsList[j];
                            if (itemId.indexOf(idGuidInfo.key) >= 0)
                                return i;
                        }
                    }
                }
            }
            return result;
        }

        /**
         * Handles the loaded elements from the API to put them at the right place in the sourceItems property
         * @param args The API response
         * @param pageDesc The page correspondong to the loaded items
         * @param idxLastLoaded The index of the page
         * @param utility Utility class
         * @param q IQService
         * @param createItemVmHandler Function to create ViewModels from the loaded entities
         * @param parameters Some parameters to pass to initialize ViewModels
         */
        loadPageSuccessHandler(args: ap.services.apiHelper.ApiResponse, pageDesc: PageDescription,
            idxLastLoaded: number, utility: ap.utility.UtilityHelper, q: angular.IQService,
            createItemVmHandler?: new (utility: ap.utility.UtilityHelper, q: angular.IQService, parentListVm?: BaseListEntityViewModel, itemParameters?: ItemConstructorParameter) => IEntityViewModel,
            parameters?: LoadPageSuccessHandlerParameter): IEntityViewModel[] {
            let items = args.data;
            let len: number = items.length;
            let arrayItem = new Array<IEntityViewModel>(len);

            let entityItem: ap.models.notes.Note, i: number;
            let noteIsArchived: boolean = false;
            let isEntityFound: boolean = false;

            for (i = 0; i < len; i++) {
                entityItem = <ap.models.notes.Note>items[i];
                isEntityFound = false;
                /**
                 * Bao corrected: The noteResult.originalId should be equa with the original ids  (this._listIds)
                 * Here is the rule at server side and also applied on the method _loadPageHandler :
                 * Item is NoteComment -> id = NoteCommentId + "0"
                 * Item is NoteComment of archived note : Id = NoteCommentId + "-4"
                 * Item is Note => Id = NoteId + "1";
                 * Item is Archived note => Id = NoteId + "-1"
                 * Item is NoteIncharge => Id = NoteInchargeId + "2" 
                 * Item is NoteIncharge of archived note => Id = NoteInchargeId + "-2"
                 * Item is NoteDocument -> Id = NoteDocumentId + "3"
                 * Item is NoteDocument of archived note -> Id = NoteDocumentId + "-3"
                 **/
                noteIsArchived = entityItem.IsArchived;
                // Check if the Guid is a comment
                if (entityItem.Comments && this._noteCommentIdsWithIndexs.length > 0) {
                    for (let y = 0; y < entityItem.Comments.length; y++) {
                        for (let j = 0; j < this._noteCommentIdsWithIndexs.length; j++) {
                            if (this._noteCommentIdsWithIndexs[j][0] && this._noteCommentIdsWithIndexs[j][0] === entityItem.Comments[y].Id) {

                                let idx: number = this._noteCommentIdsWithIndexs[j][1];

                                let noteResult = new createItemVmHandler(utility, this.$q, this, new UserCommentItemConstructorParameter(((this.options.pageSize * idxLastLoaded) + idx), entityItem, pageDesc, null, this.$utility, this._controllersManager, entityItem.Comments[y]));
                                noteResult.init(entityItem);
                                (<ap.viewmodels.notes.NoteBaseItemViewModel>noteResult).originalId = noteIsArchived ? entityItem.Comments[y].Id + "-4" : entityItem.Comments[y].Id + "0";
                                arrayItem[idx] = noteResult;
                                isEntityFound = true;

                                // leave the loop looking for matching comment
                                break;
                            }
                        }
                        // leave the loop looking for matching comment
                        if (isEntityFound) {
                            break;
                        }
                    }

                    // go to the next loaded entity
                    if (isEntityFound) {
                        continue;
                    }
                }

                // Check if the Guid is a noteincharge
                if (!isEntityFound && entityItem.NoteInCharge && this._noteInChargeIdsWithIndexs.length > 0) {
                    entityItem.NoteInCharge.forEach((noteInCharge: ap.models.notes.NoteInCharge) => {
                        this._noteInChargeIdsWithIndexs.forEach((noteInChargeIdsWithIndexs: any) => {
                            if (noteInChargeIdsWithIndexs && noteInChargeIdsWithIndexs[0] && noteInChargeIdsWithIndexs[0] === noteInCharge.Id) {

                                let idx: number = noteInChargeIdsWithIndexs[1];

                                // idxLastLoaded + i
                                let noteResult = <ap.viewmodels.notes.NoteBaseItemViewModel>new createItemVmHandler(utility, this.$q, this, new UserCommentItemConstructorParameter(((this.options.pageSize * idxLastLoaded) + idx), entityItem, pageDesc, null, this.$utility, this._controllersManager, entityItem.Comments.length > 0 ? entityItem.Comments[0] : null));
                                noteResult.uniqueInCharge = noteInCharge.Tag;
                                noteResult.originalId = noteIsArchived ? noteInCharge.Id + "-2" : noteInCharge.Id + "2";
                                noteResult.init(entityItem);

                                arrayItem[idx] = noteResult;
                            }
                        });
                    });
                }

                // Check if the Guid is a note
                if (!isEntityFound && this._noteIdsWithIndexs.length > 0) {
                    for (let j = 0; j < this._noteIdsWithIndexs.length; j++) {
                        if (this._noteIdsWithIndexs[j] && this._noteIdsWithIndexs[j][0] && this._noteIdsWithIndexs[j][0] === entityItem.Id) {

                            let idx: number = this._noteIdsWithIndexs[j][1];

                            let noteResult = <ap.viewmodels.notes.NoteBaseItemViewModel>new createItemVmHandler(utility, this.$q, this, new UserCommentItemConstructorParameter(((this.options.pageSize * idxLastLoaded) + idx), entityItem, pageDesc, null, this.$utility, this._controllersManager, entityItem.Comments.length > 0 ? entityItem.Comments[0] : null));
                            noteResult.init(entityItem);
                            noteResult.originalId = noteIsArchived ? entityItem.Id + "-1" : entityItem.Id + "1";
                            arrayItem[idx] = noteResult;
                            break;
                        }
                    }
                }
            }
            return arrayItem;
        }

        /**
        * This method will remove the note from the list and return true if all items was removed 
        * @param note: The note need to remove
        **/
        removeNote(note: ap.models.notes.NoteBase): boolean {
            // Show error when note is undefined or null
            if (note === undefined || note === null) {
                throw new Error("removenote_note_mandatory");
            }
            else {
                // Find all items which have original note = note and remove them
                // Manage the group : remove the group if all items of this group was removed
                // when group by incharge or plan, one note can be display as many items then we need to remove all of them
                let checkMultiItem: boolean = false;
                if (this._groupDescription && (this._groupDescription === "InCharge" || this._groupDescription === "Plan")) {
                    checkMultiItem = true;
                }
                for (let i = 0; i < this.count; i++) {
                    let item: ap.viewmodels.notes.NoteBaseItemViewModel = <ap.viewmodels.notes.NoteBaseItemViewModel>this.sourceItems[i];
                    if (item && item.originalNoteBase && item.originalNoteBase !== null && item.originalNoteBase.Id === note.Id) {
                        item.isRemoved = true;
                        let itemindex: number = this._listIds.indexOf(item.originalId);
                        if (itemindex >= 0) {
                            this._listIds.splice(itemindex, 1);
                        }
                        this.manageRemoveGroup(item);
                        if (!checkMultiItem)
                            break;
                    }
                }
            }
            return this._listIds.length <= 0;
        }

        private manageRemoveGroup(removeditem: ap.viewmodels.notes.NoteBaseItemViewModel): void {
            if (this._groupDescription !== "None") {
                // When the removed item in the added group
                if (this._addedUserComment && this._addedUserComment !== null && this._addedUserComment.length > 0
                    && this._addedUserComment.indexOf(removeditem) >= 0) {
                    let groupItem: ap.viewmodels.notes.NoteBaseItemViewModel = null;
                    for (let i = 0; i < this._groupsList.length; i++) {
                        let group: GroupIndex = this._groupsList[i];
                        let item: ap.viewmodels.notes.NoteBaseItemViewModel = <ap.viewmodels.notes.NoteBaseItemViewModel>group.item;
                        if (item.subject === "app.notes.noteadded" || item.subject === this.$utility.Translator.getTranslation("app.notes.noteadded")) {
                            groupItem = item;
                            break;
                        }
                    }
                    let numberRemoveItem: number = 0;
                    for (let i = 0; i < this._addedUserComment.length; i++) {
                        let item: ap.viewmodels.notes.NoteBaseItemViewModel = this._addedUserComment[i];
                        if (item.originalEntity.Id !== ap.utility.UtilityHelper.createEmptyGuid() && item.isRemoved)
                            numberRemoveItem += 1;
                    }
                    if (groupItem !== null && numberRemoveItem === this._addedUserComment.length - 1)
                        groupItem.isRemoved = true;
                }
                else {
                    let groupName = this._getGroupNameForItem(removeditem);
                    for (let i = 0; i < this._groupsList.length; i++) {
                        let group: GroupIndex = this._groupsList[i];
                        let groupItem: ap.viewmodels.notes.NoteBaseItemViewModel = <ap.viewmodels.notes.NoteBaseItemViewModel>group.item;
                        if (groupItem.subject === groupName && !groupItem.isRemoved) {
                            let found: boolean = false;
                            for (let j = 0; j < this.sourceItems.length; j++) {
                                let item: ap.viewmodels.notes.NoteBaseItemViewModel = <ap.viewmodels.notes.NoteBaseItemViewModel>this.sourceItems[j];
                                if (item && item.originalEntity && item.originalEntity !== null && item.originalEntity
                                    && item.originalEntity.Id !== ap.utility.UtilityHelper.createEmptyGuid()
                                    && !item.isRemoved) {
                                    let gr = this._getGroupNameForItem(item);
                                    if (gr === groupName) {
                                        found = true;
                                        break;
                                    }
                                }
                            }
                            if (!found) {
                                groupItem.isRemoved = true;
                                break;
                            }
                        }
                    }
                }
            }
        }

        /*
        * This method is to change the groups index if one item is added on top of the list
        * @param groupAdded to know if a group has been added
        */
        private updateGroupsIndex(groupAdded: boolean) {
            let i: number = 0;
            let groups: NoteBaseItemViewModel[] = this._dicGroups.values();
            let len: number = groups.length;
            this._dicGroups.clear();
            this._groupsList = [];
            let addedGroupName = this.$utility.Translator.getTranslation("app.notes.noteadded");
            for (i; i < len; i++) {
                let currentGroup = groups[i];
                let newGroup = null;

                if (currentGroup.subject === addedGroupName) {
                    newGroup = this._buildGroup(currentGroup.subject, 0);
                } else {
                    newGroup = this._buildGroup(currentGroup.subject, currentGroup.index + (groupAdded ? 2 : 1));  // add 2 (group + note) | add 1 (note)
                }

                this._dicGroups.add(newGroup.index, newGroup);
                this._groupsList.push(new GroupIndex(newGroup.index, newGroup));
            }
        }

        /*
        * Handler method to add the new note to the top of the list and refresh the indexes
        * @param noteEvt the note updated event
        */
        private noteAddedHandler(noteEvt: ap.controllers.NoteBaseUpdatedEvent) {
            if ((this._controllersManager.mainController.currentMeeting === null) || (noteEvt.notes[0].Meeting.Id === this._controllersManager.mainController.currentMeeting.Id)) {
                let newCount: number = 0;
                let addedNote: ap.models.notes.Note = <ap.models.notes.Note>noteEvt.notes[0];

                let noteResult = <ap.viewmodels.notes.NoteBaseItemViewModel>new this.options.itemConstructor(this.$utility, this.$q, this, new UserCommentItemConstructorParameter(0, addedNote, null, null, this.$utility, this._controllersManager, addedNote.Comments && addedNote.Comments.length > 0 ? addedNote.Comments[0] : null));
                noteResult.originalId = addedNote.Id + "1"; // "1" is type of Note
                noteResult.init(addedNote);

                this._addedItemsCount++; // the number of notes added (without fresh of the list)

                // Bao added : We create the new group only when we already have group
                if (this._groupDescription !== "None") {
                    let addedGroupName: string = this.$utility.Translator.getTranslation("app.notes.noteadded");

                    let addedNoteGroupIndx = this._addedUserComment.map((e) => {
                        return e.subject;
                    }).indexOf(addedGroupName);

                    if (addedNoteGroupIndx === -1) {
                        // need to create the group
                        newCount++;
                        this.updateGroupsIndex(true);

                        // need to create the group for the new note
                        let userCommentGroupVm = this._buildGroup(addedGroupName, 0);
                        this._addedUserComment.push(userCommentGroupVm);

                        // add the group
                        this._dicGroups.add(0, userCommentGroupVm);
                        this._groupsList.splice(0, 0, new GroupIndex(0, userCommentGroupVm));
                        this._groupCount++;
                    } else {
                        this.updateGroupsIndex(false);
                    }
                }
                // AP-12737: Need to add into list of managed ids for print or export.
                this._listIds.splice(0, 0, noteResult.originalId);

                this._buildIndexes();

                this.sourceItems.splice(0, 0, noteResult); // insert the element at position 0
                noteResult.on("propertychanged", this.itemPropertyChanged, this);
                this._addedUserComment.push(noteResult);
                newCount++;

                this._setCount(this.count + newCount);
            }
        }

        /**
         * Handler method called when a note is updated
         * @param itemUpdatedEvent The event received from NoteController
         */
        private itemUpdatedHandler(itemUpdatedEvent: ap.controllers.NoteBaseUpdatedEvent) {
            let items: ap.models.notes.NoteBase[] = itemUpdatedEvent.notes;
            if (items) {
                if (itemUpdatedEvent.properties && itemUpdatedEvent.properties[0] === "IsArchived" && items[0].IsArchived === true) {
                    for (let i = 0; i < items.length; i++) {
                        this.archivedNoteIds.push(items[i].Id);
                    }
                }

                // uncheck edited notes and update edited notes in the list
                let checkeditems = this.getCheckedItems();
                for (let i = 0; i < items.length; i++) {
                    if (checkeditems.length > 0) {
                        for (let j = 0; j < checkeditems.length; j++) {
                            if (checkeditems[j].originalEntity.Id === items[i].Id) {
                                checkeditems[j].isChecked = false;
                            }
                        }
                    }

                    // refresh the item in the list
                    this.updateItem(items[i]);
                }
            }
        }

        /**
         * Handler method called when a comment is saved
         * @param evt The event received from the controller
         */
        private commentSavedHandler(evt: ap.controllers.CommentSavedEvent) {
            let noteVm: ap.viewmodels.notes.NoteBaseItemViewModel = <ap.viewmodels.notes.NoteBaseItemViewModel>this.getEntityById(evt.noteId);

            if (noteVm && noteVm.originalEntity.EntityVersion !== evt.note.EntityVersion) {
                // update the entityVersion of the note
                noteVm.originalNoteBase.updateEntityPropsOnly(evt.note);
            }
        }

        /**
         * Protected method called before an item is updated in 'updateItem' method
         * @override
         * @return a object which can then be used in 'afterUpdateItem' method
         */
        protected beforeUpdateItem(updatedItem: ap.models.notes.Note, currentEntityViewModel: ap.viewmodels.notes.NoteBaseItemViewModel): NoteUpdatedParam {
            return new NoteUpdatedParam(currentEntityViewModel.originalNoteBase.Meeting && updatedItem.Meeting && currentEntityViewModel.originalNoteBase.Meeting.Id !== updatedItem.Meeting.Id);
        }

        /**
         * Protected method called after an item has been updated in 'updateItem' method
         * @override
         * @param param The parameter created by 'beforeUpdateItem'
         */
        protected afterUpdateItem(param: NoteUpdatedParam, currentEntityViewModel: ap.viewmodels.notes.NoteBaseItemViewModel) {
            if (param) {
                currentEntityViewModel.isMoved = param.isMoved && !!this._controllersManager.mainController.currentMeeting;
            }
        }

        /**
        * This method is called when the event 'reportstatusrefreshed' was fired from the reportcontorller
        * @param reportRequest is the ReportRequest entity contains information of the report
        **/
        private reportstatusrefreshed(reportRequest: ap.models.reports.ReportRequest) {
            let self = this;
            if (reportRequest && reportRequest.Status === ap.models.reports.ReportRequestStatus.Generated) {
                this._controllersManager.mainController.showToast("ap.report.originalplans_ready_download_message", reportRequest, "Download", [reportRequest.ReportTitle]).then((rr: ap.models.reports.ReportRequest) => {
                    if (rr.DocumentId) {
                        this._api.getEntityById("Document", rr.DocumentId).then((apiResponse: ap.services.apiHelper.ApiResponse) => {
                            let document: ap.models.documents.Document = new ap.models.documents.Document(this.$utility);
                            document.createByJson(apiResponse.data);
                            self._controllersManager.documentController.downloadDocument(document);
                        });
                    } else {
                        this._controllersManager.reportController.downloadDocumentOriginalSize(rr);
                    }
                });
                self._controllersManager.reportController.unregisterReportRequestStatusRefresh(reportRequest);
            }
        }

        /**
         * This method use for check/uncheck all items of group
         * @param item - Group item
         */
        public setCheckGroup(item: UserCommentViewModel) {
            if (!item.isGroupEntity)
                return;
            let arrItemsOfGroup = this._dicGroupsOfUserComments.getValue(item.subject);
            let checkedItems = arrItemsOfGroup.filter((item) => { return item.isChecked; });
            let check = checkedItems.length !== arrItemsOfGroup.length;
            arrItemsOfGroup.forEach((item) => {
                item.isChecked = check;
            });
        }

        /**
         * This method use for set empty page to list
         */
        public initEmptyList() {
            this.setIds([]);
        }

        /**
         * Constructor
         * @param $scope $scope of the object
         * @param utility UtilityClasses
         * @param _api Api service
         * @param $q $q service
         * @param _controllersManager ControllersManager to get access to controllers
         * @param _reportService ReportService
         * @param itemCreator Constructor of each item of the list
         * @param pathToLoad Used to define which properties to load of a note
         * @param sortOrder Defines the sort order of the notes whithin the list
         * @param defaultFilter Default filter applied to the list before to load the data
         * @param groups All the possible groups
         * @param groupName Current group name
         * @param pageSize Defines how many items should be loaded at a time
         * @param isNote To know if we're loading notes of forms
         */
        constructor($scope: ng.IScope, utility: ap.utility.UtilityHelper, protected _api: ap.services.apiHelper.Api,
            protected $q: angular.IQService, private _controllersManager: ap.controllers.ControllersManager,
            private _reportService: ap.services.ReportService,
            itemCreator?: new (utility: ap.utility.UtilityHelper, q: angular.IQService, parentListVm?: BaseListEntityViewModel, itemParameters?: UserCommentItemConstructorParameter) => IEntityViewModel, pathToLoad?: string,
            sortOrder?: string, defaultFilter?: string, groups: string[] = [], groupName: string = "", pageSize: number = 50, private isNote: boolean = true) {

            super(utility, _controllersManager.listController, $q, new GenericPagedListOptions(isNote ? "Note" : "Form", itemCreator, pathToLoad, sortOrder, pageSize, false, true, "UserComment", false), defaultFilter);

            this.isDeferredLoadingMode = true;

            this._groups = groups;
            this._groupDescription = groupName;
            if (isNote) {
                this._controllersManager.noteController.on("noteadded", this.noteAddedHandler, this);
                this._controllersManager.noteController.on("noteupdated", this.itemUpdatedHandler, this);
                this._controllersManager.noteController.on("commentsaved", this.commentSavedHandler, this);
            } else {
                this._controllersManager.formController.on("formupdated", this.itemUpdatedHandler, this);
            }

            this._controllersManager.reportController.on("reportstatusrefreshed", this.reportstatusrefreshed, this);

            $scope.$on("$destroy", () => {
                this._archivedNoteIds.splice(0);
                if (this.isNote) {
                    this._controllersManager.noteController.off("noteadded", this.noteAddedHandler, this);
                    this._controllersManager.noteController.off("noteupdated", this.itemUpdatedHandler, this);
                } else {
                    this._controllersManager.formController.off("formupdated", this.itemUpdatedHandler, this);
                }
                this._controllersManager.reportController.off("reportstatusrefreshed", this.reportstatusrefreshed, this);
                this._controllersManager.noteController.off("commentsaved", this.commentSavedHandler, this);
            });
        }

        private _noteCommentIdsWithIndexs: any[][] = [];
        private _noteIdsWithIndexs: any[][] = [];
        private _noteInChargeIdsWithIndexs: any[][] = [];

        // Group management
        private _groupDescription: string;
        private _groups: string[];
        private _currentGroupName: string = "";
        private _groupCount: number = 0;
        private _currentPageGroupCount: number = 0;
        private _groupsList: GroupIndex[] = [];  // cache group indexes
        private _indexes: number[] = [];
        private _dicGroups: Dictionary<number, UserCommentViewModel> = new Dictionary<number, UserCommentViewModel>();
        private _dicGroupsOfUserComments: Dictionary<string, UserCommentViewModel[]> = new Dictionary<string, UserCommentViewModel[]>();
        private _addedUserComment: NoteBaseItemViewModel[] = [];
        private _addedItemsCount: number = 0;

        private _archivedNoteIds: string[] = [];
        private _loadIdsCache: Dictionary<string, angular.IDeferred<ap.services.apiHelper.ApiResponse>[]> = new Dictionary<string, angular.IDeferred<ap.services.apiHelper.ApiResponse>[]>();
    }
}