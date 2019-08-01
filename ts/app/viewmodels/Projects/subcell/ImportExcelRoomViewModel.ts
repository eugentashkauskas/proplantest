module ap.viewmodels.projects {

    export class ImportExcelRoomViewModel extends ImportExcelViewModel {

        dispose() {
            super.dispose();
            this.utility.Translator.off("languagechanged", this.updateDialogTitle, this);
        }

        /**
         * This method checks whether the imported data is valid and creates a list of entites based on it.
         * It has to resolve its promise with the created list of entities if the excel data is valid. If
         * data is invalid, it has to reject the promise.
         * @param excelData data read from the file
         * @returns a promise which will be resolved when a list of entities is created or rejected if the
         * given data is invalid.
         */
        protected createImportedData(excelData: string[][]): angular.IPromise<ap.models.Entity[]> {
            let defer: ng.IDeferred<ap.models.Entity[]> = this.$q.defer();
            let parentCellList: ap.models.projects.ParentCell[] = [];
            let dic: IDictionary<string, ap.models.projects.ParentCell> = new Dictionary<string, ap.models.projects.ParentCell>();
            if (excelData) {
                let projectId = this.controllersManager.mainController.currentProject().Id;
                for (let i = 0; i < excelData.length; i++) {
                    let dataRow = excelData[i];
                    // if there is no data
                    if (dataRow.length > 0 &&
                        dataRow.length !== 1 && /* a item cannot be added without a description */
                        !StringHelper.isNullOrWhiteSpace(dataRow[0]) && !StringHelper.isNullOrWhiteSpace(dataRow[1]) /* a parentCell must have a code and a description */) {

                        let parentCell: ap.models.projects.ParentCell;
                        let parentCellCode = dataRow[0];
                        let parentCellDesc = this.getRowData(dataRow, 1);
                        let subCellCode = this.getRowData(dataRow, 2);
                        let subCellDesc = this.getRowData(dataRow, 3);
                        // if it already exists a parentCell with the same code and same description, we have to keep in mind his index
                        let keyCodeDesc = parentCellCode + parentCellDesc;
                        if (dic.containsKey(keyCodeDesc)) {
                            parentCell = dic.getValue(keyCodeDesc);
                        }
                        else {
                            parentCell = new ap.models.projects.ParentCell(this.utility, parentCellCode, parentCellDesc, projectId);
                            parentCell.SubCells = [];
                            parentCellList.push(parentCell);
                            dic.add(keyCodeDesc, parentCell);
                        }
                        // if the parent has subcells
                        if (dataRow.length > 3 /* an item cannot be added without a description */) {
                            let subCell = new ap.models.projects.SubCell(this.utility, subCellCode, subCellDesc);
                            subCell.ParentCell = parentCell;
                            // if the parent does not exist yet we create it and add it to parentCellList with his subCells
                            parentCell.SubCells.push(subCell);
                        }
                    }
                }
            }
            if (parentCellList.length === 0) {
                defer.reject();
            } else {
                this._importedData = parentCellList;
                defer.resolve(this.importedData);
            }
            return defer.promise;
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
            this.title = this.utility.Translator.getTranslation("app.entity.rooms");
        }

        constructor(private utility: ap.utility.UtilityHelper, protected $q: angular.IQService, protected $mdDialog: angular.material.IDialogService, protected controllersManager: ap.controllers.ControllersManager, isReopenedDialog: boolean = false) {
            super($q, $mdDialog, controllersManager, ap.viewmodels.projects.ImportType.Room, "Import rooms from an Excel file", "importexcel.room.desc", utility.rootUrl + "Images/Import/import_room.png", utility.Translator.getTranslation("app.entity.rooms"), true, isReopenedDialog);
            this.utility.Translator.on("languagechanged", this.updateDialogTitle, this);
        }
    }
}