describe("Module ap-viewmodels - NoteInChargeListViewModel", () => {
    let $rootScope: angular.IRootScopeService, $scope: angular.IScope;
    let Utility: ap.utility.UtilityHelper, UserContext: ap.utility.UserContext;
    let vm: ap.viewmodels.notes.NoteInChargeListViewModel;
    let $q: angular.IQService;
    let Api: ap.services.apiHelper.Api;
    let ProjectController: ap.controllers.ProjectController;
    let ControllersManager: ap.controllers.ControllersManager;
    let ServicesManager: ap.services.ServicesManager;

    let $mdDialog: angular.material.IDialogService;

    let project: any = {};
    project.Name = "Welcome";
    project.UserAccessRight = new ap.models.accessRights.ProjectAccessRight(Utility);
    project.UserAccessRight.CanEdit = true;
    project.UserAccessRight.CanArchiveDoc = true;
    project.PhotoFolderId = "d660cb6d-ca54-4b93-a564-a46e874eb68a";
    let date = new Date();
    date.setFullYear(2016);
    date.setMonth(2);
    let meeting: any = {};
    meeting.Occurrence = 1;
    meeting.Title = "Sprint Review";
    let n: any = {
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
        Cell: {
            Code: "C1",
            Description: "Cell 1",
            ParentCell: {
                Code: "P1",
                Description: "ParentCell 1"
            }
        },
        IssueType: {
            Code: "IT1",
            Description: "IssueType 1",
            ParentChapter: {
                Code: "PC1",
                Description: "ParentChapter 1"
            }
        },
        Status: {
            Name: "Status 1",
            Color: "111111"
        },
        Comments: [
            {
                Id: "b8d13dfc-4124-4340-be59-fbc2b22db6a3",
                IsRead: false,
                IsFirst: true,
                Comment: "First comment of the point",
                IsArchived: false,
                Date: '/Date(1442565731892)/'
            },
            {
                Id: "b8d13dfc-4124-4340-be59-fbc2b22db6a3",
                IsRead: true,
                IsFirst: false,
                Comment: "Second comment of the point",
                IsArchived: false,
                Date: '/Date(1442565731891)/'
            }
        ],
        NoteInCharge: [
            {
                Tag: "Sergio",
                IsContactInvitedOnProject: false
            },
            {
                Tag: "Renauld",
                IsContactInvitedOnProject: true
            }
        ],
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

    let defActivity: ng.IDeferred<any>;
    let defActivityIds: ng.IDeferred<any>;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
        angular.mock.module("ap-services");

        angular.mock.module(function ($provide) {
            $provide.factory('$mdDialog', ["$q", function ($q) {
                return specHelper.utility.stubShowMdDialog($q);
            }]);
        });
        specHelper.general.spyProperty(ap.viewmodels.notes.NoteDocumentListViewModel.prototype, "isDisplayingPictureViewer", specHelper.PropertyAccessor.Get).and.returnValue(false);
    });

    afterEach(() => {
        specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteDocumentListViewModel.prototype, "isDisplayingPictureViewer", specHelper.PropertyAccessor.Get);
    });

    beforeEach(inject(function (_$rootScope_, _UserContext_, _Utility_, _$q_, _$mdDialog_, _Api_, _ControllersManager_, _ServicesManager_) {
        Utility = _Utility_;
        UserContext = _UserContext_;
        $rootScope = _$rootScope_;
        $q = _$q_;
        Api = _Api_;
        ControllersManager = _ControllersManager_;
        ServicesManager = _ServicesManager_;
        $mdDialog = _$mdDialog_;
        $scope = $rootScope.$new();
        specHelper.utility.stubRootUrl(Utility);
        specHelper.userContext.stub(Utility);
        specHelper.utility.stubStorageSet(Utility);

        defActivity = $q.defer();
        defActivityIds = $q.defer();

        spyOn(Api, "getApiResponse").and.callFake(function (url: string) {
            if (url.indexOf("rest/activitylogs") === 0)
                return defActivity.promise;
            if (url === "rest/activitylogsids")
                return defActivityIds.promise;
            return null;
        });
    }));

    beforeEach(() => {
        spyOn(ServicesManager.noteService, "getLinkedNotes").and.returnValue($q.defer().promise);
    });

    let createNoteDetailVm = () => {
        return new ap.viewmodels.notes.NoteDetailViewModel(Utility, $mdDialog, $q, Api, ControllersManager, ServicesManager);
    };

    describe("Constructor", () => {
        describe("WHEN NoteInChargeListViewModel is created without a NoteViewModel", () => {
            it("THEN, default values are correctly fill AND the list is empty", () => {
                vm = new ap.viewmodels.notes.NoteInChargeListViewModel(Utility);

                expect(vm.entityName).toBe("NoteInCharge");
                expect(vm.defaultFilter).toBeNull();
                expect(vm.sortOrder).toBeNull();
                expect(vm.pathToLoad).toBeNull();
                expect(vm.sourceItems.length).toBe(0);
                expect(vm.hasUninvitedContactOnProject).toBeFalsy();
            });
        });

        describe("WHEN NoteInChargeListViewModel is created with a Note AND there are uninvited NoteInCharge users", () => {
            it("THEN, default values are correctly fill AND hasUninvitedContactOnProject = true", () => {
                let defNote: ng.IDeferred<any>;
                let defNoteStatus: ng.IDeferred<any>;

                defNote = $q.defer();
                defNoteStatus = $q.defer();

                spyOn(ControllersManager.noteController, "getFullNoteById").and.returnValue(defNote.promise);
                spyOn(ControllersManager.projectController, "getNoteProjectStatusList").and.returnValue(defNoteStatus.promise);

                let noteVm: ap.viewmodels.notes.NoteDetailViewModel = createNoteDetailVm();
                spyOn(noteVm, "gotoAnchor");
                noteVm.loadNote("b360cb6d-ca54-4b93-a564-a469274eb68a");

                let fullNote = new ap.models.notes.Note(Utility);
                fullNote.createByJson(n);
                defNote.resolve(fullNote);
                $rootScope.$apply();

                vm = new ap.viewmodels.notes.NoteInChargeListViewModel(Utility, noteVm);

                expect(vm.entityName).toBe("NoteInCharge");
                expect(vm.defaultFilter).toBeNull();
                expect(vm.sortOrder).toBeNull();
                expect(vm.pathToLoad).toBeNull();

                expect(vm.sourceItems.length).toBe(2);
                expect((<ap.viewmodels.notes.NoteInChargeViewModel>vm.getItemAtIndex(0)).tag).toBe("Sergio");
                expect((<ap.viewmodels.notes.NoteInChargeViewModel>vm.getItemAtIndex(1)).tag).toBe("Renauld");
                expect((<ap.viewmodels.notes.NoteInChargeViewModel>vm.getItemAtIndex(0)).isInvitedOnProject).toBeFalsy();
                expect((<ap.viewmodels.notes.NoteInChargeViewModel>vm.getItemAtIndex(1)).isInvitedOnProject).toBeTruthy();

                expect(vm.hasUninvitedContactOnProject).toBeTruthy();
            });
        });

        describe("WHEN NoteInChargeListViewModel is created with a Note AND there aren't uninvited NoteInCharge users", () => {
            it("THEN, default values are correctly fill AND hasUninvitedContactOnProject = false", () => {
                let defNote: ng.IDeferred<any>;
                let defNoteStatus: ng.IDeferred<any>;

                defNote = $q.defer();
                defNoteStatus = $q.defer();

                spyOn(ControllersManager.noteController, "getFullNoteById").and.returnValue(defNote.promise);
                spyOn(ControllersManager.projectController, "getNoteProjectStatusList").and.returnValue(defNoteStatus.promise);

                let noteVm: ap.viewmodels.notes.NoteDetailViewModel = createNoteDetailVm();
                spyOn(noteVm, "gotoAnchor");
                noteVm.loadNote("b360cb6d-ca54-4b93-a564-a469274eb68a");
                let note = n;

                note.NoteInCharge = [
                    {
                        Tag: "Sergio",
                        IsContactInvitedOnProject: true
                    },
                    {
                        Tag: "Renauld",
                        IsContactInvitedOnProject: true
                    }
                ];

                let fullNote = new ap.models.notes.Note(Utility);
                fullNote.createByJson(note);
                defNote.resolve(fullNote);
                $rootScope.$apply();

                vm = new ap.viewmodels.notes.NoteInChargeListViewModel(Utility, noteVm);

                expect(vm.entityName).toBe("NoteInCharge");
                expect(vm.defaultFilter).toBeNull();
                expect(vm.sortOrder).toBeNull();
                expect(vm.pathToLoad).toBeNull();

                expect(vm.sourceItems.length).toBe(2);
                expect((<ap.viewmodels.notes.NoteInChargeViewModel>vm.getItemAtIndex(0)).tag).toBe("Sergio");
                expect((<ap.viewmodels.notes.NoteInChargeViewModel>vm.getItemAtIndex(1)).tag).toBe("Renauld");
                expect((<ap.viewmodels.notes.NoteInChargeViewModel>vm.getItemAtIndex(0)).isInvitedOnProject).toBeTruthy();
                expect((<ap.viewmodels.notes.NoteInChargeViewModel>vm.getItemAtIndex(1)).isInvitedOnProject).toBeTruthy();

                expect(vm.hasUninvitedContactOnProject).toBeFalsy();
            });
        });
    });

    describe("Feature : fillNoteInCharge method", () => {
        beforeEach(() => {
            let defNote: ng.IDeferred<any>;
            let defNoteStatus: ng.IDeferred<any>;

            defNote = $q.defer();
            defNoteStatus = $q.defer();

            spyOn(ControllersManager.noteController, "getFullNoteById").and.returnValue(defNote.promise);
            spyOn(ControllersManager.projectController, "getNoteProjectStatusList").and.returnValue(defNoteStatus.promise);

            let noteVm: ap.viewmodels.notes.NoteDetailViewModel = createNoteDetailVm();
            spyOn(noteVm, "gotoAnchor");
            noteVm.loadNote("b360cb6d-ca54-4b93-a564-a469274eb68a");

            let fullNote = new ap.models.notes.Note(Utility);
            fullNote.createByJson(n);
            defNote.resolve(fullNote);
            $rootScope.$apply();

            vm = new ap.viewmodels.notes.NoteInChargeListViewModel(Utility, noteVm);
        });
        describe("When the fillNoteInCharge method will called with the undefinned list contact items", () => {
            it("THEN the list will be clear", () => {
                vm.fillNoteInCharge(undefined);
                expect(vm.sourceItems.length).toEqual(0);
            });
        });
        describe("When the fillNoteInCharge method will called with the list contact items", () => {
            it("THEN the list will be replaced with the items on the given list", () => {
                let contactItems: ap.viewmodels.projects.ContactItemViewModel[];
                let item1: ap.viewmodels.projects.ContactItemViewModel = new ap.viewmodels.projects.ContactItemViewModel("USERA", "111", "UserA@netika.com");
                let item2: ap.viewmodels.projects.ContactItemViewModel = new ap.viewmodels.projects.ContactItemViewModel("COMPANY1");
                let item3: ap.viewmodels.projects.ContactItemViewModel = new ap.viewmodels.projects.ContactItemViewModel("ROLE1");
                contactItems = [item1, item2, item3];
                vm.fillNoteInCharge(contactItems);
                expect(vm.sourceItems.length).toEqual(3);
                expect((<ap.viewmodels.notes.NoteInChargeViewModel>vm.getItemAtIndex(0)).tag).toBe("USERA");
                expect((<ap.viewmodels.notes.NoteInChargeViewModel>vm.getItemAtIndex(0)).userId).toBe("111");
                expect((<ap.viewmodels.notes.NoteInChargeViewModel>vm.getItemAtIndex(1)).tag).toBe("COMPANY1");
                expect((<ap.viewmodels.notes.NoteInChargeViewModel>vm.getItemAtIndex(2)).tag).toBe("ROLE1");
            });
        });
    });

    describe("Feature : postChanges", () => {
        beforeEach(() => {
            let defNote: ng.IDeferred<any>;
            let defNoteStatus: ng.IDeferred<any>;

            defNote = $q.defer();
            defNoteStatus = $q.defer();

            spyOn(ControllersManager.noteController, "getFullNoteById").and.returnValue(defNote.promise);
            spyOn(ControllersManager.projectController, "getNoteProjectStatusList").and.returnValue(defNoteStatus.promise);

            let noteVm: ap.viewmodels.notes.NoteDetailViewModel = createNoteDetailVm();
            spyOn(noteVm, "gotoAnchor");
            noteVm.loadNote("b360cb6d-ca54-4b93-a564-a469274eb68a");

            let fullNote = new ap.models.notes.Note(Utility);
            fullNote.createByJson(n);
            defNote.resolve(fullNote);
            $rootScope.$apply();

            vm = new ap.viewmodels.notes.NoteInChargeListViewModel(Utility, noteVm);
        });
        describe("When the postChanges method was called ", () => {
            it("THEN, the list NoteInCharge of the Note entity will be updated by the list from the VM", () => {
                let contactItems: ap.viewmodels.projects.ContactItemViewModel[];
                let item1: ap.viewmodels.projects.ContactItemViewModel = new ap.viewmodels.projects.ContactItemViewModel("USERA", "111", "UserA@netika.com");
                let item2: ap.viewmodels.projects.ContactItemViewModel = new ap.viewmodels.projects.ContactItemViewModel("COMPANY1");
                let item3: ap.viewmodels.projects.ContactItemViewModel = new ap.viewmodels.projects.ContactItemViewModel("ROLE1");
                contactItems = [item1, item2, item3];
                vm.fillNoteInCharge(contactItems);
                vm.postChanges();
                expect(vm.noteViewModel.noteBase.NoteInCharge.length).toEqual(3);
                expect(vm.noteViewModel.noteBase.NoteInCharge[0].Tag).toEqual("USERA");
                expect(vm.noteViewModel.noteBase.NoteInCharge[0].UserId).toEqual("111");
                expect(vm.noteViewModel.noteBase.NoteInCharge[1].Tag).toEqual("COMPANY1");
                expect(vm.noteViewModel.noteBase.NoteInCharge[2].Tag).toEqual("ROLE1");

            }); 
        });
    });

    describe("Feature: haschanged method", () => {
        beforeEach(() => {
            let defNote: ng.IDeferred<any>;
            let defNoteStatus: ng.IDeferred<any>;

            defNote = $q.defer();
            defNoteStatus = $q.defer();

            spyOn(ControllersManager.noteController, "getFullNoteById").and.returnValue(defNote.promise);
            spyOn(ControllersManager.projectController, "getNoteProjectStatusList").and.returnValue(defNoteStatus.promise);

            let noteVm: ap.viewmodels.notes.NoteDetailViewModel = createNoteDetailVm();
            spyOn(noteVm, "gotoAnchor");
            noteVm.loadNote("b360cb6d-ca54-4b93-a564-a469274eb68a");

            let fullNote = new ap.models.notes.Note(Utility);
            fullNote.createByJson(n);
            defNote.resolve(fullNote);
            $rootScope.$apply();

            vm = new ap.viewmodels.notes.NoteInChargeListViewModel(Utility, noteVm);
        });
        
        describe("WHEN nothing is done, ", () => {

            it("THEN haschanged is false()", () => {
                expect(vm.hasChanged).toBeFalsy();
            });
        });

        describe("WHEN a note in charges are added, ", () => {

            it("THEN haschanged is true", () => {
                let contactItems: ap.viewmodels.projects.ContactItemViewModel[];
                let item1: ap.viewmodels.projects.ContactItemViewModel = new ap.viewmodels.projects.ContactItemViewModel("USERA", "111", "UserA@netika.com");
                let item2: ap.viewmodels.projects.ContactItemViewModel = new ap.viewmodels.projects.ContactItemViewModel("COMPANY1");
                let item3: ap.viewmodels.projects.ContactItemViewModel = new ap.viewmodels.projects.ContactItemViewModel("ROLE1");
                contactItems = [item1, item2, item3];
                vm.fillNoteInCharge(contactItems);
                expect(vm.hasChanged).toBeTruthy();
            });
        });

        describe("WHEN a note in charges are added, and then postchanged is called", () => {

            it("THEN haschanged is false", () => {
                let contactItems: ap.viewmodels.projects.ContactItemViewModel[];
                let item1: ap.viewmodels.projects.ContactItemViewModel = new ap.viewmodels.projects.ContactItemViewModel("USERA", "111", "UserA@netika.com");
                let item2: ap.viewmodels.projects.ContactItemViewModel = new ap.viewmodels.projects.ContactItemViewModel("COMPANY1");
                let item3: ap.viewmodels.projects.ContactItemViewModel = new ap.viewmodels.projects.ContactItemViewModel("ROLE1");
                contactItems = [item1, item2, item3];
                vm.fillNoteInCharge(contactItems);
                vm.postChanges();
                expect(vm.hasChanged).toBeFalsy();
            });
        });

        describe("WHEN a note in charges are changed, and then postchanged is called and then note in charges are changed again", () => {

            it("THEN haschanged is true", () => {
                let contactItems: ap.viewmodels.projects.ContactItemViewModel[];
                let item1: ap.viewmodels.projects.ContactItemViewModel = new ap.viewmodels.projects.ContactItemViewModel("USERA", "111", "UserA@netika.com");
                let item2: ap.viewmodels.projects.ContactItemViewModel = new ap.viewmodels.projects.ContactItemViewModel("COMPANY1");
                let item3: ap.viewmodels.projects.ContactItemViewModel = new ap.viewmodels.projects.ContactItemViewModel("ROLE1");
                contactItems = [item1, item2, item3];
                vm.fillNoteInCharge(contactItems);
                vm.postChanges();
                expect(vm.hasChanged).toBeFalsy();

                contactItems = [item1];
                vm.fillNoteInCharge(contactItems);
                expect(vm.hasChanged).toBeTruthy();
            });
        });
    });
}); 