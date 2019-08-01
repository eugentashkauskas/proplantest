"use strict";
describe("Module ap-viewmodels - project contacts components - ProjectContactItemViewModel", () => {
    let vm: ap.viewmodels.projectcontacts.ProjectContactItemViewModel;
    let Utility: ap.utility.UtilityHelper;
    let UserContext: ap.utility.UserContext;
    let $q: angular.IQService;
    let ContactController: ap.controllers.ContactController;
    let MainController: ap.controllers.MainController;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject(function (_$rootScope_, _UserContext_, _Utility_, _$q_, _ContactController_, _MainController_) {
        Utility = _Utility_;
        UserContext = _UserContext_;
        $q = _$q_;
        ContactController = _ContactController_;
        MainController = _MainController_;        
    }));

    describe("Feature constructor", () => {
        let contact: ap.models.projects.ContactDetails;
        let userJson = { DefaultEmail: "nick.cheshenko@gmail.com" };
        let contactJson = {
            Id: "1",
            Company:"testCompany",
            DisplayName: "Test contact",
            User: userJson,
            AccessRightLevel: ap.models.accessRights.AccessRightLevel.Manager,
            Role: "Manager"
        }
        beforeEach(() => {
            contact = new ap.models.projects.ContactDetails(Utility);
            contact.createByJson(contactJson);
        });
        describe("WHEN the ProjectContactItemViewModel is init with params", () => {
            beforeEach(() => {
                vm = new ap.viewmodels.projectcontacts.ProjectContactItemViewModel(Utility, $q, undefined,
                    new ap.viewmodels.projectcontacts.ProjectContactItemParameter(1, contact, null, null, Utility, ContactController, MainController));
                vm.init(contact);

            });

            it("THEN, the vm is built with the correct values from the entity", () => {
                expect(vm.displayName).toEqual(contactJson.DisplayName);
                expect(vm.company).toEqual(contactJson.Company);
                expect(vm.email).toEqual(userJson.DefaultEmail);
                expect(vm.projectAccess).toEqual(contactJson.AccessRightLevel);
                expect(vm.role).toEqual(contactJson.Role);
            });
            it("THEN, expect view model action to be defined", () => {
                expect(vm.contactActions).toBeDefined();
            });
        });
    });

    describe("Feature contactsInvitedHandler", () => {
        let contact: ap.models.projects.ContactDetails;
        let updContact: ap.models.projects.ContactDetails;
        beforeEach(() => {
            contact = new ap.models.projects.ContactDetails(Utility);
            contact.createByJson({
                Id: "1",
                Company: "testCompany",
                DisplayName: "Test contact",
                IsInvited: false,
                AccessRightLevel: ap.models.accessRights.AccessRightLevel.Manager,
                Role: "Manager"
            });

            updContact = new ap.models.projects.ContactDetails(Utility);
            updContact.createByJson({
                Id: "1",
                Company: "testCompany2",
                DisplayName: "Test contact2",
                IsInvited: true,
            });
        });

        describe("WHEN 'contactsinvited' event was fired from the ContactController with the same id of the item", () => {
            beforeEach(() => {
                vm = new ap.viewmodels.projectcontacts.ProjectContactItemViewModel(Utility, $q, undefined, new ap.viewmodels.projectcontacts.ProjectContactItemParameter(1, contact, null, null, Utility, ContactController, MainController));


                vm.init(contact);
                spyOn(vm, "copySource");
                spyOn(vm.originalContactItem, "updateEntityPropsOnly");
            });

            it("THEN, the vm will update contact", () => {
                specHelper.general.raiseEvent(ContactController, "contactsinvited", [updContact]);
                expect(vm.copySource).toHaveBeenCalled();
                expect(vm.originalContactItem.IsInvited).toBe(true);
                expect(vm.originalContactItem.updateEntityPropsOnly).toHaveBeenCalledWith(updContact);
            });
        });

        describe("WHEN 'contactsinvited' event was fired from the ContactController without the same id of the item", () => {
            beforeEach(() => {
                vm = new ap.viewmodels.projectcontacts.ProjectContactItemViewModel(Utility, $q, undefined, new ap.viewmodels.projectcontacts.ProjectContactItemParameter(1, contact, null, null, Utility, ContactController, MainController));


                vm.init(contact);
                spyOn(vm, "copySource");
                spyOn(vm.originalContactItem, "updateEntityPropsOnly");
            });

            it("THEN, the vm will update contact", () => {
                specHelper.general.raiseEvent(ContactController, "contactsinvited", [{Id: "2"}]);
                expect(vm.copySource).not.toHaveBeenCalled();
                expect(vm.originalContactItem.IsInvited).toBe(false);
                expect(vm.originalContactItem.updateEntityPropsOnly).not.toHaveBeenCalled();
            });
        });
    });
});