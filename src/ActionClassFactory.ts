/**
 * Created by YS on 2016/10/12.
 */
"use strict";

import {keyValueToQueryParams} from "./Utils"

export interface ActionOptions<T>{
    static:boolean,
    displayName:string,
    enabled:(model:T)=>boolean
}

export function RestfulActionClassFactory(url:string){
    return function Action(actionName:string,options:ActionOptions<any>,configGetter:()=>RequestInit&{params:any},payload=x=>x,idGetter=x=>x.key){
        var action = function(data) {
            let action_url = url;
            let config = configGetter();
            if(options.static)
                action_url += actionName;
            else
                action_url += idGetter(data)+"/"+actionName;
            if(config.params)
                action_url += keyValueToQueryParams(config.params);
            return fetch(action_url,Object.assign(config,{
                body:JSON.stringify(payload(data))
            })).then(res=>res.json)
        };
        Object.assign(action,options);
        return action;
    }
}