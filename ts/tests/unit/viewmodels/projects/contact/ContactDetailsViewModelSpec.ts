'use strict';
describe("Module ap-viewmodels - ContactDetailsViewModel", () => {
    let nmp = ap.viewmodels.projects;
    let MainController: ap.controllers.MainController;
    let Utility: ap.utility.UtilityHelper;
    let Api: ap.services.apiHelper.Api;
    let UserContext: ap.utility.UserContext;
    let UIStateController: ap.controllers.UIStateController;
    let $controller: angular.IControllerService;
    let $rootScope: angular.IRootScopeService;
    let $scope: angular.IScope;
    let _deferred: angular.IDeferred<any>;
    let $q: angular.IQService;
    let $timeout: angular.ITimeoutService;
    let $compile: angular.ICompileService;
    let ProjectController: ap.controllers.ProjectController;
    let NoteController: ap.controllers.NoteController;
    let vm: ap.viewmodels.projects.ContactDetailsViewModel;
    let controllersManager: ap.controllers.ControllersManager;
    let $mdDialog: angular.material.IDialogService;
    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");        
    });
    beforeEach(inject(function (_$rootScope_, _$q_, _$timeout_, _$compile_, _UserContext_, _Utility_, _Api_, _MainController_, _UIStateController_, _$controller_, _ProjectController_, _NoteController_, _ControllersManager_) {
        MainController = _MainController_;
        ProjectController = _ProjectController_;
        UIStateController = _UIStateController_;
        Utility = _Utility_;
        UserContext = _UserContext_;
        NoteController = _NoteController_;
        Api = _Api_;
        vm = null;
        $q = _$q_;
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $timeout = _$timeout_;
        _deferred = $q.defer();
        $controller = _$controller_;
        controllersManager = _ControllersManager_;
        $scope = $rootScope.$new();
        specHelper.utility.stubRootUrl(Utility);
        specHelper.userContext.stub(Utility);
        Utility.Storage.Session.clear();
        specHelper.utility.stubStorageSet(Utility);
        $mdDialog = specHelper.utility.stubShowMdDialog($q);
    }));
    describe("Feature ContactDetailsViewModel", () => {
     
        describe("WHEN a ContactDetailsViewModel is created withouut a ContactDetails", () => {
            it("THEN, the ViewModel is correctly created with the default values", () => {
                let contactDetailsViewModel = new ap.viewmodels.projects.ContactDetailsViewModel(Utility, Api, $q, controllersManager, $mdDialog);
                expect(contactDetailsViewModel).toBeDefined();
                expect(contactDetailsViewModel.displayName).toBeNull();
                expect(contactDetailsViewModel.city).toBeNull();
                expect(contactDetailsViewModel.company).toBeNull();
                expect(contactDetailsViewModel.country).toBeNull();
                expect(contactDetailsViewModel.email).toBeNull();
                expect(contactDetailsViewModel.partyEmail).toBeNull();
                expect(contactDetailsViewModel.phone).toBeNull();
                expect(contactDetailsViewModel.role).toBeNull();
                expect(contactDetailsViewModel.street).toBeNull();
                expect(contactDetailsViewModel.vat).toBeNull();
                expect(contactDetailsViewModel.zip).toBeNull();
                expect(contactDetailsViewModel.accessRightLevel).toEqual(ap.models.accessRights.AccessRightLevel.Guest);
            });
        });
        describe("WHEN a NoteProjectStatusViewModel is created with a ContactDetails", () => {
            it("THEN, the ViewModel is correctly created with the values from the ContactDetails", () => {

                var contactdetailsjson: any =
                    {
                        City: 'Plaza Roma',
                        Company: 'Gaumon Co',
                        DisplayName: "Doe John",
                        Role: "ARCHI",
                        Phone: "0444/85.63.14",
                        Street: "Avenue bella 14",
                        Zip: "1030",
                        Vat: "0155465244",
                        AccessRightLevel: 4,
                        Project: {
                            Code: 'PRJ4'
                        },
                        User: modelSpecHelper.createUserJson("Doe", "John", "23e4AAEd8-9114-4fae-a755-9559f8901310", false),
                        Country: {
                            Iso: "ITA"
                        }
                    };
                modelSpecHelper.fillEntityJson(contactdetailsjson);
                modelSpecHelper.fillEntityJson(contactdetailsjson.Country);
                modelSpecHelper.fillEntityJson(contactdetailsjson.Project);
                modelSpecHelper.fillEntityJson(contactdetailsjson.User);

                let contactDetails: ap.models.projects.ContactDetails = new ap.models.projects.ContactDetails(Utility);
                contactDetails.createByJson(contactdetailsjson);

                let contactDetailsViewModel = new ap.viewmodels.projects.ContactDetailsViewModel(Utility, Api, $q, controllersManager, $mdDialog);
                contactDetailsViewModel.init(contactDetails);

                expect(contactDetailsViewModel.displayName).toEqual(contactDetails.DisplayName);
                expect(contactDetailsViewModel.city).toEqual(contactDetails.City);
                expect(contactDetailsViewModel.company).toEqual(contactDetails.Company);
                expect(contactDetailsViewModel.country.Iso).toEqual(contactDetails.Country.Iso);
                expect(contactDetailsViewModel.email).toEqual(contactDetails.User.Alias);
                expect(contactDetailsViewModel.partyEmail).toEqual(contactDetails.User.Person.Email);
                expect(contactDetailsViewModel.phone).toEqual(contactDetails.Phone);
                expect(contactDetailsViewModel.role).toEqual(contactDetails.Role);
                expect(contactDetailsViewModel.street).toEqual(contactDetails.Street);
                expect(contactDetailsViewModel.vat).toEqual(contactDetails.Vat);
                expect(contactDetailsViewModel.zip).toEqual(contactDetails.Zip);
                expect(contactDetailsViewModel.accessRightLevel).toEqual(contactDetails.AccessRightLevel);
              
            });
        });        
    });

    describe("Feature: postChanges", () => {
        let contactDetailsVm: ap.viewmodels.projects.ContactDetailsViewModel;
        let apiIdsDefer: angular.IDeferred<ap.services.apiHelper.ApiResponse>;
        let apiEntitiesDefer: angular.IDeferred<ap.services.apiHelper.ApiResponse>;
        
        beforeEach(() => {
            contactDetailsVm = new ap.viewmodels.projects.ContactDetailsViewModel(Utility, Api, $q, controllersManager, $mdDialog);
            let entity = new ap.models.projects.ContactDetails(Utility);
            entity.createByJson({
                Id: "test-id",
                User: {
                    Alias: "test-user-alias",
                    LanguageCode: "en",
                    Person: {
                        Email: "test-email"
                    }
                },
                Company: "test-company",
                Role: "test-role",
                DisplayName: "test-display-name",
                Street: "test-street",
                City: "test-city",
                Vat: "test-vat",
                Zip: "test-zip",
                Phone: "test-phone",
                LinkesIssueTypes: [{
                    Id: "test-linked-issue-type",
                    ContactId: "test-id",
                    IssueTypeId: "test-linked-type-id"
                }]
            });
            apiIdsDefer = $q.defer();
            apiEntitiesDefer = $q.defer();
            spyOn(Api, "getEntityIds").and.returnValue(apiIdsDefer.promise);
            spyOn(Api, "getEntityList").and.returnValue(apiEntitiesDefer.promise);            
            contactDetailsVm.init(entity);
            apiIdsDefer.resolve(new ap.services.apiHelper.ApiResponse([]));
            apiEntitiesDefer.resolve(new ap.services.apiHelper.ApiResponse([]));
            $rootScope.$apply();
        });

        describe("WHEN we save updated viewmodel's values to the entity fields", () => {
            let serviceDefer: angular.IDeferred<ap.models.projects.ContactIssueType>;
            let selectedCountry: ap.models.identFiles.Country;
            let selectedLanguage: ap.models.identFiles.Language;

            let selectedCategories: Array<ap.viewmodels.projects.ChapterHierarchyItemViewModel>;
            beforeEach(() => {
                serviceDefer = $q.defer();
                selectedCountry = new ap.models.identFiles.Country(Utility);
                selectedCountry.createByJson({ Id: "test-country-id", Name: "test-country-name" });
                selectedLanguage = new ap.models.identFiles.Language(Utility);
                selectedLanguage.createByJson({ Id: "test-lang-code", Code: "fr" });
                let selectedCountryViewModel = new ap.viewmodels.identificationfiles.country.CountryViewModel(Utility, selectedCountry);
                let selectedLanguageViewModel = new ap.viewmodels.identificationfiles.languages.LanguageViewModel(Utility, selectedLanguage);

                let selectedCategory1 = new ap.models.projects.ChapterHierarchy(Utility);
                selectedCategory1.createByJson({
                    EntityName: "Chapter",
                    Id: "test-category-10",
                    EntityId: "test-category-1"
                });
                let selectedCategory2 = new ap.models.projects.ChapterHierarchy(Utility);
                selectedCategory2.createByJson({
                    EntityName: "IssueType",
                    Id: "test-category-21",
                    EntityId: "test-category-2"
                })
                let selectedCategory1Vm = new ap.viewmodels.projects.ChapterHierarchyItemViewModel(Utility, $q);
                selectedCategory1Vm.init(selectedCategory1);
                let selectedCategory2Vm = new ap.viewmodels.projects.ChapterHierarchyItemViewModel(Utility, $q);
                selectedCategory2Vm.init(selectedCategory2);
                selectedCategories = [selectedCategory1Vm, selectedCategory2Vm];
                contactDetailsVm.countrySelector.sourceItems = [selectedCountryViewModel];
                contactDetailsVm.countrySelector.selectedViewModel = selectedCountryViewModel;
                contactDetailsVm.languageSelector.sourceItems = [selectedLanguageViewModel];
                contactDetailsVm.languageSelector.selectedViewModel = selectedLanguageViewModel;
                spyOn(controllersManager.contactController, "updateContactDetails").and.returnValue(serviceDefer.promise);                
                spyOn(contactDetailsVm.issueTypesSelector, "getCheckedItems").and.returnValue(selectedCategories);
                contactDetailsVm.email = "new-test-email";
                contactDetailsVm.displayName = "new-test-display-name";
                contactDetailsVm.partyEmail = "new-test-party-email";
                contactDetailsVm.company = "new-test-company";
                contactDetailsVm.role = "new-test-role";
                contactDetailsVm.street = "new-test-street";
                contactDetailsVm.city = "new-test-city";
                contactDetailsVm.vat = "new-test-vat";
                contactDetailsVm.zip = "new-test-zip";
                contactDetailsVm.phone = "new-test-phone";
                contactDetailsVm.postChanges();
            });
            it("THEN, all changes are copied to the viewmodels' original entity", () => {
                expect(contactDetailsVm.contactDetails.DisplayName).toEqual("new-test-display-name");
                expect(contactDetailsVm.contactDetails.User.Alias).toEqual("new-test-email");
                expect(contactDetailsVm.contactDetails.User.LanguageCode).toEqual("fr");
                expect(contactDetailsVm.contactDetails.User.Person.Email).toEqual("new-test-party-email");
                expect(contactDetailsVm.contactDetails.Company).toEqual("new-test-company");
                expect(contactDetailsVm.contactDetails.Role).toEqual("new-test-role");
                expect(contactDetailsVm.contactDetails.Street).toEqual("new-test-street");
                expect(contactDetailsVm.contactDetails.City).toEqual("new-test-city");
                expect(contactDetailsVm.contactDetails.Vat).toEqual("new-test-vat");
                expect(contactDetailsVm.contactDetails.Zip).toEqual("new-test-zip");
                expect(contactDetailsVm.contactDetails.Phone).toEqual("new-test-phone");
                expect(contactDetailsVm.contactDetails.LinkedIssueTypes.length).toEqual(1);
                expect(contactDetailsVm.contactDetails.LinkedIssueTypes[0].ContactId).toEqual("test-id");
                expect(contactDetailsVm.contactDetails.LinkedIssueTypes[0].IssueTypeId).toEqual("test-category-2");
            });
        });
    });

    describe("Feature: save", () => {
        let contactDetailsVm: ap.viewmodels.projects.ContactDetailsViewModel;
        let apiIdsDefer: angular.IDeferred<ap.services.apiHelper.ApiResponse>;
        let apiEntitiesDefer: angular.IDeferred<ap.services.apiHelper.ApiResponse>;
        let serviceApiDefer: angular.IDeferred<ap.models.projects.ContactDetails>;

        beforeEach(() => {
            serviceApiDefer = $q.defer();
            contactDetailsVm = new ap.viewmodels.projects.ContactDetailsViewModel(Utility, Api, $q, controllersManager, $mdDialog);
            spyOn(contactDetailsVm, "postChanges");
            spyOn(controllersManager.contactController, "updateContactDetails").and.returnValue(serviceApiDefer.promise);
            let entity = new ap.models.projects.ContactDetails(Utility);
            entity.createByJson({
                Id: "test-id",                
                Company: "test-company",
                Role: "test-role",
                DisplayName: "test-display-name",
                Street: "test-street",
                City: "test-city",
                Vat: "test-vat",
                Zip: "test-zip",
                Phone: "test-phone",
                IsInvited: false
            });
            apiIdsDefer = $q.defer();
            apiEntitiesDefer = $q.defer();
            spyOn(Api, "getEntityIds").and.returnValue(apiIdsDefer.promise);
            spyOn(Api, "getEntityList").and.returnValue(apiEntitiesDefer.promise);
            contactDetailsVm.init(entity);
            apiIdsDefer.resolve(new ap.services.apiHelper.ApiResponse([]));
            apiEntitiesDefer.resolve(new ap.services.apiHelper.ApiResponse([]));
            $rootScope.$apply();

        });
        describe("WHEN we call save contact changes with invitation parameter", () => {
            beforeEach(() => {
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake(() => {
                    return true;
                })
                contactDetailsVm.save(true);
                
            });
            it("THEN, changes are copied to the original entity", () => {
                expect(contactDetailsVm.postChanges).toHaveBeenCalled();
            });
            it("THEN, an invitation dialog box is shown", () => {
                expect($mdDialog.show).toHaveBeenCalled();
            });
        });
        describe("WHEN we save contact changes without invitation parameter and user does have an access right to invite participants without notification", () => {
            beforeEach(() => {
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake(() => {
                    return false;
                });
                contactDetailsVm.save(true);
                
            });
            it("THEN, changes are copied to the original entity", () => {
                expect(contactDetailsVm.postChanges).toHaveBeenCalled();
            });
            it("THEN, an invitation dialog box is shown", () => {
                expect($mdDialog.show).toHaveBeenCalled();
            });
        });
        describe("WHEN we save contact changes without invitation parameter and user does not have an access right to invite participants without notification", () => {
            beforeEach(() => {
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake(() => {
                    return true;
                });
                contactDetailsVm.save();
                serviceApiDefer.resolve(<ap.models.projects.ContactDetails>contactDetailsVm.originalEntity);
                $rootScope.$apply();
            });
            it("THEN, service method is called", () => {
                expect(controllersManager.contactController.updateContactDetails).toHaveBeenCalledWith([contactDetailsVm.originalEntity]);
            });
            it("THEN, invitation popup is not shown", () => {
                expect($mdDialog.show).not.toHaveBeenCalled();
            })
        });
    });
});