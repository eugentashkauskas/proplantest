describe("Module ap-viewmodels - FormActionViewModel", () => {
    let Utility: ap.utility.UtilityHelper, ControllersManager: ap.controllers.ControllersManager;
    let ServicesManager: ap.services.ServicesManager;
    let $timeout: ng.ITimeoutService;
    let vm: ap.viewmodels.forms.FormActionViewModel;
    let $scope: angular.IScope, $q: angular.IQService;
    let $rootScope: angular.IRootScopeService;
    let MeetingAccessRight: ap.models.accessRights.MeetingAccessRight;
    let form: ap.models.forms.Form;

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

        MeetingAccessRight = new ap.models.accessRights.MeetingAccessRight(Utility);
        MeetingAccessRight.Level = ap.models.accessRights.AccessRightLevel.Admin;
        MeetingAccessRight.CanEdit = true;
        MeetingAccessRight.CanEditPoint = true;
        MeetingAccessRight.CanAddPoint = true;
        MeetingAccessRight.CanDeletePoint = true;
        MeetingAccessRight.CanAddComment = true;
        MeetingAccessRight.CanDeleteComment = true;
        MeetingAccessRight.CanArchiveComment = true;
        MeetingAccessRight.CanAddDoc = true;
        MeetingAccessRight.CanEditAllPoint = true;
        MeetingAccessRight.CanAddPointDocument = true;
        MeetingAccessRight.CanDeletePointDocument = true;
        form = new ap.models.forms.Form(Utility);
        form.MeetingAccessRight = angular.copy(MeetingAccessRight);
        Utility.UserContext.licenseAccess = new ap.models.licensing.LicenseAccess(Utility);
        spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake(() => false);
    }));

    describe("Feature: constructor", () => {
        beforeEach(() => {
            let form: ap.models.forms.Form = new ap.models.forms.Form(Utility);
            vm = new ap.viewmodels.forms.FormActionViewModel(Utility, form, ControllersManager);
        });
        describe("WHEN the constructor is called", () => {
            it("THEN the ViewModel is created", () => {
                expect(vm).toBeDefined();
            });
            it("THEN 6 actions are created", () => {
                expect(vm.actions.length).toEqual(6);
            });
            it("THEN info action created", () => {
                let action = ap.viewmodels.home.ActionViewModel.getAction(vm.actions, "form.gotodetail");
                expect(action).not.toBeNull();
            });
            it("THEN preview action created", () => {
                let action = ap.viewmodels.home.ActionViewModel.getAction(vm.actions, "form.preview");
                expect(action).not.toBeNull();
            });
            it("THEN edit action created", () => {
                let action = ap.viewmodels.home.ActionViewModel.getAction(vm.actions, "form.edit");
                expect(action).not.toBeNull();
            });
            it("THEN archive action created", () => {
                let action = ap.viewmodels.home.ActionViewModel.getAction(vm.actions, "archiveform");
                expect(action).not.toBeNull();
            });
            it("THEN unarchive action created", () => {
                let action = ap.viewmodels.home.ActionViewModel.getAction(vm.actions, "unarchiveform");
                expect(action).not.toBeNull();
            });
            it("THEN moveTo action is created", () => {
                let action = ap.viewmodels.home.ActionViewModel.getAction(vm.actions, "form.moveto");
                expect(action).not.toBeNull();
            });
        });
    });
    describe("Feature: computeActionsVisibility", () => {
        
        describe("WHEN an info panel is closed", () => {
            let infoAction: ap.viewmodels.home.ActionViewModel;
            let previewAction: ap.viewmodels.home.ActionViewModel;

            beforeEach(() => {
                vm = new ap.viewmodels.forms.FormActionViewModel(Utility, form, ControllersManager, true);
                infoAction = ap.viewmodels.home.ActionViewModel.getAction(vm.actions, "form.gotodetail");
                previewAction = ap.viewmodels.home.ActionViewModel.getAction(vm.actions, "form.preview");
            });
            it("THEN the info action is visible", () => {
                expect(infoAction.isVisible).toBeTruthy();
                expect(infoAction.isEnabled).toBeTruthy();
            });
            it("THEN the preview action is not visible", () => {
                expect(previewAction.isVisible).toBeTruthy();
                expect(previewAction.isEnabled).toBeTruthy();
            });
        });

        describe("WHEN an info panel is visible", () => {
            let infoAction: ap.viewmodels.home.ActionViewModel;
            let previewAction: ap.viewmodels.home.ActionViewModel;

            beforeEach(() => {
                vm = new ap.viewmodels.forms.FormActionViewModel(Utility, form, ControllersManager, false);
                infoAction = ap.viewmodels.home.ActionViewModel.getAction(vm.actions, "form.gotodetail");
                previewAction = ap.viewmodels.home.ActionViewModel.getAction(vm.actions, "form.preview");
            });
            it("THEN the info action is not visible", () => {
                expect(infoAction.isVisible).toBeFalsy();
                expect(infoAction.isEnabled).toBeFalsy();
            });
            it("THEN the preview action is visible", () => {
                expect(previewAction.isVisible).toBeTruthy();
                expect(previewAction.isEnabled).toBeTruthy();
            });
        });

        describe("WHEN a form is archived", () => {
            let archiveAction: ap.viewmodels.home.ActionViewModel;
            let unarchiveAction: ap.viewmodels.home.ActionViewModel;

            beforeEach(() => {
                form.IsArchived = true;
                vm = new ap.viewmodels.forms.FormActionViewModel(Utility, form, ControllersManager);
                archiveAction = ap.viewmodels.home.ActionViewModel.getAction(vm.actions, "archiveform");
                unarchiveAction =  ap.viewmodels.home.ActionViewModel.getAction(vm.actions, "unarchiveform");
            });

            it("THEN the archive action is not visible", () => {
                expect(archiveAction.isVisible).toBeFalsy();
                expect(archiveAction.isEnabled).toBeFalsy();
            });
            it("THEN the unarchive action is visible", () => {
                expect(unarchiveAction.isVisible).toBeTruthy();
                expect(unarchiveAction.isEnabled).toBeTruthy();
            });
        });

        describe("WHEN a form is not archived", () => {
            let archiveAction: ap.viewmodels.home.ActionViewModel;
            let unarchiveAction: ap.viewmodels.home.ActionViewModel;

            beforeEach(() => {
                form.IsArchived = false;
                vm = new ap.viewmodels.forms.FormActionViewModel(Utility, form, ControllersManager);
                archiveAction = ap.viewmodels.home.ActionViewModel.getAction(vm.actions, "archiveform");
                unarchiveAction =  ap.viewmodels.home.ActionViewModel.getAction(vm.actions, "unarchiveform");
            });

            it("THEN the archive action is visible", () => {
                expect(archiveAction.isVisible).toBeTruthy();
                expect(archiveAction.isEnabled).toBeTruthy();
            });
            it("THEN the unarchive action is not visible", () => {
                expect(unarchiveAction.isVisible).toBeFalsy();
                expect(unarchiveAction.isEnabled).toBeFalsy();
            });
        });

        describe("WHEN a form is deleted", () => {
            let editAction: ap.viewmodels.home.ActionViewModel;

            beforeEach(() => {
                form.delete();
                vm = new ap.viewmodels.forms.FormActionViewModel(Utility, form, ControllersManager);
                editAction = ap.viewmodels.home.ActionViewModel.getAction(vm.actions, "form.edit");
            });
            it("THEN the edit action is not visible", () => {
                expect(editAction.isVisible).toBeFalsy();
                expect(editAction.isEnabled).toBeFalsy();
            });
        });

        describe("WHEN a form is not deleted", () => {
            let editAction: ap.viewmodels.home.ActionViewModel;

            beforeEach(() => {
                vm = new ap.viewmodels.forms.FormActionViewModel(Utility, form, ControllersManager);
                editAction = ap.viewmodels.home.ActionViewModel.getAction(vm.actions, "form.edit");
            });
            it("THEN the edit action is visible", () => {
                expect(editAction.isVisible).toBeTruthy();
                expect(editAction.isEnabled).toBeTruthy();
            });
        });
    });
});
