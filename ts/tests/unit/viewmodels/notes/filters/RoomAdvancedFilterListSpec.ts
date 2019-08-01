describe("Module ap-viewmodels - RoomAdvancedFilterList", () => {
    let _apiIdentification: string = "apiIdentification-Id";
    let $q: angular.IQService;
    let ControllersManager: ap.controllers.ControllersManager;
    let ServicesManager: ap.services.ServicesManager;
    let Utility: ap.utility.UtilityHelper;
    let Api: ap.services.apiHelper.Api;
    let $rootScope: angular.IRootScopeService;
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
        $q = _$q_;
        Api = _Api_;
        $rootScope = _$rootScope_;
        Api.init(_apiIdentification);
    }));
    beforeEach(() => {
        let project = new ap.models.projects.Project(Utility);
        project.createByJson({ Id: "test-project-id" });
        spyOn(ControllersManager.mainController, "currentProject").and.returnValue(project);
    });
    describe("Feature: createListViewModel", () => {
        let advancedFilterList: ap.viewmodels.notes.filters.RoomAdvancedFilterList;
        let result: any;
        let expectedResult: ap.viewmodels.projects.RoomMultiSelectorViewModel;
        describe("WHEN createListViewModel is called", () => {
            beforeEach(() => {
                expectedResult = new ap.viewmodels.projects.RoomMultiSelectorViewModel(Utility, Api, $q, ControllersManager);
                advancedFilterList = new ap.viewmodels.notes.filters.RoomAdvancedFilterList(Utility, Api, $q, ControllersManager);
                result = advancedFilterList.createListViewModel();
            });
            it("THEN it returns a RoomMultiSelectorViewModel", () => {
                expect(result).toEqual(expectedResult);
            });
        });
    });

    describe("Feature: getTextFromCheckedIds", () => {
        let advancedFilterList: ap.viewmodels.notes.filters.RoomAdvancedFilterList;
        let checkedValues: Dictionary<string, string[]>;
        let callback: jasmine.Spy
        let defResponse: angular.IDeferred<any>;
        let defRoom: ap.models.projects.SubCell[];
        beforeEach(() => {
            defResponse = $q.defer();
            callback = jasmine.createSpy("callback");
            spyOn(Api, "getEntityList").and.returnValue(defResponse.promise);
        });
        describe("WHEN getTextFromCheckedIds is called", () => {
            let result;
            beforeEach(() => {
                let firstIssueType = new ap.models.projects.SubCell(Utility);
                firstIssueType.createByJson({ Id: "1", Description: "Test description for first issue type" });
                let secondIssueType = new ap.models.projects.SubCell(Utility);
                secondIssueType.createByJson({ Id: "2", Description: "Test description for second issue type" });
                defRoom = [firstIssueType, secondIssueType];
                let ids: string[] = ["11", "22"];
                checkedValues = new Dictionary<string, string[]>();
                checkedValues.add("Guid", ids);
                advancedFilterList = new ap.viewmodels.notes.filters.RoomAdvancedFilterList(Utility, Api, $q, ControllersManager);
                result = advancedFilterList.getText(checkedValues);
                defResponse.resolve(new ap.services.apiHelper.ApiResponse(defRoom));
                $rootScope.$apply();
            });
            it("THEN,  getText return concat string with description", () => {
                expect(result.$$state.value).toEqual("Test description for first issue type, Test description for second issue type");
            });
        });
    });
});