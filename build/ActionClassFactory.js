/**
 * Created by YS on 2016/10/12.
 */
"use strict";
var Utils_1 = require("./Utils");
function modelChangeActionGenerator(dispatch, changes) {
    var changeAction = {
        type: "grid/model/change",
        value: changes
    };
    dispatch(changeAction);
}
function RestfulActionClassFactory(url) {
    return function Action(actionName, actionDef, gridName, config, params, idGetter, modelPath, fetch, mapResToData) {
        var action = function (data, dispatch) {
            var action_url = url;
            var RequestConfig = Object.assign({
                method: actionDef.method || "POST"
            }, config);
            if (actionDef.isStatic)
                action_url += actionName;
            else
                action_url += idGetter(data) + "/" + actionName;
            if (actionDef.data && data)
                RequestConfig.body = JSON.stringify(actionDef.data(data));
            actionDef.params = actionDef.params || (function () { return ({}); });
            var RequestParams = Object.assign({}, params, actionDef.params(data));
            action_url += Utils_1.keyValueToQueryParams(RequestParams);
            var promise = fetch(action_url, RequestConfig).then(function (res) { return res.json(); }).then(function (res) { return mapResToData(res, actionName); });
            if (actionDef.then)
                return promise.then(function (res) {
                    var actionResult = actionDef.then(res, dispatch, modelChangeActionGenerator);
                    if (actionResult !== undefined)
                        modelChangeActionGenerator(dispatch, {
                            modelPath: modelPath,
                            key: idGetter,
                            data: {
                                id: idGetter(data),
                                changes: actionResult
                            }
                        });
                });
            else
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