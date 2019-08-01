module ap.viewmodels.notes.filters {

    export class IssueTypeAdvancedFilterList extends ap.misc.AdvancedFilterListBuilder {

        public get countCheckedValues(): number {
            if (!!this._issueTypeMultiSelectorViewModel) {
                return this._issueTypeMultiSelectorViewModel.checkedIds.filter((id) => {
                    return id.substr(id.length - 1) === "1";
                }).length;
            }
            return 0;
        }

        public get searchText(): string {
            return this._issueTypeMultiSelectorViewModel.searchText;
        }

        public set searchText(val: string) {
            if (this._issueTypeMultiSelectorViewModel.searchText !== val) {
                this._issueTypeMultiSelectorViewModel.searchText = val;
                this.search();
            }
        }

        protected getCheckedEntityText(item: any): string {
            return item.Description;
        }

        public dispose() {
            if (this._issueTypeMultiSelectorViewModel) {
                this._issueTypeMultiSelectorViewModel.dispose();
                this._issueTypeMultiSelectorViewModel = null;
            }
        }

        public createListViewModel(): ap.viewmodels.projects.IssueTypeMultiSelectorViewModel {
            this._issueTypeMultiSelectorViewModel = new ap.viewmodels.projects.IssueTypeMultiSelectorViewModel(this.$utility, this._api, this.$q, this.$controllersManager);
            return this._issueTypeMultiSelectorViewModel;
        }

        public search() {
            this._issueTypeMultiSelectorViewModel.load(true);
        }

        /**
        * Returns trimmed CellHierarchy entities' ids, removed last character - indicator of a parent/child entity
        */
        private getOriginalIds(ids: string[]): angular.IPromise<string[]> {
            let defer: ng.IDeferred<string[]> = this.$q.defer();
            let originalIds: string[] = [];
            ids.forEach((Id: string) => {
                originalIds.push(Id.substring(0, Id.length - 1));
            });
            defer.resolve(originalIds);
            return defer.promise;
        }
        constructor($utility: utility.UtilityHelper, _api: ap.services.apiHelper.Api, $q: angular.IQService, controllersManager: controllers.ControllersManager) {
            super($utility, _api, $q, controllersManager, "IssueType", "Id,Description", undefined, true);
        }

        private _issueTypeMultiSelectorViewModel: ap.viewmodels.projects.IssueTypeMultiSelectorViewModel;
    }
}