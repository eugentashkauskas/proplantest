module ap.viewmodels.reports {
    import reportmodels = ap.models.reports;

    export class MeetingReportConfigViewModel extends ReportConfigViewModel {

        public get meetingReportConfig(): ap.models.reports.MeetingReportConfig {
            return <ap.models.reports.MeetingReportConfig>this.reportconfig;
        }

        /**
        * Get the way to know if report header is selected
        **/
        public get hasReportHeader(): boolean {
            return this._hasReportHeader;
        }

        /**
        * Set the way to know if report header is selected
        **/
        public set hasReportHeader(s: boolean) {
            this._hasReportHeader = s;
        }

        /**
        * Get the way to know if report footer is selected
        **/
        public get hasReportFooter(): boolean {
            return this._hasReportFooter;
        }

        /**
        * Set the way to know if report footer is selected
        **/
        public set hasReportFooter(s: boolean) {
            this._hasReportFooter = s;
        }

        /**
        * Get the way to know if attendees is selected
        **/
        public get hasAttendees(): boolean {
            return this._hasAttendees;
        }

        /**
        * Set the way to know if attendees is selected
        **/
        public set hasAttendees(s: boolean) {
            this._hasAttendees = s;
            if (this._participantColumns) {
                this._participantColumns.dragOptions.isEnabled = this._hasAttendees;
            }
            if (!!this._hasAttendees && !!this._participantColumns) {
                for (let i = 0; i < this._participantColumns.columnsAvailable.length - 1; i++) {
                    if (this._participantColumns.columnsAvailable[i].propertyName === "DisplayName" && this._participantColumns.columnsAvailable[i].isChecked === false) {
                        this._participantColumns.columnsAvailable[i].isChecked = true;
                        break;
                    }
                }
            }
        }

        /**
        * Property to access participant columns
        **/
        public get participantColumns(): ColumnsViewModel {
            return this._participantColumns;
        }

        public set participantColumns(value: ColumnsViewModel) {
            this._participantColumns = value;
            if (this._hasAttendees === false)
                this._participantColumns.dragOptions.isEnabled = false;
        }

        /**
        * Get the way to know if transferred is selected
        **/
        public get hasTransferred(): boolean {
            return this._hasTransferred;
        }

        /**
        * Set the way to know if transferred is selected
        **/
        public set hasTransferred(s: boolean) {
            this._hasTransferred = s;
        }

        /*
       * To check if the UI can show sort option section
       *  can show if: user has license or the option to print list ot detail enabled
       */
        public get isSortOptionsEnabled(): boolean {
            if (this.reportconfig === null) return false;

            return this.accessRight.hasSortOptions &&
                (this.reportconfig.NoteList !== ap.models.reports.ReportNoteList.None || this.reportconfig.NotesDetail !== ap.models.reports.ReportNoteDetail.None);
        }

        /**
        * To init VM for participant columns
        **/
        private initParticipantColumns() {
            if (this.hasColumnOptions === false) return;

            let self = this;
            this.reportController.getReportColumnDefParticipant().then((columnsDef: ap.models.reports.ReportColumnDefParticipant[]) => {
                self._participantColumns = new ColumnsViewModel(self.$utility, self.meetingReportConfig.ParticipantsColumns, columnsDef);
                if (self._hasAttendees === false) {
                    self._participantColumns.dragOptions.isEnabled = false;
                }
            });
        }

        canSave(): boolean {
            if (!super.canSave()) {
                return false;
            }

            let isAttendeesConfigCorrect = true;
            if (this.hasAttendees && this.hasColumnOptions) {
                let hasCheckedColumns = false;
                for (let column of this.participantColumns.columnsAvailable) {
                    if (column.isChecked) {
                        hasCheckedColumns = true;
                        break;
                    }
                }
                isAttendeesConfigCorrect = hasCheckedColumns;
            }

            return isAttendeesConfigCorrect;
        }

        copySource(): void {
            super.copySource();
            if (this.meetingReportConfig && this.meetingReportConfig !== null) {
                if (this.meetingReportConfig.HasMeetingFooter !== null) {
                    this._hasReportFooter = this.meetingReportConfig.HasMeetingFooter;
                }
                if (this.meetingReportConfig.HasMeetingHeader !== null) {
                    this._hasReportHeader = this.meetingReportConfig.HasMeetingHeader;
                }
                if (this.meetingReportConfig.HasTransferredDocs !== null) {
                    this._hasTransferred = this.meetingReportConfig.HasTransferredDocs;
                }
                if (this.meetingReportConfig.HasParticipants !== null) {
                    this._hasAttendees = this.meetingReportConfig.HasParticipants;
                }
                this.initParticipantColumns();
            }
        }

        /**
        * Save all current change into report config
        **/
        postChanges(): void {
            super.postChanges();
            this.meetingReportConfig.HasMeetingFooter = this._hasReportFooter;
            this.meetingReportConfig.HasMeetingHeader = this._hasReportHeader;
            this.meetingReportConfig.HasTransferredDocs = this._hasTransferred;
            this.meetingReportConfig.HasParticipants = this._hasAttendees;

            // sync columns
            if (this.meetingReportConfig.ParticipantsColumns === undefined || this.meetingReportConfig.ParticipantsColumns === null)
                this.meetingReportConfig.ParticipantsColumns = [];

            if (this.meetingReportConfig.ParticipantsColumns === undefined ||
                this.meetingReportConfig.ParticipantsColumns == null)
                this.meetingReportConfig.ParticipantsColumns = [];

            if (this.hasColumnOptions && this._participantColumns !== null)
                this._participantColumns.postChanges(ap.models.reports.ReportParticipantColumn, this.meetingReportConfig.ParticipantsColumns);
        }

        /**
        * This method will override the ReportConfigViewModel to fill default recipients 
        * @param sendReportViewModel is the vm for sending the report
        * @param usercommentids is the list comment ids to print the report
        * @param isAllPoints to known init the send report when print all points
        **/
        initSendReportViewModel(sendReportViewModel: SendReportViewModel, usercommentids: string[], isAllPoints: boolean) {
           super.initSendReportViewModel(sendReportViewModel, usercommentids, isAllPoints);
            if (!this.isIndividualReport) {
                this.meetingController.getMeetingContacts(this.mainController.currentMeeting).then((meetingConcerns) => {
                    let listUsers: ap.models.actors.User[] = [];
                    angular.forEach(meetingConcerns, (meetingConcern, key) => {
                        if (meetingConcern.AccessRightLevel !== ap.models.accessRights.AccessRightLevel.Subcontractor)
                            listUsers.push(meetingConcern.User);
                    });
                    sendReportViewModel.recipientsSelector.initUsers(listUsers);
                });
            }
        }

        constructor(utility: ap.utility.UtilityHelper, mainController: ap.controllers.MainController, accessRight: ap.models.accessRights.PointReportAccessRight, reportController: ap.controllers.ReportController, private meetingController: ap.controllers.MeetingController) {
           super(utility, mainController, accessRight, reportController);
        }
        private _participantColumns: ColumnsViewModel = null;
        private _hasReportHeader: boolean = false;
        private _hasReportFooter: boolean = false;
        private _hasAttendees: boolean = false;
        private _hasTransferred: boolean = false;
    }
}