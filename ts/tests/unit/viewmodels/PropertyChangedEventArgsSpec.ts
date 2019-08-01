'use strict';

describe("Module ap-viewmodels PropertyChangedEventArgs", () => {
    let args: ap.viewmodels.base.PropertyChangedEventArgs;
    
    describe("Feature: accessors", () => {
        beforeEach(() => {
            args = new ap.viewmodels.base.PropertyChangedEventArgs("name", "value", "caller");
        });

        describe("WHEN the propertyName accessor is called", () => {
            it("THEN a name of the changed property is returned", () => {
                expect(args.propertyName).toEqual("name");
            });
        });

        describe("WHEN the oldValue accessor is called", () => {
            it("THEN an old value of the changed property is returned", () => {
                expect(args.oldValue).toEqual("value");
            });
        });

        describe("WHEN the caller accessor is called", () => {
            it("THEN an object which raises the event is returned", () => {
                expect(args.caller).toEqual("caller");
            });
        });
    });
});
