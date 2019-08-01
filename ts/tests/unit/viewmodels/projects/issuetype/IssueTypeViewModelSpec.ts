describe("Module ap-viewmodels - IssueTypeViewModel", () => {
    let $rootScope: angular.IRootScopeService, $scope: angular.IScope;
    let Utility: ap.utility.UtilityHelper, UserContext: ap.utility.UserContext;
    let vm: ap.viewmodels.projects.IssueTypeViewModel;
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
        describe("WHEN IssueTypeViewModel is created", () => {
            it("THEN, the properties are filled with the default values", () => {
                vm = new ap.viewmodels.projects.IssueTypeViewModel(Utility);

                expect(vm.code).toBe("");
                expect(vm.description).toBe("");
                expect(vm.fullName).toBe("");
                expect(vm.displayOrder).toBe(0);
                expect(vm.chapterViewModel).toBeNull();
                expect(vm.isMarkedToDelete).toBeFalsy();
                expect(vm.actions.length).toEqual(2);
                expect(vm.actions[0].name).toEqual("issuetype.insert");
                expect(vm.actions[1].name).toEqual("issuetype.delete");
            });
        });

        describe("WHEN IssueTypeViewModel is created with IssueType is null", () => {
            it("THEN, the properties are filled with the default values", () => {

                let issueType: ap.models.projects.IssueType;

                vm = new ap.viewmodels.projects.IssueTypeViewModel(Utility);
                vm.init(issueType);

                expect(vm.code).toBe("");
                expect(vm.description).toBe("");
                expect(vm.fullName).toBe("");
                expect(vm.displayOrder).toBe(0);
                expect(vm.chapterViewModel).toBeNull();
                expect(vm.isMarkedToDelete).toBeFalsy();
                expect(vm.actions.length).toEqual(2);
                expect(vm.actions[0].name).toEqual("issuetype.insert");
                expect(vm.actions[1].name).toEqual("issuetype.delete");
            });
          
        });

        describe("WHEN IssueTypeViewModel is created with IssueType and parent chapter are defined", () => {
            it("THEN, the properties are filled with properties of IssueType and parent chapter", () => {

                let issueType: ap.models.projects.IssueType = new ap.models.projects.IssueType(Utility);
                issueType.Code = "CON";
                issueType.Description = "Conrecte";
                issueType.DisplayOrder = 3;
                issueType.ParentChapter = new ap.models.projects.Chapter(Utility);
                issueType.ParentChapter.Code = "Chapter1";
                issueType.ParentChapter.Description = "ELECT";

                vm = new ap.viewmodels.projects.IssueTypeViewModel(Utility);
                vm.init(issueType);

                expect(vm.code).toBe("CON");
                expect(vm.description).toBe("Conrecte");
                expect(vm.fullName).toBe("[CON] Conrecte");
                expect(vm.displayOrder).toBe(3);
                expect(vm.chapterViewModel.chapter).toBe(issueType.ParentChapter);
                expect(vm.isMarkedToDelete).toBeFalsy();
                expect(vm.actions.length).toEqual(2);
                expect(vm.actions[0].name).toEqual("issuetype.insert");
                expect(vm.actions[1].name).toEqual("issuetype.delete");
            });
        });

        describe("WHEN IssueTypeViewModel is created with IssueType and without parent chapter", () => {
            it("THEN, the properties are filled with properties of IssueType and chapterViewModel is null", () => {

                let issueType: ap.models.projects.IssueType = new ap.models.projects.IssueType(Utility);
                issueType.ParentChapter = null;

                vm = new ap.viewmodels.projects.IssueTypeViewModel(Utility);
                vm.init(issueType);

                expect(vm.code).toEqual(issueType.Code);
                expect(vm.description).toEqual(issueType.Description);
                expect(vm.displayOrder).toEqual(issueType.DisplayOrder);
                expect(vm.chapterViewModel).toBeNull();
                expect(vm.isMarkedToDelete).toBeFalsy();
                expect(vm.actions.length).toEqual(2);
                expect(vm.actions[0].name).toEqual("issuetype.insert");
                expect(vm.actions[1].name).toEqual("issuetype.delete");
            });
        });
        
        describe("WHEN postChanges is called with ParentChapter is defined", () => {
            let issueType: ap.models.projects.IssueType;
            beforeEach(() => {
                issueType = new ap.models.projects.IssueType(Utility);
                issueType.Code = "CodeIssueType";
                issueType.Description = "DescriptionIssueType";
                issueType.DisplayOrder = 10;
                issueType.ParentChapter = new ap.models.projects.Chapter(Utility);
                issueType.ParentChapter.Code = "Chapter1";
                issueType.ParentChapter.Description = "ELECT";
                issueType.ParentChapter.DisplayOrder = 2;
            });
            describe("WHEN the originalEntity is not null", () => {
                beforeEach(() => {
                    vm = new ap.viewmodels.projects.IssueTypeViewModel(Utility);
                    vm.init(issueType);
                    vm.code = "Con1";
                    vm.description = "Conrecte111";
                    vm.displayOrder = 5;
                    vm.chapterViewModel.code = "CodeChapter";
                    vm.chapterViewModel.description = "DescriptionChapter";
                    vm.postChanges();
                });
                it("THEN, the properties of IssueType will be fill by properties IssueTypeViewModel but parentChapter of issuetype no change", () => {
                    expect(issueType.Code).toEqual("Con1");
                    expect(issueType.Description).toEqual("Conrecte111");
                    expect(issueType.DisplayOrder).toEqual(5);
                    expect(issueType.ParentChapter).toBe(issueType.ParentChapter);
                });
            });
        });
    });
    describe("Feature set display order", () => {
        let args: ap.viewmodels.base.PropertyChangedEventArgs;
        let callbackPropretyChanged;
        beforeEach(() => {
            vm = new ap.viewmodels.projects.IssueTypeViewModel(Utility);
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
    describe("WHEN hasChanged is called", () => {
        let issueTypeVm: ap.viewmodels.projects.IssueTypeViewModel;
        let originalEntity: ap.models.projects.IssueType;
        beforeEach(() => {
            issueTypeVm = new ap.viewmodels.projects.IssueTypeViewModel(Utility);
        });
        describe("WHEN the originalEntity.isNew = true", () => {
            beforeEach(() => {
                originalEntity = new ap.models.projects.IssueType(Utility);
                issueTypeVm.init(originalEntity);
            });
            it("THEN hasChanged return true", () => {
                expect(issueTypeVm.hasChanged).toBeTruthy();
            });
        });
        describe("WHEN the originalEntity.isNew = false", () => {
            describe("WHEN the originalEntity is the same", () => {
                beforeEach(() => {
                    originalEntity = new ap.models.projects.IssueType(Utility);
                    originalEntity.createByJson({ Code: "aaa" });
                    issueTypeVm.init(originalEntity);
                });
                it("THEN hasChanged return false", () => {
                    expect(issueTypeVm.hasChanged).toBeFalsy();
                });
            });
            describe("WHEN the originalEntity is not the same", () => {
                beforeEach(() => {
                    originalEntity = new ap.models.projects.IssueType(Utility);
                    originalEntity.createByJson({ Code: "aaa" });
                    issueTypeVm.init(originalEntity);
                    issueTypeVm.displayOrder = 1000;
                });
                it("THEN hasChanged return true", () => {
                    expect(issueTypeVm.hasChanged).toBeTruthy();
                });
            });
            describe("WHEN the originalEntity is markedToDelete", () => {
                beforeEach(() => {
                    originalEntity = new ap.models.projects.IssueType(Utility);
                    issueTypeVm.init(originalEntity);
                    issueTypeVm.isMarkedToDelete;
                });
                it("THEN hasChanged return true", () => {
                    expect(issueTypeVm.hasChanged).toBeTruthy();
                });
            });
        });
    });

    describe("Feature: actionClicked", () => {
        let callback;
        beforeEach(() => {
            callback = jasmine.createSpy("callback");
            vm = new ap.viewmodels.projects.IssueTypeViewModel(Utility);
        });
        describe("WHEN, actionCliked is called with param = issuetype.insert ", () => {
            beforeEach(() => {
                vm.on("insertrowrequested", callback, this);
                vm.actionClicked("issuetype.insert");
            });
            it("THEN, event insertrowrequested is raised", () => {
                expect(callback).toHaveBeenCalledWith(vm);
            });
        });
        describe("WHEN, actionCliked is called with param = issuetype.delete ", () => {
            beforeEach(() => {
                vm.on("propertychanged", callback, this);
                vm.actionClicked("issuetype.delete");
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
            vm = new ap.viewmodels.projects.IssueTypeViewModel(Utility);
            vm.on("propertychanged", callback, this);
        });
        describe("WHEN, undoDelete is called", () => {
            beforeEach(() => {
                vm.undoDelete();
            });
            it("THEN, isMarkedToDelete = false", () => {
                expect(vm.isMarkedToDelete).toBeFalsy();
            });
            it("THEN, isVisible = true", () => {
                expect(vm.actions[1].isVisible).toBeTruthy();
            });
            it("THEN, event delete is raised", () => {
                expect(callback).toHaveBeenCalled();
            });
        });
    });

    describe("Feature: disableActions", () => {
        beforeEach(() => {
            vm = new ap.viewmodels.projects.IssueTypeViewModel(Utility);
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
            vm = new ap.viewmodels.projects.IssueTypeViewModel(Utility);
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