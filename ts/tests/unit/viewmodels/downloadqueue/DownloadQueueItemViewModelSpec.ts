describe("module ap-viewmodels - DownloadQueueItemViewModel", () => {
    let vm: ap.viewmodels.downloadqueue.DownloadQueueItemViewModel;
    let Utility: ap.utility.UtilityHelper;
    let MassExportController: ap.controllers.MassExportController;
    let $rootScope: angular.IRootScopeService;
    let $q: angular.IQService;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    })

    beforeEach(inject((_Utility_, _MassExportController_, _$rootScope_, _$q_) => {
        Utility = _Utility_;
        MassExportController = _MassExportController_;
        $rootScope = _$rootScope_;
        $q = _$q_;
    }));

    describe("Feature: init", () => {
        let massExportConfig: ap.models.massExport.MassExportConfiguration;
        beforeEach(() => {
            massExportConfig = new ap.models.massExport.MassExportConfiguration(Utility);
            massExportConfig.createByJson({
                EntityCreationDate: new Date()
            });
            massExportConfig.FileName = "test-file-name";
            vm = new ap.viewmodels.downloadqueue.DownloadQueueItemViewModel(Utility, MassExportController);
            vm.init(massExportConfig);
        });
        describe("WHEN the viewmodel is initialized with the mass export config model;", () => {
            it("THEN, its properties are initialized", () => {
                expect(vm).toBeDefined();
                expect(vm.id).toEqual(massExportConfig.Id);
                expect(vm.docNumber).toEqual(0);
                expect(vm.zipName).toEqual(massExportConfig.FileName);
                expect(vm.isGenerated).toBeFalsy();
                expect(vm.availableDate).toEqual(massExportConfig.EntityCreationDate.addDays(5));
            });
        });
    });

    describe("Feature: delete", () => {
        let massExportConfig: ap.models.massExport.MassExportConfiguration;
        let deleteDef: angular.IDeferred<any>;

        beforeEach(() => {
            deleteDef = $q.defer();

            massExportConfig = new ap.models.massExport.MassExportConfiguration(Utility);
            massExportConfig.Date = new Date();
            massExportConfig.FileName = "test-file-name";
            vm = new ap.viewmodels.downloadqueue.DownloadQueueItemViewModel(Utility, MassExportController);
            vm.init(massExportConfig);
        });
        describe("WHEN delete method is called", () => {
            let callback: jasmine.Spy;            
            beforeEach(() => {
                callback = jasmine.createSpy("deleteCallback");
                vm.on("deleterequested", callback, this);
                spyOn(MassExportController, "deleteMassExportConfiguration").and.returnValue(deleteDef.promise);
                vm.delete();

                deleteDef.resolve(massExportConfig);
                $rootScope.$apply();
            });
            afterEach(() => {
                vm.dispose();
            });
            it("THEN, call API to update entity status", () => {
                expect(MassExportController.deleteMassExportConfiguration).toHaveBeenCalled();
            });
            it("THEN, 'deleterequested' event is raised", () => {
                expect(callback).toHaveBeenCalledWith(vm);
            });
        });
    });
});