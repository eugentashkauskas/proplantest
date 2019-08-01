describe("Module ap-viewmodels - ManageUserProjectAccessRightViewModel", () => {
    let Utility: ap.utility.UtilityHelper;
    let Api: ap.services.apiHelper.Api;
    let $q: angular.IQService;
    let controllersManager: ap.controllers.ControllersManager;
    let $rootScope: angular.IRootScopeService;
    let vm: ap.viewmodels.projectcontacts.ManageUserProjectAccessRightViewModel;
    let $mdDialog: angular.material.IDialogService;
    let ServicesManager: ap.services.ServicesManager;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject(function (_Utility_, _Api_, _$q_, _$rootScope_, _ControllersManager_, _ServicesManager_) {
        Utility = _Utility_;
        Api = _Api_;
        $q = _$q_;
        $rootScope = _$rootScope_;
        controllersManager = _ControllersManager_;
        ServicesManager = _ServicesManager_;
        specHelper.userContext.stub(Utility)
        let defProjectController = $q.defer();
        spyOn(controllersManager.projectController, "getContactAddedInvitedByUser").and.returnValue(defProjectController.promise);
    }));

    beforeEach(() => {
        specHelper.mainController.stub(controllersManager.mainController, Utility);
        $mdDialog = specHelper.utility.stubShowMdDialog($q);
    });

    let createVm = (selectedIds?: string[]) => {
        return new ap.viewmodels.projectcontacts.ManageUserProjectAccessRightViewModel(Utility, Api, $q, $mdDialog, controllersManager, ServicesManager, selectedIds);
    };
        
    describe("Feature: constructor", () => {
        let testAccessRights: ap.models.accessRights.AccessRight;
        let testAccessRightsDefer: angular.IDeferred<ap.models.accessRights.AccessRight[]>;
        let apiIdsDefer: angular.IDeferred<ap.services.apiHelper.ApiResponse>;
        let apiEntitiesDefer: angular.IDeferred<ap.services.apiHelper.ApiResponse>;
        beforeEach(() => {
            apiIdsDefer = $q.defer();
            apiEntitiesDefer = $q.defer();
            testAccessRights = new ap.models.accessRights.MeetingAccessRight(Utility);
            testAccessRights.createByJson({
                Level: ap.models.accessRights.AccessRightLevel.Admin,
                CanAddPoint: true
            });
            testAccessRightsDefer = $q.defer();
            spyOn(Api, "getApiResponse").and.returnValue(apiIdsDefer.promise);
            spyOn(Api, "getEntityList").and.returnValue(apiEntitiesDefer.promise);
            spyOn(controllersManager.accessRightController, "geAccessRights").and.returnValue(testAccessRightsDefer.promise);
            testAccessRightsDefer.resolve([testAccessRights]);
        });
        describe("WHEN viewmodel is created with an entity ids", () => {
            let entityIds: string[]
            beforeEach(() => {
                entityIds = ["test-entity-id1", "test-entity-id2"];
                vm = createVm(entityIds);
                apiEntitiesDefer.resolve(new ap.services.apiHelper.ApiResponse([]));
                $rootScope.$apply();
            });
            it("THEN, the list is loaded with the input ids", () => {
                expect(vm).toBeDefined();
                expect(vm.listVm).toBeDefined();
                expect(Api.getApiResponse).not.toHaveBeenCalled();
                expect(Api.getEntityList).toHaveBeenCalled();
            });
        });
        describe("WHEN viewmodel is created without an entity ids", () => {
            beforeEach(() => {
                
                vm = createVm();
                apiIdsDefer.resolve(new ap.services.apiHelper.ApiResponse(["test-entity-id1", "test-entity-id2"]));
                let testContactDetails = new ap.models.projects.ContactDetails(Utility);
                testContactDetails.createByJson({
                    Id: "test-entity-id1",
                    Project: {
                        Id: "test-project-id",
                        UserAccessRight: {
                            CanConfig: false
                        }
                    }
                });

                apiEntitiesDefer.resolve(new ap.services.apiHelper.ApiResponse([testContactDetails]));
                $rootScope.$apply();
            });
            it("THEN, ids are loaded before entities load", () => {
                expect(vm).toBeDefined();
                expect(vm.listVm).toBeDefined();
                expect(Api.getApiResponse).toHaveBeenCalled();
                expect(Api.getEntityList).toHaveBeenCalled();
            });
        });
    });
});