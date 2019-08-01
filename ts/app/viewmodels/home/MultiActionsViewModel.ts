module ap.viewmodels.home {
    export class MultiActionsViewModel implements ap.utility.IListener, IDispose {

        /**
         * This property is to have the list of items ids checked for the multi actions
         **/
        public get itemsChecked(): string[] {
            return this._itemsChecked;
        }

        public set itemsChecked(items: string[]) {
            this._itemsChecked = items;
        }

        /**
         * This property is know available actions for the multi actions
         **/
        public get actions(): ActionViewModel[] {
            return this._actions;
        }

        /**
        * To know have visible actions or not
        **/
        public get hasVisibleActions(): boolean {
            let result: boolean = false;
            if (this._actions && this._actions !== null) {
                for (let i = 0; i < this._actions.length; i++) {
                    let action: ActionViewModel = this._actions[i];
                    if (action.isVisible)
                        return true;
                }
            }
            return result;
        }
        /**
         * This method is to specify that one action was clicked
         * @param actionName this is the name of the action clicked
         **/
        public actionClick(actionName: string) {
            let actionVm = ap.viewmodels.home.ActionViewModel.getAction(this._actions, actionName);
            if (actionVm === null)
                throw new Error("The action '" + actionName + "' does not exist");
            if (!actionVm.isEnabled)
                throw new Error("The action '" + actionName + "' is disabled");
            this._listener.raise("actionClicked", actionName);
        }

        public on(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.on(eventName, callback, caller);
        }

        public off(eventName: string, callback: { (args?): void; }, caller: any) {
            this._listener.off(eventName, callback, caller);
        }

        public dispose() {
            this._listener.clear();
        }

        constructor(private $utility: ap.utility.UtilityHelper, actions: ap.viewmodels.home.ActionViewModel[], itemsCheckedIds?: string[]) {
            if (!actions || actions.length === 0)
                throw new Error("You cannot define a multiactionsViewModel with no actions");

            this._listener = $utility.EventTool.implementsListener(["actionClicked"]);

            this._itemsChecked = !itemsCheckedIds ? [] : itemsCheckedIds;
            this._actions = actions;

        }

        private _listener: ap.utility.IListenerBuilder;
        private _actions: ActionViewModel[] = [];
        private _itemsChecked: string[] = [];
    }
}