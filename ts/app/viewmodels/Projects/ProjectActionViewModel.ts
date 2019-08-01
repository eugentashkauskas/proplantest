module ap.viewmodels.projects {

    export class ProjectActionViewModel implements IDispose {
        /**
        * This property to access project
        **/
        public get project(): ap.models.projects.Project {
            return this._project;
        }

        /**
        * This property to access actions
        **/
        public get actions(): ap.viewmodels.home.ActionViewModel[] {
            return this._actions;
        }

        /**
        * This methode update the project
        **/
        public updateProject(p: ap.models.projects.Project) {
            if (p.Id !== this._project.Id) throw new Error("The project is not the same, cannot update it");
            this._project = p;
            this.computeActionsVisibility();
        }

        /**
        * Use to know if the action info should be displayed
        **/
        public get withInfo(): boolean {
            return this._withInfo;
        }

        /**
        * Use to set withInfo which determines if the action should be displayed
        **/
        public set withInfo(withInfo: boolean) {
            if (withInfo !== this._withInfo) {
                this._withInfo = withInfo;
                this.computeActionInfoVisibility();
            }
        }

        /**
        * Handle click on actions
        * @param actionName name of defined action
        **/
        public actionClick(actionName: string) {
            switch (actionName) {
                case "project.info":
                    this._projectController.showProjectInfo(this._project);
                    break;
                case "project.configure":
                    this._mainController.currentProject(this._project, ap.controllers.MainFlow.ProjectConfig);
                    break;
                case "project.archive":
                    this._projectController.archiveProject(this._project);
                    break;
                case "project.unarchive":
                    this._projectController.unarchiveProject(this._project);
                    break;
                case "project.delete":
                    this._projectController.deleteProject(this._project);
                    break;
            }
        }

        /**
        * Use to update the project
        * @param p -> the project updated
        **/
        private projectUpdated(p: ap.models.projects.Project) {
            if (p.Id === this._project.Id) {
                this.computeActionsVisibility();
            }
        }

        /**
        * Build available actions for project
        **/
        private computeActionsVisibility() {
            if (this._project.Deleted) {
                this._projectConfigure.isVisible = false;
                this._projectConfigure.isEnabled = false;

                this._projectArchive.isVisible = false;
                this._projectArchive.isEnabled = false;

                this._projectUnarchive.isVisible = false;
                this._projectUnarchive.isEnabled = false;

                this._projectDelete.isVisible = false;
                this._projectDelete.isEnabled = false;
            } else {
                this._projectConfigure.isVisible = true;
                this._projectConfigure.isEnabled = this._project.UserAccessRight.CanEdit;

                this._projectArchive.isVisible = this._project.IsActive;
                this._projectArchive.isEnabled = this._projectArchive.isVisible === true && this._project.UserAccessRight.CanEdit === true;

                this._projectUnarchive.isVisible = !this._project.IsActive;
                this._projectUnarchive.isEnabled = this._projectUnarchive.isVisible === true && this._project.UserAccessRight.CanEdit === true;

                let currentUser = <ap.models.actors.User>this.Utility.UserContext.CurrentUser();
                this._projectDelete.isVisible = true;
                if (this._project.Creator) {
                    this._projectDelete.isEnabled = this._project.UserAccessRight.CanEdit && this._project.Creator.Id === currentUser.Id && this._project.IsActive;
                } else {
                    this._projectDelete.isEnabled = this._project.UserAccessRight.CanEdit && this._project.IsActive;
                }
            }
            this.computeActionInfoVisibility();
        }

        /**
        * Build available info action for project
        **/
        private computeActionInfoVisibility() {
            if (this._project.Deleted || !this.withInfo) {
                this._projectInfo.isVisible = false;
                this._projectInfo.isEnabled = false;
            } else {
                this._projectInfo.isVisible = true;
                this._projectInfo.isEnabled = true;
            }
        }

        public dispose() {
            this._projectController.off("projectarchived", this.projectUpdated, this);
            this._projectController.off("projectunarchived", this.projectUpdated, this);
            this._projectController.off("projectdeleted", this.projectUpdated, this);
        }

        constructor(private Utility: ap.utility.UtilityHelper, private _mainController: ap.controllers.MainController, private _projectController: ap.controllers.ProjectController,
            _project: ap.models.projects.Project, private _withInfo: boolean = true) {

            this._project = _project;

            this._projectController.on("projectarchived", this.projectUpdated, this);
            this._projectController.on("projectunarchived", this.projectUpdated, this);
            this._projectController.on("projectdeleted", this.projectUpdated, this);

            this._projectInfo = new ap.viewmodels.home.ActionViewModel(Utility, Utility.EventTool, "project.info", Utility.rootUrl + "Images/html/icons/ic_info_black_48px.svg", false, null, "Info", false);
            this._projectConfigure = new ap.viewmodels.home.ActionViewModel(Utility, Utility.EventTool, "project.configure", Utility.rootUrl + "Images/html/icons/ic_settings_black_48px.svg", false, null, "Settings", false);
            this._projectArchive = new ap.viewmodels.home.ActionViewModel(Utility, Utility.EventTool, "project.archive", Utility.rootUrl + "Images/html/icons/ic_archive_black_48px.svg", false, null, "Deactivate project", false);
            this._projectUnarchive = new ap.viewmodels.home.ActionViewModel(Utility, Utility.EventTool, "project.unarchive", Utility.rootUrl + "Images/html/icons/ic_unarchive_black_48px.svg", false, null, "Reactivate project", false);
            this._projectDelete = new ap.viewmodels.home.ActionViewModel(Utility, Utility.EventTool, "project.delete", Utility.rootUrl + "Images/html/icons/ic_delete_black_48px.svg", false, null, "Delete project", false);

            this._actions = [];

            this._actions.push(this._projectInfo);
            this._actions.push(this._projectConfigure);
            this._actions.push(this._projectArchive);
            this._actions.push(this._projectUnarchive);
            this._actions.push(this._projectDelete);

            this.computeActionsVisibility();
        }

        private _projectInfo: ap.viewmodels.home.ActionViewModel;
        private _projectConfigure: ap.viewmodels.home.ActionViewModel;
        private _projectArchive: ap.viewmodels.home.ActionViewModel;
        private _projectUnarchive: ap.viewmodels.home.ActionViewModel;
        private _projectDelete: ap.viewmodels.home.ActionViewModel;
        private _actions: ap.viewmodels.home.ActionViewModel[];
        private _project: ap.models.projects.Project;
    }
}
