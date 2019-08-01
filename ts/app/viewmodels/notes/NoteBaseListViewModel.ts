module ap.viewmodels.notes {

    export abstract class NoteBaseListViewModel implements IDispose, ap.utility.IListener {
        /*
         * Return if it is in multi-actions mode, can be used to hide download action of each Point/Note
         */
        public get isMultiActions(): boolean {
            return this._isMultiActions;
        }

        /**
         * This is the sceenInfo of the view
         **/
        public get screenInfo() {
            return this._screenInfo;
        }

        /**
        * Used to know if the list will be display in the detail of a form
        **/
        public get isForFormsModule(): boolean {
            if (this._formId)
                return true;
            else
                return false;
        }

        /**
        * This is the index of the first item visible on the view
        **/
        public get topIndex(): number {
            return this._topIndex;
        }

        public set topIndex(top: number) {
            this._topIndex = top;
        }


        /**
         * The MultiActionsViewModel to manage the list multi actions
         **/
        public get multiActionsViewModel(): ap.viewmodels.home.MultiActionsViewModel {
            return this._multiActions;
        }

        /**
         * The main actions of the note list
         **/
        public get mainActions(): Array<ap.viewmodels.home.ActionViewModel> {
            return this._mainActions;
        }

        public get documentId(): string {
            return this._documentId;
        }

        /**
        * This property is to know if the col is available in the grid or not
        **/
        public get hasMeetingCol(): boolean {
            return this._hasMeetingCol;
        }

        /** 
        * Public setter to change the documentId used to load the list of notes
        */
        public set documentId(newValue: string) {
            if (this._documentId !== newValue) {
                this._documentId = newValue;
                this.listVm.removeCustomParam("planid");
                this.listVm.addCustomParam("planid", this._documentId);

                this.loadData();
            }
        }

        /**
         * To know if the predefined filter actived is selected in the main search
         **/
        get hasActiveFilter(): boolean {
            return this._hasActiveFilter;
        }

        /**
         * To know if the predefined filter archived is selected in the main search
         **/
        get hasArchivedFilter(): boolean {
            return this._hasArchivedFilter;
        }

        /**
        * Property accessor to know the number of arhcived points in the list
        */
        get archivedItemsCount(): number {
            return this._archivedItemsCount;
        }

        /**
        * Property accessor to know if the number of active points in the list
        */
        get unarchivedItemsCount(): number {
            return this._unarchivedItemsCount;
        }

        /**
         * To know is the list is empty due to the current filter.
         **/
        get isFilterItemsEmpty(): boolean {
            return this._isFilterItemsEmpty;
        }

        /**
         * To know the current group view
         **/
        get groupView(): string {
            return this._groupView;
        }

        /**
        * This public setter is used to set value to selectedMeetingItem property
        */
        public set selectedMeetingItem(val: IEntityViewModel) {
            this._selectedMeetingItem = val;
        }


        /**
        * Setter to define a new group for the list
        * This will also refresh the list
        */
        set groupView(group: string) {
            if (this._groupView !== group) {
                this._groupView = group;
                this.listVm.groupDescription = this._groupView;

                this.listVm.removeCustomParam("groupby");
                this.listVm.addCustomParam("groupby", this.convertNoteGroupToServerGroupBy(this._groupView));

                this.listVm.removeCustomParam("IsNoneGroupLast");
                this.listVm.addCustomParam("IsNoneGroupLast", "true");

                this.$utility.Storage.Session.set(this.getListViewName() + ".groupView", this._groupView);

                this.refresh();
            }
        }
        /**
         * This is to know which group to use by default
         */
        protected getDefaultGroupView(): string {
            return "Date";
        }

        protected getGroupActionTitleKey(): string {
            return "Group list";
        }

        /**
         * This method will be called to create the list view model
         */
        protected abstract createUserCommentListVm(apiGroups: string[], defaultGroupData: string): UserCommentPagedListViewModel;
        /**
         * This method must be implemented to know the name of the view
         */
        protected abstract getListViewName(): string;

        /**
         * This method must be implemented to create the addActions 
         */
        protected abstract createAddActions(): ap.viewmodels.home.ActionViewModel;
        /**
         * This method must be implemented to create parameter to know how to search in the main search
         */
        protected abstract createMainSearchInfo(): ap.misc.MainSearchInfo;

        /**
         * Abstract method to open the popup to configure project's rooms while editing/adding a noteBase
         */
        public abstract openConfigureRoomDialog(): void;

        /**
         * This method must be implemented to create action for multiAction model
         */
        protected createMultiActionViewModel(): ap.viewmodels.home.MultiActionsViewModel {
            return null;
        }

        /**
         * This method must be implemented to create the main action list for the list. By default, there is one action to refresh the list
         */
        protected createMainActions(): ap.viewmodels.home.ActionViewModel[] {
            let groups = this.createGroups();
            if (!!groups && groups.length > 0) {
                this._groupActions = new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "groupnotelist", this.$utility.rootUrl + "Images/html/icons/ic_group_work_black_48px.svg", true, groups, this.getGroupActionTitleKey(), true);
            }
            let actions: ap.viewmodels.home.ActionViewModel[] = [];
            if (!!this._groupActions)
                actions.push(this._groupActions);
            actions.push(new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "refreshlist", this.$utility.rootUrl + "Images/html/icons/ic_refresh_black_48px.svg", true, null, "Refresh list", true));
            return actions;
        }

        /**
        * Initialize the custom params needed to load the list
        */
        protected initCustomParams() {
            if (!this.listVm.containsParam("projectid")) {
                this.listVm.addCustomParam("projectid", this.$controllersManager.mainController.currentProject().Id);
            }
            if (this.$controllersManager.mainController.currentMeeting && (!this.listVm.containsParam("meetingid")
                || this.listVm.getParam("meetingid").value !== this.$controllersManager.mainController.currentMeeting.Id)) {
                this.listVm.removeCustomParam("meetingid");
                this.listVm.addCustomParam("meetingid", this.$controllersManager.mainController.currentMeeting.Id);
            }

            if (this._documentId && !this.listVm.containsParam("planid")) {
                // only load the notes attached to the plan
                this.listVm.addCustomParam("planid", this._documentId);
            }
            if (this._formId) {
                this.listVm.addCustomParam("parentnotebaseid", this._formId);
            }
        }

        /**
        * This method refreshes the list of points and can select a point after the refresh if it's has been supplied in parameter and still abvailable after the refresh
        * @param idToSelect string The id of the point to select after the refresh
        * @param force boolean Force the refresh event if the list is empty
        */
        public refresh(idToselect?: string, force?: boolean, cumulIOInfo?: dashboard.CumulIOInfo);
        public refresh(idToSelect?: string, force?: boolean, idInfo?: NoteIdInfo);
        public refresh(idToSelect?: string, force?: boolean, info?: NoteIdInfo | dashboard.CumulIOInfo) {
            this._listener.raise("beginloaddata");
            this._isFilterItemsEmpty = null;
            this._archivedItemsCount = null;
            this._unarchivedItemsCount = null;
            let options: ap.services.apiHelper.ApiOption = new ap.services.apiHelper.ApiOption();
            options.async = false;
            let filter: string;
            if (this.$controllersManager.mainController.currentMeeting)
                filter = "Filter.Eq(Meeting.Id, " + this.$controllersManager.mainController.currentMeeting.Id + ")";
            else
                filter = "Filter.Eq(Project.Id, " + this.$controllersManager.mainController.currentProject().Id + ")";

            let statsName = this.listVm.entityName + "stats";
            this._hasArchivedFilter = !!this._screenInfo.mainSearchInfo && this._screenInfo.mainSearchInfo.hasPredefinedFilterCriterion("Archived");
            this._hasActiveFilter = !!this._screenInfo.mainSearchInfo && this._screenInfo.mainSearchInfo.hasPredefinedFilterCriterion("Active");

            this.$api.getApiResponseStatList(statsName, "IsArchived", filter, options).then((result) => {
                let noteStats: ap.models.stats.StatResult[] = result.data[0];  // get the notes stats
                // no stats means no notes for the given project
                if (!noteStats || noteStats.length === 0) {
                    this._unarchivedItemsCount = 0;
                    this._archivedItemsCount = 0;

                    if (!force) {
                        return;
                    }
                }
                else {
                    if (!noteStats[0].GroupByValue) {
                        // not archived notes
                        this._unarchivedItemsCount = noteStats[0].Count;

                        if (noteStats.length > 1) {
                            this._archivedItemsCount = noteStats[1].Count;
                        } else {
                            this._archivedItemsCount = 0;
                        }
                    }
                    else {
                        // archived notes
                        this._archivedItemsCount = noteStats[0].Count;

                        if (noteStats.length > 1) {
                            this._unarchivedItemsCount = noteStats[1].Count;
                        } else {
                            this._unarchivedItemsCount = 0;
                        }
                    }
                }
                let isAll = !!this._screenInfo.mainSearchInfo && this._screenInfo.mainSearchInfo.getPredefinedFilterCriterions() === null;

                this._canFilter = ((isAll && (this.unarchivedItemsCount > 0 || this.archivedItemsCount > 0)) || (!this.hasArchivedFilter && this.unarchivedItemsCount > 0) || (this.hasArchivedFilter && this.archivedItemsCount > 0));
                if (this._canFilter) {
                    this.listVm.loadIds().then(() => {
                        // this.computeActionsAccess();
                        this._isFilterItemsEmpty = this.listVm.count <= 0 && (this.hasActiveFilter || this.archivedItemsCount === 0);
                        let loadPageIndex = 0;
                        if (idToSelect && !StringHelper.isNullOrEmpty(idToSelect)) {
                            loadPageIndex = this.listVm.getPageIndex(idToSelect);
                            if (loadPageIndex < 0) loadPageIndex = 0;
                        }
                        this.listVm.loadPage(loadPageIndex).then(() => {
                            if (idToSelect && !StringHelper.isNullOrEmpty(idToSelect)) {
                                // select the item and scroll to this item
                                let commentId = idToSelect.substring(0, 36);
                                let foundSelectedVms = this.listVm.sourceItems.filter((item: NoteBaseItemViewModel) => { return item.originalEntity.Id === commentId; });
                                if (foundSelectedVms.length > 0) {
                                    this.listVm.selectEntity(foundSelectedVms[0].originalEntity.Id);
                                    this.scrollToItem(foundSelectedVms[0].originalEntity.Id);
                                }
                            }
                            this.updateNbItemChecked();
                            this.manageMultiActionsMode();
                        });
                    });
                }
                else {
                    this.listVm.clear();
                    this.updateNbItemChecked();
                    this.manageMultiActionsMode();
                    this._isFilterItemsEmpty = this.hasArchivedFilter;
                }
            });
        }


        /**
        * This method is used to update the topIndex for the selected item
        * @param idToScroll is the id of the item need to scroll to 
        **/
        protected scrollToItem(idToScroll: string) {
            this._topIndex = this.listVm.getItemIndexWithGroup(idToScroll);
        }

        private addCriterionToListFilter() {
            // Don't add the search filter to the custom params when it's empty (after the user deleted his filter)
            if (!!this.screenInfo.mainSearchInfo) {
                let criterions = this._screenInfo.mainSearchInfo.getCriterionsNotPredefined();
                if (!this._screenInfo.mainSearchInfo.hasMostAdvancedFilter && criterions != null) {
                    this.listVm.addCustomParam("searchfilter", this.$utility.JsonSerializer.serialize(criterions));
                } else if (this._screenInfo.mainSearchInfo.hasMostAdvancedFilter) {
                    this.listVm.addCustomParam("advancedfilter", this.$utility.JsonSerializer.serialize(this._screenInfo.mainSearchInfo.getFilterDataList()));
                }
            }
        }

        /**
        * This method is used to load the data of the list
        * @param idInfo object containing the info to select a note in the list
        * @param cumulIOInfo object containing info to initialize the list based on a dashboard
        */
        public loadData(idToselect?: string, cumulIOInfo?: dashboard.CumulIOInfo);
        public loadData(idToselect?: string, idInfo?: NoteIdInfo);
        public loadData(idToselect?: string, info?: NoteIdInfo | dashboard.CumulIOInfo) {
            this.initCustomParams();
            this.listVm.removeCustomParam("searchfilter");
            this.listVm.removeCustomParam("advancedfilter");

            if (!info || (info && info instanceof NoteIdInfo)) {
                this.addCriterionToListFilter();
            }

            if (info && info instanceof dashboard.CumulIOInfo) {
                // first remove the existing criterions
                this._screenInfo.mainSearchInfo.clearCriterions(false);

                if (info.isArchived !== null) {
                    this._screenInfo.mainSearchInfo.addCriterionWithoutEvent(this._screenInfo.mainSearchInfo.getPredefinedFilterByName(info.isArchived ? "Archived" : "Active"));
                    this.addCriterionToListFilter();
                } else {
                    // only get active points
                    this._screenInfo.mainSearchInfo.addCriterionWithoutEvent(this._screenInfo.mainSearchInfo.getPredefinedFilterByName("Active"));

                    if (info.issueType || info.status) {
                        if (info.issueType !== "null") {
                            // the user has clicked on the issueType dashboard
                            let valueDic: Dictionary<string, string[]> = new Dictionary([new KeyValue("Guid", [info.issueType ? info.issueType : info.status])]);
                            this._screenInfo.mainSearchInfo.addCriterionWithoutEvent(this._screenInfo.mainSearchInfo.getPropertyByName(info.issueType ? "IssueType.Description" : "Status.Name").filterDataName, valueDic, models.custom.FilterType.In);
                        } else {
                            // the user has clicked on the issueType dashboard -> notes linked to no issueType
                            this._screenInfo.mainSearchInfo.addCriterionWithoutEvent(this._screenInfo.mainSearchInfo.getPropertyByName(info.issueType ? "IssueType.Description" : "Status.Name").filterDataName, "", models.custom.FilterType.IsNull);
                        }
                    } else if (info.dueDate) {
                        if (info.dueDate === dashboard.DueDate.NoDueDate) {
                            this._screenInfo.mainSearchInfo.addCriterionWithoutEvent("DueDate", null, null, models.custom.FilterType.IsNull);
                        } else if (info.dueDate === dashboard.DueDate.Overtime) {
                            this._screenInfo.mainSearchInfo.initCriterionByItemData("DueDate", DateShortcut.Older);
                        } else if (info.dueDate === dashboard.DueDate.ComingSoon) {
                            let threeDaysLater: Date = new Date();
                            threeDaysLater.setDate(threeDaysLater.getDate() + 3);

                            this._screenInfo.mainSearchInfo.addCriterionWithoutEvent(this._screenInfo.mainSearchInfo.getPropertyByName("DueDate").filterDataName, new Date(), threeDaysLater, models.custom.FilterType.Between);
                        } else if (info.dueDate === dashboard.DueDate.OnTime) {
                            let threeDaysLater: Date = new Date();
                            threeDaysLater.setDate(threeDaysLater.getDate() + 3);

                            this._screenInfo.mainSearchInfo.addCriterionWithoutEvent(this._screenInfo.mainSearchInfo.getPropertyByName("DueDate").filterDataName, threeDaysLater, null, models.custom.FilterType.Gt);
                        }
                    }

                    this.addCriterionToListFilter();
                }
            }

            this._buildFilter();

            if (info && info instanceof NoteIdInfo) {
                this.refresh(idToselect, true, <NoteIdInfo>info);
            } else if (info && info instanceof dashboard.CumulIOInfo) {
                this.refresh(idToselect, true, <dashboard.CumulIOInfo>info);
            } else {
                this.refresh(idToselect, true, null);
            }
        }

        /**
        * This method build the filter before to load the data based on the property of the list
        */
        protected _buildFilter(): void {
            this.clearFilter();
            if (!!this._screenInfo.mainSearchInfo && this._screenInfo.mainSearchInfo.criterions.length > 0) {
                let criterion: ap.misc.Criterion;
                let keyVal: KeyValue<string, string>;
                for (let i = 0; i < this._screenInfo.mainSearchInfo.criterions.length; i++) {
                    criterion = this._screenInfo.mainSearchInfo.criterions[i];
                    if (criterion.predefinedFilter && criterion.predefinedFilter.customParams) {
                        for (let idxParam = 0; idxParam < criterion.predefinedFilter.customParams.count; idxParam++) {
                            keyVal = criterion.predefinedFilter.customParams.getKeyValue(idxParam);
                            this.listVm.addCustomParam(keyVal.key, keyVal.value);
                        }
                    }
                }
            }
        }

        /**
        * This method clears the current filter
        */
        protected clearFilter(): void {
            this.listVm.removeCustomParam("isarchived");
            this.listVm.removeCustomParam("isurgent");
        }

        /**
         * Event handler when there is an item checked
         * @param item: the item when it happen
         */
        protected itemCheckedChanged(item: ap.viewmodels.notes.NoteDetailBaseViewModel) {
            this.updateNbItemChecked();
            this.manageMultiActionsMode();
        }

        protected selectedAllChangedHandler() {
            this.updateNbItemChecked();
            this.manageMultiActionsMode();
        }

        /**
        * Methode use to get all the usercommentid of the items checked
        **/
        protected idsItemsChecked(): string[] {
            return this.listVm.listidsChecked;
        }

        /**
         * This method will update the number of item checked
         **/
        protected updateNbItemChecked() {
            if (this.listVm) {
                let checkedItems: string[];
                checkedItems = this.listVm.listidsChecked;
                this.screenInfo.checkedEntitiesId = checkedItems.slice(0);
            }
        }

        /**
        * This method is used to handler the multi action make by the user
        * @param actionName is the name of the action requested
        **/
        protected multiActionClickHandler(actionName: string) {
            let ids = this.idsItemsChecked();
            this.multiActionClick(actionName, ids);
        }

        /**
         * This method needs to be overloaded by children classes to make action when a click is done on a multiaction
         * @param actionName This is the name of the action clicked
         * @param ids This is the ids on which the action is done
         */
        protected multiActionClick(actionName: string, ids: string[]) {

        }


        /**
         * This method is to compute the visibility and accessibility of the multi actions. To be overloaded
         */
        protected computeMultiActionsAccessibility() {

        }

        /**
         * This method will initialize the multi actions mode or close it depending on the number of checked items in the list
         * > 0 -> enter the multi actions mode
         * = 0 -> close this multi actions mode
         */
        public manageMultiActionsMode() {
            if (!this.multiActionsViewModel) return;
            this.multiActionsViewModel.itemsChecked = this.listVm.listidsChecked;

            if (this.multiActionsViewModel.itemsChecked.length > 0) {
                this._isMultiActions = true;
                // this.computeEditMultiActionRight();
                this.computeMultiActionsAccessibility();

                // only go to multi action if this Class is used in the points module
                if (this.$controllersManager.uiStateController.mainFlowState === this._currentMainFlow && !this.$controllersManager.mainController.isMultiActionMode)
                    this.$controllersManager.mainController.gotoMultiActionsMode(this._multiActions);
            } else {
                this.closeMultiActions();
            }
        }

        /**
         * This method will closes the multiactions mode if activated.
         **/
        public closeMultiActions() {
            if (this._isMultiActions)
                this.$controllersManager.mainController.closeMultiActionsMode();

            if (this.$controllersManager.uiStateController.mainFlowState === ap.controllers.MainFlow.Documents) {
                this.multiActionsCloseRequested();
            }
        }

        /**
         * Finish multiaction and remove events, also uncheck all items
         **/
        protected multiActionsCloseRequested() {
            if (this._isMultiActions) {
                this._isMultiActions = false;

                this.listVm.off("ischeckedchanged", this.itemCheckedChanged, this); // do not check the multiactions mode each time we're going to check an item

                this.listVm.selectedAll = false;

                this.listVm.on("ischeckedchanged", this.itemCheckedChanged, this);
            }
        }

        /**
        * This method converts the notes groups to server groups usable by the API
        * @param noteGroup string The current group of the list
        * @return string The server group name
        */
        protected convertNoteGroupToServerGroupBy(noteGroup: string): string {
            switch (noteGroup) {
                case "Date":
                    return "Date";
                case "SubCategory":
                    return "PunchListItem";
                case "Status":
                    return "Status";
                case "DueDate":
                    return "DueDate";
                case "None":
                    return "None";
                case "InCharge":
                    return "InCharge";
                case "Room":
                    return "Room";
                default:
                    return "None";
            }
        }

        private getGroupActionByGroupView(): ap.viewmodels.home.SubActionViewModel {
            switch (this._groupView) {
                case "None":
                case "":
                    return this._groupActions.getSubAction("groupnotelist.none");
                case "Status":
                    return this._groupActions.getSubAction("groupnotelist.status");
                case "DueDate":
                    return this._groupActions.getSubAction("groupnotelist.duedate");
                case "Date":
                    return this._groupActions.getSubAction("groupnotelist.date");
                case "SubCategory":
                    return this._groupActions.getSubAction("groupnotelist.subcategory");
                case "InCharge":
                    return this._groupActions.getSubAction("groupnotelist.userincharge");
            }
        }

        /**
         * This method is handled when the criterion in the mainsearch has changed.
         */
        private searchCriterionsChanged() {
            if (this._currentMainFlow !== this.$controllersManager.uiStateController.mainFlowState) return;
            this.loadData();
        }

        /**
         * This method is to know if it is possible to group the view on a specific property. Need to overload
         */
        protected createGroups(): home.SubActionViewModel[] {
            return [
                new ap.viewmodels.home.SubActionViewModel(this.$utility, this.$utility.EventTool, "groupnotelist.none", null, true, true, this._groupView === "None", "No group", false, true),
                new ap.viewmodels.home.SubActionViewModel(this.$utility, this.$utility.EventTool, "groupnotelist.status", null, true, true, this._groupView === "Status", "Status", false, true),
                new ap.viewmodels.home.SubActionViewModel(this.$utility, this.$utility.EventTool, "groupnotelist.duedate", null, true, true, this._groupView === "DueDate", "Due date", false, true),
                new ap.viewmodels.home.SubActionViewModel(this.$utility, this.$utility.EventTool, "groupnotelist.date", null, true, true, this._groupView === "Date", "Modification date", false, true),
                new ap.viewmodels.home.SubActionViewModel(this.$utility, this.$utility.EventTool, "groupnotelist.subcategory", null, true, true, this._groupView === "SubCategory", "Subcategory", false, true),
                new ap.viewmodels.home.SubActionViewModel(this.$utility, this.$utility.EventTool, "groupnotelist.userincharge", null, true, true, this._groupView === "InCharge", "User in charge", false, true)
            ];
        }

        protected getApiGroups(): string[] {
            return ["None", "Date", "SubCategory", "DueDate", "InCharge", "Status"];
        }

        protected idsLoadedHandler() {

        }

        /**
         * This method will init the view to display the list of forms
         */
        public initList() {
            this._currentMainFlow = this.$controllersManager.uiStateController.mainFlowState;
            this._mainActions = this.createMainActions();
            let addActions = this.createAddActions();
            let mainSearchInfo = this.createMainSearchInfo();
            this._screenInfo = new ap.misc.ScreenInfo(this.$utility, this.getListViewName(), misc.ScreenInfoType.List, this._mainActions, addActions, mainSearchInfo);
            this._multiActions = this.createMultiActionViewModel();

            this._groupView = "None";
            if (this._groupActions && this._groupActions.hasSubActions) {
                this._groupView = this.$utility.Storage.Session.get(this.getListViewName() + ".groupView");

                if (this._groupView === undefined || this._groupView === null) {
                    this._groupView = this.getDefaultGroupView();
                }
                let subGroup = this.getGroupActionByGroupView();
                if (!!subGroup)
                    subGroup.isSelected = true;
            }


            let groupData: string = this.convertNoteGroupToServerGroupBy(this._groupView);
            // List initialization
            this.listVm = this.createUserCommentListVm(this.getApiGroups(), groupData);
            let notetypes: string = ap.models.notes.NoteType[ap.models.notes.NoteType.Message] + "," + ap.models.notes.NoteType[ap.models.notes.NoteType.MeetingPointNote] + "," + ap.models.notes.NoteType[ap.models.notes.NoteType.Note] + "," + ap.models.notes.NoteType[ap.models.notes.NoteType.Task];
            let pattern: any = new Date().getLocalDatePattern();
            this.listVm.addCustomParam("notetypes", notetypes);
            this.listVm.addCustomParam("groupby", this.convertNoteGroupToServerGroupBy(this._groupView));
            this.listVm.addCustomParam("datepattern", pattern);
            this.listVm.addCustomParam("ppactions", "updatenotemeetingaccessright");
            this.listVm.on("selectedallchanged", this.selectedAllChangedHandler, this);
            this.listVm.on("ischeckedchanged", this.itemCheckedChanged, this);
            this.listVm.on("idsloaded", this.idsLoadedHandler, this);

            // ScreenInfo initialization
            if (this._screenInfo) {
                this.screenInfo.on("actionclicked", this.listActionClickedHandler, this);
                if (!!this.screenInfo.mainSearchInfo) {
                    this.screenInfo.mainSearchInfo.on("criterionschanged", this.searchCriterionsChanged, this);
                }
            }

            // Multiaction initialization
            if (this._multiActions) {
                this._multiActions.on("actionClicked", this.multiActionClickHandler, this);
                this.computeMultiActionsAccessibility();


                this.$controllersManager.mainController.on("multiactioncloserequested", this.multiActionsCloseRequested, this);
            }

            this._hasMeetingCol = this.$utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_MeetingManagement)
                && this.$controllersManager.mainController.currentProject() !== null && this.$controllersManager.mainController.currentMeeting === null;

            this.loadData();
        }

        /**
         * This method is to make action when action of main action is used. Need to overload to manage specific action
         * @param actionName The name of action clicked
         */
        protected listActionClickedHandler(actionName: string) {
            switch (actionName) {
                case "refreshlist":
                    this.refresh(this.screenInfo.selectedEntityId);
                    break;
                case "groupnotelist.date":
                    this.groupView = "Date";
                    break;
                case "groupnotelist.subcategory":
                    this.groupView = "SubCategory";
                    break;
                case "groupnotelist.duedate":
                    this.groupView = "DueDate";
                    break;
                case "groupnotelist.status":
                    this.groupView = "Status";
                    break;
                case "groupnotelist.none":
                    this.groupView = "None";
                    break;
                case "groupnotelist.userincharge":
                    this.groupView = "InCharge";
                    break;
            }
        }

        on(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.on(eventName, callback, caller);
        }
        off(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.off(eventName, callback, caller);
        }

        public dispose() {
            if (this._listener) {
                this._listener.clear();
                this._listener = null;
            }

            if (this.screenInfo) {
                this.screenInfo.dispose();
                this._screenInfo = null;
            }

            if (this._multiActions) {
                this._multiActions.off("actionClicked", this.multiActionClickHandler, this);
                this._multiActions.dispose();
                this._multiActions = null;
            }

            if (this.listVm) {
                this.listVm.dispose();
                this.listVm = null;
            }
        }

        /**
        * This method use to open CreateNewMeetingDialog
        */
        public openCreateNewMeetingDialog(): angular.IPromise<string> {
            let defer: angular.IDeferred<string> = this.$q.defer();
            let meeting = this.$controllersManager.meetingController.createNewMeeting();
            let meetingVm = new ap.viewmodels.meetings.MeetingViewModel(this.$utility, this.$controllersManager.mainController, this.$controllersManager.meetingController);
            meetingVm.init(meeting);
            let addMeetingVm = new ap.viewmodels.meetings.AddMeetingViewModel(this.$utility, this.$controllersManager, meetingVm, this.$mdDialog);

            let createController = ($scope: angular.IScope, $timeout: angular.ITimeoutService) => {
                $scope["addMeetingVm"] = addMeetingVm;
            };
            createController.$inject = ["$scope", "$timeout"];
            this.$mdDialog.show({
                clickOutsideToClose: false,
                preserveScope: true,
                escapeToClose: false,
                templateUrl: "me/PartialView?module=Meeting&name=CreateMeetingDialog",
                fullscreen: true,
                controller: createController
            }).then((createdMeetingId: string) => {
                defer.resolve(createdMeetingId);
            }).catch(() => {
                defer.reject();
            });
            return defer.promise;
        }

        /**
        * This method use for open dialog with table Meetings and ability to select Meeting
        * @param isCopy for use Copy or Move
        **/
        public openMeetingSelectorDialog(isCopy: boolean = false, selectedMeetingId?: string): ng.IPromise<ap.viewmodels.meetings.MeetingItemViewModel> {
            let defer: ng.IDeferred<ap.viewmodels.meetings.MeetingItemViewModel> = this.$q.defer();
            this.$controllersManager.mainController.showBusy();
            let noteCopyMoveVM = new ap.viewmodels.notes.NoteCopyMoveViewModel(this.$utility, this.$api, this.$q, this.$controllersManager,
                this.$timeout, this.$controllersManager.accessRightController, this.$mdDialog);
            noteCopyMoveVM.checkAcceptTranslationKey(isCopy);
            noteCopyMoveVM.meetingSelectorVM.load(selectedMeetingId).then((data) => {
                if (selectedMeetingId) {
                    this._selectedMeetingItem = noteCopyMoveVM.meetingSelectorVM.listVm.selectedViewModel;
                }
                let meetingSelectorController = ($scope: angular.IScope, $timeout: angular.ITimeoutService, $mdDialog: angular.material.IDialogService) => {
                    $scope["vm"] = noteCopyMoveVM;
                    $scope.$on("$destroy", () => {
                        noteCopyMoveVM.dispose();
                    });
                };
                meetingSelectorController.$inject = ["$scope", "$timeout", "$mdDialog"];
                this.$mdDialog.show({
                    clickOutsideToClose: false,
                    preserveScope: true,
                    templateUrl: "me/PartialView?module=Meeting&name=MeetingSelectionDialog",
                    fullscreen: true,
                    multiple: true,
                    controller: meetingSelectorController,
                    onComplete: () => {
                        this.$controllersManager.mainController.hideBusy();
                    }
                }).then((status: CopyMoveStatus) => {
                    switch (status) {
                        case CopyMoveStatus.SelectMeeting:
                            noteCopyMoveVM.meetingSelectorVM.selectedItem = noteCopyMoveVM.meetingSelectorVM.listVm.selectedViewModel;
                            defer.resolve(<ap.viewmodels.meetings.MeetingItemViewModel>noteCopyMoveVM.meetingSelectorVM.selectedItem);
                            break;
                        case CopyMoveStatus.CreateMeeting:
                            this.openCreateNewMeetingDialog().then((createdMeetingId: string) => {
                                this.openMeetingSelectorDialog(isCopy, createdMeetingId).then(() => {
                                    defer.resolve(<ap.viewmodels.meetings.MeetingItemViewModel>this._selectedMeetingItem);
                                });
                            });
                            break;
                    }
                }, () => {
                    defer.reject();
                });
            });
            return defer.promise;
        }

        constructor(protected $scope: ng.IScope, protected $utility: ap.utility.UtilityHelper, protected $api: ap.services.apiHelper.Api, protected $controllersManager: ap.controllers.ControllersManager, protected $q: angular.IQService,
            protected $servicesManager: ap.services.ServicesManager, protected $timeout: angular.ITimeoutService,
            protected $mdDialog: angular.material.IDialogService, protected _isForModule: boolean = true, protected _documentId?: string, protected _formId?: string) {

            this._listener = this.$utility.EventTool.implementsListener(["beginloaddata", "isCheckedChanged"]);
            $scope.$on("$destroy", () => {
                this.dispose();
            });
        }

        public listVm: ap.viewmodels.notes.UserCommentPagedListViewModel = null;
        protected _currentMainFlow: ap.controllers.MainFlow;
        protected _hasActiveFilter: boolean = false;
        protected _hasArchivedFilter: boolean = false;
        protected _groupView = "None";
        protected _groupActions: ap.viewmodels.home.ActionViewModel;
        protected _listener: ap.utility.IListenerBuilder;
        protected _multiActions: ap.viewmodels.home.MultiActionsViewModel;
        protected _isMultiActions: boolean = false;
        protected _archivedItemsCount: number = null; // Null means that the count is not yet done
        protected _unarchivedItemsCount: number = null;
        protected _topIndex: number = 0;
        protected _archivedItems: string[] = [];
        protected _unarchivedItems: string[] = [];
        protected _mainActions: Array<ap.viewmodels.home.ActionViewModel> = null;
        protected _pathToLoad: string = "";
        protected _isFilterItemsEmpty: boolean = null; // Only when filter != all and active
        protected _canFilter: boolean = false;
        protected _canGroup: boolean = false;
        protected _screenInfo: ap.misc.ScreenInfo;
        protected _hasMeetingCol: boolean = false;

        private _selectedMeetingItem: IEntityViewModel = null;
    }
}