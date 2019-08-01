describe("Module ap-viewmodels - CompanyMemberItemViewModel", () => {
    let Utility: ap.utility.UtilityHelper;
    let ControllersManager: ap.controllers.ControllersManager;
    let ServicesManager: ap.services.ServicesManager;
    let $timeout: ng.ITimeoutService;
    let vm: ap.viewmodels.company.CompanyMemberItemViewModel;
    let $scope: angular.IScope, $q: angular.IQService;
    let $rootScope: angular.IRootScopeService;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject((_Utility_, _ControllersManager_, _$timeout_, _ServicesManager_, _$rootScope_, _$q_) => {
        Utility = _Utility_;
        ControllersManager = _ControllersManager_;
        ServicesManager = _ServicesManager_;
        $timeout = _$timeout_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        $q = _$q_;
    }));

    describe("Feature: constructor", () => {
        let data: any;
        let companyUserInvintationRequest: ap.models.company.CompanyUserInvitationRequest;
        beforeEach(() => {
            data = {
                Id: "test-company-user-id",
                Status: 1,
                User: {
                    Id: "test-user-id",
                    Alias: "user@test.com"
                },
                InvitedUser: {
                    Id: "test-invited-user-id",
                    DisplayName: "Invited user"
                }
            };
            companyUserInvintationRequest = new ap.models.company.CompanyUserInvitationRequest(Utility);
            companyUserInvintationRequest.createByJson(data);
            vm = new ap.viewmodels.company.CompanyMemberItemViewModel(Utility, ControllersManager, ServicesManager);
            vm.init(companyUserInvintationRequest);
        });
        describe("WHEN the constructor is called", () => {
            it("THEN the ViewModel is created", () => {
                expect(vm).toBeDefined();
            });
        });
    });
    describe("Feature: init", () => {
        describe("WHEN the init() is called", () => {
            describe("WHEN with CompanyUser", () => {
                let companyUser: ap.models.actors.CompanyUser;
                beforeEach(() => {
                    specHelper.userContext.stub(Utility);

                    vm = new ap.viewmodels.company.CompanyMemberItemViewModel(Utility, ControllersManager, ServicesManager);
                    companyUser = new ap.models.actors.CompanyUser(Utility);
                    let jsonCompanyUser = {
                        IsOwner: true,
                        IsManager: true,
                        User: {
                            Id: "111",
                            DisplayName: "Foo",
                            AvatarFileName: "Bar"
                        },
                        IsDisabled: true
                    };
                    companyUser.createByJson(jsonCompanyUser);

                    vm.init(companyUser);
                });
                it("THEN the company member is init AND _displayName, _avatarName, _isManager preset", () => {
                    expect(vm.avatarName).toEqual("Bar");
                    expect(vm.displayName).toEqual("Foo");
                    expect(vm.status).toBe(ap.models.company.InvitationRequestStatus.Deactivated);
                    expect(vm.isManager).toBeTruthy();
                });
            });
            describe("WHEN with CompanyUserInvitationRequest", () => {
                let companyUserInvitationRequest: ap.models.company.CompanyUserInvitationRequest;
                beforeEach(() => {
                    vm = new ap.viewmodels.company.CompanyMemberItemViewModel(Utility, ControllersManager, ServicesManager);

                    companyUserInvitationRequest = new ap.models.company.CompanyUserInvitationRequest(Utility);
                    let json = {
                        Inviter: modelSpecHelper.createUserJson("Spielberg", "Steve", "d09ce6dc-5acc-47fb-a15f-a4547dbc1d28", false),
                        InvitedUser: modelSpecHelper.createUserJson("Foo", "Bar", "d09ce6dc-5acc-47fb-a15f-a4547dbc1d27", false),
                        Company: modelSpecHelper.createManagedCompanyJson(),
                        CreationDate: new Date(),
                        Status: 2
                    };
                    companyUserInvitationRequest.createByJson(json);

                    vm.init(companyUserInvitationRequest);
                });
                it("THEN the company member is init AND _displayName, status preset", () => {
                    expect(vm.avatarName).toBeNull();
                    expect(vm.displayName).toEqual("Bar Foo");
                    expect(vm.status).toBe(ap.models.company.InvitationRequestStatus.Refused);
                    expect(vm.isManager).toBeFalsy();
                });
            });
        });
    });
    describe("Feature actionClick", () => {
        describe("WHEN actionClick is called with action name companymembers.remove", () => {
            let companyUser: ap.models.actors.CompanyUser;
            let jsonCompanyUser: any;
            let actionName: string;
            beforeEach(() => {
                specHelper.userContext.stub(Utility);
                let actionName = "companymembers.remove";
                let jsonCompanyUser = {
                    IsOwner: true,
                    IsManager: true,
                    User: {
                        Id: "111",
                        DisplayName: "Foo",
                        AvatarFileName: "Bar"
                    },
                    IsDisabled: true
                };
                spyOn(ControllersManager.companyController, "removeCompanyUser").and.callThrough();
                vm = new ap.viewmodels.company.CompanyMemberItemViewModel(Utility, ControllersManager, ServicesManager);
                companyUser = new ap.models.actors.CompanyUser(Utility);
                companyUser.createByJson(jsonCompanyUser);
                vm.init(companyUser);
                vm.actionClick(actionName);
            });
            it("THEN removeCompanyUser from companyController is called", () => {
                expect(ControllersManager.companyController.removeCompanyUser).toHaveBeenCalled();
            });
        });
        describe("WHEN actionClick is called with action name companymembers.downgrade", () => {
            let companyUser: ap.models.actors.CompanyUser;
            let jsonCompanyUser: any;
            let actionName: string;
            let def: angular.IDeferred<ap.models.actors.CompanyUser>;
            beforeEach(() => {
                def = $q.defer();
                specHelper.userContext.stub(Utility);
                let actionName = "companymembers.downgrade";
                let jsonCompanyUser = {
                    IsOwner: true,
                    IsManager: true,
                    User: {
                        Id: "111",
                        DisplayName: "Foo",
                        AvatarFileName: "Bar"
                    },
                    IsDisabled: true
                };
                spyOn(ServicesManager.companyService, "downgradeToMember").and.returnValue(def.promise);
                vm = new ap.viewmodels.company.CompanyMemberItemViewModel(Utility, ControllersManager, ServicesManager);
                companyUser = new ap.models.actors.CompanyUser(Utility);
                companyUser.createByJson(jsonCompanyUser);
                vm.init(companyUser);
                vm.actionClick(actionName);
            });
            it("THEN companyService.downgradeToMember is called", () => {
                expect(ServicesManager.companyService.downgradeToMember).toHaveBeenCalledWith(companyUser);
            });
            it("THEN companyUser.IsManager", () => {
                def.resolve(companyUser);
                $rootScope.$apply();
                expect(vm.isManager).toBeFalsy();
            });
        });

        describe("WHEN actionClick is called with action name companymembers.upgrade", () => {
            let companyUser: ap.models.actors.CompanyUser;
            let jsonCompanyUser: any;
            let actionName: string;
            let def: angular.IDeferred<ap.models.actors.CompanyUser>;
            beforeEach(() => {
                def = $q.defer();
                specHelper.userContext.stub(Utility);
                let actionName = "companymembers.upgrade";
                let jsonCompanyUser = {
                    IsOwner: true,
                    IsManager: false,
                    User: {
                        Id: "111",
                        DisplayName: "Foo",
                        AvatarFileName: "Bar"
                    },
                    IsDisabled: true
                };
                spyOn(ServicesManager.companyService, "upgradeToManager").and.returnValue(def.promise);
                vm = new ap.viewmodels.company.CompanyMemberItemViewModel(Utility, ControllersManager, ServicesManager);
                companyUser = new ap.models.actors.CompanyUser(Utility);
                companyUser.createByJson(jsonCompanyUser);
                vm.init(companyUser);
                vm.actionClick(actionName);
            });
            it("THEN companyService.upgradeToManager is called", () => {
                expect(ServicesManager.companyService.upgradeToManager).toHaveBeenCalledWith(companyUser);
            });
            it("THEN companyUser.IsManager", () => {
                def.resolve(companyUser);
                $rootScope.$apply();
                expect(vm.isManager).toBeTruthy();
            });
        });

        describe("WHEN actionClick is called with action name companymembers.cancel", () => {
            let companyUserInvitationRequest: ap.models.company.CompanyUserInvitationRequest;
            let jsonCompanyUserInvitationRequest: any;
            let actionName: string;
            beforeEach(() => {
                specHelper.userContext.stub(Utility);
                let actionName = "companymembers.cancel";
                let jsonCompanyUserInvitationRequest = {
                    Id: "test-company-user-id",
                    Status: 1,
                    User: {
                        Id: "test-user-id",
                        Alias: "user@test.com"
                    },
                    InvitedUser: {
                        Id: "test-invited-user-id",
                        DisplayName: "Invited user"
                    }
                };
                spyOn(ControllersManager.companyController, "cancelInvitation").and.callThrough();
                vm = new ap.viewmodels.company.CompanyMemberItemViewModel(Utility, ControllersManager, ServicesManager);
                companyUserInvitationRequest = new ap.models.company.CompanyUserInvitationRequest(Utility);
                companyUserInvitationRequest.createByJson(jsonCompanyUserInvitationRequest);
                vm.init(companyUserInvitationRequest);
                vm.actionClick(actionName);
            });
            it("THEN cancelInvitation from companyController is called", () => {
                expect(ControllersManager.companyController.cancelInvitation).toHaveBeenCalled();
            });
        });
    });
});
 