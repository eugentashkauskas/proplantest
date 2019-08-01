describe("Module ap-viewmodels - MainViewModel", () => {
    let $controller: ng.IControllerService, vm: ap.viewmodels.MainViewModel, AuthenticateController: ap.controllers.AuthenticateController, MainController: ap.controllers.MainController,
        UserController: ap.controllers.UserController, Utility: ap.utility.UtilityHelper, _deferred: angular.IDeferred<ap.services.apiHelper.ApiResponse>,
        UIStateController: ap.controllers.UIStateController, UserService: ap.services.UserService;
    let $q: angular.IQService, $rootScope: angular.IRootScopeService, $scope: angular.IScope, $http, $timeout, $location, $mdDialog, $mdDateLocale, $provide, $mdSidenav;
    let $state: angular.ui.IStateService;
    let $mdToast: angular.material.IToastService;
    let mdToastDeferred: angular.IDeferred<any>;
    let $window: any;
    let $mdPanel: any;
    let $mdPanelRef: any;

    beforeEach(() => {
        angular.mock.module("ui.router");
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");

        $window = specHelper.createWindowStub();
        $window.navigator.userLanguage = undefined;
        $window.navigator.language = "en_US";

        angular.mock.module(function ($provide) {
            $provide.factory('$mdDialog', ["$q", function ($q) {
                return specHelper.utility.stubShowMdDialog($q);
            }]);
        });
        angular.mock.module(function ($provide) {
            $provide.factory('$mdDateLocale', ["$q", function ($q) {
                return specHelper.utility.stubShowMdDateLocale();
            }]);
        });
        angular.mock.module(function ($provide) {
            $provide.factory('$mdPanel', ["$q", function ($q) {
                return specHelper.utility.stubShowMdPanel($q);
            }]);
        });

        angular.mock.module(function ($provide) {
            $provide.factory('$mdPanelRef', ["$q", function ($q) {
                return specHelper.utility.stubMdPanelRef($q);
            }]);
        });

        angular.mock.module(function ($provide) {
            $provide.value('$window', $window);
            $mdSidenav = specHelper.utility.stubToggleMdSideNav($provide);

            $mdToast = specHelper.utility.stubShowMdToast();
            $provide.value('$mdToast', $mdToast);

        });
        angular.mock.module(function ($provide) {
            $provide.factory('$mdToast', ["$q", function ($q) {
                mdToastDeferred = $q.defer();
                return {
                    show: jasmine.createSpy("show").and.returnValue(mdToastDeferred.promise),
                    hide: jasmine.createSpy("hide").and.returnValue(mdToastDeferred.promise)
                };
            }]);
        });
    });

    beforeEach(inject(function (_$q_, _$timeout_, _$controller_, _$rootScope_, _$location_, _MainController_, _Utility_, _AuthenticateController_, _UserController_, _UIStateController_, _UserService_, _$state_, $injector, _$mdDialog_, _$mdToast_, _$mdPanel_, _$mdPanelRef_, _$mdDateLocale_) {
        $location = _$location_;
        $timeout = _$timeout_;
        $controller = _$controller_;
        $mdDialog = _$mdDialog_;
        $mdDateLocale = _$mdDateLocale_;
        $mdToast = _$mdToast_;
        $mdPanel = _$mdPanel_;
        $mdPanelRef = _$mdPanelRef_;
        Utility = _Utility_;
        MainController = _MainController_;
        AuthenticateController = _AuthenticateController_;
        UserController = _UserController_;
        UIStateController = _UIStateController_;
        UserService = _UserService_;

        $state = _$state_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        $q = _$q_;

        _deferred = $q.defer();

        specHelper.utility.stubRootUrl(Utility);

        spyOn(Utility.Translator, "getTranslation").and.callFake(function (key) {
            return "$" + key;
        });

        spyOn(Utility.Translator, "initLanguage");
    }));

    describe("Feature: Default values", () => {
        beforeEach(() => {
            vm = <ap.viewmodels.MainViewModel>$controller("mainViewModel", { $scope: $scope, $state: $state });
        })
        it("can get an instance of my factory with default values", () => {

            expect(vm).toBeDefined();
            expect(vm.mainSearchInfo).toBeNull();
            expect(vm.visibleScreens).toEqual([]);
            expect(vm.needLogin).toBeDefined();
            expect(vm.multiActions).toBeNull();
            expect(vm.isMultiActionMode).toBeFalsy();
        });
        it("can initialize window's method calling user's update", () => {
            expect($window["RefreshUser"]).toBeDefined();
        });
    });

    describe("Feature: mainActionScreen", () => {
        let screenInfo: ap.misc.ScreenInfo;
        let screenInfo2: ap.misc.ScreenInfo;
        let screenInfo3: ap.misc.ScreenInfo;
        let screenInfo4: ap.misc.ScreenInfo;
        let actions: ap.viewmodels.home.ActionViewModel[];
        let mSI: ap.misc.MainSearchInfo;
        let addAction: ap.viewmodels.home.ActionViewModel;
        let addAction2: ap.viewmodels.home.ActionViewModel;
        let addAction3: ap.viewmodels.home.ActionViewModel;
        let addActionNull: ap.viewmodels.home.ActionViewModel;
        beforeEach(() => {
            specHelper.utility.stubUserConnected(Utility);
            mSI = new ap.misc.MainSearchInfo(Utility, $timeout, null, null);
            actions = [
                new ap.viewmodels.home.ActionViewModel(Utility, Utility.EventTool, "Download", "", false, null, "", true, true),
            ];
            addAction = new ap.viewmodels.home.ActionViewModel(Utility, Utility.EventTool, "addAction");
            addAction2 = new ap.viewmodels.home.ActionViewModel(Utility, Utility.EventTool, "addAction2");
            addAction3 = new ap.viewmodels.home.ActionViewModel(Utility, Utility.EventTool, "addAction3");
            screenInfo = new ap.misc.ScreenInfo(Utility, "screenOne", ap.misc.ScreenInfoType.List, actions, addAction, mSI, "");
            screenInfo2 = new ap.misc.ScreenInfo(Utility, "screenTwo", ap.misc.ScreenInfoType.List, actions, addActionNull, mSI, "");
            screenInfo3 = new ap.misc.ScreenInfo(Utility, "screenThree", ap.misc.ScreenInfoType.List, actions, null, mSI, "");
            screenInfo4 = new ap.misc.ScreenInfo(Utility, "screenFour", ap.misc.ScreenInfoType.List, actions, addAction2, mSI, "");
            MainController.initScreen(screenInfo);
            MainController.addScreen(screenInfo2, false, true);
            MainController.addScreen(screenInfo3, false, true);
            MainController.addScreen(screenInfo4, true);
            vm = <ap.viewmodels.MainViewModel>$controller("mainViewModel", { $scope: $scope, $state: $state });
        });
        describe("WHEN get mainActionScreen is used", () => {
            it("THEN the last visible screen with hasShowMainAction = true is returned", () => {
                expect(vm.mainActionScreen).toBe(screenInfo3);
            });
        });
    });
    describe("Feature: Load Screen", () => {
        let screenInfo: ap.misc.ScreenInfo;
        let screenInfo2: ap.misc.ScreenInfo;
        let mSI: ap.misc.MainSearchInfo;
        beforeEach(() => {
            specHelper.utility.stubUserConnected(Utility);
            mSI = new ap.misc.MainSearchInfo(Utility, $timeout, null, null);
            screenInfo = new ap.misc.ScreenInfo(Utility, "test", ap.misc.ScreenInfoType.List, null, null, mSI);
            screenInfo2 = new ap.misc.ScreenInfo(Utility, "screenTwo", ap.misc.ScreenInfoType.List, null, null, mSI, "");
        });
        describe("WHEN currentscreenchanged is raised", () => {
            describe("WHEN loadScreen is called with no screen", () => {
                beforeEach(() => {
                    vm = <ap.viewmodels.MainViewModel>$controller("mainViewModel", { $scope: $scope, $state: $state });
                    // spyOn(vm, "loadScreen");
                    specHelper.general.raiseEvent(MainController, "currentscreenchanged", null);
                });
                it("THEN loadScreen is called ", () => {
                    expect(vm.visibleScreens).toEqual([]);
                });
            });
            describe("WHEN loadScreen is called with one screen", () => {
                beforeEach(() => {
                    MainController.initScreen(screenInfo);
                    vm = <ap.viewmodels.MainViewModel>$controller("mainViewModel", { $scope: $scope, $state: $state });
                    // spyOn(vm, "loadScreen");
                    specHelper.general.raiseEvent(MainController, "currentscreenchanged", null);
                });
                it("THEN loadScreen is called ", () => {
                    expect(vm.visibleScreens[0].screen).toBe(screenInfo);
                    expect(vm.mainSearchInfo).toBe(screenInfo.mainSearchInfo);
                });
            });
            describe("WHEN loadScreen is called with more than one screen", () => {
                beforeEach(() => {
                    MainController.initScreen(screenInfo);
                    MainController.addScreen(screenInfo2, true);
                    vm = <ap.viewmodels.MainViewModel>$controller("mainViewModel", { $scope: $scope, $state: $state });
                    // spyOn(vm, "loadScreen");
                    specHelper.general.raiseEvent(MainController, "currentscreenchanged", null);
                });
                it("THEN loadScreen is called ", () => {
                    expect(vm.visibleScreens.length).toEqual(2);
                    expect(vm.mainSearchInfo).toBe(screenInfo2.mainSearchInfo);
                });
            });
        });
        describe("WHEN matchmediachanged is raised", () => {
            beforeEach(() => {
                MainController.initScreen(screenInfo);
                vm = <ap.viewmodels.MainViewModel>$controller("mainViewModel", { $scope: $scope, $state: $state });
                // spyOn(vm, "loadScreen");
                specHelper.general.raiseEvent(MainController, "matchmediachanged", null);
            });
            it("THEN loadScreen is called", () => {
                expect(vm.visibleScreens[0].screen).toBe(screenInfo);
                expect(vm.mainSearchInfo).toBe(screenInfo.mainSearchInfo);
            });
        });
    });

    describe("Feature: Addaction click", () => {
        let screenInfo: ap.misc.ScreenInfo;
        let mSI: ap.misc.MainSearchInfo;
        let addAction: ap.viewmodels.home.ActionViewModel;
        beforeEach(() => {
            specHelper.utility.stubUserConnected(Utility);
            mSI = new ap.misc.MainSearchInfo(Utility, $timeout, null, null);
            addAction = new ap.viewmodels.home.ActionViewModel(Utility, Utility.EventTool, "addAction");
            screenInfo = new ap.misc.ScreenInfo(Utility, "test", ap.misc.ScreenInfoType.List, null, addAction, mSI);
            MainController.initScreen(screenInfo);
            vm = <ap.viewmodels.MainViewModel>$controller("mainViewModel", { $scope: $scope, $state: $state });
            spyOn(screenInfo, "addActionClick");
        });
        describe("WHEN addactionclick is called with a correct action click", () => {
            beforeEach(() => {
                vm.addActionClick("addAction");
            });
            it("THEN the action click of the concern screen is called", () => {
                expect(screenInfo.addActionClick).toHaveBeenCalledWith(new ap.controllers.AddActionClickEvent(vm.visibleScreens[0].screen.addAction.name));
            });
        });
        describe("WHEN addactionclick is called with a uncorrect action click", () => {
            beforeEach(() => {
                vm.addActionClick("addAction2");
            });
            it("THEN the action click of the concern screen is called", () => {
                expect(screenInfo.addActionClick).not.toHaveBeenCalled();
            });
        });
    });

    describe("Feature: detailActionClick", () => {
        let screenInfo: ap.misc.ScreenInfo;
        let mSI: ap.misc.MainSearchInfo;
        let addAction: ap.viewmodels.home.ActionViewModel;
        beforeEach(() => {
            specHelper.utility.stubUserConnected(Utility);
            mSI = new ap.misc.MainSearchInfo(Utility, $timeout, null, null);

            addAction = new ap.viewmodels.home.ActionViewModel(Utility, Utility.EventTool, "note.addpoint", "/Images/html/icons/ic_add_black_48px.svg", false, [
                new ap.viewmodels.home.SubActionViewModel(Utility, Utility.EventTool, "note.addcomment", Utility.rootUrl + "/Images/html/icons/ic_insert_comment_black_48px.svg", true, true, true, "Add comment"),
                new ap.viewmodels.home.SubActionViewModel(Utility, Utility.EventTool, "note.importdocument", Utility.rootUrl + "/Images/html/icons/ic_attach_file_black_48px.svg", true, true, true, "Attach document from folder structure"),
                new ap.viewmodels.home.SubActionViewModel(Utility, Utility.EventTool, "note.adddocument", Utility.rootUrl + "/Images/html/icons/ic_file_upload_black_48px.svg", true, true, true, "Upload documents", true),
            ], "Add point", true);

            screenInfo = new ap.misc.ScreenInfo(Utility, "test", ap.misc.ScreenInfoType.List, null, addAction, mSI);
            MainController.initScreen(screenInfo);
            vm = <ap.viewmodels.MainViewModel>$controller("mainViewModel", { $scope: $scope, $state: $state });
            spyOn(screenInfo, "addActionClick");
        });
        describe("WHEN detailActionClick is called with a correct action click", () => {
            beforeEach(() => {
                vm.addSubActionClick("note.importdocument");
            });
            it("THEN the subaction click of the concern screen is called", () => {
                expect(screenInfo.addActionClick).toHaveBeenCalledWith(new ap.controllers.AddActionClickEvent(vm.visibleScreens[0].screen.addAction.subActions[1].name));
            });
        });

    });

    describe("Feature: Subscribe to events", () => {
        describe("WHEN object is created", () => {

            it("THEN it should subscribe the main controller to events", () => {
                spyOn(MainController, "on");

                vm = <ap.viewmodels.MainViewModel>$controller("mainViewModel", { $scope: $scope, $state: $state });

                expect((<jasmine.Spy>MainController.on).calls.count()).toEqual(14);
                expect((<jasmine.Spy>MainController.on).calls.argsFor(2)[0]).toEqual("downloadqueuereinprocess");
                expect((<jasmine.Spy>MainController.on).calls.argsFor(3)[0]).toEqual("downloadqueuereprocessed");
                expect((<jasmine.Spy>MainController.on).calls.argsFor(4)[0]).toEqual("createAccount");
                expect((<jasmine.Spy>MainController.on).calls.argsFor(5)[0]).toEqual("showmessage");
                expect((<jasmine.Spy>MainController.on).calls.argsFor(6)[0]).toEqual("showerror");
                expect((<jasmine.Spy>MainController.on).calls.argsFor(7)[0]).toEqual("showbusy");
                expect((<jasmine.Spy>MainController.on).calls.argsFor(8)[0]).toEqual("hidebusy");
                expect((<jasmine.Spy>MainController.on).calls.argsFor(9)[0]).toEqual("detailactionschanged");
                expect((<jasmine.Spy>MainController.on).calls.argsFor(10)[0]).toEqual("currentscreenchanged");
                expect((<jasmine.Spy>MainController.on).calls.argsFor(11)[0]).toEqual("matchmediachanged");
                expect((<jasmine.Spy>MainController.on).calls.argsFor(12)[0]).toEqual("showtoast");
                expect((<jasmine.Spy>MainController.on).calls.argsFor(13)[0]).toEqual("downloadqueuerequested");
            });

            it("THEN it should subscribe the authenticate controller to events", () => {
                spyOn(AuthenticateController, "on");

                vm = <ap.viewmodels.MainViewModel>$controller("mainViewModel", { $scope: $scope, $state: $state });

                expect((<jasmine.Spy>AuthenticateController.on).calls.count()).toEqual(9);
                expect((<jasmine.Spy>AuthenticateController.on).calls.argsFor(6)[0]).toEqual("logoutcompleted");
                expect((<jasmine.Spy>AuthenticateController.on).calls.argsFor(7)[0]).toEqual("changepasswordrequest");
                expect((<jasmine.Spy>AuthenticateController.on).calls.argsFor(8)[0]).toEqual("logincompleted");
            });

            it("THEN it should subscribe the UIState controller to events", () => {
                let mainVmStateSpy = jasmine.createSpy("mainVmStateSpy");
                // track only MainViewModel subscriber
                spyOn(UIStateController, "on").and.callFake((eventName: string, eventHandler: Function, caller: any) => {
                    if (caller.constructor.name === "MainViewModel") {
                        mainVmStateSpy(eventName, eventHandler, caller);
                    }
                });
                vm = <ap.viewmodels.MainViewModel>$controller("mainViewModel", { $scope: $scope, $state: $state });
                expect(mainVmStateSpy.calls.count()).toEqual(1);
                expect(mainVmStateSpy.calls.argsFor(0)[0]).toEqual("mainflowstatechanged");
            });
        });
    });

    describe("Feature goBackToScreen", () => {
        let screenInfo: ap.misc.ScreenInfo;
        let mSI: ap.misc.MainSearchInfo;
        beforeEach(() => {
            mSI = new ap.misc.MainSearchInfo(Utility, $timeout, null, null);
            screenInfo = new ap.misc.ScreenInfo(Utility, "test", ap.misc.ScreenInfoType.List, null, null, mSI);
        });
        describe("WHEN goBackToScreen is called", () => {
            it("THEN goBackToScreen of MainController is called", () => {
                specHelper.utility.stubUserConnected(Utility);
                MainController.initScreen(screenInfo);
                spyOn(MainController, "goBackToScreen");

                vm = <ap.viewmodels.MainViewModel>$controller("mainViewModel", { $scope: $scope, $state: $state });
                vm.goBackToScreen();

                expect(MainController.goBackToScreen).toHaveBeenCalled();
            });
        });
    });

    describe("Feature: Create account", () => {
        describe("WHEN createAccount is raised by MainController", () => {
            it("THEN location path should take the '/createAccount' value", () => {
                spyOn(MainController, "goCreateAccount").and.callThrough();

                vm = <ap.viewmodels.MainViewModel>$controller("mainViewModel", { $scope: $scope, $state: $state });

                MainController.goCreateAccount();

                expect($location.path()).toEqual("/createAccount");
            });
        });
    });

    describe("Feature: Show dialog", () => {
        let panelData: { [index: string]: any };

        beforeEach(() => {
            panelData = {}
            let panelRef: any = {};
            panelData['mdPanelRef'] = panelRef;

            spyOn(specHelper.FakePanelRef.prototype, "open").and.callThrough();
        });
        describe("WHEN showconfirm is raised by MainController", () => {
            it("THEN MainViewModel.showDialog is called", () => {
                vm = <ap.viewmodels.MainViewModel>$controller("mainViewModel", { $scope: $scope, $state: $state });

                let message: string = "message";
                let title: string = "title";
                let callback: (any?: any) => void;

                let param: any =
                    { title: title, message: message, callback: callback, buttons: 1, isMultiLines: false, confirmKey: "Yes", rejectKey: "No", isOkVisible: false, isCancelVisible: false, isYesVisible: true, isNoVisible: true, hasException: false, isLeftButtonVisible: false, isCustomVisible: false };
                panelData['param'] = param;

                MainController.showConfirm(message, title, callback);

                expect($mdPanel.create).toHaveBeenCalledWith(jasmine.objectContaining({
                    templateUrl: 'me/PartialView?module=Components&name=genericMessageDialog',
                    controllerAs: 'mdvm',
                    panelClass: "panelDialogWrapper",
                }));
                expect($mdPanel.create).toHaveBeenCalledWith(jasmine.objectContaining({
                    locals: panelData
                }));
                expect(specHelper.FakePanelRef.prototype.open).toHaveBeenCalled();
                expect(vm.isShowingMessageDialog).toBeTruthy();

            });
        });

        describe("WHEN showerror is raised by MainController", () => {
            it("THEN MainViewModel.showDialog is called", () => {
                vm = <ap.viewmodels.MainViewModel>$controller("mainViewModel", { $scope: $scope, $state: $state });

                let message: string = "message";
                let title: string = "title";
                let exception: string = "exception";
                let callback: (any?: any) => void;

                let param: any =
                    { message: message, title: title, exception: exception, callback: callback, isOkVisible: true, isCancelVisible: false, isYesVisible: false, isNoVisible: false, hasException: true, isLeftButtonVisible: false, isCustomVisible: false };
                panelData['param'] = param;

                MainController.showError(message, title, exception, callback);

                expect($mdPanel.create).toHaveBeenCalledWith(jasmine.objectContaining({
                    templateUrl: 'me/PartialView?module=Components&name=genericMessageDialog',
                    controllerAs: 'mdvm',
                    panelClass: "panelDialogWrapper",
                }));
                expect($mdPanel.create).toHaveBeenCalledWith(jasmine.objectContaining({
                    locals: panelData
                }));
                expect(specHelper.FakePanelRef.prototype.open).toHaveBeenCalled();
                expect(vm.isShowingMessageDialog).toBeTruthy();
            });
        });

        describe("WHEN showmessage is raised by MainController", () => {
            it("THEN MainViewModel.showDialog is called", () => {
                vm = <ap.viewmodels.MainViewModel>$controller("mainViewModel", { $scope: $scope, $state: $state });


                let message: string = "message";
                let title: string = "title";
                let callback: (any?: any) => void;
                let buttons: ap.controllers.MessageButtons = ap.controllers.MessageButtons.OkCancel;

                let param: any =
                    { title: title, message: message, buttons: 2, callback: callback, isOkVisible: true, isCancelVisible: true, isYesVisible: false, isNoVisible: false, hasException: false, isLeftButtonVisible: false, isCustomVisible: false };
                panelData['param'] = param;

                MainController.showMessage(message, title, callback, buttons);

                expect($mdPanel.create).toHaveBeenCalledWith(jasmine.objectContaining({
                    templateUrl: 'me/PartialView?module=Components&name=genericMessageDialog',
                    controllerAs: 'mdvm',
                    panelClass: "panelDialogWrapper",
                }));
                expect($mdPanel.create).toHaveBeenCalledWith(jasmine.objectContaining({
                    locals: panelData
                }));
                expect(specHelper.FakePanelRef.prototype.open).toHaveBeenCalled();
                expect(vm.isShowingMessageDialog).toBeTruthy();
            });
        });

        describe("WHEN showconfirm is raised by MainController WITH multilines option", () => {
            it("THEN MainViewModel.showDialog is called with multilines template", () => {
                vm = <ap.viewmodels.MainViewModel>$controller("mainViewModel", { $scope: $scope, $state: $state });


                let message: string = "message";
                let title: string = "title";
                let callback: (any?: any) => void;

                let param: any =
                    { title: title, message: message, callback: callback, buttons: 2, confirmKey: null, rejectKey: null, isMultiLines: true, isOkVisible: true, isCancelVisible: true, isYesVisible: false, isNoVisible: false, hasException: false, isLeftButtonVisible: false, isCustomVisible: false };
                panelData['param'] = param;

                MainController.showConfirm(message, title, callback, true /*isMultilines*/);

                expect($mdPanel.create).toHaveBeenCalledWith(jasmine.objectContaining({
                    templateUrl: 'me/PartialView?module=Components&name=genericMessageDialog',
                    controllerAs: 'mdvm',
                    panelClass: "panelDialogWrapper",
                }));
                expect($mdPanel.create).toHaveBeenCalledWith(jasmine.objectContaining({
                    locals: panelData
                }));
                expect(specHelper.FakePanelRef.prototype.open).toHaveBeenCalled();
                expect(vm.isShowingMessageDialog).toBeTruthy();
            });
        });

        describe("WHEN showconfirmKey is raised with left button option by MainController", () => {
            beforeEach(() => {
                vm = <ap.viewmodels.MainViewModel>$controller("mainViewModel", { $scope: $scope, $state: $state });

                let message: string = "message";
                let title: string = "title";
                let callback: (any?: any) => void;

                let param: any =
                    { title: "$title", message: "$message", callback: callback, buttons: 1, isMultiLines: false, confirmKey: "confirmKey", rejectKey: "rejectKey", leftKey: "leftButtonKey", isOkVisible: false, isCancelVisible: false, isYesVisible: true, isNoVisible: true, hasException: false, isLeftButtonVisible: true, isCustomVisible: false };
                panelData['param'] = param;

                MainController.showConfirmKey(message, title, callback, false, "confirmKey", "rejectKey", "leftButtonKey");
            });
            it("THEN dialog panel is created with correct template and correct ontroller ", () => {
                expect($mdPanel.create).toHaveBeenCalledWith(jasmine.objectContaining({
                    templateUrl: 'me/PartialView?module=Components&name=genericMessageDialog',
                    controllerAs: 'mdvm',
                    panelClass: "panelDialogWrapper",
                }));
            });

            it("THEN dialog panel is created with correct param ", () => {
                expect($mdPanel.create).toHaveBeenCalledWith(jasmine.objectContaining({
                    locals: panelData
                }));
            });
            it("THEN dialog panel is open", () => {
                expect(specHelper.FakePanelRef.prototype.open).toHaveBeenCalled();
            });

            it("THEN isShowingMessageDialog flag is true", () => {
                expect(vm.isShowingMessageDialog).toBeTruthy();
            });
        });
    });

    describe("Feature: Show/Hide busy", () => {
        describe("WHEN showBusy is raised", () => {
            it("THEN isShowingBusy is true", () => {
                vm = <ap.viewmodels.MainViewModel>$controller("mainViewModel", { $scope: $scope, $state: $state });

                MainController.showBusy("message");

                expect(vm.isShowingBusy).toBeFalsy();

                $timeout.flush();

                expect(vm.isShowingBusy).toBeTruthy();
            });
        });

        describe("WHEN hideBusy is raised BEFORE showBusy has been raised", () => {
            it("THEN isShowingBusy is true", () => {
                vm = <ap.viewmodels.MainViewModel>$controller("mainViewModel", { $scope: $scope, $state: $state });

                MainController.hideBusy("message");
                MainController.showBusy("message");

                $timeout.flush();
                $timeout.flush();

                expect(vm.isShowingBusy).toBeTruthy();
            });
        });

        describe("WHEN hideBusy is raised AFTER showBusy timeout", () => {
            it("THEN isShowingBusy is false", () => {
                vm = <ap.viewmodels.MainViewModel>$controller("mainViewModel", { $scope: $scope, $state: $state });

                MainController.showBusy("message");

                $timeout.flush();

                MainController.hideBusy("message");

                expect(vm.isShowingBusy).toBeFalsy();
            });
        });

        describe("WHEN hideBusy is raised BEFORE showBusy timeout", () => {
            it("THEN isShowingBusy is false", () => {
                vm = <ap.viewmodels.MainViewModel>$controller("mainViewModel", { $scope: $scope, $state: $state });

                MainController.showBusy("message");
                MainController.hideBusy("message");

                $timeout.flush();
                $timeout.flush();

                expect(vm.isShowingBusy).toBeFalsy();
            });
        });

        describe("WHEN showBusy is raised BEFORE showBusy timeout", () => {
            it("THEN isShowingBusy is true", () => {
                vm = <ap.viewmodels.MainViewModel>$controller("mainViewModel", { $scope: $scope, $state: $state });

                MainController.showBusy("message");
                MainController.showBusy("message");

                $timeout.flush();

                expect(vm.isShowingBusy).toBeTruthy();

                $timeout.flush();

                expect(vm.isShowingBusy).toBeTruthy();
            });
        });

        describe("WHEN hideBusy is raised X times BEFORE and AFTER showBusy is raised", () => {
            it("THEN isShowingBusy is false", () => {
                vm = <ap.viewmodels.MainViewModel>$controller("mainViewModel", { $scope: $scope, $state: $state });

                for (let i = 0; i < 7; ++i)
                    MainController.hideBusy("message");

                MainController.showBusy("message");
                $timeout.flush();

                expect(vm.isShowingBusy).toBeTruthy();

                for (let i = 0; i < 3; ++i)
                    MainController.hideBusy("message");
                $timeout.flush();

                expect(vm.isShowingBusy).toBeFalsy();
            });
        });

        describe("WHEN showBusy has been hidden", () => {
            it("THEN it can be shown again", () => {
                vm = <ap.viewmodels.MainViewModel>$controller("mainViewModel", { $scope: $scope, $state: $state });

                MainController.showBusy("message");
                $timeout.flush();

                MainController.hideBusy("message");
                $timeout.flush();

                MainController.showBusy("message");
                $timeout.flush();

                expect(vm.isShowingBusy).toBeTruthy();
            });
        });

        describe("WHEN hideBusy is raised DURING showBusy timeout", () => {
            it("THEN timeoutBusy is cancelled AND isShowingBusy is false", () => {
                vm = <ap.viewmodels.MainViewModel>$controller("mainViewModel", { $scope: $scope, $state: $state });

                MainController.showBusy("message");

                vm.isShowingBusy = true; // allow us to enter 'hideBusy' method before timeout

                MainController.hideBusy("message");

                $timeout.flush();

                expect(vm.isShowingBusy).toBeFalsy();
            });
        });
    });

    describe("Feature: Login/logout complete", () => {

        describe("WHEN logincompleted is raised by AuthenticateController", () => {

            beforeEach(() => {
                spyOn($state, "go");

                vm = <ap.viewmodels.MainViewModel>$controller("mainViewModel", { $scope: $scope, $state: $state });

            });

            it("THEN needLogin takes value 'false'", () => {
                specHelper.utility.stubUserConnected(Utility);

                specHelper.general.raiseEvent(AuthenticateController, "logincompleted", new LoginCompletedEvent(Utility.UserContext.CurrentUser(), LoginType.PASSWORD));

                expect(vm.needLogin).toBeFalsy();
            });

            it("THEN, mdDateLocale.months is initialize with values based on the user's language", () => {
                specHelper.utility.stubUserConnected(Utility);

                specHelper.general.raiseEvent(AuthenticateController, "logincompleted", new LoginCompletedEvent(Utility.UserContext.CurrentUser(), LoginType.PASSWORD));

                expect((<string[]>(<any>$mdDateLocale).months).length).toBe(12);
                expect((<any>$mdDateLocale).months).toEqual(["$January", "$February", "$March", "$April", "$May", "$June", "$July", "$August", "$September", "$October", "$November", "$December"]);
            });

            it("THEN, mdDateLocale.shortMonths is initialize with values based on the user's language", () => {
                specHelper.utility.stubUserConnected(Utility);

                specHelper.general.raiseEvent(AuthenticateController, "logincompleted", new LoginCompletedEvent(Utility.UserContext.CurrentUser(), LoginType.PASSWORD));

                expect((<string[]>(<any>$mdDateLocale).shortMonths).length).toBe(12);
                expect((<any>$mdDateLocale).shortMonths).toEqual(["$Jan", "$Feb", "$Mar", "$Apr", "$May", "$Jun", "$Jul", "$Aug", "$Sep", "$Oct", "$Nov", "$Dec"]);
            });

            it("THEN, mdDateLocale.shortDays is initialize with values based on the user's language", () => {
                specHelper.utility.stubUserConnected(Utility);

                specHelper.general.raiseEvent(AuthenticateController, "logincompleted", new LoginCompletedEvent(Utility.UserContext.CurrentUser(), LoginType.PASSWORD));

                expect((<string[]>(<any>$mdDateLocale).shortDays).length).toBe(7);
                expect((<any>$mdDateLocale).shortDays).toEqual(["$Sun", "$Mon", "$Tue", "$Wed", "$Thu", "$Fri", "$Sat"]);
            });

            it("THEN, mdDateLocale.days is initialize with values based on the user's language", () => {
                specHelper.utility.stubUserConnected(Utility);

                specHelper.general.raiseEvent(AuthenticateController, "logincompleted", new LoginCompletedEvent(Utility.UserContext.CurrentUser(), LoginType.PASSWORD));

                expect((<string[]>(<any>$mdDateLocale).days).length).toBe(7);
                expect((<any>$mdDateLocale).days).toEqual(["$Sunday", "$Monday", "$Tuesday", "$Wednesday", "$Thursday", "$Friday", "$Saturday"]);
            });
        });

        describe("WHEN logincompleted is raised by AuthenticateController after reset password", () => {
            beforeEach(() => {
                spyOn($state, "go");

                vm = <ap.viewmodels.MainViewModel>$controller("mainViewModel", { $scope: $scope, $state: $state });
                specHelper.utility.stubUserConnected(Utility);
                specHelper.general.raiseEvent(AuthenticateController, "logincompleted", new LoginCompletedEvent(Utility.UserContext.CurrentUser(), LoginType.PASSWORD, "html"));
            });
            it("THEN needLogin takes value 'true'", () => {
                expect(vm.needLogin).toBeTruthy();
            });
        });

        describe("WHEN logoutcompleted is raised by MainController", () => {
            it("THEN needLogin takes value 'true'", () => {
                vm = <ap.viewmodels.MainViewModel>$controller("mainViewModel", { $scope: $scope, $state: $state });
                specHelper.utility.stubUserConnected(Utility);
                spyOn($state, "go");
                spyOn(AuthenticateController, "logout").and.callThrough();
                spyOn(AuthenticateController, "isLoginIn").and.returnValue(true);
                AuthenticateController.logout();

                expect(AuthenticateController.logout).toHaveBeenCalled();
                expect(vm.needLogin).toBeTruthy();
                expect($location.path()).toEqual("/login");
            });
        });
    });

    describe("Feature: Main flow state change", () => {
        describe("WHEN mainflowstatechanged is raised by MainController", () => {
            describe("WHEN mainFlowState === MainFlow.Projects", () => {

                it("THEN location path changes to '/projects'", () => {
                    specHelper.utility.stubUserConnected(Utility);
                    spyOn(Utility.Storage.Session, "get");
                    spyOn($location, "search");
                    spyOn($state, "go");

                    vm = <ap.viewmodels.MainViewModel>$controller("mainViewModel", { $scope: $scope, $state: $state });

                    UIStateController.changeFlowState(ap.controllers.MainFlow.Projects);

                    expect(UIStateController.mainFlowState).toBe(ap.controllers.MainFlow.Projects);
                    expect($state.go).toHaveBeenCalledWith("projects", {}, { reload: true });
                });
            });

            describe("WHEN mainFlowState === MainFlow.Points", () => {

                it("THEN location path changes to '/points' AND ProjectId is removed from url", () => {
                    specHelper.utility.stubUserConnected(Utility);
                    specHelper.mainController.stub(MainController, Utility);
                    spyOn(Utility.Storage.Session, "get");
                    spyOn($location, "search");
                    spyOn($state, "go");

                    vm = <ap.viewmodels.MainViewModel>$controller("mainViewModel", { $scope: $scope, $state: $state });

                    UIStateController.changeFlowState(ap.controllers.MainFlow.Points);

                    expect(UIStateController.mainFlowState).toBe(ap.controllers.MainFlow.Points);
                    expect($state.go).toHaveBeenCalledWith("points", {}, { reload: true });
                });
            });

            describe("WHEN mainFlowState === MainFlow.Contacts", () => {
                it("THEN location path changes to '/projectcontacts' AND ProjectId is removed from url", () => {
                    specHelper.utility.stubUserConnected(Utility);
                    specHelper.mainController.stub(MainController, Utility);
                    spyOn(Utility.Storage.Session, "get");
                    spyOn($location, "search");
                    var stateGo = spyOn($state, "go");
                    vm = <ap.viewmodels.MainViewModel>$controller("mainViewModel", { $scope: $scope, $state: $state });
                    UIStateController.changeFlowState(ap.controllers.MainFlow.Contacts);
                    expect(UIStateController.mainFlowState).toBe(ap.controllers.MainFlow.Contacts);
                    expect(stateGo).toHaveBeenCalledWith("projectcontacts", {}, { reload: true });
                });
            });
            describe("WHEN mainFlowState === MainFlow.ProjectConfig", () => {
                it("THEN location path changes to '/projectconfig' AND ProjectId is removed from url", () => {
                    specHelper.utility.stubUserConnected(Utility);
                    specHelper.mainController.stub(MainController, Utility);
                    spyOn(Utility.Storage.Session, "get");
                    spyOn($location, "search");
                    var stateGo = spyOn($state, "go");
                    vm = <ap.viewmodels.MainViewModel>$controller("mainViewModel", { $scope: $scope, $state: $state });
                    UIStateController.changeFlowState(ap.controllers.MainFlow.ProjectConfig);
                    expect(UIStateController.mainFlowState).toBe(ap.controllers.MainFlow.ProjectConfig);
                    expect(stateGo).toHaveBeenCalledWith("projectconfig", {}, { reload: true });
                });
            });
        });
    });

    describe("Feature: AddActions", () => {
        describe("WHEN MainController addActions is initialized", () => {
            let mainAction: ap.viewmodels.home.ActionViewModel;
            let screenInfo: ap.misc.ScreenInfo;
            let actions: ap.viewmodels.home.ActionViewModel;
            let mSI: ap.misc.MainSearchInfo;
            let addActions: ap.viewmodels.home.ActionViewModel
            let tabScreen: ap.controllers.ScreenStep[] = [];

            beforeEach(() => {
                mSI = new ap.misc.MainSearchInfo(Utility, $timeout, null, null);
                actions = new ap.viewmodels.home.ActionViewModel(Utility, Utility.EventTool, "action4", "src", true,
                    [new ap.viewmodels.home.SubActionViewModel(Utility, Utility.EventTool, "subaction4")]);
                addActions = new ap.viewmodels.home.ActionViewModel(Utility, Utility.EventTool, "note.addpoint", "/Images/html/icons/ic_add_black_48px.svg", false, [
                    new ap.viewmodels.home.SubActionViewModel(Utility, Utility.EventTool, "note.addcomment", Utility.rootUrl + "/Images/html/icons/ic_insert_comment_black_48px.svg", false, true, false, "Add comment"),
                    new ap.viewmodels.home.SubActionViewModel(Utility, Utility.EventTool, "note.importdocument", Utility.rootUrl + "/Images/html/icons/ic_attach_file_black_48px.svg", false, true, false, "Attach document from folder structure"),
                    new ap.viewmodels.home.SubActionViewModel(Utility, Utility.EventTool, "note.adddocument", Utility.rootUrl + "/Images/html/icons/ic_file_upload_black_48px.svg", false, true, false, "Upload documents", true),
                ], "Add point", true);

                screenInfo = new ap.misc.ScreenInfo(Utility, "screenInfoName", ap.misc.ScreenInfoType.List, [actions], addActions, mSI, "title");
                tabScreen.push(new ap.controllers.ScreenStep(screenInfo, false, null, true));

                specHelper.general.spyProperty(ap.controllers.MainController.prototype, "currentVisibleScreens", specHelper.PropertyAccessor.Get).and.returnValue(tabScreen);

            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.controllers.MainController.prototype, "currentVisibleScreens", specHelper.PropertyAccessor.Get);
            });
            it("THEN, the mainViewModel will be built with the same addActions", () => {
                MainController.currentVisibleScreens.push(new ap.controllers.ScreenStep(screenInfo, false, null, true));
                vm = <ap.viewmodels.MainViewModel>$controller("mainViewModel", { $scope: $scope, $state: $state });
                expect(vm.addAction).toEqual(screenInfo.addAction);
            });
        });
    });

    describe("Feature: Log out", () => {
        describe("WHEN logout is called", () => {
            it("THEN AuthenticateController.logout is called", () => {
                vm = <ap.viewmodels.MainViewModel>$controller("mainViewModel", { $scope: $scope, $state: $state });

                spyOn(AuthenticateController, "logout");

                vm.logout();

                expect(AuthenticateController.logout).toHaveBeenCalled();
            });
        });
    });

    describe("Feature: goto setting", () => {
        describe("WHEN goto setting action click", () => {
            it("THEN utility.open is called with correct parameters to open new tab", () => {
                vm = <ap.viewmodels.MainViewModel>$controller("mainViewModel", { $scope: $scope, $state: $state });

                spyOn(Utility, "open");

                vm.gotoSettings();

                let expectedUrl = Utility.rootUrl + "MyAccount";
                let optionalData: any = {
                    UserContext: Utility.UserContext.getData(),
                    Language: Utility.Translator.getLanguage()
                };

                expect(Utility.open).toHaveBeenCalledWith("POST", expectedUrl, undefined, "_blank", optionalData);
            });
        });
    });

    describe("Feature: Action on item click", () => {
        let mainAction: ap.viewmodels.home.ActionViewModel;
        let screenInfo: ap.misc.ScreenInfo;
        let actions: ap.viewmodels.home.ActionViewModel[];
        let mSI: ap.misc.MainSearchInfo;

        beforeEach(() => {
            mSI = new ap.misc.MainSearchInfo(Utility, $timeout, null, null);
            actions = [
                new ap.viewmodels.home.ActionViewModel(Utility, Utility.EventTool, "Download", "", true, null, "", true, true),
                new ap.viewmodels.home.ActionViewModel(Utility, Utility.EventTool, "Delete", "", true, null, "", false, false),
            ];
            screenInfo = new ap.misc.ScreenInfo(Utility, "screenInfoName", ap.misc.ScreenInfoType.List, actions, actions[0], mSI, "title");
            MainController.currentVisibleScreens.push(new ap.controllers.ScreenStep(screenInfo, false, null, true));

            mainAction = new ap.viewmodels.home.ActionViewModel(Utility, Utility.EventTool, "Add");
            mainAction.addSubActions([new ap.viewmodels.home.SubActionViewModel(Utility, Utility.EventTool, "Add comment", null, true)]);
            mainAction.addSubActions([new ap.viewmodels.home.SubActionViewModel(Utility, Utility.EventTool, "Add doc", null, false)]);

        });
        describe("WHEN mainController.currentVisibleScreens.length > 0", () => {
            beforeEach(() => {
                specHelper.utility.stubUserConnected(Utility);
                vm = <ap.viewmodels.MainViewModel>$controller("mainViewModel", { $scope: $scope, $state: $state });
                MainController.initScreen(screenInfo);
                spyOn(vm.visibleScreens[0].screen, "addActionClick");

                vm.addActionClick("Download");
            });
            it("THEN MainController.addActionClick is called", () => {
                expect(vm.visibleScreens[0].screen.addActionClick).toHaveBeenCalledWith(new ap.controllers.AddActionClickEvent("Download"));
            });
        });
    });

    describe("Feature: get currentUser", () => {
        describe("When the getter currentUser is called", () => {
            it("THEN, the currentUser is returned", () => {
                spyOn(Utility.UserContext, "CurrentUser").and.returnValue({
                    Alias: "quentin.luc@aproplan.com",
                    DisplayName: "Quentin Luc"
                });

                vm = <ap.viewmodels.MainViewModel>$controller("mainViewModel", { $scope: $scope, $state: $state });

                expect(vm.currentUser.DisplayName).toEqual("Quentin Luc");
                expect(vm.currentUser.Alias).toEqual("quentin.luc@aproplan.com");
            });
        });
    });

    describe("Feature: isDocumentsState", () => {
        let spyState: jasmine.Spy;

        beforeEach(() => {
            vm = <ap.viewmodels.MainViewModel>$controller("mainViewModel", { $scope: $scope, $state: $state });

            spyState = specHelper.general.spyProperty(ap.controllers.UIStateController.prototype, "mainFlowState", specHelper.PropertyAccessor.Get);
        });

        afterEach(() => {
            specHelper.general.offSpyProperty(ap.controllers.UIStateController.prototype, "mainFlowState", specHelper.PropertyAccessor.Get);
        });

        describe("WHEN isDocumentState is called and the current state is documents", () => {
            it("THEN, true is returned", () => {
                spyState.and.returnValue(ap.controllers.MainFlow.Documents);

                expect(vm.isDocumentsState).toBeTruthy();
            });
        });

        describe("WHEN isDocumentState is called and the current state isn't documents", () => {
            it("THEN, true is returned", () => {
                spyState.and.returnValue(ap.controllers.MainFlow.Points);

                expect(vm.isDocumentsState).toBeFalsy();
            });
        });
    });

    describe("Feature: showtoast", () => {
        beforeEach(() => {
            vm = <ap.viewmodels.MainViewModel>$controller("mainViewModel", { $scope: $scope, $state: $state });

            specHelper.utility.stubUserConnected(Utility);
        });
        describe("WHEN the 'showtoast' event was fired from mainController ", () => {
            it("THEN, the mdToast.show will called with correct params", () => {
                let deferred = $q.defer();
                let noteAdded: ap.models.notes.Note = new ap.models.notes.Note(Utility);
                noteAdded.createByJson({ Id: "123", Code: "Note" });
                let param = {
                    messageKey: "message",
                    messageKeyParams: [noteAdded.Code],
                    mainActionKey: "GotoNote",
                    mainActionParam: noteAdded,
                    deferred: deferred
                };
                specHelper.general.raiseEvent(MainController, "showtoast", param);

                mdToastDeferred.resolve();
                $rootScope.$apply();

                expect($mdToast.show).toHaveBeenCalledWith(
                    jasmine.objectContaining(
                        { hideDelay: 5000, position: "bottom left", templateUrl: "me/PartialView?module=Components&name=genericToast" }
                    ));
            });
        });
    });

    describe("Feature: multiactions mode", () => {
        let multiActionsVm: ap.viewmodels.home.MultiActionsViewModel;
        let actions: ap.viewmodels.home.ActionViewModel[];
        let spyIsMultiActionMode: jasmine.Spy;
        let isMultiAction: boolean;
        beforeEach(() => {
            actions = [
                new ap.viewmodels.home.ActionViewModel(Utility, Utility.EventTool, "download.pic")
            ];
            multiActionsVm = new ap.viewmodels.home.MultiActionsViewModel(Utility, actions, ["1", "2"]);
            vm = <ap.viewmodels.MainViewModel>$controller("mainViewModel", { $scope: $scope, $state: $state });
            isMultiAction = false;
            spyIsMultiActionMode = specHelper.general.spyProperty(ap.controllers.MainController.prototype, "isMultiActionMode", specHelper.PropertyAccessor.Get);
            spyIsMultiActionMode.and.callFake(() => {
                return isMultiAction;
            });
        });
        afterEach(() => {
            specHelper.general.offSpyProperty(ap.controllers.MainController.prototype, "isMultiActionMode", specHelper.PropertyAccessor.Get);
        });
        describe("WHEN gotoMultiActionsMode is called with a multiactionviewmodel", () => {
            beforeEach(() => {
                spyOn(MainController, "gotoMultiActionsMode");
                vm.gotoMultiActionsMode(multiActionsVm);
                isMultiAction = true;
            });
            it("THEN, MainController.gotoMultiActionsMode is called with same parameter true", () => {
                expect(MainController.gotoMultiActionsMode).toHaveBeenCalledWith(multiActionsVm);
            });
            it("THEN, isMultiActionMode of mainController is used", () => {
                expect(vm.isMultiActionMode).toBeTruthy();
                expect(spyIsMultiActionMode).toHaveBeenCalled();
            });
        });
    });

    describe("Feature: isFullDetailMode", () => {
        beforeEach(() => {
            vm = <ap.viewmodels.MainViewModel>$controller("mainViewModel", { $scope: $scope, $state: $state });

            specHelper.general.spyProperty(ap.controllers.MainController.prototype, "currentVisibleScreens", specHelper.PropertyAccessor.Get).and.returnValue([{ screen: { isFullScreen: true } }]);
        });

        afterEach(() => {
            specHelper.general.offSpyProperty(ap.controllers.MainController.prototype, "currentVisibleScreens", specHelper.PropertyAccessor.Get);
        });

        describe("WHEN visibleScreens.length = 1 and isFullsScreen = true", () => {

            it("THEN isFullDetailMode should return true", () => {
                expect(vm.isFullDetailMode).toBe(true);
            });
        });
    });

    describe("Feature: forceHideMenu", () => {
        beforeEach(() => {
            vm = <ap.viewmodels.MainViewModel>$controller("mainViewModel", { $scope: $scope, $state: $state });
        });

        describe("WHEN lastVisibleScreen.hasNavBar is false", () => {
            beforeEach(() => specHelper.general.spyProperty(ap.viewmodels.MainViewModel.prototype, "visibleScreens", specHelper.PropertyAccessor.Get).and.returnValue([{ screen: { hasNavBar: false } }]));
            afterEach(() => specHelper.general.offSpyProperty(ap.viewmodels.MainViewModel.prototype, "visibleScreens", specHelper.PropertyAccessor.Get));

            it("THEN forceHideMenu return true", () => {
                expect(vm.forceHideMenu).toBeTruthy();
            });
        });

        describe("WHEN lastVisibleScreen.hasNavBar is true", () => {
            beforeEach(() => specHelper.general.spyProperty(ap.viewmodels.MainViewModel.prototype, "visibleScreens", specHelper.PropertyAccessor.Get).and.returnValue([{ screen: { hasNavBar: true } }]));
            afterEach(() => specHelper.general.offSpyProperty(ap.viewmodels.MainViewModel.prototype, "visibleScreens", specHelper.PropertyAccessor.Get));

            it("THEN forceHideMenu return false", () => {
                expect(vm.forceHideMenu).toBeFalsy();
            });
        });
    });

    describe("Feature: isFullEditMode", () => {
        beforeEach(() => {
            vm = <ap.viewmodels.MainViewModel>$controller("mainViewModel", { $scope: $scope, $state: $state });
        });

        describe("WHEN isEditMode = true and isFullScreen = true", () => {
            beforeEach(() => specHelper.general.spyProperty(ap.viewmodels.MainViewModel.prototype, "visibleScreens", specHelper.PropertyAccessor.Get).and.returnValue([{ screen: { isFullScreen: true, isEditMode: true } }]));
            afterEach(() => specHelper.general.offSpyProperty(ap.viewmodels.MainViewModel.prototype, "visibleScreens", specHelper.PropertyAccessor.Get));

            it("THEN, isFullEditMode should return true", () => {
                expect(vm.isFullEditMode).toBeTruthy();
            });
        });

        describe("WHEN one of isEditMode/isFullScreen is false", () => {
            beforeEach(() => specHelper.general.spyProperty(ap.viewmodels.MainViewModel.prototype, "visibleScreens", specHelper.PropertyAccessor.Get).and.returnValue([{ screen: { isFullScreen: false, isEditMode: true } }]));
            afterEach(() => specHelper.general.offSpyProperty(ap.viewmodels.MainViewModel.prototype, "visibleScreens", specHelper.PropertyAccessor.Get));

            it("THEN, isFullEditMode should return false", () => {
                expect(vm.isFullEditMode).toBeFalsy();
            });
        });

        describe("WHEN there is no visiblescreens", () => {
            beforeEach(() => specHelper.general.spyProperty(ap.viewmodels.MainViewModel.prototype, "visibleScreens", specHelper.PropertyAccessor.Get).and.returnValue([]));
            afterEach(() => specHelper.general.offSpyProperty(ap.viewmodels.MainViewModel.prototype, "visibleScreens", specHelper.PropertyAccessor.Get));

            it("THEN, isFullEditMode should return false", () => {
                expect(vm.isFullEditMode).toBeFalsy();
            });
        });
    });

    describe("Feature: isEditMode", () => {
        let screenInfo: ap.misc.ScreenInfo;
        let actions: ap.viewmodels.home.ActionViewModel[];
        let mSI: ap.misc.MainSearchInfo;
        let addAction: ap.viewmodels.home.ActionViewModel;
        beforeEach(() => {
            specHelper.utility.stubUserConnected(Utility);
            mSI = new ap.misc.MainSearchInfo(Utility, $timeout, null, null);
            actions = [
                new ap.viewmodels.home.ActionViewModel(Utility, Utility.EventTool, "Download", "", false, null, "", true, true),
            ];
            addAction = new ap.viewmodels.home.ActionViewModel(Utility, Utility.EventTool, "addAction");
            vm = <ap.viewmodels.MainViewModel>$controller("mainViewModel", { $scope: $scope, $state: $state });

        });

        describe("WHEN in currentVisibleScreens has screen with isEditMode = true ", () => {
            beforeEach(() => {
                screenInfo = new ap.misc.ScreenInfo(Utility, "screenOne", ap.misc.ScreenInfoType.List, actions, addAction, mSI, "", false, true);
                MainController.initScreen(screenInfo);
            });
            it("THEN isEditMode should be true", () => {
                expect(vm.isEditMode).toBeTruthy();
            });
        });

        describe("WHEN in currentVisibleScreens has only screen with isEditMode = false ", () => {
            beforeEach(() => {
                screenInfo = new ap.misc.ScreenInfo(Utility, "screenOne", ap.misc.ScreenInfoType.List, actions, addAction, mSI, "", false, false);
                MainController.initScreen(screenInfo);
            });
            it("THEN isEditMode should be true", () => {
                expect(vm.isEditMode).toBeFalsy();
            });
        });

    });

    describe("Feature: isCustomToolbar", () => {
        beforeEach(() => {
            vm = <ap.viewmodels.MainViewModel>$controller("mainViewModel", { $scope: $scope, $state: $state });
        });

        describe("WHEN one of visibleScreens has isCustomToolbar is true", () => {
            beforeEach(() => specHelper.general.spyProperty(ap.viewmodels.MainViewModel.prototype, "visibleScreens", specHelper.PropertyAccessor.Get).and.returnValue([{ screen: { isCustomToolbar: true } }, { screen: { isCustomToolbar: false } }]));
            afterEach(() => specHelper.general.offSpyProperty(ap.viewmodels.MainViewModel.prototype, "visibleScreens", specHelper.PropertyAccessor.Get));

            it("THEN, isCustomToolbar should return true", () => {
                expect(vm.isCustomToolbar).toBeTruthy();
            });
        });

        describe("WHEN each of visibleScreens has isCustomToolbar is false", () => {
            beforeEach(() => specHelper.general.spyProperty(ap.viewmodels.MainViewModel.prototype, "visibleScreens", specHelper.PropertyAccessor.Get).and.returnValue([{ screen: { isCustomToolbar: false } }, { screen: { isCustomToolbar: false } }]));
            afterEach(() => specHelper.general.offSpyProperty(ap.viewmodels.MainViewModel.prototype, "visibleScreens", specHelper.PropertyAccessor.Get));

            it("THEN, isCustomToolbar should return false", () => {
                expect(vm.isCustomToolbar).toBeFalsy();
            });
        });
    });

    describe("Feature: download queue process handlers", () => {
        beforeEach(() => {
            vm = <ap.viewmodels.MainViewModel>$controller("mainViewModel", { $scope: $scope, $state: $state });
        });
        describe("WHEN MainController is starting processing queue", () => {
            let massExportConfig: ap.models.massExport.MassExportConfiguration;
            beforeEach(() => {
                massExportConfig = new ap.models.massExport.MassExportConfiguration(Utility);
                massExportConfig.createByJson({
                    Id: "test-config-id",
                    Projects: [{
                        PlanIds: "test-plan-1;test-plan-2"
                    }]
                })
                MainController.downloadQueueInProcess(massExportConfig);
            });
            it("THEN, new download queue item is created and added to the list", () => {
                expect(vm.downloadQueueListVm.sourceItems).toBeDefined();
                expect(vm.downloadQueueListVm.sourceItems.length).toEqual(1);
                let queueItem = <ap.viewmodels.downloadqueue.DownloadQueueItemViewModel>vm.downloadQueueListVm.sourceItems[0];
                expect(queueItem.id).toEqual("test-config-id");
                expect(queueItem.docNumber).toEqual(2);
            });
        });

        describe("WHEN download queue have been processed", () => {
            let massExportConfig: ap.models.massExport.MassExportConfiguration;
            let exportDate: Date
            beforeEach(() => {
                exportDate = new Date();

                massExportConfig = new ap.models.massExport.MassExportConfiguration(Utility);
                massExportConfig.createByJson({
                    Id: "test-config-id",
                    Projects: [{
                        PlanIds: "test-plan-1;test-plan-2",
                    }],
                    EntityCreationDate: exportDate
                });

                massExportConfig.FileName = "archivefilename.zip";
                MainController.downloadQueueInProcess(massExportConfig); // 1 new queue item added
                MainController.downloadQueueProcessed(massExportConfig);
            });
            it("THEN, set the correct generation status for the queue item", () => {
                expect(vm.downloadQueueListVm.sourceItems).toBeDefined();
                expect(vm.downloadQueueListVm.sourceItems.length).toEqual(1);
                let queueItem = <ap.viewmodels.downloadqueue.DownloadQueueItemViewModel>vm.downloadQueueListVm.sourceItems[0];
                expect(queueItem.id).toEqual("test-config-id");
                expect(queueItem.isGenerated).toBeTruthy();
                expect(queueItem.zipName).toEqual("archivefilename.zip");
                expect(queueItem.availableDate).toEqual(exportDate.addDays(5));
            });
        });
    });

    describe("Feature: RefreshUser", () => {
        let userDefer: angular.IDeferred<ap.models.actors.User>;
        let testUserId: string;
        let currentUserExtended: ap.models.actors.User;
        beforeEach(() => {
            testUserId = "test-user-id";
            currentUserExtended = new ap.models.actors.User(Utility);
            currentUserExtended.createByJson({
                Id: testUserId,
                Alias: "test@example.com",
                DisplayName: "Test user",
                getLogoPath: "user logo",
                LanguageCode: "fr",
                Person: {
                    Id: "test-person-id",
                    Language: {
                        TranslationCode: "FR",
                        Code: "fr",
                        TranslatedName: "Français",
                        Name: "Français"
                    }
                }
            });

            vm = <ap.viewmodels.MainViewModel>$controller("mainViewModel", { $scope: $scope, $state: $state });
            userDefer = $q.defer();
            spyOn(UserController, "getUserById").and.returnValue(userDefer.promise);
            userDefer.resolve(currentUserExtended);
            spyOn(Utility.UserContext, "setCurrentUser");
            spyOn(Utility.Title, "setTitle");
        });
        describe("WHEN method is called", () => {
            describe("AND user changed its display name", () => {
                beforeEach(() => {
                    spyOn(Utility.UserContext, "CurrentUser").and.returnValue({ Id: testUserId, DisplayName: "Old test user" });
                    $window.RefreshUser();
                });

                it("THEN, controller method is called", () => {
                    expect(UserController.getUserById).toHaveBeenCalledWith(testUserId);
                });
                it("THEN, page title is updated", () => {
                    expect(Utility.Title.setTitle).toHaveBeenCalledWith("APROPLAN (Test user)");
                });
                it("THEN, current user instance is updated", () => {
                    expect(Utility.UserContext.setCurrentUser).toHaveBeenCalledWith(currentUserExtended);
                });
            });
            describe("AND user did not change its display name", () => {
                beforeEach(() => {
                    spyOn(Utility.UserContext, "CurrentUser").and.returnValue({ Id: testUserId, DisplayName: "Test user" });
                    $window.RefreshUser();
                });
                it("THEN, controller method is called", () => {
                    expect(UserController.getUserById).toHaveBeenCalledWith(testUserId);
                });
                it("THEN, current user instance is updated", () => {
                    expect(Utility.UserContext.setCurrentUser).toHaveBeenCalledWith(currentUserExtended);
                });
                it("THEN, page title is lnot updated", () => {
                    expect(Utility.Title.setTitle).not.toHaveBeenCalled();
                });
            });
            describe("AND user changed its language", () => {
                beforeEach(() => {
                    spyOn(Utility.UserContext, "CurrentUser").and.returnValue({ Id: testUserId, DisplayName: "Test user" });
                    spyOn(Utility.Translator, "getLanguage").and.returnValue("en");
                    $window.RefreshUser();
                });
                it("THEN, the new language is initialized for the app", () => {
                    expect(Utility.Translator.initLanguage).toHaveBeenCalledWith("fr_FR", "translations/");
                });
            });
            describe("AND user did not change its language", () => {
                beforeEach(() => {
                    spyOn(Utility.UserContext, "CurrentUser").and.returnValue({ Id: testUserId, DisplayName: "Test user" });
                    spyOn(Utility.Translator, "getLanguage").and.returnValue("fr");
                    $window.RefreshUser();
                });
                it("THEN, the new language is not initialized", () => {
                    expect(Utility.Translator.initLanguage).not.toHaveBeenCalled();
                });
            });
        });
    });

    describe("feature RefreshPassword", () => {
        beforeEach(() => {
            vm = <ap.viewmodels.MainViewModel>$controller("mainViewModel", { $scope: $scope, $state: $state });
        });
        describe("WHEN vm is initialized", () => {
            it("THEN, window object contains method onUpdatePassword", () => {
                expect($window["RefreshPassword"]).toBeDefined();

            });
        });
    });
});
