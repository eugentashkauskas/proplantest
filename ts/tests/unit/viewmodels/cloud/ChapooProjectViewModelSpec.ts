describe("Module ap-viewmodels - ChapooProjectViewModel", () => {

    let Utility: ap.utility.UtilityHelper;

    beforeEach(() => {
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject(function (_Utility_) {
        Utility = _Utility_;
        specHelper.utility.stubRootUrl(Utility);
        specHelper.userContext.stub(Utility);
    }));

    describe("Feature: constructor", () => {
        let vm: ap.viewmodels.cloud.ChapooProjectViewModel;
        beforeEach(() => {
            vm = new ap.viewmodels.cloud.ChapooProjectViewModel(Utility);
        });

        it("THEN, ChapooProjectViewModel is correctly created", () => {
            expect(vm.id).toBeNull();
            expect(vm.name).toBeNull();
            expect(vm.isSelected).toBeFalsy();
        });
    });

    describe("Feature: createByJson", () => {
        let vm: ap.viewmodels.cloud.ChapooProjectViewModel;
        let json: any;
        beforeEach(() => {
            vm = new ap.viewmodels.cloud.ChapooProjectViewModel(Utility);
            json = {
                ID: 123,
                Name: "name",
            };
            vm.createByJson(json);
        });

        it("THEN, ChapooProjectViewModel has correct value", () => {
            expect(vm.id).toEqual(123);
            expect(vm.name).toEqual("name");
        });
    });
}); 