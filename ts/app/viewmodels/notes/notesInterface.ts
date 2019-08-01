module ap.viewmodels.notes {

    export interface INoteItem extends IEntityViewModel {
        codeNum: string;
        subject: string;
        from: string;
        room: string;
        category: string;
        status: string;
        statusColor: string;
        inCharge: string;
        inChargeList: ap.models.notes.NoteInCharge[];
    }

    export interface INotesViewModel {
        listVm: ap.viewmodels.GenericPagedListViewModels;
        refresh(): void;
    }
}