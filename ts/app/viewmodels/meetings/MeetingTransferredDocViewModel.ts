module ap.viewmodels.meetings {
    import Meeting = ap.models.meetings.Meeting;
    export class MeetingTransferredDocViewModel extends ap.viewmodels.EntityViewModel implements IDispose {

        // name
        public get name(): string {
            return this._name;
        }

        public set name(value: string) {
            if (this._name !== value) {
                this._name = value;
                this.raisePropertyChanged("name", this._name, this);
                this.checkIsValid();
            }
        }

        // fromTag
        public get fromTag(): string {
            return this._fromTag;
        }

        public set fromTag(value: string) {
            if (this._fromTag !== value) {
                this._fromTag = value;
                this.raisePropertyChanged("fromTag", this._fromTag, this);
            }
        }

        // transferredDate
        public get transferredDate(): Date {
            return this._transferredDate;
        }

        public set transferredDate(value: Date) {
            if (this._transferredDate !== value) {
                this._transferredDate = value;
                this.raisePropertyChanged("transferredDate", this._transferredDate, this);
                this.checkIsValid();
            }
        }

        // approved
        public get approved(): string {
            return this._approved;
        }

        public set approved(value: string) {
            if (this._approved !== value) {
                this._approved = value;
                this.raisePropertyChanged("approved", this._approved, this);
            }
        }

        // meeting
        public get meeting(): Meeting {
            return this._meeting;
        }

        public set meeting(value: Meeting) {
            this._meeting = value;
        }

        // fromGuid
        public get fromGuid(): string {
            return this._fromGuid;
        }

        public set fromGuid(value: string) {
            if (this._fromGuid !== value) {
                this._fromGuid = value;
                this.raisePropertyChanged("fromGuid", this._fromGuid, this);
            }
        }

        // usersTo
        public get usersTo(): MeetingTransferredDocToListViewModel {
            return this._usersTo;
        }

        public get meetingTransferDoc(): ap.models.meetings.MeetingTransferredDocs {
            return <ap.models.meetings.MeetingTransferredDocs>this.originalEntity;
        }

        /**
        * Property to access the curent available actions
        **/
        public get actions(): ap.viewmodels.home.ActionViewModel[] {
            return this._actions;
        }

        /**
        * This is property for meake item to delete message display
        **/
        public get isMarkedToDelete(): boolean {
            return this._isMarkedToDelete;
        }

        /**
        * This is property to get contact selector viewmodel for from field  
        **/
        public get fromSelector(): ap.viewmodels.projects.ContactSelectorViewModel {
            return this._fromSelector;
        }

        /**
        * This is property to get selected 'from' contact value
        **/
        public get fromSelected(): ap.viewmodels.projects.ContactItemViewModel {
            return this._fromSelected;
        }

        /**
        * This is property to set selected 'from' contact value
        **/
        public set fromSelected(value: ap.viewmodels.projects.ContactItemViewModel) {
            if (this._fromSelected !== value) {
                this._fromSelected = value;
                this.raisePropertyChanged("fromSelected", this._fromSelected, this);
                this.checkIsValid();
            }
        }

        /**
        * Methode use to manage the differents actions
        **/
        public actionClicked(action: string) {
            switch (action) {
                case "transferreddoc.delete":
                    this._isMarkedToDelete = true;
                    this.checkIsValid();
                    this.raisePropertyChanged("delete", false, this);
                    break;
                case "transferreddoc.add":
                    this._listener.raise("transferreddocaddnew", this);
                    break;
            }
        }

        public undoDelete() {
            this._isMarkedToDelete = false;
            this.checkIsValid();
            this.raisePropertyChanged("undelete", true, this);
        }

        /**
        * This method use for checked valid and changes
        **/
        public contactsChanged() {
            this.raisePropertyChanged("userTo", this._usersTo, this);
            this.checkIsValid();
        }

        /**
        * This method override EntityViewModel checkIsValid abstarct method
        **/
        protected checkIsValid() {
            this.setIsValid = this.isMarkedToDelete === false && !StringHelper.isNullOrWhiteSpace(this.name) && (this.transferredDate !== null && this.transferredDate !== undefined) && this._usersTo.contactSelectorViewModel.selectedContacts.length > 0 && (this._fromSelected !== null && this._fromSelected !== undefined);
        }

        /**
        * This method is overiding method from EntityViewModel
        **/
        protected computeHasChanged(): boolean {
            if (this._name !== this.meetingTransferDoc.Name ||
                (this._transferredDate && !this._transferredDate.isSameDay(this.meetingTransferDoc.TransferredDate)) ||
                this._approved !== this.meetingTransferDoc.Approved ||
                (!!this._fromSelected && this._fromSelected.displayText !== this.meetingTransferDoc.FromTag) ||
                this._usersTo.checkContactsSelectChanged() ||
                this._isMarkedToDelete) {
                return true;
            } else {
                return super.computeHasChanged();
            }
        }

        public computeActionVisibility(enableEdit: boolean = false, enableDelete: boolean = false) {
            this._deleteAction.isEnabled = enableDelete;
            this._deleteAction.isVisible = enableDelete;
            this._addAction.isEnabled = enableEdit;
            this._addAction.isVisible = enableEdit;
        }

        copySource(): void {
            if (this.meetingTransferDoc !== null) {
                this._name = this.meetingTransferDoc.Name;
                this._fromTag = this.meetingTransferDoc.FromTag;
                this._transferredDate = this.meetingTransferDoc.TransferredDate;
                this._approved = this.meetingTransferDoc.Approved;
                this._meeting = this.meetingTransferDoc.Meeting;
                this._fromGuid = this.meetingTransferDoc.FromGuid;
                this._from = this.meetingTransferDoc.From;
                if (this._from) {
                    this._fromSelector.initUsers([this._from]);
                    this._fromSelector.searchText = this._fromTag;
                }
                this._fromSelected = this._fromTag ? new ap.viewmodels.projects.ContactItemViewModel(this._fromTag) : null;
                this._usersTo = new MeetingTransferredDocToListViewModel(this.$utility, this._api, this.$q, this.$mdDialog, this._controllersManager, this);
                this._usersTo.on("contactsupdated", this.contactsChanged, this);
            }
        }

        public postChanges() {
            if (this.meetingTransferDoc !== null) {
                this.meetingTransferDoc.Name = this._name;
                this.meetingTransferDoc.TransferredDate = this._transferredDate;
                this.meetingTransferDoc.Approved = this._approved;
                this.meetingTransferDoc.Meeting = this._meeting;
                if (this.isMarkedToDelete) {
                    this.meetingTransferDoc.delete();
                }
                this._usersTo.postChanges();
                this.fromPostChanges();
            }
        }

        private fromPostChanges() {
            if (this._fromSelected.getPropertyName()) {
                switch (this._fromSelected.getPropertyName()) {
                    case "Companies":
                    case "Roles":
                        this.meetingTransferDoc.FromGuid = null;
                        break;
                    default:
                        this.meetingTransferDoc.FromGuid = this._fromSelected.userId;
                        this.meetingTransferDoc.From = this._fromSelected.contactDetails.User;
                        break;
                }
                this.meetingTransferDoc.FromTag = this._fromSelected.displayText;
            }
        }

        public dispose() {
            super.dispose();
            if (this._usersTo)
                this._usersTo.dispose();
        }

        constructor(utility: utility.UtilityHelper, private _api: ap.services.apiHelper.Api, private $q: angular.IQService, private $mdDialog: angular.material.IDialogService, private _controllersManager: ap.controllers.ControllersManager, parentListVm?: BaseListEntityViewModel, index?: number) {
            super(utility, parentListVm, index);

            this._deleteAction = new ap.viewmodels.home.ActionViewModel(utility, utility.EventTool, "transferreddoc.delete", utility.rootUrl + "Images/html/icons/ic_delete_black_48px.svg",
                false /*visible*/, null /*sub*/, "Delete", false /*enabled*/);
            this._addAction = new ap.viewmodels.home.ActionViewModel(utility, utility.EventTool, "transferreddoc.add", utility.rootUrl + "Images/html/icons/ic_add_black_48px.svg",
                false, null, "Add transferred doc", false);

            this._actions = [
                this._addAction,
                this._deleteAction
            ];

            this._listener.addEventsName(["transferreddocaddnew"]);

            this._fromSelector = new ap.viewmodels.projects.ContactSelectorViewModel(utility, _api, $q, _controllersManager.mainController, _controllersManager.projectController);
        }

        private _name: string = null;
        private _fromTag: string = null;
        private _transferredDate: Date = null;
        private _approved: string = null;
        private _meeting: Meeting = null;
        private _fromGuid: string = null;
        private _deleteAction: ap.viewmodels.home.ActionViewModel;
        private _addAction: ap.viewmodels.home.ActionViewModel;
        private _actions: ap.viewmodels.home.ActionViewModel[];
        private _usersTo: MeetingTransferredDocToListViewModel = null;
        private _isMarkedToDelete: boolean = false;
        private _fromSelector: ap.viewmodels.projects.ContactSelectorViewModel;
        private _from: ap.models.actors.User;
        private _fromSelected: ap.viewmodels.projects.ContactItemViewModel;
    }
}