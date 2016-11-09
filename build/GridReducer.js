"use strict";
var Utils_1 = require("./Utils");
function GridReducer(prevState, action) {
    var payload;
    switch (action.type) {
        case "grid/model/get":
            return Utils_1.deepSetState.apply(void 0, [prevState, action.value.models].concat(action.value.modelPath));
        case "grid/model/count":
            return Utils_1.deepSetState(prevState, action.value.count, 'grid', action.value.gridName, 'count');
        case "grid/model/post":
            payload = action.value;
            var list = Utils_1.deepGetState.apply(void 0, [prevState].concat(payload.modelPath));
            list = list.map(function (item) {
                if (action.value.key(item) === action.value.key(payload.model))
                    return payload.model;
                else
                    return item;
            });
            return Utils_1.deepSetState.apply(void 0, [prevState, list].concat(payload.modelPath));
        case "grid/model/put":
            payload = action.value;
            return Utils_1.deepSetState.apply(void 0, [prevState, Utils_1.deepGetState.apply(void 0, [prevState].concat(payload.modelPath)).concat([payload.model])].concat(payload.modelPath));
        case "grid/model/delete":
            payload = action.value;
            list = Utils_1.deepGetState.apply(void 0, [prevState].concat(payload.modelPath));
            list = list.filter(function (item) {
                return (action.value.key(item) === action.value.key(payload.model));
            });
            return Utils_1.deepSetState.apply(void 0, [prevState, list].concat(payload.modelPath));
        default:
            return prevState;
    }
}
exports.GridReducer = GridReducer;
//# sourceMappingURL=GridReducer.js.map