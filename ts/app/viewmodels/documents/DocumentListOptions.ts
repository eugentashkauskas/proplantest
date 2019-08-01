module ap.viewmodels.documents {

    /**
     * This class is used to create the options needed to load the list of document of DocumentListViewModel. Depending of the options defined, we will know which path of the document we need to load
     **/
    export class DocumentListOptions {

        /**
         * To know if the list is build for meeting document or project.
         **/
        public get isMeetingDocument(): boolean {
            return this._isMeetingDocument;
        }

        /**
         * This method will return the pathToLoad depending of the options defined.
         **/
        public getPathToLoad(): string {
            let entityPrefix: string = "";
            if (this._isMeetingDocument) {
                entityPrefix = "Document.";
            }
            let pathToLoad: string = entityPrefix + "Folder.Project," + entityPrefix + "UploadedBy.Person," + entityPrefix + "Author";

            if (this.retrieveVersion) {
                pathToLoad += "," + entityPrefix + "Versions," + entityPrefix + "Versions.UploadedBy.Person";
            }

            if (this.retrievePages) {
                pathToLoad += "," + entityPrefix + "Pages";
            }

            if (this.retrieveVersion && this.retrievePages) {
                pathToLoad += "," + entityPrefix + "Versions.Pages";
            }

            if (this.retrieveNoteNbr) {
                pathToLoad += "," + entityPrefix + "NotesCount";
            }

            if (this.retrieveFolderPath) {
                pathToLoad += "," + entityPrefix + "FolderPath," + entityPrefix + "Author.Person," + entityPrefix + "UploadedBy.Person";
            }

            if (this.retrieveRecipients) {
                pathToLoad += "," + entityPrefix + "Recipients";

                if (this.retrieveVersion) {
                    pathToLoad += "," + entityPrefix + "Versions.Recipients";
                }
            }

            pathToLoad += "," + entityPrefix + "IsReport";

            return pathToLoad;
        }

        /**
         * This is the constructor of DocumentListOptions
         * @param retrieveVersion to know if versions collection of document must be loaded
         * @param retrievePages to know if the pages collection of document must be loaded
         * @param retrieveNoteNbr to know if the number of points created on the document must be loaded
         * @param retrieveFolderPath to know if the folder path (path of the document in the project) must be loaded
         * @param retrieveAuthor to know if the User who uploaded the document must be loaded
         * @param retrieveRecipients to know if the recipients collection of the document must be loaded
         **/
        constructor(public retrieveVersion: boolean = false, public retrievePages: boolean = false, public retrieveNoteNbr: boolean = false,
            public retrieveFolderPath: boolean = false, public retrieveAuthor: boolean = false, public retrieveRecipients: boolean = false, private _isMeetingDocument: boolean = false) {
        }
    }
}