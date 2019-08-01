describe("Module ap-viewmodels - reports", () => {
    var nmp = ap.viewmodels.reports;
    var MainController: ap.controllers.MainController, Utility: ap.utility.UtilityHelper, Api: ap.services.apiHelper.Api, UserContext: ap.utility.UserContext, UIStateController: ap.controllers.UIStateController;
    var $controller: angular.IControllerService, $rootScope: angular.IRootScopeService, $scope: angular.IScope, _deferred: angular.IDeferred<ap.services.apiHelper.ApiResponse>,
        $q: angular.IQService, $timeout: angular.ITimeoutService, $compile: angular.ICompileService;

    var groupAndSortViewModel: ap.viewmodels.reports.GroupAndSortViewModel = null;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });
    beforeEach(inject(function (_$rootScope_, _$q_, _$timeout_, _$compile_, _UserContext_, _Utility_, _Api_, _MainController_, _UIStateController_, _$controller_) {
        MainController = _MainController_;
        UIStateController = _UIStateController_;
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
    }));

    describe("Feature GroupAndSortViewModel: constructor", () => {
        describe("WHEN the GroupAndSortViewModel is created", () => {
            let subjectColumDef, roomColumDef: ap.models.reports.ReportColumnDefNote;
            beforeEach(() => {
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.returnValue(true);

                let meetingColumn = new ap.models.reports.ReportColumnDefNote(Utility);
                meetingColumn.PropertyName = "Meeting";
                meetingColumn.CanUseGroupBy = true;
                meetingColumn.CanUseSort = true;                

                let codeColumn = new ap.models.reports.ReportColumnDefNote(Utility);
                codeColumn.PropertyName = "Code";
                codeColumn.CanUseGroupBy = false;
                codeColumn.CanUseSort = true;

                groupAndSortViewModel = new ap.viewmodels.reports.GroupAndSortViewModel(Utility, [meetingColumn, codeColumn]);
                expect(groupAndSortViewModel.groupAndSortItems).toBeNull();

                subjectColumDef = new ap.models.reports.ReportColumnDefNote(Utility);
                subjectColumDef.PropertyName = "Subject";

                var subjectItem = new ap.viewmodels.reports.GroupAndSortItemViewModel(Utility);
                subjectItem.columnDefNote = subjectColumDef;
                subjectItem.isAscending = true;

                roomColumDef = new ap.models.reports.ReportColumnDefNote(Utility);
                roomColumDef.PropertyName = "Room";

                var roomItem = new ap.viewmodels.reports.GroupAndSortItemViewModel(Utility);
                roomItem.columnDefNote = roomColumDef;
                roomItem.isAscending = false;

                groupAndSortViewModel.groupAndSortItems = [subjectItem, roomItem];
            });
            it("THEN groupAndSortItems with 2 item", () => { expect(groupAndSortViewModel.groupAndSortItems.length).toEqual(2); });
            it("THEN groupAndSortItems[0] is subject", () => { expect(groupAndSortViewModel.groupAndSortItems[0].propertyName).toEqual("Subject"); });
            it("THEN groupAndSortItems[0] is ascending", () => { expect(groupAndSortViewModel.groupAndSortItems[0].isAscending).toBeTruthy(); });
            it("THEN groupAndSortItems[1] is Room", () => { expect(groupAndSortViewModel.groupAndSortItems[1].propertyName).toEqual("Room"); });
            it("THEN groupAndSortItems[1] is descending", () => { expect(groupAndSortViewModel.groupAndSortItems[1].isAscending).toBeFalsy(); });

            it("THEN there is 1 item is groupByProperties", () => { expect(groupAndSortViewModel.groupByProperties.length).toEqual(1); });
            it("THEN there is 2 items is sortProperties", () => { expect(groupAndSortViewModel.sortProperties.length).toEqual(3); });

            it("THEN groupByProperties[0] is for Meeting", () => { expect(groupAndSortViewModel.groupByProperties[0].PropertyName).toEqual("Meeting"); });
            it("THEN groupByProperties[0] can use in group", () => { expect(groupAndSortViewModel.groupByProperties[0].CanUseGroupBy).toBeTruthy(); });
            it("THEN groupByProperties[0] can use in sort", () => { expect(groupAndSortViewModel.groupByProperties[0].CanUseSort).toBeTruthy(); });

            it("THEN sortProperties[0] is None", () => { expect(groupAndSortViewModel.sortProperties[0].PropertyName).toEqual("None"); });

            it("THEN sortProperties[1] is for Meeting", () => { expect(groupAndSortViewModel.sortProperties[1].PropertyName).toEqual("Meeting"); });
            it("THEN sortProperties[1] can use in group", () => { expect(groupAndSortViewModel.sortProperties[1].CanUseGroupBy).toBeTruthy(); });
            it("THEN sortProperties[1] can use in sort", () => { expect(groupAndSortViewModel.sortProperties[1].CanUseSort).toBeTruthy(); });

            it("THEN sortProperties[2] is for Code", () => { expect(groupAndSortViewModel.sortProperties[2].PropertyName).toEqual("Code"); });
            it("THEN sortProperties[2] can NOT use in group", () => { expect(groupAndSortViewModel.sortProperties[2].CanUseGroupBy).toBeFalsy(); });
            it("THEN sortProperties[2] can use in sort", () => { expect(groupAndSortViewModel.sortProperties[2].CanUseSort).toBeTruthy(); });
        });
        describe("WHEN the GroupAndSortViewModel is created AND User is Free or Pro", () => {
            beforeEach(() => {
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.returnValue(false);

                let meeting = new ap.models.reports.ReportColumnDefNote(Utility);
                meeting.PropertyName = "Meeting";
                meeting.CanUseSort = true;
                meeting.CanUseGroupBy = true;

                groupAndSortViewModel = new ap.viewmodels.reports.GroupAndSortViewModel(Utility, [meeting]);
            });

            it("THEN there are 1 item in group and sort", () => {
                expect(groupAndSortViewModel.sortProperties.length).toEqual(1);
            });
            it("THEN sortProperties[0] is None", () => {
                expect(groupAndSortViewModel.sortProperties[0].PropertyName).toEqual("None");
            });
        });
    });

    describe("Feature GroupAndSortViewModel: initGroupAndSortIems", () => {
        let subjectGroup, roomSort, dateSort: ap.models.reports.ReportGroupAndSort;
        let subjectColumDef, roomColumDef, dateColumDef, noneColumDef: ap.models.reports.ReportColumnDefNote;

        describe("WHEN call initGroupAndSortIems with 4 items of group and sort item", () => {
            beforeEach(() => {
                spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.returnValue(true);

                subjectColumDef = new ap.models.reports.ReportColumnDefNote(Utility);
                subjectColumDef.PropertyName = "Subject";
                subjectColumDef.CanUseSort = true;
                subjectColumDef.CanUseGroupBy = true;

                roomColumDef = new ap.models.reports.ReportColumnDefNote(Utility);
                roomColumDef.PropertyName = "Room";
                roomColumDef.CanUseSort = true;
                roomColumDef.CanUseGroupBy = false;

                dateColumDef = new ap.models.reports.ReportColumnDefNote(Utility);
                dateColumDef.PropertyName = "Date";
                dateColumDef.CanUseSort = true;
                dateColumDef.CanUseGroupBy = false;

                noneColumDef = new ap.models.reports.ReportColumnDefNote(Utility);
                noneColumDef.PropertyName = "None";

                subjectGroup = new ap.models.reports.ReportGroupAndSort(Utility);
                subjectGroup.PropertyName = "Subject";
                subjectGroup.DisplayOrder = 1;
                subjectGroup.IsAscending = false;

                roomSort = new ap.models.reports.ReportGroupAndSort(Utility);
                roomSort.PropertyName = "Room";
                roomSort.DisplayOrder = 2;
                roomSort.IsAscending = true;

                dateSort = new ap.models.reports.ReportGroupAndSort(Utility);
                dateSort.PropertyName = "Date";
                dateSort.DisplayOrder = 3;
                dateSort.IsAscending = true;

                let dummySort = new ap.models.reports.ReportGroupAndSort(Utility);
                dummySort.PropertyName = "test";
                dummySort.DisplayOrder = 4;

                groupAndSortViewModel = new ap.viewmodels.reports.GroupAndSortViewModel(Utility, [roomColumDef, subjectColumDef, dateColumDef]);
                groupAndSortViewModel.initGroupAndSortIems([roomSort, subjectGroup, dateSort, dummySort]);
            });

            it("THEN there are 3 item in group and sort", () => {
                expect(groupAndSortViewModel.groupAndSortItems.length).toEqual(3);
            });

            it("THEN first item is Subject", () => {
                expect(groupAndSortViewModel.groupAndSortItems[0].propertyName).toEqual("Subject");
            });
            it("THEN first item is sort DESC", () => {
                expect(groupAndSortViewModel.groupAndSortItems[0].isAscending).toBeFalsy();
            });

            it("THEN second item is Room", () => {
                expect(groupAndSortViewModel.groupAndSortItems[1].propertyName).toEqual("Room");
            });
            it("THEN second item is sort ASC", () => {
                expect(groupAndSortViewModel.groupAndSortItems[1].isAscending).toBeTruthy();
            });

            it("THEN third item is Date", () => {
                expect(groupAndSortViewModel.groupAndSortItems[2].propertyName).toEqual("Date");
            });
            it("THEN third item is sort ASC", () => {
                expect(groupAndSortViewModel.groupAndSortItems[2].isAscending).toBeTruthy();
            });
        });
    });

    describe("Feature GroupAndSortViewModel: postChange", () => {
        let subjectItem, roomItem, emptyItem: ap.viewmodels.reports.GroupAndSortItemViewModel;
        let subjectColumDef, roomColumDef, noneColumDef: ap.models.reports.ReportColumnDefNote;
        beforeEach(() => {
            spyOn(Utility.UserContext.licenseAccess, "hasAccess").and.returnValue(true);

            let codeColumn = new ap.models.reports.ReportColumnDefNote(Utility);
            codeColumn.PropertyName = "Code";
            codeColumn.CanUseGroupBy = false;
            codeColumn.CanUseSort = true;

            subjectColumDef = new ap.models.reports.ReportColumnDefNote(Utility);
            subjectColumDef.PropertyName = "Subject";
            subjectColumDef.CanUseGroupBy = true;
            subjectColumDef.CanUseSort = true;

            noneColumDef = new ap.models.reports.ReportColumnDefNote(Utility);
            noneColumDef.PropertyName = "None";

            roomColumDef = new ap.models.reports.ReportColumnDefNote(Utility);
            roomColumDef.PropertyName = "Room";
            roomColumDef.CanUseGroupBy = false;
            roomColumDef.CanUseSort = true;
            
            subjectItem = new ap.viewmodels.reports.GroupAndSortItemViewModel(Utility);
            subjectItem.columnDefNote = subjectColumDef;
            subjectItem.isAscending = true;

            emptyItem = new ap.viewmodels.reports.GroupAndSortItemViewModel(Utility);
            emptyItem.columnDefNote = noneColumDef;
            emptyItem.isAscending = true;

            roomItem = new ap.viewmodels.reports.GroupAndSortItemViewModel(Utility);
            roomItem.columnDefNote = roomColumDef;
            roomItem.isAscending = false;
        });
        describe("WHEN the GroupAndSortViewModel is created with 3 items and the second one in empty propery and call post change", () => {            
            let result: ap.models.reports.ReportGroupAndSort[];
            beforeEach(() => {                
                groupAndSortViewModel = new ap.viewmodels.reports.GroupAndSortViewModel(Utility, [subjectColumDef, roomColumDef]);
                groupAndSortViewModel.groupAndSortItems = [subjectItem, emptyItem, roomItem];
                result = groupAndSortViewModel.postChanges();
            });

            it("THEN, remaining 3 items", () => { expect(groupAndSortViewModel.groupAndSortItems.length).toEqual(3); })
            it("THEN, first one must be subject", () => { expect(groupAndSortViewModel.groupAndSortItems[0]).toEqual(subjectItem); })
            it("THEN, second one must be Room", () => { expect(groupAndSortViewModel.groupAndSortItems[1]).toEqual(roomItem); })
            it("THEN, last one must be the empty one", () => { expect(groupAndSortViewModel.groupAndSortItems[2]).toEqual(emptyItem); })

            it("THEN, result is 2 items", () => { expect(result.length).toEqual(2); })
            it("THEN, result first items is Subject", () => { expect(result[0].PropertyName).toEqual("Subject"); })
            it("THEN, result second items is Room", () => { expect(result[1].PropertyName).toEqual("Room"); })
        });

        describe("WHEN postCHnage is called with first item cannot group", () => {            
            beforeEach(() => {
                groupAndSortViewModel = new ap.viewmodels.reports.GroupAndSortViewModel(Utility, [subjectColumDef, roomColumDef]);
                groupAndSortViewModel.groupAndSortItems = [roomItem, subjectItem, emptyItem];                
            });

            it("THEN, throw error", () => {
                expect(() => { groupAndSortViewModel.postChanges(); }).toThrowError("Property 'Room' cannot be set as group property");
            });
        });

        describe("WHEN postCHnage is called with first item is none", () => {
            beforeEach(() => {
                groupAndSortViewModel = new ap.viewmodels.reports.GroupAndSortViewModel(Utility, [subjectColumDef, roomColumDef]);
                groupAndSortViewModel.groupAndSortItems = [emptyItem, roomItem, subjectItem];            
            });

            it("THEN, throw error", () => {
                expect(() => { groupAndSortViewModel.postChanges(); }).toThrowError("Group property cannot be empty");
            });
        });
    });

});   