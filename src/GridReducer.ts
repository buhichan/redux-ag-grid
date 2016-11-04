import {deepSetState, deepGetState} from "./Utils";
/**
 * Created by YS on 2016/11/4.
 */

export interface GridActionPayload<T>{
    gridName:string,
    modelPath:string[],
    key:(T:T)=>string
}

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

export function GridReducer<T>(prevState, action:{
    type:string,
    value:GridActionPayload<T>
}) {
    let payload;
    switch (action.type) {
        case "grid/model/get":
            return deepSetState(prevState,(action.value as GridGetPayload<T>).models,...action.value.modelPath);
        case "grid/model/count":
            return deepSetState(prevState,(action.value as GridCountPayload<T>).count,'grid',action.value.gridName,'count');
        case "grid/model/post":
            payload = action.value as GridPostPayload<T>;
            let list = deepGetState(prevState,...payload.modelPath);
            list = list.map((item:T)=>{
                if(action.value.key(item) === action.value.key(payload.model))
                    return payload.model;
                else return item;
            });
            return deepSetState(prevState,list,...payload.modelPath);
        case "grid/model/put":
            payload = action.value as GridPutPayload<T>;
            return deepSetState(prevState,deepGetState(prevState,...payload.modelPath).concat([payload.model]),...payload.modelPath);
        case "grid/model/delete":
            payload = action.value as GridDeletePayload<T>;
            list = deepGetState(prevState,...payload.modelPath);
            list = list.filter((item:T)=>{
                return (action.value.key(item) === action.value.key(payload.model))
            });
            return deepSetState(prevState,list,...payload.modelPath);
        default:
            return prevState
    }
}