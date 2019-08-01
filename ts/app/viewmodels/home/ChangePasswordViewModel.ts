module ap.viewmodels.home {
    /**
     * This VM used to bind with the view which let the user change his password
    **/
    export class ChangePasswordViewModel {
        private _oldpassword: string;
        private _newpassword: string;
        private _confirmpassword: string;
        private _canCancel: boolean;
        private _canChange: boolean;
        private _confirmError: IConfirmError[];
        private _oldError: IConfirmError[];
        private _newError: IConfirmError[];

        /**
        * Contains errors for the confirmpassord
        **/
        public get confirmError(): IConfirmError[] {
            return this._confirmError;
        }

        /**
        * Contains errors for the oldpassord
        **/
        public get oldError(): IConfirmError[] {
            return this._oldError;
        }

        /**
        * Contains errors for the newpassord
        **/
        public get newError(): IConfirmError[] {
            return this._newError;
        }

        /**
        * The old password input by the user
        **/
        public get oldpassword(): string {
            return this._oldpassword;
        }

        public set oldpassword(val: string) {
            this._oldpassword = val;
            this.checkCanChange();
            this._oldError = [];
        }

        /**
        * The new password input by the user
        **/
        public get newpassword(): string {
            return this._newpassword;
        }

        public set newpassword(val: string) {
            this._newpassword = val;
            this.checkCanChange();
            this._newError = [];
        }
        /**
        * The confirm password input by the user
        **/
        public get confirmpassword(): string {
            return this._confirmpassword;
        }

        public set confirmpassword(val: string) {
            this._confirmpassword = val;
            this.checkCanChange();
            this._confirmError = [];
        }

        /**
        * This property to know that we can cancel the changing password process or not
        * canCancel = true the param isMandatory specifield on the constructor is false
        **/
        public get canCancel(): boolean {
            return this._canCancel;
        }

        /**
        * This property to know that we can change password or not
        * canChange = true when oldpassword, newpassword and confirmpassword are not empty
        **/
        public get canChange(): boolean {
            return this._canChange;
        }

        /**
        * This method used to check that can change the password or not
        * can change when _oldpassword, _newpassword, _confirmpassword are not empty
        **/
        private checkCanChange() {
            this._canChange = !StringHelper.isNullOrEmpty(this._oldpassword)
                && !StringHelper.isNullOrEmpty(this._newpassword)
                && !StringHelper.isNullOrEmpty(this._confirmpassword);
        }

        /**
        * This method used to check that the confirm password is correct with the newpassword
        **/
        private checkConfirm() {
            this._confirmError = [];
            if (!StringHelper.isNullOrEmpty(this.confirmpassword) && this.confirmpassword !== this.newpassword) {
                this._confirmError.push({ typeError: "app.err.pwdMismatch" });
            }
        }

        /**
        * This method used to check that the old password is correct with the current password of the user
        **/
        private checkOld() {
            this._oldError = [];
            if (!StringHelper.isNullOrEmpty(this.oldpassword) && this.oldpassword !== this.$utility.UserContext.Password()) {
                this._oldError.push({ typeError: "app.changepassword.invalid_oldpassword_message" });
            }
        }

        /**
        * This method used to check that the new password is correct
        **/
        private checkNew() {
            this._newError = [];
            if (!this.$utility.UserContext.isTokenPwd() && !StringHelper.isNullOrEmpty(this.oldpassword) && this.oldpassword === this._newpassword)
                this._newError.push({ typeError: "app.changepassword.same_current_password_message" });
            if (this._newpassword && this._newpassword.trim().length < 6)
                this._newError.push({ typeError: "app.changepassword.newpassword_less_message" });
        }

        /**
        * This method used to change password of the user
        * First, we need to check the oldpassword and the confirmpassword are correct. If not push the error
        * If ok, call the authenticateController to change the password
        **/
        public changePassword() {
            if (!this.$utility.UserContext.isTokenPwd()) {
                this.checkOld();
            }
            this.checkNew();
            this.checkConfirm();
            if (this._oldError.length === 0 && this._confirmError.length === 0 && this._newError.length === 0) {
                this.authenticateController.changePassword(this._oldpassword, this._newpassword, this._confirmpassword);
            }
        }

        /**
        * This method will called when the passwordchanged event was fired from the UserContext
        * We will close this dialog and also show to the user that his password have been changed
        **/
        private _onPasswordChanged() {
            this.closeDialog();
            this.mainController.showMessageKey("app.changepassword.success_message", "Information", null, ap.controllers.MessageButtons.Ok);

            // if the password change came from a MustChangePassword at the login, we need to continue to initialize the app
            if (this.authenticateController.needToCompleteLogin()) {
                this.authenticateController.initAndRunUtilities(this._userFullInfo.User.Alias, this._userFullInfo.User.DisplayName, this._userFullInfo.User.EntityCreationDate, this._userFullInfo.User.LanguageCode);
                this.authenticateController.raiseLoginCompleted();
            }
        }

        /**
        * This method will closed the dialog
        **/
        public closeDialog() {
            this.$mdDialog.hide();
        }

        constructor(private $utility: ap.utility.UtilityHelper, private $mdDialog: angular.material.IDialogService, $scope: ng.IScope, private mainController: ap.controllers.MainController,
            private authenticateController: ap.controllers.AuthenticateController, evt: ap.controllers.ChangePasswordRequestEvent) {
            let vm = this;
            this._oldpassword = "";
            this._confirmpassword = "";
            this._newpassword = "";
            this.checkCanChange();
            this._canCancel = !evt.isMandatory;
            this._userFullInfo = evt.userFullInfo;
            this.$utility.UserContext.on("passwordchanged", vm._onPasswordChanged, vm);

            $scope.$on("$destroy", () => {
                vm.$utility.UserContext.off("passwordchanged", vm._onPasswordChanged, vm);
            });
        }
        private _userFullInfo: ap.misc.UserFullInfo = null;
    }
}