module ap.viewmodels.notes {
    export class NoteItemViewModel extends NoteBaseItemViewModel implements INoteItem, IDispose {

        public room: string;
        public status: string;
        public statusColor: string;
        public noteAccessRight: ap.models.accessRights.NoteAccessRight;

        constructor(utility: ap.utility.UtilityHelper, $q: angular.IQService, parentListVm: ap.viewmodels.BaseListEntityViewModel, protected parameters?: UserCommentItemConstructorParameter) {
            super(utility, $q, parentListVm, parameters);
            if (!this._controllers)
                throw new Error("Argument controllerManager cannot be null");

            this._controllers.noteController.on("notestatusupdated", this._onNoteStatusUpdated, this);
        }

        /**
        * This is the vm to manage the actions of the note
        **/
        public get noteActionViewModel(): NoteActionsViewModel {
            return this._noteActionsViewModel;
        }

        public get originalNote(): ap.models.notes.Note {
            return <ap.models.notes.Note>this.originalEntity;
        }

        public get noteProjectStatusList(): ap.viewmodels.projects.noteProjectStatus.NoteProjectStatuslistViewModel {
            return this._noteprojectStatusListVm;
        }

        public getGroupValue(groupName: string) {
            let groupValue = super.getGroupValue(groupName);
            switch (groupName) {
                case "Status":
                    return this._getStatusGroupName();
                case "Room":
                    return this._getRoomLevel2GroupName();
            }
            return groupValue;
        }

        protected _getStatusGroupName(): string {
            let groupName: string = "Invalid";

            if (this.meetingAccessRight.Level === ap.models.accessRights.AccessRightLevel.Subcontractor) {
                groupName = this.originalNote.Status.IsTodo ? this.$utility.Translator.getTranslation("To Do") : this.$utility.Translator.getTranslation("Done");
            } else {
                if (this.originalNote.Status) {
                    groupName = this.originalNote.Status.Name;
                }
            }

            return groupName;
        }

        protected _getRoomLevel2GroupName(): string {
            let groupName: string = "No room";

            if (this.originalNote.Cell) {
                groupName = this.originalNote.Cell.Code + " / " + this.originalNote.Cell.Description;
            }

            return groupName;
        }

        public get isGroupEntity(): boolean {
            return ap.utility.UtilityHelper.isEmptyGuid(this._originalEntity.Id);
        }

        dispose() {
            if (this._noteprojectStatusListVm) {
                this._noteprojectStatusListVm.off("selectedItemChanged", this._changeNoteStatus, this);
            }

            if (this._controllers.noteController) {
                this._controllers.noteController.off("notestatusupdated", this._onNoteStatusUpdated, this);
            }

            if (this._noteActionsViewModel) {
                this._noteActionsViewModel.dispose();
            }
        }

        copySource(): void {
            super.copySource();

            if (this.originalEntity !== null) {
                if (this.originalNote.MeetingAccessRight) {
                    this.meetingAccessRight = this.originalNote.MeetingAccessRight;
                }
                this.noteAccessRight = new ap.models.accessRights.NoteAccessRight(this.$utility, this.originalNote);
                if (this._noteprojectStatusListVm) {
                    this._noteprojectStatusListVm.dispose();
                }
                this._noteprojectStatusListVm = new ap.viewmodels.projects.noteProjectStatus.NoteProjectStatuslistViewModel(this.$utility, this._controllers, this.$q, false, this.meetingAccessRight, true);

                let vm = this;
                this._noteprojectStatusListVm.on("selectedItemChanged", vm._changeNoteStatus, vm);
                this._noteprojectStatusListVm.refresh(this.originalNote.Status);
                if (this.originalNote.Id !== ap.utility.UtilityHelper.createEmptyGuid() && this.originalNote.Status && this.originalNote.Status.IsDisabled) {
                    // In this case, we assign it directly to the point because disabled statuses are not loaded in the statuses list and therefore cannot be selected
                    this._setStatusAndColor(this.originalNote.Status);
                }

                if (this.originalNote.Cell !== undefined && this.originalNote.Cell !== null) {
                    this.room = this.originalNote.Cell.Code;
                } else {
                    this.room = ""; // clear the room field if the note is updated with an empty room
                }
            }
            this.buildActions();
        }

        /**
        * Method use to manage the double click on detail pane
        * Need to check if user has access to edit the point.
        * If yes -> launche edit action, else -> do nothing
        **/
        public editActionClick(isNoteModule: boolean = true) {
            if (this.noteAccessRight.canEdit && isNoteModule) {
                this.actionClick("editnote");
            }
        }

        /*
        * Handle click on actions
        * @param actionName name of defined ation
        * @param actionArgs arguments of the action
        */
        public actionClick(actionName: string, actionArgs?: any) {
            let action: ap.viewmodels.home.ActionViewModel;
            action = ap.viewmodels.home.ActionViewModel.getAction(this._noteActionsViewModel.actions, actionName);

            if (action  && action.isEnabled) {
                switch (actionName) {
                    case "urgentnote":
                        this._controllers.noteController.markNoteAsUrgent(this.originalNote);
                        break;
                    case "unurgentnote":
                        this._controllers.noteController.markNoteAsNotUrgent(this.originalNote);
                        break;
                    case "deletenote":
                        this._controllers.noteController.deleteNote(this.originalNote);
                       break;
                    case "archivenote":
                        this._controllers.noteController.archiveNote(this.originalNote);
                       break;
                    case "unarchivenote":
                        this._controllers.noteController.unarchiveNote(this.originalNote);
                        break;
                    case "editnote":
                        this._controllers.noteController.requestEditNote(this.originalNote);
                        break;
                    case "note.assign":
                        this._controllers.noteController.requestAssignNote(this.originalNote);
                        break;
                    case "note.copyto":
                        this._controllers.noteController.requestCopyToNote(this.originalNote);
                        break;
                    case "note.gotodetail":
                        this._controllers.noteController.requestInfoNote(this.originalNote);
                        break;
                    case "note.copy":
                        this._controllers.noteController.requestCopyNote(this.originalNote);
                        break;
                    case "note.moveto":
                        this._controllers.noteController.requestMoveNote(this.originalNote);
                        break;
                    case "note.adddocument":
                        this._controllers.noteController.requestAddDocument(this.originalNote, <File[]>actionArgs);
                        break;
                    case "note.importdocument":
                        this._controllers.noteController.requestImportDocument(this.originalNote);
                        break;
                }
            }
            if (!action)
                throw new Error("The action " + actionName + " is not available");
        }

        public updateNoteIsRead(): void {
            if (this.isRead)
                return;

            this._controllers.noteController.updateNoteIsRead(this.originalNote);
        }

        /**
        * Init the noteActionViewModel
        **/
        private buildActions() {
            if (this._noteActionsViewModel && this._noteActionsViewModel.note) {
                if (this._noteActionsViewModel.note.Id !== this.originalNote.Id) {
                    this._noteActionsViewModel.dispose();
                    this._noteActionsViewModel = new NoteActionsViewModel(this.$utility, this.originalNote, this._controllers);
                } else {
                    this._noteActionsViewModel.updateNote(this.originalNote);
                }
            } else {
                this._noteActionsViewModel = new NoteActionsViewModel(this.$utility, this.originalNote, this._controllers);
            }
        }

        private _changeNoteStatus() {
            if (!this._noteprojectStatusListVm || !this._noteprojectStatusListVm.selectedViewModel) {
                return;
            }

            let originalStatus = this.originalNote.Status;
            let selectedStatus = <ap.models.projects.NoteProjectStatus>this._noteprojectStatusListVm.selectedViewModel.originalEntity;

            // We cannot rely only on ids because fake statuses may have same ids
            if (originalStatus.Id !== selectedStatus.Id || originalStatus.IsDone !== selectedStatus.IsDone || originalStatus.IsBlocked !== selectedStatus.IsBlocked) {
                this._controllers.noteController.changeNoteStatus(this.meetingAccessRight.Level, this.originalNote, selectedStatus).then(null, (error) => {
                    // if error, set the selectedVm to the original one
                    this._noteprojectStatusListVm.selectEntity(originalStatus.Id);
                });
            } else if (!this.status || !this.statusColor || selectedStatus.Name !== this.status || selectedStatus.Color !== this.statusColor) {
                // initialize the status with the selected VM
                this._setStatusAndColor(selectedStatus);
            }
        }

        private _setStatusAndColor(sts: ap.models.projects.NoteProjectStatus) {
            this.status = sts.Name;
            this.statusColor = "#" + sts.Color;
        }

        private _onNoteStatusUpdated(result: any) {
            let updatedNote: ap.models.notes.Note = result.updatedNote;
            let newStatus: ap.models.projects.NoteProjectStatus = result.newStatus;
            if (this.originalNote && updatedNote && updatedNote.Id === this.originalNote.Id) {
                this.originalEntity.updateEntityPropsOnly(updatedNote);
                this.originalNote.Status = newStatus;
                this._setStatusAndColor(<ap.models.projects.NoteProjectStatus>newStatus);
            }
        }

        private _noteprojectStatusListVm: ap.viewmodels.projects.noteProjectStatus.NoteProjectStatuslistViewModel;
        private _noteActionsViewModel: NoteActionsViewModel = null;
    }
}