module ap.viewmodels.projectcontacts {

    export class ImportProjectContactViewModel implements IDispose {

        public get canImport(): boolean {
            return this._projectContactListVm.listVm.getCheckedItems().length > 0;
        }

        public get allProjectsItem(): ap.viewmodels.IEntityViewModel {
            return this._allProjectsItemParam.item;
        }

        /**
        * This property for select ProjectContact
        **/
        public get projectContactListVm(): ap.viewmodels.projectcontacts.ProjectContactListViewModel {
            return this._projectContactListVm;
        }

        /**
        * This property for select project
        **/
        public get projectSelectorViewModel(): ap.viewmodels.projects.ProjectSelectorViewModel {
            return this._projectSelectorViewModel;
        }

        /**
        * This method use when select project changed
        * @param value The selected item.  Its type is any because it can be a ProjectItemViewModel or string in case a "All projects" option selected in the view
        **/
        private selectProjectChangeHandler(value: any) {
            this._projectContactListVm.selectedProject = <ap.models.projects.Project>value.originalEntity;
        }

        /**
        * This method use for import contacts in current project
        **/
        public importContacts() {
            let listUserId: string[] = [];
            let listContact: ap.models.projects.ContactDetails[] = [];
            let allSelectedContacts = this._projectContactListVm.listVm.getCheckedItems();
            allSelectedContacts.forEach((item: ProjectContactItemViewModel) => {
                let contactDetails = item.originalContactItem;
                if (listUserId.indexOf(contactDetails.User.Id) === -1) {
                    listUserId.push(contactDetails.User.Id);
                    listContact.push(contactDetails);
                }
            });
            this.controllersManager.contactController.importContacts(listContact).then(() => {
                this.$mdDialog.hide();
            });
        }

        public cancel() {
            this.$mdDialog.cancel();
        }

        /**
         * Dispose the object
         */
        public dispose() {
            this._projectSelectorViewModel.off("selectedItemChanged", this.selectProjectChangeHandler, this);
            this.$utility.Translator.off("languagechanged", this.languageChangedHandler, this);
            this._projectSelectorViewModel.dispose();
            this._projectContactListVm.dispose();
        }

        private createAllProjectsItem(): ap.viewmodels.PredefinedItemParameter {
            let emptyId = ap.utility.UtilityHelper.createEmptyGuid();
            let allProjectEntity: ap.models.projects.Project = new ap.models.projects.Project(this.$utility);
            allProjectEntity.createByJson({
                Id: emptyId,
                Name: this.$utility.Translator.getTranslation("All projects")
            });
            let allProjectItem: ap.viewmodels.projects.ProjectItemViewModel = new ap.viewmodels.projects.ProjectItemViewModel(this.$utility, this.$q, null, null);
            allProjectItem.init(allProjectEntity);
            return new ap.viewmodels.PredefinedItemParameter(0, emptyId, allProjectItem);
        }

        /**
         * Language change handler, update project's name when app language changed
         */
        private languageChangedHandler() {
            let allProjectItem: ap.viewmodels.projects.ProjectItemViewModel = <ap.viewmodels.projects.ProjectItemViewModel>this._allProjectsItemParam.item;
            allProjectItem.name = this.$utility.Translator.getTranslation("All projects");
        }

        constructor(private $utility: ap.utility.UtilityHelper, private $q: angular.IQService, private Api: ap.services.apiHelper.Api, private controllersManager: ap.controllers.ControllersManager, private $mdDialog: angular.material.IDialogService, $timeout: angular.ITimeoutService, $servicesManager: ap.services.ServicesManager) {
            this._allProjectsItemParam = this.createAllProjectsItem();
            this._projectSelectorViewModel = new ap.viewmodels.projects.ProjectSelectorViewModel($utility, $q, controllersManager, $timeout, true, [this._allProjectsItemParam]);
            this._projectContactListVm = new ap.viewmodels.projectcontacts.ProjectContactListViewModel($utility, $q, controllersManager, $timeout, $servicesManager, true);
            this._projectContactListVm.load();
            this._projectSelectorViewModel.load().then(() => {
                this._projectSelectorViewModel.selectedItem = this.allProjectsItem;
                this._projectSelectorViewModel.on("selectedItemChanged", this.selectProjectChangeHandler, this);
            });
            this.$utility.Translator.on("languagechanged", this.languageChangedHandler, this);
        }

        private _projectSelectorViewModel: ap.viewmodels.projects.ProjectSelectorViewModel;
        private _projectContactListVm: ap.viewmodels.projectcontacts.ProjectContactListViewModel;
        private _allProjectsItemParam: ap.viewmodels.PredefinedItemParameter;
    }
}