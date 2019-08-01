module ap.viewmodels.projects {

    /**
     * ProjectRoomConfigViewModel
     * Extends ProjectRoomConfigViewModel and is used to add rooms to a project while editing a note.  This ViewModel is used in a dialog.
     * It's not possible to delete rooms and there is no confirmation message when the user clicks on save
     */
    export class ProjectRoomConfigDialogViewModel extends ProjectRoomConfigViewModel {

        private parentCellAddedHandler(parentCellViewModel: ParentCellViewModel) {
            parentCellViewModel.isRemovable = false;
        }

        private subCellAddedHandler(subCellViewModel: SubCellViewModel) {
            subCellViewModel.isRemovable = false;
        }

        /**
        * Determines whether it is possible to save changes
        */
        public get canSave(): boolean {
            return this._saveAction.isEnabled;
        }

        public cancel(): void {
            this.$mdDialog.cancel();
        }

        protected processSave(toSave: ap.models.custom.ProjectRoomModification): angular.IPromise<ap.models.custom.ProjectRoomModification> {
            let def: any = this.$q.defer();

            let nbPCellAdd = toSave.ParentCellsToUpdate.filter((parentCell: ap.models.projects.ParentCell) => {
                return parentCell.IsNew;
            });
            let nbSCellAdd = toSave.SubCellsToUpdate.filter((subCell: ap.models.projects.SubCell) => {
                return subCell.IsNew;
            });

            if (nbSCellAdd.length > 0) {
                this.lastSubCellAddedId = nbSCellAdd[nbSCellAdd.length - 1].Id;
            }

            this.$controllersManager.projectController.updateProjectRoom(toSave).then((result: ap.models.custom.ProjectRoomModification) => {
                def.resolve(result);
                this.goToReadMode();
                this.$mdDialog.hide();
            });

            return def.promise;
        }

        constructor(utility: ap.utility.UtilityHelper, q: angular.IQService, mdDialog: angular.material.IDialogService, api: ap.services.apiHelper.Api, controllersManager: ap.controllers.ControllersManager, servicesManager: ap.services.ServicesManager, timeout: angular.ITimeoutService) {
            super(utility, q, mdDialog, api, controllersManager, servicesManager, timeout);

            this.parentCellListVm.on("itemcreated", this.parentCellAddedHandler, this);
            this.parentCellListVm.on("iteminserted", this.parentCellAddedHandler, this);
            this.subCellListVm.on("itemcreated", this.subCellAddedHandler, this);
            this.subCellListVm.on("iteminserted", this.subCellAddedHandler, this);
        }
    }
}