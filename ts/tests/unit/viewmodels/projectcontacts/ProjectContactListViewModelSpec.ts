describe("Module ap-viewmodels - projectContactListViewModel", () => {
    let $q: angular.IQService;
    let $timeout: angular.ITimeoutService;
    let $rootScope: angular.IRootScopeService;
    let Utility: ap.utility.UtilityHelper;
    let Api: ap.services.apiHelper.Api;
    let ControllersManager: ap.controllers.ControllersManager;
    let vm: ap.viewmodels.projectcontacts.ProjectContactListViewModel;
    let evtHelper: ap.utility.EventHelper;
    let initialLoadDataSpy: jasmine.Spy;
    let ServicesManager: ap.services.ServicesManager;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject((_$q_, _$timeout_, _$rootScope_, _Utility_, _Api_, _ControllersManager_, _EventHelper_, _ServicesManager_) => {
        $q = _$q_;
        $timeout = _$timeout_;
        $rootScope = _$rootScope_;
        Utility = _Utility_;
        Api = _Api_;
        ControllersManager = _ControllersManager_;
        ServicesManager = _ServicesManager_;
        evtHelper = _EventHelper_;
        specHelper.utility.stubRootUrl(Utility);
        specHelper.userContext.stub(Utility);
        specHelper.utility.stubStorageSet(Utility);
        specHelper.general.spyProperty(ap.controllers.UIStateController.prototype, "mainFlowState", specHelper.PropertyAccessor.Get).and.returnValue(ap.controllers.MainFlow.Contacts);

        let currentProject = new ap.models.projects.Project(Utility);
        currentProject.createByJson({ Id: "35a2c5d6-0e00-43e9-ada8-ce4f3fadb16e" });
        spyOn(ControllersManager.mainController, "currentProject").and.returnValue(currentProject);
    }));

    afterEach(() => {
        specHelper.general.offSpyProperty(ap.controllers.UIStateController.prototype, "mainFlowState", specHelper.PropertyAccessor.Get);
    });

    function createVm(isForImport: boolean = false) {
        vm = new ap.viewmodels.projectcontacts.ProjectContactListViewModel(Utility, $q, ControllersManager, $timeout, ServicesManager, isForImport);
    }

    beforeEach(() => {
        createVm();
    });

    describe("Feature: constructor", () => {
        describe("WHEN the vm is not created for an import", () => {
            beforeEach(() => {
                createVm();
            });
            it("can get listVm from viewmodel", () => {
                expect(vm.listVm).toBeDefined();
            });
            it("can get correct pathToLoad from viewmodel", () => {
                expect(vm.listVm.pathToLoad).toEqual("User,User.Person,Project,IsInvited,NumberPurchasedBundle,HasSuperAdminModule");
            });
            it("can viewmodel options are defined and valid", () => {
                let options = vm.listVm.options;
                expect(options).toBeDefined();
                expect(options.onlyPathToLoadData).toEqual(false);
                expect(options.entityName).toEqual("ContactDetails");
                expect(options.pathToLoad).toEqual("User,User.Person,Project,IsInvited,NumberPurchasedBundle,HasSuperAdminModule");
                expect(options.requestMethodType).toBe(ap.services.apiHelper.MethodType.Get);
                expect(options.customEntityIds).toBeNull();
            });
        });
        describe("WHEN the vm is created for an import", () => {
            beforeEach(() => {
                createVm(true);
            });
            it("can get listVm from viewmodel", () => {
                expect(vm.listVm).toBeDefined();
            });
            it("can get correct pathToLoad from viewmodel", () => {
                expect(vm.listVm.pathToLoad).toEqual("User,User.Person,Project,IsInvited,NumberPurchasedBundle,HasSuperAdminModule");
            });
            it("can viewmodel options are defined and valid", () => {
                let options = vm.listVm.options;
                expect(options).toBeDefined();
                expect(options.onlyPathToLoadData).toEqual(false);
                expect(options.entityName).toEqual("ContactDetails");
                expect(options.pathToLoad).toEqual("User,User.Person,Project,IsInvited,NumberPurchasedBundle,HasSuperAdminModule");
                expect(options.requestMethodType).toBe(ap.services.apiHelper.MethodType.Post);
                expect(options.customEntityIds).toBe("contactdetailsidsbyuser");
                expect(options.isGetIdsCustom).toBeTruthy();
            });
        });
    });
    describe("Feature: load", () => {
        let filter: string;
        beforeEach(() => {
            createVm();
            filter = Filter.eq("Project.Id", "35a2c5d6-0e00-43e9-ada8-ce4f3fadb16e");
            spyOn(vm.listVm, "loadIds").and.returnValue($q.defer().promise);
            vm.load();
            $rootScope.$apply();
        });
        describe("WHEN the loadIds is called", () => {
            it("THEN, list is filter on current project", () => {
                expect(vm.listVm.loadIds).toHaveBeenCalledWith(filter, undefined);
            });
        });
    });
    describe("Feature: ScreenInfo", () => {
        describe("WHEN the vm is created", () => {
            let refreshAction: ap.viewmodels.home.ActionViewModel;
            let manageAction: ap.viewmodels.home.ActionViewModel;
            describe("AND user has access to the VISIBILITY_MNGT module", () => {
                beforeEach(() => {
                    //manageAction = new ap.viewmodels.home.ActionViewModel(Utility.EventTool, "projectcontact.manage", Utility.rootUrl + "Images/ html / icons / ic_business_center_black_48px.svg", true, null, "Manage", true);
                    spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake((name) => {
                        if (name === ap.models.licensing.Module.Module_VisibilityManagement)
                            return true;
                        return false;
                    });
                    createVm();
                    refreshAction = ap.viewmodels.home.ActionViewModel.getAction(vm.screenInfo.actions, "projectcontact.refresh");
                    manageAction = ap.viewmodels.home.ActionViewModel.getAction(vm.screenInfo.actions, "projectcontact.manage");
                });
                it("THEN, 'Manage' and 'Refresh' actions are initialized visible and enabled", () => {
                    expect(vm.screenInfo.actions.length).toEqual(2);
                    expect(manageAction).toBeDefined();
                    expect(manageAction.iconSrc).toEqual(Utility.rootUrl + "Images/html/icons/ic_business_center_black_48px.svg");
                    expect(manageAction.isVisible).toBeTruthy();
                    expect(manageAction.isEnabled).toBeTruthy();

                    expect(refreshAction).toBeDefined();
                    expect(refreshAction.iconSrc).toEqual(Utility.rootUrl + "Images/html/icons/ic_refresh_black_48px.svg");
                    expect(refreshAction.isVisible).toBeTruthy();
                    expect(refreshAction.isEnabled).toBeTruthy();
                });
            });
            describe("AND user does not have access to the VISIBILITY_MNGT module", () => {
                beforeEach(() => {
                    //manageAction = new ap.viewmodels.home.ActionViewModel(Utility.EventTool, "projectcontact.manage", Utility.rootUrl + "Images/ html / icons / ic_business_center_black_48px.svg", false, null, "Manage", false);
                    spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake((name) => {
                        return false;
                    });
                    createVm();
                    refreshAction = ap.viewmodels.home.ActionViewModel.getAction(vm.screenInfo.actions, "projectcontact.refresh");
                    manageAction = ap.viewmodels.home.ActionViewModel.getAction(vm.screenInfo.actions, "projectcontact.manage");
                });
                it("THEN, 'Manage' action is invisible and disabled, and 'Refresh' action is visible and enabled", () => {
                    expect(vm.screenInfo.actions.length).toEqual(2);
                    expect(manageAction).toBeDefined();
                    expect(manageAction.iconSrc).toEqual(Utility.rootUrl + "Images/html/icons/ic_business_center_black_48px.svg");
                    expect(manageAction.isVisible).toBeFalsy();
                    expect(manageAction.isEnabled).toBeFalsy();

                    expect(refreshAction).toBeDefined();
                    expect(refreshAction.iconSrc).toEqual(Utility.rootUrl + "Images/html/icons/ic_refresh_black_48px.svg");
                    expect(refreshAction.isVisible).toBeTruthy();
                    expect(refreshAction.isEnabled).toBeTruthy();
                });
            });
            
            it("THEN, the mainSearchInfo is NOT defined", () => {
                expect(vm.screenInfo.mainSearchInfo).toBeNull();
            });
        });
    });

    describe("Feature: refresh", () => {
        let defer: angular.IDeferred<any>;
        beforeEach(() => {
            createVm();
        });

        describe("WHEN we set viewmodel's view to 'Grid'", () => {
            beforeEach(() => {
                defer = $q.defer();
                spyOn(vm, "load").and.returnValue(defer.promise);
                vm.screenInfo.actionClick("projectcontact.refresh");
                specHelper.general.raiseEvent(vm, "requestrefresher", true);
            });
            it("THEN, the requestrefresher event is re-called", () => {
                let listener = evtHelper.implementsListener(["requestrefresher"]);
                let requestRefresher = jasmine.createSpy("requestrefresher");

                listener.on("requestrefresher", requestRefresher, this);

                listener.raise("requestrefresher");
                expect(requestRefresher).toHaveBeenCalled();
            });
        });
    });
});