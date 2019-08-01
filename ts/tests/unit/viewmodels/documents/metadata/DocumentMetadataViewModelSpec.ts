describe("Module ap-viewmodels - DocumentMetadataViewModel", () => {
    let $rootScope: angular.IRootScopeService,
        $utility: ap.utility.UtilityHelper,
        $interval: angular.IIntervalService,
        $q: angular.IQService,
        $location: angular.ILocationService,
        $anchorScroll: angular.IAnchorScrollService,
        ControllersManager: ap.controllers.ControllersManager,
        vm: ap.viewmodels.documents.DocumentMetadataViewModel;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject((_$rootScope_, _Utility_, _$interval_, _$q_, _$location_, _$anchorScroll_, _ControllersManager_) => {
        $rootScope = _$rootScope_;
        $utility = _Utility_;
        $interval = _$interval_;
        $q = _$q_;
        $location = _$location_;
        $anchorScroll = _$anchorScroll_;
        ControllersManager = _ControllersManager_;
    }));

    beforeEach(() => {
        vm = new ap.viewmodels.documents.DocumentMetadataViewModel($utility, $interval, $q, ControllersManager, $location, $anchorScroll);
    });

    describe("Feature: init", () => {
        let testDocument: ap.models.documents.Document;

        beforeEach(() => {
            testDocument = new ap.models.documents.Document($utility);
            testDocument.Versions = [new ap.models.documents.Version($utility)];
        });

        describe("WHEN init method is called", () => {
            beforeEach(() => {
                vm.init(testDocument);
            });

            it("THEN the given document is used", () => {
                expect(vm.originalEntity).toEqual(testDocument);
            });

            it("THEN versions are extracted from the given document", () => {
                expect(vm.versions.length).toEqual(1);
            });
        });
    });

    describe("Feature: loadDocument", () => {
        let testDocument: ap.models.documents.Document;
        let documentLoader: angular.IDeferred<any>;

        beforeEach(() => {
            testDocument = new ap.models.documents.Document($utility);
            testDocument.Versions = [new ap.models.documents.Version($utility)];

            spyOn(ControllersManager.documentController, "getFullDocumentById").and.callFake(() => {
                documentLoader = $q.defer<any>();
                return documentLoader.promise;
            });
        });

        describe("WHEN it is called with an id of a document", () => {
            beforeEach(() => {
                vm.loadDocument("id");
            });

            it("THEN, a document is loaded from the server", () => {
                expect(ControllersManager.documentController.getFullDocumentById).toHaveBeenCalledWith("id", false, true);
            });

            describe("AND a document is successfully loaded", () => {
                beforeEach(() => {
                    documentLoader.resolve(new ap.controllers.FullDocumentResponse(testDocument));
                    $rootScope.$digest();
                });

                it("THEN the loaded document is used for the view model", () => {
                    expect(vm.document).toEqual(testDocument);
                });

                it("THEN versions of the loaded document are ued for the view model", () => {
                    expect(vm.versions.length).toEqual(testDocument.Versions.length);
                });
            });

            describe("AND a document is not loaded", () => {
                beforeEach(() => {
                    spyOn(ControllersManager.mainController, "showError").and.stub();

                    documentLoader.reject("error");
                    $rootScope.$digest();
                });

                it("THEN the showError method is called", () => {
                    expect(ControllersManager.mainController.showError).toHaveBeenCalled();
                });
            });
        });

        describe("WHEN it is called without an id of a document", () => {
            beforeEach(() => {
                vm.loadDocument();
            });

            it("THEN, a document is not loaded from the server", () => {
                expect(ControllersManager.documentController.getFullDocumentById).not.toHaveBeenCalled();
            });
        });
    });

    describe("Feature: changeSelectedTabOnScroll", () => {
        describe("WHEN changeSelectedTabOnScroll is called", () => {
            beforeEach(() => {
                vm.changeSelectedTabOnScroll("Fields");
            });

            it("THEN the given tab is activated", () => {
                expect(vm.selectedTab).toEqual(ap.viewmodels.documents.DocumentMetadataTab.Fields);
            });
        });
    });

    describe("Feature: accessors", () => {
        let testDocument: ap.models.documents.Document;

        beforeEach(() => {
            testDocument = new ap.models.documents.Document($utility);
            testDocument.createByJson({
                Name: "Title",
                Subject: "Subject",
                Versions: [{}],
                VersionCount: 1,
                UploadedByName: "Name",
                UploadedDate: new Date("2016-03-15"),
                IsReport: false,
                FileType: 1,
                Recipients: [{
                    DisplayName: "First Recipient"
                }, {
                    DisplayName: "Second Recipient"
                }]
            });

            vm.init(testDocument);
        });

        describe("WHEN the title acccessor is called", () => {
            it("THEN a correct field is returned", () => {
                expect(vm.title).toEqual("Title");
            });
        });

        describe("WHEN the comment accessor is called", () => {
            it("THEN a correct field is returned", () => {
                expect(vm.comment).toEqual("Subject");
            });
        });

        describe("WHEN the versionDisplay accessor is called", () => {
            it("THEN a correct value is returned", () => {
                expect(vm.versionDisplay).toEqual("2");
            });
        });

        describe("WHEN the uploadedByName accessor is called", () => {
            it("THEN a correct field is returned", () => {
                expect(vm.uploadedByName).toEqual("Name");
            });
        });

        describe("WHEN the uploadDate accessor is called", () => {
            it("THEN a correct field is returned", () => {
                expect(vm.uploadDate).toEqual(new Date("2016-03-15"));
            });
        });

        describe("WHEN the recipientsDisplay accessor is called", () => {
            it("THEN a correct value is returned", () => {
                expect(vm.recipientsDisplay).toEqual("First Recipient, Second Recipient");
            });
        });

        describe("WHEN the isReport accessor is called", () => {
            it("THEN a correct field is returned", () => {
                expect(vm.isReport).toEqual(false);
            });
        });

        describe("WHEN the fileType accessor is called", () => {
            it("THEN a correct field is returned", () => {
                expect(vm.fileType).toEqual(1);
            });
        });

        describe("WHEN the document accessor is called", () => {
            it("THEN the configured document is returned", () => {
                expect(vm.document).toEqual(testDocument);
            });
        });

        describe("WHEN the versions accessor is called", () => {
            it("THEN an array of versions is returned", () => {
                expect(vm.versions.length).toEqual(1);
            });
        });
    });
});
