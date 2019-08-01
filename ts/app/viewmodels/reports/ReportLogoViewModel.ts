module ap.viewmodels.reports {
    import reportmodels = ap.models.reports;
    export class ReportLogoViewModel extends EntityViewModel {

        /**
        * type of logo from (Project logo, usewr logo, uploaded logo)
        **/
        public get logoType(): string {
            return reportmodels.ReportLogoType[this._logoType].toString();
        }
        public set logoType(logoType: string) {
            this._logoType = reportmodels.ReportLogoType[logoType];
        }

        /**
        * To know if need to print on every pages
        **/
        public get isAllPages(): boolean {
            return this._isAllPages;
        }
        public set isAllPages(isAllPages: boolean) {
            this._isAllPages = isAllPages;
        }

        /**
        * Left/center/right -> position of the logo on page
        **/
        public get position(): reportmodels.ReportLogoPosition {
            return this._position;
        }
        public set position(position: reportmodels.ReportLogoPosition) {
            this._position = position;
        }
        public get reportLogo(): reportmodels.ReportLogo {
            return <reportmodels.ReportLogo>this._originalEntity;
        }

        /**
        * path of custom logo
        **/
        public get path(): string {
            return this._path;
        }
        public set path(path: string) {
            this._path = path;
        }

        /**
        * This method will return url path depend on the option
        **/
        public getLogoPath(): string {
            if (this._logoType === reportmodels.ReportLogoType.Project)
                return this.$mainController.currentProject().getLogoPath();
            else if (this._logoType === reportmodels.ReportLogoType.User) {
                return (<ap.models.actors.User>this.$utility.UserContext.CurrentUser()).getLogoPath();
            }
            else if (this._logoType === reportmodels.ReportLogoType.Uploaded) {
                // when the path is not there or not set -> return the empty string so that iti is not error at UI
                if (this.path === "" || this.path === null || this.path === undefined)
                    return "";

                return this.$utility.apiUrl + "ReportConfig/" + this.reportConfigId + "/" + this.path;
            }

            return "";
        }

        /**
        * Checking valid data so that it is ok to save
        **/
        public canSave(): boolean {
            if (this._logoType === reportmodels.ReportLogoType.Project)
                return StringHelper.isNullOrWhiteSpace(this.$mainController.currentProject().getLogoPath()) === false;
            else if (this._logoType === reportmodels.ReportLogoType.User)
                return StringHelper.isNullOrWhiteSpace((<ap.models.actors.User>this.$utility.UserContext.CurrentUser()).getLogoPath()) === false;
            else if (this._logoType === reportmodels.ReportLogoType.Uploaded)
                return StringHelper.isNullOrWhiteSpace(this.path) === false;

            return true;
        }

        /**
        * This method to upload a file as custom logo to server
        **/
        public uploadLogo(files: File[]) {
            if (files.length === 0) return;

            let self = this;
            if (this.$utility.FileHelper.hasImageExtension(files[0].name) === false) {
                let msg = this.$utility.Translator.getTranslation("app.err.adddoc_wrong_extensionMsg").format(files[0].name);
                let title = this.$utility.Translator.getTranslation("app.err.adddoc_wrong_extensionTitle");
                this.$mainController.showError(msg, title, null, null);
                return;
            }

            let ext = this.$utility.FileHelper.getExtension(files[0].name);
            let uniqueFileName = this.$utility.FileHelper.correctFileName(ap.utility.UtilityHelper.createGuid() + "." + ext);

            let relativeUrl = "UploadReportConfigFiles.ashx?GuidId={0}".format(this.reportConfigId);
            this.$utility.FileHelper.uploadFile(relativeUrl, files[0], uniqueFileName).then((result) => {
                self.path = result;
            }, (error) => {
                if (error !== "CANCEL") {
                    let message = this.$utility.Translator.getTranslation("app.document.uploadfile_fail").format(files[0].name);
                    let title = this.$utility.Translator.getTranslation("app.err.general_error");
                    self.$mainController.showError(message, title, error, null);
                }
            });
        }

        copySource(): void {
            super.copySource();
            if (this.reportLogo && this.reportLogo != null) {
                this._logoType = this.reportLogo.Type;
                this._isAllPages = this.reportLogo.IsAllPages;
                this._position = this.reportLogo.Position;
                this._path = this.reportLogo.Path;

                // in case the logo init but the path is not valid then change to "No logo"
                if (this._logoType !== reportmodels.ReportLogoType.None) {
                    let path = this.getLogoPath();
                    if (path === null || path === "") {
                        this._logoType = reportmodels.ReportLogoType.None;
                        this.path = "";
                        this._isAllPages = false;
                    }
                }
            }
        }
        postChanges(): void {
            this.reportLogo.Type = this._logoType;
            this.reportLogo.IsAllPages = this._isAllPages;
            this.reportLogo.Position = this._position;
            this.reportLogo.Path = this.path;
        }

        constructor(utility: ap.utility.UtilityHelper, private $mainController: ap.controllers.MainController, private reportConfigId: string) {
            super(utility);
        }

        private _logoType: reportmodels.ReportLogoType = reportmodels.ReportLogoType.None;
        private _isAllPages: boolean = false;
        private _position: reportmodels.ReportLogoPosition = reportmodels.ReportLogoPosition.Right;
        private _path: string = null;
    }
}