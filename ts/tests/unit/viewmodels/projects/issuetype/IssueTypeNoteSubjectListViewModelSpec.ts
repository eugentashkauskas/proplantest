describe("Module ap-viewmodels - IssueTypeNoteSubjectListViewModel", () => {
    let Utility: ap.utility.UtilityHelper;
    let MainController: ap.controllers.MainController;
    let ControllersManager: ap.controllers.ControllersManager;
    let issueType: ap.viewmodels.projects.IssueTypeViewModel;
    let vm: ap.viewmodels.projects.IssueTypeNoteSubjectListViewModel;

    let $q: angular.IQService;
    let $rootScope: angular.IRootScopeService;
    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject(function (_Utility_, _MainController_, _$q_, _$rootScope_, _ControllersManager_) {
        Utility = _Utility_;
        MainController = _MainController_;
        ControllersManager = _ControllersManager_;
        $q = _$q_;
        $rootScope = _$rootScope_;

    }));
    describe("Factory: IssueTypeNoteSubjectListViewModel", () => {
        let subjects: ap.models.projects.IssueTypeNoteSubject[];
        let defGetSubject: angular.IDeferred<ap.models.projects.IssueTypeNoteSubject[]>;
        beforeEach(() => {
            defGetSubject = $q.defer();
            subjects = [];
            let issueTypeEntity = new ap.models.projects.IssueType(Utility);
            let subject1: ap.models.projects.IssueTypeNoteSubject = new ap.models.projects.IssueTypeNoteSubject(Utility);
            subject1.createByJson({
                Id: "S1",
                Subject: "S1",
                DisplayOrder: 1,
                IssueType: issueTypeEntity
            });

            let subject2: ap.models.projects.IssueTypeNoteSubject = new ap.models.projects.IssueTypeNoteSubject(Utility);
            subject2.createByJson({
                Id: "S2",
                Subject: "S2",
                DisplayOrder: 2,
                IssueType: issueTypeEntity
            });
            subjects.push(subject1);
            subjects.push(subject2);
            vm = new ap.viewmodels.projects.IssueTypeNoteSubjectListViewModel(Utility, $q, ControllersManager);
            issueType = new ap.viewmodels.projects.IssueTypeViewModel(Utility);
            issueType.chapterViewModel = new ap.viewmodels.projects.ChapterViewModel(Utility);
            vm.parentIsssueTypeVm = issueType;
        });

        describe("Feature: constructor", () => {
            describe("WHEN i request to create the IssueTypeNoteSubjectListViewModel", () => {
                beforeEach(() => {
                });
                it("THEN, the vm will created with default values", () => {
                    expect(vm).toBeDefined();
                    expect(vm.issueTypeId).toBeNull();
                    expect(vm.entityName).toEqual("IssueTypeNoteSubject");
                    expect(vm.sortOrder).toEqual("DisplayOrder");
                    expect(vm.pathToLoad).toBeNull();
                    expect(vm.defaultFilter).toBeNull();
                });
            });
        });

        describe("Feature load method", () => {
            beforeEach(() => {
                spyOn(ControllersManager.projectController, "getIssueTypeNoteSubject").and.returnValue(defGetSubject.promise);
                vm.issueTypeId = "I1";
            });

            describe(" WHEN the load method is called with without the idToSelect ", () => {
                beforeEach(() => {

                    spyOn(vm, "onLoadItems").and.callThrough();
                    spyOn(vm, "selectEntity").and.callThrough();

                    vm.load();
                    defGetSubject.resolve(subjects);
                    $rootScope.$apply();
                });
                it("THEN, the ProjectController.getIssueTypeNoteSubject will be called", () => {
                    expect(ControllersManager.projectController.getIssueTypeNoteSubject).toHaveBeenCalledWith("I1", true, true);
                });

                it("THEN, the onLoadItems method will be call", () => {
                    expect(vm.onLoadItems).toHaveBeenCalled();
                });

                it("THEN, the selectEntity is not called to have at least on entity selected", () => {
                    expect(vm.selectEntity).not.toHaveBeenCalled();
                });
            });
            describe(" WHEN 'load' method is called with the 'idToSelect' ", () => {
                beforeEach(() => {
                    spyOn(vm, "onLoadItems").and.callThrough();
                    spyOn(vm, "selectEntity").and.callThrough();

                    vm.load("S2");
                    defGetSubject.resolve(subjects);
                    $rootScope.$apply();
                });
                it("THEN, the ProjectController.getIssueTypeNoteSubject will be called", () => {
                    expect(ControllersManager.projectController.getIssueTypeNoteSubject).toHaveBeenCalledWith("I1", true, true);
                });

                it("THEN, the onLoadItems method will be call with the list vm", () => {
                    expect(vm.onLoadItems).toHaveBeenCalled();
                });
                it("THEN, the selectEntity method will be call with the idToSelect", () => {
                    expect(vm.selectEntity).toHaveBeenCalledWith("S2");
                });
            });
        });

        describe("Feature issueTypeId setter", () => {
            beforeEach(() => {
                spyOn(vm, "clear");
                let def = $q.defer();
                spyOn(vm, "load").and.returnValue(def.promise);
            });
            describe("WHEN i set issueTypeId at the first time the data have not loaded", () => {
                beforeEach(() => {
                    specHelper.general.spyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "isLoaded", specHelper.PropertyAccessor.Get).and.returnValue(false);
                    vm.issueTypeId = "I1";
                });
                afterEach(() => {
                    specHelper.general.offSpyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "isLoaded", specHelper.PropertyAccessor.Get);
                });
                it("THEN, the issueTypeId value is updated", () => {
                    expect(vm.issueTypeId).toEqual("I1");
                });
                it("AND THEN, the load method will not called", () => {
                    expect(vm.load).not.toHaveBeenCalled();
                });
            });
            describe("WHEN i set issueTypeId and the data have been loaded", () => {
                beforeEach(() => {
                    specHelper.general.spyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "isLoaded", specHelper.PropertyAccessor.Get).and.returnValue(true);
                    vm.issueTypeId = "I2";
                });
                afterEach(() => {
                    specHelper.general.offSpyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "isLoaded", specHelper.PropertyAccessor.Get);
                });
                it("THEN, the issueTypeId value is updated", () => {
                    expect(vm.issueTypeId).toEqual("I2");
                });
                it("AND THEN, the load method will be called", () => {
                    expect(vm.load).toHaveBeenCalled();
                });
            });
        });

        describe("Feature useCacheSystem", () => {
            beforeEach(() => {
                spyOn(ControllersManager.projectController, "getIssueTypeNoteSubject").and.returnValue(defGetSubject.promise);
                vm.issueTypeId = "I1";
            });
            describe("WHEN useCacheSystem = false and load method is called at the second time", () => {
                beforeEach(() => {
                    vm.load();
                    defGetSubject.resolve(subjects);
                    $rootScope.$apply();
                });
                it("THEN, the getIssueTypeNoteSubject will be called", () => {
                    vm.load();
                    $rootScope.$apply();
                    expect((<jasmine.Spy>ControllersManager.projectController.getIssueTypeNoteSubject).calls.count()).toBe(2);
                });
            });

            describe("WHEN useCacheSystem = true and load method is called at the second time", () => {
                beforeEach(() => {
                    vm.useCacheSystem = true;
                    vm.load();
                    defGetSubject.resolve(subjects);
                    $rootScope.$apply();
                });
                it("THEN, the getIssueTypeNoteSubject will not be called", () => {
                    vm.load();
                    $rootScope.$apply();
                    expect((<jasmine.Spy>ControllersManager.projectController.getIssueTypeNoteSubject).calls.count()).toBe(1);
                });
                it("WHEN i try to modify the item viewmdoel and load again, the modification will be keep", () => {
                    let itemVM: ap.viewmodels.projects.IssueTypeNoteSubjectViewModel = <ap.viewmodels.projects.IssueTypeNoteSubjectViewModel>vm.sourceItems[0];
                    itemVM.subject = "New Subject";

                    vm.load();
                    $rootScope.$apply();

                    let newItemVM: ap.viewmodels.projects.IssueTypeNoteSubjectViewModel = <ap.viewmodels.projects.IssueTypeNoteSubjectViewModel>vm.sourceItems[0];
                    expect(newItemVM).toEqual(itemVM);
                });
                it("WHEN i set useCacheSystem = false and load again, the getIssueTypeNoteSubject will be call and the modification will be lost", () => {

                    let itemVM: ap.viewmodels.projects.IssueTypeNoteSubjectViewModel = <ap.viewmodels.projects.IssueTypeNoteSubjectViewModel>vm.sourceItems[0];
                    itemVM.subject = "New Subject";

                    vm.useCacheSystem = false;

                    vm.load();

                    $rootScope.$apply();

                    expect((<jasmine.Spy>ControllersManager.projectController.getIssueTypeNoteSubject).calls.count()).toBe(2);
                    let newItemVM: ap.viewmodels.projects.IssueTypeNoteSubjectViewModel = <ap.viewmodels.projects.IssueTypeNoteSubjectViewModel>vm.sourceItems[0];
                    expect(newItemVM.subject).toEqual("S1");

                });
            });

        });

        describe("Feature: addIntoCache", () => {
            let cachedViewModels: Dictionary<string, ap.viewmodels.projects.IssueTypeNoteSubjectViewModel[]>;

            beforeEach(() => {
                cachedViewModels = new Dictionary<string, ap.viewmodels.projects.IssueTypeNoteSubjectViewModel[]>();

                let entityViewModel = new ap.viewmodels.projects.IssueTypeNoteSubjectViewModel(Utility);
                cachedViewModels.add("test-id", [entityViewModel]);
            });

            describe("WHEN useCacheSystem = false", () => {
                beforeEach(() => {
                    vm.useCacheSystem = false;
                });

                it("THEN an exception is thrown", () => {
                    expect(() => {
                        vm.addIntoCache(cachedViewModels);
                    }).toThrowError("Caching is disabled for this list view model");
                });
            });

            describe("WHEN useCacheSystem = true", () => {
                beforeEach(() => {
                    spyOn(ControllersManager.projectController, "getIssueTypeNoteSubject").and.returnValue(defGetSubject.promise);

                    vm.useCacheSystem = true;
                    vm.addIntoCache(cachedViewModels);
                    vm.issueTypeId = "test-id";
                    vm.load();
                });

                it("THEN the given entity is added to the cache", () => {
                    expect(ControllersManager.projectController.getIssueTypeNoteSubject).not.toHaveBeenCalled();
                });
            });
        });

        describe("Item actions", () => {
            let _deferred: any;
            let noteSubjectList: ap.viewmodels.projects.IssueTypeNoteSubjectListViewModel;
            beforeEach(() => {
                _deferred = $q.defer();
                spyOn(ControllersManager.projectController, "getIssueTypeNoteSubject").and.returnValue(_deferred.promise);
                noteSubjectList = new ap.viewmodels.projects.IssueTypeNoteSubjectListViewModel(Utility, $q, ControllersManager);
                let parentVm = new ap.viewmodels.projects.IssueTypeViewModel(Utility);
                parentVm.init(new ap.models.projects.IssueType(Utility));
                noteSubjectList.parentIsssueTypeVm = parentVm;
            });
            describe("WHEN, Item action raise insertrowrequested", () => {

                beforeEach(() => {
                    noteSubjectList.load();
                    _deferred.resolve(subjects);
                    $rootScope.$apply();

                    specHelper.general.raiseEvent(noteSubjectList.getItemAtIndex(0), "insertrowrequested", noteSubjectList.getItemAtIndex(0));

                });
                it("THEN, there is 3 items (add one)", () => {
                    expect(noteSubjectList.count).toEqual(3);
                });

                it("THEN, the item #2 is new entity", () => {
                    let noteSubjectVM = <ap.viewmodels.projects.IssueTypeNoteSubjectViewModel>noteSubjectList.getItemAtIndex(1);
                    expect(noteSubjectVM.issueTypeNoteSubject.IsNew).toBeTruthy();
                });
            });
        });

        describe("Feature: itemPropertyChanged", () => {
            beforeEach(() => {
                spyOn(ControllersManager.projectController, "getIssueTypeNoteSubject").and.returnValue(defGetSubject.promise);
                vm.issueTypeId = "I1";
                vm.load();
                defGetSubject.resolve(subjects);
                $rootScope.$apply();
            });
            describe("WHEN args.propretyName = subject", () => {
                let callbackPropretyChanged: jasmine.Spy;
                beforeEach(() => {
                    callbackPropretyChanged = jasmine.createSpy("callback");
                    vm.on("hasChanged", callbackPropretyChanged, this);

                    (<ap.viewmodels.projects.IssueTypeNoteSubjectViewModel>vm.sourceItems[0]).subject = "";
                    (<ap.viewmodels.projects.IssueTypeNoteSubjectViewModel>vm.sourceItems[0]).subject = "newSubject";
                });
                it("THEN, hasChanged is raised", () => {
                    expect(callbackPropretyChanged).toHaveBeenCalled();
                });
            });
            describe("WHEN args.propretyName = delete", () => {
                describe("WHEN noteSubjectVm is valid", () => {
                    beforeEach(() => {
                        (<ap.viewmodels.projects.IssueTypeNoteSubjectViewModel>vm.sourceItems[0]).subject = "newSubject";
                        (<ap.viewmodels.projects.IssueTypeNoteSubjectViewModel>vm.sourceItems[0]).actionClicked("notesubject.delete");
                    });
                    it("THEN, invalidItems.length = 0", () => {
                        expect(vm.isValid).toBeTruthy();
                    });
                });
                describe("WHEN noteSubjectVm is not valid", () => {
                    beforeEach(() => {
                        (<ap.viewmodels.projects.IssueTypeNoteSubjectViewModel>vm.sourceItems[0]).subject = "";
                        (<ap.viewmodels.projects.IssueTypeNoteSubjectViewModel>vm.sourceItems[0]).actionClicked("notesubject.delete");
                    });
                    it("THEN, invalidItems.length = 0", () => {
                        expect(vm.isValid).toBeTruthy();
                    });
                });
            });
            describe("WHEN args.propretyName = undelete", () => {
                describe("WHEN noteSubjectVm is valid", () => {
                    beforeEach(() => {
                        (<ap.viewmodels.projects.IssueTypeNoteSubjectViewModel>vm.sourceItems[0]).subject = "newSubject";
                        (<ap.viewmodels.projects.IssueTypeNoteSubjectViewModel>vm.sourceItems[0]).undoDelete();
                    });
                    it("THEN, invalidItems.length = 0", () => {
                        expect(vm.isValid).toBeTruthy();
                    });
                });
                describe("WHEN noteSubjectVm is not valid", () => {
                    beforeEach(() => {
                        (<ap.viewmodels.projects.IssueTypeNoteSubjectViewModel>vm.sourceItems[0]).subject = "";
                        (<ap.viewmodels.projects.IssueTypeNoteSubjectViewModel>vm.sourceItems[0]).undoDelete();
                    });
                    it("THEN, invalidItems.length = 1", () => {
                        expect(vm.isValid).toBeFalsy();
                    });
                });
            });
            describe("WHEN args.propretyName = isChecked", () => {
                let callback: jasmine.Spy;
                beforeEach(() => {
                    callback = jasmine.createSpy("callback");
                    vm.on("itemchecked", callback, this);
                    (<ap.viewmodels.projects.IssueTypeNoteSubjectViewModel>vm.sourceItems[0]).isChecked = true;
                });
                it("THEN, itemchecked is raised", () => {
                    expect(callback).toHaveBeenCalled();
                });
            });
        });

        describe("Feature: postChange", () => {
            let noteSubjectList: ap.viewmodels.projects.IssueTypeNoteSubjectListViewModel;
            let viewModelsToDelete: ap.viewmodels.projects.IssueTypeNoteSubjectViewModel;
            let viewModelsToUpdate: ap.viewmodels.projects.IssueTypeNoteSubjectViewModel;
            let noteSubject1: ap.models.projects.IssueTypeNoteSubject;
            let noteSubject2: ap.models.projects.IssueTypeNoteSubject;
            let projectPunchList: ap.models.custom.ProjectPunchlists;
            let project: ap.models.projects.Project;
            beforeEach(() => {
                project = new ap.models.projects.Project(Utility);
                spyOn(ControllersManager.mainController, "currentProject").and.returnValue(project);
                noteSubject1 = new ap.models.projects.IssueTypeNoteSubject(Utility);
                noteSubject1.createByJson({ Id: "12345", Deleted: true });
                noteSubject2 = new ap.models.projects.IssueTypeNoteSubject(Utility);
                noteSubject2.createByJson({ Id: "56789" });
                noteSubjectList = new ap.viewmodels.projects.IssueTypeNoteSubjectListViewModel(Utility, $q, ControllersManager);
                projectPunchList = new ap.models.custom.ProjectPunchlists(Utility, project.Id);
                viewModelsToDelete = new ap.viewmodels.projects.IssueTypeNoteSubjectViewModel(Utility);
                viewModelsToDelete.init(noteSubject1);
                viewModelsToDelete.actionClicked("notesubject.delete");
                viewModelsToUpdate = new ap.viewmodels.projects.IssueTypeNoteSubjectViewModel(Utility);
                viewModelsToUpdate.init(noteSubject2);
                viewModelsToUpdate.displayOrder = 8;
                viewModelsToDelete.issueTypeViewModel = issueType;
                viewModelsToUpdate.issueTypeViewModel = issueType;
                spyOn(viewModelsToUpdate, "postChanges");
            });
            describe("WHEN postChange is called with entity to delete and update", () => {
                describe("WHEN entities are not new", () => {
                    beforeEach(() => {
                        projectPunchList.NoteSubjectsToDelete.push(viewModelsToDelete.originalEntity.Id);
                        projectPunchList.NoteSubjectsToUpdate.push(<ap.models.projects.IssueTypeNoteSubject>viewModelsToUpdate.originalEntity);
                        spyOn(noteSubjectList, "getChangedItems").and.returnValue([viewModelsToDelete, viewModelsToUpdate]);
                    });
                    it("THEN ProjectPunchlists.NoteSubjectsToDelete is not empty", () => {
                        expect(noteSubjectList.postChange()).toEqual(projectPunchList);
                    });
                    it("THEN ProjectPunchList.NoteSubjectsToUpdate is not empty", () => {
                        expect(noteSubjectList.postChange()).toEqual(projectPunchList);
                    });
                });
                describe("WHEN entities are new", () => {
                    beforeEach(() => {
                        noteSubject1 = new ap.models.projects.IssueTypeNoteSubject(Utility);
                        viewModelsToDelete = new ap.viewmodels.projects.IssueTypeNoteSubjectViewModel(Utility);
                        viewModelsToDelete.init(noteSubject1);
                        viewModelsToDelete.actionClicked("notesubject.delete");
                        projectPunchList.NoteSubjectsToDelete.push(viewModelsToDelete.originalEntity.Id);
                        spyOn(noteSubjectList, "getChangedItems").and.returnValue([viewModelsToDelete]);
                        noteSubjectList.sourceItems = [viewModelsToDelete];
                        noteSubjectList.postChange();
                    });
                    it("THEN noteSubject is removed from source items", () => {
                        expect(noteSubjectList.sourceItems.indexOf(viewModelsToDelete)).toEqual(-1);
                    });
                });
                describe("WHEN entities are new and cached", () => {
                    beforeEach(() => {
                        noteSubjectList.sourceItems = [];

                        spyOn(ControllersManager.projectController, "getIssueTypeNoteSubject").and.returnValue($q.resolve({}));

                        let issueType = new ap.models.projects.IssueType(Utility);
                        issueType.createByJson({ Id: "test-issue-type-id" });

                        noteSubject1 = new ap.models.projects.IssueTypeNoteSubject(Utility);
                        noteSubject1.IssueType = issueType;

                        viewModelsToDelete = new ap.viewmodels.projects.IssueTypeNoteSubjectViewModel(Utility);
                        viewModelsToDelete.init(noteSubject1);
                        viewModelsToDelete.copySource();

                        let cachedItems = new Dictionary<string, ap.viewmodels.projects.IssueTypeNoteSubjectViewModel[]>();
                        cachedItems.add("test-issue-type-id", [viewModelsToDelete]);

                        noteSubjectList.issueTypeId = "test-code";
                        noteSubjectList.useCacheSystem = true;
                        noteSubjectList.addIntoCache(cachedItems);

                        viewModelsToDelete.actionClicked("notesubject.delete");
                        noteSubjectList.postChange();
                        noteSubjectList.load();
                    });
                    it("THEN noteSubject is removed from cache", () => {
                        expect(ControllersManager.projectController.getIssueTypeNoteSubject).toHaveBeenCalled();
                    });
                });
            });
            describe("WHEN postChange is called with no entity to delete and update", () => {
                beforeEach(() => {
                    spyOn(noteSubjectList, "getChangedItems").and.returnValue([]);
                });
                it("THEN ProjectPunchList.NoteSubjectsToDelete is empty", () => {
                    expect(noteSubjectList.postChange()).toEqual(projectPunchList);
                });
                it("THEN ProjectPunchList.NoteSubjectsToUpdate is empty", () => {
                    expect(noteSubjectList.postChange()).toEqual(projectPunchList);
                });
            });
        });

        describe("Feature: checkDuplicatedSubject", () => {
            beforeEach(() => {
                spyOn(ControllersManager.projectController, "getIssueTypeNoteSubject").and.returnValue(defGetSubject.promise);
                vm.issueTypeId = "I1";
                vm.load();
                defGetSubject.resolve(subjects);
                $rootScope.$apply();
            });
            describe("WHEN the subject of an item changed to the same with one other", () => {
                describe("AND changes are case-sensitive", () => {
                    beforeEach(() => {
                        (<ap.viewmodels.projects.IssueTypeNoteSubjectViewModel>vm.sourceItems[0]).subject = "S2";
                    });
                    it("THEN,  have 2 item have isDuplicated = true", () => {
                        expect((<ap.viewmodels.projects.IssueTypeNoteSubjectViewModel>vm.sourceItems[0]).isDuplicated).toBeTruthy();
                        expect((<ap.viewmodels.projects.IssueTypeNoteSubjectViewModel>vm.sourceItems[1]).isDuplicated).toBeTruthy();
                        expect(vm.isDuplicated).toBeTruthy();
                    });
                });
                describe("AND changes are case-insensitive", () => {
                    beforeEach(() => {
                        (<ap.viewmodels.projects.IssueTypeNoteSubjectViewModel>vm.sourceItems[0]).subject = "s2";
                    });
                    it("THEN,  have 2 item have isDuplicated = true", () => {
                        expect((<ap.viewmodels.projects.IssueTypeNoteSubjectViewModel>vm.sourceItems[0]).isDuplicated).toBeTruthy();
                        expect((<ap.viewmodels.projects.IssueTypeNoteSubjectViewModel>vm.sourceItems[1]).isDuplicated).toBeTruthy();
                        expect(vm.isDuplicated).toBeTruthy();
                    });
                });
            });
            describe("WHEN the subject of an item changed and not equal to other item", () => {
                it("THEN,  have no item have isDuplicated = true", () => {
                    (<ap.viewmodels.projects.IssueTypeNoteSubjectViewModel>vm.sourceItems[0]).subject = "S3";
                    expect((<ap.viewmodels.projects.IssueTypeNoteSubjectViewModel>vm.sourceItems[0]).isDuplicated).toBeFalsy();
                    expect(vm.isDuplicated).toBeFalsy();
                });
            });
        });

        describe("Feature: actionClickHandler", () => {
            beforeEach(() => {
                let parentVm = new ap.viewmodels.projects.IssueTypeViewModel(Utility);
                parentVm.init(new ap.models.projects.IssueType(Utility));
                vm.parentIsssueTypeVm = parentVm;
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
        describe("Feature: disableActions", () => {
            describe("WHEN call disableActions ", () => {
                beforeEach(() => {
                    vm.disableActions();
                });
                it("THEN action is disabled", () => {
                    expect(vm.actions[0].isEnabled).toBeFalsy();
                });
            })
        });
        describe("Feature: enableActions", () => {
            describe("WHEN call disableActions after disableActions called", () => {
                beforeEach(() => {
                    vm.disableActions();
                    vm.enableActions();
                });
                it("THEN action is enabled", () => {
                    expect(vm.actions[0].isEnabled).toBeTruthy();
                });
            })
        });

        describe("Feature: noteSubjectInsertRequested", () => {
            let _deferred: any;
            let noteSubjectList: ap.viewmodels.projects.IssueTypeNoteSubjectListViewModel;
            let subjectVM: ap.viewmodels.projects.IssueTypeNoteSubjectViewModel;
            beforeEach(() => {
                _deferred = $q.defer();
                spyOn(ControllersManager.projectController, "getIssueTypeNoteSubject").and.returnValue(_deferred.promise);
                noteSubjectList = new ap.viewmodels.projects.IssueTypeNoteSubjectListViewModel(Utility, $q, ControllersManager);
                noteSubjectList.parentIsssueTypeVm = new ap.viewmodels.projects.IssueTypeViewModel(Utility);
            });
            describe("WHEN call noteSubjectInsertRequested and list of issueType is empty", () => {
                beforeEach(() => {
                    noteSubjectList.load();
                    _deferred.resolve([]);
                    $rootScope.$apply();
                    noteSubjectList.actionClickedHandler("subjects.add");
                    subjectVM = <ap.viewmodels.projects.IssueTypeNoteSubjectViewModel>noteSubjectList.getItemAtIndex(0);
                });
                it("THEN add new Subject with displayOrder = 1 and has IssueType", () => {
                    expect(subjectVM.originalEntity.IsNew).toBeTruthy();
                    expect(subjectVM.displayOrder).toBe(1);
                    expect((<ap.models.projects.IssueTypeNoteSubject>subjectVM.originalEntity).IssueType).toBeDefined();
                })
            });
            describe("WHEN call noteSubjectInsertRequested and list of issueType has 2 entity", () => {
                beforeEach(() => {
                    noteSubjectList.load();
                    _deferred.resolve(subjects);
                    $rootScope.$apply();
                    noteSubjectList.actionClickedHandler("subjects.add");
                    subjectVM = <ap.viewmodels.projects.IssueTypeNoteSubjectViewModel>noteSubjectList.getItemAtIndex(2);
                });
                it("THEN add new Subject with displayOrder = 10002", () => {
                    expect(subjectVM.originalEntity.IsNew).toBeTruthy();
                    expect(subjectVM.displayOrder).toBe(10002);
                })
            });
        });
    });

    describe("Item changed", () => {
        let noteSubjectList: ap.viewmodels.projects.IssueTypeNoteSubjectListViewModel;

        beforeEach(() => {
            let _deferred = $q.defer();
            spyOn(ControllersManager.projectController, "getIssueTypeNoteSubject").and.returnValue(_deferred.promise);
            noteSubjectList = new ap.viewmodels.projects.IssueTypeNoteSubjectListViewModel(Utility, $q, ControllersManager);
            noteSubjectList.parentIsssueTypeVm = new ap.viewmodels.projects.IssueTypeViewModel(Utility);

            noteSubjectList.load();
            let subject1: ap.models.projects.IssueTypeNoteSubject = new ap.models.projects.IssueTypeNoteSubject(Utility);
            subject1.createByJson({
                Id: "S1",
                Subject: "S1",
                DisplayOrder: 1
            });
            _deferred.resolve([subject1]);
            $rootScope.$apply();
        });

        describe("WHEN call noteSubjectInsertRequested and list of issueType is empty", () => {
            let callback: jasmine.Spy;

            beforeEach(() => {
                callback = jasmine.createSpy("callback");
                noteSubjectList.on("hasChanged", callback, this);

                let subjectVM: ap.viewmodels.projects.IssueTypeNoteSubjectViewModel = <ap.viewmodels.projects.IssueTypeNoteSubjectViewModel>noteSubjectList.getItemAtIndex(0);
                subjectVM.subject = "blablabla";
            });
            it("hasChanged is updated", () => {
                expect(noteSubjectList.hasChanged).toBeTruthy();
            });
            it("THEN haschanged is raised", () => {
                expect(callback).toHaveBeenCalled();
            });
        });
    });

    describe("Feature: checkIsDuplicated", () => {
        let noteSubjectDefer: angular.IDeferred<ap.models.projects.IssueTypeNoteSubject[]>;
        let testSubject: ap.models.projects.IssueTypeNoteSubject;
        let testSubject2: ap.models.projects.IssueTypeNoteSubject;
        let controllerSpy: jasmine.Spy;
        let vm: ap.viewmodels.projects.IssueTypeNoteSubjectListViewModel;
        beforeEach(() => {
            vm = new ap.viewmodels.projects.IssueTypeNoteSubjectListViewModel(Utility, $q, ControllersManager);
            issueType = new ap.viewmodels.projects.IssueTypeViewModel(Utility);
            issueType.chapterViewModel = new ap.viewmodels.projects.ChapterViewModel(Utility);
            vm.parentIsssueTypeVm = issueType;
            noteSubjectDefer = $q.defer();
            controllerSpy = spyOn(ControllersManager.projectController, "getIssueTypeNoteSubject");
            controllerSpy.and.returnValue(noteSubjectDefer.promise);
            testSubject = new ap.models.projects.IssueTypeNoteSubject(Utility);
            testSubject.createByJson({
                Id: "S1",
                Subject: "S1",
                DisplayOrder: 1
            });
            testSubject2 = new ap.models.projects.IssueTypeNoteSubject(Utility);
        });
        describe("WHEN vm's items are loaded with duplicated items", () => {
            beforeEach(() => {
                vm.load();
                testSubject2.createByJson({
                    Id: "S2",
                    Subject: "S1",
                    DisplayOrder: 2
                }); // duplicated entity
                noteSubjectDefer.resolve([testSubject, testSubject2]);
                $rootScope.$apply();
            });
            it("THEN, checkIsDuplicated method is called and isDuplicated method's return value is true", () => {
                expect(vm.isDuplicated).toBeTruthy();
                expect(vm.sourceItems.length).toEqual(2);
                expect(vm.sourceItems[0].isDuplicated).toBeTruthy();
                expect(vm.sourceItems[1].isDuplicated).toBeTruthy();
            });
        });
        describe("WHEN vm's items are loaded without duplicated items", () => {
            beforeEach(() => {
                vm.load();
                testSubject2.createByJson({
                    Id: "S2",
                    Subject: "S2",
                    DisplayOrder: 2
                });
                noteSubjectDefer.resolve([testSubject, testSubject2]);
                $rootScope.$apply();
            });
            it("THEN, checkIsDuplicated method is called and isDuplicated method's return value is true", () => {
                expect(vm.isDuplicated).toBeFalsy();
                expect(vm.sourceItems.length).toEqual(2);
                expect(vm.sourceItems[0].isDuplicated).toBeFalsy();
                expect(vm.sourceItems[1].isDuplicated).toBeFalsy();
            });
        });
        describe("WHEN cache system is enabled and data loaded from cache", () => {
            let onLoadItemsSpy: jasmine.Spy;
            beforeEach(() => {
                vm.useCacheSystem = true;
                vm.issueTypeId = "test-issue-type";
                onLoadItemsSpy = spyOn(vm, "onLoadItems");
                onLoadItemsSpy.and.callThrough();
                vm.load();
                testSubject2.createByJson({
                    Id: "S2",
                    Subject: "S1",
                    DisplayOrder: 2
                }); // duplicated object
                noteSubjectDefer.resolve([testSubject, testSubject2]);
                $rootScope.$apply();
                vm.load();
            });
            it("THEN, checkIsDuplicated is called for cached items", () => {
                expect(vm.isDuplicated).toBeTruthy();
                expect(vm.sourceItems.length).toEqual(2);
                expect(vm.sourceItems[0].isDuplicated).toBeTruthy();
                expect(vm.sourceItems[1].isDuplicated).toBeTruthy();
                expect(controllerSpy.calls.count()).toEqual(1);
                expect(onLoadItemsSpy.calls.count()).toEqual(2);
            });
        });
        describe("WHEN loaded item's subject becomes duplicated", () => {
            beforeEach(() => {
                vm.load();
                testSubject2.createByJson({
                    Id: "S2",
                    Subject: "S2",
                    DisplayOrder: 2
                }); // not duplicated
                noteSubjectDefer.resolve([testSubject, testSubject2]);
                $rootScope.$apply();
                (<ap.viewmodels.projects.IssueTypeNoteSubjectViewModel>vm.sourceItems[1]).subject = "S1";
            });
            it("THEN, checkIsDuplicated is called", () => {
                expect(vm.sourceItems[0].isDuplicated).toBeTruthy();
                expect(vm.sourceItems[1].isDuplicated).toBeTruthy();
            });
        });
        describe("WHEN duplicated item is fixed", () => {
            beforeEach(() => {
                vm.load();
                testSubject2.createByJson({
                    Id: "S2",
                    Subject: "S1",
                    DisplayOrder: 2
                }); // duplicated
                noteSubjectDefer.resolve([testSubject, testSubject2]);
                $rootScope.$apply();
                (<ap.viewmodels.projects.IssueTypeNoteSubjectViewModel>vm.sourceItems[1]).subject = "S2";
            });
            it("THEN, checkIsDuplicated is called", () => {
                expect(vm.sourceItems[0].isDuplicated).toBeFalsy();
                expect(vm.sourceItems[1].isDuplicated).toBeFalsy();
            });
        });
        describe("WHEN there are more than 2 duplicates in a group", () => {
            let testSubject3: ap.models.projects.IssueTypeNoteSubject;

            beforeEach(() => {
                vm.load();
                testSubject2.createByJson({
                    Id: "S2",
                    Subject: "S1",
                    DisplayOrder: 2
                }); // duplicated
                testSubject3 = new ap.models.projects.IssueTypeNoteSubject(Utility);
                testSubject3.createByJson({
                    Id: "S3",
                    Subject: "S1",
                    DisplayOrder: 3
                }); // duplicated
                noteSubjectDefer.resolve([testSubject, testSubject2, testSubject3]);
                $rootScope.$apply();
            });

            it("THEN all duplicates are detected", () => {
                expect(vm.sourceItems[0].isDuplicated).toBeTruthy();
                expect(vm.sourceItems[1].isDuplicated).toBeTruthy();
                expect(vm.sourceItems[2].isDuplicated).toBeTruthy();
            });

            describe("AND one item is fixed", () => {
                beforeEach(() => {
                    (<ap.viewmodels.projects.IssueTypeNoteSubjectViewModel>vm.sourceItems[1]).subject = "S2";
                });

                it("THEN a fixed value is not marked as duplicate anymore", () => {
                    expect(vm.sourceItems[1].isDuplicated).toBeFalsy();
                });

                it("THEN other values are still marked as duplicates", () => {
                    expect(vm.sourceItems[0].isDuplicated).toBeTruthy();
                    expect(vm.sourceItems[2].isDuplicated).toBeTruthy();
                });
            });
        });
        describe("WHEN there are more than 1 group of duplicates", () => {
            let testSubject3: ap.models.projects.IssueTypeNoteSubject;
            let testSubject4: ap.models.projects.IssueTypeNoteSubject;

            beforeEach(() => {
                vm.load();

                // A first group of duplicates
                testSubject2.createByJson({
                    Id: "S2",
                    Subject: "S1",
                    DisplayOrder: 2
                }); // duplicated

                // A second group of duplicates
                testSubject3 = new ap.models.projects.IssueTypeNoteSubject(Utility);
                testSubject3.createByJson({
                    Id: "S3",
                    Subject: "G2",
                    DisplayOrder: 3
                }); // duplicated
                testSubject4 = new ap.models.projects.IssueTypeNoteSubject(Utility);
                testSubject4.createByJson({
                    Id: "S4",
                    Subject: "G2",
                    DisplayOrder: 4
                }); // duplicated

                noteSubjectDefer.resolve([testSubject, testSubject2, testSubject3, testSubject4]);
                $rootScope.$apply();
            });

            it("THEN all duplicates are detected", () => {
                expect(vm.sourceItems[0].isDuplicated).toBeTruthy();
                expect(vm.sourceItems[1].isDuplicated).toBeTruthy();
                expect(vm.sourceItems[2].isDuplicated).toBeTruthy();
                expect(vm.sourceItems[3].isDuplicated).toBeTruthy();
            });

            describe("AND one item is fixed", () => {
                beforeEach(() => {
                    (<ap.viewmodels.projects.IssueTypeNoteSubjectViewModel>vm.sourceItems[1]).subject = "Q2";
                });

                it("THEN a fixed value is not marked as duplicate anymore", () => {
                    expect(vm.sourceItems[1].isDuplicated).toBeFalsy();
                });

                it("THEN all duplicates in the fixed group are detected correctly", () => {
                    expect(vm.sourceItems[0].isDuplicated).toBeFalsy();
                });

                it("THEN other groups are still marked as duplicates", () => {
                    expect(vm.sourceItems[2].isDuplicated).toBeTruthy();
                    expect(vm.sourceItems[3].isDuplicated).toBeTruthy();
                });
            });
        });
        describe("WHEN duplicated item is deleted", () => {
            beforeEach(() => {
                vm.load();
                testSubject2.createByJson({
                    Id: "S2",
                    Subject: "S1",
                    DisplayOrder: 2
                }); // duplicated
                noteSubjectDefer.resolve([testSubject, testSubject2]);
                $rootScope.$apply();

                (<ap.viewmodels.projects.IssueTypeNoteSubjectViewModel>vm.sourceItems[1]).actionClicked("notesubject.delete");
            });

            it("THEN the deleted value doesn't affect duplicates checking", () => {
                expect(vm.sourceItems[0].isDuplicated).toBeFalsy();
                expect(vm.sourceItems[1].isDuplicated).toBeFalsy();
            });

            describe("AND restored again", () => {
                beforeEach(() => {
                    (<ap.viewmodels.projects.IssueTypeNoteSubjectViewModel>vm.sourceItems[1]).undoDelete();
                });

                it("THEN the restored value affects duplicates checking", () => {
                    expect(vm.sourceItems[0].isDuplicated).toBeTruthy();
                    expect(vm.sourceItems[1].isDuplicated).toBeTruthy();
                });
            });
        });
    });

    describe("Feature: clearInfo", () => {
        let noteSubjectList: ap.viewmodels.projects.IssueTypeNoteSubjectListViewModel;
        beforeEach(() => {
            noteSubjectList = new ap.viewmodels.projects.IssueTypeNoteSubjectListViewModel(Utility, $q, ControllersManager);
            let object: ap.viewmodels.projects.IssueTypeNoteSubjectViewModel = new ap.viewmodels.projects.IssueTypeNoteSubjectViewModel(Utility);
            let noteSubject1 = new ap.models.projects.IssueTypeNoteSubject(Utility);
            noteSubject1.createByJson({ Id: "1" });
            object.init(noteSubject1);
            noteSubjectList.sourceItems = [object];
            noteSubjectList.selectEntity("1");
            noteSubjectList.clearInfo();
        });
        it("THEN selectedVm = null", () => {
            expect(noteSubjectList.selectedViewModel).toEqual(null);
        });
        it("THEN issueTypeId = null", () => {
            expect(noteSubjectList.issueTypeId).toEqual(null);
        });
        it("THEN isLoaded = false", () => {
            expect(noteSubjectList.isLoaded).toBeFalsy();
        });
        it("THEN noteSubject.sourceItems = []", () => {
            expect(noteSubjectList.sourceItems).toEqual([]);
        });
    });

    describe("Feature: cancel", () => {
        let noteSubjectList: ap.viewmodels.projects.IssueTypeNoteSubjectListViewModel;

        beforeEach(() => {
            let _deferred = $q.defer();
            spyOn(ControllersManager.projectController, "getIssueTypeNoteSubject").and.returnValue(_deferred.promise);
            noteSubjectList = new ap.viewmodels.projects.IssueTypeNoteSubjectListViewModel(Utility, $q, ControllersManager);
            noteSubjectList.parentIsssueTypeVm = new ap.viewmodels.projects.IssueTypeViewModel(Utility);

            noteSubjectList.load();
            let subject1: ap.models.projects.IssueTypeNoteSubject = new ap.models.projects.IssueTypeNoteSubject(Utility);
            subject1.createByJson({
                Id: "S1",
                Subject: "S1",
                DisplayOrder: 1
            });
            _deferred.resolve([subject1]);
            $rootScope.$apply();

            (<ap.viewmodels.projects.IssueTypeNoteSubjectViewModel>noteSubjectList.getItemAtIndex(0)).subject = "blablabla";

            expect(noteSubjectList.hasChanged).toBeTruthy();

        });

        describe("WHEN call noteSubjectInsertRequested and list of issueType is empty", () => {
            it("hasChanged is updated", () => {
                noteSubjectList.cancel();

                expect(noteSubjectList.hasChanged).toBeFalsy();
            });
        });
        describe("WHEN there is new entities deleted", () => {
            let viewModelsToDelete: ap.viewmodels.projects.IssueTypeNoteSubjectViewModel;
            let noteSubject1: ap.models.projects.IssueTypeNoteSubject;
            beforeEach(() => {
                noteSubjectList = new ap.viewmodels.projects.IssueTypeNoteSubjectListViewModel(Utility, $q, ControllersManager);
                noteSubject1 = new ap.models.projects.IssueTypeNoteSubject(Utility);
                viewModelsToDelete = new ap.viewmodels.projects.IssueTypeNoteSubjectViewModel(Utility);
                viewModelsToDelete.init(noteSubject1);
                viewModelsToDelete.actionClicked("notesubject.delete");
                noteSubjectList.sourceItems = [viewModelsToDelete];
                spyOn(noteSubjectList, "getChangedItems").and.returnValue([viewModelsToDelete]);
                noteSubjectList.cancel();

            });
            it("THEN noteSubject is removed from source items", () => {
                expect(noteSubjectList.sourceItems.indexOf(viewModelsToDelete)).toEqual(-1);
            });
        });
    });

    describe("Feature: element deleted", () => {
        let noteSubjectList: ap.viewmodels.projects.IssueTypeNoteSubjectListViewModel;

        beforeEach(() => {
            let _deferred = $q.defer();
            spyOn(ControllersManager.projectController, "getIssueTypeNoteSubject").and.returnValue(_deferred.promise);
            noteSubjectList = new ap.viewmodels.projects.IssueTypeNoteSubjectListViewModel(Utility, $q, ControllersManager);
            noteSubjectList.parentIsssueTypeVm = new ap.viewmodels.projects.IssueTypeViewModel(Utility);

            noteSubjectList.load();
            let subject1: ap.models.projects.IssueTypeNoteSubject = new ap.models.projects.IssueTypeNoteSubject(Utility);
            subject1.createByJson({
                Id: "S1",
                Subject: "S1",
                DisplayOrder: 1
            });
            _deferred.resolve([subject1]);
            $rootScope.$apply();

            (<ap.viewmodels.projects.IssueTypeNoteSubjectViewModel>noteSubjectList.getItemAtIndex(0)).actionClicked("notesubject.delete");
        });

        describe("WHEN call noteSubjectInsertRequested and list of issueType is empty", () => {
            it("hasChanged is updated", () => {
                expect(noteSubjectList.hasChanged).toBeTruthy();
            });
        });
    });

    describe("Feature: getChangedItems", () => {
        let noteSubjectList: ap.viewmodels.projects.IssueTypeNoteSubjectListViewModel;
        let directSubjectVm: ap.viewmodels.projects.IssueTypeNoteSubjectViewModel;
        let changedItems: ap.viewmodels.IEntityViewModel[];

        beforeEach(() => {
            noteSubjectList = new ap.viewmodels.projects.IssueTypeNoteSubjectListViewModel(Utility, $q, ControllersManager);

            let directSubject = new ap.models.projects.IssueTypeNoteSubject(Utility);
            directSubjectVm = new ap.viewmodels.projects.IssueTypeNoteSubjectViewModel(Utility);
            directSubjectVm.init(directSubject);
            noteSubjectList.sourceItems = [directSubjectVm];
        });

        describe("WHEN getChangedItems is called and the cache system is disabled", () => {
            let cachedSubjectVm: ap.viewmodels.projects.IssueTypeNoteSubjectViewModel;

            beforeEach(() => {
                noteSubjectList.useCacheSystem = false;
                changedItems = noteSubjectList.getChangedItems();
            });

            it("THEN loaded changed items are found", () => {
                expect(changedItems.indexOf(directSubjectVm)).not.toEqual(-1);
            });
        });

        describe("WHEN getChangedItems is called and the cache system is enabled", () => {
            let cachedSubjectVm: ap.viewmodels.projects.IssueTypeNoteSubjectViewModel;

            beforeEach(() => {
                noteSubjectList.useCacheSystem = true;

                let issueType = new ap.models.projects.IssueType(Utility);
                issueType.createByJson({ Id: "test-issue-type-id" });

                let cachedSubject = new ap.models.projects.IssueTypeNoteSubject(Utility);
                cachedSubject.IssueType = issueType;
                cachedSubjectVm = new ap.viewmodels.projects.IssueTypeNoteSubjectViewModel(Utility);
                cachedSubjectVm.init(cachedSubject);

                let cache = new Dictionary<string, ap.viewmodels.projects.IssueTypeNoteSubjectViewModel[]>();
                cache.add("test-issue-type-id", [cachedSubjectVm]);
                noteSubjectList.addIntoCache(cache);

                changedItems = noteSubjectList.getChangedItems();
            });

            it("THEN loaded changed items are found", () => {
                expect(changedItems.indexOf(directSubjectVm)).not.toEqual(-1);
            });
            it("THEN cached changed items are found", () => {
                expect(changedItems.indexOf(cachedSubjectVm)).not.toEqual(-1);
            });
        });
    });

    describe("Feature: getEntityById", () => {
        let noteSubjectList: ap.viewmodels.projects.IssueTypeNoteSubjectListViewModel;
        let directSubjectVm: ap.viewmodels.projects.IssueTypeNoteSubjectViewModel;
        let foundEntity: ap.viewmodels.IEntityViewModel;

        beforeEach(() => {
            noteSubjectList = new ap.viewmodels.projects.IssueTypeNoteSubjectListViewModel(Utility, $q, ControllersManager);

            let directSubject = new ap.models.projects.IssueTypeNoteSubject(Utility);
            directSubject.createByJson({ Id: "direct-item-id" });
            directSubjectVm = new ap.viewmodels.projects.IssueTypeNoteSubjectViewModel(Utility);
            directSubjectVm.init(directSubject);
            noteSubjectList.sourceItems = [directSubjectVm];
        });

        describe("WHEN a cache system is not used", () => {
            beforeEach(() => {
                noteSubjectList.useCacheSystem = false;
            });

            it("THEN loaded items are found", () => {
                foundEntity = noteSubjectList.getEntityById("direct-item-id");
                expect(foundEntity).toEqual(directSubjectVm);
            });
            it("THEN a lookup by not existing id returns null", () => {
                foundEntity = noteSubjectList.getEntityById("missing-item-id");
                expect(foundEntity).toBeNull();
            });
        });

        describe("WHEN a cache system is used", () => {
            let cachedSubjectVm: ap.viewmodels.projects.IssueTypeNoteSubjectViewModel;

            beforeEach(() => {
                noteSubjectList.useCacheSystem = true;

                let issueType = new ap.models.projects.IssueType(Utility, "test-cache-issue-type");
                issueType.createByJson({ Id: "test-issue-type-id" });

                let cachedSubject = new ap.models.projects.IssueTypeNoteSubject(Utility);
                cachedSubject.createByJson({ Id: "cached-item-id" });
                cachedSubject.IssueType = issueType;

                cachedSubjectVm = new ap.viewmodels.projects.IssueTypeNoteSubjectViewModel(Utility);
                cachedSubjectVm.init(cachedSubject);

                let cache = new Dictionary<string, ap.viewmodels.projects.IssueTypeNoteSubjectViewModel[]>();
                cache.add("test-issue-type", [cachedSubjectVm]);
                noteSubjectList.addIntoCache(cache);
            });

            it("THEN loaded items are found", () => {
                foundEntity = noteSubjectList.getEntityById("direct-item-id");
                expect(foundEntity).toEqual(directSubjectVm);
            });
            it("THEN cached items are found", () => {
                foundEntity = noteSubjectList.getEntityById("cached-item-id");
                expect(foundEntity).toEqual(cachedSubjectVm);
            });
            it("THEN a lookup by not existing id returns null", () => {
                foundEntity = noteSubjectList.getEntityById("missing-item-id");
                expect(foundEntity).toBeNull();
            });
        });
    });
});