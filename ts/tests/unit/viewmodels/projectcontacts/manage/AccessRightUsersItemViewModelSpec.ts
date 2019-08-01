describe("Module ap-viewmodels - AccessRightUsersItemViewModel", () => {

    let Utility: ap.utility.UtilityHelper;
    let $q: angular.IQService;
    let vm: ap.viewmodels.projectcontacts.AccessRightUsersItemViewModel;

    beforeEach(() => {
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject(function (_Utility_, _$q_) {
        Utility = _Utility_;
        $q = _$q_;
        specHelper.userContext.stub(Utility);
    }));
    describe("Feature: constructor", () => {
        describe("WHEN viewmodel is created", () => {
            beforeEach(() => {
                vm = new ap.viewmodels.projectcontacts.AccessRightUsersItemViewModel(Utility, $q, "test-name", ap.viewmodels.projectcontacts.ValueType.Empty);
            });
            it("THEN, all its fields are initialized properly", () => {
                expect(vm).toBeDefined();
                expect(vm.name).toEqual("test-name");
                expect(vm.type).toEqual("Empty");
                /*expect(vm.hasAccess).toBeDefined();
                expect(vm.level).toBeDefined();*/
            });
        });
    });
});
describe("Module ap-viewmodels - ContactInfoViewModel", () => {

    let Utility: ap.utility.UtilityHelper;
    let $q: angular.IQService;
    let vm: ap.viewmodels.projectcontacts.ProjectContactInfoViewModel;
    let project: ap.models.projects.Project;
    let contact: ap.models.projects.ContactDetails;

    beforeEach(() => {
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject(function (_Utility_, _$q_) {
        Utility = _Utility_;
        $q = _$q_;
        specHelper.userContext.stub(Utility);
    }));

    describe("Feature: constructor", () => {
        describe("WHEN viewmodel is created", () => {
            beforeEach(() => {
                project = new ap.models.projects.Project(Utility);
                contact = new ap.models.projects.ContactDetails(Utility);
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.returnValue(true);
            });
            describe("WHEN the contact has a higher level than the user", () => {
                beforeEach(() => {
                    project.createByJson({
                        UserAccessRight: {
                            Level: ap.models.accessRights.AccessRightLevel.Guest
                        },
                        Creator: {
                            Id: "111"
                        }
                    });

                    contact.createByJson({
                        IsInvited: false,
                        InviterId: "3",
                        EntityCreationUser: "2",
                        HasSuperAdminModule: false,
                        User: { UserId: "2" },
                        AccessRightLevel: ap.models.accessRights.AccessRightLevel.Manager
                    });

                    vm = new ap.viewmodels.projectcontacts.ProjectContactInfoViewModel(Utility, ap.viewmodels.projectcontacts.ValueType.Simple, true, contact, project);
                });
                it("THEN, vm is defined", () => {
                    expect(vm).toBeDefined();
                });
            });
        });
    });

    describe("Feature: canEdit", () => {
        beforeEach(() => {
            project = new ap.models.projects.Project(Utility);
            contact = new ap.models.projects.ContactDetails(Utility);
            spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.returnValue(true);
        });
        describe("WHEN the contact has a higher level than the user", () => {
            beforeEach(() => {
                project.createByJson({
                    UserAccessRight: {
                        Level: ap.models.accessRights.AccessRightLevel.Guest
                    },
                    Creator: {
                        Id: "111"
                    }
                });

                contact.createByJson({
                    IsInvited: false,
                    InviterId: "3",
                    EntityCreationUser: "2",
                    HasSuperAdminModule: false,
                    User: { UserId: "2" },
                    AccessRightLevel: ap.models.accessRights.AccessRightLevel.Manager
                });

                vm = new ap.viewmodels.projectcontacts.ProjectContactInfoViewModel(Utility, ap.viewmodels.projectcontacts.ValueType.Simple, true, contact, project);
            });
            it("THEN, can edit = false", () => {
                expect(vm.canEdit).toBeFalsy();
            });
        });
        describe("WHEN the contact has a lower level than the user", () => {
            beforeEach(() => {
                project.createByJson({
                    UserAccessRight: {
                        Level: ap.models.accessRights.AccessRightLevel.Admin
                    },
                    Creator: {
                        Id: "111"
                    }
                });

                contact.createByJson({
                    IsInvited: false,
                    InviterId: "3",
                    EntityCreationUser: "2",
                    HasSuperAdminModule: false,
                    User: { UserId: "2" },
                    AccessRightLevel: ap.models.accessRights.AccessRightLevel.Manager
                });

                vm = new ap.viewmodels.projectcontacts.ProjectContactInfoViewModel(Utility, ap.viewmodels.projectcontacts.ValueType.Simple, true, contact, project);
            });
            it("THEN, can edit = true", () => {
                expect(vm.canEdit).toBeTruthy();
            });
        });
        describe("WHEN the contact isInvited AND InviterId === currentUserId", () => {
            beforeEach(() => {
                project.createByJson({
                    UserAccessRight: {
                        Level: ap.models.accessRights.AccessRightLevel.Manager
                    },
                    Creator: {
                        Id: "111"
                    }
                });

                contact.createByJson({
                    IsInvited: true,
                    InviterId: "111",
                    EntityCreationUser: "2",
                    HasSuperAdminModule: false,
                    User: { UserId: "2" },
                    AccessRightLevel: ap.models.accessRights.AccessRightLevel.Contributor
                });

                vm = new ap.viewmodels.projectcontacts.ProjectContactInfoViewModel(Utility, ap.viewmodels.projectcontacts.ValueType.Simple, true, contact, project);
            });
            it("THEN, can edit = true", () => {
                expect(vm.canEdit).toBeTruthy();
            });
        });
        describe("WHEN the contact !isInvited AND EntityCreationUser === currentUSerId", () => {
            beforeEach(() => {
                project.createByJson({
                    UserAccessRight: {
                        Level: ap.models.accessRights.AccessRightLevel.Manager
                    },
                    Creator: {
                        Id: "111"
                    }
                });

                contact.createByJson({
                    IsInvited: false,
                    InviterId: "3",
                    EntityCreationUser: "111",
                    HasSuperAdminModule: false,
                    User: { UserId: "2" },
                    AccessRightLevel: ap.models.accessRights.AccessRightLevel.Contributor
                });

                vm = new ap.viewmodels.projectcontacts.ProjectContactInfoViewModel(Utility, ap.viewmodels.projectcontacts.ValueType.Simple, true, contact, project);
            });
            it("THEN, can edit = true", () => {
                expect(vm.canEdit).toBeTruthy();
            });
        });
        describe("WHEN the contact is the current user", () => {
            beforeEach(() => {
                project.createByJson({
                    UserAccessRight: {
                        Level: ap.models.accessRights.AccessRightLevel.Manager
                    },
                    Creator: {
                        Id: "111"
                    }
                });

                contact.createByJson({
                    IsInvited: false,
                    InviterId: "3",
                    EntityCreationUser: "2",
                    HasSuperAdminModule: false,
                    User: { UserId: "111" },
                    AccessRightLevel: ap.models.accessRights.AccessRightLevel.Contributor
                });

                vm = new ap.viewmodels.projectcontacts.ProjectContactInfoViewModel(Utility, ap.viewmodels.projectcontacts.ValueType.Simple, true, contact, project);
            });
            it("THEN, can edit = false", () => {
                expect(vm.canEdit).toBeFalsy();
            });
        });
    });

    describe("Feature: initializeAccessRight", () => {
        beforeEach(() => {
            project = new ap.models.projects.Project(Utility);
            contact = new ap.models.projects.ContactDetails(Utility);
            project.createByJson({
                UserAccessRight: {
                    Level: ap.models.accessRights.AccessRightLevel.Admin
                },
                Creator: {
                    Id: "111"
                }
            });

            contact.createByJson({
                IsInvited: false,
                InviterId: "3",
                EntityCreationUser: "2",
                HasSuperAdminModule: false,
                User: { UserId: "2" },
                AccessRightLevel: ap.models.accessRights.AccessRightLevel.Manager
            });
        });
        describe("WHEN the user has the module Module_ProjectGuestAccess", () => {
            beforeEach(() => {
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake((arg: string) => {
                    if (arg === "PROJECT_GUEST_ACCESS") {
                        return true;
                    } else {
                        return false;
                    }
                });

                vm = new ap.viewmodels.projectcontacts.ProjectContactInfoViewModel(Utility, ap.viewmodels.projectcontacts.ValueType.Simple, true, contact, project);
            });
            it("THEN, availableAccessRights containts Guest", () => {
                expect(vm.availableAccessRights[0].key).toEqual(ap.models.accessRights.AccessRightLevel.Guest);
            });
        });
        describe("WHEN the user has the module Module_ProjectContributorAccess", () => {
            beforeEach(() => {
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake((arg: string) => {
                    if (arg === "PROJECT_CONTRIB_ACCESS") {
                        return true;
                    } else {
                        return false;
                    }
                });

                vm = new ap.viewmodels.projectcontacts.ProjectContactInfoViewModel(Utility, ap.viewmodels.projectcontacts.ValueType.Simple, true, contact, project);
            });
            it("THEN, availableAccessRights containts Contributor", () => {
                expect(vm.availableAccessRights[0].key).toEqual(ap.models.accessRights.AccessRightLevel.Contributor);
            });
        });
        describe("WHEN the user has a bigger level or equal manager", () => {
            beforeEach(() => {
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake((arg: string) => {
                    return false;
                });

                vm = new ap.viewmodels.projectcontacts.ProjectContactInfoViewModel(Utility, ap.viewmodels.projectcontacts.ValueType.Simple, true, contact, project);
            });
            it("THEN, availableAccessRights containts Manager", () => {
                expect(vm.availableAccessRights[0].key).toEqual(ap.models.accessRights.AccessRightLevel.Manager);
            });
        });
        describe("WHEN the user has the module Module_ProjectAdminAccess", () => {
            beforeEach(() => {
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake((arg: string) => {
                    if (arg === "PROJECT_ADMIN_ACCESS") {
                        return true;
                    } else {
                        return false;
                    }
                });

                vm = new ap.viewmodels.projectcontacts.ProjectContactInfoViewModel(Utility, ap.viewmodels.projectcontacts.ValueType.Simple, true, contact, project);
            });
            it("THEN, availableAccessRights containts Admin", () => {
                expect(vm.availableAccessRights[1].key).toEqual(ap.models.accessRights.AccessRightLevel.Admin);
            });
        });
    });
}); 