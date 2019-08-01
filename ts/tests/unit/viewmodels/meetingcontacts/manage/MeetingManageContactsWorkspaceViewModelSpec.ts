describe("Module ap-viewmodels - MeetingManageContactWorkspaceViewModel", () => {
    let Utility: ap.utility.UtilityHelper;
    let controllersManager: ap.controllers.ControllersManager;
    let vm: ap.viewmodels.meetingcontacts.MeetingManageContactsWorkspaceViewModel;
    let $rootScope: angular.IRootScopeService;
    let $scope: angular.IScope, $q: angular.IQService, Api: ap.services.apiHelper.Api;
    let ServicesManager: ap.services.ServicesManager;
    let testAccessRightsDefer: angular.IDeferred<ap.models.accessRights.AccessRight[]>;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject(function (_Utility_, _ControllersManager_, _$rootScope_, _Api_, _$q_, _ServicesManager_) {
        Utility = _Utility_;
        controllersManager = _ControllersManager_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        Api = _Api_;
        $q = _$q_;
        ServicesManager = _ServicesManager_;
        specHelper.userContext.stub(Utility);

        spyOn(controllersManager.mainController, "currentProject").and.returnValue({
            Id: "1",
            UserAccessRight: {
                Level: ap.models.accessRights.AccessRightLevel.Guest
            },
            Creator: {
                Id: "111"
            }
        });
    }));

    describe("Feature - constructor", () => {

        beforeEach(() => {
            let def = $q.defer();
            let meeting: ap.models.meetings.Meeting = new ap.models.meetings.Meeting(Utility);
            meeting.createByJson({
                Id: "meeting_id",
                UserAccessRight: {
                    CanEdit: true
                }
            });
            testAccessRightsDefer = $q.defer();
            spyOn(controllersManager.accessRightController, "geAccessRights").and.returnValue(testAccessRightsDefer.promise);
            specHelper.general.spyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get).and.returnValue(meeting);
        });

        afterEach(() => {
            specHelper.general.offSpyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get);
        });

        describe("WHEN workspace viewmodel is created", () => {
            beforeEach(() => {

                vm = new ap.viewmodels.meetingcontacts.MeetingManageContactsWorkspaceViewModel($scope, Utility, Api, $q, controllersManager, ServicesManager);
            });

            it("THEN, screen info is initialized with the required parameters", () => {
                expect(vm.screenInfo).toBeDefined();
                expect(vm.screenInfo.name).toEqual("meetingmanage");
                expect(vm.screenInfo.sType).toEqual(ap.misc.ScreenInfoType.Detail);
                expect(vm.screenInfo.isFullScreen).toBeTruthy();
            });
        });
        describe("When initView is called", () => {
            let meetingContactVm: ap.viewmodels.meetingcontacts.MeetingContactViewModel;
            let meetingContactVm2: ap.viewmodels.meetingcontacts.MeetingContactViewModel;
            let testAccessRights: ap.models.accessRights.AccessRight;
            beforeEach(() => {
                let meetingConcern: ap.models.meetings.MeetingConcern = new ap.models.meetings.MeetingConcern(Utility);
                meetingConcern.AccessRightLevel = ap.models.accessRights.AccessRightLevel.Guest;
                meetingConcern.User = new ap.models.actors.User(Utility);
                meetingConcern.User.createByJson({
                    Person: {
                        Email: "test@email.com"
                    }
                });
                meetingConcern.Meeting = new ap.models.meetings.Meeting(Utility);
                meetingConcern.Meeting.createByJson({
                    Id: "test-meeting-id"
                });
                meetingContactVm = new ap.viewmodels.meetingcontacts.MeetingContactViewModel(Utility, controllersManager);
                meetingContactVm.init(meetingConcern);

                let meetingConcern2: ap.models.meetings.MeetingConcern = new ap.models.meetings.MeetingConcern(Utility);
                meetingConcern2.AccessRightLevel = ap.models.accessRights.AccessRightLevel.Guest;
                meetingConcern2.User = new ap.models.actors.User(Utility);
                meetingConcern2.User.createByJson({
                    Person: {
                        Email: "test2@email.com"
                    }
                });
                meetingConcern2.Meeting = new ap.models.meetings.Meeting(Utility);
                meetingConcern2.Meeting.createByJson({
                    Id: "test-meeting-id"
                });
                meetingContactVm2 = new ap.viewmodels.meetingcontacts.MeetingContactViewModel(Utility, controllersManager);
                meetingContactVm2.init(meetingConcern2);
            });
            // TODO: this need to make in AP-15091
            //describe("And some contacts had been selected before", () => {
            //    beforeEach(() => {
            //        meetingContactVm2.isChecked = true;
            //        let flow: ap.viewmodels.meetingcontacts.MeetingManageFlowStateParam = new ap.viewmodels.meetingcontacts.MeetingManageFlowStateParam(Utility);
            //        flow.meetingConcernList = [meetingContactVm.originalMeetingContact, meetingContactVm2.originalMeetingContact]
            //        specHelper.general.spyProperty(ap.controllers.UIStateController.prototype, "mainFlowStateParam", specHelper.PropertyAccessor.Get).and.returnValue(flow);
            //        testAccessRights = new ap.models.accessRights.MeetingAccessRight(Utility);
            //        vm = new ap.viewmodels.meetingcontacts.MeetingManageContactsWorkspaceViewModel($scope, Utility, Api, $q, controllersManager, ServicesManager);
            //        testAccessRightsDefer.resolve([testAccessRights]);
            //        $rootScope.$apply();
            //    });
            //    afterEach(() => {
            //        specHelper.general.offSpyProperty(ap.controllers.UIStateController.prototype, "mainFlowStateParam", specHelper.PropertyAccessor.Get);
            //    });
            //    it("THEN, the list of contact contains only checked items", () => {
            //        expect(vm.meetingContactList.length).toEqual(1);
            //    });
            //});
            describe("And no contacts had been selected before", () => {
                beforeEach(() => {
                    let flow: ap.viewmodels.meetingcontacts.MeetingManageFlowStateParam = new ap.viewmodels.meetingcontacts.MeetingManageFlowStateParam(Utility)
                    flow.meetingConcernList = [meetingContactVm.originalMeetingContact, meetingContactVm2.originalMeetingContact]
                    specHelper.general.spyProperty(ap.controllers.UIStateController.prototype, "mainFlowStateParam", specHelper.PropertyAccessor.Get).and.returnValue(flow);
                    testAccessRights = new ap.models.accessRights.MeetingAccessRight(Utility);
                    vm = new ap.viewmodels.meetingcontacts.MeetingManageContactsWorkspaceViewModel($scope, Utility, Api, $q, controllersManager, ServicesManager);
                    testAccessRightsDefer.resolve([testAccessRights]);
                    $rootScope.$apply();
                });
                afterEach(() => {
                    specHelper.general.offSpyProperty(ap.controllers.UIStateController.prototype, "mainFlowStateParam", specHelper.PropertyAccessor.Get);
                });
                it("THEN, the list of contacts contains all the items", () => {
                    expect(vm.meetingContactList.length).toEqual(2);
                });
            });
        });
    });
});