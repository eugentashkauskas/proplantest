module ap.viewmodels.projects {

    export class IssueTypeMultiSelectorViewModel extends HierarchyMultiSelectorViewModel {

        /**
         * This method use for set initial selcted issueTypes 
         * @param checkedValueText - Array descriptions of selected issueTypes
         */
        public setInitCheckedValueText(checkedValueText: string[]) {
            this._checkedValuesText = checkedValueText.join(", ");
        }
        constructor(utility: ap.utility.UtilityHelper, api: ap.services.apiHelper.Api, $q: angular.IQService, controllersManager: ap.controllers.ControllersManager) {
            super(utility, api, $q, controllersManager, "ChapterHierarchy");
            this.addCustomParam("baseentityname", "IssueType");
            this._propsSearchedText = ["Code", "Description", "ParentChapter.Code", "ParentChapter.Description"];
        }
    }
}