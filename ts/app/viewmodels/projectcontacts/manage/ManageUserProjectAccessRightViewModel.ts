module ap.viewmodels.projectcontacts {
    export class ManageUserProjectAccessRightViewModel implements IDispose {

        /**
        * Get the list object
        **/
        public get listVm() {
            return this._listVm;
        }

        public dispose() {
            this._listVm.dispose();
            this._controllersManager.mainController.off("currentprojectchanged", this.projectChangedHandler, this);
        }

        /**
         * Load the next list page and 
         */
        private projectChangedHandler() {
            this.loadData();
        }

        /**
         * This method is used to load the needed data for displaying the first page
         */
        private loadData() {
            if (this._selectedContactsIds) {
                this._listVm.specifyIds(this._selectedContactsIds);
            } else {
                this._listVm.loadPage(0);
            }
        }

        public selectEntity(item: ProjectAccessRightUserItemViewModel): boolean {
            if (item.typeEnum === ValueType.Simple) {
                return true;
            }
            return false;
        }

        constructor(private _utility: ap.utility.UtilityHelper, private _api: ap.services.apiHelper.Api, private $q: angular.IQService, private $mdDialog: angular.material.IDialogService,
            private _controllersManager: ap.controllers.ControllersManager, servicesManager: ap.services.ServicesManager, private _selectedContactsIds?: string[]) {
            this._listVm = new UserProjectAccessRightListViewModel(this._utility, this.$q, this.$mdDialog, this._controllersManager, servicesManager, _selectedContactsIds);
           // this._listVm.on("saveexecuted", this.loadData, this);
            let currentProject = this._controllersManager.mainController.currentProject();
            if (currentProject) {
                this.loadData();
            } else {
                this._controllersManager.mainController.on("currentprojectchanged", this.projectChangedHandler, this);
            }
        }
        private _listVm: UserProjectAccessRightListViewModel;
    }
}