"use strict";
describe("Module ap-viewmodels - version components - VersionItemViewModel", () => {

    let vm: ap.viewmodels.documents.VersionItemViewModel;
    let Utility: ap.utility.UtilityHelper, UserContext: ap.utility.UserContext;
    let $q: angular.IQService;
    let baseTime = new Date(2016, 2, 20, 15, 30, 20);
    let DocumentController: ap.controllers.DocumentController;
    let MainController: ap.controllers.MainController;
    let eventHelper: ap.utility.EventHelper;

    beforeEach(() => {
        angular.mock.module("matchMedia");
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject(function (_$rootScope_, _UserContext_, _Utility_, _$q_, _DocumentController_, _MainController_, _EventHelper_) {
        Utility = _Utility_;
        UserContext = _UserContext_;
        $q = _$q_;
        DocumentController = _DocumentController_;
        MainController = _MainController_;
        eventHelper = _EventHelper_;
        jasmine.clock().install;
        specHelper.general.stubDate(baseTime);

        spyOn(MainController, "currentProject").and.returnValue(
            {
                Id: "35a2c5d6-0e00-43e9-ada8-ce4d3fafb16e",
                IsActive: true,
                UserAccessRight: {
                    CanUploadDoc: true,
                    CanDownloadDoc: true
                }
            });
    }));

    afterEach(() => {
        jasmine.clock().uninstall;
    });

    describe("Feature constructor", () => {

        let version: ap.models.documents.Version;
        let date: Date;
        let document: ap.models.documents.Document;

        beforeEach(() => {
            date = new Date();
            version = new ap.models.documents.Version(Utility);
            version.Date = date;
            version.VersionIndex = 4;

            document = new ap.models.documents.Document(Utility);
            document.Date = date;
            document.VersionCount = 5;
        });

        describe("When the VersionItemViewModel is init with params AND is a Version", () => {
            beforeEach(() => {
                vm = new ap.viewmodels.documents.VersionItemViewModel(Utility);
                vm.init(version);
            });

            it("THEN, the vm is build with the correct values from the entity", () => {
                expect(vm.date).toBe(date);
                expect(vm.versionIndex).toBe(4);
                expect(vm.dateFormated).toBe(date.format());
            });
        });

        describe("When the VersionItemViewModel is init with params AND is a Document", () => {
            beforeEach(() => {
                vm = new ap.viewmodels.documents.VersionItemViewModel(Utility);
                vm.init(document);
            });

            it("THEN, the vm is build with the correct values from the entity", () => {
                expect(vm.date).toBe(date);
                expect(vm.versionIndex).toBe(5);
                expect(vm.dateFormated).toBe(date.format());
            });
        });
    });
});   