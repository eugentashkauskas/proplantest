namespace ap.viewmodels.home {

    import MainFlow = ap.controllers.MainFlow;

    export class NavBarViewModel implements IDispose {
        /**
         * A reference to the current user of the application
         */
        public get currentUser(): ap.models.actors.User {
            return this.$scope.mainVm.currentUser;
        }

        /**
         * A list of menu items to render in the nav bar
         */
        public get menuItems(): NavBarItemViewModel[] {
            return this._menuItems;
        }

        /**
         * Determines whether a menu is collapsed or not
         */
        public get isMenuCollapsed(): boolean {
            return !this.$scope.menuState;
        }

        /**
         * Handler method when an item from the navigation bar is clicked
         * @param name a name of the clicked action
         */
        public itemClick(name: string) {
            let targetMenuItems = this.menuItems.filter((item) => {
                return item.itemName === name;
            });
            if (!targetMenuItems.length) {
                throw new Error("Unable to handle click on an action that doesn't present in the menu");
            }
            switch (name) {
                case "Meetings":
                    this._uIStateController.changeFlowState(ap.controllers.MainFlow.Meetings);
                    break;
                case "Points":
                    this._uIStateController.changeFlowState(ap.controllers.MainFlow.Points);
                    break;
                case "Forms":
                    this._uIStateController.changeFlowState(ap.controllers.MainFlow.Forms);
                    break;
                case "Documents":
                    this._uIStateController.changeFlowState(ap.controllers.MainFlow.Documents);
                    break;
                case "Contacts":
                    this._uIStateController.changeFlowState(ap.controllers.MainFlow.Contacts);
                    break;
                case "MeetingDocuments":
                    this._uIStateController.changeFlowState(ap.controllers.MainFlow.MeetingDocuments);
                    break;
                case "MeetingContacts":
                    this._uIStateController.changeFlowState(ap.controllers.MainFlow.MeetingContacts);
                    break;
                case "Dashboard":
                    this._uIStateController.changeFlowState(ap.controllers.MainFlow.Dashboard);
                    break;
                case "CompanyMembers":
                    this._uIStateController.changeFlowState(ap.controllers.MainFlow.CompanyMembers);
                    break;
                case "FormTemplates":
                    this._uIStateController.changeFlowState(ap.controllers.MainFlow.FormTemplates);
                    break;
            }
        }

        /**
         * Shows and hides the sidebar menu
         */
        public toggleMenu() {
            this.$scope.menuState = !this.$scope.menuState;
        }

        /**
         * Retrieves a list of menu sub-items, which are specific for the Entire project screen
         * @returns an ordered list of menu items specific for the Entire project screen
         */
        private getEntireProjectItems(): NavBarItemViewModel[] {

            let menuProject = [
                this.getMenuItem(MainFlow.Points),
                this.getMenuItem(MainFlow.Forms),
                this.getMenuItem(MainFlow.Documents),
                this.getMenuItem(MainFlow.Contacts)
            ];

            let hasDashboard = this._utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_DashBoard);
            if (hasDashboard) {
                menuProject.push(this.getMenuItem(MainFlow.Dashboard));
            }

            return menuProject;
        }

        /**
         * Builds a list of menu items for the Projects application section. This list depends on
         * a current position of the user in the application and available access rights.
         * @returns a complete list of menu items to show in the projects section of the application
         */
        private getProjectsMenu(): NavBarItemViewModel[] {
            let menu = [];

            if (this._mainController.currentProject() === null) {
                return menu;
            }

            let currentMeeting = this._mainController.currentMeeting;
            let hasMeetingModule = this._mainController.hasMeetingModule;

            if (hasMeetingModule) {
                menu.push(this.getMenuItem(MainFlow.Meetings));

                if (currentMeeting) { // meeting menu
                    menu.push(this.getMenuItem(MainFlow.Points));
                    menu.push(this.getMenuItem(MainFlow.Forms));

                    let hasMeetingDocuments = !currentMeeting.IsSystem;
                    if (hasMeetingDocuments) {
                        menu.push(this.getMenuItem(MainFlow.MeetingDocuments));
                    }

                    let hasMeetingContacts = this._utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_MeetingVisibility);
                    if (!currentMeeting.IsPublic && currentMeeting.IsSystem) {
                        hasMeetingContacts = false;
                    }
                    if (hasMeetingContacts) {
                        menu.push(this.getMenuItem(MainFlow.MeetingContacts));
                    }

                    let hasDashboard = this._utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_DashBoard);
                    if (hasDashboard) {
                        menu.push(this.getMenuItem(MainFlow.Dashboard));
                    }
                } else if (currentMeeting === null) {
                    // entire project
                    menu = menu.concat(this.getEntireProjectItems());
                }
            } else { // entire project
                menu = menu.concat(this.getEntireProjectItems());
            }

            return menu;
        }

        /**
         * Builds a list of menu items for the Settings application section.
         * @returns a complete list of menu items to show in the settings section of the application
         */
        private getSettingsMenu(): NavBarItemViewModel[] {
            return [
                this.getMenuItem(MainFlow.CompanyMembers),
                this.getMenuItem(MainFlow.FormTemplates)
            ];
        }

        /**
         * Updates a "visited" status of all registered menu items. Only a menu item which is related to
         * the current application screen will be marked as visible.
         */
        private updateMenuState() {
            for (let menuItem of this._menuItemsCache.values()) {
                menuItem.isVisited = MainFlow[this._uIStateController.mainFlowState] === menuItem.itemName;
            }
        }

        /**
         * Updates a list of available menu items depending on the current position of a user in
         * the application and available access rights. The menu is available through the menuItems
         * property.
         */
        private updateMenuItems() {
            let currentAppSection = this._uIStateController.appSection;

            if (currentAppSection === ap.controllers.AppSection.Projects) {
                this._menuItems = this.getProjectsMenu();
            } else if (currentAppSection === ap.controllers.AppSection.Settings) {
                this._menuItems = this.getSettingsMenu();
            } else {
                this._menuItems = [];
            }

            this.updateMenuState();
        }

        public dispose() {
            this._uIStateController.off("mainflowstatechanged", this.updateMenuItems, this);
            this._mainController.off("currentmeetingchanged", this.updateMenuItems, this);
            this._mainController.off("currentprojectchanged", this.updateMenuItems, this);

            let menuItems = this._menuItemsCache.values();
            for (let item of menuItems) {
                item.dispose();
            }
        }

        /**
         * Adds the given information about a menu item to the internal cache. This way all menu items
         * are predefined and can be instantly reused when it is needed.
         * @param flowState a target main flow state for this menu item to lead to
         * @param wideNameKey a translation key for the menu item label
         * @param iconSrc a url of the icon
         * @param isBeta an indicator of whether the given item should be marked as Beta
         */
        private registerMenuItem(flowState: MainFlow, titleKey: string, iconSrc: string, isBeta: boolean) {
            let item = new NavBarItemViewModel(this._utility, MainFlow[flowState], false, titleKey, "", iconSrc, true, isBeta);
            this._menuItemsCache.add(flowState, item);
        }

        /**
         * Retrieves a predefined menu item for the given main flow state.
         * @param flowState a target main flow state to retrieve a menu item for
         * @returns a predefined menu item or undefined if nothing is found
         */
        private getMenuItem(flowState: MainFlow): NavBarItemViewModel {
            return this._menuItemsCache.getValue(flowState);
        }

        static $inject = ["$scope", "$element", "UIStateController", "MainController", "Utility"];
        constructor(private $scope: ap.views.IMenuNavScope, private $element: angular.IAugmentedJQuery, private _uIStateController: ap.controllers.UIStateController, private _mainController: ap.controllers.MainController, private _utility: ap.utility.UtilityHelper) {
            this._menuItemsCache = new Dictionary<MainFlow, NavBarItemViewModel>();

            this.registerMenuItem(MainFlow.Meetings, "Lists", "../Images/html/icons/ic_assignment_black_36px.svg", false);
            this.registerMenuItem(MainFlow.Points, "", "../Images/html/icons/ic_list_black_36px.svg", false);
            this.registerMenuItem(MainFlow.Forms, "", "../Images/html/icons/ic_playlist_add_check_black_36px.svg", true);
            this.registerMenuItem(MainFlow.Documents, "", "../Images/html/icons/ic_insert_drive_file_black_36px.svg", false);
            this.registerMenuItem(MainFlow.Contacts, "Participants", "../Images/html/icons/ic_contacts_black_36px.svg", false);
            this.registerMenuItem(MainFlow.Dashboard, "", "../Images/html/icons/ic_insert_chart_black_24px.svg", false);
            this.registerMenuItem(MainFlow.MeetingDocuments, "Documents", "../Images/html/icons/ic_insert_drive_file_black_36px.svg", false);
            this.registerMenuItem(MainFlow.MeetingContacts, "Participants", "../Images/html/icons/ic_contacts_black_36px.svg", false);
            this.registerMenuItem(MainFlow.CompanyMembers, "Members", "../Images/html/icons/ic_group_black_48px.svg", false);
            this.registerMenuItem(MainFlow.FormTemplates, "", "../Images/html/icons/ic_description_black_48px.svg", false);

            this.updateMenuItems();

            this._uIStateController.on("mainflowstatechanged", this.updateMenuItems, this);
            this._mainController.on("currentmeetingchanged", this.updateMenuItems, this);
            this._mainController.on("currentprojectchanged", this.updateMenuItems, this);

            // Apply model changes to DOM
            let unregister = $scope.$watch("menuState", (newValue) => {
                if (newValue) {
                    $element.removeClass("menu-hide");
                } else {
                    $element.addClass("menu-hide");
                }
            });

            $scope.$on("$destroy", () => {
                this.dispose();

                if (unregister) {
                    unregister();
                }
            });
        }

        private _menuItems: NavBarItemViewModel[];
        private _menuItemsCache: Dictionary<MainFlow, NavBarItemViewModel>;
    }
}
