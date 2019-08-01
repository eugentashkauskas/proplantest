module ap.viewmodels.cloud {

    export class ChapooFolderViewModel {

        /**
         * Get the id of the Chapoo folder
         */
        public get id(): number {
            return this._id;
        }

        /**
         * Get the name of the Chapoo folder
         */
        public get name(): string {
            return this._name;
        }

        /**
         * Get the type of the Chapoo folder
         */
        public get type(): string {
            return this._type;
        }

        /**
         * Get the level of the Chapoo folder
         */
        public get level(): number {
            return this._level;
        }

        /**
         * Get the if of the paren folder
         */
        public get parentId(): number {
            return this._parentId;
        }

        /**
         * Get the children of this folder
         */
        public get children(): ChapooFolderViewModel[] {
            return this._children;
        }

        /**
         * To know/set the selected folder
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
            this._type = json.type ? json.type.toString() : null;
            this._parentId = json.ParentID;
            if (this._parentId !== null) {
                this._level = 1;
            } else {
                this._level = 0;
            }
            let children: ChapooFolderViewModel[] = [];
            if (json.Children) {
                for (let i = 0; i < json.Children.length; i++) {
                    let child: ChapooFolderViewModel = new ChapooFolderViewModel(this._utility);
                    child.createByJson(json.Children[i]);
                    children.push(child);
                }
                this._children = children;
            }
        }

        constructor(private _utility: ap.utility.UtilityHelper) { }

        private _id: number = null;
        private _name: string = null;
        private _type: string = null;
        private _level: number = null;
        private _parentId: number = null;
        private _children: ChapooFolderViewModel[] = [];
        private _isSelected: boolean = false;
    }
}