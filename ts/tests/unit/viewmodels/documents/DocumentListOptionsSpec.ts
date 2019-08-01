"use strict";
describe("Module ap-viewmodels - documentListOptions", () => {

    describe("Feature: getPathToLoad", () => {

        let options: ap.viewmodels.documents.DocumentListOptions;

        describe("WHEN docListOptions is created with all parameters = TRUE AND getPathToLoad is called", () => {
            it("THEN, 'Folder.Project,UploadedBy.Person,Author' is returned", () => {
                options = new ap.viewmodels.documents.DocumentListOptions(true, true, true, true, true, true);
                expect(options.getPathToLoad()).toBe("Folder.Project,UploadedBy.Person,Author,Versions,Versions.UploadedBy.Person,Pages,Versions.Pages,NotesCount,FolderPath,Author.Person,UploadedBy.Person,Recipients,Versions.Recipients,IsReport");
            });
        });
        describe("WHEN docListOptions is created with all parameters = TRUE and isMeetingDocument is true  AND getPathToLoad is called", () => {
            it("THEN, 'Folder.Project,UploadedBy.Person,Author' is returned", () => {
                options = new ap.viewmodels.documents.DocumentListOptions(true, true, true, true, true, true, true);
                options = new ap.viewmodels.documents.DocumentListOptions(true, true, true);
                expect(options.getPathToLoad()).toBe("Folder.Project,UploadedBy.Person,Author,Versions,Versions.UploadedBy.Person,Pages,Versions.Pages,NotesCount,IsReport");
            });
        });
        describe("WHEN docListOptions is created with all parameters = FALSE AND getPathToLoad is called", () => {
            it("THEN, 'Folder.Project,UploadedBy.Person,Author,IsReport' is returned", () => {
                options = new ap.viewmodels.documents.DocumentListOptions();
                expect(options.getPathToLoad()).toBe("Folder.Project,UploadedBy.Person,Author,IsReport");
            });
        });
        describe("WHEN docListOptions is created with retreiveVersion = TRUE AND getPathToLoad is called", () => {
            it("THEN, 'Folder.Project,UploadedBy.Person,Author,Versions,Versions.UploadedBy.Person,IsReport' is returned", () => {
                options = new ap.viewmodels.documents.DocumentListOptions(true);
                expect(options.getPathToLoad()).toBe("Folder.Project,UploadedBy.Person,Author,Versions,Versions.UploadedBy.Person,IsReport");
            });
        });
        describe("WHEN docListOptions is created with retreiveVersion = TRUE AND retreivePages = TRUE AND getPathToLoad is called", () => {
            it("THEN, 'Folder.Project,UploadedBy.Person,Author,Versions,Versions.UploadedBy.Person,Pages,Versions.Pages,IsReport' is returned", () => {
                options = new ap.viewmodels.documents.DocumentListOptions(true, true);
                expect(options.getPathToLoad()).toBe("Folder.Project,UploadedBy.Person,Author,Versions,Versions.UploadedBy.Person,Pages,Versions.Pages,IsReport");
            });
        });
        describe("WHEN docListOptions is created with retreiveVersion = FALSE AND retreivePages = TRUE AND getPathToLoad is called", () => {
            it("THEN, 'Folder.Project,UploadedBy.Person,Author,Versions,Versions.UploadedBy.Person,IsReport' is returned", () => {
                options = new ap.viewmodels.documents.DocumentListOptions(false, true);
                expect(options.getPathToLoad()).toBe("Folder.Project,UploadedBy.Person,Author,Pages,IsReport");
            });
        });
        describe("WHEN docListOptions is created with retreiveVersion = TRUE AND retreivePages = TRUE AND retreiveNoteNbr = TRUE AND getPathToLoad is called", () => {
            it("THEN, 'Folder.Project,UploadedBy.Person,Author,Versions,Versions.UploadedBy.Person,Pages,Versions.Pages,NotesCount,IsReport' is returned", () => {
                options = new ap.viewmodels.documents.DocumentListOptions(true, true, true);
                expect(options.getPathToLoad()).toBe("Folder.Project,UploadedBy.Person,Author,Versions,Versions.UploadedBy.Person,Pages,Versions.Pages,NotesCount,IsReport");
            });
        });
        describe("WHEN docListOptions is created with retreiveVersion = TRUE AND retreivePages = TRUE AND retreiveNoteNbr = TRUE AND retreiveFolderPath = TRUE AND getPathToLoad is called", () => {
            it("THEN, 'Folder.Project,UploadedBy.Person,Author,Versions,Versions.UploadedBy.Person,Pages,Versions.Pages,NotesCount,FolderPath,Author.Person,UploadedBy.Person,IsReport' is returned", () => {
                options = new ap.viewmodels.documents.DocumentListOptions(true, true, true, true);
                expect(options.getPathToLoad()).toBe("Folder.Project,UploadedBy.Person,Author,Versions,Versions.UploadedBy.Person,Pages,Versions.Pages,NotesCount,FolderPath,Author.Person,UploadedBy.Person,IsReport");
            });
        });
    });
});