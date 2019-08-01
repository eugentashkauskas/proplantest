module ap.viewmodels.projects {
    export enum ImportStatusResponse {
        Import,
        Cancel
    }

    export class ImportNoteProjectStatusViewModel implements IDispose {
        /**
        * Method use to get noteProjectStatusListVm
        **/
        public get noteProjectStatusListVm(): ap.viewmodels.projects.noteProjectStatus.NoteProjectStatuslistViewModel {
            return this._noteProjectStatusListVm;
        }

        /**
        * Property to get all the projects the user is invited in
        **/
        public get projectSelector(): ap.viewmodels.projects.ProjectSelectorViewModel {
            return this._projectSelector;
        }

        /**
        * Method use to close the pop up
        **/
        public cancel() {
            this.dispose();
            this.$mdDialog.cancel(ImportStatusResponse.Cancel);
        }

        /**
        * Method use to disable or enable the import button
        **/
        public get statusLoaded(): boolean {
            return this._statusLoaded;
        }

        /**
        * This method raises the event 'importstatusfromproject' with all the statuses (as parameter) of the selected project
        * @return status[]: the list of status checked
        **/
        public import() {
            this._listener.raise("importstatusfromproject", this.noteProjectStatusListVm.sourceItems);
            this.$mdDialog.hide(ImportStatusResponse.Import);
        }

        /**
        * Method use to load the data
        **/
        public loadData(): void {
            let statusList: noteProjectStatus.NoteProjectStatusViewModel[];
            this._controllersManager.projectController.loadConfiguredNoteProjectStatusList(this.projectSelector.selectedProjectId, false).then((status: ap.models.projects.NoteProjectStatus[]) => {
                this._statusLoaded = true;
                statusList = this._noteProjectStatusListVm.createStatusListViewModel(status, null);
                this._noteProjectStatusListVm.onLoadItems(statusList);
            });
        }

        /**
       * Dispose method
       */
        public dispose() {
            this._projectSelector.off("selectedItemChanged", this._projectSelectorSelectedItemChanged, this);
            this._noteProjectStatusListVm.dispose();
        }

        /**
        * This method is used to keep the last selected project make by the user
        * @param selectedProjectVm is the selected project
        **/
        private _projectSelectorSelectedItemChanged(selectedProjectVm: ap.viewmodels.projects.ProjectSelectorViewModel) {
            if (selectedProjectVm && selectedProjectVm !== null) {
                this._statusLoaded = false;
                this._statusChecked.clear();
                this.loadData();
            }
        }

        on(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.on(eventName, callback, caller);
        }
        off(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.off(eventName, callback, caller);
        }

        constructor(private $utility: ap.utility.UtilityHelper, private $q: angular.IQService, private _controllersManager: ap.controllers.ControllersManager, private _api: ap.services.apiHelper.Api, private $mdDialog: angular.material.IDialogService, private meetingAccessRight: ap.models.accessRights.MeetingAccessRight, $timeout: ng.ITimeoutService) {
            this._statusLoaded = false;
            this._statusChecked = new Dictionary<string, noteProjectStatus.NoteProjectStatusViewModel>();
            this._noteProjectStatusListVm = new ap.viewmodels.projects.noteProjectStatus.NoteProjectStatuslistViewModel(this.$utility, this._controllersManager, this.$q, false, this.meetingAccessRight, false);
            this._projectSelector = new ap.viewmodels.projects.ProjectSelectorViewModel($utility, $q, _controllersManager, $timeout, true);
            this._projectSelector.on("selectedItemChanged", this._projectSelectorSelectedItemChanged, this);
            this._listener = this.$utility.EventTool.implementsListener(["importstatusfromproject"]);
            this.projectSelector.load();
        }

        private _statusLoaded: boolean;
        private _listener: ap.utility.IListenerBuilder;
        private _noteProjectStatusListVm: ap.viewmodels.projects.noteProjectStatus.NoteProjectStatuslistViewModel;
        private _statusChecked: IDictionary<string, noteProjectStatus.NoteProjectStatusViewModel>;
        private _projectSelector: ap.viewmodels.projects.ProjectSelectorViewModel;
    }
}