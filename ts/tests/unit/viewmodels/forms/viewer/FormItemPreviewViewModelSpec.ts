﻿describe("Module ap-viewmodels - FormItemPreviewViewModel", () => {
    let vm: ap.viewmodels.forms.viewer.FormItemPreviewViewModel;
    let Utility: ap.utility.UtilityHelper;
    let $q: angular.IQService;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject((_Utility_: ap.utility.UtilityHelper, _$q_: angular.IQService) => {
        Utility = _Utility_;
        $q = _$q_;
    }));

    describe("Feature: constructor", () => {
        describe("WHEN the constructor is called", () => {
            beforeEach(() => {
                vm = new ap.viewmodels.forms.viewer.FormItemPreviewViewModel(Utility, $q, null, null);
            });

            it("THEN the ViewModel is created", () => {
                expect(vm).toBeDefined();
            });
        });
    });
});
