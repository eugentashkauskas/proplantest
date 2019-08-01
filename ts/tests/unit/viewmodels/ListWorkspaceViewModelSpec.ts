describe("Module ap-viewmodels - ListWorkspaceViewModel", () => {
    let vm: ap.viewmodels.ListWorkspaceViewModel;
    let Utility: ap.utility.UtilityHelper,
        ControllersManager: ap.controllers.ControllersManager,
        MainController: ap.controllers.MainController,
        Api: ap.services.apiHelper.Api;

    let $q: angular.IQService,
        $timeout: angular.ITimeoutService,
        $rootScope: angular.IRootScopeService;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });
    beforeEach(inject(function (_$rootScope_, _$q_, _$timeout_, _$compile_, _UserContext_, _Utility_, _Api_, _MainController_, _UIStateController_, _$controller_, _ControllersManager_) {
        Utility = _Utility_;
        MainController = _MainController_;
        ControllersManager = _ControllersManager_;
        $q = _$q_;
        Api = _Api_;
        $timeout = _$timeout_;
        $rootScope = _$rootScope_;
    }));

    class TestListWorkspaceVm extends ap.viewmodels.ListWorkspaceViewModel {
        protected createCustomParams() {
            this._listVm.addCustomParam("myparam", "special");
        }
        protected getSearchedTextProperties(): string[] {
            return this._propsSearchedText;
        }

        protected buildCustomFilter(): angular.IPromise<string> {
            let deferred: ng.IDeferred<string> = this.$q.defer();
            deferred.resolve(this.customFilter);
            return deferred.promise;
        }

        constructor(propsSearchText: string[], pathToLoad?: string, sortOrder?: string, pageSize: number = 50) {
            super(Utility, ControllersManager, $q, new ap.viewmodels.GenericPagedListOptions("Country", null, pathToLoad, sortOrder, pageSize));
            this._propsSearchedText = propsSearchText;
        }

        public customFilter: string;
        private _propsSearchedText: string[];
    }

    class AutomaticLoadListWorkspaceVm extends ap.viewmodels.ListWorkspaceViewModel {
        constructor(pathToLoad?: string, sortOrder?: string) {
            super(Utility, ControllersManager, $q, new ap.viewmodels.GenericPagedListOptions("Country", null, pathToLoad, sortOrder));
            this._automaticLoad = false;
        }
    }

    describe("Feature: constructor", () => {

        describe("WHEN the viewmodel is created", () => {
            it("THEN, the listVm is build on the entity name defined while the creation of listVm in the child class", () => {
                vm = new TestListWorkspaceVm([], "Language", "Name");
                expect(vm.listVm.options.entityName).toBe("Country");
                expect(vm.listVm.options.pathToLoad).toBe("Language");
                expect(vm.listVm.options.sortOrder).toBe("Name");
            });
        });
    });
    describe("Feature: load", () => {
        let deferIds, deferData, apiParams: any[], apiIds: any[];
        beforeEach(() => {
            deferIds = $q.defer();
            deferData = $q.defer();
            vm = new TestListWorkspaceVm(["Code", "Iso"]);
            apiParams = [
                new ap.services.apiHelper.ApiCustomParam("myparam", "special")
            ];
            apiIds = ["455620", "445541", "445125"];
            spyOn(vm.listVm, "loadIds").and.callThrough();
            spyOn(Api, "getEntityIds").and.returnValue(deferIds.promise);
            spyOn(vm.listVm, "loadPage").and.callThrough();
            spyOn(Api, "getEntityList").and.returnValue(deferData.promise);
            spyOn($timeout, "cancel").and.callThrough();
        });
        describe("WHEN load is called and there is a custom param and there is no searchedText defined ", () => {
            it("THEN loadIds of the listVm is called with no filter", () => {
                vm.load();
                $rootScope.$apply();
                expect(vm.listVm.loadIds).toHaveBeenCalledWith(undefined, undefined);
            });
            it("AND customparams contains the one defined in the child class", () => {
                vm.load();

                expect(vm.listVm.customParams).toEqual(apiParams);
            });
            it("and when ids are loaded THEN, listVm.loadPage is called to load the first page", () => {
                vm.load();
                deferIds.resolve(new ap.services.apiHelper.ApiResponse(apiIds));
                $rootScope.$apply();

                expect(vm.listVm.loadPage).toHaveBeenCalledWith(0);
            });
            it("and return promise resolved with correct lenght", () => {
                vm = new TestListWorkspaceVm(["Code", "Iso"]);
                let pagedCollection: ap.viewmodels.GenericPagedListViewModels = null;

                let defLoadPage = $q.defer();
                spyOn(vm.listVm, "loadPage").and.returnValue(defLoadPage.promise);

                let promise = vm.load();
                promise = $q.when(promise);

                promise.then((collection) => {
                    pagedCollection = collection;
                });

                deferIds.resolve(new ap.services.apiHelper.ApiResponse(apiIds));
                defLoadPage.resolve();
                $rootScope.$apply();

                expect(pagedCollection.getLength()).toEqual(3);

            });
        });
        describe("WHEN load is called and there is a current project and there is a searchedText", () => {
            beforeEach(() => {
                vm.searchedText = "EL";
            });
            it("THEN loadIds is called with the correct filter on searchedText", () => {
                vm.load();
                $rootScope.$apply();
                let filter = "Filter.Or(Filter.StartsWith(Code,\"EL\"),Filter.StartsWith(Iso,\"EL\"))";
                expect(vm.listVm.loadIds).toHaveBeenCalledWith(filter, undefined);
            });
            it("AND customparams contains the one defined in the child class AND Filter on searched text", () => {

                vm.load();
                expect(vm.listVm.customParams).toEqual(apiParams);
            });
        });
        describe("WHEN there is a custom filter and a searched text defined", () => {
            it("THEN, the filter used is the concatenation of both filters", () => {
                vm.searchedText = "EL";
                (<TestListWorkspaceVm>vm).customFilter = "Filter.Eq(Year,2012)";
                vm.load();
                $rootScope.$apply();
                let filter = "Filter.Or(Filter.StartsWith(Code,\"EL\"),Filter.StartsWith(Iso,\"EL\"))";
                expect(vm.listVm.loadIds).toHaveBeenCalledWith("Filter.And(" + filter + "," + (<TestListWorkspaceVm>vm).customFilter + ")", undefined);
            });
        });
        describe("WHEN there is a custom filter and a searched text is not defined", () => {
            it("THEN, the build filter is only the custom one", () => {
                vm.searchedText = "";
                (<TestListWorkspaceVm>vm).customFilter = "Filter.Eq(Year,2012)";
                vm.load();
                $rootScope.$apply();
                let filter = "Filter.Or(Filter.StartsWith(Code,\"EL\"),Filter.StartsWith(Iso,\"EL\"))";
                expect(vm.listVm.loadIds).toHaveBeenCalledWith((<TestListWorkspaceVm>vm).customFilter, undefined);
            });
        });
    });
    describe("Feature: load with idToSelectParam", () => {
        let deferIds, deferData, defLoadPage, idToSelect: string, apiParams: any[], apiIds: any[];
        beforeEach(() => {
            deferIds = $q.defer();
            deferData = $q.defer();
            defLoadPage = $q.defer();

            vm = new TestListWorkspaceVm(["Code", "Iso"]);
            apiParams = [
                new ap.services.apiHelper.ApiCustomParam("myparam", "special")
            ];
            apiIds = ["455620", "445541", "445125"];
            spyOn(vm.listVm, "loadIds").and.callThrough();
            spyOn(Api, "getEntityIds").and.returnValue(deferIds.promise);
            spyOn(vm.listVm, "loadPage").and.returnValue(defLoadPage.promise);
            spyOn(Api, "getEntityList").and.returnValue(deferData.promise);
            spyOn($timeout, "cancel").and.callThrough();
            spyOn(vm.listVm, "selectEntity").and.callThrough();
        });

        describe("WHEN load is called and there is an idToselect defined and when ids are loaded", () => {

            beforeEach(() => {
                spyOn(vm.listVm, "getPageIndex").and.returnValue(0);

                idToSelect = "1";
                vm.load(idToSelect);
                deferIds.resolve(new ap.services.apiHelper.ApiResponse(apiIds));
                defLoadPage.resolve();
                $rootScope.$apply();
            });

            it("THEN, listVm.getPageIndex is called to get the page Index of the item to select", () => {
                expect(vm.listVm.getPageIndex).toHaveBeenCalledWith(idToSelect);
            });

            it("THEN loadPage is called with the result of getPageIndex", () => {
                    expect(vm.listVm.loadPage).toHaveBeenCalledWith(0);
            });
            it("THEN selectEntity is called with idToselect", () => {
                    expect(vm.listVm.selectEntity).toHaveBeenCalledWith(idToSelect);
            });
            it("THEN scrollToItem is called with idToselect", () => {
                    expect(vm.topIndex).toBe(vm.listVm.getItemIndex(idToSelect));
            });
        });
    })
    describe("Feature: searchedText changed", () => {
        let deferIds, apiParams: any[], apiIds: any[];
        beforeEach(() => {
            deferIds = $q.defer();
            vm = new TestListWorkspaceVm(["Code", "Iso"]);
            apiParams = [
                new ap.services.apiHelper.ApiCustomParam("myparam", "special")
            ];
            apiIds = ["455620", "445541", "445125"];
            spyOn(vm.listVm, "loadIds").and.returnValue(deferIds.promise);
            spyOn(vm.listVm, "loadPage");
            spyOn($timeout, "cancel").and.callThrough();
        });
        describe("WHEN the searchedText changed", () => {
            beforeEach(() => {
                vm.searchedText = "EL";
            });
            it("THEN, the searchedText equals the new value", () => {
                expect(vm.searchedText).toBe("EL");
            });
        });

        describe("WHEN the searchtext changed and automaticLoad = false", () => {
            let loadVm: AutomaticLoadListWorkspaceVm;
            beforeEach(() => {
                deferIds = $q.defer();
                loadVm = new AutomaticLoadListWorkspaceVm();

                spyOn(loadVm.listVm, "loadIds").and.returnValue(deferIds.promise);
                spyOn(loadVm.listVm, "loadPage");
            });

            it("THEN loadIds is not called", () => {
                loadVm.searchedText = "test";
                
                $rootScope.$apply();

                expect(loadVm.listVm.loadIds).not.toHaveBeenCalled();
            });
        });
    });
    describe("Feature: isEnabled", () => {
        beforeEach(() => {
            vm = new TestListWorkspaceVm([]);
        });
        describe("WHEN isEnabled is set to false", () => {
            it("THEN, the isEnabled becomes false", () => {
                vm.isEnabled = false;
                expect(vm.isEnabled).toBeFalsy();
            });
        });
        describe("WHEN isEnabled is set to true", () => {
            beforeEach(() => {
                vm.isEnabled = false;
            });
            it("THEN, the isEnabled becomes true", () => {
                vm.isEnabled = true;
                expect(vm.isEnabled).toBeTruthy();
            });
        });
    });

    describe("Feature: item chekedChanged", () => {
        let deferIds, deferData, apiParams: any[], apiIds: any[];
        beforeEach(() => {
            deferIds = $q.defer();
            deferData = $q.defer();
            vm = new ap.viewmodels.ListWorkspaceViewModel(Utility, ControllersManager, $q, new ap.viewmodels.GenericPagedListOptions("Country", ap.viewmodels.EntityItemViewModel, null, null));
            apiParams = [
                new ap.services.apiHelper.ApiCustomParam("myparam", "special")
            ];
            apiIds = ["123", "456"];
            spyOn(Api, "getEntityIds").and.returnValue(deferIds.promise);
            spyOn(Api, "getEntityList").and.returnValue(deferData.promise);
        });

        describe("WHEN list is load and one item checked", () => {
            it("THEN checkedchange of the listVm event raised", () => {
                let spyEvent = jasmine.createSpy("isCheckedChanged");
                vm.listVm.on("isCheckedChanged", spyEvent, this);
                vm.load();
                deferIds.resolve(new ap.services.apiHelper.ApiResponse(apiIds));

                let result = [
                    {
                        Id: "123",
                        code: "VN",
                        description: "VNE",
                    },
                    {
                        Id: "456",
                        code: "BE",
                        description: "BE",
                    }
                ];

                deferData.resolve(new ap.services.apiHelper.ApiResponse(result));

                $rootScope.$apply();

                vm.listVm.sourceItems[0].isChecked = true;
                expect(spyEvent).toHaveBeenCalledWith(vm.listVm.sourceItems[0]);
                expect(spyEvent.calls.count()).toEqual(1);
            });
        });
    });

    describe("Feature : selectItem", () => {
        let deferIds, deferData, defLoadPage, idToSelect: string, apiParams: any[], apiIds: any[];
        beforeEach(() => {
            deferIds = $q.defer();
            deferData = $q.defer();
            defLoadPage = $q.defer();

            vm = new TestListWorkspaceVm(["Code", "Iso"], null, null, 1);
            apiParams = [
                new ap.services.apiHelper.ApiCustomParam("myparam", "special")
            ];
            apiIds = ["1", "2", "3"];
            spyOn(vm.listVm, "loadIds").and.callThrough();
            spyOn(Api, "getEntityIds").and.returnValue(deferIds.promise);
            spyOn(Api, "getEntityList").and.returnValue(deferData.promise);
            spyOn($timeout, "cancel").and.callThrough();
            // spyOn(vm, "scrollToItem").and.callThrough();
        });

        describe("WHEN selectItem method was call with the id and loadData = false and the ids was not loaded", () => {
            it("THEN, the promise will be reject", () => {
                spyOn(vm.listVm, "loadPage").and.callThrough();

                let callback = jasmine.createSpy("callback");
                vm.selectItem(apiIds[0], false).then(() => {
                    callback();
                });
                expect(callback).not.toHaveBeenCalled();
            });

        });
        describe("WHEN selectItem method was call with the id and loadData = true and the ids was loaded and the page of the item was loaded", () => {
            beforeEach(() => {
                spyOn(vm.listVm, "selectEntity").and.callThrough();
                spyOn(vm.listVm, "loadPage").and.callThrough();

                deferIds.resolve(new ap.services.apiHelper.ApiResponse(apiIds));

                let result = [
                    {
                        Id: "1",
                        code: "VN",
                        description: "VNE",
                    }
                ];

                deferData.resolve(new ap.services.apiHelper.ApiResponse(result));

                vm.load();

                $rootScope.$apply();

            });
            it("THEN, the listVm.selectEntity method was called with the given id", () => {
                vm.selectItem(apiIds[0]);
                $rootScope.$apply();

                expect(vm.listVm.selectEntity).toHaveBeenCalledWith(apiIds[0]);
            });
            it("AND, the return the promise of the selectedViewModel", () => {
                let callback = jasmine.createSpy("callback");
                vm.selectItem(apiIds[0], false).then((selectedItem: ap.viewmodels.EntityViewModel) => {
                    callback();
                    expect(selectedItem).toBeDefined();
                    expect(selectedItem).not.toBeNull();
                    expect(selectedItem.originalEntity.Id).toEqual(apiIds[0]);
                });
                $rootScope.$apply();
                expect(callback).toHaveBeenCalled();
            });

        });

        describe("WHEN selectItem method was call with the id and loadData = true and the ids was not loaded", () => {
            beforeEach(() => {
                spyOn(vm.listVm, "selectEntity").and.callThrough();
                spyOn(vm.listVm, "loadPage").and.callThrough();

                deferIds.resolve(new ap.services.apiHelper.ApiResponse(apiIds));
                let result = [
                    {
                        Id: "1",
                        code: "VN",
                        description: "VNE",
                    }
                ];
                deferData.resolve(new ap.services.apiHelper.ApiResponse(result));

            });

            it("THEN, the vm.listVm.loadIds was called", () => {
                vm.selectItem(apiIds[0]);
                $rootScope.$apply();
                expect(vm.listVm.loadIds).toHaveBeenCalled();
            });
            it("AND THEN, the loadPage method will be called", () => {
                vm.selectItem(apiIds[0]);
                $rootScope.$apply();
                expect(vm.listVm.loadPage).toHaveBeenCalled();

            });
            it("AND the listVm.selectEntity method was called with the given id", () => {
                vm.selectItem(apiIds[0]);
                $rootScope.$apply();

                expect(vm.listVm.selectEntity).toHaveBeenCalledWith(apiIds[0]);
            });
            it("AND return the promise of the selectedViewModel", () => {
                let callback = jasmine.createSpy("callback");
                vm.selectItem(apiIds[0]).then((selectedItem: ap.viewmodels.EntityViewModel) => {
                    callback();
                    expect(selectedItem).toBeDefined();
                    expect(selectedItem).not.toBeNull();
                    expect(selectedItem.originalEntity.Id).toEqual(apiIds[0]);
                });
                $rootScope.$apply();
                expect(callback).toHaveBeenCalled();
            });

        });
        describe("WHEN selectItem method was call with the id and loadData = true and the ids was loaded and the page of the item was not loaded", () => {
            beforeEach(() => {
                let defer = $q.defer();
                spyOn(vm.listVm, "loadPage").and.returnValue(defer.promise);

                spyOn(vm.listVm, "selectEntity").and.returnValue(deferData.promise);
                deferIds.resolve(new ap.services.apiHelper.ApiResponse(apiIds));
                let result = [
                    {
                        Id: "1",
                        code: "VN",
                        description: "VNE",
                    }
                ];
                deferData.resolve(new ap.services.apiHelper.ApiResponse(result));
                vm.load();
                $rootScope.$apply();

                result = [
                    {
                        Id: "2",
                        code: "EN",
                        description: "ENG",
                    }
                ];

                defer.resolve(new ap.services.apiHelper.ApiResponse(result));

                vm.selectItem(apiIds[1]);

                $rootScope.$apply();
            });
            it("THEN, the loadpage will be call with correct pageindex and then select the id ", () => {
                expect((<jasmine.Spy>vm.listVm.loadPage).calls.count()).toEqual(2);
                expect((<jasmine.Spy>vm.listVm.loadPage).calls.argsFor(0)[0]).toEqual(0);
                expect((<jasmine.Spy>vm.listVm.loadPage).calls.argsFor(1)[0]).toEqual(1);
                expect(vm.listVm.selectEntity).toHaveBeenCalledWith(apiIds[1]);
            });
        });
    });
});
