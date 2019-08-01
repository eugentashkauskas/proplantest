describe("Feature: AutoCompleteInChargeViewModel", () => {
    let $utility: ap.utility.UtilityHelper;
    let UserContext: ap.utility.UserContext;
    let $mdDialog: angular.material.IDialogService;
    let $controllersManager: ap.controllers.ControllersManager;
    let $q: angular.IQService;
    let $rootScope: angular.IRootScopeService;
    let vm: ap.viewmodels.notes.AutoCompleteInChargeViewModel;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
        angular.mock.module("ap-controllers");
        angular.mock.module(function ($provide) {
            $provide.factory('$mdDialog', ["$q", function ($q) {
                return specHelper.utility.stubShowMdDialog($q);
            }]);
        });
    });

    beforeEach(inject(function (_Utility_, _UserContext_, _$q_, _$mdDialog_,  _$rootScope_, _ControllersManager_) {
        $utility = _Utility_;
        // UserContext = _UserContext_;
        $q = _$q_;
        $mdDialog = _$mdDialog_;
        $rootScope = _$rootScope_;
        $controllersManager = _ControllersManager_;
    }));

    beforeEach(() => {
        vm = new ap.viewmodels.notes.AutoCompleteInChargeViewModel($utility, $mdDialog, $controllersManager);
    })

    describe("Feature: constructor", () => {
        describe("WHEN we create new instance", () => {
            it("THEN, new instance is initialized", () => {
                expect(vm).toBeDefined();
            });
        });
    });
 
    describe("Feature: action methods calling API service", () => {
        let testUserInCharge: ap.viewmodels.projects.ContactItemViewModel;
        let testIssueType: ap.viewmodels.projects.ChapterHierarchyItemViewModel;
        let contactdetails: ap.models.projects.ContactDetails;

        beforeEach(() => {
            contactdetails = new ap.models.projects.ContactDetails($utility);
            testUserInCharge = new ap.viewmodels.projects.ContactItemViewModel("test-display-text", "test-user-id", null, contactdetails);
            let issueTypeEntity = new ap.models.projects.CellHierarchy($utility);
            issueTypeEntity.createByJson({
                EntityId: "issue-type-id",
                EntityName: "SubCell",
                Code: "issue-type-code"
            });
            testIssueType = new ap.viewmodels.projects.ChapterHierarchyItemViewModel($utility, $q);
            testIssueType.init(issueTypeEntity);
            vm.initData(testUserInCharge, testIssueType);
            spyOn($controllersManager.mainController, "showBusy");
            spyOn($controllersManager.mainController, "hideBusy");
        });
        describe("WHEN 'LINK' action method is called", () => {
            let apiDefer: angular.IDeferred<ap.models.projects.ContactIssueType>;
            beforeEach(() => {
                apiDefer = $q.defer();                
                spyOn($controllersManager.noteController, "saveContactIssueType").and.returnValue(apiDefer.promise);
                vm.linkUserToCategory();
            });
            it("THEN, call controller's method to save contact link with issue type AND close popup dialog window", () => {
                expect($controllersManager.mainController.showBusy).toHaveBeenCalled();
                expect($controllersManager.noteController.saveContactIssueType).toHaveBeenCalledWith("issue-type-id", contactdetails.Id);
                expect($controllersManager.mainController.hideBusy).not.toHaveBeenCalled();
                apiDefer.resolve();
                $rootScope.$apply();
                expect($controllersManager.mainController.hideBusy).toHaveBeenCalled();
                expect($mdDialog.hide).toHaveBeenCalled();
            });
        });
        describe("WHEN 'REMIND ME LATER' action method is called", () => {
            let apiDefer: angular.IDeferred<boolean>;
            let apiSuccess: boolean;
            beforeEach(() => {
                apiDefer = $q.defer();
                spyOn($controllersManager.noteController, "updateNextTimeAskInChargeLink").and.returnValue(apiDefer.promise);
                vm.remindLater();
            });
            describe("AND update was successful", () => {
                beforeEach(() => {
                    apiSuccess = true;
                });
                it("THEN, cupdate next time ask to link user in charge with issue type and close the popup window", () => {
                    expect($controllersManager.mainController.showBusy).toHaveBeenCalled();
                    expect($controllersManager.noteController.updateNextTimeAskInChargeLink).toHaveBeenCalledWith("test-user-id", "issue-type-id", ap.controllers.InChargeNextLinkAsked.LATER);
                    expect($controllersManager.mainController.hideBusy).not.toHaveBeenCalled();
                    apiDefer.resolve(apiSuccess);
                    $rootScope.$apply();
                    expect($controllersManager.mainController.hideBusy).toHaveBeenCalled();
                    expect($mdDialog.hide).toHaveBeenCalled();
                });
            });
            describe("AND update was not successful", () => {
                beforeEach(() => {
                    apiSuccess = false;
                    spyOn($controllersManager.mainController, "showError");
                });
                it("THEN, close the popup window and display an error message", () => {
                    expect($controllersManager.mainController.showBusy).toHaveBeenCalled();
                    expect($controllersManager.noteController.updateNextTimeAskInChargeLink).toHaveBeenCalledWith("test-user-id", "issue-type-id", ap.controllers.InChargeNextLinkAsked.LATER);
                    expect($controllersManager.mainController.hideBusy).not.toHaveBeenCalled();
                    apiDefer.resolve(apiSuccess);
                    $rootScope.$apply();
                    expect($controllersManager.mainController.hideBusy).toHaveBeenCalled();
                    expect($mdDialog.hide).toHaveBeenCalled();

                    expect($controllersManager.mainController.showError).toHaveBeenCalled();
                });
            })
        });
        describe("WHEN 'CLOSE' action method is called", () => {
            let apiNextTimeDefer: angular.IDeferred<boolean>;
            beforeEach(() => {
                apiNextTimeDefer = $q.defer();
                spyOn($controllersManager.noteController, "updateNextTimeAskInChargeLink").and.returnValue(apiNextTimeDefer.promise);
                vm.preventLinkUserToCategory();
                
            });
            it("THEN, update next time asking to link user in charge with category", () => {
                expect($controllersManager.noteController.updateNextTimeAskInChargeLink).toHaveBeenCalled();
            });
            describe("AND update was successful", () => {
                let testUserPreference: ap.models.actors.UserPreference;
                let saveUserPrefApiDefer: angular.IDeferred<ap.models.actors.UserPreference>;
                
                beforeEach(() => {
                    testUserPreference = new ap.models.actors.UserPreference($utility);
                    testUserPreference.Key = "testKey";
                    testUserPreference.Value = "testValue";
                    testUserPreference.Module = "General";
                    $utility.UserContext.UserPreferences = [testUserPreference];
                    saveUserPrefApiDefer = $q.defer();
                    apiNextTimeDefer.resolve(true);
                    spyOn($controllersManager.userController, "saveUserPreference").and.returnValue(saveUserPrefApiDefer.promise);
                    $utility.UserContext.UserPreferences = [testUserPreference];
                });
                describe("AND user have checked 'Remember my decision' checkbox", () => {
                    beforeEach(() => {
                        vm.isFeatureDisabled = true;
                        saveUserPrefApiDefer.resolve();
                    });
                    describe("AND UserPreference with 'ProposeInCharge' key found in the user preferences", () => {
                        beforeEach(() => {
                            testUserPreference.Key = "ProposeInCharge";
                            $rootScope.$apply();
                        });
                        it("THEN, update user preference value and save it", () => {
                            expect($controllersManager.mainController.showBusy).toHaveBeenCalled();
                            expect($controllersManager.userController.saveUserPreference).toHaveBeenCalledWith(testUserPreference);
                            expect(testUserPreference.Value).toEqual("false");
                            expect($controllersManager.mainController.hideBusy).toHaveBeenCalled();
                            expect($mdDialog.hide).toHaveBeenCalled();
                        });
                    });
                    describe("AND UserPreference with 'ProposeInCharge' key was not found in the user preferences", () => {
                        let newTestPreference: ap.models.actors.UserPreference;
                        beforeEach(() => {
                            newTestPreference = new ap.models.actors.UserPreference($utility);
                            newTestPreference.Key = "ProposeInCharge";
                            newTestPreference.Value = "false";
                            newTestPreference.Module = "General";
                            $rootScope.$apply();
                        });
                        it("THEN, update user preference value and save it", () => {
                            expect($controllersManager.mainController.showBusy).toHaveBeenCalled();
                            expect($controllersManager.userController.saveUserPreference).toHaveBeenCalled();
                            expect($utility.UserContext.UserPreferences.length).toEqual(2);
                            expect($utility.UserContext.UserPreferences[1].Key).toEqual("ProposeInCharge");
                            expect($utility.UserContext.UserPreferences[1].Value).toEqual("false");
                            expect($utility.UserContext.UserPreferences[1].Module).toEqual("General");
                            expect($controllersManager.mainController.hideBusy).toHaveBeenCalled();
                            expect($mdDialog.hide).toHaveBeenCalled();
                        });
                    });
                });
                describe("AND user have not checked 'Remember my decision' checkbox", () => {
                    beforeEach(() => {
                        vm.isFeatureDisabled = false;
                        $rootScope.$apply();
                    });
                    it("THEN, close the popup window", () => {
                        expect($controllersManager.mainController.hideBusy).toHaveBeenCalled();
                        expect($mdDialog.hide).toHaveBeenCalled();
                    });
                });
            });
            describe("AND update was not successful", () => {
                beforeEach(() => {
                    apiNextTimeDefer.resolve(false);
                    spyOn($controllersManager.mainController, "showError");
                    $rootScope.$apply();
                });
                it("THEN, close the popup window and display an error message", () => {
                    expect($controllersManager.mainController.hideBusy).toHaveBeenCalled();
                    expect($mdDialog.hide).toHaveBeenCalled();
                    expect($controllersManager.mainController.showError).toHaveBeenCalled();
                });
            });
        });
    });
});