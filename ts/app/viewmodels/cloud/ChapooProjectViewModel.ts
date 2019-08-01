module ap.viewmodels.cloud {

    export class ChapooProjectViewModel {

        /**
         * Get the name of the Chapoo project
         */
        public get name(): string {
            return this._name;
        }

        /**
         * Get the id of the Chapoo folder
         */
        public get id(): number {
            return this._id;
        }

        /**
         * To know/set the selected project
         */
        public get isSelected(): boolean {
            return this._isSelected;
        }

        public set isSelected(value: boolean) {
            this._isSelected = value;
        }

        /**
         * Initialize the object based on a JSON string
         * @param json JSON value
         */
        public createByJson(json: any) {
            this._id = json.ID;
            this._name = json.Name;
        }

        constructor(private _utility: ap.utility.UtilityHelper) { }

        private _id: number = null;
        private _isSelected: boolean = false;
        private _name: string = null;
    }
}