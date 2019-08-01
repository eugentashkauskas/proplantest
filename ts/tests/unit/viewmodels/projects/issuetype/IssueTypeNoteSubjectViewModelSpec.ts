describe("Module ap-viewmodels - IssueTypeNoteSubjectViewModel", () => {
    let $rootScope: angular.IRootScopeService, $scope: angular.IScope;
    let Utility: ap.utility.UtilityHelper, UserContext: ap.utility.UserContext;
    let vm: ap.viewmodels.projects.IssueTypeNoteSubjectViewModel;
    
    let $q: angular.IQService;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject(function (_$rootScope_, _UserContext_, _Utility_, _$q_) {
        Utility = _Utility_;
        UserContext = _UserContext_;
        $rootScope = _$rootScope_;
        $q = _$q_;
        $scope = $rootScope.$new();
        specHelper.utility.stubRootUrl(Utility);
        specHelper.userContext.stub(Utility);
        specHelper.utility.stubStorageSet(Utility);
    }));

    describe("Constructor", () => {
        describe("WHEN IssueTypeNoteSubjectViewModel is created", () => {
            it("THEN, the properties are filled with the default values", () => {
                vm = new ap.viewmodels.projects.IssueTypeNoteSubjectViewModel(Utility);

                expect(vm.subject).toBe("");
                expect(vm.displayOrder).toBe(0);
                expect(vm.defaultDescription).toBe("");
                expect(vm.issueTypeViewModel).toBeNull();
                expect(vm.isMarkedToDelete).toBeFalsy();
                expect(vm.actions.length).toEqual(2);
                expect(vm.isDuplicated).toBeFalsy();
                expect(vm.actions[0].name).toEqual("notesubject.insert");
                expect(vm.actions[1].name).toEqual("notesubject.delete");
            });
        });

        describe("WHEN IssueTypeNoteSubjectViewModel is created with IssueTypeNoteSubject is null", () => {
            it("THEN, the properties are filled with the default values", () => {

                let issueTypeNoteSubject: ap.models.projects.IssueTypeNoteSubject;

                vm = new ap.viewmodels.projects.IssueTypeNoteSubjectViewModel(Utility);
                vm.init(issueTypeNoteSubject);

                expect(vm.subject).toBe("");
                expect(vm.defaultDescription).toBe("");
                expect(vm.displayOrder).toBe(0);
                expect(vm.issueTypeViewModel).toBeNull();
                expect(vm.isMarkedToDelete).toBeFalsy();
                expect(vm.actions.length).toEqual(2);
                expect(vm.actions[0].name).toEqual("notesubject.insert");
                expect(vm.actions[1].name).toEqual("notesubject.delete");
            });
        });

        describe("WHEN IssueTypeNoteSubjectViewModel is created with IssueTypeNoteSubject and issueTypeNoteSubject.IssueType is defined", () => {
            it("THEN, the properties are filled with properties of IssueTypeNoteSubject with vm.issueTypeViewModel.issueType is issueTypeNoteSubject.IssueType", () => {

                let issueTypeNoteSubject: ap.models.projects.IssueTypeNoteSubject = new ap.models.projects.IssueTypeNoteSubject(Utility);
                issueTypeNoteSubject.Subject = "SubjectCon";
                issueTypeNoteSubject.DisplayOrder = 7;
                issueTypeNoteSubject.DefaultDescription = "Default description";
                issueTypeNoteSubject.IssueType = new ap.models.projects.IssueType(Utility);
                issueTypeNoteSubject.IssueType.Code = "CON";
                issueTypeNoteSubject.IssueType.Description = "Conrecte";

                vm = new ap.viewmodels.projects.IssueTypeNoteSubjectViewModel(Utility);
                vm.init(issueTypeNoteSubject);

                expect(vm.subject).toEqual("SubjectCon");
                expect(vm.defaultDescription).toEqual("Default description");
                expect(vm.displayOrder).toEqual(7);
                expect(vm.issueTypeViewModel.issueType).toBe(issueTypeNoteSubject.IssueType);
                expect(vm.isMarkedToDelete).toBeFalsy();
                expect(vm.actions.length).toEqual(2);
                expect(vm.actions[0].name).toEqual("notesubject.insert");
                expect(vm.actions[1].name).toEqual("notesubject.delete");
            });
        });

        describe("WHEN IssueTypeNoteSubjectViewModel is created with IssueTypeNoteSubject and issueTypeNoteSubject.IssueType is undefined", () => {
            it("THEN, the properties are filled with properties of IssueTypeNoteSubject with vm.issueTypeViewModel.issueType is null", () => {

                let issueTypeNoteSubject: ap.models.projects.IssueTypeNoteSubject = new ap.models.projects.IssueTypeNoteSubject(Utility);
                issueTypeNoteSubject.IssueType = null;

                vm = new ap.viewmodels.projects.IssueTypeNoteSubjectViewModel(Utility);
                vm.init(issueTypeNoteSubject);

                expect(vm.subject).toEqual(vm.issueTypeNoteSubject.Subject);
                expect(vm.defaultDescription).toEqual(vm.issueTypeNoteSubject.DefaultDescription);
                expect(vm.displayOrder).toEqual(vm.issueTypeNoteSubject.DisplayOrder);
                expect(vm.issueTypeViewModel).toBeNull();
                expect(vm.isMarkedToDelete).toBeFalsy();
                expect(vm.actions.length).toEqual(2);
                expect(vm.actions[0].name).toEqual("notesubject.insert");
                expect(vm.actions[1].name).toEqual("notesubject.delete");
            });
        });


        describe("WHEN postChanges is called with with issueTypeNoteSubject have IssueType is defined", () => {
            it("THEN, the properties of IssueTypeNoteSubjectViewModel will fill to properties of IssueTypeNoteSubject but IssueType no change", () => {

                let issueTypeNoteSubject: ap.models.projects.IssueTypeNoteSubject = new ap.models.projects.IssueTypeNoteSubject(Utility);
                issueTypeNoteSubject.Subject = "SubjectCon";
                issueTypeNoteSubject.DefaultDescription = "Default description";
                issueTypeNoteSubject.DisplayOrder = 7;
                issueTypeNoteSubject.IssueType = new ap.models.projects.IssueType(Utility);
                issueTypeNoteSubject.IssueType.Code = "CON";
                issueTypeNoteSubject.IssueType.Description = "Conrecte";

                vm = new ap.viewmodels.projects.IssueTypeNoteSubjectViewModel(Utility);
                vm.init(issueTypeNoteSubject);
                vm.subject = "SubConrecte";
                vm.defaultDescription = "Description updated";
                vm.displayOrder = 9;

                vm.postChanges();

                expect(vm.issueTypeNoteSubject.Subject).toEqual("SubConrecte");
                expect(vm.issueTypeNoteSubject.DefaultDescription).toEqual("Description updated");
                expect(vm.issueTypeNoteSubject.DisplayOrder).toBe(9);
                expect(vm.issueTypeNoteSubject.IssueType).toBe(issueTypeNoteSubject.IssueType);
            });
        });

        describe("WHEN postChanges is called with issueTypeNoteSubject have without IssueType", () => {
            it("THEN, IssueType of IssueTypeNoteSubject no change", () => {


                let issueTypeNoteSubject: ap.models.projects.IssueTypeNoteSubject = new ap.models.projects.IssueTypeNoteSubject(Utility);
                issueTypeNoteSubject.IssueType = null;

                vm = new ap.viewmodels.projects.IssueTypeNoteSubjectViewModel(Utility);
                vm.init(issueTypeNoteSubject);

                vm.postChanges();

                expect(vm.issueTypeNoteSubject.IssueType).toBeNull();

            });
        });

    });

    describe("Feature: isDuplicated", () => {
        describe("WHEN isDuplicated is set", () => {
            it("THEN, the value of the property is changed", () => {
                vm = new ap.viewmodels.projects.IssueTypeNoteSubjectViewModel(Utility);
                vm.isDuplicated = true;
                expect(vm.isDuplicated).toBeTruthy();
            });
        });
    });

    describe("WHEN hasChanged is called", () => {
        let issueTypeNoteSubjectVm: ap.viewmodels.projects.IssueTypeNoteSubjectViewModel;
        let originalEntity: ap.models.projects.IssueTypeNoteSubject;
        beforeEach(() => {
            issueTypeNoteSubjectVm = new ap.viewmodels.projects.IssueTypeNoteSubjectViewModel(Utility);
        });
        describe("WHEN the originalEntity.isNew = true", () => {
            beforeEach(() => {
                originalEntity = new ap.models.projects.IssueTypeNoteSubject(Utility);
                issueTypeNoteSubjectVm.init(originalEntity);
            });
            it("THEN hasChanged return true", () => {
                expect(issueTypeNoteSubjectVm.hasChanged).toBeTruthy();
            });
        });
        describe("WHEN the originalEntity.isNew = false", () => {
            describe("WHEN the originalEntity is the same", () => {
                beforeEach(() => {
                    originalEntity = new ap.models.projects.IssueTypeNoteSubject(Utility);
                    originalEntity.createByJson({ Subject: "aaa" });
                    issueTypeNoteSubjectVm.init(originalEntity);
                });
                it("THEN hasChanged return false", () => {
                    expect(issueTypeNoteSubjectVm.hasChanged).toBeFalsy();
                });
            });
            describe("WHEN the originalEntity is not the same", () => {
                beforeEach(() => {
                    originalEntity = new ap.models.projects.IssueTypeNoteSubject(Utility);
                    originalEntity.createByJson({ Subject: "aaa" });
                    issueTypeNoteSubjectVm.init(originalEntity);
                    issueTypeNoteSubjectVm.subject = "bbb";
                });
                it("THEN hasChanged return true", () => {
                    expect(issueTypeNoteSubjectVm.hasChanged).toBeTruthy();
                });
            });
            describe("WHEN the originalEntity is markedToDelete", () => {
                beforeEach(() => {
                    originalEntity = new ap.models.projects.IssueTypeNoteSubject(Utility);
                    issueTypeNoteSubjectVm.init(originalEntity);
                    issueTypeNoteSubjectVm.isMarkedToDelete;
                });
                it("THEN hasChanged return true", () => {
                    expect(issueTypeNoteSubjectVm.hasChanged).toBeTruthy();
                });
            });
        });
    });

    describe("Feature: actionClicked", () => {
        let callback;
        beforeEach(() => {
            callback = jasmine.createSpy("callback");
            vm = new ap.viewmodels.projects.IssueTypeNoteSubjectViewModel(Utility);
        });
        describe("WHEN, actionCliked is called with param = notesubject.insert ", () => {
            beforeEach(() => {
                vm.on("insertrowrequested", callback, this);
                vm.actionClicked("notesubject.insert");
            });
            it("THEN, event insertrowrequested is raised", () => {
                expect(callback).toHaveBeenCalledWith(vm);
            });
        });
        describe("WHEN, actionCliked is called with param = notesubject.delete ", () => {
            beforeEach(() => {
                vm.actionClicked("notesubject.delete");
            });
            it("THEN, isMarkedToDelete = true", () => {
                expect(vm.isMarkedToDelete).toBeTruthy();
            });
            it("THEN, isVisible = false", () => {
                expect(vm.actions[1].isVisible).toBeFalsy();
            });
        });
    });

    describe("Feature: undoDelete", () => {
        beforeEach(() => {
            vm = new ap.viewmodels.projects.IssueTypeNoteSubjectViewModel(Utility);
        });
        describe("WHEN, undoDelete is called", () => {
            beforeEach(() => {
                vm.undoDelete();
            });
            it("THEN, isMarkedToDelete = false", () => {
                expect(vm.isMarkedToDelete).toBeFalsy();
            });
            it("THEN, isVisible = true", () => {
                expect(vm.actions[1].isVisible).toBeTruthy();
            });
        });
    });

    describe("Feature: 'propertychanged' event", () => {
        let callback: (args?: any) => void;

        beforeEach(() => {
            callback = jasmine.createSpy("callback");
        });

        describe("WHEN subject of the vm is changed", () => {
            it("THEN, the 'propertychanged' event will be fired", () => {
                vm = new ap.viewmodels.projects.IssueTypeNoteSubjectViewModel(Utility);
                vm.subject = "Initial subject";

                vm.on("propertychanged", callback, this);
                vm.subject = "Test changed";

                expect(callback).toHaveBeenCalledWith(new ap.viewmodels.base.PropertyChangedEventArgs("subject", "Initial subject", vm));
            });
        });
    });
    describe("Feature: set subject", () => {
        beforeEach(() => {
            vm = new ap.viewmodels.projects.IssueTypeNoteSubjectViewModel(Utility);
        });
        describe("WHEN subject is valid", () => {
            beforeEach(() => {
                vm.subject = "Initial subject";
            });
            it("THEN, vm.isValid = true", () => {
                expect(vm.isValid()).toBeTruthy();
            });
        });
        describe("WHEN subject is not valid", () => {
            beforeEach(() => {
                vm.subject = "";
            });
            it("THEN, vm.isValid = false", () => {
                expect(vm.isValid()).toBeFalsy();
            });
        });
    });
});