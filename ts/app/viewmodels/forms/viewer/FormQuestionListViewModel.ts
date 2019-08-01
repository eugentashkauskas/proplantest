module ap.viewmodels.forms.viewer {

    export class FormQuestionListViewModel extends GenericPagedListViewModels {
        constructor(Utility: ap.utility.UtilityHelper, controllersManager: ap.controllers.ControllersManager, $q: angular.IQService, private formTemplateId: string) {
            super(Utility, controllersManager.listController, $q, new GenericPagedListOptions(
                "FormQuestion", ap.viewmodels.forms.viewer.FormQuestionPreviewViewModel
            ), Filter.eq("FormTemplateID", formTemplateId));

            this._isDeferredLoadingMode = true;
        }
    }

}
