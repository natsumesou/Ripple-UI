var constants = require('ripple/constants'),
    platform = require('ripple/platform'),
    Plugin = require('ripple/platform/phonegap/1.0/Plugin'),
    utils = require('ripple/utils'),
    plugins = require('ripple/platform/phonegap/1.0/plugins'),
    _plugins;
    //db = require('ripple/db');

function _getPluginData() {
    var pluginName = jQuery('#phonegap-plugin-name').val();
    var action = jQuery('#phonegap-plugin-action').val();
    var args = jQuery('#phonegap-plugin-args').val();
    var result = jQuery('#phonegap-plugin-result').val();
    return {
            pluginName: pluginName,
            action: action,
            args: args,
            result: result
    }
}
function _updateSelector() {
    var registeredPlugins = jQuery('#phonegap-plugin-registered');
    jQuery(registeredPlugins).html('<option>----</option>');
    
    if(_plugins){
        _plugins.forEach(function (plugin, key) {
            jQuery(registeredPlugins).append("<option value='"+plugin.pluginName+"'>"+plugin.pluginName+"</option>");
        });
    }
}

module.exports = {
    panel: {
        domId: "phonegapplugins-container",
        collapsed: true,
        pane: "right"
    },
    initialize: function () {
        _plugins = plugins.get();
        _updateSelector();

        var register = jQuery('#phonegap-plugin-register');
        register.bind('click', function() {
            _plugins = plugins.create(_getPluginData());
            _updateSelector();
        });

        var get = jQuery('#phonegap-plugin-get');
        get.bind('click', function() {
            plugins.get();
        });

        var remove = jQuery('#phonegap-plugin-remove');
        remove.bind('click', function() {
            var pluginName = jQuery('#phonegap-plugin-registered option:selected').val();
            _plugins.forEach(function(plugin ,index) {
                if(plugin.pluginName == pluginName){
                    _plugins = plugins.remove(index);
                }
            });
            _updateSelector();
        });
    }
};
