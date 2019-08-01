describe("Module ap-viewmodels - MeetingDocumentViewModel", () => {
    let $rootScope: angular.IRootScopeService, $scope: angular.IScope;
    let Utility: ap.utility.UtilityHelper, UserContext: ap.utility.UserContext;
    let vm: ap.viewmodels.meetings.MeetingDocumentViewModel;
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
        describe("WHEN MeetingDocumentViewModel is created without MeetingDocument", () => {
            it("THEN, the properties are filled with the default values", () => {
                vm = new ap.viewmodels.meetings.MeetingDocumentViewModel(Utility);

                expect(vm.displayOrder).toBe(0);
                expect(vm.meeting).toBeNull();
                expect(vm.document).toBeNull();
            });
        });

        describe("WHEN MeetingDocumentViewModel is created with MeetingDocument", () => {
            it("THEN, the properties are filled with the default values", () => {
                let meetingDocument: ap.models.meetings.MeetingDocument = new ap.models.meetings.MeetingDocument(Utility);

                meetingDocument.DisplayOrder = 1;
                meetingDocument.Meeting = new ap.models.meetings.Meeting(Utility);
                meetingDocument.Meeting.Title = "Meeting by Hoang";
                meetingDocument.Document = new ap.models.documents.Document(Utility);
                meetingDocument.Document.Name = "Document by Hoang";
                

                vm = new ap.viewmodels.meetings.MeetingDocumentViewModel(Utility);
                vm.init(meetingDocument);

                expect(vm.displayOrder).toBe(1);
                expect(vm.meeting.Title).toBe("Meeting by Hoang");
                expect(vm.document.Name).toBe("Document by Hoang");
            });
        });
    });

    describe("WHEN postChanges is called", () => {
        it("THEN properties of MeetingDocumentViewModel is set into MeetingDocumentViewModel.meetingDocument", () => {
            let meetingDocument: ap.models.meetings.MeetingDocument = new ap.models.meetings.MeetingDocument(Utility);

            vm = new ap.viewmodels.meetings.MeetingDocumentViewModel(Utility);
            vm.init(meetingDocument);

            vm.displayOrder = 1;
            vm.meeting = new ap.models.meetings.Meeting(Utility);
            vm.meeting.Title = "Meeting by Hoang";
            vm.document = new ap.models.documents.Document(Utility);
            vm.document.Name = "Document by Hoang";                

            vm.postChanges();

            expect(vm.meetingDocument.DisplayOrder).toBe(1);
            expect(vm.meetingDocument.Meeting.Title).toBe("Meeting by Hoang");
            expect(vm.meetingDocument.Document.Name).toBe("Document by Hoang");
        });
    });
});