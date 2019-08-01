"use strict";
describe("Module ap-viewmodels - Forgotten password", () => {
    let Utility: ap.utility.UtilityHelper, Api: ap.services.apiHelper.Api, MainController: ap.controllers.MainController;
    let $controller: angular.IControllerService, $rootScope: angular.IRootScopeService, $scope: angular.IScope,
        $q: angular.IQService, $defer: angular.IDeferred<ap.services.apiHelper.ApiResponse>,
        $location: angular.ILocationService, $state: angular.ui.IStateService;
    let vm: ap.viewmodels.home.ForgottenPasswordViewModel;
    let vmNotLogin: ap.viewmodels.home.ForgottenPasswordViewModel;

    let $window = specHelper.createWindowStub();
    
    beforeEach(angular.mock.module("ui.router"));

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject(function (_Utility_, _$controller_, _$rootScope_, _Api_, _$q_, _$location_, _$state_, _MainController_) {
        $controller = _$controller_;
        Utility = _Utility_;
        Api = _Api_;
        MainController = _MainController_;
        $q = _$q_;
        $location = _$location_;
        $state = _$state_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        $defer = $q.defer();
        $window.reset();
    }));

    beforeEach(() => {
        vmNotLogin = <ap.viewmodels.home.ForgottenPasswordViewModel>$controller("forgottenPasswordViewModel", { $scope: $scope, $window: $window});
        specHelper.utility.stubUserConnected(Utility);
        specHelper.utility.stubRootUrl(Utility);
        vm = <ap.viewmodels.home.ForgottenPasswordViewModel>$controller("forgottenPasswordViewModel", { $scope: $scope, $window: $window });
    });

    afterEach(() => {
        $window.reset();
    });

    describe("Default values", () => {
        it("Alias is empty before finish login", () => {
            expect(vmNotLogin.alias).not.toBeDefined();
        });
        it("can get an instance of my viewmodel with default values", () => {
            expect(vm).toBeDefined();
        });
        it("can get an instance of my viewmodel with default values", () => {
            expect(vm.alias).toBe(Utility.UserContext.CurrentUser().Alias);
        });
        it("can get an instance of my viewmodel with default values", () => {
            expect(vm.newpassword).toBe("");
            expect(vm.confirmpassword).toBe("");
        });
    });

    describe("Feature: canReset", () => {
        describe("WHEN there is at least one filled empty", () => {
            it("all fields are empty then the canReset = false", () => {
                expect(vm.canReset).toBeFalsy();
            }); 
            it("new password then the canReset = false", () => {
                vm.newpassword = "netika";
                expect(vm.canReset).toBeFalsy();
            }); 

            it("confirm password then the canReset = false", () => {
                vm.confirmpassword = "netika";
                expect(vm.canReset).toBeFalsy();
            });

            it("all are not empty and new and confirm are equals then the canReset = true", () => {
                vm.newpassword = "netika";
                vm.confirmpassword = "netika";
                expect(vm.canReset).toBeTruthy();
            }); 
        });
    });

    describe("Feature: resetPassword", () => {
        describe("WHEN the reset password is called and the new & confirm password doesn't match", () => {
            it("THEN confirmError contains 'app.err.pwdMismatch' key and result = false", () => {
                vm.newpassword = "netika";
                vm.confirmpassword = "aproplan";
                let result = vm.resetPassword();
                expect(result).toBeFalsy();
                expect(vm.confirmError).toEqual([{
                    typeError: "app.err.pwdMismatch"
                }]);
            });
        });

        describe("WHEN the reset password is called and the new & confirm are empty", () => {
            it("THEN nothing happens and false is returned", () => {
                vm.newpassword = "";
                vm.confirmpassword = "";
                let result = vm.resetPassword();
                expect(result).toBeFalsy();
                expect(vm.confirmError).toEqual([]);
            });
        });

        describe("WHEN the reset password is called and the new & confirm good", () => {
            
            beforeEach(() => {
                spyOn(Api, "getApiResponse").and.returnValue($defer.promise);
                spyOn($state, "go");
                spyOn($location, "path");
                spyOn(MainController, "showMessageKey").and.callThrough();
                vm.newpassword = "aproplan";
                vm.confirmpassword = "aproplan";
            });

            it("THEN, the method returned true and the Api is called with PUT method on url '/rest/changepasswordbytoken'", () => {
                let result = vm.resetPassword();
                expect(result).toBeTruthy();
                expect(vm.confirmError).toEqual([]);
                let token = "testpwd"
                expect(Api.getApiResponse).toHaveBeenCalledWith("/rest/changepasswordbytoken?t="+token, ap.services.apiHelper.MethodType.Put, null, "aproplan");
            });

            it("When the API callback has error THEN, error msg is shown and user is not redirected", () => {
                let result = vm.resetPassword();
                $defer.reject("NOT OK");
                $rootScope.$apply();

                expect($window.location.href).toBe("");
                expect($state.go).not.toHaveBeenCalled();
            });

            it("When the API callback has no error AND need to redirect to SL THEN, success message is displayed to the user", () => {
                let result = vm.resetPassword();
                $defer.resolve(new ap.services.apiHelper.ApiResponse(0));
                $rootScope.$apply();
                expect(MainController.showMessageKey).toHaveBeenCalled();
                let args = (<jasmine.Spy>MainController.showMessageKey).calls.argsFor(0);
                expect(args[0]).toBe("app.forgottenpwd.change_success");
                expect(args[1]).toBe("app.forgottenpwd.change_success_title");
            });

            it("When the API callback has no error AND need to redirect to SL THEN, the user is redirected to the login page of SL", () => {
                spyOn(Utility.Storage.Session, "get").and.callFake((key) => {
                    if (key === "forgotpwdapp")
                        return "silverlight";
                    return null;
                });
                let result = vm.resetPassword();
                $defer.resolve(new ap.services.apiHelper.ApiResponse(0));
                $rootScope.$apply();
                let args = (<jasmine.Spy>MainController.showMessageKey).calls.argsFor(0);
                args[2]();

                expect($window.location.href).toBe("https://app.aproplan.com/");
            });

            it("When the API callback has no error AND need to redirect has no value or not SL THEN, the user is redirected to the login page of html", () => {
                spyOn(Utility.Storage.Session, "get").and.returnValue(null);
                let result = vm.resetPassword();
                $defer.resolve(new ap.services.apiHelper.ApiResponse(0));
                $rootScope.$apply();
                let args = (<jasmine.Spy>MainController.showMessageKey).calls.argsFor(0);
                args[2]();

                expect($state.go).toHaveBeenCalledWith("login");
            });
        });
    });
});