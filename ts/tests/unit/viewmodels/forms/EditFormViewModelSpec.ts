describe("Module ap-viewmodels - EditFormViewModel", () => {
    let $rootScope: angular.IRootScopeService, $scope: angular.IScope;
    let Utility: ap.utility.UtilityHelper, UserContext: ap.utility.UserContext;
    let NoteController: ap.controllers.NoteController;
    let $q: angular.IQService;
    let mdDialogDeferred: angular.IDeferred<any>;
    let MainController: ap.controllers.MainController;
    let $mdDialog: angular.material.IDialogService;
    let $controller: angular.IControllerService;
    let $timeout: angular.ITimeoutService;
    let ProjectController: ap.controllers.ProjectController;
    let Api: ap.services.apiHelper.Api;
    let defNote: ng.IDeferred<any>;
    let defNoteStatus: ng.IDeferred<any>;
    let defAccessRight: ng.IDeferred<any>;
    let DocumentController: ap.controllers.DocumentController;
    let NoteService: ap.services.NoteService;
    let $location: angular.ILocationService;
    let $anchorScroll: angular.IAnchorScrollService;
    let $interval: angular.IIntervalService;
    let AccessRightController: ap.controllers.AccessRightController;
    let meetingAccessRights: ap.models.accessRights.AccessRight[];
    let ControllersManager: ap.controllers.ControllersManager;
    let ServicesManager: ap.services.ServicesManager;
    let editFormVm: ap.viewmodels.forms.EditFormViewModel;

    beforeEach(() => {
        let $window = specHelper.createWindowStub();
        $window.navigator.userLanguage = undefined;
        $window.navigator.language = 'en_US';
        angular.mock.module(function ($provide) {
            $provide.value('$window', $window);
            $provide.value('$mdDialog', $mdDialog);
        });
    });

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
        angular.mock.module("ap-services");

        angular.mock.module(function ($provide) {
            $provide.factory('$mdDialog', ["$q", function ($q) {
                return specHelper.utility.stubShowMdDialog($q);
            }]);
        });
       specHelper.general.spyProperty(ap.viewmodels.notes.NoteDocumentListViewModel.prototype, "isDisplayingPictureViewer", specHelper.PropertyAccessor.Get).and.returnValue(false);
    });

    afterEach(() => {
        specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteDocumentListViewModel.prototype, "isDisplayingPictureViewer", specHelper.PropertyAccessor.Get);
    });

    beforeEach(inject(function (_$q_, _$controller_, _$rootScope_, _MainController_, _Utility_, _UserContext_, _NoteController_, _$mdDialog_, _ProjectController_, _Api_, _DocumentController_, _AccessRightController_, _NoteService_, _$location_, _$anchorScroll_, _$interval_, _$timeout_,
        _ControllersManager_, _ServicesManager_) {
        $controller = _$controller_;
        MainController = _MainController_;
        DocumentController = _DocumentController_;
        AccessRightController = _AccessRightController_;
        modelSpecHelper.setUtilityModule(_Utility_);
        specHelper.userContext.stub(_Utility_);
        specHelper.utility.stubRootUrl(_Utility_);
        Utility = _Utility_;
        ServicesManager = _ServicesManager_;
        ControllersManager = _ControllersManager_;
        UserContext = _UserContext_;
        NoteController = _NoteController_;
        $rootScope = _$rootScope_;
        ProjectController = _ProjectController_;
        $scope = $rootScope.$new();
        $q = _$q_;
        $mdDialog = _$mdDialog_;
        Api = _Api_;
        NoteService = _NoteService_;

        $location = _$location_;
        $anchorScroll = _$anchorScroll_;
        $interval = _$interval_;
        $timeout = _$timeout_;

        spyOn(Utility.Translator, "getTranslation").and.callFake(function (key) {
            return "$" + key;
        });

        spyOn(Utility.Translator, "initLanguage");
        spyOn(MainController, "currentProject").and.returnValue({
            Id: "b360cb6d-ca54-4b93-a564-a469274eb68a",
            Name: "Welcome Project",
            Creator: Utility.UserContext.CurrentUser(),
            UserAccessRight: {
                CanConfig: true
            }
        });
    }));
    
    describe("Feature: Default values", () => {
        describe("WHEN a EditFormViewModel is created", () => {
            beforeEach(() => {
                let formDetail: ap.viewmodels.forms.FormDetailViewModel = new ap.viewmodels.forms.FormDetailViewModel(Utility, $mdDialog, $q, Api, ControllersManager, ServicesManager, null, $location, $anchorScroll, $interval, $scope, $timeout);
                let form: ap.models.forms.Form = new ap.models.forms.Form(Utility);
                form.createByJson({ Code: "code", Meeting: { Id: "123" } });
                formDetail.init(form);
                editFormVm = new ap.viewmodels.forms.EditFormViewModel(Utility, $mdDialog, $q, Api, $timeout, $scope, ControllersManager, ServicesManager, formDetail);
            });
            it("THEN it's default values are initialized", () => {
                
                expect(editFormVm).toBeDefined();
                expect(editFormVm.noteDetailBaseViewModel).toBeDefined();
                expect(editFormVm.issueTypeSelectorViewModel).toBeDefined();
                expect(editFormVm.contactSelectorViewModel).toBeDefined();
            });
            it("THEN create shortcutActions with save action", () => {
                expect(editFormVm.shortcutActions[0].name).toEqual("form.save");
            });
        });
    });

    describe("Feature: canSave", () => {
        beforeEach(() => {
            let formDetail: ap.viewmodels.forms.FormDetailViewModel = new ap.viewmodels.forms.FormDetailViewModel(Utility, $mdDialog, $q, Api, ControllersManager, ServicesManager, null, $location, $anchorScroll, $interval, $scope, $timeout);
            let form: ap.models.forms.Form = new ap.models.forms.Form(Utility);
            form.createByJson({ Code: "code", Meeting: {Id: "123"} });
            formDetail.init(form);
            editFormVm = new ap.viewmodels.forms.EditFormViewModel(Utility, $mdDialog, $q, Api, $timeout, $scope, ControllersManager, ServicesManager, formDetail);
        });

        describe("WHEN hasChanged is false ", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "hasChanged", specHelper.PropertyAccessor.Get).and.returnValue(false);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "hasChanged", specHelper.PropertyAccessor.Get);
            });
            it("THEN canSave is false", () => {
                expect(editFormVm.canSave()).toBeFalsy();
            });
        });

        describe("WHEN hasChanged is true ", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "hasChanged", specHelper.PropertyAccessor.Get).and.returnValue(true);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.notes.EditNoteBaseViewModel.prototype, "hasChanged", specHelper.PropertyAccessor.Get);
            });
            it("THEN canSave is false", () => {
                expect(editFormVm.canSave()).toBeTruthy();
            });
        });
    });
});
