module ap.viewmodels.documents {
    export class DocumentVersionViewModel extends EntityViewModel {
        /**
         * Accessor for an underlying version model 
         */
        get version(): ap.models.documents.Version {
            return <ap.models.documents.Version>this.originalEntity;
        }

        /**
         * Accessor for an underlying document
         */
        get document(): ap.models.documents.Document {
            return <ap.models.documents.Document>this.parentEntity;
        }

        /**
         * Accessor for available actions
         */
        get actions(): ap.viewmodels.home.ActionViewModel[] {
            return this._actions;
        }

        /**
         * Event handler for actions available for the view model
         */
        actionClick(actionName: string) {
            if (actionName === "documentversion.download") {
                this.$controllersManager.documentController.downloadDocument(this.document, this.version);
            }
            else if (actionName === "documentversion.open") {
                this.$controllersManager.documentController.openDocument(this.document.Id, this.version.Id);
            }
        }

        constructor($utility: utility.UtilityHelper, protected $controllersManager: ap.controllers.ControllersManager) {
            super($utility);

            let downloadAction = new ap.viewmodels.home.ActionViewModel($utility, $utility.EventTool, "documentversion.download", $utility.rootUrl + "Images/html/icons/ic_get_app_black_24px.svg", true, null, "Download", true);
            let openAction = new ap.viewmodels.home.ActionViewModel($utility, $utility.EventTool, "documentversion.open", $utility.rootUrl + "Images/html/icons/ic_preview_black_48px.svg", true, null, "Open", true);

            this._actions = [downloadAction, openAction];
        }

        private _actions: ap.viewmodels.home.ActionViewModel[];
    }
}