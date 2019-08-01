module ap.viewmodels.notes.filters {

    export class ListAdvancedFilterList extends ap.misc.AdvancedFilterListBuilder {

        public get countCheckedValues(): number {
            if (!!this._meetingMultiSelectorViewModel) {
                return this._meetingMultiSelectorViewModel.checkedIds.length;
            }
            return 0;
        }

        public get searchText(): string {
            return this._meetingMultiSelectorViewModel.searchText;
        }

        public set searchText(val: string) {
            if (this._meetingMultiSelectorViewModel.searchText !== val) {
                this._meetingMultiSelectorViewModel.searchText = val;
                this.search();
            }
        }

        protected getCheckedEntityText(item: any): string {
            return item.Title;
        }

        public search() {
            this._meetingMultiSelectorViewModel.load(true);
        }

        public dispose() {
            if (this._meetingMultiSelectorViewModel) {
                this._meetingMultiSelectorViewModel.dispose();
                this._meetingMultiSelectorViewModel = null;
            }
        }

        public createListViewModel(): ap.viewmodels.meetings.MeetingMultiSelectorViewModel {
            this._meetingMultiSelectorViewModel = new ap.viewmodels.meetings.MeetingMultiSelectorViewModel(this.$utility, this.$q, this.$controllersManager);
            return this._meetingMultiSelectorViewModel;
        }

        constructor($utility: utility.UtilityHelper, _api: ap.services.apiHelper.Api, $q: angular.IQService, controllersManager: controllers.ControllersManager) {
            super($utility, _api, $q, controllersManager, "Meeting", "Id,Title", undefined, true);
        }

        private _meetingMultiSelectorViewModel: ap.viewmodels.meetings.MeetingMultiSelectorViewModel;
    }
}