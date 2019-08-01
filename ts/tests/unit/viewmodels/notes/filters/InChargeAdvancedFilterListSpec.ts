describe("Module ap-viewmodels - InChargeAdvancedFilterList", () => {
    let _apiIdentification: string = "apiIdentification-Id";
    let $q: angular.IQService;
    let $timeout: angular.ITimeoutService;
    let ControllersManager: ap.controllers.ControllersManager;
    let ServicesManager: ap.services.ServicesManager;
    let Utility: ap.utility.UtilityHelper;
    let Api: ap.services.apiHelper.Api;
    let advancedFilterList: ap.viewmodels.notes.filters.ContactAdvancedFilterList;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
        angular.mock.module("ap-services");
    });

    beforeEach(inject(function (_$q_, _$timeout_, _ControllersManager_, _ServicesManager_, _Utility_, _Api_) {
        Utility = _Utility_;
        specHelper.userContext.stub(_Utility_);
        specHelper.utility.stubRootUrl(_Utility_);
        ServicesManager = _ServicesManager_;
        ControllersManager = _ControllersManager_;
        $q = _$q_;
        $timeout = _$timeout_;
        Api = _Api_;
        Api.init(_apiIdentification);
    }));
    beforeEach(() => {
        let project = new ap.models.projects.Project(Utility);
        project.createByJson({ Id: "test-project-id" });
        spyOn(ControllersManager.mainController, "currentProject").and.returnValue(project);
    });
    describe("Feature: createListViewModel", () => {
        let viewModel: any;
        describe("WHEN createListViewModel is called", () => {
            beforeEach(() => {
                advancedFilterList = new ap.viewmodels.notes.filters.ContactAdvancedFilterList(Utility, Api, $q, ControllersManager, $timeout);
                viewModel = advancedFilterList.createListViewModel();
            });
            it("THEN it returns a ContactSelectorViewModel", () => {
                expect(viewModel instanceof ap.viewmodels.projects.ContactSelectorViewModel).toBeTruthy();
            });
            it("THEN contactsPositionsListViewModel property created", () => {
                expect(advancedFilterList.contactsPositionsListViewModel).toBeTruthy();
            });
            it("THEN contactsCompaniesListViewModel property created", () => {
                expect(advancedFilterList.contactsCompaniesListViewModel).toBeTruthy();
            })
        });
    });

    describe("Feature: filterListType", () => {
        describe("WHEN filterListType getter called", () => {
            beforeEach(() => {
                advancedFilterList = new ap.viewmodels.notes.filters.ContactAdvancedFilterList(Utility, Api, $q, ControllersManager, $timeout);
            });
            it("THEN it returns ChipsSelector", () => {
                expect(advancedFilterList.filterListType).toEqual(ap.misc.AdvancedFilterListType.ChipsSelector);
            });
        });
    });

    describe("Feature: initializedCheckedValues", () => {
        beforeEach(() => {
            advancedFilterList = new ap.viewmodels.notes.filters.ContactAdvancedFilterList(Utility, Api, $q, ControllersManager, $timeout);
        });
        describe("WHEN a wrong type is given for ListEntityViewModel", () => {
            it("THEN an error is raised", () => {
                expect(() => {
                    advancedFilterList.initializedCheckedValues(new ap.viewmodels.projects.RoomMultiSelectorViewModel(Utility, Api, $q, ControllersManager), new Dictionary<string, string[]>());
                }).toThrowError("Only the ContactSelectorViewModel type is allowed for the list parameter.");
            });
        });
        describe("WHEN a correct type is given for ListEntityViewModel", () => {
            let viewModel: ap.viewmodels.projects.ContactSelectorViewModel;
            beforeEach(() => {
                viewModel = advancedFilterList.createListViewModel();
                spyOn(viewModel, "initializeSelectedValues").and.stub();
                advancedFilterList.initializedCheckedValues(viewModel, new Dictionary<string, string[]>());
            });
            it("THEN the initializeSelectedValues of the view model is called", () => {
                expect(viewModel.initializeSelectedValues).toHaveBeenCalled();
            });
        });
    });
}); 