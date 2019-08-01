describe("Module ap-viewmodels - FormPreviewViewModel", () => {
    let vm: ap.viewmodels.forms.viewer.FormPreviewViewModel;
    let Utility: ap.utility.UtilityHelper;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject((_Utility_: ap.utility.UtilityHelper) => {
        Utility = _Utility_;
    }));

    describe("Feature: constructor", () => {
        describe("WHEN the constructor is called", () => {
            beforeEach(() => {
                vm = new ap.viewmodels.forms.viewer.FormPreviewViewModel(Utility);
            });

            it("THEN the ViewModel is created", () => {
                expect(vm).toBeDefined();
            });
        });
    });
});
