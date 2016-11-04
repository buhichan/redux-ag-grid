/**
 * Created by YS on 2016/11/4.
 */

import {Dispatch} from "redux"
import * as socketio from "socket.io-client"
import {deepGetState, deepSetState} from "./Utils";

export interface ChangeEventPayload{
    id:string,
    changes:{
        key:string,
        value:any
    }[]
}

export function SocketIOReducerFactory(
    io: typeof socketio,
    url:string,
    mapModelNameToStoredPath:(modelName:string)=>string[],
    dispatch:Dispatch<any>,
    eventList:string[]=["grid/change"],
    id:(any)=>string = x=>x.key,
) {
    var socket = io(url, {
        'reconnection': true,
        'reconnectionDelay': 1000,
        'reconnectionDelayMax': 5000,
        'reconnectionAttempts': 5
    });
    eventList.forEach(event=>{
        socket.on(event, (res)=> { //event name should be like: "grid/change/products"
            dispatch({
                type:  event,
                value: res
            });
        });
    });
    return function SocketIOReducer(rootState:any, action) {
        let [,eventType,modelName] = action.type.split('/');
        let modelPath = mapModelNameToStoredPath(modelName);
        if(!modelPath)
            throw "Model path is no valid";
        if(eventType === 'change'){
            let models = deepGetState(rootState,...modelPath);
            if(!models[modelName]){
                console.error(`receive change action but has no inital models named ${modelName} :\n`,action,models);
                return rootState;
            }
            models[modelName].every( (model)=>{
                if (id(model) === (action.value as ChangeEventPayload).id) {
                    (action.value as ChangeEventPayload).changes.forEach(change=>{
                        if(change.value)
                            model[change.key] = change.value
                    });
                    return false;
                }
                return true;
            });
            return deepSetState(rootState,models,...modelPath)
        } else return rootState;
    }
}