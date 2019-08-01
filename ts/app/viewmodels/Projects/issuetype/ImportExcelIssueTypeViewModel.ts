module ap.viewmodels.projects {
    export class ImportExcelIssueTypeViewModel extends ImportExcelViewModel {

        dispose() {
            super.dispose();
            this.$utility.Translator.off("languagechanged", this.updateDialogTitle, this);
        }
        /**
         * Creates a list of chapters based on the given excel data
         */
        protected createImportedData(excelData: string[][]): angular.IPromise<ap.models.Entity[]> {
            let deferred = this.$q.defer<ap.models.Entity[]>();
            let projectId = this.controllersManager.mainController.currentProject().Id;
            let chapters: ap.models.projects.Chapter[] = [];

            if (excelData) {
                for (let i = 0, len = excelData.length; i < len; i++) {
                    let rowData = excelData[i];

                    if (rowData.length < 4 || StringHelper.isNullOrWhiteSpace(rowData[0])) {
                        continue;
                    }

                    let chapterCode = rowData[0];
                    let chapterName = this.getRowData(rowData, 1);
                    let issueTypeCode = this.getRowData(rowData, 2);
                    let issueTypeName = this.getRowData(rowData, 3);
                    let subjectTitle = this.getRowData(rowData, 4);
                    let subjectDescription = this.getRowData(rowData, 5);

                    // Determine whether it is needed to create a new chapter
                    let chapter: ap.models.projects.Chapter = this.getEntityByCode(chapters, chapterCode);
                    if (chapter === null) {
                        chapter = new ap.models.projects.Chapter(this.$utility, chapterCode, chapterName, projectId);
                        chapters.push(chapter);
                    }

                    if (!issueTypeCode) {
                        continue;
                    }

                    // Determine whether it is needed to create a new issue type                    
                    let issueType: ap.models.projects.IssueType = this.getEntityByCode(chapter.IssueTypes, issueTypeCode);
                    if (issueType === null) {
                        issueType = new ap.models.projects.IssueType(this.$utility, issueTypeCode, issueTypeName);
                        issueType.ParentChapter = chapter;
                        chapter.IssueTypes.push(issueType);
                    }

                    if (!subjectTitle) {
                        continue;
                    }

                    // Create a new note subject
                    let noteSubject: ap.models.projects.IssueTypeNoteSubject = new ap.models.projects.IssueTypeNoteSubject(this.$utility, subjectTitle, subjectDescription);
                    noteSubject.IssueType = issueType;
                    issueType.NoteSubjects.push(noteSubject);
                }
            }

            if (chapters.length > 0) {
                deferred.resolve(chapters);
            } else {
                deferred.reject("NoChaptersFound");
            }

            return deferred.promise;
        }

        /**
         * Retrieves data by index from the given excel row
         * @param data a row data retrieved from excel
         * @param index an index of cell to retrieve data from
         */
        private getRowData(data: string[], index: number): string {
            if (data.length > index && !StringHelper.isNullOrWhiteSpace(data[index])) {
                return data[index];
            }
            return "";
        }

        /**
         * Searches an entity by code in the given array. This method returnd the first found entity with
         * matching Code property or null if no entity is found.
         * @param entities an array of entities to search into
         * @param code a code to search for
         */
        private getEntityByCode<T extends { Code: string }>(entities: T[], code: string): T {
            if (!entities || !code) {
                return null;
            }

            let codeLowerCased = code.toLowerCase();
            for (let i = 0, len = entities.length; i < len; i++) {
                if (entities[i].Code.toLowerCase() === codeLowerCased) {
                    return entities[i];
                }
            }
            return null;
        }

        /**
         * Update dialog title translation
         */
        private updateDialogTitle() {
            this.title = this.$utility.Translator.getTranslation("app.entity.parentcell");
        }

        constructor($q: angular.IQService, $mdDialog: angular.material.IDialogService, controllersManager: ap.controllers.ControllersManager, protected $utility: ap.utility.UtilityHelper, isReopenedDialog: boolean = false) {
            super($q, $mdDialog, controllersManager, ImportType.IssueType, "Import categories from an Excel file", "app.importexcel.issuetype.desc", $utility.rootUrl + "Images/Import/import_punchlist.png", $utility.Translator.getTranslation("app.entity.parentcell"), true, isReopenedDialog);
            this.$utility.Translator.on("languagechanged", this.updateDialogTitle, this);
        }
    }
}
