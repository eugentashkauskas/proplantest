"use strict";
describe("Module ap-viewmodels - ExternalCloudFileViewModel", () => {

    let Utility: ap.utility.UtilityHelper;
    let _deferred: angular.IDeferred<ap.services.apiHelper.ApiResponse>;

    beforeEach(() => {
        angular.mock.module("ap-viewmodels");
    });

    beforeEach(inject(function (_Utility_) {
        Utility = _Utility_;
        specHelper.utility.stubRootUrl(Utility);
        specHelper.userContext.stub(Utility);
    }));

    describe("Feature: constructor", () => {
        let vm: ap.viewmodels.cloud.ExternalCloudFileViewModel;
        beforeEach(() => {
            let cloudFile: ap.models.cloud.ExternalCloudFile = new ap.models.cloud.ExternalCloudFile(Utility);
            vm = new ap.viewmodels.cloud.ExternalCloudFileViewModel(Utility);
            vm.init(cloudFile);
        });

        it("THEN, created with ", () => {
            expect(vm.isExpanded).toBeFalsy();
            expect(vm.isChecked).toBeFalsy();
            vm.isChecked = true;
            expect(vm.isChecked).toBeTruthy();
        });
    });
}); 