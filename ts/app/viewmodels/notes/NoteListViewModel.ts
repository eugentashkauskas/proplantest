module ap.viewmodels.notes {

    import NoteType = ap.models.notes.NoteType;

    export class NoteListViewModel extends NoteBaseListViewModel implements INotesViewModel, IDispose {

        /**
        * Method used to know if the item in param is the last of the list
        * @param item the note we want to know if it is the last of the list
        **/
        public isLast(item: ap.viewmodels.notes.NoteItemViewModel): boolean {
            let lastItem = this.listVm.sourceItems[this.listVm.sourceItems.length - 1];
            return item && lastItem && lastItem.originalEntity && lastItem.originalEntity.Id === item.originalEntity.Id;
        }

        /**
        * This property is to know if the col is available in the grid or not
        **/
        public get hasMeetingCol(): boolean {
            return this._hasMeetingCol;
        }

        /**
        * This property is to know if the column order can be changed
        **/
        public get canChangeColOrder(): boolean {
            return this._canChangeColOrder;
        }

        /**
        * This is the sceenInfo of the view
        **/
        public get screenInfo() {
            return this._screenInfo;
        }

        /**
         * An accessor for a sorting state of the notes list
         */
        public get sortState(): ap.misc.sort.NoteListSortingInfo {
            return this._sortState;
        }

        /**
        * Public getter to know if the active predefined filter is set
        */
        public get hasActiveNotes(): boolean {
            return this._hasActiveNotes;
        }

        /**
        * This method will re-calculate all sort flags
        **/
        private _calculateSortOptions() {
            let canSortMulti = this._utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_PanoramicView);
            this._sortState.Mode = canSortMulti ? ap.misc.sort.SortingMode.MultiColumn : ap.misc.sort.SortingMode.SingleColumn;
        }

        /**
        * This method handles changes of sort state, updates the "sortdatas" custom params and refreshes the list
        **/
        public sortChangedHandler() {
            this._sortState.saveToStorage();

            let sortColumn = this._groupView;
            if (sortColumn === "SubCategory") {
                sortColumn = "Punchlist";
            }

            if (this._sortState[sortColumn] && this._sortState[sortColumn] !== ap.component.dataTable.SortType.None) {
                this.applyGroupChanges("None");
            }

            this.listVm.removeCustomParam("sortdatas");
            this.listVm.addCustomParam("sortdatas", this._sortState.toCustomParam());

            this.refresh();
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
        * To know the user has print access or not
        **/
        public get pointReportAccessRight(): ap.models.accessRights.PointReportAccessRight {
            return this._reportHelper.noteReportAccessRight;
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

        /**
        * Return actions displayed in a status bar
        **/
        public get statusActions(): Array<ap.viewmodels.home.ActionViewModel> {
            return this._statusActions;
        }

        /*
        * Handler method to add the new note to the top of the list and refresh the indexes
        * @param noteEvt the note updated event
        */
        private noteAddedHandler(noteEvt: ap.controllers.NoteBaseUpdatedEvent) {
            this._unarchivedItemsCount++;
            this._isFilterItemsEmpty = false;
        }

        /*
         * Return if it is in multi-actions mode, can be used to hide download action of each Point/Note
         */
        public get isMultiActions(): boolean {
            return this._isMultiActions;
        }

        /**
        * This method is used to handler the multi action make by the user
        * @param actionName is the name of the action requested
        **/
        protected multiActionClick(actionName: string, ids: string[]) {
            switch (actionName) {
                case "printnotelist":
                    this.printReport();
                    break;
                case "archive":
                    this._controllersManager.noteController.multiArchiveNote(ids).then((result: ap.models.multiactions.NoteMultiActionsResult) => {
                        if (result.SkippedActionDescriptionList.length > 0) {
                            this.openMultiActionResultDialog(result);
                            this.listVm.archivedNoteIds.concat(ids);
                        }
                    });
                    break;
                case "unarchive":
                    this._controllersManager.noteController.multiUnarchiveNote(ids).then((result: ap.models.multiactions.NoteMultiActionsResult) => {
                        if (result.SkippedActionDescriptionList.length > 0) {
                            this.openMultiActionResultDialog(result);
                        }
                    });
                    break;
                case "multiaction.copyto":
                    this.copyTo();
                    break;
                case "multiaction.moveto":
                    this.onMoveToMultiActionRequest();
                    break;
                case "multiaction.edit":
                    this.openMultiEditDialog();
                    break;
            }
        }

        /**
        * This method is used to open the multi edit dialog
        **/
        public openMultiEditDialog() {
            let meetingAccessRight = this._controllersManager.mainController.currentMeeting ? this._controllersManager.mainController.currentMeeting.UserAccessRight : null;
            if (meetingAccessRight === null) {
                meetingAccessRight = new ap.models.accessRights.MeetingAccessRight(this._utility);
                meetingAccessRight.CanEditAllPoint = true;
                meetingAccessRight.CanEditPoint = true;
                meetingAccessRight.CanEditPointInCharge = true;
                meetingAccessRight.CanEditPointIssueType = true;
                meetingAccessRight.CanEditPointStatus = true;
                meetingAccessRight.CanAddPointDocument = true;
                meetingAccessRight.CanAddComment = true;
            }

            this._controllersManager.mainController.showBusy();

            let ids: string[] = this.idsItemsChecked();

            let multiEditController = ($scope: angular.IScope, $timeout: angular.ITimeoutService) => {
                if (!this._multiEditNoteRequestViewModel) {
                    this._multiEditNoteRequestViewModel = new ap.viewmodels.notes.MultiEditNoteRequestViewModel(this._utility, this.$mdDialog, this._api, $scope, this.$timeout, this.$q, this._controllersManager, this._servicesManager, meetingAccessRight, ids);
                }

                let roomsConfigVm = this._multiEditNoteRequestViewModel.roomsConfigure;
                if (roomsConfigVm && roomsConfigVm.lastSubCellAddedId !== null) {
                    this._multiEditNoteRequestViewModel.loadRoomSelector(roomsConfigVm.lastSubCellAddedId).then(() => {
                        roomsConfigVm.lastSubCellAddedId = null;
                    });
                }

                $scope["vm"] = this._multiEditNoteRequestViewModel;
            };
            multiEditController.$inject = ["$scope", "$timeout"];
            this.$mdDialog.show({
                clickOutsideToClose: false,
                preserveScope: true,
                onComplete: () => {
                    this._controllersManager.mainController.hideBusy();
                },
                templateUrl: "me/PartialView?module=Note&name=MultiEditPoint",
                fullscreen: true,
                controller: multiEditController
            }).then((result: ap.models.multiactions.NoteMultiActionsResult | ap.viewmodels.notes.AddEditResponse) => {
                if (result instanceof ap.models.multiactions.NoteMultiActionsResult) {
                    this._multiEditNoteRequestViewModel = null;
                    if (result.SkippedActionDescriptionList.length > 0) {
                        this.openMultiActionResultDialog(result);
                    }
                    this.listVm.refresh();
                } else if (result === ap.viewmodels.notes.AddEditResponse.CreateRoom) {
                    this.openConfigureRoomDialog();
                } else if (result === ap.viewmodels.notes.AddEditResponse.CreateCategory) {
                    this.openCategoriesConfigDialog();
                }
            }, () => {
                this._multiEditNoteRequestViewModel = null;
            });
        }

        /**
         * This method is used to open the categories management dialog
         */
        protected openCategoriesConfigDialog() {
            let dialogVm = new ap.viewmodels.projects.ProjectIssueTypeConfigDialogViewModel(this.$scope, this._utility, this.$q, this._api, this._controllersManager, this._servicesManager, this.$mdDialog, this.$timeout);
            this._controllersManager.mainController.showBusy();

            let configureController = ($scope: angular.IScope) => {
                $scope["vm"] = dialogVm;
            };
            configureController.$inject = ["$scope"];
            this.$mdDialog.show({
                clickOutsideToClose: false,
                preserveScope: true,
                escapeToClose: false,
                onComplete: () => {
                    this._controllersManager.mainController.hideBusy();
                },
                templateUrl: "me/PartialView?module=Project&name=ProjectCategoriesDialog",
                fullscreen: true,
                controller: configureController
            }).then(() => {
                dialogVm.dispose();
                this._showCategoriesConfig(dialogVm.selectedIssueType);
                this.openMultiEditDialog();
            },
                () => {
                    dialogVm.dispose();
                    this._showCategoriesConfig(dialogVm.selectedIssueType);
                    this.openMultiEditDialog();
                });
        }

        /**
         * This method is used to open the rooms management dialog
         */
        public openConfigureRoomDialog() {
            this._controllersManager.mainController.showBusy();
            this._multiEditNoteRequestViewModel.roomsConfigure.load();

            let configureController = ($scope: angular.IScope) => {
                $scope["roomsConfigure"] = this._multiEditNoteRequestViewModel.roomsConfigure;
            };
            configureController.$inject = ["$scope"];
            this.$mdDialog.show({
                clickOutsideToClose: false,
                preserveScope: true,
                escapeToClose: false,
                onComplete: () => {
                    this._controllersManager.mainController.hideBusy();
                },
                templateUrl: "me/PartialView?module=Project&name=AddNewRoomDialog",
                fullscreen: true,
                controller: configureController
            }).then(() => {
                this.openMultiEditDialog();
            }, () => {
                this.openMultiEditDialog();
            });
        }

        /**
        * This method use for open dialog with the result of the action
        * @param result the NoteMultiActionsResult bind on the view MultiActionsResultDialog
        **/
        public openMultiActionResultDialog(result: ap.models.multiactions.NoteMultiActionsResult, messageKey?: string) {
            let NotAppliedDescriptionResultVM: ap.viewmodels.multiactions.NotAppliedDescriptionResultViewModel = new ap.viewmodels.multiactions.NotAppliedDescriptionResultViewModel(this._utility, result.SkippedActionDescriptionList, messageKey);

            let errorController = ($scope: angular.IScope, $timeout: angular.ITimeoutService, $mdDialog: angular.material.IDialogService) => {
                $scope["NotAppliedDescriptionResultVM"] = NotAppliedDescriptionResultVM;
                $scope["cancel"] = function () {
                    $mdDialog.cancel();
                };
            };
            errorController.$inject = ["$scope", "$timeout", "$mdDialog"];
            this.$mdDialog.show({
                clickOutsideToClose: false,
                preserveScope: true,
                templateUrl: "me/PartialView?module=MultiActions&name=MultiActionsResultDialog",
                fullscreen: true,
                controller: errorController
            });
        }

        /**
         * This method called open meeting selector dialog then clicked on copy to multiaction
         */
        private copyTo() {
            this.openMeetingSelectorDialog(true).then((meetingItemViewModel: ap.viewmodels.meetings.MeetingItemViewModel) => {
                let usercommentids: string[] = this.idsItemsChecked();
                this._controllersManager.noteController.copyTo(usercommentids, meetingItemViewModel.meeting.Id).then((noteMultiActionResult) => {
                    this.closeMultiActions();
                    if (noteMultiActionResult.NotesUpdated.length > 0) {
                        this._controllersManager.mainController.showToast(noteMultiActionResult.NotesUpdated.length === 1 ? "app.note.copied" : "app.notes.copied", null, "View", [meetingItemViewModel.title]).then(() => {
                            this._controllersManager.mainController.setCurrentMeeting(meetingItemViewModel.meeting.Id);
                        });
                    }
                    if (noteMultiActionResult.SkippedActionDescriptionList.length > 0) {
                        this.openMultiActionResultDialog(noteMultiActionResult);
                    }
                });
            });
        }

        /**
         * This method will closes the multiactions mode if activated.
         **/
        public closeMultiActions() {
            if (this._isMultiActions)
                this._controllersManager.mainController.closeMultiActionsMode();

            if (this._controllersManager.uiStateController.mainFlowState === ap.controllers.MainFlow.Documents) {
                this.multiActionsCloseRequested();
            }
        }

        /**
         * This public method is used to restore listidsChecked
         */
        public restoreCheckedListIds() {
            if (this.screenInfo.checkedEntitiesId) {
                this.listVm.listidsChecked = this.screenInfo.checkedEntitiesId;
            }
        }

        /*
        * Finish multiaction and remove events, also uncheck all items
        */
        protected multiActionsCloseRequested() {
            if (this._isMultiActions) {
                this._isMultiActions = false;
                this.listVm.closeMultiActionMode();

                this.listVm.off("ischeckedchanged", this.itemCheckedChanged, this); // do not check the multiactions mode each time we're going to check an item

                this.listVm.selectedAll = false;

                this.listVm.on("ischeckedchanged", this.itemCheckedChanged, this);
            }
        }

        /**
        * This method will initialize the multi actions mode or close it depending on the number of checked items in the list
        * > 0 -> enter the multi actions mode
        * = 0 -> close this multi actions mode
        */
        public manageMultiActionsMode() {
            this.multiActionsViewModel.itemsChecked = this.listVm.listidsChecked;
            if (this.multiActionsViewModel.itemsChecked.length > 0) {
                this._isMultiActions = true;
                this.computeEditMultiActionRight();
                this.computeMultiActionsAccessibility();

                // only go to multi action if this Class is used in the points module
                if (this._controllersManager.uiStateController.mainFlowState === ap.controllers.MainFlow.Points && !this._controllersManager.mainController.isMultiActionMode)
                    this._controllersManager.mainController.gotoMultiActionsMode(this._multiActions);
            } else {
                this.closeMultiActions();
            }
        }

        /**
        * This method is used to compute the user can access on which actions
        **/
        private computeActionsAccess() {
            let printAction: ap.viewmodels.home.ActionViewModel = ap.viewmodels.home.ActionViewModel.getAction(this._mainActions, "printnotelist");
            let hasMeeting = this._controllersManager.mainController.currentMeeting !== undefined;
            if (printAction) {
                printAction.isVisible = hasMeeting && !!this._reportHelper.noteReportAccessRight && this._reportHelper.noteReportAccessRight.canGenerate;
            }
            let manageColumnsAction: ap.viewmodels.home.ActionViewModel = ap.viewmodels.home.ActionViewModel.getAction(this.statusActions, "managenotescolumns");
            if (manageColumnsAction) {
                manageColumnsAction.isVisible = this._utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_PanoramicView);
            }
        }

        /**
         * This method is to compute the visibility and accessibility of the multi actions.
         */
        protected computeMultiActionsAccessibility() {
            this.computeArchiveMultiActionRight();
            this.computeUnarchiveMultiActionRight();
            this.computeMoveToMultiActionRight();
            this.computeCopyToMultiActionRight();
            this.computeEditMultiActionRight();
        }
        /**
        * Method use to know if the button is visible and enable or not
        **/
        private computeArchiveMultiActionRight() {
            if ((this.screenInfo.mainSearchInfo.hasPredefinedFilterCriterion("Active") === true) ||
                ((this.screenInfo.mainSearchInfo.hasPredefinedFilterCriterion("Archived") === false) && (this.screenInfo.mainSearchInfo.hasPredefinedFilterCriterion("Active") === false) && this.unarchivedItemsCount > 0)) {
                this._archiveMultiAction.isVisible = true;
                this._archiveMultiAction.isEnabled = true;
            } else {
                this._archiveMultiAction.isVisible = false;
                this._archiveMultiAction.isEnabled = false;
            }
        }

        /**
        * Method use to know if the button is visible and enable or not
        **/
        private computeUnarchiveMultiActionRight() {
            if ((this.screenInfo.mainSearchInfo.hasPredefinedFilterCriterion("Archived") === true) ||
                ((this.screenInfo.mainSearchInfo.hasPredefinedFilterCriterion("Active") === false) && (this.screenInfo.mainSearchInfo.hasPredefinedFilterCriterion("Archived") === false) && this.archivedItemsCount > 0)) {
                this._unarchiveMultiAction.isVisible = true;
                this._unarchiveMultiAction.isEnabled = true;
            } else {
                this._unarchiveMultiAction.isVisible = false;
                this._unarchiveMultiAction.isEnabled = false;
            }
        }

        /**
         * Method use to know if the copy to button is visible and enable or not
         */
        private computeCopyToMultiActionRight() {
            let multyCopyTo = ap.viewmodels.home.ActionViewModel.getAction(this._multiActions.actions, "multiaction.copyto");
            if (this._utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_MeetingManagement)) {
                multyCopyTo.isVisible = true;
                multyCopyTo.isEnabled = true;
            }
            else {
                multyCopyTo.isVisible = false;
                multyCopyTo.isEnabled = false;
            }
        }

        /**
         * This method is intended to update visibility and enabled status of the "Move To" multiaction button
         */
        private computeMoveToMultiActionRight() {
            let licenseAccess = this._controllersManager.mainController.licenseAccess();
            if (licenseAccess.hasAccess(ap.models.licensing.Module.Module_MeetingManagement)) {
                this._moveToMultiAction.isVisible = true;
                this._moveToMultiAction.isEnabled = true;
            } else {
                this._moveToMultiAction.isVisible = false;
                this._moveToMultiAction.isEnabled = false;
            }
        }

        /**
         * This method is intended to update visibility and enabled status of the "Move To" multiaction button
         */
        private computeEditMultiActionRight() {
            let countChecked = this.listVm.listidsChecked.length;
            if (countChecked > 0) {
                this._editMultiAction.isVisible = true;
                this._editMultiAction.isEnabled = true;
            } else {
                this._editMultiAction.isVisible = false;
                this._editMultiAction.isEnabled = false;
            }
        }

        /**
         * This method is intended to move selected items to another list
         */
        private onMoveToMultiActionRequest() {
            this.openMeetingSelectorDialog().then((selectedMeetingVm: ap.viewmodels.meetings.MeetingItemViewModel) => {
                let selectedIds = this.idsItemsChecked();
                let meetingId = selectedMeetingVm.meeting.Id;
                this._controllersManager.noteController.moveToMultiAction(selectedIds, meetingId).then((result: ap.models.multiactions.NoteMultiActionsResult) => {
                    this.closeMultiActions();
                    this.refresh(undefined, true); /* force the refresh to be sure the list is refreshed even if all the notes are moved */
                    if (result.SkippedActionDescriptionList.length === 0) {
                        this._controllersManager.mainController.showToast("app.multi_move.success", null, "View", [selectedMeetingVm.meeting.Title]).then(() => {
                            this._controllersManager.mainController.setCurrentMeeting(selectedMeetingVm.meeting.Id);
                        });
                    } else {
                        this.openMultiActionResultDialog(result, "app.multi_move.error");
                    }
                });
            });
        }

        /**
        * Property accessor to know if the list can be grouped or not
        */
        get canGroup(): boolean {
            return this._canGroup;
        }

        /**
        * Property accessor to know if the list can be filtered or not
        */
        get canFilter(): boolean {
            return this._canFilter;
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

        get isFilterItemsEmpty(): boolean {
            return this._isFilterItemsEmpty;
        }

        get reportGeneratorViewModel(): ap.viewmodels.reports.ReportGeneratorViewModel {
            return this._reportGeneratorViewModel;
        }

        dispose(): void {
            if (this.listVm) {
                this.listVm.dispose();
                this.listVm = null;
            }
            if (this._reportHelper) {
                this._reportHelper.dispose();
                this._reportHelper = null;
            }
            if (this.screenInfo) {
                this.screenInfo.dispose();
                this._screenInfo = null;
            }

            if (this._sortState) {
                this._sortState.dispose();
                this._sortState = null;
            }

            if (this._listener) {
                this._listener.clear();
                this._listener = null;
            }

            this._controllersManager.noteController.off("noteadded", this.noteAddedHandler, this);
            this._controllersManager.mainController.off("multiactioncloserequested", this.multiActionsCloseRequested, this);
            this._controllersManager.noteController.off("notedeleted", this.noteDeletedHandler, this);
            this._controllersManager.mainController.off("currentmeetingchanged", this.meetingChangedHandler, this);
        }

        on(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.on(eventName, callback, caller);
        }
        off(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.off(eventName, callback, caller);
        }

        /**
        * This method refreshes the list of points and can select a point after the refresh if it's has been supplied in parameter and still abvailable after the refresh
        * @param idInfo object containing the info to select a note in the list
        * @param cumulIOInfo object containing info to initialize the list based on a dashboard
        * @param force boolean Force the refresh event if the list is empty
        */
        refresh(idToSelect?: string, force?: boolean, cumulIOInfo?: dashboard.CumulIOInfo);
        refresh(idToSelect?: string, force?: boolean, idInfo?: NoteIdInfo);
        refresh(idToSelect?: string, force?: boolean, info?: NoteIdInfo | dashboard.CumulIOInfo) {
            this._listener.raise("beginloaddata");
            this._isFilterItemsEmpty = null;
            this._archivedItemsCount = null;
            this._unarchivedItemsCount = null;

            let filter: string;
            if (this._controllersManager.mainController.currentMeeting)
                filter = "Filter.Eq(Meeting.Id, " + this._controllersManager.mainController.currentMeeting.Id + ")";
            else
                filter = "Filter.Eq(Project.Id, " + this._controllersManager.mainController.currentProject().Id + ")";

            let isAll = this._screenInfo.mainSearchInfo.getPredefinedFilterCriterions() === null;

            this.listVm.clearLoaderCache();
            this.listVm.loadIds().then(() => {
                if (!this.listVm) {
                    // means the list has been disposed before the call was resolved
                    return;
                }

                this.computeActionsAccess();
                this._isFilterItemsEmpty = this.listVm.count <= 0 && (this._screenInfo.mainSearchInfo.hasPredefinedFilterCriterion("Active"));
                let loadPageIndex = 0;
                if (this.listVm.ids.length && idToSelect && !StringHelper.isNullOrEmpty(idToSelect)) {
                    if (idToSelect.length === 36) {
                        idToSelect = idToSelect + (<string>this.listVm.ids[0]).substring(36);
                    }
                    loadPageIndex = this.listVm.getPageIndex(idToSelect);
                    if (loadPageIndex < 0 && !StringHelper.isNullOrEmpty(this._utility.Storage.Session.get("lastcommentselected"))) {
                        loadPageIndex = this.listVm.getPageIndex(this._utility.Storage.Session.get("lastcommentselected"));
                    }
                    if (loadPageIndex < 0) loadPageIndex = 0;
                }
                if (this.listVm.ids.length > 0) {
                    /** this._archivedItemsCount and this._unarchivedItemsCount will not be setted here because both properties are used to show the correct message
                     * when there is no point displayed in the list. In this case there will be points in the list
                     */
                    this.listVm.loadPage(loadPageIndex).then(() => {
                        if (idToSelect && !StringHelper.isNullOrEmpty(idToSelect)) {
                            // select the item and scroll to this item
                            let commentId = idToSelect.substring(0, 36);

                            if (info && info instanceof NoteIdInfo) {
                                commentId = (<NoteIdInfo>info).noteId;
                            }

                            let foundSelectedVms = this.listVm.sourceItems.filter((item: NoteItemViewModel) => { return item.originalEntity.Id === commentId; });
                            if (foundSelectedVms.length > 0) {
                                this.listVm.selectEntity(foundSelectedVms[0].originalEntity.Id);
                                this.scrollToItem((<NoteItemViewModel>foundSelectedVms[0]).id + (<string>this.listVm.ids[0]).substring(36));
                            }
                        }
                        this.updateNbItemChecked();
                        this.manageMultiActionsMode();
                    });
                } else {
                    let options: ap.services.apiHelper.ApiOption = new ap.services.apiHelper.ApiOption();
                    options.async = true;
                    options.isShowBusy = false;
                    this._api.getApiResponseStatList("notestats", "IsArchived", filter, options).then((result) => {
                        let noteStats: ap.models.stats.StatResult[] = result.data[0];  // get the notes stats
                        // no stats means no notes for the given project
                        if (!noteStats || noteStats.length === 0) {
                            this._unarchivedItemsCount = 0;
                            this._archivedItemsCount = 0;
                            // If force === true OR force === undefined need to refresh (case when the user deletes the last point in the list)
                            if (force === false) {
                                return;
                            }
                        } else {
                            if (!noteStats[0].GroupByValue) {
                                // not archived notes
                                this._unarchivedItemsCount = noteStats[0].Count;

                                if (noteStats.length > 1) {
                                    this._archivedItemsCount = noteStats[1].Count;
                                } else {
                                    this._archivedItemsCount = 0;
                                }
                            } else {
                                // archived notes
                                this._archivedItemsCount = noteStats[0].Count;

                                if (noteStats.length > 1) {
                                    this._unarchivedItemsCount = noteStats[1].Count;
                                } else {
                                    this._unarchivedItemsCount = 0;
                                }
                            }
                        }
                        this._canFilter = (isAll || (!this._screenInfo.mainSearchInfo.hasPredefinedFilterCriterion("Archived") && this.unarchivedItemsCount > 0) || (this._screenInfo.mainSearchInfo.hasPredefinedFilterCriterion("Archived") && this.archivedItemsCount > 0));
                        this._canGroup = this._canFilter;
                        if (!this.canFilter) {
                            this.listVm.initEmptyList();
                            this.updateNbItemChecked();
                            this.manageMultiActionsMode();
                            this._isFilterItemsEmpty = this._screenInfo.mainSearchInfo.hasPredefinedFilterCriterion("Archived");
                        }
                    });
                }
            });
        }

        /**
        * This method clears the current filter
        */
        protected clearFilter(): void {
            super.clearFilter();
            this.listVm.removeCustomParam("isdone");
        }

        /**
        * Property accessor to get the current groupView of the list
        * @return string The current group used in the list
        */
        public get groupView(): string {
            return this._groupView;
        }

        /**
        * Setter to define a new group for the list
        * This will also refresh the list
        */
        public set groupView(group: string) {
            if (this._groupView !== group) {
                this.applyGroupChanges(group);
                this.removeDuplicatedSorts();
                this._calculateSortOptions();
                this.refresh();
            }
        }

        /**
         * Applies changes of grouping mode to the list
         * @param newGroup a name of the new grouping mode
         */
        private applyGroupChanges(newGroup: string) {
            this._groupView = newGroup;
            this.listVm.groupDescription = this._groupView;

            this.listVm.removeCustomParam("groupby");
            this.listVm.addCustomParam("groupby", this.convertNoteGroupToServerGroupBy(this._groupView));

            this.listVm.removeCustomParam("IsNoneGroupLast");
            this.listVm.addCustomParam("IsNoneGroupLast", "true");

            this._utility.Storage.Session.set("note.groupView", this._groupView);
            this.updateGroupActionsStatus();
        }

        /** 
        * Public setter to change the planId used to load the list of notes
        */
        public set planId(newValue: string) {
            if (this._documentId !== newValue) {
                this._documentId = newValue;
                this.listVm.removeCustomParam("planid");
                this.listVm.addCustomParam("planid", this._documentId);

                this.loadData();
            }
        }

        /**
        * This method will set selected entity
        **/
        public selectEntity(entity: NoteItemViewModel): boolean {
            if (!entity) return false;

            if (entity.originalEntity.Id !== ap.utility.UtilityHelper.createEmptyGuid()) {
                this.listVm.selectEntity(entity.originalEntity.Id);
                return true;
            }

            return false;
        }

        /**
       * This method is used to print the point report
       **/
        public printReport() {
            if (this._reportDialogOpening === true) return;
            this._reportDialogOpening = true;
            this._reportHelper.printNoteReport(this.listVm).then((result: ap.viewmodels.reports.ReportGeneratorResponse) => {
                this._controllersManager.mainController.closeMultiActionsMode();
                this._reportDialogOpening = false;
            }, () => {
                this._reportDialogOpening = false;
            });
        }

        /**
         * This method will be called to create the list view model
         */
        protected createUserCommentListVm(apiGroups: string[], defaultGroupData: string): ap.viewmodels.notes.UserCommentPagedListViewModel {

            this._pathToLoad = "IsReadOnly,HasAttachment,Status.IsDone,Status.IsTodo,Status.IsBlocked,Status.IsBlockedAction,Status.IsOnlyUsedByMeetingManager,Subject,DueDate,IsUrgent,CodeNum,Code,ProjectNumSeq,MeetingNumSeq,EntityVersion,IsArchived,From.Person.Name,Cell.Code,Cell.Description,NoteInCharge.Tag,Date,";
            this._pathToLoad += "IssueType.Code,IssueType.Description,IssueType.ParentChapter.Code,IssueType.ParentChapter.Description,NoteInCharge.UserId,Status.Color,Status.Name,Status.IsDisabled,Comments.LastModificationDate,Comments.IsRead,Meeting.Title,Meeting.Code,Meeting.NumberingType,Meeting.IsSystem";
            return new UserCommentPagedListViewModel(this.$scope, this.$utility, this.$api, this.$q, this.$controllersManager, this.$servicesManager.reportService, NoteItemViewModel, this._pathToLoad, null, null, apiGroups, defaultGroupData);
        }

        protected getApiGroups(): string[] {
            return ["None", "Date", "SubCategory", "DueDate", "InCharge", "Status", "Room"];
        }

        /**
         * This method is to know if it is possible to group the view on a specific property. Need to overload
         */
        protected createGroups(): home.SubActionViewModel[] {
            return [
                new ap.viewmodels.home.SubActionViewModel(this._utility, this._utility.EventTool, "groupnotelist.none", null, true, true, false, "No group", false, true, false),
                new ap.viewmodels.home.SubActionViewModel(this._utility, this._utility.EventTool, "groupnotelist.status", null, true, true, false, "Status", false, true, true),
                new ap.viewmodels.home.SubActionViewModel(this._utility, this._utility.EventTool, "groupnotelist.duedate", null, true, true, false, "Due date", false, true, true),
                new ap.viewmodels.home.SubActionViewModel(this._utility, this._utility.EventTool, "groupnotelist.date", null, true, true, false, "Modification date", false, true, true),
                new ap.viewmodels.home.SubActionViewModel(this._utility, this._utility.EventTool, "groupnotelist.subcategory", null, true, true, false, "Subcategory", false, true, true),
                new ap.viewmodels.home.SubActionViewModel(this._utility, this._utility.EventTool, "groupnotelist.room2", null, true, true, false, "Room level 2", false, true, true),
                new ap.viewmodels.home.SubActionViewModel(this._utility, this._utility.EventTool, "groupnotelist.userincharge", null, true, true, false, "User in charge", false, true, true)
            ];
        }

        /**
          * This method must be implemented to know the name of the view
          */
        protected getListViewName(): string {
            return "note.list";
        }

        /**
         * This method must be implemented to create the addActions 
         */
        protected createAddActions(): ap.viewmodels.home.ActionViewModel {
            let addFromCatogries = new ap.viewmodels.home.SubActionViewModel(this._utility, this._utility.EventTool, "note.createfromissutypes", "/Images/html/icons/ic_add_black_48px.svg", false, true, false, "Add points from subcategories", false, true);
            let addActions = new ap.viewmodels.home.ActionViewModel(this._utility, this._utility.EventTool, "note.addpoint", "/Images/html/icons/ic_add_black_48px.svg", false, [addFromCatogries], "Add point", true, false, new ap.misc.Shortcut("c"));
            return addActions;
        }

        /**
       * To create the list of actions in multi edit mode
       */
        protected createMultiActionViewModel(): ap.viewmodels.home.MultiActionsViewModel {
            let printAction: ap.viewmodels.home.ActionViewModel = ap.viewmodels.home.ActionViewModel.getAction(this._mainActions, "printnotelist");
            this._archiveMultiAction = new ap.viewmodels.home.ActionViewModel(this._utility, this._utility.EventTool, "archive", this._utility.rootUrl + "Images/html/icons/ic_archive_black_48px.svg", false, null, "Archive", false);
            this._unarchiveMultiAction = new ap.viewmodels.home.ActionViewModel(this._utility, this._utility.EventTool, "unarchive", this._utility.rootUrl + "Images/html/icons/ic_unarchive_black_48px.svg", false, null, "Unarchive", false);
            this._copyToMultiAction = new ap.viewmodels.home.ActionViewModel(this._utility, this._utility.EventTool, "multiaction.copyto", this._utility.rootUrl + "Images/html/icons/ic_content_copy_black_48px.svg", false, null, "Copy to", false);
            this._moveToMultiAction = new ap.viewmodels.home.ActionViewModel(this._utility, this._utility.EventTool, "multiaction.moveto", this._utility.rootUrl + "Images/html/icons/moveto.svg", false, null, "Move to", false);
            this._editMultiAction = new ap.viewmodels.home.ActionViewModel(this._utility, this._utility.EventTool, "multiaction.edit", this._utility.rootUrl + "Images/html/icons/ic_create_black_48px.svg", false, null, "Edit", false);

            let multiactions: ap.viewmodels.home.ActionViewModel[] = [];
            multiactions.push(printAction, this._editMultiAction, this._archiveMultiAction, this._unarchiveMultiAction, this._copyToMultiAction, this._moveToMultiAction);

            let multiActionsVm = new ap.viewmodels.home.MultiActionsViewModel(this._utility, multiactions, []); // the checked event will raise for one time so reduce one
            return multiActionsVm; // the checked event will raise for one time so reduce one
        }

        /**
         * This method must be implemented to create parameter to know how to search in the main search
         */
        protected createMainSearchInfo(): ap.misc.MainSearchInfo {
            let predefinedFilters: ap.misc.PredefinedFilter[] = [];

            predefinedFilters.push(new ap.misc.PredefinedFilter("Active", "Active points", true, undefined, new Dictionary([new KeyValue("isarchived", "false")]), ["Archived"], null,
                this.getPredefinedFilterData("IsArchived", ap.models.custom.FilterType.IsFalse, "Bool", false)));
            predefinedFilters.push(new ap.misc.PredefinedFilter("Todo", "To do points", true, undefined, new Dictionary([new KeyValue("isdone", "false")]), ["Done"], null,
                this.getPredefinedFilterData("Status.IsTodo", ap.models.custom.FilterType.IsTrue, "Bool", true)));
            predefinedFilters.push(new ap.misc.PredefinedFilter("Done", "Done points", true, undefined, new Dictionary([new KeyValue("isdone", "true")]), ["Todo"], null,
                this.getPredefinedFilterData("Status.IsDone", ap.models.custom.FilterType.IsTrue, "Bool", true)));
            if (this._utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_ListFilter))
                predefinedFilters.push(new ap.misc.PredefinedFilter("Important", "Important points", true, undefined, new Dictionary([new KeyValue("isurgent", "true")]), null, null,
                    this.getPredefinedFilterData("IsUrgent", ap.models.custom.FilterType.IsTrue, "Bool", true)));
            predefinedFilters.push(new ap.misc.PredefinedFilter("Archived", "Archived points", true, undefined, new Dictionary([new KeyValue("isarchived", "true")]), ["Active"], null,
                this.getPredefinedFilterData("IsArchived", ap.models.custom.FilterType.IsTrue, "Bool", true)));
            let mainSearcheInfo = new ap.misc.MainSearchInfo(this._utility, this.$timeout, [], [new ap.misc.AdvancedFilter(new ap.misc.PropertyInfo("Status.Name", "Status", false, ap.misc.PropertyType.String, "Status", null, "Status"), null, new ap.viewmodels.notes.filters.StatusAdvancedFilterList(this._utility, this._api, this.$q, this._controllersManager), false, false, null, null, true),
            new ap.misc.AdvancedFilter(new ap.misc.PropertyInfo("CodeNum", "Number", false, ap.misc.PropertyType.String, "CodeNum", null, "Number"), null, null, true),
            new ap.misc.AdvancedFilter(new ap.misc.PropertyInfo("IssueType.Description", "Category", false, ap.misc.PropertyType.String, "Category", null, "Punchlist"), null, new ap.viewmodels.notes.filters.IssueTypeAdvancedFilterList(this._utility, this._api, this.$q, this._controllersManager), false, true, null, null, true),
            new ap.misc.AdvancedFilter(new ap.misc.PropertyInfo("Subject", "Subject", false, ap.misc.PropertyType.String), null),
            new ap.misc.AdvancedFilter(new ap.misc.PropertyInfo("From.DisplayName", "Author", false, ap.misc.PropertyType.String, "From", null, "Author"), null, new ap.viewmodels.notes.filters.ContactAdvancedFilterList(this._utility, this._api, this.$q, this._controllersManager, this.$timeout), false, false, null, null, true),
            new ap.misc.AdvancedFilter(new ap.misc.PropertyInfo("Date", "Creation date", false, ap.misc.PropertyType.Date, "CreationDate", null, "CreationDate"), ap.misc.AdvancedFilter.pastDateShortcuts, undefined, undefined, undefined, undefined, ap.models.custom.FilterType.Between),
            new ap.misc.AdvancedFilter(new ap.misc.PropertyInfo("ModicationDate", "Modification date", false, ap.misc.PropertyType.Date, "Date"), ap.misc.AdvancedFilter.pastDateShortcuts, undefined, undefined, undefined, undefined, ap.models.custom.FilterType.Between),
            new ap.misc.AdvancedFilter(new ap.misc.PropertyInfo("Meeting.Title", "List", false, ap.misc.PropertyType.String, "Meeting", null, "Meeting"), null, new ap.viewmodels.notes.filters.ListAdvancedFilterList(this._utility, this._api, this.$q, this._controllersManager), false, false, null, null, true),
            new ap.misc.AdvancedFilter(new ap.misc.PropertyInfo("NoteInCharge.Tag", "In charge", false, ap.misc.PropertyType.String, "To", null, "InCharge"), null, new ap.viewmodels.notes.filters.ContactAdvancedFilterList(this._utility, this._api, this.$q, this._controllersManager, this.$timeout, true), false, true),
            new ap.misc.AdvancedFilter(new ap.misc.PropertyInfo("DueDate", "Due date", false, ap.misc.PropertyType.Date, "DueDate"), ap.misc.AdvancedFilter.futureDateShortcuts.concat([new ap.misc.DateShortcutItem(DateShortcut.Older, "app.dateshortcut.due.Older")]), null, false, true, null, ap.models.custom.FilterType.Le, true),
            new ap.misc.AdvancedFilter(new ap.misc.PropertyInfo("Cell.Description", "Room", false, ap.misc.PropertyType.String, "Room", null, "Room"), null, new ap.viewmodels.notes.filters.RoomAdvancedFilterList(this._utility, this._api, this.$q, this._controllersManager), false, true, null, null, true),
            new ap.misc.AdvancedFilter(new ap.misc.PropertyInfo("Comments.Comment", "Comment", false, ap.misc.PropertyType.String, "Body", undefined, "Body"), null),
            new ap.misc.AdvancedFilter(new ap.misc.PropertyInfo("HasDoc", "Attachments", false, ap.misc.PropertyType.Boolean, "HasDoc", null, "Attachment"), null, null, null, null, new ap.misc.AdvancedFilter(new ap.misc.PropertyInfo("Document", "Document", false, ap.misc.PropertyType.String, "Document"), null))
            ], predefinedFilters, true, this._controllersManager.mainController.currentProject().Id);
            mainSearcheInfo.isVisible = true;
            mainSearcheInfo.isEnabled = true;

            return mainSearcheInfo;
        }

        /**
         * Method use to remove the sort correspondint to the groupBy selected by the user (AP-15246)
         */
        private removeDuplicatedSorts() {
            let columnName = this._groupView;
            if (columnName === "SubCategory") {
                columnName = "Punchlist";
            }

            if (this._sortState[columnName] && this._sortState[columnName] !== ap.component.dataTable.SortType.None) {
                this._sortState.off("sortingchanged", this.sortChangedHandler, this);
                this._sortState[columnName] = ap.component.dataTable.SortType.None;
                this._sortState.on("sortingchanged", this.sortChangedHandler, this);
            }

            this.listVm.removeCustomParam("sortdatas");
            this.listVm.addCustomParam("sortdatas", this._sortState.toCustomParam());
        }

        /**
        * This method is called when there is the 'previewrequested' event fired from the ReportGeneratorViewModel
        * @param vm is the sender ReportGeneratorViewModel
        **/
        private previewReportRequest(vm: ap.viewmodels.reports.ReportGeneratorViewModel) {
            this.listVm.printReport(vm, ap.viewmodels.reports.ReportGeneratorResponse.Preview).then((result: ap.viewmodels.reports.ReportGeneratorResponse) => {
                if (result !== ap.viewmodels.reports.ReportGeneratorResponse.Preview) {
                    vm.hide();
                    this._controllersManager.mainController.closeMultiActionsMode();
                    this.clearReportGeneratorViewModel();
                }
            });
        }

        /**
        * This method is called when there is the 'downloadexcelrequested' event fired from the ReportGeneratorViewModel
        * @param vm is the sender ReportGeneratorViewModel
        **/
        private downloadExcelReportRequest(vm: ap.viewmodels.reports.ReportGeneratorViewModel) {
            this._controllersManager.reportController.exportExcel((<UserCommentPagedListViewModel>this.listVm).createPointReportParam(vm));
        }

        /**
       * This method is called when there is the 'downloadoriginalplansrequested' event fired from the ReportGeneratorViewModel
       * @param vm is the sender ReportGeneratorViewModel
       **/
        private downloadOriginalPlansRequest(vm: ap.viewmodels.reports.ReportGeneratorViewModel) {
            this._controllersManager.reportController.exportMeetingOriginalPlans((<UserCommentPagedListViewModel>this.listVm).createPointReportParam(vm));
        }

        /**
        * This method is used to clear the _reportGeneratorViewModel when the print window is closed
        **/
        private clearReportGeneratorViewModel() {
            if (this._reportGeneratorViewModel && this._reportGeneratorViewModel !== null) {
                this._reportGeneratorViewModel.off("previewrequested", this.previewReportRequest, this);
                this._reportGeneratorViewModel.off("downloadexcelrequested", this.downloadExcelReportRequest, this);
                this._reportGeneratorViewModel.off("downloadoriginalplansrequested", this.downloadOriginalPlansRequest, this);
                this._reportGeneratorViewModel = null;
            }
        }

        /**
        * This method updates the hasActiveNotes property to know which predefined filter is selected
        */
        public updateHasActiveNotes() {
            if (this.screenInfo.mainSearchInfo.filterString !== null) {
                if (this.screenInfo.mainSearchInfo.hasPredefinedFilterCriterion("Archived"))
                    this._hasActiveNotes = false;
                else if (this.screenInfo.mainSearchInfo.hasPredefinedFilterCriterion("Active"))
                    this._hasActiveNotes = true;
                else
                    this._hasActiveNotes = null;
            } else {
                this._hasActiveNotes = null;
            }
        }

        /**
         * This method is handled when a property is changed from the reportHelper
         */
        private reportHelperPropertyChangedHandler(evt: ap.viewmodels.base.PropertyChangedEventArgs) {
            switch (evt.propertyName) {
                case "noteReportAccessRight":
                    this.computeActionsAccess();
                    break;
            }
        }

        /**
         * Load the customViews and add them to the predefined filters
         */
        private initCustomViewFilters() {
            this._controllersManager.customViewController.getCustomViewList(true).then((customViews) => {
                customViews.forEach((customView) => {
                    let predefinedFilter = new ap.misc.PredefinedFilter(customView.Name, undefined, false, undefined, undefined, undefined, customView);
                    this.screenInfo.mainSearchInfo.predefinedFilters.push(predefinedFilter);
                });
            });
        }

        /**
         * Create and return predefined filter data
         * @param filterPropPath Filter data's property path
         * @param filterType Filter's type
         * @param dataType Filter's data type
         * @param values Filter's values
         */
        private getPredefinedFilterData(filterPropPath: string, filterType: ap.models.custom.FilterType, dataType: string, values: any | any[]) {
            let predefinedFilterData = new ap.models.custom.FilterData();
            predefinedFilterData.ProjectGuidId = this._controllersManager.mainController.currentProject().Id;
            predefinedFilterData.PropertyPath = filterPropPath;
            predefinedFilterData.FilterType = filterType;
            predefinedFilterData.DataType = dataType;
            predefinedFilterData.Values = values instanceof Array ? values : [values];
            return predefinedFilterData;
        }

        /**
         * Updates a selection status of Group points actions based on the currently selected group view
         */
        private updateGroupActionsStatus() {
            let groupActions = this._statusActions[0];

            groupActions.getSubAction("groupnotelist.none").isSelected = this._groupView === "None";
            groupActions.getSubAction("groupnotelist.status").isSelected = this._groupView === "Status";
            groupActions.getSubAction("groupnotelist.duedate").isSelected = this._groupView === "DueDate";
            groupActions.getSubAction("groupnotelist.date").isSelected = this._groupView === "Date";
            groupActions.getSubAction("groupnotelist.subcategory").isSelected = this._groupView === "SubCategory";
            groupActions.getSubAction("groupnotelist.room2").isSelected = this._groupView === "Room";
            groupActions.getSubAction("groupnotelist.userincharge").isSelected = this._groupView === "InCharge";
        }

        private meetingChangedHandler() {
            if (this._controllersManager.uiStateController.mainFlowState === ap.controllers.MainFlow.Points) {
                this.loadData(this._screenInfo.selectedEntityId);
            }
        }

        /**
         * This method initialize the view when the project is loaded
         */
        private initView() {
            let manageNotesColumnsAction: ap.viewmodels.home.ActionViewModel = new ap.viewmodels.home.ActionViewModel(this._utility, this._utility.EventTool, "managenotescolumns", this._utility.rootUrl + "Images/html/icons/ic_view_week_black_48px.svg", false, null, "Columns", true, false, null, false, false, true);

            let printAction: ap.viewmodels.home.ActionViewModel = new ap.viewmodels.home.ActionViewModel(this._utility, this._utility.EventTool, "printnotelist", this._utility.rootUrl + "Images/html/icons/ic_print_black_48px.svg", false, null, "Generate report", true);

            this._mainActions = [
                printAction,
                new ap.viewmodels.home.ActionViewModel(this._utility, this._utility.EventTool, "refreshnotelist", this._utility.rootUrl + "Images/html/icons/ic_refresh_black_48px.svg", true, null, "Refresh list", true)
            ];
            this._statusActions = [
                new ap.viewmodels.home.ActionViewModel(this._utility, this._utility.EventTool, "groupnotelist", this._utility.rootUrl + "Images/html/icons/ic_group_work_black_48px.svg", true, this.createGroups(), "Group by", true, false, null, true),
                manageNotesColumnsAction
            ];
            this.updateGroupActionsStatus();
            let addActions = this.createAddActions();
            this._screenInfo = new ap.misc.ScreenInfo(this._utility, "note.list", ap.misc.ScreenInfoType.List, this._mainActions, addActions, this.createMainSearchInfo());

            if (this._isForNoteModule) {
                this.initCustomViewFilters();
            }

            let groupData: string = this.convertNoteGroupToServerGroupBy(this._groupView);
            let notetypes: string = NoteType[NoteType.Message] + "," + NoteType[NoteType.MeetingPointNote] + "," + NoteType[NoteType.Note] + "," + NoteType[NoteType.Task];
            let pattern: any = new Date().getLocalDatePattern();

            this.listVm = this.createUserCommentListVm(this.getApiGroups(), this._groupView);
            this.listVm.addCustomParam("notetypes", notetypes);
            this.listVm.addCustomParam("groupby", groupData);
            this.listVm.addCustomParam("datepattern", pattern);
            this.listVm.addCustomParam("ppactions", "updatenotemeetingaccessright");
            this.listVm.addCustomParam("sortdatas", this._sortState.toCustomParam());
            this.listVm.on("ischeckedchanged", this.itemCheckedChanged, this);
            this.listVm.on("selectedallchanged", this.selectedAllChangedHandler, this);
            this._multiActions = this.createMultiActionViewModel();
            this.computeActionsAccess();

            this._hasMeetingCol = this._utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_MeetingManagement)
                && this._controllersManager.mainController.currentProject() !== null && this._controllersManager.mainController.currentMeeting === null;

            this._canChangeColOrder = this._utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_PanoramicView);
            // Multiaction initialization
            if (this._multiActions) {
                this._multiActions.on("actionClicked", this.multiActionClickHandler, this);
                this.computeMultiActionsAccessibility();
            }
            this._reportHelper.on("propertychanged", this.reportHelperPropertyChangedHandler, this);
            this._controllersManager.noteController.on("notedeleted", this.noteDeletedHandler, this);
            this._controllersManager.noteController.on("noteadded", this.noteAddedHandler, this);
            this._controllersManager.mainController.on("multiactioncloserequested", this.multiActionsCloseRequested, this);
            this._controllersManager.mainController.on("currentmeetingchanged", this.meetingChangedHandler, this);
        }

        /**
         * Handler method called when the project changes
         */
        private currentProjectChangedHandler() {
            this.initView();
        }

        /**
         * Handler method called when note is deleted
         */
        private noteDeletedHandler() {
            if (!this._isForNoteModule) {
                this.refresh();
            }
        }

        /**
        * This method is userd to show selected issue type from categories config dialog window
        * @param selectedIssueType
        */
        private _showCategoriesConfig(selectedIssueType: ap.viewmodels.projects.IssueTypeViewModel) {
            this._multiEditNoteRequestViewModel.selectIssueType(selectedIssueType);
        }

        /**
         * Retrieves a view model for the given note
         * @param note a model to find a matching view model for
         * @returns a viewmodel for the given note or null
         */
        public getNoteViewModel(note: ap.models.notes.Note): ap.viewmodels.notes.NoteItemViewModel {
            let similarViewModels = this.listVm.sourceItems.filter((viewModel: ap.viewmodels.notes.NoteItemViewModel) => {
                return viewModel.originalNote.Id === note.Id;
            });
            return similarViewModels.length > 0 ? <ap.viewmodels.notes.NoteItemViewModel>similarViewModels[0] : null;
        }

        /**
         * Determines a name that is used by storage to store a sorting state of the list
         * @param isForNoteModule an indicator of whether this notes list is shown in the points module
         */
        private static getSortingStorageName(isForNoteModule: boolean): string {
            if (isForNoteModule) {
                return "notes.notemodule";
            } else {
                return "notes";
            }
        }

        /**
         * Method to delete sorting models saved in storage
         * @param utility an instance of the utility helper of the application
         */
        public static resetSortingInfo(utility: ap.utility.UtilityHelper) {
            ap.misc.sort.SortingInfo.removeFromStorage(utility, NoteListViewModel.getSortingStorageName(true));
            ap.misc.sort.SortingInfo.removeFromStorage(utility, NoteListViewModel.getSortingStorageName(false));
        }

        /**
         * Updates sorting in the table based on columns visiblity
         * @param columnsVisibility info about visibility of columns in a table
         */
        public manageSort(columnsVisibility: NoteColumnViewModel) {
            // It is possible that several columns will be affected at the same time
            // We turn off the event listener in order to prevent multiple calls of the refresh method
            this._sortState.off("sortingchanged", this.sortChangedHandler, this);
            let isSortingChanged = false;

            if (this._sortState.Status !== ap.component.dataTable.SortType.None && !columnsVisibility.statusVisibility) {
                this._sortState.Status = ap.component.dataTable.SortType.None;
                isSortingChanged = true;
            }
            if (this._sortState.Number !== ap.component.dataTable.SortType.None && !columnsVisibility.numberVisibility) {
                this._sortState.Number = ap.component.dataTable.SortType.None;
                isSortingChanged = true;
            }
            if (this._sortState.Punchlist !== ap.component.dataTable.SortType.None && !columnsVisibility.punchlistVisibility) {
                this._sortState.Punchlist = ap.component.dataTable.SortType.None;
                isSortingChanged = true;
            }
            if (this._sortState.Subject !== ap.component.dataTable.SortType.None && !columnsVisibility.subjectVisibility) {
                this._sortState.Subject = ap.component.dataTable.SortType.None;
                isSortingChanged = true;
            }
            if (this._sortState.Room !== ap.component.dataTable.SortType.None && !columnsVisibility.roomVisibility) {
                this._sortState.Room = ap.component.dataTable.SortType.None;
                isSortingChanged = true;
            }
            if (this._sortState.DueDate !== ap.component.dataTable.SortType.None && !columnsVisibility.dueDateVisibility) {
                this._sortState.DueDate = ap.component.dataTable.SortType.None;
                isSortingChanged = true;
            }
            if (this._sortState.Author !== ap.component.dataTable.SortType.None && !columnsVisibility.authorVisibility) {
                this._sortState.Author = ap.component.dataTable.SortType.None;
                isSortingChanged = true;
            }
            if (this._sortState.Meeting !== ap.component.dataTable.SortType.None && !columnsVisibility.listVisibility) {
                this._sortState.Meeting = ap.component.dataTable.SortType.None;
                isSortingChanged = true;
            }

            if (isSortingChanged) {
                this.sortChangedHandler();
            }
            this._sortState.on("sortingchanged", this.sortChangedHandler, this);
        }

        /**
        * Constructor of NoteListViewModel
        * @param $scope IScope
        * @param utility UtilityHelper
        * @param api Api The api service
        * @param mainController MainController
        * @param $q IQService
        * @param projectController ProjectController
        * @param noteController NoteController
        * @param reportController ReportController
        * @param _controllersManager.meetingController _controllersManager.meetingController
        * @param idToSelect? string The id of the note to select when the list loads
        * @param planId? The id of a plan used to load only the note attached to this plan
        */
        constructor(protected $scope: ng.IScope, protected _utility: ap.utility.UtilityHelper, protected _api: ap.services.apiHelper.Api, protected _controllersManager: ap.controllers.ControllersManager, protected $q: angular.IQService,
            protected _servicesManager: ap.services.ServicesManager, protected $timeout: angular.ITimeoutService,
            protected $mdDialog: angular.material.IDialogService, protected _isForNoteModule: boolean = true, protected _documentId?: string, protected _formId?: string) {
            super($scope, _utility, _api, _controllersManager, $q, _servicesManager, $timeout, $mdDialog, _isForNoteModule, _documentId, _formId);

            this._eventHelper = this._utility.EventTool;
            this._listener = this._eventHelper.implementsListener(["beginloaddata", "isCheckedChanged"]);

            let sortingStorageName = NoteListViewModel.getSortingStorageName(_isForNoteModule);
            this._sortState = ap.misc.sort.SortingInfo.createFromStorage(ap.misc.sort.NoteListSortingInfo, _utility, sortingStorageName);
            this._sortState.on("sortingchanged", this.sortChangedHandler, this);

            this._groupView = this._utility.Storage.Session.get("note.groupView");
            if (this._groupView === undefined || this._groupView === null) {
                this._groupView = "Date";
            }
            if (this._sortState[this._groupView] && this._sortState[this._groupView] !== ap.component.dataTable.SortType.None) {
                this._groupView = "None";
            }

            this._calculateSortOptions();
            this._reportHelper = new ap.viewmodels.reports.ReportHelper(this.$scope, this.$q, this.$timeout, this.$mdDialog, this._utility, this._api, this._servicesManager, this._controllersManager);
            if (this._controllersManager.mainController.currentProject())
                this.initView();
            else {
                this._controllersManager.mainController.on("currentprojectchanged", this.currentProjectChangedHandler, this);
            }
            $scope.$on("$destroy", () => {
                this.dispose();
            });
        }

        public listVm: ap.viewmodels.notes.UserCommentPagedListViewModel = null;

        private _reportHelper: ap.viewmodels.reports.ReportHelper;
        private _filter = null;
        private _eventHelper: ap.utility.EventHelper;
        private _reportGeneratorViewModel: ap.viewmodels.reports.ReportGeneratorViewModel;
        private _statusActions: Array<ap.viewmodels.home.ActionViewModel> = null;
        // AP-12764: to prevent click too fast to open the dialog many times
        private _reportDialogOpening: boolean = false;
        private _archiveMultiAction: ap.viewmodels.home.ActionViewModel;
        private _unarchiveMultiAction: ap.viewmodels.home.ActionViewModel;
        private _copyToMultiAction: ap.viewmodels.home.ActionViewModel;
        private _moveToMultiAction: ap.viewmodels.home.ActionViewModel;
        private _editMultiAction: ap.viewmodels.home.ActionViewModel;
        private _multiEditNoteRequestViewModel: ap.viewmodels.notes.MultiEditNoteRequestViewModel;
        private _sortState: ap.misc.sort.NoteListSortingInfo;
        private _canChangeColOrder: boolean = false;
        private _hasActiveNotes: boolean = false; // To know if the predefined filter for active notes are selected or not.
    }
}