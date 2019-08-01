module ap.viewmodels.projects {
    export class ChapterHierarchyItemViewModel extends ap.viewmodels.HierarchyItemViewModel implements ap.viewmodels.ITreeEntityViewModel {

        public get chapterHierarchy(): ap.models.projects.ChapterHierarchy {
            return <ap.models.projects.ChapterHierarchy> this._originalEntity;
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
            let chH = this.chapterHierarchy;
            if (chH && chH instanceof ap.models.projects.ChapterHierarchy) {
                if (chH.EntityName === "Chapter") {
                    return 0;
                }
                else if (chH.EntityName === "IssueType") {
                    return 1;
                }
            }
            return 0;
        }

        protected computeDisplayName() {
            let chH = this.chapterHierarchy;
            if (chH && chH instanceof ap.models.projects.ChapterHierarchy) {
                return chH.Description;
            }
            return "";
        }

        protected buildProperty() {
            super.buildProperty();
            let chH = this.chapterHierarchy;
            if (chH && chH instanceof ap.models.projects.ChapterHierarchy) {
                if (chH.EntityName === "Chapter") {
                    this.setSelectable(false);
                }
                else if (chH.EntityName === "IssueType") {
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
    }
}