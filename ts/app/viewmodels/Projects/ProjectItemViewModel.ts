module ap.viewmodels.projects {

    /**
     * This class is the parameter needed to create an item ProjectItemViewModel
     **/
    export class ProjectItemParameter extends ItemConstructorParameter {
        public get ProjectController(): ap.controllers.ProjectController {
            return this._projectController;
        }

        public get MainController(): ap.controllers.MainController {
            return this._mainController;
        }

        constructor(itemIndex: number, dataSource: any, pageDesc: PageDescription, parameters: LoadPageSuccessHandlerParameter, utility: ap.utility.UtilityHelper, private _projectController: ap.controllers.ProjectController, private _mainController: ap.controllers.MainController) {
            super(itemIndex, dataSource, pageDesc, parameters, utility);
        }
    }

    export class ProjectItemViewModel extends ap.viewmodels.EntityViewModel implements IProjectItem {
        public name: string;
        public code: string;
        public creator: string;
        public displayName: string;
        public logoPath: string;
        public startDate: Date;
        public creationDate: Date;
        public notesCount: number;
        public documentsCount: number;
        public participantsCount: number;

        public get originalProject(): ap.models.projects.Project {
            return <ap.models.projects.Project>this.originalEntity;
        }

        /**
         * To know if the project has a cover
         */
        hasNotThumb(): boolean {
            return StringHelper.isNullOrEmpty(this.logoPath);
        }

        copySource(): void {
            super.copySource();
            if (this.originalProject !== null) {
                this.name = this.originalProject.Name;
                this.code = this.originalProject.Code;
                this.notesCount = this.originalProject.NotesNumber;
                this.documentsCount = this.originalProject.DocumentsNumber;
                this.participantsCount = this.originalProject.ParticipantsNumber;
                if (this.originalProject.Creator)
                    this.creator = this.originalProject.Creator.DisplayName;
                else
                    this.creator = "";
                this.displayName = this.originalProject.Name;
                if (this.originalProject.StartDate) {
                    this.startDate = this.originalProject.StartDate;
                } else {
                    this.startDate = this.originalProject.EntityCreationDate;
                }
                this.creationDate = this.originalProject.EntityCreationDate;
                if (this.originalProject.Code !== null && this.originalProject.Code !== "" && this.originalProject.Code !== undefined)
                    this.displayName = "(" + this.originalProject.Code + ") " + this.originalProject.Name;
                this.logoPath = this.originalProject.getLogoPath();

                this.buildActions();
            }
        }

        /**
        * This is the vm to manage the actions of the project
        **/
        public get projectActionViewModel(): ProjectActionViewModel {
            return this._projectActionViewModel;
        }

        /**
        * Build available actions for a single project
        **/
        private buildActions() {
            if (this._projectActionViewModel && this._projectActionViewModel.project) {
                if (this._projectActionViewModel.project.Id !== this.originalProject.Id) {
                    this._projectActionViewModel.dispose();

                    if (this.parameters) {
                        this._projectActionViewModel = new ProjectActionViewModel(this.utility, this.parameters.MainController, this.parameters.ProjectController, this.originalProject);
                    }
                } else {
                    this._projectActionViewModel.updateProject(this.originalProject);
                }
            } else if (this.parameters && this.parameters instanceof ap.viewmodels.projects.ProjectItemParameter) {
                this._projectActionViewModel = new ProjectActionViewModel(this.utility, this.parameters.MainController, this.parameters.ProjectController, this.originalProject);
            }
        }

        public dispose() {
            super.dispose();
            if (this._projectActionViewModel) {
                this._projectActionViewModel.dispose();
            }
        }

        constructor(private utility: ap.utility.UtilityHelper, private q: angular.IQService, private parentListVm?: ap.viewmodels.BaseListEntityViewModel, private parameters?: ProjectItemParameter) {
            super(utility, parentListVm, parameters ? parameters.itemIndex : null);
        }

        private _projectActionViewModel: ProjectActionViewModel;
    }
}