/**
 * Created by YS on 2016/11/4.
 */
"use strict";
import {RestfulActionClassFactory, RestfulActionDef, ActionInstance} from "./ActionClassFactory"
import {GridFilter} from "./Grid"
import {keyValueToQueryParams} from "./Utils";
import {Dispatch} from "redux";

export type APIType = 'NodeRestful' | 'Loopback' | 'Swagger' | null

export interface Resource<T>{
    get?:(id?)=>Promise<void>,
    post?:(model:T)=>Promise<void>,
    put?:(model:T)=>Promise<void>,
    delete?:(model:T)=>Promise<void>
    count?:()=>Promise<void>
    filter?:(filter:GridFilter)=>void
}

export interface ActionResourceOptions<T>{
    key?:(model:T)=>string,
    params?:(filter:GridFilter)=>({[id:string]:any}),
    methods?:Resource<T>,
    apiType?:APIType,
    fetch?:typeof fetch,
    mapResToData?:(data:any,methodType?:"post"|"get"|"count"|"put"|"delete")=>any
}

export class RestfulResource<Model,Actions> implements Resource<Model>{
    params = {};
    options:ActionResourceOptions<Model>;
    config: RequestInit= {};
    actions: Actions & {[actionName:string]:ActionInstance<Model>};
    modelPath:string[];
    gridName:string;

    get?:(id?)=>Promise<void>;
    post?:(model:Model)=>Promise<void>;
    put?:(model:Model)=>Promise<void>;
    delete?:(model:Model)=>Promise<void>;
    count?:()=>Promise<void>;

    _fetch:typeof window.fetch;
    constructor({
        url,
        modelPath,
        dispatch,
        options={},
        actions,
    }:{
        url:string,
        modelPath:string[],
        dispatch:Dispatch<any>,
        options:ActionResourceOptions<Model>
        actions?:Actions & {[actionName:string]:RestfulActionDef<Model>},
    }){
        if (url.substr(-1) !== '/') url += '/';
        options.methods = options.methods || {};
        options.key = options.key || (x=>x['id']);
        options.mapResToData = options.mapResToData || (x=>x);
        this._fetch = options.fetch || window.fetch;
        this.options = options;
        this.modelPath = modelPath;
        switch(options.apiType){
            case "NodeRestful": {
                options.params = options.params || function(filter){
                        let _filter:NodeRestful.Params = {};
                        filter.search.forEach(function(condition){
                            let key = condition.field.replace(/\[[^\]]*\]/,'');
                            if(/^\/.*\/$/.test(condition.value))
                                _filter[key+"__regex"]=condition.value;
                            else
                                _filter[key+"__equals"]=condition.value;
                        });
                        if(filter.pagination){
                            _filter.offset = filter.pagination.offset;
                            _filter.limit = filter.pagination.limit;
                        }
                        if(filter.sort && filter.sort.field){
                            let field = filter.sort.field.replace(/\[[^\]]*\]/,'');
                            _filter.sort = (filter.sort.reverse?"-":"")+ field
                        }
                        return _filter;
                    };
                options.key = (x=>x["_id"]);
                break;
            }
            case "Loopback": {
                options.params = options.params || function(filter){
                    let _filter:Loopback.Params = {where:{}};
                    filter.search.forEach(function(condition){
                        if(/^\/.*\/$/.test(condition.value))
                            _filter.where[condition.field]={like:condition.value.slice(1,-1)};
                        else
                            _filter.where[condition.field]=condition.value;
                    });
                    if(filter.pagination) {
                        _filter.offset = filter.pagination.offset;
                        _filter.limit = filter.pagination.limit;
                    }
                    if(filter.sort.field)
                        _filter.order = filter.sort.field+(filter.sort.reverse?" DESC":" ASC");
                    else
                        _filter.order = null;
                    return {filter:_filter};
                };
                options.methods.count = options.methods.count || (()=> {
                    if (this.params && this.params['filter'])
                        this.params['where'] = this.params['filter'].where;
                    return this._fetch(url + '/count'+keyValueToQueryParams(options.params(this.params)),this.config)
                        .then(res=>res.json()).then(options.mapResToData).then((res)=>{
                        dispatch({
                            type:"grid/model/count",
                            value:{
                                modelPath,
                                gridName:this.gridName,
                                count:res
                            }
                        })
                    });
                });
                break;
            }
            case "Swagger":{
                options.params = options.params || ((filter)=>{
                    let params = {};
                    if(filter.pagination) {
                        params['page'] = (filter.pagination.offset/filter.pagination.limit+1);
                        params['perPage'] = filter.pagination.limit;
                    }
                    if(filter.sort)
                        params['order'] = (filter.sort.field + filter.sort.reverse?" DESC":" ASC");
                    return params;
                });
                break;
            }
        }
        //TODO catch exception
        this.get = options.methods.get || ((id?)=>{
                return this._fetch(url+(id!==undefined?id:"")+keyValueToQueryParams(this.params),this.config)
                    .then(res=>res.json()).then((res)=>{
                    dispatch({
                        type:"grid/model/get",
                        value:{
                            modelPath,
                            key:options.key,
                            models:options.mapResToData(res,'get')
                        }
                    });
                    return res;
                },this.errorHandler.bind(this))
            });
        this.count = options.methods.count || (()=>{
                return this._fetch(url + 'count'+keyValueToQueryParams(this.params),this.config)
                    .then(res=>res.json()).then((res)=>{
                    dispatch({
                        type:"grid/model/count",
                        value:{
                            modelPath,
                            gridName:this.gridName,
                            key:options.key,
                            count:options.mapResToData(res,'count')
                        }
                    });
                    return res;
                },this.errorHandler.bind(this))
            });
        this.delete = options.methods.delete || ((data)=>{
                return this._fetch(url + options.key(data), Object.assign({},this.config,{
                    method:"DELETE"
                })).then(res=>res.json()).then((res)=>{
                    if(options.mapResToData(res,'delete'))
                        dispatch({
                            type:"grid/model/delete",
                            value:{
                                modelPath,
                                key:options.key,
                                model:data
                            }
                        });
                    return res;
                },this.errorHandler.bind(this))
            });
        this.put= options.methods.put || ((data)=>{
                if(!options.key(data))
                    return this['post'](data);
                else
                    return this._fetch(url +options.key(data), Object.assign({},this.config,{
                        method:"PUT",
                        body:JSON.stringify(data)
                    })).then(res=>res.json()).then((res)=>{
                        dispatch({
                            type:"grid/model/put",
                            value:{
                                modelPath,
                                key:options.key,
                                model:options.mapResToData(res,'put')
                            }
                        });
                        return res;
                    },this.errorHandler.bind(this))
            });
        this.post= options.methods.post || ((data)=>{
                return this._fetch(url, Object.assign({},this.config,{
                    method:"POST",
                    body:JSON.stringify(data)
                })).then(res=>res.json()).then((res)=>{
                    dispatch({
                        type:"grid/model/post",
                        value:{
                            modelPath,
                            key:options.key,
                            model:options.mapResToData(res,'post')
                        }
                    });
                    return res;
                },this.errorHandler.bind(this))
            });

        if(actions) {
            let Action = RestfulActionClassFactory(url);
            this.actions = {} as any;
            Object.keys(actions).forEach((actionName)=> {
                this.actions[actionName]=Action(actionName,actions[actionName],this.gridName,this.config,this.params,this.options.key,modelPath,this._fetch,this.options.mapResToData)
            });
        }
    }
    errorHandler(err){
        throw err;
    }
    filter(_filter){
        this.params = this.options.params?this.options.params(_filter):_filter;
    }
}