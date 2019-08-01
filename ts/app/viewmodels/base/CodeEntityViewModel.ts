module ap.viewmodels {
    export class CodeEntityViewModel extends EntityViewModel {

        /**
         * Determines whether the view model is valid or not
         */
        protected validate(): boolean {
            let isCodeValid = !StringHelper.isNullOrWhiteSpace(this.code);
            if (isCodeValid && this.codeMaxLength) {
                isCodeValid = this.code.length <= this.codeMaxLength;
            }

            let isDescriptionValid = !StringHelper.isNullOrWhiteSpace(this.description);
            if (isDescriptionValid && this.descriptionMaxLength) {
                isDescriptionValid = this.description.length <= this.descriptionMaxLength;
            }

            return isCodeValid && isDescriptionValid && !this.isDuplicated;
        }

        /**
         * This method performs a validation of the view models and memorizes results of this validation.
         * Once this method is finished its work check the _isValid property to determine whether the view
         * model is valid of not.
         */
        protected checkIsValid() {
            let validationResult = this.validate();
            this.setIsValid = validationResult;
        }

        /**
         * Public property code
         */
        public get code(): string {
            return this._code;
        }

        public set code(_code_: string) {
            if (_code_ !== this.code) {
                let code: string = this._code;
                this._code = this.codeMaxLength && _code_ ? _code_.substring(0, this.codeMaxLength) : _code_;

                this.checkIsValid(); // called for check value isValid after set
                this.raisePropertyChanged("code", code, this);
            }
        }

        /**
         * Public property description
         */
        public get description(): string {
            return this._description;
        }

        public set description(_description_: string) {
            if (_description_ !== this.description) {
                let description: string = this._description;
                this._description = this.descriptionMaxLength && _description_ ? _description_.substring(0, this.descriptionMaxLength) : _description_;

                this.checkIsValid(); // called for check value isValid after set
                this.raisePropertyChanged("description", description, this);
            }
        }

        /**
         * Public getter to fullName
         */
        public get fullName(): string {
            return this._fullName;
        }

        /**
         * Code maximum length property
         */
        public get codeMaxLength(): number {
            return this._codeMaxLength;
        }

        /**
         * Sets a maximum allowed length of the code property.
         * @param length a maximum amount of characters the code property is allowed to hold
         */
        protected setCodeMaxLength(length: number): void {
            this._codeMaxLength = length;
        }

        /**
         * Description maximum length property
         */
        public get descriptionMaxLength(): number {
            return this._descriptionMaxLength;
        }

        /**
         * Sets a maximum allowed length of the description property.
         * @param length a maximum amount of characters the description property is allowed to hold
         */
        protected setDescriptionMaxLength(length: number): void {
            this._descriptionMaxLength = length;
        }

        /**
         * Initialize the properties
         */
        protected initData() {
            this.defaultData();
        }

        /**
         * Fills the view model with default data
         */
        private defaultData() {
            this._code = "";
            this._description = "";
            this._fullName = "";
        }

        /**
         * Initialize the properties with the entitie's data
         */
        protected buildProperty(): void {
            if (this._originalEntity) {
                let entity: any = this._originalEntity;
                if (entity.Code)
                    this._code = entity.Code;
                if (entity.Description)
                    this._description = entity.Description;
            }
        }

        postChanges() {
            super.postChanges();
            if (this._originalEntity) {
                let entity: any = this._originalEntity;
                if (entity.Code)
                    entity.Code = this._code;
                if (entity.Description)
                    entity.Description = this._description;
            }
        }

        /**
         * Build compute the fullname property value
         */
        protected buildFullName(): void {
            if (!StringHelper.isNullOrEmpty(this.code)
                && !StringHelper.isNullOrEmpty(this.description)) {
                this._fullName = "[" + this.code + "] " + this.description;
            } else if (!StringHelper.isNullOrEmpty(this.code)) {
                this._fullName = "[" + this.code + "]";
            } else if (!StringHelper.isNullOrEmpty(this.description)) {
                this._fullName = this.description;
            } else {
                this._fullName = "";
            }
        }

        public copySource(): void {
            super.copySource();
            this.buildProperty();
            this.buildFullName();
        }

        constructor(utility: ap.utility.UtilityHelper, parentListVm?: BaseListEntityViewModel, itemParameters?: ItemConstructorParameter) {
            super(utility, parentListVm, itemParameters ? itemParameters.itemIndex : null);
            this.defaultData();
        }

        private _code: string;
        private _description: string;
        private _fullName: string;
        private _codeMaxLength: number;
        private _descriptionMaxLength: number;
    }
}