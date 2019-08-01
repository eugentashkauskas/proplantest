'use strict';
describe("Module ap-viewmodels - SubCellViewModel", () => {
    let $rootScope: angular.IRootScopeService, $scope: angular.IScope;
    let Utility: ap.utility.UtilityHelper, UserContext: ap.utility.UserContext;
    let vm: ap.viewmodels.projects.SubCellViewModel;
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
        describe("WHEN SubCellViewModel is created", () => {
            it("THEN, the properties are filled with the default values", () => {
                vm = new ap.viewmodels.projects.SubCellViewModel(Utility);

                expect(vm.code).toBe("");
                expect(vm.description).toBe("");
                expect(vm.fullName).toBe("");
                expect(vm.displayOrder).toBe(0);
                expect(vm.parentCellViewModel).toBeNull();
                expect(vm.isMarkedToDelete).toBeFalsy();
                expect(vm.actions.length).toEqual(2);
                expect(vm.actions[0].name).toEqual("subcell.insert");
                expect(vm.actions[1].name).toEqual("subcell.delete");
            });
        });

        describe("WHEN SubCellViewModel is created with SubCell is null", () => {
            it("THEN, the properties are filled with the default values", () => {

                let subCell: ap.models.projects.SubCell;

                vm = new ap.viewmodels.projects.SubCellViewModel(Utility);
                vm.init(subCell);

                expect(vm.code).toBe("");
                expect(vm.description).toBe("");
                expect(vm.fullName).toBe("");
                expect(vm.displayOrder).toBe(0);
                expect(vm.parentCellViewModel).toBeNull();
                expect(vm.isMarkedToDelete).toBeFalsy();
                expect(vm.actions.length).toEqual(2);
                expect(vm.actions[0].name).toEqual("subcell.insert");
                expect(vm.actions[1].name).toEqual("subcell.delete");
            });
        });

        describe("WHEN SubCellViewModel is created with SubCell", () => {
            it("THEN, the properties are filled with properties of SubCell with paren cell is defined", () => {

                let subCell: ap.models.projects.SubCell = new ap.models.projects.SubCell(Utility);
                subCell.Code = "SubCode";
                subCell.Description = "SubDescription";
                subCell.DisplayOrder = 7;
                subCell.ParentCell = new ap.models.projects.ParentCell(Utility);
                subCell.ParentCell.Code = "ParentCode";
                subCell.ParentCell.Description = "ParentDiscription";

                vm = new ap.viewmodels.projects.SubCellViewModel(Utility);
                vm.init(subCell);

                expect(vm.code).toEqual("SubCode");
                expect(vm.description).toEqual("SubDescription");
                expect(vm.fullName).toEqual("[SubCode] SubDescription");
                expect(vm.displayOrder).toEqual(7);
                expect(vm.parentCellViewModel.parentCell).toBe(subCell.ParentCell);
                expect(vm.isMarkedToDelete).toBeFalsy();
                expect(vm.actions.length).toEqual(2);
                expect(vm.actions[0].name).toEqual("subcell.insert");
                expect(vm.actions[1].name).toEqual("subcell.delete");
            });
        });

        describe("WHEN SubCellViewModel is created with SubCell and without parent cell", () => {
            it("THEN, the properties are filled with properties of SubCell and parentCellViewModel is null", () => {

                let subCell: ap.models.projects.SubCell = new ap.models.projects.SubCell(Utility);
                subCell.ParentCell = null;

                vm = new ap.viewmodels.projects.SubCellViewModel(Utility);
                vm.init(subCell);

                expect(vm.code).toEqual(subCell.Code);
                expect(vm.description).toEqual(subCell.Description);
                expect(vm.displayOrder).toEqual(subCell.DisplayOrder);
                expect(vm.parentCellViewModel).toBeNull();
                expect(vm.isMarkedToDelete).toBeFalsy();
                expect(vm.actions.length).toEqual(2);
                expect(vm.actions[0].name).toEqual("subcell.insert");
                expect(vm.actions[1].name).toEqual("subcell.delete");
            });
        });

        describe("WHEN postChanges is called with parent cell is defined", () => {
            it("THEN, the properties of Subcell will be filled by properties of SubCellViewModel but parent cell no change", () => {

                let subCell: ap.models.projects.SubCell = new ap.models.projects.SubCell(Utility);
                subCell.Code = "CodeSubCell";
                subCell.Description = "DescriptionSubCell";
                subCell.DisplayOrder = 7;
                subCell.ParentCell = new ap.models.projects.ParentCell(Utility);
                subCell.ParentCell.Code = "ParentCode";
                subCell.ParentCell.Description = "ParentDiscription";

                vm = new ap.viewmodels.projects.SubCellViewModel(Utility);
                vm.init(subCell);

                vm.code = "SubCode123";
                vm.description = "SubDescription123";
                vm.displayOrder = 5;
                vm.parentCellViewModel.code = "ParentCellCode";
                vm.parentCellViewModel.description = "ParentCellDescription";
                vm.parentCellViewModel.displayOrder = 7;

                vm.postChanges();

                expect(vm.subCell.Code).toEqual("SubCode123");
                expect(vm.subCell.Description).toEqual("SubDescription123");
                expect(vm.subCell.DisplayOrder).toEqual(5);
                expect(vm.subCell.ParentCell).toBe(subCell.ParentCell);
            });
           
        });
        describe("WHEN postChanges is called without parent cell", () => {
            it("THEN, parent cell of SubCell no change", () => {

                let subCell: ap.models.projects.SubCell = new ap.models.projects.SubCell(Utility);
                subCell.ParentCell = null;

                vm = new ap.viewmodels.projects.SubCellViewModel(Utility);
                vm.init(subCell);

                vm.postChanges();

                expect(vm.subCell.ParentCell).toBeNull();
            });
        });
    });

    describe("Feature: isValid", () => {

        let subCell: ap.models.projects.SubCell;
        let subCellVm: ap.viewmodels.projects.SubCellViewModel

        beforeEach(() => {
            subCellVm = new ap.viewmodels.projects.SubCellViewModel(Utility);
            subCell = new ap.models.projects.SubCell(Utility);
            subCell.DisplayOrder = 3;

        });
        describe("WHEN, call isValid and subCell code and description is defined ", () => {
            beforeEach(() => {
                subCell.Code = "CON";
                subCell.Description = "Conrecte";
                subCellVm.init(subCell);
            });
            it("THEN, isValid return true", () => {
                expect(subCellVm.isValid()).toBeTruthy();
            });
        });
        describe("WHEN, call isValid and subCell code and description is not defined", () => {
            beforeEach(() => {
                subCell.Code = null;
                subCell.Description = null;
                subCellVm.init(subCell);
            });
            it("THEN, isValid return false", () => {
                expect(subCellVm.isValid()).toBeFalsy();
            });
        });
        describe("WHEN, call isValid and subCell code and description is whitespace", () => {
            beforeEach(() => {
                subCellVm.init(subCell);
                subCellVm.code = "   ";
                subCellVm.description = "     ";
            });
            it("THEN, isValid return false", () => {
                expect(subCellVm.isValid()).toBeFalsy();
            });
        });

    });

    describe("Feature: actionClicked", () => {
        let callback;
        beforeEach(() => {
            callback = jasmine.createSpy("callback");
            vm = new ap.viewmodels.projects.SubCellViewModel(Utility);
        });
        describe("WHEN, actionCliked is called with param = subcell.insert ", () => {
            beforeEach(() => {
                vm.on("insertrowrequested", callback, this);
                vm.actionClicked("subcell.insert");
            });
            it("THEN, event insertrowrequested is raised", () => {
                expect(callback).toHaveBeenCalledWith(vm);
            });
        });
        describe("WHEN, actionCliked is called with param = subcell.delete ", () => {
            let args: ap.viewmodels.base.PropertyChangedEventArgs;
            let callbackPropretyChanged;
            beforeEach(() => {
                callbackPropretyChanged = jasmine.createSpy("callback");
                args = new ap.viewmodels.base.PropertyChangedEventArgs("delete", false, vm);
                vm.on("propertychanged", callbackPropretyChanged, this);
                vm.actionClicked("subcell.delete");
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
            vm = new ap.viewmodels.projects.SubCellViewModel(Utility);
        });
        describe("WHEN, undoDelete is called", () => {
            beforeEach(() => {
                callbackPropretyChanged = jasmine.createSpy("callback");
                args = new ap.viewmodels.base.PropertyChangedEventArgs("undelete", true, vm);
                vm.on("propertychanged", callbackPropretyChanged, this);
                vm.undoDelete();
            });
            it("THEN, isMarkedToDelete = false", () => {
                expect(vm.isMarkedToDelete).toBeFalsy();
            });
            it("THEN, isVisible = true", () => {
                expect(vm.actions[1].isVisible).toBeTruthy();
            });
            it("THEN, raisePropertyChanged is called with correct params", () => {
                expect(callbackPropretyChanged).toHaveBeenCalledWith(args);
            });
        });
    });

    describe("Feature set display order", () => {
        let args: ap.viewmodels.base.PropertyChangedEventArgs;
        let callbackPropretyChanged;
        beforeEach(() => {
            vm = new ap.viewmodels.projects.SubCellViewModel(Utility);
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
        let subCellVm: ap.viewmodels.projects.SubCellViewModel;
        let originalEntity: ap.models.projects.SubCell;
        beforeEach(() => {
            subCellVm = new ap.viewmodels.projects.SubCellViewModel(Utility);
        });
        describe("WHEN the originalEntity.isNew = true", () => {
            beforeEach(() => {
                originalEntity = new ap.models.projects.SubCell(Utility);
                subCellVm.init(originalEntity);
            });
            it("THEN hasChanged return true", () => {
                expect(subCellVm.hasChanged).toBeTruthy();
            });
        });
        describe("WHEN the originalEntity.isNew = false", () => {
            describe("WHEN the originalEntity is the same", () => {
                beforeEach(() => {
                    originalEntity = new ap.models.projects.SubCell(Utility);
                    originalEntity.createByJson({ Code: "aaa" });
                    subCellVm.init(originalEntity);
                });
                describe("WHEN isMarkedToDelete is false", () => {
                    it("THEN hasChanged return false", () => {
                        expect(subCellVm.hasChanged).toBeFalsy();
                    });
                });
                describe("WHEN isMarkedToDelete is true", () => {
                    beforeEach(() => {
                        subCellVm.actionClicked("subcell.delete");
                    });
                    it("THEN hasChanged return true", () => {
                        expect(subCellVm.hasChanged).toBeTruthy();
                    });
                });
            });
            describe("WHEN the originalEntity is not the same", () => {
                beforeEach(() => {
                    originalEntity = new ap.models.projects.SubCell(Utility);
                    originalEntity.createByJson({ Code: "aaa" });
                    subCellVm.init(originalEntity);
                    subCellVm.displayOrder = 1000;
                });
                it("THEN hasChanged return true", () => {
                    expect(subCellVm.hasChanged).toBeTruthy();
                });
            });
        });
    });
    describe("Feature: enableActions", () => {
        beforeEach(() => {
            vm = new ap.viewmodels.projects.SubCellViewModel(Utility);
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
            vm = new ap.viewmodels.projects.SubCellViewModel(Utility);
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