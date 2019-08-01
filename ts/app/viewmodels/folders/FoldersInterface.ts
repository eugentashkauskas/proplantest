module ap.viewmodels.folders {

    export interface IFolderItem {
        name: string;
    }

    export interface IFoldersViewModel {
        listVm: ap.viewmodels.GenericPagedListViewModels;
        refresh(): void;
    }
}