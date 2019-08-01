module ap.viewmodels {
    export class ListEntityViewModel extends BaseListEntityViewModel {
        protected _entityName: string;
        protected _pathToLoad: string;
        protected _sortOrder: string;
        protected _defaultFilter: string;

        public get entityName(): string {
            return this._entityName;
        }

        public get pathToLoad(): string {
            return this._pathToLoad;
        }

        public get sortOrder(): string {
            return this._sortOrder;
        }

        public get defaultFilter(): string {
            return this._defaultFilter;
        }
        // Public methods
        changeSortOrder(sortOrder: string) {
            this._sortOrder = sortOrder;
        }

        constructor(utility: utility.UtilityHelper, entityName: string, pathToLoad: string, sortOrder: string, defaultFilter: string) {
            super(utility);
            this._entityName = entityName;
            this._defaultFilter = defaultFilter ===  undefined ? null : defaultFilter;
            this._sortOrder = sortOrder;
            this._pathToLoad = pathToLoad;
        }
    }
}