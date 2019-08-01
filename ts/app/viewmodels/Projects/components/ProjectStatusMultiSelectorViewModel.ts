module ap.viewmodels.projects {

    export class ProjectStatusMultiSelectorViewModel extends MultiSelectorListViewModel {

        getEntityText(entity: ap.models.Entity): string {
            let status = <ap.models.projects.NoteProjectStatus>entity;
            return status.Name;
        }

        constructor(utility: ap.utility.UtilityHelper, $q: angular.IQService, controllersManager: ap.controllers.ControllersManager) {
            super(utility, controllersManager.listController, $q, new GenericPagedListOptions("NoteProjectStatus", noteProjectStatus.NoteProjectStatusViewModel, "Id,Name,IsDisabled", null, 50, false, true), Filter.eq("Project.Id", controllersManager.mainController.currentProject().Id));
            this._propsSearchedText = ["Name"];
        }
    }
}