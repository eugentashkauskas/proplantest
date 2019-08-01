describe("Module ap-viewmodel GenericListViewModel - GenericPagedListViewModel", function () {
    let _apiIdentification = 'apiIdentification-Id';
    let Utility: ap.utility.UtilityHelper;
    let ListController: ap.controllers.ListController;
    let Api: ap.services.apiHelper.Api;
    let _deferred: angular.IDeferred<ap.services.apiHelper.ApiResponse>;
    let $q, $rootScope;
    let apiOpt: ap.services.apiHelper.ApiOption;
    let ControllersManager: ap.controllers.ControllersManager;
    let ServicesManager: ap.services.ServicesManager;

    class CustomItemParameter extends ap.viewmodels.ItemConstructorParameter { }

    class CustomItemParameterBuilder implements ap.viewmodels.ItemParameterBuilder {
        createItemParameter(itemIndex: number, dataSource: any, pageDesc: ap.viewmodels.PageDescription, parameters: ap.viewmodels.LoadPageSuccessHandlerParameter, utility: ap.utility.UtilityHelper): ap.viewmodels.ItemConstructorParameter {
            return new CustomItemParameter(itemIndex, dataSource, pageDesc, parameters, utility);
        }
    }

    class CustomItem extends ap.viewmodels.EntityViewModel {
        constructor(utility: ap.utility.UtilityHelper, q: angular.IQService, parentListVm?: ap.viewmodels.BaseListEntityViewModel, public parameters?: ap.viewmodels.ItemConstructorParameter) {
            super(utility, parentListVm);
        }
    }

    class GenericPagedListVM extends ap.viewmodels.GenericPagedListViewModels {
        afterLoadPageSuccessHandler(arrayItem: ap.viewmodels.IEntityViewModel[]) {
            let idDic: IDictionary<string, string[]> = new Dictionary<string, string[]>();
            let idDic2: IDictionary<string, string[]> = new Dictionary<string, string[]>();
            this._valuesIdsDictionary.push(idDic);
            this._valuesIdsDictionary.push(idDic2);
            for (let i = 0; i < arrayItem.length; i++) {
                this.initDuplicatedData(arrayItem[i]);
            }
            for (let i = 0; i < arrayItem.length; i++) {
                this.checkForDuplicatedItems(arrayItem[i]);
            }
        }
        getCurrentEntityViewModelValuesToCheck(entityVm: ap.viewmodels.IEntityViewModel): KeyValue<string, string>[] {
            if (entityVm === null) {
                return [];
            }
            let chapterVm = <ap.viewmodels.projects.ChapterViewModel>entityVm;
            return [new KeyValue("Description", chapterVm.description), new KeyValue("Code", chapterVm.code)];
        }
        checkForDuplicatedItems(itemVm: ap.viewmodels.IEntityViewModel, arrayItem: ap.viewmodels.IEntityViewModel[] = []) {
            super.checkForDuplicatedItems(itemVm, arrayItem);
        }
        clearDuplicatedData() {
            super.clearDuplicatedData();
        }
        constructor(private utility: ap.utility.UtilityHelper, protected $q: angular.IQService, private _controllersManager: ap.controllers.ControllersManager) {
            super(utility, _controllersManager.listController, $q, new ap.viewmodels.GenericPagedListOptions("Chapter", ap.viewmodels.projects.ChapterViewModel, null, "DisplayOrder", 1, false, false, null, false, null, 2));
        }
    }

    beforeEach(function () {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
        angular.mock.module("ap-controllers");
    });

    beforeEach(inject(function (_Utility_, _$q_, _$rootScope_, _Api_, _ControllersManager_, _ServicesManager_, _ListController_) {
        Utility = _Utility_;
        $q = _$q_;
        $rootScope = _$rootScope_;
        apiOpt = new ap.services.apiHelper.ApiOption();
        ControllersManager = _ControllersManager_;
        ServicesManager = _ServicesManager_;
        ListController = _ListController_;
        specHelper.utility.stubRootUrl(Utility);
        specHelper.userContext.stub(Utility);
        _deferred = $q.defer();
        Api = _Api_;
        Api.init(_apiIdentification);
    }));

    afterEach(() => {
        ListController.reset();
    });

    describe("Feature: Management of GenericListViewModel", function () {
        describe("WHEN I create a GenericListViewModel with GenericListViewModel('ContactDetails', null, 'User', 'Id', 'Filter.Eq('ProjectId', 1000)', true)", function () {
            it("THEN a GenericListViewModel is created with the given values", function () {
                let genericList = new ap.viewmodels.GenericListViewModel(Utility, Api, $q, "ContactDetails", null, "User", "Id", "Filter.Eq('ProjectId', 1000)", true);

                expect(genericList.displayLoading).toBeTruthy();
            });
        });

        describe("Feature load", function () {
            let genericList,
                myfilter = "Filter.Eq('UserId', 2141)",
                callback = jasmine.createSpy("callback"),
                callbackEvent = jasmine.createSpy("callbackEvent"),
                fullfilter = "Filter.And(Filter.Eq('ProjectId', 1000),Filter.Eq('UserId', 2141))";
            beforeEach(function () {
                myfilter = "Filter.Eq('UserId', 2141)";
                callback = jasmine.createSpy("callback");
                callbackEvent = jasmine.createSpy("callbackEvent");
                fullfilter = "Filter.And(Filter.Eq('ProjectId', 1000),Filter.Eq('UserId', 2141))";
                spyOn(Api, "getEntityList").and.returnValue(_deferred.promise);
                apiOpt.async = false;
            });
            describe("WHEN load is called With a filter as parameter AND a default filter is defined AND PathToLoad is defined AND SortOrder is defined AND Option is defined", function () {
                it("THEN Api.getEntityList is called with the given filter parameter + default filter and the predefined options", function () {
                    genericList = new ap.viewmodels.GenericListViewModel(Utility, Api, $q, "ContactDetails", null, "User", "Id", "Filter.Eq('ProjectId', 1000)", true);

                    genericList.load(myfilter);
                    expect(Api.getEntityList).toHaveBeenCalledWith("ContactDetails", fullfilter, "User", "Id", null, apiOpt);
                });
            });
            describe("WHEN load is called on list with default filter but without filter specified in the load method", function () {
                it("THEN Api.getEntitList is called with the default filter and the predefined options", function () {
                    genericList = new ap.viewmodels.GenericListViewModel(Utility, Api, $q, "ContactDetails", null, "User", "Id", "Filter.Eq('ProjectId', 1000)", true);
                    genericList.load();
                    expect(Api.getEntityList).toHaveBeenCalledWith("ContactDetails", "Filter.Eq('ProjectId', 1000)", "User", "Id", null, apiOpt);
                });
            });
            describe("WHEN load is called on list with NO default filter but with filter specified in the load method", function () {
                it("THEN Api.getEntitList is called with the specified filter only and the predefined options", function () {
                    genericList = new ap.viewmodels.GenericListViewModel(Utility, Api, $q, "ContactDetails", null, "User", "Id", null, true);
                    genericList.load(myfilter);
                    expect(Api.getEntityList).toHaveBeenCalledWith("ContactDetails", myfilter, "User", "Id", null, apiOpt);
                });
            });
            describe("WHEN load is called on list with NO default filter but no filter specified in the load method", function () {
                it("THEN Api.getEntitList is called with the no filter only and the predefined options", function () {
                    genericList = new ap.viewmodels.GenericListViewModel(Utility, Api, $q, "ContactDetails", null, "User", "Id", null, true);
                    genericList.load();
                    expect(Api.getEntityList).toHaveBeenCalledWith("ContactDetails", undefined, "User", "Id", null, apiOpt);
                });
            });
            describe("GIVEN a genericListVm created with a itemVmHandler WHEN load is called AND success with data", function () {
                it("THEN an array is created for each data of the api with new itemVmHandler receiving like parameter the item of api's data, index and listViewModel", function () {
                    class itemHandler extends ap.viewmodels.EntityViewModel {
                        public myData: any;
                        copySource() {
                            super.copySource();
                            this.myData = this.originalEntity;
                        }

                        constructor(Utility: ap.utility.UtilityHelper, parentList?: ap.viewmodels.BaseListEntityViewModel, index?: number) {
                            super(Utility, parentList, index);
                        }
                    }

                    let data = [{ Id: 4 }, { Id: 6 }];

                    genericList = new ap.viewmodels.GenericListViewModel(Utility, Api, $q, "ContactDetails", itemHandler, "User", "Id", null, true);
                    genericList.load();

                    _deferred.resolve(new ap.services.apiHelper.ApiResponse(data));
                    $rootScope.$apply();

                    expect(genericList.sourceItems.length).toBe(2);

                    expect(genericList.sourceItems[0] instanceof itemHandler).toBeTruthy();
                    expect(genericList.sourceItems[1] instanceof itemHandler).toBeTruthy();
                    expect(genericList.sourceItems[0].myData).toBe(data[0]);
                    expect(genericList.sourceItems[1].myData).toBe(data[1]);

                    expect(genericList.sourceItems[0].index).toBe(0);
                    expect(genericList.sourceItems[1].index).toBe(1);

                    expect(genericList.sourceItems[0].parentList).toBe(genericList);
                    expect(genericList.sourceItems[1].parentList).toBe(genericList);
                });
            });
            describe("GIVEN a genericListVm created with NO itemVmHandler WHEN load is called AND success with data", function () {
                it("THEN an array of EntityViewModel is created for each data of the api", function () {

                    let data = [{ Id: 4 }, { Id: 6 }];

                    genericList = new ap.viewmodels.GenericListViewModel(Utility, Api, $q, "ContactDetails", null, "User", "Id", null, true);
                    genericList.load();

                    _deferred.resolve(new ap.services.apiHelper.ApiResponse(data));
                    $rootScope.$apply();

                    expect(genericList.sourceItems.length).toBe(2);

                    expect(genericList.sourceItems[0] instanceof ap.viewmodels.EntityViewModel).toBeTruthy();
                    expect(genericList.sourceItems[1] instanceof ap.viewmodels.EntityViewModel).toBeTruthy();
                    expect(genericList.sourceItems[0].originalEntity).toBe(data[0]);
                    expect(genericList.sourceItems[1].originalEntity).toBe(data[1]);
                });
            });
        });
        describe("Feature: IsLoading", function () {
            describe("WHEN load is called", function () {
                let genericList;
                beforeEach(function () {
                    genericList = new ap.viewmodels.GenericListViewModel(Utility, Api, $q, "ContactDetails");
                    spyOn(Api, "getEntityList").and.returnValue(_deferred.promise);
                    genericList.load();
                });
                it("THEN isLoading = true until the load is success", function () {
                    expect(genericList.isLoading).toBeTruthy();
                    _deferred.resolve(new ap.services.apiHelper.ApiResponse([]));
                    $rootScope.$apply();

                    expect(genericList.isLoading).toBeFalsy();
                });
                it("THEN isLoading = true until the load is failed", function () {
                    expect(genericList.isLoading).toBeTruthy();
                    _deferred.reject({
                        error: "error occured"
                    });
                    $rootScope.$apply();

                    expect(genericList.isLoading).toBeFalsy();
                });
            });
        });
    });

    describe("Feature: Management of GenericPagedListViewModel", function () {

        function createChapterViewModel(json: any): ap.viewmodels.projects.ChapterViewModel {
            let chapter = new ap.models.projects.Chapter(Utility);
            chapter.createByJson({ Id: json.Id, Description: json.Description, Code: json.Code });

            let chapterVm = new ap.viewmodels.projects.ChapterViewModel(Utility);
            chapterVm.init(chapter);

            return chapterVm;
        }

        describe("WHEN I create a GenericPagedListViewModel with GenericPagedListViewModel('ContactDetails', null, 'User', 'Id', 'Filter.Eq('ProjectId', 1000)', 50, true)", function () {
            it("THEN a GenericPagedListViewModel is created with the given values", function () {
                let genericList = new ap.viewmodels.GenericPagedListViewModels(Utility, ListController, $q, new ap.viewmodels.GenericPagedListOptions("ContactDetails", null, "User", "Id", 50, true), "Filter.Eq('ProjectId', 1000)");
                expect(genericList.options.pageSize).toBe(50);
                expect(genericList.filter).toBeNull();
            });
        });

        describe("WHEN loadIds is called", function () {
            it("THEN Api.getEntityIds is called with the given filter parameter and the predefined options AND contains a description for each page depending of the pageSize", function () {

                let genericList = new ap.viewmodels.GenericPagedListViewModels(Utility, ListController, $q, new ap.viewmodels.GenericPagedListOptions("ContactDetails", null, "User", "Id", 2, true), "Filter.Eq('ProjectId', 1000)");
                let fullfilter = "Filter.And(Filter.Eq('ProjectId', 1000),Filter.Eq('UserId', 2141))";
                apiOpt.async = false;
                spyOn(Api, "getEntityIds").and.returnValue(_deferred.promise);

                genericList.loadIds("Filter.Eq('UserId', 2141)");

                expect(Api.getEntityIds).toHaveBeenCalledWith("ContactDetails", fullfilter, "Id", apiOpt, false);

                _deferred.resolve(new ap.services.apiHelper.ApiResponse(["5", "6", "8", "9", "3"]));
                $rootScope.$apply();

                expect(genericList.nbPages).toBe(3);
                expect(genericList.getPage(0).idsList).toEqual(["5", "6"]);
                expect(genericList.getPage(1).idsList).toEqual(["8", "9"]);
                expect(genericList.getPage(2).idsList).toEqual(["3"]);

                expect(genericList.getPage(0).isLoaded).toBeFalsy();
                expect(genericList.getPage(1).isLoaded).toBeFalsy();
                expect(genericList.getPage(2).isLoaded).toBeFalsy();
            });
        });

        describe("WHEN loadIds is called and the customEntityIds is not null", function () {
            it("THEN Api.getEntityIds is called with the customEntityIds name and the given filter parameter and the predefined options AND contains a description for each page depending of the pageSize", function () {
                let options = new ap.viewmodels.GenericPagedListOptions("Note", null, "User", "Id", 2, true, false, "UserComment", false);
                let genericList = new ap.viewmodels.GenericPagedListViewModels(Utility, ListController, $q, options, "Filter.Eq('ProjectId', 1000)");
                let fullfilter = "Filter.Eq('ProjectId', 1000)";
                apiOpt.async = false;
                spyOn(Api, "getEntityIds").and.returnValue(_deferred.promise);

                genericList.loadIds();

                expect(Api.getEntityIds).toHaveBeenCalledWith("UserComment", fullfilter, "Id", apiOpt, false);

                _deferred.resolve(new ap.services.apiHelper.ApiResponse(["5", "6", "8", "9", "3"]));
                $rootScope.$apply();

                expect(genericList.nbPages).toBe(3);
                expect(genericList.getPage(0).idsList).toEqual(["5", "6"]);
                expect(genericList.getPage(1).idsList).toEqual(["8", "9"]);
                expect(genericList.getPage(2).idsList).toEqual(["3"]);

                expect(genericList.getPage(0).isLoaded).toBeFalsy();
                expect(genericList.getPage(1).isLoaded).toBeFalsy();
                expect(genericList.getPage(2).isLoaded).toBeFalsy();
            });
        });

        describe("WHEN loadIds is called and the customEntityIds is not null AND the requestMethodType is defined", function () {
            it("THEN Api.getEntityIds is called with the customEntityIds name and the requestMethodType AND the given filter parameter and the predefined options AND contains a description for each page depending of the pageSize", function () {
                let options = new ap.viewmodels.GenericPagedListOptions("Note", null, "User", "Id", 2, true, false, "UserComment", true, undefined, undefined, undefined, undefined, ap.services.apiHelper.MethodType.Post);
                let genericList = new ap.viewmodels.GenericPagedListViewModels(Utility, ListController, $q, options, "Filter.Eq('ProjectId', 1000)");
                let fullfilter = "Filter.Eq('ProjectId', 1000)";
                apiOpt.async = false;
                spyOn(Api, "getApiResponse").and.returnValue(_deferred.promise);

                genericList.loadIds();

                expect(Api.getApiResponse).toHaveBeenCalledWith("rest/UserComment", ap.services.apiHelper.MethodType.Post, null, null, apiOpt);

                _deferred.resolve(new ap.services.apiHelper.ApiResponse(["5", "6", "8", "9", "3"]));
                $rootScope.$apply();

                expect(genericList.nbPages).toBe(3);
                expect(genericList.getPage(0).idsList).toEqual(["5", "6"]);
                expect(genericList.getPage(1).idsList).toEqual(["8", "9"]);
                expect(genericList.getPage(2).idsList).toEqual(["3"]);

                expect(genericList.getPage(0).isLoaded).toBeFalsy();
                expect(genericList.getPage(1).isLoaded).toBeFalsy();
                expect(genericList.getPage(2).isLoaded).toBeFalsy();
            });
        });

        describe("WHEN addCustomParams is called", () => {
            it("THEN, the customParams list is filleds with the given object", () => {

                let options = new ap.viewmodels.GenericPagedListOptions("Note", null, "User", "Id", 2, true, false, "UserComment", true);
                let genericList = new ap.viewmodels.GenericPagedListViewModels(Utility, ListController, $q, options, "Filter.Eq('ProjectId', 1000)");

                expect(genericList.customParams).toBe(null);

                genericList.addCustomParam("groupby", "Date");

                expect(genericList.customParams.length).toBe(1);
                expect(genericList.customParams[0].name).toBe("groupby");
                expect(genericList.customParams[0].value).toBe("Date");
            });
        });

        describe("WHEN removeCustomParam is called with a name already added", () => {
            it("THEN, the custom param with the same name is removed", () => {
                let options = new ap.viewmodels.GenericPagedListOptions("Note", null, "User", "Id", 2, true, false, "UserComment", true);
                let genericList = new ap.viewmodels.GenericPagedListViewModels(Utility, ListController, $q, options, "Filter.Eq('ProjectId', 1000)");
                expect(genericList.customParams).toBe(null);

                genericList.addCustomParam("groupby", "Date");
                genericList.addCustomParam("orderby", "Date");
                genericList.addCustomParam("searchfilter", "Date");

                expect(genericList.customParams.length).toBe(3);
                genericList.removeCustomParam("orderby");
                expect(genericList.customParams.length).toBe(2);
                expect(genericList.customParams[0].name).toEqual("groupby");
                expect(genericList.customParams[1].name).toEqual("searchfilter");
            });
        });

        describe("WHEN customParams exists in the list AND loadIds is called", () => {
            it("THEN, loadIds is called with the customParams array in the options", () => {

                let options = new ap.viewmodels.GenericPagedListOptions("Note", null, "User", "Id", 2, true, false, "UserComment", false);
                let genericList = new ap.viewmodels.GenericPagedListViewModels(Utility, ListController, $q, options, "Filter.Eq('ProjectId', 1000)");
                let fullfilter = "Filter.Eq('ProjectId', 1000)";
                apiOpt.async = false;


                genericList.addCustomParam("groupby", "Date");
                genericList.addCustomParam("orderby", "Date");
                apiOpt.customParams = genericList.customParams;
                spyOn(Api, "getEntityIds").and.returnValue(_deferred.promise);

                genericList.loadIds();

                expect(Api.getEntityIds).toHaveBeenCalledWith("UserComment", fullfilter, "Id", apiOpt, false);
            });
        });

        describe("Feature: loadNextPage", function () {
            describe("GIVEN a list where the loadIds was not yet called WHEN loadNextPage is called", function () {
                it("THEN, loadIds is called first AND when success, the Api.getEntityList with the filter on ids of first page", function () {

                    let options = new ap.viewmodels.GenericPagedListOptions("ContactDetails", null, "User", "Id", 2, true);
                    let genericList = new ap.viewmodels.GenericPagedListViewModels(Utility, ListController, $q, options, "Filter.Eq('ProjectId', 1000)");
                    let defLoadData = $q.defer();
                    apiOpt.async = false;
                    apiOpt.onlyPathToLoadData = false;

                    spyOn(Api, "getEntityIds").and.returnValue(_deferred.promise);
                    spyOn(genericList, "loadIds").and.callThrough();

                    spyOn(Api, "getEntityList").and.returnValue(defLoadData.promise);
                    genericList.loadNextPage();
                    expect(genericList.loadIds).toHaveBeenCalled();

                    _deferred.resolve(new ap.services.apiHelper.ApiResponse(["5", "6", "8", "9", "3"]));
                    $rootScope.$apply();

                    expect(Api.getEntityList).toHaveBeenCalledWith("ContactDetails", null, "User", null, ["5", "6"], apiOpt);
                });
            });
            describe("GIVEN a list where the loadIds was already called WHEN the loadNextPage is called", function () {
                let genericList,
                    ids,
                    defLoadData;
                it("THEN, the Api.getEntityList is called on each pages (sequential) for each calls AND when all pages loaded, isLoaded = true", function () {
                    ids = ["6", "8", "10", "12", "13"];
                    defLoadData = $q.defer();

                    let options = new ap.viewmodels.GenericPagedListOptions("ContactDetails", null, null, "Id", 2);
                    genericList = new ap.viewmodels.GenericPagedListViewModels(Utility, ListController, $q, options, "Filter.Eq('ProjectId',1000)");
                    spyOn(Api, "getEntityIds").and.returnValue(_deferred.promise);
                    spyOn(genericList, "loadIds").and.callThrough();
                    apiOpt.async = true;
                    apiOpt.onlyPathToLoadData = false;

                    genericList.loadIds();

                    _deferred.resolve(new ap.services.apiHelper.ApiResponse(ids));
                    $rootScope.$apply();

                    spyOn(Api, "getEntityList").and.callFake(function () {
                        return defLoadData.promise;
                    });
                    genericList.loadNextPage();
                    expect(Api.getEntityList).toHaveBeenCalledWith("ContactDetails", null, null, null, ["6", "8"], apiOpt);

                    defLoadData.resolve({ data: [{ Id: "6" }, { Id: "8" }] });
                    $rootScope.$apply();
                    defLoadData = $q.defer();

                    genericList.loadNextPage();
                    expect(Api.getEntityList).toHaveBeenCalledWith("ContactDetails", null, null, null, ["10", "12"], apiOpt);

                    defLoadData.resolve({ data: [{ Id: "10" }, { Id: "12" }] });
                    $rootScope.$apply();

                    defLoadData = $q.defer();

                    genericList.loadNextPage();
                    expect(Api.getEntityList).toHaveBeenCalledWith("ContactDetails", null, null, null, ["13"], apiOpt);
                    defLoadData.resolve({ data: [{ Id: "13" }] });
                    $rootScope.$apply();

                    defLoadData = $q.defer();

                    expect(genericList.isLoaded).toBeTruthy();
                    genericList.loadNextPage();
                });
            });
        });

        describe("Feature: checkForDuplicatedItems", () => {
            let chapterVm1: ap.viewmodels.projects.ChapterViewModel;
            let chapterVm2: ap.viewmodels.projects.ChapterViewModel;
            let chapterVm3: ap.viewmodels.projects.ChapterViewModel;
            let genericList: GenericPagedListVM;

            beforeEach(() => {
                chapterVm1 = createChapterViewModel({ Id: "1", Description: "NameOne", Code: "CodeOne" });
                chapterVm2 = createChapterViewModel({ Id: "2", Description: "NameTwo", Code: "CodeTwo" });
                chapterVm3 = createChapterViewModel({ Id: "3", Description: "NameThree", Code: "CodeThree" });

                genericList = new GenericPagedListVM(Utility, $q, ControllersManager);
                spyOn(genericList, "getEntityById").and.callFake((id: string) => {
                    if (id === "1") {
                        return chapterVm1;
                    } else if (id === "2") {
                        return chapterVm2;
                    } else if (id === "3") {
                        return chapterVm3;
                    }
                });
            });

            describe("WHEN there are no duplicated values", () => {
                beforeEach(() => {
                    genericList.sourceItems = [chapterVm1, chapterVm2, chapterVm3];
                    genericList.afterLoadPageSuccessHandler([chapterVm1, chapterVm2, chapterVm3]);
                });
                it("THEN isDuplicated = false", () => {
                    expect(genericList.isDuplicated).toBeFalsy();
                });
                it("THEN the chapterVm1 is not duplicated", () => {
                    expect(chapterVm1.isDuplicated).toBeFalsy();
                });
                it("THEN the chapterVm2 is not duplicated", () => {
                    expect(chapterVm2.isDuplicated).toBeFalsy();
                });
                it("THEN the chapterVm3 is not duplicated", () => {
                    expect(chapterVm3.isDuplicated).toBeFalsy();
                });
            });

            describe("WHEN there is one pair of duplicated items", () => {
                describe("AND the first property is duplicated", () => {
                    beforeEach(() => {
                        chapterVm2.description = "NameOne";
                        genericList.sourceItems = [chapterVm1, chapterVm2, chapterVm3];
                        genericList.afterLoadPageSuccessHandler([chapterVm1, chapterVm2, chapterVm3]);
                    });
                    it("THEN isDuplicated = true", () => {
                        expect(genericList.isDuplicated).toBeTruthy();
                    });
                    it("THEN the chapterVm1 is duplicated", () => {
                        expect(chapterVm1.isDuplicated).toBeTruthy();
                    });
                    it("THEN the chapterVm2 is duplicated", () => {
                        expect(chapterVm2.isDuplicated).toBeTruthy();
                    });
                    it("THEN the chapterVm3 is not duplicated", () => {
                        expect(chapterVm3.isDuplicated).toBeFalsy();
                    });
                });

                describe("AND the second property is duplicated", () => {
                    beforeEach(() => {
                        chapterVm2.code = "CodeOne";
                        genericList.sourceItems = [chapterVm1, chapterVm2, chapterVm3];
                        genericList.afterLoadPageSuccessHandler([chapterVm1, chapterVm2, chapterVm3]);
                    });
                    it("THEN isDuplicated = true", () => {
                        expect(genericList.isDuplicated).toBeTruthy();
                    });
                    it("THEN the chapterVm1 is duplicated", () => {
                        expect(chapterVm1.isDuplicated).toBeTruthy();
                    });
                    it("THEN the chapterVm2 is duplicated", () => {
                        expect(chapterVm2.isDuplicated).toBeTruthy();
                    });
                    it("THEN the chapterVm3 is not duplicated", () => {
                        expect(chapterVm3.isDuplicated).toBeFalsy();
                    });
                });

                describe("AND duplicated property is fixed", () => {
                    beforeEach(() => {
                        chapterVm2.description = "NameOne";
                        genericList.sourceItems = [chapterVm1, chapterVm2, chapterVm3];
                        genericList.afterLoadPageSuccessHandler([chapterVm1, chapterVm2, chapterVm3]);
                        chapterVm2.description = "NameTwo";
                        genericList.checkForDuplicatedItems(chapterVm2);
                    });
                    it("THEN isDuplicated = false", () => {
                        expect(genericList.isDuplicated).toBeFalsy();
                    });
                    it("THEN the chapterVm1 is not duplicated", () => {
                        expect(chapterVm1.isDuplicated).toBeFalsy();
                    });
                    it("THEN the chapterVm2 is not duplicated", () => {
                        expect(chapterVm2.isDuplicated).toBeFalsy();
                    });
                    it("THEN the chapterVm3 is not duplicated", () => {
                        expect(chapterVm3.isDuplicated).toBeFalsy();
                    });
                });
            });

            describe("WHEN two items have several duplicated properties AND one of the properties is fixed", () => {
                beforeEach(() => {
                    chapterVm2.description = "NameOne";
                    chapterVm2.code = "CodeOne";
                    genericList.sourceItems = [chapterVm1, chapterVm2, chapterVm3];
                    genericList.afterLoadPageSuccessHandler([chapterVm1, chapterVm2, chapterVm3]);
                    chapterVm2.description = "NameTwo";
                    genericList.checkForDuplicatedItems(chapterVm2);
                });
                it("THEN isDuplicated = true", () => {
                    expect(genericList.isDuplicated).toBeTruthy();
                });
                it("THEN the chapterVm1 is duplicated", () => {
                    expect(chapterVm1.isDuplicated).toBeTruthy();
                });
                it("THEN the chapterVm2 is duplicated", () => {
                    expect(chapterVm2.isDuplicated).toBeTruthy();
                });
                it("THEN the chapterVm3 is not duplicated", () => {
                    expect(chapterVm3.isDuplicated).toBeFalsy();
                });
            });

            describe("WHEN more than two items have the same duplicated property", () => {
                beforeEach(() => {
                    chapterVm2.description = "NameOne";
                    chapterVm3.description = "NameOne";
                    genericList.sourceItems = [chapterVm1, chapterVm2, chapterVm3];
                    genericList.afterLoadPageSuccessHandler([chapterVm1, chapterVm2, chapterVm3]);
                });

                it("THEN isDuplicated = true", () => {
                    expect(genericList.isDuplicated).toBeTruthy();
                });
                it("THEN the chapterVm1 is duplicated", () => {
                    expect(chapterVm1.isDuplicated).toBeTruthy();
                });
                it("THEN the chapterVm2 is duplicated", () => {
                    expect(chapterVm2.isDuplicated).toBeTruthy();
                });
                it("THEN the chapterVm3 is duplicated", () => {
                    expect(chapterVm3.isDuplicated).toBeTruthy();
                });

                describe("AND one of the items is fixed", () => {
                    beforeEach(() => {
                        chapterVm2.description = "NameTwo";
                        genericList.checkForDuplicatedItems(chapterVm2);
                    });

                    it("THEN isDuplicated = true", () => {
                        expect(genericList.isDuplicated).toBeTruthy();
                    });
                    it("THEN the chapterVm1 is duplicated", () => {
                        expect(chapterVm1.isDuplicated).toBeTruthy();
                    });
                    it("THEN the chapterVm2 is not duplicated", () => {
                        expect(chapterVm2.isDuplicated).toBeFalsy();
                    });
                    it("THEN the chapterVm3 is duplicated", () => {
                        expect(chapterVm3.isDuplicated).toBeTruthy();
                    });
                });
            });

            describe("WHEN an item has different duplicated properties with different items AND one of those items is fixed", () => {
                beforeEach(() => {
                    chapterVm2.description = "NameOne";
                    chapterVm2.code = "CodeThree";
                    genericList.sourceItems = [chapterVm1, chapterVm2, chapterVm3];
                    genericList.afterLoadPageSuccessHandler([chapterVm1, chapterVm2, chapterVm3]);
                    chapterVm1.description = "OtherName";
                    genericList.checkForDuplicatedItems(chapterVm1);
                });
                it("THEN isDuplicated = true", () => {
                    expect(genericList.isDuplicated).toBeTruthy();
                });
                it("THEN the chapterVm1 is not duplicated", () => {
                    expect(chapterVm1.isDuplicated).toBeFalsy();
                });
                it("THEN the chapterVm2 is duplicated", () => {
                    expect(chapterVm2.isDuplicated).toBeTruthy();
                });
                it("THEN the chapterVm3 is duplicated", () => {
                    expect(chapterVm3.isDuplicated).toBeTruthy();
                });
            });

            describe("WHEN an item becomes a duplicate", () => {
                beforeEach(() => {
                    genericList.sourceItems = [chapterVm1, chapterVm2, chapterVm3];
                    genericList.afterLoadPageSuccessHandler([chapterVm1, chapterVm2, chapterVm3]);

                    chapterVm2.description = "NameOne";
                    genericList.checkForDuplicatedItems(chapterVm2);
                });
                it("THEN isDuplicated = true", () => {
                    expect(genericList.isDuplicated).toBeTruthy();
                });
                it("THEN the chapterVm1 is duplicated", () => {
                    expect(chapterVm1.isDuplicated).toBeTruthy();
                });
                it("THEN the chapterVm2 is duplicated", () => {
                    expect(chapterVm2.isDuplicated).toBeTruthy();
                });
                it("THEN the chapterVm3 is not duplicated", () => {
                    expect(chapterVm3.isDuplicated).toBeFalsy();
                });
            });
        });
        describe("Feature: getDuplicatedItems", () => {
            let chapterVm1: ap.viewmodels.projects.ChapterViewModel;
            let chapterVm2: ap.viewmodels.projects.ChapterViewModel;
            let chapterVm3: ap.viewmodels.projects.ChapterViewModel;
            let genericList: GenericPagedListVM;
            let duplicatedItems: ap.viewmodels.EntityViewModel[];
            beforeEach(() => {
                chapterVm1 = createChapterViewModel({ Id: "1", Description: "NameOne", Code: "CodeOne" });
                chapterVm2 = createChapterViewModel({ Id: "2", Description: "NameTwo", Code: "CodeTwo" });
                chapterVm3 = createChapterViewModel({ Id: "3", Description: "NameThree", Code: "CodeThree" });
                chapterVm1.isDuplicated = true;
                chapterVm2.isDuplicated = false;
                chapterVm3.isDuplicated = true;
                genericList = new GenericPagedListVM(Utility, $q, ControllersManager);
                genericList.sourceItems = [chapterVm1, chapterVm2, chapterVm3];
                duplicatedItems = <ap.viewmodels.EntityViewModel[]>genericList.getDuplicatedItems();
            });
            describe("WHEN getDuplicatedItems is call", () => {
                it("THEN it returns a table of duplicated elements", () => {
                    expect(duplicatedItems.length).toEqual(2);
                    expect(duplicatedItems[0]).toEqual(chapterVm1);
                    expect(duplicatedItems[1]).toEqual(chapterVm3);
                });
            });
        });

        describe("Feature: clearDuplicatedData", () => {
            let genericList: GenericPagedListVM;
            beforeEach(() => {
                genericList = new GenericPagedListVM(Utility, $q, ControllersManager);
                genericList.idValuesDictionary.add("test-id", [new KeyValue("Code", "test-code"), new KeyValue("Description", "test-description"),]);
                genericList.valuesIdsDictionary[0].add("test-code", ["test-id"]);
                genericList.valuesIdsDictionary[1].add("test-description", ["test-id"]);
            });
            describe("WHEN clearDuplicatedData is called", () => {
                beforeEach(() => {
                    genericList.clearDuplicatedData();
                });
                it("THEN duplicated data dictionaries are cleared", () => {
                    expect(genericList.idValuesDictionary.count).toEqual(0);
                    expect(genericList.valuesIdsDictionary[0].count).toEqual(0);
                    expect(genericList.valuesIdsDictionary[1].count).toEqual(0);
                });
            });
        });
        describe("Feature: loadPage", function () {
            describe("WHEN a specific page is requested but ids not loaded", () => {
                it("THEN the ids is loaded first", () => {
                    let filter = "Filter.Eq('ProjectId', 1000)";
                    let options = new ap.viewmodels.GenericPagedListOptions("ContactDetails", null, "User", "Id", 2, true);
                    let genericList = new ap.viewmodels.GenericPagedListViewModels(Utility, ListController, $q, options, filter);
                    let defLoadData = $q.defer();
                    apiOpt.async = false;

                    spyOn(Api, "getEntityIds").and.returnValue(_deferred.promise);
                    spyOn(Api, "getEntityList").and.callFake(function () {
                        return defLoadData.promise;
                    });

                    genericList.loadPage(2);

                    _deferred.resolve(new ap.services.apiHelper.ApiResponse(["5", "6", "8", "9", "3"]));
                    $rootScope.$apply();

                    expect(Api.getEntityIds).toHaveBeenCalledWith("ContactDetails", filter, "Id", apiOpt, false);
                });
            });

            describe("WHEN a specific page is requested", () => {
                it("THEN the api is called with correct ids", () => {
                    let filter = "Filter.Eq('ProjectId', 1000)";
                    let options = new ap.viewmodels.GenericPagedListOptions("ContactDetails", null, "User", "Id", 2, true);
                    let genericList = new ap.viewmodels.GenericPagedListViewModels(Utility, ListController, $q, options, filter);
                    let defLoadData = $q.defer();
                    apiOpt.async = false;
                    apiOpt.onlyPathToLoadData = false;

                    spyOn(Api, "getEntityIds").and.returnValue(_deferred.promise);

                    genericList.loadIds();

                    let ids = ["6", "8", "10", "12", "13"];
                    _deferred.resolve(new ap.services.apiHelper.ApiResponse(ids));
                    $rootScope.$apply();

                    spyOn(Api, "getEntityList").and.callFake(function () {
                        return defLoadData.promise;
                    });

                    genericList.loadPage(1);
                    defLoadData.resolve({ data: [{ Id: "6" }, { Id: "8" }] });
                    $rootScope.$apply();

                    expect(Api.getEntityList).toHaveBeenCalledWith("ContactDetails", null, "User", null, ["10", "12"], apiOpt);
                });
            });

            describe("WHEN a specific page is requested", () => {
                it("THEN 'itemcreated' event is rasie with correct item as agrument", () => {
                    let filter = "Filter.Eq('ProjectId', 1000)";
                    let options = new ap.viewmodels.GenericPagedListOptions("ContactDetails", null, "User", "Id", 1, true);
                    let genericList = new ap.viewmodels.GenericPagedListViewModels(Utility, ListController, $q, options, filter);

                    let itemCreatedHandler = jasmine.createSpy("itemCreatedHandler");
                    genericList.on("itemcreated", (item) => {
                        let entityItem = <ap.viewmodels.EntityItemViewModel>item;
                        expect(entityItem.originalEntity.Id).toEqual("12345");
                        itemCreatedHandler();
                    }, this);

                    let defLoadData = $q.defer();
                    apiOpt.async = false;
                    apiOpt.onlyPathToLoadData = false;

                    spyOn(Api, "getEntityIds").and.returnValue(_deferred.promise);

                    genericList.loadIds();

                    let ids = ["12345"];
                    _deferred.resolve(new ap.services.apiHelper.ApiResponse(ids));
                    $rootScope.$apply();

                    spyOn(Api, "getEntityList").and.callFake(function () {
                        return defLoadData.promise;
                    });

                    genericList.loadPage(0);
                    defLoadData.resolve({ data: [{ Id: "12345" }] });
                    $rootScope.$apply();

                    expect(itemCreatedHandler).toHaveBeenCalled();
                    expect(itemCreatedHandler.calls.count()).toEqual(1);
                });
            });

            describe("WHEN a specific page is requested but not in the range", () => {
                it("THEN error is thrown", () => {
                    let filter = "Filter.Eq('ProjectId', 1000)";
                    let options = new ap.viewmodels.GenericPagedListOptions("ContactDetails", null, "User", "Id", 2, true);
                    let genericList = new ap.viewmodels.GenericPagedListViewModels(Utility, ListController, $q, options, filter);
                    let defLoadData = $q.defer();
                    apiOpt.async = false;
                    apiOpt.onlyPathToLoadData = false;

                    spyOn(Api, "getEntityIds").and.returnValue(_deferred.promise);

                    genericList.loadIds();

                    let ids = ["6", "8", "10", "12", "13"];
                    _deferred.resolve(new ap.services.apiHelper.ApiResponse(ids));
                    $rootScope.$apply();

                    expect(() => { genericList.loadPage(4) }).toThrowError("The index is out of range");
                });
            });

            describe("WHEN a specific page is requested AND options defined a specific builder for item parameter", () => {
                let defLoadData;
                let genericList: ap.viewmodels.GenericPagedListViewModels;
                beforeEach(() => {
                    defLoadData = $q.defer();
                    spyOn(Api, "getEntityIds").and.returnValue(_deferred.promise);

                    let options = new ap.viewmodels.GenericPagedListOptions("ContactDetails", CustomItem, "User", "Id", 2, true, undefined, undefined, undefined, new CustomItemParameterBuilder());
                    genericList = new ap.viewmodels.GenericPagedListViewModels(Utility, ListController, $q, options);

                    genericList.loadIds();

                    let ids = ["12345"];
                    _deferred.resolve(new ap.services.apiHelper.ApiResponse(ids));
                    $rootScope.$apply();

                    spyOn(Api, "getEntityList").and.callFake(function () {
                        return defLoadData.promise;
                    });
                    genericList.loadPage(0);
                    defLoadData.resolve({ data: [{ Id: "12345" }] });
                    $rootScope.$apply();
                });
                it("THEN, the item are created with CustomItemBuilder", () => {
                    let item: CustomItem = <CustomItem>genericList.sourceItems[0];
                    expect(item.parameters instanceof CustomItemParameter).toBeTruthy();
                });

            });
        });

        describe("Feature useCacheSystem", () => {
            describe("WHEN useCacheSystem = false and a specific page is requested at second time", () => {
                let genericList: ap.viewmodels.GenericPagedListViewModels;
                beforeEach(() => {
                    let options = new ap.viewmodels.GenericPagedListOptions("IssueType", ap.viewmodels.projects.IssueTypeViewModel, null, "DisplayOrder", 2, false);
                    genericList = new ap.viewmodels.GenericPagedListViewModels(Utility, ListController, $q, options);

                    let defLoadData = $q.defer();
                    spyOn(Api, "getEntityIds").and.returnValue(_deferred.promise);

                    genericList.loadIds();

                    let ids = ["6", "8", "10", "12", "13"];
                    _deferred.resolve(new ap.services.apiHelper.ApiResponse(ids));
                    $rootScope.$apply();

                    spyOn(Api, "getEntityList").and.callFake(function () {
                        return defLoadData.promise;
                    });

                    genericList.loadPage(1);
                    defLoadData.resolve({ data: [{ Id: "10" }, { Id: "12" }] });

                    $rootScope.$apply();

                });
                it("THEN the api.getEntityIds is called 2 times", () => {
                    genericList.loadPage(1);
                    expect((<jasmine.Spy>Api.getEntityList).calls.count()).toBe(2);
                });
            });
            describe("WHEN useCacheSystem = true and a specific page is requested at seconde time", () => {
                let genericList: ap.viewmodels.GenericPagedListViewModels;
                beforeEach(() => {
                    let options = new ap.viewmodels.GenericPagedListOptions("IssueType", ap.viewmodels.projects.IssueTypeViewModel, null, "DisplayOrder", 2, false);
                    genericList = new ap.viewmodels.GenericPagedListViewModels(Utility, ListController, $q, options);
                    genericList.useCacheSystem = true;

                    let defLoadData = $q.defer();

                    spyOn(Api, "getEntityIds").and.returnValue(_deferred.promise);

                    genericList.loadIds();

                    let ids = ["6", "8", "10", "12", "13"];
                    _deferred.resolve(new ap.services.apiHelper.ApiResponse(ids));
                    $rootScope.$apply();

                    spyOn(Api, "getEntityList").and.callFake(function () {
                        return defLoadData.promise;
                    });

                    genericList.loadPage(1);
                    defLoadData.resolve({ data: [{ Id: "10", Code: "Code", Description: "Description" }, { Id: "12" }] });
                    $rootScope.$apply();
                });
                it("THEN, the getEntityList will not call", () => {
                    genericList.loadPage(1);
                    expect((<jasmine.Spy>Api.getEntityList).calls.count()).toBe(1);
                });
                it("WHEN i try to modify the item VM and then reload the page, the modification will be keep", () => {
                    let issueTypeVM: ap.viewmodels.projects.IssueTypeViewModel = <ap.viewmodels.projects.IssueTypeViewModel>genericList.sourceItems[2];
                    issueTypeVM.code = "New Code";
                    issueTypeVM.description = "New Description";

                    genericList.loadPage(1);

                    $rootScope.$apply();

                    let result: ap.viewmodels.projects.IssueTypeViewModel = <ap.viewmodels.projects.IssueTypeViewModel>genericList.sourceItems[2];
                    expect(result.code).toEqual("New Code");
                    expect(result.description).toEqual("New Description");
                });
                it("WHEN i set useCacheSystem = false and reload the page then the getEntityList will be called and the modification is lost ", () => {
                    let issueTypeVM: ap.viewmodels.projects.IssueTypeViewModel = <ap.viewmodels.projects.IssueTypeViewModel>genericList.sourceItems[2];
                    issueTypeVM.code = "New Code";
                    issueTypeVM.description = "New Description";

                    genericList.useCacheSystem = false;

                    genericList.loadPage(1);

                    $rootScope.$apply();

                    expect((<jasmine.Spy>Api.getEntityList).calls.count()).toBe(2);

                    let result: ap.viewmodels.projects.IssueTypeViewModel = <ap.viewmodels.projects.IssueTypeViewModel>genericList.sourceItems[2];
                    expect(result.code).toEqual("Code");
                    expect(result.description).toEqual("Description");
                });

            });
        });

        describe("Feature: addIntoCache", () => {
            let genericList: ap.viewmodels.GenericPagedListViewModels;
            let entityViewModel: ap.viewmodels.projects.IssueTypeViewModel;
            beforeEach(() => {
                let options = new ap.viewmodels.GenericPagedListOptions("IssueType", ap.viewmodels.projects.IssueTypeViewModel, null, "DisplayOrder", 2, false);
                genericList = new ap.viewmodels.GenericPagedListViewModels(Utility, ListController, $q, options);

                let entity = new ap.models.projects.IssueType(Utility);
                entity.createByJson({ Id: "test-id" });
                entityViewModel = new ap.viewmodels.projects.IssueTypeViewModel(Utility);
                entityViewModel.init(entity);
            });

            describe("WHEN useCacheSystem = false", () => {
                beforeEach(() => {
                    genericList.useCacheSystem = false;
                });

                it("THEN an exception is thrown", () => {
                    expect(() => {
                        genericList.addIntoCache(entityViewModel);
                    }).toThrowError("Caching is disabled for this list view model");
                });
            });

            describe("WHEN useCacheSystem = true", () => {
                beforeEach(() => {
                    genericList.useCacheSystem = true;
                    genericList.addIntoCache(entityViewModel);

                    spyOn(Api, "getEntityList").and.stub();
                    spyOn(Api, "getEntityIds").and.returnValue(_deferred.promise);

                    genericList.loadPage(0);
                    _deferred.resolve(new ap.services.apiHelper.ApiResponse(["test-id"]));
                    $rootScope.$apply();
                });

                it("THEN the given entity is added to the cache", () => {
                    expect(Api.getEntityList).not.toHaveBeenCalled();
                });
            });
        });

        describe("Feature: removeItem", () => {
            let genericList: ap.viewmodels.GenericPagedListViewModels;
            let originalEntity: ap.models.identFiles.Country;
            let item: ap.viewmodels.identificationfiles.country.CountryViewModel;
            let options: ap.viewmodels.GenericPagedListOptions;
            beforeEach(() => {
                options = new ap.viewmodels.GenericPagedListOptions("Country", null, "User", "Id", 2, true);
                originalEntity = new ap.models.identFiles.Country(Utility);
                item = new ap.viewmodels.identificationfiles.country.CountryViewModel(Utility, originalEntity);
                genericList = new ap.viewmodels.GenericPagedListViewModels(Utility, ListController, $q, options);
            });
            describe("WHEN item === null", () => {
                it("THEN it throw an error", () => {
                    expect(() => {
                        genericList.removeItem(null);
                    }).toThrowError("The item cannot be null or undefined");
                });
            });
            describe("WHEN ids are not loaded", () => {
                it("THEN it throw an error", () => {
                    expect(() => {
                        genericList.removeItem(item);
                    }).toThrowError("The ids are not loaded");
                });
            });
            describe("WHEN the page is not found", () => {
                beforeEach(() => {
                    let defLoadData = $q.defer();
                    spyOn(Api, "getEntityIds").and.returnValue(_deferred.promise);
                    spyOn(Api, "getEntityList").and.callFake(() => {
                        return defLoadData.promise;
                    });
                    genericList.loadPage(2);
                    _deferred.resolve(new ap.services.apiHelper.ApiResponse(["5", "6", "8", "9", "3"]));
                    $rootScope.$apply();
                });
                it("THEN it throw an error", () => {
                    expect(() => {
                        genericList.removeItem(item);
                    }).toThrowError("The page is not found");
                });
            });
            describe("WHEN the item is valid and ids are loaded and the page is found", () => {
                let page: ap.viewmodels.PageDescription;
                let callback: jasmine.Spy;
                beforeEach(() => {
                    callback = jasmine.createSpy("callback");
                    genericList.on("itemremoved", callback, this);
                    let defLoadData = $q.defer();
                    spyOn(Api, "getEntityIds").and.returnValue(_deferred.promise);
                    spyOn(Api, "getEntityList").and.callFake(() => {
                        return defLoadData.promise;
                    });
                    genericList.loadPage(2);

                    _deferred.resolve(new ap.services.apiHelper.ApiResponse(["5", "6", "8", item.originalEntity.Id, "9", "3"]));
                    $rootScope.$apply();
                    genericList.sourceItems = [item];
                });
                it("THEN the id of the item is removed into the page", () => {
                    page = genericList.getPage(1);
                    expect(page.idsList.length).toEqual(2);
                    genericList.removeItem(item);
                    page = genericList.getPage(1);
                    expect(page.idsList.length).toEqual(1);
                });
                it("THEN the id of the item is removed into the page", () => {
                    expect(genericList.sourceItems.length).toEqual(1);
                    genericList.removeItem(item);
                    expect(genericList.sourceItems.length).toEqual(0);
                });
                it("THEN there is one item less", () => {
                    genericList.removeItem(item);
                    expect(genericList.count).toEqual(5);
                });
                it("THEN the event itemremoved is raised", () => {
                    genericList.removeItem(item);
                    expect(callback).toHaveBeenCalledWith(new ap.viewmodels.ItemRemovedEvent(0, item));
                });
                describe("AND if the cache is used", () => {
                    beforeEach(() => {
                        let d: Dictionary<string, ap.viewmodels.IEntityViewModel> = new Dictionary<string, ap.viewmodels.IEntityViewModel>();
                        d.add(originalEntity.Id, item);
                        specHelper.general.spyProperty(ap.viewmodels.GenericPagedListViewModels.prototype, "cacheData", specHelper.PropertyAccessor.Get).and.returnValue(d);
                    });
                    afterEach(() => {
                        specHelper.general.offSpyProperty(ap.viewmodels.GenericPagedListViewModels.prototype, "cacheData", specHelper.PropertyAccessor.Get);
                    });
                    it("THEN the item is removed from the cache", () => {
                        genericList.useCacheSystem = true;
                        genericList.removeItem(item);
                        expect(genericList.count).toEqual(5);
                    });
                });
            });
        });

        describe("Feature: Clear", function () {
            describe("WHEN claer is called", function () {
                let genericList: ap.viewmodels.GenericPagedListViewModels;
                beforeEach(function () {
                    let filter = "Filter.Eq('ProjectId', 1000)";
                    let options = new ap.viewmodels.GenericPagedListOptions("ContactDetails", null, "User", "Id", 2, true);
                    genericList = new ap.viewmodels.GenericPagedListViewModels(Utility, ListController, $q, options, filter);
                    let defLoadData = $q.defer();
                    apiOpt.async = false;

                    spyOn(Api, "getEntityIds").and.returnValue(_deferred.promise);
                    spyOn(Api, "getEntityList").and.callFake(function () {
                        return defLoadData.promise;
                    });

                    genericList.loadPage(2);

                    _deferred.resolve(new ap.services.apiHelper.ApiResponse(["5", "6", "8", "9", "3"]));
                    $rootScope.$apply();

                    genericList.clear();

                });
                it("THEN isIdsLoaded = true", function () {
                    expect(genericList.isIdsLoaded).toBeTruthy();
                });
                it("THEN isLoading = false", function () {
                    expect(genericList.isLoading).toBeFalsy();
                });
                it("THEN isLoaded = true", function () {
                    expect(genericList.isLoaded).toBeTruthy();
                });
            });
        });

        describe("Feature: getEntityById", () => {
            let genericList: ap.viewmodels.GenericPagedListViewModels;
            let directIssueType: ap.viewmodels.projects.IssueTypeViewModel;
            let foundIssueType: ap.viewmodels.IEntityViewModel;

            beforeEach(() => {
                let options = new ap.viewmodels.GenericPagedListOptions("IssueType", ap.viewmodels.projects.IssueTypeViewModel, null, "DisplayOrder", 2, false);
                genericList = new ap.viewmodels.GenericPagedListViewModels(Utility, ListController, $q, options);

                let issueType = new ap.models.projects.IssueType(Utility);
                issueType.createByJson({ Id: "direct-issue-type-id" });

                directIssueType = new ap.viewmodels.projects.IssueTypeViewModel(Utility);
                directIssueType.init(issueType);

                genericList.sourceItems = [directIssueType];
            });

            describe("WHEN a cache system is not used", () => {
                beforeEach(() => {
                    genericList.useCacheSystem = false;
                });
                it("THEN loaded items are found", () => {
                    foundIssueType = genericList.getEntityById("direct-issue-type-id");
                    expect(foundIssueType).toEqual(directIssueType);
                });
                it("THEN missing items are not found", () => {
                    foundIssueType = genericList.getEntityById("missing-issue-type-id");
                    expect(foundIssueType).toBeNull();
                });
            });

            describe("WHEN a cache system is used", () => {
                let cachedIssueType: ap.viewmodels.projects.IssueTypeViewModel;

                beforeEach(() => {
                    genericList.useCacheSystem = true;

                    let issueType = new ap.models.projects.IssueType(Utility);
                    issueType.createByJson({ Id: "cached-issue-type-id" });

                    cachedIssueType = new ap.viewmodels.projects.IssueTypeViewModel(Utility);
                    cachedIssueType.init(issueType);

                    genericList.addIntoCache(cachedIssueType);
                });
                it("THEN loaded items are found", () => {
                    foundIssueType = genericList.getEntityById("direct-issue-type-id");
                    expect(foundIssueType).toEqual(directIssueType);
                });
                it("THEN cached items are found", () => {
                    foundIssueType = genericList.getEntityById("cached-issue-type-id");
                    expect(foundIssueType).toEqual(cachedIssueType);
                });
                it("THEN missing items are not found", () => {
                    foundIssueType = genericList.getEntityById("missing-issue-type-id");
                    expect(foundIssueType).toBeNull();
                });
            });
        });

        describe("Feature: getPageIndexOfItemAt", () => {
            let genericList: ap.viewmodels.GenericPagedListViewModels;

            beforeEach(() => {
                let idsMock = ["1", "2", "3", "4", "5", "6"];
                spyOn(Api, "getEntityIds").and.returnValue($q.when(new ap.services.apiHelper.ApiResponse(idsMock)));
                spyOn(Api, "getEntityList").and.callFake((entityName: string, filter?: string, pathToLoad?: string, sortOrder?: string, ids?: string[], options?: ap.services.apiHelper.ApiOption) => {
                    let data = [];
                    for (let i = 0, len = ids.length; i < len; i++) {
                        if (idsMock.indexOf(ids[i]) !== -1) {
                            data.push({ Id: ids[i] });
                        }
                    }
                    return $q.when({ data: data });
                });
            });

            describe("WHEN one page is available", () => {
                beforeEach(() => {
                    let pageSize = 6;

                    let options = new ap.viewmodels.GenericPagedListOptions("IssueType", ap.viewmodels.projects.IssueTypeViewModel, null, "DisplayOrder", pageSize, false);
                    genericList = new ap.viewmodels.GenericPagedListViewModels(Utility, ListController, $q, options);

                    genericList.loadIds();
                    $rootScope.$digest(); // ids for 2 pages are loaded

                    genericList.loadPage(0);
                    $rootScope.$digest(); // a first page is loaded
                });

                it("THEN a correct index is returned for a first item of the list", () => {
                    let pageIndex = genericList.getPageIndexOfItemAt(0);
                    expect(pageIndex).toEqual(0);
                });

                it("THEN a correct index if returned for a last item of the list", () => {
                    let pageIndex = genericList.getPageIndexOfItemAt(5);
                    expect(pageIndex).toEqual(0);
                });

                it("THEN an exception is raised for items with negative index", () => {
                    expect(() => {
                        genericList.getPageIndexOfItemAt(-1);
                    }).toThrowError("Invalid item index");
                })

                it("THEN an exception is raised for items with indexes which are out of range", () => {
                    expect(() => {
                        genericList.getPageIndexOfItemAt(1000);
                    }).toThrowError("Invalid item index");
                });
            });

            describe("WHEN several pages are available", () => {
                beforeEach(() => {
                    let pageSize = 3;

                    let options = new ap.viewmodels.GenericPagedListOptions("IssueType", ap.viewmodels.projects.IssueTypeViewModel, null, "DisplayOrder", pageSize, false);
                    genericList = new ap.viewmodels.GenericPagedListViewModels(Utility, ListController, $q, options);

                    genericList.loadIds();
                    $rootScope.$digest(); // ids for 2 pages are loaded

                    genericList.loadPage(0);
                    $rootScope.$digest(); // a first page is loaded

                    genericList.loadPage(1);
                    $rootScope.$digest(); // a second page is loaded
                });

                it("THEN a correct index is returned for a first item of the first page", () => {
                    let pageIndex = genericList.getPageIndexOfItemAt(0);
                    expect(pageIndex).toEqual(0);
                });

                it("THEN a correct index is returned for a last item of the first page", () => {
                    let pageIndex = genericList.getPageIndexOfItemAt(2);
                    expect(pageIndex).toEqual(0);
                });

                it("THEN a correct index if returned for a first item of the last page", () => {
                    let pageIndex = genericList.getPageIndexOfItemAt(3);
                    expect(pageIndex).toEqual(1);
                });

                it("THEN a correct index if returned for a last item of the last page", () => {
                    let pageIndex = genericList.getPageIndexOfItemAt(5);
                    expect(pageIndex).toEqual(1);
                });

                it("THEN an exception is raised for items with negative index", () => {
                    expect(() => {
                        genericList.getPageIndexOfItemAt(-1);
                    }).toThrowError("Invalid item index");
                })

                it("THEN an exception is raised for items with indexes which are out of range", () => {
                    expect(() => {
                        genericList.getPageIndexOfItemAt(1000);
                    }).toThrowError("Invalid item index");
                });
            });
        });
    });

    describe("Feature itemsInfinite: infinite scroll for grid view", () => {
        let genericList
        beforeEach(() => {
            let options = new ap.viewmodels.GenericPagedListOptions("ContactDetails", null, null, null, 2, false);
            genericList = new ap.viewmodels.GenericPagedListViewModels(Utility, ListController, $q, options, "Filter.Eq('ProjectId',1000)");
        });
        describe("WHEN getItemAtIndex is called with an index existing in the sourceItems", () => {
            it("returns the object found in the sourceItems at this index", () => {
                genericList.sourceItems = [1, 4, 6, 7, 9];

                expect(genericList.getItemAtIndex(3)).toBe(7);
            });
        });
        describe("WHEN getItemAtIndex is called with an index more than the max of the sourceItems AND the list is NOT loading", () => {
            it("returns null and listVm.loadNextPage() is called", () => {
                genericList.sourceItems = ["1", "4", "6", "7", "9"];

                spyOn(genericList, "isLoading").and.returnValue(false);
                spyOn(genericList, "loadNextPage").and.returnValue(_deferred.promise);

                expect(genericList.getItemAtIndex(7)).toBeNull();
                expect(genericList.loadNextPage).toHaveBeenCalled();
            });
        });
        describe("WHEN getItemAtIndex is called with an index more than the max of the sourceItems AND the list is loading", () => {
            it("returns null and listVm.loadNextPage() is NOT called", () => {
                genericList.sourceItems = ["1", "4", "6", "7", "9"];

                specHelper.general.spyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "isLoading", specHelper.PropertyAccessor.Get).and.returnValue(true);
                spyOn(genericList, "loadNextPage").and.returnValue(_deferred.promise);

                expect(genericList.getItemAtIndex(7)).toBeNull();
                expect(genericList.loadNextPage).not.toHaveBeenCalled();

                specHelper.general.offSpyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "isLoading", specHelper.PropertyAccessor.Get);
            });
        });
        describe("WHEN getLength is called and the list is NOT completely loaded", () => {
            it("returns the current lenght of items loaded + 5", () => {
                genericList.sourceItems = ["1", "4", "6", "7", "9"];
                specHelper.general.spyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "isLoaded", specHelper.PropertyAccessor.Get).and.returnValue(false);

                expect(genericList.getLength()).toBe(10);
                specHelper.general.offSpyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "isLoaded", specHelper.PropertyAccessor.Get);
            });
        });
        describe("WHEN getLength is called and the list is completely loaded", () => {
            it("returns the count of items loaded", () => {
                specHelper.general.spyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "count", specHelper.PropertyAccessor.Get).and.returnValue(50);
                specHelper.general.spyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "isLoaded", specHelper.PropertyAccessor.Get).and.returnValue(true);

                expect(genericList.getLength()).toBe(52);
                specHelper.general.offSpyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "count", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "isLoaded", specHelper.PropertyAccessor.Get);
            });
        });
    });
    describe("Feature: Deferred Loading for grid view", () => {
        let genericList: ap.viewmodels.GenericPagedListViewModels;
        beforeEach(() => {
            let options = new ap.viewmodels.GenericPagedListOptions("ContactDetails", null, null, null, 2, false);
            genericList = new ap.viewmodels.GenericPagedListViewModels(Utility, ListController, $q, options, "Filter.Eq('ProjectId',1000)");
            genericList.isDeferredLoadingMode = true;
        });
        describe("WHEN getItemAtIndex is called with an index and the page is not load", () => {
            beforeEach(() => {
                let defLoadData = $q.defer();

                spyOn(Api, "getEntityIds").and.returnValue(_deferred.promise);
                spyOn(Api, "getEntityList").and.callFake(function () {
                    return defLoadData.promise;
                });
                spyOn(genericList, 'loadIds').and.callThrough();
                spyOn(genericList, 'loadPage').and.callThrough();

                defLoadData.resolve({ data: [{ Id: 8 }, { Id: 9 }] });
                _deferred.resolve(new ap.services.apiHelper.ApiResponse(["5", "6", "8", "9", "3"]));

                (<any>genericList)._filter = "Filter.Eq(Id,123)";
                genericList.getItemAtIndex(2);
                $rootScope.$apply();
            });
            afterEach(() => {
                (<any>genericList)._filter = null;
            });
            it("THEN loadIds is called with current filter", () => {
                expect(genericList.loadIds).toHaveBeenCalledWith("Filter.Eq(Id,123)");
            });
            it("THEN loadPage is called", () => {
                expect(genericList.loadPage).toHaveBeenCalledWith(1);
            });
        });

        describe("WHEN getItemAtIndex is called with an index and the page is loaded", () => {
            it("THEN not load the page and return the correct item", () => {
                let defLoadData = $q.defer();

                spyOn(Api, "getEntityIds").and.returnValue(_deferred.promise);
                spyOn(Api, "getEntityList").and.callFake(function () {
                    return defLoadData.promise;
                });

                defLoadData.resolve({ data: [{ Id: "3" }] });
                _deferred.resolve(new ap.services.apiHelper.ApiResponse(["5", "6", "8", "9", "3"]));
                genericList.loadPage(2);
                $rootScope.$apply();

                let item = genericList.getItemAtIndex(4);

                spyOn(genericList, 'loadIds').and.callThrough();
                spyOn(genericList, 'loadPage').and.callThrough();

                expect(item.originalEntity.Id).toBe("3");
                expect(genericList.loadIds).not.toHaveBeenCalled();
                expect(genericList.loadPage).not.toHaveBeenCalledWith(1);
            });
        });
        // Hide this test because of a bug in Angular
        /*describe("WHEN getItemAtIndex is called with an index out the range", () => {
            it("THEN throw expected error", () => {
                spyOn(Api, "getEntityIds").and.returnValue(_deferred.promise);

                _deferred.resolve(new ap.services.apiHelper.ApiResponse([5, 6, 8, 9, 3]));
                spyOn(genericList, 'getItemAtIndex').and.callThrough();
                
                expect(() => {
                    genericList.getItemAtIndex(-1);
                    $rootScope.$apply();
                }).toThrowError("Index out of range (index=-1 count=5)");

                expect(() => { genericList.getItemAtIndex(5) }).toThrowError("Index out of range (index=5 count=5)");                
            });
        });*/
        describe("WHEN loadIDs is celled", () => {
            it("THEN getLenght will return the correct number", () => {
                let ids = ["6", "8", "10", "12", "13"];
                let defLoadData = $q.defer();
                spyOn(Api, "getEntityIds").and.returnValue(_deferred.promise);

                genericList.loadIds();
                _deferred.resolve(new ap.services.apiHelper.ApiResponse(ids));

                $rootScope.$apply();
                expect(genericList.getLength()).toBe(5);
            });
        });
    });

    /*
    describe("WHEN loadIds is called", function () {
            it("THEN Api.getEntityIds is called with the given filter parameter and the predefined options AND contains a description for each page depending of the pageSize", function () {
                
                let genericList = new ap.viewmodels.GenericPagedListViewModels(Utility, ListController, $q, new ap.viewmodels.GenericPagedListOptions("ContactDetails", null, "User", "Id", 2, true), "Filter.Eq('ProjectId', 1000)");
                let fullfilter = "Filter.And(Filter.Eq('ProjectId', 1000),Filter.Eq('UserId', 2141))";
                apiOpt.async = false;
                spyOn(Api, "getEntityIds").and.returnValue(_deferred.promise);

                genericList.loadIds("Filter.Eq('UserId', 2141)");

                expect(Api.getEntityIds).toHaveBeenCalledWith("ContactDetails", fullfilter, "Id", apiOpt, false);

                _deferred.resolve(new ap.services.apiHelper.ApiResponse([5, 6, 8, 9, 3]));
                $rootScope.$apply();

                expect(genericList.nbPages).toBe(3);
                expect(genericList.getPage(0).idsList).toEqual([5, 6]);
                expect(genericList.getPage(1).idsList).toEqual([8, 9]);
                expect(genericList.getPage(2).idsList).toEqual([3]);

                expect(genericList.getPage(0).isLoaded).toBeFalsy();
                expect(genericList.getPage(1).isLoaded).toBeFalsy();
                expect(genericList.getPage(2).isLoaded).toBeFalsy();
            });
        });
    */

    describe("Feature: GetItemIndex", () => {

        let genericList: ap.viewmodels.GenericPagedListViewModels;

        beforeEach(() => {
            genericList = new ap.viewmodels.GenericPagedListViewModels(Utility, ListController, $q, new ap.viewmodels.GenericPagedListOptions("ContactDetails", null, "User", "Id", 2, true), "Filter.Eq('ProjectId', 1000)");

            spyOn(Api, "getEntityIds").and.returnValue(_deferred.promise);

            genericList.loadIds();
        });

        describe("WHEN the list is not yet loaded", () => {
            it("THEN, -1 is returned", () => {
                expect(genericList.getItemIndex("2")).toBe(-1);
            });
        });

        describe("WHEN the list is loaded ", () => {

            beforeEach(() => {
                _deferred.resolve(new ap.services.apiHelper.ApiResponse(["5", "6", "8", "9", "3", "2"]));
                $rootScope.$apply();
            });

            describe("AND WHEN a call to GetItemIndex '2' is made", () => {
                it("THEN the index of the item having the Id '2' is returned", () => {
                    expect(genericList.getItemIndex("2")).toBe(5);
                });
            });

            describe("WHEN a call to GetItemIndex '25' is made and this Id is not in the list", () => {
                it("THEN -1 is returned", () => {
                    expect(genericList.getItemIndex("25")).toBe(-1);
                });
            });
        });
    });


    describe("Feature: isItemCheckAllowed", () => {
        let genericList: ap.viewmodels.GenericPagedListViewModels;
        let testVm: ap.viewmodels.IEntityViewModel;
        beforeEach(() => {
            genericList = new ap.viewmodels.GenericPagedListViewModels(Utility, ListController, $q, new ap.viewmodels.GenericPagedListOptions("ContactDetails", null, "User", "Id", 2, true), "Filter.Eq('ProjectId', 1000)");
            testVm = new ap.viewmodels.projectcontacts.ProjectContactItemViewModel(Utility, $q);
        });
        describe("WHEN we call method with valid entity value", () => {
            it("THEN, the result is true", () => {
                expect(genericList.isItemCheckAllowed(testVm)).toBeTruthy();
            });
        });
        describe("WHEN we call method with invalid entity value (null or undefined)", () => {
            it("THEN, the result is false", () => {
                expect(genericList.isItemCheckAllowed(null)).toBeFalsy();
                expect(genericList.isItemCheckAllowed(undefined)).toBeFalsy();
            });
        });
    });

    describe("Feature: insertItem", () => {
        let genericList: ap.viewmodels.GenericPagedListViewModels;
        beforeEach(() => {
            genericList = new ap.viewmodels.GenericPagedListViewModels(Utility, ListController, $q, new ap.viewmodels.GenericPagedListOptions("ContactDetails", null, "User", "Id", 2, true), "Filter.Eq('ProjectId', 1000)");
            genericList.isDeferredLoadingMode = true;
            spyOn(Api, "getEntityIds").and.returnValue(_deferred.promise);
            genericList.loadIds();
        });
        describe("WHEN insertItem call without item", () => {
            it("THEN will throw the error", () => {
                expect(function () { genericList.insertItem(0, null); }).toThrowError("item is mandatory");
            });
        });
        describe("WHEN insertItem call and the ids have not loaded", () => {
            it("THEN will throw the error", () => {
                expect(function () {
                    genericList.insertItem(0, new ap.viewmodels.EntityViewModel(Utility));
                }).toThrowError("Cannot insert the item when isIdsLoaded = false");
            });
        });


        describe("WHEN insertItem call and the ids have loaded", () => {
            beforeEach(() => {
                let ids = ["6", "8", "10", "12", "14"];
                _deferred.resolve(new ap.services.apiHelper.ApiResponse(ids));
                $rootScope.$apply();
            });
            describe("WHEN insertItem call with the index < 0", () => {
                it("THEN will throw the error", () => {
                    expect(function () {
                        genericList.insertItem(-1, new ap.viewmodels.EntityViewModel(Utility));
                    }).toThrowError("Invalid index");
                });
            });
            describe("WHEN insertItem call with the index > length", () => {
                it("THEN will throw the error", () => {
                    expect(function () {
                        genericList.insertItem(6, new ap.viewmodels.EntityViewModel(Utility));
                    }).toThrowError("Invalid index");
                });
            });

            describe("WHEN insertItem call with the index in the loaded page", () => {

                let defLoadData: angular.IDeferred<any>;
                let callback: jasmine.Spy;
                let event: ap.viewmodels.ItemInsertedEvent;

                beforeEach(() => {
                    defLoadData = $q.defer();
                    callback = jasmine.createSpy("callback");
                    genericList.on("iteminserted", (evt: ap.viewmodels.ItemInsertedEvent) => {
                        callback(evt);
                    }, this);

                    spyOn(Api, "getEntityList").and.callFake(function () {
                        return defLoadData.promise;
                    });
                    genericList.loadPage(0);
                    defLoadData.resolve({ data: [{ Id: "6" }, { Id: "8" }] });
                    $rootScope.$apply();
                });
                describe("When we want to insert the item in the middle of the list", () => {
                    beforeEach(() => {
                        genericList.insertItem(1, <ap.viewmodels.EntityViewModel>{
                            originalEntity: {
                                Id: "7"
                            }
                        });

                        event = new ap.viewmodels.ItemInsertedEvent(1, <ap.viewmodels.EntityViewModel>{
                            originalEntity: {
                                Id: "7"
                            }
                        });
                    });
                    it("THEN, the item will be insert into the index", () => {
                        expect(genericList.sourceItems[0].originalEntity.Id).toEqual("6");
                        expect(genericList.sourceItems[1].originalEntity.Id).toEqual("7");
                        expect(genericList.sourceItems[2].originalEntity.Id).toEqual("8");
                    });

                    it("THEN, count property will be updated", () => {
                        expect(genericList.count).toEqual(6);
                    });

                    it("THEN, the ids list will be updated", () => {
                        expect(genericList.ids.length).toEqual(6);

                        expect(genericList.ids[0]).toEqual("6");
                        expect(genericList.ids[1]).toEqual("7");
                        expect(genericList.ids[2]).toEqual("8");
                        expect(genericList.ids[3]).toEqual("10");
                        expect(genericList.ids[4]).toEqual("12");
                        expect(genericList.ids[5]).toEqual("14");
                    });

                    it("THEN, 'iteminserted' event will be fired", () => {
                        expect(callback).toHaveBeenCalled();
                        expect((<jasmine.Spy>callback).calls.argsFor(0)[0]).toEqual(event);
                    });
                });
                describe("When we want to insert the item at the end of the list", () => {
                    beforeEach(() => {
                        genericList.loadPage(2);
                        defLoadData.resolve({ data: [{ Id: "14" }] });
                        $rootScope.$apply();
                        genericList.insertItem(5, <ap.viewmodels.EntityViewModel>{
                            originalEntity: {
                                Id: "7"
                            }
                        });

                        event = new ap.viewmodels.ItemInsertedEvent(5, <ap.viewmodels.EntityViewModel>{
                            originalEntity: {
                                Id: "7"
                            }
                        });
                    });
                    it("THEN, the item will be insert into the index", () => {
                        expect(genericList.sourceItems[5].originalEntity.Id).toEqual("7");
                    });

                    it("THEN, count property will be updated", () => {
                        expect(genericList.count).toEqual(6);
                    });

                    it("THEN, the ids list will be updated", () => {
                        expect(genericList.ids.length).toEqual(6);

                        expect(genericList.ids[0]).toEqual("6");
                        expect(genericList.ids[1]).toEqual("8");
                        expect(genericList.ids[2]).toEqual("10");
                        expect(genericList.ids[3]).toEqual("12");
                        expect(genericList.ids[4]).toEqual("14");
                        expect(genericList.ids[5]).toEqual("7");
                    });

                    it("THEN, 'iteminserted' event will be fired", () => {
                        expect(callback).toHaveBeenCalled();
                        expect((<jasmine.Spy>callback).calls.argsFor(0)[0]).toEqual(event);
                    });
                });
            });

            describe("WHEN insertItem call with the index is the first one of the not loaded page and the pre page have been loaded", () => {

                let defLoadData: angular.IDeferred<any>;
                let callback: jasmine.Spy;
                let event: ap.viewmodels.ItemInsertedEvent;

                beforeEach(() => {
                    defLoadData = $q.defer();
                    callback = jasmine.createSpy("callback");
                    genericList.on("iteminserted", (evt: ap.viewmodels.ItemInsertedEvent) => {
                        callback(evt);
                    }, this);

                    spyOn(Api, "getEntityList").and.callFake(function () {
                        return defLoadData.promise;
                    });
                    genericList.loadPage(0);
                    defLoadData.resolve({ data: [{ Id: "6" }, { Id: "8" }] });
                    $rootScope.$apply();

                    genericList.insertItem(2, <ap.viewmodels.EntityViewModel>{
                        originalEntity: {
                            Id: "7"
                        }
                    });

                    event = new ap.viewmodels.ItemInsertedEvent(2, <ap.viewmodels.EntityViewModel>{
                        originalEntity: {
                            Id: "7"
                        }
                    });
                });

                it("THEN, the item will be insert into the index", () => {
                    expect(genericList.sourceItems[0].originalEntity.Id).toEqual("6");
                    expect(genericList.sourceItems[1].originalEntity.Id).toEqual("8");
                    expect(genericList.sourceItems[2].originalEntity.Id).toEqual("7");
                });

                it("THEN, count property will be updated", () => {
                    expect(genericList.count).toEqual(6);
                });

                it("THEN, the ids list will be updated", () => {
                    expect(genericList.ids.length).toEqual(6);

                    expect(genericList.ids[0]).toEqual("6");
                    expect(genericList.ids[1]).toEqual("8");
                    expect(genericList.ids[2]).toEqual("7");
                    expect(genericList.ids[3]).toEqual("10");
                    expect(genericList.ids[4]).toEqual("12");
                    expect(genericList.ids[5]).toEqual("14");
                });

                it("THEN, 'iteminserted' event will be fired", () => {
                    expect(callback).toHaveBeenCalled();
                    expect((<jasmine.Spy>callback).calls.argsFor(0)[0]).toEqual(event);
                });
            });

            describe("WHEN insertItem call with the index is not the first one of the not loaded page", () => {
                let defLoadData;
                let callback;
                beforeEach(() => {
                    defLoadData = $q.defer();
                    callback = jasmine.createSpy("callback");
                    genericList.on("iteminserted", function () {
                        callback();
                    }, this);

                    spyOn(Api, "getEntityList").and.callFake(function () {
                        return defLoadData.promise;
                    });
                    genericList.loadPage(0);
                    defLoadData.resolve({ data: [{ Id: "6" }, { Id: "8" }] });
                    $rootScope.$apply();
                });
                it("THEN, the item will be insert into the index", () => {
                    expect(function () {
                        genericList.insertItem(3, <ap.viewmodels.EntityViewModel>{
                            originalEntity: {
                                Id: "7"
                            }
                        });
                    }).toThrowError("Cannot insert into not loaded page");
                });
            });
            describe("WHEN insertItem call with the index and forceUpdate = true is not the first one of the not loaded page", () => {
                let defLoadData;
                let callback;
                beforeEach(() => {
                    defLoadData = $q.defer();
                    callback = jasmine.createSpy("callback");
                    genericList.on("iteminserted", function () {
                        callback();
                    }, this);

                    spyOn(Api, "getEntityList").and.callFake(function () {
                        return defLoadData.promise;
                    });
                    genericList.loadPage(0);
                    defLoadData.resolve({ data: [{ Id: "6" }, { Id: "8" }] });
                    $rootScope.$apply();
                    genericList.insertItem(3, <ap.viewmodels.EntityViewModel>{
                        originalEntity: {
                            Id: "7"
                        }
                    }, true);
                });
                it("THEN, the item will be insert into the index", () => {
                    expect(genericList.sourceItems[3].originalEntity.Id).toEqual("7");
                });
            });
        });
    });

    describe("Feature: getChangedItems", () => {

        let defLoadData: angular.IDeferred<any>;
        let genericList: ap.viewmodels.GenericPagedListViewModels;

        beforeEach(() => {
            defLoadData = $q.defer();
            spyOn(Api, "getEntityIds").and.returnValue(_deferred.promise);
            spyOn(Api, "getEntityList").and.returnValue(defLoadData.promise);

            genericList = new ap.viewmodels.GenericPagedListViewModels(Utility, ListController, $q, new ap.viewmodels.GenericPagedListOptions("ContactDetails", null, "User", "Id", 2, true), "Filter.Eq('ProjectId', 1000)");
            genericList.isDeferredLoadingMode = true;

            specHelper.general.spyProperty(ap.viewmodels.EntityViewModel.prototype, "hasChanged", specHelper.PropertyAccessor.Get).and.returnValue(true);
        });

        afterEach(() => {
            specHelper.general.offSpyProperty(ap.viewmodels.EntityViewModel.prototype, "hasChanged", specHelper.PropertyAccessor.Get);
        });

        describe("WHEN getCHangedItems is called and the cache is not used", () => {

            beforeEach(() => {
                genericList.loadPage(0);

                defLoadData.resolve({ data: [{ Id: "3" }] });
                _deferred.resolve(new ap.services.apiHelper.ApiResponse(["3"]));
                $rootScope.$apply();
            });

            it("THEN, the changed elemets are returned", () => {
                expect(genericList.getChangedItems().length).toBe(1);
            });
        });

        describe("WHEN getCHangedItems is called and the cache IS used", () => {

            beforeEach(() => {
                genericList.useCacheSystem = true;
                genericList.loadPage(0);

                defLoadData.resolve({ data: [{ Id: "3" }] });
                _deferred.resolve(new ap.services.apiHelper.ApiResponse(["3"]));
                $rootScope.$apply();
            });

            it("THEN, the changed elemets are returned WITHOUT duplicated items", () => {
                expect(genericList.getChangedItems().length).toBe(1);
            });
        });
    });

    describe("Feature: previousAndNextPages", () => {
        let genericList: ap.viewmodels.GenericPagedListViewModels;
        let defLoadData: angular.IDeferred<any>;
        beforeEach(() => {
            let options = new ap.viewmodels.GenericPagedListOptions("ContactDetails", null, null, null, 2, false);
            genericList = new ap.viewmodels.GenericPagedListViewModels(Utility, ListController, $q, options, "Filter.Eq('ProjectId',1000)");
            genericList.isDeferredLoadingMode = true;
            defLoadData = $q.defer();

            spyOn(Api, "getEntityIds").and.returnValue(_deferred.promise);
            spyOn(Api, "getEntityList").and.callFake(function () {
                return defLoadData.promise;
            });



        });
        describe("WHEN second page of items is loaded AND getItemAtIndex is call with index = 2", () => {
            beforeEach(() => {
                defLoadData.resolve({ data: [{ Id: "8" }, { Id: "9" }] });
                _deferred.resolve(new ap.services.apiHelper.ApiResponse(["5", "6", "8", "9", "3"]));
                genericList.loadPage(1);
                $rootScope.$apply();
                spyOn(genericList, 'loadPage').and.callThrough();
                let item = genericList.getItemAtIndex(2);
            });
            it("THEN previous and next page should be loaded", () => {
                expect((<jasmine.Spy>genericList.loadPage).calls.argsFor(0)[0]).toBe(0);
                expect((<jasmine.Spy>genericList.loadPage).calls.argsFor(1)[0]).toBe(2);
                expect((<jasmine.Spy>genericList.loadPage).calls.count()).toBe(2);
            });
        });
        describe("WHEN first page of items is loaded AND getItemAtIndex is call with index = 0", () => {
            beforeEach(() => {
                defLoadData.resolve({ data: [{ Id: "5" }, { Id: "6" }] });
                _deferred.resolve(new ap.services.apiHelper.ApiResponse(["5", "6", "8", "9", "3"]));
                genericList.loadPage(0);
                $rootScope.$apply();
                spyOn(genericList, 'loadPage').and.callThrough();
                let item = genericList.getItemAtIndex(0);
            });
            it("THEN  next page should be loaded", () => {
                expect((<jasmine.Spy>genericList.loadPage).calls.argsFor(0)[0]).toBe(1);
                expect((<jasmine.Spy>genericList.loadPage).calls.count()).toBe(1);
            });
        });
        describe("WHEN third page of items is loaded AND getItemAtIndex is call with index = 4", () => {
            beforeEach(() => {
                defLoadData.resolve({ data: [{ Id: "3" }] });
                _deferred.resolve(new ap.services.apiHelper.ApiResponse(["5", "6", "8", "9", "3"]));
                genericList.loadPage(2);
                $rootScope.$apply();
                spyOn(genericList, 'loadPage').and.callThrough();
                let item = genericList.getItemAtIndex(4);
            });
            it("THEN previous page should be loaded", () => {
                expect((<jasmine.Spy>genericList.loadPage).calls.argsFor(0)[0]).toBe(1);
                expect((<jasmine.Spy>genericList.loadPage).calls.count()).toBe(1);
            });
        });
    });
});
