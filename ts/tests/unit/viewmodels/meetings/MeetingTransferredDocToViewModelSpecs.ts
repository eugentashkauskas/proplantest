'use strict';
describe("Module ap-viewmodels - MeetingTransferredDocsToViewModel", () => {
    let $rootScope: angular.IRootScopeService, $scope: angular.IScope;
    let Utility: ap.utility.UtilityHelper, UserContext: ap.utility.UserContext;
    let vm: ap.viewmodels.meetings.MeetingTransferredDocsToViewModel;
    let $q: angular.IQService;
    let $timeout: angular.ITimeoutService;
    let controllersManager: ap.controllers.ControllersManager;
    let api: ap.services.apiHelper.Api;
    let transferredDocsVM: ap.viewmodels.meetings.MeetingTransferredDocViewModel;
    let transferredDocsListVM: ap.viewmodels.meetings.MeetingTransferredDocToListViewModel;
    let meetingTransferredDocs: ap.models.meetings.MeetingTransferredDocs;
    let $mdDialog: angular.material.IDialogService;
    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });
    beforeEach(inject(function (_$rootScope_, _UserContext_, _Utility_, _$q_, _Api_, _ControllersManager_, _$timeout_) {
        Utility = _Utility_;
        UserContext = _UserContext_;
        $rootScope = _$rootScope_;
        $q = _$q_;
        $timeout = _$timeout_;
        controllersManager = _ControllersManager_;
        api = _Api_;
        $scope = $rootScope.$new();
        specHelper.utility.stubRootUrl(Utility);
        specHelper.userContext.stub(Utility);
        specHelper.utility.stubStorageSet(Utility);
        $mdDialog = specHelper.utility.stubShowMdDialog($q);
    }));
    beforeEach(() => {
        meetingTransferredDocs = new ap.models.meetings.MeetingTransferredDocs(Utility);
        let user = new ap.models.actors.User(Utility);
        user.createByJson({
            Id: "321"
        });
        meetingTransferredDocs.createByJson({
            From: user,
        });
        meetingTransferredDocs.UsersTo = [];
        let to1: ap.models.meetings.MeetingTransferredDocsTo = new ap.models.meetings.MeetingTransferredDocsTo(Utility);
        to1.Tag = "Sergio";
        let to2: ap.models.meetings.MeetingTransferredDocsTo = new ap.models.meetings.MeetingTransferredDocsTo(Utility);
        to2.Tag = "Hoang";
        meetingTransferredDocs.UsersTo.push(to1);
        meetingTransferredDocs.UsersTo.push(to2);

    });

    describe("Constructor", () => {
        describe("WHEN MeetingTransferredDocsToViewModel is created without MeetingTransferredDocsTo", () => {
            it("THEN, the properties are filled with the default values", () => {
                vm = new ap.viewmodels.meetings.MeetingTransferredDocsToViewModel(Utility);

                expect(vm.tag).toBeNull();
                expect(vm.meetingTransferredDocs).toBeNull();
                expect(vm.userId).toBeNull();
            });
        });

        describe("WHEN MeetingTransferredDocsToViewModel is created with MeetingTransferredDocsTo", () => {
            it("THEN, the properties are filled with the default values", () => {
                let meetingTransferredDocsTo: ap.models.meetings.MeetingTransferredDocsTo = new ap.models.meetings.MeetingTransferredDocsTo(Utility);

                meetingTransferredDocsTo.Tag = "Hoang";
                meetingTransferredDocsTo.MeetingTransferredDocs = new ap.models.meetings.MeetingTransferredDocs(Utility);
                meetingTransferredDocsTo.MeetingTransferredDocs.Name = "12345";
                meetingTransferredDocsTo.UserId = "abcd";

                vm = new ap.viewmodels.meetings.MeetingTransferredDocsToViewModel(Utility);
                vm.init(meetingTransferredDocsTo);

                expect(vm.tag).toBe("Hoang");
                expect(vm.meetingTransferredDocs.Name).toBe("12345");
                expect(vm.userId).toBe("abcd");
            });
        });
    });

    describe("WHEN postChanges is called", () => {
        it("THEN properties of MeetingTransferredDocsToViewModel is set into MeetingTransferredDocsToViewModel.meetingTransferredDocsTo", () => {
            let meetingTransferredDocsTo: ap.models.meetings.MeetingTransferredDocsTo = new ap.models.meetings.MeetingTransferredDocsTo(Utility);
            let user = new ap.models.actors.User(Utility);
            user.createByJson({
                Id: "321"
            });
            meetingTransferredDocsTo.createByJson({
                From: user,
            });
            vm = new ap.viewmodels.meetings.MeetingTransferredDocsToViewModel(Utility);
            vm.init(meetingTransferredDocsTo);
            
            vm.tag = "Hoang";
            vm.meetingTransferredDocs = new ap.models.meetings.MeetingTransferredDocs(Utility);
            vm.meetingTransferredDocs.Name = "12345";
            vm.userId = "abcd";

            vm.postChanges();

            expect(vm.meetingTransferredDocsTo.Tag).toBe("Hoang");
            expect(vm.meetingTransferredDocsTo.MeetingTransferredDocs.Name).toBe("12345");
            expect(vm.meetingTransferredDocsTo.UserId).toBe("abcd");
        });
    });

    describe("WHEN the MeetingTransferredDocToListViewModel is initialized", () => {
        beforeEach(() => {
            
            transferredDocsListVM = new ap.viewmodels.meetings.MeetingTransferredDocToListViewModel(Utility, api, $q, $mdDialog, controllersManager);
            transferredDocsVM = new ap.viewmodels.meetings.MeetingTransferredDocViewModel(Utility, api, $q, $mdDialog, controllersManager);
            transferredDocsVM.init(meetingTransferredDocs);
            spyOn(transferredDocsListVM.contactSelectorViewModel, "initUsers");

            transferredDocsListVM.meetingTransferredDocViewModel = transferredDocsVM;
        });
        it("THEN, the initUsers of contactSelector is called with the collection of UserTo", () => {
            expect(transferredDocsListVM.contactSelectorViewModel.initUsers).toHaveBeenCalledWith(meetingTransferredDocs.UsersTo);
        });
    });

    describe("WHEN postChanges is called", () => {
        beforeEach(() => {
            transferredDocsListVM = new ap.viewmodels.meetings.MeetingTransferredDocToListViewModel(Utility, api, $q, $mdDialog, controllersManager);
            transferredDocsVM = new ap.viewmodels.meetings.MeetingTransferredDocViewModel(Utility, api, $q, $mdDialog, controllersManager);
            transferredDocsVM.init(meetingTransferredDocs);
            transferredDocsListVM.meetingTransferredDocViewModel = transferredDocsVM;
        });
        describe("AND there are items added", () => {
            beforeEach(() => {

                specHelper.general.spyProperty(ap.viewmodels.projects.ContactSelectorViewModel.prototype, "selectedContacts", specHelper.PropertyAccessor.Get).and.returnValue([{
                    displayText: "Sergio",
                    userId: null
                }, {
                        displayText: "Hoang",
                    userId: null

                    }, {
                        displayText: "New User",
                        userId: null

                }]);

                transferredDocsListVM.postChanges();
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.projects.ContactSelectorViewModel.prototype, "selectedContacts", specHelper.PropertyAccessor.Get);
            });
            it("THEN, the user is added in the collection", () => {
                expect(meetingTransferredDocs.UsersTo.length).toBe(3);
                expect(meetingTransferredDocs.UsersTo[2].Tag).toBe("New User");
            });
        });
        describe("AND there are items removed", () => {
            beforeEach(() => {

                specHelper.general.spyProperty(ap.viewmodels.projects.ContactSelectorViewModel.prototype, "selectedContacts", specHelper.PropertyAccessor.Get).and.returnValue([{
                    displayText: "Hoang",
                    userId: null
                }]);

                transferredDocsListVM.postChanges();
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.projects.ContactSelectorViewModel.prototype, "selectedContacts", specHelper.PropertyAccessor.Get);
            });
            it("THEN, the user is added in the collection", () => {
                expect(meetingTransferredDocs.UsersTo.length).toBe(1);
                expect(meetingTransferredDocs.UsersTo[0].Tag).toBe("Hoang");
            });
        });
    });
});