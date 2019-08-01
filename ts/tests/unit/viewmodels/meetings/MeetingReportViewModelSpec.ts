'use strict';
describe("Module ap-viewmodels - MeetingReportViewModel", () => {
    let $rootScope: angular.IRootScopeService, $scope: angular.IScope;
    let Utility: ap.utility.UtilityHelper, UserContext: ap.utility.UserContext;
    let vm: ap.viewmodels.meetings.MeetingReportViewModel;
    let $q: angular.IQService;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });
    beforeEach(inject(function (_$rootScope_, _UserContext_, _Utility_, _$q_) {
        Utility = _Utility_;
        UserContext = _UserContext_;
        $rootScope = _$rootScope_;
        $q = _$q_;
        $scope = $rootScope.$new();
        specHelper.utility.stubRootUrl(Utility);
        specHelper.userContext.stub(Utility);
        specHelper.utility.stubStorageSet(Utility);
    }));

    describe("Constructor", () => {
        describe("WHEN MeetingReportViewModel is created without MeetingReport", () => {
            it("THEN, the properties are filled with the default values", () => {
                vm = new ap.viewmodels.meetings.MeetingReportViewModel(Utility);

                expect(vm.versionId).toBeNull();
                expect(vm.occurrence).toBe(0);
                expect(vm.revision).toBe(0);
                expect(vm.sentDate).toBeNull();
                expect(vm.meeting).toBeNull();
                expect(vm.document).toBeNull();
            });
        });

        describe("WHEN MeetingReportViewModel is created with MeetingReport", () => {
            it("THEN, the properties are filled with the default values", () => {
                let meetingReport: ap.models.meetings.MeetingReport = new ap.models.meetings.MeetingReport(Utility);

                meetingReport.VersionId = "1bc";
                meetingReport.Occurrence = 2;
                meetingReport.Revision = 3;
                meetingReport.SentDate = new Date(2016, 4, 28);
                meetingReport.Meeting = new ap.models.meetings.Meeting(Utility);
                meetingReport.Meeting.Title = "Meeting by Hoang";
                meetingReport.Document = new ap.models.documents.Document(Utility);
                meetingReport.Document.Name = "Document by Hoang";


                vm = new ap.viewmodels.meetings.MeetingReportViewModel(Utility);
                vm.init(meetingReport);

                expect(vm.versionId).toBe("1bc");
                expect(vm.occurrence).toBe(2);
                expect(vm.revision).toBe(3);
                expect(vm.sentDate.getFullYear()).toBe(2016);
                expect(vm.sentDate.getMonth()).toBe(4);
                expect(vm.meeting.Title).toBe("Meeting by Hoang");
                expect(vm.document.Name).toBe("Document by Hoang");
            });
        });
    });

    describe("WHEN postChanges is called", () => {
        it("THEN properties of MeetingReportViewModel is set into MeetingReportViewModel.meetingReport", () => {
            let meetingReport: ap.models.meetings.MeetingReport = new ap.models.meetings.MeetingReport(Utility);

            vm = new ap.viewmodels.meetings.MeetingReportViewModel(Utility);
            vm.init(meetingReport);

            vm.versionId = "1bc";
            vm.occurrence = 2;
            vm.revision = 3;
            vm.sentDate = new Date(2016, 4, 28);
            vm.meeting = new ap.models.meetings.Meeting(Utility);
            vm.meeting.Title = "Meeting by Hoang";
            vm.document = new ap.models.documents.Document(Utility);
            vm.document.Name = "Document by Hoang";


            vm.postChanges();

            expect(vm.meetingReport.VersionId).toBe("1bc");
            expect(vm.meetingReport.Occurrence).toBe(2);
            expect(vm.meetingReport.Revision).toBe(3);
            expect(vm.meetingReport.SentDate.getFullYear()).toBe(2016);
            expect(vm.meetingReport.SentDate.getMonth()).toBe(4);
            expect(vm.meetingReport.Meeting.Title).toBe("Meeting by Hoang");
            expect(vm.meetingReport.Document.Name).toBe("Document by Hoang");
        });
    });
});