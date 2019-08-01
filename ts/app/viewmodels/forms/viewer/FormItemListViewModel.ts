module ap.viewmodels.forms.viewer {

    export class FormItemListViewModel extends GenericPagedListViewModels {
        constructor(Utility: ap.utility.UtilityHelper, controllersManager: ap.controllers.ControllersManager, $q: angular.IQService, private formId: string) {
            super(Utility, controllersManager.listController, $q, new GenericPagedListOptions(
                "FormItem", ap.viewmodels.forms.viewer.FormItemPreviewViewModel
            ), Filter.eq("FormId", formId));

            this._isDeferredLoadingMode = true;
        }
    }

}
