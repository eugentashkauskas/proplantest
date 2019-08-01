module ap.viewmodels.forms.viewer {

    export interface IFormViewStateParams extends angular.ui.IStateParamsService {
        id: string;
    }

    export class FormViewWorkspaceViewModel implements IDispose {
        /**
         * A view model of the form being viewed
         */
        get formVm(): FormPreviewViewModel {
            return this._formVm;
        }

        /**
         * A view model of a form items list
         */
        get listVm(): FormItemListViewModel {
            return this._listVm;
        }

        /**
         * An indicator of whether there is a form loading error
         */
        get isLoadingError(): boolean {
            return this._isLoadingError;
        }

        /**
         * Closes the form preview screen and navigates back to the previous screen
         */
        public close() {
            if (this.controllersManager.mainController.currentProject()) {
                // A correct MeetingId should be set automatically by the UIStateController
                this.controllersManager.uiStateController.changeFlowState(ap.controllers.MainFlow.Forms);
            } else {
                this.controllersManager.uiStateController.changeFlowState(ap.controllers.MainFlow.Projects);
            }
        }

        /**
         * Initializes the form preview screen
         */
        private initView() {
            this._screenInfo = new ap.misc.ScreenInfo(this.utility, "formviewer", ap.misc.ScreenInfoType.List, null, null, null, null, true, false, true);
            this.controllersManager.uiStateController.updateScreenInfo(this._screenInfo);
            this.controllersManager.mainController.initScreen(this._screenInfo);
        }

        /**
         * Loads and initializes data needed to preview a requested form
         */
        private initData() {
            this._isLoadingError = false;

            this.controllersManager.formController.getFullFormById(this.$stateParams.id).then((form: ap.models.forms.Form) => {
                if (!form) {
                    // It is possible if a user doesn't have permissions to see a form with the given ID
                    this._isLoadingError = true;
                    return;
                }

                this._formVm = new FormPreviewViewModel(this.utility, null);
                this._formVm.init(form);

                this._listVm = new FormItemListViewModel(this.utility, this.controllersManager, this.$q, this.$stateParams.id);
            }, (error) => {
                this._isLoadingError = true;
            });
        }

        dispose() {
        }

        static $inject = ["Utility", "$scope", "$stateParams", "ControllersManager", "$q"];
        constructor(private utility: ap.utility.UtilityHelper, private $scope: angular.IScope, private $stateParams: IFormViewStateParams,
            private controllersManager: ap.controllers.ControllersManager, private $q: angular.IQService
        ) {
            this.initView();
            this.initData();

            this._formVm = null;
            this._listVm = null;

            $scope.$on("$destroy", () => {
                this.dispose();
            });
        }

        private _screenInfo: ap.misc.ScreenInfo;
        private _formVm: FormPreviewViewModel;
        private _listVm: FormItemListViewModel;
        private _isLoadingError: boolean;
    }

}
