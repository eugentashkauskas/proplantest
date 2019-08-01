describe("Module ap-viewmodels - ContactHeaderItemViewModelSpec", () => {
    let vm: ap.viewmodels.projectcontacts.ContactHeaderItemViewModel;
    let Utility: ap.utility.UtilityHelper;
    let $q: angular.IQService;
    beforeEach(() => {
        angular.mock.module("ap-viewmodels");
        angular.mock.module("ap-services");
    });
    beforeEach(inject(function (_Utility_, _$q_) {
        Utility = _Utility_;
        $q = _$q_;
        vm = new ap.viewmodels.projectcontacts.ContactHeaderItemViewModel(Utility, $q);
    }));
    describe("Feature: Constructor", () => {
        describe("WHEN the vm is created", () => {
            it("THEN, the created object is defined", () => {
                expect(vm).toBeDefined();
            });
        });
    });
});