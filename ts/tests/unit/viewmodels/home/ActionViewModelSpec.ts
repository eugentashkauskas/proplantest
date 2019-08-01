"use strict";
describe("ActionViewModel specification", () => {
    let eventHelper: ap.utility.EventHelper, Utility: ap.utility.UtilityHelper;

    
    beforeEach(angular.mock.module("ap-viewmodels"));

    beforeEach(inject(function (_Utility_, _EventHelper_) {
        jasmine.addCustomEqualityTester(specHelper.customEquality);
        eventHelper = _EventHelper_;
        Utility = _Utility_;

        spyOn(Utility.Translator, "getTranslation").and.callFake(function (key) {
            return "$" + key;
        });
    }));
    describe("Feature constructor", () => {
        describe("WHEN I create ActionViewModel", () => {
            let shortcut: ap.misc.Shortcut;

            beforeEach(() => {
                shortcut = new ap.misc.Shortcut("e", [ap.misc.SpecialKeys.altKey]);
            });

            it("THEN, properties contains good value 'default'", () => {
                let actionVm = new ap.viewmodels.home.ActionViewModel(Utility, eventHelper, "myaction");

                expect(actionVm.name).toBe("myaction");
                expect(actionVm.iconSrc).toBe("");
                expect(actionVm.isEnabled).toBeFalsy();
                expect(actionVm.isFileDialogRequest).toBeFalsy();
                expect(actionVm.isVisible).toBeFalsy();
                expect(actionVm.hasSubActions).toBeFalsy();
                expect(actionVm.subActions).toEqual([]);
                expect(actionVm.shortcut).toBe(null);
            });
            it("THEN, properties contains good value - name", () => {
                let actionVm = new ap.viewmodels.home.ActionViewModel(Utility, eventHelper, "myaction", "/actions/myaction.svg", true);
                expect(actionVm.name).toBe("myaction");
            });
            it("THEN, properties contains good value - iconSrc", () => {
                let actionVm = new ap.viewmodels.home.ActionViewModel(Utility, eventHelper, "myaction", "/actions/myaction.svg", true);
                expect(actionVm.iconSrc).toBe("/actions/myaction.svg");
            });
            it("THEN, properties contains good value - isEnabled", () => {
                let actionVm = new ap.viewmodels.home.ActionViewModel(Utility, eventHelper, "myaction", "/actions/myaction.svg", false, null, undefined, true);
                expect(actionVm.isEnabled).toBeTruthy();
            });
            it("THEN, properties contains good value - isFileDialogRequest", () => {
                let actionVm = new ap.viewmodels.home.ActionViewModel(Utility, eventHelper, "myaction", "/actions/myaction.svg", true, null, undefined, false, true);
                expect(actionVm.isFileDialogRequest).toBeTruthy();
            });
            it("THEN, properties contains good value - isVisible", () => {
                let actionVm = new ap.viewmodels.home.ActionViewModel(Utility, eventHelper, "myaction", "/actions/myaction.svg", true);
                expect(actionVm.isVisible).toBeTruthy();
            });
            it("THEN, properties contains good value - subActions", () => {
                let actionVm = new ap.viewmodels.home.ActionViewModel(Utility, eventHelper, "myaction", "/actions/myaction.svg", true);

                expect(actionVm.hasSubActions).toBeFalsy();
                expect(actionVm.subActions).toEqual([]);
            });
            it("THEN, properties contains good value - translationKey", () => {
                let actionVm = new ap.viewmodels.home.ActionViewModel(Utility, eventHelper, "myaction", "/actions/myaction.svg", true, null, "mytransl-key");
                expect(actionVm.translationKey).toBe("$mytransl-key");
            });
            it("THEN, properties contains good value - title", () => {
                let actionVm = new ap.viewmodels.home.ActionViewModel(Utility, eventHelper, "myaction", "/actions/myaction.svg", true, null, "mytransl-key");
                expect(actionVm.title).toBe("$mytransl-key");
            });
            it("THEN, properties contains good value - shortcut", () => {
                let actionVm = new ap.viewmodels.home.ActionViewModel(Utility, eventHelper, "myaction", "/actions/myaction.svg", true, null, "mytransl-key", false, null, shortcut);
                expect(actionVm.shortcut).toEqual(shortcut);
            });
        }); 

        describe("WHEN I create ActionViewModel with subactions", () => {
            let subActions: ap.viewmodels.home.SubActionViewModel[];
            let actionVm: ap.viewmodels.home.ActionViewModel;
            beforeEach(() => {
                subActions = [new ap.viewmodels.home.SubActionViewModel(Utility, eventHelper, "mysubaction", "", true, false)];
                actionVm = new ap.viewmodels.home.ActionViewModel(Utility, eventHelper, "myaction", "/actions/myaction.svg", true, subActions);
            });
            it("THEN, properties contains good values with subactions items AND subactions items returned are a copy", () => {

                let subs = actionVm.subActions;
                expect(subs).toEqual(subActions);

                subs.push(new ap.viewmodels.home.SubActionViewModel(Utility, eventHelper, "mysubaction2", "", true, false));
                expect(subs).not.toEqual(subActions);
            });
        }); 

        describe("WHEN I create ActionViewModel with several subactions having isselected = true", () => {
            it("THEN, keep the first one like selected only", () => {

                let subActions = [new ap.viewmodels.home.SubActionViewModel(Utility, eventHelper, "mysubaction", "", true, true, true),
                    new ap.viewmodels.home.SubActionViewModel(Utility, eventHelper, "mysubaction2", "", true, true, true)];
                let actionVm = new ap.viewmodels.home.ActionViewModel(Utility, eventHelper, "myaction", "/actions/myaction.svg", true, subActions);

                let subs = actionVm.subActions;
                expect(subs).toEqual(subActions);
                expect(subs[0].isSelected).toBeTruthy();
                expect(subs[1].isSelected).toBeFalsy();
                
            });
        });
        describe("WHEN I create ActionViewModel with several subactions having isSelectable = false", () => {
            let actionVm: ap.viewmodels.home.ActionViewModel;
            beforeEach(() => {
                actionVm = new ap.viewmodels.home.ActionViewModel(Utility, eventHelper, "testaction", "", true, [
                    new ap.viewmodels.home.SubActionViewModel(Utility, eventHelper, "testSubAction", "", true, false, false)
                ], null);
            });
            it("THEN, subactions' isSelectable property is initialized", () => {
                expect(actionVm.subActions.length).toEqual(1);
                expect(actionVm.subActions[0].isSelectable).toBeFalsy();
            });
        });
    });

    describe("Feature: addSubActions", () => {
        describe("WHEN addSubActions is called with a subaction", () => {
            it("THEN, this subaction is added to the collection of subactions AND subactionadded event is raised with new subactions", () => {
                let callback = jasmine.createSpy("callback");

                let existingSubs = [new ap.viewmodels.home.SubActionViewModel(Utility, eventHelper, "mysub", "exiconsrc", true, false)];
                let actionVm = new ap.viewmodels.home.ActionViewModel(Utility, eventHelper, "myaction", "/actions/myaction.svg", true, existingSubs);

                actionVm.on("subactionadded", callback, this);

                let newSub = new ap.viewmodels.home.SubActionViewModel(Utility, eventHelper, "mynewsub", "iconsrc", true, true);
                actionVm.addSubActions(newSub);

                expect(actionVm.subActions).toEqual(existingSubs.concat([newSub]));
                expect(callback).toHaveBeenCalledWith([newSub]);
            });
        });

        describe("WHEN addSubActions is called with an array subaction", () => {
            it("THEN, this array of subactions is added to the collection of subactions AND subactionadded event is raised with new subactions", () => {
                let callback = jasmine.createSpy("callback");
                let existingSubs = [new ap.viewmodels.home.SubActionViewModel(Utility, eventHelper, "mysub", "exiconsrc", true, false)];
                let actionVm = new ap.viewmodels.home.ActionViewModel(Utility, eventHelper, "myaction", "/actions/myaction.svg", true, existingSubs);

                actionVm.on("subactionadded", callback, this);

                let newSubs = [new ap.viewmodels.home.SubActionViewModel(Utility, eventHelper, "mynewsub", "iconsrc", true, true),
                    new ap.viewmodels.home.SubActionViewModel(Utility, eventHelper, "mynewsub2", "iconsrc2", true)];
                actionVm.addSubActions(newSubs);

                expect(actionVm.subActions).toEqual(existingSubs.concat(newSubs));
                expect(callback).toHaveBeenCalledWith(newSubs);
            });
        });
        describe("WHEN addSubActions is called with an properties of subaction", () => {
            it("THEN, this the subactions is created and added to the collection of subactions AND subactionadded event is raised with new subaction", () => {
                let callback = jasmine.createSpy("callback");
                let existingSubs = [new ap.viewmodels.home.SubActionViewModel(Utility, eventHelper, "mysub", "exiconsrc", true, false)];
                let actionVm = new ap.viewmodels.home.ActionViewModel(Utility, eventHelper, "myaction", "/actions/myaction.svg", true, existingSubs);

                actionVm.on("subactionadded", callback, this);

                let newSub = new ap.viewmodels.home.SubActionViewModel(Utility, eventHelper, "mynewsub", "iconsrc", true, true);
                actionVm.addSubActions("mynewsub", "iconsrc", true, true, true);

                expect(actionVm.subActions).toEqual(existingSubs.concat(newSub));
                expect(callback).toHaveBeenCalledWith([newSub]);
            });
        });

        describe("WHEN addSubActions is called with actions isSelected = true but there already some actions selected", () => {
            it("THEN, new actions isSelected are set to false", () => {
                let existingSubs = [new ap.viewmodels.home.SubActionViewModel(Utility, eventHelper, "mysub", "exiconsrc", true, true, true)];
                let actionVm = new ap.viewmodels.home.ActionViewModel(Utility, eventHelper, "myaction", "/actions/myaction.svg", true, existingSubs);

                let newSubs = [new ap.viewmodels.home.SubActionViewModel(Utility, eventHelper, "mynewsub", "iconsrc", true, true, true),
                    new ap.viewmodels.home.SubActionViewModel(Utility, eventHelper, "mynewsub2", "iconsrc2", true)];
                actionVm.addSubActions(newSubs); 
                
                expect(actionVm.subActions[0].isSelected).toBeTruthy();
                expect(actionVm.subActions[1].isSelected).toBeFalsy();
                expect(actionVm.subActions[2].isSelected).toBeFalsy();

            });
        });
        describe("WHEN call addSubActions with isSelectable = false", () => {
            it("THEN, a new sup-action added to the array", () => {
                let existingSubs = [new ap.viewmodels.home.SubActionViewModel(Utility, eventHelper, "mysub", "exiconsrc", true, false)];
                let actionVm = new ap.viewmodels.home.ActionViewModel(Utility, eventHelper, "myaction", "/actions/myaction.svg", true, existingSubs);
                let testSubAction = new ap.viewmodels.home.SubActionViewModel(Utility, eventHelper, "testsub", "testIconSrc", true, false);
                actionVm.addSubActions(testSubAction);
                expect(actionVm.subActions.length).toEqual(2);
                expect(actionVm.subActions[0].isSelectable).toBeFalsy();
                expect(actionVm.subActions[1].isSelectable).toBeFalsy();
            });
        })
    });
    describe("Feature: only one selected", () => {
        describe("WHEN there is one selected subaction in the actions list and we put another one to true", () => {
            it("THEN, the old one must be put to false", () => {
                let existingSubs = [new ap.viewmodels.home.SubActionViewModel(Utility, eventHelper, "mynewsub", "iconsrc", true, true),
                    new ap.viewmodels.home.SubActionViewModel(Utility, eventHelper, "mynewsub2", "iconsrc2", true)];

                let actionVm = new ap.viewmodels.home.ActionViewModel(Utility, eventHelper, "myaction", "/actions/myaction.svg", true, existingSubs);

                actionVm.subActions[1].isSelected = true;


                expect(actionVm.subActions[0].isSelected).toBeFalsy();
                expect(actionVm.subActions[1].isSelected).toBeTruthy();
            });
        });
    });

    describe("Feature: clear subactions", () => {
        describe("WHEN clear subactions is called.", () => {
            it("THEN, subactions is cleared and nothing changes anymore when old subaction.isselected changes", () => {
                let existingSubs = [new ap.viewmodels.home.SubActionViewModel(Utility, eventHelper, "mynewsub", "iconsrc", true, true, true),
                    new ap.viewmodels.home.SubActionViewModel(Utility, eventHelper, "mynewsub2", "iconsrc2", true)];

                let actionVm = new ap.viewmodels.home.ActionViewModel(Utility, eventHelper, "myaction", "/actions/myaction.svg", true, existingSubs);

                actionVm.clearSubActions();
                existingSubs[1].isSelected = true;

                expect(actionVm.subActions.length).toBe(0);
                expect(existingSubs[0].isSelected).toBeTruthy();
                expect(existingSubs[1].isSelected).toBeTruthy();
            });
        });
    });

    describe("Feature: only one selected", () => {
        describe("WHEN there is one selected subaction in the actions list and we put another one to true", () => {
            it("THEN, the old one must be put to false", () => {
                let existingSubs = [new ap.viewmodels.home.SubActionViewModel(Utility, eventHelper, "mynewsub", "iconsrc", true, true),
                    new ap.viewmodels.home.SubActionViewModel(Utility, eventHelper, "mynewsub2", "iconsrc2", true)];

                let actionVm = new ap.viewmodels.home.ActionViewModel(Utility, eventHelper, "myaction", "/actions/myaction.svg", true, existingSubs);

                actionVm.subActions[1].isSelected = true;


                expect(actionVm.subActions[0].isSelected).toBeFalsy();
                expect(actionVm.subActions[1].isSelected).toBeTruthy();
            });
        });
    });

    describe("Feature: hasSubAction", () => {
        describe("WHEN hasSubAction is called with a name of an existing subaction of the actionvm.", () => {
            it("THEN, true is returned", () => {
                let existingSubs = [new ap.viewmodels.home.SubActionViewModel(Utility, eventHelper, "mynewsub", "iconsrc", true, true),
                    new ap.viewmodels.home.SubActionViewModel(Utility, eventHelper, "mynewsub2", "iconsrc2", true)];

                let actionVm = new ap.viewmodels.home.ActionViewModel(Utility, eventHelper, "myaction", "/actions/myaction.svg", true, existingSubs);                
                expect(actionVm.hasSubAction("mynewsub2")).toBeTruthy();
            });
        });
        describe("WHEN hasSubAction is called with a name of a NOT existing subaction of the actionvm.", () => {
            it("THEN, false is returned", () => {
                let existingSubs = [new ap.viewmodels.home.SubActionViewModel(Utility, eventHelper, "mynewsub", "iconsrc", true, true),
                    new ap.viewmodels.home.SubActionViewModel(Utility, eventHelper, "mynewsub2", "iconsrc2", true)];

                let actionVm = new ap.viewmodels.home.ActionViewModel(Utility, eventHelper, "myaction", "/actions/myaction.svg", true, existingSubs);
                expect(actionVm.hasSubAction("mynewsub52")).toBeFalsy();
            });
        });
    });

    describe("Feature: hasVisibleActions", () => {
        let actions: ap.viewmodels.home.ActionViewModel[]
        beforeEach(() => {
            actions = [
                new ap.viewmodels.home.ActionViewModel(Utility, eventHelper, undefined, undefined, false),
                new ap.viewmodels.home.ActionViewModel(Utility, eventHelper, undefined, undefined, false),
                new ap.viewmodels.home.ActionViewModel(Utility, eventHelper, undefined, undefined, false)
            ]
        });

        describe("WHEN at least one action visible", () => {
            beforeEach(() => {
                actions[1].isVisible = true;
            });
            it("THEN, the property returns true", () => {
                expect(ap.viewmodels.home.ActionViewModel.hasVisibleActions(actions)).toBeTruthy();
            });
        });

        describe("WHEN all actions are not visible", () => {            
            it("THEN, the property returns false", () => {
                expect(ap.viewmodels.home.ActionViewModel.hasVisibleActions(actions)).toBeFalsy();
            });
        });
    }); 

    describe("Feature: getSubAction", () => {
        describe("WHEN hasSubAction is called with a name of an existing subaction of the actionvm.", () => {
            it("THEN, the corresponding subaction is returned", () => {
                let existingSubs = [new ap.viewmodels.home.SubActionViewModel(Utility, eventHelper, "mynewsub", "iconsrc", true, true),
                    new ap.viewmodels.home.SubActionViewModel(Utility, eventHelper, "mynewsub2", "iconsrc2", true)];

                let actionVm = new ap.viewmodels.home.ActionViewModel(Utility, eventHelper, "myaction", "/actions/myaction.svg", true, existingSubs);
                expect(actionVm.getSubAction("mynewsub2").name).toBe("mynewsub2");
            });
        });
        describe("WHEN hasSubAction is called with a name of a NOT existing subaction of the actionvm.", () => {
            it("THEN, null is returned", () => {
                let existingSubs = [new ap.viewmodels.home.SubActionViewModel(Utility, eventHelper, "mynewsub", "iconsrc", true, true),
                    new ap.viewmodels.home.SubActionViewModel(Utility, eventHelper, "mynewsub2", "iconsrc2", true)];

                let actionVm = new ap.viewmodels.home.ActionViewModel(Utility, eventHelper, "myaction", "/actions/myaction.svg", true, existingSubs);
                expect(actionVm.getSubAction("mynewsub52")).toBeNull();
            });
        });
    });
    describe("Feature: hasActionName", () => {
        let actions: ap.viewmodels.home.ActionViewModel[];
        beforeEach(() => {
            actions = [
                new ap.viewmodels.home.ActionViewModel(Utility, eventHelper, "download", null, true, [
                    new ap.viewmodels.home.SubActionViewModel(Utility, eventHelper, "download.sub1")
                ]),
                new ap.viewmodels.home.ActionViewModel(Utility, eventHelper, "push"),
                new ap.viewmodels.home.ActionViewModel(Utility, eventHelper, "pull")
            ]
        });
        describe("WHEN I call hasActionName with a list of actions AND the actionName is one of mainAction", () => {
            it("THEN, true is returned", () => {
                expect(ap.viewmodels.home.ActionViewModel.hasActionName(actions, "push")).toBeTruthy();
            });
        });
        describe("WHEN I call hasActionName with a list of actions AND the actionName is one of subAction", () => {
            it("THEN, true is returned", () => {
                expect(ap.viewmodels.home.ActionViewModel.hasActionName(actions, "download.sub1")).toBeTruthy();
            });
        });
        describe("WHEN I call hasActionName with a list of actions AND the actionName doesn't exists like main or sub actions", () => {
            it("THEN, false is returned", () => {
                expect(ap.viewmodels.home.ActionViewModel.hasActionName(actions, "download.sub2")).toBeFalsy();
            });
        });
    });
    describe("Feature: getAction", () => {
        let actions: ap.viewmodels.home.ActionViewModel[];
        let subAction: ap.viewmodels.home.SubActionViewModel;
        beforeEach(() => {
            subAction = new ap.viewmodels.home.SubActionViewModel(Utility, eventHelper, "download.sub1");
            actions = [
                new ap.viewmodels.home.ActionViewModel(Utility, eventHelper, "download", null, true, [subAction]),
                new ap.viewmodels.home.ActionViewModel(Utility, eventHelper, "push"),
                new ap.viewmodels.home.ActionViewModel(Utility, eventHelper, "pull")
            ]
        });
        describe("WHEN I call getAction with a list of actions AND the actionName is one of mainAction", () => {
            it("THEN, it returned the corresponding actionVm", () => {
                expect(ap.viewmodels.home.ActionViewModel.getAction(actions, "push")).toBe(actions[1]);
            });
        });
        describe("WHEN I call getAction with a list of actions AND the actionName is one of subAction", () => {
            it("THEN, it returned the corresponding actionVm", () => {
                expect(ap.viewmodels.home.ActionViewModel.getAction(actions, "download.sub1")).toBe(subAction);
            });
        });
        describe("WHEN I call getAction with a list of actions AND the actionName doesn't exists like main or sub actions", () => {
            it("THEN, null is returned", () => {
                expect(ap.viewmodels.home.ActionViewModel.getAction(actions, "download.sub2")).toBeNull();
            });
        });
    });
    describe("Feature: isSubAction", () => {
        describe("WHEN I create SubActionViewModel", () => {
            let subAction: ap.viewmodels.home.SubActionViewModel;
            beforeEach(() => {
                subAction = new ap.viewmodels.home.SubActionViewModel(Utility, eventHelper, "mysubaction", "", true, false);
            });
            it("THEN, isSubAction is true", () => {
                expect(subAction.isSubAction).toBeTruthy();
            });
        });
        describe("WHEN I create ActionViewModel", () => {
            let action: ap.viewmodels.home.ActionViewModel;
            beforeEach(() => {
                action = new ap.viewmodels.home.ActionViewModel(Utility, eventHelper, "push");
            });
            it("THEN, isSubAction is false", () => {
                expect(action.isSubAction).toBeFalsy();
            });
        });
    });
    describe("Feature: actionstatechanged event", () => {
        let action: ap.viewmodels.home.ActionViewModel;
        let actionChangedCallback: jasmine.Spy;
        beforeEach(() => {
            action = new ap.viewmodels.home.ActionViewModel(Utility, eventHelper, "testaction", "", false);
            actionChangedCallback = jasmine.createSpy("actionChangedCallback");
            action.on("actionstatechanged", actionChangedCallback, this);
        });
        afterEach(() => {
            action.off("actionstatechanged", actionChangedCallback, this);
        });
        describe("WHEN we change action's 'isEnabled' property", () => {
            beforeEach(() => {
                action.isEnabled = true;
            });
            it("THEN, actionstatechanged event is called and 'isEnabled' property is changed", () => {
                expect(actionChangedCallback).toHaveBeenCalledWith(new ap.viewmodels.home.ActionStateChangedEvent("testaction", "isEnabled", true));
            });
        });
        describe("WHEN we change action's 'iconSrc' property", () => {
            beforeEach(() => {
                action.iconSrc = "image-src.png";
            });
            it("THEN, actionstatechanged event is called and 'isEnabled' property is changed", () => {
                expect(actionChangedCallback).toHaveBeenCalledWith(new ap.viewmodels.home.ActionStateChangedEvent("testaction", "iconSrc", "image-src.png"));
            });
        });
        describe("WHEN we change action's 'hasOnlySubActions' property", () => {
            beforeEach(() => {
                action.hasOnlySubActions = true;
            });
            it("THEN, actionstatechanged event is called and 'hasOnlySubActions' property is changed", () => {
                expect(actionChangedCallback).toHaveBeenCalledWith(new ap.viewmodels.home.ActionStateChangedEvent("testaction", "hasOnlySubActions", true));
            });
        });
        describe("WHEN we change action's 'isVisible' property", () => {
            beforeEach(() => {
                action.isVisible = true;
            });
            it("THEN, actionstatechanged event is called and 'isVisible' property is changed", () => {
                expect(actionChangedCallback).toHaveBeenCalledWith(new ap.viewmodels.home.ActionStateChangedEvent("testaction", "isVisible", true));
            });
        });
    });
}); 