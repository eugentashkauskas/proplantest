describe("Module ap-viewmodels - CountryListViewModel", () => {
    let Utility: ap.utility.UtilityHelper;
    let MainController: ap.controllers.MainController;
    let vm: ap.viewmodels.identificationfiles.country.CountryListViewModel;
    let $q: angular.IQService;
    let $rootScope: angular.IRootScopeService;
    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject(function (_Utility_, _MainController_, _$q_, _$rootScope_) {
        Utility = _Utility_;
        MainController = _MainController_;
        $q = _$q_;
        $rootScope = _$rootScope_;
    }));
    describe("Factory: CountryListViewModel", () => {
        let countries: ap.models.identFiles.Country[];
        let defCountry: angular.IDeferred<ap.models.identFiles.Country[]>;
        let country1: ap.models.identFiles.Country;
        let country2: ap.models.identFiles.Country;
        beforeEach(() => {
            defCountry = $q.defer();
            countries = [];
            country1 = new ap.models.identFiles.Country(Utility);
            country1.createByJson({
                Iso: "BEL",
                Name: "Belgium",
                Id: "123"
            });

            country2 = new ap.models.identFiles.Country(Utility);
            country2.createByJson({
                Iso: "GER",
                Name: "Germany",
                Id: "456"
            });
            countries.push(country1);
            countries.push(country2);

            defCountry.resolve(countries);

            vm = new ap.viewmodels.identificationfiles.country.CountryListViewModel(Utility, $q, MainController);
        });

        describe("Feature load method", () => {
            beforeEach(() => {
                spyOn(MainController, "getAvailableCountries").and.returnValue(defCountry.promise);
                spyOn(ap.viewmodels.identificationfiles.country.CountryViewModel.prototype, "init").and.callThrough();
                spyOn(vm, "onLoadItems").and.callThrough();
                spyOn(vm, "selectEntity").and.callThrough();
            });

            describe(" WHEN the load method is called with without the idToSelect ", () => {
                beforeEach(() => {
                    vm.load();
                    $rootScope.$apply();
                });
                it("THEN, the MainController.getAvailableCountries will be called", () => {
                    expect(MainController.getAvailableCountries).toHaveBeenCalled();
                });

                it("THEN, the CountryViewModel will be init", () => {
                    expect((<jasmine.Spy>ap.viewmodels.identificationfiles.country.CountryViewModel.prototype.init).calls.count()).toEqual(2);
                });

                it("THEN, the onLoadItems method will be call with the list vm", () => {
                    expect(vm.onLoadItems).toHaveBeenCalled();
                });

                it("THEN, the selectEntity method will be call with null", () => {
                    expect(vm.selectEntity).toHaveBeenCalledWith(null);
                });
            });
            describe(" WHEN 'load' method is called with the 'idToSelect' ", () => {
                beforeEach(() => {
                    vm.load(country2.Id);
                    $rootScope.$apply();
                });
                it("THEN, the MainController.getAvailableLanguages will be called", () => {
                    expect(MainController.getAvailableCountries).toHaveBeenCalled();
                });

                it("THEN, the LanguageViewModel will be init", () => {
                    expect((<jasmine.Spy>ap.viewmodels.identificationfiles.country.CountryViewModel.prototype.init).calls.count()).toEqual(2);
                });

                it("THEN, the onLoadItems method will be call with the list vm", () => {
                    expect(vm.onLoadItems).toHaveBeenCalled();
                });
                it("THEN, the selectEntity method will be call with the idToSelect", () => {
                    expect(vm.selectEntity).toHaveBeenCalledWith(country2.Id);
                });
            });
        });
    });
}); 