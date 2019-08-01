describe("Module ap-viewmodels - notes components - NoteActionsViewModel", () => {
    let vm: ap.viewmodels.notes.NoteActionsViewModel;
    let Utility: ap.utility.UtilityHelper, UserContext: ap.utility.UserContext;
    let $q: angular.IQService;
    let NoteController: ap.controllers.NoteController;
    let MainController: ap.controllers.MainController;
    let ControllersManager: ap.controllers.ControllersManager;
    let baseTime = new Date(2016, 2, 20, 15, 30, 20);
    let currentProject: any;
    let MeetingAccessRight: ap.models.accessRights.MeetingAccessRight;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject(function (_$rootScope_, _UserContext_, _Utility_, _$q_, _NoteController_, _MainController_, _ControllersManager_) {
        Utility = _Utility_;
        UserContext = _UserContext_;
        $q = _$q_;
        NoteController = _NoteController_;
        MainController = _MainController_;
        ControllersManager = _ControllersManager_;
        specHelper.userContext.stub(Utility);
        specHelper.utility.stubRootUrl(_Utility_);
        specHelper.utility.stubCreateGuid();
        specHelper.utility.stubStorageSet(_Utility_);

        MeetingAccessRight = new ap.models.accessRights.MeetingAccessRight(Utility);
            MeetingAccessRight.Level = ap.models.accessRights.AccessRightLevel.Admin;
            MeetingAccessRight.CanEdit = true;
            MeetingAccessRight.CanEditPoint = true;
            MeetingAccessRight.CanAddPoint = true;
            MeetingAccessRight.CanDeletePoint = true;
            MeetingAccessRight.CanAddComment = true;
            MeetingAccessRight.CanDeleteComment = true;
            MeetingAccessRight.CanArchiveComment = true;
            MeetingAccessRight.CanAddDoc = true;
            MeetingAccessRight.CanEditAllPoint = true;
            MeetingAccessRight.CanAddPointDocument = true;
            MeetingAccessRight.CanDeletePointDocument = true;

        currentProject = {
            Id: "45152-56",
            Name: "test",
            Code: "PR",
            UserAccessRight: {
                CanArchiveDoc: true,
                CanDownloadDoc: true,
                CanUploadDoc: true,
                CanDeleteDoc: true,
                CanEditDoc: true
            },
            PhotoFolderId: "45121004",
            IsActive: true
        };
        spyOn(MainController, "currentProject").and.callFake((val) => {
            if (val === undefined) {
                return currentProject;
            }
        });
    }));

    function getActionByName(actionName: string): ap.viewmodels.home.ActionViewModel {
        if (!vm || !vm.actions) {
            return null;
        }
        return ap.viewmodels.home.ActionViewModel.getAction(vm.actions, actionName);
    }

    describe("Feature : constructor", () => {
        function createNoteModel() {
            let note = new ap.models.notes.Note(Utility);
            note.CodeNum = "1.35";
            note.Code = "CODE 1.35";
            note.Subject = "Plumbing problem in the garage";
            note.From = new ap.models.actors.User(Utility);
            note.From.Person = new ap.models.actors.Person(Utility);
            note.From.Person.Name = "Marie";
            note.MeetingAccessRight = angular.copy(MeetingAccessRight);
            return note;
        }

        function setUpNoteAccessRights(rights: any) {
            for (let rightName in rights) {
                if (ap.models.accessRights.NoteBaseAccessRight.prototype[rightName]) {
                    specHelper.general.spyProperty(ap.models.accessRights.NoteBaseAccessRight.prototype, rightName, specHelper.PropertyAccessor.Get).and.returnValue(rights[rightName]);
                } else if (ap.models.accessRights.NoteAccessRight.prototype[rightName]) {
                    specHelper.general.spyProperty(ap.models.accessRights.NoteAccessRight.prototype, rightName, specHelper.PropertyAccessor.Get).and.returnValue(rights[rightName]);
                }
            }
        }

        function tearDownNoteAccessRights() {
            for (let propertyName in ap.models.accessRights.NoteBaseAccessRight.prototype) {
                specHelper.general.offSpyProperty(ap.models.accessRights.NoteBaseAccessRight.prototype, propertyName, specHelper.PropertyAccessor.Get);
            }
            for (let propertyName in ap.models.accessRights.NoteAccessRight.prototype) {
                specHelper.general.offSpyProperty(ap.models.accessRights.NoteAccessRight.prototype, propertyName, specHelper.PropertyAccessor.Get);
            }
        }

        describe("WHEN the NoteActionsViewModel is init", () => {
            beforeEach(() => {
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.returnValue(true);
                setUpNoteAccessRights({
                    canDelete: true,
                    canEdit: true,
                    hasArchiveAccess: true,
                    canArchive: true,
                    hasUnarchiveAccess: false,
                    canUnarchive: false,
                    canEditEntirePoint: true,
                    canAddComment: true
                });

                let note = createNoteModel();
                note.IsUrgent = false;
                vm = new ap.viewmodels.notes.NoteActionsViewModel(Utility, note, ControllersManager);
            });

            afterEach(() => {
               tearDownNoteAccessRights();
            });

            it("THEN, there are 11 actions", () => {
                expect(vm.actions.length).toEqual(11);
            });
            it("THEN, 1st action is Info", () => {
                expect(vm.actions[0].name).toEqual("note.gotodetail");
            });
            it("THEN, 2nd action is Edit", () => {
                expect(vm.actions[1].name).toEqual("editnote");
            });
            
            it("THEN, 6th action is Copy", () => {
                expect(vm.actions[2].name).toEqual("note.copy");
            });
            it("THEN, 7th action is CopyTo", () => {
                expect(vm.actions[3].name).toEqual("note.copyto");
            });
            it("THEN, 8th action is Move To", () => {
                expect(vm.actions[4].name).toEqual("note.moveto");
            });
            it("THEN, 9th action is Urgent", () => {
                expect(vm.actions[5].name).toEqual("urgentnote");
            });
            it("THEN, 10th action is Unurgent", () => {
                expect(vm.actions[6].name).toEqual("unurgentnote");
            });
            it("THEN, 11rd action is Archive", () => {
                expect(vm.actions[7].name).toEqual("archivenote");
            });
            it("THEN, 12th action is Unarchive", () => {
                expect(vm.actions[8].name).toEqual("unarchivenote");
            });
            it("THEN, 13th action is Delete", () => {
                expect(vm.actions[9].name).toEqual("deletenote");
            });
            it("THEN, 14th action is Assign", () => {
                expect(vm.actions[10].name).toEqual("note.assign");
            });
            it("THEN, infoAction.isVisible = false", () => {
                let infoAction = getActionByName("note.gotodetail");
                expect(infoAction.isVisible).toBeTruthy();
            });
            it("THEN, infoAction.isEnabled = false", () => {
                let infoAction = getActionByName("note.gotodetail");
                expect(infoAction.isEnabled).toBeTruthy();
            });
            it("THEN, Urgent action is visible", () => {
                let urgentAction = getActionByName("urgentnote");
                expect(urgentAction.isVisible).toBeTruthy();
            });
            it("THEN, Urgent action is enabled", () => {
                let urgentAction = getActionByName("urgentnote");
                expect(urgentAction.isEnabled).toBeTruthy();
            });
            it("THEN, Unurgent action is enabled", () => {
                let unurgentAction = getActionByName("unurgentnote");
                expect(unurgentAction.isEnabled).not.toBeTruthy();
            });
            it("THEN, Unurgent action is visible", () => {
                let unurgentAction = getActionByName("unurgentnote");
                expect(unurgentAction.isVisible).not.toBeTruthy();
            });
            it("THEN, Edit action is enabled", () => {
                let editAction = getActionByName("editnote");
                expect(editAction.isEnabled).toBeTruthy();
            });
            it("THEN, Edit action is visible", () => {
                let editAction = getActionByName("editnote");
                expect(editAction.isVisible).toBeTruthy();
            });
            it("THEN, Archive action is visible", () => {
                let archiveAction = getActionByName("archivenote");
                expect(archiveAction.isVisible).toBeTruthy();
            });
            it("THEN, Archive action is enabled", () => {
                let archiveAction = getActionByName("archivenote");
                expect(archiveAction.isEnabled).toBeTruthy();
            });
            it("THEN, Unarchive action is visible", () => {
                let unarchiveAction = getActionByName("unarchivenote");
                expect(unarchiveAction.isVisible).not.toBeTruthy();
            });
            it("THEN, Unarchive action is enabled", () => {
                let unarchiveAction = getActionByName("unarchivenote");
                expect(unarchiveAction.isEnabled).not.toBeTruthy();
            });
            it("THEN, Delete action is visible", () => {
                let deleteAction = getActionByName("deletenote");
                expect(deleteAction.isVisible).toBeTruthy();
            });
            it("THEN, Delete action is enabled", () => {
                let deleteAction = getActionByName("deletenote");
                expect(deleteAction.isEnabled).toBeTruthy();
            });
            it("THEN, Copy action is visible", () => {
                let copyAction = getActionByName("note.copy");
                expect(copyAction.isVisible).toBeTruthy();
            });
            it("THEN, Copy action is enabled", () => {
                let copyAction = getActionByName("note.copy");
                expect(copyAction.isEnabled).toBeTruthy();
            });
            it("THEN, Move action is enabled", () => {
                let moveAction = getActionByName("note.moveto");
                expect(moveAction.isEnabled).toBeTruthy();
            });
            it("THEN, CopyTo action is visible", () => {
                let copyToAction = getActionByName("note.copyto");
                expect(copyToAction.isVisible).toBeTruthy();
            });
            it("THEN, CopyTo action is enabled", () => {
                let copyToAction = getActionByName("note.copyto");
                expect(copyToAction.isEnabled).toBeTruthy();
            });
        });

        describe("WHEN the NoteActionsViewModel is init with isUrgent and isArchived = true", () => {
            describe("WHEN the NoteActionsViewModel is init with a note created by current user", () => {
                beforeEach(() => {
                    spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.returnValue(true);
                    setUpNoteAccessRights({
                        canDelete: true,
                        canEdit: true,
                        hasArchiveAccess: false,
                        canArchive: false,
                        hasUnarchiveAccess: true,
                        canUnarchive: true,
                        canEditEntirePoint: true,
                        canAddComment: true
                    });

                    let note = createNoteModel();
                    note.IsUrgent = true;
                    note.IsArchived = true;
                    vm = new ap.viewmodels.notes.NoteActionsViewModel(Utility, note, ControllersManager);
                });

                afterEach(() => {
                    tearDownNoteAccessRights();
                });

                it("THEN, there are 11 actions", () => {
                    expect(vm.actions.length).toEqual(11);
                });
                
                it("THEN, 1st action is Info", () => {
                    expect(vm.actions[0].name).toEqual("note.gotodetail");
                });
                it("THEN, 2nd action is Edit", () => {
                    expect(vm.actions[1].name).toEqual("editnote");
                });
                it("THEN, 6th action is Copy", () => {
                    expect(vm.actions[2].name).toEqual("note.copy");
                });
                it("THEN, 7th action is CopyTo", () => {
                    expect(vm.actions[3].name).toEqual("note.copyto");
                });
                it("THEN, 8th action is Move To", () => {
                    expect(vm.actions[4].name).toEqual("note.moveto");
                });
                it("THEN, 9th action is Urgent", () => {
                    expect(vm.actions[5].name).toEqual("urgentnote");
                });
                it("THEN, 10th action is Unurgent", () => {
                    expect(vm.actions[6].name).toEqual("unurgentnote");
                });
                it("THEN, 11rd action is Archive", () => {
                    expect(vm.actions[7].name).toEqual("archivenote");
                });
                it("THEN, 12th action is Unarchive", () => {
                    expect(vm.actions[8].name).toEqual("unarchivenote");
                });
                it("THEN, 13th action is Delete", () => {
                    expect(vm.actions[9].name).toEqual("deletenote");
                });
                it("THEN, 14th action is Assign", () => {
                    expect(vm.actions[10].name).toEqual("note.assign");
                });

                it("THEN, Info action is visible", () => {
                    let infoAction = getActionByName("note.gotodetail");
                    expect(infoAction.isVisible).toBeTruthy();
                });
                it("THEN, Info actionis enabled", () => {
                    let infoAction = getActionByName("note.gotodetail");
                    expect(infoAction.isEnabled).toBeTruthy();
                });
                it("THEN, Urgent action is visible", () => {
                    let urgentAction = getActionByName("urgentnote");
                    expect(urgentAction.isVisible).not.toBeTruthy();
                });
                it("THEN, Urgent action is enabled", () => {
                    let urgentAction = getActionByName("urgentnote");
                    expect(urgentAction.isEnabled).not.toBeTruthy();
                });
                it("THEN, Unurgent action is enabled", () => {
                    let unurgentAction = getActionByName("unurgentnote");
                    expect(unurgentAction.isEnabled).toBeTruthy();
                });
                it("THEN, Unurgent action is visible", () => {
                    let unurgentAction = getActionByName("unurgentnote");
                    expect(unurgentAction.isVisible).toBeTruthy();
                });
                it("THEN, Edit action is enabled", () => {
                    let editAction = getActionByName("editnote");
                    expect(editAction.isEnabled).toBeTruthy();
                });
                it("THEN, Edit action is visible", () => {
                    let editAction = getActionByName("editnote");
                    expect(editAction.isVisible).toBeTruthy();
                });
                it("THEN, Edit action has shortcut", () => {
                    let editAction = getActionByName("editnote");
                    expect(editAction.shortcut).toBeDefined();
                });
                it("THEN, Archive action is visible", () => {
                    let archiveAction = getActionByName("archivenote");
                    expect(archiveAction.isVisible).not.toBeTruthy();
                });
                it("THEN, Archive action is enabled", () => {
                    let archiveAction = getActionByName("archivenote");
                    expect(archiveAction.isEnabled).not.toBeTruthy();
                });
                it("THEN, Unarchive action is visible", () => {
                    let unarchiveAction = getActionByName("unarchivenote");
                    expect(unarchiveAction.isVisible).toBeTruthy();
                });
                it("THEN, Unarchive action is enabled", () => {
                    let unarchiveAction = getActionByName("unarchivenote");
                    expect(unarchiveAction.isEnabled).toBeTruthy();
                });
                it("THEN, Delete action is visible", () => {
                    let deleteAction = getActionByName("deletenote");
                    expect(deleteAction.isVisible).toBeTruthy();
                });
                it("THEN, Delete action is enabled", () => {
                    let deleteAction = getActionByName("deletenote");
                    expect(deleteAction.isEnabled).toBeTruthy();
                });
                it("THEN, Delete action has shortcut", () => {
                    let deleteAction = getActionByName("deletenote");
                    expect(deleteAction.shortcut).toBeDefined();
                });
                it("THEN, Assign action is enabled", () => {
                    let assignAction = getActionByName("note.assign");
                    expect(assignAction.isEnabled).toBeTruthy();
                });
                it("THEN, Assign action has shortcut", () => {
                    let assignAction = getActionByName("note.assign");
                    expect(assignAction.shortcut).toBeDefined();
                });
                it("THEN, Copy action is visible", () => {
                    let copyAction = getActionByName("note.copy");
                    expect(copyAction.isVisible).toBeTruthy();
                });
                it("THEN, Copy action is enabled", () => {
                    let copyAction = getActionByName("note.copy");
                    expect(copyAction.isEnabled).toBeTruthy();
                });
                it("THEN, Move action is enabled", () => {
                    let moveAction = getActionByName("note.moveto");
                    expect(moveAction.isEnabled).toBeTruthy();
                });
                it("THEN, CopyTo action is visible", () => {
                    let copyToAction = getActionByName("note.copyto");
                    expect(copyToAction.isVisible).toBeTruthy();
                });
                it("THEN, CopyTo action is enabled", () => {
                    let copyToAction = getActionByName("note.copyto");
                    expect(copyToAction.isEnabled).toBeTruthy();
                });
            });
        });

        describe("WHEN the NoteActionsViewModel is init but MeetingAccessRight is not available", () => {
            beforeEach(() => {
                let note = createNoteModel();
                delete note.MeetingAccessRight;
                vm = new ap.viewmodels.notes.NoteActionsViewModel(Utility, note, ControllersManager);
            });

            it("THEN, Copy action is invisible", () => {
                let copyAction = getActionByName("note.copy");
                expect(copyAction.isVisible).toBeFalsy();
            });
            it("THEN, Copy action is disabled", () => {
                let copyAction = getActionByName("note.copy");
                expect(copyAction.isEnabled).toBeFalsy();
            });
        });

        describe("WHEN the NoteActionsViewModel is init but MeetingAccessRight.CanAddPoint is falsy", () => {
            beforeEach(() => {
                let note = createNoteModel();
                note.MeetingAccessRight.CanAddPoint = false;

                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.returnValue(true);
                vm = new ap.viewmodels.notes.NoteActionsViewModel(Utility, note, ControllersManager);
            });

            it("THEN, Copy action is invisible", () => {
                let copyAction = getActionByName("note.copy");
                expect(copyAction.isVisible).toBeFalsy();
            });
            it("THEN, Copy action is disabled", () => {
                let copyAction = getActionByName("note.copy");
                expect(copyAction.isEnabled).toBeFalsy();
            });
            it("THEN, Move action is invisible", () => {
                let moveAction = getActionByName("note.moveto");
                expect(moveAction.isVisible).toBeTruthy();
            });
            it("THEN, Move action is disabled", () => {
                let moveAction = getActionByName("note.moveto");
                expect(moveAction.isEnabled).toBeTruthy();
            });
        });

        describe("WHEN the NoteActionsViewModel is init but MeetingAccessRight.CanAddPoint and MeetingAccessRight.CanEditAllPoint is falsy ", () => {
            beforeEach(() => {
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.returnValue(true);
                let note = createNoteModel();
                note.MeetingAccessRight.CanAddPoint = false;
                note.MeetingAccessRight.CanEditAllPoint = false;
                vm = new ap.viewmodels.notes.NoteActionsViewModel(Utility, note, ControllersManager);
            });
            
            it("THEN, Move action is invisible", () => {
                let moveAction = getActionByName("note.moveto");
                expect(moveAction.isVisible).toBeTruthy();
            });
            it("THEN, Move action is disabled", () => {
                let moveAction = getActionByName("note.moveto");
                expect(moveAction.isEnabled).toBeFalsy();
            });
        });

        describe("WHEN the NoteActionsViewModel is init with a read only note", () => {
            beforeEach(() => {
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.returnValue(false);
                let note = createNoteModel();
                note.IsReadOnly = true;
                vm = new ap.viewmodels.notes.NoteActionsViewModel(Utility, note, ControllersManager);
            });

            it("THEN, Copy action is visible", () => {
                let copyAction = getActionByName("note.copy");
                expect(copyAction.isVisible).toBeTruthy();
            });
            it("THEN, Copy action is disabled", () => {
                let copyAction = getActionByName("note.copy");
                expect(copyAction.isEnabled).toBeFalsy();
            });
            it("THEN, Move action isn't visible", () => {
                let moveAction = getActionByName("note.moveto");
                expect(moveAction.isVisible).toBeFalsy();
            });
            it("THEN, Move action is enable", () => {
                let moveAction = getActionByName("note.moveto");
                expect(moveAction.isEnabled).toBeFalsy();
            });
        });

        describe("WHEN the NoteActionsViewModel is init but the user has not the Module_MeetingManagement", () => {
            beforeEach(() => {
                let note = createNoteModel();
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.returnValue(false);
                vm = new ap.viewmodels.notes.NoteActionsViewModel(Utility, note, ControllersManager);
            });
            it("THEN, CopyTo action is not visible", () => {
                let copyToAction = getActionByName("note.copyto");
                expect(copyToAction.isVisible).toBeFalsy();
            });
            it("THEN, CopyTo action is not enabled", () => {
                let copyToAction = getActionByName("note.copyto");
                expect(copyToAction.isEnabled).toBeFalsy();
            });
        });        
    });
    describe("Feature : raise events", () => {
        let n: ap.models.notes.Note;
        let docJSON: any;

        beforeEach(() => {
            n = new ap.models.notes.Note(Utility);
            n.CodeNum = "1.35";
            n.Code = "CODE 1.35";
            n.Subject = "Plumbing problem in the garage";
            n.From = new ap.models.actors.User(Utility);
            n.From.Person = new ap.models.actors.Person(Utility);
            n.From.Person.Name = "Marie";
            n.IsUrgent = false;
            n.MeetingAccessRight = MeetingAccessRight;
        });

        describe("WHEN notedeleted event is raised - > no note is selected", () => {
            beforeEach(() => {
                specHelper.general.spyProperty(ap.models.Entity.prototype, "Deleted", specHelper.PropertyAccessor.Get).and.returnValue(true);
                vm = new ap.viewmodels.notes.NoteActionsViewModel(Utility, n, ControllersManager);
                specHelper.general.raiseEvent(NoteController, "notedeleted", new ap.controllers.NoteBaseUpdatedEvent([n]));
            });
            afterEach(() => {
                specHelper.general.offSpyProperty(ap.models.Entity.prototype, "Deleted", specHelper.PropertyAccessor.Get);
            });
            it("THEN the actions urgent is not visible", () => {
                let action = getActionByName("urgentnote");
                expect(action.isVisible).toBeFalsy();
            });
            it("THEN the actions unurgent is not visible", () => {
                let action = getActionByName("unurgentnote");
                expect(action.isVisible).toBeFalsy();
            });
            it("THEN the actions edit is not visible", () => {
                let action = getActionByName("editnote");
                expect(action.isVisible).toBeFalsy();
            });
            it("THEN the actions archive is not visible", () => {
                let action = getActionByName("archivenote");
                expect(action.isVisible).toBeFalsy();
            });
            it("THEN the actions unarchive is not visible", () => {
                let action = getActionByName("unarchivenote");
                expect(action.isVisible).toBeFalsy();
            });
            it("THEN the actions delete is not visible", () => {
                let action = getActionByName("deletenote");
                expect(action.isVisible).toBeFalsy();
            });
        });
        describe("WHEN noteupdated event is raised", () => {
            beforeEach(() => {
                n.IsUrgent = true;
                vm = new ap.viewmodels.notes.NoteActionsViewModel(Utility, n, ControllersManager);
                specHelper.general.raiseEvent(NoteController, "noteupdated", null);
            });
            it("THEN the actions urgent is not visible", () => {
                let action = getActionByName("urgentnote");
                expect(action.isVisible).not.toBeTruthy();
            });
            it("THEN the actions unurgent is visible", () => {
                let action = getActionByName("unurgentnote");
                expect(action.isVisible).toBeTruthy();
            });
        });
        describe("WHEN notearchived event is raised", () => {
            beforeEach(() => {
                n.IsArchived = true;
                vm = new ap.viewmodels.notes.NoteActionsViewModel(Utility, n, ControllersManager);
                specHelper.general.raiseEvent(NoteController, "notearchived", null);
            });
            it("THEN the actions archive is not visible", () => {
                let action = getActionByName("archivenote");
                expect(action.isVisible).not.toBeTruthy();
            });
            it("THEN the actions unarchive is visible", () => {
                let action = getActionByName("unarchivenote");
                expect(action.isVisible).toBeTruthy();
            });
        });
        describe("WHEN noteunarchived event is raised", () => {
            beforeEach(() => {
                n.IsArchived = false;
                vm = new ap.viewmodels.notes.NoteActionsViewModel(Utility, n, ControllersManager);
                specHelper.general.raiseEvent(NoteController, "noteunarchived", null);
            });
            it("THEN the actions archive is visible", () => {
                let action = getActionByName("archivenote");
                expect(action.isVisible).toBeTruthy();
            });
            it("THEN the actions unarchive is not visible", () => {
                let action = getActionByName("unarchivenote");
                expect(action.isVisible).not.toBeTruthy();
            });
        });
    });
    describe("Feature: computeActionInfoVisibility", () => {
        describe("WHEN withInfo is set to false", () => {
            beforeEach(() => {
                let n = new ap.models.notes.Note(Utility);
                vm = new ap.viewmodels.notes.NoteActionsViewModel(Utility, n, ControllersManager);
                vm.withInfo = false;
            });
            it("THEN, infoAction.isVisible = false", () => {
                let action = getActionByName("note.gotodetail");
                expect(action.isVisible).toBeFalsy();
            });
            it("THEN, infoAction.isEnabled = false", () => {
                let action = getActionByName("note.gotodetail");
                expect(action.isEnabled).toBeFalsy();
            });
        });
        describe("WHEN withInfo is set to true", () => {
            beforeEach(() => {
                let n = new ap.models.notes.Note(Utility);
                vm = new ap.viewmodels.notes.NoteActionsViewModel(Utility, n, ControllersManager, false);
                vm.withInfo = true;
            });
            it("THEN, infoAction.isVisible = false", () => {
                let action = getActionByName("note.gotodetail");
                expect(action.isVisible).toBeTruthy();
            });
            it("THEN, infoAction.isEnabled = false", () => {
                let action = getActionByName("note.gotodetail");
                expect(action.isEnabled).toBeTruthy();
            });
        });
    });
});