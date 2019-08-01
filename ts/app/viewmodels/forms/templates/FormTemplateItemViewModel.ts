module ap.viewmodels.forms.templates {

    export class FormTemplateItemParameter extends ItemConstructorParameter {
        public get formController() {
            return this._formController;
        }

        public get companyController() {
            return this._companyController;
        }

        constructor(itemIndex: number, dataSource: any, pageDesc: PageDescription, parameters: LoadPageSuccessHandlerParameter, utility: ap.utility.UtilityHelper, private _companyController: ap.controllers.CompanyController, private _formController: ap.controllers.FormController) {
            super(itemIndex, dataSource, pageDesc, parameters, utility);
        }
    }

    export class FormTemplateItemViewModel extends ap.viewmodels.EntityViewModel {

        /**
        * This property provides a reference to the original form template model the view model is based on
        **/
        public get originalTemplate(): ap.models.forms.FormTemplate {
            return <ap.models.forms.FormTemplate>this.originalEntity;
        }

        /**
        * This property contains a name of the CSS class to apply to DOM in order to display an icon in the Type column
        **/
        public get typeClass(): string {
            return this._typeClass;
        }

        /**
        * This property contains a title of the form template
        **/
        public get title(): string {
            return this._title;
        }

        public set title(val: string) {
            this._title = val;
        }

        /**
        * This property contains a set of language the form template is available in/for
        **/
        public get language(): ap.models.identFiles.Language  {
            return this._language;
        }

        public set language(val: ap.models.identFiles.Language) {
            this._language = val;
        }

        public get type(): number {
            return this._type;
        }

        public set type(val: number) {
            this._type = val;
        }

        /**
        * This property contains an amount of questions in the form template
        * -1 means that this data is not loaded yet.
        **/
        public get questionsCount(): number {
            return this._questionsCount;
        }

        public set questionsCount(num: number) {
            this._questionsCount = num;
        }

        /**
        * This property contains a transformed value of the modification date of the form template (5 min ago, yesterday, 23/04/2017, ...)
        **/
        public get modificationDate(): string {
            return this._modificationDate;
        }

        /**
        * This property contains a displat name of a user, who created the form template
        **/
        public get author(): string {
            return this._author;
        }

        public get isArchived() {
            return this._isArchived;
        }

        public get itemActionsVm() {
            return this._itemActionsVm;
        }

        public copySource() {
            if (this.originalEntity !== null && this.originalEntity !== undefined) {
                this._typeClass = "type" + models.forms.FormType[this.originalTemplate.Type];
                this._title = this.originalTemplate.Subject;
                this._type = this.originalTemplate.Type;
                this._language = this.originalTemplate.Language;
                this._modificationDate = this.originalTemplate.EntityModificationDate.format(DateFormat.StandardWithTime);
                this._author = this.originalTemplate.Creator.DisplayName;
                this._isArchived = this.originalTemplate.IsArchived;
            }
            if (!this._itemActionsVm && this._companyController && this._formController) {
                this._itemActionsVm = new FormTemplateItemActionsViewModel(this.$utility, this._companyController, this._formController, this);
            }
        }

        public postChanges() {
            if (this.originalEntity !== null && this.originalEntity !== undefined) {
                this.originalTemplate.Subject = this._title;
                this.originalTemplate.Type = this._type;
                this.originalTemplate.Language = this._language;
                this.originalTemplate.Creator.DisplayName = this._author;
                this.originalTemplate.IsArchived = this._isArchived;
            }
        }

        dispose() {
            super.dispose();
            if (this._itemActionsVm) {
                this._itemActionsVm.dispose();
            }
        }

        protected setOriginalEntity(entity: ap.models.Entity, parentEntity?: ap.models.Entity) {
            let oldValue = this.originalEntity;
            super.setOriginalEntity(entity, parentEntity);
            this.raisePropertyChanged("originalEntity", this.originalEntity, this);
        }

        protected computeHasChanged(): boolean {
            if ((this.title && this.title !== this.originalTemplate.Subject && this.title.length !== 0) ||
                this.type !== this.originalTemplate.Type ||
                this.language.Code !== this.originalTemplate.Language.Code) {
                return true;
            }
            return false;
        }

        constructor($utility: ap.utility.UtilityHelper, $q: angular.IQService, parentListVm?: ap.viewmodels.BaseListEntityViewModel, itemParameters?: ItemConstructorParameter) {
            super($utility, parentListVm, itemParameters ? itemParameters.itemIndex : null);
            this._listener.addEventsName(["originalEntity"]);
            let itemParams = <FormTemplateItemParameter>itemParameters;
            if (itemParams) {
                this._companyController = itemParams.companyController;
                this._formController = itemParams.formController;
            }
            this._questionsCount = -1;
        }

        private _typeClass: string;
        private _type: number;
        private _title: string;
        private _questionsCount: number;
        private _modificationDate: string;
        private _author: string;
        private _itemActionsVm: FormTemplateItemActionsViewModel;
        private _companyController: ap.controllers.CompanyController;
        private _formController: ap.controllers.FormController;
        private _isArchived: boolean;
        private _language: ap.models.identFiles.Language;
    }
}