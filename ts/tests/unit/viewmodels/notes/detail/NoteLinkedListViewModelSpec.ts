describe("Module ap-viewmodels - NoteLinkedListViewModel", () => {
    let $rootScope: angular.IRootScopeService, $scope: angular.IScope;
    let Utility: ap.utility.UtilityHelper, UserContext: ap.utility.UserContext;
    let vm: ap.viewmodels.notes.NoteLinkedListViewModel;
    let $q: angular.IQService;
    let $mdDialog: angular.material.IDialogService;
    let Api: ap.services.apiHelper.Api;

    let ControllersManager: ap.controllers.ControllersManager;
    let ServicesManager: ap.services.ServicesManager;
    let n: any;
    let currentProject: ap.models.projects.Project;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
        angular.mock.module("ap-services");
    });

    beforeEach(inject((_$rootScope_, _UserContext_, _Utility_, _$q_, _Api_, _ControllersManager_, _ServicesManager_) => {
        Utility = _Utility_;
        UserContext = _UserContext_;
        $rootScope = _$rootScope_;
        $q = _$q_;
        Api = _Api_;
        ControllersManager = _ControllersManager_;
        ServicesManager = _ServicesManager_;
        $scope = $rootScope.$new();
        specHelper.utility.stubRootUrl(Utility);
        specHelper.userContext.stub(Utility);
        specHelper.utility.stubStorageSet(Utility);

        let project: any = {};
        project.Name = "Welcome";
        project.UserAccessRight = new ap.models.accessRights.ProjectAccessRight(Utility);
        project.UserAccessRight.CanEdit = true;
        project.UserAccessRight.CanArchiveDoc = true;
        project.PhotoFolderId = "d660cb6d-ca54-4b93-a564-a46e874eb68a";

        let meeting: any = {};
        meeting.Occurrence = 1;
        meeting.Title = "Sprint Review";

        n = {
            Id: "b360cb6d-ca54-4b93-a564-a469274eb68a",
            Subject: "Note 1",
            CodeNum: "1.01",
            IsUrgent: true,
            DueDate: new Date(2016, 2, 25),
            From: {
                Alias: "aproplan@aproplan.com",
                Person: {
                    Name: "Quentin Luc"
                }
            },
            Status: {
                Name: "Status 1",
                Color: "111111"
            },
            Date: '/Date(1442565731890)/',
            Project: project,
            Meeting: meeting,
            MeetingAccessRight:
                {
                    CanEdit: true,
                    CanAddPoint: true,
                    CanEditPoint: true,
                    CanDeletePoint: true,
                    CanEditPointStatus: true,
                    CanAddComment: true,
                    CanDeleteComment: true,
                    CanArchiveComment: true,
                    CanAddDoc: true,
                    CanGenerateReport: true,
                    CanCreateNextMeeting: true,
                    CanEditAllPoint: true,
                    CanEditPointIssueType: true,
                    CanEditPointInCharge: true,
                    Level: ap.models.accessRights.AccessRightLevel.Subcontractor
                }
        };
    }));

    let createNoteDetailVm = (noteId?: string, location?: angular.ILocationService, anchorScroll?: angular.IAnchorScrollService, interval?: angular.IIntervalService) => {
        return new ap.viewmodels.notes.NoteDetailViewModel(Utility, $mdDialog, $q, Api, ControllersManager, ServicesManager, noteId, location, anchorScroll, interval);
    };

    describe("Constructor", () => {
        describe("WHEN NoteLinkedListViewModel constructor is called", () => {
            it("THEN, the ViewModel is correctly created", () => {
                vm = new ap.viewmodels.notes.NoteLinkedListViewModel(Utility, ControllersManager, $q, createNoteDetailVm());

                expect(vm.entityName).toBe("Note");
                expect(vm.defaultFilter).toBeNull();
                expect(vm.sortOrder).toBeUndefined();
                expect(vm.pathToLoad).toBeUndefined();
            });
        });
    });
});