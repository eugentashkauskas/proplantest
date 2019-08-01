describe("Feature: MeetingMultiSelectorViewModel", () => {
    let Utility: ap.utility.UtilityHelper;
    let Api: ap.services.apiHelper.Api;
    let $q: angular.IQService;
    let $rootScope: angular.IRootScopeService;
    let vm: ap.viewmodels.meetings.MeetingMultiSelectorViewModel;
    let ControllersManager: ap.controllers.ControllersManager;
    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject(function (_Utility_, _Api_, _$q_, _$rootScope_, _ControllersManager_) {
        Utility = _Utility_;
        Api = _Api_;
        $q = _$q_;
        ControllersManager = _ControllersManager_;
        $rootScope = _$rootScope_;
        specHelper.userContext.stub(Utility);
    }));

    beforeEach(() => {
        let project = new ap.models.projects.Project(Utility);
        project.createByJson({ Id: "test-project-id" });
        spyOn(ControllersManager.mainController, "currentProject").and.returnValue(project);
        vm = new ap.viewmodels.meetings.MeetingMultiSelectorViewModel(Utility, $q, ControllersManager);
    });

    describe("WHEN MeetingMultiSelectorViewModel is created", () => {
        it("THEN, list options should be initialized properly", () => {
            expect(vm.entityName).toEqual("Meeting");
            expect(vm.pathToLoad).toEqual("Id,Title");
        });
        it("THEN, filter should bie initialized", () => {
            expect(vm.defaultFilter).toEqual(Filter.eq("Project.Id", ControllersManager.mainController.currentProject().Id));
        });
    });

    describe("WHEN set checkedIds property for list", () => {
        let listEntity1: ap.models.meetings.Meeting;
        let listEntity2: ap.models.meetings.Meeting;
        beforeEach(() => {
            let testIds = ["testId1", "testId2"];
            listEntity1 = new ap.models.meetings.Meeting(Utility);
            listEntity1.createByJson({
                Id: "testId1",
                Title: "XXX1"
            });
            listEntity2 = new ap.models.meetings.Meeting(Utility);
            listEntity2.createByJson({
                Id: "testId2",
                Title: "XXX2"
            });
            let listEntities: ap.models.meetings.Meeting[] = [listEntity1, listEntity2];

            let deferred: angular.IDeferred<any> = $q.defer();
            let defIds: angular.IDeferred<any> = $q.defer();
            spyOn(Api, "getApiResponse").and.callFake((url: string) => {
                if (url.indexOf("rest/meetingsids") >= 0) {
                    return defIds.promise;
                } else {
                    return deferred.promise;
                }
            });

            // load the first page to initialize the ids
            vm.loadNextPage();
            defIds.resolve(new ap.services.apiHelper.ApiResponse(["testId1", "testId2"]));
            $rootScope.$apply();

            // set the ids to check and resolve the get entity list
            vm.checkedIds = testIds;
            deferred.resolve(new ap.services.apiHelper.ApiResponse(listEntities));
            $rootScope.$apply();
        });
        it("THEN, checkedValuesText value is updated", () => {
            expect(vm.checkedValuesText).toEqual("XXX1, XXX2");
        });
    });
});