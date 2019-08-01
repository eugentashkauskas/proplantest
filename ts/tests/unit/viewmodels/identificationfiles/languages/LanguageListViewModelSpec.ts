describe("Module ap-viewmodels - LanguageListViewModel", () => {
    let Utility: ap.utility.UtilityHelper;
    let MainController: ap.controllers.MainController;
    let vm: ap.viewmodels.identificationfiles.languages.LanguageListViewModel;
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
    describe("Factory: LanguageListViewModel", () => {
        let languages: ap.models.identFiles.Language[];
        let defLanguage: angular.IDeferred<ap.models.identFiles.Language[]>;
        beforeEach(() => {
            defLanguage = $q.defer();
            languages = [];
            let language1: ap.models.identFiles.Language = new ap.models.identFiles.Language(Utility);
            language1.createByJson({
                Id: "L1",
                Code: "en",
                Name: "English",
                TranslationCode: "EN",
                TranslatedName: "Language_English"
            });

            let language2: ap.models.identFiles.Language = new ap.models.identFiles.Language(Utility);
            language2.createByJson({
                Id: "L2",
                Code: "fr",
                Name: "French",
                TranslationCode: "FR",
                TranslatedName: "Language_French"
            });
            languages.push(language1);
            languages.push(language2);

            defLanguage.resolve(languages);

            vm = new ap.viewmodels.identificationfiles.languages.LanguageListViewModel(Utility, $q, MainController);
        });

        describe("Feature load method", () => {
            beforeEach(() => {
                spyOn(MainController, "getAvailableLanguages").and.returnValue(defLanguage.promise);
                spyOn(ap.viewmodels.identificationfiles.languages.LanguageViewModel.prototype, "init").and.callThrough();
                spyOn(vm, "onLoadItems").and.callThrough();
                spyOn(vm, "selectEntity").and.callThrough();
            });

            describe(" WHEN the load method is called with without the idToSelect ", () => {
                beforeEach(() => {
                    vm.load();
                    $rootScope.$apply();
                });
                it("THEN, the MainController.getAvailableLanguages will be called", () => {
                    expect(MainController.getAvailableLanguages).toHaveBeenCalled();
                });

                it("THEN, the LanguageViewModel will be init", () => {
                    expect((<jasmine.Spy>ap.viewmodels.identificationfiles.languages.LanguageViewModel.prototype.init).calls.count()).toEqual(2);
                });

                it("THEN, the onLoadItems method will be call with the list vm", () => {
                    expect(vm.onLoadItems).toHaveBeenCalled();
                });

                it("THEN, the selectEntity method will be call with the first id", () => {
                    expect(vm.selectEntity).toHaveBeenCalledWith("L1");
                });
            });
            describe(" WHEN 'load' method is called with the 'idToSelect' ", () => {
                beforeEach(() => {
                    vm.load("L2");
                    $rootScope.$apply();
                });
                it("THEN, the MainController.getAvailableLanguages will be called", () => {
                    expect(MainController.getAvailableLanguages).toHaveBeenCalled();
                });

                it("THEN, the LanguageViewModel will be init", () => {
                    expect((<jasmine.Spy>ap.viewmodels.identificationfiles.languages.LanguageViewModel.prototype.init).calls.count()).toEqual(2);
                });

                it("THEN, the onLoadItems method will be call with the list vm", () => {
                    expect(vm.onLoadItems).toHaveBeenCalled();
                });
                it("THEN, the selectEntity method will be call with the idToSelect", () => {
                    expect(vm.selectEntity).toHaveBeenCalledWith("L2");
                });
            });
        });

        describe("Feature selectByCode", () => {
            beforeEach(() => {
                spyOn(MainController, "getAvailableLanguages").and.returnValue(defLanguage.promise);
                spyOn(vm, "onLoadItems").and.callThrough();
                spyOn(vm, "selectEntity").and.callThrough();
            });

            describe("WHEN selectByCode method is called and the list is not loaded", () => {
                beforeEach(() => {
                    vm.selectByCode("en");
                    $rootScope.$apply();
                });

                it("THEN, the mainController.getAvailableLanguages is called", () => {
                    expect(MainController.getAvailableLanguages).toHaveBeenCalled();
                });
                it("AND, the onLoadItems method is called", () => {
                    expect(vm.onLoadItems).toHaveBeenCalled();
                });
                it("AND, the selectEntity will called with correct id of the language code", () => {
                    expect(vm.selectEntity).toHaveBeenCalledWith("L1");
                });
            });
            describe("WHEN selectByCode method is called and the list is loaded", () => {
                beforeEach(() => {
                    vm.load();
                    $rootScope.$apply();
                });
                it("THEN, the mainController.getAvailableLanguages is not called", () => {
                    vm.selectByCode("en");
                    $rootScope.$apply();
                    expect((<jasmine.Spy>MainController.getAvailableLanguages).calls.count()).toEqual(1);
                });
                it("AND, the onLoadItems method is not called", () => {
                    vm.selectByCode("en");
                    $rootScope.$apply();
                    expect((<jasmine.Spy>vm.onLoadItems).calls.count()).toEqual(1);
                });

                it("AND, the selectEntity will called with correct id of the language code", () => {
                    vm.selectByCode("en");
                    $rootScope.$apply();
                    expect(vm.selectEntity).toHaveBeenCalledWith("L1");
                });
            });

            describe("WHEN selectByCode method is called with the code or fullcode of the language", () => {
                beforeEach(() => {
                    vm.load();
                    $rootScope.$apply();
                });
                it("THEN, the selectEntity will called with correct id of the language code", () => {
                    vm.selectByCode("en");
                    $rootScope.$apply();
                    expect(vm.selectEntity).toHaveBeenCalledWith("L1");
                });
                it("THEN, the selectEntity will called with correct id of the full code", () => {
                    vm.selectByCode("fr_FR");
                    $rootScope.$apply();
                    expect(vm.selectEntity).toHaveBeenCalledWith("L2");
                });
            });

        });
    });
    
});