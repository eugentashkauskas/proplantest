module ap.viewmodels.forms.viewer {

    interface IFormQuestionObject extends ap.models.Entity {
        Title: string;
        Description: string;
        ItemType: ap.models.forms.FormItemType;
        Template: ap.misc.JsonSchema;
        NotApplicable: boolean;

        // An optional answer to a form question. It is not available for questions of form templates
        Value?: string;
    }


    /**
     * This class represents a form question at the form preview screen. It applies to both FormItem and FormQuestion classes
     * (which represent a question in some form and form template respectivelly).
     */
    export abstract class BaseQuestionPreviewViewModel extends ap.viewmodels.EntityViewModel {
        public Title: string;
        public Description: string;
        public ItemType: ap.models.forms.FormItemType;
        public Template: ap.misc.JsonSchema;
        public NotApplicable: boolean;
        public Value: string;

        public init(entity: IFormQuestionObject) {
            return super.init(entity);
        }

        get originalEntity(): IFormQuestionObject {
            return <IFormQuestionObject>this._originalEntity;
        }

        /**
         * Initializes an empty form item view model
         */
        initData() {
            this.Title = "";
            this.Description = "";
            this.ItemType = null;
            this.Template = null;
            this.NotApplicable = false;
            this.Value = undefined;
        }

        copySource() {
            if (this.originalEntity) {
                this.Title = this.originalEntity.Title;
                this.Description = this.originalEntity.Description;
                this.ItemType = this.originalEntity.ItemType;
                this.Template = this.originalEntity.Template;
                this.NotApplicable = this.originalEntity.NotApplicable;
                this.Value = this.originalEntity.Value;
            } else {
                this.initData();
            }
        }

        constructor(utility: ap.utility.UtilityHelper, $q: angular.IQService, parentListVm?: ap.viewmodels.BaseListEntityViewModel, itemParameters?: ItemConstructorParameter) {
            super(utility, parentListVm, itemParameters ? itemParameters.itemIndex : null);
            this.initData();
        }
    }

}
