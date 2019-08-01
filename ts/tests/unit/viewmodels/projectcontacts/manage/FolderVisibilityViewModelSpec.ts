describe("Module ap-viewmodels - FolderVisibilityViewModel", () => {
    let vm: ap.viewmodels.projectcontacts.FolderVisibilityViewModel;
    let Utility: ap.utility.UtilityHelper;
    let $q: angular.IQService;
    let folder: ap.models.projects.Folder;

    beforeEach(() => {
        angular.mock.module("ap-viewmodels");
        angular.mock.module("ap-services");
    });

    beforeEach(inject((_Utility_, _$q_) => {
        Utility = _Utility_;
        $q = _$q_;
        vm = new ap.viewmodels.projectcontacts.FolderVisibilityViewModel(Utility, $q);
        folder = new ap.models.projects.Folder(Utility);

        specHelper.userContext.stub(Utility);
    }));

    describe("Feature: Constructor", () => {
        describe("WHEN the vm is created", () => {
            it("THEN, the created object is defined", () => {
                expect(vm).toBeDefined();
            });
            it("THEN, hasAccess is falsy", () => {
                expect(vm.hasAccess).toBeFalsy();
            });
            it("THEN, canShare is truthy", () => {
                expect(vm.canShare).toBeTruthy();
            });
        })
    });

    describe("Feature: canChange", () => {
        beforeEach(() => {
            let folderVisiblity = new ap.models.projects.FolderVisibility(Utility);
            folderVisiblity.createByJson({
                InvitedUser: {
                    Id: "111"
                },
                InvitedUserId: "111",
                IsCreator: true
            });
            folder.IsPublic = false;
            folder.createByJson({ EntityCreationUser: "123"});
            vm.folder = folder;
            vm.folderVisibility = folderVisiblity;
            let contact: ap.models.projects.ContactDetails = new ap.models.projects.ContactDetails(Utility);
            contact.createByJson({ User: { Id: "123" } });
            vm.contact = contact;
        });

        describe("WHEN the folder creator is the contact", () => {
            it("THEN canchange = false", () => {
                expect(vm.canChange).toBeFalsy();
            });
        });
    });


    describe("Feature: hasChanged", () => {

        beforeEach(() => {
            folder.IsPublic = false;
            vm.folder = folder;
            let contact: ap.models.projects.ContactDetails = new ap.models.projects.ContactDetails(Utility);
            contact.createByJson({ User: { Id: "123" } });
            vm.contact = contact;
        });

        describe("WHEN hasAccess == true and folderVisibility is not defined", () => {
            beforeEach(() => {
                vm.hasAccess = true;
            });
            it("THEN hasChanged should be true", () => {
                expect(vm.hasChanged).toBeTruthy();
            });
        });
        describe("WHEN hasAccess == false and folderVisibility is  defined", () => {
            beforeEach(() => {
                let folderVisibility: ap.models.projects.FolderVisibility = new ap.models.projects.FolderVisibility(Utility);
                folderVisibility.createByJson({
                    InvitedUser: new ap.models.actors.User(Utility).toJSON()
                });
                vm.folderVisibility = folderVisibility;
                vm.hasAccess = false;
            });
            it("THEN hasChanged should be true", () => {
                expect(vm.hasChanged).toBeTruthy();
            });
        });
        describe("WHEN hasAccess == false and folderVisibility is not defined", () => {
            beforeEach(() => {
                vm.hasAccess = false;
            });
            it("THEN hasChanged should be false", () => {
                expect(vm.hasChanged).toBeFalsy();
            });
        });
        describe("WHEN hasAccess == true and folderVisibility is defined", () => {
            beforeEach(() => {
                let folderVisibility: ap.models.projects.FolderVisibility = new ap.models.projects.FolderVisibility(Utility);
                folderVisibility.createByJson({
                    InvitedUser: new ap.models.actors.User(Utility).toJSON()
                });
                vm.folderVisibility = folderVisibility;
                vm.hasAccess = true;
            });
            it("THEN hasChanged should be false", () => {
                expect(vm.hasChanged).toBeFalsy();
            });
        });
    });

    describe("Feature: canShare", () => {

        describe("WHEN folder with folderVisiblity and invitedUser === CurrentUser", () => {
            beforeEach(() => {
                vm.folder = new ap.models.projects.Folder(Utility);
                let folderVisiblity = new ap.models.projects.FolderVisibility(Utility);
                folderVisiblity.createByJson({
                    InvitedUser: {
                        Id: "111"
                    },
                    InvitedUserId: "111",
                    IsCreator: true
                });
                vm.folder.createByJson({
                    Id: "123",
                    VAL: [folderVisiblity]
                });
            });
            it("THEN canShare should be true", () => {
                expect(vm.canShare).toBeTruthy();
            });
        });
        describe("WHEN project with access CanEditAllFolder is true", () => {
            beforeEach(() => {
                let project = new ap.models.projects.Project(Utility);
                project.createByJson({
                    Id: "acv",
                    UserAccessRight: {
                        CanEditAllFolder: true
                    }
                })
                vm = new ap.viewmodels.projectcontacts.FolderVisibilityViewModel(Utility, $q, undefined, project);
                vm.folder = new ap.models.projects.Folder(Utility);
                let folderVisiblity = new ap.models.projects.FolderVisibility(Utility);
                folderVisiblity.InvitedUser = new ap.models.actors.User(Utility);
                folderVisiblity.InvitedUser.createByJson({ Id: "111" });
                vm.folder.createByJson({
                    Id: "123",
                    VAL: [folderVisiblity]
                });

            });
            it("THEN canShare should be true", () => {
                expect(vm.canShare).toBeTruthy();
            });
        });
    });
});