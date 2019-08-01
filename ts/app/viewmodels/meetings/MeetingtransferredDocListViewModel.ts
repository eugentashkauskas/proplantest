module ap.viewmodels.meetings {

    /**
     * This Class is responsible of the load of MeetingTransferredDocs
     */
    export class MeetingTransferredDocListViewModel extends ap.viewmodels.ListEntityViewModel implements ap.utility.IListener, IDispose {

        on(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.on(eventName, callback, caller);
        }
        off(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.off(eventName, callback, caller);
        }

        /**
        * This method use for get isValid
        **/
        public get isValid(): boolean {
            return this._isValid;
        }

        /**
        * Use to get the screenInfo
        **/
        public get screenInfo(): ap.misc.ScreenInfo {
            return this._screenInfo;
        }

        /**
        * The way to know if one item has changed so the save button can be enable
        **/
        public get hasChanged(): boolean {
            return this._hasChanged;
        }

        /**
         * Actions related to a list of transferred docs
         */
        public get listActions(): ap.viewmodels.home.ActionViewModel[] {
            return this._listActions;
        }

        /**
        * Methode use to know if something has changed on the list to set the save button enable or disable
        **/
        private checkHasChanged() {
            this._hasChanged = this.getChangedItems().length > 0;
            this.checkEditAccess();
        }

        /**
         * Load the list of MeetingTransferredDocs and call onLoadedItems to push them in the sourceItems property
         */
        public load() {
            this._controllersManager.meetingController.getTransferredDocList(this._meeting).then((meetingTransferredDocs: ap.models.meetings.MeetingTransferredDocs[]) => {

                // build the VMs list
                let meetingTransferredDocsViewModel: ap.viewmodels.meetings.MeetingTransferredDocViewModel[] = [];

                for (let meetingTransferredDoc of meetingTransferredDocs) {
                    let meetingTransferredDocViewModel: ap.viewmodels.meetings.MeetingTransferredDocViewModel = new ap.viewmodels.meetings.MeetingTransferredDocViewModel(this._utility, this._api, this.$q, this.$mdDialog, this._controllersManager);
                    meetingTransferredDocViewModel.init(meetingTransferredDoc);
                    meetingTransferredDocViewModel.on("transferreddocaddnew", this.transferredDocInsertRequested, this);
                    meetingTransferredDocViewModel.on("propertychanged", this.meetingTranferredDocPropertyChanged, this);
                    meetingTransferredDocsViewModel.push(meetingTransferredDocViewModel);
                }

                this.onLoadItems(meetingTransferredDocsViewModel);
            });
        }

        /**
        * This handle actions click on FAB (addAction)
        **/
        private addActionClickedHandler(addArgs: controllers.AddActionClickEvent) {
            this.actionClickedHandler(addArgs.name);
        }

        /*
        * Setter to the isValid property
        */
        private setIsValid(isValid: boolean) {
            if (this._isValid !== isValid) {
                this._isValid = isValid;
                this.computeItemsAction();
            }
        }

        /*
        * This private methods checks if there are invalid items
        */
        private checkIsValid() {
            this.setIsValid(this._invalidItems.length === 0);
        }

        /**
         * This method use for compute action for all source items
         */
        private computeItemsAction() {
            for (let i = 0; i < this.sourceItems.length; i++) {
                let item = <ap.viewmodels.meetings.MeetingTransferredDocViewModel>this.sourceItems[i];
                let isAllItemValid = this.screenInfo.isEditMode && this.isValid;
                item.computeActionVisibility(isAllItemValid, isAllItemValid || item.originalEntity.IsNew);
            }
        }

        /**
          * This top handle actions click on UI
          **/
        private actionClickedHandler(actionName: string) {
            switch (actionName) {
                case "meetingtransferreddocs.edit":
                    this._screenInfo.isEditMode = true;
                    this.computeItemsAction();
                    this._listener.raise("editmodechanged", new base.EditModeEvent(this));
                    break;
                case "meetingtransferreddocs.add":
                    this.transferredDocInsertRequested();
                    break;
                case "meetingtransferreddocs.save":
                    this.save();
                    break;
                case "meetingtransferreddocs.cancel":
                    this.cancel();
                    break;
            }

            this.checkEditAccess();
        }

        /**
        * This method use for add new TransferredDoc
        **/
        private transferredDocInsertRequested(item?: MeetingTransferredDocViewModel) {
            let itemIndex = item ? this.sourceItems.indexOf(item) : this.sourceItems.length - 1;
            let newTransferredDoc = new ap.models.meetings.MeetingTransferredDocs(this.$utility);
            newTransferredDoc.From = this._utility.UserContext.CurrentUser();
            newTransferredDoc.FromTag = newTransferredDoc.From.DisplayName;
            let newTranferredDocVM = new ap.viewmodels.meetings.MeetingTransferredDocViewModel(this.$utility, this._api, this.$q, this.$mdDialog, this._controllersManager, this, itemIndex + 1);
            newTranferredDocVM.init(newTransferredDoc);
            newTranferredDocVM.on("transferreddocaddnew", this.transferredDocInsertRequested, this);
            newTranferredDocVM.on("propertychanged", this.meetingTranferredDocPropertyChanged, this);
            newTranferredDocVM.computeActionVisibility(true, true);
            this.insertItem(itemIndex + 1, newTranferredDocVM);

            // special UI logic to focus on new row
            ViewHelper.delayFocusElement(newTranferredDocVM.meetingTransferDoc.Id);

            this._invalidItems.push(newTranferredDocVM);
            this.checkIsValid();
            this.checkHasChanged();
        }

        /**
        * This method use for save changes 
        **/
        private save() {
            let changedItems = this.getChangedItems();
            for (let i = 0, len = changedItems.length; i < len; i++) {
                changedItems[i].postChanges();
            }

            let meeting = this._meeting;
            let transferredDocViews = <MeetingTransferredDocViewModel[]>this.sourceItems;
            let transferredDocModels: ap.models.meetings.MeetingTransferredDocs[] = [];
            for (let transferredDocView of transferredDocViews) {
                if (!transferredDocView.isMarkedToDelete) {
                    transferredDocModels.push(transferredDocView.meetingTransferDoc);
                }
            }
            this._controllersManager.meetingController.saveTransferredDocs(meeting, transferredDocModels).then(() => {
                this._screenInfo.isEditMode = false;
                this.computeItemsAction();
                this._listener.raise("editmodechanged", new base.EditModeEvent(this, false, false));
                this.load();
                this.checkHasChanged();
            });
        }

        /**
        * This method use for exit from Editmode 
        **/
        private cancel() {
            this._screenInfo.isEditMode = false;
            let meetingTransferredDocVm: MeetingTransferredDocViewModel;
            let modifiedMeetingTransferredDocs: MeetingTransferredDocViewModel[] = <MeetingTransferredDocViewModel[]>this.getChangedItems();
            for (let i = modifiedMeetingTransferredDocs.length - 1; i >= 0; i--) {
                meetingTransferredDocVm = modifiedMeetingTransferredDocs[i];
                if (meetingTransferredDocVm.originalEntity.IsNew) {
                    this.sourceItems.splice(this.sourceItems.indexOf(meetingTransferredDocVm), 1);
                    this._setCount(this._count - 1);
                }
            }
            for (let i = this.sourceItems.length - 1; i >= 0; i--) {
                this.sourceItems[i].cancel();
                (<MeetingTransferredDocViewModel>this.sourceItems[i]).undoDelete();
            }
            this.load();
            this._listener.raise("editmodechanged", new base.EditModeEvent(this, false, true));
            this._invalidItems = [];
            this.setIsValid(true);
            this.computeItemsAction();
            this.checkHasChanged();
        }

        /**
        * This method use for calculate access for Edit
        **/
        private checkEditAccess() {
            this._editAction.isVisible = this._meeting && this.screenInfo.isEditMode === false && this._meetingAccessrightHelper.canAccessTransferredDoc;
            this._editAction.isEnabled = this._meeting && this.screenInfo.isEditMode === false && this._meetingAccessrightHelper.canAccessTransferredDoc;
            this._addAction.isVisible = this._screenInfo.isEditMode === true;
            this._addAction.isEnabled = this._screenInfo.isEditMode === true && this._isValid;
            this._saveAction.isVisible = this._screenInfo.isEditMode === true;
            this._saveAction.isEnabled = this._screenInfo.isEditMode === true && this._isValid && this.hasChanged;
            this._cancelAction.isVisible = this._screenInfo.isEditMode === true;
            this._cancelAction.isEnabled = this._screenInfo.isEditMode === true;
        }

        /*
        * Handler method called when the property of an item is changed
        */
        private meetingTranferredDocPropertyChanged(args: base.PropertyChangedEventArgs) {
            switch (args.propertyName) {
                case "isValid":
                    if (!(<MeetingTransferredDocViewModel>args.caller).isValid()) {
                        if (this._invalidItems.indexOf(args.caller) === -1) {
                            this._invalidItems.push(args.caller);
                        }
                    } else if (this._invalidItems.indexOf(args.caller) > -1) {
                        this._invalidItems.splice(this._invalidItems.indexOf(args.caller), 1);
                    }
                    break;
                case "delete":
                    if ((<MeetingTransferredDocViewModel>args.caller).isMarkedToDelete) {
                        if (this._invalidItems.indexOf(args.caller) > -1) {
                            this._invalidItems.splice(this._invalidItems.indexOf(args.caller), 1);
                        }
                    }
                    break;
                case "undelete":
                    if (!(<MeetingTransferredDocViewModel>args.caller).isValid() && !(<MeetingTransferredDocViewModel>args.caller).isMarkedToDelete) {
                        this._invalidItems.push(args.caller);
                    }
                    break;

            }
            this.checkIsValid();
            this.checkHasChanged();
        }

        public dispose() {
            this._listener.clear();
        }

        /**
         * Constructor of the Class
         * @param utility UtilityHelper Helper class used to build the ViewModel
         * @param meeting Meeting The meeting from which the MeetingTransferredDocs will be loaded
         */
        constructor(private _utility: ap.utility.UtilityHelper, private _controllersManager: ap.controllers.ControllersManager, private $q: ng.IQService, private _api: ap.services.apiHelper.Api, private $timeout: ng.ITimeoutService, private $mdDialog: angular.material.IDialogService,
            private _meeting: ap.models.meetings.Meeting) {

            super(_utility, "MeetingTransferredDocViewModel", "", "", "");
            let project = _controllersManager.mainController.currentProject();
            this._meetingAccessrightHelper = new ap.models.accessRights.MeetingAccessRightHelper(_utility, this._meeting, project);
            this._editAction = new ap.viewmodels.home.ActionViewModel(_utility, _utility.EventTool, "meetingtransferreddocs.edit", _utility.rootUrl + "Images/html/icons/ic_create_black_48px.svg", true, null, "Edit", true, false, new misc.Shortcut("e"));
            this._saveAction = new ap.viewmodels.home.ActionViewModel(_utility, _utility.EventTool, "meetingtransferreddocs.save", _utility.rootUrl + "Images/html/icons/ic_save_black_48px.svg", false, null, "Save", true);
            this._cancelAction = new ap.viewmodels.home.ActionViewModel(_utility, _utility.EventTool, "meetingtransferreddocs.cancel", _utility.rootUrl + "Images/html/icons/ic_cancel_black_48px.svg", false, null, "Cancel", true);

            this._addAction = new ap.viewmodels.home.ActionViewModel(_utility, _utility.EventTool, "meetingtransferreddocs.add", _utility.rootUrl + "Images/html/icons/ic_add_black_48px.svg", false, null, "Add transferred doc", true);
            this._listActions = [ this._addAction ];

            this._screenInfo = new ap.misc.ScreenInfo(_utility, "meeting.transferreddocs", ap.misc.ScreenInfoType.List, [this._editAction, this._saveAction, this._cancelAction], null, null, "meetingconfig", true, false);

            this._screenInfo.on("actionclicked", this.actionClickedHandler, this);
            this._screenInfo.on("addactionclicked", this.addActionClickedHandler, this);
            this._listener.addEventsName(["editmodechanged"]);

            this._invalidItems = [];

            this.checkEditAccess();
        }

        private _meetingAccessrightHelper: ap.models.accessRights.MeetingAccessRightHelper;
        private _screenInfo: ap.misc.ScreenInfo;
        private _editAction: ap.viewmodels.home.ActionViewModel;
        private _saveAction: ap.viewmodels.home.ActionViewModel;
        private _addAction: ap.viewmodels.home.ActionViewModel;
        private _cancelAction: ap.viewmodels.home.ActionViewModel;
        private _listActions: ap.viewmodels.home.ActionViewModel[];
        private _isValid: boolean = true;
        private _hasChanged: boolean = false;
        private _invalidItems: MeetingTransferredDocViewModel[];

    }
}