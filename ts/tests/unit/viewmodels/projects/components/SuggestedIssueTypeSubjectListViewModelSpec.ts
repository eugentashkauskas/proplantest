'use strict';
describe("Module ap-viewmodels - project's components - SuggestedIssueTypeSubjectListViewModel", () => {
    let currentProject;
    let vm: ap.viewmodels.projects.SuggestedIssueTypeSubjectListViewModel;
    let Utility: ap.utility.UtilityHelper;
    let MainController: ap.controllers.MainController;
    let Api: ap.services.apiHelper.Api;
    let NoteController: ap.controllers.NoteController;
    let ControllersManager: ap.controllers.ControllersManager;
    let DocumentController: ap.controllers.DocumentController;
    let NoteService: ap.services.NoteService;
    let $mdDialog: angular.material.IDialogService;
    let UserContext: ap.utility.UserContext;

    let callback;
    let resultList: ap.viewmodels.projects.SuggestedIssueTypeSubjectViewModel[];

    let $q: angular.IQService,
        $timeout: angular.ITimeoutService,
        $rootScope: angular.IRootScopeService,
        $scope: angular.IScope;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
        angular.mock.module("ap-services");
        angular.mock.module(function ($provide) {
            $provide.factory('$mdDialog', ["$q", function ($q) {
                return specHelper.utility.stubShowMdDialog($q);
            }]);
        });
    });

    beforeEach(inject(function (_$rootScope_, _UserContext_, _Utility_, _NoteController_, _$q_, _MainController_, _DocumentController_, _NoteService_, _$mdDialog_, _Api_, _ControllersManager_) {
        Utility = _Utility_;
        UserContext = _UserContext_;
        NoteController = _NoteController_;
        DocumentController = _DocumentController_;
        ControllersManager = _ControllersManager_;
        $rootScope = _$rootScope_;
        $q = _$q_;
        Api = _Api_;
        MainController = _MainController_;
        NoteService = _NoteService_;
        $mdDialog = _$mdDialog_;
        $scope = $rootScope.$new();
        specHelper.utility.stubRootUrl(Utility);
        specHelper.userContext.stub(Utility);
        specHelper.utility.stubStorageSet(Utility);
        
    }));

    describe("Feature: constructor", () => {
        describe("WHEN SuggestedIssueTypeSubjectListViewModel is created without defaultsearchText", () => {
            it("THEN, default values are correctly fill AND the list is empty", () => {
                vm = new ap.viewmodels.projects.SuggestedIssueTypeSubjectListViewModel(Utility, $q, ControllersManager, undefined);
                expect(vm.entityName).toBe("SuggestedIssueTypeSubject");
                expect(vm.defaultFilter).toBe("");
                expect(vm.sortOrder).toBe("");
                expect(vm.pathToLoad).toEqual("");
                expect(vm.selectedSubjectVM).toBeUndefined();
                expect(vm.issueTypeId).toBeUndefined();
                expect(vm.searchText).toBeUndefined();
            });
        });

        describe("WHEN SuggestedIssueTypeSubjectListViewModel is created with defaultsearchText", () => {
            it("THEN, default values and selectedSubject are correctly fill ", () => {
                
                vm = new ap.viewmodels.projects.SuggestedIssueTypeSubjectListViewModel(Utility, $q, ControllersManager, "AAA");

                expect(vm.entityName).toBe("SuggestedIssueTypeSubject");
                expect(vm.defaultFilter).toBe("");
                expect(vm.sortOrder).toBe("");
                expect(vm.pathToLoad).toEqual("");
                expect(vm.selectedSubjectVM).toBeUndefined();
                expect(vm.issueTypeId).toBeUndefined();
                expect(vm.searchText).toEqual("AAA");

            });
        });

    });

    describe("Feature: setter properties", () => {
        describe("WHEN i fill the searchText for the vm", () => {
            it("THEN, default value is return correct", () => {
                vm = new ap.viewmodels.projects.SuggestedIssueTypeSubjectListViewModel(Utility, $q, ControllersManager, "AAA");
                vm.searchText = "BBB";
                expect(vm.searchText).toBe("BBB");
            });
        });
        describe("WHEN i fill the issueTypeId for the vm", () => {
            it("THEN, default value is return correct", () => {
                vm = new ap.viewmodels.projects.SuggestedIssueTypeSubjectListViewModel(Utility, $q, ControllersManager, "AAA");
                vm.issueTypeId = "Id1";
                expect(vm.issueTypeId).toBe("Id1");
            });
        });
        });
    

    describe("Feature: searchSubjects method", () => {
        beforeEach(() => {
            let defSubject = $q.defer();
            spyOn(ControllersManager.projectController, "getIssueTypeNoteSubject").and.returnValue(defSubject.promise);
        });
        describe("When the searchSubjects method was called and issueTypeId is null", () => {
            it("THEN, will return the empty list", () => {
                spyOn(NoteController, "getSuggestedIssueTypeSubjects");
                vm = new ap.viewmodels.projects.SuggestedIssueTypeSubjectListViewModel(Utility, $q, ControllersManager, "AAA");
                let searchResult: ap.viewmodels.projects.SuggestedIssueTypeSubjectViewModel[] = vm.searchSubjects("aaa");
                expect(NoteController.getSuggestedIssueTypeSubjects).not.toHaveBeenCalled();
                expect(searchResult.length).toEqual(0);
            });
        });
        describe("When the searchSubjects method was called and we have specified the issueTypeId ", () => {
            it("THEN, NoteController.getSuggestedIssueTypeSubjects will be called and return the promise", () => {
                let defData = $q.defer();
                let callback = jasmine.createSpy("callback");
                spyOn(NoteController, "getSuggestedIssueTypeSubjects").and.returnValue(defData.promise);

                let datas: ap.models.custom.SuggestedIssueTypeSubject[] = [];
                let subject1: ap.models.custom.SuggestedIssueTypeSubject = new ap.models.custom.SuggestedIssueTypeSubject(Utility);
                subject1.Subject = "S1";
                let subject2: ap.models.custom.SuggestedIssueTypeSubject = new ap.models.custom.SuggestedIssueTypeSubject(Utility);
                subject2.Subject = "S2";

                datas.push(subject1);
                datas.push(subject2);

                let resultList: ap.viewmodels.projects.SuggestedIssueTypeSubjectViewModel[] = [];
                resultList.push(new ap.viewmodels.projects.SuggestedIssueTypeSubjectViewModel("S1"));
                resultList.push(new ap.viewmodels.projects.SuggestedIssueTypeSubjectViewModel("S2"));

                defData.resolve(datas);

                vm = new ap.viewmodels.projects.SuggestedIssueTypeSubjectListViewModel(Utility, $q, ControllersManager, "S");
                vm.issueTypeId = "IssueType1";

                vm.searchSubjects("S").then(function (args) {
                    callback(args);
                });

                $rootScope.$apply();
                expect(NoteController.getSuggestedIssueTypeSubjects).toHaveBeenCalled();
                expect(callback).toHaveBeenCalledWith(resultList);

            });
        });
    }
    );

    describe("Feature: getSubject method", () => {
        beforeEach(() => {
            let defData = $q.defer();
            let defSubject = $q.defer();
            callback = jasmine.createSpy("callback");
            spyOn(NoteController, "getSuggestedIssueTypeSubjects").and.returnValue(defData.promise);
            spyOn(ControllersManager.projectController, "getIssueTypeNoteSubject").and.returnValue(defSubject.promise);

            let datas: ap.models.custom.SuggestedIssueTypeSubject[] = [];
            let subject1: ap.models.custom.SuggestedIssueTypeSubject = new ap.models.custom.SuggestedIssueTypeSubject(Utility);
            subject1.Subject = "S1";
            let subject2: ap.models.custom.SuggestedIssueTypeSubject = new ap.models.custom.SuggestedIssueTypeSubject(Utility);
            subject2.Subject = "S2";

            datas.push(subject1);
            datas.push(subject2);

            resultList = [];
            resultList.push(new ap.viewmodels.projects.SuggestedIssueTypeSubjectViewModel("S1"));
            resultList.push(new ap.viewmodels.projects.SuggestedIssueTypeSubjectViewModel("S2"));

            defData.resolve(datas);
        });

        describe("When the getSubject method was called and the user have been select the vm from the list", () => {
            it("THEN, will return the subject of the selected vm", () => {
                

                vm = new ap.viewmodels.projects.SuggestedIssueTypeSubjectListViewModel(Utility, $q, ControllersManager, "S");
                vm.issueTypeId = "IssueType1";

                vm.searchSubjects("S").then(function (args) {
                    callback(args);
                });

                vm.selectedSubjectVM = resultList[1];
                let result = vm.getSubject();

                $rootScope.$apply();
                expect(NoteController.getSuggestedIssueTypeSubjects).toHaveBeenCalled();
                expect(callback).toHaveBeenCalledWith(resultList);
                expect(result).toEqual("S2");

            });
        });
        describe("When the getSubject method was called and the user have been enter the free text ", () => {
            it("THEN, will return the searchText", () => {
                
                vm = new ap.viewmodels.projects.SuggestedIssueTypeSubjectListViewModel(Utility, $q, ControllersManager, "S");
                vm.issueTypeId = "IssueType1";

                vm.searchSubjects("S").then(function (args) {
                    callback(args);
                });

                vm.searchText = "S3";

                let result = vm.getSubject();

                $rootScope.$apply();
                expect(NoteController.getSuggestedIssueTypeSubjects).toHaveBeenCalled();
                expect(callback).toHaveBeenCalledWith(resultList);
                expect(result).toEqual("S3");
            });
        });
    }
    );
    
});