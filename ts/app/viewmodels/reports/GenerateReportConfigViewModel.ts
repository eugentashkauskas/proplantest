module ap.viewmodels.reports {
    export class GenerateReportConfigViewModel {
        public get reportconfigViewModel(): ReportConfigViewModel {
            return this._reportConfigViewModel;
        }
        public get project(): ap.models.projects.Project {
            return this._project;
        }
        public set project(project: ap.models.projects.Project) {
            this._project = project;
        }
        public get listSelectedPointIds(): string[] {
            return this._listSelectedPointIds;
        }
        public set listSelectedPointIds(listSelectedPointIds: string[]) {
            this._listSelectedPointIds = listSelectedPointIds;
        }
        constructor(utility: ap.utility.UtilityHelper, reportconfigViewModel: ReportConfigViewModel) {
            this._reportConfigViewModel = reportconfigViewModel;
        }
        private _reportConfigViewModel: ReportConfigViewModel = null;
        private _project: ap.models.projects.Project = null;
        private _listSelectedPointIds: string[] = null;
    }
}