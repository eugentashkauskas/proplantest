describe("Module ap-viewmodels - ImportExcelRoomViewModel", () => {
    let Utility: ap.utility.UtilityHelper;
    let ControllersManager: ap.controllers.ControllersManager;
    let $q: angular.IQService;
    let $rootScope: angular.IRootScopeService;
    let $mdDialog: angular.material.IDialogService;
    let importExcelRoomViewModel: ap.viewmodels.projects.ImportExcelRoomViewModel;
    let title: string;
    let description: string;
    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
        angular.mock.module(function ($provide) {
            $provide.factory('$mdDialog', ["$q", function ($q) {
                return specHelper.utility.stubShowMdDialog($q);
            }]);
        });
    });

    beforeEach(inject((_Utility_, _$q_, _$rootScope_, _ControllersManager_, _$mdDialog_) => {
        Utility = _Utility_;
        specHelper.utility.stubRootUrl(_Utility_);
        $q = _$q_;
        $rootScope = _$rootScope_;
        ControllersManager = _ControllersManager_;
        $mdDialog = _$mdDialog_;
        title = "Import rooms from an Excel file";
        description = "To import a rooms list from an Excel file into AproPLAN, please organize the rooms as explained below\n\n - Column A: Code level 1\n - Column B: Description level 1\n - Column C: Code level 2\n - Column D: Description level 2\n\nMake sure all the lines are filled in.\nThe rooms of the Excel file will be added to the existing rooms in APROPLAN.\nPlease find below an example of an Excel file";
        spyOn(Utility.Translator, "getTranslation").and.callFake((key) => {
            if (key === "Import rooms from an Excel file")
                return title;
            if (key === "importexcel.room.desc")
                return description;
        });
        specHelper.mainController.stub(ControllersManager.mainController, Utility);
    }));

    function createParentCell(code: string, description: string): ap.models.projects.ParentCell {
        let parentCell = new ap.models.projects.ParentCell(Utility);
        parentCell.Code = code;
        parentCell.Description = description;
        parentCell.SubCells = [];
        return parentCell;
    }

    function createSubCell(code: string, description: string): ap.models.projects.SubCell {
        let subCell = new ap.models.projects.SubCell(Utility);
        subCell.Code = code;
        subCell.Description = description;
        return subCell;
    }

    describe("Feature: constructor", () => {
        describe("WHEN ImportExcelRoomViewModel is created", () => {
            beforeEach(() => {
                importExcelRoomViewModel = new ap.viewmodels.projects.ImportExcelRoomViewModel(Utility, $q, $mdDialog, ControllersManager);
            });
            it("THEN importType = room", () => {
                expect(importExcelRoomViewModel.importType).toEqual(ap.viewmodels.projects.ImportType.Room);
            });
            it("THEN titleKey = Import rooms from an Excel file", () => {
                expect(importExcelRoomViewModel.titleKey).toEqual(title);
            });
            it("THEN description = importexcel.room.desc", () => {
                expect(importExcelRoomViewModel.descriptionKey).toEqual("importexcel.room.desc");
            });
            it("THEN sampleImagePath = import_room.png", () => {
                expect(importExcelRoomViewModel.sampleImagePath).toEqual(Utility.rootUrl + "Images/Import/import_room.png");
            });
        });
    });

    describe("Feature: createImportedData", () => {
        let parentCellList: ap.models.projects.ParentCell[];
        let p1: ap.models.projects.ParentCell;
        let p2: ap.models.projects.ParentCell;
        let s1: ap.models.projects.SubCell;
        let s2: ap.models.projects.SubCell;
        let def: ng.IDeferred<string[][]>;

        beforeEach(() => {
            def = $q.defer();
            p1 = createParentCell("AP", "ap");
            p2 = createParentCell("BP", "bp");
            s1 = createSubCell("AS", "as");
            s2 = createSubCell("BS", "bs");
            parentCellList = [];
            spyOn(ControllersManager.importExcelController, "readExcelContent").and.returnValue(def.promise);
            specHelper.general.spyProperty(ap.viewmodels.projects.ImportExcelViewModel.prototype, "canImport", specHelper.PropertyAccessor.Get).and.returnValue(true);
        });
        afterEach(() => {
            specHelper.general.offSpyProperty(ap.viewmodels.projects.ImportExcelViewModel.prototype, "canImport", specHelper.PropertyAccessor.Get);
        });

        describe("WHEN excelData containts two parent cells and one sub cell for each parent", () => {
            beforeEach(() => {
                p1.SubCells.push(s1);
                p2.SubCells.push(s2);
                parentCellList.push(p1);
                parentCellList.push(p2);
                importExcelRoomViewModel = new ap.viewmodels.projects.ImportExcelRoomViewModel(Utility, $q, $mdDialog, ControllersManager);
                importExcelRoomViewModel.import();
                def.resolve([["AP", "ap", "AS", "as"], ["BP", "bp", "BS", "bs"]]);
                $rootScope.$apply();
            });
            it("THEN importedData's info is equal to the parentCellList data", () => {
                expect(importExcelRoomViewModel.importedData.length).toEqual(2);
            });
            it("AND the project of the first cell equals the project of the mainController", () => {
                expect((<ap.models.projects.ParentCell>importExcelRoomViewModel.importedData[0]).ProjectId).toEqual(ControllersManager.mainController.currentProject().Id);
            });
            it("AND the project of the second cell equals the project of the mainController", () => {
                expect((<ap.models.projects.ParentCell>importExcelRoomViewModel.importedData[1]).ProjectId).toEqual(ControllersManager.mainController.currentProject().Id);
            });
            it("AND the code of the first cell equals the first code of the Excel file", () => {
                expect((<ap.models.projects.ParentCell>importExcelRoomViewModel.importedData[0]).Code).toEqual(p1.Code);
            });
            it("AND the description of the first cell equals the first description of the Excel file", () => {
                expect((<ap.models.projects.ParentCell>importExcelRoomViewModel.importedData[0]).Description).toEqual(p1.Description);
            });
            it("AND the code of the second cell equals the second code of the Excel file", () => {
                expect((<ap.models.projects.ParentCell>importExcelRoomViewModel.importedData[1]).Code).toEqual(p2.Code);
            });
            it("AND the description of the second cell equals the second description of the Excel file", () => {
                expect((<ap.models.projects.ParentCell>importExcelRoomViewModel.importedData[1]).Description).toEqual(p2.Description);
            });
            it("AND the first cell has one subCell", () => {
                expect((<ap.models.projects.ParentCell>importExcelRoomViewModel.importedData[0]).SubCells.length).toEqual(1);
            });
            it("AND the second cell has one subCell", () => {
                expect((<ap.models.projects.ParentCell>importExcelRoomViewModel.importedData[1]).SubCells.length).toEqual(1);
            });
            it("AND the code of the first subcell equals the code of the first subCell in the Excel file", () => {
                expect((<ap.models.projects.ParentCell>importExcelRoomViewModel.importedData[0]).SubCells[0].Code).toEqual(s1.Code);
            });
            it("AND the descriptino of the first subcell equals the description of the first subCell in the Excel file", () => {
                expect((<ap.models.projects.ParentCell>importExcelRoomViewModel.importedData[0]).SubCells[0].Description).toEqual(s1.Description);
            });
            it("AND the code of the second subcell equals the code of the second subCell in the Excel file", () => {
                expect((<ap.models.projects.ParentCell>importExcelRoomViewModel.importedData[1]).SubCells[0].Code).toEqual(s2.Code);
            });
            it("AND the code of the second subcell equals the code of the second subCell in the Excel file", () => {
                expect((<ap.models.projects.ParentCell>importExcelRoomViewModel.importedData[1]).SubCells[0].Description).toEqual(s2.Description);
            });
            it("THEN isBadDate = false", () => {
                expect(importExcelRoomViewModel.isBadData).toBeFalsy();
            });
        });
        describe("WHEN excelData containts two parent cells and two sub cell for one parent", () => {
            beforeEach(() => {
                p1.SubCells.push(s1);
                p1.SubCells.push(s2);
                parentCellList.push(p1);
                parentCellList.push(p2);
                importExcelRoomViewModel = new ap.viewmodels.projects.ImportExcelRoomViewModel(Utility, $q, $mdDialog, ControllersManager);
                importExcelRoomViewModel.import();
                def.resolve([["AP", "ap", "AS", "as"], ["AP", "ap", "BS", "bs"], ["BP", "bp"]]);
                $rootScope.$apply();
            });
            it("THEN 2 parentCells are created", () => {
                expect(importExcelRoomViewModel.importedData.length).toEqual(2);
            });
            it("AND their projectId is set to the current project of MainController", () => {
                expect((<ap.models.projects.ParentCell>importExcelRoomViewModel.importedData[0]).ProjectId).toEqual(ControllersManager.mainController.currentProject().Id);
                expect((<ap.models.projects.ParentCell>importExcelRoomViewModel.importedData[1]).ProjectId).toEqual(ControllersManager.mainController.currentProject().Id);
            });
            it("AND the code of the first cell equals the first code received from the Excel file", () => {
                expect((<ap.models.projects.ParentCell>importExcelRoomViewModel.importedData[0]).Code).toEqual(p1.Code);
            });
            it("AND the description of the first cell equals the first description received from the Excel file", () => {
                expect((<ap.models.projects.ParentCell>importExcelRoomViewModel.importedData[0]).Description).toEqual(p1.Description);
            });
            it("AND the code of the second cell equals the second code received from the Excel file", () => {
                expect((<ap.models.projects.ParentCell>importExcelRoomViewModel.importedData[1]).Code).toEqual(p2.Code);
            });
            it("AND the description of the second cell equals the second description received from the Excel file", () => {
                expect((<ap.models.projects.ParentCell>importExcelRoomViewModel.importedData[1]).Description).toEqual(p2.Description);
            });
            it("AND 2 subcells are created for the first parentCell", () => {
                expect((<ap.models.projects.ParentCell>importExcelRoomViewModel.importedData[0]).SubCells.length).toEqual(2);
            });
            it("AND 0 subCell is created for the first parentCell", () => {
                expect((<ap.models.projects.ParentCell>importExcelRoomViewModel.importedData[1]).SubCells.length).toEqual(0);
            });
            it("AND the code of the first subCell is the first code of the Excel file", () => {
                expect((<ap.models.projects.ParentCell>importExcelRoomViewModel.importedData[0]).SubCells[0].Code).toEqual(s1.Code);
            });
            it("AND the description of the first SubCell is the firt description of the Excel file", () => {
                expect((<ap.models.projects.ParentCell>importExcelRoomViewModel.importedData[0]).SubCells[0].Description).toEqual(s1.Description);
            });
            it("AND the code of the secod SubCell is the second code of the Excel file", () => {
                expect((<ap.models.projects.ParentCell>importExcelRoomViewModel.importedData[0]).SubCells[1].Code).toEqual(s2.Code);
            });
            it("AND the description of the second SubCell is the second description of the Excel file", () => {
                expect((<ap.models.projects.ParentCell>importExcelRoomViewModel.importedData[0]).SubCells[1].Description).toEqual(s2.Description);
            });
            it("THEN isBadDate = false", () => {
                expect(importExcelRoomViewModel.isBadData).toBeFalsy();
            });
        });
        describe("WHEN excelData containts two parent cells and no sub cells", () => {
            beforeEach(() => {
                parentCellList.push(p1);
                parentCellList.push(p2);
                importExcelRoomViewModel = new ap.viewmodels.projects.ImportExcelRoomViewModel(Utility, $q, $mdDialog, ControllersManager);
                importExcelRoomViewModel.import();
                def.resolve([["AP", "ap"], ["BP", "bp"]]);
                $rootScope.$apply();
            });

            it("THEN 2 cells are created", () => {
                expect(importExcelRoomViewModel.importedData.length).toEqual(2);
            });
            it("AND the project of the first cell equals the curent project of MainController", () => {
                expect((<ap.models.projects.ParentCell>importExcelRoomViewModel.importedData[0]).ProjectId).toEqual(ControllersManager.mainController.currentProject().Id);
            });
            it("AND the project of the second cell equals the curent project of MainController", () => {
                expect((<ap.models.projects.ParentCell>importExcelRoomViewModel.importedData[1]).ProjectId).toEqual(ControllersManager.mainController.currentProject().Id);
            });
            it("AND the code of the first cell equals the first code of the Excel file", () => {
                expect((<ap.models.projects.ParentCell>importExcelRoomViewModel.importedData[0]).Code).toEqual(p1.Code);
            });
            it("AND the description of the first cell equals the first description of the Excel file", () => {
                expect((<ap.models.projects.ParentCell>importExcelRoomViewModel.importedData[0]).Description).toEqual(p1.Description);
            });
            it("AND the code of the second cell equals the second code of the Excel file", () => {
                expect((<ap.models.projects.ParentCell>importExcelRoomViewModel.importedData[1]).Code).toEqual(p2.Code);
            });
            it("AND the description of the first cell equals the first description of the Excel file", () => {
                expect((<ap.models.projects.ParentCell>importExcelRoomViewModel.importedData[1]).Description).toEqual(p2.Description);
            });
            it("AND the first cell doesn't have subCell", () => {
                expect((<ap.models.projects.ParentCell>importExcelRoomViewModel.importedData[0]).SubCells.length).toEqual(0);
            });
            it("AND the second cell doesn't have subCell", () => {
                expect((<ap.models.projects.ParentCell>importExcelRoomViewModel.importedData[1]).SubCells.length).toEqual(0);
            });
            it("THEN isBadDate = false", () => {
                expect(importExcelRoomViewModel.isBadData).toBeFalsy();
            });
        });
        describe("WHEN excelData is unvalid", () => {
            beforeEach(() => {
                importExcelRoomViewModel = new ap.viewmodels.projects.ImportExcelRoomViewModel(Utility, $q, $mdDialog, ControllersManager);
                importExcelRoomViewModel.import();
                def.resolve([["AP"]]);
                $rootScope.$apply();
            });
            it("THEN importedData = []", () => {
                expect(importExcelRoomViewModel.importedData).toBeNull();
            });
            it("THEN isBadDate = true", () => {
                expect(importExcelRoomViewModel.isBadData).toBeTruthy();
            });
        });
        describe("WHEN excelData contains nothing", () => {
            beforeEach(() => {
                importExcelRoomViewModel = new ap.viewmodels.projects.ImportExcelRoomViewModel(Utility, $q, $mdDialog, ControllersManager);
                importExcelRoomViewModel.import();
                def.resolve([[]]);
                $rootScope.$apply();
            });
            it("THEN importedData = []", () => {
                expect(importExcelRoomViewModel.importedData).toBeNull();
            });
            it("THEN isBadDate = true", () => {
                expect(importExcelRoomViewModel.isBadData).toBeTruthy();
            });
        });
    });
});