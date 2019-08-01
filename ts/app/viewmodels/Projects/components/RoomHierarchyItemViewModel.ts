module ap.viewmodels.projects {
    export class RoomHierarchyItemViewModel extends ap.viewmodels.HierarchyItemViewModel implements ap.viewmodels.ITreeEntityViewModel {

        public get cellHierarchy(): ap.models.projects.CellHierarchy {
            return <ap.models.projects.CellHierarchy>this._originalEntity;
        }

        public get roomDisplayName(): string {
            return this._roomDisplayName;
        }

        public set roomDisplayName(value: string) {
            this._roomDisplayName = value;
        }

        public get isExpanded(): boolean {
            return this._isExpanded;
        }

        public set isExpanded(isExpanded: boolean) {
            if (this._isExpanded !== isExpanded) {
                let oldValue = this._isExpanded;
                this._isExpanded = isExpanded;
                this.raisePropertyChanged("isExpanded", oldValue, this);
            }
        }

        public get hasChildren(): boolean {
            return this._hasChildren;
        }

        public set hasChildren(val: boolean) {
            this._hasChildren = val;
        }

        private initEntity() {
            this.setSelectable(false);
        }

        protected getLevel(): number {
            let result = super.getLevel();
            let cell = this.cellHierarchy;
            if (cell && cell instanceof ap.models.projects.CellHierarchy) {
                if (cell.EntityName === "ParentCell") {
                    return 0;
                }
                else if (cell.EntityName === "SubCell") {
                    return 1;
                }
            }
            return result;
        }

        protected setExpanded() {
            let result = super.getLevel();
            let cell = this.cellHierarchy;
            if (cell && cell instanceof ap.models.projects.CellHierarchy && (cell.EntityName === "ParentCell" || cell.EntityName === "SubCell")) {
                this._isExpanded = true;
            }
        }

        protected computeDisplayName() {
            let cell = this.cellHierarchy;
            if (cell && cell instanceof ap.models.projects.CellHierarchy) {
                return cell.Description;
            }
            return "";
        }

        protected buildProperty() {
            super.buildProperty();
            let cell = this.cellHierarchy;
            if (cell && cell instanceof ap.models.projects.CellHierarchy) {
                if (cell.EntityName === "ParentCell") {
                    this.setSelectable(false);
                }
                else if (cell.EntityName === "SubCell") {
                    this.setSelectable(true);
                }
            }
            else {
                this.initEntity();
            }
            this.setIsSystem(this.isSystem);
        }

        constructor($utility: ap.utility.UtilityHelper, $q: angular.IQService, parentList?: BaseListEntityViewModel, parameters?: ItemConstructorParameter, private isSystem: boolean = false) {
            super($utility, $q, parentList, parameters);
            this.initEntity();
            this._isExpanded = true;
            this._hasChildren = false;
        }

        private _isExpanded: boolean;
        private _hasChildren: boolean;
        private _roomDisplayName: string;
    }
}