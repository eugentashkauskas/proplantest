"use strict";
describe("Module ap-viewmodels - documents components - DocumentActionsViewModel", () => {
    let vm: ap.viewmodels.documents.DocumentActionsViewModel;
    let Utility: ap.utility.UtilityHelper, UserContext: ap.utility.UserContext;
    let $q: angular.IQService;    
    let DocumentController: ap.controllers.DocumentController;
    let MainController: ap.controllers.MainController;
    let baseTime = new Date(2016, 2, 20, 15, 30, 20);    
    let currentProject: any;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject(function (_$rootScope_, _UserContext_, _Utility_, _$q_, _DocumentController_, _MainController_) {
        Utility = _Utility_;
        UserContext = _UserContext_;
        $q = _$q_;
        DocumentController = _DocumentController_;
        MainController = _MainController_;

        specHelper.userContext.stub(Utility);
        specHelper.utility.stubRootUrl(_Utility_);
        specHelper.utility.stubStorageSet(_Utility_);

        currentProject = {
            Id: "45152-56",
            Name: "test",
            Code: "PR",
            UserAccessRight: {
                CanArchiveDoc: true,
                CanDownloadDoc: true,
                CanUploadDoc: true,
                CanDeleteDoc: true,
                CanEditDoc: true,
                Level: 3
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

    describe("Feature: constructor", () => {
        let doc: ap.models.documents.Document;

        function getActionByName(name: string): ap.viewmodels.home.ActionViewModel {
            return ap.viewmodels.home.ActionViewModel.getAction(vm.actions, name);
        }

        function setUpAccessRights(rights: any) {
            for (let rightName in rights) {
                specHelper.general.spyProperty(ap.models.accessRights.DocumentAccessRight.prototype, rightName, specHelper.PropertyAccessor.Get).and.returnValue(rights[rightName]);
            }
        }

        function tearDownAccessRights() {
            for (let propertyName in ap.models.accessRights.DocumentAccessRight.prototype) {
                specHelper.general.offSpyProperty(ap.models.accessRights.DocumentAccessRight.prototype, propertyName, specHelper.PropertyAccessor.Get);
            }
        }

        /**
         * Creates a document actions view model is a specific environment
         * @param isEditMode an indicator of whether a view model should be created in the edit mode
         * @param customAccessRights a set of custom access rights to set for a document
         */
        function createActionsVm(isEditMode: boolean, customAccessRights?: any): ap.viewmodels.documents.DocumentActionsViewModel {
            if (customAccessRights) {
                setUpAccessRights(customAccessRights);
            }
            return new ap.viewmodels.documents.DocumentActionsViewModel(Utility, doc, DocumentController, MainController, isEditMode);
        }

        beforeEach(() => {
            let docJSON = {
                Id: "28A2D91F-C098-40D2-8729-91E66785F424",
                EntityVersion: 1,
                IsArchived: true
            }

            doc = new ap.models.documents.Document(Utility);
            doc.createByJson(docJSON);
            doc.FileType = ap.models.documents.FileType.Plan;
            doc.Status = ap.models.documents.DocumentStatus.Processed;
            doc.ProcessingStatus = ap.models.documents.ProcessingStatus.FullyCompleted;
        });

        afterEach(() => {
            tearDownAccessRights();
        });

        describe("WHEN the DocumentActionsViewModel is init", () => {
            beforeEach(() => {
                doc.Author = new ap.models.actors.User(Utility);
                vm = new ap.viewmodels.documents.DocumentActionsViewModel(Utility, doc, DocumentController, MainController, false);
            });

            it("THEN, there are 11 actions", () => {
                expect(vm.actions.length).toEqual(11);
            });
            it("THEN, 1st action is Preview", () => {
                expect(vm.actions[0].name).toEqual("document.preview");
            });
            it("THEN, 2nd action is Rotate left", () => {
                expect(vm.actions[1].name).toEqual("document.rotateleft");
            });
            it("THEN, 3rd action is Rotate right", () => {
                expect(vm.actions[2].name).toEqual("document.rotateright");
            });
            it("THEN, 4th action is Send Report", () => {
                expect(vm.actions[3].name).toEqual("report.sendByEmail");
            });
            it("THEN, 5th action is Download", () => {
                expect(vm.actions[4].name).toEqual("document.download");
            });
            it("THEN, 6th action is Edit", () => {
                expect(vm.actions[5].name).toEqual("document.edit");
            });
            it("THEN, 7th action is Archive", () => {
                expect(vm.actions[6].name).toEqual("document.archive");
            });
            it("THEN, 8th action is Unarchive", () => {
                expect(vm.actions[7].name).toEqual("document.unarchive");
            });
            it("THEN, 9th action is Delete", () => {
                expect(vm.actions[8].name).toEqual("document.delete");
            });
            it("THEN, 10th action is Info", () => {
                expect(vm.actions[9].name).toEqual("document.info");
            });
            it("THEN, 11th action is Add version", () => {
                expect(vm.actions[10].name).toEqual("document.addversion");
            });
            it("THEN, Edit action has shortcut", () => {
                expect(getActionByName("document.edit").shortcut).toBeDefined();
            });
            it("THEN, Delete action has shortcut", () => {
                expect(getActionByName("document.delete").shortcut).toBeDefined();
            });
            it("THEN, we can get the document", () => {
                expect(vm.document).toBe(doc);
            });

            describe("AND in the preview mode", () => {
                beforeEach(() => {
                    vm = createActionsVm(true);
                });
                it("THEN, Preview action is invisible", () => {
                    expect(getActionByName("document.preview").isVisible).toBeFalsy();
                });
                it("THEN, Info action is invisible", () => {
                    expect(getActionByName("document.info").isVisible).toBeFalsy();
                });
            });

            describe("AND in not in the preview mode", () => {
                beforeEach(() => {
                    vm = createActionsVm(false);
                });
                it("THEN, Preview action is visible", () => {
                    expect(getActionByName("document.preview").isVisible).toBeTruthy();
                });
                it("THEN, Info action is visible", () => {
                    expect(getActionByName("document.info").isVisible).toBeTruthy();
                });
            });
        });

        describe("WHEN the DocumentActionsViewModel is init with a document uploaded by current user", () => {
            beforeEach(() => {
                doc.Author = Utility.UserContext.CurrentUser();
                vm = createActionsVm(false);
            });

            it("THEN, Download action is enabled", () => {
                expect(getActionByName("document.download").isEnabled).toBeTruthy();
            });
            it("THEN, Edit action is enabled", () => {
                expect(getActionByName("document.edit").isEnabled).toBeTruthy();
            });
            it("THEN, Archive action is NOT visible", () => {
                expect(getActionByName("document.archive").isVisible).toBeFalsy();
            });
            it("THEN, Unarchive action is enabled", () => {
                expect(getActionByName("document.unarchive").isEnabled).toBeTruthy();
            });
            it("THEN, Unarchive action is visible", () => {
                expect(getActionByName("document.unarchive").isVisible).toBeTruthy();
            });
            it("THEN, Delete action is visible", () => {
                expect(getActionByName("document.delete").isVisible).toBeTruthy();
            });
            it("THEN, Delete action is enabled", () => {
                expect(getActionByName("document.delete").isEnabled).toBeTruthy();
            });
            it("THEN, Info action is visible", () => {
                expect(getActionByName("document.info").isVisible).toBeTruthy();
            });
            it("THEN, Info action is enabled", () => {
                expect(getActionByName("document.info").isEnabled).toBeTruthy();
            });
            it("THEN, Add version action is visible when canAddVersion access right is true", () => {
                vm = createActionsVm(false, { canAddVersion: true });
                expect(getActionByName("document.addversion").isVisible).toBeTruthy();
            });
            it("THEN, Add version action is invisible when canAddVersion access right is false", () => {
                vm = createActionsVm(false, { canAddVersion: false });
                expect(getActionByName("document.addversion").isVisible).toBeFalsy();
            });
            it("THEN, Add version action is enabled when hasAddVersionAccess access right is true", () => {
                vm = createActionsVm(false, { hasAddVersionAccess: true });
                expect(getActionByName("document.addversion").isEnabled).toBeTruthy();
            });
            it("THEN, Add version action is disabled when hasAddVersionAccess access right is false", () => {
                vm = createActionsVm(false, { hasAddVersionAccess: false });
                expect(getActionByName("document.addversion").isEnabled).toBeFalsy();
            });

            describe("AND in the preview mode", () => {
                beforeEach(() => {
                    vm = createActionsVm(true);
                });
                it("THEN, Rotate left action is visible", () => {
                    expect(getActionByName("document.rotateleft").isVisible).toBeTruthy();
                });
                it("THEN, Rotate left action is enabled if a document is fully processed", () => {
                    expect(getActionByName("document.rotateleft").isEnabled).toBeTruthy();
                });
                it("THEN, Rotate right action is visible", () => {
                    expect(getActionByName("document.rotateright").isVisible).toBeTruthy();
                });
                it("THEN, Rotate right action is enabled if a document is fully processed", () => {
                    expect(getActionByName("document.rotateright").isEnabled).toBeTruthy();
                });
            });

            describe("AND in not in the preview mode", () => {
                beforeEach(() => {
                    vm = createActionsVm(false);
                });
                it("THEN, Rotate left action is invisible", () => {
                    expect(getActionByName("document.rotateleft").isVisible).toBeFalsy();
                });
                it("THEN, Rotate right action is invisible", () => {
                    expect(getActionByName("document.rotateright").isVisible).toBeFalsy();
                });
            });
        });

        describe("WHEN the DocumentActionsViewModel is init with a document uploaded by other user", () => {
            beforeEach(() => {
                doc.Author = new ap.models.actors.User(Utility);
                doc.Author.createByJson({ Id: "User2" });
                vm = new ap.viewmodels.documents.DocumentActionsViewModel(Utility, doc, DocumentController, MainController, false);
            });

            it("THEN, Download action is enabled", () => {
                expect(getActionByName("document.download").isEnabled).toBeTruthy();
            });
            it("THEN, Edit action is NOT enabled", () => {
                expect(getActionByName("document.edit").isEnabled).toBeFalsy();
            });
            it("THEN, Archive action is NOT visible", () => {
                expect(getActionByName("document.archive").isVisible).toBeFalsy();
            });
            it("THEN, Unarchive action is NOT enabled", () => {
                expect(getActionByName("document.unarchive").isEnabled).toBeFalsy();
            });
            it("THEN, Unarchive action is visible", () => {
                expect(getActionByName("document.unarchive").isVisible).toBeTruthy();
            });
            it("THEN, Delete action is visible", () => {
                expect(getActionByName("document.delete").isVisible).toBeTruthy();
            });
            it("THEN, Delete action is NOT enabled", () => {
                expect(getActionByName("document.delete").isEnabled).toBeFalsy();
            });
            it("THEN, Info action is visible", () => {
                expect(getActionByName("document.info").isVisible).toBeTruthy();
            });
            it("THEN, Info action is enabled", () => {
                expect(getActionByName("document.info").isEnabled).toBeTruthy()
            });
            it("THEN, Add version action is visible when canAddVersion access right is true", () => {
                vm = createActionsVm(false, { canAddVersion: true });
                expect(getActionByName("document.addversion").isVisible).toBeTruthy();
            });
            it("THEN, Add version action is invisible when canAddVersion access right is false", () => {
                vm = createActionsVm(false, { canAddVersion: false });
                expect(getActionByName("document.addversion").isVisible).toBeFalsy();
            });
            it("THEN, Add version action is enabled when hasAddVersionAccess access right is true", () => {
                vm = createActionsVm(false, { hasAddVersionAccess: true });
                expect(getActionByName("document.addversion").isEnabled).toBeTruthy();
            });
            it("THEN, Add version action is disabled when hasAddVersionAccess access right is false", () => {
                vm = createActionsVm(false, { hasAddVersionAccess: false });
                expect(getActionByName("document.addversion").isEnabled).toBeFalsy();
            });

            describe("AND is in the preview mode", () => {
                beforeEach(() => {
                    vm = createActionsVm(true);
                });
                it("THEN, Rotate left action is visible", () => {
                    expect(getActionByName("document.rotateleft").isVisible).toBeTruthy();
                });
                it("THEN, Rotate right action is visible", () => {
                    expect(getActionByName("document.rotateright").isVisible).toBeTruthy();
                });
            });

            describe("AND is not in the preview mode", () => {
                beforeEach(() => {
                    vm = createActionsVm(false);
                });
                it("THEN, Rotate left action is invisible", () => {
                    expect(getActionByName("document.rotateleft").isVisible).toBeFalsy();
                });
                it("THEN, Rotate right action is invisible", () => {
                    expect(getActionByName("document.rotateright").isVisible).toBeFalsy();
                });
            });
        });
    });
          
    describe("Feature documentupdated event", () => {
        describe("WHEN, document achived and event raised from DocumentController", () => {
            let doc: ap.models.documents.Document;
            let docJSON: any;

            let docEvent: ap.models.documents.Document;
            beforeEach(() => {
                docJSON = {
                    Id: "28A2D91F-C098-40D2-8729-91E66785F424",
                    EntityVersion: 1,
                    IsArchived: false
                }

                doc = new ap.models.documents.Document(Utility);
                doc.createByJson(docJSON);
                doc.ProcessingStatus = ap.models.documents.ProcessingStatus.FullyCompleted;
                doc.Author = Utility.UserContext.CurrentUser();
                vm = new ap.viewmodels.documents.DocumentActionsViewModel(Utility, doc, DocumentController, MainController, true);

                docEvent = new ap.models.documents.Document(Utility);
                docJSON.IsArchived = true;
                docJSON.EntityVersion = 2;
                docEvent.createByJson(docJSON);
                docEvent.Author = Utility.UserContext.CurrentUser();
                let e = new ap.controllers.EntityUpdatedEvent<ap.models.documents.Document>(docEvent, ["IsArchived"]);
                specHelper.general.raiseEvent(DocumentController, "documentupdated", e);
            });
            it("THEN, the Archive action is NOT visible", () => {
                expect(ap.viewmodels.home.ActionViewModel.getAction(vm.actions, "document.archive").isVisible).toBeFalsy();
            });
            it("THEN, the Unarchive action is visible", () => {
                expect(ap.viewmodels.home.ActionViewModel.getAction(vm.actions, "document.unarchive").isVisible).toBeTruthy();
            });
        });
    });

    describe("Feature: documentstatusrefreshed event", () => {
        let doc: ap.models.documents.Document;
        let docEvent: ap.models.documents.Document;

        beforeEach(() => {
            let docJSON = {
                Id: "28A2D91F-C098-40D2-8729-91E66785F424",
                EntityVersion: 1,
                IsArchived: false
            };

            doc = new ap.models.documents.Document(Utility);
            doc.createByJson(docJSON);
            doc.ProcessingStatus = ap.models.documents.ProcessingStatus.TilesProcessing;
            doc.Author = Utility.UserContext.CurrentUser();

            spyOn(doc, "copyStandardProperties").and.callThrough();

            docEvent = new ap.models.documents.Document(Utility);                
            docJSON.EntityVersion = 2;
            docEvent.createByJson(docJSON);
            docEvent.ProcessingStatus = ap.models.documents.ProcessingStatus.FullyCompleted;
            docEvent.Author = Utility.UserContext.CurrentUser();
        });

        describe("WHEN a document's processing is finished and it is not in the preview mode", () => {
            beforeEach(() => {
                vm = new ap.viewmodels.documents.DocumentActionsViewModel(Utility, doc, DocumentController, MainController, false);
                specHelper.general.raiseEvent(DocumentController, "documentstatusrefreshed", docEvent);
            });
            it("THEN the document is be updated", () => {
                expect(vm.document.EntityVersion).toEqual(2);
            });
            it("THEN the Preview action is visible", () => {
                expect(ap.viewmodels.home.ActionViewModel.getAction(vm.actions, "document.preview").isVisible).toBeTruthy();
            });
        });

        describe("WHEN a document's processing is finished and it is in the preview mode", () => {
            beforeEach(() => {
                // It may be not possible to get into the preview mode when a document is not fully processed
                // because the Preview action will be invisible. But rotate actions don't know about it.
                vm = new ap.viewmodels.documents.DocumentActionsViewModel(Utility, doc, DocumentController, MainController, true);
                specHelper.general.raiseEvent(DocumentController, "documentstatusrefreshed", docEvent);
            });
            it("THEN the document is be updated", () => {
                expect(vm.document.EntityVersion).toEqual(2);
            });
            it("THEN the Rotate left action is visible", () => {
                expect(ap.viewmodels.home.ActionViewModel.getAction(vm.actions, "document.rotateleft").isVisible).toBeTruthy();
            });
            it("THEN the Rotate right action is visible", () => {
                expect(ap.viewmodels.home.ActionViewModel.getAction(vm.actions, "document.rotateright").isVisible).toBeTruthy();
            });
        });
    });

    describe("Feature: isPreviewMode property", () => {
        let doc: ap.models.documents.Document;

        beforeEach(() => {
            let docJSON = {
                Id: "28A2D91F-C098-40D2-8729-91E66785F424",
                EntityVersion: 1,
                IsArchived: true
            };

            doc = new ap.models.documents.Document(Utility);
            doc.createByJson(docJSON);
            doc.Author = Utility.UserContext.CurrentUser();
            doc.ProcessingStatus = ap.models.documents.ProcessingStatus.FullyCompleted;
        });

        describe("WHEN isPreviewMode is changed from false to true", () => {
            beforeEach(() => {
                vm = new ap.viewmodels.documents.DocumentActionsViewModel(Utility, doc, DocumentController, MainController, false);
                vm.isPreviewMode = true;
            });
            it("THEN, the Preview action is NOT visible", () => {
                expect(ap.viewmodels.home.ActionViewModel.getAction(vm.actions, "document.preview").isVisible).toBeFalsy();
            });
            it("THEN, the Rotate left action is visible", () => {
                expect(ap.viewmodels.home.ActionViewModel.getAction(vm.actions, "document.rotateleft").isVisible).toBeTruthy();
            });
            it("THEN, the Rotate right action is visible", () => {
                expect(ap.viewmodels.home.ActionViewModel.getAction(vm.actions, "document.rotateright").isVisible).toBeTruthy();
            });
        });

        describe("WHEN isPreviewMode is changed from true to false", () => {
            beforeEach(() => {
                vm = new ap.viewmodels.documents.DocumentActionsViewModel(Utility, doc, DocumentController, MainController, true);
                vm.isPreviewMode = false;
            });
            it("THEN, the Preview action is visible", () => {
                expect(ap.viewmodels.home.ActionViewModel.getAction(vm.actions, "document.preview").isVisible).toBeTruthy();
            });
            it("THEN, the Rotate left action is NOT visible", () => {
                expect(ap.viewmodels.home.ActionViewModel.getAction(vm.actions, "document.rotateleft").isVisible).toBeFalsy();
            });
            it("THEN, the Rotate right action is NOT visible", () => {
                expect(ap.viewmodels.home.ActionViewModel.getAction(vm.actions, "document.rotateright").isVisible).toBeFalsy();
            });
        });
    });

    describe("Feature: visibleActionsCount", () => {
        describe("WHEN the DocumentActionsViewModel is init with a document and set Preview action not to visible", () => {
            let doc: ap.models.documents.Document;
            let docJSON: any;
            beforeEach(() => {
                docJSON = {
                    Id: "28A2D91F-C098-40D2-8729-91E66785F424",
                    EntityVersion: 1,
                    IsArchived: true,
                    Author: modelSpecHelper.createUserJson("Ricca", "Eveline", "User1", false),
                }

                doc = new ap.models.documents.Document(Utility);
                doc.createByJson(docJSON);
                doc.ProcessingStatus = ap.models.documents.ProcessingStatus.FullyCompleted;
                doc.Author = Utility.UserContext.CurrentUser();
                doc.Status = ap.models.documents.DocumentStatus.Processed;
                vm = new ap.viewmodels.documents.DocumentActionsViewModel(Utility, doc, DocumentController, MainController, false);

                vm.actions[0].isVisible = false;
            });
            it("THEN, visibleActionsCount = 5", () => { expect(vm.visibleActionsCount).toEqual(5); });
        });
    });

    describe("Feature addActions", () => {
        let doc: ap.models.documents.Document;
        let docJSON: any;
        beforeEach(() => {
            docJSON = {
                Id: "28A2D91F-C098-40D2-8729-91E66785F424",
                EntityVersion: 1,
                IsArchived: true
            }

            doc = new ap.models.documents.Document(Utility);
            doc.createByJson(docJSON);
            doc.ProcessingStatus = ap.models.documents.ProcessingStatus.FullyCompleted;
            doc.Author = Utility.UserContext.CurrentUser();
            doc.Status = ap.models.documents.DocumentStatus.Processed;
        });
        it("THE addActions is defined when the vm init", () => {
            vm = new ap.viewmodels.documents.DocumentActionsViewModel(Utility, doc, DocumentController, MainController, true);
            expect(vm.addActions).toBeDefined();
        });
    });

    describe("Feature: versionadded", () => {
        let doc: ap.models.documents.Document;
        let docJSON: any;
        beforeEach(() => {
            docJSON = {
                Id: "28A2D91F-C098-40D2-8729-91E66785F424",
                EntityVersion: 1,
                IsArchived: false
            }

            doc = new ap.models.documents.Document(Utility);
            doc.createByJson(docJSON);
            doc.ProcessingStatus = ap.models.documents.ProcessingStatus.FullyCompleted;
            doc.Author = Utility.UserContext.CurrentUser();
            vm = new ap.viewmodels.documents.DocumentActionsViewModel(Utility, doc, DocumentController, MainController, true);
            
        });
        describe("WHEN 'versionadded' event was fired from the documentcontroller with the updated document same with the vm", () => {
            it("THEN, vm will updated with the document", () => {
                let updatedDoc: ap.models.documents.Document = new ap.models.documents.Document(Utility);
                updatedDoc.createByJson({ Id: "28A2D91F-C098-40D2-8729-91E66785F424", EntityVersion: 2});
                updatedDoc.Author = Utility.UserContext.CurrentUser();
                specHelper.general.raiseEvent(DocumentController, "versionadded", new KeyValue<ap.models.documents.Document, ap.models.documents.Version>(updatedDoc, null));
                expect(vm.document).toEqual(updatedDoc);
            });
        });
        
    });
});