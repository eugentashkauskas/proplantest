describe("Module ap-viewmodels - ListAdvancedFilterList", () => {
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
        let advancedFilterList: ap.viewmodels.notes.filters.ListAdvancedFilterList;
        let result: any;
        let expectedResult: ap.viewmodels.meetings.MeetingMultiSelectorViewModel;
        describe("WHEN createListViewModel is called", () => {
            beforeEach(() => {
                expectedResult = new ap.viewmodels.meetings.MeetingMultiSelectorViewModel(Utility, $q, ControllersManager);
                advancedFilterList = new ap.viewmodels.notes.filters.ListAdvancedFilterList(Utility, Api, $q, ControllersManager);
                result = advancedFilterList.createListViewModel();
            });
            it("THEN it returns a MultiSelectorListViewModel", () => {
                expect(result).toEqual(expectedResult);
            });
        });
    });
    describe("Feature: getTextFromCheckedIds", () => {
        let advancedFilterList: ap.viewmodels.notes.filters.ListAdvancedFilterList;
        let checkedValues: Dictionary<string, string[]>;
        let callback: jasmine.Spy
        let defResponse: angular.IDeferred<any>;
        let defMeeting: ap.models.meetings.Meeting[];
        beforeEach(() => {
            defResponse = $q.defer();
            callback = jasmine.createSpy("callback");
            spyOn(Api, "getEntityList").and.returnValue(defResponse.promise);
        });
        describe("WHEN getTextFromCheckedIds is called", () => {
            let result;
            beforeEach(() => {
                let firstMeeting= new ap.models.meetings.Meeting(Utility);
                firstMeeting.createByJson({ Id: "1", Title: "Test title for first meeting" });
                let secondMeeting= new ap.models.meetings.Meeting(Utility);
                secondMeeting.createByJson({ Id: "2", Title: "Test title for second meeting" });
                defMeeting = [firstMeeting, secondMeeting];
                let ids: string[] = ["1", "2"];
                checkedValues = new Dictionary<string, string[]>();
                checkedValues.add("Guid", ids);
                advancedFilterList = new ap.viewmodels.notes.filters.ListAdvancedFilterList(Utility, Api, $q, ControllersManager);
                result = advancedFilterList.getText(checkedValues);
                defResponse.resolve(new ap.services.apiHelper.ApiResponse(defMeeting));
                $rootScope.$apply();
            });
            it("THEN,  getText return concat string with title", () => {
                expect(result.$$state.value).toEqual("Test title for first meeting, Test title for second meeting");
            });
        });
    });
});