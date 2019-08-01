"use strict";
describe("Module ap-viewmodels - ChangePasswordViewModel", () => {
    let Utility: ap.utility.UtilityHelper;
    let Api: ap.services.apiHelper.Api;
    let MainController: ap.controllers.MainController;
    let AuthenticateController: ap.controllers.AuthenticateController;
    let $controller: angular.IControllerService;
    let $rootScope: angular.IRootScopeService;
    let $scope: angular.IScope;
    let $q: angular.IQService;
    let $defer: angular.IDeferred<ap.services.apiHelper.ApiResponse>;
    let $location: angular.ILocationService;
    let $state: angular.ui.IStateService;
    let $mdDialog: angular.material.IDialogService;
    let UserContext: ap.utility.UserContext;
    let vm: ap.viewmodels.home.ChangePasswordViewModel;
    let mdDialogDeferred: angular.IDeferred<any>;
    beforeEach(angular.mock.module("ui.router"));
    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
        angular.mock.module(function ($provide) {
            $provide.factory('$mdDialog', ["$q", function ($q) {
                return specHelper.utility.stubShowMdDialog($q);
            }]);
        });
    });

    beforeEach(inject(function (_Utility_, _$controller_, _$rootScope_, _Api_, _$q_, _$location_, _$state_, _MainController_, _AuthenticateController_, _UserContext_, _$mdDialog_) {
        $controller = _$controller_;
        Utility = _Utility_;
        Api = _Api_;
        MainController = _MainController_;
        AuthenticateController = _AuthenticateController_;
        UserContext = _UserContext_
        $q = _$q_;
        $location = _$location_;
        $state = _$state_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        $defer = $q.defer();
        $mdDialog = _$mdDialog_;
    }));
    beforeEach(() => {
        specHelper.utility.stubUserConnected(Utility);
        specHelper.utility.stubRootUrl(Utility);
        spyOn(AuthenticateController, "initAndRunUtilities");
    });
    afterEach(() => {
        
    });
    describe("Feature : Default values", () => {
        it("When i init the new VM with isMandatory = true, then the VM will defined and have defaults values and canCancel = false", () => {
            vm = new ap.viewmodels.home.ChangePasswordViewModel(Utility, $mdDialog, $scope, MainController, AuthenticateController, new ap.controllers.ChangePasswordRequestEvent(true, null));
            expect(vm).toBeDefined();
            expect(vm.oldpassword).toBe("");
            expect(vm.newpassword).toBe("");
            expect(vm.confirmpassword).toBe("");
            expect(vm.canCancel).toBeFalsy();
            expect(vm.canChange).toBeFalsy();
        });
        it("When i init the new VM with isMandatory = false, then the VM will defined and have defaults values and canCancel = true", () => {
            vm = new ap.viewmodels.home.ChangePasswordViewModel(Utility, $mdDialog, $scope, MainController, AuthenticateController, new ap.controllers.ChangePasswordRequestEvent(false, null));
            expect(vm).toBeDefined();
            expect(vm.oldpassword).toBe("");
            expect(vm.newpassword).toBe("");
            expect(vm.confirmpassword).toBe("");
            expect(vm.canCancel).toBeTruthy();
            expect(vm.canChange).toBeFalsy();
        });
    });
    describe("Feature: canChange", () => {
        it("all fields are empty then the canChange = false", () => {
            vm = new ap.viewmodels.home.ChangePasswordViewModel(Utility, $mdDialog, $scope, MainController, AuthenticateController, new ap.controllers.ChangePasswordRequestEvent(false, null));
            expect(vm.canChange).toBeFalsy();
        });
        it("new password then the canChange = false", () => {
            vm = new ap.viewmodels.home.ChangePasswordViewModel(Utility, $mdDialog, $scope, MainController, AuthenticateController, new ap.controllers.ChangePasswordRequestEvent(false, null));
            vm.newpassword = "netika";
            expect(vm.canChange).toBeFalsy();
        });

        it("confirm password then the canChange = false", () => {
            vm = new ap.viewmodels.home.ChangePasswordViewModel(Utility, $mdDialog, $scope, MainController, AuthenticateController, new ap.controllers.ChangePasswordRequestEvent(false, null));
            vm.newpassword = "netika";
            vm.confirmpassword = "netika";
            expect(vm.canChange).toBeFalsy();
        });

        it("all are not empty and new and confirm are equals then the canReset = true", () => {
            vm = new ap.viewmodels.home.ChangePasswordViewModel(Utility, $mdDialog, $scope, MainController, AuthenticateController, new ap.controllers.ChangePasswordRequestEvent(false, null));
                vm.oldpassword = "netika123";
                vm.newpassword = "netika";
                vm.confirmpassword = "netika";
                expect(vm.canChange).toBeTruthy();
            });
        
    });

    describe("Feature: canCancel", () => {
        it("When the vm was init with the param isMandatory = true, then canCancel = false", () => {
            vm = new ap.viewmodels.home.ChangePasswordViewModel(Utility, $mdDialog, $scope, MainController, AuthenticateController, new ap.controllers.ChangePasswordRequestEvent(true, null));
            expect(vm.canCancel).toBeFalsy();
        });
        it("When the vm was init with the param isMandatory = false, then canCancel = true", () => {
            vm = new ap.viewmodels.home.ChangePasswordViewModel(Utility, $mdDialog, $scope, MainController, AuthenticateController, new ap.controllers.ChangePasswordRequestEvent(false, null));
            expect(vm.canCancel).toBeTruthy();
        });
    });

    describe("Feature : changePassword when IsTokenPwd = false", () => {
        beforeEach(() => {
            spyOn(Utility.Analytics, "initUser");
            let userData = {
                CurrentUser: {
                    Id: 'f07e9b89-f958-470b-9b81-eb147b105002',
                    Alias: "john.doe@test.com",
                    Name: "John Doe",
                },
                Password: "netikatest",
                Device: "Web",
                IsTokenPwd: false
            };
            UserContext.build(userData);
        });

        describe("When changePassword with old password not correct ", () => {
            it("THEN, have an error app.changepassword.invalid_oldpassword_message", () => {
                vm = new ap.viewmodels.home.ChangePasswordViewModel(Utility, $mdDialog, $scope, MainController, AuthenticateController, new ap.controllers.ChangePasswordRequestEvent(false, null));
                vm.oldpassword = "testOld";
                vm.newpassword = "netika";
                vm.confirmpassword = "netika";
                vm.changePassword();
                expect(vm.oldError.length).toEqual(1);
                expect(vm.oldError[0]).toEqual({
                    typeError: "app.changepassword.invalid_oldpassword_message"
                });
            });
        });

        describe("When changePassword with the newpassword same with the oldpassword ", () => {
            it("THEN, have an error app.changepassword.same_current_password_message", () => {
                vm = new ap.viewmodels.home.ChangePasswordViewModel(Utility, $mdDialog, $scope, MainController, AuthenticateController, new ap.controllers.ChangePasswordRequestEvent(false, null));
                vm.oldpassword = Utility.UserContext.Password();
                vm.newpassword = Utility.UserContext.Password();
                vm.confirmpassword = Utility.UserContext.Password();
                vm.changePassword();
                expect(vm.newError.length).toEqual(1);
                expect(vm.newError[0]).toEqual({
                    typeError: "app.changepassword.same_current_password_message"
                });
            });
        });

        describe("When changePassword with the newpassword less than 6 character ", () => {
            it("THEN, have an error app.changepassword.newpassword_less_message", () => {
                vm = new ap.viewmodels.home.ChangePasswordViewModel(Utility, $mdDialog, $scope, MainController, AuthenticateController, new ap.controllers.ChangePasswordRequestEvent(false, null));
                vm.oldpassword = Utility.UserContext.Password();
                vm.newpassword = "123";
                vm.confirmpassword = "123";
                vm.changePassword();
                expect(vm.newError.length).toEqual(1);
                expect(vm.newError[0]).toEqual({
                    typeError: "app.changepassword.newpassword_less_message"
                });
            });
        });

        describe("When changePassword with confirm password not correct with the new password ", () => {
            it("THEN, have an error app.err.pwdMismatch", () => {
                vm = new ap.viewmodels.home.ChangePasswordViewModel(Utility, $mdDialog, $scope, MainController, AuthenticateController, new ap.controllers.ChangePasswordRequestEvent(false, null));
                vm.oldpassword = Utility.UserContext.Password();
                vm.newpassword = "netika";
                vm.confirmpassword = "netika123";
                vm.changePassword();
                expect(vm.confirmError.length).toEqual(1);
                expect(vm.confirmError[0]).toEqual({
                    typeError: "app.err.pwdMismatch"
                });
            });
        });

        describe("When changePassword with all params are ok ", () => {
            it("THEN, the authenticateController.changePassword must be called", () => {
                spyOn(AuthenticateController, "changePassword");
                vm = new ap.viewmodels.home.ChangePasswordViewModel(Utility, $mdDialog, $scope, MainController, AuthenticateController, new ap.controllers.ChangePasswordRequestEvent(false, null));
                vm.oldpassword = Utility.UserContext.Password();
                vm.newpassword = "netika";
                vm.confirmpassword = "netika";
                vm.changePassword();
                expect(AuthenticateController.changePassword).toHaveBeenCalledWith(vm.oldpassword, vm.newpassword, vm.confirmpassword);
            });
        });

        describe("When the password have been changed and the UserContext fire this event ", () => {
            it("THEN, the dialog will closed and the information message will show", () => {
                spyOn(ap.controllers.MainController.prototype, "showMessageKey").and.returnValue($defer.promise);
                vm = new ap.viewmodels.home.ChangePasswordViewModel(Utility, $mdDialog, $scope, MainController, AuthenticateController, new ap.controllers.ChangePasswordRequestEvent(false, null));
                (<any>Utility.UserContext)._listener.raise("passwordchanged");
                $rootScope.$apply();
                expect($mdDialog.hide).toHaveBeenCalled();
                expect(ap.controllers.MainController.prototype.showMessageKey).toHaveBeenCalledWith("app.changepassword.success_message", "Information", null, ap.controllers.MessageButtons.Ok);
            });
        });

    });

    describe("Feature : changePassword when IsTokenPwd = true", () => {
        beforeEach(() => {
            spyOn(Utility.Analytics, "initUser");
            let userData = {
                CurrentUser: {
                    Id: 'f07e9b89-f958-470b-9b81-eb147b105002',
                    Alias: "john.doe@test.com",
                    Name: "John Doe",
                },
                Password: "netikatest",
                Device: "Web",
                IsTokenPwd: true
            };
            UserContext.build(userData);
        });

        describe("When changePassword with old password not correct and IsTokenPwd = true", () => {
            it("THEN, oldError is empty", () => {
                spyOn(AuthenticateController, "changePassword");
                vm = new ap.viewmodels.home.ChangePasswordViewModel(Utility, $mdDialog, $scope, MainController, AuthenticateController, new ap.controllers.ChangePasswordRequestEvent(false, null));
                vm.oldpassword = "testOld";
                vm.newpassword = "netika";
                vm.confirmpassword = "netika";
                vm.changePassword();
                expect(vm.oldError.length).toEqual(0);
                expect(AuthenticateController.changePassword).toHaveBeenCalledWith(vm.oldpassword, vm.newpassword, vm.confirmpassword);
                
            });
        });

        describe("When changePassword with the newpassword same with the oldpassword and IsTokenPwd = true", () => {
            it("THEN, newError is empty", () => {
                spyOn(AuthenticateController, "changePassword");
                vm = new ap.viewmodels.home.ChangePasswordViewModel(Utility, $mdDialog, $scope, MainController, AuthenticateController, new ap.controllers.ChangePasswordRequestEvent(false, null));
                vm.oldpassword = Utility.UserContext.Password();
                vm.newpassword = Utility.UserContext.Password();
                vm.confirmpassword = Utility.UserContext.Password();
                vm.changePassword();
                expect(vm.newError.length).toEqual(0);
                expect(AuthenticateController.changePassword).toHaveBeenCalledWith(vm.oldpassword, vm.newpassword, vm.confirmpassword);
            });
        });

        describe("When changePassword with the newpassword less than 6 character and IsTokenPwd = true", () => {
            it("THEN, have an error app.changepassword.newpassword_less_message", () => {
                vm = new ap.viewmodels.home.ChangePasswordViewModel(Utility, $mdDialog, $scope, MainController, AuthenticateController, new ap.controllers.ChangePasswordRequestEvent(false, null));
                vm.oldpassword = Utility.UserContext.Password();
                vm.newpassword = "123";
                vm.confirmpassword = "123";
                vm.changePassword();
                expect(vm.newError.length).toEqual(1);
                expect(vm.newError[0]).toEqual({
                    typeError: "app.changepassword.newpassword_less_message"
                });
            });
        });

        describe("When changePassword with confirm password not correct with the new password and IsTokenPwd = true", () => {
            it("THEN, have an error app.err.pwdMismatch", () => {
                vm = new ap.viewmodels.home.ChangePasswordViewModel(Utility, $mdDialog, $scope, MainController, AuthenticateController, new ap.controllers.ChangePasswordRequestEvent(false, null));
                vm.oldpassword = Utility.UserContext.Password();
                vm.newpassword = "netika";
                vm.confirmpassword = "netika123";
                vm.changePassword();
                expect(vm.confirmError.length).toEqual(1);
                expect(vm.confirmError[0]).toEqual({
                    typeError: "app.err.pwdMismatch"
                });
            });
        });

        describe("When changePassword with all params are ok and IsTokenPwd = true", () => {
            it("THEN, the authenticateController.changePassword must be called", () => {
                spyOn(AuthenticateController, "changePassword");
                vm = new ap.viewmodels.home.ChangePasswordViewModel(Utility, $mdDialog, $scope, MainController, AuthenticateController, new ap.controllers.ChangePasswordRequestEvent(false, null));
                vm.oldpassword = "aaa";
                vm.newpassword = "netika";
                vm.confirmpassword = "netika";
                vm.changePassword();
                expect(AuthenticateController.changePassword).toHaveBeenCalledWith(vm.oldpassword, vm.newpassword, vm.confirmpassword);
            });
        });

    });


    describe("Feature: closeDialog", () => {
        it("When closeDialog was called, then the dialog will be close", () => {
            vm = new ap.viewmodels.home.ChangePasswordViewModel(Utility, $mdDialog, $scope, MainController, AuthenticateController, new ap.controllers.ChangePasswordRequestEvent(false, null));
            vm.closeDialog();
            $rootScope.$apply();
            expect($mdDialog.hide).toHaveBeenCalled();
        });
    });
}); 