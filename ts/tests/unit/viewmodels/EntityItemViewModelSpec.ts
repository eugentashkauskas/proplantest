"use strict"
describe("Module ap-viewmodels - EntityItemViewModel", () => {
    let $rootScope: angular.IRootScopeService, $scope: angular.IScope;
    let Utility: ap.utility.UtilityHelper, UserContext: ap.utility.UserContext;
    let vm: ap.viewmodels.EntityItemViewModel;
    let $q: angular.IQService;

    class TestItem extends ap.viewmodels.EntityItemViewModel {
        constructor($utility: ap.utility.UtilityHelper, $q: angular.IQService) {
            super($utility, $q);
            this.setSelectable(false);
        }
    }

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });
    beforeEach(inject(function (_$rootScope_, _UserContext_, _Utility_, _$q_) {
        Utility = _Utility_;
        UserContext = _UserContext_;
        $rootScope = _$rootScope_;
        $q = _$q_;
        $scope = $rootScope.$new();
        specHelper.utility.stubRootUrl(Utility);
        specHelper.userContext.stub(Utility);
        specHelper.utility.stubStorageSet(Utility);
    }));

    describe("Feature: constructor", () => {
        beforeEach(() => {
            vm = new ap.viewmodels.EntityItemViewModel(Utility, $q);
        });
        describe("WHEN the vm is build", () => {
            it("THEN, isSelectable = true", () => {
                expect(vm.isSelectable).toBeTruthy();
            });
            it("AND displayName is empty", () => {
                expect(vm.displayName).toBe("");
            });
        });
        describe("WHEN the view model is init with an entity", () => {
            let entityCode: any;
            beforeEach(() => {
                entityCode = {
                    Code: "CODE",
                    Description: "Descr"
                };
            });
            it("containing code and description THEN, the display name = code - description", () => {
                vm.init(entityCode);
                expect(vm.displayName).toBe("CODE - Descr");
            });
            it("containing code THEN, the display name = code", () => {
                entityCode.Description = undefined;
                vm.init(entityCode);
                expect(vm.displayName).toBe("CODE");
            });
            it("containing description THEN, the display name = description", () => {
                entityCode.Code = undefined;
                vm.init(entityCode);
                expect(vm.displayName).toBe("Descr");
            });
        });
    });

    describe("Feature: setSelectable", () => {
        describe("WHEN the setSelectable is called from inherited class", () => {
            beforeEach(() => {
                vm = new TestItem(Utility, $q);
            });
            it("THEN, the value changed to the new one (false)", () => {
                expect(vm.isSelectable).toBeFalsy();
            });
        });
    });
});