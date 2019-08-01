namespace ap.viewmodels {

    import ActionViewModel = ap.viewmodels.home.ActionViewModel;
    import SubActionViewModel = ap.viewmodels.home.SubActionViewModel;

    export class MainViewModel {
        public isShowingBusy: boolean = false;
        public busyMessage: string = "Loading";
        public isOpenAddActions: boolean = false;
        public isNavDrawerOpened: boolean = true;
        public helloUser: string = "";
        public needLogin: boolean = false;

        /**
        * Used to know if the browser is IE
        **/
        public get isIE(): boolean {
            return this.$utility.isIE();
        }

        /**
        * Method used to go to the login screen
        **/
        public goToLogin() {
            this.$state.go("login");
        }

        /**
        * Method used to go to the APROPLAN FAQ
        **/
        public gotoFAQ() {
            this.$utility.openPopup("https://aproplan.zendesk.com/hc/en-us");

            let paramValue: string = ap.controllers.MainFlow[this._controllersManager.uiStateController.mainFlowState];
            this.$servicesManager.toolService.sendEvent("cli-menu-view faq", new Dictionary([new KeyValue("cli-menu-view faq-screenname", paramValue)]));
        }

        /**
        * Method used to go to Silverlight app
        **/
        public gotoPreviousVersion() {
            this.$utility.openPopup(this.$utility.rootUrl + "old");
        }

        /**
        * This property is show if editmode is opened
        **/
        public get isEditMode(): boolean {
            let isEditModeEnabled: boolean = false;
            if (this._controllersManager.mainController.currentVisibleScreens && this._controllersManager.mainController.currentVisibleScreens.length !== 0) {
                this._controllersManager.mainController.currentVisibleScreens.forEach((screenStep: controllers.ScreenStep) => {
                    if (screenStep.screen.isEditMode)
                        isEditModeEnabled = true;
                });
            }
            return isEditModeEnabled;
        }

        /**
         * Close menu on type Escape button
         * @param event type event
         * @param callback close menu function
         */
        public checkButtonType(event, callback) {
            if (event.which === 27)
                callback(event);
        }

        /**
        * To know the messge (mdPanel) is showing
        **/
        public isShowingMessageDialog = false;

        /**
            This method use to count how many items can be visible on UI
            for instance: this is use on binding main menu to hind a part if there is not visible items (_LayoutSPA.cshtml)
        */
        public get visibleMainActionsCount(): number {
            let result = 0;
            if (this.mainActionScreen) {
                if (this.mainActionScreen.actions && this.mainActionScreen.actions.length > 0) {
                    for (let i = 0; i < this.mainActionScreen.actions.length; i++) {
                        let action = <ActionViewModel>this.mainActionScreen.actions[i];
                        if (action.isVisible) result++;
                    }
                }
            }
            return result;
        }

        /**
         * This is the action to manage the action of the detail part of the application
         **/
        public detailActions: ActionViewModel[] = [];

        /**
        * This is to know the screens the user can see on the browser
        **/
        public get visibleScreens(): ap.controllers.ScreenStep[] {
            return this._visibleScreens;
        }

        /**
        * This method use to know if there is a meeting module
        **/
        public get hasMeetingModule(): boolean {
            return this._controllersManager.mainController.hasMeetingModule;
        }

        public get mainSearchInfo(): ap.misc.MainSearchInfo {
            return this._mainSearchInfo;
        }

        /**
         * This property is to know the current project
         **/
        public get currentProject(): ap.models.projects.Project {
            return this._controllersManager.mainController.currentProject();
        }
        /**
         * This property is to know the current meeting
         **/
        public get currentMeeting(): ap.models.meetings.Meeting {
            return this._controllersManager.mainController.currentMeeting;
        }

        /**
        * This property is to know the current company
        **/
        public get currentCompany(): ap.models.actors.ManagedCompany {
            return this._controllersManager.companyController.managedCompany;
        }

        /**
         * This property is to know if we are in mutliaction mode or not
         **/
        public get isMultiActionMode(): boolean {
            return this._controllersManager.mainController.isMultiActionMode;
        }

        /**
         * This property is to know the multiAction active on the current module opened. This view model should be managed by the workspace.
         * To define it, you need to call the gotoMultiActionsMode method
         **/
        public get multiActions(): MultiActionsViewModel {
            return this._controllersManager.mainController.multiActions;
        }

        /**
        * Return download queue list viewmodel instance
        **/
        public get downloadQueueListVm() {
            return this._downloadQueueListVm;
        }

        /**
         * The application can display list or detail of entities. Depending of screen size, it is not possible to display both part then, this flag is to know if the application
         * is showing the detail part in full screen
         **/
        public get isFullDetailMode(): boolean {
            if (this._controllersManager.mainController.currentVisibleScreens.length === 1 && this._controllersManager.mainController.currentVisibleScreens[0].screen.isFullScreen === true) {
                return true;
            }

            if (this._controllersManager.mainController.currentVisibleScreens && this._controllersManager.mainController.currentVisibleScreens.length > 0 && this.visibleScreens.length < this._controllersManager.mainController.currentVisibleScreens.length) {
                return true;
            } else {
                return this._controllersManager.mainController.isFullDetailMode;
            }
        }

        /**
         * Generally the application display list of entities or the detail of one entity. The list and detail part can be displayed at the same time.
         * This flag is to know if the detail part is opened
         **/
        public get isDetailMode(): boolean {
            return this._controllersManager.mainController.isDetailMode;
        }

        /**
         * This flag is set to true is the size of the app corresponds to the size of a smartphone
         **/
        public get isSmartphone(): boolean {
            return this._controllersManager.mainController.isSmartphone;
        }

        /**
         * This flag is set to true is the size of the app corresponds to the size of a tablet
         **/
        public get isTablet(): boolean {
            return this._controllersManager.mainController.isTablet;
        }

        /**
         * This flag is set to true is the size of the app corresponds to the size of a desktop
         **/
        public get isDesktop(): boolean {
            return this._controllersManager.mainController.isDesktop;
        }

        /**
         * This flag is set to true is the size of the app corresponds to the size of a desktop
         **/
        public get isSafari(): boolean {
            return this.$utility.isSafari();
        }

        /*
        * Property to know if the current flow is documents
        */
        public get isDocumentsState(): any {
            return this._controllersManager.mainController.uiStateController.mainFlowState === ap.controllers.MainFlow.Documents;
        }

        /**
        * This is the action to manage the action to display in the + button of material design.
        **/
        public get addAction(): ActionViewModel {
            return this._addAction;
        }

        public get showQueueDocumentAction(): ActionViewModel {
            return this._showQueueDocumentAction;
        }

        public get appSection(): ap.controllers.AppSection {
            return this._controllersManager.uiStateController.appSection;
        }

        public get isCompanyModule(): boolean {
            return this._isCompanyModule;
        }

        /** 
         * This method is called from the button back when a detail is diplayed.
         **/
        public goBackToScreen(): void {
            this._controllersManager.mainController.goBackToScreen();
        }

        /**
         * This method is used to go to the mutli actions mode
         * @param multiActions This parameter is to define the mutliaction view model of the current workspace.
         **/
        public gotoMultiActionsMode(multiActions: MultiActionsViewModel) {
            this._controllersManager.mainController.gotoMultiActionsMode(multiActions);
        }

        /**
         * This method should be used to goback from the multi actions mode.
         **/
        public closeMultiActionsMode() {
            this._controllersManager.mainController.closeMultiActionsMode();
        }

        private logingCompletedHandler(args: ap.controllers.LoginCompletedEvent) {
            let currentUser = this.$utility.UserContext.CurrentUser();
            // We will preload here some template we use often to have increase performance.
            this.$utility.TemplatesPreloader.loadInstantly("me/PartialView?module=Report&name=PointReportDialog");
            this.$utility.TemplatesPreloader.loadInstantly("me/Note?name=AddEditNoteDialog");
            this.$utility.TemplatesPreloader.loadInstantly("me/PartialView?module=Document&name=AddNewDocumentDialog");

            this.$utility.TemplatesPreloader.loadWhenIdle(ap.utility.templateList);

            let isInFogotPass = false;
            if (args.params && (args.params instanceof ap.misc.BootAppInfo) === false) {
                isInFogotPass = true; // this is surely in mode forgot password
            }

            this.needLogin = isInFogotPass || this._controllersManager.uiStateController.mainFlowState === ap.controllers.MainFlow.ForgottenPassword;

            this.helloUser = this.$utility.Translator.getTranslation("HelloLogin").format(currentUser.DisplayName);

            if (!this.needLogin) {
                if (args.loginType === ap.controllers.LoginType.SESSION) {
                    this._controllersManager.massExportController.getMassExportConfigurations().then((massExportList: ap.models.massExport.MassExportConfiguration[]) => {
                        massExportList.forEach((massExport: ap.models.massExport.MassExportConfiguration) => this.initDownloadItem(massExport));
                        this._showQueueDocumentAction.isVisible = this._downloadQueueListVm.count > 0;
                    });
                } else if (this.$utility.UserContext.MassExportConfigurations) {
                    this.$utility.UserContext.MassExportConfigurations.forEach((massExport: ap.models.massExport.MassExportConfiguration) => this.initDownloadItem(massExport));
                    this._showQueueDocumentAction.isVisible = this._downloadQueueListVm.count > 0;
                }
            }

            this.$utility.Title.setTitle("APROPLAN (" + currentUser.DisplayName + ")");
            this.initializeCalendar();
        }

        private subscribeEvents(): void {
            this._controllersManager.mainController.on("createAccount", () => {
                this.$location.path("/createAccount");
            }, this);

            this._controllersManager.mainController.on("showmessage", (param: string) => {
                this.showDialog(undefined, param);
            }, this);

            this._controllersManager.mainController.on("showerror", (param: string) => {
                this.showDialog(undefined, param);
            }, this);

            this._controllersManager.mainController.on("showbusy", (param: string) => {
                this._showBusyCount++;
                if (param && param !== "")
                    this.busyMessage = param;
                if (!this.isShowingBusy) {
                    // cancel the timeout and hide
                    if (this._hideTimeout) {
                        this.$timeout.cancel(this._hideTimeout);
                        delete this._hideTimeout;
                        this._hideTimeout = undefined;
                    }
                    // if no timeout is runnning
                    if (!this._timeoutBusy) {
                        let self: ap.viewmodels.MainViewModel = this;
                        this._timeoutBusy = this.$timeout(() => {
                            if (!self.isShowingBusy && self._showBusyCount > 0) {
                                self.isShowingBusy = true;
                                delete self._timeoutBusy;
                                self._timeoutBusy = undefined;
                            }
                        }, 600);
                    }
                }
            }, this);

            this._controllersManager.mainController.on("hidebusy", () => {
                if (this._showBusyCount === 0)
                    return;

                this._showBusyCount--;

                if (this._showBusyCount === 0) {
                    // hide if showing
                    this.busyMessage = "Loading";
                    if (this.isShowingBusy) {
                        let self: ap.viewmodels.MainViewModel = this;

                        let hide = () => {
                            if (self._timeoutBusy) {
                                self.$timeout.cancel(self._timeoutBusy);
                                delete self._timeoutBusy;
                                self._timeoutBusy = undefined;
                            }

                            self.isShowingBusy = false;
                        };

                        hide();
                        this._hideTimeout = this.$timeout(() => {
                            hide();
                        }, 600);
                    }
                    // delete timeout of showBusy if not actually active
                    else if (this._timeoutBusy) {
                        delete this._timeoutBusy; // jshint ignore:line
                        this._timeoutBusy = undefined;
                    }
                }
            }, this);

            this._controllersManager.mainController.on("detailactionschanged", () => {
                this.detailActions = this._controllersManager.mainController.detailActions;
            }, this);

            this._controllersManager.mainController.on("currentscreenchanged", () => {
                this.loadScreen();
            }, this);

            this._controllersManager.mainController.on("matchmediachanged", () => {
                this.loadScreen();
            }, this);

            this._controllersManager.mainController.on("showtoast", (param: any) => {
                if (!this._controllersManager.uiStateController.isLogin()) {
                    return;
                }

                let toastController = ($scope: angular.IScope, $mdToast: angular.material.IToastService) => {
                    $scope["closeToast"] = () => {
                        $mdToast.hide();
                        if (param.defferred && param.defferred !== null)
                            param.defferred.reject();
                    };
                    $scope["mainActionClick"] = () => {
                        $mdToast.hide();
                        if (param.defferred && param.defferred !== null)
                            param.defferred.resolve(param.mainActionParam);
                    };
                    $scope["navigateActionClick"] = () => {
                        $mdToast.hide();
                        if (param.navigateParams && param.navigateParams.isNavigate) {
                            if (param.navigateParams.isCustomNavigate) {
                                if (param.defferred && param.defferred !== null)
                                    param.defferred.resolve(true);
                            } else {
                                this._controllersManager.uiStateController.changeFlowState(param.navigateParams.navigateTo);
                            }
                        }
                    };
                    let translatedMessage: string = this.$utility.Translator.getTranslation(param.messageKey);
                    let message: string = translatedMessage.format.apply(translatedMessage, param.messageKeyParams);
                    $scope["message"] = message;
                    if (param.mainActionKey && param.mainActionKey !== null && this._controllersManager.mainController.currentProject())
                        $scope["mainAction"] = this.$utility.Translator.getTranslation(param.mainActionKey);
                    if (param.navigateParams && param.navigateParams !== null && param.navigateParams.navigateKey) {
                        $scope["navigateMessageLink"] = this.$utility.Translator.getTranslation(param.navigateParams.navigateKey);
                    }
                    $scope["isNavigate"] = param.navigateParams ? param.navigateParams.isNavigate : false;
                    $scope["isShowClose"] = param.isShowClose;
                };
                toastController.$inject = ["$scope", "$mdToast"];

                this.$mdToast.show({
                    hideDelay: param.isAutoClose && param.isShowClose ? 0 : 5000,
                    position: "bottom left",
                    templateUrl: "me/PartialView?module=Components&name=genericToast",
                    controller: toastController
                });
            }, this);

            this._controllersManager.mainController.on("downloadqueuerequested", this.handlerRequestDownloadQueue, this);

            this._controllersManager.authenticateController.on("logoutcompleted", (evt) => {
                this.needLogin = true;
                this.helloUser = "";
                this.clearDownloadQueueList();
                this.$location.path("/login");
                this.$utility.Title.setTitle("APROPLAN");
                this.$mdToast.hide();
                this._controllersManager.reportController.unregisterAllReportRequestStatusRefresh();
            }, this);

            this._controllersManager.authenticateController.on("changepasswordrequest", (evt: ap.controllers.ChangePasswordRequestEvent) => {
                let changpasswordVM: ap.viewmodels.home.ChangePasswordViewModel = new ap.viewmodels.home.ChangePasswordViewModel(this.$utility, this.$mdDialog, this.$scope, this._controllersManager.mainController, this._controllersManager.authenticateController, evt);
                let changePasswordController = ($scope, $mdDialog) => {
                    $scope["vm"] = changpasswordVM;
                };
                changePasswordController.$inject = ["$scope", "$mdDialog"];
                this.$mdDialog.show({
                    clickOutsideToClose: false,
                    preserveScope: true,
                    focusOnOpen: true,
                    templateUrl: "me/PartialView?module=Home&name=ChangePassword",
                    controller: changePasswordController
                });
            }, this);
            this._controllersManager.authenticateController.on("logincompleted", this.logingCompletedHandler, this);

            this.$utility.Translator.on("languagechanged", () => {
                let currentUser = this.$utility.UserContext.CurrentUser();
                if (currentUser) {
                    this.helloUser = this.$utility.Translator.getTranslation("HelloLogin").format(currentUser.DisplayName);
                }
            }, this);

            this._controllersManager.uiStateController.on("mainflowstatechanged", () => {
                let currentFlowState = (<IAproplanState>this.$state.current).mainFlowState;

                // update view template
                switch (this._controllersManager.uiStateController.mainFlowState) {
                    case ap.controllers.MainFlow.ForgottenPassword:
                        this.$state.go("forgottenpassword", {}, { reload: true });
                        break;
                    case ap.controllers.MainFlow.Projects:
                        if (currentFlowState !== ap.controllers.MainFlow.Projects) {
                            this.$state.go("projects", {}, { reload: true });
                            this._isCompanyModule = false;
                        }
                        break;
                    case ap.controllers.MainFlow.Meetings:
                        if (currentFlowState !== ap.controllers.MainFlow.Meetings) {
                            this.$state.go("meetings", {}, { reload: true });
                            this._isCompanyModule = false;
                        }
                        break;
                    case ap.controllers.MainFlow.Points:
                        if (currentFlowState !== ap.controllers.MainFlow.Points) {
                            this.$state.go("points", {}, { reload: true });
                            this._isCompanyModule = false;
                        }
                        break;
                    case ap.controllers.MainFlow.Forms:
                        if (currentFlowState !== ap.controllers.MainFlow.Forms) {
                            this.$state.go("forms", {}, { reload: true });
                            this._isCompanyModule = false;
                        }
                        break;
                    case ap.controllers.MainFlow.Documents:
                        if (currentFlowState !== ap.controllers.MainFlow.Documents) {
                            this.$state.go("documents", {}, { reload: true });
                            this._isCompanyModule = false;
                        }
                        break;
                    case ap.controllers.MainFlow.Contacts:
                        if (currentFlowState !== ap.controllers.MainFlow.Contacts) {
                            this.$state.go("projectcontacts", {}, { reload: true });
                            this._isCompanyModule = false;
                        }
                        break;
                    case ap.controllers.MainFlow.MeetingContacts:
                        if (currentFlowState !== ap.controllers.MainFlow.MeetingContacts) {
                            this.$state.go("meetingscontacts", {}, { reload: true });
                            this._isCompanyModule = false;
                        }
                        break;
                    case ap.controllers.MainFlow.ProjectConfig:
                        if (currentFlowState !== ap.controllers.MainFlow.ProjectConfig) {
                            this.$state.go("projectconfig", {}, { reload: true });
                            this._isCompanyModule = false;
                        }
                        break;
                    case ap.controllers.MainFlow.MeetingDocuments:
                        if (currentFlowState !== ap.controllers.MainFlow.MeetingDocuments) {
                            this.$state.go("meetingdocuments", {}, { reload: true });
                            this._isCompanyModule = false;
                        }
                        break;
                    case ap.controllers.MainFlow.MeetingConfig:
                        if (currentFlowState !== ap.controllers.MainFlow.MeetingConfig) {
                            this.$state.go("meetingconfig", {}, { reload: true });
                            this._isCompanyModule = false;
                        }
                        break;
                    case ap.controllers.MainFlow.ManageContacts:
                        if (currentFlowState !== ap.controllers.MainFlow.ManageContacts) {
                            this.$state.go("managecontacts", {}, { reload: true });
                            this._isCompanyModule = false;
                        }
                        break;
                    case ap.controllers.MainFlow.MeetingManage:
                        if (currentFlowState !== ap.controllers.MainFlow.MeetingManage) {
                            this.$state.go("meetingmanage", {}, { reload: true });
                            this._isCompanyModule = false;
                        }
                        break;
                    case ap.controllers.MainFlow.Dashboard:
                        if (currentFlowState !== ap.controllers.MainFlow.Dashboard) {
                            this.$state.go("dashboard", {}, { reload: true });
                            this._isCompanyModule = false;
                        }
                        break;
                    case ap.controllers.MainFlow.CompanyMembers:
                        if (currentFlowState !== ap.controllers.MainFlow.CompanyMembers) {
                            this.$state.go("companymembers", {}, { reload: true });
                            this._isCompanyModule = true;
                        }
                        break;
                    case ap.controllers.MainFlow.FormTemplates:
                        if (currentFlowState !== ap.controllers.MainFlow.FormTemplates) {
                            this.$state.go("formtemplates", {}, { reload: true });
                            this._isCompanyModule = true;
                        }
                        break;
                    case ap.controllers.MainFlow.DocumentView:
                        if ((<IAproplanState>this.$state.current).mainFlowState !== ap.controllers.MainFlow.DocumentView) {
                            let params = <ap.controllers.DocumentViewFlowStateParam>this._controllersManager.uiStateController.mainFlowStateParam;
                            this.$state.go("documentview", {
                                documentId: params.documentId,
                                versionId: params.versionId,
                                meetingId: params.meetingId,
                                isReport: params.isReport,
                                comesFromPointsList: params.comesFromPointsList,
                                documentIds: params.documentIds
                            }, { reload: true });
                            this._isCompanyModule = false;
                        }
                        break;
                    case ap.controllers.MainFlow.FormView:
                        if (currentFlowState !== ap.controllers.MainFlow.FormView) {
                            let params = <ap.controllers.FormViewFlowStateParam>this._controllersManager.uiStateController.mainFlowStateParam;
                            this.$state.go("formview", {
                                id: params.formId
                            }, { reload: true });
                        }
                        break;
                    case ap.controllers.MainFlow.FormTemplateView:
                        if (currentFlowState !== ap.controllers.MainFlow.FormTemplateView) {
                            let params = <ap.controllers.FormViewFlowStateParam>this._controllersManager.uiStateController.mainFlowStateParam;
                            this.$state.go("formtemplateview", {
                                id: params.formId
                            }, { reload: true });
                        }
                        break;
                }
            }, this);
            this.$window.addEventListener("resize", this._events.resizeHandler);
            let self = this;

            this.$window["RefreshUser"] = this._onUploadUserHandler;
            this.$window["RefreshPassword"] = this._onUpdatePasswordHandler;
        }

        /**
         * Refresh the password of the user when it has been changed in the settings page
         * @param userId The id of the user
         * @param oldPassword The old password
         * @param newPassword The new password
         */
        private onUpdatePasswordUser(userId: string, oldPassword: string, newPassword: string) {
            this.$scope.$apply(() => {
                if (this.$utility.UserContext.CurrentUser().Id === userId)
                    this.$utility.UserContext.resetPassword(newPassword, false);
            });
        }

        /**
         * Update user when its account settings are updated
         */
        private onUpdateUser() {
            this.$scope.$apply(() => {
                let oldLanguageCode = this.$utility.UserContext ? this.$utility.UserContext.LanguageCode() : null;
                this._controllersManager.userController.getUserById(this.$utility.UserContext.CurrentUser().Id).then((user: ap.models.actors.User) => {
                    if (this.$utility.UserContext.CurrentUser().DisplayName !== user.DisplayName) {
                        this.$utility.Title.setTitle("APROPLAN (" + user.DisplayName + ")");
                    }
                    this.$utility.UserContext.setCurrentUser(user);
                    if (this.$utility.Translator.getLanguage() !== user.LanguageCode) {
                        this.$utility.Translator.initLanguage(user.Person.Language.getFullCode(), "translations/");
                    }
                });
            });
        }

        /**
         * Clear the available download list
         */
        private clearDownloadQueueList(): void {
            this._downloadQueueListVm.dispose();
            this._showQueueDocumentAction.isVisible = false;
        }

        /**
         *
         * @param massExport
         */
        private initDownloadItem(massExport: ap.models.massExport.MassExportConfiguration) {
            let downloadItem = this._downloadQueueListVm.initQueueItem(massExport);
            if (massExport.Status === ap.models.massExport.MassExportConfigurationStatus.Completed) {
                downloadItem.zipName = massExport.FileName;
                downloadItem.isGenerated = true;
            } else {
                if (massExport.Projects) {
                    massExport.Projects.forEach((project: ap.models.massExport.MassExportProject) => {
                        downloadItem.docNumber += project.PlanIds.split(";").length;
                    });
                }
                this._controllersManager.massExportController.registerMassExportStatusRefresh(massExport);
            }
        }

        /**
        * This method is used to show the md-panel dialog
        **/
        private showDialog($event: MouseEvent, param: any): void {
            let seft = this;
            this.isShowingMessageDialog = true;
            let parentEl = angular.element(document.body);
            let parentEl1: any;
            let buttons: ap.controllers.MessageButtons = ap.controllers.MessageButtons.Ok;
            if (param.buttons) {
                buttons = param.buttons;
            }
            let isOkVisible: boolean = buttons === ap.controllers.MessageButtons.Ok || buttons === ap.controllers.MessageButtons.OkCancel;
            let isCancelVisible: boolean = buttons === ap.controllers.MessageButtons.OkCancel || buttons === ap.controllers.MessageButtons.CustomCancel;
            let isCustomVisible: boolean = buttons === ap.controllers.MessageButtons.CustomCancel;
            let isYesVisible: boolean = buttons === ap.controllers.MessageButtons.YesNo;
            let isNoVisible: boolean = buttons === ap.controllers.MessageButtons.YesNo;
            let hasException: boolean = param.exception !== undefined && param.exception !== null && param.exception !== "";
            let hasLeftButton: boolean = param.leftKey !== undefined && param.leftKey !== null && param.leftKey !== "";

            // AP-12043: add support translate bottn text
            if (isYesVisible && (param.confirmKey === undefined || param.confirmKey === null))
                param.confirmKey = "Yes";

            if (isNoVisible && (param.rejectKey === undefined || param.rejectKey === null))
                param.rejectKey = "No";

            let passData: { [index: string]: any } = {};
            let panelRef: any = {};
            passData["mdPanelRef"] = panelRef;
            param.isOkVisible = isOkVisible;
            param.isCancelVisible = isCancelVisible;
            param.isYesVisible = isYesVisible;
            param.isNoVisible = isNoVisible;
            param.hasException = hasException;
            param.isLeftButtonVisible = hasLeftButton;
            param.isCustomVisible = isCustomVisible;
            passData["param"] = param;

            let panelPosition = this.$mdPanel.newPanelPosition()
                .absolute().top("0").left("0").right("0").bottom("0");
            let config = {
                attachTo: parentEl,
                templateUrl: "me/PartialView?module=Components&name=genericMessageDialog",
                controller: ap.viewmodels.home.MessageDialogViewModel,
                controllerAs: "mdvm",
                position: panelPosition,
                panelClass: "panelDialogWrapper",
                locals: passData,
                targetEvent: $event,
                onRemoving: (panel) => {
                    seft.isShowingMessageDialog = false;
                }
            };
            panelRef = this.$mdPanel.create(config);
            panelRef.open();
        }

        /**
         * Logout the user
         */
        logout(): void {
            this._controllersManager.authenticateController.logout();
            this._visibleScreens = [];
            this._mainSearchInfo = null;
        }

        /**
         * Go to the settings page
         */
        gotoSettings(): void {
            let url = this.$utility.rootUrl + "MyAccount";
            let optionalData: any = {
                UserContext: this.$utility.UserContext.getData(),
                Language: this.$utility.Translator.getLanguage()
            };

            this.$utility.open("POST", url, undefined, "_blank", optionalData);

            let paramValue: string = ap.controllers.MainFlow[this._controllersManager.uiStateController.mainFlowState];
            this.$servicesManager.toolService.sendEvent("cli-menu-view user profile settings", new Dictionary([new KeyValue("cli-menu- view user profile settings-screenname", paramValue)]));
        }

        /**
        * This method return the screenInfo which need to be binded to the view (main actions)
        **/
        public get mainActionScreen(): ap.misc.ScreenInfo {
            if (this.visibleScreens.length !== 0) {
                for (let i = this.visibleScreens.length - 1; i > -1; i--) {
                    if (this.visibleScreens[i].showHasMainAction) {
                        return this.visibleScreens[i].screen;
                    }
                }
            }
        }

        /**
        * This property needs
        **/
        public get isCustomToolbar(): boolean {
            for (let i = 0; i < this.visibleScreens.length; i++) {
                let screen = this.visibleScreens[i].screen;
                if (screen.isCustomToolbar) {
                    return true;
                }
            }

            return false;
        }

        /**
        * This method init visibleScreens and mainSearchInfo
        */
        private loadScreen() {
            // Need to check if there is at least one currentVisibleScreens
            if (this.isSmartphone && this._controllersManager.mainController.currentVisibleScreens.length > 0) {
                this._visibleScreens = [this._controllersManager.mainController.currentVisibleScreens[this._controllersManager.mainController.currentVisibleScreens.length - 1]];
                if (this.visibleScreens[this._controllersManager.mainController.currentVisibleScreens.length - 1]) {
                    this._mainSearchInfo = this.visibleScreens[this._controllersManager.mainController.currentVisibleScreens.length - 1].screen.mainSearchInfo;
                }
            } else {
                if (this._controllersManager.mainController.currentVisibleScreens.length === 1) {
                    this._visibleScreens = [this._controllersManager.mainController.currentVisibleScreens[0]];
                    if (this.visibleScreens[0]) {
                        this._mainSearchInfo = this.visibleScreens[0].screen.mainSearchInfo;
                    }
                }
                else if (this._controllersManager.mainController.currentVisibleScreens.length > 1) { // it is necessary to precise more than one because if this._mainController.currentVisibleScreens is empty it brings an error. This case can occurs at the loading of the application
                    this._visibleScreens = [this._controllersManager.mainController.currentVisibleScreens[this._controllersManager.mainController.currentVisibleScreens.length - 2], this._controllersManager.mainController.currentVisibleScreens[this._controllersManager.mainController.currentVisibleScreens.length - 1]];
                    if (this.visibleScreens[1]) {
                        if (this.visibleScreens[1].screen.mainSearchInfo !== null) {
                            this._mainSearchInfo = this.visibleScreens[1].screen.mainSearchInfo;
                        } else {
                            this._mainSearchInfo = this.visibleScreens[0].screen.mainSearchInfo;
                        }
                    }
                }
                else {
                    this._visibleScreens = [];
                    this._mainSearchInfo = null;
                }
            }
        }

        /**
         * Handler for downloading queue item
         * @param massExport Mass export configuration entity
         */
        private handlerDownloadQueueInProcess(massExport: ap.models.massExport.MassExportConfiguration) {
            let downloadQueueItemVm = this._downloadQueueListVm.initQueueItem(massExport);
            massExport.Projects.forEach(project => downloadQueueItemVm.docNumber += project.PlanIds ? project.PlanIds.split(";").length : 0);
        }

        /**
         * Handler for managing queue item's processed status
         * @param massExport Mass export configuration entity
         */
        private handlerDownloadQueueProcessed(massExport: ap.models.massExport.MassExportConfiguration) {
            let queueItem = <ap.viewmodels.downloadqueue.DownloadQueueItemViewModel>this._downloadQueueListVm.getEntityById(massExport.Id);
            if (!queueItem)
                return;
            queueItem.init(massExport);
            queueItem.isGenerated = true;
        }

        /**
         * This method is used to specify that a click has been done on one action of the addActions
         * @parma name this is the name of the action on which the click has been done
         **/
        addActionClick(name: string, args?: any) {
            for (let i = 0; i < this._visibleScreens.length; i++) {
                if (this._visibleScreens[i].screen.addAction && this._visibleScreens[i].screen.addAction.name === name) {
                    this._visibleScreens[i].screen.addActionClick(new ap.controllers.AddActionClickEvent(name, args));
                    break;
                }
            }
        }

        /**
         * This method is used to specify that a click has been done on one sub action
         * @parma name this is the name of the action on which the click has been done
         **/
        addSubActionClick(name: string, args?: any) {
            for (let i = 0; i < this._visibleScreens.length; i++) {
                if (this._visibleScreens[i].screen.addAction && this._visibleScreens[i].screen.addAction.hasSubActions) {
                    if (this._visibleScreens[i].screen.addAction.hasSubAction(name)) {
                        this._visibleScreens[i].screen.addActionClick(new ap.controllers.AddActionClickEvent(name, args));
                    }
                }
            }
        }

        get currentUser(): ap.models.actors.User {
            return this.$utility.UserContext.CurrentUser();
        }

        private handlerRequestDownloadQueue() {
            this._showQueueDocumentAction.isVisible = true;
        }

        /**
        * This property to know if the menu must be hidden
        **/
        public get forceHideMenu(): boolean {
            for (let i = 0; i < this.visibleScreens.length; i++) {
                let currentScreen = this.visibleScreens[i].screen;
                if (currentScreen && !currentScreen.hasNavBar) {
                    return true;
                }
            }

            return false;
        }

        /**
        * This property to know if the current screen is in fullscreen
        * if one of visbileScreens has isFullScreen/isEditMode are true
        **/
        public get isFullEditMode(): boolean {
            for (let i = 0; i < this.visibleScreens.length; i++) {
                let currentScreen = this.visibleScreens[i].screen;
                if (currentScreen && currentScreen.isEditMode === true && currentScreen.isFullScreen === true) {
                    return true;
                }
            }
            return false;
        }

        /**
        * Close the popup
        **/
        public closePopup() {
            this.$mdDialog.hide();
        }

        /**
         * Displayes a warn popup about using IE browser
         * @param $event click event arguments
         */
        public showWarnIEPopup($event?: MouseEvent) {
            let vmController = ($scope, $mdDialog) => {
                $scope["mainVm"] = this;
            };
            vmController.$inject = ["$scope", "$mdDialog"];
            this.$mdDialog.show({
                clickOutsideToClose: false,
                preserveScope: true,
                templateUrl: "me/PartialView?module=Home&name=WarnIEUsersPopup",
                fullscreen: true,
                controller: vmController
            });
            this.$servicesManager.toolService.sendEvent("cli-menu-open ie warning", null);
        }

        /**
         * Displayes a download queue popup
         * @param $event click event arguments
         */
        public showDownloadQueue($event: MouseEvent) {
            this._downloadQueuePanel = null;
            let panelPosition = this.getDownloadQueuePanelPosition();

            let downloadQueueController = () => { };
            downloadQueueController.$inject = [];

            this.$mdPanel.open({
                id: "download-queue-popup",
                attachTo: angular.element(document.body),
                templateUrl: "me/PartialView?module=Document&name=DownloadQueuePopup",
                controller: downloadQueueController, // add default controller
                controllerAs: "ctrl",
                locals: {
                    downloadQueueListVm: this._downloadQueueListVm
                },
                targetEvent: $event,
                clickOutsideToClose: true,
                escapeToClose: true,
                focusOnOpen: false,
                position: panelPosition,
                onCloseSuccess: (mdPanelRef: any) => {
                    this._downloadQueueListVm.off("countChanged", this.checkCloseDownloadInfoPanel, this);
                }
            }).then((result) => {
                this._downloadQueuePanel = result;
                this._downloadQueueListVm.on("countChanged", this.checkCloseDownloadInfoPanel, this);
            });
        }

        /**
         * Check if download queue list is empty. If true, close download info panel
         * @param itemsCount Updated items' count
         */
        private checkCloseDownloadInfoPanel(itemsCount: number) {
            if (itemsCount === 0) {
                this._downloadQueuePanel.close();
                this._showQueueDocumentAction.isVisible = false;
            }
        }

        public dispose() {
            this._controllersManager.mainController.off("downloadqueuerequested", this.handlerRequestDownloadQueue, this);
            this._controllersManager.mainController.off("downloadqueuereinprocess", this.handlerDownloadQueueInProcess, this);
            this._controllersManager.mainController.off("downloadqueuereprocessed", this.handlerDownloadQueueProcessed, this);
            this._downloadQueueListVm.dispose();
            this.$window.removeEventListener("resize", this._events.resizeHandler);
            this.$window["RefreshUser"] = null;
            this.$window["RefreshPassword"] = null;
        }

        /**
         * Determines a correct position for the download queue popup depending of a current size of the page
         * @returns MdPanelPosition
         */
        private getDownloadQueuePanelPosition() {
            let relativeSelector = ".show-download-queue-action";
            if (!document.querySelector(relativeSelector)) {
                relativeSelector = ".mainToolBar";
            }
            let panelPosition = this.$mdPanel.newPanelPosition()
                .relativeTo(relativeSelector)
                .addPanelPosition(this.$mdPanel.xPosition.ALIGN_END, this.$mdPanel.yPosition.BELOW);
            return panelPosition;
        }

        /**
         * An event handler for the window resize event
         */
        private handleResize() {
            if (this._downloadQueuePanel) {
                let panelPosition = this.getDownloadQueuePanelPosition();
                this._downloadQueuePanel.updatePosition(panelPosition);
            }
        }

        /**
         * Handler method when an item from the navigation is clicked
         * @param name
         */
        itemClick(name: string) {
            switch (name) {
                case "Projects":
                    this._controllersManager.uiStateController.changeFlowState(ap.controllers.MainFlow.Projects);
                    break;
                case "Company":
                    this._controllersManager.uiStateController.changeFlowState(ap.controllers.MainFlow.FormTemplates);
                    break;
            }
        }

        /**
         * Initialize mdDateLocale values based on the language of the user 
         */
        private initializeCalendar() {
            this.$mdDateLocale.months = [this.$utility.Translator.getTranslation("January"), this.$utility.Translator.getTranslation("February"), this.$utility.Translator.getTranslation("March"), this.$utility.Translator.getTranslation("April"), this.$utility.Translator.getTranslation("May"), this.$utility.Translator.getTranslation("June"), this.$utility.Translator.getTranslation("July"), this.$utility.Translator.getTranslation("August"), this.$utility.Translator.getTranslation("September"), this.$utility.Translator.getTranslation("October"), this.$utility.Translator.getTranslation("November"), this.$utility.Translator.getTranslation("December")];
            this.$mdDateLocale.shortMonths = [this.$utility.Translator.getTranslation("Jan"), this.$utility.Translator.getTranslation("Feb"), this.$utility.Translator.getTranslation("Mar"), this.$utility.Translator.getTranslation("Apr"), this.$utility.Translator.getTranslation("May"), this.$utility.Translator.getTranslation("Jun"), this.$utility.Translator.getTranslation("Jul"), this.$utility.Translator.getTranslation("Aug"), this.$utility.Translator.getTranslation("Sep"), this.$utility.Translator.getTranslation("Oct"), this.$utility.Translator.getTranslation("Nov"), this.$utility.Translator.getTranslation("Dec")];
            this.$mdDateLocale.days = [this.$utility.Translator.getTranslation("Sunday"), this.$utility.Translator.getTranslation("Monday"), this.$utility.Translator.getTranslation("Tuesday"), this.$utility.Translator.getTranslation("Wednesday"), this.$utility.Translator.getTranslation("Thursday"), this.$utility.Translator.getTranslation("Friday"), this.$utility.Translator.getTranslation("Saturday")];
            this.$mdDateLocale.shortDays = [this.$utility.Translator.getTranslation("Sun"), this.$utility.Translator.getTranslation("Mon"), this.$utility.Translator.getTranslation("Tue"), this.$utility.Translator.getTranslation("Wed"), this.$utility.Translator.getTranslation("Thu"), this.$utility.Translator.getTranslation("Fri"), this.$utility.Translator.getTranslation("Sat")];
        }

        static $inject = ["$scope", "$state", "$window", "$timeout", "$location", "$mdDialog", "$mdPanel", "$mdSidenav", "$mdToast", "Utility", "ControllersManager", "$http", "$templateCache", "ServicesManager", "$mdDateLocale"];

        constructor(private $scope: angular.IScope, private $state: angular.ui.IStateService, private $window: angular.IWindowService, private $timeout: angular.ITimeoutService, private $location: angular.ILocationService, private $mdDialog: angular.material.IDialogService, private $mdPanel: any,
            private $mdSidenav: angular.material.ISidenavService, private $mdToast: angular.material.IToastService, private $utility: ap.utility.UtilityHelper, private _controllersManager: ap.controllers.ControllersManager,
            private $http: angular.IHttpService, private $templateCache: angular.ITemplateCacheService, private $servicesManager: ap.services.ServicesManager, private $mdDateLocale: IMdDateLocale) {
            this._controllersManager.mainController.on("downloadqueuereinprocess", this.handlerDownloadQueueInProcess, this);
            this._controllersManager.mainController.on("downloadqueuereprocessed", this.handlerDownloadQueueProcessed, this);
            this.needLogin = true;

            this._events.resizeHandler = () => {
                this.handleResize();
            };

            $scope.$on("$destroy", () => {
                this.dispose();
            });

            this.detailActions = this._controllersManager.mainController.detailActions;
            this._onUploadUserHandler = this.onUpdateUser.bind(this);
            this._onUpdatePasswordHandler = this.onUpdatePasswordUser.bind(this);
            this.subscribeEvents();
            this.loadScreen();

            // addAction & title

            if (this.visibleScreens && this.visibleScreens[0]) {
                for (let i = this._visibleScreens.length - 1; i > -1; i--) {
                    if (this._visibleScreens[i].screen.addAction) {
                        this._addAction = this._visibleScreens[i].screen.addAction;
                    }
                }
            }
            this.isNavDrawerOpened = this._controllersManager.mainController.isDesktop;
            let vm = this;
            this._showQueueDocumentAction = new ActionViewModel(this.$utility, $utility.EventTool, "document.showqueue", $utility.rootUrl + "Images/html/icons/ic_notifications_black_48px.svg", false, null, "Show download queue", true);
            this._downloadQueueListVm = new ap.viewmodels.downloadqueue.DownloadQueueListViewModel(this.$utility, this._controllersManager.massExportController);
        }

        private _showQueueDocumentAction: ActionViewModel = null;
        private _downloadQueueListVm: ap.viewmodels.downloadqueue.DownloadQueueListViewModel;
        private _downloadQueuePanel: any = null;
        private _events: any = {};
        private _addAction: ActionViewModel = null;
        private _showBusyCount: number = 0;
        private _timeoutBusy: any = null;
        private _hideTimeout: ng.IPromise<void> = undefined;
        private _mainSearchInfo: ap.misc.MainSearchInfo = null;
        private _visibleScreens: ap.controllers.ScreenStep[];
        private _onUploadUserHandler: any;
        private _onUpdatePasswordHandler: any;
        private _isCompanyModule: boolean = false;
    }
}
