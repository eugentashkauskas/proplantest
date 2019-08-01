module ap.viewmodels.projects {

    export class RoomMultiSelectorViewModel extends HierarchyMultiSelectorViewModel {

        constructor(utility: ap.utility.UtilityHelper, api: ap.services.apiHelper.Api, $q: angular.IQService, controllersManager: ap.controllers.ControllersManager) {
            super(utility, api, $q, controllersManager, "CellHierarchy");
            this.addCustomParam("baseentityname", "SubCell");
            this._propsSearchedText = ["Code", "Description", "ParentCell.Code", "ParentCell.Description"];
        }
    }
}