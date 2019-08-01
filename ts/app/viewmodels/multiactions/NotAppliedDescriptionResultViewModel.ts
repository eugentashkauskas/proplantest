module ap.viewmodels.multiactions {
    export class NotAppliedDescriptionResultViewModel {
        /**
         * This is the translation key for the title of the popup
         **/
        public get titleKey(): string {
            return this._titleKey || "Some points were skipped";
        }
        /**
         * This is the translation key for the description of the popup
         **/
        public get descriptionKey(): string {
            return this._descriptionKey || "Some points have not been updated.";
        }
        /**
         * This is the list of problem occurs while multi edit request
         **/
        public get items(): NotAppliedDescriptionItemViewModel[] {
            return this._items;
        }

        constructor(private $utility: ap.utility.UtilityHelper, private data: ap.models.multiactions.NotAppliedActionDescription[], private _descriptionKey?: string, private _titleKey?: string) {
            if (data) {
                for (let i = 0; i < data.length; i++) {
                    this._items.push(new ap.viewmodels.multiactions.NotAppliedDescriptionItemViewModel(this.$utility, data[i]));
                }
            }
        }

        private _items: NotAppliedDescriptionItemViewModel[] = [];
    }
}