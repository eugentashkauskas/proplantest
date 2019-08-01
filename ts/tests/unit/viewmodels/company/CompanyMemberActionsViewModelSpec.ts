describe("Module ap-viewmodels - CompanyMemberActionsViewModel", () => {
    let Utility: ap.utility.UtilityHelper;
    let ControllersManager: ap.controllers.ControllersManager;
    let MainController: ap.controllers.MainController;
    let ServicesManager: ap.services.ServicesManager;
    let vm: ap.viewmodels.company.CompanyMemberActionsViewModel;

    beforeEach(() => {
        angular.mock.module("ap-viewmodels");
        angular.mock.module("matchMedia");
    });

    beforeEach(inject((_Utility_, _ControllersManager_) => {
        Utility = _Utility_;
        ControllersManager = _ControllersManager_;

        MainController = ControllersManager.mainController;
    }));

    beforeEach(() => {
        specHelper.userContext.stub(Utility);
    });

    // Creates an actions view model for the given base model
    function createActionsViewModel(baseModel: ap.models.actors.CompanyUser | ap.models.company.CompanyUserInvitationRequest): ap.viewmodels.company.CompanyMemberActionsViewModel {
        let viewModel =  new ap.viewmodels.company.CompanyMemberItemViewModel(Utility, ControllersManager, ServicesManager);
        viewModel.init(baseModel);
        return viewModel.actionsVm;
    }

    // Creates an actions view model for the given base model of a company user
    function createActionsViewModelForUser(jsonModel: any) {
        let user = new ap.models.actors.CompanyUser(Utility);
        if (jsonModel) {
            user.createByJson(jsonModel);
        }
        return createActionsViewModel(user);
    }

    // Createa an actions view model for the given base model of an invitation request
    function createActionsViewModelForRequest(jsonModel: any) {
        let request = new ap.models.company.CompanyUserInvitationRequest(Utility);
        if (jsonModel) {
            request.createByJson(jsonModel);
        }
        return createActionsViewModel(request);
    }

    /**
     * Sets up an environment for actions view models to determine availability of actions
     * @param isCurrentUserManager an indicator of whether a current user of the applicaion is a manager in the current company
     * @param adittionalUserModels a list of company user models which should be available in the current company object
     *   (a current user of the app is always available by default)
     * @returns a spy object for the managedCompany property of the MainController, which allows to change a strategy of this mock
     */
    function setupCompany(isCurrentUserManager: boolean = false, adittionalUserModels: any[] = []): jasmine.Spy {
        let currentUserModel = {
            User: Utility.UserContext.CurrentUser(),
            IsManager: isCurrentUserManager
        };

        let company = new ap.models.actors.ManagedCompany(Utility);
        company.createByJson({
            CompanyUsers: adittionalUserModels.concat([currentUserModel])
        });

        let propertySpy = specHelper.general.spyProperty(ap.controllers.CompanyController.prototype, "managedCompany", specHelper.PropertyAccessor.Get);
        propertySpy.and.returnValue(company);

        return propertySpy;
    }

    // Rolls back changes made by the setupCompany method
    function tearDownCompany() {
        specHelper.general.offSpyProperty(ap.controllers.CompanyController.prototype, "managedCompany", specHelper.PropertyAccessor.Get);
    }

    describe("Feature: constructor", () => {
        beforeEach(() => {
            vm = new ap.viewmodels.company.CompanyMemberActionsViewModel(Utility, null, ControllersManager);
        });
        describe("WHEN the constructor is called", () => {
            it("THEN the ViewModel is created", () => {
                expect(vm).toBeDefined();
            });          
        });
    });

    describe("Feature: remove action", () => {
        afterEach(tearDownCompany);

        describe("WHEN the current user is not a manager of the company", () => {
            beforeEach(() => {
                let targetUserModel = { User: {} };
                setupCompany(false, [targetUserModel]);
                vm = createActionsViewModelForUser(targetUserModel);
            });
            it("THEN the action is not available", () => {
                specHelper.actions.checkActionState(vm.actions, "companymembers.remove", false, false);
            });
        });

        describe("WHEN an actions view model is created for an invitation request", () => {
            beforeEach(() => {
                setupCompany(true);
                vm = createActionsViewModelForRequest({ InvitedUser: {} });
            });
            it("THEN the action is not available", () => {
                specHelper.actions.checkActionState(vm.actions, "companymembers.remove", false, false);
            });
        });

        describe("WHEN an actions view model is created for a company user", () => {
            describe("AND a company user is an owner of the company", () => {
                beforeEach(() => {
                    let ownerModelJson = { User: {}, IsOwner: true };
                    setupCompany(true, [ownerModelJson]);
                    vm = createActionsViewModelForUser(ownerModelJson);
                });
                it("THEN the action is not available", () => {
                    specHelper.actions.checkActionState(vm.actions, "companymembers.remove", false, false);
                });
            });

            describe("AND a company user is a current user of the application", () => {
                beforeEach(() => {
                    setupCompany(true);
                    let currentUserModel = { User: { Id: Utility.UserContext.CurrentUser().Id }, IsManager: true, IsOwner: false };
                    vm = createActionsViewModelForUser(currentUserModel);
                });
                it("THEN the action is not available", () => {
                    specHelper.actions.checkActionState(vm.actions, "companymembers.remove", false, false);
                });
            });

            describe("AND a company user can be removed", () => {
                beforeEach(() => {
                    let targetUserModel = { User: {}, IsOwner: false };
                    setupCompany(true, [targetUserModel]);
                    vm = createActionsViewModelForUser(targetUserModel);
                });
                it("THEN the action is available", () => {
                    specHelper.actions.checkActionState(vm.actions, "companymembers.remove", true, true);
                });
            });
        });
    });

    describe("Feature: downgrade action", () => {
        afterEach(tearDownCompany);

        describe("WHEN the current user is not a manager of the company", () => {
            beforeEach(() => {
                let targetUserModel = { User: {} };
                setupCompany(false, [targetUserModel]);
                vm = createActionsViewModelForUser(targetUserModel);
            });
            it("THEN the action is not available", () => {
                specHelper.actions.checkActionState(vm.actions, "companymembers.downgrade", false, false);
            });
        });

        describe("WHEN an actions view model is created for an invitation request", () => {
            beforeEach(() => {
                setupCompany(true);
                vm = createActionsViewModelForRequest({ InvitedUser: {} });
            });
            it("THEN the action is not available", () => {
                specHelper.actions.checkActionState(vm.actions, "companymembers.downgrade", false, false);
            });
        });

        describe("WHEN an actions view model is created for a company user", () => {
            describe("AND a company user is a current user of the application", () => {
                beforeEach(() => {
                    setupCompany(true);
                    let currentUserModel = { User: { Id: Utility.UserContext.CurrentUser().Id }, IsManager: true, IsOwner: false };
                    vm = createActionsViewModelForUser(currentUserModel);
                });
                it("THEN the action is not available", () => {
                    specHelper.actions.checkActionState(vm.actions, "companymembers.downgrade", false, false);
                });
            });

            describe("AND a company user can be downgradable", () => {
                beforeEach(() => {
                    let targetUserModel = { User: {}, IsOwner: false, IsManager: true };
                    setupCompany(true, [targetUserModel]);
                    vm = createActionsViewModelForUser(targetUserModel);
                });
                it("THEN the action is available", () => {
                    specHelper.actions.checkActionState(vm.actions, "companymembers.downgrade", true, true);
                });
            });
        });
    });

    describe("Feature: upgrade action", () => {
        afterEach(tearDownCompany);
        describe("WHEN the current user is not a manager of the company", () => {
            beforeEach(() => {
                let targetUserModel = { User: {} };
                setupCompany(false, [targetUserModel]);
                vm = createActionsViewModelForUser(targetUserModel);
            });
            it("THEN the action is not available", () => {
                specHelper.actions.checkActionState(vm.actions, "companymembers.upgrade", false, false);
            });
        });
        describe("WHEN the current user is a manager of the company", () => {
            beforeEach(() => {
                let targetUserModel = { User: {}};
                setupCompany(true, [targetUserModel]);
                vm = createActionsViewModelForUser(targetUserModel);
            });
            it("THEN the action is available", () => {
                specHelper.actions.checkActionState(vm.actions, "companymembers.upgrade", true, true);
            });
        });
        describe("WHEN an actions view model is created for an invitation request", () => {
            beforeEach(() => {
                setupCompany(true);
                vm = createActionsViewModelForRequest({ InvitedUser: {} });
            });
            it("THEN the action is not available", () => {
                specHelper.actions.checkActionState(vm.actions, "companymembers.upgrade", false, false);
            });
        });
        describe("WHEN an actions view model is created for a company user", () => {
            describe("AND a company user is a current user of the application", () => {
                beforeEach(() => {
                    setupCompany(true);
                    let currentUserModel = { User: { Id: Utility.UserContext.CurrentUser().Id }, IsManager: true, IsOwner: false };
                    vm = createActionsViewModelForUser(currentUserModel);
                });
                it("THEN the action is not available", () => {
                    specHelper.actions.checkActionState(vm.actions, "companymembers.upgrade", false, false);
                });
            });

            describe("AND a company user can be upgradable", () => {
                beforeEach(() => {
                    let targetUserModel = { User: {}, IsOwner: false, IsManager: false };
                    setupCompany(true, [targetUserModel]);
                    vm = createActionsViewModelForUser(targetUserModel);
                });
                it("THEN the action is available", () => {
                    specHelper.actions.checkActionState(vm.actions, "companymembers.upgrade", true, true);
                });
            });
        });
    });


    describe("Feature: cancel action", () => {
        afterEach(tearDownCompany);

        describe("WHEN the current user is not a manager of the company", () => {
            beforeEach(() => {
                setupCompany(false);
                vm = createActionsViewModelForRequest({ InvitedUser: {} });
            });
            it("THEN the action is not available", () => {
                specHelper.actions.checkActionState(vm.actions, "companymembers.cancel", false, false);
            });
        });

        describe("WHEN an actions view model is created for a company user", () => {
            beforeEach(() => {
                setupCompany(true);
                vm = createActionsViewModelForUser({ User: {} });
            });
            it("THEN the action is not available", () => {
                specHelper.actions.checkActionState(vm.actions, "companymembers.cancel", false, false);
            });
        });

        describe("WHEN an actions view model is created for an invitation request", () => {
            describe("AND a status of the request is not pending", () => {
                beforeEach(() => {
                    let requestModel = { InvitedUser: {}, Status: ap.models.company.InvitationRequestStatus.Accepted };
                    setupCompany(true);
                    vm = createActionsViewModelForRequest(requestModel);
                });
                it("THEN the action is not available", () => {
                    specHelper.actions.checkActionState(vm.actions, "companymembers.cancel", false, false);
                });
            });

            describe("AND a status of the request is pending", () => {
                beforeEach(() => {
                    setupCompany(true);
                    let requestModel = { InvitedUser: {}, Status: ap.models.company.InvitationRequestStatus.Sent };
                    vm = createActionsViewModelForRequest(requestModel);
                });
                it("THEN the action is available", () => {
                    specHelper.actions.checkActionState(vm.actions, "companymembers.cancel", true, true);
                });
            });
        });
    });
});
 