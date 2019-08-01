module ap.viewmodels.projects {
    export class IssueTypeSelectorViewModel extends ListWorkspaceViewModel {

        protected getSearchedTextProperties(): string[] {
            return this._propsSearchedText;
        }

        protected createCustomParams() {
            super.createCustomParams();
            let currentProject = this.$controllersManager.mainController.currentProject();
            if (!currentProject) // We force an empty guid then, we are sure that the api doesn't throw error if a call is done
                this._listVm.addCustomParam("projectid", ap.utility.UtilityHelper.createEmptyGuid());
            else
                this._listVm.addCustomParam("projectid", currentProject.Id);

            if (!StringHelper.isNullOrEmpty(this.searchedText))
                this._listVm.addCustomParam("baseentityname", "IssueType");
        }

        public get selectedIssueTypeId(): string {
            return this.selectedItem ? (<ap.models.projects.ChapterHierarchy>this.selectedItem.originalEntity).EntityId : null;
        }

        /*
        * To bind with directive, avoid using listVM.SelectdViewModel becasue it may set null when no result
        */
        public get selectedItem(): IEntityViewModel {
            return this._selectedItem;
        }

        /*
        * To bind with directive, avoid using listVM.SelectdViewModel becasue it may set null when no result
        */
        public set selectedItem(value: IEntityViewModel) {
            if (this._selectedItem === null || value === null || this._selectedItem.originalEntity.Id !== value.originalEntity.Id) {
                this._selectedItem = value;
                if (this._selectedItem) {
                    let parentEntityId: string = (<ap.models.projects.ChapterHierarchy>this._selectedItem.originalEntity).ParentEntityId;
                    let parentEntity = this.listVm.sourceItems.filter((item: EntityItemViewModel) => {
                        return (<ap.models.projects.ChapterHierarchy>item.originalEntity).EntityId === parentEntityId;
                    });
                    if (parentEntity.length === 0) {
                        this.load(parentEntityId).then(() => {
                            let parentEntity = this.listVm.sourceItems.filter((item: EntityItemViewModel) => {
                                return (<ap.models.projects.ChapterHierarchy>item.originalEntity).EntityId === parentEntityId;
                            });
                            this._chapter = <ap.models.projects.ChapterHierarchy>parentEntity[0].originalEntity;
                        });
                    } else {
                        this._chapter = <ap.models.projects.ChapterHierarchy>parentEntity[0].originalEntity;
                    }
                }
                this._listener.raise("selectedItemChanged", value);
            }
        }

        /*
        * This method is used to returned to parent issueType of the selected issueType
        */
        public getParentChapter(): ap.models.projects.ChapterHierarchy {
            return this._chapter;
        }

        /**
         * Updates a list of available issue types and selects an issue type with the given ID
         * @param issueTypeId an id of the issue type to select
         */
        public selectIssueTypeById(issueTypeId: string): angular.IPromise<any> {
            let deferred = this.$q.defer();

            this.searchedText = null;
            if (issueTypeId !== null) {
                this.load(issueTypeId + "1").then((list: GenericPagedListViewModels) => {
                    this.listVm.selectEntity(issueTypeId + "1"); // 1 indicates a subcategory id
                    this.selectedItem = this.listVm.selectedViewModel;
                    deferred.resolve();
                }, () => {
                    deferred.reject();
                });
            } else {
                this.listVm.selectEntity(null);
                this.selectedItem = null;
                deferred.reject();
            }

            return deferred.promise;
        }

        /**
        * @override
        */
        dispose() {
            super.dispose();

            if (this._chapter) {
                this._chapter = null;
            }

            if (this._selectedItem) {
                this._selectedItem.dispose();
                this._selectedItem = null;
            }
        }

        constructor($utility: ap.utility.UtilityHelper, $q: angular.IQService, _controllersManager: ap.controllers.ControllersManager, $timeout: angular.ITimeoutService, private predefinedItems: PredefinedItemParameter[] = null) {
            super($utility, _controllersManager, $q, new GenericPagedListOptions("ChapterHierarchy", ChapterHierarchyItemViewModel, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, predefinedItems, (items) => {
                // The goal is to avoid to display Chapter for which there is no children
                if (items) {
                    let predefinedItemClear = ap.utility.UtilityHelper.createHierarchyGuid(ap.utility.UtilityHelper.createEmptyGuid());
                    for (let i = 0; i < items.length; i++) { // items are ids
                        let item = items[i];
                        if (item !== predefinedItemClear) {
                            let nextItem = i >= items.length - 1 ? null : items[i + 1];
                            if (item[ap.utility.UtilityHelper.guidLength] === "0" && (nextItem === null || nextItem[ap.utility.UtilityHelper.guidLength] === "0")) { // means that chapter and no children (next item is also a chapter)
                                items.splice(i, 1);
                                i--; // because we removed the current item, the next item to check must be the same index as the next one was moved to previous entry.
                            }
                        }
                    }
                }
            }));
            this._propsSearchedText = ["Code", "Description", "ParentChapter.Code", "ParentChapter.Description"];
            this._listener.addEventsName(["selectedItemChanged"]);
        }

        private _propsSearchedText: string[];
        private _selectedItem: IEntityViewModel = null;
        private _chapter: ap.models.projects.ChapterHierarchy = null;
    }
}