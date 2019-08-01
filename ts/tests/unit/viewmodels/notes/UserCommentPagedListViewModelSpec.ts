describe("Module ap-viewmodels - UserCommentPagedListView", () => {

    let nmp = ap.viewmodels.notes;
    let MainController: ap.controllers.MainController, Utility: ap.utility.UtilityHelper, Api: ap.services.apiHelper.Api, UserContext: ap.utility.UserContext, UIStateController: ap.controllers.UIStateController;
    let $controller: angular.IControllerService, $rootScope: angular.IRootScopeService, $scope: angular.IScope, _deferred: angular.IDeferred<ap.services.apiHelper.ApiResponse>,
        $q: angular.IQService, $timeout: angular.ITimeoutService, $compile: angular.ICompileService;
    let ProjectController: ap.controllers.ProjectController;
    let NoteController: ap.controllers.NoteController;
    let ReportController: ap.controllers.ReportController;
    let MeetingController: ap.controllers.MeetingController;
    let ControllersManager: ap.controllers.ControllersManager;

    let ServicesManager: ap.services.ServicesManager;
    let vm: ap.viewmodels.notes.NoteListViewModel;
    let noteWorkspaceVm: ap.viewmodels.notes.NoteWorkspaceViewModel;
    let idsNotes = ['b360cb6d-ca54-4b93-a564-a469274eb68a', '35a2c5d6-0e00-43e9-ada8-ce4f3fadb16e', 'bf70c80f-3b76-4bf8-bef4-86c7b1d4aa60', 'bf70c80f-3b76-8jf8-bef4-8kreb1d4aa60', '2941f296-be77-4681-98b7-720d15b23f6a',
        '2237b414-098a-48f1-af55-f62f61b10439', 'c629417f-9533-4223-8bd0-521cdd61aa3a', 'b1406f37-f02e-4b36-9a2a-9d6d12149143', '9b75f490-aed6-4eca-9b89-23b01878ec7f', '1069741a-571a-4ee9-be15-662b17749dad'];
    let idsInCharge = ['b8d13dfc-4124-4340-be59-fbc2b22db6a32', 'caeb3a53-94b3-4bea-b724-b686a724e3c52', 'a501aee5-4997-4717-96f2-3ddd1f098bef2', '39d0d7b4-0477-400c-a421-405021f670e42', '0a63d1ab-90ab-4244-b1a9-7afd8869c78c2',
        '4af8f685-8323-4e4f-8232-b3a63389a6ed2', '54719bf6-02a6-45aa-b181-d18898e00e392', 'f2192e2e-c434-4280-aaf9-fd4647ffaa8f2', '9b75f490-aed6-4eca-9b89-23b01878ec7f1', '1069741a-571a-4ee9-be15-662b17749dad1'];
    let dataNotes = [];
    let _http: angular.IHttpBackendService;
    let groups: string[];
    let baseTime = new Date(2016, 2, 20, 15, 30, 20);

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject(function (_$rootScope_, _$q_, _$timeout_, _$compile_, _UserContext_, _Utility_, _Api_, _ControllersManager_, _MainController_, _UIStateController_, _$controller_, _ProjectController_, _NoteController_, _ReportController_, _ServicesManager_, _MeetingController_, _$httpBackend_) {
        MainController = _MainController_;
        ControllersManager = _ControllersManager_;
        UIStateController = _UIStateController_;
        Utility = _Utility_;
        UserContext = _UserContext_;
        ProjectController = _ProjectController_;
        NoteController = _NoteController_;
        ReportController = _ReportController_;
        ServicesManager = _ServicesManager_;
        MeetingController = _MeetingController_;
        _http = _$httpBackend_;
        Api = _Api_;
        vm = null;
        $q = _$q_;
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $timeout = _$timeout_;
        _deferred = $q.defer();
        $controller = _$controller_;
        $scope = $rootScope.$new();
        specHelper.utility.stubRootUrl(Utility);
        specHelper.userContext.stub(Utility);
        specHelper.utility.stubStorageSet(Utility);

        jasmine.clock().install;
        specHelper.general.stubDate(baseTime);

        dataNotes = [
            {
                Id: "b360cb6d-ca54-4b93-a564-a469274eb68a",
                Subject: "Note 1",
                CodeNum: "1.01",
                IsArchived: false,
                From: {
                    Person: {
                        Name: "Quentin Luc"
                    }
                },
                Cell: {
                    Code: "C1",
                    Description: "C1.1",
                    ParentCell: {
                        Code: "PC1"
                    }
                },
                IssueType: {
                    Code: "IT1",
                    ParentChapter: {
                        Code: "PIT1"
                    },
                    Description: "PIT1 Description"
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
                    Level: ap.models.accessRights.AccessRightLevel.Subcontractor
                }
            },
            {
                Id: "35a2c5d6-0e00-43e9-ada8-ce4f3fadb16e",
                Subject: "Note 2",
                CodeNum: "2.02",
                IsArchived: false,
                From: {
                    Person: {
                        Name: "Quentin Luc"
                    }
                },
                Cell: {
                    Code: "C1",
                    Description: "C1.1",
                    ParentCell: {
                        Code: "PC1"
                    }
                },
                IssueType: {
                    Code: "IT1",
                    ParentChapter: {
                        Code: "PIT1"
                    },
                    Description: "PIT1 Description"
                },
                Status: {
                    Name: "Status 1",
                    Color: "111111",
                    IsTodo: true
                },
                MeetingAccessRight: {
                    Level: ap.models.accessRights.AccessRightLevel.Subcontractor
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
                    Description: "C1.1",
                    ParentCell: {
                        Code: "PC1"
                    }
                },
                IssueType: {
                    Code: "IT1",
                    ParentChapter: {
                        Code: "PIT1"
                    },
                    Description: "PIT1 Description"
                },
                Status: {
                    Name: "Status 1",
                    Color: "111111",
                    IsTodo: true
                },
                MeetingAccessRight: {
                    Level: ap.models.accessRights.AccessRightLevel.Subcontractor
                },
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
                From: {
                    Person: {
                        Name: "Quentin Luc"
                    }
                },
                Cell: {
                    Code: "C2",
                    Description: "C2.2",
                    ParentCell: {
                        Code: "PC2"
                    }
                },
                IssueType: {
                    Code: "IT2",
                    ParentChapter: {
                        Code: "PIT2"
                    },
                    Description: "PIT2 Description"
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
                    Description: "C2.2",
                    ParentCell: {
                        Code: "PC2"
                    }
                },
                IssueType: {
                    Code: "IT2",
                    ParentChapter: {
                        Code: "PIT2"
                    },
                    Description: "PIT2 Description"
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
                    Description: "C3.3",
                    ParentCell: {
                        Code: "PC3"
                    }
                },
                IssueType: {
                    Code: "IT3",
                    ParentChapter: {
                        Code: "PIT3"
                    },
                    Description: "PIT3 Description"
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
                    Description: "C3.3",
                    ParentCell: {
                        Code: "PC3"
                    }
                },
                IssueType: {
                    Code: "IT3",
                    ParentChapter: {
                        Code: "PIT3"
                    },
                    Description: "PIT3 Description"
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
                    Description: "C3.3",
                    ParentCell: {
                        Code: "PC3"
                    }
                },
                IssueType: {
                    Code: "IT3",
                    ParentChapter: {
                        Code: "PIT3"
                    },
                    Description: "PIT3 Description"
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
                    Description: "C3.3",
                    ParentCell: null
                },
                IssueType: {
                    Code: "IT3",
                    ParentChapter: {
                        Code: "PIT3"
                    },
                    Description: "PIT3 Description"
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

        groups = ["Date", "SubCategory", "Status", "DueDate", "InCharge"];
    }));

    // spy Segment.IO calls
    beforeEach(() => {
        spyOn(ServicesManager.toolService, "sendEvent").and.returnValue($q.defer().promise);
    });

    afterEach(() => {
        jasmine.clock().uninstall;
    });

    /**
     * Creates the UserCommentPagedListViewModel
     * @param $scope $scope of the object
     * @param utility UtilityClasses
     * @param _api Api service
     * @param $q $q service
     * @param _controllersManager ControllersManager to get access to controllers
     * @param _reportService ReportService
     * @param itemCreator Constructor of each item of the list
     * @param pathToLoad Used to define which properties to load of a note
     * @param sortOrder Defines the sort order of the notes whithin the list
     * @param defaultFilter Default filter applied to the list before to load the data
     * @param groups All the possible groups
     * @param groupName Current group name
     * @param pageSize Defines how many items should be loaded at a time
     * @param isNote To know if we're loading notes of forms
     */
    let createVm = (itemCreator?: new (utility: ap.utility.UtilityHelper, q: angular.IQService, parentListVm?: ap.viewmodels.BaseListEntityViewModel,
        itemParameters?: ap.viewmodels.notes.UserCommentItemConstructorParameter) => ap.viewmodels.IEntityViewModel, pathToLoad?: string, sortOrder?: string, defaultFilter?: string, groups: string[] = [], groupName: string = "",
        pageSize: number = 50, isNote: boolean = true) => {
        let genericList: ap.viewmodels.notes.UserCommentPagedListViewModel = new ap.viewmodels.notes.UserCommentPagedListViewModel($scope, Utility, Api, $q, ControllersManager, ServicesManager.reportService, itemCreator, pathToLoad, sortOrder, defaultFilter, groups, groupName, pageSize, isNote);
        let defLoadIds = $q.defer();
        let defLoadData = $q.defer();
        let defStatus = $q.defer();
        spyOn(Api, "getEntityIds").and.returnValue(defLoadIds.promise);

        // need to spy on  getApiResponse because the data created in this file are under JSON format and we want the entities to be created
        spyOn(Api, "getApiResponse").and.callFake((url: string) => {
            if (url.indexOf("rest/notes") >= 0) {
                return defLoadData.promise;
            }
        });
        spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue(defStatus.promise);

        return {
            list: genericList,
            loadIdsDeferred: defLoadIds,
            loadDataDeferred: defLoadData,
            loadStatusDeferred: defStatus
        }
    };

    /**
     * Load the data
     * @param list The listVm
     * @param defLoadIds Deferred of the load ids call
     * @param defLoadData Deferred of the load data call
     */
    let initVm = (list: ap.viewmodels.notes.UserCommentPagedListViewModel, defLoadIds: angular.IDeferred<any>, defLoadData: angular.IDeferred<any>) => {
        let ids = ['b8d13dfc-4124-4340-be59-fbc2b22db6a30', 'caeb3a53-94b3-4bea-b724-b686a724e3c50', 'a501aee5-4997-4717-96f2-3ddd1f098bef0', '39d0d7b4-0477-400c-a421-405021f670e40', '0a63d1ab-90ab-4244-b1a9-7afd8869c78c0',
            '4af8f685-8323-4e4f-8232-b3a63389a6ed0', '54719bf6-02a6-45aa-b181-d18898e00e390', 'f2192e2e-c434-4280-aaf9-fd4647ffaa8f0', 'e22d49ea-113c-41a6-84a7-be211154b6ed0', '10ed0cc1-1818-4c1f-869c-961c3ea672850'];

        list.loadNextPage();
        defLoadIds.resolve(new ap.services.apiHelper.ApiResponse(ids));
        defLoadData.resolve({ data: [dataNotes[0], dataNotes[1], dataNotes[2], dataNotes[3], dataNotes[4], dataNotes[5], dataNotes[6], dataNotes[7], dataNotes[8], dataNotes[9]] });
        $rootScope.$apply();
    };

    describe("Feature: LoadPage", function () {
        describe("GIVEN a list where the loadIds was already called WHEN the loadPage is called", function () {
            let genericList: ap.viewmodels.notes.UserCommentPagedListViewModel, ids, defLoadData, defStatus;
            let apiOpt: ap.services.apiHelper.ApiOption;
            let pathToLoad: string

            beforeEach(() => {
                defLoadData = $q.defer();
                defStatus = $q.defer();

                pathToLoad = "Subject,DueDate,IsUrgent,CodeNum,ProjectNumSeq,MeetingNumSeq,Code,EntityVersion,IsArchived,From.Person.Name,Cell.Code,Cell.ParentCell.Code,NoteInCharge.Tag,";
                pathToLoad += "IssueType.Code,IssueType.ParentChapter.Code,NoteInCharge.UserId,Status.Color,Status.Code,Status.Name,Comments.IsRead";

                apiOpt = new ap.services.apiHelper.ApiOption();
                apiOpt.async = true;
                apiOpt.onlyPathToLoadData = true;
                apiOpt.customParams.push(new ap.services.apiHelper.ApiCustomParam("ppactions", "updatenotemeetingaccessright"));

                spyOn(Api, "getEntityIds").and.returnValue(_deferred.promise);
                spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue(defStatus.promise);
                spyOn(Api, "getEntityList").and.callFake(() => {
                    return defLoadData.promise;
                });
            });

            it("THEN, the Api.getEntityList is called on each request pages AND when all pages loaded, isLoaded = true", function () {
                genericList = new ap.viewmodels.notes.UserCommentPagedListViewModel($scope, Utility, Api, $q, ControllersManager, ServicesManager.reportService, ap.viewmodels.notes.NoteItemViewModel, pathToLoad, null, null, groups, "Status", 4);
                spyOn(genericList, "loadIds").and.callThrough();
                genericList.addCustomParam("ppactions", "updatenotemeetingaccessright");

                dataNotes[0].Comments[0].LastModificationDate = new Date(); // today
                dataNotes[1].Comments[0].LastModificationDate = new Date(); // today
                dataNotes[2].Comments[0].LastModificationDate = new Date().addDays(-1); // yesterday
                dataNotes[3].Comments[0].LastModificationDate = new Date().addDays(-4); // this week
                dataNotes[4].Comments[0].LastModificationDate = new Date().addDays(-9);  //last week
                dataNotes[5].Comments[0].LastModificationDate = new Date().addDays(-15); //this month
                dataNotes[6].Comments[0].LastModificationDate = new Date().addDays(-23); //last month
                dataNotes[7].Comments[0].LastModificationDate = new Date().addDays(-60); // this year
                dataNotes[8].Comments[0].LastModificationDate = new Date().addDays(-120); // last year
                dataNotes[9].Comments[0].LastModificationDate = new Date(2012, 2, 3); // older

                genericList.loadIds();

                let ids = ['b8d13dfc-4124-4340-be59-fbc2b22db6a30', 'caeb3a53-94b3-4bea-b724-b686a724e3c50', 'a501aee5-4997-4717-96f2-3ddd1f098bef0', '39d0d7b4-0477-400c-a421-405021f670e40', '0a63d1ab-90ab-4244-b1a9-7afd8869c78c0',
                    '4af8f685-8323-4e4f-8232-b3a63389a6ed0', '54719bf6-02a6-45aa-b181-d18898e00e390', 'f2192e2e-c434-4280-aaf9-fd4647ffaa8f0', 'e22d49ea-113c-41a6-84a7-be211154b6ed0', '10ed0cc1-1818-4c1f-869c-961c3ea672850'];
                _deferred.resolve(new ap.services.apiHelper.ApiResponse(ids));
                $rootScope.$apply();

                genericList.loadPage(0);
                expect(Api.getEntityList).toHaveBeenCalledWith("Note", "Filter.Or(Filter.Lt(Id, 00000000-0000-0000-0000-000000000000),Filter.Exists(Comments, Filter.In(Id, b8d13dfc-4124-4340-be59-fbc2b22db6a3,caeb3a53-94b3-4bea-b724-b686a724e3c5,a501aee5-4997-4717-96f2-3ddd1f098bef,39d0d7b4-0477-400c-a421-405021f670e4)))", pathToLoad, null, null, apiOpt);

                defLoadData.resolve({ data: [dataNotes[0], dataNotes[1], dataNotes[2], dataNotes[3]] });
                $rootScope.$apply();
                defLoadData = $q.defer();

                genericList.loadPage(1);
                expect(Api.getEntityList).toHaveBeenCalledWith("Note", "Filter.Or(Filter.Lt(Id, 00000000-0000-0000-0000-000000000000),Filter.Exists(Comments, Filter.In(Id, 0a63d1ab-90ab-4244-b1a9-7afd8869c78c,4af8f685-8323-4e4f-8232-b3a63389a6ed,54719bf6-02a6-45aa-b181-d18898e00e39,f2192e2e-c434-4280-aaf9-fd4647ffaa8f)))", pathToLoad, null, null, apiOpt);

                defLoadData.resolve({ data: [dataNotes[4], dataNotes[5], dataNotes[6], dataNotes[7]] });
                $rootScope.$apply();

                defLoadData = $q.defer();

                genericList.loadPage(2);
                expect(Api.getEntityList).toHaveBeenCalledWith("Note", "Filter.Or(Filter.Lt(Id, 00000000-0000-0000-0000-000000000000),Filter.Exists(Comments, Filter.In(Id, e22d49ea-113c-41a6-84a7-be211154b6ed,10ed0cc1-1818-4c1f-869c-961c3ea67285)))", pathToLoad, null, null, apiOpt);
                defLoadData.resolve({ data: [dataNotes[8], dataNotes[9]] });
                $rootScope.$apply();

                defLoadData = $q.defer();

                expect(genericList.isLoaded).toBeTruthy();
            });

            describe("AND the list is grouped by Status", function () {

                beforeEach(() => {
                    genericList = new ap.viewmodels.notes.UserCommentPagedListViewModel($scope, Utility, Api, $q, ControllersManager, ServicesManager.reportService, ap.viewmodels.notes.NoteItemViewModel, pathToLoad, null, null, groups, "Status", 4);
                    spyOn(genericList, "loadIds").and.callThrough();
                    genericList.addCustomParam("ppactions", "updatenotemeetingaccessright");
                    genericList.loadIds();
                });

                it("THEN, the Api.getEntityList is called on each request pages AND when all pages loaded, isLoaded = true and the points are grouped by status", function () {
                    let ids = ['b8d13dfc-4124-4340-be59-fbc2b22db6a30', 'caeb3a53-94b3-4bea-b724-b686a724e3c50', 'a501aee5-4997-4717-96f2-3ddd1f098bef0', '39d0d7b4-0477-400c-a421-405021f670e40', '0a63d1ab-90ab-4244-b1a9-7afd8869c78c0',
                        '4af8f685-8323-4e4f-8232-b3a63389a6ed0', '54719bf6-02a6-45aa-b181-d18898e00e390', 'f2192e2e-c434-4280-aaf9-fd4647ffaa8f-4', 'e22d49ea-113c-41a6-84a7-be211154b6ed0', '10ed0cc1-1818-4c1f-869c-961c3ea672850'];
                    _deferred.resolve(new ap.services.apiHelper.ApiResponse(ids));
                    $rootScope.$apply();

                    genericList.loadPage(0);
                    expect(Api.getEntityList).toHaveBeenCalledWith("Note", "Filter.Or(Filter.Lt(Id, 00000000-0000-0000-0000-000000000000),Filter.Exists(Comments, Filter.In(Id, b8d13dfc-4124-4340-be59-fbc2b22db6a3,caeb3a53-94b3-4bea-b724-b686a724e3c5,a501aee5-4997-4717-96f2-3ddd1f098bef,39d0d7b4-0477-400c-a421-405021f670e4)))", pathToLoad, null, null, apiOpt);

                    defLoadData.resolve({ data: [dataNotes[0], dataNotes[1], dataNotes[2], dataNotes[3]] });
                    $rootScope.$apply();
                    defLoadData = $q.defer();

                    genericList.loadPage(1);
                    expect(Api.getEntityList).toHaveBeenCalledWith("Note", "Filter.Or(Filter.Lt(Id, 00000000-0000-0000-0000-000000000000),Filter.Exists(Comments, Filter.In(Id, 0a63d1ab-90ab-4244-b1a9-7afd8869c78c,4af8f685-8323-4e4f-8232-b3a63389a6ed,54719bf6-02a6-45aa-b181-d18898e00e39,f2192e2e-c434-4280-aaf9-fd4647ffaa8f)))", pathToLoad, null, null, apiOpt);

                    defLoadData.resolve({ data: [dataNotes[4], dataNotes[5], dataNotes[6], dataNotes[7]] });
                    $rootScope.$apply();

                    defLoadData = $q.defer();

                    genericList.loadPage(2);
                    expect(Api.getEntityList).toHaveBeenCalledWith("Note", "Filter.Or(Filter.Lt(Id, 00000000-0000-0000-0000-000000000000),Filter.Exists(Comments, Filter.In(Id, e22d49ea-113c-41a6-84a7-be211154b6ed,10ed0cc1-1818-4c1f-869c-961c3ea67285)))", pathToLoad, null, null, apiOpt);
                    defLoadData.resolve({ data: [dataNotes[8], dataNotes[9]] });
                    $rootScope.$apply();

                    defLoadData = $q.defer();

                    expect(genericList.isLoaded).toBeTruthy();
                });
            });

            describe("GIVEN a list where the group is by Status AND the pages are not loaded one after another AND one of the group's index need to be changed", () => {

                beforeEach(() => {
                    genericList = new ap.viewmodels.notes.UserCommentPagedListViewModel($scope, Utility, Api, $q, ControllersManager, ServicesManager.reportService, ap.viewmodels.notes.NoteItemViewModel, null, null, null, groups, "Status", 2);
                    spyOn(genericList, "loadIds").and.callThrough();
                    genericList.addCustomParam("ppactions", "updatenotemeetingaccessright");
                    genericList.loadIds();
                });

                xit("THEN, the Api.getEntityList is called AND group's index is changed when elements of the same group are loaded with a < index", () => {
                    let ids = ['b8d13dfc-4124-4340-be59-fbc2b22db6a30', 'caeb3a53-94b3-4bea-b724-b686a724e3c50', 'a501aee5-4997-4717-96f2-3ddd1f098bef0', '39d0d7b4-0477-400c-a421-405021f670e4-4', '0a63d1ab-90ab-4244-b1a9-7afd8869c78c0',
                        '4af8f685-8323-4e4f-8232-b3a63389a6ed0', '54719bf6-02a6-45aa-b181-d18898e00e390', 'f2192e2e-c434-4280-aaf9-fd4647ffaa8f0', 'e22d49ea-113c-41a6-84a7-be211154b6ed0', '10ed0cc1-1818-4c1f-869c-961c3ea672850'];
                    _deferred.resolve(new ap.services.apiHelper.ApiResponse(ids));
                    $rootScope.$apply();

                    // load the page at index 1 and not 0
                    genericList.loadPage(1);

                    defLoadData.resolve({ data: [dataNotes[2], dataNotes[3]] });
                    $rootScope.$apply();
                    defLoadData = $q.defer();
                    let item: ap.viewmodels.IEntityViewModel;
                    item = genericList.getItemAtIndex(2);
                    expect(item.index).toEqual(2);
                    expect(item.originalEntity.Id).toEqual(ap.utility.UtilityHelper.createEmptyGuid());
                    item = genericList.getItemAtIndex(3);
                    expect(item.index).toEqual(2); // index 2 in the sourceItems
                    expect(item.originalEntity.Id).toEqual("bf70c80f-3b76-4bf8-bef4-86c7b1d4aa60");


                    // then load page 0, the index of the first group need to be changed
                    genericList.loadPage(0);

                    defLoadData.resolve({ data: [dataNotes[0], dataNotes[1]] });
                    $rootScope.$apply();
                    item = genericList.getItemAtIndex(0);
                    expect(item.index).toEqual(0);
                    expect(item.originalEntity.Id).toEqual(ap.utility.UtilityHelper.createEmptyGuid());
                    item = genericList.getItemAtIndex(1);
                    expect(item.index).toEqual(0); // index 0 in the sourceItems
                    expect(item.originalEntity.Id).toEqual("b360cb6d-ca54-4b93-a564-a469274eb68a");
                    item = genericList.getItemAtIndex(3);
                    expect(item.index).toEqual(2); // index 2 in the sourceItems
                    expect(item.originalEntity.Id).toEqual("bf70c80f-3b76-4bf8-bef4-86c7b1d4aa60");
                });
            });

            describe("GIVEN a list where the group is by Room Level 2", () => {

                beforeEach(() => {
                    genericList = new ap.viewmodels.notes.UserCommentPagedListViewModel($scope, Utility, Api, $q, ControllersManager, ServicesManager.reportService, ap.viewmodels.notes.NoteItemViewModel, pathToLoad, null, null, groups, "Room", 4);
                    spyOn(genericList, "loadIds").and.callThrough();
                    genericList.addCustomParam("ppactions", "updatenotemeetingaccessright");
                    genericList.loadIds();
                });

                it("THEN, the Api.getEntityList is called on each request pages AND when all pages loaded, isLoaded = true and the points are grouped by Room Level 2", () => {
                    let ids = ['b8d13dfc-4124-4340-be59-fbc2b22db6a30', 'caeb3a53-94b3-4bea-b724-b686a724e3c50', 'a501aee5-4997-4717-96f2-3ddd1f098bef0', '39d0d7b4-0477-400c-a421-405021f670e40', '0a63d1ab-90ab-4244-b1a9-7afd8869c78c0',
                        '4af8f685-8323-4e4f-8232-b3a63389a6ed0', '54719bf6-02a6-45aa-b181-d18898e00e390', 'f2192e2e-c434-4280-aaf9-fd4647ffaa8f0', 'e22d49ea-113c-41a6-84a7-be211154b6ed0', '10ed0cc1-1818-4c1f-869c-961c3ea672850'];
                    _deferred.resolve(new ap.services.apiHelper.ApiResponse(ids));
                    $rootScope.$apply();

                    genericList.loadPage(0);
                    expect(Api.getEntityList).toHaveBeenCalledWith("Note", "Filter.Or(Filter.Lt(Id, 00000000-0000-0000-0000-000000000000),Filter.Exists(Comments, Filter.In(Id, b8d13dfc-4124-4340-be59-fbc2b22db6a3,caeb3a53-94b3-4bea-b724-b686a724e3c5,a501aee5-4997-4717-96f2-3ddd1f098bef,39d0d7b4-0477-400c-a421-405021f670e4)))", pathToLoad, null, null, apiOpt);

                    defLoadData.resolve({ data: [dataNotes[0], dataNotes[1], dataNotes[2], dataNotes[3]] });
                    $rootScope.$apply();
                    defLoadData = $q.defer();

                    genericList.loadPage(1);
                    expect(Api.getEntityList).toHaveBeenCalledWith("Note", "Filter.Or(Filter.Lt(Id, 00000000-0000-0000-0000-000000000000),Filter.Exists(Comments, Filter.In(Id, 0a63d1ab-90ab-4244-b1a9-7afd8869c78c,4af8f685-8323-4e4f-8232-b3a63389a6ed,54719bf6-02a6-45aa-b181-d18898e00e39,f2192e2e-c434-4280-aaf9-fd4647ffaa8f)))", pathToLoad, null, null, apiOpt);

                    defLoadData.resolve({ data: [dataNotes[4], dataNotes[5], dataNotes[6], dataNotes[7]] });
                    $rootScope.$apply();

                    defLoadData = $q.defer();

                    genericList.loadPage(2);
                    expect(Api.getEntityList).toHaveBeenCalledWith("Note", "Filter.Or(Filter.Lt(Id, 00000000-0000-0000-0000-000000000000),Filter.Exists(Comments, Filter.In(Id, e22d49ea-113c-41a6-84a7-be211154b6ed,10ed0cc1-1818-4c1f-869c-961c3ea67285)))", pathToLoad, null, null, apiOpt);
                    defLoadData.resolve({ data: [dataNotes[8], dataNotes[9]] });
                    $rootScope.$apply();

                    defLoadData = $q.defer();

                    expect(genericList.isLoaded).toBeTruthy();
                    expect(genericList.groupDescription).toEqual("Room");
                    expect(genericList.sourceItems.length).toEqual(10);

                    expect((<ap.viewmodels.notes.NoteItemViewModel>genericList.getItemAtIndex(0)).subject).toBe("C1 / C1.1");
                    expect((<ap.viewmodels.notes.NoteItemViewModel>genericList.getItemAtIndex(4)).subject).toBe("C2 / C2.2");
                    expect((<ap.viewmodels.notes.NoteItemViewModel>genericList.getItemAtIndex(7)).subject).toBe("C3 / C3.3");
                    expect((<ap.viewmodels.notes.NoteItemViewModel>genericList.getItemAtIndex(12)).subject).toBe("No room");
                });
            });

            describe("GIVEN a list where the group is by SubCategory", () => {

                beforeEach(() => {
                    genericList = new ap.viewmodels.notes.UserCommentPagedListViewModel($scope, Utility, Api, $q, ControllersManager, ServicesManager.reportService, ap.viewmodels.notes.NoteItemViewModel, pathToLoad, null, null, groups, "SubCategory", 4);
                    spyOn(genericList, "loadIds").and.callThrough();
                    genericList.addCustomParam("ppactions", "updatenotemeetingaccessright");
                    genericList.loadIds();
                });

                it("THEN, the Api.getEntityList is called on each request pages AND when all pages loaded, isLoaded = true and the points are grouped by SubCategory", () => {
                    let ids = ['b8d13dfc-4124-4340-be59-fbc2b22db6a30', 'caeb3a53-94b3-4bea-b724-b686a724e3c50', 'a501aee5-4997-4717-96f2-3ddd1f098bef0', '39d0d7b4-0477-400c-a421-405021f670e40', '0a63d1ab-90ab-4244-b1a9-7afd8869c78c0',
                        '4af8f685-8323-4e4f-8232-b3a63389a6ed0', '54719bf6-02a6-45aa-b181-d18898e00e390', 'f2192e2e-c434-4280-aaf9-fd4647ffaa8f0', 'e22d49ea-113c-41a6-84a7-be211154b6ed0', '10ed0cc1-1818-4c1f-869c-961c3ea672850'];
                    _deferred.resolve(new ap.services.apiHelper.ApiResponse(ids));
                    $rootScope.$apply();

                    genericList.loadPage(0);
                    expect(Api.getEntityList).toHaveBeenCalledWith("Note", "Filter.Or(Filter.Lt(Id, 00000000-0000-0000-0000-000000000000),Filter.Exists(Comments, Filter.In(Id, b8d13dfc-4124-4340-be59-fbc2b22db6a3,caeb3a53-94b3-4bea-b724-b686a724e3c5,a501aee5-4997-4717-96f2-3ddd1f098bef,39d0d7b4-0477-400c-a421-405021f670e4)))", pathToLoad, null, null, apiOpt);

                    defLoadData.resolve({ data: [dataNotes[0], dataNotes[1], dataNotes[2], dataNotes[3]] });
                    $rootScope.$apply();
                    defLoadData = $q.defer();

                    genericList.loadPage(1);
                    expect(Api.getEntityList).toHaveBeenCalledWith("Note", "Filter.Or(Filter.Lt(Id, 00000000-0000-0000-0000-000000000000),Filter.Exists(Comments, Filter.In(Id, 0a63d1ab-90ab-4244-b1a9-7afd8869c78c,4af8f685-8323-4e4f-8232-b3a63389a6ed,54719bf6-02a6-45aa-b181-d18898e00e39,f2192e2e-c434-4280-aaf9-fd4647ffaa8f)))", pathToLoad, null, null, apiOpt);

                    defLoadData.resolve({ data: [dataNotes[4], dataNotes[5], dataNotes[6], dataNotes[7]] });
                    $rootScope.$apply();

                    defLoadData = $q.defer();

                    genericList.loadPage(2);
                    expect(Api.getEntityList).toHaveBeenCalledWith("Note", "Filter.Or(Filter.Lt(Id, 00000000-0000-0000-0000-000000000000),Filter.Exists(Comments, Filter.In(Id, e22d49ea-113c-41a6-84a7-be211154b6ed,10ed0cc1-1818-4c1f-869c-961c3ea67285)))", pathToLoad, null, null, apiOpt);
                    defLoadData.resolve({ data: [dataNotes[8], dataNotes[9]] });
                    $rootScope.$apply();

                    defLoadData = $q.defer();

                    expect(genericList.isLoaded).toBeTruthy();
                    expect(genericList.groupDescription).toEqual("SubCategory");
                    expect(genericList.sourceItems.length).toEqual(10);
                });
            });

            describe("GIVEN a list where the group is by DueDate", () => {

                beforeEach(() => {
                    dataNotes[0].DueDate = new Date(); // today
                    dataNotes[1].DueDate = new Date(); // today
                    dataNotes[2].DueDate = new Date().addDays(+1); // tomorrow
                    dataNotes[3].DueDate = new Date().addDays(+2); // this week
                    dataNotes[4].DueDate = new Date().addDays(+2);  //this week
                    dataNotes[5].DueDate = new Date().addDays(+30); //next month
                    dataNotes[6].DueDate = new Date().addDays(+60); //this year
                    dataNotes[7].DueDate = new Date().addDays(+300); // next year
                    dataNotes[8].DueDate = new Date(2019, 2, 3); // newer
                    dataNotes[9].DueDate = null; // no due date

                    genericList = new ap.viewmodels.notes.UserCommentPagedListViewModel($scope, Utility, Api, $q, ControllersManager, ServicesManager.reportService, ap.viewmodels.notes.NoteItemViewModel, pathToLoad, null, null, groups, "DueDate", 4);
                    spyOn(genericList, "loadIds").and.callThrough();
                    genericList.addCustomParam("ppactions", "updatenotemeetingaccessright");
                    genericList.loadIds();
                });

                it("THEN, the Api.getEntityList is called on each request pages AND when all pages loaded, isLoaded = true and the points are grouped by DueDate", () => {
                    let ids = ['b8d13dfc-4124-4340-be59-fbc2b22db6a30', 'caeb3a53-94b3-4bea-b724-b686a724e3c50', 'a501aee5-4997-4717-96f2-3ddd1f098bef0', '39d0d7b4-0477-400c-a421-405021f670e40', '0a63d1ab-90ab-4244-b1a9-7afd8869c78c0',
                        '4af8f685-8323-4e4f-8232-b3a63389a6ed0', '54719bf6-02a6-45aa-b181-d18898e00e390', 'f2192e2e-c434-4280-aaf9-fd4647ffaa8f0', 'e22d49ea-113c-41a6-84a7-be211154b6ed0', '10ed0cc1-1818-4c1f-869c-961c3ea672850'];
                    _deferred.resolve(new ap.services.apiHelper.ApiResponse(ids));
                    $rootScope.$apply();

                    genericList.loadPage(0);
                    expect(Api.getEntityList).toHaveBeenCalledWith("Note", "Filter.Or(Filter.Lt(Id, 00000000-0000-0000-0000-000000000000),Filter.Exists(Comments, Filter.In(Id, b8d13dfc-4124-4340-be59-fbc2b22db6a3,caeb3a53-94b3-4bea-b724-b686a724e3c5,a501aee5-4997-4717-96f2-3ddd1f098bef,39d0d7b4-0477-400c-a421-405021f670e4)))", pathToLoad, null, null, apiOpt);

                    defLoadData.resolve({ data: [dataNotes[0], dataNotes[1], dataNotes[2], dataNotes[3]] });
                    $rootScope.$apply();
                    defLoadData = $q.defer();

                    genericList.loadPage(1);
                    expect(Api.getEntityList).toHaveBeenCalledWith("Note", "Filter.Or(Filter.Lt(Id, 00000000-0000-0000-0000-000000000000),Filter.Exists(Comments, Filter.In(Id, 0a63d1ab-90ab-4244-b1a9-7afd8869c78c,4af8f685-8323-4e4f-8232-b3a63389a6ed,54719bf6-02a6-45aa-b181-d18898e00e39,f2192e2e-c434-4280-aaf9-fd4647ffaa8f)))", pathToLoad, null, null, apiOpt);

                    defLoadData.resolve({ data: [dataNotes[4], dataNotes[5], dataNotes[6], dataNotes[7]] });
                    $rootScope.$apply();

                    defLoadData = $q.defer();

                    genericList.loadPage(2);
                    expect(Api.getEntityList).toHaveBeenCalledWith("Note", "Filter.Or(Filter.Lt(Id, 00000000-0000-0000-0000-000000000000),Filter.Exists(Comments, Filter.In(Id, e22d49ea-113c-41a6-84a7-be211154b6ed,10ed0cc1-1818-4c1f-869c-961c3ea67285)))", pathToLoad, null, null, apiOpt);
                    defLoadData.resolve({ data: [dataNotes[8], dataNotes[9]] });
                    $rootScope.$apply();

                    defLoadData = $q.defer();

                    expect(genericList.isLoaded).toBeTruthy();
                    expect(genericList.groupDescription).toEqual("DueDate");
                    expect(genericList.sourceItems.length).toEqual(10);
                });
            });

            describe("GIVEN a list where the group is None", () => {

                beforeEach(() => {
                    genericList = new ap.viewmodels.notes.UserCommentPagedListViewModel($scope, Utility, Api, $q, ControllersManager, ServicesManager.reportService, ap.viewmodels.notes.NoteItemViewModel, pathToLoad, null, null, groups, "None", 4);
                    spyOn(genericList, "loadIds").and.callThrough();
                    genericList.addCustomParam("ppactions", "updatenotemeetingaccessright");
                    genericList.loadIds();
                });

                it("THEN, the Api.getEntityList is called on each request pages AND when all pages loaded, isLoaded = true and the points are not grouped (None)", () => {
                    let ids = ['b8d13dfc-4124-4340-be59-fbc2b22db6a30', 'caeb3a53-94b3-4bea-b724-b686a724e3c50', 'a501aee5-4997-4717-96f2-3ddd1f098bef0', '39d0d7b4-0477-400c-a421-405021f670e40', '0a63d1ab-90ab-4244-b1a9-7afd8869c78c0',
                        '4af8f685-8323-4e4f-8232-b3a63389a6ed0', '54719bf6-02a6-45aa-b181-d18898e00e390', 'f2192e2e-c434-4280-aaf9-fd4647ffaa8f0', 'e22d49ea-113c-41a6-84a7-be211154b6ed0', '10ed0cc1-1818-4c1f-869c-961c3ea672850'];
                    _deferred.resolve(new ap.services.apiHelper.ApiResponse(ids));
                    $rootScope.$apply();

                    genericList.loadPage(0);
                    expect(Api.getEntityList).toHaveBeenCalledWith("Note", "Filter.Or(Filter.Lt(Id, 00000000-0000-0000-0000-000000000000),Filter.Exists(Comments, Filter.In(Id, b8d13dfc-4124-4340-be59-fbc2b22db6a3,caeb3a53-94b3-4bea-b724-b686a724e3c5,a501aee5-4997-4717-96f2-3ddd1f098bef,39d0d7b4-0477-400c-a421-405021f670e4)))", pathToLoad, null, null, apiOpt);

                    defLoadData.resolve({ data: [dataNotes[0], dataNotes[1], dataNotes[2], dataNotes[3]] });
                    $rootScope.$apply();
                    defLoadData = $q.defer();

                    genericList.loadPage(1);
                    expect(Api.getEntityList).toHaveBeenCalledWith("Note", "Filter.Or(Filter.Lt(Id, 00000000-0000-0000-0000-000000000000),Filter.Exists(Comments, Filter.In(Id, 0a63d1ab-90ab-4244-b1a9-7afd8869c78c,4af8f685-8323-4e4f-8232-b3a63389a6ed,54719bf6-02a6-45aa-b181-d18898e00e39,f2192e2e-c434-4280-aaf9-fd4647ffaa8f)))", pathToLoad, null, null, apiOpt);

                    defLoadData.resolve({ data: [dataNotes[4], dataNotes[5], dataNotes[6], dataNotes[7]] });
                    $rootScope.$apply();

                    defLoadData = $q.defer();

                    genericList.loadPage(2);
                    expect(Api.getEntityList).toHaveBeenCalledWith("Note", "Filter.Or(Filter.Lt(Id, 00000000-0000-0000-0000-000000000000),Filter.Exists(Comments, Filter.In(Id, e22d49ea-113c-41a6-84a7-be211154b6ed,10ed0cc1-1818-4c1f-869c-961c3ea67285)))", pathToLoad, null, null, apiOpt);
                    defLoadData.resolve({ data: [dataNotes[8], dataNotes[9]] });
                    $rootScope.$apply();

                    defLoadData = $q.defer();

                    expect(genericList.isLoaded).toBeTruthy();
                    expect(genericList.groupDescription).toEqual("None");
                    expect(genericList.sourceItems.length).toEqual(10);
                });
            });

            describe("WHEN, loadPage is called with an Index => PageNumber", () => {

                beforeEach(() => {
                    genericList = new ap.viewmodels.notes.UserCommentPagedListViewModel($scope, Utility, Api, $q, ControllersManager, ServicesManager.reportService, ap.viewmodels.notes.NoteItemViewModel, pathToLoad, null, null, groups, "None", 4);
                    spyOn(genericList, "loadIds").and.callThrough();
                    genericList.addCustomParam("ppactions", "updatenotemeetingaccessright");
                    genericList.loadIds();
                });

                it("THEN, the error 'The index is out of range' is thrown", () => {
                    let ids = ['b8d13dfc-4124-4340-be59-fbc2b22db6a30', 'caeb3a53-94b3-4bea-b724-b686a724e3c50', 'a501aee5-4997-4717-96f2-3ddd1f098bef0', '39d0d7b4-0477-400c-a421-405021f670e40', '0a63d1ab-90ab-4244-b1a9-7afd8869c78c0',
                        '4af8f685-8323-4e4f-8232-b3a63389a6ed0', '54719bf6-02a6-45aa-b181-d18898e00e390', 'f2192e2e-c434-4280-aaf9-fd4647ffaa8f0', 'e22d49ea-113c-41a6-84a7-be211154b6ed0', '10ed0cc1-1818-4c1f-869c-961c3ea672850'];
                    _deferred.resolve(new ap.services.apiHelper.ApiResponse(ids));
                    $rootScope.$apply();

                    expect(() => { genericList.loadPage(5); }).toThrow(new Error("The index is out of range"));
                });
            });
        });
    });

    describe("Default values of UserCommentPagedListViewModel", () => {
        describe("WHEN I create the VM with not all the parameters", () => {
            it("THEN, it's created with the default values", () => {

                let pathToLoad: string = "Subject,DueDate,IsUrgent,CodeNum,ProjectNumSeq,MeetingNumSeq,Code,EntityVersion,IsArchived,From.Person.Name,Cell.Code,Cell.ParentCell.Code,NoteInCharge.Tag,";
                pathToLoad += "IssueType.Code,IssueType.ParentChapter.Code,NoteInCharge.UserId,Status.Color,Status.Code,Status.Name,Comments.IsRead";
                let genericList = new ap.viewmodels.notes.UserCommentPagedListViewModel($scope, Utility, Api, $q, ControllersManager, ServicesManager.reportService);
                expect(genericList.options.pageSize).toBe(50);
                expect(genericList.options.customEntityIds).toBe("UserComment");
                expect(genericList.options.entityName).toBe("Note");
                expect(genericList.options.displayLoading).toBeFalsy();
                expect(genericList.options.onlyPathToLoadData).toBeTruthy();
            });
        });
    });

    describe("Feature: GetItemAtIndex", () => {
        describe("WHEN a list is grouped by Status AND all the elements are in one page and GetItemAtIndex(0)", function () {
            let genericList: ap.viewmodels.notes.UserCommentPagedListViewModel,
                ids,
                defLoadData,
                defStatus;
            let apiOpt = new ap.services.apiHelper.ApiOption();
            it("THEN, the first group is returned", function () {
                defLoadData = $q.defer();
                defStatus = $q.defer();
                genericList = new ap.viewmodels.notes.UserCommentPagedListViewModel($scope, Utility, Api, $q, ControllersManager, ServicesManager.reportService, ap.viewmodels.notes.NoteItemViewModel, null, null, null, groups, "Status", 10);
                spyOn(Api, "getEntityIds").and.returnValue(_deferred.promise);
                spyOn(genericList, "loadIds").and.callThrough();
                spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue(defStatus.promise);

                genericList.loadIds();

                let ids = ['b8d13dfc-4124-4340-be59-fbc2b22db6a30', 'caeb3a53-94b3-4bea-b724-b686a724e3c50', 'a501aee5-4997-4717-96f2-3ddd1f098bef0', '39d0d7b4-0477-400c-a421-405021f670e40', '0a63d1ab-90ab-4244-b1a9-7afd8869c78c0',
                    '4af8f685-8323-4e4f-8232-b3a63389a6ed0', '54719bf6-02a6-45aa-b181-d18898e00e390', 'f2192e2e-c434-4280-aaf9-fd4647ffaa8f0', 'e22d49ea-113c-41a6-84a7-be211154b6ed0', '10ed0cc1-1818-4c1f-869c-961c3ea672850'];
                _deferred.resolve(new ap.services.apiHelper.ApiResponse(ids));
                $rootScope.$apply();

                spyOn(Api, "getEntityList").and.callFake(function () {
                    return defLoadData.promise;
                });
                genericList.loadPage(0);

                defLoadData.resolve({ data: dataNotes });
                $rootScope.$apply();
                defLoadData = $q.defer();

                expect(genericList.isLoaded).toBeTruthy();

                // check groups index
                expect((<ap.viewmodels.notes.NoteItemViewModel>genericList.getItemAtIndex(0)).originalEntity.Id).toEqual(ap.utility.UtilityHelper.createEmptyGuid());
                expect((<ap.viewmodels.notes.NoteItemViewModel>genericList.getItemAtIndex(0)).subject).toEqual("[To Do]");
                expect((<ap.viewmodels.notes.NoteItemViewModel>genericList.getItemAtIndex(4)).originalEntity.Id).toEqual(ap.utility.UtilityHelper.createEmptyGuid());
                expect((<ap.viewmodels.notes.NoteItemViewModel>genericList.getItemAtIndex(4)).subject).toEqual("[Done]");
                expect((<ap.viewmodels.notes.NoteItemViewModel>genericList.getItemAtIndex(6)).originalEntity.Id).toEqual(ap.utility.UtilityHelper.createEmptyGuid());
                expect((<ap.viewmodels.notes.NoteItemViewModel>genericList.getItemAtIndex(6)).subject).toEqual("Status 2");
                expect((<ap.viewmodels.notes.NoteItemViewModel>genericList.getItemAtIndex(8)).originalEntity.Id).toEqual(ap.utility.UtilityHelper.createEmptyGuid());
                expect((<ap.viewmodels.notes.NoteItemViewModel>genericList.getItemAtIndex(8)).subject).toEqual("Status 3");
                expect((<ap.viewmodels.notes.NoteItemViewModel>genericList.getItemAtIndex(13)).originalEntity.Id).toEqual(ap.utility.UtilityHelper.createEmptyGuid());
                expect((<ap.viewmodels.notes.NoteItemViewModel>genericList.getItemAtIndex(13)).subject).toEqual("Status 4");

                // check item
                expect(genericList.getItemAtIndex(1).index).toEqual(0);
                expect((<ap.viewmodels.notes.NoteItemViewModel>genericList.getItemAtIndex(1)).originalEntity.Id).toEqual("b360cb6d-ca54-4b93-a564-a469274eb68a");
            });
        });
    });

    describe("Feature: Change groupDescription property", () => {
        describe("WHEN, I change the groupDescription of the list to a different one", () => {
            it("THEN, the groupDescription changed and the groupCount is set to 0", () => {
                let pathToLoad: string = "Subject,DueDate,IsUrgent,CodeNum,ProjectNumSeq,MeetingNumSeq,Code,EntityVersion,IsArchived,From.Person.Name,Cell.Code,Cell.ParentCell.Code,NoteInCharge.Tag,";
                pathToLoad += "IssueType.Code,IssueType.ParentChapter.Code,NoteInCharge.UserId,Status.Color,Status.Code,Status.Name,Comments.IsRead";
                let genericList = new ap.viewmodels.notes.UserCommentPagedListViewModel($scope, Utility, Api, $q, ControllersManager, ServicesManager.reportService, ap.viewmodels.notes.NoteItemViewModel, pathToLoad, null, null, groups, undefined, 4);


                let spy = specHelper.general.spyProperty(ap.viewmodels.notes.UserCommentPagedListViewModel.prototype, "groupDescription", specHelper.PropertyAccessor.Set);
                genericList.groupDescription = "DueDate";
                expect(spy).toHaveBeenCalledWith("DueDate");
                specHelper.general.offSpyProperty(ap.viewmodels.notes.UserCommentPagedListViewModel.prototype, "groupDescription", specHelper.PropertyAccessor.Set);
            });
        });
    });

    describe("Feature: Group points in the list of points", () => {
        describe("WHEN the user clicks on the group by User in Charge", () => {
            it("THEN, the list is refresh and displayed with the elements grouped by user in charge", () => {

                let genericList: ap.viewmodels.notes.UserCommentPagedListViewModel,
                    ids,
                    defLoadData,
                    defStatus;
                let apiOpt = new ap.services.apiHelper.ApiOption();
                defLoadData = $q.defer();
                defStatus = $q.defer();
                let pathToLoad: string = "Subject,DueDate,IsUrgent,CodeNum,ProjectNumSeq,MeetingNumSeq,Code,EntityVersion,IsArchived,From.Person.Name,Cell.Code,Cell.ParentCell.Code,NoteInCharge.Tag,";
                pathToLoad += "IssueType.Code,IssueType.ParentChapter.Code,NoteInCharge.UserId,Status.Color,Status.Code,Status.Name,Comments.IsRead";
                genericList = new ap.viewmodels.notes.UserCommentPagedListViewModel($scope, Utility, Api, $q, ControllersManager, ServicesManager.reportService, ap.viewmodels.notes.NoteItemViewModel, pathToLoad, null, null, groups, "InCharge", 4);
                genericList.addCustomParam("ppactions", "updatenotemeetingaccessright");
                spyOn(Api, "getEntityIds").and.returnValue(_deferred.promise);
                spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue(defStatus.promise);
                spyOn(genericList, "loadIds").and.callThrough();
                apiOpt.async = true;
                apiOpt.onlyPathToLoadData = true;
                apiOpt.customParams.push(new ap.services.apiHelper.ApiCustomParam("ppactions", "updatenotemeetingaccessright"));

                genericList.loadIds();

                _deferred.resolve(new ap.services.apiHelper.ApiResponse(idsInCharge));
                $rootScope.$apply();

                spyOn(Api, "getEntityList").and.callFake(function () {
                    return defLoadData.promise;
                });
                genericList.loadPage(0);
                expect(Api.getEntityList).toHaveBeenCalledWith("Note", "Filter.Or(Filter.Lt(Id, 00000000-0000-0000-0000-000000000000),Filter.Exists(NoteInCharge, Filter.In(Id, b8d13dfc-4124-4340-be59-fbc2b22db6a3,caeb3a53-94b3-4bea-b724-b686a724e3c5,a501aee5-4997-4717-96f2-3ddd1f098bef,39d0d7b4-0477-400c-a421-405021f670e4)))", pathToLoad, null, null, apiOpt);

                defLoadData.resolve({ data: [dataNotes[0], dataNotes[1], dataNotes[2], dataNotes[3]] });
                $rootScope.$apply();
                defLoadData = $q.defer();

                genericList.loadNextPage();
                genericList.loadPage(1);
                expect(Api.getEntityList).toHaveBeenCalledWith("Note", "Filter.Or(Filter.Lt(Id, 00000000-0000-0000-0000-000000000000),Filter.Exists(NoteInCharge, Filter.In(Id, 0a63d1ab-90ab-4244-b1a9-7afd8869c78c,4af8f685-8323-4e4f-8232-b3a63389a6ed,54719bf6-02a6-45aa-b181-d18898e00e39,f2192e2e-c434-4280-aaf9-fd4647ffaa8f)))", pathToLoad, null, null, apiOpt);

                defLoadData.resolve({ data: [dataNotes[4], dataNotes[5], dataNotes[6], dataNotes[7]] });
                $rootScope.$apply();

                defLoadData = $q.defer();

                genericList.loadPage(2);
                expect(Api.getEntityList).toHaveBeenCalledWith("Note", "Filter.Or(Filter.Lt(Id, 00000000-0000-0000-0000-000000000000),Filter.In(Id, 9b75f490-aed6-4eca-9b89-23b01878ec7f,1069741a-571a-4ee9-be15-662b17749dad))", pathToLoad, null, null, apiOpt);
                defLoadData.resolve({ data: [dataNotes[8], dataNotes[9]] });
                $rootScope.$apply();

                defLoadData = $q.defer();

                expect(genericList.isLoaded).toBeTruthy();
                expect(genericList.groupDescription).toEqual("InCharge");
                expect(genericList.sourceItems.length).toEqual(10);

            });
        });
    });

    describe("Feature: Is archived", () => {
        describe("WHEN a list is grouped by None AND Item[1] is archived", function () {
            let genericList: ap.viewmodels.notes.UserCommentPagedListViewModel,
                ids,
                defLoadData;
            let apiOpt = new ap.services.apiHelper.ApiOption();
            it("THEN, the second item is return as archived", function () {
                defLoadData = $q.defer();
                genericList = new ap.viewmodels.notes.UserCommentPagedListViewModel($scope, Utility, Api, $q, ControllersManager, ServicesManager.reportService, ap.viewmodels.notes.NoteItemViewModel, null, null, null, groups, "None", 3);

                spyOn(Api, "getEntityIds").and.returnValue(_deferred.promise);
                spyOn(genericList, "loadIds").and.callThrough();
                spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue($q.defer().promise);

                genericList.loadIds();

                let ids = ['b8d13dfc-4124-4340-be59-fbc2b22db6a30', 'caeb3a53-94b3-4bea-b724-b686a724e3c5-4', 'a501aee5-4997-4717-96f2-3ddd1f098bef0'];
                _deferred.resolve(new ap.services.apiHelper.ApiResponse(ids));
                $rootScope.$apply();

                spyOn(Api, "getEntityList").and.callFake(function () {
                    return defLoadData.promise;
                });
                genericList.loadPage(0);

                dataNotes[1].IsArchived = true
                defLoadData.resolve({ data: [dataNotes[0], dataNotes[1], dataNotes[2]] });
                $rootScope.$apply();
                defLoadData = $q.defer();

                expect(genericList.isLoaded).toBeTruthy();

                // index 1 is group
                // check item                
                expect((<ap.viewmodels.notes.NoteItemViewModel>genericList.getItemAtIndex(1)).originalEntity.Id).toEqual("35a2c5d6-0e00-43e9-ada8-ce4f3fadb16e");
                expect((<ap.models.notes.Note>(<ap.viewmodels.notes.NoteItemViewModel>genericList.getItemAtIndex(1)).originalEntity).IsArchived).toBeTruthy();
            });
        });

        describe("When the list IS grouped by InCharge and the second one is archived", () => {
            let genericList: ap.viewmodels.notes.UserCommentPagedListViewModel, ids, defLoadData;
            it("THEN, the list is loaded and he second one is return as archived", () => {
                defLoadData = $q.defer();
                genericList = new ap.viewmodels.notes.UserCommentPagedListViewModel($scope, Utility, Api, $q, ControllersManager, ServicesManager.reportService, ap.viewmodels.notes.NoteItemViewModel, null, null, null, groups, "InCharge", 4);

                spyOn(Api, "getEntityIds").and.returnValue(_deferred.promise);
                spyOn(genericList, "loadIds").and.callThrough();
                spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue($q.defer().promise);

                genericList.loadIds();

                let ids = ["b8d13dfc-4124-4340-be59-fbc2b22db6a32", "caeb3a53-94b3-4bea-b724-b686a724e3c5-2", "a501aee5-4997-4717-96f2-3ddd1f098bef2", "1069741a-571a-4ee9-be15-662b17749dad-1"];
                _deferred.resolve(new ap.services.apiHelper.ApiResponse(ids));
                $rootScope.$apply();

                spyOn(Api, "getEntityList").and.callFake(function () {
                    return defLoadData.promise;
                });
                genericList.loadPage(0);

                dataNotes[1].IsArchived = true;
                dataNotes[9].IsArchived = true;
                defLoadData.resolve({ data: [dataNotes[0], dataNotes[1], dataNotes[2], dataNotes[9]] });
                $rootScope.$apply();

                // index 1 is group
                expect((<ap.viewmodels.notes.NoteItemViewModel>genericList.getItemAtIndex(2)).originalEntity.Id).toEqual("35a2c5d6-0e00-43e9-ada8-ce4f3fadb16e");
                expect((<ap.models.notes.Note>(<ap.viewmodels.notes.NoteItemViewModel>genericList.getItemAtIndex(2)).originalEntity).IsArchived).toBeTruthy();
                expect((<ap.viewmodels.notes.NoteItemViewModel>genericList.getItemAtIndex(6)).originalEntity.Id).toEqual("1069741a-571a-4ee9-be15-662b17749dad");
                expect((<ap.models.notes.Note>(<ap.viewmodels.notes.NoteItemViewModel>genericList.getItemAtIndex(6)).originalEntity).IsArchived).toBeTruthy();
            });
        });
    });

    describe("Feature: noteAdded", () => {
        let genericList: ap.viewmodels.notes.UserCommentPagedListViewModel, ids: string[], defLoadData;
        let meeting: ap.models.meetings.Meeting;
        beforeEach(() => {
            defLoadData = $q.defer();
            genericList = new ap.viewmodels.notes.UserCommentPagedListViewModel($scope, Utility, Api, $q, ControllersManager, ServicesManager.reportService, ap.viewmodels.notes.NoteItemViewModel, null, null, null, groups, "InCharge", 4);
            meeting = new ap.models.meetings.Meeting(Utility);
            meeting.createByJson({ Id: "123" });
            spyOn(Api, "getEntityIds").and.returnValue(_deferred.promise);
            spyOn(genericList, "loadIds").and.callThrough();
            spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue($q.defer().promise);
            spyOn(Utility.Translator, "getTranslation").and.callFake((code) => {
                return "[" + code + "]";
            });

            genericList.loadIds();

            ids = ["b8d13dfc-4124-4340-be59-fbc2b22db6a32", "caeb3a53-94b3-4bea-b724-b686a724e3c5-2", "a501aee5-4997-4717-96f2-3ddd1f098bef2", "39d0d7b4-0477-400c-a421-405021f670e42"];
            _deferred.resolve(new ap.services.apiHelper.ApiResponse(ids));
            $rootScope.$apply();

            spyOn(Api, "getEntityList").and.callFake(function () {
                return defLoadData.promise;
            });
            genericList.loadPage(0);

            defLoadData.resolve({ data: [dataNotes[0], dataNotes[1], dataNotes[2], dataNotes[3]] });
            $rootScope.$apply();

            spyOn(genericList, "selectEntity");
        });

        describe("WHEN the note should be in another list", () => {
            beforeEach(() => {
                let m = new ap.models.meetings.Meeting(Utility);
                m.createByJson({ Id: "456" });
                specHelper.general.spyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get).and.returnValue(m);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get);
            });
            it("THEN nothing happen", () => {
                let n: ap.models.notes.Note = new ap.models.notes.Note(Utility);
                n.Meeting = meeting;
                (<any>NoteController)._listener.raise("noteadded", new ap.controllers.NoteBaseUpdatedEvent([n]));

                expect(genericList.count).toBe(6);  // 4 items + 2 groups
            });
        });

        describe("WHEN noteAdded is raised", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get).and.returnValue(meeting);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get);
            });
            it("THEN a new group is added on top of the list AND the added note is on the new group", () => {
                let n: ap.models.notes.Note = new ap.models.notes.Note(Utility);
                n.Meeting = meeting;
                (<any>NoteController)._listener.raise("noteadded", new ap.controllers.NoteBaseUpdatedEvent([n]));

                expect(genericList.count).toBe(8);  // 4 items + 2 groups + added group + added item
                expect((<ap.viewmodels.notes.NoteItemViewModel>genericList.getItemAtIndex(0)).originalEntity.Id).toEqual("00000000-0000-0000-0000-000000000000");
                expect((<ap.viewmodels.notes.NoteItemViewModel>genericList.getItemAtIndex(0)).subject).toEqual("[app.notes.noteadded]");
            });
        });

        describe("WHEN destroy is called", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get).and.returnValue(meeting);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get);
            });
            it("THEN NoteController.off is called to unsubscribe noteadded event", () => {
                spyOn(NoteController, "off");

                $scope.$destroy();

                expect(NoteController.off).toHaveBeenCalled();
            });
        });

        describe("WHEN 2 notes are added", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get).and.returnValue(meeting);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get);
            });
            it("THEN only one added group is created followed by the 2 new notes", () => {
                let n1: ap.models.notes.Note = new ap.models.notes.Note(Utility);
                n1.Meeting = meeting;
                let n2: ap.models.notes.Note = new ap.models.notes.Note(Utility);
                n2.Meeting = meeting;
                (<any>NoteController)._listener.raise("noteadded", new ap.controllers.NoteBaseUpdatedEvent([n1]));
                (<any>NoteController)._listener.raise("noteadded", new ap.controllers.NoteBaseUpdatedEvent([n2]));


                expect(genericList.count).toBe(9);  // 4 items + 2 groups + added group + added item + added item
                expect((<ap.viewmodels.notes.NoteItemViewModel>genericList.getItemAtIndex(0)).originalEntity.Id).toEqual("00000000-0000-0000-0000-000000000000");
                expect((<ap.viewmodels.notes.NoteItemViewModel>genericList.getItemAtIndex(0)).subject).toEqual("[app.notes.noteadded]");
            });
        });
    });

    describe("Feature: removeNote", () => {

        let genericList: ap.viewmodels.notes.UserCommentPagedListViewModel, ids: string[], defLoadData;
        beforeEach(() => {
            defLoadData = $q.defer();
            genericList = new ap.viewmodels.notes.UserCommentPagedListViewModel($scope, Utility, Api, $q, ControllersManager, ServicesManager.reportService, ap.viewmodels.notes.NoteItemViewModel, null, null, null, groups, "InCharge", 4);

            spyOn(Api, "getEntityIds").and.returnValue(_deferred.promise);
            spyOn(genericList, "loadIds").and.callThrough();
            spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue($q.defer().promise);

            genericList.loadIds();

            ids = ["b8d13dfc-4124-4340-be59-fbc2b22db6a32", "caeb3a53-94b3-4bea-b724-b686a724e3c5-2", "a501aee5-4997-4717-96f2-3ddd1f098bef2", "39d0d7b4-0477-400c-a421-405021f670e42"];
            _deferred.resolve(new ap.services.apiHelper.ApiResponse(ids));
            $rootScope.$apply();

            spyOn(Api, "getEntityList").and.callFake(function () {
                return defLoadData.promise;
            });
            genericList.loadPage(0);

            defLoadData.resolve({ data: [dataNotes[0], dataNotes[1], dataNotes[2], dataNotes[3]] });
            $rootScope.$apply();
        });

        describe("WHEN the method removeNote is called with the null or undefined", () => {
            it("THEN, the error message must be show", () => {
                spyOn(MainController, "showErrorKey");

                expect(() => {
                    genericList.removeNote(undefined);
                }).toThrowError("removenote_note_mandatory");
            });
        });
        describe("WHEN the method removeNote is called with the note is not existed on the list", () => {
            it("THEN, there is nothing to do", () => {
                let noteJson = { Id: dataNotes[9].Id };
                let noteDeleted: ap.models.notes.Note = new ap.models.notes.Note(Utility);
                noteDeleted.createByJson(noteJson);

                genericList.removeNote(noteDeleted);
                let items: number = 0;
                for (let i = 0; i < genericList.sourceItems.length; i++) {
                    let itemVM: ap.viewmodels.notes.NoteItemViewModel = <ap.viewmodels.notes.NoteItemViewModel>genericList.sourceItems[i];
                    if (!itemVM.isRemoved)
                        items = items + 1;
                }
                expect(items).toEqual(4);
                expect(genericList.count).toEqual(6); // 4 items + 2 groups

            });
        });
        describe("WHEN the method removeNote is called with the note which there is only one item of the list contains this note", () => {
            it("THEN, the note item will have isRemoved = true and the count have not changed", () => {
                let noteJson = { Id: dataNotes[0].Id };
                let noteDeleted: ap.models.notes.Note = new ap.models.notes.Note(Utility);
                noteDeleted.createByJson(noteJson);
                genericList.removeNote(noteDeleted);
                let items: number = 0;
                for (let i = 0; i < genericList.sourceItems.length; i++) {
                    let itemVM: ap.viewmodels.notes.NoteItemViewModel = <ap.viewmodels.notes.NoteItemViewModel>genericList.sourceItems[i];
                    if (!itemVM.isRemoved)
                        items = items + 1;
                }
                expect(items).toEqual(3);
                expect((<ap.viewmodels.notes.NoteItemViewModel>genericList.getItemAtIndex(1)).isRemoved).toEqual(true);
                expect(genericList.count).toEqual(6);// 4 items + 2 groups

            });
        });
        describe("WHEN the method removeNote is called and remove all items of an group", () => {
            it("THEN, the group is removed", () => {
                let note1Json = { Id: dataNotes[0].Id };
                let note2Json = { Id: dataNotes[1].Id };
                let note1Deleted: ap.models.notes.Note = new ap.models.notes.Note(Utility);
                note1Deleted.createByJson(note1Json);
                let note2Deleted: ap.models.notes.Note = new ap.models.notes.Note(Utility);
                note2Deleted.createByJson(note2Json);
                genericList.removeNote(note1Deleted);
                genericList.removeNote(note2Deleted);
                let items: number = 0;
                for (let i = 0; i < genericList.sourceItems.length; i++) {
                    let itemVM: ap.viewmodels.notes.NoteItemViewModel = <ap.viewmodels.notes.NoteItemViewModel>genericList.sourceItems[i];
                    if (!itemVM.isRemoved)
                        items = items + 1;
                }
                expect(items).toEqual(2);
                expect((<ap.viewmodels.notes.NoteItemViewModel>genericList.getItemAtIndex(0)).isRemoved).toEqual(true); //Group
                expect((<ap.viewmodels.notes.NoteItemViewModel>genericList.getItemAtIndex(1)).isRemoved).toEqual(true);
                expect((<ap.viewmodels.notes.NoteItemViewModel>genericList.getItemAtIndex(2)).isRemoved).toEqual(true);
                expect(genericList.count).toEqual(6);// 4 items + 2 groups

            });
        });
        describe("WHEN the method removeNote is called and remove one items of an group and there are remain some items on this group", () => {
            it("THEN, the group is not removed", () => {
                let note1Json = { Id: dataNotes[0].Id };
                let note2Json = { Id: dataNotes[1].Id };
                let note1Deleted: ap.models.notes.Note = new ap.models.notes.Note(Utility);
                note1Deleted.createByJson(note1Json);

                genericList.removeNote(note1Deleted);

                let items: number = 0;
                for (let i = 0; i < genericList.sourceItems.length; i++) {
                    let itemVM: ap.viewmodels.notes.NoteItemViewModel = <ap.viewmodels.notes.NoteItemViewModel>genericList.sourceItems[i];
                    if (!itemVM.isRemoved)
                        items = items + 1;
                }
                expect(items).toEqual(3);
                expect((<ap.viewmodels.notes.NoteItemViewModel>genericList.getItemAtIndex(0)).isRemoved).toBeUndefined();
                expect((<ap.viewmodels.notes.NoteItemViewModel>genericList.getItemAtIndex(1)).isRemoved).toEqual(true);
                expect(genericList.count).toEqual(6);// 4 items + 2 groups

            });
        });
        describe("WHEN the method removeNote is called and remove the item just added", () => {
            it("THEN, the added group is removed", () => {
                let added: ap.models.notes.Note = new ap.models.notes.Note(Utility);
                added.createByJson({ Id: "addedId" });
                (<any>NoteController)._listener.raise("noteadded", new ap.controllers.NoteBaseUpdatedEvent([added]));
                genericList.removeNote(added);

                let items: number = 0;
                for (let i = 0; i < genericList.sourceItems.length; i++) {
                    let itemVM: ap.viewmodels.notes.NoteItemViewModel = <ap.viewmodels.notes.NoteItemViewModel>genericList.sourceItems[i];
                    if (!itemVM.isRemoved)
                        items = items + 1;
                }
                expect(items).toEqual(4);
                expect((<ap.viewmodels.notes.NoteItemViewModel>genericList.getItemAtIndex(0)).isRemoved).toEqual(true); //Added Group
                expect((<ap.viewmodels.notes.NoteItemViewModel>genericList.getItemAtIndex(1)).isRemoved).toEqual(true); //Added item
                expect(genericList.count).toEqual(8);// 4 items + 2 groups + added group + added item

            });
        });
    });

    describe("Feature: printReport", () => {
        let reportGeneratorViewModel: ap.viewmodels.reports.ReportGeneratorViewModel;
        let genericList: ap.viewmodels.notes.UserCommentPagedListViewModel, defLoadData;
        let pointReportParam: ap.misc.PointReportParams;
        let defIds;
        let defPrint;
        let ids;
        let selectedLanguage: ap.models.identFiles.Language;
        let currentMeeting: ap.models.meetings.Meeting;
        beforeEach(() => {

            currentMeeting = new ap.models.meetings.Meeting(Utility);
            currentMeeting.createByJson({ Id: "M1" });
            currentMeeting.IsSystem = false;

            specHelper.general.spyProperty(ap.viewmodels.reports.ReportGeneratorViewModel.prototype, "hasGenerateByUserInChargeAccess", specHelper.PropertyAccessor.Get).and.returnValue(true);

            defIds = $q.defer();
            spyOn(ap.viewmodels.reports.ReportTemplateListViewModel.prototype, "load");
            spyOn(ap.viewmodels.identificationfiles.languages.LanguageListViewModel.prototype, "selectByCode");



            specHelper.mainController.stub(MainController, Utility);
            genericList = new ap.viewmodels.notes.UserCommentPagedListViewModel($scope, Utility, Api, $q, ControllersManager, ServicesManager.reportService, ap.viewmodels.notes.NoteItemViewModel, null, null, null, groups, "InCharge", 4);
            spyOn(Api, "getEntityIds").and.returnValue(defIds.promise);
            ids = [];
            for (var i = 0; i < 50; i++) {
                ids.push(ap.utility.UtilityHelper.createGuid());
            }



            selectedLanguage = new ap.models.identFiles.Language(Utility);
            selectedLanguage.createByJson({ Id: "L1" });

        });
        afterEach(() => {
            specHelper.general.offSpyProperty(ap.viewmodels.reports.ReportGeneratorViewModel.prototype, "hasGenerateByUserInChargeAccess", specHelper.PropertyAccessor.Get);
        });

        xdescribe("WHEN printReport method is called in entire project", () => {
            beforeEach(() => {
                reportGeneratorViewModel = new ap.viewmodels.reports.ReportGeneratorViewModel($scope, Utility, $q, null, $timeout, Api, ReportController, MainController, MeetingController, ProjectController, ServicesManager, [ids[0]], ids, null);
                genericList.loadIds();
                let selectedLanguageVM = new ap.viewmodels.identificationfiles.languages.LanguageViewModel(Utility);
                selectedLanguageVM.init(selectedLanguage);
                specHelper.general.spyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get).and.returnValue(selectedLanguageVM);
                specHelper.general.spyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get).and.returnValue(null);

                defIds.resolve(new ap.services.apiHelper.ApiResponse(ids));
                $rootScope.$apply();

                defPrint = $q.defer();
                pointReportParam = new ap.misc.PointReportParams(Utility, new ap.models.reports.ProjectReportConfig(Utility));
                spyOn(ReportController, "createPointReportParams").and.returnValue(pointReportParam);
                spyOn(ServicesManager.reportService, "printPoints").and.returnValue(_deferred.promise);
                spyOn(MainController, "showMessageKey").and.returnValue(defPrint.promise);
                let result: any = {
                    PreviewUri: "https://app.aproplan.com/Print/abc.pdf"
                };
                _deferred.resolve(new ap.services.apiHelper.ApiResponse(result));

            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get);
            });

            it("THEN, the method reportController.createPointReportParams will be called without meetingId", () => {
                genericList.printReport(reportGeneratorViewModel, ap.viewmodels.reports.ReportGeneratorResponse.Generate);
                $rootScope.$apply();
                expect(ReportController.createPointReportParams).toHaveBeenCalled();
                expect((<jasmine.Spy>ReportController.createPointReportParams).calls.argsFor(0)[2]).toEqual(selectedLanguage);
                expect((<jasmine.Spy>ReportController.createPointReportParams).calls.argsFor(0)[3].length).toEqual(50);
                expect((<jasmine.Spy>ReportController.createPointReportParams).calls.argsFor(0)[4]).toBeFalsy();
                expect((<jasmine.Spy>ReportController.createPointReportParams).calls.argsFor(0)[5]).toBeUndefined();
            });


        });

        xdescribe("WHEN printReport method is called in the system meeting", () => {
            beforeEach(() => {
                reportGeneratorViewModel = new ap.viewmodels.reports.ReportGeneratorViewModel($scope, Utility, $q, null, $timeout, Api, ReportController, MainController, MeetingController, ProjectController, ServicesManager, [ids[0]], ids, null, undefined, undefined, currentMeeting);
                genericList.loadIds();
                let selectedLanguageVM = new ap.viewmodels.identificationfiles.languages.LanguageViewModel(Utility);
                selectedLanguageVM.init(selectedLanguage);
                specHelper.general.spyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get).and.returnValue(selectedLanguageVM);

                currentMeeting.IsSystem = true;
                specHelper.general.spyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get).and.returnValue(currentMeeting);

                defIds.resolve(new ap.services.apiHelper.ApiResponse(ids));
                $rootScope.$apply();

                defPrint = $q.defer();
                pointReportParam = new ap.misc.PointReportParams(Utility, new ap.models.reports.ProjectReportConfig(Utility));
                spyOn(ReportController, "createPointReportParams").and.returnValue(pointReportParam);
                spyOn(ServicesManager.reportService, "printPoints").and.returnValue(_deferred.promise);
                spyOn(MainController, "showMessageKey").and.returnValue(defPrint.promise);
                let result: any = {
                    PreviewUri: "https://app.aproplan.com/Print/abc.pdf"
                };
                _deferred.resolve(new ap.services.apiHelper.ApiResponse(result));

            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get);
            });

            it("THEN, the method reportController.createPointReportParams will be called without meetingId", () => {
                genericList.printReport(reportGeneratorViewModel, ap.viewmodels.reports.ReportGeneratorResponse.Generate);
                $rootScope.$apply();
                expect(ReportController.createPointReportParams).toHaveBeenCalled();
                expect((<jasmine.Spy>ReportController.createPointReportParams).calls.argsFor(0)[2]).toEqual(selectedLanguage);
                expect((<jasmine.Spy>ReportController.createPointReportParams).calls.argsFor(0)[3].length).toEqual(50);
                expect((<jasmine.Spy>ReportController.createPointReportParams).calls.argsFor(0)[4]).toBeFalsy();
                expect((<jasmine.Spy>ReportController.createPointReportParams).calls.argsFor(0)[5]).toBeUndefined();
            });


        });

        xdescribe("WHEN printReport method is called in the not system meeting", () => {
            beforeEach(() => {

                currentMeeting.IsSystem = false;
                reportGeneratorViewModel = new ap.viewmodels.reports.ReportGeneratorViewModel($scope, Utility, $q, null, $timeout, Api, ReportController, MainController, MeetingController, ProjectController, ServicesManager, [ids[0]], ids, null, undefined, undefined, currentMeeting);
                genericList.loadIds();
                let selectedLanguageVM = new ap.viewmodels.identificationfiles.languages.LanguageViewModel(Utility);
                selectedLanguageVM.init(selectedLanguage);
                specHelper.general.spyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get).and.returnValue(selectedLanguageVM);


                specHelper.general.spyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get).and.returnValue(currentMeeting);

                defIds.resolve(new ap.services.apiHelper.ApiResponse(ids));
                $rootScope.$apply();

                defPrint = $q.defer();
                pointReportParam = new ap.misc.PointReportParams(Utility, new ap.models.reports.ProjectReportConfig(Utility));
                spyOn(ReportController, "createPointReportParams").and.returnValue(pointReportParam);
                spyOn(ServicesManager.reportService, "printPoints").and.returnValue(_deferred.promise);
                spyOn(MainController, "showMessageKey").and.returnValue(defPrint.promise);
                let result: any = {
                    PreviewUri: "https://app.aproplan.com/Print/abc.pdf"
                };
                _deferred.resolve(new ap.services.apiHelper.ApiResponse(result));

            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get);
            });

            it("THEN, the method reportController.createPointReportParams will be called with meetingId", () => {
                genericList.printReport(reportGeneratorViewModel, ap.viewmodels.reports.ReportGeneratorResponse.Generate);
                $rootScope.$apply();
                expect(ReportController.createPointReportParams).toHaveBeenCalled();
                expect((<jasmine.Spy>ReportController.createPointReportParams).calls.argsFor(0)[2]).toEqual(selectedLanguage);
                expect((<jasmine.Spy>ReportController.createPointReportParams).calls.argsFor(0)[3].length).toEqual(50);
                expect((<jasmine.Spy>ReportController.createPointReportParams).calls.argsFor(0)[4]).toBeFalsy();
                expect((<jasmine.Spy>ReportController.createPointReportParams).calls.argsFor(0)[5]).toEqual("M1");
            });


        });


        xdescribe("WHEN printReport method is called with 'Generated'", () => {
            beforeEach(() => {

                currentMeeting.IsSystem = false;
                reportGeneratorViewModel = new ap.viewmodels.reports.ReportGeneratorViewModel($scope, Utility, $q, null, $timeout, Api, ReportController, MainController, MeetingController, ProjectController, ServicesManager, [ids[0]], ids, null, undefined, undefined, currentMeeting);
                let selectedLanguageVM = new ap.viewmodels.identificationfiles.languages.LanguageViewModel(Utility);
                selectedLanguageVM.init(selectedLanguage);
                specHelper.general.spyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get).and.returnValue(selectedLanguageVM);

                defIds.resolve(new ap.services.apiHelper.ApiResponse(ids));
                $rootScope.$apply();

                defPrint = $q.defer();
                pointReportParam = new ap.misc.PointReportParams(Utility, new ap.models.reports.ProjectReportConfig(Utility));
                pointReportParam.reportTitle = "Test report";
                spyOn(ReportController, "createPointReportParams").and.returnValue(pointReportParam);
                spyOn(ServicesManager.reportService, "printPoints").and.returnValue(_deferred.promise);
                spyOn(MainController, "showToast").and.returnValue(defPrint.promise);
                let result: any = {
                    PreviewUri: "https://app.aproplan.com/Print/abc.pdf"
                };
                _deferred.resolve(new ap.services.apiHelper.ApiResponse(result));

            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get);
            });

            it("THEN, the method reportController.createPointReportParams will be called", () => {
                genericList.printReport(reportGeneratorViewModel, ap.viewmodels.reports.ReportGeneratorResponse.Generate);
                $rootScope.$apply();
                expect(ReportController.createPointReportParams).toHaveBeenCalled();
                expect((<jasmine.Spy>ReportController.createPointReportParams).calls.argsFor(0)[2]).toEqual(selectedLanguage);
                expect((<jasmine.Spy>ReportController.createPointReportParams).calls.argsFor(0)[3].length).toEqual(50);
                expect((<jasmine.Spy>ReportController.createPointReportParams).calls.argsFor(0)[4]).toBeFalsy();
            });
            it("AND the method ServicesManager.reportService.printPoints will be called with isPreview = false and isSend = false", () => {
                genericList.printReport(reportGeneratorViewModel, ap.viewmodels.reports.ReportGeneratorResponse.Generate);
                $rootScope.$apply();
                expect(ServicesManager.reportService.printPoints).toHaveBeenCalledWith(pointReportParam, false, false);
            });
            it("AND after that the mainController.showToast will be show the message to the user", () => {
                genericList.printReport(reportGeneratorViewModel, ap.viewmodels.reports.ReportGeneratorResponse.Generate);
                $rootScope.$apply();
                expect(MainController.showToast).toHaveBeenCalledWith("app.report.report_save_msg", null);
            });
            it("AND return the promise with 'Generated' value", () => {
                let callback = jasmine.createSpy("callback");
                genericList.printReport(reportGeneratorViewModel, ap.viewmodels.reports.ReportGeneratorResponse.Generate).then(function (args) {
                    callback(args);
                });
                $rootScope.$apply();
                expect(callback).toHaveBeenCalledWith(ap.viewmodels.reports.ReportGeneratorResponse.Generate);
            });
        });

        xdescribe("WHEN printReport method is called with 'Send'", () => {
            let deferredCreateNewContact;

            beforeEach(() => {
                currentMeeting.IsSystem = false;
                reportGeneratorViewModel = new ap.viewmodels.reports.ReportGeneratorViewModel($scope, Utility, $q, null, $timeout, Api, ReportController, MainController, MeetingController, ProjectController, ServicesManager, [ids[0]], ids, null, undefined, undefined, currentMeeting);
                deferredCreateNewContact = $q.defer();

                let selectedLanguageVM = new ap.viewmodels.identificationfiles.languages.LanguageViewModel(Utility);
                selectedLanguageVM.init(selectedLanguage);
                specHelper.general.spyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get).and.returnValue(selectedLanguageVM);
                specHelper.general.spyProperty(ap.viewmodels.reports.ReportGeneratorViewModel.prototype, "canGoToSendByMail", specHelper.PropertyAccessor.Get).and.returnValue(true);

                defIds.resolve(new ap.services.apiHelper.ApiResponse(ids));
                $rootScope.$apply();

                defPrint = $q.defer();
                pointReportParam = new ap.misc.PointReportParams(Utility, new ap.models.reports.ProjectReportConfig(Utility));
                pointReportParam.reportTitle = "Test report";
                spyOn(ReportController, "createPointReportParams").and.returnValue(pointReportParam);
                spyOn(ServicesManager.reportService, "printPoints").and.returnValue(_deferred.promise);
                spyOn(MainController, "showToast").and.returnValue(defPrint.promise);
                let result: any = {
                    PreviewUri: "https://app.aproplan.com/Print/abc.pdf"
                };
                _deferred.resolve(new ap.services.apiHelper.ApiResponse(result));

                reportGeneratorViewModel.goToMailConfig();

                spyOn(reportGeneratorViewModel.sendReportViewModel, "createNewContacts").and.returnValue(deferredCreateNewContact.promise);

            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.viewmodels.reports.ReportGeneratorViewModel.prototype, "canGoToSendByMail", specHelper.PropertyAccessor.Get);
            });
            it("THEN, the sendReportViewModel.createNewContacts will be called", () => {
                genericList.printReport(reportGeneratorViewModel, ap.viewmodels.reports.ReportGeneratorResponse.Send);
                expect(reportGeneratorViewModel.sendReportViewModel.createNewContacts).toHaveBeenCalled();
            });

            it("THEN, the method reportController.createPointReportParams will be called", () => {
                genericList.printReport(reportGeneratorViewModel, ap.viewmodels.reports.ReportGeneratorResponse.Send);
                deferredCreateNewContact.resolve(true);
                $rootScope.$apply();
                expect(ReportController.createPointReportParams).toHaveBeenCalled();
                expect((<jasmine.Spy>ReportController.createPointReportParams).calls.argsFor(0)[2]).toEqual(selectedLanguage);
                expect((<jasmine.Spy>ReportController.createPointReportParams).calls.argsFor(0)[3].length).toEqual(50);
                expect((<jasmine.Spy>ReportController.createPointReportParams).calls.argsFor(0)[4]).toBeFalsy();
            });
            it("AND the method ServicesManager.reportService.printPoints will be called with isPreview = false and isSend = false", () => {
                genericList.printReport(reportGeneratorViewModel, ap.viewmodels.reports.ReportGeneratorResponse.Send);
                deferredCreateNewContact.resolve(true);
                $rootScope.$apply();
                expect(ServicesManager.reportService.printPoints).toHaveBeenCalledWith(pointReportParam, false, true);
            });
            it("AND after that the mainController.showToast will be show the message to the user", () => {
                genericList.printReport(reportGeneratorViewModel, ap.viewmodels.reports.ReportGeneratorResponse.Send);
                deferredCreateNewContact.resolve(true);
                $rootScope.$apply();
                expect(MainController.showToast).toHaveBeenCalledWith("app.report.project_report_send_msg", null, null, ["Test report"]);

            });
            it("AND return the promise with 'Send' value", () => {
                let callback = jasmine.createSpy("callback");
                genericList.printReport(reportGeneratorViewModel, ap.viewmodels.reports.ReportGeneratorResponse.Send).then(function (args) {
                    callback(args);
                });
                deferredCreateNewContact.resolve(true);
                $rootScope.$apply();
                expect(callback).toHaveBeenCalledWith(ap.viewmodels.reports.ReportGeneratorResponse.Send);
            });

        });

        xdescribe("WHEN printReport method is called with isPreview = true and the list ids < 50", () => {

            let defPlanCount: angular.IDeferred<any>;
            let callback: jasmine.Spy;
            let callbackReject: jasmine.Spy;

            beforeEach(() => {

                defIds.resolve(new ap.services.apiHelper.ApiResponse(ids));
                $rootScope.$apply();

                defPrint = $q.defer();
                pointReportParam = new ap.misc.PointReportParams(Utility, new ap.models.reports.ProjectReportConfig(Utility));
                pointReportParam.customIdsToPrint = ids;
                spyOn(ReportController, "createPointReportParams").and.returnValue(pointReportParam);

                defPlanCount = $q.defer();
                spyOn(ReportController, "getCountPlanPreview").and.returnValue(defPlanCount.promise);
                spyOn(ServicesManager.reportService, "printPoints").and.returnValue(_deferred.promise);
                spyOn(Utility, "openPopup").and.returnValue(defPrint.promise);

                let result: any = {
                    PreviewUri: "https://app.aproplan.com/Print/abc.pdf"
                };
                _deferred.resolve(new ap.services.apiHelper.ApiResponse(result));

                callback = jasmine.createSpy("callback");
                callbackReject = jasmine.createSpy("callbackReject");
                genericList.printReport(reportGeneratorViewModel, ap.viewmodels.reports.ReportGeneratorResponse.Preview).then(function (args) {
                    callback(args);
                }, (reason: any) => {
                    callbackReject(reason);
                });
            });

            it("THEN reportController.getPlanCountPreview is called", () => {
                expect(ReportController.getCountPlanPreview).toHaveBeenCalledWith(pointReportParam);
            });

            describe("AND there is less than 5 plans", () => {
                beforeEach(() => {
                    defPlanCount.resolve(4);
                    $rootScope.$apply();
                });

                it("THEN, printPointReport is called", () => {
                    expect(ServicesManager.reportService.printPoints).toHaveBeenCalled();
                });
            });

            describe("AND there is more than 5 plans", () => {

                it("THEN, MainContoller.showConfirmKey is called", () => {
                    spyOn(MainController, "showConfirmKey");
                    defPlanCount.resolve(7);
                    $rootScope.$apply();

                    expect(MainController.showConfirmKey).toHaveBeenCalled();
                });

                it("AND WHEN the user clicks on SEND BY EMAIL", () => {
                    spyOn(MainController, "showConfirmKey").and.callFake(function (message, title, callback) {
                        if (message === "app.report.5_attachements")
                            callback(ap.controllers.MessageResult.LeftKey);
                    });

                    defPlanCount.resolve(7);
                    $rootScope.$apply();

                    expect(ServicesManager.reportService.printPoints).toHaveBeenCalledWith(pointReportParam, false, true);
                });

                it("AND WHEN the user clicks on CANCEL", () => {
                    spyOn(MainController, "showConfirmKey").and.callFake(function (message, title, callback) {
                        if (message === "app.report.5_attachements")
                            callback(ap.controllers.MessageResult.Negative);
                    });

                    defPlanCount.resolve(7);
                    $rootScope.$apply();

                    expect(ServicesManager.reportService.printPoints).not.toHaveBeenCalled();
                    expect(callbackReject).toHaveBeenCalled();
                });

                it("AND WHEN the user clicks on CANCEL", () => {
                    spyOn(MainController, "showConfirmKey").and.callFake(function (message, title, callback) {
                        if (message === "app.report.5_attachements")
                            callback(ap.controllers.MessageResult.Positive);
                    });

                    defPlanCount.resolve(7);
                    $rootScope.$apply();

                    expect(ServicesManager.reportService.printPoints).toHaveBeenCalledWith(pointReportParam, true, false);
                });
            });
        });

        xdescribe("WHEN printReport method is called with isPreview = true and the list ids > 50", () => {
            let defRights: angular.IDeferred<any>;
            let def: angular.IDeferred<any>;
            let callback: jasmine.Spy;
            beforeEach(() => {
                for (let i = 0; i < 10; i++) {
                    ids.push(ap.utility.UtilityHelper.createGuid());
                }
                defIds.resolve(new ap.services.apiHelper.ApiResponse(ids));
                $rootScope.$apply();
                callback = jasmine.createSpy("callback");
                defPrint = $q.defer();
                def = $q.defer();
                defRights = $q.defer();
                pointReportParam = new ap.misc.PointReportParams(Utility, new ap.models.reports.ProjectReportConfig(Utility));
                pointReportParam.reportTitle = "Test report";
                pointReportParam.customIdsToPrint = ids;
                spyOn(ReportController, "createPointReportParams").and.returnValue(pointReportParam);
                spyOn(ServicesManager.reportService, "printPoints").and.returnValue(_deferred.promise);
                spyOn(MainController, "showToast").and.returnValue(defPrint.promise);

                let result: any = {
                    PreviewUri: "https://app.aproplan.com/Print/abc.pdf"
                };
                _deferred.resolve(new ap.services.apiHelper.ApiResponse(result));
            });

            describe("WHEN the number of plans is less than 5", () => {
                it("THEN, the confirm message will be show to the user", () => {
                    defRights = $q.defer();
                    spyOn(MainController, "showConfirmKey").and.returnValue(defRights.promise);
                    genericList.printReport(reportGeneratorViewModel, ap.viewmodels.reports.ReportGeneratorResponse.Preview);
                    $rootScope.$apply();
                    expect(MainController.showConfirmKey).toHaveBeenCalled();
                });
                it("AND if the user select 'Send by mail'. THEN, the ServicesManager.reportService.printPoints will be called with isPreview = false and isSend = true", () => {
                    // Spy on the message confirm and simulate confirm yes
                    spyOn(MainController, "showConfirmKey").and.callFake(function (message, title, callback) {
                        if (message === "app.report.confirm_preview_to_mail")
                            callback(ap.controllers.MessageResult.LeftKey);
                    });

                    genericList.printReport(reportGeneratorViewModel, ap.viewmodels.reports.ReportGeneratorResponse.Preview);

                    $rootScope.$apply();

                    expect(ServicesManager.reportService.printPoints).toHaveBeenCalledWith(pointReportParam, false, true);

                    expect(MainController.showToast).toHaveBeenCalledWith("app.report.project_report_send_msg", null, null, ["Test report"]);
                });
                it("AND if the user select 'Cancel', the ServicesManager.reportService.printPoints will not be called", () => {

                    let callbackReject = jasmine.createSpy("callback");
                    // Spy on the message confirm and simulate confirm no
                    spyOn(MainController, "showConfirmKey").and.callFake(function (message, title, callback) {
                        callback(ap.controllers.MessageResult.Negative);
                    });

                    genericList.printReport(reportGeneratorViewModel, ap.viewmodels.reports.ReportGeneratorResponse.Preview).then(() => { }, function () {
                        callbackReject();
                    });

                    $rootScope.$apply();
                    expect(ServicesManager.reportService.printPoints).not.toHaveBeenCalled();
                    expect(callbackReject).toHaveBeenCalled();
                });

                it("AND if the user select 'Preview', the ServicesManager.reportService.printPoints will called with limit 50 points", () => {
                    spyOn(Utility, "openPopup");

                    let callbackReject = jasmine.createSpy("callback");
                    // Spy on the message confirm and simulate confirm no
                    spyOn(MainController, "showConfirmKey").and.callFake(function (message, title, callback) {
                        callback(ap.controllers.MessageResult.Positive);
                    });

                    genericList.printReport(reportGeneratorViewModel, ap.viewmodels.reports.ReportGeneratorResponse.Preview).then(() => { }, function () {
                        callbackReject();
                    });
                    pointReportParam.customIdsToPrint = pointReportParam.customIdsToPrint.slice(0, 50);

                    $rootScope.$apply();
                    expect(ServicesManager.reportService.printPoints).toHaveBeenCalledWith(pointReportParam, true, false);
                    expect(callbackReject).not.toHaveBeenCalled();
                });
            });
        });

        xdescribe("WHEN printReport method is called and the pointToPrintType = 'Selected'", () => {
            let checkedItem: ap.viewmodels.notes.NoteItemViewModel[];
            beforeEach(() => {
                spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue($q.defer().promise);

                checkedItem = [];
                let item1 = new ap.viewmodels.notes.NoteItemViewModel(Utility, $q, null, new ap.viewmodels.notes.UserCommentItemConstructorParameter(null, null, null, null, Utility, ControllersManager));
                let note1 = new ap.models.notes.Note(Utility);
                note1.createByJson({ Id: "1" });
                item1.init(note1);
                item1.originalId = "1";

                let item2 = new ap.viewmodels.notes.NoteItemViewModel(Utility, $q, null, new ap.viewmodels.notes.UserCommentItemConstructorParameter(null, null, null, null, Utility, ControllersManager));
                let note2 = new ap.models.notes.Note(Utility);
                note2.createByJson({ Id: "2" });
                item2.init(note2);
                item2.originalId = "2";

                checkedItem.push(item1);
                checkedItem.push(item2);

                reportGeneratorViewModel.pointToPrintType = ap.viewmodels.reports.ReportPointToPrintType.Selected;

                defIds.resolve(new ap.services.apiHelper.ApiResponse(ids));
                $rootScope.$apply();
                defPrint = $q.defer();
                pointReportParam = new ap.misc.PointReportParams(Utility, new ap.models.reports.ProjectReportConfig(Utility));
                spyOn(ReportController, "createPointReportParams").and.returnValue(pointReportParam);
                spyOn(ServicesManager.reportService, "printPoints").and.returnValue(_deferred.promise);
                spyOn(MainController, "showMessageKey").and.returnValue(defPrint.promise);
                let result: any = {
                    PreviewUri: "https://app.aproplan.com/Print/abc.pdf"
                };
                _deferred.resolve(new ap.services.apiHelper.ApiResponse(result));

            });

            it("THEN, the method reportController.createPointReportParams will be called with the checked items", () => {

                spyOn(genericList, "getCheckedItems").and.returnValue(checkedItem);
                genericList.printReport(reportGeneratorViewModel, ap.viewmodels.reports.ReportGeneratorResponse.Generate);
                $rootScope.$apply();
                expect(ReportController.createPointReportParams).toHaveBeenCalled();
                expect((<jasmine.Spy>ReportController.createPointReportParams).calls.argsFor(0)[3].length).toEqual(2);
                expect((<jasmine.Spy>ReportController.createPointReportParams).calls.argsFor(0)[3][0]).toEqual("1");
                expect((<jasmine.Spy>ReportController.createPointReportParams).calls.argsFor(0)[3][1]).toEqual("2");

            });

            it("THEN, the method reportController.createPointReportParams will be called with the selected item when there is no checked items", () => {
                spyOn(genericList, "getCheckedItems").and.returnValue([]);
                specHelper.general.spyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get).and.returnValue(checkedItem[0]);

                genericList.printReport(reportGeneratorViewModel, ap.viewmodels.reports.ReportGeneratorResponse.Generate);
                $rootScope.$apply();
                expect(ReportController.createPointReportParams).toHaveBeenCalled();
                expect((<jasmine.Spy>ReportController.createPointReportParams).calls.argsFor(0)[3].length).toEqual(1);
                expect((<jasmine.Spy>ReportController.createPointReportParams).calls.argsFor(0)[3][0]).toEqual("1");
                specHelper.general.offSpyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get);
            });

            it("THEN, will show the error message if there is no checked items and no selected item", () => {
                spyOn(genericList, "getCheckedItems").and.returnValue([]);
                specHelper.general.spyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get).and.returnValue(null);
                genericList.printReport(reportGeneratorViewModel, ap.viewmodels.reports.ReportGeneratorResponse.Generate);
                $rootScope.$apply();
                expect(MainController.showMessageKey).toHaveBeenCalledWith("app.report.no_point_selected_message", "app.err.general_title", null, ap.controllers.MessageButtons.Ok);
                specHelper.general.offSpyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get);
            });

        });

        xdescribe("WHEM printReport and there is an error", () => {
            let errorCallback: jasmine.Spy;
            beforeEach(() => {

                let selectedLanguageVM = new ap.viewmodels.identificationfiles.languages.LanguageViewModel(Utility);
                selectedLanguageVM.init(selectedLanguage);
                specHelper.general.spyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get).and.returnValue(selectedLanguageVM);

                defIds.resolve(new ap.services.apiHelper.ApiResponse(ids));
                $rootScope.$apply();

                pointReportParam = new ap.misc.PointReportParams(Utility, new ap.models.reports.ProjectReportConfig(Utility));
                spyOn(ReportController, "createPointReportParams").and.returnValue(pointReportParam);


                _http.when("POST", function (url) {
                    return true;
                }).respond(500, [{
                    ErrorCode: "Error_Code",
                    Type: "AproPlan.Entities.Exception",
                    Message: "Exception_Message"
                }]);

                errorCallback = jasmine.createSpy("showError");
                MainController.on("showerror", () => { errorCallback(); }, MainController);

                genericList.printReport(reportGeneratorViewModel, ap.viewmodels.reports.ReportGeneratorResponse.Generate);
                _http.flush();
                $rootScope.$apply();
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get);
            });

            it("THEN, the error is show will be called", () => {
                expect(errorCallback).toHaveBeenCalled();
            });
        });
    });

    describe("Feature: Checked changed", () => {
        describe("WHEN a list is load and item is checked", function () {
            let genericList: ap.viewmodels.notes.UserCommentPagedListViewModel,
                ids,
                defLoadData;
            let apiOpt = new ap.services.apiHelper.ApiOption();
            let callback;
            beforeEach(() => {
                defLoadData = $q.defer();
                genericList = new ap.viewmodels.notes.UserCommentPagedListViewModel($scope, Utility, Api, $q, ControllersManager, ServicesManager.reportService, ap.viewmodels.notes.NoteItemViewModel, null, null, null, groups, "None", 3);

                spyOn(Api, "getEntityIds").and.returnValue(_deferred.promise);
                spyOn(genericList, "loadIds").and.callThrough();
                spyOn(ProjectController, "getNoteProjectStatusList").and.returnValue($q.defer().promise);

                genericList.loadIds();

                let ids = ['b8d13dfc-4124-4340-be59-fbc2b22db6a30', 'caeb3a53-94b3-4bea-b724-b686a724e3c5-4', 'a501aee5-4997-4717-96f2-3ddd1f098bef0'];
                _deferred.resolve(new ap.services.apiHelper.ApiResponse(ids));
                $rootScope.$apply();

                spyOn(Api, "getEntityList").and.callFake(function () {
                    return defLoadData.promise;
                });
                genericList.loadPage(0);

                defLoadData.resolve({ data: [dataNotes[0], dataNotes[1], dataNotes[2]] });
                $rootScope.$apply();

                callback = jasmine.createSpy("callback");
                genericList.on("isCheckedChanged", (item) => {
                    callback(item);
                }, this);

                genericList.sourceItems[0].isChecked = true;
            });
            it("THEN, The isCheckedChanged evemt is raised", function () {
                expect(callback).toHaveBeenCalledWith(genericList.sourceItems[0]);
            });
        });
    });

    describe("Feature: reportstatusrefreshed", () => {
        let reportRequest: ap.models.reports.ReportRequest;
        let deferredToast;
        let defferApi;
        beforeEach(() => {
            let genericList = new ap.viewmodels.notes.UserCommentPagedListViewModel($scope, Utility, Api, $q, ControllersManager, ServicesManager.reportService);

            reportRequest = new ap.models.reports.ReportRequest(Utility);
            reportRequest.createByJson({ Id: "R1", ReportTitle: "Report 1", DocumentId: "123" });
            reportRequest.Status = ap.models.reports.ReportRequestStatus.Generated;

            deferredToast = $q.defer();
            defferApi = $q.defer();

            spyOn(MainController, "showToast").and.returnValue(deferredToast.promise);
            spyOn(ReportController, "unregisterReportRequestStatusRefresh");
            spyOn(ControllersManager.documentController, "downloadDocument");
            spyOn(Api, "getEntityById").and.returnValue(defferApi.promise);

        });
        describe("WHEN 'reportstatusrefreshed' event was fired from the reportcontroller with the reportrequest have been generated", () => {
            beforeEach(() => {
                specHelper.general.raiseEvent(ReportController, "reportstatusrefreshed", reportRequest);
            });
            it("THEN, mainController.showToast will be called", () => {
                expect(MainController.showToast).toHaveBeenCalledWith("ap.report.originalplans_ready_download_message", reportRequest, "Download", [reportRequest.ReportTitle]);
            });
            it("AND when the promise was resolved, getEntity will be called and downloadDocument", () => {
                deferredToast.resolve(reportRequest);
                defferApi.resolve(new ap.services.apiHelper.ApiResponse({ Id: "R1" }));
                $rootScope.$apply();
                expect(ControllersManager.documentController.downloadDocument).toHaveBeenCalled();
            });
            it("AND then, unregisterReportRequestStatusRefresh method will be called", () => {
                expect(ReportController.unregisterReportRequestStatusRefresh).toHaveBeenCalledWith(reportRequest);
            });
        });
        describe("WHEN 'reportstatusrefreshed' event was fired from the reportcontroller with the reportrequest have not been generated", () => {
            beforeEach(() => {
                reportRequest.Status = ap.models.reports.ReportRequestStatus.InProgress;
                specHelper.general.raiseEvent(ReportController, "reportstatusrefreshed", reportRequest);
            });
            it("THEN, mainController.showToast will not be called", () => {
                expect(MainController.showToast).not.toHaveBeenCalled();
            });
            it("AND then, unregisterReportRequestStatusRefresh method will not be called", () => {
                expect(ReportController.unregisterReportRequestStatusRefresh).not.toHaveBeenCalled();
            });
        });
    });

    describe("Feature: noteUpdatedHandler", () => {
        let notevm1: ap.viewmodels.notes.NoteItemViewModel;
        let notevm2: ap.viewmodels.notes.NoteItemViewModel;
        let genericList: ap.viewmodels.notes.UserCommentPagedListViewModel;
        beforeEach(() => {
            specHelper.mainController.stub(MainController, Utility);
            let note1: ap.models.notes.Note = new ap.models.notes.Note(Utility);
            note1.createByJson({ Id: "123" });
            let note2: ap.models.notes.Note = new ap.models.notes.Note(Utility);
            note2.createByJson({ Id: "456" });
            notevm1 = new ap.viewmodels.notes.NoteItemViewModel(Utility, $q, null, new ap.viewmodels.notes.UserCommentItemConstructorParameter(0, null, null, null, Utility, ControllersManager));
            notevm1.init(note1);
            notevm1.isChecked = true;
            notevm2 = new ap.viewmodels.notes.NoteItemViewModel(Utility, $q, null, new ap.viewmodels.notes.UserCommentItemConstructorParameter(0, null, null, null, Utility, ControllersManager));
            notevm2.init(note2);
            notevm2.isChecked = true;
            genericList = new ap.viewmodels.notes.UserCommentPagedListViewModel($scope, Utility, Api, $q, ControllersManager, ServicesManager.reportService);
            spyOn(genericList, "getCheckedItems").and.returnValue([notevm1, notevm2]);
            spyOn(genericList, "updateItem");
            specHelper.general.raiseEvent(ControllersManager.noteController, "noteupdated", new ap.controllers.NoteBaseUpdatedEvent([note1, note2], []));
        });
        it("THEN updateItem is called twice", () => {
            expect((<jasmine.Spy>genericList.updateItem).calls.count()).toEqual(2);
        });
        it("THEN notevm1.isChecked is false", () => {
            expect(notevm1.isChecked).toBeFalsy();
        });
        it("THEN notevm2.isChecked is false", () => {
            expect(notevm2.isChecked).toBeFalsy();
        });
    });

    describe("Feature: comment updated", () => {

        let genericList: ap.viewmodels.notes.UserCommentPagedListViewModel;

        beforeEach(() => {
            let specParams: any = createVm(ap.viewmodels.notes.NoteItemViewModel, "property", null, null, groups, "None", 50);
            genericList = specParams.list;

            // load the data
            initVm(genericList, specParams.loadIdsDeferred, specParams.loadDataDeferred)

            let updatedNote = new ap.models.notes.Note(Utility);
            updatedNote.createByJson({
                Id: genericList.getItemAtIndex(0).originalEntity.Id,
                EntityVersion: 12
            });
            specHelper.general.raiseEvent(NoteController, "commentsaved", new ap.controllers.CommentSavedEvent(null, genericList.getItemAtIndex(0).originalEntity.Id, true, updatedNote));
        });

        describe("WHEN 'commentsaved' event is raised from NoteController", () => {
            it("THEN the entityVersion property of the corresponding note in the list are updated", () => {
                expect(genericList.getItemAtIndex(0).originalEntity.EntityVersion).toBe(12);
            });
        });
    });
});