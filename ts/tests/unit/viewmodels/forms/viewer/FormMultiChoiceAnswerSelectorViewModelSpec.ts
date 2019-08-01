describe("Module ap-viewmodels - FormMultiChoiceAnswerSelectorViewModel", () => {
    let vm: ap.viewmodels.forms.viewer.FormMultiChoiceAnswerSelectorViewModel;
    let question: ap.viewmodels.forms.viewer.FormItemPreviewViewModel;
    let Utility: ap.utility.UtilityHelper;
    let $q: angular.IQService;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject((_Utility_: ap.utility.UtilityHelper, _$q_: angular.IQService) => {
        Utility = _Utility_;
        $q = _$q_;
    }));

    describe("Feature: constructor", () => {
        describe("WHEN the constructor is called", () => {
            beforeEach(() => {
                let questionModel = new ap.models.forms.FormItem(Utility);
                questionModel.createByJson({
                    Title: "test question",
                    Description: "test question",
                    ItemType: ap.models.forms.FormItemType.MultipleChoice,
                    Template: JSON.stringify({
                        title: "test question",
                        description: "test question",
                        type: ap.models.forms.FormItemType.MultipleChoice,
                        availableChoices: [
                            "option1",
                            "option2",
                            "option3"
                        ]
                    }),
                    NotApplicable: false,
                    Value: "[]"
                });

                question = new ap.viewmodels.forms.viewer.FormItemPreviewViewModel(Utility, $q);
                question.init(questionModel);

                vm = new ap.viewmodels.forms.viewer.FormMultiChoiceAnswerSelectorViewModel(Utility, question);
            });

            it("THEN the ViewModel is created", () => {
                expect(vm).toBeDefined();
            });
        });
    });
});
