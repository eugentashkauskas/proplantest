describe("Module ap-viewmodels - folders", () => {

    let nmp = ap.viewmodels.notes;
    let ControllersManager: ap.controllers.ControllersManager, Utility: ap.utility.UtilityHelper, Api: ap.services.apiHelper.Api, UserContext: ap.utility.UserContext, UIStateController: ap.controllers.UIStateController;
    let $controller: angular.IControllerService, $rootScope: angular.IRootScopeService, $scope: angular.IScope, _deferred: angular.IDeferred<ap.services.apiHelper.ApiResponse>,
        $q: angular.IQService, $timeout: angular.ITimeoutService, $compile: angular.ICompileService; let ServicesManager: ap.services.ServicesManager;
    let vm: ap.viewmodels.folders.FolderListViewModel;
    let $mdDialog: angular.material.IDialogService;
    let idsFolders = [
        {
            Id: "11111111-1111-1111-1111-111111111111",
            Object: 0
        },
        {
            Id: "360cb6d-ca54-4b93-a564-a469274eb68a",
            Object: 1
        },
        {
            Id: "35a2c5d6-0e00-43e9-ada8-ce4f3fadb16e",
            Object: 2
        },
        {
            Id: "bf70c80f-3b76-4bf8-bef4-86c7b1d4aa60",
            Object: 3
        },
        {
            Id: "bf70c80f-3b76-8jf8-bef4-8kreb1d4aa60",
            Object: 1
        },
        {
            Id: "66c475bb-1e23-4b76-820e-42654ee74c6b",
            Object: 2
        },
        {
            Id: "aac674a5-4ab2-4d5d-8895-67bf466aca9d",
            Object: 1
        },
        {
            Id: "22222222-2222-2222-2222-222222222222",
            Object: 0
        },
        {
            Id: "f435896d-c6d3-433e-8eb9-36df90e6c444",
            Object: 1
        },
        {
            Id: "33333333-3333-3333-3333-333333333333",
            Object: 0
        },
        {
            Id: "4cd68f92-df2d-46ac-9f6a-9c96c09bee0d",
            Object: 1
        }
    ];
    let dataFolders = [
        {
            Id: "360cb6d-ca54-4b93-a564-a469274eb68a",
            Name: "Documents",
            FolderType: "Custom"
        },
        {
            Id: "35a2c5d6-0e00-43e9-ada8-ce4f3fadb16e",
            Name: "Plans",
            FolderType: "Custom"
        },
        {
            Id: "bf70c80f-3b76-4bf8-bef4-86c7b1d4aa60",
            Name: "Architectes",
            FolderType: "Custom"
        },
        {
            Id: "bf70c80f-3b76-8jf8-bef4-8kreb1d4aa60",
            Name: "Etages",
            FolderType: "Custom"
        },
        {
            Id: "66c475bb-1e23-4b76-820e-42654ee74c6b",
            Name: "Escaliers",
            FolderType: "Custom"
        },
        {
            Id: "aac674a5-4ab2-4d5d-8895-67bf466aca9d",
            Name: "Grenier",
            FolderType: "Custom"
        },
        {
            Id: "f435896d-c6d3-433e-8eb9-36df90e6c444",
            Name: "Photo",
            FolderType: "Photo",
            Creator: {
                Id: "b738269f-c8cb-4cdd-b85e-0cd9b5df7bd6",
                Alias: "luc.quentin@gmail.com"
            }
        },
        {
            Id: "4cd68f92-df2d-46ac-9f6a-9c96c09bee0d",
            Name: "Report",
            FolderType: "Report",
            Creator: {
                Id: "b738269f-c8cb-4cdd-b85e-0cd9b5df7bd6",
                Alias: "luc.quentin@gmail.com"
            }
        }
    ];
    let planNumbers = [
        {
            Id: "360cb6d-ca54-4b93-a564-a469274eb68a",
            Object: "2"
        },
        {
            Id: "35a2c5d6-0e00-43e9-ada8-ce4f3fadb16e",
            Object: "19"
        },
        {
            Id: "bf70c80f-3b76-4bf8-bef4-86c7b1d4aa60",
            Object: "0"
        },
        {
            Id: "bf70c80f-3b76-8jf8-bef4-8kreb1d4aa60",
            Object: "5"
        },
        {
            Id: "66c475bb-1e23-4b76-820e-42654ee74c6b",
            Object: "0"
        },
        {
            Id: "aac674a5-4ab2-4d5d-8895-67bf466aca9d",
            Object: "4"
        },
        {
            Id: "f435896d-c6d3-433e-8eb9-36df90e6c444",
            Object: "8"
        },
        {
            Id: "4cd68f92-df2d-46ac-9f6a-9c96c09bee0d",
            Object: "12"
        }
    ];

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

    beforeEach(inject(function (_$rootScope_, _$q_, _$timeout_, _$compile_, _UserContext_, _Utility_, _Api_, _ControllersManager_, _UIStateController_, _$controller_, _ServicesManager_, _$mdDialog_) {
        ControllersManager = _ControllersManager_;
        UIStateController = _UIStateController_;
        Utility = _Utility_;
        UserContext = _UserContext_;
        Api = _Api_;
        ServicesManager = _ServicesManager_;
        vm = null;
        $q = _$q_;
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $timeout = _$timeout_;
        _deferred = $q.defer();
        $controller = _$controller_;
        $mdDialog = _$mdDialog_;
        $scope = $rootScope.$new();
        specHelper.utility.stubRootUrl(Utility);
        specHelper.userContext.stub(Utility);
        specHelper.utility.stubStorageSet(Utility);
        specHelper.mainController.stub(ControllersManager.mainController, Utility);
    }));

    describe("Feature FolderItemViewModel", () => {
        let f: ap.models.projects.Folder;
        let item: ap.viewmodels.folders.FolderItemViewModel;
        let jsonProj: any;
        beforeEach(() => {
            f = new ap.models.projects.Folder(Utility);
            f.Name = "Documents";
            jsonProj =
                {
                    Name: "My project",
                    IsActive: true,
                    UserAccessRight: {
                        CanEditFolder: true,
                        CanEditAllFolder: true,
                        CanAddFolder: true,
                        CanDeleteFolder: true
                    }
                };

            specHelper.general.spyProperty(ap.viewmodels.folders.FolderItemConstructorParameter.prototype, "isExpanded", specHelper.PropertyAccessor.Get).and.returnValue(true);
            specHelper.general.spyProperty(ap.viewmodels.folders.FolderItemConstructorParameter.prototype, "level", specHelper.PropertyAccessor.Get).and.returnValue(1);
        });

        afterEach(() => {
            specHelper.general.offSpyProperty(ap.viewmodels.folders.FolderItemConstructorParameter.prototype, "isExpanded", specHelper.PropertyAccessor.Get);
            specHelper.general.offSpyProperty(ap.viewmodels.folders.FolderItemConstructorParameter.prototype, "level", specHelper.PropertyAccessor.Get);
        });

        describe("WHEN an item is created with a folder and all values are defined and with action = false", () => {
            beforeEach(() => {

                item = new ap.viewmodels.folders.FolderItemViewModel(Utility, $q, null, new ap.viewmodels.folders.FolderItemConstructorParameter(1, f, new ap.viewmodels.PageDescription(), new ap.viewmodels.LoadPageSuccessHandlerParameter(null), Utility, ControllersManager, false));
                item.init(f);
            });
            it("THEN, the items is build with the correct values", () => {
                expect(item.name).toBe("Documents");
                expect(item.level).toBe(1);
                expect(item.isExpanded).toBeTruthy();
                expect(item.isRootFolder).toBeFalsy();
            });
            it("THEN, the folderItemActionViewModel is not defined", () => {
                expect(item.folderItemActionViewModel).toEqual(null);
            });
            it("THEN, canSave = true", () => {
                expect(item.canSave).toBeTruthy();
            });
        });

        describe("WHEN the viewmodel.name is changed to empty or null value", () => {
            beforeEach(() => {
                item = new ap.viewmodels.folders.FolderItemViewModel(Utility, $q, null, new ap.viewmodels.folders.FolderItemConstructorParameter(1, f, new ap.viewmodels.PageDescription(), new ap.viewmodels.LoadPageSuccessHandlerParameter(null), Utility, ControllersManager, true));
                item.init(f);
            });
            it("NULL Then, equals canSave = false", () => {
                item.name = null;
                expect(item.canSave).toBeFalsy();
            });
            it("Empty Then, equals canSave = false", () => {
                item.name = "   ";
                expect(item.canSave).toBeFalsy();
            });
        });

        describe("WHEN an item is created with a folder that is a system folder", () => {
            let folder: ap.models.projects.Folder;
            let json: any;
            beforeEach(() => {
                json =
                    {
                        Id: "11111111-1111-1111-1111-111111111111",
                    };
                folder = new ap.models.projects.Folder(Utility);
                folder.createByJson(json);

                item = new ap.viewmodels.folders.FolderItemViewModel(Utility, $q, null, new ap.viewmodels.folders.FolderItemConstructorParameter(1, folder, new ap.viewmodels.PageDescription(), new ap.viewmodels.LoadPageSuccessHandlerParameter(null), Utility, ControllersManager, true));
                item.init(folder);
            });
            it("THEN, isRootFolder == true", () => {
                expect(item.isRootFolder).toBeTruthy();
            });
        });

        describe("WHEN the isExpanded property of an item changed", () => {
            it("THEN, the new value is set and the event propertychanged is raised", () => {
                let callback = jasmine.createSpy("callback");

                item = new ap.viewmodels.folders.FolderItemViewModel(Utility, $q, null, new ap.viewmodels.folders.FolderItemConstructorParameter(1, f, new ap.viewmodels.PageDescription(), new ap.viewmodels.LoadPageSuccessHandlerParameter(null), Utility, ControllersManager, false));
                item.init(f);
                item.isExpanded = true;

                item.on("propertychanged", callback, this);

                item.isExpanded = false;

                expect(callback).toHaveBeenCalledWith(new ap.viewmodels.base.PropertyChangedEventArgs("isExpanded", true, item));
            });
        });

        describe("WHEN postChanges() is called", () => {
            beforeEach(() => {
                item = new ap.viewmodels.folders.FolderItemViewModel(Utility, $q, null, new ap.viewmodels.folders.FolderItemConstructorParameter(1, f, new ap.viewmodels.PageDescription(), new ap.viewmodels.LoadPageSuccessHandlerParameter(null), Utility, ControllersManager, false));
                item.init(f);
                item.name = "NouveauNom";
                item.postChanges();
            });
            it("THEN the name is set to the folder", () => {
                expect(f.Name).toEqual("NouveauNom");
            });
        });
    });

    describe("Feature: Default values", () => {
        let options: ap.services.apiHelper.ApiOption;

        beforeEach(() => {
            let defPlansNum = $q.defer();

            spyOn(Utility.Storage.Session, "get").and.returnValue(null);
            spyOn(Api, "getApiResponse").and.callFake(function (url, method) {
                if (url.indexOf("rest/projectfolderidsandlevels") === 0 && method === ap.services.apiHelper.MethodType.Get)
                    return _deferred.promise;
                else if (url.indexOf("rest/folderdocumentcount") === 0 && method === ap.services.apiHelper.MethodType.Get)
                    return defPlansNum.promise;
                return null;
            });

            options = new ap.services.apiHelper.ApiOption();
            options.async = true;
        });

        describe("When the current project of the mainController is not null", () => {
            beforeEach(() => {
                vm = new ap.viewmodels.folders.FolderListViewModel($scope, Utility, Api, ControllersManager, $mdDialog, $q, $timeout, ServicesManager, true);
            });
            it("THEN, I can get an instance of my viewmodel with default values AND the vm is defined", () => {
                expect(vm).toBeDefined();
            });

            it("THEN, I can get an instance of my viewmodel with default values AND the list is defined", () => {
                expect(vm.listVm).toBeDefined();
            });

            it("THEN, I can get an instance of my viewmodel with default values AND the list's pathtotload is 'Creator'", () => {
                expect(vm.listVm.pathToLoad).toBe("Creator");
            });

            it("THEN, I can get an instance of my viewmodel with default values AND the list's customParams contains the projectId", () => {
                expect(vm.listVm.containsParam("projectid")).toBeTruthy();
            });
        });
        describe("WHEN the listViewModel is created", () => {
            describe("WHEN isForDocumentModule equals true", () => {
                beforeEach(() => {
                    vm = new ap.viewmodels.folders.FolderListViewModel($scope, Utility, Api, ControllersManager, $mdDialog, $q, $timeout, ServicesManager, true);
                });

                it("THEN foldertreeactionviewmodel is defined", () => {
                    expect(vm.folderTreeActionViewModel).toBeDefined();
                });
            });

            describe("WHEN isForDocumentModule equals false", () => {
                beforeEach(() => {
                    vm = new ap.viewmodels.folders.FolderListViewModel($scope, Utility, Api, ControllersManager, $mdDialog, $q, $timeout, ServicesManager, false);
                });
                it("THEN foldertreeactionviewmodel is not defined", () => {
                    expect(vm.folderTreeActionViewModel).toBeNull();
                });
            });
        });
    });

    describe("Feature: refresh", () => {
        let defPlansNum;

        beforeEach(() => {
            let defApi = $q.defer();
            defPlansNum = $q.defer();
            spyOn(Api, "getApiResponse").and.callFake(function (url, method) {
                if (url.indexOf("rest/projectfolderidsandlevels") === 0 && method === ap.services.apiHelper.MethodType.Get)
                    return _deferred.promise;
                else if (url.indexOf("rest/folderdocumentcount") === 0 && method === ap.services.apiHelper.MethodType.Get)
                    return defPlansNum.promise;
                return null;
            });

            vm = new ap.viewmodels.folders.FolderListViewModel($scope, Utility, Api, ControllersManager, $mdDialog, $q, $timeout, ServicesManager, true);

            _deferred.resolve(new ap.services.apiHelper.ApiResponse([]));
            defPlansNum.resolve(new ap.services.apiHelper.ApiResponse("0"));
            $rootScope.$apply();
        });

        describe("WHEN the refresh method is called", () => {
            let _defLoadPage: angular.IDeferred<any>;

            beforeEach(() => {
                _defLoadPage = $q.defer();
                spyOn(vm.listVm, 'loadIds').and.returnValue(_deferred.promise);
                spyOn(vm.listVm, 'clearLoaderCache').and.callThrough();
                spyOn(vm.listVm, 'loadPage').and.returnValue(_defLoadPage.promise);
                vm.refresh();
            });

            it("THEN, a loader cache is cleared", () => {
                expect(vm.listVm.clearLoaderCache).toHaveBeenCalled();
            });

            it("THEN, loadIds is called", () => {
                _deferred.resolve(new ap.services.apiHelper.ApiResponse({}));
                $rootScope.$apply();

                expect(vm.listVm.loadIds).toHaveBeenCalledWith();
            });

            it("THEN, when succeded loadPage is called AND the list is refreshed", () => {
                _deferred.resolve(new ap.services.apiHelper.ApiResponse({}));
                $rootScope.$apply();
                _defLoadPage.resolve({ data: {} });
                $rootScope.$apply();
                expect(vm.listVm.loadPage).toHaveBeenCalledWith(0, null);
            });
        });

        describe("WHEN the refresh method is called several times before the load finish", () => {
            let _defLoadPage: angular.IDeferred<any>;
            beforeEach(() => {
                _defLoadPage = $q.defer();
                spyOn(vm.listVm, 'loadIds').and.returnValue(_deferred.promise);
                spyOn(vm.listVm, 'loadPage').and.returnValue(_defLoadPage.promise);

                vm.refresh();
                vm.refresh();
                vm.refresh();

                _deferred.resolve(new ap.services.apiHelper.ApiResponse({}));
                $rootScope.$apply();
                _defLoadPage.resolve({ data: {} });
                $rootScope.$apply();

            });
            it("THEN, loadIds is called just one time", () => {
                expect((<jasmine.Spy>vm.listVm.loadIds).calls.count()).toEqual(1);
            });
        });
    });

    describe("Feature: updateFolderList", () => {
        let f: ap.models.projects.FolderChangedResult;
        describe("WHEN a folder", () => {
            beforeEach(() => {

                let json: any = {
                    FolderChanged: {
                        Name: 'Plans folder'
                    },
                    OtherFolderChangedList: [
                        {
                            Name: 'Plans folder 1',
                            Id: '1'
                        },
                        {
                            Name: 'Plans folder 2',
                            Id: '2'
                        },
                        {
                            Name: 'Plans folder 3',
                            Id: '3'
                        },
                        {
                            Name: 'Plans folder 4',
                            Id: '4'
                        }
                    ]
                };

                f = new ap.models.projects.FolderChangedResult(Utility);
                f.createByJson(json);
                vm = new ap.viewmodels.folders.FolderListViewModel($scope, Utility, Api, ControllersManager, $mdDialog, $q, $timeout, ServicesManager, true);

                spyOn(vm.listVm, "getLoadedItemsIds").and.returnValue(["1", "2", "3", "4"]);
                spyOn(vm.listVm, "updateItem");
            });

            describe("is updated AND the foldersaved event is raised", () => {
                beforeEach(() => {
                    specHelper.general.raiseEvent(ControllersManager.projectController, "foldersaved", new ap.controllers.FolderSavedEvent(f, false, false));
                });
                it("THEN refresh is called", () => {
                    expect(vm.refresh()).toHaveBeenCalled;
                });
                it("THEN refresh is called", () => {
                    expect((<jasmine.Spy>vm.listVm.updateItem).calls.count()).toEqual(4);
                });
            });

            describe("is deleted and the folderdeleted event is raised", () => {
                beforeEach(() => {
                    specHelper.general.raiseEvent(ControllersManager.projectController, "folderdeleted", new ap.controllers.FolderSavedEvent(f, false, false));
                });
                it("THEN refresh is called", () => {
                    expect(vm.refresh()).toHaveBeenCalled;
                });
                it("THEN refresh is called", () => {
                    expect((<jasmine.Spy>vm.listVm.updateItem).calls.count()).toEqual(4);
                });
            });
        });

        describe("WHEN a new folder is created", () => {
            let parentFolder: ap.models.projects.Folder;
            let isExpandedSpy: jasmine.Spy;

            beforeEach(() => {

                let json: any = {
                    FolderChanged: {
                        Name: "Plans folder",
                        ParentFolderId: "4"
                    },
                    OtherFolderChangedList: []
                };

                f = new ap.models.projects.FolderChangedResult(Utility);
                f.createByJson(json);
                vm = new ap.viewmodels.folders.FolderListViewModel($scope, Utility, Api, ControllersManager, $mdDialog, $q, $timeout, ServicesManager, true);

                parentFolder = new ap.models.projects.Folder(Utility);
                parentFolder.createByJson({
                    Name: "Plans folder",
                    Id: "4"
                });
                let parentFolderVm: ap.viewmodels.folders.FolderItemViewModel = new ap.viewmodels.folders.FolderItemViewModel(Utility, $q);
                parentFolderVm.init(parentFolder);
                isExpandedSpy = specHelper.general.spyProperty(ap.viewmodels.TreeEntityViewModel.prototype, "isExpanded", specHelper.PropertyAccessor.Set);
                specHelper.general.spyProperty(ap.viewmodels.TreeEntityViewModel.prototype, "isExpanded", specHelper.PropertyAccessor.Get).and.returnValue(false);

                spyOn(vm.listVm, "getLoadedItemsIds").and.returnValue(["1", "2", "3", "4"]);
                spyOn(vm.listVm, "getEntityById").and.returnValue(parentFolderVm);
                spyOn(vm.listVm, "updateItem");

                specHelper.general.raiseEvent(ControllersManager.projectController, "foldersaved", new ap.controllers.FolderSavedEvent(f, true, false));
            });

            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.TreeEntityViewModel.prototype, "isExpanded", specHelper.PropertyAccessor.Set);
                specHelper.general.offSpyProperty(ap.viewmodels.TreeEntityViewModel.prototype, "isExpanded", specHelper.PropertyAccessor.Get);
            });

            describe("AND the foldersaved event is raised", () => {
                it("THEN, the isExpanded property of the parent folder is set to true", () => {
                    expect(isExpandedSpy).toHaveBeenCalledWith(true);
                });
                it("THEN refresh is called", () => {
                    expect(vm.refresh()).toHaveBeenCalled;
                });
                it("THEN refresh is called", () => {
                    expect((<jasmine.Spy>vm.listVm.updateItem).calls.count()).toEqual(0);
                });
            });
        });
    });

    describe("Feature: event", () => {

        describe("WHEN event editfolderrequested is raised", () => {
            beforeEach(() => {
                let folder = new ap.models.projects.Folder(Utility);
                vm = new ap.viewmodels.folders.FolderListViewModel($scope, Utility, Api, ControllersManager, $mdDialog, $q, $timeout, ServicesManager, true);
                specHelper.general.raiseEvent(ControllersManager.projectController, "editfolderrequested", folder);
            });
            it("THEN mdDialog is show", () => {
                expect($mdDialog.show).toHaveBeenCalled();
            });
        });

        describe("WHEN event addfolderrequested is raised", () => {
            beforeEach(() => {
                let jsonProject =
                    {
                        Name: "My project",
                        IsActive: true,
                        UserAccessRight: {
                            CanEditFolder: true,
                            CanEditAllFolder: false,
                            CanAddFolder: false,
                            CanDeleteFolder: false
                        }
                    };
                let folder = new ap.models.projects.Folder(Utility);
                vm = new ap.viewmodels.folders.FolderListViewModel($scope, Utility, Api, ControllersManager, $mdDialog, $q, $timeout, ServicesManager, true);
                specHelper.general.raiseEvent(ControllersManager.projectController, "addfolderrequested", folder);
            });
            it("THEN mdDialog is show", () => {
                expect($mdDialog.show).toHaveBeenCalled();
            });
        });
    });
});