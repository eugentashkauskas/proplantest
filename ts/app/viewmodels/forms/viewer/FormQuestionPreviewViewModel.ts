module ap.viewmodels.forms.viewer {

    /**
     * This class represents a form template question at the form template preview screen
     */
    export class FormQuestionPreviewViewModel extends ap.viewmodels.forms.viewer.BaseQuestionPreviewViewModel {
        constructor(utility: ap.utility.UtilityHelper, $q: angular.IQService, parentListVm?: ap.viewmodels.BaseListEntityViewModel, itemParameters?: ItemConstructorParameter) {
            super(utility, $q, parentListVm, itemParameters);
        }
    }

}
