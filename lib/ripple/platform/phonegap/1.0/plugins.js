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
    return _plugins || db.retrieveObject(_KEY) || _defaultPlugins();
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
    if(!id){
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
    /*
    update: function (properties, index) {
        _plugins.forEach(function (plugin, index) {
            if( plugin.pluginName == properties.pluginName ){
                for(var key in _plugins[index]){
                    _plugins[key] = properties[key];
                }
            }
        });
        return _plugins;
    },
    remove: function (index) {
        _removePlugins(index);
    },
    */
    removeAll: function () {
        _removeAllPlugins();
    },
    find: function (pluginName, success, error) {
        _plugins = _getPlugins();
        console.log(_plugins);
        _plugins.forEach(function (plugin, index) {
            if ( plugin.name === pluginName ) {
                success(plugin);
                return plugin;
            }
        });
        if(error) error('could not find plugin named (' + pluginName + ')');
        return null;
    },
    findAll: function () {
        return _getPlugins();
    },

    /* is it adequate that write exec func in this place */
    exec: function(success, error, plugin, action, args) {
        _plugins = _getPlugins();
        _plugins.forEach(function (plugin, index) {
            console.log(plugin);
        });




        if(plugin == 'Test'){
            if(action == 'get'){
                success({a:'success get'});
            }else{
                success({a:'success else'});
            }
        }else{
            error('Ripple PhoneGap plugin error');
        }
    }
};
