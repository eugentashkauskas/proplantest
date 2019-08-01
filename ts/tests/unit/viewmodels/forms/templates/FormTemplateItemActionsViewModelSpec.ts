describe("Module ap-viewmodels - FormTemplateItemActionViewModel", () => {
    let Utility: ap.utility.UtilityHelper, ControllersManager: ap.controllers.ControllersManager;
    let ServicesManager: ap.services.ServicesManager;
    let $timeout: ng.ITimeoutService;
    let vm: ap.viewmodels.forms.templates.FormTemplateItemActionsViewModel;
    let $scope: angular.IScope, $q: angular.IQService;
    let $rootScope: angular.IRootScopeService;
    let formTemplate: ap.models.forms.FormTemplate;
    let formTemplateItemVm: ap.viewmodels.forms.templates.FormTemplateItemViewModel;

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
        specHelper.utility.stubConvertJsonDate();

        formTemplateItemVm = new ap.viewmodels.forms.templates.FormTemplateItemViewModel(Utility, $q);
        formTemplate = new ap.models.forms.FormTemplate(Utility);
        formTemplate.createByJson({
            Subject: "subject",
            Type: 0,
            Language: { Code: "FR" },
            EntityModificationDate: "\Date()",
            Creator: { DisplayName: "creatorName" }
        });
    }));

    describe("Feature: constructor", () => {
        beforeEach(() => {
            formTemplateItemVm.init(formTemplate);
            vm = new ap.viewmodels.forms.templates.FormTemplateItemActionsViewModel(Utility, ControllersManager.companyController, ControllersManager.formController, formTemplateItemVm);
        });
        describe("WHEN the constructor is called", () => {
            it("THEN the ViewModel is created", () => {
                expect(vm).toBeDefined();
            });
            it("THEN 4 actions are created", () => {
                expect(vm.actions.length).toEqual(4);
            });
            it("THEN archive action is created", () => {
                let action = ap.viewmodels.home.ActionViewModel.getAction(vm.actions, "archiveformtemplate");
                expect(action).not.toBeNull();
            });
            it("THEN unarchive action is created", () => {
                let action = ap.viewmodels.home.ActionViewModel.getAction(vm.actions, "unarchiveformtemplate");
                expect(action).not.toBeNull();
            });
            it("THEN edit action is created", () => {
                let action = ap.viewmodels.home.ActionViewModel.getAction(vm.actions, "editformtemplate");
                expect(action).not.toBeNull();
            });
            it("THEN preview action is created", () => {
                let action = ap.viewmodels.home.ActionViewModel.getAction(vm.actions, "previewformtemplate");
                expect(action).not.toBeNull();
            });
            it("THEN preview action is visible", () => {
                let action = ap.viewmodels.home.ActionViewModel.getAction(vm.actions, "previewformtemplate");
                expect(action.isVisible).toBeTruthy();
            });
            it("THEN preview action is enabled", () => {
                let action = ap.viewmodels.home.ActionViewModel.getAction(vm.actions, "previewformtemplate");
                expect(action.isEnabled).toBeTruthy();
            });
        });
    });
    describe("Feature: computeActionsVisibility", () => {
        describe("WHEN the formtemplate is archived", () => {
            beforeEach(() => {
                spyOn(ControllersManager.companyController, "isCurrentUserAtLeastManager").and.returnValue(true);
                formTemplate.IsArchived = true;
                formTemplateItemVm.init(formTemplate);
                vm = new ap.viewmodels.forms.templates.FormTemplateItemActionsViewModel(Utility, ControllersManager.companyController, ControllersManager.formController, formTemplateItemVm);
            });

            it("THEN the archive action is not visible", () => {
                expect(ap.viewmodels.home.ActionViewModel.getAction(vm.actions, "archiveformtemplate").isVisible).toBeFalsy();
                expect(ap.viewmodels.home.ActionViewModel.getAction(vm.actions, "archiveformtemplate").isEnabled).toBeFalsy();
            });
            it("THEN the unarchive action is visible", () => {
                expect(ap.viewmodels.home.ActionViewModel.getAction(vm.actions, "unarchiveformtemplate").isVisible).toBeTruthy();
                expect(ap.viewmodels.home.ActionViewModel.getAction(vm.actions, "unarchiveformtemplate").isEnabled).toBeTruthy();
            });
        });

        describe("WHEN the formtemplate is unarchived", () => {
            beforeEach(() => {
                spyOn(ControllersManager.companyController, "isCurrentUserAtLeastManager").and.returnValue(true);
                formTemplate.IsArchived = false;
                formTemplateItemVm.init(formTemplate);
                vm = new ap.viewmodels.forms.templates.FormTemplateItemActionsViewModel(Utility, ControllersManager.companyController, ControllersManager.formController, formTemplateItemVm);
            });

            it("THEN the archive action is visible", () => {
                expect(ap.viewmodels.home.ActionViewModel.getAction(vm.actions, "archiveformtemplate").isVisible).toBeTruthy();
                expect(ap.viewmodels.home.ActionViewModel.getAction(vm.actions, "archiveformtemplate").isEnabled).toBeTruthy();
            });
            it("THEN the unarchive action is not visible", () => {
                expect(ap.viewmodels.home.ActionViewModel.getAction(vm.actions, "unarchiveformtemplate").isVisible).toBeFalsy();
                expect(ap.viewmodels.home.ActionViewModel.getAction(vm.actions, "unarchiveformtemplate").isEnabled).toBeFalsy();
            });
        });
        describe("WHEN the user is not manager", () => {
            beforeEach(() => {
                spyOn(ControllersManager.companyController, "isCurrentUserAtLeastManager").and.returnValue(false);
                formTemplate.IsArchived = false;
                formTemplateItemVm.init(formTemplate);
                vm = new ap.viewmodels.forms.templates.FormTemplateItemActionsViewModel(Utility, ControllersManager.companyController, ControllersManager.formController, formTemplateItemVm);
            });
            it("THEN the edit action is not visible", () => {
                expect(ap.viewmodels.home.ActionViewModel.getAction(vm.actions, "editformtemplate").isVisible).toBeFalsy();
                expect(ap.viewmodels.home.ActionViewModel.getAction(vm.actions, "editformtemplate").isEnabled).toBeFalsy();
            });
            it("THEN the archive action not is visible", () => {
                expect(ap.viewmodels.home.ActionViewModel.getAction(vm.actions, "archiveformtemplate").isVisible).toBeFalsy();
                expect(ap.viewmodels.home.ActionViewModel.getAction(vm.actions, "archiveformtemplate").isEnabled).toBeFalsy();
            });
            it("THEN the unarchive action is not visible", () => {
                expect(ap.viewmodels.home.ActionViewModel.getAction(vm.actions, "unarchiveformtemplate").isVisible).toBeFalsy();
                expect(ap.viewmodels.home.ActionViewModel.getAction(vm.actions, "unarchiveformtemplate").isEnabled).toBeFalsy();
            });
        });
        describe("WHEN the user is manager", () => {
            beforeEach(() => {
                spyOn(ControllersManager.companyController, "isCurrentUserAtLeastManager").and.returnValue(true);
                formTemplate.IsArchived = false;
                formTemplateItemVm.init(formTemplate);
                vm = new ap.viewmodels.forms.templates.FormTemplateItemActionsViewModel(Utility, ControllersManager.companyController, ControllersManager.formController, formTemplateItemVm);
            });
            it("THEN the edit action is visible", () => {
                expect(ap.viewmodels.home.ActionViewModel.getAction(vm.actions, "editformtemplate").isVisible).toBeTruthy();
                expect(ap.viewmodels.home.ActionViewModel.getAction(vm.actions, "editformtemplate").isEnabled).toBeTruthy();
            });
            it("THEN the archive action is visible", () => {
                expect(ap.viewmodels.home.ActionViewModel.getAction(vm.actions, "archiveformtemplate").isVisible).toBeTruthy();
                expect(ap.viewmodels.home.ActionViewModel.getAction(vm.actions, "archiveformtemplate").isEnabled).toBeTruthy();
            });
            it("THEN the unarchive action is not visible", () => {
                expect(ap.viewmodels.home.ActionViewModel.getAction(vm.actions, "unarchiveformtemplate").isVisible).toBeFalsy();
                expect(ap.viewmodels.home.ActionViewModel.getAction(vm.actions, "unarchiveformtemplate").isEnabled).toBeFalsy();
            });
        });

    });
    describe("Feature: actionClick", () => {
        describe("WHEN editformtemplate action is clicked", () => {
            beforeEach(() => {
                formTemplateItemVm.init(formTemplate);
                vm = new ap.viewmodels.forms.templates.FormTemplateItemActionsViewModel(Utility, ControllersManager.companyController, ControllersManager.formController, formTemplateItemVm);
                spyOn(ControllersManager.formController, "requestEditFormTemplate");
                vm.actionClick("editformtemplate");
            });

            it("THEN formController.archiveFormTemplate is called", () => {
                expect(ControllersManager.formController.requestEditFormTemplate).toHaveBeenCalledWith(formTemplate);
            });
        });
        describe("WHEN archiveform action is clicked", () => {
            beforeEach(() => {
                formTemplateItemVm.init(formTemplate);
                vm = new ap.viewmodels.forms.templates.FormTemplateItemActionsViewModel(Utility, ControllersManager.companyController, ControllersManager.formController, formTemplateItemVm);
                spyOn(ControllersManager.formController, "archiveFormTemplate");
                vm.actionClick("archiveformtemplate");
            });

            it("THEN formController.archiveFormTemplate is called", () => {
                expect(ControllersManager.formController.archiveFormTemplate).toHaveBeenCalledWith(formTemplate);
            });
        });
        describe("WHEN unarchiveformtemplate action is clicked", () => {
            beforeEach(() => {
                formTemplateItemVm.init(formTemplate);
                vm = new ap.viewmodels.forms.templates.FormTemplateItemActionsViewModel(Utility, ControllersManager.companyController, ControllersManager.formController, formTemplateItemVm);
                spyOn(ControllersManager.formController, "unarchiveFormTemplate");
                vm.actionClick("unarchiveformtemplate");
            });

            it("THEN formController.unarchiveFormTemplate is called", () => {
                expect(ControllersManager.formController.unarchiveFormTemplate).toHaveBeenCalledWith(formTemplate);
            });
        });
        describe("WHEN the previewformtemplate action is clicked", () => {
            beforeEach(() => {
                vm = new ap.viewmodels.forms.templates.FormTemplateItemActionsViewModel(Utility, ControllersManager.companyController, ControllersManager.formController, formTemplateItemVm);
                spyOn(ControllersManager.formController, "requestFormTemplatePreview");
                vm.actionClick("previewformtemplate");
            });
            it("THEN the FormController is used to perform the action", () => {
                expect(ControllersManager.formController.requestFormTemplatePreview).toHaveBeenCalled();
            });
        });
    });
});
