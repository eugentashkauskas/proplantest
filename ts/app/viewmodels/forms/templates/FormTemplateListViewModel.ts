module ap.viewmodels.forms.templates {

    export class FormTemplateItemParameterBuilder implements ItemParameterBuilder {
        createItemParameter(itemIndex: number, dataSource: any, pageDesc: PageDescription, parameters: LoadPageSuccessHandlerParameter, utility: ap.utility.UtilityHelper) {
            return new FormTemplateItemParameter(itemIndex, dataSource, pageDesc, parameters, utility, this._companyController, this._formController);
        }
        constructor(private _companyController: ap.controllers.CompanyController, private _formController: ap.controllers.FormController) {

        }
    }

    export class FormTemplateListViewModel extends ap.viewmodels.ListWorkspaceViewModel {

        /**
         * Getter of the public checkedIds property
        **/
        public get checkedIds(): string[] {
            return this._checkedIds;
        }

        /**
         * Getter of the public checkedEntityArr property
        **/
        public get checkedEntityArr(): ap.models.forms.FormTemplate[] {
            return this._checkedEntityArr;
        }

        /**
         * This is the sceenInfo of the view
        **/
        public get screenInfo(): ap.misc.ScreenInfo {
            return this._screenInfo;
        }

        public get isForSelectModule(): boolean {
            return this._isForSelectModule;
        }

        /**
        * Getter of the public selectedAll property
        */
        public get selectedAll(): boolean {
            return this._selectedAll;
        }

        /**
        * The MultiActionsViewModel to manage the list multi actions
        **/
        public get multiActionsViewModel(): ap.viewmodels.home.MultiActionsViewModel {
            return this._multiActions;
        }

        /*
         * Return if it is in multi-actions mode, can be used to hide download action of each Point/Note
         */
        public get isMultiActions(): boolean {
            return this._isMultiActions;
        }

        /**
        * This method is used to handler the multi action make by the user
        * @param actionName is the name of the action requested
        **/
        private multiactionClick(actionName: string) {
            this.getCheckedIdsFormultiactionClick();
            switch (actionName) {
                case "archive":
                    this.$controllersManager.formController.multiArchiveFormTemplate(this._checkedFormTemplateIdsArr, this.checkedEntityArr);
                    break;
                case "unarchive":
                    this.$controllersManager.formController.multiUnarchiveFormTemplate(this._checkedFormTemplateIdsArr, this.checkedEntityArr);
                    break;
            }
        }

        /**
         * This private method is used to get checked ids for non loaded view models
         */
        private getCheckedIdsFormultiactionClick() {
            this._checkedEntityArr.splice(0);
            let checkedItems = <ap.viewmodels.forms.templates.FormTemplateItemViewModel[]>this.listVm.getCheckedItems();
            this._checkedFormTemplateIdsArr = [];

            checkedItems.forEach((item) => {
                this._checkedEntityArr.push(item.originalTemplate);
            });

            if (this.checkedIds.length !== this.checkedEntityArr.length) {
                this._checkedFormTemplateIdsArr = this.checkedIds.slice();
                for (let i = 0; i < this._checkedFormTemplateIdsArr.length; i++) {
                    for (let j = 0; j < this._checkedEntityArr.length; j++) {
                        if (this._checkedFormTemplateIdsArr[i] === this.checkedEntityArr[j].Id) {
                            this._checkedFormTemplateIdsArr.splice(i, 1);
                            i--;
                            break;
                        }
                    }
                }
            }
        }

        /**
        * Methode use to get all the usercommentid of the items checked
        **/
        private idsItemsChecked(): string[] {
            return this.listVm.listidsChecked;
        }

        /**
         * Returns true if some items are checked (not all)
         * Returns false in the other cases
        */
        public get isIndeterminate(): boolean {
            return this._isIndeterminate;
        }

        /**
         * Set of the public selectedAll property
        */
        public set selectedAll(selectedAll: boolean) {
            if (this._selectedAll !== selectedAll) {
                this._isIndeterminate = false;
                this._selectedAll = selectedAll;
                if (this._selectedAll) {
                    this._checkedIds.splice(0);
                    this._checkedIds.push(...this._listVm.ids);
                } else if (!this._selectedAll && !this._isIndeterminate) {
                    this._checkedIds.splice(0);
                }
                this.updateItemCheckState();
                this._listener.raise("isCheckedChanged");
            }
        }

        /**
         * Tells if all items should be checked or not
         */
        public toggleAll() {
            this.selectedAll = !this.selectedAll;
        }

        /**
         * This metod update sourceItems checked state then select all checkbox is clicked
         */
        private updateItemCheckState() {
            let changeIsChecked: (item: FormTemplateItemViewModel) => void = (item: FormTemplateItemViewModel) => {
                if (item && item.originalEntity) {
                    item.defaultChecked = this.selectedAll; // use default check to not raise the check event for each item
                }
            };

            this.listVm.sourceItems.forEach((item: FormTemplateItemViewModel) => {
                changeIsChecked(item);
            });
            this.checkSelectedAll(true);
            this.manageMultiActionsMode(); // enable the multi action mode  
        }

        /**
         * Calls on `ischeckedchanged` event. Checks number of selected poinst with number of uploaded points. If it is equal - set selected = true, otherwise - false.
         */
        private checkSelectedAll(isPageLoaded?: boolean) {
            let checkedItemsLength: number = this.listVm.getCheckedItems().length;
            let listLength: number = this.listVm.ids.length;
            this._selectedAll = listLength === checkedItemsLength || (this.selectedAll && isPageLoaded);
            this._isIndeterminate = !this.selectedAll && checkedItemsLength > 0;
        }

        /**
         * Handler when page is loaded
         * @param list: FormTemplateItemViewModel[] - a list of loaded form templates
        **/
        private onPageLoaded(list: FormTemplateItemViewModel[]) {
            let loadedTempalteIds: string = "";
            let apiOptions = new ap.services.apiHelper.ApiOption();
            apiOptions.async = true;
            loadedTempalteIds = list.map((item: FormTemplateItemViewModel) => {
                if (this._checkedIds.indexOf(item.originalEntity.Id) >= 0) {
                    item.defaultChecked = true;
                }
                return item.originalEntity.Id;
            }).join(",");
            this._api.getApiResponseStatList("FormQuestionStats", "FormTemplateID", "Filter.In(FormTemplateID," + loadedTempalteIds + ")", apiOptions).then((apiResponse) => {
                let arrayStats = apiResponse.data[0];
                for (let i = 0; i < arrayStats.length; i++) {
                    let formTemplate: FormTemplateItemViewModel[];
                    let stat: ap.models.stats.StatResult = arrayStats[i];
                    formTemplate = <FormTemplateItemViewModel[]>this.listVm.sourceItems.filter((template: FormTemplateItemViewModel) => {
                        return template.originalEntity.Id === stat.GroupByValue;
                    });
                    if (formTemplate[0]) {
                        formTemplate[0].questionsCount = stat.Count;
                    }
                }
            });
        }

        /**
         * This public method used to load data
         * @param idToselect - id
         */
        public loadData(idToselect?: string) {
            this.load();
        }

        /**
        * Dispose the object
        */
        public dispose() {
            super.dispose();

            if (this._multiActions) {
                this._multiActions.dispose();
                this._multiActions = null;
            }

            if (this.screenInfo) {
                this.screenInfo.dispose();
                this._screenInfo = null;
            }

            this.$controllersManager.formController.off("formTemplateupdated", this.formTemplateUpdatedHandler, this);
            this.$controllersManager.mainController.off("multiactioncloserequested", this.formTemplateUpdatedHandler, this);
        }

        /**
         * This method build the filter before to load the data based on the property of the list
        */
        protected createCustomParams(): void {
            if (this._screenInfo && this._screenInfo.mainSearchInfo.criterions.length > 0) {
                let criterion: ap.misc.Criterion;
                let keyVal: KeyValue<string, string>;
                for (let i = 0; i < this.screenInfo.mainSearchInfo.criterions.length; i++) {
                    criterion = this.screenInfo.mainSearchInfo.criterions[i];
                    if (criterion.predefinedFilter && criterion.predefinedFilter.customParams) {
                        for (let idxParam = 0; idxParam < criterion.predefinedFilter.customParams.count; idxParam++) {
                            keyVal = criterion.predefinedFilter.customParams.getKeyValue(idxParam);
                            this.listVm.addCustomParam(keyVal.key, keyVal.value);
                        }
                    }
                }
            }
        }

        /**
         * This method is overrided to build the default filter to get the entities. Get document not archived on current project and selected folder
         **/
        protected buildCustomFilter(): angular.IPromise<string> {
            let deferred: ng.IDeferred<string> = this.$q.defer();
            let predefinedFilter: string;
            let criterionsFilter: string[] = [];
            let filter: string;
            if (this.screenInfo && this.screenInfo.mainSearchInfo && !StringHelper.isNullOrEmpty(this.screenInfo.mainSearchInfo.filterString)) {
                filter = this.screenInfo.mainSearchInfo.filterString;
            }
            deferred.resolve(filter);
            return deferred.promise;
        }

        /**
         * This method is handler on "isCheckedChanged" event from listVm
         * @param item instance of FormTemplateItemViewModel
         */
        private checkedChangedHandler(item: FormTemplateItemViewModel) {
            if (item.isChecked) {
                this._checkedIds.push(item.originalEntity.Id);
            } else {
                let index = this._checkedIds.indexOf(item.originalEntity.Id);
                this._checkedIds.splice(index, 1);
            }
            this.checkSelectedAll();
            this.manageMultiActionsMode();
            this._listener.raise("isCheckedChanged");
        }

        /**
         * This method will initialize the multi actions mode or close it depending on the number of checked items in the list
         * > 0 -> enter the multi actions mode
         * = 0 -> close this multi actions mode
        */
        public manageMultiActionsMode() {
            this.multiActionsViewModel.itemsChecked = this._checkedIds;
            if (this.multiActionsViewModel.itemsChecked.length > 0) {
                this._isMultiActions = true;
                this.computeMultiActionsAccessibility();

                // only go to multi action if this Class is used in the points module
                if (this.$controllersManager.uiStateController.mainFlowState === ap.controllers.MainFlow.FormTemplates && !this.$controllersManager.mainController.isMultiActionMode)
                    this.$controllersManager.mainController.gotoMultiActionsMode(this._multiActions);
            } else {
                this.closeMultiActions();
            }
        }

        /**
         * This method is to compute the visibility and accessibility of the multi actions.
        */
        private computeMultiActionsAccessibility() {
            if (!this._isForSelectModule) {
                this.computeArchiveMultiActionRight();
                this.computeUnarchiveMultiActionRight();
            }
        }

        /**
         * Method use to know if the button is visible and enable or not
        **/
        private computeArchiveMultiActionRight() {
            if ((this.screenInfo.mainSearchInfo.hasPredefinedFilterCriterion("Active") === true) ||
                ((this.screenInfo.mainSearchInfo.hasPredefinedFilterCriterion("Archived") === false) && (this.screenInfo.mainSearchInfo.hasPredefinedFilterCriterion("Active") === false))) {
                this._archiveMultiAction.isVisible = true;
                this._archiveMultiAction.isEnabled = true;
            } else {
                this._archiveMultiAction.isVisible = false;
                this._archiveMultiAction.isEnabled = false;
            }
        }

        /**
         * Method use to know if the button is visible and enable or not
        **/
        private computeUnarchiveMultiActionRight() {
            if ((this.screenInfo.mainSearchInfo.hasPredefinedFilterCriterion("Archived") === true) ||
                ((this.screenInfo.mainSearchInfo.hasPredefinedFilterCriterion("Active") === false) && (this.screenInfo.mainSearchInfo.hasPredefinedFilterCriterion("Archived") === false))) {
                this._unarchiveMultiAction.isVisible = true;
                this._unarchiveMultiAction.isEnabled = true;
            } else {
                this._unarchiveMultiAction.isVisible = false;
                this._unarchiveMultiAction.isEnabled = false;
            }
        }

        /**
         * Create and return predefined filter data
         * @param filterPropPath Filter data's property path
         * @param filterType Filter's type
         * @param dataType Filter's data type
         * @param values Filter's values
        */
        private getPredefinedFilterData(filterPropPath: string, filterType: ap.models.custom.FilterType, dataType: string, values: any | any[]) {
            let predefinedFilterData = new ap.models.custom.FilterData();
            predefinedFilterData.PropertyPath = filterPropPath;
            predefinedFilterData.FilterType = filterType;
            predefinedFilterData.DataType = dataType;
            predefinedFilterData.Values = values instanceof Array ? values : [values];
            return predefinedFilterData;
        }

        /**
         * This method initialize the view
         **/
        private initView() {
            if (!this._isForSelectModule) {
                let predefinedFilters: ap.misc.PredefinedFilter[] = [];
                predefinedFilters.push(new ap.misc.PredefinedFilter("Active", "Active forms", true, Filter.isFalse("IsArchived"), null, ["Archived"], null,
                    this.getPredefinedFilterData("IsArchived", ap.models.custom.FilterType.IsFalse, "Bool", false)));
                predefinedFilters.push(new ap.misc.PredefinedFilter("Archived", "Archived forms", true, Filter.isTrue("IsArchived"), null, ["Active"], null,
                    this.getPredefinedFilterData("IsArchived", ap.models.custom.FilterType.IsTrue, "Bool", true)));

                let mainSearchInfo = new ap.misc.MainSearchInfo(this.$utility, this.$timeout, [], [new ap.misc.AdvancedFilter(new ap.misc.PropertyInfo("Subject", "Title", false, ap.misc.PropertyType.String), null)], predefinedFilters, true);

                mainSearchInfo.isVisible = true;
                mainSearchInfo.isEnabled = true;

                let addActions = new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "formtemplate.addtemplate", "/Images/html/icons/ic_add_black_48px.svg", false, null, "Add form template", false);

                this._screenInfo = new ap.misc.ScreenInfo(this.$utility, "formtemplates.list", ap.misc.ScreenInfoType.List, null, addActions, mainSearchInfo, null, false);

                this.$controllersManager.mainController.initScreen(this._screenInfo);

                if (this._screenInfo.mainSearchInfo.criterions.length === 0) { // If not default criterions defined, the default one should be the active projects
                    this._screenInfo.mainSearchInfo.addCriterion(predefinedFilters[0]);
                }

                this._archiveMultiAction = new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "archive", this.$utility.rootUrl + "Images/html/icons/ic_archive_black_48px.svg", false, null, "Archive", false);
                this._unarchiveMultiAction = new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "unarchive", this.$utility.rootUrl + "Images/html/icons/ic_unarchive_black_48px.svg", false, null, "Unarchive", false);
            }

            let multiactions: ap.viewmodels.home.ActionViewModel[] = [];
            multiactions.push(this._archiveMultiAction, this._unarchiveMultiAction);

            this._multiActions = new ap.viewmodels.home.MultiActionsViewModel(this.$utility, multiactions, []); // the checked event will raise for one time so reduce one
            this._multiActions.on("actionClicked", this.multiactionClick, this);
        }

        /*
         * This method will closes the multiactions mode if activated.
        **/
        public closeMultiActions() {
            if (this._isMultiActions)
                this.$controllersManager.mainController.closeMultiActionsMode();
        }

        /*
         * Finish multiaction and uncheck all items
        **/
        private formTemplateUpdatedHandler(formTemplateArr: ap.models.forms.FormTemplate[]) {
            if (!!formTemplateArr && formTemplateArr.length > 0) {
                formTemplateArr.forEach((formTemplate: ap.models.forms.FormTemplate) => {
                    this.listVm.updateItem(formTemplate);
                });
            }

            if (this._isMultiActions) {
                this.checkedIds.splice(0).forEach((item) => {
                    if (!!this.listVm.getEntityById(item)) {
                        this.listVm.getEntityById(item).isChecked = false;
                    }
                });
                this._isMultiActions = false;
                this.$controllersManager.mainController.closeMultiActionsMode();
                this._multiActions.itemsChecked = [];
                this.listVm.listidsChecked = [];
                this.listVm.selectedAll = false;
                this.listVm.initializeDefaultCheckedItems();
                this.checkSelectedAll();
            }
        }

        constructor($scope: angular.IScope, $utility: ap.utility.UtilityHelper, private _api: ap.services.apiHelper.Api, $q: angular.IQService, private $timeout: angular.ITimeoutService, controllersManager: ap.controllers.ControllersManager, private _isForSelectModule: boolean = false) {
            super($utility, controllersManager, $q, new GenericPagedListOptions("FormTemplate", FormTemplateItemViewModel, "Language, Creator", undefined, 50, false, false, null, false,
                new FormTemplateItemParameterBuilder(controllersManager.companyController, controllersManager.formController)));

            this.initView();

            this._listener.addEventsName(["isCheckedChanged"]);

            this.listVm.on("isCheckedChanged", this.checkedChangedHandler, this);
            this.listVm.on("pageloaded", this.onPageLoaded, this);

            this.$controllersManager.formController.on("formTemplateupdated", this.formTemplateUpdatedHandler, this);
            this.$controllersManager.mainController.on("multiactioncloserequested", this.formTemplateUpdatedHandler, this);

            $scope.$on("$destroy", () => {
                this.dispose();
            });
        }

        private _selectedAll: boolean = false;
        private _isIndeterminate: boolean = false;
        private _checkedIds: string[] = [];
        private _screenInfo: ap.misc.ScreenInfo;
        private _isMultiActions: boolean;
        private _archivedItems: string[] = [];
        private _unarchivedItems: string[] = [];
        private _multiActions: ap.viewmodels.home.MultiActionsViewModel;
        private _archiveMultiAction: ap.viewmodels.home.ActionViewModel;
        private _unarchiveMultiAction: ap.viewmodels.home.ActionViewModel;
        private _checkedEntityArr: ap.models.forms.FormTemplate[] = [];
        private _checkedFormTemplateIdsArr: string[];
    }
}