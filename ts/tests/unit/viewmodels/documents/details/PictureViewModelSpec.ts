describe("ViewModel - PictureViewModel", () => {
    let vm: ap.viewmodels.documents.PictureViewModel;
    let Utility: ap.utility.UtilityHelper;
    let doc: ap.models.documents.Document;
    let DocumentController: ap.controllers.DocumentController;
    let MainController: ap.controllers.MainController;
    let ControllersManager: ap.controllers.ControllersManager;
    let ServicesManager: ap.services.ServicesManager;
    let pagedShape: ap.models.shapes.PagedShapes[];
    let $rootScope: angular.IRootScopeService, $scope: angular.IScope, Api: ap.services.apiHelper.Api, $mdSidenav, $timeout: angular.ITimeoutService, $mdDialog: angular.material.IDialogService, $q: angular.IQService;
    let mdDialogDeferred: angular.IDeferred<any>;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");

        angular.mock.module(function ($provide) {
            $provide.factory('$mdDialog', ["$q", function ($q) {
                return specHelper.utility.stubShowMdDialog($q);
            }]);
        });
    });

    beforeEach(inject(function (_$q_, _Api_, _$rootScope_, _UserContext_, _$mdDialog_, _Utility_, _DocumentController_, _MainController_, _ControllersManager_, _ServicesManager_, _$timeout_) {
        Utility = _Utility_;
        $q = _$q_;
        Api = _Api_;
        DocumentController = _DocumentController_;
        MainController = _MainController_;
        $mdDialog = _$mdDialog_;
        ControllersManager = _ControllersManager_;
        ServicesManager = _ServicesManager_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        $timeout = _$timeout_;
        specHelper.utility.stubRootUrl(Utility);
        specHelper.userContext.stub(Utility);
        specHelper.utility.stubStorageSet(Utility);

        doc = new ap.models.documents.Document(Utility);

        doc.FolderPath = "123";
        doc.Name = "test name";
        doc.Author = new ap.models.actors.User(Utility);
        doc.Author.Alias = "author@vn.netika.com";
        doc.Author.DisplayName = "Author Display";
        doc.Date = new Date(Date.now());
        doc.Subject = "Test subject";
        doc.References = "Test references";
        doc.Scale = 0.5;
        doc.UploadedBy = new ap.models.actors.User(Utility);
        doc.UploadedBy.Alias = "upload@vn.netika.com";
        doc.SmallThumbWidth = 20;
        doc.SmallThumbHeight = 20;
        doc.RotateAngle = 90;
        doc.TilesPath = "123/456";
        doc.ImageUrl = "123/789";
        doc.VersionCount = 2;
        doc.IsArchived = true;
        doc.Author = new ap.models.actors.User(Utility);

        let project: ap.models.projects.Project = new ap.models.projects.Project(Utility);
        project.createByJson({
            Id: "12"
        });
        project.UserAccessRight = new ap.models.accessRights.ProjectAccessRight(Utility);
        spyOn(MainController, "currentProject").and.returnValue(project);

        let noteWorkspaceVm: ap.viewmodels.notes.NoteWorkspaceViewModel;
        noteWorkspaceVm = new ap.viewmodels.notes.NoteWorkspaceViewModel($scope, $mdSidenav, Utility, Api, $q, $mdDialog, $timeout, null, null, null, ControllersManager, ServicesManager, null, false);

        specHelper.general.spyProperty(ap.viewmodels.documents.DocumentViewModel.prototype, "noteWorkspaceVm", specHelper.PropertyAccessor.Get).and.returnValue(noteWorkspaceVm);
    }));

    afterEach(() => {
        specHelper.general.offSpyProperty(ap.viewmodels.documents.DocumentViewModel.prototype, "noteWorkspaceVm", specHelper.PropertyAccessor.Get);
    });

    /**
     * Creates a DocumentViewModel
     */
    let createDocVm = () => {
        return new ap.viewmodels.documents.DocumentViewModel(Utility, $q, ControllersManager, ServicesManager);
    }

    describe("Constructor", () => {
        let documentVm: ap.viewmodels.documents.DocumentViewModel;
        let shapes: ap.models.shapes.ShapeBase[];
        beforeEach(() => {
            documentVm = createDocVm();
            documentVm.init(doc);
            shapes = [
                modelSpecHelper.createRectShape(Utility, 34, 67, 130, 88)
            ];
            pagedShape = [new ap.models.shapes.PagedShapes(0, shapes)];
        });
        describe("WHEN the pictureViewModel is created with a DocumentViewModel", () => {
            it("THEN, corresponding properties returns same values", () => {
                vm = new ap.viewmodels.documents.PictureViewModel(Utility, ControllersManager, documentVm);
                expect(vm.documentViewModel.document).toBe(doc);
            });
        });
        describe("WHEN the pictureViewModel is created with a DocumentViewModel but shapes null", () => {
            it("THEN, the shapes of view model is empty", () => {
                vm = new ap.viewmodels.documents.PictureViewModel(Utility, ControllersManager, documentVm);
                expect(vm.documentShapes).toEqual([]);
            });
            it("THEN, the shapes of view model is empty", () => {
                vm = new ap.viewmodels.documents.PictureViewModel(Utility, ControllersManager, documentVm);
                expect(vm.documentShapes).toEqual([]);
            });
        });

        describe("WHEN the pictureViewModel is built with a documentViewModel having shapes and displayBadge equals false", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.viewmodels.documents.DocumentViewModel.prototype, "displayedShapes", specHelper.PropertyAccessor.Get).and.returnValue(pagedShape);
                specHelper.general.spyProperty(ap.viewmodels.documents.DocumentViewModel.prototype, "displayBadges", specHelper.PropertyAccessor.Get).and.returnValue(false);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.documents.DocumentViewModel.prototype, "displayedShapes", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.viewmodels.documents.DocumentViewModel.prototype, "displayBadges", specHelper.PropertyAccessor.Get);
            });
            it("THEN, the shapes collections is not the same instance but are equals", () => {
                vm = new ap.viewmodels.documents.PictureViewModel(Utility, ControllersManager, documentVm);
                // expect(vm.documentShapes).not.toBe(shapes);
                expect(vm.documentShapes.length).toEqual(pagedShape.length);
            });
            it("THEN, each shapes are not the instance but equals", () => {
                vm = new ap.viewmodels.documents.PictureViewModel(Utility, ControllersManager, documentVm);
                expect(vm.documentShapes.length).toBe(1); // to be sure that for each is called or test failed
                for (let i = 0; i < pagedShape[0].shapes.length; i++) {
                    expect(pagedShape[0].shapes[i].color).toEqual(vm.documentShapes[0].shapes[i].color);
                    expect(pagedShape[0].shapes[i].dashStyle).toEqual(vm.documentShapes[0].shapes[i].dashStyle);
                    expect(pagedShape[0].shapes[i].drawingSize).toEqual(vm.documentShapes[0].shapes[i].drawingSize);
                    expect(pagedShape[0].shapes[i].uid).toEqual(vm.documentShapes[0].shapes[i].uid);
                    expect(pagedShape[0].shapes[i]).not.toBe(vm.documentShapes[0].shapes[i]);
                }
            });
            it("THEN, the shapes collections is not the same instance but are equals", () => {
                vm = new ap.viewmodels.documents.PictureViewModel(Utility, ControllersManager, documentVm);
                // expect(vm.documentShapes).not.toBe(shapes);
                expect(vm.documentShapes.length).toEqual(shapes.length);
            });
        });

        describe("WHEN the pictureViewModel is built with a documentViewModel having shapes and displayBadges equals true", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.viewmodels.documents.DocumentViewModel.prototype, "displayedShapes", specHelper.PropertyAccessor.Get).and.returnValue(pagedShape);
                specHelper.general.spyProperty(ap.viewmodels.documents.DocumentViewModel.prototype, "displayBadges", specHelper.PropertyAccessor.Get).and.returnValue(true);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.documents.DocumentViewModel.prototype, "displayedShapes", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.viewmodels.documents.DocumentViewModel.prototype, "displayBadges", specHelper.PropertyAccessor.Get);
            });
            it("THEN, the shapes collections is the same instance and are equals", () => {
                vm = new ap.viewmodels.documents.PictureViewModel(Utility, ControllersManager, documentVm);
                expect(vm.documentShapes[0].pageIndex).toEqual(pagedShape[0].pageIndex);
                expect(vm.documentShapes.length).toEqual(pagedShape.length);
                expect(vm.documentShapes[0].shapes[0]).toBe(pagedShape[0].shapes[0]);
            });
        });
        describe("WHEN the documentViewModel raises the event 'displayedshapeschanged'", () => {
            let displayBadges: boolean = true;
            let callback: jasmine.Spy;
            beforeEach(() => {
                callback = jasmine.createSpy("callback");
                shapes = [
                    modelSpecHelper.createRectShape(Utility, 34, 67, 130, 88),
                    modelSpecHelper.createLine(Utility, new Point(89, 67), new Point(130, 88))
                ];
                pagedShape = [new ap.models.shapes.PagedShapes(0, [shapes[0]])];

                specHelper.general.spyProperty(ap.viewmodels.documents.DocumentViewModel.prototype, "displayedShapes", specHelper.PropertyAccessor.Get).and.callFake(() => {
                    return pagedShape;
                });
                specHelper.general.spyProperty(ap.viewmodels.documents.DocumentViewModel.prototype, "displayBadges", specHelper.PropertyAccessor.Get).and.callFake(() => {
                    return displayBadges;
                });

                vm = new ap.viewmodels.documents.PictureViewModel(Utility, ControllersManager, documentVm);
                vm.on("shapeschanged", callback, this);

                pagedShape = [new ap.models.shapes.PagedShapes(0, [shapes[1]])];
                displayBadges = false;

            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.documents.DocumentViewModel.prototype, "displayedShapes", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.viewmodels.documents.DocumentViewModel.prototype, "displayBadges", specHelper.PropertyAccessor.Get);
            });
            describe("WHEN mustSaveDrawings == false", () => {
                beforeEach(() => {
                    specHelper.general.raiseEvent(documentVm, "propertychanged", new ap.viewmodels.base.PropertyChangedEventArgs("displayedShapes", null, documentVm));
                });
                it("THEN, event 'shapeschanged' is called", () => {
                    expect(callback).toHaveBeenCalled();
                });
                it("THEN, documentShapes corresponds to the new one", () => {
                    expect(vm.documentShapes.length).toEqual(pagedShape.length);
                    expect(vm.documentShapes[0].shapes[0] instanceof ap.models.shapes.LineShape).toBeTruthy();
                });
            });
            describe("WHEN mustSaveDrawings == true", () => {
                beforeEach(() => {
                    vm.hasEditAccess = true;
                    vm.isEditMode = true;
                    vm.onShapeAdded(new ap.models.shapes.RectangleShape(Utility, "454"));
                });
                it("THEN, it throw error", () => {
                    expect(() => {
                        specHelper.general.raiseEvent(documentVm, "propertychanged", new ap.viewmodels.base.PropertyChangedEventArgs("displayedShapes", null, documentVm));
                    }).toThrowError("Changes need to be saved before");
                });
            });
        });
    });

    describe("Feature: duplicate", () => {
        let documentVm: ap.viewmodels.documents.DocumentViewModel;
        let shapes: ap.models.shapes.ShapeBase[];
        let duplicate: ap.viewmodels.documents.PictureViewModel;
        let duplicateDocVm: ap.viewmodels.documents.DocumentViewModel;
        beforeEach(() => {
            documentVm = createDocVm();
            documentVm.init(doc);

            duplicateDocVm = createDocVm();
            duplicateDocVm.init(doc);

            spyOn(documentVm, "duplicate").and.returnValue(duplicateDocVm);
            shapes = [
                modelSpecHelper.createRectShape(Utility, 34, 67, 130, 88)
            ];
            pagedShape = [new ap.models.shapes.PagedShapes(0, shapes)];
            vm = new ap.viewmodels.documents.PictureViewModel(Utility, ControllersManager, documentVm);

            duplicate = vm.duplicate();
        });
        describe("WHEN the duplicate method is called", () => {
            it("THEN, the documentVm duplicate method is called", () => {
                expect(documentVm.duplicate).toHaveBeenCalled();
            });
            it("THEN, the linked documentVm is the duplicated one of original", () => {
                expect(duplicate.documentViewModel).toBe(duplicateDocVm);
            });
            it("THEN, the documentShapes values is the same", () => {
                expect(duplicate.documentShapes).toEqual(vm.documentShapes);
            });
        });
    });

    describe("Feature: New shape created", () => {
        let documentVm: ap.viewmodels.documents.DocumentViewModel;;

        beforeEach(() => {
            documentVm = createDocVm();
            documentVm.init(doc);
            vm = new ap.viewmodels.documents.PictureViewModel(Utility, ControllersManager, documentVm);
        });

        describe("PinShape added", () => {
            let pinShape: ap.models.shapes.PinShape;
            beforeEach(() => {
                pinShape = new ap.models.shapes.PinShape(Utility, "4552");
                pinShape.x = 45;
                pinShape.y = 120;
            });
        });
    });

    describe("Feature : onShapeAdded", () => {
        let documentVm: ap.viewmodels.documents.DocumentViewModel;;
        let shape: ap.models.shapes.RectangleShape;
        beforeEach(() => {
            documentVm = createDocVm();
            shape = new ap.models.shapes.RectangleShape(Utility);
            documentVm.init(doc);
            documentVm.pageIndex = 2;
            vm = new ap.viewmodels.documents.PictureViewModel(Utility, ControllersManager, documentVm);
            vm.hasEditAccess = true;
            vm.isEditMode = true;
            vm.onShapeAdded(shape);
        });
        describe("WHEN onShapeAdded is called with a shape which is not in the dictionnary", () => {
            it("THEN, mustSaveDrawings is true ", () => {
                expect(vm.mustSaveDrawings).toEqual(true);
            });
        });
        describe("WHEN onShapeAdded is called and hasEditAccess, isEditMode = false", () => {
            beforeEach(() => {
                vm.hasEditAccess = false;
                vm.isEditMode = false;
            });
            it("THEN, mustSaveDrawings is true ", () => {
                expect(() => {
                    vm.onShapeAdded(shape);
                }).toThrowError("hasEditAccess or isEditMode = false");
            });
        });
    });
    describe("Feature: checkCanSelectShapes", () => {
        let documentVm: ap.viewmodels.documents.DocumentViewModel;;

        beforeEach(() => {
            documentVm = createDocVm();
            documentVm.init(doc);
            vm = new ap.viewmodels.documents.PictureViewModel(Utility, ControllersManager, documentVm);
        });
        describe("WHEN vm is init and isEditMode is not defined", () => {
            it("THEN canSelectChanges is false", () => {
                expect(vm.canSelectShape).toBeFalsy();
            });
        });
        describe("WHEN vm is init and isEditMode is true and vm.documentViewModel.displayBadges is true", () => {
            beforeEach(() => {
                vm.isEditMode = true;
            });
            it("THEN canSelectChanges is true", () => {
                expect(vm.canSelectShape).toBeTruthy();
            });
            it("THEN documentViewModel.isEditMode is true", () => {
                expect(vm.documentViewModel.isEditMode).toBeTruthy();
            });
        });
        describe("WHEN isEditMode is change on false and documentViewModel.displayBadges is false", () => {
            beforeEach(() => {
                vm.documentViewModel.displayBadges = false;
                vm.isEditMode = false;
            });
            it("THEN canSelectChanges is false", () => {
                expect(vm.canSelectShape).toBeFalsy();
            });
            it("THEN documentViewModel.isEditMode is false", () => {
                expect(vm.documentViewModel.isEditMode).toBeFalsy();
            });
        });
        describe("WHEN canSelectChanges change", () => {
            let callback;
            beforeEach(() => {
                callback = jasmine.createSpy("callback");
                vm.documentViewModel.displayBadges = false;
                vm.isEditMode = false;
            });

            it("THEN raise event canselectshapechanged", () => {
                vm.on("canselectshapechanged", callback, this);
                vm.isEditMode = true;
                expect(callback).toHaveBeenCalled();
            });
        });
    });
    describe("Feature: onShapeUpdated", () => {
        let documentVm: ap.viewmodels.documents.DocumentViewModel;
        let document: ap.models.notes.NoteDocument;
        let shape: ap.models.shapes.RectangleShape;
        let shape2: ap.models.shapes.RectangleShape;
        beforeEach(() => {
            documentVm = createDocVm();
            document = new ap.models.notes.NoteDocument(Utility);
            shape = new ap.models.shapes.RectangleShape(Utility);
            shape2 = new ap.models.shapes.RectangleShape(Utility);
            shape2.x = 100;
            documentVm.init(doc);
            documentVm.pageIndex = 2;
            vm = new ap.viewmodels.documents.PictureViewModel(Utility, ControllersManager, documentVm);
            vm.hasEditAccess = true;
            vm.isEditMode = true;

        });
        describe("WHEN onShapeUpdated with a shape different from the original shape", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.viewmodels.documents.DocumentViewModel.prototype, "noteDocument", specHelper.PropertyAccessor.Get).and.returnValue(document);
                spyOn(document, "getShapeByUid").and.returnValue(shape2);
                vm.onShapeUpdated(shape);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.documents.DocumentViewModel.prototype, "noteDocument", specHelper.PropertyAccessor.Get);
            });
            it("THEN, mustSaveDrawings is true ", () => {
                expect(vm.mustSaveDrawings).toEqual(true);
            });
        });
        describe("WHEN the original shape is null", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.viewmodels.documents.DocumentViewModel.prototype, "noteDocument", specHelper.PropertyAccessor.Get).and.returnValue(document);
                spyOn(document, "getShapeByUid").and.returnValue(null);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.documents.DocumentViewModel.prototype, "noteDocument", specHelper.PropertyAccessor.Get);
            });
            it("THEN, throw error ", () => {
                expect(() => {
                    vm.onShapeUpdated(shape);
                }).toThrowError("Original shape not found");
            });
        });
        describe("WHEN onShapeUpdated is called and hasEditAccess, isEditMode = false", () => {
            beforeEach(() => {
                vm.onShapeAdded(shape);
                vm.hasEditAccess = false;
                vm.isEditMode = false;
            });
            it("THEN, mustSaveDrawings is true ", () => {
                expect(() => {
                    vm.onShapeUpdated(shape);
                }).toThrowError("hasEditAccess or isEditMode = false");
            });
        });
    });

    describe("Feature: onShapeDeleted", () => {
        let documentVm: ap.viewmodels.documents.DocumentViewModel;
        let document: ap.models.notes.NoteDocument;
        let shape: ap.models.shapes.RectangleShape;
        let shape2: ap.models.shapes.RectangleShape;
        beforeEach(() => {
            documentVm = createDocVm();
            shape = new ap.models.shapes.RectangleShape(Utility);
            shape2 = new ap.models.shapes.RectangleShape(Utility);
            documentVm.init(doc);
            documentVm.pageIndex = 2;
            vm = new ap.viewmodels.documents.PictureViewModel(Utility, ControllersManager, documentVm);
            vm.hasEditAccess = true;
            vm.isEditMode = true;
        });
        describe("WHEN the shape exist in added shapes collection but the added was the only modification done", () => {
            beforeEach(() => {
                vm.onShapeAdded(shape);
                vm.onShapeDeleted(shape);
            });
            it("THEN, the shape is removed and mustSaveDrawings = false", () => {
                expect(vm.mustSaveDrawings).toEqual(false);
            });
        });
        describe("WHEN the shape exist in added shapes collection", () => {
            beforeEach(() => {
                vm.onShapeAdded(shape);
                vm.onShapeAdded(shape2);
                vm.onShapeDeleted(shape);
            });
            it("THEN, the shape is removed and mustSaveDrawings = true", () => {
                expect(vm.mustSaveDrawings).toEqual(true);
            });
        });
        describe("WHEN the shape exist in updated shapes collection", () => {
            beforeEach(() => {
                document = new ap.models.notes.NoteDocument(Utility);
                specHelper.general.spyProperty(ap.viewmodels.documents.DocumentViewModel.prototype, "noteDocument", specHelper.PropertyAccessor.Get).and.returnValue(document);

                let originalShape = shape;
                originalShape.color = "test";
                spyOn(document, "getShapeByUid").and.returnValue(originalShape);

                vm.onShapeUpdated(shape);
                vm.onShapeDeleted(shape);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.documents.DocumentViewModel.prototype, "noteDocument", specHelper.PropertyAccessor.Get);
            });
            it("THEN, the shape is removed and mustSaveDrawings = true", () => {
                expect(vm.mustSaveDrawings).toEqual(true);
            });
        });
        describe("WHEN the shape doesn't exist in deleted shapes collection", () => {
            beforeEach(() => {
                vm.onShapeDeleted(shape);
            });
            it("THEN, the shape is added and mustSaveDrawings = true", () => {
                expect(vm.mustSaveDrawings).toEqual(true);
            });
        });
        describe("WHEN onShapeDeleted is called and hasEditAccess, isEditMode = false", () => {
            beforeEach(() => {
                vm.onShapeAdded(shape);
                vm.hasEditAccess = false;
                vm.isEditMode = false;
            });
            it("THEN, mustSaveDrawings is true ", () => {
                expect(() => {
                    vm.onShapeDeleted(shape);
                }).toThrowError("hasEditAccess or isEditMode = false");
            });
        });
    });

    describe("Feature : checkMustSaveDrawings", () => {
        let documentVm: ap.viewmodels.documents.DocumentViewModel;
        let document: ap.models.notes.NoteDocument;
        let shape: ap.models.shapes.RectangleShape;
        let shape2: ap.models.shapes.RectangleShape;
        beforeEach(() => {
            documentVm = createDocVm();
            shape = new ap.models.shapes.RectangleShape(Utility);
            shape2 = new ap.models.shapes.RectangleShape(Utility);
            shape2.x = 100;
            documentVm.init(doc);
            vm = new ap.viewmodels.documents.PictureViewModel(Utility, ControllersManager, documentVm);
            vm.hasEditAccess = true;
            vm.isEditMode = true;
        });
        describe("WHEN the shape exist in added shapes collection", () => {
            beforeEach(() => {
                vm.hasEditAccess = true;
                vm.isEditMode = true;
                vm.onShapeAdded(shape);
            });
            it("THEN, mustSaveDrawings = true", () => {
                expect(vm.mustSaveDrawings).toEqual(true);
            });
        });
        describe("WHEN the shape exist in updated shapes collection", () => {
            beforeEach(() => {
                document = new ap.models.notes.NoteDocument(Utility);
                specHelper.general.spyProperty(ap.viewmodels.documents.DocumentViewModel.prototype, "noteDocument", specHelper.PropertyAccessor.Get).and.returnValue(document);
                spyOn(document, "getShapeByUid").and.returnValue(shape2);
                vm.onShapeUpdated(shape);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.documents.DocumentViewModel.prototype, "noteDocument", specHelper.PropertyAccessor.Get);
            });
            it("THEN, mustSaveDrawings = true", () => {
                expect(vm.mustSaveDrawings).toEqual(true);
            });
        });
        describe("WHEN the shape exist in deleted shapes collection", () => {
            beforeEach(() => {
                vm.onShapeDeleted(shape);
            });
            it("THEN, mustSaveDrawings = true", () => {
                expect(vm.mustSaveDrawings).toEqual(true);
            });
        });
        describe("WHEN all collection are empty", () => {
            it("THEN, mustSaveDrawings = false", () => {
                expect(vm.mustSaveDrawings).toEqual(false);
            });
        });
    });

    describe("Feature : cancel", () => {
        let documentVm: ap.viewmodels.documents.DocumentViewModel;
        let document: ap.models.notes.NoteDocument;
        let shape: ap.models.shapes.RectangleShape;
        let shape2: ap.models.shapes.RectangleShape;
        let callback: jasmine.Spy;
        beforeEach(() => {
            callback = jasmine.createSpy("callback");
            documentVm = createDocVm();
            shape = new ap.models.shapes.RectangleShape(Utility);
            shape2 = new ap.models.shapes.RectangleShape(Utility);
            shape2.x = 100;
            documentVm.init(doc);
            vm = new ap.viewmodels.documents.PictureViewModel(Utility, ControllersManager, documentVm);
            vm.hasEditAccess = true;
            vm.isEditMode = true;
            vm.on("shapeschanged", callback, this);

        });
        describe("WHEN cancel is called with changes", () => {
            let resultConfirm: ap.controllers.MessageResult;
            let callbackClose: jasmine.Spy;
            beforeEach(() => {
                callbackClose = jasmine.createSpy("cbClose");
                resultConfirm = ap.controllers.MessageResult.Positive;
                spyOn(MainController, "showConfirmKey").and.callFake(function (message, title, callback) {
                    callback(resultConfirm);
                });
                vm.onShapeAdded(shape);
                vm.onShapeDeleted(shape2);

            });
            it("THEN, confirmMessage is displayed", () => {
                vm.cancel();
                expect(MainController.showConfirmKey).toHaveBeenCalled();
            });
            describe("WHEN confirm popup is confirmed", () => {
                beforeEach(() => {
                    resultConfirm = ap.controllers.MessageResult.Positive;
                });
                it("THEN, all collections are empty if user answers yes", () => {
                    vm.cancel();
                    expect(vm.mustSaveDrawings).toBeFalsy();
                });
                it("THEN, initShapes is called", () => {
                    vm.cancel();
                    expect(callback).toHaveBeenCalled();
                });
                it("THEN, closerequested event is not raise when cancel is called with false", () => {
                    vm.on("closerequested", callbackClose, this);
                    vm.cancel();
                    expect(callbackClose).not.toHaveBeenCalled();
                });
                it("THEN, closerequested event is raised when cancel is called with true", () => {
                    vm.on("closerequested", callbackClose, this);
                    vm.cancel(true);
                    expect(callbackClose).toHaveBeenCalled();
                });
            });

            describe("WHEN confirm popup is canceled", () => {
                beforeEach(() => {
                    resultConfirm = ap.controllers.MessageResult.Negative;

                });
                it("THEN, updated drawings are kept", () => {
                    vm.cancel();
                    expect(vm.mustSaveDrawings).toBeTruthy();
                });
                it("THEN, initShapes is called", () => {
                    vm.cancel();
                    expect(callback).not.toHaveBeenCalled();
                });
                it("THEN, closerequested event is not raised when cancel is called with false", () => {
                    vm.on("closerequested", callbackClose, this);
                    vm.cancel();


                    expect(callbackClose).not.toHaveBeenCalled();
                });
                it("THEN, closerequested event is not raised when cancel is called with true", () => {
                    vm.on("closerequested", callbackClose, this);
                    vm.cancel(true);
                    expect(callbackClose).not.toHaveBeenCalled();
                });
            });

        });
        describe("WHEN cancel is called with no changes", () => {
            let callbackClose: jasmine.Spy;
            beforeEach(() => {
                callbackClose = jasmine.createSpy("cbClose");
                spyOn(MainController, "showConfirmKey").and.callFake(function (message, title, callback) {

                });
            });
            it("THEN, no message is displayed", () => {
                vm.cancel();
                expect(MainController.showConfirmKey).not.toHaveBeenCalled();
            });
            it("THEN, closerequested event is not raised when cancel is called with false", () => {
                vm.on("closerequested", callbackClose, this);
                vm.cancel();

                expect(callbackClose).not.toHaveBeenCalled();
            });
            it("THEN, closerequested event is raised when cancel is called with true", () => {
                vm.on("closerequested", callbackClose, this);
                vm.cancel(true);

                expect(callbackClose).toHaveBeenCalled();
            });
        });
    });
    describe("Feature: Close", () => {
        let callback: jasmine.Spy;
        let documentVm: ap.viewmodels.documents.DocumentViewModel;
        let document: ap.models.notes.NoteDocument;
        beforeEach(() => {
            callback = jasmine.createSpy("callback");
            documentVm = createDocVm();
            documentVm.init(doc);
            vm = new ap.viewmodels.documents.PictureViewModel(Utility, ControllersManager, documentVm);
            spyOn(vm, "cancel");
            vm.close();
        });
        describe("When close method is called", () => {
            it("THEN, cancel is called with true", () => {
                expect(vm.cancel).toHaveBeenCalledWith(true);
            });
        });
    });
    describe("Feature: onShapeSelected", () => {
        let callback: jasmine.Spy;
        let documentVm: ap.viewmodels.documents.DocumentViewModel;
        beforeEach(() => {
            let noteWorkspaceOpt: ap.viewmodels.documents.DocumentVmNoteWorkspaceOption = new ap.viewmodels.documents.DocumentVmNoteWorkspaceOption($scope, $mdSidenav, Api, $q, $mdDialog, $timeout, null, null, null, ServicesManager);
            documentVm = new ap.viewmodels.documents.DocumentViewModel(Utility, $q, ControllersManager, ServicesManager, noteWorkspaceOpt);
            vm = new ap.viewmodels.documents.PictureViewModel(Utility, ControllersManager, documentVm);
            callback = jasmine.createSpy("callback");
            vm.on("shapeselected", callback, this);
            spyOn(vm.documentViewModel.noteWorkspaceVm, "selectItem");
        });

        describe("WHEN a call onShapeSelected with shape as param", () => {
            let shape: ap.models.shapes.BadgeShape;
            let noteDrawingPoint: ap.models.notes.NoteDrawingsPoint;
            let docVM: ap.viewmodels.documents.DocumentViewModel;
            let noteListVM: ap.viewmodels.notes.NoteListViewModel;
            let listVM: ap.viewmodels.notes.UserCommentPagedListViewModel;
            beforeEach(() => {
                noteDrawingPoint = new ap.models.notes.NoteDrawingsPoint(Utility);
                noteDrawingPoint.createByJson({ OriginalGuid: "123" });
                shape = new ap.models.shapes.BadgeShape(Utility, noteDrawingPoint);

                vm.onShapeSelected(shape);
            });
            it("THEN, selectItem is called", () => {
                expect(vm.documentViewModel.noteWorkspaceVm.selectItem).toHaveBeenCalledWith(shape.originalGuid);
            });
            it("THEN, event 'shapeselected' should be raised with good param", () => {
                expect(callback).toHaveBeenCalledWith(shape);
            });
        });

        describe("WHEN a call onShapeSelected without param", () => {
            beforeEach(() => {
                vm.onShapeSelected(null);
            });
            it("THEN, event 'shapeselected' should be raised with null", () => {
                expect(callback).toHaveBeenCalledWith(null);
            });
        })
    });

    describe("Feature: editModeRequestedHandler", () => {
        let documentVm: ap.viewmodels.documents.DocumentViewModel;
        let note: ap.models.notes.Note;
        beforeEach(() => {
            let noteWorkspaceOpt: ap.viewmodels.documents.DocumentVmNoteWorkspaceOption = new ap.viewmodels.documents.DocumentVmNoteWorkspaceOption($scope, $mdSidenav, Api, $q, $mdDialog, $timeout, null, null, null, ServicesManager);
            documentVm = new ap.viewmodels.documents.DocumentViewModel(Utility, $q, ControllersManager, ServicesManager, noteWorkspaceOpt);
            vm = new ap.viewmodels.documents.PictureViewModel(Utility, ControllersManager, documentVm);
            note = new ap.models.notes.Note(Utility);
        });

        describe("When note is not null and can edit = tue", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.viewmodels.notes.NoteDetailViewModel.prototype, "note", specHelper.PropertyAccessor.Get).and.returnValue(note);
                specHelper.general.spyProperty(ap.viewmodels.documents.DocumentViewModel.prototype, "canEdit", specHelper.PropertyAccessor.Get).and.returnValue(true);
                specHelper.general.raiseEvent(documentVm, "editmoderequested", null);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteDetailViewModel.prototype, "note", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.viewmodels.documents.DocumentViewModel.prototype, "canEdit", specHelper.PropertyAccessor.Get);
            });
            it("THEN isEditMode equal true", () => {
                expect(vm.isEditMode).toBeTruthy();
            });
        });
        describe("When note is not null and can edit = false", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.viewmodels.notes.NoteDetailViewModel.prototype, "note", specHelper.PropertyAccessor.Get).and.returnValue(note);
                specHelper.general.spyProperty(ap.viewmodels.documents.DocumentViewModel.prototype, "canEdit", specHelper.PropertyAccessor.Get).and.returnValue(false);
                specHelper.general.raiseEvent(documentVm, "editmoderequested", null);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteDetailViewModel.prototype, "note", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.viewmodels.documents.DocumentViewModel.prototype, "canEdit", specHelper.PropertyAccessor.Get);
            });
            it("THEN isEditMode equal false", () => {
                expect(vm.isEditMode).toBeFalsy();
            });
        });
        describe("When note is null", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.viewmodels.documents.DocumentViewModel.prototype, "canEdit", specHelper.PropertyAccessor.Get).and.returnValue(true);
                specHelper.general.raiseEvent(documentVm, "editmoderequested", null);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteDetailViewModel.prototype, "note", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.viewmodels.documents.DocumentViewModel.prototype, "canEdit", specHelper.PropertyAccessor.Get);
            });
            it("THEN isEditMode equal false", () => {
                expect(vm.isEditMode).toBeFalsy();
            });
        });
    });

    describe("Feature : save", () => {

        let documentVm: ap.viewmodels.documents.DocumentViewModel;
        let noteDocument: ap.models.notes.NoteDocument;
        let shape: ap.models.shapes.RectangleShape;
        let shape2: ap.models.shapes.RectangleShape;
        let shape3: ap.models.shapes.RectangleShape;
        let shape4: ap.models.shapes.RectangleShape;
        let shape5: ap.models.shapes.RectangleShape;
        let shape6: ap.models.shapes.RectangleShape;
        let callback: jasmine.Spy;
        let pageShape: ap.models.shapes.PagedShapes;
        let pageShape2: ap.models.shapes.PagedShapes;

        beforeEach(() => {
            callback = jasmine.createSpy("callback");

            noteDocument = new ap.models.notes.NoteDocument(Utility);

            documentVm = createDocVm();
            documentVm.init(doc, noteDocument);

            vm = new ap.viewmodels.documents.PictureViewModel(Utility, ControllersManager, documentVm);
            vm.hasEditAccess = true;
            vm.isEditMode = true;
            vm.on("shapeschanged", callback, this);
            spyOn(documentVm, "saveDrawings").and.returnValue($q.defer().promise);

            shape = new ap.models.shapes.RectangleShape(Utility);
            vm.onShapeAdded(shape);

            shape2 = new ap.models.shapes.RectangleShape(Utility);
            vm.onShapeAdded(shape2);

            shape3 = new ap.models.shapes.RectangleShape(Utility);
            vm.onShapeAdded(shape3);

            shape4 = new ap.models.shapes.RectangleShape(Utility);
            vm.onShapeDeleted(shape4);

            shape5 = new ap.models.shapes.RectangleShape(Utility);
            vm.onShapeDeleted(shape5);

            shape6 = new ap.models.shapes.RectangleShape(Utility);
            shape6.color = "#123456";
            spyOn(vm.documentViewModel.noteDocument, "getShapeByUid").and.returnValue(new ap.models.shapes.RectangleShape(Utility));
            vm.onShapeUpdated(shape6);


            pageShape = new ap.models.shapes.PagedShapes(0, [shape, shape2, shape3]);
        });
        describe("WHEN save is called", () => {
            beforeEach(() => {
                vm.save();
            });
            it("THEN, saveDrawings is called with correct params", () => {
                expect(documentVm.saveDrawings).toHaveBeenCalledWith([pageShape], [shape6], [shape4, shape5], []);
            });
        });
    });
});
