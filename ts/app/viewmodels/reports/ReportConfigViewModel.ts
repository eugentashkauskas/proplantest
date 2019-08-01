module ap.viewmodels.reports {
    import reportmodels = ap.models.reports;

    export class ReportConfigViewModel extends ReportConfigBaseViewModel {

        /**
        * Get the language of the report
        **/
        public get language(): ap.models.identFiles.Language {
            return this._language;
        }

        /**
        * Set the language of the report
        **/
        public set language(language: ap.models.identFiles.Language) {
            this._language = language;
        }

        /**
       * To generate the report per user incharge
       **/
        public get isIndividualReport(): boolean {
            return this._isIndividualReport;
        }

        public set isIndividualReport(val: boolean) {
            this._isIndividualReport = val;
        }

        /**
        * Get the points columns
        **/
        public get noteColumn(): ColumnsViewModel {
            return this._noteColumn;
        }

        /**
        * Set the points column
        **/
        public set noteColumn(noteColumn: ColumnsViewModel) {
            this._noteColumn = noteColumn;
            if (this.hasListOfPoints === false)
                this._noteColumn.dragOptions.isEnabled = false;
        }

        /**
        * Get the way to know how to group and sort the points
        **/
        public get groupAndSort(): GroupAndSortViewModel {
            return this._groupAndSort;
        }

        /**
        *  Set the way to know how to group and sort the points
        **/
        public set groupAndSort(groupAndSort: GroupAndSortViewModel) {
            this._groupAndSort = groupAndSort;
        }

        /**
        * Get the logo of the report
        **/
        public get logos(): ReportLogoViewModel[] {
            return this._logos;
        }

        /**
        * Set the logo of the report
        **/
        public set logos(logos: ReportLogoViewModel[]) {
            this._logos = logos;
        }

        /**
        * Get the way to know if list of points is selected
        **/
        public get hasListOfPoints(): boolean {
            return this._hasListOfPoints;
        }

        /**
        * Set the way to know if list of points is selected
        **/
        public set hasListOfPoints(b: boolean) {
            this._hasListOfPoints = b;
            if (this._noteColumn)
                this._noteColumn.dragOptions.isEnabled = this._hasListOfPoints;
        }

        /**
        * Get the way to know if display subject is selected
        **/
        public get hasDisplaySubject(): boolean {
            return this._hasDisplaySubject;
        }

        /**
        * Set the way to know if display subject is selected
        **/
        public set hasDisplaySubject(b: boolean) {
            this._hasDisplaySubject = b;
        }

        /**
        * Get the way to know if plan preview points number is selected
        **/
        public get hasPlanPreviewPin(): boolean {
            return this._hasPlanPreviewPin;
        }

        /**
        * Set the way to know if plan preview points number is selected
        **/
        public set hasPlanPreviewPin(b: boolean) {
            this._hasPlanPreviewPin = b;
        }

        /**
        * Get the way to know if plan preview drawing is selected
        **/
        public get hasPlanPreviewDrawing(): boolean {
            return this._hasPlanPreviewDrawing;
        }

        /**
        * Set the way to know if plan preview drawing is selected
        **/
        public set hasPlanPreviewDrawing(b: boolean) {
            this._hasPlanPreviewDrawing = b;
        }

        /**
        * Get the way to know if detail of points is selected
        **/
        public get hasDetailOfPoints(): boolean {
            return this._hasDetailOfPoints;
        }

        /**
        * Set the way to know if detail of points is selected
        **/
        public set hasDetailOfPoints(b: boolean) {
            this._hasDetailOfPoints = b;
        }

        /**
        * Get the way to know if print picture is selected
        **/
        public get hasPrintPicture(): boolean {
            return this._hasPrintPicture;
        }

        /**
        * Set the way to know if print picture is selected
        **/
        public set hasPrintPicture(b: boolean) {
            this._hasPrintPicture = b;
        }

        /**
        * Get the way to know if one point per page is selected
        **/
        public get hasOnePointPage(): boolean {
            return this._hasOnePointPage;
        }

        /**
        * Set the way to know if one per page is selected
        **/
        public set hasOnePointPage(b: boolean) {
            this._hasOnePointPage = b;
        }

        /**
        * Get hte way to know if display creation date is selected
        **/
        public get hasDisplayCreaDate(): boolean {
            return this._hasDisplayCreaDate;
        }

        /**
        * Set the way to know if the creation date is selected
        **/
        public set hasDisplayCreaDate(b: boolean) {
            this._hasDisplayCreaDate = b;
        }

        /**
        * Get the way to know if add info is selected
        **/
        public get hasAddInfo(): boolean {
            return this._hasAddInfo;
        }

        /**
        * Set the way to know is add info is selected
        **/
        public set hasAddInfo(b: boolean) {
            this._hasAddInfo = b;
        }

        /**
        * Get the way to know if add join excel is selected
        **/
        public get hasJoinExcel(): boolean {
            return this._hasJoinExcel;
        }

        /**
        * Set the way to know if add join excel is selected
        **/
        public set hasJoinExcel(b: boolean) {
            this._hasJoinExcel = b;
        }

        /**
        * Get the way to know if join plan is selected
        **/
        public get hasJoinPlan(): boolean {
            return this._hasJoinPlan;
        }

        /**
        * Set the way to know if join plan is selected
        **/
        public set hasJoinPlan(b: boolean) {
            this._hasJoinPlan = b;
        }

        /**
        * Get the way to know if author info is selected
        **/
        public get hasAuthorInfo(): boolean {
            return this._hasAuthorInfo;
        }

        /**
        * Set the way to know if author info is selected
        **/
        public set hasAuthorInfo(b: boolean) {
            this._hasAuthorInfo = b;
        }

        /**
        * Get the way to know if include archive points is selected
        **/
        public get hasIncludeArchivedpoints(): boolean {
            return this._hasIncludeArchivedpoints;
        }

        /**
        * Set the way to know if include archive points is selected
        **/
        public set hasIncludeArchivedpoints(b: boolean) {
            this._hasIncludeArchivedpoints = b;
        }

        /**
        * Get the way to know if hide date is selected
        **/
        public get hasHideDate(): boolean {
            return this._hasHideDate;
        }

        /**
        * Set the way to know if hide date is selected
        **/
        public set hasHideDate(b: boolean) {
            this._hasHideDate = b;
        }

        /**
        * Get the way to know if current user has access to config columns function
        **/
        public get hasColumnOptions(): boolean {
            return this.accessRight.hasColmumnOptions;
        }

        /**
        * Get the selected option of list of points
        **/
        public get selectedListOfPoints(): reportmodels.ReportNoteList {
            return this._selectedListOfPoints;
        }

        /**
        * Set the selected option of list of points
        **/
        public set selectedListOfPoints(s: reportmodels.ReportNoteList) {
            this._selectedListOfPoints = s;
        }

        /**
        * Get the selected option of preview point pin
        **/
        public get selectedPreviewPlanPin(): reportmodels.ReportPlanPreview {
            return this._selectedPreviewPlanPin;
        }

        /**
        * Set the selected option of preview point pin
        **/
        public set selectedPreviewPlanPin(s: reportmodels.ReportPlanPreview) {
            this._selectedPreviewPlanPin = s;
        }

        /**
        * Get the selected option of preview point drawing
        **/
        public get selectedPreviewPlanDrawing(): reportmodels.ReportPlanPreview {
            return this._selectedPreviewPlanDrawing;
        }

        /**
        * Set the selected option of preview point drawing
        **/
        public set selectedPreviewPlanDrawing(s: reportmodels.ReportPlanPreview) {
            this._selectedPreviewPlanDrawing = s;
        }

        /**
        * Get the selected option of detail of point
        **/
        public get selectedDetailOfPoint(): reportmodels.ReportNoteDetail {
            return this._selectedDetailOfPoint;
        }

        /**
        * Set the selected option of detail of point
        **/
        public set selectedDetailOfPoint(s: reportmodels.ReportNoteDetail) {
            this._selectedDetailOfPoint = s;
        }

        /**
        * Get the selected option of author info
        **/
        public get selectedAuthor(): reportmodels.ReportCommentAuthor {
            return this._selectedAuthor;
        }

        /**
        * Set the selected option of author info
        **/
        public set selectedAuthor(s: reportmodels.ReportCommentAuthor) {
            this._selectedAuthor = s;
        }

        /**
        * Get the selected option of report comment author
        **/
        public get listReportCommentAuthor(): reportmodels.ReportCommentAuthor[] {
            return this._listReportCommentAuthor;
        }
        /**
        * Set the selected option of report comment author
        **/
        public reportCommentAuthorDisplay(d: reportmodels.ReportCommentAuthor): string {
            return this.$utility.Translator.getTranslation("reportmodels.ReportCommentAuthor." + reportmodels.ReportCommentAuthor[d].toLocaleLowerCase());
        }

        /**
        * Get the selected option of note list
        **/
        public get listReportNoteList(): reportmodels.ReportNoteList[] {
            return this._listReportNoteList;
        }

        /**
        * Set the selected option of note list
        **/
        public reportNoteListDisplay(d: reportmodels.ReportNoteList): string {
            return this.$utility.Translator.getTranslation("reportmodels.ReportNoteList." + reportmodels.ReportNoteList[d].toLocaleLowerCase());
        }

        /**
        * Get the selected option of plan preview
        **/
        public get listReportPlanPreview(): reportmodels.ReportPlanPreview[] {
            return this._listReportPlanPreview;
        }

        /**
        * Set the selected option of plan preview
        **/
        public reportPlanPreviewDisplay(d: reportmodels.ReportPlanPreview): string {
            return this.$utility.Translator.getTranslation("reportmodels.ReportPlanPreview." + reportmodels.ReportPlanPreview[d].toLocaleLowerCase());
        }

        /**
        * Get the selected option of note detail
        **/
        public get listReportNoteDetail(): reportmodels.ReportNoteDetail[] {
            return this._listReportNoteDetail;
        }

        /**
        * Set the selected option of note detail
        **/
        public reportNoteDetailDisplay(d: reportmodels.ReportNoteDetail): string {
            return this.$utility.Translator.getTranslation("reportmodels.ReportNoteDetail." + reportmodels.ReportNoteDetail[d].toLocaleLowerCase());
        }

        /**
        * Get the content of addInfo
        **/
        public get addInfoContent(): string {
            return this._addInfoContent;
        }

        /**
        * Set the content of addInfo
        **/
        public set addInfoContent(s: string) {
            this._addInfoContent = s;
        }

        /**
        * To know if the user can print layout
        **/
        public get hasLayoutModule(): boolean {
            return this._hasLayoutModule;
        }

        /**
        * To know if the user can print additional info
        **/
        public get hasAddInfoModule(): boolean {
            return this._hasAddInfoModule;
        }

        /**
         * To know if the user has the rigth to see the sort sections
         **/
        public get hasSortOptions(): boolean {
            return this.accessRight.hasSortOptions;
        }

        /*
        * To check if the UI can show sort option section
        *  can show if: user has license or the option to print list ot detail enabled
        */
        public get isSortOptionsEnabled(): boolean {
            if (this.reportconfig === null) return false;

            return this.hasSortOptions && (this.reportconfig.NoteList !== ap.models.reports.ReportNoteList.None || this.reportconfig.NotesDetail !== ap.models.reports.ReportNoteDetail.None);
        }

        /**
         * To know if the user has the licence to configure logo
         **/
        public get hasLogosOptions(): boolean {
            return this.accessRight.hasLogoOptions;
        }

        /*
        * To get list of column def notes
        */
        public get columnsDefNote(): ap.models.reports.ReportColumnDefNote[] {
            return this._columnsDefNote;
        }

        /**
        * To known the user have defined the cover page for the report or not
        **/
        public get hasCover(): boolean {
            return this._hasCover;
        }
        public set hasCover(val: boolean) {
            this._hasCover = val;
        }

        /**
        * The path of the pdf file will become cover of the report
        **/
        public get coverPdfPath(): string {
            return this._coverPdfPath;
        }

        public set coverPdfPath(val: string) {
            this._coverPdfPath = val;
        }

        /**
        * To know that the cover have been uploaded or not
        **/
        public get isCoverUploaded(): boolean {
            return !StringHelper.isNullOrEmpty(this._coverPdfPath) && this._coverPdfPath !== "";
        }

        /**
        * Public getter of reportTitles for autocomplete
        **/
        public get reportTitles(): ReportTitleHistoryViewModel {
            return this._reportTitles;
        }

        /**
        * Special logic that always create 3 logos
        **/
        private initLogoOptions() {
            if (this.reportconfig.Logos && this.reportconfig.Logos !== null) {
                this._logos = [];
                for (let i = 0; i < this.reportconfig.Logos.length; i++) {
                    if (this.reportconfig.Logos[i].Type !== ap.models.reports.ReportLogoType.None) {
                        let logo = new ReportLogoViewModel(this.$utility, this.mainController, this.reportconfig.Id);
                        logo.init(this.reportconfig.Logos[i]);
                        this._logos.push(logo);
                    }

                    if (this._logos.length === 3) break;
                }

                if (this._logos.length < 3) {
                    for (let i = 0; i < 3 - this.reportconfig.Logos.length; i++) {
                        let dummyLogo = new ReportLogoViewModel(this.$utility, this.mainController, this.reportconfig.Id);
                        let dummyEntity = new ap.models.reports.ReportLogo(this.$utility);
                        dummyLogo.init(dummyEntity);
                        dummyLogo.isAllPages = false;
                        dummyLogo.logoType = ap.models.reports.ReportLogoType[0];
                        this._logos.push(dummyLogo);
                    }
                }
            }
        }

        /**
        * Apply all the change of logos into report config
        **/
        private postChangesLogo(): void {
            let curentLogos: ap.models.reports.ReportLogo[] = [];

            for (let i = 0; i < this._logos.length; i++) {
                if (this._logos[i].logoType !== ap.models.reports.ReportLogoType[0] /*None*/) {
                    this._logos[i].postChanges();
                    curentLogos.push(this._logos[i].reportLogo);
                }
            }

            for (let i = 0; i < curentLogos.length; i++) {
                if (this.reportconfig.Logos.length < i + 1) {
                    this.reportconfig.Logos.push(curentLogos[i]);
                } else {
                    this.reportconfig.Logos[i].Position = curentLogos[i].Position;
                    this.reportconfig.Logos[i].Type = curentLogos[i].Type;
                    this.reportconfig.Logos[i].IsAllPages = curentLogos[i].IsAllPages;
                    this.reportconfig.Logos[i].Path = curentLogos[i].Path;
                }
            }

            // if the termplate already more than the selected then remove them
            if (this.reportconfig.Logos.length > curentLogos.length) {
                this.reportconfig.Logos.splice(curentLogos.length, this.reportconfig.Logos.length - curentLogos.length);
            }
        }

        copySource(): void {
            super.copySource();
            if (this.reportconfig && this.reportconfig !== null) {

                this.initLogoOptions();

                this.selectedAuthor = this.reportconfig.CommentAuthor;
                this.selectedListOfPoints = this.reportconfig.NoteList;
                this.selectedPreviewPlanPin = this.reportconfig.PlanPreviewPin;
                this.selectedPreviewPlanDrawing = this.reportconfig.PlanPreviewDrawing;
                this.selectedDetailOfPoint = this.reportconfig.NotesDetail;

                if (this.selectedListOfPoints === reportmodels.ReportNoteList.None) {
                    this.selectedListOfPoints = reportmodels.ReportNoteList.WithPictures;
                    this.hasListOfPoints = false;
                } else {
                    this.hasListOfPoints = true;
                }
                if (this.selectedPreviewPlanPin === reportmodels.ReportPlanPreview.None) {
                    this.selectedPreviewPlanPin = reportmodels.ReportPlanPreview.AllNoteDocuments;
                    this.hasPlanPreviewPin = false;
                } else {
                    this.hasPlanPreviewPin = true;
                }
                if (this.selectedPreviewPlanDrawing === reportmodels.ReportPlanPreview.None) {
                    this.selectedPreviewPlanDrawing = reportmodels.ReportPlanPreview.AllNoteDocuments;
                    this.hasPlanPreviewDrawing = false;
                } else {
                    this.hasPlanPreviewDrawing = true;
                }
                if (this.selectedDetailOfPoint === reportmodels.ReportNoteDetail.None) {
                    this.selectedDetailOfPoint = reportmodels.ReportNoteDetail.WithPictures;
                    this.hasDetailOfPoints = false;
                } else {
                    this.hasDetailOfPoints = true;
                }
                if (this.reportconfig.HasAdditionalInformation !== null) {
                    this.hasAddInfo = this.reportconfig.HasAdditionalInformation;
                    this.addInfoContent = this.reportconfig.AdditionalInformation;
                }
                if (this.mainController.currentMeeting && this.mainController.currentMeeting.Remarks !== null && StringHelper.isNullOrEmpty(this.addInfoContent)) {
                    this.hasAddInfo = true;
                    this.addInfoContent = this.mainController.currentMeeting.Remarks;
                }
                if (this.reportconfig.HasSubjectLikeRow !== null) {
                    this.hasDisplaySubject = this.reportconfig.HasSubjectLikeRow;
                }
                if (this.reportconfig.HideDateTimePhoto !== null) {
                    this.hasHideDate = this.reportconfig.HideDateTimePhoto;
                }
                if (this.reportconfig.IncludeArchivedNotes !== null) {
                    this.hasIncludeArchivedpoints = this.reportconfig.IncludeArchivedNotes;
                }
                if (this.reportconfig.IsPictureA5 !== null) {
                    this.hasPrintPicture = this.reportconfig.IsPictureA5;
                }
                if (this.reportconfig.IsNdOneNoteByPage !== null) {
                    this.hasOnePointPage = this.reportconfig.IsNdOneNoteByPage;
                }
                if (this.reportconfig.IsPrintNdCreationDate !== null) {
                    this.hasDisplayCreaDate = this.reportconfig.IsPrintNdCreationDate;
                }
                if (this.reportconfig.JoinExcel !== null) {
                    this.hasJoinExcel = this.reportconfig.JoinExcel;
                }
                if (this.reportconfig.JoinOriginalPlanSize !== null) {
                    this.hasJoinPlan = this.reportconfig.JoinOriginalPlanSize;
                }
                if (this.selectedAuthor === reportmodels.ReportCommentAuthor.None) {
                    this.selectedAuthor = reportmodels.ReportCommentAuthor.DisplayName;
                    this.hasAuthorInfo = false;
                } else {
                    this.hasAuthorInfo = true;
                }
                // Load columns definition
                this.reportController.getReportColumnDefNote().then((columnsDef: ap.models.reports.ReportColumnDefNote[]) => {
                    this._columnsDefNote = columnsDef;
                    if (this.reportconfig.GroupAndSorts && this.reportconfig.GroupAndSorts !== null) {

                        this.groupAndSort = new GroupAndSortViewModel(this.$utility, this._columnsDefNote);
                        this.groupAndSort.initGroupAndSortIems(this.reportconfig.GroupAndSorts);
                    }

                    // init note columns
                    if (this.hasColumnOptions) {
                        this.noteColumn = new ColumnsViewModel(this.$utility, this.reportconfig.NotesColumns, columnsDef);
                    }
                });
            }
        }
        postChanges(): void {
            super.postChanges();

            let groupAndsorts = this.groupAndSort.postChanges();

            // peform the "sync" from UI to config to avoid clean and recreate
            if (this.reportconfig.GroupAndSorts === null) this.reportconfig.GroupAndSorts = [];
            if (this.isSortOptionsEnabled === false) // If the user no sort options enabled then, no need to create sort options collection.
                this.reportconfig.GroupAndSorts = [];
            else {
                for (let i = 0; i < groupAndsorts.length; i++) {
                    if (this.reportconfig.GroupAndSorts.length < i + 1) {
                        groupAndsorts[i].DisplayOrder = i;
                        this.reportconfig.GroupAndSorts.push(groupAndsorts[i]);
                    } else {
                        this.reportconfig.GroupAndSorts[i].PropertyName = groupAndsorts[i].PropertyName;
                        this.reportconfig.GroupAndSorts[i].IsAscending = groupAndsorts[i].IsAscending;
                        this.reportconfig.GroupAndSorts[i].DisplayOrder = i;
                    }
                }

                // if the termplate already more than the selected then remove them
                if (this.reportconfig.GroupAndSorts.length > groupAndsorts.length) {
                    this.reportconfig.GroupAndSorts.splice(groupAndsorts.length, this.reportconfig.GroupAndSorts.length - groupAndsorts.length);
                }
            }

            // Postchange logos and sync to avoid re-create
            if (this.reportconfig.Logos === null) this.reportconfig.Logos = [];
            if (this.hasLogosOptions) {
                this.postChangesLogo();
            }

            if (this.hasListOfPoints === true) {
                this.reportconfig.HasSubjectLikeRow = this.hasDisplaySubject;
                this.reportconfig.NoteList = this.selectedListOfPoints;
            } else {
                this.reportconfig.HasSubjectLikeRow = false;
                this.reportconfig.NoteList = reportmodels.ReportNoteList.None;
            }
            if (this.hasDetailOfPoints === true) {
                this.reportconfig.IsPictureA5 = this.hasPrintPicture;
                this.reportconfig.IsNdOneNoteByPage = this.hasOnePointPage;
                this.reportconfig.IsPrintNdCreationDate = this.hasDisplayCreaDate;
                this.reportconfig.NotesDetail = this.selectedDetailOfPoint;
            } else {
                this.reportconfig.IsPictureA5 = false;
                this.reportconfig.IsNdOneNoteByPage = false;
                this.reportconfig.IsPrintNdCreationDate = false;
                this.reportconfig.NotesDetail = reportmodels.ReportNoteDetail.None;
            }

            if (this.hasAuthorInfo === true) {
                this.reportconfig.CommentAuthor = this.selectedAuthor;
            } else {
                this.reportconfig.CommentAuthor = reportmodels.ReportCommentAuthor.None;
            }

            if (this.hasPlanPreviewPin === true) {
                this.reportconfig.PlanPreviewPin = this.selectedPreviewPlanPin;
            } else {
                this.reportconfig.PlanPreviewPin = reportmodels.ReportPlanPreview.None;
            }

            if (this.hasPlanPreviewDrawing === true) {
                this.reportconfig.PlanPreviewDrawing = this.selectedPreviewPlanDrawing;
            } else {
                this.reportconfig.PlanPreviewDrawing = reportmodels.ReportPlanPreview.None;
            }

            if (this.hasAddInfo === true) {
                this.reportconfig.AdditionalInformation = this.addInfoContent;
            } else {
                this.reportconfig.AdditionalInformation = "";
            }
            if (this._hasCover)
                this.reportconfig.CoverPdfPath = this._coverPdfPath;
            else
                this.reportconfig.CoverPdfPath = "";

            this.reportconfig.HideDateTimePhoto = this.hasHideDate;
            this.reportconfig.HasAdditionalInformation = this.hasAddInfo;
            this.reportconfig.JoinExcel = this.hasJoinExcel;
            this.reportconfig.JoinOriginalPlanSize = this.hasJoinPlan;
            this.reportconfig.IncludeArchivedNotes = this.hasIncludeArchivedpoints;
            this.reportconfig.IsIndividualReport = this.isIndividualReport;

            // sync columns
            if (this.reportconfig.NotesColumns === undefined || this.reportconfig.NotesColumns === null || !this.hasListOfPoints /* if the checkbox to print the list is not checked, do not send columns */)
                this.reportconfig.NotesColumns = [];

            if (this.hasColumnOptions && this._noteColumn !== null && this.hasListOfPoints /* if the checkbox to print the list is not checked, do not send columns */) {
                this._noteColumn.postChanges(ap.models.reports.ReportNoteColumn, this.reportconfig.NotesColumns);
            }
        }

        /**
        * This method is used to fill the report template information into the ReportConfigViewModel
        * @param template is the report template. It can only ProjectReportTemplate or MeetingReportTemplate 
        **/
        setTemplate(template: ap.models.reports.MeetingReportTemplate);
        setTemplate(template: ap.models.reports.ProjectReportTemplate);
        setTemplate(template) {
            let reportConfigEntity: ap.models.reports.ReportConfigBase;
            if (template instanceof ap.models.reports.ProjectReportTemplate)
                reportConfigEntity = new ap.models.reports.ProjectReportConfig(this.$utility);
            else if (template instanceof ap.models.reports.MeetingReportTemplate)
                reportConfigEntity = new ap.models.reports.MeetingReportConfig(this.$utility);
            else
                throw new Error("Invalid report template");

            this.reportController.copyReportTemplateFiles(template.Id, reportConfigEntity.Id).then(() => {
                reportConfigEntity.copyFrom(template);
                this.init(reportConfigEntity);

                if (template instanceof ap.models.reports.ProjectReportTemplate) {
                    if (template.IsSystem)
                        this._reportTitles.searchText = this.mainController.currentProject().Code + " - " + this.$utility.Translator.getTranslation("app.project_report_template." + template.Code);
                    else
                        this._reportTitles.searchText = this.mainController.currentProject().Code + " - " + template.Name;
                    this.cropSubject(template);
                }
            });
        }

        /**
        * Method used to crop the code of the project in ordeer to have a report title not longer than 255 char
        * @param template is the report template
        */
        private cropSubject(template: ap.models.reports.ProjectReportTemplate) {
            // Only if the subject length if bigger than 255 char
            if (this._reportTitles.searchText.length > 255) {
                let secondSubjectPart: string;
                if (template.IsSystem) {
                    secondSubjectPart = this.$utility.Translator.getTranslation("app.project_report_template." + template.Code);
                } else {
                    secondSubjectPart = template.Name;
                    if (secondSubjectPart.length > 100) {
                        secondSubjectPart = secondSubjectPart.slice(0, 100);
                    }
                }

                let currentProjectCode: string = this.mainController.currentProject().Code;
                let secondSubjectPartLength: number = secondSubjectPart.length;
                // Need to reduce the code by the legth of the second part + three char (" - ")
                let sliceIndex: number = 255 - secondSubjectPartLength - 3;
                let newCode: string = currentProjectCode.substr(0, sliceIndex);

                this._reportTitles.searchText = newCode + " - " + secondSubjectPart;
            }
        }

        /**
        * This method is used to init defaults values for the sendReportViewModel
        * @param sendReportViewModel is the vm for sending the report
        * @param usercommentids is the list comment ids to print the report
        * @param isAllPoints to known init the send report when print all points
        **/
        initSendReportViewModel(sendReportViewModel: SendReportViewModel, usercommentids: string[], isAllPoints: boolean) {
            super.initSendReportViewModel(sendReportViewModel, usercommentids, isAllPoints);

            let currentUser: ap.models.actors.User = <ap.models.actors.User>this.$utility.UserContext.CurrentUser();
            let reportIds = this.getReportCommentIds(usercommentids);
            let defaultMessage = this.$utility.Translator.getTranslation("app.report.default_send_message");

            sendReportViewModel.subject = this._reportTitles.searchText;
            sendReportViewModel.pdfName = this._reportTitles.searchText + ".pdf";
            sendReportViewModel.hasExcelAttachment = this._hasJoinExcel;
            sendReportViewModel.excelName = this._reportTitles.searchText + ".xlsx";
            sendReportViewModel.body = defaultMessage.format(this._reportTitles.searchText, reportIds.length.toString(), currentUser.DisplayName);

            if (this._isIndividualReport) {
                let listUsers: ap.models.actors.User[] = null;
                if (isAllPoints)
                    listUsers = this._inchargeUsersForAllPoints;
                else
                    listUsers = this._inchargeUsersForSelectedPoints;
                if (listUsers === null) {
                    this.reportController.getUserInChargeForIndividualReport(reportIds).then((listUsersResult) => {
                        if (listUsersResult && listUsersResult !== null && listUsersResult.length > 0) {
                            if (isAllPoints)
                                this._inchargeUsersForAllPoints = listUsersResult;
                            else
                                this._inchargeUsersForSelectedPoints = listUsersResult;

                            this.fillIndividualReportRecipients(sendReportViewModel, listUsersResult);
                        }
                    });
                }
                else
                    this.fillIndividualReportRecipients(sendReportViewModel, listUsers);
            }
            else {
                sendReportViewModel.recipientsSelector.initUsers([currentUser]);
            }
        }

        /**
         * Determines which user comment ids will be present in the resulting report according to
         * report settings chosen by a user.
         * @param userCommentIds a list of available ids
         * @returns a list of valid ids
         */
        private getReportCommentIds(userCommentIds: string[]): string[] {
            if (!this.hasIncludeArchivedpoints) {
                // Archived notes have -1, -2, -3 and -4 suffix in their ids
                let isCommentArchivedRegex = /^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}-[1-4]$/i;
                return userCommentIds.filter(id => !isCommentArchivedRegex.test(id));
            }
            return userCommentIds;
        }

        /**
        * This method is used to fill default recipients by incharge users
        * @param sendReportViewModel is the SendReportViewModel need to fill recipients
        * @param listUsers is the list of incharge users
        **/
        private fillIndividualReportRecipients(sendReportViewModel: SendReportViewModel, listUsers: ap.models.actors.User[]) {
            let currentUser: ap.models.actors.User = <ap.models.actors.User>this.$utility.UserContext.CurrentUser();
            let displayName = this.$utility.Translator.getTranslation("Users in charge");
            let tooltip: string = "";
            tooltip = listUsers.map(u => u.DisplayName).join("; ");
            let fakeItem: ap.viewmodels.projects.ContactItemViewModel = new ap.viewmodels.projects.ContactItemViewModel(displayName, null, null, null, false, true, tooltip);
            sendReportViewModel.recipientsSelector.initUsers([currentUser]);
            sendReportViewModel.recipientsSelector.addItem(fakeItem, 0);
        }

        /**
        * This method is used to upload the pdf file for the cover of the report
        * @param file is the pdf file need to upload
        **/
        uploadCoverPage(file: File) {
            if (!this._hasCover)
                throw new Error("Cannot uploadCoverPage when hasCover = false");
            if (file === undefined || file === null)
                throw new Error("File is mandatory");
            if (this.$utility.FileHelper.getExtension(file.name) !== "pdf") {
                this.mainController.showErrorKey("app.report.cover_pdf_only", "Only PDF allowed", null, null);
                return;
            }

            let relativeUrl = "UploadReportConfigFiles.ashx?GuidId={0}".format(this.reportconfig.Id);
            let uniqueFileName = this.$utility.FileHelper.correctFileName(file.name);
            this.$utility.FileHelper.uploadFile(relativeUrl, file, uniqueFileName).then((result) => {
                this._coverPdfPath = result;
            }, (error) => {
                if (error !== "CANCEL") {
                    let message = this.$utility.Translator.getTranslation("app.document.uploadfile_fail").format(file.name);
                    let title = this.$utility.Translator.getTranslation("app.err.general_error");
                    this.mainController.showError(message, title, error, null);
                }
            });
        }

        /**
        * Checking valid data so that it is ok to save
        **/
        public canSave(): boolean {
            let layoutOK = !StringHelper.isNullOrWhiteSpace(this._reportTitles.searchText) && this._reportTitles.searchText.length <= 255
                && (this.hasListOfPoints || this.hasDetailOfPoints);

            if (layoutOK === false) return false;

            for (let i = 0; i < this.logos.length; i++) {
                if (this.logos[i].canSave() === false) return false;
            }

            return true;
        }

        constructor(utility: ap.utility.UtilityHelper, protected mainController: ap.controllers.MainController, public accessRight: ap.models.accessRights.PointReportAccessRight,
            protected reportController: ap.controllers.ReportController) {
            super(utility);

            this._hasAddInfoModule = utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_PrintAdditionalInfo);
            this._hasLayoutModule = utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_PrintLayout);

            this._listReportCommentAuthor.push(reportmodels.ReportCommentAuthor.DisplayName);
            this._listReportCommentAuthor.push(reportmodels.ReportCommentAuthor.Role);
            this._listReportCommentAuthor.push(reportmodels.ReportCommentAuthor.Company);

            this._listReportNoteList.push(reportmodels.ReportNoteList.WithPictures);
            this._listReportNoteList.push(reportmodels.ReportNoteList.WithDocs);
            this._listReportNoteList.push(reportmodels.ReportNoteList.WithDocsAndLocalizations);
            this._listReportNoteList.push(reportmodels.ReportNoteList.Simple);

            this._listReportPlanPreview.push(reportmodels.ReportPlanPreview.AllNoteDocuments);
            this._listReportPlanPreview.push(reportmodels.ReportPlanPreview.MeetingDocuments);

            this._listReportNoteDetail.push(reportmodels.ReportNoteDetail.WithPictures);
            this._listReportNoteDetail.push(reportmodels.ReportNoteDetail.WithDocs);
            this._listReportNoteDetail.push(reportmodels.ReportNoteDetail.WithDocsAndLocalization);
            this._listReportNoteDetail.push(reportmodels.ReportNoteDetail.WithoutDocs);
            this._reportTitles = new ReportTitleHistoryViewModel(reportController, mainController.currentProject().Id);
        }

        private _noteColumn: ColumnsViewModel = null;
        private _groupAndSort: GroupAndSortViewModel = null;
        private _language: ap.models.identFiles.Language = null;
        private _logos: ReportLogoViewModel[] = null;
        private _columnsDefNote: ap.models.reports.ReportColumnDefNote[] = null;

        private _hasListOfPoints: boolean = false;
        private _hasDisplaySubject: boolean = false;
        private _hasPlanPreviewPin: boolean = false;
        private _hasPlanPreviewDrawing: boolean = false;
        private _hasDetailOfPoints: boolean = false;
        private _hasPrintPicture: boolean = false;
        private _hasOnePointPage: boolean = false;
        private _hasDisplayCreaDate: boolean = false;
        private _hasAddInfo: boolean = false;
        private _hasJoinExcel: boolean = false;
        private _hasJoinPlan: boolean = false;
        private _hasAuthorInfo: boolean = false;
        private _hasIncludeArchivedpoints: boolean = false;
        private _hasHideDate: boolean = false;
        private _hasColumnOptions: boolean = false;

        private _selectedAuthor: reportmodels.ReportCommentAuthor = reportmodels.ReportCommentAuthor.None;
        private _selectedListOfPoints: reportmodels.ReportNoteList = reportmodels.ReportNoteList.None;
        private _selectedPreviewPlanPin: reportmodels.ReportPlanPreview = reportmodels.ReportPlanPreview.None;
        private _selectedPreviewPlanDrawing: reportmodels.ReportPlanPreview = reportmodels.ReportPlanPreview.None;
        private _selectedDetailOfPoint: reportmodels.ReportNoteDetail = reportmodels.ReportNoteDetail.None;

        private _listReportCommentAuthor: reportmodels.ReportCommentAuthor[] = [];
        private _listReportNoteList: reportmodels.ReportNoteList[] = [];
        private _listReportPlanPreview: reportmodels.ReportPlanPreview[] = [];
        private _listReportNoteDetail: reportmodels.ReportNoteDetail[] = [];

        private _addInfoContent: string = "";
        private _hasAddInfoModule: boolean = false;
        private _hasLayoutModule: boolean = false;
        private _isIndividualReport: boolean = false;
        private _hasCover: boolean = false;
        private _coverPdfPath: string = "";
        private _reportTitles: ReportTitleHistoryViewModel = null;
        private _inchargeUsersForSelectedPoints: ap.models.actors.User[] = null; // To keep the list of user incharge when print report with Selected points
        private _inchargeUsersForAllPoints: ap.models.actors.User[] = null; // To keep the list of user incharge when print report with All points
    }
}