'use strict';
describe("Module ap-viewmodels - SendReportViewModel", () => {
    let nmp = ap.viewmodels.reports;
    let MainController: ap.controllers.MainController;
    let Utility: ap.utility.UtilityHelper;
    let Api: ap.services.apiHelper.Api;
    let UserContext: ap.utility.UserContext;
    let ReportController: ap.controllers.ReportController;
    let ProjectController: ap.controllers.ProjectController;
    let ContactService: ap.services.ContactService;

    let $controller: angular.IControllerService, $rootScope: angular.IRootScopeService, $scope: angular.IScope, _deferred: angular.IDeferred<ap.services.apiHelper.ApiResponse>,
        $q: angular.IQService, $timeout: angular.ITimeoutService, $compile: angular.ICompileService;

    let sendReportViewModel: ap.viewmodels.reports.SendReportViewModel = null;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject(function (_$rootScope_, _$q_, _$timeout_, _$compile_, _UserContext_, _Utility_, _Api_, _ProjectController_, _MainController_, _ReportController_, _$controller_, _ContactService_) {
        MainController = _MainController_;
        ReportController = _ReportController_;
        ProjectController = _ProjectController_;
        ContactService = _ContactService_;
        Utility = _Utility_;
        UserContext = _UserContext_;
        Api = _Api_;
        $q = _$q_;
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $timeout = _$timeout_;

        _deferred = $q.defer();
        $controller = _$controller_;
        $scope = $rootScope.$new();

        specHelper.utility.stubRootUrl(Utility);
        specHelper.userContext.stub(Utility);
        Utility.Storage.Session.clear();
        specHelper.utility.stubStorageSet(Utility);
        spyOn(MainController, "currentProject").and.returnValue(
            {
                Id: "b360cb6d-ca54-4b93-a564-a469274eb68a",
                Name: "Welcome Project",
                Code: "PR1",
                UserAccessRight: {
                    CanConfig: false
                }
            }
        );

    }));
    describe("Feature Constructor", () => {
        describe("WHEN i requested create the SendReportViewModel", () => {
            it("THEN I can get an instance of SendReportViewModel with correct default values", () => {
                sendReportViewModel = new ap.viewmodels.reports.SendReportViewModel(Utility, Api, $q, ProjectController, ReportController, MainController, ContactService);
                expect(sendReportViewModel).toBeDefined();
                expect(sendReportViewModel.subject).toBeNull();
                expect(sendReportViewModel.body).toBeNull();
                expect(sendReportViewModel.pdfName).toBeNull();
                expect(sendReportViewModel.excelName).toBeNull();
                expect(sendReportViewModel.hasExcelAttachment).toBeFalsy();
                expect(sendReportViewModel.recipientsSelector).toBeDefined();
                expect(sendReportViewModel.recipientsSelector).not.toBeNull();
                expect(sendReportViewModel.maySend).toBeFalsy();
            });
            
        });
    });
    describe("Feature maySend", () => {
        let listContact: ap.viewmodels.projects.ContactItemViewModel[];
        beforeEach(() => {
            sendReportViewModel = new ap.viewmodels.reports.SendReportViewModel(Utility, Api, $q, ProjectController, ReportController, MainController, ContactService);
            listContact = [];
            listContact.push(new ap.viewmodels.projects.ContactItemViewModel("Sergio", "U1"));
        });
        it("maySend return false when subject is empty", () => {
            specHelper.general.spyProperty(ap.viewmodels.projects.ContactSelectorViewModel.prototype, "selectedContacts", specHelper.PropertyAccessor.Get).and.returnValue(listContact);
            sendReportViewModel.body = "Body";
            expect(sendReportViewModel.maySend).toBeFalsy();
            specHelper.general.offSpyProperty(ap.viewmodels.projects.ContactSelectorViewModel.prototype, "selectedContacts", specHelper.PropertyAccessor.Get);
        });
        it("maySend return false when body is empty", () => {
            specHelper.general.spyProperty(ap.viewmodels.projects.ContactSelectorViewModel.prototype, "selectedContacts", specHelper.PropertyAccessor.Get).and.returnValue(listContact);
            sendReportViewModel.subject = "Subject";
            expect(sendReportViewModel.maySend).toBeFalsy();
            specHelper.general.offSpyProperty(ap.viewmodels.projects.ContactSelectorViewModel.prototype, "selectedContacts", specHelper.PropertyAccessor.Get);
        });
        it("maySend return false when recipientsSelector.selectedContacts is empty", () => {
            specHelper.general.spyProperty(ap.viewmodels.projects.ContactSelectorViewModel.prototype, "selectedContacts", specHelper.PropertyAccessor.Get).and.returnValue([]);
            sendReportViewModel.subject = "Subject";
            sendReportViewModel.body = "Body";
            expect(sendReportViewModel.maySend).toBeFalsy();
            specHelper.general.offSpyProperty(ap.viewmodels.projects.ContactSelectorViewModel.prototype, "selectedContacts", specHelper.PropertyAccessor.Get);
        });
        it("maySend return true when subject, body and recipientsSelector.selectedContacts are not empty", () => {
            specHelper.general.spyProperty(ap.viewmodels.projects.ContactSelectorViewModel.prototype, "selectedContacts", specHelper.PropertyAccessor.Get).and.returnValue(listContact);
            sendReportViewModel.subject = "Subject";
            sendReportViewModel.body = "Body";
            expect(sendReportViewModel.maySend).toBeTruthy();
            specHelper.general.offSpyProperty(ap.viewmodels.projects.ContactSelectorViewModel.prototype, "selectedContacts", specHelper.PropertyAccessor.Get);
        });
    });
    describe("Feature initReportParams", () => {
        let listContact: ap.viewmodels.projects.ContactItemViewModel[];
        let pointReportParam: ap.misc.PointReportParams;

        beforeEach(() => {
            listContact = [];
            listContact.push(new ap.viewmodels.projects.ContactItemViewModel("Sergio", "U1"));
            listContact.push(new ap.viewmodels.projects.ContactItemViewModel("Renauld", "U2"));
            // Fake contac item
            listContact.push(new ap.viewmodels.projects.ContactItemViewModel("Fred", "U3", null, null, false, true));

            sendReportViewModel = new ap.viewmodels.reports.SendReportViewModel(Utility, Api, $q, ProjectController, ReportController, MainController, ContactService);
            sendReportViewModel.subject = "Subject";
            sendReportViewModel.body = "Body";

            let projectReportConfig: ap.models.reports.ProjectReportConfig = new ap.models.reports.ProjectReportConfig(Utility);
            pointReportParam = new ap.misc.PointReportParams(Utility, projectReportConfig);
        });
        describe("WHEN initPointReportParams called with the PointReportParams object", () => {
            it("THEN, the PointReportParams will be updated by values of the vm", () => {
                specHelper.general.spyProperty(ap.viewmodels.projects.ContactSelectorViewModel.prototype, "selectedContacts", specHelper.PropertyAccessor.Get).and.returnValue(listContact);

                sendReportViewModel.initReportParams(pointReportParam);

                expect(pointReportParam.mailSubject).toEqual("Subject");
                expect(pointReportParam.mailBody).toEqual("Body");
                expect(pointReportParam.recipientIds.length).toEqual(2);
                expect(pointReportParam.recipientIds[0]).toEqual("U1");
                expect(pointReportParam.recipientIds[1]).toEqual("U2");

                specHelper.general.offSpyProperty(ap.viewmodels.projects.ContactSelectorViewModel.prototype, "selectedContacts", specHelper.PropertyAccessor.Get);
            });
        });
    });

    describe("Feature onRecipientRemoved", () => {
        beforeEach(() => {
            sendReportViewModel = new ap.viewmodels.reports.SendReportViewModel(Utility, Api, $q, ProjectController, ReportController, MainController, ContactService);
        });
        describe("WHEN the contact have been removed from the recipientsSelector and the method onRecipientRemoved called", () => {
            it("THEN, the contact will be add again if canRemove = false", () => {
                let contact = new ap.viewmodels.projects.ContactItemViewModel("Sergio", "U1", null, null, false, true, null);
                sendReportViewModel.recipientsSelector.addItem(contact);
                sendReportViewModel.recipientsSelector.selectedContacts.splice(0, 1);
                sendReportViewModel.onRecipientRemoved(contact);
                expect(sendReportViewModel.recipientsSelector.selectedContacts.length).toEqual(1);
                expect(sendReportViewModel.recipientsSelector.selectedContacts[0]).toEqual(contact);
            });
            it("THEN, the contact will not be add again if canRemove = true", () => {
                let contact = new ap.viewmodels.projects.ContactItemViewModel("Sergio", "U1");
                sendReportViewModel.recipientsSelector.addItem(contact);
                sendReportViewModel.recipientsSelector.selectedContacts.splice(0, 1);
                sendReportViewModel.onRecipientRemoved(contact);
                expect(sendReportViewModel.recipientsSelector.selectedContacts.length).toEqual(0);
            });
        });
    });

    describe("Feature createNewContacts", () => {
        let deferredCreateContact;
        beforeEach(() => {
            deferredCreateContact = $q.defer();
            sendReportViewModel = new ap.viewmodels.reports.SendReportViewModel(Utility, Api, $q, ProjectController, ReportController, MainController, ContactService);
            spyOn(ContactService, "createListContactDetails").and.returnValue(deferredCreateContact.promise);
            spyOn(MainController, "showToast");
        });
        describe("WHEN createNewContacts called and the recipientsSelector.selectedContacts does not have new contact need to create", () => {
            beforeEach(() => {
                let contact = new ap.viewmodels.projects.ContactItemViewModel("Sergio", "U1", null, null, false, true, null);
                sendReportViewModel.recipientsSelector.addItem(contact);
            });
            it("THEN, the contactservice.createListContactDetails method is not to called", () => {
                sendReportViewModel.createNewContacts();
                expect(ContactService.createListContactDetails).not.toHaveBeenCalled();
            });
            it("AND THEN resolve the promise with null", () => {
                let callback = jasmine.createSpy("callback");
                sendReportViewModel.createNewContacts().then((result) => {
                    callback(result);
                    expect(result).toBeNull();
                });
                $rootScope.$apply();
                expect(callback).toHaveBeenCalled();
            });
        });
        describe("WHEN createNewContacts called and the recipientsSelector.selectedContacts have new contact need to create", () => {
            let newContact: ap.models.projects.ContactDetails;
            beforeEach(() => {
                let contact1 = new ap.viewmodels.projects.ContactItemViewModel("Sergio", "U1", null, null, false, true, null);
                sendReportViewModel.recipientsSelector.addItem(contact1);
                newContact = new ap.models.projects.ContactDetails(Utility);
                newContact.DisplayName = "Renauld";
                newContact.IsInvited = true;
                let newContactItem = new ap.viewmodels.projects.ContactItemViewModel("Renauld", "U2", null, newContact, true, false, null);
                sendReportViewModel.recipientsSelector.addItem(newContactItem);
            });

            it("THEN, the contactservice.createListContactDetails method will called with the newContact and isInvited = true if the user has not access to module 'PROJECT_CTC_PREPARE'", () => {
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.returnValue(false);
                sendReportViewModel.createNewContacts();
                expect(ContactService.createListContactDetails).toHaveBeenCalledWith([sendReportViewModel.recipientsSelector.selectedContacts[1].contactDetails], true, Utility.UserContext.LanguageCode(), null);
            });
            it("THEN, the contactservice.createListContactDetails method will called with the newContact and isInvited = true if the user has access to module 'PROJECT_CTC_PREPARE' and can not config project", () => {
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.returnValue(true);
                sendReportViewModel.createNewContacts();
                expect(ContactService.createListContactDetails).toHaveBeenCalledWith([sendReportViewModel.recipientsSelector.selectedContacts[1].contactDetails], true, Utility.UserContext.LanguageCode(), null);
            });
            it("AND THEN toast message will be show ", () => {
                sendReportViewModel.createNewContacts();
                deferredCreateContact.resolve([newContact]);
                $rootScope.$apply();
                expect(MainController.showToast).toHaveBeenCalledWith("app.contacts.participantinvited_message", null, null, ["Renauld"]);
            });

            it("AND THEN resolve the promise with the list of created contact", () => {
                let callback = jasmine.createSpy("callback");
                sendReportViewModel.createNewContacts().then((result) => {
                    callback(result);
                });
                deferredCreateContact.resolve([newContact]);
                $rootScope.$apply();
                expect(callback).toHaveBeenCalled();
            });
            it("AND THEN show the error message if have error", () => {
            });
        });

    });

    describe("Feature onRecipientAdded", () => {
        beforeEach(() => {
            sendReportViewModel = new ap.viewmodels.reports.SendReportViewModel(Utility, Api, $q, ProjectController, ReportController, MainController, ContactService);
        });
        describe("WHEN the contact have been added from the recipientsSelector and the method onRecipientAdded called", () => {
            let contact: ap.viewmodels.projects.ContactItemViewModel;
            beforeEach(() => {
                contact = new ap.viewmodels.projects.ContactItemViewModel("Sergio", "U1");
                sendReportViewModel.recipientsSelector.addItem(contact);
            });
            it("THEN, the contact will be remove if there are exists contacts with same userid", () => {
                let newContact = new ap.viewmodels.projects.ContactItemViewModel("Sergio-Tag", "U1");
                sendReportViewModel.recipientsSelector.addItem(newContact);

                sendReportViewModel.onRecipientAdded(newContact);
                expect(sendReportViewModel.recipientsSelector.selectedContacts.length).toEqual(1);
                expect(sendReportViewModel.recipientsSelector.selectedContacts[0]).toEqual(contact);
            });
            it("THEN, the contact will not be remove if there is no existing contact with same id", () => {
                let newContact = new ap.viewmodels.projects.ContactItemViewModel("Sergio", "U2");
                sendReportViewModel.recipientsSelector.addItem(newContact);

                sendReportViewModel.onRecipientAdded(newContact);

                expect(sendReportViewModel.recipientsSelector.selectedContacts.length).toEqual(2);
                expect(sendReportViewModel.recipientsSelector.selectedContacts[0]).toEqual(contact);
                expect(sendReportViewModel.recipientsSelector.selectedContacts[1]).toEqual(newContact);
            });
        });
    });
});   