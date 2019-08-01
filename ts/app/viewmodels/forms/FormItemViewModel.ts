module ap.viewmodels.forms {

    export class FormItemViewModel extends ap.viewmodels.notes.NoteBaseItemViewModel implements IDispose {
        public status: string;
        public statusColor: string;
        public type: ap.models.forms.FormType;
        public isConform: boolean;
        public language: ap.models.identFiles.Language;
        public template: ap.models.forms.FormTemplate;
        public report: ap.models.documents.Document;
        public doneDate: Date;
        public formAccessRight: ap.models.accessRights.FormAccessRight;


        public set isSelected(isSelected: boolean) {
            this._isSelected = isSelected;
            this._formActionViewModel.withInfo = !isSelected;
        }

        public get isSelected() {
            return this._isSelected;
        }

        public get originalForm(): ap.models.forms.Form {
            return <ap.models.forms.Form>this.originalEntity;
        }

        public get formActionViewModel(): FormActionViewModel {
            return this._formActionViewModel;
        }

        public copySource(): void {
            super.copySource();
            if (this.originalEntity !== null) {
                this.formAccessRight = new ap.models.accessRights.FormAccessRight(this.$utility, this.originalForm);
                this.type = this.originalForm.Type;
                this.computeStatusFields();
                this.isConform = this.originalForm.IsConform;
                this.language = this.originalForm.Language;
                this.doneDate = this.originalForm.DoneDate;
            }
            this.buildActions();
        }

        /**
         * This method returns the value of of the item for a specific group field. 
         * @param groupName This is the name if the group: Date, DueDate, SubCategory, InCharge, None
         */
        public getGroupValue(groupName: string): string {
            let result = super.getGroupValue(groupName);
            if (StringHelper.isNullOrEmpty(groupName))
                return "";
            switch (groupName) {
                case "Status":
                    result = this.status;
            }
            return result;
        }

        /*
        * Handle click on actions
        * @param actionName name of defined ation
        * @param actionArgs arguments of the action
        */
        public actionClick(actionName: string, actionArgs?: any) {
            let action: ap.viewmodels.home.ActionViewModel;
            action = ap.viewmodels.home.ActionViewModel.getAction(this._formActionViewModel.actions, actionName);

            if (action && action.isEnabled) {
                switch (actionName) {
                    case "form.gotodetail":
                        this._controllers.formController.requestInfoForm(this.originalForm);
                        this._formActionViewModel.withInfo = true;
                        break;
                    case "form.preview":
                        this._controllers.formController.requestFormPreview(this.originalForm);
                        break;
                    case "form.edit":
                        this._controllers.formController.requestEditForm(this.originalForm);
                        break;
                    case "archiveform":
                        this._controllers.formController.archiveForm(this.originalForm);
                        break;
                    case "unarchiveform":
                        this._controllers.formController.unarchiveForm(this.originalForm);
                        break;
                    case "form.moveto":
                        this._controllers.formController.requestMoveForm(this.originalForm);
                }
            }
            if (!action)
                throw new Error("The action " + actionName + " is not available");
        }

        public dispose() {
            super.dispose();
        }

        private computeStatusFields() {
            if (this.originalEntity.Id !== ap.utility.UtilityHelper.createEmptyGuid()) {
                this.status = "app.formstatus." + ap.models.forms.FormStatus[this.originalForm.Status];

                switch (this.originalForm.Status) {
                    case ap.models.forms.FormStatus.Todo:
                        this.statusColor = "todo";
                        break;
                    case ap.models.forms.FormStatus.InProgress:
                        this.statusColor = "inprogress";
                        break;
                    case ap.models.forms.FormStatus.Done:
                        this.statusColor = "done";
                        break;
                }
            }
        }

        /**
        * Init the formActionViewModel
        **/
        private buildActions() {
            if (this._formActionViewModel && this._formActionViewModel.form) {
                if (this._formActionViewModel.form.Id !== this.originalForm.Id) {
                    this._formActionViewModel.dispose();
                    this._formActionViewModel = new FormActionViewModel(this.$utility, this.originalForm, this._controllers);
                } else {
                    this._formActionViewModel.updateForm(this.originalForm);
                }
            } else {
                this._formActionViewModel = new FormActionViewModel(this.$utility, this.originalForm, this._controllers);
            }
        }
        constructor(protected $utility: ap.utility.UtilityHelper, $q: angular.IQService, parentListVm: ap.viewmodels.BaseListEntityViewModel, protected parameters?: ap.viewmodels.notes.UserCommentItemConstructorParameter) {
            super($utility, $q, parentListVm, parameters);
        }

        private _formActionViewModel: FormActionViewModel;
    }
}