module ap.viewmodels.folders {

    export class ImportFolderStructureViewModel implements IDispose {

        /**
        * Use to get the foderListVm of the selected project
        **/
        public get folderListVm(): ap.viewmodels.folders.FolderListViewModel {
            return this._folderListVm;
        }

        /**
        * Use to get the projectSelector
        **/
        public get projectSelector(): ap.viewmodels.projects.ProjectSelectorViewModel {
            return this._projectSelector;
        }

        /**
        * Method use to close the dialog
        **/
        public cancel(): void {
            this.$mdDialog.cancel();
        }

        /**
        * Method use to import the folders of the selected project
        **/
        public save(): void {
            this._servicesManager.folderService.importFolderStructure(this.projectSelector.selectedProjectId, this._controllersManager.mainController.currentProject().Id).then((result: ap.services.apiHelper.ApiResponse) => {
                this.$mdDialog.hide();
            });
        }

        /**
        * Method use to load the folderListVm with the new project selected
        **/
        private _projectSelectorSelectedItemChanged(): void {
            if (this._projectSelector.selectedItem && this.projectSelector.selectedItem.originalEntity) {
                this._folderListVm.projectId = this.projectSelector.selectedItem.originalEntity.Id;
            }
        }

        dispose(): void {
            if (this._projectSelector) {
                this._projectSelector.dispose();
                this._projectSelector = null;
            }

            if (this.folderListVm) {
                this._folderListVm.dispose();
                this._folderListVm = null;
            }
        }

        /**
         * Loads the projects list and thus initialize this Class
         */
        public load(): void {
            this.projectSelector.load().then(() => {
                // select the first project by default
                this._folderListVm = new ap.viewmodels.folders.FolderListViewModel(this.$scope, this._utility, this._api, this._controllersManager, this.$mdDialog, this.$q, this.$timeout, this._servicesManager, true);
                this._projectSelector.on("selectedItemChanged", this._projectSelectorSelectedItemChanged, this);

                this.projectSelector.selectedItem = this.projectSelector.listVm.sourceItems[0];
            });
        }

        constructor(private _utility: ap.utility.UtilityHelper, private _controllersManager: ap.controllers.ControllersManager, private _api: ap.services.apiHelper.Api, private $mdDialog: angular.material.IDialogService,
            private $q: angular.IQService, private $scope: ng.IScope, private $timeout: angular.ITimeoutService, private _servicesManager: ap.services.ServicesManager) {

            this._projectSelector = new ap.viewmodels.projects.ProjectSelectorViewModel(_utility, $q, _controllersManager, $timeout, true);

            // subscribe to $destroy otherwise the object is not properly dispose when the mdDialog is removed from the view
            $scope.$on("$destroy", () => {
                this.dispose();
            });
        }

        private _projectSelector: ap.viewmodels.projects.ProjectSelectorViewModel;
        private _folderListVm: ap.viewmodels.folders.FolderListViewModel;
    }
}