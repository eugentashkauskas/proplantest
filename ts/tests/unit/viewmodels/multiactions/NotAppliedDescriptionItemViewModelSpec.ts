describe("Module viewmodels/multiaction - NotAppliedDescriptionItemViewModel", () => {
    let data: ap.models.multiactions.NotAppliedActionDescription;
    let vm: ap.viewmodels.multiactions.NotAppliedDescriptionItemViewModel;

    let Utility: ap.utility.UtilityHelper;
    beforeEach(angular.mock.module("ap-viewmodels"));
    beforeEach(inject(function (_Utility_) {
        Utility = _Utility_;
    }));

    beforeEach(() => {
        spyOn(Utility.Translator, "getTranslation").and.callFake((code) => {
            return "?" + code + "?";
        });
    });

    describe("Feature: Constructor", () => {
        describe("WHEN I create a new NotAppliedDescriptionItemViewModel", () => {
            beforeEach(() => {
                data = new ap.models.multiactions.NotAppliedActionDescription("4452", "My point cannot multiedit", "1.23", ap.models.notes.NoteType.MeetingPointNote, ap.models.multiactions.NotAppliedReason.CannotChangeIssueType, ap.models.multiactions.MultiAction.ChangeIssueType);
                vm = new ap.viewmodels.multiactions.NotAppliedDescriptionItemViewModel(Utility, data);
            });
            it("THEN, my object is defined", () => {
                expect(vm).toBeDefined();
            });
            it("Then, the data of the view model corresponds to the one passed in the constructor", () => {
                expect(vm.data).toBe(data);
            });
            it("THEN, the code equals the EntityCode of the data", () => {
                expect(vm.code).toBe(data.EntityCode);
            });
            it("THEN, the Subject equals the EntityTitle of the data", () => {
                expect(vm.subject).toBe(data.EntityTitle);
            });
            it("THEN, the action equals the translated values of the action of data", () => {
                let translationVal = "?app.MultiAction." + ap.models.multiactions.MultiAction[data.Action] + "?";
                expect(vm.action).toBe(translationVal);
            });
            it("THEN, the Reason equals the translated values of the Reason of data", () => {
                let translationVal = "?app.NotAppliedReason." + ap.models.multiactions.NotAppliedReason[data.Reason] + "?";
                expect(vm.reason).toBe(translationVal);
            });
        });
    });
});