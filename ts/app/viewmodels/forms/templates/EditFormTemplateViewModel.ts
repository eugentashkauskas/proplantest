module ap.viewmodels.forms.templates {
    export class EditFormTemplateViewModel {

        /**
         * This public getter is used to get title property
         */
        public get title(): string {
            return this._title;
        }

        /**
         * This public getter is used to get formTemplateItemVM
         */
        public get formTemplateItemVM(): ap.viewmodels.forms.templates.FormTemplateItemViewModel {
            return this._formTemplateItemVM;
        }

        /**
         * This public getter is used to get languageSelector
         */
        public get languageSelector(): ap.viewmodels.identificationfiles.languages.LanguageListViewModel {
            return this._languageSelector;
        }

        /**
         * This is the visibleFormTemplateTypes for selector
        **/
        public get visibleFormTemplateTypes(): KeyValue<ap.models.forms.FormType, string>[] {
            return this._visibleFormTemplateTypes;
        }

        /**
        * This method use for compute visibleFormTemplateTypes
        **/
        private _computevisibleFormTemplateTypes() {
            this._visibleFormTemplateTypes = [
                new KeyValue(ap.models.forms.FormType.Environment, this.$utility.Translator.getTranslation("ap.formTemplateType.Environment")),
                new KeyValue(ap.models.forms.FormType.Quality, this.$utility.Translator.getTranslation("ap.formTemplateType.Quality")),
                new KeyValue(ap.models.forms.FormType.Security, this.$utility.Translator.getTranslation("ap.formTemplateType.Security"))
            ];
        }

        public languageChange(val: ap.viewmodels.identificationfiles.languages.LanguageViewModel) {
            this._formTemplateItemVM.language = (<ap.models.identFiles.Language>val.originalEntity);
        }

        /**
         * Method used to close the popup
         */
        public cancel() {
            this.$mdDialog.hide();
        }

        /*
         * Method used to save changes
         */
        public save() {
            this.formTemplateItemVM.postChanges();
            this.$controllersManager.formController.editFormTemplate(this.formTemplateItemVM.originalTemplate).then(() => {
                this.$mdDialog.hide();
            });
        }

        /**
         * This private method is used to init data
         */
        private init() {
            this._computevisibleFormTemplateTypes();
        }

        constructor(private $utility: ap.utility.UtilityHelper, private $mdDialog: angular.material.IDialogService, private _api: ap.services.apiHelper.Api, private $q: angular.IQService, private $timeout: angular.ITimeoutService, private $scope: angular.IScope, private $controllersManager: ap.controllers.ControllersManager, private _formTemplate: ap.models.forms.FormTemplate) {
            this._formTemplateItemVM = new FormTemplateItemViewModel(this.$utility, $q);
            this._formTemplateItemVM.init(this._formTemplate);
            this._title = this.$utility.Translator.getTranslation("Edit the template");
            this.init();
            this._languageSelector = new ap.viewmodels.identificationfiles.languages.LanguageListViewModel(this.$utility, this.$q, this.$controllersManager.mainController);
            this._languageSelector.load(this._formTemplateItemVM.language.Id);
        }

        private _title: string;
        private _formTemplateItemVM: ap.viewmodels.forms.templates.FormTemplateItemViewModel;
        private _languageSelector: ap.viewmodels.identificationfiles.languages.LanguageListViewModel;
        private _visibleFormTemplateTypes: KeyValue<ap.models.forms.FormType, string>[];
    }
}