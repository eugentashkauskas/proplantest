describe("Module ap-viewmodels - folders paged list viewmodel", () => {

    let nmp = ap.viewmodels.notes;
    let ControllersManager: ap.controllers.ControllersManager, Utility: ap.utility.UtilityHelper, Api: ap.services.apiHelper.Api, UserContext: ap.utility.UserContext, UIStateController: ap.controllers.UIStateController;
    let $controller: angular.IControllerService, $rootScope: angular.IRootScopeService, $scope: angular.IScope, _deferred: angular.IDeferred<ap.services.apiHelper.ApiResponse>,
        $q: angular.IQService, $timeout: angular.ITimeoutService, $compile: angular.ICompileService; let ServicesManager: ap.services.ServicesManager;
    let vm: ap.viewmodels.folders.FolderListViewModel;
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
            Id: "11111111-1111-1111-1111-111111111111",
            Name: "Public",
            FolderType: "Custom"
        },
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
            Id: "22222222-2222-2222-2222-222222222222",
            Name: "Photo",
            FolderType: "Photo"
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
            Id: "33333333-3333-3333-3333-333333333333",
            Name: "Report",
            FolderType: "Report"
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
            Object: 2
        },
        {
            Id: "35a2c5d6-0e00-43e9-ada8-ce4f3fadb16e",
            Object: 19
        },
        {
            Id: "bf70c80f-3b76-4bf8-bef4-86c7b1d4aa60",
            Object: 0
        },
        {
            Id: "bf70c80f-3b76-8jf8-bef4-8kreb1d4aa60",
            Object: 5
        },
        {
            Id: "66c475bb-1e23-4b76-820e-42654ee74c6b",
            Object: 0
        },
        {
            Id: "aac674a5-4ab2-4d5d-8895-67bf466aca9d",
            Object: 4
        },
        {
            Id: "f435896d-c6d3-433e-8eb9-36df90e6c444",
            Object: 8
        },
        {
            Id: "4cd68f92-df2d-46ac-9f6a-9c96c09bee0d",
            Object: 12
        }
    ];

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject(function (_$rootScope_, _$q_, _$timeout_, _$compile_, _UserContext_, _Utility_, _Api_, _ControllersManager_, _UIStateController_, _$controller_, _ServicesManager_) {
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
        $scope = $rootScope.$new();
        specHelper.utility.stubRootUrl(Utility);
        specHelper.userContext.stub(Utility);
        specHelper.mainController.stub(ControllersManager.mainController, Utility);
        let defchapoo = $q.defer();
        spyOn(ServicesManager.cloudService, "getFolderSyncInfo").and.returnValue(defchapoo.promise);
    }));

    describe("Default values of FoldersPagedListViewModel", () => {
        describe("WHEN I create the VM with all the parameters", () => {
            it("THEN, it's created with the default values", () => {

                let genericList = new ap.viewmodels.folders.FoldersPagedListViewModel(Utility, Api, $q, $timeout, ServicesManager, ControllersManager, false, ap.viewmodels.folders.FolderItemViewModel, "Creator", null, null, false);

                expect(genericList.options.pageSize).toBe(50);
                expect(genericList.options.displayLoading).toBeFalsy();
                expect(genericList.options.isGetIdsCustom).toBeTruthy();
                expect(genericList.entityName).toBe("Folder");
                expect(genericList.options.customEntityIds).toBe("projectfolderidsandlevels");
                expect(genericList.pathToLoad).toBe("Creator");
            });
        });

        describe("WHEN I create the VM with not all the parameters", () => {
            it("THEN, it's created with the default values", () => {

                let genericList = new ap.viewmodels.folders.FoldersPagedListViewModel(Utility, Api, $q, $timeout, ServicesManager, ControllersManager, false);

                expect(genericList.options.pageSize).toBe(50);
                expect(genericList.options.displayLoading).toBeFalsy();
                expect(genericList.options.isGetIdsCustom).toBeTruthy();
                expect(genericList.entityName).toBe("Folder");
                expect(genericList.options.customEntityIds).toBe("projectfolderidsandlevels");
                expect(genericList.pathToLoad).toBeNull();
            });
        });
    });

    describe("Feature: getItemById ", () => {
        let genericList: ap.viewmodels.folders.FoldersPagedListViewModel, defLoadData, defSelectedFolder;
        let apiOpt = new ap.services.apiHelper.ApiOption();
        let item: ap.viewmodels.folders.FolderItemViewModel;
        let folder: ap.models.projects.Folder;
        beforeEach(() => {
            Utility.UserContext.CurrentUser().Id = "b738269f-c8cb-4cdd-b85e-0cd9b5df7bd6";

            spyOn(Api, "getApiResponse").and.callFake(function (url, method) {
                if (url.indexOf("rest/projectfolderidsandlevels") === 0 && method === ap.services.apiHelper.MethodType.Get)
                    return _deferred.promise;
                return null;
            });

            defLoadData = $q.defer();
            spyOn(Api, "getEntityList").and.callFake(function () {
                return defLoadData.promise;
            });

            let expandedFolderIds: string[] = [idsFolders[0].Id, idsFolders[1].Id, idsFolders[2].Id, dataFolders[3].Id];
            spyOn(Utility.Storage.Local, "get").and.returnValue(ControllersManager.mainController.currentProject().Id + ";" + expandedFolderIds.join(";"));

            defSelectedFolder = $q.defer();
            spyOn(ServicesManager.folderService, "getFirstFolderIdContainingDocuments").and.returnValue(defSelectedFolder.promise);

            defSelectedFolder.resolve(new ap.services.apiHelper.ApiResponse(idsFolders[0].Id));

            genericList = new ap.viewmodels.folders.FoldersPagedListViewModel(Utility, Api, $q, $timeout, ServicesManager, ControllersManager, false, ap.viewmodels.folders.FolderItemViewModel, "Creator", null, null, false, 4);
            
            apiOpt.async = true;
            apiOpt.onlyPathToLoadData = false;

            genericList.loadIds();
            _deferred.resolve(new ap.services.apiHelper.ApiResponse(idsFolders.slice(0, 4)));
            $rootScope.$apply();
            spyOn(genericList.sourceItems, "filter").and.callFake(() => {
                return [dataFolders[0]];
            });
            genericList.loadNextPage();

            defLoadData.resolve({ data: [dataFolders[1], dataFolders[2], dataFolders[3]] });
            $rootScope.$apply();
            defLoadData = $q.defer();

            let json = { Id: "35a2c5d6-0e00-43e9-ada8-ce4f3fadb16e" };
            folder = new ap.models.projects.Folder(Utility);
            folder.createByJson(json);
        });

        describe("WHEN getItemById is called", () => {
            beforeEach(() => {
                item = <ap.viewmodels.folders.FolderItemViewModel>genericList.getEntityById(folder.Id);
            });
            it("THEN the item is return", () => {
                expect(item.name).toEqual("Plans");
            });
        });
    });

    describe("Feature: loadNextPage", function () {

        let genericList: ap.viewmodels.folders.FoldersPagedListViewModel, defLoadData;
        let apiOpt = new ap.services.apiHelper.ApiOption();
        let pathToLoad = "Creator";
        let defPlansNum;
        let defLoadFirstFolderId: angular.IDeferred<any>;

        beforeEach(() => {
            Utility.UserContext.CurrentUser().Id = "b738269f-c8cb-4cdd-b85e-0cd9b5df7bd6";
            //specHelper.mainController.stub(MainController);
            defPlansNum = $q.defer();
            defLoadFirstFolderId = $q.defer();

            spyOn(Api, "getApiResponse").and.callFake(function (url, method) {
                if (url.indexOf("rest/projectfolderidsandlevels") === 0 && method === ap.services.apiHelper.MethodType.Get)
                    return _deferred.promise;
                else if (url.indexOf("rest/folderdocumentcount") === 0 && method === ap.services.apiHelper.MethodType.Get)
                    return defPlansNum.promise;
                return null;
            });

            defLoadData = $q.defer();
            spyOn(Api, "getEntityList").and.callFake(function () {
                return defLoadData.promise;
            });

            spyOn(ServicesManager.folderService, "getFirstFolderIdContainingDocuments").and.returnValue(defLoadFirstFolderId.promise);

            apiOpt.async = true;
            apiOpt.onlyPathToLoadData = false;

            genericList = new ap.viewmodels.folders.FoldersPagedListViewModel(Utility, Api, $q, $timeout, ServicesManager, ControllersManager, false, ap.viewmodels.folders.FolderItemViewModel, "Creator", null, null, true, 4);
            
            genericList.loadIds();

            _deferred.resolve(new ap.services.apiHelper.ApiResponse(idsFolders));
            $rootScope.$apply();
            spyOn(genericList.sourceItems, "filter").and.callFake(() => {
                return [dataFolders[0]];
            });
        });

        describe("GIVEN a list where the loadIds was already called WHEN the loadNextPage is called", function () {
            it("THEN, getEntityList is called to get the pages", function () {
                genericList.loadNextPage();

                expect(Api.getEntityList).toHaveBeenCalledWith("Folder", null, pathToLoad, null, ["11111111-1111-1111-1111-111111111111", "360cb6d-ca54-4b93-a564-a469274eb68a", "35a2c5d6-0e00-43e9-ada8-ce4f3fadb16e", "bf70c80f-3b76-4bf8-bef4-86c7b1d4aa60"], apiOpt);

                defLoadData.resolve({ data: [dataFolders[0], dataFolders[1], dataFolders[2], dataFolders[3]] });
                $rootScope.$apply();
                defLoadData = $q.defer();

                genericList.loadNextPage();
                expect(Api.getEntityList).toHaveBeenCalledWith("Folder", null, pathToLoad, null, ["bf70c80f-3b76-8jf8-bef4-8kreb1d4aa60", "66c475bb-1e23-4b76-820e-42654ee74c6b", "aac674a5-4ab2-4d5d-8895-67bf466aca9d", "22222222-2222-2222-2222-222222222222"], apiOpt);

                defLoadData.resolve({ data: [dataFolders[4], dataFolders[5], dataFolders[6], dataFolders[7]] });
                $rootScope.$apply();

                defLoadData = $q.defer();

                genericList.loadNextPage();
                expect(Api.getEntityList).toHaveBeenCalledWith("Folder", null, pathToLoad, null, ["f435896d-c6d3-433e-8eb9-36df90e6c444", "33333333-3333-3333-3333-333333333333", "4cd68f92-df2d-46ac-9f6a-9c96c09bee0d"], apiOpt);
                defLoadData.resolve({ data: [dataFolders[8], dataFolders[9], dataFolders[10]] });
                $rootScope.$apply();

                defLoadData = $q.defer();

                expect(genericList.isLoaded).toBeTruthy();
                genericList.loadNextPage();
            });
            it("THEN, FolderList.getFirstFolderIdContainingDocuments is called to get the first folder to select", () => {
                genericList.loadNextPage();
                defLoadData.resolve({ data: [dataFolders[1], dataFolders[2], dataFolders[3]] });
                $rootScope.$apply();
                defLoadData = $q.defer();

                expect(ServicesManager.folderService.getFirstFolderIdContainingDocuments).toHaveBeenCalledWith(ControllersManager.mainController.currentProject().Id);
            })
        });

        describe("GIVEN a list where the loadIds was already called WHEN the loadNextPage is called and planNumbers are requested", function () {
            it("THEN, a call to the API is make to retrieve the number of plans per loaded page", function () {
                genericList.loadNextPage();
                expect(Api.getEntityList).toHaveBeenCalledWith("Folder", null, pathToLoad, null, ["11111111-1111-1111-1111-111111111111", "360cb6d-ca54-4b93-a564-a469274eb68a", "35a2c5d6-0e00-43e9-ada8-ce4f3fadb16e", "bf70c80f-3b76-4bf8-bef4-86c7b1d4aa60"], apiOpt);
                defLoadData.resolve({ data: [dataFolders[0], dataFolders[1], dataFolders[2], dataFolders[3]] });
                $rootScope.$apply();
                defPlansNum.resolve({ data: [planNumbers[0], planNumbers[1], planNumbers[2]] });
                $rootScope.$apply();

                defLoadData = $q.defer();
                defPlansNum = $q.defer();
                genericList.loadNextPage();
                expect(Api.getEntityList).toHaveBeenCalledWith("Folder", null, pathToLoad, null, ["bf70c80f-3b76-8jf8-bef4-8kreb1d4aa60", "66c475bb-1e23-4b76-820e-42654ee74c6b", "aac674a5-4ab2-4d5d-8895-67bf466aca9d", "22222222-2222-2222-2222-222222222222"], apiOpt);
                defLoadData.resolve({ data: [dataFolders[4], dataFolders[5], dataFolders[6], dataFolders[7]] });
                $rootScope.$apply();
                defPlansNum.resolve({ data: [planNumbers[3], planNumbers[4], planNumbers[5]] });
                $rootScope.$apply();

                defLoadData = $q.defer();
                defPlansNum = $q.defer();
                genericList.loadNextPage();
                expect(Api.getEntityList).toHaveBeenCalledWith("Folder", null, pathToLoad, null, ["f435896d-c6d3-433e-8eb9-36df90e6c444", "33333333-3333-3333-3333-333333333333", "4cd68f92-df2d-46ac-9f6a-9c96c09bee0d"], apiOpt);
                defLoadData.resolve({ data: [dataFolders[8], dataFolders[9], dataFolders[10]] });
                $rootScope.$apply();
                defPlansNum.resolve({ data: [planNumbers[6], planNumbers[7]] });
                $rootScope.$apply();

                defLoadData = $q.defer();
                expect(genericList.isLoaded).toBeTruthy();
                genericList.loadNextPage();

                expect((<ap.viewmodels.folders.FolderItemViewModel>genericList.sourceItems[0]).planNumber).toEqual(0);
                expect((<ap.viewmodels.folders.FolderItemViewModel>genericList.sourceItems[0]).hasChildren).toBeTruthy();
                expect((<ap.viewmodels.folders.FolderItemViewModel>genericList.sourceItems[1]).planNumber).toBe(2);
                expect((<ap.viewmodels.folders.FolderItemViewModel>genericList.sourceItems[1]).hasChildren).toBeTruthy();
                expect((<ap.viewmodels.folders.FolderItemViewModel>genericList.sourceItems[2]).planNumber).toBe(19);
                expect((<ap.viewmodels.folders.FolderItemViewModel>genericList.sourceItems[2]).hasChildren).toBeTruthy();
                expect((<ap.viewmodels.folders.FolderItemViewModel>genericList.sourceItems[3]).planNumber).toBe(0);
                expect((<ap.viewmodels.folders.FolderItemViewModel>genericList.sourceItems[3]).hasChildren).toBeFalsy();
                expect((<ap.viewmodels.folders.FolderItemViewModel>genericList.sourceItems[4]).planNumber).toBe(5);
                expect((<ap.viewmodels.folders.FolderItemViewModel>genericList.sourceItems[4]).hasChildren).toBeTruthy();
                expect((<ap.viewmodels.folders.FolderItemViewModel>genericList.sourceItems[5]).planNumber).toBe(0);
                expect((<ap.viewmodels.folders.FolderItemViewModel>genericList.sourceItems[5]).hasChildren).toBeFalsy();
                expect((<ap.viewmodels.folders.FolderItemViewModel>genericList.sourceItems[6]).planNumber).toBe(4);
                expect((<ap.viewmodels.folders.FolderItemViewModel>genericList.sourceItems[6]).hasChildren).toBeFalsy();
                expect((<ap.viewmodels.folders.FolderItemViewModel>genericList.sourceItems[7]).planNumber).toEqual(0);
                expect((<ap.viewmodels.folders.FolderItemViewModel>genericList.sourceItems[7]).hasChildren).toBeTruthy();
                expect((<ap.viewmodels.folders.FolderItemViewModel>genericList.sourceItems[8]).planNumber).toBe(8);
                expect((<ap.viewmodels.folders.FolderItemViewModel>genericList.sourceItems[8]).hasChildren).toBeFalsy();
                expect((<ap.viewmodels.folders.FolderItemViewModel>genericList.sourceItems[9]).planNumber).toEqual(0);
                expect((<ap.viewmodels.folders.FolderItemViewModel>genericList.sourceItems[9]).hasChildren).toBeTruthy();
                expect((<ap.viewmodels.folders.FolderItemViewModel>genericList.sourceItems[10]).planNumber).toBe(12);
                expect((<ap.viewmodels.folders.FolderItemViewModel>genericList.sourceItems[10]).hasChildren).toBeFalsy();
            });
        });
    });

    describe("Feature: GetLength", () => {

        let genericList: ap.viewmodels.folders.FoldersPagedListViewModel, defLoadData, defSelectedFolder;
        let apiOpt = new ap.services.apiHelper.ApiOption();

        beforeEach(() => {
            let expandedFolderIds: string[] = [idsFolders[0].Id, idsFolders[1].Id, idsFolders[2].Id, idsFolders[3].Id];
            spyOn(Utility.Storage.Local, "get").and.returnValue(ControllersManager.mainController.currentProject().Id + ";" + expandedFolderIds.join(";"));
            Utility.UserContext.CurrentUser().Id = "b738269f-c8cb-4cdd-b85e-0cd9b5df7bd6";

            spyOn(Api, "getApiResponse").and.callFake(function (url, method) {
                if (url.indexOf("rest/projectfolderidsandlevels") === 0 && method === ap.services.apiHelper.MethodType.Get)
                    return _deferred.promise;
                return null;
            });

            defLoadData = $q.defer();

            spyOn(Api, "getEntityList").and.callFake(function () {
                return defLoadData.promise;
            });
            defSelectedFolder = $q.defer();
            spyOn(ServicesManager.folderService, "getFirstFolderIdContainingDocuments").and.returnValue(defSelectedFolder.promise);
            apiOpt.async = true;
            apiOpt.onlyPathToLoadData = false;

            genericList = new ap.viewmodels.folders.FoldersPagedListViewModel(Utility, Api, $q, $timeout, ServicesManager, ControllersManager, false, ap.viewmodels.folders.FolderItemViewModel, "Creator", null, null, false, 4);
            
            genericList.loadIds();
        });

        describe("When I request to have the length of the list AND the list is not yet completely loaded AND the loaded elements are expanded", () => {

            beforeEach(() => {
                _deferred.resolve(new ap.services.apiHelper.ApiResponse(idsFolders));
                defSelectedFolder.resolve(new ap.services.apiHelper.ApiResponse(idsFolders[0].Id));
                $rootScope.$apply();
                spyOn(genericList.sourceItems, "filter").and.callFake(() => {
                    return [dataFolders[0]];
                });
                genericList.loadNextPage();

                defLoadData.resolve({ data: [dataFolders[1], dataFolders[2], dataFolders[3]] });
                $rootScope.$apply();
                defLoadData = $q.defer();
            });

            it("THEN, getEntityList is called with the correct URL", () => {
                expect(Api.getEntityList).toHaveBeenCalledWith("Folder", null, "Creator", null, ["11111111-1111-1111-1111-111111111111", "360cb6d-ca54-4b93-a564-a469274eb68a", "35a2c5d6-0e00-43e9-ada8-ce4f3fadb16e", "bf70c80f-3b76-4bf8-bef4-86c7b1d4aa60"], apiOpt);
            });

            it("THEN, the method returns the lenghts of the not collapsed elements", () => {
                expect(genericList.getLength()).toEqual(11);
            });
        });

        describe("When I request to have the length of the list AND the list is completely loaded", () => {

            beforeEach(() => {
                _deferred.resolve(new ap.services.apiHelper.ApiResponse(idsFolders.slice(0, 4)));
                $rootScope.$apply();
                spyOn(genericList.sourceItems, "filter").and.callFake(() => {
                    return [dataFolders[0]];
                });
                genericList.loadNextPage();

                defLoadData.resolve({ data: [dataFolders[1], dataFolders[2], dataFolders[3]] });
                $rootScope.$apply();
                defLoadData = $q.defer();
            });

            it("THEN, the method returns the lenghts of the not collapsed elements", () => {
                expect(Api.getEntityList).toHaveBeenCalledWith("Folder", null, "Creator", null, ["11111111-1111-1111-1111-111111111111", "360cb6d-ca54-4b93-a564-a469274eb68a", "35a2c5d6-0e00-43e9-ada8-ce4f3fadb16e", "bf70c80f-3b76-4bf8-bef4-86c7b1d4aa60"], apiOpt);

                defLoadData.resolve({ data: [dataFolders[1], dataFolders[2], dataFolders[3]] });
                $rootScope.$apply();
                defLoadData = $q.defer();

                expect(genericList.getLength()).toEqual(4);
            });
        });
    });

    describe("Feature: GetItemAtIndex", () => {

        let genericList: ap.viewmodels.folders.FoldersPagedListViewModel, defLoadData, defSelectedFolder;
        let apiOpt = new ap.services.apiHelper.ApiOption();

        beforeEach(() => {
            Utility.UserContext.CurrentUser().Id = "b738269f-c8cb-4cdd-b85e-0cd9b5df7bd6";

            spyOn(Api, "getApiResponse").and.callFake(function (url, method) {
                if (url.indexOf("rest/projectfolderidsandlevels") === 0 && method === ap.services.apiHelper.MethodType.Get)
                    return _deferred.promise;
                return null;
            });

            defLoadData = $q.defer();
            spyOn(Api, "getEntityList").and.callFake(function () {
                return defLoadData.promise;
            });

            let expandedFolderIds: string[] = [idsFolders[0].Id, idsFolders[1].Id, idsFolders[2].Id, dataFolders[3].Id];
            spyOn(Utility.Storage.Local, "get").and.returnValue(ControllersManager.mainController.currentProject().Id + ";" + expandedFolderIds.join(";"));

            defSelectedFolder = $q.defer();
            spyOn(ServicesManager.folderService, "getFirstFolderIdContainingDocuments").and.returnValue(defSelectedFolder.promise);

            defSelectedFolder.resolve(new ap.services.apiHelper.ApiResponse(idsFolders[0].Id));

            genericList = new ap.viewmodels.folders.FoldersPagedListViewModel(Utility, Api, $q, $timeout, ServicesManager, ControllersManager, false, ap.viewmodels.folders.FolderItemViewModel, "Creator", null, null, false, 4);
           
            apiOpt.async = true;
            apiOpt.onlyPathToLoadData = false;

            genericList.loadIds();
            _deferred.resolve(new ap.services.apiHelper.ApiResponse(idsFolders.slice(0, 4)));
            $rootScope.$apply();
            spyOn(genericList.sourceItems, "filter").and.callFake(() => {
                return [dataFolders[0]];
            });
            genericList.loadNextPage();

            defLoadData.resolve({ data: [dataFolders[1], dataFolders[2], dataFolders[3]] });
            $rootScope.$apply();
            defLoadData = $q.defer();
        });

        describe("WHEN all the items of the list are expanded and I request to get the element at index 2", () => {
            it("THEN, then item at position 2 is returned", () => {
                let item: ap.viewmodels.folders.FolderItemViewModel = <ap.viewmodels.folders.FolderItemViewModel>genericList.getItemAtIndex(2);
                expect(item.name).toEqual("Plans");
            });
        });
    });

    describe("Feature: Request an not loaded item", () => {

        let genericList: ap.viewmodels.folders.FoldersPagedListViewModel, defLoadData;
        let apiOpt = new ap.services.apiHelper.ApiOption();
        let defLoadFirstFolderId: angular.IDeferred<any>;

        beforeEach(() => {
            Utility.UserContext.CurrentUser().Id = "b738269f-c8cb-4cdd-b85e-0cd9b5df7bd6";

            spyOn(Api, "getApiResponse").and.callFake(function (url, method) {
                if (url.indexOf("rest/projectfolderidsandlevels") === 0 && method === ap.services.apiHelper.MethodType.Get)
                    return _deferred.promise;
                return null;
            });

            defLoadData = $q.defer();
            spyOn(Api, "getEntityList").and.callFake(function () {
                return defLoadData.promise;
            });

            defLoadFirstFolderId = $q.defer();
            spyOn(ServicesManager.folderService, "getFirstFolderIdContainingDocuments").and.returnValue(defLoadFirstFolderId.promise);

            genericList = new ap.viewmodels.folders.FoldersPagedListViewModel(Utility, Api, $q, $timeout, ServicesManager, ControllersManager, false, ap.viewmodels.folders.FolderItemViewModel, "Creator", null, null, false, 4);
           
            apiOpt.async = true;
            apiOpt.onlyPathToLoadData = false;

            genericList.loadIds();

            _deferred.resolve(new ap.services.apiHelper.ApiResponse(idsFolders));
            $rootScope.$apply();
            spyOn(genericList.sourceItems, "filter").and.callFake(() => {
                return [dataFolders[0]];
            });
            genericList.loadNextPage();

            defLoadData.resolve({ data: [dataFolders[1], dataFolders[2], dataFolders[3]] });
            $rootScope.$apply();
            defLoadData = $q.defer();
        });

        describe("When I request a not yet loaded item of the list", () => {
            it("THEN, null is return and loadNextPaged is called", () => {
                let defLoadPage = $q.defer();
                spyOn(genericList, "loadPage").and.returnValue(defLoadPage.promise);
                let item = genericList.getItemAtIndex(7);
                expect(genericList.loadPage).toHaveBeenCalled();
            });
        });
    });

    describe("Feature: Save the expanded folders id to the local storage", () => {

        let genericList: ap.viewmodels.folders.FoldersPagedListViewModel;
        let defIds: angular.IDeferred<ap.services.apiHelper.ApiResponse>, defEntities: angular.IDeferred<ap.services.apiHelper.ApiResponse>;
        let defLoadFirstFolderId: angular.IDeferred<any>;
        let foldersCacheValue: any[];
        let cachedFoldersSpy: jasmine.Spy;
        beforeEach(() => {

            defLoadFirstFolderId = $q.defer();

            defIds = $q.defer();
            defEntities = $q.defer();
            spyOn(Api, "getApiResponse").and.callFake(function (url, method) {
                if (url.indexOf("rest/projectfolderidsandlevels") === 0 && method === ap.services.apiHelper.MethodType.Get)
                    return defIds.promise;
                return null;
            });
            spyOn(Api, "getEntityList").and.returnValue(defEntities.promise);

            spyOn(ServicesManager.folderService, "getFirstFolderIdContainingDocuments").and.returnValue(defLoadFirstFolderId.promise);

            genericList = new ap.viewmodels.folders.FoldersPagedListViewModel(Utility, Api, $q, $timeout, ServicesManager, ControllersManager, false, ap.viewmodels.folders.FolderItemViewModel, "Creator", null, null, false, 20);
            
            genericList.loadNextPage();

            // initialize the list
            defIds.resolve(new ap.services.apiHelper.ApiResponse(idsFolders));
            $rootScope.$apply();
            spyOn(genericList.sourceItems, "filter").and.callFake(() => {
                return [dataFolders[0]];
            });
            defEntities.resolve(new ap.services.apiHelper.ApiResponse([dataFolders[1], dataFolders[2], dataFolders[3], dataFolders[4], dataFolders[5], dataFolders[6], dataFolders[8], dataFolders[10]]));
            $rootScope.$apply();
            spyOn(ControllersManager.projectController, "saveFolderStructureStateToLocalStorage");
            let testCache: any[] = [];
            foldersCacheValue = [];
            cachedFoldersSpy = spyOn(ControllersManager.projectController, "getFolderStructureStateFromLocalStorage").and.returnValue(foldersCacheValue);
        });

        afterEach(() => {
            Utility.Storage.Local.set("documents.foldersstate", null);
        });

        describe("WHEN a folder is expanded", () => {
            it("THEN it's id saved in the local storage", () => {
                (<ap.viewmodels.folders.FolderItemViewModel>genericList.sourceItems[1]).isExpanded = true;
                expect(ControllersManager.projectController.saveFolderStructureStateToLocalStorage).toHaveBeenCalledWith(
                    [genericList.sourceItems[1].originalEntity.Id]);
            });
        });

        describe("WHEN a folder is collapsed", () => {

            beforeEach(() => {
                (<ap.viewmodels.folders.FolderItemViewModel>genericList.sourceItems[1]).setExpanded(true);
                foldersCacheValue.push(genericList.sourceItems[1].originalEntity.Id);
                (<ap.viewmodels.folders.FolderItemViewModel>genericList.sourceItems[1]).isExpanded = false;
            });

            it("THEN it's id is removed from the local storage", () => {
                expect(ControllersManager.projectController.saveFolderStructureStateToLocalStorage).toHaveBeenCalledWith([]);
            });
        });

        describe("WHEN several folders are expanded", () => {
            let storageSpy: jasmine.Spy;
            beforeEach(() => {
                (<ap.viewmodels.folders.FolderItemViewModel>genericList.sourceItems[1]).setExpanded(true);
                foldersCacheValue.push(genericList.sourceItems[1].originalEntity.Id);
                (<ap.viewmodels.folders.FolderItemViewModel>genericList.sourceItems[2]).isExpanded = true;
            });

            it("THEN, thery're stored in the localstorage in string joined by ';'", () => {
                expect(ControllersManager.projectController.saveFolderStructureStateToLocalStorage).toHaveBeenCalledWith([genericList.sourceItems[1].originalEntity.Id, genericList.sourceItems[2].originalEntity.Id]);
            });
        });
    });

    describe("Feature: restore the collapse/expand state of folders", () => {

        let folderItem: ap.viewmodels.folders.FolderItemViewModel;
        let genericList: ap.viewmodels.folders.FoldersPagedListViewModel;
        let defIds: angular.IDeferred<ap.services.apiHelper.ApiResponse>, defEntities: angular.IDeferred<ap.services.apiHelper.ApiResponse>;
        let defLoadFirstFolderId: angular.IDeferred<any>;

        beforeEach(() => {
            let folder: ap.models.projects.Folder = new ap.models.projects.Folder(Utility);
            folder.createByJson({ Id: "123", Name: "Plans" });
            folderItem = new ap.viewmodels.folders.FolderItemViewModel(Utility, $q, null, new ap.viewmodels.folders.FolderItemConstructorParameter(1, folder, new ap.viewmodels.PageDescription(), new ap.viewmodels.LoadPageSuccessHandlerParameter(null), Utility, ControllersManager, false));
            folderItem.init(folder);

            defIds = $q.defer();
            defLoadFirstFolderId = $q.defer();

            defEntities = $q.defer();
            spyOn(Api, "getApiResponse").and.callFake(function (url, method) {
                if (url.indexOf("rest/projectfolderidsandlevels") === 0 && method === ap.services.apiHelper.MethodType.Get)
                    return defIds.promise;
                return null;
            });
            spyOn(Api, "getEntityList").and.returnValue(defEntities.promise);

            spyOn(ServicesManager.folderService, "getFirstFolderIdContainingDocuments").and.returnValue(defLoadFirstFolderId.promise);

            genericList = new ap.viewmodels.folders.FoldersPagedListViewModel(Utility, Api, $q, $timeout, ServicesManager, ControllersManager, false, ap.viewmodels.folders.FolderItemViewModel, "Creator", null, null, false, 20);
            
            genericList.loadNextPage();

            spyOn(Utility.Storage.Local, "get");

            // initialize the list
            defIds.resolve(new ap.services.apiHelper.ApiResponse(idsFolders));
            $rootScope.$apply();
            spyOn(genericList.sourceItems, "filter").and.callFake(() => {
                return [dataFolders[0]];
            });
            defEntities.resolve(new ap.services.apiHelper.ApiResponse([dataFolders[1], dataFolders[2], dataFolders[3], dataFolders[4], dataFolders[5], dataFolders[6], dataFolders[8], dataFolders[10]]));
            $rootScope.$apply();
        });

        describe("WHEN a page is loaded", () => {
            it("THEN, Local.get('documents.foldersstate') is called to get the folders state", () => {
                expect(Utility.Storage.Local.get).toHaveBeenCalledWith("documents.foldersstate");
            });
        });
    });

    describe("Feature: select the first folder having documents", () => {

        let genericList: ap.viewmodels.folders.FoldersPagedListViewModel;
        let defIds: angular.IDeferred<ap.services.apiHelper.ApiResponse>, defEntities: angular.IDeferred<ap.services.apiHelper.ApiResponse>;
        let defLoadFirstFolderId: angular.IDeferred<any>;
        let defPlansNum: angular.IDeferred<any>;

        beforeEach(() => {

            defIds = $q.defer();
            defLoadFirstFolderId = $q.defer();

            defEntities = $q.defer();
            defPlansNum = $q.defer();
            spyOn(Api, "getApiResponse").and.callFake(function (url, method) {
                if (url.indexOf("rest/projectfolderidsandlevels") === 0 && method === ap.services.apiHelper.MethodType.Get)
                    return defIds.promise;
                else if (url.indexOf("rest/folderdocumentcount") === 0 && method === ap.services.apiHelper.MethodType.Get)
                    return defPlansNum.promise;
                return null;
            });
            spyOn(Api, "getEntityList").and.returnValue(defEntities.promise);

            spyOn(ServicesManager.folderService, "getFirstFolderIdContainingDocuments").and.returnValue(defLoadFirstFolderId.promise);

            genericList = new ap.viewmodels.folders.FoldersPagedListViewModel(Utility, Api, $q, $timeout, ServicesManager, ControllersManager, false, ap.viewmodels.folders.FolderItemViewModel, "Creator", null, null, false, 20);
           
            genericList.loadNextPage();

            // initialize the list
            defIds.resolve(new ap.services.apiHelper.ApiResponse(idsFolders));
            $rootScope.$apply();
            spyOn(genericList.sourceItems, "filter").and.callFake(() => {
                return [dataFolders[0]];
            });
        });

        describe("WHEN the first page is loaded AND all folder are collapsed", () => {
            beforeEach(() => {
                spyOn(ControllersManager.projectController, "getFolderStructureStateFromLocalStorage").and.returnValue([]);
                spyOn(ControllersManager.projectController, "getLastSelectedFolderId").and.returnValue(null);
            });
            it("THEN FolderService.getFirstFolderIdContainingDocuments is called", () => {
                defEntities.resolve(new ap.services.apiHelper.ApiResponse([dataFolders[1], dataFolders[2], dataFolders[3], dataFolders[4], dataFolders[5], dataFolders[6], dataFolders[8], dataFolders[10]]));
                $rootScope.$apply();

                expect(ServicesManager.folderService.getFirstFolderIdContainingDocuments).toHaveBeenCalledWith(ControllersManager.mainController.currentProject().Id);
            });

            it("THEN, the first folder which has documents is selected", () => {
                defEntities.resolve(new ap.services.apiHelper.ApiResponse([dataFolders[1], dataFolders[2], dataFolders[3], dataFolders[4], dataFolders[5], dataFolders[6], dataFolders[8], dataFolders[10]]));
                $rootScope.$apply();

                // resolve defplannums
                defLoadFirstFolderId.resolve(new ap.services.apiHelper.ApiResponse(idsFolders[2].Id));
                $rootScope.$apply();

                expect(genericList.selectedViewModel).not.toBeNull();
                expect(genericList.selectedViewModel.originalEntity.Id).toBe(idsFolders[2].Id);
            });
            it("THEN, the folder which has documents is expanded as well as its parents", () => {
                defEntities.resolve(new ap.services.apiHelper.ApiResponse([dataFolders[1], dataFolders[2], dataFolders[3], dataFolders[4], dataFolders[5], dataFolders[6], dataFolders[8], dataFolders[10]]));
                $rootScope.$apply();

                // resolve defplannums
                defLoadFirstFolderId.resolve(new ap.services.apiHelper.ApiResponse(idsFolders[2].Id));
                $rootScope.$apply();

                expect((<ap.viewmodels.folders.FolderItemViewModel>genericList.sourceItems[2]).isExpanded).toBeTruthy();
                expect((<ap.viewmodels.folders.FolderItemViewModel>genericList.sourceItems[1]).isExpanded).toBeTruthy();
                expect((<ap.viewmodels.folders.FolderItemViewModel>genericList.sourceItems[0]).isExpanded).toBeTruthy();
            });
        });
    });
    describe("Feature: save selected folder into session storage and use it when refresh", () => {
        let genericList: ap.viewmodels.folders.FoldersPagedListViewModel;
        let defEntities: angular.IDeferred<ap.services.apiHelper.ApiResponse>;
        let defPlansNum, defLoadFirstFolderId;
        let projectId: string;
        beforeEach(() => {
            defEntities = $q.defer();
            defPlansNum = $q.defer();
            defLoadFirstFolderId = $q.defer();
            projectId = "35a2c5d6-0e00-43e9-ada8-ce4d3fafb16e";
            spyOn(Api, "getApiResponse").and.callFake(function (url, method) {
                if (url.indexOf("rest/projectfolderidsandlevels") === 0 && method === ap.services.apiHelper.MethodType.Get)
                    return _deferred.promise;
                else if (url.indexOf("rest/folderdocumentcount") === 0 && method === ap.services.apiHelper.MethodType.Get)
                    return defPlansNum.promise;
                return null;
            });
            defPlansNum.resolve(new ap.services.apiHelper.ApiResponse(planNumbers));

            spyOn(Api, "getEntityIds").and.returnValue(_deferred.promise);
            spyOn(Api, "getEntityList").and.returnValue(defEntities.promise);

            spyOn(ServicesManager.folderService, "getFirstFolderIdContainingDocuments").and.returnValue(defLoadFirstFolderId.promise);

            genericList = new ap.viewmodels.folders.FoldersPagedListViewModel(Utility, Api, $q, $timeout, ServicesManager, ControllersManager, false, ap.viewmodels.folders.FolderItemViewModel, "Creator", null, null, true, 4);
            
            genericList.loadIds();
            _deferred.resolve(new ap.services.apiHelper.ApiResponse(idsFolders));
            $rootScope.$apply();
            defLoadFirstFolderId.resolve(new ap.services.apiHelper.ApiResponse(idsFolders[2].Id));
            $rootScope.$apply();
            spyOn(genericList.sourceItems, "filter").and.callFake(() => {
                return [dataFolders[0]];
            });
            genericList.loadNextPage();

            defEntities.resolve(new ap.services.apiHelper.ApiResponse([dataFolders[1], dataFolders[2], dataFolders[3], dataFolders[4], dataFolders[7], dataFolders[9]]));
            $rootScope.$apply();
        });
        afterEach(() => {
            genericList.dispose();
        });
        describe("WHEN a folder is selected", () => {
            beforeEach(() => {
                // select folder
                spyOn(ControllersManager.projectController, "saveLastSelectedFolderIdToLocalStorage");
            });

            it("THEN, its id is saved in session storage", () => {
                // select folder
                genericList.selectedViewModel = genericList.sourceItems[0];
                $rootScope.$apply();

                //check session value
                expect(ControllersManager.projectController.saveLastSelectedFolderIdToLocalStorage).toHaveBeenCalledWith(genericList.sourceItems[0].originalEntity.Id);
            });
        });

        describe("WHEN the folder list is refreshed and there is a selected folder saved in the cache", () => {
            beforeEach(() => {
                spyOn(ControllersManager.projectController, "getLastSelectedFolderId").and.returnValue(dataFolders[1].Id);
            });
            it("THEN WHEN Refresh is called, GenericPageListViewModel loadIds method is called " +
                "AND getPageIndex is called with the saved selectedfolderid " +
                "AND loadPage is called" +
                "AND selectEntity is called with the saved selectedfolderid " +
                "AND topIndex value is set to the index of the selected folder", () => {
                    //refresh
                    spyOn(genericList, "loadIds").and.callThrough();
                    spyOn(genericList, "getPageIndex").and.callThrough();
                    spyOn(genericList, "loadPage").and.callThrough();
                    spyOn(genericList, "selectEntity").and.callThrough();
                    genericList.refresh();
                    
                    $rootScope.$apply();

                    //check calls and values
                    expect(genericList.loadIds).toHaveBeenCalled();
                    expect(genericList.getPageIndex).toHaveBeenCalledWith(dataFolders[1].Id);
                    expect(genericList.loadPage).toHaveBeenCalled();
                    expect(genericList.selectEntity).toHaveBeenCalledWith(dataFolders[1].Id);
                });
        });
    });

    describe("Feature: updateFoldersPlansNumber", () => {

        let defCount: ng.IDeferred<any>;
        let genericList: ap.viewmodels.folders.FoldersPagedListViewModel;
        let options: ap.services.apiHelper.ApiOption;

        beforeEach(() => {

            genericList = new ap.viewmodels.folders.FoldersPagedListViewModel(Utility, Api, $q, $timeout, ServicesManager, ControllersManager, false, ap.viewmodels.folders.FolderItemViewModel, "Creator", null, null, true, 4);
            
            defCount = $q.defer();
            spyOn(Api, "getApiResponse").and.callFake((url, method) => {
                if (url.indexOf("rest/folderdocumentcount") === 0 && method === ap.services.apiHelper.MethodType.Get)
                    return defCount.promise;
                return null;
            });

            spyOn(genericList, "getLoadedItemsIds").and.returnValue(["1", "2", "3"]);

            options = new ap.services.apiHelper.ApiOption();
            options.async = true;
            options.customParams.push(new ap.services.apiHelper.ApiCustomParam("ids", "1,2,3"));
        });

        describe("WHEN a value is set to currentDocumentsFilter and it is NOT loaded", () => {
            beforeEach(() => {
                genericList.currentDocumentsFilter = "Filter.Eq(IsArchived, True)";
                options.customParams.push(new ap.services.apiHelper.ApiCustomParam("documentsearch", "Filter.Eq(IsArchived, True)"));
            });
            it("THEN api.getApiResponse is NOT called with 'rest/folderdocumentcount'", () => {
                expect(Api.getApiResponse).not.toHaveBeenCalled();
            });
        });

        describe("WHEN a value is set to currentDocumentsFilter and it is loaded", () => {
            beforeEach(() => {
                genericList.clear();
                genericList.currentDocumentsFilter = "Filter.Eq(IsArchived, True)";
                options.customParams.push(new ap.services.apiHelper.ApiCustomParam("documentsearch", "Filter.Eq(IsArchived, True)"));
            });
            it("THEN api.getApiResponse is called with 'rest/folderdocumentcount', 'Get', null, null, options", () => {
                expect(Api.getApiResponse).toHaveBeenCalledWith("rest/folderdocumentcount", ap.services.apiHelper.MethodType.Get, null, null, options);
            });
        });

        describe("WHEN currentDocumentsFilter is set to NULl", () => {
            beforeEach(() => {
                genericList.clear();
                genericList.currentDocumentsFilter = null;
            });
            it("THEN api.getApiResponse is called with 'rest/folderdocumentcount', 'Get', null, null, options", () => {
                expect(Api.getApiResponse).toHaveBeenCalledWith("rest/folderdocumentcount", ap.services.apiHelper.MethodType.Get, null, null, options);
            });
        });
    });

    describe("Feature: updateCurrentFolderPlansCount", () => {
        let defCount: ng.IDeferred<any>;
        let genericList: ap.viewmodels.folders.FoldersPagedListViewModel;
        let options: ap.services.apiHelper.ApiOption;

        beforeEach(() => {

            genericList = new ap.viewmodels.folders.FoldersPagedListViewModel(Utility, Api, $q, $timeout, ServicesManager, ControllersManager, false, ap.viewmodels.folders.FolderItemViewModel, "Creator", null, null, true, 4);
            spyOn(genericList.sourceItems, "filter").and.callFake(() => {
                return [dataFolders[0]];
            });
            defCount = $q.defer();
            spyOn(Api, "getApiResponse").and.callFake((url, method) => {
                if (url.indexOf("rest/folderdocumentcount") === 0 && method === ap.services.apiHelper.MethodType.Get)
                    return defCount.promise;
                return null;
            });

            spyOn(genericList, "getLoadedItemsIds").and.returnValue(["1", "2", "3"]);

            options = new ap.services.apiHelper.ApiOption();
            options.async = true;
            options.customParams.push(new ap.services.apiHelper.ApiCustomParam("ids", "1,2,3"));

            let folderItemVm = new ap.viewmodels.folders.FolderItemViewModel(Utility, $q);
            specHelper.general.spyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get).and.returnValue(folderItemVm);
        });

        afterEach(() => {
            specHelper.general.offSpyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get);
        });

        describe("WHEN updateCurrentFolderPlansCount is called with 12", () => {
            it("THEN the planNumber of the selectedViewModel is updated", () => {
                genericList.updateCurrentFolderPlansCount(12);

                expect((<ap.viewmodels.folders.FolderItemViewModel>genericList.selectedViewModel).planNumber).toBe(12);
            });
        });
    });
});