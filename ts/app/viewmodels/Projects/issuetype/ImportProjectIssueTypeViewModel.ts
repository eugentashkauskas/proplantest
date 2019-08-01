module ap.viewmodels.projects {
    export class ImportProjectIssueTypeViewModel implements IDispose {
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
        * The VM to select the meeting for the new point
        **/
        public get projectSelector(): ap.viewmodels.projects.ProjectSelectorViewModel {
            return this._projectSelector;
        }

        /**
        * Use to know if we need to show the project selector dropdown
        **/
        public get needSelectProject(): boolean {
            return this._needSelectProject;
        }

        /**
        * Use to know if we need to load only issutypes which have at least one subject
        **/
        public get loadIssuetypeWithSubjects(): boolean {
            return this._loadIssuetypeWithSubjects;
        }

        /**
         * Determines whether the popup is loading data from the server at the moment
         */
        public get isDialogBusy(): boolean {
            return this._isDialogBusy;
        }

        /**
        * Method use to close the pop up
        **/
        public cancel() {
            this.dispose();
            this.$mdDialog.cancel();
        }

        /**
        * Method use to disable or enable the import button
        **/
        public get importbuttonDisable(): boolean {
            if (this.chapterListVm.getCheckedItems().length > 0) {
                return false;
            } else {
                return true;
            }
        }

        /**
        * Method use to get all the categories checked 
        * @return chapter[]: the list of chapters checked with their issueTypes linked and their subjects linked too
        **/
        public import() {
            let chapters: ap.models.projects.Chapter[] = [];

            let chaptersChecked: string[] = this.chapterListVm.getCheckedItems().map((item) => { return item.originalEntity.Id; });
            if (chaptersChecked && chaptersChecked.length > 0) {
                for (let i = 0; i < chaptersChecked.length; i++) {
                    let selectedChap: ap.models.projects.Chapter = <ap.models.projects.Chapter>this.chapterListVm.getEntityById(chaptersChecked[i]).originalEntity;
                    let chapter: ap.models.projects.Chapter = new ap.models.projects.Chapter(this.$utility, selectedChap.Code, selectedChap.Description, this._controllersManager.mainController.currentProject().Id);
                    let issueTypesChecked: ap.models.projects.IssueType[] = this.issueTypeListVm.checkedItemsDict.getValue(chaptersChecked[i]);

                    if (issueTypesChecked && issueTypesChecked.length > 0) {
                        let issueTypesCheckedIds: string[] = issueTypesChecked.map((item) => { return item.Id; });
                        for (let j = 0; j < issueTypesChecked.length; j++) {
                            let selectedIssueType: ap.models.projects.IssueType = <ap.models.projects.IssueType>issueTypesChecked[j];
                            let issueType: ap.models.projects.IssueType = new ap.models.projects.IssueType(this.$utility, selectedIssueType.Code, selectedIssueType.Description);
                            issueType.ParentChapter = chapter;
                            let subjectsChecked: ap.models.projects.IssueTypeNoteSubject[] = this.subjectDescListVm.checkedItemsDict.getValue(issueTypesCheckedIds[j]);

                            if (subjectsChecked && subjectsChecked.length > 0) {
                                let subjectsCheckedIds = subjectsChecked.map((item) => { return item.Id; });
                                for (let k = 0; k < subjectsChecked.length; k++) {
                                    let selectedSubject: ap.models.projects.IssueTypeNoteSubject = <ap.models.projects.IssueTypeNoteSubject>subjectsChecked[k];
                                    let subject: ap.models.projects.IssueTypeNoteSubject = new ap.models.projects.IssueTypeNoteSubject(this.$utility, selectedSubject.Subject, selectedSubject.DefaultDescription);
                                    subject.IssueType = issueType;
                                    issueType.NoteSubjects.push(subject);
                                }
                            }

                            chapter.IssueTypes.push(issueType);
                        }
                    }

                    chapters.push(chapter);
                }
            }
            this.$mdDialog.hide(chapters);
        }

        /**
        * Method use to create points from subjects
        **/
        public save() {
            let issueTypesIds: string[] = [];
            let chaptersChecked: string[] = this.chapterListVm.getCheckedItems().map((item) => { return item.originalEntity.Id; });
            if (chaptersChecked && chaptersChecked.length > 0) {
                for (let i = 0; i < chaptersChecked.length; i++) {
                    let issueTypesChecked: ap.models.projects.IssueType[] = this.issueTypeListVm.checkedItemsDict.getValue(chaptersChecked[i]);
                    if (issueTypesChecked && issueTypesChecked.length > 0) {
                        let issueTypesCheckedIds: string[] = issueTypesChecked.map((item) => { return item.Id; });
                        for (let j = 0; j < issueTypesCheckedIds.length; j++) {
                            issueTypesIds.push(issueTypesCheckedIds[j]);
                        }
                    }
                }
            }
            this._servicesManager.noteService.createNotesFromSubjects(this._controllersManager.mainController.currentMeeting.Id, issueTypesIds).then(() => {
                this.$mdDialog.hide();
            });
        }

        /**
        * Method use to check/uncheck every issueType of the chapter in param
        * @param chapter: the chapter which has been checked/unchecked
        **/
        public checkedCategorie(categorie: any) {
            if (categorie instanceof ChapterViewModel) {
                let chapterVm: ap.viewmodels.projects.ChapterViewModel = <ap.viewmodels.projects.ChapterViewModel>categorie;
                this.chapterIsChecked(chapterVm);
            }
            if (categorie instanceof IssueTypeViewModel) {
                let issueTypeVm: ap.viewmodels.projects.IssueTypeViewModel = <ap.viewmodels.projects.IssueTypeViewModel>categorie;
                this.issueTypeIsChecked(issueTypeVm);
            }
            if (categorie instanceof IssueTypeNoteSubjectViewModel) {
                let subjectVm: ap.viewmodels.projects.IssueTypeNoteSubjectViewModel = <ap.viewmodels.projects.IssueTypeNoteSubjectViewModel>categorie;
                this.subjectIsChecked(subjectVm);
            }
        }

        /**
        * Method use to load the chapter ids
        **/
        public loadIdsData(): void {
            this._dicChapter.clear();
            let url: string = "rest/chapterhierarchiesids";
            let options: ap.services.apiHelper.ApiOption = new ap.services.apiHelper.ApiOption();
            options.customParams.push(new ap.services.apiHelper.ApiCustomParam("projectId", this.projectSelector.selectedProjectId));
            this._api.getApiResponse(url, ap.services.apiHelper.MethodType.Get, null, null, options).then((response: ap.services.apiHelper.ApiResponse) => {
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
                this._chapterListVm.specifyIds(this._dicChapter.keys());
            });
        }

        /**
        * Method use to load the chapters Ids
        **/
        private loadIssueTypeWithSubjectsOnly(chapters: ap.models.projects.Chapter[]) {
            this._dicChapter.clear();
            for (let i = 0; i < chapters.length; i++) {
                let chapter: ap.models.projects.Chapter = chapters[i];
                let issueTypesIds: string[] = [];
                for (let j = 0; j < chapter.IssueTypes.length; j++) {
                    issueTypesIds.push(chapter.IssueTypes[j].Id);
                }
                this._dicChapter.add(chapter.Id, issueTypesIds);
            }
            this._chapterListVm.specifyIds(this._dicChapter.keys());
        }

        /**
         * Dispose method
         */
        public dispose() {
            this._api.off("showdetailbusy", this.onDataLoadingChanged, this);
            this._projectSelector.off("selectedItemChanged", this._projectSelectorSelectedItemChanged, this);
            this._chapterListVm.dispose();
            if (this._chapterListVm) {
                this._chapterListVm.off("selectedItemChanged", this.handlerSelectedChapterChanged, this);
                this.chapterListVm.off("itemchecked", this.checkedCategorie, this);
                this._chapterListVm.dispose();
            }
            if (this._issueTypeListVm) {
                this._issueTypeListVm.off("selectedItemChanged", this.handlerSelectedIssueTypeChanged, this);
                this._issueTypeListVm.off("itemchecked", this.checkedCategorie, this);
                this._issueTypeListVm.dispose();
            }
            if (this._subjectDescListVm) {
                this.subjectDescListVm.off("itemchecked", this.checkedCategorie, this);
                this._subjectDescListVm.dispose();
            }
        }


        /**
        * This method is used to keep the last selected project make by the user
        * @param selectedProjectVm is the selected project
        **/
        private _projectSelectorSelectedItemChanged(selectedProjectVm: ap.viewmodels.projects.ProjectSelectorViewModel) {
            if (selectedProjectVm && selectedProjectVm !== null) {
                this._issueTypeListVm.checkedItemsDict.clear();
                this._subjectDescListVm.checkedItemsDict.clear();
                this.issueTypeListVm.specifyIds([]);
                this.subjectDescListVm.clearInfo();
                this.loadIdsData();
            }
        }

        /**
        * Method used to check/uncheck every issueType of the chapter in param
        * @param chapter: the chapter which has been checked/unchecked
        **/
        private chapterIsChecked(chapter: ap.viewmodels.projects.ChapterViewModel) {
            let issueTypes: ap.models.projects.IssueType[] = [...(<ap.models.projects.Chapter>chapter.originalEntity).IssueTypes];
            if (!issueTypes && issueTypes.length === 0)
                return;
            if (!this.issueTypeListVm.checkedItemsDict.containsKey(chapter.originalEntity.Id) && chapter.isChecked) {
                this.issueTypeListVm.setCheckedAllItems(true, chapter.originalEntity.Id, issueTypes);
                issueTypes.forEach((issueType) => {
                    this.subjectDescListVm.setCheckedAllItems(true, issueType.Id, issueType.NoteSubjects);
                });
            } else if (!chapter.isChecked) {
                issueTypes.forEach((issueType) => {
                    this.subjectDescListVm.setCheckedAllItems(false, issueType.Id);
                });
                this.issueTypeListVm.setCheckedAllItems(false, chapter.originalEntity.Id);
            }
        }

        /**
        * Method used to check/uncheck the subject in param
        * @param subject: the subject which has been checked/unchecked
        **/
        private subjectIsChecked(subject: ap.viewmodels.projects.IssueTypeNoteSubjectViewModel) {
            if (subject.isChecked) {
                let issueTypeVm = <ap.viewmodels.projects.IssueTypeViewModel>this.issueTypeListVm.getEntityById(subject.issueTypeViewModel.originalEntity.Id);
                issueTypeVm.isChecked = true;
                this.chapterListVm.getEntityById(issueTypeVm.chapterViewModel.originalEntity.Id).isChecked = true;
            }
        }

        /**
        * Method used to check/uncheck every subject of the issueType in param
        * @param issueType: the issueType which has been checked/unchecked
        **/
        private issueTypeIsChecked(issueType: ap.viewmodels.projects.IssueTypeViewModel) {
            let subjects: ap.models.projects.IssueTypeNoteSubject[] = [...(<ap.models.projects.IssueType>issueType.originalEntity).NoteSubjects];
            if (!subjects && subjects.length === 0)
                return;
            if (!this.subjectDescListVm.checkedItemsDict.containsKey(issueType.originalEntity.Id) && issueType.isChecked) {
                this.subjectDescListVm.setCheckedAllItems(true, issueType.originalEntity.Id, subjects);
                this.chapterListVm.getEntityById(issueType.chapterViewModel.originalEntity.Id).isChecked = true;
            } else if (!issueType.isChecked) {
                this.subjectDescListVm.setCheckedAllItems(false, issueType.originalEntity.Id);
            }
        }

        /**
       * Method called when the event selectedItemChanged is raised by issueTypeListVm
       **/
        private handlerSelectedIssueTypeChanged() {
            if (this.issueTypeListVm.selectedViewModel && (<IssueTypeViewModel>this.issueTypeListVm.selectedViewModel).originalEntity.Id) {
                let id: string = (<IssueTypeViewModel>this.issueTypeListVm.selectedViewModel).originalEntity.Id;
                this.subjectDescListVm.issueTypeId = id;
                this.subjectDescListVm.parentIsssueTypeVm = <ap.viewmodels.projects.IssueTypeViewModel>this.issueTypeListVm.selectedViewModel;
                this.subjectDescListVm.load(id).then((subject: ap.viewmodels.projects.IssueTypeNoteSubjectViewModel[]) => {
                    this._subjectLoaded = id;
                });
                this.subjectDescListVm.disableActions();
            }
        }

        /**
       * Method called when the event selectedItemChanged is raised by chapterListVm
       **/
        private handlerSelectedChapterChanged() {
            this.issueTypeListVm.parentChapter = <ap.viewmodels.projects.ChapterViewModel>this.chapterListVm.selectedViewModel;
            if (this.chapterListVm.selectedViewModel && (<ChapterViewModel>this.chapterListVm.selectedViewModel).originalEntity.Id) {
                let key: string = (<ChapterViewModel>this.chapterListVm.selectedViewModel).originalEntity.Id;
                this.issueTypeListVm.clear();
                this.issueTypeListVm.parentChapter = <ChapterViewModel>this.chapterListVm.selectedViewModel;
                this.issueTypeListVm.specifyIds(this._dicChapter.getValue(key));
                this.issueTypeListVm.loadNextPage();
                this.subjectDescListVm.clear();
                this.issueTypeListVm.disableActions();
                this.subjectDescListVm.disableActions();
            }
        }

        /**
         * A handler for the showdetailbusy event of the Api service
         * @param isLoadingActive an indicator of whether the loading process is active at the moment
         */
        private onDataLoadingChanged(isLoadingActive: boolean) {
            this._isDialogBusy = isLoadingActive;
        }

        constructor(private $utility: ap.utility.UtilityHelper, private $q: angular.IQService, private _api: ap.services.apiHelper.Api, private _controllersManager: ap.controllers.ControllersManager, private _servicesManager: ap.services.ServicesManager, private $mdDialog: angular.material.IDialogService, $timeout: angular.ITimeoutService, private _needSelectProject: boolean = true, private _loadIssuetypeWithSubjects: boolean = false) {
            this._dicChapter = new Dictionary<string, string[]>();

            this._api.on("showdetailbusy", this.onDataLoadingChanged, this);

            this._chapterListVm = new ap.viewmodels.projects.ChapterListViewModel(this.$utility, this.$q, this._controllersManager, this._servicesManager.projectService, true);
            this._issueTypeListVm = new ap.viewmodels.projects.IssueTypeListViewModel(this.$utility, this.$q, this._controllersManager, true);
            this._subjectDescListVm = new ap.viewmodels.projects.IssueTypeNoteSubjectListViewModel(this.$utility, this.$q, this._controllersManager);
            this._projectSelector = new ap.viewmodels.projects.ProjectSelectorViewModel(this.$utility, this.$q, this._controllersManager, $timeout, true);
            this.projectSelector.on("selectedItemChanged", this._projectSelectorSelectedItemChanged, this);
            this.chapterListVm.on("selectedItemChanged", this.handlerSelectedChapterChanged, this);
            this.issueTypeListVm.on("selectedItemChanged", this.handlerSelectedIssueTypeChanged, this);
            this.chapterListVm.on("itemchecked", this.checkedCategorie, this);
            this.issueTypeListVm.on("itemchecked", this.checkedCategorie, this);
            this.subjectDescListVm.on("itemchecked", this.checkedCategorie, this);

            if (this._loadIssuetypeWithSubjects) {
                this._servicesManager.noteService.getIssueTypeWithSubjects(this._controllersManager.mainController.currentProject().Id).then((chapters: ap.models.projects.Chapter[]) => {
                    this.loadIssueTypeWithSubjectsOnly(chapters);
                });
            }
            this._projectSelector.load();
        }

        private _subjectLoaded: string;
        private _dicChapter: IDictionary<string, string[]>;
        private _chapterListVm: ap.viewmodels.projects.ChapterListViewModel;
        private _issueTypeListVm: ap.viewmodels.projects.IssueTypeListViewModel;
        private _subjectDescListVm: ap.viewmodels.projects.IssueTypeNoteSubjectListViewModel;
        private _projectSelector: ap.viewmodels.projects.ProjectSelectorViewModel;
        private _keepOldSubject: boolean = false;
        private _isDialogBusy: boolean = false;
    }
}