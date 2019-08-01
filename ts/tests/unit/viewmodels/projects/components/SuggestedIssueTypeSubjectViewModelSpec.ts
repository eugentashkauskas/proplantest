'use strict';
describe("Module ap-viewmodels - project's components - SuggestedIssueTypeSubjectViewModel", () => {
    let vm: ap.viewmodels.projects.SuggestedIssueTypeSubjectViewModel;
    let Utility: ap.utility.UtilityHelper;
    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });
    beforeEach(inject(function (_$rootScope_, _UserContext_, _Utility_, _$q_) {
        Utility = _Utility_;
    }));
    describe("Feature constructor", () => {
        describe("When the SuggestedIssueTypeSubjectViewModel init with params ", () => {
            it("THEN the vm will created with correct values", () => {
                vm = new ap.viewmodels.projects.SuggestedIssueTypeSubjectViewModel("Subject1");
                expect(vm).toBeDefined();
                expect(vm.subject).toEqual("Subject1");
                expect(vm.defaultDescription).toEqual(null);
            });
        });
        describe("When the SuggestedIssueTypeSubjectViewModel.defaultDescription is set", () => {
            it("THEN the defaultDescription has the correct value", () => {
                vm = new ap.viewmodels.projects.SuggestedIssueTypeSubjectViewModel("Subject1");
                vm.defaultDescription = "DefaultDescription1";
                expect(vm.defaultDescription).toEqual("DefaultDescription1");
            });
        });
    });
});   