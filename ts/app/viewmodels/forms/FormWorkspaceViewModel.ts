namespace ap.viewmodels.forms {
    export class FormWorkspaceViewModel extends ap.viewmodels.notes.NoteBaseWorkspaceViewModel {

        /**
         * Getter of the public formListVm property
         */
        public get formListVm(): FormListViewModel {
            return <FormListViewModel>this._noteBaseListVm;
        }

        /**
         * The setter is empty because needed by angular but we cannot erase the value of this property
         **/
        public set formListVm(val: FormListViewModel) {

        }

        /**
        * Getter  of the public NoteDetailVm property
        */
        public get formDetailVm(): FormDetailViewModel {
            return <ap.viewmodels.forms.FormDetailViewModel>this._noteDetailBaseVm;
        }

        /**
        * Returns the noteAccessRight entity of the selected note of the notes list
        */
        private get formAccessRight(): ap.models.accessRights.FormAccessRight {
            return this.selectedFormViewModel ? this.selectedFormViewModel.formAccessRight : null;
        }

        /**
        * Property used to edit form meta data
        */
        public get editFormVm(): ap.viewmodels.forms.EditFormViewModel {
            return this._editFormVm;
        }

        public set editFormVm(editFormVm: ap.viewmodels.forms.EditFormViewModel) { }

        /**
        * Getter of the isFormDetailOpened property
        */
        public get isFormDetailOpened(): boolean {
            return this._isFormDetailOpened;
        }

        /**
         * The setter of the isFormDetailOpened property
         **/
        public set isFormDetailOpened(val: boolean) {
            if (val !== this._isFormDetailOpened) {
                this._isFormDetailOpened = val;
            }
        }

        public get showDetailPaneBusy(): boolean {
            return this._showDetailPaneBusy;
        }

        /**
         * This method made info form pane is closed
         */
        public closeInfoPane() {
            if (<FormItemViewModel>this.formListVm.listVm.selectedViewModel) {
                (<FormItemViewModel>this.formListVm.listVm.selectedViewModel).formActionViewModel.withInfo = true;
            }
            this.isFormDetailOpened = false;
            this.clearDetails();
        }

        public canEdit(): boolean {
            return !this.formDetailVm.isEditMode && !!this.formAccessRight && this.formAccessRight.canEdit;
        }

        /**
        * This method will update the view of the form workspace to display list, detail... 
        */
        private initView() {
            this._noteBaseListVm = new FormListViewModel(this.$scope, this.$utility, this.$api, this.$controllersManager, this.$q, this.$servicesManager, this.$timeout, this.$mdDialog, this._isForNoteModule);
            this._noteBaseListVm.initList();
            this._noteBaseListVm.on("itemSelected", this.onFormSelected, this);
            this.$controllersManager.mainController.initScreen(this._noteBaseListVm.screenInfo);
            this._noteDetailBaseVm = new FormDetailViewModel(this.$utility, this.$mdDialog, this.$q, this.$api, this.$controllersManager, this.$servicesManager, null, this.$location, this.$anchorScroll, this.$interval, this.$scope, this.$timeout);
            this._editFormVm = new ap.viewmodels.forms.EditFormViewModel(this.$utility, this.$mdDialog, this.$q, this.$api, this.$timeout, this.$scope, this.$controllersManager, this.$servicesManager, this.formDetailVm, null, false, true, true);
            // send Segment.IO event
            let paramValue: string = this.$controllersManager.mainController.currentMeeting === null ? "projects" : "lists";
            this.$servicesManager.toolService.sendEvent("cli-menu-open forms", new Dictionary([new KeyValue("cli-menu-open forms-screenname", paramValue)]));
            this._noteBaseListVm.screenInfo.on("addactionclicked", this.addActionClickedHandler, this);
        }

        /**
        * Returns the selected note viewmodel from the notes list
        /**
         * This is the handler when the user clicks on a button of add actions
         * @param action
         */
        private addActionClickedHandler(action: ap.controllers.AddActionClickEvent) {
            let actionName = action.name;
            switch (actionName) {
                case "form.importform":
                    this.openImportFormDialog();
                    break;
            }
        }

        /**
         * Opens the dialog to import new forms
         */
        private openImportFormDialog() {
            let importFormViewModel: ap.viewmodels.forms.ImportFormViewModel;
            let importFormController = ($scope: angular.IScope, $timeout: angular.ITimeoutService) => {
                importFormViewModel = new ap.viewmodels.forms.ImportFormViewModel(this.$utility, this.$mdDialog, this.$api, this.$q, $timeout, $scope, this.$controllersManager);
                $scope["importFormDialog"] = importFormViewModel;
            };
            importFormController.$inject = ["$scope", "$timeout"];
            this.$mdDialog.show({
                clickOutsideToClose: false,
                templateUrl: "me/PartialView?module=Form&name=ImportFormDialog",
                fullscreen: true,
                controller: importFormController
            }).then((result) => {
                if (result)
                    this.formListVm.listVm.refresh();
            });
        }

        /**
         * Handler method called when the project changes
         */
        private get selectedFormViewModel(): ap.viewmodels.forms.FormItemViewModel {
            if (this._noteBaseListVm && this._noteBaseListVm.listVm && this._noteBaseListVm.listVm.selectedViewModel)
                return <ap.viewmodels.forms.FormItemViewModel>this._noteBaseListVm.listVm.selectedViewModel;
            else
                return null;
        }

        /**
        * This method used to clear the details part 
        **/
        private clearDetails() {
            if (this.formDetailVm && this.formDetailVm !== null)
                this.formDetailVm.clear();
        }


        /**
         * Handler method called when the project changes
         */
        private currentProjectChangedHandler() {
            if (!!this.$controllersManager.mainController.currentProject() && this.$controllersManager.mainController.currentMeeting !== undefined) {
                this.initView();
                this.$controllersManager.uiStateController.off("mainflowstatechanged", this.currentProjectChangedHandler, this);
            }
        }

        /**
         * Handler method called when the event 'editformrequest' is recieved from the FormController
         * @param form The form to edit
         */
        private editFormRequestHandler(form: ap.models.forms.Form) {
            if (form) {
                if (!this.formDetailVm.form || form.Id !== this.formDetailVm.form.Id || this.formDetailVm.needReloadEntity) {
                    if (this._editFormVm && !this._editFormVm.isForDetailPane) {
                        this._editFormVm.dispose();
                    }
                    this.formDetailVm.loadForm(form.Id).then(() => {
                        this.initializeEditFormVm();
                        this.showAddEditDialog(this.editFormVm, this._dialogOpening, this.formDetailVm);
                    });
                } else {
                    this.initializeEditFormVm();
                    this.showAddEditDialog(this.editFormVm, this._dialogOpening, this.formDetailVm);
                }
            }
        }

        /*
        * Initialize the EditFormViewModel property with the curent FormViewModel
        */
        private initializeEditFormVm() {
            if (this._editFormVm && !this._editFormVm.isForDetailPane) {
                this._editFormVm.dispose();
            }
            this._editFormVm = new ap.viewmodels.forms.EditFormViewModel(this.$utility, this.$mdDialog, this.$q, this.$api, this.$timeout, this.$scope, this.$controllersManager, this.$servicesManager, this.formDetailVm, null, false, false, false, false);
        }

        private openFormInfoHandler(form: ap.models.forms.Form) {
            this.toggleRight(form);
            this.formDetailVm.loadForm(form.Id);
        }

        /**
         * Handles form preview requests from the FormController
         * @param form a form to display a preview for
         */
        private formPreviewHandler(form: ap.models.forms.Form) {
            let params = new ap.controllers.FormViewFlowStateParam(this.$utility, form.Id);
            this.$controllersManager.uiStateController.changeFlowState(ap.controllers.MainFlow.FormView, params);
        }

        /**
         * An event handler for a form selection event of the FormListViewModel
         * It is responsible for displaying a panel with meta info of the selected form
         */
        private onFormSelected() {
            let newFormVm = <ap.viewmodels.forms.FormItemViewModel>this._noteBaseListVm.listVm.selectedViewModel;
            if (!newFormVm) {
                return;
            }
            if (this.isFormDetailOpened && newFormVm.originalForm) {
                let oldForm = this.formDetailVm.form;
                if (!this.formDetailVm.form || oldForm.Id !== newFormVm.originalForm.Id) {
                    this.formDetailVm.loadForm(newFormVm.originalForm.Id);
                }
            }
        }

        /**
         * Manage the detail pane visibility
         * @param formItem The Form that should be displayed in the Form detail pane
         */
        public toggleRight(form: ap.models.forms.Form) {
            if (form !== null && form !== undefined) {
                if (this.formListVm.listVm.selectedViewModel && this.formListVm.listVm.selectedViewModel.originalEntity.Id !== form.Id) {
                    this._isFormDetailOpened = true;
                }
                else {
                    this._isFormDetailOpened = !this.isFormDetailOpened;
                }
                this.formListVm.selectEntity(form.Id);
                if ((<ap.viewmodels.forms.FormItemViewModel>this.formListVm.listVm.selectedViewModel).formActionViewModel) {
                    (<ap.viewmodels.forms.FormItemViewModel>this.formListVm.listVm.selectedViewModel).formActionViewModel.withInfo = !this.isFormDetailOpened;
                }
            }
        }

        public dispose() {
            this.$controllersManager.uiStateController.off("mainflowstatechanged", this.currentProjectChangedHandler, this);
            this.$controllersManager.formController.off("infoformrequest", this.openFormInfoHandler, this);
            this.$controllersManager.formController.off("editformrequest", this.editFormRequestHandler, this);
            this.$controllersManager.formController.off("formpreviewrequest", this.formPreviewHandler, this);
            this.$controllersManager.formController.off("moveformrequest", this.moveFormHandler, this);

            if (this._noteBaseListVm) {
                this._noteBaseListVm.dispose();
                this._noteBaseListVm = null;
            }
            if (this._noteDetailBaseVm) {
                this._noteDetailBaseVm.dispose();
                this._noteDetailBaseVm = null;
            }
            if (this._editFormVm) {
                this._editFormVm.dispose();
                this._editFormVm = null;
            }
            this.$api.off("showdetailbusy", this.changeVisibleDetailPaneBusy, this);
            this.$mdDialog.cancel();
        }

        private changeVisibleDetailPaneBusy(showBusy: boolean) {
            this._showDetailPaneBusy = showBusy;
        }

        /**
         * Handler method called when 'moveformrequest' event is received from FormController
         * @param form The Form entity to move
         */
        private moveFormHandler(form: ap.models.forms.Form) {
            if (!this.formListVm.listVm.selectedViewModel || this.formListVm.listVm.selectedViewModel.originalEntity.Id !== form.Id)
                this.formListVm.listVm.selectEntity(form.Id);
            this.formListVm.openMeetingSelectorDialog().then((meetingVm: ap.viewmodels.meetings.MeetingItemViewModel) => {
                this.formListVm.selectedMeetingItem = null;
                let formVm = <ap.viewmodels.forms.FormItemViewModel>this.formListVm.listVm.selectedViewModel;
                this.$controllersManager.formController.moveFormTo(formVm.originalForm, meetingVm.meeting).then((updatedForm: ap.models.forms.Form) => {
                    if (this.$controllersManager.mainController.currentMeeting) {
                        formVm.isMoved = true;
                        this.isFormDetailOpened = false;
                    } else {
                        formVm.originalForm.Meeting.Title = meetingVm.title;
                        formVm.copySource();
                    }
                });
            });
        }

        static $inject = ["$scope", "$mdSidenav", "Utility", "Api", "$q", "$mdDialog", "$timeout", "$location", "$anchorScroll", "$interval", "ControllersManager", "ServicesManager"];
        constructor(scope: ng.IScope, mdSidenav: angular.material.ISidenavService, utility: ap.utility.UtilityHelper, api: ap.services.apiHelper.Api, q: angular.IQService, mdDialog: angular.material.IDialogService,
            timeout: angular.ITimeoutService, location: angular.ILocationService, anchorScroll: angular.IAnchorScrollService, interval: angular.IIntervalService, controllersManager: ap.controllers.ControllersManager,
            servicesManager: ap.services.ServicesManager, isForNoteModule: boolean = true) {
            super(scope, mdSidenav, utility, api, q, mdDialog, timeout, location, anchorScroll, interval, controllersManager, servicesManager, undefined, isForNoteModule);
            if (this.$controllersManager.mainController.currentProject() && this.$controllersManager.mainController.currentMeeting !== undefined) {
                this.initView();
            } else {
                this.$controllersManager.uiStateController.on("mainflowstatechanged", this.currentProjectChangedHandler, this);
            }
            // Load the meeting accessright and check actions
            if (this.$controllersManager.mainController.currentMeeting !== null && this.$controllersManager.mainController.currentMeeting !== undefined) {
                this.$controllersManager.accessRightController.getMeetingAccessRight(this.$controllersManager.mainController.currentMeeting.Id).then((meetingAccessRight: ap.models.accessRights.MeetingAccessRight) => {
                    this._meetingAccessRight = meetingAccessRight;
                });
            }

            this.$controllersManager.formController.on("infoformrequest", this.openFormInfoHandler, this);
            this.$controllersManager.formController.on("editformrequest", this.editFormRequestHandler, this);
            this.$controllersManager.formController.on("formpreviewrequest", this.formPreviewHandler, this);
            this.$controllersManager.formController.on("moveformrequest", this.moveFormHandler, this);
            this.$api.on("showdetailbusy", this.changeVisibleDetailPaneBusy, this);
            this.$scope.$on("$destroy", () => {
                this.dispose();
            });
        }
        private _editFormVm: ap.viewmodels.forms.EditFormViewModel;
        private _meetingAccessRight: ap.models.accessRights.MeetingAccessRight = null;
        private _isFormDetailOpened: boolean = false;
        private _showDetailPaneBusy: boolean = false;
        private _dialogOpening: boolean = false;
    }
}