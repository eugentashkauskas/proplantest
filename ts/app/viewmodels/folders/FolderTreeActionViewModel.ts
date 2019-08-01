module ap.viewmodels.folders {

    /**
    * This class to managed actions of a folder in folder list
    **/
    export class FolderTreeActionViewModel implements ap.utility.IListener, IDispose {

        public prependActions(actions: ap.viewmodels.home.ActionViewModel[]) {
            this._actions.splice(0, 0, ...actions);
        }

        /**
        * Actionclick method use in _FolderList.cshtml
        **/
        public actionClick(action: string): void {
            switch (action) {
                case "foldertree.exportexcel":
                    this._controllersManager.reportController.exportFolderStructure();
                    break;
                case "foldertree.importstructure":
                    this._listener.raise("importstructurefromproject");
                    break;
                case "foldertree.collapseall":
                    this._listener.raise("collapseall");
                    break;
                case "foldertree.expandall":
                    this._listener.raise("expandall");
                    break;
                case "folder.add":
                    this._listener.raise("addfolderrequested");
                    break;
                default:
                    throw new Error("The '" + action + "' action does not exist");
            }
        }

        /**
        * Use to get the list of actions
        **/
        public get actions(): ap.viewmodels.home.ActionViewModel[] {
            return this._actions;
        }

        /**
        *  This method use to count how many items can be visible on UI
        */
        public get visibleActionsCount(): number {
            let result = 0;
            if (this._actions && this._actions.length > 0) {
                for (let i = 0; i < this._actions.length; i++) {
                    let action = this._actions[i];
                    if (action.isVisible) result++;
                }
            }

            return result;
        }

        /**
        * Dispose the object
        */
        public dispose() {
            if (this._listener) {
                this._listener.clear();
                this._listener = null;
            }

            if (this._actions) {
                for (let i: number = 0; i++; i < this._actions.length) {
                    this._actions[i].dispose();
                    this._actions[i] = null;
                }

                this._actions = null;
            }
        }

        /*
        * Build available actions for a single document
        */
        private computeActionsVisibility(): void {
            this._exportExcel.isVisible = this._utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_DocStructExportExcel);
            this._exportExcel.isEnabled = this._utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_DocStructExportExcel);
            this._importFolderStructure.isVisible = this._utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_VisibilityManagement) && this._controllersManager.mainController.currentProject().UserAccessRight.CanAddFolder;
            this._importFolderStructure.isEnabled = this._utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_ProjectStructure);
        }

        public on(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.on(eventName, callback, caller);
        }

        public off(eventName: string, callback: { (args?): void; }, caller: any) {
            this._listener.off(eventName, callback, caller);
        }

        constructor(private _utility: ap.utility.UtilityHelper, private _controllersManager: ap.controllers.ControllersManager, private headerActions: ap.viewmodels.home.ActionViewModel[] = []) {
            this._listener = this._utility.EventTool.implementsListener(["importstructurefromproject", "collapseall", "expandall", "addfolderrequested"]);
            this._importFolderStructure = new ap.viewmodels.home.ActionViewModel(_utility, _utility.EventTool, "foldertree.importstructure", _utility.rootUrl + "Images/html/icons/ic_import_export_black_24px.svg", false, null, "Import structure", false);
            this._exportExcel = new ap.viewmodels.home.ActionViewModel(_utility, _utility.EventTool, "foldertree.exportexcel", _utility.rootUrl + "Images/html/icons/ic_launch_black_24px.svg", false, null, "Export structure", false);
            this._expandAll = new ap.viewmodels.home.ActionViewModel(_utility, _utility.EventTool, "foldertree.expandall", _utility.rootUrl + "Images/html/icons/expand.svg", true, null, "Expand all", false);
            this._collapseAll = new ap.viewmodels.home.ActionViewModel(_utility, _utility.EventTool, "foldertree.collapseall", _utility.rootUrl + "Images/html/icons/collapse.svg", true, null, "Collapse all", false);
            this._actions = [...headerActions, this._exportExcel, this._importFolderStructure, this._expandAll, this._collapseAll];
            this.computeActionsVisibility();
        }

        // Private
        private _actions: ap.viewmodels.home.ActionViewModel[];
        private _exportExcel: ap.viewmodels.home.ActionViewModel;
        private _importFolderStructure: ap.viewmodels.home.ActionViewModel;
        private _expandAll: ap.viewmodels.home.ActionViewModel;
        private _collapseAll: ap.viewmodels.home.ActionViewModel;
        private _listener: ap.utility.IListenerBuilder;
    }
}