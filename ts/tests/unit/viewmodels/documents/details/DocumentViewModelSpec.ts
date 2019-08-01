describe("Module ap-viewmodels - Document", () => {

    let $rootScope: angular.IRootScopeService, $scope: angular.IScope, Api: ap.services.apiHelper.Api, $mdSidenav, $timeout: angular.ITimeoutService, $mdDialog: angular.material.IDialogService, $q: angular.IQService;
    let Utility: ap.utility.UtilityHelper, UserContext: ap.utility.UserContext;
    let vm: ap.viewmodels.documents.DocumentViewModel;
    let doc: ap.models.documents.Document;
    let DocumentController: ap.controllers.DocumentController;
    let MainController: ap.controllers.MainController;
    let ControllersManager: ap.controllers.ControllersManager;
    let ServicesManager: ap.services.ServicesManager;

    beforeEach(() => {
        let $window = specHelper.createWindowStub();
        $window.navigator.userLanguage = undefined;
        $window.navigator.language = 'en_US';
        angular.mock.module(($provide) => {
            $provide.value('$window', $window);
            $mdSidenav = specHelper.utility.stubToggleMdSideNav($provide);
        });
    });
    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");

        angular.mock.module(($provide) => {
            $provide.factory('$mdDialog', ["$q", ($q) => {
                return specHelper.utility.stubShowMdDialog($q);
            }]);
        });
    });

    beforeEach(inject((_$rootScope_, _UserContext_, _Utility_, _DocumentController_, _MainController_, _ControllersManager_, _ServicesManager_, _Api_, _$timeout_, _$q_, _$mdDialog_) => {
        Utility = _Utility_;
        UserContext = _UserContext_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        $q = _$q_;
        $mdDialog = _$mdDialog_;
        Api = _Api_;
        $timeout = _$timeout_;
        DocumentController = _DocumentController_;
        ControllersManager = _ControllersManager_;
        ServicesManager = _ServicesManager_;
        MainController = _MainController_;
        specHelper.utility.stubRootUrl(Utility);
        specHelper.userContext.stub(Utility);
        specHelper.utility.stubStorageSet(Utility);
        spyOn(Utility.Translator, "getTranslation").and.callFake((code) => {
            if (code === "app.document.report_process" || code === "app.document.tiles_process")
                return "$" + code + ": {0}";
            return "$" + code;
        });

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
        doc.Author = new ap.models.actors.User(Utility);
        doc.Author.Alias = "upload@vn.netika.com";
        doc.SmallThumbWidth = 20;
        doc.SmallThumbHeight = 20;
        doc.RotateAngle = 90;
        doc.TilesPath = "123/456";
        doc.ImageUrl = "123/789";
        doc.SourceUrl = "abc/xyz";
        doc.VersionCount = 2;
        doc.IsArchived = true;
        doc.Height = 30;
        doc.Width = 40;
        doc.ZoomLevelNumber = 5;
        doc.TileSize = 4;
        doc.BigThumbHeight = 50;
        doc.BigThumbWidth = 50;
        doc.Versions = [];
        doc.Pages = [];

        doc.Pages.push(modelSpecHelper.createFakePage(Utility, "p1", 1));
        doc.Pages.push(modelSpecHelper.createFakePage(Utility, "p2", 2));
        doc.PageCount = doc.Pages.length + 1;

        let v = modelSpecHelper.createFakeVersion(Utility, "v1", 1);
        v.Pages = [];
        v.Pages.push(modelSpecHelper.createFakePage(Utility, "p1", 1));
        v.Pages.push(modelSpecHelper.createFakePage(Utility, "p2", 2));
        v.Pages.push(modelSpecHelper.createFakePage(Utility, "p3", 3));
        v.PageNbr = v.Pages.length + 1;
        doc.Versions.push(v);

        v = modelSpecHelper.createFakeVersion(Utility, "v2", 2);
        v.Pages = [];
        v.Pages.push(modelSpecHelper.createFakePage(Utility, "p1", 1));
        v.Pages.push(modelSpecHelper.createFakePage(Utility, "p2", 2));
        v.Pages.push(modelSpecHelper.createFakePage(Utility, "p3", 3));
        v.PageNbr = v.Pages.length + 1;
        doc.Versions.push(v);

        specHelper.general.spyProperty(ap.viewmodels.notes.NoteDocumentListViewModel.prototype, "isDisplayingPictureViewer", specHelper.PropertyAccessor.Get).and.returnValue(false);

        let project: ap.models.projects.Project = new ap.models.projects.Project(Utility);
        project.createByJson({
            Id: "12"
        });
        project.UserAccessRight = new ap.models.accessRights.ProjectAccessRight(Utility);
        spyOn(MainController, "currentProject").and.returnValue(project);
        specHelper.general.initStub(ap.viewmodels.notes.AddEditNoteViewModel, "initMeetingSelector");
    }));

    afterEach(() => {
        specHelper.general.removeStub(ap.viewmodels.notes.AddEditNoteViewModel, "initMeetingSelector");
        specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteDocumentListViewModel.prototype, "isDisplayingPictureViewer", specHelper.PropertyAccessor.Get);
    });

    function createViewModel(docVmNoteWorkspaceViewModel?: ap.viewmodels.documents.DocumentVmNoteWorkspaceOption) {
        return new ap.viewmodels.documents.DocumentViewModel(Utility, $q, ControllersManager, ServicesManager, docVmNoteWorkspaceViewModel);
    }

    describe("Constructor", () => {
        describe("WHEN DocumentViewModel is created without Document", () => {
            beforeEach(() => {
                vm = createViewModel();
            });

            it("THEN, the properties are filled with the default values", () => {
                expect(vm.document).toBeNull();
                expect(vm.folderPath).toBeNull();
                expect(vm.name).toBeNull();
                expect(vm.author).toBeNull();
                expect(vm.date).toBeNull();
                expect(vm.subject).toBeNull();
                expect(vm.references).toBeNull();
                expect(vm.scale).toBe(0);
                expect(vm.uploadBy).toBeNull();
                expect(vm.smallThumbWidth).toBe(0);
                expect(vm.smallThumbHeight).toBe(0);
                expect(vm.rotateAngle).toBe(0);
                expect(vm.tilesPath).toBeNull();
                expect(vm.imageUrl).toBeNull();
                expect(vm.versionCount).toBe(0);
                expect(vm.isArchived).toBeFalsy();
                expect(vm.smallThumbUrl).toBeNull();
                expect(vm.versionIndex).toBe(-1);
                expect(vm.recipients).toBeNull();
                expect(vm.currentVersion).toBe(null);
                expect(vm.bigThumbUrl).toBeUndefined();
                expect(vm.tilesSize).toBe(0);
                expect(vm.zoomLevelNumber).toBe(0);
                expect(vm.height).toBe(0);
                expect(vm.width).toBe(0);
            });

            it("THEN, the screenInfo is created", () => {
                expect(vm.screenInfo).toBeUndefined();
            });
        });

        describe("WHEN DocumentViewModel is created with a Document", () => {
            beforeEach(() => {
                doc.Recipients = [];
                let recipient: ap.models.reports.ReportRecipients = new ap.models.reports.ReportRecipients(Utility);
                recipient.DisplayName = "John";
                doc.Recipients.push(recipient);
                Utility.UserContext.token = "ttt";

                vm = createViewModel();
                vm.init(doc);
            });
            it("THEN, the properties are filled with the correct values", () => {
                expect(vm.document).toEqual(doc);
                expect(vm.folderPath).toEqual(doc.FolderPath);
                expect(vm.name).toEqual(doc.Name);
                expect(vm.author).toEqual(doc.Author.DisplayName);
                expect(vm.date).toEqual(doc.Date);
                expect(vm.subject).toEqual(doc.Subject);
                expect(vm.references).toEqual(doc.References);
                expect(vm.scale).toEqual(doc.Scale);
                expect(vm.uploadBy.Id).toEqual(doc.UploadedBy.Id);
                expect(vm.uploadBy.Alias).toEqual(doc.UploadedBy.Alias);
                expect(vm.smallThumbWidth).toEqual(doc.SmallThumbWidth);
                expect(vm.smallThumbHeight).toEqual(doc.SmallThumbHeight);
                expect(vm.rotateAngle).toEqual(doc.RotateAngle);
                expect(vm.tilesPath).toEqual("https://api.aproplan.com/" + doc.TilesPath);
                expect(vm.imageUrl).toEqual(doc.ImageUrl);
                expect(vm.versionCount).toEqual(3);
                expect(vm.isArchived).toEqual(doc.IsArchived);
                expect(vm.smallThumbUrl).toBe(Utility.apiUrl + doc.TilesPath + "/smallthumb.jpg" + "?device=web&t=" + Utility.UserContext.Token());
                expect(vm.recipients.length).toBe(1);
            });
            it("THEN, documentSourceFile is sourceUrl", () => {
                expect(vm.documentSourceFile).toEqual("abc/xyz");
            });
            it("THEN, versionIndex equals to the last version", () => {
                expect(vm.versionIndex).toEqual(2);
            });
            it("THEN, currentVersion equals to the document (last version)", () => {
                expect(vm.currentVersion).toEqual(doc);
            });
            it("THEN, copySheetData set the correct values", () => {
                expect(vm.bigThumbUrl).toBe(doc.BigThumbUrl);
                expect(vm.tilesSize).toBe(doc.TileSize);
                expect(vm.zoomLevelNumber).toBe(doc.ZoomLevelNumber);
                expect(vm.height).toBe(doc.Height);
                expect(vm.width).toBe(doc.Width);
            });
            it("THEN, currentPage is equals to the document (last version, first page)", () => {
                expect(vm.currentPage).toBe(doc);
            });

            it("THEN, the screenInfo is created", () => {
                expect(vm.screenInfo).toBeDefined();
            });

            it("THEN, the screenInfo.name is 'document.detail'", () => {
                expect(vm.screenInfo.name).toBe("document.detail");
            });

            it("THEN, the screenInfo.title is 'test name'", () => {
                expect(vm.screenInfo.title).toBe("test name");
            });

            it("THEN, the screenInfo.title is 'test name'", () => {
                expect(vm.screenInfo.sType).toBe(ap.misc.ScreenInfoType.Detail);
            });

            it("THEN, the screenInfo.actions is defined", () => {
                expect(vm.screenInfo.actions).toBeDefined();
            });

            it("THEN, the screenInfo.isFullScreen is true", () => {
                expect(vm.screenInfo.isFullScreen).toBeTruthy();
            });

            it("THEN, the screenInfo.isCustomToolbar is true", () => {
                expect(vm.screenInfo.isCustomToolbar).toBeTruthy();
            });

            it("THEN, the screenInfo.isEditMode is true", () => {
                expect(vm.screenInfo.isEditMode).toBeFalsy();
            });

            it("THEN, the displayBadge equals true", () => {
                expect(vm.displayBadges).toBeFalsy();
            });
        });

        describe("WHEN documentViewModel is created with option to create NoteWorkspaceViewModel", () => {
            let noteWorkspaceOpt: ap.viewmodels.documents.DocumentVmNoteWorkspaceOption;

            beforeEach(() => {
                doc.Recipients = [];
                noteWorkspaceOpt = new ap.viewmodels.documents.DocumentVmNoteWorkspaceOption($scope, $mdSidenav, Api, $q, $mdDialog, $timeout, null, null, null, ServicesManager);

                vm = createViewModel(noteWorkspaceOpt);
                vm.init(doc);
            });

            it("THEN, the noteWorkspaceViewModel is created", () => {
                expect(vm.noteWorkspaceVm).toBeDefined();
            });
            it("THEN, the displayBadge equals true", () => {
                expect(vm.displayBadges).toBeTruthy();
            });
        });

        describe("WHEN documentViewModel is created with an NoteDocument as ParentEntity", () => {
            let noteDocument: ap.models.notes.NoteDocument;
            let pagedShapes: ap.models.shapes.PagedShapes[];
            let callback: jasmine.Spy;

            beforeEach(() => {
                callback = jasmine.createSpy("callback");
                noteDocument = new ap.models.notes.NoteDocument(Utility);
                let drawing = new ap.models.notes.Drawing(Utility);
                let json = {
                    PageIndex: 1,
                    NoteDocumentId: noteDocument.Id
                };
                modelSpecHelper.fillEntityJson(json);

                drawing.createByJson(json);
                drawing.Shapes = [];
                drawing.Shapes.push(modelSpecHelper.createLine(Utility, new Point(29, 39), new Point(15, 20)));

                noteDocument.addDrawing(drawing);

                drawing = new ap.models.notes.Drawing(Utility);
                drawing.createByJson(json);
                drawing.Shapes = [];
                drawing.Shapes.push(modelSpecHelper.createRectShape(Utility, 3, 2, 20, 40));

                noteDocument.addDrawing(drawing);
                vm = createViewModel();
                vm.on("propertychanged", callback, this);
                vm.init(doc, noteDocument);
                pagedShapes = vm.displayedShapes;
            });

            it("THEN, the number of pagedShapes corresponds to the number of drawing on the same pages", () => {
                expect(pagedShapes.length).toBe(1);
            });

            it("THEN, the shapes of pagesShaped corresponds to drawings", () => {
                expect(pagedShapes[0].shapes[0] instanceof ap.models.shapes.LineShape).toBeTruthy();
                expect(pagedShapes[0].shapes[1] instanceof ap.models.shapes.RectangleShape).toBeTruthy();
            });

            it("THEN, the event 'propertychanged' is raised", () => {
                expect(callback).toHaveBeenCalled();
            });

            it("THEN, the pageIndex is set to the first page with drawing", () => {
                expect(vm.pageIndex).toBe(1);
            });
        });
    });

    describe("Feature: noteOpenedHandler", () => {

        let noteDocument: ap.models.notes.NoteDocument;
        let document: ap.models.documents.Document;
        let document2: ap.models.documents.Document;
        let noteWorkspaceOpt: ap.viewmodels.documents.DocumentVmNoteWorkspaceOption;
        let callback: jasmine.Spy;
        let openInPictureViewerSpy: jasmine.Spy;

        beforeEach(() => {
            callback = jasmine.createSpy("callback");
            doc.Recipients = [];

            noteWorkspaceOpt = new ap.viewmodels.documents.DocumentVmNoteWorkspaceOption($scope, $mdSidenav, Api, $q, $mdDialog, $timeout, null, null, null, ServicesManager);
            vm = createViewModel(noteWorkspaceOpt);
            vm.init(doc);

            vm.on("editmoderequested", callback, this);

            openInPictureViewerSpy = jasmine.createSpy("openInPictureViewerSpy");

            specHelper.general.spyProperty(ap.viewmodels.notes.NoteDetailBaseViewModel.prototype, "noteDocumentList", specHelper.PropertyAccessor.Get).and.returnValue({
                sourceItems: [
                    {
                        noteDocument: { Document: doc },
                        pictureViewModel: {
                            isEditMode: true
                        }

                    }, {
                        noteDocument: { Document: { Id: "2", VersionCount: 0 } },
                        pictureViewModel: {
                            isEditMode: false
                        }
                    }, {
                        noteDocument: { Document: { Id: "3", VersionCount: 0 } },
                        pictureViewModel: {
                            isEditMode: false
                        }
                    }
                ],
                openDocumentInPictureViewer: openInPictureViewerSpy
            });

            specHelper.general.spyProperty(ap.viewmodels.notes.NoteWorkspaceViewModel.prototype, "isNoteDetailOpened", specHelper.PropertyAccessor.Get).and.returnValue(true);

            specHelper.general.raiseEvent(vm.noteWorkspaceVm, "noteopened", null);
        });

        afterEach(() => {
            specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteDetailBaseViewModel.prototype, "noteDocumentList", specHelper.PropertyAccessor.Get);
            specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteWorkspaceViewModel.prototype, "isNoteDetailOpened", specHelper.PropertyAccessor.Get);
        });

        describe("WHEN noteOpenedHandler is called", () => {

            describe(" -> ", () => {
                it("THEN openDocumentInPictureViewer is called with correct params", () => {
                    expect((<ap.viewmodels.notes.NoteDocumentViewModel>openInPictureViewerSpy.calls.argsFor(0)[0]).noteDocument.Document.Id).toEqual(doc.Id);
                });

                it("THEN canEdit equal isEditMode", () => {
                    expect(vm.canEdit).toBeTruthy();
                });

                it("THEN editmoderequested is raised", () => {
                    expect(callback).toHaveBeenCalled();
                });
            });
        });
    });

    describe("Feature: saveDrawings", () => {

        let shape: ap.models.shapes.RectangleShape;
        let shape2: ap.models.shapes.RectangleShape;
        let shape3: ap.models.shapes.RectangleShape;
        let shape4: ap.models.shapes.RectangleShape;
        let shape5: ap.models.shapes.RectangleShape;
        let pageShape: ap.models.shapes.PagedShapes;
        let draw: ap.models.notes.Drawing;
        let noteDocument: ap.models.notes.NoteDocument;
        let savedrawingsrequestedSpy: jasmine.Spy;

        beforeEach(() => {
            vm = createViewModel();
            noteDocument = new ap.models.notes.NoteDocument(Utility);
            shape = new ap.models.shapes.RectangleShape(Utility);
            shape2 = new ap.models.shapes.RectangleShape(Utility);
            shape3 = new ap.models.shapes.RectangleShape(Utility);
            shape4 = new ap.models.shapes.RectangleShape(Utility);
            shape5 = new ap.models.shapes.RectangleShape(Utility);
            draw = new ap.models.notes.Drawing(Utility);
            draw.Shapes = [shape3, shape4, shape5];
        });

        describe("WHEN saveDrawings is called with added shape", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.viewmodels.documents.DocumentViewModel.prototype, "noteDocument", specHelper.PropertyAccessor.Get).and.returnValue(noteDocument);
                vm.noteDocument.addDrawing(draw);
                savedrawingsrequestedSpy = jasmine.createSpy("savedrawingsrequested");
                pageShape = new ap.models.shapes.PagedShapes(0, [shape, shape2]);
                vm.on("savedrawingsrequested", savedrawingsrequestedSpy, this);
                vm.saveDrawings([pageShape], null, null, null);
            });
            afterEach(() => {
                vm.off("savedrawingsrequested", savedrawingsrequestedSpy, this);
                specHelper.general.offSpyProperty(ap.viewmodels.documents.DocumentViewModel.prototype, "noteDocument", specHelper.PropertyAccessor.Get);
            });

            it("THEN, noteDocument.Drawing.shapes.length + 1", () => {
                expect(vm.noteDocument.Drawings[0].Shapes.length).toEqual(5);
            });
            it("THEN, savedrawingsrequested event called", () => {
                expect(savedrawingsrequestedSpy).toHaveBeenCalled();
            });
            it("THEN, we have the note document in the callback", () => {
                expect(savedrawingsrequestedSpy.calls.argsFor(0)[0].noteDocument).toBe(noteDocument);
            });
        });

        describe("WHEN saveDrawings is called with deleted shape", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.viewmodels.documents.DocumentViewModel.prototype, "noteDocument", specHelper.PropertyAccessor.Get).and.returnValue(noteDocument);
                vm.noteDocument.addDrawing(draw);

                vm.saveDrawings(null, null, [shape4, shape5], null);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.documents.DocumentViewModel.prototype, "noteDocument", specHelper.PropertyAccessor.Get);
            });

            it("THEN, noteDocument.Drawing.shapes.length - 1", () => {
                expect(vm.noteDocument.Drawings[0].Shapes.length).toEqual(1);
            });
        });

        describe("WHEN saveDrawings is called with updated shape", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.viewmodels.documents.DocumentViewModel.prototype, "noteDocument", specHelper.PropertyAccessor.Get).and.returnValue(noteDocument);
                vm.noteDocument.addDrawing(draw);

                spyOn(shape, "createFromXml");
                spyOn(noteDocument, "getShapeByUid").and.returnValue(shape);
                spyOn(shape3, "postChanges");
                vm.saveDrawings(null, [shape3], null, null);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.documents.DocumentViewModel.prototype, "noteDocument", specHelper.PropertyAccessor.Get);
            });

            it("THEN, noteDocument.Drawing.shapes is updated", () => {
                expect(shape3.postChanges).toHaveBeenCalled();
                expect(shape.createFromXml).toHaveBeenCalledWith(shape3.xml);
            });
        });

        describe("WHEN noteDocument is undefined", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.viewmodels.documents.DocumentViewModel.prototype, "noteDocument", specHelper.PropertyAccessor.Get).and.returnValue(null);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.documents.DocumentViewModel.prototype, "noteDocument", specHelper.PropertyAccessor.Get);
            });

            it("THEN, throw error", () => {
                expect(function () {
                    vm.saveDrawings(null, null, null, null);
                }).toThrowError("The noteDocument can not be null");
            });
        });
    });

    describe("Feature: LoadBadge", () => {
        describe("WHEN the documentVm is created with NoteWorkspace and ids are loaded", () => {
            let noteWorkspaceOpt: ap.viewmodels.documents.DocumentVmNoteWorkspaceOption;
            let idsnotes: string[];
            let displayLoadingMessage: any;
            beforeEach(() => {
                idsnotes = ["23", "43"];
                doc.Recipients = [];
                noteWorkspaceOpt = new ap.viewmodels.documents.DocumentVmNoteWorkspaceOption($scope, $mdSidenav, Api, $q, $mdDialog, $timeout, null, null, null, ServicesManager);
                let defer = $q.defer();
                let defNoteStatus = $q.defer();
                spyOn(ServicesManager.noteService, "getDrawingsOfDocument").and.returnValue(defer.promise);
                spyOn(ControllersManager.projectController, "getNoteProjectStatusList").and.returnValue(defNoteStatus.promise);

                vm = createViewModel(noteWorkspaceOpt);

                specHelper.general.spyProperty(ap.viewmodels.notes.NoteListViewModel.prototype, "planId", specHelper.PropertyAccessor.Set);
                vm.init(doc);
                specHelper.general.spyProperty(ap.viewmodels.GenericPagedListViewModels.prototype, "ids", specHelper.PropertyAccessor.Get).and.returnValue(idsnotes);

                specHelper.general.raiseEvent(vm.noteWorkspaceVm.noteListVm.listVm, "idsloaded", null);
                let drawingInfos: ap.models.notes.NoteDrawingsPoint[] = [];
                drawingInfos.push(new ap.models.notes.NoteDrawingsPoint(Utility));
                drawingInfos.push(new ap.models.notes.NoteDrawingsPoint(Utility));

                drawingInfos[0].PageIndex = 0;
                drawingInfos[0].NoteGuid = "0";
                drawingInfos[0].NoteSubject = "Sub1";

                drawingInfos[1].PageIndex = 1;
                drawingInfos[1].NoteGuid = "1";
                drawingInfos[1].NoteSubject = "Sub2";

                displayLoadingMessage = (nbCallResolved: number, nbCalls: number) => { };

                spyOn(ControllersManager.mainController, "showBusy");
                specHelper.general.raiseEvent(ServicesManager.noteService, "drawingsLoaded", drawingInfos);
            });

            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.GenericPagedListViewModels.prototype, "ids", specHelper.PropertyAccessor.Get);

                specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteListViewModel.prototype, "planId", specHelper.PropertyAccessor.Set);
            });

            it("THEN, the getDrawingsOfDocument is called", () => {
                expect((<jasmine.Spy>noteWorkspaceOpt.$servicesManager.noteService.getDrawingsOfDocument).calls.argsFor(0)[0]).toEqual(doc.Id);
                expect((<jasmine.Spy>noteWorkspaceOpt.$servicesManager.noteService.getDrawingsOfDocument).calls.argsFor(0)[1]).toEqual(idsnotes);
                expect((<jasmine.Spy>noteWorkspaceOpt.$servicesManager.noteService.getDrawingsOfDocument).calls.argsFor(0)[2]).toBeDefined();
            });

            it("THEN, there are two pagedShapes created for each pages", () => {
                $scope.$apply();
                expect(vm.displayedShapes.length).toBe(2);
            });

            it("THEN, there are two pagedShapes for each page", () => {
                $scope.$apply();
                expect(vm.displayedShapes[0].pageIndex).toBe(0);
                expect(vm.displayedShapes[1].pageIndex).toBe(1);
            });

            it("THEN, there are two pagedShapes for each page", () => {
                $scope.$apply();
                expect(vm.displayedShapes[0].shapes[0] instanceof ap.models.shapes.BadgeShape).toBeTruthy();
                expect(vm.displayedShapes[0].shapes[0].uid).toBe("0");

                expect(vm.displayedShapes[1].shapes[0] instanceof ap.models.shapes.BadgeShape).toBeTruthy();
                expect(vm.displayedShapes[1].shapes[0].uid).toBe("1");
            });
        });
    });

    describe("Feature: ProgressingStatus", () => {
        beforeEach(() => {
            vm = createViewModel();
        });
        describe("WHEN the status is failed", () => {
            it("GenerationReportFailed => THEN isProcessedError = true AND isProcessedSuccess = false", () => {
                doc.ProcessingStatus = ap.models.documents.ProcessingStatus.GenerationReportFailed;
                vm.init(doc);

                expect(vm.progressingStatus).toBe("$app.err.document_process");
                expect(vm.isProcessing).toBeFalsy();
                expect(vm.isProcessedSuccess).toBeFalsy();
                expect(vm.isProcessedError).toBeTruthy();
            });
            it("TilesProcessingFailed => THEN isProcessedError = true AND isProcessedSuccess = false", () => {
                doc.ProcessingStatus = ap.models.documents.ProcessingStatus.TilesProcessingFailed;
                vm.init(doc);

                expect(vm.progressingStatus).toBe("$app.err.document_process");
                expect(vm.isProcessing).toBeFalsy();
                expect(vm.isProcessedSuccess).toBeFalsy();
                expect(vm.isProcessedError).toBeTruthy();
            });
            it("GenerateCacheFileError => THEN isProcessedError = true AND isProcessedSuccess = false", () => {
                doc.ProcessingStatus = ap.models.documents.ProcessingStatus.GenerateCacheFileError;
                vm.init(doc);

                expect(vm.progressingStatus).toBe("$app.err.document_process");
                expect(vm.isProcessing).toBeFalsy();
                expect(vm.isProcessedSuccess).toBeFalsy();
                expect(vm.isProcessedError).toBeTruthy();
            });
        });
        describe("WHEN the status is succeded", () => {
            it("FullyCompleted => THEN isProcessedError = false AND isProcessedSuccess = true", () => {
                doc.ProcessingStatus = ap.models.documents.ProcessingStatus.FullyCompleted;
                vm.init(doc);

                expect(vm.progressingStatus).toBe("");
                expect(vm.isProcessing).toBeFalsy();
                expect(vm.isProcessedSuccess).toBeTruthy();
                expect(vm.isProcessedError).toBeFalsy();
            });
        });
        describe("WHEN the status is in progress", () => {
            it("ToUpload => THEN isProcessedError = false AND isProcessedSuccess = false", () => {
                doc.ProcessingStatus = ap.models.documents.ProcessingStatus.ToUpload;
                vm.init(doc);

                expect(vm.progressingStatus).toBe("$Uploading");
                expect(vm.isProcessing).toBeTruthy();
                expect(vm.isProcessedSuccess).toBeFalsy();
                expect(vm.isProcessedError).toBeFalsy();
            });
            it("GeneratingReport => THEN isProcessedError = false AND isProcessedSuccess = false", () => {
                doc.ProcessingStatus = ap.models.documents.ProcessingStatus.GeneratingReport;
                doc.NumPageProcessing = 3;
                vm.init(doc);

                expect(vm.progressingStatus).toBe("$app.document.report_process: 3");
                expect(vm.isProcessing).toBeTruthy();
                expect(vm.isProcessedSuccess).toBeFalsy();
                expect(vm.isProcessedError).toBeFalsy();
            });
            it("TilesProcessing => THEN isProcessedError = false AND isProcessedSuccess = false", () => {
                doc.ProcessingStatus = ap.models.documents.ProcessingStatus.TilesProcessing;
                doc.NumPageProcessing = 2;
                vm.init(doc);

                expect(vm.progressingStatus).toBe("$app.document.tiles_process: 2");
                expect(vm.isProcessing).toBeTruthy();
                expect(vm.isProcessedSuccess).toBeFalsy();
                expect(vm.isProcessedError).toBeFalsy();
            });
            it("ToGenerateReport => THEN isProcessedError = false AND isProcessedSuccess = false", () => {
                doc.ProcessingStatus = ap.models.documents.ProcessingStatus.ToGenerateReport;
                doc.NumPageProcessing = 2;
                vm.init(doc);

                expect(vm.progressingStatus).toBe("$app.document.to_generate_report");
                expect(vm.isProcessing).toBeTruthy();
                expect(vm.isProcessedSuccess).toBeFalsy();
                expect(vm.isProcessedError).toBeFalsy();
            });
            it("ToGenerateTiles => THEN isProcessedError = false AND isProcessedSuccess = false", () => {
                doc.ProcessingStatus = ap.models.documents.ProcessingStatus.ToGenerateTiles;
                doc.NumPageProcessing = 2;
                vm.init(doc);

                expect(vm.progressingStatus).toBe("$app.document.to_generate_tiles");
                expect(vm.isProcessing).toBeTruthy();
                expect(vm.isProcessedSuccess).toBeFalsy();
                expect(vm.isProcessedError).toBeFalsy();
            });
            it("Unknow => THEN isProcessedError = false AND isProcessedSuccess = false", () => {
                doc.ProcessingStatus = ap.models.documents.ProcessingStatus.Unknown;
                doc.NumPageProcessing = 2;
                vm.init(doc);

                expect(vm.progressingStatus).toBe("");
                expect(vm.isProcessing).toBeTruthy();
                expect(vm.isProcessedSuccess).toBeFalsy();
                expect(vm.isProcessedError).toBeFalsy();
            });
            it("ToGenerateCacheFile => THEN isProcessedError = false AND isProcessedSuccess = false", () => {
                doc.ProcessingStatus = ap.models.documents.ProcessingStatus.ToGenerateCacheFile;
                doc.NumPageProcessing = 2;
                vm.init(doc);

                expect(vm.progressingStatus).toBe("$app.document.to_generate_report");
                expect(vm.isProcessing).toBeTruthy();
                expect(vm.isProcessedSuccess).toBeFalsy();
                expect(vm.isProcessedError).toBeFalsy();
            });
        });
    });

    describe("Feature: FolderPath", () => {
        describe("WHEN the document has a folder path not starting with Photo or Report", () => {
            it("THEN, the folderPath is equal to the document.FolderPath", () => {
                vm = createViewModel();
                vm.init(doc);

                expect(vm.folderPath).toEqual(doc.FolderPath);
            });
        });
        describe("WHEN the document has a folder path starting with Photo", () => {
            it("THEN, the folderPath is equal to the document.FolderPath with Photo replaced by the translation of 'Private'", () => {
                doc.FolderPath = "Photo/3232/343";
                vm = createViewModel();
                vm.init(doc);
                expect(vm.folderPath).toEqual("$Private/3232/343");
            });
        });
        describe("WHEN the document has a folder path starting with Report", () => {
            it("THEN, the folderPath is equal to the document.FolderPath with Photo replaced by the translation of 'Private'", () => {
                doc.FolderPath = "Report/3232/343";

                vm = createViewModel();
                vm.init(doc);

                expect(vm.folderPath).toEqual("$Private/3232/343");
            });
        });
    });

    describe("Feature: documentUpdatedHandler", () => {
        let updatedDoc: ap.models.documents.Document;
        let initSpy: jasmine.Spy;
        let originalInit: any;

        beforeEach(() => {
            vm = createViewModel();
            vm.init(doc);
            
            initSpy = jasmine.createSpy("initSpy");
            originalInit = vm.init;
            ap.viewmodels.documents.DocumentViewModel.prototype.init = initSpy;

            updatedDoc = new ap.models.documents.Document(Utility);
        });

        afterEach(() => {
            ap.viewmodels.documents.DocumentViewModel.prototype.init = originalInit;
        });

        describe("WHEN 'documentupdated' event was fired from the documentcontroller with the document same with the vm", () => {
            it("THEN, the vm will updated with the updated document", () => {
                updatedDoc.createByJson({ Id: doc.Id, Author: { Id: doc.Author.Id } });
                specHelper.general.raiseEvent(DocumentController, "documentupdated", new ap.controllers.EntityUpdatedEvent<ap.models.documents.Document>(updatedDoc));
                expect(vm.init).toHaveBeenCalledWith(updatedDoc, vm.parentEntity);
            });
        });
        describe("WHEN 'documentupdated' event was fired from the documentcontroller with the document have not same with the vm", () => {
            it("THEN, nothing happens", () => {
                updatedDoc.createByJson({ Id: "D2", Author: { Id: "User1" } });
                specHelper.general.raiseEvent(DocumentController, "documentupdated", new ap.controllers.EntityUpdatedEvent<ap.models.documents.Document>(updatedDoc));
                expect(vm.init).not.toHaveBeenCalled();
            });
        });
    });

    describe("Feature: Document pageIndex update", () => {
        let callback: jasmine.Spy;
        beforeEach(() => {
            callback = jasmine.createSpy("callback");
            vm = createViewModel();
            vm.init(doc);
            vm.pageIndex = 1;
            vm.on("propertychanged", callback, this);
        });
        describe("WHEN the pageIndex is not out of range AND different from current pageIndex", () => {
            beforeEach(() => {
                vm.pageIndex = 2;
            });
            it("THEN, pageIndex is updated", () => {
                expect(vm.pageIndex).toEqual(2);
            });
            it("THEN, the current page is updated", () => {
                expect(vm.currentPage).toEqual(doc.Pages[1]);
            });
            it("THEN, the data are init", () => {
                let p1 = doc.Pages[1];
                expect(vm.smallThumbWidth).toEqual(p1.SmallThumbWidth);
                expect(vm.bigThumbHeight).toEqual(p1.BigThumbHeight);
                expect(vm.smallThumbHeight).toEqual(p1.SmallThumbHeight);
                expect(vm.bigThumbWidth).toEqual(p1.BigThumbWidth);
                expect(vm.tilesPath).toEqual("https://api.aproplan.com/" + p1.TilesPath);
                expect(vm.tilesSize).toEqual(p1.TileSize);
                expect(vm.bigThumbUrl).toEqual(p1.BigThumbUrl);
                expect(vm.zoomLevelNumber).toEqual(p1.ZoomLevelNumber);
                expect(vm.height).toEqual(p1.Height);
                expect(vm.width).toEqual(p1.Width);
            });
            it("THEN, propertychanged event is raised", () => {
                expect(callback).toHaveBeenCalledWith(new ap.viewmodels.base.PropertyChangedEventArgs("pageIndex", 1, vm));
            });
        });
        describe("WHEN the pageIndex is not a number", () => {
            beforeEach(() => {
                vm.pageIndex = "test";
            });
            it("THEN, pageIndex is not updated", () => {
                expect(vm.pageIndex).toEqual(1);
            });
            it("THEN, propertychanged event is not raised", () => {
                expect(callback).not.toHaveBeenCalled();
            });
        });
        describe("WHEN the pageIndex is the same as current", () => {
            beforeEach(() => {
                vm.pageIndex = 1;
            });
            it("THEN, propertychanged event is not raised", () => {
                expect(callback).not.toHaveBeenCalled();
            });
        });
        describe("WHEN the pageIndex under 0", () => {
            beforeEach(() => {
                vm.pageIndex = -1;
            });
            it("THEN, pageIndex is updated to 0", () => {
                expect(vm.pageIndex).toEqual(0);
            });
            it("THEN, the current page is updated to doc", () => {
                expect(vm.currentPage).toEqual(doc);
            });
            it("THEN, the data are init", () => {
                expect(vm.smallThumbWidth).toEqual(doc.SmallThumbWidth);
                expect(vm.bigThumbHeight).toEqual(doc.BigThumbHeight);
                expect(vm.smallThumbHeight).toEqual(doc.SmallThumbHeight);
                expect(vm.bigThumbWidth).toEqual(doc.BigThumbWidth);
                expect(vm.tilesPath).toEqual("https://api.aproplan.com/" + doc.TilesPath);
                expect(vm.tilesSize).toEqual(doc.TileSize);
                expect(vm.bigThumbUrl).toEqual(doc.BigThumbUrl);
                expect(vm.zoomLevelNumber).toEqual(doc.ZoomLevelNumber);
                expect(vm.height).toEqual(doc.Height);
                expect(vm.width).toEqual(doc.Width);
            });
            it("THEN, propertychanged event is raised", () => {
                expect(callback).toHaveBeenCalledWith(new ap.viewmodels.base.PropertyChangedEventArgs("pageIndex", 1, vm));
            });
        });
        describe("WHEN the pageIndex is 0", () => {
            beforeEach(() => {
                vm.pageIndex = 0;
            });
            it("THEN, pageIndex is updated to 0", () => {
                expect(vm.pageIndex).toEqual(0);
            });
            it("THEN, the current page is updated to doc", () => {
                expect(vm.currentPage).toEqual(doc);
            });
            it("THEN, the data are init", () => {
                expect(vm.smallThumbWidth).toEqual(doc.SmallThumbWidth);
                expect(vm.bigThumbHeight).toEqual(doc.BigThumbHeight);
                expect(vm.smallThumbHeight).toEqual(doc.SmallThumbHeight);
                expect(vm.bigThumbWidth).toEqual(doc.BigThumbWidth);
                expect(vm.tilesPath).toEqual("https://api.aproplan.com/" + doc.TilesPath);
                expect(vm.tilesSize).toEqual(doc.TileSize);
                expect(vm.bigThumbUrl).toEqual(doc.BigThumbUrl);
                expect(vm.zoomLevelNumber).toEqual(doc.ZoomLevelNumber);
                expect(vm.height).toEqual(doc.Height);
                expect(vm.width).toEqual(doc.Width);
            });
            it("THEN, propertychanged event is raised", () => {
                expect(callback).toHaveBeenCalledWith(new ap.viewmodels.base.PropertyChangedEventArgs("pageIndex", 1, vm));
            });
        });
        describe("WHEN the pageIndex is greater than pageCount", () => {
            beforeEach(() => {
                vm.pageIndex = 5;
            });
            it("THEN, pageIndex is updated to the last page", () => {

                expect(vm.pageIndex).toEqual(doc.PageCount - 1);
            });
            it("THEN, the current page is updated with the last one", () => {
                expect(vm.currentPage).toEqual(doc.Pages[doc.Pages.length - 1]);
            });
            it("THEN, the data are init", () => {
                let p = doc.Pages[doc.Pages.length - 1];
                expect(vm.smallThumbWidth).toEqual(p.SmallThumbWidth);
                expect(vm.bigThumbHeight).toEqual(p.BigThumbHeight);
                expect(vm.smallThumbHeight).toEqual(p.SmallThumbHeight);
                expect(vm.bigThumbWidth).toEqual(p.BigThumbWidth);
                expect(vm.tilesPath).toEqual("https://api.aproplan.com/" + p.TilesPath);
                expect(vm.tilesSize).toEqual(p.TileSize);
                expect(vm.bigThumbUrl).toEqual(p.BigThumbUrl);
                expect(vm.zoomLevelNumber).toEqual(p.ZoomLevelNumber);
                expect(vm.height).toEqual(p.Height);
                expect(vm.width).toEqual(p.Width);
            });
            it("THEN, propertychanged event is raised", () => {
                expect(callback).toHaveBeenCalledWith(new ap.viewmodels.base.PropertyChangedEventArgs("pageIndex", 1, vm));
            });
        });
    });

    describe("Feature: Document versionIndex update", () => {
        let version: ap.models.documents.Version;
        let callback: jasmine.Spy;
        beforeEach(() => {
            callback = jasmine.createSpy("callback");
            vm = createViewModel();
            vm.init(doc);

            vm.on("propertychanged", callback, null);
        });
        describe("WHEN the versionindex is changed with another version than the currect one", () => {
            beforeEach(() => {
                vm.versionIndex = 0;
            });
            it("THEN, versionIndex is updated", () => {
                expect(vm.versionIndex).toEqual(0);
            });
            it("THEN currentVersion is set to the specific version", () => {
                expect(vm.currentVersion).toBe(doc.Versions[0]);
            });
            it("THEN, the event 'propertychanged' is raised", () => {
                expect(callback).toHaveBeenCalledWith(new ap.viewmodels.base.PropertyChangedEventArgs("versionIndex", 2, vm));
            });
            it("THEN, pageCount is set to the current pageCount version", () => {
                expect(vm.pageCount).toEqual(4);
            });
        });
        describe("WHEN the versionindex is changed with the same version than the currect one", () => {
            beforeEach(() => {
                vm.versionIndex = 2;
            });
            it("THEN, versionIndex is not updated", () => {
                expect(vm.versionIndex).toEqual(2);
            });
            it("THEN the currentVersion equals the document himself like the index is the last one", () => {
                expect(vm.currentVersion).toBe(doc);
            });
            it("THEN, the event 'propertychanged' is not raised", () => {
                expect(callback).not.toHaveBeenCalled();
            });
            it("THEN, pageCount is set to the current pageCount version", () => {
                expect(vm.pageCount).toEqual(3);
            });
        });
        describe("WHEN the versionindex is < 0", () => {
            it("THEN, throw error", () => {
                expect(() => {
                    vm.versionIndex = -3;
                }).toThrowError("The version of the index is out of range.");
            });
        });
        describe("WHEN the versionindex is > versionCount", () => {
            it("THEN, throw error", () => {
                expect(() => {
                    vm.versionIndex = 5;
                }).toThrowError("The version of the index is out of range.");
            });
        });
        describe("WHEN the version index changed and the page number are not the same and the current page doesn't exists in new version", () => {
            beforeEach(() => {
                vm.versionIndex = 1;
                vm.pageIndex = 3;

                vm.versionIndex = 2;
            });
            it("THEN, the current page becomes the last one", () => {
                expect(vm.pageIndex).toBe(2);
            });
            it("THEN, the current version is updated", () => {
                expect(vm.currentVersion).toBe(doc);
            });
            it("THEN, the current sheet is updated", () => {
                expect(vm.currentPage).toBe(doc.Pages[doc.Pages.length - 1]);
            });
        });
    });

    describe("Feature: maySave", () => {

        let updatedDoc: ap.models.documents.Document;

        describe("When name of document is empty", () => {
            beforeEach(() => {
                vm = createViewModel();

                doc.Name = null;
                vm.init(doc);
            });
            it("THEN maySave = false", () => {
                expect(vm.maySave).toBeFalsy();
            });
        });

        describe("When name of document is NOT empty", () => {
            beforeEach(() => {
                vm = createViewModel();
                vm.init(doc);
            });
            it("THEN maySave = true", () => {
                expect(vm.maySave).toBeTruthy();
            });
        });
    });

    describe("Feature: hasChanged", () => {

        let updatedDoc: ap.models.documents.Document;

        beforeEach(() => {
            specHelper.general.spyProperty(ap.models.Entity.prototype, "IsNew", specHelper.PropertyAccessor.Get).and.returnValue(false);
        });

        afterEach(() => {
            specHelper.general.offSpyProperty(ap.models.Entity.prototype, "IsNew", specHelper.PropertyAccessor.Get);
        });

        describe("When no changes have been performed on the documents", () => {
            beforeEach(() => {
                vm = createViewModel();
                vm.init(doc);
            });
            it("THEN hasChanged = false", () => {
                expect(vm.hasChanged).toBeFalsy();
            });
        });
        describe("When name of document is changed", () => {
            beforeEach(() => {
                vm = createViewModel();
                vm.init(doc);

                doc.Name = doc.Name + "changed";
            });
            it("THEN hasChanged = true", () => {
                expect(vm.hasChanged).toBeTruthy();
            });
        });
        describe("When References of document is changed", () => {
            beforeEach(() => {
                vm = createViewModel();
                vm.init(doc);

                doc.References = doc.References + "changed";
            });
            it("THEN hasChanged = true", () => {
                expect(vm.hasChanged).toBeTruthy();
            });
        });

        describe("When Subject of document is changed", () => {
            beforeEach(() => {
                vm = createViewModel();
                vm.init(doc);

                doc.Subject = doc.Subject + "changed";
            });
            it("THEN hasChanged = true", () => {
                expect(vm.hasChanged).toBeTruthy();
            });
        });
        describe("When Subject of document is null and setting vm.subject to empty", () => {
            beforeEach(() => {
                doc.Subject = null;

                vm = createViewModel();
                vm.init(doc);

                vm.subject = "";
            });
            it("THEN hasChanged = false", () => {
                expect(vm.hasChanged).toBeFalsy();
            });
        });
        describe("When References of document is null and setting vm.references to empty", () => {
            beforeEach(() => {
                doc.References = null;

                vm = createViewModel();
                vm.init(doc);

                vm.references = "";
            });
            it("THEN hasChanged = false", () => {
                expect(vm.hasChanged).toBeFalsy();
            });
        });
    });

    describe("Feature: postChange", () => {

        let updatedDoc: ap.models.documents.Document;

        describe("WHEN perform change of name, subject, references, sourcefile and postChange", () => {
            beforeEach(() => {
                vm = createViewModel();
                vm.init(doc);

                vm.name = "name 2";
                vm.subject = "subject 2";
                vm.references = "ref 2";

                let fileJson = {
                    name: "testpicture.png"
                };
                let file = <File>fileJson;
                vm.postChanges();
            });
            it("THEN, name of document is changed acordingly", () => {
                expect(doc.Name).toEqual("name 2");
            });
            it("THEN, subject of document is changed acordingly", () => {
                expect(doc.Subject).toEqual("subject 2");
            });
            it("THEN, references of document is changed acordingly", () => {
                expect(doc.References).toEqual("ref 2");
            });
        });
    });

    describe("Feature: actionClick", () => {
        beforeEach(() => {
            vm = createViewModel();
            vm.init(doc);
            specHelper.general.spyProperty(ap.viewmodels.documents.DocumentViewModel.prototype, "actionsViewModel", specHelper.PropertyAccessor.Get).and.returnValue({
                actions: [
                    new ap.viewmodels.home.ActionViewModel(Utility, Utility.EventTool, "test1", "", false, null, "Test1", true),
                    new ap.viewmodels.home.ActionViewModel(Utility, Utility.EventTool, "test2", "", true, null, "Test2", false),
                    new ap.viewmodels.home.ActionViewModel(Utility, Utility.EventTool, "test3", "", true, null, "Test3", true)
                ]
            });
        });
        afterEach(() => {
            specHelper.general.offSpyProperty(ap.viewmodels.documents.DocumentViewModel.prototype, "actionsViewModel", specHelper.PropertyAccessor.Get);
        });

        describe("WHEN a call actionClick method with name of the action is not in the DocumentActionViewModel", () => {
            it("THEN, throw error", () => {
                expect(() => vm.actionClick('custom-action-name')).toThrowError("Action is not found.");
            });
        });

        describe("WHEN a call actionClick method with name corresponds to an action where isVisible = false", () => {
            it("THEN, throw error", () => {
                expect(() => vm.actionClick('test1')).toThrowError("This action cannot be used.");
            });
        });

        describe("WHEN a call actionClick method with name corresponds to an action where isEnabled = false", () => {
            it("THEN, throw error", () => {
                expect(() => vm.actionClick('test2')).toThrowError("This action cannot be used.");
            });
        });
        describe("WHEN a call actionClick method with name corresponds to an action where isEnabled = true and isVisible = true AND document != currentVersion", () => {
            beforeEach(() => {
                spyOn(DocumentController, "downloadDocument");
                specHelper.general.spyProperty(ap.viewmodels.documents.DocumentViewModel.prototype, "currentVersion", specHelper.PropertyAccessor.Get).and.returnValue('testValue');
                vm.actionClick('test3');
            });

            afterEach(() => {
                specHelper.general.offSpyProperty(ap.viewmodels.documents.DocumentViewModel.prototype, "currentVersion", specHelper.PropertyAccessor.Get);
            });

            it("THEN, DocumentController.downloadDocument should be called", () => {
                expect(DocumentController.downloadDocument).toHaveBeenCalledWith(vm.document, 'testValue');
            });
        });

        describe("WHEN a call actionClick method with name corresponds to an action where isEnabled = true and isVisible = true AND document = currentVersion", () => {
            beforeEach(() => {
                spyOn(DocumentController, "downloadDocument");
                vm.actionClick('test3');
            });

            it("THEN, DocumentController.downloadDocument should be called", () => {
                expect(DocumentController.downloadDocument).toHaveBeenCalledWith(vm.document, undefined);
            });
        });
    });

    describe("Feature: versionadded", () => {

        let initSpy: jasmine.Spy;
        let originalInit: any;

        beforeEach(() => {
            initSpy = jasmine.createSpy("initSpy");

            vm = createViewModel();
            vm.init(doc);

            spyOn(DocumentController, "registerDocumentStatusRefresh");

            originalInit = vm.init;
            ap.viewmodels.documents.DocumentViewModel.prototype.init = initSpy;
        });

        afterEach(() => {
            ap.viewmodels.documents.DocumentViewModel.prototype.init = originalInit;
        });

        describe("WHEN 'versionadded' event was fired from the documentcontroller with the updated document same with the vm", () => {
            let updatedDoc: ap.models.documents.Document;
            beforeEach(() => {
                updatedDoc = new ap.models.documents.Document(Utility);
                updatedDoc.createByJson({ Id: doc.Id, EntityVersion: 2, Author: { Id: doc.Author.Id } });
            });
            it("THEN, the vm will updated with the updated document", () => {
                specHelper.general.raiseEvent(DocumentController, "versionadded", new KeyValue<ap.models.documents.Document, ap.models.documents.Version>(updatedDoc, null));
                expect(vm.init).toHaveBeenCalledWith(updatedDoc, vm.parentEntity);
            });
            it("AND, if the document have not processed, the registerDocumentStatusRefresh method will be called", () => {
                updatedDoc.ProcessingStatus = ap.models.documents.ProcessingStatus.Unknown;
                specHelper.general.raiseEvent(DocumentController, "versionadded", new KeyValue<ap.models.documents.Document, ap.models.documents.Version>(updatedDoc, null));
                expect(DocumentController.registerDocumentStatusRefresh).toHaveBeenCalledWith(doc);
            });
        });
    });


    describe("Feature: documentstatusrefreshed", () => {

        beforeEach(() => {
            vm = createViewModel();
            vm.init(doc);
        });

        describe("WHEN 'documentstatusrefreshed' event was fired from the documentcontroller with the updated document same with the vm", () => {
            let updatedDoc: ap.models.documents.Document;
            beforeEach(() => {
                spyOn(vm, "copySource").and.callThrough();
                spyOn(doc, "copyStandardProperties").and.callThrough();

                updatedDoc = new ap.models.documents.Document(Utility);
                updatedDoc.createByJson({ Id: doc.Id, EntityVersion: 2, Author: { Id: doc.Author.Id } });
            });
            it("THEN, the vm will updated with the updated document", () => {
                specHelper.general.raiseEvent(DocumentController, "documentstatusrefreshed", updatedDoc);
                expect(doc.copyStandardProperties).toHaveBeenCalledWith(updatedDoc);
                expect(vm.copySource).toHaveBeenCalled();
            });
        });
    });

    describe("Feature: displayBadges", () => {

        let callback: jasmine.Spy;
        let originalDisplayedShapes: ap.models.shapes.PagedShapes[];

        beforeEach(() => {
            vm = createViewModel();
            vm.init(doc);
            originalDisplayedShapes = vm.displayedShapes;

            callback = jasmine.createSpy("callback");
            vm.on("propertychanged", callback, this);
        });

        describe("WHEN a call to displayBadges is made AND the value is different", () => {
            it("THEN, the event 'propertychanged' is raised", () => {
                vm.displayBadges = true;
                expect(callback).toHaveBeenCalledWith(new ap.viewmodels.base.PropertyChangedEventArgs("displayedShapes", originalDisplayedShapes, vm));
            });
        });
    });

    describe("Feature: duplicate", () => {
        let duplicate: ap.viewmodels.documents.DocumentViewModel;
        beforeEach(() => {
            vm = createViewModel();
            vm.init(doc);
            vm.pageIndex = 1;
            vm.versionIndex = 1;
        });
        describe("WHEN the duplicate method is called", () => {
            beforeEach(() => {
                duplicate = vm.duplicate();
            });
            it("THEN, the originalEntity is the same (same ref)", () => {
                expect(duplicate.originalEntity).toBe(vm.originalEntity);
            });
            it("THEN, the versionIndex has the same value", () => {
                expect(duplicate.versionIndex).toBe(vm.versionIndex);
            });
            it("THEN, the pageIndex has the same value", () => {
                expect(duplicate.pageIndex).toBe(vm.pageIndex);
            });
            it("THEN, the displayBadges has the same value", () => {
                expect(duplicate.displayBadges).toBe(vm.displayBadges);
            })
        })
    })
});