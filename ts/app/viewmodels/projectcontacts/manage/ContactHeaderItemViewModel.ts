module ap.viewmodels.projectcontacts {
    export class ContactHeaderItemViewModel extends EntityViewModel {
        /**
        * This property is to get the id of the user
        **/
        public get userId(): string {
            return this._userId;
        }

        public set userId(id: string) {
            this._userId = id;
        }

        /**
        * This property is to get the id of the contactDetail
        **/
        public get id(): string {
            return this._id;
        }

        public set id(id: string) {
            this._id = id;
        }

        /**
        * This property is to get the number of link of the user
        **/
        public get linksCount(): number {
            return this._linksCount;
        }

        public set linksCount(count: number) {
            this._linksCount = count;
        }

        /**
        * This property is to know if the user has a link (the name of the user is red if false)
        **/
        public get hasLink(): boolean {
            return this._hasLink;
        }

        public set hasLink(haslink: boolean) {
            this._hasLink = haslink;
        }

        /**
        * Thisis to know if the user is invited
        **/
        public get isInvited(): boolean {
            return this._isInvited;
        }

        public set isInvited(invited: boolean) {
            this._isInvited = invited;
        }

        /**
        * This is to know by who the user is invited
        **/
        public get inviterId(): string {
            return this._inviterId;
        }

        public set inviterId(inviter: string) {
            this._inviterId = inviter;
        }

        /**
        * This is to know by who the user is invited
        **/
        public get entityCreationUser(): string {
            return this._entityCreationUser;
        }

        public set entityCreationUser(entity: string) {
            this._entityCreationUser = entity;
        }

        /**
        * This is to know the completed name of the user
        **/
        public get fullName(): string {
            return this._fullName;
        }

        public set fullName(name: string) {
            this._fullName = name;
        }

        /**
        * This is to know the accessRights
        **/
        public get accessRigthLevel(): ap.models.accessRights.AccessRightLevel {
            return this._accessRigthLevel;
        }

        public set accessRigthLevel(accessRigth: ap.models.accessRights.AccessRightLevel) {
            this._accessRigthLevel = accessRigth;
        }

        constructor($utility: ap.utility.UtilityHelper, private $q: angular.IQService, parentListVm?: ap.viewmodels.BaseListEntityViewModel, parameters?: ItemConstructorParameter) {
            super($utility, parentListVm, parameters ? parameters.itemIndex : undefined);
        }

        private _userId: string;
        private _id: string;
        private _linksCount: number;
        private _hasLink: boolean;
        private _accessRigthLevel: ap.models.accessRights.AccessRightLevel;
        private _isInvited: boolean;
        private _inviterId: string;
        private _fullName: string;
        private _entityCreationUser: string;
    }
}