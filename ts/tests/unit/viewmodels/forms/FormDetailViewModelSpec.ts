describe("Module ap-viewmodels - FormDetailViewModel", () => {
    let Utility: ap.utility.UtilityHelper, ControllersManager: ap.controllers.ControllersManager;
    let ServicesManager: ap.services.ServicesManager;
    let $timeout: ng.ITimeoutService;
    let vm: ap.viewmodels.forms.FormDetailViewModel;
    let $scope: angular.IScope, $q: angular.IQService;
    let $rootScope: angular.IRootScopeService;
    let $mdDialog: angular.material.IDialogService;
    let Api: ap.services.apiHelper.Api;
    let $location: angular.ILocationService;
    let $anchorScroll: angular.IAnchorScrollService;
    let $interval: angular.IIntervalService;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
        angular.mock.module(function ($provide) {
            $provide.factory('$mdDialog', ["$q", function ($q) {
                return specHelper.utility.stubShowMdDialog($q);
            }]);
        });
    });

    beforeEach(inject((_Utility_, _ControllersManager_, _$timeout_, _ServicesManager_, _$rootScope_, _$q_, _Api_, _$location_, _$anchorScroll_, _$interval_, _$mdDialog_) => {
        Utility = _Utility_;
        ControllersManager = _ControllersManager_;
        ServicesManager = _ServicesManager_;
        $timeout = _$timeout_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        $q = _$q_;
        Api = _Api_;
        $mdDialog = _$mdDialog_;
        $interval = _$interval_;
        $anchorScroll = _$anchorScroll_;
        $location = _$location_;
        specHelper.userContext.stub(Utility);
    }));

    beforeEach(() => {
        spyOn(ServicesManager.noteService, "getLinkedNotes").and.returnValue($q.defer().promise);
    });

    describe("Feature: constructor", () => {
        beforeEach(() => {
            spyOn(ControllersManager.formController, "getFullFormById").and.returnValue($q.defer().promise);
            vm = new ap.viewmodels.forms.FormDetailViewModel(Utility, $mdDialog, $q, Api, ControllersManager, ServicesManager, null, $location, $anchorScroll, $interval, $scope, $timeout);
        });
        describe("WHEN the constructor is called", () => {
            it("THEN the ViewModel is created", () => {
                expect(vm).toBeDefined();
            });
        });
    });
    describe("Feature: CopySource", () => {
        let form: ap.models.forms.Form;
        beforeEach(() => {
            form = new ap.models.forms.Form(Utility);
            form.createByJson({
                Items: [],
                IsConform: true,
                TemplateId: "123",
                DoneDate: null,
                Language: { Code: "fr" },
                Type: ap.models.forms.FormType.Security,
                Status: ap.models.forms.FormStatus.InProgress
            });
            vm = new ap.viewmodels.forms.FormDetailViewModel(Utility, $mdDialog, $q, Api, ControllersManager, ServicesManager, null, $location, $anchorScroll, $interval, $scope, $timeout);
            vm.init(form);
            vm.copySource();
        });
        it("When copy source is called all data are setted to the vm", () => {
            expect(vm.items).toEqual([]);
            expect(vm.isConform).toBeTruthy();
            expect(vm.templateId).toEqual("123");
            expect(vm.doneDate).toBeNull();
            expect(vm.language.Code).toEqual("fr");
            expect(vm.type).toEqual(ap.models.forms.FormType.Security);
            expect(vm.status).toEqual("app.formstatus.InProgress");
            expect(vm.statusColor).toEqual("inprogress");
        });
    });
    describe("Feature: loadForm", () => {
        let def: angular.IDeferred<ap.models.forms.Form>;
        beforeEach(() => {
            def = $q.defer();
            spyOn(ControllersManager.formController, "getFullFormById").and.returnValue(def.promise);
            vm = new ap.viewmodels.forms.FormDetailViewModel(Utility, $mdDialog, $q, Api, ControllersManager, ServicesManager, "123", $location, $anchorScroll, $interval, $scope, $timeout);
        });
        describe("WHEN loadForm is called with a form id", () => {
            it("THEN formController.getFullFormById is called with the id", () => {
                expect(ControllersManager.formController.getFullFormById).toHaveBeenCalledWith("123", true);
            });
        });
    }); 
});
