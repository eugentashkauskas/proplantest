describe("Module ap-viewmodels - LanguageViewModel", () => {
    let Utility: ap.utility.UtilityHelper;
    let vm: ap.viewmodels.identificationfiles.languages.LanguageViewModel;
    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject(function (_Utility_) {

        Utility = _Utility_;
    }));

    describe("Feature constructor", () => {
        describe("WHEN LanguageViewModel is created with language is null", () => {
            beforeEach(() => {
                vm = new ap.viewmodels.identificationfiles.languages.LanguageViewModel(Utility);
            });
            it("THEN, the originalLanguage is null", () => {
                expect(vm.originalLanguage).toBeUndefined();
            });
            it("THEN, the Name is not defined", () => {
                expect(vm.name).toBeNull();
            });
            it("THEN, the TranslatedName is not defined", () => {
                expect(vm.translatedName).toBeNull();
            });
        });

        describe("WHEN LanguageViewModel is created with language is specical", () => {
            let language: ap.models.identFiles.Language;
            beforeEach(() => {
                language = new ap.models.identFiles.Language(Utility);
                language.createByJson({
                    Code: "en",
                    Name: "English",
                    TranslationCode: "EN",
                    TranslatedName: "Language_English"
                });
                vm = new ap.viewmodels.identificationfiles.languages.LanguageViewModel(Utility, language);
            });
            it("THEN, Name = English", () => {
                expect(vm.name).toEqual("English");
            });
            it("THEN, TranslatedName = Language_English", () => {
                expect(vm.translatedName).toEqual("Language_English");
            });
        });
    });
});
