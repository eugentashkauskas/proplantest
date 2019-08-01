module ap.viewmodels.projects {

    export interface IProjectItem extends IEntityViewModel {
        name: string;
        code: string;
        creator: string;
        displayName: string;
        startDate: Date;
        logoPath: string;
        hasNotThumb(): boolean;
    }

    export interface IProjectsViewModel extends angular.IScope {
        isThumbView: boolean;
        listVm: ap.viewmodels.GenericPagedListViewModels;
        refresh(): void;
        acceptSelection(): void;
        toggleView(): void;
        itemsInfinite: IVirtualInfiniteRepeat;
    }
}