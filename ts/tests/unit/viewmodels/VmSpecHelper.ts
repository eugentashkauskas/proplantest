module ap.specHelper.viewModel {
    export class deferredLoadNextPage {

        resolveLoadIds(data) {
            this._defLoadIds.resolve(data);
        }
        resolveLoadPage(data) {
            this._defLoadPage.resolve(data);
        }

        reSpy() {
            this._defLoadIds = this.$q.defer(), this._defLoadPage = this.$q.defer();

            let vm = this;

            this._idsSpy.and.callFake(function (entityName) {
                if ((vm._customEntityIds !== null && vm._customEntityIds === vm._listViewModel.options.customEntityIds) || (entityName == vm._listViewModel.entityName))
                    return vm._defLoadIds.promise;
            });

            this._listSpy.and.callFake(function (entityName) {
                if (entityName == vm._listViewModel.entityName)
                    return vm._defLoadPage.promise;
            });
        }

        constructor(private _defLoadIds, private _defLoadPage, private _idsSpy, private _listSpy, private $q, private _listViewModel, private _customEntityIds) {
        }
    }

    export class GenericPagedListVm {
        stubLoadNextPage(list: ap.viewmodels.GenericPagedListViewModels, Api: ap.services.apiHelper.Api, $q: angular.IQService, Utility: ap.utility.UtilityHelper, customEntityIds: string = null): deferredLoadNextPage {
            let _listViewModel = list;
            let _customEntityIds = customEntityIds;

            let defIds = $q.defer(),
                defPage = $q.defer();

            let _idsSpy = spyOn(Api, "getEntityIds").and.callFake(function (entityName) {
                if ((_customEntityIds !== null && _customEntityIds === _listViewModel.options.customEntityIds) || (entityName == _listViewModel.entityName))
                    return defIds.promise;
            });

            let _listSpy = spyOn(Api, "getEntityList").and.callFake(function (entityName) {
                if (entityName == _listViewModel.entityName)
                    return defPage.promise;
            });

            return new deferredLoadNextPage(defIds, defPage, _idsSpy, _listSpy, $q, _listViewModel, _customEntityIds);
        }
    }

    export class VmSpecHelper {
        private static _genericPagedListVm: GenericPagedListVm = new GenericPagedListVm();

        public static get genericPagedListVm() {
            return this._genericPagedListVm;
        }

        constructor() { }

    }
}