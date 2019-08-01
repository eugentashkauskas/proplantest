describe("Module ap-viewmodels - FormTemplateItemViewModel", () => {
    let Utility: ap.utility.UtilityHelper
    let vm: ap.viewmodels.forms.templates.FormTemplateItemViewModel;
    let $scope: angular.IScope;
    let $rootScope: angular.IRootScopeService;
    let $q: angular.IQService;

    beforeEach(() => {
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject((_Utility_, _$rootScope_, _$q_) => {
        Utility = _Utility_;
        $rootScope = _$rootScope_;
        $q = _$q_;
        $scope = $rootScope.$new();
        specHelper.utility.stubConvertJsonDate();
    }));

    describe("Feature: constructor", () => {
        beforeEach(() => {
            vm = new ap.viewmodels.forms.templates.FormTemplateItemViewModel(Utility, $q);
        });
        describe("WHEN the constructor is called", () => {
            it("THEN the ViewModel is created", () => {
                expect(vm).toBeDefined();
            });
        });
    });
    describe("Feature: copySource", () => {
        let form: ap.models.forms.FormTemplate;
        beforeEach(() => {
            vm = new ap.viewmodels.forms.templates.FormTemplateItemViewModel(Utility, $q);
            form = new ap.models.forms.FormTemplate(Utility);
            form.createByJson({
                Subject: "subject",
                Type: 0,
                Language: { Code: "FR" },
                EntityModificationDate: "\Date()",
                Creator: { DisplayName: "creatorName"}
            });
            vm.init(form);
        });
        describe("WHEN vm.init is called", () => {
            it("THEN the properties are setted", () => {
                expect(vm.author).toEqual("creatorName");
                expect(vm.language.Code).toEqual("FR");
                expect(vm.modificationDate).toEqual(ap.utility.UtilityHelper.convertJsonDate("\Date()").relativeFormat());
                expect(vm.title).toEqual("subject");
                expect(vm.questionsCount).toEqual(-1);
                expect(vm.typeClass).toEqual("typeSecurity");
            });
        });
    });
});
