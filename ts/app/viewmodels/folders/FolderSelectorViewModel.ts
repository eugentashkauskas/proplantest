module ap.viewmodels.folders {
    export class FolderSelectorViewModel implements IDispose {

        protected _listener: ap.utility.IListenerBuilder;
        /*
        * Hide the dialog
        */
        public cancel(): void {
            this._mdDialog.hide("cancel");
        }

        public get vm(): ap.viewmodels.documents.DocumentWorkspaceViewModel {
            return this._vm;
        }

        /**
        * Title key to translate
        */
        public get isForMove(): boolean {
            return this._isForMove;
        }

        public get isForDocumentUpload(): boolean {
            return this._isForDocumentUpload;
        }

        /*
        * When selected folder changed, need to run the rule to enable or disabled the upload action
        *     - The action enabled if the selected folder is not special one (steps)
        *     - Enabled when this is not system of private folder of other user (AP-12500)
        */
        private selectedFolderChanged(): void {
            if (this._vm.folderListVm.listVm.selectedViewModel && this._vm.folderListVm.listVm.selectedViewModel !== null &&
                this._vm.folderListVm.listVm.selectedViewModel.originalEntity !== null) {
                let selectedFolder: ap.models.projects.Folder = <ap.models.projects.Folder>this._vm.folderListVm.listVm.selectedViewModel.originalEntity;
                if (!this._folderIdToMove) {
                    let addAccessRight = new ap.models.accessRights.DocumentAccessRight(this.$utility, null, this.$controllersManager.mainController.currentProject(), this.$controllersManager.mainController.currentMeeting, selectedFolder);

                    if (!selectedFolder.isRootFolder && (selectedFolder.FolderType === "Photo" || selectedFolder.FolderType === "Custom") && (addAccessRight.canUploadDoc || addAccessRight.canUploadPicture || addAccessRight.canAddMeetingDoc || addAccessRight.canUploadMeetingDoc)) {
                        this._enableMainAction = true;
                    } else {
                        this._enableMainAction = false;
                    }
                } else {
                    let selectedFolderVm = <ap.viewmodels.folders.FolderItemViewModel>this._vm.folderListVm.listVm.selectedViewModel;
                    let folderToMove = this._vm.folderListVm.listVm.getEntityById(this._folderIdToMove);
                    let folderVms = <ap.viewmodels.folders.FolderItemViewModel[]>this._vm.folderListVm.listVm.sourceItems;
                    let childIds: string[] = [];
                    for (let i = folderToMove.index; i < folderVms.length; i++) {
                        if (folderVms[i].level > selectedFolderVm.level) {
                            childIds.push(folderVms[i].originalFolder.Id);
                        }
                    }
                    this._enableMainAction = selectedFolderVm.originalFolder.Id !== this._folderIdToMove && childIds.indexOf(selectedFolder.Id) < 0;
                }
            }
            else {
                this._enableMainAction = false;
            }
        }

        /*
        * Returns true if the upload button can be enabled
        */
        public get enableMainAction(): boolean {
            return this._enableMainAction;
        }

        /*
        * Title key to translate
        */
        public titleKey: string;

        /*
        * When upload button click, raise the event
        */
        public mainActionClick(): void {
            this._listener.raise("mainactionclicked", this.getSelectedFolder());
        }

        /*
        * To return the current selected folder (when there is)
        */
        private getSelectedFolder(): ap.models.projects.Folder {
            if (this._vm.folderListVm.listVm.selectedViewModel && this._vm.folderListVm.listVm.selectedViewModel !== null)
                return <ap.models.projects.Folder>this._vm.folderListVm.listVm.selectedViewModel.originalEntity;
            else
                return null;
        }

        on(eventName: string, callback: { (param?: any): void; }, caller: any): void {
            this._listener.on(eventName, callback, caller);
        }

        off(eventName: string, callback: { (param?: any): void; }, caller: any): void {
            this._listener.off(eventName, callback, caller);
        }

        public dispose() {
            if (this._vm) {
            this._vm.dispose();
                this._vm = null;
            }

            if (this._listener) {
            this._listener.clear();
                this._listener = null;
        }
        }

        constructor($scope: angular.IScope, $mdDialog: angular.material.IDialogService, private $utility: ap.utility.UtilityHelper, api: ap.services.apiHelper.Api, $q: angular.IQService, $timeout: angular.ITimeoutService,
            $mdSidenav: angular.material.ISidenavService, $location: angular.ILocationService, $anchorScroll: angular.IAnchorScrollService, $interval: angular.IIntervalService, private $controllersManager: ap.controllers.ControllersManager,
            $serviceManager: ap.services.ServicesManager, private _isForMove: boolean = false, private _folderIdToMove: string = null) {

            this._listener = $utility.EventTool.implementsListener(["mainactionclicked"]);
            let workspaceElement = new ap.viewmodels.documents.DocumentWorkspaceElement();
            workspaceElement.hasFolderList = true;
            workspaceElement.hasDocumentList = false;
            workspaceElement.hasDocumentViewer = false;
            this._vm = new ap.viewmodels.documents.DocumentWorkspaceViewModel($scope, $utility, api, $q, $timeout, $mdSidenav, $mdDialog, $location, $anchorScroll, $interval, $controllersManager, $serviceManager, workspaceElement, false);

            this._vm.folderListVm.listVm.on("selectedItemChanged", this.selectedFolderChanged, this);

            $scope["documentWorkspaceVm"] = this._vm;

            this._mdDialog = $mdDialog;

            this.titleKey = "Select_Folder";

            this._isForDocumentUpload = this._folderIdToMove === null && !this.isForMove;

            $scope.$on("$destroy", () => {
                    this.dispose();
            });
        }

        private _mdDialog: angular.material.IDialogService;
        private _vm: ap.viewmodels.documents.DocumentWorkspaceViewModel;
        private _enableMainAction: boolean;
        private _isForDocumentUpload;
    }
}