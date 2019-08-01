'use strict';
describe("Module ap-viewmodels - MeetingItemViewModel", () => {
    let $rootScope: angular.IRootScopeService, $scope: angular.IScope;
    let Utility: ap.utility.UtilityHelper, UserContext: ap.utility.UserContext;
    let vm: ap.viewmodels.meetings.MeetingItemViewModel;
    let meeting: ap.models.meetings.Meeting;
    let $q: angular.IQService;
    let MainController: ap.controllers.MainController;    
    let MeetingController: ap.controllers.MeetingController; 
    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });
    beforeEach(inject(function (_$rootScope_, _UserContext_, _Utility_, _$q_, _MainController_, _MeetingController_) {
        Utility = _Utility_;
        UserContext = _UserContext_;
        $rootScope = _$rootScope_;
        $q = _$q_;
        MainController = _MainController_;
        MeetingController = _MeetingController_;
        $scope = $rootScope.$new();
        specHelper.utility.stubRootUrl(Utility);
        specHelper.userContext.stub(Utility);
        specHelper.utility.stubStorageSet(Utility);

        spyOn(Date.prototype, "getLocalDatePattern").and.returnValue("dd/MM/yyyy");
    }));
    describe("Feature : Constructor", () => {
        describe("WHEN the MeetingItemViewModel was created", () => {
            it("THEN, the vm was defined and correct defaults values", () => {
                vm = new ap.viewmodels.meetings.MeetingItemViewModel(Utility, $q);
                expect(vm).toBeDefined();
                expect(vm.authorName).toBeNull();
                expect(vm.code).toBeNull();
                expect(vm.date).toBeNull();
                expect(vm.title).toBeNull();
                expect(vm.notesCount).toBe(-1);
                expect(vm.participantsCount).toBe(-1);
                expect(vm.documentsCount).toBe(-1);
                expect(vm.hasAccessCreateNextMeeting).toBeFalsy();
                expect(vm.canCreateNextMeeting).toBeFalsy();
                expect(vm.shortened).toBeNull();
                expect(vm.dateFormatted).toBe("");
            });
        });
    });
    describe("Feature : CopySource", () => {
        beforeEach(() => {
            meeting = new ap.models.meetings.Meeting(Utility);
            meeting.createByJson({
                Id: "1",
                Code: "MY",
                Title: "My first meeting for the test",
                Comment: "Comment",
                Building: "Netika",
                Floor: "11",
                Header: "Here is header",
                Footer: "Here is footer",
                Remarks: "Some remarks",
                Occurrence: 25,
                Revision: 1,
                IsPublic: false,
                IsSystem: false,
                IsArchived: false,
                Date: '2018-03-02T20:00:00.000Z',
                Type: 1,
                NumberingType: 1,
                MeetingAuthor: {
                    Id: "B9937389-990B-4CE6-8A61-EBB9C986223A"
                },
                UserAccessRight: {
                    ModuleName: "The module meeting"
                }
            });
            meeting.UserAccessRight.CanCreateNextMeeting = true;

        });
        describe("WHEN the MeetingItemViewModel was created and init by a meeting entity", () => {
            beforeEach(() => {
                spyOn(ap.viewmodels.EntityViewModel.prototype, "copySource").and.callThrough();
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.returnValue(true);

                vm = new ap.viewmodels.meetings.MeetingItemViewModel(Utility, $q);
                vm.init(meeting);
            });
            it("THEN, the copySource method was called", () => {
                expect(ap.viewmodels.EntityViewModel.prototype.copySource).toHaveBeenCalled();
            });
            it("AND the viewmodel will updated from the meeting entity", () => {
                expect(vm.authorName).toEqual(meeting.MeetingAuthor.DisplayName);
                expect(vm.code).toEqual(meeting.Code);
                expect(vm.title).toEqual("My first meeting for the test");
                expect(vm.date).toEqual(meeting.Date);
                expect(vm.canCreateNextMeeting).toEqual(meeting.UserAccessRight.CanCreateNextMeeting);
                expect(vm.hasAccessCreateNextMeeting).toEqual(true);
                expect(vm.shortened).toBe("MY");
                expect(vm.dateFormatted).toEqual(new Date("2018-03-02T21:00:00+01:00").format(DateFormat.Standard));
            });
            it("THEN a list of actions is not initialized", () => {
                expect(vm.meetingActionViewModel).toBeUndefined();
            });
        });
        describe("WHEN the code is bigger than 3 chars and the meeting is not system", () => {
            beforeEach(() => {
                meeting.Code = "MYCODE";
                vm = new ap.viewmodels.meetings.MeetingItemViewModel(Utility, $q);
                vm.init(meeting);
            });
            it("THEN, the shortened equals the code cuts to 3 chars", () => {
                expect(vm.shortened).toBe("MYC");
            });
        });
        describe("WHEN the code is bigger isSystem and public", () => {
            beforeEach(() => {
                meeting.Code = "MYCODE";
                meeting.IsSystem = true;
                meeting.IsPublic = true;
                vm = new ap.viewmodels.meetings.MeetingItemViewModel(Utility, $q);
                vm.init(meeting);
            });
            it("THEN, the shortened equals the code cuts to 3 chars", () => {
                expect(vm.shortened).toBe("PuL");
            });
        });
        describe("WHEN the code is bigger isSystem and not public", () => {
            beforeEach(() => {
                meeting.Code = "MYCODE";
                meeting.IsSystem = true;
                meeting.IsPublic = false;
                vm = new ap.viewmodels.meetings.MeetingItemViewModel(Utility, $q);
                vm.init(meeting);
            });
            it("THEN, the shortened equals the code cuts to 3 chars", () => {
                expect(vm.shortened).toBe("PrL");
            });
        });

        describe("WHEN init from system meeting with custom MeetingItemParameter", () => {
            let currentProject: ap.models.projects.Project;
            beforeEach(() => {
                spyOn(Utility.Translator, "getTranslation").and.callFake((code: string) => {
                    if (code === "app.list_of_project") return "{0} of {1}";
                    return "[" + code + "]";
                });
                currentProject = new ap.models.projects.Project(Utility);
                currentProject.Code = "MYPROJ";
                currentProject.Name = "My project";
                currentProject.Creator = new ap.models.actors.User(Utility);
                currentProject.Creator.createByJson({
                    DisplayName: "John Smith"
                });

                spyOn(MainController, "currentProject").and.returnValue(currentProject);                

                meeting.Code = "MYCODE";
                meeting.IsSystem = true;
                meeting.IsPublic = true;
                meeting.MeetingAuthor = undefined;
                vm = new ap.viewmodels.meetings.MeetingItemViewModel(Utility, $q, null, new ap.viewmodels.meetings.MeetingItemParameter(0, null, null, null, Utility, MainController, MeetingController));
                vm.init(meeting);
            });
            it("THEN, the title is format base on projectcode and name", () => {
                expect(vm.title).toBe("My first meeting for the test of (MYPROJ) My project");
            });
            it("THEN, the authorName is the creator of the project", () => {
                expect(vm.authorName).toBe(MainController.currentProject().Creator.DisplayName);
            });
            it("THEN a list of actions is initialized", () => {
                expect(vm.meetingActionViewModel).toBeDefined();
            });
        });
    });

    describe("Feature : languagechanged", () => {
        describe("WHEN the 'languagechanged' event was fired", () => {
            beforeEach(() => {
                specHelper.mainController.stub(MainController, Utility);
                meeting.Code = "MYCODE";
                meeting.IsSystem = false;
                vm = new ap.viewmodels.meetings.MeetingItemViewModel(Utility, $q, null, new ap.viewmodels.meetings.MeetingItemParameter(0, null, null, null, Utility, MainController, MeetingController));
                vm.init(meeting);
            });
            it("THEN, the Meeting.computeTitle method will called to update the title", () => {

                specHelper.general.raiseEvent(Utility.Translator, "languagechanged", null);

                expect(vm.title).toEqual("My first meeting for the test");
            });
        });
    });

});