"use strict";

describe("Module ap-viewmodels - DocumentWorkspaceElement", () => {
    let element: ap.viewmodels.documents.DocumentWorkspaceElement;

    describe("Feature: Default values", () => {
        it("by default all are true", () => {
            element = new ap.viewmodels.documents.DocumentWorkspaceElement();

            expect(element).toBeDefined();
            expect(element.hasDocumentList).toBeTruthy();
            expect(element.hasDocumentViewer).toBeTruthy();
            expect(element.hasFolderList).toBeTruthy();

            expect(element.documentListOption).toBeDefined();
            expect(element.documentListOption.retrieveAuthor).toBeTruthy();
            expect(element.documentListOption.retrieveFolderPath).toBeTruthy();
            expect(element.documentListOption.retrieveNoteNbr).toBeFalsy();
            expect(element.documentListOption.retrievePages).toBeFalsy();
            expect(element.documentListOption.retrieveRecipients).toBeTruthy();
            expect(element.documentListOption.retrieveVersion).toBeFalsy();
        });
    });

    describe("Rule: cannot set hasDocumentViewer be true if hasPlanDocumentList = false", () => {
        describe("IF set hasDocumentList = false", () => {
            it("THEN hasDocumentViewer to be false also", () => {
                element = new ap.viewmodels.documents.DocumentWorkspaceElement();
                element.hasDocumentList = false;
                expect(element.hasDocumentViewer).toBeFalsy();
            });
        });

        describe("IF set hasDocumentList = false", () => {
            it("THEN error will throw when set hasDocumentViewer to true", () => {
                element = new ap.viewmodels.documents.DocumentWorkspaceElement();
                element.hasDocumentList = false;
                expect(() => { element.hasDocumentViewer = true; }).toThrowError();
            });
        });
    });
});