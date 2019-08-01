describe("Module ap-viewmodels - FormItemViewModel", () => {
    let Utility: ap.utility.UtilityHelper, ControllersManager: ap.controllers.ControllersManager;
    let ServicesManager: ap.services.ServicesManager;
    let $timeout: ng.ITimeoutService;
    let vm: ap.viewmodels.forms.FormItemViewModel;
    let $scope: angular.IScope, $q: angular.IQService;
    let $rootScope: angular.IRootScopeService;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject((_Utility_, _ControllersManager_, _$timeout_, _ServicesManager_, _$rootScope_, _$q_) => {
        Utility = _Utility_;
        ControllersManager = _ControllersManager_;
        ServicesManager = _ServicesManager_;
        $timeout = _$timeout_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        $q = _$q_;
        specHelper.userContext.stub(Utility);
    }));

    describe("Feature: constructor", () => {
        beforeEach(() => {
            vm = new ap.viewmodels.forms.FormItemViewModel(Utility, $q, null, new ap.viewmodels.notes.UserCommentItemConstructorParameter(null, null, null, null, Utility, ControllersManager));
        });
        describe("WHEN the constructor is called", () => {
            it("THEN the ViewModel is created", () => {
                expect(vm).toBeDefined();
            });          
        });
    });
    describe("Feature: copySource", () => {
        beforeEach(() => {
            vm = new ap.viewmodels.forms.FormItemViewModel(Utility, $q, null, new ap.viewmodels.notes.UserCommentItemConstructorParameter(null, null, null, null, Utility, ControllersManager));
            let item: ap.models.forms.Form = new ap.models.forms.Form(Utility);
            let jsonForm = {
                CodeNum: "123",
                Code: "code",
                Subject: "subject",
                IsArchived: true,
                IsUrgent: true,
                IsReadOnly: true,
                NoteDocuments: [],
                NoteInCharge: [],
                Comments: [],
                Project: {
                    Id: "232"
                },
                Status: 1,
                Type: 1,
                Language: {
                    Id: "932"
                },
                TemplateId: "042",
                IsConform: true,
                Items: [],
                IsRead: true,
                From: modelSpecHelper.createUserJson("Writer", "Jimmy", "d09ce6dc-5acc-47fb-a15f-a4547dbc1d28", false)
            };
            item.createByJson(jsonForm);
            vm.init(item);
            vm.copySource();
        });
        describe("When copySource is called", () => {
            it("Then propreties are correctly setted", () => {
                expect(vm.status).toEqual("app.formstatus.InProgress");
                expect(vm.type).toEqual(ap.models.forms.FormType.Quality);
                expect(vm.statusColor).toEqual("inprogress");
            });
        });
    });
});
 