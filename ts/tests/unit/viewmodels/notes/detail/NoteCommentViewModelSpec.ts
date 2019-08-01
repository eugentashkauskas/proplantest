'use strict';
describe("Module ap-viewmodels - NoteCommentViewModel", () => {
    let $rootScope: angular.IRootScopeService, $scope: angular.IScope;
    let Utility: ap.utility.UtilityHelper, UserContext: ap.utility.UserContext;
    let NoteController: ap.controllers.NoteController;
    let MainController: ap.controllers.MainController;
    let vm: ap.viewmodels.notes.NoteCommentViewModel;
    let $q: angular.IQService;    

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject(function (_$rootScope_, _UserContext_, _Utility_, _NoteController_, _$q_, _MainController_) {
        Utility = _Utility_;
        UserContext = _UserContext_;
        NoteController = _NoteController_;
        $rootScope = _$rootScope_;
        $q = _$q_;
        MainController = _MainController_;
        $scope = $rootScope.$new();
        specHelper.utility.stubRootUrl(Utility);
        specHelper.userContext.stub(Utility);
        specHelper.utility.stubStorageSet(Utility);

        spyOn(Utility.Translator, "getTranslation").and.callFake((code) => {
            if (code === "app.notes.comment_title") return "{0} - {1}";
            return "[" + code + "]";
        });
    }));

    describe("Constructor", () => {
        describe("WHEN NoteComment is created without NoteDetailViewModel", () => {
            it("THEN, the properties are filled with the default values", () => {
                vm = new ap.viewmodels.notes.NoteCommentViewModel(Utility, NoteController, MainController);

                expect(vm.canArchive).toBeFalsy();
                expect(vm.canDelete).toBeFalsy();
                expect(vm.canEdit).toBeFalsy();
                expect(vm.canUnarchive).toBeFalsy();
                expect(vm.comment).toBe("");
                expect(vm.fromDisplayName).toBe("");
                expect(vm.hasNumber).toBeFalsy();
                expect(vm.isFirstComment).toBeFalsy();
                expect(vm.isArchived).toBeFalsy();
                expect(vm.isRead).toBeFalsy();
                expect(vm.date).toBe(null);
                expect(vm.isSelected).toBeFalsy();
                expect(vm.numComment).toBe("");
                expect(vm.title).toBe("");
            });
        });

        describe("WHEN NoteComment is created with NoteDetailViewModel", () => {
            beforeEach(() => {
                spyOn(Date.prototype, "relativeFormat").and.returnValue("Yesterday");
                let noteComment: ap.models.notes.NoteComment = new ap.models.notes.NoteComment(Utility);
                noteComment.Comment = "First comment of the point";
                noteComment.IsFirst = true;
                noteComment.Code = "1.01";
                noteComment.From = new ap.models.actors.User(Utility);
                noteComment.From.DisplayName = "Quentin";
                noteComment.IsRead = true;
                noteComment.IsArchived = true;
                vm = new ap.viewmodels.notes.NoteCommentViewModel(Utility, NoteController, MainController);
                vm.init(noteComment);
            });
            it("THEN, the properties are filled with the default values", () => {
                expect(vm.canArchive).toBeFalsy();
                expect(vm.canDelete).toBeFalsy();
                expect(vm.canEdit).toBeFalsy();
                expect(vm.canUnarchive).toBeFalsy();
                expect(vm.comment).toBe("First comment of the point");
                expect(vm.fromDisplayName).toBe("Quentin");
                expect(vm.hasNumber).toBeTruthy();
                expect(vm.isFirstComment).toBeTruthy();
                expect(vm.isArchived).toBeTruthy();
                expect(vm.isRead).toBeTruthy();
                expect(vm.date).toEqual(new Date());
                expect(vm.isSelected).toBeFalsy();
                expect(vm.numComment).toBe("1.01");
            });
            it("THEN, dateByAuthorTitle is correctly built", () => {
                expect(vm.title).toBe("1.01 - Quentin");
            });
        });

        describe("WHEN postChanges is called", () => {
            it("THEN NoteCommentViewModel.comment is set into NoteComment.Comment", () => {
                let noteComment: ap.models.notes.NoteComment = new ap.models.notes.NoteComment(Utility);
                noteComment.Comment = "First comment of the point";

                vm = new ap.viewmodels.notes.NoteCommentViewModel(Utility, NoteController, MainController);
                vm.init(noteComment);

                vm.comment = "New comment.";

                expect(vm.noteComment.Comment).toBe("First comment of the point");

                vm.postChanges();

                expect(vm.noteComment.Comment).toBe("New comment.");
            });
        });
    });

    describe("Property: canDelete", () => {
        let n: any;
        let noteAr: ap.models.accessRights.NoteAccessRight;
        let noteAccessRightSpec: jasmine.Spy;

        beforeEach(() => {
            noteAccessRightSpec = specHelper.general.spyProperty(ap.viewmodels.notes.NoteCommentViewModel.prototype, "noteAccessRight", specHelper.PropertyAccessor.Get);
        });

        afterEach(() => {
            specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteCommentViewModel.prototype, "noteAccessRight", specHelper.PropertyAccessor.Get);
        });


        describe("WHEN the user click on action to delete first comment", () => {
            it("THEN the action is not available and error thrown", () => {

                let noteComment: ap.models.notes.NoteComment = new ap.models.notes.NoteComment(Utility);
                noteComment.Comment = "xxx";
                noteComment.IsFirst = true;

                let vm = new ap.viewmodels.notes.NoteCommentViewModel(Utility, NoteController, MainController);
                vm.init(noteComment);

                expect(vm.canDelete).toBeFalsy();
                expect(() => {
                    vm.actionClick("notecomment.delete");
                }).toThrowError("The action notecomment.delete is not available");
            });
        });

        describe("WHEN the user click on action to delete comment when the user dont have the access right", () => {
            it("THEN the action is not available and error thrown", () => {

                let noteComment: ap.models.notes.NoteComment = new ap.models.notes.NoteComment(Utility);
                noteComment.Comment = "xxx";
                noteComment.IsFirst = false;

                noteAr = new ap.models.accessRights.NoteAccessRight(Utility, null);
                spyOn(noteAr, "checkCanDeleteComment").and.returnValue(false);
                noteAccessRightSpec.and.returnValue(noteAr);

                let vm = new ap.viewmodels.notes.NoteCommentViewModel(Utility, NoteController, MainController);
                vm.init(noteComment);

                expect(vm.canDelete).toBeFalsy();
                expect(() => {
                    vm.actionClick("notecomment.delete");
                }).toThrowError("The action notecomment.delete is not available");
            });
        });

        describe("WHEN the user click on action to delete comment when the user have access right", () => {
            it("THEN the action is available and noteController.deleteComment has been called", () => {

                let noteComment: ap.models.notes.NoteComment = new ap.models.notes.NoteComment(Utility);
                noteComment.Comment = "xxx";
                noteComment.IsFirst = false;

                let note: ap.models.notes.Note = new ap.models.notes.Note(Utility);

                noteAr = new ap.models.accessRights.NoteAccessRight(Utility, null);
                spyOn(noteAr, "checkCanDeleteComment").and.returnValue(true);
                noteAccessRightSpec.and.returnValue(noteAr);

                let vm = new ap.viewmodels.notes.NoteCommentViewModel(Utility, NoteController, MainController);
                vm.init(noteComment);
                spyOn(NoteController, "deleteComment").and.callFake(() => { });

                expect(vm.canDelete).toBeTruthy();

                // Spy on the message confirm and simulate confirm yes
                spyOn(MainController, "showConfirm").and.callFake(function (message, title, callback) {
                    expect(title).toEqual(Utility.Translator.getTranslation("app.notes.deletecomment_confirm_title"));
                    expect(message).toEqual(noteComment.Comment);
                    callback(ap.controllers.MessageResult.Positive);
                });

                vm.actionClick("notecomment.delete");
                expect(NoteController.deleteComment).toHaveBeenCalled();
            });
        });
    });

    describe("Feature: canArchive property", () => {
        let n: any;
        let noteAr: ap.models.accessRights.NoteAccessRight;
        let noteAccessRightSpec: jasmine.Spy;
        let parentNote: ap.models.notes.Note = new ap.models.notes.Note(Utility);
        beforeEach(() => {
            noteAccessRightSpec = specHelper.general.spyProperty(ap.viewmodels.notes.NoteCommentViewModel.prototype, "noteAccessRight", specHelper.PropertyAccessor.Get);
            parentNote.createByJson({ "Id": 1 });
        });

        afterEach(() => {
            specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteCommentViewModel.prototype, "noteAccessRight", specHelper.PropertyAccessor.Get);
        });

        describe("When the vm was init from the notecoment and the user have not the access right to archive", () => {
            it("THEN canArchive = false", () => {

                let noteComment: ap.models.notes.NoteComment = new ap.models.notes.NoteComment(Utility);
                noteComment.Comment = "xxx";
                noteComment.IsFirst = false;

                noteAr = new ap.models.accessRights.NoteAccessRight(Utility, null);
                spyOn(noteAr, "checkCanArchiveComment").and.returnValue(false);
                noteAccessRightSpec.and.returnValue(noteAr);

                let vm = new ap.viewmodels.notes.NoteCommentViewModel(Utility, NoteController, MainController);
                vm.init(noteComment, parentNote);

                expect(vm.canArchive).toBeFalsy();
            });
        });

        describe("When the vm was init from the notecoment and the user have the access right to archive", () => {
            it("THEN canArchive = true", () => {

                let noteComment: ap.models.notes.NoteComment = new ap.models.notes.NoteComment(Utility);
                noteComment.Comment = "xxx";
                noteComment.IsFirst = false;

                let note: ap.models.notes.Note = new ap.models.notes.Note(Utility);

                noteAr = new ap.models.accessRights.NoteAccessRight(Utility, null);
                spyOn(noteAr, "checkCanArchiveComment").and.returnValue(true);
                noteAccessRightSpec.and.returnValue(noteAr);

                let vm = new ap.viewmodels.notes.NoteCommentViewModel(Utility, NoteController, MainController);
                vm.init(noteComment, parentNote);

                expect(vm.canArchive).toBeTruthy();

                
            });
        });

    });

    describe("Feature: canUnarchive property", () => {
        let n: any;
        let noteAr: ap.models.accessRights.NoteAccessRight;
        let noteAccessRightSpec: jasmine.Spy;
        let parentNote: ap.models.notes.Note = new ap.models.notes.Note(Utility);

        beforeEach(() => {
            noteAccessRightSpec = specHelper.general.spyProperty(ap.viewmodels.notes.NoteCommentViewModel.prototype, "noteAccessRight", specHelper.PropertyAccessor.Get);
            parentNote.createByJson({ "Id": 1 });
        });

        afterEach(() => {
            specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteCommentViewModel.prototype, "noteAccessRight", specHelper.PropertyAccessor.Get);
        });

        describe("When the vm was init from the notecomment and the user have not the right to unarchived", () => {
            it("THEN canUnarchive = false", () => {

                let noteComment: ap.models.notes.NoteComment = new ap.models.notes.NoteComment(Utility);
                noteComment.Comment = "xxx";
                noteComment.IsFirst = false;

                let note: ap.models.notes.Note = new ap.models.notes.Note(Utility);

                noteAr = new ap.models.accessRights.NoteAccessRight(Utility, null);
                spyOn(noteAr, "checkCanArchiveComment").and.returnValue(false);
                noteAccessRightSpec.and.returnValue(noteAr);

                let vm = new ap.viewmodels.notes.NoteCommentViewModel(Utility, NoteController, MainController);
                vm.init(noteComment, parentNote);

                expect(vm.canUnarchive).toBeFalsy();

            });
        });
        
        describe("When the vm was init from the notecomment and the user have the right to unarchived", () => {
            it("THEN canUnarchive = true", () => {

                let noteComment: ap.models.notes.NoteComment = new ap.models.notes.NoteComment(Utility);
                noteComment.Comment = "xxx";
                noteComment.IsFirst = false;

                let note: ap.models.notes.Note = new ap.models.notes.Note(Utility);

                noteAr = new ap.models.accessRights.NoteAccessRight(Utility, null);
                spyOn(noteAr, "checkCanArchiveComment").and.returnValue(true);
                noteAccessRightSpec.and.returnValue(noteAr);

                let vm = new ap.viewmodels.notes.NoteCommentViewModel(Utility, NoteController, MainController);
                vm.init(noteComment, parentNote);

                expect(vm.canUnarchive).toBeTruthy();
                
            });
        });

    });

    describe("Feature: canEdit property", () => {
        let n: any;
        let noteAr: ap.models.accessRights.NoteAccessRight;
        let noteAccessRightSpec: jasmine.Spy;
        let parentNote: ap.models.notes.Note;
        let noteComment: ap.models.notes.NoteComment;
        let vm: ap.viewmodels.notes.NoteCommentViewModel;

        beforeEach(() => {
            parentNote = new ap.models.notes.Note(Utility);
            parentNote.createByJson({ "Id": 1 });
            noteAr = new ap.models.accessRights.NoteAccessRight(Utility, parentNote);
            specHelper.general.spyProperty(ap.viewmodels.notes.NoteCommentViewModel.prototype, "noteAccessRight", specHelper.PropertyAccessor.Get).and.returnValue(noteAr);

            noteComment = new ap.models.notes.NoteComment(Utility);
            noteComment.createByJson({ Id: "1" });

            vm = new ap.viewmodels.notes.NoteCommentViewModel(Utility, NoteController, MainController);

        });

        afterEach(() => {
            specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteCommentViewModel.prototype, "noteAccessRight", specHelper.PropertyAccessor.Get);
        });

        describe("WHEN the VM was init from the NoteComment that the user have not the right to edit", () => {
            it("THEN, canEdit = false", () => {
                spyOn(noteAr, "checkCanEditComment").and.returnValue(false);
                vm.init(noteComment);
                expect(vm.canEdit).toBeFalsy();
            });
            it("AND, if the method actionClick was called with action 'notecomment.edit', the error will be throw", () => {
                spyOn(noteAr, "checkCanEditComment").and.returnValue(false);
                vm.init(noteComment);
                expect(() => {
                    vm.actionClick("notecomment.edit");
                }).toThrowError("The action notecomment.edit is not available");
            });

        });
        describe("WHEN the VM was init from the NoteComment that the user have the right to edit", () => {
            it("THEN, canEdit = true", () => {
                spyOn(noteAr, "checkCanEditComment").and.returnValue(true);
                vm.init(noteComment);
                expect(vm.canEdit).toBeTruthy();
            });
            it("AND, if the method actionClick was called with action 'notecomment.edit', the event 'editcommentrequested' will be fire", () => {
                spyOn(noteAr, "checkCanEditComment").and.returnValue(true);
                vm.init(noteComment);
                let callback = jasmine.createSpy("callback");
                vm.on("editcommentrequested", function () {
                    callback();
                }, this);
                vm.actionClick("notecomment.edit");
                expect(callback).toHaveBeenCalled();
            });
        });
    });

    describe("Feature: archive action", () => {
        let n: any;
        let noteAr: ap.models.accessRights.NoteAccessRight;
        let noteAccessRightSpec: jasmine.Spy;
        let parentNote: ap.models.notes.Note = new ap.models.notes.Note(Utility);
        beforeEach(() => {
            noteAccessRightSpec = specHelper.general.spyProperty(ap.viewmodels.notes.NoteCommentViewModel.prototype, "noteAccessRight", specHelper.PropertyAccessor.Get);
            parentNote.createByJson({ "Id": 1 });
        });

        afterEach(() => {
            specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteCommentViewModel.prototype, "noteAccessRight", specHelper.PropertyAccessor.Get);
        });

        describe("WHEN the user click on action to archive comment and the user does note have the access right", () => {
            it("THEN the action is not available and error thrown", () => {

                let noteComment: ap.models.notes.NoteComment = new ap.models.notes.NoteComment(Utility);
                noteComment.Comment = "xxx";
                noteComment.IsFirst = false;

                noteAr = new ap.models.accessRights.NoteAccessRight(Utility, null);
                spyOn(noteAr, "checkCanArchiveComment").and.returnValue(false);
                noteAccessRightSpec.and.returnValue(noteAr);

                let vm = new ap.viewmodels.notes.NoteCommentViewModel(Utility, NoteController, MainController);
                vm.init(noteComment, parentNote);

                expect(vm.canArchive).toBeFalsy();
                expect(() => {
                    vm.actionClick("notecomment.archive");
                }).toThrowError("The action notecomment.archive is not available");
            });
        });

        describe("WHEN the user click on action to archive comment and user have access right", () => {
            it("THEN the action is available and noteController.archiveComment has been called", () => {

                let noteComment: ap.models.notes.NoteComment = new ap.models.notes.NoteComment(Utility);
                noteComment.Comment = "xxx";
                noteComment.IsFirst = false;

                let note: ap.models.notes.Note = new ap.models.notes.Note(Utility);

                noteAr = new ap.models.accessRights.NoteAccessRight(Utility, null);
                spyOn(noteAr, "checkCanArchiveComment").and.returnValue(true);
                noteAccessRightSpec.and.returnValue(noteAr);

                let vm = new ap.viewmodels.notes.NoteCommentViewModel(Utility, NoteController, MainController);
                vm.init(noteComment, parentNote);
                spyOn(NoteController, "archiveComment").and.callFake(() => { });

                expect(vm.canArchive).toBeTruthy();

                vm.actionClick("notecomment.archive");
                expect(NoteController.archiveComment).toHaveBeenCalled();
            });
        });

    });

    describe("Feature: unArchive action", () => {
        let n: any;
        let noteAr: ap.models.accessRights.NoteAccessRight;
        let noteAccessRightSpec: jasmine.Spy;
        let parentNote: ap.models.notes.Note = new ap.models.notes.Note(Utility);

        beforeEach(() => {
            noteAccessRightSpec = specHelper.general.spyProperty(ap.viewmodels.notes.NoteCommentViewModel.prototype, "noteAccessRight", specHelper.PropertyAccessor.Get);
            parentNote.createByJson({ "Id": 1});
        });

        afterEach(() => {
            specHelper.general.offSpyProperty(ap.viewmodels.notes.NoteCommentViewModel.prototype, "noteAccessRight", specHelper.PropertyAccessor.Get);
        });

        
        describe("WHEN the user click on action to unarchive comment and the user does note have the access right", () => {
            it("THEN the action is not available and error thrown", () => {

                let noteComment: ap.models.notes.NoteComment = new ap.models.notes.NoteComment(Utility);
                noteComment.Comment = "xxx";
                noteComment.IsFirst = false;

                noteAr = new ap.models.accessRights.NoteAccessRight(Utility, null);
                spyOn(noteAr, "checkCanArchiveComment").and.returnValue(false);
                noteAccessRightSpec.and.returnValue(noteAr);

                let vm = new ap.viewmodels.notes.NoteCommentViewModel(Utility, NoteController, MainController);
                vm.init(noteComment, parentNote);

                expect(vm.canUnarchive).toBeFalsy();
                expect(() => {
                    vm.actionClick("notecomment.unarchive");
                }).toThrowError("The action notecomment.unarchive is not available");
            });
        });

        describe("WHEN the user click on action to unarchive comment and user have access right", () => {
            it("THEN the action is available and noteController.unarchiveComment has been called", () => {

                let noteComment: ap.models.notes.NoteComment = new ap.models.notes.NoteComment(Utility);
                noteComment.Comment = "xxx";
                noteComment.IsFirst = false;

                let note: ap.models.notes.Note = new ap.models.notes.Note(Utility);

                noteAr = new ap.models.accessRights.NoteAccessRight(Utility, null);
                spyOn(noteAr, "checkCanArchiveComment").and.returnValue(true);
                noteAccessRightSpec.and.returnValue(noteAr);

                let vm = new ap.viewmodels.notes.NoteCommentViewModel(Utility, NoteController, MainController);
                vm.init(noteComment, parentNote);
                spyOn(NoteController, "unarchiveComment").and.callFake(() => { });

                expect(vm.canUnarchive).toBeTruthy();

                vm.actionClick("notecomment.unarchive");
                expect(NoteController.unarchiveComment).toHaveBeenCalled();
            });
        });

    });

    describe("Feature: _onCommentIsArchivedUpdated", () => {
        describe("When commentarchived event was fired from NoteController with the notecomment same id with current comment", () => {
            it("THEN, the copySource method will called", () => {
                
                let noteComment: ap.models.notes.NoteComment = new ap.models.notes.NoteComment(Utility);
                noteComment.createByJson({ Id: "1", IsFirst: false, IsArchived: false, EntityVersion: 1 });
                let vm = new ap.viewmodels.notes.NoteCommentViewModel(Utility, NoteController, MainController);
                vm.init(noteComment);

                $rootScope.$apply();

                spyOn(ap.viewmodels.notes.NoteCommentViewModel.prototype, "copySource").and.callThrough();

                let commentUpdated: ap.models.notes.NoteComment = new ap.models.notes.NoteComment(Utility);
                commentUpdated.createByJson({ Id: "1", EntityVersion: 2, IsArchived: true, IsFirst : false });

                (<any>NoteController)._listener.raise("commentarchived", commentUpdated);

                $rootScope.$apply();

                expect(ap.viewmodels.notes.NoteCommentViewModel.prototype.copySource).toHaveBeenCalled();
                

            });
        });
        describe("When commentarchived event was fired from NoteController with the notecomment difference with the current comment", () => {
            it("THEN, there is nothing to do", () => {
                let noteComment: ap.models.notes.NoteComment = new ap.models.notes.NoteComment(Utility);
                noteComment.createByJson({ Id: "1", IsFirst: false, IsArchived: false, EntityVersion: 1 });
                let vm = new ap.viewmodels.notes.NoteCommentViewModel(Utility, NoteController, MainController);
                vm.init(noteComment);
                
                $rootScope.$apply();

                spyOn(ap.viewmodels.notes.NoteCommentViewModel.prototype, "copySource").and.callThrough();

                let commentUpdated: ap.models.notes.NoteComment = new ap.models.notes.NoteComment(Utility);
                commentUpdated.createByJson({ Id: "2", EntityVersion: 2, IsArchived: true, IsFirst: false });

                (<any>NoteController)._listener.raise("commentarchived", commentUpdated);

                $rootScope.$apply();

                expect(ap.viewmodels.notes.NoteCommentViewModel.prototype.copySource).not.toHaveBeenCalled();

            });
        });
        describe("When commentunarchived event was fired from NoteController with the notecomment same id with current comment", () => {
            it("THEN, the copySource method will called", () => {
                let noteComment: ap.models.notes.NoteComment = new ap.models.notes.NoteComment(Utility);
                noteComment.createByJson({ Id: "1", IsFirst: false, IsArchived: true, EntityVersion: 2 });
                let vm = new ap.viewmodels.notes.NoteCommentViewModel(Utility, NoteController, MainController);
                vm.init(noteComment);

                $rootScope.$apply();

                spyOn(ap.viewmodels.notes.NoteCommentViewModel.prototype, "copySource").and.callThrough();

                let commentUpdated: ap.models.notes.NoteComment = new ap.models.notes.NoteComment(Utility);
                commentUpdated.createByJson({ Id: "1", EntityVersion: 3, IsArchived: false, IsFirst: false });

                (<any>NoteController)._listener.raise("commentunarchived", commentUpdated);

                $rootScope.$apply();

                expect(ap.viewmodels.notes.NoteCommentViewModel.prototype.copySource).toHaveBeenCalled();

            });
        });
        describe("When commentunarchived event was fired from NoteController with the notecomment difference with the current comment", () => {
            it("THEN, there is nothing to do", () => {
                let noteComment: ap.models.notes.NoteComment = new ap.models.notes.NoteComment(Utility);
                noteComment.createByJson({ Id: "1", IsFirst: false, IsArchived: true, EntityVersion: 2 });
                let vm = new ap.viewmodels.notes.NoteCommentViewModel(Utility, NoteController, MainController);
                vm.init(noteComment);

                $rootScope.$apply();

                spyOn(ap.viewmodels.notes.NoteCommentViewModel.prototype, "copySource").and.callThrough();

                let commentUpdated: ap.models.notes.NoteComment = new ap.models.notes.NoteComment(Utility);
                commentUpdated.createByJson({ Id: "2", EntityVersion: 3, IsArchived: false, IsFirst: false });

                (<any>NoteController)._listener.raise("commentarchived", commentUpdated);

                $rootScope.$apply();

                expect(ap.viewmodels.notes.NoteCommentViewModel.prototype.copySource).not.toHaveBeenCalled();
            });
        });
    });

    describe("Feature: dispose method", () => {
        describe("When dispose method was called ", () => {
            it("THEN _noteController.off will be called", () => {
                let noteComment: ap.models.notes.NoteComment = new ap.models.notes.NoteComment(Utility);
                noteComment.createByJson({ Id: "1", IsFirst: false, IsArchived: false, EntityVersion: 1 });
                let vm = new ap.viewmodels.notes.NoteCommentViewModel(Utility, NoteController, MainController);
                vm.init(noteComment);

                $rootScope.$apply();

                spyOn(NoteController, "off");
                vm.dispose();

                $rootScope.$apply();

                expect(NoteController.off).toHaveBeenCalled();
            });
        }); 
    });
}); 