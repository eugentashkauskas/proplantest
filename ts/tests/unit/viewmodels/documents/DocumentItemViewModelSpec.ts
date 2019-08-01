describe("Module ap-viewmodels - documents components - DocumentItemViewModel", () => {

    let vm: ap.viewmodels.documents.DocumentItemViewModel;
    let Utility: ap.utility.UtilityHelper, UserContext: ap.utility.UserContext;
    let $q: angular.IQService;
    let baseTime = new Date(2016, 2, 20, 15, 30, 20);
    let DocumentController: ap.controllers.DocumentController;
    let MainController: ap.controllers.MainController;
    let MeetingController: ap.controllers.MeetingController;
    let eventHelper: ap.utility.EventHelper;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject(function (_$rootScope_, _UserContext_, _Utility_, _$q_, _DocumentController_, _MainController_, _MeetingController_, _EventHelper_) {
        Utility = _Utility_;
        UserContext = _UserContext_;
        $q = _$q_;
        DocumentController = _DocumentController_;
        MainController = _MainController_;
        MeetingController = _MeetingController_;
        eventHelper = _EventHelper_;
        jasmine.clock().install;
        specHelper.general.stubDate(baseTime);
        specHelper.utility.stubUserConnected(Utility);
        spyOn(MainController, "currentProject").and.returnValue(
            {
                Id: "35a2c5d6-0e00-43e9-ada8-ce4d3fafb16e",
                IsActive: true,
                UserAccessRight: {
                    CanUploadDoc: true,
                    CanDownloadDoc: true
                }
            });
    }));

    afterEach(() => {
        jasmine.clock().uninstall;
    });

    function createDocumentItemViewModel(doc: ap.models.documents.Document, parentListVm?: ap.viewmodels.BaseListEntityViewModel): ap.viewmodels.documents.DocumentItemViewModel {
        return new ap.viewmodels.documents.DocumentItemViewModel(Utility, $q, parentListVm, new ap.viewmodels.documents.DocumentItemParameter(0, doc, null, null, Utility, DocumentController, MainController, MeetingController));
    }

    class TestListEntityViewModel extends ap.viewmodels.BaseListEntityViewModel {
    }

    describe("Feature: DocumentItemParameter", () => {
        let itemParameter: ap.viewmodels.documents.DocumentItemParameter;
        let doc: ap.models.documents.Document;
        describe("When the DocumentItemParameter is created without isMeetingModule", () => {
            beforeEach(() => {
                doc = new ap.models.documents.Document(Utility);
                itemParameter = new ap.viewmodels.documents.DocumentItemParameter(0, doc, null, null, Utility, DocumentController, MainController, MeetingController);
            });

            it("THEN, DocumentItemParameter is correctly created with isMeetingModule = false", () => {
                expect(itemParameter.itemIndex).toEqual(0);
                expect(itemParameter.dataSource).toEqual(doc);
                expect(itemParameter.isMeetingDocument).toBeFalsy();
            });
        });
        describe("When the DocumentItemParameter is created with isMeetingModule", () => {
            beforeEach(() => {
                doc = new ap.models.documents.Document(Utility);
                itemParameter = new ap.viewmodels.documents.DocumentItemParameter(0, doc, null, null, Utility, DocumentController, MainController, MeetingController, true);
            });

            it("THEN, DocumentItemParameter is correctly created with isMeetingModule = false", () => {
                expect(itemParameter.itemIndex).toEqual(0);
                expect(itemParameter.dataSource).toEqual(doc);
                expect(itemParameter.isMeetingDocument).toBeTruthy();
            });
        });
    });

    describe("Feature constructor", () => {
        let doc: ap.models.documents.Document;
        let date: Date;
        let uploadDate;
        beforeEach(() => {
            uploadDate = new Date(2016, 5, 4);
            date = new Date();
            doc = new ap.models.documents.Document(Utility);
            doc.Name = "House";
            doc.Date = date;
            doc.NotesCount = 10;
            doc.IsArchived = true;
            doc.VersionCount = 5;
            doc.Status = ap.models.documents.DocumentStatus.Processed;
            doc.ProcessingStatus = ap.models.documents.ProcessingStatus.FullyCompleted;
            doc.References = "References";
            doc.Subject = "Subject";
            doc.UploadedByName = "User 1";
            doc.Author = new ap.models.actors.User(Utility);
            doc.Author.createByJson({ Id: "User1" });
            doc.Author = new ap.models.actors.User(Utility);
            doc.Author.createByJson({ Id: "User1" });
            doc.UploadedDate = uploadDate;
            doc.Recipients = [];
            let recipient1: ap.models.reports.ReportRecipients = new ap.models.reports.ReportRecipients(Utility);
            recipient1.IsInvited = false;
            let recipient2: ap.models.reports.ReportRecipients = new ap.models.reports.ReportRecipients(Utility);
            recipient2.IsInvited = false;
            doc.Recipients.push(recipient1);
            doc.Recipients.push(recipient2);

        });
        describe("When the DocumentItemViewModel is init with params", () => {
            beforeEach(() => {
                vm = createDocumentItemViewModel(doc);
                vm.init(doc);
            });

            it("THEN, the vm is build with the correct values from the entity", () => {
                expect(vm.name).toEqual("House");
                expect(vm.notesCount).toBe(-1);
                expect(vm.date).toBe(date);
                expect(vm.isArchived).toBeTruthy();
                expect(vm.versionDisplay).toEqual("6");
                expect(vm.references).toEqual("References");
                expect(vm.comments).toEqual("Subject");
                expect(vm.isShowingMetaData).toBeFalsy();
                expect(vm.uploadedByName).toBe("User 1");
                expect(vm.uploadDate).toEqual(uploadDate);
                expect(vm.recipients.length).toBe(2);
            });

            it("THEN the actions are defined", () => {
                expect(vm.documentActionViewModel).toBeDefined();
            });

            
        });

        describe("WHEN a document is deleted", () => {

            beforeEach(() => {
                doc = new ap.models.documents.Document(Utility);
                doc.createByJson({
                    Deleted: true
                });
                doc.Author = new ap.models.actors.User(Utility);
                doc.Author.createByJson({ Id: "User1" });

                vm = createDocumentItemViewModel(doc);
                vm.init(doc);
            });

            it("THEN, the isDeleted property is correctly initialized", () => {
                expect(vm.isDeleted).toBeTruthy();
            });
        });

        describe("WHEN the documentItemVm is build a document not completely processed but not in error", () => {
            beforeEach(() => {

                doc.Status = ap.models.documents.DocumentStatus.Uploaded;
                doc.ProcessingStatus = ap.models.documents.ProcessingStatus.TilesProcessing;
                spyOn(DocumentController, "registerDocumentStatusRefresh");

                vm = createDocumentItemViewModel(doc);
                vm.init(doc);

            });
            it("THEN, the DocumentController.registerDocumentStatusRefresh is called with the document", () => {
                expect(DocumentController.registerDocumentStatusRefresh).toHaveBeenCalledWith(doc);
            });
        });
        describe("WHEN the documentItemVm is build a document is completely processed AND not in error", () => {
            beforeEach(() => {

                doc.Status = ap.models.documents.DocumentStatus.Processed;
                doc.ProcessingStatus = ap.models.documents.ProcessingStatus.FullyCompleted;
                spyOn(DocumentController, "registerDocumentStatusRefresh");

                vm = createDocumentItemViewModel(doc);
                vm.init(doc);

            });
            it("THEN, the DocumentController.registerDocumentStatusRefresh is not called", () => {
                expect(DocumentController.registerDocumentStatusRefresh).not.toHaveBeenCalled();
            });
        });
        describe("WHEN the documentItemVm is build a document is in error", () => {
            beforeEach(() => {

                doc.Status = ap.models.documents.DocumentStatus.Uploaded;
                doc.ProcessingStatus = ap.models.documents.ProcessingStatus.TilesProcessingFailed;
                spyOn(DocumentController, "registerDocumentStatusRefresh");

                vm = createDocumentItemViewModel(doc);
                vm.init(doc);

            });
            it("THEN, the DocumentController.registerDocumentStatusRefresh is not called", () => {
                expect(DocumentController.registerDocumentStatusRefresh).not.toHaveBeenCalled();
            });
        });
    });

    describe("Feature init", () => {
        let doc: ap.models.documents.Document;
        let doc2: ap.models.documents.Document;
        let meetingDoc: ap.models.meetings.MeetingDocument;
        beforeEach(() => {
            doc = new ap.models.documents.Document(Utility);
            doc.Author = new ap.models.actors.User(Utility);
            doc.Author.createByJson({ Id: "User1" });
            doc2 = new ap.models.documents.Document(Utility);
            doc2.Author = new ap.models.actors.User(Utility);
            doc2.Author.createByJson({ Id: "User2" });
            meetingDoc = new ap.models.meetings.MeetingDocument(Utility);
            meetingDoc.Document = doc2;
            vm = createDocumentItemViewModel(doc);
        });
        describe("When init is called with a meetingDocument", () => {
            beforeEach(() => {
                vm.init(meetingDoc);
            });
            it("THEN, the entities are correctly init", () => {
                expect(vm.originalEntity).toEqual(doc2);
                expect(vm.parentEntity).toEqual(meetingDoc);
            });
        });
        describe("When init is called with a document", () => {
            beforeEach(() => {
                vm.init(doc2);
            });
            it("THEN, the entities are correctly init", () => {
                expect(vm.originalEntity).toEqual(doc2);
                expect(vm.parentEntity).toEqual(null);
            });
        });
    });

    describe("Feature setter properties", () => {
        let doc: ap.models.documents.Document;
        let date: Date;
        beforeEach(() => {
            date = new Date();
            doc = new ap.models.documents.Document(Utility);
            doc.Name = "House";
            doc.Date = date;
            doc.NotesCount = 10;
            doc.IsArchived = true;
            doc.VersionCount = 5;
            doc.Status = ap.models.documents.DocumentStatus.Processed;
            doc.ProcessingStatus = ap.models.documents.ProcessingStatus.FullyCompleted;
            doc.References = "References";
            doc.Subject = "Subject";
            doc.Author = new ap.models.actors.User(Utility);
            doc.Author.createByJson({ Id: "User1" });

            vm = new ap.viewmodels.documents.DocumentItemViewModel(Utility, $q, undefined, new ap.viewmodels.documents.DocumentItemParameter(0, doc, null, null, Utility, DocumentController, MainController, MeetingController));
            vm.init(doc);

        });

        describe("WHEN isShowingMetaData is set to true", () => {
            beforeEach(() => {
                vm.isShowingMetaData = true;
            });

            it("THEN a new value is applied to isShowingMetaData", () => {
                expect(vm.isShowingMetaData).toBeTruthy();
            });

            it("THEN a show document metadata action is hidden", () => {
                let action = ap.viewmodels.home.ActionViewModel.getAction(vm.documentActionViewModel.actions, "document.info");
                expect(action.isVisible).toBeFalsy();
            });
        });

        describe("WHEN isShowingMetaData is set to false", () => {
            beforeEach(() => {
                vm.isShowingMetaData = false;
            });

            it("THEN a new value is applied to isShowingMetaData", () => {
                expect(vm.isShowingMetaData).toBeFalsy();
            });

            it("THEN a show document metadata action is visible", () => {
                let action = ap.viewmodels.home.ActionViewModel.getAction(vm.documentActionViewModel.actions, "document.info");
                expect(action.isVisible).toBeTruthy();
            });
        });

        it("references is correct set", () => {
            vm.references = "AAA";
            expect(vm.references).toEqual("AAA");
        });

        it("comments is correct set", () => {
            vm.comments = "Comments";
            expect(vm.comments).toEqual("Comments");
        });


    });

    describe("Feature status calculation", () => {
        describe("When the DocumentItemViewModel init with a document", () => {

            let doc: ap.models.documents.Document;
            let date: Date = new Date();

            beforeEach(() => {
                doc = new ap.models.documents.Document(Utility);
                doc.Name = "House";
                doc.Date = date;
                doc.NotesCount = 10;
                doc.Author = new ap.models.actors.User(Utility);
                doc.Author.createByJson({ Id: "User1" });
            });

            it("isProcessing changed base on ProcessingStatus", () => {
                vm = createDocumentItemViewModel(doc);
                vm.init(doc);
                doc.ProcessingStatus = ap.models.documents.ProcessingStatus.GeneratingReport;
                expect(vm.isProcessing).toBeTruthy();

                doc.ProcessingStatus = ap.models.documents.ProcessingStatus.FullyCompleted;
                expect(vm.isProcessing).toBeFalsy();

                doc.ProcessingStatus = ap.models.documents.ProcessingStatus.TilesProcessing;
                expect(vm.isProcessing).toBeTruthy();

                doc.ProcessingStatus = ap.models.documents.ProcessingStatus.GenerationReportFailed;
                expect(vm.isProcessing).toBeFalsy();
            });

            it("isProcessedSuccess changed base on ProcessingStatus", () => {
                vm = createDocumentItemViewModel(doc);
                vm.init(doc);
                doc.ProcessingStatus = ap.models.documents.ProcessingStatus.FullyCompleted;
                expect(vm.isProcessedSuccess).toBeTruthy();

                doc.ProcessingStatus = ap.models.documents.ProcessingStatus.GenerationReportFailed;
                expect(vm.isProcessedSuccess).toBeFalsy();

                doc.ProcessingStatus = ap.models.documents.ProcessingStatus.FullyCompleted;
                expect(vm.isProcessedSuccess).toBeTruthy();

                doc.ProcessingStatus = ap.models.documents.ProcessingStatus.ToUpload;
                expect(vm.isProcessedSuccess).toBeFalsy();
            });

            it("isProcessedError changed base on ProcessingStatus", () => {
                vm = createDocumentItemViewModel(doc);
                vm.init(doc);
                doc.ProcessingStatus = ap.models.documents.ProcessingStatus.TilesProcessingFailed;
                expect(vm.isProcessedError).toBeTruthy();

                doc.ProcessingStatus = ap.models.documents.ProcessingStatus.GeneratingReport;
                expect(vm.isProcessedError).toBeFalsy();

                doc.ProcessingStatus = ap.models.documents.ProcessingStatus.GenerationReportFailed;
                expect(vm.isProcessedError).toBeTruthy();
            });
        });
    });

    describe("Feature action click", () => {
        let doc: ap.models.documents.Document;
        let date: Date = new Date();
        beforeEach(() => {
            doc = new ap.models.documents.Document(Utility);
            doc.Name = "House";
            doc.Date = date;
            doc.NotesCount = 10;
            doc.Status = ap.models.documents.DocumentStatus.Processed;
            doc.ProcessingStatus = ap.models.documents.ProcessingStatus.FullyCompleted;
            doc.Author = new ap.models.actors.User(Utility);
            doc.Author.createByJson({ Id: "User1" });
        });

        describe("WHEN download action click 2 times", () => {
            it("THEN the download event is raised 2 times", () => {
                vm = createDocumentItemViewModel(doc);
                vm.init(doc);
                let downloadHandler = jasmine.createSpy("downloadHandler");
                vm.on("downloadclicked", (item) => {
                    let entityItem = <ap.viewmodels.EntityItemViewModel>item;
                    expect(entityItem.originalEntity.Id).toEqual(doc.Id);
                    downloadHandler();
                }, this);

                vm.actionClick("document.download");
                vm.actionClick("document.download");

                expect(downloadHandler).toHaveBeenCalled();
                expect(downloadHandler.calls.count()).toEqual(2)
            });
        });
        describe("WHEN wrong action click", () => {
            it("THEN raise error", () => {
                vm = createDocumentItemViewModel(doc);
                vm.init(doc);

                expect(() => vm.actionClick("xxx")).toThrowError("The action xxx is not available");
            });
        });
        describe("WHEN action document.info is called", () => {
            let listVm: ap.viewmodels.BaseListEntityViewModel;

            beforeEach(() => {
                listVm = new TestListEntityViewModel(Utility);

                vm = createDocumentItemViewModel(doc, listVm);
                vm.init(doc);

                spyOn(listVm, "selectEntity").and.stub();
                spyOn(DocumentController, "showDocumentMetadata").and.stub();

                vm.actionClick("document.info");
            });

            it("THEN, the showDocumentMetadata method of the DocumentController is called", () => {
                expect(DocumentController.showDocumentMetadata).toHaveBeenCalled();
            });
        });
    });
    describe("Feature: refresh item status", () => {
        let doc: ap.models.documents.Document;
        let docUpdated: ap.models.documents.Document;
        beforeEach(() => {
            let jsonDoc: any = {};
            modelSpecHelper.fillDocumentJson(jsonDoc);
            jsonDoc.Name = "House";
            jsonDoc.NotesCount = 10;
            jsonDoc.Status = ap.models.documents.DocumentStatus.NotUploaded;
            jsonDoc.ProcessingStatus = ap.models.documents.ProcessingStatus.GeneratingReport;


            doc = new ap.models.documents.Document(Utility);
            doc.createByJson(jsonDoc);
            doc.Author = new ap.models.actors.User(Utility);
            doc.Author.createByJson({ Id: "User1" });

            jsonDoc.Status = ap.models.documents.DocumentStatus.Processed;
            jsonDoc.ProcessingStatus = ap.models.documents.ProcessingStatus.FullyCompleted;
            docUpdated = new ap.models.documents.Document(Utility);
            docUpdated.createByJson(jsonDoc);
            docUpdated.Author = new ap.models.actors.User(Utility);
            docUpdated.Author.createByJson({ Id: "User1" });

        });
        describe("WHEN the status of document is refreshed", () => {
            beforeEach(() => {
                vm = createDocumentItemViewModel(doc);
                vm.init(doc);
                spyOn(DocumentController, "unregisterDocumentStatusRefresh");                
                specHelper.general.raiseEvent(DocumentController, "documentstatusrefreshed", docUpdated);
            });
            it("THEN, the vm's document status is refreshed with new data - isProcessing = false", () => {
                expect(vm.isProcessing).toBeFalsy();
            });
            it("THEN, the vm's document status is refreshed with new data - isProcessedError = false", () => {
                expect(vm.isProcessedError).toBeFalsy();
            });
            it("THEN, the vm's document status is refreshed with new data - isProcessedSuccess = true", () => {
                expect(vm.isProcessedSuccess).toBeTruthy();
            });
            it("THEN, the vm's document status is refreshed with new data - originalEntity", () => {
                expect(vm.originalDocument.ProcessingStatus).toBe(ap.models.documents.ProcessingStatus.FullyCompleted);
            });
            it("THEN, unregisterDocumentStatusRefresh is called", () => {
                doc.copyStandardProperties(docUpdated);
                expect(DocumentController.unregisterDocumentStatusRefresh).toHaveBeenCalledWith(doc);
            });
        });
        describe("WHEN the status of document is refreshed but the doc is not the same of the one of vm", () => {
            beforeEach(() => {
                vm = createDocumentItemViewModel(doc);
                vm.init(doc);

                spyOn(vm, "init");
                let json = {};
                modelSpecHelper.fillDocumentJson(json);
                docUpdated.createByJson(json);
                specHelper.general.raiseEvent(DocumentController, "documentstatusrefreshed", docUpdated);
            });
            it("THEN, nothing happens", () => {
                expect(vm.init).not.toHaveBeenCalled();
            });
        });
    });
    describe("Feature preview click", () => {
        let doc: ap.models.documents.Document;
        let date: Date = new Date();
        beforeEach(() => {
            doc = new ap.models.documents.Document(Utility);
            doc.Name = "House";
            doc.Date = date;
            doc.NotesCount = 10;
            doc.Status = ap.models.documents.DocumentStatus.Processed;
            doc.ProcessingStatus = ap.models.documents.ProcessingStatus.FullyCompleted;
            doc.Author = new ap.models.actors.User(Utility);
            doc.Author.createByJson({ Id: "User1" });
        });
        describe("WHEN preview action is clicked on document fully processed", () => {
            beforeEach(() => {
                vm = createDocumentItemViewModel(doc);
                vm.init(doc);
            });
            it("THEN, action is enabled", () => {
                expect(vm.documentActionViewModel.actions[0].name).toEqual("document.preview");
                expect(vm.documentActionViewModel.actions[0].isEnabled).toBeTruthy();
            });
            it("THEN the previewclicked event is raised", () => {
                let previewHandler = jasmine.createSpy("previewHandler");
                vm.on("previewclicked", (item) => {
                    let entityItem = <ap.viewmodels.EntityItemViewModel>item;
                    expect(entityItem.originalEntity.Id).toEqual(doc.Id);
                    previewHandler(entityItem);
                }, this);

                vm.actionClick("document.preview");

                expect(previewHandler).toHaveBeenCalledWith(vm);
            });
        });
        describe("WHEN the document is not completely processed", () => {
            beforeEach(() => {
                doc.Status = ap.models.documents.DocumentStatus.Uploaded;
                doc.ProcessingStatus = ap.models.documents.ProcessingStatus.ToGenerateTiles;
                vm = createDocumentItemViewModel(doc);
                vm.init(doc);
            });

            it("THEN, action is disabled", () => {
                expect(vm.documentActionViewModel.actions[0].name).toEqual("document.preview");
                expect(vm.documentActionViewModel.actions[0].isEnabled).toBeFalsy();
            });

            it("THEN, previewclicked does nothing", () => {
                let previewHandler = jasmine.createSpy("previewHandler");
                vm.on("previewclicked", (item) => {
                    previewHandler();
                }, this);

                vm.actionClick("document.preview");

                expect(previewHandler).not.toHaveBeenCalled();
            });
        });
    });
    describe("Feature download click", () => {
        let doc: ap.models.documents.Document;
        let date: Date = new Date();
        beforeEach(() => {
            doc = new ap.models.documents.Document(Utility);
            doc.Name = "House";
            doc.Date = date;
            doc.NotesCount = 10;
            doc.Status = ap.models.documents.DocumentStatus.Uploaded;
            doc.ProcessingStatus = ap.models.documents.ProcessingStatus.TilesProcessing;
            doc.Author = new ap.models.actors.User(Utility);
            doc.Author.createByJson({ Id: "User1" });
        });
        describe("WHEN download action is clicked on document is uploaded", () => {
            beforeEach(() => {
                vm = createDocumentItemViewModel(doc);
                vm.init(doc);
            });

            it("THEN, action is enabled", () => {
                let action = ap.viewmodels.home.ActionViewModel.getAction(vm.documentActionViewModel.actions, "document.download");
                expect(action.isEnabled).toBeTruthy();
            });

            it("THEN the downloadclicked event is raised", () => {
                let downloadHandler = jasmine.createSpy("downloadHandler");
                vm.on("downloadclicked", (item) => {
                    let entityItem = <ap.viewmodels.EntityItemViewModel>item;
                    expect(entityItem.originalEntity.Id).toEqual(doc.Id);
                    downloadHandler(entityItem);
                }, this);

                vm.actionClick("document.download");

                expect(downloadHandler).toHaveBeenCalledWith(vm);
            });
        });
        describe("WHEN the document is not uploaded", () => {
            beforeEach(() => {
                doc.Status = ap.models.documents.DocumentStatus.NotUploaded;
                doc.ProcessingStatus = ap.models.documents.ProcessingStatus.ToUpload;
                vm = createDocumentItemViewModel(doc);
                vm.init(doc);
            });

            it("THEN, action is disabled", () => {
                let action = ap.viewmodels.home.ActionViewModel.getAction(vm.documentActionViewModel.actions, "document.download");
                expect(action.isEnabled).toBeFalsy();
            });
            it("THEN, downloadclicked does nothing", () => {
                let downloadHandler = jasmine.createSpy("downloadHandler");
                vm.on("downloadclicked", (item) => {
                    downloadHandler();
                }, this);

                vm.actionClick("document.download");

                expect(downloadHandler).not.toHaveBeenCalled();
            });
        });
    });
    describe("Feature isOpened", () => {
        let doc: ap.models.documents.Document;
        let date: Date = new Date();
        beforeEach(() => {
            doc = new ap.models.documents.Document(Utility);
            doc.Name = "House";
            doc.Date = date;
            doc.NotesCount = 10;
            doc.Status = ap.models.documents.DocumentStatus.Processed;
            doc.ProcessingStatus = ap.models.documents.ProcessingStatus.FullyCompleted;
            doc.Author = new ap.models.actors.User(Utility);
            doc.Author.createByJson({ Id: "User1" });
            vm = createDocumentItemViewModel(doc);
            vm.init(doc);

        });
        describe("WHEN isOpened is set to true", () => {
            beforeEach(() => {
                vm.isOpened = true;
            });
            it("THEN the 'document.preview' action is hidden", () => {
                let action = ap.viewmodels.home.ActionViewModel.getAction(vm.documentActionViewModel.actions, "document.preview");
                expect(action.isVisible).toBeFalsy();
            });
            it("THEN the 'document.info' action is hidden", () => {
                let action = ap.viewmodels.home.ActionViewModel.getAction(vm.documentActionViewModel.actions, "document.info");
                expect(action.isVisible).toBeFalsy();
            });
            describe("AND back to false", () => {
                beforeEach(() => {
                    vm.isOpened = false;
                });
                it("THEN the 'document.preview' action is visible", () => {
                    let action = ap.viewmodels.home.ActionViewModel.getAction(vm.documentActionViewModel.actions, "document.preview");
                    expect(action.isVisible).toBeTruthy();
                });
                it("THEN the 'document.info' action is visible", () => {
                    let action = ap.viewmodels.home.ActionViewModel.getAction(vm.documentActionViewModel.actions, "document.info");
                    expect(action.isVisible).toBeTruthy();
                });
            });
        });
    });

    describe("Feature archive click", () => {
        let doc: ap.models.documents.Document;
        beforeEach(() => {
            doc = new ap.models.documents.Document(Utility);
            doc.createByJson({ Id: "D1", Author: { Id: "User1" } });
            spyOn(ap.controllers.DocumentController.prototype, "archiveDocument").and.returnValue($q.defer().promise);

        });

        describe("WHEN actionClick method was called with 'document.archive' and the user can do this action", () => {
            beforeEach(() => {
                vm = createDocumentItemViewModel(doc);
                vm.init(doc);
                let action: ap.viewmodels.home.ActionViewModel = new ap.viewmodels.home.ActionViewModel(Utility, eventHelper);
                action.isVisible = true;
                action.isEnabled = true;
                spyOn(ap.viewmodels.home.ActionViewModel, "getAction").and.returnValue(action);
            });
            it("THEN, documentController.archiveDocument method will be called", () => {
                vm.actionClick("document.archive");
                expect(ap.controllers.DocumentController.prototype.archiveDocument).toHaveBeenCalledWith(vm.originalDocument);
            });
        });
        describe("WHEN actionClick method was called with 'document.archive' and the user cannot do this action", () => {
            beforeEach(() => {
                vm = createDocumentItemViewModel(doc);
                vm.init(doc);
                let action: ap.viewmodels.home.ActionViewModel = new ap.viewmodels.home.ActionViewModel(Utility, eventHelper);
                action.isVisible = true;
                action.isEnabled = false;
                spyOn(ap.viewmodels.home.ActionViewModel, "getAction").and.returnValue(action);
            });

            it("THEN, nothing happen", () => {
                vm.actionClick("document.archive");
                expect(ap.controllers.DocumentController.prototype.archiveDocument).not.toHaveBeenCalled();
            });
        });
    });

    describe("Feature unarchive click", () => {
        let doc: ap.models.documents.Document;
        beforeEach(() => {
            doc = new ap.models.documents.Document(Utility);
            doc.createByJson({ Id: "D1", Author: { Id: "User1" } });
            spyOn(ap.controllers.DocumentController.prototype, "unarchiveDocument").and.returnValue($q.defer().promise);
        });

        describe("WHEN actionClick method was called with 'document.unarchive' and the user can do this action", () => {
            beforeEach(() => {
                vm = createDocumentItemViewModel(doc);
                vm.init(doc);
                let action: ap.viewmodels.home.ActionViewModel = new ap.viewmodels.home.ActionViewModel(Utility, eventHelper);
                action.isVisible = true;
                action.isEnabled = true;
                spyOn(ap.viewmodels.home.ActionViewModel, "getAction").and.returnValue(action);
            });
            it("THEN, documentController.unarchiveDocument method will be called", () => {
                vm.actionClick("document.unarchive");
                expect(ap.controllers.DocumentController.prototype.unarchiveDocument).toHaveBeenCalledWith(vm.originalDocument);
            });
        });
        describe("WHEN actionClick method was called with 'document.unarchive' and the user cannot do this action", () => {
            beforeEach(() => {
                vm = createDocumentItemViewModel(doc);
                vm.init(doc);
                let action: ap.viewmodels.home.ActionViewModel = new ap.viewmodels.home.ActionViewModel(Utility, eventHelper);
                action.isVisible = true;
                action.isEnabled = false;
                spyOn(ap.viewmodels.home.ActionViewModel, "getAction").and.returnValue(action);
            });

            it("THEN, nothing happen", () => {
                vm.actionClick("document.unarchive");
                expect(ap.controllers.DocumentController.prototype.unarchiveDocument).not.toHaveBeenCalled();
            });
        });
    });

    describe("Feature: deleteDocument", () => {

        let doc: ap.models.documents.Document;

        beforeEach(() => {
            doc = new ap.models.documents.Document(Utility);
            doc.createByJson({ Id: "D1", Author: { Id: "User1" } });
            
            spyOn(DocumentController, "requestDeleteDocument");

            let action: ap.viewmodels.home.ActionViewModel = new ap.viewmodels.home.ActionViewModel(Utility, eventHelper);
            action.isVisible = true;
            action.isEnabled = true;
            spyOn(ap.viewmodels.home.ActionViewModel, "getAction").and.callFake((actions, actionName) => {
                if (actionName === "document.delete") return action;
                return new ap.viewmodels.home.ActionViewModel(Utility, eventHelper);
            });

            vm = createDocumentItemViewModel(doc);
            vm.init(doc);
        });

        describe("WHEN actionClick is called with 'document.delete'", () => {
            it("THEN documentController.requestDeleteDocument is called", () => {
                vm.actionClick("document.delete");

                expect(DocumentController.requestDeleteDocument).toHaveBeenCalled();
            });
        });
    });

    describe("Feature documentUpdatedHandler", () => {
        let doc: ap.models.documents.Document;
        let updatedDoc: ap.models.documents.Document;
        beforeEach(() => {
            doc = new ap.models.documents.Document(Utility);
            doc.createByJson({ Id: "D1", Author: { Id: "User1" } });
            vm = createDocumentItemViewModel(doc);
            vm.init(doc);

            spyOn(vm, "init");

            updatedDoc = new ap.models.documents.Document(Utility);
        });

        describe("WHEN 'documentupdated' event was fired from the documentcontroller with the document same with the vm", () => {
            it("THEN, the vm will updated with the updated document", () => {
                updatedDoc.createByJson({ Id: "D1", Author: { Id: "User1" } });
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

    describe("Feature documentDeletedHandler", () => {
        let doc: ap.models.documents.Document;
        let deletedDoc: ap.models.documents.Document;
        beforeEach(() => {
            doc = new ap.models.documents.Document(Utility);
            doc.createByJson({ Id: "D1", Author: { Id: "User1" } });
            vm = createDocumentItemViewModel(doc);
            vm.init(doc);

            spyOn(vm, "init");

            deletedDoc = new ap.models.documents.Document(Utility);
        });

        describe("WHEN 'documentdeleted' event was fired from the documentcontroller with the document same with the vm", () => {
            it("THEN, the vm will updated with the updated document", () => {
                deletedDoc.createByJson({ Id: "D1", Author: { Id: "User1" } });
                specHelper.general.raiseEvent(DocumentController, "documentdeleted", new ap.controllers.EntityUpdatedEvent<ap.models.documents.Document>(deletedDoc));
                expect(vm.init).toHaveBeenCalledWith(deletedDoc, vm.parentEntity);
            });
        });
        describe("WHEN 'documentdeleted' event was fired from the documentcontroller with the document have not same with the vm", () => {
            it("THEN, nothing happens", () => {
                deletedDoc.createByJson({ Id: "D2", Author: { Id: "User1" } });
                specHelper.general.raiseEvent(DocumentController, "documentdeleted", new ap.controllers.EntityUpdatedEvent<ap.models.documents.Document>(deletedDoc));
                expect(vm.init).not.toHaveBeenCalled();
            });
        });
    });
    describe("Feature versionDeletedHandler", () => {
        let doc: ap.models.documents.Document;
        let deletedDoc: ap.models.documents.Document;
        beforeEach(() => {
            doc = new ap.models.documents.Document(Utility);
            doc.createByJson({ Id: "D1", Author: { Id: "User1" } });
            vm = createDocumentItemViewModel(doc);
            vm.init(doc);

            spyOn(vm, "init");

            deletedDoc = new ap.models.documents.Document(Utility);
        });

        describe("WHEN 'versiondeleted' event was fired from the documentcontroller with the document same with the vm", () => {
            it("THEN, the vm will updated with the updated document", () => {
                deletedDoc.createByJson({ Id: "D1", Author: { Id: "User1" } });
                specHelper.general.raiseEvent(DocumentController, "versiondeleted", new ap.controllers.EntityUpdatedEvent<ap.models.documents.Document>(deletedDoc));
                expect(vm.init).toHaveBeenCalledWith(deletedDoc, vm.parentEntity);
            });
        });
        describe("WHEN 'versiondeleted' event was fired from the documentcontroller with the document have not same with the vm", () => {
            it("THEN, nothing happens", () => {
                deletedDoc.createByJson({ Id: "D2", Author: { Id: "User1" } });
                specHelper.general.raiseEvent(DocumentController, "versiondeleted", new ap.controllers.EntityUpdatedEvent<ap.models.documents.Document>(deletedDoc));
                expect(vm.init).not.toHaveBeenCalled();
            });
        });
    });

    describe("Feature: current document updated", () => {
        let doc: ap.models.documents.Document;
        let updatedDoc: ap.models.documents.Document;
        beforeEach(() => {
            doc = new ap.models.documents.Document(Utility);
            doc.createByJson({ Id: "D1", Author: { Id: "User1" } });
            vm = createDocumentItemViewModel(doc);
            vm.init(doc);
        });

        describe("WHEN the VM is initialized with the same document but updated", () => {

            beforeEach(() => {
                updatedDoc = new ap.models.documents.Document(Utility);
                updatedDoc.createByJson({ Id: "D1" });

                spyOn(vm.documentActionViewModel, "updateDocument");

                vm.init(updatedDoc);
            });

            it("THEN, documentActionsViewModel.updateDocument is called to update the actions visibility", () => {
                expect(vm.documentActionViewModel.updateDocument).toHaveBeenCalledWith(updatedDoc);
            });
        });

        describe("WHEN the VM is initialized with another document", () => {

            beforeEach(() => {
                updatedDoc = new ap.models.documents.Document(Utility);
                updatedDoc.createByJson({ Id: "D2", Author: { Id: "User1" } });

                spyOn(vm, "dispose");

                vm.init(updatedDoc);
            });

            it("THEN, dipose is called", () => {
                expect(vm.dispose).toHaveBeenCalled;
            });
        });
    });

    describe("Feature: documentFileType", () => {
        let doc: ap.models.documents.Document;
        let updatedDoc: ap.models.documents.Document;
        beforeEach(() => {
            doc = new ap.models.documents.Document(Utility);
            doc.createByJson({ Id: "D1", Author: { Id: "User1" } }); 
        });
        describe("WHEN the VM is initialized with a document of type Document", () => {

            beforeEach(() => {
                doc.FileType = ap.models.documents.FileType.Document;
                vm = createDocumentItemViewModel(doc);
                vm.init(doc);
            });

            it("Feature: documentFileType", () => {
                expect(vm.documentFileType).toBe("[app.document.filetype_document]");
            });
        });

        describe("WHEN the VM is initialized with a document of type Plan", () => {

            beforeEach(() => {
                doc.FileType = ap.models.documents.FileType.Plan;
                vm = createDocumentItemViewModel(doc);
                vm.init(doc);
            });

            it("Feature: documentFileType", () => {
                expect(vm.documentFileType).toBe("[app.document.filetype_plan]");
            });
        });

        describe("WHEN the VM is initialized with a document of type Picture", () => {

            beforeEach(() => {
                doc.FileType = ap.models.documents.FileType.Picture;
                vm = createDocumentItemViewModel(doc);
                vm.init(doc);
            });

            it("Feature: documentFileType", () => {
                expect(vm.documentFileType).toBe("[app.document.filetype_picture]");
            });
        });

        describe("WHEN the VM is initialized with a document of type Photo", () => {

            beforeEach(() => {
                doc.FileType = ap.models.documents.FileType.Photo;
                vm = createDocumentItemViewModel(doc);
                vm.init(doc);
            });

            it("Feature: documentFileType", () => {
                expect(vm.documentFileType).toBe("[app.document.filetype_photo]");
            });
        });
    });

    describe("Feature: versionadded", () => {
        let doc: ap.models.documents.Document;
        beforeEach(() => {
            doc = new ap.models.documents.Document(Utility);
            doc.createByJson({ Id: "D1", Author: { Id: "User1" } });
            vm = createDocumentItemViewModel(doc);
            vm.init(doc);
            spyOn(vm, "init");
        });
        describe("WHEN 'versionadded' event was fired from the documentcontroller with the updated document same with the vm", () => {
            it("THEN, the vm will updated with the updated document", () => {
                let updatedDoc: ap.models.documents.Document = new ap.models.documents.Document(Utility);
                updatedDoc.createByJson({ Id: "D1", EntityVersion: 2, Author: { Id: "User1" } });
                specHelper.general.raiseEvent(DocumentController, "versionadded", new KeyValue<ap.models.documents.Document, ap.models.documents.Version>(updatedDoc, null));

                expect(vm.init).toHaveBeenCalledWith(updatedDoc, vm.parentEntity);
            });
        });
    });
});  