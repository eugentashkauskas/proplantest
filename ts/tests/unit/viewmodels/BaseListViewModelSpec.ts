class TestBaseListViewModel extends ap.viewmodels.BaseListEntityViewModel {
}
describe("Module ap-viewmodel BaseListEntityViewModel - ItemRemovedEvent", () => {
    let Utility: ap.utility.UtilityHelper;
    let itemRemovedEvent: ap.viewmodels.ItemRemovedEvent;
    let entityVm: ap.viewmodels.EntityViewModel;
    beforeEach(() => {
        angular.mock.module("ap-controllers");
    });
    beforeEach(inject(function (_Utility_) {
        Utility = _Utility_;
    }));
    describe("WHEN ItemRemovedEvent is created", () => {
        beforeEach(() => {
            entityVm = new ap.viewmodels.EntityViewModel(Utility);
            itemRemovedEvent = new ap.viewmodels.ItemRemovedEvent(1, entityVm);
        });
        it("THEN index = 1", () => {
            expect(itemRemovedEvent.index).toEqual(1);
        });
        it("THEN item = entityVm", () => {
            expect(itemRemovedEvent.item).toEqual(entityVm);
        });
    });
});

describe("Module ap-viewmodel BaseListEntityViewModel - ListEntitViewModel", () => {

    let Utility: ap.utility.UtilityHelper;

    beforeEach(() => {
        angular.mock.module("ap-controllers");
    });

    beforeEach(inject(function (_Utility_) {

        Utility = _Utility_;
    }));


    it("check default values values of my factory", () => {
        let baseListEntityVm = new TestBaseListViewModel(Utility);

        expect(baseListEntityVm.on).toBeDefined();
        expect(baseListEntityVm.off).toBeDefined();
        expect(baseListEntityVm.sourceItems).toBeDefined();
    });

    describe("Feature: Management of BaseListEntityViewModel", () => {
        describe("WHEN I clear the list", () => {
            it("THEN onLoadItems method should be called", () => {
                let baseListEntityVm = new TestBaseListViewModel(Utility);

                spyOn(baseListEntityVm, "onLoadItems");
                baseListEntityVm.clear();
                expect(baseListEntityVm.onLoadItems).toHaveBeenCalled();
            });

            it("THEN isLoadedChanged is raised with an object containing _isLoaded boolean value", () => {
                let baseListEntityVm = new TestBaseListViewModel(Utility);
                let callbackEvent = jasmine.createSpy("callbackEvent");
                baseListEntityVm.on("isLoadedChanged", function (param) {
                    callbackEvent(param);
                }, this);
                baseListEntityVm.clear();
                expect(callbackEvent).toHaveBeenCalledWith(true);
            });

            it("THEN countChanged is raised with null as argument", () => {
                let baseListEntityVm = new TestBaseListViewModel(Utility);
                let callbackEvent = jasmine.createSpy("callbackEvent");

                baseListEntityVm.on("countChanged", function (param) {
                    callbackEvent(param);
                }, this);

                baseListEntityVm.clear();
                expect(callbackEvent).toHaveBeenCalledWith(null);
            });
        });

        describe("WHEN I select a ViewModel of the list", () => {
            it("THEN selectedItemChanged is raised with the selected ViewModel", () => {
                let baseListEntityVm = new TestBaseListViewModel(Utility);
                let callbackEvent = jasmine.createSpy("callbackEvent");

                let item = <ap.viewmodels.EntityViewModel>{
                    originalEntity: {
                        Id: "1"
                    }
                };
                baseListEntityVm.sourceItems[0] = item;

                baseListEntityVm.on("selectedItemChanged", function (param) {
                    callbackEvent(param);
                }, this);

                baseListEntityVm.selectEntity("1");
                expect(callbackEvent).toHaveBeenCalledWith(item);
            });

            it("THEN the old selected ViewModel.isSelected = false AND new selected ViewModel.isSelected = true", () => {
                let baseListEntityVm = new TestBaseListViewModel(Utility);

                let items = [
                    <ap.viewmodels.EntityViewModel>{
                        originalEntity: {
                            Id: "1"
                        }
                    },
                    <ap.viewmodels.EntityViewModel>{
                        originalEntity: {
                            Id: "2"
                        }
                    }
                ];

                baseListEntityVm.sourceItems[0] = items[0];
                baseListEntityVm.sourceItems[1] = items[1];

                baseListEntityVm.selectEntity("1");

                expect(items[0].isSelected).toBeTruthy();
                expect(items[1].isSelected).toBeFalsy();

                baseListEntityVm.selectEntity("2");

                expect(items[0].isSelected).toBeFalsy();
                expect(items[1].isSelected).toBeTruthy();
            });
        });

        describe("When the elements are loaded in the list", () => {
            it("THEN countChanged is raised with the number of items in the list", () => {
                let baseListEntityVm = new TestBaseListViewModel(Utility);
                let callbackEvent = jasmine.createSpy("callbackEvent");

                let items = [];
                items[0] = {
                    originalEntity: {
                        Id: "1"
                    }
                };

                baseListEntityVm.on("countChanged", function (param) {
                    callbackEvent(param);
                }, this);

                baseListEntityVm.onLoadItems(items, false);
                expect(callbackEvent).toHaveBeenCalledWith(1);
            });
        });

        describe("When the elements are loaded in the list and isSelectFirst = TRUE", () => {
            it("THEN the first element of the list is selected if the list is not empty", () => {
                let baseListEntityVm = new TestBaseListViewModel(Utility);
                let callbackEvent = jasmine.createSpy("callbackEvent");

                let items = [];
                items[0] = {
                    originalEntity: {
                        Id: "1"
                    }
                };

                baseListEntityVm.on("selectedItemChanged", function (param) {
                    callbackEvent(param);
                }, this);

                baseListEntityVm.onLoadItems(items, true);
                expect(callbackEvent).toHaveBeenCalledWith(items[0]);
            });
        });

        describe("Feature: IVirtualInfiniteRepeat", () => {
            describe("WHEN I call getItemAtIndex with an index greater than items", () => {
                it("THEN, it returns null", () => {
                    let baseListEntityVm = new TestBaseListViewModel(Utility);
                    let result = baseListEntityVm.getItemAtIndex(5);
                    expect(result).toBeNull();
                });
            });

            describe("WHEN I call getItemAtIndex with an index in the range of sourceItems", () => {
                it("THEN, it returns the corresponding item", () => {
                    let baseListEntityVm = new TestBaseListViewModel(Utility);
                    let items = [<ap.viewmodels.IEntityViewModel>{ originalEntity: { Id: "1" } }, <ap.viewmodels.IEntityViewModel>{ originalEntity: { Id: "2" } }];
                    baseListEntityVm.sourceItems = items;

                    let result = baseListEntityVm.getItemAtIndex(1);
                    expect(result.originalEntity.Id).toBe(items[1].originalEntity.Id);
                });
            });
            describe("WHEN I call getLength on list not loaded", () => {
                it("THEN, it returns 0", () => {
                    let baseListEntityVm = new TestBaseListViewModel(Utility);

                    expect(baseListEntityVm.getLength()).toBe(0);
                });
            });
            describe("WHEN I call getLength on a list with a number of items", () => {
                it("THEN, it returns the count of these items", () => {
                    let baseListEntityVm = new TestBaseListViewModel(Utility);
                    let items = [<ap.viewmodels.IEntityViewModel>{ originalEntity: { Id: "1" } }, <ap.viewmodels.IEntityViewModel>{ originalEntity: { Id: "2" } }];
                    baseListEntityVm.onLoadItems(items);
                    expect(baseListEntityVm.getLength()).toBe(items.length);
                });
            });
        });

        describe("Feature: Get entity by id", () => {
            let defNote: ng.IDeferred<any>;
            let defNoteStatus: ng.IDeferred<any>;

            let baseListEntityVm;

            beforeEach(() => {
                baseListEntityVm = new TestBaseListViewModel(Utility);
            })
            describe("WHEN getEntityById is called with an id AND the id is in NoteCommentList", () => {
                it("THEN it returns the noteComment", () => {
                    let item = <ap.viewmodels.EntityViewModel>{
                        originalEntity: {
                            Id: "1"
                        }
                    };
                    baseListEntityVm.sourceItems[0] = item;

                    let result = baseListEntityVm.getEntityById("1");

                    expect(result).toBe(item);
                });
            });
            describe("WHEN getEntityById is called with an id AND the id is not in NoteCommentList", () => {
                it("THEN it returns null", () => {
                    let item = <ap.viewmodels.EntityViewModel>{
                        originalEntity: {
                            Id: "1"
                        }
                    };
                    baseListEntityVm.sourceItems[0] = item;

                    let result = baseListEntityVm.getEntityById("42");

                    expect(result).toBeNull();
                });
            });
            describe("WHEN getEntityById is called with an id AND the NoteCommentList is empty", () => {
                it("THEN it returns null", () => {
                    let result = baseListEntityVm.getEntityById("42");

                    expect(result).toBeNull();
                });
            });
            describe("WHEN getEntityById is called with no id", () => {
                it("THEN it returns null", () => {
                    let item = <ap.viewmodels.EntityViewModel>{
                        originalEntity: {
                            Id: "1"
                        }
                    };
                    baseListEntityVm.sourceItems[0] = item;

                    let result = baseListEntityVm.getEntityById(null);

                    expect(result).toBeNull();
                });
            });
        });
    });

    describe("Feature: Management of ListEntityViewModel", () => {
        describe("WHEN I create a ListEntityViewModel with ListEntityViewModel('ContactDetails', 'User', 'Id', 'ProjectId = 1000')", () => {
            it("THEN a ListEntityViewModel is created with the given values", () => {
                let listEntity = new ap.viewmodels.ListEntityViewModel(Utility, "ContactDetails", "User", "Id", "ProjectId = 1000");
                expect(listEntity.entityName).toBe("ContactDetails");
                expect(listEntity.pathToLoad).toBe("User");
                expect(listEntity.sortOrder).toBe("Id");
                expect(listEntity.defaultFilter).toBe("ProjectId = 1000");
            });
        });
        describe("WHEN changeSortOrder is called", () => {
            it("THEN, the __sortOrder property has changed with new value", () => {
                let listEntity = new ap.viewmodels.ListEntityViewModel(Utility, "ContactDetails", "User", "Id", "ProjectId = 1000");
                expect(listEntity.sortOrder).toBe("Id");
                listEntity.changeSortOrder("User.Name");
                expect(listEntity.sortOrder).toBe("User.Name");
            });
        });
    });

    describe("Feature: dispose", () => {
        describe("WHEN the dispose method is called", () => {
            it("THEN, the dispose method of all the items in the list is called", () => {
                let listEntity = new ap.viewmodels.ListEntityViewModel(Utility, "ContactDetails", "User", "Id", "ProjectId = 1000");

                spyOn(ap.viewmodels.EntityViewModel.prototype, "dispose");

                listEntity.sourceItems.push(new ap.viewmodels.EntityViewModel(Utility));
                listEntity.sourceItems.push(new ap.viewmodels.EntityViewModel(Utility));
                listEntity.sourceItems.push(new ap.viewmodels.EntityViewModel(Utility));

                listEntity.dispose();

                expect((<jasmine.Spy>ap.viewmodels.EntityViewModel.prototype.dispose).calls.count()).toEqual(3);
            });
        });
    });

    describe("Feature: selectedViewModel", () => {

        let listEntity: ap.viewmodels.ListEntityViewModel;
        let spySelectedEntity: jasmine.Spy;

        beforeEach(() => {
            listEntity = new ap.viewmodels.ListEntityViewModel(Utility, "ContactDetails", "User", "Id", "ProjectId = 1000");

            spySelectedEntity = spyOn(listEntity, "selectEntity");
        });

        describe("WHEN a call to selectedViewModel is made with a value", () => {
            it("THEN, selectedEntity is called", () => {
                listEntity.selectedViewModel =
                    <ap.viewmodels.IEntityViewModel>{
                        originalEntity: {
                            Id: "12"
                        }
                    };

                expect(listEntity.selectEntity).toHaveBeenCalledWith("12");
            });
        });

        describe("WHEN a call to selectedViewModel is made without a value", () => {
            it("THEN, selectedEntity is called", () => {
                listEntity.selectedViewModel = null;

                expect(listEntity.selectEntity).toHaveBeenCalledWith(null);
            });
            it("THEN, selectedViewModel = NULL", () => {
                spySelectedEntity.and.callThrough();

                listEntity.selectedViewModel = null;

                expect(listEntity.selectedViewModel).toBeNull();
            });
        });
    });
    describe("Feature: updateItem", () => {
        let baseListEntityVm: TestBaseListViewModel;
        let items: ap.viewmodels.IEntityViewModel[];
        beforeEach(() => {
            baseListEntityVm = new TestBaseListViewModel(Utility);
            items = [
                <ap.viewmodels.EntityViewModel>{
                    originalEntity: {
                        Id: "1",
                        EntityVersion: 5
                    },
                    init: (entity: ap.models.Entity, parentEntity?: ap.models.Entity) => { }
                },
                <ap.viewmodels.EntityViewModel>{
                    originalEntity: {
                        Id: "2",
                        EntityVersion: 4
                    },
                    init: (entity: ap.models.Entity, parentEntity?: ap.models.Entity) => { }
                }
            ];
            baseListEntityVm.onLoadItems(items);
        });
        describe("WHEN the method updateItem is called with the null or undefined", () => {
            it("THEN, an error is thrown", () => {
                expect(() => {
                    baseListEntityVm.updateItem(undefined);
                }).toThrowError("updateitem_item_mandatory");
            });
        });
        describe("WHEN the method updateItem is called with and entity is existed on the list", () => {
            let itemUpdated: ap.models.notes.Note;
            beforeEach(() => {
                itemUpdated = new ap.models.notes.Note(Utility);
                spyOn(items[0], "init");
                spyOn(items[1], "init");

                let itemJson =
                    {
                        Id: "2",
                        EntityVersion: 5,
                        IsArchived: true
                    };
                itemUpdated.createByJson(itemJson);
            });
            it("THEN, the item.originalNote must be updated by the given note", () => {
                baseListEntityVm.updateItem(itemUpdated);

                expect(items[1].init).toHaveBeenCalledWith(itemUpdated);
            });
            it("THEN, items not corresponding to the update item are not initialized with this updated item", () => {
                baseListEntityVm.updateItem(itemUpdated);

                expect(items[0].init).not.toHaveBeenCalled();
            });
            it("THEN, the event itemsUpdated is raised", () => {
                let callback = jasmine.createSpy("callback");
                baseListEntityVm.on("itemsUpdated", callback, this);
                baseListEntityVm.updateItem(itemUpdated);

                expect(items[0].init).not.toHaveBeenCalledWith([items[1]]);
            });
        });
    });

    describe("Feature: getCheckedItems", () => {

        let baseListEntityVm: ap.viewmodels.ListEntityViewModel;

        beforeEach(() => {
            baseListEntityVm = new ap.viewmodels.ListEntityViewModel(Utility, "ContactDetails", "User", "Id", "ProjectId = 1000");

            let items = [
                <ap.viewmodels.EntityViewModel>{
                    originalEntity: {
                        Id: "1"
                    }
                },
                <ap.viewmodels.EntityViewModel>{
                    originalEntity: {
                        Id: "2"
                    }
                }
            ];

            baseListEntityVm.sourceItems[0] = items[0];
            baseListEntityVm.sourceItems[1] = items[1];

            spyOn(baseListEntityVm, "getLength").and.returnValue(2);
        });

        describe("WHEN I call getCheckedItems AND the list contains checked items", () => {
            it("THEN, the checked items are returned", () => {
                baseListEntityVm.sourceItems[0].isChecked = true;

                expect(baseListEntityVm.getCheckedItems().length).toBe(1);
            });
        });

        describe("WHEN I call getCheckedItems AND the list does not contain checked items", () => {
            it("THEN, no item is returned", () => {
                expect(baseListEntityVm.getCheckedItems().length).toBe(0);
            });
        });
    });

    describe("Feature: uncheckAll", () => {

        let baseListEntityVm: ap.viewmodels.ListEntityViewModel;

        beforeEach(() => {
            baseListEntityVm = new ap.viewmodels.ListEntityViewModel(Utility, "ContactDetails", "User", "Id", "ProjectId = 1000");

            let items = [
                <ap.viewmodels.EntityViewModel>{
                    originalEntity: {
                        Id: "1"
                    }
                },
                <ap.viewmodels.EntityViewModel>{
                    originalEntity: {
                        Id: "2"
                    }
                }
            ];

            baseListEntityVm.sourceItems[0] = items[0];
            baseListEntityVm.sourceItems[1] = items[1];

            spyOn(baseListEntityVm, "getLength").and.returnValue(2);
        });

        describe("WHEN I call uncheckAll AND the list contains checked items", () => {
            it("THEN, all the checked items become uncheck", () => {
                baseListEntityVm.sourceItems[0].isChecked = true;
                baseListEntityVm.sourceItems[1].isChecked = true;

                baseListEntityVm.uncheckAll();

                expect(baseListEntityVm.sourceItems[0].isChecked).toBeFalsy();
                expect(baseListEntityVm.sourceItems[1].isChecked).toBeFalsy();
            });
        });
    });

    describe("Feature: getLoadedItemsIds", () => {

        let baseListEntityVm: ap.viewmodels.ListEntityViewModel;

        beforeEach(() => {
            baseListEntityVm = new ap.viewmodels.ListEntityViewModel(Utility, "ContactDetails", "User", "Id", "ProjectId = 1000");

            let items = [
                <ap.viewmodels.EntityViewModel>{
                    originalEntity: {
                        Id: "1"
                    }
                },
                <ap.viewmodels.EntityViewModel>{
                    originalEntity: {
                        Id: "2"
                    }
                },
                <ap.viewmodels.EntityViewModel>{}
            ];

            baseListEntityVm.sourceItems[0] = items[0];
            baseListEntityVm.sourceItems[4] = null;
            baseListEntityVm.sourceItems[2] = items[1];
            baseListEntityVm.sourceItems[6] = items[2];
        });

        describe("WHEN a call to getLoadedItemsIds is made", () => {
            it("THEN, the list of loaded items ids is returned", () => {
                expect(baseListEntityVm.getLoadedItemsIds()).toEqual(["1", "2"]);
            });
        });
    });

    describe("Feature: insertItem", () => {
        let baseListEntityVm: ap.viewmodels.ListEntityViewModel;
        beforeEach(() => {
            baseListEntityVm = new ap.viewmodels.ListEntityViewModel(Utility, "ContactDetails", "User", "Id", "ProjectId = 1000");
        });
        describe("WHEN insertItem call without item", () => {
            it("THEN will throw the error", () => {
                expect(function () { baseListEntityVm.insertItem(0, null); }).toThrowError("item is mandatory");
            });
        });
        describe("WHEN insertItem call and the list have not loaded", () => {
            it("THEN will throw the error", () => {
                expect(function () {
                    baseListEntityVm.insertItem(0, new ap.viewmodels.EntityViewModel(Utility));}).toThrowError("Cannot insert the item when isLoaded = false");
            });
        });

        describe("WHEN insertItem call and the list have loaded", () => {

            let callback: jasmine.Spy;
            let event: ap.viewmodels.ItemInsertedEvent;

            beforeEach(() => {
                callback = jasmine.createSpy("callback");
                baseListEntityVm.on("iteminserted", function (evt: ap.viewmodels.ItemInsertedEvent)
                {
                    callback(evt);
                }, this);
                let items = [
                    <ap.viewmodels.EntityViewModel>{
                        originalEntity: {
                            Id: "1"
                        }
                    },
                    <ap.viewmodels.EntityViewModel>{
                        originalEntity: {
                            Id: "2"
                        }
                    }
                ];
                baseListEntityVm.onLoadItems(items, false);


                baseListEntityVm.insertItem(0, <ap.viewmodels.EntityViewModel>{
                    originalEntity: {
                        Id: "3"
                    }
                });

                event = new ap.viewmodels.ItemInsertedEvent(0, <ap.viewmodels.EntityViewModel>{
                    originalEntity: {
                        Id: "3"
                    }
                })
            });
            it("THEN, the item will be insert into the index", () => {
                expect(baseListEntityVm.sourceItems[0].originalEntity.Id).toEqual("3");
                expect(baseListEntityVm.sourceItems[1].originalEntity.Id).toEqual("1");
                expect(baseListEntityVm.sourceItems[2].originalEntity.Id).toEqual("2");

            });
            it("THEN, count property will be updated", () => {
                expect(baseListEntityVm.count).toEqual(3);
            });
            it("THEN, 'iteminserted' event will be fired", () => {
                expect(callback).toHaveBeenCalled();
                expect((<jasmine.Spy>callback).calls.argsFor(0)[0]).toEqual(event);
            });
        });
    });
}); 