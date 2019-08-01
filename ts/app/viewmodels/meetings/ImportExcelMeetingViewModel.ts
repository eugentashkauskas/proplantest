module ap.viewmodels.meetings {
    export class ImportExcelMeetingViewModel extends ap.viewmodels.projects.ImportExcelViewModel {

        dispose() {
            super.dispose();
            this.$utility.Translator.off("languagechanged", this.updateDialogTitle, this);
        }

        /**
        * Creates a list of meetings based on the given excel data
        */
        protected createImportedData(excelData: string[][]): angular.IPromise<ap.models.Entity[]> {
            let deferred = this.$q.defer<ap.models.Entity[]>();
            let meetings: ap.models.meetings.Meeting[] = [];
            if (excelData) {
                for (let i = 0, len = excelData.length; i < len; i++) {
                    let rowData = excelData[i];

                    let title = this.getRowData(rowData, 0);
                    let code = this.getRowData(rowData, 1);
                    let numberingType = parseInt(this.getRowData(rowData, 2)) - 1;
                    let floor = rowData[3];
                    let building = rowData[4];
                    let header = rowData[5];
                    let footer = rowData[6];
                    let meeting = this.controllersManager.meetingController.createNewMeeting();
                    meeting.Title = title;
                    meeting.Code = code;
                    meeting.NumberingType = numberingType;
                    meeting.Floor = floor;
                    meeting.Building = building;
                    meeting.Header = header;
                    meeting.Footer = footer;
                    meetings.push(meeting);
                }
            }
            if (meetings.length > 0) {
                deferred.resolve(meetings);
            } else {
                deferred.reject("NoChaptersFound");
            }
            return deferred.promise;
        }

        /**
         * Retrieves data by index from the given excel row
         * @param data a row data retrieved from excel
         * @param index an index of cell to retrieve data from
         */
        private getRowData(data: string[], index: number): string {
            if (data.length > index && !StringHelper.isNullOrWhiteSpace(data[index])) {
                return data[index];
            }
            return "";
        }

        /**
         * Update dialog title translation
         */
        private updateDialogTitle() {
            this.title = this.$utility.Translator.getTranslation("app.entity.meetings");
        }

        constructor(protected $utility: ap.utility.UtilityHelper, protected $q: angular.IQService, protected $mdDialog: angular.material.IDialogService, protected controllersManager: ap.controllers.ControllersManager, title?: string) {
            super($q, $mdDialog, controllersManager, ap.viewmodels.projects.ImportType.Meeting, "Import lists from an Excel file", "app.importexcel.meeting.desc", "Images/Import/import_meeting.png", $utility.Translator.getTranslation("app.entity.meetings"));
            this.$utility.Translator.on("languagechanged", this.updateDialogTitle, this);
        }
    }
}