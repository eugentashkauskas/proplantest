module ap.viewmodels.multiactions {
    export class NotAppliedDescriptionItemViewModel {

        /**
         * This is the code of the entity for which there was a problem while the multiedit
         **/
        public get code(): string {
            return (this._data !== undefined && this._data !== null) ? this._data.EntityCode : null;
        }

        /**
         * This is the subject of the entity for which there was a problem while the multiedit
         **/
        public get subject(): string {
            return (this._data !== undefined && this._data !== null) ? this._data.EntityTitle : null;
        }


        /**
         * This is the action translated requested by the user for which an entity was not updated
         **/
        public get action(): string {
            return this._actionTranslated;
        }

        /**
         * This is the translated reason of the problem occurs while editing the specified entity
         **/
        public get reason(): string {
            return this._reasonTranslated;
        }

        /**
         * This is the original data to create the view model
         **/
        public get data(): ap.models.multiactions.NotAppliedActionDescription {
            return this._data;
        }

        constructor(private $utility: ap.utility.UtilityHelper, data: ap.models.multiactions.NotAppliedActionDescription) {
            this._data = data;
            if (this._data) {
                this._actionTranslated = this.$utility.Translator.getTranslation("app.MultiAction." + ap.models.multiactions.MultiAction[this._data.Action]);
                this._reasonTranslated = this.$utility.Translator.getTranslation("app.NotAppliedReason." + ap.models.multiactions.NotAppliedReason[this._data.Reason]);
            }
        }

        private _data: ap.models.multiactions.NotAppliedActionDescription;
        private _actionTranslated: string;
        private _reasonTranslated: string;
    }
}