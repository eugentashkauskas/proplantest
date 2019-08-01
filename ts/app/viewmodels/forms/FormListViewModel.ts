module ap.viewmodels.forms {
    export class FormListViewModel extends ap.viewmodels.notes.NoteBaseListViewModel {

        /**
         * Select form entity from the list
         * Overloaded method because it can receive an Id or a Form to select
         * @param id the id of the entity to select
         * @param form the form to select
         */
        public selectEntity(form: FormItemViewModel);
        public selectEntity(formId: string);
        public selectEntity(formItem: string | FormItemViewModel) {
            if (typeof formItem === "string") {
                if (formItem !== ap.utility.UtilityHelper.createEmptyGuid()) {
                    this.listVm.selectEntity(formItem);
                    this._listener.raise("itemSelected");
                    return true;
                }
                return false;
            } else {
                this.listVm.selectEntity(formItem.id);
                this._listener.raise("itemSelected");
                return true;
            }
        }

        dispose() {
            super.dispose();
            this.$controllersManager.mainController.off("currentmeetingchanged", this.meetingChangedHandler, this);
            this.$controllersManager.mainController.off("multiactioncloserequested", this.multiActionsCloseRequested, this);
        }

        /**
         * To create the list of actions in multi edit mode
         */
        protected createMultiActionViewModel(): ap.viewmodels.home.MultiActionsViewModel {
            this._exportMultiAction = new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "export", this.$utility.rootUrl + "Images/html/icons/ic_get_app_black_24px.svg", false, null, "Export", false);
            this._archiveMultiAction = new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "multiaction.archive", this.$utility.rootUrl + "Images/html/icons/ic_archive_black_48px.svg", false, null, "Archive", false);
            this._unarchiveMultiAction = new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "multiaction.unarchive", this.$utility.rootUrl + "Images/html/icons/ic_unarchive_black_48px.svg", false, null, "Unarchive", false);
            let actions: ap.viewmodels.home.ActionViewModel[] = [
                this._exportMultiAction // ,
                // this._archiveMultiAction,
                // this._unarchiveMultiAction
            ];
            return new ap.viewmodels.home.MultiActionsViewModel(this.$utility, actions, []); // the checked event will raise for one time so reduce one
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
         * This method will be called to create the list view model
         */
        protected createUserCommentListVm(apiGroups: string[], defaultGroupData: string): ap.viewmodels.notes.UserCommentPagedListViewModel {
            let pathToLoad = "Status,Type,IsReadOnly,HasAttachment,Subject,DueDate,IsUrgent,CodeNum,ProjectNumSeq,MeetingNumSeq,Code,EntityVersion,IsArchived,From.Person.Name,NoteInCharge.Tag,";
            pathToLoad += "IssueType.Code,IssueType.Description,IssueType.ParentChapter.Code,IssueType.ParentChapter.Description,NoteInCharge.UserId,Comments.LastModificationDate,Comments.IsRead,Meeting.Title,Meeting.IsPublic,Meeting.IsSystem,Meeting.Code,Meeting.NumberingType,MeetingAccessRight";
            return new ap.viewmodels.notes.UserCommentPagedListViewModel(this.$scope, this.$utility, this.$api, this.$q, this.$controllersManager, this.$servicesManager.reportService, FormItemViewModel, pathToLoad, null, null, apiGroups, defaultGroupData, 50, false);
        }
        /**
         * This method must be implemented to know the name of the view
         */
        protected getListViewName(): string {
            return "form.list";
        }

        protected getGroupActionTitleKey() {
            return "Group forms";
        }

        protected createGroups(): ap.viewmodels.home.SubActionViewModel[] {
            return super.createGroups();
        }

        /**
         * This method is used to open the rooms management dialog
         */
        public openConfigureRoomDialog() {
            // No need in forms
        }

        /**
         * This method must be implemented to create the main action list for the list
         */
        protected createMainActions(): ap.viewmodels.home.ActionViewModel[] {
            let actions = super.createMainActions();
            this._exportListAction = new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "exportlist", this.$utility.rootUrl + "Images/html/icons/ic_launch_black_24px.svg", true, null, "Export list", false);
            actions.push(this._exportListAction);
            return actions;
        }


        /**
         * This method is to make action when action of main action is used. Need to overload to manage specific action
         * @param actionName The name of action clicked
         */
        protected listActionClickedHandler(actionName: string) {
            super.listActionClickedHandler(actionName);
            switch (actionName) {
                case "exportlist":
                    this.exportList();
                    break;
            }
        }


        protected idsLoadedHandler() {
            this._exportListAction.isEnabled = this.listVm.ids.length > 0;
        }


        /**
         * This method needs to be overloaded by children classes to make action when a click is done on a multiaction
         * @param actionName This is the name of the action clicked
         * @param ids This is the ids on which the action is done
         */
        protected multiActionClick(actionName: string, ids: string[]) {
            switch (actionName) {
                case "export":
                    this.exportForms(ids);
                    break;
                case "multiaction.archive":
                    this.$controllersManager.formController.multiArchiveForm(ids).then((result: ap.models.multiactions.FormMultiActionsResult) => {
                        if (result.SkippedActionDescriptionList.length > 0) {
                            this.openMultiActionResultDialog(result);
                        }
                    });
                    break;
                case "multiaction.unarchive":
                    this.$controllersManager.formController.multiUnarchiveForm(ids).then((result: ap.models.multiactions.FormMultiActionsResult) => {
                        if (result.SkippedActionDescriptionList.length > 0) {
                            this.openMultiActionResultDialog(result);
                        }
                    });
                    break;
            }
        }

        /**
        * This method use for open dialog with the result of the action
        * @param result the NoteMultiActionsResult bind on the view MultiActionsResultDialog
        **/
        public openMultiActionResultDialog(result: ap.models.multiactions.FormMultiActionsResult, messageKey?: string) {
            let NotAppliedDescriptionResultVM: ap.viewmodels.multiactions.NotAppliedDescriptionResultViewModel = new ap.viewmodels.multiactions.NotAppliedDescriptionResultViewModel(this.$utility, result.SkippedActionDescriptionList, messageKey);

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
         * This methods export the entire of the loaded lists
         */
        private exportList() {
            this.exportForms(this.listVm.ids);
        }

        /**
         * This method will export the list of forms in excel file.
         * @param ids THis is the list of ids to export. If not specified, it means all the list. 
         */
        public exportForms(ids?: string[]) {
            this.$controllersManager.reportController.downloadExportExcelEntities("forms", ids, true);
        }

        /**
         * This method is to compute the visibility and accessibility of the multi actions. To be overloaded
         */
        protected computeMultiActionsAccessibility() {
            this._exportMultiAction.isVisible = true;
            this._exportMultiAction.isEnabled = true;
            this.computeArchiveMultiActionRight();
            this.computeUnarchiveMultiActionRight();
        }
        /**
         * This method must be implemented to create the addActions 
         */
        protected createAddActions(): ap.viewmodels.home.ActionViewModel {
            let addActions = new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "form.importform", "/Images/html/icons/ic_add_black_48px.svg", false, null, "Add a new form", false, false);
            return addActions;
        }

        /**
         * This method will check the user access right to add the good accessibility to each action of the list
         */
        private calculateAccessRight() {
            this.screenInfo.addAction.isVisible = this.$controllersManager.formController.canAddForm(this._meetingAccessRight);
            this.screenInfo.addAction.isEnabled = this.screenInfo.addAction.isVisible;
        }

        /**
        * Method use to know if the button of multiarchive is visible and enable or not
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
        * Method use to know if the button of multiunarchive is visible and enable or not
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
         * This method must be implemented to create parameter to know how to search in the main search
         */
        protected createMainSearchInfo(): ap.misc.MainSearchInfo {
            let mainSearcheInfo = new ap.misc.MainSearchInfo(this.$utility, this.$timeout, [], [
                new ap.misc.AdvancedFilter(new ap.misc.PropertyInfo("CodeNum", "Number", false, ap.misc.PropertyType.String, "CodeNum", null, "Number"), null, null, true),
                new ap.misc.AdvancedFilter(new ap.misc.PropertyInfo("Subject", "Name", false, ap.misc.PropertyType.String), null),
                new ap.misc.AdvancedFilter(new ap.misc.PropertyInfo("From.DisplayName", "Author", false, ap.misc.PropertyType.String, "From", null, "Author"), null),
                new ap.misc.AdvancedFilter(new ap.misc.PropertyInfo("Date", "Creation date", false, ap.misc.PropertyType.Date, "CreationDate", null, "CreationDate"), ap.misc.AdvancedFilter.pastDateShortcuts),
                new ap.misc.AdvancedFilter(new ap.misc.PropertyInfo("ModificationDate", "Modification date", false, ap.misc.PropertyType.Date, "Date"), ap.misc.AdvancedFilter.pastDateShortcuts),
                new ap.misc.AdvancedFilter(new ap.misc.PropertyInfo("NoteInCharge.Tag", "In charge", false, ap.misc.PropertyType.String, "To", null, "InCharge"), null, new ap.viewmodels.notes.filters.ContactAdvancedFilterList(this.$utility, this.$api, this.$q, this.$controllersManager, this.$timeout), false, true),
                new ap.misc.AdvancedFilter(new ap.misc.PropertyInfo("DueDate", "Due date", false, ap.misc.PropertyType.Date, "DueDate"), ap.misc.AdvancedFilter.futureDateShortcuts.concat([new ap.misc.DateShortcutItem(DateShortcut.Older, "app.dateshortcut.due.Older")]), null, false, true),
            ], [], true, this.$controllersManager.mainController.currentProject().Id);
            mainSearcheInfo.isVisible = true;
            mainSearcheInfo.isEnabled = true;

            return mainSearcheInfo;
        }

        protected initCustomParams() {
            super.initCustomParams();
            this.listVm.removeCustomParam("notebasetype");
            this.listVm.addCustomParam("ppactions", "updatenotemeetingaccessright");
            this.listVm.addCustomParam("notebasetype", "Form");
        }

        /**
         * Initialize list value
         */
        public initList() {
            super.initList();
            if (this.$controllersManager.mainController.currentMeeting) {
                this.loadData(this._screenInfo.selectedEntityId);
            }
            this.$controllersManager.mainController.on("currentmeetingchanged", this.meetingChangedHandler, this);
        }

        /**
         * Handle meeting changing event
         */
        private meetingChangedHandler() {
            this.loadData(this._screenInfo.selectedEntityId);
        }

        constructor($scope: ng.IScope, $utility: ap.utility.UtilityHelper, $api: ap.services.apiHelper.Api, $controllersManager: ap.controllers.ControllersManager, $q: angular.IQService,
            $servicesManager: ap.services.ServicesManager, $timeout: angular.ITimeoutService,
            $mdDialog: angular.material.IDialogService, _isForFormModule: boolean = true) {
            super($scope, $utility, $api, $controllersManager, $q, $servicesManager, $timeout, $mdDialog, _isForFormModule);

            if ($controllersManager.mainController.currentMeeting !== null && $controllersManager.mainController.currentMeeting !== undefined) {
                $controllersManager.accessRightController.getMeetingAccessRight($controllersManager.mainController.currentMeeting.Id).then((meetingAccessRight: ap.models.accessRights.MeetingAccessRight) => {
                    this._meetingAccessRight = meetingAccessRight;
                    this.calculateAccessRight();
                });
            }

            this._listener.addEventsName(["itemSelected"]);
        }


        private _meetingAccessRight: ap.models.accessRights.MeetingAccessRight = null;
        private _exportMultiAction: ap.viewmodels.home.ActionViewModel;
        private _exportListAction: ap.viewmodels.home.ActionViewModel;
        private _archiveMultiAction: ap.viewmodels.home.ActionViewModel;
        private _unarchiveMultiAction: ap.viewmodels.home.ActionViewModel;
    }
}