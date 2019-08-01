describe("Module ap-viewmodels - project's components - ContactItemViewModel", () => {
    let vm: ap.viewmodels.projects.ContactItemViewModel;
    let Utility: ap.utility.UtilityHelper, UserContext: ap.utility.UserContext;
    let $q: angular.IQService;
    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });
    beforeEach(inject(function (_$rootScope_, _UserContext_, _Utility_, _$q_) {
        Utility = _Utility_;
        UserContext = _UserContext_;
        $q = _$q_;
    }));
    describe("Feature constructor", () => {
        describe("When the ContactItemViewModel init with params ", () => {
            it("When only displaytext, then email, userid, contactDetails are undefined", () => {
                vm = new ap.viewmodels.projects.ContactItemViewModel("User1");
                expect(vm.displayText).toEqual("User1");
                expect(vm.email).toBeUndefined();
                expect(vm.userId).toBeNull();
                expect(vm.contactDetails).toBeUndefined();
            });
            it("When userId, email are init", () => {
                vm = new ap.viewmodels.projects.ContactItemViewModel("User1", "1", "user@netika.com");
                expect(vm.displayText).toEqual("User1");
                expect(vm.email).toEqual("user@netika.com");
                expect(vm.userId).toEqual("1");
                expect(vm.contactDetails).toBeUndefined();
            });

            it("When all properties on init", () => {
                let contact: ap.models.projects.ContactDetails = new ap.models.projects.ContactDetails(Utility);
                contact.createByJson({Id: "C1"});
                vm = new ap.viewmodels.projects.ContactItemViewModel("User1", "1", "user@netika.com", contact);
                expect(vm.displayText).toEqual("User1");
                expect(vm.email).toEqual("user@netika.com");
                expect(vm.userId).toEqual("1");
                expect(vm.contactDetails).toEqual(contact);
            });

            it("When canRemove is not init in the constructor then canRemove = true", () => {
                vm = new ap.viewmodels.projects.ContactItemViewModel("User1", "1", "user@netika.com", null);
                expect(vm.canRemove).toBeTruthy();
            });
            it("When canRemove is init in the constructor then canRemove = value", () => {
                vm = new ap.viewmodels.projects.ContactItemViewModel("User1", "1", "user@netika.com", null, false);
                expect(vm.canRemove).toBeFalsy();
            });

            it("When isFake is not init in the constructor then isFake = false", () => {
                vm = new ap.viewmodels.projects.ContactItemViewModel("User1", "1", "user@netika.com", null, false);
                expect(vm.isFake).toBeFalsy();
            });
            it("When isFake is init in the constructor then isFake = value", () => {
                vm = new ap.viewmodels.projects.ContactItemViewModel("User1", "1", "user@netika.com", null, false, true);
                expect(vm.isFake).toBeTruthy();
            });

            it("When tooltip is not init in the constructor then tooltip = empty", () => {
                vm = new ap.viewmodels.projects.ContactItemViewModel("User1", "1", "user@netika.com", null, false, true);
                expect(vm.tooltip).toEqual("");
            });
            it("When tooltip is init in the constructor then tooltip = value", () => {
                vm = new ap.viewmodels.projects.ContactItemViewModel("User1", "1", "user@netika.com", null, false, true, "tooltip");
                expect(vm.tooltip).toEqual("tooltip");
            });
            it("When propretyName is init in the constructor then propretyName = value", () => {
                vm = new ap.viewmodels.projects.ContactItemViewModel("User1", "1", "user@netika.com", null, false, true, "tooltip", "Company");
                expect(vm.getPropertyName()).toEqual("Company");
            });
            it("When propretyName is init in the constructor then propretyName = empty", () => {
                vm = new ap.viewmodels.projects.ContactItemViewModel("User1", "1", "user@netika.com", null, false, true, "tooltip");
                expect(vm.getPropertyName()).toBeUndefined();
            });
        });
    });
    describe("Feature getValue", () => {
        describe("WHEN user id exists", () => {
            beforeEach(() => {
                vm = new ap.viewmodels.projects.ContactItemViewModel("UserName", "user-id");
            });
            it("THEN user id is returned", () => {
                expect(vm.getValue()).toEqual("user-id");
            });
        });
        describe("WHEN user id doesn't exist", () => {
            beforeEach(() => {
                vm = new ap.viewmodels.projects.ContactItemViewModel("UserName");
            });
            it("THEN display name is returned", () => {
                expect(vm.getValue()).toEqual("UserName");
            });
        });
    });
});  