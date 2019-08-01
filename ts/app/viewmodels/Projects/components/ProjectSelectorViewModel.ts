module ap.viewmodels.projects {
    export class ProjectSelectorViewModel extends ListWorkspaceViewModel {

        public get selectedProjectId(): string {
            return this.selectedItem ? (<ap.models.projects.Project>this.selectedItem.originalEntity).Id : null;
        }

        /*
        * To bind with directive, avoid using listVM.SelectdViewModel becasue it may set null when no result
        */
        public get selectedItem(): IEntityViewModel {
            return this._selectedItem;
        }

        /*
        * To bind with directive, avoid using listVM.SelectdViewModel becasue it may set null when no result
        */
        public set selectedItem(value: IEntityViewModel) {
            if (this._selectedItem === null || value === null || this._selectedItem.originalEntity.Id !== value.originalEntity.Id) {
                this._selectedItem = value;
                this._listener.raise("selectedItemChanged", value);
            }
        }

        /**
        * This method is used to create the filter of the searchText
        * We make the search on Name property of the meeting
        **/
        protected buildSearchedTextFilter(): string {
            if (this.searchedText && !StringHelper.isNullOrEmpty(this.searchedText))
                return Filter.contains("Name", "\"" + this.searchedText + "\"");
            return undefined;
        }

        /**
        * This method is used to create the custom/base filter for the list
        * We filter the active projects
        **/
        protected buildCustomFilter(): angular.IPromise<string> {
            let def: ng.IDeferred<string>  = this.$q.defer();

            let filter: string = Filter.isTrue("IsActive");

            if (this._isForImport) {
                filter = Filter.and(filter, Filter.notEq("Id", this.$controllersManager.mainController.currentProject().Id));
            }

            def.resolve(filter);
            return def.promise;
        }

        public dispose() {
            super.dispose();
        }

        constructor($utility: ap.utility.UtilityHelper, $q: angular.IQService, _controllersManager: ap.controllers.ControllersManager, $timeout: angular.ITimeoutService, private _isForImport: boolean = false, private _predefinedItems: PredefinedItemParameter[] = null) {
            super($utility, _controllersManager, $q, new GenericPagedListOptions("Project", ProjectItemViewModel, "Name, Code", null, 50, false, true, undefined, undefined, undefined, undefined, _predefinedItems));
            this._listener.addEventsName(["selectedItemChanged"]);
        }
        private _selectedItem: IEntityViewModel = null;
    }
}