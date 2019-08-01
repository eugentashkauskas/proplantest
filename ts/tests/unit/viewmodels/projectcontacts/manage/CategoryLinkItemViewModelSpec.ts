'use strict';

describe("Module ap-viewmodels - CategoryLinkItemViewModel", () => {
    let vm: ap.viewmodels.projectcontacts.CategoryLinkItemViewModel;
    let $scope: angular.IScope;
    let Utility: ap.utility.UtilityHelper;
    let $rootScope: angular.IRootScopeService;
    let MainController: ap.controllers.MainController;

    let $q: angular.IQService;
    let Api = ap.services.apiHelper.Api;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
        angular.mock.module("ap-services");
    });
    beforeEach(inject((_$rootScope_, _Utility_, _MainController_, _MeetingController_, _Api_, _$q_) => {
        Utility = _Utility_;
        $rootScope = _$rootScope_;
        MainController = _MainController_;
        $scope = $rootScope.$new();
        $q = _$q_;
        Api = _Api_;

        specHelper.userContext.stub(Utility);
    }));

    describe("Feature: Constructor", () => {
        let currentProject: ap.models.projects.Project;
        beforeEach(() => {
            currentProject = new ap.models.projects.Project(Utility);
            currentProject.Code = "MYPROJ";
            currentProject.Name = "My project";
            currentProject.UserAccessRight.CanEditAllContact = true;

            spyOn(MainController, "currentProject").and.returnValue(currentProject);
        });
        describe("WHEN the vm is created", () => {
            beforeEach(() => {
                vm = new ap.viewmodels.projectcontacts.CategoryLinkItemViewModel(Utility, $q, MainController);
            });
            it("THEN, the created object is defined", () => {
                expect(vm).toBeDefined();
            });
        });
    });
    describe("Feature: canChange", () => {
        let currentProject: ap.models.projects.Project;
        describe("WHEN the vm is created and CanEditAllContact = false", () => {
            beforeEach(() => {
                currentProject = new ap.models.projects.Project(Utility);
                currentProject.Code = "MYPROJ";
                currentProject.Name = "My project";
                currentProject.UserAccessRight.CanEditAllContact = false;

                spyOn(MainController, "currentProject").and.returnValue(currentProject);

                let contact = new ap.models.projects.ContactDetails(Utility);
                contact.createByJson({
                    User: {
                        Id: '123'
                    }
                });
                vm = new ap.viewmodels.projectcontacts.CategoryLinkItemViewModel(Utility, $q, MainController);
                vm.contact = contact;
            });
            it("THEN, check canChange must be false", () => {
                expect(vm.canChange).toBeFalsy();
            });
        });
        describe("WHEN the vm is created and CanEditAllContact = true", () => {
            beforeEach(() => {
                currentProject = new ap.models.projects.Project(Utility);
                currentProject.Code = "MYPROJ";
                currentProject.Name = "My project";
                currentProject.UserAccessRight.CanEditAllContact = true;

                spyOn(MainController, "currentProject").and.returnValue(currentProject);

                let contact = new ap.models.projects.ContactDetails(Utility);
                contact.createByJson({
                    User: {
                        Id: '123'
                    }
                });
                vm = new ap.viewmodels.projectcontacts.CategoryLinkItemViewModel(Utility, $q, MainController);
                vm.contact = contact;
            });
            it("THEN, check canChange must be false", () => {
                expect(vm.canChange).toBeTruthy();
            });
        });
    });
}); 