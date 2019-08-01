"use strict" 
describe("Module ap-viewmodels - HierarchyItemViewModel", () => {
    let $rootScope: angular.IRootScopeService, $scope: angular.IScope;
    let Utility: ap.utility.UtilityHelper, UserContext: ap.utility.UserContext;
    let vm: ap.viewmodels.CodeEntityViewModel;
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

    class MockHierarchyItem extends ap.viewmodels.HierarchyItemViewModel {
        getLevel(): number {
            let result = super.getLevel();
            let ent: any = this._originalEntity;
            if (ent.Level)
                return ent.Level;
            return result;
        }
    }

    describe("WHEN hierarchyItem view is overrided with getLevel", () => {
        it("THEN, the good value is returned", () => {
            let testHier = new MockHierarchyItem(Utility, $q);
            let entity: any = new ap.models.identFiles.Country(Utility);
            entity.Level = 2;

            testHier.init(entity);
            expect(testHier.getLevel()).toBe(2);
        });
    });
});