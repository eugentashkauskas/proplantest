module ap.viewmodels {
    export class HierarchyItemViewModel extends EntityItemViewModel {
        /**
         * To know the level of the item like it is hierarchy, it's necessary to know on which level the item is belonging to
         **/
        public get level(): number {
            return this._level;
        }

        public get currentPage(): number {
            return this._currentPage;
        }

        public set currentPage(val: number) {
            this._currentPage = val;
        }

        public set isIndeterminate(val: boolean) {
            this._isIndeterminate = val;
        }

        public get isIndeterminate(): boolean {
            return this._isIndeterminate;
        }

        protected buildProperty() {
            super.buildProperty();
            if (!this._originalEntity) {
                this.initHierarchyItem();
            }
            this._level = this.getLevel();
        }

        protected getLevel(): number {
            return 0;
        }

        private initHierarchyItem() {
            this._level = 0;
        }

        constructor(protected $utility: ap.utility.UtilityHelper, $q: angular.IQService, parentListVm?: BaseListEntityViewModel, parameters?: ItemConstructorParameter) {
            super($utility, $q, parentListVm, parameters);
            this.initHierarchyItem();
        }

        private _level: number;
        private _currentPage: number;
        private _isIndeterminate: boolean = false;
    }
}