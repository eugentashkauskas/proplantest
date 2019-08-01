module ap.viewmodels.meetings {

    export class MeetingMultiSelectorViewModel extends MultiSelectorListViewModel {

        getEntityText(entity: ap.models.Entity): string {
            let meeting = <ap.models.meetings.Meeting>entity;
            return meeting.Title;
        }

        constructor(utility: ap.utility.UtilityHelper, $q: angular.IQService, controllersManager: ap.controllers.ControllersManager) {
            super(utility, controllersManager.listController, $q, new GenericPagedListOptions("Meeting", MeetingItemViewModel, "Id,Title", null, 50, false, true), Filter.eq("Project.Id", controllersManager.mainController.currentProject().Id));
            this._propsSearchedText = ["Title"];
        }
    }

}