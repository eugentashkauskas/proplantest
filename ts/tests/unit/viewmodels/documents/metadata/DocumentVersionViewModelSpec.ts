describe("Module ap-viewmodels - DocumentVersionViewModel", () => {
    let ControllersManager: ap.controllers.ControllersManager;
    let Utility: ap.utility.UtilityHelper;
    let version: ap.models.documents.Version;
    let vm: ap.viewmodels.documents.DocumentVersionViewModel;
    
    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject((_Utility_, _ControllersManager_) => {
        Utility = _Utility_;
        ControllersManager = _ControllersManager_;
    }));

    beforeEach(() => {
        vm = new ap.viewmodels.documents.DocumentVersionViewModel(Utility, ControllersManager);
    });

    describe("actions", () => {
        describe("WHEN a constructor is called", () => {
            it("THEN there are 2 actions defined", () => {
                expect(vm.actions.length).toBe(2);
            });

            it("THEN the first action is download", () => {
                expect(vm.actions[0].name).toEqual("documentversion.download");
            });

            it("THEN the second action is preview", () => {
                expect(vm.actions[1].name).toEqual("documentversion.open");
            });

            it("THEN the dowload action is visible", () => {
                expect(vm.actions[0].isVisible).toBeTruthy();
            });

            it("THEN the download action is enabled", () => {
                expect(vm.actions[0].isEnabled).toBeTruthy();
            });

            it("THEN the preview action is visible", () => {
                expect(vm.actions[1].isVisible).toBeTruthy();
            });

            it("THEN the preview action is enabled", () => {
                expect(vm.actions[1].isEnabled).toBeTruthy();
            });
        });
    });

    describe("version", () => {
        describe("WHEN the accessor is used and a version is configured", () => {
            beforeEach(() => {
                version = new ap.models.documents.Version(Utility);
                vm.init(version);
            });

            it("THEN the given version value is returned", () => {
                expect(vm.version).toEqual(version);
            });
        });

        describe("WHEN the accessor is called and there is no version configured", () => {
            it("THEN a null values is returned", () => {
                expect(vm.version).toBe(null);
            });
        });
    });

    describe("document", () => {
        describe("WHEN the accessor is used and a document is configured", () => {
            let testDocument: ap.models.documents.Document;

            beforeEach(() => {
                testDocument = new ap.models.documents.Document(Utility);
                version = new ap.models.documents.Version(Utility);
                vm.init(version, testDocument);
            });

            it("THEN the given document value is returned", () => {
                expect(vm.document).toEqual(testDocument);
            });
        });

        describe("WHEN the accessor is called and there is no document configured", () => {
            it("THEN a null values is returned", () => {
                expect(vm.document).toBe(null);
            });
        });
    });

    describe("actionClick", () => {
        let testDocument: ap.models.documents.Document;

        beforeEach(() => {
            version = new ap.models.documents.Version(Utility);
            testDocument = new ap.models.documents.Document(Utility);
            vm.init(version, testDocument);
        });

        describe("WHEN a documentversion.download action occurs", () => {
            beforeEach(() => {
                spyOn(ControllersManager.documentController, "downloadDocument").and.stub();
                vm.actionClick("documentversion.download");
            });

            it("THEN the downloadDocument method of the DocumentController is called", () => {
                expect(ControllersManager.documentController.downloadDocument).toHaveBeenCalledWith(testDocument, version);
            });
        });

        describe("WHEN, called open document action", () => {
            let actionName: string;
            let openDocument: jasmine.Spy;
            beforeEach(() => {
                openDocument = spyOn(ControllersManager.documentController, "openDocument");
                actionName = "documentversion.open";
                vm.actionClick(actionName);
            });

            it("THEN, must called openDocument method of the DocumentController", () => {
                expect(openDocument).toHaveBeenCalled();
            });
        });
    });
});
