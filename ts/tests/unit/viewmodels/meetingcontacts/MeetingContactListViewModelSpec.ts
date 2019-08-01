'use strict';

describe("Module ap-viewmodels - MeetingContactList", () => {
    let $scope: angular.IScope,
        Utility: ap.utility.UtilityHelper,
        $rootScope: angular.IRootScopeService,
        MeetingController: ap.controllers.MeetingController,
        MainController: ap.controllers.MainController,
        ControllersManager: ap.controllers.ControllersManager,
        vm: ap.viewmodels.meetingcontacts.MeetingContactListViewModel,
        $q: angular.IQService;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
        angular.mock.module("ap-services");
    });

    beforeEach(inject((_$rootScope_, _Utility_, _MainController_, _MeetingController_, _$q_, _ControllersManager_) => {
        Utility = _Utility_;
        $rootScope = _$rootScope_;
        MeetingController = _MeetingController_;
        MainController = _MainController_;
        ControllersManager = _ControllersManager_
        $scope = $rootScope.$new();
        $q = _$q_;
        specHelper.userContext.stub(Utility);
    }));


    describe("Feature: Constructor", () => {
        describe("WHEN a call Contructor", () => {
            let meeting: ap.models.meetings.Meeting;

            beforeEach(() => {
                let project = new ap.models.projects.Project(Utility);
                project.createByJson({ Id: "Test" });
                meeting = new ap.models.meetings.Meeting(Utility);
                meeting.createByJson({ Id: "123", Project: project });
               
                specHelper.general.spyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get).and.returnValue(meeting);
                vm = new ap.viewmodels.meetingcontacts.MeetingContactListViewModel(Utility, MainController, MeetingController, $scope, ControllersManager);
            });

            afterEach(() => {
                specHelper.general.offSpyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get);
            });

            it("THEN, listVm should be defined and disabled by default", () => {
                expect(vm.listVm).toBeDefined();
                expect(vm.dragOptions.isEnabled).toBeFalsy();
            });

            
        });

    });

    describe("Feature: load", () => {
        let meeting: ap.models.meetings.Meeting;

        beforeEach(() => {
            let project = new ap.models.projects.Project(Utility);
            project.createByJson({ Id: "Test" });

            meeting = new ap.models.meetings.Meeting(Utility);
            meeting.createByJson({ Id: "123", Project: project });

            specHelper.general.spyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get).and.returnValue(meeting);

            vm = new ap.viewmodels.meetingcontacts.MeetingContactListViewModel(Utility, MainController, MeetingController, $scope, ControllersManager);
        });

        afterEach(() => {
            specHelper.general.offSpyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get);
        });

        describe("WHEN we call VM.load", () => {
            let meetingConcern: ap.models.meetings.MeetingConcern;
            let defer: angular.IDeferred<ap.models.meetings.MeetingConcern[]>;
            let meetingContactViewModelItem: ap.viewmodels.meetingcontacts.MeetingContactViewModel;

            beforeEach(() => {
                defer = $q.defer();
                
                
                meetingConcern = new ap.models.meetings.MeetingConcern(Utility);

                meetingConcern.User = new ap.models.actors.User(Utility);

                meetingConcern.User.createByJson({
                    Person: {}
                });

                spyOn(MeetingController, "getMeetingContacts").and.returnValue(defer.promise);
                spyOn(vm.listVm, "onLoadItems");

                vm.load(meeting);

                defer.resolve([meetingConcern]);

                $rootScope.$apply();
            });

            it("THEN, MeetingController.getMeetingContacts with good parameters", () => {
                expect(MeetingController.getMeetingContacts).toHaveBeenCalledWith(meeting);
            });

            it("THEN, vm.listVm.onLoadItems should be called with the viewmodel created from meeting", () => {
                expect(vm.listVm.onLoadItems).toHaveBeenCalled();
                expect((<jasmine.Spy>vm.listVm.onLoadItems).calls.count()).toEqual(1);
                expect((<jasmine.Spy>vm.listVm.onLoadItems).calls.mostRecent().args.length).toEqual(1);
                expect((<ap.viewmodels.meetingcontacts.MeetingContactViewModel>(<jasmine.Spy>vm.listVm.onLoadItems).calls.mostRecent().args[0][0]).originalMeetingContact).toBe(meetingConcern);
            });
            
        });
    });

    describe("Feature: drag and drop", () => {
        let meeting: ap.models.meetings.Meeting;
        beforeEach(() => {
            let project = new ap.models.projects.Project(Utility);
            project.createByJson({ Id: "Test" });
            meeting = new ap.models.meetings.Meeting(Utility);
            meeting.createByJson({ Id: "123", Project: project, IsSystem: false });
            let meetingConcern: ap.models.meetings.MeetingConcern = new ap.models.meetings.MeetingConcern(Utility);
            meetingConcern.User = new ap.models.actors.User(Utility);
            meetingConcern.User.createByJson({ Person: {} });
            let meetingConternDefer: angular.IDeferred<ap.models.meetings.MeetingConcern[]> = $q.defer();
            spyOn(MeetingController, "getMeetingContacts").and.returnValue(meetingConternDefer.promise);
            meetingConternDefer.resolve([meetingConcern]);
            spyOn(MainController, "currentMeeting").and.returnValue(meeting);
            specHelper.general.spyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get).and.returnValue(meeting);
            vm = new ap.viewmodels.meetingcontacts.MeetingContactListViewModel(Utility, MainController, MeetingController, $scope, ControllersManager);
        });
        afterEach(() => {
            specHelper.general.offSpyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get);
        });
        describe("WHEN vm's load method is called", () => {
            describe("AND user's browser is IE", () => {
                beforeEach(() => {
                    spyOn(Utility, "isIE").and.returnValue(true);
                    vm.load(meeting);
                    $rootScope.$apply();
                });
                it("THEN, drag and drop for list is disabled", () => {
                    expect(vm.dragOptions.isEnabled).toBeFalsy();
                });
            });
            describe("AND user's browser is not IE", () => {
                beforeEach(() => {
                    spyOn(Utility, "isIE").and.returnValue(false);
                    vm.load(meeting);
                    $rootScope.$apply();
                });
                it("THEN, drag and drop for list is enabled", () => {
                    expect(vm.dragOptions.isEnabled).toBeTruthy();
                });
            });
        })
    });

    describe("Feature: ScreenInfo", () => {
        let meeting: ap.models.meetings.Meeting;
        beforeEach(() => {
            let project = new ap.models.projects.Project(Utility);
            project.createByJson({ Id: "Test", UserAccessRight: new ap.models.accessRights.ProjectAccessRight(Utility) });
            meeting = new ap.models.meetings.Meeting(Utility);
            meeting.createByJson({ Id: "123", Project: project, UserAccessRight: new ap.models.accessRights.MeetingAccessRight(Utility) });
            specHelper.general.spyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get).and.returnValue(meeting);
            vm = new ap.viewmodels.meetingcontacts.MeetingContactListViewModel(Utility, MainController, MeetingController, $scope, ControllersManager);
        });
        afterEach(() => {
            specHelper.general.offSpyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get);
        });
        describe("WHEN the vm is created", () => {
            it("THEN, the screen info is created", () => {
                expect(vm.screenInfo).toBeDefined();
            });
            it("THEN, the mainSearchInfo is NOT defined", () => {
                expect(vm.screenInfo.mainSearchInfo).toBeNull();
            });
        });
    });
    describe("Feature: Edit action", () => {
        let meeting: ap.models.meetings.Meeting;
        beforeEach(() => {
            let project = new ap.models.projects.Project(Utility);
            project.createByJson({ Id: "Test", UserAccessRight: new ap.models.accessRights.ProjectAccessRight(Utility) });
            meeting = new ap.models.meetings.Meeting(Utility);
            meeting.createByJson({ Id: "123", Project: project, UserAccessRight: new ap.models.accessRights.MeetingAccessRight(Utility) });
            specHelper.general.spyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get).and.returnValue(meeting);
            
        });
        afterEach(() => {
            specHelper.general.offSpyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get);
        });
        describe("WHEN vm is created", () => {
            beforeEach(() => {
                meeting.UserAccessRight.CanEdit = true;
                meeting.Project.UserAccessRight.CanEditAllList = true;
                vm = new ap.viewmodels.meetingcontacts.MeetingContactListViewModel(Utility, MainController, MeetingController, $scope, ControllersManager);
            });
            it("THEN edit action is visible/enable", () => {
                let action = ap.viewmodels.home.ActionViewModel.getAction(vm.screenInfo.actions, "meetingcontacts.edit");
                expect(action.isEnabled).toBeTruthy();
                expect(action.isVisible).toBeTruthy();
            });
        });
        describe("WHEN vm is created and meeting.UserAccessRight.CanEdit is false", () => {
            beforeEach(() => {
                meeting.UserAccessRight.CanEdit = false;
                vm = new ap.viewmodels.meetingcontacts.MeetingContactListViewModel(Utility, MainController, MeetingController, $scope, ControllersManager);
            });
            it("THEN edit action should be invisible/disable", () => {
                let action = ap.viewmodels.home.ActionViewModel.getAction(vm.screenInfo.actions, "meetingcontacts.edit");
                expect(action.isEnabled).toBeFalsy();
                expect(action.isVisible).toBeFalsy();
            });
        });
        describe("WHEN vm is created and meeting.Project.UserAccessRight.CanEditAllList is false", () => {
            beforeEach(() => {
                meeting.Project.UserAccessRight.CanEditAllList = false;
                vm = new ap.viewmodels.meetingcontacts.MeetingContactListViewModel(Utility, MainController, MeetingController, $scope, ControllersManager);
            });
            it("THEN edit action should be invisible/disable", () => {
                let action = ap.viewmodels.home.ActionViewModel.getAction(vm.screenInfo.actions, "meetingcontacts.edit");
                expect(action.isEnabled).toBeFalsy();
                expect(action.isVisible).toBeFalsy();
            });
        });
    });
}); 