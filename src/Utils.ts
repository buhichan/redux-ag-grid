import {isNullOrUndefined} from "util";
/**
 * Created by YS on 2016/11/4.
 */


export function getImmuOrPOJO(target,key){
    if(!target) return null;
    return (typeof target.get === 'function')?
        target.get(key):target[key]
}
export function setImmuOrPOJO(target,data,key){
    if(!target) return null;
    if(typeof target.set === 'function')
        return target.set(key,data);
    else{
        target[key]=data;
        return target
    }
}

export function deepGet(obj:any,path:string){
    const pathAsArray = path.split(/\.|\[|\]/g);
    let result=obj;
    for(let i=0;i<pathAsArray.length;i++){
        if(pathAsArray[i]!==""){
            result = result[pathAsArray[i]];
            if(result === null || result === undefined)
                return result;
        }
    }
    return result;
}

export function deepGetState(rootState,...keys){
    return keys.reduce((state,key)=>{
        return getImmuOrPOJO(state,key)
    },rootState)
}

export function deepSetState(state,data,...keys){
    if(!keys || !keys.length) return data;
    let nextKey = keys.shift();
    let prevState = getImmuOrPOJO(state,nextKey) || {};
    let nextState = deepSetState(prevState,data,...keys);
    if(prevState !== nextState)
        return setImmuOrPOJO(state,nextState,nextKey);
    return state;
}

export function keyValueToQueryParams(params?:{[id:string]:any}):string{
    let keys = Object.keys(params);
    if(!keys.length) return "";
    else
    return "?"+Object.keys(params).map(key=>{

        if(params[key] instanceof Array){
            key = encodeURIComponent(key);
            return params[key].map((entry)=>{
                return key+"[]="+encodeURIComponent(entry)
            }).join("&")
        }else {
            const value = typeof params[key] === 'object' ?
                JSON.stringify(params[key]) : params[key];
            return encodeURIComponent(key) + "=" + encodeURIComponent(value)
        }
    }).join("&")
}