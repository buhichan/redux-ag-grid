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
}

export class RestfulResource<Model,Actions> implements Resource<Model>{
    params:(...args:any[])=>any;
    options:ActionResourceOptions<Model>;
    config: RequestInit= {};
    actions: Actions & {[actionName:string]:ActionInstance<Model>};
    modelPath:string[];
    gridName:string;
    url:string;
    key:(model:Model)=>string;
    dispatch;
    mapResToData:(data:any,methodType?:"post"|"get"|"count"|"put"|"delete")=>any;
    fetch:typeof window.fetch;
    constructor({
        url,
        modelPath,
        dispatch,
        key,
        params,
        methods,
        apiType,
        fetch,
        mapResToData,
        actions,
    }:{
        url:string,
        modelPath:string[],
        dispatch:Dispatch<any>,
        key?,
        params?:(filter:GridFilter)=>({[id:string]:any}),
        methods?:Resource<Model>,
        apiType?:APIType,
        fetch?:typeof window.fetch,
        mapResToData?
        actions?:(Actions & {[actionName:string]:RestfulActionDef<Model>})|Array<RestfulActionDef<Model>&{name:string,key?:string}>,
    }) {
        if (url.substr(-1) !== '/') url += '/';
        this.key = key || (x=>x['id']);
        this.mapResToData = mapResToData || (x=>x);
        this.fetch = fetch || window.fetch;
        this.modelPath = modelPath;
        this.dispatch = dispatch;
        this.url = url;
        
        switch (apiType) {
            case "NodeRestful": {
                this.params = params || function (filter) {
                        let _filter: NodeRestful.Params = {};
                        filter.search.forEach(function (condition) {
                            let key = condition.field.replace(/\[[^\]]*\]/, '');
                            if (/^\/.*\/$/.test(condition.value))
                                _filter[key + "__regex"] = condition.value;
                            else
                                _filter[key + "__equals"] = condition.value;
                        });
                        if (filter.pagination) {
                            _filter.offset = filter.pagination.offset;
                            _filter.limit = filter.pagination.limit;
                        }
                        if (filter.sort && filter.sort.field) {
                            let field = filter.sort.field.replace(/\[[^\]]*\]/, '');
                            _filter.sort = (filter.sort.reverse ? "-" : "") + field
                        }
                        return _filter;
                    };
                key = (x=>x["_id"]);
                break;
            }
            case "Loopback": {
                this.params = params || function (filter) {
                        let _filter: Loopback.Params = {where: {}};
                        filter.search.forEach(function (condition) {
                            if (/^\/.*\/$/.test(condition.value))
                                _filter.where[condition.field] = {like: condition.value.slice(1, -1)};
                            else
                                _filter.where[condition.field] = condition.value;
                        });
                        if (filter.pagination) {
                            _filter.offset = filter.pagination.offset;
                            _filter.limit = filter.pagination.limit;
                        }
                        if (filter.sort.field)
                            _filter.order = filter.sort.field + (filter.sort.reverse ? " DESC" : " ASC");
                        else
                            _filter.order = null;
                        return {filter: _filter};
                    };
                this.count = methods.count || (()=> {
                        if (this.params && this.params['filter'])
                            this.params['where'] = this.params['filter'].where;
                        return fetch(url + '/count' + keyValueToQueryParams(params(this.params)), this.config)
                            .then(res=>res.json()).then(mapResToData).then((res)=> {
                                dispatch({
                                    type: "grid/model/count",
                                    value: {
                                        modelPath,
                                        gridName: this.gridName,
                                        count: res
                                    }
                                })
                            });
                    });
                break;
            }
            case "Swagger": {
                this.params = params || ((filter)=> {
                        let params = {};
                        if (filter.pagination) {
                            params['page'] = (filter.pagination.offset / filter.pagination.limit + 1);
                            params['perPage'] = filter.pagination.limit;
                        }
                        if (filter.sort)
                            params['order'] = (filter.sort.field + filter.sort.reverse ? " DESC" : " ASC");
                        return params;
                    });
                break;
            }
        }


        if(actions) {
            let MakeAction = RestfulActionClassFactory(this.url);
            this.actions = {} as any;
            if(actions instanceof Array)
                actions.forEach(actionDef=>{
                    this.actions[actionDef.key||actionDef.name]=MakeAction(actionDef.name,actionDef,this.gridName,this.config,this.params,this.key,modelPath,fetch,this.mapResToData)
                });
            else
                Object.keys(actions).forEach((actionName)=> {
                    this.actions[actionName]=MakeAction(actionName,actions[actionName],this.gridName,this.config,this.params,this.key,modelPath,fetch,this.mapResToData)
                });
        }
        if(methods)
            ['get','count','delete','post','put'].forEach(method=>{
                if(methods[method])
                    this[method] = methods[method].bind(this)
            })
    }
        //TODO catch exception
    get(id?){
        return this.fetch(this.url+(id!==undefined?id:"")+keyValueToQueryParams(this.params),this.config)
            .then(res=>res.json()).then((res)=>{
            this.dispatch({
                type:"grid/model/get",
                value:{
                    modelPath:this.modelPath,
                    key:this.key,
                    models:this.mapResToData(res,'get')
                }
            });
            return res;
        },this.errorHandler.bind(this))
    }
    count(){
        return this.fetch(this.url + 'count'+keyValueToQueryParams(this.params),this.config)
            .then(res=>res.json()).then((res)=>{
            this.dispatch({
                type:"grid/model/count",
                value:{
                    modelPath:this.modelPath,
                    gridName:this.gridName,
                    key:this.key,
                    count:this.mapResToData(res,'count')
                }
            });
            return res;
        },this.errorHandler.bind(this))
    }
    delete(data){
        return this.fetch(this.url + this.key(data), Object.assign({},this.config,{
            method:"DELETE"
        })).then(res=>res.json()).then((res)=>{
            if(this.mapResToData(res,'delete'))
                this.dispatch({
                    type:"grid/model/delete",
                    value:{
                        modelPath:this.modelPath,
                        key:this.key,
                        model:data
                    }
                });
            return res;
        },this.errorHandler.bind(this))
    }
    put(data){
        if(!this.key(data))
            return this['post'](data);
        else
            return this.fetch(this.url +this.key(data), Object.assign({},this.config,{
                method:"PUT",
                body:JSON.stringify(data)
            })).then(res=>res.json()).then((res)=>{
                this.dispatch({
                    type:"grid/model/put",
                    value:{
                        modelPath:this.modelPath,
                        key:this.key,
                        model:this.mapResToData(res,'put')
                    }
                });
                return res;
            },this.errorHandler.bind(this))
    }
    post(data){
        return this.fetch(this.url, Object.assign({},this.config,{
            method:"POST",
            body:JSON.stringify(data)
        })).then(res=>res.json()).then((res)=>{
            this.dispatch({
                type:"grid/model/post",
                value:{
                    modelPath:this.modelPath,
                    key:this.key,
                    model:this.mapResToData(res,'post')
                }
            });
            return res;
        },this.errorHandler.bind(this))
    }
    errorHandler(err){
        throw err;
    }
    filter(_filter){
        this.params = this.params?this.params(_filter):_filter;
    }
}