describe("Module ap-viewmodels - project detail", () => {
    let nmp = ap.viewmodels.projects,
        ControllersManager: ap.controllers.ControllersManager,
        ServicesManager: ap.services.ServicesManager,
        Utility: ap.utility.UtilityHelper,
        Api: ap.services.apiHelper.Api,
        UserContext: ap.utility.UserContext,
        UIStateController: ap.controllers.UIStateController,
        $controller: angular.IControllerService,
        $rootScope: angular.IRootScopeService,
        $scope: angular.IScope,
        $q: angular.IQService,
        $timeout: angular.ITimeoutService,
        $compile: angular.ICompileService;
    let project: ap.models.projects.Project;
    let item: ap.viewmodels.projects.ProjectDetailViewModel;
    let deferProjectCountry: angular.IDeferred<any>;
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
        $q = _$q_;
        ServicesManager = _ServicesManager_,
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $timeout = _$timeout_;
        $controller = _$controller_;
        $scope = $rootScope.$new();
        specHelper.utility.stubRootUrl(Utility);
        specHelper.utility.stubUserConnected(Utility);
        Utility.Storage.Session.clear();
        specHelper.utility.stubStorageSet(Utility);

        let country: ap.models.identFiles.Country = new ap.models.identFiles.Country(Utility);
        country.createByJson({ Iso: 'BEL', Name: 'Belgium' });

        project = new ap.models.projects.Project(Utility);
        project.createByJson({});
        project.Name = "My project";
        project.Code = "PRO1";
        project.StartDate = new Date();
        project.EndDate = null;
        project.LogoUrl = "pr1.png";
        project.Address = "New York";
        project.Cover = new ap.models.documents.Document(Utility);
        project.Cover.Status = ap.models.documents.DocumentStatus.Processed;
        project.Country = country;
        project.ZipCode = "123123";
        project.UserAccessRight = new ap.models.accessRights.ProjectAccessRight(Utility);
        project.UserAccessRight.createByJson({
            CanEdit: true,
            CanConfig: true
        });
        project.Creator = new ap.models.actors.User(Utility);
        project.Creator.createByJson({
            Id: "test-user-id"
        });

        spyOn(Utility.Translator, "getTranslation").and.callFake(function (key) {
            if (key === "app.projectDetail.nameChanged")
                return "You have updated the name of the project. Do you want APROPLAN to change the project code to <4 first letters of the new project's name>?";
            if (key === "Update project code accordingly")
                return "Update project code accordingly";
        });
        deferProjectCountry = $q.defer();
        spyOn(ServicesManager.projectService, "getProjectDetailCountry").and.returnValue(deferProjectCountry.promise);
    }));

    describe("Feature: Constructor", () => {
        describe("WHEN isForEditProject = true", () => {
            beforeEach(() => {
                spyOn(ControllersManager.mainController, "currentProject").and.returnValue(project);
                item = new ap.viewmodels.projects.ProjectDetailViewModel(Utility, $q, $timeout, ControllersManager, ServicesManager, true);
                deferProjectCountry.resolve(new ap.services.apiHelper.ApiResponse(project));
                $rootScope.$apply();
            });
            it("THEN, currentProject is called", () => {
                expect(ControllersManager.mainController.currentProject).toHaveBeenCalled();
            });
        });
        describe("WHEN isForEditProject = false", () => {
            beforeEach(() => {
                spyOn(ControllersManager.mainController, "currentProject").and.returnValue(project);
                item = new ap.viewmodels.projects.ProjectDetailViewModel(Utility, $q, $timeout, ControllersManager, ServicesManager);
                deferProjectCountry.resolve(new ap.services.apiHelper.ApiResponse(project));
                $rootScope.$apply();
            });
            it("THEN, currentProject is not called", () => {
                expect(ControllersManager.mainController.currentProject).not.toHaveBeenCalled();
            });
        });
        describe("WHEN the current project is new", () => {
            beforeEach(() => {
                project = new ap.models.projects.Project(Utility);
                project.Creator = Utility.UserContext.CurrentUser();

                spyOn(Api, "getEntityList").and.returnValue($q.defer().promise);
                spyOn(ControllersManager.mainController, "currentProject").and.returnValue(project);
                item = new ap.viewmodels.projects.ProjectDetailViewModel(Utility, $q, $timeout, ControllersManager, ServicesManager, true);
                deferProjectCountry.resolve(new ap.services.apiHelper.ApiResponse(project));
                $rootScope.$apply();
            });
            it("THEN, the items has default values correctly built with logoPath build on logoUrl", () => {
                expect(item.screenInfo.isEditMode).toBeTruthy();
            });
        });
        describe("WHEN an item is created with a project and LogoUrl defined", () => {
            beforeEach(() => {
                spyOn(ControllersManager.mainController, "currentProject").and.returnValue(project);
                item = new ap.viewmodels.projects.ProjectDetailViewModel(Utility, $q, $timeout, ControllersManager, ServicesManager, true);
                deferProjectCountry.resolve(new ap.services.apiHelper.ApiResponse(project));
                $rootScope.$apply();
            });
            it("THEN, the items has default values correctly built with logoPath build on logoUrl", () => {
                expect(item.name).toBe(project.Name);
                expect(item.code).toBe(project.Code);
                expect(item.startDate).toBe(project.StartDate);
                expect(item.endDate).toBe(project.EndDate);
                expect(item.address).toBe(project.Address);
                expect(item.city).toBe(project.City);
                expect(item.zipCode).toBe(project.ZipCode);
                expect(item.selectedCountry.originalCountry).toBe(project.Country);
                expect(item.startDateFormatted).toBe(project.StartDate.format(DateFormat.Standard));
                expect(item.endDateFormatted).toBe("");
                expect(item.logoPath).toBe(Utility.apiUrl + "ProjectImages/Logo/" + project.Id + "/" + project.LogoUrl);
                expect(item.screenInfo).toBeDefined();
                expect(item.countrySelector).toBeUndefined();
                expect(item.selectedCountry).toBeDefined();
            });
            it("THEN, the actions are correct", () => {
                expect(item.screenInfo.actions.length).toEqual(3);
                expect(item.screenInfo.actions[0].name).toEqual("detail.edit");
                expect(item.screenInfo.actions[1].name).toEqual("detail.save");
                expect(item.screenInfo.actions[2].name).toEqual("detail.cancel");
            });
        });
        describe("WHEN an item is created with a project and logoUrl not defined and Cover defined", () => {
            beforeEach(() => {
                Utility.UserContext.token = "ttt";
            });
            it("THEN, the items has default values correctly built with logoPath build on Cover bigthumb path", () => {
                project.LogoUrl = null;
                spyOn(ControllersManager.mainController, "currentProject").and.returnValue(project);
                item = new ap.viewmodels.projects.ProjectDetailViewModel(Utility, $q, $timeout, ControllersManager, ServicesManager, true);
                deferProjectCountry.resolve(new ap.services.apiHelper.ApiResponse(project));
                $rootScope.$apply();
                expect(item.name).toBe(project.Name);
                expect(item.code).toBe(project.Code);
                expect(item.startDate).toBe(project.StartDate);
                expect(item.endDate).toBe(project.EndDate);
                expect(item.address).toBe(project.Address);
                expect(item.city).toBe(project.City);
                expect(item.zipCode).toBe(project.ZipCode);
                expect(item.selectedCountry.originalCountry).toBe(project.Country);
                expect(item.logoPath).toBe(project.Cover.BigThumbUrl);
            });
        });
        describe("WHEN the Cover bigThumbsUrl contains the complete url already", () => {
            beforeEach(() => {
                project.LogoUrl = null;
                spyOn(ControllersManager.mainController, "currentProject").and.returnValue(project);
                item = new ap.viewmodels.projects.ProjectDetailViewModel(Utility, $q, $timeout, ControllersManager, ServicesManager, true);
                deferProjectCountry.resolve(new ap.services.apiHelper.ApiResponse(project));
                $rootScope.$apply();
            });
            it("THEN, the logoPath = bigThumbsUrl", () => {
                expect(item.logoPath).toBe(project.Cover.BigThumbUrl);
            });
        });

        describe("WHEN the Vm is initialized with a project", () => {
            let project: ap.models.projects.Project;
            beforeEach(() => {
                project = new ap.models.projects.Project(Utility);
                project.createByJson({
                    Id: "123",
                    Creator: new ap.models.actors.User(Utility)
                });
                item = new ap.viewmodels.projects.ProjectDetailViewModel(Utility, $q, $timeout, ControllersManager, ServicesManager, false);
                item.init(project);
                deferProjectCountry.resolve(new ap.services.apiHelper.ApiResponse(project));
                $rootScope.$apply();
            });
            it("THEN the projectActions are defined", () => {
                expect(item.projectActionVm).toBeDefined();
            });
            it("THEN getProjectDetailCountry is called", () => {
                expect(ServicesManager.projectService.getProjectDetailCountry).toHaveBeenCalledWith("123", true);
            });
        });
    });
    describe("Feature: actionClickedHandler", () => {
        let callback: any;
        beforeEach(() => {
            callback = jasmine.createSpy("callback");
        });
        describe("WHEN actionClickedHandler called with detail.edit", () => {
            beforeEach(() => {
                spyOn(ControllersManager.mainController, "currentProject").and.returnValue(project);
                item = new ap.viewmodels.projects.ProjectDetailViewModel(Utility, $q, $timeout, ControllersManager, ServicesManager, true);
                deferProjectCountry.resolve(new ap.services.apiHelper.ApiResponse(project));
                $rootScope.$apply();
                item.on("editmodechanged", callback, this);
                specHelper.general.raiseEvent(item.screenInfo, "actionclicked", "detail.edit");
            });
            it("THEN, countrySelector is defined", () => {
                expect(item.countrySelector).toBeDefined();
            });
            it("THEN, selectedCountry is defined", () => {
                expect(item.selectedCountry).toBeDefined();
            });
            it("THEN, screenInfo.isEditMode = true", () => {
                expect(item.screenInfo.isEditMode).toBeTruthy();
            });
            it("THEN, editmodechanged is raised", () => {
                expect(callback).toHaveBeenCalled();
            });
        });
        describe("WHEN actionClickedHandler called with detail.edit several times", () => {
            let def: any;
            beforeEach(() => {
                spyOn(ControllersManager.mainController, "currentProject").and.returnValue(project);
                item = new ap.viewmodels.projects.ProjectDetailViewModel(Utility, $q, $timeout, ControllersManager, ServicesManager, true);
                deferProjectCountry.resolve(new ap.services.apiHelper.ApiResponse(project));
                $rootScope.$apply();
                def = $q.defer();
                spyOn(ControllersManager.mainController, "getAvailableCountries").and.returnValue(def.promise);
                item.on("editmodechanged", callback, this);
                specHelper.general.raiseEvent(item.screenInfo, "actionclicked", "detail.edit");
                specHelper.general.raiseEvent(item.screenInfo, "actionclicked", "detail.edit");
                specHelper.general.raiseEvent(item.screenInfo, "actionclicked", "detail.edit");
            });
            it("THEN, countrySelector is defined", () => {
                expect(item.countrySelector).toBeDefined();
            });
            it("THEN, selectedCountry is defined", () => {
                expect(item.selectedCountry).toBeDefined();
            });
            it("THEN, screenInfo.isEditMode = true", () => {
                expect(item.screenInfo.isEditMode).toBeTruthy();
            });
            it("THEN, editmodechanged is raised", () => {
                expect(callback).toHaveBeenCalled();
            });
            it("THEN, the countries are loaded once", () => {
                expect((<jasmine.Spy>ControllersManager.mainController.getAvailableCountries).calls.count()).toEqual(1);
            });
        });
        describe("WHEN actionClickedHandler called with detail.save", () => {
            beforeEach(() => {
                spyOn(ControllersManager.mainController, "currentProject").and.returnValue(project);
                item = new ap.viewmodels.projects.ProjectDetailViewModel(Utility, $q, $timeout, ControllersManager, ServicesManager, true);
                deferProjectCountry.resolve(new ap.services.apiHelper.ApiResponse(project));
                $rootScope.$apply();
                spyOn(item, "save");
                specHelper.general.raiseEvent(item.screenInfo, "actionclicked", "detail.save");
            });
            it("THEN, save is called", () => {
                expect(item.save).toHaveBeenCalled();
            });
        });
        describe("WHEN actionClickedHandler called with detail.cancel", () => {
            beforeEach(() => {
                spyOn(ControllersManager.mainController, "currentProject").and.returnValue(project);
                item = new ap.viewmodels.projects.ProjectDetailViewModel(Utility, $q, $timeout, ControllersManager, ServicesManager, true);
                deferProjectCountry.resolve(new ap.services.apiHelper.ApiResponse(project));
                $rootScope.$apply();
                spyOn(item, "cancel");
                item.on("editmodechanged", callback, this);
                specHelper.general.raiseEvent(item.screenInfo, "actionclicked", "detail.cancel");
            });
            it("THEN, screenInfo.isEditMode = false", () => {
                expect(item.screenInfo.isEditMode).toBeFalsy();
            });
            it("THEN, editmodechanged is raised", () => {
                expect(callback).toHaveBeenCalled();
            });
        });
    });
    describe("Feature: save", () => {
        let country: ap.models.identFiles.Country;
        let selectedCountry: ap.viewmodels.identificationfiles.country.CountryViewModel;
        let projectModified: ap.models.projects.Project;
        let def: any;
        let defer: any;
        let sourceLogoPath: string;
        let files: File[];
        let file: File;
        beforeEach(() => {
            def = $q.defer();
            defer = $q.defer();
            selectedCountry = new ap.viewmodels.identificationfiles.country.CountryViewModel(Utility);
            country = new ap.models.identFiles.Country(Utility);
            country.createByJson({ Iso: 'POL', Name: 'Portugal' })
            projectModified = project;
            projectModified.Country = country;
            spyOn(ControllersManager.projectController, "saveProjectInfo").and.returnValue(defer.promise);
            specHelper.general.spyProperty(ap.viewmodels.projects.ProjectDetailViewModel.prototype, "selectedCountry", specHelper.PropertyAccessor.Get).and.returnValue(selectedCountry);
            specHelper.general.spyProperty(ap.viewmodels.identificationfiles.country.CountryViewModel.prototype, "originalCountry", specHelper.PropertyAccessor.Get).and.returnValue(country);
            spyOn(ControllersManager.projectController, "deleteProjectLogo").and.returnValue(def.promise);
        });
        afterEach(() => {
            specHelper.general.offSpyProperty(ap.viewmodels.projects.ProjectDetailViewModel.prototype, "selectedCountry", specHelper.PropertyAccessor.Get);
            specHelper.general.offSpyProperty(ap.viewmodels.identificationfiles.country.CountryViewModel.prototype, "originalCountry", specHelper.PropertyAccessor.Get);
        });
        describe("WHEN _needDeleteLogo = true", () => {
            beforeEach(() => {
                spyOn(ControllersManager.mainController, "currentProject").and.returnValue(project);
                item = new ap.viewmodels.projects.ProjectDetailViewModel(Utility, $q, $timeout, ControllersManager, ServicesManager, true);
                deferProjectCountry.resolve(new ap.services.apiHelper.ApiResponse(project));
                $rootScope.$apply();
                specHelper.general.spyProperty(ap.viewmodels.projects.ProjectDetailViewModel.prototype, "logoPath", specHelper.PropertyAccessor.Get).and.returnValue(item.defaultLogo);
                item.postChanges();
                specHelper.general.raiseEvent(item.screenInfo, "actionclicked", "detail.save");
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.projects.ProjectDetailViewModel.prototype, "logoPath", specHelper.PropertyAccessor.Get);
            });
            it("THEN, postChanges is called", () => {
                expect(project.Country).toEqual(country);
            });
            it("THEN, saveProjectInfo is called with correct params", () => {
                expect(ControllersManager.projectController.saveProjectInfo).toHaveBeenCalledWith(projectModified);
            });
            it("THEN, deleteProjectLogo is called with correct params", () => {
                expect(ControllersManager.projectController.deleteProjectLogo).toHaveBeenCalledWith(projectModified);
            });
        });
        describe("WHEN _needDeleteLogo = false", () => {
            beforeEach(() => {
                spyOn(ControllersManager.mainController, "currentProject").and.returnValue(project);
                item = new ap.viewmodels.projects.ProjectDetailViewModel(Utility, $q, $timeout, ControllersManager, ServicesManager, true);
                deferProjectCountry.resolve(new ap.services.apiHelper.ApiResponse(project));
                $rootScope.$apply();
                specHelper.general.raiseEvent(item.screenInfo, "actionclicked", "detail.save");
            });
            it("THEN, postChanges is called", () => {
                expect(project.Country).toEqual(country);
            });
            it("THEN, saveProjectInfo is called with correct params", () => {
                expect(ControllersManager.projectController.saveProjectInfo).toHaveBeenCalledWith(projectModified);
            });
            it("THEN, deleteProjectLogo is not called", () => {
                expect(ControllersManager.projectController.deleteProjectLogo).not.toHaveBeenCalled();
            });
        });
        describe("WHEN newLogo = true", () => {
            describe("WHEN project is not new", () => {
                beforeEach(() => {
                    spyOn(ControllersManager.mainController, "currentProject").and.returnValue(project);
                    item = new ap.viewmodels.projects.ProjectDetailViewModel(Utility, $q, $timeout, ControllersManager, ServicesManager, true);
                    deferProjectCountry.resolve(new ap.services.apiHelper.ApiResponse(project));
                    $rootScope.$apply();
                    files = [];
                    file = new File(["Data"], "path.jpg", { type: "image/png" });
                    files.push(file);
                    item.changeLogo(files);
                    spyOn(item, "postChanges").and.callThrough();
                    defer = $q.defer();
                    sourceLogoPath = Utility.apiUrl + "ProjectImages/Logo/" + project.Id + "/" + file.name;
                    spyOn(ControllersManager.projectController, "uploadProjectLogo").and.returnValue(defer.promise);
                    specHelper.general.raiseEvent(item.screenInfo, "actionclicked", "detail.save");
                    defer.resolve();
                    $rootScope.$apply();
                });
                it("THEN, postChanges is called", () => {
                    expect(item.postChanges).toHaveBeenCalled();
                });
                it("THEN, saveProjectInfo is called with correct params", () => {
                    expect(ControllersManager.projectController.saveProjectInfo).toHaveBeenCalledWith(projectModified);
                });
                it("THEN, newLogo = null", () => {
                    expect(item.newLogo).toBeNull();
                });
                it("THEN, sourceLogoPath is updated", () => {
                    expect(item.logoPath).toEqual(sourceLogoPath);
                });
            });
            describe("WHEN project is new", () => {
                let d: any;
                beforeEach(() => {
                    d = $q.defer();
                    project = new ap.models.projects.Project(Utility);
                    spyOn(ControllersManager.mainController, "currentProject").and.returnValue(project);
                    spyOn(ControllersManager.mainController, "getAvailableCountries").and.returnValue(d.promise);
                    spyOn(ControllersManager.projectController, "createProject").and.returnValue(d.promise);
                    item = new ap.viewmodels.projects.ProjectDetailViewModel(Utility, $q, $timeout, ControllersManager, ServicesManager, true);
                    deferProjectCountry.resolve(new ap.services.apiHelper.ApiResponse(project));
                    $rootScope.$apply();
                    files = [];
                    file = new File(["Data"], "path.jpg", { type: "image/png" });
                    files.push(file);
                    item.changeLogo(files);
                    spyOn(item, "postChanges").and.callThrough();
                    defer = $q.defer();
                    sourceLogoPath = Utility.apiUrl + "ProjectImages/Logo/" + project.Id + "/" + file.name;
                    spyOn(ControllersManager.projectController, "uploadProjectLogo").and.returnValue(defer.promise);
                    item.save();
                    defer.resolve();
                    $rootScope.$apply();
                });
                it("THEN, saveProjectInfo is not called", () => {
                    expect(ControllersManager.projectController.saveProjectInfo).not.toHaveBeenCalled();
                });
                it("THEN, createProject is called", () => {
                    expect(ControllersManager.projectController.createProject).toHaveBeenCalledWith(project);
                });
            });
        });
        describe("WHEN newLogo = false", () => {
            beforeEach(() => {
                spyOn(ControllersManager.mainController, "currentProject").and.returnValue(project);
                item = new ap.viewmodels.projects.ProjectDetailViewModel(Utility, $q, $timeout, ControllersManager, ServicesManager, true);
                deferProjectCountry.resolve(new ap.services.apiHelper.ApiResponse(project));
                $rootScope.$apply();
                specHelper.general.raiseEvent(item.screenInfo, "actionclicked", "detail.save");
            });
            it("THEN, postChanges is called", () => {
                expect(project.Country).toEqual(country);
            });
            it("THEN, saveProjectInfo is called with correct params", () => {
                expect(ControllersManager.projectController.saveProjectInfo).toHaveBeenCalledWith(projectModified);
            });
        });
        describe("WHEN project is new", () => {
            beforeEach(() => {
                spyOn(Api, "getEntityList").and.returnValue($q.defer().promise);
                project = new ap.models.projects.Project(Utility);
                spyOn(ControllersManager.mainController, "currentProject").and.returnValue(project);
                item = new ap.viewmodels.projects.ProjectDetailViewModel(Utility, $q, $timeout, ControllersManager, ServicesManager, true);
                deferProjectCountry.resolve(new ap.services.apiHelper.ApiResponse(project));
                $rootScope.$apply();
                specHelper.general.raiseEvent(item.screenInfo, "actionclicked", "detail.save");
            });
            it("THEN, saveProjectInfo is not called", () => {
                expect(ControllersManager.projectController.saveProjectInfo).not.toHaveBeenCalled();
            });
        });

    });
    describe("Feature: cancel", () => {
        beforeEach(() => {
            spyOn(ControllersManager.mainController, "currentProject").and.returnValue(project);
            item = new ap.viewmodels.projects.ProjectDetailViewModel(Utility, $q, $timeout, ControllersManager, ServicesManager, true);
            deferProjectCountry.resolve(new ap.services.apiHelper.ApiResponse(project));
            $rootScope.$apply();
            item.zipCode = "000000";
            specHelper.general.raiseEvent(item.screenInfo, "actionclicked", "detail.cancel");
        });
        it("THEN, copySource is called", () => {
            expect(project.ZipCode).toEqual("123123");
        });
    });
    describe("Feature: nameChanged", () => {
        beforeEach(() => {
            spyOn(ControllersManager.mainController, "currentProject").and.returnValue(project);
        });
        describe("WHEN the four first char of project name are equal to code", () => {
            beforeEach(() => {
                spyOn(ControllersManager.mainController, "showConfirm");
                item = new ap.viewmodels.projects.ProjectDetailViewModel(Utility, $q, $timeout, ControllersManager, ServicesManager, true);
                deferProjectCountry.resolve(new ap.services.apiHelper.ApiResponse(project));
                $rootScope.$apply();
                item.name = "Pro1ject";
                item.nameChanged();
            });
            it("THEN, code stays the same", () => {
                expect(item.code).toEqual("PRO1");
            });
            it("THEN, showConfirm is not called", () => {
                expect(ControllersManager.mainController.showConfirm).not.toHaveBeenCalled();
            });
        });
        describe("WHEN the four first char of project name are NOT equal to code", () => {
            beforeEach(() => {
                item = new ap.viewmodels.projects.ProjectDetailViewModel(Utility, $q, $timeout, ControllersManager, ServicesManager, true);
                deferProjectCountry.resolve(new ap.services.apiHelper.ApiResponse(project));
                $rootScope.$apply();
            });
            describe("WHEN the user confirm", () => {
                beforeEach(() => {
                    spyOn(ControllersManager.mainController, "showConfirm").and.callFake(function (message, title, callbackConfirm) {
                        callbackConfirm(ap.controllers.MessageResult.Positive);
                    });
                    item.name = "Hello";
                    item.nameChanged();
                });
                it("THEN, code equal to the four first char of name", () => {
                    expect(item.code).toEqual("HELL");
                });
                it("THEN, showConfirm is called", () => {
                    expect(ControllersManager.mainController.showConfirm).toHaveBeenCalled();
                });
            });
            describe("WHEN the user don't confirm", () => {
                beforeEach(() => {
                    spyOn(ControllersManager.mainController, "showConfirm").and.callFake(function (message, title, callbackConfirm) {
                        callbackConfirm(ap.controllers.MessageResult.Negative);
                    });
                    item.name = "Hello";
                    item.nameChanged();
                });
                it("THEN, code stays the same", () => {
                    expect(item.code).toEqual("PRO1");
                });
                it("THEN, showConfirm is called", () => {
                    expect(ControllersManager.mainController.showConfirm).toHaveBeenCalled();
                });
            });
        });
    });
    describe("Feature: checkEditAccess", () => {
        describe("WHEN UserAccessRight.CanEdit == false", () => {
            beforeEach(() => {
                project.UserAccessRight.CanEdit = false;
            });
            describe("WHEN isEditMode == false", () => {
                beforeEach(() => {
                    spyOn(ControllersManager.mainController, "currentProject").and.returnValue(project);
                    item = new ap.viewmodels.projects.ProjectDetailViewModel(Utility, $q, $timeout, ControllersManager, ServicesManager, true);
                    deferProjectCountry.resolve(new ap.services.apiHelper.ApiResponse(project));
                    $rootScope.$apply();
                });
                it("THEN, editAction.isVisible = false", () => {
                    expect(item.screenInfo.actions[0].isVisible).toBeFalsy();
                });
                it("AND UserAccessRight.CanConfig == true THEN, editAction.isEnabled = true", () => {
                    expect(item.screenInfo.actions[0].isEnabled).toBeTruthy();
                });
                it("THEN, saveAction.isVisible = false", () => {
                    expect(item.screenInfo.actions[1].isVisible).toBeFalsy();
                });
                it("THEN, saveAction.isEnabled = false", () => {
                    expect(item.screenInfo.actions[1].isEnabled).toBeFalsy();
                });
                it("THEN, cancelAction.isVisible = false", () => {
                    expect(item.screenInfo.actions[2].isVisible).toBeFalsy();
                });
                it("THEN, cancelAction.isEnabled = false", () => {
                    expect(item.screenInfo.actions[2].isEnabled).toBeFalsy();
                });
            });
            describe("WHEN isEditMode == false", () => {
                beforeEach(() => {
                    project.UserAccessRight.CanConfig = false;
                    spyOn(ControllersManager.mainController, "currentProject").and.returnValue(project);
                    item = new ap.viewmodels.projects.ProjectDetailViewModel(Utility, $q, $timeout, ControllersManager, ServicesManager, true);
                    deferProjectCountry.resolve(new ap.services.apiHelper.ApiResponse(project));
                    $rootScope.$apply();
                });
                it("AND UserAccessRight.CanConfig == false THEN, editAction.isEnabled = false", () => {
                    expect(item.screenInfo.actions[0].isEnabled).toBeFalsy();
                });
            });
            describe("WHEN isEditMode == true", () => {
                beforeEach(() => {
                    spyOn(ControllersManager.mainController, "currentProject").and.returnValue(project);
                    item = new ap.viewmodels.projects.ProjectDetailViewModel(Utility, $q, $timeout, ControllersManager, ServicesManager, true);
                    deferProjectCountry.resolve(new ap.services.apiHelper.ApiResponse(project));
                    $rootScope.$apply();
                    specHelper.general.raiseEvent(item.screenInfo, "actionclicked", "detail.edit");
                });
                it("THEN, editAction.isVisible = false", () => {
                    expect(item.screenInfo.actions[0].isVisible).toBeFalsy();
                });
                it("AND UserAccessRight.CanConfig == true THEN, editAction.isEnabled = false", () => {
                    expect(item.screenInfo.actions[0].isEnabled).toBeFalsy();
                });
                it("THEN, saveAction.isVisible = true", () => {
                    expect(item.screenInfo.actions[1].isVisible).toBeTruthy();
                });
                it("THEN, saveAction.isEnabled = true", () => {
                    expect(item.screenInfo.actions[1].isEnabled).toBeFalsy();
                });
                it("THEN, cancelAction.isVisible = true", () => {
                    expect(item.screenInfo.actions[2].isVisible).toBeTruthy();
                });
                it("THEN, cancelAction.isEnabled = true", () => {
                    expect(item.screenInfo.actions[2].isEnabled).toBeTruthy();
                });
            });
            describe("WHEN isEditMode == true", () => {
                beforeEach(() => {
                    project.UserAccessRight.CanConfig = false;
                    spyOn(ControllersManager.mainController, "currentProject").and.returnValue(project);
                    item = new ap.viewmodels.projects.ProjectDetailViewModel(Utility, $q, $timeout, ControllersManager, ServicesManager, true);
                    deferProjectCountry.resolve(new ap.services.apiHelper.ApiResponse(project));
                    $rootScope.$apply();
                    specHelper.general.raiseEvent(item.screenInfo, "actionclicked", "detail.edit");
                });
                it("AND UserAccessRight.CanConfig == false THEN, editAction.isEnabled = false", () => {
                    expect(item.screenInfo.actions[0].isEnabled).toBeFalsy();
                });
            });
        });
        describe("WHEN UserAccessRight.CanEdit == true", () => {
            describe("WHEN isEditMode == false", () => {
                beforeEach(() => {
                    spyOn(ControllersManager.mainController, "currentProject").and.returnValue(project);
                    item = new ap.viewmodels.projects.ProjectDetailViewModel(Utility, $q, $timeout, ControllersManager, ServicesManager, true);
                    deferProjectCountry.resolve(new ap.services.apiHelper.ApiResponse(project));
                    $rootScope.$apply();
                });
                it("THEN, editAction.isVisible = true", () => {
                    expect(item.screenInfo.actions[0].isVisible).toBeTruthy();
                });
                it("AND UserAccessRight.CanConfig == true THEN, editAction.isEnabled = true", () => {
                    expect(item.screenInfo.actions[0].isEnabled).toBeTruthy();
                });
                it("THEN, saveAction.isVisible = false", () => {
                    expect(item.screenInfo.actions[1].isVisible).toBeFalsy();
                });
                it("THEN, saveAction.isEnabled = false", () => {
                    expect(item.screenInfo.actions[1].isEnabled).toBeFalsy();
                });
                it("THEN, cancelAction.isVisible = false", () => {
                    expect(item.screenInfo.actions[2].isVisible).toBeFalsy();
                });
                it("THEN, cancelAction.isEnabled = false", () => {
                    expect(item.screenInfo.actions[2].isEnabled).toBeFalsy();
                });
            });
            describe("WHEN isEditMode == false", () => {
                beforeEach(() => {
                    project.UserAccessRight.CanConfig = false;
                    spyOn(ControllersManager.mainController, "currentProject").and.returnValue(project);
                    item = new ap.viewmodels.projects.ProjectDetailViewModel(Utility, $q, $timeout, ControllersManager, ServicesManager, true)
                    deferProjectCountry.resolve(new ap.services.apiHelper.ApiResponse(project));
                    $rootScope.$apply();
                });
                it("AND UserAccessRight.CanConfig == false THEN, editAction.isEnabled = false", () => {
                    expect(item.screenInfo.actions[0].isEnabled).toBeFalsy();
                });
            });
            describe("WHEN isEditMode == true", () => {
                beforeEach(() => {
                    spyOn(ControllersManager.mainController, "currentProject").and.returnValue(project);
                    item = new ap.viewmodels.projects.ProjectDetailViewModel(Utility, $q, $timeout, ControllersManager, ServicesManager, true);
                    deferProjectCountry.resolve(new ap.services.apiHelper.ApiResponse(project));
                    $rootScope.$apply();
                    specHelper.general.raiseEvent(item.screenInfo, "actionclicked", "detail.edit");
                });
                it("THEN, editAction.isVisible = false", () => {
                    expect(item.screenInfo.actions[0].isVisible).toBeFalsy();
                });
                it("AND UserAccessRight.CanConfig == true THEN, editAction.isEnabled = false", () => {
                    expect(item.screenInfo.actions[0].isEnabled).toBeFalsy();
                });
                it("THEN, saveAction.isVisible = true", () => {
                    expect(item.screenInfo.actions[1].isVisible).toBeTruthy();
                });
                it("THEN, saveAction.isEnabled = true", () => {
                    expect(item.screenInfo.actions[1].isEnabled).toBeFalsy();
                });
                it("THEN, cancelAction.isVisible = true", () => {
                    expect(item.screenInfo.actions[2].isVisible).toBeTruthy();
                });
                it("THEN, cancelAction.isEnabled = true", () => {
                    expect(item.screenInfo.actions[2].isEnabled).toBeTruthy();
                });
            });
            describe("WHEN isEditMode == true", () => {
                beforeEach(() => {
                    project.UserAccessRight.CanConfig = false;
                    spyOn(ControllersManager.mainController, "currentProject").and.returnValue(project);
                    item = new ap.viewmodels.projects.ProjectDetailViewModel(Utility, $q, $timeout, ControllersManager, ServicesManager, true);
                    deferProjectCountry.resolve(new ap.services.apiHelper.ApiResponse(project));
                    $rootScope.$apply();
                    specHelper.general.raiseEvent(item.screenInfo, "actionclicked", "detail.edit");
                });
                it("AND UserAccessRight.CanConfig == false THEN, editAction.isEnabled = false", () => {
                    expect(item.screenInfo.actions[0].isEnabled).toBeFalsy();
                });
            });
        });
        describe("WHEN the user has module logo management", () => {
            beforeEach(() => {
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.returnValue(true);
            });
            describe("WHEN isForEditProject = true", () => {
                beforeEach(() => {
                    spyOn(ControllersManager.mainController, "currentProject").and.returnValue(project);
                    item = new ap.viewmodels.projects.ProjectDetailViewModel(Utility, $q, $timeout, ControllersManager, ServicesManager, true);
                    deferProjectCountry.resolve(new ap.services.apiHelper.ApiResponse(project));
                    $rootScope.$apply();
                });
                it("THEN, canDisplayLogoSection = true", () => {
                    expect(item.canDisplayLogoSection).toBeTruthy();
                });
            });
            describe("WHEN isForEditProject = false", () => {
                beforeEach(() => {
                    spyOn(ControllersManager.mainController, "currentProject").and.returnValue(project);
                    item = new ap.viewmodels.projects.ProjectDetailViewModel(Utility, $q, $timeout, ControllersManager, ServicesManager);
                    deferProjectCountry.resolve(new ap.services.apiHelper.ApiResponse(project));
                    $rootScope.$apply();
                });
                it("THEN, canDisplayLogoSection = false", () => {
                    expect(item.canDisplayLogoSection).toBeFalsy();
                });
            });
            describe("WHEN CanConfig = true", () => {
                beforeEach(() => {
                    project.UserAccessRight.CanConfig = true;
                    spyOn(ControllersManager.mainController, "currentProject").and.returnValue(project);
                    item = new ap.viewmodels.projects.ProjectDetailViewModel(Utility, $q, $timeout, ControllersManager, ServicesManager, true);
                    deferProjectCountry.resolve(new ap.services.apiHelper.ApiResponse(project));
                    $rootScope.$apply();
                });
                describe("WHEN isEditMode = true", () => {
                    beforeEach(() => {
                        specHelper.general.raiseEvent(item.screenInfo, "actionclicked", "detail.edit");
                    });
                    it("THEN, canEditLogo = true", () => {
                        expect(item.canEditLogo).toBeTruthy();
                    });
                });
                describe("WHEN isEditMode = false", () => {
                    it("THEN, canEditLogo = false", () => {
                        expect(item.canEditLogo).toBeFalsy();
                    });
                });
            });
            describe("WHEN CanConfig = false", () => {
                beforeEach(() => {
                    project.UserAccessRight.CanConfig = false;
                    spyOn(ControllersManager.mainController, "currentProject").and.returnValue(project);
                    item = new ap.viewmodels.projects.ProjectDetailViewModel(Utility, $q, $timeout, ControllersManager, ServicesManager, true);
                    deferProjectCountry.resolve(new ap.services.apiHelper.ApiResponse(project));
                    $rootScope.$apply();
                });
                describe("WHEN isEditMode = true", () => {
                    beforeEach(() => {
                        specHelper.general.raiseEvent(item.screenInfo, "actionclicked", "detail.edit");
                    });
                    it("THEN, canEditLogo = false", () => {
                        expect(item.canEditLogo).toBeFalsy();
                    });
                });
                describe("WHEN isEditMode = false", () => {
                    it("THEN, canEditLogo = false", () => {
                        expect(item.canEditLogo).toBeFalsy();
                    });
                });
            });
            describe("WHEN isEditMode = true", () => {
                let files: File[];
                let file: File;
                describe("WHEN newLogo or sourceLogo path are defined", () => {
                    beforeEach(() => {
                        spyOn(ControllersManager.mainController, "currentProject").and.returnValue(project);
                        item = new ap.viewmodels.projects.ProjectDetailViewModel(Utility, $q, $timeout, ControllersManager, ServicesManager, true);
                        deferProjectCountry.resolve(new ap.services.apiHelper.ApiResponse(project));
                        $rootScope.$apply();
                        specHelper.general.raiseEvent(item.screenInfo, "actionclicked", "detail.edit");
                        files = [];
                        file = new File(["Data"], "mypic.png", { type: "image/png" });
                        files.push(file);
                        item.changeLogo(files);
                        item.name = "Use to have access to checkCanEditLogo()"
                    });
                    it("THEN, canDeleteLogo = true", () => {
                        expect(item.canDeleteProjectLogo).toBeTruthy();
                    });
                });
            });
            describe("WHEN isEditMode = false", () => {
                beforeEach(() => {
                    spyOn(ControllersManager.mainController, "currentProject").and.returnValue(project);
                    item = new ap.viewmodels.projects.ProjectDetailViewModel(Utility, $q, $timeout, ControllersManager, ServicesManager, true);
                    deferProjectCountry.resolve(new ap.services.apiHelper.ApiResponse(project));
                    $rootScope.$apply();
                });
                it("THEN, canDeleteLogo = false", () => {
                    expect(item.canDeleteProjectLogo).toBeFalsy();
                });
            });
        });
        describe("WHEN the user has NOT module logo management", () => {
            beforeEach(() => {
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.returnValue(false);
            });
            describe("WHEN isForEditProject = true", () => {
                beforeEach(() => {
                    spyOn(ControllersManager.mainController, "currentProject").and.returnValue(project);
                    item = new ap.viewmodels.projects.ProjectDetailViewModel(Utility, $q, $timeout, ControllersManager, ServicesManager, true);
                    deferProjectCountry.resolve(new ap.services.apiHelper.ApiResponse(project));
                    $rootScope.$apply();
                });
                it("THEN, canDisplayLogoSection = false", () => {
                    expect(item.canDisplayLogoSection).toBeFalsy();
                });
            });
            describe("WHEN isForEditProject = false", () => {
                beforeEach(() => {
                    spyOn(ControllersManager.mainController, "currentProject").and.returnValue(project);
                    item = new ap.viewmodels.projects.ProjectDetailViewModel(Utility, $q, $timeout, ControllersManager, ServicesManager);
                    deferProjectCountry.resolve(new ap.services.apiHelper.ApiResponse(project));
                    $rootScope.$apply();
                });
                it("THEN, canDisplayLogoSection = false", () => {
                    expect(item.canDisplayLogoSection).toBeFalsy();
                });
            });
            describe("WHEN CanConfig = true", () => {
                beforeEach(() => {
                    project.UserAccessRight.CanConfig = true;
                    spyOn(ControllersManager.mainController, "currentProject").and.returnValue(project);
                    item = new ap.viewmodels.projects.ProjectDetailViewModel(Utility, $q, $timeout, ControllersManager, ServicesManager, true);
                    deferProjectCountry.resolve(new ap.services.apiHelper.ApiResponse(project));
                    $rootScope.$apply();
                });
                describe("WHEN isEditMode = true", () => {
                    beforeEach(() => {
                        specHelper.general.raiseEvent(item.screenInfo, "actionclicked", "detail.edit");
                    });
                    it("THEN, canEditLogo = false", () => {
                        expect(item.canEditLogo).toBeFalsy();
                    });
                });
                describe("WHEN isEditMode = false", () => {
                    it("THEN, canEditLogo = false", () => {
                        expect(item.canEditLogo).toBeFalsy();
                    });
                });
            });
            describe("WHEN CanConfig = false", () => {
                beforeEach(() => {
                    project.UserAccessRight.CanConfig = false;
                    spyOn(ControllersManager.mainController, "currentProject").and.returnValue(project);
                    item = new ap.viewmodels.projects.ProjectDetailViewModel(Utility, $q, $timeout, ControllersManager, ServicesManager, true);
                    deferProjectCountry.resolve(new ap.services.apiHelper.ApiResponse(project));
                    $rootScope.$apply();
                });
                describe("WHEN isEditMode = true", () => {
                    beforeEach(() => {
                        specHelper.general.raiseEvent(item.screenInfo, "actionclicked", "detail.edit");
                    });
                    it("THEN, canEditLogo = false", () => {
                        expect(item.canEditLogo).toBeFalsy();
                    });
                });
                describe("WHEN isEditMode = false", () => {
                    it("THEN, canEditLogo = false", () => {
                        expect(item.canEditLogo).toBeFalsy();
                    });
                });
            });
        });
        describe("WHEN name is empty", () => {
            beforeEach(() => {
                spyOn(ControllersManager.mainController, "currentProject").and.returnValue(project);
                item = new ap.viewmodels.projects.ProjectDetailViewModel(Utility, $q, $timeout, ControllersManager, ServicesManager, true);
                deferProjectCountry.resolve(new ap.services.apiHelper.ApiResponse(project));
                $rootScope.$apply();
                item.name = "";
            });
            it("THEN, saveAction.isEnabled = false", () => {
                expect(item.screenInfo.actions[1].isEnabled).toBeFalsy();
            });
        });
        describe("WHEN code is empty", () => {
            beforeEach(() => {
                spyOn(ControllersManager.mainController, "currentProject").and.returnValue(project);
                item = new ap.viewmodels.projects.ProjectDetailViewModel(Utility, $q, $timeout, ControllersManager, ServicesManager, true);
                deferProjectCountry.resolve(new ap.services.apiHelper.ApiResponse(project));
                $rootScope.$apply();
                item.code = "";
            });
            it("THEN, saveAction.isEnabled = false", () => {
                expect(item.screenInfo.actions[1].isEnabled).toBeFalsy();
            });
        });
    });
    describe("Feature: changeLogo", () => {
        let files: File[];
        let file: File;
        beforeEach(() => {
            files = [];
            spyOn(ControllersManager.mainController, "currentProject").and.returnValue(project);
            item = new ap.viewmodels.projects.ProjectDetailViewModel(Utility, $q, $timeout, ControllersManager, ServicesManager, true);
            deferProjectCountry.resolve(new ap.services.apiHelper.ApiResponse(project));
            $rootScope.$apply();
        });
        describe("WHEN there is no files in param", () => {
            beforeEach(() => {
                item.changeLogo(files);
            });
            it("THEN, newLogo = null", () => {
                expect(item.newLogo).toBeNull();
            });
        });
        describe("WHEN there is more than one file in param", () => {
            beforeEach(() => {
                file = new File(["Data"], "mypic.png", { type: "image/png" });
                files.push(file);
                files.push(file);
            });
            it("THEN, it throw error", () => {
                expect(() => {
                    item.changeLogo(files);
                }).toThrowError("There is more than one file");
            });
        });
        describe("WHEN the file is not an image", () => {
            beforeEach(() => {
                spyOn(ControllersManager.mainController, "showError");
                file = new File(["Data"], "plan_01.pdf", { type: "application/JSON" });
                files.push(file);
                item.changeLogo(files);
            });
            it("THEN, show error is called", () => {
                expect(ControllersManager.mainController.showError).toHaveBeenCalledWith("app.err.filetypenotsupported", "Change logo", null, null);
            });
        });
        describe("WHEN the param is correct", () => {
            describe("WHEN _sourceLogoPath is NOT null", () => {
                it("THEN,  logoPath = pr1.png", () => {
                    expect(item.logoPath).toEqual(Utility.apiUrl + "ProjectImages/Logo/" + project.Id + "/" + project.LogoUrl);
                });
            });
            describe("WHEN _sourceLogoPath is null", () => {
                describe("WHEN newLogo is null", () => {
                    beforeEach(() => {
                        specHelper.general.spyProperty(ap.viewmodels.projects.ProjectDetailViewModel.prototype, "newLogo", specHelper.PropertyAccessor.Get).and.returnValue(null);
                        file = new File(["Data"], "mypic.png", { type: "image/png" });
                        files.push(file);
                        item.changeLogo(files);
                    });
                    afterEach(() => {
                        specHelper.general.offSpyProperty(ap.viewmodels.projects.ProjectDetailViewModel.prototype, "newLogo", specHelper.PropertyAccessor.Get);
                    });
                    it("THEN,  logoPath is default image", () => {
                        expect(item.logoPath).toEqual(Utility.rootUrl + "/Images/html/icons/projects_white_48px.svg");
                    });
                });
                describe("WHEN newLogo is NOT null", () => {
                    beforeEach(() => {
                        file = new File(["Data"], "mypic.png", { type: "image/png" });
                        files.push(file);
                        item.changeLogo(files);
                    });
                    it("THEN, newLogo = file", () => {
                        expect(item.newLogo).toEqual(file);
                    });
                });
            });
        });
    });
    describe("Feature: postChanges", () => {
        beforeEach(() => {
            spyOn(ControllersManager.mainController, "currentProject").and.returnValue(project);
            item = new ap.viewmodels.projects.ProjectDetailViewModel(Utility, $q, $timeout, ControllersManager, ServicesManager, true);
            deferProjectCountry.resolve(new ap.services.apiHelper.ApiResponse(project));
            $rootScope.$apply();
            item.name = "Edited Proj";
        });
        describe("WHEN there is no logo", () => {
            beforeEach(() => {
                item.deleteProjectLogo();
                item.postChanges();
            });
            it("THEN, originalProject.LogoUrl = null", () => {
                expect(item.originalProject.LogoUrl).toBeNull();
            });
            it("THEN, originalProject.LogoUrl = null", () => {
                expect(item.originalProject.Name).toEqual("Edited Proj");
            });
        });
        describe("WHEN there is a logo", () => {
            let files: File[];
            let file: File;
            beforeEach(() => {
                files = [];
                file = new File(["Data"], "path.jpg", { type: "image/png" });
                files.push(file);
                item.changeLogo(files);
                item.postChanges();
            });
            it("THEN, originalProject.LogoUrl = path.jpg", () => {
                expect(item.originalProject.LogoUrl).toEqual("path.jpg");
            });
        });
        describe("WHEN there is no selected country", () => {
            beforeEach(() => {
                item.selectedCountry = null;
                item.postChanges();
            });
            it("THEN, originalProject.LogoUrl = null", () => {
                expect(item.originalProject.Country).toBeNull();
            });
        });
        describe("WHEN there is a selected country", () => {
            let countryVm: ap.viewmodels.identificationfiles.country.CountryViewModel;
            let country: ap.models.identFiles.Country;
            beforeEach(() => {
                country = new ap.models.identFiles.Country(Utility);
                countryVm = new ap.viewmodels.identificationfiles.country.CountryViewModel(Utility, country);
                item.selectedCountry = countryVm;
                item.postChanges();
            });
            it("THEN, originalProject.Country = null", () => {
                expect(item.originalProject.Country).toEqual(country);
            });
        });
    });
    describe("Feature: deleteProjectLogo", () => {
        let files: File[];
        let file: File;
        beforeEach(() => {
            spyOn(ControllersManager.mainController, "currentProject").and.returnValue(project);
            item = new ap.viewmodels.projects.ProjectDetailViewModel(Utility, $q, $timeout, ControllersManager, ServicesManager, true);
            deferProjectCountry.resolve(new ap.services.apiHelper.ApiResponse(project));
            $rootScope.$apply();
            files = [];
            file = new File(["Data"], "mypic.png", { type: "image/png" });
            files.push(file);
            item.changeLogo(files);
            item.deleteProjectLogo();
        });
        it("THEN, originalProject.LogoUrl = null", () => {
            expect(item.logoPath).toEqual(item.defaultLogo);
        });
        it("THEN, newLogo = null", () => {
            expect(item.newLogo).toBeNull();
        });
    });
}); 