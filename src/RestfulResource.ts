/**
 * Created by YS on 2016/11/4.
 */
"use strict";
import {RestfulActionClassFactory, RestfulActionDef, ActionInstance} from "./ActionClassFactory"
import {GridFilter} from "./Grid"
import {keyValueToQueryParams} from "./Utils";
import {Dispatch} from "redux";

export type APIType = 'NodeRestful' | 'Loopback' | '' | null

export interface Resource<T>{
    get?:()=>Promise<void>,
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
    apiType?:APIType
}

export class RestfulResource<T> implements Resource<T>{
    params = {};
    config: RequestInit & {params:any} = {params:{}};
    actions: ActionInstance<T>[];
    constructor(
        url:string,
        modelPath:string[],
        gridName:string,
        dispatch:Dispatch<any>,
        actions:RestfulActionDef<T>[],
        public options:ActionResourceOptions<T>={}
    ){
        if (url.substr(-1) !== '/') url += '/';
        options.methods = options.methods || {};
        options.key = options.key || (x=>x['id']);
        options.params = (filter)=>{
            return filter
        };
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
                        if (this.config.params && this.config.params.filter)
                            this.config.params.where = this.config.params.filter.where;
                        return fetch(url + '/count'+keyValueToQueryParams(options.params(this.config.params)),this.config).then(res=>res.json()).then((res)=>{
                            dispatch({
                                type:"grid/model/count",
                                value:{
                                    modelPath,
                                    gridName,
                                    count:res.count
                                }
                            })
                        });
                    });
                break;
            }
        }
        //TODO catch exception
        this['get'] = options.methods.get || (()=>{
                return fetch(url+keyValueToQueryParams(this.config.params),this.config).then(res=>res.json()).then((res)=>{
                    dispatch({
                        type:"grid/model/get",
                        value:{
                            modelPath,
                            gridName,
                            key:options.key,
                            models:res
                        }
                    })
                },this.errorHandler.bind(this))
            });
        this['count'] = options.methods.count || (()=>{
                return fetch(url + '/count'+keyValueToQueryParams(this.config.params),this.config).then(res=>res.json()).then((res)=>{
                    dispatch({
                        type:"grid/model/count",
                        value:{
                            modelPath,
                            gridName,
                            key:options.key,
                            count:res
                        }
                    })
                },this.errorHandler.bind(this))
            });
        this['delete'] = options.methods.delete || ((data)=>{
                return fetch(url + '/' + options.key(data)+keyValueToQueryParams(this.config.params), Object.assign(this.config,{
                    method:"DELETE"
                })).then(res=>res.json()).then((res)=>{
                    if(res)
                        dispatch({
                            type:"grid/model/delete",
                            value:{
                                modelPath,
                                gridName,
                                key:options.key,
                                model:data
                            }
                        });
                },this.errorHandler.bind(this))
            });
        this['put']= options.methods.put || ((data)=>{
                if(!options.key(data))
                    return this['post'](data);
                else
                    return fetch(url + '/' +options.key(data)+keyValueToQueryParams(this.config.params), Object.assign(this.config,{
                        body:JSON.stringify(data)
                    })).then(res=>res.json()).then((res)=>{
                        dispatch({
                            type:"grid/model/put",
                            value:{
                                modelPath,
                                gridName,
                                key:options.key,
                                model:res
                            }
                        })
                    },this.errorHandler.bind(this))
            });
        this['post']= options.methods.post || ((data)=>{
                return fetch(url+keyValueToQueryParams(this.config.params), Object.assign(this.config,{
                    body:JSON.stringify(data)
                })).then(res=>res.json()).then((res)=>{
                    dispatch({
                        type:"grid/model/post",
                        value:{
                            modelPath,
                            gridName,
                            key:options.key,
                            model:res
                        }
                    })
                },this.errorHandler.bind(this))
            });

        if(actions) {
            let Action = RestfulActionClassFactory(url);
            this.actions = actions.map((action)=> {
                return Action(action,()=>this.config,this.options.key)
            });
        }
    }
    errorHandler(err){
        throw err;
    }
    filter(_filter){
        this.config.params = this.options.params?this.options.params(_filter):_filter;
    }
}