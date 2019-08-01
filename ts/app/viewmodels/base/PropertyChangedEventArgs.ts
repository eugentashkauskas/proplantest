module ap.viewmodels.base {
    /**
     * This class is used as argument when the `propertychanged` event is raised
     */
    export class PropertyChangedEventArgs {
        /**
         * This is an accessor for a name of the changed property
         */
        get propertyName(): string {
            return this._propertyName;
        }

        /**
         * This is an accessor for an old value of the changed property
         */
        get oldValue(): any {
            return this._oldValue;
        }

        /**
         * This is an accessor for an object which raises the event
         */
        get caller(): any {
            return this._caller;
        }

        /**
         * @param _propertyName a name of the changed property
         * @param _oldValue an old value of the changed property
         * @param _caller an object which raises the event
         */
        constructor(private _propertyName: string, private _oldValue: any, private _caller: any) {
        }
    }
}
