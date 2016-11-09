/**
 * Created by YS on 2016/11/4.
 */
"use strict";
var Utils_1 = require("./Utils");
function SocketIOReducerFactory(io, url, mapModelNameToStoredPath, dispatch, eventList, id) {
    if (eventList === void 0) { eventList = ["grid/change"]; }
    if (id === void 0) { id = function (x) { return x.key; }; }
    var socket = io(url, {
        'reconnection': true,
        'reconnectionDelay': 1000,
        'reconnectionDelayMax': 5000,
        'reconnectionAttempts': 5
    });
    eventList.forEach(function (event) {
        socket.on(event, function (res) {
            dispatch({
                type: event,
                value: res
            });
        });
    });
    return function SocketIOReducer(rootState, action) {
        var _a = action.type.split('/'), eventType = _a[1], modelName = _a[2];
        var modelPath = mapModelNameToStoredPath(modelName);
        if (!modelPath)
            throw "Model path is no valid";
        if (eventType === 'change') {
            var models = Utils_1.deepGetState.apply(void 0, [rootState].concat(modelPath));
            if (!models[modelName]) {
                console.error("receive change action but has no inital models named " + modelName + " :\n", action, models);
                return rootState;
            }
            models[modelName].every(function (model) {
                if (id(model) === action.value.id) {
                    action.value.changes.forEach(function (change) {
                        if (change.value)
                            model[change.key] = change.value;
                    });
                    return false;
                }
                return true;
            });
            return Utils_1.deepSetState.apply(void 0, [rootState, models].concat(modelPath));
        }
        else
            return rootState;
    };
}
exports.SocketIOReducerFactory = SocketIOReducerFactory;
//# sourceMappingURL=SocketIOReducer.js.map