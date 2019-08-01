module ap.viewmodels.forms.templates {

    export class FormTemplatesWorkspaceViewModel implements IDispose {

        public dispose() {
            if (this._listWorkspaceVm) {
                this._listWorkspaceVm.dispose();
                this._listWorkspaceVm = null;
            }

            this.$controllersManager.formController.off("formtemplatepreviewrequest", this.handleFormTemplatePreviewRequest, this);
            this.$controllersManager.formController.off("editformtemplaterequest", this.openFormTemplateEdithandler, this);
        }

        /**
         * Get the list of FormTemplates
         */
        public get listWorkspaceVm(): FormTemplateListViewModel {
            return this._listWorkspaceVm;
        }

        /**
        * Public getter to know if the active predefined filter is set
        */
        public get hasActiveTemplates(): boolean {
            return this._hasActiveFilter;
        }

        /**
         * The Fab button (+) is visible if the user can add a point or he has a selected point on which he can add comment or doc
         **/
        private setFabButtonVisibility() {
            let action = this.listWorkspaceVm.screenInfo.addAction;
            if (action) {
                let canAddFomTemplates: boolean = this.$utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_Form_Template_Create) &&
                    this.$controllersManager.companyController.isCurrentUserAtLeastManager();
                action.isVisible = canAddFomTemplates;
                action.isEnabled = canAddFomTemplates;
            }
        }

        /**
         * Constructs a screen info for the form templates screen
         */
        private initView() {
            this._listWorkspaceVm.screenInfo.on("addactionclicked", this.addActionClick, this);
            if (this._listWorkspaceVm.screenInfo.mainSearchInfo.criterions.length === 0) {
                // If not default criterions defined, the default one should be the active points
                this._listWorkspaceVm.screenInfo.mainSearchInfo.addCriterion(this._listWorkspaceVm.screenInfo.mainSearchInfo.predefinedFilters[0]);
            }
            if (this._listWorkspaceVm.screenInfo.mainSearchInfo) {
                this._listWorkspaceVm.screenInfo.mainSearchInfo.on("criterionschanged", this._mainSearchChanged, this);
                this._updateHasActiveFormTemplates();
            }
        }

        /**
         * This private method is used to hanle criterionschanged event
         */
        private _mainSearchChanged() {
            if (this.$controllersManager.mainController.uiStateController.mainFlowState !== ap.controllers.MainFlow.FormTemplates) return;
            this._updateHasActiveFormTemplates();
            this._listWorkspaceVm.loadData();
        }

        /**
        * This method updates the hasActiveNotes property to know which predefined filter is selected
        */
        private _updateHasActiveFormTemplates() {
            if (this._listWorkspaceVm.screenInfo.mainSearchInfo.filterString !== null) {
                if (this._listWorkspaceVm.screenInfo.mainSearchInfo.hasPredefinedFilterCriterion("Archived"))
                    this._hasActiveFilter = false;
                else if (this._listWorkspaceVm.screenInfo.mainSearchInfo.hasPredefinedFilterCriterion("Active"))
                    this._hasActiveFilter = true;
                else
                    this._hasActiveFilter = null;
            } else {
                this._hasActiveFilter = null;
            }
        }

        /**
         * Opens the dialog to add new templates
         */
        private openAddNewTemplateDialog() {
            let addFormTemplateViewModel: ap.viewmodels.forms.templates.AddFormTemplateViewModel;
            let addNewTemplateController = ($scope: angular.IScope, $timeout: angular.ITimeoutService) => {
                addFormTemplateViewModel = new ap.viewmodels.forms.templates.AddFormTemplateViewModel(this.$utility, this.$mdDialog, this._api, this.$q, $timeout, $scope, this.$controllersManager);
                $scope["addNewTemplateDialog"] = addFormTemplateViewModel;
            };
            addNewTemplateController.$inject = ["$scope", "$timeout"];
            this.$mdDialog.show({
                clickOutsideToClose: false,
                templateUrl: "me/PartialView?module=Form/Templates&name=AddNewTemplateDialog",
                fullscreen: true,
                controller: addNewTemplateController
            }).then(() => {
                this.listWorkspaceVm.listVm.refresh();
            });
        }

        /**
         * This method is used to check and run showEditDialog
         * @param formTemplate data of FormTemplate model
         */
        private openFormTemplateEdithandler(formTemplate: ap.models.forms.FormTemplate) {
            if (!!formTemplate) {
                this.showEditDialog(formTemplate);
            }
        }

        private showEditDialog(formTemplate: ap.models.forms.FormTemplate) {
            let editFormTemplateViewModel: ap.viewmodels.forms.templates.EditFormTemplateViewModel = new ap.viewmodels.forms.templates.EditFormTemplateViewModel(this.$utility, this.$mdDialog, this._api, this.$q, this.$timeout, this.$scope, this.$controllersManager, formTemplate);
            let editFormTemplateController = ($scope: angular.IScope, $timeout: angular.ITimeoutService) => {
                $scope["editFormTemplateViewModel"] = editFormTemplateViewModel;
            };
            editFormTemplateController.$inject = ["$scope", "$timeout"];
            this.$mdDialog.show({
                clickOutsideToClose: true,
                preserveScope: true,
                templateUrl: "me/PartialView?module=Form/Templates&name=EditFormTemplateDialog",
                fullscreen: true,
                controller: editFormTemplateController
            });
        }

        /**
         * Handle click on the FAB button to add FormTemplate
         * @param addActionEvt
         */
        private addActionClick(addActionEvt: ap.controllers.AddActionClickEvent) {
            switch (addActionEvt.name) {
                case "formtemplate.addtemplate":
                    this.openAddNewTemplateDialog();
            }
        }

        /**
         * Handles the formtemplatepreviewrequest event of the FormController
         * @param formTemplate a form template to preview
         */
        private handleFormTemplatePreviewRequest(formTemplate: ap.models.forms.FormTemplate) {
            let params = new ap.controllers.FormViewFlowStateParam(this.$utility, formTemplate.Id);
            this.$controllersManager.uiStateController.changeFlowState(ap.controllers.MainFlow.FormTemplateView, params);
        }

        static $inject = ["Utility", "Api", "$q", "$timeout", "$mdDialog", "$scope", "ControllersManager"];
        constructor(private $utility: ap.utility.UtilityHelper, private _api: ap.services.apiHelper.Api, private $q: angular.IQService, private $timeout: angular.ITimeoutService, private $mdDialog: angular.material.IDialogService, private $scope: angular.IScope, private $controllersManager: ap.controllers.ControllersManager) {
            this._listWorkspaceVm = new FormTemplateListViewModel(this.$scope, this.$utility, this._api, this.$q, this.$timeout, this.$controllersManager);
            this.$controllersManager.formController.on("editformtemplaterequest", this.openFormTemplateEdithandler, this);
            this.$scope.$on("$destroy", () => {
                this.dispose();
            });
            this.$controllersManager.companyController.loadManagedCompany().then(() => {
                this.initView();
                this.setFabButtonVisibility();
                $controllersManager.mainController.initScreen(this._listWorkspaceVm.screenInfo);

            });
            this.$controllersManager.formController.on("formtemplatepreviewrequest", this.handleFormTemplatePreviewRequest, this);
        }
        private _hasActiveFilter: boolean = false;
        private _listWorkspaceVm: FormTemplateListViewModel;
        private _canUploadTemplate: boolean = true;
        private _hasActiveFormTemplates: boolean = null;
    }
}
