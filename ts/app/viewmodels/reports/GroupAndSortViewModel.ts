module ap.viewmodels.reports {
    export class GroupAndSortViewModel {
        public get groupAndSortItems(): GroupAndSortItemViewModel[] {
            return this._groupAndSortItems;
        }
        public set groupAndSortItems(groupAndSortItems: GroupAndSortItemViewModel[]) {
            this._groupAndSortItems = groupAndSortItems;
        }

        /*
        * Access collection of columns def to allow define group by first columns
        */
        public get groupByProperties(): ap.models.reports.ReportColumnDefNote[] {
            return this._groupByProperties;
        }

        /*
        * Access collection of columns def to allow define sort form the second option
        */
        public get sortProperties(): ap.models.reports.ReportColumnDefNote[] {
            return this._sortProperties;
        }

        /*
        * Methods to post all the changes and return good group and sort collection
        */
        public postChanges(): ap.models.reports.ReportGroupAndSort[] {
            let groupAndSortItems = [];
            let emptyItems = [];
            for (let i = 0; i < this._groupAndSortItems.length; i++) {
                if (this._groupAndSortItems[i].propertyName === "None" && i > 0)
                    emptyItems.push(this._groupAndSortItems[i]);
                 else
                    groupAndSortItems.push(this._groupAndSortItems[i]);
            }

            this._groupAndSortItems = groupAndSortItems.concat(emptyItems);

            let result: ap.models.reports.ReportGroupAndSort[] = [];

            for (let i = 0; i < this._groupAndSortItems.length; i++) {
                if (this._groupAndSortItems[i].propertyName !== "None" && this._groupAndSortItems[i].propertyName !== null) {
                    if (i === 0) {
                        let foundColumns = this._groupByProperties.filter((col, intdex, values) => { return col.PropertyName === this._groupAndSortItems[i].propertyName; });
                        // If the first one is not in group property then throw error
                        if (foundColumns.length === 0)
                            throw new Error("Property '{0}' cannot be set as group property".format(this._groupAndSortItems[i].propertyName));
                    } else if (i > 0) {
                        let foundColumns = this._sortProperties.filter((col, intdex, values) => { return col.PropertyName === this._groupAndSortItems[i].propertyName; });
                        // If the first one is not in group property then throw error
                        if (foundColumns.length === 0)
                            throw new Error("Property '{0}' is not support for sort".format(this._groupAndSortItems[i].propertyName));
                    }

                    let item = new ap.models.reports.ReportGroupAndSort(this.utility);
                    item.PropertyName = this._groupAndSortItems[i].propertyName;
                    item.IsAscending = this._groupAndSortItems[i].isAscending;
                    result.push(item);
                } else {
                    if (i === 0)
                        throw new Error("Group property cannot be empty".format(this._groupAndSortItems[i].propertyName));
                }
            }

            return result;
        }

        /*
        * private methos to build 2 collection of properties for group and sort
        */
        private init() {
            this._groupByProperties = [];
            this._sortProperties = [];

            this._noneColumn = new ap.models.reports.ReportColumnDefNote(this.utility);
            this._noneColumn.PropertyName = "None";
            this.sortProperties.push(this._noneColumn);

            for (let i = 0; i < this.properties.length; i++) {
                if ((this.properties[i].PropertyName === "Meeting" && this.utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_MeetingManagement)) || this.properties[i].PropertyName !== "Meeting") {
                    if (this.properties[i].CanUseGroupBy === true)
                        this._groupByProperties.push(this.properties[i]);

                    if (this.properties[i].CanUseSort === true)
                        this._sortProperties.push(this.properties[i]);
                }
            }
        }

        /*
        * Method
        */
        public initGroupAndSortIems(groupAndSorts: ap.models.reports.ReportGroupAndSort[]) {
            this._groupAndSortItems = [];

            let groupAndSortsWithOrderd = groupAndSorts.sort((item1: ap.models.reports.ReportGroupAndSort, item2: ap.models.reports.ReportGroupAndSort) => {
                return item1.DisplayOrder - item2.DisplayOrder;
            });

            // logic: Need to create always 3 items for group and sort

            // if the tempalte was bad -> take only 3 items
            if (groupAndSortsWithOrderd.length > 3) groupAndSortsWithOrderd = groupAndSortsWithOrderd.slice(0, 3);

            for (let j = 0; j < groupAndSortsWithOrderd.length; j++) {
                let group = new GroupAndSortItemViewModel(this.utility);
                group.isAscending = groupAndSortsWithOrderd[j].IsAscending;

                let foundColumns = this.properties.filter((col, intdex, values) => { return col.PropertyName === groupAndSortsWithOrderd[j].PropertyName; });
                if (foundColumns.length > 0)
                    group.columnDefNote = foundColumns[0];
                else
                    group.columnDefNote = this._noneColumn;

                this._groupAndSortItems.push(group);
            }

            // if the tempalte was good but not enought of 3 then try to add missing dummy one with property empty
            if (this._groupAndSortItems.length < 3) {
                for (let i = 0; i < 4 - this._groupAndSortItems.length; i++) {
                    let dummyGroup = new GroupAndSortItemViewModel(this.utility);
                    dummyGroup.isAscending = true;
                    dummyGroup.columnDefNote = this._noneColumn;
                    this._groupAndSortItems.push(dummyGroup);
                }
            }

            // end logic: Need to create always 3 items for group and sort
        }

        constructor(private utility: ap.utility.UtilityHelper, private properties: ap.models.reports.ReportColumnDefNote[]) {
            this.init();
        }

        private _groupAndSortItems: GroupAndSortItemViewModel[] = null;
        private _groupByProperties: ap.models.reports.ReportColumnDefNote[] = null;
        private _sortProperties: ap.models.reports.ReportColumnDefNote[] = null;
        private _noneColumn: ap.models.reports.ReportColumnDefNote = null;
    }
}