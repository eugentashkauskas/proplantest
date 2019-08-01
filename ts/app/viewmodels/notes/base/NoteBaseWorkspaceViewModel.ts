namespace ap.viewmodels.notes {

    export abstract class NoteBaseWorkspaceViewModel implements IDispose {

        abstract dispose(): void;

        public showAddEditDialog(editNoteBaseViewModel: ap.viewmodels.notes.EditNoteBaseViewModel, dialogOpening?: boolean, detailVm?: ap.viewmodels.notes.NoteDetailBaseViewModel, fieldNameFocus?: string, needToKeepAddEditVm: boolean = false, document?: ap.models.documents.Document, isForNoteModule?: boolean) {
            let editNoteBaseVm: ap.viewmodels.notes.EditNoteBaseViewModel = editNoteBaseViewModel;
            let accessRights: ap.models.accessRights.NoteBaseAccessRight;
            if (dialogOpening === true) return;

            dialogOpening = true;

            // send event to Segment.IO only when a note is being added to a document
            if (!needToKeepAddEditVm && (!fieldNameFocus || fieldNameFocus !== "inCharge")) {
                let eventName: string = editNoteBaseViewModel instanceof ap.viewmodels.notes.AddEditNoteViewModel ? "cli-button-add point" : "cli-button-add form";
                let paramValue: string = "";

                if (!detailVm) {
                    // a note is being created
                    if (document) {
                        paramValue = "document_document_preview";
                    } else {
                        paramValue = this.$controllersManager.mainController.currentMeeting === null ? "projects" : "lists";
                    }
                } else {
                    eventName = editNoteBaseViewModel instanceof ap.viewmodels.notes.AddEditNoteViewModel ? "cli-action-udpate point" : "cli-action-udpate form";
                    paramValue = this.$controllersManager.mainController.currentMeeting === null ? "projects" : "lists";
                }
                this.$servicesManager.toolService.sendEvent(eventName, new Dictionary([new KeyValue(eventName + "-screenname", paramValue)]));
            }

            let editNoteController = ($scope: angular.IScope, $timeout: angular.ITimeoutService) => {
                if (editNoteBaseViewModel instanceof ap.viewmodels.notes.AddEditNoteViewModel) {
                    accessRights = (<ap.viewmodels.notes.NoteDetailViewModel>editNoteBaseVm.noteDetailBaseViewModel).noteAccessRight;
                } else {
                    accessRights = (<ap.viewmodels.forms.FormDetailViewModel>editNoteBaseVm.noteDetailBaseViewModel).formAccessRight;
                }
                $scope["addEditNoteVm"] = editNoteBaseVm;
                $scope["accessRights"] = accessRights;
                $scope["fieldNameFocus"] = fieldNameFocus;
            };
            editNoteBaseViewModel.isForDetailPane = false;
            editNoteController.$inject = ["$scope", "$timeout"];
            this.$mdDialog.show({
                clickOutsideToClose: false,
                preserveScope: false,
                escapeToClose: false,
                templateUrl: "me/Note?name=AddEditNoteDialog",
                fullscreen: true,
                controller: editNoteController,
                onComplete: (scope: angular.IScope, element) => {
                    element[0].addEventListener("keydown", (e) => {
                        if (e.keyCode === KEY_CODE.ESC && !scope["addEditNoteVm"].datePickerisOpened) { // if datepicker isn't opened close dialog
                            this.$mdDialog.hide();
                        }
                    });
                }
            }).then((addEditResponse: ap.viewmodels.notes.AddEditResponse) => {
                if (addEditResponse === ap.viewmodels.notes.AddEditResponse.CreateRoom) {
                    this.openRoomsConfig(editNoteBaseVm);
                } else if (addEditResponse === ap.viewmodels.notes.AddEditResponse.CreateCategory) {
                    this.openCategoriesConfig(editNoteBaseVm);
                } else if (addEditResponse === ap.viewmodels.notes.AddEditResponse.CreateMeeting) {
                    this._noteBaseListVm.openCreateNewMeetingDialog().then((idToSelect) => {
                        editNoteBaseVm.meetingSelector.selectMeetingById(idToSelect).finally(() => {
                            this.showAddEditDialog(editNoteBaseViewModel, null, null, "List", true);
                        });
                    }, () => {
                        let oldMeeting = editNoteBaseVm.noteDetailBaseViewModel.meeting;
                        if (!!oldMeeting) {
                            editNoteBaseVm.meetingSelector.selectMeetingById(oldMeeting.Id);
                            this.showAddEditDialog(editNoteBaseViewModel, null, null, "List", true);
                        } else {
                            editNoteBaseVm.setDefaultSelectMeeting().finally(() => {
                                this.showAddEditDialog(editNoteBaseViewModel, null, null, "List", true);
                            });
                        }
                    });
                } else {
                    editNoteBaseViewModel.init(this._noteDetailBaseVm);
                    editNoteBaseViewModel.isForDetailPane = true;
                }
                dialogOpening = false;
            }, () => {
                if (detailVm && detailVm.isEditMode) {
                    detailVm.cancel();
                    detailVm.isEditMode = false;
                }
                dialogOpening = false;
                editNoteBaseViewModel.isForDetailPane = true;
                editNoteBaseViewModel.init(this._noteDetailBaseVm);
            });
        }

        /**
         * This method should show a modal dialog that will allow a user to edit categories of the project
         */
        protected openCategoriesConfig(editNoteBaseViewModel: ap.viewmodels.notes.EditNoteBaseViewModel) {
            let issueTypeConfigVm = new ap.viewmodels.projects.ProjectIssueTypeConfigDialogViewModel(this.$scope, this.$utility, this.$q, this.$api, this.$controllersManager, this.$servicesManager, this.$mdDialog, this.$timeout);

            let configureController = ($scope: angular.IScope, $mdDialog: angular.material.IDialogService) => {
                $scope["vm"] = issueTypeConfigVm;
            };
            configureController.$inject = ["$scope", "$mdDialog"];
            this.$mdDialog.show({
                clickOutsideToClose: true,
                preserveScope: true,
                templateUrl: "me/Project?name=ProjectCategoriesDialog",
                fullscreen: true,
                controller: configureController
            }).then(() => {
                editNoteBaseViewModel.issueTypeSelectorViewModel.searchedText = null;
                if (issueTypeConfigVm.selectedIssueType) {
                    let issueTypeId = issueTypeConfigVm.selectedIssueType.originalEntity.Id;
                    issueTypeConfigVm.dispose();
                    editNoteBaseViewModel.issueTypeSelectorViewModel.selectIssueTypeById(issueTypeId).then(() => {
                        if (!editNoteBaseViewModel.isForDetailPane)
                            this.showAddEditDialog(editNoteBaseViewModel, null, null, "issueType", true);
                    }, () => {
                        if (!editNoteBaseViewModel.isForDetailPane)
                            this.showAddEditDialog(editNoteBaseViewModel, null, null, "issueType", true);
                    });
                } else {
                    issueTypeConfigVm.dispose();
                    let oldIssueType = editNoteBaseViewModel.noteDetailBaseViewModel.noteBase.IssueType;
                    editNoteBaseViewModel.issueTypeSelectorViewModel.selectIssueTypeById(oldIssueType ? oldIssueType.Id : null);
                    if (!editNoteBaseViewModel.isForDetailPane)
                        this.showAddEditDialog(editNoteBaseViewModel, null, null, "issueType", true);
                }
            }, () => {
                issueTypeConfigVm.dispose();
                let oldIssueType = editNoteBaseViewModel.noteDetailBaseViewModel.noteBase.IssueType;
                editNoteBaseViewModel.issueTypeSelectorViewModel.selectIssueTypeById(oldIssueType ? oldIssueType.Id : null).finally(() => {
                    if (!editNoteBaseViewModel.isForDetailPane)
                        this.showAddEditDialog(editNoteBaseViewModel, null, null, "issueType", true);
                });
            });
        }

        protected openRoomsConfig(addEditNoteViewModel: ap.viewmodels.notes.EditNoteBaseViewModel) {

        }

        /**
         * Constructor of NoteBaseWorkspaceViewModel
         * @param $scope
         * @param $mdSidenav
         * @param $utility
         * @param _api
         * @param $q
         * @param $mdDialog
         * @param $timeout
         * @param $location
         * @param $anchorScroll
         * @param $interval
         * @param $controllersManager
         * @param $servicesManager
         * @param _isForNoteModule
         */
        constructor(protected $scope: ng.IScope, protected $mdSidenav: angular.material.ISidenavService, protected $utility: ap.utility.UtilityHelper, protected $api: ap.services.apiHelper.Api, protected $q: angular.IQService, protected $mdDialog: angular.material.IDialogService,
            protected $timeout: angular.ITimeoutService, protected $location: angular.ILocationService, protected $anchorScroll: angular.IAnchorScrollService, protected $interval: angular.IIntervalService, protected $controllersManager: ap.controllers.ControllersManager,
            protected $servicesManager: ap.services.ServicesManager, protected $mdPanel?: any, protected _isForNoteModule: boolean = true) {
        }

        protected _noteBaseListVm: NoteBaseListViewModel;
        protected _noteDetailBaseVm: NoteDetailBaseViewModel;
    }
}