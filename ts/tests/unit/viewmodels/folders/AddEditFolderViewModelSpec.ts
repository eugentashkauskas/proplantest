'use strict';
describe("Module ap-viewmodels - AddEditfolderViewModel", () => {
    let Utility: ap.utility.UtilityHelper;
    let ProjectController: ap.controllers.ProjectController;
    let MainController: ap.controllers.MainController;
    let $mdDialog: angular.material.IDialogService;
    let $q: angular.IQService;
    let mdDialogDeferred: angular.IDeferred<any>;
    let vm: ap.viewmodels.folders.AddEditFolderViewModel;
    let folder: ap.models.projects.Folder;
    let folderItem: ap.viewmodels.folders.FolderItemViewModel;
    let json: any;
    let spyHide: jasmine.Spy;
    let hideDeferred: angular.IDeferred<any>;
    let spyCancel: jasmine.Spy;
    let cancelDeferred: angular.IDeferred<any>;

    beforeEach(() => {
        let $window = specHelper.createWindowStub();
        $window.navigator.userLanguage = undefined;
        $window.navigator.language = 'en_US';
        angular.mock.module(function ($provide) {
            $provide.value('$window', $window);
            $provide.value('$mdDialog', $mdDialog);
        });

        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");

        angular.mock.module(function ($provide) {
            $provide.factory('$mdDialog', ["$q", function ($q) {
                return specHelper.utility.stubShowMdDialog($q);
            }]);
        });
    });

    function createVm(folderItem: ap.viewmodels.folders.FolderItemViewModel): ap.viewmodels.folders.AddEditFolderViewModel {
        return new ap.viewmodels.folders.AddEditFolderViewModel(Utility, $q, $mdDialog, ProjectController, folderItem);
    }

    beforeEach(inject(function (_Utility_, _ProjectController_, _$mdDialog_, _$q_, _MainController_) {
        ProjectController = _ProjectController_;
        Utility = _Utility_;
        $mdDialog = _$mdDialog_;
        $q = _$q_;
        MainController = _MainController_;
    }));

    beforeEach(() => {
        spyHide = <jasmine.Spy>$mdDialog.hide;
        hideDeferred = $q.defer();
        spyHide.and.returnValue(hideDeferred.promise);

        spyCancel = <jasmine.Spy>$mdDialog.cancel;
        cancelDeferred = $q.defer();
        spyCancel.and.returnValue(cancelDeferred.promise);

        json =
            {
                Name: "Folder's Name",
            };
        folder = new ap.models.projects.Folder(Utility);
        folderItem = new ap.viewmodels.folders.FolderItemViewModel(Utility, $q);
    });

    describe("Feature constructor", () => {
        describe("WHEN the folder is new", () => {
            beforeEach(() => {
                folderItem.init(folder);
                vm = createVm(folderItem);
            });
            it("THEN, title equal : Edit folder name ", () => {
                expect(vm.title).toEqual("[Edit folder name]");
            });
        });
        describe("WHEN the folder isn't new", () => {
            beforeEach(() => {
                folder.createByJson(json);
                folderItem.init(folder);
                vm = createVm(folderItem);
            });
            it("THEN, title equal Folder's Name", () => {
                expect(vm.title).toEqual("Folder's Name");
            });
        });
    });

    describe("Feature save", () => {
        beforeEach(() => {
            spyOn(folderItem, "postChanges");
            spyOn(ProjectController, "saveFolder");
            folderItem.init(folder);
            vm = createVm(folderItem);
            vm.save();
        });
        describe("WHEN the save method is called", () => {
            it("THEN, postChanges is called ", () => {
                expect(folderItem.postChanges).toHaveBeenCalled();
            });
            it("THEN, saveFolder is called ", () => {
                expect(ProjectController.saveFolder).toHaveBeenCalledWith(folderItem.originalFolder);
            });
            it("THEN, mdDialog is hide ", () => {
                expect($mdDialog.hide).toHaveBeenCalled();
            });
            it("THEN, 'name' is added to the modifiedproperties", () => {
                expect(folderItem.originalFolder.ModifiedProperties.length).toBe(0);
            });
        });
    });

    describe("Feature save", () => {
        beforeEach(() => {
            spyOn(folderItem, "postChanges");
            spyOn(ProjectController, "saveFolder");
            folder = new ap.models.projects.Folder(Utility);
            folder.Name = "aaa";
            folderItem.init(folder);
            vm = createVm(folderItem);
            vm.save();
        });
        describe("WHEN the save method is called with a new folder", () => {
            it("THEN, postChanges is called ", () => {
                expect(folderItem.postChanges).toHaveBeenCalled();
            });
            it("THEN, saveFolder is called ", () => {
                expect(ProjectController.saveFolder).toHaveBeenCalledWith(folderItem.originalFolder);
            });
            it("THEN, mdDialog is hide ", () => {
                expect($mdDialog.hide).toHaveBeenCalled();
            });
            it("THEN, 'name' is added to the modifiedproperties", () => {
                expect(folderItem.originalFolder.ModifiedProperties.length).toBe(0);
            });
        });
    });

    describe("Feature cancel", () => {
        beforeEach(() => {
            spyOn(folderItem, "copySource");
            folderItem.init(folder);
            vm = createVm(folderItem);
            vm.cancel();
        });
        describe("WHEN the cancel method is called", () => {
            it("THEN, copySource is called ", () => {
                expect(folderItem.copySource).toHaveBeenCalled();
            });
            it("THEN, mdDialog is cancel ", () => {
                expect($mdDialog.cancel).toHaveBeenCalled();
            });
        });
    });
});