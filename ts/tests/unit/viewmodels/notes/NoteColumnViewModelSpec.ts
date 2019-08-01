describe("Module ap-viewmodels - NoteColumnViewModel", () => {
    let Utility: ap.utility.UtilityHelper;
    let UserContext: ap.utility.UserContext;
    let vm: ap.viewmodels.notes.NoteColumnViewModel;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject((_Utility_, _UserContext_) => {
        Utility = _Utility_;
        UserContext = _UserContext_;
        specHelper.userContext.stub(Utility);
    }));

    describe("Feature NoteItemViewModel", () => {
        describe("WHEN constructor is build with null argument in storage", () => {
            it("THEN, properties will be true", () => {
                spyOn(Utility.Storage.Local, "get").and.returnValue(null);
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.returnValue(true);
                vm = new ap.viewmodels.notes.NoteColumnViewModel(Utility);
                expect(vm.statusVisibility).toBeTruthy();
                expect(vm.numberVisibility).toBeTruthy();
                expect(vm.punchlistVisibility).toBeTruthy();
                expect(vm.subjectVisibility).toBeTruthy();
                expect(vm.roomVisibility).toBeTruthy();
                expect(vm.dueDateVisibility).toBeTruthy();
                expect(vm.inChargeVisibility).toBeTruthy();
                expect(vm.authorVisibility).toBeTruthy();
                expect(vm.listVisibility).toBeTruthy();
                expect(vm.attachmentVisibility).toBeTruthy();
                expect(vm.creationDateVisibility).toBeTruthy();
            });
        });
        describe("WHEN constructor is build and storage contains object", () => {
            it("THEN, properties of class get value from object", () => {
                let storageObj = {
                    "statusVisibility": true,
                    "numberVisibility": false,
                    "punchlistVisibility": true,
                    "subjectVisibility": false,
                    "roomVisibility": true,
                    "dueDateVisibility": false,
                    "inChargeVisibility": true,
                    "authorVisibility": false,
                    "listVisibility": true,
                    "attachmentVisibility": false,
                    "creationDateVisibility": true
                };

                spyOn(Utility.Storage.Local, "get").and.callFake(function (key: string) {
                    let colName = key.substring(key.lastIndexOf('.') + 1);
                    return storageObj[colName];
                });

                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.returnValue(true);

                vm = new ap.viewmodels.notes.NoteColumnViewModel(Utility);

                expect(vm.statusVisibility).toBeTruthy();
                expect(vm.numberVisibility).toBeFalsy();
                expect(vm.punchlistVisibility).toBeTruthy();
                expect(vm.subjectVisibility).toBeFalsy();
                expect(vm.roomVisibility).toBeTruthy();
                expect(vm.dueDateVisibility).toBeFalsy();
                expect(vm.inChargeVisibility).toBeTruthy();
                expect(vm.authorVisibility).toBeFalsy();
                expect(vm.listVisibility).toBeTruthy();
                expect(vm.attachmentVisibility).toBeFalsy();
                expect(vm.creationDateVisibility).toBeTruthy();
            });
        });
    });

    describe("Feature: selectAll", () => {

        beforeEach(() => {
            spyOn(Utility.Storage.Local, "get").and.returnValue(null);
            spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.returnValue(true);
            vm = new ap.viewmodels.notes.NoteColumnViewModel(Utility);

            vm.selectAll(false); // deselect all
        });

        // as they're all true by default, we'll check the case where they're all unselected
        describe("WHEN selectAll is called with FALSE", () => {
            it("THEN, all columns are visible", () => {
                expect(vm.statusVisibility).toBeFalsy();
                expect(vm.numberVisibility).toBeFalsy();
                expect(vm.punchlistVisibility).toBeFalsy();
                expect(vm.subjectVisibility).toBeFalsy();
                expect(vm.roomVisibility).toBeFalsy();
                expect(vm.dueDateVisibility).toBeFalsy();
                expect(vm.inChargeVisibility).toBeFalsy();
                expect(vm.authorVisibility).toBeFalsy();
                expect(vm.listVisibility).toBeFalsy();
                expect(vm.attachmentVisibility).toBeFalsy();
                expect(vm.creationDateVisibility).toBeFalsy();
            });
        });
    });
});