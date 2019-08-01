module ap.viewmodels.notes {

    export class AutoCompleteInChargeViewModel {

        /**
        * Get "rememberUserDecision" property to know if user have checked "Remember" checkbox
        **/
        public get isFeatureDisabled() {
            return this._isFeatureDisabled;
        }

        /**
        * Set "rememberUserDecision" property if user have checked/unchecked "Remember" checkbox
        **/
        public set isFeatureDisabled(remember: boolean) {
            this._isFeatureDisabled = remember;
        }

        /**
         * This method is called when user wants to link user in charge to a category
         */
        public linkUserToCategory() {
            this.$controllersManager.mainController.showBusy();
            this.$controllersManager.noteController.saveContactIssueType(this.issueTypeId, this._userInCharge.contactDetails.Id).then(() => {
                this.$controllersManager.mainController.hideBusy();
                this.$mdDialog.hide();
            });
        }

        /**
         * This method is used to return dialog text translation with set user in charge text and category display nae
         */
        public get askLinkUserToCategoryText() {
            return this._linkUserToCategoryMessage;
        }

        /**
         * This method is used to prevent asking user to link user in charge with the category 
         */
        public preventLinkUserToCategory() {
            this.$controllersManager.mainController.showBusy();
            this.$controllersManager.noteController.updateNextTimeAskInChargeLink(this._userInCharge.userId, this.issueTypeId, ap.controllers.InChargeNextLinkAsked.NO).then((success: boolean) => {
                if (success && this._isFeatureDisabled) {
                    let updatePreference: boolean = false;
                    if (this.$utility.UserContext.UserPreferences) {
                        for (let preference of this.$utility.UserContext.UserPreferences) {
                            if (preference.Key === "ProposeInCharge") {
                                updatePreference = true;
                                preference.Value = "false";
                                this.$controllersManager.userController.saveUserPreference(preference).then(() => {
                                    this.$controllersManager.mainController.hideBusy();
                                    this.$mdDialog.hide();
                                });
                                break;
                            }
                        }
                    }
                    if (!updatePreference) {
                        let preference = new ap.models.actors.UserPreference(this.$utility);
                        preference.Key = "ProposeInCharge";
                        preference.Value = "false";
                        preference.Module = "General";
                        this.$controllersManager.userController.saveUserPreference(preference).then(() => {
                            if (!this.$utility.UserContext.UserPreferences) {
                                this.$utility.UserContext.UserPreferences = [preference];
                            } else {
                                this.$utility.UserContext.UserPreferences.push(preference);
                            }
                            this.$controllersManager.mainController.hideBusy();
                            this.$mdDialog.hide();
                        });
                    }
                } else {
                    this.$controllersManager.mainController.hideBusy();
                    this.$mdDialog.hide();
                    if (!success) {
                        let errorTitle = this.$utility.Translator.getTranslation("app.err.general_title");
                        let errorMsg = this.$utility.Translator.getTranslation("app.err.general_message");
                        this.$controllersManager.mainController.showError(errorMsg, errorTitle, null, null);
                    }
                }
            });
        }

        /**
         * This method is called when user presses "Remind me later" button - 
         */
        public remindLater() {
            this.$controllersManager.mainController.showBusy();
            this.$controllersManager.noteController.updateNextTimeAskInChargeLink(this._userInCharge.userId, this.issueTypeId, ap.controllers.InChargeNextLinkAsked.LATER).then((success: boolean) => {
                this.$controllersManager.mainController.hideBusy();
                this.$mdDialog.hide();
                if (!success) {
                    let errorTitle = this.$utility.Translator.getTranslation("app.err.general_title");
                    let errorMsg = this.$utility.Translator.getTranslation("app.err.general_message");
                    this.$controllersManager.mainController.showError(errorMsg, errorTitle, null, null);
                }
            });
        }

        /**
        * Get original issue type id
        **/
        private get issueTypeId() {
            return (<ap.models.projects.ChapterHierarchy>this._issueType.originalEntity).EntityId;
        }

        /**
         * This method is used to init data needed to display and manage the dialog logic
         * @param userInCharge
         * @param issueType
         */
        public initData(userInCharge: ap.viewmodels.projects.ContactItemViewModel, issueType: ap.viewmodels.projects.ChapterHierarchyItemViewModel) {
            this._userInCharge = userInCharge;
            this._issueType = issueType;
            this._linkUserToCategoryMessage = this.$utility.Translator.getTranslation("app.link_user_to_category_translationKey").format(userInCharge.displayText, issueType.displayName);
        }

        static $inject = ["Utility", "$mdDialog", "ControllersManager"];
        constructor(private $utility: ap.utility.UtilityHelper, private $mdDialog: angular.material.IDialogService, private $controllersManager: ap.controllers.ControllersManager) {
            this._isFeatureDisabled = false;
        }

        private _userInCharge: ap.viewmodels.projects.ContactItemViewModel;
        private _issueType: ap.viewmodels.projects.ChapterHierarchyItemViewModel;
        private _isFeatureDisabled: boolean;
        private _linkUserToCategoryMessage: string;
    }
}