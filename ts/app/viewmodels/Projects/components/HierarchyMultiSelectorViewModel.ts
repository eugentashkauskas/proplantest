module ap.viewmodels.projects {

    export class HierarchyMultiSelectorViewModel extends ap.viewmodels.MultiSelectorListViewModel {

        getEntityText(entity: ap.models.Entity): string {
            return (<ap.models.projects.HierarchyCodeItem>entity).Description;
        }

        /**
         * This method is called when the ids are loaded.
         * Call the parent method to raise the idsloaded event
         * Then sort the ids in 2 groups ParentsIds and EntitiesIds 
         **/
        protected onIdsLoaded() {
            super.onIdsLoaded();
            this._idLevels.clear();
            this._checkedValuesText = "";
            this._dicChapter.clear();
            let idsLength: number = this._listIds.length;
            let currentId: string = null;
            let currentChapterId: string = null;

            for (let i: number = 0; i < idsLength; i++) {
                currentId = this._listIds[i];
                let idLength: number = currentId.length;
                let idType: string = currentId.substr(idLength - 1);
                this._idLevels.add(currentId, Number(idType));
                if (idType === "0") { // For HierarchyCodeItem, the ids contains the real id + a char to know the real type of the item (Parent = 0, Child = 1)
                    currentChapterId = currentId;
                    this._dicChapter.add(currentId, []);
                } else if (idType === "1") { // case of Child
                    this._dicChapter.getValue(currentChapterId).push(currentId);
                }
            }
        }

        protected buildCheckedValuesText() {
            this._checkedValuesText = "";
            let entities = this._checkedEntities.values();
            if (entities.length > 0) {
                let textArray = [];
                for (let i = 0; i < entities.length; i++) {
                    if ((<ap.models.projects.HierarchyCodeItem>entities[i]).ParentEntityId !== null)
                        textArray.push(this.getEntityText(entities[i]));
                }
                this._checkedValuesText = textArray.join(", ");
            }
        }

        /**
        * Overriden method.
        * Add logic to 
        *       - uncheck/check child if the parent is unchecked/checked
        *       - uncheck/check parent if all children are unchecked/checked
        * @param: item IEntityViewModel The item which isCheckede property has been changed
        */
        protected itemIsCheckedChanged(item: IEntityViewModel) {
            super.itemIsCheckedChanged(item);

            let entityId: string = item.originalEntity.Id;
            let idLength: number = entityId.length;
            let idType: string = entityId.substr(idLength - 1);

            if (idType === "0") {
                if (item.isChecked) {
                    // the Parent is checked -> need to check the children linked to it
                    let newCheckedIds: string[] = this.checkedIds;
                    let newIdsToChecked: string[] = this._dicChapter.getValue(item.originalEntity.Id);
                    let needToUpdateChildren: boolean = false;
                    if (newIdsToChecked) {
                        // only merge the ids that are not already checked
                        newCheckedIds = newCheckedIds.concat(newIdsToChecked.filter((id) => {
                            if (!needToUpdateChildren && newCheckedIds.indexOf(id) < 0) {
                                needToUpdateChildren = true;
                            }
                            return newCheckedIds.indexOf(id) < 0;
                        }));
                    }

                    // don't update the checkids if the children are already checked
                    if (needToUpdateChildren)
                        this.checkedIds = newCheckedIds;
                } else {
                    // the Parentis unchecked -> need to uncheck the children linked to it
                    let remainingIds: string[] = this.checkedIds;
                    let idsToUnCheck: string[] = this._dicChapter.getValue(item.originalEntity.Id);
                    let idsLength: number = idsToUnCheck.length;

                    for (let i: number = 0; i < idsLength; i++) {
                        let idx: number = this.checkedIds.indexOf(idsToUnCheck[i]);
                        if (idx >= 0) {
                            remainingIds.splice(idx, 1);
                        }
                    }

                    this.checkedIds = remainingIds;
                }
            } else {
                let parentId: string = this.getParentId(item.originalEntity.Id);

                if (item.isChecked) {
                    // a child is checked.  If the others are checked, then check the parent as well
                    let childrenIds: string[] = this._dicChapter.getValue(parentId);
                    let idsLength: number = childrenIds.length;
                    let needToCheckParent: boolean = true;
                    for (let i: number = 0; i < idsLength; i++) {
                        if (this.checkedIds.indexOf(childrenIds[i]) < 0) {
                            needToCheckParent = false;
                            break;
                        }
                    }
                    if (needToCheckParent) {
                        // check the parent
                        if (this.checkedIds.indexOf(parentId) < 0) {
                            this.checkedIds = [...this.checkedIds, parentId];
                        }
                    }
                } else {
                    // maybe need to uncheck the parent if it was checked
                    let parentIdx: number = this.checkedIds.indexOf(parentId);
                    if (parentIdx >= 0) {
                        this.checkedIds.splice(parentIdx, 1); // remove the element
                        this._checkedEntities.remove(parentId);
                        this.getEntityById(parentId).defaultChecked = false;
                    }
                }
                // check for set isIndeterminate
                let checkedItemsCount = 0;
                let childrenIds: string[] = this._dicChapter.getValue(parentId);
                for (let i: number = 0; i < childrenIds.length; i++) {
                    if (checkedItemsCount !== 0 && checkedItemsCount !== i) {
                        break;
                    }
                    if (this.checkedIds.indexOf(childrenIds[i]) >= 0) {
                        checkedItemsCount++;
                    }
                }
                (<HierarchyItemViewModel>this.getEntityById(parentId)).isIndeterminate = checkedItemsCount !== 0 && checkedItemsCount !== childrenIds.length;

            }
        }

        /**
        * This private method returns the parent entity id of a specified entity
        * It throws an error is no parent is found
        * @param entityId string The entity for which we need to find the parent
        * @return string the parent entity id
        */
        private getParentId(entityId: string): string {
            let idLength: number = entityId.length;
            let startIdx: number = this._listIds.indexOf(entityId) - 1;
            for (let i: number = startIdx; i >= 0; i--) {
                if (this._listIds[i].substr(idLength - 1) === "0") {
                    // the parent is found
                    return this._listIds[i]; // return the id of the parent
                }
            }

            throw new Error("The parent id was not found");
        }

        constructor($utility: ap.utility.UtilityHelper, $api: ap.services.apiHelper.Api, $q: angular.IQService, $controllersManager: ap.controllers.ControllersManager, entityName: string) {
            super($utility, $controllersManager.listController, $q, new GenericPagedListOptions(entityName, entityName === "ChapterHierarchy" ? ChapterHierarchyItemViewModel : RoomHierarchyItemViewModel));
            this._dicChapter = new Dictionary<string, string[]>();
            let currentProject = $controllersManager.mainController.currentProject();
            if (currentProject) {
                this.addCustomParam("projectid", currentProject.Id);
            } else {
                this.addCustomParam("projectid", ap.utility.UtilityHelper.createEmptyGuid());
            }
        }

        private _dicChapter: IDictionary<string, string[]>; // Will contains for each id of chapter the list of linked issues types ids
    }
}