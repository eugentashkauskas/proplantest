describe("Module ap-viewmodels - project's components - ContactSelector", () => {
    let currentProject;
    let vm: ap.viewmodels.projects.ContactSelectorViewModel;
    let Utility: ap.utility.UtilityHelper;
    let MainController: ap.controllers.MainController;
    let Api: ap.services.apiHelper.Api;
    let NoteController: ap.controllers.NoteController;
    let ProjectController: ap.controllers.ProjectController;
    let DocumentController: ap.controllers.DocumentController;
    let NoteService: ap.services.NoteService;
    let $mdDialog: angular.material.IDialogService;
    let UserContext: ap.utility.UserContext;

    let $q: angular.IQService,
        $timeout: angular.ITimeoutService,
        $rootScope: angular.IRootScopeService,
        $scope: angular.IScope;

    let project: any = {};
    project.Name = "Welcome";
    project.UserAccessRight = new ap.models.accessRights.ProjectAccessRight(Utility);
    project.UserAccessRight.CanEdit = true;
    project.UserAccessRight.CanArchiveDoc = true;
    project.PhotoFolderId = "d660cb6d-ca54-4b93-a564-a46e874eb68a";
   

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

    beforeEach(inject(function (_$rootScope_, _UserContext_, _Utility_, _NoteController_, _$q_, _MainController_, _DocumentController_, _NoteService_, _$mdDialog_, _ProjectController_, _Api_) {
        Utility = _Utility_;
        UserContext = _UserContext_;
        NoteController = _NoteController_;
        DocumentController = _DocumentController_;
        ProjectController = _ProjectController_;
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

        currentProject = {
            Id: "45152-56",
            Name: "test",
            UserAccessRight: {
                CanUploadDoc: true
            },
            PhotoFolderId: "45121004"
        };
        spyOn(MainController, "currentProject").and.callFake((val) => {
            if (val === undefined) {
                return currentProject;
            }
        });

        spyOn(Utility.Translator, "getTranslation").and.callFake(function (translationCode) {
            if (translationCode === "New")
                return "New";
            else
                return "[" + translationCode + "]";
        });

    }));

    let createViewModel = (checkRole: boolean = true, checkCompany: boolean = true, canCreateNew: boolean = false) => {
        vm = new ap.viewmodels.projects.ContactSelectorViewModel(Utility, Api, $q, MainController, ProjectController, checkRole, checkCompany, canCreateNew);
    };

    describe("Feature: constructor", () => {
        describe("WHEN ContactSelectorViewModel is created", () => {
            it("THEN, default values are correctly fill AND the selectedContacts is empty", () => {
                createViewModel();

                expect(vm.entityName).toBe("ContactDetails");
                expect(vm.defaultFilter).toBe("");
                expect(vm.sortOrder).toBe("");
                expect(vm.pathToLoad).toEqual("User");
                expect(vm.selectedContacts.length).toBe(0);
            });
        });
    });

    describe("Feature: searchContacts method", () => {
        describe("When the searchContacts method was called with null or undefined param ", () => {
            it("THEN, will return the empty list", () => {
                createViewModel();
                let searchResult: ap.viewmodels.projects.ContactItemViewModel[] = vm.searchContacts(null);
                expect(searchResult.length).toEqual(0);
            });
        });
        describe("When the searchContacts method was called with a text ", () => {
            let defContact;
            let projectFilter;
            let listContact: ap.models.projects.ContactDetails[];
            let resultList: ap.viewmodels.projects.ContactItemViewModel[];
            let fullFilter: string;
            let defaultFilter: string;

            let checkCommanyFilter: string;
            let checkRoleFilter: string;
            let option: ap.services.apiHelper.ApiOption; 
            beforeEach(() => {
                option = new ap.services.apiHelper.ApiOption();
                option.isShowBusy = false;
                option.async = true;
                projectFilter = Filter.eq("ProjectId", "45152-56");
                defContact = $q.defer();
                spyOn(Api, "getEntityList").and.returnValue(defContact.promise);

            });
            describe("WHEN the vm was init with checkCompany, checkRole", () => {
                let contact1: ap.models.projects.ContactDetails;
                let contact2: ap.models.projects.ContactDetails;

                beforeEach(() => {
                    createViewModel();

                    let searchBaseFilter: string = Filter.contains("DisplayName", "\"" + "user" + "\"");
                    searchBaseFilter = Filter.or(searchBaseFilter, Filter.eq("User.Alias", "\"" + "user" + "\""));
                   
                    fullFilter = Filter.or(searchBaseFilter, Filter.contains("Company", "\"" + "user" + "\""));
                    fullFilter = Filter.or(fullFilter, Filter.contains("Role", "\"" + "user" + "\""));
                    fullFilter = Filter.and(projectFilter, fullFilter);


                    listContact = [];
                    contact1 = new ap.models.projects.ContactDetails(Utility);
                    contact1.User = new ap.models.actors.User(Utility);
                    contact1.User.createByJson({ Id: "1", Alias: "UserA@netika.com" });
                    contact1.DisplayName = "USERA";

                    contact2 = new ap.models.projects.ContactDetails(Utility);
                    contact2.User = new ap.models.actors.User(Utility);
                    contact2.User.createByJson({ Id: "2", Alias: "UserB@netika.com" });
                    contact2.DisplayName = "Sergio";

                    listContact.push(contact1);
                    listContact.push(contact2);

                    resultList = [];
                    resultList.push(new ap.viewmodels.projects.ContactItemViewModel("USERA", "1", "UserA@netika.com", contact1, false, false, null, "Guid"));
                    resultList.push(new ap.viewmodels.projects.ContactItemViewModel("Sergio", "2", "UserB@netika.com", contact2, false, false, null, "Guid"));

                });
                it("THEN, getEntityList will called with correct params", () => {
                    vm.searchContacts("user");
                    expect(Api.getEntityList).toHaveBeenCalledWith("ContactDetails", fullFilter, "User", null, null, option);
                });
                it("THEN, return the promise with correct list ContactItemViewModel", () => {
                    let callback = jasmine.createSpy("callback");
                    vm.searchContacts("user").then(function (args) {
                        callback(args);
                    });
                    defContact.resolve(new ap.services.apiHelper.ApiResponse(listContact));
                    $rootScope.$apply();

                    let expectedResultList: ap.viewmodels.projects.ContactItemViewModel[] = [];
                    expectedResultList.push(new ap.viewmodels.projects.ContactItemViewModel("USERA", "1", "usera@netika.com", contact1, true, false, null, "Guid"));
                    expectedResultList.push(new ap.viewmodels.projects.ContactItemViewModel("Sergio", "2", "userb@netika.com", contact2, true, false, null, "Guid"));
                    expect(callback).toHaveBeenCalledWith(expectedResultList);
                });
            });
            describe("WHEN the vm was init without checkCompany, checkRole", () => {
                let contact1: ap.models.projects.ContactDetails;
                let contact2: ap.models.projects.ContactDetails;

                beforeEach(() => {
                    createViewModel(false, false);
                    let searchBaseFilter: string = Filter.contains("DisplayName", "\"" + "user" + "\"");
                    searchBaseFilter = Filter.or(searchBaseFilter, Filter.eq("User.Alias", "\"" + "user" + "\""));

                    defaultFilter = Filter.and(projectFilter, searchBaseFilter);


                    listContact = [];
                    contact1 = new ap.models.projects.ContactDetails(Utility);
                    contact1.User = new ap.models.actors.User(Utility);
                    contact1.User.createByJson({ Id: "1", Alias: "UserA@netika.com" });
                    contact1.DisplayName = "USERA";

                    contact2 = new ap.models.projects.ContactDetails(Utility);
                    contact2.User = new ap.models.actors.User(Utility);
                    contact2.User.createByJson({ Id: "2", Alias: "sergio@netika.com" });
                    contact2.DisplayName = "Sergio";

                    listContact.push(contact1);
                    listContact.push(contact2);

                    resultList = [];
                    resultList.push(new ap.viewmodels.projects.ContactItemViewModel("USERA", "1", "UserA@netika.com", null, false, false, null, "Guid"));

                });
                it("THEN, getEntityList will called with correct params", () => {
                    vm.searchContacts("user");
                    expect(Api.getEntityList).toHaveBeenCalledWith("ContactDetails", defaultFilter, "User", null, null, option);
                });
                it("THEN, return the promise with correct list ContactItemViewModel", () => {
                    let callback = jasmine.createSpy("callback");
                    vm.searchContacts("user").then(function (args) {
                        callback(args);
                    });
                    defContact.resolve(new ap.services.apiHelper.ApiResponse(listContact));
                    $rootScope.$apply();

                    let expectedResultList: ap.viewmodels.projects.ContactItemViewModel[] = [];
                    expectedResultList.push(new ap.viewmodels.projects.ContactItemViewModel("USERA", "1", "usera@netika.com", contact1, true, false, null, "Guid"));
                    expect(callback).toHaveBeenCalledWith(expectedResultList);
                });

            });
            describe("WHEN the vm was init with checkRole", () => {
                beforeEach(() => {
                    createViewModel(true, false);

                    let searchBaseFilter: string = Filter.contains("DisplayName", "\"" + "role" + "\"");
                    searchBaseFilter = Filter.or(searchBaseFilter, Filter.eq("User.Alias", "\"" + "role" + "\""));

                    checkRoleFilter = Filter.or(searchBaseFilter, Filter.contains("Role", "\"" + "role" + "\""));
                    checkRoleFilter = Filter.and(projectFilter, checkRoleFilter);

                    listContact = [];
                    let contact1: ap.models.projects.ContactDetails = new ap.models.projects.ContactDetails(Utility);
                    contact1.User = new ap.models.actors.User(Utility);
                    contact1.User.createByJson({ Id: "1", Alias: "UserA@netika.com" });
                    contact1.DisplayName = "USERA";
                    contact1.Role = "Role1";

                    let contact2: ap.models.projects.ContactDetails = new ap.models.projects.ContactDetails(Utility);
                    contact2.User = new ap.models.actors.User(Utility);
                    contact2.User.createByJson({ Id: "2", Alias: "UserB@netika.com" });
                    contact2.DisplayName = "UserB";

                    listContact.push(contact1);
                    listContact.push(contact2);

                    resultList = [];
                    resultList.push(new ap.viewmodels.projects.ContactItemViewModel("Role1", null,null, null, true, false, null, "Roles"));

                });
                it("THEN, getEntityList will called with correct params", () => {
                    vm.searchContacts("role");
                    expect(Api.getEntityList).toHaveBeenCalledWith("ContactDetails", checkRoleFilter, "User", null, null, option);
                });
                it("THEN, return the promise with correct list ContactItemViewModel", () => {
                    let callback = jasmine.createSpy("callback");
                    vm.searchContacts("role").then(function (args) {
                        callback(args);
                    });
                    defContact.resolve(new ap.services.apiHelper.ApiResponse(listContact));
                    $rootScope.$apply();
                    expect(callback).toHaveBeenCalledWith(resultList);
                });
            });
            describe("WHEN the vm was init with checkCompany", () => {
                beforeEach(() => {
                    createViewModel(false, true);
                    let searchBaseFilter: string = Filter.contains("DisplayName", "\"" + "company" + "\"");
                    searchBaseFilter = Filter.or(searchBaseFilter, Filter.eq("User.Alias", "\"" + "company" + "\""));

                    checkCommanyFilter = Filter.or(searchBaseFilter, Filter.contains("Company", "\"" + "company" + "\""));
                    checkCommanyFilter = Filter.and(projectFilter, checkCommanyFilter);


                    listContact = [];
                    let contact1: ap.models.projects.ContactDetails = new ap.models.projects.ContactDetails(Utility);
                    contact1.User = new ap.models.actors.User(Utility);
                    contact1.User.createByJson({ Id: "1", Alias: "UserA@netika.com" });
                    contact1.DisplayName = "USERA";
                    contact1.Company = "Company1";

                    let contact2: ap.models.projects.ContactDetails = new ap.models.projects.ContactDetails(Utility);
                    contact2.User = new ap.models.actors.User(Utility);
                    contact2.User.createByJson({ Id: "2", Alias: "UserB@netika.com" });
                    contact2.DisplayName = "Sergio";
                    contact2.Company = "Company2";

                    listContact.push(contact1);
                    listContact.push(contact2);

                    resultList = [];
                    resultList.push(new ap.viewmodels.projects.ContactItemViewModel("Company1", null, null, null, true, false, null, "Companies"));
                    resultList.push(new ap.viewmodels.projects.ContactItemViewModel("Company2", null, null, null, true, false, null, "Companies"));
                });
                it("THEN, getEntityList will called with correct params", () => {
                    vm.searchContacts("company");
                    expect(Api.getEntityList).toHaveBeenCalledWith("ContactDetails", checkCommanyFilter, "User", null, null, option);
                });
                it("THEN, return the promise with correct list ContactItemViewModel", () => {
                    let callback = jasmine.createSpy("callback");
                    vm.searchContacts("company").then(function (args) {
                        callback(args);
                    });
                    defContact.resolve(new ap.services.apiHelper.ApiResponse(listContact));
                    $rootScope.$apply();
                    expect(callback).toHaveBeenCalledWith(resultList);
                });
            });
            describe("WHEN the vm was init with canCreateNew", () => {
                let deferredCheckUser;
                beforeEach(() => {
                    deferredCheckUser = $q.defer();
                    spyOn(MainController, "checkUserExists").and.returnValue(deferredCheckUser.promise);
                    createViewModel(true, true, true);
                });
                describe("WHEN the searchContacts method call and there are some contact result", () => {
                    beforeEach(() => {
                        spyOn(StringHelper, "checkValidEmail");

                        listContact = [];
                        let contact1: ap.models.projects.ContactDetails = new ap.models.projects.ContactDetails(Utility);
                        contact1.User = new ap.models.actors.User(Utility);
                        contact1.User.createByJson({ Id: "1", Alias: "UserA@netika.com" });
                        contact1.DisplayName = "USERA";

                        let contact2: ap.models.projects.ContactDetails = new ap.models.projects.ContactDetails(Utility);
                        contact2.User = new ap.models.actors.User(Utility);
                        contact2.User.createByJson({ Id: "2", Alias: "sergio@netika.com" });
                        contact2.DisplayName = "Sergio";

                        listContact.push(contact1);
                        listContact.push(contact2);

                        vm.searchContacts("aa");
                        defContact.resolve(new ap.services.apiHelper.ApiResponse(listContact));
                        $rootScope.$apply();

                    });
                    it("THEN, the checkValidEmail is not called", () => {
                        expect(StringHelper.checkValidEmail).not.toHaveBeenCalled();
                    });
                    it("THEN, the checkUserExists is not called", () => {
                        expect(MainController.checkUserExists).not.toHaveBeenCalled();
                    });
                });
                describe("WHEN the searchContacts method call and there are no contact result and the search text is not valid email", () => {
                    beforeEach(() => {
                        spyOn(StringHelper, "checkValidEmail").and.returnValue(false);
                    });
                    it("THEN, the checkValidEmail is called", () => {
                        vm.searchContacts("aa");
                        defContact.resolve(new ap.services.apiHelper.ApiResponse(null));
                        $rootScope.$apply();
                        expect(StringHelper.checkValidEmail).toHaveBeenCalledWith("aa");
                    });
                    it("THEN, the checkUserExists is not called", () => {
                        vm.searchContacts("aa");
                        defContact.resolve(new ap.services.apiHelper.ApiResponse(null));
                        $rootScope.$apply();
                        expect(MainController.checkUserExists).not.toHaveBeenCalled();
                    });
                    it("AND then return the promise with empty list", () => {
                        let callback = jasmine.createSpy("callback");
                        vm.searchContacts("aa").then(function (args) {
                            callback(args);
                            expect(args.length).toEqual(0);
                        });
                        defContact.resolve(new ap.services.apiHelper.ApiResponse(null));
                        $rootScope.$apply();
                        expect(callback).toHaveBeenCalled();
                    });

                });
                describe("WHEN the searchContacts method call and there are no contact result and the search text is the valid email", () => {
                    beforeEach(() => {
                        spyOn(StringHelper, "checkValidEmail").and.returnValue(true);
                    });
                    it("THEN, the checkValidEmail is called", () => {
                        vm.searchContacts("test@vn.netika");
                        defContact.resolve(new ap.services.apiHelper.ApiResponse(null));
                        $rootScope.$apply();
                        expect(StringHelper.checkValidEmail).toHaveBeenCalledWith("test@vn.netika");
                    });
                    it("THEN, the checkUserExists is called", () => {
                        vm.searchContacts("test@vn.netika");
                        defContact.resolve(new ap.services.apiHelper.ApiResponse(null));
                        $rootScope.$apply();
                        expect(MainController.checkUserExists).toHaveBeenCalledWith("test@vn.netika");
                    });
                    

                });
                describe("WHEN the searchContacts method call and there are no contact result and the search text is the valid email and there is no user exists for the email", () => {
                    beforeEach(() => {
                        spyOn(StringHelper, "checkValidEmail").and.returnValue(true);
                        spyOn(ap.models.actors.User.prototype, "initFromEmail").and.callThrough();
                        spyOn(ap.models.projects.ContactDetails.prototype, "initFromUser").and.callThrough();
                        
                    });
                    it("THEN the new user will create", () => {
                        vm.searchContacts("test@vn.netika");
                        defContact.resolve(new ap.services.apiHelper.ApiResponse(null));
                        $rootScope.$apply();
                        deferredCheckUser.resolve(null);
                        $rootScope.$apply();
                        expect(ap.models.actors.User.prototype.initFromEmail).toHaveBeenCalledWith("test@vn.netika");
                    });
                    it("THEN the new contact will create", () => {
                        vm.searchContacts("test@vn.netika");
                        defContact.resolve(new ap.services.apiHelper.ApiResponse(null));
                        $rootScope.$apply();
                        deferredCheckUser.resolve(null);
                        $rootScope.$apply();
                        expect(ap.models.projects.ContactDetails.prototype.initFromUser).toHaveBeenCalled();
                    });
                    it("THEN, the promise will resolve with the new contact", () => {
                        let callback = jasmine.createSpy("callback");
                        vm.searchContacts("test@vn.netika").then((result: ap.viewmodels.projects.ContactItemViewModel[]) => {
                            callback(result);
                            expect(result.length).toEqual(1);
                            expect(result[0].displayText).toEqual("test (New)");
                        });
                        defContact.resolve(new ap.services.apiHelper.ApiResponse(null));
                        $rootScope.$apply();
                        deferredCheckUser.resolve(null);
                        $rootScope.$apply();
                        expect(callback).toHaveBeenCalled();
                    });

                });
                describe("WHEN the searchContacts method call and there are no contact result and the search text is the valid email and there is one user exists for the email", () => {
                    let existingUser: ap.models.actors.User;
                    beforeEach(() => {
                        existingUser = new ap.models.actors.User(Utility);
                        existingUser.createByJson({
                            Id: "U1",
                            Role: "Admin",
                            Street: "Wall",
                            Zip: "08",
                            City: "Paris",
                            Person: {
                                Id: "P1",
                                Name: "Sergio",
                                Phones: [{
                                    Id: "N1",
                                    Number: "1234"
                                }],
                                Country: {
                                    Id: "C1"
                                }
                            }
                        });

                        spyOn(StringHelper, "checkValidEmail").and.returnValue(true);
                        spyOn(ap.models.actors.User.prototype, "initFromEmail").and.callThrough();
                        spyOn(ap.models.projects.ContactDetails.prototype, "initFromUser").and.callThrough();

                    });
                    it("THEN the new user will not create", () => {
                        vm.searchContacts("test@vn.netika");
                        defContact.resolve(new ap.services.apiHelper.ApiResponse(null));
                        $rootScope.$apply();
                        deferredCheckUser.resolve(existingUser);
                        $rootScope.$apply();
                        expect(ap.models.actors.User.prototype.initFromEmail).not.toHaveBeenCalled();
                    });
                    it("THEN the new contact will create", () => {
                        vm.searchContacts("test@vn.netika");
                        defContact.resolve(new ap.services.apiHelper.ApiResponse(null));
                        $rootScope.$apply();
                        deferredCheckUser.resolve(existingUser);
                        $rootScope.$apply();
                        expect(ap.models.projects.ContactDetails.prototype.initFromUser).toHaveBeenCalled();
                    });
                    it("THEN, the promise will resolve with the new contact", () => {
                        let callback = jasmine.createSpy("callback");
                        vm.searchContacts("test@vn.netika").then((result: ap.viewmodels.projects.ContactItemViewModel[]) => {
                            callback(result);
                            expect(result.length).toEqual(1);
                            expect(result[0].displayText).toEqual("Sergio (New)");
                        });
                        defContact.resolve(new ap.services.apiHelper.ApiResponse(null));
                        $rootScope.$apply();
                        deferredCheckUser.resolve(existingUser);
                        $rootScope.$apply();
                        expect(callback).toHaveBeenCalled();
                    });

                });
                describe("WHEN the searchContacts method call and there are no contact result and the search text is the valid email and there is an error when check exist user", () => {
                    let existingUser: ap.models.actors.User;
                    beforeEach(() => {
                        spyOn(StringHelper, "checkValidEmail").and.returnValue(true);
                    });
                    it("THEN the new user will not create", () => {
                        let callbackerror = jasmine.createSpy("callbackerror");
                        vm.searchContacts("test@vn.netika").then(null, (error) => {
                            callbackerror(error);
                        });
                        defContact.resolve(new ap.services.apiHelper.ApiResponse(null));
                        $rootScope.$apply();
                        deferredCheckUser.reject("error");
                        $rootScope.$apply();
                        expect(callbackerror).toHaveBeenCalled();
                    });
                    

                });
                describe("WHEN the searchContacts method call 2 times and there are no contact result", () => {
                    beforeEach(() => {
                        spyOn(StringHelper, "checkValidEmail").and.returnValue(false);
                    });
                    it("THEN, the getEntityList is called 1 time if the second call contains the first call", () => {
                        vm.searchContacts("test@vn.netika");
                        defContact.resolve(new ap.services.apiHelper.ApiResponse(null));
                        $rootScope.$apply();
                        vm.searchContacts("test@vn.netika.com");
                        expect((<jasmine.Spy>Api.getEntityList).calls.count()).toBe(1);
                    });
                    it("THEN, the getEntityList is called 2 times if the second call not contains the first call", () => {
                        vm.searchContacts("test@vn.netika");
                        defContact.resolve(new ap.services.apiHelper.ApiResponse(null));
                        $rootScope.$apply();
                        vm.searchContacts("sergio@vn.netika.com");
                        expect((<jasmine.Spy>Api.getEntityList).calls.count()).toBe(2);
                    });
                });
            });
        });
    });

    describe("Feature: handleIssueTypeChanged method", () => {
        describe("WHEN the ViewModel is created without a noteDetailsVm", () => {
            beforeEach(() => {
                createViewModel();
                vm.selectedContacts.push(new ap.viewmodels.projects.ContactItemViewModel("USERA", "1", "UserA@netika.com"));
                vm.selectedContacts.push(new ap.viewmodels.projects.ContactItemViewModel("USERB", "2", "UserB@netika.com"));
            });
            describe("AND the method handleIssueTypeChanged is called with a null issuetypeid", () => {
                it("THEN nothing to do", () => {
                    vm.handleIssueTypeChanged(null);
                    expect(vm.selectedContacts.length).toEqual(2);
                    expect(vm.selectedContacts[0].displayText).toEqual("USERA");
                    expect(vm.selectedContacts[1].displayText).toEqual("USERB");
                });
            });

            describe("AND the method handleIssueTypeChanged is called with the issuetypeid and there is no contact linked to this issuetype ", () => {
                it("THEN the method projectController.getIssueTypeLinkedContactDetails will be called and the selectedContacts will be empty", () => {
                    let defContact = $q.defer();
                    spyOn(ProjectController, "getIssueTypeLinkedContactDetails").and.returnValue(defContact.promise);
                    vm.handleIssueTypeChanged("id1");
                    defContact.resolve(new ap.services.apiHelper.ApiResponse([]));
                    $rootScope.$apply();
                    expect(ProjectController.getIssueTypeLinkedContactDetails).toHaveBeenCalled();
                    expect(vm.selectedContacts.length).toEqual(2);
                });
            });

            describe("AND the method handleIssueTypeChanged is called with the issuetypeid and there are some contacts linked to this issuetype ", () => {
                it("THEN the method projectController.getIssueTypeLinkedContactDetails will be called and the selectedContacts will be updated", () => {
                    let defContact = $q.defer();
                    spyOn(ProjectController, "getIssueTypeLinkedContactDetails").and.returnValue(defContact.promise);

                    let contact3: ap.models.projects.ContactDetails = new ap.models.projects.ContactDetails(Utility);
                    contact3.User = new ap.models.actors.User(Utility);
                    contact3.User.createByJson({ Id: "3", Alias: "UserC@netika.com" });
                    contact3.DisplayName = "USERC";

                    defContact.resolve([contact3]);

                    vm.handleIssueTypeChanged("id1");

                    $rootScope.$apply();

                    expect(ProjectController.getIssueTypeLinkedContactDetails).toHaveBeenCalled();
                    expect(vm.selectedContacts.length).toEqual(1);
                });
            });
        });
    });

    describe("Feature: initUsers with NoteInCharge", () => {
        let noteInChargeList: ap.models.notes.NoteInCharge[];
        let expectedList: ap.viewmodels.projects.ContactItemViewModel[];
        beforeEach(() => {
            noteInChargeList = [];

            let noteInCharge1: ap.models.notes.NoteInCharge = new ap.models.notes.NoteInCharge(Utility);
            noteInCharge1.UserId = "U1";
            noteInCharge1.Tag = "Sergio";

            let noteInCharge2: ap.models.notes.NoteInCharge = new ap.models.notes.NoteInCharge(Utility);
            noteInCharge2.UserId = "U2";
            noteInCharge2.Tag = "Renauld";

            noteInChargeList.push(noteInCharge1);
            noteInChargeList.push(noteInCharge2);

            expectedList = [];
            expectedList.push(new ap.viewmodels.projects.ContactItemViewModel("Sergio", "U1"));
            expectedList.push(new ap.viewmodels.projects.ContactItemViewModel("Renauld", "U2"));

            createViewModel();

        });
        describe("WHEN initUsers called with the list of NoteInCharge", () => {
            it("THEN, the selectedContacts list will be filled", () => {
                vm.initUsers(noteInChargeList);
                expect(vm.selectedContacts.length).toEqual(expectedList.length);
                expect(vm.selectedContacts[0]).toEqual(expectedList[0]);
                expect(vm.selectedContacts[1]).toEqual(expectedList[1]);
            });
        });
    });

    describe("Feature: initUsers", () => {
        let userList: ap.models.actors.User[];
        let expectedList: ap.viewmodels.projects.ContactItemViewModel[];
        beforeEach(() => {
            userList = [];

            let user1: ap.models.actors.User = new ap.models.actors.User(Utility);
            user1.createByJson({Id: "U1", DisplayName: "Sergio"});
            

            let user2: ap.models.actors.User = new ap.models.actors.User(Utility);
            user2.createByJson({ Id: "U2", DisplayName: "Renauld" });

            userList.push(user1);
            userList.push(user2);

            expectedList = [];
            expectedList.push(new ap.viewmodels.projects.ContactItemViewModel("Sergio", "U1"));
            expectedList.push(new ap.viewmodels.projects.ContactItemViewModel("Renauld", "U2"));

            createViewModel();

        });
        describe("WHEN initUsers called with the list of User", () => {
            it("THEN, the selectedContacts list will be filled", () => {
                vm.initUsers(userList);
                expect(vm.selectedContacts.length).toEqual(expectedList.length);
                expect(vm.selectedContacts[0]).toEqual(expectedList[0]);
                expect(vm.selectedContacts[1]).toEqual(expectedList[1]);
            });

        });
    });

    describe("Feature: addItem", () => {
        describe("When addItem is called with no index", () => {
            it("THEN, the item will be added into the selectedContact list", () => {
                createViewModel();
                let contactItem = new ap.viewmodels.projects.ContactItemViewModel("Sergio", "U1");
                vm.addItem(contactItem);
                expect(vm.selectedContacts.length).toEqual(1);
                expect(vm.selectedContacts[0]).toEqual(contactItem);
            });
        });
        describe("When addItem is called with specifiled index", () => {
            it("THEN, the item will be insert into the selectedContact list with the index", () => {
                createViewModel();
                let contactItem = new ap.viewmodels.projects.ContactItemViewModel("Sergio", "U1");
                vm.addItem(contactItem);

                let contactItem2 = new ap.viewmodels.projects.ContactItemViewModel("Renauld", "U2");
                vm.addItem(contactItem2, 0);

                expect(vm.selectedContacts.length).toEqual(2);
                expect(vm.selectedContacts[0]).toEqual(contactItem2);
                expect(vm.selectedContacts[1]).toEqual(contactItem);
            });
        });
    });

    describe("Feature: search", () => {
        let s: string;
        describe("When search is called", () => {
            beforeEach(() => {
                s = "abcd";
                createViewModel();
                spyOn(vm, "searchContacts");
                vm.search(s);
            });
            it("THEN, searchContacts is called", () => {
                expect(vm.searchContacts).toHaveBeenCalledWith(s);
            });
        });
    });

    describe("Feature: initializeSelectedValues", () => {
        let dic: Dictionary<string, string[]>;
        let defContact: any;
        let apiListEntity: ap.viewmodels.projects.ContactItemViewModel[];
        let result: ap.misc.IChipsItem[];
        let result2: ap.misc.IChipsItem[];
        let resultFromMethod: any;
        describe("When search is called", () => {
            let option: ap.services.apiHelper.ApiOption;
            beforeEach(() => {
                defContact = $q.defer();
                spyOn(Api, "getEntityList").and.returnValue(defContact.promise);
                option = new ap.services.apiHelper.ApiOption();
                option.isShowBusy = false;
                option.async = true;

                apiListEntity = [];
                apiListEntity.push(new ap.viewmodels.projects.ContactItemViewModel("User1", "1", "a", null, false, false, null, "User.Id"));
                apiListEntity.push(new ap.viewmodels.projects.ContactItemViewModel("User2", "2", "b", null, false, false, null, "User.Id"));

                result = [];
                result.push(new ap.viewmodels.projects.ContactItemViewModel("Company1", null, null, null, false, false, null, "Company"));
                result.push(new ap.viewmodels.projects.ContactItemViewModel("Company2", null, null, null, false, false, null, "Company"));
                result.push(new ap.viewmodels.projects.ContactItemViewModel("Role1", null, null, null, false, false, null, "Role"));
                result.push(new ap.viewmodels.projects.ContactItemViewModel("Role2", null, null, null, false, false, null, "Role"));

                result2 = [];
                result2.push(new ap.viewmodels.projects.ContactItemViewModel("User1", "1", "a", null, false, false, null, "User.Id"));
                result2.push(new ap.viewmodels.projects.ContactItemViewModel("User2", "2", "b", null, false, false, null, "User.Id"));
                result2.push(new ap.viewmodels.projects.ContactItemViewModel("Company1", null, null, null, false, false, null, "Company"));
                result2.push(new ap.viewmodels.projects.ContactItemViewModel("Company2", null, null, null, false, false, null, "Company"));

                createViewModel();
            });
            describe("with 'Guid' key", () => {
                let filter: string;
                let option: ap.services.apiHelper.ApiOption;
                let listContact: ap.models.projects.ContactDetails[];
                beforeEach(() => {
                    option = new ap.services.apiHelper.ApiOption();
                    option.isShowBusy = false;
                    option.async = true;

                    dic = new Dictionary<string, string[]>();
                    dic.add("Company", ["Company1", "Company2"]);
                    dic.add("Guid", ["1", "2"]);
                    filter = "Filter.And(Filter.Eq(ProjectId,45152-56),Filter.Contains(User.Id,\"1, 2\"))";

                    listContact = [];
                    let contact1: ap.models.projects.ContactDetails = new ap.models.projects.ContactDetails(Utility);
                    contact1.User = new ap.models.actors.User(Utility);
                    contact1.User.createByJson({ Id: "1", Alias: "a" });
                    contact1.DisplayName = "User1";

                    let contact2: ap.models.projects.ContactDetails = new ap.models.projects.ContactDetails(Utility);
                    contact2.User = new ap.models.actors.User(Utility);
                    contact2.User.createByJson({ Id: "2", Alias: "b" });
                    contact2.DisplayName = "User2";

                    listContact.push(contact1);
                    listContact.push(contact2);

                    resultFromMethod = vm.initializeSelectedValues(dic);
                    defContact.resolve(new ap.services.apiHelper.ApiResponse(listContact));
                    $rootScope.$apply();
                });
                it("THEN, getEntityList is called with correct params", () => {
                    expect(Api.getEntityList).toHaveBeenCalledWith("ContactDetails", filter, "User", null, null, option);
                });
                it("THEN, the method return result2", () => {
                    expect(resultFromMethod.$$state.value).toEqual(result2);
                });
            });
            describe("with another key", () => {
                beforeEach(() => {
                    dic = new Dictionary<string, string[]>();
                    dic.add("Company", ["Company1", "Company2"]);
                    dic.add("Role", ["Role1", "Role2"]);

                    resultFromMethod = vm.initializeSelectedValues(dic);
                    $rootScope.$apply();
                });
                it("THEN, the method return result", () => {
                   expect(resultFromMethod.$$state.value).toEqual(result);
                });
            });
        });
    });
});