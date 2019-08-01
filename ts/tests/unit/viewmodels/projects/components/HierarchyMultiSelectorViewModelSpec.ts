describe("Feature: HierarchyMultiSelectorViewModel", () => {
    let Utility: ap.utility.UtilityHelper;
    let Api: ap.services.apiHelper.Api;
    let $q: angular.IQService;
    let $rootScope: angular.IRootScopeService;
    let $controllersManager: ap.controllers.ControllersManager
    let vm: ap.viewmodels.projects.HierarchyMultiSelectorViewModel;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject(function (_Utility_, _Api_, _$q_, _$rootScope_, _ControllersManager_) {
        Utility = _Utility_;
        Api = _Api_;
        $q = _$q_;
        $controllersManager = _ControllersManager_;
        $rootScope = _$rootScope_;
    }));

    beforeEach(() => {
        let project = new ap.models.projects.Project(Utility);
        project.createByJson({ Id: "test-project-id" });
        spyOn($controllersManager.mainController, "currentProject").and.returnValue(project);
    });

    describe("WHEN HierarchyMultiSelectorViewModel is created with rooms", () => {
        beforeEach(() => {
            vm = new ap.viewmodels.projects.HierarchyMultiSelectorViewModel(Utility, Api, $q, $controllersManager, "CellHierarchy");
        });
        it("THEN, list options should be initialized properly", () => {
            expect(vm.entityName).toEqual("CellHierarchy");
        });
        it("THEN, the vm contains a custom param with projectid and baseentityname params", () => {
            expect(vm.getParam("projectid").value).toEqual("test-project-id");
        });
    });

    describe("WHEN HierarchyMultiSelectorViewModel is created with issuetypes", () => {
        beforeEach(() => {
            vm = new ap.viewmodels.projects.HierarchyMultiSelectorViewModel(Utility, Api, $q, $controllersManager, "ChapterHierarchy");
        });
        it("THEN, list options should be initialized properly", () => {
            expect(vm.entityName).toEqual("ChapterHierarchy");
        });
        it("THEN, the vm contains custom params projectid and baseentityname", () => {
            expect(vm.getParam("projectid").value).toEqual("test-project-id");
        });
    });

    describe("WHEN set checkedIds property for list", () => {
        let listEntity1: ap.models.projects.CellHierarchy;
        let listEntity2: ap.models.projects.CellHierarchy;

        beforeEach(() => {
            vm = new ap.viewmodels.projects.HierarchyMultiSelectorViewModel(Utility, Api, $q, $controllersManager, "CellHierarchy");

            let testIds = ["testId10", "testId21"];            

            listEntity1 = new ap.models.projects.CellHierarchy(Utility);
            listEntity1.createByJson({
                Id: "testId10",
                Code: "testCode1",
                EntityName: "ParentCell",
                Description: "XXX1"
            });

            listEntity2 = new ap.models.projects.CellHierarchy(Utility);
            listEntity2.createByJson({
                Id: "testId21",
                Code: "testCode2",
                EntityName: "SubCell",
                Description: "XXX2",
                ParentEntityId: "parentId"
            });
            let listEntities: ap.models.projects.CellHierarchy[] = [listEntity1, listEntity2];

            let deferred: angular.IDeferred<any> = $q.defer();
            let defIds: angular.IDeferred<any> = $q.defer();
            spyOn(Api, "getApiResponse").and.callFake((url: string) => {
                if (url.indexOf("rest/cellhierarchiesids") >= 0) {
                    return defIds.promise;
                } else {
                    return deferred.promise;
                }
            });

            // load the first page to initialize the ids
            vm.loadNextPage();
            defIds.resolve(new ap.services.apiHelper.ApiResponse(["testId10", "testId21"]));
            $rootScope.$apply();

            // set the ids to check and resolve the get entity list
            vm.checkedIds = testIds;
            deferred.resolve(new ap.services.apiHelper.ApiResponse(listEntities));
            $rootScope.$apply();
        });

        it("THEN, checkedValuesText value is updated", () => {
            expect(vm.checkedValuesText).toEqual("XXX1, XXX2");
        });
    });

    describe("Feature: A cell is checked", () => {

        let defIds: angular.IDeferred<any>;
        let defEntities: angular.IDeferred<any>;

        beforeEach(() => {
            vm = new ap.viewmodels.projects.HierarchyMultiSelectorViewModel(Utility, Api, $q, $controllersManager, "CellHierarchy");

            defIds = $q.defer();
            defEntities = $q.defer();

            spyOn(Api, "getApiResponse").and.callFake((url: string) => {
                // to replace with .includes in es6
                if (url.indexOf("rest/cellhierarchiesids") >= 0) {
                    return defIds.promise;
                } else if (url.indexOf("rest/cellhierarchies") >= 0) {
                    return defEntities.promise;
                }
            });

            // load the page 
            vm.loadNextPage();

            // resolve the ids
            defIds.resolve(new ap.services.apiHelper.ApiResponse(["110", "120", "131"]));
            $rootScope.$apply();

            let chapter1 = new ap.models.projects.CellHierarchy(Utility);
            chapter1.createByJson({
                Id: "110",
                Code: "R1",
                EntityName: "ParentCell",
                Description: "Room 1.1"
            });
            let chapter2 = new ap.models.projects.CellHierarchy(Utility);
            chapter2 .createByJson({
                Id: "120",
                Code: "R2",
                EntityName: "ParentCell",
                Description: "Room 1.2"
            });
            let chapter3 = new ap.models.projects.CellHierarchy(Utility);
            chapter3.createByJson({
                Id: "131",
                Code: "S2.1",
                EntityName: "SubCell",
                Description: "Subcell 2.1",
                ParentEntityId: "12"
            });

            // resolve the entities
            defEntities.resolve(new ap.services.apiHelper.ApiResponse([chapter1, chapter2, chapter3]));
            $rootScope.$apply();
        });

        describe("WHEN the list is loaded AND a subcell is checked AND it's the only subcell of the parent", () => {

            beforeEach(() => {
                vm.sourceItems[2].isChecked = true;
            });

            it("THEN the parent also becomes checked", () => {
                expect(vm.sourceItems[1].isChecked).toBeTruthy();
            });
        });

        describe("WHEN the list is loaded AND a ParentCell is checked", () => {

            beforeEach(() => {
                vm.sourceItems[1].isChecked = true;
            });

            it("THEN the subcell also becomes checked", () => {
                expect(vm.sourceItems[2].isChecked).toBeTruthy();
            });
        });

        describe("WHEN the list is loaded AND a ParentCell is unchecked", () => {

            beforeEach(() => {
                vm.sourceItems[1].isChecked = true;

                // check that the child is checked as well
                expect(vm.sourceItems[2].isChecked).toBeTruthy();

                vm.sourceItems[1].isChecked = false;
            });

            it("THEN the subcell also becomes unchecked", () => {
                expect(vm.sourceItems[2].isChecked).toBeFalsy();
            });
        });

        describe("WHEN the list is loaded AND a SubCell is unchecked AND it's the only SubCell of a ParentCell", () => {

            beforeEach(() => {
                vm.sourceItems[2].isChecked = true;

                // check that the parent is checked as well
                expect(vm.sourceItems[1].isChecked).toBeTruthy();

                vm.sourceItems[2].isChecked = false;
            });

            it("THEN the ParentCell also becomes unchecked", () => {
                expect(vm.sourceItems[1].isChecked).toBeFalsy();
            });
        });
    });
}); 