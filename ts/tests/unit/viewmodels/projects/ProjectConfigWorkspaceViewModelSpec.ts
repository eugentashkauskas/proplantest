describe("Module ap-viewmodels - projects - ProjectConfigWorkspaceViewModel", () => {
    let $rootScope: angular.IRootScopeService;
    let $scope: angular.IScope;
    let $q: angular.IQService;
    let $mdDialog: angular.material.IDialogService;
    let $timeout: angular.ITimeoutService;
    let Api: ap.services.apiHelper.Api;
    let $controller: angular.IControllerService;
    let $interval: angular.IIntervalService;
    let Utility: ap.utility.UtilityHelper;
    let MainController: ap.controllers.MainController;
    let ProjectController: ap.controllers.ProjectController;
    let AccessRightController: ap.controllers.AccessRightController;
    let UIStateController: ap.controllers.UIStateController;
    let vm: ap.viewmodels.projects.ProjectConfigWorkspaceViewModel;
    let ControllersManager: ap.controllers.ControllersManager;
    let ServicesManager: ap.services.ServicesManager;
    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
        angular.mock.module(function ($provide) {
            $provide.factory('$mdDialog', ["$q", function ($q) {
                return specHelper.utility.stubShowMdDialog($q);
            }]);
        });
    });

    beforeEach(inject(function (_$rootScope_, _ServicesManager_, _$controller_, _MainController_, _ProjectController_, _Utility_, _$q_, _AccessRightController_, _UIStateController_, _Api_, _ControllersManager_, _$mdDialog_, _$timeout_) {
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        Utility = _Utility_;
        $q = _$q_;
        $mdDialog = _$mdDialog_;
        $timeout = _$timeout_;
        ServicesManager = _ServicesManager_,
        $controller = _$controller_;
        MainController = _MainController_;
        ProjectController = _ProjectController_;
        AccessRightController = _AccessRightController_;
        specHelper.userContext.stub(Utility);
        specHelper.utility.stubRootUrl(Utility);
        UIStateController = _UIStateController_;
        Api = _Api_;
        ControllersManager = _ControllersManager_;
        let config = {
            rootUrl: 'https://aproplan.com/initApp/',
            apiUrl: 'https://apiproplan.com',
            intercomId: 'intercomId-$',
            mixpanelToken: 'mixpanelToken',
            wootricAccountToken: 'NPS-8f13c868',
            aproplanApiId: '4526589',
            cryptoKey: "aproplan",
            captchaKey: "captcha",
            appVersion: "Test Version",
            segmentIoId: "segmentIO",
            translationsVersion: "translations version",
        };
        ControllersManager.mainController.initApp(config);
    }));

    beforeEach(() => {
        spyOn(MainController, "initScreen").and.callThrough();;
    });

    describe("Feature: constructor", () => {
        describe("WHEN vm is created with current project.IsNew = false", () => {
            beforeEach(() => {
                spyOn(MainController, "currentProject").and.returnValue({
                    Id: "b360cb6d-ca54-4b93-a564-a469274eb68a",
                    Name: "Welcome Project",
                    IsNew: false,
                    Address: "New York City",
                    UserAccessRight: {
                        CanConfig: true
                    }
                });
                vm = <ap.viewmodels.projects.ProjectConfigWorkspaceViewModel>$controller("projectConfigWorkspaceViewModel", { $scope: $scope, ControllersManager: ControllersManager, $utility: Utility, $q: $q, $mdDialog: $mdDialog, $timeout: $timeout });

            });
            it("THEN vm to be defined", () => {
                expect(vm).toBeDefined();
            });

            it("THEN vm.projectDetailVm to be defined", () => {
                expect(vm.projectDetailVm).toBeDefined();
            });

            it("THEN vm.selectedTab = 0", () => {
                expect(vm.selectedTab).toEqual(0);
            });

            it("THEN, vm.screenInfo should be created with good values", () => {
                expect(vm.screenInfo.title).toBe("Welcome Project");
                expect(vm.screenInfo.name).toBe("projectconfig");
                expect(vm.screenInfo.isFullScreen).toBeTruthy();
            });

            it("THEN, MainController.initScreen should be called with good params", () => {
                expect(MainController.initScreen).toHaveBeenCalledWith(vm.screenInfo);
            });
            it("THEN, screenInfo.isEditMode = false", () => {
                expect(vm.screenInfo.isEditMode).toBeFalsy();
            });
        });        
        describe("WHEN vm is created with current project.IsNew = true", () => {
            beforeEach(() => {
                spyOn(MainController, "currentProject").and.returnValue({
                    Id: "b360cb6d-ca54-4b93-a564-a469274eb68a",
                    Name: "Welcome Project",
                    IsNew: true,
                    Address: "New York City",
                    UserAccessRight: {
                        CanConfig: true
                    }
                });
                let def = $q.defer();
                spyOn(ServicesManager.projectService, "getProjectDetailCountry").and.returnValue(def.promise);
                spyOn(MainController, "getAvailableCountries").and.returnValue($q.defer().promise);
                vm = <ap.viewmodels.projects.ProjectConfigWorkspaceViewModel>$controller("projectConfigWorkspaceViewModel", { $scope: $scope, ControllersManager: ControllersManager, $utility: Utility, $q: $q, $mdDialog: $mdDialog, $timeout: $timeout });
                def.resolve(new ap.services.apiHelper.ApiResponse({
                    Id: "b360cb6d-ca54-4b93-a564-a469274eb68a",
                    Name: "Welcome Project",
                    IsNew: true,
                    Address: "New York City",
                    UserAccessRight: {
                        CanConfig: true
                    }
                }));
                $rootScope.$apply();
            });
            it("THEN vm to be defined", () => {
                expect(vm).toBeDefined();
            });

            it("THEN vm.projectDetailVm to be defined", () => {
                expect(vm.projectDetailVm).toBeDefined();
            });

            it("THEN vm.selectedTab = 0", () => {
                expect(vm.selectedTab).toEqual(0);
            });

            it("THEN, vm.screenInfo should be created with good values", () => {
                expect(vm.screenInfo.title).toBe("Welcome Project");
                expect(vm.screenInfo.name).toBe("projectconfig");
                expect(vm.screenInfo.isFullScreen).toBeTruthy();
            });

            it("THEN, MainController.initScreen should be called with good params", () => {
                expect(MainController.initScreen).toHaveBeenCalledWith(vm.screenInfo);
            });
            it("THEN, screenInfo.isEditMode = true", () => {
                expect(vm.screenInfo.isEditMode).toBeTruthy();
            });
        });    
    });

    describe("Feature: goBackRequestHandler", () => {
        beforeEach(() => {
            spyOn(MainController, "currentProject").and.returnValue({
                Id: "b360cb6d-ca54-4b93-a564-a469274eb68a",
                Name: "Welcome Project",
                IsNew: false,
                Address: "New York City",
                UserAccessRight: {
                    CanConfig: true
                }
            });
            vm = <ap.viewmodels.projects.ProjectConfigWorkspaceViewModel>$controller("projectConfigWorkspaceViewModel", { $scope: $scope, ControllersManager: ControllersManager, $utility: Utility, $q: $q, $mdDialog: $mdDialog, $timeout: $timeout });
        });
        describe("WHEN event 'gobackrequested' is rised", () => {
            

            beforeEach(() => {
                spyOn(UIStateController, "changeFlowState");
                specHelper.general.raiseEvent(MainController, "gobackrequested", null);
            });

            

            it("THEN, UIStateController.mainFlowState should be switched to Projects", () => {
                expect(UIStateController.changeFlowState).toHaveBeenCalledWith(ap.controllers.MainFlow.Projects);
            });
        });
    });

    describe("Feature checkHasStatusAccess", () => {
        beforeEach(() => {
            spyOn(MainController, "currentProject").and.returnValue({
                Id: "b360cb6d-ca54-4b93-a564-a469274eb68a",
                Name: "Welcome Project",
                IsNew: false,
                Address: "New York City",
                UserAccessRight: {
                    CanConfig: true
                }
            });
        });
        describe("WHEN the user has license FREE", () => {
            beforeEach(() => {
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake((moduleName) => {
                    if (moduleName === ap.models.licensing.Module.Module_ProjectStatusConfig) return false;
                    return true;
                });
                vm = <ap.viewmodels.projects.ProjectConfigWorkspaceViewModel>$controller("projectConfigWorkspaceViewModel", { $scope: $scope, ControllersManager: ControllersManager, $utility: Utility, $q: $q, $mdDialog: $mdDialog, $timeout: $timeout });
            });
            it("THEN has acces is false", () => {
                expect(vm.hasStatusAccess).toBeFalsy();
            });
        });
        describe("WHEN the user has other licenses", () => {
            beforeEach(() => {
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake((moduleName) => {
                    if (moduleName === ap.models.licensing.Module.Module_ProjectStatusConfig) return true;
                    return false;
                });
                vm = <ap.viewmodels.projects.ProjectConfigWorkspaceViewModel>$controller("projectConfigWorkspaceViewModel", { $scope: $scope, ControllersManager: ControllersManager, $utility: Utility, $q: $q, $mdDialog: $mdDialog, $timeout: $timeout });
            });
            it("THEN has acces is true", () => {
                expect(vm.hasStatusAccess).toBeTruthy();
            });
        });
    });

    describe("Feature checkHasRoomConfigAccess", () => {
        describe("WHEN the user has license FREE", () => {
            beforeEach(() => {
                spyOn(MainController, "currentProject").and.returnValue({
                    Id: "b360cb6d-ca54-4b93-a564-a469274eb68a",
                    Name: "Welcome Project",
                    IsNew: false,
                    Address: "New York City",
                    UserAccessRight: {
                        CanConfig: true
                    }
                });
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake((moduleName) => {
                    if (moduleName === ap.models.licensing.Module.Module_ProjectRoomConfig) return false;
                    return true;
                });
                vm = <ap.viewmodels.projects.ProjectConfigWorkspaceViewModel>$controller("projectConfigWorkspaceViewModel", { $scope: $scope, ControllersManager: ControllersManager, $utility: Utility, $q: $q, $mdDialog: $mdDialog });
            });
            it("THEN has access is false", () => {
                expect(vm.hasRoomConfigAccess).toBeFalsy();
            });
        });
        describe("WHEN the user has other licenses", () => {
            beforeEach(() => {
                spyOn(MainController, "currentProject").and.returnValue({
                    Id: "b360cb6d-ca54-4b93-a564-a469274eb68a",
                    Name: "Welcome Project",
                    IsNew: false,
                    Address: "New York City",
                    UserAccessRight: {
                        CanConfig: true
                    }
                });
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake((moduleName) => {
                    if (moduleName === ap.models.licensing.Module.Module_ProjectRoomConfig) return true;
                    return false;
                });
                vm = <ap.viewmodels.projects.ProjectConfigWorkspaceViewModel>$controller("projectConfigWorkspaceViewModel", { $scope: $scope, ControllersManager: ControllersManager, $utility: Utility, $q: $q, $mdDialog: $mdDialog, $timeout: $timeout });
            });
            it("THEN has access is true", () => {
                expect(vm.hasRoomConfigAccess).toBeTruthy();
            });
        });
    });

    describe("Feature hasIssueTypeConfigAccess", () => {
        describe("WHEN the user has license FREE", () => {
            beforeEach(() => {
                spyOn(MainController, "currentProject").and.returnValue({
                    Id: "b360cb6d-ca54-4b93-a564-a469274eb68a",
                    Name: "Welcome Project",
                    IsNew: false,
                    Address: "New York City",
                    UserAccessRight: {
                        CanConfig: true
                    }
                });
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake((moduleName) => {
                    return false;
                });
                vm = <ap.viewmodels.projects.ProjectConfigWorkspaceViewModel>$controller("projectConfigWorkspaceViewModel", { $scope: $scope, ControllersManager: ControllersManager, $utility: Utility, $q: $q, $mdDialog: $mdDialog, $timeout: $timeout });
            });
            it("THEN has acces is false", () => {
                expect(vm.hasIssueTypeConfigAccess).toBeFalsy();
            });
        });
        describe("WHEN the user has other licenses", () => {
            beforeEach(() => {
                spyOn(MainController, "currentProject").and.returnValue({
                    Id: "b360cb6d-ca54-4b93-a564-a469274eb68a",
                    Name: "Welcome Project",
                    IsNew: false,
                    Address: "New York City",
                    UserAccessRight: {
                        CanConfig: true
                    }
                });
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake((moduleName) => {
                    if (moduleName === ap.models.licensing.Module.Module_ProjectIssueTypeConfig) return true;
                    return false;
                });
                vm = <ap.viewmodels.projects.ProjectConfigWorkspaceViewModel>$controller("projectConfigWorkspaceViewModel", { $scope: $scope, ControllersManager: ControllersManager, $utility: Utility, $q: $q, $mdDialog: $mdDialog, $timeout: $timeout });
            });
            it("THEN has acces is true", () => {
                expect(vm.hasIssueTypeConfigAccess).toBeTruthy();
            });
        });
    });

    describe("Feature editModeChanged", () => {
        describe("WHEN current project.IsNew = true", () => {
            beforeEach(() => {
                spyOn(MainController, "currentProject").and.returnValue({
                    Id: "b360cb6d-ca54-4b93-a564-a469274eb68a",
                    Name: "Welcome Project",
                    IsNew: false,
                    Address: "New York City",
                    UserAccessRight: {
                        CanConfig: true
                    }
                });
                vm = <ap.viewmodels.projects.ProjectConfigWorkspaceViewModel>$controller("projectConfigWorkspaceViewModel", { $scope: $scope, ControllersManager: ControllersManager, $utility: Utility, $q: $q, $mdDialog: $mdDialog, $timeout: $timeout });
            });
            describe("WHEN isEditMode = true", () => {
                beforeEach(() => {
                    specHelper.general.raiseEvent(vm.projectDetailVm, "editmodechanged", new ap.viewmodels.base.EditModeEvent(vm.projectDetailVm, true, false));
                    specHelper.general.raiseEvent(vm.projectDetailVm, "editmodechanged", new ap.viewmodels.base.EditModeEvent(vm.projectDetailVm, true, false));
                });
                it("THEN isEditMode = screenInfo.isEditMode", () => {
                    expect(vm.screenInfo.isEditMode).toEqual(vm.projectDetailVm.screenInfo.isEditMode);
                });
            });
            describe("WHEN isEditMode = false", () => {
                beforeEach(() => {
                    specHelper.general.raiseEvent(vm.projectDetailVm, "editmodechanged", new ap.viewmodels.base.EditModeEvent(vm.projectDetailVm, true, false));
                });
                
                it("THEN isEditMode = screenInfo.isEditMode", () => {
                    expect(vm.screenInfo.isEditMode).toEqual(vm.projectDetailVm.screenInfo.isEditMode);
                });
            });
            describe("WHEN isCancelAction = false", () => {
                beforeEach(() => {
                    specHelper.general.raiseEvent(vm.projectDetailVm, "editmodechanged", new ap.viewmodels.base.EditModeEvent(vm.projectDetailVm, true, false));
                });
                it("THEN mainFlow doesn't change", () => {
                    expect(ControllersManager.uiStateController.mainFlowState).not.toEqual(ap.controllers.MainFlow.Projects);
                });
            });
            describe("WHEN isCancelAction = true", () => {
                beforeEach(() => {
                    specHelper.general.raiseEvent(vm.projectDetailVm, "editmodechanged", new ap.viewmodels.base.EditModeEvent(vm.projectDetailVm, true, true));
                });
                it("THEN mainFlow = Projects", () => {
                    expect(ControllersManager.uiStateController.mainFlowState).toEqual(ap.controllers.MainFlow.Projects);
                });
            });
        });
        describe("WHEN current project.IsNew = false", () => {
            beforeEach(() => {
                spyOn(MainController, "currentProject").and.returnValue({
                    Id: "b360cb6d-ca54-4b93-a564-a469274eb68a",
                    Name: "Welcome Project",
                    IsNew: false,
                    Address: "New York City",
                    UserAccessRight: {
                        CanConfig: true
                    }
                });
                vm = <ap.viewmodels.projects.ProjectConfigWorkspaceViewModel>$controller("projectConfigWorkspaceViewModel", { $scope: $scope, ControllersManager: ControllersManager, $utility: Utility, $q: $q, $mdDialog: $mdDialog, $timeout: $timeout });
            });
            describe("WHEN isEditMode = true", () => {
                beforeEach(() => {
                    specHelper.general.raiseEvent(vm.projectDetailVm, "editmodechanged", new ap.viewmodels.base.EditModeEvent(vm.projectDetailVm, true, false));
                    specHelper.general.raiseEvent(vm.projectDetailVm, "editmodechanged", new ap.viewmodels.base.EditModeEvent(vm.projectDetailVm, false, false));
                });
                it("THEN isEditMode = screenInfo.isEditMode", () => {
                    expect(vm.screenInfo.isEditMode).toEqual(vm.projectDetailVm.screenInfo.isEditMode);
                });
            });
            describe("WHEN isEditMode = false", () => {
                beforeEach(() => {
                    specHelper.general.raiseEvent(vm.projectDetailVm, "editmodechanged", new ap.viewmodels.base.EditModeEvent(vm.projectDetailVm, false, false));
                });
                it("THEN isEditMode = screenInfo.isEditMode", () => {
                    expect(vm.screenInfo.isEditMode).toEqual(vm.projectDetailVm.screenInfo.isEditMode);
                });
            });
            describe("WHEN isCancelAction = false", () => {
                beforeEach(() => {
                    specHelper.general.raiseEvent(vm.projectDetailVm, "editmodechanged", new ap.viewmodels.base.EditModeEvent(vm.projectDetailVm, false, false));
                });
                it("THEN mainFlow doesn't change", () => {
                    expect(ControllersManager.uiStateController.mainFlowState).not.toEqual(ap.controllers.MainFlow.Projects);
                });
            });
            describe("WHEN isCancelAction = true", () => {
                beforeEach(() => {
                    specHelper.general.raiseEvent(vm.projectDetailVm, "editmodechanged", new ap.viewmodels.base.EditModeEvent(vm.projectDetailVm, false, true));
                });
                it("THEN mainFlow doesn't change", () => {
                    expect(ControllersManager.uiStateController.mainFlowState).not.toEqual(ap.controllers.MainFlow.Projects);
                });
            });
        });
    });

    describe("Feature: selected tab", () => {
        beforeEach(() => {
            spyOn(MainController, "currentProject").and.returnValue({
                Id: "b360cb6d-ca54-4b93-a564-a469274eb68a",
                Name: "Welcome Project",
                IsNew: false,
                Address: "New York City",
                UserAccessRight: {
                    CanConfig: true
                }
            });
            spyOn(ServicesManager.projectService, "getProjectDetailCountry").and.returnValue($q.defer().promise);
            vm = <ap.viewmodels.projects.ProjectConfigWorkspaceViewModel>$controller("projectConfigWorkspaceViewModel", { $scope: $scope, ControllersManager: ControllersManager, $utility: Utility, $q: $q, $mdDialog: $mdDialog, $timeout: $timeout });
        });
        describe("WHEN the selected tab == 0", () => {
            beforeEach(() => {
                vm.selectedTab = 0;
            });
            it("THEN projectDetailVm is defined", () => {
                expect(vm.projectDetailVm).toBeDefined();
            });
        });
        
        describe("WHEN the selected tab == 1", () => {
            let deferred: angular.IDeferred<any>;
            describe("WHEN the categories list vm is not defined", () => {
                beforeEach(() => {
                    deferred = $q.defer();
                    spyOn(Api, "getApiResponse").and.returnValue(deferred.promise);
                    vm.selectedTab = 1
                });
                it("THEN projectIssueTypeConfigVm is defined", () => {
                    expect(vm.projectIssueTypeConfigVm).toBeDefined();
                });
                it("THEN loadData is called", () => {
                    expect(Api.getApiResponse).toHaveBeenCalled();
                });
                it("THEN the actions are the one defined in projectIssueTypeconfigVm", () => {
                    expect(vm.screenInfo.actions).toEqual(vm.projectIssueTypeConfigVm.screenInfo.actions);
                });
            });
           describe("WHEN the projectIssueTypeConfigVm vm is defined", () => {
                beforeEach(() => {
                    deferred = $q.defer();
                    spyOn(Api, "getApiResponse").and.returnValue(deferred.promise);
                    vm.selectedTab = 1
                    vm.selectedTab = 1
                });
                it("THEN loadData is called", () => {
                    expect(Api.getApiResponse).toHaveBeenCalled();
                });
                it("THEN the actions are the one defined in projectIssueTypeconfigVm", () => {
                    expect(vm.screenInfo.actions).toEqual(vm.projectIssueTypeConfigVm.screenInfo.actions);
                });
            });
            describe("WHEN switch to projectIssueTypeConfigVm tab", () => {
                beforeEach(() => {
                    deferred = $q.defer();
                    spyOn(Api, "getApiResponse").and.returnValue(deferred.promise);

                    vm.selectedTab = 1;
                });
            });
            describe("WHEN UN-select categories tab", () => {
                beforeEach(() => {
                    deferred = $q.defer();
                    spyOn(Api, "getApiResponse").and.returnValue(deferred.promise);


                    vm.selectedTab = 1;
                    vm.selectedTab = 0;
                });
                it("THEN current screen infor is NOT the one from projectIssueTypeConfigVm", () => {
                    expect(vm.screenInfo.name).not.toEqual(vm.projectIssueTypeConfigVm.screenInfo.name);
                });
            });
        });

        describe("WHEN the selected tab == 2", () => {
            let deferred: angular.IDeferred<any>;
            describe("WHEN the roomConfig vm is not defined", () => {
                beforeEach(() => {
                    deferred = $q.defer();
                    spyOn(Api, "getApiResponse").and.returnValue(deferred.promise);
                    vm.selectedTab = 2;
                });
                it("THEN projectRoomConfigVm is defined", () => {
                    expect(vm.projectRoomConfigVm).toBeDefined();
                });
                it("THEN load is called", () => {
                    expect(Api.getApiResponse).toHaveBeenCalled();
                });
                it("THEN the actions are the one defined in projectIssueTypeconfigVm", () => {
                    expect(vm.screenInfo.actions).toEqual(vm.projectRoomConfigVm.screenInfo.actions);
                });
            });
            describe("WHEN the roomConfig vm is defined", () => {

                beforeEach(() => {
                    deferred = $q.defer();
                    spyOn(Api, "getApiResponse").and.returnValue(deferred.promise);
                    vm.selectedTab = 2;
                    vm.selectedTab = 2;
                });
                it("THEN load is called", () => {
                    expect(Api.getApiResponse).toHaveBeenCalled();
                });
                it("THEN the actions are the one defined in projectIssueTypeconfigVm", () => {
                    expect(vm.screenInfo.actions).toBe(vm.projectRoomConfigVm.screenInfo.actions);
                });
            });
            
            describe("WHEN UN-select roomConfig tab", () => {
                beforeEach(() => {
                    deferred = $q.defer();
                    spyOn(Api, "getApiResponse").and.returnValue(deferred.promise);


                    vm.selectedTab = 2;
                    vm.selectedTab = 0;
                });
                it("THEN current screen infor is NOT the one from projectIssueTypeConfigVm", () => {
                    expect(vm.screenInfo.name).not.toEqual(vm.projectRoomConfigVm.screenInfo.name);
                });
            });
        });

        describe("WHEN the selected tab == 3", () => {
            let deferred: angular.IDeferred<any>;           
            describe("WHEN the status vm is not defined", () => {
                beforeEach(() => {
                    deferred = $q.defer();
                    spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue(deferred.promise);                    
                    vm.selectedTab = 3;

                    deferred.resolve([]);
                    $rootScope.$apply();
                });
                it("THEN projectStatusVm is defined", () => {
                    expect(vm.projectStatusVm).toBeDefined();
                });
                it("THEN loadData is called", () => {
                    expect(ProjectController.getNoteProjectStatusList).toHaveBeenCalled();
                });
                it("THEN the actions are the one defined in projectIssueTypeconfigVm", () => {
                    expect(vm.screenInfo.actions.length).toEqual(vm.projectStatusVm.screenInfo.actions.length);
                    for (let action = 0; action < vm.screenInfo.actions.length; action++) {
                        expect(vm.screenInfo.actions[action].name).toEqual(vm.projectStatusVm.screenInfo.actions[action].name);
                    }
                });
            });
            describe("WHEN the status vm is defined", () => {
                beforeEach(() => {
                    deferred = $q.defer();
                    spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue(deferred.promise);
                    vm.selectedTab = 3;
                    vm.selectedTab = 3;

                    deferred.resolve([]);
                    $rootScope.$apply();
                });
                it("THEN loadData is called", () => {
                    expect(ProjectController.getNoteProjectStatusList).toHaveBeenCalled();
                });
                it("THEN the actions are the one defined in projectIssueTypeconfigVm", () => {
                    expect(vm.screenInfo.actions.length).toEqual(vm.projectStatusVm.screenInfo.actions.length);
                    for (let action = 0; action < vm.screenInfo.actions.length; action++) {
                        expect(vm.screenInfo.actions[action].name).toEqual(vm.projectStatusVm.screenInfo.actions[action].name);
                    }
                });
            });

            describe("WHEN switch to status tab", () => {
                beforeEach(() => {
                    deferred = $q.defer();
                    spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue(deferred.promise);

                    vm.selectedTab = 3;

                    deferred.resolve([]);
                    $rootScope.$apply();
                });
                it("THEN the actions are the one defined in projectIssueTypeconfigVm", () => {
                    expect(vm.screenInfo.actions.length).toEqual(vm.projectStatusVm.screenInfo.actions.length);
                    for (let action = 0; action < vm.screenInfo.actions.length; action++) {
                        expect(vm.screenInfo.actions[action].name).toEqual(vm.projectStatusVm.screenInfo.actions[action].name);
                    }
                });
            });            
            describe("WHEN UN-select status tab", () => {
                beforeEach(() => {
                    deferred = $q.defer();
                    spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue(deferred.promise);

                    vm.selectedTab = 3;
                    vm.selectedTab = 0;
                });
                it("THEN current screen infor is NOT the one from projectIssueTypeConfigVm", () => {
                    expect(vm.screenInfo.name).not.toEqual(vm.projectStatusVm.screenInfo.name);
                });
            });
         });  
    });

    describe("Feature: Dispose", () => {

        beforeEach(() => {
            spyOn(MainController, "currentProject").and.returnValue({
                Id: "b360cb6d-ca54-4b93-a564-a469274eb68a",
                Name: "Welcome Project",
                IsNew: false,
                Address: "New York City",
                UserAccessRight: {
                    CanConfig: true
                }
            });
            vm = <ap.viewmodels.projects.ProjectConfigWorkspaceViewModel>$controller("projectConfigWorkspaceViewModel", { $scope: $scope, ControllersManager: ControllersManager, $utility: Utility, $q: $q, $mdDialog: $mdDialog, $timeout: $timeout });
            specHelper.general.spyProperty(ap.viewmodels.projects.ProjectConfigWorkspaceViewModel.prototype, "projectIssueTypeConfigVm", specHelper.PropertyAccessor.Get).and.returnValue({
                dispose: () => { }
            });
            specHelper.general.spyProperty(ap.viewmodels.projects.ProjectConfigWorkspaceViewModel.prototype, "projectRoomConfigVm", specHelper.PropertyAccessor.Get).and.returnValue({
                dispose: () => { }
            });
            specHelper.general.spyProperty(ap.viewmodels.projects.ProjectConfigWorkspaceViewModel.prototype, "projectStatusVm", specHelper.PropertyAccessor.Get).and.returnValue({
                dispose: () => { }
            });

            spyOn(vm.projectIssueTypeConfigVm, "dispose");
            spyOn(vm.projectRoomConfigVm, "dispose");
            spyOn(vm.projectStatusVm, "dispose");

            vm.dispose();
        });

        afterEach(() => {
            specHelper.general.offSpyProperty(ap.viewmodels.projects.ProjectConfigWorkspaceViewModel.prototype, "projectIssueTypeConfigVm", specHelper.PropertyAccessor.Get);
            specHelper.general.offSpyProperty(ap.viewmodels.projects.ProjectConfigWorkspaceViewModel.prototype, "projectRoomConfigVm", specHelper.PropertyAccessor.Get);
            specHelper.general.offSpyProperty(ap.viewmodels.projects.ProjectConfigWorkspaceViewModel.prototype, "projectStatusVm", specHelper.PropertyAccessor.Get);
        });

        describe("WHEN dispose is called", () => {
            it("THEN, projectIssueTypeConfigVm.dipose is called", () => {
                expect(vm.projectIssueTypeConfigVm.dispose).toHaveBeenCalled();
            });

            it("THEN, projectRoomConfigVm.dipose is called", () => {
                expect(vm.projectRoomConfigVm.dispose).toHaveBeenCalled();
            });

            it("THEN, projectStatusVm.dipose is called", () => {
                expect(vm.projectStatusVm.dispose).toHaveBeenCalled();
            });
        });
    });
}); 