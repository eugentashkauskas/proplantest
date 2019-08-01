describe("Module ap-viewmodels - MeetingContactsActionViewModel", () => {
    let Utility: ap.utility.UtilityHelper, $q: angular.IQService, $scope: ng.IScope, $rootScope: angular.IRootScopeService;
    let vm: ap.viewmodels.meetingcontacts.MeetingContactsActionViewModel;
    let UserContext: ap.utility.UserContext;
    let deleteAction: ap.viewmodels.home.ActionViewModel;
    let ContactController: ap.controllers.ContactController;
    let MainController: ap.controllers.MainController;
    let currentProject: ap.models.projects.Project;

    /**
     * Initialize the actions to test
     * @param vm The vm containing the actions
     */
    function initActions(vm: ap.viewmodels.meetingcontacts.MeetingContactsActionViewModel) {
        deleteAction = ap.viewmodels.home.ActionViewModel.getAction(vm.actions, "meetingcontacts.delete");
    }

    /**
     * Create the ViewModel
     * @param contact The entity used to initialize the ViewModel
     */
    function createViewModel(contact: ap.models.meetings.MeetingConcern) {
        vm = new ap.viewmodels.meetingcontacts.MeetingContactsActionViewModel(Utility, contact, ContactController, MainController);
        initActions(vm);
    }

    /**
     * Creates meetingConcern entity
     */
    let createMeetingConcern: (json?: any) => ap.models.meetings.MeetingConcern = (baseJson?: any) => {
        let json: any = {};

        if (baseJson) {
            for (let key in baseJson) {
                if (json[key] === undefined) {
                    json[key] = baseJson[key]; // merge the 2 JSON
                }
            }
        }

        let meetingConcern: ap.models.meetings.MeetingConcern = new ap.models.meetings.MeetingConcern(Utility);
        meetingConcern.createByJson(json);

        return meetingConcern;
    }

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject((_$rootScope_, _Utility_, _$q_, _ContactController_, _MainController_, _UserContext_) => {
        Utility = _Utility_;
        $q = _$q_;
        ContactController = _ContactController_;
        MainController = _MainController_;
        UserContext = _UserContext_;
        specHelper.userContext.stub(Utility); // stub UserContext
        currentProject = specHelper.mainController.stub(MainController, Utility);

        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();

        spyOn(Utility.Translator, "getTranslation").and.callFake((key: string) => {
            return "$" + key;
        });
    }));

    afterEach(() => {
        vm = undefined;
    });

    describe("Feature: constructor", () => {

        beforeEach(() => {
            createViewModel(createMeetingConcern());
        });

        describe("WHEN the constructor is called", () => {
            it("THEN the Vm is created", () => {
                expect(vm).toBeDefined();
            });
            it("AND it has one action", () => {
                expect(vm.actions.length).toBe(1);
            });
            it("AND the action is called 'meetingcontacts.delete'", () => {
                expect(vm.actions[0].name).toBe("meetingcontacts.delete");
            });
            it("AND this action is disabled by default", () => {
                expect(vm.actions[0].isEnabled).toBeFalsy();
            });
            it("AND this action is hidden by default", () => {
                expect(vm.actions[0].isVisible).toBeFalsy();
            });
        });
    });

    describe("Feature: delete action state", () => {
        describe("WHEN the meeting of the contact is system", () => {

            beforeEach(() => {
                createViewModel(createMeetingConcern({
                    Meeting: {
                        IsSystem: true
                    }
                }));
            });

            it("THEN the action is not visible", () => {
                expect(vm.actions[0].isVisible).toBeFalsy();
            });
            it("THEN the action is disabled", () => {
                expect(vm.actions[0].isEnabled).toBeFalsy();
            });
        });
        describe("WHEN the meeting of the contact is NOT system", () => {

            describe("AND the user can edit the meeting", () => {
                beforeEach(() => {
                    createViewModel(createMeetingConcern({
                        Meeting: {
                            IsSystem: false,
                            UserAccessRight : {
                                CanEdit: true
                            }
                        }
                    }));
                });

                it("THEN the action is visible", () => {
                    expect(vm.actions[0].isVisible).toBeTruthy();
                });
            });
            describe("AND the user can edit all meetings", () => {
                beforeEach(() => {
                    currentProject.UserAccessRight.CanEditAllList = true;
                    createViewModel(createMeetingConcern({
                        Meeting: {
                            IsSystem: false,
                            UserAccessRight: {
                                CanEdit: false
                            }
                        },
                        User: {}
                    }));
                });

                it("THEN the action is visible", () => {
                    expect(vm.actions[0].isVisible).toBeTruthy();
                });
            });
        });

        describe("WHEN the action is on the current user", () => {

            beforeEach(() => {
                currentProject.UserAccessRight.CanEditAllList = true;
                createViewModel(createMeetingConcern({
                    Meeting: {
                        IsSystem: false,
                        UserAccessRight: {
                            CanEdit: true,
                            Level: 4
                        }
                    },
                    User: {
                        Id: "111"
                    }
                }));
            });

            it("THEN, the action is disabled", () => {
                expect(vm.actions[0].isEnabled).toBeFalsy();
            });            
        });

        describe("WHEN the access right level of the current user is lower than the contact to delete", () => {

            beforeEach(() => {
                currentProject.UserAccessRight.CanEditAllList = true;
                createViewModel(createMeetingConcern({
                    Meeting: {
                        IsSystem: false,
                        UserAccessRight: {
                            CanEdit: true,
                            Level: 1
                        }
                    },
                    User: {
                        Id: "111"
                    },
                    AccessRightLevel: 4
                }));
            });

            it("THEN, the action is disabled", () => {
                expect(vm.actions[0].isEnabled).toBeFalsy();
            });
        });

        describe("WHEN the contact to delete has the superAdminModule", () => {

            beforeEach(() => {
                currentProject.UserAccessRight.CanEditAllList = true;
                createViewModel(createMeetingConcern({
                    Meeting: {
                        IsSystem: false,
                        UserAccessRight: {
                            CanEdit: true,
                            Level: 4
                        }
                    },
                    User: {
                        Id: "111"
                    },
                    HasSuperAdminModule: true
                }));
            });

            it("THEN, the action is disabled", () => {
                expect(vm.actions[0].isEnabled).toBeFalsy();
            });
        });
    });

    describe("Feature: action click", () => {

        let meetingConcern: ap.models.meetings.MeetingConcern;

        beforeEach(() => {
            meetingConcern = createMeetingConcern();
            createViewModel(meetingConcern);

            spyOn(ContactController, "deleteMeetingContact");

            vm.actionClick("meetingcontacts.delete");
        });
        describe("WHEN actionClick is called with 'meetingcontacts.delete'", () => {
            it("THEN ContactController.deleteMeetingContact is called with the entity", () => {
                expect(ContactController.deleteMeetingContact).toHaveBeenCalledWith(meetingConcern);
            });
        });
    });
});
