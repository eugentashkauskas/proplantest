module ap.viewmodels.folders {

    export class FolderListViewModel implements IFoldersViewModel, IDispose, ap.utility.IListener {

        public listVm: FoldersPagedListViewModel = null;

        on(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.on(eventName, callback, caller);
        }
        off(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.off(eventName, callback, caller);
        }

        /**
        * Methode to get the folder
        **/
        public get folderTreeActionViewModel() {
            return this._folderTreeActionViewModel;
        }

        /**
        * Return draggable container's drag options
        **/
        public get dragOptions() {
            return this._dragOptions;
        }

        /**
        * Returns the project id used to load the folders
        */
        public get projectId(): string {
            return this._projectId;
        }

        /**
        * Sets the projects id used to load the folders
        */
        public set projectId(newValue: string) {
            if (this._projectId !== newValue) {
                this._projectId = newValue;

                this._initializeCustomParams();
                this.refresh();
            }
        }

        /*
        * Method used to dispose the vm
        */
        public dispose() {

            if (this._listener) {
                this._listener.clear();
                this._listener = null;
            }

            if (this.listVm) {
                this.listVm.dispose();
                this.listVm = null;
            }

            if (this._dragOptions) {
                this._dragOptions.dispose();
                this._dragOptions = null;
            }

            if (this._addEditFolderViewModel) {
                this._addEditFolderViewModel.dispose();
                this._addEditFolderViewModel = null;
            }

            if (this._folderTreeActionViewModel) {
                this._folderTreeActionViewModel.dispose();
                this._folderTreeActionViewModel = null;
            }

            this._controllersManager.projectController.off("editfolderrequested", this.editRequest, this);
            this._controllersManager.projectController.off("folderdeleted", this.updateFolderList, this);
            this._controllersManager.projectController.off("addfolderrequested", this.addRequest, this);
            this._controllersManager.projectController.off("foldersaved", this.updateFolderList, this);
            this._controllersManager.projectController.off("foldermoved", this.moveFolderListener, this);
            this._controllersManager.projectController.off("syncchapoorequested", this.openChapooPopup, this);
        }

        /*
        * This method refreshes the list of folders
        */
        public refresh(): void {
            this.listVm.refresh();
        }

        /**
         *  This method restores a state of folders list with respect to
         *  filters which are currently set in the class
         */
        public restoreState(): angular.IPromise<ap.services.apiHelper.ApiResponse> {
            return this.listVm.restoreState();
        }

        /**
        * Opens the Chapoo configuration popup to synchronize a folder
        **/
        private openChapooPopup(folder: models.projects.Folder) {
            let importController = ($scope: angular.IScope) => {
                let chapooSynchroPopupViewModel: cloud.ChapooSynchroPopupViewModel = new cloud.ChapooSynchroPopupViewModel(this._utility, this.$mdDialog, this._servicesManager, this._controllersManager, folder);
                chapooSynchroPopupViewModel.on("popupclosed", this.closeChapooPopoup, this);
                $scope["chapooSynchroPopupViewModel"] = chapooSynchroPopupViewModel;
                $scope["vm"] = this;
            };
            importController.$inject = ["$scope"];
            this.$mdDialog.show({
                clickOutsideToClose: false,
                templateUrl: "me/PartialView?module=Cloud&name=ChapooSyncPopup",
                fullscreen: true,
                controller: importController
            });
        }

        /**
        * Close the Chapoo synchronization popup
        **/
        private closeChapooPopoup() {
            this.refresh();
        }

        /**
        * Init the folderTreeActionViewModel
        **/
        private buildActions() {
            this._folderTreeActionViewModel = new ap.viewmodels.folders.FolderTreeActionViewModel(this._utility, this._controllersManager);
            this._folderTreeActionViewModel.on("importstructurefromproject", this.importStructure, this);
            this._folderTreeActionViewModel.on("collapseall", this.collapseAll, this);
            this._folderTreeActionViewModel.on("expandall", this.expandAll, this);
            this._folderTreeActionViewModel.on("addfolderrequested", this.addFolderRequestedHandler, this);
        }

        /**
        * Handle request add new folder
        **/
        private addFolderRequestedHandler() {
            this._controllersManager.projectController.requestAddFolder(this.listVm.docFolderVm.originalFolder);
        }

        /**
        * Method used to set the visibility enabled for the actions collapseAll and expandAll
        **/
        private manageActionVisibility() {
            if (this._folderTreeActionViewModel) {
                ap.viewmodels.home.ActionViewModel.getAction(this._folderTreeActionViewModel.actions, "foldertree.collapseall").isEnabled = false;
                ap.viewmodels.home.ActionViewModel.getAction(this._folderTreeActionViewModel.actions, "foldertree.expandall").isEnabled = false;

                for (let i = 0; i < this.listVm.sourceItems.length; i++) {
                    if (this.listVm.sourceItems[i]) {
                        if ((<ap.viewmodels.folders.FolderItemViewModel>this.listVm.sourceItems[i]).isExpanded) {
                            ap.viewmodels.home.ActionViewModel.getAction(this._folderTreeActionViewModel.actions, "foldertree.collapseall").isEnabled = true;
                        }
                        if (!(<ap.viewmodels.folders.FolderItemViewModel>this.listVm.sourceItems[i]).isExpanded) {
                            ap.viewmodels.home.ActionViewModel.getAction(this._folderTreeActionViewModel.actions, "foldertree.expandall").isEnabled = true;
                        }
                        if (ap.viewmodels.home.ActionViewModel.getAction(this._folderTreeActionViewModel.actions, "foldertree.collapseall").isEnabled && ap.viewmodels.home.ActionViewModel.getAction(this._folderTreeActionViewModel.actions, "foldertree.expandall").isEnabled) {
                            break;
                        }
                    }
                }
            }
        }

        /**
        * Method used to collapse all the folders
        **/
        private collapseAll() {
            for (let i = 0; i < this.listVm.sourceItems.length; i++) {
                if (this.listVm.sourceItems[i])
                    (<ap.viewmodels.folders.FolderItemViewModel>this.listVm.sourceItems[i]).isExpanded = false;
            }
        }

        /**
        * Method used to expand all the folders
        **/
        private expandAll() {
            for (let i = 0; i < this.listVm.sourceItems.length; i++) {
                if (this.listVm.sourceItems[i])
                    (<ap.viewmodels.folders.FolderItemViewModel>this.listVm.sourceItems[i]).isExpanded = true;
            }
        }

        /**
        * This method open the import structure dialog
        **/
        private importStructure() {
            let importController = ($scope: angular.IScope, $timeout: angular.ITimeoutService) => {
                let importFolderStructureViewModel: ImportFolderStructureViewModel = new ImportFolderStructureViewModel(this._utility, this._controllersManager, this._api, this.$mdDialog, this.$q, $scope, $timeout, this._servicesManager);
                importFolderStructureViewModel.load();
                $scope["importFolderStructureViewModel"] = importFolderStructureViewModel;
            };
            importController.$inject = ["$scope", "$timeout"];
            this.$mdDialog.show({
                clickOutsideToClose: false,
                templateUrl: "me/PartialView?module=Document&name=ImportFolderStructure",
                fullscreen: true,
                controller: importController
            }).then(() => {
                this.refresh();
            });
        }

        /**
        * This method edit the name of the folder
        * @param the folder to edit
        **/
        private editRequest(folder: ap.models.projects.Folder) {
            if (this._dialogOpening === true) return;

            this._dialogOpening = true;
            let item = <ap.viewmodels.folders.FolderItemViewModel>this.listVm.getEntityById(folder.Id);

            let editFolderController = ($scope: angular.IScope) => {
                let addEditFolderViewModel = new ap.viewmodels.folders.AddEditFolderViewModel(this._utility, this.$q, this.$mdDialog, this._controllersManager.projectController, item);
                $scope["vm"] = addEditFolderViewModel;
                $scope["item"] = item;
            };
            editFolderController.$inject = ["$scope"];
            this.$mdDialog.show({
                clickOutsideToClose: false,
                templateUrl: "me/PartialView?module=Document&name=AddEditDialogFolder",
                fullscreen: true,
                controller: editFolderController
            }).then(() => {
                this._dialogOpening = false;
            }, () => {
                this._dialogOpening = false;
            });
        }

        /**
        * This method add a new folder
        * @param newFolder the parent folder
        **/
        private addRequest(newFolder: ap.controllers.FolderAddEvent) {
            if (this._dialogOpening === true) return;

            this._dialogOpening = true;
            let param: ap.viewmodels.folders.FolderItemConstructorParameter = new ap.viewmodels.folders.FolderItemConstructorParameter(0, newFolder, null, null, this._utility, this._controllersManager, true);
            let item = new ap.viewmodels.folders.FolderItemViewModel(this._utility, this.$q, null, param);
            item.init(newFolder.childrenFolder);

            let addFolderController = ($scope: angular.IScope) => {
                let addEditFolderViewModel = new ap.viewmodels.folders.AddEditFolderViewModel(this._utility, this.$q, this.$mdDialog, this._controllersManager.projectController, item);
                $scope["vm"] = addEditFolderViewModel;
                $scope["item"] = item;
                $scope["title"] = this._utility.Translator.getTranslation("Add folder to") + " " + newFolder.parentFolder;
            };
            addFolderController.$inject = ["$scope"];
            this.$mdDialog.show({
                clickOutsideToClose: false,
                templateUrl: "me/PartialView?module=Document&name=AddEditDialogFolder",
                fullscreen: true,
                controller: addFolderController
            }).then(() => {
                this._dialogOpening = false;
            }, () => {
                this._dialogOpening = false;
            });
        }

        /**
        * This method update the folder list with the current changes
        * @param folderSavedEvent the folderSavedEvent return by the raise in save() method (projectController)
        **/
        private updateFolderList(folderSavedEvent: ap.controllers.FolderSavedEvent) {
            if (folderSavedEvent.wasNew) {
                // if a folder was added, then expand its parent
                let parentFolderVm: ap.viewmodels.folders.FolderItemViewModel = <ap.viewmodels.folders.FolderItemViewModel>this.listVm.getEntityById(folderSavedEvent.folderChangedResult.FolderChanged.ParentFolderId);
                if (!!parentFolderVm && !parentFolderVm.isExpanded)
                    parentFolderVm.isExpanded = true;
            }

            if (folderSavedEvent.folderChangedResult.OtherFolderChangedList.length > 0) {
                let loadsItem = this.listVm.getLoadedItemsIds();
                for (let i = 0; i < loadsItem.length; i++) {
                    for (let j = 0; j < folderSavedEvent.folderChangedResult.OtherFolderChangedList.length; j++) {
                        if (folderSavedEvent.folderChangedResult.OtherFolderChangedList[j].Id === loadsItem[i]) {
                            this.listVm.updateItem(folderSavedEvent.folderChangedResult.OtherFolderChangedList[j]);
                        }
                    }
                }
            }
            this.refresh();
        }

        /**
         * Event handler for folder's drop event
         * @param event Drop entity event
         */
        private folderDroppedHandler(event: ap.component.dragAndDrop.DropEntityEvent) {
            let dropZoneIndex = this._dragOptions.dropZones.indexOf(event.dropZone);
            let moveType: ap.models.projects.MoveType;
            switch (dropZoneIndex) {
                case 0:
                    moveType = ap.models.projects.MoveType.Before;
                    break;
                case 1:
                    moveType = ap.models.projects.MoveType.Inside;
                    break;
                default:
                    moveType = ap.models.projects.MoveType.After;
            }
            let dropTargetIndex = this.listVm.sourceItems.indexOf(<FolderItemViewModel>event.dropTarget);
            if ((<FolderItemViewModel>event.dragTarget).level === (<FolderItemViewModel>event.dropTarget).level) {
                if (<FolderItemViewModel>this.listVm.sourceItems[dropTargetIndex - 1] === event.dragTarget && moveType === ap.models.projects.MoveType.Before ||
                    <FolderItemViewModel>this.listVm.sourceItems[dropTargetIndex + 1] === event.dragTarget && moveType === ap.models.projects.MoveType.After) {
                    return;
                }
            } else {
                if (dropTargetIndex + 1 < this.listVm.sourceItems.length &&
                    <FolderItemViewModel>this.listVm.sourceItems[dropTargetIndex + 1] === event.dragTarget && moveType === ap.models.projects.MoveType.Inside) {
                    return;
                }
            }
            this._controllersManager.projectController.moveFolder(event.dragTarget.dragId, event.dropTarget.dragId, moveType);
        }

        /**
        * Item property changed event handler
        * @param args: PropertyChangedEventArgs the name of the modified proprety
        **/
        private itemPropertyChangedEventHandler(args: ap.viewmodels.base.PropertyChangedEventArgs) {
            if (args.propertyName === "isExpanded") {
                this.manageActionVisibility();
            }
        }

        /**
         * Page loaded handler
         * @param items Loaded items
         */
        private pageLoadedHandler(items: IEntityViewModel) {
            this.manageActionVisibility();
            this.manageMoveItems();
            this.listVm.sourceItems.forEach((item: IEntityViewModel) => {
                item.on("folderdropped", this.folderDroppedHandler, this);
                item.on("propertychanged", this.itemPropertyChangedEventHandler, this);
            });
            if (this._showAddFolder === null && this.listVm.docFolderVm && this.listVm.docFolderVm.folderItemActionViewModel) {
                let addAction = ap.viewmodels.home.ActionViewModel.getAction(this.listVm.docFolderVm.folderItemActionViewModel.actionGroups[1].actions, "folder.add");
                if (!addAction) {
                    throw new Error("No action \"folder.add\" was found for folder \"My documents\"");
                }
                this._showAddFolder = addAction.isVisible;
                if (this._showAddFolder === true) {
                    this._folderTreeActionViewModel.prependActions([addAction]);
                }
            }
        }

        /**
        * Method used to set the visibility of move actions depends of the place the item have in the list
        **/
        private manageMoveItems() {
            for (let i = 0, ilen = this.listVm.sourceItems.length; i < ilen; i++) {
                let item: FolderItemViewModel = <FolderItemViewModel>this.listVm.sourceItems[i];
                if (!item) {
                    continue;
                }

                item.initParentVm(true);
                if (item.folderItemActionViewModel) {
                    item.moveDownAvailable = !(item.isRootFolder || item.isLastItem());
                    item.moveUpAvailable = !(item.isRootFolder || item.isFirstItem());
                }
            }
        }

        /**
         * Move folder event listener
         * @param moveFolder Move folder object, returned from the API
         */
        private moveFolderListener(moveFolder: ap.models.projects.FolderMoved) {
            let changedFolder = moveFolder.FolderChangedResult.FolderChanged; // Updated drag target folder entity
            let otherChangedFolders = moveFolder.FolderChangedResult.OtherFolderChangedList; // Updated folders' data if needed
            let dragTargetParentId: string; // original parent id of a drag target entity
            let dragEntitiesCount = 1; // Count of entities ready for drop. Includes drag target (value "1" by default) and its subfolders
            let dropSubFoldersCount = 0; // Drop target' sub folders count
            let dragTargetVm: ap.viewmodels.folders.FolderItemViewModel; // Drag target view model
            let dropTargetVm: ap.viewmodels.folders.FolderItemViewModel; // Drop target view model
            let dragTargetIndex: number; // Drag target index
            let dropTargetIndex: number; // Drop index
            let startCheckDragTargetChildren = false; // true if item is a sub-folder of a drag target entity
            let startCheckDropTargetChildern = false; // true if item is a sub-folder of a drop target entity
            // Get info needed for drag and drop
            for (let i = 0; i < this.listVm.sourceItems.length; i++) {
                let item = <FolderItemViewModel>this.listVm.sourceItems[i];
                if (!item)
                    break;
                if (startCheckDragTargetChildren === true) {
                    if (dragTargetIndex && item.level > dragTargetVm.level) {
                        dragEntitiesCount += 1;
                    } else {
                        startCheckDragTargetChildren = false;
                    }
                }
                if (startCheckDropTargetChildern === true) {
                    if (dropTargetIndex && item.level > dropTargetVm.level) {
                        dropSubFoldersCount += 1;
                    } else {
                        startCheckDropTargetChildern = false;
                    }
                }
                if (item.originalFolder.Id === moveFolder.SourceFolderId) {
                    dragTargetVm = item;
                    dragTargetIndex = i;
                }
                if (item.originalFolder.Id === moveFolder.TargetFolderId) {
                    dropTargetVm = item;
                    dropTargetIndex = i;
                    if (moveFolder.MoveType === ap.models.projects.MoveType.After) {
                        startCheckDropTargetChildern = true;
                    }
                }
                if (item.originalFolder.Id === changedFolder.Id) {
                    dragTargetParentId = item.originalFolder.ParentFolderId;
                    changedFolder.Creator = item.originalFolder.Creator;
                    item.init(changedFolder);
                    let originalDragLevel = item.level;
                    startCheckDragTargetChildren = true;
                }
                if (otherChangedFolders && otherChangedFolders.length) {
                    for (let i = 0; i < otherChangedFolders.length; i++) {
                        if (item.originalFolder.Id === otherChangedFolders[i].Id) {
                            item.init(otherChangedFolders[i]);
                        }
                    }
                }
                // if all required data is received, there is no need to look into source items more
                if (!!dragTargetIndex && !!dropTargetIndex && !!dragTargetVm && !!dropTargetVm
                    && startCheckDragTargetChildren === false && startCheckDropTargetChildern === false)
                    break;
            }
            // if drop target or drag target is not found in the list - throw error
            if (!dragTargetIndex || !dropTargetIndex || !dragTargetVm || !dropTargetVm)
                throw new Error("Required draggable data is not defined");
            // Calculate parent's children count for draggable vm's parent folder and drop target's folder
            if (moveFolder.MoveType === ap.models.projects.MoveType.Inside) {
                dropTargetVm.hasChildren = true;
                dropTargetVm.setExpanded(true);
            }
            let draggableIsOnlyChild = this.listVm.sourceItems[dragTargetIndex - 1].originalEntity.Id === dragTargetParentId &&
                (this.listVm.sourceItems.length <= dragTargetIndex + 1 || (<FolderItemViewModel>this.listVm.sourceItems[dragTargetIndex + 1]).level < dragTargetVm.level);
            if (draggableIsOnlyChild === true) {
                let draggableEntityParent = <FolderItemViewModel>this.listVm.sourceItems[dragTargetIndex - 1];
                draggableEntityParent.setExpanded(false);
                draggableEntityParent.hasChildren = false;
            }
            // calculate difference between folder levels of drag target and drop target
            let levelDiff = dropTargetVm.level - dragTargetVm.level;
            switch (moveFolder.MoveType) {
                case ap.models.projects.MoveType.After:
                    dropTargetIndex += dropSubFoldersCount + 1;
                    break;
                case ap.models.projects.MoveType.Inside:
                    levelDiff += 1;
                    dropTargetIndex += 1;
                    break;
            }
            // Get entities to move
            let entitiesToMove = this.listVm.sourceItems.splice(dragTargetIndex, dragEntitiesCount); // cut drag target entity with its subfolders
            // Update level for draggable entities
            if (levelDiff !== 0) {
                entitiesToMove.forEach((entity: FolderItemViewModel, index: number) => {
                    entity.level += levelDiff;
                });
            }
            if (dragTargetIndex < dropTargetIndex)
                dropTargetIndex -= dragEntitiesCount;
            // Add moved entities to its drop position
            this.listVm.sourceItems.splice(dropTargetIndex, 0, ...entitiesToMove);
            // update tree list indexes
            let minDropIndex = Math.min(dragTargetIndex, dropTargetIndex);
            let maxDropIndex = minDropIndex === dragTargetIndex ? dropTargetIndex : dragTargetIndex;
            let maxUpdateIndex = maxDropIndex + dragEntitiesCount;
            for (let i = minDropIndex; i < maxUpdateIndex; i++) {
                let item = this.listVm.sourceItems[i];
                item.index = this.listVm.sourceItems.indexOf(item);
            }
            this.listVm.rebuildTreeList();
            this.manageMoveItems();
        }

        /**
         * Disable drop for draggable entity's subfolders to prevent drop into sub-folders
         * and raise event notifying that drag and drop process started
         */
        public dragStartHandler() {
            this._checkPreventDropForSubFolders(true);
            this._listener.raise("processdragging", true);
        }

        /**
         * Enable drop for all available folders (including entity's sub-folders) when drop is over
         * and raise event notifying that drag and drop process ended
         */
        public dragEndHandler() {
            this._checkPreventDropForSubFolders(false);
            this._listener.raise("processdragging", false);
        }

        /**
         * This method checks draggable entity's sub-folders and prevents/allows drop for them depending on the accepted flag value
         * @param preventDragging Flag indicating that we should prevent or allow drop for draggable entities
         */
        private _checkPreventDropForSubFolders(preventDragging: boolean = false) {
            if (!this._dragOptions.selectedData || !this._dragOptions.selectedData.length)
                return;
            let draggableFolder = <FolderItemViewModel>this.dragOptions.selectedData[0];
            let draggableEntityIndex = this.listVm.sourceItems.indexOf(draggableFolder);
            for (let i = draggableEntityIndex + 1; i < this.listVm.sourceItems.length; i++) {
                let folderItem = <FolderItemViewModel>this.listVm.sourceItems[i];
                if (!folderItem)
                    break;
                if (folderItem.level > draggableFolder.level) {
                    folderItem.preventDragging = preventDragging;
                } else {
                    break;
                }
            }
        }

        public addDraggableEntity(folderVm: FolderItemViewModel) {
            if (!folderVm)
                return;
            this._dragOptions.clearDraggable();
            this._dragOptions.addDraggable(folderVm);
        }

        /**
         * Initiliaze the customParams needed to load the list of folders
         */
        private _initializeCustomParams() {
            this.listVm.removeCustomParam("projectid");
            this.listVm.removeCustomParam("FolderType");

            if (this.projectId === null) {
                this.listVm.addCustomParam("projectid", this._controllersManager.mainController.currentProject().Id);
            } else {
                this.listVm.addCustomParam("projectid", this.projectId);
                this.listVm.addCustomParam("FolderType", ap.models.projects.FolderType[ap.models.projects.FolderType.Custom]);
            }
        }

        constructor(private $scope: ng.IScope, private _utility: ap.utility.UtilityHelper, private _api: ap.services.apiHelper.Api, private _controllersManager: ap.controllers.ControllersManager, private $mdDialog: angular.material.IDialogService,
            private $q: angular.IQService, private $timeout: angular.ITimeoutService, private _servicesManager: ap.services.ServicesManager, private isForDocumentModule: boolean, private _projectId: string = null) {

            this._listener = this._utility.EventTool.implementsListener(["processdragging"]);
            this._pathToLoad = "Creator";
            this.listVm = new FoldersPagedListViewModel(this._utility, _api, this.$q, $timeout, _servicesManager, _controllersManager, isForDocumentModule, FolderItemViewModel, this._pathToLoad, null, null, true);
            this.listVm.on("pageloaded", this.pageLoadedHandler, this);

            this._controllersManager.projectController.on("editfolderrequested", this.editRequest, this);
            this._controllersManager.projectController.on("addfolderrequested", this.addRequest, this);
            this._controllersManager.projectController.on("foldersaved", this.updateFolderList, this);
            this._controllersManager.projectController.on("folderdeleted", this.updateFolderList, this);
            this._controllersManager.projectController.on("foldermoved", this.moveFolderListener, this);
            this._controllersManager.projectController.on("syncchapoorequested", this.openChapooPopup, this);
            this._initializeCustomParams();

            if (this.isForDocumentModule)
                this.buildActions();
            this._dragOptions = new ap.component.dragAndDrop.DragOptions(this._utility, true, [
                new ap.component.dragAndDrop.DropZone("folder-upper-drop-position", "15px"),
                new ap.component.dragAndDrop.DropZone("inside-drop-position", "Full"),
                new ap.component.dragAndDrop.DropZone("folder-lower-drop-position", "15px")
            ]);
            this._showAddFolder = null;
        }

        private _listener: ap.utility.IListenerBuilder;
        private _addEditFolderViewModel: ap.viewmodels.folders.AddEditFolderViewModel;
        private _pathToLoad: string = "";
        private _folderTreeActionViewModel: ap.viewmodels.folders.FolderTreeActionViewModel = null;
        private _dialogOpening: boolean = false; // AP-12764
        private _dragOptions: ap.component.dragAndDrop.DragOptions;
        private _showAddFolder: boolean;
    }
}