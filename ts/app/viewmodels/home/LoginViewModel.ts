namespace ap.viewmodels.home {

    export class LoginViewModel {

        public password: string = "";
        public isRememberMe: boolean = false;
        public mailForgotPassword: string = "";
        private _login: string = "";
        private _redirection: string = null;
        private _needActivationEmail: boolean = false;
        private _hasError: boolean = false;
        private _errorMsg: string = "";
        private _errorCode: string = "";
        private _isPasswordStep: boolean = false;
        private _canSendForgotPwd: boolean = false;

        static $inject = ["Utility", "AuthenticateController", "MainController", "UserService", "$mdDialog", "$scope", "$stateParams", "ToolService"];
        constructor(private _utility: ap.utility.UtilityHelper, private _authenticateController: ap.controllers.AuthenticateController, private _mainController: ap.controllers.MainController,
            private _userService: ap.services.UserService, private $mdDialog: angular.material.IDialogService, private $scope: ng.IScope, private $stateParams: angular.ui.IStateParamsService, private $toolService: ap.services.ToolService) {

            let defaultLogin: string = this._utility.UrlTool.getParam("alias");

            if (defaultLogin !== null) {
                this.login = decodeURIComponent(defaultLogin);
            }
            else {
                let lastUser: any = this._utility.Storage.Local.lastUser();

                if (lastUser !== null && lastUser.CurrentUser) {
                    this.login = (<ap.models.actors.User>lastUser.CurrentUser).Alias;
                    this.password = lastUser.Password;
                    this.processLogin();
                }
                else {
                    let lastLogin: string = this._utility.Storage.Local.lastLogin();
                    if (lastLogin !== null) {
                        this.login = lastLogin;
                    }
                }
            }

            this._authenticateController.logout();

            if (this.login) {
                this.goToPasswordStep();
            }
        }

        /**
         * To know if the account needs to be activateed
         */
        get needActivationEmail(): boolean {
            return this._needActivationEmail;
        }

        /**
         * To know if there is an error
         */
        get hasError(): boolean {
            return this._hasError;
        }

        /**
         * Get the error message
         */
        get errorMsg(): string {
            return this._errorMsg;
        }

        /**
         * To know if the screen is in the input password step
         */
        get isPasswordStep(): boolean {
            return this._isPasswordStep;
        }

        /**
         * login property
         */
        get login(): string {
            return this._login;
        }

        set login(login: string) {
            this._login = login;
            this._canSendForgotPwd = this.login !== undefined && this.login !== "";
        }

        /**
         * To know if the forgot password email can be send
         */
        get canSendForgotPwd(): boolean {
            return this._canSendForgotPwd;
        }

        /**
         * To know if the passwird has changed
         */
        changedPassword(): void {
            if (this._isPasswordStep && this._errorMsg && !this.password && this._errorCode === "Authenticate_InvalidUserOrPass")
                this._errorMsg = "";
        }

        /**
         * Resets the password when the login has changed
         */
        changedLogin(): void {
            if (this.password) {
                this.password = "";
                this._errorMsg = "";
            }
        }

        /**
         * To know if its possible to click on the login button with the current info
         */
        canLogin(): boolean {
            let undef = this.login === undefined;
            return this.login !== undefined && this.password !== undefined && this.login.trim() !== "" && this.password.trim() !== "";
        }

        init(): void {
            this._redirection = this._utility.UrlTool.getParam("redirection");
        }

        /**
         * Opens the popup to input the email address for which the password should be reset
         */
        forgotPassword(): void {
            let self: ap.viewmodels.home.LoginViewModel = this;
            this.mailForgotPassword = this.login;

            let forgotPassordController = ($scope: angular.IScope, $mdDialog: angular.material.IDialogService) => {
                $scope["loginVm"] = self;
                $scope["acceptDialog"] = () => {
                    $mdDialog.hide();
                    self.sendForgotPwd();
                };
                $scope["cancelDialog"] = () => {
                    $mdDialog.cancel();
                };
            };
            forgotPassordController.$inject = ["$scope", "$mdDialog"];
            this.$mdDialog.show({
                scope: this.$scope,
                preserveScope: true,
                templateUrl: "me/PartialView?module=Login&name=ForgotPasswordEmailAdress",
                fullscreen: true,
                controller: forgotPassordController
            });
        }

        /**
         * Send an email to reset te password
         */
        sendForgotPwd(): void {
            this._userService.sendMailForgotPwd(this.mailForgotPassword).then((args) => {
                if (!args.error) {
                    this._hasError = false;
                    this._errorCode = "";
                    this._errorMsg = "";
                    this._mainController.showMessageKey("app.login.forgotMailSent", "app.login.passwordMailSentTitle", null, ap.controllers.MessageButtons.Ok);
                }
            });
        }

        /**
         * Resend the activation email
         */
        sendActivationEmail(): void {
            if (this._needActivationEmail) {
                this._userService.sendActivationEmail(this.login).then(() => {
                    this._needActivationEmail = false;
                    this._hasError = false;
                    this._errorMsg = "";
                    this._errorCode = "";
                    this._mainController.showMessageKey("app.login.activationMailSent", "app.login.activationMailSentTitle", null, ap.controllers.MessageButtons.Ok);
                });
            }
        }

        /**
         * Goes to the step to input password
         */
        goToPasswordStep(): void {
            if (this.login) {
                this._isPasswordStep = true;
            }
        }

        /**
         * Navigates to the first step of login
         */
        goToLoginStep(): void {
            this._isPasswordStep = false;
            this._hasError = false;
        }

        /**
         * Navigates to the create account page
         */
        goCreateAccount(): void {
            this._mainController.goCreateAccount();
        }

        /**
         * Method called to login, basically when the login button is clicked
         */
        processLogin(): void {
            let bootInfo: ap.misc.BootAppInfo;
            if (this.$stateParams && this.$stateParams["bootInfo"])
                bootInfo = <ap.misc.BootAppInfo>this.$stateParams["bootInfo"];

            // this.$toolService.sendEvent("cli-button-login", new Dictionary());  cannot do it because the user is not logged

            this._authenticateController.login(this.login, this.password, this.isRememberMe, bootInfo).then(null, (e) => {
                this._hasError = true;
                this._needActivationEmail = false;
                if (e.type !== "Unknown") {
                    this._errorMsg = this._utility.Translator.getTranslation("app.err." + e.error);
                    this._errorCode = e.error;
                    if (e.type === "NotActivated")
                        this._needActivationEmail = true;
                }
            });
        }
    }
}