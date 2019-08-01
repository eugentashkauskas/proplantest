'use strict';
describe("Module ap-viewmodels - create account", () => {
    let $controller: ng.IControllerService, vm: ap.viewmodels.home.CreateAccontViewModel, UserService: ap.services.UserService, MainController: ap.controllers.MainController,
        Utility: ap.utility.UtilityHelper, Model: ap.models.Model, Api: ap.services.apiHelper.Api, _deferred: angular.IDeferred<ap.services.apiHelper.ApiResponse>, AuthenticateController: ap.controllers.AuthenticateController;
    let $q, $rootScope: angular.IRootScopeService, $scope: angular.IScope, $http, $timeout, $location;
    let ServicesManager: ap.services.ServicesManager;
    beforeEach(() => {
        let $window = specHelper.createWindowStub();
        $window.navigator.userLanguage = undefined;
        $window.navigator.language = 'en_US';
        angular.mock.module(function ($provide) {
            $provide.value('$window', $window);
        });
    });
    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });
    beforeEach(inject(function (_Utility_, _Model_, _Api_, _UserService_, _MainController_, _$controller_, _$q_, _$rootScope_, _$httpBackend_, _$timeout_, _$location_, _AuthenticateController_, _ServicesManager_) {
        $location = _$location_;
        $timeout = _$timeout_;
        $controller = _$controller_;
        Utility = _Utility_;
        Model = _Model_;
        Api = _Api_;
        ServicesManager = _ServicesManager_;
        UserService = _UserService_;
        MainController = _MainController_;
        AuthenticateController = _AuthenticateController_;
        $q = _$q_;
        $http = _$httpBackend_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        _deferred = $q.defer();
        spyOn(Utility.Translator, "getTranslation").and.callFake(function (key) {
            return "$" + key;
        });

        spyOn(Utility.Wootric, "run");
        spyOn(Utility.Wootric, "stop");
        spyOn($location, "path");
    }));

    describe("Feature: Default values", () => {
        it("can get an instance of my factory with default values", () => {
            vm = <ap.viewmodels.home.CreateAccontViewModel>$controller("createAccountViewModel", { $scope: $scope });
            expect(vm).toBeDefined();
            expect(vm.fullName).toBe("");
            expect(vm.alias).toBe("");
            expect(vm.password).toBe("");
            expect(vm.confirmPwd).toBe("");
            expect(vm.isTermsAccepted).toBeFalsy();
        });
        it("does some actions at the loading: force logout", () => {
            spyOn(AuthenticateController, "logout");
            vm = <ap.viewmodels.home.CreateAccontViewModel>$controller("createAccountViewModel", { $scope: $scope });        
            expect(AuthenticateController.logout).toHaveBeenCalled();
                
        });
        it("THEN, the terms and condition url is correctly computed", () => {
            vm = <ap.viewmodels.home.CreateAccontViewModel>$controller("createAccountViewModel", { $scope: $scope });        
            expect(vm.termsAndConditionUrl).toBe(Utility.apiUrl + "TermsAndConditions.pdf");
        });

        describe("WHEN the init method is called AND there is a param email in the url AND param fullName", () => {
            it("THEN, the Alias field has default value of the param email and fullName, the one of the param fullName", () => {

                spyOn(Utility.UrlTool, "getParam").and.callFake(function (arg) {
                    if (arg === 'email')
                        return "john.doe@test.com";
                    if (arg == "fullName")
                        return "John Doe";
                    return null;
                });
                vm = <ap.viewmodels.home.CreateAccontViewModel>$controller("createAccountViewModel", { $scope: $scope });
                vm.init();

                expect(vm.alias).toBe("john.doe@test.com");
                expect(vm.fullName).toBe("John Doe");
            });
        });
    });

    describe("Feature: The button create account is enabled or not", () => {
        beforeEach(() => {
            vm = <ap.viewmodels.home.CreateAccontViewModel>$controller("createAccountViewModel", { $scope: $scope });

            // call the method called by reCaptcha
            vm.getCaptchaReponseHandler("captcha");
        });
        describe("WHEN the alias, fullname, password, confirm and terms are accepted (=true)", () => {
            it("THEN, the create account is enabled", () => {
                vm.alias = "john.doe@test.com";
                vm.fullName = "John Doe";
                vm.password = "mypassword";
                vm.confirmPwd = "mypassword";
                vm.isTermsAccepted = true;

                expect(vm.canCreate).toBeTruthy();
            });
        });
        describe("WHEN the alias is empty", () => {
            it("THEN, the create account is disabled", () => {
                vm.alias = "";
                vm.fullName = "John Doe";
                vm.password = "mypassword";
                vm.confirmPwd = "mypassword";
                vm.isTermsAccepted = true;

                expect(vm.canCreate).toBeFalsy();
            });
        });
        describe("WHEN the fullname is empty", () => {
            it("THEN, the create account is disabled", () => {
                vm.alias = "john.doe@test.com";
                vm.fullName = "";
                vm.password = "mypassword";
                vm.confirmPwd = "mypassword";
                vm.isTermsAccepted = true;

                expect(vm.canCreate).toBeFalsy();
            });
        });
        describe("WHEN the password is empty", () => {
            it("THEN, the create account is disabled", () => {
                vm.alias = "john.doe@test.com";
                vm.fullName = "John Doe";
                vm.password = "";
                vm.confirmPwd = "mypassword";
                vm.isTermsAccepted = true;

                expect(vm.canCreate).toBeFalsy();
            });
        });
        describe("WHEN the confirmPwd is empty", () => {
            it("THEN, the create account is disabled", () => {
                vm.alias = "john.doe@test.com";
                vm.fullName = "John Doe";
                vm.password = "mypassword";
                vm.confirmPwd = "";
                vm.isTermsAccepted = true;

                expect(vm.canCreate).toBeFalsy();
            });
        });
        describe("WHEN the terms are not accepted", () => {
            it("THEN, the create account is disabled", () => {
                vm.alias = "john.doe@test.com";
                vm.fullName = "John Doe";
                vm.password = "mypassword";
                vm.confirmPwd = "mypassword";
                vm.isTermsAccepted = false;

                expect(vm.canCreate).toBeFalsy();
            });
        });
    });

    describe("Feature: Create account action", () => {
        beforeEach(() => {

            vm = <ap.viewmodels.home.CreateAccontViewModel>$controller("createAccountViewModel", { $scope: $scope, $location: $location });
            vm.alias = "john.doe@test.com";
            vm.fullName = "John Doe";
            vm.password = "mypassword";
            vm.confirmPwd = "mypassword";
            vm.isTermsAccepted = true;

            // call the method called by reCaptcha
            vm.getCaptchaReponseHandler("captcha");
        });
        afterEach(() => {
            $http.verifyNoOutstandingExpectation();
            $http.verifyNoOutstandingRequest();
        });
        describe("WHEN createAccount is called with all fields filled AND confirm password ok", () => {
            it("THEN, http://ipinfo.io is called to try to find the client country AND getMissingInfo is called with country code found, browser language and timezone offset", () => {

                spyOn(vm, "getMissingInfo");
                spyOn(Date.prototype, "getTimezoneOffset").and.returnValue(-300);
                $http.expectJSONP("http://ipinfo.io?callback=JSON_CALLBACK").respond({
                    "ip": "40.74.52.122",
                    "hostname": "No Hostname",
                    "city": "",
                    "region": "",
                    "country": "US",
                    "loc": "38.0000,-97.0000",
                    "org": "AS8075 Microsoft Corporation"
                });
                vm.createAccount();
                $http.flush();

                expect(vm.getMissingInfo).toHaveBeenCalledWith("en_US", "US", -300);

            });
        });
        describe("WHEN createAccount is called with all fields filled AND confirm password ok AND http://ipinfo.io failed", () => {
            it("THEN, getMissingInfo is called with default country 'BE' AND browser language and timezone offset", () => {

                spyOn(vm, "getMissingInfo");
                spyOn(Date.prototype, "getTimezoneOffset").and.returnValue(-300);
                $http.expectJSONP("http://ipinfo.io?callback=JSON_CALLBACK").respond(500);
                vm.createAccount();
                $http.flush();

                expect(vm.getMissingInfo).toHaveBeenCalledWith("en_US", "BE", -300);

            });
        });
        describe("WHEN createAccount is called AND confirmPwd is not the same of password", () => {
            let errMsgKey = 'app.err.pwdMismatch',
                errTitleKey = 'app.err.pwdMismatchTitle';
            it("THEN, the MainController.showErrorKey is called with '" + errMsgKey + "' AND '" + errTitleKey + "'", () => {
                spyOn(MainController, "showErrorKey");

                vm.confirmPwd = "otherpwd";
                vm.createAccount();

                expect(MainController.showErrorKey).toHaveBeenCalledWith(errMsgKey, errTitleKey, "", null);
            });
        });
        describe("WHEN getMissingInfo is called with languageCode, countryCode AND timezone offset", () => {
            let languageCode: string = "fr", countryCode: string = "BE", timezoneOffset: number = -60;
            let url: string;
            it("THEN, Api.ajaxJsonCall is called with url = '" + url + "' AND UserService.createAccount is called with all info of the user (language, country object and timezoneName "
                + "AND message is shown to user AND cancel method is called", () => {
                    url = Utility.apiUrl + "/ApiMe/GetNewAccountClientInfo?LanguageCode=" + encodeURIComponent(languageCode) + "&CountryCode=" + encodeURIComponent(countryCode)
                        + "&TimezoneOffset=" + encodeURIComponent(timezoneOffset.toString());
                    let paramMessage;
                    let messageClose = function (param) {
                        paramMessage = param;
                    };

                    MainController.on("showmessage", messageClose, this);

                    let defUsContrl = $q.defer();
                    let country = { Id: 'beff9665-1031-4aff-b08f-0c8b1c52d0cc', Code: "BE" };
                    let language = { Id: 'd1dfb667-a5d1-4bd7-b25f-b2d5047cfb61', Code: "be" };
                    spyOn(Model, "createByJson").and.callFake(function (arg) {
                        switch (arg) {
                            case "Language": return language;
                            case "Country": return country;
                            default: return null;
                        }
                    });

                    spyOn(Api, "ajaxJsonCall").and.returnValue(_deferred.promise);
                    spyOn(UserService, "createAccount").and.returnValue(defUsContrl.promise);
                    let spyShowMessage = spyOn(MainController, "showMessage").and.callThrough();
                    vm.getMissingInfo("fr", "BE", -60);

                    expect(Api.ajaxJsonCall).toHaveBeenCalledWith(url, ap.services.apiHelper.MethodType.Get, new ap.services.apiHelper.ApiOption(false));
                    let dataMissingInfo: any = {
                        data: {
                            Country: { Id: 'beff9665-1031-4aff-b08f-0c8b1c52d0cc' },
                            Language: { Id: 'd1dfb667-a5d1-4bd7-b25f-b2d5047cfb61' },
                            TimezoneName: "Romance Standard Time"
                        }
                    };
                    _deferred.resolve(dataMissingInfo);
                    $rootScope.$apply();
                    expect(UserService.createAccount).toHaveBeenCalledWith(vm.fullName, vm.alias, vm.password, language, "captcha", dataMissingInfo.data.TimezoneName, country);

                    defUsContrl.resolve({ data: {} });
                    $rootScope.$apply();

                    expect(spyShowMessage.calls.argsFor(0)[0]).toEqual("$app.createAccount.activationMail_msg");
                    expect(spyShowMessage.calls.argsFor(0)[1]).toEqual("$app.createAccount.activationMail_title");
                    expect(spyShowMessage.calls.argsFor(0)[2] instanceof Function).toBeTruthy();
                    expect(spyShowMessage.calls.argsFor(0)[3]).toEqual(ap.controllers.MessageButtons.Ok);

                    paramMessage.callback(ap.controllers.MessageResult.Positive);
                    expect($location.path).toHaveBeenCalledWith("/login");

                    MainController.off("showmessage", messageClose, this);
                });
        });
        describe("WHEN getMissingInfo is called AND the call to Api.ajaxJsonCall failed", () => {
            let defUsContrl;
            let paramMessage;
            let messageClose;
            var spyShowMessage: jasmine.Spy;
            let d: any;
            let language: ap.models.identFiles.Language;
            beforeEach(() => {
                defUsContrl = $q.defer();
                d = $q.defer();
                messageClose = function (param) {
                    paramMessage = param;
                };
                language = new ap.models.identFiles.Language(Utility);
                spyOn(ServicesManager.languageService, "getLanguageByCode").and.returnValue(d.promise);
                MainController.on("showmessage", messageClose, this);
                spyOn(Api, "ajaxJsonCall").and.returnValue(_deferred.promise);
                spyOn(UserService, "createAccount").and.returnValue(defUsContrl.promise);
                spyShowMessage = spyOn(MainController, "showMessage").and.callThrough();
                vm.getMissingInfo('fr', 'BE', -300);

                _deferred.reject({ data: 'error' });
                $rootScope.$apply();

                d.resolve(language);
                $rootScope.$apply();
            });
            it("THEN, UserService.createAccount is called only with info of the user (fullName, alias, password, captcha)", () => {
                expect(UserService.createAccount).toHaveBeenCalledWith(vm.fullName, vm.alias, vm.password, language, "captcha");
            });
            it("AND show message is called when createAccount called is resolved", () => {
                defUsContrl.resolve({ data: {} });
                $rootScope.$apply();
                expect(spyShowMessage.calls.argsFor(0)[0]).toEqual("$app.createAccount.activationMail_msg");
                expect(spyShowMessage.calls.argsFor(0)[1]).toEqual("$app.createAccount.activationMail_title");
                expect(spyShowMessage.calls.argsFor(0)[2] instanceof Function).toBeTruthy();
                expect(spyShowMessage.calls.argsFor(0)[3]).toEqual(ap.controllers.MessageButtons.Ok);

            });
            it("AND the user is redirected to the login page when he has clicks on OK of the messag", () => {
                defUsContrl.resolve({ data: {} });
                $rootScope.$apply();

                paramMessage.callback(ap.controllers.MessageResult.Positive);
                expect($location.path).toHaveBeenCalledWith("/login");

                MainController.off("showmessage", messageClose, this);
            });
        });
    });

    describe("Feature: cancel", () => {
        beforeEach(() => {
            vm = <ap.viewmodels.home.CreateAccontViewModel>$controller("createAccountViewModel", { $scope: $scope, $location: $location });
        });

        describe("WHEN the cancel method is called AND there is value for alias field", () => {
            let alias = "john.doe@test.com"
            it("THEN, Storage.Local.lastLogin is called with the empty string AND application is redirected to /login", () => {

                spyOn(Utility.Storage.Local, "lastLogin");
                vm.alias = alias;
                vm.cancel();
                expect(Utility.Storage.Local.lastLogin).toHaveBeenCalledWith("");
                expect($location.path).toHaveBeenCalledWith("/login");
            });
        });
        describe("WHEN the cancel method is called AND there is NO value for alias field", () => {
            it("THEN, application is redirected to /login", () => {
                vm.cancel();
                expect($location.path).toHaveBeenCalledWith("/login");
            });
        });
    });
}); 