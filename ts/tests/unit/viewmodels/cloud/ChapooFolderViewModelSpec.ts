describe("Module ap-viewmodels - ChapooFolderViewModel", () => {

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
        let vm: ap.viewmodels.cloud.ChapooFolderViewModel;
        beforeEach(() => {
            vm = new ap.viewmodels.cloud.ChapooFolderViewModel(Utility);
        });

        it("THEN, ChapooFolderViewModel is correctly created", () => {
            expect(vm.id).toBeNull();
            expect(vm.name).toBeNull();
            expect(vm.type).toBeNull();
            expect(vm.level).toBeNull();
            expect(vm.parentId).toBeNull();
            expect(vm.children.length).toEqual(0);
            expect(vm.isSelected).toBeFalsy();
        });
    });

    describe("Feature: createByJson", () => {
        let vm: ap.viewmodels.cloud.ChapooFolderViewModel;
        let json: any;
        beforeEach(() => {
            vm = new ap.viewmodels.cloud.ChapooFolderViewModel(Utility);
            json = {
                ID: 123,
                Name: "name",
                type: 3,
                number: 1,
                ParentID: null,
                Children: [
                    {
                        ID: 456,
                        Name: "child1",
                        type: 2,
                        ParentID: 123
                    }, {
                        ID: 789,
                        Name: "child2",
                        type: 2,
                        ParentID: 123
                    }
                ]
            };
            vm.createByJson(json);
        });

        it("THEN, ChapooFolderViewModel has correct value", () => {
            expect(vm.id).toEqual(123);
            expect(vm.name).toEqual("name");
            expect(vm.type).toEqual("3");
            expect(vm.level).toEqual(0);
            expect(vm.parentId).toBeNull();
        });
        it("THEN, ChapooFolderViewModel has two children", () => {
            expect(vm.children.length).toEqual(2);
        });
        it("THEN, ChapooFolderViewModel has correct value on child 1", () => {
            expect(vm.children[0].id).toEqual(456);
            expect(vm.children[0].name).toEqual("child1");
            expect(vm.children[0].type).toEqual("2");
            expect(vm.children[0].level).toEqual(1);
            expect(vm.children[0].parentId).toEqual(123);
            expect(vm.children[0].children.length).toEqual(0);
        });
        it("THEN, ChapooFolderViewModel has correct value on child 2", () => {
            expect(vm.children[1].id).toEqual(789);
            expect(vm.children[1].name).toEqual("child2");
            expect(vm.children[1].type).toEqual("2");
            expect(vm.children[1].level).toEqual(1);
            expect(vm.children[1].parentId).toEqual(123);
            expect(vm.children[1].children.length).toEqual(0);
        });
    });
}); 