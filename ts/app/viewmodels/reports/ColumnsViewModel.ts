module ap.viewmodels.reports {
    export class ColumnsViewModel implements IDispose {
        /**
        * All the collum available to allow print
        **/
        public get columnsAvailable(): ReportColumnViewModel[] {
            return this._columnsAvailable;
        }
        public set columnsAvailable(columnsPrinted: ReportColumnViewModel[]) {
            this._columnsAvailable = columnsPrinted;
        }

        /**
        * Used to know if there is more than one column selected
        **/
        public get isMoreThanOneColumnSelected(): boolean {
            return this.getNumberOfCheckedItems() > 1;
        }

        /**
        * Used to know if the user's browser is IE
        **/
        public get isIE(): boolean {
            return this.utility.isIE();
        }

        /**
        * Based on checked columns -> build a list of printed column in good display order and update to the ReportConfig
        **/
        public postChanges<T extends ap.models.reports.ReportColumn>(c: { new (utility: ap.utility.UtilityHelper): T; }
            , targetCollection: ap.models.reports.ReportColumn[]): void {
            if (targetCollection === undefined || targetCollection === null)
                throw new Error("'targetCollection' is mandatory");

            let toPrint = [];
            let displayOrder = 0;
            for (let i = 0; i < this._columnsAvailable.length; i++) {
                if (this._columnsAvailable[i].isChecked) {
                    let reportCol = new c(this.utility);
                    reportCol.PropertyName = this._columnsAvailable[i].propertyName;
                    reportCol.DisplayOrder = displayOrder;
                    toPrint.push(reportCol);
                    displayOrder++;
                }
            }

            for (let i = 0; i < toPrint.length; i++) {
                if (targetCollection.length <= i) {
                    targetCollection.push(toPrint[i]);
                } else {
                    targetCollection[i].PropertyName = toPrint[i].PropertyName;
                    targetCollection[i].DisplayOrder = toPrint[i].DisplayOrder;
                }
            }

            // remove the exceed ones
            if (targetCollection.length > toPrint.length)
                targetCollection.splice(toPrint.length);
        }

        /**
        * Clear draggable entities and add new one to dragOptions
        * @param entity Draggable entity
        **/
        public addDraggableEntity(entity: ReportColumnViewModel) {
            this._dragOptions.clearDraggable();
            this._dragOptions.addDraggable(entity);
        }

        /**
        * Get columns' drag options 
        **/
        public get dragOptions() {
            return this._dragOptions;
        }

        /**
        * Handle when isChecked value has changed
        **/
        private columnIsCheckedChanged(column: ReportColumnViewModel) {
            let departPosition = this._columnsAvailable.indexOf(column);
            let desPosition = 0;

            // find border position
            for (let i = 0; i <= this._columnsAvailable.length; i++) {
                // sepcial cases
                desPosition = i;
                if (i === this._columnsAvailable.length) break; // to the last position
                if (this._columnsAvailable[i] === column) {
                    if (column.isChecked === true) break;
                }
                else if (this._columnsAvailable[i].isChecked === false) {
                    break;
                }
            }

            this.moveColum(departPosition, desPosition);
        }

        /**
        * Drop column event handler, changes displayOrder property value
        * @param event ColumnDropped event, contains displayOrder for start and end entity position
        **/
        private columnDropped(event: ap.component.dragAndDrop.DropEntityEvent) {
            let draggableArray = <ReportColumnViewModel[]>this._columnsAvailable;
            this._columnsAvailable = <ReportColumnViewModel[]>ap.utility.sortDraggableEntities(draggableArray, event);
        }

        /**
        * Used to move a column up
        * @param colName the name of the column we want to move up
        **/
        private moveUp(colName: string) {
            for (let i = 0; i < this._columnsAvailable.length; i++) {
                if (this._columnsAvailable[i].propertyName === colName) {
                    let firstDisplayOrder: number = this._columnsAvailable[i - 1].displayOrder;
                    this._columnsAvailable[i - 1].displayOrder = this._columnsAvailable[i].displayOrder;
                    this._columnsAvailable[i].displayOrder = firstDisplayOrder;
                    break;
                }
            }
            this._columnsAvailable.sort((a, b) => a.displayOrder - b.displayOrder);
        }

        /**
        * Used to move a column down
        * @param colName the name of the column we want to move down
        **/
        private moveDown(colName: string) {
            for (let i = 0; i < this._columnsAvailable.length; i++) {
                if (this._columnsAvailable[i].propertyName === colName) {
                    let lastDisplayOrder: number = this._columnsAvailable[i + 1].displayOrder;
                    this._columnsAvailable[i + 1].displayOrder = this._columnsAvailable[i].displayOrder;
                    this._columnsAvailable[i].displayOrder = lastDisplayOrder;
                    break;
                }
            }
            this._columnsAvailable.sort((a, b) => a.displayOrder - b.displayOrder);
        }

        /**
        * Method used to know how many draggable items there are in the list
        **/
        private getNumberOfCheckedItems(): number {
            let numberOfCheckedItems: number = 0;
            for (let i = 0; i < this._columnsAvailable.length; i++) {
                if (this._columnsAvailable[i].isChecked) {
                    numberOfCheckedItems++;
                }
            }
            return numberOfCheckedItems;
        }

        /**
        * Method used to know if the item in param is the first of the list
        * @param col: ReportColumnViewModel the column to know if it's the first one of the list
        **/
        public isFirst(col: ReportColumnViewModel): boolean {
            if (col.displayOrder === 0) {
                return true;
            }
            else {
                return false;
            }
        }

        /**
        * Method used to know if the item in param is the last of the list
        * @param col: ReportColumnViewModel the column to know if it's the last one of the list
        **/
        public isLast(col: ReportColumnViewModel): boolean {
            if (col.displayOrder === this.getNumberOfCheckedItems() - 1) {
                return true;
            }
            else {
                return false;
            }
        }

        /**
        * This method to move a column from a postion to another postion in array
        **/
        private moveColum(start: number, des: number): void {
            if (start === des) return;

            let itemToMove = this._columnsAvailable[start];

            this._columnsAvailable.splice(start, 1);

            // des -1 because we remove 1
            if (start < des) des--;

            let firstSection = this._columnsAvailable.slice(0, des);
            let lastSection = this._columnsAvailable.slice(des);

            this._columnsAvailable = [];
            this._columnsAvailable = firstSection.concat([itemToMove], lastSection);

            // re-displayorder to have good values
            for (let i = 0; i < this._columnsAvailable.length; i++) {
                this._columnsAvailable[i].displayOrder = i;
            }
        }

        /**
       * This implements IDispose
       **/
        dispose() {
            this._clearItems();
            this._dragOptions.dispose();
        }

        /**
       * Clear and disppose columns
       **/
        protected _clearItems() {
            if (this._columnsAvailable) {
                for (let i = 0; i < this._columnsAvailable.length; i++) {
                    let item: ReportColumnViewModel = this._columnsAvailable[i];
                    if (item) {
                        item.dispose();
                    }
                }
            }
        }

        /**
        * This called by ctor to init columns collection base on available columns def and printed columns
        **/
        private init(): void {
            let sortedColumns = [];
            if (this.columnsPrinted && this.columnsPrinted !== null)
                sortedColumns = this.columnsPrinted.sort((a, b) => a.DisplayOrder - b.DisplayOrder);

            this._columnsAvailable = [];
            let displayOrder = 0;
            for (let i = 0; i < sortedColumns.length; i++) {
                let col = new ReportColumnViewModel(this.utility);
                col.propertyName = sortedColumns[i].PropertyName;
                col.displayOrder = displayOrder;
                col.isChecked = true;
                col.on("ischeckedchanged", this.columnIsCheckedChanged, this);
                col.on("isdropped", this.columnDropped, this);
                col.on("moveuprequested", this.moveUp, this);
                col.on("movedownrequested", this.moveDown, this);
                this._columnsAvailable.push(col);
                displayOrder++;
            }

            if (this.availableColumns && this.availableColumns !== null) {
                let sortedAvailbaleColumns = this.availableColumns.sort((a, b) => a.DisplayOrder - b.DisplayOrder);
                for (let i = 0; i < sortedAvailbaleColumns.length; i++) {
                    if (sortedAvailbaleColumns[i].IsVisible === true) {
                        let hasPrinted = this._columnsAvailable.filter((c, index, list) => c.propertyName === sortedAvailbaleColumns[i].PropertyName);
                        if (hasPrinted.length > 0) {
                            hasPrinted[0].canHide = sortedAvailbaleColumns[i].CanHideCol;
                        } else {
                            let col = new ReportColumnViewModel(this.utility);
                            col.propertyName = sortedAvailbaleColumns[i].PropertyName;
                            col.displayOrder = displayOrder;
                            col.canHide = sortedAvailbaleColumns[i].CanHideCol;
                            if (col.canHide) {
                                col.isChecked = false;
                            } else {
                                col.isChecked = true;
                            }
                            col.on("ischeckedchanged", this.columnIsCheckedChanged, this);
                            col.on("isdropped", this.columnDropped, this);
                            col.on("moveuprequested", this.moveUp, this);
                            col.on("movedownrequested", this.moveDown, this);
                            this._columnsAvailable.push(col);
                            displayOrder++;
                        }
                    }
                }
            }
            this._dragOptions = new ap.component.dragAndDrop.DragOptions(this.utility, true);
        }

        constructor(private utility: ap.utility.UtilityHelper, private columnsPrinted: ap.models.reports.ReportColumn[],
            private availableColumns: ap.models.reports.ReportColumnDefBase[]) {
            this.init();
        }
        private _columnsAvailable: ReportColumnViewModel[] = null;
        private _dragOptions: ap.component.dragAndDrop.DragOptions;
    }
}