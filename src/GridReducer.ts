import {deepSetState, deepGetState} from "./Utils";
/**
 * Created by YS on 2016/11/4.
 */

import {List,Map,Repeat} from "immutable"

export interface GridActionPayload<T>{
    modelPath:string[],
    key:(T:T)=>string
}

export type GridActionTypes = "grid/model/get"|"grid/model/count"|"grid/model/post"|"grid/model/put"|"grid/model/delete"|"grid/model/change"

export interface GridGetPayload<T> extends GridActionPayload<T>{
    models:T[],
    offset:number
}

export interface GridPutPayload<T> extends GridActionPayload<T>{
    model:T
}

export interface GridDeletePayload<T> extends GridActionPayload<T>{
    model:T
}

export interface GridPostPayload<T> extends GridActionPayload<T>{
    model:T
}

export interface GridCountPayload<T> extends GridActionPayload<T>{
    count:number
}

export interface GridChangePayload<T> extends GridActionPayload<T>{
    data: {
        id: string,
        changes: {[key: string]: any}
    }
}

export function GridReducer<T>(rootState, action: {
    type: GridActionTypes,
    value: GridActionPayload<T>
}) {
    let payload,list:List<T>,index;
    switch (action.type) {
        case "grid/model/get":
            payload = action.value as GridGetPayload<T>;
            if(payload.offset===null)
                return deepSetState(rootState, List(payload.models), ...payload.modelPath);
            else {
                let prev = deepGetState(rootState,...payload.modelPath) as List<T>;
                if(prev.size < payload.offset)
                    prev = prev.concat(Repeat(null,payload.offset-prev.size)) as List<T>;
                return deepSetState(rootState, prev.splice(payload.offset,payload.models.length,...payload.models), ...payload.modelPath)
            }
        case "grid/model/count":
            payload = action.value as GridCountPayload<T>;
            const gridInfo = deepGetState(rootState,'grid',payload.gridName);
            const newValue = Map({
                count:payload.count,
                countedTime:Date.now()
            });
            return deepSetState(rootState, gridInfo?gridInfo.merge(newValue):newValue,'grid',payload.gridName);
        case "grid/model/put":
            payload = action.value as GridPostPayload<T>;
            list = deepGetState(rootState,...payload.modelPath);
            if(!list) return deepSetState(rootState,List([payload]),...payload.modelPath);
            index = list.findIndex(entry=>payload.key(entry)===payload.key(payload.model));
            if(index<0) return deepSetState(rootState,list.push(payload.model),...payload.modelPath);
            if(index>=0) {
                return deepSetState(rootState, list.set(index, payload.model), ...payload.modelPath);
            }else return rootState;
        case "grid/model/post":
            payload = action.value as GridPutPayload<T>;
            list = deepGetState(rootState,...payload.modelPath);
            if(!list)
                list = List([]);
            else if(!list.insert)
                list = List(list);
            return deepSetState(rootState,list.insert(0,payload.model),...payload.modelPath);
        case "grid/model/delete":
            payload = action.value as GridDeletePayload<T>;
            list = deepGetState(rootState, ...payload.modelPath);
            let i = list.findIndex((item: T)=> {
                return (action.value.key(item) === action.value.key(payload.model))
            });
            if(i>=0)
                list = list.delete(i);
            return deepSetState(rootState, list, ...payload.modelPath);
        case "grid/model/change":
            payload = action.value as GridChangePayload<T>;
            list = deepGetState(rootState, ...payload.modelPath);
            index = list.findIndex(entry=>payload.key(entry)===payload.data.id);
            if(index>=0) {
                return deepSetState(rootState, list.update(index, (item:T)=>{
                    let AllEqual = Object.keys(payload.data.changes).every(key=>{
                        return (payload.data.changes[key]===item[key]);
                    });
                    return AllEqual?item:Object.assign({},item,payload.data.changes);
                }), ...payload.modelPath);
            }else return rootState;
        default:
            return rootState
    }
}