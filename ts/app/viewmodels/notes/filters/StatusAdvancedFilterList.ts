module ap.viewmodels.notes.filters {

    export class StatusAdvancedFilterList extends ap.misc.AdvancedFilterListBuilder {

        public get countCheckedValues(): number {
            if (!!this._statusListMultiSelectorViewModel) {
                return this._statusListMultiSelectorViewModel.checkedIds.length;
            }
            return 0;
        }

        public get searchText(): string {
            return this._statusListMultiSelectorViewModel.searchText;
        }

        public set searchText(val: string) {
            if (this._statusListMultiSelectorViewModel.searchText !== val) {
                this._statusListMultiSelectorViewModel.searchText = val;
                this.search();
            }
        }

        protected getCheckedEntityText(item: any): string {
            return item.Name;
        }

        public createListViewModel(): ap.viewmodels.projects.ProjectStatusMultiSelectorViewModel {
            this._statusListMultiSelectorViewModel = new ap.viewmodels.projects.ProjectStatusMultiSelectorViewModel(this.$utility, this.$q, this.$controllersManager);
            return this._statusListMultiSelectorViewModel;
        }

        public search() {
            this._statusListMultiSelectorViewModel.load(true);
        }

        public dispose() {
            if (this._statusListMultiSelectorViewModel) {
                this._statusListMultiSelectorViewModel.dispose();
                this._statusListMultiSelectorViewModel = null;
            }
        }

        constructor($utility: utility.UtilityHelper, _api: ap.services.apiHelper.Api, $q: angular.IQService, controllersManager: controllers.ControllersManager) {
            super($utility, _api, $q, controllersManager, "NoteProjectStatus", "Id,Name", undefined, true);
        }

        private _statusListMultiSelectorViewModel: ap.viewmodels.projects.ProjectStatusMultiSelectorViewModel;
    }
}