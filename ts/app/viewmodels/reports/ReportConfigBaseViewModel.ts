module ap.viewmodels.reports {
    export class ReportConfigBaseViewModel extends EntityViewModel {
        public get name(): string {
            return this._name;
        }
        public set name(name: string) {
           this._name = name;
        }

        public get code(): string {
            return this._code;
        }
        public set code(code: string) {
            this._code = code;
        }
        public get reportconfig(): ap.models.reports.ReportConfigBase {
            return <ap.models.reports.ReportConfigBase>this.originalEntity;
        }

        /**
        * This method is used to init defaults values for the sendReportViewModel
        * @param sendReportViewModel is the vm for sending the report
        * @param usercommentids is the list comment ids to print the report
        * @param isAllPoints to known init the send report when print all points
        **/
        initSendReportViewModel(sendReportViewModel: SendReportViewModel, usercommentids: string[], isAllPoints: boolean) {
        }

        constructor(utility: ap.utility.UtilityHelper) {
            super(utility);
        }
        copySource(): void {
            super.copySource();
            this._name = this.reportconfig.Name;
            this._code = this.reportconfig.Code;
        }
        postChanges(): void {
            this.reportconfig.Code = this._code;
            this.reportconfig.Name = this._name;
        }
        private _name: string = null;
        private _code: string = null;
    }
}