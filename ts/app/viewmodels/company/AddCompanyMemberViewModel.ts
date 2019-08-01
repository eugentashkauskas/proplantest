namespace ap.viewmodels.company {
    export class AddCompanyMemberViewModel {
        /**
        * Property isChecked added for hide errors in md-autocomplete while a check is in progress for the existence of a user in the company
        **/
        public isChecking = false;

        public selectedUser: ap.models.actors.User;

        /**
        * This property used for enabled/disabled 'Add' button
        **/
        public get canAdd(): boolean {
            return StringHelper.checkValidEmail(this._email) && !this._userExistInCompany && !this._userExistInList;
        }

        /**
        * This property used for enabled/disabled 'SendInvite' button
        **/
        public get canSendInvite(): boolean {
            return this._invitationListOfEmail.length > 0;
        }

        public get email(): string {
            return this._email;
        }

        public set email(val: string) {
            if (this._email !== val) {
                this._email = val;
                this.checkExistEmailInInvintationList();
                if (!this._delayValidEmail) {
                    this.isChecking = true;
                    this._userExistInCompany = true;
                    this._delayValidEmail = this.$timeout(() => {
                        this.checkOfUserExistInCompany();
                        this.$timeout.cancel(this._delayValidEmail);
                        this._delayValidEmail = null;
                    }, 500);
                }
            }
        }

        /**
        * This property used for show error when user already exist in company
        **/
        public get userExistInCompany(): boolean {
            return !this._userExistInList && this._userExistInCompany;
        }

        /**
        * This property used for show error when user already exist in invintation list
        **/
        public get userExistInList(): boolean {
            return this._userExistInList;
        }

        /**
        * Get list of predefined user emails
        **/
        public get invitationListOfEmail(): string[] {
            return this._invitationListOfEmail;
        }

        /**
         * This method use for search of users in md-autocomplete
         */
        public searchUsers(): angular.IPromise<ap.models.actors.User[]> {
            let defer: ng.IDeferred<ap.models.actors.User[]> = this.$q.defer();
            if (!StringHelper.isNullOrWhiteSpace(this.email)) {
                let option: ap.services.apiHelper.ApiOption = new ap.services.apiHelper.ApiOption();
                option.isShowBusy = false;
                option.async = true;
                let filter = Filter.startsWith("DefaultEmail", "\"" + this.email + "\"");
                this.api.getEntityList("User", filter, "Person,Company", null, null, option).then((apiResponse) => {
                    defer.resolve(<ap.models.actors.User[]>apiResponse.data);
                });
            } else {
                defer.resolve([]);
            }
            return defer.promise;
        }

        /**
         * This handler for add button 
         */
        public addHandler() {
            if (this.selectedUser) {
                this._addToInvitationList(this._email, this.selectedUser);
            } else {
                this.mainController.checkUserExists(this._email).then((user) => {
                    this._addToInvitationList(this._email, user);
                });
            }
        }

        /**
         * This method use for remove InvitationRequest from invitationList
         * @param userInvitationToDelete - InvitationRequest for delete
         */
        public removeFromInvitationList(email: string) {
            let index = this._invitationListOfEmail.indexOf(email);
            this._invitationListOfEmail.splice(index, 1);
            if (this._dictUsers.containsKey(email)) {
                this._dictUsers.remove(email);
            }
            this.checkExistEmailInInvintationList();
        }

        /**
         * This method use for add user to invitationList
         * @param invitedUser - user for add
         */
        private _addToInvitationList(email: string, user?: ap.models.actors.User) {
            if (!!user) {
                this._dictUsers.add(email, user);
            }
            this._invitationListOfEmail.push(email);
            this.selectedUser = null;
            this._email = null;
        }

        /**
         * This method use for close dialog window
         */
        public cancel() {
            this.$mdDialog.cancel();
        }

        /**
         * This method use for check for the existence of a user in the company
         */
        private checkOfUserExistInCompany() {
            if (!this._userExistInList && StringHelper.checkValidEmail(this._email)) {
                let filter = Filter.eq("User.Alias", "\"" + this.email + "\"");
                let option: ap.services.apiHelper.ApiOption = new ap.services.apiHelper.ApiOption();
                option.isShowBusy = false;
                option.async = true;
                this.api.getEntityCount("CompanyUser", filter, option).then((count) => {
                    this._userExistInCompany = !!count;
                    this.isChecking = false;
                });
            } else {
                this._userExistInCompany = false;
                this.isChecking = false;
            }
        }

        /**
         * Check email of duplicate in invitationListOfEmail
         * @param email
         */
        private checkExistEmailInInvintationList() {
            this._userExistInList = this._invitationListOfEmail.indexOf(this._email) >= 0;
        }

        /**
         * This method for send invite in company for users 
         */
        public sendInvite() {
            let arrayOfEmailsForCreateUsers: string[] = [];
            let arrayOfPromises: angular.IPromise<ap.models.actors.User>[] = [];
            let invitationList: ap.models.company.CompanyUserInvitationRequest[] = [];
            this._invitationListOfEmail.forEach((email) => {
                if (this._dictUsers.containsKey(email)) {
                    let user = this._dictUsers.getValue(email);
                    invitationList.push(this.createInvintationRequest(user));
                } else {
                    arrayOfEmailsForCreateUsers.push(email);
                }
            });
            if (arrayOfEmailsForCreateUsers.length > 0) {
                let user: ap.models.actors.User;
                let userPass: ap.models.custom.UserPass;
                arrayOfEmailsForCreateUsers.forEach((email, index) => {
                    user = new ap.models.actors.User(this.$utility);
                    user.initFromEmail(<string>email);
                    userPass = new ap.models.custom.UserPass(user, null);
                    arrayOfPromises[index] = this.api.createUser(userPass).then((apiResponse: ap.services.apiHelper.ApiResponse) => {
                        return <ap.models.actors.User>apiResponse.data;
                    });
                });
                this.$q.all(arrayOfPromises).then((users: ap.models.actors.User[]) => {
                    users.forEach((user) => {
                        invitationList.push(this.createInvintationRequest(user));
                    });
                    this.companyController.createInvitationRequest(invitationList).then((processedRequest) => {
                        this.$mdDialog.hide(processedRequest);
                    });
                });
            } else {
                this.companyController.createInvitationRequest(invitationList).then((processedRequest) => {
                    this.$mdDialog.hide(processedRequest);
                });
            }
        }

        /**
         * This method use for create instance of CompanyUserInvitationRequest
         * @param user - invited user
         */
        private createInvintationRequest(user: ap.models.actors.User): ap.models.company.CompanyUserInvitationRequest {
            let companyUserInvitation = new ap.models.company.CompanyUserInvitationRequest(this.$utility);
            companyUserInvitation.Inviter = this.$utility.UserContext.CurrentUser();
            companyUserInvitation.Company = this.companyController.managedCompany;
            companyUserInvitation.Status = ap.models.company.InvitationRequestStatus.Sent;
            companyUserInvitation.InvitedUser = user;
            return companyUserInvitation;
        }

        constructor(private $utility: ap.utility.UtilityHelper, private $mdDialog: angular.material.IDialogService, private mainController: ap.controllers.MainController, private companyController: ap.controllers.CompanyController, private api: ap.services.apiHelper.Api, private $q: angular.IQService, private $timeout: angular.ITimeoutService) {
        }

        private _invitationListOfEmail: string[] = [];
        private _email: string = "";
        private _delayValidEmail: any;
        private _userExistInCompany: boolean = false;
        private _userExistInList: boolean = false;
        private _dictUsers = new Dictionary<string, ap.models.actors.User>();
    }
}
