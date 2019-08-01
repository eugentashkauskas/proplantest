'use strict';
describe("Module ap-viewmodels - CodeEntityViewModel", () => {
    let $rootScope: angular.IRootScopeService, $scope: angular.IScope;
    let Utility: ap.utility.UtilityHelper, UserContext: ap.utility.UserContext;
    let vm: ap.viewmodels.CodeEntityViewModel;
    let $q: angular.IQService;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });
    beforeEach(inject(function (_$rootScope_, _UserContext_, _Utility_, _$q_) {
        Utility = _Utility_;
        UserContext = _UserContext_;
        $rootScope = _$rootScope_;
        $q = _$q_;
        $scope = $rootScope.$new();
        specHelper.utility.stubRootUrl(Utility);
        specHelper.userContext.stub(Utility);
        specHelper.utility.stubStorageSet(Utility);
    }));

    describe("Constructor", () => {
        describe("WHEN CodeEntityViewModel is created", () => {
            it("THEN, the properties are filled with the default values", () => {
                vm = new ap.viewmodels.CodeEntityViewModel(Utility);
                expect(vm.code).toBe("");
                expect(vm.description).toBe("");
                expect(vm.fullName).toBe("");
            });
        });

        describe("WHEN the fullName is built from code = undefined and  description = undefined", () => {
            it("THEN, the fullName is empty", () => {
                vm = new ap.viewmodels.CodeEntityViewModel(Utility);
                vm.code = undefined;
                vm.description = undefined;
                vm.copySource();
                expect(vm.fullName).toBe("");
            });
        });
        describe("WHEN the fullName is built from code = undefined and  description = null", () => {
            it("THEN, the fullName is empty", () => {
                vm = new ap.viewmodels.CodeEntityViewModel(Utility);
                vm.code = undefined;
                vm.description = null;
                vm.copySource();
                expect(vm.fullName).toBe("");
            });
        });
        describe("WHEN the fullName is built from code = undefined and  description = empty", () => {
            it("THEN, the fullName is empty", () => {
                vm = new ap.viewmodels.CodeEntityViewModel(Utility);
                vm.code = undefined;
                vm.description = "";
                vm.copySource();
                expect(vm.fullName).toBe("");
            });
        });
        describe("WHEN the fullName is built from code = undefined and  description = 'EntityDescription'", () => {
            it("THEN, the fullName = 'EntityDescription'", () => {
                vm = new ap.viewmodels.CodeEntityViewModel(Utility);
                vm.code = undefined;
                vm.description = "EntityDescription";
                vm.copySource();
                expect(vm.fullName).toBe("EntityDescription");
            });
        });
        describe("WHEN the fullName is built from code = null and  description = undefined", () => {
            it("THEN, the fullName is empty", () => {
                vm = new ap.viewmodels.CodeEntityViewModel(Utility);
                vm.code = null;
                vm.description = undefined;
                vm.copySource();
                expect(vm.fullName).toBe("");
            });
        });
        describe("WHEN the fullName is built from code = null and  description = null", () => {
            it("THEN, the fullName is empty", () => {
                vm = new ap.viewmodels.CodeEntityViewModel(Utility);
                vm.code = null;
                vm.description = null;
                vm.copySource();
                expect(vm.fullName).toBe("");
            });
        });
        describe("WHEN the fullName is built from code = null and  description = empty", () => {
            it("THEN, the fullName is empty", () => {
                vm = new ap.viewmodels.CodeEntityViewModel(Utility);
                vm.code = null;
                vm.description = "";
                vm.copySource();
                expect(vm.fullName).toBe("");
            });
        });
        describe("WHEN the fullName is built from code = null and  description = 'EntityDescription'", () => {
            it("THEN, the fullName ='EntityDescription'", () => {
                vm = new ap.viewmodels.CodeEntityViewModel(Utility);
                vm.code = null;
                vm.description = "EntityDescription";
                vm.copySource();
                expect(vm.fullName).toBe("EntityDescription");
            });
        });

        describe("WHEN the fullName is built from code = empty and  description = undefined", () => {
            it("THEN, the fullName is empty", () => {
                vm = new ap.viewmodels.CodeEntityViewModel(Utility);
                vm.code = "";
                vm.description = undefined;
                vm.copySource();
                expect(vm.fullName).toBe("");
            });
        });

        describe("WHEN the fullName is built from code = empty and  description = null", () => {
            it("THEN, the fullName is empty", () => {
                vm = new ap.viewmodels.CodeEntityViewModel(Utility);
                vm.code = "";
                vm.description = null;
                vm.copySource();
                expect(vm.fullName).toBe("");
            });
        });

        describe("WHEN the fullName is built from code = empty and  description = empty", () => {
            it("THEN, the fullName is empty", () => {
                vm = new ap.viewmodels.CodeEntityViewModel(Utility);
                vm.code = "";
                vm.description = "";
                vm.copySource();
                expect(vm.fullName).toBe("");
            });
        });

        describe("WHEN the fullName is built from code = empty and  description = 'EntityDescription'", () => {
            it("THEN, the fullName ='EntityDescription'", () => {
                vm = new ap.viewmodels.CodeEntityViewModel(Utility);
                vm.code = "";
                vm.description = "EntityDescription";
                vm.copySource();
                expect(vm.fullName).toBe("EntityDescription");
            });
        });

        describe("WHEN the fullName is built from code = 'EntityCode' and  description = undefined", () => {
            it("THEN, the fullName ='EntityCode'", () => {
                vm = new ap.viewmodels.CodeEntityViewModel(Utility);

                vm.code = "EntityCode";
                vm.description = undefined;
                vm.copySource();
                expect(vm.fullName).toBe("[EntityCode]");
            });
        });

        describe("WHEN the fullName is built from code = 'EntityCode' and  description = null", () => {
            it("THEN, the fullName ='EntityCode'", () => {
                vm = new ap.viewmodels.CodeEntityViewModel(Utility);
                vm.code = "EntityCode";
                vm.description = null;
                vm.copySource();
                expect(vm.fullName).toBe("[EntityCode]");
            });
        });

        describe("WHEN the fullName is built from code = 'EntityCode' and  description = empty", () => {
            it("THEN, the fullName ='EntityCode'", () => {
                vm = new ap.viewmodels.CodeEntityViewModel(Utility);
                vm.code = "EntityCode";
                vm.description = "";
                vm.copySource();
                expect(vm.fullName).toBe("[EntityCode]");
            });
        });

        describe("WHEN the fullName is built from code = 'EntityCode' and  description = 'EntityDescription'", () => {
            it("THEN, the fullName ='EntityCode'", () => {
                vm = new ap.viewmodels.CodeEntityViewModel(Utility);
                vm.code = "EntityCode";
                vm.description = "EntityDescription";
                vm.copySource();
                expect(vm.fullName).toEqual("[EntityCode] EntityDescription");
            });
        });
    });

    describe("Feature: Initialization", () => {
        describe("WHEN the view model is initialized with an entity containing a property code and description", () => {
            let entityCode: any;
            beforeEach(() => {
                vm = new ap.viewmodels.CodeEntityViewModel(Utility);
                entityCode = {
                    Code: "My code",
                    Description: "The description"
                }
                modelSpecHelper.fillEntityJson(entityCode);
            });
            it("THEN, the view model.code and description will contains these values", () => {
                vm.init(entityCode);
                expect(vm.code).toBe("My code");
                expect(vm.description).toBe("The description");
            });
        });
    });
    describe("Feature: PostChanges", () => {
        describe("WHEN the view model is initialized with an entity containing a property code and description AND these vm's properties changed AND postChanges is called", () => {
            let entityCode: any;
            beforeEach(() => {
                vm = new ap.viewmodels.CodeEntityViewModel(Utility);
                entityCode = {
                    Code: "My code",
                    Description: "The description"
                }
                modelSpecHelper.fillEntityJson(entityCode);
            });
            it("THEN, the orginalEntitys takes new values", () => {
                vm.init(entityCode);
                vm.code = "new code";
                vm.description = "new desc";
                vm.postChanges();

                expect(entityCode.Code).toBe("new code");
                expect(entityCode.Description).toBe("new desc");
            });
        });
    });

    describe("Feature: 'codechanged' event", () => {
        describe("WHEN the code of the vm changed", () => {
            let entityCode: any;
            beforeEach(() => {
                vm = new ap.viewmodels.CodeEntityViewModel(Utility);
                entityCode = {
                    Code: "My code",
                    Description: "The description"
                }
                modelSpecHelper.fillEntityJson(entityCode);
                vm.init(entityCode);
            });
            it("THEN, the 'codechanged' event will be fire", () => {
                let callback = jasmine.createSpy("callback");
                vm.on("propertychanged", function () { callback(); }, this);
                vm.code = "new code";
                expect(callback).toHaveBeenCalled();
            });
        });
    });

    xdescribe("Feature: checkIsValid", () => {

        
        class TestCodeEntityViewModel extends ap.viewmodels.CodeEntityViewModel {
                        
            public checkIsValid() {
                this.checkIsValid();
            }
        }

        let entityCode: any;
        beforeEach(() => {
            vm = new TestCodeEntityViewModel(Utility);
            spyOn(<TestCodeEntityViewModel>vm, "checkIsValid").and.callThrough();
            entityCode = {
                Code: "My code",
                Description: "The description"
            }
            modelSpecHelper.fillEntityJson(entityCode);
            vm.init(entityCode);
        });
        describe("WHEN the code of the vm changed", () => {
            it("THEN, checkIsValid must called if property changed", () => {
                vm.code = "My new code";
                expect((<TestCodeEntityViewModel>vm).checkIsValid).toHaveBeenCalled();
            });
        });

        describe("WHEN the description of the vm changed", () => {
            it("THEN, checkIsValid must called if property changed", () => {
                vm.description = "My new description";
                expect((<TestCodeEntityViewModel>vm).checkIsValid).toHaveBeenCalled();
            });
        });

        describe("WHEN the code and description of the vm have correct values", () => {
            it("THEN, isValid is true", () => {
                expect(vm.isValid()).toBeTruthy();
            });
        });

        describe("WHEN the code of the vm is empty", () => {
            it("THEN, isValid is false", () => {
                vm.code = "";
                expect(vm.isValid()).toBeFalsy();
            });
        });

        describe("WHEN the code of the vm is null", () => {
            it("THEN, isValid is false", () => {
                vm.code = null;
                expect(vm.isValid()).toBeFalsy();
            });
        });
        describe("WHEN the description of the vm is empty", () => {
            it("THEN, isValid is false", () => {
                vm.description = "";
                expect(vm.isValid()).toBeFalsy();
            });
        });

        describe("WHEN the description of the vm is null", () => {
            it("THEN, isValid is false", () => {
                vm.description = null;
                expect(vm.isValid()).toBeFalsy();
            });
        });
    });

    describe("Feature set code", () => {
        let args: ap.viewmodels.base.PropertyChangedEventArgs;
        let callbackPropretyChanged;
        beforeEach(() => {
            vm = new ap.viewmodels.projects.ParentCellViewModel(Utility);
            callbackPropretyChanged = jasmine.createSpy("callback");
            args = new ap.viewmodels.base.PropertyChangedEventArgs("code", "", vm);
            vm.on("propertychanged", callbackPropretyChanged, this);
            vm.code = "123";
        });
        it("THEN, displayOrder = newValue", () => {
            expect(vm.code).toEqual("123");
        });
        it("THEN, raisePropertyChanged is called", () => {
            expect(callbackPropretyChanged).toHaveBeenCalled();
        });
    });

    describe("Feature set description", () => {
        let args: ap.viewmodels.base.PropertyChangedEventArgs;
        let callbackPropretyChanged;
        beforeEach(() => {
            vm = new ap.viewmodels.projects.ParentCellViewModel(Utility);
            callbackPropretyChanged = jasmine.createSpy("callback");
            args = new ap.viewmodels.base.PropertyChangedEventArgs("displayOrder", "", vm);
            vm.on("propertychanged", callbackPropretyChanged, this);
            vm.description = "My description";
        });
        it("THEN, displayOrder = newValue", () => {
            expect(vm.description).toEqual("My description");
        });
        it("THEN, raisePropertyChanged is called", () => {
            expect(callbackPropretyChanged).toHaveBeenCalled();
        });
    });
});