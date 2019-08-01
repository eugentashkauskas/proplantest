describe("Module ap-viewmodels - InviteContacts", () => {
    let Utility: ap.utility.UtilityHelper,
        $q: angular.IQService,
        ContactController: ap.controllers.ContactController,
        MainController: ap.controllers.MainController,
        $scope: ng.IScope,
        $rootScope: angular.IRootScopeService,
        $mdDialog: angular.material.IDialogService,
        vm: ap.viewmodels.projectcontacts.InviteContactsViewModel,
        contact: ap.models.projects.ContactDetails,
        contact2: ap.models.projects.ContactDetails,
        contactDetailsList: ap.models.projects.ContactDetails[];
    let spySelectCode: jasmine.Spy;
    let originalSelectByCode: any;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");

        angular.mock.module(($provide) => {
            $provide.factory('$mdDialog', ["$q", function ($q) {
                return specHelper.utility.stubShowMdDialog($q);
            }]);
        });
    });

    beforeEach(inject((_$rootScope_, _Utility_, _$q_, _ContactController_, _MainController_, _$mdDialog_) => {
        Utility = _Utility_;
        $q = _$q_;
        ContactController = _ContactController_;
        MainController = _MainController_;
        $rootScope = _$rootScope_;
        $mdDialog = _$mdDialog_;
        $scope = $rootScope.$new();
    }));

    beforeEach(() => {
        specHelper.userContext.stub(Utility);
        contactDetailsList = [];

        contact = new ap.models.projects.ContactDetails(Utility);
        contact.createByJson({
            Id: "1",
            DisplayName: "Test contact",
            User: {
                LanguageCode: "en"
            }
        });
        contact2 = new ap.models.projects.ContactDetails(Utility);
        contact2.createByJson({
            Id: "2",
            DisplayName: "Test contact 2",
            User: {
                LanguageCode: "en"
            }
        });
        contactDetailsList.push(contact);
        spyOn(Utility.UserContext, "LanguageCode").and.returnValue("userLanguage");
        
    });
    beforeEach(() => {
        spySelectCode = jasmine.createSpy("selectByCode");
        spySelectCode.and.returnValue($q.defer());
        originalSelectByCode = ap.viewmodels.identificationfiles.languages.LanguageListViewModel.prototype.selectByCode;
        ap.viewmodels.identificationfiles.languages.LanguageListViewModel.prototype.selectByCode = spySelectCode;
    });
    afterEach(() => {
        ap.viewmodels.identificationfiles.languages.LanguageListViewModel.prototype.selectByCode = originalSelectByCode;
    });
    describe("Feature: constructor", () => {
        
        describe("WHEN a call constructor", () => {

            beforeEach(() => {
                vm = new ap.viewmodels.projectcontacts.InviteContactsViewModel(Utility, $mdDialog, contactDetailsList, ContactController, $q, MainController);
            });

            it("THEN, languageSelector should be defined.", () => {
                expect(vm.languageSelector).toBeDefined();
            });

            it("THEN, selectByCode should be called with good parameters", () => {
                expect(vm.languageSelector.selectByCode).toHaveBeenCalledWith("userLanguage");
            });
        });
        describe("WHEN constructor is called with one contact", () => {
            beforeEach(() => {
                vm = new ap.viewmodels.projectcontacts.InviteContactsViewModel(Utility, $mdDialog, contactDetailsList, ContactController, $q, MainController);
            });
            it("THEN, nameContacts equals the displayName of the contact", () => {
                expect(vm.nameContacts).toBe("Test contact");
            });
        });
        describe("WHEN constructor is called with several contacts", () => {
            beforeEach(() => {
                contactDetailsList.push(contact2);
                vm = new ap.viewmodels.projectcontacts.InviteContactsViewModel(Utility, $mdDialog, contactDetailsList, ContactController, $q, MainController);
            });
            it("THEN, nameContacts equals the displayName of each contact separated by comma", () => {
                expect(vm.nameContacts).toBe("Test contact, Test contact 2");
            });
        });
    });

    describe("Feature: cancel", () => {
        describe("WHEN a call VM.cancel method", () => {

            beforeEach(() => {
                vm = new ap.viewmodels.projectcontacts.InviteContactsViewModel(Utility, $mdDialog, [], ContactController, $q, MainController);

                vm.cancel();
            });

            it("THEN, $mdDialog.cancel should be called", () => {
                expect($mdDialog.cancel).toHaveBeenCalled();
            });
        });
    });

    describe("Feature: invite", () => {
        describe("WHEN a call VM.invite method", () => {
            let language: ap.models.identFiles.Language;
            let inviteCallback: jasmine.Spy;
            beforeEach(() => {
                inviteCallback = jasmine.createSpy("inviteContactsCallback");
                language = new ap.models.identFiles.Language(Utility);
                language.Code = "en";
                language.TranslationCode = "EN";
                spyOn(ContactController, "inviteProjectContacts").and.returnValue($q.when());

                vm = new ap.viewmodels.projectcontacts.InviteContactsViewModel(Utility, $mdDialog, contactDetailsList, ContactController, $q, MainController);
                vm.on("contactsinvited", inviteCallback, this);
                specHelper.general.spyProperty(ap.viewmodels.projectcontacts.InviteContactsViewModel.prototype, "selectedLanguage", specHelper.PropertyAccessor.Get).and.returnValue(language);
                $rootScope.$apply();

                vm.invite();
            });
            afterEach(() => {
                vm.off("contactsinvited", inviteCallback, this);
                specHelper.general.offSpyProperty(ap.viewmodels.projectcontacts.InviteContactsViewModel.prototype, "selectedLanguage", specHelper.PropertyAccessor.Get);
            });

            it("THEN, ContactController.inviteProjectContacts should be called with good parameters", () => {
                expect(ContactController.inviteProjectContacts).toHaveBeenCalledWith(["1"], vm.selectedLanguage);
            });

            it("THEN, $mdDialog.hide should be called", () => {
                $rootScope.$apply();
                expect($mdDialog.hide).toHaveBeenCalled();
            });
            it("THEN, 'contactsinvited' event is raised", () => {
                $rootScope.$apply();
                expect(inviteCallback).toHaveBeenCalled();
            });
        });
    });
});