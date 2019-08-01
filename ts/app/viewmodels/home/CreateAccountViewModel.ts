namespace ap.viewmodels.home {

    /**
     * CreateAccontViewModel is the class used to create a new user account
     * @class
     */
    export class CreateAccontViewModel {

        public fullName: string = "";
        private _alias: string = "";
        public password: string = "";
        public confirmPwd: string = "";
        public isTermsAccepted: boolean = false;

        /**
         * This is the alias used for the new account
         **/
        get alias(): string {
            return this._alias;
        }

        set alias(newAlias: string) {
            this._alias = newAlias;
        }

        public get termsAndConditionUrl(): string {
            return this._termsAndConditionUrl;
        }

        public get canCreate(): boolean {
            return StringHelper.checkValidEmail(this.alias) && this.fullName && this.password && this.confirmPwd && this.isTermsAccepted && !StringHelper.isNullOrEmpty(this._captchaResponse);
        }

        /**
         * Cancel account creation and go to the login page
         */
        cancel(): void {
            this._utility.Storage.Local.lastLogin("");
            this.$location.path("/login");
        }

        /**
         * Get the missing info before to create the account
         * @param languageCode LanguageCode currently in use
         * @param countryCode Country code found for the host machine
         * @param timezoneOffset Current timezone
         */
        getMissingInfo(languageCode: string, countryCode: string, timezoneOffset: number): void {
            let url: string = this._utility.apiUrl + "/ApiMe/GetNewAccountClientInfo?LanguageCode=" + encodeURIComponent(languageCode) + "&CountryCode=" + encodeURIComponent(countryCode) + "&TimezoneOffset=" + encodeURIComponent(timezoneOffset.toString());
            this._api.ajaxJsonCall(url, ap.services.apiHelper.MethodType.Get, new services.apiHelper.ApiOption(false)).then((args) => {
                let country: ap.models.identFiles.Country, language: ap.models.identFiles.Language, timezoneName: string;

                if (args.data.Country) {
                    country = <ap.models.identFiles.Country>this._model.createByJson("Country", args.data.Country);
                }
                if (args.data.Language) {
                    language = <ap.models.identFiles.Language>this._model.createByJson("Language", args.data.Language);
                }
                if (args.data.TimezoneName)
                    timezoneName = args.data.TimezoneName;
                let alias: string = this.alias,
                    fullName: string = this.fullName,
                    pwd: string = this.password;
                this._servicesManager.userService.createAccount(fullName, alias, pwd, language, this._captchaResponse, timezoneName, country).then((response) => {
                    let title = this._utility.Translator.getTranslation("app.createAccount.activationMail_title");
                    let msg = this._utility.Translator.getTranslation("app.createAccount.activationMail_msg");
                    this._controllersManager.mainController.showMessage(msg, title, (result) => {
                        if (this.alias) {
                            this._utility.Storage.Local.lastLogin(this.alias);
                        }
                        this.$location.path("/login");
                    }, ap.controllers.MessageButtons.Ok);
                });
            }, (agrs) => {
                let alias: string = this.alias,
                    fullName: string = this.fullName,
                    pwd: string = this.password;

                this._servicesManager.languageService.getLanguageByCode(languageCode).then((language: ap.models.identFiles.Language) => {
                    this._servicesManager.userService.createAccount(fullName, alias, pwd, language, this._captchaResponse).then((response) => {
                        let title = this._utility.Translator.getTranslation("app.createAccount.activationMail_title");
                        let msg = this._utility.Translator.getTranslation("app.createAccount.activationMail_msg");
                        this._controllersManager.mainController.showMessage(msg, title, (result) => {
                            if (this.alias) {
                                this._utility.Storage.Local.lastLogin(this.alias);
                            }
                            this.$location.path("/login");
                        }, ap.controllers.MessageButtons.Ok);
                    });
                });
            });
        }

        /**
         * Create the account
         */
        createAccount(): void {
            if (!this.canCreate) return;

            if (this.password !== this.confirmPwd) {
                this._controllersManager.mainController.showErrorKey("app.err.pwdMismatch", "app.err.pwdMismatchTitle", "", null);
            }
            else {
                let language = this.$window.navigator.language;
                let offset: number = new Date().getTimezoneOffset();
                let countryCode: string = "BE";
                let hasCountry: boolean = false;
                let self: ap.viewmodels.home.CreateAccontViewModel = this;

                let url = "http://ipinfo.io";
                this.$http.jsonp(this.$sce.trustAsResourceUrl(url), {
                    timeout: 2000
                }).then((response: any) => {
                    // success callback
                    if (response && response.data.country) {
                        countryCode = response.data.country;
                    }
                    if (hasCountry === false) {
                        hasCountry = true;
                        self.getMissingInfo(language, countryCode, offset);
                    }
                }).catch((error) => {
                    if (hasCountry === false) {
                        hasCountry = true;
                        self.getMissingInfo(language, countryCode, offset);
                    }
                });

            }
        }

        /**
         * Initialize the alias and full name properties from parameters found in the URL
         */
        public init(): void {
            let def = this._utility.UrlTool.getParam("email");
            if (def) {
                this.alias = def;
            }
            def = this._utility.UrlTool.getParam("fullName");
            if (def) {
                this.fullName = def;
            }
        }

        /**
         * Handler method called when the user verified the captcha
         * @param captchaResponse
         */
        public getCaptchaReponseHandler(captchaResponse: string) {
            this.$scope.$apply(() => {
                this._captchaResponse = captchaResponse;
            });
        }

        /**
         * Handler method called when the captcha timed out
         */
        public captchaTimedOutHandler() {
            this.$scope.$apply(() => {
                this._captchaResponse = null;
            });
        }

        static $inject = ["$http", "$location", "$window", "$scope", "$timeout", "Api", "ServicesManager", "ControllersManager", "Model", "Utility", "$sceDelegate", "$sce", "$interval", "$q", "$document"];

        constructor(private $http: angular.IHttpService, private $location: angular.ILocationService, private $window: angular.IWindowService, private $scope: angular.IScope, private $timeout: angular.ITimeoutService,
            private _api: ap.services.apiHelper.Api, private _servicesManager: ap.services.ServicesManager, private _controllersManager: ap.controllers.ControllersManager,
            private _model: ap.models.Model, private _utility: ap.utility.UtilityHelper, private $sceDelegate: angular.ISCEDelegateService, private $sce: angular.ISCEService,
            private $interval: angular.IIntervalService, private $q: angular.IQService, private $document: angular.IDocumentService) {

            this._termsAndConditionUrl = this._utility.apiUrl + "TermsAndConditions.pdf";
            this._controllersManager.authenticateController.logout();

            $scope.$on("$destroy", function () {
                if (this._timeout)
                    $timeout.cancel(this._timeout);
            });
        }

        private _timeout: any;
        private _termsAndConditionUrl: string;
        private _onRecaptchaLoad: any;
        private _captchaResponse: string;
        private grecaptcha: any;
    }
}