'use strict';
describe("Module ap-viewmodels - MeetingGeneralViewModel", () => {
    let $rootScope: angular.IRootScopeService, $scope: angular.IScope;
    let Utility: ap.utility.UtilityHelper, UserContext: ap.utility.UserContext;
    let vm: ap.viewmodels.meetings.MeetingGeneralViewModel;
    let $q: angular.IQService;
    let controllersManager: ap.controllers.ControllersManager;
    let meetingVm: ap.viewmodels.meetings.MeetingViewModel;
    let meeting: ap.models.meetings.Meeting;;
    let project: ap.models.projects.Project;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });
    beforeEach(inject(function (_$rootScope_, _UserContext_, _Utility_, _$q_, _ControllersManager_) {
        Utility = _Utility_;
        UserContext = _UserContext_;
        $rootScope = _$rootScope_;
        $q = _$q_;
        controllersManager = _ControllersManager_;
        $scope = $rootScope.$new();
        specHelper.utility.stubRootUrl(Utility);
        specHelper.userContext.stub(Utility);
        specHelper.utility.stubStorageSet(Utility);
        project = new ap.models.projects.Project(Utility);
        let currentProject = new ap.models.projects.Project(Utility);
        currentProject.createByJson({ UserAccessRight: {} });
        spyOn(controllersManager.mainController, "currentProject").and.returnValue(currentProject);

        meetingVm = new ap.viewmodels.meetings.MeetingViewModel(Utility, controllersManager.mainController, controllersManager.meetingController);

        meeting = new ap.models.meetings.Meeting(Utility);
        meeting.createByJson({
            Id: "1",
            Code: "MY",
            Title: "My first meeting for the test",
            Comment: "Comment",
            Building: "Netika",
            Floor: "11",
            Header: "Here is header",
            Footer: "Here is footer",
            Remarks: "Some remarks",
            Occurrence: 25,
            Revision: 1,
            IsPublic: false,
            IsSystem: false,
            IsArchived: false,
            Date: '/Date(1442565731892)/',
            Type: 1,
            NumberingType: 1,
            NotesNumber: 100,
            TotalNotesNumber: 1000,
            DocumentsNumber: 5,
            ParticipantsNumber: 10,
            MeetingAuthor: {
                Id: "B9937389-990B-4CE6-8A61-EBB9C986223A"
            },
            Project: project,
            UserAccessRight: new ap.models.accessRights.MeetingAccessRight(Utility)
        });

        meetingVm.init(meeting);
    }));

    describe("Constructor", () => {
        describe("WHEN MeetingGeneralViewModel is created without MeetingReport", () => {
            it("THEN, the properties are filled with the default values", () => {
                vm = new ap.viewmodels.meetings.MeetingGeneralViewModel(Utility, controllersManager, meetingVm);

                expect(vm.meetingVm).toBe(meetingVm);
                expect(vm.screenInfo).toBeDefined();
            });
        });
    });
});