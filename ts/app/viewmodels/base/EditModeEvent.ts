module ap.viewmodels.base {
    /**
    * This class is used as argument when the 'editmodechanged' event is raised
    */
    export class EditModeEvent {
        /**
        * This is the viewModel which raise the editmodechanged event
        **/
        public get vm(): any {
            return this._vm;
        }
        /**
        * This is to know if the entity was a new one which have to be created or not
        **/
        public get wasNewEntity(): boolean {
            return this._wasNewEntity;
        }
        /**
        * This is to know if the user has clicked on the cancel action or not
        **/
        public get isCancelAction(): boolean {
            return this._isCancelAction;
        }
        constructor(private _vm: any, private _wasNewEntity: boolean = false, private _isCancelAction: boolean = false) {
        }
    }
}