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
    if(_plugins){
        return _plugins;
    } else {
        var plugins = db.retrieveObject(_KEY);
        if(plugins){
            var rawPlugin = new Plugin();
            for(var i in plugins){
                for (var key in rawPlugin) {
                    if (!plugins[i].hasOwnProperty(key)) {
                        plugins[i][key] = rawPlugin[key];
                    }
                }
            }
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
    if(pluginProperties.result){
        try{
            pluginProperties.result = JSON.parse(pluginProperties.result);
        } catch(e) {
            if(error) error('could not parse response json from string ('+pluginProperties.result+')');
        }
    }
    var existIndex = _plugins.reduce(function (result, value, index) {
        return value.name === pluginProperties.name ? index : result;
    }, -1),
        plugin = existIndex >= 0 ? _plugins[existIndex] : new Plugin();
    utils.mixin(pluginProperties, plugin);
    if(existIndex < 0) {
        _plugins.push(plugin);
    }
    _savePlugins();
    self.find(pluginProperties.name, success, error);
});
event.on("phonegap-plugin-remove", function (name, success, error) {
    if(!name){
        error('not found plugin name (' + name + ')');
    }else{
        _plugins = _getPlugins();
        var toDelete = _plugins.reduce(function (result, current, index) {
            return current.name === name ? index : result;
        }, -1);

        if(toDelete >= 0) {
            _plugins.splice(toDelete, 1);
            _savePlugins();
            success();
        } else {
            error('could not find plugin named (' + name + ')');
        }
    }
});

self = module.exports = {
    create: function (properties) {
        _plugins = _getPlugins();
        var plugin = new Plugin();
        utils.forEach(properties, function (value, key) {
            try {
                plugin[key] = JSON.parse(value);
            }
            catch (e) {
                plugin[key] = value;
            }
        });
        _plugins.push(plugin);
        _savePlugins();
        return _plugins;
    },
    removeAll: function () {
        _removeAllPlugins();
    },
    find: function (pluginName, success, error) {
        _plugins = _getPlugins();
        for(var i in _plugins) {
            if ( _plugins[i].name === pluginName ){
                if( success ) success(_plugins[i]);
                return _plugins[i];
            }
        }
        if(error) error('could not find plugin named (' + pluginName + ')');
        return null;
    },
    findAll: function () {
        return _getPlugins();
    }
};
