describe("Module ap-viewmodels - projects - ImportProjectIssueTypeViewModel", () => {
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
    }));

    beforeEach(() => {
        specHelper.userContext.stub(Utility);
        defProjectService = $q.defer();
    });

    let vm: ap.viewmodels.projects.ImportProjectIssueTypeViewModel;
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
        apiDataChapter = [
            {
                Id: id1,
                Code: "Code 0",
                Description: "Desc0",
                issueTypes: [apiDataIssueType[0], apiDataIssueType[1]]
            },
            {
                Id: id4,
                Code: "Code 1",
                Description: "Desc1",
                issueTypes: [apiDataIssueType[2]]
            },
            {
                Id: id6,
                Code: "Code 2",
                Description: "Desc2",
                issueTypes: [apiDataIssueType[3]]
            }
        ];
        defProject = $q.defer();
        spyOn(Api, "getEntityIds").and.callFake((entityName: string) => {
            if (entityName === "Project") {
                return defProject.promise;
            }
        });
        specHelper.general.spyProperty(ap.viewmodels.projects.ProjectSelectorViewModel.prototype, "selectedProjectId", specHelper.PropertyAccessor.Get).and.returnValue("1");
    });
    afterEach(() => {
        specHelper.general.offSpyProperty(ap.viewmodels.projects.ProjectSelectorViewModel.prototype, "selectedProjectId", specHelper.PropertyAccessor.Get);
    });

    describe("WHEN the constructor is called", () => {
        let def: any;
        beforeEach(() => {
            def = $q.defer();
            vm = new ap.viewmodels.projects.ImportProjectIssueTypeViewModel(Utility, $q, Api, ControllersManager, ServicesManager, $mdDialog, $timeout);
            def.resolve();
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
        it("THEN .projectSelector.load is called", () => {
            expect(Api.getEntityIds).toHaveBeenCalled();
        });
    });
    describe("WHEN the method loadIdsData is called", () => {
        let deferredLoadChapters: angular.IDeferred<any>;
        beforeEach(() => {
            vm = new ap.viewmodels.projects.ImportProjectIssueTypeViewModel(Utility, $q, Api, ControllersManager, ServicesManager, $mdDialog, $timeout);

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

            options = new ap.services.apiHelper.ApiOption();
            options.customParams.push(new ap.services.apiHelper.ApiCustomParam("projectId", "1"));
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
    });
    describe("WHEN the method handlerSelectedChapterChanged is called", () => {
        let deferredLoadChapters: angular.IDeferred<any>;
        let apiSpy: jasmine.Spy;
        let issueTypeListVm: IssueTypeListV;
        beforeEach(() => {
            deferredLoadChapters = $q.defer();
            spyOn(ServicesManager.projectService, "getProjectChapters").and.returnValue(deferredLoadChapters.promise);
            vm = new ap.viewmodels.projects.ImportProjectIssueTypeViewModel(Utility, $q, Api, ControllersManager, ServicesManager, $mdDialog, $timeout);
            spyOn((<IssueTypeListV>vm.issueTypeListVm), "afterLoadPageSuccessHandler");
            spyOn((<ChapterListV>vm.chapterListVm), "afterLoadPageSuccessHandler");
            // spyOn(vm, "chapterIsChecked");
            
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

            options = new ap.services.apiHelper.ApiOption();
            options.customParams.push(new ap.services.apiHelper.ApiCustomParam("projectId", "1"));
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
        let defGet: angular.IDeferred<any>;
        beforeEach(() => {
            deferredLoadChapters = $q.defer();
            defGet = $q.defer();
            spyOn(ServicesManager.projectService, "getProjectChapters").and.returnValue(deferredLoadChapters.promise);
            vm = new ap.viewmodels.projects.ImportProjectIssueTypeViewModel(Utility, $q, Api, ControllersManager, ServicesManager, $mdDialog, $timeout);
            spyOn((<IssueTypeListV>vm.issueTypeListVm), "afterLoadPageSuccessHandler");
            spyOn((<ChapterListV>vm.chapterListVm), "afterLoadPageSuccessHandler");
            // spyOn(vm, "issueTypeIsChecked");
            defResponse = $q.defer();
            deferDataChapter = $q.defer();
            deferDataIssueType = $q.defer();
            spyOn(vm.subjectDescListVm, "load").and.returnValue(defGet.promise);
            defGet.resolve();
            let chapterCode = [{ Id: id1, Code: "Code 0", Description: "Description 0" },
                { Id: id2, Code: "Code 0", Description: "Description 0" },
                { Id: id3, Code: "Code 1", Description: "Description 1" },
                { Id: id4, Code: "Code 1", Description: "Description 1" },
                { Id: id5, Code: "Code 2", Description: "Description 2" },
                { Id: id6, Code: "Code 2", Description: "Description 2" },
                { Id: id7, Code: "Code 3", Description: "Description 3" }];

            options = new ap.services.apiHelper.ApiOption();
            options.customParams.push(new ap.services.apiHelper.ApiCustomParam("projectId", "1"));
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
            
            vm.issueTypeListVm.selectedViewModel = issueTypeVm;
        });
        it("THEN subjectDescListVm.issueTypeId is init", () => {
            expect(vm.subjectDescListVm.issueTypeId).toEqual(id2);
        });
    });

    describe("Feature: Import", () => {
        let chapterList: ap.viewmodels.projects.ChapterListViewModel;
        let chapter: ap.viewmodels.projects.ChapterViewModel;
        let chapter2: ap.viewmodels.projects.ChapterViewModel;
        let chap: ap.models.projects.Chapter;
        let chap2: ap.models.projects.Chapter
        let issueTypeList: ap.viewmodels.projects.IssueTypeListViewModel;
        let issueType1: ap.viewmodels.projects.IssueTypeViewModel;
        let issueType2: ap.viewmodels.projects.IssueTypeViewModel;
        let issueType3: ap.viewmodels.projects.IssueTypeViewModel;
        let subjectList: ap.viewmodels.projects.IssueTypeNoteSubjectListViewModel;
        let subject1: ap.viewmodels.projects.IssueTypeNoteSubjectViewModel;
        let subject2: ap.viewmodels.projects.IssueTypeNoteSubjectViewModel;
        let defGet: angular.IDeferred<any>;
        let selectedCategorie: number;
        let issu: ap.models.projects.IssueType;
        let issu2: ap.models.projects.IssueType;
        let sub: ap.models.projects.IssueTypeNoteSubject;
        let sub2: ap.models.projects.IssueTypeNoteSubject;
        let issu3: ap.models.projects.IssueType;

        beforeEach(() => {
            chap = new ap.models.projects.Chapter(Utility, "CodeChap1", "DescriptionChap1");
            chap2 = new ap.models.projects.Chapter(Utility, "CodeChap2", "DescriptionChap2");
            chapter = new ap.viewmodels.projects.ChapterViewModel(Utility);
            chapter2 = new ap.viewmodels.projects.ChapterViewModel(Utility);
            chapter.init(chap);
            chapter2.init(chap2);
            chapterList = new ap.viewmodels.projects.ChapterListViewModel(Utility, $q, ControllersManager, ServicesManager.projectService);
            chapterList.onLoadItems([chapter, chapter2]);
            chapter2.isChecked = true;
            chapter.isChecked = true;
            issu = new ap.models.projects.IssueType(Utility, "CodeIssueType1", "DescriptionIssueType1");
            issu.ParentChapter = chap;
            issu2 = new ap.models.projects.IssueType(Utility, "CodeIssueType2", "DescriptionIssueType2");
            issu2.ParentChapter = chap;
            issu3 = new ap.models.projects.IssueType(Utility, "CodeIssueType3", "DescriptionIssueType3");
            issu3.ParentChapter = chap2;
            issueType1 = new ap.viewmodels.projects.IssueTypeViewModel(Utility);
            issueType1.init(issu);
            issueType1.buildProperty();
            issueType2 = new ap.viewmodels.projects.IssueTypeViewModel(Utility);
            issueType2.init(issu2);
            issueType2.buildProperty();
            issueType3 = new ap.viewmodels.projects.IssueTypeViewModel(Utility);
            issueType3.init(issu3);
            issueType3.isChecked = true;
            issueType3.buildProperty();
            sub = new ap.models.projects.IssueTypeNoteSubject(Utility, "subject1", "default description 1");
            sub.IssueType = issu;
            sub2 = new ap.models.projects.IssueTypeNoteSubject(Utility, "subject2", "default description 2");
            sub2.IssueType = issu;
            subject1 = new ap.viewmodels.projects.IssueTypeNoteSubjectViewModel(Utility);
            subject1.init(sub);
            subject2 = new ap.viewmodels.projects.IssueTypeNoteSubjectViewModel(Utility);
            subject2.init(sub2);
            vm = new ap.viewmodels.projects.ImportProjectIssueTypeViewModel(Utility, $q, Api, ControllersManager, ServicesManager, $mdDialog, $timeout);
            specHelper.general.spyProperty(ap.viewmodels.projects.ImportProjectIssueTypeViewModel.prototype, "chapterListVm", specHelper.PropertyAccessor.Get).and.returnValue(chapterList);
            vm.subjectDescListVm.checkedItemsDict.add(issu.Id, [sub, sub2]);
            vm.issueTypeListVm.checkedItemsDict.add(chap.Id, [issu, issu2]);
            vm.issueTypeListVm.checkedItemsDict.add(chap2.Id, [issu3]);
            spyOn(vm.chapterListVm, "getEntityById").and.callFake((id: string) => {
                if (id === chapter.originalEntity.Id) { return chapter; }
                if (id === chapter2.originalEntity.Id) { return chapter2; }
            });

            defGet = $q.defer();

            specHelper.general.spyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "isLoaded", specHelper.PropertyAccessor.Get).and.returnValue(true);
            specHelper.general.spyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Set);
        });

        afterEach(() => {
            specHelper.general.offSpyProperty(ap.viewmodels.projects.ImportProjectIssueTypeViewModel.prototype, "chapterListVm", specHelper.PropertyAccessor.Get);
            specHelper.general.offSpyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Set);
            specHelper.general.offSpyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "isLoaded", specHelper.PropertyAccessor.Get);

        });

        describe("WHEN import is called with items checked", () => {
            let chaptersChecked: ap.models.projects.Chapter[];

            beforeEach(() => {
                vm.import();
                
                chaptersChecked = (<ap.models.projects.Chapter[]>(<jasmine.Spy>$mdDialog.hide).calls.argsFor(0)[0]);
            });

            it("THEN there is two chapters", () => {
                expect(chaptersChecked.length).toEqual(2);
            });
            it("THEN chapter 1 has correct infos", () => {
                expect(chaptersChecked[0].Code).toEqual("CodeChap1");
                expect(chaptersChecked[0].Description).toEqual("DescriptionChap1");
                expect(chaptersChecked[0].ProjectId).toEqual(MainController.currentProject().Id);
            });
            it("THEN chapter 1 has 2 issueType", () => {
                expect(chaptersChecked[0].IssueTypes.length).toEqual(2);
            });
            it("THEN issueType 1 has correct infos", () => {
                expect(chaptersChecked[0].IssueTypes[0].Code).toEqual("CodeIssueType1");
                expect(chaptersChecked[0].IssueTypes[0].Description).toEqual("DescriptionIssueType1");
            });
            it("THEN issueType 1 has 2 subjects", () => {
                expect(chaptersChecked[0].IssueTypes[0].NoteSubjects.length).toEqual(2);
            });
            it("THEN subject 1 has correct infos", () => {
                expect(chaptersChecked[0].IssueTypes[0].NoteSubjects[0].Subject).toEqual("subject1");
                expect(chaptersChecked[0].IssueTypes[0].NoteSubjects[0].DefaultDescription).toEqual("default description 1");
            });
            it("THEN subject 2 has correct infos", () => {
                expect(chaptersChecked[0].IssueTypes[0].NoteSubjects[1].Subject).toEqual("subject2");
                expect(chaptersChecked[0].IssueTypes[0].NoteSubjects[1].DefaultDescription).toEqual("default description 2");
            });
            it("THEN issueType 2 has correct infos", () => {
                expect(chaptersChecked[0].IssueTypes[1].Code).toEqual("CodeIssueType2");
                expect(chaptersChecked[0].IssueTypes[1].Description).toEqual("DescriptionIssueType2");
            });
            it("THEN issueType 2 has 0 subjects", () => {
                expect(chaptersChecked[0].IssueTypes[1].NoteSubjects.length).toEqual(0);
            });
            it("THEN chapter 2 has correct infos", () => {
                expect(chaptersChecked[1].Code).toEqual("CodeChap2");
                expect(chaptersChecked[1].Description).toEqual("DescriptionChap2");
                expect(chaptersChecked[1].ProjectId).toEqual(MainController.currentProject().Id);
            });
            it("THEN chapter 2 has 1 issueType", () => {
                expect(chaptersChecked[1].IssueTypes.length).toEqual(1);
            });
            it("THEN issueType has correct infos", () => {
                expect(chaptersChecked[1].IssueTypes[0].Code).toEqual("CodeIssueType3");
                expect(chaptersChecked[1].IssueTypes[0].Description).toEqual("DescriptionIssueType3");
            });
            it("THEN issueType has 0 subjects", () => {
                expect(chaptersChecked[1].IssueTypes[0].NoteSubjects.length).toEqual(0);
            });
            it("THEN event importissuetypefromproject is raised", () => {
                expect($mdDialog.hide).toHaveBeenCalledWith(chaptersChecked);
            });
            it("THEN the pop up is closed", () => {
                expect($mdDialog.hide).toHaveBeenCalled();
            });
        });
    });

    describe("WHEN the methods chapterIsChecked/issueTypeIsChecked/subjectIsChecked is called", () => {
        let chapterList: ap.viewmodels.projects.ChapterListViewModel;
        let chapter: ap.viewmodels.projects.ChapterViewModel;
        let chapter2: ap.viewmodels.projects.ChapterViewModel;
        let issueTypeList: ap.viewmodels.projects.IssueTypeListViewModel;
        let issueType1: ap.viewmodels.projects.IssueTypeViewModel;
        let issueType2: ap.viewmodels.projects.IssueTypeViewModel;
        let subjectList: ap.viewmodels.projects.IssueTypeNoteSubjectListViewModel;
        let subject1: ap.viewmodels.projects.IssueTypeNoteSubjectViewModel;
        let subject2: ap.viewmodels.projects.IssueTypeNoteSubjectViewModel;
        let defGet: angular.IDeferred<any>;
        beforeEach(() => {
            defGet = $q.defer();
            
            let chap: ap.models.projects.Chapter = new ap.models.projects.Chapter(Utility);
            let chap2: ap.models.projects.Chapter = new ap.models.projects.Chapter(Utility);
            chapter = new ap.viewmodels.projects.ChapterViewModel(Utility);
            chapter2 = new ap.viewmodels.projects.ChapterViewModel(Utility);
            chapter.init(chap);
            chapter2.init(chap2);
            vm = new ap.viewmodels.projects.ImportProjectIssueTypeViewModel(Utility, $q, Api, ControllersManager, ServicesManager, $mdDialog, $timeout);
            chapterList = new ap.viewmodels.projects.ChapterListViewModel(Utility, $q, ControllersManager, ServicesManager.projectService);
            chapterList.sourceItems = [chapter, chapter2];

            let issu: ap.models.projects.IssueType = new ap.models.projects.IssueType(Utility);
            issu.ParentChapter = chap;
            let issu2: ap.models.projects.IssueType = new ap.models.projects.IssueType(Utility);
            issu2.ParentChapter = chap;
            chap.IssueTypes = [issu, issu2];
            specHelper.general.spyProperty(ap.viewmodels.projects.ImportProjectIssueTypeViewModel.prototype, "chapterListVm", specHelper.PropertyAccessor.Get).and.returnValue(chapterList);
            issueType1 = new ap.viewmodels.projects.IssueTypeViewModel(Utility);
            issueType1.init(issu);
            issueType2 = new ap.viewmodels.projects.IssueTypeViewModel(Utility);
            issueType2.init(issu2);
            issueTypeList = new ap.viewmodels.projects.IssueTypeListViewModel(Utility, $q, ControllersManager);

            let sub: ap.models.projects.IssueTypeNoteSubject = new ap.models.projects.IssueTypeNoteSubject(Utility);
            sub.IssueType = issu;
            let sub2: ap.models.projects.IssueTypeNoteSubject = new ap.models.projects.IssueTypeNoteSubject(Utility);
            sub2.IssueType = issu;
            issu.NoteSubjects = [sub, sub2];
            subject1 = new ap.viewmodels.projects.IssueTypeNoteSubjectViewModel(Utility);
            subject1.init(sub);
            subject2 = new ap.viewmodels.projects.IssueTypeNoteSubjectViewModel(Utility);
            subject2.init(sub2);
            vm.subjectDescListVm.sourceItems = [subject1, subject2];
            specHelper.general.spyProperty(ap.viewmodels.projects.ImportProjectIssueTypeViewModel.prototype, "issueTypeListVm", specHelper.PropertyAccessor.Get).and.returnValue(issueTypeList);
            issueTypeList.sourceItems = [issueType1, issueType2];
            specHelper.general.spyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "isLoaded", specHelper.PropertyAccessor.Get).and.returnValue(true);
            specHelper.general.spyProperty(ap.viewmodels.projects.IssueTypeNoteSubjectViewModel.prototype, "issueTypeViewModel", specHelper.PropertyAccessor.Get).and.returnValue(issueType1);
            spyOn(vm.chapterListVm, "getEntityById").and.returnValue(chapter);
            spyOn(vm.issueTypeListVm, "getEntityById").and.callFake((id: string) => {
                if (id === issueType1.originalEntity.Id) { return issueType1; }
                if (id === issueType2.originalEntity.Id) { return issueType2; }
            });
        });

        afterEach(() => {
            specHelper.general.offSpyProperty(ap.viewmodels.projects.IssueTypeNoteSubjectViewModel.prototype, "issueTypeViewModel", specHelper.PropertyAccessor.Get);
            specHelper.general.offSpyProperty(ap.viewmodels.projects.ImportProjectIssueTypeViewModel.prototype, "chapterListVm", specHelper.PropertyAccessor.Get);
            specHelper.general.offSpyProperty(ap.viewmodels.projects.ImportProjectIssueTypeViewModel.prototype, "issueTypeListVm", specHelper.PropertyAccessor.Get);
            specHelper.general.offSpyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "isLoaded", specHelper.PropertyAccessor.Get);
        });

        describe("WHEN the chapter is checked", () => {
            beforeEach(() => {
                
                spyOn(vm.subjectDescListVm, "load").and.returnValue(defGet.promise);
                vm.issueTypeListVm.selectedViewModel = issueType1;
                specHelper.general.raiseEvent(vm.issueTypeListVm, "selectedItemChanged", issueType1);
                defGet.resolve();
                $rootScope.$apply();
                specHelper.general.spyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Set);
                vm.issueTypeListVm.parentChapter = <ap.viewmodels.projects.ChapterViewModel>vm.chapterListVm.sourceItems[0];
                vm.chapterListVm.sourceItems[0].isChecked = true;
                vm.checkedCategorie(chapter);
               
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Set);
                specHelper.general.offSpyProperty(ap.viewmodels.projects.ImportProjectIssueTypeViewModel.prototype, "subjectDescListVm", specHelper.PropertyAccessor.Get);
            });
            it("THEN the children are checked too", () => {
                expect(vm.issueTypeListVm.sourceItems[0].isChecked).toBeTruthy();
                expect(vm.issueTypeListVm.sourceItems[1].isChecked).toBeTruthy();
            });
        });
        describe("WHEN the chapter is unchecked", () => {
            beforeEach(() => {
                
                spyOn(vm.subjectDescListVm, "load").and.returnValue(defGet.promise);
                vm.issueTypeListVm.selectedViewModel = issueType1;
                specHelper.general.raiseEvent(vm.issueTypeListVm, "selectedItemChanged", issueType1);
                defGet.resolve();
                $rootScope.$apply();
                specHelper.general.spyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Set);
                vm.issueTypeListVm.parentChapter = <ap.viewmodels.projects.ChapterViewModel>vm.chapterListVm.sourceItems[0];
                vm.chapterListVm.sourceItems[0].isChecked = false;
                vm.checkedCategorie(chapter);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Set);
                specHelper.general.offSpyProperty(ap.viewmodels.projects.ImportProjectIssueTypeViewModel.prototype, "subjectDescListVm", specHelper.PropertyAccessor.Get);
            });
            it("THEN the children are unchecked too", () => {
                expect(vm.issueTypeListVm.sourceItems[0].isChecked).toBeFalsy();
                expect(vm.issueTypeListVm.sourceItems[1].isChecked).toBeFalsy();
            });
        });
        describe("WHEN the chapter is checked, and a issuType is already checked", () => {
            beforeEach(() => {
                
                spyOn(vm.subjectDescListVm, "load").and.returnValue(defGet.promise);
                vm.issueTypeListVm.selectedViewModel = issueType1;
                specHelper.general.raiseEvent(vm.issueTypeListVm, "selectedItemChanged", issueType1);
                defGet.resolve();
                $rootScope.$apply();
                specHelper.general.spyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Set);
                vm.issueTypeListVm.parentChapter = <ap.viewmodels.projects.ChapterViewModel>vm.chapterListVm.sourceItems[0];
                vm.subjectDescListVm.issueTypeId = vm.chapterListVm.sourceItems[0].originalEntity.Id;
                vm.chapterListVm.sourceItems[0].isChecked = true;
                vm.issueTypeListVm.sourceItems[0].isChecked = true;
                vm.checkedCategorie(vm.issueTypeListVm.sourceItems[0]);
                vm.checkedCategorie(chapter);
                vm.issueTypeListVm.sourceItems[1].isChecked = false;

            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Set);
                specHelper.general.offSpyProperty(ap.viewmodels.projects.ImportProjectIssueTypeViewModel.prototype, "subjectDescListVm", specHelper.PropertyAccessor.Get);
            });
            it("THEN only the issueType stored in the cache is checked", () => {
                expect(vm.issueTypeListVm.sourceItems[0].isChecked).toBeTruthy();
                expect(vm.issueTypeListVm.sourceItems[1].isChecked).toBeFalsy();
            });
        });
        describe("WHEN the chapter is checked, and a issuType is already checked and we want to unchecked it", () => {
            beforeEach(() => {
                
                spyOn(vm.subjectDescListVm, "load").and.returnValue(defGet.promise);
                vm.issueTypeListVm.selectedViewModel = issueType1;
                specHelper.general.raiseEvent(vm.issueTypeListVm, "selectedItemChanged", issueType1);
                defGet.resolve();
                $rootScope.$apply();
                specHelper.general.spyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Set);
                vm.issueTypeListVm.parentChapter = <ap.viewmodels.projects.ChapterViewModel>vm.chapterListVm.sourceItems[0];
                vm.chapterListVm.sourceItems[0].isChecked = true;
                vm.issueTypeListVm.sourceItems[0].isChecked = true;
                vm.checkedCategorie(chapter);
                vm.chapterListVm.sourceItems[0].isChecked = false;
                vm.issueTypeListVm.sourceItems[0].isChecked = false;
                vm.checkedCategorie(chapter);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Set);
                specHelper.general.offSpyProperty(ap.viewmodels.projects.ImportProjectIssueTypeViewModel.prototype, "subjectDescListVm", specHelper.PropertyAccessor.Get);
            });
            it("THEN the chapter is unchecked", () => {
                expect(vm.chapterListVm.sourceItems[0].isChecked).toBeFalsy();
                expect(vm.issueTypeListVm.sourceItems[1].isChecked).toBeFalsy();
            });
        });
        describe("WHEN the issuetype is checked/ unchecked", () => {
            beforeEach(() => {
                vm.issueTypeListVm.sourceItems = [issueType1];
            });
            describe("WHEN there is no subject checked before", () => {
                beforeEach(() => {
                    
                    spyOn(vm.subjectDescListVm, "load").and.returnValue(defGet.promise);
                    vm.issueTypeListVm.selectedViewModel = issueType1;
                    specHelper.general.raiseEvent(vm.issueTypeListVm, "selectedItemChanged", issueType1);
                    defGet.resolve();
                    $rootScope.$apply();
                    vm.subjectDescListVm.issueTypeId = vm.issueTypeListVm.sourceItems[0].originalEntity.Id;
                    vm.subjectDescListVm.parentIsssueTypeVm = <ap.viewmodels.projects.IssueTypeViewModel>vm.issueTypeListVm.sourceItems[0];
                    vm.issueTypeListVm.sourceItems[0].isChecked = true;
                    vm.checkedCategorie(vm.issueTypeListVm.sourceItems[0]);

                    defGet.resolve();
                    $rootScope.$apply();
                });
                afterEach(() => {
                    specHelper.general.offSpyProperty(ap.viewmodels.projects.ImportProjectIssueTypeViewModel.prototype, "subjectDescListVm", specHelper.PropertyAccessor.Get);
                });
                it("THEN all subjects are checked", () => {
                    expect(vm.subjectDescListVm.sourceItems[0].isChecked).toBeTruthy();
                    expect(vm.subjectDescListVm.sourceItems[1].isChecked).toBeTruthy();
                });
            });
            describe("WHEN there is already a subject checked before", () => {
                beforeEach(() => {
                    
                    spyOn(vm.subjectDescListVm, "load").and.returnValue(defGet.promise);
                    vm.issueTypeListVm.selectedViewModel = issueType1;
                    specHelper.general.raiseEvent(vm.issueTypeListVm, "selectedItemChanged", issueType1);
                    defGet.resolve();
                    $rootScope.$apply();
                    specHelper.general.spyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Set);

                    vm.issueTypeListVm.sourceItems[0].isChecked = true;
                    vm.subjectDescListVm.sourceItems[0].isChecked = true;
                    vm.checkedCategorie(vm.issueTypeListVm.sourceItems[0]);
                });
                afterEach(() => {
                    specHelper.general.offSpyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Set);
                    specHelper.general.offSpyProperty(ap.viewmodels.projects.ImportProjectIssueTypeViewModel.prototype, "subjectDescListVm", specHelper.PropertyAccessor.Get);
                });
                it("THEN only the subject stored in the cache is checked", () => {
                    expect(vm.subjectDescListVm.sourceItems[0].isChecked).toBeTruthy();
                    expect(vm.subjectDescListVm.sourceItems[1].isChecked).toBeFalsy();
                });
            });
            describe("WHEN we want to uncheck the issuetype", () => {
                beforeEach(() => {
                    
                    spyOn(vm.subjectDescListVm, "load").and.returnValue(defGet.promise);
                    vm.issueTypeListVm.selectedViewModel = issueType1;
                    specHelper.general.raiseEvent(vm.issueTypeListVm, "selectedItemChanged", issueType1);
                    defGet.resolve();
                    $rootScope.$apply();
                    specHelper.general.spyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Set);
                    vm.subjectDescListVm.issueTypeId = vm.issueTypeListVm.sourceItems[0].originalEntity.Id;
                    vm.subjectDescListVm.parentIsssueTypeVm = <ap.viewmodels.projects.IssueTypeViewModel>vm.issueTypeListVm.sourceItems[0];
                    vm.issueTypeListVm.parentChapter = <ap.viewmodels.projects.ChapterViewModel>vm.chapterListVm.sourceItems[0];
                    vm.chapterListVm.sourceItems[0].isChecked = true;
                    vm.issueTypeListVm.sourceItems[0].isChecked = true;
                    vm.checkedCategorie(vm.chapterListVm.sourceItems[0]);
                    vm.issueTypeListVm.sourceItems[0].isChecked = false;
                    vm.checkedCategorie(vm.issueTypeListVm.sourceItems[0]);
                });
                afterEach(() => {
                    specHelper.general.offSpyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Set);
                    specHelper.general.offSpyProperty(ap.viewmodels.projects.ImportProjectIssueTypeViewModel.prototype, "subjectDescListVm", specHelper.PropertyAccessor.Get);
                });
                it("THEN all subjects are unchecked", () => {
                    expect(vm.subjectDescListVm.sourceItems[0].isChecked).toBeFalsy();
                    expect(vm.subjectDescListVm.sourceItems[1].isChecked).toBeFalsy();
                });
            });
        });
        describe("WHEN the subject is checked/ unchecked", () => {
            describe("WHEN the subject's issue type is not checked", () => {
                beforeEach(() => {
                    
                    spyOn(vm.subjectDescListVm, "load").and.returnValue(defGet.promise);
                    vm.issueTypeListVm.selectedViewModel = issueType1;
                    specHelper.general.raiseEvent(vm.issueTypeListVm, "selectedItemChanged", issueType1);
                    defGet.resolve();
                    $rootScope.$apply();
                    specHelper.general.spyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Set);
                    specHelper.general.spyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get).and.returnValue(issueType1);

                    vm.issueTypeListVm.sourceItems[0].isChecked = false;
                    vm.subjectDescListVm.sourceItems[0].isChecked = true;
                    vm.checkedCategorie(vm.subjectDescListVm.sourceItems[0]);
                });
                afterEach(() => {
                    specHelper.general.offSpyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Set);
                    specHelper.general.offSpyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get);
                    specHelper.general.offSpyProperty(ap.viewmodels.projects.ImportProjectIssueTypeViewModel.prototype, "subjectDescListVm", specHelper.PropertyAccessor.Get);
                });
                it("THEN the issueType is checked", () => {
                    expect(vm.issueTypeListVm.sourceItems[0].isChecked).toBeTruthy();
                    expect(vm.subjectDescListVm.sourceItems[0].isChecked).toBeTruthy();
                });
            });
            describe("WHEN we want to uncheck the last subject", () => {
                beforeEach(() => {
                    
                    spyOn(vm.subjectDescListVm, "load").and.returnValue(defGet.promise);
                    vm.issueTypeListVm.selectedViewModel = issueType1;
                    specHelper.general.raiseEvent(vm.issueTypeListVm, "selectedItemChanged", issueType1);
                    defGet.resolve();
                    $rootScope.$apply();
                    specHelper.general.spyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Set);
                    specHelper.general.spyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get).and.returnValue(issueType1);

                    vm.issueTypeListVm.sourceItems[0].isChecked = true;
                    vm.checkedCategorie(vm.issueTypeListVm.sourceItems[0]);
                    vm.subjectDescListVm.sourceItems[0].isChecked = false;
                    vm.checkedCategorie(vm.subjectDescListVm.sourceItems[0]);
                });
                afterEach(() => {
                    specHelper.general.offSpyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Set);
                    specHelper.general.offSpyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get);
                    specHelper.general.offSpyProperty(ap.viewmodels.projects.ImportProjectIssueTypeViewModel.prototype, "subjectDescListVm", specHelper.PropertyAccessor.Get);
                });
                it("THEN only the issueType stroe in the cache is checked", () => {
                    expect(vm.subjectDescListVm.sourceItems[0].isChecked).toBeFalsy();
                    expect(vm.subjectDescListVm.sourceItems[0].isChecked).toBeFalsy();
                });
            });
        });
    });

    describe("WHEN the method projectSelectorSelectedItemChanged is called", () => {
        beforeEach(() => {
            vm = new ap.viewmodels.projects.ImportProjectIssueTypeViewModel(Utility, $q, Api, ControllersManager, ServicesManager, $mdDialog, $timeout);
            spyOn(vm, "loadIdsData");
            spyOn(vm.issueTypeListVm, "specifyIds");
            spyOn(vm.subjectDescListVm, "clearInfo");
            specHelper.general.raiseEvent(vm.projectSelector, "selectedItemChanged", { Id: "selectedVm" });
        });
        it("THEN specifyIds is called", () => {
            expect(vm.issueTypeListVm.specifyIds).toHaveBeenCalled();
        });
        it("THEN clearinfo is called", () => {
            expect(vm.subjectDescListVm.clearInfo).toHaveBeenCalled();
        });
        it("THEN loadidsdata is called", () => {
            expect(vm.loadIdsData).toHaveBeenCalled();
        });
    });
});