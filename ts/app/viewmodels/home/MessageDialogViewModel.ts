namespace ap.viewmodels.home {
    /**
    * This class is the controller to show the md-panel dialog
    **/
    export class MessageDialogViewModel {
        /**
        * This method is used to validate the result of the dialog 
        **/
        acceptDialog() {
            if (this.param.callback) {
                this.param.callback(ap.controllers.MessageResult.Positive);
            }
            this.close();
        }
        /**
        * This method is used to cancel the dialog
        **/
        cancelDialog() {
            if (this.param.callback) {
                this.param.callback(ap.controllers.MessageResult.Negative);
            }
            this.close();
        }

        /**
        * This method is used to validate the result of the dialog by special button on left size
        **/
        leftKeyDialog() {
            if (this.param.callback) {
                this.param.callback(ap.controllers.MessageResult.LeftKey);
            }
            this.close();
        }

        /**
        * This method is used to close, destroy the dialog
        **/
        private close() {
            let self = this;
            this.mdPanelRef.close().then(() => {
                if (self.mdPanelRef)
                    self.mdPanelRef.destroy();
            });
        }
        static $inject = ["mdPanelRef", "param"];
        constructor(private mdPanelRef: any, private param: any) {
        }
    }
}