module ap.viewmodels.projects {
    export class ChapterListViewModel extends GenericPagedListViewModels {

        /**
        * Method used to know if the user's browser is IE (need in UI)
        **/
        public get isIE(): boolean {
            return this.$utility.isIE();
        }

        /**
        * To known if the list contains invalid items
        **/
        public isValid(): boolean {
            return this._isValid;
        }

        /**
        * To know if the validity issues are caused by child entities (issue types or subjects)
        **/
        public get isChildrensFault(): boolean {
            return this._isChildrensFault;
        }

        /**
        * An accessor for a drag state object
        **/
        public get dragOptions(): ap.component.dragAndDrop.DragOptions {
            return this._dragOptions;
        }

        /**
        * This method is used to set isValid property
        * @param isValid the new value of the property
        **/
        private set setIsValid(isValid: boolean) {
            if (this._isValid !== isValid) {
                this._isValid = isValid;
                this._listener.raise("propertychanged", new base.PropertyChangedEventArgs("isValid", this._isValid, this));
            } else if (this._isValid === true && isValid === true) {
                this.updateItemsActionsState(true);
            }
            this._addAction.isEnabled = this._isValid;
        }

        /**
        * Method use to set isValid value depends on invalidItems.length
        **/
        private checkIsValid() {
            this.setIsValid = this._invalidItems.length === 0 && !this.isDuplicated;
            this._dragOptions.isEnabled = this._isValid;
        }

        /**
         * Drag start handler, raise event to temporarily disable other table's drag options
         */
        public dragStartHandler() {
            this._listener.raise("dragchapter", true);
        }

        /**
         * Drag end handler, raise event to enable back other table's drag options
         */
        public dragEndHandler() {
            this._listener.raise("dragchapter", false);
        }

        /**
        * Method use to check duplicated code and if the list is valid when an item of the list changed
        * @param name: string // the name of the property updated
        * @param oldValue: any // the old value of the property
        * @param caller: any // the Object which raised the event
        **/
        private chapterPropertyChanged(args: ap.viewmodels.base.PropertyChangedEventArgs) {
            let chapter = <ChapterViewModel>args.caller;

            if (args.propertyName === "isChecked") {
                this.requestChecked(chapter);
            }
            else if (args.propertyName === "code" || args.propertyName === "description") {
                this.checkForDuplicatedItems(chapter);
            }
            else if (args.propertyName === "isValid") {
                let invalidIndex = this._invalidItems.indexOf(chapter);

                if (!chapter.isValid() && invalidIndex < 0) {
                    this._invalidItems.push(chapter);
                } else if (chapter.isValid() && invalidIndex > -1) {
                    this._invalidItems.splice(invalidIndex, 1);
                }

                let hasInvalidIssueTypes = false;
                for (let invalidChapter of this._invalidItems) {
                    if (invalidChapter.hasInvalidChildren) {
                        hasInvalidIssueTypes = true;
                        break;
                    }
                }

                this._isChildrensFault = hasInvalidIssueTypes;
            }
            else if (args.propertyName === "delete") {
                if (!chapter.isValid() && chapter.isMarkedToDelete) {
                    if (this._invalidItems.indexOf(chapter) > -1) {
                        this._invalidItems.splice(this._invalidItems.indexOf(chapter), 1);
                    }
                }
                chapter.isDuplicated = false;

                for (let j = 0; j < this.valuesIdsDictionary.length; j++) {
                    let keys = this.valuesIdsDictionary[j].keys();
                    for (let i = 0; i < keys.length; i++) {
                        let v = this.valuesIdsDictionary[j].getValue(keys[i]);
                        let index = v.indexOf(chapter.originalEntity.Id);
                        if (index !== -1) {
                            v.splice(index, 1);
                            this.valuesIdsDictionary[j].remove(keys[i]);
                            if (v.length !== 0) {
                                this.valuesIdsDictionary[j].add(keys[i], v);
                            }
                        }
                    }
                    this.idValuesDictionary.remove(chapter.originalEntity.Id);
                }

                let duplicatedItems = this.getDuplicatedItems().filter(
                    (item: ChapterViewModel) => item.code === chapter.code && item.description === chapter.description
                );
                if (duplicatedItems.length === 1) {
                    duplicatedItems[0].isDuplicated = false;
                    this.checkIsDuplicated();
                    if (!StringHelper.isNullOrEmpty((<ChapterViewModel>duplicatedItems[0]).code) && !StringHelper.isNullOrEmpty((<ChapterViewModel>duplicatedItems[0]).description)) {
                        this._invalidItems = [];
                    }
                    this.checkIsValid();
                }
                this._listener.raise("chapterdelete", chapter);
            }
            else if (args.propertyName === "undelete") {
                if (!chapter.isValid() && !chapter.isMarkedToDelete) {
                    this._invalidItems.push(chapter);
                }

                if (this.valuesIdsDictionary[0].containsKey(chapter.code)) {
                    let value = this.valuesIdsDictionary[0].getValue(chapter.code);
                    value.push(chapter.originalEntity.Id);
                    this.valuesIdsDictionary[0].remove(chapter.code);
                    this.valuesIdsDictionary[0].add(chapter.code, value);
                } else {
                    this.valuesIdsDictionary[0].add(chapter.code, [chapter.originalEntity.Id]);
                }
                if (this.valuesIdsDictionary[1].containsKey(chapter.description)) {
                    let value = this.valuesIdsDictionary[1].getValue(chapter.description);
                    value.push(chapter.originalEntity.Id);
                    this.valuesIdsDictionary[1].remove(chapter.description);
                    this.valuesIdsDictionary[1].add(chapter.description, value);
                } else {
                    this.valuesIdsDictionary[1].add(chapter.description, [chapter.originalEntity.Id]);
                }

                this.initDuplicatedData(chapter);
                this.checkForDuplicatedItems(chapter);
                this._listener.raise("chapterdelete", chapter);
            }

            this.checkIsDuplicated();
            this.checkIsValid();
            this.setHasChanged = chapter.hasChanged;
        }

        /**
        * Use to select item in list
        * @param item is item in list
        **/
        public selectItem(item: ChapterViewModel) {
            if (this.isValid() || (!!item && item.hasInvalidChildren)) {
                this.selectedViewModel = item;
                return true;
            }
            return false;
        }

        /**
        * The way to know if one item has changed so the save button can be enable
        **/
        public get hasChanged(): boolean {
            return this._hasChanged;
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
        * This property is actions array 
        **/
        public get actions(): ap.viewmodels.home.ActionViewModel[] {
            return this._actions;
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
            let modifiedChapters: ap.viewmodels.projects.ChapterViewModel[] = <ap.viewmodels.projects.ChapterViewModel[]>this.getChangedItems();
            for (let i = 0; i < modifiedChapters.length; i++) {
                let chapterVm: ap.viewmodels.projects.ChapterViewModel = modifiedChapters[i];

                if (chapterVm.originalEntity.IsNew && this.sourceItems.indexOf(chapterVm) > -1 ) {
                    let code: string;
                    if (chapterVm.code) {
                        code = chapterVm.code.toUpperCase();
                    } else {
                        code = chapterVm.code;
                    }
                    let description: string;
                    if (chapterVm.description) {
                        description = chapterVm.description.toUpperCase();
                    } else {
                        description = chapterVm.description;
                    }
                    let tab = [code, description];
                    for (let i = 0; i < this.valuesIdsDictionary.length; i++) {
                        let v = this.valuesIdsDictionary[i].getValue(tab[i]);
                        if (v) {
                            let index = v.indexOf(chapterVm.originalEntity.Id);
                            if (index !== -1) {
                                v.splice(index, 1);
                                this.valuesIdsDictionary[i].remove(tab[i]);
                                if (v.length !== 0) {
                                    this.valuesIdsDictionary[i].add(tab[i], v);
                                }
                            }
                        }
                    }
                    this.idValuesDictionary.remove(chapterVm.originalEntity.Id);
                    this.sourceItems.splice(this.sourceItems.indexOf(chapterVm), 1);
                    this._setCount(this._count - 1);
                }
            }
            this._invalidItems.splice(0);
            this.clearInfo();
            this.setHasChanged = false;
            this.setIsValid = true;
        }

        /**
         * This method is specify the ids of entities to load to avoid to load them from the api
         * @param ids is the list ids for the list
         **/
        specifyIds(ids: string[]) {
            this.setIds(ids);
            this.preloadDuplicatedData(ids);
        }

        /**
         * This method fetches and initializes information about duplicated values in the list. Unlike the loadPage method, this method
         * loads a minimal possible amount of information about all items in the list in one request. Otherwise it may not be possible
         * to perform duplicates check for new items if not a whole list is loaded in the UI.
         * @param ids a list of ids for the list
         */
        private preloadDuplicatedData(ids: string[]) {
            this.projectService.getProjectChapters(ids, "Id,Code,Description", true, true).then((chapters: ap.models.projects.Chapter[]) => {
                if (!chapters) {
                    // this check because a project can have no issue types
                    return;
                }

                // Initialize duplicated dictionaries
                this.clearDuplicatedData();
                for (let chapter of chapters) {
                    let chapterVm = new ap.viewmodels.projects.ChapterViewModel(this.$utility);
                    chapterVm.init(chapter);
                    this.initDuplicatedData(chapterVm);
                }

                if (this.isLoaded) {
                    // If some real items are already loaded, than we have to check them for duplicates.
                    // It was impossible to perform this check when they were loaded.
                    for (let chapter of this.sourceItems) {
                        this.checkForDuplicatedItems(chapter);
                    }
                }
            });
        }

        /**
         * A handler for the drop event of list entries
         * @param event information about the event
         */
        private entityDroppedHandler(event: ap.component.dragAndDrop.DropEntityEvent) {
            this._listener.raise("entitydropped", event);
        }

        protected getCurrentEntityViewModelValuesToCheck(entityVm: IEntityViewModel): KeyValue<string, string>[] {
            if (entityVm && entityVm !== null) {
                let chapterVm = <ChapterViewModel>entityVm;
                let code = chapterVm.code;
                let description = chapterVm.description;
                if (code) {
                    code = code.toUpperCase();
                }
                if (description) {
                    description = description.toUpperCase();
                }
                return [new KeyValue<string, string>("code", code), new KeyValue<string, string>("description", description)];
            }
            return [];
        }

        protected afterLoadPageSuccessHandler(arrayItem: IEntityViewModel[], index: number, pageDesc: PageDescription, createItemVmHandler?: new (utility: ap.utility.UtilityHelper, q: angular.IQService, parentListVm?: BaseListEntityViewModel, itemParameters?: ItemConstructorParameter) => IEntityViewModel, _pageLoadedParameters?: LoadPageSuccessHandlerParameter) {
            for (let i = 0; i < arrayItem.length; i++) {
                arrayItem[i].on("insertrowrequested", this.chaptertInsertRequested, this);
                arrayItem[i].on("needtobeselected", this.selectChapter, this);
                arrayItem[i].on("propertychanged", this.chapterPropertyChanged, this);
                arrayItem[i].on("entitydropped", this.entityDroppedHandler, this);

                if (this.idValuesDictionary.count > 0) {
                    // Duplicated data is already loaded, so we can check for duplicates.
                    // Otherwise duplicates will be checked once duplicated data is loaded by the preloadDuplicatedData method.
                    this.checkForDuplicatedItems(arrayItem[i], arrayItem);
                }
            }
        }

        protected _onPageLoaded(pageDesc: PageDescription, itemList: IEntityViewModel[]) {
            super._onPageLoaded(pageDesc, itemList);
            if (this.$utility.isIE()) {
                this.manageMoveItemsActions();
            }
        }

        private requestChecked(chap: ap.viewmodels.projects.ChapterViewModel) {
            this._listener.raise("itemchecked", chap);
        }

        /**
        * To insert a row when it rasie insert event
        **/
        private chaptertInsertRequested(chapter?: ChapterViewModel) {
            let itemIndex = chapter ? this.sourceItems.indexOf(chapter) : this.sourceItems.length - 1;
            let parameters = new ItemConstructorParameter(itemIndex + 1, undefined, undefined, undefined, this.$utility);
            let newItem = new ChapterViewModel(this.$utility, undefined, undefined, parameters);
            let newEntity = new ap.models.projects.Chapter(this.$utility);
            newEntity.ProjectId = this._controllersManager.mainController.currentProject().Id;
            let itemBefore, itemAfter;
            if (itemIndex >= 0) {
                itemBefore = <ChapterViewModel>this.getItemAtIndex(itemIndex);
                itemAfter = <ChapterViewModel>this.getItemAtIndex(itemIndex + 1);
            }
            if (itemAfter && chapter) {
                newEntity.DisplayOrder = Math.round((chapter.displayOrder + itemAfter.displayOrder) / 2);
            } else if (chapter) {
                // case when we are at the last element of the list
                newEntity.DisplayOrder = chapter.displayOrder + 10000;
            } else {
                if (!itemBefore) {
                    newEntity.DisplayOrder = this.sourceItems.length !== 0 ? this.sourceItems.length + 10000 : 1;
                } else {
                    newEntity.DisplayOrder = itemBefore.displayOrder + 10000;
                }
            }
            newItem.init(newEntity);
            this._updateDictionaries(newItem);
            newItem.on("insertrowrequested", this.chaptertInsertRequested, this);
            newItem.on("needtobeselected", this.selectChapter, this);
            newItem.on("propertychanged", this.chapterPropertyChanged, this);
            newItem.on("entitydropped", this.entityDroppedHandler, this);
            this.initDuplicatedData(newItem);
            this.insertItem(itemIndex + 1, newItem, true);
            this.selectEntity(newEntity.Id);
            // special UI logic to focus on new row
            ViewHelper.delayFocusElement(newItem.originalEntity.Id);
            this._invalidItems.push(newItem);
            this.setHasChanged = true;
            this.checkForDuplicatedItems(newItem);
            this.checkIsDuplicated();
            this.checkIsValid();
            if (this.$utility.isIE()) {
                this.manageMoveItemsActions();
            }
        }

        /**
        * Method use to set the values of the new item into both dictionaries
        **/
        private _updateDictionaries(newItem: ChapterViewModel) {
            this._idValuesDictionary.add(newItem.originalEntity.Id, [new KeyValue("Code", null), new KeyValue("Description", null)]);
            if (this.valuesIdsDictionary[0].containsKey(null)) {
                let value = this.valuesIdsDictionary[0].getValue(null);
                value.push(newItem.originalEntity.Id);
                this.valuesIdsDictionary[0].remove(null);
                this.valuesIdsDictionary[0].add(null, value);
            } else {
                this.valuesIdsDictionary[0].add(null, [newItem.originalEntity.Id]);
            }
            if (this.valuesIdsDictionary[1].containsKey(null)) {
                let value = this.valuesIdsDictionary[1].getValue(null);
                value.push(newItem.originalEntity.Id);
                this.valuesIdsDictionary[1].remove(null);
                this.valuesIdsDictionary[1].add(null, value);
            } else {
                this.valuesIdsDictionary[1].add(null, [newItem.originalEntity.Id]);
            }
        }

        /**
        * Method use to update modifications before saving
        **/
        public postChange(): ap.models.custom.ProjectPunchlists {
            let modifiedChapters: ap.viewmodels.projects.ChapterViewModel[] = <ap.viewmodels.projects.ChapterViewModel[]>this.getChangedItems();
            let projectPunchList: ap.models.custom.ProjectPunchlists = new ap.models.custom.ProjectPunchlists(this.$utility, this._controllersManager.mainController.currentProject().Id);
            for (let i = 0; i < modifiedChapters.length; i++) {
                let chapterVm: ap.viewmodels.projects.ChapterViewModel = modifiedChapters[i];
                if (!chapterVm.originalEntity.IsNew && chapterVm.isMarkedToDelete) {
                    projectPunchList.ChaptersToDelete.push(chapterVm.originalEntity.Id);
                }
                if (chapterVm.hasChanged && !chapterVm.isMarkedToDelete) {
                    chapterVm.postChanges();
                    projectPunchList.ChaptersToUpdate.push(<ap.models.projects.Chapter>chapterVm.originalEntity);
                }
                if (chapterVm.isMarkedToDelete && chapterVm.originalEntity.IsNew) {
                    let code: string;
                    if (chapterVm.code) {
                        code = chapterVm.code.toUpperCase();
                    } else {
                        code = chapterVm.code;
                    }
                    let description: string;
                    if (chapterVm.description) {
                        description = chapterVm.description.toUpperCase();
                    } else {
                        description = chapterVm.description;
                    }
                    let tab = [code, description];
                    for (let i = 0; i < this.valuesIdsDictionary.length; i++) {
                        let v = this.valuesIdsDictionary[i].getValue(tab[i]);
                        if (v) {
                            let index = v.indexOf(chapterVm.originalEntity.Id);
                            if (index !== -1) {
                                v.splice(index, 1);
                                this.valuesIdsDictionary[i].remove(tab[i]);
                                if (v.length !== 0) {
                                    this.valuesIdsDictionary[i].add(tab[i], v);
                                }
                            }
                        }
                    }
                    this.idValuesDictionary.remove(chapterVm.originalEntity.Id);
                    this.sourceItems.splice(this.sourceItems.indexOf(chapterVm), 1);
                    this._setCount(this._count - 1);
                }
            }
            return projectPunchList;
        }

        /**
        * This method for handler actions
        * @param name is name of action
        **/
        public actionClickedHandler(name: string) {
            if (name === "chapter.add") {
                this.chaptertInsertRequested();
            }
        }

        /**
        * This method is use to select the chapter in param
        * @param the chapter to be selected
        **/
        public selectChapter(chapter: ChapterViewModel) {
            this.selectedViewModel = chapter;
        }

        /**
        * This method use for set isEnabled action in items
        **/
        public updateItemsActionsState(enable: boolean) {
            this.sourceItems.forEach((item: ap.viewmodels.projects.ChapterViewModel) => {
                if (enable) {
                    item.enableActions();
                } else if (this._invalidItems.indexOf(item) < 0) {
                    item.disableActions();
                }
                if (item.isDuplicated) {
                    item.enableActions();
                }
            });
        }

        insertItem(index: number, item: EntityViewModel, forceUpdated: boolean = false) {
            super.insertItem(index, item, forceUpdated);
            if (index !== this.sourceItems.length) {
                for (let i = index - 1; i <= this.sourceItems.length; i++) {
                    if (this.sourceItems[i]) {
                        this.sourceItems[i].index = i;
                    }
                }
            }
            let vm = <ChapterViewModel>item;
            if (vm.originalEntity.IsNew && !StringHelper.isNullOrEmpty(vm.code) && !StringHelper.isNullOrEmpty(vm.description)) {
                this._idValuesDictionary.add((<ChapterViewModel>item).originalEntity.Id, [
                    new KeyValue("Code", (<ChapterViewModel>item).code.toUpperCase()),
                    new KeyValue("Description", (<ChapterViewModel>item).description.toUpperCase())
                ]);
                this.initDuplicatedData(item);
                item.on("insertrowrequested", this.chaptertInsertRequested, this);
                item.on("needtobeselected", this.selectChapter, this);
                item.on("propertychanged", this.chapterPropertyChanged, this);
                this.checkForDuplicatedItems(item);

                // The item may already be present in the array of invalid items due to check for duplicates
                if (!vm.isValid() && this._invalidItems.indexOf(vm) === -1) {
                    this._invalidItems.push(vm);
                    if (vm.hasInvalidChildren) {
                        this._isChildrensFault = true;
                    }
                }

                this.checkIsValid();
                this.setHasChanged = true;
            }
            this.setHasChanged = true;
            this.checkIsValid();
        }

        /**
        * Method used to update the visibility of move actions on every items of the list
        **/
        public manageMoveItemsActions() {
            for (let i = 0; i < this.sourceItems.length; i++) {
                let item = <ChapterViewModel>this.sourceItems[i];
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
        public chapterMove(moveType: string, dragged: ChapterViewModel) {
            let dropped: ChapterViewModel = <ChapterViewModel>this.getItemAtIndex(moveType === "moveup" ? dragged.index - 1 : dragged.index + 1);
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
            ap.utility.sortDraggableEntities(<ChapterViewModel[]>this.sourceItems, new component.dragAndDrop.DropEntityEvent(dragged, dropped));
            if (this.$utility.isIE()) {
                this.manageMoveItemsActions();
            }
        }

        constructor(utility: ap.utility.UtilityHelper, $q: angular.IQService, private _controllersManager: ap.controllers.ControllersManager,
            private projectService: ap.services.ProjectService, private isForImportModule: boolean = false) {

            super(utility, _controllersManager.listController, $q, new GenericPagedListOptions(
                "Chapter", ChapterViewModel, isForImportModule ? "IssueTypes,IssueTypes.NoteSubjects" : null, "DisplayOrder", null, null, null,
                null, null, null, 2, undefined, undefined, undefined, !isForImportModule
            ));

            this._listener.addEventsName(["chapterdelete", "dragchapter", "entitydropped"]);
            this._addAction = new ap.viewmodels.home.ActionViewModel(utility, utility.EventTool, "chapter.add", "/Images/html/icons/ic_add_black_48px.svg", true, null, "Add category", true);
            this._actions = [this._addAction];
            this.isDeferredLoadingMode = true;
            this._invalidItems = [];
            this._isValid = true;
            this._dragOptions = new ap.component.dragAndDrop.DragOptions(utility, false);
        }

        private _addAction: ap.viewmodels.home.ActionViewModel;
        private _actions: ap.viewmodels.home.ActionViewModel[];
        private _invalidItems: ChapterViewModel[];
        private _isValid: boolean;
        private _hasChanged: boolean = false;
        private _isChildrensFault: boolean = false;
        private _dragOptions: ap.component.dragAndDrop.DragOptions;
    }
}
