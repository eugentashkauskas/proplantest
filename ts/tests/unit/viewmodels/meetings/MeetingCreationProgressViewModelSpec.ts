describe("Module ap- viewmodels - MeetingCreationProgressViewModel", () => {
    let Utility: ap.utility.UtilityHelper;
    let $q: angular.IQService;
    let $mdDialog: angular.material.IDialogService;
    let controllersManager: ap.controllers.ControllersManager;
    let meetings: ap.models.meetings.Meeting[];
    let vm: ap.viewmodels.meetings.MeetingCreationProgressViewModel;
    let $rootScope: angular.IRootScopeService;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
        angular.mock.module("ap-utility");
    });
    beforeEach(inject(function (_Utility_, _$rootScope_, _$q_, _ControllersManager_) {
        Utility = _Utility_;
        $rootScope = _$rootScope_;
        $q = _$q_;
        controllersManager = _ControllersManager_;
        $mdDialog = specHelper.utility.stubShowMdDialog($q);
        meetings = [new ap.models.meetings.Meeting(Utility)];
        meetings[0].Title = "Title";
        meetings[0].Code = "Code";
        meetings[0].NumberingType = 3; 
        meetings[0].Floor = "Floor";
        meetings[0].Building = "Building";
        meetings[0].Header = "Header";
        meetings[0].Footer = "Footer";
    }));
    beforeEach(() => {
        spyOn(Utility.Translator, "getTranslation").and.callFake(function (key) {
            if (key === "creation.progress.success.desc") {
                return "{0} list(s) have been created without error";
            } 
            if (key === "creation.progress.error.desc") {
                return "{0} list(s) have been created without errors. {1} list(s) ({2}) couldn't be created due to errors";
            }
        });
        let defer = $q.defer();
        spyOn(controllersManager.meetingController, "saveMeeting").and.returnValue(defer.promise);
        defer.resolve(new ap.models.meetings.Meeting(Utility));
        vm = new ap.viewmodels.meetings.MeetingCreationProgressViewModel(Utility, $q, $mdDialog, controllersManager, meetings);    
        $rootScope.$apply();
    });
    describe("Constructor", () => {
        let apiOptions: ap.services.apiHelper.ApiOption;
        beforeEach(() => {
            apiOptions = new ap.services.apiHelper.ApiOption();
            apiOptions.isShowError = false;
            apiOptions.isShowBusy = false;
            apiOptions.async = true;
        });
        describe("WHEN  MeetingCreationProgressViewModel is created", () => {
            it("THEN, class instance is initialized", () => {
                expect(vm).toBeDefined();
            });
            it("THEN, if meetings are defined and initialized we save meeting instances", () => {
                expect(controllersManager.meetingController.saveMeeting).toHaveBeenCalledWith(meetings[0], apiOptions);
            });
            it("THEN, allowCancel property should be true", () => {
                expect(vm.canClose).toBeTruthy();
            });
            it("THEN, description key should be a string and number of imported meetings should be 1", () => { 
                expect(vm.descriptionKey).toBe("1 list(s) have been created without error");
            });
        });
    });

})