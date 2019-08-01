describe("Module ap-viewmodels - FormQuestionListViewModel", () => {
    let vm: ap.viewmodels.forms.viewer.FormQuestionListViewModel;
    let Utility: ap.utility.UtilityHelper;
    let ControllersManager: ap.controllers.ControllersManager;
    let $q: angular.IQService;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject((_Utility_: ap.utility.UtilityHelper, _ControllersManager_: ap.controllers.ControllersManager, _$q_: angular.IQService) => {
        Utility = _Utility_;
        ControllersManager = _ControllersManager_;
        $q = _$q_;
    }));

    describe("Feature: constructor", () => {
        describe("WHEN the constructor is called", () => {
            beforeEach(() => {
                vm = new ap.viewmodels.forms.viewer.FormQuestionListViewModel(Utility, ControllersManager, $q, "test-formtemplate-id");
            });

            it("THEN the ViewModel is created", () => {
                expect(vm).toBeDefined();
            });
        });
    });
});
