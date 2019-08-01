describe("Module ap-viewmodels - MeetingViewModel", () => {
    let $rootScope: angular.IRootScopeService, $scope: angular.IScope;
    let Utility: ap.utility.UtilityHelper;
    let MainController: ap.controllers.MainController;
    let MeetingController: ap.controllers.MeetingController;
    let vm: ap.viewmodels.meetings.MeetingViewModel;
    let meeting: ap.models.meetings.Meeting;
    let $q: angular.IQService;
    let project: ap.models.projects.Project;
    let defMeetingAuthors: ng.IDeferred<ap.models.actors.User[]>;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
        angular.mock.module('ap-models');
    });

    beforeEach(inject(function (_$rootScope_, _UserContext_, _Utility_, _$q_, _MainController_, _MeetingController_) {
        Utility = _Utility_;
        MainController = _MainController_;
        MeetingController = _MeetingController_;
        $rootScope = _$rootScope_;
        $q = _$q_;
        $scope = $rootScope.$new();
        specHelper.utility.stubRootUrl(Utility);
        specHelper.userContext.stub(Utility);
        specHelper.utility.stubStorageSet(Utility);
        project = new ap.models.projects.Project(Utility);
        spyOn(Utility.Translator, "getTranslation").and.callFake(function (key) {
            if (key === "app.meetingdetail.titleChanged")
                return "You have updated the name of the project. Do you want APROPLAN to change the project code to <4 first letters of the new project's name>?";
            if (key === "Update list code accordingly")
                return "Update project code accordingly";
        });

        defMeetingAuthors = $q.defer();
        spyOn(MeetingController, "getMeetingAuthorSuggestions").and.returnValue(defMeetingAuthors.promise);
    }));
    beforeEach(() => {
        let currentProject = new ap.models.projects.Project(Utility);
        currentProject.createByJson({ UserAccessRight: {} });
        spyOn(MainController, "currentProject").and.returnValue(currentProject);
        meeting = new ap.models.meetings.Meeting(Utility);
        meeting.createByJson({
            Id: "1",
            Code: "MY F",
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
            NotesNumber: 100,
            TotalNotesNumber: 1000,
            DocumentsNumber: 5,
            ParticipantsNumber: 10,
            MeetingAuthor: {
                Id: "B9937389-990B-4CE6-8A61-EBB9C986223A"
            },
            Project: project,
            UserAccessRight: new ap.models.accessRights.MeetingAccessRight(Utility)
        });
    });
    describe("Constructor", () => {
        describe("WHEN the MeetingViewModel was created", () => {
            it("THEN, the vm was defined and correct defaults values", () => {
                vm = new ap.viewmodels.meetings.MeetingViewModel(Utility, MainController, MeetingController);
                expect(vm).toBeDefined();

                expect(vm.author).toBeNull();
                expect(vm.code).toBeNull();
                expect(vm.date).toBeNull();
                expect(vm.title).toBeNull();
                expect(vm.floor).toBeNull();
                expect(vm.building).toBeNull();
                expect(vm.header).toBeNull();
                expect(vm.remarks).toBeNull();
                expect(vm.footer).toBeNull();
                expect(vm.project).toBeNull();
                expect(vm.meetingAccessRight).toBeNull();
                expect(vm.isArchived).toBeFalsy();
                expect(vm.occurrence).toBe(0);
            });
        });
    });
    describe("CopySource", () => {
        describe("WHEN the MeetingViewModel was created and init by a meeting entity", () => {
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
                    Date: '/Date(1442565731892)/',
                    Type: 1,
                    NumberingType: 1,
                    NotesNumber: 100,
                    TotalNotesNumber: 1000,
                    DocumentsNumber: 5,
                    ParticipantsNumber: 10,
                    MeetingAuthor: {
                        Id: "B9937389-990B-4CE6-8A61-EBB9C986223A"
                    },
                    Project: project,
                    UserAccessRight: new ap.models.accessRights.MeetingAccessRight(Utility)
                });
                meeting.UserAccessRight.CanCreateNextMeeting = false;
            });
            it("THEN, the copySource method was called", () => {
                spyOn(ap.viewmodels.EntityViewModel.prototype, "copySource").and.callThrough();
                vm = new ap.viewmodels.meetings.MeetingViewModel(Utility, MainController, MeetingController);
                vm.init(meeting);
                expect(ap.viewmodels.EntityViewModel.prototype.copySource).toHaveBeenCalled();
            });
            it("AND the viewmodel will updated from the meeting entity", () => {
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.returnValue(true);
                vm = new ap.viewmodels.meetings.MeetingViewModel(Utility, MainController, MeetingController);
                vm.init(meeting);
                expect(vm.code).toEqual(meeting.Code);
                expect(vm.title).toEqual("My first meeting for the test");
                expect(vm.date).toEqual(meeting.Date);
                
                expect(vm.floor).toEqual(meeting.Floor);
                expect(vm.building).toEqual(meeting.Building);
                expect(vm.header).toEqual(meeting.Header);
                expect(vm.remarks).toEqual(meeting.Remarks);
                expect(vm.footer).toEqual(meeting.Footer);
                expect(vm.project).toEqual(meeting.Project);
                expect(vm.meetingAccessRight).toEqual(meeting.UserAccessRight);
                expect(vm.isArchived).toEqual(meeting.IsArchived);
                expect(vm.occurrence).toEqual(meeting.Occurrence);
                expect(vm.meetingAccessRightHelper.canCreateNextMeeting).toBeFalsy();
            });
            it("THEN a list of available action for the meeting is initialized", () => {
                expect(vm.meetingActionViewModel).toBeDefined();
            });
        });
    });
    describe("Feature: postChanges", () => {
        beforeEach(() => {
            spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake((name) => {
                if (name === ap.models.licensing.Module.Module_MeetingCodeOccSeqNumber) return true;
                if (name === ap.models.licensing.Module.Module_MeetingCodeSeqNumber) return true;
                if (name === ap.models.licensing.Module.Module_MeetingOccSeqNumber) return true;
                return false;
            });

            vm = new ap.viewmodels.meetings.MeetingViewModel(Utility, MainController, MeetingController);
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
                Date: '/Date(1442565731892)/',
                Type: 1,
                NumberingType: 1,
                NotesNumber: 100,
                TotalNotesNumber: 1000,
                DocumentsNumber: 5,
                ParticipantsNumber: 10,
                MeetingAuthor: {
                    Id: "B9937389-990B-4CE6-8A61-EBB9C986223A"
                },
                Project: project,
                UserAccessRight: new ap.models.accessRights.MeetingAccessRight(Utility)
            });
            meeting.UserAccessRight.CanCreateNextMeeting = false;
            vm.init(meeting);
        });
        describe("WHEN postChanges is called", () => {
            let author: ap.models.actors.User;
            let project: ap.models.projects.Project;
            let date: Date;
            let accessRights: ap.models.accessRights.MeetingAccessRight;
            beforeEach(() => {
                
                author = new ap.models.actors.User(Utility);
                project = new ap.models.projects.Project(Utility);
                date = new Date(2016, 2, 16, 8, 8, 8);
                accessRights = new ap.models.accessRights.MeetingAccessRight(Utility);
                accessRights.CanCreateNextMeeting = true;

                vm.author = author;
                vm.floor = "12";
                vm.project = project;
                vm.building = "Netika 1";
                vm.header = "Here is header 1";
                vm.remarks = "Some remarks 1";
                vm.footer = "Here is footer 1";
                vm.meetingAccessRight = accessRights;
                vm.title = "My first meeting for the test 1";
                vm.code = "MY1";
                vm.date = date;
                vm.isArchived = false;
                vm.occurrence = 26;
                vm.selectedNumberingType = ap.models.meetings.MeetingNumberingType.CodeSequential;
                vm.postChanges(true);
            });
            it("THEN properties of MeetingViewModel is set into Meeting", () => {
                expect(meeting.MeetingAuthor.Id).toEqual(author.Id);
                expect(meeting.Floor).toEqual("12");
                expect(meeting.Project.Id).toEqual(project.Id);
                expect(meeting.Building).toEqual("Netika 1");
                expect(meeting.Header).toEqual("Here is header 1");
                expect(meeting.Remarks).toEqual("Some remarks 1");
                expect(meeting.Footer).toEqual("Here is footer 1");
                expect(meeting.UserAccessRight.CanCreateNextMeeting).toBeTruthy();
                expect(meeting.Title).toEqual("My first meeting for the test 1");
                expect(meeting.Code).toEqual("MY1");
                expect(meeting.Date).toBe(date);
                expect(meeting.IsArchived).toBeFalsy();
                expect(meeting.Occurrence).toBe(26);
                expect(meeting.NumberingType).toBe(ap.models.meetings.MeetingNumberingType.CodeSequential);
            });
        });
    });
    describe("Feature: computeVisibleNumberingTypes", () => {
        beforeEach(() => {
            vm = new ap.viewmodels.meetings.MeetingViewModel(Utility, MainController, MeetingController);
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
                Date: '/Date(1442565731892)/',
                Type: 1,
                NumberingType: 1,
                NotesNumber: 100,
                TotalNotesNumber: 1000,
                DocumentsNumber: 5,
                ParticipantsNumber: 10,
                MeetingAuthor: {
                    Id: "B9937389-990B-4CE6-8A61-EBB9C986223A"
                },
                Project: project,
                UserAccessRight: new ap.models.accessRights.MeetingAccessRight(Utility)
            });
        });
        describe("WHEN user has access to all module for number", () => {
            beforeEach(() => {
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake((name) => {
                    if (name === ap.models.licensing.Module.Module_MeetingCodeOccSeqNumber) return true;
                    if (name === ap.models.licensing.Module.Module_MeetingCodeSeqNumber) return true;
                    if (name === ap.models.licensing.Module.Module_MeetingOccSeqNumber) return true;
                    return false;
                });
                vm.init(meeting);
            });
            it("THEN visibleNumberingTypes has all NumberingType", () => {
                expect(vm.visibleNumberingTypes.length).toBe(4);
                expect(vm.visibleNumberingTypes[0].key).toBe(ap.models.meetings.MeetingNumberingType.Sequential);
                expect(vm.visibleNumberingTypes[1].key).toBe(ap.models.meetings.MeetingNumberingType.OccSequential);
                expect(vm.visibleNumberingTypes[2].key).toBe(ap.models.meetings.MeetingNumberingType.CodeSequential);
                expect(vm.visibleNumberingTypes[3].key).toBe(ap.models.meetings.MeetingNumberingType.CodeOccSequential);
            });
        });
        describe("WHEN user hasn't access to all module for number", () => {
            beforeEach(() => {
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake((name) => {
                    if (name === ap.models.licensing.Module.Module_MeetingCodeOccSeqNumber) return false;
                    if (name === ap.models.licensing.Module.Module_MeetingCodeSeqNumber) return false;
                    if (name === ap.models.licensing.Module.Module_MeetingOccSeqNumber) return false;
                    return false;
                });
                vm.init(meeting);
            });
            it("THEN visibleNumberingTypes has only Sequential", () => {
                expect(vm.visibleNumberingTypes.length).toBe(1);
                expect(vm.visibleNumberingTypes[0].key).toBe(ap.models.meetings.MeetingNumberingType.Sequential);
            });
        });
        describe("WHEN user has access to Module_MeetingCodeOccSeqNumber", () => {
            beforeEach(() => {
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake((name) => {
                    if (name === ap.models.licensing.Module.Module_MeetingCodeOccSeqNumber) return true;
                    if (name === ap.models.licensing.Module.Module_MeetingCodeSeqNumber) return false;
                    if (name === ap.models.licensing.Module.Module_MeetingOccSeqNumber) return false;
                    return false;
                });
                vm.init(meeting);
            });
            it("THEN visibleNumberingTypes has only Sequential, CodeOccSequential", () => {
                expect(vm.visibleNumberingTypes.length).toBe(2);
                expect(vm.visibleNumberingTypes[0].key).toBe(ap.models.meetings.MeetingNumberingType.Sequential);
                expect(vm.visibleNumberingTypes[1].key).toBe(ap.models.meetings.MeetingNumberingType.CodeOccSequential);
            });
        });
        describe("WHEN user has access to Module_MeetingCodeSeqNumber", () => {
            beforeEach(() => {
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake((name) => {
                    if (name === ap.models.licensing.Module.Module_MeetingCodeOccSeqNumber) return false;
                    if (name === ap.models.licensing.Module.Module_MeetingCodeSeqNumber) return true;
                    if (name === ap.models.licensing.Module.Module_MeetingOccSeqNumber) return false;
                    return false;
                });
                vm.init(meeting);
            });
            it("THEN visibleNumberingTypes has only Sequential, CodeSequential", () => {
                expect(vm.visibleNumberingTypes.length).toBe(2);
                expect(vm.visibleNumberingTypes[0].key).toBe(ap.models.meetings.MeetingNumberingType.Sequential);
                expect(vm.visibleNumberingTypes[1].key).toBe(ap.models.meetings.MeetingNumberingType.CodeSequential);
            });
        });
        describe("WHEN user has access to Module_MeetingOccSeqNumber", () => {
            beforeEach(() => {
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake((name) => {
                    if (name === ap.models.licensing.Module.Module_MeetingCodeOccSeqNumber) return false;
                    if (name === ap.models.licensing.Module.Module_MeetingCodeSeqNumber) return false;
                    if (name === ap.models.licensing.Module.Module_MeetingOccSeqNumber) return true;
                    return false;
                });
                vm.init(meeting);
            });
            it("THEN visibleNumberingTypes has only Sequential, OccSequential", () => {
                expect(vm.visibleNumberingTypes.length).toBe(2);
                expect(vm.visibleNumberingTypes[0].key).toBe(ap.models.meetings.MeetingNumberingType.Sequential);
                expect(vm.visibleNumberingTypes[1].key).toBe(ap.models.meetings.MeetingNumberingType.OccSequential);
            });
        });
    });
    describe("NextOccurenceFeature: create", () => {
        beforeEach(() => {
            vm = new ap.viewmodels.meetings.MeetingViewModel(Utility, MainController, MeetingController);
            vm.createNextOccurrence();
        });
        it("THEN occurence is increased by 1", () => {
            expect(vm.occurrence).toEqual(1);
        });
        it("THEN the date is set as today", () => {
            expect(vm.date).toEqual(new Date());
        });
    });
    describe("Feature: displayMeetingOccurrence", () => {
        beforeEach(() => {
            vm = new ap.viewmodels.meetings.MeetingViewModel(Utility, MainController, MeetingController);
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
                Date: '/Date(1442565731892)/',
                Type: 1,
                NumberingType: 1,
                NotesNumber: 100,
                TotalNotesNumber: 1000,
                DocumentsNumber: 5,
                ParticipantsNumber: 10,
                MeetingAuthor: {
                    Id: "B9937389-990B-4CE6-8A61-EBB9C986223A"
                },
                Project: project,
                UserAccessRight: new ap.models.accessRights.MeetingAccessRight(Utility)
            });
        });
        describe("WHEN user select Sequential or CodeSequential", () => {
            beforeEach(() => {
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake((name) => {
                    if (name === ap.models.licensing.Module.Module_MeetingCodeOccSeqNumber) return true;
                    if (name === ap.models.licensing.Module.Module_MeetingCodeSeqNumber) return true;
                    if (name === ap.models.licensing.Module.Module_MeetingOccSeqNumber) return true;
                    return false;
                });
                vm.init(meeting);
            });
            it("THEN displayMeetingOccurrence should be false", () => {
                vm.selectedNumberingType = ap.models.meetings.MeetingNumberingType.Sequential;
                expect(vm.displayMeetingOccurrence).toBeFalsy();
                vm.selectedNumberingType = ap.models.meetings.MeetingNumberingType.CodeSequential;
                expect(vm.displayMeetingOccurrence).toBeFalsy();
                
            });
        });
        describe("WHEN user select Sequential or CodeSequential", () => {
            beforeEach(() => {
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake((name) => {
                    if (name === ap.models.licensing.Module.Module_MeetingCodeOccSeqNumber) return true;
                    if (name === ap.models.licensing.Module.Module_MeetingCodeSeqNumber) return true;
                    if (name === ap.models.licensing.Module.Module_MeetingOccSeqNumber) return true;
                    return false;
                });
                vm.init(meeting);
            });
            it("THEN displayMeetingOccurrence should be true", () => {
                vm.selectedNumberingType = ap.models.meetings.MeetingNumberingType.OccSequential;
                expect(vm.displayMeetingOccurrence).toBeTruthy();
                vm.selectedNumberingType = ap.models.meetings.MeetingNumberingType.CodeOccSequential;
                expect(vm.displayMeetingOccurrence).toBeTruthy();
                
            });
        });
    });
    describe("Feature: titleChanged", () => {

        beforeEach(() => {
            vm = new ap.viewmodels.meetings.MeetingViewModel(Utility, MainController, MeetingController);
            vm.init(meeting);
        });

        describe("WHEN the four first char of project name are equal to code", () => {
            beforeEach(() => {
                spyOn(MainController, "showConfirm");
                vm.title = "My first meeting for 44 the test";
            });
            it("THEN, code stays the same", () => {
                expect(vm.code).toEqual("MY F");
            });
            it("THEN, showConfirm is not called", () => {
                expect(MainController.showConfirm).not.toHaveBeenCalled();
            });
        });
        describe("WHEN the four first char of list's title are NOT equal to code", () => {

            describe("WHEN the user confirm", () => {
                beforeEach(() => {
                    spyOn(MainController, "showConfirm").and.callFake(function (message, title, callbackConfirm) {
                        callbackConfirm(ap.controllers.MessageResult.Positive);
                    });
                    vm.title = "CODE meeeting";
                });
                it("THEN, code equal to the four first char of name", () => {
                    expect(vm.code).toEqual("CODE");
                });
                it("THEN, showConfirm is called", () => {
                    expect(MainController.showConfirm).toHaveBeenCalled();
                });
            });
            describe("WHEN the user don't confirm", () => {
                beforeEach(() => {
                    spyOn(MainController, "showConfirm").and.callFake(function (message, title, callbackConfirm) {
                        callbackConfirm(ap.controllers.MessageResult.Negative);
                    });
                    vm.title = "CODE meeeting";
                });
                it("THEN, code stays the same", () => {
                    expect(vm.code).toEqual("MY F");
                });
                it("THEN, showConfirm is called", () => {
                    expect(MainController.showConfirm).toHaveBeenCalled();
                });
            });
        });
    });
    describe("Feature: computeHasChanged", () => {
        beforeEach(() => {
            spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake((name) => {
                return true;
            });
            vm = new ap.viewmodels.meetings.MeetingViewModel(Utility, MainController, MeetingController);
        });
        describe("WHEN the viewmodel is initialized with new entity", () => {
            beforeEach(() => {                
                meeting = new ap.models.meetings.Meeting(Utility);
                meeting.UserAccessRight = new ap.models.accessRights.MeetingAccessRight(Utility);
                meeting.Project = project;
                vm.init(meeting);
            })
            it("THEN, hasChanged property is true", () => {
                expect(vm.hasChanged).toBeTruthy();
            });
        });
        describe("WHEN the viewmodel is initialized with the existing entity", () => {
            beforeEach(() => {
                vm.init(meeting);

                let meetingAuthor: ap.models.actors.User = new ap.models.actors.User(Utility);
                meetingAuthor.createByJson({
                    Id: "B9937389-990B-4CE6-8A61-EBB9C986223A"
                });
                let meetingAuthor1: ap.models.actors.User = new ap.models.actors.User(Utility);
                meetingAuthor1.createByJson({
                    Id: "b18454ac-eb26-4487-8ff3-9575b7afccf2"
                });
                defMeetingAuthors.resolve([meetingAuthor, meetingAuthor1]);
                $rootScope.$apply();
            });
            describe("AND no changes made to the viewmodel", () => {
                it("THEN, hasChanged property is false", () => {
                    expect(vm.hasChanged).toBeFalsy();
                });
            });
            describe("AND 'Title' field have been changed", () => {
                it("THEN, viewmodel's hasChanged property is true", () => {
                    expect(vm.hasChanged).toBeFalsy();
                    vm.title = "testinput";
                    expect(vm.hasChanged).toBeTruthy();
                });
            });
            describe("AND 'Code' field have been changed", () => {
                it("THEN, viewmodel's hasChanged property is true", () => {
                    expect(vm.hasChanged).toBeFalsy();
                    vm.code = "testinput";
                    expect(vm.hasChanged).toBeTruthy();
                });
            });
            describe("AND 'Occurrence' field has been changed", () => {
                it("THEN, viewmodel's hasChanged property is true", () => {
                    expect(vm.hasChanged).toBeFalsy();
                    vm.occurrence = 12;
                    expect(vm.hasChanged).toBeTruthy();
                });
            });
            describe("AND 'Type of numbering' field have been changed", () => {                
                it("THEN, viewmodel's hasChanged property is true", () => {
                    expect(vm.hasChanged).toBeFalsy();
                    vm.selectedNumberingType = ap.models.meetings.MeetingNumberingType.CodeSequential;
                    expect(vm.hasChanged).toBeTruthy();
                });
            });
            describe("AND 'Date' field have been changed", () => {
                it("THEN, viewmodel's hasChanged property is true", () => {
                    expect(vm.hasChanged).toBeFalsy();
                    vm.date = new Date(2001, 4, 10);
                    expect(vm.hasChanged).toBeTruthy();
                });
            });
            describe("AND 'Author' field have been changed", () => {
                it("THEN, viewmodel's hasChanged property is true", () => {
                    expect(vm.hasChanged).toBeFalsy();
                    vm.author = vm.authorsList[1];
                    expect(vm.hasChanged).toBeTruthy();
                });
            });
            describe("AND 'Floor' field have been changed", () => {
                it("THEN, viewmodel's hasChanged property is true", () => {
                    expect(vm.hasChanged).toBeFalsy();
                    vm.floor = "testinput";
                    expect(vm.hasChanged).toBeTruthy();
                });
            });
            describe("AND 'Building' field have been changed", () => {
                it("THEN, viewmodel's hasChanged property is true", () => {
                    expect(vm.hasChanged).toBeFalsy();
                    vm.building = "testinput";
                    expect(vm.hasChanged).toBeTruthy();
                });
            });
            describe("AND 'Report Header' field have been changed", () => {
                it("THEN, viewmodel's hasChanged property is true", () => {
                    expect(vm.hasChanged).toBeFalsy();
                    vm.header = "testinput";
                    expect(vm.hasChanged).toBeTruthy();
                });
            });
            describe("AND 'Report Footer' field have been changed", () => {
                it("THEN, viewmodel's hasChanged property is true", () => {
                    expect(vm.hasChanged).toBeFalsy();
                    vm.footer = "testinput";
                    expect(vm.hasChanged).toBeTruthy();
                });
            });
            describe("AND 'Additional information' field have been changed", () => {
                it("THEN, viewmodel's hasChanged property is true", () => {
                    expect(vm.hasChanged).toBeFalsy();
                    vm.remarks = "testinput";
                    expect(vm.hasChanged).toBeTruthy();
                });
            });
        });

    });
}); 