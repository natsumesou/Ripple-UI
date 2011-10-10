var Plugin = require('./Plugin'),
    utils = require('ripple/utils'),
    db = require('ripple/db'),
    event = require('ripple/event'),
    _plugins,
    _KEY = "phonegap-plugins", self;

function _defaultPlugins() {
    return [];
}

function _getPlugins() {
    if (_plugins) {
        return _plugins;
    } else {
        var plugins = db.retrieveObject(_KEY);
        if (plugins) {
            var rawPlugin = new Plugin();
            plugins.forEach(function (plugin, index) {
                for (var key in rawPlugin) {
                    if (!plugin.hasOwnProperty(key)) {
                        plugin[key] = rawPlugin[key];
                    }
                }
            });
            return plugins;
        } else {
            return _defaultPlugins();
        }
    }
}
function _savePlugins() {
    db.saveObject(_KEY, _plugins);
}
function _removePlugins(index) {
    _plugins.splice(index, 1);
    _savePlugins();
    return _plugins;
}
function _removeAllPlugins() {
    _plugins = [];
    _savePlugins();
    return _plugins;
}

event.on("phonegap-plugin-save", function (pluginProperties, success, error) {
    _plugins = _getPlugins();
    try{
        if (pluginProperties.result) {
            pluginProperties.result = JSON.parse(pluginProperties.result);
        }
    } catch(e) {
    }
    var existIndex = _plugins.reduce(function (result, value, index) {
        return value.name === pluginProperties.name ? index : result;
    }, -1),
        plugin = existIndex >= 0 ? _plugins[existIndex] : new Plugin();
    utils.mixin(pluginProperties, plugin);
    if (existIndex < 0) {
        _plugins.push(plugin);
    }
    _savePlugins();
    if (typeof success === "function") success(_getPlugins());
});
event.on("phonegap-plugin-remove", function (name, success, error) {
    _plugins = _getPlugins();
    var toDelete = _plugins.reduce(function (result, current, index) {
        return current.name === name ? index : result;
    }, -1);

    if (toDelete >= 0) {
        _plugins.splice(toDelete, 1);
        _savePlugins();
        if (typeof success === "function") success(_getPlugins());
    }
});

self = module.exports = {
    create: function (properties) {
        var plugin = new Plugin();
        utils.forEach(properties, function (value, key) {
            try {
                plugin[key] = JSON.parse(value);
            }
            catch (e) {
                plugin[key] = value;
            }
        });
        return plugin;
    },
    removeAll: function () {
        _removeAllPlugins();
    },
    find: function (properties, success, error) {
        _plugins = _getPlugins();
        var foundPlugins = [];
        for(var i in _plugins){
            var equal = true;
            for(var key in properties){
                if(_plugins[i][key] !== properties[key]){
                    equal = false;
                }
            }
            if(equal){
                foundPlugins.push(_plugins[i]);
            }
        }

        if(foundPlugins){
            if (typeof success === "function") {
                success(foundPlugins);
            }
        } else {
            if (typeof error === "function") {
                error("not found plugins with given properties");
            }
        }
        return foundPlugins;
    },
    findAll: function () {
        return _getPlugins();
    }
};
