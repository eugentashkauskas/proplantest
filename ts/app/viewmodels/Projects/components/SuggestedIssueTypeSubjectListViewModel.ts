module ap.viewmodels.projects {
    export class SuggestedIssueTypeSubjectListViewModel extends ListEntityViewModel {

        /**
        * The issueTypeId which need to load the list of SuggestedIssueTypeSubject
        **/
        public get issueTypeId(): string {
            return this._issueTypeId;
        }

        public set issueTypeId(issuetypeid: string) {
            if (this._issueTypeId !== issuetypeid) {
                if (issuetypeid !== null) {
                    this._isSubjectsLoaded = false;
                    this._issueTypeId = issuetypeid;
                    this._controllersManager.projectController.getIssueTypeNoteSubject(issuetypeid, false, true).then((subjects: models.projects.IssueTypeNoteSubject[]) => {
                        this._issueTypeNoteSubject = subjects;
                        this._isSubjectsLoaded = true;
                        if (this.selectedSubjectVM) {
                            this._setDefaultDescription();
                        }
                    });
                }
            }
        }

        /**
        * The text used to filter the correct result base on the list of SuggestedIssueTypeSubject
        **/
        public get searchText(): string {
            return this._searchText;
        }

        public set searchText(text: string) {
            this._searchText = text;
        }

        /**
        * This is the selected item from the list make by the user
        * We don't used the ListEntityViewModel.selectedViewModel because this is need EntityViewModel
        **/
        public get selectedSubjectVM(): SuggestedIssueTypeSubjectViewModel {
            return this._selectedSubjectVM;
        }

        public set selectedSubjectVM(subject: SuggestedIssueTypeSubjectViewModel) {
            this._selectedSubjectVM = subject;
            if (subject && this._isSubjectsLoaded) {
                this._setDefaultDescription();
            }
        }

        /**
        * Use to set the defaultDescription
        **/
        private _setDefaultDescription() {
            let subject: ap.models.projects.IssueTypeNoteSubject[] = this._issueTypeNoteSubject.filter(subject => subject.Subject === this.selectedSubjectVM.subject);
            if (subject && subject[0])
                this.selectedSubjectVM.defaultDescription = subject[0].DefaultDescription;
        }

        /**
         * This method will do the searching of SuggestedIssueTypeSubject with the given searchtext
           and return the promise of list SuggestedIssueTypeSubjectViewModel
         * @param searchText The given text to search
        **/
        public searchSubjects(searchText: string): any {
            let self = this;
            let resultList: SuggestedIssueTypeSubjectViewModel[] = [];
            //  if (searchText === undefined) return resultList;
            let deferred = this.$q.defer();
            if (StringHelper.isNullOrEmpty(this._issueTypeId))
                return resultList;
            this._controllersManager.noteController.getSuggestedIssueTypeSubjects(this._issueTypeId).then((datas: ap.models.custom.SuggestedIssueTypeSubject[]) => {
                angular.forEach(datas, (item, key) => {
                    let itemVM: SuggestedIssueTypeSubjectViewModel = new SuggestedIssueTypeSubjectViewModel(item.Subject);
                    if ((StringHelper.isNullOrEmpty(searchText) || (itemVM.subject && itemVM.subject.toLowerCase().indexOf(searchText.toLowerCase()) >= 0)) && !StringHelper.isNullOrEmpty(item.Subject))
                        resultList.push(itemVM);
                });
                deferred.resolve(resultList);
            }, (error) => {
                deferred.reject(error);
            });
            return deferred.promise;
        }

        /**
        * This method will return the subject value make by the user
        * When the user select an item -> return item.Subject
        * When the user enter free text -> return _searchText
        **/
        public getSubject(): string {
            if (this._selectedSubjectVM && this._selectedSubjectVM !== null)
                return this._selectedSubjectVM.subject;
            return this._searchText;
        }

        constructor($utility: ap.utility.UtilityHelper, private $q: angular.IQService, private _controllersManager: ap.controllers.ControllersManager, defaultSearchText: string) {
            super($utility, "SuggestedIssueTypeSubject", "", "", "");
            this._searchText = defaultSearchText;
        }

        private _searchText: string;
        private _issueTypeId: string;
        private _selectedSubjectVM: SuggestedIssueTypeSubjectViewModel;
        private _issueTypeNoteSubject: ap.models.projects.IssueTypeNoteSubject[];
        private _isSubjectsLoaded: boolean = false;
    }
}