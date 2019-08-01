module ap.viewmodels.identificationfiles.country {
    export class CountryListViewModel extends ListEntityViewModel {

        /**
        * This method will be load the list of the Country and select the item defined on the param
        * @param idToSelect? is the item need to select by default
        */
        public load(idToSelect?: string): angular.IPromise<boolean> {
            let def: angular.IDeferred<boolean> = this.$q.defer();
            this.getCountries().then(() => {
                if (idToSelect && !StringHelper.isNullOrEmpty(idToSelect))
                    this.selectEntity(idToSelect);
                else
                    this.selectEntity(null);
                def.resolve(true);
            });
            return def.promise;
        }

        /**
        * This method is used to get the list of Countries and fill to the sourceItems
        **/
        private getCountries(): angular.IPromise<boolean> {
            let def: angular.IDeferred<boolean> = this.$q.defer();
            this._mainController.getAvailableCountries().then((result: ap.models.identFiles.Country[]) => {
                let listVm: ap.viewmodels.identificationfiles.country.CountryViewModel[] = [];
                if (result) {
                    for (let i = 0; i < result.length; i++) {
                        let countryVM: CountryViewModel = new CountryViewModel(this.$utility, result[i]);
                        listVm.push(countryVM);
                    }
                }
                this.onLoadItems(listVm, false);
                def.resolve(true);
            });
            return def.promise;
        }

        constructor(utility: ap.utility.UtilityHelper, private $q: angular.IQService, private _mainController: ap.controllers.MainController) {
            super(utility, "Country", null, null, null);
        }
    }
}