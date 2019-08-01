module ap.viewmodels.folders {
    export class FolderItemViewModel extends ap.viewmodels.TreeEntityViewModel implements ap.component.dragAndDrop.IDraggableEntityViewModel {

        public folderType: string;
        public isSync: boolean = false;

        public get planNumber(): number {
            return this._planNumber;
        }

        public set planNumber(planNumber: number) {
            let planNumberDiff = planNumber - this._planNumber;
            this._planNumber = planNumber;
            if (this._parentFolderVm) {
                this._parentFolderVm.subFoldersPlanNumber += planNumberDiff;
            }
            this._totalPlanNumber = this._planNumber + this._subFoldersPlanNumber;
        }

        public get subFoldersPlanNumber() {
            return this._subFoldersPlanNumber;
        }

        public set subFoldersPlanNumber(subFoldersPlanNumber: number) {
            let subFoldersPlanNumberDiff = subFoldersPlanNumber - this._subFoldersPlanNumber;
            this._subFoldersPlanNumber = subFoldersPlanNumber;
            if (this._parentFolderVm) {
                this._parentFolderVm.subFoldersPlanNumber += subFoldersPlanNumberDiff;
            }
            this._totalPlanNumber = this._planNumber + this._subFoldersPlanNumber;
        }

        public get totalPlanNumber() {
            return this._totalPlanNumber;
        }

        /**
         * The name of the folder
         **/
        public get name(): string {
            return this._name;
        }

        public set name(val: string) {
            if (this._name !== val) {
                this._name = val;
                this.calculateCanSave();
            }
        }

        /**
         * This value is to know if the folder can be saved (name cannot be null or empty)
         **/
        public get canSave(): boolean {
            return this._canSave;
        }

        /**
        * To get the folder
        **/
        public get originalFolder(): ap.models.projects.Folder {
            return <ap.models.projects.Folder>this.originalEntity;
        }

        /**
        * This is the vm to manage the actions of the folder
        **/
        public get folderItemActionViewModel(): FolderItemActionViewModel {
            return this._folderItemActionViewModel;
        }

        /**
        * Return draggable entity's ID
        **/
        public get dragId() {
            return this.originalFolder.Id;
        }

        /**
        * Return draggable entity's display order property
        **/
        public get displayOrder() {
            return this._displayOrder;
        }

        /**
        * Set draggable entity's display order property
        **/
        public set displayOrder(displayOrder: number) {
            this._displayOrder = displayOrder;
        }

        /**
        * Set this property to prevent drag and drop for this sub-folder (for example, if drop folder is a sub-folder for a draggable folder)
        **/
        public set preventDragging(preventDragging: boolean) {
            this._preventDragging = preventDragging;
        }

        /**
         * Return true if drag and drop is allowed for the entity
         */
        public allowDrag() {
            return !this.originalFolder.isRootFolder && !this._preventDragging;
        }

        /**
        * Used to get the visibility of move down button
        **/
        public get moveDownAvailable(): boolean {
            return this._moveDownAvailable;
        }

        /**
        * Used to set the visibility of move down button
        **/
        public set moveDownAvailable(value: boolean) {
            if (this._moveDownAvailable !== value) {
                let oldValue = this._moveDownAvailable;
                this._moveDownAvailable = value;
                this.raisePropertyChanged("moveDownAvailable", oldValue, this);
            }
        }

        /**
        * Used to get the visibility of move up button
        **/
        public get moveUpAvailable(): boolean {
            return this._moveUpAvailable;
        }

        /**
        * Used to set the visibility of move up button
        **/
        public set moveUpAvailable(value: boolean) {
            if (this._moveUpAvailable !== value) {
                let oldValue = this._moveUpAvailable;
                this._moveUpAvailable = value;
                this.raisePropertyChanged("moveUpAvailable", oldValue, this);
            }
        }

        /**
         * Processing entity's drop logic, return false to prevent default html's drop
         * @param dropTarget An entity being dropped
         * @param dropZone Current entity's drop zone
         */
        public drop(dropTarget: ap.component.dragAndDrop.IDraggableEntityViewModel, dropZone?: ap.component.dragAndDrop.DropZone) {
            if (!!dropZone && (<FolderItemViewModel>dropTarget).originalFolder.Id !== this.originalFolder.Id) {
                this._listener.raise("folderdropped", new ap.component.dragAndDrop.DropEntityEvent(this, dropTarget, dropZone));
            }
            return false;
        }

        /**
        * Method used to move the folder up
        **/
        public folderMoveUp() {
            let itemList = <ap.viewmodels.folders.FoldersPagedListViewModel>this.parentList;
            let prevItem: ap.viewmodels.folders.FolderItemViewModel;
            for (let i = this.index - 1; i > 0; i--) {
                let folderItem = <ap.viewmodels.folders.FolderItemViewModel>itemList.sourceItems[i];
                if (folderItem.level === this.level) {
                    prevItem = folderItem;
                    break;
                }
            }
            if (prevItem) {
                this._parameters.projectController.moveFolder(this.originalEntity.Id, prevItem.originalEntity.Id, models.projects.MoveType.Before);
            }
        }

        /**
        * Method used to move the folder down
        **/
        public folderMoveDown() {
            let itemList = <ap.viewmodels.folders.FoldersPagedListViewModel>this.parentList;
            let nextItem: ap.viewmodels.folders.FolderItemViewModel;
            for (let i = this.index + 1; i < itemList.sourceItems.length; i++) {
                let folderItem = <ap.viewmodels.folders.FolderItemViewModel>itemList.sourceItems[i];
                if (folderItem.isRootFolder)
                    break;
                if (folderItem.level === this.level) {
                    ///// continue
                    nextItem = folderItem;
                    break;
                }
            }
            if (nextItem) {
                this._parameters.projectController.moveFolder(this.originalEntity.Id, nextItem.originalEntity.Id, models.projects.MoveType.After);
            }
        }

        public copySource(): void {
            super.copySource();
            if (this.originalFolder) {
                this.name = this.originalFolder.Name;
                this.folderType = this.originalFolder.FolderType;
                this.isSync = this.originalFolder.SynchroType !== ap.models.cloud.SynchroType.None;
                this._displayOrder = this.originalFolder.DisplayOrder;
                if (this.originalFolder.Id === ap.models.projects.Folder.DocumentStepFolderId ||
                    this.originalFolder.Id === ap.models.projects.Folder.PhotosStepFolderId ||
                    this.originalFolder.Id === ap.models.projects.Folder.ReportsStepFolderId) {
                    this._isRootFolder = true;
                }
            }
            else {
                this.name = null;
            }
            // if it is for document module
            if (this._parameters && this._parameters.withActions) {
                if (this._folderItemActionViewModel) {
                    this._folderItemActionViewModel.dispose();
                }
                this._folderItemActionViewModel = new ap.viewmodels.folders.FolderItemActionViewModel(this.$utility, this._parameters.projectController, this, this._parameters.mainController, this._parameters.documentController);
                this._folderItemActionViewModel.on("movefolderup", this.folderMoveUp, this);
                this._folderItemActionViewModel.on("movefolderdown", this.folderMoveDown, this);
            }

            if (!!this._foldersVisiblityViewModel && this.getChangedFolderVisibilities().length > 0) {
                this.getChangedFolderVisibilities().forEach((item) => { item.setDefaultAccess(); });
            }

            this.calculateCanSave();

            if (this.folderType !== ap.models.projects.FolderType[ap.models.projects.FolderType.Custom]) {
                this.$utility.Translator.on("languagechanged", this._languageChanged, this);
            }
        }

        /**
         * Language changed handler
         */
        private _languageChanged() {
            let fType: string = ap.models.projects.FolderType[ap.models.projects.FolderType.Photo];

            if (this.originalFolder.Creator && this.originalFolder.Creator.Id !== this.$utility.UserContext.CurrentUser().Id) {
                let prefix = this.originalFolder.FolderType === fType ? this.$utility.Translator.getTranslation("Pictures") : this.$utility.Translator.getTranslation("Reports");
                this.name = prefix + " - " + this.originalFolder.Creator.Alias;
            }
            else {
                this.name = this.originalFolder.FolderType === fType ? this.$utility.Translator.getTranslation("My pictures") : this.$utility.Translator.getTranslation("My reports");
            }
        }

        public postChanges(): void {
            super.postChanges();
            this.originalFolder.Name = this.name;
        }

        dispose() {
            super.dispose();
            if (this._folderItemActionViewModel)
                this._folderItemActionViewModel.dispose();
            this.$utility.Translator.off("languagechanged", this._languageChanged, this);
        }

        /**
        * Get isRootFolder is a propretie used to know if the original folder is a system folder
        **/
        public get isRootFolder() {
            return this._isRootFolder;
        }

        private calculateCanSave() {
            this._canSave = !StringHelper.isNullOrWhiteSpace(this._name);
        }

        // ******************
        // This part should be merged to another ViewModel inheriting of this class

        /**
        * To get the list of folderVisibilityViewModel of the folder
        */
        public get foldersVisibilityViewModel(): ap.viewmodels.projectcontacts.FolderVisibilityViewModel[] {
            return this._foldersVisiblityViewModel;
        }

        public set foldersVisibilityViewModel(newValue: ap.viewmodels.projectcontacts.FolderVisibilityViewModel[]) {
            this._foldersVisiblityViewModel = newValue;
        }

        /**
        * To get the index of the current page of FolderVisibilityViewModel
        */
        public get currentVisibilityPage(): number {
            return this._currentVisibilityPage;
        }

        public set currentVisibilityPage(newValue: number) {
            this._currentVisibilityPage = newValue;

            this.setCurrentFoldersVisibility();
        }

        /**
        * Private member to initialize the current page of FolderVisibilityViewModel
        */
        private setCurrentFoldersVisibility() {
            // update the current visibilities when the page changes
            let startIndex: number = this._currentVisibilityPage * this._visibilityPageSize;
            let endIndex: number = startIndex + this._visibilityPageSize < this.foldersVisibilityViewModel.length ? startIndex + this._visibilityPageSize : this.foldersVisibilityViewModel.length;
            this._currentFoldersVisibility = this.foldersVisibilityViewModel.slice(startIndex, endIndex);
        }

        /**
        * This method use for set hasAccess folder for contact
        * @idContact param id contact for which set access
        * @access param for know set/unset hasAccess
        **/
        public setHasAccessFolderVisibility(idContact: string, access: boolean) {
            for (let i = 0; i < this.currentFoldersVisibility.length; i++) {
                if (this.currentFoldersVisibility[i].canChange && this.currentFoldersVisibility[i].contact.Id === idContact) {
                    this.currentFoldersVisibility[i].hasAccess = access;
                }
            }
        }

        /**
        * To get the current page of FolderVisibilityViewModel
        * In the manage screen, we only display 10 elements by 10 elements.  This property is then an array containing the 10 FolderVisibilityViewModel
        */
        public get currentFoldersVisibility(): ap.viewmodels.projectcontacts.FolderVisibilityViewModel[] {
            return this._currentFoldersVisibility;
        }

        public get visibilityPageSize(): number {
            return this._visibilityPageSize;
        }

        /**
        * This method for get changed FolderVisibilities
        **/
        public getChangedFolderVisibilities(): ap.viewmodels.projectcontacts.FolderVisibilityViewModel[] {
            let changedFolderVisibilities: ap.viewmodels.projectcontacts.FolderVisibilityViewModel[] = [];
            for (let i = 0; i < this._foldersVisiblityViewModel.length; i++) {
                if (this._foldersVisiblityViewModel[i].hasChanged)
                    changedFolderVisibilities.push(this._foldersVisiblityViewModel[i]);
            }
            return changedFolderVisibilities;
        }

        /**
        * Method used to know if the folder is the first one of his level
        **/
        public isFirstItem(): boolean {
            for (let i = this.index - 1; i >= 0; i--) {
                let prevItem = <ap.viewmodels.folders.FolderItemViewModel>this.parentList.sourceItems[i];
                if (!prevItem) {
                    return true;
                }
                if (prevItem.level === this.level) {
                    return false;
                }
                if (prevItem.level < this.level || prevItem.isRootFolder) {
                    return true;
                }
            }
            return true;
        }

        /**
       * Method used to know if the folder is the last one of his level
       **/
        public isLastItem(): boolean {
            for (let i = this.index + 1, ilen = this.parentList.sourceItems.length; i < ilen; i++) {
                let nextItem = <ap.viewmodels.folders.FolderItemViewModel>this.parentList.sourceItems[i];
                if (!nextItem) {
                    return true;
                }
                if (nextItem.isRootFolder || nextItem.level < this.level) {
                    return true;
                }
                if (nextItem.level === this.level) {
                    return false;
                }
            }
            return true;
        }

        public initParentVm(refreshPlansCount: boolean = false) {
            if (this.parentList && !this._isRootFolder) {
                for (let i = this._parameters.itemIndex - 1; i >= 0; i--) {
                    let folderItem = <ap.viewmodels.folders.FolderItemViewModel>this.parentList.sourceItems[i];
                    if (!folderItem) {
                        break;
                    }

                    if (folderItem.level === this.level - 1) {
                        // if parent folder have been changed (for example, if current item moved)
                        // update parent's documents count
                        if (refreshPlansCount && this._parentFolderVm && folderItem !== this._parentFolderVm) {
                            folderItem.subFoldersPlanNumber += this.planNumber;
                            this._parentFolderVm.subFoldersPlanNumber -= this.planNumber;
                        }
                        this._parentFolderVm = folderItem;
                        break;
                    }
                }
            }
        }

        /**
         * Initialize folder's parent VM when page is loaded
         **/
        private pageLoadedHandler() {
            this.initParentVm();
        }

        constructor(utility: ap.utility.UtilityHelper, q: angular.IQService, parentListVm?: ap.viewmodels.BaseListEntityViewModel, parameters?: ItemConstructorParameter) {
            super(utility, parentListVm, parameters);
            this._listener.addEventsName(["folderdropped"]);
            if (parameters && parameters instanceof ap.viewmodels.folders.FolderItemConstructorParameter) {
                this._parameters = <ap.viewmodels.folders.FolderItemConstructorParameter>parameters;
            } else {
                this._parameters = null;
            }
            if (parentListVm) {
                parentListVm.on("pageloaded", this.pageLoadedHandler, this);
            }
        }

        // PRIVATE
        private _isRootFolder: boolean = false;
        private _canSave: boolean = false;
        private _name: string;
        private _folderItemActionViewModel: ap.viewmodels.folders.FolderItemActionViewModel = null;
        private _parameters: ap.viewmodels.folders.FolderItemConstructorParameter;
        private _foldersVisiblityViewModel: ap.viewmodels.projectcontacts.FolderVisibilityViewModel[] = [];
        private _currentVisibilityPage: number;
        private _currentFoldersVisibility: ap.viewmodels.projectcontacts.FolderVisibilityViewModel[] = [];
        private _visibilityPageSize: number = 10;
        private _displayOrder: number;
        private _preventDragging: boolean = false;
        private _moveUpAvailable: boolean = false;
        private _moveDownAvailable: boolean = false;
        private _planNumber: number = 0; // keep count of item's files without its subfolders
        private _subFoldersPlanNumber: number = 0; // keep sum of folder's children plans
        private _totalPlanNumber: number = 0; // total plans count
        private _parentFolderVm: ap.viewmodels.folders.FolderItemViewModel;
    }
}