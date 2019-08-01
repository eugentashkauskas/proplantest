'use strict';
describe("Module ap-viewmodels - MessageDialogViewModel", () => {
    let $controller: ng.IControllerService, vm: ap.viewmodels.home.MessageDialogViewModel;
    let Utility: ap.utility.UtilityHelper, _deferred: angular.IDeferred<ap.services.apiHelper.ApiResponse>;
    let $q, $rootScope: angular.IRootScopeService, $scope: angular.IScope;
    let $mdPanel: any;
    let $mdPanelRef: any;
    let mdPanelRefDeferred: angular.IDeferred<any>;

    beforeEach(() => {
        angular.mock.module("ui.router");
        angular.mock.module("ngMaterial");
        angular.mock.module("matchMedia");
    });

    beforeEach(() => {
        angular.mock.module(function ($provide) {
            $provide.factory('$mdPanelRef', ["$q", function ($q) {
                return specHelper.utility.stubMdPanelRef($q);
            }]);
        });
    });

    beforeEach(() => {
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject(function (_$q_, _$controller_, _$rootScope_, _Utility_, _$mdPanelRef_) {
        $controller = _$controller_;
        $mdPanelRef = _$mdPanelRef_;
        Utility = _Utility_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        $q = _$q_;
        _deferred = $q.defer();
        mdPanelRefDeferred = (<any>$mdPanelRef).deferred;
    }));

    describe("Factory", () => {
        let param: any;
        let callbackResult: any;
        beforeEach(() => {
            callbackResult = jasmine.createSpy("callback");
            param = {
                callback: callbackResult
            }
            vm = new ap.viewmodels.home.MessageDialogViewModel($mdPanelRef, param);
            
        });

        describe("Feature: Default values", () => {
            it("can get an instance of my factory with default values", () => {
                expect(vm).toBeDefined();
            });
        });

        describe("Feature: acceptDialog", () => {

            beforeEach(() => {
                vm.acceptDialog();
            });

            describe("WHEN acceptDialog is called", () => {
                it("THEN, the param.callback will be call with 'ap.controllers.MessageResult.Positive'", () => {
                    expect(callbackResult).toHaveBeenCalledWith(ap.controllers.MessageResult.Positive);
                });

                it("AND, mdPanelRef.close will be call", () => {
                    expect($mdPanelRef.close).toHaveBeenCalled();
                });

                it("AND, mdPanelRef.destroy will be call", () => {
                    mdPanelRefDeferred.resolve(true);
                    $rootScope.$apply();
                    expect($mdPanelRef.destroy).toHaveBeenCalled();
                });
            });
        });

        describe("Feature: cancelDialog", () => {

            beforeEach(() => {
                vm.cancelDialog();
            });

            describe("WHEN cancelDialog is called", () => {
                it("THEN, the param.callback will be call with 'ap.controllers.MessageResult.Negative'", () => {
                    expect(callbackResult).toHaveBeenCalledWith(ap.controllers.MessageResult.Negative);
                });

                it("AND, mdPanelRef.close will be call", () => {
                    expect($mdPanelRef.close).toHaveBeenCalled();
                });

                it("AND, mdPanelRef.destroy will be call", () => {
                    mdPanelRefDeferred.resolve(true);
                    $rootScope.$apply();
                    expect($mdPanelRef.destroy).toHaveBeenCalled();
                });
            });
        });
    });
});