declare module jasmine {
    interface Matchers<T> {
        toBeNavBarItemFor(targetMainFlowState: ap.controllers.MainFlow): jasmine.CustomMatcher;
        toBeVisited(): jasmine.CustomMatcher;
    }
}

describe("Module ap-viewmodels - navBar", () => {
    var $controller: ng.IControllerService,
        vm: ap.viewmodels.home.NavBarViewModel,
        UIStateController: ap.controllers.UIStateController,
        MainController: ap.controllers.MainController,
        Utility: ap.utility.UtilityHelper,
        $scope: angular.IScope,
        $element: angular.IAugmentedJQuery,
        companyService: ap.services.CompanyService,
        $q: angular.IQService;

    var navBarItemMatchers = {
        /**
         * A custom Jasmine matcher to check that a given item is a valid menu item for the given main flow state
         */
        toBeNavBarItemFor: (util, customEqualityTesters) => {
            class NavBarItemDefinition {
                constructor(public titleKey: string, public iconSrc: string, public isBeta: boolean) {}
            }

            // A list of indirect indications of menu items for different main flow states. Only the most significant properties are taken into account.
            let navBarItemsDefinitions = new Dictionary<ap.controllers.MainFlow, NavBarItemDefinition>();
            navBarItemsDefinitions.add(ap.controllers.MainFlow.Meetings, new NavBarItemDefinition("Lists", "../Images/html/icons/ic_assignment_black_36px.svg", false));
            navBarItemsDefinitions.add(ap.controllers.MainFlow.Points, new NavBarItemDefinition("Points", "../Images/html/icons/ic_list_black_36px.svg", false));
            navBarItemsDefinitions.add(ap.controllers.MainFlow.Forms, new NavBarItemDefinition("Forms", "../Images/html/icons/ic_playlist_add_check_black_36px.svg", true));
            navBarItemsDefinitions.add(ap.controllers.MainFlow.Documents, new NavBarItemDefinition("Documents", "../Images/html/icons/ic_insert_drive_file_black_36px.svg", false));
            navBarItemsDefinitions.add(ap.controllers.MainFlow.Contacts, new NavBarItemDefinition("Participants", "../Images/html/icons/ic_contacts_black_36px.svg", false));
            navBarItemsDefinitions.add(ap.controllers.MainFlow.Dashboard, new NavBarItemDefinition("Dashboard", "../Images/html/icons/ic_insert_chart_black_24px.svg", false));
            navBarItemsDefinitions.add(ap.controllers.MainFlow.MeetingDocuments, new NavBarItemDefinition("Documents", "../Images/html/icons/ic_insert_drive_file_black_36px.svg", false));
            navBarItemsDefinitions.add(ap.controllers.MainFlow.MeetingContacts, new NavBarItemDefinition("Participants", "../Images/html/icons/ic_contacts_black_36px.svg", false));
            navBarItemsDefinitions.add(ap.controllers.MainFlow.CompanyMembers, new NavBarItemDefinition("Members", "../Images/html/icons/ic_group_black_48px.svg", false));
            navBarItemsDefinitions.add(ap.controllers.MainFlow.FormTemplates, new NavBarItemDefinition("FormTemplates", "../Images/html/icons/ic_description_black_48px.svg", false));

            return {
                compare: (actualItem: ap.viewmodels.home.NavBarItemViewModel, targetMainFlowState: ap.controllers.MainFlow): jasmine.CustomMatcherResult => {
                    let result: jasmine.CustomMatcherResult = { pass: false };

                    // Check type of the given menu item
                    if (!(actualItem instanceof ap.viewmodels.home.NavBarItemViewModel)) {
                        result.message = "Expected " + actualItem + " to be an instance of the NavBarItemViewModel class.";
                        return result;
                    }

                    // Check existence of the given menu item
                    let targetItem = navBarItemsDefinitions.getValue(targetMainFlowState);
                    if (!targetItem) {
                        result.message = "Unable to find a definition for the nav bar item related to the expected main flow state.";
                        return result;
                    }

                    // Check indirect indications of the given menu item
                    let errors = [];
                    if (actualItem.itemName !== ap.controllers.MainFlow[targetMainFlowState]) {
                        errors.push("expected the itemName property to equal \"" + ap.controllers.MainFlow[targetMainFlowState] + "\" but the actual value is \"" + actualItem.itemName + "\"");
                    }
                    if (actualItem.titleKey !== targetItem.titleKey) {
                        errors.push("expected the titleKey property to equal \"" + targetItem.titleKey + "\" but the actual value is \"" + actualItem.titleKey + "\"");
                    }
                    if (actualItem.iconSrc !== targetItem.iconSrc) {
                        errors.push("expected the iconSrc property to equal \"" + targetItem.iconSrc + "\" but the actual value is \"" + actualItem.iconSrc + "\"");
                    }
                    if (actualItem.isBeta !== targetItem.isBeta) {
                        errors.push("expected the isBeta property to equal \"" + (targetItem.isBeta ? "true" : "false") + "\" but the actual value is \"" + (actualItem.isBeta ? "true" : "false") + "\"");
                    }

                    if (errors.length) {
                        result.message = "Expected " + actualItem + " to be a nav bar item for the " + ap.controllers.MainFlow[targetMainFlowState] + " state. Failed expectations: " + errors.join(", ") + ".";
                    } else {
                        result.pass = true;
                        result.message = "Expected " + actualItem + " not to be a nav bar item for the " + ap.controllers.MainFlow[targetMainFlowState] + " state.";
                    }

                    return result;
                }
            }
        },

        /**
         * A custom Jasmine matcher to check that a given item is a visited menu item
         */
        toBeVisited: (util, customEqualityTesters) => {
            return {
                compare: (actualItem: ap.viewmodels.home.NavBarItemViewModel): jasmine.CustomMatcherResult => {
                    let result: jasmine.CustomMatcherResult = { pass: false };

                    if (!(actualItem instanceof ap.viewmodels.home.NavBarItemViewModel)) {
                        result.message = "Expected " + actualItem + " to be an instance of the NavBarItemViewModel class.";
                        return result;
                    }

                    if (actualItem.isVisited) {
                        result.pass = true;
                    } else {
                        result.message = "Expected a nav bar item " + actualItem.itemName + " to be visited.";
                    }

                    return result;
                },
                negativeCompare: (actualItem: ap.viewmodels.home.NavBarItemViewModel): jasmine.CustomMatcherResult => {
                    let result: jasmine.CustomMatcherResult = { pass: false };

                    if (!(actualItem instanceof ap.viewmodels.home.NavBarItemViewModel)) {
                        result.message = "Expected " + actualItem + " to be an instance of the NavBarItemViewModel class.";
                        return result;
                    }

                    if (!actualItem.isVisited) {
                        result.pass = true;
                    } else {
                        result.message = "Expected a nav bar item " + actualItem.itemName + " not to be visited.";
                    }

                    return result;
                }
            }
        }
    };

    beforeEach(() => {
        jasmine.addMatchers(navBarItemMatchers);

        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
        angular.mock.module("ap-services");
    });

    beforeEach(inject((_$rootScope_, _UIStateController_, _$controller_, _Utility_, _MainController_, _CompanyService_, _$q_) => {
        $controller = _$controller_;
        UIStateController = _UIStateController_;
        MainController = _MainController_;
        Utility = _Utility_;
        $scope = _$rootScope_.$new();
        $element = angular.element("<div></div>");
        companyService = _CompanyService_;
        $q = _$q_;
        specHelper.utility.stubUserConnected(Utility);
    }));

    afterEach(() => {
        $element.remove();
    });

    // Initializes the view model
    function createViewModel(): ap.viewmodels.home.NavBarViewModel {
        return <ap.viewmodels.home.NavBarViewModel>$controller("navBarViewModel", {
            $scope: $scope,
            $element: $element
        });
    }

    // Retrieves a menu item for the given main flow state
    function getMenuItemFor(targetFlowState: ap.controllers.MainFlow): ap.viewmodels.home.NavBarItemViewModel {
        let targetItemName = ap.controllers.MainFlow[targetFlowState];
        return vm.menuItems.filter((item) => {
            return item.itemName === targetItemName;
        })[0];
    }

    // Retrieves all menu items which are not related to the given main flow state
    function getMenuItemsExcept(excludedFlowState: ap.controllers.MainFlow): ap.viewmodels.home.NavBarItemViewModel[] {
        let targetItemName = ap.controllers.MainFlow[excludedFlowState];
        return vm.menuItems.filter((item) => {
            return item.itemName !== targetItemName;
        });
    }

    // Mocks an application environment to mimic a specific state(screen) of the application
    function setupEnvironment(currentProject: ap.models.projects.Project, currentMeeting: ap.models.meetings.Meeting, hasMeetingsModule: boolean, hasDashboardModule: boolean, appSection?: ap.controllers.AppSection) {
        spyOn(MainController, "currentProject").and.returnValue(currentProject);
        specHelper.general.spyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get).and.returnValue(currentMeeting);
        specHelper.general.spyProperty(ap.controllers.MainController.prototype, "hasMeetingModule", specHelper.PropertyAccessor.Get).and.returnValue(hasMeetingsModule);
        if (appSection !== undefined) {
            specHelper.general.spyProperty(ap.controllers.UIStateController.prototype, "appSection", specHelper.PropertyAccessor.Get).and.returnValue(appSection);
        }
    }

    // Clears created mocks of an application environment
    function tearDownEnvironment() {
        specHelper.general.offSpyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get);
        specHelper.general.offSpyProperty(ap.controllers.MainController.prototype, "hasMeetingModule", specHelper.PropertyAccessor.Get);
        specHelper.general.offSpyProperty(ap.controllers.UIStateController.prototype, "appSection", specHelper.PropertyAccessor.Get);
    }

    describe("Feature: Default values of NavBarItemViewModel", () => {
        it("can get an instance of NavBarItemViewModel with the default values", () => {
            let navBaritem: ap.viewmodels.home.NavBarItemViewModel = new ap.viewmodels.home.NavBarItemViewModel(Utility);

            expect(navBaritem.iconSrc).toBe("");
            expect(navBaritem.isVisible).toBeFalsy();
            expect(navBaritem.isVisited).toBeFalsy();
            expect(navBaritem.itemName).toBe("");
            expect(navBaritem.title).toBe("[]"); // There is no translation for the empty key
            expect(navBaritem.titleKey).toBe("");
        });
    });

    describe("Feature: Default values", () => {
        it("can get an instance of my factory with default values", () => {
            vm = createViewModel();
            expect(vm).toBeDefined();
        });
    });

    describe("Feature: MainFlowStateChanged ", () => {
        // Checks that the menu contains exactly the given amount of items
        function checkMenuItemsCount(count: number) {
            it("THEN a menu contains " + count + " item(s)", () => {
                expect(vm.menuItems.length).toEqual(count);
            });
        }

        // Checks that the menu contains exactly the given menu items in the given order
        function checkMenuStructure(targetStructure: ap.controllers.MainFlow[]) {
            checkMenuItemsCount(targetStructure.length);
            it("THEN menu items are sorted in a correct order", () => {
                for (let i = 0, len = targetStructure.length; i < len; i++) {
                    expect(vm.menuItems[i]).toBeNavBarItemFor(targetStructure[i]);
                }
            });
        }

        // Checks that the menu contains menu items related to the Entire project state of the application
        // (points, document, contacts, etc)
        function checkMenuStructureForEntireProject(withMeetings: boolean) {
            let structure = [
                ap.controllers.MainFlow.Points,
                ap.controllers.MainFlow.Forms,
                ap.controllers.MainFlow.Documents,
                ap.controllers.MainFlow.Contacts,
            ];
            if (withMeetings) {
                structure.unshift(ap.controllers.MainFlow.Meetings);
            }
            checkMenuStructure(structure);
        }

        // Checks that the menu contains menu items related to the Meeting states of the application
        // (points, meeting documents, meeting contacts, etc)
        function checkMenuStructureForMeeting(withContacts: boolean, withDashboard: boolean) {
            let structure = [
                ap.controllers.MainFlow.Meetings,
                ap.controllers.MainFlow.Points,
                ap.controllers.MainFlow.Forms,
                ap.controllers.MainFlow.MeetingDocuments
            ];
            if (withContacts) {
                structure.push(ap.controllers.MainFlow.MeetingContacts);
            }
            if (withDashboard) {
                structure.push(ap.controllers.MainFlow.Dashboard);
            }
            checkMenuStructure(structure);
        }

        // Checks that the menu contains menu items related to the Settings states of the application
        function checkMenuStructureForSettings() {
            let structure = [
                ap.controllers.MainFlow.CompanyMembers,
                ap.controllers.MainFlow.FormTemplates
            ];
            checkMenuStructure(structure);
        }

        // Checks that only a menu item for the given main flow state is marked as visited
        function checkSingleItemSelection(selectedFlowState: ap.controllers.MainFlow) {
            it("THEN a menu item for the " + ap.controllers.MainFlow[selectedFlowState] + " screen is selected", () => {
                let menuItem = getMenuItemFor(selectedFlowState);
                expect(menuItem).toBeVisited();
            });
            it("THEN all menu items except the one for the " + ap.controllers.MainFlow[selectedFlowState] + " screen are not selected", () => {
                let otherMenuItems = getMenuItemsExcept(selectedFlowState);
                for (let item of otherMenuItems) {
                    expect(item).not.toBeVisited();
                }
            });
        }

        describe("WHEN UIStateController has MainFlow in 'Login' and was previously in another state", () => {
            beforeEach(() => {
                vm = createViewModel();
                UIStateController.changeFlowState(ap.controllers.MainFlow.CreateAccount);
                UIStateController.changeFlowState(ap.controllers.MainFlow.Login);
            });
            it("THEN a menu is empty", () => {
                expect(vm.menuItems.length).toEqual(0);
            });
        });

        describe("WHEN UIStateController has MainFlow in 'CreateAccount'", () => {
            beforeEach(() => {
                vm = createViewModel();
                UIStateController.changeFlowState(ap.controllers.MainFlow.CreateAccount);
            });
            it("THEN a menu is empty", () => {
                expect(vm.menuItems.length).toEqual(0);
            });
        });

        describe("WHEN UIStateController has MainFlow in 'Projects'", () => {
            beforeEach(() => {
                spyOn(MainController, "currentProject").and.returnValue(null);

                vm = createViewModel();
                UIStateController.changeFlowState(ap.controllers.MainFlow.Projects);
            });
            it("THEN a menu is empty", () => {
                expect(vm.menuItems.length).toEqual(0);
            });
        });

        describe("WHEN UIStateController has MainFlow in 'Meetings'", () => {
            beforeEach(() => {
                setupEnvironment(new ap.models.projects.Project(Utility), undefined, true, true);
                vm = createViewModel();
                UIStateController.changeFlowState(ap.controllers.MainFlow.Meetings);
            });
            afterEach(tearDownEnvironment);
            
            it("THEN a menu contains 1 item", () => {
                expect(vm.menuItems.length).toEqual(1);
            });
            it("THEN menu items are sorted in a correct order", () => {
                expect(vm.menuItems[0]).toBeNavBarItemFor(ap.controllers.MainFlow.Meetings);
            });
            it("THEN a menu item for the Meetings screen is selected", () => {
                let menuItem = getMenuItemFor(ap.controllers.MainFlow.Meetings);
                expect(menuItem).toBeVisited();
            });
            it("THEN all menu items except the one for the Documents screen are not selected", () => {
                let otherMenuItems = getMenuItemsExcept(ap.controllers.MainFlow.Meetings);
                for (let item of otherMenuItems) {
                    expect(item).not.toBeVisited();
                }
            });
        });

        describe("WHEN a user navigates through an entire project (user has not access to meeting module)", () => {
            let entireProjectScreens = [
                ap.controllers.MainFlow.Points,
                ap.controllers.MainFlow.Forms,
                ap.controllers.MainFlow.Documents,
                ap.controllers.MainFlow.Contacts,
            ];

            for (let screen of entireProjectScreens) {
                describe("AND UIStateController has MainFlow in '" + ap.controllers.MainFlow[screen] + "'", () => {
                    beforeEach(() => {
                        setupEnvironment(new ap.models.projects.Project(Utility), undefined, false, false);
                        vm = createViewModel();
                        UIStateController.changeFlowState(screen);
                    });
                    afterEach(tearDownEnvironment);

                    checkMenuStructureForEntireProject(false);
                    checkSingleItemSelection(screen);
                });
            }
        });

        describe("WHEN a user navigates through an entire project (user has access to meeting module)", () => {
            let entireProjectScreens = [
                ap.controllers.MainFlow.Points,
                ap.controllers.MainFlow.Forms,
                ap.controllers.MainFlow.Documents,
                ap.controllers.MainFlow.Contacts,
            ];

            for (let screen of entireProjectScreens) {
                describe("AND UIStateController has MainFlow in '" + ap.controllers.MainFlow[screen] + "'", () => {
                    beforeEach(() => {
                        setupEnvironment(new ap.models.projects.Project(Utility), null, true, true);
                        vm = createViewModel();
                        UIStateController.changeFlowState(screen);
                    });
                    afterEach(tearDownEnvironment);

                    checkMenuStructureForEntireProject(true);
                    checkSingleItemSelection(screen);
                });
            }
        });

        describe("WHEN a user navigates through a selected meeting", () => {
            let entireProjectScreens = [
                ap.controllers.MainFlow.Points,
                ap.controllers.MainFlow.Forms,
                ap.controllers.MainFlow.MeetingDocuments,
                ap.controllers.MainFlow.MeetingContacts,
            ];

            for (let screen of entireProjectScreens) {
                describe("AND UIStateController has MainFlow in '" + ap.controllers.MainFlow[screen] + "'", () => {
                    beforeEach(() => {
                        setupEnvironment(new ap.models.projects.Project(Utility), new ap.models.meetings.Meeting(Utility), true, true);
                        spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.returnValue(true);
                        vm = createViewModel();
                        UIStateController.changeFlowState(screen);
                    });
                    afterEach(tearDownEnvironment);

                    checkMenuStructureForMeeting(true, true);
                    checkSingleItemSelection(screen);
                });

                if (screen !== ap.controllers.MainFlow.MeetingContacts) {
                    describe("AND UIStateController has MainFlow in '" + ap.controllers.MainFlow[screen] + "' and MeetingContacts state is not available", () => {
                        beforeEach(() => {
                            setupEnvironment(new ap.models.projects.Project(Utility), new ap.models.meetings.Meeting(Utility), true, true);
                            spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake((accessRight) => {
                                return accessRight !== ap.models.licensing.Module.Module_MeetingVisibility;
                        });
                            vm = createViewModel();
                            UIStateController.changeFlowState(screen);
                        });
                        afterEach(tearDownEnvironment);

                        checkMenuStructureForMeeting(false, true);
                        checkSingleItemSelection(screen);
                    });
                }

                if (screen !== ap.controllers.MainFlow.Dashboard) {
                    describe("AND UIStateController has MainFlow in '" + ap.controllers.MainFlow[screen] + "' and Dashboard state is not available", () => {
                        beforeEach(() => {
                            setupEnvironment(new ap.models.projects.Project(Utility), new ap.models.meetings.Meeting(Utility), true, true);
                            spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake((accessRight) => {
                                return accessRight !== ap.models.licensing.Module.Module_DashBoard;
                            });
                            vm = createViewModel();
                            UIStateController.changeFlowState(screen);
                        });
                        afterEach(tearDownEnvironment);

                        checkMenuStructureForMeeting(true, false);
                        checkSingleItemSelection(screen);
                    });
                }
            }
        });

        describe("WHEN a user navigates through a Settings section of the application", () => {
            let settingsScreens = [
                ap.controllers.MainFlow.CompanyMembers,
                ap.controllers.MainFlow.FormTemplates
            ];

            for (let screen of settingsScreens) {
                describe("AND UIStateController has MainFlow in '" + ap.controllers.MainFlow[screen] + "'", () => {
                    beforeEach(() => {
                        spyOn(companyService, "getManagedCompany").and.returnValue($q.defer().promise);
                        vm = createViewModel();
                        UIStateController.changeFlowState(screen);
                    });

                    checkMenuStructureForSettings();
                    checkSingleItemSelection(screen);
                });
            }
        });
    });

    describe("Feature: itemClick", () => {
        beforeEach(() => {
            spyOn(UIStateController, "changeFlowState").and.stub();
        });

        describe("WHEN itemClick is called for unknown menu item", () => {
            it("THEN an exception is thrown", () => {
                expect(() => {
                    vm.itemClick("SomeUnknownItemName");
                }).toThrowError("Unable to handle click on an action that doesn't present in the menu");
            });
        });

        describe("WHEN application is at the meeting selection screen", () => {
            beforeEach(() => {
                setupEnvironment(new ap.models.projects.Project(Utility), undefined, true, true, ap.controllers.AppSection.Projects);
                vm = createViewModel();
            });
            afterEach(tearDownEnvironment);

            describe("WHEN itemClick is called with 'Meetings' parameter", () => {
                it("THEN, the UIStateController.setMainFlowState is called with the enum Projects and the corresponding item is selected", () => {
                    vm.itemClick("Meetings");
                    expect(UIStateController.changeFlowState).toHaveBeenCalledWith(ap.controllers.MainFlow.Meetings);
                });
            });
        });

        describe("WHEN application is at the entire project screen", () => {
            beforeEach(() => {
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.returnValue(true);
                setupEnvironment(new ap.models.projects.Project(Utility), null, true, true, ap.controllers.AppSection.Projects);
                vm = createViewModel();
            });
            afterEach(tearDownEnvironment);

            describe("WHEN itemClick is called with 'Meetings' parameter", () => {
                it("THEN, the UIStateController.setMainFlowState is called with the enum Meetings and the corresponding item is selected", () => {
                    vm.itemClick("Meetings");
                    expect(UIStateController.changeFlowState).toHaveBeenCalledWith(ap.controllers.MainFlow.Meetings);
                });
            });
            describe("WHEN itemClick is called with 'Points' parameter", () => {
                it("THEN, the UIStateController.setMainFlowState is called with the enum Points and the corresponding item is selected", () => {
                    vm.itemClick("Points");
                    expect(UIStateController.changeFlowState).toHaveBeenCalledWith(ap.controllers.MainFlow.Points);
                });
            });
            describe("WHEN itemClick is called with 'Forms' parameter", () => {
                it("THEN, the UIStateController.setMainFlowState is called with the enum Forms and the corresponding item is selected", () => {
                    vm.itemClick("Forms");
                    expect(UIStateController.changeFlowState).toHaveBeenCalledWith(ap.controllers.MainFlow.Forms);
                });
            });
            describe("WHEN itemClick is called with 'Documents' parameter", () => {
                it("THEN, the UIStateController.setMainFlowState is called with the enum Documents and the corresponding item is selected", () => {
                    vm.itemClick("Documents");
                    expect(UIStateController.changeFlowState).toHaveBeenCalledWith(ap.controllers.MainFlow.Documents);
                });
            });
            describe("WHEN itemClick is called with 'Contacts' parameter", () => {
                it("THEN, the UIStateController.setMainFlowState is called with the enum Contacts and the corrensponding item is selected", () => {
                    vm.itemClick("Contacts");
                    expect(UIStateController.changeFlowState).toHaveBeenCalledWith(ap.controllers.MainFlow.Contacts);
                });
            });
            describe("WHEN itemClick is called with 'Dashboard' parameter", () => {
                it("THEN, the UIStateController.setMainFlowState is called with the enum Dashboard and the corrensponding item is selected", () => {
                    vm.itemClick("Dashboard");
                    expect(UIStateController.changeFlowState).toHaveBeenCalledWith(ap.controllers.MainFlow.Dashboard);
                });
            });
        });

        describe("WHEN application is at the meeting screen", () => {
            beforeEach(() => {
                setupEnvironment(new ap.models.projects.Project(Utility), new ap.models.meetings.Meeting(Utility), true, true, ap.controllers.AppSection.Projects);
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.returnValue(true);
                vm = createViewModel();
            });
            afterEach(tearDownEnvironment);

            describe("WHEN itemClick is called with 'Meetings' parameter", () => {
                it("THEN, the UIStateController.setMainFlowState is called with the enum Meetings and the corresponding item is selected", () => {
                    vm.itemClick("Meetings");
                    expect(UIStateController.changeFlowState).toHaveBeenCalledWith(ap.controllers.MainFlow.Meetings);
                });
            });
            describe("WHEN itemClick is called with 'Points' parameter", () => {
                it("THEN, the UIStateController.setMainFlowState is called with the enum Points and the corresponding item is selected", () => {
                    vm.itemClick("Points");
                    expect(UIStateController.changeFlowState).toHaveBeenCalledWith(ap.controllers.MainFlow.Points);
                });
            });
            describe("WHEN itemClick is called with 'Forms' parameter", () => {
                it("THEN, the UIStateController.setMainFlowState is called with the enum Forms and the corresponding item is selected", () => {
                    vm.itemClick("Forms");
                    expect(UIStateController.changeFlowState).toHaveBeenCalledWith(ap.controllers.MainFlow.Forms);
                });
            });
            describe("WHEN itemClick is called with 'MeetingDocuments' parameter", () => {
                it("THEN, the UIStateController.setMainFlowState is called with the enum MeetingDocuments and the corresponding item is selected", () => {
                    vm.itemClick("MeetingDocuments");
                    expect(UIStateController.changeFlowState).toHaveBeenCalledWith(ap.controllers.MainFlow.MeetingDocuments);
                });
            });
            describe("WHEN itemClick is called with 'MeetingContacts' parameter", () => {
                it("THEN, the UIStateController.setMainFlowState is called with the enum MeetingContacts and the corrensponding item is selected", () => {
                    vm.itemClick("MeetingContacts");
                    expect(UIStateController.changeFlowState).toHaveBeenCalledWith(ap.controllers.MainFlow.MeetingContacts);
                });
            });
            describe("WHEN itemClick is called with 'Dashboard' parameter", () => {
                it("THEN, the UIStateController.setMainFlowState is called with the enum Dashboard and the corrensponding item is selected", () => {
                    vm.itemClick("Dashboard");
                    expect(UIStateController.changeFlowState).toHaveBeenCalledWith(ap.controllers.MainFlow.Dashboard);
                });
            });
        });

        describe("WHEN application is at the settings screen", () => {
            beforeEach(() => {
                setupEnvironment(null, undefined, true, true, ap.controllers.AppSection.Settings);
                vm = createViewModel();
            });
            afterEach(tearDownEnvironment);

            describe("WHEN itemClick is called with 'CompanyMembers' parameter", () => {
                it("THEN, the UIStateController.setMainFlowState is called with the enum CompanyMembers and the corrensponding item is selected", () => {
                    vm.itemClick("CompanyMembers");
                    expect(UIStateController.changeFlowState).toHaveBeenCalledWith(ap.controllers.MainFlow.CompanyMembers);
                });
            });

            describe("WHEN itemClick is called with 'FormTemplates' parameter", () => {
                it("THEN, the UIStateController.setMainFlowState is called with the enum FormTemplates and the corrensponding item is selected", () => {
                    vm.itemClick("FormTemplates");
                    expect(UIStateController.changeFlowState).toHaveBeenCalledWith(ap.controllers.MainFlow.FormTemplates);
                });
            });
        });
    });

    describe("Feature: events handling", () => {
        beforeEach(() => {
            vm = createViewModel();
        });

        describe("WHEN the currentprojectchanged event is raised", () => {
            it("THEN a menu is updated", () => {
                let oldMenu = vm.menuItems;
                specHelper.general.raiseEvent(MainController, "currentprojectchanged", null);
                expect(vm.menuItems).not.toBe(oldMenu);
            });
        });

        describe("WHEN the currentmeetingchanged event is raised", () => {
            it("THEN a menu is updated", () => {
                let oldMenu = vm.menuItems;
                specHelper.general.raiseEvent(MainController, "currentmeetingchanged", null);
                expect(vm.menuItems).not.toBe(oldMenu);
            });
        });

        describe("WHEN a mainflowstatechanged is raised", () => {
            it("THEN a menu is updated", () => {
                let oldMenu = vm.menuItems;
                specHelper.general.raiseEvent(UIStateController, "mainflowstatechanged", new ap.controllers.MainFlowStateEvent(null, null));
                expect(vm.menuItems).not.toBe(oldMenu);
            });
        });
    });
});
