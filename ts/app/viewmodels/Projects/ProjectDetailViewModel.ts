module ap.viewmodels.projects {
    import identFiles = ap.models.identFiles;

    export class ProjectDetailViewModel extends ap.viewmodels.EntityViewModel implements IDispose {


        /**
        * This property for get ProjectActions for projectInfo
        **/
        public get projectActionVm(): ProjectActionViewModel {
            return this._projectActionVm;
        }

        /**
        * This property returns originalEntity casted to Project
        **/
        public get originalProject(): ap.models.projects.Project {
            return <ap.models.projects.Project>this.originalEntity;
        }

        /**
        * Used in the view to adapt the style. This property is the url of the image to display when there is no logo defined for the project. 
        **/
        public get defaultLogo(): string {
            return this._defaultLogo;
        }

        /**
        * This is the file selected by the user when he select a new logo for the project. 
        **/
        public get newLogo(): File {
            return this._newLogo;
        }

        /**
        * This property to set name.
        **/
        public set name(val: string) {
            if (this._name !== val) {
                this._name = val;
                this.checkEditAccess();
            }
        }

        /**
        * This property returns name.
        **/
        public get name(): string {
            return this._name;
        }

        /**
        * This property to set code.
        **/
        public set code(val: string) {
            this._code = val;
            this.checkEditAccess();
        }

        /**
        * This property returns code.
        **/
        public get code(): string {
            return this._code;
        }

        /**
        * Use to know if the date enter by the user is a valid date (used in the view
        **/
        public get minDate(): Date {
            return this._minDate;
        }

        /**
        * This property to start date.
        **/
        public set startDate(val: Date) {
            this._startDate = val;
            if (this._endDate < this._startDate) {
                this._endDate = null;
            }
            this.checkEditAccess();
        }


        /**
        * This property returns start date.
        **/
        public get startDate(): Date {
            return this._startDate;
        }

        /**
        * This property to end date.
        **/
        public set endDate(val: Date) {
            this._endDate = val;
            this.checkEditAccess();
        }

        /**
        * This property returns end date.
        **/
        public get endDate(): Date {
            return this._endDate;
        }

        /**
        * This property is computed to know which logo we need to display in the view. The url depends of what the user is doing. Updating/modifying the logo, delete it...
        **/
        public get logoPath(): string {
            return this._logoPath;
        }

        /**
        * This property to set address.
        **/
        public set address(val: string) {
            this._address = val;
            this.checkEditAccess();
        }

        /**
        * This property returns address.
        **/
        public get address(): string {
            return this._address;
        }

        /**
        * This property to set city.
        **/
        public set city(val: string) {
            this._city = val;
            this.checkEditAccess();
        }

        /**
        * This property returns city.
        **/
        public get city(): string {
            return this._city;
        }

        /**
        * This property to set zip code.
        **/
        public set zipCode(val: string) {
            this._zipCode = val;
            this.checkEditAccess();
        }

        /**
        * This property returns zip code.
        **/
        public get zipCode(): string {
            return this._zipCode;
        }

        /**
        * This property returns `startDate` formmated
        **/
        public get startDateFormatted(): string {
            if (this._startDate) {
                return this._startDate.format(DateFormat.Standard);
            }
            return "";
        }

        /**
        * This property returns `endDate` formmated
        **/
        public get endDateFormatted(): string {
            if (this._endDate) {
                return this._endDate.format(DateFormat.Standard);
            }
            return "";
        }

        /**
        * Use to get the screenInfo
        **/
        public get screenInfo(): ap.misc.ScreenInfo {
            return this._screenInfo;
        }

        /**
        * Use to get the selectedCountry
        **/
        public get selectedCountry(): ap.viewmodels.identificationfiles.country.CountryViewModel {
            return this._selectedCountry;
        }

        /**
        * Use to get the selectedCountry
        **/
        public get selectedCountryName(): string {
            if (this._selectedCountry) {
                return this.$utility.Translator.getTranslation("app.country." + this._selectedCountry.originalCountry.Iso);
            } else {
                return null;
            }
        }

        /**
        * Use to set the selectedCountry
        **/
        public set selectedCountry(country: ap.viewmodels.identificationfiles.country.CountryViewModel) {
            this._selectedCountry = country;
            this.checkEditAccess();
        }

        /**
        * Use to get the list of countries
        **/
        public get countrySelector(): ap.viewmodels.identificationfiles.country.CountryListViewModel {
            if (this._countrySelector) {
                this._countrySelector.sourceItems.sort(function (a: ap.viewmodels.IEntityViewModel, b: ap.viewmodels.IEntityViewModel) {
                    let nameA = (<ap.viewmodels.identificationfiles.country.CountryViewModel>a).name.toUpperCase();
                    let nameB = (<ap.viewmodels.identificationfiles.country.CountryViewModel>b).name.toUpperCase();
                    return nameA.localeCompare(nameB);
                });
            }
            return this._countrySelector;
        }

        /**
        * Use to know if projectDetail comes from projectConfigWorkspace
        **/
        public get isForEditProject(): boolean {
            return this._isForEditProject;
        }

        /**
        * Use to know if the user can edit the logo
        **/
        public get canEditLogo(): boolean {
            return this._canEditLogo;
        }

        /**
        * Use to know the user has the possibility to edit the logo
        **/
        public get canDisplayLogoSection(): boolean {
            return this._canDisplayLogoSection;
        }

        /**
        * Use to know if the delete button must be shown
        **/
        public get canDeleteProjectLogo(): boolean {
            return this._canDeleteProjectLogo;
        }

        public get showDetailPaneBusy(): boolean {
            return this._showDetailPaneBusy;
        }

        public set showDetailPaneBusy(value: boolean) {
            this._showDetailPaneBusy = value;
        }

        /**
        * Method use to ask the user if he wants that APROPLAN change his project code
        **/
        public nameChanged() {
            let newCode = StringHelper.isNullOrEmpty(this.name) ? "" : this.name.slice(0, 4).toUpperCase();
            if (StringHelper.isNullOrWhiteSpace(this.code) || this.code === undefined) {
                this.code = newCode;
            }
            else if (newCode !== this.code && !StringHelper.isNullOrEmpty(newCode)) {
                this.controllersManager.mainController.showConfirm(this.$utility.Translator.getTranslation("app.projectDetail.nameChanged"), this.$utility.Translator.getTranslation("Update project code accordingly"), (confirm) => {
                    if (confirm === ap.controllers.MessageResult.Positive) {
                        this.code = newCode;
                    }
                });
            }
        }

        /**
        * Method used to set the country to the project
        **/
        public init(project: ap.models.projects.Project) {
            if (project) {
                this._servicesManager.projectService.getProjectDetailCountry(project.Id, true).then((apiResponse: ap.services.apiHelper.ApiResponse) => {
                    if (!!apiResponse.data)
                        project.Country = (<ap.models.projects.Project>apiResponse.data).Country;
                    super.init(project);
                    if (this._isForEditProject) {
                        if (this.originalProject.IsNew === true) {
                            this.actionClickedHandler(this._editAction.name);
                        }
                    }
                });
            }
        }

        /**
        * This method use for set validForm
        * @paam isValid it form validity parameter
        **/
        public setFormIsValid(isValid: boolean) {
            this._formIsValid = isValid;
            this.checkEditAccess();
        }

        /**
         * This method is called for switching details page to the edit mode
         */
        public gotoEditMode() {
            this.editProjectDetails();
            this.checkEditAccess();
        }

        protected computeHasChanged(): boolean {
            return super.computeHasChanged() ||
                this.name !== this.originalProject.Name ||
                this.code !== this.originalProject.Code ||
                this.startDate !== null && this.originalProject.StartDate === null ||
                this.startDate === null && this.originalProject.StartDate !== null ||
                (this.startDate !== null && this.originalProject.StartDate !== null && (this.startDate.getTime() !== this.originalProject.StartDate.getTime())) ||
                this.endDate !== null && this.originalProject.EndDate === null ||
                this.endDate === null && this.originalProject.EndDate !== null ||
                (this.endDate !== null && this.originalProject.EndDate !== null && (this.endDate.getTime() !== this.originalProject.EndDate.getTime())) ||
                this.address !== this.originalProject.Address ||
                this.city !== this.originalProject.City ||
                this.zipCode !== this.originalProject.ZipCode ||
                this.selectedCountry !== null && this.originalProject.Country === null ||
                this.selectedCountry === null && this.originalProject.Country !== null ||
                (this.selectedCountry !== null && this.originalProject.Country !== null && this.selectedCountry.originalCountry.Iso !== this.originalProject.Country.Iso) ||
                (this._logoPath !== this.originalProject.getLogoPath() && !(this._logoPath === this._defaultLogo && this.originalProject.getLogoPath() === "")) ||
                this.newLogo !== null;
        }

        /**
        * Check edit access
        **/
        private checkEditAccess() {
            this._editAction.isVisible = this.originalProject && this.originalProject.UserAccessRight.CanEdit && this._screenInfo.isEditMode === false;
            this._editAction.isEnabled = this.originalProject && this._screenInfo.isEditMode === false && this.originalProject.UserAccessRight.CanConfig === true;
            this._saveAction.isVisible = this._screenInfo.isEditMode === true;
            this._saveAction.isEnabled = this._screenInfo.isEditMode === true && (!StringHelper.isNullOrWhiteSpace(this.code) && !StringHelper.isNullOrWhiteSpace(this.name)) && this._formIsValid && this.hasChanged;
            this._cancelAction.isVisible = this._screenInfo.isEditMode === true;
            this._cancelAction.isEnabled = this._screenInfo.isEditMode === true;

            this.checkCanEditLogo();
            this.checkCanDisplayLogoSection();
        }

        /**
        * Check if the user can edit the project logo
        **/
        private checkCanEditLogo() {
            if (this.originalProject !== null) {
                this._canEditLogo = this.$utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_LogoManagement) &&
                    this.originalProject.UserAccessRight.CanConfig === true && this.screenInfo.isEditMode === true;

                this._canDeleteProjectLogo = this.$utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_LogoManagement) &&
                    this.screenInfo.isEditMode === true && ((this.newLogo !== undefined && this.newLogo !== null) || (this._sourceLogoPath !== undefined && this._sourceLogoPath !== null));
            }
        }

        /**
        * Check if we can display or not the logo section
        **/
        private checkCanDisplayLogoSection() {
            this._canDisplayLogoSection = this.isForEditProject && this.$utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_LogoManagement);
        }

        /**
        * This top handle actions click on UI
        **/
        private actionClickedHandler(actionName: string) {
            let wasNew = this.originalProject.IsNew;
            switch (actionName) {
                case "detail.edit":
                    this.editProjectDetails();
                    this._listener.raise("editmodechanged", new base.EditModeEvent(this));
                    break;
                case "detail.save":
                    this.save();

                    break;
                case "detail.cancel":
                    this.cancel();
                    this._screenInfo.isEditMode = false;
                    this._listener.raise("editmodechanged", new base.EditModeEvent(this, wasNew, true));
                    break;
            }
            this.checkEditAccess();
        }

        private editProjectDetails() {
            this._screenInfo.isEditMode = true;
            if (!this._countrySelector) {
                this._countrySelector = new ap.viewmodels.identificationfiles.country.CountryListViewModel(this.utility, this.q, this.controllersManager.mainController);
                this._countrySelector.load(this._selectedCountry ? this._selectedCountry.originalCountry.Id : null).then(() => {
                    this._selectedCountry = <ap.viewmodels.identificationfiles.country.CountryViewModel>this.countrySelector.selectedViewModel;
                });
            } else if (this._selectedCountry) {
                this._countrySelector.selectEntity(this._selectedCountry.originalCountry.Id);
                this._selectedCountry = <ap.viewmodels.identificationfiles.country.CountryViewModel>this.countrySelector.selectedViewModel;
            }
        }

        /**
        * Method use to set the url to logoPath
        * If there is a new logo set logoPath with a preview url
        **/
        private computeLogoPath() {
            if (this._sourceLogoPath) {
                this._logoPath = this._sourceLogoPath;
            } else if (this.newLogo) {
                let reader: FileReader = new FileReader();
                reader.onloadstart = (ev) => {
                    this._timeout = this.$timeout(() => {
                        this._imageLoading = true;
                        this.controllersManager.mainController.showBusy();
                    }, 0);
                };
                reader.onload = (ev: any) => {
                    this._timeout2 = this.$timeout(() => {
                        if (this._logoPath !== ev.target.result) {
                            this._logoPath = ev.target.result;
                        } else {
                            // This exactly image is already loaded in the img tag and no onload handlers will be called for it
                            // So we have to finish loading routine manually
                            this.logoLoaded(null, false);
                        }
                    }, 0);
                };
                reader.readAsDataURL(this.newLogo);
            } else {
                this._logoPath = this.defaultLogo;
            }
            this.checkCanEditLogo();
            this.checkEditAccess();
        }

        public logoLoaded(evt: Event, isError: boolean) {
            if (this._imageLoading) {
                this._imageLoading = false;
                this.controllersManager.mainController.hideBusy();
            }
        }

        /**
        * Method use to save the new values
        **/
        public save() {
            this.postChanges();
            if (this._needDeleteLogo) {
                this.controllersManager.mainController.showBusy();
                this.controllersManager.projectController.deleteProjectLogo(this.originalProject).then(() => {
                    this._canDeleteProjectLogo = false;
                    this._needDeleteLogo = false;
                    this.controllersManager.mainController.hideBusy();
                }, () => {
                    this.controllersManager.mainController.hideBusy();
                    // If there is an error while deleting the file on the server, we don't show nothing to the user. No need, the project entity will be updated correctly. 
                });
            }
            if (this.newLogo) {
                this.controllersManager.mainController.showBusy();
                this.controllersManager.projectController.uploadProjectLogo(this.originalProject, this.newLogo).then(() => {
                    this.finilizeSave();
                    this._newLogo = null;
                    this._sourceLogoPath = this.$utility.apiUrl + "ProjectImages/Logo/" + this.originalProject.Id + "/" + this.originalProject.LogoUrl;
                    this.computeLogoPath();
                    this.controllersManager.mainController.hideBusy();
                }, () => {
                    this.controllersManager.mainController.hideBusy();
                });
            } else {
                this.finilizeSave();
            }
        }

        /**
         * This method is to finalize the save then, to call the correct method if the project is new or not and then, goback from the edit mode
         **/
        private finilizeSave() {
            if (this.originalProject.IsNew !== true) {
                this.controllersManager.projectController.saveProjectInfo(this.originalProject).then(() => {
                    this._screenInfo.isEditMode = false;
                    this._listener.raise("editmodechanged", new base.EditModeEvent(this, false, false));
                    this.checkEditAccess();
                });
            }
            else {
                this.controllersManager.projectController.createProject(this.originalProject).then((project: ap.models.projects.Project) => {
                    this.controllersManager.listController.prependEntity("Project", project);
                    this._screenInfo.isEditMode = false;
                    this._listener.raise("editmodechanged", new base.EditModeEvent(this, true, false));
                    this.checkEditAccess();
                });
            }
        }

        /**
        * Method use to get the previous values back
        **/
        public cancel() {
            this.copySource();
        }

        /**
        * Method use to delete the logo of the project
        **/
        public deleteProjectLogo() {
            this._newLogo = null;
            this._logoPath = this.defaultLogo;
            this.checkEditAccess();
        }

        /**
        * Change the current project logo in the view when file is selected
        * @param files containt the new logo at position 0
        **/
        public changeLogo(files: File[]) {
            if (files.length !== 0) {
                if (files.length > 1) {
                    throw new Error("There is more than one file");
                } else {
                    if (this.$utility.FileHelper.hasImageExtension(files[0].name) === false) {
                        this.controllersManager.mainController.showError("app.err.filetypenotsupported", "Change logo", null, null);
                    } else {
                        this._newLogo = files[0];
                        this._sourceLogoPath = null;

                        this.computeLogoPath();
                    }
                }
            }
        }

        postChanges() {
            super.postChanges();
            this.originalProject.Name = this.name;
            this.originalProject.Code = this.code;
            this.originalProject.StartDate = this.startDate;
            this.originalProject.EndDate = this.endDate;
            if (this.selectedCountry) {
                this.originalProject.Country = this.selectedCountry.originalCountry;
            } else {
                this.originalProject.Country = null;
            }
            this.originalProject.Address = this.address;
            this.originalProject.City = this.city;
            this.originalProject.ZipCode = this.zipCode;

            if (this.originalProject.LogoUrl !== null && this.logoPath === this.defaultLogo) {
                this.originalProject.LogoUrl = null;
                this._needDeleteLogo = true;
            } else if (this.newLogo) {
                this.originalProject.LogoUrl = this.newLogo.name;
            }
        }

        copySource(): void {
            super.copySource();
            this._newLogo = null;
            if (this.originalProject !== null) {

                this._name = this.originalProject.Name;
                this._code = this.originalProject.Code;
                this._startDate = this.originalProject.StartDate;
                this._endDate = this.originalProject.EndDate;
                this._selectedCountry = this.originalProject.Country ? new ap.viewmodels.identificationfiles.country.CountryViewModel(this.utility, this.originalProject.Country) : null;
                this._address = this.originalProject.Address;
                this._city = this.originalProject.City;
                this._zipCode = this.originalProject.ZipCode;

                if (this.originalProject.LogoUrl !== undefined && this.originalProject.LogoUrl !== null) {
                    this._sourceLogoPath = this.$utility.apiUrl + "ProjectImages/Logo/" + this.originalProject.Id + "/" + this.originalProject.LogoUrl;
                }
                else if (this.originalProject.Cover && this.originalProject.Cover !== null) {
                    if (this.originalProject.Cover.Status === ap.models.documents.DocumentStatus.Processed) {
                        if (this.originalProject.Cover.BigThumbUrl.indexOf(this.$utility.apiUrl) >= 0) {
                            this._sourceLogoPath = this.originalProject.Cover.BigThumbUrl;
                        }
                        else {
                            this._sourceLogoPath = this.$utility.apiUrl + this.originalProject.Cover.BigThumbUrl;
                        }
                    }
                    else {
                        this._sourceLogoPath = this.$utility.rootUrl + "/Images/html/loader.gif";
                    }
                }
                this.computeLogoPath();

                this._projectActionVm = new ProjectActionViewModel(this.utility, this.controllersManager.mainController, this.controllersManager.projectController, this.originalProject, false);
            }
        }

        public dispose() {
            if (this._timeout)
                this.$timeout.cancel(this._timeout);
            if (this._timeout2)
                this.$timeout.cancel(this._timeout2);
        }

        constructor(private utility: ap.utility.UtilityHelper, private q: angular.IQService, private $timeout: angular.ITimeoutService, private controllersManager: ap.controllers.ControllersManager, private _servicesManager: ap.services.ServicesManager, private _isForEditProject: boolean = false) {
            super(utility);
            this._listener = utility.EventTool.implementsListener(["editmodechanged"]);
            this._editAction = new ap.viewmodels.home.ActionViewModel(utility, utility.EventTool, "detail.edit", utility.rootUrl + "Images/html/icons/ic_create_black_48px.svg",
                true /*visible*/, null /*sub*/, "Edit", true, null /*file*/, new ap.misc.Shortcut("e"));
            this._saveAction = new ap.viewmodels.home.ActionViewModel(utility, utility.EventTool, "detail.save", utility.rootUrl + "Images/html/icons/ic_save_black_48px.svg",
                false /*visible*/, null /*sub*/, "Save", true, null /*file*/, new ap.misc.Shortcut("s"));
            this._cancelAction = new ap.viewmodels.home.ActionViewModel(utility, utility.EventTool, "detail.cancel", utility.rootUrl + "Images/html/icons/ic_cancel_black_48px.svg",
                false /*visible*/, null /*sub*/, "Cancel", true, null /*file*/, new ap.misc.Shortcut("x"));
            this._screenInfo = new ap.misc.ScreenInfo(utility, "project.detailconfig", ap.misc.ScreenInfoType.Detail, [this._editAction, this._saveAction, this._cancelAction],
                null, null, "projectconfig", true, false/*edit*/);

            if (_isForEditProject) {
                this.init(controllersManager.mainController.currentProject());
            }
            this._screenInfo.on("actionclicked", this.actionClickedHandler, this);
            this.checkEditAccess();
            this.computeLogoPath();
        }

        private _name: string;
        private _code: string;
        private _startDate: Date;
        private _endDate: Date;
        private _address: string;
        private _city: string;
        private _zipCode: string;
        private _screenInfo: ap.misc.ScreenInfo;
        private _editAction: ap.viewmodels.home.ActionViewModel;
        private _saveAction: ap.viewmodels.home.ActionViewModel;
        private _cancelAction: ap.viewmodels.home.ActionViewModel;
        protected _listener: ap.utility.IListenerBuilder;
        private _selectedCountry: ap.viewmodels.identificationfiles.country.CountryViewModel;
        private _countrySelector: ap.viewmodels.identificationfiles.country.CountryListViewModel;
        private _canEditLogo: boolean = false;
        private _canDisplayLogoSection: boolean = false;
        private _newLogo: File = null;
        private _logoPath: string;
        private _sourceLogoPath: string = null; // This is the url of the logo from the original project until the user selects another logo when updating project. If the logo is updated, sourceLogoPath is null
        private _defaultLogo: string = this.$utility.rootUrl + "/Images/html/icons/projects_white_48px.svg";
        private _canDeleteProjectLogo: boolean = false;
        private _needDeleteLogo: boolean = false;
        private _projectActionVm: ProjectActionViewModel;
        private _minDate: Date = new Date(1950, 0, 1);
        private _formIsValid: boolean = true;
        private _imageLoading: boolean = false;
        private _timeout: any;
        private _timeout2: any;
        private _showDetailPaneBusy: boolean = false;
    }
}