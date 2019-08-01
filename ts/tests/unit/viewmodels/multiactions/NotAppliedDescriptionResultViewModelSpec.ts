"use strict"
describe("Module viewmodels/multiaction - NotAppliedDescriptionResultViewModel", () => {
    let vm: ap.viewmodels.multiactions.NotAppliedDescriptionResultViewModel;
    let data: ap.models.multiactions.NotAppliedActionDescription[];
    let Utility: ap.utility.UtilityHelper;
    beforeEach(angular.mock.module("ap-viewmodels"));
    beforeEach(inject(function (_Utility_) {
        Utility = _Utility_;
    }));
    describe("Feature: Constructor", () => {
        describe("WHEN I create a new NotAppliedDescriptionResultViewModel", () => {
            beforeEach(() => {
                data = [];
                data.push(new ap.models.multiactions.NotAppliedActionDescription("1", "First point", "CODE1", ap.models.notes.NoteType.MeetingPointNote, ap.models.multiactions.NotAppliedReason.CannotEditMeetingPointInRemarkModule, ap.models.multiactions.MultiAction.ChangeStatus));
                data.push(new ap.models.multiactions.NotAppliedActionDescription("2", "Second point", "CODE2", ap.models.notes.NoteType.MeetingPointNote, ap.models.multiactions.NotAppliedReason.CannotHaveEmptySubject, ap.models.multiactions.MultiAction.ChangeSubject));
                vm = new ap.viewmodels.multiactions.NotAppliedDescriptionResultViewModel(Utility, data);
                
            });
            it("THEN, my object is defined", () => {
                expect(vm).toBeDefined();
            });
            it("THEN titleKey is 'Some points were skipped'", () => {
                expect(vm.titleKey).toBe("Some points were skipped");
            });
            it("THEN descriptionKey is 'Some points have not been updated.'", () => {
                expect(vm.descriptionKey).toBe("Some points have not been updated.");
            });
            it("THEN, the item list correspond to the data passed in the constructor", () => {
                expect(vm.items.length).toBe(2);
                for (let i = 0; i < vm.items.length; i++) {
                    expect(vm.items[i].data).toBe(data[i]);
                }
            });
        });

        describe("WHEN I create a new NotAppliedDescriptionResultViewModel and pass custom title and description keys", () => {
            beforeEach(() => {
                data = [];
                data.push(new ap.models.multiactions.NotAppliedActionDescription("1", "First point", "CODE1", ap.models.notes.NoteType.MeetingPointNote, ap.models.multiactions.NotAppliedReason.CannotEditMeetingPointInRemarkModule, ap.models.multiactions.MultiAction.ChangeStatus));
                data.push(new ap.models.multiactions.NotAppliedActionDescription("2", "Second point", "CODE2", ap.models.notes.NoteType.MeetingPointNote, ap.models.multiactions.NotAppliedReason.CannotHaveEmptySubject, ap.models.multiactions.MultiAction.ChangeSubject));
                vm = new ap.viewmodels.multiactions.NotAppliedDescriptionResultViewModel(Utility, data, "test-description-key", "test-title-key");
            });

            it("THEN titleKey represents the value given in the constructor", () => {
                expect(vm.titleKey).toBe("test-title-key");
            });
            it("THEN descriptionKey represents the value given in the constructor", () => {
                expect(vm.descriptionKey).toBe("test-description-key");
            });
            it("THEN, the item list correspond to the data passed in the constructor", () => {
                expect(vm.items.length).toBe(2);
                for (let i = 0; i < vm.items.length; i++) {
                    expect(vm.items[i].data).toBe(data[i]);
                }
            });
        });
    });
});