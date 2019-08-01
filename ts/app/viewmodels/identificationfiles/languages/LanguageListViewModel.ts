module ap.viewmodels.identificationfiles.languages {
    export class LanguageListViewModel extends ListEntityViewModel {

        /**
        * This method will be load the list of the Language and select the item defined on the param
        * @param idToSelect? is the item need to select by default
        */
        public load(idToSelect?: string) {
            let self = this;
            this.getLanguages().then(() => {
                if (idToSelect && !StringHelper.isNullOrEmpty(idToSelect))
                    self.selectEntity(idToSelect);
                else if (self.sourceItems && self.sourceItems !== null && self.sourceItems.length > 0)
                    self.selectEntity(self.sourceItems[0].originalEntity.Id);
            });
        }

        /**
        * This method is used to get the list of Languages and fill to the sourceItems
        **/
        private getLanguages(): angular.IPromise<boolean> {
            let self = this;
            let def: angular.IDeferred<boolean> = this.$q.defer();
            this._mainController.getAvailableLanguages().then((result: ap.models.identFiles.Language[]) => {
                let listVm: ap.viewmodels.identificationfiles.languages.LanguageViewModel[] = [];
                if (result) {
                    for (let i = 0; i < result.length; i++) {
                        let languageVM: LanguageViewModel = new LanguageViewModel(this.$utility, result[i]);
                        listVm.push(languageVM);
                    }
                }
                self.onLoadItems(listVm, false);
                def.resolve(true);
            });
            return def.promise;
        }

        /**
        * This method is used to select the language by the code
        * @param code is the code (or fullcode) of the language need to select
        **/
        public selectByCode(languageCode: string) {
            let self = this;
            if (this.isLoaded) {
                self.selectLanguageByCodeLocal(languageCode);
            }
            else {
                this.getLanguages().then(() => {
                    self.selectLanguageByCodeLocal(languageCode);
                });
            }
        }

        /**
        * This method is used to select the language by the code when the list have been loaded
        * @param code is the code (or fullcode) of the language need to select
        **/
        private selectLanguageByCodeLocal(languageCode: string) {
            if (this.isLoaded && this.sourceItems && this.sourceItems !== null) {
                for (let i = 0; i < this.sourceItems.length; i++) {
                    let languageVm = this.sourceItems[i] as LanguageViewModel;
                    let fullCode = languageVm.originalLanguage.getFullCode();
                    if (languageVm && languageVm !== null && languageVm.originalLanguage !== null
                        && (languageVm.originalLanguage.Code === languageCode || fullCode === languageCode)
                    ) {
                        this.selectEntity(languageVm.originalLanguage.Id);
                        return;
                    }
                }
            }
        }

        constructor(utility: ap.utility.UtilityHelper, private $q: angular.IQService, private _mainController: ap.controllers.MainController) {
            super(utility, "Language", null, null, null);
        }
    }
}