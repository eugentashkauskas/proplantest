module ap.viewmodels.notes {
    export class NoteCommentListViewModel extends ListEntityViewModel implements IDispose {
        /**
         * This property is to know if archived comments should be also displayed in the list
         **/
        public get isShowingArchive(): boolean {
            return this._isShowingArchive;
        }

        public set isShowingArchive(value: boolean) {
            if (this._isShowingArchive !== value) {
                this._isShowingArchive = value;

                this.showHideArchivedComments();
                this.$utility.Storage.Session.set("note.showarchivedcomments", this._isShowingArchive);
            }
        }

        /**
         * This property is to know if the options to display archived comment is necessary. If there is no archived comments, no need of the option.
         **/
        public get needShowArchive(): boolean {
            return this._needShowArchive;
        }

        /**
         * This property returns the comment tagged like isFirst of the note
         **/
        public get firstComment(): NoteCommentViewModel {
            return this._firstComment;
        }

        /**
         * NoteViewModel property.
         * noteViewModel is the parent of this Class.
         */
        public get noteViewModel(): ap.viewmodels.notes.NoteDetailBaseViewModel {
            return this._noteViewModel;
        }

        public set noteViewModel(noteVm: ap.viewmodels.notes.NoteDetailBaseViewModel) {
            if (this._noteViewModel !== noteVm) {
                this._noteViewModel = noteVm;
            }

            this._note = this.noteViewModel ? this._noteViewModel.noteBase : null;
            this.initCollection();
        }

        /**
         * This getter will returns true if there was a modification in the collection of comment. Edition, deletion or new comment.
         **/
        public get hasChanged(): boolean {
            if (!this._note.Comments)
                this._note.Comments = [];

            // edit and added
            for (let sourceItem of this.sourceItems) {
                let sourceNoteComment: ap.viewmodels.notes.NoteCommentViewModel = <ap.viewmodels.notes.NoteCommentViewModel>sourceItem;

                let found: boolean = false;
                for (let noteComment of this._note.Comments) {
                    if (sourceNoteComment.noteComment.Id === noteComment.Id) {
                        // the comment exist already
                        if (sourceNoteComment.comment !== noteComment.Comment) {
                            return true; // but has been changed
                        }

                        found = true;
                        break;
                    }
                }

                if (!found)
                    return true;
            }

            // removed
            for (let noteComment of this._note.Comments) {
                if (noteComment.IsArchived)
                    continue;

                let found: boolean = false;
                for (let sourceItem of this.sourceItems) {
                    let sourceNoteComment: ap.viewmodels.notes.NoteCommentViewModel = <ap.viewmodels.notes.NoteCommentViewModel>sourceItem;
                    if (sourceNoteComment.noteComment.Id === noteComment.Id) {
                        found = true;
                        break;
                    }

                }

                if (!found)
                    return true;

            }

            return false;
        }

        /**
         * This method is used for save comment in edit mode
         * @param comment: edited comment
         */
        public saveComment(comment: ap.viewmodels.notes.NoteCommentViewModel) {
            comment.postChanges();
            this._noteController.saveComment(comment.noteComment, <ap.models.notes.Note>this._note);
            this.changeInputEditMode(comment);
        }

        /**
         * This method is used for adding comment list
         * @param comment edited comment
         */
        public addCommentToList(comment: ap.viewmodels.notes.NoteCommentViewModel) {
            comment.on("editcommentrequested", this.editCommentRequested, this);
            this.sourceItems.unshift(comment);
        }

        /**
         * This method is used for cancel edit comment in edit mode
         * @param comment: edited comment
         */
        public cancelEditComment(comment: ap.viewmodels.notes.NoteCommentViewModel) {
            comment.copySource();
            this.changeInputEditMode(comment, false);
        }

        /**
         * This method is used for change textarea field in edit mode
         * @param comment: edited comment
         */
        private changeInputEditMode(comment: ap.viewmodels.notes.NoteCommentViewModel, isSave: boolean = true) {
            comment.isEditMode = false;
            let editWindowOpened: boolean = false;
            let lastCommentEdited: ap.viewmodels.notes.NoteCommentViewModel;
            this.sourceItems.forEach((item: ap.viewmodels.notes.NoteCommentViewModel) => {
                if (item.isEditMode) {
                    this.noteViewModel.isDisabled = true;
                    this.noteViewModel.isFocusOnNewComment = false;
                    if (item.isDisabled) {
                        lastCommentEdited = item;
                    }
                    editWindowOpened = true;
                }

                if (!isSave) {
                    item.isDisabled = false;
                }
            });
            if (!editWindowOpened) {
                this.noteViewModel.isDisabled = false;
            }
            if (lastCommentEdited) {
                lastCommentEdited.isDisabled = false;
            }
            if (this.noteViewModel.newComment && !editWindowOpened) {
                this.noteViewModel.isFocusOnNewComment = true;
            }
        }

        /*
        * Update the view to also display archived comments
        */
        private updateNeedToShowArchive(): void {
            let wasNeeded = this._needShowArchive;
            if (this._note && this._note.Comments) {
                for (let i = 0; i < this._note.Comments.length; i++) {
                    if (this._note.Comments[i].IsArchived && !this._note.Comments[i].Deleted) {
                        this._needShowArchive = true;
                        return;
                    }
                }
            }

            this._needShowArchive = false;
        }

        /*
        * Event handler, this called when there is a comment delete
        * @param comment: deleted comment
        */
        private commentDeleted(comment: ap.models.notes.NoteComment): void {
            if (this.sourceItems) {
                let toRemoveIndex: number = -1;

                for (let i = 0; i < this.sourceItems.length; i++) {
                    if ((<NoteCommentViewModel>this.sourceItems[i]).noteComment.Id === comment.Id) {
                        toRemoveIndex = i;
                        break;
                    }
                }

                if (toRemoveIndex >= 0) {
                    let itemsDel = this.sourceItems.splice(toRemoveIndex, 1);
                    this._disposeItems(itemsDel);
                    this._setCount(this.count - 1);
                }

                this.updateNeedToShowArchive();
            }
        }

        /*
        * Initialize the array of comments
        */
        private initCollection(): void {
            // Check to dispose old vm first
            let vm = this;
            this._disposeItems(this.sourceItems);
            let items: ap.viewmodels.notes.NoteCommentViewModel[] = [];
            if (this._note && this._note.Comments) {
                this._note.Comments.forEach((comment) => {
                    if (comment.IsArchived && !this.isShowingArchive) {
                        return;
                    }
                    if (comment.IsFirst) {
                        this._firstComment = this.initNoteComment(comment, this._note);
                        items.push(this._firstComment);
                    } else {
                        items.push(this.initNoteComment(comment, this._note));
                    }
                });
                if (items.length > 1) {
                    items.sort((a: NoteCommentViewModel, b: NoteCommentViewModel) => b.date.getTime() - a.date.getTime());
                }
            }
            this.onLoadItems(items, false);
            this.updateNeedToShowArchive();
        }

        /**
        * This method is used to fire the event 'editcommentrequested' when the child fired this event
        * @param noteCommentVm is the sender of this event
        **/
        private editCommentRequested(noteCommentVm: ap.viewmodels.notes.NoteCommentViewModel) {
            this._listener.raise("editcommentrequested", noteCommentVm);
            this.sourceItems.forEach((item: ap.viewmodels.notes.NoteCommentViewModel) => {
                if (item.isEditMode) {
                    this.noteViewModel.isDisabled = true;
                    this.noteViewModel.isFocusOnNewComment = false;
                }
                if (noteCommentVm !== item) {
                    item.isDisabled = true;
                } else {
                    item.isDisabled = false;
                }
            });
        }

        /**
         * This method is used to initialize NoteCommentViewModel
         * @param noteComent instance of NoteComment
         * @param note instanse of Note
         */
        private initNoteComment(noteComent: models.notes.NoteComment, note: models.notes.NoteBase) {
            let noteVm = new NoteCommentViewModel(this.$utility, this._noteController, this._mainController);
            noteVm.on("editcommentrequested", this.editCommentRequested, this);
            noteVm.init(noteComent, note);
            return noteVm;
        }

        /*
        * This function is used to update the comments of the note entity from the one contains in this VM
        */
        postChanges(): void {
            if (!this._note)
                return;

            if (!this._note.Comments)
                this._note.Comments = [];

            // Add and changed
            for (let sourceItem of this.sourceItems) {
                let sourceNoteComment: ap.viewmodels.notes.NoteCommentViewModel = <ap.viewmodels.notes.NoteCommentViewModel>sourceItem;

                let found: boolean = false;
                for (let noteComment of this._note.Comments) {
                    if (sourceNoteComment.noteComment.Id === noteComment.Id) {
                        // the comment exist already
                        if (sourceNoteComment.comment !== noteComment.Comment) {
                            noteComment.Comment = sourceNoteComment.comment;
                        }

                        found = true;
                        break;
                    }
                }

                if (!found) {
                    // this is a new comment -> need to add it to the entity
                    this._note.Comments.push(sourceNoteComment.noteComment);
                }
            }

            // deleted
            let commentArray: ap.models.notes.NoteComment[] = [];
            let indexToRemoveArray: number[] = [];
            for (let noteComment of this._note.Comments) {
                let found: boolean = false;
                for (let sourceItem of this.sourceItems) {
                    let sourceNoteComment: ap.viewmodels.notes.NoteCommentViewModel = <ap.viewmodels.notes.NoteCommentViewModel>sourceItem;
                    if (sourceNoteComment.noteComment.Id === noteComment.Id) {
                        commentArray.push(noteComment);
                        break;
                    }
                }
            }

            this._note.Comments = commentArray;
        }

        /**
       * This method was called when a notecomment was archived from the NoteController.
       * We check and remove the item from collection
       * @param comment : is the updated notecomment 
       **/
        private _onCommentArchived(comment: ap.models.notes.NoteComment) {
            if (!this.isShowingArchive) {
                let toRemoveIndex: number = -1;
                for (let i = 0; i < this.sourceItems.length; i++) {
                    if ((<NoteCommentViewModel>this.sourceItems[i]).noteComment.Id === comment.Id) {
                        let item: NoteCommentViewModel = <NoteCommentViewModel>this.sourceItems[i];
                        toRemoveIndex = i;
                        break;
                    }
                }
                // When archive the comment and we don't show archived comments, remove this comment
                if (toRemoveIndex >= 0) {
                    let itemsDel = this.sourceItems.splice(toRemoveIndex, 1);
                    this._disposeItems(itemsDel);
                    this._setCount(this.count - 1);
                }
            }

            this.updateNeedToShowArchive();
        }

        private _onCommentUnArchived(comment: ap.models.notes.NoteComment) {
            this.updateNeedToShowArchive();
        }

        /**
         * This method will show or hide the archived comments depending of the options isShowingArchived comments and the flag needShowArchived
         **/
        private showHideArchivedComments() {
            let idxComment = -1;
            let vm = this;
            // No call to initCollection then, only archived comments are removed and we can apply an animation when archived are displayed or not
            this._note.Comments.forEach((comment) => {
                idxComment++;
                if (comment.IsArchived) {
                    let itemVm: NoteCommentViewModel;
                    let itemIdx = -1;
                    for (let i = vm.sourceItems.length - 1; i >= 0; i--) { // We make the iteration from end to begin to have no problem of index when removed item from the collection
                        itemVm = <NoteCommentViewModel>vm.sourceItems[i];
                        if (itemVm.originalEntity.Id === comment.Id) {
                            itemIdx = i;
                            break;
                        }
                    }
                    if (vm._isShowingArchive && comment.IsArchived && itemIdx === -1) { // the comment is archived and show be added to the list view model.
                        let commentVm: NoteCommentViewModel = new NoteCommentViewModel(vm.$utility, vm._noteController, vm._mainController);
                        commentVm.init(comment, vm._note);
                        commentVm.on("editcommentrequested", vm.editCommentRequested, vm);
                        let itemsDel = vm.sourceItems.splice(idxComment, 0, commentVm);
                        this._disposeItems(itemsDel);
                        vm._setCount(vm.count + 1);
                    }
                    else if (!vm._isShowingArchive && comment.IsArchived && itemIdx > -1) {
                        let itemsDel = vm.sourceItems.splice(itemIdx, 1);
                        this._disposeItems(itemsDel);
                        vm._setCount(vm.count - 1);
                    }
                }
            });
        }

        /*
        * destructor: dispose the object
        */
        public dispose() {
            super.dispose();
            this._disposeItems(this.sourceItems);
            if (this._noteController) {
                this._noteController.off("commentdeleted", this.commentDeleted, this);
                this._noteController.off("commentarchived", this._onCommentArchived, this);
                this._noteController.off("commentunarchived", this._onCommentUnArchived, this);
                this._noteController.off("commentsaved", this.commentSaved, this);
            }
        }

        /*
        * This method will dispose items on the sourceItems when the collection reinit or the vm is disposed
        */
        private _disposeItems(items: IEntityViewModel[]) {
            if (items && items !== null && items.length > 0) {
                for (let i = 0; i < items.length; i++) {
                    let itemVM: ap.viewmodels.notes.NoteCommentViewModel = <ap.viewmodels.notes.NoteCommentViewModel>items[i];
                    if (itemVM) {
                        itemVM.off("editcommentrequested", this.editCommentRequested, this);
                        itemVM.dispose();
                    }
                }
            }
        }

        /**
         * This method is used to handle event
         * @param saveEvent is the updated notecomment
         */
        private commentSaved(saveEvent: ap.controllers.CommentSavedEvent) {
            let commentVm = this.getEntityById(saveEvent.noteComment.Id);
            if (commentVm) {
                commentVm.init(saveEvent.noteComment);
            }
        }

        constructor(utility: ap.utility.UtilityHelper, private _noteController: ap.controllers.NoteController, private _mainController: ap.controllers.MainController,
            noteVm?: ap.viewmodels.notes.NoteDetailBaseViewModel) {
            super(utility, "NoteComment", null, null, null);
            this._listener.addEventsName(["editcommentrequested"]);

            this._isShowingArchive = this.$utility.Storage.Session.get("note.showarchivedcomments");
            this._needShowArchive = false;

            this.noteViewModel = noteVm;
            this._noteController.on("commentdeleted", this.commentDeleted, this);
            this._noteController.on("commentarchived", this._onCommentArchived, this);
            this._noteController.on("commentunarchived", this._onCommentUnArchived, this);
            this._noteController.on("commentsaved", this.commentSaved, this);
        }

        private _noteViewModel: NoteDetailBaseViewModel;
        private _firstComment: NoteCommentViewModel;
        private _isShowingArchive: boolean;
        private _needShowArchive: boolean;
        private _note: ap.models.notes.NoteBase;
    }
}