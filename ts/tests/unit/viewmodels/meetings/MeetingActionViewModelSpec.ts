describe("Module ap-viewmodels - MeetingActionViewModel", () => {

    let Utility: ap.utility.UtilityHelper;
    let MainController: ap.controllers.MainController;
    let MeetingController: ap.controllers.MeetingController;
    let vm: ap.viewmodels.meetings.MeetingActionViewModel;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-controllers");
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject(function (_Utility_, _MainController_, _MeetingController_) {
        Utility = _Utility_;
        MainController = _MainController_;
        MeetingController = _MeetingController_;
        specHelper.userContext.stub(Utility);
    }));

    beforeEach(() => {
        let currentProject = new ap.models.projects.Project(Utility);
        currentProject.createByJson({ UserAccessRight: {} });
        spyOn(MainController, "currentProject").and.returnValue(currentProject);
    });

    function createVm(meetingIsSystem: boolean = false): ap.viewmodels.meetings.MeetingActionViewModel {
        let meeting = new ap.models.meetings.Meeting(Utility);
        meeting.createByJson({
            UserAccessRight: {},
            IsSystem: meetingIsSystem
        });

        return new ap.viewmodels.meetings.MeetingActionViewModel(Utility, MainController, MeetingController, meeting);
    }

    function getActionByName(name: string) {
        return ap.viewmodels.home.ActionViewModel.getAction(vm.actions, name);
    }

    function setupAccessRightMock(name: string, value: boolean) {
        specHelper.general.spyProperty(ap.models.accessRights.MeetingAccessRightHelper.prototype, name, specHelper.PropertyAccessor.Get).and.returnValue(value);
    }

    function cleanupAccessRightMock(name: string) {
        specHelper.general.offSpyProperty(ap.models.accessRights.MeetingAccessRightHelper.prototype, name, specHelper.PropertyAccessor.Get);
    }

    describe("Feature: constructor", () => {
        describe("WHEN a new instance is created", () => {
            beforeEach(() => {
                vm = createVm();
            });

            it("THEN there is 1 action defined", () => {
                expect(vm.actions.length).toEqual(5);
            });

            it("THEN the 1st action is meeting.config", () => {
                expect(vm.actions[1].name).toEqual("meeting.config");
            });

            it("THEN the 1st action is meeting.info", () => {
                expect(vm.actions[2].name).toEqual("meeting.info");
            });
        });
    });

    describe("Feature: meeting.config action", () => {
        let action: ap.viewmodels.home.ActionViewModel;

        describe("WHEN a user has a configure action for a meeting", () => {
            beforeEach(() => {
                setupAccessRightMock("hasConfig", true);
                vm = createVm();
                action = getActionByName("meeting.config");
            });

            afterEach(() => {
                cleanupAccessRightMock("hasConfig");
            });

            it("THEN the action is visible", () => {
                expect(action.isVisible).toBeTruthy();
            });
        });

        describe("WHEN a user has not configure action for a meeting", () => {
            beforeEach(() => {
                setupAccessRightMock("hasConfig", false);
                vm = createVm();
                action = getActionByName("meeting.config");
            });

            afterEach(() => {
                cleanupAccessRightMock("hasConfig");
            });

            it("THEN the action is visible", () => {
                expect(action.isVisible).toBeFalsy();
            });
        });

        describe("WHEN a user can configure a meeting", () => {
            beforeEach(() => {
                setupAccessRightMock("canConfig", true);
                vm = createVm();
                action = getActionByName("meeting.config");
            });

            afterEach(() => {
                cleanupAccessRightMock("canConfig");
            });

            it("THEN the action is enabled", () => {
                expect(action.isEnabled).toBeTruthy();
            });
        });

        describe("WHEN a user cannot configure a meeting", () => {
            beforeEach(() => {
                setupAccessRightMock("canConfig", false);
                vm = createVm();
                action = getActionByName("meeting.config");
            });

            afterEach(() => {
                cleanupAccessRightMock("canConfig");
            });

            it("THEN the action is not enabled", () => {
                expect(action.isEnabled).toBeFalsy();
            });
        });
    });

    describe("Feature: meeting.info action", () => {
        let action: ap.viewmodels.home.ActionViewModel;

        describe("WHEN meeting isSystem = false  ", () => {
            beforeEach(() => {
                vm = createVm();
                action = getActionByName("meeting.info");
            });

            it("THEN the action is visible and enable", () => {
                expect(action.isVisible).toBeTruthy();
                expect(action.isEnabled).toBeTruthy();
            });
        });
        describe("WHEN meeting isSystem = true", () => {
            beforeEach(() => {
                vm = createVm(true);
                action = getActionByName("meeting.info");
            });

            it("THEN the action is invisible and disable", () => {
                expect(action.isVisible).toBeFalsy();
                expect(action.isEnabled).toBeFalsy();
            });
        });
        describe("WHEN meeting isSystem = false and set withInfo = false", () => {
            beforeEach(() => {
                vm = createVm();
                vm.withInfo = false;
                action = getActionByName("meeting.info");
            });

            it("THEN the action is invisible and disable", () => {
                expect(action.isVisible).toBeFalsy();
                expect(action.isEnabled).toBeFalsy();
            });
        });
    });
});
