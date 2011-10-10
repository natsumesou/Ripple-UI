describe("phonegap_plugins", function () {
    var s,
        _pluginDB = [],
        sinon = require('sinon'),
        db = require('ripple/db'),
        Plugin = require('ripple/platform/phonegap/1.0/Plugin'),
        plugins = require('ripple/platform/phonegap/1.0/plugins');

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

        it("includes Plugin module according to proper object structure", function () {
            expect(spec.objects.Plugin.path)
                .toEqual("phonegap/1.0/Plugin");
        });

    });

    it("can crate plugin", function () {
        var obj = {
            name: "Weather",
            action: "get",
            result: '{"tokyo":"sunny","sapporo":"cloudy"}'
        },
        plugin = plugins.create(obj);

        expect(plugin.name).toEqual(obj.name);
        expect(plugin.action).toEqual(obj.action);
        expect(JSON.stringify(plugin.result)).toEqual(obj.result);
    });
    it("object can save itself", function () {
        var plugin = plugins.create({"name": "Temperature"});

        plugin.save(function (item) {
            expect(typeof item.name).toEqual("string");
            expect(item.name).toEqual("Temperature");
        });
    });


    describe("find and findAll", function () {
        it("calls error callback when no plugin fields given", function () {
            plugins.find(null, function () {}, function (error) {
                expect(typeof error).toEqual("string");
                expect(error).toEqual("could not find plugin named (null)");
            });
        });

        it("calls error callback when given empty plugin fields", function () {
            plugins.find({}, function () {}, function (error) {
                expect(typeof error).toEqual("string");
                expect(error).toEqual("could not find plugin named ()");
            });
        });

        it("returns array in success callback", function () {
            plugins.find({name:"Weather"}, function (items) {
                expect(typeof items).toEqual("object");
            });
        });

        it("return array of plugins", function () {
            var data = [new Plugin(), new Plugin()];
            data[0].name = "Weather";
            data[0].action = "get";
            data[1].name = "Weahter";
            data[1].action = "set";

            _pluginDB.splice.apply(_pluginDB, [0, data.length].concat(data));

            waits(1);
            plugins.find({"name":"Weather"}, function (items) {
                expect(typeof items).toEqual("object");
                expect(items.length).toEqual(2);
                expect(items[0].name).toEqual("Weather");
                expect(items[0].action).toEqual("get");
                expect(items[1].action).toEqual("set");
            }, function () {});
        });

        it("return empty array", function () {
            var items = plugins.findAll();
            expect(items.length).toEqual(0);
        });

        it("return added array", function () {
            var data = [new Plugin(), new Plugin()];
            data[0].name = "hoge";
            data[1].name = "fuba";

            _pluginDB.splice.apply(_pluginDB, [0, data.length].concat(data));

            waits(1);
            var items = plugins.findAll();
            expect(items.length).toEqual(2);
        });
    });

    describe("save", function () {
        it("updates an existing plugin if a plugin with the same id already exists", function () {
            var data = [new Plugin()];
            data[0].name = "Weather";
            data[0].action = "get";

            _pluginDB.splice.apply(_pluginDB, [0, data.length].concat(data));

            waits(1);
            plugins.find({name: "Weather", action:"get"}, function (items) {
                plugin = items[0];
                plugin.result = '{"test":"test object"}';
                plugin.save(function (items) {
                    expect(items.length).toEqual(1);
                    expect(items[0].name).toEqual("Weather");
                    expect(items[0].action).toEqual("get");
                    expect(items[0].result.test).toEqual("test object");
                }, function () {});
            }, function () {});
        });
    });

    describe("remove and removeAll", function () {
        it("can remove itself", function () {
            var plugin = plugins.create({"name": "hoge"});

            s.mock(db)
                .expects("saveObject").once()
                .withArgs("phonegap-plugins", []);

            _pluginDB.splice.apply(_pluginDB, [0, 1, plugin]);

            waits(1);
            plugin.remove(function (items) {
                expect(items.length).toEqual(0);
            }, s.mock().never());
        });

        it("can remove all plugins", function () {
            var data = [new Plugin(), new Plugin()];
            data[0].name = "HogePlugin";
            data[1].name = "FubaPlugin";

            _pluginDB.splice.apply(_pluginDB, [0, data.length].concat(data));

            waits(1);
            plugins.removeAll();
            items = plugins.findAll();
            expect(items.length).toEqual(0);
        });
    });

    describe("exec", function () {
        it("can return result json", function () {
            var plugin = plugins.create({"name": "hoge", "action":"get", "result": {"data":1}});

            plugin.exec(plugin.action, plugin.args, function (result) {
                expect(result.data).toEqual(1);
            });
        });

        it("calls error callback when action is not same", function () {
            var plugin = plugins.create({"name": "hoge", "action":"get", "result": {"data":1}});

            plugin.exec('', plugin.args, function () {}, function (error) {
                expect(error).toEqual("could not exec phonegap plugin with (,)");
            });
        });
    });
});
