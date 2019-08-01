describe("Module ap-viewmodels - projects - ProjectIssueTypeConfigViewModel", () => {
    let Utility: ap.utility.UtilityHelper,
        MainController: ap.controllers.MainController,
        ProjectController: ap.controllers.ProjectController,
        Api: ap.services.apiHelper.Api,
        $q: angular.IQService,
        $timeout: angular.ITimeoutService,
        $mdDialog: angular.material.IDialogService;
    let $rootScope: angular.IRootScopeService;
    let ControllersManager: ap.controllers.ControllersManager;
    let ServicesManager: ap.services.ServicesManager;
    let spiedCurrentProject: ap.models.projects.Project;
    let defProjectService;
    let $scope: angular.IScope;
    class IssueTypeListV extends ap.viewmodels.projects.IssueTypeListViewModel {

        afterLoadPageSuccessHandler(arrayItem: ap.viewmodels.IEntityViewModel[], index: number, pageDesc: ap.viewmodels.PageDescription, createItemVmHandler?: new (utility: ap.utility.UtilityHelper, q: angular.IQService, parentListVm?: ap.viewmodels.BaseListEntityViewModel, itemParameters?: ap.viewmodels.ItemConstructorParameter) => ap.viewmodels.IEntityViewModel, _pageLoadedParameters?: ap.viewmodels.LoadPageSuccessHandlerParameter) { }

        constructor(utility: ap.utility.UtilityHelper, protected $q: angular.IQService, _controllersManager: ap.controllers.ControllersManager) {
            super(utility, $q, _controllersManager);
        }
    }

    class ChapterListV extends ap.viewmodels.projects.ChapterListViewModel {

        afterLoadPageSuccessHandler(arrayItem: ap.viewmodels.IEntityViewModel[], index: number, pageDesc: ap.viewmodels.PageDescription, createItemVmHandler?: new (utility: ap.utility.UtilityHelper, q: angular.IQService, parentListVm?: ap.viewmodels.BaseListEntityViewModel, itemParameters?: ap.viewmodels.ItemConstructorParameter) => ap.viewmodels.IEntityViewModel, _pageLoadedParameters?: ap.viewmodels.LoadPageSuccessHandlerParameter) { }

        constructor(utility: ap.utility.UtilityHelper, protected $q: angular.IQService, _controllersManager: ap.controllers.ControllersManager, _projectService: ap.services.ProjectService) {
            super(utility, $q, _controllersManager, _projectService);
        }
    }

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
        angular.mock.module("ap-controllers");
        angular.mock.module(function ($provide) {
            $provide.factory('$mdDialog', ["$q", function ($q) {
                return specHelper.utility.stubShowMdDialog($q);
            }]);
        });
    });

    beforeEach(inject(function (_Utility_, _Api_, _MainController_, _ProjectController_, _$q_, _$rootScope_, _ControllersManager_, _ServicesManager_, _$mdDialog_, _$timeout_) {
        Utility = _Utility_;
        MainController = _MainController_;
        Api = _Api_;
        $q = _$q_;
        ProjectController = _ProjectController_;
        $mdDialog = _$mdDialog_;
        $timeout = _$timeout_;
        ServicesManager = _ServicesManager_;
        $rootScope = _$rootScope_;
        ControllersManager = _ControllersManager_;
        spiedCurrentProject = specHelper.mainController.stub(MainController, Utility);
        $scope = $rootScope.$new();
    }));

    beforeEach(() => {
        specHelper.userContext.stub(Utility);
        defProjectService = $q.defer();
    });

    let vm: ap.viewmodels.projects.ProjectIssueTypeConfigViewModel;
    let tab: string[];
    let id1: string;
    let id2: string;
    let id3: string;
    let id4: string;
    let id5: string;
    let id6: string;
    let id7: string;
    let apiDataChapter;
    let apiDataIssueType;
    let options: ap.services.apiHelper.ApiOption;
    let currentProj: ap.models.projects.Project;
    let defResponse: angular.IDeferred<any>;
    let deferDataChapter: angular.IDeferred<any>;
    let deferDataIssueType: angular.IDeferred<any>;
    let chapterVm: ap.viewmodels.projects.ChapterViewModel;
    let issueTypeVm: ap.viewmodels.projects.IssueTypeViewModel;
    let chapter: ap.models.projects.Chapter;
    let issueType: ap.models.projects.IssueType;
    let defProject: any;

    beforeEach(() => {
        chapter = new ap.models.projects.Chapter(Utility);
        issueType = new ap.models.projects.IssueType(Utility);
        chapterVm = new ap.viewmodels.projects.ChapterViewModel(Utility);
        chapterVm.init(chapter);
        issueTypeVm = new ap.viewmodels.projects.IssueTypeViewModel(Utility);
        issueTypeVm.init(issueType);
        id1 = chapterVm.originalEntity.Id;
        id2 = issueTypeVm.originalEntity.Id;
        id3 = ap.utility.UtilityHelper.createGuid();
        id4 = ap.utility.UtilityHelper.createGuid();
        id5 = ap.utility.UtilityHelper.createGuid();
        id6 = ap.utility.UtilityHelper.createGuid();
        id7 = ap.utility.UtilityHelper.createGuid();
        tab = [id1 + "0", id2 + "1", id3 + "1", id4 + "0", id5 + "1", id6 + "0", id7 + "1"];

        apiDataChapter = [
            {
                Id: id1,
                Code: "Code 0",
                Description: "Desc0"
            },
            {
                Id: id4,
                Code: "Code 1",
                Description: "Desc1"
            },
            {
                Id: id6,
                Code: "Code 2",
                Description: "Desc2"
            }
        ];

        apiDataIssueType = [
            {
                Id: id2,
                Code: "Code 0",
                Description: "Desc0"
            },
            {
                Id: id3,
                Code: "Code 1",
                Description: "Desc1"
            },
            {
                Id: id5,
                Code: "Code 2",
                Description: "Desc2"
            },
            {
                Id: id7,
                Code: "Code 3",
                Description: "Desc3"
            }
        ];
        defProject = $q.defer();
        spyOn(Api, "getEntityIds").and.callFake((entityName: string) => {
            if (entityName === "Project") {
                return defProject.promise;
            }
        });
    });

    // spy Segment.IO calls
    beforeEach(() => {
        spyOn(ServicesManager.toolService, "sendEvent").and.returnValue($q.defer().promise);
    });

    describe("WHEN the constructor is called", () => {
        let deferredLoadChapters: angular.IDeferred<any>;

        beforeEach(() => {
            
            vm = new ap.viewmodels.projects.ProjectIssueTypeConfigViewModel($rootScope, Utility, $q, Api, ControllersManager, ServicesManager, $mdDialog, $timeout);

            defResponse = $q.defer();
            deferDataChapter = $q.defer();
            deferDataIssueType = $q.defer();

            deferredLoadChapters = $q.defer();
            spyOn(ServicesManager.projectService, "getProjectChapters").and.returnValue(deferredLoadChapters.promise);
            let chapterCode = [{ Id: id1, Code: "Code 0", Description: "Description 0" },
            { Id: id2, Code: "Code 0", Description: "Description 0" },
            { Id: id3, Code: "Code 1", Description: "Description 1" },
            { Id: id4, Code: "Code 1", Description: "Description 1" },
            { Id: id5, Code: "Code 2", Description: "Description 2" },
            { Id: id6, Code: "Code 2", Description: "Description 2" },
            { Id: id7, Code: "Code 3", Description: "Description 3" }];

            currentProj = ControllersManager.mainController.currentProject();

            options = new ap.services.apiHelper.ApiOption();
            options.customParams.push(new ap.services.apiHelper.ApiCustomParam("projectId", currentProj.Id));
            options.customParams.push(new ap.services.apiHelper.ApiCustomParam("baseentityname", "chapter"));
            spyOn(Api, "getApiResponse").and.callFake((url: string) => {
                if (url === "rest/chapterhierarchiesids") {
                    return defResponse.promise;
                }
                vm.loadIdsData();
                defResponse.resolve(new ap.services.apiHelper.ApiResponse(tab));
                $rootScope.$apply();
            });

            vm.loadIdsData();
            defResponse.resolve(new ap.services.apiHelper.ApiResponse(tab));
            $rootScope.$apply();
        });

        it("THEN chapterListVm is defined", () => {
            expect(vm.chapterListVm).toBeDefined();
        });
        it("THEN issueTypeListVm is defined", () => {
            expect(vm.issueTypeListVm).toBeDefined();
        });
        it("THEN subjectDescListVm is defined", () => {
            expect(vm.subjectDescListVm).toBeDefined();
        });
        it("THEN screenInfo is defined", () => {
            expect(vm.screenInfo).toBeDefined();
        });
        it("THEN the name of the screen is 'project.issuetypeconfig'", () => {
            expect(vm.screenInfo.name).toBe("project.issuetypeconfig");
        });
        it("THEN, 3 actions are defined", () => {
            expect(vm.screenInfo.actions.length).toBe(4);
        });
        it("THEN, the first action is 'issuetype.edit'", () => {
            expect(vm.screenInfo.actions[0].name).toBe("issuetype.edit");
        });
        it("THEN, the second action is 'issuetype.save'", () => {
            expect(vm.screenInfo.actions[1].name).toBe("issuetype.save");
        });
        it("THEN, the third actions is 'issuetype.cancel'", () => {
            expect(vm.screenInfo.actions[2].name).toBe("issuetype.cancel");
        });
        it("THEN, the fourth actions is 'issuetypes.import'", () => {
            expect(vm.screenInfo.actions[3].name).toBe("issuetypes.import");
        });
        it("THEN, import sub-actions are initialized properly", () => {
            expect(vm.screenInfo.actions[3].subActions.length).toEqual(2);
            expect(vm.screenInfo.actions[3].subActions[0].name).toEqual("import.excel");
            expect(vm.screenInfo.actions[3].subActions[0].isSelectable).toBeFalsy();
            expect(vm.screenInfo.actions[3].subActions[1].name).toEqual("import.project");
            expect(vm.screenInfo.actions[3].subActions[1].isSelectable).toBeFalsy();
        });
    });

    describe("WHEN the method loadIdsData is called", () => {
        let deferredLoadChapters: angular.IDeferred<any>;

        beforeEach(() => {
            vm = new ap.viewmodels.projects.ProjectIssueTypeConfigViewModel($scope, Utility, $q, Api, ControllersManager, ServicesManager, $mdDialog, $timeout);

            defResponse = $q.defer();
            deferDataChapter = $q.defer();
            deferDataIssueType = $q.defer();

            deferredLoadChapters = $q.defer();
            spyOn(ServicesManager.projectService, "getProjectChapters").and.returnValue(deferredLoadChapters.promise);
            let chapterCode = [{ Id: id1, Code: "Code 0", Description: "Description 0" },
            { Id: id2, Code: "Code 0", Description: "Description 0" },
            { Id: id3, Code: "Code 1", Description: "Description 1" },
            { Id: id4, Code: "Code 1", Description: "Description 1" },
            { Id: id5, Code: "Code 2", Description: "Description 2" },
            { Id: id6, Code: "Code 2", Description: "Description 2" },
            { Id: id7, Code: "Code 3", Description: "Description 3" }];

            currentProj = ControllersManager.mainController.currentProject();

            options = new ap.services.apiHelper.ApiOption();
            options.customParams.push(new ap.services.apiHelper.ApiCustomParam("projectId", currentProj.Id));
            options.customParams.push(new ap.services.apiHelper.ApiCustomParam("baseentityname", "chapter"));
            options.showDetailBusy = true;
            spyOn(Api, "getApiResponse").and.callFake((url: string) => {
                if (url === "rest/chapterhierarchiesids") {
                    return defResponse.promise;
                }
            });

            vm.loadIdsData();
            defResponse.resolve(new ap.services.apiHelper.ApiResponse(tab));
            $rootScope.$apply();
        });
        it("THEN getApiResponse is called with correct param", () => {
            expect(Api.getApiResponse).toHaveBeenCalledWith("rest/chapterhierarchiesids", ap.services.apiHelper.MethodType.Get, null, null, options);
        });
        it("THEN chapterListVm is init", () => {
            expect(vm.chapterListVm.count).toEqual(3);
            expect(vm.chapterListVm.ids[0]).toEqual(id1);
            expect(vm.chapterListVm.ids[1]).toEqual(id4);
            expect(vm.chapterListVm.ids[2]).toEqual(id6);
        });
        it("THEN, chapterListVm's ids property is set to the ")
    });

    describe("WHEN the method handlerSelectedChapterChanged is called", () => {
        let deferredLoadChapters: angular.IDeferred<any>;
        let apiSpy: jasmine.Spy;
        let issueTypeListVm: IssueTypeListV;

        beforeEach(() => {
            deferredLoadChapters = $q.defer();
            spyOn(ServicesManager.projectService, "getProjectChapters").and.returnValue(deferredLoadChapters.promise);
            vm = new ap.viewmodels.projects.ProjectIssueTypeConfigViewModel($scope, Utility, $q, Api, ControllersManager, ServicesManager, $mdDialog, $timeout);
            spyOn((<IssueTypeListV>vm.issueTypeListVm), "afterLoadPageSuccessHandler");
            spyOn((<ChapterListV>vm.chapterListVm), "afterLoadPageSuccessHandler");
            defResponse = $q.defer();
            deferDataChapter = $q.defer();
            deferDataIssueType = $q.defer();


            let chapterCode = [{ Id: id1, Code: "Code 0", Description: "Description 0" },
            { Id: id2, Code: "Code 0", Description: "Description 0" },
            { Id: id3, Code: "Code 1", Description: "Description 1" },
            { Id: id4, Code: "Code 1", Description: "Description 1" },
            { Id: id5, Code: "Code 2", Description: "Description 2" },
            { Id: id6, Code: "Code 2", Description: "Description 2" },
            { Id: id7, Code: "Code 3", Description: "Description 3" }];

            currentProj = ControllersManager.mainController.currentProject();

            options = new ap.services.apiHelper.ApiOption();
            options.customParams.push(new ap.services.apiHelper.ApiCustomParam("projectId", currentProj.Id));
            options.customParams.push(new ap.services.apiHelper.ApiCustomParam("baseentityname", "chapter"));
            spyOn(Api, "getApiResponse").and.callFake((url: string) => {
                if (url === "rest/chapterhierarchiesids") {
                    return defResponse.promise;
                }
            });

            vm.loadIdsData();

            deferredLoadChapters.resolve(chapterCode);
            defResponse.resolve(new ap.services.apiHelper.ApiResponse(tab));
            $rootScope.$apply();

            apiSpy = spyOn(Api, "getEntityList").and.callFake((entityName: string, filter?: string, pathToLoad?: string, sortOrder?: string, ids?: string[]) => {
                if (entityName === "Chapter") return deferDataChapter.promise;
                if (entityName === "IssueType") return deferDataIssueType.promise;

            });
            vm.chapterListVm.loadNextPage();
            deferDataChapter.resolve(new ap.services.apiHelper.ApiResponse(apiDataChapter));
            deferDataIssueType.resolve(new ap.services.apiHelper.ApiResponse(apiDataIssueType));
            $rootScope.$apply();
            spyOn(vm.subjectDescListVm, "clear");
            vm.chapterListVm.selectedViewModel = chapterVm;
        });
        it("THEN, the API.getEntityList method is called", () => {
            expect(apiSpy.calls.count()).toEqual(2);
            expect(apiSpy.calls.first().args[4]).toEqual([id1, id4, id6]);
            expect(apiSpy.calls.mostRecent().args[4]).toEqual([id2, id3]);
        });
        it("THEN issueTypeListVm is init", () => {
            expect(vm.issueTypeListVm.count).toEqual(2);
            expect(vm.issueTypeListVm.ids[0]).toEqual(id2);
            expect(vm.issueTypeListVm.ids[1]).toEqual(id3);
        });
        it("THEN, clear subjects list", () => {
            expect(vm.subjectDescListVm.clear).toHaveBeenCalled();
        });
    });
    describe("WHEN the method handlerSelectedIssueTypeChanged is called", () => {
        let deferredLoadChapters: angular.IDeferred<any>;

        beforeEach(() => {
            deferredLoadChapters = $q.defer();

            spyOn(ServicesManager.projectService, "getProjectChapters").and.returnValue(deferredLoadChapters.promise);
            vm = new ap.viewmodels.projects.ProjectIssueTypeConfigViewModel($scope, Utility, $q, Api, ControllersManager, ServicesManager, $mdDialog, $timeout);
            spyOn((<IssueTypeListV>vm.issueTypeListVm), "afterLoadPageSuccessHandler");
            spyOn((<ChapterListV>vm.chapterListVm), "afterLoadPageSuccessHandler");
            defResponse = $q.defer();
            deferDataChapter = $q.defer();
            deferDataIssueType = $q.defer();

            let chapterCode = [{ Id: id1, Code: "Code 0", Description: "Description 0" },
            { Id: id2, Code: "Code 0", Description: "Description 0" },
            { Id: id3, Code: "Code 1", Description: "Description 1" },
            { Id: id4, Code: "Code 1", Description: "Description 1" },
            { Id: id5, Code: "Code 2", Description: "Description 2" },
            { Id: id6, Code: "Code 2", Description: "Description 2" },
            { Id: id7, Code: "Code 3", Description: "Description 3" }];

            currentProj = ControllersManager.mainController.currentProject();

            options = new ap.services.apiHelper.ApiOption();
            options.customParams.push(new ap.services.apiHelper.ApiCustomParam("projectId", currentProj.Id));
            options.customParams.push(new ap.services.apiHelper.ApiCustomParam("baseentityname", "chapter"));
            spyOn(Api, "getApiResponse").and.callFake((url: string) => {
                if (url === "rest/chapterhierarchiesids") {
                    return defResponse.promise;
                }
            });

            vm.loadIdsData();

            deferredLoadChapters.resolve(chapterCode);
            defResponse.resolve(new ap.services.apiHelper.ApiResponse(tab));
            $rootScope.$apply();

            spyOn(Api, "getEntityList").and.callFake((entityName: string, filter?: string, pathToLoad?: string, sortOrder?: string, ids?: string[]) => {
                if (entityName === "Chapter") return deferDataChapter.promise;
                if (entityName === "IssueType") return deferDataIssueType.promise;

            });
            vm.chapterListVm.loadNextPage();
            deferDataChapter.resolve(new ap.services.apiHelper.ApiResponse(apiDataChapter));
            $rootScope.$apply();

            vm.chapterListVm.selectedViewModel = chapterVm;

            deferDataIssueType.resolve(new ap.services.apiHelper.ApiResponse(apiDataIssueType));
            $rootScope.$apply();
            let defLoad = $q.defer();
            spyOn(vm.subjectDescListVm, "load").and.returnValue(defLoad.promise);
            spyOn(vm.subjectDescListVm, "enableActions");
            spyOn(vm.subjectDescListVm, "disableActions");
            vm.issueTypeListVm.selectedViewModel = issueTypeVm;
        });

        it("THEN subjectDescListVm.issueTypeId is init", () => {
            expect(vm.subjectDescListVm.issueTypeId).toEqual(id2);
        });

        it("THEN a list of subjects is loaded", () => {
            expect(vm.subjectDescListVm.load).toHaveBeenCalled();
        });

        it("THEN subject list's actions are enabled", () => {
            expect(vm.subjectDescListVm.enableActions).toHaveBeenCalled();
        });

        describe("WHEN an issue type is deselected", () => {
            beforeEach(() => {
                vm.issueTypeListVm.selectedViewModel = null;
            });

            it("THEN subject list's actions are disabled", () => {
                expect(vm.subjectDescListVm.disableActions).toHaveBeenCalled();
            });
        });
    });

    describe("Feature: checkEditAccess", () => {
        let vm: ap.viewmodels.projects.ProjectIssueTypeConfigViewModel;
        let proj: ap.models.projects.Project;
        let access: ap.models.accessRights.ProjectAccessRight;

        beforeEach(() => {
            spyOn(ServicesManager.projectService, "getProjectChapters").and.returnValue(defProjectService.promise);
            access = new ap.models.accessRights.ProjectAccessRight(Utility);
            proj = new ap.models.projects.Project(Utility);
        });
        describe("WHEN the user has the module 'projectIssueTypeConfig' AND the vm is in read mode", () => {
            beforeEach(() => {
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.returnValue(true);
                vm = new ap.viewmodels.projects.ProjectIssueTypeConfigViewModel($scope, Utility, $q, Api, ControllersManager, ServicesManager, $mdDialog, $timeout);
            });
            it("THEN the edit button is visible", () => {
                expect(vm.screenInfo.actions[0].isVisible).toEqual(true);
            });
            it("THEN the edit button is enabled", () => {
                expect(vm.screenInfo.actions[0].isEnabled).toEqual(true);
            });
        });
        describe("WHEN the user has the module 'projectIssueTypeConfig' AND the vm is in edit mode", () => {
            describe("WHEN utility.UserContext.licenseAccess.hasAccess(projectIssueTypeConfig) = true && isEditMode = true", () => {
                beforeEach(() => {
                    specHelper.general.spyProperty(ap.misc.ScreenInfo.prototype, "isEditMode", specHelper.PropertyAccessor.Get).and.returnValue(true);
                    spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.returnValue(true);
                    vm = new ap.viewmodels.projects.ProjectIssueTypeConfigViewModel($scope, Utility, $q, Api, ControllersManager, ServicesManager, $mdDialog, $timeout);
                });
                afterEach(() => {
                    specHelper.general.offSpyProperty(ap.misc.ScreenInfo.prototype, "isEditMode", specHelper.PropertyAccessor.Get);
                });
                it("THEN vm.screenInfo.actions[0].isVisible = false", () => {
                    expect(vm.screenInfo.actions[0].isVisible).toEqual(false);
                });
            });
            describe("WHEN utility.UserContext.licenseAccess.hasAccess(projectIssueTypeConfig) = false && isEditMode = true", () => {
                beforeEach(() => {
                    specHelper.general.spyProperty(ap.misc.ScreenInfo.prototype, "isEditMode", specHelper.PropertyAccessor.Get).and.returnValue(true);
                    spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.returnValue(false);
                    vm = new ap.viewmodels.projects.ProjectIssueTypeConfigViewModel($scope, Utility, $q, Api, ControllersManager, ServicesManager, $mdDialog, $timeout);
                });
                afterEach(() => {
                    specHelper.general.offSpyProperty(ap.misc.ScreenInfo.prototype, "isEditMode", specHelper.PropertyAccessor.Get);
                });
                it("THEN vm.screenInfo.actions[0].isVisible = false", () => {
                    expect(vm.screenInfo.actions[0].isVisible).toEqual(false);
                });
            });
            describe("WHEN utility.UserContext.licenseAccess.hasAccess(projectIssueTypeConfig) = false && isEditMode = false", () => {
                beforeEach(() => {
                    spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.returnValue(false);
                    vm = new ap.viewmodels.projects.ProjectIssueTypeConfigViewModel($scope, Utility, $q, Api, ControllersManager, ServicesManager, $mdDialog, $timeout);
                });
                it("THEN vm.screenInfo.actions[0].isVisible = false", () => {
                    expect(vm.screenInfo.actions[0].isVisible).toEqual(false);
                });
            });
        });
        describe("WHEN button edit is not enabled", () => {
            describe("WHEN currentProject.UserAccessRight.CanConfig = true && isEditMode = true", () => {
                beforeEach(() => {
                    spiedCurrentProject.UserAccessRight.CanConfig = true;
                    specHelper.general.spyProperty(ap.misc.ScreenInfo.prototype, "isEditMode", specHelper.PropertyAccessor.Get).and.returnValue(true);
                    vm = new ap.viewmodels.projects.ProjectIssueTypeConfigViewModel($scope, Utility, $q, Api, ControllersManager, ServicesManager, $mdDialog, $timeout);
                });
                afterEach(() => {
                    specHelper.general.offSpyProperty(ap.misc.ScreenInfo.prototype, "isEditMode", specHelper.PropertyAccessor.Get);
                });
                it("THEN vm.screenInfo.actions[0].isEnabled = false", () => {
                    expect(vm.screenInfo.actions[0].isEnabled).toEqual(false);
                });
            });
            describe("WHEN currentProject.UserAccessRight.CanConfig = false && isEditMode = true", () => {
                beforeEach(() => {
                    specHelper.general.spyProperty(ap.misc.ScreenInfo.prototype, "isEditMode", specHelper.PropertyAccessor.Get).and.returnValue(true);
                    spiedCurrentProject.UserAccessRight.CanConfig = false;
                    vm = new ap.viewmodels.projects.ProjectIssueTypeConfigViewModel($scope, Utility, $q, Api, ControllersManager, ServicesManager, $mdDialog, $timeout);
                });
                afterEach(() => {
                    specHelper.general.offSpyProperty(ap.misc.ScreenInfo.prototype, "isEditMode", specHelper.PropertyAccessor.Get);
                });
                it("THEN vm.screenInfo.actions[0].isEnabled = false", () => {
                    expect(vm.screenInfo.actions[0].isEnabled).toEqual(false);
                });
            });
            describe("WHEN currentProject.UserAccessRight.CanConfig = false && isEditMode = false", () => {
                beforeEach(() => {
                    spiedCurrentProject.UserAccessRight.CanConfig = false;
                    vm = new ap.viewmodels.projects.ProjectIssueTypeConfigViewModel($scope, Utility, $q, Api, ControllersManager, ServicesManager, $mdDialog, $timeout);
                    specHelper.general.raiseEvent(vm.screenInfo, "actionclicked", vm.screenInfo.actions[3].name);
                });
                it("THEN vm.screenInfo.actions[0].isEnabled = false", () => {
                    expect(vm.screenInfo.actions[0].isEnabled).toEqual(false);
                });
            });
        });
    });

    describe("WHEN method actionClickedHandler is called", () => {
        let callback: jasmine.Spy;
        beforeEach(() => {
            spyOn(ServicesManager.projectService, "getProjectChapters").and.returnValue(defProjectService.promise);
            callback = jasmine.createSpy("callback");
            spiedCurrentProject.UserAccessRight.CanConfig = true;
            spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.returnValue(true);
            vm = new ap.viewmodels.projects.ProjectIssueTypeConfigViewModel($scope, Utility, $q, Api, ControllersManager, ServicesManager, $mdDialog, $timeout);
            vm.on("editmodechanged", callback, this);
        });
        describe("WHEN action is issuetype.edit", () => {
            beforeEach(() => {
                specHelper.general.raiseEvent(vm.screenInfo, "actionclicked", vm.screenInfo.actions[0].name);
            });
            it("THEN vm.screenInfo.isEditMode = true", () => {
                expect(vm.screenInfo.isEditMode).toEqual(true);
            });
            it("THEN chapterListVm.useCacheSystem = true", () => {
                expect(vm.chapterListVm.useCacheSystem).toEqual(true);
            });
            it("THEN issueTypeListVm.useCacheSystem = true", () => {
                expect(vm.issueTypeListVm.useCacheSystem).toEqual(true);
            });
            it("THEN subjectDescListVm.useCacheSystem = true", () => {
                expect(vm.subjectDescListVm.useCacheSystem).toEqual(true);
            });
            it("THEN editmodechanged has been raised", () => {
                expect(callback).toHaveBeenCalled();
            });
            it("THEN the visibility of button is changed", () => {
                expect(vm.screenInfo.actions[0].isVisible).toBeFalsy();
                expect(vm.screenInfo.actions[1].isVisible).toBeTruthy();
                expect(vm.screenInfo.actions[2].isVisible).toBeTruthy();
            });
        });
        describe("WHEN action is issuetype.save", () => {
            beforeEach(() => {
                spyOn(vm, "save");
                specHelper.general.raiseEvent(vm.screenInfo, "actionclicked", vm.screenInfo.actions[0].name);
                specHelper.general.raiseEvent(vm.screenInfo, "actionclicked", vm.screenInfo.actions[1].name);
            });
            it("THEN save method is called", () => {
                expect(vm.save).toHaveBeenCalled();
            });
        });
        describe("WHEN action is issuetype.cancel", () => {
            beforeEach(() => {
                spyOn(vm, "cancel");
                specHelper.general.raiseEvent(vm.screenInfo, "actionclicked", vm.screenInfo.actions[0].name);
                specHelper.general.raiseEvent(vm.screenInfo, "actionclicked", vm.screenInfo.actions[2].name);
            });
            it("THEN vm.screenInfo.isEditMode = false", () => {
                expect(vm.cancel).toHaveBeenCalled();
            });
        });
        describe("WHEN action is import.excel", () => {
            beforeEach(() => {
                specHelper.general.raiseEvent(vm.screenInfo, "actionclicked", vm.screenInfo.actions[3].subActions[0].name);
            });
            it("THEN importExcel handler called AND $mdDialog is show", () => {
                expect($mdDialog.show).toHaveBeenCalled();
            });
        });
    });

    describe("WHEN save method is called", () => {
        let callback: jasmine.Spy;
        let def: angular.IDeferred<any>;
        let dic: Dictionary<string, string[]>;

        beforeEach(() => {
            spyOn(ServicesManager.projectService, "getProjectChapters").and.returnValue(defProjectService.promise);
            vm = new ap.viewmodels.projects.ProjectIssueTypeConfigViewModel($scope, Utility, $q, Api, ControllersManager, ServicesManager, $mdDialog, $timeout);
            callback = jasmine.createSpy("callback");
            vm.on("editmodechanged", callback, vm);
            spyOn(vm.chapterListVm, "specifyIds");

            let chap1: ap.models.projects.Chapter = new ap.models.projects.Chapter(Utility);
            let chap2: ap.models.projects.Chapter = new ap.models.projects.Chapter(Utility);
            chap2.createByJson({ Code: "a", Id: "2" });
            let chap3: ap.models.projects.Chapter = new ap.models.projects.Chapter(Utility);

            let issueType1: ap.models.projects.IssueType = new ap.models.projects.IssueType(Utility);
            issueType1.ParentChapter = chap1;
            let issueType2: ap.models.projects.IssueType = new ap.models.projects.IssueType(Utility);
            issueType2.createByJson({ Code: "a", ParentChapter: chap3, Id: "3" });

            let noteSubject1: ap.models.projects.IssueTypeNoteSubject = new ap.models.projects.IssueTypeNoteSubject(Utility);
            let noteSubject2: ap.models.projects.IssueTypeNoteSubject = new ap.models.projects.IssueTypeNoteSubject(Utility);
            noteSubject2.createByJson({ Code: "a", Id: "13" });

            let projectPunchlistsChapter: ap.models.custom.ProjectPunchlists = new ap.models.custom.ProjectPunchlists(Utility, "1", [chap1, chap2], [], [], ["2"]);
            let projectPunchlistsIssueType: ap.models.custom.ProjectPunchlists = new ap.models.custom.ProjectPunchlists(Utility, "1", [], [issueType1, issueType2], [], [], ["3"]);
            let projectPunchlistsNoteSubject: ap.models.custom.ProjectPunchlists = new ap.models.custom.ProjectPunchlists(Utility, "1", [], [], [noteSubject1, noteSubject2], [], [], ["4"]);
            let resultPunchList: ap.models.custom.ProjectPunchlists = new ap.models.custom.ProjectPunchlists(Utility, "1", [chap1, chap2], [issueType1, issueType2], [noteSubject1, noteSubject2], ["2"], ["3"], ["4"]);

            spyOn(vm.chapterListVm, "postChange").and.returnValue(projectPunchlistsChapter);
            spyOn(vm.issueTypeListVm, "postChange").and.returnValue(projectPunchlistsIssueType);
            spyOn(vm.subjectDescListVm, "postChange").and.returnValue(projectPunchlistsNoteSubject);
            spyOn(vm.chapterListVm, "clearInfo");
            spyOn(vm.issueTypeListVm, "clearInfo");
            spyOn(vm.subjectDescListVm, "clearInfo");

            def = $q.defer();
            spyOn(Api, "getApiResponse").and.returnValue(def.promise);
            vm.loadIdsData();

            dic = new Dictionary<string, string[]>();
            dic.add(chap1.Id, [issueType1.Id]);
            let chapVm: ap.viewmodels.projects.ChapterViewModel = new ap.viewmodels.projects.ChapterViewModel(Utility);
            chapterVm.init(chap2);
            specHelper.general.raiseEvent(vm.chapterListVm, "iteminserted", new ap.viewmodels.ItemInsertedEvent(0, <ap.viewmodels.IEntityViewModel>chapterVm));
            chapterVm.init(chap3);
            specHelper.general.raiseEvent(vm.chapterListVm, "iteminserted", new ap.viewmodels.ItemInsertedEvent(0, <ap.viewmodels.IEntityViewModel>chapterVm));
            defResponse = $q.defer();

            spyOn(ControllersManager.projectController, "updateProjectPunchList").and.returnValue(defResponse.promise);
            spyOn(ControllersManager.mainController, "showConfirm").and.callFake(function (message, title, callback) {
                callback(ap.controllers.MessageResult.Positive);
            });
            spyOn(chapterVm, "postChanges");
            spyOn(vm.chapterListVm, "getEntityById").and.callFake((id: string) => {
                return chapterVm;
            });
            spyOn(issueTypeVm, "postChanges");
            spyOn(vm.issueTypeListVm, "getEntityById").and.callFake((id: string) => {
                return issueTypeVm;
            });
            let noteSubjectVm: ap.viewmodels.projects.IssueTypeNoteSubjectViewModel = new ap.viewmodels.projects.IssueTypeNoteSubjectViewModel(Utility);
            spyOn(noteSubjectVm, "postChanges");
            spyOn(vm.subjectDescListVm, "getEntityById").and.callFake((id: string) => {
                return noteSubjectVm;
            });

            spyOn(vm, "loadIdsData");

            spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake((moduleCode: string) => {
                if (moduleCode === "PROJECT_ISSUE_TYPE_CONFIG") {
                    return true;
                }
            });

            vm.save();
            defResponse.resolve(resultPunchList);
            $rootScope.$apply();
        });
        it("THEN vm.screenInfo.isEditMode = false", () => {
            expect(vm.screenInfo.isEditMode).toBeFalsy();
        });
        it("THEN chapterListVm.useCacheSystem = false", () => {
            expect(vm.chapterListVm.useCacheSystem).toBeFalsy();
        });
        it("THEN issueTypeListVm.useCacheSystem = false", () => {
            expect(vm.issueTypeListVm.useCacheSystem).toBeFalsy();
        });
        it("THEN subjectDescListVm.useCacheSystem = false", () => {
            expect(vm.subjectDescListVm.useCacheSystem).toBeFalsy();
        });
        it("THEN editmodechanged has been raised", () => {
            expect(callback).toHaveBeenCalled();
        });
        it("THEN load is called", () => {
            expect(vm.loadIdsData).toHaveBeenCalled();
        });
        it("THEN selectedVm = null", () => {
            expect(vm.chapterListVm.selectedViewModel).toEqual(null);
            expect(vm.issueTypeListVm.selectedViewModel).toEqual(null);
            expect(vm.subjectDescListVm.selectedViewModel).toEqual(null);
        });
        it("THEN, the actions buttons are updated", () => {
            expect(vm.screenInfo.actions[0].isVisible).toBeTruthy();
            expect(vm.screenInfo.actions[0].isEnabled).toBeTruthy();
            expect(vm.screenInfo.actions[1].isVisible).toBeFalsy();
            expect(vm.screenInfo.actions[1].isEnabled).toBeFalsy();
            expect(vm.screenInfo.actions[2].isVisible).toBeFalsy();
            expect(vm.screenInfo.actions[2].isEnabled).toBeFalsy();
        });
        it("THEN, clearInfo has been called for all lists", () => {
            expect(vm.chapterListVm.clearInfo).toHaveBeenCalled();
            expect(vm.issueTypeListVm.clearInfo).toHaveBeenCalled();
            expect(vm.subjectDescListVm.clearInfo).toHaveBeenCalled();
        });
    });

    describe("WHEN listPropertyChangedHandler is called", () => {
        let deferredLoadChapters: angular.IDeferred<any>;
        let apiSpy: jasmine.Spy;
        let issueTypeListVm: IssueTypeListV;

        beforeEach(() => {
            vm = new ap.viewmodels.projects.ProjectIssueTypeConfigViewModel($scope, Utility, $q, Api, ControllersManager, ServicesManager, $mdDialog, $timeout);
            spyOn((<IssueTypeListV>vm.issueTypeListVm), "afterLoadPageSuccessHandler");
            spyOn((<ChapterListV>vm.chapterListVm), "afterLoadPageSuccessHandler");
            defResponse = $q.defer();
            deferDataChapter = $q.defer();
            deferDataIssueType = $q.defer();

            deferredLoadChapters = $q.defer();
            spyOn(ServicesManager.projectService, "getProjectChapters").and.returnValue(deferredLoadChapters.promise);
            let chapterCode = [{ Id: id1, Code: "Code 0", Description: "Description 0" },
            { Id: id2, Code: "Code 0", Description: "Description 0" },
            { Id: id3, Code: "Code 1", Description: "Description 1" },
            { Id: id4, Code: "Code 1", Description: "Description 1" },
            { Id: id5, Code: "Code 2", Description: "Description 2" },
            { Id: id6, Code: "Code 2", Description: "Description 2" },
            { Id: id7, Code: "Code 3", Description: "Description 3" }];

            currentProj = ControllersManager.mainController.currentProject();

            options = new ap.services.apiHelper.ApiOption();
            options.customParams.push(new ap.services.apiHelper.ApiCustomParam("projectId", currentProj.Id));
            options.customParams.push(new ap.services.apiHelper.ApiCustomParam("baseentityname", "chapter"));
            spyOn(Api, "getApiResponse").and.callFake((url: string) => {
                if (url === "rest/chapterhierarchiesids") {
                    return defResponse.promise;
                }
            });

            vm.loadIdsData();

            deferredLoadChapters.resolve(chapterCode);
            defResponse.resolve(new ap.services.apiHelper.ApiResponse(tab));
            $rootScope.$apply();

            apiSpy = spyOn(Api, "getEntityList").and.callFake((entityName: string, filter?: string, pathToLoad?: string, sortOrder?: string, ids?: string[]) => {
                if (entityName === "Chapter") return deferDataChapter.promise;
                if (entityName === "IssueType") return deferDataIssueType.promise;

            });
            vm.chapterListVm.loadNextPage();
            deferDataChapter.resolve(new ap.services.apiHelper.ApiResponse(apiDataChapter));
            deferDataIssueType.resolve(new ap.services.apiHelper.ApiResponse(apiDataIssueType));
            $rootScope.$apply();
            spyOn(vm.subjectDescListVm, "clear");
            vm.chapterListVm.selectedViewModel = chapterVm;
        });
        describe("AND lists is valid", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.viewmodels.projects.IssueTypeListViewModel
                    .prototype, "isValid", specHelper.PropertyAccessor.Get).and.returnValue(true);
                spyOn(vm.chapterListVm, "isValid").and.returnValue(true);
                spyOn(vm.chapterListVm, "updateItemsActionsState");
                spyOn(vm.issueTypeListVm, "updateItemsActionsState");
                specHelper.general.raiseEvent(vm.chapterListVm, "propertychanged", new ap.viewmodels.base.PropertyChangedEventArgs("isValid", "123", vm.chapterListVm));
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.projects.IssueTypeListViewModel
                    .prototype, "isValid", specHelper.PropertyAccessor.Get);
            });
            it("THEN call updateItemsActionsState with true in all list", () => {
                expect(vm.issueTypeListVm.updateItemsActionsState).toHaveBeenCalledWith(true);
                expect(vm.chapterListVm.updateItemsActionsState).toHaveBeenCalledWith(true);
            });
        });
        describe("AND lists is not valid", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.viewmodels.projects.IssueTypeListViewModel
                    .prototype, "isValid", specHelper.PropertyAccessor.Get).and.returnValue(false);
                spyOn(vm.chapterListVm, "isValid").and.returnValue(false);
                spyOn(vm.chapterListVm, "updateItemsActionsState");
                spyOn(vm.issueTypeListVm, "updateItemsActionsState");
                specHelper.general.raiseEvent(vm.chapterListVm, "propertychanged", new ap.viewmodels.base.PropertyChangedEventArgs("isValid", "123", vm.chapterListVm));
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.projects.IssueTypeListViewModel
                    .prototype, "isValid", specHelper.PropertyAccessor.Get);
            });
            it("THEN call updateItemsActionsState with false in all list", () => {
                expect(vm.issueTypeListVm.updateItemsActionsState).toHaveBeenCalledWith(false);
                expect(vm.chapterListVm.updateItemsActionsState).toHaveBeenCalledWith(false);
            });
        });
    });

    describe("Feature: Cancel", () => {

        let callback: jasmine.Spy;
        let vm: ap.viewmodels.projects.ProjectIssueTypeConfigViewModel;

        beforeEach(() => {
            spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake((moduleCode: string) => {
                if (moduleCode === "PROJECT_ISSUE_TYPE_CONFIG") {
                    return true;
                }
            });

            vm = new ap.viewmodels.projects.ProjectIssueTypeConfigViewModel($scope, Utility, $q, Api, ControllersManager, ServicesManager, $mdDialog, $timeout);
            callback = jasmine.createSpy("callback");
            vm.on("editmodechanged", callback, vm);
            spyOn(vm.chapterListVm, "specifyIds");
            let defResponse: angular.IDeferred<any> = $q.defer();
            spyOn(Api, "getApiResponse").and.returnValue(defResponse.promise);

            vm.loadIdsData();

            let chapterVm: ap.viewmodels.projects.ChapterViewModel = new ap.viewmodels.projects.ChapterViewModel(Utility);
            chapterVm.init(new ap.models.projects.Chapter(Utility));
            let issueTypeVm: ap.viewmodels.projects.IssueTypeViewModel = new ap.viewmodels.projects.IssueTypeViewModel(Utility);
            issueTypeVm.init(new ap.models.projects.IssueType(Utility));
            let id1: string = chapterVm.originalEntity.Id;
            let id2: string = issueTypeVm.originalEntity.Id;
            let tab: string[] = [id1 + "0", id2 + "1", ap.utility.UtilityHelper.createGuid() + "1", ap.utility.UtilityHelper.createGuid() + "0", ap.utility.UtilityHelper.createGuid() + "1",
            ap.utility.UtilityHelper.createGuid() + "0", ap.utility.UtilityHelper.createGuid() + "1"];

            defResponse.resolve(new ap.services.apiHelper.ApiResponse(tab));
            $rootScope.$apply();

            spyOn(vm.chapterListVm, "cancel");
            spyOn(vm.issueTypeListVm, "cancel");
            spyOn(vm.subjectDescListVm, "cancel");
            vm.cancel();
        });

        describe("WHEN cancel method is called", () => {
            it("THEN vm.screenInfo.isEditMode = false", () => {
                expect(vm.screenInfo.isEditMode).toEqual(false);
            });
            it("THEN chapterListVm.useCacheSystem = false", () => {
                expect(vm.chapterListVm.useCacheSystem).toEqual(false);
            });
            it("THEN issueTypeListVm.useCacheSystem = false", () => {
                expect(vm.issueTypeListVm.useCacheSystem).toEqual(false);
            });
            it("THEN subjectDescListVm.useCacheSystem = false", () => {
                expect(vm.subjectDescListVm.useCacheSystem).toEqual(false);
            });
            it("THEN editmodechanged has been raised", () => {
                expect(callback).toHaveBeenCalled();
            });
            it("THEN vm.chapterListVm.specifyIds has been called", () => {
                expect(vm.chapterListVm.specifyIds).toHaveBeenCalled();
            });
            it("THEN, chapterListVm.cancel is called", () => {
                expect(vm.chapterListVm.cancel).toHaveBeenCalled();
            });
            it("THEN, issueTypeListVm.cancel is called", () => {
                expect(vm.issueTypeListVm.cancel).toHaveBeenCalled();
            });
            it("THEN, subjectDescListVm.cancel is called", () => {
                expect(vm.subjectDescListVm.cancel).toHaveBeenCalled();
            });
        });
    });

    describe("WHEN has changed event is called", () => {

        let vm: ap.viewmodels.projects.ProjectIssueTypeConfigViewModel;

        beforeEach(() => {
            spyOn(ServicesManager.projectService, "getProjectChapters").and.returnValue(defProjectService.promise);
            spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake((moduleCode: string) => {
                if (moduleCode === "PROJECT_ISSUE_TYPE_CONFIG") {
                    return true;
                }
            });

            vm = new ap.viewmodels.projects.ProjectIssueTypeConfigViewModel($scope, Utility, $q, Api, ControllersManager, ServicesManager, $mdDialog, $timeout);
            specHelper.general.raiseEvent(vm.screenInfo, "actionclicked", "issuetype.edit");
        });
        describe("WHEN no elements of the list are changed", () => {
            beforeEach(() => {
                spyOn(vm.chapterListVm, "getChangedItems").and.returnValue([]);
                spyOn(vm.issueTypeListVm, "getChangedItems").and.returnValue([]);
                spyOn(vm.subjectDescListVm, "getChangedItems").and.returnValue([]);
            });
            it("THEN saveAction.isEnabled = false", () => {
                expect(vm.screenInfo.actions[1].isEnabled).toBeFalsy();
                expect(vm.screenInfo.actions[1].isVisible).toBeTruthy();
            });
        });
        describe("WHEN elements are not valid", () => {
            beforeEach(() => {
                let chap = new ap.viewmodels.projects.ChapterViewModel(Utility);
                chap.code = "";
                spyOn(vm.issueTypeListVm, "getChangedItems").and.returnValue([]);
                spyOn(vm.chapterListVm, "getChangedItems").and.returnValue([chap]);
                spyOn(vm.subjectDescListVm, "getChangedItems").and.returnValue([]);
            });
            it("THEN saveAction.isEnabled = false", () => {
                expect(vm.screenInfo.actions[1].isEnabled).toBeFalsy();
                expect(vm.screenInfo.actions[1].isVisible).toBeTruthy();
            });
        });
        describe("WHEN an element of the list is changed", () => {
            describe("WHEN it's a chapter", () => {
                beforeEach(() => {
                    spyOn(vm.chapterListVm, "getChangedItems").and.returnValue([new ap.viewmodels.projects.ChapterViewModel(Utility)]);
                    spyOn(vm.issueTypeListVm, "getChangedItems").and.returnValue([]);
                    spyOn(vm.subjectDescListVm, "getChangedItems").and.returnValue([]);

                    specHelper.general.raiseEvent(vm.chapterListVm, "hasChanged", null);
                });
                it("THEN saveAction.isEnabled = false", () => {
                    expect(vm.screenInfo.actions[1].isEnabled).toBeTruthy();
                    expect(vm.screenInfo.actions[1].isVisible).toBeTruthy();
                });
            });
            describe("WHEN it's an issuetype", () => {
                beforeEach(() => {
                    spyOn(vm.chapterListVm, "getChangedItems").and.returnValue([]);
                    spyOn(vm.issueTypeListVm, "getChangedItems").and.returnValue([new ap.viewmodels.projects.IssueTypeViewModel(Utility)]);
                    spyOn(vm.subjectDescListVm, "getChangedItems").and.returnValue([]);

                    specHelper.general.raiseEvent(vm.issueTypeListVm, "hasChanged", null);
                });
                it("THEN saveAction.isEnabled = false", () => {
                    expect(vm.screenInfo.actions[1].isEnabled).toBeTruthy();
                    expect(vm.screenInfo.actions[1].isVisible).toBeTruthy();
                });
            });
            describe("WHEN it's an issuetypenotesubject", () => {
                beforeEach(() => {
                    spyOn(vm.chapterListVm, "getChangedItems").and.returnValue([]);
                    spyOn(vm.issueTypeListVm, "getChangedItems").and.returnValue([]);
                    spyOn(vm.subjectDescListVm, "getChangedItems").and.returnValue([new ap.viewmodels.projects.IssueTypeNoteSubjectViewModel(Utility)]);

                    specHelper.general.raiseEvent(vm.subjectDescListVm, "hasChanged", null);
                });
                it("THEN saveAction.isEnabled = false", () => {
                    expect(vm.screenInfo.actions[1].isEnabled).toBeTruthy();
                    expect(vm.screenInfo.actions[1].isVisible).toBeTruthy();
                });
            });
        });
        describe("WHEN an element of each list has changed", () => {
            beforeEach(() => {
                spyOn(vm.chapterListVm, "getChangedItems").and.returnValue([new ap.viewmodels.projects.ChapterViewModel(Utility)]);
                spyOn(vm.issueTypeListVm, "getChangedItems").and.returnValue([new ap.viewmodels.projects.IssueTypeViewModel(Utility)]);
                spyOn(vm.subjectDescListVm, "getChangedItems").and.returnValue([new ap.viewmodels.projects.IssueTypeNoteSubjectViewModel(Utility)]);
                specHelper.general.raiseEvent(vm.chapterListVm, "hasChanged", null);
            });
            it("THEN saveAction.isEnabled = false", () => {
                expect(vm.screenInfo.actions[1].isEnabled).toBeTruthy();
                expect(vm.screenInfo.actions[1].isVisible).toBeTruthy();
            });
        });
    });

    describe("Feature: dipose", () => {

        let vm: ap.viewmodels.projects.ProjectIssueTypeConfigViewModel;

        beforeEach(() => {
            spyOn(ServicesManager.projectService, "getProjectChapters").and.returnValue(defProjectService.promise);
            spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.callFake((moduleCode: string) => {
                if (moduleCode === "PROJECT_ISSUE_TYPE_CONFIG") {
                    return true;
                }
            });

            vm = new ap.viewmodels.projects.ProjectIssueTypeConfigViewModel($scope, Utility, $q, Api, ControllersManager, ServicesManager, $mdDialog, $timeout);

            spyOn(vm.chapterListVm, "dispose");
            spyOn(vm.issueTypeListVm, "dispose");
            spyOn(vm.subjectDescListVm, "dispose");

            vm.dispose();
        });

        describe("WHEN dispose is called", () => {
            it("THEN, chapterListVm.dispose is called", () => {
                expect(vm.chapterListVm.dispose).toHaveBeenCalled();
            });

            it("THEN, issueTypeListVm.dispose is called", () => {
                expect(vm.issueTypeListVm.dispose).toHaveBeenCalled();
            });

            it("THEN, subjectDescListVm.dispose is called", () => {
                expect(vm.subjectDescListVm.dispose).toHaveBeenCalled();
            });
        });
    });

    describe("Feature: importProject", () => {
        let viewmodel: ap.viewmodels.projects.ProjectIssueTypeConfigViewModel;
        let def: any;
        beforeEach(() => {
            def = $q.defer();
            viewmodel = new ap.viewmodels.projects.ProjectIssueTypeConfigViewModel($scope, Utility, $q, Api, ControllersManager, ServicesManager, $mdDialog, $timeout);
            spyOn(MainController, "showBusy");
            specHelper.general.raiseEvent(viewmodel.screenInfo, "actionclicked", "import.project");
            def.resolve();
            $rootScope.$apply();
        });
        it("THEN, showBusy is called", () => {
            expect(MainController.showBusy).toHaveBeenCalled();
        });
        it("THEN, mdDialog.show is called", () => {
            expect($mdDialog.show).toHaveBeenCalled();
        });
    });

    describe("Feature:  importExcelData", () => {
        describe("WHEN, import dialog is resolved", () => {
            let viewmodel: ap.viewmodels.projects.ProjectIssueTypeConfigViewModel;
            let chapters: ap.models.projects.Chapter[];
            let chapter: ap.models.projects.Chapter;
            let issueTypes: ap.models.projects.IssueType[];
            let issueType: ap.models.projects.IssueType;
            let noteSubjects: ap.models.projects.IssueTypeNoteSubject[];
            let noteSubject: ap.models.projects.IssueTypeNoteSubject;
            let importExcelIssueTypeViewModel: ap.viewmodels.projects.ImportExcelIssueTypeViewModel;
            let insertItemSpy: jasmine.Spy;
            let addInfoCacheIssueTypesSpy: jasmine.Spy;
            let addInfoCacheSubjectsSpy: jasmine.Spy;

            function getActionByName(actionName: string): ap.viewmodels.home.ActionViewModel {
                if (!viewmodel || !viewmodel.screenInfo || !viewmodel.screenInfo.actions) {
                    return null;
                }

                let actions = viewmodel.screenInfo.actions;
                for (let i = 0, len = actions.length; i < len; i++) {
                    if (actions[i].name === actionName) {
                        return actions[i];
                    }
                }

                return null;
            }


            beforeEach(() => {

                function getTestChapter(code: string, description: string): ap.models.projects.Chapter {
                    let chapter = new ap.models.projects.Chapter(Utility);
                    chapter.Code = code;
                    chapter.Description = description;
                    chapter.IssueTypes = [];
                    return chapter;
                }

                function getTestIssueType(code: string, description: string): ap.models.projects.IssueType {
                    let issueType = new ap.models.projects.IssueType(Utility);
                    issueType.Code = code;
                    issueType.Description = description;
                    issueType.NoteSubjects = [];
                    return issueType;
                }

                function getTestNoteSubject(subject: string, description: string): ap.models.projects.IssueTypeNoteSubject {
                    let noteSubject = new ap.models.projects.IssueTypeNoteSubject(Utility);
                    noteSubject.Subject = subject;
                    noteSubject.DefaultDescription = description;
                    return noteSubject;
                }

                viewmodel = new ap.viewmodels.projects.ProjectIssueTypeConfigViewModel($scope, Utility, $q, Api, ControllersManager, ServicesManager, $mdDialog, $timeout);
                viewmodel.chapterListVm.specifyIds([]);

                noteSubjects = [];
                issueTypes = [];
                chapters = [];

                chapter = getTestChapter("CAT1", "Category description");
                issueType = getTestIssueType("SCAT1", "Subcategory description");
                noteSubject = getTestNoteSubject("Note", "Default description");

                issueType.NoteSubjects.push(noteSubject);
                chapter.IssueTypes.push(issueType);

                noteSubjects.push(noteSubject);
                issueTypes.push(issueType);
                chapters.push(chapter);

                specHelper.general.spyProperty(ap.viewmodels.projects.ImportExcelViewModel.prototype, "importedData", specHelper.PropertyAccessor.Get).and.returnValue(chapters);

                addInfoCacheIssueTypesSpy = spyOn(viewmodel.issueTypeListVm, "addIntoCache").and.callThrough();
                addInfoCacheSubjectsSpy = spyOn(viewmodel.subjectDescListVm, "addIntoCache").and.callThrough();
                insertItemSpy = spyOn(viewmodel.chapterListVm, "insertItem");

                specHelper.general.raiseEvent(viewmodel.screenInfo, "actionclicked", viewmodel.screenInfo.actions[3].subActions[0].name);
                (<any>$mdDialog["deferred"]).resolve();
                $rootScope.$apply();
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.projects.ImportExcelViewModel.prototype, "importedData", specHelper.PropertyAccessor.Get);
            });
            it("THEN, go to edit mode", () => {
                expect(viewmodel.screenInfo.isEditMode).toBeTruthy();
            });
            it("THEN, check Chapter viewmodels must be created", () => {
                let vmAdded = (<ap.viewmodels.projects.ChapterViewModel>insertItemSpy.calls.all()[0].args[1]);
                expect(insertItemSpy).toHaveBeenCalled();
                expect(insertItemSpy.calls.count()).toEqual(1);
                expect(vmAdded.originalEntity.Id).toEqual(chapters[0].Id);
                expect(vmAdded.chapter.IssueTypes).toBeNull();
            });
            it("THEN, check IssueType viewmodels must be created", () => {
                let vmAdded = (<ap.viewmodels.projects.IssueTypeViewModel>addInfoCacheIssueTypesSpy.calls.all()[0].args[0]);
                expect(addInfoCacheIssueTypesSpy).toHaveBeenCalled();
                expect(addInfoCacheIssueTypesSpy.calls.count()).toEqual(1);
                expect(vmAdded.originalEntity.Id).toEqual(issueTypes[0].Id);
                expect(vmAdded.issueType.NoteSubjects).toBeNull();
            });
            it("THEN, check NoteSubjet viewmodels must be created", () => {
                expect(addInfoCacheSubjectsSpy).toHaveBeenCalled();
                expect(addInfoCacheSubjectsSpy.calls.count()).toEqual(1);
                expect((<Dictionary<string, ap.viewmodels.projects.IssueTypeNoteSubjectViewModel[]>>addInfoCacheSubjectsSpy.calls.all()[0].args[0]).getValue(issueType.Id)[0].originalEntity.Id).toEqual(noteSubjects[0].Id);
            });
            it("THEN, the 'Edit' action button is hidden", () => {
                let editAction = getActionByName("issuetype.edit");
                expect(editAction.isVisible).toBeFalsy();
            });
            it("THEN, the 'Save' action button is visible", () => {
                let saveAction = getActionByName("issuetype.save");
                expect(saveAction.isVisible).toBeTruthy();
            });
            it("THEN, the 'Save' action button is enabled", () => {
                let saveAction = getActionByName("issuetype.save");
                expect(saveAction.isEnabled).toBeTruthy();
            });
            it("THEN, the 'Cancel' action button is visible", () => {
                let cancelAction = getActionByName("issuetype.cancel");
                expect(cancelAction.isVisible).toBeTruthy();
            });
            it("THEN, the 'Cancel' action button is enabled", () => {
                let cancelAction = getActionByName("issuetype.cancel");
                expect(cancelAction.isEnabled).toBeTruthy();
            });
        });
    });
});