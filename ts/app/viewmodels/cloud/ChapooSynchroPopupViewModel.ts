module ap.viewmodels.cloud {

    export class ChapooSynchroPopupViewModel {

        /**
        * Used to know which project is selected
        **/
        public get projectSelected(): ChapooProjectViewModel {
            return this._projectSelected;
        }

        /**
        * Used to know which folder is selected
        **/
        public get folderSelected(): ChapooFolderViewModel {
            return this._folderSelected;
        }

        public set folderSelected(folder: ChapooFolderViewModel) {
            if (this._folderSelected) {
                this._folderSelected.isSelected = false;
            }
            this._folderSelected = folder;
            this._folderSelected.isSelected = true;
        }

        /**
        * Used to know the list of projects
        **/
        public get projects(): cloud.ChapooProjectViewModel[] {
            return this._projects;
        }

        /**
        * Used to know the list of folders
        **/
        public get folders(): cloud.ChapooFolderViewModel[] {
            return this._folders;
        }

        /**
        * Used to know the aproplan folder is already sync with a chapoo folder
        **/
        public get isSync(): boolean {
            return this._isSync;
        }

        /**
        * Used to know the sync infos
        **/
        public get syncInfo(): string[] {
            return this._syncInfo;
        }

        /**
        * the server's name
        **/
        public get server(): string {
            return this._server;
        }

        public set server(server: string) {
            this._server = server;

            this.checkIsConnectionInfoValid();
        }

        /**
        * The chapoo login
        **/
        public get user(): string {
            return this._user;
        }

        public set user(user: string) {
            this._user = user;

            this.checkIsConnectionInfoValid();
        }

        /**
        * The chapoo password
        **/
        public get password(): string {
            return this._password;
        }

        public set password(password: string) {
            this._password = password;

            this.checkIsConnectionInfoValid();
        }

        /**
        * Used to know if all fields requested for the chapoo connection are filled
        **/
        public get isConnectionInfoValid(): boolean {
            return this._isConnectionInfoValid;
        }

        /**
        * Method used to clos the chapoo popup
        * @param isCancel boolean if the popup is closed by cancel ne need to raise event (used to refresh the list)
        **/
        public close(isCancel: boolean = false) {
            if (this._cookies) {
                this._servicesManager.cloudService.logoutChapoo(this.server, this._cookies).then((result) => {
                    if (!isCancel) {
                        this._listener.raise("popupclosed");
                    }
                    this.$mdDialog.hide();
                });
            } else {
                if (!isCancel) {
                    this._listener.raise("popupclosed");
                }
                this.$mdDialog.hide();
            }
        }

        /**
         * Set isConnectionInfoValid property based on the server url, user and password fields values
         */
        private checkIsConnectionInfoValid() {
            this._isConnectionInfoValid = !StringHelper.isNullOrWhiteSpace(this.server) && !StringHelper.isNullOrWhiteSpace(this.user) && !StringHelper.isNullOrWhiteSpace(this.password);
        }

        /**
        * Used to open the chapoo connection popup
        **/
        public change() {
            let importController = ($scope: angular.IScope, $timeout: angular.ITimeoutService) => {
                $scope["chapooSynchroPopupViewModel"] = this;
            };
            importController.$inject = ["$scope", "$timeout"];
            this.$mdDialog.show({
                clickOutsideToClose: false,
                preserveScope: true,
                templateUrl: "me/PartialView?module=Cloud&name=ChapooServerConnectionPopup",
                fullscreen: true,
                controller: importController
            });
        }

        /**
        * Used to open the list of projects of chapoo popup
        **/
        public openChapooProjects() {
            let importController = ($scope: angular.IScope, $timeout: angular.ITimeoutService) => {
                $scope["chapooSynchroPopupViewModel"] = this;
            };
            importController.$inject = ["$scope", "$timeout"];
            this.$mdDialog.show({
                clickOutsideToClose: false,
                preserveScope: true,
                templateUrl: "me/PartialView?module=Cloud&name=ChapooChooseFolder",
                fullscreen: true,
                controller: importController
            });
        }

        /**
        * Used to connect to chapoo
        **/
        public chapooConnection() {
            this._servicesManager.cloudService.loginChapoo(this.server, this.user, this.password).then((result) => {
                this._cookies = result;
                this._servicesManager.cloudService.getChapooProject(this.server, this._cookies).then((result) => {
                    for (let i = 0; i < result.length; i++) {
                        let project: ChapooProjectViewModel = new ChapooProjectViewModel(this._utility);
                        project.createByJson(result[i]);
                        this.projects.push(project);
                    }
                });
                this.openChapooProjects();
            }, (error) => {
                this._controllersManager.mainController.showError(this._utility.Translator.getTranslation("chapoo.connection"), this._utility.Translator.getTranslation("Connection error"), "", null);
            });
        }

        /**
        * Used to load the list of folders
        * @param project ChapooProjectViewModel the project we want to load the folders
        **/
        public loadFolders(project: ChapooProjectViewModel) {
            if (this._projectSelected === null || this._projectSelected.id !== project.id) {
                if (this._projectSelected) {
                    this._projectSelected.isSelected = false;
                }
                this._projectSelected = project;
                this._projectSelected.isSelected = true;
                this._servicesManager.cloudService.getChapooFolder(this.server, this._cookies, project.id).then((result) => {
                    for (let i = 0; i < result.length; i++) {
                        let folder: ChapooFolderViewModel = new ChapooFolderViewModel(this._utility);
                        folder.createByJson(result[i]);
                        this.folders.push(folder);
                    }
                });
            }
        }

        /**
        * Used to save a link between an aproplan folder and a chapoo folder
        **/
        public save() {
            this._servicesManager.cloudService.saveFolderSync(this.server, models.cloud.SynchroType.Chapoo, this._folder.Id, this.folderSelected.id, this.user, this.password).then((result) => {
                this.close();
            });
        }

        /**
        * Used to remove a link between an aproplan folder and a chapoo folder
        **/
        public remove() {
            this._servicesManager.cloudService.removeChapooLink(this._folder.Id).then((result) => {
                this.close();
            });
        }

        on(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.on(eventName, callback, caller);
        }
        off(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.off(eventName, callback, caller);
        }

        constructor(private _utility: ap.utility.UtilityHelper, private $mdDialog: angular.material.IDialogService, private _servicesManager: ap.services.ServicesManager, private _controllersManager: controllers.ControllersManager, private _folder: models.projects.Folder) {
            this._listener = this._utility.EventTool.implementsListener(["popupclosed"]);

            // call the API to know if the current APROPLAN folder is synchronized
            this._servicesManager.cloudService.getFolderSyncInfo(this._folder.Id).then((result) => {
                if (result && result.length > 0) {
                    this._isSync = true;
                    this._syncInfo = result;
                    if (this._syncInfo[0] !== "Chapoo") {
                        this._isSync = false;
                    }
                }
            });
        }

        private _listener: ap.utility.IListenerBuilder;
        private _server: string = "my.bricsys247.com";
        private _user: string = null;
        private _password: string = null;
        private _isSync: boolean = false;
        private _syncInfo: string[];
        private _cookies: models.cloud.Cookie[];
        private _projects: cloud.ChapooProjectViewModel[] = [];
        private _folders: cloud.ChapooFolderViewModel[] = [];
        private _folderSelected: ChapooFolderViewModel = null;
        private _projectSelected: ChapooProjectViewModel = null;
        private _isConnectionInfoValid: boolean = false;
    }
}