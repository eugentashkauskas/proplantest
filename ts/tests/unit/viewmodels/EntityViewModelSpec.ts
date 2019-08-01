'use strict'

describe("Module ap-viewmodel - EntityViewModel", () => {

    let Utility: ap.utility.UtilityHelper;

    beforeEach(() => {
        angular.mock.module("ap-controllers");
    });

    beforeEach(inject((_Utility_) => {
        Utility = _Utility_;
    }));

    class TestEntityViewModel extends ap.viewmodels.EntityViewModel {
        raisePropertyChanged(propertyName: string, oldValue: any, caller: any) {
            super.raisePropertyChanged(propertyName, oldValue, caller);
        }
    }

    it("check default values values of my factory", () => {
        let entityVm = new ap.viewmodels.EntityViewModel(Utility);
        expect(entityVm.isDataOk).toBeTruthy();
        expect(entityVm.isSelected).toBeFalsy();
        expect(entityVm.on).toBeDefined();
        expect(entityVm.off).toBeDefined();
        expect(entityVm.isChecked).toBeFalsy();
        expect(entityVm.isDisabled).toBeFalsy();
        expect(entityVm.isValid()).toBeTruthy();
    });

    describe("Feature: Management of EntityViewModel", () => {
        describe("WHEN I try to cancel the modifications made on an Entity", () => {
            it("THEN copySource method is called", () => {
                let entityVm = new ap.viewmodels.EntityViewModel(Utility);
                spyOn(entityVm, "copySource");
                entityVm.cancel();
                expect(entityVm.copySource).toHaveBeenCalled();
            });
        });

        describe("WHEN I check isDataOk on a new Entity", () => {
            it("THEN computeDataIsDataOk method is called", () => {
                let entityVm = new ap.viewmodels.EntityViewModel( Utility);
                spyOn(entityVm, "computeIsDataOk");
                entityVm.computeIsDataOk();
                expect(entityVm.computeIsDataOk).toHaveBeenCalled();
            });
            it("THEN isDataOk is TRUE", () => {
                let entityVm = new ap.viewmodels.EntityViewModel( Utility);
                entityVm.computeIsDataOk();
                expect(entityVm.isDataOk).toBeTruthy();
            });
        });

        describe("WHEN I create an EntityViewWModel and init an original entity", () => {
            it("THEN EntityViewModel is created and the originalEntity has the good value", () => {
                let entity = <ap.models.Entity>{ Id: "5652" };
                let entityVm = new ap.viewmodels.EntityViewModel(Utility);
                entityVm.init(entity);
                expect(entityVm.originalEntity).toBe(entity);
            });
        });

        describe("WHEN I create an EntityViewWModel and init an original entity AND an parent entity", () => {
            it("THEN EntityViewModel is created and the originalEntity AND parent entity have the good value", () => {
                let originalEntity = <ap.models.Entity>{ Id: "5652" };
                let parentEntity = <ap.models.Entity>{ Id: "5654" };
                let entityVm = new ap.viewmodels.EntityViewModel(Utility);
                entityVm.init(originalEntity, parentEntity);
                expect(entityVm.originalEntity).toBe(originalEntity);
                expect(entityVm.parentEntity).toBe(parentEntity);
            });
        });

        describe("WHEN isSelected is called", () => {
            it("THEN isSelected takes the new value", () => {
                let entityVm = new ap.viewmodels.EntityViewModel(Utility);

                expect(entityVm.isSelected).toBeFalsy();

                entityVm.isSelected = true;

                expect(entityVm.isSelected).toBeTruthy();

                entityVm.isSelected = false;

                expect(entityVm.isSelected).toBeFalsy();
            });
        });

        describe("WHEN isChecked is called", () => {
            it("THEN isChecked takes the new value", () => {
                let entityVm = new ap.viewmodels.EntityViewModel(Utility);

                expect(entityVm.isChecked).toBeFalsy();

                entityVm.isChecked = true;

                expect(entityVm.isChecked).toBeTruthy();

                entityVm.isChecked = false;

                expect(entityVm.isChecked).toBeFalsy();
            });
        });

        describe("WHEN hasChanged is called", () => {
            let entityVm: ap.viewmodels.EntityViewModel;
            let originalEntity: ap.models.projects.IssueType;
            beforeEach(() => {
                entityVm = new ap.viewmodels.EntityViewModel(Utility);
    });
            describe("WHEN the originalEntity.isNew = true", () => {
                beforeEach(() => {
                    originalEntity = new ap.models.projects.IssueType(Utility);
                    entityVm.init(originalEntity);
                });
                it("THEN hasChanged return true", () => {
                    expect(entityVm.hasChanged).toBeTruthy();
                });
            });
            describe("WHEN the originalEntity.isNew = false", () => {
                beforeEach(() => {
                    originalEntity = new ap.models.projects.IssueType(Utility);
                    originalEntity.createByJson({Code: "aaa"});
                    entityVm.init(originalEntity);
                });
                it("THEN hasChanged return false", () => {
                    expect(entityVm.hasChanged).toBeFalsy();
                });
            });
        });
    });
    describe("Feature: getIdList method", () => {
        let result: string[];
        describe("WHEN getIdList was called with empty entitiesVm", () => {
            it("THEN, return the empty list", () => {
                result = ap.viewmodels.EntityViewModel.getIdList(null);
                expect(result).toBeDefined();
                expect(result.length).toEqual(0);
            });
        });
        describe("WHEN getIdList was called with defined entitiesVm", () => {
            let entitiesVm: ap.viewmodels.IEntityViewModel[] = [];

            beforeEach(() => {
                let entity1 = <ap.models.Entity>{ Id: "1" };
                let entityVm1 = new ap.viewmodels.EntityViewModel(Utility);
                entityVm1.init(entity1);

                entitiesVm.push(entityVm1);

                let entity2 = <ap.models.Entity>{ Id: "2" };
                let entityVm2 = new ap.viewmodels.EntityViewModel(Utility);
                entityVm2.init(entity2);

                entitiesVm.push(entityVm2);

                let entityVm3 = new ap.viewmodels.EntityViewModel(Utility);

                entitiesVm.push(entityVm3);

            });
            it("THEN, return the list of originalEntity.Id of the entitiesVm", () => {
                result = ap.viewmodels.EntityItemViewModel.getIdList(entitiesVm);
                expect(result.length).toEqual(2);
                expect(result[0]).toEqual("1");
                expect(result[1]).toEqual("2");    
            });
        });
    });
    describe("Feature: isValid method", () => {
        describe("WHEN isValid is called", () => {
            it("THEN, return true", () => {
                let entityVm = new ap.viewmodels.EntityViewModel(Utility);
                expect(entityVm.isValid()).toBeTruthy();
            });
        });
    });
    describe("Feature: raisePropertyChanged", () => {
        let entityVm: TestEntityViewModel;
        let listener: (args?: any) => void;

        beforeEach(() => {
            entityVm = new TestEntityViewModel(Utility);
            listener = jasmine.createSpy("eventListener");
            entityVm.on("propertychanged", listener, null);
        });

        describe("WHEN the raisePropertyChanged method is called", () => {
            beforeEach(() => {
                entityVm.raisePropertyChanged("propertyName", "oldValue", entityVm);
            });

            it("the propertychanged event should be called", () => {
                expect(listener).toHaveBeenCalled();
            });
        });
    });
});