module ap.viewmodels.downloadqueue {

    export class DownloadQueueItemViewModel extends EntityViewModel {

        /**
        * Return original mass export config entity
        **/
        public get massExportConfig(): ap.models.massExport.MassExportConfiguration {
            return <ap.models.massExport.MassExportConfiguration>this._originalEntity;
        }

        /**
        * Return current item's ID value
        **/
        public get id() {
            return this._id;
        }

        /**
        * Return current item's zip name
        **/
        public get zipName() {
            return this._zipName;
        }

        /**
        * Set current item's zip name
        **/
        public set zipName(zipName: string) {
            this._zipName = zipName;
        }

        /**
        * Return current queue item's documents count
        **/
        public get docNumber() {
            return this._docNumber;
        }

        /**
        * Set current queue item's documents counts
        **/
        public set docNumber(docNumber: number) {
            this._docNumber = docNumber;
        }

        /**
        * Return item's 'generated' property value
        **/
        public get isGenerated() {
            return this._isGenerated;
        }

        /**
        * Set item's 'generated' property value
        **/
        public set isGenerated(isGenerated: boolean) {
            this._isGenerated = isGenerated;
        }

        /**
        * Get item's available date
        **/
        public get availableDate() {
            return this._availableDate;
        }

        /**
        * Set item's available date
        **/
        public set availableDate(availableDate: Date) {
            this._availableDate = availableDate;
        }

        dispose() {
            super.dispose();
            this._listener.clear();
        }

        copySource() {
            if (this.massExportConfig) {
                this._id = this.massExportConfig.Id;
                this._zipName = this.massExportConfig.FileName;
                this._availableDate = this.massExportConfig.EntityCreationDate ? this.massExportConfig.EntityCreationDate.addDays(5) : null;
                this._isGenerated = this.massExportConfig.Status === models.massExport.MassExportConfigurationStatus.Completed;
                // other properties should be calculated at runtime
            }
        }

        /**
         * Call this method to request delete process
         */
        public delete() {
            let massExport = new ap.models.massExport.MassExportConfiguration(this.$utility);
            massExport.createByJson({
                Id: this.massExportConfig.Id,
                EntityCreationDate: this.massExportConfig.EntityCreationDate,
                EntityCreationUser: this.massExportConfig.EntityCreationUser,
                EntityVersion: this.massExportConfig.EntityVersion,
                Deleted: this.massExportConfig.Deleted
            });
            massExport.ModifiedProperties.push("Status");
            massExport.Status = ap.models.massExport.MassExportConfigurationStatus.CanDelete;
            this._massExportController.deleteMassExportConfiguration(massExport).then((updatedMassExport: models.massExport.MassExportConfiguration) => {
                this._listener.raise("deleterequested", this);
            });
        }

        /**
         * Call this method to request document download
         */
        public download() {
            this._massExportController.downloadMassExportConfiguration(this.massExportConfig); // Download documents archive
            this._listener.raise("deleterequested", this); // Remove download item from list
        }

        constructor($utility: ap.utility.UtilityHelper, private _massExportController: ap.controllers.MassExportController,
            parentListVm?: DownloadQueueListViewModel, index?: number) {
            super($utility, parentListVm, index);
            this._listener.addEventsName(["deleterequested"]);
            this._zipName = null;
            this._isGenerated = false;
            this._docNumber = 0;
            this._availableDate = null;
        }

        private _id: string;
        private _zipName: string;
        private _isGenerated: boolean;
        private _docNumber: number;
        private _availableDate: Date;
    }
}