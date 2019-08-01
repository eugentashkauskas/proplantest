module ap.viewmodels.reports {
    /**
    * This class to keep and show the list of ReportTemplate
    **/
    export class ReportTemplateListViewModel extends ListEntityViewModel {
        /**
        * This method will be load the list of the ProjectReportTemplate and select the item defined on the param
        * @param idToSelect? is the item need to select by default
        * @param isMeetingReport to know need to load meeting report template or project report template
        **/
        load(idToSelect?: string, isMeetingReport: boolean = false) {
            let self = this;
            let listVm: ap.viewmodels.reports.ReportConfigItemViewModel[] = [];
            if (isMeetingReport) {
                this.reportController.getMeetingTemplates().then((listTemplate: ap.models.reports.MeetingReportTemplate[]) => {
                    self.fillList(listTemplate, idToSelect);
                });
            }
            else {
                this.reportController.getProjectTemplates().then((listTemplate: ap.models.reports.ProjectReportTemplate[]) => {
                    self.fillList(listTemplate, idToSelect);
                });
            }
        }
        /**
        * This method is used to fill the list of template and select the item after get the list from the controller
        * @param listTemplate is the list of template entity
        * @param idToSelect is the id of the item need to select by default
        **/
        private fillList(listTemplate: ap.models.reports.ReportConfigBase[], idToSelect?: string) {
            let self = this;
            let listVm: ap.viewmodels.reports.ReportConfigItemViewModel[] = [];
            if (listTemplate) {
                angular.forEach(listTemplate, (template: ap.models.reports.ReportConfigBase, key) => {
                    let itemVm: ap.viewmodels.reports.ReportConfigItemViewModel = new ap.viewmodels.reports.ReportConfigItemViewModel(self.$utility);
                    itemVm.init(template);
                    listVm.push(itemVm);
                });
            }
            self.onLoadItems(listVm);
            if (listVm.length > 0) {
                if (idToSelect)
                    self.selectEntity(idToSelect);
                else
                    self.selectEntity(listTemplate[0].Id);
            }
        }

        constructor(utility: ap.utility.UtilityHelper, private $q: angular.IQService, private reportController: ap.controllers.ReportController) {
            super(utility, "ReportConfigBase", null, null, null);
        }
    }
}