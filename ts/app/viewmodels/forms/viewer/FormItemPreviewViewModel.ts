module ap.viewmodels.forms.viewer {

    /**
     * This class represents a form question at the form preview screen
     */
    export class FormItemPreviewViewModel extends ap.viewmodels.forms.viewer.BaseQuestionPreviewViewModel {
        constructor(utility: ap.utility.UtilityHelper, $q: angular.IQService, parentListVm?: ap.viewmodels.BaseListEntityViewModel, itemParameters?: ItemConstructorParameter) {
            super(utility, $q, parentListVm, itemParameters);
        }
    }

}
