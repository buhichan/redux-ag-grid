/**
 * Created by YS on 2016/10/12.
 */
"use strict";

import {keyValueToQueryParams} from "./Utils"
import Dispatch = Redux.Dispatch;

export interface RestfulActionDef<T> extends BaseActionDef<T>{
    path?:string,
    method?:string,
    params?:(data:T|T[])=>any,
    data?:(data:T|T[])=>any,
    then?:(data:T|T[], res:any)=>any,
    cacheTime?: number //seconds
}

export interface ActionInstance<T> {
    (data?:T|T[]):any,
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

export function RestfulActionClassFactory<T>(url:string){
    return function Action(
        actionName:string,
        actionDef:RestfulActionDef<T>,
        gridName:string,
        config:RequestInit,
        params:{[key:string]:string},
        idGetter,
        modelPath:string[],
        fetch:typeof window.fetch,
        mapResToData,
        dispatch:Dispatch<any>
    ) {
        let RequestConfig = Object.assign({
            method:actionDef.method||"POST"
        },config);
        actionDef.params = actionDef.params || (()=>({}));
        let ActionCacheMap = {};

        const action:ActionInstance<T> = function(data?) {
            let action_url = url+'/';
            if(actionDef.path)
                action_url += actionDef.path.replace(/(:\w+)(?=\/|$)/g,function(match){
                    if(match==='/id') return "/"+idGetter(data);
                    else return data[match.slice(1)] || ""
                })
                ;
            else if(actionDef.isStatic)
                action_url += actionName;
            else
                action_url += idGetter(data)+"/"+actionName;
            if(actionDef.data && data)
                RequestConfig.body = JSON.stringify(actionDef.data(data));
            let RequestParams = Object.assign({},params,actionDef.params(data));
            action_url += keyValueToQueryParams(RequestParams);
            let promise;
            if(actionDef.cacheTime) {
                const cached = ActionCacheMap[action_url];
                if(cached) {
                    const {LastCachedTime, cachedValue} = cached;
                    if (Date.now() - LastCachedTime < actionDef.cacheTime * 1000)
                        promise = Promise.resolve(cachedValue);
                }
            }
            if(!promise)
                promise = fetch(action_url,RequestConfig).then(res=>res.json()).then(res=>{
                    const data = mapResToData(res,actionName);
                    if(actionDef.cacheTime)
                        ActionCacheMap[action_url] = {
                            cachedValue:data,
                            LastCachedTime:Date.now()
                        };
                    return data;
                });
            if(actionDef.then)
                return promise.then(res=>{
                    const actionResult = actionDef.then(data,res);
                    if(actionResult!==undefined) // then it should be regarded as a model change
                        dispatch({
                            type:"grid/model/change",
                            value:{
                                modelPath,
                                key:idGetter,
                                data:{
                                    id:idGetter(data),
                                    changes:actionResult
                                }
                            }
                        });
                    return res;
                });
            else return promise;
        };
        action.enabled = actionDef.enabled;
        action.isStatic = action.useSelected = actionDef.isStatic;
        action.displayName = actionDef.displayName;
        return action;
    }
}