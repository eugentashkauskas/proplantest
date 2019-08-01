describe("Module ap-viewmodels - EditModeEvent", () => {
    let Utility: ap.utility.UtilityHelper, UserContext: ap.utility.UserContext;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });
    beforeEach(inject(function (_Utility_) {
        Utility = _Utility_;
    }));

    describe("Constructor", () => {
        let editModeEvent: ap.viewmodels.base.EditModeEvent;
        describe("WHEN EditModeEvent is created with only vm", () => {
            beforeEach(() => {
                editModeEvent = new ap.viewmodels.base.EditModeEvent("vm");
            });
            it("THEN, vm is defined", () => {
                expect(editModeEvent.vm).toEqual("vm");
            });
            it("THEN, wasNewEntity is false", () => {
                expect(editModeEvent.wasNewEntity).toBeFalsy();
            });
            it("THEN, isCancelAction is false", () => {
                expect(editModeEvent.isCancelAction).toBeFalsy();
            });
        });
        describe("WHEN EditModeEvent is created with all arguments", () => {
            beforeEach(() => {
                editModeEvent = new ap.viewmodels.base.EditModeEvent("vm", true, true);
            });
            it("THEN, vm is defined", () => {
                expect(editModeEvent.vm).toEqual("vm");
            });
            it("THEN, wasNewEntity is true", () => {
                expect(editModeEvent.wasNewEntity).toBeTruthy();
            });
            it("THEN, isCancelAction is true", () => {
                expect(editModeEvent.isCancelAction).toBeTruthy();
            });
        });
    });
});