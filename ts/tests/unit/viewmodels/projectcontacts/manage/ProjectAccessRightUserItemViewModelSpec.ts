describe("Module ap-viewmodels - ProjectAccessRightUserItemViewModel", () => {
    let Utility: ap.utility.UtilityHelper;
    let $q: angular.IQService;
    let vm: ap.viewmodels.projectcontacts.ProjectAccessRightUserItemViewModel;
    let ControllersManager: ap.controllers.ControllersManager;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject(function (_Utility_, _$q_, _ControllersManager_) {
        Utility = _Utility_;
        $q = _$q_;
        ControllersManager = _ControllersManager_;
        specHelper.userContext.stub(Utility);

        spyOn(ControllersManager.mainController, "currentProject").and.returnValue({
            Id: "1",
            UserAccessRight: {
                Level: ap.models.accessRights.AccessRightLevel.Guest
            },
            Creator: {
                Id: "111"
            }
        });

    }));

    describe("Feature: constructor", () => {
        let testContact1: ap.models.projects.ContactDetails;
        let testContact2: ap.models.projects.ContactDetails;
        let testProjectAccessRight: ap.models.accessRights.ProjectAccessRight;
        beforeEach(() => {
            testProjectAccessRight = new ap.models.accessRights.ProjectAccessRight(Utility);
            testProjectAccessRight.createByJson({
                Level: ap.models.accessRights.AccessRightLevel.Subcontractor,
                CanConfig: true
            })
            testContact1 = new ap.models.projects.ContactDetails(Utility);
            testContact1.createByJson({
                Id: "test-contact-1",
                AccessRightLevel: ap.models.accessRights.AccessRightLevel.Subcontractor,
                User: {UserId: "1"}
            });
            testContact2 = new ap.models.projects.ContactDetails(Utility);
            testContact2.createByJson({
                Id: "test-contact-2",
                AccessRightLevel: ap.models.accessRights.AccessRightLevel.Guest,
                User: { UserId: "2" }
            });
        });

        describe("WHEN the viewmodel is created", () => {
            beforeEach(() => {
                vm = new ap.viewmodels.projectcontacts.ProjectAccessRightUserItemViewModel(Utility, $q, null, "CanConfig", "Test label", ap.viewmodels.projectcontacts.ValueType.Simple, [testContact1, testContact2], [testProjectAccessRight], new ap.viewmodels.projectcontacts.UserProjectAccessRightItemParameter(0, null, null, null, Utility, ControllersManager));
            });
            it("THEN, its fields are initialized ", () => {
                expect(vm).toBeDefined();
                expect(vm.name).toEqual("CanConfig");
                expect(vm.label).toEqual("Test label");
                expect(vm.currentInfoList).toBeDefined();
            });
            it("THEN, contact info is filled with valid values for the first page", () => {
                expect(vm.currentInfoList.length).toEqual(2);
                expect(vm.currentInfoList[0].info.value).toBeTruthy();
                expect(vm.currentInfoList[1].info.value).toBeFalsy();
            });
        });
    });
});