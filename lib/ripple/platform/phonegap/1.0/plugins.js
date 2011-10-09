var Plugin = require('./Plugin'),
    db = require('ripple/db'),
    utils = require('ripple/utils'),
    _plugins,
    _KEY = "phonegap-plugins";


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

module.exports = {
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
    remove: function (index) {
        _removePlugins(index);
    },
    removeAll: function () {
        _removeAllPlugins();
    },
    get: function () {
        return _getPlugins();
    },
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
