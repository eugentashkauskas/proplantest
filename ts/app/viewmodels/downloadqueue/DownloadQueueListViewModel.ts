module ap.viewmodels.downloadqueue {
    export class DownloadQueueListViewModel extends ListEntityViewModel {

        /**
        * Return current list's number of notifications
        **/
        public get numberOfNotifications(): number {
            return this._numberOfNotifications;
        }

        /**
         * Initialize item from mass export configuration entity
         * @param massExport Mass export configuration entity
         */
        initQueueItem(massExport: ap.models.massExport.MassExportConfiguration): DownloadQueueItemViewModel {
            let newItem = new ap.viewmodels.downloadqueue.DownloadQueueItemViewModel(this.$utility, this._massExportController, this, this.count);
            newItem.init(massExport);
            newItem.on("deleterequested", this.itemDeleteRequestedHandler, this);
            super.insertItem(this.count, newItem);
            this._numberOfNotifications += 1;
            return newItem;
        }

        dispose() {
            super.dispose();
            this._numberOfNotifications = 0;
            this._massExportController.off("deletemassexportrequested", this.handlerDelete, this);
        }

        /**
         * Action handler for item's delete request
         * @param item An item to be deleted
         */
        private itemDeleteRequestedHandler(item: DownloadQueueItemViewModel) {
            let itemIndex = this.sourceItems.indexOf(item);
            if (itemIndex < 0)
                return;
            item.dispose();
            this.sourceItems.splice(itemIndex, 1);
            this._setCount(this.count - 1);
            this._numberOfNotifications -= 1;
        }

        /**
         * Delete download queue item by export config id
         * @param configId Export configuration config entity id param
         */
        private handlerDelete(configId: string) {
            let configItem = <DownloadQueueItemViewModel>this.getEntityById(configId);
            if (!configItem)
                return;
            this.itemDeleteRequestedHandler(configItem);
        }

        constructor($utility: ap.utility.UtilityHelper, private _massExportController: ap.controllers.MassExportController) {
            super($utility, "MassExportConfiguration", null, null, null);
            this.onLoadItems(null);
            this._massExportController.on("deletemassexportrequested", this.handlerDelete, this);
        }

        private _numberOfNotifications: number = 0;
    }
}