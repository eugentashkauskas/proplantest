namespace ap.viewmodels.home {

    export class NavBarItemViewModel implements IDispose {

        /**
         * Updates the title property using the translation system
         */
        private updateTitle() {
            this.title = this.utility.Translator.getTranslation(this.titleKey);
        }

        public dispose() {
            this.utility.Translator.off("languagechanged", this.updateTitle, this);
        }

        constructor(private utility: ap.utility.UtilityHelper, public itemName: string = "",
            public isVisited: boolean = false, public titleKey: string = "", public title: string = "",
            public iconSrc: string = "", public isVisible: boolean = false, public isBeta: boolean = false) {

            if (!this.titleKey) {
                this.titleKey = this.itemName;
            }

            if (!this.title) {
                this.updateTitle();
                this.utility.Translator.on("languagechanged", this.updateTitle, this);
            }
        }
    }
}