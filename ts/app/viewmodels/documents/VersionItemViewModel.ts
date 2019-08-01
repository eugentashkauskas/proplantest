module ap.viewmodels.documents {

    /**
    * ViewModel representing a Version
    */
    export class VersionItemViewModel extends ap.viewmodels.EntityViewModel {

        /**
        * Public getter to the entity of the ViewModel
        */
        public get originalVersion(): ap.models.documents.DocumentBase {
            return <ap.models.documents.DocumentBase>this.originalEntity;
        }

        /**
        * Public getter to the date of the Version
        */
        public get date(): Date {
            return this._date;
        }

        /**
        * Public getter to the versionIndex of the Version
        */
        public get versionIndex(): number {
            return this._versionIndex;
        }

        /**
        * Public getter to returns the formated date of the date
        */
        public get dateFormated(): string {
            if (this.date) {
                return this.date.format();
            } else {
                return "";
            }
        }

        copySource(): void {
            super.copySource();
            if (this.originalVersion && this.originalVersion !== null) {
                this._date = this.originalVersion.Date;

                if (this.originalVersion instanceof ap.models.documents.Version) {
                    this._versionIndex = (<ap.models.documents.Version>this.originalVersion).VersionIndex;
                } else if (this.originalVersion instanceof ap.models.documents.Document) {
                    this._versionIndex = (<ap.models.documents.Document>this.originalVersion).VersionCount;
                }
            }
        }

        /**
         * To free resource used by the item
         **/
        public dispose() {
            super.dispose();
        }

        constructor(utility: ap.utility.UtilityHelper) {
            super(utility);
        }

        private _date: Date;
        private _versionIndex: number;
    }
}