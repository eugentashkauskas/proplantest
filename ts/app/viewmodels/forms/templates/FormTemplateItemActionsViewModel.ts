module ap.viewmodels.forms.templates {
    export class FormTemplateItemActionsViewModel implements IDispose {

        public get actions() {
            return this._actions;
        }

        /**
         * Actions click handler method
         * @param actionName Action name string
         */
        public actionClick(actionName: string) {
            switch (actionName) {
                case "archiveformtemplate":
                    this.$formController.archiveFormTemplate(this._item.originalTemplate);
                    break;
                case "unarchiveformtemplate":
                    this.$formController.unarchiveFormTemplate(this._item.originalTemplate);
                    break;
                case "editformtemplate":
                    this.$formController.requestEditFormTemplate(this._item.originalTemplate);
                    break;
                case "previewformtemplate":
                    this.$formController.requestFormTemplatePreview(this._item.originalTemplate);
                    break;
            }
        }

        dispose() {
            this.$formController.off("formtemplatearchived", this.archiveTemplateHandler, this);
            this.$formController.off("formtemplateunarchived", this.archiveTemplateHandler, this);
            this._item.off("originalEntity", this.computeActionsVisibility, this);
        }

        /**
         * Compute actions visibility and enabled state
         */
        private computeActionsVisibility() {
            let isManager = this.$companyController.isCurrentUserAtLeastManager();
            this._archiveAction.isVisible = isManager && !this._item.originalTemplate.IsArchived;
            this._archiveAction.isEnabled = isManager && !this._item.originalTemplate.IsArchived;
            this._unarchiveAction.isVisible = isManager && this._item.originalTemplate.IsArchived;
            this._unarchiveAction.isEnabled = isManager && this._item.originalTemplate.IsArchived;
            this._editAction.isVisible = isManager;
            this._editAction.isEnabled = isManager;
        }

        /**
         * Archive template handler
         * @param formModel Form template entity
         */
        private archiveTemplateHandler(formModel: ap.models.forms.FormTemplate) {
            if (formModel.Id === this._item.originalEntity.Id) {
                let nbQuestions: number = this._item.questionsCount;
                this._item.init(formModel);
                this._item.questionsCount = nbQuestions; // set back the number of questions because this properly is not automatically returned by the API
                this.computeActionsVisibility();
            }
        }

        constructor(private _utility: ap.utility.UtilityHelper, private $companyController: ap.controllers.CompanyController, private $formController: ap.controllers.FormController, private _item: FormTemplateItemViewModel) {
            this._archiveAction = new ap.viewmodels.home.ActionViewModel(this._utility, _utility.EventTool, "archiveformtemplate", _utility.rootUrl + "Images/html/icons/ic_archive_black_48px.svg", false, null, "Archive template", false);
            this._unarchiveAction = new ap.viewmodels.home.ActionViewModel(this._utility, _utility.EventTool, "unarchiveformtemplate", _utility.rootUrl + "Images/html/icons/ic_unarchive_black_48px.svg", false, null, "Unarchive template", false);
            this._editAction = new ap.viewmodels.home.ActionViewModel(this._utility, _utility.EventTool, "editformtemplate", _utility.rootUrl + "Images/html/icons/ic_create_black_48px.svg", false, null, "Edit the template", false);
            this._previewAction = new ap.viewmodels.home.ActionViewModel(this._utility, this._utility.EventTool, "previewformtemplate", _utility.rootUrl + "Images/html/icons/ic_preview_black_48px.svg", true, null, "Preview", true);
            this._actions = [this._archiveAction, this._unarchiveAction, this._editAction, this._previewAction];
            this.computeActionsVisibility();
            this._item.on("propertychanged", this.computeActionsVisibility, this);
            this.$formController.on("formtemplatearchived", this.archiveTemplateHandler, this);
            this.$formController.on("formtemplateunarchived", this.archiveTemplateHandler, this);
        }

        private _archiveAction: ap.viewmodels.home.ActionViewModel;
        private _unarchiveAction: ap.viewmodels.home.ActionViewModel;
        private _editAction: ap.viewmodels.home.ActionViewModel;
        private _previewAction: ap.viewmodels.home.ActionViewModel;
        private _actions: ap.viewmodels.home.ActionViewModel[];

    }
}