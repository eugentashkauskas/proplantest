module ap.viewmodels.projects {
    export class IssueTypeListViewModel extends GenericPagedListViewModels {

        /**
        * this property is parent IssueType
        **/
        public set parentChapter(val: ap.viewmodels.projects.ChapterViewModel) {
            if (val !== this._parentChapter) {
                if (this._parentChapter) {
                    this._parentChapter.off("parentchapterupdated", this.parentChapterUpdated, this);
                }

                this._parentChapter = val;
                if (this._parentChapter) {
                    this._parentChapter.on("parentchapterupdated", this.parentChapterUpdated, this);
                }

                if (this._parentChapter && !this._parentChapter.isMarkedToDelete && this._parentChapter.isValid() && this._invalidItems.length === 0) {
                    this._addAction.isEnabled = true;
                    this._addAction.isVisible = true;
                } else {
                    this._addAction.isEnabled = false;
                }
            }
        }

        /**
        * To known if the list contains invalid items
        **/
        public get isValid(): boolean {
            return this._isValid;
        }

        /**
        * To know if validity issues are caused by child entities (subjects)
        **/
        public get isChildrensFault(): boolean {
            return this._isChildrensFault;
        }

        /**
        * To get checked items
        **/
        public get checkedItemsDict(): Dictionary<string, ap.models.projects.IssueType[]> {
            return this._checkedItemsDict;
        }

        /**
        * This property is actions array 
        **/
        public get actions(): ap.viewmodels.home.ActionViewModel[] {
            return this._actions;
        }

        /**
        * Use to select item in list
        * @param item is item in list to select
        **/
        public selectItem(item: IssueTypeViewModel) {
            if (this._isValid || (!!item && item.hasInvalidChildren)) {
                this.selectedViewModel = item;
                return true;
            }
            return false;
        }

        /**
        * This method is specify the ids of entities to load to avoid to load them from the api
        * @param ids is the list ids for the list
        **/
        specifyIds(ids: string[]) {
            this.setIds(ids);
        }

        /**
         * Clears the list view model
         */
        clear() {
            this._invalidItems = [];
            this._isChildrensFault = false;
            this._isValid = true;
            super.clear();
        }

        protected _clearItems() {
            if (this.sourceItems) {
                for (let i = 0, len = this.sourceItems.length; i < len; i++) {
                    let item: IEntityViewModel = this.sourceItems[i];
                    if (!!item && (!this.useCacheSystem || this.cacheData.values().indexOf(item) === -1)) {
                        // We should not dispose items in the cache because they are reusable
                        item.dispose();
                    }
                }

                // empty the array
                this.sourceItems.splice(0);
                this._count = 0;
            }
        }

        /**
        * An event handler for actions of the list (used in UI)
        * @param name is name of action
        **/
        public actionClickedHandler(name: string) {
            if (name === "issuetype.add") {
                this.issueTypeInsertRequested();
            }
        }

        /**
        * Disables all list's actions
        **/
        public disableActions() {
            this._actions.forEach((action) => {
                action.isEnabled = false;
            });
        }

        /**
        * Enables all list's actions
        **/
        public enableActions() {
            this._actions.forEach((action) => {
                action.isEnabled = true;
            });
        }

        /**
        * The way to know if one item has changed so the save button can be enable
        **/
        public get hasChanged(): boolean {
            return this._hasChanged;
        }

        /**
        * An accessor for a drag state object
        **/
        public get dragOptions(): ap.component.dragAndDrop.DragOptions {
            return this._dragOptions;
        }

        /**
        * Methode use to know if something has changed on the list to set the save button enable or disable
        * @param newValue true or false it depends if the list contains a changed element
        **/
        private set setHasChanged(newValue: boolean) {
            this._hasChanged = newValue;
            this._listener.raise("hasChanged", this._hasChanged);
        }

        /**
         * A handler for the drop event of list entries
         * @param event information about the event
         */
        private entityDroppedHandler(event: ap.component.dragAndDrop.DropEntityEvent) {
            this._listener.raise("entitydropped", event);
        }

        protected afterLoadPageSuccessHandler(arrayItem: IEntityViewModel[], index: number, pageDesc: PageDescription,
            createItemVmHandler?: new (utility: ap.utility.UtilityHelper, q: angular.IQService, parentListVm?: BaseListEntityViewModel, itemParameters?: ItemConstructorParameter) => IEntityViewModel,
            _pageLoadedParameters?: LoadPageSuccessHandlerParameter
        ) {
            let checkedItems: ap.models.projects.IssueType[] = [];
            if (!!this._parentChapter && this._checkedItemsDict.containsKey(this._parentChapter.originalEntity.Id)) {
                checkedItems = this._checkedItemsDict.getValue(this._parentChapter.originalEntity.Id);
            }

            for (let i = 0; i < arrayItem.length; i++) {
                let item = <IssueTypeViewModel>arrayItem[i];
                if (checkedItems.length > 0 && checkedItems.filter(entity => entity.Id === item.issueType.Id).length > 0) {
                    item.defaultChecked = true;
                }
                item.chapterViewModel = this._parentChapter;
                item.on("insertrowrequested", this.issueTypeInsertRequested, this);
                item.on("entitydropped", this.entityDroppedHandler, this);
                item.on("propertychanged", this.itemPropertyChanged, this);
            }
        }

        private requestChecked(issueType: ap.viewmodels.projects.IssueTypeViewModel) {
            if (issueType.isChecked) {
                if (this._checkedItemsDict.containsKey(issueType.issueType.ParentChapter.Id)) {
                    let arrIssueTypes = this._checkedItemsDict.getValue(issueType.issueType.ParentChapter.Id);
                    if (arrIssueTypes.filter(item => item.Id === issueType.issueType.Id).length === 0)
                        arrIssueTypes.push(issueType.issueType);
                } else {
                    this._checkedItemsDict.add(issueType.chapterViewModel.originalEntity.Id, [issueType.issueType]);
                }
            } else if (this._checkedItemsDict.containsKey(issueType.issueType.ParentChapter.Id)) {
                let arrIssueTypes = this._checkedItemsDict.getValue(issueType.issueType.ParentChapter.Id);
                for (let i = 0; i < arrIssueTypes.length; i++) {
                    if (arrIssueTypes[i].Id === issueType.issueType.Id) {
                        arrIssueTypes.splice(i, 1);
                        break;
                    }
                }
                if (arrIssueTypes.length === 0) {
                    this._checkedItemsDict.remove(issueType.issueType.ParentChapter.Id);
                }
            }
            this._listener.raise("itemchecked", issueType);
        }

        protected getCurrentEntityViewModelValuesToCheck(entityVm: IEntityViewModel): KeyValue<string, string>[] {
            return [];
        }

        /**
        * This method change _isValid property and raise propertychenged event
        **/
        private setIsValid(isValid: boolean) {
            if (this._isValid !== isValid) {
                this._isValid = isValid;
                this._listener.raise("propertychanged", new base.PropertyChangedEventArgs("isValid", this._isValid, this));
            }
        }

        /**
        * This method set IsValid state
        **/
        private checkIsValid() {
            if (this._invalidItems.length === 0 /* && !this.isDuplicated*/) {
                this.setIsValid(true);
            } else {
                this.setIsValid(false);
            }
        }

        /**
         * Drag start handler, raise event to temporarily disable other table's drag options
         */
        public dragStartHandler() {
            this._listener.raise("dragissuetype", true);
        }

        /**
         * Drag end handler, raise event to enable back other table's drag options
         */
        public dragEndHandler() {
            this._listener.raise("dragissuetype", false);
        }

        /*
        * Method call when the user cancel or save modifications.
        * Use to visually clean the screen (see in the view)
        */
        public clearInfo() {
            this.selectedViewModel = null;
        }

        /*
        * Cancel the vm ans reset the hasChanged flag
        */
        public cancel() {
            let modifiedIssueType: ap.viewmodels.projects.IssueTypeViewModel[] = <ap.viewmodels.projects.IssueTypeViewModel[]>this.getChangedItems();
            for (let i = 0; i < modifiedIssueType.length; i++) {
                let issueTypeVm: ap.viewmodels.projects.IssueTypeViewModel;
                issueTypeVm = modifiedIssueType[i];
                if (issueTypeVm.originalEntity.IsNew) {
                    this.sourceItems.splice(this.sourceItems.indexOf(issueTypeVm), 1);
                    this._setCount(this._count - 1);
                }
            }
            this.specifyIds([]);
            this._invalidItems.splice(0);
            this.setIsValid(true);
            this.setHasChanged = false;
            this.clearInfo();
        }

        /**
        *
        * @param name: string // the name of the property updated
        * @param oldValue: any // the old value of the property
        * @param caller: any // the Object which raised the event
        **/
        protected itemPropertyChanged(args: base.PropertyChangedEventArgs) {
            let issueType = <IssueTypeViewModel>args.caller;
            if (this.sourceItems.indexOf(issueType) < 0) {
                // Filter cached items which are not loaded at the moment
                return;
            }

            super.itemPropertyChanged(args);

            if (args.propertyName === "isChecked") {
                this.requestChecked(issueType);
            }
            else if (args.propertyName === "code" || args.propertyName === "description") {
                this.setHasChanged = issueType.hasChanged;
            }
            else if (args.propertyName === "delete") {
                if (!issueType.isValid() && issueType.isMarkedToDelete) {
                    if (this._invalidItems.indexOf(issueType) > -1) {
                        this._invalidItems.splice(this._invalidItems.indexOf(issueType), 1);
                    }
                }
            }
            else if (args.propertyName === "undelete") {
                if (!issueType.isValid() && !issueType.isMarkedToDelete) {
                    this._invalidItems.push(args.caller);
                }
            }
            else if (args.propertyName === "isValid") {
                let invalidIndex = this._invalidItems.indexOf(issueType);
                if (!issueType.isValid() && invalidIndex < 0) {
                    this._invalidItems.push(issueType);
                } else if (issueType.isValid() && invalidIndex >= 0) {
                    this._invalidItems.splice(invalidIndex, 1);
                }

                let hasInvalidSubjects = false;
                for (let invalidIssueType of this._invalidItems) {
                    if (invalidIssueType.hasInvalidChildren) {
                        hasInvalidSubjects = true;
                        break;
                    }
                }
                this._isChildrensFault = hasInvalidSubjects;
            }

            this.checkIsValid();
            this.setHasChanged = issueType.hasChanged;
        }

        /**
        * To insert a row when it rasie insert event
        **/
        private issueTypeInsertRequested(item?: IssueTypeViewModel) {
            let itemIndex = item ? this.sourceItems.indexOf(item) : this.sourceItems.length - 1;
            let parameters = new ItemConstructorParameter(itemIndex + 1, undefined, undefined, undefined, this.$utility);
            let newItem = new IssueTypeViewModel(this.$utility, undefined, undefined, parameters);
            let newEntity = new ap.models.projects.IssueType(this.$utility);
            let itemBefore, itemAfter;
            if (itemIndex >= 0) {
                itemBefore = <IssueTypeViewModel>this.getItemAtIndex(itemIndex);
                itemAfter = <IssueTypeViewModel>this.getItemAtIndex(itemIndex + 1);
            }
            if (itemAfter && item) {
                newEntity.DisplayOrder = Math.round((item.displayOrder + itemAfter.displayOrder) / 2);
            } else if (item) {
                // case when we are at the last element of the list
                newEntity.DisplayOrder = Math.round((item.displayOrder + 10000) / 2);
            } else {
                if (!itemBefore) {
                    newEntity.DisplayOrder = this.sourceItems.length !== 0 ? this.sourceItems.length + 10000 : 1;
                } else {
                    newEntity.DisplayOrder = itemBefore.displayOrder + 10000;
                }
            }
            newEntity.ParentChapter = <ap.models.projects.Chapter>this._parentChapter.originalEntity;
            newItem.init(newEntity);
            newItem.on("insertrowrequested", this.issueTypeInsertRequested, this);
            newItem.on("propertychanged", this.itemPropertyChanged, this);
            newItem.on("needtobeselected", this.selectIssueType, this);
            newItem.on("entitydropped", this.entityDroppedHandler, this);
            this._parentChapter.on("parentchapterupdated", this.parentChapterUpdated, this);
            this.insertItem(itemIndex + 1, newItem, true);
            this.updateItemsIndex(itemIndex + 1);
            this.selectEntity(newEntity.Id);
            // special UI logic to focus on new row
            ViewHelper.delayFocusElement(newItem.originalEntity.Id);
            this._invalidItems.push(newItem);
            this.setHasChanged = true;
            this.checkIsValid();
        }

        /**
         * This method use for update indexes in sourceItems
         * @param indexStart - index
         */
        public updateItemsIndex(indexStart) {
            for (let i = indexStart; i < this.sourceItems.length; i++) {
                if (!!this.sourceItems[i]) {
                    this.sourceItems[i].index = i;
                }
            }
        }

        protected beforeAddIntoCache(entityViewModel: IEntityViewModel): void {
            entityViewModel.on("insertrowrequested", this.issueTypeInsertRequested, this);
            entityViewModel.on("propertychanged", this.itemPropertyChanged, this);
            entityViewModel.on("needtobeselected", this.selectIssueType, this);
            entityViewModel.on("entitydropped", this.entityDroppedHandler, this);
        }

        protected _onPageLoaded(pageDesc: PageDescription, itemList: IEntityViewModel[]) {
            super._onPageLoaded(pageDesc, itemList);

            this.sourceItems.sort((fstItem: IssueTypeViewModel, sndItem: IssueTypeViewModel) => {
                return fstItem.displayOrder - sndItem.displayOrder;
            });
            this.updateItemsIndex(0);

            for (let item of itemList) {
                let issueType = <IssueTypeViewModel>item;
                if (!issueType.isValid()) {
                    this._invalidItems.push(issueType);
                    if (issueType.hasInvalidChildren) {
                        this._isChildrensFault = true;
                    }
                }
            }
            this.checkIsValid();

            if (this.$utility.isIE()) {
                this.manageMoveItemsActions();
            }
        }

        private selectIssueType(issueType: viewmodels.projects.IssueTypeViewModel) {
            this.selectedViewModel = issueType;
        }

        public parentChapterUpdated(chapter: ap.viewmodels.projects.ChapterViewModel) {
            for (let i = 0; i < this.sourceItems.length; i++) {
                if (<IssueTypeViewModel>this.sourceItems[i] && (<IssueTypeViewModel>this.sourceItems[i]).chapterViewModel !== chapter) {
                    (<IssueTypeViewModel>this.sourceItems[i]).chapterViewModel = chapter;
                    this.selectedViewModel = <IssueTypeViewModel>this.sourceItems[i];
                    (<IssueTypeViewModel>this.sourceItems[i]).issueTypeUpdated();
                }
            }
            if (chapter.isMarkedToDelete) {
                this._listener.raise("needToUnselect");
            }
        }

        /**
        * Method use to update modifications before saving
        **/
        public postChange(): ap.models.custom.ProjectPunchlists {
            let modifiedIssueType: ap.viewmodels.projects.IssueTypeViewModel[] = <ap.viewmodels.projects.IssueTypeViewModel[]>this.getChangedItems();
            let projectPunchList: ap.models.custom.ProjectPunchlists = new ap.models.custom.ProjectPunchlists(this.$utility, this._controllersManager.mainController.currentProject().Id);

            for (let i = 0; i < modifiedIssueType.length; i++) {
                let issueTypeVm: ap.viewmodels.projects.IssueTypeViewModel;
                issueTypeVm = modifiedIssueType[i];
                if (!issueTypeVm.originalEntity.IsNew && issueTypeVm.isMarkedToDelete) {
                    projectPunchList.IssueTypesToDelete.push(issueTypeVm.originalEntity.Id);
                }
                if (issueTypeVm.hasChanged && !issueTypeVm.isMarkedToDelete && !issueTypeVm.chapterViewModel.isMarkedToDelete) {
                    // issueTypeVm.postChanges();
                    projectPunchList.IssueTypesToUpdate.push(<ap.models.projects.IssueType>issueTypeVm.originalEntity);
                }
                if ((issueTypeVm.isMarkedToDelete || issueTypeVm.chapterViewModel.isMarkedToDelete) && issueTypeVm.originalEntity.IsNew) {
                    if (this.sourceItems.length > 0 && this.sourceItems.indexOf(issueTypeVm) > -1) {
                        this.sourceItems.splice(this.sourceItems.indexOf(issueTypeVm), 1);
                        this._setCount(this._count - 1);
                    }
                }
            }
            return projectPunchList;
        }

        /**
        * This method use for set isEnabled action in items
        **/
        public updateItemsActionsState(enable: boolean) {
            this.sourceItems.forEach((item: ap.viewmodels.projects.IssueTypeViewModel) => {
                if (enable) {
                    item.enableActions();
                } else {
                    if (this._invalidItems.indexOf(item) < 0) {
                        item.disableActions();
                    }
                }
            });
        }

        /**
        * This method use for set isChecked for items and save/remove in dictionary
        **/
        public setCheckedAllItems(check: boolean, id: string, issueTypes?: ap.models.projects.IssueType[]) {
            this._checkedItemsDict.remove(id);
            if (check && issueTypes.length > 0) {
                this._checkedItemsDict.add(id, issueTypes);
            }

            if (this.isLoaded && this.sourceItems.length > 0 && this._parentChapter.originalEntity.Id === id && (!check || check && issueTypes.length > 0)) {
                this.sourceItems.forEach((item) => { item.defaultChecked = check; });
            }
        }

        /**
        * Method used to update the visibility of move actions on every items of the list
        **/
        public manageMoveItemsActions() {
            for (let i = 0; i < this.sourceItems.length; i++) {
                let item = <IssueTypeViewModel>this.sourceItems[i];
                if (item) {
                    item.moveUpAvailable = true;
                    item.moveDownAvailable = true;
                    if (i === 0) {
                        item.moveUpAvailable = false;
                    }
                    if (i === this.count - 1) {
                        item.moveDownAvailable = false;
                    }
                }
            }
        }

        /**
         * This method use for move up/down entity and change displayOrder
         * @param moveType for know what direction for move: up or down 
         * @param dragged moved entity
         */
        public issueTypeMove(moveType: string, dragged: IssueTypeViewModel) {
            let dropped = <IssueTypeViewModel>this.getItemAtIndex(moveType === "moveup" ? dragged.index - 1 : dragged.index + 1);
            let dropEvent = new ap.component.dragAndDrop.DropEntityEvent(dragged, dropped);
            this.sourceItems.splice(dragged.index, 1);
            this.sourceItems.splice(dropped.index, 0, dragged);
            // update indexes after moving 
            let minIndex = Math.min(dragged.index, dropped.index);
            let maxIndex = Math.max(dragged.index, dropped.index);
            if (maxIndex >= this.sourceItems.length)
                throw new Error("Element index is more than items length");
            for (let i = minIndex; i <= maxIndex; i++) {
                this.sourceItems[i].index = i;
            }
            ap.utility.sortDraggableEntities(<IssueTypeViewModel[]>this.sourceItems, new component.dragAndDrop.DropEntityEvent(dragged, dropped));
            if (this.$utility.isIE()) {
                this.manageMoveItemsActions();
            }
        }

        dispose() {
            let cachedItems = this.cacheData.values();
            for (let i = 0, len = cachedItems.length; i < len; i++) {
                cachedItems[i].dispose();
            }

            super.dispose();
        }

        constructor(utility: ap.utility.UtilityHelper, $q: angular.IQService, private _controllersManager: ap.controllers.ControllersManager, private isForImportModule: boolean = false) {
            super(utility, _controllersManager.listController, $q, new GenericPagedListOptions(
                "IssueType", IssueTypeViewModel, isForImportModule ? "ParentChapter,NoteSubjects" : "ParentChapter", "DisplayOrder",
                null, null, null, null, null, null, 0, undefined, undefined, undefined, !isForImportModule
            ));
            this.isDeferredLoadingMode = true;
            this._addAction = new ap.viewmodels.home.ActionViewModel(utility, utility.EventTool, "issuetype.add", "/Images/html/icons/ic_add_black_48px.svg", true, null, "Add subcategory", true);
            this._actions = [this._addAction];
            this._invalidItems = [];
            this._isValid = true;
            this._listener.addEventsName(["needToUnselect", "dragissuetype", "entitydropped"]);
            this._dragOptions = new ap.component.dragAndDrop.DragOptions(utility, false);
        }

        private _addAction: ap.viewmodels.home.ActionViewModel;
        private _actions: ap.viewmodels.home.ActionViewModel[];
        private _checkedItemsDict: Dictionary<string, ap.models.projects.IssueType[]> = new Dictionary<string, ap.models.projects.IssueType[]>();
        private _invalidItems: IssueTypeViewModel[];
        private _isValid: boolean;
        private _parentChapter: ap.viewmodels.projects.ChapterViewModel;
        private _hasChanged: boolean = false;
        private _isChildrensFault: boolean = false;
        private _dragOptions: ap.component.dragAndDrop.DragOptions;
    }
}