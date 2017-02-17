import {deepSetState, deepGetState} from "./Utils";
/**
 * Created by YS on 2016/11/4.
 */

import {List} from "immutable"

export interface GridActionPayload<T>{
    modelPath:string[],
    key:(T:T)=>string
}

export type GridActionTypes = "grid/model/get"|"grid/model/count"|"grid/model/post"|"grid/model/put"|"grid/model/delete"|"grid/model/change"

export interface GridGetPayload<T> extends GridActionPayload<T>{
    models:T[]
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
            return deepSetState(rootState, List((action.value as GridGetPayload<T>).models), ...action.value.modelPath);
        case "grid/model/count":
            payload = action.value as GridCountPayload<T>;
            return deepSetState(rootState, payload.count, 'grid', 'counts' ,payload._modelPath);
        case "grid/model/put":
            payload = action.value as GridPostPayload<T>;
            list = deepGetState(rootState,...payload._modelPath);
            if(!list) return deepSetState(rootState,List([payload]),...payload._modelPath);
            index = list.findIndex(entry=>payload.key(entry)===payload.key(payload.model));
            if(index<0) return deepSetState(rootState,list.push(payload.model),...payload._modelPath);
            if(index>=0) {
                return deepSetState(rootState, list.set(index, payload.model), ...payload._modelPath);
            }else return rootState;
        case "grid/model/post":
            payload = action.value as GridPutPayload<T>;
            list = deepGetState(rootState,...payload._modelPath);
            if(!list)
                list = List([]);
            else if(!list.insert)
                list = List(list);
            return deepSetState(rootState,list.insert(0,payload.model),...payload._modelPath);
        case "grid/model/delete":
            payload = action.value as GridDeletePayload<T>;
            list = deepGetState(rootState, ...payload._modelPath);
            let i = list.findIndex((item: T)=> {
                return (action.value.key(item) === action.value.key(payload.model))
            });
            if(i>=0)
                list = list.delete(i);
            return deepSetState(rootState, list, ...payload._modelPath);
        case "grid/model/change":
            payload = action.value as GridChangePayload<T>;
            list = deepGetState(rootState, ...payload._modelPath);
            index = list.findIndex(entry=>payload.key(entry)===payload.data.id);
            if(index>=0) {
                return deepSetState(rootState, list.update(index, (item:T)=>{
                    let AllEqual = Object.keys(payload.data.changes).every(key=>{
                        return (payload.data.changes[key]===item[key]);
                    });
                    return AllEqual?item:Object.assign({},item,payload.data.changes);
                }), ...payload._modelPath);
            }else return rootState;
        default:
            return rootState
    }
}