/**
 * Created by YS on 2016/10/12.
 */
"use strict";
var Utils_1 = require("./Utils");
function RestfulActionClassFactory(url) {
    return function Action(options, configGetter, idGetter) {
        if (idGetter === void 0) { idGetter = function (x) { return x.key; }; }
        var action = function (data) {
            var action_url = url;
            var config = Object.assign({
                method: "POST"
            }, configGetter());
            if (options.isStatic)
                action_url += options.name;
            else
                action_url += idGetter(data) + "/" + options.name;
            if (options.data)
                config.body = JSON.stringify(options.data(data));
            options.params = options.params || (function () { return ({}); });
            var params = Object.assign({}, config.params || {}, options.params(data));
            action_url += Utils_1.keyValueToQueryParams(params);
            return fetch(action_url, Object.assign(config, config)).then(function (res) { return res.json; });
        };
        action.enabled = options.enabled;
        action.isStatic = action.useSelected = options.isStatic;
        action.displayName = options.displayName;
        return action;
    };
}
exports.RestfulActionClassFactory = RestfulActionClassFactory;
//# sourceMappingURL=ActionClassFactory.js.map