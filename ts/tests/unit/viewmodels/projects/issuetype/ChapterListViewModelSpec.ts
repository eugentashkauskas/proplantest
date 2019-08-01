describe("Module ap-viewmodels - ChapterListViewModel", () => {
    let Utility: ap.utility.UtilityHelper;
    let Api: ap.services.apiHelper.Api;
    let vm: ap.viewmodels.projects.ChapterListViewModel;
    let ControllersManager: ap.controllers.ControllersManager;
    let $q: angular.IQService;
    let $rootScope: angular.IRootScopeService;
    let ProjectService: ap.services.ProjectService;

    class ChapterListVm extends ap.viewmodels.projects.ChapterListViewModel {

        checkForDuplicatedItems(itemVm: ap.viewmodels.IEntityViewModel) { }
        initDuplicatedData(itemVm: ap.viewmodels.IEntityViewModel) {
            super.initDuplicatedData(itemVm);
        }
        constructor(utility: ap.utility.UtilityHelper, protected $q: angular.IQService, _controllersManager: ap.controllers.ControllersManager, _projectService: ap.services.ProjectService) {
            super(utility, $q, _controllersManager, _projectService);

        }
    }

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject(function (_Utility_, _$q_, _$rootScope_, _Api_, _ControllersManager_, _ProjectService_) {
        Utility = _Utility_;
        Api = _Api_;
        $q = _$q_;
        $rootScope = _$rootScope_;
        ControllersManager = _ControllersManager_;
        ProjectService = _ProjectService_;
    }));

    describe("Feature: constructor", () => {
        describe("WHEN i request to create the ChapterListViewModel", () => {
            beforeEach(() => {
                vm = new ap.viewmodels.projects.ChapterListViewModel(Utility, $q, ControllersManager, ProjectService);
            });
            it("THEN, the vm will created with default values", () => {
                expect(vm).toBeDefined();
                expect(vm.options.pageSize).toBe(50);
                expect(vm.options.displayLoading).toBeFalsy();
                expect(vm.options.isGetIdsCustom).toBeFalsy();
                expect(vm.entityName).toBe("Chapter");
                expect(vm.sortOrder).toBe("DisplayOrder");
                expect(vm.pathToLoad).toBeNull();
                expect(vm.isDeferredLoadingMode).toBeTruthy();
                    expect(vm.options.nbPropertiesToCheck).toEqual(2);
            });
            it("THEN, the vm create with actions", () => {
                expect(vm.actions.length).toBe(1);
                expect(vm.actions[0].name).toBe("chapter.add");
            });
        });
    });
    describe("Feature: specifyIds", () => {
        let ids: string[];
        let deferredLoadChapters;
        beforeEach(() => {
            deferredLoadChapters = $q.defer();
            spyOn(ProjectService, "getProjectChapters").and.returnValue(deferredLoadChapters.promise);

            ids = ["C1", "C2", "C3"];
            vm = new ap.viewmodels.projects.ChapterListViewModel(Utility, $q, ControllersManager, ProjectService);
        });
        describe("WHEN specifyIds is called with the list of ids", () => {
            beforeEach(() => {
                vm.specifyIds(ids);
            });
            it("THEN, the list vm will be set with the given ids", () => {
                expect(vm.count).toEqual(3);
            });
            it("AND sourceitems will be updated", () => {
                expect(vm.sourceItems.length).toEqual(3);
            });
            it("AND, ProjectService.getProjectChapters will be called", () => {
                expect(ProjectService.getProjectChapters).toHaveBeenCalledWith(ids, "Id,Code,Description", true, true);
            });
        });
        describe("WHEN specifyIds is called with the list of ids and project chapters exist", () => {
            let testChapter1: ap.models.projects.Chapter;
            let testChapter2: ap.models.projects.Chapter;
            beforeEach(() => {
                testChapter1 = new ap.models.projects.Chapter(Utility);
                testChapter1.createByJson({ Id: "test-id-1", Code: "TST", Description: "TEST CHAPTER 1" });
                testChapter2 = new ap.models.projects.Chapter(Utility);
                testChapter2.createByJson({ Id: "test-id-2", Code: "TS2", Description: "TEST CHAPTER 2" });
                deferredLoadChapters.resolve([testChapter1, testChapter2]);
                vm.specifyIds(["test-id-1", "test-id-2"]);
                $rootScope.$apply();
            });
            it("THEN, idValuesDictionary is filled with entity values", () => {
                expect(vm.idValuesDictionary.keys().length).toEqual(2);
                expect(vm.idValuesDictionary.keys()[0]).toEqual("test-id-1");
                expect(vm.idValuesDictionary.keys()[1]).toEqual("test-id-2");
                expect(vm.idValuesDictionary.getValue("test-id-1").length).toEqual(2);
                expect(vm.idValuesDictionary.getValue("test-id-2").length).toEqual(2);
                let codeKeyVal1 = vm.idValuesDictionary.getValue("test-id-1")[0];
                let descKeyVal1 = vm.idValuesDictionary.getValue("test-id-1")[1];
                expect(codeKeyVal1).toEqual(new KeyValue("code", testChapter1.Code));
                expect(descKeyVal1).toEqual(new KeyValue("description", testChapter1.Description));
                let codeKeyVal2 = vm.idValuesDictionary.getValue("test-id-2")[0];
                let descKeyVal2 = vm.idValuesDictionary.getValue("test-id-2")[1];
                expect(codeKeyVal2).toEqual(new KeyValue("code", testChapter2.Code));
                expect(descKeyVal2).toEqual(new KeyValue("description", testChapter2.Description));
            });
            it("THEN, valuesIdsDictionary is filled with entity values", () => {
                expect(vm.valuesIdsDictionary.length).toEqual(2);
                let codesDict = vm.valuesIdsDictionary[0];
                let descDict = vm.valuesIdsDictionary[1];
                expect(codesDict.keys().length).toEqual(2);
                let codeKey1 = codesDict.keys()[0];
                expect(codeKey1).toEqual(testChapter1.Code);
                expect(codesDict.getValue(codeKey1)).toEqual([testChapter1.Id]);
                let codeKey2 = codesDict.keys()[1];
                expect(codeKey2).toEqual(testChapter2.Code);
                expect(codesDict.getValue(codeKey2)).toEqual([testChapter2.Id]);
                let descKey1 = descDict.keys()[0];
                expect(descKey1).toEqual(testChapter1.Description);
                expect(descDict.getValue(descKey1)).toEqual([testChapter1.Id]);
                let descKey2 = descDict.keys()[1];
                expect(descKey2).toEqual(testChapter2.Description);
                expect(descDict.getValue(descKey2)).toEqual([testChapter2.Id]);
            });
        });
        describe("WHEN specifyIds is called ids and loadNextPage is called after", () => {
            beforeEach(() => {
                vm.specifyIds(ids);
                spyOn(vm, "loadIds").and.callThrough();
                spyOn(Api, "getEntityList").and.callFake(() => {
                    let defer = $q.defer();
                    return defer.promise;
                });
                vm.loadNextPage();
            });
            it("THEN, the load of ids is not called", () => {
                expect(vm.loadIds).not.toHaveBeenCalled();
            });
            it("BUT The api is called to load the list regarding the ids", () => {
                expect(Api.getEntityList).toHaveBeenCalled();
            });
        });
    });

    describe("Feature: Item actions", () => {
        let _deferred: angular.IDeferred<any>;
        let chapterList: ChapterListVm;
        let chapters: ap.models.projects.Chapter[];
        let chapter: ap.models.projects.Chapter;
        let ids: string[];
        let chapterVM: ap.viewmodels.projects.ChapterViewModel;
        let deferredLoadChapters: angular.IDeferred<any>;

        beforeEach(() => {
            spyOn(ControllersManager.mainController, "currentProject").and.returnValue({
                Id: "12"
            });

            deferredLoadChapters = $q.defer();
            spyOn(ProjectService, "getProjectChapters").and.returnValue(deferredLoadChapters.promise);
            let chapterCode = [{ Id: "0", Code: "CH", Description: "chapter" }];

            chapter = new ap.models.projects.Chapter(Utility);
            chapter.createByJson({ Id: "0", Code: "CH", Description: "chapter", DisplayOrder: 0 });
            chapters = [];
            chapters.push(chapter);

            _deferred = $q.defer();
            spyOn(Api, "getEntityList").and.returnValue(_deferred.promise);

            chapterList = new ChapterListVm(Utility, $q, ControllersManager, ProjectService);
            spyOn(chapterList, "clear");
            spyOn(chapterList, "checkForDuplicatedItems");
            ids = [chapter.Id];
            chapterList.specifyIds(ids);
            deferredLoadChapters.resolve(chapterCode);

            chapterList.loadNextPage();
            _deferred.resolve(new ap.services.apiHelper.ApiResponse(chapters));
            $rootScope.$apply();

            specHelper.general.raiseEvent(chapterList.getItemAtIndex(0), "insertrowrequested", chapterList.getItemAtIndex(0));
        });
        describe("WHEN, Item action raise insertrowrequested", () => {
            it("THEN, there is 2 items (add one)", () => {
                expect(chapterList.count).toEqual(2);
                chapterVM = <ap.viewmodels.projects.ChapterViewModel>chapterList.getItemAtIndex(1);
                expect(chapterVM.chapter.IsNew).toBeTruthy();
            });

            it("THEN, the projectId is set to the current project id", () => {
                chapterVM = <ap.viewmodels.projects.ChapterViewModel>chapterList.getItemAtIndex(1);
                expect(chapterVM.chapter.ProjectId).toBe("12");
            });
            it("THEN, the VM is invalid", () => {
                expect(chapterList.isValid()).toBeFalsy();
            });
        });
    });

    describe("Feature afterLoadPageSuccessHandler", () => {
        let _deferred: angular.IDeferred<any>;
        let chapterList: ChapterListVm;
        let chapters: ap.models.projects.Chapter[];
        let chapter: ap.models.projects.Chapter;
        let ids: string[];
        let chapterVM: ap.viewmodels.projects.ChapterViewModel;
        let deferredLoadChapters: angular.IDeferred<any>;

        beforeEach(() => {
            spyOn(ControllersManager.mainController, "currentProject").and.returnValue({
                Id: "12"
            });

            deferredLoadChapters = $q.defer();
            spyOn(ProjectService, "getProjectChapters").and.returnValue(deferredLoadChapters.promise);
            let chapterCode = [{ Id: "0", Code: "CH", Description: "chapter" }];

            chapter = new ap.models.projects.Chapter(Utility);
            chapter.createByJson({ Id: "0", Code: "CH", Description: "chapter", DisplayOrder: 0 });
            chapters = [];
            chapters.push(chapter);

            _deferred = $q.defer();
            spyOn(Api, "getEntityList").and.returnValue(_deferred.promise);

            chapterList = new ChapterListVm(Utility, $q, ControllersManager, ProjectService);
            spyOn(chapterList, "clear");
            spyOn(chapterList, "checkForDuplicatedItems");
            ids = [chapter.Id];
            chapterList.specifyIds(ids);
            deferredLoadChapters.resolve(chapterCode);

            chapterList.loadNextPage();
            _deferred.resolve(new ap.services.apiHelper.ApiResponse(chapters));
            $rootScope.$apply();

            specHelper.general.raiseEvent(chapterList.getItemAtIndex(0), "insertrowrequested", chapterList.getItemAtIndex(0));
        });
        describe("WHEN, afterLoadPageSuccessHandler is called", () => {
            it("THEN, checkForDuplicatedItems is called", () => {
                expect(chapterList.checkForDuplicatedItems).toHaveBeenCalled();
            });
        });
    });

    describe("Feature: postChange", () => {
        let chapterList: ap.viewmodels.projects.ChapterListViewModel;
        let viewModelsToDelete: ap.viewmodels.projects.ChapterViewModel;
        let viewModelsToUpdate: ap.viewmodels.projects.ChapterViewModel;
        let chapter1: ap.models.projects.Chapter;
        let chapter2: ap.models.projects.Chapter;
        let projectPunchList: ap.models.custom.ProjectPunchlists;
        let project: ap.models.projects.Project;
        beforeEach(() => {
            project = new ap.models.projects.Project(Utility);
            spyOn(ControllersManager.mainController, "currentProject").and.returnValue(project);
            chapter1 = new ap.models.projects.Chapter(Utility);
            chapter1.createByJson({ Id: "12345" });
            chapter2 = new ap.models.projects.Chapter(Utility);
            chapter2.createByJson({ Id: "56789" });
            chapterList = new ap.viewmodels.projects.ChapterListViewModel(Utility, $q, ControllersManager, ProjectService);
            projectPunchList = new ap.models.custom.ProjectPunchlists(Utility, project.Id);
            viewModelsToDelete = new ap.viewmodels.projects.ChapterViewModel(Utility);
            viewModelsToDelete.init(chapter1);
            viewModelsToDelete.actionClicked("chapter.delete");
            viewModelsToUpdate = new ap.viewmodels.projects.ChapterViewModel(Utility);
            viewModelsToUpdate.init(chapter2);
            viewModelsToUpdate.code = "aaa";
            spyOn(viewModelsToUpdate, "postChanges");
        });
        describe("WHEN postChange is called with entity to delete and update", () => {
            describe("WHEN entities are not new", () => {
                beforeEach(() => {
                    projectPunchList.ChaptersToDelete.push(viewModelsToDelete.originalEntity.Id);
                    projectPunchList.ChaptersToUpdate.push(<ap.models.projects.Chapter>viewModelsToUpdate.originalEntity);
                    spyOn(chapterList, "getChangedItems").and.returnValue([viewModelsToDelete, viewModelsToUpdate]);
                });
                it("THEN ProjectPunchlists.ChaptersToDelete is not empty", () => {
                    expect(chapterList.postChange()).toEqual(projectPunchList);
                });
                it("THEN ProjectPunchList.ChaptersToUpdate is not empty", () => {
                    expect(chapterList.postChange()).toEqual(projectPunchList);
                });
            });
            describe("WHEN entities to delete are new", () => {
                beforeEach(() => {
                    chapter1 = new ap.models.projects.Chapter(Utility);
                    viewModelsToDelete = new ap.viewmodels.projects.ChapterViewModel(Utility);
                    viewModelsToDelete.init(chapter1);
                    viewModelsToDelete.code = "code";
                    viewModelsToDelete.actionClicked("chapter.delete");
                    chapterList.sourceItems = [viewModelsToDelete];
                    projectPunchList.ChaptersToDelete.push(viewModelsToDelete.originalEntity.Id);
                    spyOn(chapterList, "getChangedItems").and.returnValue([viewModelsToDelete]);

                    chapterList.valuesIdsDictionary[0].add("CODE", [chapter1.Id]);
                    chapterList.valuesIdsDictionary[1].add(null, [chapter1.Id]);
                    chapterList.idValuesDictionary.add(chapter1.Id, null);
                    chapterList.postChange();
                });
                it("THEN chapter is removed from source items", () => {
                    expect(chapterList.sourceItems.indexOf(viewModelsToDelete)).toEqual(-1);
                });
                it("THEN chapter.Id is removed from idValuesDictionary", () => {
                    expect(chapterList.idValuesDictionary.containsKey(chapter1.Id)).toBeFalsy();
                });
                it("THEN chapter.Id is removed from valuesIdsDictionary", () => {
                    expect(chapterList.valuesIdsDictionary[0].containsKey(viewModelsToDelete.code)).toBeFalsy();
                });
            });
        });
        describe("WHEN postChange is called with no entity to delete and update", () => {
            beforeEach(() => {
                spyOn(chapterList, "getChangedItems").and.returnValue([]);
            });
            it("THEN ProjectPunchList.ChaptersToDelete is empty", () => {
                expect(chapterList.postChange()).toEqual(projectPunchList);
            });
            it("THEN ProjectPunchList.ChaptersToUpdate is empty", () => {
                expect(chapterList.postChange()).toEqual(projectPunchList);
            });
        });
    });

    describe("Feature: actionClickHandler", () => {
        beforeEach(() => {
            vm = new ap.viewmodels.projects.ChapterListViewModel(Utility, $q, ControllersManager, ProjectService);

            spyOn(ControllersManager.mainController, "currentProject").and.returnValue({
                Id: "12"
            });
        });
        describe("WHEN call actionClickHandler with name addAction", () => {
            beforeEach(() => {
                spyOn(vm, "insertItem");
                vm.actionClickedHandler(vm.actions[0].name);
            });
            it("THEN call insertItem with index and newItem", () => {
                expect(vm.insertItem).toHaveBeenCalled();
            });
        })
    });

    describe("Feature: insertItem", () => {
        let chapterVm: ap.viewmodels.projects.ChapterViewModel;
        beforeEach(() => {
            let chapter: ap.models.projects.Chapter = new ap.models.projects.Chapter(Utility);
            chapterVm = new ap.viewmodels.projects.ChapterViewModel(Utility);
            chapterVm.init(chapter);
            chapterVm.code = "code";
            chapterVm.description = "description";
            vm = new ap.viewmodels.projects.ChapterListViewModel(Utility, $q, ControllersManager, ProjectService);
            spyOn((<ChapterListVm>vm), "checkForDuplicatedItems");
            spyOn((<ChapterListVm>vm), "initDuplicatedData");
            vm.specifyIds([]);
            vm.insertItem(0, chapterVm);
        });
        describe("WHEN insertItem", () => {
            it("THEN initDuplicatedData is called", () => {
                chapterVm.code = "";
                chapterVm.description = "";
                expect((<ChapterListVm>vm).initDuplicatedData).toHaveBeenCalledWith(chapterVm);
            });
            it("THEN checkForDuplicatedItems is called", () => {
                expect((<ChapterListVm>vm).checkForDuplicatedItems).toHaveBeenCalledWith(chapterVm);
            });
        })
    });

    describe("Feature: chaptertInsertRequested", () => {
        let _deferred: angular.IDeferred<any>;
        let chapterList: ChapterListVm;
        let chapters: ap.models.projects.Chapter[];
        let chapter: ap.models.projects.Chapter;
        let ids: string[];
        let chapterVM: ap.viewmodels.projects.ChapterViewModel;
        let deferredLoadChapters: angular.IDeferred<any>;
        let chapterCode;
        let callback: jasmine.Spy;
        beforeEach(() => {
            spyOn(ControllersManager.mainController, "currentProject").and.returnValue({
                Id: "12"
            });

            chapters = [];
            deferredLoadChapters = $q.defer();
            spyOn(ProjectService, "getProjectChapters").and.returnValue(deferredLoadChapters.promise);
            chapterCode = [{ Id: "0", Code: "CH", Description: "chap" }];

            chapter = new ap.models.projects.Chapter(Utility);
            chapter.createByJson({ Id: "0", Code: "CH", Description: "chapter", DisplayOrder: 1 });

            _deferred = $q.defer();
            spyOn(Api, "getEntityList").and.callFake(function () {
                return _deferred.promise;
            });
            chapterList = new ChapterListVm(Utility, $q, ControllersManager, ProjectService);

            callback = jasmine.createSpy("callback");
            chapterList.on("propertychanged", callback, this);

            spyOn(chapterList, "clear");
            spyOn(chapterList, "checkForDuplicatedItems");
        });

        describe("WHEN call chaptertInsertRequested and list of chapter is empty", () => {
            beforeEach(() => {
                ids = [];
                chapterList.specifyIds(ids);
                deferredLoadChapters.resolve([]);
                chapterList.loadNextPage();
                _deferred.resolve(new ap.services.apiHelper.ApiResponse([]));
                $rootScope.$apply();
                chapterList.actionClickedHandler("chapter.add");
                chapterVM = <ap.viewmodels.projects.ChapterViewModel>chapterList.getItemAtIndex(0);
            });
            it("THEN add new Chapter with displayOrder = 1", () => {
                expect(chapterVM.originalEntity.IsNew).toBeTruthy();
                expect(chapterVM.displayOrder).toBe(1);
            });
            it("THEN, _invalidItems.length = 1 and _isValid = false", () => {
                expect(chapterList.isValid()).toBeFalsy();
                expect(callback).toHaveBeenCalled();
                expect(chapterList.isDuplicated).toBeFalsy();
            });
        });
        describe("WHEN call chaptertInsertRequested and list of chapter has 1 entity", () => {
            beforeEach(() => {
                chapters.push(chapter);
                ids = [chapter.Id];
                chapterList.specifyIds(ids);
                deferredLoadChapters.resolve(chapterCode);
                chapterList.loadNextPage();
                _deferred.resolve(new ap.services.apiHelper.ApiResponse(chapters));
                $rootScope.$apply();
                chapterList.actionClickedHandler("chapter.add");
                chapterVM = <ap.viewmodels.projects.ChapterViewModel>chapterList.getItemAtIndex(1);
            });
            it("THEN add new Chapter with displayOrder = 10001", () => {
                expect(chapterVM.originalEntity.IsNew).toBeTruthy();
                expect(chapterVM.displayOrder).toBe(10001);
            });
            it("THEN, isValid = false", () => {
                expect(chapterList.isValid()).toBeFalsy();
            });
        });
        describe("WHEN call chaptertInsertRequested and list of chapter has 54 entity and 2 pages", () => {
            let chapters2: ap.models.projects.Chapter[] = [];
            beforeEach(() => {
                ids = [];
                chapters = [];
                chapterCode = [];
                for (let i = 1; i <= 54; i++) {
                    let chapterLoop = new ap.models.projects.Chapter(Utility);
                    chapterLoop.createByJson({ Id: i.toString(), Code: "CH" + i, Description: "chapter" + i, DisplayOrder: i - 1 });
                    if (i <= 50) {
                        chapters.push(chapterLoop);
                    } else {
                        chapters2.push(chapterLoop);
                    }
                    chapterCode.push({ Id: chapterLoop.Id, Code: chapterLoop.Code, Description: chapterLoop.Description });
                    ids.push(chapterLoop.Id);
                }
                chapterList.specifyIds(ids);
                deferredLoadChapters.resolve(chapterCode);
                chapterList.loadNextPage();
                _deferred.resolve(new ap.services.apiHelper.ApiResponse(chapters));
                $rootScope.$apply();

                _deferred = $q.defer();
                _deferred.resolve(new ap.services.apiHelper.ApiResponse(chapters2));
                $rootScope.$apply();
                chapterList.actionClickedHandler("chapter.add");
            });
            it("THEN add new Chapter with displayOrder = 10054", () => {
                expect((<ap.viewmodels.projects.ChapterViewModel>chapterList.sourceItems[54]).originalEntity.IsNew).toBeTruthy();
                expect((<ap.viewmodels.projects.ChapterViewModel>chapterList.sourceItems[54]).displayOrder).toBe(10054);
            });
        });
    });

    describe("Item changed", () => {
        let _deferred: angular.IDeferred<any>;
        let chapterList: ChapterListVm;
        let deferredLoadChapters: angular.IDeferred<any>;

        beforeEach(() => {
            spyOn(ControllersManager.mainController, "currentProject").and.returnValue({
                Id: "12"
            });

            let chapters: ap.models.projects.Chapter[] = [];
            deferredLoadChapters = $q.defer();
            spyOn(ProjectService, "getProjectChapters").and.returnValue(deferredLoadChapters.promise);
            let chapterCode = [{ Id: "0", Code: "CH", Description: "chapter" }];

            let chapter: ap.models.projects.Chapter = new ap.models.projects.Chapter(Utility);
            chapter.createByJson({ Id: "0", Code: "CH", Description: "chapter", DisplayOrder: 1 });

            _deferred = $q.defer();
            spyOn(Api, "getEntityList").and.callFake(function () {
                return _deferred.promise;
            });
            chapterList = new ChapterListVm(Utility, $q, ControllersManager, ProjectService);
            spyOn(chapterList, "clear");
            spyOn(chapterList, "checkForDuplicatedItems");

            chapters.push(chapter);
            let ids: string[] = [chapter.Id];
            chapterList.specifyIds(ids);
            deferredLoadChapters.resolve(chapterCode);
            chapterList.loadNextPage();
            _deferred.resolve(new ap.services.apiHelper.ApiResponse(chapters));
            $rootScope.$apply();
        });

        describe("WHEN the description of an item is changed", () => {
            let chapterVm: ap.viewmodels.projects.ChapterViewModel;
            let callback: jasmine.Spy;

            beforeEach(() => {
                callback = jasmine.createSpy("callback");
                chapterList.on("hasChanged", callback, this);

                chapterVm = <ap.viewmodels.projects.ChapterViewModel>chapterList.getItemAtIndex(0);
                chapterVm.description = "blablabla";
            });
            it("THEN hasCHanged is updated", () => {
                expect(chapterList.hasChanged).toBeTruthy();
            });
            it("THEN haschanged is raised", () => {
                expect(callback).toHaveBeenCalled();
            });
        });

        describe("WHEN the code of an item is changed", () => {
            let chapterVm: ap.viewmodels.projects.ChapterViewModel;
            let callback: jasmine.Spy;

            beforeEach(() => {
                callback = jasmine.createSpy("callback");
                chapterList.on("hasChanged", callback, this);

                chapterVm = <ap.viewmodels.projects.ChapterViewModel>chapterList.getItemAtIndex(0);
                chapterVm.code = "blablabla";
            });
            it("THEN hasCHanged is updated", () => {
                expect(chapterList.hasChanged).toBeTruthy();
            });
            it("THEN checkForDuplicatedItems is called", () => {
                expect(chapterList.checkForDuplicatedItems).toHaveBeenCalledWith(chapterVm);
            });
            it("THEN haschanged is raised", () => {
                expect(callback).toHaveBeenCalled();
            });
        });
    });

    describe("chapterPropertyChanged", () => {

        beforeEach(() => {
            let _deferred: angular.IDeferred<any> = $q.defer();
            spyOn(Api, "getEntityList").and.returnValue(_deferred.promise);
            let deferredLoadChapters: angular.IDeferred<any> = $q.defer();
            vm = new ap.viewmodels.projects.ChapterListViewModel(Utility, $q, ControllersManager, ProjectService);

            spyOn((<ChapterListVm>vm), "checkForDuplicatedItems");

            let chapterViewModel: ap.viewmodels.projects.ChapterViewModel = new ap.viewmodels.projects.ChapterViewModel(Utility);
            let chapter: ap.models.projects.Chapter = new ap.models.projects.Chapter(Utility);
            chapter.createByJson({ Id: "0", Code: "CH1", Description: "chapter 1", DisplayOrder: 0 });
            chapterViewModel.init(chapter);

            let chapterViewModel2: ap.viewmodels.projects.ChapterViewModel = new ap.viewmodels.projects.ChapterViewModel(Utility);
            let chapter2: ap.models.projects.Chapter = new ap.models.projects.Chapter(Utility);
            chapter2.createByJson({ Id: "1", Code: "CH2", Description: "chapter 2", DisplayOrder: 1 });
            chapterViewModel2.init(chapter);

            spyOn(ProjectService, "getProjectChapters").and.returnValue(deferredLoadChapters.promise);
            vm.specifyIds(["0", "1"]);
            deferredLoadChapters.resolve(chapter);
            $rootScope.$apply();

            vm.loadNextPage();
            _deferred.resolve(new ap.services.apiHelper.ApiResponse([chapter, chapter2]));
            $rootScope.$apply();
        });
        describe("WHEN args.propretyName = code || description", () => {
            let callbackPropretyChanged: jasmine.Spy;
            beforeEach(() => {
                callbackPropretyChanged = jasmine.createSpy("callback");
                vm.on("propertychanged", callbackPropretyChanged, this);

                (<ap.viewmodels.projects.ChapterViewModel>vm.sourceItems[0]).code = "";
                (<ap.viewmodels.projects.ChapterViewModel>vm.sourceItems[0]).code = "newCode";
            });
            it("THEN, checkForDuplicatedItems is called", () => {
                expect((<ChapterListVm>vm).checkForDuplicatedItems).toHaveBeenCalled();
            });
            it("THEN, propertychanged is raised", () => {
                expect(callbackPropretyChanged).toHaveBeenCalled();
            });
        });
        describe("WHEN args.propretyName = isvalid", () => {
            let callbackPropretyChanged: jasmine.Spy;

            describe("WHEN the chapterViewModel is NOT valid", () => {
                beforeEach(() => {
                    callbackPropretyChanged = jasmine.createSpy("callback");
                    vm.on("propertychanged", callbackPropretyChanged, this);

                    (<ap.viewmodels.projects.ChapterViewModel>vm.sourceItems[0]).code = "newCode";
                    (<ap.viewmodels.projects.ChapterViewModel>vm.sourceItems[0]).code = "";
                });
                it("THEN, invalidItems.length = 1", () => {
                    expect(vm.isValid()).toBeFalsy();
                });
                it("THEN, propertychanged is raised", () => {
                    expect(callbackPropretyChanged).toHaveBeenCalled();
                });
            });
            describe("WHEN the chapterViewModel is valid", () => {
                beforeEach(() => {
                    callbackPropretyChanged = jasmine.createSpy("callback");
                    vm.on("propertychanged", callbackPropretyChanged, this);

                    (<ap.viewmodels.projects.ChapterViewModel>vm.sourceItems[0]).code = "";
                    (<ap.viewmodels.projects.ChapterViewModel>vm.sourceItems[0]).code = "newCodeBis";
                });
                it("THEN, invalidItems.length = 0", () => {
                    expect(vm.isValid()).toBeTruthy();
                });
                it("THEN, propertychanged is raised", () => {
                    expect(callbackPropretyChanged).toHaveBeenCalled();
                });
            });
            describe("WHEN the chapterViewModel is valid but there is stil a not valid item in the array", () => {
                beforeEach(() => {
                    callbackPropretyChanged = jasmine.createSpy("callback");
                    vm.on("propertychanged", callbackPropretyChanged, this);
                });
                it("invalideItems.length = 1 AND propretyChanged is raised", () => {
                    // FIRST, both vm are valid ->  invalidItems.length = 0 AND propertychanged is raised
                    (<ap.viewmodels.projects.ChapterViewModel>vm.sourceItems[0]).code = "newCode";
                    (<ap.viewmodels.projects.ChapterViewModel>vm.sourceItems[1]).code = "newCode2";
                    expect(vm.isValid()).toBeTruthy();
                    // THEN, both vm aren't valid ->  invalidItems.length = 2 AND propertychanged is raised
                    (<ap.viewmodels.projects.ChapterViewModel>vm.sourceItems[0]).code = "";
                    (<ap.viewmodels.projects.ChapterViewModel>vm.sourceItems[1]).code = "";
                    expect(vm.isValid()).toBeFalsy();
                    // FINALLY, one vm is set valid = true ->  invalidItems.length = 1 AND propertychanged is raised
                    (<ap.viewmodels.projects.ChapterViewModel>vm.sourceItems[1]).code = "newCode3";
                    expect(vm.isValid()).toBeFalsy();
                    expect(callbackPropretyChanged).toHaveBeenCalled();
                });
            });
        });
        describe("WHEN args.propretyName = delete", () => {
            describe("WHEN chapterVm is valid", () => {
                beforeEach(() => {
                    (<ap.viewmodels.projects.ChapterViewModel>vm.sourceItems[0]).actionClicked("chapter.delete");
                });
                it("THEN, invalidItems.length = 0", () => {
                    expect(vm.isValid()).toBeTruthy();
                });
            });
            describe("WHEN chapterVm is not valid", () => {
                beforeEach(() => {
                    (<ap.viewmodels.projects.ChapterViewModel>vm.sourceItems[0]).code = "";
                    (<ap.viewmodels.projects.ChapterViewModel>vm.sourceItems[0]).actionClicked("chapter.delete");
                });
                it("THEN, invalidItems.length = 0", () => {
                    expect(vm.isValid()).toBeTruthy();
                });
            });
        });
        describe("WHEN args.propretyName = undelete", () => {
            describe("WHEN chapterVm is valid", () => {
                beforeEach(() => {
                    (<ap.viewmodels.projects.ChapterViewModel>vm.sourceItems[0]).undoDelete();
                });
                it("THEN, invalidItems.length = 0", () => {
                    expect(vm.isValid()).toBeTruthy();
                });
            });
            describe("WHEN chapterVm is not valid", () => {
                beforeEach(() => {
                    (<ap.viewmodels.projects.ChapterViewModel>vm.sourceItems[0]).code = "";
                    (<ap.viewmodels.projects.ChapterViewModel>vm.sourceItems[0]).undoDelete();
                });
                it("THEN, invalidItems.length = 1", () => {
                    expect(vm.isValid()).toBeFalsy();
                });
            });
        });
        describe("WHEN args.propretyName = isChecked", () => {
            let callback: jasmine.Spy;
            beforeEach(() => {
                callback = jasmine.createSpy("callback");
                vm.on("itemchecked", callback, this);
                (<ap.viewmodels.projects.ChapterViewModel>vm.sourceItems[0]).isChecked = true;
            });
            it("THEN, itemchecked is raised", () => {
                expect(callback).toHaveBeenCalled();
            });
        });
    });

    describe("selectItem", () => {

        beforeEach(() => {
            let _deferred: angular.IDeferred<any> = $q.defer();
            spyOn(Api, "getEntityList").and.returnValue(_deferred.promise);
            let deferredLoadChapters: angular.IDeferred<any> = $q.defer();
            vm = new ap.viewmodels.projects.ChapterListViewModel(Utility, $q, ControllersManager, ProjectService);

            spyOn((<ChapterListVm>vm), "checkForDuplicatedItems");

            let chapterViewModel: ap.viewmodels.projects.ChapterViewModel = new ap.viewmodels.projects.ChapterViewModel(Utility);
            let chapter: ap.models.projects.Chapter = new ap.models.projects.Chapter(Utility);
            chapter.createByJson({ Id: "0", Code: "CH1", Description: "chapter 1", DisplayOrder: 0 });
            chapterViewModel.init(chapter);

            let chapterViewModel2: ap.viewmodels.projects.ChapterViewModel = new ap.viewmodels.projects.ChapterViewModel(Utility);
            let chapter2: ap.models.projects.Chapter = new ap.models.projects.Chapter(Utility);
            chapter2.createByJson({ Id: "1", Code: "CH2", Description: "chapter 2", DisplayOrder: 1 });
            chapterViewModel2.init(chapter);

            spyOn(ProjectService, "getProjectChapters").and.returnValue(deferredLoadChapters.promise);
            vm.specifyIds(["0", "1"]);
            deferredLoadChapters.resolve(chapter);
            $rootScope.$apply();

            vm.loadNextPage();
            _deferred.resolve(new ap.services.apiHelper.ApiResponse([chapter, chapter2]));
            $rootScope.$apply();
        });
        describe("WHEN selectItem is called and sourceItems have valid item", () => {
            beforeEach(() => {
                (<ap.viewmodels.projects.ChapterViewModel>vm.sourceItems[0]).code = 'asd';
                (<ap.viewmodels.projects.ChapterViewModel>vm.sourceItems[0]).description = 'asddsa';
            });
            it("THEN, selectItem return true", () => {
                expect(vm.selectItem(<ap.viewmodels.projects.ChapterViewModel>vm.sourceItems[0])).toBeTruthy();
            });
        });
        describe("WHEN selectItem is called and sourceItems have not valid item", () => {
            beforeEach(() => {
                (<ap.viewmodels.projects.ChapterViewModel>vm.sourceItems[0]).code = '';
                (<ap.viewmodels.projects.ChapterViewModel>vm.sourceItems[0]).description = '';
            });
            it("THEN, selectItem return false", () => {
                expect(vm.selectItem(<ap.viewmodels.projects.ChapterViewModel>vm.sourceItems[0])).toBeFalsy();
            });
        });
    });

    describe("Feature: updateItemsActionsState", () => {
        let _deferred: any;
        let chapterList: ChapterListVm;
        let chapters: ap.models.projects.Chapter[];
        let chapter: ap.models.projects.Chapter;
        let ids: string[];
        let chapterVM: ap.viewmodels.projects.ChapterViewModel;
        let args: ap.viewmodels.base.PropertyChangedEventArgs;
        beforeEach(() => {
            chapters = [];
            _deferred = $q.defer();
            let def = $q.defer();
            spyOn(ProjectService, "getProjectChapters").and.returnValue(def.promise);
            spyOn(Api, "getEntityList").and.returnValue(_deferred.promise);
            chapterList = new ChapterListVm(Utility, $q, ControllersManager, ProjectService);
            chapter = new ap.models.projects.Chapter(Utility);

            chapters.push(chapter);
            ids = [chapter.Id];
            chapterList.specifyIds(ids);
            chapterList.loadNextPage();
            _deferred.resolve(new ap.services.apiHelper.ApiResponse(chapters));
            $rootScope.$apply();
            chapterVM = <ap.viewmodels.projects.ChapterViewModel>chapterList.getItemAtIndex(0);
            chapterVM.code = "fdsdfdsf";
            chapterVM.description = "fdsdfdsf";
        });
        describe("WHEN call updateItemsActionsState with enabled is true", () => {
            beforeEach(() => {
                chapterVM.disableActions();
                chapterList.updateItemsActionsState(true);
            });
            it("THEN actions in items should be enabled", () => {
                expect(chapterVM.actions[0].isEnabled).toBeTruthy();
            });
        });
        describe("WHEN call updateItemsActionsState with enabled is false", () => {
            beforeEach(() => {
                chapterList.updateItemsActionsState(false);
            });
            it("THEN actions in items should be disabled", () => {
                expect(chapterVM.actions[0].isEnabled).toBeFalsy();
            });
        });
    });

    describe("Feature: clearInfo", () => {
        let chapterList: ChapterListVm;
        beforeEach(() => {
            chapterList = new ChapterListVm(Utility, $q, ControllersManager, ProjectService);
            let object: ap.viewmodels.projects.ChapterViewModel = new ap.viewmodels.projects.ChapterViewModel(Utility);
            let chapter = new ap.models.projects.Chapter(Utility);
            chapter.createByJson({ Id: "1" });
            object.init(chapter);
            chapterList.sourceItems = [object];
            chapterList.selectEntity("1");
            chapterList.clearInfo();
        });
        it("THEN selectedVm = null", () => {
            expect(chapterList.selectedViewModel).toEqual(null);
        });
    });

    describe("Feature: cancel", () => {

        let _deferred: any;
        let chapterList: ChapterListVm;
        let chapters: ap.models.projects.Chapter[];
        let chapter: ap.models.projects.Chapter;
        let ids: string[];
        let chapterVM: ap.viewmodels.projects.ChapterViewModel;
        let args: ap.viewmodels.base.PropertyChangedEventArgs;

        beforeEach(() => {
            chapters = [];
            _deferred = $q.defer();
            let def = $q.defer();
            spyOn(ProjectService, "getProjectChapters").and.returnValue(def.promise);
            spyOn(Api, "getEntityList").and.returnValue(_deferred.promise);
            chapterList = new ChapterListVm(Utility, $q, ControllersManager, ProjectService);
            chapter = new ap.models.projects.Chapter(Utility);

            chapters.push(chapter);
            ids = [chapter.Id];
            chapterList.specifyIds(ids);
            chapterList.loadNextPage();
            _deferred.resolve(new ap.services.apiHelper.ApiResponse(chapters));
            $rootScope.$apply();
            chapterList.valuesIdsDictionary[0].add(null, [chapter.Id]);
            chapterList.valuesIdsDictionary[1].add("BLABLABLA", [chapter.Id]);
            (<ap.viewmodels.projects.ChapterViewModel>chapterList.getItemAtIndex(0)).description = "blablabla";

            expect(chapterList.hasChanged).toBeTruthy();

        });

        describe("WHEN call updateItemsActionsState with enabled is true", () => {
            it("THEN actions in items should be enabled", () => {
                chapterList.cancel();
                expect(chapterList.hasChanged).toBeFalsy();
            });
        });
        describe("WHEN entities to delete are new", () => {
            let viewModelsToDelete: ap.viewmodels.projects.ChapterViewModel;
            beforeEach(() => {
                let chapter1 = new ap.models.projects.Chapter(Utility);
                let viewModelsToDelete = new ap.viewmodels.projects.ChapterViewModel(Utility);
                viewModelsToDelete.init(chapter1);
                viewModelsToDelete.code = "code";
                viewModelsToDelete.actionClicked("chapter.delete");
                chapterList.sourceItems = [viewModelsToDelete];
                chapterList.valuesIdsDictionary[0].add("CODE", [chapter1.Id]);
                chapterList.valuesIdsDictionary[1].add(null, [chapter1.Id]);
                chapterList.idValuesDictionary.add(chapter1.Id, null);
                spyOn(chapterList, "getChangedItems").and.returnValue([viewModelsToDelete]);
                chapterList.cancel();
            });
            it("THEN chapter is removed from source items", () => {
                expect(chapterList.sourceItems.indexOf(viewModelsToDelete)).toEqual(-1);
            });
        });
    });

    describe("Feature: element deleted", () => {

        let _deferred: any;
        let chapterList: ChapterListVm;
        let chapters: ap.models.projects.Chapter[];
        let chapter: ap.models.projects.Chapter;
        let ids: string[];
        let chapterVM: ap.viewmodels.projects.ChapterViewModel;
        let args: ap.viewmodels.base.PropertyChangedEventArgs;

        beforeEach(() => {
            chapters = [];
            let def = $q.defer();
            spyOn(ProjectService, "getProjectChapters").and.returnValue(def.promise);
            _deferred = $q.defer();
            spyOn(Api, "getEntityList").and.returnValue(_deferred.promise);
            chapterList = new ChapterListVm(Utility, $q, ControllersManager, ProjectService);
            chapter = new ap.models.projects.Chapter(Utility);
            
            chapters.push(chapter);
            ids = [chapter.Id];
            chapterList.specifyIds(ids);
            chapterList.loadNextPage();
            _deferred.resolve(new ap.services.apiHelper.ApiResponse(chapters));
            $rootScope.$apply();
            (<ap.viewmodels.projects.ChapterViewModel>chapterList.getItemAtIndex(0)).code = "";
        });

        describe("WHEN an element is marked deleted", () => {
            beforeEach(() => {
                chapter.createByJson({});
                (<ap.viewmodels.projects.ChapterViewModel>chapterList.getItemAtIndex(0)).actionClicked("chapter.delete");
            });
            it("THEN hasChanged is TRUE", () => {
                expect(chapterList.hasChanged).toBeTruthy();
            });
        });

        describe("WHEN an element is new and marked to delete", () => {
            beforeEach(() => {
                (<ap.viewmodels.projects.ChapterViewModel>chapterList.getItemAtIndex(0)).actionClicked("chapter.delete");
            });
            it("THEN hasChanged is FALSE", () => {
                expect(chapterList.hasChanged).toBeFalsy();
            });
        });
    });

    describe("Feature: insertItem", () => {
        let chapter: ap.models.projects.Chapter;
        let chapterVm: ap.viewmodels.projects.ChapterViewModel;
        let chapterList: ChapterListVm;

        beforeEach(() => {
            chapter = new ap.models.projects.Chapter(Utility);
            chapterVm = new ap.viewmodels.projects.ChapterViewModel(Utility);
            chapterVm.init(chapter);
            
            chapterList = new ChapterListVm(Utility, $q, ControllersManager, ProjectService);

            spyOn(Api, "getEntityList").and.returnValue($q.resolve({}));
            chapterList.specifyIds([]);
            chapterList.loadNextPage();

            spyOn(chapterList, "checkForDuplicatedItems").and.stub();
        });

        describe("WHEN a new chapter is inserted", () => {
            beforeEach(() => {
                chapterVm.code = "test-code";
                chapterVm.description = "test-description";
                chapterList.insertItem(0, chapterVm);
            });

            it("THEN the item is added to source items", () => {
                expect(chapterList.sourceItems.indexOf(chapterVm)).not.toEqual(-1);
            });

            it("THEN the list is marked as changed", () => {
                expect(chapterList.hasChanged).toBeTruthy();
            });

            it("THEN the item is checked for duplicates", () => {
                expect(chapterList.checkForDuplicatedItems).toHaveBeenCalledWith(chapterVm);
            });
        });
    });
});
