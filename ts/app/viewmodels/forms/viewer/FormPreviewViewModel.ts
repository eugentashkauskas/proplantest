module ap.viewmodels.forms.viewer {

    /**
     * An interface that contains general information about a form or form template
     * used on the form preview screen
     */
    interface IFormLikeObject extends ap.models.Entity {
        Subject: string;
    }

    /**
     * This class provides a way to retreave general information about an underlying
     * form or form template instance
     */
    export class FormPreviewViewModel extends ap.viewmodels.EntityViewModel {
        get originalEntity(): IFormLikeObject {
            return <IFormLikeObject>this._originalEntity;
        }

        get Subject(): string {
            return this._subject;
        }

        init(entity: IFormLikeObject) {
            super.init(entity);
        }

        copySource(): void {
            let form = this.originalEntity;
            this._subject = form.Subject;
        }

        private _subject: string;
    }

}
