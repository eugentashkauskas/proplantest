module ap.viewmodels.projects {
    export class IssueTypeNoteSubjectListViewModel extends ListEntityViewModel {

        /**
        * The issuetypeid to get the list of IssueTypeNoteSubject
        **/
        public get issueTypeId(): string {
            return this._issueTypeId;
        }

        public set issueTypeId(val: string) {
            if (this._issueTypeId !== val) {
                this._issueTypeId = val;
                if (this.isLoaded && !!this._issueTypeId)
                    this.load().then(() => {
                        this.checkDuplicatedItems();
                    });
            }
        }

        /**
         * Determines whether the list is valid
         */
        public get isValid(): boolean {
            return this._isValid;
        }

        /**
        * This method is used to set isValid proprety
        * @param isValid the new value of the proprety
        **/
        private set setIsValid(isValid: boolean) {
            if (this._isValid !== isValid) {
                this._isValid = isValid;
                this._listener.raise("propertychanged", new base.PropertyChangedEventArgs("isValid", this._isValid, this));
            }
        }

        /**
        * To get checked items
        **/
        public get checkedItemsDict(): Dictionary<string, ap.models.projects.IssueTypeNoteSubject[]> {
            return this._checkedItemsDict;
        }

        /*
        * Public set the IssueType linked to the subjects
        */
        public set parentIsssueTypeVm(newValue: ap.viewmodels.projects.IssueTypeViewModel) {
            if (this._parentIssueTypeVm !== newValue) {
                if (this._parentIssueTypeVm) {
                    this._parentIssueTypeVm.off("parentIssueTypeUpdated", this.parentIssueTypeUpdated, this);
                }

                this._parentIssueTypeVm = newValue;

                if (this._parentIssueTypeVm) {
                    this._parentIssueTypeVm.on("parentIssueTypeUpdated", this.parentIssueTypeUpdated, this);
                }

                if (this._parentIssueTypeVm && this._parentIssueTypeVm.isValid() && !this._parentIssueTypeVm.isMarkedToDelete && this._invalidItems.length === 0) {
                    this._addAction.isEnabled = true;
                } else {
                    this._addAction.isEnabled = false;
                }
            }
        }

        /**
        * To known the list contains duplicated items
        **/
        public get isDuplicated(): boolean {
            return this._isDuplicated;
        }

        /**
        * This property is actions array 
        **/
        public get actions(): ap.viewmodels.home.ActionViewModel[] {
            return this._actions;
        }

        /**
        * This method for handler actions
        * @param name is name of action
        **/
        public actionClickedHandler(name: string) {
            if (name === "subjects.add") {
                this.noteSubjectInsertRequested();
            }
        }

        /**
        * To cache the data per issueTypeId and reuse when load again
        **/
        public get useCacheSystem(): boolean {
            return this._useCacheSystem;
        }

        public set useCacheSystem(val: boolean) {
            if (val !== this._useCacheSystem) {
                this._useCacheSystem = val;
                if (!this._useCacheSystem && this._cacheData) {
                    this._cacheData.clear();
                }
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
         * Adds the given entities to the cache
         * @param cachedViewModels Entities to cache. Keys of the dictionary represent issue type
         * ids and values contain view models to cache
         * @throws an error if caching is disabled
         */
        public addIntoCache(cachedViewModels: Dictionary<string, IssueTypeNoteSubjectViewModel[]>) {
            if (!this.useCacheSystem) {
                throw new Error("Caching is disabled for this list view model");
            }
            cachedViewModels.keys().forEach((issueTypeId: string) => {
                cachedViewModels.getValue(issueTypeId).forEach((noteSubjectVm: IssueTypeNoteSubjectViewModel) => {
                    noteSubjectVm.on("insertrowrequested", this.noteSubjectInsertRequested, this);
                    noteSubjectVm.on("propertychanged", this.itemPropertyChanged, this);
                });
                this._cacheData.add(issueTypeId, cachedViewModels.getValue(issueTypeId));
            });
        }

        /**
         * Drag start handler, raise event to temporarily disable other table's drag options
         */
        public dragStartHandler() {
            this._listener.raise("dragsubject", true);
        }

        /**
         * Drag end handler, raise event to enable back other table's drag options
         */
        public dragEndHandler() {
            this._listener.raise("dragsubject", false);
        }

        /**
        * Method use to know if the item has been changed
        **/
        public getChangedItems(): IEntityViewModel[] {
            let tab: IEntityViewModel[] = [];

            // this inner function returns true if the item has changed.  Used in the filter function
            function predicate(entityViewModel: ap.viewmodels.EntityViewModel) {
                return entityViewModel && entityViewModel.hasChanged;
            }

            tab = this.sourceItems.filter(predicate);
            if (this.useCacheSystem) {
                // first filter is to check if the item hasChanged  and the second to see if it's not already in the tab
                this._cacheData.values().forEach((noteSubject: ap.viewmodels.projects.IssueTypeNoteSubjectViewModel[]) => {
                    tab = tab.concat(noteSubject.filter(predicate).filter((entityViewModel: ap.viewmodels.projects.IssueTypeNoteSubjectViewModel) => { return tab.indexOf(entityViewModel) < 0; }));
                });
            }
            return tab;
        }

        /**
         * This function returns the entity corresponding to the specified id from the list. If a cache system is
         * in use at the moment, this method takes in account cached items as well.
         * @param id the searched id
         * @returns the first found view model or null if an entity is not found
         **/
        public getEntityById(id: string): IEntityViewModel {
            let entity = super.getEntityById(id);
            if (entity !== null) {
                return entity;
            }

            if (this.useCacheSystem) {
                let issueTypes = this._cacheData.keys();
                for (let i = 0, ilen = issueTypes.length; i < ilen; i++) {
                    let subjects = this._cacheData.getValue(issueTypes[i]);
                    for (let j = 0, jlen = subjects.length; j < jlen; j++) {
                        if (subjects[j] && subjects[j].originalEntity && subjects[j].originalEntity.Id === id) {
                            return subjects[j];
                        }
                    }
                }
            }

            return null;
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
        * An accessor for a drag state object
        **/
        public get dragOptions(): ap.component.dragAndDrop.DragOptions {
            return this._dragOptions;
        }

        /**
         * A handler for the drop event of list entries
         * @param event information about the event
         */
        private entityDroppedHandler(event: ap.component.dragAndDrop.DropEntityEvent) {
            this._listener.raise("entitydropped", event);
        }

        /*
        * Method call when the user cancel or save modifications.
        * Use to visually clean the screen (see in the view)
        */
        public clearInfo() {
            this.selectedViewModel = null;
            this.sourceItems = [];
            this._issueTypeId = null;
            if (this.isLoaded) {
                this._setLoaded();
            }
        }

        /*
        * Cancel the vm ans reset the hasChanged flag
        */
        public cancel() {
            let noteSubjectVm: ap.viewmodels.projects.IssueTypeNoteSubjectViewModel;
            let modifiedSubject: ap.viewmodels.projects.IssueTypeNoteSubjectViewModel[] = <ap.viewmodels.projects.IssueTypeNoteSubjectViewModel[]>this.getChangedItems();
            for (let i = 0; i < modifiedSubject.length; i++) {
                noteSubjectVm = modifiedSubject[i];
                if (noteSubjectVm.isMarkedToDelete && noteSubjectVm.originalEntity.IsNew) {
                    this.sourceItems.splice(this.sourceItems.indexOf(noteSubjectVm), 1);
                    this._setCount(this._count - 1);
                }
            }
            this._invalidItems.splice(0);
            this.clearInfo();
            this.setHasChanged = false;
            this.setIsValid = true;
        }

        /**
        * This method will be load the list of the IssueTypeNoteSubject and select the item defined on the param
        * @param idToSelect? is the item need to select by default
        */
        public load(idToSelect?: string): angular.IPromise<ap.viewmodels.projects.IssueTypeNoteSubjectViewModel[]> {
            let def: ng.IDeferred<ap.viewmodels.projects.IssueTypeNoteSubjectViewModel[]> = this.$q.defer();
            let self = this;
            let listVm: ap.viewmodels.projects.IssueTypeNoteSubjectViewModel[];
            let needToLoad: boolean = true;
            if (this._useCacheSystem && this._cacheData.containsKey(this._issueTypeId)) {
                needToLoad = false;
            }
            if (needToLoad) {
                let checkedItems: ap.models.projects.IssueTypeNoteSubject[] = [];
                if (this._checkedItemsDict.containsKey(this._issueTypeId)) {
                    checkedItems = this._checkedItemsDict.getValue(this._issueTypeId);
                }
                this.changeIsLoading(true);
                this._controllersManager.projectController.getIssueTypeNoteSubject(this._issueTypeId, true, true).then((loadedList: ap.models.projects.IssueTypeNoteSubject[]) => {
                    listVm = [];
                    let index = 0;
                    if (loadedList) {
                        loadedList.forEach((subject) => {
                            let itemViewModel: ap.viewmodels.projects.IssueTypeNoteSubjectViewModel = new ap.viewmodels.projects.IssueTypeNoteSubjectViewModel(self.$utility);
                            itemViewModel.init(subject);
                            itemViewModel.on("insertrowrequested", self.noteSubjectInsertRequested, self);
                            itemViewModel.on("entitydropped", this.entityDroppedHandler, this);
                            if (checkedItems.length > 0 && checkedItems.filter(entity => entity.Id === itemViewModel.originalEntity.Id).length > 0) {
                                itemViewModel.defaultChecked = true;
                            }
                            // itemViewModel.on("propertychanged", self.itemPropertyChanged, self);
                            this._listener.raise("itemcreated", itemViewModel);
                            itemViewModel.index = index;
                            listVm.push(itemViewModel);
                            index++;
                        });
                        if (this._parentIssueTypeVm) {
                            this._parentIssueTypeVm.on("parentIssueTypeUpdated", this.parentIssueTypeUpdated, this);
                        }
                    }
                    if (self._useCacheSystem && !this._cacheData.containsKey(this._issueTypeId))
                        self._cacheData.add(self._issueTypeId, listVm.slice());
                    if (this.$utility.isIE()) {
                        this.manageMoveItemsActions(listVm);
                    }
                    self.onLoadItems(listVm, false);
                    if (idToSelect)
                        self.selectEntity(idToSelect);
                    this.checkDuplicatedItems();
                    this.checkIsDuplicated();
                    def.resolve(listVm);
                });
            }
            else {
                listVm = this._cacheData.containsKey(this._issueTypeId) ? this._cacheData.getValue(this._issueTypeId).slice() : [];
                if (this.$utility.isIE()) {
                    this.manageMoveItemsActions(listVm);
                }
                self.onLoadItems(listVm, false);
                if (idToSelect)
                    self.selectEntity(idToSelect);
                this.checkIsDuplicated();
                def.resolve(listVm);
            }
            return def.promise;
        }

        /**
        * To insert a row when it rasie insert event
        **/
        private noteSubjectInsertRequested(noteSubject?: IssueTypeNoteSubjectViewModel) {
            let itemIndex = noteSubject ? this.sourceItems.indexOf(noteSubject) : this.sourceItems.length - 1;
            let newItem = new IssueTypeNoteSubjectViewModel(this.$utility);
            let newEntity = new ap.models.projects.IssueTypeNoteSubject(this.$utility);

            let itemAfter, itemBefore;
            if (itemIndex >= 0) {
                itemBefore = <IssueTypeNoteSubjectViewModel>this.getItemAtIndex(itemIndex);
                itemAfter = <IssueTypeNoteSubjectViewModel>this.getItemAtIndex(itemIndex + 1);
            }
            if (itemAfter && noteSubject) {
                newEntity.DisplayOrder = Math.round((noteSubject.displayOrder + itemAfter.displayOrder) / 2);
            } else if (noteSubject) {
                // case when we are at the last element of the list
                newEntity.DisplayOrder = noteSubject.displayOrder + 10000;
            } else {
                newEntity.DisplayOrder = itemBefore ? itemBefore.displayOrder + 10000 : 1;
            }
            newEntity.IssueType = <ap.models.projects.IssueType>this._parentIssueTypeVm.originalEntity;

            newItem.init(newEntity);
            newItem.subject = "";
            newItem.on("insertrowrequested", this.noteSubjectInsertRequested, this);
            newItem.on("propertychanged", this.itemPropertyChanged, this);
            newItem.on("entitydropped", this.entityDroppedHandler, this);
            this._parentIssueTypeVm.on("parentIssueTypeUpdated", this.parentIssueTypeUpdated, this);
            newItem.index = itemIndex + 1;
            this.insertItem(itemIndex + 1, newItem);
            this.updateItemsIndex(itemIndex + 1);
            this.selectEntity(newEntity.Id);
            // special UI logic to focus on new row
            ViewHelper.delayFocusElement(newItem.originalEntity.Id);
            this._invalidItems.push(newItem);
            this.setIsValid = false;
            this.setHasChanged = true;
            if (this.$utility.isIE()) {
                this.manageMoveItemsActions();
            }
            if (this._cacheData.containsKey(this.issueTypeId)) {
                let value = this._cacheData.getValue(this.issueTypeId);
                this._cacheData.remove(this.issueTypeId);
                value.push(newItem);
                this._cacheData.add(this._issueTypeId, value);
            }
            this._cacheData.add(this._issueTypeId, [newItem]);
        }

        /**
         * This method use for update indexes in sourceItems
         * @param indexStart - index
         */
        public updateItemsIndex(indexStart) {
            for (let i = indexStart; i < this.sourceItems.length; i++) {
                this.sourceItems[i].index = i;
            }
        }

        private parentIssueTypeUpdated(issueType: ap.viewmodels.projects.IssueTypeViewModel) {
            for (let i = 0; i < this.sourceItems.length; i++) {
                (<IssueTypeNoteSubjectViewModel>this.sourceItems[i]).issueTypeViewModel = issueType;
            }
            if (issueType.isMarkedToDelete) {
                this._listener.raise("needToUnselect");
            }
        }

        private requestChecked(subjectVm: IssueTypeNoteSubjectViewModel) {
            if (subjectVm.isChecked) {
                if (this._checkedItemsDict.containsKey(subjectVm.issueTypeNoteSubject.IssueType.Id)) {
                    let arrIssueTypes: ap.models.projects.IssueTypeNoteSubject[];
                    arrIssueTypes = this._checkedItemsDict.getValue(subjectVm.issueTypeNoteSubject.IssueType.Id);
                    if (arrIssueTypes.filter(item => item.Id === subjectVm.issueTypeNoteSubject.Id).length === 0)
                        arrIssueTypes.push(subjectVm.issueTypeNoteSubject);
                } else {
                    this._checkedItemsDict.add(subjectVm.issueTypeNoteSubject.IssueType.Id, [subjectVm.issueTypeNoteSubject]);
                }
            } else if (this._checkedItemsDict.containsKey(subjectVm.issueTypeNoteSubject.IssueType.Id)) {
                let arrIssueTypes: ap.models.projects.IssueTypeNoteSubject[];
                arrIssueTypes = this._checkedItemsDict.getValue(subjectVm.issueTypeNoteSubject.IssueType.Id);
                for (let i = 0; i < arrIssueTypes.length; i++) {
                    if (arrIssueTypes[i].Id === subjectVm.issueTypeNoteSubject.Id) {
                        arrIssueTypes.splice(i, 1);
                    }
                }
                if (arrIssueTypes.length === 0) {
                    this._checkedItemsDict.remove(subjectVm.issueTypeNoteSubject.IssueType.Id);
                }
            }
            this._listener.raise("itemchecked", subjectVm);
        }

        /*
        * Handler method called when an issueType is deleted
        */
        private subjectDeletedHandler(subjectVm: IssueTypeNoteSubjectViewModel) {
            this.setHasChanged = subjectVm.isMarkedToDelete;
        }

        /**
         * Handles changes in properties of the list items
         * @param args arguments of the event
         */
        protected itemPropertyChanged(args: ap.viewmodels.base.PropertyChangedEventArgs) {
            let noteSubject = <IssueTypeNoteSubjectViewModel>args.caller;
            let invalidItemsIndex = this._invalidItems.indexOf(noteSubject);

            switch (args.propertyName) {
                case "isChecked":
                    this.requestChecked(<IssueTypeNoteSubjectViewModel>args.caller);
                    break;
                case "subject":
                    if (invalidItemsIndex > -1) {
                        this._invalidItems.splice(invalidItemsIndex, 1);
                    }
                    if (StringHelper.isNullOrWhiteSpace(noteSubject.subject)) {
                        this._invalidItems.push(args.caller);
                    }
                    this.checkDuplicatedItems();
                    break;
                case "delete":
                    if (!noteSubject.isValid() && noteSubject.isMarkedToDelete) {
                        if (invalidItemsIndex > -1) {
                            this._invalidItems.splice(invalidItemsIndex, 1);
                        }
                    }
                    this.checkDuplicatedItems();
                    break;
                case "undelete":
                    if (!noteSubject.isValid() && !noteSubject.isMarkedToDelete && invalidItemsIndex === -1) {
                        this._invalidItems.push(args.caller);
                    }
                    this.checkDuplicatedItems();
                    break;
                case "isValid":
                    if (!noteSubject.isValid() && !noteSubject.isMarkedToDelete) {
                        if (invalidItemsIndex === -1) {
                            this._invalidItems.push(noteSubject);
                        }
                    } else if (invalidItemsIndex > -1) {
                        this._invalidItems.splice(invalidItemsIndex, 1);
                    }
                    break;
                // if case = description we don't need to do something special only set hasChanged = true
            }

            this.setIsValid = this._invalidItems.length === 0 && this.isDuplicated === false;
            this.setHasChanged = (<IssueTypeNoteSubjectViewModel>args.caller).hasChanged;
        }

        /**
         * Checks if there are duplicated items in the curently loaded data
         */
        private checkDuplicatedItems() {
            let len = this.sourceItems.length;
            let subjectsUpperCased: string[] = [];

            // Reset existing duplicates
            for (let i = 0; i < len; i++) {
                let item = <IssueTypeNoteSubjectViewModel>this.sourceItems[i];
                if (item) {
                    item.isDuplicated = false;
                    subjectsUpperCased.push(item.subject ? item.subject.toUpperCase() : "");
                } else {
                    subjectsUpperCased.push("");
                }
            }

            // Check for duplicates again
            for (let i = 0; i < len; i++) {
                let iItem = <IssueTypeNoteSubjectViewModel>this.sourceItems[i];
                if (!iItem || iItem.isDuplicated || iItem.isMarkedToDelete) {
                    continue;
                }

                for (let j = i + 1; j < len; j++) {
                    let jItem = <IssueTypeNoteSubjectViewModel>this.sourceItems[j];
                    if (!jItem || jItem.isDuplicated || jItem.isMarkedToDelete || jItem.originalEntity.Id === iItem.originalEntity.Id) {
                        continue;
                    }

                    if (subjectsUpperCased[i] === subjectsUpperCased[j]) {
                        jItem.isDuplicated = true;
                        iItem.isDuplicated = true;
                    }
                }
            }

            this.checkIsDuplicated();
        }

        /**
        * Check if vm has duplicated entities
        **/
        private checkIsDuplicated() {
            this._isDuplicated = false;
            for (let i = 0; i < this.sourceItems.length; i++) {
                let issueTypeNoteSubjectViewModel: ap.viewmodels.projects.IssueTypeNoteSubjectViewModel = <ap.viewmodels.projects.IssueTypeNoteSubjectViewModel>this.sourceItems[i];
                if (issueTypeNoteSubjectViewModel && issueTypeNoteSubjectViewModel.isDuplicated) {
                    this._isDuplicated = true;
                    return;
                }
            }
        }

        /**
        * Method use to update modifications before saving
        **/
        public postChange(): ap.models.custom.ProjectPunchlists {
            let noteSubjectVm: ap.viewmodels.projects.IssueTypeNoteSubjectViewModel;
            let modifiedSubject: ap.viewmodels.projects.IssueTypeNoteSubjectViewModel[] = <ap.viewmodels.projects.IssueTypeNoteSubjectViewModel[]>this.getChangedItems();
            let projectPunchList: ap.models.custom.ProjectPunchlists = new ap.models.custom.ProjectPunchlists(this.$utility, this._controllersManager.mainController.currentProject().Id);

            for (let i = 0; i < modifiedSubject.length; i++) {
                noteSubjectVm = modifiedSubject[i];
                if (!noteSubjectVm.originalEntity.IsNew && noteSubjectVm.isMarkedToDelete) {
                    projectPunchList.NoteSubjectsToDelete.push(noteSubjectVm.originalEntity.Id);
                }
                if (noteSubjectVm.hasChanged && !noteSubjectVm.isMarkedToDelete && !noteSubjectVm.issueTypeViewModel.isMarkedToDelete && !noteSubjectVm.issueTypeViewModel.chapterViewModel.isMarkedToDelete) {
                    noteSubjectVm.postChanges();
                    projectPunchList.NoteSubjectsToUpdate.push(<ap.models.projects.IssueTypeNoteSubject>noteSubjectVm.originalEntity);
                }
                if ((noteSubjectVm.isMarkedToDelete || noteSubjectVm.issueTypeViewModel.isMarkedToDelete || noteSubjectVm.issueTypeViewModel.chapterViewModel.isMarkedToDelete) && noteSubjectVm.originalEntity.IsNew) {
                    let subjectIndex = this.sourceItems.indexOf(noteSubjectVm);
                    if (subjectIndex !== -1) {
                        this.sourceItems.splice(subjectIndex, 1);
                        this._setCount(this._count - 1);
                    }

                    if (this.useCacheSystem) {
                        let issueTypeId = noteSubjectVm.issueTypeViewModel.originalEntity.Id;
                        let cachedSubjects = this._cacheData.getValue(issueTypeId);
                        let cachedSubjectIndex = cachedSubjects.indexOf(noteSubjectVm);
                        if (cachedSubjectIndex !== -1) {
                            cachedSubjects.splice(cachedSubjectIndex, 1);
                        }
                        if (cachedSubjects.length === 0) {
                            this._cacheData.remove(issueTypeId);
                        }
                    }
                }
            }
            return projectPunchList;
        }

        /**
        * This method use for set isChecked for items and save/remove in dictionary
        **/
        public setCheckedAllItems(check: boolean, id: string, subjects?: ap.models.projects.IssueTypeNoteSubject[]) {
            this._checkedItemsDict.remove(id);
            if (check && subjects && subjects.length > 0) {
                this._checkedItemsDict.add(id, subjects);
            }
            if (this.isLoaded && this.sourceItems.length > 0 && this._issueTypeId === id && (!check || (check && subjects.length > 0))) {
                this.sourceItems.forEach((item) => { item.defaultChecked = check; });
            }
        }

        /**
        * dispose method
        **/
        dispose() {
            super.dispose();
            this._cacheData.clear();
        }

        /**
        * Method used to update the visibility of move actions on every items of the list
        **/
        public manageMoveItemsActions(listVm?: IssueTypeNoteSubjectViewModel[]) {
            if (!listVm)
                listVm = <IssueTypeNoteSubjectViewModel[]>this.sourceItems;
            for (let i = 0; i < listVm.length; i++) {
                let item = <IssueTypeNoteSubjectViewModel>listVm[i];
                if (item) {
                    item.moveUpAvailable = true;
                    item.moveDownAvailable = true;
                    if (i === 0) {
                        item.moveUpAvailable = false;
                    }
                    if (i === listVm.length - 1) {
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
        public subjectMove(moveType: string, dragged: IssueTypeNoteSubjectViewModel) {
            let dropped: IssueTypeNoteSubjectViewModel = <IssueTypeNoteSubjectViewModel>this.getItemAtIndex(moveType === "moveup" ? dragged.index - 1 : dragged.index + 1);
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
            ap.utility.sortDraggableEntities(<IssueTypeNoteSubjectViewModel[]>this.sourceItems, new component.dragAndDrop.DropEntityEvent(dragged, dropped));
            if (this.$utility.isIE()) {
                this.manageMoveItemsActions();
            }
        }

        constructor(utility: ap.utility.UtilityHelper, private $q: angular.IQService, private _controllersManager: ap.controllers.ControllersManager) {
            super(utility, "IssueTypeNoteSubject", null, "DisplayOrder", null);
            this._listener.addEventsName(["propertychanged", "itemchecked", "itemcreated"]);
            this._addAction = new ap.viewmodels.home.ActionViewModel(utility, utility.EventTool, "subjects.add", "/Images/html/icons/ic_add_black_48px.svg", true, null, "Add subject", true);
            this._actions = [this._addAction];
            this._invalidItems = [];
            this._isValid = true;
            this._listener.addEventsName(["needToUnselect", "dragsubject", "entitydropped"]);
            this._dragOptions = new ap.component.dragAndDrop.DragOptions(utility, false);
        }

        private _issueTypeId: string = null;
        private _cacheData: Dictionary<string, IssueTypeNoteSubjectViewModel[]> = new Dictionary<string, IssueTypeNoteSubjectViewModel[]>();
        private _useCacheSystem: boolean = false;
        private _addAction: ap.viewmodels.home.ActionViewModel;
        private _actions: ap.viewmodels.home.ActionViewModel[];
        private _hasChanged: boolean = false;
        private _isDuplicated: boolean = false;
        private _parentIssueTypeVm: ap.viewmodels.projects.IssueTypeViewModel;
        private _isValid: boolean;
        private _invalidItems: IssueTypeNoteSubjectViewModel[];
        private _checkedItemsDict: Dictionary<string, ap.models.projects.IssueTypeNoteSubject[]> = new Dictionary<string, ap.models.projects.IssueTypeNoteSubject[]>();
        private _dragOptions: ap.component.dragAndDrop.DragOptions;
    }
}
