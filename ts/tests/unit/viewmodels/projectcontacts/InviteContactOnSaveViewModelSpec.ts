/*"use strict";
describe("Feature - InviteContactOnSaveViewModel", () => {
    let utility: ap.utility.UtilityHelper;
    let mainController: ap.controllers.MainController;
    let contactController: ap.controllers.ContactController;
    let $mdDialog: angular.material.IDialogService;
    let $q: angular.IQService;
    let $rootScope: angular.IRootScopeService;
    
    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject(function (_Utility_, _$q_, _$rootScope_, _MainController_, _ContactController_) {
        utility = _Utility_;
        mainController = _MainController_;
        contactController = _ContactController_;
        $q = _$q_;
        $rootScope = _$rootScope_;
        $mdDialog = specHelper.utility.stubShowMdDialog($q);
    }));

    function createViewModel(): ap.viewmodels.projectcontacts.InviteContactOnSaveViewModel {
        let languageSelector = new ap.viewmodels.identificationfiles.languages.LanguageListViewModel(utility, $q, mainController);
        let enLang = new ap.models.identFiles.Language(utility);
        enLang.createByJson({ Id: "en-id", Code: "en" });
        let frLang = new ap.models.identFiles.Language(utility);
        frLang.createByJson({ Id: "fr-id", Code: "fr" });
        let enLangVm = new ap.viewmodels.identificationfiles.languages.LanguageViewModel(utility, enLang);
        let frLangVm = new ap.viewmodels.identificationfiles.languages.LanguageViewModel(utility, frLang);
        languageSelector.sourceItems = [enLangVm, frLangVm];
        languageSelector.selectedViewModel = enLangVm;
        let contactDetails = new ap.models.projects.ContactDetails(utility);
        contactDetails.createByJson({ Id: "test-id", DisplayName: "test-display-name" });
        return new ap.viewmodels.projectcontacts.InviteContactOnSaveViewModel(utility, contactDetails, languageSelector, mainController, contactController);        
    }

    describe("Feature: constructor", () => {        
        describe("WHEN viewmodel is created", () => {
            let vm: ap.viewmodels.projectcontacts.InviteContactOnSaveViewModel;
            beforeEach(() => {
                vm = createViewModel();
            });
            it("THEN, entity's properties are initialized", () => {
                expect(vm.contact).toBeDefined();
                expect(vm.contact.DisplayName).toEqual("test-display-name");
                expect(vm.languageSelector).toBeDefined();
                expect(vm.selectedLanguage).toBeDefined();
                expect(vm.selectedLanguage.originalLanguage.Code).toEqual("en");
            });
        });
    });

    describe("Feature: invite participant", () => {
        let vm: ap.viewmodels.projectcontacts.InviteContactOnSaveViewModel;
        beforeEach(() => {
            vm = createViewModel();
        });
        describe("WHEN we invite participant", () => {
            let apiDefer: angular.IDeferred<ap.models.projects.ContactDetails[]>;
            let apiCallbackSpy: jasmine.Spy;
            beforeEach(() => {
                apiDefer = $q.defer();
                spyOn(contactController, "inviteProjectContacts").and.returnValue(apiDefer.promise);
                apiCallbackSpy = jasmine.createSpy("callbackSpy");
                vm.on("invitecontactclosed", apiCallbackSpy, this);
                vm.invite();
                apiDefer.resolve([]);
                $rootScope.$apply();
            });
            afterEach(() => {
                vm.off("invitecontactclosed", apiCallbackSpy, this);
            })
            it("THEN, call service's 'inviteProjectContacts' method with valid parameters", () => {
                expect(contactController.inviteProjectContacts).toHaveBeenCalledWith([vm.contact.Id], vm.selectedLanguage.originalLanguage);
            });
            it("THEN, 'invitecontactclosed' event is fired", () => {
                expect(apiCallbackSpy).toHaveBeenCalledWith(vm.contact);
            });
        });
    });
});*/