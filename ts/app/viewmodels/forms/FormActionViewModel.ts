module ap.viewmodels.forms {

    export class FormActionViewModel implements IDispose {

        /**
        * Public getter to form
        **/
        public get form(): ap.models.forms.Form {
            return this._form;
        }

        /**
        * Property to access the curent available actions
        **/
        public get actions(): ap.viewmodels.home.ActionViewModel[] {
            return this._actions;
        }

        public set withInfo(withInfo: boolean) {
            if (this._withInfo !== withInfo) {
                this._withInfo = withInfo;
                this.computeActionsVisibility();
            }
        }

        /*
        * Build available actions for a single document
        */
        private computeActionsVisibility(): void {
            this._archiveAction.isVisible = this._accessright.hasArchiveAccess;
            this._archiveAction.isEnabled = this._accessright.canArchive && this.form.Status !== ap.models.forms.FormStatus.Done;
            this._unarchiveAction.isVisible = this._accessright.hasUnarchiveAccess;
            this._unarchiveAction.isEnabled = this._accessright.canUnarchive && this.form.Status !== ap.models.forms.FormStatus.Done;
            this._editAction.isVisible = this._accessright.canEdit;
            this._editAction.isEnabled = this._accessright.canEdit && this.form.Status !== ap.models.forms.FormStatus.Done;
            this._moveToAction.isVisible = this._accessright.hasMoveList && this.form.Status !== ap.models.forms.FormStatus.Done;
            this._moveToAction.isEnabled = this._accessright.canMoveList && this.form.Status !== ap.models.forms.FormStatus.Done;

            if (this._withInfo === true) {
                this._infoAction.isVisible = true;
                this._infoAction.isEnabled = true;
                this._previewAction.isVisible = true;
                this._previewAction.isEnabled = true;
            } else {
                this._infoAction.isVisible = false;
                this._infoAction.isEnabled = false;
                this._previewAction.isVisible = true;
                this._previewAction.isEnabled = true;
            }
        }

        /**
        * This methode update the form
        **/
        public updateForm(form: ap.models.forms.Form) {
            if (form.Id !== this._form.Id) throw new Error("The form is not the same, cannot update it");
            this._form = form;
            this.computeActionsVisibility();
        }

        /**
        * Event handler when the form updated
        * @param e: FormUpdatedEvent
        **/
        private formUpdated(e: ap.models.forms.Form);
        private formUpdated(e: ap.controllers.NoteBaseUpdatedEvent);
        private formUpdated(e: any) {
            if (e instanceof ap.models.forms.Form)
                this._updateForm(<ap.models.forms.Form>e);
            else if (e instanceof ap.controllers.NoteBaseUpdatedEvent)
                this._updateForm(<ap.models.forms.Form>(<ap.controllers.NoteBaseUpdatedEvent>e).notes[0]);
        }

        /**
        * This will be called by notetUpdated a
        **/
        private _updateForm(form: ap.models.forms.Form): void {
            if (form && this._form && form.Id === this._form.Id) {
                this._accessright = new ap.models.accessRights.FormAccessRight(this._utility, form);
                if (form.EntityVersion !== this._form.EntityVersion || form.Deleted) {
                    this._form = form;
                    this.computeActionsVisibility();
                }
            }
        }

        public dispose() {
            this._controllersManager.formController.off("formupdated", this.formUpdated, this);
            this._controllersManager.formController.off("formarchived", this.formUpdated, this);
            this._controllersManager.formController.off("formunarchived", this.formUpdated, this);
            this._actions.forEach((action: ap.viewmodels.home.ActionViewModel) => action.dispose());
        }

        constructor(private _utility: ap.utility.UtilityHelper, private _form: ap.models.forms.Form, private _controllersManager: ap.controllers.ControllersManager, private _withInfo: boolean = true) {
            this._accessright = new ap.models.accessRights.FormAccessRight(_utility, _form);
            this._controllersManager.formController.on("formupdated", this.formUpdated, this);
            this._controllersManager.formController.on("formarchived", this.formUpdated, this);
            this._controllersManager.formController.on("formunarchived", this.formUpdated, this);

            this._infoAction = new ap.viewmodels.home.ActionViewModel(this._utility, _utility.EventTool, "form.gotodetail", _utility.rootUrl + "Images/html/icons/ic_info_black_48px.svg", true, null, "Info", false);
            this._previewAction = new ap.viewmodels.home.ActionViewModel(this._utility, this._utility.EventTool, "form.preview", _utility.rootUrl + "Images/html/icons/ic_preview_black_48px.svg", false, null, "Preview", false);
            this._editAction = new ap.viewmodels.home.ActionViewModel(this._utility, _utility.EventTool, "form.edit", _utility.rootUrl + "Images/html/icons/ic_create_black_48px.svg", true, null, "Edit", true);
            this._archiveAction = new ap.viewmodels.home.ActionViewModel(this._utility, _utility.EventTool, "archiveform", _utility.rootUrl + "Images/html/icons/ic_archive_black_48px.svg", false, null, "Archive the form", false);
            this._unarchiveAction = new ap.viewmodels.home.ActionViewModel(this._utility, _utility.EventTool, "unarchiveform", _utility.rootUrl + "Images/html/icons/ic_unarchive_black_48px.svg", false, null, "Unarchive the form", false);
            this._moveToAction = new ap.viewmodels.home.ActionViewModel(this._utility, this._utility.EventTool, "form.moveto", this._utility.rootUrl + "Images/html/icons/moveto.svg", false, null, "Move to", false);

            this._actions = [
                this._previewAction,
                this._editAction,
                this._infoAction,
                this._archiveAction,
                this._unarchiveAction,
                this._moveToAction
            ];

            this.computeActionsVisibility();
        }

        private _accessright: ap.models.accessRights.FormAccessRight;
        private _actions: ap.viewmodels.home.ActionViewModel[];
        private _infoAction: ap.viewmodels.home.ActionViewModel;
        private _previewAction: ap.viewmodels.home.ActionViewModel;
        private _editAction: ap.viewmodels.home.ActionViewModel;
        private _archiveAction: ap.viewmodels.home.ActionViewModel;
        private _unarchiveAction: ap.viewmodels.home.ActionViewModel;
        private _moveToAction: ap.viewmodels.home.ActionViewModel;
    }
}
