'use strict';
describe("Module ap-viewmodels - reports", () => {
    var nmp = ap.viewmodels.reports;
    var MainController: ap.controllers.MainController, Utility: ap.utility.UtilityHelper, Api: ap.services.apiHelper.Api, UserContext: ap.utility.UserContext, UIStateController: ap.controllers.UIStateController;
    var $controller: angular.IControllerService, $rootScope: angular.IRootScopeService, $scope: angular.IScope, _deferred: angular.IDeferred<ap.services.apiHelper.ApiResponse>,
        $q: angular.IQService, $timeout: angular.ITimeoutService, $compile: angular.ICompileService;

    var columnsViewModel: ap.viewmodels.reports.ColumnsViewModel = null;

    let columnsPrinted: ap.models.reports.ReportNoteColumn[];
    let columnsAvailable: ap.models.reports.ReportColumnDefNote[];

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });
    beforeEach(inject(function (_$rootScope_, _$q_, _$timeout_, _$compile_, _UserContext_, _Utility_, _Api_, _MainController_, _UIStateController_, _$controller_) {
        MainController = _MainController_;
        UIStateController = _UIStateController_;
        Utility = _Utility_;
        UserContext = _UserContext_;
        Api = _Api_;
        $q = _$q_;
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $timeout = _$timeout_;
        _deferred = $q.defer();
        $controller = _$controller_;
        $scope = $rootScope.$new();
        specHelper.utility.stubRootUrl(Utility);
        specHelper.userContext.stub(Utility);
        Utility.Storage.Session.clear();
        specHelper.utility.stubStorageSet(Utility);

        let col1 = new ap.models.reports.ReportNoteColumn(Utility);
        col1.PropertyName = "A";
        let col2 = new ap.models.reports.ReportNoteColumn(Utility);
        col2.PropertyName = "B";
        let col3 = new ap.models.reports.ReportNoteColumn(Utility);
        col3.PropertyName = "C";

        columnsPrinted = [];
        columnsPrinted.push(col1, col2, col3);

        let def_col1 = new ap.models.reports.ReportColumnDefNote(Utility);
        def_col1.PropertyName = "X";
        def_col1.CanHideCol = true;
        def_col1.IsVisible = true;
        let def_col2 = new ap.models.reports.ReportColumnDefNote(Utility);
        def_col2.PropertyName = "Y";
        def_col2.CanHideCol = true;
        def_col2.IsVisible = true;
        let def_col3 = new ap.models.reports.ReportColumnDefNote(Utility);
        def_col3.PropertyName = "Z";
        def_col3.CanHideCol = true;
        def_col3.IsVisible = true;

        columnsAvailable = [];
        columnsAvailable.push(def_col1, def_col2, def_col3);

        let def_col4 = new ap.models.reports.ReportColumnDefNote(Utility);
        def_col4.PropertyName = "A";
        def_col4.CanHideCol = true;
        def_col4.IsVisible = true;
        let def_col5 = new ap.models.reports.ReportColumnDefNote(Utility);
        def_col5.PropertyName = "B";
        def_col5.CanHideCol = true;
        def_col5.IsVisible = true;
        let def_col6 = new ap.models.reports.ReportColumnDefNote(Utility);
        def_col6.PropertyName = "C";
        def_col6.CanHideCol = true;
        def_col6.IsVisible = true;

        columnsAvailable.push(def_col4, def_col5, def_col6);
    }));

    describe("Feature ColumnsViewModel: init values", () => {
        describe("WHEN the ColumnsViewModel is created", () => {
            it("THEN I can get an instance of my viewmodel with default values", () => {
                columnsViewModel = new ap.viewmodels.reports.ColumnsViewModel(Utility, null, null);
                expect(columnsViewModel.columnsAvailable).not.toBeNull();
                var subjectColumn = new ap.viewmodels.reports.ReportColumnViewModel(Utility);
                subjectColumn.propertyName = "Subject";
                subjectColumn.displayOrder = 1;
                var roomColumn = new ap.viewmodels.reports.ReportColumnViewModel(Utility);
                roomColumn.propertyName = "Room";
                roomColumn.displayOrder = 2;
                var columns: ap.viewmodels.reports.ReportColumnViewModel[] = [subjectColumn, roomColumn];
                columnsViewModel.columnsAvailable = columns;
                expect(columnsViewModel.columnsAvailable.length).toEqual(2);
                expect(columnsViewModel.columnsAvailable[0].displayOrder).toEqual(subjectColumn.displayOrder);
                expect(columnsViewModel.columnsAvailable[0].propertyName).toEqual(subjectColumn.propertyName);
                expect(columnsViewModel.columnsAvailable[0].isChecked).toBeFalsy();
                expect(columnsViewModel.columnsAvailable[0].canHide).toBeFalsy();
                expect(columnsViewModel.columnsAvailable[0].canOrder).toBeFalsy();

                expect(columnsViewModel.columnsAvailable[1].displayOrder).toEqual(roomColumn.displayOrder);
                expect(columnsViewModel.columnsAvailable[1].propertyName).toEqual(roomColumn.propertyName);
                expect(columnsViewModel.columnsAvailable[1].isChecked).toBeFalsy();
                expect(columnsViewModel.columnsAvailable[1].canHide).toBeFalsy();
                expect(columnsViewModel.columnsAvailable[1].canOrder).toBeFalsy();
            });
        });

        describe("WHEN the ColumnsViewModel is created with printed columns and available columns", () => {
            let columnsVM: ap.viewmodels.reports.ColumnsViewModel;
            beforeEach(() => {
                columnsPrinted[0].DisplayOrder = 3;                
                columnsPrinted[1].DisplayOrder = 2;                
                columnsPrinted[2].DisplayOrder = 1;                
                columnsVM = new ap.viewmodels.reports.ColumnsViewModel(Utility, columnsPrinted, columnsAvailable);
            });

            it("THEN, there are 6 columns available", () => { expect(columnsVM.columnsAvailable.length).toEqual(6); })
            it("THEN, column 1 is property C", () => { expect(columnsVM.columnsAvailable[0].propertyName).toEqual("C"); })
            it("THEN, column 2 is property B", () => { expect(columnsVM.columnsAvailable[1].propertyName).toEqual("B"); })
            it("THEN, column 3 is property A", () => { expect(columnsVM.columnsAvailable[2].propertyName).toEqual("A"); })

            it("THEN, column 1 display order = 0", () => { expect(columnsVM.columnsAvailable[0].displayOrder).toEqual(0); })
            it("THEN, column 2 display order = 1", () => { expect(columnsVM.columnsAvailable[1].displayOrder).toEqual(1); })
            it("THEN, column 3 display order = 2", () => { expect(columnsVM.columnsAvailable[2].displayOrder).toEqual(2); })

            it("THEN, column 4 display order = 3", () => { expect(columnsVM.columnsAvailable[3].displayOrder).toEqual(3); })
            it("THEN, column 5 display order = 4", () => { expect(columnsVM.columnsAvailable[4].displayOrder).toEqual(4); })
            it("THEN, column 6 display order = 5", () => { expect(columnsVM.columnsAvailable[5].displayOrder).toEqual(5); })
            
            it("THEN, column 1 is Checked = true", () => { expect(columnsVM.columnsAvailable[0].isChecked).toBeTruthy(); })
            it("THEN, column 2 is Checked = true", () => { expect(columnsVM.columnsAvailable[1].isChecked).toBeTruthy(); })
            it("THEN, column 3 is Checked = true", () => { expect(columnsVM.columnsAvailable[2].isChecked).toBeTruthy(); })
            
            it("THEN, column 4 is Checked = false", () => { expect(columnsVM.columnsAvailable[3].isChecked).toBeFalsy(); })
            it("THEN, column 5 is Checked = false", () => { expect(columnsVM.columnsAvailable[4].isChecked).toBeFalsy(); })
            it("THEN, column 6 is Checked = false", () => { expect(columnsVM.columnsAvailable[5].isChecked).toBeFalsy(); })            
        });
    });

    describe("Feature ColumnsViewModel: postchanges", () => {
        describe("WHEN call post change and tergetCollection is undefined", () => {
            let columnsVM: ap.viewmodels.reports.ColumnsViewModel;
            let result: ap.models.reports.ReportNoteColumn[];            
            beforeEach(() => {
                columnsVM = new ap.viewmodels.reports.ColumnsViewModel(Utility, [columnsPrinted[2]], columnsAvailable);
            });
            it("THEN, it throw expected error", () => {
                expect(() => { columnsVM.postChanges(ap.models.reports.ReportNoteColumn, result); }).toThrowError("'targetCollection' is mandatory");
            });
        });

        describe("WHEN init with 1 coulum printed and call post change with NoteColumn", () => {
            let columnsVM: ap.viewmodels.reports.ColumnsViewModel;
            let result: ap.models.reports.ReportNoteColumn[] = [];
            let expectedColumnName: string;
            beforeEach(() => {                
                columnsPrinted[2].DisplayOrder = 1;
                expectedColumnName = columnsPrinted[2].PropertyName;
                columnsVM = new ap.viewmodels.reports.ColumnsViewModel(Utility, [columnsPrinted[2]], columnsAvailable);

                columnsVM.postChanges(ap.models.reports.ReportNoteColumn, result);
            });
            it("THEN, there is one column", () => {
                expect(result.length).toEqual(1);
            });
            it("THEN, the column name is correctly post", () => {
                expect(result[0].PropertyName).toEqual(expectedColumnName);
            });
        });

        describe("WHEN init with 1 coulum printed and call post change with ParticipantColumn", () => {
            let columnsVM: ap.viewmodels.reports.ColumnsViewModel;
            let result: ap.models.reports.ReportParticipantColumn[] = [];
            let expectedColumnName: string;
            beforeEach(() => {
                columnsPrinted[2].DisplayOrder = 1;
                expectedColumnName = columnsPrinted[2].PropertyName;
                columnsVM = new ap.viewmodels.reports.ColumnsViewModel(Utility, [columnsPrinted[2]], columnsAvailable);

                columnsVM.postChanges(ap.models.reports.ReportParticipantColumn, result);
            });
            it("THEN, there is one column", () => {
                expect(result.length).toEqual(1);
            });
            it("THEN, the column name is correctly post", () => {
                expect(result[0].PropertyName).toEqual(expectedColumnName);
            });
        });
    });


    describe("Feature ColumnsViewModel: checked change to re-order columns", () => {
        describe("WHhen there is 3 columns checked and the first one become UN-checked", () => {
            let columnsVM: ap.viewmodels.reports.ColumnsViewModel;
            let col1, col2, col3: ap.viewmodels.reports.ReportColumnViewModel;            
            beforeEach(() => {
                columnsPrinted[0].DisplayOrder = 3;
                columnsPrinted[1].DisplayOrder = 2;
                columnsPrinted[2].DisplayOrder = 1;
                columnsVM = new ap.viewmodels.reports.ColumnsViewModel(Utility, columnsPrinted, columnsAvailable);

                col1 = columnsVM.columnsAvailable[0];
                col2 = columnsVM.columnsAvailable[1];
                col3 = columnsVM.columnsAvailable[2];
                col1.isChecked = false;
            });
            it("THEN, column1 moved to position 3", () => {
                expect(columnsVM.columnsAvailable[2]).toEqual(col1);
            });
            it("THEN, column2 moved to position 1", () => {
                expect(columnsVM.columnsAvailable[0]).toEqual(col2);
            });
            it("THEN, column3 moved to position 2", () => {
                expect(columnsVM.columnsAvailable[1]).toEqual(col3);
            });
        });

        describe("WHhen there is 3 columns checked and the last one become checked", () => {
            let columnsVM: ap.viewmodels.reports.ColumnsViewModel;
            let col1, col2, col3, col6: ap.viewmodels.reports.ReportColumnViewModel;
            beforeEach(() => {
                columnsPrinted[0].DisplayOrder = 3;
                columnsPrinted[1].DisplayOrder = 2;
                columnsPrinted[2].DisplayOrder = 1;
                columnsVM = new ap.viewmodels.reports.ColumnsViewModel(Utility, columnsPrinted, columnsAvailable);

                col1 = columnsVM.columnsAvailable[0];
                col2 = columnsVM.columnsAvailable[1];
                col3 = columnsVM.columnsAvailable[2];
                col6 = columnsVM.columnsAvailable[5];
                col6.isChecked = true;
            });
            it("THEN, column 6 moved to position 4", () => {
                expect(columnsVM.columnsAvailable[3]).toEqual(col6);
            });
            it("THEN, column 1 still in position 1", () => {
                expect(columnsVM.columnsAvailable[0]).toEqual(col1);
            });
            it("THEN, column 1 display order 0", () => {
                expect(columnsVM.columnsAvailable[0].displayOrder).toEqual(0);
            });
            it("THEN, column 2 still in position 2", () => {
                expect(columnsVM.columnsAvailable[1]).toEqual(col2);
            });
            it("THEN, column 2 display order 1", () => {
                expect(columnsVM.columnsAvailable[1].displayOrder).toEqual(1);
            });
            it("THEN, column 3 still in position 3", () => {
                expect(columnsVM.columnsAvailable[2]).toEqual(col3);
            });
            it("THEN, column 3 display order 2", () => {
                expect(columnsVM.columnsAvailable[2].displayOrder).toEqual(2);
            });
            it("THEN, column 4 display order 3", () => {
                expect(columnsVM.columnsAvailable[3].displayOrder).toEqual(3);
            });
            
        });
    });

    describe("Feature: addDraggableEntity", () => {
        let columnsVM: ap.viewmodels.reports.ColumnsViewModel;
        beforeEach(() => {
            columnsVM = new ap.viewmodels.reports.ColumnsViewModel(Utility, columnsPrinted, columnsAvailable);
        });
        describe("WHEN call addDraggableEntity method with the entity parameter", () => {
            let draggableEntity: ap.viewmodels.reports.ReportColumnViewModel;
            beforeEach(() => {
                draggableEntity = new ap.viewmodels.reports.ReportColumnViewModel(Utility);
                draggableEntity.propertyName = "test draggable entity";
            });
            describe("AND no previous entities were set", () => {
                beforeEach(() => {
                    columnsVM.addDraggableEntity(draggableEntity);
                });
                it("THEN, selected value will be added to the dragOptions", () => {
                    expect(columnsVM.dragOptions.selectedData.length).toEqual(1);
                    expect(columnsVM.dragOptions.selectedData[0]).toEqual(draggableEntity);
                    expect(columnsVM.dragOptions.selectedData[0].dragId).toEqual("test draggable entity");
                });
            });
            describe("AND entities were set previously", () => {
                beforeEach(() => {
                    let prevDraggableEntity = new ap.viewmodels.reports.ReportColumnViewModel(Utility);
                    prevDraggableEntity.propertyName = "test draggable entity prev";
                    columnsVM.addDraggableEntity(prevDraggableEntity);
                    columnsVM.addDraggableEntity(draggableEntity);
                });
                it("THEN remove previous entity from dragOptions and add new one", () => {
                    expect(columnsVM.dragOptions.selectedData.length).toEqual(1);
                    expect(columnsVM.dragOptions.selectedData[0]).toEqual(draggableEntity);
                    expect(columnsVM.dragOptions.selectedData[0].dragId).toEqual("test draggable entity");
                });
            });
        });
    });
    describe("Feature: drop column", () => {
        let columnsVM: ap.viewmodels.reports.ColumnsViewModel;
        let col1, col2, col3, col4;
        beforeEach(() => {
            let getTestReportEntity = function (propName: string, displayOrder: number) {
                let col = new ap.models.reports.ReportColumnDefBase(Utility);
                col.PropertyName = propName;
                col.DisplayOrder = displayOrder;
                col.IsVisible = true;
                return col;
            }
            col1 = getTestReportEntity("col1", 0);
            col2 = getTestReportEntity("col2", 1);
            col3 = getTestReportEntity("col3", 2);
            col4 = getTestReportEntity("col4", 3);
            let inputColumns = [col1, col2, col3, col4];
            columnsVM = new ap.viewmodels.reports.ColumnsViewModel(Utility, [], inputColumns);
            columnsVM.columnsAvailable.forEach((column) => { column.isChecked = true; });
        });
        describe("WHEN we move first column to the fourth", () => {
            beforeEach(() => {
                let colsAvailable = columnsVM.columnsAvailable;
                colsAvailable[0].drop(colsAvailable[3]);
            });
            it("THEN, columns will be sorted", () => {
                expect(columnsVM.columnsAvailable[0].propertyName).toEqual("col2");
                expect(columnsVM.columnsAvailable[1].propertyName).toEqual("col3");
                expect(columnsVM.columnsAvailable[2].propertyName).toEqual("col4");
                expect(columnsVM.columnsAvailable[3].propertyName).toEqual("col1");                
            });
            it("THEN, columns' displayOrder property will be recalculated", () => {
                expect(columnsVM.columnsAvailable[0].displayOrder).toEqual(0);
                expect(columnsVM.columnsAvailable[1].displayOrder).toEqual(1);
                expect(columnsVM.columnsAvailable[2].displayOrder).toEqual(2);
                expect(columnsVM.columnsAvailable[3].displayOrder).toEqual(3);                
            });
        });
        describe("WHEN third column moved to the first", () => {
            beforeEach(() => {
                let colsAvailable = columnsVM.columnsAvailable;
                colsAvailable[2].drop(colsAvailable[0]);
            });
            it("THEN, displayOrder property will be recalculated for all columns except fourth and columns will be sorted", () => {
                expect(columnsVM.columnsAvailable[0].propertyName).toEqual("col3");
                expect(columnsVM.columnsAvailable[1].propertyName).toEqual("col1");
                expect(columnsVM.columnsAvailable[2].propertyName).toEqual("col2");
                expect(columnsVM.columnsAvailable[3].propertyName).toEqual("col4");
            });
            it("THEN, columns' displayOrder property will be recalculated", () => {
                expect(columnsVM.columnsAvailable[0].displayOrder).toEqual(0);
                expect(columnsVM.columnsAvailable[1].displayOrder).toEqual(1);
                expect(columnsVM.columnsAvailable[2].displayOrder).toEqual(2);
                expect(columnsVM.columnsAvailable[3].displayOrder).toEqual(3);
            });
        });        
    });
    
});   