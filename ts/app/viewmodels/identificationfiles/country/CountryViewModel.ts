module ap.viewmodels.identificationfiles.country {

    export class CountryViewModel extends EntityViewModel {

        public get originalCountry(): ap.models.identFiles.Country {
            return <ap.models.identFiles.Country>this.originalEntity;
        }

        public get name() {
            return this._name;
        }

        copySource() {
            super.copySource();
            if (this.originalEntity) {
                let translate = this.utility.Translator.getTranslation("app.country." + this.originalCountry.Iso);
                this._name = translate || this.originalCountry.Name;  // remove square brackets if translation was not found
            } else {
                this._name = null;
            }
         }

        constructor(private utility: ap.utility.UtilityHelper, country?: ap.models.identFiles.Country) {
            super(utility);
            this.init(country);
        }

        private _name: string;
    }
}