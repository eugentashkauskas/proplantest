'use strict';
describe("Module ap-viewmodels - ActivityLogItemViewModel", () => {
    let $rootScope: angular.IRootScopeService, $scope: angular.IScope;
    let Utility: ap.utility.UtilityHelper, UserContext: ap.utility.UserContext,
        MainController: ap.controllers.MainController;
    let vm: ap.viewmodels.activities.ActivityLogItemViewModel;
    let $q: angular.IQService;
    let activityLog: ap.models.activities.ActivityLog;

    beforeEach(() => {
        angular.mock.module("ap-viewmodels");
        angular.mock.module("matchMedia");
    });
    beforeEach(inject(function (_$rootScope_, _UserContext_, _MainController_, _Utility_, _$q_) {
        Utility = _Utility_;
        MainController = _MainController_;
        UserContext = _UserContext_;
        $rootScope = _$rootScope_;
        $q = _$q_;
        $scope = $rootScope.$new();
        specHelper.utility.stubRootUrl(Utility);
        specHelper.userContext.stub(Utility);
        specHelper.utility.stubStorageSet(Utility);
        spyOn(Utility.Translator, "getTranslation").and.callFake((code) => {
            if (code === "app.general.date_by_author") return "{0} by {1}";
            if (code === "app.activity.changeStatus") return "Status of the point changed from '{0}' to '{1}'";
            if (code === "app.activity.createPoint") return "Point {0} created";
            return "[" + code + "]";
        });

        let user: ap.models.actors.User = new ap.models.actors.User(Utility);
        user.createByJson({ Id: "24", DisplayName: "John Doe" });
        let project: ap.models.projects.Project = new ap.models.projects.Project(Utility);
        project.createByJson({ Id: "36" });
        let meeting: ap.models.meetings.Meeting = new ap.models.meetings.Meeting(Utility);
        meeting.createByJson({ Id: "42" });
        let folder: ap.models.projects.Folder = new ap.models.projects.Folder(Utility);
        folder.createByJson({ Id: "12" });

        activityLog = new ap.models.activities.ActivityLog(Utility);
        activityLog.createByJson({
            Id: "97cbaaf3-25c6-48ad-9055-aa26ca7dbeb0",
            ActivityType: ap.models.activities.ActivityType.Add,
            Date: "\/Date(1458052220000)\/",
            EntityName: "Note",
            EntityCode: "456-987",
            ParentEntityCode: "74874",
            EntityDescription: "To Do",
            ParentEntityGuid: "1256-52"
        });
        activityLog.User = user;
        activityLog.Folder = folder;
        activityLog.Project = project;
        activityLog.Meeting = meeting;
    }));

    describe("Constructor", () => {
        beforeEach(() => {
            vm = new ap.viewmodels.activities.ActivityLogItemViewModel(Utility);
        });
        describe("WHEN ActivityLogItemViewModel is created without an ActivityLog", () => {
            it("THEN the properties are filled with the default values", () => {
                expect(vm.date).toBeNull();
                expect(vm.activityType).toBeNull();
                expect(vm.activityEntityId).toBeNull();
                expect(vm.originalActivityLog).toBeNull();
                expect(vm.parentEntityId).toBeNull();
                expect(vm.user).toBeNull();
                expect(vm.userName).toBeNull();
                expect(vm.userAcronym).toBeNull();
                expect(vm.project).toBeNull();
                expect(vm.meeting).toBeNull();
                expect(vm.folder).toBeNull();
                expect(vm.entityName).toBeNull();
                expect(vm.translatedActivity).toBeNull();
                expect(vm.codeOrDescription1).toBeNull();
                expect(vm.codeOrDescription2).toBeNull();
            });
        });

        describe("WHEN ActivityLogItemViewModel is created with an ActivityLog", () => {
            beforeEach(() => {
                spyOn(Date.prototype, "relativeFormat").and.returnValue("Yesterday");
                spyOn(vm, "copySource").and.callThrough();
                vm.init(activityLog);
            });
            it("THEN, the copySource method is called", () => {
                expect(vm.copySource).toHaveBeenCalled();
            });
            it("THEN the properties are filled with the values from ActivityLog", () => {
                expect(vm.date).toEqual(activityLog.Date);
                expect(vm.activityType).toEqual(ap.models.activities.ActivityType.Add);
                expect(vm.activityEntityId).toBe(activityLog.ActivityEntityId);
                expect(vm.parentEntityId).toBe(activityLog.ParentEntityId);
                expect(vm.originalActivityLog).toEqual(activityLog);
                expect(vm.user).toBe(activityLog.User);
                expect(vm.userName).toBe(activityLog.User.DisplayName);
                expect(vm.userAcronym).toEqual("JD");
                expect(vm.project).toEqual(activityLog.Project);
                expect(vm.meeting).toEqual(activityLog.Meeting);
                expect(vm.folder).toEqual(activityLog.Folder);
                expect(vm.entityName).toBe("Note");
                
                expect(vm.codeOrDescription1).toBe("456-987");
                expect(vm.codeOrDescription2).toBeNull();
            });
            it("THEN, the translation is called with the following code", () => {
                expect(Utility.Translator.getTranslation).toHaveBeenCalledWith("app.activity.createPoint");
            });
            it("THEN, dateByAuthorTitle is correctly built", () => {
                expect(vm.dateByAuthorTitle).toBe("Yesterday by John Doe");
            });
        });
    });

    describe("Feature: getActivityTranslation", () => {
        let activityLog: ap.models.activities.ActivityLog
        beforeEach(() => {
            activityLog = new ap.models.activities.ActivityLog(Utility);

            vm = new ap.viewmodels.activities.ActivityLogItemViewModel(Utility);
        });

        describe("WHEN entityName === 'Note'", () => {
            it("THEN textKey returns 'app.activity.createPoint' AND codeOrDescription1 returns entityCode AND codeOrDescription2 returns null", () => {
                let json = {
                    Date: "\/Date(1458052220000)\/",
                    ActivityType: ap.models.activities.ActivityType.Add,
                    EntityName: "Note",
                    EntityCode: "456-987",
                    ParentEntityCode: "745-874",
                    EntityDescription: "Note description"
                };
                activityLog.createByJson(json);

                vm.init(activityLog);

                expect(vm.translatedActivity).toBe("Point " + json.EntityCode +" created");
                expect(vm.codeOrDescription1).toBe(json.EntityCode);
                expect(vm.codeOrDescription2).toBeNull();
            });
        });

        describe("WHEN entityName === 'NoteProcessStatusHistory'", () => {
            it("THEN textKey returns 'app.activity.changeStatus' AND codeOrDescription1 returns parentEntityCode AND codeOrDescription2 returns entityDescription", () => {
                let json = {
                    Date: "\/Date(1458052220000)\/",
                    ActivityType: ap.models.activities.ActivityType.Add,
                    EntityName: "NoteProcessStatusHistory",
                    EntityCode: "456-987",
                    ParentEntityDescription: "745-874",
                    EntityDescription: "Note description"
                };
                activityLog.createByJson(json);

                vm.init(activityLog);

                expect(vm.translatedActivity).toBe("Status of the point changed from '" + json.ParentEntityDescription + "' to '" + json.EntityDescription + "'");
                expect(vm.codeOrDescription1).toBe(json.ParentEntityDescription);
                expect(vm.codeOrDescription2).toBe(json.EntityDescription);
            });
        });

        describe("WHEN entityName === 'Plan'", () => {
            describe("WHEN FolderType === 'Report'", () => {
                it("THEN textKey returns 'app.activity.generateReport' AND codeOrDescription1 returns entityDescription AND codeOrDescription2 returns null", () => {
                    let json = {
                        Date: "\/Date(1458052220000)\/",
                        ActivityType: ap.models.activities.ActivityType.Add,
                        EntityName: "Plan",
                        EntityCode: "456-987",
                        ParentEntityCode: "745-874",
                        EntityDescription: "Note description",
                        Folder: { FolderType: ap.models.projects.FolderType.Report }
                    };
                    activityLog.createByJson(json);

                    vm.init(activityLog);

                    expect(vm.translatedActivity).toBe("[app.activity.generateReport]");
                    expect(vm.codeOrDescription1).toBe(json.EntityDescription);
                    expect(vm.codeOrDescription2).toBeNull();
                });
            });

            describe("WHEN FolderType !== 'Report'", () => {
                it("THEN textKey returns 'app.activity.uploadDocument' AND codeOrDescription1 returns entityDescription AND codeOrDescription2 returns null", () => {
                    let json = {
                        Date: "\/Date(1458052220000)\/",
                        ActivityType: ap.models.activities.ActivityType.Add,
                        EntityName: "Plan",
                        EntityCode: "456-987",
                        ParentEntityCode: "745-874",
                        EntityDescription: "Note description",
                        Folder: { FolderType: ap.models.projects.FolderType.Photo }
                    };
                    activityLog.createByJson(json);

                    vm.init(activityLog);

                    expect(vm.translatedActivity).toBe("[app.activity.uploadDocument]");
                    expect(vm.codeOrDescription1).toBe(json.EntityDescription);
                    expect(vm.codeOrDescription2).toBeNull();
                });
            });
        });

        describe("WHEN entityName === 'Version'", () => {
            it("THEN textKey returns 'app.activity.addVersion' AND codeOrDescription1 returns entityDescription AND codeOrDescription2 returns null", () => {
                let json = {
                    Date: "\/Date(1458052220000)\/",
                    ActivityType: ap.models.activities.ActivityType.Add,
                    EntityName: "Version",
                    EntityCode: "456-987",
                    ParentEntityCode: "745-874",
                    EntityDescription: "Note description"
                };
                activityLog.createByJson(json);

                vm.init(activityLog);

                expect(vm.translatedActivity).toBe("[app.activity.addVersion]");
                expect(vm.codeOrDescription1).toBe(json.EntityDescription);
                expect(vm.codeOrDescription2).toBeNull();
            });
        });

        describe("WHEN entityName === 'NoteComment'", () => {
            it("THEN textKey returns 'app.activity.addComment' AND codeOrDescription1 returns parentEntityCode AND codeOrDescription2 returns null", () => {
                let json = {
                    Date: "\/Date(1458052220000)\/",
                    ActivityType: ap.models.activities.ActivityType.Add,
                    EntityName: "NoteComment",
                    EntityCode: "456-987",
                    ParentEntityCode: "745-874",
                    EntityDescription: "Note description"
                };
                activityLog.createByJson(json);

                vm.init(activityLog);

                expect(vm.translatedActivity).toBe("[app.activity.addComment]");
                expect(vm.codeOrDescription1).toBe(json.ParentEntityCode);
                expect(vm.codeOrDescription2).toBeNull();
            });
        });

        describe("WHEN entityName === 'Meeting'", () => {
            it("THEN textKey returns 'app.activity.createMeeting' AND codeOrDescription1 returns entityDescription AND codeOrDescription2 returns null", () => {
                let json = {
                    Date: "\/Date(1458052220000)\/",
                    ActivityType: ap.models.activities.ActivityType.Add,
                    EntityName: "Meeting",
                    EntityCode: "456-987",
                    ParentEntityCode: "745-874",
                    EntityDescription: "Note description"
                };
                activityLog.createByJson(json);

                vm.init(activityLog);

                expect(vm.translatedActivity).toBe("[app.activity.createMeeting]");
                expect(vm.codeOrDescription1).toBe(json.EntityDescription);
                expect(vm.codeOrDescription2).toBeNull();
            });
        });

    });

});