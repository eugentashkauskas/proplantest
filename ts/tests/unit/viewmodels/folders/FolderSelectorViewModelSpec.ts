describe("Module ap-viewmodels - FolderSelectorViewModel", () => {

    let MainController: ap.controllers.MainController, Utility: ap.utility.UtilityHelper, Api: ap.services.apiHelper.Api;
    let $controller: angular.IControllerService, $rootScope: angular.IRootScopeService, $scope: angular.IScope, _deferred: angular.IDeferred<ap.services.apiHelper.ApiResponse>,
        $q: angular.IQService, $timeout: angular.ITimeoutService;
    let EventHelper: ap.utility.EventHelper;
    let NoteController: ap.controllers.NoteController; 
    let ProjectController: ap.controllers.ProjectController;
    let MeetingController: ap.controllers.MeetingController;
    let $mdDialog: angular.material.IDialogService;    
    let vm: ap.viewmodels.folders.FolderSelectorViewModel;
    let mdDialogDeferred: angular.IDeferred<any>;
    let FolderService: ap.services.FolderService;
    let DocumentController: ap.controllers.DocumentController;
    let $location: angular.ILocationService;
    let ReportController: ap.controllers.ReportController;
    let $interval: angular.IIntervalService;
    let $anchorScroll: angular.IAnchorScrollService;
    let $mdSidenav: angular.material.ISidenavService;
    let ReportService: ap.services.ReportService;
    let AccessRightController: ap.controllers.AccessRightController;
    let ControllersManager: ap.controllers.ControllersManager;
    let ServicesManager: ap.services.ServicesManager;
    

    let dataFolders = [
        {
            Id: "360cb6d-ca54-4b93-a564-a469274eb68a",
            Name: "Documents",
            FolderType: "Custom"
        },
        {
            Id: "35a2c5d6-0e00-43e9-ada8-ce4f3fadb16e",
            Name: "Plans",
            FolderType: "Custom"
        }];

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

        angular.mock.module(function ($provide) {
            $provide.factory('$mdDialog', ["$q", function ($q) {
                return specHelper.utility.stubShowMdDialog($q);
            }]);
        });
    });

    beforeEach(inject(function (_$rootScope_, _$q_, _$timeout_,  _Utility_, _Api_, _MainController_, _ProjectController_, _DocumentController_,
        _NoteController_, _$controller_, _$mdDialog_, _EventHelper_, _FolderService_, _$location_, _ReportController_, _$interval_, _$anchorScroll_, _ReportService_, _AccessRightController_, _ControllersManager_, _ServicesManager_) {
        MainController = _MainController_;
        NoteController = _NoteController_;
        ProjectController = _ProjectController_;
        DocumentController = _DocumentController_;
        AccessRightController = _AccessRightController_;
        ControllersManager = _ControllersManager_;
        ServicesManager = _ServicesManager_;
        Utility = _Utility_;
        Api = _Api_;
        $q = _$q_;
        $rootScope = _$rootScope_;
        $timeout = _$timeout_;
        _deferred = $q.defer();
        $controller = _$controller_;
        $scope = $rootScope.$new();
        $mdDialog = _$mdDialog_;
        EventHelper = _EventHelper_;
        FolderService = _FolderService_;
        $location = _$location_;
        ReportController = _ReportController_;
        $interval = _$interval_;
        $anchorScroll = _$anchorScroll_;
        ReportService = _ReportService_;

        specHelper.userContext.stub(Utility);
    }));

    beforeEach(() => {
        let defFolderIds = $q.defer();
        let defPlansNum = $q.defer();
        let defDocIds = $q.defer();

        spyOn(Api, "getApiResponse").and.callFake(function (url, method) {
            if (url.indexOf("rest/projectfolderidsandlevels") === 0 && method === ap.services.apiHelper.MethodType.Get)
                return _deferred.promise;
            else if (url.indexOf("rest/folderdocumentcount") === 0 && method === ap.services.apiHelper.MethodType.Get)
                return defPlansNum.promise;
            else if (url.indexOf("rest/documentsids") === 0 && method === ap.services.apiHelper.MethodType.Get)
                return defDocIds.promise;
            return null;
        });

        let idsFolders = [
            {
                Id: "1",
                Object: 0
            },
            {
                Id: "2",
                Object: 1
            }];

        defFolderIds.resolve(new ap.services.apiHelper.ApiResponse(idsFolders));
        defPlansNum.resolve({ data: 0 });

        defDocIds.resolve({ data: 0 });
        defDocIds.resolve(new ap.services.apiHelper.ApiResponse(null));

        $rootScope.$apply();

        specHelper.mainController.stub(MainController, Utility);

        vm = new ap.viewmodels.folders.FolderSelectorViewModel($scope, $mdDialog, Utility, Api, $q, $timeout, null, $location, $anchorScroll, $interval, ControllersManager, ServicesManager);
        
        let docWorkSpace = <ap.viewmodels.documents.DocumentWorkspaceViewModel>$scope["documentWorkspaceVm"];
        let testData: ap.viewmodels.IEntityViewModel[] = [];
        let folderVM1 = new ap.viewmodels.folders.FolderItemViewModel(Utility, $q);
        let f1 = new ap.models.projects.Folder(Utility);
        f1.createByJson(
            {
                Id: "1",
                FolderType: ap.models.projects.FolderType.Custom
            });
        folderVM1.init(f1);
        testData.push(folderVM1);

        let folderVM2 = new ap.viewmodels.folders.FolderItemViewModel(Utility, $q);
        let f2 = new ap.models.projects.Folder(Utility);
        f2.createByJson(
            {
                Id: "2",
                FolderType: ap.models.projects.FolderType.Photo
            });
        folderVM2.init(f1);
        testData.push(folderVM2);
        docWorkSpace.folderListVm.listVm.sourceItems = testData;
    });

    describe("Default values of FolderSelectorViewModel", () => {
        describe("WHEN I create the VM with all the parameters", () => {
            it("THEN, it's created with the default values", () => {
                expect(vm.titleKey).toBe("Select_Folder");
                expect($scope["documentWorkspaceVm"]).toBeDefined()
                expect($scope["documentWorkspaceVm"]).not.toBeNull();
                expect(() => { return $scope["documentWorkspaceVm"] instanceof ap.viewmodels.documents.DocumentWorkspaceViewModel; }).toBeTruthy();

                let docWorkSpace = <ap.viewmodels.documents.DocumentWorkspaceViewModel>$scope["documentWorkspaceVm"];

                expect(docWorkSpace.workspaceElements).toBeDefined();
                expect(docWorkSpace.workspaceElements.hasDocumentList).toBeFalsy();
                expect(docWorkSpace.workspaceElements.hasDocumentViewer).toBeFalsy();
                expect(docWorkSpace.workspaceElements.hasFolderList).toBeTruthy();
                expect(vm.enableMainAction).toBeFalsy();  
            });
        });
    });

    describe("cancel action", () => {
        describe("WHEN cancel method is celled", () => {
            it("THEN, dialog is hidden", () => {
                vm.cancel();

                expect($mdDialog.hide).toHaveBeenCalled();
            });
        });
    });

    describe("selected behaviour", () => {
        describe("WHEN there is selected folder set with custom folder", () => {
            beforeEach(() => {
                let docWorkSpace = <ap.viewmodels.documents.DocumentWorkspaceViewModel>$scope["documentWorkspaceVm"];
                docWorkSpace.folderListVm.listVm.selectEntity("1");
            });
            it("THEN, action is enabled", () => {
                expect(vm.enableMainAction).toBeTruthy();
            });
        });

        describe("WHEN there is selected folder set with system photo folder of other user", () => {
            beforeEach(() => {
                let docWorkSpace = <ap.viewmodels.documents.DocumentWorkspaceViewModel>$scope["documentWorkspaceVm"];
                docWorkSpace.folderListVm.listVm.selectEntity("2");
            });
            it("THEN, action is NOT enabled", () => {
                expect(vm.enableMainAction).toBeFalsy();
            });
        });

        describe("WHEN there is selected folder is null", () => {
            it("THEN, action is disabled", () => {
                let docWorkSpace = <ap.viewmodels.documents.DocumentWorkspaceViewModel>$scope["documentWorkspaceVm"];
                docWorkSpace.folderListVm.listVm.selectEntity(null);
                expect(vm.enableMainAction).toBeFalsy();
            });
        });
    });

    describe("mainAction", () => {
        describe("WHEN mainActionClick is called", () => {
            it("THEN, is raise event 'mainactionclicked'", () => {
                let callback: jasmine.Spy = jasmine.createSpy("callback");
                vm.on("mainactionclicked", callback, this);

                vm.mainActionClick();
                expect(callback).toHaveBeenCalled();
            });
        });
    });    
}); 