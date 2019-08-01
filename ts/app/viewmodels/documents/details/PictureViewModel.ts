module ap.viewmodels.documents {
    export class PrintZone {
        /**
         * This is the index of the page for which a printzone is defined
         **/
        public get pageIndex(): number {
            return this._pagedShape.pageIndex;
        }

        /**
         * This is the scale to use of the printZone
         **/
        public get scale(): number {
            return this._scale;
        }

        /**
         * This is the position of the printZone from the center of the image when the size of image is at the scaled defined
         **/
        public get renderCenter(): Point {
            return this._renderCenter;
        }

        /**
         * This method will apply the scale and renderCenter to the pagedShape
         */
        public postChanges() {
            this._pagedShape.printScale = this._scale;
            this._pagedShape.printRenderCenter = this._renderCenter;
        }

        constructor(private _pagedShape: ap.models.shapes.PagedShapes, private _scale: number, private _renderCenter: Point) {

        }
    }
    export class PictureViewModel implements IDispose, utility.IListener {

        public get isXlsDocument(): boolean {
            let extension = this._documentViewModel.documentSourceFile ? this.$utility.FileHelper.getExtension(this._documentViewModel.documentSourceFile) : null;
            return extension === "xlsx" || extension === "xls";
        }

        public get hasOnlySourceFile(): boolean {
            return this._documentViewModel.hasOnlySourceFile;
        }

        /** 
         * This is the document view model on which the picture viewmodel will be based.
         **/
        public get documentViewModel(): ap.viewmodels.documents.DocumentViewModel {
            return this._documentViewModel;
        }

        public get documentShapes(): ap.models.shapes.PagedShapes[] {
            return this._documentShapes;
        }

        /**
         * This property returns the pagedShape corresponding to the pageIndex of the documentViewModel
         **/
        public get selectedPageShapes(): ap.models.shapes.PagedShapes {
            if (this.documentShapes) {
                for (let i = 0; i < this.documentShapes.length; i++) {
                    if (this.documentShapes[i].pageIndex === this.documentViewModel.pageIndex)
                        return this.documentShapes[i];
                }
                for (let i = 0; i < this._newPagedShapes.length; i++) {
                    if (this._newPagedShapes[i].pageIndex === this.documentViewModel.pageIndex)
                        return this._newPagedShapes[i];
                }

            }
            return null;
        }

        /**
        * Getter  to know if the user can select shape in the pictureviewer
        **/
        public get canSelectShape(): boolean {
            return this._canSelectShape;
        }

        /**
         * Getter to know if the user is on edit mode
         **/
        public get isEditMode(): boolean {
            return this._isEditMode;
        }

        /** 
         * Set if the user is in edit mode or not
         **/
        public set isEditMode(newvalue: boolean) {
            this._isEditMode = newvalue;
            this.documentViewModel.isEditMode = newvalue;
            this._checkCanSelectShapes();
        }

        /**
         * To know if drawings save is processing through the api
         **/
        public get isSavingDrawings(): boolean {
            return this._isSavingDrawings;
        }

        /** 
         * Getter to know if it's necessary to save the drawings
         **/
        public get mustSaveDrawings(): boolean {
            return this._mustSaveDrawings;
        }

        /** 
         * Getter to know if the user has the possibility to edit
         **/
        public get hasEditAccess(): boolean {
            return this._hasEditAccess;
        }

        /** 
         * Set if the user has the possibility to edit or not
         **/
        public set hasEditAccess(b: boolean) {
            this._hasEditAccess = b;
        }

        /**
         * This method will create a new instance of PictureViewModel to duplicate it (new DocumentViewModel, same values for properties)
         */
        public duplicate(): PictureViewModel {
            let duplicate = new PictureViewModel(this.$utility, this.$controllersManager, this.documentViewModel.duplicate());
            return duplicate;
        }

        /**
         * This method must be called when a printZone is validated in the picture viewer
         * @param printZone The new printZone value
         */
        public onPrintZoneDefined(printZone: PrintZone) {
            // Check if we have already a printZone defined for the same page. Yes, you can delete it to add new one.
            this._printZones.remove(printZone.pageIndex);
            let pagedShape = this.getPagedShapeByIndex(printZone.pageIndex);
            if (pagedShape === null && !this._addedShapes.containsKey(printZone.pageIndex)) // It means it concerns a paged for which there was no shape before modifications of the user.
                throw new Error("You are modifying a printzone for a pagedShape not found (pageIndex = " + printZone.pageIndex + ")");
            // need to check if there was some modifications
            if (pagedShape === null || !pagedShape.printRenderCenter.equals(printZone.renderCenter) || pagedShape.printScale !== printZone.scale)
                this._printZones.add(printZone.pageIndex, printZone);
            this.checkMustSaveDrawings();
        }

        /**
         * This method is called when a new shape is drawn in the picture viewer
         * @param shape the shape to add
         **/
        public onShapeAdded(shape: ap.models.shapes.ShapeBase) {
            if (this.hasEditAccess === false || this.isEditMode === false) {
                throw new Error("hasEditAccess or isEditMode = false");
            }
            if (!this.selectedPageShapes) { // If there is not pagedShape created for the current pageIndex, we need to create to manage new shapes on the page.
                this._newPagedShapes.push(new ap.models.shapes.PagedShapes(this.documentViewModel.pageIndex));
            }

            if (this._addedShapes.containsKey(this.documentViewModel.pageIndex)) {
                let page = this._addedShapes.getValue(this.documentViewModel.pageIndex);
                if (!page.containsKey(shape.uid)) {
                    page.add(shape.uid, shape);
                }
            } else {
                this._addedShapes.add(this.documentViewModel.pageIndex, new Dictionary<string, ap.models.shapes.ShapeBase>([new KeyValue(shape.uid, shape)]));
            }
            if (shape instanceof models.shapes.TextShape && StringHelper.isNullOrEmpty(shape.text)) {
                this.checkMustSaveDrawings(true);
            } else {
                this.checkMustSaveDrawings();
            }
        }

        /**
         * This method is called when a shape is updated
         * @param shape the shape to update
         **/
        public onShapeUpdated(shape: ap.models.shapes.ShapeBase) {
            if (this.hasEditAccess === false || this.isEditMode === false) {
                throw new Error("hasEditAccess or isEditMode = false");
            }
            if (this._updatedShapesWithPageIndex.containsKey(this.documentViewModel.pageIndex)) {
                if (this._updatedShapesWithPageIndex.getValue(this.documentViewModel.pageIndex).containsKey(shape.uid)) {
                    this._updatedShapesWithPageIndex.getValue(this.documentViewModel.pageIndex).setValue(shape.uid, shape);
                } else {
                    this._updatedShapesWithPageIndex.getValue(this.documentViewModel.pageIndex).add(shape.uid, shape);
                }

            } else {
                this._updatedShapesWithPageIndex.add(this.documentViewModel.pageIndex, new Dictionary<string, ap.models.shapes.ShapeBase>([new KeyValue(shape.uid, shape)]));
            }
            let pageAdded = this._addedShapes.getValue(this.documentViewModel.pageIndex);
            if ((!pageAdded || !pageAdded.containsKey(shape.uid)) && !this._deletedShapes.containsKey(shape.uid)) {
                let originalShape = this._documentViewModel.noteDocument.getShapeByUid(shape.uid);
                if (originalShape === null) {
                    throw new Error("Original shape not found");
                } else {
                    if (shape.isEqual(originalShape)) {
                        this._updatedShapes.remove(shape.uid);
                    } else {
                        if (this._updatedShapes.containsKey(shape.uid)) {
                            this._updatedShapes.remove(shape.uid);
                        }

                        this._updatedShapes.add(shape.uid, shape);
                    }
                }
            }
            if (shape instanceof models.shapes.TextShape && StringHelper.isNullOrEmpty(shape.text)) {
                this.checkMustSaveDrawings(true);
            } else {
                this.checkMustSaveDrawings();
            }
        }

        /**
         * This method is called when a new shape is deleted
         * @param shape the shape to delete
         **/
        public onShapeDeleted(shape: ap.models.shapes.ShapeBase) {
            if (this.hasEditAccess === false || this.isEditMode === false) {
                throw new Error("hasEditAccess or isEditMode = false");
            }
            let pageAdded = this._addedShapes.getValue(this.documentViewModel.pageIndex);
            if (this._deletedShapesWithPageIndex.containsKey(this.documentViewModel.pageIndex)) {
                this._deletedShapesWithPageIndex.getValue(this.documentViewModel.pageIndex).add(shape.uid, shape);

            } else {
                this._deletedShapesWithPageIndex.add(this.documentViewModel.pageIndex, new Dictionary<string, ap.models.shapes.ShapeBase>([new KeyValue(shape.uid, shape)]));
            }
            if (pageAdded && pageAdded.containsKey(shape.uid)) {
                pageAdded.remove(shape.uid);
                if (pageAdded.count === 0) {
                    this._addedShapes.remove(this.documentViewModel.pageIndex);
                    this._printZones.remove(this.documentViewModel.pageIndex);
                }
            } else {
                if (this._updatedShapes.containsKey(shape.uid)) {
                    this._updatedShapes.remove(shape.uid);
                }
                if (!this._deletedShapes.containsKey(shape.uid)) {
                    this._deletedShapes.add(shape.uid, shape);
                }
            }
            this.checkMustSaveDrawings();
        }

        /**
        * Method use to set mustSaveDrawings
        **/
        private checkMustSaveDrawings(textEmpty: boolean = false) {
            let addedShapesCount: number = 0;
            let keys = this._addedShapes.keys();
            let mustSaveDrawings: boolean = false;
            for (let i = 0; i < this._addedShapes.count; i++) {
                addedShapesCount = addedShapesCount + this._addedShapes.getValue(keys[i]).keys().length;
            }
            if (!(addedShapesCount === 1 && textEmpty) && (addedShapesCount > 0 || this._updatedShapes.count > 0 || this._deletedShapes.count > 0 || this._printZones.count > 0)) {
                mustSaveDrawings = true;
            }
            if (this._mustSaveDrawings !== mustSaveDrawings) {
                this._mustSaveDrawings = mustSaveDrawings;
                this._listener.raise("mustsavedrawings", this._mustSaveDrawings);
            }
        }

        /**
         * This method is used to close the picture viewer. If there are update to do, a confirmation message will be shown to the user. If he choose "no", nothing happens.
         **/
        public close() {
            this.cancel(true);
        }

        /**
        * Method use to cancel what has been changed
        **/
        public cancel(toClose: boolean = false) {
            if (this.mustSaveDrawings)
                this.$controllersManager.mainController.showConfirmKey("app.pictureviewer.confirm_cancel", "Cancel changes", (confirm) => {
                    if (confirm === ap.controllers.MessageResult.Positive) {
                        this._addedShapes.clear();
                        this._updatedShapesWithPageIndex.clear();
                        this._deletedShapesWithPageIndex.clear();
                        this._updatedShapes.clear();
                        this._deletedShapes.clear();
                        this._printZones.clear();
                        this._newPagedShapes = [];
                        this.checkMustSaveDrawings();
                        this.initShapes();
                        if (toClose)
                            this._listener.raise("closerequested", this);
                    }
                });
            else if (toClose)
                this._listener.raise("closerequested", this);
        }

        /**
        * This method check array of shapes on existing shape with empty textfield and remove item from array
        **/
        private _checkTextShapes(arrayShapes: ap.models.shapes.ShapeBase[]): ap.models.shapes.ShapeBase[] {
            let removeShapes: ap.models.shapes.ShapeBase[] = [];
            for (let i = arrayShapes.length; i >= 0; i--) {
                if (arrayShapes[i] instanceof ap.models.shapes.TextShape && StringHelper.isNullOrEmpty((<ap.models.shapes.TextShape>arrayShapes[i]).text)) {
                    removeShapes.push(arrayShapes[i]);
                    arrayShapes.splice(i, 1);
                }
            }
            return removeShapes;
        }

        /**
        * This method use for checks on valid added/updated shapes
        **/
        private checkValidShapes(): boolean {
            let hasInvalidItems: boolean = false;
            let pagedShapeKey = this._addedShapes.keys();
            for (let i = 0; i < pagedShapeKey.length; i++) {
                let dictionnaryTab = this._addedShapes.getValue(pagedShapeKey[i]);
                let shapeBaseTab = dictionnaryTab.values();
                hasInvalidItems = this._checkTextShapes(shapeBaseTab).length > 0;
                if (hasInvalidItems)
                    break;
            }
            return hasInvalidItems;
        }

        /**
        * Method use to save current changes
        **/
        public save() {
            this._isSavingDrawings = true;
            let addedShape: ap.models.shapes.PagedShapes[] = [];
            let updatedShape: ap.models.shapes.ShapeBase[] = this._updatedShapes.values();
            let deletedShape: ap.models.shapes.ShapeBase[] = this._deletedShapes.values();
            let allShapes: ap.models.shapes.ShapeBase[] = updatedShape;
            let pagedShapeKey = this._addedShapes.keys();
            for (let i = 0; i < pagedShapeKey.length; i++) {
                let dictionnaryTab = this._addedShapes.getValue(pagedShapeKey[i]);
                let shapeBaseTab = dictionnaryTab.values();
                allShapes = allShapes.concat(shapeBaseTab);
                this._checkTextShapes(shapeBaseTab);
                let pagedShape = new ap.models.shapes.PagedShapes(pagedShapeKey[i], shapeBaseTab);
                addedShape.push(pagedShape);
            }
            // We need to apply the changes done for each printzone before to save.
            let printZones = this._printZones.values();
            for (let i = 0; i < printZones.length; i++) {
                printZones[i].postChanges();
            }
            deletedShape.push(...this._checkTextShapes(updatedShape));
            this.checkShapesCoordinate(allShapes);
            this.documentViewModel.saveDrawings(addedShape, updatedShape, deletedShape, printZones).then((doc: models.notes.NoteDocument) => {
                this.updateShapes(addedShape);
                this._updatedShapesWithPageIndex.clear();
                this._deletedShapesWithPageIndex.clear();
                this._isSavingDrawings = false;
                this._mustSaveDrawings = false;
            });
        }

        /**
         * Method used to modify coordinate of points (cannot have float coordinates)
         * @param shapes
         */
        private checkShapesCoordinate(shapes: ap.models.shapes.ShapeBase[]) {
            shapes.forEach((shape) => {
                if (shape instanceof ap.models.shapes.PolylineShape) {
                    for (let i = 0; i < shape.points.length; i++) {
                        shape.points[i].x = Math.round(shape.points[i].x);
                        shape.points[i].y = Math.round(shape.points[i].y);
                    }
                }
            });
        }

        /**
         * Method used to update documentShapes in the way to save the modifications made by the user without refresh (WSD-383)
         * @param addedShape the PagedShapes which contains the added shapes
         */
        private updateShapes(addedShape: ap.models.shapes.PagedShapes[]) {
            for (let i = 0; i < addedShape.length; i++) {
                let page: ap.models.shapes.PagedShapes[] = this._documentShapes.filter((pageShape: ap.models.shapes.PagedShapes) => {
                    return pageShape.pageIndex === addedShape[i].pageIndex;
                });
                if (page[0]) {
                    page[0].shapes = page[0].shapes.concat(addedShape[i].shapes); // Add he added shapes to the current shapes
                } else {
                    this._documentShapes.push(addedShape[i]);
                }
            }
            for (let i = 0; i < this._updatedShapesWithPageIndex.count; i++) {
                if (this._updatedShapesWithPageIndex.containsKey(this._documentShapes[i].pageIndex)) {
                    let shapes: Dictionary<string, ap.models.shapes.ShapeBase> = this._updatedShapesWithPageIndex.getValue(this._documentShapes[i].pageIndex);
                    let idsShapes: string[] = shapes.keys();
                    for (let j = 0; j < idsShapes.length; j++) {
                        let updatedShape = this._documentShapes[i].shapes.filter((shape: ap.models.shapes.ShapeBase) => {
                            return shape.uid === idsShapes[j];
                        });
                        this._documentShapes[i].shapes[this._documentShapes[i].shapes.indexOf(updatedShape[0])] = shapes.getValue(idsShapes[j]); // Need to replace the existing shape with the new one updated
                    }
                }
            }
            for (let i = 0; i < this._deletedShapesWithPageIndex.count; i++) {
                if (this._deletedShapesWithPageIndex.containsKey(this._documentShapes[i].pageIndex)) {
                    let shapes: Dictionary<string, ap.models.shapes.ShapeBase> = this._deletedShapesWithPageIndex.getValue(this._documentShapes[i].pageIndex);
                    let idsShapes: string[] = shapes.keys();
                    for (let j = 0; j < idsShapes.length; j++) {
                        let updatedShape = this._documentShapes[i].shapes.filter((shape: ap.models.shapes.ShapeBase) => {
                            return shape.uid === idsShapes[j];
                        });
                        this._documentShapes[i].shapes.splice(this._documentShapes[i].shapes.indexOf(updatedShape[0]), 1); // Need to remove the deleting shape
                    }
                }
            }
        }

        /**
         * This method will copy the originalShapes to a new array of shapes
         **/
        private initShapes() {
            this._documentShapes = [];
            if (this._documentViewModel) {
                this._checkCanSelectShapes();

                if (this._documentViewModel.displayBadges) {
                    this.initBadgeShape();
                } else {
                    this.initDocumentShape();
                }
                this._listener.raise("shapeschanged");
            }
        }

        /**
         * This method will init the shape with linked to the note from the documentViewModel
         **/
        private initDocumentShape() {
            this._originalDocumentShapes = this._documentViewModel.displayedShapes;
            if (!this._originalDocumentShapes)
                return;
            let preXmlString = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\r\n";
            preXmlString += "<ArrayOfNoteShape xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\">";
            let postXmlString = "</ArrayOfNoteShape>";
            let self = this;
            this._originalDocumentShapes.forEach((pageShapes) => {
                let clonedShapes = [];
                pageShapes.shapes.forEach((shape) => {
                    let bkXml = preXmlString + shape.toXml() + postXmlString;
                    let shapeCopy = ap.models.Model.createShapeFromXml(bkXml, self.$utility)[0];
                    clonedShapes.push(shapeCopy);
                });
                let pageShapesClone = new ap.models.shapes.PagedShapes(pageShapes.pageIndex, clonedShapes, pageShapes.printScale, new Point(pageShapes.printRenderCenter.x, pageShapes.printRenderCenter.y));
                self._documentShapes.push(pageShapesClone);
            });
        }

        /**
         * This method returned the pagedShape corresponding to a specific pageIndex
         * @param pageIndex This is the index of the page for which we want to retrieve the pagedShape
         */
        private getPagedShapeByIndex(pageIndex: number) {
            for (let i = 0; i < this._documentShapes.length; i++)
                if (this._documentShapes[i].pageIndex === pageIndex)
                    return this._documentShapes[i];
            return null;
        }

        /**
         * This method will init the shape 
         **/
        private initBadgeShape() {
            this._documentShapes = this._documentShapes.concat(this._documentViewModel.displayedShapes);
        }

        /**
        * This method will raise event `shapeselected` with args
        **/
        public onShapeSelected(shape: ap.models.shapes.ShapeBase) {
            if (shape && this.documentViewModel.noteWorkspaceVm)
                this.documentViewModel.noteWorkspaceVm.selectItem((<ap.models.shapes.BadgeShape>shape).originalGuid);
            this._listener.raise("shapeselected", shape);
        }

        /**
         * Handler for property changed of the document view model
         * @param args event parameters
         */
        protected documentVmPropertyChanged(args: ap.viewmodels.base.PropertyChangedEventArgs) {
            switch (args.propertyName) {
                case "displayedShapes":
                    this.shapesChangedHandler();
                    break;
            }
        }

        private shapesChangedHandler() {
            if (this.mustSaveDrawings) {
                throw new Error("Changes need to be saved before");
            }
            this.initShapes();
        }

        /**
        * Method use toset isEditMode
        **/
        private editModeRequestedHandler() {
            if (this.documentViewModel.noteWorkspaceVm.noteDetailVm.note && this.documentViewModel.canEdit === true) {
                this.isEditMode = true;
            } else {
                this.isEditMode = false;
            }
        }

        /**
         * This is the handler when the save through the api is complete
         **/
        private drawingSavedHandler() {
            this._addedShapes.clear();
            this._deletedShapes.clear();
            this._updatedShapes.clear();
            this._updatedShapesWithPageIndex.clear();
            this._deletedShapesWithPageIndex.clear();
            this._printZones.clear();
            this.checkMustSaveDrawings();
        }


        /**
        * This method will change _canSelectShape and raise event canselectshapechanged
        **/
        private _checkCanSelectShapes() {
            let oldState = this._canSelectShape;
            this._canSelectShape = this._isEditMode || this.documentViewModel.displayBadges;
            if (oldState !== this._canSelectShape) {
                this._listener.raise("canselectshapechanged");
            }
        }

        public dispose() {
            if (this.documentViewModel) {
                this.documentViewModel.off("propertychanged", this.documentVmPropertyChanged, this);
                this.documentViewModel.off("drawingssaved", this.drawingSavedHandler, this);
                this.documentViewModel.off("editmoderequested", this.editModeRequestedHandler, this);
            }

            this._listener.clear();
        }

        private selectedNoteLinkedDocumentChangedHandler(values: IDictionary<string, DocumentViewModel>) {
            let oldDocumentVm: DocumentViewModel = values.getValue("oldValue");
            if (oldDocumentVm) {
                oldDocumentVm.off("propertychanged", this.documentVmPropertyChanged, this);
                oldDocumentVm.off("drawingssaved", this.drawingSavedHandler, this);
                oldDocumentVm.off("editmoderequested", this.editModeRequestedHandler, this);
            }

            let newDocumentVm: DocumentViewModel = values.getValue("newValue");
            if (newDocumentVm) {
                newDocumentVm.on("propertychanged", this.documentVmPropertyChanged, this);
                newDocumentVm.on("drawingssaved", this.drawingSavedHandler, this);
                newDocumentVm.on("editmoderequested", this.editModeRequestedHandler, this);
            }
        }

        on(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.on(eventName, callback, caller);
        }
        off(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.off(eventName, callback, caller);
        }

        constructor(private $utility: ap.utility.UtilityHelper, private $controllersManager: ap.controllers.ControllersManager, documentViewModel: ap.viewmodels.documents.DocumentViewModel) {
            this._documentViewModel = documentViewModel;

            this._listener = this.$utility.EventTool.implementsListener(["shapeschanged", "shapeselected", "canselectshapechanged", "closerequested", "mustsavedrawings"]);
            this.initShapes();
            if (this.documentViewModel) {
                this.documentViewModel.on("propertychanged", this.documentVmPropertyChanged, this);
                this.documentViewModel.on("drawingssaved", this.drawingSavedHandler, this);
                this.documentViewModel.on("editmoderequested", this.editModeRequestedHandler, this);
            }

            this._addedShapes = new Dictionary<number, Dictionary<string, ap.models.shapes.ShapeBase>>();
            this._updatedShapesWithPageIndex = new Dictionary<number, Dictionary<string, ap.models.shapes.ShapeBase>>();
            this._deletedShapesWithPageIndex = new Dictionary<number, Dictionary<string, ap.models.shapes.ShapeBase>>();
            this._deletedShapes = new Dictionary<string, ap.models.shapes.ShapeBase>();
            this._updatedShapes = new Dictionary<string, ap.models.shapes.ShapeBase>();
            this._printZones = new Dictionary<number, PrintZone>();
        }

        protected _listener: ap.utility.IListenerBuilder;
        private _isSavingDrawings: boolean = false;
        private _canSelectShape: boolean = false;
        private _documentViewModel: ap.viewmodels.documents.DocumentViewModel;
        private _originalDocumentShapes: ap.models.shapes.PagedShapes[];
        private _newPagedShapes: ap.models.shapes.PagedShapes[] = [];
        private _documentShapes: ap.models.shapes.PagedShapes[];
        private _hasEditAccess: boolean = false;
        private _isEditMode: boolean = false;
        private _mustSaveDrawings: boolean = false;
        private _addedShapes: Dictionary<number, Dictionary<string, ap.models.shapes.ShapeBase>>;
        private _updatedShapesWithPageIndex: Dictionary<number, Dictionary<string, ap.models.shapes.ShapeBase>>;
        private _deletedShapesWithPageIndex: Dictionary<number, Dictionary<string, ap.models.shapes.ShapeBase>>;
        private _updatedShapes: Dictionary<string, ap.models.shapes.ShapeBase>;
        private _deletedShapes: Dictionary<string, ap.models.shapes.ShapeBase>;
        private _printZones: Dictionary<number, PrintZone>;
    }
}