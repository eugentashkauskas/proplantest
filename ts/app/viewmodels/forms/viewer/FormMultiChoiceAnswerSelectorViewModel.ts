module ap.viewmodels.forms.viewer {

    /**
     * This view model represents a single answer option which can be selected in the MultiChoiceAnswerSelectorViewModel.
     * It is based on a simple string as there is no model for multichoice answer options.
     */
    class MultiChoiceOptionViewModel extends EntityViewModel {
        /**
         * A public accessor for a label of the option
         */
        get label(): string {
            return this._label;
        }

        /**
         * Creates a new instance of the MultiChoiceOptionViewModel class
         * @param utility an instance of the UtilityHelper service
         * @param label a label of the option
         * @param isChecked an indicator of whether the option is checked by default or not
         */
        constructor(utility: ap.utility.UtilityHelper, label: string, isChecked: boolean) {
            super(utility);
            this._label = label;
            this.defaultChecked = isChecked;
        }

        private _label: string;
    }

    /**
     * This view model allows users to check several items from a list of possible options. Answer options should be provided
     * by derived classes using the initList method. Using this selector view model consumers are able to provide users an
     * ability to select items from a list of strings. It can be used with ng-repeat-based and virtual-repeat-based components.
     */
    abstract class MultiChoiceAnswerSelectorViewModel implements ap.viewmodels.IVirtualInfiniteRepeat, IDispose, utility.IListener {

        /**
         * Returns an answer option associated with the given index or null if there is no such option.
         * This accessor is meant to be used with virtual-repeat-based components.
         * @param index an index of the item to retrieve
         */
        getItemAtIndex(index: number): MultiChoiceOptionViewModel {
            if (index >= this._sourceItems.length || index < 0) {
                return null;
            }
            return this._sourceItems[index];
        }

        /**
         * Returns an amount of answer options.
         * This accessor is meant to be used with virtual-repeat-based components.
         */
        getLength(): number {
            return this._sourceItems.length;
        }

        /**
         * Returns a list of all answer options.
         * THis accessor is meant to be used with ng-repeat-based components.
         */
        get sourceItems(): MultiChoiceOptionViewModel[] {
            return this._sourceItems;
        }

        /**
         * Returns a list of checked answer options
         */
        get checkedOptions(): string[] {
            let checkedOptions = this._sourceItems.filter((option) => { return option.isChecked; });
            let uniqueCheckedOptions = checkedOptions.filter((item, index, array) => { return array.indexOf(item) === index; });
            return uniqueCheckedOptions.map((option) => { return option.label; });
        }

        /**
         * Returns a string which represents a set of checked answer options
         */
        get checkedOptionsText(): string {
            return this._checkedOptionsText;
        }

        /**
         * Retrieves a text which represents the given answer option
         * @param item an answer option to retrieve a text-based representation
         */
        getOptionText(item: MultiChoiceOptionViewModel) {
            return item ? item.label : "";
        }

        on(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.on(eventName, callback, caller);
        }

        off(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.off(eventName, callback, caller);
        }

        dispose() {
            this._listener.clear();
            this.disposeSourceItems();
        }

        /**
         * Disposes a list of answer options
         */
        private disposeSourceItems() {
            if (this._sourceItems) {
                for (let item of this._sourceItems) {
                    item.off("propertychanged", this.onItemPropertyChanged, this);
                    item.dispose();
                }
                this._sourceItems = null;
            }
        }

        /**
         * An event handler for the propertychanged event of answer option view models
         * @param args event arguments
         */
        protected onItemPropertyChanged(args: ap.viewmodels.base.PropertyChangedEventArgs) {
            if (args.propertyName !== "isChecked") {
                return;
            }

            this._checkedOptionsText = this.checkedOptions.join(", ");
            this._listener.raise("selectionchanged");
        }

        /**
         * Initializes a list of answer options
         * @param options a list of all available answer options
         * @param checkedOptions a list of checked answer options
         */
        protected initList(options: string[], checkedOptions: string[]) {
            this.disposeSourceItems();
            this._sourceItems = [];

            for (let option of options) {
                let viewModel = new MultiChoiceOptionViewModel(this.utility, option, checkedOptions.indexOf(option) !== -1);
                viewModel.on("propertychanged", this.onItemPropertyChanged, this);

                this._sourceItems.push(viewModel);
            }

            this._checkedOptionsText = this.checkedOptions.join(", ");
        }

        constructor(private utility: ap.utility.UtilityHelper) {
            this._listener = this.utility.EventTool.implementsListener(["selectionchanged"]);
            this._sourceItems = [];
        }

        protected _listener: ap.utility.IListenerBuilder;
        protected _sourceItems: MultiChoiceOptionViewModel[];
        protected _checkedOptionsText: string;
    }

    /**
     * This selector view model allows users to select several answer options for multichoice answer on a form and
     * a form template preview screens
     */
    export class FormMultiChoiceAnswerSelectorViewModel extends MultiChoiceAnswerSelectorViewModel {

        protected onItemPropertyChanged(args: ap.viewmodels.base.PropertyChangedEventArgs) {
            this.question.Value = JSON.stringify(this.checkedOptions);
            return super.onItemPropertyChanged(args);
        }

        constructor(utility: ap.utility.UtilityHelper, private question: BaseQuestionPreviewViewModel) {
            super(utility);

            let options = question.Template.availableChoices;
            let checkedOptions = question.Value ? JSON.parse(question.Value) : [];
            this.initList(options, checkedOptions);
        }

    }

}
