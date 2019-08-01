module ap.viewmodels.notes {

    /**
    * This class to managed actions of a note in notes list
    **/
    export class NoteActionsViewModel implements IDispose {

        /**
        * Public getter to note
        **/
        public get note(): ap.models.notes.Note {
            return this._note;
        }

        /**
        * Public getter to noteAccessRight
        */
        public get noteAccessRight(): ap.models.accessRights.NoteAccessRight {
            return this._accessright;
        }

        /**
        * Property to access the curent available actions
        **/
        public get actions(): ap.viewmodels.home.ActionViewModel[] {
            return this._actions;
        }

        /**
        * Use to know if the action info should be displayed
        **/
        public get withInfo(): boolean {
            return this._withInfo;
        }

        /**
        * Use to set withInfo which determines if the action should be displayed
        **/
        public set withInfo(withInfo: boolean) {
            if (withInfo !== this._withInfo) {
                this._withInfo = withInfo;
                this.computeActionInfoVisibility();
                this.updateVisibleActionsCount();
            }
        }

        /**
        * This method use to count how many items can be visible on UI
        */
        public get visibleActionsCount(): number {
            return this._visibleActionsCount;
        }

        /**
        * This methode update the note
        **/
        public updateNote(note: ap.models.notes.Note) {
            if (note.Id !== this._note.Id) throw new Error("The note is not the same, cannot update it");
            this._note = note;
            this.computeActionsVisibility();
        }

        /**
        * NEED TO BE REMOVE WHEN ACTIONS WILL BE MANAGED
        * Update actions visibility for forms
        **/
        public disableNotesActionsForForms() {
            this._copyAction.isVisible = false;
            this._editAction.isVisible = false;
            this._editAction.isEnabled = false;
            this._assignAction.isEnabled = false;
            this._infoAction.isVisible = false;
            this._infoAction.isEnabled = false;
            this._copyToAction.isVisible = false;
            this._copyToAction.isEnabled = false;
            this._moveToAction.isVisible = false;
            this._moveToAction.isEnabled = false;
        }

        /**
        * Event handler when the note updated
        * @param e: NoteUpdatedEvent
        **/
        private noteUpdated(e: ap.models.notes.Note);
        private noteUpdated(e: ap.controllers.NoteBaseUpdatedEvent);
        private noteUpdated(e: any) {
            if (e instanceof ap.models.notes.Note)
                this._updateNote(<ap.models.notes.Note>e);
            else if (e instanceof ap.controllers.NoteBaseUpdatedEvent)
                this._updateNote(<ap.models.notes.Note>(<ap.controllers.NoteBaseUpdatedEvent>e).notes[0]);
        }

        /**
        * This will be called by documentUpdated and documentStatusRefreshed
        **/
        private _updateNote(note: ap.models.notes.Note): void {
            if (note && this._note && note.Id === this._note.Id) {
                this._accessright = new ap.models.accessRights.NoteAccessRight(this._utility, note);
                if (note.EntityVersion !== this._note.EntityVersion || note.Deleted) {
                    this._note = note;
                    this.computeActionsVisibility();
                }
            }
        }

        /**
        * Dispose method
        */
        public dispose() {
            this._controllersManager.noteController.off("notedeleted", this.noteUpdated, this);
            this._controllersManager.noteController.off("notearchived", this.noteUpdated, this);
            this._controllersManager.noteController.off("noteunarchived", this.noteUpdated, this);
        }

        /*
        * Build available actions for a single document
        */
        private computeActionsVisibility(): void {
            let canChangeUrgent = this._accessright && this._accessright !== null && this._accessright.canEditEntirePoint;

            this._archiveAction.isVisible = this._accessright.hasArchiveAccess;
            this._archiveAction.isEnabled = this._accessright.canArchive;
            this._unarchiveAction.isVisible = this._accessright.hasUnarchiveAccess;
            this._unarchiveAction.isEnabled = this._accessright.canUnarchive;
            this._deleteAction.isEnabled = this._accessright.canDelete;
            this._deleteAction.isVisible = this._accessright.canDelete;
            this._editAction.isVisible = this._accessright.canEdit;
            this._editAction.isEnabled = this._accessright.canEdit;
            this._assignAction.isEnabled = this._accessright.canEditEntirePoint || this._accessright.canEditUserInCharge;
            this._urgentAction.isVisible = this._accessright.canEdit && !this._note.IsUrgent;
            this._urgentAction.isEnabled = canChangeUrgent && !this._note.IsUrgent;
            this._unurgentAction.isVisible = this._accessright.canEdit && this._note.IsUrgent;
            this._unurgentAction.isEnabled = canChangeUrgent && this._note.IsUrgent;
            this._copyToAction.isVisible = this._utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_MeetingManagement);
            this._copyToAction.isEnabled = this._utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_MeetingManagement);
            this._moveToAction.isVisible = this._accessright.hasMoveList;
            this._moveToAction.isEnabled = this._accessright.canMoveList;

            this.computeActionInfoVisibility();
            this.computeActionCopyVisibility();

            this.updateVisibleActionsCount();
        }

        /**
        * Set infoAction visible/enable to true or false depends on withAction
        **/
        private computeActionInfoVisibility() {
            if (this.withInfo) {
                this._infoAction.isVisible = true;
                this._infoAction.isEnabled = true;
            } else {
                this._infoAction.isVisible = false;
                this._infoAction.isEnabled = false;
            }
        }

        /**
         * Set copyAction visible/enable depending on the meeting access right
         */
        private computeActionCopyVisibility() {
            let action = this._copyAction;
            let accessRight = this._note ? this._note.MeetingAccessRight : null;

            if (accessRight) {
                action.isVisible = accessRight.CanAddPoint;
                action.isEnabled = accessRight.CanAddPoint && !this._note.IsReadOnly;
            } else {
                action.isVisible = false;
                action.isEnabled = false;
            }
        }

        /**
         * Calculates an amount of visible actions in the view model and stores it to the attribute
         */
        private updateVisibleActionsCount() {
            let result = 0;
            for (let action of this._actions) {
                if (action.isVisible) {
                    result++;
                }
            }
            this._visibleActionsCount = result;
        }

        constructor(private _utility: ap.utility.UtilityHelper, private _note: ap.models.notes.Note, private _controllersManager: ap.controllers.ControllersManager, private _withInfo = true) {

            this._accessright = new ap.models.accessRights.NoteAccessRight(_utility, _note);

            this._controllersManager.noteController.on("notedeleted", this.noteUpdated, this);
            this._controllersManager.noteController.on("notearchived", this.noteUpdated, this);
            this._controllersManager.noteController.on("noteunarchived", this.noteUpdated, this);

            this._infoAction = new ap.viewmodels.home.ActionViewModel(this._utility, _utility.EventTool, "note.gotodetail", _utility.rootUrl + "Images/html/icons/ic_info_black_48px.svg", false, null, "Info", false);
            this._urgentAction = new ap.viewmodels.home.ActionViewModel(this._utility, _utility.EventTool, "urgentnote", _utility.rootUrl + "Images/html/icons/ic_star_black_48px.svg", false, null, "Mark the point as important", false);
            this._unurgentAction = new ap.viewmodels.home.ActionViewModel(this._utility, _utility.EventTool, "unurgentnote", _utility.rootUrl + "Images/html/icons/ic_star_border_black_48px.svg", false, null, "Unmark the point as important", false);
            this._editAction = new ap.viewmodels.home.ActionViewModel(this._utility, _utility.EventTool, "editnote", _utility.rootUrl + "Images/html/icons/ic_create_black_48px.svg", false, null, "Edit the point", false, false, new ap.misc.Shortcut("e"));
            this._archiveAction = new ap.viewmodels.home.ActionViewModel(this._utility, _utility.EventTool, "archivenote", _utility.rootUrl + "Images/html/icons/ic_archive_black_48px.svg", false, null, "Archive the point", false);
            this._unarchiveAction = new ap.viewmodels.home.ActionViewModel(this._utility, _utility.EventTool, "unarchivenote", _utility.rootUrl + "Images/html/icons/ic_unarchive_black_48px.svg", false, null, "Unarchive the point", false);
            this._deleteAction = new ap.viewmodels.home.ActionViewModel(this._utility, _utility.EventTool, "deletenote", _utility.rootUrl + "Images/html/icons/ic_delete_black_48px.svg", false, null, "Delete the point", false, false, new ap.misc.Shortcut("d"));
            this._assignAction = new ap.viewmodels.home.ActionViewModel(this._utility, _utility.EventTool, "note.assign", null, false, null, null, true, false, new ap.misc.Shortcut("a"));
            this._copyAction = new ap.viewmodels.home.ActionViewModel(this._utility, _utility.EventTool, "note.copy", _utility.rootUrl + "Images/html/icons/ic_content_copy_black_48px.svg", false, null, "Copy", false);
            this._copyToAction = new ap.viewmodels.home.ActionViewModel(this._utility, _utility.EventTool, "note.copyto", _utility.rootUrl + "Images/html/icons/ic_content_copy_black_48px.svg", false, null, "Copy to", false);
            this._moveToAction = new ap.viewmodels.home.ActionViewModel(this._utility, _utility.EventTool, "note.moveto", _utility.rootUrl + "Images/html/icons/moveto.svg", false, null, "Move to", false);
            this._actions = [
                this._infoAction,
                this._editAction,
                this._copyAction,
                this._copyToAction,
                this._moveToAction,
                this._urgentAction,
                this._unurgentAction,
                this._archiveAction,
                this._unarchiveAction,
                this._deleteAction,
                this._assignAction
            ];

            this.computeActionsVisibility();
        }

        // Private
        private _accessright: ap.models.accessRights.NoteAccessRight;
        private _actions: ap.viewmodels.home.ActionViewModel[];
        private _visibleActionsCount: number;
        private _assignAction: ap.viewmodels.home.ActionViewModel;
        private _urgentAction: ap.viewmodels.home.ActionViewModel;
        private _unurgentAction: ap.viewmodels.home.ActionViewModel;
        private _archiveAction: ap.viewmodels.home.ActionViewModel;
        private _unarchiveAction: ap.viewmodels.home.ActionViewModel;
        private _deleteAction: ap.viewmodels.home.ActionViewModel;
        private _editAction: ap.viewmodels.home.ActionViewModel;
        private _infoAction: ap.viewmodels.home.ActionViewModel;
        private _copyAction: ap.viewmodels.home.ActionViewModel;
        private _copyToAction: ap.viewmodels.home.ActionViewModel;
        private _moveToAction: ap.viewmodels.home.ActionViewModel;
    }
}