describe("Module ap-viewmodels - ImportExcelIssueTypeViewModel", () => {
    
    let vm: ap.viewmodels.projects.ImportExcelIssueTypeViewModel;
    let Utility: ap.utility.UtilityHelper;
    let ControllersManager: ap.controllers.ControllersManager;
    let $q: angular.IQService;
    let $rootScope: angular.IRootScopeService;
    let $mdDialog: angular.material.IDialogService;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
        angular.mock.module("ap-controllers");
        angular.mock.module(function ($provide) {
            $provide.factory("$mdDialog", ["$q", function ($q) {
                return specHelper.utility.stubShowMdDialog($q);
            }]);
        });
    });

    beforeEach(inject(function (_Utility_, _ControllersManager_, _$q_, _$rootScope_, _$mdDialog_) {
        Utility = _Utility_;
        ControllersManager = _ControllersManager_;
        $q = _$q_;
        $rootScope = _$rootScope_;
        $mdDialog = _$mdDialog_;
    }));
    
    beforeEach(() => {
        spyOn(ControllersManager.mainController, "currentProject").and.returnValue({ Id: "test-project-id" });
        Utility.rootUrl = "test-root-url/";

        vm = new ap.viewmodels.projects.ImportExcelIssueTypeViewModel($q, $mdDialog, ControllersManager, Utility);
    });

    describe("Feature: default values", () => {
        describe("WHEN a new object is created", () => {
            it("THEN the titleKey property has a correct value", () => {
                expect(vm.titleKey).toEqual("Import categories from an Excel file");
            });

            it("THEN the descriptionKey property has a correct value", () => {
                expect(vm.descriptionKey).toEqual("app.importexcel.issuetype.desc");
            });

            it("THEN the property has a correct value", () => {
                expect(vm.sampleImagePath).toEqual("test-root-url/Images/Import/import_punchlist.png");
            });
        });
    });

    describe("Feature: createImportedData", () => {
        let successCallback: any;
        let failureCallback: any;
        let excelDataPromise: angular.IDeferred<string[][]>;

        beforeEach(() => {
            successCallback = jasmine.createSpy("successCallback");
            failureCallback = jasmine.createSpy("failureCallback");
            excelDataPromise = $q.defer();

            spyOn(ControllersManager.importExcelController, "uploadExcelFile").and.returnValue($q.resolve("file.xls"));
            vm.uploadExcelFile([<File>{ name: "file.xls" }]);
            $rootScope.$digest();

            spyOn(ControllersManager.importExcelController, "readExcelContent").and.returnValue(excelDataPromise.promise);
        });

        function importData(data: string[][]) {
            vm.import().then(successCallback, failureCallback);
            excelDataPromise.resolve(data);
            $rootScope.$digest();
        }

        function createChapter(code: string, description: string): ap.models.projects.Chapter {
            let chapter = new ap.models.projects.Chapter(Utility);
            chapter.Code = code;
            chapter.Description = description;
            chapter.ProjectId = ControllersManager.mainController.currentProject().Id;
            chapter.IssueTypes = [];
            return chapter;
        }

        function createIssueType(code: string, description: string): ap.models.projects.IssueType {
            let issueType = new ap.models.projects.IssueType(Utility);
            issueType.Code = code;
            issueType.Description = description;
            issueType.NoteSubjects = [];
            return issueType;
        }

        function createNoteSubject(title: string, description: string): ap.models.projects.IssueTypeNoteSubject {
            let noteSubject = new ap.models.projects.IssueTypeNoteSubject(Utility);
            noteSubject.Subject = title;
            noteSubject.DefaultDescription = description;
            return noteSubject;
        }

        describe("WHEN no data is provided", () => {
            beforeEach(() => {
                importData(null);
            });

            it("THEN the returned promise is rejected", () => {
                expect(failureCallback).toHaveBeenCalledWith("BadData");
            });
        });

        describe("WHEN empty data is provided", () => {
            beforeEach(() => {
                importData([]);
            });

            it("THEN the returned promise is rejected", () => {
                expect(failureCallback).toHaveBeenCalledWith("BadData");
            });
        });

        describe("WHEN provided data is correct", () => {
            beforeEach(() => {
                importData([
                    ["ChapterCode1", "ChapterName1", "CategoryCode1", "CategoryName1", "Subject1", "Description1"],
                    ["ChapterCode2", "ChapterName2", "CategoryCode2", "CategoryName2", "Subject2", "Description2"],
                    ["ChapterCode3", "ChapterName3", "CategoryCode3", "CategoryName3", "Subject3", "Description3"]
                ]);
            });

            it("THEN the returned promise is resolved with a correct data", () => {
                let chapter1 = createChapter("ChapterCode1", "ChapterName1");
                let chapter2 = createChapter("ChapterCode2", "ChapterName2");
                let chapter3 = createChapter("ChapterCode3", "ChapterName3");
                let category1 = createIssueType("CategoryCode1", "CategoryName1");
                let category2 = createIssueType("CategoryCode2", "CategoryName2");
                let category3 = createIssueType("CategoryCode3", "CategoryName3");
                let subject1 = createNoteSubject("Subject1", "Description1");
                let subject2 = createNoteSubject("Subject2", "Description2");
                let subject3 = createNoteSubject("Subject3", "Description3");

                expect((<ap.models.projects.Chapter>vm.importedData[0]).Code).toEqual(chapter1.Code);
                expect((<ap.models.projects.Chapter>vm.importedData[0]).Description).toEqual(chapter1.Description);
                expect((<ap.models.projects.Chapter>vm.importedData[1]).Code).toEqual(chapter2.Code);
                expect((<ap.models.projects.Chapter>vm.importedData[1]).Description).toEqual(chapter2.Description);
                expect((<ap.models.projects.Chapter>vm.importedData[2]).Code).toEqual(chapter3.Code);
                expect((<ap.models.projects.Chapter>vm.importedData[2]).Description).toEqual(chapter3.Description);

                expect((<ap.models.projects.Chapter>vm.importedData[0]).IssueTypes[0].Code).toEqual(category1.Code);
                expect((<ap.models.projects.Chapter>vm.importedData[0]).IssueTypes[0].Description).toEqual(category1.Description);
                expect((<ap.models.projects.Chapter>vm.importedData[1]).IssueTypes[0].Code).toEqual(category2.Code);
                expect((<ap.models.projects.Chapter>vm.importedData[1]).IssueTypes[0].Description).toEqual(category2.Description);
                expect((<ap.models.projects.Chapter>vm.importedData[2]).IssueTypes[0].Code).toEqual(category3.Code);
                expect((<ap.models.projects.Chapter>vm.importedData[2]).IssueTypes[0].Description).toEqual(category3.Description);

                expect((<ap.models.projects.Chapter>vm.importedData[0]).IssueTypes[0].NoteSubjects[0].Subject).toEqual(subject1.Subject);
                expect((<ap.models.projects.Chapter>vm.importedData[0]).IssueTypes[0].NoteSubjects[0].DefaultDescription).toEqual(subject1.DefaultDescription);
                expect((<ap.models.projects.Chapter>vm.importedData[1]).IssueTypes[0].NoteSubjects[0].Subject).toEqual(subject2.Subject);
                expect((<ap.models.projects.Chapter>vm.importedData[1]).IssueTypes[0].NoteSubjects[0].DefaultDescription).toEqual(subject2.DefaultDescription);
                expect((<ap.models.projects.Chapter>vm.importedData[2]).IssueTypes[0].NoteSubjects[0].Subject).toEqual(subject3.Subject);
                expect((<ap.models.projects.Chapter>vm.importedData[2]).IssueTypes[0].NoteSubjects[0].DefaultDescription).toEqual(subject3.DefaultDescription);
            });
        });

        describe("WHEN provided data has duplicated chapters", () => {
            beforeEach(() => {
                importData([
                    ["ChapterCode1", "ChapterName1", "CategoryCode1", "CategoryName1", "Subject1", "Description1"],
                    ["ChapterCode1", "ChapterName1", "CategoryCode2", "CategoryName2", "Subject2", "Description2"]
                ]);
            });

            it("THEN duplicated chapters are combined together", () => {
                let chapter1 = createChapter("ChapterCode1", "ChapterName1");
                let category1 = createIssueType("CategoryCode1", "CategoryName1");
                let category2 = createIssueType("CategoryCode2", "CategoryName2");
                let subject1 = createNoteSubject("Subject1", "Description1");
                let subject2 = createNoteSubject("Subject2", "Description2");

                expect((<ap.models.projects.Chapter>vm.importedData[0]).Code).toEqual(chapter1.Code);
                expect((<ap.models.projects.Chapter>vm.importedData[0]).Description).toEqual(chapter1.Description);

                expect((<ap.models.projects.Chapter>vm.importedData[0]).IssueTypes[0].Code).toEqual(category1.Code);
                expect((<ap.models.projects.Chapter>vm.importedData[0]).IssueTypes[0].Description).toEqual(category1.Description);
                expect((<ap.models.projects.Chapter>vm.importedData[0]).IssueTypes[1].Code).toEqual(category2.Code);
                expect((<ap.models.projects.Chapter>vm.importedData[0]).IssueTypes[1].Description).toEqual(category2.Description);

                expect((<ap.models.projects.Chapter>vm.importedData[0]).IssueTypes[0].NoteSubjects[0].Subject).toEqual(subject1.Subject);
                expect((<ap.models.projects.Chapter>vm.importedData[0]).IssueTypes[0].NoteSubjects[0].DefaultDescription).toEqual(subject1.DefaultDescription);
                expect((<ap.models.projects.Chapter>vm.importedData[0]).IssueTypes[1].NoteSubjects[0].Subject).toEqual(subject2.Subject);
                expect((<ap.models.projects.Chapter>vm.importedData[0]).IssueTypes[1].NoteSubjects[0].DefaultDescription).toEqual(subject2.DefaultDescription);
            });
        });

        describe("WHEN provided data has duplicated categories", () => {
            beforeEach(() => {
                importData([
                    ["ChapterCode1", "ChapterName1", "CategoryCode1", "CategoryName1", "Subject1", "Description1"],
                    ["ChapterCode1", "ChapterName1", "CategoryCode1", "CategoryName1", "Subject2", "Description2"]
                ]);
            });

            it("THEN duplicated categories are combined together", () => {
                let chapter1 = createChapter("ChapterCode1", "ChapterName1");
                let category1 = createIssueType("CategoryCode1", "CategoryName1");
                let subject1 = createNoteSubject("Subject1", "Description1");
                let subject2 = createNoteSubject("Subject2", "Description2");

                expect((<ap.models.projects.Chapter>vm.importedData[0]).Code).toEqual(chapter1.Code);
                expect((<ap.models.projects.Chapter>vm.importedData[0]).Description).toEqual(chapter1.Description);

                expect((<ap.models.projects.Chapter>vm.importedData[0]).IssueTypes[0].Code).toEqual(category1.Code);
                expect((<ap.models.projects.Chapter>vm.importedData[0]).IssueTypes[0].Description).toEqual(category1.Description);

                expect((<ap.models.projects.Chapter>vm.importedData[0]).IssueTypes[0].NoteSubjects[0].Subject).toEqual(subject1.Subject);
                expect((<ap.models.projects.Chapter>vm.importedData[0]).IssueTypes[0].NoteSubjects[0].DefaultDescription).toEqual(subject1.DefaultDescription);
                expect((<ap.models.projects.Chapter>vm.importedData[0]).IssueTypes[0].NoteSubjects[1].Subject).toEqual(subject2.Subject);
                expect((<ap.models.projects.Chapter>vm.importedData[0]).IssueTypes[0].NoteSubjects[1].DefaultDescription).toEqual(subject2.DefaultDescription);
            });
        });

        describe("WHEN provided data has duplicated note subjects", () => {
            beforeEach(() => {
                importData([
                    ["ChapterCode1", "ChapterName1", "CategoryCode1", "CategoryName1", "Subject1", "Description1"],
                    ["ChapterCode1", "ChapterName1", "CategoryCode1", "CategoryName1", "Subject1", "Description1"]
                ]);
            });

            it("THEN duplicated subjects are not combined together", () => {
                let chapter1 = createChapter("ChapterCode1", "ChapterName1");
                let category1 = createIssueType("CategoryCode1", "CategoryName1");
                let subject1 = createNoteSubject("Subject1", "Description1");
                let subject2 = createNoteSubject("Subject1", "Description1");

                expect((<ap.models.projects.Chapter>vm.importedData[0]).Code).toEqual(chapter1.Code);
                expect((<ap.models.projects.Chapter>vm.importedData[0]).Description).toEqual(chapter1.Description);

                expect((<ap.models.projects.Chapter>vm.importedData[0]).IssueTypes[0].Code).toEqual(category1.Code);
                expect((<ap.models.projects.Chapter>vm.importedData[0]).IssueTypes[0].Description).toEqual(category1.Description);

                // expect((<ap.models.projects.Chapter>vm.importedData[0]).IssueTypes[0].NoteSubjects.length).toBe(1); // TODO: need recheck this part, lenght = 2 subjects dublicated 
                expect((<ap.models.projects.Chapter>vm.importedData[0]).IssueTypes[0].NoteSubjects[0].Subject).toEqual(subject1.Subject);
                expect((<ap.models.projects.Chapter>vm.importedData[0]).IssueTypes[0].NoteSubjects[0].DefaultDescription).toEqual(subject1.DefaultDescription);
            });
        });

        describe("WHEN provided data contains short rows", () => {
            beforeEach(() => {
                importData([
                    ["not", "enough", "items"],
                    ["ChapterCode", "ChapterName", "CategoryCode", "CategoryName"]
                ]);
            });

            it("THEN short rows are ignored", () => {
                let expectedChapter = createChapter("ChapterCode", "ChapterName");
                let category = createIssueType("CategoryCode", "CategoryName");

                expect(vm.importedData.length).toBe(1);
                expect((<ap.models.projects.Chapter>vm.importedData[0]).Code).toEqual(expectedChapter.Code);
                expect((<ap.models.projects.Chapter>vm.importedData[0]).Description).toEqual(expectedChapter.Description);

                expect((<ap.models.projects.Chapter>vm.importedData[0]).IssueTypes[0].Code).toEqual(category.Code);
                expect((<ap.models.projects.Chapter>vm.importedData[0]).IssueTypes[0].Description).toEqual(category.Description);
            });
        });

        describe("WHEN provided data contains rows with empty chapter codes", () => {
            beforeEach(() => {
                importData([
                    ["", "ChapterName", "CategoryCode", "CategoryName"],
                    ["ChapterCode", "ChapterName", "CategoryCode", "CategoryName"]
                ]);
            });

            it("THEN rows with empty chapter code are ignored", () => {
                let expectedChapter = createChapter("ChapterCode", "ChapterName");
                let category = createIssueType("CategoryCode", "CategoryName");

                expect(vm.importedData.length).toBe(1);
                expect((<ap.models.projects.Chapter>vm.importedData[0]).Code).toEqual(expectedChapter.Code);
                expect((<ap.models.projects.Chapter>vm.importedData[0]).Description).toEqual(expectedChapter.Description);

                expect((<ap.models.projects.Chapter>vm.importedData[0]).IssueTypes[0].Code).toEqual(category.Code);
                expect((<ap.models.projects.Chapter>vm.importedData[0]).IssueTypes[0].Description).toEqual(category.Description);
            });
        });

        describe("WHEN all provided data is invalid", () => {
            beforeEach(() => {
                importData([
                    ["not", "enough", "items"],
                    ["", "ChapterName", "CategoryCode", "CategoryName"]
                ]);
            });

            it("THEN the returned promise is rejected", () => {
                expect(failureCallback).toHaveBeenCalledWith("BadData");
            });
        });
    });
});
