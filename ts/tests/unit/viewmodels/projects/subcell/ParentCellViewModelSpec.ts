describe("Module app-viewmodels - ParentCellViewModel", () => {
    let $rootScope: angular.IRootScopeService, $scope: angular.IScope;
    let Utility: ap.utility.UtilityHelper, UserContext: ap.utility.UserContext;
    let $q: angular.IQService;
    let vm: ap.viewmodels.projects.ParentCellViewModel;

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
        describe("WHEN ParentCellViewModel is created", () => {
            it("WHEN, the properties are filled with the default values", () => {

                vm = new ap.viewmodels.projects.ParentCellViewModel(Utility);

                expect(vm.code).toBe("");
                expect(vm.description).toBe("");
                expect(vm.fullName).toBe("");
                expect(vm.displayOrder).toBe(0);
                expect(vm.isMarkedToDelete).toBeFalsy();
                expect(vm.actions.length).toEqual(2);
                expect(vm.actions[0].name).toEqual("parentcell.insert");
                expect(vm.actions[1].name).toEqual("parentcell.delete");
             });
        });

        describe("WHEN ParentCellViewModel is created with ParentCell is null", () => {
            it("WHEN, the properties are filled with the default values", () => {

                let parentCell: ap.models.projects.ParentCell;
                vm = new ap.viewmodels.projects.ParentCellViewModel(Utility);
                vm.init(parentCell);

                expect(vm.code).toBe("");
                expect(vm.description).toBe("");
                expect(vm.fullName).toBe("");
                expect(vm.displayOrder).toBe(0);
                expect(vm.isMarkedToDelete).toBeFalsy();
                expect(vm.actions.length).toEqual(2);
                expect(vm.actions[0].name).toEqual("parentcell.insert");
                expect(vm.actions[1].name).toEqual("parentcell.delete");
            });
        });

        describe("WHEN ParentCellViewModel is created with ParentCell is definded", () => {
            it("WHEN, the properties are filled with properties ParentCell", () => {

                let parentCell: ap.models.projects.ParentCell = new ap.models.projects.ParentCell(Utility);

                parentCell.Code = "ParentCell";
                parentCell.Description = "CellA";
                parentCell.DisplayOrder = 5;

                vm = new ap.viewmodels.projects.ParentCellViewModel(Utility);
                vm.init(parentCell);

                expect(vm.code).toEqual("ParentCell");
                expect(vm.description).toEqual("CellA");
                expect(vm.fullName).toEqual("[ParentCell] CellA");
                expect(vm.displayOrder).toEqual(5);
                expect(vm.isMarkedToDelete).toBeFalsy();
                expect(vm.actions.length).toEqual(2);
                expect(vm.actions[0].name).toEqual("parentcell.insert");
                expect(vm.actions[1].name).toEqual("parentcell.delete");
            });
        });


        describe("WHEN postChanges is called", () => {
            it("THEN, the properties of ParentCell will be filled by to properties of ParentCellViewModel", () => {

                let parentCell: ap.models.projects.ParentCell;
                parentCell = new ap.models.projects.ParentCell(Utility);
              
                parentCell.Code = "CodeParentCell";
                parentCell.Description = "DescriptionParentCell";
                parentCell.DisplayOrder = 10;

                vm = new ap.viewmodels.projects.ParentCellViewModel(Utility);
                vm.init(parentCell);
            
                vm.code = "ParentCellABC";
                vm.description = "CellABC";
                vm.displayOrder = 7;

                vm.postChanges();

                expect(vm.parentCell.Code).toEqual("ParentCellABC");
                expect(vm.parentCell.Description).toEqual("CellABC");
                expect(vm.parentCell.DisplayOrder).toEqual(7);
            });
        });

    });
    describe("Feature: isValid", () => {

        let parentCell: ap.models.projects.ParentCell;
        let parentCellVm: ap.viewmodels.projects.ParentCellViewModel

        beforeEach(() => {
            parentCellVm = new ap.viewmodels.projects.ParentCellViewModel(Utility);
            parentCell = new ap.models.projects.ParentCell(Utility);
            parentCell.DisplayOrder = 3;

        });
        describe("WHEN, call isValid and parentCell code and description is defined ", () => {
            beforeEach(() => {
                parentCell.Code = "CON";
                parentCell.Description = "Conrecte";
                parentCellVm.init(parentCell);
            });
            it("THEN, isValid return true", () => {
                expect(parentCellVm.isValid()).toBeTruthy();
            });
        });
        describe("WHEN, call isValid and parentCell code and description is not defined", () => {
            beforeEach(() => {
                parentCell.Code = null;
                parentCell.Description = null;
                parentCellVm.init(parentCell);
            });
            it("THEN, isValid return false", () => {
                expect(parentCellVm.isValid()).toBeFalsy();
            });
        });
        describe("WHEN, call isValid and parentCell code and description is whitespace", () => {
            beforeEach(() => {
                parentCellVm.init(parentCell);
                parentCellVm.code = " ";
                parentCellVm.description = " ";
            });
            it("THEN, isValid return false", () => {
                expect(parentCellVm.isValid()).toBeFalsy();
            });
        });

    });

    describe("Feature: actionClicked", () => {
        let callback;
        beforeEach(() => {
            callback = jasmine.createSpy("callback");
            vm = new ap.viewmodels.projects.ParentCellViewModel(Utility);
        });
        describe("WHEN, actionCliked is called with param = parentcell.insert ", () => {
            beforeEach(() => {
                vm.on("insertrowrequested", callback, this);
                vm.actionClicked("parentcell.insert");
            });
            it("THEN, event insertrowrequested is raised", () => {
                expect(callback).toHaveBeenCalledWith(vm);
            });
        });
        describe("WHEN, actionCliked is called with param = parentcell.delete ", () => {
            let args: ap.viewmodels.base.PropertyChangedEventArgs;
            let callbackPropretyChanged;
            beforeEach(() => {
                callbackPropretyChanged = jasmine.createSpy("callback");
                args = new ap.viewmodels.base.PropertyChangedEventArgs("delete", false, vm);
                vm.on("propertychanged", callbackPropretyChanged, this);
                vm.actionClicked("parentcell.delete");
            });
            it("THEN, isMarkedToDelete = true", () => {
                expect(vm.isMarkedToDelete).toBeTruthy();
            });
            it("THEN, isVisible = false", () => {
                expect(vm.actions[1].isVisible).toBeFalsy();
            });
            it("THEN, raisePropertyChanged is called with correct params", () => {
                expect(callbackPropretyChanged).toHaveBeenCalledWith(args);
            });
        });
    });

    describe("Feature: undoDelete", () => {
        let args: ap.viewmodels.base.PropertyChangedEventArgs;
        let callbackPropretyChanged;
        beforeEach(() => {
            vm = new ap.viewmodels.projects.ParentCellViewModel(Utility);
        });
        describe("WHEN, undoDelete is called", () => {
            beforeEach(() => {
                callbackPropretyChanged = jasmine.createSpy("callback");
                args = new ap.viewmodels.base.PropertyChangedEventArgs("undelete", false, vm);
                vm.on("propertychanged", callbackPropretyChanged, this);
                vm.undoDelete();
            });
            it("THEN, isMarkedToDelete = false", () => {
                expect(vm.isMarkedToDelete).toBeFalsy();
            });
            it("THEN, isVisible = true", () => {
                expect(vm.actions[1].isVisible).toBeTruthy();
            });
            it("THEN, raisePropertyChanged is called", () => {
                expect(callbackPropretyChanged).toHaveBeenCalled();
            });
        });
    });

    describe("Feature set display order", () => {
        let args: ap.viewmodels.base.PropertyChangedEventArgs;
        let callbackPropretyChanged;
        beforeEach(() => {
            vm = new ap.viewmodels.projects.ParentCellViewModel(Utility);
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

    describe("Feature: computeHasChanged", () => {
        let parentCellVm: ap.viewmodels.projects.ParentCellViewModel;
        let originalEntity: ap.models.projects.ParentCell;
        beforeEach(() => {
            parentCellVm = new ap.viewmodels.projects.ParentCellViewModel(Utility);
        });
        describe("WHEN the originalEntity.isNew = true", () => {
            beforeEach(() => {
                originalEntity = new ap.models.projects.ParentCell(Utility);
                parentCellVm.init(originalEntity);
            });
            it("THEN hasChanged return true", () => {
                expect(parentCellVm.hasChanged).toBeTruthy();
            });
        });
        describe("WHEN the originalEntity.isNew = false", () => {
            describe("WHEN the originalEntity is the same", () => {
                beforeEach(() => {
                    originalEntity = new ap.models.projects.ParentCell(Utility);
                    originalEntity.createByJson({ Code: "aaa" });
                    parentCellVm.init(originalEntity);
                });
                describe("WHEN isMarkedToDelete is false", () => {
                    it("THEN hasChanged return false", () => {
                        expect(parentCellVm.hasChanged).toBeFalsy();
                    });
                });
                describe("WHEN isMarkedToDelete is true", () => {
                    beforeEach(() => {
                        parentCellVm.actionClicked("parentcell.delete");
                    });
                    it("THEN hasChanged return true", () => {
                        expect(parentCellVm.hasChanged).toBeTruthy();
                    });
                });
            });
            describe("WHEN the originalEntity is not the same", () => {
                beforeEach(() => {
                    originalEntity = new ap.models.projects.ParentCell(Utility);
                    originalEntity.createByJson({ Code: "aaa" });
                    parentCellVm.init(originalEntity);
                    parentCellVm.displayOrder = 1000;
                });
                it("THEN hasChanged return true", () => {
                    expect(parentCellVm.hasChanged).toBeTruthy();
                });
            });
        });
    });
    describe("Feature: enableActions", () => {
        beforeEach(() => {
            vm = new ap.viewmodels.projects.ParentCellViewModel(Utility);
            vm.actions[0].isEnabled = false;
            vm.actions[1].isEnabled = false;
            vm.enableActions();
        });
        describe("WHEN call enableActions", () => {
            it("THEN, actions is enabled", () => {
                expect(vm.actions[0].isEnabled).toBeTruthy();
                expect(vm.actions[1].isEnabled).toBeTruthy();
            });
        });
    });
    describe("Feature: disableActions", () => {
        beforeEach(() => {
            vm = new ap.viewmodels.projects.ParentCellViewModel(Utility);
            vm.disableActions();
        });
        describe("WHEN call disableActions", () => {
            it("THEN, actions is disabled", () => {
                expect(vm.actions[0].isEnabled).toBeFalsy();
                expect(vm.actions[1].isEnabled).toBeFalsy();
            });
        });
    });
});