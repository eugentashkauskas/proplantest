'use strict';
describe("Module ap-viewmodels - reports", () => {
    var nmp = ap.viewmodels.reports;
    var MainController: ap.controllers.MainController, Utility: ap.utility.UtilityHelper, Api: ap.services.apiHelper.Api, UserContext: ap.utility.UserContext, UIStateController: ap.controllers.UIStateController;
    var $controller: angular.IControllerService, $rootScope: angular.IRootScopeService, $scope: angular.IScope, _deferred: angular.IDeferred<ap.services.apiHelper.ApiResponse>,
        $q: angular.IQService, $timeout: angular.ITimeoutService, $compile: angular.ICompileService;

    var reportLogoViewModel: ap.viewmodels.reports.ReportLogoViewModel = null;

    let currentProject: ap.models.projects.Project;
    let projectlogoPath: string = null;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });
    beforeEach(inject(function (_$rootScope_, _$q_, _$timeout_, _$compile_, _UserContext_, _Utility_, _Api_, _MainController_, _UIStateController_, _$controller_) {
        MainController = _MainController_;
        UIStateController = _UIStateController_;
        Utility = _Utility_;
        UserContext = _UserContext_;
        Api = _Api_;
        $q = _$q_;
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $timeout = _$timeout_;
        _deferred = $q.defer();
        $controller = _$controller_;
        $scope = $rootScope.$new();
        specHelper.utility.stubRootUrl(Utility);        
        Utility.Storage.Session.clear();
        specHelper.utility.stubStorageSet(Utility);
    }));

    beforeEach(() => {
        projectlogoPath = "project_logo.jpg";
        currentProject = new ap.models.projects.Project(Utility);
        spyOn(currentProject, "getLogoPath").and.callFake(() => { return projectlogoPath; });
        spyOn(MainController, "currentProject").and.returnValue(currentProject);
    });

    describe("Feature ReportLogoViewModel: init values", () => {
        describe("WHEN the ReportLogoViewModel is created", () => {
            it("THEN I can get an instance of my viewmodel with default values", () => {
                var reportLogo: ap.models.reports.ReportLogo;
                reportLogo = new ap.models.reports.ReportLogo(Utility);
                reportLogo.IsAllPages = true;
                reportLogo.Type = ap.models.reports.ReportLogoType.Project;
                reportLogo.Position = ap.models.reports.ReportLogoPosition.Middle;

                reportLogoViewModel = new ap.viewmodels.reports.ReportLogoViewModel(Utility, MainController, "abc");
                reportLogoViewModel.init(reportLogo);

                expect(reportLogoViewModel.isAllPages).toEqual(reportLogo.IsAllPages);
                expect(reportLogoViewModel.position).toEqual(reportLogo.Position);
                expect(reportLogoViewModel.logoType).toEqual(ap.models.reports.ReportLogoType[reportLogo.Type]);

            });

        });
    });

    describe("Feature ReportLogoViewModel: Post change", () => {
        describe("WHEN the view model changed the values and call Post change", () => {
            let reportLogo: ap.models.reports.ReportLogo;
            beforeEach(() => {                
                reportLogo = new ap.models.reports.ReportLogo(Utility);
                reportLogo.IsAllPages = true;
                reportLogo.Type = ap.models.reports.ReportLogoType.Project;
                reportLogo.Position = ap.models.reports.ReportLogoPosition.Middle;

                reportLogoViewModel = new ap.viewmodels.reports.ReportLogoViewModel(Utility, MainController, "abc");
                reportLogoViewModel.init(reportLogo);

                reportLogoViewModel.isAllPages = false;
                reportLogoViewModel.position = ap.models.reports.ReportLogoPosition.Left;
                reportLogoViewModel.logoType = "Uploaded";
                reportLogoViewModel.path = "abc.jpg";
                reportLogoViewModel.postChanges();
            });
            it("THEN, Entity.IsAllPages changed", () => {
                expect(reportLogo.IsAllPages).toBeFalsy();
            });
            it("THEN, Entity.Type changed", () => {
                expect(reportLogo.Type).toBe(ap.models.reports.ReportLogoType.Uploaded);
                expect(reportLogo.Position).toEqual(reportLogoViewModel.position);
            });
            it("THEN, Entity.Position changed", () => {
                expect(reportLogo.Position).toEqual(ap.models.reports.ReportLogoPosition.Left);
            });
            it("THEN, Entity.Path changed", () => {
                expect(reportLogo.Path).toEqual("abc.jpg");
            });
        });
    });

    describe("Feature ReportLogoViewModel: getLogoPath", () => {
        beforeEach(() => {
            specHelper.userContext.stub(Utility);
        });
        describe("WHEN logo of type project", () => {
            let resultPath: string;            
            beforeEach(() => {
                var reportLogo: ap.models.reports.ReportLogo;
                reportLogo = new ap.models.reports.ReportLogo(Utility);
                reportLogo.IsAllPages = true;
                reportLogo.Type = ap.models.reports.ReportLogoType.Project;

                reportLogoViewModel = new ap.viewmodels.reports.ReportLogoViewModel(Utility, MainController, "abc");
                reportLogoViewModel.init(reportLogo);
                resultPath = reportLogoViewModel.getLogoPath();
            });
            it("Project.getLogoPath had been called", () => {
                expect(currentProject.getLogoPath).toHaveBeenCalled();
            });
            it("result is 'project_logo.jpg'", () => {
                expect(resultPath).toEqual("project_logo.jpg");
            });
        });
        describe("WHEN logo of type user", () => {
            let resultPath: string;
            let dummyUser: ap.models.actors.User;
            beforeEach(() => {
                var reportLogo: ap.models.reports.ReportLogo;
                reportLogo = new ap.models.reports.ReportLogo(Utility);
                reportLogo.IsAllPages = true;
                reportLogo.Type = ap.models.reports.ReportLogoType.User;

                dummyUser = Utility.UserContext.CurrentUser();
                
                spyOn(dummyUser, "getLogoPath").and.returnValue("user logo path");

                reportLogoViewModel = new ap.viewmodels.reports.ReportLogoViewModel(Utility, MainController, "abc");
                reportLogoViewModel.init(reportLogo);
                resultPath = reportLogoViewModel.getLogoPath();
            });
            it("Utility.UserContext.CurrentUser.getLogoPath had been called", () => {
                expect(dummyUser.getLogoPath).toHaveBeenCalled();
            });
            it("result is 'user logo path'", () => {
                expect(resultPath).toEqual("user logo path");
            });
        });
        describe("WHEN logo of type None", () => {
            let resultPath: string;
            beforeEach(() => {
                var reportLogo: ap.models.reports.ReportLogo;
                reportLogo = new ap.models.reports.ReportLogo(Utility);                
                reportLogo.Type = ap.models.reports.ReportLogoType.None;
                
                reportLogoViewModel = new ap.viewmodels.reports.ReportLogoViewModel(Utility, MainController, "abc");
                reportLogoViewModel.init(reportLogo);
                resultPath = reportLogoViewModel.getLogoPath();
            });
            it("result is empty string", () => {
                expect(resultPath).toEqual("");
            });
        });

        describe("WHEN logo of type Uploaded and there is no path of entity", () => {
            let resultPath: string;
            beforeEach(() => {
                var reportLogo: ap.models.reports.ReportLogo;
                reportLogo = new ap.models.reports.ReportLogo(Utility);
                reportLogo.Type = ap.models.reports.ReportLogoType.Uploaded;                

                reportLogoViewModel = new ap.viewmodels.reports.ReportLogoViewModel(Utility, MainController, "abc");
                reportLogoViewModel.init(reportLogo);
                resultPath = reportLogoViewModel.getLogoPath();
            });
            it("result is empty string", () => {
                expect(resultPath).toEqual("");
            });
        });

        describe("WHEN logo of type Uploaded and path of entity defined", () => {
            let resultPath: string;
            beforeEach(() => {
                var reportLogo: ap.models.reports.ReportLogo;
                reportLogo = new ap.models.reports.ReportLogo(Utility);
                reportLogo.Type = ap.models.reports.ReportLogoType.Uploaded;
                reportLogo.Path = "logo.jpg";

                reportLogoViewModel = new ap.viewmodels.reports.ReportLogoViewModel(Utility, MainController, "abc");
                reportLogoViewModel.init(reportLogo);
                resultPath = reportLogoViewModel.getLogoPath();
            });
            it("result correct path to server logo", () =>{
                expect(resultPath).toEqual(Utility.apiUrl + "ReportConfig/abc/logo.jpg");
            });
        });
    });


    describe("Feature ReportLogoViewModel: canSave", () => {
        let reportLogo: ap.models.reports.ReportLogo;
        beforeEach(() => {
            reportLogo = new ap.models.reports.ReportLogo(Utility);
            reportLogo.IsAllPages = true;
            reportLogoViewModel = new ap.viewmodels.reports.ReportLogoViewModel(Utility, MainController, "abc");
            reportLogoViewModel.init(reportLogo);
        });

        describe("WHEN, logo type is project and there is no logo of project", () => {
            beforeEach(() => {
                projectlogoPath = null;
                reportLogoViewModel.logoType = "Project";                
            });
            it("THEN, cansave = false", () => {
                expect(reportLogoViewModel.canSave()).toBeFalsy();
            });
        });

        describe("WHEN, logo type is project and there path to logo of project", () => {
            beforeEach(() => {
                reportLogoViewModel.logoType = "Project";                
                projectlogoPath = "project_logo.jpg";
            });
            it("THEN, cansave = true", () => {
                expect(reportLogoViewModel.canSave()).toBeTruthy();
            });
        });

        describe("WHEN, logo type is user and there is no logo of user", () => {
            beforeEach(() => {
                reportLogoViewModel.logoType = "User";
                specHelper.userContext.stubNoLogo(Utility);                
            });
            it("THEN, cansave = false", () => {
                expect(reportLogoViewModel.canSave()).toBeFalsy();
            });
        });

        describe("WHEN, logo type is user and there path to logo of user", () => {
            beforeEach(() => {
                reportLogoViewModel.logoType = "User";
                specHelper.userContext.stub(Utility);
            });
            it("THEN, cansave = true", () => {
                expect(reportLogoViewModel.canSave()).toBeTruthy();
            });
        });

        describe("WHEN, logo type is uploaded and there is no logo uploaded", () => {
            beforeEach(() => {
                reportLogoViewModel.logoType = "Uploaded";
                reportLogo.Path = null;
            });
            it("THEN, cansave = false", () => {
                expect(reportLogoViewModel.canSave()).toBeFalsy();
            });
        });

        describe("WHEN, logo type is uploaded and there path to uploaded logo", () => {
            beforeEach(() => {
                reportLogoViewModel.logoType = "Uploaded";
                reportLogoViewModel.path = "uploaded.jpg";
            });
            it("THEN, cansave = true", () => {
                expect(reportLogoViewModel.canSave()).toBeTruthy();
            });
        });
    });

    describe("Feature ReportLogoViewModel: uploadLogo", () => {
        let files: File[];
        beforeEach(() => {
            files = [
                <File>{ name: "file1.png" }              
            ];
            var reportLogo: ap.models.reports.ReportLogo;
            reportLogo = new ap.models.reports.ReportLogo(Utility);

            reportLogoViewModel = new ap.viewmodels.reports.ReportLogoViewModel(Utility, MainController, "abc");
            reportLogoViewModel.init(reportLogo);

            spyOn(ap.utility.UtilityHelper, "createGuid").and.returnValue("guid_");
        });

        describe("WHEN call uploadLogo with a file and the server return OK", () => {
            beforeEach(() => {
                let def = $q.defer();
                spyOn(Utility.FileHelper, "uploadFile").and.returnValue(def.promise);

                reportLogoViewModel.uploadLogo(files);

                def.resolve("123abc.png");
                $rootScope.$apply();
            });
            it("THEN, file helper had been called to upload file", () => {
                expect(Utility.FileHelper.uploadFile).toHaveBeenCalledWith("UploadReportConfigFiles.ashx?GuidId=abc", files[0], "guid_.png");
            });
            it("THEN, the result unique name set to logo", () => {
                expect(reportLogoViewModel.path).toEqual("123abc.png");
            });
        });

        describe("WHEN call uploadLogo with a file and there is error form server", () => {
            beforeEach(() => {
                let def = $q.defer();
                spyOn(Utility.FileHelper, "uploadFile").and.returnValue(def.promise);

                reportLogoViewModel.uploadLogo(files);
                spyOn(MainController, "showError");

                def.reject("error");
                $rootScope.$apply();
            });
            it("THEN, file helper had been called to upload file", () => {                
                expect(Utility.FileHelper.uploadFile).toHaveBeenCalledWith("UploadReportConfigFiles.ashx?GuidId=abc", files[0], "guid_.png");
            });
            it("THEN, show error had been called", () => {
                expect(MainController.showError).toHaveBeenCalled();
            });
        });
        describe("WHEN call uploadLogo with a file and the file extention is not image/picture/photo", () => {
            beforeEach(() => {
                let def = $q.defer();
                spyOn(Utility.FileHelper, "uploadFile").and.returnValue(def.promise);

                let files_pdf = [
                    <File>{ name: "file1.pdf" }
                ];
                spyOn(MainController, "showError");

                reportLogoViewModel.uploadLogo(files_pdf);
                def.reject("error");
                $rootScope.$apply();
            });
            it("THEN, file helper NOT called to upload file", () => {
                expect(Utility.FileHelper.uploadFile).not.toHaveBeenCalled();
            });
            it("THEN, show error had been called to show that the file extention is not accepted", () => {
                expect(MainController.showError).toHaveBeenCalledWith("[app.err.adddoc_wrong_extensionMsg]", "[app.err.adddoc_wrong_extensionTitle]", null, null);
            });
        });
    });
});   