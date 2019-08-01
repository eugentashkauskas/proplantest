module ap.viewmodels {

    export interface ITreeEntityViewModel extends IEntityViewModel {
        level: number;
        isExpanded: boolean;
        hasChildren: boolean;
    }

    export class TreeEntityViewModel extends EntityViewModel implements ITreeEntityViewModel, IDispose {

        public get isExpanded(): boolean {
            return this._isExpanded;
        }

        public set isExpanded(expanded: boolean) {
            if (this._isExpanded !== expanded) {
                let originalIsExpanded = this._isExpanded;
                this._isExpanded = expanded;
                this.raisePropertyChanged("isExpanded", originalIsExpanded, this);
            }
        }

        public setExpanded(isExpanded: boolean) {
            this._isExpanded = isExpanded;
        }

        public dispose() {
            super.dispose();
        }

        constructor(_utility: utility.UtilityHelper, parentListVm?: BaseListEntityViewModel, parameters?: ItemConstructorParameter) {
            super(_utility, parentListVm, parameters ? parameters.itemIndex : null);

            this.EventHelper = _utility.EventTool;

            this.level = parameters ? (<ap.viewmodels.folders.FolderItemConstructorParameter>parameters).level : 0;
            this._isExpanded = parameters ? (<ap.viewmodels.folders.FolderItemConstructorParameter>parameters).isExpanded : true;
        }

        public level: number = 0;
        public hasChildren: boolean = false;
        private _isExpanded: boolean = true;
        private EventHelper: ap.utility.EventHelper;
    }
}