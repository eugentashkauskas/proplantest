describe("Module ap-viewmodels - MeetingAccessRightUserItemViewModel", () => {
    let Utility: ap.utility.UtilityHelper;
    let $q: angular.IQService;
    let vm: ap.viewmodels.meetingcontacts.MeetingAccessRightUserItemViewModel;
    let ControllersManager: ap.controllers.ControllersManager;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject(function (_Utility_, _$q_, _ControllersManager_) {
        Utility = _Utility_;
        $q = _$q_;
        ControllersManager = _ControllersManager_;

        specHelper.userContext.stub(Utility);

        let currentProject = {
            Id: "45152-56",
            Name: "test",
            Code: "PR",
            UserAccessRight: {
                CanEditAllList: true,
            },
            IsActive: true
        };
        
        spyOn(ControllersManager.mainController, "currentProject").and.callFake((val) => {
            if (val === undefined) {
                return currentProject;
            }
        });
    }));


    function getTestMeetingConcern(contactAccessRight: ap.models.accessRights.AccessRightLevel, meetingJson: any, i: number): ap.models.meetings.MeetingConcern {
        let testMeeting = new ap.models.meetings.Meeting(Utility);
        testMeeting.createByJson(meetingJson);
        let contact = new ap.models.meetings.MeetingConcern(Utility);
        contact.createByJson({
            Id: "000" + i,
            User: new ap.models.actors.User(Utility)
        });
        contact.AccessRightLevel = contactAccessRight;
        contact.Meeting = testMeeting;
        return contact;
    }

    describe("Feature: constructor", () => {
        let testMeetingConcern1: ap.models.meetings.MeetingConcern;
        let testMeetingConcern2: ap.models.meetings.MeetingConcern;
        beforeEach(() => {
            testMeetingConcern1 = getTestMeetingConcern(ap.models.accessRights.AccessRightLevel.Guest, {
                UserAccessRight: {
                    CanAddPoint: true
                }
            }, 1);

            testMeetingConcern2 = getTestMeetingConcern(ap.models.accessRights.AccessRightLevel.Admin, {
                UserAccessRight: {
                    CanAddPoint: false
                }
            }, 2);

            let meeting: ap.models.meetings.Meeting = new ap.models.meetings.Meeting(Utility);
            meeting.createByJson({
                Id: "meeting_id",
                UserAccessRight: {
                    Level: ap.models.accessRights.AccessRightLevel.Guest,
                    CanEditAllList: true
                }
            });
            specHelper.general.spyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get).and.returnValue(meeting);
        });

        afterEach(() => {
            specHelper.general.offSpyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get);
        });
        describe("WHEN the viewmodel is created", () => {
            beforeEach(() => {
                let param: ap.viewmodels.projectcontacts.UserProjectAccessRightItemParameter = new ap.viewmodels.projectcontacts.UserProjectAccessRightItemParameter(0, null, null, null, Utility, ControllersManager);
                vm = new ap.viewmodels.meetingcontacts.MeetingAccessRightUserItemViewModel(Utility, $q, null, "CanAddPoint", "Test label", ap.viewmodels.projectcontacts.ValueType.Simple, [testMeetingConcern1, testMeetingConcern2], param);
            });
            it("THEN, its fields are initialized ", () => {
                expect(vm).toBeDefined();
                expect(vm.name).toEqual("CanAddPoint");
                expect(vm.label).toEqual("Test label");
                expect(vm.currentInfoList).toBeDefined();
            });
            it("THEN, contact info is filled with valid values for the first page", () => {
                expect(vm.currentInfoList.length).toEqual(2);
                expect(vm.currentInfoList[0].value).toBeTruthy();
                expect(vm.currentInfoList[1].value).toBeFalsy();
            });
        });
    });
});