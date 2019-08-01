module ap.viewmodels.forms.viewer {

    export interface IFormTemplateViewStateParams extends angular.ui.IStateParamsService {
        id: string;
    }

    export class FormTemplateViewWorkspaceViewModel implements IDispose {
        /**
         * A view model of the form template being viewed
         */
        get formVm(): FormPreviewViewModel {
            return this._formVm;
        }

        /**
         * A view model of a form questions list
         */
        get listVm(): FormQuestionListViewModel {
            return this._listVm;
        }

        /**
         * An indicator of whether there is a form template loading error
         */
        get isLoadingError(): boolean {
            return this._isLoadingError;
        }

        /**
         * Closes the form preview screen and navigates back to the previous screen
         */
        public close() {
            this.controllersManager.uiStateController.changeFlowState(ap.controllers.MainFlow.FormTemplates);
        }

        /**
         * Initializes the form preview screen
         */
        private initView() {
            this._screenInfo = new ap.misc.ScreenInfo(this.utility, "formtemplateviewer", ap.misc.ScreenInfoType.List, null, null, null, null, true, false, true);
            this.controllersManager.uiStateController.updateScreenInfo(this._screenInfo);
            this.controllersManager.mainController.initScreen(this._screenInfo);
        }

        /**
         * Loads and initializes data needed to preview a requested form
         */
        private initData() {
            this._isLoadingError = false;

            this.controllersManager.formController.getFullFormTemplateById(this.$stateParams.id).then((formTemplate: ap.models.forms.FormTemplate) => {
                if (!formTemplate) {
                    // It is possible if a user doesn't have permissions to see a form with the given ID
                    this._isLoadingError = true;
                    return;
                }

                this._formVm = new FormPreviewViewModel(this.utility, null);
                this._formVm.init(formTemplate);

                this._listVm = new FormQuestionListViewModel(this.utility, this.controllersManager, this.$q, this.$stateParams.id);
            }, (error) => {
                this._isLoadingError = true;
            });
        }

        public dispose() {
        }

        static $inject = ["Utility", "$scope", "$stateParams", "ControllersManager", "$q"];
        constructor(private utility: ap.utility.UtilityHelper, private $scope: angular.IScope, private $stateParams: IFormViewStateParams,
            private controllersManager: ap.controllers.ControllersManager, private $q: angular.IQService
        ) {
            this.initView();
            this.initData();

            $scope.$on("$destroy", () => {
                this.dispose();
            });
        }

        private _screenInfo: ap.misc.ScreenInfo;
        private _formVm: FormPreviewViewModel;
        private _listVm: FormQuestionListViewModel;
        private _isLoadingError: boolean;
    }

}
