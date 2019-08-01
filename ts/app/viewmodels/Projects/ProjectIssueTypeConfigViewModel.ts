module ap.viewmodels.projects {
    export class ProjectIssueTypeConfigViewModel implements IDispose {

        /**
        * Method use to check changes in lists
        **/
        public get hasChanged(): boolean {
            return this._hasChanged;
        }

        /*
        * Private method to know if a the lists have modification or not
        * This will also enable/disable to save button
        */
        private checkHasChanged() {
            this._hasChanged = this._chapterListVm.getChangedItems().length > 0 || this._issueTypeListVm.getChangedItems().length > 0 || this._subjectDescListVm.getChangedItems().length > 0;
            this._saveAction.isEnabled = this._hasChanged && this.chapterListVm.isValid() && this.issueTypeListVm.isValid && this.subjectDescListVm.isValid;
        }

        /**
         * Determines whether any popup managed by this view model is currently active
         */
        public get isPopupActive(): boolean {
            return this._importProjectIssueTypeViewModel !== null || this._importExcelViewModel !== null;
        }

        /**
        * Method use to get issueTypeListVm
        **/
        public get issueTypeListVm(): ap.viewmodels.projects.IssueTypeListViewModel {
            return this._issueTypeListVm;
        }

        /**
        * Method use to get chapterListVm
        **/
        public get chapterListVm(): ap.viewmodels.projects.ChapterListViewModel {
            return this._chapterListVm;
        }

        /**
        * Method use to get subjectDescListVm
        **/
        public get subjectDescListVm(): ap.viewmodels.projects.IssueTypeNoteSubjectListViewModel {
            return this._subjectDescListVm;
        }

        /**
        * Method use to get screenInfo
        **/
        public get screenInfo(): ap.misc.ScreenInfo {
            return this._screenInfo;
        }

        /**
        * Method use to load the chapter ids
        **/
        public loadIdsData(): void {
            this._dicChapter.clear();
            let url = "rest/chapterhierarchiesids";
            let options: ap.services.apiHelper.ApiOption = new ap.services.apiHelper.ApiOption();
            let currentProj: ap.models.projects.Project = this.$controllersManager.mainController.currentProject();
            options.showDetailBusy = true;
            options.customParams.push(new ap.services.apiHelper.ApiCustomParam("projectId", currentProj.Id));
            options.customParams.push(new ap.services.apiHelper.ApiCustomParam("baseentityname", "chapter"));
            let self = this;
            this.Api.getApiResponse(url, ap.services.apiHelper.MethodType.Get, null, null, options).then((response: ap.services.apiHelper.ApiResponse) => {
                let collection = response.data;
                let num: string = null;
                let id: string = null;
                let currentChapterId: string = null;
                let itemId: string = null;
                for (let i = 0; i < collection.length; i++) {
                    itemId = collection[i];
                    num = itemId.substr(itemId.length - 1);
                    id = itemId.substr(0, itemId.length - 1);
                    if (num === "0") { // For chapterHierarchy, the ids contains the real id + a char to know the real type of the item (Chapter = 0, IssueType = 1)
                        currentChapterId = id;
                        this._dicChapter.add(id, []);
                    } else if (num === "1") { // case of issue type
                        this._dicChapter.getValue(currentChapterId).push(id);
                    }
                }
                self._chapterListVm.specifyIds(this._dicChapter.keys());
            });
        }

        /**
         * Switch issue types page to the edit mode
         */
        public gotoEditMode() {
            this.editIssueTypeConfig();
            this.checkEditAccess();
        }

        /**
        * Method called when the event selectedItemChanged is raised by issueTypeListVm
        **/
        private handlerSelectedIssueTypeChanged() {
            let selectedIssueType = <IssueTypeViewModel>this._issueTypeListVm.selectedViewModel;

            if (selectedIssueType) {
                let isSelectionAllowed = selectedIssueType.originalEntity.IsNew || selectedIssueType.isValid() || selectedIssueType.hasInvalidChildren;
                if (isSelectionAllowed) {
                    // load for subject call in setter subjectDescListVm.issueTypeId
                    this._subjectDescListVm.issueTypeId = selectedIssueType.originalEntity.Id;
                    this._subjectDescListVm.parentIsssueTypeVm = <ap.viewmodels.projects.IssueTypeViewModel>this._issueTypeListVm.selectedViewModel;

                    if (selectedIssueType.isValid()) {
                        this._subjectDescListVm.enableActions();
                    } else {
                        this._subjectDescListVm.disableActions();
                    }
                }
                return;
            }

            this._subjectDescListVm.issueTypeId = null;
            this._subjectDescListVm.parentIsssueTypeVm = null;
            this._subjectDescListVm.clear();
            this._subjectDescListVm.disableActions();
        }

        /**
         * Method called when the event selectedItemChanged is raised by chapterListVm
         */
        private handlerSelectedChapterChanged() {
            let selectedChapter = <ChapterViewModel>this._chapterListVm.selectedViewModel;

            if (selectedChapter) {
                let isSelectionAllowed = selectedChapter.originalEntity.IsNew || selectedChapter.isValid() || selectedChapter.hasInvalidChildren;
                if (isSelectionAllowed) {
                    this._issueTypeListVm.clear();
                    this._issueTypeListVm.parentChapter = selectedChapter;
                    this._issueTypeListVm.specifyIds(this._dicChapter.getValue(selectedChapter.originalEntity.Id));

                    if (selectedChapter.isValid()) {
                        this._issueTypeListVm.enableActions();
                    } else {
                        this._issueTypeListVm.disableActions();
                    }

                    this._subjectDescListVm.clear();
                    this._subjectDescListVm.issueTypeId = null;
                    this._subjectDescListVm.parentIsssueTypeVm = null;
                    this._subjectDescListVm.disableActions();

                    let loadPagePromise = this._issueTypeListVm.loadNextPage();
                    if (this._selectedIssueTypeId) {
                        loadPagePromise.then(() => {
                            this._issueTypeListVm.selectEntity(this._selectedIssueTypeId);
                            this._selectedIssueTypeId = null;
                        });
                    }
                }

                return;
            }

            this._issueTypeListVm.clear();
            this._issueTypeListVm.parentChapter = null;
            this._issueTypeListVm.specifyIds([]);
            this._issueTypeListVm.selectedViewModel = null;
            this._issueTypeListVm.disableActions();

            this._subjectDescListVm.clear();
            this._subjectDescListVm.issueTypeId = null;
            this._subjectDescListVm.parentIsssueTypeVm = null;
            this._subjectDescListVm.disableActions();
        }

        /**
        * Private method used to know if the user can edit the project's categories or not
        **/
        private checkEditAccess() {
            let project = this.$controllersManager.mainController.currentProject();
            if (this.$utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_ProjectIssueTypeConfig)) {
                if (this._screenInfo.isEditMode === false) {
                    this._editAction.isVisible = true;
                    this._importAction.isVisible = true;
                } else {
                    this._editAction.isVisible = false;
                    this._importAction.isVisible = false;
                }
            } else {
                this._editAction.isVisible = false;
                this._importAction.isVisible = false;
            }

            if (this._screenInfo.isEditMode === false) {
                if (project.UserAccessRight.CanConfig === true) {
                    this._editAction.isEnabled = true;
                    this._importAction.isEnabled = true;
                } else {
                    this._editAction.isEnabled = false;
                    this._importAction.isEnabled = false;
                }
            } else {
                this._editAction.isEnabled = false;
                this._importAction.isEnabled = false;
            }

            this.checkHasChanged();

            // save
            this._saveAction.isVisible = this._screenInfo.isEditMode;

            this._cancelAction.isVisible = this._screenInfo.isEditMode;
            this._cancelAction.isEnabled = this._screenInfo.isEditMode;
        }

        /**
        * Method use to manage actions
        **/
        private actionClickedHandler(action: string) {
            switch (action) {
                case "issuetype.edit":
                    this.gotoEditMode();
                    break;
                case "issuetype.save":
                    this.save();
                    break;
                case "issuetype.cancel":
                    this.cancel();
                    this.checkEditAccess();
                    break;
                case "import.excel":
                    this.importExcel();
                    break;
                case "import.project":
                    this.importProject();
                    break;
            }
        }

        /**
        * This protected method makes the screen go to edit mode
        */
        protected editIssueTypeConfig() {
            this._screenInfo.isEditMode = true;
            this._chapterListVm.useCacheSystem = true;
            this._issueTypeListVm.useCacheSystem = true;
            this._subjectDescListVm.useCacheSystem = true;
            this._chapterListVm.dragOptions.isEnabled = this._chapterListVm.isValid();
            this._issueTypeListVm.dragOptions.isEnabled = this._issueTypeListVm.isValid;
            this._subjectDescListVm.dragOptions.isEnabled = this._subjectDescListVm.isValid;
            this._listener.raise("editmodechanged", new base.EditModeEvent(this));
        }

        /**
        * This private method makes the screen go to read mode
        */
        protected _readModeIssueTypeConfig() {
            this._screenInfo.isEditMode = false;
            this._chapterListVm.useCacheSystem = false;
            this._issueTypeListVm.useCacheSystem = false;
            this._subjectDescListVm.useCacheSystem = false;
            this._chapterListVm.dragOptions.isEnabled = false;
            this._issueTypeListVm.dragOptions.isEnabled = false;
            this._subjectDescListVm.dragOptions.isEnabled = false;
            this.checkEditAccess();

            this._listener.raise("editmodechanged", new base.EditModeEvent(this));
        }

        /**
         * This method will update the dicChapter dic when a new chapter is inserted in the list.
         **/
        private handlerChapterItemInserted(itemInfo: ItemInsertedEvent) {
            if (!this._dicChapter.containsKey(itemInfo.item.originalEntity.Id)) {
                this._dicChapter.add(itemInfo.item.originalEntity.Id, []);
            }
            this._subjectDescListVm.clear();
        }

        private calculateRemovedSubjects(toSaveRemovedSubjects: string[], tmpRemovedSubjects: string[]): string[] {
            if (tmpRemovedSubjects.length > 0) {
                tmpRemovedSubjects.forEach((noteSubjId) => {
                    if (toSaveRemovedSubjects.indexOf(noteSubjId) === -1) {
                        toSaveRemovedSubjects.push(noteSubjId);
                    }
                });
            }
            return toSaveRemovedSubjects;
        }

        private chapterDeleteHandler(chapter: ap.viewmodels.projects.ChapterViewModel) {
            if (chapter.isMarkedToDelete) {
                this.servicesManager.projectService.getIssueTypeNoteSubjectOfIssueTypes(this._dicChapter.getValue(chapter.originalEntity.Id)).then((ids) => {
                    this._dicNoteSubjectsToRemove.add(chapter.originalEntity.Id, ids);
                });
            } else {
                this._dicNoteSubjectsToRemove.remove(chapter.originalEntity.Id);
            }
        }

        /**
        * Method use to save the user's changes in edit mode
        **/
        public save() {
            let toSave: ap.models.custom.ProjectPunchlists = new ap.models.custom.ProjectPunchlists(this.$utility);
            let tmp: ap.models.custom.ProjectPunchlists = new ap.models.custom.ProjectPunchlists(this.$utility);
            let categories: ap.models.custom.ProjectPunchlists = new ap.models.custom.ProjectPunchlists(this.$utility);

            // Collect changes
            tmp = this._chapterListVm.postChange();
            toSave.ChaptersToDelete = tmp.ChaptersToDelete;
            toSave.ChaptersToUpdate = tmp.ChaptersToUpdate;

            tmp = this._issueTypeListVm.postChange();
            toSave.IssueTypesToDelete = tmp.IssueTypesToDelete;
            toSave.IssueTypesToUpdate = tmp.IssueTypesToUpdate;

            tmp = this._subjectDescListVm.postChange();
            toSave.NoteSubjectsToDelete = tmp.NoteSubjectsToDelete;
            toSave.NoteSubjectsToUpdate = tmp.NoteSubjectsToUpdate;

            // We have to remove issue types from the deleted chapters manually in order to avoid a foreign key error
            for (let i = 0, ilen = toSave.ChaptersToDelete.length; i < ilen; i++) {
                let deletedChapterId = toSave.ChaptersToDelete[i];
                if (this._dicNoteSubjectsToRemove.containsKey(toSave.ChaptersToDelete[i])) {
                    toSave.NoteSubjectsToDelete = this.calculateRemovedSubjects(toSave.NoteSubjectsToDelete, this._dicNoteSubjectsToRemove.getValue(toSave.ChaptersToDelete[i]));
                }
                let deletedIssueTypeIds = this._dicChapter.getValue(deletedChapterId);

                for (let j = 0, jlen = deletedIssueTypeIds.length; j < jlen; j++) {
                    if (toSave.IssueTypesToDelete.indexOf(deletedIssueTypeIds[j]) < 0) {
                        toSave.IssueTypesToDelete.push(deletedIssueTypeIds[j]);
                    }
                }
            }

            if (toSave.ChaptersToDelete.length > 0 || toSave.ChaptersToUpdate.length > 0 || toSave.IssueTypesToDelete.length > 0 || toSave.IssueTypesToUpdate.length > 0 || toSave.NoteSubjectsToDelete.length > 0 || toSave.NoteSubjectsToUpdate.length > 0) {
                this.confirmAndSave(toSave);
            } else {
                this._readModeIssueTypeConfig();
                this.subjectDescListVm.clearInfo();
                this.issueTypeListVm.clearInfo();
                this.chapterListVm.clearInfo();
                this.loadIdsData();
            }
        }

        /**
         * Asks a user to confirm that he or she wants to modify a list of chapters, issue types and subjects.
         * If the user give a positive answer, it saves changes on the server side.
         * @param changes a model which holds changes to issue types which have to be saved
         */
        private confirmAndSave(changes: ap.models.custom.ProjectPunchlists) {
            let newChapters = changes.ChaptersToUpdate.filter((chapter: ap.models.projects.Chapter) => {
                return chapter.IsNew;
            });
            let newIssues = changes.IssueTypesToUpdate.filter((issueType: ap.models.projects.IssueType) => {
                return issueType.IsNew;
            });
            let newSubjects = changes.NoteSubjectsToUpdate.filter((subject: ap.models.projects.IssueTypeNoteSubject) => {
                return subject.IsNew;
            });

            let title = this.$utility.Translator.getTranslation("Please confirm");
            let message = this.$utility.Translator.getTranslation("app.issueType.save").format(
                newChapters.length.toString(),
                newIssues.length.toString(),
                newSubjects.length.toString(),
                (changes.ChaptersToUpdate.length - newChapters.length).toString(),
                (changes.IssueTypesToUpdate.length - newIssues.length).toString(),
                (changes.NoteSubjectsToUpdate.length - newSubjects.length).toString(),
                changes.ChaptersToDelete.length.toString(),
                changes.IssueTypesToDelete.length.toString(),
                changes.NoteSubjectsToDelete.length.toString()
            );

            this.$controllersManager.mainController.showConfirm(message, title, (confirm) => {
                if (confirm === ap.controllers.MessageResult.Positive) {
                    for (let i = 0; i < changes.ChaptersToUpdate.length; i++) {
                        this._chapterListVm.getEntityById(changes.ChaptersToUpdate[i].Id).postChanges();
                    }
                    for (let i = 0; i < changes.IssueTypesToUpdate.length; i++) {
                        this._issueTypeListVm.getEntityById(changes.IssueTypesToUpdate[i].Id).postChanges();
                    }
                    for (let i = 0; i < changes.NoteSubjectsToUpdate.length; i++) {
                        this._subjectDescListVm.getEntityById(changes.NoteSubjectsToUpdate[i].Id).postChanges();
                    }
                    this.$controllersManager.projectController.updateProjectPunchList(changes).then((result: ap.models.custom.ProjectPunchlists) => {
                        this._readModeIssueTypeConfig();
                        this.subjectDescListVm.clearInfo();
                        this.issueTypeListVm.clearInfo();
                        this.chapterListVm.clearInfo();
                        this.loadIdsData();
                    });

                    // send Segment.IO events
                    let currentProject: ap.models.projects.Project = this.$controllersManager.mainController.currentProject();
                    let paramValues = [new KeyValue("cli-action-edit project category-add category", newChapters.length > 0 ? "true" : "false"),
                        new KeyValue("cli-action-edit project category-add subcategory", newIssues.length > 0 ? "true" : "false"),
                        new KeyValue("cli-action-edit project category-add subject", newSubjects.length > 0 ? "true" : "false"),
                        new KeyValue("cli-action-edit project category-update category", (changes.ChaptersToUpdate.length - newChapters.length) > 0 ? "true" : "false"),
                        new KeyValue("cli-action-edit project category-update subcategory", (changes.IssueTypesToUpdate.length - newIssues.length) > 0 ? "true" : "false"),
                        new KeyValue("cli-action-edit project category-update subject", (changes.NoteSubjectsToUpdate.length - newSubjects.length) > 0 ? "true" : "false"),
                        new KeyValue("cli-action-edit project category-delete category", changes.ChaptersToDelete.length > 0 ? "true" : "false"),
                        new KeyValue("cli-action-edit project category-delete subcategory", changes.IssueTypesToDelete.length > 0 ? "true" : "false"),
                        new KeyValue("cli-action-edit project category-delete subject", changes.NoteSubjectsToDelete.length > 0 ? "true" : "false"),
                        new KeyValue("cli-action-edit project category-project name", currentProject.Name),
                        new KeyValue("cli-action-edit project category-project id", currentProject.Id),
                        new KeyValue("cli-action-edit project category-screenname", "projectconfig")
                    ];
                    this.servicesManager.toolService.sendEvent("cli-action-edit project category", new Dictionary(paramValues));
                }
            });
        }

        /**
        * Method use to cancel the user's changes in edit mode
        **/
        public cancel() {
            this.chapterListVm.cancel();
            this.issueTypeListVm.cancel();
            this.subjectDescListVm.cancel();
            this.loadIdsData();
            this._readModeIssueTypeConfig();
        }

        /**
         * A handler for the propertychanged event of the chapters list
         * @param args
         */
        private chapterListPropertyChangedHandler(args: base.PropertyChangedEventArgs) {
            if (args.propertyName !== "isValid") {
                return;
            }

            this.updateActionsAvailability();
        }

        /**
         * A handler for the propertychanged event of the issue types list
         * @param args
         */
        private issueTypeListPropertyChangedHandler(args: base.PropertyChangedEventArgs) {
            if (args.propertyName !== "isValid") {
                return;
            }

            let selectedChapter = <ChapterViewModel>this._chapterListVm.selectedViewModel;
            if (selectedChapter) {
                selectedChapter.hasInvalidChildren = !this._issueTypeListVm.isValid;
            }

            this.updateActionsAvailability();
        }

        /**
         * A handler for the propertychanged event of the subject list
         * @param args
         */
        private subjectListPropertyChangedHandler(args: base.PropertyChangedEventArgs) {
            if (args.propertyName !== "isValid") {
                return;
            }

            let selectedIssueType = <IssueTypeViewModel>this._issueTypeListVm.selectedViewModel;
            if (selectedIssueType) {
                selectedIssueType.hasInvalidChildren = !this._subjectDescListVm.isValid;
            }

            this.updateActionsAvailability();
        }

        /**
         * Updates availability of actions based of validity of lists
         */
        private updateActionsAvailability() {
            let isStateValid = this._chapterListVm.isValid() && this._issueTypeListVm.isValid && this._subjectDescListVm.isValid;

            this._chapterListVm.updateItemsActionsState(isStateValid);
            this._issueTypeListVm.updateItemsActionsState(isStateValid);

            if (isStateValid) {
                if (this._chapterListVm.selectedViewModel) {
                    this._issueTypeListVm.enableActions();
                    if (this._issueTypeListVm.selectedViewModel) {
                        this._subjectDescListVm.enableActions();
                    }
                }
            } else {
                if (this._chapterListVm.selectedViewModel) {
                    this._issueTypeListVm.disableActions();
                    if (this._issueTypeListVm.selectedViewModel) {
                        this._subjectDescListVm.disableActions();
                    }
                }
            }

            this.checkHasChanged();
        }

        /**
        * Method called when the action Import clicked
        * This method create new Import Excel IssueType View Model
        * AND displayed mdDialog with current view model
        **/
        private importExcel(retry?: boolean) {
            this._importExcelViewModel = new ap.viewmodels.projects.ImportExcelIssueTypeViewModel(this.$q, this.$mdDialog, this.$controllersManager, this.$utility, retry);

            let importExcelController = ($scope: angular.IScope) => {
                $scope["importExcelViewModel"] = this._importExcelViewModel;
            };
            importExcelController.$inject = ["$scope"];

            this.$mdDialog.show({
                clickOutsideToClose: false,
                preserveScope: true,
                templateUrl: "me/PartialView?module=Project&name=ImportExcelDialog",
                fullscreen: true,
                controller: importExcelController
            }).then((withError: boolean) => {
                if (withError) {
                    this.$controllersManager.mainController.showErrorKey("app.err.ImportExcel_badData", "app.err.title.ImportExcel_badData", null, () => {
                        this.importExcel(true);
                    });
                } else {
                    if (this._importExcelViewModel.importedData) {
                        let importedChapters = <ap.models.projects.Chapter[]>this._importExcelViewModel.importedData.slice();
                        this.beforeImportData(importedChapters);
                    }
                }
            }).finally(() => {
                this._importExcelViewModel.dispose();
                this._importExcelViewModel = null;
            });
        }

        /**
        * Method called when the action Import from another project clicked
        * This method create new Import Project IssueType View Model
        * AND displayed mdDialog with current view model
        **/
        private importProject() {
            this._importProjectIssueTypeViewModel = new ap.viewmodels.projects.ImportProjectIssueTypeViewModel(this.$utility, this.$q, this.Api, this.$controllersManager, this.servicesManager, this.$mdDialog, this.$timeout);
            this.$controllersManager.mainController.showBusy();

            let importFromProjectController = ($scope: angular.IScope) => {
                $scope["importProjectIssueTypeViewModel"] = this._importProjectIssueTypeViewModel;
            };
            importFromProjectController.$inject = ["$scope"];

            this.$mdDialog.show({
                clickOutsideToClose: false,
                preserveScope: true,
                onComplete: () => {
                    this.$controllersManager.mainController.hideBusy();
                },
                templateUrl: "me/PartialView?module=Project&name=ImportProjectIssueTypeDialog",
                fullscreen: true,
                controller: importFromProjectController
            }).then((chaptersToImport: models.projects.Chapter[]) => {
                this.beforeImportData(chaptersToImport);
            }).finally(() => {
                this._importProjectIssueTypeViewModel.dispose();
                this._importProjectIssueTypeViewModel = null;
            });
        }

        /**
        * If there is more than 100 chapters need to load the last item to know his displayOrder
        * @param chapters Chapter[] this is array of Chapters
        */
        private beforeImportData(chapters: ap.models.projects.Chapter[]) {
            let lastItem: viewmodels.projects.ParentCellViewModel = <viewmodels.projects.ParentCellViewModel>this.chapterListVm.getItemAtIndex(this.chapterListVm.sourceItems.length - 1);
            if (lastItem) {
                this.importData(chapters);
            } else {
                let pageIndex: number = this.chapterListVm.getPageIndex(this.chapterListVm.ids[this.chapterListVm.ids.length - 1]);
                this.chapterListVm.loadPage(pageIndex).then(() => {
                    this.importData(chapters);
                });
            }
        }

        /**
        * This method created view models with imported data
        * @param chapters Chapter[] this is array of Chapters
        **/
        private importData(chapters: ap.models.projects.Chapter[]) {
            this.editIssueTypeConfig();
            chapters.forEach((chapter: ap.models.projects.Chapter) => {

                let hasInvalidIssueTypes = false;
                let ids = new Array<string>(chapter.IssueTypes.length);
                chapter.IssueTypes.forEach((issueType: ap.models.projects.IssueType, index: number) => {
                    issueType.DisplayOrder = index + 10000;
                    ids[index] = issueType.Id;

                    let importIssueTypeViewModel = new IssueTypeViewModel(this.$utility);
                    importIssueTypeViewModel.init(issueType);
                    this._issueTypeListVm.addIntoCache(importIssueTypeViewModel);

                    let hasInvalidSubjects = false;
                    let listNoteSubjects: ap.viewmodels.projects.IssueTypeNoteSubjectViewModel[] = [];
                    issueType.NoteSubjects.forEach((noteSubject: ap.models.projects.IssueTypeNoteSubject, index: number) => {
                        noteSubject.DisplayOrder = index + 1;

                        let importNoteSubject = new ap.viewmodels.projects.IssueTypeNoteSubjectViewModel(this.$utility);
                        importNoteSubject.init(noteSubject);
                        listNoteSubjects.push(importNoteSubject);

                        if (!importNoteSubject.isValid()) {
                            hasInvalidSubjects = true;
                        }
                    });
                    issueType.NoteSubjects = null;

                    let noteSubjectDictionary: Dictionary<string, ap.viewmodels.projects.IssueTypeNoteSubjectViewModel[]> = new Dictionary<string, ap.viewmodels.projects.IssueTypeNoteSubjectViewModel[]>();
                    noteSubjectDictionary.add(issueType.Id, listNoteSubjects);
                    this._subjectDescListVm.addIntoCache(noteSubjectDictionary);

                    if (hasInvalidSubjects || this.checkDuplicatedSubjects(listNoteSubjects)) {
                        importIssueTypeViewModel.hasInvalidChildren = true;
                    }

                    if (!importIssueTypeViewModel.isValid()) {
                        hasInvalidIssueTypes = true;
                    }
                });
                chapter.IssueTypes = null;

                if (this.chapterListVm.sourceItems.length === 0) {
                    chapter.DisplayOrder = 10000;
                } else {
                    chapter.DisplayOrder = (<ap.models.projects.Chapter>this.chapterListVm.getItemAtIndex(this.chapterListVm.sourceItems.length - 1).originalEntity).DisplayOrder + 10000;
                }

                this._dicChapter.add(chapter.Id, ids);

                let importChapterViewModel = new ap.viewmodels.projects.ChapterViewModel(this.$utility);
                importChapterViewModel.init(chapter);

                if (hasInvalidIssueTypes) {
                    importChapterViewModel.hasInvalidChildren = true;
                }

                this._chapterListVm.insertItem(this._chapterListVm.count, importChapterViewModel, true);
            });

            this.checkEditAccess();
        }

        /**
        * Method used to know if some subcells are duplicated
        **/
        private checkDuplicatedSubjects(subjects: IssueTypeNoteSubjectViewModel[]): boolean {
            if (subjects.length > 1) {
                for (let i = 0; i < subjects.length; i++) {
                    for (let j = i + 1; j < subjects.length; j++) {
                        if (subjects[i].subject.toUpperCase() === subjects[j].subject.toUpperCase()) {
                            if (!subjects[i].isMarkedToDelete && !subjects[j].isMarkedToDelete) {
                                return true;
                            }
                        }
                    }
                }
            }
            return false;
        }

        /**
         * This method is used to initialize the screen the project issuetypes configuration screen
         */
        public initScreen() {
            this._editAction = new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "issuetype.edit", this.$utility.rootUrl + "Images/html/icons/ic_create_black_48px.svg", false, null, "Edit categories", false);
            this._saveAction = new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "issuetype.save", this.$utility.rootUrl + "Images/html/icons/ic_save_black_48px.svg", false, null, "Save categories", false);
            this._cancelAction = new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "issuetype.cancel", this.$utility.rootUrl + "Images/html/icons/ic_cancel_black_48px.svg", false, null, "Cancel changes", false);
            this._importAction = new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "issuetypes.import", this.$utility.rootUrl + "Images/html/icons/ic_import_export_black_24px.svg", false, [
                new ap.viewmodels.home.SubActionViewModel(this.$utility, this.$utility.EventTool, "import.excel", null, false, false, false, "Import from Excel"),
                new ap.viewmodels.home.SubActionViewModel(this.$utility, this.$utility.EventTool, "import.project", null, false, false, false, "Import from another project")
            ], "Import", true);

            let actions = [this._editAction, this._saveAction, this._cancelAction, this._importAction];

            this._screenInfo = new ap.misc.ScreenInfo(this.$utility, "project.issuetypeconfig", ap.misc.ScreenInfoType.List, actions, null, null, null, false, false);
            this._screenInfo.on("actionclicked", this.actionClickedHandler, this);

            this.checkEditAccess();
        }

        /**
        * Dispose method
        */
        public dispose() {
            this._screenInfo.dispose();
            this._chapterListVm.dispose();
            this._issueTypeListVm.dispose();
            this._subjectDescListVm.dispose();
        }

        on(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.on(eventName, callback, caller);
        }
        off(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.off(eventName, callback, caller);
        }

        private restoreSelectedChapter(isLoadedChanged: boolean) {
            if (isLoadedChanged === true) {
                this._chapterListVm.selectEntity(this._selectedChapterId);
                this._selectedChapterId = null;
                this._chapterListVm.off("isLoadedChanged", this.restoreSelectedChapter, this);
            }
        }

        /**
        * Set parentCellListVm.selectedViewModel to null (need after a delete for exemple)
        **/
        private setCategoryToNull() {
            this._chapterListVm.selectedViewModel = null;
        }

        /**
        * Set parentCellListVm.selectedViewModel to null (need after a delete for exemple)
        **/
        private setIssueTypeToNull() {
            this._issueTypeListVm.selectedViewModel = null;
        }

        /**
         * Handler indicating when chapter drag started or stopped
         * @param dragStarted Boolean variable indicating if drag started(true) or stopped(false)
         */
        private dragChapterHandler(dragStarted: boolean) {
            this._issueTypeListVm.dragOptions.isEnabled = this._issueTypeListVm.isValid && !dragStarted;
            this._subjectDescListVm.dragOptions.isEnabled = this._subjectDescListVm.isValid && !dragStarted;
        }

        /**
         * Handler indicating when issue type drag started or stopped
         * @param dragStarted Boolean variable indicating if drag started(true) or stopped(false)
         */
        private dragIssueTypeHandler(dragStarted: boolean) {
            this._chapterListVm.dragOptions.isEnabled = this._chapterListVm.isValid() && !dragStarted;
            this._subjectDescListVm.dragOptions.isEnabled = this._subjectDescListVm.isValid && !dragStarted;
        }

        /**
         * Handler indicating when subject drag starged or stopped
         * @param dragStarted Boolean variable indicating if drag started(true) or stopped(false)
         */
        private dragSubjectHandler(dragStarted: boolean) {
            this._chapterListVm.dragOptions.isEnabled = this._chapterListVm.isValid() && !dragStarted;
            this._issueTypeListVm.dragOptions.isEnabled = this._issueTypeListVm.isValid && !dragStarted;
        }

        /**
         * Drop entity handler - update entities display order and call API
         * @param event Drop entity event
         */
        private entityDroppedHandler(event: ap.component.dragAndDrop.DropEntityEvent) {
            if (event.dragTarget instanceof ChapterViewModel) {
                this._chapterListVm.sourceItems = <ChapterViewModel[]>ap.utility.sortDraggableEntities(<ChapterViewModel[]>this._chapterListVm.sourceItems, event);
                if (this.$utility.isIE()) {
                    this._chapterListVm.manageMoveItemsActions();
                }
            }
            if (event.dragTarget instanceof IssueTypeViewModel) {
                this._issueTypeListVm.sourceItems = <IssueTypeViewModel[]>ap.utility.sortDraggableEntities(<IssueTypeViewModel[]>this._issueTypeListVm.sourceItems, event);
                if (this.$utility.isIE()) {
                    let indexStartForUpdate = Math.min((<IssueTypeViewModel>event.dragTarget).index, (<IssueTypeViewModel>event.dropTarget).index);
                    this._issueTypeListVm.updateItemsIndex(indexStartForUpdate);
                    this._issueTypeListVm.manageMoveItemsActions();
                }
            }
            if (event.dragTarget instanceof IssueTypeNoteSubjectViewModel) {
                this._subjectDescListVm.sourceItems = <IssueTypeNoteSubjectViewModel[]>ap.utility.sortDraggableEntities(<IssueTypeNoteSubjectViewModel[]>this._subjectDescListVm.sourceItems, event);
                if (this.$utility.isIE()) {
                    let indexStartForUpdate = Math.min((<IssueTypeNoteSubjectViewModel>event.dragTarget).index, (<IssueTypeNoteSubjectViewModel>event.dropTarget).index);
                    this._subjectDescListVm.updateItemsIndex(indexStartForUpdate);
                    this._subjectDescListVm.manageMoveItemsActions();
                }
            }
            this.$scope.$apply();
        }

        constructor(private $scope: angular.IScope, protected $utility: ap.utility.UtilityHelper, private $q: angular.IQService, private Api: ap.services.apiHelper.Api,
            protected $controllersManager: ap.controllers.ControllersManager, private servicesManager: ap.services.ServicesManager, protected $mdDialog: angular.material.IDialogService,
            private $timeout: angular.ITimeoutService, private _selectedChapterId?: string, private _selectedIssueTypeId?: string
        ) {
            this._importExcelViewModel = null;
            this._importProjectIssueTypeViewModel = null;

            this._chapterListVm = new ap.viewmodels.projects.ChapterListViewModel($utility, $q, $controllersManager, this.servicesManager.projectService);
            this._chapterListVm.on("selectedItemChanged", this.handlerSelectedChapterChanged, this);
            this._chapterListVm.on("iteminserted", this.handlerChapterItemInserted, this);
            this._chapterListVm.on("hasChanged", this.checkHasChanged, this);
            this._chapterListVm.on("propertychanged", this.chapterListPropertyChangedHandler, this);
            this._chapterListVm.on("chapterdelete", this.chapterDeleteHandler, this);
            this._chapterListVm.on("dragchapter", this.dragChapterHandler, this);
            this._chapterListVm.on("entitydropped", this.entityDroppedHandler, this);

            this._issueTypeListVm = new ap.viewmodels.projects.IssueTypeListViewModel($utility, $q, $controllersManager);
            this._issueTypeListVm.on("selectedItemChanged", this.handlerSelectedIssueTypeChanged, this);
            this._issueTypeListVm.on("hasChanged", this.checkHasChanged, this);
            this._issueTypeListVm.on("propertychanged", this.issueTypeListPropertyChangedHandler, this);
            this._issueTypeListVm.on("needToUnselect", this.setCategoryToNull, this);
            this._issueTypeListVm.on("dragissuetype", this.dragIssueTypeHandler, this);
            this._issueTypeListVm.on("entitydropped", this.entityDroppedHandler, this);

            this._subjectDescListVm = new ap.viewmodels.projects.IssueTypeNoteSubjectListViewModel($utility, $q, $controllersManager);
            this._subjectDescListVm.on("needToUnselect", this.setIssueTypeToNull, this);
            this._subjectDescListVm.on("hasChanged", this.checkHasChanged, this);
            this._subjectDescListVm.on("propertychanged", this.subjectListPropertyChangedHandler, this);
            this._subjectDescListVm.on("dragsubject", this.dragSubjectHandler, this);
            this._subjectDescListVm.on("entitydropped", this.entityDroppedHandler, this);

            this._listener = this.$utility.EventTool.implementsListener(["editmodechanged", "entitydropped"]);
            if (this._selectedChapterId) {
                this._chapterListVm.on("isLoadedChanged", this.restoreSelectedChapter, this);
            }
            this.initScreen();

            this._dicChapter = new Dictionary<string, string[]>();
        }

        private _editAction: home.ActionViewModel;
        protected _saveAction: home.ActionViewModel;
        private _cancelAction: home.ActionViewModel;
        private _importAction: home.ActionViewModel;
        private _chapterListVm: ap.viewmodels.projects.ChapterListViewModel;
        private _issueTypeListVm: ap.viewmodels.projects.IssueTypeListViewModel;
        private _subjectDescListVm: ap.viewmodels.projects.IssueTypeNoteSubjectListViewModel;
        private _dicChapter: IDictionary<string, string[]>; // Will contains for each id of chapter the list of linked issue type ids
        private _dicNoteSubjectsToRemove: IDictionary<string, string[]> = new Dictionary<string, string[]>();
        private _screenInfo: ap.misc.ScreenInfo;
        private _listener: ap.utility.IListenerBuilder;
        private _hasChanged: boolean = false;
        private _importExcelViewModel: ap.viewmodels.projects.ImportExcelViewModel;
        private _importProjectIssueTypeViewModel: ap.viewmodels.projects.ImportProjectIssueTypeViewModel;
    }
}