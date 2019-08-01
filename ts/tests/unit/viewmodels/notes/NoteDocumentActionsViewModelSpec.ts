describe("Module ap-viewmodels - notes components - NoteDocumentActionsViewModel", () => {
    let vm: ap.viewmodels.notes.NoteDocumentActionsViewModel;
    let Utility: ap.utility.UtilityHelper;
    let MainController: ap.controllers.MainController;
    let DocumentController: ap.controllers.DocumentController;
    let currentProject: any;
    let doc: ap.models.documents.Document;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject(function (_Utility_, _DocumentController_, _MainController_) {
        Utility = _Utility_;
        MainController = _MainController_;
        DocumentController = _DocumentController_;

        specHelper.userContext.stub(Utility);
        specHelper.utility.stubRootUrl(_Utility_);
        specHelper.utility.stubCreateGuid();
        specHelper.utility.stubStorageSet(_Utility_);

        currentProject = {
            Id: "45152-56",
            Name: "test",
            Code: "PR",
            UserAccessRight: {
                CanArchiveDoc: true,
                CanDownloadDoc: true,
                CanUploadDoc: true,
                CanDeleteDoc: true,
                CanEditDoc: true
            },
            PhotoFolderId: "45121004",
            IsActive: true
        };
        spyOn(MainController, "currentProject").and.callFake((val) => {
            if (val === undefined) {
                return currentProject;
            }
        });

        
    }));


    function getActionByName(name: string): ap.viewmodels.home.ActionViewModel {
        return ap.viewmodels.home.ActionViewModel.getAction(vm.actions, name);
    }

    function setUpAccessRights(rights: any) {
        for (let rightName in rights) {
            specHelper.general.spyProperty(ap.models.accessRights.DocumentAccessRight.prototype, rightName, specHelper.PropertyAccessor.Get).and.returnValue(rights[rightName]);
        }
    }

    function tearDownAccessRights() {
        for (let propertyName in ap.models.accessRights.DocumentAccessRight.prototype) {
            specHelper.general.offSpyProperty(ap.models.accessRights.DocumentAccessRight.prototype, propertyName, specHelper.PropertyAccessor.Get);
        }
    }

    function createVm(customAccessRights?: any): ap.viewmodels.notes.NoteDocumentActionsViewModel {
        if (customAccessRights) {
            setUpAccessRights(customAccessRights);
        }

        let docJSON = {
            Id: "28A2D91F-C098-40D2-8729-91E66785F424",
            EntityVersion: 1,
            IsArchived: true
        }

        doc = new ap.models.documents.Document(Utility);
        doc.createByJson(docJSON);
        doc.FileType = ap.models.documents.FileType.Plan;
        doc.Status = ap.models.documents.DocumentStatus.Processed;
        doc.ProcessingStatus = ap.models.documents.ProcessingStatus.FullyCompleted;
        doc.Author = new ap.models.actors.User(Utility);
        return new ap.viewmodels.notes.NoteDocumentActionsViewModel(Utility, doc, DocumentController, MainController);
    }

    describe("Feature: constructor", () => {
        afterEach(() => {
            tearDownAccessRights();
        });
        describe("WHEN a view model is initialized", () => {
            beforeEach(() => {
                vm = createVm({ canEditDoc: true });
            });
            it("THEN there are 3 actions defined", () => {
                expect(vm.actions.length).toEqual(3);
            });
            it("THEN the 1st action is Preview", () => {
                expect(vm.actions[0].name).toEqual("notedoc.preview");
            });
            it("THEN the 2nd action is Download", () => {
                expect(vm.actions[1].name).toEqual("notedoc.download");
            });
            it("THEN the 3rd action is Delete", () => {
                expect(vm.actions[2].name).toEqual("notedoc.delete");
            });
            it("THEN the Preview action is invisible by default", () => {
                expect(getActionByName("notedoc.preview").isVisible).toBeFalsy();
            });
            it("THEN the Preview action is disabled by default", () => {
                expect(getActionByName("notedoc.preview").isEnabled).toBeFalsy();
            });
            it("THEN the Download action is invisible by default", () => {
                expect(getActionByName("notedoc.download").isVisible).toBeFalsy();
            });
            it("THEN the Download action is disabled by default", () => {
                expect(getActionByName("notedoc.download").isEnabled).toBeFalsy();
            });
            it("THEN the Delete action is invisible by default", () => {
                expect(getActionByName("notedoc.delete").isVisible).toBeFalsy();
            });
            it("THEN the Delete action is disabled by default", () => {
                expect(getActionByName("notedoc.delete").isEnabled).toBeFalsy();
            });
        });
    });

    describe("Feature: canDelete property", () => {
        afterEach(() => {
            tearDownAccessRights();
        });
        describe("WHEN canDelete is set to true", () => {
            beforeEach(() => {
                vm = createVm({ canEditDoc: true });
                vm.canDelete = true;
            });
            it("THEN the Delete action becomes visible", () => {
                expect(getActionByName("notedoc.delete").isVisible).toBeTruthy();
            });
            it("THEN the Delete action becomed enabled", () => {
                expect(getActionByName("notedoc.delete").isEnabled).toBeTruthy();
            });
        });
        describe("WHEN canDelete is set to false", () => {
            beforeEach(() => {
                vm = createVm({ canEditDoc: true });
                vm.canDelete = true;
                vm.canDelete = false;
            });
            it("THEN the Delete action becomes invisible", () => {
                expect(getActionByName("notedoc.delete").isVisible).toBeFalsy();
            });
            it("THEN the Delete action becomed desabled", () => {
                expect(getActionByName("notedoc.delete").isEnabled).toBeFalsy();
            });
        });
    });

    describe("Feature: canDownload property", () => {
        afterEach(() => {
            tearDownAccessRights();
        });
        describe("WHEN canDownload is set to true", () => {
            beforeEach(() => {
                vm = createVm({ canEditDoc: true });
                vm.canDownload = true;
            });
            it("THEN the Download action becomes visible", () => {
                expect(getActionByName("notedoc.download").isVisible).toBeTruthy();
            });
            it("THEN the Download action becomed enabled", () => {
                expect(getActionByName("notedoc.download").isEnabled).toBeTruthy();
            });
        });
        describe("WHEN canDownload is set to false", () => {
            beforeEach(() => {
                vm = createVm({ canEditDoc: true });
                vm.canDownload = true;
                vm.canDownload = false;
            });
            it("THEN the Download action becomes invisible", () => {
                expect(getActionByName("notedoc.download").isVisible).toBeFalsy();
            });
            it("THEN the Download action becomed desabled", () => {
                expect(getActionByName("notedoc.download").isEnabled).toBeFalsy();
            });
        });
    });

    describe("Feature: canPreview property", () => {
        afterEach(() => {
            tearDownAccessRights();
        });
        describe("WHEN canPreview is set to true and isPreviewMode is set to false", () => {
            beforeEach(() => {
                vm = createVm({ canEditDoc: true });
                vm.canPreview = true;
                vm.isPreviewMode = false;
            });
            it("THEN the canPreview action becomes visible", () => {
                expect(getActionByName("notedoc.preview").isVisible).toBeTruthy();
            });
            it("THEN the canPreview action becomed enabled", () => {
                expect(getActionByName("notedoc.preview").isEnabled).toBeTruthy();
            });
        });
        describe("WHEN canPreview is set to false and isPreviewMode is set to false", () => {
            beforeEach(() => {
                vm = createVm({ canEditDoc: true });
                vm.canPreview = false;
                vm.isPreviewMode = false;
            });
            it("THEN the canPreview action becomes invisible", () => {
                expect(getActionByName("notedoc.preview").isVisible).toBeFalsy();
            });
            it("THEN the canPreview action becomed disabled", () => {
                expect(getActionByName("notedoc.preview").isEnabled).toBeFalsy();
            });
        });
        describe("WHEN canPreview is set to true and isPreviewMode is set to true", () => {
            beforeEach(() => {
                vm = createVm({ canEditDoc: true });
                vm.canPreview = true;
                vm.isPreviewMode = true;
            });
            it("THEN the canPreview action becomes invisible", () => {
                expect(getActionByName("notedoc.download").isVisible).toBeFalsy();
            });
            it("THEN the canPreview action becomed disabled", () => {
                expect(getActionByName("notedoc.download").isEnabled).toBeFalsy();
            });
        });
        describe("WHEN canPreview is set to false and isPreviewMode is set to true", () => {
            beforeEach(() => {
                vm = createVm({ canEditDoc: true });
                vm.canPreview = false;
                vm.isPreviewMode = true;
            });
            it("THEN the canPreview action becomes invisible", () => {
                expect(getActionByName("notedoc.download").isVisible).toBeFalsy();
            });
            it("THEN the canPreview action becomed disabled", () => {
                expect(getActionByName("notedoc.download").isEnabled).toBeFalsy();
            });
        });
    });

    describe("Feature: isPreviewMode property", () => {
        afterEach(() => {
            tearDownAccessRights();
        });
        describe("WHEN canPreview is set to true and isPreviewMode becomes true", () => {
            beforeEach(() => {
                vm = createVm({ canEditDoc: true });
                vm.canPreview = true;
                vm.isPreviewMode = true;
            });
            it("THEN the canPreview action becomes invisible", () => {
                expect(getActionByName("notedoc.preview").isVisible).toBeFalsy();
            });
            it("THEN the canPreview action becomed disabled", () => {
                expect(getActionByName("notedoc.preview").isEnabled).toBeFalsy();
            });
        });

        describe("WHEN canPreview is set to true and isPreviewMode becomes false", () => {
            beforeEach(() => {
                vm = createVm({ canEditDoc: true });
                vm.canPreview = true;
                vm.isPreviewMode = true;
                vm.isPreviewMode = false;
            });
            it("THEN the canPreview action becomes visible", () => {
                expect(getActionByName("notedoc.preview").isVisible).toBeTruthy();
            });
            it("THEN the canPreview action becomed enabled", () => {
                expect(getActionByName("notedoc.preview").isEnabled).toBeTruthy();
            });
        });
    });
});