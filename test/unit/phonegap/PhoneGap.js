describe("PhoneGap", function () {
    var s,
        _pluginDB = [],
        sinon = require('sinon'),
        db = require('ripple/db'),
        Plugin = require('ripple/platform/phonegap/1.0/Plugin'),
        //plugins = require('ripple/platform/phonegap/1.0/plugins'),
        PhoneGap = require('ripple/platform/phonegap/1.0/PhoneGap');

    function _propertyCount(obj) {
        var prop, count = 0;
        for (prop in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                count++;
            }
        }
        return count;
    }

    beforeEach(function () {
        s = sinon.sandbox.create();
        spyOn(db, "retrieveObject").andReturn(_pluginDB);
    });

    afterEach(function () {
        s.verifyAndRestore();
        _pluginDB.splice(0, _pluginDB.length);
    });

    describe("spec", function () {
        var spec = require('ripple/platform/phonegap/1.0/spec');

        it("includes PhoneGap module according to proper object structure", function () {
            expect(spec.objects.PhoneGap.path)
                .toEqual("phonegap/1.0/PhoneGap");
        });
    });

    describe("exec", function () {
        it("can execute plugin", function () {
            var data = [new Plugin()];
            data[0].name = "Weather";
            data[0].result = {today:"cloudy"};

            _pluginDB.splice.apply(_pluginDB, [0, data.length].concat(data));

            waits(1);
            PhoneGap.exec(function (result) {
                expect(result.today).toEqual("cloudy");
            }, function () {}, "Weather", "", []);
        });
    });
});

