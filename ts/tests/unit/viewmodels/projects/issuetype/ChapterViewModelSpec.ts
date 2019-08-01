describe("Module ap-viewmodels - ChapterViewModel", () => {
    let $rootScope: angular.IRootScopeService, $scope: angular.IScope;
    let Utility: ap.utility.UtilityHelper, UserContext: ap.utility.UserContext;
    let vm: ap.viewmodels.projects.ChapterViewModel;
    let $q: angular.IQService;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });
    beforeEach(inject(function (_$rootScope_, _UserContext_, _Utility_, _$q_) {
        Utility = _Utility_;
        UserContext = _UserContext_;
        $rootScope = _$rootScope_;
        $q = _$q_;
        $scope = $rootScope.$new();
        specHelper.utility.stubRootUrl(Utility);
        specHelper.userContext.stub(Utility);
        specHelper.utility.stubStorageSet(Utility);
    }));

    describe("Constructor", () => {
        describe("WHEN ChapterViewModel is created", () => {
            it("THEN, the properties are filled with the default values", () => {
                vm = new ap.viewmodels.projects.ChapterViewModel(Utility);

                expect(vm.code).toBe("");
                expect(vm.description).toBe("");
                expect(vm.fullName).toBe("");
                expect(vm.displayOrder).toBe(0);
                expect(vm.isMarkedToDelete).toBeFalsy();
                expect(vm.actions.length).toEqual(2);
                expect(vm.actions[0].name).toEqual("chapter.insert");
                expect(vm.actions[1].name).toEqual("chapter.delete");
                expect(vm.isDuplicated).toBeFalsy();
                expect(vm.projectId).toBeNull();
            });
        });

        describe("WHEN ChapterViewModel is created with Chapter is null", () => {
            it("THEN, the properties are filled with the default values", () => {

                let chapter: ap.models.projects.Chapter;

                vm = new ap.viewmodels.projects.ChapterViewModel(Utility);
                vm.init(chapter);

                expect(vm.code).toBe("");
                expect(vm.description).toBe("");
                expect(vm.fullName).toBe("");
                expect(vm.displayOrder).toBe(0);
                expect(vm.isMarkedToDelete).toBeFalsy();
                expect(vm.actions.length).toEqual(2);
                expect(vm.actions[0].name).toEqual("chapter.insert");
                expect(vm.actions[1].name).toEqual("chapter.delete");
                expect(vm.projectId).toBeNull();
            });
        });

        describe("WHEN the isDuplicated property of the ChapterVM is changed", () => {
            it("THEN, the value is updated", () => {
                vm = new ap.viewmodels.projects.ChapterViewModel(Utility);
                vm.isDuplicated = true;
                expect(vm.isDuplicated).toBeTruthy();
            });
        });

        describe("WHEN ChapterViewModel is created with Chapter is not null", () => {
            it("THEN, the properties are filled with properties of Chapter", () => {

                let chapter: ap.models.projects.Chapter = new ap.models.projects.Chapter(Utility);
                chapter.Code = "Chapter1";
                chapter.Description = "ELECT";
                chapter.DisplayOrder = 10;
                chapter.ProjectId = "123456";

                vm = new ap.viewmodels.projects.ChapterViewModel(Utility);
                vm.init(chapter);

                expect(vm.code).toEqual("Chapter1");
                expect(vm.description).toEqual("ELECT");
                expect(vm.fullName).toEqual("[Chapter1] ELECT");
                expect(vm.displayOrder).toEqual(10);
                expect(vm.isMarkedToDelete).toBeFalsy();
                expect(vm.actions.length).toEqual(2);
                expect(vm.actions[0].name).toEqual("chapter.insert");
                expect(vm.actions[1].name).toEqual("chapter.delete");
                expect(vm.projectId).toEqual(chapter.ProjectId);
            });
        });

        describe("WHEN buildProperty is called", () => {
            let chapter: ap.models.projects.Chapter
            beforeEach(() => {
                chapter = new ap.models.projects.Chapter(Utility);
                chapter.Code = "Chapter";
                chapter.Description = "DescriptionChapter";
                chapter.DisplayOrder = 10;
                chapter.ProjectId = "1234";
            });
            describe("WHEN the originalEntity is null", () => {
                beforeEach(() => {
                    vm = new ap.viewmodels.projects.ChapterViewModel(Utility);
                    vm.buildProperty();
                });
                it("THEN, the properties of ChapterViewModel will be set by default", () => {
                    expect(vm.code).toEqual("");
                    expect(vm.description).toEqual("");
                    expect(vm.displayOrder).toEqual(0);
                });
            });
            describe("WHEN the originalEntity is NOT null", () => {
                beforeEach(() => {
                    vm = new ap.viewmodels.projects.ChapterViewModel(Utility);
                    vm.init(chapter);
                });
                it("THEN, the properties of ChapterViewModel will fill to properties of Chapter", () => {
                    expect(vm.code).toEqual("Chapter");
                    expect(vm.description).toEqual("DescriptionChapter");
                    expect(vm.displayOrder).toEqual(10);
                    expect(vm.projectId).toEqual(chapter.ProjectId);
                });
            });
        });

        describe("Feature set display order", () => {
            let args: ap.viewmodels.base.PropertyChangedEventArgs;
            let callbackPropretyChanged;
            beforeEach(() => {
                vm = new ap.viewmodels.projects.ChapterViewModel(Utility);
                callbackPropretyChanged = jasmine.createSpy("callback");
                args = new ap.viewmodels.base.PropertyChangedEventArgs("displayOrder", 0, vm);
                vm.on("propertychanged", callbackPropretyChanged, this);
                vm.displayOrder = 5;
            });
            it("THEN, displayOrder = newValue", () => {
                expect(vm.displayOrder).toEqual(5);
            });
            it("THEN, raisePropertyChanged is called with correct params", () => {
                expect(callbackPropretyChanged).toHaveBeenCalledWith(args);
            });
        });

        describe("WHEN postChanges is called", () => {
            let chapter: ap.models.projects.Chapter
            beforeEach(() => {
                chapter = new ap.models.projects.Chapter(Utility);
                chapter.Code = "Chapter";
                chapter.Description = "DescriptionChapter";
                chapter.DisplayOrder = 10;
            });
            describe("WHEN the originalEntity is NOT null", () => {
                beforeEach(() => {
                    vm = new ap.viewmodels.projects.ChapterViewModel(Utility);
                    vm.init(chapter);
                    vm.code = "C1";
                    vm.description = "ELECTAAA";
                    vm.displayOrder = 9;
                    vm.postChanges();
                });
                it("THEN, the properties of ChapterViewModel will fill to properties of Chapter", () => {
                    expect(vm.chapter.Code).toEqual("C1");
                    expect(vm.chapter.Description).toEqual("ELECTAAA");
                    expect(vm.chapter.DisplayOrder).toEqual(9);
                });
            });
        });
    });

    describe("WHEN hasChanged is called", () => {
        let chapterVm: ap.viewmodels.projects.ChapterViewModel;
        let originalEntity: ap.models.projects.Chapter;
        beforeEach(() => {
            chapterVm = new ap.viewmodels.projects.ChapterViewModel(Utility);
        });
        describe("WHEN the originalEntity.isNew = true", () => {
            beforeEach(() => {
                originalEntity = new ap.models.projects.Chapter(Utility);
                chapterVm.init(originalEntity);
            });
            it("THEN hasChanged return true", () => {
                expect(chapterVm.hasChanged).toBeTruthy();
            });
        });
        describe("WHEN the originalEntity.isNew = false", () => {
            describe("WHEN the originalEntity is the same", () => {
                beforeEach(() => {
                    originalEntity = new ap.models.projects.Chapter(Utility);
                    originalEntity.createByJson({ Code: "aaa" });
                    chapterVm.init(originalEntity);
                });
                it("THEN hasChanged return false", () => {
                    expect(chapterVm.hasChanged).toBeFalsy();
                });
            });
            describe("WHEN the originalEntity is not the same", () => {
                beforeEach(() => {
                    originalEntity = new ap.models.projects.Chapter(Utility);
                    originalEntity.createByJson({ Code: "aaa" });
                    chapterVm.init(originalEntity);
                    chapterVm.displayOrder = 1000;
                });
                it("THEN hasChanged return true", () => {
                    expect(chapterVm.hasChanged).toBeTruthy();
                });
            });
            describe("WHEN the originalEntity is markedToDelete", () => {
                beforeEach(() => {
                    originalEntity = new ap.models.projects.Chapter(Utility);
                    chapterVm.init(originalEntity);
                    chapterVm.isMarkedToDelete;
                });
                it("THEN hasChanged return true", () => {
                    expect(chapterVm.hasChanged).toBeTruthy();
                });
            });
        });
    });

    describe("Feature: actionClicked", () => {
        let callback;
        beforeEach(() => {
            callback = jasmine.createSpy("callback");
            vm = new ap.viewmodels.projects.ChapterViewModel(Utility);
        });
        describe("WHEN, actionCliked is called with param = chapter.insert ", () => {
            beforeEach(() => {
                vm.on("insertrowrequested", callback, this);
                vm.actionClicked("chapter.insert");
            });
            it("THEN, event insertrowrequested is raised", () => {
                expect(callback).toHaveBeenCalledWith(vm);
            });
        });
        describe("WHEN, actionCliked is called with param = chapter.delete ", () => {
            beforeEach(() => {
                vm.on("propertychanged", callback, this);
                vm.actionClicked("chapter.delete");
            });
            it("THEN, isMarkedToDelete = true", () => {
                expect(vm.isMarkedToDelete).toBeTruthy();
            });
            it("THEN, isVisible = false", () => {
                expect(vm.actions[1].isVisible).toBeFalsy();
            });
            it("THEN, event delete is raised", () => {
                expect(callback).toHaveBeenCalled();
            });
        });
    });

    describe("Feature: undoDelete", () => {
        let callback;
        beforeEach(() => {
            callback = jasmine.createSpy("callback");
            vm = new ap.viewmodels.projects.ChapterViewModel(Utility);
        });
        describe("WHEN, undoDelete is called", () => {
            beforeEach(() => {
                vm.on("propertychanged", callback, this);
                vm.undoDelete();
            });
            it("THEN, isMarkedToDelete = false", () => {
                expect(vm.isMarkedToDelete).toBeFalsy();
            });
            it("THEN, isVisible = true", () => {
                expect(vm.actions[1].isVisible).toBeTruthy();
            });
            it("THEN, event undelete is raised", () => {
                expect(callback).toHaveBeenCalled();
            });
        });
    });

    describe("Feature: disableActions", () => {
        beforeEach(() => {
            vm = new ap.viewmodels.projects.ChapterViewModel(Utility);
        });
        describe("WHEN call disableActions ", () => {
            beforeEach(() => {
                vm.disableActions();
            });
            it("THEN action is disabled", () => {
                expect(vm.actions[0].isEnabled).toBeFalsy();
                expect(vm.actions[1].isEnabled).toBeFalsy();
            });
        })
    });
    describe("Feature: enableActions", () => {
        beforeEach(() => {
            vm = new ap.viewmodels.projects.ChapterViewModel(Utility);
        });
        describe("WHEN call disableActions after disableActions called", () => {
            beforeEach(() => {
                vm.disableActions();
                vm.enableActions();
            });
            it("THEN action is enabled", () => {
                expect(vm.actions[0].isEnabled).toBeTruthy();
                expect(vm.actions[1].isEnabled).toBeTruthy();
            });
        })
    });
});