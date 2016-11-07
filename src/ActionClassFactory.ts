/**
 * Created by YS on 2016/10/12.
 */
"use strict";

import {keyValueToQueryParams} from "./Utils"
import Dispatch = Redux.Dispatch;

export interface RestfulActionDef<T> extends BaseActionDef<T>{
    name:string,
    displayName:string,
    params:(data:T|T[])=>any,
    data:(data:T|T[])=>any
}

export type ActionInstance<T> = {
    (data?:T|T[],dispatch?:Dispatch<any>):any,
    displayName?:string,
    isStatic?:boolean,
    enabled?:(data:T)=>boolean,
    useSelected?:boolean
}

export interface BaseActionDef<T>{
    isStatic?:boolean,
    displayName:string,
    enabled:(model:T)=>boolean
}

export function RestfulActionClassFactory<T>(url:string){
    return function Action(options:RestfulActionDef<T>, configGetter:()=>RequestInit&{params:any},idGetter= x=>x.key) {
        var action:ActionInstance<T> = function(data) {
            let action_url = url;
            let config = Object.assign({
                method:"POST"
            },configGetter());
            if(options.isStatic)
                action_url += options.name;
            else
                action_url += idGetter(data)+"/"+options.name;
            if(options.data)
                config.body = JSON.stringify(options.data(data));
            options.params = options.params || (()=>({}));
            let params = Object.assign({},config.params||{},options.params(data));
            action_url += keyValueToQueryParams(params);
            return fetch(action_url,Object.assign(config,config)).then(res=>res.json)
        };
        action.enabled = options.enabled;
        action.isStatic = action.useSelected = options.isStatic;
        action.displayName = options.displayName;
        return action;
    }
}