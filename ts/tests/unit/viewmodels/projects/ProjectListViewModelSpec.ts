describe("Module ap-viewmodels - projectslist", () => {
    let nmp = ap.viewmodels.projects;
    let MainController: ap.controllers.MainController, Utility: ap.utility.UtilityHelper, Api: ap.services.apiHelper.Api, UIStateController: ap.controllers.UIStateController;
    let $controller: angular.IControllerService, $rootScope: angular.IRootScopeService, $scope: angular.IScope, _deferred: angular.IDeferred<ap.services.apiHelper.ApiResponse>, $q: angular.IQService;
    let vm: ap.viewmodels.projects.ProjectListViewModel;
    let ControllersManager: ap.controllers.ControllersManager;
    let ProjectController: ap.controllers.ProjectController;
    let ServicesManager: ap.services.ServicesManager;
    let defNoteStats: angular.IDeferred<any>;
    let defDocStats: angular.IDeferred<any>;
    let defContactStats: angular.IDeferred<any>;

    let idsProj = ['b360cb6d-ca54-4b93-a564-a469274eb68a', '35a2c5d6-0e00-43e9-ada8-ce4f3fadb16e', 'bf70c80f-3b76-4bf8-bef4-86c7b1d4aa60', 'bf70c80f-3b76-8jf8-bef4-8kreb1d4aa60'];
    let dataProjs = [
        {
            Id: "b360cb6d-ca54-4b93-a564-a469274eb68a",
            Name: "Project 1",
            Code: "PR1",
            StartDate: specHelper.utility.defaultJsonDate().toJSON(),
            Creator: {
                Display: "John Doe"
            },
            LogoUrl: "pr1.png",
            Cover: null,
            Country: null,
            UserAccessRight: {},
            PhotoFolderId: "3C1B834C-61A1-4CDD-BF62-A5312BB1B3DA"
        },
        {
            Id: "35a2c5d6-0e00-43e9-ada8-ce4f3fadb16e",
            Name: "Project 2",
            Code: "PR2",
            StartDate: specHelper.utility.defaultJsonDate().toJSON(),
            Creator: {
                Display: "Paul Klein"
            },
            Cover: {
                Status: 2,
                BigThumbUrl: "tiles/pr2.png"
            },
            UserAccessRight: {},
            PhotoFolderId: "A5D9BC53-9145-48F3-936B-DE565E0D8679"
        },
        {
            Id: "bf70c80f-3b76-4bf8-bef4-86c7b1d4aa60",
            Name: "Project 3",
            Code: "PR3",
            StartDate: specHelper.utility.defaultJsonDate().toJSON(),
            Creator: {
                Display: "Paul Klein"
            },
            Cover: {
                Status: 1,
                BigThumbUrl: ""
            },
            UserAccessRight: {},
            PhotoFolderId: "9ECBEEA6-46F6-440C-BCE3-5553B01081B3"
        },
        {
            Id: "bf70c80f-3b76-8jf8-bef4-8kreb1d4aa60",
            Name: "Project 4",
            Code: "PR4",
            StartDate: specHelper.utility.defaultJsonDate().toJSON(),
            Creator: {
                Display: "Paul Klein"
            },
            UserAccessRight: {},
            Cover: null,
            PhotoFolderId: "5C670C5B-F5D2-49A8-B4D1-A2EFAC3AF840"
        }];
    
    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject(function (_$rootScope_, _$q_, _Utility_, _Api_, _MainController_, _UIStateController_, _$controller_, _ProjectController_, _ControllersManager_, _ServicesManager_) {
        MainController = _MainController_;
        UIStateController = _UIStateController_;
        ControllersManager = _ControllersManager_;
        Utility = _Utility_;
        Api = _Api_;
        vm = null;
        $q = _$q_;
        ServicesManager = _ServicesManager_;
        $rootScope = _$rootScope_;
        _deferred = $q.defer();
        $controller = _$controller_;
        $scope = $rootScope.$new();
        ProjectController = _ProjectController_;
        specHelper.utility.stubRootUrl(Utility);
        specHelper.utility.stubUserConnected(Utility);
        specHelper.utility.stubStorageSet(Utility);

        let mainActions: Array<ap.viewmodels.home.ActionViewModel> = [
            new ap.viewmodels.home.ActionViewModel(Utility, Utility.EventTool, "grouplist", null, true, null, "Group list", true),
        ];

        spyOn(Utility.Translator, "getTranslation").and.callFake(function (key) {
            return "$" + key;
        });

        defNoteStats = $q.defer();
        defDocStats = $q.defer();
        defContactStats = $q.defer();
        spyOn(Api, "getApiResponseStatList").and.callFake((name: string) => {
            if (name === "notestats") {
                return defNoteStats.promise;
            } else if (name === "documentstats") {
                return defDocStats.promise;
            } else if (name === "contactdetailsstats") {
                return defContactStats.promise;
            }
        });
        spyOn(ap.viewmodels.meetings.MeetingListWorkSpaceViewModel, "resetSortingInfo");
        spyOn(ap.viewmodels.notes.NoteListViewModel, "resetSortingInfo");
        spyOn(ap.viewmodels.documents.DocumentListViewModel, "resetSortingInfo");

    }));

    describe("Feature ProjectItemViewModel", () => {
        let pr: ap.models.projects.Project;
        let item: ap.viewmodels.projects.ProjectItemViewModel;
        beforeEach(function () {
            pr = new ap.models.projects.Project(Utility);
            pr.Name = "My project";
            pr.Code = "PR1";
            pr.Creator = new ap.models.actors.User(Utility);
            pr.Creator.DisplayName = "John Smith";
            pr.StartDate = new Date();
            pr.LogoUrl = "pr1.png";
            pr.Cover = new ap.models.documents.Document(Utility);
            pr.Cover.Status = ap.models.documents.DocumentStatus.Processed;
            pr.NotesNumber = 100;
            pr.ParticipantsNumber = 10;
            pr.DocumentsNumber = 20;
            pr.UserAccessRight = new ap.models.accessRights.ProjectAccessRight(Utility);
        });
        describe("WHEN an item is created with a project", () => {
            let params: ap.viewmodels.projects.ProjectItemParameter;
            beforeEach(() => {
                params = new ap.viewmodels.projects.ProjectItemParameter(0, null, null, null, Utility, ProjectController, MainController);
                item = new ap.viewmodels.projects.ProjectItemViewModel(Utility, $q, null, params);
                item.init(pr);
            });
            it("THEN buildActions should be called", () => {
                expect(item.projectActionViewModel).toBeDefined();
            });
        });
        describe("WHEN an item is created with a project and LogoUrl defined", () => {
            it("THEN, the items has default values correctly built with logoPath build on logoUrl", () => {
                item = new ap.viewmodels.projects.ProjectItemViewModel(Utility, $q);
                item.init(pr);
                expect(item.name).toBe(pr.Name);
                expect(item.code).toBe(pr.Code);
                expect(item.displayName).toBe("(" + pr.Code + ") " + pr.Name);
                expect(item.startDate).toBe(pr.StartDate);
                expect(item.logoPath).toBe(Utility.apiUrl + "ProjectImages/Logo/" + pr.Id + "/" + pr.LogoUrl);
            });
        });
        describe("WHEN an item is created with a project and logoUrl not defined and Cover defined", () => {
            it("THEN, the items has default values correctly built with logoPath build on Cover bigthumb path", () => {
                pr.LogoUrl = null;
                item = new ap.viewmodels.projects.ProjectItemViewModel(Utility, $q);
                item.init(pr);
                expect(item.name).toBe(pr.Name);
                expect(item.code).toBe(pr.Code);
                expect(item.displayName).toBe("(" + pr.Code + ") " + pr.Name);
                expect(item.startDate).toBe(pr.StartDate);
                expect(item.logoPath).toBe(pr.Cover.BigThumbUrl);
            });
        });
        describe("WHEN the Cover bigThumbsUrl contains the complete url already", () => {

            beforeEach(() => {
                pr.LogoUrl = null;
                item = new ap.viewmodels.projects.ProjectItemViewModel(Utility, $q);
                item.init(pr);
            });
            it("THEN, the logoPath = bigThumbsUrl", () => {
                expect(item.logoPath).toBe(pr.Cover.BigThumbUrl);
            });
        });
        describe("WHEN an item has a logoPath defined", () => {
            it("THEN, hasLogo returns true and hasNotThumb return false", () => {
                item = new ap.viewmodels.projects.ProjectItemViewModel(Utility, $q);
                item.init(pr);
                item.logoPath = "test.png";
                
                expect(item.hasNotThumb()).toBeFalsy();
            });
        });
        describe("WHEN an item has no logo defined (path or cover)", () => {
            it("THEN, hasNotThumb returns true", () => {
                pr.LogoUrl = null;
                pr.Cover = null;
                item = new ap.viewmodels.projects.ProjectItemViewModel(Utility, $q);
                item.init(pr);

                expect(item.hasNotThumb()).toBeTruthy();
            });
        });
        describe("WHEN an item is created with a project and NotesNumber, ParticipantsNumber, DocumentsNumber defined", () => {
            it("THEN, notesCount, documentsCount, participantsCount were filled correct", () => {
                item = new ap.viewmodels.projects.ProjectItemViewModel(Utility, $q);
                item.init(pr);
                expect(item.notesCount).toBe(pr.NotesNumber);
                expect(item.documentsCount).toBe(pr.DocumentsNumber);
                expect(item.participantsCount).toBe(pr.ParticipantsNumber);
            });
        });
    });

    describe("Feature: Default values", () => {
        describe("WHEN the view model is created", () => {
            it("THEN I can get an instance of my viewmodel with default values AND Api is called to get project list", () => {
                let urlexpect = "rest/projectsids?filter=Filter.IsTrue(IsActive)";
                spyOn(Api, "getApiResponse").and.callFake(function (url, method) {
                    if (url.indexOf("rest/projectsids") === 0 && method === ap.services.apiHelper.MethodType.Get)
                        return _deferred.promise;
                    return null;
                });

                vm = <ap.viewmodels.projects.ProjectListViewModel>$controller("projectsViewModel", { $scope: $scope });
                expect(vm).toBeDefined();
                expect(vm.isThumbView).toBeTruthy();
                expect(vm.listVm).toBeDefined();
                expect(vm.listVm.entityName).toBe("Project");
                expect(vm.listVm.pathToLoad).toBe("Creator,UserAccessRight");
                expect(vm.listVm.defaultFilter).toBe(null);
                expect(vm.listVm.options.pageSize).toBe(50);
                expect(vm.listVm.options.displayLoading).toBeFalsy();
                expect(vm.listVm.options.onlyPathToLoadData).toBeFalsy();
                let opt: ap.services.apiHelper.ApiOption = new ap.services.apiHelper.ApiOption();
                opt.async = true;
                expect(Api.getApiResponse).toHaveBeenCalledWith(urlexpect, ap.services.apiHelper.MethodType.Get, null, null, opt);
            });

            it("THEN actions concerning projects are initialized in the main controller", () => {
                vm = <ap.viewmodels.projects.ProjectListViewModel>$controller("projectsViewModel", { $scope: $scope });

                let mainActions = MainController.currentVisibleScreens[0].screen.actions;
                let addActions = vm.screenInfo.addAction;

                expect(mainActions[0].name).toBe("groupprojectgrid");
                expect(mainActions[0].isEnabled).toBeTruthy();
                expect(mainActions[0].isVisible).toBeTruthy();
                expect(mainActions[0].translationKey).toBe("$Grid view");
                expect(mainActions[0].iconSrc).toBe("https://app.aproplan.com/Images/html/icons/ic_view_list_black_48px.svg");
                expect(mainActions[0].hasSubActions).toBeFalsy();

                expect(mainActions[1].name).toBe("groupprojectlist");
                expect(mainActions[1].isEnabled).toBeTruthy();
                expect(mainActions[1].isVisible).toBeFalsy();
                expect(mainActions[1].translationKey).toBe("$Thumb view");
                expect(mainActions[1].iconSrc).toBe("https://app.aproplan.com/Images/html/icons/thumb_view.svg");
                expect(mainActions[1].hasSubActions).toBeFalsy();

                expect(mainActions[2].name).toBe("refreshprojects");
                expect(mainActions[2].isEnabled).toBeTruthy();
                expect(mainActions[2].isVisible).toBeTruthy();
                expect(mainActions[2].translationKey).toBe("$Refresh projects");
                expect(mainActions[2].iconSrc).toBe("https://app.aproplan.com/Images/html/icons/ic_refresh_black_48px.svg");
                expect(mainActions[2].hasSubActions).toBeFalsy();

                expect(addActions.name).toEqual("project.addproject");
                expect(addActions.isEnabled).toBeTruthy();
                expect(addActions.isVisible).toBeTruthy();
                expect(addActions.translationKey).toBe("$Add project");
                expect(addActions.iconSrc).toBe("/Images/html/icons/ic_add_black_48px.svg");
                expect(addActions.hasSubActions).toBeFalsy();
            });
            it("THEN, predefinedFilters are added in the main search", () => {
                let predefinedFilters = [
                    new ap.misc.PredefinedFilter("Active", "Active projects", true, "Filter.IsTrue(IsActive)", null, ["Archived"]),
                    new ap.misc.PredefinedFilter("Archived", "Inactive projects", true, "Filter.IsFalse(IsActive)", null, ["Active"])
                ];
                vm = <ap.viewmodels.projects.ProjectListViewModel>$controller("projectsViewModel", { $scope: $scope });

                expect(vm.screenInfo.mainSearchInfo.predefinedFilters).toEqual(predefinedFilters);
            });
        });
    });

    describe("Feature: refresh", () => {
        beforeEach(() => {
            let defApi = $q.defer();
            spyOn(Api, "getApiResponse").and.callFake(function (url, method) {
                if (url.indexOf("rest/projectsids") === 0 && method === ap.services.apiHelper.MethodType.Get)
                    return defApi.promise;
                return null;
            });
            let mainflow: ap.controllers.MainFlowStateParam = new ap.controllers.MainFlowStateParam(Utility);
            let infoView: ap.misc.ViewInfo = new ap.misc.ViewInfo(Utility);
            infoView.isInfoOpened = true;
            infoView.selectedEntityId = "bf70c80f-3b76-8jf8-bef4-8kreb1d4aa60";
            mainflow.addView(infoView);
            specHelper.general.spyProperty(ap.controllers.UIStateController.prototype, "mainFlowStateParam", specHelper.PropertyAccessor.Get).and.returnValue(mainflow);

            vm = <ap.viewmodels.projects.ProjectListViewModel>$controller("projectsViewModel", { $scope: $scope });

        });
        afterEach(() => {
            specHelper.general.offSpyProperty(ap.controllers.UIStateController.prototype, "mainFlowStateParam", specHelper.PropertyAccessor.Get);
        });
        describe("WHEN the refresh method is called AND there is no specific filter defined", () => {
            it("THEN, loadIds is called with active filter on the listVm AND when succeded loadNextPage is called AND grid is refreshed", () => {
                let _defNextPage = $q.defer();

                spyOn(vm.listVm, 'loadIds').and.returnValue(_deferred.promise);
                spyOn(vm.listVm, 'clearLoaderCache').and.callThrough();
                spyOn(vm.listVm, 'loadNextPage').and.returnValue(_defNextPage.promise);

                vm.refresh();
                expect(vm.listVm.clearLoaderCache).toHaveBeenCalled();
                expect(vm.listVm.loadIds).toHaveBeenCalledWith("Filter.IsTrue(IsActive)", null);

                _deferred.resolve(new ap.services.apiHelper.ApiResponse({}));
                $rootScope.$apply();

                expect(vm.listVm.loadNextPage).toHaveBeenCalled();

                _defNextPage.resolve({ data: {} });
                $rootScope.$apply();
            });
        });
        describe("WHEN the refresh method is called AND there is a mainFlowStateParam", () => {
            beforeEach(() => {
                let _defNextPage = $q.defer();

                spyOn(vm.listVm, "loadIds").and.returnValue(_deferred.promise);
                spyOn(vm.listVm, "loadNextPage").and.returnValue(_defNextPage.promise);
                spyOn(vm.listVm, "selectEntity");
                spyOn(vm.listVm.ids, "indexOf").and.returnValue(1);
                vm.refresh();

                _deferred.resolve(new ap.services.apiHelper.ApiResponse({}));
                $rootScope.$apply();

                _defNextPage.resolve({ data: {} });
                $rootScope.$apply();
            });
            
            it("THEN, the screenInfo.isInfoOpened is set correctly", () => {
                expect(vm.screenInfo.isInfoOpened).toBeTruthy();
            });
            it("THEN, the screenInfo.selectedEntityId is set correctly", () => {
                expect(vm.listVm.selectEntity).toHaveBeenCalledWith("bf70c80f-3b76-8jf8-bef4-8kreb1d4aa60");
            });
        });
        describe("WHEN the refresh method is called AND there is a mainFlowStateParam AND the item is not visible anymore (case when archive)", () => {
            beforeEach(() => {
                let _defNextPage = $q.defer();

                spyOn(vm.listVm, "loadIds").and.returnValue(_deferred.promise);
                spyOn(vm.listVm, "loadNextPage").and.returnValue(_defNextPage.promise);
                spyOn(vm.listVm, "selectEntity");
                spyOn(vm.listVm.ids, "indexOf").and.returnValue(-1);
                vm.refresh();

                _deferred.resolve(new ap.services.apiHelper.ApiResponse({}));
                $rootScope.$apply();

                _defNextPage.resolve({ data: {} });
                $rootScope.$apply();
            });

            it("THEN, the screenInfo.isInfoOpened is set correctly", () => {
                expect(vm.screenInfo.isInfoOpened).toBeFalsy();
            });
            it("THEN, the screenInfo.selectedEntityId is set correctly", () => {
                expect(vm.listVm.selectEntity).toHaveBeenCalledWith("bf70c80f-3b76-8jf8-bef4-8kreb1d4aa60");
            });
        });

    });

    describe("Feature: The user clicks on the refresh button of the toolbar", () => {
        it("THEN refresh is called AND display is updated", () => {
            vm = <ap.viewmodels.projects.ProjectListViewModel>$controller("projectsViewModel", { $scope: $scope });
            spyOn(vm, "refresh").and.callThrough();

            vm.screenInfo.actionClick("refreshprojects");

            expect(vm.refresh).toHaveBeenCalled();
        });
    });

    describe("Feature: acceptSelection", () => {
        let myProjVm: any;
        let selectedVm: any;
        let project: ap.models.projects.Project;
        beforeEach(() => {

            project = new ap.models.projects.Project(Utility);
            project.Name = "My project";
            project.Code = "PR1";
            project.StartDate = new Date();
            project.EndDate = new Date();
            project.LogoUrl = "pr1.png";
            project.Address = "New York";
            project.ZipCode = "123123";
            project.UserAccessRight = new ap.models.accessRights.ProjectAccessRight(Utility);
            project.UserAccessRight.createByJson({
                CanEdit: true
            });

            myProjVm = {
                originalEntity: project
            };

            let mainflow: ap.controllers.MainFlowStateParam = new ap.controllers.MainFlowStateParam(Utility);
            let infoView: ap.misc.ViewInfo = new ap.misc.ViewInfo(Utility);
            infoView.isInfoOpened = true;
            infoView.selectedEntityId = "bf70c80f-3b76-8jf8-bef4-8kreb1d4aa60";
            mainflow.addView(infoView);

            specHelper.general.spyProperty(ap.controllers.UIStateController.prototype, "mainFlowStateParam", specHelper.PropertyAccessor.Get).and.returnValue(mainflow);
            spyOn(Api, "getApiResponse").and.returnValue($q.defer().promise);
            vm = <ap.viewmodels.projects.ProjectListViewModel>$controller("projectsViewModel", { $scope: $scope });
        
            specHelper.general.spyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get).and.callFake(() => {
                return selectedVm;
            });
            spyOn(MainController, "currentProject");

        });
        afterEach(() => {
            specHelper.general.offSpyProperty(ap.controllers.UIStateController.prototype, "mainFlowStateParam", specHelper.PropertyAccessor.Get);
            specHelper.general.offSpyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get);
        });
        describe("WHEN project info isOpened AND acceptSelection is called", () => {
            it("THEN MainController.currentProject is not called", () => {
                selectedVm = myProjVm;
                vm.toggleRight(<ap.models.projects.Project>selectedVm.originalEntity);

                vm.acceptSelection();
                expect(MainController.currentProject).not.toHaveBeenCalled();
                expect(vm.listVm.selectedViewModel.originalEntity.Id).toEqual((<ap.models.projects.Project>selectedVm.originalEntity).Id);
            });
        });
        describe("GIVEN a selected viewModel in the listVm WHEN acceptSelection is called", () => {
            it("THEN MainController.currentProject is called with the project of the selected viewmodel from the list", () => {
                let def = $q.defer();
                spyOn(ServicesManager.projectService, "getProjectDetailInformation").and.returnValue(def.promise);
                

                selectedVm = myProjVm;

                vm.acceptSelection();
                def.resolve(new ap.services.apiHelper.ApiResponse(myProjVm.originalEntity));
                $rootScope.$apply();
                expect(MainController.currentProject).toHaveBeenCalledWith(myProjVm.originalEntity);

            });
        });
        describe("GIVEN NO selected viewModel in the listVm WHEN acceptSelection is called", () => {
            it("THEN MainController.currentProject is NOT called (nothing happens)", () => {
                selectedVm = null;
                vm.acceptSelection();
                expect(MainController.currentProject).not.toHaveBeenCalled();
            });
        });
        describe("WHEN acceptSelection is called with a specific Id", () => {
            beforeEach(() => {
                spyOn(vm.listVm, "selectEntity");
                selectedVm = myProjVm;
                vm.acceptSelection("542");
            });
            it("THEN, selectEntity is called with this id", () => {

                expect(vm.listVm.selectEntity).toHaveBeenCalledWith("542");

            });
            it("THEN, the current project is called with the project of the selectedViewModel", () => {
                expect(MainController.currentProject).toHaveBeenCalledWith(myProjVm.originalEntity);
            });

        });
    });

    describe("Feature: The user clicks on the list view of the toolbar", () => {
        it("THEN toggleView is called AND display is now in grid", () => {
            vm = <ap.viewmodels.projects.ProjectListViewModel>$controller("projectsViewModel", { $scope: $scope });
            spyOn(vm, "toggleView").and.callThrough();

            vm.screenInfo.actionClick("groupprojectlist");

            expect(vm.toggleView).toHaveBeenCalled();
        });
    });

    describe("Feature: The user clicks on the grid view of the toolbar", () => {
        it("THEN toggleView is called AND display is now in list", () => {
            vm = <ap.viewmodels.projects.ProjectListViewModel>$controller("projectsViewModel", { $scope: $scope });
            spyOn(vm, "toggleView").and.callThrough();

            vm.screenInfo.actionClick("groupprojectgrid");

            expect(vm.toggleView).toHaveBeenCalled();
        });
    });

    describe("Feature: toggleView", () => {

        describe("WHEN toggleView is called", () => {
            it("THEN from true, it becomes false and Storage.Local 'project.view' is called with grid or thumb", () => {
                spyOn(Utility.Storage.Local, "get").and.returnValue(null);

                vm = <ap.viewmodels.projects.ProjectListViewModel>$controller("projectsViewModel", { $scope: $scope });
                vm.toggleView();
                expect(vm.isThumbView).toBeFalsy();
                MainController.getMainAction("groupprojectlist").isVisible = false;
                MainController.getMainAction("groupprojectgrid").isVisible = true;
                expect(Utility.Storage.Local.set).toHaveBeenCalledWith("project.view", ap.viewmodels.projects.View.Grid);
                vm.toggleView();
                expect(vm.isThumbView).toBeTruthy();
                MainController.getMainAction("groupprojectlist").isVisible = true;
                MainController.getMainAction("groupprojectgrid").isVisible = false;
                expect(Utility.Storage.Local.set).toHaveBeenCalledWith("project.view", ap.viewmodels.projects.View.Thumb);
            });
            it("THEN data reload by calling refresh", () => {
                vm = <ap.viewmodels.projects.ProjectListViewModel>$controller("projectsViewModel", { $scope: $scope });
                spyOn(vm, "refresh");
                vm.toggleView();

                expect(vm.refresh).toHaveBeenCalled();
            });
        });
        describe("WHEN the viewModel is created and Session contains grid", () => {
            it("THEN, the isThumbView is initialized with Storage.Local with key project.view and isThumbView returns the found value", () => {
                spyOn(Utility.Storage.Local, "get").and.callFake(function (args) {
                    if (args === 'project.view')
                        return ap.viewmodels.projects.View.Grid;
                    return null;
                });

                vm = <ap.viewmodels.projects.ProjectListViewModel>$controller("projectsViewModel", { $scope: $scope });
                expect(vm.isThumbView).toBeFalsy();
                expect(Utility.Storage.Local.get).toHaveBeenCalledWith("project.view");
            });
        });
        describe("WHEN the viewModel is created and Session contains thumb", () => {
            it("THEN, the isThumbView is initialized with Storage.Local with key project.view and isThumbView returns the found value", () => {
                spyOn(Utility.Storage.Local, "get").and.callFake(function (args) {
                    if (args === 'project.view')
                        return ap.viewmodels.projects.View.Thumb;
                    return null;
                });

                vm = <ap.viewmodels.projects.ProjectListViewModel>$controller("projectsViewModel", { $scope: $scope });
                expect(vm.isThumbView).toBeTruthy();
                expect(Utility.Storage.Local.get).toHaveBeenCalledWith("project.view");
            });
        });
    });

    describe("Feature: filterchanged of mainsearch", () => {
        let filter: string;
        beforeEach(() => {
            UIStateController.changeFlowState(ap.controllers.MainFlow.Projects);
        });
        describe("WHEN filterchanged event is raised from the mainseaerch ", () => {
            beforeEach(() => {
                filter = "Filter.FilterChanged";
                vm = <ap.viewmodels.projects.ProjectListViewModel>$controller("projectsViewModel", { $scope: $scope });
                spyOn(vm.listVm, "loadIds").and.returnValue($q.defer().promise);
                specHelper.general.spyProperty(ap.misc.MainSearchInfo.prototype, "filterString", specHelper.PropertyAccessor.Get).and.returnValue(filter);
                specHelper.general.raiseEvent(vm.screenInfo.mainSearchInfo, "criterionschanged", filter);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.misc.MainSearchInfo.prototype, "filterString", specHelper.PropertyAccessor.Get);
            });
            it("THEN, data is loaded from the server side using the filterstring of the main Search", () => {
                expect(vm.listVm.loadIds).toHaveBeenCalledWith(filter, null);
            });
        });
        describe("WHEN the filter is avtive  ", () => {
            beforeEach(() => {
                filter = "Filter.isTrue(isActive)";
                specHelper.general.spyProperty(ap.misc.MainSearchInfo.prototype, "filterString", specHelper.PropertyAccessor.Get).and.returnValue(filter);
                vm = <ap.viewmodels.projects.ProjectListViewModel>$controller("projectsViewModel", { $scope: $scope });
                spyOn(vm.listVm, "loadIds").and.returnValue($q.defer().promise);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.misc.MainSearchInfo.prototype, "filterString", specHelper.PropertyAccessor.Get);
            });
            it("THEN hasActiveFilter = true", () => {
                expect(vm.hasActiveFilter).toEqual(true);
            });
        });
        describe("WHEN the filter is archived", () => {
            beforeEach(() => {
                filter = "Filter.isFalse(isActive)";
                specHelper.general.spyProperty(ap.misc.MainSearchInfo.prototype, "criterions", specHelper.PropertyAccessor.Get).and.returnValue([{ predefinedFilter: { name: "Archived" } }]);
                specHelper.general.spyProperty(ap.misc.MainSearchInfo.prototype, "filterString", specHelper.PropertyAccessor.Get).and.returnValue(filter);
                vm = <ap.viewmodels.projects.ProjectListViewModel>$controller("projectsViewModel", { $scope: $scope });
                spyOn(vm.listVm, "loadIds").and.returnValue($q.defer().promise);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.misc.MainSearchInfo.prototype, "filterString", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.misc.MainSearchInfo.prototype, "criterions", specHelper.PropertyAccessor.Get)
            });
            it("THEN hasActiveFilter = false", () => {
                expect(vm.hasActiveFilter).toEqual(false);
            });
        });
        describe("WHEN the filter is null", () => {
            beforeEach(() => {
                filter = null;
                specHelper.general.spyProperty(ap.misc.MainSearchInfo.prototype, "filterString", specHelper.PropertyAccessor.Get).and.returnValue(filter);
                vm = <ap.viewmodels.projects.ProjectListViewModel>$controller("projectsViewModel", { $scope: $scope });
                spyOn(vm.listVm, "loadIds").and.returnValue($q.defer().promise);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.misc.MainSearchInfo.prototype, "filterString", specHelper.PropertyAccessor.Get);
            });
            it("THEN hasActiveFilter = null", () => {
                expect(vm.hasActiveFilter).toEqual(null);
            });
        });
    });

    describe("Feature: refresh list when the filter changes", () => {
        beforeEach(() => {
            vm = <ap.viewmodels.projects.ProjectListViewModel>$controller("projectsViewModel", { $scope: $scope });
        });
        describe("WHEN the MainFlow changes", () => {
            it("THEN, the events unregisters", () => {
                let spy = spyOn(vm.screenInfo.mainSearchInfo, "off");

                UIStateController.changeFlowState(ap.controllers.MainFlow.Projects);
                expect(spy.calls.argsFor(0)[0]).toBe("filterchanged");
            });
        });

    });

    describe("Feature: load list of project", () => {
        let defApi: ng.IDeferred<any>;
        beforeEach(() => {
            defApi = $q.defer();
            spyOn(Api, "getApiResponse").and.callFake(function (url, method) {
                if (url.indexOf("rest/projectsids") === 0 && method === ap.services.apiHelper.MethodType.Get)
                    return defApi.promise;
                return null;
            });
            vm = <ap.viewmodels.projects.ProjectListViewModel>$controller("projectsViewModel", { $scope: $scope });

        });
        describe("WHEN the controller is created AND the scope is loaded", () => {
            let projects: ap.models.projects.Project[];
            beforeEach(() => {
                projects = [];
                for (let i = 0; i < dataProjs.length; i++) {
                    let project = new ap.models.projects.Project(Utility);
                    project.createByJson(dataProjs[i]);
                    projects.push(project);
                }
            });
            it("THEN, the data are loaded with projectItemVm correctly build", () => {
                specHelper.utility.stubRootUrl(Utility);

                let stub = ap.specHelper.viewModel.VmSpecHelper.genericPagedListVm.stubLoadNextPage(vm.listVm, Api, $q, Utility);

                defApi.resolve({ data: idsProj });
                $rootScope.$apply();


                stub.resolveLoadPage({ data: projects });
                $rootScope.$apply();

                expect(vm.listVm.sourceItems.length).toBe(4);
            });
        });

        describe("WHEN $destroy is called", () => {

            beforeEach(() => {
                vm = <ap.viewmodels.projects.ProjectListViewModel>$controller("projectsViewModel", { $scope: $scope });

                $scope.$destroy();
            });

            it("THEN the screen info is destroy", () => {
                expect(vm.screenInfo).toBeNull();
            });
        });
    });

    describe("Feature: toggleRight", () => {
        let project: ap.models.projects.Project;
        let project1: ap.models.projects.Project;
        let def: angular.IDeferred<any>;
        beforeEach(() => {
            project = new ap.models.projects.Project(Utility);
            project.Name = "My project";
            project.Code = "PR1";
            project.StartDate = new Date();
            project.EndDate = new Date();
            project.LogoUrl = "pr1.png";
            project.Address = "New York";
            project.ZipCode = "123123";
            project.UserAccessRight = new ap.models.accessRights.ProjectAccessRight(Utility);
            project.UserAccessRight.createByJson({
                CanEdit: true
            });

            project1 = new ap.models.projects.Project(Utility);
            project1.Name = "My second project";
            project1.Code = "PR11";
            project1.StartDate = new Date();
            project1.EndDate = new Date();
            project1.LogoUrl = "pr1.png";
            project1.Address = "New York";
            project1.ZipCode = "123123";
            project1.UserAccessRight = new ap.models.accessRights.ProjectAccessRight(Utility);
            project1.UserAccessRight.createByJson({
                CanEdit: true
            });

            let mainflow: ap.controllers.MainFlowStateParam = new ap.controllers.MainFlowStateParam(Utility);
            let infoView: ap.misc.ViewInfo = new ap.misc.ViewInfo(Utility);
            infoView.isInfoOpened = true;
            infoView.selectedEntityId = "bf70c80f-3b76-8jf8-bef4-8kreb1d4aa60";
            mainflow.addView(infoView);

            specHelper.general.spyProperty(ap.controllers.UIStateController.prototype, "mainFlowStateParam", specHelper.PropertyAccessor.Get).and.returnValue(mainflow);

            vm = <ap.viewmodels.projects.ProjectListViewModel>$controller("projectsViewModel", { $scope: $scope });
            spyOn(ServicesManager.projectService, "getProjectDetailCountry").and.returnValue($q.defer().promise);
        });
        afterEach(() => {
            specHelper.general.offSpyProperty(ap.controllers.UIStateController.prototype, "mainFlowStateParam", specHelper.PropertyAccessor.Get);
        });
        describe("WHEN toogleRight called with selected project and isProjectInfoOpened = false", () => {
            beforeEach(() => {
                vm.toggleRight(project);
            });
            it("THEN, check _projectInfoVm is init AND isProjectInfoOpened to be true", () => {
                expect(vm.isProjectInfoOpened).toBeTruthy();
                expect(vm.projectInfoVm instanceof ap.viewmodels.projects.ProjectDetailViewModel).toBeTruthy();
                expect(vm.screenInfo.selectedEntityId).toEqual(project.Id);
            });
        });
        describe("WHEN toogleRight called with selected project and isProjectInfoOpened = true", () => {
            beforeEach(() => {
                vm.toggleRight(project);
            });
            it("THEN, check _projectInfoVm is init AND isProjectInfoOpened to be true", () => {
                vm.toggleRight(project1);
                expect(vm.isProjectInfoOpened).toBeTruthy();
                expect(vm.projectInfoVm instanceof ap.viewmodels.projects.ProjectDetailViewModel).toBeTruthy();
                expect(vm.screenInfo.selectedEntityId).toEqual(project1.Id);
            });
        });
        describe("WHEN toogleRight called without project", () => {
            beforeEach(() => {
                vm.toggleRight();
            });
            it("THEN, check _projectInfoVm AND isProjectInfoOpened to be false", () => {
                expect(vm.isProjectInfoOpened).toBeFalsy();
                expect(vm.screenInfo.selectedEntityId).toBeNull();
            });
        });
    });

    describe("Feature: handleAddActionClick", () => {
        let newProject: ap.models.projects.Project
        beforeEach(() => {
            vm = <ap.viewmodels.projects.ProjectListViewModel>$controller("projectsViewModel", { $scope: $scope });
            spyOn(MainController, "currentProject");
            newProject = new ap.models.projects.Project(Utility);
        });
        describe("WHEN addaction is valid", () => {
            beforeEach(() => {
                let addAction = new ap.controllers.AddActionClickEvent("project.addproject");
                specHelper.general.raiseEvent(vm.screenInfo, "addactionclicked", addAction);
            });
            it("THEN currentProject is called with correct params", () => {
                expect((<jasmine.Spy>MainController.currentProject).calls.argsFor(0)[1]).toEqual(ap.controllers.MainFlow.ProjectConfig);
            });
        });
        describe("WHEN addaction is NOT valid", () => {
            beforeEach(() => {
                specHelper.general.raiseEvent(vm.screenInfo, "addactionclicked", null);
            });
            it("THEN currentProject is not called", () => {
                expect(MainController.currentProject).not.toHaveBeenCalled();
            });
        });
    });

    describe("Feature: selectedprojectchanged", () => {
        let projectItemVm: ap.viewmodels.projects.ProjectItemViewModel;
        let project: ap.models.projects.Project;
        beforeEach(() => {
            spyOn(ServicesManager.projectService, "getProjectDetailCountry").and.returnValue($q.defer().promise);
            vm = <ap.viewmodels.projects.ProjectListViewModel>$controller("projectsViewModel", { $scope: $scope });
            spyOn(MainController, "currentProject");
            projectItemVm = new ap.viewmodels.projects.ProjectItemViewModel(Utility, $q);
            project = new ap.models.projects.Project(Utility);
            project.createByJson({Id: "123"});
            projectItemVm.init(project);
            vm.screenInfo.isInfoOpened = true;
        });
        describe("WHEN the selected project changes and isInfoOpened is true", () => {
            describe("AND is not null", () => {
                beforeEach(() => {
                    specHelper.general.spyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get).and.returnValue(projectItemVm);
                    specHelper.general.raiseEvent(vm.listVm, "selectedItemChanged", projectItemVm);
                });
                afterEach(() => {
                    specHelper.general.offSpyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get);
                });
                it("THEN the projectDetailVm is updated", () => {
                    expect(vm.projectInfoVm).toBeDefined();
                    expect(vm.screenInfo.selectedEntityId).toEqual("123");
                });
            });
            describe("AND is null", () => {
                beforeEach(() => {
                    specHelper.general.spyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get).and.returnValue(null);
                    specHelper.general.raiseEvent(vm.listVm, "selectedItemChanged", null);
                });
                afterEach(() => {
                    specHelper.general.offSpyProperty(ap.viewmodels.BaseListEntityViewModel.prototype, "selectedViewModel", specHelper.PropertyAccessor.Get);
                });
                it("THEN the projectDetailVm is updated", () => {
                    expect(vm.projectInfoVm.name).toBe(undefined);
                    expect(vm.screenInfo.selectedEntityId).toBeUndefined();
                });
            });
        });
    });
});