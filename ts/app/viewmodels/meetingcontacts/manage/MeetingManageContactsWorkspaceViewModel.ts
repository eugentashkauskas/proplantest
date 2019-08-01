module ap.viewmodels.meetingcontacts {

    /**
    * Class used to pass parameters when changing the state of the app to the manage screen of a meeting
    */
    export class MeetingManageFlowStateParam extends ap.controllers.MainFlowStateParam {

        /**
        * Property to get the list of participants of the meeting
        */
        public get meetingConcernList(): ap.models.meetings.MeetingConcern[] {
            return this._meetingConcernList;
        }

        public set meetingConcernList(val: ap.models.meetings.MeetingConcern[]) {
            this._meetingConcernList =  val;
        }

        createByJson(json: any) {
            super.createByJson(json);
            this._meetingConcernList = [];
            if (json.meetingConcernList) {
                for (let i = 0; i < json.meetingConcernList.length; i++) {
                    let entity: ap.models.meetings.MeetingConcern = new ap.models.meetings.MeetingConcern(this.$utility);
                    entity.createByJson(json.meetingConcernList[i]);
                    this._meetingConcernList.push(entity);
                }
            }
        }

        public toJSON(): any {
            let json: any;
            json = super.toJSON();
            json.meetingConcernList = this._meetingConcernList;
            return json;
        }

        constructor($utility: ap.utility.UtilityHelper) {
            super($utility);
            this.nameState = "MeetingManageFlowStateParam";
        }

        private _meetingConcernList: ap.models.meetings.MeetingConcern[] = [];
    }

    /**
     * Class using to manage the contacts of a Meeting
     */
    export class MeetingManageContactsWorkspaceViewModel implements IDispose {

        /**
        * This property is to get screen Info
        **/
        public get screenInfo(): ap.misc.ScreenInfo {
            return this._screenInfo;
        }

        /**
        * This proprety is the list of the contacts of the meeting
        **/
        public get meetingContactList(): ap.viewmodels.meetingcontacts.MeetingContactViewModel[] {
            return this._meetingContactList;
        }

        /**
        * Get the UserMeetingAccessRightListViewModel
        **/
        public get userMeetingAccessRightList(): UserMeetingAccessRightListViewModel {
            return this._userMeetingAccessRightList;
        }

        /**
        * Private method to initialize the VM of the detail config tab of a project
        */
        private _initializeUserMeetingAccessRightList() {
            if (!this._userMeetingAccessRightList) {
                this._userMeetingAccessRightList = new ap.viewmodels.meetingcontacts.UserMeetingAccessRightListViewModel(this.$utility, this._api, this.$q, this._controllersManager, this._servicesManager, this._meetingContactList);
            }
        }

        /**
         * Dispose the Class
         */
        dispose() {
            this._controllersManager.mainController.off("gobackrequested", this.goBackRequestedHandler, this);
            if (this.screenInfo) {
                this._screenInfo.off("actionclicked", this._mainActionClickedHandler, this);
                this.screenInfo.dispose();
            }
        }

        /**
         * Initialize workspace's view
         */
        private initView() {
            this._screenInfo = new ap.misc.ScreenInfo(this.$utility, "meetingmanage", ap.misc.ScreenInfoType.Detail, null, null, null, this._currentMeeting.Title, true);
            this._controllersManager.uiStateController.updateScreenInfo(this._screenInfo);
            this._controllersManager.mainController.initScreen(this._screenInfo);
            let meetingManageFlowStateParam: MeetingManageFlowStateParam;

            if (this._controllersManager.uiStateController.mainFlowStateParam && this._controllersManager.uiStateController.mainFlowStateParam instanceof MeetingManageFlowStateParam) {
                meetingManageFlowStateParam = <MeetingManageFlowStateParam>this._controllersManager.uiStateController.mainFlowStateParam;
            }
            else if (this._controllersManager.uiStateController.mainFlowStateParam) {
                meetingManageFlowStateParam = new MeetingManageFlowStateParam(this.$utility);
                meetingManageFlowStateParam.createByJson(this._controllersManager.uiStateController.mainFlowStateParam);
            }

            if (meetingManageFlowStateParam && meetingManageFlowStateParam.meetingConcernList) {
                let contactList = meetingManageFlowStateParam.meetingConcernList;
                for (let i = 0; i < contactList.length; i++) {
                    let meetingContact = new ap.viewmodels.meetingcontacts.MeetingContactViewModel(this.$utility, this._controllersManager);
                    meetingContact.init(contactList[i]);
                    this._meetingContactList.push(meetingContact);
                }

                this._initializeUserMeetingAccessRightList();
            }
            this._userMeetingAccessRightList = new ap.viewmodels.meetingcontacts.UserMeetingAccessRightListViewModel(this.$utility, this._api, this.$q, this._controllersManager, this._servicesManager, this._meetingContactList);
            this.initActions(this._userMeetingAccessRightList.screenInfo.actions);
            this._screenInfo.on("actionclicked", this._mainActionClickedHandler, this);
            this._userMeetingAccessRightList.on("editmodechanged", this.editModeChanged, this);
        }

        /**
         * Init actions in screen info 
         * @param actions array of ActionViewModel
         */
        private initActions(actions: ap.viewmodels.home.ActionViewModel[]) {
            this._screenInfo.actions = actions;
        }

        /**
        * Handle edit mode change of tab
        **/
        private editModeChanged(args: base.EditModeEvent) {
            let vm = args.vm;
            this._screenInfo.isEditMode = vm.screenInfo.isEditMode;

            if (args.wasNewEntity && args.isCancelAction && vm.screenInfo.isEditMode === false) { // means we are cancelling a new project then, we can go back to the project selection.
                this._controllersManager.uiStateController.changeFlowState(ap.controllers.MainFlow.ManageContacts);
            }
            else if (args.isCancelAction && vm.screenInfo.isEditMode === false) {
                this.refresh();
            }
            else if (!args.isCancelAction && vm.screenInfo.isEditMode === false) {
                let stateParam = new ap.viewmodels.meetingcontacts.MeetingManageFlowStateParam(this.$utility);
                stateParam.meetingConcernList = this._meetingContactList.map((item) => { return item.originalMeetingContact; });
                this.$utility.Storage.Session.set("MainFlowStateParam", stateParam);
            }
        }

        private refresh() {
            this._meetingContactList.forEach((meetingContact) => {
                meetingContact.copySource();
            });
            this._userMeetingAccessRightList.initMeetingAccessRights();
            this._userMeetingAccessRightList.privateUpdateCurrentContactInfo();
        }

        /**
         * Handler for 'gobackrequested' event, used to go to Participants page when Manage page is closed
         */
        private goBackRequestedHandler() {
            this._controllersManager.uiStateController.changeFlowState(ap.controllers.MainFlow.MeetingContacts);
        }

        private currentMeetingChanged(meeting: ap.models.meetings.Meeting) {
            this._currentMeeting = meeting;
            this.initView();
        }

        /**
         * This method will handle the user clicks on an action and will call the correct screenInfo.actionClicked depending of the selected tab
         **/
        private _mainActionClickedHandler(actionName: string) {
            this._userMeetingAccessRightList.screenInfo.actionClick(actionName);
        }

        static $inject = ["$scope", "Utility", "Api", "$q", "ControllersManager", "ServicesManager"];
        constructor(private $scope: angular.IScope, private $utility: ap.utility.UtilityHelper, private _api: ap.services.apiHelper.Api, private $q: angular.IQService, private _controllersManager: ap.controllers.ControllersManager, private _servicesManager: ap.services.ServicesManager) {
            this._currentMeeting = this._controllersManager.mainController.currentMeeting;
            this._controllersManager.mainController.on("gobackrequested", this.goBackRequestedHandler, this);
            if (this._currentMeeting) {
                this.initView();
            } else {
                this._controllersManager.mainController.on("currentmeetingchanged", this.currentMeetingChanged, this);
            }
            $scope.$on("$destroy", () => {
                this.dispose();
            });
        }

        // screenInfo of the class
        private _screenInfo: ap.misc.ScreenInfo;
        // current meeting of the screen
        private _currentMeeting: ap.models.meetings.Meeting;
        private _meetingContactList: ap.viewmodels.meetingcontacts.MeetingContactViewModel[] = [];
        private _userMeetingAccessRightList: UserMeetingAccessRightListViewModel;
        private _selectedTab: number;
    }
}