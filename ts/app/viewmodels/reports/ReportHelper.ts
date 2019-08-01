module ap.viewmodels.reports {
    import NoteType = ap.models.notes.NoteType;

    export class ReportHelper implements IDispose, ap.utility.IListener {
        /**
         * Regarding the current meeting selected, it returns the access rigth to know if we can generated report for notes
         **/
        public get noteReportAccessRight() {
            return this._noteReportAccessRight;
        }

        /**
         * This method will load the default list ids of the current of specified meeting to generate the report. IF meeting is specified, the report will be generated for the meeting
         * @param meeting THis is the meeting for which the report must be generated. This value can be null (means report at project level)
         */
        public printAllNoteReport(meeting: ap.models.meetings.Meeting = null): angular.IPromise<ap.viewmodels.reports.ReportGeneratorResponse> {
            if (meeting === null)
                meeting = this._controllersManager.mainController.currentMeeting;
            let defer: angular.IDeferred<ap.viewmodels.reports.ReportGeneratorResponse> = this.$q.defer();
            let listVm = new ap.viewmodels.notes.UserCommentPagedListViewModel(this.$scope, this.$utility, this.api, this.$q, this._controllersManager, this.$servicesManager.reportService, null);
            if (!listVm.containsParam("projectid")) {
                listVm.addCustomParam("projectid", this._controllersManager.mainController.currentProject().Id);
            }

            let notetypes: string = NoteType[NoteType.Message] + "," + NoteType[NoteType.MeetingPointNote] + "," + NoteType[NoteType.Note] + "," + NoteType[NoteType.Task];

            listVm.addCustomParam("notetypes", notetypes);
            if (meeting && !listVm.containsParam("meetingid"))
                listVm.addCustomParam("meetingid", meeting.Id);
            listVm.addCustomParam("IsNoneGroupLast", "true");
            listVm.addCustomParam("groupby", "Date");
            listVm.addCustomParam("datepattern", new Date().getLocalDatePattern());

            listVm.loadIds().then(() => {
                this.printNoteReport(listVm, meeting).then((result) => {
                    defer.resolve(result);
                }, (err) => {
                    defer.reject(err);
                });
            }, (err) => {
                defer.reject(err);
            });
            return defer.promise;
        }

        /**
        * This method use for generate report
        * @param requestType - use for know which action is requested
        **/
        private printDocumentReport(requestType: string) {
            this.$servicesManager.reportService.generateSendDocumentReport(this._documentReportGeneratorViewModel.documentReportParams, requestType === "preview", requestType === "send").then((response) => {
                switch (requestType) {
                    case "preview":
                        this.$utility.openPopup(response.data.PreviewUri);
                        break;
                    case "send":
                        this._controllersManager.mainController.showToast("app.report.document_report_send_msg", null, null, [this._documentReportGeneratorViewModel.documentReportParams.reportTitle]);
                        break;
                    case "save":
                        let navigateParams: ap.controllers.IToastNavigateParams = {
                            isNavigate: true,
                            navigateKey: "your documents",
                            navigateTo: this._controllersManager.mainController.currentMeeting ? ap.controllers.MainFlow.MeetingDocuments : ap.controllers.MainFlow.Documents,
                            isCustomNavigate: false
                        };
                        this._controllersManager.mainController.showToast("app.report.report_save_msg", null, null, null, navigateParams, true);
                        break;
                }
            });
        }

        /**
         * This method is to start the generation of documents report by displaying the popup to the user
         * @param listVm: list of documents
         */
        public showPrintDocumentReportGenerator(listVm: ap.viewmodels.documents.DocumentListViewModel): angular.IPromise<ap.viewmodels.reports.ReportGeneratorResponse> {
            this._listDocuments = listVm;
            let selectedItems = <ap.viewmodels.documents.DocumentItemViewModel[]>this._listDocuments.listVm.getCheckedItems();

            this._documentReportGeneratorViewModel = new ap.viewmodels.reports.DocumentReportGeneratorViewModel(this.$scope, this.$utility, this.$q, this.$mdDialog, this.$timeout, this.api, this._controllersManager.reportController, this._controllersManager.mainController, this._controllersManager.projectController, this.$servicesManager.contactService, this._listDocuments);
            this._documentReportGeneratorViewModel.on("documentreportrequested", this.printDocumentReport, this);
            return this.openGenerateReportPopup(true);
        }

        /**
         * This method is to start the generation of notes report by displaying the popup to the user
         * @param allCommentIds: to know all ids of the notes to print
         * @param selectedCommentIds: to know selected notes to let the user to choose if he wants to print all or only checked notes.
         */
        public printNoteReport(listUserComments: ap.viewmodels.notes.UserCommentPagedListViewModel, meeting: ap.models.meetings.Meeting = null): angular.IPromise<ap.viewmodels.reports.ReportGeneratorResponse> {
            this._listUserComments = listUserComments;
            if (meeting === null)
                meeting = this._controllersManager.mainController.currentMeeting;
            let defer: ng.IDeferred<ap.viewmodels.reports.ReportGeneratorResponse> = this.$q.defer();
            let selectedItems = listUserComments.getCheckedItems();

            let selectedCommentIds: string[] = [];
            if (selectedItems.length > 0)
                selectedItems.forEach(item => { selectedCommentIds.push((<ap.viewmodels.notes.NoteBaseItemViewModel>item).originalId); });
            else if (listUserComments.selectedViewModel !== null)
                selectedCommentIds.push(listUserComments.selectedViewModel.originalEntity.Id);

            let allCommentIds = listUserComments.ids;
            let checkedCount = selectedCommentIds.length;
            this.disposeReportGeneratorViewModel();
            let isNoPointSelected: boolean = checkedCount === 0;

            this._reportGeneratorViewModel = new ap.viewmodels.reports.ReportGeneratorViewModel(this.$scope, this.$utility, this.$q, this.$mdDialog, this.$timeout, this.api,
                this._controllersManager.reportController, this._controllersManager.mainController, this._controllersManager.meetingController, this._controllersManager.projectController, this.$servicesManager, selectedCommentIds, allCommentIds, this._noteReportAccessRight,
                checkedCount === 0 ? ap.viewmodels.reports.ReportPointToPrintType.All : ap.viewmodels.reports.ReportPointToPrintType.Selected, isNoPointSelected, meeting);

            // registration to some download requested in the popup
            this._reportGeneratorViewModel.on("previewrequested", (vm: ap.viewmodels.reports.ReportGeneratorViewModel) => {
                this.previewReportRequested(vm, listUserComments);
            }, this);
            this._reportGeneratorViewModel.on("downloadexcelrequested", (vm: ap.viewmodels.reports.ReportGeneratorViewModel) => {
                this.downloadExcelReportRequest(vm, listUserComments);
            }, this);
            this._reportGeneratorViewModel.on("downloadoriginalplansrequested", (vm: ap.viewmodels.reports.ReportGeneratorViewModel) => {
                this.downloadOriginalPlansRequest(vm, listUserComments);
            }, this);
            this._reportGeneratorViewModel.on("savesystemtemplatepopupopened", this.openSystemSaveTemplatePopup, this);
            this._reportGeneratorViewModel.on("savecustomtemplatepopupopened", this.openCustomSaveTemplatePopup, this);
            this._reportGeneratorViewModel.on("savetemplatepopupclosed", this.closeSaveTemplatePopup, this);

            this._controllersManager.mainController.showBusy();

            return this.openGenerateReportPopup();
        }

        /**
        * Method use to close the generate report popup and open the save system template popup
        **/
        private openSystemSaveTemplatePopup() {
            this.$mdDialog.hide(ap.viewmodels.reports.ReportGeneratorResponse.OpenSystemSaveTemplate);
        }

        /**
       * Method use to close the generate report popup and open the save custom template popup
       **/
        private openCustomSaveTemplatePopup() {
            this.$mdDialog.hide(ap.viewmodels.reports.ReportGeneratorResponse.OpenCustomSaveTemplate);
        }

        /**
        * Method use to close the save template popup and open the generate report popup
        **/
        private closeSaveTemplatePopup() {
            this.$mdDialog.hide(ap.viewmodels.reports.ReportGeneratorResponse.CloseSaveTemplate);
        }

        /**
        * Use to open the generate report popup
        **/
        public openGenerateReportPopup(isDocumentReport: boolean = false): angular.IPromise<ap.viewmodels.reports.ReportGeneratorResponse> {
            if (!this._deferPrintPopup)
                this._deferPrintPopup = this.$q.defer<ap.viewmodels.reports.ReportGeneratorResponse>();
            let dialogNameLayout = isDocumentReport ? "DocumentReportDialog" : "PointReportDialog";

            let reportController = ($scope: angular.IScope) => {
                $scope["vm"] = isDocumentReport ? this._documentReportGeneratorViewModel : this._reportGeneratorViewModel;
                $scope["logoOptionChanged"] = function (option, index) {
                    if (option === "Uploaded") {
                        let inputs = window.document.getElementsByName("fileInput" + index);
                        if (inputs)
                            (<any>inputs[0]).click();
                    }
                };
            };
            reportController.$inject = ["$scope"];
            this.$mdDialog.show({
                clickOutsideToClose: false,
                templateUrl: "me/PartialView?module=Report&name=" + dialogNameLayout,
                bindToController: true,
                fullscreen: true,
                controller: reportController,
                onComplete: () => {
                    this._controllersManager.mainController.hideBusy();
                }
            }).then((reportGeneratorResponse: ap.viewmodels.reports.ReportGeneratorResponse) => {
                if (isDocumentReport) {
                    this._deferPrintPopup.resolve(reportGeneratorResponse);
                    this._deferPrintPopup = null;
                } else if (reportGeneratorResponse === ap.viewmodels.reports.ReportGeneratorResponse.OpenSystemSaveTemplate) {
                    this.openSaveTemplatePopup("SaveSystemReportTemplate");
                } else if (reportGeneratorResponse === ap.viewmodels.reports.ReportGeneratorResponse.OpenCustomSaveTemplate) {
                    this.openSaveTemplatePopup("SaveCustomReportTemplate");
                } else {
                    this._listUserComments.printReport(this._reportGeneratorViewModel, reportGeneratorResponse).then((result: ap.viewmodels.reports.ReportGeneratorResponse) => {
                        if (result !== null && result !== undefined && result !== ap.viewmodels.reports.ReportGeneratorResponse.Preview) {
                            this.disposeReportGeneratorViewModel();
                            this._deferPrintPopup.resolve(result);
                            this._deferPrintPopup = null;
                        }
                    }, (error) => {
                        this.disposeReportGeneratorViewModel();
                        this._deferPrintPopup.reject(error);
                        this._deferPrintPopup = null;
                    });
                }
            }, (error) => {
                this.disposeReportGeneratorViewModel();
                this._deferPrintPopup.reject(error);
                this._deferPrintPopup = null;
            });
            return this._deferPrintPopup.promise;
        }

        /**
        * Use to open the save template popup
        **/
        public openSaveTemplatePopup(file: string) {
            let reportController = ($scope: angular.IScope) => {
                $scope["reportGeneratorVm"] = this._reportGeneratorViewModel;
            };
            reportController.$inject = ["$scope"];
            this.$mdDialog.show({
                clickOutsideToClose: false,
                preserveScope: true,
                templateUrl: "me/PartialView?module=Report&name=" + file,
                fullscreen: true,
                controller: reportController
            }).then((reportGeneratorResponse: ap.viewmodels.reports.ReportGeneratorResponse) => {
                if (reportGeneratorResponse === ap.viewmodels.reports.ReportGeneratorResponse.CloseSaveTemplate) {
                    this.openGenerateReportPopup();
                }
            });
        }

        /**
        * This method is called when there is the 'previewrequested' event fired from the ReportGeneratorViewModel
        * @param vm is the sender ReportGeneratorViewModel
        **/
        private previewReportRequested(vm: ap.viewmodels.reports.ReportGeneratorViewModel, listUserComments: ap.viewmodels.notes.UserCommentPagedListViewModel) {
            listUserComments.printReport(vm, ap.viewmodels.reports.ReportGeneratorResponse.Preview).then((result: ap.viewmodels.reports.ReportGeneratorResponse) => {
                if (result !== ap.viewmodels.reports.ReportGeneratorResponse.Preview) {
                    vm.hide();
                    this._controllersManager.mainController.closeMultiActionsMode();
                    this.disposeReportGeneratorViewModel();
                }
            });
        }

        /**
        * This method is called when there is the 'downloadexcelrequested' event fired from the ReportGeneratorViewModel
        * @param vm is the sender ReportGeneratorViewModel
        **/
        private downloadExcelReportRequest(vm: ap.viewmodels.reports.ReportGeneratorViewModel, listUserComments: ap.viewmodels.notes.UserCommentPagedListViewModel) {
            this._controllersManager.reportController.exportExcel(listUserComments.createPointReportParam(vm));
        }
        /**
       * This method is called when there is the 'downloadoriginalplansrequested' event fired from the ReportGeneratorViewModel
       * @param vm is the sender ReportGeneratorViewModel
       **/
        private downloadOriginalPlansRequest(vm: ap.viewmodels.reports.ReportGeneratorViewModel, listUserComments: ap.viewmodels.notes.UserCommentPagedListViewModel) {
            this._controllersManager.reportController.exportMeetingOriginalPlans(listUserComments.createPointReportParam(vm));
        }

        /**
         * This method will check the access rigth to make report for points
         */
        private getNoteReportAccessRight() {
            let oldVal = this._noteReportAccessRight;
            if (this._controllersManager.mainController.currentMeeting !== null && this._controllersManager.mainController.currentMeeting !== undefined) {
                this._controllersManager.accessRightController.getMeetingAccessRight(this._controllersManager.mainController.currentMeeting.Id).then((meetingAccessRight: ap.models.accessRights.MeetingAccessRight) => {
                    this._noteReportAccessRight = new ap.models.accessRights.PointReportAccessRight(this.$utility, meetingAccessRight);
                    this.raisePropertyChanged("noteReportAccessRight", oldVal, this._noteReportAccessRight);
                });
            }
            else {
                this._noteReportAccessRight = new ap.models.accessRights.PointReportAccessRight(this.$utility);
                this.raisePropertyChanged("noteReportAccessRight", oldVal, this._noteReportAccessRight);
            }
        }

        /**
         * Raises a propertychanged event with the given parameters
         * @param propertyName a name of the changed property
         * @param oldValue an old value of the changed property
         * @param caller an object which raises the event
         */
        protected raisePropertyChanged(propertyName: string, oldValue: any, caller: any): void {
            let args: ap.viewmodels.base.PropertyChangedEventArgs = new ap.viewmodels.base.PropertyChangedEventArgs(propertyName, oldValue, caller);
            this._listener.raise("propertychanged", args);
        }

        /**
         * Dispose data
         */
        private disposeReportGeneratorViewModel() {
            if (this._reportGeneratorViewModel)
                this._reportGeneratorViewModel.dispose();
            if (this._documentReportGeneratorViewModel)
                this._documentReportGeneratorViewModel.dispose();
        }

        public dispose() {
            this._listener.clear();
            this.disposeReportGeneratorViewModel();
        }

        // Public Method 
        on(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.on(eventName, callback, caller);
        }
        off(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.off(eventName, callback, caller);
        }

        constructor(private $scope: angular.IScope, private $q: angular.IQService, private $timeout: angular.ITimeoutService, private $mdDialog: angular.material.IDialogService,
            private $utility: ap.utility.UtilityHelper, private api: ap.services.apiHelper.Api, private $servicesManager: ap.services.ServicesManager, private _controllersManager: ap.controllers.ControllersManager) {
            this._listener = this.$utility.EventTool.implementsListener(["propertychanged", "savetemplatepopupclosed"]);
            this.getNoteReportAccessRight();
        }

        private _deferPrintPopup: angular.IDeferred<ap.viewmodels.reports.ReportGeneratorResponse>;
        private _listener: ap.utility.IListenerBuilder;
        private _noteReportAccessRight: ap.models.accessRights.PointReportAccessRight;
        private _reportGeneratorViewModel: ap.viewmodels.reports.ReportGeneratorViewModel;
        private _documentReportGeneratorViewModel: ap.viewmodels.reports.DocumentReportGeneratorViewModel;
        private _listUserComments: ap.viewmodels.notes.UserCommentPagedListViewModel;
        private _listDocuments: ap.viewmodels.documents.DocumentListViewModel;
    }
}