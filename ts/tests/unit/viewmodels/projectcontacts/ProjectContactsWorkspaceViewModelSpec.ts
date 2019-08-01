describe("Module ap-viewmodels - projectcontacts", () => {
    let vm: ap.viewmodels.projectcontacts.ProjectContactsWorkspaceViewModel;
    let $rootScope: angular.IRootScopeService;
    let $scope: angular.IScope;
    let $q: angular.IQService;
    let $timeout: angular.ITimeoutService;
    let $mdDialog: angular.material.IDialogService;
    let Utility: ap.utility.UtilityHelper;
    let Api: ap.services.apiHelper.Api;
    let ControllersManager: ap.controllers.ControllersManager;
    let ServicesManager: ap.services.ServicesManager;
    let evtHelper: ap.utility.EventHelper;
    let spyProjectContactsList: jasmine.Spy;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");

        angular.mock.module(($provide) => {
            $provide.factory('$mdDialog', ["$q", ($q) => {
                return specHelper.utility.stubShowMdDialog($q);
            }]);
        });
    });

    function createProjectContactsWorkspaceVM() {
        return new ap.viewmodels.projectcontacts.ProjectContactsWorkspaceViewModel($scope, ControllersManager, Utility, Api, $q, $timeout, $mdDialog, ServicesManager);
    }

    function createProjectContactsListVM() {
        return new ap.viewmodels.projectcontacts.ProjectContactListViewModel(Utility, $q, ControllersManager, $timeout, ServicesManager);
    }

    beforeEach(inject((_$rootScope_, _ControllersManager_, _Utility_, _Api_, _$q_, _$timeout_, _$mdDialog_, _ServicesManager_, _EventHelper_) => {
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        Utility = _Utility_;
        $timeout = _$timeout_;
        $q = _$q_;
        Api = _Api_;
        ControllersManager = _ControllersManager_;
        ServicesManager = _ServicesManager_;
        $mdDialog = _$mdDialog_;
        evtHelper = _EventHelper_;

        specHelper.userContext.stub(Utility);
        specHelper.utility.stubRootUrl(Utility);
        
        spyOn(ControllersManager.mainController, "currentProject").and.returnValue({
            Id: "b360cb6d-ca54-4b93-a564-a469274eb68a",
            Name: "Welcome Project"
        });

        spyProjectContactsList = specHelper.general.spyProperty(ap.viewmodels.projectcontacts.ProjectContactsWorkspaceViewModel.prototype,
            "projectContactListVm", specHelper.PropertyAccessor.Get);

        let listVm = createProjectContactsListVM();
        let def = $q.defer();
        spyOn(listVm, "load").and.returnValue(def.promise);
        spyProjectContactsList.and.returnValue(listVm);
        
        specHelper.general.spyProperty(ap.controllers.UIStateController.prototype, "mainFlowState", specHelper.PropertyAccessor.Get).and.returnValue(ap.controllers.MainFlow.Contacts);
    }));

    // spy Segment.IO calls
    beforeEach(() => {
        spyOn(ServicesManager.toolService, "sendEvent").and.returnValue($q.defer().promise);
    });
        
    afterEach(() => {
        specHelper.general.offSpyProperty(ap.viewmodels.projectcontacts.ProjectContactsWorkspaceViewModel.prototype, "projectContactListVm", specHelper.PropertyAccessor.Get);
        specHelper.general.offSpyProperty(ap.controllers.UIStateController.prototype, "mainFlowState", specHelper.PropertyAccessor.Get);
        spyProjectContactsList = null;
    })

    describe("Feature: constructor", () => {

        beforeEach(() => {
            spyOn(ControllersManager.mainController, "initScreen");
            vm = createProjectContactsWorkspaceVM();
            specHelper.general.raiseEvent(vm.projectContactListVm, "requestrefresher", true);
        });
        it("expect list view model to be defined", () => {
            let listVm = vm.projectContactListVm;
            expect(listVm).not.toBeNull();
        });
        it("expect list view model to be disposed when call workspace's view model 'dispose' method", () => {            
            let listVM = vm.projectContactListVm;
            spyOn(listVM, "dispose");
            vm.dispose();
            expect(listVM.dispose).toHaveBeenCalled();
        });
        it("expect loading project contacts", () => {
            let listener = evtHelper.implementsListener(["requestrefresher"]);
            let requestRefresher = jasmine.createSpy("requestrefresher");

            listener.on("requestrefresher", requestRefresher, this);

            listener.raise("requestrefresher");
            expect(requestRefresher).toHaveBeenCalled();
        });
        it("expect initScreen is called", () => {
            expect(ControllersManager.mainController.initScreen).toHaveBeenCalled();
        });
    });

    describe("WHEN $destroy is called", () => {

        beforeEach(() => {
            vm = createProjectContactsWorkspaceVM();
            spyOn(vm, "dispose");
        });

        it("THEN the dispose method is called", () => {
            $scope.$destroy();
            expect(vm.dispose).toHaveBeenCalled();
        });
    });

    describe("WHEN the event 'invitecontactsclicked' is raised from contact controller", () => {
        let contact: ap.models.projects.ContactDetails;

        beforeEach(() => {
            vm = createProjectContactsWorkspaceVM();

            contact = new ap.models.projects.ContactDetails(Utility);

            specHelper.general.raiseEvent(ControllersManager.contactController, "invitecontactsclicked", [contact]);
        });

        it("THEN a confirmation popup is showed to the user", () => {
            expect($mdDialog.show).toHaveBeenCalled();
        });
    });
});