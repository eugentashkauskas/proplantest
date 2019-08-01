'use strict';
describe("Module ap-viewmodels - project's components - RoomHierarchyItemViewModel", () => {
    let vm: ap.viewmodels.projects.RoomHierarchyItemViewModel;
    let parentCellHierarchy: ap.models.projects.CellHierarchy;
    let subCellHierarchy: ap.models.projects.CellHierarchy;
    let Utility: ap.utility.UtilityHelper, UserContext: ap.utility.UserContext;
    let $q: angular.IQService;
    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });
    beforeEach(inject(function (_$rootScope_, _UserContext_, _Utility_, _$q_) {
        Utility = _Utility_;
        UserContext = _UserContext_;
        $q = _$q_;
        parentCellHierarchy = new ap.models.projects.CellHierarchy(Utility);
        parentCellHierarchy.createByJson({
            Id: "45890",
            Code: "FL1",
            Description: "Floor 1",
            EntityName: "ParentCell",
            EntityId: "4589",
        });

        subCellHierarchy = new ap.models.projects.CellHierarchy(Utility);
        subCellHierarchy.createByJson({
            Id: "9861",
            Code: "R1A",
            Description: "Room 1A",
            EntityName: "SubCell",
            ParentEntityId: "696",
            EntityId: "986",
        });
    }));
    describe("Feature: read only field initialization", () => {
        describe("WHEN the CellHierarchyItemViewModel is initiliazed with no data", () => {
            beforeEach(() => {
                vm = new ap.viewmodels.projects.RoomHierarchyItemViewModel(Utility, $q);;
            });
            it("THEN, the level = 0", () => {
                expect(vm.level).toBe(0);
            });
            it("AND the isSelectable = false", () => {
                expect(vm.isSelectable).toBeFalsy();
            });
            it("AND the displayName equals empty string", () => {
                expect(vm.displayName).toBe("");
            });
        });
        describe("WHEN the CellHierarchyItemViewModel is initialized with ParentCell entity type", () => {
            beforeEach(() => {
                vm = new ap.viewmodels.projects.RoomHierarchyItemViewModel(Utility, $q);
                vm.init(parentCellHierarchy);
            });
            it("THEN, the level = 0", () => {
                expect(vm.level).toBe(0);
            });
            it("AND the isSelectable = false", () => {
                expect(vm.isSelectable).toBeFalsy();
            });
            it("AND the displayName equals the concatenation of the code and description separated by '-'", () => {
                expect(vm.displayName).toBe("Floor 1");
            });
        });
        describe("WHEN the CellHierarchyItemViewModel is initialized with SubCell entity type", () => {
            beforeEach(() => {
                vm = new ap.viewmodels.projects.RoomHierarchyItemViewModel(Utility, $q);
                vm.init(subCellHierarchy);
            });
            it("THEN, the level = 1", () => {
                expect(vm.level).toBe(1);
            });
            it("AND the isSelectable = true", () => {
                expect(vm.isSelectable).toBeTruthy();
            });
            it("AND the displayName equals the concatenation of the code and description separated by '-'", () => {
                expect(vm.displayName).toBe("Room 1A");
            });
        });
    });
}); 