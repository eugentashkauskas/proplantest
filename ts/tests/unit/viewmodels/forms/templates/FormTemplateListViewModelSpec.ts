describe("Module ap-viewmodels - FormTemplateListViewModel", () => {
    let Utility: ap.utility.UtilityHelper, ControllersManager: ap.controllers.ControllersManager;
    let vm: ap.viewmodels.forms.templates.FormTemplateListViewModel;
    let $scope: angular.IScope;
    let $rootScope: angular.IRootScopeService;
    let $q: angular.IQService;
    let Api: ap.services.apiHelper.Api;
    let $timeout: angular.ITimeoutService;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject((_Utility_, _$rootScope_, _$q_, _Api_, _$timeout_, _ControllersManager_) => {
        Utility = _Utility_;
        $rootScope = _$rootScope_;
        $q = _$q_;
        Api = _Api_;
        $timeout = _$timeout_;
        ControllersManager = _ControllersManager_;
        $scope = $rootScope.$new();
        specHelper.utility.stubConvertJsonDate();

        specHelper.userContext.stub(Utility);
    }));

    describe("Feature: constructor", () => {
        beforeEach(() => {
            vm = new ap.viewmodels.forms.templates.FormTemplateListViewModel($scope, Utility, Api, $q, $timeout, ControllersManager);
        });
        describe("WHEN the constructor is called", () => {
            it("THEN the ViewModel is created", () => {
                expect(vm).toBeDefined();
            });
        });
    });
    describe("Feature: onPageLoaded", () => {
        let loadedIds: string[];
        let defer: angular.IDeferred<ap.services.apiHelper.ApiResponse>;
        let deferred: angular.IDeferred<ap.services.apiHelper.ApiResponse>;
        let deferIds: angular.IDeferred<ap.services.apiHelper.ApiResponse>;
        let apiOptions: ap.services.apiHelper.ApiOption;
        let formTemplate1: ap.viewmodels.forms.templates.FormTemplateItemViewModel;
        let formTemplate2: ap.viewmodels.forms.templates.FormTemplateItemViewModel;
        let formTemplate3: ap.viewmodels.forms.templates.FormTemplateItemViewModel;
        let form1: ap.models.forms.FormTemplate;
        let form2: ap.models.forms.FormTemplate;
        let form3: ap.models.forms.FormTemplate;

        beforeEach(() => {
            apiOptions = new ap.services.apiHelper.ApiOption();
            apiOptions.async = true;

            let stats: ap.models.stats.StatResult[];
            let stat1: ap.models.stats.StatResult = new ap.models.stats.StatResult();
            stat1.createByJson({ Count: 1, GroupByValue: "1" });
            let stat2: ap.models.stats.StatResult = new ap.models.stats.StatResult();
            stat2.createByJson({ Count: 2, GroupByValue: "2" });
            let stat3: ap.models.stats.StatResult = new ap.models.stats.StatResult();
            stat3.createByJson({ Count: 3, GroupByValue: "3" });
            stats = [stat1, stat2, stat3];

            defer = $q.defer();
            deferred = $q.defer();
            deferIds = $q.defer();

            loadedIds = ["1", "2", "3"];

            vm = new ap.viewmodels.forms.templates.FormTemplateListViewModel($scope, Utility, Api, $q, $timeout, ControllersManager);

            spyOn(vm.listVm, "getLoadedItemsIds").and.returnValue(loadedIds);
            spyOn(Api, "getApiResponseStatList").and.returnValue(defer.promise);

            formTemplate1 = new ap.viewmodels.forms.templates.FormTemplateItemViewModel(Utility, $q);
            form1 = new ap.models.forms.FormTemplate(Utility);
            form1.createByJson({
                Id: "1",
                Subject: "subject",
                Type: 0,
                Language: { Code: "FR" },
                EntityModificationDate: "\Date()",
                Creator: { DisplayName: "creatorName" }
            });

            formTemplate1.init(form1);

            formTemplate2 = new ap.viewmodels.forms.templates.FormTemplateItemViewModel(Utility, $q);
            form2 = new ap.models.forms.FormTemplate(Utility);
            form2.createByJson({
                Id: "2",
                Subject: "subject",
                Type: 0,
                Language: { Code: "FR" },
                EntityModificationDate: "\Date()",
                Creator: { DisplayName: "creatorName" }
            });
            formTemplate2.init(form2);

            formTemplate3 = new ap.viewmodels.forms.templates.FormTemplateItemViewModel(Utility, $q);
            form3 = new ap.models.forms.FormTemplate(Utility);
            form3.createByJson({
                Id: "3",
                Subject: "subject",
                Type: 0,
                Language: { Code: "FR" },
                EntityModificationDate: "\Date()",
                Creator: { DisplayName: "creatorName" }
            });
            formTemplate3.init(form3);
            spyOn(Api, "getApiResponse").and.returnValue(deferIds.promise);
            spyOn(Api, "getEntityList").and.returnValue(deferred.promise);
            vm.load();

            deferIds.resolve(new ap.services.apiHelper.ApiResponse(["1", "2", "3"]));
            deferred.resolve(new ap.services.apiHelper.ApiResponse([form1, form2, form3]));
            $rootScope.$apply();
            defer.resolve(new ap.services.apiHelper.ApiResponse([stats]));
            
        });
        describe("WHEN pageloaded event is raised", () => {
            it("THEN getApiResponseStatList is called", () => {
                expect(Api.getApiResponseStatList).toHaveBeenCalledWith("FormQuestionStats", "FormTemplateID", "Filter.In(FormTemplateID,1,2,3)", apiOptions);
            });
            it("THEN questionsCount are correctly setted", () => {
                specHelper.general.raiseEvent(vm.listVm, "pageloaded", [formTemplate1, formTemplate2, formTemplate3]);
                $rootScope.$apply();
                expect((<ap.viewmodels.forms.templates.FormTemplateItemViewModel>vm.listVm.sourceItems[0]).questionsCount).toEqual(1);
                expect((<ap.viewmodels.forms.templates.FormTemplateItemViewModel>vm.listVm.sourceItems[1]).questionsCount).toEqual(2);
                expect((<ap.viewmodels.forms.templates.FormTemplateItemViewModel>vm.listVm.sourceItems[2]).questionsCount).toEqual(3);
            });
        });
    });
});
