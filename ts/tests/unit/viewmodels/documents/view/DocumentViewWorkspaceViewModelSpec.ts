describe("Module ap-documents - Document view", () => {
    let Utility: ap.utility.UtilityHelper;
    let Api: ap.services.apiHelper.Api;
    let $location: angular.ILocationService;
    let $q: angular.IQService
    let $anchorScroll: angular.IAnchorScrollService;
    let $interval: angular.IIntervalService;
    let ControllersManager: ap.controllers.ControllersManager;
    let ServicesManager: ap.services.ServicesManager;
    let $stateParams: ap.viewmodels.documents.IDocumentViewStateParams;
    let $mdDialog: angular.material.IDialogService;
    let $mdSidenav: angular.material.ISidenavService;
    let $timeout: angular.ITimeoutService;
    let $rootScope: angular.IRootScopeService;
    let vm: ap.viewmodels.documents.DocumentViewWorkspaceViewModel;
    let scope: angular.IScope;
    let currentProject: ap.models.projects.Project;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");

        let $window = specHelper.createWindowStub();
        $window.navigator.userLanguage = undefined;
        $window.navigator.language = 'en_US';
        angular.mock.module(function ($provide) {
            $provide.value('$window', $window);
            $mdSidenav = specHelper.utility.stubToggleMdSideNav($provide);
        });
    });

    beforeEach(inject(function (_Utility_, _Api_, _$q_, _$anchorScroll_, _$interval_, _$timeout_, _$rootScope_, _ControllersManager_, _ServicesManager_) {
        Utility = _Utility_;
        Api = _Api_;
        $q = _$q_;
        _$anchorScroll_ = $anchorScroll;
        $interval = _$interval_;
        ControllersManager = _ControllersManager_;
        ServicesManager = _ServicesManager_;
        $mdDialog = specHelper.utility.stubShowMdDialog($q);
        $timeout = _$timeout_;
        $rootScope = _$rootScope_;
        $stateParams = <ap.viewmodels.documents.IDocumentViewStateParams>{
            documentId: "test-document-id"
        };
        scope = $rootScope.$new();
        specHelper.userContext.stub(Utility);

        spyOn(ControllersManager.accessRightController, "geAccessRights").and.returnValue($q.defer().promise);
    }));

    beforeEach(() => {
        currentProject = new ap.models.projects.Project(Utility);
        currentProject.createByJson({
            Id: "test-project-id"
        });
        spyOn(ControllersManager.mainController, "currentProject").and.callFake(() => {
            return currentProject;
        });
    })

    function getVm() {
        return new ap.viewmodels.documents.DocumentViewWorkspaceViewModel(scope, Utility, Api, $location, $q, $anchorScroll, $interval, $mdDialog, $mdSidenav, $timeout, ControllersManager, ServicesManager, $stateParams);
    }

    describe("Feature: constructor", () => {
        let idsDefer: angular.IDeferred<ap.services.apiHelper.ApiResponse>;
        beforeEach(() => {
            idsDefer = $q.defer();
            spyOn(Api, "getEntityIds").and.returnValue(idsDefer.promise);
            idsDefer.resolve(new ap.services.apiHelper.ApiResponse([]));
        });
        describe("WHEN the workspace viewmodel is created", () => {
            beforeEach(() => {
                let testDefer = $q.defer();
                spyOn(ControllersManager.documentController, "getFullDocumentById").and.returnValue(testDefer.promise);
                
                vm = getVm();
            });

            it("THEN, its instance is defined", () => {
                expect(vm).toBeDefined();
            });
        });

        describe("WHEN the vm is initialized AND current project is defined", () => {
            let defGetMeetingAccessRight: angular.IDeferred<ap.models.accessRights.MeetingAccessRight>;
            let currentMeeting: ap.models.meetings.Meeting;
            let fullDocDefer: angular.IDeferred<ap.controllers.FullDocumentResponse>;
            let document: ap.models.documents.Document;

            beforeEach(() => {
                fullDocDefer = $q.defer();
                defGetMeetingAccessRight = $q.defer();
                spyOn(ControllersManager.documentController, "getFullDocumentById").and.returnValue(fullDocDefer.promise);
                spyOn(Api, "getApiResponse").and.returnValue($q.defer().promise)
                document = new ap.models.documents.Document(Utility);
                document.createByJson({
                    Id: $stateParams.documentId,
                    VersionCount: 0,
                    Author: {Id: "id-user"}
                });
                let fullDoc = new ap.controllers.FullDocumentResponse(document);
                fullDocDefer.resolve(fullDoc);
            });

            describe("AND current meeting is null", () => {
                beforeEach(() => {
                    let stateParam: ap.controllers.DocumentViewFlowStateParam = new ap.controllers.DocumentViewFlowStateParam(Utility, "test-document-id");
                    stateParam.documentIds = ["test-document-id"];
                    specHelper.general.spyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get).and.returnValue(null);
                    specHelper.general.spyProperty(ap.controllers.UIStateController.prototype, "previousMainFlowState", specHelper.PropertyAccessor.Get).and.returnValue(ap.controllers.MainFlow.Documents);
                    specHelper.general.spyProperty(ap.controllers.UIStateController.prototype, "mainFlowStateParam", specHelper.PropertyAccessor.Get).and.returnValue(stateParam);

                    vm = getVm();           
                });

                afterEach(() => {
                    specHelper.general.offSpyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get);
                    specHelper.general.offSpyProperty(ap.controllers.UIStateController.prototype, "previousMainFlowState", specHelper.PropertyAccessor.Get);
                    specHelper.general.offSpyProperty(ap.controllers.UIStateController.prototype, "mainFlowStateParam", specHelper.PropertyAccessor.Get);
                });

                it("THEN, document info requested for project document", () => {
                    expect(ControllersManager.documentController.getFullDocumentById).toHaveBeenCalledWith($stateParams.documentId, false, false, false, false);
                });

                it("THEN, workspace properties are defined", () => {
                    expect(vm.documentViewModel).toBeDefined();

                    spyOn(vm.documentViewModel, "init").and.callThrough();                  
                    $rootScope.$apply();

                    expect(vm.pictureViewModel).toBeDefined();
                    expect(vm.documentUtilsVm).toBeDefined();
                });
            });

            describe("AND current meeting is not null", () => {
                let accessRightDefer: angular.IDeferred<ap.models.accessRights.MeetingAccessRight>;
                let accessRight: ap.models.accessRights.MeetingAccessRight;
                beforeEach(() => {
                    currentMeeting = new ap.models.meetings.Meeting(Utility);
                    currentMeeting.createByJson({
                        Id: "test-meeting-id"
                    });

                    let stateParam: ap.controllers.DocumentViewFlowStateParam = new ap.controllers.DocumentViewFlowStateParam(Utility, "test-document-id");
                    stateParam.documentIds = ["test-document-id"];
                    specHelper.general.spyProperty(ap.controllers.UIStateController.prototype, "mainFlowStateParam", specHelper.PropertyAccessor.Get).and.returnValue(stateParam);
                    
                    accessRightDefer = $q.defer();
                    specHelper.general.spyProperty(ap.controllers.UIStateController.prototype, "previousMainFlowState", specHelper.PropertyAccessor.Get).and.returnValue(ap.controllers.MainFlow.Documents);
                    spyOn(ControllersManager.accessRightController, "getMeetingAccessRight").and.returnValue(accessRightDefer.promise);
                    specHelper.general.spyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get).and.returnValue(currentMeeting);
                    vm = getVm();
                    accessRight = new ap.models.accessRights.MeetingAccessRight(Utility);
                    accessRightDefer.resolve(accessRight);                    
                });

                afterEach(() => {
                    specHelper.general.offSpyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get);
                    specHelper.general.offSpyProperty(ap.controllers.UIStateController.prototype, "previousMainFlowState", specHelper.PropertyAccessor.Get);
                    specHelper.general.offSpyProperty(ap.controllers.UIStateController.prototype, "mainFlowStateParam", specHelper.PropertyAccessor.Get);
                });

                it("THEN, document info is requested for meeting document", () => {
                    expect(ControllersManager.documentController.getFullDocumentById).toHaveBeenCalledWith($stateParams.documentId, true, false, false, false);
                });

                it("THEN, workspace properties are defined", () => {
                    expect(vm.documentViewModel).toBeDefined();
                    spyOn(vm.documentViewModel, "init").and.callThrough();
                    $rootScope.$apply();

                    expect(vm.documentUtilsVm).toBeDefined();
                    expect(vm.pictureViewModel).toBeDefined();
                });
            });
            describe("AND current meeting is not null AND the document is a report", () => {
                let accessRightDefer: angular.IDeferred<ap.models.accessRights.MeetingAccessRight>;
                let accessRight: ap.models.accessRights.MeetingAccessRight;
                beforeEach(() => {
                    $stateParams = <ap.viewmodels.documents.IDocumentViewStateParams>{
                        documentId: "test-document-id",
                        versionId: "",
                        meetingId: "test-meeting-id",
                        isReport: "true"
                    };

                    currentMeeting = new ap.models.meetings.Meeting(Utility);
                    currentMeeting.createByJson({
                        Id: "test-meeting-id"
                    });
                    accessRightDefer = $q.defer();
                    specHelper.general.spyProperty(ap.controllers.UIStateController.prototype, "previousMainFlowState", specHelper.PropertyAccessor.Get).and.returnValue(ap.controllers.MainFlow.Documents);
                    spyOn(ControllersManager.accessRightController, "getMeetingAccessRight").and.returnValue(accessRightDefer.promise);
                    specHelper.general.spyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get).and.returnValue(currentMeeting);
                    vm = getVm();
                    accessRight = new ap.models.accessRights.MeetingAccessRight(Utility);
                    accessRightDefer.resolve(accessRight);
                });

                afterEach(() => {
                    specHelper.general.offSpyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get);
                    specHelper.general.offSpyProperty(ap.controllers.UIStateController.prototype, "previousMainFlowState", specHelper.PropertyAccessor.Get);
                });

                it("THEN, document info is requested for meeting document", () => {
                    expect(ControllersManager.documentController.getFullDocumentById).toHaveBeenCalledWith($stateParams.documentId, true, false, false, true);
                });
            });
        });
    });
});