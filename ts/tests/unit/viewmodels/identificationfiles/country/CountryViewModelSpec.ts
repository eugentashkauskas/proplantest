describe("Module ap-viewmodels - CountryViewModel", () => {
    let Utility: ap.utility.UtilityHelper;
    let vm: ap.viewmodels.identificationfiles.country.CountryViewModel;
    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject(function (_Utility_) {
        Utility = _Utility_;
        spyOn(Utility.Translator, "getTranslation").and.returnValue("Belgique");
    }));

    describe("Feature constructor", () => {
        describe("WHEN CountryViewModel is created with country is null", () => {
            beforeEach(() => {
                vm = new ap.viewmodels.identificationfiles.country.CountryViewModel(Utility);
            });
            it("THEN, the originalCountry is null", () => {
                expect(vm.originalCountry).toBeUndefined();
            });
            it("THEN, the name is not defined", () => {
                expect(vm.name).toBeNull();
            });
        });

        describe("WHEN CountryViewModel is created with country is specical", () => {
            let country: ap.models.identFiles.Country;
            beforeEach(() => {
                country = new ap.models.identFiles.Country(Utility);
                country.createByJson({
                    Name: "Belgium",
                    Iso: "BEL",
                });
                vm = new ap.viewmodels.identificationfiles.country.CountryViewModel(Utility, country);
            });
            it("THEN, Name = Belgium", () => {
                expect(vm.name).toEqual("Belgique");
            });
        });
    });
});
 