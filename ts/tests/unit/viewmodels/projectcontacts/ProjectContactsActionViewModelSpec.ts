"use strict";
describe("Module ap-viewmodels - ProjectContactsActionViewModel", () => {
    let Utility: ap.utility.UtilityHelper,
        $q: angular.IQService,
        ContactController: ap.controllers.ContactController,
        MainController: ap.controllers.MainController,
        $scope: ng.IScope,
        $rootScope: angular.IRootScopeService,
        vm: ap.viewmodels.projectcontacts.ProjectContactsActionViewModel;
    let UserContext: ap.utility.UserContext;
    let inviteAction: ap.viewmodels.home.ActionViewModel;
    let sendTaskAction: ap.viewmodels.home.ActionViewModel;
    let editContactAction: ap.viewmodels.home.ActionViewModel;


    function initActions(vm: ap.viewmodels.projectcontacts.ProjectContactsActionViewModel) {
        inviteAction = ap.viewmodels.home.ActionViewModel.getAction(vm.actions, "projectcontacts.invitecontacts");
        sendTaskAction = ap.viewmodels.home.ActionViewModel.getAction(vm.actions, "projectcontacts.sendtasksmail");
        editContactAction = ap.viewmodels.home.ActionViewModel.getAction(vm.actions, "projectcontacts.editcontact");
    }

    function createViewModel(contact: ap.models.projects.ContactDetails) {
        vm = new ap.viewmodels.projectcontacts.ProjectContactsActionViewModel(Utility, contact, ContactController, MainController);
        initActions(vm);
    }
    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject((_$rootScope_, _Utility_, _$q_, _ContactController_, _MainController_, _UserContext_) => {
        Utility = _Utility_;
        $q = _$q_;
        ContactController = _ContactController_;
        MainController = _MainController_;
        UserContext = _UserContext_;
        specHelper.userContext.stub(Utility);

        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();

        spyOn(Utility.Translator, "getTranslation").and.callFake(function (key) {
            return "$" + key;
        });
    }));

    describe("Feature: constructor", () => {
        let contact: ap.models.projects.ContactDetails;

        beforeEach(() => {
            contact = new ap.models.projects.ContactDetails(Utility);
        });

        describe("WHEN call a constructor", () => {
            beforeEach(() => {
                vm = new ap.viewmodels.projectcontacts.ProjectContactsActionViewModel(Utility, contact, ContactController, MainController);
            });
            it("THEN, action viewmodels are initialized", () => {
                expect(vm.actions.length).toBe(5);
                expect(vm.actions[0].name).toEqual("projectcontacts.sendtasksmail");
                expect(vm.actions[1].name).toEqual("projectcontacts.invitecontacts");
                expect(vm.actions[2].name).toEqual("projectcontacts.editcontact");
                expect(vm.actions[3].name).toEqual("projectcontacts.contactinfo");
                expect(vm.actions[4].name).toEqual("projectcontacts.delete");
            });
        });

        describe("WHEN a call constructor with contact.IsInvited = true", () => {
            beforeEach(() => {
                contact.createByJson({ IsInvited: true });
                createViewModel(contact);
            });

            it("THEN, action 'projectcontacts.invitecontacts' should be defined with isEnabled = false", () => {
                expect(inviteAction).toBeDefined("projectcontacts.invitecontacts");
                expect(inviteAction.isEnabled).toBeFalsy();
                expect(inviteAction.isVisible).toBeFalsy();
                expect(inviteAction.translationKey).toBe("$Invite the participant");
            });
            it("THEN, action sendtasks is defined and isEnable = true", () => {
                expect(sendTaskAction).toBeDefined();
                expect(sendTaskAction.isEnabled).toBeTruthy();
                expect(sendTaskAction.translationKey).toBe("$Send tasks mail");
            });
        });

        describe("WHEN a call constructor with contact.IsInvited = false", () => {
            beforeEach(() => {
                contact.createByJson({ IsInvited: false });
                createViewModel(contact);
            });

            it("THEN, action 'projectcontacts.invitecontacts' should be defined with isEnabled = true", () => {
                expect(inviteAction.name).toBe("projectcontacts.invitecontacts");
                expect(inviteAction.isEnabled).toBeTruthy();
                expect(inviteAction.translationKey).toBe("$Invite the participant");
            });
            it("THEN, action sendtasks is defined and isEnable = true", () => {
                expect(sendTaskAction).toBeDefined();
                expect(sendTaskAction.isEnabled).toBeFalsy();
                expect(sendTaskAction.isVisible).toBeTruthy();
                expect(sendTaskAction.translationKey).toBe("$Send tasks mail");
            });
        });
    });

    describe("Feature: actionClick", () => {
        let contact: ap.models.projects.ContactDetails;
        let sendTaskSpy: jasmine.Spy;
        beforeEach(() => {
            contact = new ap.models.projects.ContactDetails(Utility);
            contact.createByJson({ IsInvited: true });
            sendTaskSpy = spyOn(ContactController, "sendUserTasksMail");
        });
        describe("WHEN 'projectcontacts.sendtasksmail' is triggered and ContactDetails.isInvited=true", () => {
            it("THEN, send tasks email to the user", () => {
                createViewModel(contact);
                vm.actionClick("projectcontacts.sendtasksmail");
                expect(sendTaskSpy).toHaveBeenCalledWith(contact);
            });
        });
        describe("WHEN 'projectcontacts.sendtasksmail' is triggered and ContactDetails.isInvited=false", () => {
            it("THEN, send tasks email to the user", () => {
                contact.createByJson({ IsInvited: false });
                createViewModel(contact);
                vm.actionClick("projectcontacts.sendtasksmail");
                expect(sendTaskSpy).not.toHaveBeenCalled();
            });
        });
        describe("WHEN a call VM.actionClick method with a action name 'projectcontacts.invitecontacts'", () => {
            beforeEach(() => {                
                spyOn(ContactController, "requestInviteContact");
                createViewModel(contact);        
            });
            it("THEN, ContactController.requestInviteContact should be called", () => {
                vm.actionClick("projectcontacts.invitecontacts");
                expect(ContactController.requestInviteContact).toHaveBeenCalledWith([contact]);
            });    
        });
        describe("WHEN a call VM.actionClick method with a action name 'projectcontacts.editcontact'", () => {
            beforeEach(() => {
                spyOn(ContactController, "requestEditContact");

                createViewModel(contact);
                vm.actionClick("projectcontacts.editcontact");
            });
            it("THEN, contactController.", () => {
                expect(ContactController.requestEditContact).toHaveBeenCalled();
            });
        });
    });
    describe("Feature: contactinvited event", () => {
        let contact: ap.models.projects.ContactDetails;
        beforeEach(() => {
            contact = new ap.models.projects.ContactDetails(Utility);
            contact.createByJson({ Id: "test-contact-id", IsInvited: false });
            createViewModel(contact);
        });
        describe("WHEN users are invited and contactinvited is raised", () => {
            beforeEach(() => {
                let invitedContact = new ap.models.projects.ContactDetails(Utility);
                invitedContact.createByJson({ Id: "test-contact-id", IsInvited: true });
                specHelper.general.raiseEvent(ContactController, "contactsinvited", [invitedContact]);
            });
            it("THEN, 'Invite contact' action should be hidden", () => {
                expect(inviteAction.isVisible).toBeFalsy();
            });
            it("THEN, 'send tasks' action becomes enabled", () => {
                expect(sendTaskAction.isEnabled).toBeTruthy();
            });          
        });
    });

    describe("Feature: edit participant action", () => {
        let contactDetails: ap.models.projects.ContactDetails;
        describe("WHEN entity is initialized, and user does not have access to edit contact details", () => {
            beforeEach(() => {
                contactDetails = new ap.models.projects.ContactDetails(Utility);
                contactDetails.createByJson({
                    EntityCreationUser: "test-user",
                    UserAccessRight: {
                        CanEditContact: false,
                        CanEditAllContact: false,
                    }
                });
                createViewModel(contactDetails);
            });
            it("THEN, edit contact details button is disabled", () => {
                expect(editContactAction.isEnabled).toBeFalsy();
            });
        });

        describe("WHEN user has access rights to edit project's participant and it have created the contact entity", () => {
            beforeEach(() => {
                spyOn(MainController, "currentProject").and.callFake(() => {
                    return {
                        UserAccessRight: {
                            CanEditContact: true,
                            CanEditAllContact: false
                        },
                        Creator: {
                            Id: 'creator-id'
                        }
                    }
                });
                contactDetails = new ap.models.projects.ContactDetails(Utility);
                contactDetails.createByJson({
                    EntityCreationUser: "111",
                    User: {
                        Id: "112"
                    }
                });
                createViewModel(contactDetails);
            });
            it("THEN, edit contact details button is enabled", () => {
                expect(editContactAction.isEnabled).toBeTruthy();
            });
        });
        describe("WHEN user has access rights to edit all project's contacts", () => {
            beforeEach(() => {
                spyOn(MainController, "currentProject").and.callFake(() => {
                    return {
                        UserAccessRight: {
                            CanEditAllContact: true,
                            CanEditContact: false
                        },
                        Creator: {
                            Id: 'creator-id'
                        }
                    }
                });
                contactDetails = new ap.models.projects.ContactDetails(Utility);
                contactDetails.createByJson({
                    User: {
                        Id: "111"
                    }
                });
                createViewModel(contactDetails);
            });
            it("THEN, edit contact details button is enabled", () => {
                expect(editContactAction.isEnabled).toBeTruthy();
            });
        });
        describe("WHEN contact details represent current user's info", () => {
            beforeEach(() => {
                spyOn(MainController, "currentProject").and.callFake(() => {
                    return {
                        UserAccessRight: {
                            CanEditContact: false,
                            CanEditAllContact: false
                        }
                    }
                });
                contactDetails = new ap.models.projects.ContactDetails(Utility);
                contactDetails.createByJson({
                    User: {
                        Id: "111"
                    }
                });
                createViewModel(contactDetails);
            });
            it("THEN, edit contact details button is enabled", () => {
                expect(editContactAction.isEnabled).toBeTruthy();
            });
        });
    });
});