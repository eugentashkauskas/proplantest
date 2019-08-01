module ap.viewmodels.reports {
    export class SendReportByEmailViewModel extends SendReportViewModel {

        constructor(utility: ap.utility.UtilityHelper, _api: ap.services.apiHelper.Api, $q: angular.IQService,
            _projectController: ap.controllers.ProjectController,
            reportController: ap.controllers.ReportController, mainController: ap.controllers.MainController, contactService: ap.services.ContactService) {

            super(utility, _api, $q, _projectController, reportController, mainController, contactService);
        }

        private reportByEmailOnly: boolean = true;
    }
}