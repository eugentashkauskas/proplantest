describe("Module ap-viewmodels - FormTemplateViewWorkspaceViewModel", () => {
    let vm: ap.viewmodels.forms.viewer.FormTemplateViewWorkspaceViewModel;
    let $rootScope: angular.IRootScopeService;
    let $scope: angular.IScope;
    let $q: angular.IQService;
    let $stateParams: ap.viewmodels.forms.viewer.IFormViewStateParams;
    let Utility: ap.utility.UtilityHelper;
    let ControllersManager: ap.controllers.ControllersManager;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject((_Utility_: ap.utility.UtilityHelper, _$rootScope_: angular.IRootScopeService, _ControllersManager_: ap.controllers.ControllersManager,
        _$q_: angular.IQService
    ) => {
        Utility = _Utility_;
        $rootScope = _$rootScope_;
        ControllersManager = _ControllersManager_;
        $q = _$q_;
    }));

    beforeEach(() => {
        specHelper.userContext.stub(Utility);
    });

    describe("Feature: constructor", () => {
        beforeEach(() => {
            $scope = $rootScope.$new();
            $stateParams = { id: "test-id" };
            spyOn(ControllersManager.formController, "getFullFormTemplateById").and.returnValue($q.resolve(new ap.models.forms.FormTemplate(Utility)));

            vm = new ap.viewmodels.forms.viewer.FormTemplateViewWorkspaceViewModel(Utility, $scope, $stateParams, ControllersManager, $q);
        });

        describe("WHEN the constructor is called", () => {
            it("THEN the ViewModel is created", () => {
                expect(vm).toBeDefined();
            });
        });
    });
});
