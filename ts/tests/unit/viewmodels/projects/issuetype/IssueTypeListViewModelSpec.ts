describe("Module ap-viewmodels - IssueTypeListViewModel", () => {
    let Utility: ap.utility.UtilityHelper;
    let Api: ap.services.apiHelper.Api;
    let vm: ap.viewmodels.projects.IssueTypeListViewModel;
    let ControllersManager: ap.controllers.ControllersManager
    let $q: angular.IQService;
    let $rootScope: angular.IRootScopeService;
    let ProjectService: ap.services.ProjectService;
    let parentChapter: ap.viewmodels.projects.ChapterViewModel;
    class IssueTypeListVm extends ap.viewmodels.projects.IssueTypeListViewModel {

        checkForDuplicatedItems(itemVm: ap.viewmodels.IEntityViewModel) { }

        constructor(utility: ap.utility.UtilityHelper, protected $q: angular.IQService, _controllersManager: ap.controllers.ControllersManager) {
            super(utility, $q, _controllersManager);
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
        let chapter = new ap.models.projects.Chapter(Utility);
        parentChapter = new ap.viewmodels.projects.ChapterViewModel(Utility);
        parentChapter.init(chapter);
    }));
    describe("Factory: IssueTypeListViewModel", () => {
        describe("Feature: constructor", () => {
            describe("WHEN i request to create the IssueTypeListViewModel", () => {
                beforeEach(() => {
                    vm = new ap.viewmodels.projects.IssueTypeListViewModel(Utility, $q, ControllersManager);
                    vm.parentChapter = parentChapter;
                });
                it("THEN, the vm will created with default values", () => {
                    expect(vm).toBeDefined();
                    expect(vm.options.pageSize).toBe(50);
                    expect(vm.options.displayLoading).toBeFalsy();
                    expect(vm.options.isGetIdsCustom).toBeFalsy();
                    expect(vm.entityName).toBe("IssueType");
                    expect(vm.sortOrder).toBe("DisplayOrder");
                    expect(vm.pathToLoad).toBe("ParentChapter");
                    expect(vm.isDeferredLoadingMode).toBeTruthy();
                });
                it("THEN, the vm create with actions", () => {
                    expect(vm.actions.length).toBe(1);
                    expect(vm.actions[0].name).toBe("issuetype.add");
                });
            });
        });

        describe("Feature: specifyIds", () => {
            let ids: string[];
            beforeEach(() => {
                ids = ["C1", "C2", "C3"];
                vm = new ap.viewmodels.projects.IssueTypeListViewModel(Utility, $q, ControllersManager);
                spyOn(vm, "clear");
                vm.specifyIds(ids);
                vm.parentChapter = parentChapter;
            });
            describe("WHEN specifyIds is called with the list of ids", () => {
                it("THEN, the list vm will be set with the given ids", () => {
                    expect(vm.count).toEqual(3);
                });
                it("AND sourceitems will be updated", () => {
                    expect(vm.sourceItems.length).toEqual(3);
                });
            });
            describe("WHEN specifyIds is called ids and loadNextPage is called after", () => {
                beforeEach(() => {
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

        describe("Feature: selectItem", () => {
            let _deferred: angular.IDeferred<any>;
            let issueTypeList: IssueTypeListVm;
            let issueTypes: ap.models.projects.IssueType[];
            let issueType: ap.models.projects.IssueType;
            let ids: string[];
            let issueTypeVM: ap.viewmodels.projects.IssueTypeViewModel;
            let args: ap.viewmodels.base.PropertyChangedEventArgs;
            beforeEach(() => {
                issueTypes = [];
                issueType = new ap.models.projects.IssueType(Utility);

                _deferred = $q.defer();
                spyOn(Api, "getEntityList").and.returnValue(_deferred.promise);

                issueTypeList = new IssueTypeListVm(Utility, $q, ControllersManager);
                issueTypeList.parentChapter = parentChapter;
                let issueType1 = new ap.models.projects.IssueType(Utility);
                issueType1.createByJson({ Id: "0", ParentChapter: parentChapter.originalEntity });
                issueTypeVM = new ap.viewmodels.projects.IssueTypeViewModel(Utility);
                issueTypeVM.init(issueType1);
                vm = new ap.viewmodels.projects.IssueTypeListViewModel(Utility, $q, ControllersManager);
                vm.parentChapter = parentChapter;
            });
            describe("WHEN selectItem is called and sourceItems have  valid item", () => {
                beforeEach(() => {
                    issueTypeVM.code = 'asd';
                    issueTypeVM.description = 'asddsa';
                    vm.sourceItems = [issueTypeVM];
                });
                it("THEN, selectItem return true", () => {
                    expect(vm.selectItem(issueTypeVM)).toBeTruthy();
                });
            });
            describe("WHEN selectItem is called and sourceItems have not valid item", () => {
                beforeEach(() => {
                    issueType.Code = null;
                    issueTypes.push(issueType);
                    ids = [issueType.Id];
                    issueTypeList.specifyIds(ids);
                    issueTypeList.loadNextPage();
                    _deferred.resolve(new ap.services.apiHelper.ApiResponse(issueTypes));
                    $rootScope.$apply();
                    specHelper.general.raiseEvent(issueTypeList.getItemAtIndex(0), "propertychanged", new ap.viewmodels.base.PropertyChangedEventArgs("isValid", "123", issueTypeList.getItemAtIndex(0)));
                });
                it("THEN, selectItem return false", () => {
                    expect(issueTypeList.isValid).toBeFalsy();
                    expect(issueTypeList.selectItem(<ap.viewmodels.projects.IssueTypeViewModel>issueTypeList.getItemAtIndex(0))).toBeFalsy();
                });
            });
        });

        describe("Item actions", () => {
            let _deferred: any;
            let issueTypeList: IssueTypeListVm;
            let issueTypes: ap.models.projects.IssueType[] = [];
            let issueType: ap.models.projects.IssueType;
            let ids: string[];
            let issueTypeVM: ap.viewmodels.projects.IssueTypeViewModel;
            beforeEach(() => {
                issueType = new ap.models.projects.IssueType(Utility);
                issueType.createByJson({ Id: "0", Code: "IT", Description: "issueType", DisplayOrder: 0, ParentChapter: new ap.models.projects.Chapter(Utility)});
                issueTypes.push(issueType);

                _deferred = $q.defer();
                spyOn(Api, "getEntityList").and.returnValue(_deferred.promise);

                issueTypeList = new IssueTypeListVm(Utility, $q, ControllersManager);
                ids = [issueType.Id];
                spyOn(issueTypeList, "clear");
                spyOn(issueTypeList, "checkForDuplicatedItems");

                let parentVm = new ap.viewmodels.projects.ChapterViewModel(Utility);
                parentVm.init(new ap.models.projects.Chapter(Utility));
                issueTypeList.parentChapter = parentVm;
                issueTypeList.specifyIds(ids);
                issueTypeList.loadNextPage();
                _deferred.resolve(new ap.services.apiHelper.ApiResponse(issueTypes));
                $rootScope.$apply();
            });
            describe("WHEN, Item action raise insertrowrequested", () => {
                beforeEach(() => {
                    specHelper.general.raiseEvent(issueTypeList.getItemAtIndex(0), "insertrowrequested", issueTypeList.getItemAtIndex(0));
                    issueTypeVM = <ap.viewmodels.projects.IssueTypeViewModel>issueTypeList.getItemAtIndex(1);

                });
                it("THEN, there is 2 items (add one)", () => {
                    expect(issueTypeList.count).toEqual(2);
                    expect(issueTypeVM.issueType.IsNew).toBeTruthy();
                });
            });
        });

        describe("Feature: postChange", () => {
            let issueTypeList: ap.viewmodels.projects.IssueTypeListViewModel;
            let viewModelsToDelete: ap.viewmodels.projects.IssueTypeViewModel;
            let viewModelsToUpdate: ap.viewmodels.projects.IssueTypeViewModel;
            let issueType1: ap.models.projects.IssueType;
            let issueType2: ap.models.projects.IssueType;
            let projectPunchList: ap.models.custom.ProjectPunchlists;
            let project: ap.models.projects.Project;
            beforeEach(() => {
                project = new ap.models.projects.Project(Utility);
                spyOn(ControllersManager.mainController, "currentProject").and.returnValue(project);
                issueType1 = new ap.models.projects.IssueType(Utility);
                issueType1.createByJson({ Id: "12345", ParentChapter: new ap.models.projects.Chapter(Utility) });
                issueType2 = new ap.models.projects.IssueType(Utility);
                issueType2.createByJson({ Id: "56789", ParentChapter: new ap.models.projects.Chapter(Utility) });
                issueTypeList = new ap.viewmodels.projects.IssueTypeListViewModel(Utility, $q, ControllersManager);
                projectPunchList = new ap.models.custom.ProjectPunchlists(Utility, project.Id);
                viewModelsToDelete = new ap.viewmodels.projects.IssueTypeViewModel(Utility);
                viewModelsToDelete.init(issueType1);
                viewModelsToDelete.actionClicked("issuetype.delete");
                viewModelsToUpdate = new ap.viewmodels.projects.IssueTypeViewModel(Utility);
                viewModelsToUpdate.init(issueType2);
                viewModelsToUpdate.code = "aaa";

                viewModelsToUpdate.chapterViewModel = parentChapter;
                viewModelsToDelete.chapterViewModel = parentChapter;
                spyOn(viewModelsToUpdate, "postChanges");
            });
            describe("WHEN postChange is called with entity to delete and update", () => {
                describe("WHEN WHEN entities to delete are not new", () => {
                    beforeEach(() => {
                        projectPunchList.IssueTypesToDelete.push(viewModelsToDelete.originalEntity.Id);
                        projectPunchList.IssueTypesToUpdate.push(<ap.models.projects.IssueType>viewModelsToUpdate.originalEntity);
                        spyOn(issueTypeList, "getChangedItems").and.returnValue([viewModelsToDelete, viewModelsToUpdate]);
                    });
                    it("THEN ProjectPunchlists.IssueTypesToDelete is not empty", () => {
                        expect(issueTypeList.postChange()).toEqual(projectPunchList);
                    });
                    it("THEN ProjectPunchList.IssueTypesToUpdate is not empty", () => {
                        expect(issueTypeList.postChange()).toEqual(projectPunchList);
                    });
                });
                describe("WHEN entities to delete are new", () => {
                    beforeEach(() => {
                        issueType1 = new ap.models.projects.IssueType(Utility);
                        viewModelsToDelete = new ap.viewmodels.projects.IssueTypeViewModel(Utility);
                        viewModelsToDelete.init(issueType1);
                        viewModelsToDelete.code = "code";
                        viewModelsToDelete.actionClicked("issuetype.delete");
                        issueTypeList.sourceItems = [viewModelsToDelete];
                        projectPunchList.IssueTypesToDelete.push(viewModelsToDelete.originalEntity.Id);
                        spyOn(issueTypeList, "getChangedItems").and.returnValue([viewModelsToDelete]);
                        issueTypeList.postChange();
                    });
                    it("THEN issuetype is removed from source items", () => {
                        expect(issueTypeList.sourceItems.indexOf(viewModelsToDelete)).toEqual(-1);
                    });
                });
            });
            describe("WHEN postChange is called with no entity to delete and update", () => {
                beforeEach(() => {
                    spyOn(issueTypeList, "getChangedItems").and.returnValue([]);
                });
                it("THEN ProjectPunchList.IssueTypesToDelete is empty", () => {
                    expect(issueTypeList.postChange()).toEqual(projectPunchList);
                });
                it("THEN ProjectPunchList.IssueTypesToUpdate is empty", () => {
                    expect(issueTypeList.postChange()).toEqual(projectPunchList);
                });
            });
        });
        describe("Feature: actionClickHandler", () => {
            beforeEach(() => {
                vm = new ap.viewmodels.projects.IssueTypeListViewModel(Utility, $q, ControllersManager);
                let parentVm = new ap.viewmodels.projects.ChapterViewModel(Utility);
                parentVm.init(new ap.models.projects.Chapter(Utility));
                vm.parentChapter = parentVm;
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
            beforeEach(() => {
                vm = new ap.viewmodels.projects.IssueTypeListViewModel(Utility, $q, ControllersManager);
            });
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
            beforeEach(() => {
                vm = new ap.viewmodels.projects.IssueTypeListViewModel(Utility, $q, ControllersManager);
            });
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

        describe("Feature: issueTypetInsertRequested", () => {
            let _deferred: angular.IDeferred<any>;
            let issueTypeList: IssueTypeListVm;
            let issueTypes: ap.models.projects.IssueType[] = [];
            let issueType: ap.models.projects.IssueType;
            let ids: string[];
            let issueTypeVM: ap.viewmodels.projects.IssueTypeViewModel;
            let issueTypeCode;
            let callback: jasmine.Spy;
            beforeEach(() => {
                issueTypeCode = [{ Id: "0", Code: "CH" }];

                issueType = new ap.models.projects.IssueType(Utility);
                issueType.createByJson({ Id: "0", Code: "CH", Description: "issueType", DisplayOrder: 1, ParentChapter:parentChapter.originalEntity});

                _deferred = $q.defer();
                spyOn(Api, "getEntityList").and.callFake(() => { return _deferred.promise; });

                issueTypeList = new IssueTypeListVm(Utility, $q, ControllersManager);
                issueTypeList.parentChapter = parentChapter;

                callback = jasmine.createSpy("callback");
                issueTypeList.on("propertychanged", callback, this);

                spyOn(issueTypeList, "clear");
                spyOn(issueTypeList, "checkForDuplicatedItems");

            });
            describe("WHEN call issueTypetInsertRequested and list of issueType is empty", () => {
                beforeEach(() => {
                    ids = [];
                    issueTypeList.specifyIds(ids);
                    issueTypeList.loadNextPage();
                    _deferred.resolve(new ap.services.apiHelper.ApiResponse([]));
                    $rootScope.$apply();
                    issueTypeList.actionClickedHandler("issuetype.add");
                    issueTypeVM = <ap.viewmodels.projects.IssueTypeViewModel>issueTypeList.getItemAtIndex(0);
                });
                it("THEN add new IssueType with displayOrder = 1 and has parentChapter", () => {
                    expect(issueTypeVM.originalEntity.IsNew).toBeTruthy();
                    expect(issueTypeVM.displayOrder).toBe(1);
                    expect((<ap.models.projects.IssueType>issueTypeVM.originalEntity).ParentChapter).toBeDefined();
                });
                it("THEN, _invalidItems.length = 1 and _isValid = false", () => {
                    expect(issueTypeList.isValid).toBeFalsy();
                    expect(callback).toHaveBeenCalled();
                    expect(issueTypeList.isDuplicated).toBeFalsy();
                });
            });
            describe("WHEN call issueTypetInsertRequested and list of issueType has 1 entity", () => {
                beforeEach(() => {
                    issueTypes.push(issueType);
                    ids = [issueType.Id];
                    issueTypeList.specifyIds(ids);
                    issueTypeList.loadNextPage();
                    _deferred.resolve(new ap.services.apiHelper.ApiResponse(issueTypes));
                    $rootScope.$apply();
                    issueTypeList.actionClickedHandler("issuetype.add");
                    issueTypeVM = <ap.viewmodels.projects.IssueTypeViewModel>issueTypeList.getItemAtIndex(1);
                });
                it("THEN add new IssueType with displayOrder = 10001", () => {
                    expect(issueTypeVM.originalEntity.IsNew).toBeTruthy();
                    expect(issueTypeVM.displayOrder).toBe(10001);
                });
            });
            describe("WHEN call issueTypetInsertRequested and list of issueType has 54 entity and 2 pages", () => {
                let issueTypes2: ap.models.projects.IssueType[] = [];
                beforeEach(() => {
                    ids = [];
                    issueTypes = [];
                    issueTypeCode = [];
                    for (let i = 1; i <= 54; i++) {
                        let issueTypeLoop = new ap.models.projects.IssueType(Utility);
                        issueTypeLoop.createByJson({ Id: i.toString(), Code: "CH" + i, Description: "issueType" + i, DisplayOrder: i - 1, ParentChapter: new ap.models.projects.Chapter(Utility)});
                        if (i <= 50) {
                            issueTypes.push(issueTypeLoop);
                        } else {
                            issueTypes2.push(issueTypeLoop);
                        }
                        issueTypeCode.push({ Id: issueTypeLoop.Id, Code: issueTypeLoop.Code });
                        ids.push(issueTypeLoop.Id);
                    }
                    issueTypeList.specifyIds(ids);
                    issueTypeList.loadNextPage();
                    _deferred.resolve(new ap.services.apiHelper.ApiResponse(issueTypes));
                    $rootScope.$apply();

                    _deferred = $q.defer();
                    issueTypeList.loadNextPage();
                    _deferred.resolve(new ap.services.apiHelper.ApiResponse(issueTypes2));
                    $rootScope.$apply();

                    issueTypeList.actionClickedHandler("issuetype.add");
                });
                it("THEN add new IssueType with displayOrder = 10053", () => {
                    expect((<ap.viewmodels.projects.IssueTypeViewModel>issueTypeList.sourceItems[54]).originalEntity.IsNew).toBeTruthy();
                    expect((<ap.viewmodels.projects.IssueTypeViewModel>issueTypeList.sourceItems[54]).displayOrder).toBe(10053);
                });
            });
        });

        describe("Feature: issueTypePropertyChanged", () => {
            let _deferred: angular.IDeferred<any>;
            let issueTypeList: IssueTypeListVm;
            let issueTypes: ap.models.projects.IssueType[];
            let issueType: ap.models.projects.IssueType;
            let ids: string[];
            let issueTypeVM: ap.viewmodels.projects.IssueTypeViewModel;
            let args: ap.viewmodels.base.PropertyChangedEventArgs;
            beforeEach(() => {
                issueTypes = [];
                issueType = new ap.models.projects.IssueType(Utility);
                issueType.ParentChapter = <ap.models.projects.Chapter>parentChapter.originalEntity;
                _deferred = $q.defer();
                spyOn(Api, "getEntityList").and.returnValue(_deferred.promise);

                issueTypeList = new IssueTypeListVm(Utility, $q, ControllersManager);
                issueTypeList.parentChapter = parentChapter;
            });
            describe("WHEN code item changed with isValid false", () => {
                beforeEach(() => {
                    issueType.Code = null;
                    issueTypes.push(issueType);
                    ids = [issueType.Id];
                    issueTypeList.specifyIds(ids);
                    issueTypeList.loadNextPage();
                    _deferred.resolve(new ap.services.apiHelper.ApiResponse(issueTypes));
                    $rootScope.$apply();
                    specHelper.general.raiseEvent(issueTypeList.getItemAtIndex(0), "propertychanged", new ap.viewmodels.base.PropertyChangedEventArgs("isValid", "123", issueTypeList.getItemAtIndex(0)));
                });
                it("THEN isValid should be false", () => {
                    expect(issueTypeList.isValid).toBeFalsy();
                });
            });
            describe("WHEN code item changed with isValid true", () => {
                beforeEach(() => {
                    issueType.Code = "ssss";
                    issueType.Description = "ssss";
                    issueTypes.push(issueType);
                    ids = [issueType.Id];
                    issueTypeList.specifyIds(ids);
                    issueTypeList.loadNextPage();
                    _deferred.resolve(new ap.services.apiHelper.ApiResponse(issueTypes));
                    $rootScope.$apply();
                    issueTypeVM = <ap.viewmodels.projects.IssueTypeViewModel>issueTypeList.getItemAtIndex(0);
                    issueTypeVM.code = "ssss";
                    issueTypeVM.description = "ssss";
                });
                it("THEN isValid should be true", () => {
                    expect(issueTypeList.isValid).toBeTruthy();
                });
            });
            describe("WHEN args.propretyName = delete", () => {
                describe("WHEN issuetypeVm is valid", () => {
                    beforeEach(() => {
                        issueType.createByJson({
                            Code: "ssss",
                            Description: "ssss"
                        });
                        issueTypes.push(issueType);
                        ids = [issueType.Id];
                        issueTypeList.specifyIds(ids);
                        issueTypeList.loadNextPage();
                        _deferred.resolve(new ap.services.apiHelper.ApiResponse(issueTypes));
                        $rootScope.$apply();
                        issueTypeVM = <ap.viewmodels.projects.IssueTypeViewModel>issueTypeList.getItemAtIndex(0);
                        issueTypeVM.code = "ssss";
                        issueTypeVM.description = "ssss";
                    
                        issueTypeVM.actionClicked("issuetype.delete");
                    });
                    it("THEN, invalidItems.length = 0", () => {
                        expect(issueTypeList.isValid).toBeTruthy();
                    });
                    it("THEN, the hasChanged property is updated", () => {
                        expect(issueTypeList.hasChanged).toBeTruthy();
                    });
                });
                describe("WHEN issuetypeVm is valid and new", () => {
                    beforeEach(() => {
                        issueType.Code = "ssss";
                        issueType.Description = "ssss";
                        issueTypes.push(issueType);

                        issueTypeVM = new ap.viewmodels.projects.IssueTypeViewModel(Utility);
                        issueTypeVM.init(issueType);

                        issueTypeList.specifyIds([]);
                        issueTypeList.loadNextPage();
                        _deferred.resolve(new ap.services.apiHelper.ApiResponse([]));
                        $rootScope.$apply();
                        issueTypeList.insertItem(0, issueTypeVM);

                        issueTypeVM.actionClicked("issuetype.delete");
                    });
                    it("THEN, the hasChanged property is FALSE", () => {
                        expect(issueTypeList.hasChanged).toBeFalsy();
                    });
                });
                describe("WHEN issuetypeVm is not valid", () => {
                    beforeEach(() => {
                        issueType.createByJson({
                            Code: "ssss",
                            Description: "ssss"
                        });
                        issueTypes.push(issueType);
                        ids = [issueType.Id];
                        issueTypeList.specifyIds(ids);
                        issueTypeList.loadNextPage();
                        _deferred.resolve(new ap.services.apiHelper.ApiResponse(issueTypes));
                        $rootScope.$apply();
                        issueTypeVM = <ap.viewmodels.projects.IssueTypeViewModel>issueTypeList.getItemAtIndex(0);
                        issueTypeVM.code = "";
                        issueTypeVM.description = "";

                        issueTypeVM.actionClicked("issuetype.delete");
                    });
                    it("THEN, invalidItems.length = 0", () => {
                        expect(issueTypeList.isValid).toBeTruthy();
                    });
                    it("THEN, the hasChanged property is updated", () => {
                        expect(issueTypeList.hasChanged).toBeTruthy();
                    });
                });
                describe("WHEN issuetypeVm is not valid and new", () => {
                    beforeEach(() => {
                        issueType.Code = "ssss";
                        issueType.Description = "ssss";
                        issueTypes.push(issueType);

                        issueTypeVM = new ap.viewmodels.projects.IssueTypeViewModel(Utility);
                        issueTypeVM.init(issueType);

                        issueTypeList.specifyIds([]);
                        issueTypeList.loadNextPage();
                        _deferred.resolve(new ap.services.apiHelper.ApiResponse([]));
                        $rootScope.$apply();
                        issueTypeList.insertItem(0, issueTypeVM);

                        issueTypeVM.code = "";
                        issueTypeVM.description = "";
                        issueTypeVM.actionClicked("issuetype.delete");
                    });
                    it("THEN, the hasChanged property is FALSE", () => {
                        expect(issueTypeList.hasChanged).toBeFalsy();
                    });
                });
            });
            describe("WHEN args.propretyName = undelete", () => {
                describe("WHEN issuetypeVm is valid", () => {
                    beforeEach(() => {
                        issueType.Code = "ssss";
                        issueType.Description = "ssss";
                        issueTypes.push(issueType);
                        ids = [issueType.Id];
                        issueTypeList.specifyIds(ids);
                        issueTypeList.loadNextPage();
                        _deferred.resolve(new ap.services.apiHelper.ApiResponse(issueTypes));
                        $rootScope.$apply();
                        issueTypeVM = <ap.viewmodels.projects.IssueTypeViewModel>issueTypeList.getItemAtIndex(0);
                        issueTypeVM.code = "ssss";
                        issueTypeVM.description = "ssss";

                        issueTypeVM.undoDelete();
                    });
                    it("THEN, invalidItems.length = 0", () => {
                        expect(issueTypeList.isValid).toBeTruthy();
                    });
                    it("THEN, the hasChanged property is updated", () => {
                        expect(issueTypeList.hasChanged).toBeTruthy();
                    });
                });
                describe("WHEN issuetypeVm is not valid", () => {
                    beforeEach(() => {
                        issueType.Code = "ssss";
                        issueType.Description = "ssss";
                        issueTypes.push(issueType);
                        ids = [issueType.Id];
                        issueTypeList.specifyIds(ids);
                        issueTypeList.loadNextPage();
                        _deferred.resolve(new ap.services.apiHelper.ApiResponse(issueTypes));
                        $rootScope.$apply();
                        issueTypeVM = <ap.viewmodels.projects.IssueTypeViewModel>issueTypeList.getItemAtIndex(0);
                        issueTypeVM.code = "";
                        issueTypeVM.description = "";

                        issueTypeVM.undoDelete();
                    });
                    it("THEN, invalidItems.length = 1", () => {
                        expect(issueTypeList.isValid).toBeFalsy();
                    });
                    it("THEN, the hasChanged property is updated", () => {
                        expect(issueTypeList.hasChanged).toBeTruthy();
                    });
                });
                
            });
            describe("WHEN args.propretyName = isChecked", () => {
                let callback: jasmine.Spy;
                beforeEach(() => {
                    callback = jasmine.createSpy("callback");
                    issueType.Code = "ssss";
                    issueType.Description = "ssss";
                    issueTypes.push(issueType);
                    ids = [issueType.Id];
                    issueTypeList.specifyIds(ids);
                    issueTypeList.loadNextPage();
                    issueTypeList.on("itemchecked", callback, this);
                    _deferred.resolve(new ap.services.apiHelper.ApiResponse(issueTypes));
                    $rootScope.$apply();
                    issueTypeVM = <ap.viewmodels.projects.IssueTypeViewModel>issueTypeList.getItemAtIndex(0);
                    issueTypeVM.isChecked = true;
                });
                it("THEN, itemchecked is raised", () => {
                    expect(callback).toHaveBeenCalled();
                });
            });
        });

        describe("Feature: updateItemsActionsState", () => {
            let _deferred: any;
            let issueTypeList: IssueTypeListVm;
            let issueTypes: ap.models.projects.IssueType[];
            let issueType: ap.models.projects.IssueType;
            let ids: string[];
            let issueTypeVM: ap.viewmodels.projects.IssueTypeViewModel;
            let args: ap.viewmodels.base.PropertyChangedEventArgs;
            beforeEach(() => {
                issueTypes = [];
                _deferred = $q.defer();
                spyOn(Api, "getEntityList").and.returnValue(_deferred.promise);
                issueTypeList = new IssueTypeListVm(Utility, $q, ControllersManager);
                issueTypeList.parentChapter = parentChapter;
                issueType = new ap.models.projects.IssueType(Utility);

                issueTypes.push(issueType);
                ids = [issueType.Id];
                issueTypeList.specifyIds(ids);
                issueTypeList.loadNextPage();
                _deferred.resolve(new ap.services.apiHelper.ApiResponse(issueTypes));
                $rootScope.$apply();
                issueTypeVM = <ap.viewmodels.projects.IssueTypeViewModel>issueTypeList.getItemAtIndex(0);
                issueTypeVM.code = "fdsdfdsf";
                issueTypeVM.description = "fdsdfdsf";
            });
            describe("WHEN call updateItemsActionsState with enabled is true", () => {
                beforeEach(() => {
                    issueTypeVM.disableActions();
                    issueTypeList.updateItemsActionsState(true);
                });
                it("THEN actions in items should be enabled", () => {
                    expect(issueTypeVM.actions[0].isEnabled).toBeTruthy();
                });
            });
            describe("WHEN call updateItemsActionsState with enabled is false", () => {
                beforeEach(() => {
                    issueTypeList.updateItemsActionsState(false);
                });
                it("THEN actions in items should be disabled", () => {
                    expect(issueTypeVM.actions[0].isEnabled).toBeFalsy();
                });
            });
        });
    });

    describe("Item changed", () => {
        let issueTypeList: IssueTypeListVm;
        
        beforeEach(() => {
            let issueTypeCode = [{ Id: "0", Code: "CH" }];

            let issueType: ap.models.projects.IssueType = new ap.models.projects.IssueType(Utility);
            issueType.createByJson({ Id: "0", Code: "CH", Description: "issueType", DisplayOrder: 1, ParentChapter: parentChapter.originalEntity});

            let _deferred: angular.IDeferred<any> = $q.defer();
            spyOn(Api, "getEntityList").and.callFake(() => { return _deferred.promise; });

            issueTypeList = new IssueTypeListVm(Utility, $q, ControllersManager);
            issueTypeList.parentChapter = parentChapter;
            spyOn(issueTypeList, "clear");
            spyOn(issueTypeList, "checkForDuplicatedItems");

            let issueTypes: ap.models.projects.IssueType[] = [];
            issueTypes.push(issueType);
            let ids: string[] = [issueType.Id];
            issueTypeList.specifyIds(ids);
            issueTypeList.loadNextPage();
            _deferred.resolve(new ap.services.apiHelper.ApiResponse(issueTypes));
            $rootScope.$apply();
        });

        describe("WHEN an item is changed", () => {
            let issueTypeVM: ap.viewmodels.projects.IssueTypeViewModel;
            let callback: jasmine.Spy;

            beforeEach(() => {
                callback = jasmine.createSpy("callback");
                issueTypeList.on("hasChanged", callback, this);

                issueTypeVM = <ap.viewmodels.projects.IssueTypeViewModel>issueTypeList.getItemAtIndex(0);
                issueTypeVM.description = "blablabla";
            });
            it("THEN hasChanged equals true", () => {
                expect(issueTypeList.hasChanged).toBeTruthy();
            });
            it("THEN haschanged is raised", () => {
                expect(callback).toHaveBeenCalled();
            });
        });
    });

    describe("Feature: setIsValid", () => {
        let _deferred: angular.IDeferred<any>;
        let issueTypeList: IssueTypeListVm;
        let issueTypes: ap.models.projects.IssueType[];
        let issueType: ap.models.projects.IssueType;
        let ids: string[];
        let issueTypeVM: ap.viewmodels.projects.IssueTypeViewModel;
        let args: ap.viewmodels.base.PropertyChangedEventArgs;
        beforeEach(() => {
            issueTypes = [];
            issueType = new ap.models.projects.IssueType(Utility);

            _deferred = $q.defer();
            spyOn(Api, "getEntityList").and.returnValue(_deferred.promise);

            issueTypeList = new IssueTypeListVm(Utility, $q, ControllersManager);
            issueTypeList.parentChapter = parentChapter;
        });
        describe("WHEN code item changed with isValid false", () => {
            let callback;
            beforeEach(() => {
                callback = jasmine.createSpy("callback");
                issueTypeList.on("propertychanged", () => { callback(); }, issueTypeList);

                issueType.Code = null;
                issueTypes.push(issueType);
                ids = [issueType.Id];
                issueTypeList.specifyIds(ids);
                issueTypeList.loadNextPage();
                _deferred.resolve(new ap.services.apiHelper.ApiResponse(issueTypes));
                $rootScope.$apply();
                specHelper.general.raiseEvent(issueTypeList.getItemAtIndex(0), "propertychanged", new ap.viewmodels.base.PropertyChangedEventArgs("isValid", "123", issueTypeList.getItemAtIndex(0)));
            });
            it("THEN isValid should be false", () => {
                expect(issueTypeList.isValid).toBeFalsy();
            });
            it("THEN event propertychanged should be raised", () => {
                expect(callback).toHaveBeenCalled();
            });
        });
    });

    describe("Feature: element deleted", () => {
        let _deferred: angular.IDeferred<any>;
        let issueTypeList: IssueTypeListVm;
        let issueTypes: ap.models.projects.IssueType[];
        let issueType: ap.models.projects.IssueType;
        let ids: string[];
        let issueTypeVM: ap.viewmodels.projects.IssueTypeViewModel;
        let args: ap.viewmodels.base.PropertyChangedEventArgs;

        beforeEach(() => {
            issueTypes = [];
            issueType = new ap.models.projects.IssueType(Utility);

            _deferred = $q.defer();
            spyOn(Api, "getEntityList").and.returnValue(_deferred.promise);

            issueTypeList = new IssueTypeListVm(Utility, $q, ControllersManager);
            issueTypeList.parentChapter = parentChapter;
            issueType.Code = null;
            issueTypes.push(issueType);
            ids = [issueType.Id];
            issueTypeList.specifyIds(ids);
            issueTypeList.loadNextPage();
            _deferred.resolve(new ap.services.apiHelper.ApiResponse(issueTypes));
            $rootScope.$apply();

            (<ap.viewmodels.projects.IssueTypeViewModel>issueTypeList.getItemAtIndex(0)).description = "blablabla";

            // just to be sure that the Vm has been modified
            expect(issueTypeList.hasChanged).toBeTruthy();

            issueTypeList.cancel();
        });
        describe("WHEN cancel is called", () => {
            it("THEN event propertychanged should be raised", () => {
                expect(issueTypeList.hasChanged).toBeFalsy();
            });
        });
    });

    describe("Feature: clearInfo", () => {
        let issueTypeList: IssueTypeListVm;
        beforeEach(() => {
            issueTypeList = new IssueTypeListVm(Utility, $q, ControllersManager);
            let object: ap.viewmodels.projects.IssueTypeViewModel = new ap.viewmodels.projects.IssueTypeViewModel(Utility);
            let issueType = new ap.models.projects.IssueType(Utility);
            issueType.createByJson({ Id: "1", ParentChapter: new ap.models.projects.Chapter(Utility)});
            object.init(issueType);
            issueTypeList.sourceItems = [object];
            issueTypeList.selectEntity("1");
            issueTypeList.clearInfo();
        });
        it("THEN selectedVm = null", () => {
            expect(issueTypeList.selectedViewModel).toEqual(null);
        });
    });

    describe("Feature: cancel", () => {
        let _deferred: angular.IDeferred<any>;
        let issueTypeList: IssueTypeListVm;
        let issueTypes: ap.models.projects.IssueType[];
        let issueType: ap.models.projects.IssueType;
        let ids: string[];
        let issueTypeVM: ap.viewmodels.projects.IssueTypeViewModel;
        let args: ap.viewmodels.base.PropertyChangedEventArgs;

        beforeEach(() => {
            issueTypes = [];
            issueType = new ap.models.projects.IssueType(Utility);

            _deferred = $q.defer();
            spyOn(Api, "getEntityList").and.returnValue(_deferred.promise);

            issueTypeList = new IssueTypeListVm(Utility, $q, ControllersManager);
            issueTypeList.parentChapter = parentChapter;
            issueType.Code = null;
            issueTypes.push(issueType);
            ids = [issueType.Id];
            issueTypeList.specifyIds(ids);
            issueTypeList.loadNextPage();
            _deferred.resolve(new ap.services.apiHelper.ApiResponse(issueTypes));
            $rootScope.$apply();
            (<ap.viewmodels.projects.IssueTypeViewModel>issueTypeList.getItemAtIndex(0)).code = "";
            expect(issueTypeList.hasChanged).toBeTruthy();
            spyOn(issueTypeList, "specifyIds");
        });
        describe("WHEN cancel is called", () => {
            it("THEN has changed = false", () => {
                issueTypeList.cancel();
                expect(issueTypeList.hasChanged).toBeFalsy();
            });
            it("THEN specifyIds is called", () => {
                issueTypeList.cancel();
                expect(issueTypeList.specifyIds).toHaveBeenCalledWith([]);
            });
        });
        describe("WHEN there is new entities deleted", () => {
            let issueType1: ap.models.projects.IssueType;
            let viewModelsToDelete: ap.viewmodels.projects.IssueTypeViewModel;
            beforeEach(() => {
                issueType1 = new ap.models.projects.IssueType(Utility);
                viewModelsToDelete = new ap.viewmodels.projects.IssueTypeViewModel(Utility);
                viewModelsToDelete.init(issueType1);
                viewModelsToDelete.code = "code";
                viewModelsToDelete.actionClicked("issuetype.delete");
                issueTypeList.sourceItems = [viewModelsToDelete];
                spyOn(issueTypeList, "getChangedItems").and.returnValue([viewModelsToDelete]);
                issueTypeList.cancel();
            });
            it("THEN issuetype is removed from source items", () => {
                expect(issueTypeList.sourceItems.indexOf(viewModelsToDelete)).toEqual(-1);
            });
        });
    });
}); 