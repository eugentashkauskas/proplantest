describe("Module ap-viewmodels - projects - ImportExcelViewModel", () => {
    class TestImportExcelViewModel extends ap.viewmodels.projects.ImportExcelViewModel {
        // Accessor to test the isBadData property
        setIsBadData(value: boolean) {
            this._isBadData = value;
        }

        // Accessor to test the importedData property
        setImportedData(value: ap.models.Entity[]) {
            this._importedData = value;
        }

        // Test implementation of the abstract method
        createImportedData(excelData: string[][]): angular.IPromise<ap.models.Entity[]> {
            if (this.isBadDataExpected) {
                return $q.reject();
            } else {
                return $q.resolve(this.expectedImportData);
            }
        }

        // Initializes import strategy for the view model. The createImportedData method will take it in account.
        setTestImportStrategy(expectBadData: boolean, expectImportedData: ap.models.Entity[]) {
            this.isBadDataExpected = expectBadData;
            this.expectedImportData = expectImportedData;
        }

        public isBadDataExpected: boolean = false;
        public expectedImportData: ap.models.Entity[] = null;
    }

    let vm: TestImportExcelViewModel,
        Utility: ap.utility.UtilityHelper,
        $q: angular.IQService,
        $rootScope: angular.IRootScopeService,
        $mdDialog: angular.material.IDialogService,
        ControllersManager: ap.controllers.ControllersManager,
        ImportExcelController: ap.controllers.ImportExcelController,
        MainController: ap.controllers.MainController,
        successCallback: any,
        failureCallback: any;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-utility");
        angular.mock.module("ap-controllers");
        angular.mock.module(function ($provide) {
            $provide.factory("$mdDialog", ["$q", function ($q) {
                return specHelper.utility.stubShowMdDialog($q);
            }]);
        });
    });

    beforeEach(inject(function (_Utility_, _ImportExcelController_, _MainController_, _ControllersManager_, _$mdDialog_, _$q_, _$rootScope_) {
        Utility = _Utility_;
        $rootScope = _$rootScope_;
        $q = _$q_;
        $mdDialog = _$mdDialog_;
        ControllersManager = _ControllersManager_;
        ImportExcelController = _ImportExcelController_;
        MainController = _MainController_;

        successCallback = jasmine.createSpy("successCallback");
        failureCallback = jasmine.createSpy("failureCallback");
    }));

    function createViewModel(importType: ap.viewmodels.projects.ImportType = ap.viewmodels.projects.ImportType.Status): TestImportExcelViewModel {
        return new TestImportExcelViewModel($q, $mdDialog, ControllersManager, importType, "Test title", "Test description", "Test path");
    }

    describe("Feature: accessors", () => {
        beforeEach(() => {
            vm = createViewModel(ap.viewmodels.projects.ImportType.Folder);
        });

        describe("WHEN the importType accessor is called", () => {
            it("THEN the correct import type is returned", () => {
                expect(vm.importType).toEqual(ap.viewmodels.projects.ImportType.Folder);
            });
        });

        describe("WHEN the isBadData accessor is called", () => {
            beforeEach(() => {
                vm.setIsBadData(true);
            });

            it("THEN the correct data is returned", () => {
                expect(vm.isBadData).toBeTruthy();
            });
        });

        describe("WHEN the importedData accessor is called", () => {
            let testData: ap.models.Entity[];

            beforeEach(() => {
                testData = [
                    new ap.models.projects.Folder(Utility),
                    new ap.models.projects.Folder(Utility)
                ];
                vm.setImportedData(testData);
            });

            it("THEN a copy of data is returned", () => {
                expect(vm.importedData).toEqual(testData);
                expect(vm.importedData).not.toBe(testData);
            });
        });

        describe("WHEN the titleKey accessor is called", () => {
            it("THEN a correct data is returned", () => {
                expect(vm.titleKey).toEqual("Test title");
            });
        });

        describe("WHEN the descriptionKey accessor is called", () => {
            it("THEN a correct data is returned", () => {
                expect(vm.descriptionKey).toEqual("Test description");
            });
        });

        describe("WHEN the sampleImagePath accessor is called", () => {
            it("THEN a correct data is returned", () => {
                expect(vm.sampleImagePath).toEqual("Test path");
            });
        });
    });

    describe("Feature: default values", () => {
        describe("WHEN a view model is created", () => {
            beforeEach(() => {
                vm = createViewModel(ap.viewmodels.projects.ImportType.Meeting);
            });

            it("THEN the importType property contains the import type passed to the constructor", () => {
                expect(vm.importType).toEqual(ap.viewmodels.projects.ImportType.Meeting);
            });

            it("THEN the uniqueFileName property is null", () => {
                expect(vm.uniqueFileName).toBeNull();
            });

            it("THEN the canImport property is falsy", () => {
                expect(vm.canImport).toBeFalsy();
            });

            it("THEN the isBadData property is falsy", () => {
                expect(vm.isBadData).toBeFalsy();
            });

            it("THEN the importedData property is null", () => {
                expect(vm.importedData).toBeNull();
            });

            it("THEN the titleKey property contains the title key passed to the constructor", () => {
                expect(vm.titleKey).toEqual("Test title");
            });

            it("THEN the descriptionKey property contains the description key passed to the constructor", () => {
                expect(vm.descriptionKey).toEqual("Test description");
            });

            it("THEN the sampleImagePath property contains the sample image path passed to the constructor", () => {
                expect(vm.sampleImagePath).toEqual("Test path");
            });
        });
    });

    describe("Feature: uploadExcelFile", () => {
        let uploadPromise: angular.IDeferred<any>;
        let uploadExcelFileSpy: jasmine.Spy;
        
        beforeEach(() => {
            uploadPromise = $q.defer();
            uploadExcelFileSpy = spyOn(ImportExcelController, "uploadExcelFile");
            uploadExcelFileSpy.and.returnValue(uploadPromise.promise);
        });

        describe("WHEN an excel file is given", () => {
            let file: File;
            
            beforeEach(() => {
                file = <File>{ name: "test.xls" };
                vm = createViewModel();
                vm.uploadExcelFile([file]).then(successCallback, failureCallback);
            });

            it("THEN the ImportExcelController.uploadExcelFile method is called", () => {
                expect(ImportExcelController.uploadExcelFile).toHaveBeenCalledWith(file);
            });

            describe("AND uploaded successfully", () => {
                let uploadedFileName: string;

                beforeEach(() => {
                    uploadedFileName = "uploaded-test-filename.xls";
                    uploadPromise.resolve(uploadedFileName);
                    $rootScope.$digest();
                });

                it("THEN the uniqueFileName property returns a name of the uploaded file", () => {
                    expect(vm.uniqueFileName).toEqual(uploadedFileName);
                });

                it("THEN the retuned promise is resolved", () => {
                    expect(successCallback).toHaveBeenCalledWith(uploadedFileName);
                });

                it("THEN the canImport property becomes true", () => {
                    expect(vm.canImport).toBeTruthy()
                });
            });

            describe("AND upload is failed", () => {
                let errorMessage: string;

                beforeEach(() => {
                    errorMessage = "error";
                    uploadPromise.reject(errorMessage);
                    $rootScope.$digest();
                });

                it("THEN the returned promise is rejected", () => {
                    expect(failureCallback).toHaveBeenCalledWith(errorMessage);
                });

                it("THEN the canImport property is falsy", () => {
                    expect(vm.canImport).toBeFalsy();
                });
            });
        });

        describe("WHEN a file is not given", () => {
            beforeEach(() => {
                vm = createViewModel();
            });

            it("THEN the 'File is mandatory' error is thrown", () => {
                expect(() => {
                    vm.uploadExcelFile(null);
                }).toThrowError("File is mandatory");
            });
        });

    });

    describe("Feature: removeExcelFile", () => {
        let file: File;
        let uploadedFileName: string;
        let cancelPromise: angular.IDeferred<any>;

        beforeEach(() => {
            vm = createViewModel();
            file = <File>{ name: "test.xlsx" };
            uploadedFileName = "test-uploaded-file-name.xlsx";

            // Setup an uploaded file
            let uploadPromise = $q.defer();
            spyOn(ImportExcelController, "uploadExcelFile").and.returnValue(uploadPromise.promise);
            vm.uploadExcelFile([file]);
            uploadPromise.resolve(uploadedFileName);
            $rootScope.$digest();

            // Setup mock
            cancelPromise = $q.defer();
            spyOn(ImportExcelController, "cancelExcelFile").and.returnValue(cancelPromise.promise);
        });

        describe("WHEN the method is called", () => {
            beforeEach(() => {
                vm.removeExcelFile().then(successCallback, failureCallback);
            });

            it("THEN the ImportExcelController.cancelExcelFile is called with the currently uploaded file", () => {
                expect(ImportExcelController.cancelExcelFile).toHaveBeenCalledWith(file);
            });

            describe("AND file is successfully canceled", () => {
                beforeEach(() => {
                    cancelPromise.resolve();
                    $rootScope.$digest();
                });

                it("THEN the uniqueFileName property is cleared", () => {
                    expect(vm.uniqueFileName).toBeNull();
                });

                it("THEN the returned promise is resolved", () => {
                    expect(successCallback).toHaveBeenCalled();
                });

                it("THEN the canImport property becomes false", () => {
                    expect(vm.canImport).toBeFalsy();
                });
            });

            describe("AND file is not canceled", () => {
                let errorMessage: string;

                beforeEach(() => {
                    errorMessage = "test error message";
                    cancelPromise.reject(errorMessage);
                    $rootScope.$digest();
                });

                it("THEN the returned promise is rejected with the error", () => {
                    expect(failureCallback).toHaveBeenCalledWith(errorMessage);
                });

                it("THEN the uniqueFileName property is not changed", () => {
                    expect(vm.uniqueFileName).toEqual(uploadedFileName);
                });

                it("THEN the canImport property remains truthy", () => {
                    expect(vm.canImport).toBeTruthy();
                });
            });
        });
    });

    describe("Feature: import", () => {
        beforeEach(() => {
            vm = createViewModel();
        });

        describe("WHEN no file is uploaded", () => {
            it("THEN an exception is thrown", () => {
                expect(() => {
                    vm.import();
                }).toThrowError("Import is not allowed.")
            });
        });

        describe("WHEN a file is successfully uploaded", () => {
            let readPromise: angular.IDeferred<string[][]>;
            let uploadedFileName: string;
            let importedData: string[][];

            beforeEach(() => {
                uploadedFileName = "test-uploaded-filename.xls";

                // Setup uploaded file
                let uploadPromise = $q.defer();
                let file = <File>{ name: "test.xls" };
                spyOn(ImportExcelController, "uploadExcelFile").and.returnValue(uploadPromise.promise);
                vm.uploadExcelFile([file]);
                uploadPromise.resolve(uploadedFileName);
                $rootScope.$digest();

                // Setup mock
                readPromise = $q.defer();
                spyOn(ImportExcelController, "readExcelContent").and.returnValue(readPromise.promise);

                spyOn(vm, "createImportedData").and.callThrough();
            });

            describe("WHEN the imported data is valid", () => {
                let excelData: string[][];
                let importedData: ap.models.Entity[];

                beforeEach(() => {
                    excelData = [["test1"], ["test2"]];
                    importedData = [
                        new ap.models.projects.Folder(Utility),
                        new ap.models.projects.Folder(Utility)
                    ];

                    vm.setTestImportStrategy(false, importedData);
                    vm.import().then(successCallback, failureCallback);

                    readPromise.resolve(excelData);
                    $rootScope.$digest();
                });

                it("THEN the createImportedData method is called", () => {
                    expect(vm.createImportedData).toHaveBeenCalledWith(excelData);
                });

                it("THEN the isBadData is set to false", () => {
                    expect(vm.isBadData).toBeFalsy();
                });

                it("THEN the importedData is set to resolved list of entities", () => {
                    expect(vm.importedData).toEqual(importedData);
                });

                it("THEN the returned promise is resolved with the imported data", () => {
                    expect(successCallback).toHaveBeenCalledWith(importedData);
                });
            });

            describe("WHEN the imported data is invalid", () => {
                let excelData: string[][];

                beforeEach(() => {
                    excelData = [["test1"], ["test2"]];

                    spyOn(MainController, "showErrorKey").and.stub();

                    vm.setTestImportStrategy(true, null);
                    vm.import().then(successCallback, failureCallback);

                    readPromise.resolve(excelData);
                    $rootScope.$digest();
                });

                it("THEN the createImportedData method is called", () => {
                    expect(vm.createImportedData).toHaveBeenCalledWith(excelData);
                });

                it("THEN the isBadData flag is set to true", () => {
                    expect(vm.isBadData).toBeTruthy();
                });

                it("THEN the importedData is set to null", () => {
                    expect(vm.importedData).toBeNull();
                });

                it("THEN the returned promise is rejected with BadData message", () => {
                    expect(failureCallback).toHaveBeenCalledWith("BadData");
                });

                it("THEN the $mdDialog is hidden", () => {
                    expect($mdDialog.hide).toHaveBeenCalled();
                });

                it("THEN a correct error message is shown", () => {
                    expect(MainController.showErrorKey).toHaveBeenCalledWith("app.err.ImportExcel_badData", "app.err.title.ImportExcel_badData", null, null);
                });
            });

            describe("WHEN it is impossible to read a file", () => {
                let errorMessage: string;

                beforeEach(() => {
                    errorMessage = "TestErrorMessage";
                    vm.import().then(successCallback, failureCallback);
                    readPromise.reject(errorMessage);
                    $rootScope.$digest();
                });

                it("THEN the returned promise is rejected and an error message is passed", () => {
                    expect(failureCallback).toHaveBeenCalledWith(errorMessage);
                });
            });
        });
    });
});
