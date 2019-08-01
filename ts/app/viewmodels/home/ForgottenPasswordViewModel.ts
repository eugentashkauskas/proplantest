module ap.viewmodels.home {

    import ChangePasswordResult = ap.services.ChangePasswordResult;

    export interface IConfirmError {
        typeError: string;
    }

    export class ForgottenPasswordViewModel {
        /**
        * Public property to get the error when the 2 password input by the user are not the same
        */
        public get confirmError(): IConfirmError[] {
            return this._confirmError;
        }

        /**
        * Public property to get the alias of the user
        */
        public get alias(): string {
            return this._alias;
        }

        /**
        * Public property representing the new password input by the user
        */
        public get newpassword(): string {
            return this._newpassword;
        }

        public set newpassword(val: string) {
            this._newpassword = val;
            this.checkCanReset();
            this._confirmError = [];
        }

        /**
        * Public property representing the new password confirmation input by the user
        */
        public get confirmpassword(): string {
            return this._confirmpassword;
        }

        public set confirmpassword(val: string) {
            this._confirmpassword = val;
            this.checkCanReset();
            this._confirmError = [];
        }

        /**
        * Public property to know if the user can reset its password or not
        */
        public get canReset(): boolean {
            return this._canReset;
        }

        private checkCanReset() {
            this._canReset = !StringHelper.isNullOrWhiteSpace(this._newpassword)
                && !StringHelper.isNullOrWhiteSpace(this._confirmpassword);
        }

        /**
        * This method resets the password of the user with the new password he input
        */
        public resetPassword(): boolean {
            this.checkConfirm();
            if (this.canReset) {
                if (this.confirmError.length > 0)
                    return false;
                let me = this;
                let token: string = this.$utility.UserContext.Password();
                this.api.getApiResponse("/rest/changepasswordbytoken?t=" + token, ap.services.apiHelper.MethodType.Put,
                    null, this.newpassword).then((args) => {
                        if (args.data === ChangePasswordResult.OK) {
                            me.mainController.showMessageKey("app.forgottenpwd.change_success", "app.forgottenpwd.change_success_title", (args) => {
                                let app = me.$utility.Storage.Session.get("forgotpwdapp");
                                if (app && app === "silverlight") {
                                    me.$window.location.href = me.$utility.rootUrl;
                                } else {
                                    me.$state.go("login");
                                }
                            });
                        }
                        else {
                            let error = ChangePasswordResult[args.data];
                            me.mainController.showErrorKey("app.err." + error, "Forgot your password?", null, null);
                        }
                    });
                return true;
            }
            else
                return false;
        }

        /**
        * This method checks if the 2 passwords input by the user are the same.
        */
        public checkConfirm() {
            this._confirmError = [];
            if (!StringHelper.isNullOrEmpty(this.confirmpassword) && this.confirmpassword !== this.newpassword)
                this._confirmError.push({ typeError: "app.err.pwdMismatch" });

        }

        public static $inject = ["Utility", "Api", "MainController", "$state", "$window"];
        constructor(private $utility: ap.utility.UtilityHelper, private api: ap.services.apiHelper.Api, private mainController: ap.controllers.MainController,
            private $state: angular.ui.IStateService, private $window: angular.IWindowService) {

            if (this.$utility.UserContext.CurrentUser() !== null)
                this._alias = this.$utility.UserContext.CurrentUser().Alias;

            this._confirmpassword = "";
            this._newpassword = "";
            this.checkCanReset();
        }

        private _alias: string;
        private _newpassword: string;
        private _confirmpassword: string;
        private _canReset: boolean;
        private _confirmError: IConfirmError[];
    }
}