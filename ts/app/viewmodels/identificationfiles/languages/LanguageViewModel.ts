module ap.viewmodels.identificationfiles.languages {

    export class LanguageViewModel extends EntityViewModel {

        public get originalLanguage(): ap.models.identFiles.Language {
            return <ap.models.identFiles.Language>this.originalEntity;
        }

        public get name() {
            return this._name;
        }

        public get translatedName() {
            return this._translatedName;
        }

        copySource() {
            super.copySource();
            if (this.originalLanguage) {
                this._name = this.originalLanguage.Name;
                this._translatedName = this.originalLanguage.TranslatedName;
            } else {
                this._name = null;
                this._translatedName = null;
            }
        }

        constructor(utility: ap.utility.UtilityHelper, language?: ap.models.identFiles.Language) {
            super(utility);
            this.init(language);
        }

        private _name: string;
        private _translatedName: string;
    }
}
