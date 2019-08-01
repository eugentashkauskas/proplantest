module ap.viewmodels.reports {

    /*export class ColumnDroppedEvent {
        constructor(public departPos: number, public destPos: number) {
        }
    }*/

    export class ReportColumnViewModel implements IDispose, ap.component.dragAndDrop.IDraggableEntityViewModel {
        public get propertyName(): string {
            return this._propertyName;
        }
        public set propertyName(propertyName: string) {
            this._propertyName = propertyName;
        }
        public get displayOrder(): number {
            return this._displayOrder;
        }
        public set displayOrder(displayOrder: number) {
            this._displayOrder = displayOrder;
        }

        public get dragId() {
            return this._propertyName;
        }

        public allowDrag() {
            return this.isChecked === true;
        }

        public drop(dropTarget: ap.component.dragAndDrop.IDraggableEntityViewModel): boolean {
            if (dropTarget)
                this._listener.raise("isdropped", new ap.component.dragAndDrop.DropEntityEvent(this, dropTarget));
            return false;
        }

        public moveUp() {
            this._listener.raise("moveuprequested", this.propertyName);
        }

        public moveDown() {
            this._listener.raise("movedownrequested", this.propertyName);
        }

        /**
        * Bind to check box on list to indicated that the column is selected
        **/
        public get isChecked(): boolean {
            return this._isChecked;
        }
        public set isChecked(value: boolean) {
            if (this._isChecked !== value) {
                this._isChecked = value;
                this._listener.raise("ischeckedchanged", this);
            }
        }

        /**
        * Bind to check box (disabled) on list to indicated that the column be unckeched
        **/
        public get canHide(): boolean {
            return this._canHide;
        }
        public set canHide(value: boolean) {
            this._canHide = value;
        }

        /**
        * Bind to list item to indicated that the column can be orderd
        **/
        public get canOrder(): boolean {
            return this._canOrder;
        }
        public set canOrder(value: boolean) {
            this._canOrder = value;
        }

        /**
        * Events methods
        **/
        on(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.on(eventName, callback, caller);
        }
        off(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.off(eventName, callback, caller);
        }

        /**
        * This implements IDispose
        **/
        dispose() {
            this._listener.clear();
        }

        constructor(utility: ap.utility.UtilityHelper) {
            this._eventHelper = utility.EventTool;
            this._listener = this._eventHelper.implementsListener(["ischeckedchanged", "isdropped", "moveuprequested", "movedownrequested"]);
        }
        protected _eventHelper: ap.utility.EventHelper;
        protected _listener: ap.utility.IListenerBuilder;
        private _propertyName: string = null;
        private _displayOrder: number = 0;
        private _isChecked: boolean = false;
        private _canHide: boolean = false;
        private _canOrder: boolean = false;
    }
}