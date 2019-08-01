describe("Module ap-viewmodels - ReportTitleHistoryViewModel", () => {

    let ReportController: ap.controllers.ReportController;
    let $q: angular.IQService;
    let $rootScope: angular.IRootScopeService;
    let arrayOfTitles = ["voluptate ea", "nulla ea", "esse amet", "voluptate eiusmod"];
    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
        angular.mock.module("ap-controllers");
    });

    beforeEach(inject(function (_$rootScope_, _$q_, _ReportController_) {
        $q = _$q_;
        $rootScope = _$rootScope_;
        ReportController = _ReportController_;
    }));
    describe("Feature - constructor", () => {
        let vm: ap.viewmodels.reports.ReportTitleHistoryViewModel;
        let deffered: angular.IDeferred<string[]>;
        beforeEach(() => {
            deffered = $q.defer();
            spyOn(ReportController, "getReportTitleHistory").and.returnValue(deffered.promise);
            deffered.resolve(arrayOfTitles);
        });
        describe("WHEN viewmodel is created", () => {
            beforeEach(() => {
                vm = new ap.viewmodels.reports.ReportTitleHistoryViewModel(ReportController, "1");
                $rootScope.$apply();
            });

            it("THEN, ReportTitleHistoryViewModel is created correct", () => {
                expect(vm).toBeDefined();
            });

            it("AND, getReportTitleHistory is called with projectId '1'", () => {
                expect(ReportController.getReportTitleHistory).toHaveBeenCalledWith("1");
            });
        });
    })
    describe("Feature - searchTitle", () => {
        let vm: ap.viewmodels.reports.ReportTitleHistoryViewModel;
        let deffered: angular.IDeferred<string[]>;
        beforeEach(() => {
            deffered = $q.defer();
            spyOn(ReportController, "getReportTitleHistory").and.returnValue(deffered.promise);
            deffered.resolve(arrayOfTitles);
            vm = new ap.viewmodels.reports.ReportTitleHistoryViewModel(ReportController, "1");
            $rootScope.$apply();
        });
        describe("WHEN searchTitle is called", () => {
            describe("AND, searchText is empty", () => {
                it("THEN return all arrayOfTitles", () => {
                    vm.searchText = "";
                    let result = vm.searchTitle();
                    expect(result.length).toBe(4);
                });
            });
        });
        describe("WHEN searchTitle is called", () => {
            describe("AND, searchText is 'test'", () => {
                it("THEN return empty array", () => {
                    vm.searchText = "test";
                    let result = vm.searchTitle();
                    expect(result.length).toBe(0);
                });
            });
        });
        describe("WHEN searchTitle is called", () => {
            describe("AND, searchText is 'ea'", () => {
                it("THEN returns 'voluptate ea', 'nulla ea'", () => {
                    vm.searchText = "ea";
                    let result = vm.searchTitle();
                    expect(result.length).toBe(2);
                    expect(result[0]).toBe(arrayOfTitles[0]);
                    expect(result[1]).toBe(arrayOfTitles[1]);
                });
            });
        });
    })
});