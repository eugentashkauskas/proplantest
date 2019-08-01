namespace ap.viewmodels.company {

    enum MemberIdType {
        User,
        Request
    }

    export class CompanyMemberListViewModel extends GenericPagedListViewModels {

        /**
        * Method used to know if the item in param is the last of the list
        * @param item the note we want to know if it is the last of the list
        **/
        public isLast(item: CompanyMemberItemViewModel): boolean {
            if (item && this.sourceItems[this.sourceItems.length - 1] && this.sourceItems[this.sourceItems.length - 1].originalEntity) {
                if (this.sourceItems[this.sourceItems.length - 1].originalEntity.Id === item.originalEntity.Id) {
                    return true;
                }
            }
            return false;
        }

        /**
         * Override metod loadIds from GenericPagedListViewModels
         * @param filter the filter to apply to retrieve the ids of entities we want to load
         * @param param
         */
        loadIds(filter: string = null, param: any = null): angular.IPromise<ap.services.apiHelper.ApiResponse> {
            this._dicIds.clear();
            this.onLoadItems(null, false);
            this._isLoading = true;
            let filterForId = "Filter.Eq(Company.Id," + this.controllerManager.companyController.managedCompany.Id + ")";
            let url = "rest/companyusersids";
            url += "?filter=" + encodeURIComponent(filterForId);
            let invUrl = "rest/companyuserinvitationrequestsids";


            invUrl += "?filter=" + encodeURIComponent(Filter.and(filterForId,
                Filter.notEq("Status", ap.models.company.InvitationRequestStatus[ap.models.company.InvitationRequestStatus.Accepted])));
            let companyUsersIdsPromise = this.controllerManager.listController.getEntityIdsCustom(url, ap.services.apiHelper.MethodType.Get).then((response: ap.services.apiHelper.ApiResponse) => {
                let ids: [string] = response.data;
                ids.forEach((id: string) => {
                    this._dicIds.add(id, MemberIdType.User);
                });
                return response.data;
            });
            let invitationRequestsIdsPromise = this.controllerManager.listController.getEntityIdsCustom(invUrl, ap.services.apiHelper.MethodType.Get).then((res: ap.services.apiHelper.ApiResponse) => {
                let invIds: [string] = res.data;
                invIds.forEach((id) => {
                    this._dicIds.add(id, MemberIdType.Request);
                });
                return res.data;
            });
            return this.$q.all([companyUsersIdsPromise, invitationRequestsIdsPromise]).then((idsResponse: string[][]) => {
                let joinIdsResponse = new ap.services.apiHelper.ApiResponse(idsResponse[0]);
                joinIdsResponse.data.push(...idsResponse[1]);
                return this.loadIdsCompleted(joinIdsResponse);
            });
        }

        /**
         * Override method _loadPageHandler from GenericPagedListViewModels
         * @param deferred this is the deferred to use to resolve/reject the async call to the api
         * @param index this is the index of the page to load
         **/
        _loadPageHandler(deferred: angular.IDeferred<ap.services.apiHelper.ApiResponse>, index: number) {
            let lenPage: number = this._pages.length;
            let pageDesc: PageDescription = null;

            if (this._pages.length <= index)
                throw new Error("The index is out of range");

            pageDesc = this._pages[index];

            let pageids: string[] = this.getPageIds(pageDesc);
            if (!pageids.length) {
                this._onPageLoaded(pageDesc, []);
                deferred.resolve();
                return;
            }

            let invitationRequestsIds: string[] = [];
            let companyUsersIds: string[] = [];
            let firstIdType = this._dicIds.getValue(pageids[0]);
            let lastIdType = this._dicIds.getValue(pageids[pageids.length - 1]);
            if (firstIdType === lastIdType) {
                if (firstIdType === MemberIdType.Request) {
                    invitationRequestsIds = pageids;
                } else {
                    companyUsersIds = pageids;
                }
            } else {
                pageids.forEach((id: string) => {
                    if (this._dicIds.getValue(id) === MemberIdType.User) {
                        companyUsersIds.push(id);
                    } else {
                        invitationRequestsIds.push(id);
                    }
                });
            }

            this._isLoading = true;

            let requests: angular.IPromise<ap.services.apiHelper.ApiResponse>[] = [];
            if (companyUsersIds.length) {
                requests.push(this.controllerManager.listController.getEntityList("CompanyUser", companyUsersIds, "User,User.Profession"));
            }
            if (invitationRequestsIds.length) {
                requests.push(this.controllerManager.listController.getEntityList("CompanyUserInvitationRequest", invitationRequestsIds, "InvitedUser,InvitedUser.Profession"));
            }

            this.$q.all(requests).then((responses: ap.services.apiHelper.ApiResponse[]) => {
                let itemsArray: CompanyMemberItemViewModel[] = [];
                responses.forEach((response: ap.services.apiHelper.ApiResponse) => {
                    response.data.forEach((item: ap.models.actors.CompanyUser | ap.models.company.CompanyUserInvitationRequest) => {
                        let companyMemberItemViewModel = new CompanyMemberItemViewModel(this.$utility, this.controllerManager, this._servicesManager);
                        companyMemberItemViewModel.init(item);
                        itemsArray.push(companyMemberItemViewModel);
                    });
                });
                this._onPageLoaded(pageDesc, itemsArray);
                deferred.resolve();
            }).catch(() => {
                deferred.reject();
            });
        }

        constructor($utility: ap.utility.UtilityHelper, protected $q: angular.IQService, private controllerManager: ap.controllers.ControllersManager, private _servicesManager: ap.services.ServicesManager) {
            super($utility, controllerManager.listController, $q, new GenericPagedListOptions("CompanyUser"));
            this._isDeferredLoadingMode = true;
        }

        private _dicIds: IDictionary<string, MemberIdType> = new Dictionary<string, MemberIdType>();
    }
}