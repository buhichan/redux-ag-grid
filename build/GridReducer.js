"use strict";
var Utils_1 = require("./Utils");
/**
 * Created by YS on 2016/11/4.
 */
var immutable_1 = require("immutable");
function GridReducer(rootState, action) {
    var payload, list;
    switch (action.type) {
        case "grid/model/get":
            return Utils_1.deepSetState.apply(void 0, [rootState, immutable_1.List(action.value.models)].concat(action.value.modelPath));
        case "grid/model/count":
            payload = action.value;
            return Utils_1.deepSetState(rootState, payload.count, 'grid', 'counts', payload.modelPath);
        case "grid/model/put":
            payload = action.value;
            list = Utils_1.deepGetState.apply(void 0, [rootState].concat(payload.modelPath));
            var index = list.findIndex(function (entry) { return payload.key(entry) === payload.key(payload.model); });
            if (index >= 0) {
                return Utils_1.deepSetState.apply(void 0, [rootState, list.set(index, payload.model)].concat(payload.modelPath));
            }
            else
                return rootState;
        case "grid/model/post":
            payload = action.value;
            list = Utils_1.deepGetState.apply(void 0, [rootState].concat(payload.modelPath));
            return Utils_1.deepSetState.apply(void 0, [rootState, list.insert(0, payload.model)].concat(payload.modelPath));
        case "grid/model/delete":
            payload = action.value;
            list = Utils_1.deepGetState.apply(void 0, [rootState].concat(payload.modelPath));
            var i = list.findIndex(function (item) {
                return (action.value.key(item) === action.value.key(payload.model));
            });
            if (i >= 0)
                list = list.delete(i);
            return Utils_1.deepSetState.apply(void 0, [rootState, list].concat(payload.modelPath));
        case "grid/model/change":
            payload = action.value;
            list = Utils_1.deepGetState.apply(void 0, [rootState].concat(payload.modelPath));
            var index = list.findIndex(function (entry) { return payload.key(entry) === payload.data.id; });
            if (index >= 0) {
                return Utils_1.deepSetState.apply(void 0, [rootState, list.update(index, function (item) {
                    var AllEqual = Object.keys(payload.data.changes).every(function (key) {
                        return (payload.data.changes[key] === item[key]);
                    });
                    return AllEqual ? item : Object.assign({}, item, payload.data.changes);
                })].concat(payload.modelPath));
            }
            else
                return rootState;
        default:
            return rootState;
    }
}
exports.GridReducer = GridReducer;
//# sourceMappingURL=GridReducer.js.map