describe("Feature: MeetingMultiEditViewModel", () => {
    let Utility: ap.utility.UtilityHelper;
    let Api: ap.services.apiHelper.Api;
    let $q: angular.IQService;
    let $scope: angular.IScope;
    let $rootScope: angular.IRootScopeService;
    let $mdDialog: angular.material.IDialogService;
    let ControllersManager: ap.controllers.ControllersManager;
    let $timeout: angular.ITimeoutService;
    let vm: ap.viewmodels.multiactions.MeetingMultiEditViewModel;
    let meetings: ap.models.meetings.Meeting[];

    let $location: angular.ILocationService;
    let $interval: angular.IIntervalService;
    let $anchorScroll: angular.IAnchorScrollService;
    let $mdSidenav: angular.material.ISidenavService;
    let ServicesManager: ap.services.ServicesManager;

    beforeEach(() => {
        angular.mock.module("ngMaterial");
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject(function (_Utility_, _Api_, _$q_, _$rootScope_, _$timeout_, _ControllersManager_, _ServicesManager_, _$mdSidenav_, _$location_, _$anchorScroll_, _$interval_) {
        Utility = _Utility_;
        Api = _Api_;
        $q = _$q_;
        $rootScope = _$rootScope_;
        ControllersManager = _ControllersManager_;

        ServicesManager = _ServicesManager_;
        $mdSidenav = _$mdSidenav_;
        $location = _$location_;
        $anchorScroll = _$anchorScroll_;
        $interval = _$interval_;

        $timeout = _$timeout_;
        $scope = $rootScope.$new();
        $mdDialog = specHelper.utility.stubShowMdDialog($q);
        specHelper.userContext.stub(Utility);
        specHelper.mainController.stub(ControllersManager.mainController, Utility);
    }));

    beforeEach(() => {
        let testMeeting1 = new ap.models.meetings.Meeting(Utility);
        testMeeting1.createByJson({
            Id: "test-meeting-id-1",
            IsInvited: true
        });
        let testMeeting2 = new ap.models.meetings.Meeting(Utility);
        testMeeting2.createByJson({
            Id: "test-meeting-id-2",
            IsInvited: false
        });
        meetings = [testMeeting1, testMeeting2];
    });

    function getViewModel() {
        return new ap.viewmodels.multiactions.MeetingMultiEditViewModel(Utility, $scope, Api, $q, ControllersManager, ServicesManager, $timeout, $mdDialog, $mdSidenav, $location, $anchorScroll, $interval, meetings);
    }

    describe("Feature: constructor", () => {
        describe("WHEN viewmodel is created", () => {
            beforeEach(() => {
                vm = getViewModel();
            });
            it("THEN, its properties are initialized", () => {
                expect(vm).toBeDefined();
                expect(vm.meetingMultiEdit).toBeDefined();
                expect(vm.canSave).toBeFalsy();
                expect(vm.addedParticipants).toBeFalsy();
            });
        });
    });

    describe("Feature: postChange", () => {
        let controllerDefer: angular.IDeferred<ap.models.multiactions.MeetingMultiActionResult>;
        beforeEach(() => {
            vm = getViewModel();
            controllerDefer = $q.defer();
            spyOn(ControllersManager.meetingController, "meetingMultiAction").and.returnValue(controllerDefer.promise);
        });
        describe("WHEN postChange is called and canSave is false", () => {
            it("THEN, an error 'No changes detected' is thrown", () => {
                expect(vm.canSave).toBeFalsy();
                expect(() => {
                    vm.postChange();
                }).toThrowError("Can not save data - no changes detected");
            });
        });
        describe("WHEN postChange is called and canSave is true", () => {
            let testContactDetails: ap.models.projects.ContactDetails;
            let testMeetingConcerns: ap.models.meetings.MeetingConcern[];
            let testNumberingType: ap.models.meetings.MeetingNumberingType;
            beforeEach(() => {
                testContactDetails = new ap.models.projects.ContactDetails(Utility);
                testContactDetails.createByJson({
                    Id: "test-contact-id",
                    User: {
                        Id: "test-contact-id"
                    },
                    IsInvited: false
                });
                testNumberingType = ap.models.meetings.MeetingNumberingType.CodeSequential;
                let testContactVm = new ap.viewmodels.projectcontacts.ProjectContactItemViewModel(Utility, $q, null, null);
                testContactVm.init(testContactDetails);
                vm.selectedContact = testContactVm;
                let testMeetingConcern = new ap.models.meetings.MeetingConcern(Utility);
                testMeetingConcern.createByJson({
                    User: {
                        Id: "test-contact-id"
                    },
                    IsInvited: false,
                    AccessRightLevel: ap.models.accessRights.AccessRightLevel.Guest                    
                });
                testMeetingConcern.ContactDetails = testContactDetails;
                testMeetingConcerns = [testMeetingConcern];
                vm.addParticipant();
                vm.selectedNumberingType = testNumberingType;
                vm.postChange();
            });
            
            it("THEN, call controller method to save changes", () => {                
                expect(ControllersManager.meetingController.meetingMultiAction).toHaveBeenCalled();
                let controllerArgs = (<jasmine.Spy>ControllersManager.meetingController.meetingMultiAction).calls.first().args;
                expect(controllerArgs.length).toEqual(2);
                expect(controllerArgs[0]).toEqual(meetings);
                let multiEditEntity = <ap.models.multiactions.MeetingMultiEdit>controllerArgs[1];
                expect(multiEditEntity.MeetingConcerns.length).toEqual(1);
                expect(multiEditEntity.NumberingType).toEqual(testNumberingType);
                let meetingConcernToSave = multiEditEntity.MeetingConcerns[0];
                let expectedMeetingConcern = testMeetingConcerns[0];
                expect(meetingConcernToSave.User.Id).toEqual(expectedMeetingConcern.User.Id);
                expect(meetingConcernToSave.IsInvited).toEqual(expectedMeetingConcern.IsInvited);
                expect(meetingConcernToSave.AccessRightLevel).toEqual(expectedMeetingConcern.AccessRightLevel);
                expect(meetingConcernToSave.ContactDetails).toEqual(expectedMeetingConcern.ContactDetails);
            });
        });
    });
});