var event = require('ripple/event');

module.exports = function (
        success,
        error,
        name,
        action,
        args,
        result,
        id
) {
    return ({
        id: id || Math.uuid(undefined, 16),
        success: success || null,
        error: error || null,
        name: name || "",
        action: action || "",
        args: args || [],
        result: result || {},
        save: function(success, error) {
            var _self = this;
            if(!this.id){
                this.id = Math.uuid(undefined, 16);
            }
            event.trigger("phonegap-plugin-save", [this, success, error]);
        },
        remove: function(success, error) {
            event.trigger("phonegap-plugin-remove", [this.id, success, error]);
        }
    });
}
