describe("Module ap-viewmodels - NoteWorkspaceViewModel", () => {

    let $controller: ng.IControllerService, vm: ap.viewmodels.notes.NoteWorkspaceViewModel, MainController: ap.controllers.MainController,
        Utility: ap.utility.UtilityHelper, _deferred: angular.IDeferred<ap.services.apiHelper.ApiResponse>, NotesListVm: ap.viewmodels.notes.NoteListViewModel,
        UserContext: ap.utility.UserContext, NoteController: ap.controllers.NoteController, Api: ap.services.apiHelper.Api;
    let $q: angular.IQService, $rootScope: angular.IRootScopeService, $scope: angular.IScope, $mdSidenav, $timeout: angular.ITimeoutService, $mdDialog: angular.material.IDialogService;
    let ProjectController: ap.controllers.ProjectController;
    let mdDialogDeferred: angular.IDeferred<any>;
    let dataNotes = [];
    let fakeAceess = null;
    let DocumentController: ap.controllers.DocumentController;
    let AccessRightController: ap.controllers.AccessRightController;
    let ServicesManager: ap.services.ServicesManager;
    let ControllersManager: ap.controllers.ControllersManager;

    beforeEach(() => {
        let $window = specHelper.createWindowStub();
        $window.navigator.userLanguage = undefined;
        $window.navigator.language = 'en_US';
        angular.mock.module(function ($provide) {
            $provide.value('$window', $window);
            $mdSidenav = specHelper.utility.stubToggleMdSideNav($provide);
        });
    });

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
        angular.mock.module("ap-services");
        angular.mock.module("ngMaterial");
        angular.mock.module(function ($provide) {
            $provide.factory('$mdDialog', ["$q", function ($q) {
                return specHelper.utility.stubShowMdDialog($q);
            }]);
        });
    });

    beforeEach(inject(function (_$q_, _$controller_, _$rootScope_, _MainController_, _$timeout_, _Utility_, _UserContext_, _Api_, _NoteController_,
        _ProjectController_, _$mdDialog_, _DocumentController_, _AccessRightController_, _ControllersManager_, _ServicesManager_) {
        $controller = _$controller_;
        MainController = _MainController_;
        Utility = _Utility_;
        UserContext = _UserContext_;
        NoteController = _NoteController_;
        ProjectController = _ProjectController_;
        AccessRightController = _AccessRightController_;
        Api = _Api_;
        $timeout = _$timeout_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        $q = _$q_;
        $mdDialog = _$mdDialog_;
        DocumentController = _DocumentController_;
        ControllersManager = _ControllersManager_;
        ServicesManager = _ServicesManager_;

        _deferred = $q.defer();

        mdDialogDeferred = (<any>$mdDialog).deferred;
        spyOn(Utility.Translator, "getTranslation").and.callFake(function (key) {
            return "$" + key;
        });

        spyOn(Utility.Translator, "initLanguage");

        specHelper.userContext.stub(Utility);
        specHelper.utility.stubRootUrl(Utility);

        fakeAceess = new ap.models.accessRights.ProjectAccessRight(Utility);

        spyOn(MainController, "currentProject").and.returnValue(
            {
                Id: "b360cb6d-ca54-4b93-a564-a469274eb68a",
                Name: "Welcome Project",
                Creator: Utility.UserContext.CurrentUser(),
                UserAccessRight: fakeAceess
            });

        dataNotes = [
            {
                Id: "b360cb6d-ca54-4b93-a564-a469274eb68a",
                Subject: "Note 1",
                CodeNum: "1.01",
                IsArchived: false,
                updateEntityPropsOnly: function () { },
                From: {
                    Person: {
                        Name: "Quentin Luc"
                    }
                },
                Cell: {
                    Code: "C1",
                    ParentCell: {
                        Code: "PC1"
                    }
                },
                IssueType: {
                    Code: "IT1",
                    ParentChapter: {
                        Code: "PIT1"
                    }
                },
                Status: {
                    Name: "Status 1",
                    Color: "111111",
                    IsTodo: true
                },
                Comments: [
                    {
                        Id: "b8d13dfc-4124-4340-be59-fbc2b22db6a3",
                        IsRead: false,
                        LastModificationDate: new Date(2016, 0, 2)
                    }
                ],
                NoteInCharge: [
                    {
                        Id: "b8d13dfc-4124-4340-be59-fbc2b22db6a3",
                        Tag: "Sergio"
                    }
                ],
                DueDate: new Date(2016, 0, 2),
                MeetingAccessRight: {
                    Level: ap.models.accessRights.AccessRightLevel.Admin,
                    CanEdit: true,
                    CanEditPoint: true,
                    CanDeletePoint: true,
                    CanAddComment: true,
                    CanDeleteComment: true,
                    CanArchiveComment: true,
                    CanAddDoc: true,
                    CanEditAllPoint: true,
                    CanAddPointDocument: true,
                    CanDeletePointDocument: true
                }
            },
            {
                Id: "35a2c5d6-0e00-43e9-ada8-ce4f3fadb16e",
                Subject: "Note 2",
                CodeNum: "2.02",
                IsArchived: false,
                From: {
                    Id: "4"
                },
                MeetingAccessRight: {
                    Level: ap.models.accessRights.AccessRightLevel.Admin,
                    CanEdit: true,
                    CanEditPoint: true,
                    CanDeletePoint: true,
                    CanAddComment: true,
                    CanDeleteComment: true,
                    CanArchiveComment: true,
                    CanAddDoc: true,
                    CanEditAllPoint: true,
                    CanAddPointDocument: true,
                    CanDeletePointDocument: true
                },
                Cell: {
                    Code: "C1",
                    ParentCell: {
                        Code: "PC1"
                    }
                },
                IssueType: {
                    Code: "IT1",
                    ParentChapter: {
                        Code: "PIT1"
                    }
                },
                Status: {
                    Name: "Status 1",
                    Color: "111111",
                    IsTodo: true
                },
                Comments: [
                    {
                        Id: "caeb3a53-94b3-4bea-b724-b686a724e3c5",
                        IsRead: false,
                        LastModificationDate: new Date(2016, 0, 2)
                    }
                ],
                NoteInCharge: [
                    {
                        Id: "caeb3a53-94b3-4bea-b724-b686a724e3c5",
                        Tag: "Sergio"
                    }
                ],
                DueDate: new Date(2016, 0, 2)
            },
            {
                Id: "bf70c80f-3b76-4bf8-bef4-86c7b1d4aa60",
                Subject: "Note 3",
                CodeNum: "3.03",
                IsArchived: false,
                From: {
                    Person: {
                        Name: "Quentin Luc"
                    }
                },
                Cell: {
                    Code: "C1",
                    ParentCell: {
                        Code: "PC1"
                    }
                },
                IssueType: {
                    Code: "IT1",
                    ParentChapter: {
                        Code: "PIT1"
                    }
                },
                Status: {
                    Name: "Status 1",
                    Color: "111111",
                    IsTodo: true
                },
                MeetingAccessRight: {
                    Level: ap.models.accessRights.AccessRightLevel.Subcontractor
                },
                updateEntityPropsOnly: function () { },
                Comments: [
                    {
                        Id: "a501aee5-4997-4717-96f2-3ddd1f098bef",
                        IsRead: false,
                        LastModificationDate: new Date(2016, 0, 2)
                    }
                ],
                NoteInCharge: [
                    {
                        Id: "a501aee5-4997-4717-96f2-3ddd1f098bef",
                        Tag: "Renauld"
                    },
                    {
                        Tag: "Sergio"
                    }
                ],
                DueDate: new Date(2016, 0, 2)
            },
            {
                Id: "bf70c80f-3b76-8jf8-bef4-8kreb1d4aa60",
                Subject: "Note 4",
                CodeNum: "4.04",
                IsArchived: false,
                updateEntityPropsOnly: function () { },
                From: {
                    Person: {
                        Name: "Quentin Luc"
                    }
                },
                Cell: {
                    Code: "C2",
                    ParentCell: {
                        Code: "PC2"
                    }
                },
                IssueType: {
                    Code: "IT2",
                    ParentChapter: {
                        Code: "PIT2"
                    }
                },
                Status: {
                    Name: "Status 2",
                    Color: "111111",
                    IsTodo: false
                },
                MeetingAccessRight: {
                    Level: ap.models.accessRights.AccessRightLevel.Subcontractor
                },
                Comments: [
                    {
                        Id: "39d0d7b4-0477-400c-a421-405021f670e4",
                        IsRead: false,
                        LastModificationDate: new Date(2016, 0, 2)
                    }
                ],
                NoteInCharge: [
                    {
                        Id: "39d0d7b4-0477-400c-a421-405021f670e4",
                        Tag: "Renauld"
                    },
                    {
                        Tag: "Sergio"
                    }
                ],
                DueDate: new Date(2016, 0, 2)
            },
            {
                Id: "2941f296-be77-4681-98b7-720d15b23f6a",
                Subject: "Note 5",
                CodeNum: "5.05",
                IsArchived: false,
                From: {
                    Person: {
                        Name: "Quentin Luc"
                    }
                },
                Cell: {
                    Code: "C2",
                    ParentCell: {
                        Code: "PC2"
                    }
                },
                IssueType: {
                    Code: "IT2",
                    ParentChapter: {
                        Code: "PIT2"
                    }
                },
                Status: {
                    Name: "Status 2",
                    Color: "111111"
                },
                MeetingAccessRight: {
                    Level: ap.models.accessRights.AccessRightLevel.Admin
                },
                Comments: [
                    {
                        Id: "0a63d1ab-90ab-4244-b1a9-7afd8869c78c",
                        IsRead: false,
                        LastModificationDate: new Date(2016, 0, 2)
                    }
                ],
                NoteInCharge: [
                    {
                        Id: "0a63d1ab-90ab-4244-b1a9-7afd8869c78c",
                        Tag: "Quentin"
                    },
                    {
                        Tag: "Renauld"
                    }
                ],
                DueDate: new Date(2016, 0, 2)
            },
            {
                Id: "2237b414-098a-48f1-af55-f62f61b10439",
                Subject: "Note 6",
                CodeNum: "6.06",
                IsArchived: false,
                From: {
                    Person: {
                        Name: "Quentin Luc"
                    }
                },
                Cell: {
                    Code: "C3",
                    ParentCell: {
                        Code: "PC3"
                    }
                },
                IssueType: {
                    Code: "IT3",
                    ParentChapter: {
                        Code: "PIT3"
                    }
                },
                Status: {
                    Name: "Status 3",
                    Color: "111111"
                },
                MeetingAccessRight: {
                    Level: ap.models.accessRights.AccessRightLevel.Admin
                },
                Comments: [
                    {
                        Id: "4af8f685-8323-4e4f-8232-b3a63389a6ed",
                        IsRead: false,
                        LastModificationDate: new Date(2016, 0, 2)
                    }
                ],
                NoteInCharge: [
                    {
                        Id: "4af8f685-8323-4e4f-8232-b3a63389a6ed",
                        Tag: "Quentin"
                    },
                    {
                        Tag: "Renauld"
                    }
                ],
                DueDate: new Date(2016, 0, 2)
            },
            {
                Id: "c629417f-9533-4223-8bd0-521cdd61aa3a",
                Subject: "Note 7",
                CodeNum: "7.07",
                IsArchived: false,
                From: {
                    Person: {
                        Name: "Quentin Luc"
                    }
                },
                Cell: {
                    Code: "C3",
                    ParentCell: {
                        Code: "PC3"
                    }
                },
                IssueType: {
                    Code: "IT3",
                    ParentChapter: {
                        Code: "PIT3"
                    }
                },
                Status: {
                    Name: "Status 3",
                    Color: "111111"
                },
                MeetingAccessRight: {
                    Level: ap.models.accessRights.AccessRightLevel.Admin
                },
                Comments: [
                    {
                        Id: "54719bf6-02a6-45aa-b181-d18898e00e39",
                        IsRead: false,
                        LastModificationDate: new Date(2016, 0, 2)
                    }
                ],
                NoteInCharge: [
                    {
                        Id: "54719bf6-02a6-45aa-b181-d18898e00e39",
                        Tag: "Quentin"
                    },
                    {
                        Tag: "Renauld"
                    }
                ],
                DueDate: new Date(2016, 0, 2)
            },
            {
                Id: "b1406f37-f02e-4b36-9a2a-9d6d12149143",
                Subject: "Note 8",
                CodeNum: "8.08",
                IsArchived: false,
                From: {
                    Person: {
                        Name: "Quentin Luc"
                    }
                },
                Cell: {
                    Code: "C3",
                    ParentCell: {
                        Code: "PC3"
                    }
                },
                IssueType: {
                    Code: "IT3",
                    ParentChapter: {
                        Code: "PIT3"
                    }
                },
                Status: {
                    Name: "Status 3",
                    Color: "111111"
                },
                MeetingAccessRight: {
                    Level: ap.models.accessRights.AccessRightLevel.Admin
                },
                Comments: [
                    {
                        Id: "f2192e2e-c434-4280-aaf9-fd4647ffaa8f",
                        IsRead: false,
                        LastModificationDate: new Date(2016, 0, 2)
                    }
                ],
                NoteInCharge: [
                    {
                        Id: "f2192e2e-c434-4280-aaf9-fd4647ffaa8f",
                        Tag: "Quentin"
                    },
                    {
                        Tag: "Renauld"
                    }
                ],
                DueDate: new Date(2016, 0, 2)
            },
            {
                Id: "9b75f490-aed6-4eca-9b89-23b01878ec7f",
                Subject: "Note 9",
                CodeNum: "9.09",
                IsArchived: false,
                From: {
                    Person: {
                        Name: "Quentin Luc"
                    }
                },
                Cell: {
                    Code: "C3",
                    ParentCell: null
                },
                IssueType: {
                    Code: "IT3",
                    ParentChapter: {
                        Code: "PIT3"
                    }
                },
                Status: {
                    Name: "Status 3",
                    Color: "111111"
                },
                MeetingAccessRight: {
                    Level: ap.models.accessRights.AccessRightLevel.Admin
                },
                Comments: [
                    {
                        Id: "e22d49ea-113c-41a6-84a7-be211154b6ed",
                        IsRead: false,
                        LastModificationDate: new Date(2016, 0, 2)
                    }
                ],
                NoteInCharge: null,
                DueDate: new Date(2016, 0, 2)
            },
            {
                Id: "1069741a-571a-4ee9-be15-662b17749dad",
                Subject: "Note 10",
                CodeNum: "10.10",
                IsArchived: false,
                From: {
                    Person: {
                        Name: "Quentin Luc"
                    }
                },
                Cell: null,
                IssueType: null,
                Status: {
                    Name: "Status 4",
                    Color: "111111"
                },
                MeetingAccessRight: {
                    Level: ap.models.accessRights.AccessRightLevel.Admin
                },
                Comments: [
                    {
                        Id: "10ed0cc1-1818-4c1f-869c-961c3ea67285",
                        IsRead: false,
                        LastModificationDate: new Date(2016, 0, 2)
                    }
                ],
                NoteInCharge: null,
                DueDate: null
            }
        ];

        specHelper.general.spyProperty(ap.viewmodels.notes.NoteDocumentListViewModel.prototype, "isDisplayingPictureViewer", specHelper.PropertyAccessor.Get).and.returnValue(false);
        let _deferredCustom = $q.defer();
        spyOn(ControllersManager.customViewController, "getCustomViewList").and.returnValue(_deferredCustom.promise);
        _deferredCustom.resolve([]);
    }));


    // spy Segment.IO calls
    beforeEach(() => {
        specHelper.general.initStub(ap.viewmodels.notes.AddEditNoteViewModel, "initMeetingSelector");
        spyOn(ServicesManager.toolService, "sendEvent").and.returnValue($q.defer().promise);
    });

    afterEach(() => {
        specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteDocumentListViewModel.prototype, "isDisplayingPictureViewer", specHelper.PropertyAccessor.Get);
        specHelper.general.removeStub(ap.viewmodels.notes.AddEditNoteViewModel, "initMeetingSelector");
    });

    function createNoteWorkspace(isForNoteModule: boolean): ap.viewmodels.notes.NoteWorkspaceViewModel {
        return new ap.viewmodels.notes.NoteWorkspaceViewModel($scope, $mdSidenav, Utility, Api, $q, $mdDialog, $timeout, null, null, null, ControllersManager, ServicesManager, null, isForNoteModule);
    }

    function spyGetNote(ids?: string[], notes?: any[]) {
        let defferedIds: angular.IDeferred<ap.services.apiHelper.ApiResponse>;
        defferedIds = $q.defer();
        let apiRespIds = new ap.services.apiHelper.ApiResponse(ids || []);
        spyOn(Api, "getEntityIds").and.returnValue(defferedIds.promise);
        defferedIds.resolve(apiRespIds);

        let defferedNotes: angular.IDeferred<ap.services.apiHelper.ApiResponse>;
        defferedNotes = $q.defer();
        spyOn(Api, "getEntityList").and.returnValue(defferedNotes.promise);
        let apiRespNotes = new ap.services.apiHelper.ApiResponse(notes || []);
        defferedIds.resolve(apiRespNotes);
    }

    function accessrightsSpy() {
        let defAccessRight = $q.defer();

        let accessRights = [{ Id: "M1", ModuleName: "Meeting", Level: ap.models.accessRights.AccessRightLevel.Admin, CanAddPoint: true },
        { Id: "M2", ModuleName: "Meeting", Level: ap.models.accessRights.AccessRightLevel.Manager, CanAddPoint: true },
        { Id: "M3", ModuleName: "Meeting", Level: ap.models.accessRights.AccessRightLevel.Contributor },
        { Id: "M4", ModuleName: "Meeting", Level: ap.models.accessRights.AccessRightLevel.Guest },
        { Id: "M5", ModuleName: "Meeting", Level: ap.models.accessRights.AccessRightLevel.Subcontractor }
        ];

        defAccessRight.resolve(accessRights);

        spyOn(Api, "getApiResponse").and.callFake((url: string) => {
            if (url.indexOf("rest/accessrights") === 0)
                return defAccessRight.promise;

            return $q.defer().promise;
        });
    }

    describe("Feature: Default values", () => {
        it("can get an instance of my factory with default values", () => {
            vm = <ap.viewmodels.notes.NoteWorkspaceViewModel>$controller("noteWorkspaceViewModel", { $scope: $scope });

            spyOn(vm.noteDetailVm, "loadNote").and.returnValue(_deferred.promise);

            expect(vm).toBeDefined();
            expect(vm.noteListVm).toBeDefined();
            expect(vm.noteDetailVm).toBeDefined();
            expect(vm.isNoteDetailOpened).toBeFalsy();
            expect(vm.isEditMode).toBeFalsy();
        });

        describe("WHEN the view model is created in meeting module", () => {

            let meeting: ap.models.meetings.Meeting;
            let defGetMeetingAccessRight;
            let meetingAccessRight: ap.models.accessRights.MeetingAccessRight;
            beforeEach(() => {

                let defered = $q.defer();
                spyOn(Api, "getApiResponseStatList").and.returnValue(defered.promise);

                meetingAccessRight = new ap.models.accessRights.MeetingAccessRight(Utility);
                meetingAccessRight.CanAddPoint = true;

                defGetMeetingAccessRight = $q.defer();
                meeting = new ap.models.meetings.Meeting(Utility);
                meeting.createByJson({ Id: "M1" });
                specHelper.general.spyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get).and.returnValue(meeting);
                spyOn(AccessRightController, "getMeetingAccessRight").and.returnValue(defGetMeetingAccessRight.promise);


            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get);
            });


            it("THEN, accessRightController.getMeetingAccessRight will be called", () => {
                vm = <ap.viewmodels.notes.NoteWorkspaceViewModel>$controller("noteWorkspaceViewModel", { $scope: $scope });
                expect(AccessRightController.getMeetingAccessRight).toHaveBeenCalledWith("M1");
            });

            it("AND THEN addAction will be visible if meetingAccessRight.CanAddPoint = true", () => {
                meetingAccessRight.CanAddPoint = true;
                spyGetNote();
                vm = <ap.viewmodels.notes.NoteWorkspaceViewModel>$controller("noteWorkspaceViewModel", { $scope: $scope });
                defGetMeetingAccessRight.resolve(meetingAccessRight);
                $rootScope.$apply();
                let addActions = vm.noteListVm.screenInfo.addAction;
                expect(addActions.isVisible).toBeTruthy();
            });

            it("AND THEN addAction will be hidden if meetingAccessRight.CanAddPoint = false", () => {
                meetingAccessRight.CanAddPoint = false;
                spyGetNote();
                vm = <ap.viewmodels.notes.NoteWorkspaceViewModel>$controller("noteWorkspaceViewModel", { $scope: $scope });
                defGetMeetingAccessRight.resolve(meetingAccessRight);
                $rootScope.$apply();
                let addActions = vm.noteListVm.screenInfo.addAction;
                expect(addActions.isVisible).toBeFalsy();
            });
        });
    });

    describe("Feature: Destroy", () => {
        describe("WHEN destroy is called", () => {
            it("THEN, the workspace unscribe of all events he was subscribed to", () => {
                vm = <ap.viewmodels.notes.NoteWorkspaceViewModel>$controller("noteWorkspaceViewModel", { $scope: $scope });

                spyOn(MainController, "off");
                let spyDisposeDetail: jasmine.Spy = spyOn(vm.noteDetailVm, "dispose");
                spyOn(vm.noteListVm, "dispose");
                spyOn(NoteController, "off");
                $scope.$destroy();

                expect(MainController.off).toHaveBeenCalled();
                expect(spyDisposeDetail).toHaveBeenCalled();
                expect(vm.noteDetailVm).toBeNull();
                expect(vm.noteListVm).toBeNull();
                expect(NoteController.off).toHaveBeenCalled();

                expect(vm.isNoteDetailOpened).toBeFalsy();
            });
        });
    });

    describe("Feature: Dispose", () => {
        describe("WHEN dispose is called", () => {
            it("THEN, the workspace dispose the noteslist and notedetails", () => {
                vm = <ap.viewmodels.notes.NoteWorkspaceViewModel>$controller("noteWorkspaceViewModel", { $scope: $scope });

                let spyDisposeDetail: jasmine.Spy = spyOn(vm.noteDetailVm, "dispose");
                spyOn(vm.noteListVm, "dispose");
                vm.dispose();

                expect(spyDisposeDetail).toHaveBeenCalled();
                expect(vm.noteDetailVm).toBeNull();
                expect(vm.noteListVm).toBeNull();
            });
        });
    });

    describe("Feature: ToggleRight", () => {
        let spySet: jasmine.Spy;
        beforeEach(() => {
            vm = <ap.viewmodels.notes.NoteWorkspaceViewModel>$controller("noteWorkspaceViewModel", { $scope: $scope });
            spyOn(vm, "selectItem");
            spySet = specHelper.general.spyProperty(ap.viewmodels.notes.NoteWorkspaceViewModel.prototype, "isNoteDetailOpened", specHelper.PropertyAccessor.Set);
            specHelper.general.spyProperty(ap.viewmodels.notes.NoteWorkspaceViewModel.prototype, "selectedNoteViewModel", specHelper.PropertyAccessor.Get).and.returnValue(
                {
                    originalNote: {
                        Id: "12"
                    },
                    updateNoteIsRead: function () { }
                }
            );
        });
        afterEach(() => {
            specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteWorkspaceViewModel.prototype, "isNoteDetailOpened", specHelper.PropertyAccessor.Set);
            specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteWorkspaceViewModel.prototype, "selectedNoteViewModel", specHelper.PropertyAccessor.Get);
        });
        describe("WHEN toggleRight is called with no noteId", () => {
            beforeEach(() => {
                vm.toggleRight();
            });
            it("THEN selectItem is called", () => {
                expect(vm.selectItem).not.toHaveBeenCalled();
            });
            it("THEN isNoteDetailOpened is changed", () => {
                expect(spySet).toHaveBeenCalledWith(false);
            });
        });
        describe("WHEN toggleRight is called with a noteId different from the selected vm", () => {
            beforeEach(() => {
                let note: any = {
                    originalNote: {
                        Id: "13"
                    },
                    updateNoteIsRead: function () { }
                };
                vm.toggleRight(note);
            });
            it("THEN selectItem is called", () => {
                expect(vm.selectItem).toHaveBeenCalledWith("13");
            });
            it("THEN isNoteDetailOpened is changed", () => {
                expect(spySet).toHaveBeenCalledWith(true);
            });
        });
        describe("WHEN toggleRight is called with a noteId equal to the selected vm", () => {
            describe("WHEN the detail is open", () => {
                beforeEach(() => {
                    specHelper.general.spyProperty(ap.viewmodels.notes.NoteWorkspaceViewModel.prototype, "isNoteDetailOpened", specHelper.PropertyAccessor.Get).and.returnValue(true);
                    let note: any = {
                        originalNote: {
                            Id: "12"
                        },
                        updateNoteIsRead: function () { }
                    };
                    vm.toggleRight(note);
                });
                afterEach(() => {
                    specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteWorkspaceViewModel.prototype, "isNoteDetailOpened", specHelper.PropertyAccessor.Get);
                });
                it("THEN isNoteDetailOpened is changed", () => {
                    expect(spySet).toHaveBeenCalledWith(false);
                });
            });
            describe("WHEN the detail is not open", () => {
                beforeEach(() => {
                    let note: any = {
                        originalNote: {
                            Id: "12"
                        },
                        updateNoteIsRead: function () { }
                    };
                    vm.toggleRight(note);
                });
                it("THEN isNoteDetailOpened is changed", () => {
                    expect(spySet).toHaveBeenCalledWith(true);
                });
            });
        });
    });

    describe("WHEN the user clicks on the group by Modification date button", () => {
        it("THEN, the groupView property of noteListVm is set to NoteGroup.Date", () => {
            vm = <ap.viewmodels.notes.NoteWorkspaceViewModel>$controller("noteWorkspaceViewModel", { $scope: $scope });

            let spy: jasmine.Spy = specHelper.general.spyProperty(ap.viewmodels.notes.NoteListViewModel.prototype, "groupView", specHelper.PropertyAccessor.Set);

            vm.noteListStatusActionClick("groupnotelist.date");
            expect(spy).toHaveBeenCalledWith("Date");
            specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteListViewModel.prototype, "groupView", specHelper.PropertyAccessor.Set);
        });
    });

    describe("WHEN the user clicks on the group by Subcategory button", () => {
        it("THEN, the groupView property of noteListVm is set to NoteGroup.SubCategory", () => {
            vm = <ap.viewmodels.notes.NoteWorkspaceViewModel>$controller("noteWorkspaceViewModel", { $scope: $scope });

            let spy: jasmine.Spy = specHelper.general.spyProperty(ap.viewmodels.notes.NoteListViewModel.prototype, "groupView", specHelper.PropertyAccessor.Set);

            vm.noteListStatusActionClick("groupnotelist.subcategory");
            expect(spy).toHaveBeenCalledWith("SubCategory");
            specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteListViewModel.prototype, "groupView", specHelper.PropertyAccessor.Set);
        });
    });

    describe("WHEN the user clicks on the group by None button", () => {
        it("THEN, the groupView property of noteListVm is set to NoteGroup.None", () => {
            vm = <ap.viewmodels.notes.NoteWorkspaceViewModel>$controller("noteWorkspaceViewModel", { $scope: $scope });

            let spy: jasmine.Spy = specHelper.general.spyProperty(ap.viewmodels.notes.NoteListViewModel.prototype, "groupView", specHelper.PropertyAccessor.Set);

            vm.noteListStatusActionClick("groupnotelist.none");
            expect(spy).toHaveBeenCalledWith("None");
            specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteListViewModel.prototype, "groupView", specHelper.PropertyAccessor.Set);
        });
    });

    describe("WHEN the user clicks on the group by Status button", () => {
        it("THEN, the groupView property of noteListVm is set to NoteGroup.Status", () => {
            vm = <ap.viewmodels.notes.NoteWorkspaceViewModel>$controller("noteWorkspaceViewModel", { $scope: $scope });

            let spy: jasmine.Spy = specHelper.general.spyProperty(ap.viewmodels.notes.NoteListViewModel.prototype, "groupView", specHelper.PropertyAccessor.Set);

            vm.noteListStatusActionClick("groupnotelist.status");
            expect(spy).toHaveBeenCalledWith("Status");
            specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteListViewModel.prototype, "groupView", specHelper.PropertyAccessor.Set);
        });
    });

    describe("WHEN the user clicks on the group by Due date button", () => {
        it("THEN, the groupView property of noteListVm is set to NoteGroup.DueDate", () => {
            vm = <ap.viewmodels.notes.NoteWorkspaceViewModel>$controller("noteWorkspaceViewModel", { $scope: $scope });

            let spy: jasmine.Spy = specHelper.general.spyProperty(ap.viewmodels.notes.NoteListViewModel.prototype, "groupView", specHelper.PropertyAccessor.Set);

            vm.noteListStatusActionClick("groupnotelist.duedate");
            expect(spy).toHaveBeenCalledWith("DueDate");
            specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteListViewModel.prototype, "groupView", specHelper.PropertyAccessor.Set);
        });
    });

    describe("WHEN the user clicks on the group by Room level 2 button", () => {
        it("THEN, the groupView property of noteListVm is set to NoteGroup.Room", () => {
            vm = <ap.viewmodels.notes.NoteWorkspaceViewModel>$controller("noteWorkspaceViewModel", { $scope: $scope });

            let spy: jasmine.Spy = specHelper.general.spyProperty(ap.viewmodels.notes.NoteListViewModel.prototype, "groupView", specHelper.PropertyAccessor.Set);

            vm.noteListStatusActionClick("groupnotelist.room2");
            expect(spy).toHaveBeenCalledWith("Room");
            specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteListViewModel.prototype, "groupView", specHelper.PropertyAccessor.Set);
        });
    });

    describe("WHEN the user clicks on the group by User in charge button", () => {
        it("THEN, the groupView property of noteListVm is set to NoteGroup.InCharge", () => {
            vm = <ap.viewmodels.notes.NoteWorkspaceViewModel>$controller("noteWorkspaceViewModel", { $scope: $scope });

            let spy: jasmine.Spy = specHelper.general.spyProperty(ap.viewmodels.notes.NoteListViewModel.prototype, "groupView", specHelper.PropertyAccessor.Set);

            vm.noteListStatusActionClick("groupnotelist.userincharge");
            expect(spy).toHaveBeenCalledWith("InCharge");
            specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteListViewModel.prototype, "groupView", specHelper.PropertyAccessor.Set);
        });
    });

    describe("Feature: The user clicks on print button of the top bar", () => {
        beforeEach(() => {
            vm = <ap.viewmodels.notes.NoteWorkspaceViewModel>$controller("noteWorkspaceViewModel", { $scope: $scope });
            spyOn(vm.noteListVm, "printReport");
            vm.noteListVm.screenInfo.actionClick("printnotelist");
        });
        it("THEN, the noteListVm.printReport is called", () => {
            expect(vm.noteListVm.printReport).toHaveBeenCalled();
        });
    });

    describe("Feature: The user clicks on refresh button (action) of the top bar", () => {
        let defered;
        beforeEach(() => {
            defered = $q.defer();
            spyGetNote();
            spyOn(Api, "getApiResponseStatList").and.returnValue(defered.promise);
        });
        it("THEN, the handleMainControllerEvents method is called with the action refresh note list", () => {
            vm = <ap.viewmodels.notes.NoteWorkspaceViewModel>$controller("noteWorkspaceViewModel", { $scope: $scope });

            spyOn(vm.noteListVm, "refresh").and.returnValue($q.defer().promise);

            defered.resolve(new ap.services.apiHelper.ApiResponse([]));
            $scope.$apply();

            vm.isNoteDetailOpened = true;
            vm.noteListVm.screenInfo.actionClick("refreshnotelist");

            expect(vm.noteListVm.refresh).toHaveBeenCalled();
        });
        it("AND THEN, the detail was keep visible remain", () => {
            expect(vm.isNoteDetailOpened).toBeTruthy();
        });
    });

    describe("Feature: The user clicks on refresh button (action) of the top bar and there is a current selected note", () => {
        let defStat;
        beforeEach(() => {
            defStat = $q.defer();
            spyOn(Api, "getApiResponseStatList").and.returnValue(defStat.promise);
        });
        afterEach(() => {
            specHelper.general.offSpyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get);
        });
        it("THEN, noteListVm.refresh will be called with the idToSelect", () => {
            let defered = $q.defer();
            let defLoadData = $q.defer();
            let ids = ["b8d13dfc-4124-4340-be59-fbc2b22db6a32", "caeb3a53-94b3-4bea-b724-b686a724e3c5", "a501aee5-4997-4717-96f2-3ddd1f098bef2", "39d0d7b4-0477-400c-a421-405021f670e42"];
            spyGetNote(ids)
            defStat.resolve(new ap.services.apiHelper.ApiResponse([]));

            let vm = <ap.viewmodels.notes.NoteWorkspaceViewModel>$controller("noteWorkspaceViewModel", { $scope: $scope });
            spyOn(vm.noteListVm, "refresh").and.returnValue(defered.promise);

            let note = new ap.models.notes.Note(Utility);
            note.createByJson({ Id: "caeb3a53-94b3-4bea-b724-b686a724e3c5" });

            let userComment = new ap.viewmodels.notes.NoteItemViewModel(Utility, $q, null, new ap.viewmodels.notes.UserCommentItemConstructorParameter(0, note, null, null, Utility, ControllersManager));
            userComment.originalId = "caeb3a53-94b3-4bea-b724-b686a724e3c5"


            defered.resolve();
            vm.noteDetailVm.screenInfo.selectedEntityId = "caeb3a53-94b3-4bea-b724-b686a724e3c5";

            vm.noteListVm.screenInfo.actionClick("refreshnotelist");
            $scope.$apply();

            spyOn(vm.noteListVm.listVm, "selectEntity").and.callFake((id) => {
                expect(id).toEqual("caeb3a53-94b3-4bea-b724-b686a724e3c5");
            });

            $rootScope.$apply();

            expect(vm.noteListVm.refresh).toHaveBeenCalledWith("caeb3a53-94b3-4bea-b724-b686a724e3c5");

        });
    });

    describe("Feature: isEditMode", () => {
        describe("WHEN param is sent to isEditMode", () => {
            let spyEditMode: jasmine.Spy;
            beforeEach(() => {
                specHelper.general.spyProperty(ap.viewmodels.notes.NoteWorkspaceViewModel.prototype, "isEditMode", specHelper.PropertyAccessor.Get).and.callThrough();
                specHelper.general.spyProperty(ap.viewmodels.notes.NoteDetailBaseViewModel.prototype, "isEditMode", specHelper.PropertyAccessor.Get).and.callThrough();
            });
            afterEach(function () {
                specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteWorkspaceViewModel.prototype, "isEditMode", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteDetailBaseViewModel.prototype, "isEditMode", specHelper.PropertyAccessor.Get);
            });
            it("THEN isEditMode takes the new value if different from the old one AND NoteDetailVM takes the same value", () => {
                vm = <ap.viewmodels.notes.NoteWorkspaceViewModel>$controller("noteWorkspaceViewModel", { $scope: $scope });

                expect(vm.isEditMode).toBeFalsy();
                expect(vm.noteDetailVm.isEditMode).toBeFalsy();

                vm.isEditMode = true;

                expect(vm.isEditMode).toBeTruthy();
                expect(vm.noteDetailVm.isEditMode).toBeTruthy();
            });
        });
    });

    describe("Feature: select item", () => {
        let userComment: ap.viewmodels.notes.NoteItemViewModel;
        let note: ap.models.notes.Note;

        beforeEach(() => {
            vm = <ap.viewmodels.notes.NoteWorkspaceViewModel>$controller("noteWorkspaceViewModel", { $scope: $scope });

            note = new ap.models.notes.Note(Utility);
            userComment = new ap.viewmodels.notes.NoteItemViewModel(Utility, $q, null, new ap.viewmodels.notes.UserCommentItemConstructorParameter(null, null, null, null, Utility, ControllersManager));
            userComment.subject = "my new note selected";
            userComment.init(note);
            userComment.originalId = note.Id;

            specHelper.general.spyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get).and.returnValue(userComment);
            spyOn(vm.noteListVm.listVm, "selectEntity");
            vm.selectItem(note.Id);
        });

        afterEach(() => {
            specHelper.general.offSpyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get);
        });

        describe("WHEN selectItem is called and the item to select is already selected", () => {
            it("THEN, the selectedViewModel is set to NULL", () => {
                expect(vm.noteListVm.listVm.selectEntity).toHaveBeenCalledWith(null);
            });
        });
    });

    describe("Feature: isNoteDetailOpened", () => {
        describe("WHEN TRUE is set to isNoteDetailOpened", () => {
            beforeEach(() => {
                vm = <ap.viewmodels.notes.NoteWorkspaceViewModel>$controller("noteWorkspaceViewModel", { $scope: $scope });
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get);
            });
            it("THEN isNoteDetailOpened takes the new value", () => {
                expect(vm.isNoteDetailOpened).toBeFalsy();
                vm.isNoteDetailOpened = true;

                expect(vm.isNoteDetailOpened).toBeTruthy();
            });
        });

        describe("WHEN FALSE is set to isNoteDetailOpened", () => {

            let item: ap.viewmodels.notes.NoteItemViewModel;

            beforeEach(() => {
                vm = <ap.viewmodels.notes.NoteWorkspaceViewModel>$controller("noteWorkspaceViewModel", { $scope: $scope });
                item = new ap.viewmodels.notes.NoteItemViewModel(Utility, $q, vm.noteListVm.listVm, new ap.viewmodels.notes.UserCommentItemConstructorParameter(null, null, null, null, Utility, ControllersManager));

                let json: any = {
                    Id: "9300034-334-320",
                    Subject: "The selected one",
                    MeetingAccessRight: {
                        Level: " ap.models.accessRights.AccessRightLevel.Admin",
                        CanEdit: "true",
                        CanEditPoint: "true",
                        CanDeletePoint: " true",
                        CanAddComment: "true",
                        CanDeleteComment: " true",
                        CanArchiveComment: "true",
                        CanAddDoc: "true",
                        CanEditAllPoint: " true",
                        CanAddPointDocument: " true",
                        CanDeletePointDocument: " true"
                    }
                };
                modelSpecHelper.fillEntityJson(json);
                let note = new ap.models.notes.Note(Utility);
                note.createByJson(json);
                item.init(note);
                specHelper.general.spyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get).and.returnValue(item);

                vm.isNoteDetailOpened = true;

                expect(vm.isNoteDetailOpened).toBeTruthy();

                spyOn(MainController, "goBackToScreen");
                spyOn(vm.noteDetailVm.noteDocumentList, "closePictureViewer");
                vm.isNoteDetailOpened = false;
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get);
            });
            it("THEN isNoteDetailOpened takes the new value", () => {
                expect(vm.isNoteDetailOpened).toBeFalsy();
            });
            it("AND the mainController addscreen is called with the subject of current note", () => {
                expect(MainController.goBackToScreen).toHaveBeenCalled();
            });
            it("AND noteDetail.noteDocumentList.closePictureViewer is called", () => {
                expect(vm.noteDetailVm.noteDocumentList.closePictureViewer).toHaveBeenCalled();
            });
        });

        describe("WHEN TRUE is set to isNoteDetailOpened AND the workspace is opened in the Documents module", () => {

            let item: ap.viewmodels.notes.NoteItemViewModel;

            beforeEach(() => {
                vm = createNoteWorkspace(false);
                item = new ap.viewmodels.notes.NoteItemViewModel(Utility, $q, vm.noteListVm.listVm, new ap.viewmodels.notes.UserCommentItemConstructorParameter(null, null, null, null, Utility, ControllersManager));

                let json: any = {
                    Id: "9300034-334-320",
                    Subject: "The selected one",
                    MeetingAccessRight: {
                        Level: " ap.models.accessRights.AccessRightLevel.Admin",
                        CanEdit: "true",
                        CanEditPoint: "true",
                        CanDeletePoint: " true",
                        CanAddComment: "true",
                        CanDeleteComment: " true",
                        CanArchiveComment: "true",
                        CanAddDoc: "true",
                        CanEditAllPoint: " true",
                        CanAddPointDocument: " true",
                        CanDeletePointDocument: " true"
                    }
                };
                modelSpecHelper.fillEntityJson(json);
                let note = new ap.models.notes.Note(Utility);
                note.createByJson(json);
                item.init(note);
                specHelper.general.spyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get).and.returnValue(item);

                spyOn(MainController, "goBackToScreen");
                spyOn(MainController, "addScreen");

                specHelper.general.spyProperty(ap.viewmodels.notes.NoteDetailBaseViewModel.prototype, "screenInfo", specHelper.PropertyAccessor.Get).and.returnValue({ name: "123" });

                vm.isNoteDetailOpened = true;
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteDetailBaseViewModel.prototype, "screenInfo", specHelper.PropertyAccessor.Get);
            });
            it("THEN isNoteDetailOpened takes the new value", () => {
                expect(vm.isNoteDetailOpened).toBeTruthy();
            });
            it("AND then, goBackToScreen is called to remove the screen of the notes list", () => {
                expect(MainController.goBackToScreen).toHaveBeenCalled();
            });
            it("AND then, addScreen is called to add the screen of the note detail", () => {
                expect(MainController.addScreen).toHaveBeenCalledWith(vm.noteDetailVm.screenInfo, true);
            });
        });

        describe("WHEN FALSE is set to isNoteDetailOpened AND the workspace is opened in the Documents module", () => {

            let item: ap.viewmodels.notes.NoteItemViewModel;

            beforeEach(() => {
                vm = createNoteWorkspace(false);
                item = new ap.viewmodels.notes.NoteItemViewModel(Utility, $q, vm.noteListVm.listVm, new ap.viewmodels.notes.UserCommentItemConstructorParameter(null, null, null, null, Utility, ControllersManager));

                let json: any = {
                    Id: "9300034-334-320",
                    Subject: "The selected one",
                    MeetingAccessRight: {
                        Level: " ap.models.accessRights.AccessRightLevel.Admin",
                        CanEdit: "true",
                        CanEditPoint: "true",
                        CanDeletePoint: " true",
                        CanAddComment: "true",
                        CanDeleteComment: " true",
                        CanArchiveComment: "true",
                        CanAddDoc: "true",
                        CanEditAllPoint: " true",
                        CanAddPointDocument: " true",
                        CanDeletePointDocument: " true"
                    }
                };
                modelSpecHelper.fillEntityJson(json);
                let note = new ap.models.notes.Note(Utility);
                note.createByJson(json);
                item.init(note);
                specHelper.general.spyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get).and.returnValue(item);

                specHelper.general.spyProperty(ap.viewmodels.notes.NoteListViewModel.prototype, "screenInfo", specHelper.PropertyAccessor.Get).and.returnValue({ name: "123" });

                spyOn(MainController, "goBackToScreen");
                spyOn(MainController, "addScreen");

                vm.isNoteDetailOpened = true;

                vm.isNoteDetailOpened = false;
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteListViewModel.prototype, "screenInfo", specHelper.PropertyAccessor.Get);
            });

            it("THEN MainController.goBackToScreen is called", () => {
                expect((<jasmine.Spy>MainController.goBackToScreen).calls.count()).toBe(2);
            });

            it("THEN MainController.addScreen is called", () => {
                expect((<jasmine.Spy>MainController.addScreen).calls.count()).toBe(2);
            });

            it("THEN isNoteDetailOpened takes the new value", () => {
                expect(vm.isNoteDetailOpened).toBeFalsy();
            });
            it("AND then, addScreen is called to add the screen of the notes list", () => {
                expect((<jasmine.Spy>MainController.addScreen).calls.argsFor(1)[0]).toBe(vm.noteListVm.screenInfo);
                expect((<jasmine.Spy>MainController.addScreen).calls.argsFor(1)[1]).toBe(true);
            });
        });

        describe("WHEN a line is selected AND the detail is not opened AND we are in mobile view", () => {
            let setSpy: jasmine.Spy;
            beforeEach(() => {
                specHelper.general.spyProperty(ap.viewmodels.notes.NoteWorkspaceViewModel.prototype, "isNoteDetailOpened", specHelper.PropertyAccessor.Get).and.returnValue(false);
                specHelper.general.spyProperty(ap.controllers.MainController.prototype, "isSmartphone", specHelper.PropertyAccessor.Get).and.returnValue(true);
                setSpy = specHelper.general.spyProperty(ap.viewmodels.notes.NoteWorkspaceViewModel.prototype, "isNoteDetailOpened", specHelper.PropertyAccessor.Set)
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteWorkspaceViewModel.prototype, "isNoteDetailOpened", specHelper.PropertyAccessor.Get)
                specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteWorkspaceViewModel.prototype, "isNoteDetailOpened", specHelper.PropertyAccessor.Set)
                specHelper.general.offSpyProperty(ap.controllers.MainController.prototype, "isSmartphone", specHelper.PropertyAccessor.Get)
            });
            it("THEN, the detail is set to true", () => {
                vm = <ap.viewmodels.notes.NoteWorkspaceViewModel>$controller("noteWorkspaceViewModel", { $scope: $scope });

                spyOn(vm.noteListVm.listVm, "selectEntity");
                spyOn(vm.noteDetailVm, "loadNote");

                vm.selectItem("777-666");

                expect(setSpy).toHaveBeenCalledWith(true);
            });
        });
    });

    describe("Feature: goBackRequested", () => {
        describe("WHEN view model is created", () => {
            it("THEN, the registration on MainController is done for gobackrequested event", () => {
                let onSpy = spyOn(MainController, "on");
                vm = <ap.viewmodels.notes.NoteWorkspaceViewModel>$controller("noteWorkspaceViewModel", { $scope: $scope });

                expect(specHelper.general.checkEventRegCalled(onSpy, "gobackrequested")).toBeDefined();
            });
        });
        describe("WHEN the scope is destroy", () => {
            it("THEN, the unregister of mainController gobackrequested event is done", () => {
                let offSpy = spyOn(MainController, "off");
                vm = <ap.viewmodels.notes.NoteWorkspaceViewModel>$controller("noteWorkspaceViewModel", { $scope: $scope });
                $scope.$destroy();

                expect(specHelper.general.checkEventRegCalled(offSpy, "gobackrequested")).toBeDefined();
            });
        });
        describe("WHEN the mainController raise the event gobackrequested AND the detail is opened", () => {
            let spyProp: jasmine.Spy;
            beforeEach(() => {
                vm = <ap.viewmodels.notes.NoteWorkspaceViewModel>$controller("noteWorkspaceViewModel", { $scope: $scope });
                vm.isNoteDetailOpened = true;
                spyProp = specHelper.general.spyProperty(ap.viewmodels.notes.NoteWorkspaceViewModel.prototype, "isNoteDetailOpened", specHelper.PropertyAccessor.Set);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteWorkspaceViewModel.prototype, "isNoteDetailOpened", specHelper.PropertyAccessor.Set);
            });
            it("THEN, the isNoteDetailOpened is set to false", () => {
                specHelper.general.raiseEvent(MainController, "gobackrequested", undefined);

                expect(spyProp).toHaveBeenCalledWith(false);
            });
        });
        describe("WHEN the mainController raise the event gobackrequested AND the detail is NOT opened", () => {
            let spyProp: jasmine.Spy;
            beforeEach(() => {
                vm = <ap.viewmodels.notes.NoteWorkspaceViewModel>$controller("noteWorkspaceViewModel", { $scope: $scope });
                spyProp = specHelper.general.spyProperty(ap.viewmodels.notes.NoteWorkspaceViewModel.prototype, "isNoteDetailOpened", specHelper.PropertyAccessor.Set);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteWorkspaceViewModel.prototype, "isNoteDetailOpened", specHelper.PropertyAccessor.Set);
            });
            it("THEN, the isNoteDetailOpened is not called", () => {
                specHelper.general.raiseEvent(MainController, "gobackrequested", undefined);

                expect(spyProp).not.toHaveBeenCalled();
            });
        });
    });

    describe("Feature: Fab button is displayed only if the user has the right to add a point", () => {
        beforeEach(() => {
            vm = <ap.viewmodels.notes.NoteWorkspaceViewModel>$controller("noteWorkspaceViewModel", { $scope: $scope });
        });
        describe("WHEN the user has the right to add a point", () => {
            it("THEN fab button is visible", () => {
                spyOn(vm, "canAddPoint").and.returnValue(true);
                specHelper.general.raiseEvent(vm.noteListVm.listVm, "selectedItemChanged", vm.noteListVm.listVm.sourceItems[2]);
                expect(vm.noteListVm.screenInfo.addAction.isVisible).toBeTruthy();
            });
        });
        describe("WHEN the user has not the right to add a point", () => {
            it("THEN fab button is not visible", () => {
                spyOn(vm, "canAddPoint").and.returnValue(false);
                specHelper.general.raiseEvent(vm.noteListVm.listVm, "selectedItemChanged", vm.noteListVm.listVm.sourceItems[2]);
                expect(vm.noteListVm.screenInfo.addAction.isVisible).toBeFalsy();
            });
        });
    });

    describe("Feature: subAddAction visibility", () => {
        beforeEach(() => {
            vm = <ap.viewmodels.notes.NoteWorkspaceViewModel>$controller("noteWorkspaceViewModel", { $scope: $scope });
        });

        describe("WHEN the user has the right to add point", () => {
            describe("AND the current meeting is not system", () => {
                beforeEach(() => {
                    spyOn(vm, "canAddPoint").and.returnValue(true);
                    specHelper.general.spyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get).and.returnValue({
                        IsSystem: false
                    });
                    specHelper.general.raiseEvent(vm.noteListVm.listVm, "selectedItemChanged", vm.noteListVm.listVm.sourceItems[2]);
                });
                afterEach(() => {
                    specHelper.general.offSpyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get);
                });
                it("THEN the 'createfromissutypes' is visible", () => {
                    expect(vm.noteListVm.screenInfo.addAction.getSubAction("note.createfromissutypes").isVisible).toBeTruthy();
                });
            });
            describe("AND the current meeting IS system", () => {
                beforeEach(() => {
                    spyOn(vm, "canAddPoint").and.returnValue(true);
                    specHelper.general.spyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get).and.returnValue({
                        IsSystem: true
                    });
                    specHelper.general.raiseEvent(vm.noteListVm.listVm, "selectedItemChanged", vm.noteListVm.listVm.sourceItems[2]);
                });
                afterEach(() => {
                    specHelper.general.offSpyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get);
                });
                it("THEN the 'createfromissutypes' is NOT visible", () => {
                    expect(vm.noteListVm.screenInfo.addAction.getSubAction("note.createfromissutypes").isVisible).toBeFalsy();
                });
            });
            describe("AND the current meeting IS UNDEFINED", () => {
                beforeEach(() => {
                    spyOn(vm, "canAddPoint").and.returnValue(true);
                    specHelper.general.spyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get).and.returnValue(undefined);
                    specHelper.general.raiseEvent(vm.noteListVm.listVm, "selectedItemChanged", vm.noteListVm.listVm.sourceItems[2]);
                });
                afterEach(() => {
                    specHelper.general.offSpyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get);
                });
                it("THEN the 'createfromissutypes' is NOT visible", () => {
                    expect(vm.noteListVm.screenInfo.addAction.getSubAction("note.createfromissutypes").isVisible).toBeFalsy();
                });
            });
        });

        describe("WHEN the user hasn't the right to add point", () => {
            beforeEach(() => {
                spyOn(vm, "canAddPoint").and.returnValue(false);
                specHelper.general.raiseEvent(vm.noteListVm.listVm, "selectedItemChanged", vm.noteListVm.listVm.sourceItems[2]);
            });
            it("THEN the 'createfromissutypes' is NOT visible", () => {
                expect(vm.noteListVm.screenInfo.addAction.getSubAction("note.createfromissutypes").isVisible).toBeFalsy();
            });
        });
    });

    describe("Feature: Read the comment of a point", () => {
        describe("WHEN selectedItemChanged is raised for the notes list AND the current note details tab is Comments AND the note is not read", () => {
            it("THEN updateNoteIsRead needs to be called", () => {
                specHelper.general.spyProperty(ap.viewmodels.notes.NoteDetailViewModel.prototype, "selectedTab", specHelper.PropertyAccessor.Get).and.returnValue(ap.viewmodels.notes.NoteDetailTabs.Comments);

                vm = <ap.viewmodels.notes.NoteWorkspaceViewModel>$controller("noteWorkspaceViewModel", { $scope: $scope });

                let userComment = new ap.viewmodels.notes.NoteItemViewModel(Utility, $q, null, new ap.viewmodels.notes.UserCommentItemConstructorParameter(null, null, null, null, Utility, ControllersManager));
                spyOn(userComment, "updateNoteIsRead");

                specHelper.general.raiseEvent(vm.noteListVm.listVm, "selectedItemChanged", userComment);

                expect(userComment.updateNoteIsRead).toHaveBeenCalled();
                specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteDetailViewModel.prototype, "selectedTab", specHelper.PropertyAccessor.Get);
            });
        });
        describe("WHEN selectedTabChanged is raised for the note's details AND the new note's details tab is Comments AND the note is not read", () => {
            it("THEN updateNoteIsRead needs to be called", () => {
                vm = <ap.viewmodels.notes.NoteWorkspaceViewModel>$controller("noteWorkspaceViewModel", { $scope: $scope });

                let userComment = new ap.viewmodels.notes.NoteItemViewModel(Utility, $q, null, new ap.viewmodels.notes.UserCommentItemConstructorParameter(null, null, null, null, Utility, ControllersManager));
                spyOn(userComment, "updateNoteIsRead");

                vm.noteDetailVm.selectedTab = ap.viewmodels.notes.NoteDetailTabs.Attachments;

                specHelper.general.spyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get).and.returnValue(userComment);
                vm.noteDetailVm.selectedTab = ap.viewmodels.notes.NoteDetailTabs.Comments;

                expect(userComment.updateNoteIsRead).toHaveBeenCalled();

                specHelper.general.offSpyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get);
            });
        });
    });

    describe("Feature: DeleteNote", () => {
        let defStat;
        beforeEach(() => {
            defStat = $q.defer();
            spyOn(Api, "getApiResponseStatList").and.returnValue(defStat.promise);
            accessrightsSpy();
        });
        describe("When the NoteController.notedeleted event was fired", function () {
            beforeEach(() => {
                let defLoadData = $q.defer();
                defStat.resolve(new ap.services.apiHelper.ApiResponse([]));
                spyOn(Api, "getEntityIds").and.returnValue(_deferred.promise);
                spyOn(ControllersManager.listController, "getEntityIds").and.callThrough();
                spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue($q.defer().promise);
                vm = <ap.viewmodels.notes.NoteWorkspaceViewModel>$controller("noteWorkspaceViewModel", { $scope: $scope });

                vm.noteListVm.listVm.loadIds();

                let ids = ["b8d13dfc-4124-4340-be59-fbc2b22db6a32", "caeb3a53-94b3-4bea-b724-b686a724e3c5-2", "a501aee5-4997-4717-96f2-3ddd1f098bef2", "39d0d7b4-0477-400c-a421-405021f670e42"];
                _deferred.resolve(new ap.services.apiHelper.ApiResponse(ids));
                $rootScope.$apply();

                spyOn(Api, "getEntityList").and.callFake(function () {
                    return defLoadData.promise;
                });
                vm.noteListVm.listVm.loadPage(0);

                defLoadData.resolve({ data: [dataNotes[0], dataNotes[1], dataNotes[2], dataNotes[3]] });
                $rootScope.$apply();
            });

            it("If the removed item is not the last item of the list, then the the method selectItem must be called", function () {
                vm.selectItem(dataNotes[0].Id/*"b360cb6d-ca54-4b93-a564-a469274eb68a"*/ /*dataNotes[0].Id*/);
                let deletedNote: ap.models.notes.Note = new ap.models.notes.Note(Utility);
                deletedNote.createByJson({ Id: dataNotes[0].Id });
                spyOn(vm.noteListVm.listVm.selectedViewModel.originalEntity, "updateEntityPropsOnly");
                spyOn(vm, "selectItem").and.returnValue($q.defer().promise);
                specHelper.general.raiseEvent(NoteController, "notedeleted", new ap.controllers.NoteBaseUpdatedEvent([deletedNote]));

                $rootScope.$apply();
                expect(vm.selectItem).toHaveBeenCalled();
            });
            it("If the removed item is the last item of the list, then the the method selectItem must be called", function () {
                vm.selectItem(dataNotes[3].Id/*"39d0d7b4-0477-400c-a421-405021f670e4"*/ /*dataNotes[3].Id*/);
                let deletedNote: ap.models.notes.Note = new ap.models.notes.Note(Utility);
                deletedNote.createByJson({ Id: dataNotes[3].Id });
                spyOn(vm, "selectItem").and.returnValue($q.defer().promise);
                spyOn(vm.noteListVm.listVm.selectedViewModel.originalEntity, "updateEntityPropsOnly");
                specHelper.general.raiseEvent(NoteController, "notedeleted", new ap.controllers.NoteBaseUpdatedEvent([deletedNote]));
                $rootScope.$apply();
                expect(vm.selectItem).toHaveBeenCalled();
            });
        });
    });

    describe("Feature: Archive/UnArchive note", () => {
        let defStat;
        let criterionsSpy: jasmine.Spy;
        let criterions: ap.misc.Criterion[];
        beforeEach(() => {
            defStat = $q.defer();
            spyOn(Api, "getApiResponseStatList").and.returnValue(defStat.promise);
            criterions = [];
            criterionsSpy = specHelper.general.spyProperty(ap.misc.MainSearchInfo.prototype, "criterions", specHelper.PropertyAccessor.Get).and.callFake(() => {
                return criterions;
            });
            spyGetNote();
            vm = <ap.viewmodels.notes.NoteWorkspaceViewModel>$controller("noteWorkspaceViewModel", { $scope: $scope });

            spyOn(vm.noteListVm.screenInfo.mainSearchInfo, "getPredefinedFilterCriterions").and.callFake(() => {
                if (criterions.length === 0) return null;
                return criterions;
            });
        });
        afterEach(() => {
            specHelper.general.offSpyProperty(ap.misc.MainSearchInfo.prototype, "criterions", specHelper.PropertyAccessor.Get);
        });
        describe("When the NoteController.notearchived event fired and current selected filter is All ", () => {
            it("THEN the method noteListVm.listVm.updateNote must be called", () => {
                spyOn(vm.noteListVm.listVm, "updateItem");
                specHelper.general.raiseEvent(NoteController, "noteupdated", new ap.controllers.NoteBaseUpdatedEvent([new ap.models.notes.Note(Utility)]));

                $rootScope.$apply();
                expect(vm.noteListVm.listVm.updateItem).toHaveBeenCalled();
            });
        });
        describe("When the NoteController.noteunarchived event fired and current selected filter is All ", () => {
            it("THEN the method noteListVm.listVm.updateNote must be called", () => {
                spyOn(vm.noteListVm.listVm, "updateItem");

                specHelper.general.raiseEvent(NoteController, "noteupdated", new ap.controllers.NoteBaseUpdatedEvent([new ap.models.notes.Note(Utility)]));
                $rootScope.$apply();
                expect(vm.noteListVm.listVm.updateItem).toHaveBeenCalled();
            });
        });
    });

    describe("Feature: Display toast on note added", () => {

        let addedNote: ap.models.notes.Note;
        let defStat;
        beforeEach(() => {
            defStat = $q.defer();
            spyOn(Api, "getApiResponseStatList").and.returnValue(defStat.promise);
            spyGetNote();
            vm = <ap.viewmodels.notes.NoteWorkspaceViewModel>$controller("noteWorkspaceViewModel", { $scope: $scope });
            addedNote = new ap.models.notes.Note(Utility);
            addedNote.Comments = [];
            addedNote.Comments.push(new ap.models.notes.NoteComment(Utility));

            let defStatus = $q.defer();
            spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue(defStatus.promise);

            spyOn(vm, "selectItem");
        });

        describe("WHEN noteadded event is raised from noteControler", () => {
            describe("WHEN, it's a copy", () => {
                beforeEach(() => {
                    let deferred = $q.defer();
                    spyOn(Api, "getApiResponse");
                    spyOn(MainController, "showToast").and.returnValue(deferred.promise);

                    addedNote.Subject = "My new added note";
                    addedNote.Code = "1.233";
                    let meeting = new ap.models.meetings.Meeting(Utility);
                    meeting.Title = "Title"
                    addedNote.Meeting = meeting;

                    specHelper.general.raiseEvent(NoteController, "noteadded", new ap.controllers.NoteBaseUpdatedEvent([addedNote], ["IsCopied"]));

                    $rootScope.$apply();
                });
                it("THEN, $mdToast.show is called to display a toast notification", () => {
                    expect(MainController.showToast).toHaveBeenCalledWith("app.note.copied", addedNote, "View", ['Title']);
                    expect(vm.selectItem).not.toHaveBeenCalled();
                });
            });
            describe("WHEN, the note is created", () => {
                beforeEach(() => {
                    let deferred = $q.defer();
                    spyOn(MainController, "showToast").and.returnValue(deferred.promise);

                    addedNote.Subject = "My new added note";
                    addedNote.Code = "1.233";

                    deferred.resolve(addedNote);

                    specHelper.general.raiseEvent(NoteController, "noteadded", new ap.controllers.NoteBaseUpdatedEvent([addedNote]));

                    $rootScope.$apply();
                });
                it("THEN, $mdToast.show is called to display a toast notification", () => {
                    expect(MainController.showToast).toHaveBeenCalledWith("app.notes.point_just_created", addedNote, "View the point", ["1.233", "My new added note"]);
                    expect(vm.selectItem).toHaveBeenCalled();
                });
            });
        });
    });

    describe("Feature: selectItem", () => {

        let spyIsSmartphone: jasmine.Spy;
        let spyDetailsOpened: jasmine.Spy;
        let defStat: angular.IDeferred<any>;

        beforeEach(() => {
            defStat = $q.defer();
            spyOn(Api, "getApiResponseStatList").and.returnValue(defStat.promise);

            spyIsSmartphone = specHelper.general.spyProperty(ap.controllers.MainController.prototype, "isSmartphone", specHelper.PropertyAccessor.Get);
        });

        afterEach(() => {
            specHelper.general.offSpyProperty(ap.controllers.MainController.prototype, "isSmartphone", specHelper.PropertyAccessor.Get);
            specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteWorkspaceViewModel.prototype, "isNoteDetailOpened", specHelper.PropertyAccessor.Set);
        });

        describe("WHEN the noteWorskspace iscreated for the note module AND", () => {
            beforeEach(() => {
                vm = <ap.viewmodels.notes.NoteWorkspaceViewModel>$controller("noteWorkspaceViewModel", { $scope: $scope });
                spyDetailsOpened = specHelper.general.spyProperty(ap.viewmodels.notes.NoteWorkspaceViewModel.prototype, "isNoteDetailOpened", specHelper.PropertyAccessor.Set);

                spyOn(vm.noteListVm.listVm, "selectEntity");
            });

            describe("WHEN selectItem is called with the Id of a note MainController.isSmartphone === FALSE", () => {
                it("THEN listVm.selectEntity is called AND ", () => {
                    spyIsSmartphone.and.returnValue(false);

                    vm.selectItem("2");

                    expect(vm.noteListVm.listVm.selectEntity).toHaveBeenCalledWith("2");
                    expect(spyDetailsOpened).not.toHaveBeenCalled();
                });
            });

            describe("WHEN selectItem is called with the Id of a note MainController.isSmartphone === TRUE", () => {
                it("THEN listVm.selectEntity is called AND ", () => {
                    spyIsSmartphone.and.returnValue(true);

                    vm.selectItem("2");

                    expect(vm.noteListVm.listVm.selectEntity).toHaveBeenCalledWith("2");
                    expect(spyDetailsOpened).toHaveBeenCalledWith(true);
                });
            });
        });

        describe("WHEN the noteWorkspace is created outside the note module AND", () => {

            beforeEach(() => {
                vm = createNoteWorkspace(false);
                spyOn(vm.noteListVm.listVm, "selectEntity");
                spyDetailsOpened = specHelper.general.spyProperty(ap.viewmodels.notes.NoteWorkspaceViewModel.prototype, "isNoteDetailOpened", specHelper.PropertyAccessor.Set);
            });

            describe("WHEN the selectItem methodis called", () => {
                it("THEN selectEntity is not called", () => {
                    expect(vm.noteListVm.listVm.selectEntity).not.toHaveBeenCalled();
                });

                it("THEN selectEntity is not called", () => {
                    expect(spyDetailsOpened).not.toHaveBeenCalled();
                });
            });
        });
    });

    describe("Feature: EditNote", () => {

        let note: ap.models.notes.Note;
        let defLoad: angular.IDeferred<any>;
        let defStat: angular.IDeferred<any>;
        beforeEach(() => {
            defStat = $q.defer();
            spyOn(Api, "getApiResponseStatList").and.returnValue(defStat.promise);
            spyOn(ControllersManager.listController, "getEntityIds").and.returnValue($q.defer().promise);

            let meetingAccessRights: ap.models.accessRights.AccessRight[];
            let defAccessRight = $q.defer();
            spyOn(AccessRightController, "geAccessRights").and.returnValue(defAccessRight.promise);

            let accessRights = [{ Id: "M1", ModuleName: "Meeting", Level: ap.models.accessRights.AccessRightLevel.Admin, CanAddPoint: true }
                , { Id: "M2", ModuleName: "Meeting", Level: ap.models.accessRights.AccessRightLevel.Manager, CanAddPoint: true }
                , { Id: "M3", ModuleName: "Meeting", Level: ap.models.accessRights.AccessRightLevel.Contributor }
                , { Id: "M4", ModuleName: "Meeting", Level: ap.models.accessRights.AccessRightLevel.Guest }
                , { Id: "M5", ModuleName: "Meeting", Level: ap.models.accessRights.AccessRightLevel.Subcontractor }
            ];
            meetingAccessRights = [];
            for (let i = 0; i < accessRights.length; i++) {
                let meetingAccessRight: ap.models.accessRights.MeetingAccessRight = new ap.models.accessRights.MeetingAccessRight(Utility);
                meetingAccessRight.createByJson(accessRights[i]);
                meetingAccessRights.push(meetingAccessRight);
            }
            defAccessRight.resolve(accessRights);

            let defMeetingIds = $q.defer();
            let defMeetingData = $q.defer();

            let meetingIds = ["M1", "M2", "M3"];
            defMeetingIds.resolve(new ap.services.apiHelper.ApiResponse(meetingIds));

            let meetings = [{ Id: "M1" }, { Id: "M2" }, { Id: "M3" }];
            defMeetingData.resolve(new ap.services.apiHelper.ApiResponse(meetings));

            let defActivity: ng.IDeferred<any> = $q.defer();
            let defActivityIds: ng.IDeferred<any> = $q.defer();
            spyOn(Api, "getApiResponse").and.callFake((url: string) => {
                if (url.indexOf("rest/activitylogsids") === 0)
                    return defActivityIds.promise;

                if (url.indexOf("rest/activitylogs") === 0)
                    return defActivity.promise;

                if (url.indexOf("rest/accessrights") === 0)
                    return defAccessRight.promise;

                if (url.indexOf("rest/meetingsids") === 0)
                    return defMeetingIds.promise;

                if (url.indexOf("rest/meetings") === 0)
                    return defMeetingData.promise;

                return null;
            });

            vm = <ap.viewmodels.notes.NoteWorkspaceViewModel>$controller("noteWorkspaceViewModel", { $scope: $scope });

            note = new ap.models.notes.Note(Utility);
            note.Meeting = new ap.models.meetings.Meeting(Utility);
            let userComment = new ap.viewmodels.notes.NoteItemViewModel(Utility, $q, null, new ap.viewmodels.notes.UserCommentItemConstructorParameter(null, null, null, null, Utility, ControllersManager));
            specHelper.general.spyProperty(ap.viewmodels.notes.NoteWorkspaceViewModel.prototype, "selectedNoteViewModel", specHelper.PropertyAccessor.Get).and.returnValue({ originalNote: note });

            specHelper.general.spyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get).and.returnValue(userComment);

            defLoad = $q.defer();
            spyOn(vm.noteDetailVm, "loadNote").and.returnValue(defLoad.promise);
        });

        afterEach(() => {
            specHelper.general.offSpyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get);
            specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteWorkspaceViewModel.prototype, "selectedNoteViewModel", specHelper.PropertyAccessor.Get);
        });
        describe("WHEN the event NoteController.editnoterequest is raised AND the note is not yet loaded", () => {
            beforeEach(() => {
                specHelper.general.raiseEvent(NoteController, "editnoterequest", note);
            });
            it("THEN, noteDetailVm.load is called", () => {

                expect(vm.noteDetailVm.loadNote).toHaveBeenCalledWith(note.Id);
            });
            it("THEN, MdDialog.show is called to display the addNoteDialog popup", () => {
                defLoad.resolve(null);
                $rootScope.$apply();

                expect($mdDialog.show).toHaveBeenCalled();
            });
        });
        describe("WHEN the event NoteController.editnoterequest is raised AND the note have been loaded", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.viewmodels.notes.NoteDetailViewModel.prototype, "note", specHelper.PropertyAccessor.Get).and.returnValue(note);

            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteDetailViewModel.prototype, "note", specHelper.PropertyAccessor.Get);
            });
            it("THEN, noteDetailVm.load is not called", () => {
                specHelper.general.raiseEvent(NoteController, "editnoterequest", note);
                expect(vm.noteDetailVm.loadNote).not.toHaveBeenCalled();
            });
            it("THEN, MdDialog.show is called to display the addNoteDialog popup", () => {
                specHelper.general.raiseEvent(NoteController, "editnoterequest", note);
                expect($mdDialog.show).toHaveBeenCalled();
            });

            it("AND THEN, noteDetailVm.load is called if noteDetailVm.needReloadNote = true", () => {
                specHelper.general.spyProperty(ap.viewmodels.notes.NoteDetailBaseViewModel.prototype, "needReloadEntity", specHelper.PropertyAccessor.Get).and.returnValue(true);
                specHelper.general.raiseEvent(NoteController, "editnoterequest", note);
                expect(vm.noteDetailVm.loadNote).toHaveBeenCalledWith(note.Id);
                specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteDetailBaseViewModel.prototype, "needReloadEntity", specHelper.PropertyAccessor.Get);
            });
        });
    });

    describe("Feature: Upload document", () => {
        let defStat: angular.IDeferred<any>;
        let defLoadData: angular.IDeferred<any>;

        beforeEach(() => {
            defLoadData = $q.defer();
            defStat = $q.defer();

            spyOn(Api, "getApiResponseStatList").and.returnValue(defStat.promise);
            spyOn(Api, "getEntityIds").and.returnValue(_deferred.promise);
            spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue($q.defer().promise);
            spyOn(Api, "getEntityList").and.callFake(function () {
                return defLoadData.promise;
            });

            vm = <ap.viewmodels.notes.NoteWorkspaceViewModel>$controller("noteWorkspaceViewModel", { $scope: $scope });

            vm.noteListVm.listVm.loadIds();

            spyOn(vm.noteListVm.listVm, "getEntityById").and.returnValue({ hasAttachment: false });

            let ids = ["b8d13dfc-4124-4340-be59-fbc2b22db6a32", "caeb3a53-94b3-4bea-b724-b686a724e3c5-2", "a501aee5-4997-4717-96f2-3ddd1f098bef2", "39d0d7b4-0477-400c-a421-405021f670e42"];
            _deferred.resolve(new ap.services.apiHelper.ApiResponse(ids));
            $rootScope.$apply();

            vm.noteListVm.listVm.loadPage(0);
            defLoadData.resolve({ data: [dataNotes[0], dataNotes[1], dataNotes[2], dataNotes[3]] });
            $rootScope.$apply();

            specHelper.general.spyProperty(ap.viewmodels.notes.NoteDetailViewModel.prototype, "note", specHelper.PropertyAccessor.Get).and.returnValue({ Id: "1" });
        });
        afterEach(() => {
            specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteDetailViewModel.prototype, "note", specHelper.PropertyAccessor.Get);
        });
        describe("WHEN the action upload doc is clicked AND selected note is null", () => {
            it("THEN the updloadNoteDocuments is not called", () => {
                vm.selectItem("b8d13dfc-4124");

                spyOn(NoteController, "uploadNoteDocuments").and.callThrough();

                expect(NoteController.uploadNoteDocuments).not.toHaveBeenCalled();
            });
        });

        describe("WHEN the action upload doc is clicked AND selected note is not null and user dont have access right to upload document", () => {
            let uploadDefer: angular.IDeferred<any>;
            let fileCountCalled = 0;
            let files: File[];
            beforeEach(() => {
                uploadDefer = $q.defer();
                vm.selectItem(dataNotes[0].Id);

                files = [
                    <File>{ name: "file1.png" },
                    <File>{ name: "file2.png" },
                ];

                spyOn(NoteController, "uploadNoteDocuments").and.callFake((note: ap.models.notes.Note, files: File[], folderId: string) => {
                    fileCountCalled = files.length;
                    return uploadDefer.promise;
                });

                spyOn(MainController, "showMessageKey");

                fakeAceess.CanUploadDoc = false;

                let targetVm = <ap.viewmodels.notes.NoteItemViewModel>vm.noteListVm.listVm.sourceItems[0];
                specHelper.general.raiseEvent(NoteController, "adddocumentrequest", new ap.controllers.AddNoteDocumentRequestedEvent(targetVm.originalNote, files));

                uploadDefer.resolve();
                $rootScope.$apply();
            });

            it("THEN the updloadNoteDocuments is called to upload to private photo folder and the selected them then = Attachments", () => {
                expect(NoteController.uploadNoteDocuments).toHaveBeenCalled();
            });

            it("THEN, the current tab is Attachments", () => {
                expect(vm.noteDetailVm.selectedTab).toEqual(ap.viewmodels.notes.NoteDetailTabs.Attachments);
            });
            it("THEN the updloadNoteDocuments is called to upload 2 files", () => {
                expect(fileCountCalled).toEqual(2);
            });
            it("THEN the updloadNoteDocuments is called to upload to private photo folder ", () => {
                expect(NoteController.uploadNoteDocuments).toHaveBeenCalledWith(dataNotes[0], files, MainController.currentProject().PhotoFolderId);
            });
        });

        describe("WHEN the event filesdropped is raised from the noteDetailVm and user DON'T have access right to upload document", () => {
            it("THEN, the uploadDoc is called with these files upload to private photo folder and the selected them then = Attachments", () => {
                vm.selectItem(dataNotes[0].Id);
                let files: File[] = [
                    <File>{ name: "file1.png" },
                    <File>{ name: "file2.png" },
                ];
                let uploadDefer = $q.defer();
                spyOn(NoteController, "uploadNoteDocuments").and.callFake((note: ap.models.notes.Note, files: File[], folderId: string) => {
                    expect(files).toEqual(files);
                    return uploadDefer.promise;
                });

                fakeAceess.CanUploadDoc = false;
                specHelper.general.raiseEvent(vm.noteDetailVm, "filesdropped", files);
                expect(NoteController.uploadNoteDocuments).toHaveBeenCalled();

                uploadDefer.resolve();
                $rootScope.$apply();
                expect(vm.noteDetailVm.selectedTab).toEqual(ap.viewmodels.notes.NoteDetailTabs.Attachments);
            });
        });

        describe("WHEN the action upload doc is clicked AND selected note is not null and user HAVE access right to upload document", () => {
            it("THEN the $mdDialog.show is called them select folder is called to upload the file to folderid and the selected them then = Attachments", () => {
                let calledOptions: ng.material.IDialogOptions = null;
                vm.selectItem(dataNotes[0].Id);

                let files: File[] = [
                    <File>{ name: "file1.png" },
                    <File>{ name: "file2.png" },
                ];

                let dialogDefer = $q.defer();
                let def = $q.defer();
                let idsDefered = $q.defer();
                let listDefered = $q.defer();

                spyOn(Api, "getApiResponse").and.callFake(function (url) {
                    if (url === "rest/projectfolderidsandlevels") {
                        return idsDefered.promise;
                    } else {
                        return def.promise;
                    }
                });

                let response = new ap.services.apiHelper.ApiResponse([]);
                idsDefered.resolve(response);
                def.resolve(response);

                let spy = <jasmine.Spy>$mdDialog.show;
                spy.and.callFake((dialogOptions: ng.material.IDialogOptions) => {
                    expect(dialogOptions.templateUrl).toBe("me/PartialView?module=Document&name=FolderSelector");
                    expect(dialogOptions.clickOutsideToClose).toBeFalsy();
                    expect(dialogOptions.fullscreen).toBeTruthy();
                    calledOptions = dialogOptions;
                    return dialogDefer.promise;
                });

                fakeAceess.CanUploadDoc = true;
                $scope.$apply();

                let targetVm = <ap.viewmodels.notes.NoteItemViewModel>vm.noteListVm.listVm.sourceItems[0];
                specHelper.general.raiseEvent(NoteController, "adddocumentrequest", new ap.controllers.AddNoteDocumentRequestedEvent(targetVm.originalNote, files));

                let f: Function = <Function>calledOptions.controller;
                f.apply(calledOptions, [$scope, $timeout]);

                let folderSelector = <ap.viewmodels.folders.FolderSelectorViewModel>$scope["folderSelectorVm"];
                let docWorkSpace = <ap.viewmodels.documents.DocumentWorkspaceViewModel>$scope["documentWorkspaceVm"];

                $scope.$apply();

                let folderVM = new ap.viewmodels.folders.FolderItemViewModel(Utility, $q);
                let folder = new ap.models.projects.Folder(Utility);
                folder.createByJson({ Id: "123" });
                folderVM.init(folder);

                let uploadDefer = $q.defer();
                docWorkSpace.folderListVm.listVm.sourceItems = [folderVM];
                spyOn(NoteController, "uploadNoteDocuments").and.callFake((note, files, folderId) => {
                    expect(folderId).toEqual("123");
                    return uploadDefer.promise;
                });

                docWorkSpace.folderListVm.listVm.selectedViewModel = folderVM
                $scope.$apply();

                folderSelector.mainActionClick();

                dialogDefer.resolve();

                expect($mdDialog.show).toHaveBeenCalled();
                expect(NoteController.uploadNoteDocuments).toHaveBeenCalled();

                uploadDefer.resolve();
                $rootScope.$apply();
                expect(vm.noteDetailVm.selectedTab).toEqual(ap.viewmodels.notes.NoteDetailTabs.Attachments);
            });
        });
    });

    describe("Feature: HandleAddActions event", () => {

        let addNewNoteDefer: angular.IDeferred<ap.models.notes.Note>;
        beforeEach(() => {
            let defLoadData = $q.defer();
            addNewNoteDefer = $q.defer();
            spyOn(Api, "getEntityIds").and.returnValue(_deferred.promise);
            vm = <ap.viewmodels.notes.NoteWorkspaceViewModel>$controller("noteWorkspaceViewModel", { $scope: $scope });
            spyOn(vm, "showAddEditDialog");
            spyOn(vm.noteListVm.listVm, "loadIds");
            spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue($q.defer().promise);

            spyOn(vm, "canAddComment").and.returnValue(true);
            spyOn(vm, "canImportDocument").and.returnValue(true);
            spyOn(ap.viewmodels.notes.NoteDetailViewModel.prototype, "addNote").and.returnValue($q.when());
        });

        describe("WHEN addactionclicked is raised with 'note.addpoint' and editMode is false and the user can add a point", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.controllers.MainController.prototype, "canAddPointOnProject", specHelper.PropertyAccessor.Get).and.returnValue(true);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.controllers.MainController.prototype, "canAddPointOnProject", specHelper.PropertyAccessor.Get);
            });
            it("THEN, showAddEditDialog is called", () => {
                specHelper.general.raiseEvent(vm.noteListVm.screenInfo, "addactionclicked", new ap.controllers.AddActionClickEvent("note.addpoint"));
                addNewNoteDefer.resolve();
                $rootScope.$apply();

                expect(vm.showAddEditDialog).toHaveBeenCalled();
            });
        });

        describe("WHEN addactionclicked is raised with 'note.addpoint' and editMode is false and the user cannot add a point", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.controllers.MainController.prototype, "canAddPointOnProject", specHelper.PropertyAccessor.Get).and.returnValue(false);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.controllers.MainController.prototype, "canAddPointOnProject", specHelper.PropertyAccessor.Get);
            });
            it("THEN, showAddEditDialog is not called", () => {
                specHelper.general.raiseEvent(vm.noteListVm.screenInfo, "addactionclicked", new ap.controllers.AddActionClickEvent("note.addpoint"));

                addNewNoteDefer.resolve();
                $rootScope.$apply();

                expect(vm.showAddEditDialog).not.toHaveBeenCalled();
            });
        });
    });

    describe("Feature: Import document", () => {
        beforeEach(() => {
            let defLoadData = $q.defer();

            let defStat = $q.defer();

            defStat = $q.defer();
            spyOn(Api, "getApiResponseStatList").and.returnValue(defStat.promise);
            spyOn(ControllersManager.listController, "getEntityIds").and.callThrough();
            spyOn(Api, "getEntityIds").and.returnValue(_deferred.promise);
            spyOn(Api, "getApiResponse").and.returnValue($q.defer().promise);
            vm = <ap.viewmodels.notes.NoteWorkspaceViewModel>$controller("noteWorkspaceViewModel", { $scope: $scope });
            spyOn(vm.noteListVm.listVm, "loadIds").and.callThrough();
            spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue($q.defer().promise);

            vm.noteListVm.listVm.loadIds();

            let ids = ["b8d13dfc-4124-4340-be59-fbc2b22db6a32", "caeb3a53-94b3-4bea-b724-b686a724e3c5-2", "a501aee5-4997-4717-96f2-3ddd1f098bef2", "39d0d7b4-0477-400c-a421-405021f670e42"];
            _deferred.resolve(new ap.services.apiHelper.ApiResponse(ids));
            $rootScope.$apply();

            spyOn(Api, "getEntityList").and.callFake(function () {
                return defLoadData.promise;
            });
            vm.noteListVm.listVm.loadPage(0);

            defLoadData.resolve({ data: [dataNotes[0], dataNotes[1], dataNotes[2], dataNotes[3]] });
            $rootScope.$apply();
        });

        describe("WHEN the method importDocument was called and the user select some document", () => {
            it("THEN, the notecontroller.importDocument method will be called and selected tab will be 'Attachments'", () => {

                let dataDocuments = [
                    {
                        Id: "b360cb6d-ca54-4b93-a564-a469274eb68a",
                        Name: "House 1"
                    },
                    {
                        Id: "35a2c5d6-0e00-43e9-ada8-ce4f3fadb16e",
                        Name: "House 2"
                    }
                ];

                let selectedDocuments: ap.viewmodels.documents.DocumentItemViewModel[] = [];

                let document1: ap.models.documents.Document = new ap.models.documents.Document(Utility);
                document1.createByJson(dataDocuments[0]);
                document1.Author = new ap.models.actors.User(Utility);
                document1.Author.createByJson({ Id: "User1" });


                let document2: ap.models.documents.Document = new ap.models.documents.Document(Utility);
                document2.createByJson(dataDocuments[1]);
                document2.Author = new ap.models.actors.User(Utility);
                document2.Author.createByJson({ Id: "User1" });

                let item1: ap.viewmodels.documents.DocumentItemViewModel = new ap.viewmodels.documents.DocumentItemViewModel(Utility, $q, null, new ap.viewmodels.documents.DocumentItemParameter(0, document1, null, null, Utility, DocumentController, MainController, ControllersManager.meetingController));
                item1.init(document1);

                let item2: ap.viewmodels.documents.DocumentItemViewModel = new ap.viewmodels.documents.DocumentItemViewModel(Utility, $q, null, new ap.viewmodels.documents.DocumentItemParameter(0, document2, null, null, Utility, DocumentController, MainController, ControllersManager.meetingController));
                item2.init(document2);

                selectedDocuments.push(item1);
                selectedDocuments.push(item2);

                let defInportDocs = $q.defer();
                spyOn(vm, "canImportDocument").and.returnValue(true);
                spyOn(NoteController, "importDocuments").and.returnValue(defInportDocs.promise);

                specHelper.general.raiseEvent(NoteController, "importdocumentrequest", dataNotes[0]);

                mdDialogDeferred.resolve(selectedDocuments);
                defInportDocs.resolve();

                $rootScope.$apply();

                expect($mdDialog.show).toHaveBeenCalled();
                expect(NoteController.importDocuments).toHaveBeenCalledWith(vm.noteListVm.listVm.selectedViewModel.originalEntity, [document1, document2]);
                expect(vm.noteDetailVm.selectedTab).toEqual(ap.viewmodels.notes.NoteDetailTabs.Attachments);
            });
        });
    });

    describe("Feature: Add point", () => {
        describe("WHEN the user is not able to add a point on a project", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.controllers.MainController.prototype, "canAddPointOnProject", specHelper.PropertyAccessor.Get).and.returnValue(false);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.controllers.MainController.prototype, "canAddPointOnProject", specHelper.PropertyAccessor.Get);
            });
            it("THEN the FAB button main action doesn't nothing, only subactions are utils", () => {
                vm = <ap.viewmodels.notes.NoteWorkspaceViewModel>$controller("noteWorkspaceViewModel", { $scope: $scope });

                // force the calculateAccessRight method to be called
                specHelper.general.raiseEvent(vm.noteListVm.listVm, "itemsUpdated", null);

                let addActions = vm.noteListVm.screenInfo.addAction;
                expect(addActions.hasOnlySubActions).toBeTruthy();
            });
        });

        describe("WHEN the user is not able to add a point on a project", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.controllers.MainController.prototype, "canAddPointOnProject", specHelper.PropertyAccessor.Get).and.returnValue(true);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.controllers.MainController.prototype, "canAddPointOnProject", specHelper.PropertyAccessor.Get);
            });
            it("THEN the FAB buttonis actif", () => {

                vm = <ap.viewmodels.notes.NoteWorkspaceViewModel>$controller("noteWorkspaceViewModel", { $scope: $scope });

                // force the calculateAccessRight method to be called
                specHelper.general.raiseEvent(vm.noteListVm.listVm, "itemsUpdated", null);

                let addActions = vm.noteListVm.screenInfo.addAction;
                expect(addActions.hasOnlySubActions).toBeFalsy();
            });
        });
    });

    describe("Feature: clearDetails", () => {
        let defStat;
        beforeEach(() => {
            specHelper.general.spyProperty(ap.viewmodels.notes.NoteWorkspaceViewModel.prototype, "isNoteDetailOpened", specHelper.PropertyAccessor.Get).and.returnValue(true);

            defStat = $q.defer();
            spyOn(Api, "getApiResponseStatList").and.returnValue(defStat.promise);
            let ids = ["b8d13dfc-4124-4340-be59-fbc2b22db6a32", "caeb3a53-94b3-4bea-b724-b686a724e3c5-2", "a501aee5-4997-4717-96f2-3ddd1f098bef2", "39d0d7b4-0477-400c-a421-405021f670e42"];
            spyGetNote(ids, [dataNotes[0], dataNotes[1], dataNotes[2], dataNotes[3]]);
            vm = <ap.viewmodels.notes.NoteWorkspaceViewModel>$controller("noteWorkspaceViewModel", { $scope: $scope });
            defStat.resolve(new ap.services.apiHelper.ApiResponse([]));
            spyOn(vm.noteListVm.listVm, "loadIds").and.callThrough();
            spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue($q.defer().promise);
            vm.noteListVm.listVm.loadIds();
            $rootScope.$apply();
            vm.noteListVm.listVm.loadPage(0);
            $rootScope.$apply();
            vm.isNoteDetailOpened = true;
        });

        afterEach(() => {
            specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteWorkspaceViewModel.prototype, "isNoteDetailOpened", specHelper.PropertyAccessor.Get);
        });

        describe("WHEN the 'beginloaddata' event of the NoteListViewModel was fired ", () => {
            it("THEN methods clearDetails will call and then noteDetailsViewModel.clear method will called", () => {
                spyOn(vm.noteDetailVm, "clear");

                specHelper.general.raiseEvent(vm.noteListVm, "beginloaddata", null);

                $rootScope.$apply();

                expect(vm.noteDetailVm.clear).toHaveBeenCalled();
            });
        });
    });

    describe("Feature: notecommentAddedHandler", () => {
        let defStat;
        beforeEach(() => {

            defStat = $q.defer();
            spyOn(Api, "getApiResponseStatList").and.returnValue(defStat.promise);
            let defLoadData = $q.defer();
            vm = <ap.viewmodels.notes.NoteWorkspaceViewModel>$controller("noteWorkspaceViewModel", { $scope: $scope });

            defStat.resolve(new ap.services.apiHelper.ApiResponse([]));
            spyOn(Api, "getEntityIds").and.returnValue(_deferred.promise);
            spyOn(vm.noteListVm.listVm, "loadIds").and.callThrough();
            spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue($q.defer().promise);

            vm.noteListVm.listVm.loadIds();

            let ids = ["b8d13dfc-4124-4340-be59-fbc2b22db6a32", "caeb3a53-94b3-4bea-b724-b686a724e3c5-2", "a501aee5-4997-4717-96f2-3ddd1f098bef2", "39d0d7b4-0477-400c-a421-405021f670e42"];
            _deferred.resolve(new ap.services.apiHelper.ApiResponse(ids));
            $rootScope.$apply();

            spyOn(Api, "getEntityList").and.callFake(function () {
                return defLoadData.promise;
            });
            vm.noteListVm.listVm.loadPage(0);

            defLoadData.resolve({ data: [dataNotes[0], dataNotes[1], dataNotes[2], dataNotes[3]] });
            $rootScope.$apply();
        });

    });

    describe("Feeature: multi actions", () => {
        describe("When ischeckedchanged raise and serveral items is chekced ", () => {
            beforeEach(() => {
                vm = <ap.viewmodels.notes.NoteWorkspaceViewModel>$controller("noteWorkspaceViewModel", { $scope: $scope });
                spyOn(vm.noteListVm.listVm, "getCheckedItems").and.returnValue([{ Id: "123", originalEntity: { Id: "123" } }]);
                spyOn(vm.noteListVm, "manageMultiActionsMode");

                specHelper.general.raiseEvent(vm.noteListVm.listVm, "isCheckedChanged", { Id: "123" });
            })
            it("THEN vm.noteListVm.manageMultiActionsMode is called", () => {
                expect(vm.noteListVm.manageMultiActionsMode).toHaveBeenCalled();
            });
        });

        describe("When ischeckedchanged raised in multiaction mode and no items is chekced ", () => {
            beforeEach(() => {
                vm = <ap.viewmodels.notes.NoteWorkspaceViewModel>$controller("noteWorkspaceViewModel", { $scope: $scope });
                vm.noteListVm.manageMultiActionsMode();

                spyOn(vm.noteListVm.listVm, "getCheckedItems").and.returnValue([]);
                spyOn(vm.noteListVm, "closeMultiActions");

                specHelper.general.raiseEvent(vm.noteListVm.listVm, "isCheckedChanged", { Id: "123" });
            })
            it("THEN MainController.closeMultiActionsMode is called", () => {
                expect(vm.noteListVm.closeMultiActions).toHaveBeenCalled();
            });
        });
    });

    describe("Feature: _meetingAccessRight", () => {
        describe("WHEN a meeting is selected (we are in meeting module)", () => {
            let meeting: ap.models.meetings.Meeting;
            let defGetMeetingAccessRight;
            beforeEach(() => {
                defGetMeetingAccessRight = $q.defer();
                meeting = new ap.models.meetings.Meeting(Utility);
                meeting.Title = "myMeeting";
                specHelper.general.spyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get).and.returnValue(meeting);

                spyOn(AccessRightController, "getMeetingAccessRight").and.returnValue(defGetMeetingAccessRight.promise);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get);
            });
            it("THEN accessRightController.getMeetingAccessRight is called ", () => {
                vm = <ap.viewmodels.notes.NoteWorkspaceViewModel>$controller("noteWorkspaceViewModel", { $scope: $scope });
                expect(AccessRightController.getMeetingAccessRight).toHaveBeenCalledWith(meeting.Id);
            });

            describe("AND If MeetingAccessRight.CanAddPoint is true  ", () => {
                let defNoteStat: ng.IDeferred<any>;
                beforeEach(() => {
                    defNoteStat = $q.defer();
                    spyOn(Api, "getApiResponseStatList").and.returnValue(defNoteStat.promise);

                    let meetingAccessRight = new ap.models.accessRights.MeetingAccessRight(Utility);
                    meetingAccessRight.CanAddPoint = true;
                    spyGetNote();
                    vm = <ap.viewmodels.notes.NoteWorkspaceViewModel>$controller("noteWorkspaceViewModel", { $scope: $scope });

                    defGetMeetingAccessRight.resolve(meetingAccessRight);
                    $rootScope.$apply();
                });
                it("THEN the user can add a point", () => {
                    expect(vm.canAddPoint()).toBeTruthy();
                });
            });

            describe("AND If MeetingAccessRight.CanAddPoint is false  ", () => {
                let defNoteStat: ng.IDeferred<any>;
                beforeEach(() => {
                    defNoteStat = $q.defer();
                    spyOn(Api, "getApiResponseStatList").and.returnValue(defNoteStat.promise);

                    let meetingAccessRight = new ap.models.accessRights.MeetingAccessRight(Utility);
                    meetingAccessRight.CanAddPoint = false;
                    spyGetNote();
                    vm = <ap.viewmodels.notes.NoteWorkspaceViewModel>$controller("noteWorkspaceViewModel", { $scope: $scope });

                    defGetMeetingAccessRight.resolve(meetingAccessRight);
                    $rootScope.$apply();
                });
                it("THEN the user cannot add a point", () => {
                    expect(vm.canAddPoint()).toBeFalsy();
                });
            });
        });
    });

    describe("Feature: hasActiveNote", () => {
        let defMeetingAccessRigts: ng.IDeferred<any>;
        beforeEach(() => {
            defMeetingAccessRigts = $q.defer();
            spyOn(ap.viewmodels.notes.NoteListViewModel.prototype, "refresh");
            specHelper.general.spyProperty(ap.controllers.UIStateController.prototype, "mainFlowState", specHelper.PropertyAccessor.Get).and.returnValue(ap.controllers.MainFlow.Points);
            spyOn(Api, "getApiResponse").and.callFake(function (url, method) {
                if (url.indexOf("rest/usercommentsids") === 0 && method === ap.services.apiHelper.MethodType.Get)
                    return $q.defer().promise;
                if (url.indexOf("rest/accessrights") === 0)
                    return defMeetingAccessRigts.promise;
                return null;
            });

            spyOn(Api, "getApiResponseStatList").and.callFake(() => $q.defer().promise);

            vm = createNoteWorkspace(true);
            defMeetingAccessRigts.resolve(new ap.services.apiHelper.ApiResponse(dataNotes[0].MeetingAccessRight));
            $rootScope.$apply();
        });

        afterEach(() => {
            specHelper.general.offSpyProperty(ap.controllers.UIStateController.prototype, "mainFlowState", specHelper.PropertyAccessor.Get);
        });

        describe("WHEN the filterString of the mainSearch is NULL", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.misc.MainSearchInfo.prototype, "filterString", specHelper.PropertyAccessor.Get).and.returnValue(null);

                specHelper.general.raiseEvent(vm.noteListVm.screenInfo.mainSearchInfo, "criterionschanged", null);
            });

            afterEach(() => {
                specHelper.general.offSpyProperty(ap.misc.MainSearchInfo.prototype, "filterString", specHelper.PropertyAccessor.Get);
            });

            it("THEN, hasActiveNote is NULL", () => {
                expect(vm.noteListVm.hasActiveNotes).toBeNull();
            });
        });

        describe("WHEN the Archived filter is set", () => {

            beforeEach(() => {
                spyOn(vm.noteListVm.screenInfo.mainSearchInfo, "hasPredefinedFilterCriterion").and.callFake((filter: string) => {
                    if (filter === "Archived") {
                        return true;
                    }
                });
                specHelper.general.spyProperty(ap.misc.MainSearchInfo.prototype, "filterString", specHelper.PropertyAccessor.Get).and.returnValue("archived");

                specHelper.general.raiseEvent(vm.noteListVm.screenInfo.mainSearchInfo, "criterionschanged", null);
            });

            afterEach(() => {
                specHelper.general.offSpyProperty(ap.misc.MainSearchInfo.prototype, "filterString", specHelper.PropertyAccessor.Get);
            });

            it("THEN, hasActiveNote is False", () => {
                expect(vm.noteListVm.hasActiveNotes).toBeFalsy();
            });
        });

        describe("WHEN the Active filter is set", () => {

            beforeEach(() => {
                spyOn(vm.noteListVm.screenInfo.mainSearchInfo, "hasPredefinedFilterCriterion").and.callFake((filter: string) => {
                    if (filter === "Archived") {
                        return false;
                    } else if (filter === "Active") {
                        return true;
                    }
                });
                specHelper.general.spyProperty(ap.misc.MainSearchInfo.prototype, "filterString", specHelper.PropertyAccessor.Get).and.returnValue("active");

                specHelper.general.raiseEvent(vm.noteListVm.screenInfo.mainSearchInfo, "criterionschanged", null);
            });

            afterEach(() => {
                specHelper.general.offSpyProperty(ap.misc.MainSearchInfo.prototype, "filterString", specHelper.PropertyAccessor.Get);
            });

            it("THEN, hasActiveNote is True", () => {
                expect(vm.noteListVm.hasActiveNotes).toBeTruthy();
            });
        });
    });

    describe("Feature: CopyToNote", () => {
        let defMeeting: any;
        let defControler: any;
        let meeting: ap.models.meetings.Meeting;
        let note: ap.models.notes.Note;
        let noteVm: ap.viewmodels.notes.NoteActionsViewModel;

        beforeEach(() => {
            spyOn(Api, "getApiResponseStatList").and.callFake(() => $q.defer().promise);
            spyGetNote();
            defMeeting = $q.defer();
            defControler = $q.defer();
            note = new ap.models.notes.Note(Utility);
            note.createByJson({ Meeting: { Title: "title" } });
            noteVm = new ap.viewmodels.notes.NoteActionsViewModel(Utility, note, ControllersManager);

            meeting = new ap.models.meetings.Meeting(Utility);
            let meetingItemVm = new ap.viewmodels.meetings.MeetingItemViewModel(Utility, $q);
            meetingItemVm.init(meeting);
            vm = <ap.viewmodels.notes.NoteWorkspaceViewModel>$controller("noteWorkspaceViewModel", { $scope: $scope });

            spyOn(vm.noteListVm, "openMeetingSelectorDialog").and.returnValue(defMeeting.promise);
            spyOn(vm.noteListVm, "getNoteViewModel").and.returnValue(noteVm);
            spyOn(NoteController, "copyTo").and.returnValue(defControler.promise);
            spyOn(vm.noteListVm, "openMultiActionResultDialog");

            specHelper.general.raiseEvent(NoteController, "copytonoterequest", note);

            defMeeting.resolve(meetingItemVm);
        });
        describe("WHEN SkippedActionDescriptionList is not empty", () => {
            beforeEach(() => {
                let n: ap.models.multiactions.NoteMultiActionsResult = new ap.models.multiactions.NoteMultiActionsResult(Utility, [note], [new ap.models.multiactions.NotAppliedActionDescription()]);
                defControler.resolve(n);
                $rootScope.$apply();
            });
            it("THEN, openMultiActionResultDialog is called", () => {
                expect(vm.noteListVm.openMultiActionResultDialog).toHaveBeenCalled();
            });
        });
        describe("WHEN SkippedActionDescriptionList is empty", () => {
            let note: ap.models.notes.Note;
            beforeEach(() => {
                let n: ap.models.multiactions.NoteMultiActionsResult = new ap.models.multiactions.NoteMultiActionsResult(Utility, [note], []);
                defControler.resolve(n);
                $rootScope.$apply();
            });
            it("THEN, openMultiActionResultDialog is called", () => {
                expect(vm.noteListVm.openMultiActionResultDialog).not.toHaveBeenCalled();
            });
        });
    });

    describe("Feature: criterionschanged of mainsearch", () => {
        let criterion: ap.misc.Criterion;
        let defStat: ng.IDeferred<any>;
        let defMeetingAccessRigts: ng.IDeferred<any>;
        beforeEach(() => {
            let sts = [
                [
                    {
                        Count: 4,
                        GroupByValue: false
                    }
                ]
            ];
            defStat = $q.defer();
            spyOn(Api, "getApiResponseStatList").and.callFake((url, method) => {
                return defStat.promise;
            });
            defMeetingAccessRigts = $q.defer();
            spyOn(Api, "getApiResponse").and.callFake(function (url, method) {
                if (url.indexOf("rest/usercommentsids") === 0 && method === ap.services.apiHelper.MethodType.Get)
                    return $q.defer().promise;
                if (url.indexOf("rest/accessrights") === 0)
                    return defMeetingAccessRigts.promise;
                return null;
            });

            criterion = new ap.misc.Criterion(Utility, new ap.misc.AdvancedFilter(new ap.misc.PropertyInfo("Name")), "my name");
            vm = createNoteWorkspace(true);
            defMeetingAccessRigts.resolve(new ap.services.apiHelper.ApiResponse(dataNotes[0].MeetingAccessRight));
            $rootScope.$apply();
            spyOn(vm.noteListVm, "loadData").and.returnValue($q.defer().promise);
            spyOn(vm.noteListVm.screenInfo.mainSearchInfo, "getCriterionsNotPredefined").and.returnValue(criterion);
            specHelper.general.spyProperty(ap.controllers.UIStateController.prototype, "mainFlowState", specHelper.PropertyAccessor.Get).and.returnValue(ap.controllers.MainFlow.Points);

            specHelper.general.raiseEvent(vm.noteListVm.screenInfo.mainSearchInfo, "criterionschanged", null);

            defStat.resolve({ data: sts });
            $rootScope.$apply();
        });

        afterEach(() => {
            specHelper.general.offSpyProperty(ap.controllers.UIStateController.prototype, "mainFlowState", specHelper.PropertyAccessor.Get);
        });

        describe("WHEN criterionschanged event is raised from the mainseaerch ", () => {
            it("THEN, the loadData method of the noteList is called", () => {
                expect(vm.noteListVm.loadData).toHaveBeenCalled();
            });
        });
    });

    describe("Feature: Main search criterions changed", () => {
        let defApi: ng.IDeferred<any>;
        let defStat: ng.IDeferred<any>;
        let defMeetingAccessRigts: ng.IDeferred<any>;
        beforeEach(() => {
            defApi = $q.defer();
            defStat = $q.defer();
            defMeetingAccessRigts = $q.defer();
            spyOn(Api, "getApiResponse").and.callFake((url, method) => {
                if (url.indexOf("rest/usercommentsids") === 0 && method === ap.services.apiHelper.MethodType.Get)
                    return defApi.promise;
                if (url.indexOf("rest/accessrights") === 0)
                    return defMeetingAccessRigts.promise;
                return null;
            });
            spyOn(Api, "getApiResponseStatList").and.callFake((url, method) => {
                return defStat.promise;
            });

            spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake((moduleCode) => {
                if (moduleCode === ap.models.licensing.Module.Module_ListSearch)
                    return true;
            });

            specHelper.general.spyProperty(ap.controllers.UIStateController.prototype, "mainFlowState", specHelper.PropertyAccessor.Get).and.returnValue(ap.controllers.MainFlow.Points);

            vm = createNoteWorkspace(true);
            defMeetingAccessRigts.resolve(new ap.services.apiHelper.ApiResponse(dataNotes[0].MeetingAccessRight));
            $rootScope.$apply();
        });

        afterEach(() => {
            specHelper.general.offSpyProperty(ap.controllers.UIStateController.prototype, "mainFlowState", specHelper.PropertyAccessor.Get);
        });

        describe("WHEN search bar raises the event criterionschanged", () => {
            it("THEN refresh method is called of the view model", () => {
                spyOn(vm.noteListVm, "refresh").and.callThrough();

                vm.noteListVm.screenInfo.mainSearchInfo.addCriterion("Subject", "my subject");
                (<any>vm.noteListVm.screenInfo.mainSearchInfo)._listener.raise("criterionschanged");

                expect(vm.noteListVm.refresh).toHaveBeenCalled();
            });
        });
    });

    describe("Feature: InfoNote", () => {
        let note: ap.models.notes.Note;
        let noteVm: ap.viewmodels.notes.NoteItemViewModel;
        beforeEach(() => {
            note = new ap.models.notes.Note(Utility);
            note.createByJson({ Id: "1" });
            noteVm = new ap.viewmodels.notes.NoteItemViewModel(Utility, $q, null, new ap.viewmodels.notes.UserCommentItemConstructorParameter(0, null, null, null, Utility, ControllersManager));
            noteVm.init(note);
            vm = createNoteWorkspace(true);
            spyOn(vm, "toggleRight").and.callThrough();
            spyOn(vm.noteListVm, "getNoteViewModel").and.returnValue(noteVm);
        });
        describe("WHEN closeInfoNote is called", () => {
            beforeEach(() => {
                vm.closeInfoNote(noteVm)
            });
            it("THEN with info is set to true", () => {
                expect(noteVm.noteActionViewModel.withInfo).toBeTruthy();
            });
            it("THEN toggleRight is called", () => {
                expect(vm.toggleRight).toHaveBeenCalled();
            });
        });
        describe("WHEN _infoNote is called", () => {
            beforeEach(() => {
                specHelper.general.raiseEvent(NoteController, "infonoterequest", note);
            });
            it("THEN with info is set to false", () => {
                expect(noteVm.noteActionViewModel.withInfo).toBeFalsy();
            });
            it("THEN toggleRight is called", () => {
                expect(vm.toggleRight).toHaveBeenCalled();
            });
        });
    });

    describe("Feature: CopyNote", () => {
        let copyNote: ap.models.notes.Note;
        let def: angular.IDeferred<ap.models.notes.Note>;
        beforeEach(() => {
            copyNote = new ap.models.notes.Note(Utility);
            def = $q.defer();
            spyOn(NoteController, "getFullNoteById").and.returnValue(def.promise);
            vm = createNoteWorkspace(true);
            specHelper.general.raiseEvent(NoteController, "copynoterequest", copyNote);
        });
        describe("WHEN _copyNote is called", () => {
            it("THEN getFullNoteById is called", () => {
                expect(NoteController.getFullNoteById).toHaveBeenCalledWith(copyNote.Id);
            });
        });
    });

    describe("Feature: moveNote", () => {
        let originalNote: ap.models.notes.Note;
        let copyNote: ap.models.notes.Note;
        let noteVm: ap.viewmodels.notes.NoteItemViewModel;

        let modalWindowConfig: any;
        let defDialog: angular.IDeferred<ap.viewmodels.meetings.MeetingItemViewModel>;
        let defMove: angular.IDeferred<any>;
        let meeting: ap.models.meetings.Meeting;
        let meetingVm: ap.viewmodels.meetings.MeetingItemViewModel;

        function triggerMoveNote() {
            specHelper.general.raiseEvent(NoteController, "movetonoterequest", originalNote);
            $rootScope.$digest();
        }

        beforeEach(() => {
            defDialog = $q.defer();
            defMove = $q.defer();
            meeting = new ap.models.meetings.Meeting(Utility);
            meetingVm = new ap.viewmodels.meetings.MeetingItemViewModel(Utility, $q);
            meeting.createByJson({
                Id: "meeting-id",
                Title: "ssss"
            });
            meetingVm.init(meeting);
            noteVm = new ap.viewmodels.notes.NoteItemViewModel(Utility, $q, null, new ap.viewmodels.notes.UserCommentItemConstructorParameter(0, null, null, null, Utility, ControllersManager));
            originalNote = new ap.models.notes.Note(Utility);
            originalNote.createByJson({
                Id: "test-id",
                Subject: "Test subject",
                Meeting: {
                    Title: "aaa"
                }
            });
            spyOn(Api, "getApiResponseStatList").and.returnValue($q.resolve({ data: [] }));
            spyOn(Api, "getEntityIds").and.returnValue($q.resolve({ data: [] }));

            spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue($q.resolve([]));
            noteVm.init(originalNote);

            vm = createNoteWorkspace(true);
            spyOn(vm.noteListVm, "openMeetingSelectorDialog").and.returnValue(defDialog.promise);
            spyOn(vm.noteListVm, "getNoteViewModel").and.returnValue(noteVm);
            spyOn(NoteController, "moveTo").and.returnValue(defMove.promise);
        });

        describe("WHEN _moveNote is called and noteController.moveTo is resolve and currentMeeting is null", () => {
            beforeEach(() => {
                triggerMoveNote();
                defDialog.resolve(meetingVm);
                $rootScope.$apply();
                defMove.resolve();
                $rootScope.$apply();
            });
            it("THEN moveTo is call", () => {
                expect(NoteController.moveTo).toHaveBeenCalled();
            });
            it("THEN title meeting is changed", () => {
                expect(noteVm.originalNote.Meeting.Title).toBe("ssss");
            });
        });
        describe("WHEN _moveNote is called and noteController.moveTo is resolve and has currentMeeting ", () => {
            let currentMeeting: ap.models.meetings.Meeting;
            beforeEach(() => {
                currentMeeting = new ap.models.meetings.Meeting(Utility);
                specHelper.general.spyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get).and.returnValue(currentMeeting);
                triggerMoveNote();
                defDialog.resolve(meetingVm);
                $rootScope.$apply();
                defMove.resolve();
                $rootScope.$apply();
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get);
            });
            it("THEN moveTo is call", () => {
                expect(NoteController.moveTo).toHaveBeenCalled();
            });
            it("THEN noteVm.isMoved is true", () => {
                expect(noteVm.isMoved).toBeTruthy();
            });
        });
        describe("WHEN _moveNote is called and noteController.moveTo is reject", () => {
            beforeEach(() => {
                triggerMoveNote();
                defDialog.resolve(meetingVm);
                $rootScope.$apply();
                defMove.reject({
                    error: ""
                });
                $rootScope.$apply();
            });
        });

    });
}); 