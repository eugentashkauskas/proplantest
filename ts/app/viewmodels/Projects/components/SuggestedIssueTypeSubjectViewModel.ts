module ap.viewmodels.projects {
    export class SuggestedIssueTypeSubjectViewModel {
        public get subject(): string {
            return this._subject;
        }
        public get defaultDescription(): string {
            return this._defaultDescription;
        }
        public set defaultDescription(desc: string) {
            this._defaultDescription = desc;
        }
        constructor(subject: string) {
            this._subject = subject;
        }
        private _subject: string = null;
        private _defaultDescription: string = null;
    }
}