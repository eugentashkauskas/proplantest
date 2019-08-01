'use strict';
describe("Module ap-viewmodels - project's components - ChapterHierarchyItemViewModel", () => {
    let vm: ap.viewmodels.projects.ChapterHierarchyItemViewModel;
    let chapterHierarchy: ap.models.projects.ChapterHierarchy;
    let issueTypeHierarchy: ap.models.projects.ChapterHierarchy;
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
        chapterHierarchy = new ap.models.projects.ChapterHierarchy(Utility);
        chapterHierarchy.createByJson({
            Id: "45890",
            Code: "PT",
            Description: "Problem type",
            EntityName: "Chapter",
            EntityId: "4589",
        });

        issueTypeHierarchy = new ap.models.projects.ChapterHierarchy(Utility);
        issueTypeHierarchy.createByJson({
            Id: "9861",
            Code: "ELEC",
            Description: "Electricity",
            EntityName: "IssueType",
            ParentEntityId: "696",
            EntityId: "986",
        });
    }));

    describe("Feature: read only field initialization", () => {
        describe("WHEN the ChapterHierarchyItemViewModel is initiliazed with no data", () => {
            beforeEach(() => {
                vm = new ap.viewmodels.projects.ChapterHierarchyItemViewModel(Utility, $q);
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
        describe("WHEN the ChapterHierarchyItemViewModel is initialized with Chapter entity type", () => {
            beforeEach(() => {
                vm = new ap.viewmodels.projects.ChapterHierarchyItemViewModel(Utility, $q);
                vm.init(chapterHierarchy);
            });
            it("THEN, the level = 0", () => {
                expect(vm.level).toBe(0);
            });
            it("AND the isSelectable = false", () => {
                expect(vm.isSelectable).toBeFalsy();
            });
            it("AND the displayName equals the concatenation of the code and description separated by '-'", () => {
                expect(vm.displayName).toBe("Problem type");
            });
        });
        describe("WHEN the ChapterHierarchyItemViewModel is initialized with IssueType entity type", () => {
            beforeEach(() => {
                vm = new ap.viewmodels.projects.ChapterHierarchyItemViewModel(Utility, $q);
                vm.init(issueTypeHierarchy);
            });
            it("THEN, the level = 1", () => {
                expect(vm.level).toBe(1);
            });
            it("AND the isSelectable = true", () => {
                expect(vm.isSelectable).toBeTruthy();
            });
            it("AND the displayName equals the concatenation of the code and description separated by '-'", () => {
                expect(vm.displayName).toBe("Electricity");
            });
        });
    });
}); 