describe("Module ap-viewmodels - documentListViewModel", () => {
    let $mdSidenav, $mdDialog: angular.material.IDialogService;
    let ServicesManager: ap.services.ServicesManager;
    let MainController: ap.controllers.MainController, Utility: ap.utility.UtilityHelper, Api: ap.services.apiHelper.Api, UserContext: ap.utility.UserContext, UIStateController: ap.controllers.UIStateController,
        DocumentService: ap.services.DocumentService;
    let $controller: angular.IControllerService, $rootScope: angular.IRootScopeService, $scope: angular.IScope, $q: angular.IQService, $timeout: angular.ITimeoutService, $compile: angular.ICompileService;
    let vm: ap.viewmodels.documents.DocumentListViewModel;
    let DocumentController: ap.controllers.DocumentController;
    let ControllersManager: ap.controllers.ControllersManager;
    let idsDocuments = ["b360cb6d-ca54-4b93-a564-a469274eb68a", "35a2c5d6-0e00-43e9-ada8-ce4f3fadb16e", "bf70c80f-3b76-4bf8-bef4-86c7b1d4aa60", "bf70c80f-3b76-8jf8-bef4-8kreb1d4aa60", "2941f296-be77-4681-98b7-720d15b23f6a",
        "2237b414-098a-48f1-af55-f62f61b10439", "c629417f-9533-4223-8bd0-521cdd61aa3a", "b1406f37-f02e-4b36-9a2a-9d6d12149143"];
    let version1 = modelSpecHelper.createFakeVersion(Utility, "v0", 0);
    let version2 = modelSpecHelper.createFakeVersion(Utility, "v1", 0);
    let dataDocuments = [
        {
            Id: "b360cb6d-ca54-4b93-a564-a469274eb68a",
            Name: "House 1",
            Author: {
                Id: "User1"
            },
            VersionCount: 1,
            PageCount: 1
        },
        {
            Id: "35a2c5d6-0e00-43e9-ada8-ce4f3fadb16e",
            Name: "House 2",
            Author: {
                Id: "User1"
            },
            VersionCount: 2,
            PageCount: 1,
            Versions: [version1, version2]
        },
        {
            Id: "bf70c80f-3b76-4bf8-bef4-86c7b1d4aa60",
            Name: "House 3",
            Author: {
                Id: "User1"
            },
            VersionCount: 1,
            PageCount: 1
        },
        {
            Id: "bf70c80f-3b76-8jf8-bef4-8kreb1d4aa60",
            Name: "House 4",
            Author: {
                Id: "User1"
            },
            VersionCount: 1,
            PageCount: 1
        },
        {
            Id: "2941f296-be77-4681-98b7-720d15b23f6a",
            Name: "House 5",
            Author: {
                Id: "User1"
            },
            VersionCount: 1,
            PageCount: 1
        },
        {
            Id: "2237b414-098a-48f1-af55-f62f61b10439",
            Name: "House 6",
            Author: {
                Id: "User1"
            },
            VersionCount: 1,
            PageCount: 1
        },
        {
            Id: "c629417f-9533-4223-8bd0-521cdd61aa3a",
            Name: "House 7",
            Author: {
                Id: "User1"
            },
            VersionCount: 1,
            PageCount: 1
        },
        {
            Id: "b1406f37-f02e-4b36-9a2a-9d6d12149143",
            Name: "House 8", 
            Author: {
                Id: "User1"
            },
            VersionCount: 1,
            PageCount: 1
        }
    ];

    let defIds: angular.IDeferred<ap.services.apiHelper.ApiResponse>;
    let defDocsData: angular.IDeferred<ap.services.apiHelper.ApiResponse>;
    let options: ap.services.apiHelper.ApiOption;
    let currentProject: ap.models.projects.Project;
    let meeting: ap.models.meetings.Meeting;

    function initializeViewModel(loadIds: boolean = true, loadData: boolean = true, isForDocumentModule: boolean = false, isMeetingDocument: boolean= false) {
        defIds = $q.defer();
        defDocsData = $q.defer();

        spyOn(Api, "getApiResponse").and.callFake(function (url, method) {
            if ((url.indexOf("rest/documentsids") === 0 || url.indexOf("rest/meetingdocumentsids") === 0) && method === ap.services.apiHelper.MethodType.Get)
                return defIds.promise;
            else if ((url.indexOf("rest/documents") === 0 || url.indexOf("rest/meetingdocuments") === 0) && method === ap.services.apiHelper.MethodType.Get)
                return defDocsData.promise;

            return null;
        });

        options = new ap.services.apiHelper.ApiOption();
        let customParams: Array<ap.services.apiHelper.ApiCustomParam> = [];
        customParams.push(new ap.services.apiHelper.ApiCustomParam("ppactions", "updatedisplaynamesfromcontacts"));
        options.customParams = customParams;
        options.async = true;

        let docListOption = new ap.viewmodels.documents.DocumentListOptions(false, false, false, false, false, false, isMeetingDocument);

        vm = new ap.viewmodels.documents.DocumentListViewModel($scope, $mdDialog, Utility, Api, $q, $timeout, ControllersManager, ServicesManager, docListOption, null, isForDocumentModule);
        $rootScope.$apply();

        if (loadIds) {
            vm.load();

            defIds.resolve(new ap.services.apiHelper.ApiResponse(idsDocuments));
            $rootScope.$apply();
            if (loadData) {
                defDocsData.resolve(new ap.services.apiHelper.ApiResponse(dataDocuments));
                $rootScope.$apply();
            }
        }
    }

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
        angular.mock.module(function ($provide) {
            $provide.factory('$mdDialog', ["$q", function ($q) {
                return specHelper.utility.stubShowMdDialog($q);
            }]);
        });
    });

    beforeEach(inject(function (_$rootScope_, _ServicesManager_, _$q_, _$timeout_, _$mdDialog_, _$compile_, _UserContext_, _Utility_, _Api_, _MainController_, _DocumentController_, _UIStateController_, _$controller_, _ControllersManager_) {
        MainController = _MainController_;
        DocumentController = _DocumentController_;
        ControllersManager = _ControllersManager_;
        UIStateController = _UIStateController_;
        Utility = _Utility_;
        UserContext = _UserContext_;
        Api = _Api_;
        vm = null;
        ServicesManager = _ServicesManager_;
        $q = _$q_;
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $mdDialog = _$mdDialog_;
        $timeout = _$timeout_;
        $controller = _$controller_;
        $scope = $rootScope.$new();
        specHelper.utility.stubRootUrl(Utility);
        specHelper.userContext.stub(Utility);
        specHelper.utility.stubStorageSet(Utility);

        specHelper.general.spyProperty(ap.controllers.UIStateController.prototype, "mainFlowState", specHelper.PropertyAccessor.Get).and.returnValue(ap.controllers.MainFlow.Documents);
        specHelper.general.initStub(ap.viewmodels.notes.AddEditNoteViewModel, "initMeetingSelector");

        currentProject = specHelper.mainController.stub(MainController, Utility);        
        let noteWorkspaceVm: ap.viewmodels.notes.NoteWorkspaceViewModel;
        noteWorkspaceVm = new ap.viewmodels.notes.NoteWorkspaceViewModel($scope, $mdSidenav, Utility, Api, $q, $mdDialog, $timeout, null, null, null, ControllersManager, ServicesManager, null, false);
        meeting = new ap.models.meetings.Meeting(Utility);

        meeting.createByJson({
            Id: "ddd", 
            IsSystem: false,
            IsPublic: false, 
            Title: "My meeting"
        });
        let meetingAccessRigth = new ap.models.accessRights.MeetingAccessRight(Utility);
        meetingAccessRigth.createByJson({
            Id: "eee", 
            CanAddDoc: true
        });
        meeting.UserAccessRight = meetingAccessRigth;
        specHelper.general.spyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get).and.returnValue(meeting);
        specHelper.general.spyProperty(ap.viewmodels.documents.DocumentViewModel.prototype, "noteWorkspaceVm", specHelper.PropertyAccessor.Get).and.returnValue(noteWorkspaceVm);
        let def = $q.defer();
        spyOn(ControllersManager.accessRightController, "getMeetingAccessRight").and.returnValue(def.promise);
        def.resolve(null);
    }));
    afterEach(() => {
        specHelper.general.removeStub(ap.viewmodels.notes.AddEditNoteViewModel, "initMeetingSelector");
        specHelper.general.offSpyProperty(ap.controllers.UIStateController.prototype, "mainFlowState", specHelper.PropertyAccessor.Get);
        specHelper.general.offSpyProperty(ap.viewmodels.documents.DocumentViewModel.prototype, "noteWorkspaceVm", specHelper.PropertyAccessor.Get);
        specHelper.general.offSpyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get);
    });

    describe("Feature: Default values", () => {

        let docListOptions: ap.viewmodels.documents.DocumentListOptions;
        beforeEach(() => {
            docListOptions = new ap.viewmodels.documents.DocumentListOptions(false, false, false, false, false, true);
            

            spyOn(docListOptions, "getPathToLoad").and.returnValue("mypathtoload");
            spyOn(Api, "getEntityIds");

        });

        it("can get an instance of my viewmodel with meetingId and _entityPrefix is MeetingDocument", () => {
            vm = new ap.viewmodels.documents.DocumentListViewModel($scope, $mdDialog, Utility, Api, $q, $timeout, ControllersManager, ServicesManager, new ap.viewmodels.documents.DocumentListOptions(false, false, false, false, false, false, true), null, null);
            $rootScope.$apply();
            expect(vm.listVm.options.entityName).toBe("MeetingDocument");
        });

        it("can get an instance of my viewmodel without meetingId and _entityPrefix is Document", () => {
            vm = new ap.viewmodels.documents.DocumentListViewModel($scope, $mdDialog, Utility, Api, $q, $timeout, ControllersManager, ServicesManager, docListOptions);
            $rootScope.$apply();
            expect(vm.listVm.options.entityName).toBe("Document");
        });

        it("can get an instance of my viewmodel with default values AND listVm is defined", () => {
            vm = new ap.viewmodels.documents.DocumentListViewModel($scope, $mdDialog, Utility, Api, $q, $timeout, ControllersManager, ServicesManager, docListOptions);
            $rootScope.$apply();

            expect(vm.listVm).toBeDefined();
        });

        it("can get an instance of my viewmodel with default values AND pathToLoad is the one given by docListOptions", () => {
            vm = new ap.viewmodels.documents.DocumentListViewModel($scope, $mdDialog, Utility, Api, $q, $timeout, ControllersManager, ServicesManager, docListOptions);
            $rootScope.$apply();

            expect(vm.listVm.pathToLoad).toBe("mypathtoload");
        });

        it("can get an instance of my viewmodel with default values AND Api.getEntityIds is not called", () => {
            vm = new ap.viewmodels.documents.DocumentListViewModel($scope, $mdDialog, Utility, Api, $q, $timeout, ControllersManager, ServicesManager, docListOptions);
            $rootScope.$apply();

            expect(Api.getEntityIds).not.toHaveBeenCalled();
        });

        it("can get an instance of my viewmodel with default values AND the default view is Grid", () => {
            vm = new ap.viewmodels.documents.DocumentListViewModel($scope, $mdDialog, Utility, Api, $q, $timeout, ControllersManager, ServicesManager, docListOptions);
            $rootScope.$apply();

            expect(vm.view).toBe(ap.viewmodels.documents.View.Grid);
        });

        it("can get an instance of my viewmodel with default values AND the default view is the one saved in the storage and isForDocumentModule = true", () => {
            spyOn(Utility.Storage.Local, "get").and.returnValue(ap.viewmodels.documents.View.Thumb);

            vm = new ap.viewmodels.documents.DocumentListViewModel($scope, $mdDialog, Utility, Api, $q, $timeout, ControllersManager, ServicesManager, docListOptions, undefined, true);
            $rootScope.$apply();

            expect(vm.view).toBe(ap.viewmodels.documents.View.Thumb);
        });

        it("can get an instance of my viewmodel with default values AND isForDocumentModule = false AND the default view is grid ", () => {
            spyOn(Utility.Storage.Local, "get").and.returnValue(ap.viewmodels.documents.View.Thumb);

            vm = new ap.viewmodels.documents.DocumentListViewModel($scope, $mdDialog, Utility, Api, $q, $timeout, ControllersManager, ServicesManager, docListOptions, undefined, false);
            $rootScope.$apply();

            expect(vm.view).toBe(ap.viewmodels.documents.View.Grid);
        });

        it("can get an instance of my viewmodel with default values AND the default sortOrder is saved in the session", () => {
            vm = new ap.viewmodels.documents.DocumentListViewModel($scope, $mdDialog, Utility, Api, $q, $timeout, ControllersManager, ServicesManager, docListOptions);
            $rootScope.$apply();

            expect(vm.SortState.Name).toEqual(ap.component.dataTable.SortType.None);
        });
        /*it("can get an instance of my viewmodel with default values AND the default pictureViewModel is null", () => {
            vm = new ap.viewmodels.documents.DocumentListViewModel($scope, $mdDialog, Utility, Api, $q, $timeout, ControllersManager, ServicesManager, docListOptions);
            $rootScope.$apply();

            expect(vm.pictureViewModel).toBeNull();
        });*/
        it("can get an instance of my viewmodel with default values AND the default folder is undefined", () => {
            vm = new ap.viewmodels.documents.DocumentListViewModel($scope, $mdDialog, Utility, Api, $q, $timeout, ControllersManager, ServicesManager, docListOptions);
            $rootScope.$apply();
            expect(vm.folder).toBeUndefined();
        });
        it("can get an instance of my viewmodel with default values AND addAccessEight", () => {
            vm = new ap.viewmodels.documents.DocumentListViewModel($scope, $mdDialog, Utility, Api, $q, $timeout, ControllersManager, ServicesManager, docListOptions);
            $rootScope.$apply();
            expect(vm.addAccessRight).toBeDefined();
            expect(vm.addAccessRight.folder).toBe(vm.folder);
            expect(vm.addAccessRight.document).toBeNull();
            expect(vm.addAccessRight.project).toBe(MainController.currentProject());
        });
    });

    describe("ScreenInfo", () => {
        let advancedFilter: ap.misc.AdvancedFilter[];
        let predefinedFilter: ap.misc.PredefinedFilter[];
        let addAction: ap.viewmodels.home.ActionViewModel;
        beforeEach(() => {
            advancedFilter = [];
            advancedFilter.push(new ap.misc.AdvancedFilter(new ap.misc.PropertyInfo("All", null, true), null));
            advancedFilter.push(new ap.misc.AdvancedFilter(new ap.misc.PropertyInfo("Name", null, false, ap.misc.PropertyType.String), null));
            advancedFilter.push(new ap.misc.AdvancedFilter(new ap.misc.PropertyInfo("UploadedDate", "Upload date", false, ap.misc.PropertyType.Date), ap.misc.AdvancedFilter.pastDateShortcuts));
            advancedFilter.push(new ap.misc.AdvancedFilter(new ap.misc.PropertyInfo("UploadedBy.Person.Name", "Uploader", false, ap.misc.PropertyType.String), null));

            predefinedFilter = [];
            predefinedFilter.push(new ap.misc.PredefinedFilter("Active", "Active documents", true, Filter.isFalse("IsArchived"), null, ["Archived"]));
            predefinedFilter.push(new ap.misc.PredefinedFilter("Archived", "Archived documents", true, Filter.isTrue("IsArchived"), null, ["Active"]));

            addAction = new ap.viewmodels.home.ActionViewModel(Utility, Utility.EventTool, "document.uploaddoc", Utility.rootUrl + "/Images/html/icons/ic_add_black_48px.svg"
                , true, null, "Upload document", true, false, new ap.misc.Shortcut("c"));

        });
        describe("WHEN the vm is created", () => {
            beforeEach(() => {
                initializeViewModel(false, false, true);
            })
            it("THEN, the screenInfo is type list", () => {
                expect(vm.screenInfo.sType).toBe(ap.misc.ScreenInfoType.List);
            });
            it("THEN, the advancedFilter contains Name, UpdatedDate, And Uploader properties in the mainSearch", () => {
                expect(vm.screenInfo.mainSearchInfo.propertiesFilters).toEqual(advancedFilter);
            });
            it("THEN, the predefinedFilter contains Active and Archived fileters", () => {
                expect(vm.screenInfo.mainSearchInfo.predefinedFilters).toEqual(predefinedFilter);
            });
            it("THEN, the add action is defined", () => {
                expect(vm.screenInfo.addAction).toBe(vm.addAction);
                expect(vm.screenInfo.addAction).toEqual(addAction);
            });
        });
        describe("WHEN the vm is created with _docListOptions.isMeetingDocument value true", () => {
            beforeEach(() => {
                meeting.UserAccessRight.createByJson({
                    Id: "eee", 
                    CanAddDoc: true
                })
                advancedFilter = [];
                advancedFilter.push(new ap.misc.AdvancedFilter(new ap.misc.PropertyInfo("All", null, true), null));
                advancedFilter.push(new ap.misc.AdvancedFilter(new ap.misc.PropertyInfo("Document.Name", null, false, ap.misc.PropertyType.String), null));
                advancedFilter.push(new ap.misc.AdvancedFilter(new ap.misc.PropertyInfo("Document.UploadedDate", "Upload date", false, ap.misc.PropertyType.Date), ap.misc.AdvancedFilter.pastDateShortcuts));
                advancedFilter.push(new ap.misc.AdvancedFilter(new ap.misc.PropertyInfo("Document.UploadedBy.Person.Name", "Uploader", false, ap.misc.PropertyType.String), null));

                predefinedFilter = [];
                predefinedFilter.push(new ap.misc.PredefinedFilter("Active", "Active documents", true, Filter.isFalse("Document.IsArchived"), null, ["Archived"]));
                predefinedFilter.push(new ap.misc.PredefinedFilter("Archived", "Archived documents", true, Filter.isTrue("Document.IsArchived"), null, ["Active"]));

                initializeViewModel(false, false, true, true);
                let attachDocumentAction = new ap.viewmodels.home.SubActionViewModel(Utility, Utility.EventTool, "meetingdocument.attachdocument", Utility.rootUrl + "/Images/html/icons/ic_attach_file_black_48px.svg", true, false, false, "Attach documents of the project", false, false);
                addAction = new ap.viewmodels.home.ActionViewModel(Utility, Utility.EventTool, "meetingdocument.uploaddocument", Utility.rootUrl + "/Images/html/icons/ic_add_black_48px.svg", true, [attachDocumentAction], "Add document", true, false);
            });
            it("THEN, the screenInfo is type list", () => {
                expect(vm.screenInfo.sType).toBe(ap.misc.ScreenInfoType.List);
            });
            it("THEN, the advancedFilter contains Name, UpdatedDate, And Uploader properties in the mainSearch", () => {
                expect(vm.screenInfo.mainSearchInfo.propertiesFilters).toEqual(advancedFilter);
            });
            it("THEN, the predefinedFilter is equals 2", () => {
                expect(vm.screenInfo.mainSearchInfo.predefinedFilters).toEqual(predefinedFilter);
            });
            it("THEN, the add action is defined", () => {
                expect(vm.screenInfo.addAction).toBe(vm.addAction);
                expect(vm.screenInfo.addAction).toEqual(addAction);
            });
        });
    });

    describe("Feature: load list of documents", () => {
        beforeEach(() => {
            initializeViewModel(false, false);
            spyOn(Api, "getApiResponseStatList").and.returnValue($q.defer().promise);

            specHelper.general.spyProperty(ap.misc.MainSearchInfo.prototype, "filterString", specHelper.PropertyAccessor.Get).and.returnValue("myfilter");
        });
        afterEach(() => {
            specHelper.general.offSpyProperty(ap.misc.MainSearchInfo.prototype, "filterString", specHelper.PropertyAccessor.Get);
        });

        describe("WHEN load method is called and a folder is specified", () => {
            beforeEach(() => {
                let folder: ap.models.projects.Folder = new ap.models.projects.Folder(Utility);
                folder.createByJson({Id: "12"});
                vm = new ap.viewmodels.documents.DocumentListViewModel($scope, $mdDialog, Utility, Api, $q, $timeout, ControllersManager, ServicesManager, new ap.viewmodels.documents.DocumentListOptions(), folder, true);
            });

            it("THEN, the Api is called with the correct filter", () => {
                vm.load();
                $rootScope.$apply();
                let filter: string = "Filter.And(Filter.And(Filter.Eq(Folder.Project.Id,35a2c5d6-0e00-43e9-ada8-ce4d3fafb16e),Filter.Eq(FolderId,12)),myfilter)";
                expect(Api.getApiResponse).toHaveBeenCalledWith("rest/documentsids?filter=" + encodeURIComponent(filter), ap.services.apiHelper.MethodType.Get, null, null, options);
            });

            it("THEN, the data are loaded with folderItemVm correctly build", () => {
                vm.load();
                defIds.resolve(new ap.services.apiHelper.ApiResponse(idsDocuments));
                $rootScope.$apply();

                defDocsData.resolve(new ap.services.apiHelper.ApiResponse(dataDocuments));
                $rootScope.$apply();

                expect(vm.listVm.sourceItems.length).toBe(8);
            });
            it("THEN, the loaded items are type of DocumentItemViewModel", () => {
                vm.load();
                defIds.resolve(new ap.services.apiHelper.ApiResponse(idsDocuments));
                $rootScope.$apply();

                defDocsData.resolve(new ap.services.apiHelper.ApiResponse(dataDocuments));
                $rootScope.$apply();

                expect(vm.listVm.sourceItems[0] instanceof ap.viewmodels.documents.DocumentItemViewModel).toBeTruthy();
            });
        });

        describe("WHEN load method is called and no folderId is specified", () => {
            beforeEach(() => {
                vm = new ap.viewmodels.documents.DocumentListViewModel($scope, $mdDialog, Utility, Api, $q, $timeout, ControllersManager, ServicesManager, new ap.viewmodels.documents.DocumentListOptions(), undefined, true);
                $rootScope.$apply();
            });

            it("THEN, the Api is called with the correct filter", () => {
                vm.load();
                $rootScope.$apply();
                let filter: string = "Filter.And(Filter.Eq(Folder.Project.Id," + MainController.currentProject().Id + "),myfilter)";
                expect(Api.getApiResponse).toHaveBeenCalledWith("rest/documentsids?filter=" + encodeURIComponent(filter), ap.services.apiHelper.MethodType.Get, null, null, options);
            });

            it("THEN, the data are loaded with folderItemVm correctly build", () => {
                vm.load();
                defIds.resolve(new ap.services.apiHelper.ApiResponse(idsDocuments));
                $rootScope.$apply();

                defDocsData.resolve(new ap.services.apiHelper.ApiResponse(dataDocuments));
                $rootScope.$apply();

                expect(vm.listVm.sourceItems.length).toBe(8);
            });
            it("THEN, the loaded items are type of DocumentItemViewModel", () => {
                vm.load();
                defIds.resolve(new ap.services.apiHelper.ApiResponse(idsDocuments));
                $rootScope.$apply();

                defDocsData.resolve(new ap.services.apiHelper.ApiResponse(dataDocuments));
                $rootScope.$apply();

                expect(vm.listVm.sourceItems[0] instanceof ap.viewmodels.documents.DocumentItemViewModel).toBeTruthy();
            });
        });

        describe("WHEN load method is called and a folder is specified and with meetingId and docListOptions.isMeetingDocument = true", () => {

            let opt: ap.services.apiHelper.ApiOption;

            beforeEach(() => {
                let folder: ap.models.projects.Folder = new ap.models.projects.Folder(Utility);
                folder.createByJson({ Id: "12" });
                let doclistOpt = new ap.viewmodels.documents.DocumentListOptions(false, false, false, false, false, false, true);

                opt = new ap.services.apiHelper.ApiOption();
                let customParams: Array<ap.services.apiHelper.ApiCustomParam> = [];
                customParams.push(new ap.services.apiHelper.ApiCustomParam("ppactions", "updatedisplaynamesfromcontacts,updatemeetingpointscount"));
                opt.customParams = customParams;
                opt.async = true;

                vm = new ap.viewmodels.documents.DocumentListViewModel($scope, $mdDialog, Utility, Api, $q, $timeout, ControllersManager, ServicesManager, doclistOpt, folder, true);
                $rootScope.$apply();
                vm.load();
                $rootScope.$apply();
            });

            it("THEN, the Api is called with the correct filter", () => {
                let filter: string = "Filter.And(Filter.And(Filter.And(Filter.Eq(Document.Folder.Project.Id,35a2c5d6-0e00-43e9-ada8-ce4d3fafb16e),Filter.Eq(Meeting.Id,ddd)),Filter.Eq(Document.FolderId,12)),myfilter)";
                expect(Api.getApiResponse).toHaveBeenCalledWith("rest/meetingdocumentsids?filter=" + encodeURIComponent(filter), ap.services.apiHelper.MethodType.Get, null, null, opt);
            });
        });

        describe("WHEN load method is called and no folderId is specified and with meetingId", () => {
            let opt: ap.services.apiHelper.ApiOption;

            beforeEach(() => {

                opt = new ap.services.apiHelper.ApiOption();
                let customParams: Array<ap.services.apiHelper.ApiCustomParam> = [];
                customParams.push(new ap.services.apiHelper.ApiCustomParam("ppactions", "updatedisplaynamesfromcontacts,updatemeetingpointscount"));
                opt.customParams = customParams;
                opt.async = true;

                let doclistOpt = new ap.viewmodels.documents.DocumentListOptions(false, false, false, false, false, false, true);
                vm = new ap.viewmodels.documents.DocumentListViewModel($scope, $mdDialog, Utility, Api, $q, $timeout, ControllersManager, ServicesManager, doclistOpt, undefined, true);
                $rootScope.$apply();
                vm.load();
                $rootScope.$apply();
            });

            it("THEN, the Api is called with the correct filter", () => {
                let filter: string = "Filter.And(Filter.And(Filter.Eq(Document.Folder.Project.Id,35a2c5d6-0e00-43e9-ada8-ce4d3fafb16e),Filter.Eq(Meeting.Id,ddd)),myfilter)";
                expect(Api.getApiResponse).toHaveBeenCalledWith("rest/meetingdocumentsids?filter=" + encodeURIComponent(filter), ap.services.apiHelper.MethodType.Get, null, null, opt);
            });
        });
    });


    describe("Feature: selectEntity", () => {
        let entity: ap.viewmodels.documents.DocumentItemViewModel;
        let document: ap.models.documents.Document;

        beforeEach(() => {
            vm = new ap.viewmodels.documents.DocumentListViewModel($scope, $mdDialog, Utility, Api, $q, $timeout, ControllersManager, ServicesManager, new ap.viewmodels.documents.DocumentListOptions());
            $rootScope.$apply();

            entity = new ap.viewmodels.documents.DocumentItemViewModel(Utility, $q);

            document = new ap.models.documents.Document(Utility);

            document.createByJson({ Id: "123" });

            entity.init(document);
        });

        describe("WHEN selectEntity is called", () => {
            let isEntitySelected: boolean;

            describe("AND entity is not provided", () => {
                beforeEach(() => {
                    isEntitySelected = vm.selectEntity(null);
                })
                it("THEN, selectEntity should return false", () => {
                    expect(isEntitySelected).toBeFalsy();
                });
            });

            describe("AND entity provided", () => {
                beforeEach(() => {
                    spyOn(vm.listVm, "selectEntity");
                });

                describe("AND entity.isArchived = false and hasActiveFilter = false", () => {
                    beforeEach(() => {
                        specHelper.general.spyProperty(ap.viewmodels.documents.DocumentItemViewModel.prototype, "isArchived", specHelper.PropertyAccessor.Get).and.returnValue(false);
                        specHelper.general.spyProperty(ap.viewmodels.documents.DocumentListViewModel.prototype, "hasActiveFilter", specHelper.PropertyAccessor.Get).and.returnValue(false);

                        isEntitySelected = vm.selectEntity(entity);
                    });
                    afterEach(() => {
                        specHelper.general.offSpyProperty(ap.viewmodels.documents.DocumentItemViewModel.prototype, "isArchived", specHelper.PropertyAccessor.Get)
                        specHelper.general.offSpyProperty(ap.viewmodels.documents.DocumentListViewModel.prototype, "hasActiveFilter", specHelper.PropertyAccessor.Get);
                    });

                    it("THEN selectEntity should return true", () => expect(isEntitySelected).toBeTruthy());
                    it("THEN selectEntity should be called", () => expect(vm.listVm.selectEntity).toHaveBeenCalledWith("123"));
                });

                describe("AND entity.isArchived = true and hasActiveFilter = true", () => {
                    beforeEach(() => {
                        specHelper.general.spyProperty(ap.viewmodels.documents.DocumentItemViewModel.prototype, "isArchived", specHelper.PropertyAccessor.Get).and.returnValue(true);
                        specHelper.general.spyProperty(ap.viewmodels.documents.DocumentListViewModel.prototype, "hasActiveFilter", specHelper.PropertyAccessor.Get).and.returnValue(true);

                        isEntitySelected = vm.selectEntity(entity);
                    });
                    afterEach(() => {
                        specHelper.general.offSpyProperty(ap.viewmodels.documents.DocumentItemViewModel.prototype, "isArchived", specHelper.PropertyAccessor.Get)
                        specHelper.general.offSpyProperty(ap.viewmodels.documents.DocumentListViewModel.prototype, "hasActiveFilter", specHelper.PropertyAccessor.Get);
                    });
                    it("THEN selectEntity should return true", () => expect(isEntitySelected).toBeTruthy());
                    it("THEN selectEntity should be called", () => expect(vm.listVm.selectEntity).toHaveBeenCalledWith("123"));
                });

                describe("AND hasActiveFilter = true", () => {
                    beforeEach(() => {
                        specHelper.general.spyProperty(ap.viewmodels.documents.DocumentListViewModel.prototype, "hasActiveFilter", specHelper.PropertyAccessor.Get).and.returnValue(true);

                        isEntitySelected = vm.selectEntity(entity);
                    });
                    afterEach(() => {
                        specHelper.general.offSpyProperty(ap.viewmodels.documents.DocumentListViewModel.prototype, "hasActiveFilter", specHelper.PropertyAccessor.Get);
                    });
                    it("THEN selectEntity should return true", () => expect(isEntitySelected).toBeTruthy());
                    it("THEN selectEntity should be called", () => expect(vm.listVm.selectEntity).toHaveBeenCalledWith("123"));
                });

                describe("AND originalEntity.Id != EmptyId", () => {
                    beforeEach(() => {
                        specHelper.general.spyProperty(ap.viewmodels.documents.DocumentItemViewModel.prototype, "isArchived", specHelper.PropertyAccessor.Get).and.returnValue(true);
                        specHelper.general.spyProperty(ap.viewmodels.documents.DocumentListViewModel.prototype, "hasActiveFilter", specHelper.PropertyAccessor.Get).and.returnValue(true);

                        isEntitySelected = vm.selectEntity(entity);
                    });

                    afterEach(() => {
                        specHelper.general.offSpyProperty(ap.viewmodels.documents.DocumentItemViewModel.prototype, "isArchived", specHelper.PropertyAccessor.Get)
                        specHelper.general.offSpyProperty(ap.viewmodels.documents.DocumentListViewModel.prototype, "hasActiveFilter", specHelper.PropertyAccessor.Get);
                    });

                    it("THEN selectEntity should return true", () => {
                        expect(entity.originalEntity.Id).not.toEqual(ap.utility.UtilityHelper.createEmptyGuid());
                        expect(isEntitySelected).toBeTruthy();
                    });
                });
            });
        });
    });

    describe("Feature: download single document", () => {

        beforeEach(() => {
            initializeViewModel(false, false);
            spyOn(Api, "getApiResponseStatList").and.returnValue($q.defer().promise);
        });

        describe("When list of documents is loaded and an item receive download action ", () => {
            let docCalled: ap.models.documents.Document;
            let calledIndex = -1;
            beforeEach(() => {
                vm.load();
                defIds.resolve(new ap.services.apiHelper.ApiResponse(idsDocuments));
                $rootScope.$apply();

                spyOn(DocumentController, "downloadDocument");

                defDocsData.resolve(new ap.services.apiHelper.ApiResponse(dataDocuments));
                $rootScope.$apply();

                (<ap.viewmodels.documents.DocumentItemViewModel>vm.listVm.sourceItems[0]).originalDocument.ImageUrl = "plan.pdf";
                (<ap.viewmodels.documents.DocumentItemViewModel>vm.listVm.sourceItems[0]).originalDocument.VersionCount = 1;

                specHelper.general.raiseEvent((<ap.viewmodels.documents.DocumentItemViewModel>vm.listVm.sourceItems[0]), "downloadclicked", (<ap.viewmodels.documents.DocumentItemViewModel>vm.listVm.sourceItems[0]));
            })
            it("THEN, DocumentController.download is called when the doc item raise the action", () => {           
                expect(DocumentController.downloadDocument).toHaveBeenCalledWith(vm.listVm.sourceItems[0].originalEntity);
            });
        });
    });

    describe("Feature: refresh documentlistVm", () => {
        let defIds: angular.IDeferred<ap.services.apiHelper.ApiResponse>;
        let defDocsData: angular.IDeferred<ap.services.apiHelper.ApiResponse>;
        let loadDefer: angular.IDeferred<ap.viewmodels.GenericPagedListViewModels>;
        beforeEach(() => {
            spyOn(Api, "getApiResponseStatList").and.returnValue($q.defer().promise);
        });

        describe("WHEN the folder of the ViewModel is changed with a value not null", () => {
            beforeEach(() => {
                loadDefer = $q.defer();
                spyOn(Utility.Storage.Session, "get").and.callFake(function (key) {
                    if (key == "document.lastselecteditem")
                        return "lastSelectedItemId";

                    return null;
                });

                initializeViewModel(false, false);
                spyOn(ap.viewmodels.documents, "DocumentItemViewModel");

            });

            it("THEN, loadId method is called to refresh the list with the correct id", () => {
                let defIds = $q.defer();
                spyOn(vm.listVm, "loadIds").and.returnValue(defIds.promise);

                let folder: ap.models.projects.Folder = new ap.models.projects.Folder(Utility);
                folder.createByJson({Id: "12"});
                vm.folder = folder;
                $rootScope.$apply();
                expect(vm.listVm.loadIds).toHaveBeenCalledWith("Filter.And(Filter.And(Filter.Eq(Folder.Project.Id,35a2c5d6-0e00-43e9-ada8-ce4d3fafb16e),Filter.Eq(FolderId,12)),Filter.IsFalse(IsArchived))", undefined);
            });

            it("THEN, load method is called with the selected document id saved in the storage", () => {
                let defIds = $q.defer();
                spyOn(vm, "load").and.returnValue(loadDefer.promise);
                let folder: ap.models.projects.Folder = new ap.models.projects.Folder(Utility);
                folder.createByJson({ Id: "12" });
                vm.folder = folder;
                loadDefer.resolve(null);
                $rootScope.$apply();
                expect(vm.load).toHaveBeenCalledWith("lastSelectedItemId");
            });
        });

        describe("WHEN the folder of the ViewModel is changed to undefined", () => {
            let loadSpy: jasmine.Spy;
            beforeEach(() => {
                initializeViewModel(false, false);
                vm.folder = null;
                spyOn(vm.listVm, "clear");
                loadSpy = spyOn(vm, "load");

                spyOn(ap.viewmodels.documents, "DocumentItemViewModel");
                vm.load();

                loadSpy.calls.reset();
                vm.folder = undefined;
            });

            it("THEN, clear method of listVm is called", () => {
                expect(vm.listVm.clear).toHaveBeenCalled();
            });

            it("THEN, load method is NOT called", () => {
                expect(vm.load).not.toHaveBeenCalled();
            });
        });

        describe("WHEN the folder of the ViewModel is changed and has meetingId", () => {
            let loadSpy: jasmine.Spy;
            let folder: ap.models.projects.Folder;
            beforeEach(() => {
                initializeViewModel(false, false, true, true);
                folder = new ap.models.projects.Folder(Utility);
                folder.createByJson({ Id: "12" });
            });

            it("THEN, throw error 'Cannot set folder if has MeetingDocument'", () => {
                expect(() => {
                    vm.folder = folder;
                }).toThrowError("Cannot set folder if has MeetingDocument");
            });
        });

        describe("WHEN refresh method is called without documentToSelect", () => {
            let lastId: string;
            beforeEach(() => {

                initializeViewModel(true, true);
                lastId = vm.listVm.sourceItems[2].originalEntity.Id;
                vm.listVm.selectEntity(lastId);
                spyOn(vm, "load").and.returnValue($q.defer().promise);
                spyOn(vm.listVm, "clearLoaderCache").and.callThrough();

                vm.refresh();
            });

            it("THEN, load method is called with the id of the current selected item", () => {
                expect(vm.listVm.clearLoaderCache).toHaveBeenCalled();
                expect(vm.load).toHaveBeenCalledWith(lastId);
            });
        });

        describe("WHEN refresh method is called with documentToSelect", () => {
            let lastId: string;
            beforeEach(() => {

                initializeViewModel(true, true);
                lastId = vm.listVm.sourceItems[2].originalEntity.Id;
                vm.listVm.selectEntity(lastId);
                spyOn(vm, "load").and.returnValue($q.defer().promise);
                spyOn(vm.listVm, "clearLoaderCache").and.callThrough();

                vm.refresh("D1");
            });

            it("THEN, load method is called with the given idtoselect", () => {
                expect(vm.listVm.clearLoaderCache).toHaveBeenCalled();
                expect(vm.load).toHaveBeenCalledWith("D1");
            });
        });
    });

    describe("Feature: view type", () => {
        let docListOptions;
        let gridAction: ap.viewmodels.home.ActionViewModel;
        let thumbsAction: ap.viewmodels.home.ActionViewModel;

        function getActionByName(actions: ap.viewmodels.home.ActionViewModel[], name: string): ap.viewmodels.home.ActionViewModel {
            for (let i = 0, len = actions.length; i < len; i++) {
                if (actions[i].name === name) {
                    return actions[i];
                }
            }
            return null;
        }

        beforeEach(() => {
            docListOptions = new ap.viewmodels.documents.DocumentListOptions();

            vm = new ap.viewmodels.documents.DocumentListViewModel($scope, $mdDialog, Utility, Api, $q, $timeout, ControllersManager, ServicesManager, docListOptions, null, true);
            $rootScope.$apply();
            gridAction = getActionByName(vm.statusActions, "documentsgrid");
            thumbsAction = getActionByName(vm.statusActions, "documentsthumbs");
        });

        describe("WHEN I set the view of the list", () => {
            it("THEN, this value is correctly set", () => {
                vm.view = ap.viewmodels.documents.View.Thumb;

                expect(vm.view).toBe(ap.viewmodels.documents.View.Thumb);
            });
        });

        describe("WHEN view changes from grid to thumbs", () => {
            beforeEach(() => {
                vm.view = ap.viewmodels.documents.View.Grid;
                vm.view = ap.viewmodels.documents.View.Thumb;
            });
            it("THEN, TRUE is returned for isThumbView", () => {
                expect(vm.isThumbView).toBeTruthy();
            });
            it("THEN, the view is saved in the session", () => {
                expect(Utility.Storage.Local.set).toHaveBeenCalledWith("documents.view", ap.viewmodels.documents.View.Thumb);
            });
            it("THEN, the visibility of main actions is changed accordingly", () => {
                expect(gridAction.isVisible).toBeFalsy();
                expect(thumbsAction.isVisible).toBeTruthy();
            });
        });

        describe("WHEN view changes from thumbs to grid", () => {
            beforeEach(() => {
                vm.view = ap.viewmodels.documents.View.Thumb;
                vm.view = ap.viewmodels.documents.View.Grid;
            });
            it("THEN, false is returned for isThumbView", () => {
                expect(vm.isThumbView).toBeFalsy();
            });
            it("THEN, the view is saved in the session", () => {
                expect(Utility.Storage.Local.set).toHaveBeenCalledWith("documents.view", ap.viewmodels.documents.View.Grid);
            });
            it("THEN, the visibility of main actions is changed accordingly", () => {
                expect(gridAction.isVisible).toBeTruthy();
                expect(thumbsAction.isVisible).toBeFalsy();
            });
        });

        describe("WHEN change view", () => {
            beforeEach(() => {
                initializeViewModel(false, false);
            });
            it("THEN, loading mode of listVm is change also and the list is refresh", () => {
                vm.view = ap.viewmodels.documents.View.Grid;

                let folder: ap.models.projects.Folder = new ap.models.projects.Folder(Utility);
                folder.createByJson({Id: "123"});
                vm.folder = folder;

                let loadIdDeferd = $q.defer();
                spyOn(vm.listVm, "loadIds").and.returnValue(loadIdDeferd.promise);

                let loadPageDeferd = $q.defer();
                spyOn(vm.listVm, "loadPage").and.returnValue(loadPageDeferd.promise);

                spyOn(vm.listVm, "clearLoaderCache").and.callThrough();

                vm.view = ap.viewmodels.documents.View.Thumb;

                $rootScope.$apply();

                loadIdDeferd.resolve();

                expect(vm.listVm.clearLoaderCache).toHaveBeenCalled();
                expect(vm.listVm.loadIds).toHaveBeenCalledWith("Filter.And(Filter.And(Filter.Eq(Folder.Project.Id,35a2c5d6-0e00-43e9-ada8-ce4d3fafb16e),Filter.Eq(FolderId,123)),Filter.IsFalse(IsArchived))", undefined);

                loadPageDeferd.resolve();
                $scope.$apply();

                expect(vm.listVm.loadPage).toHaveBeenCalled();
            });
        });
    });
    
    describe("Feature: multi actions", () => {
        let defIds: angular.IDeferred<ap.services.apiHelper.ApiResponse>;
        let defDocsData: angular.IDeferred<ap.services.apiHelper.ApiResponse>;
        let options: ap.services.apiHelper.ApiOption;

        beforeEach(() => {
            spyOn(Api, "getApiResponseStatList").and.returnValue($q.defer().promise);
            initializeViewModel(true, true, true);

            vm.listVm.sourceItems[0].isChecked = true;
            vm.listVm.sourceItems[1].isChecked = true;
        });

        describe("when invoke gotoMultiActions", () => {

            beforeEach(() => {
                spyOn(MainController, "gotoMultiActionsMode").and.callFake((multiActions: MultiActionsViewModel) => {
                    expect(multiActions.actions.length).toBe(2);
                    expect(multiActions.actions[0].name).toBe("document.download");
                    expect(multiActions.actions[1].name).toBe("printnotelist");
                    expect(multiActions.itemsChecked.length).toBe(2);
                });
            });

            it("THEN, isMultiActions equals true ", () => {
                expect(vm.isMultiActions).toBeTruthy();
            });
            it("THEN, itemsChecked.length of multiaction equals the checked items number", () => {
                vm.gotoMultiActions();
                expect(vm.listVm.listidsChecked.length).toBe(2);
            });
            it("THEN, itemsChecked.length of multiaction equals the checked items number when this number changed", () => {
                vm.listVm.sourceItems[2].isChecked = true;
                expect(vm.listVm.listidsChecked.length).toBe(3);
            });
        });

        describe("WHEN invoke download action from multiactions mode WITH several documents checked", () => {
            let callbackDownload: jasmine.Spy;
            let downloadMultiDef: angular.IDeferred<any>;
            let def: angular.IDeferred<string[]>;
            beforeEach(() => {
                def = $q.defer();
                vm.gotoMultiActions();
                downloadMultiDef = $q.defer();
                spyOn(DocumentController, "downloadSeveralDocuments").and.callFake((docs: string[]) => {
                    expect(docs.length).toBe(2);
                    expect(docs[0]).toBe(vm.listVm.sourceItems[0].originalEntity.Id);
                    expect(docs[1]).toBe(vm.listVm.sourceItems[1].originalEntity.Id);
                    return downloadMultiDef.promise;
                });
                spyOn(ServicesManager.documentService, "getdocumentsIdsFromMeetingDocument").and.returnValue(def.promise);
                spyOn(MainController, "closeMultiActionsMode");
                specHelper.general.raiseEvent(MainController.multiActions, "actionClicked", "document.download");
                def.resolve([vm.listVm.sourceItems[0].originalEntity.Id, vm.listVm.sourceItems[1].originalEntity.Id]);
                $rootScope.$apply();
            });
            afterEach(() => {
                vm.dispose();
            });

            it("THEN, documentDervice.downloadSeveralDocument is called with correct documents passed in parameters", () => {
                expect(DocumentController.downloadSeveralDocuments).toHaveBeenCalled();

            });
            it("THEN, mainController.closeMultiActionsMode is called when the downloadSeveralDocuments is resolved", () => {
                downloadMultiDef.resolve();
                $rootScope.$apply();

                expect(MainController.closeMultiActionsMode).toHaveBeenCalled();
            });

            describe("WHEN the multiactionclose of mainController is requested", () => {
                beforeEach(() => {
                    spyOn(vm.listVm, "uncheckAll");
                    specHelper.general.raiseEvent(MainController, "multiactioncloserequested", undefined);
                });
                it("THEN, the isMultiActionds equals false", () => {
                    expect(vm.isMultiActions).toBeFalsy();
                });
                it("THEN, the list of checked ids is empty", () => {
                    expect(vm.listVm.listidsChecked.length).toBe(0);
                });
            });
        });

        describe("when folderId was set", () => {
            it("THEN, the closeMultiActions method will be called", () => {
                let defIds = $q.defer();
                spyOn(vm.listVm, "loadIds").and.returnValue(defIds.promise);
                spyOn(vm, "closeMultiActions").and.callThrough();
                let folder: ap.models.projects.Folder = new ap.models.projects.Folder(Utility);
                folder.createByJson({ Id: "12" });
                vm.folder = folder;
                
                expect(vm.closeMultiActions).toHaveBeenCalled();
            });
        });
    });


    describe("Feature: selectedEntity", () => {
        describe("WHEN event selectedItemChanged is fired", () => {
            let doc: ap.viewmodels.documents.DocumentItemViewModel;
            beforeEach(() => {
                spyOn(Api, "getApiResponseStatList").and.returnValue($q.defer().promise);
                initializeViewModel();
                doc = <ap.viewmodels.documents.DocumentItemViewModel>vm.listVm.sourceItems[1];
                specHelper.general.raiseEvent(vm.listVm, "selectedItemChanged", doc);
            });

            it("THEN, selectedEntity should be defined", () => {
                expect(vm.selectedEntity).toEqual(doc);
            });
        });
    });


    /*describe("Feature: openDocument", () => {

        let itemToOpen: ap.viewmodels.documents.DocumentItemViewModel;
        let deferredDoc: angular.IDeferred<any>;
        let spySelectedItemVm: jasmine.Spy;
        let selectedVm: ap.viewmodels.documents.DocumentItemViewModel;
        let doc: ap.models.documents.Document;

        beforeEach(() => {
            spyOn(Api, "getApiResponseStatList").and.returnValue($q.defer().promise);
            initializeViewModel();

            spySelectedItemVm = null;
            deferredDoc = $q.defer();
            itemToOpen = <ap.viewmodels.documents.DocumentItemViewModel>vm.listVm.sourceItems[1];
            spyOn(vm.listVm, "selectEntity").and.callFake(() => {
                selectedVm = itemToOpen;
            });;
            spyOn(DocumentController, "getFullDocumentById").and.returnValue(deferredDoc.promise);
            selectedVm = null;
            spySelectedItemVm = specHelper.general.spyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get).and.callFake(() => {
                return selectedVm;
            });
            vm.openDocument(itemToOpen.originalDocument.Id);

            doc = new ap.models.documents.Document(Utility);
            doc.createByJson(itemToOpen.originalDocument);
        });
        afterEach(() => {
            vm.dispose();

            specHelper.general.offSpyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get);
        });

        describe("WHEN openDocument is called for a specific item", () => {
            it("THEN, selectEntity is called with the id of the item", () => {
                expect(vm.listVm.selectEntity).toHaveBeenCalledWith(itemToOpen.originalDocument.Id);
            });
            it("THEN, when the selectedItem is specified, documentService.getFullDocumentById is called", () => {
                expect(DocumentController.getFullDocumentById).toHaveBeenCalledWith(itemToOpen.originalEntity.Id, false);
            });
            it("THEN, pictureViewModel is created when the document id loaded with the DocumentViewModel having the loaded doc", () => {
                
                deferredDoc.resolve(doc);
                $rootScope.$apply();

                expect(vm.pictureViewModel).toBeDefined();
                expect(vm.pictureViewModel.documentViewModel.originalEntity).toEqual(doc);

            });
            it("THEN, documentopened event will be fire", () => {
                
                deferredDoc.resolve(doc);
                let callback = jasmine.createSpy("callback");
                vm.on("documentopened", function () {
                    callback();
                }, this);
                $rootScope.$apply();
                expect(callback).toHaveBeenCalled();
            });
            it("THEN, the selected viewmodel isOpened = true", () => {
                deferredDoc.resolve(doc);
                $rootScope.$apply();
                expect(itemToOpen.isOpened).toBeTruthy();

            });
        });

        describe("WHEN openDocument is called for a specific item AND version id", () => {
            beforeEach(() => {
                vm.openDocument(itemToOpen.originalDocument.Id, version2.Id);
            });
            it("THEN, selectEntity is called with the id of the item", () => {
                expect(vm.listVm.selectEntity).toHaveBeenCalledWith(itemToOpen.originalDocument.Id);
            });
            it("THEN, when the selectedItem is specified, documentService.getFullDocumentById is called", () => {
                expect(DocumentController.getFullDocumentById).toHaveBeenCalledWith(itemToOpen.originalEntity.Id, false);
            });
            it("THEN, pictureViewModel is created when the document id loaded with the DocumentViewModel having the loaded doc", () => {

                deferredDoc.resolve(doc);
                $rootScope.$apply();

                expect(vm.pictureViewModel).toBeDefined();
                expect(vm.pictureViewModel.documentViewModel.originalEntity).toEqual(doc);

            });
            it("THEN, documentopened event will be fire", () => {

                deferredDoc.resolve(doc);
                let callback = jasmine.createSpy("callback");
                vm.on("documentopened", function () {
                    callback();
                }, this);
                $rootScope.$apply();
                expect(callback).toHaveBeenCalled();
            });
            it("THEN, the selected viewmodel isOpened = true", () => {
                deferredDoc.resolve(doc);
                $rootScope.$apply();
                expect(itemToOpen.isOpened).toBeTruthy();

            });
            it("THEN, check docVm.versionIndex", () => {
                deferredDoc.resolve(doc);
                $rootScope.$apply();

                expect(vm.pictureViewModel.documentViewModel.versionIndex).toEqual(version2.VersionIndex);
            });
        });

        describe("WHEN closeDocument is called", () => {

            let doc: ap.viewmodels.documents.DocumentViewModel;
            let callback;
            let pv;

            beforeEach(() => {
                deferredDoc.resolve(doc);
                $rootScope.$apply();
                callback = jasmine.createSpy("callback");
                vm.on("documentclosed", function () {
                    callback();
                }, this);
                pv = vm.pictureViewModel;
                spyOn(pv, "dispose");
                vm.closeDocument();
            });

            it("THEN, the pictureViewModel.Dispose is called and it becomes null", () => {
                expect(vm.pictureViewModel).toBeNull();
                expect(pv.dispose).toHaveBeenCalled();
            });

            it("THEN, documentclosed event will is fired", () => { 
                expect(callback).toHaveBeenCalled();
            });
            it("THEN, selected viewmodel isOpened = false", () => {
                expect(itemToOpen.isOpened).toBeFalsy();
            });
        });
        describe("WHEN closerequested event is raised from the pictureViewModel", () => {

            let doc: ap.viewmodels.documents.DocumentViewModel;
            let callback;
            let pv;

            beforeEach(() => {

                deferredDoc.resolve(doc);
                $rootScope.$apply();
                callback = jasmine.createSpy("callback");
                vm.on("documentclosed", function () {
                    callback();
                }, this);
                pv = vm.pictureViewModel;
                spyOn(pv, "dispose");
                specHelper.general.raiseEvent(vm.pictureViewModel, "closerequested", vm.pictureViewModel);
            });

            it("THEN, the pictureViewModel.Dispose is called and it becomes null", () => {
                expect(vm.pictureViewModel).toBeNull();
                expect(pv.dispose).toHaveBeenCalled();
            });

            it("THEN, documentclosed event will is fired", () => {
                expect(callback).toHaveBeenCalled();
            });
            it("THEN, selected viewmodel isOpened = false", () => {
                expect(itemToOpen.isOpened).toBeFalsy();
            });
        });

        describe("WHEN the user clicks on the actions preview of one item", () => {
            beforeEach(() => {
                spyOn(vm, "openDocument");
                specHelper.general.raiseEvent(vm.listVm.sourceItems[1], "previewclicked", vm.listVm.sourceItems[1]);
            });
            it("THEN, openDocument is called with the id of item clicked", () => {
                expect(vm.openDocument).toHaveBeenCalledWith(vm.listVm.sourceItems[1].originalEntity.Id);
            });
        });
    });

    describe("Feature: save selected doc into session storage ", () => {
        beforeEach(() => {
            spyOn(Api, "getApiResponseStatList").and.returnValue($q.defer().promise);
            initializeViewModel(true, true, true);
        });
        afterEach(() => {
            vm.dispose();
        });
        describe("WHEN a document is selected", () => {
            it("THEN, its id is saved in session storage", () => {
                vm.listVm.selectedViewModel = vm.listVm.sourceItems[0];
                expect(Utility.Storage.Session.set).toHaveBeenCalledWith("document.lastselecteditem", vm.listVm.sourceItems[0].originalEntity.Id);
            });
        });
    });

    describe("Feature: show FAB sub-actions of the selected document", () => {
        beforeEach(() => {
            spyOn(Api, "getApiResponseStatList").and.returnValue($q.defer().promise);
            initializeViewModel(true, true, true);
        });
        afterEach(() => {
            vm.dispose();
        });
        describe("WHEN a document is selected", () => {
            it("AND the addActions will be add a sub action ", () => {
                vm.listVm.selectedViewModel = vm.listVm.sourceItems[0];

                // There are no sub-actions available to be added to the FAB button at the moment
                expect(vm.addAction.subActions.length).toEqual(0);
            });
            it("AND the addActions will be clear sub actions when the selected viewmodel is null", () => {
                vm.listVm.selectedViewModel = vm.listVm.sourceItems[0];
                vm.listVm.selectedViewModel = null;
                expect(vm.addAction.subActions.length).toEqual(0);
            });

        });
    });

    describe("Feature: documentdeleted", () => {

        let document: ap.models.documents.Document;

        beforeEach(() => {
            spyOn(Api, "getApiResponseStatList").and.returnValue($q.defer().promise);
            initializeViewModel();

            spyOn(vm, "closeDocument");

            document = new ap.models.documents.Document(Utility);
            document.createByJson({
                Id: "12"
            });
        });

        describe("WHEN a document is deleted and is displayed in the pictureViewer", () => {

            beforeEach(() => {
                let pictureVmMock: any = {
                    documentViewModel: {
                        document: {
                            Id: "12"
                        }
                    }
                };
                specHelper.general.spyProperty(ap.viewmodels.documents.DocumentListViewModel.prototype, "pictureViewModel", specHelper.PropertyAccessor.Get).and.returnValue(pictureVmMock);

                specHelper.general.raiseEvent(DocumentController, "documentdeleted", new ap.controllers.EntityUpdatedEvent<ap.models.documents.Document>(document));
            });

            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.documents.DocumentListViewModel.prototype, "pictureViewModel", specHelper.PropertyAccessor.Get);
            });

            it("THEN the pictureViewer is closed", () => {
                expect(vm.closeDocument).toHaveBeenCalled();
            });
        });

        describe("WHEN a document is deleted and is NOT displayed in the pictureViewer", () => {

            beforeEach(() => {
                specHelper.general.raiseEvent(DocumentController, "documentdeleted", new ap.controllers.EntityUpdatedEvent<ap.models.documents.Document>(document));
            });

            it("THEN the pictureViewer is closed", () => {
                expect(vm.closeDocument).not.toHaveBeenCalled();
            });
        });
    });*/

    describe("Feature: dispose", () => {

        beforeEach(() => {
            spyOn(Api, "getApiResponseStatList").and.returnValue($q.defer().promise);
            initializeViewModel();

            spyOn(MainController, "off");
            spyOn(DocumentController, "off");

            vm.dispose();
        });

        describe("WHEN dispose is called", () => {
            it("THEN off method of mainController is called", () => {
                expect(MainController.off).toHaveBeenCalled();
            });

            it("THEN off method of documentController is called ", () => {
                expect(DocumentController.off).toHaveBeenCalled();
            });
        });
    });

    describe("Feature: addAction", () => {
        describe("WHEN the vm was init", () => {

            let spyCanUploaPicture: jasmine.Spy;
           

            beforeEach(() => {
                spyOn(Api, "getApiResponseStatList").and.returnValue($q.defer().promise);
                specHelper.general.spyProperty(ap.models.accessRights.DocumentAccessRight.prototype, "canUploadDoc", specHelper.PropertyAccessor.Get).and.returnValue(false);
                spyCanUploaPicture = specHelper.general.spyProperty(ap.models.accessRights.DocumentAccessRight.prototype, "canUploadPicture", specHelper.PropertyAccessor.Get); 
            });

            afterEach(() => {
                specHelper.general.offSpyProperty(ap.models.accessRights.DocumentAccessRight.prototype, "canUploadDoc", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.models.accessRights.DocumentAccessRight.prototype, "canUploadPicture", specHelper.PropertyAccessor.Get);            
            });

            it("THEN, addAction is visible if addAccessRight.canUploadDoc = true or addAccessRight.canUploadPicture = true", () => {
                spyCanUploaPicture.and.returnValue(true);
                initializeViewModel(true, true, true);
                
                expect(vm.addAction.isVisible).toBeTruthy();
                expect(vm.addAction.isEnabled).toBeTruthy();
            });

            it("THEN, addAction is visible if have sub action visible", () => {
                spyCanUploaPicture.and.returnValue(false);
                initializeViewModel(true, true, true, true);
                expect(vm.addAction.isVisible).toBeTruthy();
            });

            it("AND, addAction is hidden if addAccessRight.canUploadDoc = false and addAccessRight.canUploadPicture = false and have not sub action visible", () => {
                spyCanUploaPicture.and.returnValue(false);
                initializeViewModel(true, true, true);
                expect(vm.addAction.isVisible).toBeFalsy();
                expect(vm.addAction.isEnabled).toBeFalsy();
            });
        });
        describe("WHEN the folder of the vm was changed", () => {
            let testFolder: ap.models.projects.Folder;
            let loadDefer: angular.IDeferred<ap.viewmodels.GenericPagedListViewModels>;
            beforeEach(() => {
                specHelper.general.spyProperty(ap.models.accessRights.DocumentAccessRight.prototype, "canUploadDoc", specHelper.PropertyAccessor.Get).and.returnValue(false);
                specHelper.general.spyProperty(ap.models.accessRights.DocumentAccessRight.prototype, "canUploadPicture", specHelper.PropertyAccessor.Get).and.returnValue(false);

                loadDefer = $q.defer();

                initializeViewModel(false, false, true);
                spyOn(vm, "load").and.returnValue(loadDefer.promise);
                testFolder = new ap.models.projects.Folder(Utility);
                testFolder.createByJson({ Id: "F1" });
                vm.folder = testFolder;
                loadDefer.resolve(null);
                $rootScope.$apply();
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.models.accessRights.DocumentAccessRight.prototype, "canUploadDoc", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.models.accessRights.DocumentAccessRight.prototype, "canUploadPicture", specHelper.PropertyAccessor.Get);
            });
            it("THEN, the folder of the addAccessRight will updated", () => {
                expect(vm.addAccessRight.folder).toEqual(testFolder);
            });
            it("AND THEN, the addAction visible will updated", () => {
                expect(vm.addAction.isVisible).toBeFalsy();
                expect(vm.addAction.isEnabled).toBeFalsy();
            });
        }); 
    }); 
}); 