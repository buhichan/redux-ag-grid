/**
 * Created by YS on 2016/10/12.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Utils_1 = require("./Utils");
function RestfulActionClassFactory(url) {
    return function Action(actionName, actionDef, gridName, config, getQuery, idGetter, modelPath, fetch, mapResToData, dispatch) {
        var RequestConfig = Object.assign({
            method: actionDef.method || "POST"
        }, config);
        actionDef.params = actionDef.params || (function () { return ({}); });
        var ActionCacheMap = {};
        var action = function (data) {
            var action_url = url + '/';
            if (actionDef.path)
                action_url += actionDef.path.replace(/(:\w+)(?=\/|$)/g, function (match) {
                    if (match === '/id')
                        return "/" + idGetter(data);
                    else
                        return data[match.slice(1)] || "";
                });
            else if (actionDef.isStatic)
                action_url += actionName;
            else
                action_url += idGetter(data) + "/" + actionName;
            if (actionDef.data && data)
                RequestConfig.body = JSON.stringify(actionDef.data(data));
            var RequestParams = Object.assign({}, getQuery(), actionDef.params(data));
            action_url += Utils_1.keyValueToQueryParams(RequestParams);
            var promise;
            if (actionDef.cacheTime) {
                var cached = ActionCacheMap[action_url];
                if (cached) {
                    var LastCachedTime = cached.LastCachedTime, cachedPromise = cached.cachedPromise;
                    if (Date.now() - LastCachedTime < actionDef.cacheTime * 1000)
                        promise = cachedPromise;
                }
            }
            if (!promise) {
                promise = fetch(action_url, RequestConfig).then(function (res) { return res.json(); }).then(function (res) {
                    return mapResToData(res, actionDef['_idGetter'] || actionName);
                });
                if (actionDef.cacheTime)
                    ActionCacheMap[action_url] = {
                        cachedPromise: promise,
                        LastCachedTime: Date.now()
                    };
            }
            return promise;
        };
        action.enabled = actionDef.enabled;
        action.isStatic = action.useSelected = actionDef.isStatic;
        action.displayName = actionDef.displayName;
        return action;
    };
}
exports.RestfulActionClassFactory = RestfulActionClassFactory;
//# sourceMappingURL=ActionClassFactory.js.map