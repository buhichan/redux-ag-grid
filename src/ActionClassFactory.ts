/**
 * Created by YS on 2016/10/12.
 */
"use strict";

import {keyValueToQueryParams} from "./Utils"
import {InstanceAction} from "./Grid";

export interface RestfulActionDef<T> extends BaseActionDef<T>{
    path?:string,
    method?:string,
    params?:(data:T|T[])=>any,
    data?:(data:T|T[])=>any,
    cacheTime?: number //seconds
}

export interface ActionInstance<T> {
    (data?:T|T[],e?:Event):any,
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

type ActionCache = {
    [action_url:string]:{
        LastCachedTime:number,
        cachedPromise:Promise<any>}
};

export function RestfulActionClassFactory<T>(url:string){
    return function Action(
        actionName:string,
        actionDef:RestfulActionDef<T>,
        gridName:string,
        config:RequestInit,
        getQuery:()=>{[key:string]:string},
        idGetter,
        modelPath:string[],
        fetch:typeof window.fetch,
        mapResToData,
        dispatch:(action:any)=>void
    ) {
        let RequestConfig = Object.assign({
            method:actionDef.method||"POST"
        },config);
        actionDef.params = actionDef.params || (()=>({}));
        let ActionCacheMap = {} as ActionCache;

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
            let RequestParams = Object.assign({},getQuery(),actionDef.params(data));
            action_url += keyValueToQueryParams(RequestParams);
            let promise;
            if(actionDef.cacheTime) {
                const cached = ActionCacheMap[action_url];
                if(cached) {
                    const {LastCachedTime, cachedPromise} = cached;
                    if (Date.now() - LastCachedTime < actionDef.cacheTime * 1000)
                        promise = cachedPromise;
                }
            }
            if(!promise) {
                promise = fetch(action_url, RequestConfig).then(res => res.json()).then(res => {
                    return mapResToData(res, actionDef['_idGetter'] || actionName);
                });
                if (actionDef.cacheTime)
                    ActionCacheMap[action_url] = {
                        cachedPromise: promise,
                        LastCachedTime: Date.now()
                    };
            }
            return promise;
        };
        action.enabled = actionDef.enabled;
        action.isStatic = action.useSelected = actionDef.isStatic;
        action.displayName = actionDef.displayName;
        return action;
    }
}