module ap.viewmodels.reports {
    export class ReportConfigItemViewModel extends EntityViewModel {
        /**
        * the name of the vm to display on the view
        **/
        public get name(): string {
            return this._name;
        }
        public get reportconfig(): ap.models.reports.ReportConfigBase {
            return <ap.models.reports.ReportConfigBase>this.originalEntity;
        }
        copySource(): void {
            super.copySource();
            if (this.reportconfig && this.reportconfig !== null) {
                if ((this.reportconfig.EntityDiscriminator === "ProjectReportTemplate" || this.reportconfig.EntityDiscriminator === "MeetingReportTemplate")
                    && this.reportconfig.IsSystem
                ) {
                    if (this.reportconfig.EntityDiscriminator === "ProjectReportTemplate")
                        this._name = this.$utility.Translator.getTranslation("app.project_report_template." + this.reportconfig.Code);
                    else
                        this._name = this.$utility.Translator.getTranslation("app.meeting_report_template." + this.reportconfig.Code);
                }
                else
                    this._name = this.reportconfig.Name;
            }
        }
        constructor(utility: ap.utility.UtilityHelper) {
            super(utility);
        }
        private _name: string = null;
    }
}