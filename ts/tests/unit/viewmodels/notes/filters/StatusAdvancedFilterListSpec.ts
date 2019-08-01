describe("Module ap-viewmodels - StatusAdvancedFilterList", () => {
    let _apiIdentification: string = "apiIdentification-Id";
    let $q: angular.IQService, $rootScope: angular.IRootScopeService;
    let ControllersManager: ap.controllers.ControllersManager;
    let ServicesManager: ap.services.ServicesManager;
    let Utility: ap.utility.UtilityHelper;
    let Api: ap.services.apiHelper.Api;
    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
        angular.mock.module("ap-services");
    });

    beforeEach(inject(function (_$q_, _ControllersManager_, _ServicesManager_, _Utility_, _Api_, _$rootScope_) {
        Utility = _Utility_;
        specHelper.userContext.stub(_Utility_);
        specHelper.utility.stubRootUrl(_Utility_);
        ServicesManager = _ServicesManager_;
        ControllersManager = _ControllersManager_;
        $rootScope = _$rootScope_;
        $q = _$q_;
        Api = _Api_;
        Api.init(_apiIdentification);
    }));
    beforeEach(() => {
        let project = new ap.models.projects.Project(Utility);
        project.createByJson({ Id: "test-project-id" });
        spyOn(ControllersManager.mainController, "currentProject").and.returnValue(project);
    });
    describe("Feature: createListViewModel", () => {
        let advancedFilterList: ap.viewmodels.notes.filters.StatusAdvancedFilterList;
        let result: any;
        let expectedResult: ap.viewmodels.projects.ProjectStatusMultiSelectorViewModel;
        describe("WHEN createListViewModel is called", () => {
            beforeEach(() => {
                expectedResult = new ap.viewmodels.projects.ProjectStatusMultiSelectorViewModel(Utility, $q, ControllersManager);
                advancedFilterList = new ap.viewmodels.notes.filters.StatusAdvancedFilterList(Utility, Api, $q, ControllersManager);
                result = advancedFilterList.createListViewModel();
            });
            it("THEN it returns a ProjectStatusMultiSelectorViewModel", () => {
                expect(result).toEqual(expectedResult);
            });
        });
    });
    describe("Feature: getTextFromCheckedIds", () => {
        let advancedFilterList: ap.viewmodels.notes.filters.StatusAdvancedFilterList;
        let checkedValues: Dictionary<string, string[]>;
        let callback: jasmine.Spy
        let defResponse: angular.IDeferred<any>;
        let defStatus: ap.models.projects.NoteProjectStatus[];
        let result: any;
        let expectedResult: string;
        beforeEach(() => {
            defResponse = $q.defer();
            callback = jasmine.createSpy("callback");
            spyOn(Api, "getEntityList").and.returnValue(defResponse.promise);

            expectedResult = "Test name for first issue type, Test name for second issue type";

            let firstNoteProjectStatus = new ap.models.projects.NoteProjectStatus(Utility);
            firstNoteProjectStatus.createByJson({ Id: "1", Name: "Test name for first issue type" });
            let secondNoteProjectStatus = new ap.models.projects.NoteProjectStatus(Utility);
            secondNoteProjectStatus.createByJson({ Id: "2", Name: "Test name for second issue type" });
            defStatus = [firstNoteProjectStatus, secondNoteProjectStatus];


        });
        describe("WHEN getTextFromCheckedIds is called inside getText", () => {
            describe("WHEN key Guid", () => {
                beforeEach(() => {
                    let ids: string[] = ["1", "2"];
                    checkedValues = new Dictionary<string, string[]>();
                    checkedValues.add("Guid", ids);

                    advancedFilterList = new ap.viewmodels.notes.filters.StatusAdvancedFilterList(Utility, Api, $q, ControllersManager);
                    result = advancedFilterList.getText(checkedValues);

                    defResponse.resolve(new ap.services.apiHelper.ApiResponse(defStatus));
                    $rootScope.$apply();
                });
                it("THEN getText response current concat string", () => {
                    expect(result.$$state.value).toEqual(expectedResult);
                });
            });
        });
    });
});