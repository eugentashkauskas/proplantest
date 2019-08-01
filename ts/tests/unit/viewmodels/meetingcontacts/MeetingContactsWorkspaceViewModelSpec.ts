describe("MeetingContactsWorkspaceViewModel specification", () => {
    let $rootScope: angular.IRootScopeService,
        $scope: angular.IScope,
        MainController: ap.controllers.MainController,
        MeetingController: ap.controllers.MeetingController,
        Utility: ap.utility.UtilityHelper,
        $mdDialog: angular.material.IDialogService,
        vm: ap.viewmodels.meetingcontacts.MeetingContactsWorkspaceViewModel,
        $controller: ng.IControllerService,
        Api: ap.services.apiHelper.Api,
        $q: angular.IQService,
        ServicesManager: ap.services.ServicesManager;
    
    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
        angular.mock.module(($provide) => {
            $provide.factory('$mdDialog', ["$q", function ($q) {
                return specHelper.utility.stubShowMdDialog($q);
            }]);
        });
    });

    beforeEach(inject(function (_$rootScope_, _Utility_, _MainController_, _MeetingController_, _$controller_, _$mdDialog_, _Api_, _$q_, _ServicesManager_) {
        $rootScope = _$rootScope_;
        Utility = _Utility_;
        MainController = _MainController_;
        MeetingController = _MeetingController_;
        $controller = _$controller_;
        $mdDialog = _$mdDialog_;
        $scope = $rootScope.$new();
        $q = _$q_;
        Api = _Api_;
        ServicesManager = _ServicesManager_;
        specHelper.userContext.stub(Utility);
    }));

    // spy Segment.IO calls
    beforeEach(() => {
        spyOn(ServicesManager.toolService, "sendEvent").and.returnValue($q.defer().promise);
    });

    describe("Feature constructor", () => {
        describe("WHEN I create MeetingContactsWorkspaceViewModel", () => {
            let meeting: ap.models.meetings.Meeting;
            beforeEach(() => {
                let project = new ap.models.projects.Project(Utility);
                project.createByJson({ Id: "Test" });

                meeting = new ap.models.meetings.Meeting(Utility);
                meeting.createByJson({ Id: "123", Project: project });

                specHelper.general.spyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get).and.returnValue(meeting);

                specHelper.general.spyProperty(ap.viewmodels.meetingcontacts.MeetingContactsWorkspaceViewModel.prototype, "contactList", specHelper.PropertyAccessor.Get).and.returnValue({
                    load: () => { }
                });
                spyOn(MainController, "initScreen");

                vm = <ap.viewmodels.meetingcontacts.MeetingContactsWorkspaceViewModel>$controller("meetingContactsWorkspaceViewModel", { $scope: $scope }); 
            });

            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.meetingcontacts.MeetingContactsWorkspaceViewModel.prototype, "contactList", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.controllers.MainController.prototype, "currentMeeting", specHelper.PropertyAccessor.Get);
            });

            it("THEN, MeetingContactsWorkspaceViewModel should be defined", () => {
                expect(vm).toBeDefined();
            });
            it("expect initScreen is called", () => {
                expect(MainController.initScreen).toHaveBeenCalled();
            });
        });
    });
});