module ap.viewmodels {

    export interface IEntityViewModel extends utility.IListener {
        originalEntity: ap.models.Entity;
        parentEntity: ap.models.Entity;
        isValid(): boolean;
        isDataOk: boolean;
        isSelected: boolean;
        isChecked: boolean;
        canChecked: boolean;
        defaultChecked: boolean;
        isDuplicated: boolean;
        index: number;
        parentList: BaseListEntityViewModel;
        dispose(): void;
        copySource(): void;
        cancel(): void;
        postChanges(): void;
        init(entity: ap.models.Entity, parentEntity?: ap.models.Entity): void;
        computeIsDataOk(): void;
    }

    export class EntityViewModel implements IEntityViewModel {
        // Properties
        public get originalEntity(): ap.models.Entity {
            return this._originalEntity;
        }

        public get parentEntity(): ap.models.Entity {
            return this._parentEntity;
        }

        protected setOriginalEntity(entity: ap.models.Entity, parentEntity?: ap.models.Entity) {
            if (parentEntity) {
                this._parentEntity = parentEntity;
            }
            if (entity !== this.originalEntity) {
                this._originalEntity = entity;
            }
            this.copySource();
            this.computeIsDataOk();
            this.checkIsValid();
        }

        public init(entity: ap.models.Entity, parentEntity?: ap.models.Entity) {
            this.setOriginalEntity(entity, parentEntity);
        }

        public get isDataOk(): boolean {
            return this._isDataOk;
        }

        /*
        * Property to know/set the selected ViewModel
        */
        public get isSelected(): boolean {
            return this._isSelected;
        }

        /**
        * This method return _isValid value
        */
        isValid(): boolean {
            return this._isValid;
        }

        /**
        * This method set isValid property if property is different
        / @param isValid boolean property for change isValid value
        **/
        protected set setIsValid(isValid: boolean) {
            if (isValid !== this._isValid) {
                this._isValid = isValid;
                this.raisePropertyChanged("isValid", isValid, this);
            }
        }

        /**
        * This is abstract method for check is property valid
        **/
        protected checkIsValid() {
            this._isValid = true;
        }

        public set isSelected(selected: boolean) {
            this._isSelected = selected;
        }

        /*
        * Property to know if the entity is disabled or not
        */
        public get isDisabled(): boolean {
            return this._isDisabled;
        }

        public set isDisabled(val: boolean) {
            this._isDisabled = val;
        }

        /*
        * Public accessor to know the index of the ViewModel
        */
        public get index(): number {
            return this._index;
        }

        public set index(i: number) {
            this._index = i;
        }

        public get parentList(): BaseListEntityViewModel {
            return this._parentVm;
        }

        /**
        * Method use to know if there is more than once item
        **/
        public get isDuplicated(): boolean {
            return this._isDuplicated;
        }

        /**
        * Method use to set true if there is more than once item
        **/
        public set isDuplicated(isDupliccated: boolean) {
            this._isDuplicated = isDupliccated;
            this.checkIsValid();
        }

        /**
        * Method use to get the result of computeHasChanged()
        **/
        public get hasChanged(): boolean {
            return this.computeHasChanged();
        }

        /**
        * Method use to know if the view model has changed
        **/
        protected computeHasChanged(): boolean {
            if (this.originalEntity.IsNew) {
                return true;
            }
            return false;
        }

        /**
         * This property will be used for multi selection to know if an entity has been checked or not
         **/
        public get isChecked(): boolean {
            return this._isChecked;
        }

        public set isChecked(value: boolean) {
            if (this._isChecked !== value) {
                let originalIsChecked = this._isChecked;
                this._isChecked = value;
                this.raisePropertyChanged("isChecked", originalIsChecked, this);
            }
        }

        public set defaultChecked(value: boolean) {
            this._isChecked = value;
        }

        /**
        * This property in order to know whether this item can be checked
        **/
        public get canChecked(): boolean {
            return true;
        }

        // Public methods
        dispose(): void {
            this._listener.clear();
        }

        /*
        * This function is used to update the ViewModel's properties with the entity
        */
        copySource(): void {
        }

        /*
        * This function is to reset the modifications made to the ViewModel
        */
        cancel(): void {
            this.copySource();
            this.checkIsValid();
        }

        /*
        * This function is used to update the entity's properties with the ViewModel
        */
        postChanges(): void {

        }

        computeIsDataOk(): void {
            this._isDataOk = true;
        }

        /**
        * This method is used to get the list id of the list entityviewmodel
        * @param entitiesVm is the list vm need to get id
        **/
        static getIdList(entitiesVm: IEntityViewModel[]): string[] {
            let result: string[] = [];
            if (entitiesVm && entitiesVm !== null && entitiesVm.length > 0) {
                for (let i = 0; i < entitiesVm.length; i++) {
                    let vm: IEntityViewModel = entitiesVm[i];
                    if (vm.originalEntity && vm.originalEntity !== null)
                        result.push(vm.originalEntity.Id);
                }
            }
            return result;
        }

        on(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.on(eventName, callback, caller);
        }
        off(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.off(eventName, callback, caller);
        }

        /**
         * Raises a propertychanged event with the given parameters
         * @param propertyName a name of the changed property
         * @param oldValue an old value of the changed property
         * @param caller an object which raises the event
         */
        protected raisePropertyChanged(propertyName: string, oldValue: any, caller: any): void {
            let args: ap.viewmodels.base.PropertyChangedEventArgs = new ap.viewmodels.base.PropertyChangedEventArgs(propertyName, oldValue, caller);
            this._listener.raise("propertychanged", args);
        }

        /*
        * Constructor of EntityViewModel.  This class is used to create a ViewModel from an Entity.
        * The entity cannot be set here to avoid to call other methods in the constructor that can be overriden in children classes (because it's to avoid with JS)
        * @param {UtilityHelper} $utillity Utility tools
        * @param {BaseListEntityViewModel} [parentListVm] The list of the item
        * @param {number} [index] The index of the item in the list
        */
        constructor(protected $utility: utility.UtilityHelper, parentListVm?: BaseListEntityViewModel, index?: number) {
            this._eventHelper = this.$utility.EventTool;
            this._parentVm = parentListVm;
            this._index = index;
            this._originalEntity = null;
            this._parentEntity = null;
            this._isDataOk = true;
            this._isSelected = false;
            this._isChecked = false;
            this._listener = this._eventHelper.implementsListener(["propertychanged"]);
            this._isDuplicated = false;
            this._isValid = true;
        }

        protected _listener: ap.utility.IListenerBuilder;
        protected _eventHelper: ap.utility.EventHelper;
        protected _originalEntity: ap.models.Entity;
        protected _parentEntity: ap.models.Entity;
        protected _isDisabled: boolean = false;
        protected _index: number = 0;
        protected _isSelected: boolean;
        private _isDataOk: boolean;
        private _parentVm: BaseListEntityViewModel;
        private _isChecked: boolean;
        private _isDuplicated: boolean;
        protected _isValid: boolean;
    }
}