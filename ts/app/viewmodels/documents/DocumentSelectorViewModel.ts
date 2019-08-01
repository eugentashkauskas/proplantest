namespace ap.viewmodels.documents {

    export class DocumentSelectorViewModel {

        /**
        * The list of checked document make by the user
        **/
        public get checkedDocuments(): DocumentItemViewModel[] {
            return <DocumentItemViewModel[]>this.workspace.documentListVm.listVm.getCheckedItems();
        }

        /**
        * The list of ids checked
        **/
        public get listIdsChecked(): string[] {
            return this.workspace.documentListVm.listVm.listidsChecked;
        }

        /**
        * This is the translation key to use to display the title of the popup
        **/
        public get titleKey(): string {
            return this._titleKey;
        }

        /**
        * This is the translation key for the button to accept the selection
        **/
        public get actionKey(): string {
            return this._actionKey;
        }

        public get workSpace(): ap.viewmodels.documents.DocumentWorkspaceViewModel {
            return this._workSpace;
        }


        public get canSave(): boolean {
            return this._canSave;
        }

        public get workspace(): ap.viewmodels.documents.DocumentWorkspaceViewModel {
            return this._workSpace;
        }

        public changeView() {
            this._workSpace.documentListVm.view = (this._workSpace.documentListVm.view === View.Thumb) ? View.Grid : View.Thumb;
        }

        private _documentIsCheckedChanged(itemVM: IEntityViewModel) {
            this._checkCanSave();
        }

        private _documentlistLoaded(isIdsLoaded: boolean) {
            this._checkCanSave();
        }

        private _checkCanSave() {
            this._canSave = (this.listIdsChecked !== null && this.listIdsChecked.length > 0) || this.workspace.documentListVm.listVm.selectedAll;
        }

        on(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.on(eventName, callback, caller);
        }

        off(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.off(eventName, callback, caller);
        }

        constructor(private $scope: ng.IScope, private $mdDialog: angular.material.IDialogService, private _utility: ap.utility.UtilityHelper, private _api: ap.services.apiHelper.Api, private $q: angular.IQService, private $timeout: angular.ITimeoutService, titleKey: string, actionKey: string,
            $mdSidenav: angular.material.ISidenavService, $location: angular.ILocationService, $anchorScroll: angular.IAnchorScrollService, $interval: angular.IIntervalService, private $controllersManager: ap.controllers.ControllersManager, private $servicesManager: ap.services.ServicesManager) {
            this._titleKey = titleKey;
            this._actionKey = actionKey;
            this._eventHelper = this._utility.EventTool;
            this._listener = this._eventHelper.implementsListener(["selectionaccepted"]);

            this._workSpace = new ap.viewmodels.documents.DocumentWorkspaceViewModel(this.$scope, this._utility, this._api, this.$q, this.$timeout, $mdSidenav, $mdDialog, $location, $anchorScroll, $interval,
                $controllersManager, $servicesManager, new DocumentWorkspaceElement(), false);

            this._workSpace.documentListVm.isDocumentSelector = true;
            // Register events to update canSave
            this._workSpace.documentListVm.listVm.on("isCheckedChanged", this._documentIsCheckedChanged, this);
            this._workSpace.documentListVm.listVm.on("selectedallchanged", this._documentIsCheckedChanged, this);
            this._workSpace.documentListVm.listVm.on("idsloaded", this._documentlistLoaded, this);

            $scope.$on("$destroy", () => {
                this.dispose();
            });
        }

        /**
        * Dispose the object
        */
        dispose() {
            if (this._workSpace) {
                this._workSpace.dispose();
                this._workSpace = null;
            }
        }

        /**
        * Cancel the selection
        **/
        cancel(): void {
            this.$mdDialog.cancel();
        }

        /**
        * Valiate the selection
        **/
        save(): void {
            this._listener.raise("selectionaccepted", this.checkedDocuments);
            this.$mdDialog.hide(this.checkedDocuments);
        }

        private _workSpace: ap.viewmodels.documents.DocumentWorkspaceViewModel;
        private _titleKey: string;
        private _actionKey: string;
        private _listener: ap.utility.IListenerBuilder;
        private _eventHelper: ap.utility.EventHelper;
        private _canSave: boolean = false;
    }
}