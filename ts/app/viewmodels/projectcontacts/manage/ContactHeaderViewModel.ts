module ap.viewmodels.projectcontacts {
    export class ContactHeaderViewModel extends GenericPagedListViewModels {

        /**
        * This property is to get the currentPageNumber
        **/
        public get currentPageNumber(): number {
            return this._currentPageNumber;
        }

        /**
        * This property is to increment the currentPageNumber
        **/
        public incrementCurrentPageNumber() {
            this._currentPageNumber++;
            this.updateContactList();
        }

        /**
        * This property is to decrement the currentPageNumber
        **/
        public decrementCurrentPageNumber() {
            this._currentPageNumber--;
            this.updateContactList();
        }

        /**
        * This property is to know if there is a next page
        **/
        public get nextPage(): boolean {
            return this._nextPage;
        }

        /**
        * This property is to know if there is a previous page
        **/
        public get previousPage(): boolean {
            return this._previousPage;
        }

        /**
        * This is the list of elements binding to the view
        **/
        public get currentContactList(): ContactHeaderItemViewModel[] {
            return this._currentContactList;
        }

        /**
        * Return the page size of contacts
        */
        public get pageSize(): number {
            return this._pageSize;
        }

        /**
        * Method use to update the list of contacts
        **/
        public updateContactList(forceUpdate: boolean = false) {
            this._currentContactList = [];
            let startIndex = this.currentPageNumber * this.pageSize;
            let itemToCheck: IEntityViewModel;
            let lastIndex: number;
            let lengthOfItems: number = this._loadedItemsLength;
            lengthOfItems = lengthOfItems - startIndex;
            if (lengthOfItems - this.pageSize < 0) {
                itemToCheck = this.sourceItems[this.sourceItems.length - 1];
                lastIndex = this.sourceItems.length;
            } else {
                itemToCheck = this.sourceItems[startIndex + (this.pageSize - 1)];
                lastIndex = startIndex + this.pageSize;
            }
            if (itemToCheck !== null && itemToCheck !== undefined) {
                    for (let i = startIndex; i < lastIndex; i++) {
                        this._currentContactList.push(<ContactHeaderItemViewModel>this.sourceItems[i]);
                    }
                this._listener.raise("pageChanged");
            } else {
                this.loadNextPage();
            }
            this.checkHasPreviousNextPage();
            return this._currentContactList;
        }

        /**
         * Method use to load specific or all contacts 
         */
        public loadData() {
            if (this._selectedContactsIds && this._selectedContactsIds.length > 0) {
                super.setIds(this._selectedContactsIds);
            }
            this.loadPage(0);
        }

        private checkHasPreviousNextPage() {
            this._nextPage = this._listIds.length > (this._currentPageNumber + 1) * this.pageSize ? true : false;
            this._previousPage = this._currentPageNumber > 0 ? true : false;
        }

        protected _onPageLoaded(pageDesc: PageDescription, itemList: IEntityViewModel[]): void {
            super._onPageLoaded(pageDesc, itemList);

            this._numberOfPage = this._listIds.length / this.pageSize;
            this._numberOfPage = Math.ceil(this._numberOfPage);
            this._loadedItemsLength += itemList.length;

            this.updateContactList();
        }

        constructor($utility: ap.utility.UtilityHelper, $q: angular.IQService, protected _controllersManager: ap.controllers.ControllersManager, private _autoUpdateCurrentPage: boolean = true, private _selectedContactsIds?: string[]) {
            super($utility, _controllersManager.listController, $q, new GenericPagedListOptions("ContactDetails",
                ContactHeaderItemViewModel, "User.Person,IsInvited,CategoryNumber, InviterId", null, 50, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, true), Filter.eq("Project.Id", _controllersManager.mainController.currentProject().Id));
            this._listener.addEventsName(["pageChanged"]);
            this.isDeferredLoadingMode = true;
            this.loadData();
        }

        private _nextPage: boolean = false;
        private _previousPage: boolean = false;
        private _currentPageNumber: number = 0;
        private _numberOfPage: number;
        private _currentContactList: ContactHeaderItemViewModel[];
        private _pageSize: number = 10;
        private _loadedItemsLength: number = 0;
    }
}