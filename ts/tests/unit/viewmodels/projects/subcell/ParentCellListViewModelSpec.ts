describe("Module ap-viewmodels - ParentCellListViewModelSpec", () => {
    let Utility: ap.utility.UtilityHelper;
    let Api: ap.services.apiHelper.Api;
    let vm: ap.viewmodels.projects.ParentCellListViewModel;
    let originalEntity: ap.models.projects.ParentCell;
    let ControllersManager: ap.controllers.ControllersManager;
    let $q: angular.IQService;
    let $rootScope: angular.IRootScopeService;
    let ProjectService: ap.services.ProjectService;

    class ParentCellListVm extends ap.viewmodels.projects.ParentCellListViewModel {

        checkForDuplicatedItems(itemVm: ap.viewmodels.IEntityViewModel) { }
        initDuplicatedData(itemVm: ap.viewmodels.IEntityViewModel) { }
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
        originalEntity = new ap.models.projects.ParentCell(Utility);
    }));
    describe("Feature: constructor", () => {
        describe("WHEN i request to create the ParentCellListViewModel", () => {
            let action: ap.viewmodels.home.ActionViewModel;
            beforeEach(() => {
                action = new ap.viewmodels.home.ActionViewModel(Utility, Utility.EventTool, "cells.add", "Images/html/icons/ic_add_black_48px.svg", true, null, "Add room level 1", true);
                vm = new ap.viewmodels.projects.ParentCellListViewModel(Utility, $q, ControllersManager, ProjectService);
            });
            it("THEN, the vm will created with default values", () => {
                expect(vm).toBeDefined();
                expect(vm.options.pageSize).toBe(50);
                expect(vm.options.displayLoading).toBeFalsy();
                expect(vm.options.isGetIdsCustom).toBeFalsy();
                expect(vm.entityName).toBe("ParentCell");
                expect(vm.sortOrder).toBe("DisplayOrder");
                expect(vm.pathToLoad).toBeNull();
                expect(vm.isDeferredLoadingMode).toBeTruthy();
            });
            it("THEN. check actions array must have cells.add action", () => {
                expect(vm.actions.length).toBe(1);
                expect(vm.actions[0]).toEqual(action);
            });
        });
    });

    describe("Feature: specifyIds", () => {
        let ids: string[];
        let deferredLoadParentCells;
        let parentCell1: ap.models.projects.ParentCell;
        let parentCell2: ap.models.projects.ParentCell;
        let parentCell3: ap.models.projects.ParentCell;
        let idValues: IDictionary<string, KeyValue<string, string>[]>;
        beforeEach(() => {
            deferredLoadParentCells = $q.defer();
            spyOn(ProjectService, "getProjectCells").and.returnValue(deferredLoadParentCells.promise);
            ids = ["1", "2", "3"];
            vm = new ap.viewmodels.projects.ParentCellListViewModel(Utility, $q, ControllersManager, ProjectService);
            vm.specifyIds(ids);

            parentCell1 = new ap.models.projects.ParentCell(Utility);
            parentCell1.createByJson({ Id: "1", Code: "Code1" });
            parentCell2 = new ap.models.projects.ParentCell(Utility);
            parentCell2.createByJson({ Id: "2", Code: "Code2" });
            parentCell3 = new ap.models.projects.ParentCell(Utility);
            parentCell3.createByJson({ Id: "3", Code: "Code3" });

            deferredLoadParentCells.resolve([parentCell1, parentCell2, parentCell3]);
            $rootScope.$apply();

            idValues = new Dictionary<string, KeyValue<string, string>[]>();
            idValues.add("1", [new KeyValue("Code", "CODE1")]);
            idValues.add("2", [new KeyValue("Code", "CODE2")]);
            idValues.add("3", [new KeyValue("Code", "CODE3")]);
        });
        describe("WHEN specifyIds is called with the list of ids", () => {
            it("THEN, the list vm will be set with the given ids", () => {
                expect(vm.count).toEqual(3);
            });
            it("AND sourceitems will be updated", () => {
                expect(vm.sourceItems.length).toEqual(3);
            });
            it("AND, ProjectService.getProjectCells will be called", () => {
                expect(ProjectService.getProjectCells).toHaveBeenCalledWith(ids, "Id,Code", true, true, true);
            });
            it("Then, idValuesDictionary is updated", () => {
                expect(vm.idValuesDictionary).toEqual(idValues);
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
            it("Then, idValuesDictionary is updated", () => {
                expect(vm.idValuesDictionary).toEqual(idValues);
            });
        });
    });

    describe("Item actions", () => {
        let _deferred: any;
        let parentCellList: ParentCellListVm;
        let parentCells: ap.models.projects.ParentCell[] = [];
        let parentCell: ap.models.projects.ParentCell;
        let ids: string[];
        let parentCellVM: ap.viewmodels.projects.ParentCellViewModel;
        beforeEach(() => {
            parentCell = new ap.models.projects.ParentCell(Utility);
            parentCell.createByJson({ Id: "0", Code: "CH", Description: "parentCell", DisplayOrder: 0 });
            parentCells.push(parentCell);

            _deferred = $q.defer();
            spyOn(Api, "getEntityList").and.returnValue(_deferred.promise);

            parentCellList = new ParentCellListVm(Utility, $q, ControllersManager, ProjectService);
            spyOn(parentCellList, "clear");
            spyOn(parentCellList, "checkForDuplicatedItems");

            ids = [parentCell.Id];
            parentCellList.specifyIds(ids);
            parentCellList.loadNextPage();
            _deferred.resolve(new ap.services.apiHelper.ApiResponse(parentCells));
            $rootScope.$apply();

            spyOn(ControllersManager.mainController, "currentProject").and.returnValue({
                Id: "12"
            });

            specHelper.general.raiseEvent(parentCellList.getItemAtIndex(0), "insertrowrequested", parentCellList.getItemAtIndex(0));
        });
        describe("WHEN, Item action raise insertrowrequested", () => {
            it("THEN, there is 2 items (add one)", () => {
                expect(parentCellList.count).toEqual(2);
                parentCellVM = <ap.viewmodels.projects.ParentCellViewModel>parentCellList.getItemAtIndex(1);
                expect(parentCellVM.parentCell.IsNew).toBeTruthy();
            });
        });
    });

    describe("Feature afterLoadPageSuccessHandler", () => {
        let _deferred: any;
        let parentCellList: ParentCellListVm;
        let parentCells: ap.models.projects.ParentCell[] = [];
        let parentCell: ap.models.projects.ParentCell;
        let ids: string[];
        let parentCellVM: ap.viewmodels.projects.ParentCellViewModel;
        beforeEach(() => {
            parentCell = new ap.models.projects.ParentCell(Utility);
            parentCell.createByJson({ Id: "0", Code: "CH", Description: "parentCell", DisplayOrder: 0 });
            parentCells.push(parentCell);

            _deferred = $q.defer();
            spyOn(Api, "getEntityList").and.returnValue(_deferred.promise);

            parentCellList = new ParentCellListVm(Utility, $q, ControllersManager, ProjectService);
            spyOn(parentCellList, "clear");
            spyOn(parentCellList, "checkForDuplicatedItems");

            ids = [parentCell.Id];
            parentCellList.specifyIds(ids);
            parentCellList.loadNextPage();
            parentCellList.idValuesDictionary.add("1", [new KeyValue("Code", "AAA")]);
            _deferred.resolve(new ap.services.apiHelper.ApiResponse(parentCells));
            $rootScope.$apply();

            spyOn(ControllersManager.mainController, "currentProject").and.returnValue({
                Id: "12"
            });
            specHelper.general.raiseEvent(parentCellList.getItemAtIndex(0), "insertrowrequested", parentCellList.getItemAtIndex(0));
        });
        describe("WHEN, afterLoadPageSuccessHandler is called", () => {
            it("THEN, checkForDuplicatedItems is called", () => {
                expect(parentCellList.checkForDuplicatedItems).toHaveBeenCalled();
            });
        });
    });

    describe("Feature: selectItem", () => {
        let parentCell: ap.viewmodels.projects.ParentCellViewModel;
        beforeEach(() => {
            parentCell = new ap.viewmodels.projects.ParentCellViewModel(Utility);
            vm = new ap.viewmodels.projects.ParentCellListViewModel(Utility, $q, ControllersManager, ProjectService);
            let getProjectCellsDef = $q.defer();
            spyOn(ProjectService, "getProjectCells").and.returnValue(getProjectCellsDef.promise);
        });
        describe("WHEN selectItem is called and sourceItems have valid item", () => {
            beforeEach(() => {
                parentCell.code = 'asd';
                parentCell.description = 'asddsa';
                vm.sourceItems = [parentCell];

            });
            it("THEN, selectItem return true", () => {
                expect(vm.selectItem(parentCell)).toBeTruthy();
            });
        });
        describe("WHEN selectItem is called and sourceItems have not valid item", () => {
            let _deferred: any;
            let parentCellList: ParentCellListVm;
            let parentCells: ap.models.projects.ParentCell[];
            let parentCell: ap.models.projects.ParentCell;
            let ids: string[];
            let parentCellVM: ap.viewmodels.projects.ParentCellViewModel;
            let args: ap.viewmodels.base.PropertyChangedEventArgs;
            beforeEach(() => {
                parentCells = [];
                _deferred = $q.defer();
                spyOn(Api, "getEntityList").and.returnValue(_deferred.promise);
                parentCellList = new ParentCellListVm(Utility, $q, ControllersManager, ProjectService);
                spyOn(parentCellList, "clear");
                spyOn(parentCellList, "checkForDuplicatedItems");
                parentCell = new ap.models.projects.ParentCell(Utility);

            });
            describe("WHEN the item is not new", () => {
                beforeEach(() => {
                    parentCell.createByJson({ Code: "code" });
                    parentCells.push(parentCell);
                    ids = [parentCell.Id];
                    parentCellList.specifyIds(ids);
                    parentCellList.loadNextPage();
                    _deferred.resolve(new ap.services.apiHelper.ApiResponse(parentCells));
                    $rootScope.$apply();
                    parentCellVM = <ap.viewmodels.projects.ParentCellViewModel>parentCellList.getItemAtIndex(0);
                    parentCellVM.code = "    ";
                    specHelper.general.raiseEvent(parentCellVM, "propertychanged", new ap.viewmodels.base.PropertyChangedEventArgs("isValid", "123", parentCellVM));
                });
                it("THEN, selectItem return false", () => {
                    expect(parentCellList.selectItem(parentCellVM)).toBeFalsy();
                });
            });
            describe("WHEN the item is new", () => {
                beforeEach(() => {
                    parentCell.Code = null;
                    parentCells.push(parentCell);
                    ids = [parentCell.Id];
                    parentCellList.specifyIds(ids);
                    parentCellList.loadNextPage();
                    _deferred.resolve(new ap.services.apiHelper.ApiResponse(parentCells));
                    $rootScope.$apply();
                    parentCellVM = <ap.viewmodels.projects.ParentCellViewModel>parentCellList.getItemAtIndex(0);
                    parentCellVM.code = "    ";
                    specHelper.general.raiseEvent(parentCellVM, "propertychanged", new ap.viewmodels.base.PropertyChangedEventArgs("isValid", "123", parentCellVM));
                });
                it("THEN, selectItem return true", () => {
                    expect(parentCellList.selectItem(parentCellVM)).toBeTruthy();
                });
            });
        });
    });

    describe("Feature: actionClickedHandler", () => {
        beforeEach(() => {
            vm = new ap.viewmodels.projects.ParentCellListViewModel(Utility, $q, ControllersManager, ProjectService);
            let idDic: IDictionary<string, string[]> = new Dictionary<string, string[]>();
            vm.valuesIdsDictionary.push(idDic);
        });
        describe("WHEN call actionClickHandler with name addAction", () => {
            beforeEach(() => {
                spyOn(vm, "insertItem");
                spyOn(ControllersManager.mainController, "currentProject").and.returnValue({
                    Id: "12"
                });

                vm.actionClickedHandler(vm.actions[0].name);
            });
            it("THEN call insertItem with index and newItem", () => {
                expect(vm.insertItem).toHaveBeenCalled();
            });
        })
    });

    describe("Feature: insertItem", () => {
        let parentVm: ap.viewmodels.projects.ParentCellViewModel;
        beforeEach(() => {
            let parent: ap.models.projects.ParentCell = new ap.models.projects.ParentCell(Utility);
            parentVm = new ap.viewmodels.projects.ParentCellViewModel(Utility);
            parentVm.init(parent);
            parentVm.code = "code";
            parentVm.description = "description";
            vm = new ap.viewmodels.projects.ParentCellListViewModel(Utility, $q, ControllersManager, ProjectService);
            spyOn((<ParentCellListVm>vm), "checkForDuplicatedItems");
            spyOn((<ParentCellListVm>vm), "initDuplicatedData");
            vm.specifyIds([]);
            vm.insertItem(0, parentVm);
        });
        describe("WHEN insertItem", () => {
            it("THEN initDuplicatedData is called", () => {
                parentVm.code = "";
                parentVm.description = "";
                expect((<ParentCellListVm>vm).initDuplicatedData).toHaveBeenCalledWith(parentVm);
            });
            it("THEN checkForDuplicatedItems is called", () => {
                expect((<ParentCellListVm>vm).checkForDuplicatedItems).toHaveBeenCalledWith(parentVm);
            });
        })
    });

    describe("Feature: parentCellInsertRequested", () => {
        let _deferred: angular.IDeferred<any>;
        let parentCellList: ParentCellListVm;
        let parentCells: ap.models.projects.ParentCell[] = [];
        let parentCell: ap.models.projects.ParentCell;
        let ids: string[];
        let parentCellVM: ap.viewmodels.projects.ParentCellViewModel;
        let deferredLoadParentCells: angular.IDeferred<any>;
        let parentCellCode;
        let callback: jasmine.Spy;
        beforeEach(() => {
            spyOn(ControllersManager.mainController, "currentProject").and.returnValue({
                Id: "12"
            });
            deferredLoadParentCells = $q.defer();
            spyOn(ProjectService, "getProjectCells").and.returnValue(deferredLoadParentCells.promise);
            parentCellCode = [{ Id: "0", Code: "CH" }];

            parentCell = new ap.models.projects.ParentCell(Utility);
            parentCell.createByJson({ Id: "0", Code: "PC", Description: "Parent cell", DisplayOrder: 1 });

            _deferred = $q.defer();
            spyOn(Api, "getEntityList").and.callFake(() => {
                return _deferred.promise
            });
            callback = jasmine.createSpy("callback");
            parentCellList = new ParentCellListVm(Utility, $q, ControllersManager, ProjectService);
            parentCellList.on("propertychanged", callback, this);
            spyOn(parentCellList, "clear");
            spyOn(parentCellList, "checkForDuplicatedItems");

        });
        describe("WHEN call parentCellInsertRequested and list of parentCell is empty", () => {
            beforeEach(() => {
                ids = [];
                parentCellList.specifyIds(ids);
                deferredLoadParentCells.resolve([]);
                parentCellList.loadNextPage();
                _deferred.resolve(new ap.services.apiHelper.ApiResponse([]));
                $rootScope.$apply();

                let idDic: IDictionary<string, string[]> = new Dictionary<string, string[]>();
                parentCellList.valuesIdsDictionary.push(idDic);
                parentCellList.actionClickedHandler("cells.add");
                parentCellVM = <ap.viewmodels.projects.ParentCellViewModel>parentCellList.getItemAtIndex(0);
            });
            it("THEN add new ParentCell with displayOrder = 1", () => {
                expect(parentCellVM.originalEntity.IsNew).toBeTruthy();
                expect(parentCellVM.displayOrder).toBe(1);
            });

            it("THEN, the projectId of the parentCell is set to the Id of the currentProject", () => {
                expect(parentCellVM.parentCell.ProjectId).toBe("12");
            });
            it("THEN, the projectId of the parentCell is set to the Id of the currentProject", () => {
                expect(parentCellList.idValuesDictionary.containsKey(parentCellVM.originalEntity.Id)).toBeTruthy();
            });
            it("THEN, _invalidItems.length = 1 and _isValid = false", () => {
                expect(parentCellList.isValid).toBeFalsy();
                expect(callback).toHaveBeenCalled();
                expect(parentCellList.isDuplicated).toBeFalsy();
            });
        });
        describe("WHEN call subCellInsertRequested and list of subCell has 51 entity", () => {
            beforeEach(() => {
                parentCells.push(parentCell);
                ids = [parentCell.Id];
                let parentCellsSecondPage: ap.models.projects.ParentCell[] = [];
                for (let id = 1; id <= 51; id++) {
                    let parentCellLoop = new ap.models.projects.ParentCell(Utility);
                    parentCellLoop.createByJson({ Id: id.toString(), Code: "PC" + id, Description: "parentCell" + id, DisplayOrder: id });
                    if (id <= 49)
                        parentCells.push(parentCellLoop);
                    else
                        parentCellsSecondPage.push(parentCellLoop);
                    ids.push(parentCellLoop.Id);
                    parentCellCode.push(parentCellLoop);
                }

                parentCellList.specifyIds(ids);
                deferredLoadParentCells.resolve(parentCellCode);
                parentCellList.loadNextPage();
                _deferred.resolve(new ap.services.apiHelper.ApiResponse(parentCells));
                $rootScope.$apply();

                _deferred = $q.defer();
                _deferred.resolve(new ap.services.apiHelper.ApiResponse(parentCellsSecondPage));
                let idDic: IDictionary<string, string[]> = new Dictionary<string, string[]>();
                parentCellList.valuesIdsDictionary.push(idDic);
                parentCellList.actionClickedHandler("cells.add");
                $rootScope.$apply();
            });
            afterEach(() => {
                parentCells = [];
                ids = [];
            });
            it("THEN add new SubCell with displayOrder = this.sourceItems.length + 10000", () => {
                expect(Api.getEntityList).toHaveBeenCalled();
                expect((<ap.viewmodels.projects.ParentCellViewModel>parentCellList.sourceItems[52]).originalEntity.IsNew).toBeTruthy();
                expect((<ap.viewmodels.projects.ParentCellViewModel>parentCellList.sourceItems[52]).displayOrder).toBe(10052);
            })
            it("THEN, the projectId of the parentCell is set to the Id of the currentProject", () => {
                expect(parentCellList.idValuesDictionary.containsKey((<ap.viewmodels.projects.ParentCellViewModel>parentCellList.sourceItems[52]).originalEntity.Id)).toBeTruthy();
            });
            it("THEN, isValid = false", () => {
                expect(parentCellList.isValid).toBeFalsy();
            });
        });
        describe("WHEN call parentCellInsertRequested and list of parentCell has 1 entity", () => {
            beforeEach(() => {
                parentCells = [];
                parentCells.push(parentCell);
                ids = [parentCell.Id];
                parentCellList.specifyIds(ids);
                deferredLoadParentCells.resolve(parentCellCode);
                parentCellList.loadNextPage();
                _deferred.resolve(new ap.services.apiHelper.ApiResponse(parentCells));
                $rootScope.$apply();
                parentCellList.actionClickedHandler("cells.add");
                parentCellVM = <ap.viewmodels.projects.ParentCellViewModel>parentCellList.getItemAtIndex(1);
            });
            it("THEN add new ParentCell with displayOrder = 10001", () => {
                expect(parentCellVM.originalEntity.IsNew).toBeTruthy();
                expect(parentCellVM.displayOrder).toBe(10001);
            });
            it("THEN, the projectId of the parentCell is set to the Id of the currentProject", () => {
                expect(parentCellList.idValuesDictionary.containsKey(parentCellVM.originalEntity.Id)).toBeTruthy();
            });
            it("THEN, isValid = false", () => {
                expect(parentCellList.isValid).toBeFalsy();
            });
        });
    });

    describe("Feature: insertImportedItem", () => {
        let listVm: ParentCellListVm;
        let importedItem: ap.viewmodels.projects.ParentCellViewModel;
        let changedCallback: jasmine.Spy;

        beforeEach(() => {
            spyOn(ProjectService, "getProjectCells").and.returnValue($q.resolve([]));
            spyOn(Api, "getEntityList").and.returnValue($q.resolve(new ap.services.apiHelper.ApiResponse([])));

            listVm = new ParentCellListVm(Utility, $q, ControllersManager, ProjectService);
            listVm.specifyIds([]);
            listVm.loadNextPage();
            $rootScope.$apply();

            let importedEntity = new ap.models.projects.ParentCell(Utility, "test-code", "test-description");
            importedItem = new ap.viewmodels.projects.ParentCellViewModel(Utility);
            importedItem.init(importedEntity);

            spyOn(listVm, "checkForDuplicatedItems").and.callThrough();

            changedCallback = jasmine.createSpy("hasChangedCallback");
            listVm.on("hasChanged", <(args?: any) => void>changedCallback, null);
        });

        describe("WHEN the item is given", () => {
            beforeEach(() => {
                listVm.insertImportedItem(importedItem);
            });

            it("THEN the given item is inserted to the list", () => {
                expect(listVm.sourceItems.indexOf(importedItem)).not.toEqual(-1);
            });

            it("THEN duplicates checking is performed", () => {
                expect(listVm.checkForDuplicatedItems).toHaveBeenCalled();
            });

            it("THEN the list is marked as changed", () => {
                expect(listVm.hasChanged).toBeTruthy();
            });
        });

        describe("WHEN a code of the imported item is changed", () => {
            beforeEach(() => {
                listVm.insertImportedItem(importedItem);
                importedItem.code = "new-code";
            });

            it("THEN the duplicates checking is performed", () => {
                expect(listVm.checkForDuplicatedItems).toHaveBeenCalled();
            });

            it("THEN the hasChanged event is fired", () => {
                expect(changedCallback).toHaveBeenCalled();
            });
        });

        describe("WHEN a description of the imported item is changed", () => {
            beforeEach(() => {
                listVm.insertImportedItem(importedItem);
                importedItem.description = "new-description";
            });

            it("THEN the hasChanged event is fired", () => {
                expect(changedCallback).toHaveBeenCalled();
            });
        });
    });

    describe("Feature: postChange", () => {
        let parentCellList: ap.viewmodels.projects.ParentCellListViewModel;
        let viewModelsToDelete: ap.viewmodels.projects.ParentCellViewModel;
        let viewModelsToUpdate: ap.viewmodels.projects.ParentCellViewModel;
        let parentCell1: ap.models.projects.ParentCell;
        let parentCell2: ap.models.projects.ParentCell;
        let projectRoomModification: ap.models.custom.ProjectRoomModification;
        let project: ap.models.projects.Project;
        beforeEach(() => {
            project = new ap.models.projects.Project(Utility);
            spyOn(ControllersManager.mainController, "currentProject").and.returnValue(project);
            parentCell1 = new ap.models.projects.ParentCell(Utility);
            parentCell1.createByJson({ Id: "12345" });
            parentCell2 = new ap.models.projects.ParentCell(Utility);
            parentCell2.createByJson({ Id: "56789" });
            parentCellList = new ap.viewmodels.projects.ParentCellListViewModel(Utility, $q, ControllersManager, ProjectService);
            projectRoomModification = new ap.models.custom.ProjectRoomModification(Utility, project.Id);
            viewModelsToDelete = new ap.viewmodels.projects.ParentCellViewModel(Utility);
            viewModelsToDelete.init(parentCell1);
            viewModelsToDelete.actionClicked("parentcell.delete");
            viewModelsToUpdate = new ap.viewmodels.projects.ParentCellViewModel(Utility);
            viewModelsToUpdate.init(parentCell2);
            viewModelsToUpdate.code = "aaa";
            spyOn(viewModelsToUpdate, "postChanges");
        });
        describe("WHEN postChange is called with entity to delete and update", () => {
            describe("WHEN entities to delete are not new", () => {
                beforeEach(() => {
                    projectRoomModification.ParentCellsToDelete.push(viewModelsToDelete.originalEntity.Id);
                    projectRoomModification.ParentCellsToUpdate.push(<ap.models.projects.ParentCell>viewModelsToUpdate.originalEntity);
                    spyOn(parentCellList, "getChangedItems").and.returnValue([viewModelsToDelete, viewModelsToUpdate]);
                });
                it("THEN ProjectPunchlists.ParentCellsToDelete is not empty", () => {
                    expect(parentCellList.postChange()).toEqual(projectRoomModification);
                });
                it("THEN ProjectPunchList.ParentCellsToUpdate is not empty", () => {
                    expect(parentCellList.postChange()).toEqual(projectRoomModification);
                });
            });
            describe("WHEN entities to delete are new", () => {
                beforeEach(() => {
                    parentCell1 = new ap.models.projects.ParentCell(Utility);
                    viewModelsToDelete = new ap.viewmodels.projects.ParentCellViewModel(Utility);
                    viewModelsToDelete.init(parentCell1);
                    viewModelsToDelete.code = "code";
                    viewModelsToDelete.actionClicked("parentcell.delete");
                    parentCellList.sourceItems = [viewModelsToDelete];
                    projectRoomModification.ParentCellsToDelete.push(viewModelsToDelete.originalEntity.Id);
                    spyOn(parentCellList, "getChangedItems").and.returnValue([viewModelsToDelete]);

                    parentCellList.valuesIdsDictionary[0].add("CODE", [parentCell1.Id]);
                    parentCellList.idValuesDictionary.add(parentCell1.Id, null);
                    parentCellList.postChange();
                });
                it("THEN parentCell is removed from source items", () => {
                    expect(parentCellList.sourceItems.indexOf(viewModelsToDelete)).toEqual(-1);
                });
                it("THEN parentCell.Id is removed from idValuesDictionary", () => {
                    expect(parentCellList.idValuesDictionary.containsKey(parentCell1.Id)).toBeFalsy();
                });
                it("THEN parentCell.Id is removed from valuesIdsDictionary", () => {
                    expect(parentCellList.valuesIdsDictionary[0].containsKey(viewModelsToDelete.code)).toBeFalsy();
                });
            });
        });
        describe("WHEN postChange is called with no entity to delete and update", () => {
            beforeEach(() => {
                spyOn(parentCellList, "getChangedItems").and.returnValue([]);
            });
            it("THEN ProjectPunchList.ParentCellsToDelete is empty", () => {
                expect(parentCellList.postChange()).toEqual(projectRoomModification);
            });
            it("THEN ProjectPunchList.ParentCellsToUpdate is empty", () => {
                expect(parentCellList.postChange()).toEqual(projectRoomModification);
            });
        });
    });

    describe("Feature setHasCHanged", () => {
        let _deferred: any;
        let parentCellList: ParentCellListVm;
        let parentCells: ap.models.projects.ParentCell[] = [];
        let parentCell: ap.models.projects.ParentCell;
        let ids: string[];
        let parentCellVM: ap.viewmodels.projects.ParentCellViewModel;
        let callbackPropretyChanged;
        let args: ap.viewmodels.base.PropertyChangedEventArgs;
        beforeEach(() => {
            parentCell = new ap.models.projects.ParentCell(Utility);
            parentCells.push(parentCell);

            _deferred = $q.defer();
            spyOn(Api, "getEntityList").and.returnValue(_deferred.promise);
            let getProjectCellsDef = $q.defer();
            spyOn(ProjectService, "getProjectCells").and.returnValue(getProjectCellsDef.promise);
            parentCellList = new ParentCellListVm(Utility, $q, ControllersManager, ProjectService);
            spyOn(parentCellList, "clear");
            spyOn(parentCellList, "checkForDuplicatedItems");

            ids = [parentCell.Id];
            parentCellList.specifyIds(ids);
            parentCellList.loadNextPage();
            _deferred.resolve(new ap.services.apiHelper.ApiResponse(parentCells));
            $rootScope.$apply();

            callbackPropretyChanged = jasmine.createSpy("callback");
            parentCellList.on("hasChanged", callbackPropretyChanged, this);

            specHelper.general.raiseEvent(parentCellList.getItemAtIndex(0), "propertychanged", new ap.viewmodels.base.PropertyChangedEventArgs("description", "123", parentCellList.getItemAtIndex(0)));
        });
        it("THEN, hasChanged event is raised", () => {
            expect(callbackPropretyChanged).toHaveBeenCalledWith(true);
        });
    });

    describe("Feature: isValid", () => {
        let _deferred: any;
        let parentCellList: ParentCellListVm;
        let parentCells: ap.models.projects.ParentCell[];
        let parentCell: ap.models.projects.ParentCell;
        let ids: string[];
        let parentCellVM: ap.viewmodels.projects.ParentCellViewModel;
        let args: ap.viewmodels.base.PropertyChangedEventArgs;
        beforeEach(() => {
            parentCells = [];
            _deferred = $q.defer();
            let getProjectCellsDef = $q.defer();
            spyOn(ProjectService, "getProjectCells").and.returnValue(getProjectCellsDef.promise);
            spyOn(Api, "getEntityList").and.returnValue(_deferred.promise);
            parentCellList = new ParentCellListVm(Utility, $q, ControllersManager, ProjectService);
            spyOn(parentCellList, "clear");
            spyOn(parentCellList, "checkForDuplicatedItems");
        });
        describe("WHEN code item changed with isValid false", () => {
            beforeEach(() => {
                parentCell = new ap.models.projects.ParentCell(Utility);
                parentCell.Code = null;
                parentCells.push(parentCell);
                ids = [parentCell.Id];
                parentCellList.specifyIds(ids);
                parentCellList.loadNextPage();
                _deferred.resolve(new ap.services.apiHelper.ApiResponse(parentCells));
                $rootScope.$apply();
                specHelper.general.raiseEvent(parentCellList.getItemAtIndex(0), "propertychanged", new ap.viewmodels.base.PropertyChangedEventArgs("isValid", "123", parentCellList.getItemAtIndex(0)));
            });
            it("THEN isValid should be false", () => {
                expect(parentCellList.isValid).toBeFalsy();
            });
        });
        describe("WHEN code item changed with isValid true", () => {
            beforeEach(() => {
                parentCell = new ap.models.projects.ParentCell(Utility);
                parentCells.push(parentCell);
                ids = [parentCell.Id];
                parentCellList.specifyIds(ids);
                parentCellList.loadNextPage();
                _deferred.resolve(new ap.services.apiHelper.ApiResponse(parentCells));
                $rootScope.$apply();
                parentCellVM = <ap.viewmodels.projects.ParentCellViewModel>parentCellList.getItemAtIndex(0);
                parentCellVM.code = "sssss";
                parentCellVM.description = "fgdsdfs";

            });
            it("THEN isValid should be true", () => {
                expect(parentCellList.isValid).toBeTruthy();
            });
        });
    });

    describe("Feature: setIsValid", () => {
        let _deferred: any;
        let parentCellList: ParentCellListVm;
        let parentCells: ap.models.projects.ParentCell[];
        let parentCell: ap.models.projects.ParentCell;
        let ids: string[];
        let parentCellVM: ap.viewmodels.projects.ParentCellViewModel;
        let args: ap.viewmodels.base.PropertyChangedEventArgs;
        beforeEach(() => {
            parentCells = [];
            _deferred = $q.defer();
            spyOn(Api, "getEntityList").and.returnValue(_deferred.promise);
            parentCellList = new ParentCellListVm(Utility, $q, ControllersManager, ProjectService);
            let getProjectCellsDef = $q.defer();
            spyOn(ProjectService, "getProjectCells").and.returnValue(getProjectCellsDef.promise);
            spyOn(parentCellList, "clear");
            spyOn(parentCellList, "checkForDuplicatedItems");
        });
        describe("WHEN code item changed with isValid false", () => {
            let callback;
            beforeEach(() => {
                parentCell = new ap.models.projects.ParentCell(Utility);
                callback = jasmine.createSpy("callback");
                parentCellList.on("propertychanged", () => { callback(); }, parentCellList);

                parentCell.Code = null;
                parentCells.push(parentCell);
                ids = [parentCell.Id];
                parentCellList.specifyIds(ids);
                parentCellList.loadNextPage();
                _deferred.resolve(new ap.services.apiHelper.ApiResponse(parentCells));
                $rootScope.$apply();
                specHelper.general.raiseEvent(parentCellList.getItemAtIndex(0), "propertychanged", new ap.viewmodels.base.PropertyChangedEventArgs("isValid", "123", parentCellList.getItemAtIndex(0)));
            });
            it("THEN isValid should be false", () => {
                expect(parentCellList.isValid).toBeFalsy();
            });
            it("THEN event propertychanged should be raised", () => {
                expect(callback).toHaveBeenCalled();
            });
        });

    });

    describe("Feature: updateItemsActionsState", () => {
        let _deferred: any;
        let parentCellList: ParentCellListVm;
        let parentCells: ap.models.projects.ParentCell[];
        let parentCell: ap.models.projects.ParentCell;
        let ids: string[];
        let parentCellVM: ap.viewmodels.projects.ParentCellViewModel;
        let args: ap.viewmodels.base.PropertyChangedEventArgs;
        beforeEach(() => {
            parentCells = [];
            _deferred = $q.defer();
            spyOn(Api, "getEntityList").and.returnValue(_deferred.promise);
            parentCellList = new ParentCellListVm(Utility, $q, ControllersManager, ProjectService);
            let getProjectCellsDef = $q.defer();
            spyOn(ProjectService, "getProjectCells").and.returnValue(getProjectCellsDef.promise);
            spyOn(parentCellList, "clear");
            spyOn(parentCellList, "checkForDuplicatedItems");
            parentCell = new ap.models.projects.ParentCell(Utility);
            parentCells.push(parentCell);
            ids = [parentCell.Id];
            parentCellList.specifyIds(ids);
            parentCellList.loadNextPage();
            _deferred.resolve(new ap.services.apiHelper.ApiResponse(parentCells));
            $rootScope.$apply();
            parentCellVM = <ap.viewmodels.projects.ParentCellViewModel>parentCellList.getItemAtIndex(0);
            parentCellVM.code = "dfdsfs";
            parentCellVM.description = "dfdsfs"

        });
        describe("WHEN call updateItemsActionsState with enabled is true", () => {

            beforeEach(() => {
                parentCellVM.disableActions();
                parentCellList.updateItemsActionsState(true);
            });
            it("THEN actions in items should be enabled", () => {
                expect(parentCellVM.actions[0].isEnabled).toBeTruthy();
            });
        });
        describe("WHEN call updateItemsActionsState with enabled is false", () => {
            beforeEach(() => {
                parentCellList.updateItemsActionsState(false);
            });
            it("THEN actions in items should be disabled", () => {
                expect(parentCellVM.actions[0].isEnabled).toBeFalsy();
            });
        });
    });
    describe("Feature: cancel", () => {
        let _deferred: any;
        let parentCellList: ParentCellListVm;
        let parentCells: ap.models.projects.ParentCell[] = [];
        let parentCell: ap.models.projects.ParentCell;
        let ids: string[];
        let parentCellVM: ap.viewmodels.projects.ParentCellViewModel;
        let args: ap.viewmodels.base.PropertyChangedEventArgs;

        beforeEach(() => {
            parentCell = new ap.models.projects.ParentCell(Utility);
            parentCells.push(parentCell);

            _deferred = $q.defer();
            spyOn(Api, "getEntityList").and.returnValue(_deferred.promise);
            let getProjectCellsDef = $q.defer();
            spyOn(ProjectService, "getProjectCells").and.returnValue(getProjectCellsDef.promise);
            parentCellList = new ParentCellListVm(Utility, $q, ControllersManager, ProjectService);
            spyOn(parentCellList, "clear");
            spyOn(parentCellList, "checkForDuplicatedItems");

            ids = [parentCell.Id];
            parentCellList.specifyIds(ids);
            parentCellList.loadNextPage();
            _deferred.resolve(new ap.services.apiHelper.ApiResponse(parentCells));
            $rootScope.$apply();
            parentCellList.valuesIdsDictionary[0].add(null, [parentCell.Id]);
            (<ap.viewmodels.projects.ParentCellViewModel>parentCellList.getItemAtIndex(0)).description = "blablabla";

            expect(parentCellList.hasChanged).toBeTruthy();

            parentCellList.cancel();
        });

        describe("WHEN cancel is called", () => {
            it("THEN, hasChanged is set back to false", () => {
                expect(parentCellList.hasChanged).toBeFalsy();
            });
        });
    });
});
