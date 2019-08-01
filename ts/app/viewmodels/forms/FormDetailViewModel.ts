module ap.viewmodels.forms {

    export class FormDetailViewModel extends notes.NoteDetailBaseViewModel {

        /**
        * Used to get the form
        **/
        public get form(): ap.models.forms.Form {
            return <ap.models.forms.Form>this.originalEntity;
        }

        /**
       * Used to set the form
       */
        protected setNoteBase(form: ap.models.forms.Form) {
            super.setNoteBase(form);
            this.setFormAccessRight(new ap.models.accessRights.FormAccessRight(this.$utility, form));
        }

        /**
        * This is to know how many questions have been responded
        **/
        public get progress(): string {
            return this._itemsDoneCount.toString() + "/" + this._itemsCount.toString();
        }

        /**
         * This is the type for which the template is created
         **/
        public get type(): ap.models.forms.FormType {
            return this._type;
        }

        /**
         * To know in which language the form is filled
         **/
        public get language(): ap.models.identFiles.Language {
            return this._language;
        }

        /**
         * This is the status of the form. Check rules
         **/
        public get status(): string {
            return this._status;
        }

        /**
        * This is the status color
        **/
        public get statusColor(): string {
            return this._statusColor;
        }

        /**
         * This is the date when the form has been finalized
         **/
        public get doneDate(): Date {
            return this._donedate;
        }

        /**
         * This is the id of the template from where the form has been created
         **/
        public get templateId(): string {
            return this._templateId;
        }

        /**
         * To know if there are at least one form'item for which the supplied value is not conform
         **/
        public get isConform(): string {
            return this._notConformItemsCount + " " + this.$utility.Translator.getTranslation("non conformity");
        }

        /**
         * This is the list of questions with the answer if already filled and the user who answered the question
         **/
        public get items(): ap.models.forms.FormItem[] {
            return this._items;
        }

        /**
        * The list of notes linked to the form
        **/
        public get noteListVm(): ap.viewmodels.notes.NoteListViewModel {
            return this._noteList;
        }

        /**
        * Method used to open the detail of a point linked to a form
        *
        public toggleRight() {
            // Will be developped in AP-18009
        }*/

        /**
        * The access right of the note
        */
        public get formAccessRight(): ap.models.accessRights.FormAccessRight {
            return <ap.models.accessRights.FormAccessRight>this._noteAccessRight;
        }

        /**
         * Returns True if the Form can be edited, False otherwise
         */
        public get canEdit(): boolean {
            return this._canEdit;
        }

        /**
         * Method used to set the note access right of the user
         * @param access the note access right of the user
         */
        protected setFormAccessRight(access: ap.models.accessRights.FormAccessRight) {
            if (access !== this._noteAccessRight) {
                this._noteAccessRight = access;
                let originalAccessRight = this._noteAccessRight;
                this.raisePropertyChanged("formAccessRight", originalAccessRight, this);
            }
        }

        /**
         * Used to init the different properties
         */
        public copySource(): void {
            super.copySource();
            if (this.form) {
                this._items = this.form.Items;
                this._isConform = this.form.IsConform;
                this._templateId = this.form.TemplateId;
                this._donedate = this.form.DoneDate;
                this._language = this.form.Language;
                this._type = this.form.Type;
                this._accessright = new ap.models.accessRights.FormAccessRight(this.$utility, this.form);
                this._canEdit = this._accessright.canEdit && this.form.Status !== ap.models.forms.FormStatus.Done;
                this.computeStatusFields();
            }
        }

        /** 
        * Method to load the infos of the form
        * @param formId? The Id of the form to load
        **/
        public loadForm(formId?: string, needToReloadAfterUpdate: boolean = false): angular.IPromise<any> {
            let defer = this.$q.defer();
            if (formId && (!this.noteBase || (this.noteBase && this.noteBase.Id !== formId) || this.needReloadEntity) || needToReloadAfterUpdate) {
                this.initData();
                this.needReloadEntity = false;
                this.preventScroll = true;
                this.$controllersManager.formController.getFullFormById(formId, true).then((form: ap.models.forms.Form) => {
                    this.loadList(formId);
                    if (form.NoteDocuments) {
                        let oldNoteDocuments = form.NoteDocuments.slice();
                        // if FormItemId !== null it means that the document is not linked to the form but of one question (which id = FormItemId)
                        // so need to remove those documents only need to keep the form's documents
                        let noteDocumentsOfForm: models.notes.NoteDocument[] = oldNoteDocuments.filter((item: models.notes.NoteDocument) => {
                            return !!!item.FormItemId;
                        });
                        form.NoteDocuments.splice(0);
                        form.NoteDocuments = noteDocumentsOfForm.slice();
                    }
                    this.$controllersManager.formController.countFormItems(form.Id).then((num: number) => {
                        this._itemsCount = num;
                        if (this._itemsCount > 0) {
                            this.$controllersManager.formController.getFormsItems(form.Id).then((formItems: models.forms.FormItem[]) => {
                                this._items = formItems;
                            });
                        }
                    });
                    this.$controllersManager.formController.countItemsDone(form.Id).then((num: number) => {
                        this._itemsDoneCount = num;
                    });
                    if (form.IsConform === false) {
                        this.$controllersManager.formController.countNotConformFormItems(form.Id).then((num: number) => {
                            this._notConformItemsCount = num;
                        });
                    }
                    this.setNoteBase(form);
                    defer.resolve();
                }, (error: any) => {
                    this.$controllersManager.mainController.showError(this.$utility.Translator.getTranslation("app.cannot.load.note.data"), this.$utility.Translator.getTranslation("app.err.general_title"), error, null);
                    defer.reject(error);
                });
            } else {
                defer.resolve();
            }
            return defer.promise;
        }


        /**
         * Initializes the view model using the given form model
         * @param form A form model to use
         */
        public init(form: ap.models.forms.Form) {
            this.initData();
            this.setNoteBase(form);
        }

        public dispose() {
            super.dispose();
            if (this.noteListVm) {
                this.noteListVm.dispose();
                this._noteList = null;
            }
        }

        protected initData() {
            super.initData();
            this._items = [];
            this._notConformItemsCount = 0;
            this._itemsCount = 0;
            this._itemsDoneCount;
            this._isConform = false;
            this._templateId = null;
            this._donedate = null;
            this._status = null;
            this._language = null;
            this._type = ap.models.forms.FormType.Quality;
        }

        /**
         * Methode used to
         * @param form
         */
        protected update(form: ap.models.forms.Form) {
            this.setNoteBase(form);
        }

        /**
         * Method used to init the status and the status color of the form
         */
        private computeStatusFields() {
            if (this.originalEntity.Id !== ap.utility.UtilityHelper.createEmptyGuid()) {
                this._status = "app.formstatus." + ap.models.forms.FormStatus[this.form.Status];

                switch (this.form.Status) {
                    case ap.models.forms.FormStatus.Todo:
                        this._statusColor = "todo";
                        break;
                    case ap.models.forms.FormStatus.InProgress:
                        this._statusColor = "inprogress";
                        break;
                    case ap.models.forms.FormStatus.Done:
                        this._statusColor = "done";
                        break;
                }
            }
        }

        /**
        * Handler method called when a page of notes is loaded
        */
        private pageloadedhandler(loadedItems: notes.NoteItemViewModel[]) {
            this.disableNotesActionsForForms(loadedItems);
        }

        /**
         * Disable some specific actions of notes
         * @param items
         */
        private disableNotesActionsForForms(items: notes.NoteItemViewModel[]) {
            for (let i = 0; items.length > i; i++) {
                items[i].noteActionViewModel.disableNotesActionsForForms();
            }
        }

        /**
         * Handler method called when some items are updated
         * @param updatedItems
         */
        private itemsUpdated(updatedItems: notes.NoteItemViewModel[]) {
            this.disableNotesActionsForForms(updatedItems);
        }

        private loadList(formId?: string) {
            this._noteList = new ap.viewmodels.notes.NoteListViewModel(this.$scope, this.$utility, this._api, this.$controllersManager, this.$q, this.$servicesManager, this.$timeout, this.$mdDialog, false, null, formId);
            this.noteListVm.listVm.on("pageloaded", this.pageloadedhandler, this);
            this.noteListVm.listVm.on("itemsupdated", this.itemsUpdated, this);
            this.noteListVm.screenInfo.mainSearchInfo.clearCriterions();
            this.noteListVm.screenInfo.mainSearchInfo.clearProperties();
            this.noteListVm.loadData();
            this.noteListVm.updateHasActiveNotes();

        }

        constructor($utility: ap.utility.UtilityHelper, $mdDialog: angular.material.IDialogService, protected $q: angular.IQService, _api: ap.services.apiHelper.Api, $controllersManager: ap.controllers.ControllersManager, $servicesManager: ap.services.ServicesManager, formId: string,
            $location: angular.ILocationService, $anchorScroll: angular.IAnchorScrollService, $interval: angular.IIntervalService, protected $scope: ng.IScope, protected $timeout: angular.ITimeoutService) {
            super($utility, $mdDialog, $q, _api, $controllersManager, $servicesManager, formId, $location, $anchorScroll, $interval);
            this.loadForm(formId);
        }

        private _items: ap.models.forms.FormItem[];
        private _isConform: boolean;
        private _templateId: string;
        private _donedate: Date;
        private _status: string;
        private _statusColor: string;
        private _language: ap.models.identFiles.Language;
        private _type: ap.models.forms.FormType;
        private _itemsDoneCount: number = 0;
        private _itemsCount: number = 0;
        private _notConformItemsCount: number = 0;
        private _noteList: ap.viewmodels.notes.NoteListViewModel;
        private _canEdit: boolean = false;
        private _accessright: ap.models.accessRights.FormAccessRight;
    }
}