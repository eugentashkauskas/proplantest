'use strict';
describe("Module ap-viewmodels - DownloadDocumentViewModel", () => {
    let Utility: ap.utility.UtilityHelper,
        $mdDialog: angular.material.IDialogService,
        DocumentController: ap.controllers.DocumentController,
        document: ap.models.documents.Document,
        version: ap.models.documents.Version,
        downloadDocumentVm: ap.viewmodels.documents.DownloadDocumentViewModel;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");

        angular.mock.module(($provide) => {
            $provide.factory('$mdDialog', ["$q", ($q) => specHelper.utility.stubShowMdDialog($q)]);
        });
    });

    beforeEach(inject(function (_Utility_, _$mdDialog_, _DocumentController_) {
        Utility = _Utility_;
        DocumentController = _DocumentController_;
        $mdDialog = _$mdDialog_;
    }));

    beforeEach(() => {
        document = new ap.models.documents.Document(Utility);
        version = new ap.models.documents.Version(Utility);
        downloadDocumentVm = new ap.viewmodels.documents.DownloadDocumentViewModel(document, version, DocumentController, $mdDialog, Utility);
    });

    describe("Feature: Constructor", () => {
        describe("WHEN a DownloadDocumentViewModel is created", () => {
            it("THEN I can get an instance of the DownloadDocumentViewModel", () => {
                expect(downloadDocumentVm).toBeDefined();
            });

            it("THEN the 'document' is correctly initialized", () => {
                expect(downloadDocumentVm.document).toBe(document);
            });

            it("THEN the 'version' is correctly initialized", () => {
                expect(downloadDocumentVm.version).toBe(version);
            });

            it("THEN 'downloadOption' is correctly initialized", () => {
                expect(downloadDocumentVm.downloadOption).toBe(ap.viewmodels.documents.DownloadDocumentResponse.WorkingFile);
            });
        });
    });

    describe("Feature: close", () => {
        describe("WHEN a vm.close is called", () => {
            beforeEach(() => {
                downloadDocumentVm.close();
            });

            it("THEN, mdDialog.cancel should be called", () => {
                expect($mdDialog.cancel).toHaveBeenCalled();
            });
        });
    });

    describe("Feature: save", () => {
        describe("WHEN a vm.save is called", () => {
            beforeEach(() => {
                spyOn(DocumentController, "downloadDocument");
            });

            describe("AND WorkingFile is selected", () => {
                beforeEach(() => {
                    downloadDocumentVm.downloadOption = 0;
                    downloadDocumentVm.save();
                });

                it("THEN, DocumentController.downloadDocument should be called for working file download", () => {
                    expect(DocumentController.downloadDocument).toHaveBeenCalledWith(document, version, false);
                });
            });

            describe("AND SourceFile is selected", () => {
                beforeEach(() => {
                    downloadDocumentVm.downloadOption = 1;
                    downloadDocumentVm.save();
                });

                it("THEN, DocumentController.downloadDocument should be called for source file download", () => {
                    expect(DocumentController.downloadDocument).toHaveBeenCalledWith(document, version, true);
                });
            });
        });
    });

    describe("Feature: getDownloadOptionDisplayLabel", () => {
        describe("WHEN the getDownloadOptionDisplayLabel method is called with 'WorkingFile'", () => {
            it("THEN, 'app.document.download_document_options.workingfile' is returned", () => {
                expect(downloadDocumentVm.getDownloadOptionDisplayLabel(ap.viewmodels.documents.DownloadDocumentResponse.WorkingFile)).toEqual("[app.document.download_document_options.workingfile]");
            });
        });

        describe("WHEN the getDownloadOptionDisplayLabel method is called with 'SourceFile'", () => {
            it("THEN, 'app.document.download_document_options.sourcefile' is returned", () => {
                expect(downloadDocumentVm.getDownloadOptionDisplayLabel(ap.viewmodels.documents.DownloadDocumentResponse.SourceFile)).toEqual("[app.document.download_document_options.sourcefile]");
            });
        });
    });
}); 