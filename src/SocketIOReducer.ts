/**
 * Created by YS on 2016/11/4.
 */

import {Dispatch} from "redux"
import Socket = SocketIOClient.Socket;

type GridWSEventPayload={
    modelName:string,
    data:any
}

export function RegisterWebSocketGridEventListeners(
    socket: Socket,
    dispatch:Dispatch<any>,
    eventList:string[]=["grid/change"],
    mapModelNameToModelPath:(modelName:string)=>string[]
) {
    eventList.forEach(event=>{
        socket.on(event, (res:GridWSEventPayload)=> { //event name should be like: "grid/change/products"
            dispatch({
                type:  event,
                value: {
                    modelPath:mapModelNameToModelPath(res.modelName),
                    data:res.data
                }
            });
        });
    });
}