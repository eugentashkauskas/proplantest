'use strict';
describe("Module ap-viewmodels - MeetingTransferredDocViewModel", () => {
    let $rootScope: angular.IRootScopeService, $scope: angular.IScope;
    let Utility: ap.utility.UtilityHelper, UserContext: ap.utility.UserContext;
    let vm: ap.viewmodels.meetings.MeetingTransferredDocViewModel;
    let $q: angular.IQService;
    let api: ap.services.apiHelper.Api;
    let $timeout: angular.ITimeoutService;
    let controllersManager: ap.controllers.ControllersManager;
    let $mdDialog: angular.material.IDialogService;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });
    beforeEach(inject(function (_$rootScope_, _UserContext_, _Utility_, _$q_, _Api_, _ControllersManager_, _$timeout_) {
        Utility = _Utility_;
        UserContext = _UserContext_;
        $rootScope = _$rootScope_;
        $q = _$q_;
        $timeout = _$timeout_;
        controllersManager = _ControllersManager_;
        api = _Api_;
        $scope = $rootScope.$new();
        $mdDialog = specHelper.utility.stubShowMdDialog($q);
        specHelper.utility.stubRootUrl(Utility);
        specHelper.userContext.stub(Utility);
        specHelper.utility.stubStorageSet(Utility);
    }));

    describe("Constructor", () => {
        describe("WHEN MeetingTransferredDocViewModel is created without MeetingTransferredDoc", () => {
            it("THEN, the properties are filled with the default values", () => {
                vm = new ap.viewmodels.meetings.MeetingTransferredDocViewModel(Utility, api, $q, $mdDialog, controllersManager);

                expect(vm.name).toBeNull();
                expect(vm.fromTag).toBeNull();
                expect(vm.transferredDate).toBeNull();
                expect(vm.approved).toBeNull();
                expect(vm.meeting).toBeNull();
                expect(vm.fromGuid).toBeNull();
            });
        });

        describe("WHEN MeetingTransferredDocViewModel is created with MeetingTransferredDoc", () => {
            it("THEN, the properties are filled with the default values", () => {
                let meetingTransferredDocs: ap.models.meetings.MeetingTransferredDocs = new ap.models.meetings.MeetingTransferredDocs(Utility);
                let user = new ap.models.actors.User(Utility);
                user.createByJson({
                    Id: "321"
                });
                meetingTransferredDocs.createByJson({
                    From: user
                });

                meetingTransferredDocs.Name = "1bc";
                meetingTransferredDocs.FromTag = "Sergio";
                meetingTransferredDocs.TransferredDate = new Date(2016, 4, 28);
                meetingTransferredDocs.Approved = "Approved_";
                meetingTransferredDocs.Meeting = new ap.models.meetings.Meeting(Utility);
                meetingTransferredDocs.Meeting.Title = "Meeting by Hoang";
                meetingTransferredDocs.FromGuid = "FromGuid@";

                vm = new ap.viewmodels.meetings.MeetingTransferredDocViewModel(Utility, api, $q, $mdDialog, controllersManager);
                vm.init(meetingTransferredDocs);

                expect(vm.name).toBe("1bc");
                expect(vm.fromTag).toBe("Sergio");
                expect(vm.transferredDate.getFullYear()).toBe(2016);
                expect(vm.transferredDate.getMonth()).toBe(4);
                expect(vm.approved).toBe("Approved_");
                expect(vm.meeting.Title).toBe("Meeting by Hoang");
                expect(vm.fromGuid).toBe("FromGuid@");
            });
        });
    });

    describe("WHEN postChanges is called", () => {
        it("THEN properties of MeetingTransferredDocViewModel is set into MeetingTransferredDocViewModel.meetingTransferredDoc", () => {
            let meetingTransferredDocs: ap.models.meetings.MeetingTransferredDocs = new ap.models.meetings.MeetingTransferredDocs(Utility);
            let user = new ap.models.actors.User(Utility);
            user.createByJson({
                Id: "321"
            });
            meetingTransferredDocs.createByJson({
                Id: "123",
                FromTag: "aaaa",
                From: user,
                Name: "arc",
                Approved: "323",
            });
            vm = new ap.viewmodels.meetings.MeetingTransferredDocViewModel(Utility, api, $q, $mdDialog, controllersManager);
            vm.init(meetingTransferredDocs);
            vm.fromSelected = new ap.viewmodels.projects.ContactItemViewModel("Sergio", "FromGuid@", null, new ap.models.projects.ContactDetails(Utility), false, false, null, "Guid");
            spyOn(vm.usersTo, "postChanges");

            vm.name = "1bc";
            vm.transferredDate = new Date(2016, 4, 28);
            vm.approved = "Approved_";
            vm.meeting = new ap.models.meetings.Meeting(Utility);
            vm.meeting.Title = "Meeting by Hoang";

            vm.postChanges();

            expect(vm.meetingTransferDoc.Name).toBe("1bc");
            expect(vm.meetingTransferDoc.FromTag).toBe("Sergio");
            expect(vm.meetingTransferDoc.TransferredDate.getFullYear()).toBe(2016);
            expect(vm.meetingTransferDoc.TransferredDate.getMonth()).toBe(4);
            expect(vm.meetingTransferDoc.Approved).toBe("Approved_");
            expect(vm.meetingTransferDoc.Meeting.Title).toBe("Meeting by Hoang");
            expect(vm.meetingTransferDoc.FromGuid).toBe("FromGuid@");
            expect(vm.usersTo.postChanges).toHaveBeenCalled();
        });
    });
});