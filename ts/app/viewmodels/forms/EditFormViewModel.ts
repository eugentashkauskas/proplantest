module ap.viewmodels.forms {

    export class EditFormViewModel extends ap.viewmodels.notes.EditNoteBaseViewModel {

        public get formDetailViewModel(): ap.viewmodels.forms.FormDetailViewModel {
            return <ap.viewmodels.forms.FormDetailViewModel>this._noteDetailBaseVm;
        }

        /**
         * This property will check if the user can save the Form. Means to check if the FormDetailVm has maySave = true and if there is changed in this vm. 
         **/
        public canSave(): boolean {
            let meetingOk: boolean = false;
            if (this.hasEditMeeting === false || (this.meetingSelector && this.meetingSelector.selectedItem && this.meetingSelector.selectedItem !== null)) {
                meetingOk = true;
            }
            return this.hasChanged && meetingOk && this.formDetailViewModel.form && this.formDetailViewModel.form.Status !== ap.models.forms.FormStatus.Done; /* cannot update a finalized form */
        }

        /**
         * Save the Form
         */
        public save() {
            if (this.formDetailViewModel && this.canSave()) {
                super.save();
                this.formDetailViewModel.postChanges();
                this.$controllersManager.formController.saveForm(this.formDetailViewModel.form);
            }
        }

        public dispose() {
            super.dispose();
            this.$controllersManager.formController.off("formupdated", this.formUpdatedHandler, this);
            this.formDetailViewModel.off("propertyChanged", this.formChangedHandler, this);
        }

        /**
         * Uodate form data when entity is updated
         * @param updatedForm Updated entity
         */
        private formUpdatedHandler(updatedForm: ap.models.forms.Form) {
            if (!this.isForDetailPane && !this._isForFormDetail) {
                this.formDetailViewModel.isEditMode = false;
                this.$mdDialog.hide(ap.viewmodels.notes.AddEditResponse.CloseAddEditPopup);
                this.stopContactDetailsWatcher();
            }
        }

        /**
         * Update edit title when form is changed
         * @param event Event arguments
         */
        private formChangedHandler(event: ap.viewmodels.base.PropertyChangedEventArgs) {
            switch (event.propertyName) {
                case "originalEntity":
                    this._editTitleMessage = this.formDetailViewModel && this.formDetailViewModel.form ? this.$utility.Translator.getTranslation("app.editForm.editTitle").format(this.formDetailViewModel.form.Code) : "";
                    break;
            }
        }

        static $inject = ["Utility", "$mdDialog", "$q", "Api", "$timeout", "$scope", "ControllersManager", "ServicesManager"];
        constructor($utility: ap.utility.UtilityHelper, $mdDialog: angular.material.IDialogService, $q: angular.IQService, _api: ap.services.apiHelper.Api, $timeout: angular.ITimeoutService, $scope: ng.IScope,
            $controllersManager: ap.controllers.ControllersManager, $servicesManager: ap.services.ServicesManager, formVm: ap.viewmodels.forms.FormDetailViewModel, document: ap.models.documents.Document = null, isForNoteModule: boolean = true, isforNoteDetail: boolean = false, isFirstInit: boolean = false, private _isForFormDetail: boolean = false) {
            super($utility, $mdDialog, $q, _api, $timeout, $scope, $controllersManager, $servicesManager, formVm, document, isForNoteModule, isforNoteDetail, isFirstInit);
            this._noteDetailBaseVm = formVm;
            this.init(this.formDetailViewModel);

            if (this.formDetailViewModel.form) {
                this._editTitleMessage = $utility.Translator.getTranslation("app.editForm.editTitle").format(this.formDetailViewModel.form.Code);
            }
            this.formDetailViewModel.on("propertyChanged", this.formChangedHandler, this);
            let saveAction: ap.viewmodels.home.ActionViewModel = new ap.viewmodels.home.ActionViewModel($utility, $utility.EventTool, "form.save", null, true, null, null, true, false, new ap.misc.Shortcut(KEY_CODE.ENTER));
            this._shortcutActions = [saveAction];

            this._isEditForm = true;

            this.$controllersManager.formController.on("formupdated", this.formUpdatedHandler, this);
        }
    }
}