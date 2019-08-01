module ap.viewmodels.notes.filters {

    export class RoomAdvancedFilterList extends ap.misc.AdvancedFilterListBuilder {

        public get countCheckedValues(): number {
            if (!!this._roomMultiSelectorViewModel) {
                return this._roomMultiSelectorViewModel.checkedIds.filter((id) => {
                    return id.substr(id.length - 1) === "1";
                }).length;
            }
            return 0;
        }

        public get searchText(): string {
            return this._roomMultiSelectorViewModel.searchText;
        }

        public set searchText(val: string) {
            if (this._roomMultiSelectorViewModel.searchText !== val) {
                this._roomMultiSelectorViewModel.searchText = val;
                this.search();
            }
        }

        protected getCheckedEntityText(item: any): string {
            return item.Description;
        }

        public createListViewModel(): ap.viewmodels.projects.RoomMultiSelectorViewModel {
            this._roomMultiSelectorViewModel = new ap.viewmodels.projects.RoomMultiSelectorViewModel(this.$utility, this._api, this.$q, this.$controllersManager);
            return this._roomMultiSelectorViewModel;
        }

        public search() {
            this._roomMultiSelectorViewModel.load(true);
        }

        public dispose() {
            if (this._roomMultiSelectorViewModel) {
                this._roomMultiSelectorViewModel.dispose();
                this._roomMultiSelectorViewModel = null;
            }
        }

        /**
        * Returns trimmed RoomHierarchy entities' ids, removed last character - indicator of a parent/child entity
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
            super($utility, _api, $q, controllersManager, "SubCell", "Id,Description", undefined, true);
        }

        private _roomMultiSelectorViewModel: ap.viewmodels.projects.RoomMultiSelectorViewModel;
    }
}