describe("Module ap-viewmodels - noteItemViewModel", () => {

    let MainController: ap.controllers.MainController, Utility: ap.utility.UtilityHelper, UserContext: ap.utility.UserContext, UIStateController: ap.controllers.UIStateController;
    let $q: angular.IQService;
    let ControllersManager: ap.controllers.ControllersManager;
    let AccessRightController: ap.controllers.AccessRightController;
    let $mdDialog: angular.material.IDialogService;

    let vm: ap.viewmodels.notes.NoteItemViewModel;
    let n: ap.models.notes.Note;
    let meeting: ap.models.meetings.Meeting;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");

        angular.mock.module(($provide) => {
            $provide.factory('$mdDialog', ["$q", ($q) => {
                return specHelper.utility.stubShowMdDialog($q);
            }]);
        });
    });

    beforeEach(inject((_$q_, _UserContext_, _Utility_, _MainController_, _UIStateController_,
        _ControllersManager_, _AccessRightController_, _$mdDialog_) => {
        MainController = _MainController_;
        UIStateController = _UIStateController_;
        ControllersManager = _ControllersManager_;
        Utility = _Utility_;
        UserContext = _UserContext_;
        AccessRightController = _AccessRightController_;
        $mdDialog = _$mdDialog_;
        vm = null;
        $q = _$q_;
        specHelper.utility.stubRootUrl(Utility);
        specHelper.userContext.stub(Utility);
        specHelper.utility.stubStorageSet(Utility);
        specHelper.general.spyProperty(ap.controllers.UIStateController.prototype, "mainFlowState", specHelper.PropertyAccessor.Get).and.returnValue(ap.controllers.MainFlow.Points);
    }));

    afterEach(() => {
        specHelper.general.offSpyProperty(ap.controllers.UIStateController.prototype, "mainFlowState", specHelper.PropertyAccessor.Get)
    });
    
    beforeEach(function () {
        specHelper.mainController.stub(MainController, Utility);
        n = new ap.models.notes.Note(Utility);
        n.CodeNum = "1.35";
        n.Code = "CODE 1.35";
        n.HasAttachment = true;
        n.Subject = "Plumbing problem in the garage";
        n.From = new ap.models.actors.User(Utility);
        n.From.Person = new ap.models.actors.Person(Utility);
        n.From.Person.Name = "Quentin";

        n.DueDate = new Date();

        n.Cell = new ap.models.projects.SubCell(Utility);
        n.Cell.Code = "C1";

        n.IssueType = new ap.models.projects.IssueType(Utility);
        n.IssueType.Code = "IT1";
        n.IssueType.ParentChapter = new ap.models.projects.Chapter(Utility);
        n.IssueType.ParentChapter.Code = "CHA1";
        n.IsArchived = false;

        meeting = new ap.models.meetings.Meeting(Utility);

        meeting.createByJson({
            Title: "test meeting title"
        });

        n.Meeting = meeting;

        n.Comments = [];
        let comment: ap.models.notes.NoteComment = new ap.models.notes.NoteComment(Utility);
        comment.createByJson(
            {
                Id: "a501aee5-4997-4717-96f2-3ddd1f098bef",
                IsRead: true
            }
        );
        n.Comments.push(comment);

        n.Status = new ap.models.projects.NoteProjectStatus(Utility);
        n.Status.createByJson({
            Id: "9ed59a44-2df4-4f5e-8287-c579646d9c28"
        });
        n.Status.Name = "In Progress";
        n.Status.Color = "25d84b";
        n.Status.IsDone = false;

        n.NoteInCharge = [];

        let ni: ap.models.notes.NoteInCharge;
        ni = new ap.models.notes.NoteInCharge(Utility);
        ni.Tag = "Sergio";
        n.NoteInCharge.push(ni);

        n.MeetingAccessRight = null;
    });

    describe("Feature NoteItemViewModel", () => {
        describe("WHEN constructor is build with null argument for projectController", () => {
            it("THEN, an error is thrown", () => {
                expect(() => {
                    ControllersManager.projectController = undefined;
                    new ap.viewmodels.notes.NoteItemViewModel(Utility, $q, undefined, undefined);
                }).toThrowError("Argument projectController cannot be null");
            });
        });
        

        describe("WHEN an item is created with a note and all values are defined", () => {
            it("THEN, the item is build with the correct values", () => {
                let item = new ap.viewmodels.notes.NoteItemViewModel(Utility, $q, undefined, new ap.viewmodels.notes.UserCommentItemConstructorParameter(2, n, null, null, Utility, ControllersManager));
                item.init(n);

                expect(item.codeNum).toBe(n.CodeNum);
                expect(item.subject).toBe(n.Subject);
                expect(item.dueDate).toBe(n.DueDate);
                expect(item.dueDateFormatted).toBe(n.DueDate.format(DateFormat.Standard));
                expect(item.from).toBe(n.From.Person.Name);
                expect(item.room).toBe("C1");
                expect(item.category).toBe("CHA1/IT1");
                expect(item.inCharge).toEqual("Sergio");
                expect(item.inChargeList).toContain(jasmine.objectContaining({Tag: "Sergio"}));
                expect(item.code).toBe(n.Code);
                expect(item.isArchived).toBe(n.IsArchived);
                expect(item.meetingName).toBe(n.Meeting.Title);
                expect(item.hasAttachment).toBe(true);
            });
        });

        describe("WHEN an item is created with a note and Cell is not defined", () => {
            it("THEN, the item is build with the correct values and Cell is undefined", () => {
                n.Cell = null;
                let item = new ap.viewmodels.notes.NoteItemViewModel(Utility, $q, undefined, new ap.viewmodels.notes.UserCommentItemConstructorParameter(2, n, null, null, Utility, ControllersManager));
                item.init(n);

                expect(item.codeNum).toBe(n.CodeNum);
                expect(item.subject).toBe(n.Subject);
                expect(item.dueDate).toBe(n.DueDate);
                expect(item.dueDateFormatted).toBe(n.DueDate.format(DateFormat.Standard));
                expect(item.from).toBe(n.From.Person.Name);
                expect(item.room).toBe("");
                expect(item.category).toBe("CHA1/IT1");
                expect(item.inCharge).toEqual("Sergio");
                expect(item.inChargeList).toContain(jasmine.objectContaining({Tag: "Sergio"}));
            });
        });

        describe("WHEN an item is created with a note and DueDate is not defined", () => {
            it("THEN, the item is build with the correct values and DueDate is undefined", () => {
                n.DueDate = null;
                let item = new ap.viewmodels.notes.NoteItemViewModel(Utility, $q, undefined, new ap.viewmodels.notes.UserCommentItemConstructorParameter(2, n, null, null, Utility, ControllersManager));
                item.init(n);

                expect(item.codeNum).toBe(n.CodeNum);
                expect(item.subject).toBe(n.Subject);
                expect(item.dueDate).toBeNull();
                expect(item.dueDateFormatted).toEqual("");
                expect(item.from).toBe(n.From.Person.Name);
                expect(item.category).toBe("CHA1/IT1");
                expect(item.category).toBe("CHA1/IT1");
                expect(item.inCharge).toEqual("Sergio");
                expect(item.inChargeList).toContain(jasmine.objectContaining({Tag: "Sergio"}));
            });
        });

        describe("WHEN an item is created with a note and in charge is empty", () => {
            it("THEN, the item is build with the correct values and in charge is empty", () => {
                n.NoteInCharge = [];
                let item = new ap.viewmodels.notes.NoteItemViewModel(Utility, $q, undefined, new ap.viewmodels.notes.UserCommentItemConstructorParameter(2, n, null, null, Utility, ControllersManager));
                item.init(n);

                expect(item.codeNum).toBe(n.CodeNum);
                expect(item.subject).toBe(n.Subject);
                expect(item.dueDate).toBe(n.DueDate);
                expect(item.dueDateFormatted).toBe(n.DueDate.format(DateFormat.Standard));
                expect(item.from).toBe(n.From.Person.Name);
                expect(item.room).toBe("C1");
                expect(item.category).toBe("CHA1/IT1");
                expect(item.inCharge).toEqual("");
                expect(item.inChargeList.length).toEqual(0);
            });
        });

        describe("WHEN an item is created with a note and in charge is null", () => {
            it("THEN, the item is build with the correct values and in charge is empty", () => {
                n.NoteInCharge = null;
                let item = new ap.viewmodels.notes.NoteItemViewModel(Utility, $q, undefined, new ap.viewmodels.notes.UserCommentItemConstructorParameter(2, n, null, null, Utility, ControllersManager));
                item.init(n);

                expect(item.codeNum).toBe(n.CodeNum);
                expect(item.subject).toBe(n.Subject);
                expect(item.dueDate).toBe(n.DueDate);
                expect(item.dueDateFormatted).toBe(n.DueDate.format(DateFormat.Standard));
                expect(item.from).toBe(n.From.Person.Name);
                expect(item.room).toBe("C1");
                expect(item.category).toBe("CHA1/IT1");
                expect(item.inCharge).toEqual("");
                expect(item.inChargeList.length).toEqual(0);
            });
        });

        describe("WHEN an item is created with a note and IssueType is not defined", () => {
            it("THEN, the item is build with the correct values and category is undefined", () => {
                n.IssueType = null;
                let item = new ap.viewmodels.notes.NoteItemViewModel(Utility, $q, undefined, new ap.viewmodels.notes.UserCommentItemConstructorParameter(2, n, null, null, Utility, ControllersManager));
                item.init(n);

                expect(item.codeNum).toBe(n.CodeNum);
                expect(item.subject).toBe(n.Subject);
                expect(item.dueDate).toBe(n.DueDate);
                expect(item.dueDateFormatted).toBe(n.DueDate.format(DateFormat.Standard));
                expect(item.from).toBe(n.From.Person.Name);
                expect(item.room).toBe("C1");
                expect(item.category).toBe("");
                expect(item.inCharge).toEqual("Sergio");
                expect(item.inChargeList).toContain(jasmine.objectContaining({Tag: "Sergio"}));
            });
        });

        describe("WHEN an item is created with a note and IssueType.ParentChapter is not defined", () => {
            it("THEN, the item is build with the correct values and category is undefined", () => {
                n.IssueType.ParentChapter = null;
                let item = new ap.viewmodels.notes.NoteItemViewModel(Utility, $q, undefined, new ap.viewmodels.notes.UserCommentItemConstructorParameter(2, n, null, null, Utility, ControllersManager));
                item.init(n);

                expect(item.codeNum).toBe(n.CodeNum);
                expect(item.subject).toBe(n.Subject);
                expect(item.dueDate).toBe(n.DueDate);
                expect(item.dueDateFormatted).toBe(n.DueDate.format(DateFormat.Standard));
                expect(item.from).toBe(n.From.Person.Name);
                expect(item.room).toBe("C1");
                expect(item.category).toBe("");
                expect(item.inCharge).toEqual("Sergio");
                expect(item.inChargeList).toContain(jasmine.objectContaining({Tag: "Sergio"}));
            });
        });

        describe("WHEN an UserComment is created with a note and the comment IsRead", () => {
            it("THEN, the UserComment is built with the correct values and IsRead = TRUE", () => {
                n.IsRead = true;
                n.Comments[0].LastModificationDate = new Date(2016, 4, 1);
                let item = new ap.viewmodels.notes.NoteItemViewModel(Utility, $q, undefined, new ap.viewmodels.notes.UserCommentItemConstructorParameter(2, n, null, null, Utility, ControllersManager, n.Comments[0]));
                item.originalId = "a501aee5-4997-4717-96f2-3ddd1f098bef";
                item.originalId = "a501aee5-4997-4717-96f2-3ddd1f098bef";
                item.init(n);

                expect(item.codeNum).toBe(n.CodeNum);
                expect(item.subject).toBe(n.Subject);
                expect(item.dueDate).toBe(n.DueDate);
                expect(item.dueDateFormatted).toBe(n.DueDate.format(DateFormat.Standard));
                expect(item.isRead).toBeTruthy();
                expect(item.from).toBe(n.From.Person.Name);
                expect(item.room).toBe("C1");
                expect(item.category).toBe("CHA1/IT1");
                expect(item.inCharge).toEqual("Sergio");
                expect(item.inChargeList).toContain(jasmine.objectContaining({Tag: "Sergio"}));
                expect(item.comment).toBeDefined();
                expect(item.date).toEqual(new Date(2016, 4, 1));
                expect(item.dateFormatted).toEqual(item.date.format(DateFormat.Standard));
            });
        });

        describe("WHEN an item has a disabled status", () => {

            let item: ap.viewmodels.notes.NoteItemViewModel;

            beforeEach(() => {
                n.Status.IsDisabled = true;
                item = new ap.viewmodels.notes.NoteItemViewModel(Utility, $q, undefined, new ap.viewmodels.notes.UserCommentItemConstructorParameter(2, n, null, null, Utility, ControllersManager));
                item.init(n);
            });

            it("THEN this status is assigned to the ViewModel", () => {
                expect(item.status).toBe(n.Status.Name);
                expect(item.statusColor).toBe("#" + n.Status.Color);
            });
        });
    });

    describe("Feature editActionClick", () => {
        let item: ap.viewmodels.notes.NoteItemViewModel;
        beforeEach(() => {
            item = new ap.viewmodels.notes.NoteItemViewModel(Utility, $q, undefined, new ap.viewmodels.notes.UserCommentItemConstructorParameter(2, n, null, null, Utility, ControllersManager));
            item.init(n);
            spyOn(item, "actionClick");
        });
        afterEach(() => {
            specHelper.general.offSpyProperty(ap.models.accessRights.NoteBaseAccessRight.prototype, "canEdit", specHelper.PropertyAccessor.Get);
        });
        describe("WHEN canEdit == true", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.models.accessRights.NoteBaseAccessRight.prototype, "canEdit", specHelper.PropertyAccessor.Get).and.returnValue(true);
                item.editActionClick();
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.models.accessRights.NoteBaseAccessRight.prototype, "canEdit", specHelper.PropertyAccessor.Get);
            });
            it("THEN actionClick is called", () => {
                expect(item.actionClick).toHaveBeenCalledWith("editnote");
            });
        });
        describe("WHEN canEdit == false", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.models.accessRights.NoteBaseAccessRight.prototype, "canEdit", specHelper.PropertyAccessor.Get).and.returnValue(false);
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.models.accessRights.NoteBaseAccessRight.prototype, "canEdit", specHelper.PropertyAccessor.Get);
            });
            it("THEN actionClick is not called", () => {
                expect(item.actionClick).not.toHaveBeenCalled();
            });
        });
    });

    describe("Feature action click", () => {
        let note: ap.models.notes.Note;
        let date: Date = new Date();
        let deferred: angular.IDeferred<any>;
        let MeetingAccessRight: ap.models.accessRights.MeetingAccessRight;

        beforeEach(() => {
            MeetingAccessRight = new ap.models.accessRights.MeetingAccessRight(Utility);
            MeetingAccessRight.Level = ap.models.accessRights.AccessRightLevel.Admin;
            MeetingAccessRight.CanEdit = true;
            MeetingAccessRight.CanAddPoint = true;
            MeetingAccessRight.CanEditPoint = true;
            MeetingAccessRight.CanDeletePoint = true;
            MeetingAccessRight.CanAddComment = true;
            MeetingAccessRight.CanDeleteComment = true;
            MeetingAccessRight.CanArchiveComment = true;
            MeetingAccessRight.CanAddDoc = true;
            MeetingAccessRight.CanEditAllPoint = true;
            MeetingAccessRight.CanAddPointDocument = true;
            MeetingAccessRight.CanDeletePointDocument = true;

            note = new ap.models.notes.Note(Utility);
            note.Subject = "House";
            note.Date = date;
            note.MeetingAccessRight = MeetingAccessRight;
            deferred = $q.defer();
            spyOn(ControllersManager.projectController, "getNoteProjectStatusList").and.returnValue(deferred.promise);
            spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.returnValue(true);
            vm = new ap.viewmodels.notes.NoteItemViewModel(Utility, $q, null, new ap.viewmodels.notes.UserCommentItemConstructorParameter(null, null, null, null, Utility, ControllersManager))
            vm.init(note);
        });

        describe("WHEN wrong action click", () => {
            it("THEN raise error", () => {
                expect(() => vm.actionClick("xxx")).toThrowError("The action xxx is not available");
            });
        });

        describe("WHEN action = urgentnote", () => {
            beforeEach(() => {
                note.IsUrgent = false;
                vm.noteActionViewModel.updateNote(note);
                spyOn(ControllersManager.noteController, "markNoteAsUrgent");
                vm.actionClick("urgentnote");
            });
            it("THEN raise markNoteAsUrgent", () => {
                expect(ControllersManager.noteController.markNoteAsUrgent).toHaveBeenCalled();
            });
        });

        describe("WHEN action = unurgentnote", () => {
            beforeEach(() => {
                note.IsUrgent = true;
                vm.noteActionViewModel.updateNote(note);
                spyOn(ControllersManager.noteController, "markNoteAsNotUrgent");
                vm.actionClick("unurgentnote");
            });
            it("THEN raise markNoteAsNotUrgent", () => {
                expect(ControllersManager.noteController.markNoteAsNotUrgent).toHaveBeenCalled();
            });
        });

        describe("WHEN action = deletenote", () => {
            beforeEach(() => {
                spyOn(ControllersManager.noteController, "deleteNote");
                vm.actionClick("deletenote");
            });
            it("THEN raise deleteNote", () => {
                expect(ControllersManager.noteController.deleteNote).toHaveBeenCalled();
            });
        });

        describe("WHEN action = note.moveto", () => {
            beforeEach(() => {
                spyOn(ControllersManager.noteController, "requestMoveNote");
                vm.actionClick("note.moveto");
            });
            it("THEN raise requestMoveNote", () => {
                expect(ControllersManager.noteController.requestMoveNote).toHaveBeenCalled();
            });
        });

        describe("WHEN action = archivenote", () => {
            beforeEach(() => {
                note.IsArchived = false;
                vm.noteActionViewModel.updateNote(note);
                spyOn(ControllersManager.noteController, "archiveNote");
                vm.actionClick("archivenote");
            });
            it("THEN raise archiveNote", () => {
                expect(ControllersManager.noteController.archiveNote).toHaveBeenCalled();
            });
        });

        describe("WHEN action = unarchivenote", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.models.accessRights.NoteBaseAccessRight.prototype, "hasUnarchiveAccess", specHelper.PropertyAccessor.Get).and.returnValue(true);
                specHelper.general.spyProperty(ap.models.accessRights.NoteBaseAccessRight.prototype, "canUnarchive", specHelper.PropertyAccessor.Get).and.returnValue(true);

                vm.noteActionViewModel.updateNote(note);
                spyOn(ControllersManager.noteController, "unarchiveNote");
                vm.actionClick("unarchivenote");
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.models.accessRights.NoteBaseAccessRight.prototype, "hasUnarchiveAccess", specHelper.PropertyAccessor.Get);
                specHelper.general.offSpyProperty(ap.models.accessRights.NoteBaseAccessRight.prototype, "canUnarchive", specHelper.PropertyAccessor.Get);
            });
            it("THEN raise unarchiveNote", () => {
                expect(ControllersManager.noteController.unarchiveNote).toHaveBeenCalled();
            });
        });

        describe("WHEN action = editnote", () => {
            beforeEach(() => {
                spyOn(ControllersManager.noteController, "requestEditNote");
                vm.actionClick("editnote");
            });
            it("THEN raise requestEditNote", () => {
                expect(ControllersManager.noteController.requestEditNote).toHaveBeenCalled();
            });
        });
        describe("WHEN action = note.assign", () => {
            beforeEach(() => {
                spyOn(ControllersManager.noteController, "requestAssignNote");
                vm.actionClick("note.assign");
            });
            it("THEN raise requestAssignNote", () => {
                expect(ControllersManager.noteController.requestAssignNote).toHaveBeenCalled();
            });
        });
        describe("WHEN action = note.copyto", () => {
            beforeEach(() => {
                spyOn(ControllersManager.noteController, "requestCopyToNote");
                vm.actionClick("note.copyto");
            });
            it("THEN raise requestCopyToNote", () => {
                expect(ControllersManager.noteController.requestCopyToNote).toHaveBeenCalled();
            });
        });
        describe("WHEN action = note.gotodetail", () => {
            beforeEach(() => {
                spyOn(ControllersManager.noteController, "requestInfoNote");
                vm.actionClick("note.gotodetail");
            });
            it("THEN raise requestInfoNote", () => {
                expect(ControllersManager.noteController.requestInfoNote).toHaveBeenCalled();
            });
        });
        describe("WHEN action = note.copy", () => {
            beforeEach(() => {
                spyOn(ControllersManager.noteController, "requestCopyNote");
                vm.actionClick("note.copy");
            });
            it("THEN the requestCopyNote of the NoteController is called", () => {
                expect(ControllersManager.noteController.requestCopyNote).toHaveBeenCalled();
            });
        });
    });
});