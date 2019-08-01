describe("Module ap-viewmodels - BaseQuestionPreviewViewModel", () => {
    class TestBaseQuestionPreviewViewModel extends ap.viewmodels.forms.viewer.BaseQuestionPreviewViewModel {
    }

    let vm: TestBaseQuestionPreviewViewModel;
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
        describe("WHEN the constructor of a child class is called", () => {
            beforeEach(() => {
                vm = new TestBaseQuestionPreviewViewModel(Utility, $q, null, null);
            });

            it("THEN the ViewModel of the child class is created", () => {
                expect(vm).toBeDefined();
            });
        });
    });
});
