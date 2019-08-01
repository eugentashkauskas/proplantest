module ap.viewmodels.projects {
    export class ProjectIssueTypeConfigDialogViewModel extends ProjectIssueTypeConfigViewModel {

        /**
        * This is a getter for notify its users what item was selected
        */
        public get selectedIssueType(): IssueTypeViewModel {
            return this._selectedIssueType;
        }

        /**
         * Determines whether it is possible to save changes
         */
        public get canSave(): boolean {
            return this._saveAction.isEnabled;
        }

        /**
         * This method call $mdDialog hide method
         */
        public save() {
            let toSave: ap.models.custom.ProjectPunchlists = new ap.models.custom.ProjectPunchlists(this.$utility);
            let tmp: ap.models.custom.ProjectPunchlists = new ap.models.custom.ProjectPunchlists(this.$utility);

            // Collect changes
            tmp = this.chapterListVm.postChange();
            toSave.ChaptersToUpdate = tmp.ChaptersToUpdate;

            tmp = this.issueTypeListVm.postChange();
            toSave.IssueTypesToUpdate = tmp.IssueTypesToUpdate;

            tmp = this.subjectDescListVm.postChange();
            toSave.NoteSubjectsToUpdate = tmp.NoteSubjectsToUpdate;

            if (toSave.ChaptersToUpdate.length > 0 || toSave.IssueTypesToUpdate.length > 0 || toSave.NoteSubjectsToUpdate.length > 0) {
                this.$controllersManager.mainController.showBusy();
                for (let i = 0; i < toSave.ChaptersToUpdate.length; i++) {
                    this.chapterListVm.getEntityById(toSave.ChaptersToUpdate[i].Id).postChanges();
                }
                for (let i = 0; i < toSave.IssueTypesToUpdate.length; i++) {
                    this.issueTypeListVm.getEntityById(toSave.IssueTypesToUpdate[i].Id).postChanges();
                }
                for (let i = 0; i < toSave.NoteSubjectsToUpdate.length; i++) {
                    this.subjectDescListVm.getEntityById(toSave.NoteSubjectsToUpdate[i].Id).postChanges();
                }
                this.$controllersManager.projectController.updateProjectPunchList(toSave).then((result: ap.models.custom.ProjectPunchlists) => {
                    this.$controllersManager.mainController.hideBusy();
                    this.$mdDialog.hide();
                });
            }
        }

        /**
         * This method call $mdDialog cancel method
         */
        public cancel() {
            this.$mdDialog.cancel();
        }

        /**
         * This method needs for change chapter is removable property
         * @param chapter
         */
        private chapterAdded(chapter: ap.viewmodels.projects.ChapterViewModel) {
            chapter.isRemovable = false;
        }

        /**
         * This method needs for change issue type is removable property
         * @param issueType
         */
        private issueTypeAdded(issueType: ap.viewmodels.projects.IssueTypeViewModel) {
            issueType.isRemovable = false;
        }

        /**
         * This method needs for change subject is removable property
         * @param subject
         */
        private subjectAdded(subject: ap.viewmodels.projects.IssueTypeNoteSubjectViewModel) {
            subject.isRemovable = false;
        }

        /**
         * This method used to handle event "selectedItemChanged" from issueTypeListVm
         * @param item
         */
        private selectedIssueTypeChangedHandler(item: ap.viewmodels.projects.IssueTypeViewModel) {
            this._selectedIssueType = item;
        }

        public dispose() {
            super.dispose();
        }

        constructor($scope: angular.IScope, $utility: ap.utility.UtilityHelper, $q: angular.IQService, api: ap.services.apiHelper.Api, $controllersManager: ap.controllers.ControllersManager, $servicesManager: ap.services.ServicesManager, $mdDialog: angular.material.IDialogService, $timeout: angular.ITimeoutService) {
            super($scope, $utility, $q, api, $controllersManager, $servicesManager, $mdDialog, $timeout);
            super.loadIdsData();

            this.editIssueTypeConfig();

            this.issueTypeListVm.on("selectedItemChanged", this.selectedIssueTypeChangedHandler, this);
            this.chapterListVm.on("itemcreated", this.chapterAdded, this);
            this.issueTypeListVm.on("itemcreated", this.issueTypeAdded, this);
            this.subjectDescListVm.on("itemcreated", this.subjectAdded, this);
        }

        private _selectedIssueType: IssueTypeViewModel;
    }
}