describe("Module ap-viewmodels - DownloadQueueListViewModel", () => {
    let Utility: ap.utility.UtilityHelper;
    let vm: ap.viewmodels.downloadqueue.DownloadQueueListViewModel;
    let MassExportController: ap.controllers.MassExportController;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject(function (_Utility_, _MassExportController_) {
        Utility = _Utility_;
        MassExportController = _MassExportController_;
    }))

    beforeEach(() => {
        vm = new ap.viewmodels.downloadqueue.DownloadQueueListViewModel(Utility, MassExportController);
    });

    describe("Feature: constructor", () => {
        describe("WHEN the viewmodel is created", () => {
            it("THEN, the viewmodel is initialized", () => {
                expect(vm).toBeDefined();
            });
        })
    })
});