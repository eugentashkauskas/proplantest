describe("Module ap-viewmodels - MeetingListWorkSpaceViewModel", () => {
    let $rootScope: angular.IRootScopeService, $scope: angular.IScope;
    let Utility: ap.utility.UtilityHelper, UserContext: ap.utility.UserContext;
    let $q: angular.IQService;
    let $timeout: angular.ITimeoutService;
    let Api: ap.services.apiHelper.Api;
    let ServicesManager: ap.services.ServicesManager;
    let ControllersManager: ap.controllers.ControllersManager;
    let MainController: ap.controllers.MainController;
    let MeetingController: ap.controllers.MeetingController;
    let $controller: ng.IControllerService;
    let _deferredGetProject: angular.IDeferred<ap.services.apiHelper.ApiResponse>;
    let _deferredGetData: angular.IDeferred<ap.services.apiHelper.ApiResponse>;
    let defApi: angular.IDeferred<ap.services.apiHelper.ApiResponse>;
    let UIStateController: ap.controllers.UIStateController;
    let $mdDialog: angular.material.IDialogService;
    let $mdSidenav: angular.material.ISidenavService;
    let vm: ap.viewmodels.meetings.MeetingListWorkSpaceViewModel;
    let meeting: ap.models.meetings.Meeting;
    beforeEach(() => {
        angular.mock.module("ngMaterial");
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
        angular.mock.module(function ($provide) {
            $provide.factory('$mdDialog', ["$q", function ($q) {
                return specHelper.utility.stubShowMdDialog($q);
            }]);
        });
    });
    beforeEach(inject(function (_$rootScope_, _$controller_, _UserContext_, _Utility_, _$q_, _Api_, _$timeout_, _ServicesManager_, _ControllersManager_, _MainController_, _MeetingController_, _UIStateController_, _$mdDialog_) {
        Utility = _Utility_;
        UserContext = _UserContext_;
        $rootScope = _$rootScope_;
        $controller = _$controller_;
        ServicesManager = _ServicesManager_;
        ControllersManager = _ControllersManager_;
        MainController = _MainController_;
        MeetingController = _MeetingController_;
        $mdDialog = _$mdDialog_;
        Api = _Api_;
        $q = _$q_;
        $timeout = _$timeout_;
        $scope = $rootScope.$new();
        specHelper.utility.stubRootUrl(Utility);
        specHelper.userContext.stub(Utility);
        specHelper.utility.stubStorageSet(Utility);
        specHelper.mainController.stub(MainController, Utility);
        _deferredGetProject = $q.defer();
        _deferredGetData = $q.defer();
        UIStateController = _UIStateController_;
        defApi = $q.defer();

        vm = null;

        spyOn(Api, "getApiResponse").and.callFake(function (url, method) {
            if (url.indexOf("rest/meetingsids") === 0 && method === ap.services.apiHelper.MethodType.Get)
                return defApi.promise;
            return null;
        });

        spyOn(Api, "getEntityById").and.returnValue(_deferredGetProject.promise);
        _deferredGetProject.resolve(new ap.services.apiHelper.ApiResponse(MainController.currentProject()));
        spyOn(MainController, "closeMultiActionsMode");
        spyOn(MainController, "clearScreen");
        spyOn(ap.viewmodels.projects.ProjectItemViewModel.prototype, "init").and.callThrough();
    }));
    
    describe("Feature: Default values", () => {
        let predefinedFilters: ap.misc.PredefinedFilter[];
        let collectionInfo: ap.misc.CollectionInfo;
        beforeEach(() => {
            collectionInfo = new ap.misc.CollectionInfo(Filter.isTrue("IsOwner"), new ap.misc.PropertyInfo("User.DisplayName"));

            predefinedFilters = [
                new ap.misc.PredefinedFilter("Active", "Opened lists", true, "Filter.IsFalse(IsArchived)", null, ["Archived"]),
                new ap.misc.PredefinedFilter("Archived", "Archived lists", true, "Filter.IsTrue(IsArchived)", null, ["Active"])
            ];

            specHelper.general.spyProperty(ap.controllers.UIStateController.prototype, "mainFlowState", specHelper.PropertyAccessor.Get).and.returnValue(ap.controllers.MainFlow.Meetings);
        });
        afterEach(() => {
            specHelper.general.offSpyProperty(ap.controllers.UIStateController.prototype, "mainFlowState", specHelper.PropertyAccessor.Get);
        });
        it("can init the viewmodel", () => {
            vm = <ap.viewmodels.meetings.MeetingListWorkSpaceViewModel>$controller("meetingListWorkSpaceViewModel", { $scope: $scope });            
            expect(vm).toBeDefined();
        });

        it("the listvm is correct init", () => {
            vm = <ap.viewmodels.meetings.MeetingListWorkSpaceViewModel>$controller("meetingListWorkSpaceViewModel", { $scope: $scope });
            $rootScope.$apply();
            spyOn(MainController, "setCurrentMeeting");
            specHelper.general.raiseEvent(UIStateController, "mainflowstatechanged", new ap.controllers.MainFlowStateEvent(ap.controllers.MainFlow.Projects, ap.controllers.MainFlow.Meetings));
            expect(vm.listVm.pathToLoad).toEqual("EntityVersion,Title,Code,Date,IsPublic,IsSystem,IsArchived,MeetingAuthor,UserAccessRight,Occurrence,NumberingType");
            expect(vm.listVm.sortOrder).toEqual("titleasc");
            expect(vm.listVm.options.pageSize).toBe(50);
            expect(vm.listVm.options.displayLoading).toBeFalsy();
            expect(vm.listVm.options.onlyPathToLoadData).toBeTruthy();
        });
        it("the listvm.itemParameterBuilder is created", () => {
            vm = <ap.viewmodels.meetings.MeetingListWorkSpaceViewModel>$controller("meetingListWorkSpaceViewModel", { $scope: $scope });            
            expect(vm.listVm.options.itemParameterBuilder).toBeDefined();
        });
        it("the listvm.itemParameterBuilder creat MeetingItemParameter", () => {
            vm = <ap.viewmodels.meetings.MeetingListWorkSpaceViewModel>$controller("meetingListWorkSpaceViewModel", { $scope: $scope });            
            let item = vm.listVm.options.itemParameterBuilder.createItemParameter(0, null, null, null, Utility);
            expect(item instanceof ap.viewmodels.meetings.MeetingItemParameter).toBeTruthy();
        });
        it("the screenInfo.mainSearchInfo have to be init with correct params", () => {
            vm = <ap.viewmodels.meetings.MeetingListWorkSpaceViewModel>$controller("meetingListWorkSpaceViewModel", { $scope: $scope });
            expect(vm.screenInfo.mainSearchInfo.propertiesFilters).toEqual(
                [new ap.misc.AdvancedFilter(new ap.misc.PropertyInfo("All", "All", true), null),
                    new ap.misc.AdvancedFilter(new ap.misc.PropertyInfo("Code"), null),
                    new ap.misc.AdvancedFilter(new ap.misc.PropertyInfo("Title", "Name"), null),
                    new ap.misc.AdvancedFilter(new ap.misc.PropertyInfo("Date", "Date", false, ap.misc.PropertyType.Date, "Date"), null),
                    new ap.misc.AdvancedFilter(new ap.misc.PropertyInfo("MeetingConcerns", "Author", false, ap.misc.PropertyType.Collection, "Author", collectionInfo), null)
                ]);
        });


        it("the Api.getEntityById wil call to get the current project", () => {
            let option: ap.services.apiHelper.ApiOption = new ap.services.apiHelper.ApiOption();
            option.onlyPathToLoadData = true;
            option.isShowBusy = false;
            option.async = true;
            vm = <ap.viewmodels.meetings.MeetingListWorkSpaceViewModel>$controller("meetingListWorkSpaceViewModel", { $scope: $scope });
            specHelper.general.raiseEvent(UIStateController, "mainflowstatechanged", new ap.controllers.MainFlowStateEvent(ap.controllers.MainFlow.Projects, ap.controllers.MainFlow.Meetings));
            $rootScope.$apply();

            expect(Api.getEntityById).toHaveBeenCalledWith("Project", "35a2c5d6-0e00-43e9-ada8-ce4d3fafb16e", "Code,Name,LogoUrl,Cover.Status,Creator,NotesNumber,DocumentsNumber,ParticipantsNumber,StartDate", option);
            expect(ap.viewmodels.projects.ProjectItemViewModel.prototype.init).toHaveBeenCalledWith(MainController.currentProject());
        });
    });

    describe("Feature: addAction", () => {
        
        describe("WHEN vm is created and current project has access canAddMeeting", () => {
            beforeEach(() => {
                MainController.currentProject().UserAccessRight.CanAddMeeting = true;
                vm = <ap.viewmodels.meetings.MeetingListWorkSpaceViewModel>$controller("meetingListWorkSpaceViewModel", { $scope: $scope });
            });
            it("THEN addAction is defined and isEnabled/isVisible should be true", () => {
                expect(vm.screenInfo.addAction).toBeDefined();
                expect(vm.screenInfo.addAction.name).toBe("meeting.add");
                expect(vm.screenInfo.addAction.isEnabled).toBeTruthy();
                expect(vm.screenInfo.addAction.isVisible).toBeTruthy();
            });
        });
        describe("WHEN vm is created and current project hasn't access canAddMeeting", () => {
            beforeEach(() => {
                MainController.currentProject().UserAccessRight.CanAddMeeting = false;
                vm = <ap.viewmodels.meetings.MeetingListWorkSpaceViewModel>$controller("meetingListWorkSpaceViewModel", { $scope: $scope });
            });
            it("THEN addAction is defined and isEnabled/isVisible should be false", () => {
                expect(vm.screenInfo.addAction).toBeDefined();
                expect(vm.screenInfo.addAction.name).toBe("meeting.add");
                expect(vm.screenInfo.addAction.isEnabled).toBeFalsy();
                expect(vm.screenInfo.addAction.isVisible).toBeFalsy();
            });
        });
    });
    describe("Feature: MainSearch.criterionschanged", () => {

        beforeEach(() => {
            vm = <ap.viewmodels.meetings.MeetingListWorkSpaceViewModel>$controller("meetingListWorkSpaceViewModel", { $scope: $scope });
            spyOn(vm, "load").and.returnValue(_deferredGetData.promise);
        });

        describe("WHEN MainController.filterchanged event was fired and the mainFlowState is meetings", () => {

            beforeEach(() => {
                specHelper.general.spyProperty(ap.controllers.UIStateController.prototype, "mainFlowState", specHelper.PropertyAccessor.Get).and.returnValue(ap.controllers.MainFlow.Meetings);
            });

            afterEach(() => {
                specHelper.general.offSpyProperty(ap.controllers.UIStateController.prototype, "mainFlowState", specHelper.PropertyAccessor.Get);
            });

            it("THEN, the load method will be called", () => {

                specHelper.general.raiseEvent(vm.screenInfo.mainSearchInfo, "criterionschanged", null);

                expect(vm.load).toHaveBeenCalled();
            });
        });

        describe("WHEN MainController.filterchanged event was fired and the mainFlowState is NOT meetings", () => {
            it("THEN, the load method won't be called", () => {
                specHelper.general.raiseEvent(vm.screenInfo.mainSearchInfo, "criterionschanged", null);

                expect(vm.load).not.toHaveBeenCalled();
            });
        });
    });
    describe("Feature: load() method", () => {
        describe("WHEN the load method was called", () => {
            let filterString: string, filter: string;
            beforeEach(() => {
                filterString = null;
                specHelper.general.spyProperty(ap.misc.MainSearchInfo.prototype, "filterString", specHelper.PropertyAccessor.Get).and.callFake(() => {
                    return filterString;
                });
                filter = Filter.eq("Project.Id", "35a2c5d6-0e00-43e9-ada8-ce4d3fafb16e");
                vm = <ap.viewmodels.meetings.MeetingListWorkSpaceViewModel>$controller("meetingListWorkSpaceViewModel", { $scope: $scope });
                spyOn(vm.listVm, "loadIds").and.returnValue(_deferredGetData.promise);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.misc.MainSearchInfo.prototype, "filterString", specHelper.PropertyAccessor.Get);
            });
            it("THEN the filter will be the base filter when the mainsearch is null", () => {
                vm.load();
                $rootScope.$apply();
                expect(vm.listVm.loadIds).toHaveBeenCalledWith(filter, undefined);
            });
            it("THEN the filter will be the base filter included the filter string of the mainsearch ", () => {
                filterString = Filter.eq("Code", "aaa");

                filter = Filter.eq("Project.Id", "35a2c5d6-0e00-43e9-ada8-ce4d3fafb16e");
                filter = Filter.and(filter, Filter.eq("Code", "aaa"));

                vm.load();
                $rootScope.$apply();
                expect(vm.listVm.loadIds).toHaveBeenCalledWith(filter, undefined);
            });
        });
    });

    describe("Feature: openMeeting() method", () => {
        let meeting: ap.models.meetings.Meeting;
        beforeEach(() => {
            meeting = new ap.models.meetings.Meeting(Utility);
            vm = <ap.viewmodels.meetings.MeetingListWorkSpaceViewModel>$controller("meetingListWorkSpaceViewModel", { $scope: $scope });
        });
        describe("When the openMeeting method is called with an id value", () => {
            beforeEach(() => {
                spyOn(MainController, "setCurrentMeeting");
                vm.screenInfo.isInfoOpened = false;
                vm.openMeeting(meeting.Id, true);
            });
            it("THEN setCurrentMeeting is called with the id of the meeting ", () => {
                expect(MainController.setCurrentMeeting).toHaveBeenCalledWith(meeting.Id);
            });
        });
    });
    describe("Feature: openEntireProject() method", () => {
        beforeEach(() => {
            vm = <ap.viewmodels.meetings.MeetingListWorkSpaceViewModel>$controller("meetingListWorkSpaceViewModel", { $scope: $scope });
        });
        describe("When the openEntireProject method is called", () => {
            beforeEach(() => {
                spyOn(MainController, "setCurrentMeeting");
                vm.openEntireProject();
            });
            it("THEN setCurrentMeeting is called with a null parameter", () => {
                expect(MainController.setCurrentMeeting).toHaveBeenCalledWith(null);
            });
        });
    });


    describe("Feature: MainActions", () => {
        let defIds: angular.IDeferred<any>;

        beforeEach(() => {
            defIds = $q.defer();
            
            vm = <ap.viewmodels.meetings.MeetingListWorkSpaceViewModel>$controller("meetingListWorkSpaceViewModel", { $scope: $scope });

            spyOn(vm, "load").and.callThrough(); // to check is the custom param is well created afterwards
            spyOn(vm.listVm, "loadIds").and.returnValue(defIds.promise);
            spyOn(vm.listVm, "changeSortOrder").and.callThrough();
        });

        describe("WHEN the ViewModel is created", () => {
            it("THEN, the main action's name is 'refreshlists'", () => {
                expect(MainController.currentVisibleScreens[0].screen.actions[0].name).toBe("refreshlists");
            });
        });
    });

    describe("Feature: refresh", () => {

        beforeEach(() => {
            vm = <ap.viewmodels.meetings.MeetingListWorkSpaceViewModel>$controller("meetingListWorkSpaceViewModel", { $scope: $scope });

            spyOn(vm, "load").and.returnValue(defApi.promise);

            vm.screenInfo.actionClick("refreshlists");
        });

        describe("WHEN the refresh action is raised from the ViewModel", () => {
            it("THEN, the project banner data is refreshed", () => {
                let option: ap.services.apiHelper.ApiOption = new ap.services.apiHelper.ApiOption();
                option.onlyPathToLoadData = true;
                option.async = true;
                option.isShowBusy = false;
                expect(Api.getEntityById).toHaveBeenCalledWith("Project", "35a2c5d6-0e00-43e9-ada8-ce4d3fafb16e", "Code,Name,LogoUrl,Cover.Status,Creator,NotesNumber,DocumentsNumber,ParticipantsNumber,StartDate", option);
                $rootScope.$apply();
                expect(ap.viewmodels.projects.ProjectItemViewModel.prototype.init).toHaveBeenCalledWith(MainController.currentProject());
            });
            it("THEN, the load method is called", () => {
                $rootScope.$apply();
                expect(vm.load).toHaveBeenCalled();
            });
        });
    });

    describe("Feature: save selected sort order and reload it", () => {
        describe("WHEN the sort order is selected", () => {
            beforeEach(() => {
                vm = <ap.viewmodels.meetings.MeetingListWorkSpaceViewModel>$controller("meetingListWorkSpaceViewModel", { $scope: $scope });
                spyOn(vm.sortState, "saveToStorage");
                specHelper.general.raiseEvent(vm.sortState, "sortingChanged", vm.sortState);
            });
            it("THEN, it is saved in the session", () => {
                expect(vm.sortState.saveToStorage).toHaveBeenCalled(); 
            });
        });

        describe("WHEN MeetingList workspace is created", () => {
            beforeEach(() => {
                spyOn(Utility.Storage.Session, "get").and.returnValue({
                    columns: {
                        Code: ap.component.dataTable.SortType.None,
                        Title: ap.component.dataTable.SortType.None,
                        CreationDate: ap.component.dataTable.SortType.Asc
                    },
                    order: ["CreationDate"]
                });
                spyOn(MainController, "setCurrentMeeting");
                vm = <ap.viewmodels.meetings.MeetingListWorkSpaceViewModel>$controller("meetingListWorkSpaceViewModel", { $scope: $scope });
                specHelper.general.spyProperty(ap.controllers.UIStateController.prototype, "mainFlowState", specHelper.PropertyAccessor.Get).and.returnValue(ap.controllers.MainFlow.Meetings);
                specHelper.general.raiseEvent(UIStateController, "mainflowstatechanged", new ap.controllers.MainFlowStateEvent(ap.controllers.MainFlow.Projects, ap.controllers.MainFlow.Meetings));
                $rootScope.$apply();
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.controllers.UIStateController.prototype, "mainFlowState", specHelper.PropertyAccessor.Get);
            });
            it("THEN, the sort order is read from the session", () => {
                expect(Utility.Storage.Session.get).toHaveBeenCalled(); 
            });
            it("AND it is applied to the list", () => {
                expect(vm.listVm.sortOrder).toBe("creationdateasc"); 
            });
        });
    });

    describe("Feature: calculateAddSubActionAccess", () => {
        describe("WHEN method calculateAddSubActionAccess is called with CanAddMeeting as true and hasAccess return false", () => {
            beforeEach(() => {
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.returnValue(false);
                MainController.currentProject().UserAccessRight.CanAddMeeting = true;
                vm = new ap.viewmodels.meetings.MeetingListWorkSpaceViewModel($scope, Utility, Api, $q, ControllersManager, ServicesManager,
                    $mdDialog, $timeout, $mdSidenav, null, null, null);
            });
            it("THEN state isVisible and isEnabled wil be true ", () => {
                expect(vm.screenInfo.addAction.getSubAction("meeting.importAccess").isVisible).toBeFalsy();
                expect(vm.screenInfo.addAction.getSubAction("meeting.importAccess").isEnabled).toBeFalsy();
            });
        });
        describe("WHEN method calculateAddSubActionAccess is called with CanAddMeeting as false and hasAccess return false", () => {
            beforeEach(() => {
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.returnValue(false);
                MainController.currentProject().UserAccessRight.CanAddMeeting = false;
                vm = new ap.viewmodels.meetings.MeetingListWorkSpaceViewModel($scope, Utility, Api, $q, ControllersManager, ServicesManager,
                    $mdDialog, $timeout, $mdSidenav, null, null, null);
            });
            it("THEN state isVisible and isEnabled wil be true ", () => {
                expect(vm.screenInfo.addAction.getSubAction("meeting.importAccess").isVisible).toBeFalsy();
                expect(vm.screenInfo.addAction.getSubAction("meeting.importAccess").isEnabled).toBeFalsy();
            });
        });
        describe("WHEN method calculateAddSubActionAccess is called with hasAccess true CanAddMeeting as false", () => {
            beforeEach(() => {
                MainController.currentProject().UserAccessRight.CanAddMeeting = false;
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.returnValue(true);
                vm = new ap.viewmodels.meetings.MeetingListWorkSpaceViewModel($scope, Utility, Api, $q, ControllersManager, ServicesManager,
                    $mdDialog, $timeout, $mdSidenav, null, null, null);
            });
            it("THEN state isVisible and isEnabled wil be true ", () => {
                expect(vm.screenInfo.addAction.getSubAction("meeting.importAccess").isVisible).toBeFalsy();
                expect(vm.screenInfo.addAction.getSubAction("meeting.importAccess").isEnabled).toBeFalsy();
            });
        });
        describe("WHEN method calculateAddSubActionAccess is called with hasAccess true CanAddMeeting as true", () => {
            beforeEach(() => {
                MainController.currentProject().UserAccessRight.CanAddMeeting = true;
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.returnValue(true);
                vm = new ap.viewmodels.meetings.MeetingListWorkSpaceViewModel($scope, Utility, Api, $q, ControllersManager, ServicesManager,
                    $mdDialog, $timeout, $mdSidenav, null, null, null);
            });
            it("THEN state isVisible and isEnabled wil be true ", () => {
                expect(vm.screenInfo.addAction.getSubAction("meeting.importAccess").isVisible).toBeTruthy();
                expect(vm.screenInfo.addAction.getSubAction("meeting.importAccess").isEnabled).toBeTruthy();
            });
        });
    });
}); 