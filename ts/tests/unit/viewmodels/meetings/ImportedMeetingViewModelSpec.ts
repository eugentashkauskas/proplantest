describe("Module ap-viewmodels - ImportedMeetingViewModel", () => {
    let Utility: ap.utility.UtilityHelper;
    
    beforeEach(() => {
        angular.mock.module("ap-controllers");
    });

    beforeEach(inject((_Utility_) => {
        Utility = _Utility_;
    }));

    describe("Feature: cunstructor", () => {
        let vm: ap.viewmodels.meetings.ImportedMeetingViewModel;
        beforeEach(() => {
            vm = new ap.viewmodels.meetings.ImportedMeetingViewModel(Utility);
        });

        it("THEN, ImportExcelMeetingViewModel is defined", () => {
            expect(vm).toBeDefined();
        });
    });
});