module.exports = function (
        success,
        error,
        pluginName,
        action,
        args,
        result
) {
    return ({
        success: success || null,
        error: error || null,
        pluginName: pluginName || "",
        action: action || "",
        args: args || [],
        result: result || {}
    });
}
