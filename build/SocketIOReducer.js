/**
 * Created by YS on 2016/11/4.
 */
"use strict";
function RegisterWebSocketGridEventListeners(socket, dispatch, eventList, mapModelNameToModelPath) {
    if (eventList === void 0) { eventList = ["grid/change"]; }
    eventList.forEach(function (event) {
        socket.on(event, function (res) {
            dispatch({
                type: event,
                value: {
                    modelPath: mapModelNameToModelPath(res.modelName),
                    data: res.data
                }
            });
        });
    });
}
exports.RegisterWebSocketGridEventListeners = RegisterWebSocketGridEventListeners;
//# sourceMappingURL=SocketIOReducer.js.map