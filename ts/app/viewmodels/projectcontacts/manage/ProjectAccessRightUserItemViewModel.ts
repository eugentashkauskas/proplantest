module ap.viewmodels.projectcontacts {

    export class AccessDataInfo {

        /**
        * Return contact's ID param
        **/
        public get id() {
            return this._id;
        }

        /**
        * Return contact's info param - name, access right label or access right 'allowed' value (true/false)
        **/
        public get info() {
            return this._info;
        }

        constructor(private _id: string, private _info: ProjectContactInfoViewModel) {
        }
    }

    export class ProjectAccessRightUserItemViewModel extends AccessRightUsersItemViewModel {

        /**
        * Return current access right's label
        **/
        public get label() {
            return this._label;
        }

        /**
        * Return current info list to be displayed on the selected view page
        **/
        public get currentInfoList() {
            return this._currentInfoList;
        }

        /**
         * Method used for filling project's access rights of contacts. It must be called when list's "pageloaded" event works
         * @param pageIndex An index of a list's loaded page
         * @param items An array of loaded items. Items are ContactDetails list
         */
        public onLoadItems(pageIndex: number, items: ap.models.projects.ContactDetails[], accessRights?: ap.models.accessRights.AccessRight[]) {
            let contactDetailsInfo = this.getContactsData(pageIndex);
            if (!contactDetailsInfo) {
                contactDetailsInfo = new Dictionary<string, any>();
            }
            if (!contactDetailsInfo)
                return;
            items.forEach((contactDetails: ap.models.projects.ContactDetails) => {
                if (contactDetailsInfo.containsKey(contactDetails.Id)) {
                    contactDetailsInfo.remove(contactDetails.Id);
                }
                // Get needed info data depending on the value type
                let infoData;
                if (this.typeEnum === ValueType.Header) {
                    infoData = contactDetails.DisplayName;
                } else if (this.typeEnum === ValueType.Selector) {
                    infoData = contactDetails.AccessRightLevel;
                } else if (this.typeEnum === ValueType.Simple) {
                    if (accessRights) {
                        let contactAccessRight = accessRights.filter((accessRight: models.accessRights.AccessRight) => { return accessRight.Level === contactDetails.AccessRightLevel; });
                        infoData = contactAccessRight.length === 0 ? false : contactAccessRight[0][this.name] === true;
                    } else {
                        infoData = false;
                    }
                }
                if (!contactDetailsInfo.containsKey(contactDetails.Id)) {
                    let contactInfo = new ProjectContactInfoViewModel(this.$utility, this.typeEnum, infoData, contactDetails, this.parameters.controllersManager.mainController.currentProject());
                    contactInfo.selectedAccessRight = contactDetails.AccessRightLevel;
                    contactDetailsInfo.add(contactDetails.Id, contactInfo);
                    contactInfo.on("selectedaccessrightchanged", this.raiseSelectedAccess, this);
                }
            });
            if (!this.getContactsData(pageIndex))
                this.setContactsData(pageIndex, contactDetailsInfo);
        }

        /**
         * This method is called when we need to initialize contact's data for the current page
         * @param viewPage View page number
         * @param listPage List page number
         */
        public initCurrentPageInfoList(viewPage: number, listPage: number) {
            let startViewIndex = viewPage % 5 * 10;
            let endViewIndex = startViewIndex + 10;
            let detailsInfo = this.getContactsData(listPage);
            if (detailsInfo) {
                if (endViewIndex >= detailsInfo.keys().length)
                    endViewIndex = detailsInfo.keys().length;
                let detailsIds = detailsInfo.keys().slice(startViewIndex, endViewIndex);
                this._currentInfoList = [];
                detailsIds.forEach((id: string) => {
                    this._currentInfoList.push(new AccessDataInfo(id, <ProjectContactInfoViewModel>detailsInfo.getValue(id)));
                });
            }
        }

        /**
        * Method use to update the different cells depends of selectedAccessRight
        * @param info the ContactInfoViewModel which need to be updated with the correct value
        */
        public updateInfo(info: ProjectContactInfoViewModel) {
            for (let i = 0; i < this.currentInfoList.length; i++) {
                if (this.currentInfoList[i].id === info.contact.Id) {
                    if (this.typeEnum === ValueType.Simple) {
                        if (this.accessRights) {
                            for (let j = 0; j < this.accessRights.length; j++) {
                                if (this.accessRights[j].Level === info.selectedAccessRight) {
                                    if (this.name === "" && this.accessRights[j].Level === ap.models.accessRights.AccessRightLevel.Admin) { // Admin has the access of All
                                        this.currentInfoList[i].info.value = true;
                                        break;
                                    } else {
                                        this.currentInfoList[i].info.value = this.accessRights[j][this.name] === true;
                                        break;
                                    }
                                }
                            }
                        } else {
                            this.currentInfoList[i].info.value = false;
                            break;
                        }
                    }
                }
            }
        }

        /**
        * Methode use to raise selectedaccessrightchanged to update the table
        */
        private raiseSelectedAccess(info: ProjectContactInfoViewModel) {
            this._listener.raise("selectedaccessrightchanged", info);
        }

        constructor(Utility: ap.utility.UtilityHelper, $q: angular.IQService, parentListVm?: BaseListEntityViewModel, accessName?: string, label?: string, type?: ValueType, contacts?: ap.models.projects.ContactDetails[], private accessRights?: ap.models.accessRights.AccessRight[], private parameters?: UserProjectAccessRightItemParameter) {
            super(Utility, $q, accessName, type);
            this._listener.addEventsName(["selectedaccessrightchanged"]);
            this._label = label;
            let contactDetailsInfo = new Dictionary<string, any>();
            if (contactDetailsInfo) {
                contacts.forEach((contact: ap.models.projects.ContactDetails) => {
                    let infoData;
                    if (this.typeEnum === ValueType.Header)
                        infoData = contact.DisplayName;
                    if (this.typeEnum === ValueType.Selector)
                        infoData = contact.AccessRightLevel;
                    if (this.typeEnum === ValueType.Simple) {
                        if (label === "All") {
                            if (contact.AccessRightLevel === ap.models.accessRights.AccessRightLevel.Admin) {
                                infoData = true;
                            } else {
                                infoData = false;
                            }
                        } else {
                            let contactAccessRight = accessRights.filter((accessRight: models.accessRights.AccessRight) => { return accessRight.Level === contact.AccessRightLevel; });
                            infoData = contactAccessRight.length === 0 ? false : contactAccessRight[0][accessName] === true;
                        }
                    }
                    if (!contactDetailsInfo.containsKey(contact.Id)) {
                        let contactInfo = new ProjectContactInfoViewModel(this.$utility, type, infoData, contact, this.parameters ? this.parameters.controllersManager.mainController.currentProject() : null);
                        contactInfo.selectedAccessRight = contact.AccessRightLevel;
                        contactDetailsInfo.add(contact.Id, contactInfo);
                        contactInfo.on("selectedaccessrightchanged", this.raiseSelectedAccess, this);
                    }
                });
                this.setContactsData(0, contactDetailsInfo);
                this.initCurrentPageInfoList(0, 0);
            }
        }
        private _label: string;
        private _currentInfoList: AccessDataInfo[];
    }
}