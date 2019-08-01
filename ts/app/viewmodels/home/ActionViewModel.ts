namespace ap.viewmodels.home {

    export class ActionGroupViewModel implements IDispose {

        public get groupTitle() {
            return this._groupTitle;
        }

        public get iconSrc() {
            return this._iconSrc;
        }

        public get actions() {
            return this._actions;
        }

        public dispose() {
            this.$utility.Translator.off("languagechanged", this.updateTitleTranslation, this);
            this._actions.forEach((action: ap.viewmodels.home.ActionViewModel) => {
                action.dispose();
            });
        }

        private updateTitleTranslation() {
            this._groupTitle = this.$utility.Translator.getTranslation(this._nameTranslationKey);
        }

        constructor(private $utility: ap.utility.UtilityHelper, private _nameTranslationKey: string, iconSrc?: string, private _actions: ap.viewmodels.home.ActionViewModel[] = []) {
            this._groupTitle = this.$utility.Translator.getTranslation(this._nameTranslationKey);
            this._iconSrc = iconSrc;
            this.$utility.Translator.on("languagechanged", this.updateTitleTranslation, this);
        }

        private _groupTitle: string;
        private _iconSrc: string;
    }

    export class ActionViewModel implements ap.utility.IListener, IDispose {

        /**
         * This method will check if the a actionName exists in a collection of action ViewModel (action name + sub actions name)
         * @param actions this is the collections of actions viewModel with the subactions
         * @param actionName this is the name of the action for which the check must be done.
         **/
        public static hasActionName(actions: ActionViewModel[], actionName: string): boolean {
            let action = ap.viewmodels.home.ActionViewModel.getAction(actions, actionName);
            return action !== null;
        }

        /**
         * This method will check if the actions contains at least one visible action
         * @param actions this is the collections of actions viewModel with the subactions
         **/
        public static hasVisibleActions(actions: ActionViewModel[]): boolean {
            for (let i = 0; i < actions.length; i++)
                if (actions[i].isVisible)
                    return true;
            return false;
        }

        /**
         * This method will check if the a actionName exists in a collection of action ViewModel (action name + sub actions name) to return it
         * @param actions this is the collections of actions viewModel with the subactions
         * @param actionName this is the name of the action for which the check must be done.
         **/
        public static getAction(actions: ActionViewModel[], actionName: string): ap.viewmodels.home.ActionViewModel {
            if (!actions || actions.length === 0) return null;
            let actionVm: ap.viewmodels.home.ActionViewModel;
            for (let i = 0; i < actions.length; i++) {
                actionVm = actions[i];
                if (actionVm.name === actionName)
                    return actionVm;
                let sub = actionVm.getSubAction(actionName);
                if (sub !== null)
                    return sub;
            }
            return null;
        }

        public get isSubAction(): boolean {
            return this._isSubAction;
        }
        public get name(): string {
            return this._name;
        }

        public get title(): string {
            return this._title;
        }

        public get translationKey(): string {
            return this.$utility.Translator.getTranslation(this._translationKey);
        }

        public get iconSrc(): string {
            return this._iconSrc;
        }

        public set iconSrc(value: string) {
            if (this._iconSrc !== value) {
                this._iconSrc = value;
                this._listener.raise("actionstatechanged", new ActionStateChangedEvent(this.name, "iconSrc", this._iconSrc));
            }
        }

        public get isVisible(): boolean {
            return this._isVisible;
        }

        public set isVisible(value: boolean) {
            if (this._isVisible !== value) {
                this._isVisible = value;
                this._listener.raise("actionstatechanged", new ActionStateChangedEvent(this.name, "isVisible", this._isVisible));
            }
        }

        public get isEnabled(): boolean {
            return this._isEnabled;
        }

        public set isEnabled(value: boolean) {
            if (this._subActions && this._subActions.length > 0) {
                for (let i = 0; i < this._subActions.length; i++) {
                    this._subActions[i].isEnabled = value;
                }
            }
            if (this._isEnabled !== value) {
                this._isEnabled = value;
                this._listener.raise("actionstatechanged", new ActionStateChangedEvent(this.name, "isEnabled", this._isEnabled));
            }
        }

        public get isFileDialogRequest(): boolean {
            return this._isFileDialogRequest;
        }


        public get subActions(): Array<SubActionViewModel> {
            return this._subActions.slice();
        }

        /**
         * This property specifies if the action contains at least one subaction
         **/
        public get hasSubActions(): boolean {
            return this._subActions.length > 0;
        }

        /**
         * This method specifies if the action contains a sub action with the specified name
         * @param name the name of the subaction to find
         **/
        public hasSubAction(name: string) {
            return this.getSubAction(name) !== null;
        }

        /**
         * This method returns the sub action equals to the specified name. if not found, null is returned
         * @param name the name of the subaction to find
         **/
        public getSubAction(name: string): SubActionViewModel {
            for (let i = 0; i < this._subActions.length; i++) {
                if (this._subActions[i].name === name) {
                    return this._subActions[i];
                }
            }
            return null;
        }

        /**
         * This property is to specify that the action are a fake one just to display subactions. This action has no effect.
         **/
        public get hasOnlySubActions(): boolean {
            return this._hasOnlySubActions;
        }

        public set hasOnlySubActions(val: boolean) {
            if (this._hasOnlySubActions !== val) {
                this._hasOnlySubActions = val;
                this._listener.raise("actionstatechanged", new ActionStateChangedEvent(this.name, "hasOnlySubActions", this._hasOnlySubActions));
            }
        }

        public getSelectedSubActions(): SubActionViewModel {
            for (let i: number = 0; i < this._subActions.length; i++) {
                if (this._subActions[i].isSelected === true)
                    return this._subActions[i];
            }
            return null;
        }

        public addSubActions(subactions: Array<SubActionViewModel>);
        public addSubActions(subaction: SubActionViewModel);
        public addSubActions(name: string, iconSrc: string, isVisible: boolean, isSelectable: boolean, isSelected: boolean);
        public addSubActions(args: any, iconSrc: string = "", isVisible: boolean = false, isSelectable: boolean = true, isSelected: boolean = false) {
            if (args instanceof Array) {
                let oneSelected = this.getSelectedSubActions() !== null;
                for (let idx: number = 0; idx < args.length; idx++) {
                    let sub = args[idx];
                    if (sub.isSelected === true) {
                        if (oneSelected === true)
                            sub.isSelected = false;
                        else
                            oneSelected = true;
                    }
                    this.addSelectedChangedHandler(sub);
                    this._subActions.push(sub);
                }
                this._listener.raise("subactionadded", args);
            }
            else if (args instanceof SubActionViewModel) {
                this.addSubActions([args]);
            } else {
                if (!iconSrc) iconSrc = "";
                if (!isVisible) isVisible = false;
                if (!isSelectable) isSelectable = false;
                if (!isSelected) isSelected = false;
                this.addSubActions(new SubActionViewModel(this.$utility, this.EventHelper, args, iconSrc, isVisible, isSelectable, isSelected));
            }
        }

        public clearSubActions() {
            let sub: SubActionViewModel;
            for (let i = 0; i < this._subActions.length; i++) {
                sub = this._subActions[i];
                this.removeSelectedChangedHandler(sub);
            }
            this._subActions = [];
        }

        on(eventName: string, callback: { (param?: any): void; }, caller: any): void {
            this._listener.on(eventName, callback, caller);
        }

        off(eventName: string, callback: { (param?: any): void; }, caller: any): void {
            this._listener.off(eventName, callback, caller);
        }

        public dispose() {
            this.clearSubActions();
            this._listener.clear();
            this.$utility.Translator.off("languagechanged", this.updateTitleTranslation, this);
        }

        private addSelectedChangedHandler(sub: SubActionViewModel) {
            sub.on("actionstatechanged", this.selectedChanged, this);
        }

        private removeSelectedChangedHandler(sub: SubActionViewModel) {
            sub.off("actionstatechanged", this.selectedChanged, this);
        }

        private selectedChanged(event: ActionStateChangedEvent) {
            if (event.propertyName === "isSelected") {
                let sub: SubActionViewModel;
                if (event.value === true) {  // when a action becomes selected, need to check if there are others selected and put them to false if found
                    for (let i = 0; i < this._subActions.length; i++) {
                        sub = this._subActions[i];
                        if (sub.name !== event.actionName && sub.isSelected === true)
                            sub.isSelected = false;
                    }
                }
            }
        }

        /**
        * This property returns attached shortcut to this action.
        **/
        public get shortcut(): ap.misc.Shortcut {
            return this._shortcut;
        }

        /**
        * This property returns mark when changed action
        **/
        public get markAsChanged(): boolean {
            return this._markAsChanged;
        }

        /**
        * This is used to know if we need to display a border bottom
        **/
        public get needBorderBottom(): boolean {
            return this._needBorderBottom;
        }

        /**
        * This public getter is used for getting value of isForPanelReguest property
        **/
        public get isForPanelReguest(): boolean {
            return this._isForPanelReguest;
        }

        /**
         * Updates a translation of the action title
         */
        private updateTitleTranslation() {
            this._title = this.$utility.Translator.getTranslation(this._translationKey);
        }

        constructor(private $utility: ap.utility.UtilityHelper, protected EventHelper: ap.utility.EventHelper, name: string = "", iconSrc: string = "", isVisible: boolean = false,
            subActions: Array<SubActionViewModel> = [], translationKey: string = null, isEnabled: boolean = false, isFileDialogRequest: boolean = false, shortcut: ap.misc.Shortcut = null, markAsChanged: boolean = false, needBorderBottom: boolean = false, isForPanelReguest: boolean = false) {
            this._listener = this.EventHelper.implementsListener(["subactionadded", "actionstatechanged"]);
            this._name = name;
            this._iconSrc = iconSrc;
            this._isVisible = isVisible;
            this._isEnabled = isEnabled;
            this._isFileDialogRequest = isFileDialogRequest;
            this._subActions = subActions === null || subActions === undefined ? [] : subActions.slice();
            this._isForPanelReguest = isForPanelReguest;

            if (translationKey === null || translationKey === undefined) {
                this._translationKey = name;
            } else {
                this._translationKey = translationKey;
            }
            this.updateTitleTranslation();

            this._shortcut = shortcut;

            let oneSelected: boolean = false;
            let sub: SubActionViewModel;
            for (let i = 0; i < this._subActions.length; i++) {
                sub = this._subActions[i];
                sub._isEnabled = this._isEnabled;
                if (sub.isSelected === true) {
                    if (oneSelected)
                        this._subActions[i].isSelected = false;
                    else
                        oneSelected = true;
                }
                this.addSelectedChangedHandler(sub);
            }
            this._markAsChanged = markAsChanged;
            this._needBorderBottom = needBorderBottom;
            this.$utility.Translator.on("languagechanged", this.updateTitleTranslation, this);
        }
        protected _isSubAction: boolean = false;
        protected _hasOnlySubActions: boolean = false;
        protected _translationKey: string;
        protected _title: string;
        protected _listener: ap.utility.IListenerBuilder;
        protected _name: string;
        protected _iconSrc: string;
        protected _isVisible: boolean;
        protected _isEnabled: boolean;
        protected _isFileDialogRequest: boolean;
        protected _subActions: Array<SubActionViewModel>;
        private _shortcut: ap.misc.Shortcut;
        private _markAsChanged: boolean;
        private _needBorderBottom: boolean;
        private _isForPanelReguest: boolean;
    }

    export class SubActionViewModel extends ActionViewModel {
        public get isSelected(): boolean {
            return this._isSelected;
        }

        public get isSelectable(): boolean {
            return this._isSelectable;
        }

        public set isSelected(value: boolean) {
            if (value !== this._isSelected) {
                this._isSelected = value;
                this._listener.raise("actionstatechanged", new ActionStateChangedEvent(this.name, "isSelected", this._isSelected));
            }
        }

        constructor($utility: ap.utility.UtilityHelper, EventHelper: ap.utility.EventHelper, action: string, iconSrc: string = "", isVisible: boolean = false, isSelectable: boolean = true, isSelected: boolean = false, translationKey: string = null,
            isFileDialogRequest: boolean = false, isEnabled: boolean = false, markAsChanged: boolean = false, needBorderBottom: boolean = false) {
            super($utility, EventHelper, action, iconSrc, isVisible, null, translationKey, isEnabled, isFileDialogRequest, null, markAsChanged, needBorderBottom, false);
            this._isSelectable = isSelectable;
            this._isSelected = isSelected;
            this._isSubAction = true;
        }
        private _isSelected: boolean;
        private _isSelectable: boolean;
    }

    export class ActionStateChangedEvent {

        public get actionName() {
            return this._name;
        }

        public get propertyName() {
            return this._propertyName;
        }

        public get value() {
            return this._value;
        }

        constructor(private _name: string, private _propertyName: string, private _value: any) {

        }
    }
}