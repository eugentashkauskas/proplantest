module ap.viewmodels {
    export class EntityItemViewModel extends CodeEntityViewModel {
        /**
         * Return the complete full name of the item. Code + Description
         **/
        public get displayName(): string {
            return this._displayName;
        }

        /** 
         * To know if the item can be selected - chapter cannot be selected
         **/
        public get isSelectable(): boolean {
            return this._isSelectable;
        }

        /** 
         * To know if the item set system - meeting cannot be selected
         * Example: item for Create new meeting
         **/
        public get isSystemEntity(): boolean {
            return this._isSystemEntity;
        }

        protected buildProperty() {
            super.buildProperty();
            if (!this._originalEntity)
                this._initItemData();
        }

        protected buildFullName() {
            super.buildFullName();
            this._displayName = this.computeDisplayName();
        }

        /**
         * This function should be overrided by children classes to know how to compute the display name of the item
         **/
        protected computeDisplayName(): string {
            let displayName: string;
            if (this._originalEntity) {
                if (!StringHelper.isNullOrEmpty(this.code) && !StringHelper.isNullOrEmpty(this.description))
                    displayName = this.code + " - " + this.description;
                else if (!StringHelper.isNullOrEmpty(this.code))
                    displayName = this.code;
                else if (!StringHelper.isNullOrEmpty(this.description))
                    displayName = this.description;
                else
                    displayName = this.fullName;
            }
            else
                displayName = "";
            return displayName;
        }

        /**
         * This function is used to set the item like selecteable or no
         * @param val new boolean for the property isSelectable
         **/
        protected setSelectable(val: boolean) {
            this._isSelectable = val;
        }

        protected setIsSystem(val: boolean) {
            this._isSystemEntity = val;
        }

        private _initItemData() {
            this._isSelectable = true;
            this._displayName = "";
        }

        constructor($utility: ap.utility.UtilityHelper, $q: angular.IQService, parentList?: BaseListEntityViewModel, itemParameters?: ItemConstructorParameter) {
            super($utility, parentList, itemParameters);
            this._initItemData();
        }


        private _isSelectable: boolean;
        private _isSystemEntity: boolean = false;
        private _displayName: string;
    }
}