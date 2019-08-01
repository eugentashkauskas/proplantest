module ap.viewmodels.documents {

    export class DocumentVmNoteWorkspaceOption {
        constructor(public $scope: angular.IScope, public $mdSidenav: angular.material.ISidenavService, public $api: ap.services.apiHelper.Api, public $q: angular.IQService, public $mdDialog: angular.material.IDialogService,
            public $timeout: angular.ITimeoutService, public $location: angular.ILocationService, public $anchorScroll: angular.IAnchorScrollService, public $interval: angular.IIntervalService, public $servicesManager: ap.services.ServicesManager) {
        }
    }

    export class SaveDrawingsRequestedEvent {
        public get noteDocument(): ap.models.notes.NoteDocument {
            return this._noteDocument;
        }

        public successCallback(noteDocument?: ap.models.notes.NoteDocument): void {
            if (this._successCallback) {
                if (this._caller)
                    this._successCallback.call(this._caller, noteDocument);
                else
                    this._successCallback(noteDocument);
            }
        }

        public errorCallback(err?: any): void {
            if (this._errorCallback) {
                if (this._caller)
                    this._errorCallback.call(this._caller, err);
                else
                    this._errorCallback(err);
            }
        }

        constructor(noteDocument: ap.models.notes.NoteDocument, successCallback?: (_noteDocument?: ap.models.notes.NoteDocument) => void, errorCallback?: (err?: any) => void, caller?: any) {
            this._noteDocument = noteDocument;
            this._successCallback = successCallback;
            this._errorCallback = errorCallback;
            this._caller = caller;
        }

        private _noteDocument: ap.models.notes.NoteDocument;
        private _successCallback: (noteDocument?: ap.models.notes.NoteDocument) => void;
        private _errorCallback: (err?: any) => void;
        private _caller: any;
    }

    export class DocumentViewModel extends EntityViewModel implements IDocumentViewModel {

        // Properties
        /**
         * If the document viewmodel display a document linked to a noteDocument. THis is the linked notedocument.
         **/
        public get noteDocument(): models.notes.NoteDocument {
            return <models.notes.NoteDocument>this._parentEntity;
        }

        /**
        * This is the document
        **/
        public get document(): ap.models.documents.Document {
            return <ap.models.documents.Document>this.originalEntity;
        }

        /**
        * Use to know if we can be in edit mode
        **/
        public get canEdit(): boolean {
            return this._canEdit;
        }

        /**
        * Use to know if we are in edit mode
        **/
        public get isEditMode(): boolean {
            return this._isEditMode;
        }

        /**
        * Use to set the edit mode
        **/
        public set isEditMode(editMode: boolean) {
            this._isEditMode = editMode;
        }

        /**
         * When we need the list of note linked to the document, this is the note workspace linked to the document.
         **/
        public get noteWorkspaceVm(): ap.viewmodels.notes.NoteWorkspaceViewModel {
            return this._noteWorkspace;
        }

        /**
        * This is the folder's path where the document is
        **/
        public get folderPath(): string {
            return this._folderPath;
        }

        /**
         * This property is to know if the linked note list must be displayed or not.
         **/
        public get displayNoteList(): boolean {
            return this._displayNoteList;
        }

        /**
         * When there is a list linked notes, we want to know if we want to display the badges of all points.
         **/
        public get displayBadges(): boolean {
            return this._displayBadges;
        }

        public set displayBadges(val: boolean) {
            if (val !== this._displayBadges) {
                this._displayBadges = val;
                this.checkShapesToDisplay();
            }
        }

        /**
         * This property is to know the shapes to display depending of users choice. Badge of all points, selected points....
         **/
        public get displayedShapes(): models.shapes.PagedShapes[] {
            return this._displayedShapes;
        }

        /**
        * This is the name of the document
        **/
        public get name(): string {
            return this._name;
        }

        public set name(value: string) {
            this._name = value;
        }

        /**
        * This is the author of the document
        **/
        public get author(): string {
            return this._author;
        }

        /**
        * This is the date of the document
        **/
        public get date(): Date {
            return this._date;
        }

        /**
        * This is the subject of the document
        **/
        public get subject(): string {
            return this._subject;
        }

        public set subject(value: string) {
            this._subject = value;
        }

        /**
        * This is the references of the document
        **/
        public get references(): string {
            return this._references;
        }

        public set references(value: string) {
            this._references = value;
        }

        /**
        * This is the scale of the document
        **/
        public get scale(): number {
            return this._scale;
        }

        /**
        * This is the user who upload the document
        **/
        public get uploadBy(): ap.models.actors.User {
            return this._uploadby;
        }

        /**
        * This is the upload date of the document
        **/
        public get uploadDate(): Date {
            return this._uploadDate;
        }

        /**
        * This is the width of the small thumb of the document
        **/
        public get smallThumbWidth(): number {
            return this._smallThumbWidth;
        }

        /**
        * This is the height of the small thumb of the document
        **/
        public get smallThumbHeight(): number {
            return this._smallThumbHeight;
        }

        /**
        * This is the width of the big thumb of the document
        **/
        public get bigThumbWidth(): number {
            return this._bigThumbWidth;
        }

        /**
        * This is the height of the big thumb of the document
        **/
        public get bigThumbHeight(): number {
            return this._bigThumbHeight;
        }

        /**
        * This is the angle of rotate
        **/
        public get rotateAngle(): number {
            return this._rotateAngle;
        }

        /**
         * A class name calculated based on a rotation of the document
         */
        public get rotationClass(): string {
            return this._rotationClass;
        }

        /**
        * This is the path of the titles
        **/
        public get tilesPath(): string {
            return this._tilesPath;
        }

        /**
        * This is the URL of the image
        **/
        public get imageUrl(): string {
            return this._imageUrl;
        }

        /**
        * This is to know the number of version of the document (document itself included)
        **/
        public get versionCount(): number {
            return this._versionCount;
        }

        /**
        * This is to know if the document is archived
        **/
        public get isArchived(): boolean {
            return this._isArchived;
        }

        /**
        * This is to get the current page of the document
        **/
        public get currentPage(): ap.models.documents.SheetBase {
            return this._currentPage;
        }

        /**
        * To get the page width
        **/
        public get width(): number {
            return this._width;
        }

        /**
        * To get the page height
        **/
        public get height(): number {
            return this._height;
        }

        /**
        * to get the zoomLevelNumber of the page
        **/
        public get zoomLevelNumber(): number {
            return this._zoomLevelNumber;
        }

        /**
        * to get the tilesSize
        **/
        public get tilesSize(): number {
            return this._tilesSize;
        }

        /**
        * To get the bigThumbUrl
        **/
        public get bigThumbUrl(): string {
            if (this.currentPage !== null)
                return this.currentPage.BigThumbUrl;
        }

        /**
        * This is to get the number of page of the document
        **/
        public get pageCount(): number {
            return this._pageCount;
        }

        /**
        * This is to get the index of page. The first page has the index = 0 and is the document itself. Last page index = PageCount - 1.
        **/
        public get pageIndex(): any {
            return this._pageIndex;
        }

        /**
        * This is to set the index of page
        **/
        public set pageIndex(pageIndex: any) {
            let index = this.computePageIndex(pageIndex);

            if (index !== null && index !== this._pageIndex) {
                let originalPageIndex = this._pageIndex;
                this._pageIndex = index;
                this.setCurrentPage();
                this.raisePropertyChanged("pageIndex", originalPageIndex, this);
            }
        }

        /**
        * This is to set the index version of the document
        **/
        public set versionIndex(versionIndex: number) {
            if (versionIndex < 0 || versionIndex >= this._versionCount) {
                throw new Error("The version of the index is out of range.");
            }
            if (versionIndex !== this._versionIndex) {
                let originalVersionIndex = this._versionIndex;
                this._versionIndex = versionIndex;
                this.setCurrentVersion();
                this.raisePropertyChanged("versionIndex", originalVersionIndex, this);
            }
        }

        /**
        * This is to get the index version of the document. This document itself has the versionIndex = versionCount - 1. First version has index = 0
        **/
        public get versionIndex(): number {
            return this._versionIndex;
        }

        /**
        * This is to know the current version of the document
        **/
        public get currentVersion(): ap.models.documents.DocumentBase {
            return this._currentVersion;
        }

        /**
        * This is to set the recipients of the document
        **/
        public get recipients(): ap.models.reports.ReportRecipients[] {
            return this._recipients;
        }

        /**
         * To know if the document has only source file defined and then, no working file
         **/
        public get hasOnlySourceFile(): boolean {
            return this._hasOnlySourceFile;
        }

        /**
        * This is to know if the document is in process
        **/
        public get isProcessing(): boolean {
            return this.document.ProcessingStatus !== ap.models.documents.ProcessingStatus.FullyCompleted &&
                this.document.ProcessingStatus !== ap.models.documents.ProcessingStatus.TilesProcessingFailed &&
                this.document.ProcessingStatus !== ap.models.documents.ProcessingStatus.GenerationReportFailed &&
                this.document.ProcessingStatus !== ap.models.documents.ProcessingStatus.GenerateCacheFileError;
        }

        /**
        * This is to know if the process of the document has been sucessed
        **/
        public get isProcessedSuccess(): boolean {
            return this.document.ProcessingStatus === ap.models.documents.ProcessingStatus.FullyCompleted;
        }

        /**
        * This is to know if the process of the document has been failed
        **/
        public get isProcessedError(): boolean {
            return this.document.ProcessingStatus === ap.models.documents.ProcessingStatus.GenerationReportFailed
                || this.document.ProcessingStatus === ap.models.documents.ProcessingStatus.TilesProcessingFailed
                || this.document.ProcessingStatus === ap.models.documents.ProcessingStatus.GenerateCacheFileError;
        }

        /**
        * This is to know the progress of the process
        **/
        public get progressingStatus(): string {
            if (this.isProcessing) {
                switch (this.document.ProcessingStatus) {
                    case ap.models.documents.ProcessingStatus.ToUpload:
                        return this.$utility.Translator.getTranslation("Uploading");
                    case ap.models.documents.ProcessingStatus.GeneratingReport:
                        if (this.document.NumPageProcessing)
                            return this.$utility.Translator.getTranslation("app.document.report_process").format(this.document.NumPageProcessing + "");
                        else
                            return this.$utility.Translator.getTranslation("app.document.report_process").format("0");
                    case ap.models.documents.ProcessingStatus.TilesProcessing:
                        if (this.document.NumPageProcessing)
                            return this.$utility.Translator.getTranslation("app.document.tiles_process").format(this.document.NumPageProcessing + "");
                        else
                            return this.$utility.Translator.getTranslation("app.document.tiles_process").format("0");
                    case ap.models.documents.ProcessingStatus.ToGenerateCacheFile:
                    case ap.models.documents.ProcessingStatus.ToGenerateReport:
                        return this.$utility.Translator.getTranslation("app.document.to_generate_report");
                    case ap.models.documents.ProcessingStatus.ToGenerateTiles:
                        return this.$utility.Translator.getTranslation("app.document.to_generate_tiles");
                    case ap.models.documents.ProcessingStatus.Unknown:
                        return "";
                }
            }
            else if (this.isProcessedError) {
                return this.$utility.Translator.getTranslation("app.err.document_process");
            }
            return "";
        }

        /**
        * This is to get the path of small thumbs
        **/
        public get smallThumbUrl(): string {
            if (this.document === null) return null;
            return this.currentPage.SmallThumbUrl;
        }


        /**
         * This method will duplicate the DocumentViewModel to have a copy based on the same entity. All properties's value of view model will be copied
         */
        public duplicate(): DocumentViewModel {
            let documentVm = new DocumentViewModel(this.$utility, this.$q, this.$controllersManager, this.$servicesManager, this._docVmNoteWorkspaceOpt);
            documentVm.init(this.document, this.parentEntity);

            documentVm.versionIndex = this.versionIndex;
            documentVm.pageIndex = this.pageIndex;
            documentVm.displayBadges = this.displayBadges;
            documentVm.name = this.name;
            documentVm.references = this.references;
            documentVm.subject = this.subject;
            return documentVm;
        }

        /*
        * To know if the data has changed
        */
        protected computeHasChanged(): boolean {
            let result: boolean = super.computeHasChanged();
            // When data form db is null and that UI does not have null concept then we change UI data to null
            if (this.document.References === null && this._references === "")
                this._references = null;

            if (this.document.Name === null && this._name === "")
                this._name = null;

            if (this.document.Subject === null && this._subject === "")
                this._subject = null;
            if (result === false) {
                result = result || this._name !== this.document.Name;
                result = result || this._subject !== this.document.Subject;
                result = result || this._references !== this.document.References;
                result = result || this._sourceHasChanged;
            }
            return result;
        }

        /*
        * To know if the data is valid to be saved?
        */
        public get maySave(): boolean {
            let nameValid = this._name !== undefined && this._name !== null && this._name.length <= 255 && this._name.length > 0;
            return nameValid;
        }

        /**
        * Public getter to access the screenInfo property
        */
        public get screenInfo(): ap.misc.ScreenInfo {
            return this._screenInfo;
        }

        /**
        * property to access document.sourceUrl
        */
        public get documentSourceFile(): string {
            return this._documentSourceFile;
        }

        public set documentSourceFile(value: string) {
            this._documentSourceFile = value;
            this._hasOnlySourceFile = !StringHelper.isNullOrEmpty(this._documentSourceFile) && StringHelper.isNullOrEmpty(this.imageUrl);
            this._sourceHasChanged = true;
        }

        // Methods

        /**
        * Method called when the event noteopened is raised
        **/
        public noteOpenedHandler() {
            let noteDocVm: ap.viewmodels.notes.NoteDocumentViewModel;
            noteDocVm = this._findLinkedNoteDocumentViewModel(); // find the notedocument corresponding to the this vm
            if (noteDocVm !== null) {
                this._displayBadgeOrShapes(noteDocVm.noteDocument);
            }

            if (this.noteWorkspaceVm.isNoteDetailOpened) {
                // save opened attachment's ID - it is overrided when the original document is opened
                this._previewAttachmentId = this.noteWorkspaceVm.noteDetailVm.screenInfo.documentInPreview;
                this.noteWorkspaceVm.noteDetailVm.noteDocumentList.openDocumentInPictureViewer(noteDocVm);

                this.sendSegmentIOEventsOnDetailOpened();
            }
            this._canEdit = noteDocVm.pictureViewModel.isEditMode;
            this._listener.raise("editmoderequested");
        }

        /**
         * Send events to Segment.IO when the detail of a points is opened from within the documents module
         */
        private sendSegmentIOEventsOnDetailOpened() {
            let currentProject: ap.models.projects.Project = this.$controllersManager.mainController.currentProject();
            let eventName: string = this.document.IsReport ? "cli-menu-open points within report preview" : "cli-menu-open points within document preview";
            let paramValues = [
                new KeyValue(eventName + "-project name", currentProject.Name),
                new KeyValue(eventName + "-project id", currentProject.Id),
                new KeyValue(eventName + "-screenname", this.$controllersManager.mainController.currentMeeting === null ? "projects" : "lists")
            ];
            this.$servicesManager.toolService.sendEvent(eventName, new Dictionary(paramValues));
        }

        /**
         * Restore opened note attachment in case when web page was reloaded
         */
        private restoreOpenedNoteAttachment() {
            if (this._previewAttachmentId) {
                let attachmentToOpen = <ap.viewmodels.notes.NoteDocumentViewModel>this._noteWorkspace.noteDetailVm.noteDocumentList.getEntityById(this._previewAttachmentId);
                if (attachmentToOpen) {
                    this._noteWorkspace.noteDetailVm.noteDocumentList.openDocumentInPictureViewer(attachmentToOpen);
                }
            }
            this._noteWorkspace.off("noteopened", this.restoreOpenedNoteAttachment, this);
        }

        /**
        * This method searches a list of noteDocuments and return the one which is the same document as this Vm.
        * @return noteDocument or null if an element is found or not
        */
        private _findLinkedNoteDocumentViewModel(): ap.viewmodels.notes.NoteDocumentViewModel {
            let noteDocuments: ap.viewmodels.notes.NoteDocumentViewModel[] = <ap.viewmodels.notes.NoteDocumentViewModel[]>this.noteWorkspaceVm.noteDetailVm.noteDocumentList.sourceItems;
            for (let i = 0; i < noteDocuments.length; i++) {
                if (noteDocuments[i].noteDocument.Document.Id === this.document.Id) {
                    return noteDocuments[i];
                }
            }
            return null;
        }

        /**
        * Method used to save different changes on drawings
        * @param addedShapes the list of shapes added
        * @param updatedShapes the list of shapes updated
        * @param deletedShapes the list of shapes deleted
        **/
        public saveDrawings(addedShapes: ap.models.shapes.PagedShapes[], updatedShapes: ap.models.shapes.ShapeBase[], deletedShapes: ap.models.shapes.ShapeBase[], printZones: PrintZone[]): angular.IPromise<ap.models.notes.NoteDocument> {
            let draw: ap.models.notes.Drawing;
            this._deferredSaveDrawings = this.$q.defer<ap.models.notes.NoteDocument>();
            if (!this.noteDocument) {
                throw new Error("The noteDocument can not be null");
            }

            if (updatedShapes) {
                for (let i = 0; i < updatedShapes.length; i++) {
                    let sh = updatedShapes[i];
                    let originalSh = this.noteDocument.getShapeByUid(sh.uid);
                    sh.postChanges();
                    if (originalSh !== null) { // Copy of updated shape's properties to the original shape.
                        originalSh.createFromXml(sh.xml);
                    }
                }
            }
            if (addedShapes) {
                for (let k = 0; k < addedShapes.length; k++) {
                    let pageAdded = addedShapes[k];
                    draw = this.noteDocument.getDrawingByPageIndex(pageAdded.pageIndex);
                    if (!draw) {
                        draw = new ap.models.notes.Drawing(this.$utility);
                        draw.PageIndex = pageAdded.pageIndex;
                        this.noteDocument.addDrawing(draw);
                    }

                    for (let l = 0; l < pageAdded.shapes.length; l++) {
                        let newSh = addedShapes[k].shapes[l];
                        newSh.postChanges();
                        draw.Shapes.push(newSh);
                    }

                }
            }
            if (deletedShapes) {
                for (let j = 0; j < deletedShapes.length; j++) {
                    this.noteDocument.removeShape(deletedShapes[j].uid);
                }
            }
            if (printZones) {
                let printZone: PrintZone;
                for (let i = 0; i < printZones.length; i++) {
                    printZone = printZones[i];
                    if (this.noteDocument)
                        draw = this.noteDocument.getDrawingByPageIndex(printZone.pageIndex);
                    if (draw) {
                        draw.PrintRenderCenterX = printZone.renderCenter.x;
                        draw.PrintRenderCenterY = printZone.renderCenter.y;
                        draw.PrintScale = printZone.scale === 0 ? null : printZone.scale;
                    }
                }
            }
            this._listener.raise("savedrawingsrequested", new SaveDrawingsRequestedEvent(this.noteDocument, this.successCallbackSaveDrawings, this.errorCallbackSaveDrawings, this));
            this._deferredSaveDrawings.resolve(this.noteDocument);
            return this._deferredSaveDrawings.promise;
        }

        /**
         * These method are used as handler when drawings are saved sucessfully
         * @param noteDocument
         */
        private successCallbackSaveDrawings(noteDocument: ap.models.notes.NoteDocument) {
            this._deferredSaveDrawings.resolve();
            this._deferredSaveDrawings = null;
            this.copySource();
        }

        /**
         * These method are used as handler when drawings are saved but error occured. 
         */
        private errorCallbackSaveDrawings(err: any) {
            this._deferredSaveDrawings.reject(err);
            this._deferredSaveDrawings = null;
        }

        /**
         * This method compite the pageIndex regarding the available range. IF negative value returns the first page. Greatet than pagecount, return the last page. Else returns the pageIndex except if no numeric then, returns null
         * @param pageIndex the value for pageIndex to test and compute new one if necessary.
         **/
        private computePageIndex(pageIndex: any): number {
            if (!isNaN(pageIndex)) {
                if (pageIndex < 0)
                    pageIndex = 0;
                if (pageIndex >= this._pageCount)
                    pageIndex = this._pageCount - 1;
                return pageIndex;
            }
            return null;
        }

        /**
         * This method will set the member _currentVersion with the DocumentBase correspondings to the versionIndex. The last version (document himself) or a specific version.
         **/
        private setCurrentVersion() {
            if (this._versionIndex === this._versionCount - 1) {
                this._currentVersion = this.document;
            }
            else if (this.document && this.document.Versions) {
                for (let i = 0; i < this.document.Versions.length; i++) {
                    if (this.document.Versions[i].VersionIndex === this._versionIndex) {
                        this._currentVersion = this.document.Versions[i];
                        break;
                    }
                }
            }
            this.copyVersionData();
            // Need to check if the current page is always existing in the new version selected
            let newPageIndex = this.computePageIndex(this._pageIndex);
            if (newPageIndex === null)
                newPageIndex = 0;
            this._pageIndex = newPageIndex;

            this.setCurrentPage();
        }

        /**
         * This method is to set the currentPage with the current one corresponding the pageIndex and currentVersion selected
         **/
        private setCurrentPage() {
            if (this._pageIndex === 0)
                this._currentPage = this.currentVersion;
            else {
                let page: ap.models.documents.Page;
                for (let i = 0; i < this._pageIndex; i++) {
                    page = this.currentVersion.Pages[i];
                    if (page.PageIndex === this._pageIndex) {
                        this._currentPage = page;
                        break;
                    }
                }
            }
            this.copySheetData();
        }

        /**
         * This method will copy the data concerning only the version in the view model
         **/
        private copyVersionData() {
            if (this.currentVersion.Author)
                this._author = this.currentVersion.Author.DisplayName;
            else
                this._author = null;
            this._date = this.currentVersion.Date;
            this._subject = this.currentVersion.Subject;
            this._references = this.currentVersion.References;
            this._scale = this.currentVersion.Scale;
            if (this.currentVersion.UploadedBy)
                this._uploadby = this.currentVersion.UploadedBy;
            else
                this._uploadby = null;

            this._uploadDate = this.currentVersion.UploadedDate;
            this._rotateAngle = this.currentVersion.RotateAngle;
            this._rotationClass = "rotate-" + this._rotateAngle % 360;
            this._imageUrl = this.currentVersion.ImageUrl;

            this._recipients = this.currentVersion.Recipients;
            this._pageCount = this.currentVersion.Pages && this.currentVersion.Pages.length > 0 ? this.currentVersion.Pages.length + 1 : 1;
        }

        /**
       * This is to copy the data of the current version and page of the document
       **/
        private copySheetData() {
            this._smallThumbWidth = this._currentPage.SmallThumbWidth;
            this._smallThumbHeight = this._currentPage.SmallThumbHeight;
            this._bigThumbHeight = this._currentPage.BigThumbHeight;
            this._bigThumbWidth = this._currentPage.BigThumbWidth;
            if (this.$utility.apiUrl && this.$utility.apiUrl[this.$utility.apiUrl.length - 1] !== "/")
                this._tilesPath = this.$utility.apiUrl + "/" + this._currentPage.TilesPath;
            else
                this._tilesPath = this.$utility.apiUrl + this._currentPage.TilesPath;

            this._tilesSize = this._currentPage.TileSize;
            this._zoomLevelNumber = this._currentPage.ZoomLevelNumber;
            this._height = this._currentPage.Height;
            this._width = this._currentPage.Width;
        }

        /**
        * This is to copy the source if there is a document or use initData()
        **/
        public copySource() {
            if (this.document) {
                // If the noteWorkspace is defined need to set the document id to planId
                // Use when add a new point in the document module
                if (this._noteWorkspace && this.$controllersManager.uiStateController.previousMainFlowState !== ap.controllers.MainFlow.Points) {
                    this._noteWorkspace.document = this.document;
                }
                this._name = this.document.Name;
                this._isArchived = this.document.IsArchived;
                this._versionCount = this.document.VersionCount + 1;
                this._documentSourceFile = this.document.SourceUrl;
                this._sourceHasChanged = false;

                this._versionIndex = this._versionCount - 1;
                this._pageIndex = 0;
                this.buildFolderPath();
                this.setCurrentVersion();
                this._hasOnlySourceFile = !StringHelper.isNullOrEmpty(this.documentSourceFile) && StringHelper.isNullOrEmpty(this.imageUrl);

                if (this._noteWorkspace) {
                    this._noteWorkspace.noteListVm.planId = this.document.Id;
                }

                this.buildNoteDocumentShapesViewModel();
                this.buildScreenAndActions();

            }
            else {
                this.initData();
            }
        }

        /**
         * This method will create the picture view model on which drawings could be created.
         * It will concats all drawing's shapes to specify them in the picture view model.
         **/
        private buildNoteDocumentShapesViewModel() {
            let pagedShapes: ap.models.shapes.PagedShapes[] = [];
            let dicPagedIndex: Dictionary<number, ap.models.shapes.PagedShapes> = new Dictionary<number, ap.models.shapes.PagedShapes>();
            let minPageIndex = 999999;
            let pageShape: ap.models.shapes.PagedShapes;
            if (this.noteDocument && this.noteDocument.Drawings) {
                let drawing: ap.models.notes.Drawing;
                for (let i = 0; i < this.noteDocument.Drawings.length; i++) {
                    drawing = this.noteDocument.Drawings[i];
                    if (dicPagedIndex.containsKey(drawing.PageIndex)) // We need to create only one PagedShape by same PageIndex
                        pageShape = dicPagedIndex.getValue(drawing.PageIndex);
                    else {
                        pageShape = new ap.models.shapes.PagedShapes(drawing.PageIndex, [], drawing.PrintScale, new Point(drawing.PrintRenderCenterX, drawing.PrintRenderCenterY));
                        dicPagedIndex.add(drawing.PageIndex, pageShape);
                        pagedShapes.push(pageShape);
                    }
                    if (drawing.Shapes) {
                        for (let idxS = 0; idxS < drawing.Shapes.length; idxS++)
                            pageShape.shapes.push(drawing.Shapes[idxS]);
                    }
                    if (drawing.PageIndex < minPageIndex) // we want to display the first page having drawing
                        minPageIndex = drawing.PageIndex;
                }
            }
            if (minPageIndex === 999999)
                minPageIndex = 0;
            this.pageIndex = minPageIndex;
            this._noteDocumentShapes = pagedShapes;
            this.checkShapesToDisplay();
        }

        /**
        * Private method to build the screenInfo and the actions
        */
        private buildScreenAndActions() {
            this._actions = new DocumentActionsViewModel(this.$utility, this.document, this.$controllersManager.documentController, this.$controllersManager.mainController, true);
            this._screenInfo = new ap.misc.ScreenInfo(this.$utility, "document.detail", ap.misc.ScreenInfoType.Detail, this._actions.actions, null /* addActions */, null /* mainSearchInfo */, this.document ? this.document.Name : null, true, false, true);
        }

        /**
        * To create the path of the folder
        **/
        private buildFolderPath() {
            this._folderPath = this.document.FolderPath;
            if (this._folderPath) {
                if (this._folderPath.indexOf("Photo") === 0) {
                    this._folderPath = this.$utility.Translator.getTranslation("Private") + this._folderPath.substr("Photo".length);
                }
                else if (this._folderPath.indexOf("Report") === 0) {
                    this._folderPath = this.$utility.Translator.getTranslation("Private") + this._folderPath.substr("Report".length);
                }
            }
            else
                this._folderPath = null;
        }

        /**
        * To init the data of the document
        **/
        private initData() {
            this._folderPath = null;
            this._name = null;
            this._author = null;
            this._date = null;
            this._subject = null;
            this._references = null;
            this._scale = 0;
            this._uploadby = null;
            this._uploadDate = null;
            this._smallThumbWidth = 0;
            this._smallThumbHeight = 0;
            this._bigThumbWidth = 0;
            this._bigThumbHeight = 0;
            this._rotateAngle = 0;
            this._rotationClass = "rotate-0";
            this._tilesPath = null;
            this._imageUrl = null;
            this._versionCount = 0;
            this._isArchived = false;
            this._versionIndex = -1;
            this._currentVersion = null;
            this._recipients = null;
            this._currentPage = null;
            this._pageCount = 1;
            this._pageIndex = 0;
            this._width = 0;
            this._height = 0;
            this._zoomLevelNumber = 0;
            this._tilesSize = 0;
            this.checkShapesToDisplay();
        }

        /**
         * To free resource used by the item
         **/
        public dispose() {
            super.dispose();
            this.$controllersManager.documentController.off("documentupdated", this.documentUpdatedHandler, this);
            this.$controllersManager.documentController.off("versionadded", this.documentVersionAdded, this);
            this.$controllersManager.documentController.off("versiondeleted", this.versionDeleted, this);
            this.$controllersManager.documentController.off("documentstatusrefreshed", this.documentRefreshHandler, this);
            this.$controllersManager.noteController.off("drawingssaved", this.drawingSavedHandler, this);
            this.$controllersManager.noteController.off("noteupdated", this.noteUpdatedHandler, this);

            if (this._noteWorkspace) {
                this._previewAttachmentId = null;
                // remove document's ID and attachment's ID from session when picture viewer is closed
                this._noteWorkspace.dispose();
                this._noteWorkspace = null;
            }
        }

        /**
         * Acept all the change
         **/
        public postChanges() {
            if (this.document) {
                this.document.Name = this.name;
                this.document.Subject = this.subject;
                this.document.References = this.references;
            }
        }
        /**
       * This method is used to update this vm when the document have been updated
       **/
        private documentUpdatedHandler(docUpdatedEventArgs: ap.controllers.EntityUpdatedEvent<ap.models.documents.Document>) {
            if (docUpdatedEventArgs && docUpdatedEventArgs.entity && docUpdatedEventArgs.entity !== null) {
                if (docUpdatedEventArgs.entity.Id === this.document.Id) {
                    let oldRotateAngle = this._rotateAngle;
                    let oldVersionIndex = this._versionIndex;

                    this.init(docUpdatedEventArgs.entity, this.parentEntity);

                    if (oldRotateAngle !== this._rotateAngle) {
                        this.raisePropertyChanged("rotateAngle", oldRotateAngle, this);
                    }
                    this.versionIndex = oldVersionIndex;
                }
            }
        }

        /**
       * Handler method called when version added to the document
       **/
        private documentVersionAdded(versionAddedResult: KeyValue<ap.models.documents.Document, ap.models.documents.Version>) {
            if (versionAddedResult && versionAddedResult.key && versionAddedResult.key !== null) {
                let updateddocument = versionAddedResult.key;
                if (this.document && updateddocument.Id === this.document.Id) {
                    this.init(updateddocument, this.parentEntity);
                    if (this.isProcessing) // If the document is processing, we need to check the end of the process to enabled actions at the end
                        this.$controllersManager.documentController.registerDocumentStatusRefresh(this.document);
                }
            }
        }

        /**
        * This method is the handler when the status of a document has been updated from documentController
        * @param docUpdated item updated from the api
        **/
        private documentRefreshHandler(docUpdated: ap.models.documents.Document) {
            if (this.document && docUpdated.Id === this.document.Id) {
                this.document.copyStandardProperties(docUpdated);
                this.copySource();
                this._listener.raise("documentstatusrefreshed", this.originalEntity);
            }
        }
        /**
        * This method is used to find an action in actions list.
        * @param name - is action name need to find in actions.
        **/
        private _getActionByName(name: string): ap.viewmodels.home.ActionViewModel {
            let action: ap.viewmodels.home.ActionViewModel = null;

            this.actionsViewModel.actions.forEach((item) => {
                if (item.name === name) action = item;
            });

            return action;
        }

        /**
        * To get actions
        **/
        public get actionsViewModel(): ap.viewmodels.documents.DocumentActionsViewModel {
            return this._actions;
        }

        /*
        * Handle click on actions
        * @param name name of defined action
        */
        public actionClick(name: string) {
            let version;
            let action: ap.viewmodels.home.ActionViewModel = this._getActionByName(name);

            if (action === null) {
                throw new Error("Action is not found.");
            }
            else if (action.isVisible === false || action.isEnabled === false) {
                throw new Error("This action cannot be used.");
            }
            else {
                if (this.document !== this.currentVersion) {
                    version = this.currentVersion;
                }

                this.$controllersManager.documentController.downloadDocument(this.document, version);
            }
        }


        /**
         * This method is to build drawings pin of all notes in the list
         */
        private buildNoteListDrawings(isDrawingSave: boolean = false) {
            let _self = this;
            // This method will show to the user how many points have been loaded
            let displayLoadingMessage = (nbCallResolved: number, nbCalls: number) => {
                if (nbCallResolved === nbCalls) {
                    _self.$controllersManager.mainController.hideBusy();
                } else {
                    _self.$controllersManager.mainController.hideBusy();
                    _self.$controllersManager.mainController.showBusy(this.$utility.Translator.getTranslation("app.document.nbDrawingsLoaded").format(nbCallResolved.toString(), nbCalls.toString()));
                }
            };


            if (this._docVmNoteWorkspaceOpt && this._noteWorkspace && this._noteWorkspace.noteListVm.listVm.ids.length > 0) {
                if (isDrawingSave) {
                    // Need to call this method if some drawings have been saved
                    this._docVmNoteWorkspaceOpt.$servicesManager.noteService.on("drawingsLoaded", this.buildPagedShapesBecauseOfSave, this);
                } else {
                    // Need to call this method in order to create badges
                    this._docVmNoteWorkspaceOpt.$servicesManager.noteService.on("drawingsLoaded", this.buildPagedShapes, this);
                }
                this._docVmNoteWorkspaceOpt.$servicesManager.noteService.getDrawingsOfDocument(this.document.Id, this._noteWorkspace.noteListVm.listVm.ids, displayLoadingMessage).then(() => {
                    if (isDrawingSave) {
                        this._docVmNoteWorkspaceOpt.$servicesManager.noteService.off("drawingsLoaded", this.buildPagedShapesBecauseOfSave, this);
                    } else {
                        this._docVmNoteWorkspaceOpt.$servicesManager.noteService.off("drawingsLoaded", this.buildPagedShapes, this);
                    }
                });
            }
            else {
                this._noteListShapes = [];
                return this._noteListShapes;
            }
        }

        /**
         * Method used to build Paged Shapes after saving
         * @param noteDrawingPoint the list of note drawings
         */
        private buildPagedShapesBecauseOfSave(noteDrawingPoint: models.notes.NoteDrawingsPoint[]) {
            this.buildShapes(noteDrawingPoint);
            this.buildNoteDocumentShapesViewModel();
        }

        /**
         * Method used to build Paged Shapes
         * @param noteDrawingPoint the list of note drawings
         */
        private buildPagedShapes(noteDrawingPoint: models.notes.NoteDrawingsPoint[]) {
            this.buildShapes(noteDrawingPoint);
            this.checkShapesToDisplay(true);
        }

        /**
         * Method used to build Shapes
         * @param noteDrawingPoint the list of note drawings
         */
        private buildShapes(noteDrawingPoint: models.notes.NoteDrawingsPoint[]) {
            // We will dispatch all badge by pageIndex
            let pagedBadgeShape: Dictionary<number, models.shapes.PagedShapes> = new Dictionary<number, models.shapes.PagedShapes>();
            let pagedShape: models.shapes.PagedShapes;
            for (let i = 0; i < noteDrawingPoint.length; i++) {
                let ndp = noteDrawingPoint[i];
                if (pagedBadgeShape.containsKey(ndp.PageIndex)) {
                    pagedShape = pagedBadgeShape.getValue(ndp.PageIndex);
                }
                else {
                    pagedShape = new models.shapes.PagedShapes(ndp.PageIndex, []);
                    pagedBadgeShape.add(ndp.PageIndex, pagedShape);
                }
                pagedShape.shapes.push(new models.shapes.BadgeShape(this.$utility, ndp));
            }

            this._noteListShapes = pagedBadgeShape.values();
            return this._noteListShapes;
        }

        /**
         * This method is call when the ids of note list is loaded to load the drawing (badge) corresponding to the plan and to create the badge.
         **/
        private handleNoteIdsLoaded() {
            this.buildNoteListDrawings();
        }

        /**
         * This method change the collection of displayedShapes depending of options displayBadges
         * NOT YET DONE: when a point will be selected, we want to display only shape concerning this note.
         **/
        private checkShapesToDisplay(keepOtherShapes: boolean = false) {
            let originalDisplayedShapes: ap.models.shapes.PagedShapes[] = [];
            for (let i = 0; i < this._displayedShapes.length; i++) {
                originalDisplayedShapes.push(this._displayedShapes[i]);
            }
            if (this.displayBadges) {
                if (this.displayedShapes !== this._noteListShapes) {
                    if (keepOtherShapes) { // in the case there is multiple asynchrone calls
                        for (let i = 0; i < this._noteListShapes.length; i++) {
                            this.displayedShapes.push(this._noteListShapes[i]);
                        }
                    } else {
                        this._displayedShapes = this._noteListShapes;
                    }
                }
            }
            else {
                if (this.noteDocument) {
                    if (this.displayedShapes !== this._noteDocumentShapes) {
                        if (keepOtherShapes) { // in the case there is multiple asynchrone calls
                            for (let i = 0; i < this._noteDocumentShapes.length; i++) {
                                this.displayedShapes.push(this._noteDocumentShapes[i]);
                            }
                        } else {
                            this._displayedShapes = this._noteDocumentShapes.slice(0);
                        }
                    }
                }
                else
                    this._displayedShapes = [];
            }
            this.raisePropertyChanged("displayedShapes", originalDisplayedShapes, this);
        }

        /**
        * Private method used to display the shapes or badges on the document if a note is selected or not
        */
        private _displayBadgeOrShapes(noteDocument: ap.models.notes.NoteDocument) {
            this._parentEntity = noteDocument;
            this.buildNoteDocumentShapesViewModel();
            if (this._noteWorkspace.isNoteDetailOpened && this._noteWorkspace && this._noteWorkspace.noteDetailVm && this._noteWorkspace.noteDetailVm.noteBase && noteDocument) {
                // if the detail is opened and a note is selected
                this.displayBadges = false;
            } else {
                this.displayBadges = true;
            }
        }

        private drawingSavedHandler(noteDoc: ap.models.notes.NoteDocument) {
            if (this.noteDocument && noteDoc.Id === this.noteDocument.Id) {
                this._listener.raise("drawingssaved");
                this.buildNoteListDrawings(true); // When drawings are saved it means we need to update the badge displayed for all the list of notes.
            }
        }

        /**
        * Method use to raise "versiondeleted" to be catched by the picture viewer
        **/
        private versionDeleted(args: ap.controllers.EntityUpdatedEvent<ap.models.documents.Document>) {
            this._listener.raise("versiondeleted", args.entity);
        }

        public getTileUrl(tileName: string): string {
            return this.currentPage.getTileUrl(tileName);
        }

        private noteUpdatedHandler() {
        }

        constructor($utility: ap.utility.UtilityHelper, private $q: angular.IQService, private $controllersManager: ap.controllers.ControllersManager, private $servicesManager: ap.services.ServicesManager, private _docVmNoteWorkspaceOpt?: DocumentVmNoteWorkspaceOption) {
            super($utility);
            this.$controllersManager.documentController.on("documentupdated", this.documentUpdatedHandler, this);
            this.$controllersManager.documentController.on("versionadded", this.documentVersionAdded, this);
            this.$controllersManager.documentController.on("versiondeleted", this.versionDeleted, this);
            this.$controllersManager.documentController.on("documentstatusrefreshed", this.documentRefreshHandler, this);
            this.$controllersManager.noteController.on("drawingssaved", this.drawingSavedHandler, this);

            // subcribe to noteupdated event because the notedocument is updated and therefore we have to update it to avoid errors
            this.$controllersManager.noteController.on("noteupdated", this.noteUpdatedHandler, this);

            this._listener.addEventsName(["savedrawingsrequested", "drawingssaved", "editmoderequested", "versiondeleted", "documentstatusrefreshed"]);

            this.initData();
            this.EventHelper = $utility.EventTool;

            // It means that the list of point corresponding to the point will be displayed near the document
            if (_docVmNoteWorkspaceOpt) {
                this._noteWorkspace = new ap.viewmodels.notes.NoteWorkspaceViewModel(_docVmNoteWorkspaceOpt.$scope, _docVmNoteWorkspaceOpt.$mdSidenav, this.$utility, _docVmNoteWorkspaceOpt.$api, _docVmNoteWorkspaceOpt.$q,
                    _docVmNoteWorkspaceOpt.$mdDialog, _docVmNoteWorkspaceOpt.$timeout, _docVmNoteWorkspaceOpt.$location, _docVmNoteWorkspaceOpt.$anchorScroll, _docVmNoteWorkspaceOpt.$interval, this.$controllersManager,
                    _docVmNoteWorkspaceOpt.$servicesManager, null, false);
                this._displayBadges = true;
                this.noteWorkspaceVm.noteListVm.listVm.on("idsloaded", this.handleNoteIdsLoaded, this);
                this.noteWorkspaceVm.on("noteopened", this.noteOpenedHandler, this);
                this.noteWorkspaceVm.on("noteopened", this.restoreOpenedNoteAttachment, this);
            }
            this.checkShapesToDisplay();
        }

        // Private
        private _noteWorkspace: ap.viewmodels.notes.NoteWorkspaceViewModel; // use to display the list of notes linked to a document

        private _selectedNoteLinkedDocument: ap.viewmodels.documents.DocumentViewModel; // === document selected from the noteDocuments list of a point linked to this document

        private _displayNoteList: boolean = false;
        private _displayBadges: boolean = false;
        private _displayedShapes: models.shapes.PagedShapes[] = [];
        private _noteListShapes: models.shapes.PagedShapes[] = [];
        private _noteDocumentShapes: models.shapes.PagedShapes[] = [];
        private _folderPath: string;
        private _name: string;
        private _author: string;
        private _date: Date;
        private _subject: string;
        private _references: string;
        private _scale: number;
        private _uploadby: ap.models.actors.User;
        private _uploadDate: Date;
        private _smallThumbWidth: number;
        private _smallThumbHeight: number;
        private _bigThumbWidth: number;
        private _bigThumbHeight: number;
        private _rotateAngle: number;
        private _rotationClass: string;
        private _tilesPath: string;
        private _imageUrl: string;
        private _hasOnlySourceFile: boolean = false;
        private _versionCount: number;
        private _isArchived: boolean;
        private _recipients: ap.models.reports.ReportRecipients[];
        private _versionIndex: number;
        private _currentVersion: ap.models.documents.DocumentBase;
        private _currentPage: ap.models.documents.SheetBase;
        private _pageCount: number;
        private _pageIndex: number;
        private _width: number;
        private _height: number;
        private _zoomLevelNumber: number;
        private _tilesSize: number;
        private EventHelper: ap.utility.EventHelper;
        private _screenInfo: ap.misc.ScreenInfo;
        private _actions: ap.viewmodels.documents.DocumentActionsViewModel;
        private _documentSourceFile: string;
        private _sourceHasChanged: boolean = false;
        private _isEditMode: boolean = false;
        private _canEdit: boolean = false;
        private _previewAttachmentId: string = null;
        private _deferredSaveDrawings: angular.IDeferred<ap.models.notes.NoteDocument>;
    }
}