'use strict';
describe("Module ap-viewmodels - login", () => {
    let $controller: angular.IControllerService, UserService: ap.services.UserService,
        AuthenticateController: ap.controllers.AuthenticateController, MainController: ap.controllers.MainController, Utility: ap.utility.UtilityHelper,
        _deferred: angular.IDeferred<ap.services.apiHelper.ApiResponse>;
    let $q: angular.IQService, $rootScope: angular.IRootScopeService, $scope: angular.IScope, $mdDialog: angular.material.IDialogService;
    let $provide;
    let $stateParams: angular.ui.IStateParamsService;
    let loginViewModel: ap.viewmodels.home.LoginViewModel;
    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });
    beforeEach(angular.mock.module(function (_$provide_) {
        $provide = _$provide_;
    }));
    beforeEach(inject(function (_Utility_, _UserService_, _AuthenticateController_, _MainController_, _$controller_, _$q_, _$rootScope_) {
        $controller = _$controller_;
        Utility = _Utility_;
        UserService = _UserService_;
        AuthenticateController = _AuthenticateController_;
        MainController = _MainController_;
        $stateParams = null;
        $q = _$q_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        $mdDialog = specHelper.utility.stubShowMdDialog($q);
        specHelper.utility.stubUserConnected(Utility);
        $provide.value('$mdDialog', $mdDialog);

        modelSpecHelper.setUtilityModule(_Utility_);
        _deferred = $q.defer();
        spyOn(Utility.Translator, "getTranslation").and.callFake(function (key) {
            return "$" + key;
        });
        
    }));
    describe("Feature: Default values", () => {
        it("can get an instance of my factory with default values", () => {
            loginViewModel = <ap.viewmodels.home.LoginViewModel>$controller("loginViewModel", { $scope: $scope, $stateParams: $stateParams });
            expect(loginViewModel).toBeDefined();
            expect(loginViewModel.needActivationEmail).toBeFalsy();
            expect(loginViewModel.hasError).toBeFalsy();
            expect(loginViewModel.canSendForgotPwd).toBeFalsy();
            expect(loginViewModel.isRememberMe).toBeFalsy();

        });
        it("does some actions at the loading: force logout, load language", () => {
            spyOn(AuthenticateController, "logout");

            loginViewModel = <ap.viewmodels.home.LoginViewModel>$controller("loginViewModel", { $scope: $scope, $stateParams: $stateParams });
            expect(AuthenticateController.logout).toHaveBeenCalled();
        });
        describe("WHEN a default Alias is defined in the url", () => {
            it("THEN, the login is automatically filled with this value", () => {
                let defaultAlias = "john.doe@test.com";
                spyOn(Utility.UrlTool, "getParam").and.callFake(function (arg) {
                    if (arg === "alias")
                        return encodeURIComponent(defaultAlias);
                    return null;
                });

                loginViewModel = <ap.viewmodels.home.LoginViewModel>$controller("loginViewModel", { $scope: $scope, $stateParams: $stateParams });
                expect(loginViewModel.login).toBe(defaultAlias);
            });
        });
        describe("WHEN a user make a login with remember AND he goes again at the login page", () => {
            it("THEN, the login and password is filled automatically and the process login is executed", () => {
                spyOn(AuthenticateController, "login").and.returnValue(_deferred.promise);
                spyOn(Utility.Storage.Local, "lastUser").and.returnValue({ CurrentUser: { Alias: "john.doe@test.com" }, Password: "passtest" });

                loginViewModel = <ap.viewmodels.home.LoginViewModel>$controller("loginViewModel", { $scope: $scope, $stateParams: $stateParams });

                expect(loginViewModel.login).toBe("john.doe@test.com");
                expect(loginViewModel.password).toBe("passtest");
                expect(AuthenticateController.login).toHaveBeenCalledWith("john.doe@test.com", "passtest", loginViewModel.isRememberMe, undefined);
            });
        });
        describe("WHEN a user make a login without remember me AND goes again at the login page", () => {
            it("THEN, the login is filled automatically with the last login", () => {
                let defaultAlias = "john.doe@test.com";
                spyOn(Utility.Storage.Local, "lastLogin").and.returnValue(defaultAlias);
                loginViewModel = <ap.viewmodels.home.LoginViewModel>$controller("loginViewModel", { $scope: $scope, $stateParams: $stateParams });
                expect(loginViewModel.login).toBe(defaultAlias);
            });
        });
    });

    describe("Feature: The button login is enabled or not", () => {
        beforeEach(() => {
            loginViewModel = <ap.viewmodels.home.LoginViewModel>$controller("loginViewModel", { $scope: $scope, $stateParams: $stateParams });
        });
        describe("WHEN the login and password is not empty", () => {
            it("THEN, the login is enable", () => {
                loginViewModel.login = "john.doe@test.com";
                loginViewModel.password = "mypassword";

                expect(loginViewModel.canLogin()).toBeTruthy();
            });
        });
        describe("WHEN the login is not empty and password is empty", () => {
            it("THEN, the login is disable", () => {
                loginViewModel.login = "john.doe@test.com";
                loginViewModel.password = "";

                expect(loginViewModel.canLogin()).toBeFalsy();
            });
        });
        describe("WHEN the login is empty and password is NOT empty", () => {
            it("THEN, the login is disable", () => {
                loginViewModel.login = "";
                loginViewModel.password = "testpwd";

                expect(loginViewModel.canLogin()).toBeFalsy();
            });
        });
        describe("Feature make the login", () => {
            beforeEach(() => {
                loginViewModel = <ap.viewmodels.home.LoginViewModel>$controller("loginViewModel", { $scope: $scope, $stateParams: $stateParams });
                loginViewModel.login = "john.doe@test.com";
                loginViewModel.password = "mypassword";
            });
            describe("GIVEN a login matching the supplied password AND isRememberMe is not checked WHEN the user clicks on the login button", () => {
                it("THEN, the user is logged to aproplan and redirected to main page of Aproplan", () => {
                    loginViewModel.isRememberMe = false;

                    spyOn(AuthenticateController, "login").and.returnValue(_deferred.promise);
                    loginViewModel.processLogin();

                    expect(AuthenticateController.login).toHaveBeenCalledWith(loginViewModel.login, loginViewModel.password, loginViewModel.isRememberMe, undefined);

                    let result = new ap.services.apiHelper.ApiResponse(modelSpecHelper.createUserJson("Doe", "John", "45645", false));

                    _deferred.resolve(result);

                    $rootScope.$apply();
                });
            });
            describe("GIVEN a login matching the supplied password AND $stateParams having bootInfo value defined WHEN the processLogin is called", () => {
                it("THEN, AuthenticateController is called with the login/password AND bootinfo object", () => {
                    $stateParams = {};
                    $stateParams["bootInfo"] = new ap.misc.BootAppInfo(ap.controllers.MainFlow.Points, "75100", "00145");
                    loginViewModel = <ap.viewmodels.home.LoginViewModel>$controller("loginViewModel", { $scope: $scope, $stateParams: $stateParams });
                    loginViewModel.login = "john.doe@test.com";
                    loginViewModel.password = "mypassword";

                    loginViewModel.isRememberMe = false;
                    
                    spyOn(AuthenticateController, "login").and.returnValue(_deferred.promise);
                    loginViewModel.processLogin();

                    expect(AuthenticateController.login).toHaveBeenCalledWith(loginViewModel.login, loginViewModel.password, loginViewModel.isRememberMe, $stateParams["bootInfo"]);

                    let result = new ap.services.apiHelper.ApiResponse(modelSpecHelper.createUserJson("Doe", "John", "45645", false));

                    _deferred.resolve(result);

                    $rootScope.$apply();
                });
            });
            describe("GIVEN a login not matching with the password supplied AND the user clicks on the login button", () => {
                it("THEN, an error message is displayed AND hasError = true AND needActivationEmail = false ", () => {
                    loginViewModel.isRememberMe = false;

                    spyOn(AuthenticateController, "login").and.returnValue(_deferred.promise);
                    loginViewModel.processLogin();

                    expect(AuthenticateController.login).toHaveBeenCalledWith(loginViewModel.login, loginViewModel.password, loginViewModel.isRememberMe, undefined);

                    _deferred.reject({
                        type: "InvalidUserPwd",
                        error: "Authenticate_InvalidUserOrPass"
                    });

                    $rootScope.$apply();
                    expect(loginViewModel.hasError).toBeTruthy();
                    expect(loginViewModel.needActivationEmail).toBeFalsy();

                    expect(loginViewModel.errorMsg).toBe("$app.err.Authenticate_InvalidUserOrPass");
                });
            });
            describe("GIVEN a login is matching with the password supplied AND the user account is not yet activated WHEN the user clicks on the login button", () => {
                it("THEN, an error message is displayed AND hasError = true AND needActivationEmail = true ", () => {
                    loginViewModel.isRememberMe = false;

                    spyOn(AuthenticateController, "login").and.returnValue(_deferred.promise);
                    loginViewModel.processLogin();

                    expect(AuthenticateController.login).toHaveBeenCalledWith(loginViewModel.login, loginViewModel.password, loginViewModel.isRememberMe, undefined);

                    _deferred.reject({
                        type: "NotActivated",
                        error: "NotActivatedUserMessage"
                    });

                    $rootScope.$apply();
                    expect(loginViewModel.hasError).toBeTruthy();
                    expect(loginViewModel.needActivationEmail).toBeTruthy();

                    expect(loginViewModel.errorMsg).toBe("$app.err.NotActivatedUserMessage");
                });
            });
        });

        describe("Feature: go to create account", () => {
            beforeEach(() => {
                loginViewModel = <ap.viewmodels.home.LoginViewModel>$controller("loginViewModel", { $scope: $scope, $stateParams: $stateParams });
            });
            describe("WHEN the user clicks on 'Create account'", () => {
                it("THEN, the MainController.goCreateAccount is called", () => {
                    spyOn(MainController, "goCreateAccount");

                    loginViewModel.goCreateAccount();
                    expect(MainController.goCreateAccount).toHaveBeenCalled();
                });
            });
        });

        describe("Feature: go to password step", () => {
            beforeEach(() => {
                loginViewModel = <ap.viewmodels.home.LoginViewModel>$controller("loginViewModel", { $scope: $scope, $stateParams: $stateParams });
            });
            describe("WHEN the user clicks on 'Next' and the login field contains a value", () => {
                it("THEN, isPasswordStep is true", () => {
                    loginViewModel.login = "luc.quentin@gmail.com";
                    loginViewModel.goToPasswordStep();
                    expect(loginViewModel.isPasswordStep).toBeTruthy();
                });
            });
            describe("WHEN the user clicks on 'Next' and the login field is empty", () => {
                it("THEN, isPasswordStep is false", () => {
                    loginViewModel.goToPasswordStep();
                    expect(loginViewModel.isPasswordStep).toBeFalsy();
                });
            });
        });

        describe("Feature: go to login step", () => {
            beforeEach(() => {
                loginViewModel = <ap.viewmodels.home.LoginViewModel>$controller("loginViewModel", { $scope: $scope, $stateParams: $stateParams });
            });
            describe("WHEN the user clicks on 'Back' button when he's in the password step", () => {
                it("THEN, isPasswordStep is false and hasError = false", () => {
                    loginViewModel.login = "luc.quentin@gmail.com";
                    loginViewModel.goToLoginStep();
                    expect(loginViewModel.isPasswordStep).toBeFalsy();
                    expect(loginViewModel.hasError).toBeFalsy();
                });
            });
        });

        describe("Feature: go forgotPassword mode", () => {
            beforeEach(() => {
                loginViewModel = <ap.viewmodels.home.LoginViewModel>$controller("loginViewModel", { $scope: $scope, $stateParams: $stateParams });
            });
            describe("WHEN the user clicks on 'ForgotPassword'", () => {
                it("THEN, the mailForgotPassword = current login AND isForgotPwdMode = true AND the mdDialog is showed", () => {

                    loginViewModel.login = "John.doe@test.com";
                    loginViewModel.forgotPassword();
                    expect(loginViewModel.mailForgotPassword).toBe("John.doe@test.com");
                    expect($mdDialog.show).toHaveBeenCalled();
                });
            });

            describe("WHEN the user confirm the reset off password when forgotten'", () => {
                it("THEN, UserService.sendMailForgotPwd is called wtith the mail supplied AND at callback the forgetPasswordMode is set to false AND message is displayed", () => {
                    spyOn(UserService, "sendMailForgotPwd").and.returnValue(_deferred.promise);
                    spyOn(MainController, "showMessageKey");

                    loginViewModel.forgotPassword();
                    loginViewModel.mailForgotPassword = "John.doe@test.com";
                    loginViewModel.sendForgotPwd();

                    expect(UserService.sendMailForgotPwd).toHaveBeenCalledWith("John.doe@test.com");

                    _deferred.resolve(new ap.services.apiHelper.ApiResponse("ok"));
                    $rootScope.$apply();

                    expect(loginViewModel.hasError).toBeFalsy();
                    expect(loginViewModel.errorMsg).toBe("");

                    expect(MainController.showMessageKey).toHaveBeenCalledWith("app.login.forgotMailSent", "app.login.passwordMailSentTitle", null, ap.controllers.MessageButtons.Ok);
                });
            });
        });
        describe("Feature: sendActivationEmail", () => {
            beforeEach(() => {
                loginViewModel = <ap.viewmodels.home.LoginViewModel>$controller("loginViewModel", { $scope: $scope, $stateParams: $stateParams });
            });
            describe("WHEN needActivationEmail = true AND the user clicks on the send activation mail button", () => {
                it("THEN, the UserService.sendActivationEmail is called with the login AND needActivationEmail = false", () => {
                    let deferred2 = $q.defer();
                    spyOn(AuthenticateController, "login").and.returnValue(_deferred.promise);
                    spyOn(UserService, "sendActivationEmail").and.returnValue(deferred2.promise);
                    loginViewModel.login = "john.doe@test.com";
                    loginViewModel.password = "mypassword";

                    loginViewModel.processLogin();

                    _deferred.reject({
                        error: "NotActivatedUserMessage",
                        type: "NotActivated"
                    });
                    $rootScope.$apply();

                    expect(loginViewModel.needActivationEmail).toBeTruthy();
                    loginViewModel.sendActivationEmail();

                    expect(UserService.sendActivationEmail).toHaveBeenCalledWith("john.doe@test.com");
                    deferred2.resolve(new ap.services.apiHelper.ApiResponse(null));
                    $rootScope.$apply();
                    expect(loginViewModel.needActivationEmail).toBeFalsy();
                });
            });

            describe("WHEN needActivationEmail = false AND the user clicks on the send activation mail button", () => {
                it("THEN, the UserService.sendActivationEmail is NOT called with the login", () => {
                    loginViewModel.login = "john.doe@test.com";
                    expect(loginViewModel.needActivationEmail).toBeFalsy();

                    spyOn(UserService, "sendActivationEmail");

                    loginViewModel.sendActivationEmail();
                    expect(UserService.sendActivationEmail).not.toHaveBeenCalled();

                    expect(loginViewModel.needActivationEmail).toBeFalsy();
                });
            });
        });
    });

});