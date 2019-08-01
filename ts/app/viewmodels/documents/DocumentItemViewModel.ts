module ap.viewmodels.documents {

    /**
     * This class is the parameter needed to create an item DocumentItemViewModel
     **/
    export class DocumentItemParameter extends ItemConstructorParameter {
        public get documentController(): ap.controllers.DocumentController {
            return this.$documentController;
        }

        public get mainController(): ap.controllers.MainController {
            return this.$mainController;
        }

        public get meetingController(): ap.controllers.MeetingController {
            return this.$meetingController;
        }

        public get isMeetingDocument(): boolean {
            return this._isMeetingDocument;
        }

        constructor(itemIndex: number, dataSource: any, pageDesc: PageDescription, parameters: LoadPageSuccessHandlerParameter, utility: ap.utility.UtilityHelper, private $documentController: ap.controllers.DocumentController, private $mainController: ap.controllers.MainController,
            private $meetingController: ap.controllers.MeetingController, private _isMeetingDocument: boolean = false) {
            super(itemIndex, dataSource, pageDesc, parameters, utility);
        }
    }

    export class DocumentItemViewModel extends ap.viewmodels.EntityViewModel implements IDocumentItemViewModel, IDocumentViewModel, ap.component.dragAndDrop.IDraggableEntityViewModel {


        /**
        * For simple status to easy binding that the plan is not yet processed
        **/
        public get isProcessing(): boolean {
            return this.originalDocument.ProcessingStatus !== ap.models.documents.ProcessingStatus.FullyCompleted &&
                this.originalDocument.ProcessingStatus !== ap.models.documents.ProcessingStatus.TilesProcessingFailed &&
                this.originalDocument.ProcessingStatus !== ap.models.documents.ProcessingStatus.GenerationReportFailed;
        }

        /**
        * For simple status to easy binding that the plan is  processed
        **/
        public get isProcessedSuccess(): boolean {
            return this.originalDocument.ProcessingStatus === ap.models.documents.ProcessingStatus.FullyCompleted;
        }

        /**
        * For simple status to easy binding that the plan is on error processing
        **/
        public get isProcessedError(): boolean {
            return this.originalDocument.ProcessingStatus === ap.models.documents.ProcessingStatus.GenerationReportFailed || this.originalDocument.ProcessingStatus === ap.models.documents.ProcessingStatus.TilesProcessingFailed;
        }

        public get name(): string {
            return this._name;
        }

        public get date(): Date {
            return this._date;
        }

        public get notesCount(): number {
            return this._notesCount;
        }

        public set notesCount(val: number) {
            this._notesCount = val;
        }

        public get uploadedByName(): string {
            return this._uploadedByName;
        }

        public get uploadDate(): Date {
            return this._uploadDate;
        }


        public get author(): string {
            return this._author;
        }

        public get isArchived(): boolean {
            return this._isArchived;
        }

        public get isDeleted(): boolean {
            return this._isDeleted;
        }

        public get isMeetingReport(): boolean {
            return this._isMeetingReport;
        }

        public set isMeetingReport(newValue: boolean) {
            this._isMeetingReport = newValue;
        }

        public get notesCountDisplay(): string {
            let result: string = this._notesCount.toString();
            return result;
        }

        public get meetingDocument(): ap.models.meetings.MeetingDocument {
            return <ap.models.meetings.MeetingDocument>this.parentEntity;
        }

        public get smallThumbPath(): string {
            if (this.originalDocument === null) return null;
            return this.$utility.apiUrl + this.originalDocument.TilesPath + "/smallthumb.jpg?device=web&t=" + this.$utility.UserContext.Token();
        }

        public get documentFileType(): string {
            if (this.originalDocument === null) return null;
            if (this.originalDocument.FileType === ap.models.documents.FileType.Document)
                return this.$utility.Translator.getTranslation("app.document.filetype_document");
            if (this.originalDocument.FileType === ap.models.documents.FileType.Plan)
                return this.$utility.Translator.getTranslation("app.document.filetype_plan");
            if (this.originalDocument.FileType === ap.models.documents.FileType.Picture)
                return this.$utility.Translator.getTranslation("app.document.filetype_picture");
            if (this.originalDocument.FileType === ap.models.documents.FileType.Photo)
                return this.$utility.Translator.getTranslation("app.document.filetype_photo");
        }
        /**
         * This is the count of versions of the document. This number is done async. If the value = -1, it means the count is not yet done.
         **/
        public get versionCount(): number {
            return this._versionCount;
        }

        /**
        * The display text of current version of the item
        **/
        public get versionDisplay(): string {
            return this._versionCount.toString();
        }

        public get originalDocument(): ap.models.documents.Document {
            return <ap.models.documents.Document>this.originalEntity;
        }

        /**
        * This is the vm to manage the actions of the document
        **/
        public get documentActionViewModel(): DocumentActionsViewModel {
            return this._documentActionsViewModel;
        }
        /**
        * To know the item is opened or not
        **/
        public get isOpened(): boolean {
            return this._isOpened;
        }

        public set isOpened(value: boolean) {
            if (this._isOpened !== value) {
                let oldValue = this._isOpened;
                this._isOpened = value;
                this._documentActionsViewModel.isPreviewMode = this._isOpened;
                this.raisePropertyChanged("isOpened", oldValue, this);
            }
        }

        /**
        * To know the item is showing meta data
        **/
        public get isShowingMetaData(): boolean {
            return this._isShowingMetaData;
        }

        public set isShowingMetaData(val: boolean) {
            if (this._isShowingMetaData !== val) {
                let oldValue = this._isShowingMetaData;
                this._isShowingMetaData = val;
                this._documentActionsViewModel.isShowingMetaData = this._isShowingMetaData;
                this.raisePropertyChanged("isShowingMetaData", oldValue, this);
            }
        }

        /**
        * references of the document 
        **/
        public get references(): string {
            return this._references;
        }

        public set references(val: string) {
            this._references = val;
        }

        /**
        * Subject of the document
        **/
        public get comments(): string {
            return this._comments;
        }

        public set comments(val: string) {
            this._comments = val;
        }

        /**
        * List of recipinets received the report
        **/
        public get recipients(): ap.models.reports.ReportRecipients[] {
            return this._recipients;
        }

        /**
        * List of display names of the recipients
        **/
        public get recipientsDisplay(): string {
            let result = null;
            if (this._recipients && this.recipients !== null && this._recipients.length > 0)
                result = this._recipients.map(u => u.DisplayName).join(", ");
            return result;
        }

        /**
         * A class name calculated based on a rotation of the document
         */
        public get rotationClass(): string {
            return this._rotationClass;
        }

        /**
        * Used to get the visibility of move down button
        **/
        public get moveDownAvailable(): boolean {
            return this._moveDownAvailable;
        }

        /**
        * Used to set the visibility of move down button
        **/
        public set moveDownAvailable(value: boolean) {
            this._moveDownAvailable = value;
        }

        /**
        * Used to get the visibility of move up button
        **/
        public get moveUpAvailable(): boolean {
            return this._moveUpAvailable;
        }

        /**
        * Used to set the visibility of move up button
        **/
        public set moveUpAvailable(value: boolean) {
            this._moveUpAvailable = value;
        }

        public init(entity: ap.models.Entity, parentEntity?: ap.models.Entity) {
            if (entity instanceof ap.models.meetings.MeetingDocument) {
                super.init(entity.Document, entity);
            } else {
                super.init(entity, parentEntity);
            }
        }
        /*
        * Handle click on moveactions
        * @param actionName name of defined ation
        */
        public moveActionClick(actionName: string) {
            if (actionName) {
                switch (actionName) {
                    case "moveup":
                        this._parameters.documentController.moveDocument(this.originalDocument.Id, (this.parentList.getItemAtIndex(this.index - 1)).originalEntity.Id, models.projects.MoveType.Before);
                        break;
                    case "movedown":
                        this._parameters.documentController.moveDocument(this.originalDocument.Id, (this.parentList.getItemAtIndex(this.index + 1)).originalEntity.Id, models.projects.MoveType.After);
                        break;
                }
            }
        }

        /*
        * Handle click on actions
        * @param actionName name of defined ation
        */
        public actionClick(actionName: string) {
            let action: ap.viewmodels.home.ActionViewModel;
            action = ap.viewmodels.home.ActionViewModel.getAction(this._documentActionsViewModel.actions, actionName);
            if ((action && action.isVisible && action.isEnabled) || (actionName.search("pictureviewer.") >= 0)) {
                switch (actionName) {
                    case "document.download":
                        this._listener.raise("downloadclicked", this);
                        break;
                    case "document.preview":
                        this._listener.raise("previewclicked", this);
                        break;
                    case "report.sendByEmail":
                        this._listener.raise("reportclicked", this);
                        break;
                    case "document.archive":
                        this._parameters.documentController.archiveDocument(this.originalDocument);
                        break;
                    case "document.unarchive":
                        this._parameters.documentController.unarchiveDocument(this.originalDocument);
                        break;
                    case "document.delete":
                        if (this._parameters.isMeetingDocument === false)
                            this._parameters.documentController.requestDeleteDocument(this._documentActionsViewModel.documentAccessRight);
                        else
                            this._parameters.meetingController.deleteMeetingDocument(this.meetingDocument).then((meetingDoc: ap.models.meetings.MeetingDocument) => {
                                this.init(meetingDoc.Document, meetingDoc);
                                this.isOpened = false;
                            });
                        break;
                    case "document.edit":
                        this._parameters.documentController.requestEditDocument(this.originalDocument);
                        break;
                    case "document.info":
                        this._parameters.documentController.showDocumentMetadata(this.originalDocument);
                        break;
                    case "document.addversion":
                        this._parameters.documentController.addVersion(this.originalDocument);
                        break;
                    case "document.rotateleft":
                        this._parameters.documentController.rotateDocument(this.originalDocument, services.RotateOrientation.Left);
                        break;
                    case "document.rotateright":
                        this._parameters.documentController.rotateDocument(this.originalDocument, services.RotateOrientation.Right);
                        break;
                    case "pictureviewer.showversionscomparison":
                        this.documentActionViewModel.hideRotateAction();
                        break;
                    case "pictureviewer.hideversionscomparison":
                        this.documentActionViewModel.showRotateAction();
                        break;
                    case "pictureviewer.viewnextdocument":
                        this._listener.raise("viewnextdocumentclicked");
                        break;
                    case "pictureviewer.viewprevdocument":
                        this._listener.raise("viewprevdocumentclicked");
                        break;
                }
            }
            if (!action && actionName.search("pictureviewer.") < 0)
                throw new Error("The action " + actionName + " is not available");
        }

        /**
        * Display order of the document
        */
        public get displayOrder(): number {
            return this._displayOrder;
        }

        /**
        * Set the display order of the document
        */
        public set displayOrder(displayOrder: number) {
            this._displayOrder = displayOrder;
        }

        /**
        * Return id of drag element
        */
        public get dragId() {
            return this.originalDocument.Id;
        }

        /**
        * Allow drag and drop
        */
        public allowDrag() {
            return this.isProcessedSuccess;
        }

        /**
        * Called when element is dropped
        */
        public drop(dropTarget: ap.component.dragAndDrop.IDraggableEntityViewModel): boolean {
            let docToFolder = dropTarget instanceof ap.viewmodels.folders.FolderItemViewModel;
            if (this.originalDocument.FolderId !== dropTarget.dragId && docToFolder)
                this._listener.raise("droppedintofolder", new ap.component.dragAndDrop.DropEntityEvent(this, dropTarget));
            else if (dropTarget && this.dragId !== dropTarget.dragId && !docToFolder)
                this._listener.raise("documentdropped", new ap.component.dragAndDrop.DropEntityEvent(this, dropTarget));
            return false;
        }

        copySource(): void {
            super.copySource();
            this.clearRefreshStatus();
            if (this.originalDocument && this.originalDocument !== null) {
                this._name = this.originalDocument.Name;
                this._date = this.originalDocument.Date;
                this._uploadDate = this.originalDocument.UploadedDate;
                this._displayOrder = this.originalDocument.DisplayOrder;
                this._uploadedByName = this.originalDocument.UploadedByName;
                if (this.originalDocument.Author)
                    this._author = this.originalDocument.Author.DisplayName;
                this._isArchived = this.originalDocument.IsArchived;
                this._versionCount = this.originalDocument.VersionCount + 1;
                this._isDeleted = this.originalDocument.Deleted || (this.meetingDocument && this.meetingDocument.Deleted);
                this._references = this.originalDocument.References;
                this._comments = this.originalDocument.Subject;
                this._recipients = this.originalDocument.Recipients;
                this._rotationClass = "rotate-" + this.originalDocument.RotateAngle % 360;

                if (this._parameters) {
                    if (this.isProcessing) // If the document is processing, we need to check the end of the process to enabled actions at the end
                        this._parameters.documentController.registerDocumentStatusRefresh(this.originalDocument);
                }
            }
            this.buildActions();
        }

        /**
         * Set original entity and raise entity changed event
         * @param entity Entity for the viewmodel
         */
        protected setOriginalEntity(entity: ap.models.Entity, parentEntity?: ap.models.Entity) {
            let oldEntity = this.originalEntity;
            super.setOriginalEntity(entity, parentEntity);
            this.raisePropertyChanged("originalEntity", oldEntity, this);
        }

        /*
        * Build available actions for a single document
        */
        private buildActions() {
            if (this._documentActionsViewModel && this._documentActionsViewModel.document && this._documentActionsViewModel.document.Id !== this.originalDocument.Id) {
                this._documentActionsViewModel.dispose();
            }

            if (this._documentActionsViewModel && this._documentActionsViewModel.document && this._documentActionsViewModel.document.Id === this.originalDocument.Id) {
                this._documentActionsViewModel.updateDocument(this.originalDocument);
            } else {
                if (this._parameters) {
                    this._documentActionsViewModel = new DocumentActionsViewModel(this.$utility, this.originalDocument, this._parameters.documentController, this._parameters.mainController, false);
                }
            }
        }

        /**
         * To free resource event used on documentController
         **/
        private clearRefreshStatus() {
            if (this._parameters && this.originalDocument)
                this._parameters.documentController.unregisterDocumentStatusRefresh(this.originalDocument);
        }

        /**
         * To free resource used by the item
         **/
        public dispose() {
            super.dispose();
            this.clearRefreshStatus();
            if (this._parameters) {
                this._parameters.documentController.off("documentstatusrefreshed", this.documentRefreshHandler, this);
                this._parameters.documentController.off("documentupdated", this.documentUpdatedHandler, this);
                this._parameters.documentController.off("documentdeleted", this.documentDeletedHandler, this);
                this._parameters.documentController.off("versiondeleted", this.versionDeletedHandler, this);
                this._parameters.documentController.off("versionadded", this.documentVersionAdded, this);
                this._parameters.documentController.off("docprocessedcomplete", this.documentProcessedCompleteHandler, this);
            }
        }

        /**
         * This method is the handler when the status of a document has been updated from documentController
         * @param docUpdated item updated from the api
         **/
        private documentRefreshHandler(docUpdated: ap.models.documents.Document) {
            if (this.originalDocument && docUpdated.Id === this.originalDocument.Id) {
                // this.init(docUpdated, this.parentEntity);
                // Like the docUpdated have not load some needed properties of the original document
                // Then we just call the method copyStandardProperties to copy standard properties of the updated document
                this.originalDocument.copyStandardProperties(docUpdated);
                this.copySource();
            }
        }

        /**
        * Handler method called when the document has been updated
        **/
        private documentUpdatedHandler(docUpdatedEventArgs: ap.controllers.EntityUpdatedEvent<ap.models.documents.Document>) {
            this.refreshDocument(docUpdatedEventArgs);
        }

        private documentProcessedCompleteHandler(docUpdatedEventArgs: ap.controllers.EntityUpdatedEvent<ap.models.documents.Document>) {
            this.refreshDocument(docUpdatedEventArgs);
        }

        /**
        * Handler method called when the document has been deleted
        **/
        private documentDeletedHandler(docUpdatedEventArgs: ap.controllers.EntityUpdatedEvent<ap.models.documents.Document>) {
            this.refreshDocument(docUpdatedEventArgs);
        }

        /**
        * Handler method called when a document's version has been deleted
        **/
        private versionDeletedHandler(docUpdatedEventArgs: ap.controllers.EntityUpdatedEvent<ap.models.documents.Document>) {
            this.refreshDocument(docUpdatedEventArgs);
        }

        /**
       * Handler method called when version added to the document
       **/
        private documentVersionAdded(versionAddedResult: KeyValue<ap.models.documents.Document, ap.models.documents.Version>) {
            if (versionAddedResult && versionAddedResult.key && versionAddedResult.key !== null) {
                let updateddocument = versionAddedResult.key;
                if (this.originalDocument && updateddocument.Id === this.originalDocument.Id) {
                    this.init(updateddocument, this.parentEntity);
                }
            }
        }

        /**
        * This method is used to update this vm from a docUpdatedEvent
        * @param docUpdatedEventArgs DocumentUpdatedEvent The object containing the updated document
        */
        private refreshDocument(docUpdatedEventArgs: ap.controllers.EntityUpdatedEvent<ap.models.documents.Document>) {
            if (docUpdatedEventArgs && docUpdatedEventArgs.entity && docUpdatedEventArgs.entity !== null) {
                if (docUpdatedEventArgs.entity.Id === this.originalDocument.Id) {
                    this.init(docUpdatedEventArgs.entity, this.parentEntity);
                }
            }
        }

        constructor(utility: ap.utility.UtilityHelper, q: angular.IQService, parentListVm?: ap.viewmodels.BaseListEntityViewModel, parameters?: ItemConstructorParameter) {
            super(utility, parentListVm, parameters ? parameters.itemIndex : null);

            if (parameters && parameters instanceof ap.viewmodels.documents.DocumentItemParameter) {
                this._parameters = <ap.viewmodels.documents.DocumentItemParameter>parameters;
                this._parameters.documentController.on("documentstatusrefreshed", this.documentRefreshHandler, this);
                this._parameters.documentController.on("documentupdated", this.documentUpdatedHandler, this);
                this._parameters.documentController.on("documentdeleted", this.documentDeletedHandler, this);
                this._parameters.documentController.on("versiondeleted", this.versionDeletedHandler, this);
                this._parameters.documentController.on("versionadded", this.documentVersionAdded, this);
                this._parameters.documentController.on("docprocessedcomplete", this.documentProcessedCompleteHandler, this);
            }
            else
                this._parameters = null;

            this._listener.addEventsName(["downloadclicked", "previewclicked", "documentdropped", "droppedintofolder", "reportclicked", "viewnextdocumentclicked", "viewprevdocumentclicked"]);
        }

        private _parameters: ap.viewmodels.documents.DocumentItemParameter;
        private _name: string;
        private _date: Date;
        private _notesCount: number = -1;
        private _author: string;
        private _uploadedByName: string;
        private _uploadDate: Date;
        private _isArchived: boolean;
        private _isDeleted: boolean;
        private _versionCount: number = -1;
        private _isOpened: boolean = false;
        private _documentActionsViewModel: DocumentActionsViewModel = null;
        private _isShowingMetaData: boolean = false;
        private _references: string = null;
        private _comments: string = null;
        private _recipients: ap.models.reports.ReportRecipients[] = null;
        private _rotationClass: string;
        private _displayOrder: number = 0;
        private _isMoved: boolean = false;
        private _moveUpAvailable: boolean = false;
        private _moveDownAvailable: boolean = false;
        private _isMeetingReport: boolean = false;
    }
}