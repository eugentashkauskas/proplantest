module ap.viewmodels.reports {
    export class ReportTitleHistoryViewModel {
        public selectedTitle: string;

        /**
        * The text input by the user to search titles
        **/
        public set searchText(val: string) {
            this._searchText = val;
        }

        public get searchText(): string {
            return this._searchText;
        }

        /**
         * This method will do the searching of report titles and return array of matches 
        **/
        public searchTitle(): string[] {
            if (!this._searchText || StringHelper.isNullOrWhiteSpace(this._searchText)) {
                return this._titleSuggestion;
            } else {
                return this._titleSuggestion.filter((title) => {
                    return title.toLocaleLowerCase().indexOf(this._searchText.toLocaleLowerCase()) >= 0;
                });
            }
        }

        constructor(private reportController: ap.controllers.ReportController, private projectId: string) {
            this.reportController.getReportTitleHistory(projectId).then((titles) => {
                this._titleSuggestion = titles;
            });
        }

        private _titleSuggestion: string[];
        private _searchText: string = "";
    }
}