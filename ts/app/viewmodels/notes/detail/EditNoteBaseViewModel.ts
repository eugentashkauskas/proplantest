module ap.viewmodels.notes {

    export enum AddEditResponse {
        CreateRoom,
        CreateCategory,
        CreateMeeting,
        CloseAddEditPopup
    }

    export abstract class EditNoteBaseViewModel implements IDispose, utility.IListener {

        public get isForDetailPane(): boolean {
            return this._isforNoteDetail;
        }

        public set isForDetailPane(val: boolean) {
            this._isforNoteDetail = val;
        }

        public get isEditForm(): boolean {
            return this._isEditForm;
        }

        public get editTitle(): string {
            return this._editTitleMessage;
        }

        public get shortcutActions(): ap.viewmodels.home.ActionViewModel[] {
            return this._shortcutActions;
        }

        public set shortcutActions(val: ap.viewmodels.home.ActionViewModel[]) {
            this._shortcutActions = val;
        }

        public get noteDetailBaseViewModel(): NoteDetailBaseViewModel {
            return this._noteDetailBaseVm;
        }

        public get issueTypeSelectorViewModel(): ap.viewmodels.projects.IssueTypeSelectorViewModel {
            return this._issueTypeSelectorVm;
        }

        public set issueTypeSelectorViewModel(s: ap.viewmodels.projects.IssueTypeSelectorViewModel) {
        }

        public get contactSelectorViewModel(): ap.viewmodels.projects.ContactSelectorViewModel {
            return this._contactSelectorVm;
        }

        public get suggestedIssueTypeSubjectListViewModel(): ap.viewmodels.projects.SuggestedIssueTypeSubjectListViewModel {
            return this._suggestedIssueTypeSubjectListViewModel;
        }

        public set suggestedIssueTypeSubjectListViewModel(vm: ap.viewmodels.projects.SuggestedIssueTypeSubjectListViewModel) { }

        /**
        * The VM to select the meeting for the new point
        **/
        public get meetingSelector(): ap.viewmodels.meetings.MeetingSelectorViewModel {
            return this._meetingSelector;
        }

        /**
         * To know can select the meeting for add/edit mode
         */
        public get canEditMeeting() {
            return this._canEditMeeting;
        }

        /**
         * To know can show meeting selector or not
         */
        public get hasEditMeeting() {
            return this._hasEditMeeting;
        }

        public set document(value: ap.models.documents.Document) {
            this._document = value;
        }

        public get document(): ap.models.documents.Document {
            return this._document;
        }

        /**
         * Determines whether a user can edit a list of the point
         */
        protected updateMeetingAccess() {
            this._canEditMeeting = false;

            let hasMeetingModule = this.$utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_MeetingManagement);
            let isMeetingModule = this.$controllersManager.mainController.currentMeeting && this.$controllersManager.mainController.currentMeeting !== null;

            this._canEditMeeting = hasMeetingModule && !isMeetingModule && (this._noteDetailBaseVm.noteBase === null || this._noteDetailBaseVm.noteBase.IsNew);

            // when user have meeting module by default we always how the control UI
            // if user dont had meeting we show only when ADDING mode and it will disabled to said that new point by default always have a meeting
            this._hasEditMeeting = hasMeetingModule || (this._noteDetailBaseVm.noteBase !== null && this._noteDetailBaseVm.noteBase.IsNew === true);
        }

        /**
         * This property will check if the user mades some changes in the values of each editable fields. 
         * Will checked the noteDetailVm.hasChanged and each special selector fields
         **/
        public get hasChanged(): boolean {
            return this.checkHasChanged();
        }

        protected checkHasChanged(): boolean {
            if (!this.issueTypeSelectorViewModel || !this.meetingSelector || !this.suggestedIssueTypeSubjectListViewModel) {
                return false;
            }

            let note = this.noteDetailBaseViewModel.noteBase;

            let dueDateChanged: boolean = false;
            if (note && note.DueDate) {
                dueDateChanged = note.DueDate.getTime() !== this.noteDetailBaseViewModel.dueDate.getTime();
            } else if (this.noteDetailBaseViewModel.dueDate) {
                dueDateChanged = true;
            }

            let meetingHasChanged: boolean = false;
            if (note && note.Meeting) {
                meetingHasChanged = this.meetingSelector.selectedMeetingId !== this._createNewMeeting.id && this.noteDetailBaseViewModel.noteBase.Meeting.Id !== this.meetingSelector.selectedMeetingId;
            } else if (this.meetingSelector.selectedMeetingId && this.meetingSelector.selectedMeetingId !== this._createNewMeeting.id) {
                meetingHasChanged = true;
            }

            let subjectHasChanged: boolean = false;
            let subjectSelected = this.suggestedIssueTypeSubjectListViewModel.getSubject();
            if (this._noteDetailBaseVm.noteBase && subjectSelected !== undefined && subjectSelected !== this._noteDetailBaseVm.noteBase.Subject) {
                subjectHasChanged = true;
            }

            let commentHasChanged: boolean = false;
            let firstComment: any;
            if (this._noteDetailBaseVm.noteBase && this._noteDetailBaseVm.noteBase.Comments) {
                firstComment = this._noteDetailBaseVm.noteBase.Comments.filter((comment: models.notes.NoteComment) => {
                    return comment.IsFirst;
                })[0];
            }

            if (this._noteDetailBaseVm.noteCommentList && this._noteDetailBaseVm.noteCommentList.firstComment && firstComment && this._noteDetailBaseVm.noteCommentList.firstComment.comment !== firstComment.Comment) {
                if (this._noteDetailBaseVm.noteCommentList.firstComment.comment === "" && firstComment.Comment === null) {
                    commentHasChanged = false;
                } else
                    commentHasChanged = true;
            }

            return this.hasIssueTypeChanged() || meetingHasChanged || subjectHasChanged || dueDateChanged || this.hasInChargeChanged() || commentHasChanged;
        }

        protected hasIssueTypeChanged(): boolean {
            if (this.noteDetailBaseViewModel.noteBase && this.noteDetailBaseViewModel.noteBase.IssueType) {
                return this._addCategoryIssueType.id !== this.issueTypeSelectorViewModel.selectedIssueTypeId &&
                    this.noteDetailBaseViewModel.noteBase.IssueType.Id !== this.issueTypeSelectorViewModel.selectedIssueTypeId;
            } else if (this.issueTypeSelectorViewModel.selectedIssueTypeId && this._addCategoryIssueType.id !== this.issueTypeSelectorViewModel.selectedIssueTypeId) {
                return true;
            }
            return false;
        }

        /**
         * Method used to load an issue type with the given ID to the issue type selector
         * @param issueTypeId an id of the issue type to load into the issue type selector
         */
        public loadIssueTypeSelector(issueTypeId: string): angular.IPromise<any> {
            return this._issueTypeSelectorVm.selectIssueTypeById(issueTypeId);
        }

        /**
         * This property will check if the user can save the note.
         **/
        abstract canSave(): boolean;

        private hasInChargeChanged(): boolean {
            if (this.contactSelectorViewModel.selectedContacts) {
                if (this._noteDetailBaseVm.noteBase && this._noteDetailBaseVm.noteBase.NoteInCharge) {
                    if (this.contactSelectorViewModel.selectedContacts.length !== this._noteDetailBaseVm.noteBase.NoteInCharge.length) {
                        return true;
                    }

                    for (let selectedContact of this.contactSelectorViewModel.selectedContacts) {
                        let contactUser: ap.viewmodels.projects.ContactItemViewModel = (<ap.viewmodels.projects.ContactItemViewModel>selectedContact);

                        let found: boolean = false;
                        for (let noteInCharge of this._noteDetailBaseVm.noteBase.NoteInCharge) {
                            if ((contactUser.userId === noteInCharge.UserId) && (contactUser.displayText === noteInCharge.Tag)) { /*case when a company has the same userid has a user we want to add PSD-170*/
                                found = true; // the noteIncharge exists already -> we do not check for changes because a single NoteInCharge cannot be changed
                                break;
                            }
                        }

                        // the note in charge does not exist
                        if (!found) {
                            return true;
                        }
                    }

                    return false;
                } else {
                    return this.contactSelectorViewModel.selectedContacts.length > 0;
                }
            } else if (this._noteDetailBaseVm.noteBase && this._noteDetailBaseVm.noteBase.NoteInCharge) {
                return true;
            }

            return false;
        }

        /**
         * Save the noteBase
         */
        public save(saveParameters?: SaveNoteParameters) {
            if (this._noteDetailBaseVm && this.canSave()) {
                this._saveRequested = true;
                if (this._issueTypeSelectorVm.selectedIssueTypeId !== null) {
                    let parentChapter: ap.models.projects.ChapterHierarchy = this._issueTypeSelectorVm.getParentChapter();

                    this._noteDetailBaseVm.noteBase.IssueType = new ap.models.projects.IssueType(this.$utility);

                    this._noteDetailBaseVm.noteBase.IssueType.createByJson({
                        Id: this._issueTypeSelectorVm.selectedIssueTypeId, // need to do this to have the correct id of the issuetype without the  last char
                        Code: (<ap.models.projects.ChapterHierarchy>this._issueTypeSelectorVm.selectedItem.originalEntity).Code,
                        Description: (<ap.models.projects.ChapterHierarchy>this._issueTypeSelectorVm.selectedItem.originalEntity).Description,
                        ParentChapter: {
                            Id: parentChapter.EntityId,
                            Code: parentChapter.Code,
                            Description: parentChapter.Description
                        }
                    });
                }
                else
                    this._noteDetailBaseVm.noteBase.IssueType = null;

                if (this._noteDetailBaseVm && this._noteDetailBaseVm.noteInChargeList) {
                    this._noteDetailBaseVm.noteInChargeList.fillNoteInCharge(this.contactSelectorViewModel.selectedContacts);
                }

                if (this._meetingSelector.selectedMeetingId !== null) {
                    this._noteDetailBaseVm.noteBase.Meeting = new ap.models.meetings.Meeting(this.$utility);
                    this._noteDetailBaseVm.noteBase.Meeting.createByJson({
                        Id: this._meetingSelector.selectedMeetingId,
                        Code: (<ap.models.meetings.Meeting>this._meetingSelector.selectedItem.originalEntity).Code,
                        Title: (<ap.models.meetings.Meeting>this._meetingSelector.selectedItem.originalEntity).Title
                    });
                }
                this._noteDetailBaseVm.subject = this._suggestedIssueTypeSubjectListViewModel.getSubject();

                this._noteDetailBaseVm.postChanges();
            }
        }

        /**
         * Cancel the creation/edition of a noteBase
         */
        public cancel() {
            if (this._noteDetailBaseVm) {
                if (this._noteDetailBaseVm.originalEntity && !this._noteDetailBaseVm.originalEntity.IsNew) {
                    this._noteDetailBaseVm.cancel();
                }
                this._noteDetailBaseVm.isEditMode = false;
                this.$mdDialog.hide(ap.viewmodels.notes.AddEditResponse.CloseAddEditPopup);
            }
            this.stopContactDetailsWatcher();
        }

        public copySubjectToDescription(param: string = null) {
            let subject = this._noteDetailBaseVm.subject;
            if (param && param === "reset") {
                subject = this._lastSubject;
                this._noteDetailBaseVm.subject = subject;
                this._suggestedIssueTypeSubjectListViewModel.searchText = subject;
            }
            if (this._noteDetailBaseVm.noteBase.IsNew && !this._noteDetailBaseVm.noteCommentList.firstComment.comment && subject) {
                this._noteDetailBaseVm.noteCommentList.firstComment.comment = subject;
            }
            this._lastSubject = subject;
        }

        public updateSubjectFromSuggestedList() {
            if (this._suggestedIssueTypeSubjectListViewModel) {
                this._noteDetailBaseVm.subject = this._suggestedIssueTypeSubjectListViewModel.getSubject();
                if (this._noteDetailBaseVm.noteBase && this._noteDetailBaseVm.noteBase.IsNew && StringHelper.isNullOrEmpty(this._noteDetailBaseVm.noteCommentList.firstComment.comment) && this._suggestedIssueTypeSubjectListViewModel.selectedSubjectVM) {
                    this._noteDetailBaseVm.noteCommentList.firstComment.comment = this._suggestedIssueTypeSubjectListViewModel.selectedSubjectVM.defaultDescription;
                }
            }
        }

        /**
        * This method used to set the subject for the noteDetailViewModel
        * @param text is the given subject 
        **/
        public setSubject(text: string) {
            this._noteDetailBaseVm.subject = text;
            if (this.suggestedIssueTypeSubjectListViewModel.searchText === undefined && text)
                this.suggestedIssueTypeSubjectListViewModel.searchText = text;
        }

        /**
         * Handlers property changes of the note details view model
         * @param args event arguments
         */
        protected _noteDetailsPropertyChanged(args: ap.viewmodels.base.PropertyChangedEventArgs) {
            if (args.propertyName === "originalEntity") {
                this._noteDetailBaseVm.off("propertychanged", this._noteDetailsPropertyChanged, this);
                this.updateMeetingAccess();
                if (this._noteDetailBaseVm.noteBase) {
                    this.stopContactDetailsWatcher();

                    if (this._issueTypeSelectorVm) {
                        // issueTypeSelector may not be initialized yet
                        this._issueTypeSelectorVm.selectIssueTypeById(this._noteDetailBaseVm.noteBase.IssueType ? this._noteDetailBaseVm.noteBase.IssueType.Id : null);
                    }

                    if (this._meetingSelector) {
                        // meetingSelector may not be initialized yet
                        this._meetingSelector.selectMeetingById(this._noteDetailBaseVm.noteBase.Meeting ? this._noteDetailBaseVm.noteBase.Meeting.Id : null);
                    }

                    if (this._contactSelectorVm) {
                        // contactSelector may not be initialized yet
                        this._contactSelectorVm.initUsers(this._noteDetailBaseVm.noteBase.NoteInCharge);
                    }

                    if (this._noteDetailBaseVm.noteBase.Subject && !StringHelper.isNullOrEmpty(this._noteDetailBaseVm.noteBase.Subject)) {
                        this._suggestedIssueTypeSubjectListViewModel.searchText = this._noteDetailBaseVm.noteBase.Subject;
                    } else {
                        this._suggestedIssueTypeSubjectListViewModel.searchText = "";
                    }
                    this.runContactDetailsWatcher();
                }
            }
        }

        private _issueTypeSelectedItemChanged(selectedIssueTypeVm: ap.viewmodels.projects.ChapterHierarchyItemViewModel) {
            if (selectedIssueTypeVm) {
                if (selectedIssueTypeVm === this._addCategoryIssueType.item) {
                    if (this.isForDetailPane) {
                        this._listener.raise("relatedentitycreationrequest", AddEditResponse.CreateCategory);
                    } else {
                        this.$mdDialog.hide(ap.viewmodels.notes.AddEditResponse.CreateCategory);
                    }
                    return;
                }
                if (this._contactSelectorVm && this.hasIssueTypeChanged())
                    this._contactSelectorVm.handleIssueTypeChanged((<ap.models.projects.ChapterHierarchy>selectedIssueTypeVm.originalEntity).EntityId);
                // Reset the suggestedIssueTypeSubjectListViewModel.searchText = undefined for can trigger search when focus
                if (StringHelper.isNullOrEmpty(this._suggestedIssueTypeSubjectListViewModel.searchText))
                    this._suggestedIssueTypeSubjectListViewModel.searchText = undefined;
                this._suggestedIssueTypeSubjectListViewModel.issueTypeId = (<ap.models.projects.ChapterHierarchy>selectedIssueTypeVm.originalEntity).EntityId;
            }
            else {
                this._suggestedIssueTypeSubjectListViewModel.issueTypeId = null;
            }
        }

        /**
         * Handle adding contact in charge event
         * @param event Event object containing user in charge entity and its index in the list
         */
        private _userInChargeAddedHandler(userInCharge: ap.viewmodels.projects.ContactItemViewModel) {
            if (this.issueTypeSelectorViewModel.selectedItem) {
                let sendCheckRequest: boolean = true;
                if (this.$utility.UserContext.UserPreferences) {
                    for (let userPreference of this.$utility.UserContext.UserPreferences) {
                        if (userPreference.Key === "ProposeInCharge") {
                            sendCheckRequest = false;
                            break;
                        }
                    }
                }
                if (sendCheckRequest && !StringHelper.isNullOrEmpty(userInCharge.userId)) {
                    // in case of a Company or Role, there is no userId, so we won't call the API because these values cannot be linked to an IssueType
                    this.$controllersManager.noteController.checkNeedAskLinkUserToIssueType(userInCharge.userId, this.issueTypeSelectorViewModel.selectedIssueTypeId).then((needToAsk) => {
                        if (needToAsk) {
                            let autoCompleteController = ($scope: angular.IScope) => {
                                let vm = new ap.viewmodels.notes.AutoCompleteInChargeViewModel(this.$utility, this.$mdDialog, this.$controllersManager);
                                vm.initData(userInCharge, <ap.viewmodels.projects.ChapterHierarchyItemViewModel>this.issueTypeSelectorViewModel.selectedItem);
                                $scope["vm"] = vm;
                            };
                            autoCompleteController.$inject = ["$scope"];
                            this.$mdDialog.show({
                                skipHide: true,
                                fullscreen: true,
                                multiple: true,
                                clickOutsideToClose: false,
                                templateUrl: "me/PartialView?module=Note&name=AutoCompleteInChargeDialog",
                                controller: autoCompleteController
                            });
                        }
                    });
                }
            }
        }

        /**
        * This method is used to keep the last selected meeting make by the user
        * @param selectedMeetingItemVm is the selected meeting
        **/
        private _meetingSelectorSelectedItemChanged(selectedMeetingItemVm: ap.viewmodels.meetings.MeetingItemViewModel) {
            if (selectedMeetingItemVm && selectedMeetingItemVm === this._createNewMeeting.item) {
                if (this.isForDetailPane) {
                    this._listener.raise("relatedentitycreationrequest", AddEditResponse.CreateMeeting);
                } else {
                    this.$mdDialog.hide(AddEditResponse.CreateMeeting);
                }
            } else if (selectedMeetingItemVm && selectedMeetingItemVm !== null) {
                this.$utility.Storage.Session.set("selectedMeetingId", [this.$controllersManager.mainController.currentProject().Id, selectedMeetingItemVm.meeting.Id]);
            }
        }

        /**
        * This method is used to set the selectedItem for the _meetingSelector when the selected meeting was set by default at the first time
        * @param selectedMeetingItemVm is the selected meeting
        **/
        private _meetingListViewModelSelectedItemChanged(selectedMeetingItemVm: ap.viewmodels.meetings.MeetingItemViewModel) {
            if (selectedMeetingItemVm && selectedMeetingItemVm !== null && this._meetingSelector.selectedItem === null)
                this._meetingSelector.selectedItem = selectedMeetingItemVm;
        }

        /**
         * Dispose method
         */
        public dispose() {
            this.stopContactDetailsWatcher();

            this.$utility.Translator.off("languagechanged", this.languageChangedHandler, this);

            this._noteDetailBaseVm.off("propertychanged", this._noteDetailsPropertyChanged, this);

            if (this._issueTypeSelectorVm) {
                this._issueTypeSelectorVm.dispose();
                this._issueTypeSelectorVm = null;
            }
            if (this._contactSelectorVm) {
                this._contactSelectorVm.dispose();
                this._contactSelectorVm = null;
            }
            if (this._meetingSelector) {
                this._meetingSelector.dispose();
                this._meetingSelector = null;
            }
            if (this._listener) {
                this._listener.clear();
                this._listener = null;
            }
        }

        public handleShortcutAction(actionName: string) {
            switch (actionName) {
                case "note.save":
                    if (this.canSave)
                        this.save(new ap.viewmodels.notes.SaveNoteParameters(true, null));
                    break;
            }
        }

        /**
         * Run watcher for contact details changes
         */
        private runContactDetailsWatcher() {
            this.stopContactDetailsWatcher();
            this._stopContactDetailsWatcher = this.$scope.$watchCollection(() => {
                return this._contactSelectorVm ? this._contactSelectorVm.selectedContacts : [];
            }, (newContacts: ap.viewmodels.projects.ContactItemViewModel[], oldContacts: ap.viewmodels.projects.ContactItemViewModel[]) => {
                if (oldContacts !== null && newContacts.length > oldContacts.length && this._issueTypeSelectorVm.selectedItem) {
                    this._userInChargeAddedHandler(newContacts[newContacts.length - 1]);
                }
            });
        }

        /**
         * Stop watcher for contact details changes
         */
        protected stopContactDetailsWatcher() {
            if (this._stopContactDetailsWatcher) {
                this._stopContactDetailsWatcher();
                this._stopContactDetailsWatcher = null;
            }
        }

        /**
         * This method use for init issueTypeSelector
         */
        protected initIssueTypeSelector() {
            let project = this.$controllersManager.mainController.currentProject();
            let user = this.$utility.UserContext.CurrentUser();
            let zeroId = ap.utility.UtilityHelper.createHierarchyGuid(ap.utility.UtilityHelper.createEmptyGuid());
            let issueType: ap.models.projects.ChapterHierarchy = new ap.models.projects.ChapterHierarchy(this.$utility);
            issueType.createByJson({ EntityId: zeroId, Id: zeroId, EntityName: "IssueType", Description: this.$utility.Translator.getTranslation("app.notes.edit.add_category"), IsPredefined: true });
            let issueTypeVm: ap.viewmodels.projects.ChapterHierarchyItemViewModel = new ap.viewmodels.projects.ChapterHierarchyItemViewModel(this.$utility, this.$q, undefined, undefined, true);
            issueTypeVm.init(issueType);

            this._addCategoryIssueType = new ap.viewmodels.PredefinedItemParameter(0, zeroId, issueTypeVm);

            let predefinedIssueType = [];
            if (this.$utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_ProjectIssueTypeConfig) && (project.Creator.Id === user.Id || project.UserAccessRight.CanConfig)) {
                predefinedIssueType.push(this._addCategoryIssueType);
            }

            this._issueTypeSelectorVm = new ap.viewmodels.projects.IssueTypeSelectorViewModel(this.$utility, this.$q, this.$controllersManager, this.$timeout, predefinedIssueType);
            if (this._noteDetailBaseVm.issueType) {
                this._issueTypeSelectorVm.searchedText = this._noteDetailBaseVm.issueType.Description;

                this._issueTypeSelectorVm.load().then((list: GenericPagedListViewModels) => {
                    this._issueTypeSelectorVm.selectIssueTypeById(this._noteDetailBaseVm.issueType.Id);
                    this._issueTypeSelectorVm.on("selectedItemChanged", this._issueTypeSelectedItemChanged, this);
                    this._contactSelectorVm = new ap.viewmodels.projects.ContactSelectorViewModel(this.$utility, this._api, this.$q, this.$controllersManager.mainController, this.$controllersManager.projectController);
                    if (this._noteDetailBaseVm.noteBase && this._noteDetailBaseVm.noteBase !== null)
                        this._contactSelectorVm.initUsers(this._noteDetailBaseVm.noteBase.NoteInCharge);
                    this.runContactDetailsWatcher();
                });
            } else {
                this._issueTypeSelectorVm.on("selectedItemChanged", this._issueTypeSelectedItemChanged, this);
                this._contactSelectorVm = new ap.viewmodels.projects.ContactSelectorViewModel(this.$utility, this._api, this.$q, this.$controllersManager.mainController, this.$controllersManager.projectController);
                if (this._noteDetailBaseVm.noteBase && this._noteDetailBaseVm.noteBase !== null)
                    this._contactSelectorVm.initUsers(this._noteDetailBaseVm.noteBase.NoteInCharge);
                this.runContactDetailsWatcher();
            }
        }

        /**
         * This method use for init meetingSelector
         */
        protected initMeetingSelector() {
            let zeroId = ap.utility.UtilityHelper.createEmptyGuid();
            let meeting = new ap.models.meetings.Meeting(this.$utility);
            meeting.createByJson({ Id: zeroId, Title: this.$utility.Translator.getTranslation("Create new list") });
            let meetingItemVm = new ap.viewmodels.meetings.MeetingItemViewModel(this.$utility, this.$q, undefined, undefined, true);
            meetingItemVm.init(meeting);
            this._createNewMeeting = new ap.viewmodels.PredefinedItemParameter(0, zeroId, meetingItemVm);
            this._meetingSelector = new meetings.MeetingSelectorViewModel(this.$utility, this.$q, this.$controllersManager, this.$timeout, true /*_onlyUserResponsible*/,
                (this._noteDetailBaseVm.noteBase === undefined || this._noteDetailBaseVm.noteBase === null || this._noteDetailBaseVm.noteBase.Meeting === undefined || this._noteDetailBaseVm.noteBase.Meeting === null) ? null : this._noteDetailBaseVm.noteBase.Meeting.Id, [this._createNewMeeting]);
            this._meetingSelector.on("selectedItemChanged", this._meetingSelectorSelectedItemChanged, this);
            this._meetingSelector.listVm.on("selectedItemChanged", this._meetingListViewModelSelectedItemChanged, this);
            // When add mode
            if (this._noteDetailBaseVm.noteBase === undefined || this._noteDetailBaseVm.noteBase === null || this._noteDetailBaseVm.noteBase.IsNew) {
                this.setDefaultSelectMeeting();
            }
            // When edit mode
            else if (!!this._noteDetailBaseVm.noteBase.Meeting) {
                // Select the meeting of the current note
                this._meetingSelector.selectItem(this._noteDetailBaseVm.noteBase.Meeting.Id);
            }
        }

        /**
         * This method use for set default value for meeting selector
         */
        public setDefaultSelectMeeting(): angular.IPromise<boolean> {
            let deferred: ng.IDeferred<boolean> = this.$q.defer();
            // To know the user has the Meeting module or not
            let hasMeetingModule = this.$utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_MeetingManagement);
            // The meeting will be select by default
            let selectMeetingId: string[];
            // When the user has the Meeting module
            if (hasMeetingModule) {
                // If we are add new point on the Meeting module -> select the current meeting by default
                if (this.$controllersManager.mainController.currentMeeting && this.$controllersManager.mainController.currentMeeting !== null)
                    selectMeetingId = [this.$controllersManager.mainController.currentProject().Id, this.$controllersManager.mainController.currentMeeting.Id];
                else // In entire project mode, check the last selected meeting make my the user
                    selectMeetingId = this.$utility.Storage.Session.get("selectedMeetingId");
                // If need to select a meeting by default, select this meeting
                if (selectMeetingId !== null && selectMeetingId[0] === this.$controllersManager.mainController.currentProject().Id && selectMeetingId[1] !== null) {
                    this._meetingSelector.selectMeetingById(selectMeetingId[1]);
                    deferred.resolve(true);
                } else {
                    this._meetingSelector.load().then((list: GenericPagedListViewModels) => {
                        this._meetingSelector.selectItem(!!this._createNewMeeting ? list.sourceItems[1].originalEntity.Id : list.sourceItems[0].originalEntity.Id);
                        deferred.resolve(true);
                    }).catch(() => {
                        deferred.reject();
                    });
                }
            }
            else {
                // The user have not the module MeetingManagement -> Auto select first system private meeting
                this._meetingSelector.load().then((list: GenericPagedListViewModels) => {
                    this._meetingSelector.selectItem(!!this._createNewMeeting ? list.sourceItems[1].originalEntity.Id : list.sourceItems[0].originalEntity.Id);
                    deferred.resolve(true);
                }).catch(() => {
                    deferred.reject();
                });
            }
            return deferred.promise;
        }

        /**
         * Translation change handler, executed when app language have been changed
         */
        private languageChangedHandler() {
            if (this._addCategoryIssueType) {
                let addIssueTypeVm = <ap.viewmodels.projects.ChapterHierarchyItemViewModel>this._addCategoryIssueType.item;
                addIssueTypeVm.description = this.$utility.Translator.getTranslation("app.notes.edit.add_category");
            }
            if (this._createNewMeeting) {
                let addNewMeetingVm = <ap.viewmodels.meetings.MeetingItemViewModel>this._createNewMeeting.item;
                addNewMeetingVm.title = this.$utility.Translator.getTranslation("Create new list");
            }
            if (this._noteDetailBaseVm.noteBase) {
                this._editTitleMessage = this.$utility.Translator.getTranslation("app.addEditNote.editTitle").format(this._noteDetailBaseVm.noteBase.Code);
            }
        }

        /**
         * Method use to init the viewModel
         */
        public init(notedetailbase: ap.viewmodels.notes.NoteDetailBaseViewModel) {
            if (!!this._noteDetailBaseVm) {
                this._noteDetailBaseVm.off("propertychanged", this._noteDetailsPropertyChanged, this);
            }
            if (!!notedetailbase) {
                notedetailbase.off("propertychanged", this._noteDetailsPropertyChanged, this);
            }
            this._noteDetailBaseVm = notedetailbase;
            this.updateMeetingAccess();
            this._noteDetailBaseVm.on("propertychanged", this._noteDetailsPropertyChanged, this);

            this._editTitleMessage = null;
            if (this._noteDetailBaseVm.noteBase) { // case when created a new point
                this._editTitleMessage = this.$utility.Translator.getTranslation("app.addEditNote.editTitle").format(this._noteDetailBaseVm.noteBase.Code);
            }

            let defaultSearchText = undefined;
            if (this._noteDetailBaseVm && this._noteDetailBaseVm.noteBase && this._noteDetailBaseVm.noteBase !== null && this._noteDetailBaseVm.noteBase.Subject !== null) {
                defaultSearchText = this._noteDetailBaseVm.noteBase.Subject;
                this._lastSubject = this._noteDetailBaseVm.noteBase.Subject;
            }
            this._suggestedIssueTypeSubjectListViewModel = new ap.viewmodels.projects.SuggestedIssueTypeSubjectListViewModel(this.$utility, this.$q, this.$controllersManager, defaultSearchText);

            this.initIssueTypeSelector();
            this.initMeetingSelector();

            this._noteDetailBaseVm.isEditMode = true; // When this view model is used is to edit or a point then, go to edit mode

        }

        on(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.on(eventName, callback, caller);
        }
        off(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.off(eventName, callback, caller);
        }

        /**
         * This metod return true if browser IE
         */
        public get isIE() {
            return this.$utility.isIE();
        }

        static $inject = ["Utility", "$mdDialog", "$q", "Api", "$timeout", "$scope", "ControllersManager", "ServicesManager"];
        constructor(protected $utility: ap.utility.UtilityHelper, protected $mdDialog: angular.material.IDialogService, protected $q: angular.IQService, protected _api: ap.services.apiHelper.Api, protected $timeout: angular.ITimeoutService, protected $scope: ng.IScope,
            protected $controllersManager: ap.controllers.ControllersManager, protected $servicesManager: ap.services.ServicesManager, noteDetailBaseVm: ap.viewmodels.notes.NoteDetailBaseViewModel = null, protected _document: ap.models.documents.Document = null, protected isForNoteModule: boolean = true, protected _isforNoteDetail: boolean = false, protected isFirstInit: boolean = false) {
            let project = $controllersManager.mainController.currentProject();
            let user = $utility.UserContext.CurrentUser();
            let zeroId = ap.utility.UtilityHelper.createHierarchyGuid(ap.utility.UtilityHelper.createEmptyGuid());
            this.$utility.Translator.on("languagechanged", this.languageChangedHandler, this);
            this._listener = this.$utility.EventTool.implementsListener(["relatedentitycreationrequest"]);
        }

        protected _listener: ap.utility.IListenerBuilder;
        protected _shortcutActions: ap.viewmodels.home.ActionViewModel[];
        protected _lastSubject: string; // use for escape
        protected _noteDetailBaseVm: ap.viewmodels.notes.NoteDetailBaseViewModel;
        private _issueTypeSelectorVm: ap.viewmodels.projects.IssueTypeSelectorViewModel;
        private _contactSelectorVm: ap.viewmodels.projects.ContactSelectorViewModel;
        private _suggestedIssueTypeSubjectListViewModel: ap.viewmodels.projects.SuggestedIssueTypeSubjectListViewModel;
        private _meetingSelector: ap.viewmodels.meetings.MeetingSelectorViewModel;
        public datePickerisOpened: boolean = false;
        private _addCategoryIssueType: ap.viewmodels.PredefinedItemParameter;
        private _createNewMeeting: ap.viewmodels.PredefinedItemParameter;
        protected _saveRequested: boolean = false;
        private _stopContactDetailsWatcher: any;
        protected _editTitleMessage: string;
        private _canEditMeeting: boolean;
        private _hasEditMeeting: boolean;
        protected _isEditForm: boolean = false;
    }
}