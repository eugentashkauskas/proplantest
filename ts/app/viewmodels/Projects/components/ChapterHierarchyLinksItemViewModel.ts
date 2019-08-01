module ap.viewmodels.projects {
    export class ChapterHierarchyLinksItemViewModel extends ChapterHierarchyItemViewModel {

        /**
         * Array of CategoryLinkItemViewModel items
         */
        public set categoryLinksViewModel(val: ap.viewmodels.projectcontacts.CategoryLinkItemViewModel[]) {
            this._categoryLinksViewModel = val;
        }

        public get categoryLinksViewModel(): ap.viewmodels.projectcontacts.CategoryLinkItemViewModel[] {
            return this._categoryLinksViewModel;
        }

        /**
         * Array of current CategoryLinkItemViewModel items
         */
        public get currentCategoryLinks(): ap.viewmodels.projectcontacts.CategoryLinkItemViewModel[] {
            return this._currentCategoryLinks;
        }

        /**
         * The current visible page
         */
        public set currentLinksPage(val: number) {
            if (this._currentLinksPage !== val) {
                this._currentLinksPage = val;
                this.setCurrentLinks();
            }
        }

        /**
         * This public method is used to clear contactIssueType property
         */
        public clearContactIssueType() {
            this.currentCategoryLinks.forEach(categoryLink => {
                categoryLink.contactIssueType = null;
            });
        }

        /**
        * Private member to initialize the current page of CategoryLinksViewModel
        */
        private setCurrentLinks() {
            let startIndex: number = this._currentLinksPage * this._linksPageSize;
            let endIndex: number = startIndex + this._linksPageSize < this.categoryLinksViewModel.length ? startIndex + this._linksPageSize : this.categoryLinksViewModel.length;
            this._currentCategoryLinks = this.categoryLinksViewModel.slice(startIndex, endIndex);
        }

        public get currentLinksPage(): number {
            return this._currentLinksPage;
        }

        /**
         * The size of a page
         */
        public get linksPageSize(): number {
            return this._linksPageSize;
        }

        /**
         * Overrride the copySource method
         * Reset the links 
         */
        public copySource(): void {
            super.copySource();
            this.categoryLinksViewModel.forEach((linkItem: projectcontacts.CategoryLinkItemViewModel) => {
                linkItem.checkHasChanged();
                if (linkItem.hasChanged) {
                    linkItem.setDefaultAccess();
                }
            });
        }

        constructor($utility: ap.utility.UtilityHelper, $q: angular.IQService, parentList?: BaseListEntityViewModel, parameters?: ItemConstructorParameter) {
            super($utility, $q, parentList, parameters);
        }

        private _categoryLinksViewModel: ap.viewmodels.projectcontacts.CategoryLinkItemViewModel[] = [];
        private _currentCategoryLinks: ap.viewmodels.projectcontacts.CategoryLinkItemViewModel[] = [];
        private _currentLinksPage: number;
        private _linksPageSize: number = 10;
    }
}