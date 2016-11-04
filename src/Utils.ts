/**
 * Created by YS on 2016/11/4.
 */


export function getImmuOrPOJO(target,key){
    return (typeof target.get === 'function')?
        target.get(key):target[key]
}
export function setImmuOrPOJO(target,data,key){
    if(typeof target.set === 'function')
        return target.set(key,data);
    else{
        target[key]=data;
        return target
    }
}

export function deepGetState(rootState,...keys){
    return keys.reduce((state,key)=>{
        return getImmuOrPOJO(state,key)
    },rootState)
}

export function deepSetState(state,data,...keys){
    if(!keys || !keys.length) return data;
    let nextKey = keys.shift();
    let prevState = getImmuOrPOJO(state,nextKey);
    let nextState = deepSetState(prevState,data,...keys);
    if(prevState !== nextState)
        return setImmuOrPOJO(state,nextState,nextKey);
    return state;
}

export function keyValueToQueryParams(params:{[id:string]:any}):string{
    return "?"+Object.keys(params).map(key=>{
        return encodeURIComponent(key)+"="+encodeURIComponent(JSON.stringify(params[key]))
    }).join("&")
}