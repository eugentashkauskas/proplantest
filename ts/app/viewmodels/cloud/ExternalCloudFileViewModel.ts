module ap.viewmodels.cloud {

    export class ExternalCloudFileViewModel extends ap.viewmodels.TreeEntityViewModel {

        /**
         * Set the external cloud file
         */
        public set canExpand(value: boolean) {
            this._canExpand = value;
        }

        /**
         * Return current cloud file
         */
        public get canExpand(): boolean {
            return this._canExpand;
        }

        /**
         * Return current cloud file
         */
        public get externalCloudFile(): ap.models.cloud.ExternalCloudFile {
            return <ap.models.cloud.ExternalCloudFile>this._originalEntity;
        }

        /**
        * Return cloud folder's expanded status (can be true if cloud file is a folder)
        **/
        public get isExpanded() {
            return this._isExpaned;
        }

        /**
        * Return cloud folder's checked state (can be true if cloud file is a file)
        **/
        public get isCheckedFolder() {
            return this.isChecked;
        }

        /**
        * Set cloud folder's expanded status (can be set if cloud file is a folder)
        **/
        public set isExpanded(isExpanded: boolean) {
            if (this._isExpaned !== isExpanded && this.externalCloudFile.IsDirectory === true) {
                this._isExpaned = isExpanded;
            }
        }

        /**
        * Set cloud folder's checked status (cet be set if cloud file is a file)
        **/
        public set isCheckedFolder(isChecked: boolean) {
            if (this.isChecked !== isChecked && this.externalCloudFile.IsDirectory === false) {
                this.isChecked = isChecked;
            }
        }

        /**
         * Add child to Children list
         * @param child externl cloud file that will be added to Children list
         */
        addChild(child: ap.models.cloud.ExternalCloudFile) {
            if (!this.externalCloudFile.Children)
                this.externalCloudFile.Children = [];
            this.externalCloudFile.Children.push(child);
        }

        copySource() {
            if (this.externalCloudFile) {
                this._isDirectory = this.externalCloudFile.IsDirectory;
            }
        }

        constructor(utility: ap.utility.UtilityHelper) {
            super(utility);
            this._isExpaned = false;
            this.isChecked = false;
            this._canExpand = true;
        }

        private _isExpaned: boolean;
        private _isDirectory: boolean;
        private _canExpand: boolean;
    }
}