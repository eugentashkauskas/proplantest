describe("Module ap-viewmodels - MeetingTransferredDocListViewModel", () => {
    let $rootScope: angular.IRootScopeService, $scope: angular.IScope;
    let Utility: ap.utility.UtilityHelper, UserContext: ap.utility.UserContext;
    let $q: angular.IQService;
    let $timeout: angular.ITimeoutService;
    let Api: ap.services.apiHelper.Api;
    let ControllersManager: ap.controllers.ControllersManager;
    let $mdDialog: angular.material.IDialogService;

    let listVm: ap.viewmodels.meetings.MeetingTransferredDocListViewModel;
    let meeting: ap.models.meetings.Meeting;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject(function (_$rootScope_, _UserContext_, _Utility_, _$q_, _Api_, _$timeout_, _ControllersManager_) {
        Utility = _Utility_;
        UserContext = _UserContext_;
        $rootScope = _$rootScope_;
        Api = _Api_;
        $q = _$q_;
        $timeout = _$timeout_;
        ControllersManager = _ControllersManager_;
        $scope = $rootScope.$new();
        $mdDialog = specHelper.utility.stubShowMdDialog($q);
        specHelper.utility.stubRootUrl(Utility);
        specHelper.userContext.stub(Utility);
        specHelper.utility.stubStorageSet(Utility);
        let currentProject = new ap.models.projects.Project(Utility);
        currentProject.createByJson({ UserAccessRight: {} });
        spyOn(ControllersManager.mainController, "currentProject").and.returnValue(currentProject);
    }));

    function createNewTransferedDocsVm() {
        let transDoc = new ap.models.meetings.MeetingTransferredDocs(Utility);        
        let MeetingTransferredDocVM = new ap.viewmodels.meetings.MeetingTransferredDocViewModel(Utility, Api, $q, $mdDialog, ControllersManager);
        MeetingTransferredDocVM.init(transDoc);
        return MeetingTransferredDocVM;
    }

    /**
     * Function to create a default meeting entity
     */
    function createMeeting(): ap.models.meetings.Meeting {
        meeting = new ap.models.meetings.Meeting(Utility);
        meeting.UserAccessRight = new ap.models.accessRights.MeetingAccessRight(Utility);
        return meeting;
    }

    /**
     * Function to instanciate the listVm variable
     * @param meeting
     */
    function createListVm(meeting: ap.models.meetings.Meeting) {
        listVm = new ap.viewmodels.meetings.MeetingTransferredDocListViewModel(Utility, ControllersManager, $q, Api, $timeout, $mdDialog, meeting);
    }

    describe("Feature: MeetingTransferredDocListViewModel constructor", () => {
        describe("WHEN the constructor of the Class is called", () => {

            beforeEach(() => {
                createListVm(createMeeting());
            });

            it("THEN, the object is created", () => {
                expect(listVm).toBeDefined();
            });

            it("THEN, the entityName is 'MeetingTransferredDocViewModel'", () => {
                expect(listVm.entityName).toBe("MeetingTransferredDocViewModel");
            });
        });
    });

    describe("Feature: Load", () => {

        let defDocs: angular.IDeferred<ap.models.meetings.MeetingTransferredDocs[]>;

        beforeEach(() => {
            createListVm(createMeeting());

            defDocs = $q.defer();
            spyOn(ControllersManager.meetingController, "getTransferredDocList").and.returnValue(defDocs.promise);

            listVm.load();
        });

        describe("WHEN the load method is called", () => {

            it("THEN, meetingController.getTransferredDocList is called with the meeting", () => {
                defDocs.resolve([]);
                $rootScope.$apply();
                expect(ControllersManager.meetingController.getTransferredDocList).toHaveBeenCalledWith(meeting);
            });
        });

        describe("WHEN the controller resolved items", () => {

            beforeEach(() => {

                let meetingTransferredDocs: ap.models.meetings.MeetingTransferredDocs[] = [];
                let transferredDoc = new ap.models.meetings.MeetingTransferredDocs(Utility);
                let user = new ap.models.actors.User(Utility);
                user.createByJson({
                    Id: "321"
                });
                transferredDoc.createByJson({
                    Id: "123",
                    FromTag: "aaaa",
                    From: user,
                    Name: "arc",
                    Approved: "323",
                });
                meetingTransferredDocs.push(transferredDoc);

                defDocs.resolve(meetingTransferredDocs);
                $rootScope.$apply();
            });

            it("THEN the list of populated with the items", () => {
                expect(listVm.count).toBe(1);
            });

            it("THEN the type of the items is 'MeetingTransferredDocViewModel'", () => {
                expect(listVm.getItemAtIndex(0) instanceof ap.viewmodels.meetings.MeetingTransferredDocViewModel).toBeTruthy();
            });
        });
    });

    describe("Feature: cancel", () => {
        let meeting: ap.models.meetings.Meeting;
        let defDocs: angular.IDeferred<ap.models.meetings.MeetingTransferredDocs[]>;
        let newTransDoc: ap.viewmodels.meetings.MeetingTransferredDocViewModel;
        let meetingTransferredDoc: ap.models.meetings.MeetingTransferredDocs;
        beforeEach(() => {
            meeting = createMeeting();
            createListVm(meeting);
            defDocs = $q.defer();
            spyOn(ControllersManager.meetingController, "getTransferredDocList").and.returnValue(defDocs.promise);
            listVm.load();
            let meetingTransferredDocs: ap.models.meetings.MeetingTransferredDocs[] = [];
            meetingTransferredDoc = new ap.models.meetings.MeetingTransferredDocs(Utility);
            let user = new ap.models.actors.User(Utility);
            user.createByJson({
                Id: "321"
            });
            meetingTransferredDoc.createByJson({
                Id: "123",
                FromTag: "aaaa",
                From: user,
                Name: "arc",
                Approved: "323",
            });
            meetingTransferredDocs.push(meetingTransferredDoc);
            defDocs.resolve(meetingTransferredDocs);
            $rootScope.$apply();
        });
        describe("WHEN called cancel method and list has new item", () => {
            beforeEach(() => {
                listVm.sourceItems.push(createNewTransferedDocsVm());
            });
            it("THEN new items should be deleted", () => {
                expect(listVm.sourceItems.length).toBe(2);
                specHelper.general.raiseEvent(listVm.screenInfo, "actionclicked", "meetingtransferreddocs.cancel");
                expect(listVm.sourceItems.length).toBe(1);
            });
            it("THEN editMode should be disable", () => {
                specHelper.general.raiseEvent(listVm.screenInfo, "actionclicked", "meetingtransferreddocs.edit");
                expect(listVm.screenInfo.isEditMode).toBeTruthy();
                specHelper.general.raiseEvent(listVm.screenInfo, "actionclicked", "meetingtransferreddocs.cancel");
                expect(listVm.screenInfo.isEditMode).toBeFalsy();
            });
            it("THEN  in item action.isVisible/action.isEnable =  false", () => {
                specHelper.general.raiseEvent(listVm.screenInfo, "actionclicked", "meetingtransferreddocs.edit");
                expect((<ap.viewmodels.meetings.MeetingTransferredDocViewModel>listVm.sourceItems[0]).actions[0].isEnabled).toBeTruthy();
                expect((<ap.viewmodels.meetings.MeetingTransferredDocViewModel>listVm.sourceItems[0]).actions[0].isVisible).toBeTruthy();
                specHelper.general.raiseEvent(listVm.screenInfo, "actionclicked", "meetingtransferreddocs.cancel");
                expect((<ap.viewmodels.meetings.MeetingTransferredDocViewModel>listVm.sourceItems[0]).actions[0].isEnabled).toBeFalsy();
                expect((<ap.viewmodels.meetings.MeetingTransferredDocViewModel>listVm.sourceItems[0]).actions[0].isVisible).toBeFalsy();
            });
        });
        describe("WHEN called cancel method and list has  item with isMrakedToDelete = true", () => {
            let meetingTransferredDocVM: ap.viewmodels.meetings.MeetingTransferredDocViewModel;
            beforeEach(() => {
                meetingTransferredDocVM = <ap.viewmodels.meetings.MeetingTransferredDocViewModel>listVm.sourceItems[0];
            });
            it("THEN  item.isMrakedToDelete should be false", () => {
                specHelper.general.raiseEvent(listVm.screenInfo, "actionclicked", "meetingtransferreddocs.edit");
                meetingTransferredDocVM.actionClicked("transferreddoc.delete")
                expect(meetingTransferredDocVM.isMarkedToDelete).toBeTruthy();
                specHelper.general.raiseEvent(listVm.screenInfo, "actionclicked", "meetingtransferreddocs.cancel");
                expect(meetingTransferredDocVM.isMarkedToDelete).toBeFalsy();
            });
        });
        describe("WHEN called cancel method and list has changed item", () => {
            let meetingTransferredDocVM: ap.viewmodels.meetings.MeetingTransferredDocViewModel;
            beforeEach(() => {
                meetingTransferredDocVM = <ap.viewmodels.meetings.MeetingTransferredDocViewModel>listVm.sourceItems[0];
                meetingTransferredDocVM.fromTag = "ssss";
                meetingTransferredDocVM.fromGuid = "123";
                meetingTransferredDocVM.name = "test";
                meetingTransferredDocVM.approved = "123";
            });
            it("THEN all default values is returned", () => {
                specHelper.general.raiseEvent(listVm.screenInfo, "actionclicked", "meetingtransferreddocs.cancel");
                expect(meetingTransferredDocVM.fromTag).toEqual("aaaa");
                expect(meetingTransferredDocVM.fromGuid).toEqual("321");
                expect(meetingTransferredDocVM.name).toEqual("arc");
                expect(meetingTransferredDocVM.approved).toEqual("323");
            });
        });
    });
});