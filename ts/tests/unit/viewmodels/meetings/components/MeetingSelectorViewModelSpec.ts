describe("Module ap-viewmodels - meeting's components - MeetingSelector", () => {
    let currentProject: ap.models.projects.Project;
    let vm: ap.viewmodels.meetings.MeetingSelectorViewModel;
    let Utility: ap.utility.UtilityHelper, MainController: ap.controllers.MainController, Api: ap.services.apiHelper.Api;
    let ControllersManager: ap.controllers.ControllersManager;
    let AccessRightController: ap.controllers.AccessRightController;
    let $q: angular.IQService, $timeout: angular.ITimeoutService, $rootScope: angular.IRootScopeService;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-services");
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject(function (_$rootScope_, _$q_, _$timeout_, _$compile_, _Utility_, _Api_, _ControllersManager_, _MainController_, _AccessRightController_) {
        Utility = _Utility_;
        ControllersManager = _ControllersManager_;
        MainController = _MainController_;
        AccessRightController = _AccessRightController_;
        $q = _$q_;
        Api = _Api_;
        $timeout = _$timeout_;
        $rootScope = _$rootScope_;

        specHelper.utility.stubRootUrl(Utility);
        specHelper.userContext.stub(Utility);
        specHelper.utility.stubStorageSet(Utility);

        currentProject = new ap.models.projects.Project(Utility);
        let jsonProj = {
            Id: "P1" ,
            Name: "My project"
        };
        modelSpecHelper.fillEntityJson(jsonProj);
        currentProject.createByJson(jsonProj);
        spyOn(MainController, "currentProject").and.callFake((val) => {
            if (!val)
                return currentProject;
        });;
    }));
    describe("Factory MeetingSelectorViewModel", () => {
        var meetingAccessRights;
        var defAccessRight;
        beforeEach(() => {
            meetingAccessRights = [{ Id: "M1", ModuleName: "Meeting", Level: ap.models.accessRights.AccessRightLevel.Admin, CanAddPoint: true }
                , { Id: "M2", ModuleName: "Meeting", Level: ap.models.accessRights.AccessRightLevel.Manager, CanAddPoint: true }
                , { Id: "M3", ModuleName: "Meeting", Level: ap.models.accessRights.AccessRightLevel.Contributor }
                , { Id: "M4", ModuleName: "Meeting", Level: ap.models.accessRights.AccessRightLevel.Guest }
                , { Id: "M5", ModuleName: "Meeting", Level: ap.models.accessRights.AccessRightLevel.Subcontractor }
            ];
        });
        describe("Feature: constructor", () => {
            describe("WHEN i request to create the VM", () => {
                it("THEN, the vm will be created", () => {
                    vm = new ap.viewmodels.meetings.MeetingSelectorViewModel(Utility, $q, ControllersManager, $timeout, false);
                    expect(vm).toBeDefined();
                });
                it("AND, the listVM will be init with correct values", () => {
                    vm = new ap.viewmodels.meetings.MeetingSelectorViewModel(Utility, $q, ControllersManager, $timeout, false);
                    expect(vm.listVm.options.entityName).toBe("Meeting");
                    expect(vm.listVm.options.itemConstructor).toEqual(ap.viewmodels.meetings.MeetingItemViewModel);
                    expect(vm.listVm.options.pathToLoad).toEqual("Title,Code,Date");
                    expect(vm.listVm.options.sortOrder).toEqual("issystemdesc,issystemispublictitle");
                    expect(vm.listVm.options.onlyPathToLoadData).toBeTruthy();
                    expect(vm.selectedItem).toBeNull();
                    expect(vm.selectedMeetingId).toBeNull();
                });
            });
        });

        describe("Feature: selectedItem", () => {
            let meetingItemVM1: ap.viewmodels.meetings.MeetingItemViewModel;
            let meetingItemVM2: ap.viewmodels.meetings.MeetingItemViewModel;
            beforeEach(() => {
                let meeting1 = new ap.models.meetings.Meeting(Utility);
                meeting1.createByJson({ Id: "M1" });
                let meeting2 = new ap.models.meetings.Meeting(Utility);
                meeting2.createByJson({ Id: "M2" });

                meetingItemVM1 = new ap.viewmodels.meetings.MeetingItemViewModel(Utility, $q);
                meetingItemVM1.init(meeting1);

                meetingItemVM2 = new ap.viewmodels.meetings.MeetingItemViewModel(Utility, $q);
                meetingItemVM2.init(meeting2);

                vm = new ap.viewmodels.meetings.MeetingSelectorViewModel(Utility, $q, ControllersManager, $timeout, false);
                vm.selectedItem = meetingItemVM1;
                $rootScope.$apply();
            });
            describe("WHEN selectedItem is set with the vm is difference with the current", () => {
                it("THEN, the selectedItem will be update with the new one", () => {
                    vm.selectedItem = meetingItemVM2;
                    expect(vm.selectedItem).toEqual(meetingItemVM2);
                });
                it("AND, the 'selectedItemChanged' event is fired", () => {
                    let callbackEvent = jasmine.createSpy("callbackEvent");
                    vm.on("selectedItemChanged", function (param) {
                        callbackEvent(param);
                    }, this);
                    vm.selectedItem = meetingItemVM2;
                    $rootScope.$apply();
                    expect(callbackEvent).toHaveBeenCalled();
                });
            });
            describe("WHEN selectedItem is set with the current one ", () => {
                it("THEN, the 'selectedItemChanged' event is not fired", () => {
                    let callbackEvent = jasmine.createSpy("callbackEvent");
                    vm.on("selectedItemChanged", function (param) {
                        callbackEvent(param);
                    }, this);
                    vm.selectedItem = meetingItemVM1;
                    $rootScope.$apply();
                    expect(callbackEvent).not.toHaveBeenCalled();
                });
            });
        });

        describe("Feature: load", () => {
            let deferIds, deferData, apiIds: any[];
            let customFilter: string;

            beforeEach(() => {

                defAccessRight = $q.defer();
                spyOn(AccessRightController, "geAccessRights").and.returnValue(defAccessRight.promise);
                defAccessRight.resolve(meetingAccessRights);

                vm = new ap.viewmodels.meetings.MeetingSelectorViewModel(Utility, $q, ControllersManager, $timeout);
                $rootScope.$apply();

                deferIds = $q.defer();
                deferData = $q.defer();
                
                apiIds = ["455620", "445541", "445125"];
                spyOn(vm.listVm, "loadIds").and.callThrough();
                spyOn(Api, "getEntityIds").and.returnValue(deferIds.promise);
                spyOn(vm.listVm, "loadPage").and.callThrough();
                spyOn(Api, "getEntityList").and.returnValue(deferData.promise);
                spyOn($timeout, "cancel").and.callThrough();

                customFilter = Filter.and(Filter.eq("Project.Id", currentProject.Id), Filter.isFalse("IsArchived"));
                let userResponsibleFilter: string = "";

                let canAddPointLevel: string[] = ["Admin", "Manager"];

                let filterMeetingConcern: string = Filter.and(Filter.in("AccessRightLevel", canAddPointLevel), Filter.eq("User.Id", Utility.UserContext.CurrentUser().Id));
                filterMeetingConcern = Filter.and(filterMeetingConcern, Filter.isFalse("IsDisabled"));
                let filterMeeting: string = Filter.exists("MeetingConcerns", filterMeetingConcern);

                let publicFilter: string = Filter.isTrue("IsPublic");
                publicFilter = Filter.and(publicFilter, Filter.not(Filter.exists("MeetingConcerns", Filter.and(Filter.eq("User.Id", Utility.UserContext.CurrentUser().Id), Filter.isFalse("IsDisabled")))));

                publicFilter = Filter.and(publicFilter, Filter.exists("Project.Contacts", Filter.and(Filter.in("AccessRightLevel", canAddPointLevel), Filter.eq("User.Id", Utility.UserContext.CurrentUser().Id))));

                userResponsibleFilter = Filter.or(filterMeeting, publicFilter);

                customFilter = Filter.and(customFilter, userResponsibleFilter);
            });
            describe("WHEN load is called and there is no searchedText defined ", () => {
                it("THEN loadIds of the listVm is called with the filter on the current project and the userResponsible filter", () => {
                    vm.load();
                    $rootScope.$apply();
                    expect(vm.listVm.loadIds).toHaveBeenCalledWith(customFilter, undefined);
                });

            });
            describe("WHEN load is called and searchedText is defined", () => {
                beforeEach(() => {
                    vm.searchedText = "EL";
                });

                it("THEN, load is called with the filter inclued search text", () => {
                    let filter = Filter.contains("Title", "\"" + vm.searchedText + "\"");
                    filter = Filter.and(filter, customFilter);
                    vm.load();
                    $rootScope.$apply();
                    expect(vm.listVm.loadIds).toHaveBeenCalledWith(filter, undefined);
                });
            });

            describe("WHEN a page is loaded", () => {
                it("THEN, sourceItems contains Meeting corresponding to the loaded data", () => {
                    let apiData = [
                        {
                            Id: apiIds[0],
                            Code: "Code 0",
                            Title: "T0"
                        },
                        {
                            Id: apiIds[1],
                            Code: "Code 1",
                            Title: "T1"
                        },
                        {
                            Id: apiIds[2],
                            Code: "Code 2",
                            Title: "T2"
                        }
                    ];

                    vm.load();

                    deferIds.resolve(new ap.services.apiHelper.ApiResponse(apiIds));
                    $rootScope.$apply();

                    deferData.resolve(new ap.services.apiHelper.ApiResponse(apiData));
                    $rootScope.$apply();

                    expect(vm.listVm.sourceItems.length).toBe(3);
                    for (let i = 0; i < apiData.length; i++) {
                        expect(vm.listVm.sourceItems[i] instanceof ap.viewmodels.meetings.MeetingItemViewModel).toBeTruthy();
                        expect(vm.listVm.sourceItems[i].originalEntity).toBe(<ap.models.meetings.Meeting>apiData[i]);
                    }
                });
            });

            describe("WHEN load is called and the VM init with defaultMeetingToLoad", () => {
                let alwaysIdFilter: string;
                let vm2: ap.viewmodels.meetings.MeetingSelectorViewModel;
                beforeEach(() => {
                    alwaysIdFilter = Filter.eq("Id", "123");
                    vm2 = new ap.viewmodels.meetings.MeetingSelectorViewModel(Utility, $q, ControllersManager, $timeout, true, "123");
                    $rootScope.$apply();                

                    spyOn(vm2.listVm, "loadIds").and.callThrough();                    
                    spyOn(vm2.listVm, "loadPage").and.callThrough();

                    vm2.load();
                    $rootScope.$apply();                    
                });

                it("THEN loadIds of the listVm is called with the filter on the current project and the userResponsible filter nad also with filer on Id", () => {                    
                    expect(vm2.listVm.loadIds).toHaveBeenCalledWith(Filter.or(customFilter, alwaysIdFilter), undefined);
                });
            });
        });
    });
});  