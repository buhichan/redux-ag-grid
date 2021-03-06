"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Utils_1 = require("./Utils");
/**
 * Created by YS on 2016/11/4.
 */
var immutable_1 = require("immutable");
function GridReducer(rootState, action) {
    var payload, list, index;
    switch (action.type) {
        case "grid/model/get":
            payload = action.value;
            if (payload.offset === null)
                return Utils_1.deepSetState.apply(void 0, [rootState, immutable_1.List(payload.models)].concat(payload.modelPath));
            else {
                var prev = Utils_1.deepGetState.apply(void 0, [rootState].concat(payload.modelPath));
                if (prev.size < payload.offset)
                    prev = prev.concat(immutable_1.Repeat(null, payload.offset - prev.size));
                return Utils_1.deepSetState.apply(void 0, [rootState, prev.splice.apply(prev, [payload.offset, payload.models.length].concat(payload.models))].concat(payload.modelPath));
            }
        case "grid/model/count":
            payload = action.value;
            var gridInfo = Utils_1.deepGetState(rootState, 'grid', payload.gridName);
            var newValue = immutable_1.Map({
                count: payload.count,
                countedTime: Date.now()
            });
            return Utils_1.deepSetState(rootState, gridInfo ? gridInfo.merge(newValue) : newValue, 'grid', payload.gridName);
        case "grid/model/put":
            payload = action.value;
            list = Utils_1.deepGetState.apply(void 0, [rootState].concat(payload.modelPath));
            if (!list)
                return Utils_1.deepSetState.apply(void 0, [rootState, immutable_1.List([payload])].concat(payload.modelPath));
            index = list.findIndex(function (entry) { return payload.key(entry) === payload.key(payload.model); });
            if (index < 0)
                return Utils_1.deepSetState.apply(void 0, [rootState, list.push(payload.model)].concat(payload.modelPath));
            if (index >= 0) {
                return Utils_1.deepSetState.apply(void 0, [rootState, list.set(index, payload.model)].concat(payload.modelPath));
            }
            else
                return rootState;
        case "grid/model/post":
            payload = action.value;
            list = Utils_1.deepGetState.apply(void 0, [rootState].concat(payload.modelPath));
            if (!list)
                list = immutable_1.List([]);
            else if (!list.insert)
                list = immutable_1.List(list);
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
            index = list.findIndex(function (entry) { return payload.key(entry) === payload.data.id; });
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