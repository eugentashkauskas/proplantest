"use strict"

import MultiActionsViewModel = ap.viewmodels.home.MultiActionsViewModel;
describe("MultiActionsViewModel specification", () => {
    let Utility: ap.utility.UtilityHelper;
    let vm: ap.viewmodels.home.MultiActionsViewModel;
    let actions: ap.viewmodels.home.ActionViewModel[];

    beforeEach(angular.mock.module("ap-viewmodels"));
    beforeEach(inject(function (_Utility_) {
        jasmine.addCustomEqualityTester(specHelper.customEquality);
        Utility = _Utility_;
    }));
    beforeEach(() => {
        actions = [
            new ap.viewmodels.home.ActionViewModel(Utility, Utility.EventTool, "Download")
        ];
    });
    describe("Feature constructor", () => {
        describe("WHEN I create a multiActionsViewModel without specifying the number of items and with one actions", () => {
            beforeEach(() => {
                vm = new MultiActionsViewModel(Utility, actions);
            });
            it("then my vm is defined", () => {
                expect(vm).toBeDefined();
            });
            it("THEN, nbItemChecked equals 0", () => {
                expect(vm.itemsChecked.length).toBe(0);
            });
            it("THEN, my actions equals the one of the parameters", () => {
                expect(vm.actions).toBe(actions);
            });
        });
        describe("WHEN I create multiactionViewModel with an empty array, an error is thrown", () => {

            it("THEN, an error is thrown", () => {
                expect(() => {
                    vm = new MultiActionsViewModel(Utility, []);
                }).toThrowError("You cannot define a multiactionsViewModel with no actions");
            });
        });
        describe("WHEN I create multiactionViewModel with actions and items", () => {
            beforeEach(() => {
                vm = new MultiActionsViewModel(Utility, actions, ["1","2","3","4","5"]);
            });
            it("THEN, nbItemChecked equals to the value passed in arg", () => {
                expect(vm.itemsChecked.length).toBe(5);
            });
            it("THEN, my actions equals the one of the parameters", () => {
                expect(vm.actions).toBe(actions);
            });
        });
    });

    describe("Feature: actionClick", () => {
        let callback: jasmine.Spy;
        beforeEach(() => {
            actions = [
                new ap.viewmodels.home.ActionViewModel(Utility, Utility.EventTool, "Download", null, true, null, null, true),
                new ap.viewmodels.home.ActionViewModel(Utility, Utility.EventTool, "Delete", null, true, null, null, true),
            ];

            vm = new MultiActionsViewModel(Utility, actions, ["1", "2"]);

            callback = jasmine.createSpy("callback");
            vm.on("actionClicked", (args) => {
                callback(args);
            }, this);
        });
        describe("WHEN I can actionClick with a action name existing in the list of actions", () => {

            beforeEach(() => {
                vm.actionClick("Download");
            });
            it("THEN, an event is sent with the name of this action", () => {
                expect(callback).toHaveBeenCalledWith("Download");
            });
        });
        describe("WHEN I call the actionClick with action name doesn't exists in the list of actions", () => {
            it("THEN, an error is thrown", () => {
                expect(() => {
                    vm.actionClick("not exist");
                }).toThrowError("The action 'not exist' does not exist");
            });
        });
        describe("WHEN I call the actionClick with action name disabled", () => {
            beforeEach(() => {
                actions[0].isEnabled = false;
            });
            it("THEN, an error is thrown", () => {
                expect(() => {
                    vm.actionClick("Download");
                }).toThrowError("The action 'Download' is disabled");
            });
        });

    });

    describe("Feature: hasVisibleActions", () => {
        beforeEach(() => {
            actions = [
                new ap.viewmodels.home.ActionViewModel(Utility, Utility.EventTool, "Download", null, true, null, null, true),
                new ap.viewmodels.home.ActionViewModel(Utility, Utility.EventTool, "Delete", null, true, null, null, true),
            ];
            vm = new MultiActionsViewModel(Utility, actions, ["1", "2"]);
        });

        it("hasVisibleActions return true when there is one or more isVisible actions", () => {
            expect(vm.hasVisibleActions).toBeTruthy();
        });
        it("hasVisibleActions return false when there is no isVisible action", () => {
            vm.actions[0].isVisible = false;
            vm.actions[1].isVisible = false;
            expect(vm.hasVisibleActions).toBeFalsy();
        });

    });
});
