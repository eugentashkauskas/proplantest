describe("Module ap-viewmodels - MeetingContact", () => {
    let $scope: angular.IScope;
    let Utility: ap.utility.UtilityHelper;
    let $rootScope: angular.IRootScopeService;
    let ControllersManager: ap.controllers.ControllersManager;
    let vm: ap.viewmodels.meetingcontacts.MeetingContactViewModel;

    let $q: angular.IQService;
    let Api = ap.services.apiHelper.Api;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
        angular.mock.module("ap-services");
    });

    beforeEach(inject((_$rootScope_, _Utility_, _ControllersManager_, _Api_, _$q_) => {
        Utility = _Utility_;
        $rootScope = _$rootScope_;
        ControllersManager = _ControllersManager_;
        $scope = $rootScope.$new();
        $q = _$q_;
        Api = _Api_;

        specHelper.userContext.stub(Utility);
    }));


    describe("Feature: copySource", () => {
        let meetingConcern: ap.models.meetings.MeetingConcern;

        beforeEach(() => {
            meetingConcern = new ap.models.meetings.MeetingConcern(Utility);
            let contactDetails = new ap.models.projects.ContactDetails(Utility);
            contactDetails.createByJson({
                DisplayName: "Meeting Concern Display name",
                Role: "Role",
                Phone: "+123456789",
                Company: "Company name"
            });  
            meetingConcern.ContactDetails = contactDetails;
            meetingConcern.AccessRightLevel = ap.models.accessRights.AccessRightLevel.Guest;
            meetingConcern.PresenceStatus = ap.models.meetings.MeetingPresenceStatus.Excused;
            meetingConcern.IsInvited = false;
            meetingConcern.Miscellaneous = "misc data";
            meetingConcern.User = new ap.models.actors.User(Utility);
            meetingConcern.User.createByJson({
                Person: {
                    Email: "test@email.com"
                }
            });

            vm = new ap.viewmodels.meetingcontacts.MeetingContactViewModel(Utility, ControllersManager);
        });

        describe("WHEN VM call init with meetingConcern have full info", () => {
            beforeEach(() => {
                spyOn(vm, "copySource").and.callThrough();
                vm.init(meetingConcern);
            });

            it("THEN, the copySource method is called", () => {
                expect(vm.copySource).toHaveBeenCalled();
            });

            it("THEN, properties should be initialized", () => {
                expect(vm.name).toBe("Meeting Concern Display name");
                expect(vm.company).toBe("Company name");
                expect(vm.role).toBe("Role");
                expect(vm.level).toEqual("Guest");
                expect(vm.presenceStatus.key).toBe(ap.models.meetings.MeetingPresenceStatus.Excused);
                expect(vm.isInvited).toBe(false);
                expect(vm.email).toBe("test@email.com");
                expect(vm.phone).toBe("+123456789");
                expect(vm.misc).toBe("misc data");
            });
        });
    });

    describe("Feature: postChanges", () => {
        let meetingConcern: ap.models.meetings.MeetingConcern;

        beforeEach(() => {
            meetingConcern = new ap.models.meetings.MeetingConcern(Utility);
            meetingConcern.User = new ap.models.actors.User(Utility);
            meetingConcern.User.createByJson({
                Person: { Email: "test@email.com" }
            });

            vm = new ap.viewmodels.meetingcontacts.MeetingContactViewModel(Utility, ControllersManager);

            vm.init(meetingConcern);
        });

        describe("WHEN postChanges is called", () => {
            it("THEN originalEntity.PresenceStatus should be Present", () => {
                vm.presenceStatus = new KeyValue<ap.models.meetings.MeetingPresenceStatus, string>(ap.models.meetings.MeetingPresenceStatus.Present, "Present")
                vm.postChanges();
                expect(vm.originalMeetingContact.PresenceStatus).toBe(ap.models.meetings.MeetingPresenceStatus.Present);
            });

            it("THEN originalEntity.PresenceStatus should be Absent", () => {
                vm.presenceStatus = new KeyValue<ap.models.meetings.MeetingPresenceStatus, string>(ap.models.meetings.MeetingPresenceStatus.Absent, "Absent")
                vm.postChanges();
                expect(vm.originalMeetingContact.PresenceStatus).toBe(ap.models.meetings.MeetingPresenceStatus.Absent);
            });

            it("THEN originalEntity.PresenceStatus should be Excused", () => {
                vm.presenceStatus = new KeyValue<ap.models.meetings.MeetingPresenceStatus, string>(ap.models.meetings.MeetingPresenceStatus.Excused, "Excused")
                vm.postChanges();
                expect(vm.originalMeetingContact.PresenceStatus).toBe(ap.models.meetings.MeetingPresenceStatus.Excused);
            });
        });
    });

    describe("Feature: isCurrentUser", () => {

        let meetingConcern: ap.models.meetings.MeetingConcern;

        beforeEach(() => {
            meetingConcern = new ap.models.meetings.MeetingConcern(Utility);
            meetingConcern.User = new ap.models.actors.User(Utility);
            meetingConcern.User.createByJson({
                Id: "111",
                Person: { Email: "test@email.com" }
            });

            vm = new ap.viewmodels.meetingcontacts.MeetingContactViewModel(Utility, ControllersManager);

            vm.init(meetingConcern);
        });

        describe("WHEN the currentUser is the same as the one of the Vm", () => {
            it("THEN, isCurrentUser is TRUE", () => {
                expect(vm.isCurrentUser).toBeTruthy();
            });
        });
    });
});