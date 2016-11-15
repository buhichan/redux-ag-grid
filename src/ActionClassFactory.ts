/**
 * Created by YS on 2016/10/12.
 */
"use strict";

import {keyValueToQueryParams} from "./Utils"
import Dispatch = Redux.Dispatch;
import {GridChangePayload} from "./GridReducer";

export interface RestfulActionDef<T> extends BaseActionDef<T>{
    method?:string,
    params?:(data:T|T[])=>any,
    data?:(data:T|T[])=>any,
    then?:(data:T|T[], dispatch:Dispatch<any>, modelChangeActionGenerator:(dispatch:Dispatch<any>,changes)=>any )=>any
}

export interface ActionInstance<T> {
    (data?:T|T[],dispatch?:Dispatch<any>):Promise<any>,
    displayName?:string,
    isStatic?:boolean,
    enabled?:(data:T)=>boolean,
    useSelected?:boolean
}

export interface BaseActionDef<T>{
    isStatic?:boolean,
    displayName?:string,
    enabled?:(model:T)=>boolean
}

function modelChangeActionGenerator(dispatch, changes:GridChangePayload<any>){
    let changeAction = {
        type:"grid/model/change",
        value:changes
    };
    dispatch(changeAction);
}

export function RestfulActionClassFactory<T>(url:string){
    return function Action(
        actionName:string,
        actionDef:RestfulActionDef<T>,
        gridName:string,
        config:RequestInit,
        params:any,
        idGetter,
        modelPath:string[],
        fetch:typeof window.fetch,
        mapResToData
    ) {
        var action:ActionInstance<T> = function(data?,dispatch?) {
            let action_url = url;
            let RequestConfig = Object.assign({
                method:actionDef.method||"POST"
            },config);
            if(actionDef.isStatic)
                action_url += actionName;
            else
                action_url += idGetter(data)+"/"+actionName;
            if(actionDef.data && data)
                RequestConfig.body = JSON.stringify(actionDef.data(data));
            actionDef.params = actionDef.params || (()=>({}));
            let RequestParams = Object.assign({},params,actionDef.params(data));
            action_url += keyValueToQueryParams(RequestParams);
            let promise =  fetch(action_url,RequestConfig).then(res=>res.json()).then(res=>mapResToData(res,actionName));
            if(actionDef.then)
                return promise.then(res=>{
                    let actionResult = actionDef.then(res as any,dispatch,modelChangeActionGenerator);
                    if(actionResult!==undefined) // then it should be regarded as a model change
                        modelChangeActionGenerator(dispatch,
                            {
                                modelPath,
                                key:idGetter,
                                data:{
                                    id:idGetter(data),
                                    changes:actionResult
                                }
                            })
                });
            else return promise;
        };
        action.enabled = actionDef.enabled;
        action.isStatic = action.useSelected = actionDef.isStatic;
        action.displayName = actionDef.displayName;
        return action;
    }
}