module ap.viewmodels.forms.templates {

    export enum DownloadFormTemplateType {
        FormTemplate, // The format of the excel should be the one with columns of Form Template (normal export)
        Form // The format of the excel should be the one with with columns of Form (pre-filled with values of selected template)
    }
    export class DownloadTemplatesViewModel implements IDispose {

        public get listWorkspaceVm(): FormTemplateListViewModel {
            return this._listWorkspaceVm;
        }

        public get canDownload(): boolean {
            return this._canDownload;
        }

        public get countCheckedTemplates(): number {
            return this._countCheckedTemplates;
        }

        public dispose() {
            if (this._listWorkspaceVm) {
                this._listWorkspaceVm.off("isCheckedChanged", this.checkCanDownload, this);
            }
        }

        /**
         * Handler for download selected form templates
         */
        public download() {
            let formTemplateIds: string[] = this._listWorkspaceVm.listVm.getCheckedItems().map((item) => { return item.originalEntity.Id; });
            switch (this._type) {
                case DownloadFormTemplateType.FormTemplate:
                    this.$controllersManager.formController.downloadFormTemplatesExcelFile(this.listWorkspaceVm.checkedIds);
                    break;
                case DownloadFormTemplateType.Form:
                    this.$controllersManager.formController.generateFormExcelFromTemplate(this.listWorkspaceVm.checkedIds);
            }
            this.listWorkspaceVm.closeMultiActions();
            this.$mdDialog.cancel();
        }

        /**
         * This method use for set counter of checked items and correct set canDownload
         */
        private checkCanDownload() {
            this._countCheckedTemplates = this._listWorkspaceVm.checkedIds.length;
            this._canDownload = this._countCheckedTemplates > 0;
        }

        constructor(private $utility: ap.utility.UtilityHelper, private _api: ap.services.apiHelper.Api, private $q: angular.IQService, private $timeout: angular.ITimeoutService, private $scope: angular.IScope,
            private $controllersManager: ap.controllers.ControllersManager, private $mdDialog: angular.material.IDialogService, private _type: DownloadFormTemplateType = DownloadFormTemplateType.FormTemplate) {
            this._listWorkspaceVm = new FormTemplateListViewModel(this.$scope, this.$utility, this._api, this.$q, this.$timeout, this.$controllersManager, true);
            this._listWorkspaceVm.on("isCheckedChanged", this.checkCanDownload, this);
            this._listWorkspaceVm.load();
            this.$scope.$on("$destroy", this.dispose);
        }

        private _listWorkspaceVm: FormTemplateListViewModel = null;
        private _canDownload: boolean = false;
        private _countCheckedTemplates: number = 0;
    }
}