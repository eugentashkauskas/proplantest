'use strict';
describe("Module ap-viewmodels - NoteInChargeViewModel", () => {
    let $rootScope: angular.IRootScopeService, $scope: angular.IScope;
    let Utility: ap.utility.UtilityHelper, UserContext: ap.utility.UserContext;
    let vm: ap.viewmodels.notes.NoteInChargeViewModel;
    let $q: angular.IQService;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });
    beforeEach(inject(function (_$rootScope_, _UserContext_, _Utility_, _$q_) {
        Utility = _Utility_;
        UserContext = _UserContext_;
        $rootScope = _$rootScope_;
        $q = _$q_;
        $scope = $rootScope.$new();
        specHelper.utility.stubRootUrl(Utility);
        specHelper.userContext.stub(Utility);
        specHelper.utility.stubStorageSet(Utility);
    }));

    describe("Constructor", () => {
        describe("WHEN NoteInChargeViewModel is created", () => {
            it("THEN, the properties are filled with the default values", () => {
                vm = new ap.viewmodels.notes.NoteInChargeViewModel( Utility);
                expect(vm.tag).toBe("");
                expect(vm.displayName).toBe("");
                expect(vm.isInvitedOnProject).toBeFalsy();
                expect(vm.userId).toBeNull();
            });
        });

        describe("WHEN NoteInChargeViewModel is created and init with the NoteInCharge entity", () => {
            it("THEN, the properties are filled from the NoteInCharge entity into the VM", () => {
                let noteInCharge: ap.models.notes.NoteInCharge = new ap.models.notes.NoteInCharge(Utility);
                noteInCharge.Tag = "Quentin";
                noteInCharge.IsContactInvitedOnProject = true;
                noteInCharge.UserId = "1234";

                vm = new ap.viewmodels.notes.NoteInChargeViewModel(Utility);
                vm.init(noteInCharge);

                expect(vm.tag).toBe("Quentin");
                expect(vm.displayName).toBe("Quentin");
                expect(vm.isInvitedOnProject).toBeTruthy();
                expect(vm.userId).toEqual(noteInCharge.UserId);
            });
        });
    });

    describe("Feature : postChanges method", () => {
        describe("When the postChanges method was called", () => {
            it("THEN the values of NoteInCharge entity will be updated from the VM", () => {
                let noteInCharge: ap.models.notes.NoteInCharge = new ap.models.notes.NoteInCharge(Utility);
                noteInCharge.Tag = "Quentin";
                noteInCharge.IsContactInvitedOnProject = true;
                noteInCharge.UserId = "1234";
                vm = new ap.viewmodels.notes.NoteInChargeViewModel(Utility);
                vm.init(noteInCharge);

                vm.postChanges();

                expect(vm.noteInCharge.Tag).toEqual(vm.tag);
                expect(vm.noteInCharge.UserId).toEqual(vm.userId);
            });
        });
    });

    describe("Feature: Initialize the ViewModel without a noteInCharge", () => {
        describe("WHEN copySource is called AND noteInCharge is not defined", () => {
            it("THEN initData is called", () => {
                vm = new ap.viewmodels.notes.NoteInChargeViewModel(Utility);
                vm.init(null);

                this._tag = "";
                this._displayName = "";
                this._isInvitedOnProject = false;
                this._userId = null;

                expect(vm.tag).toBe("");
                expect(vm.displayName).toBe("");
                expect(vm.isInvitedOnProject).toBeFalsy();
                expect(vm.userId).toBeNull();
            });
        });
    });
}); 