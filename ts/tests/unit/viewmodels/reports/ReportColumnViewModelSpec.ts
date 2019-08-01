describe("Module ap-viewmodels - reports", () => {
    var nmp = ap.viewmodels.reports;
    var MainController: ap.controllers.MainController, Utility: ap.utility.UtilityHelper, Api: ap.services.apiHelper.Api, UserContext: ap.utility.UserContext, UIStateController: ap.controllers.UIStateController;
    var $controller: angular.IControllerService, $rootScope: angular.IRootScopeService, $scope: angular.IScope, _deferred: angular.IDeferred<ap.services.apiHelper.ApiResponse>,
        $q: angular.IQService, $timeout: angular.ITimeoutService, $compile: angular.ICompileService;

    var reportColumnViewModel: ap.viewmodels.reports.ReportColumnViewModel = null;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });
    beforeEach(inject(function (_$rootScope_, _$q_, _$timeout_, _$compile_, _UserContext_, _Utility_, _Api_, _MainController_, _UIStateController_, _$controller_) {
        MainController = _MainController_;
        UIStateController = _UIStateController_;
        Utility = _Utility_;
        UserContext = _UserContext_;
        Api = _Api_;
        $q = _$q_;
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $timeout = _$timeout_;
        _deferred = $q.defer();
        $controller = _$controller_;
        $scope = $rootScope.$new();
        specHelper.utility.stubRootUrl(Utility);
        specHelper.userContext.stub(Utility);
        Utility.Storage.Session.clear();
        specHelper.utility.stubStorageSet(Utility);
    }));

    describe("Feature ReportColumnViewModel: init values and setter", () => {
        describe("WHEN the ReportColumnViewModel is created", () => {
            it("THEN I can get an instance of my viewmodel with default values", () => {
                reportColumnViewModel = new ap.viewmodels.reports.ReportColumnViewModel(Utility);
                expect(reportColumnViewModel.propertyName).toBeNull();
                expect(reportColumnViewModel.displayOrder).toEqual(0);

                reportColumnViewModel.displayOrder = 1;
                reportColumnViewModel.propertyName = "Subject";

                expect(reportColumnViewModel.displayOrder).toEqual(1);
                expect(reportColumnViewModel.propertyName).toEqual("Subject");
                expect(reportColumnViewModel.isChecked).toBeFalsy();
                expect(reportColumnViewModel.dragId).toEqual("Subject");
                expect(reportColumnViewModel.allowDrag()).toBeFalsy();
            });
        });
    });

    describe("Feature ischeckedchanged", () => {
        describe("WHEN isChecked property changed", () => {
            let reportColumnViewModel: ap.viewmodels.reports.ReportColumnViewModel;
            let eventColumnViewModel: ap.viewmodels.reports.ReportColumnViewModel;
            let callback: jasmine.Spy;
            beforeEach(() => {
                callback = jasmine.createSpy("checkedchanged");
                reportColumnViewModel = new ap.viewmodels.reports.ReportColumnViewModel(Utility);
                reportColumnViewModel.on("ischeckedchanged", (item: any) => {
                    callback();
                    eventColumnViewModel = item;
                }, this);

                reportColumnViewModel.isChecked = !reportColumnViewModel.isChecked;
            });
            it("THEN, The event is raised", () => {                
                expect(callback).toHaveBeenCalled();
            });
            it("THEN, The event is raised with correct item", () => {
                expect(eventColumnViewModel).toEqual(reportColumnViewModel);
            });
        });
    });

    describe("Feature: isdropped", () => {
        
        let reportColumnViewModel2: ap.viewmodels.reports.ReportColumnViewModel;
        let spyCallback: jasmine.Spy;
        beforeEach(() => {
            reportColumnViewModel = new ap.viewmodels.reports.ReportColumnViewModel(Utility);
            reportColumnViewModel.propertyName = "test1";
            reportColumnViewModel.displayOrder = 0;
            reportColumnViewModel2 = new ap.viewmodels.reports.ReportColumnViewModel(Utility);
            reportColumnViewModel2.propertyName = "test2";
            reportColumnViewModel2.displayOrder = 1;
            spyCallback = jasmine.createSpy("callback");
            reportColumnViewModel.on("isdropped", spyCallback, this);
        });
        describe("WHEN drop function is executed and drop entity is defined", () => {
            beforeEach(() => {
                reportColumnViewModel.drop(reportColumnViewModel2);
            });
            it("THEN, ondrop event is fired", () => {
                expect(spyCallback).toHaveBeenCalledWith(new ap.component.dragAndDrop.DropEntityEvent(reportColumnViewModel, reportColumnViewModel2));
            });            
        });
        describe("WHEN drop function is executed and drop entity is not defined", () => {
            beforeEach(() => {
                reportColumnViewModel.drop(undefined);
            });
            it("THEN, ondrop event is not fired", () => {
                expect(spyCallback).not.toHaveBeenCalled();
            })
        });
        afterEach(() => {
            reportColumnViewModel.off("isdropped", spyCallback, this);
        });
    });
});   