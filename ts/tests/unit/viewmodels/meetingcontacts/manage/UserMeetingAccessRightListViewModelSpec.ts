describe("Module ap-viewmodels - UserMeetingAccessRightListViewModel", () => {
    let vm: ap.viewmodels.meetingcontacts.UserMeetingAccessRightListViewModel;
    let Utility: ap.utility.UtilityHelper;
    let $q: angular.IQService;
    let Api: ap.services.apiHelper.Api;
    let ControllersManager: ap.controllers.ControllersManager;
    let ServicesManager: ap.services.ServicesManager;
    let $scope: angular.IScope;
    let $rootScope: angular.IRootScopeService;
    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
        angular.mock.module("ap-services");
    });
    beforeEach(inject((_Utility_, _$q_, _$rootScope_, _Api_, _ControllersManager_, _ServicesManager_) => {
        Utility = _Utility_;
        $q = _$q_;
        Api = _Api_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        ControllersManager = _ControllersManager_;
        ServicesManager = _ServicesManager_;
        specHelper.userContext.stub(Utility);
        spyOn(ControllersManager.mainController, "currentProject").and.returnValue({
            Id: "1",
            UserAccessRight: {
                CanEditAllList: true
            },
            Creator: {
                Id: "111"
            }
        });
        
    }));
    

    describe("Feature Constructor", () => {
        let vm: ap.viewmodels.meetingcontacts.UserMeetingAccessRightListViewModel;
        beforeEach(() => {
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
        describe("When ContactHeaderViewModel is created", () => {
            beforeEach(() => {
                let defAccessRight = $q.defer();
                let accessRight: ap.models.accessRights.MeetingAccessRight = new ap.models.accessRights.MeetingAccessRight(Utility);
                accessRight.createByJson({ Level: ap.models.accessRights.AccessRightLevel.Guest });
                spyOn(ControllersManager.accessRightController, "geAccessRights").and.returnValue(defAccessRight.promise);
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
                    Id: "test-meeting-id",
                    UserAccessRight: {
                        Level: 4
                    }
                });
                let meetingContactVm: ap.viewmodels.meetingcontacts.MeetingContactViewModel = new ap.viewmodels.meetingcontacts.MeetingContactViewModel(Utility, ControllersManager);
                meetingContactVm.init(meetingConcern);
                vm = new ap.viewmodels.meetingcontacts.UserMeetingAccessRightListViewModel(Utility, Api, $q, ControllersManager, ServicesManager, [meetingContactVm]);
                defAccessRight.resolve([accessRight]);
                $rootScope.$apply();
            });
            it("Then the viewModel is defined", () => {
                expect(vm).toBeDefined();
            });
        });
    });
});  