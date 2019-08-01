module ap.viewmodels.documents {

    export interface IDocumentViewStateParams extends angular.ui.IStateParamsService {
        documentId: string;
        versionId: string;
        meetingId: string;
        isReport: string;
        comesFromPointsList: string;
        folderId: string;
    }

    export class DocumentViewWorkspaceViewModel implements IDispose {

        public get documentUtilsVm() {
            return this._documentUtilsVm;
        }

        public get pictureViewModel() {
            return this._pictureViewModel;
        }

        public get documentViewModel() {
            return this._documentViewModel;
        }

        public get linkedNoteDocumentPictureViewModel() {
            return this._linkedNoteDocumentsListVm && this._linkedNoteDocumentsListVm.selectedViewModel ?
                (<ap.viewmodels.notes.NoteDocumentViewModel>this._linkedNoteDocumentsListVm.selectedViewModel).pictureViewModel : null;
        }

        public get isShowingOriginalPictureViewer() {
            return this._documentViewModel && this._documentViewModel.originalEntity ?
                !this._documentViewModel.noteWorkspaceVm.noteDetailVm.noteDocumentList.isDisplayingPictureViewer : false;
        }

        public get isFirstDocument() {
            return this._isFirstDocument;
        }

        public get isLastDocument() {
            return this._isLastDocument;
        }

        dispose() {
            if (this._documentUtilsVm) {
                if (this._documentUtilsVm.document)
                    this._documentUtilsVm.document.dispose();
                this._documentUtilsVm.dispose();
            }
            if (this._documentViewModel) {
                this._documentViewModel.dispose();
            }
            if (this._screenInfo) {
                this._screenInfo.dispose();
            }
            if (this._pictureViewModel) {
                this._pictureViewModel.dispose();
            }
            this.$controllersManager.uiStateController.off("mainflowstatechanged", this.currentProjectChangedHandler, this);
            this.$controllersManager.documentController.off("editdocumentrequested", this.handleEditDocumentRequest, this);
            this.$controllersManager.documentController.off("documentupdated", this.documentUpdatedHandler, this);
            this.$controllersManager.documentController.off("addversionrequested", this.showAddVersionDialog, this);
        }

        /**
         * This method will show popup with user send report
         * @param document - viewModel of report document that will be send to recepients
         */
        reportDocumentHandler(document: ap.viewmodels.documents.DocumentItemViewModel) {
            let documentsReportController = ($scope: angular.IScope) => {
                $scope["vm"] = new ap.viewmodels.reports.ReportEmailViewModel($scope, this.$utility, this._api, this.$q, this.$mdDialog, document, this.$controllersManager, this.$servicesManager);
            };
            documentsReportController.$inject = ["$scope"];
            this.$mdDialog.show({
                clickOutsideToClose: false,
                templateUrl: "me/PartialView?module=Report&name=SendReportByEmail",
                fullscreen: true,
                controller: documentsReportController
            });

            // send event to Segment.IO
            this.$servicesManager.toolService.sendEvent("cli-action-share report", new Dictionary([new KeyValue("cli-action-share report-screenname", "documents")]));
        }

        /**
        * Subscribe to documents events to trigger to good action
        */
        private registerDocumentEvent() {
            this._docItemVm.on("downloadclicked", this.downloadDocument, this);
            this._docItemVm.on("reportclicked", this.reportDocumentHandler, this);
        }

        /**
         * Initialize picture viewer
         * @param project Project model
         */
        private loadDocument(documentId: string, isFirstInit: boolean = false, isReport: boolean = false, ): angular.IPromise<ap.models.documents.Document> {
            let isInMeeting: boolean = !!this.$controllersManager.mainController.currentMeeting;
            if (!!this.$controllersManager.mainController.currentMeeting && this._comesFromPointsList) {
                isInMeeting = false;
            }

            if (isReport && isInMeeting && !isFirstInit) {
                this.$controllersManager.documentController.getMeetingReportStatus(this.$controllersManager.mainController.currentMeeting.Id).then((report: ap.models.meetings.MeetingReport) => {
                    return this.loadFullDocument(report.Id, isInMeeting, isReport);
                });
            } else {
                return this.loadFullDocument(documentId, isInMeeting, isReport);
            }
        }

        private loadFullDocument(documentId: string, isInMeeting: boolean, isReport: boolean): angular.IPromise<ap.models.documents.Document> {
            return this.$controllersManager.documentController.getFullDocumentById(documentId, isInMeeting, false, this._comesFromPointsList, isReport).then((fullDocument: ap.controllers.FullDocumentResponse) => {
                this._currentMeetingDocId = fullDocument.meetingDocumentId;
                if (this._pictureViewModel)
                    this._pictureViewModel.dispose();
                if (!!fullDocument.noteDocument) {
                    this._noteDocument = fullDocument.noteDocument;
                    this._documentViewModel.displayBadges = false;
                    fullDocument.noteDocument.Drawings = fullDocument.noteDocument.Note.getFirstComment().Drawings.filter((drawingsCollection: models.notes.Drawing) => {
                        return drawingsCollection.NoteDocumentId === fullDocument.noteDocument.Id;
                    });

                }
                this._documentViewModel.init(fullDocument.document, fullDocument.noteDocument);
                if (this.$stateParams.versionId) {
                    for (let i = 0; i < fullDocument.document.Versions.length; i++) {
                        if (fullDocument.document.Versions[i].Id === this.$stateParams.versionId) {
                            this._documentViewModel.versionIndex = fullDocument.document.Versions[i].VersionIndex;
                        }
                    }
                }
                if (this._pictureViewModel) {
                    this._pictureViewModel.dispose();
                }
                this._pictureViewModel = new ap.viewmodels.documents.PictureViewModel(this.$utility, this.$controllersManager, this._documentViewModel);
                this._documentUtilsVm.pictureViewModel = this._pictureViewModel;
                let mainFlowParam = <ap.controllers.DocumentViewFlowStateParam>this.$controllersManager.uiStateController.mainFlowStateParam;
                this._pictureViewModel.isEditMode = mainFlowParam.isEditMode;
                this._pictureViewModel.hasEditAccess = mainFlowParam.hasEditAccess || false;
                let docItemParameter = new ap.viewmodels.documents.DocumentItemParameter(0, null, null, null, this.$utility, this.$controllersManager.documentController, this.$controllersManager.mainController, this.$controllersManager.meetingController, !!this.$controllersManager.mainController.currentMeeting);
                if (this._docItemVm) {
                    this._docItemVm.dispose();
                    this._docItemVm = null;
                }
                this._docItemVm = new ap.viewmodels.documents.DocumentItemViewModel(this.$utility, this.$q, null, docItemParameter);
                this._docItemVm.on("viewnextdocumentclicked", this.viewNextDocumentHandler, this);
                this._docItemVm.on("viewprevdocumentclicked", this.viewPrevDocumentHandler, this);

                this.registerDocumentEvent();

                this._documentUtilsVm.comesFromListPointsScreen = this._comesFromPointsList;
                this._docItemVm.init(fullDocument.document, fullDocument.noteDocument);
                this._documentUtilsVm.document = this._docItemVm;
                this._docItemVm.isOpened = true;
                this._docItemVm.isMeetingReport = isReport && isInMeeting;
                this._screenInfo.title = fullDocument.document.Name;
                this._screenInfo.actions = this._documentViewModel.actionsViewModel.actions;
                this.updateDocumentIdsAndOrder(this._noteDocument ? this._noteDocument : this._docItemVm.originalDocument, mainFlowParam.documentIds, this._docItemVm.isMeetingReport);
                return fullDocument.document;
            });
        }

        /**
         * Close picture viewer and open document's previous state
         */
        public closeDocument() {
            let mainFlowStateParam = <ap.controllers.DocumentViewFlowStateParam>this.$controllersManager.uiStateController.mainFlowStateParam;
            this.$controllersManager.uiStateController.changeFlowState(mainFlowStateParam && mainFlowStateParam.previousState ? mainFlowStateParam.previousState : ap.controllers.MainFlow.Projects);
        }

        /**
         * 
         * @param saveDrawingRequestedEvent
         */
        private saveDrawingsRequested(saveDrawingRequestedEvent: ap.viewmodels.documents.SaveDrawingsRequestedEvent) {
            if (this._comesFromPointsList && saveDrawingRequestedEvent.noteDocument.Id === this._noteDocument.Id) {
                this.$controllersManager.noteController.saveDrawings(this._noteDocument.Note, saveDrawingRequestedEvent.noteDocument).then((resNoteDoc: ap.models.notes.NoteDocument) => {
                    saveDrawingRequestedEvent.successCallback(resNoteDoc);
                }, (err) => {
                    saveDrawingRequestedEvent.errorCallback(err);
                });
            }
        }

        /**
         * Initialize picture viewer
         * @param project Project model
         */
        private initView(project: ap.models.projects.Project) {
            this._documentUtilsVm = new ap.viewmodels.documents.DocumentUtilsViewModel(this.$utility, this.$location, this.$q, this.$anchorScroll, this.$interval, this.$scope, this.$mdDialog, this.$controllersManager);
            this._docVmNoteWorkspaceOptions = new ap.viewmodels.documents.DocumentVmNoteWorkspaceOption(this.$scope, this.$mdSidenav, this._api, this.$q, this.$mdDialog, this.$timeout, this.$location, this.$anchorScroll, this.$interval, this.$servicesManager);
            this._documentViewModel = new ap.viewmodels.documents.DocumentViewModel(this.$utility, this.$q, this.$controllersManager, this.$servicesManager, this._docVmNoteWorkspaceOptions);
            this._linkedNoteDocumentsListVm = this._documentViewModel.noteWorkspaceVm.noteDetailVm.noteDocumentList;
            this._documentViewModel.on("savedrawingsrequested", this.saveDrawingsRequested, this);
            let mainFlowStateParam = <ap.controllers.DocumentViewFlowStateParam>this.$controllersManager.uiStateController.mainFlowStateParam;
            let isReport: boolean = false;
            if (this.$stateParams.isReport === "true") {
                isReport = true;
            }
            this.loadDocument(this.$stateParams.documentId, true, isReport).then((document: ap.models.documents.Document) => {
                let stateParams = <ap.controllers.DocumentViewFlowStateParam>this.$controllersManager.uiStateController.mainFlowStateParam;
                if (stateParams && !stateParams.isEditMode) {
                    this._documentUtilsVm.handlePictureViewerActionClick("document.shownotes");
                }
            });
        }

        /**
         * Update documents ids list and the order info of a currently opened document
         * @param currentDocument Current document model
         * @param documentIds List of document ids
         */
        private updateDocumentIdsAndOrder(currentDocument: ap.models.documents.Document | ap.models.notes.NoteDocument, documentIds: string[] = [], isMeetingReport: boolean = false) {
            this._documentListIds = documentIds;

            if (!isMeetingReport) {
                this._currentDocumentIndex = documentIds.indexOf(this._currentMeetingDocId ? this._currentMeetingDocId : currentDocument.Id);
                if (this._currentDocumentIndex < 0) {
                    throw new Error("Document's ID " + currentDocument.Id + " can't be found in the list of documents' ids");
                }
                this._isFirstDocument = this._currentDocumentIndex === 0;

                let isInMeeting: boolean = !!this.$controllersManager.mainController.currentMeeting;
                this._isLastDocument = (this._currentDocumentIndex === documentIds.length - 1 && !(this.$stateParams.isReport === "true") && !isInMeeting) ||
                    (this._currentDocumentIndex === documentIds.length && this.$stateParams.isReport === "true" && isInMeeting);
            } else {
                this._currentDocumentIndex = documentIds.length; // because a meetingReport is not in the ids list and it's always the last
                this._isFirstDocument = documentIds.length === 0; // because it's not in the ids list, if there is no ids then it's the first otherwise it's always the last of the list
                this._isLastDocument = true;
            }
        }

        /**
        * This method is called when the user clicks on the Edit document button.
        **/
        private handleEditDocumentRequest(document: ap.models.documents.Document) {
            this.$controllersManager.mainController.showBusy();

            let editDocController = ($scope: angular.IScope, $timeout: angular.ITimeoutService) => {
                let docViewModel = new ap.viewmodels.documents.DocumentViewModel(this.$utility, this.$q, this.$controllersManager, this.$servicesManager);
                docViewModel.init(document);
                let editDocViewModel = new ap.viewmodels.documents.EditDocumentViewModel(this.$utility, this.$mdDialog, this.$timeout, this.$q, $scope, this.$controllersManager, this.$servicesManager, docViewModel);
                $scope["vm"] = editDocViewModel;
                $scope.$on("$destroy", () => {
                    editDocViewModel.dispose();
                });
            };
            editDocController.$inject = ["$scope", "$timeout"];
            this.$mdDialog.show({
                clickOutsideToClose: false,
                preserveScope: true,
                templateUrl: "me/PartialView?module=Document&name=EditDocumentDialog",
                fullscreen: true,
                controller: editDocController,
                onComplete: () => {
                    this.$controllersManager.mainController.hideBusy();
                }
            });
        }

        /**
         * This method is used to open the dialog to add version for the document
         * @param document Document entity
         */
        private showAddVersionDialog(document: ap.models.documents.Document) {
            let pathToLoadDocument = "Versions.Pages,Pages,Author,UploadedBy.Person,Versions.Author," +
                "Versions.UploadedBy.Person,Recipients,Versions.Recipients,IsReport";
            let pathToloadVersion: string = "";
            this.$controllersManager.mainController.showBusy();

            let editDocController = ($scope: angular.IScope, $timeout: angular.ITimeoutService) => {
                let docViewModel = new ap.viewmodels.documents.DocumentViewModel(this.$utility, this.$q, this.$controllersManager, this.$servicesManager);
                docViewModel.init(document);
                let editDocViewModel = new ap.viewmodels.documents.EditDocumentViewModel(this.$utility, this.$mdDialog, this.$timeout, this.$q, $scope, this.$controllersManager, this.$servicesManager, docViewModel, true, pathToLoadDocument, pathToloadVersion);
                $scope["vm"] = editDocViewModel;
            };
            editDocController.$inject = ["$scope", "$timeout"];
            this.$mdDialog.show({
                clickOutsideToClose: false,
                preserveScope: true,
                templateUrl: "me/PartialView?module=Document&name=EditDocumentDialog",
                fullscreen: true,
                controller: editDocController,
                onComplete: () => {
                    this.$controllersManager.mainController.hideBusy();
                }
            });
        }

        /**
         * Update document viewmodel if document have been updated, or close picture viewer if document was deleted
         * @param event Document updated event object
         */
        private documentUpdatedHandler(event: ap.controllers.EntityUpdatedEvent<ap.models.documents.Document>) {
            if (event.entity.Deleted || event.entity.IsArchived !== this._documentViewModel.document.IsArchived) {
                this.closeDocument();
            }
            this._screenInfo.title = event.entity.Name;
        }

        /**
         * Download document model
         * @param docItemVm Document viewmodel
         */
        private downloadDocument(docItemVm: DocumentItemViewModel) {
            if (docItemVm !== null && docItemVm.originalDocument != null) {
                let plan: ap.models.documents.Document = <ap.models.documents.Document>docItemVm.originalEntity;
                let version: ap.models.documents.Version = <ap.models.documents.Version>this.documentViewModel.currentVersion;
                version.VersionIndex = this.documentViewModel.versionIndex;
                this.$controllersManager.documentController.downloadDocument(plan, version);
            }
        }

        /**
         * Project changed handler
         */
        private currentProjectChangedHandler() {
            if (this.$controllersManager.mainController.currentProject() && this.$controllersManager.mainController.currentMeeting !== undefined) {
                this.initView(this.$controllersManager.mainController.currentProject());
                this.$controllersManager.uiStateController.off("mainflowstatechanged", this.currentProjectChangedHandler, this);
            }
        }

        /**
         * Handler action to load document next to the currently opened one
         */
        private viewNextDocumentHandler() {
            if (this._isLastDocument)
                throw new Error("Can't get next document - current document is already the last in the list");
            let nextDocumentId = this._documentListIds[this._currentDocumentIndex + 1];

            let isReport: boolean = false;
            let isInMeeting: boolean = !!this.$controllersManager.mainController.currentMeeting;
            if ((this.$stateParams.isReport === "true" || nextDocumentId === undefined) && isInMeeting) {
                isReport = true;
            }

            this.loadDocument(nextDocumentId, false, isReport);
        }

        /**
         * Handler action to load document previous to the currently opened one
         */
        private viewPrevDocumentHandler() {
            if (this._isFirstDocument)
                throw new Error("Can't get next document - current document is already the first in the list");
            let prevDocumentId = this._documentListIds[this._currentDocumentIndex - 1];

            this.loadDocument(prevDocumentId, false, false);
        }

        static $inject = ["$scope", "Utility", "Api", "$location", "$q", "$anchorScroll", "$interval", "$mdDialog", "$mdSidenav", "$timeout", "ControllersManager", "ServicesManager", "$stateParams"];
        constructor(private $scope: angular.IScope, private $utility: ap.utility.UtilityHelper, private _api: ap.services.apiHelper.Api, private $location: angular.ILocationService, private $q: angular.IQService, private $anchorScroll: angular.IAnchorScrollService,
            private $interval: angular.IIntervalService, private $mdDialog: angular.material.IDialogService, private $mdSidenav: angular.material.ISidenavService,
            private $timeout: angular.ITimeoutService, private $controllersManager: ap.controllers.ControllersManager, private $servicesManager: ap.services.ServicesManager,
            private $stateParams: IDocumentViewStateParams) {
            this._comesFromPointsList = this.$stateParams.comesFromPointsList === "true";

            this._screenInfo = new ap.misc.ScreenInfo(this.$utility, "document.view", ap.misc.ScreenInfoType.Detail, [], null, null, null, true, false, true);
            this.$controllersManager.mainController.initScreen(this._screenInfo);
            this._noteListScreenFullName = null;
            this._documentListIds = [];
            this._documentsIdsLoaded = false;

            this.$controllersManager.documentController.on("editdocumentrequested", this.handleEditDocumentRequest, this);
            this.$controllersManager.documentController.on("documentupdated", this.documentUpdatedHandler, this);
            this.$controllersManager.documentController.on("addversionrequested", this.showAddVersionDialog, this);
            if (this.$controllersManager.mainController.currentProject() && this.$controllersManager.mainController.currentMeeting !== undefined) {
                this.initView(this.$controllersManager.mainController.currentProject());
            } else {
                this.$controllersManager.uiStateController.on("mainflowstatechanged", this.currentProjectChangedHandler, this);
            }
            this.$scope.$on("$destroy", () => {
                this.dispose();
            });
        }
        private _comesFromPointsList: boolean;
        private _documentUtilsVm: ap.viewmodels.documents.DocumentUtilsViewModel;
        private _pictureViewModel: PictureViewModel;
        private _documentViewModel: DocumentViewModel;
        private _docItemVm: DocumentItemViewModel;
        private _linkedNoteDocumentsListVm: ap.viewmodels.notes.NoteDocumentListViewModel;
        private _screenInfo: ap.misc.ScreenInfo;
        private _noteDocument: ap.models.notes.NoteDocument = null;
        private _docVmNoteWorkspaceOptions: ap.viewmodels.documents.DocumentVmNoteWorkspaceOption;
        private _noteListScreenFullName: string = null;
        private _linkedNoteDocumentPictureViewModel: ap.viewmodels.documents.PictureViewModel;

        private _isFirstDocument: boolean = false;
        private _isLastDocument: boolean = false;
        private _currentDocumentIndex: number;

        private _documentListIds: string[];
        private _documentsIdsLoaded: boolean;
        private _currentMeetingDocId: string;

        private _meetingReportId: string;
    }
}