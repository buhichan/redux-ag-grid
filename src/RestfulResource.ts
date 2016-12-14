/**
 * Created by YS on 2016/11/4.
 */
"use strict";
import {RestfulActionClassFactory, RestfulActionDef, ActionInstance} from "./ActionClassFactory"
import {GridFilter} from "./Grid"
import {keyValueToQueryParams} from "./Utils";
import {Dispatch} from "redux";

/**
 * Created by YS on 2016/11/4.
 */

declare namespace NodeRestful{
    export interface Params{
        offset?:number,
        limit?:number,
        sort?:string
    }
}

declare namespace Loopback{
    export interface Params{
        where:{
            [searchkey:string]:string | {
                like?:string
            }
        }
        offset?:number,
        limit?:number,
        order?:string
    }
}

export type APIType = 'NodeRestful' | 'Loopback' | 'Swagger' | null

export interface Resource<T>{
    get():Promise<T[]>,
    get(id):Promise<T>,
    post(model:T):Promise<T>,
    put(model:T):Promise<T>,
    delete(model:T):Promise<boolean>
    count():Promise<number>
    query(query:{[key:string]:string}):void
}

export interface ActionResourceOptions<T>{
}

export class RestfulResource<Model,Actions> implements Resource<Model>{
    mapFilterToQuery:(filter:GridFilter)=>{[key:string]:string};
    options:ActionResourceOptions<Model>;
    config: RequestInit= {};
    actions: Actions & {[actionName:string]:ActionInstance<Model>};
    modelPath:string[];
    gridName:string;
    url:string;
    key:(model:Model)=>string;
    dispatch;
    mapResToData:(resData:any,methodType?:"post"|"get"|"count"|"put"|"delete",reqData?:any)=>Model|(Model[])|number|boolean;
    fetch:typeof window.fetch;
    cacheTime?:number;
    isCustomFilterPresent=false;
    _query:{[key:string]:string}={};
    _filter:{[key:string]:string}={};
    constructor({
        url,
        modelPath,
        dispatch,
        key,
        mapFilterToQuery,
        methods,
        apiType,
        fetch,
        mapResToData,
        actions,
        cacheTime=1,
    }:{
        url:string,
        modelPath:string[],
        dispatch:Dispatch<any>,
        key?,
        mapFilterToQuery?:(filter:GridFilter)=>({[id:string]:any}),
        methods?:Resource<Model>,
        apiType?:APIType,
        fetch?:typeof window.fetch,
        mapResToData?
        actions?:(Actions & {[actionName:string]:RestfulActionDef<Model>})|Array<RestfulActionDef<Model>&{name?:string,key?:string}>,
        cacheTime?:number
    }) {
        if (url.substr(-1) === '/') url=url.slice(0,-1);
        this.key = key || (x=>x['id']);
        this.mapResToData = mapResToData || (x=>x);
        this.fetch = fetch || window.fetch;
        this.modelPath = modelPath;
        this.dispatch = dispatch;
        this.url = url;
        this.cacheTime=cacheTime;
        switch (apiType) {
            case "NodeRestful": {
                this.mapFilterToQuery = mapFilterToQuery || function (filter) {
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
                this.mapFilterToQuery = mapFilterToQuery || function (filter) {
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
                        if (this._query && this._query['filter'])
                            this._query['where'] = this._query['filter']['where'];
                        return fetch(url + '/count' + keyValueToQueryParams(this._query), this.config)
                            .then(res=>res.json()).then(res=>mapResToData(res,'count')).then((res)=> {
                                dispatch({
                                    type: "grid/model/count",
                                    value: {
                                        modelPath,
                                        gridName: this.gridName,
                                        count: res
                                    }
                                });
                                return res;
                            });
                    });
                break;
            }
            case "Swagger": {
                this.mapFilterToQuery = mapFilterToQuery || ((filter)=> {
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
                    this.actions[actionDef.key||actionDef.name]=
                        MakeAction(actionDef.name,actionDef,this.gridName,this.config,()=>this._query,this.key,modelPath,fetch,this.mapResToData,this.dispatch)
                });
            else
                Object.keys(actions).forEach((actionName)=> {
                    this.actions[actionName]=
                        MakeAction(actionName,actions[actionName],this.gridName,this.config,()=>this._query,this.key,modelPath,fetch,this.mapResToData,this.dispatch)
                });
        }
        if(methods)
            ['get','count','delete','post','put'].forEach(method=>{
                if(methods[method])
                    this[method] = methods[method].bind(this)
            })
    }
    lastGetAll:Promise<Model[]> | null = null;
    LastCachedTime:number;
        //TODO catch exception
    get():Promise<Model[]>
    get(id):Promise<Model>
    get(id?):Promise<Model[]|Model>{
        if(!id){
            if(!this.isCustomFilterPresent && this.cacheTime && this.lastGetAll && Date.now()-this.LastCachedTime<this.cacheTime*1000){
                return this.lastGetAll;
            }
        }
        this.LastCachedTime = Date.now();
        const pending = this.fetch(this.url+(id!==undefined?("/"+id):"")+this.getQueryString(),this.config)
            .then(res=>res.json()).then((res)=>{
                const models = this.mapResToData(res,'get',id) as any;
                if(!this.isCustomFilterPresent) {
                    if (!id) {
                        this.dispatch({
                            type: "grid/model/get",
                            value: {
                                modelPath: this.modelPath,
                                key: this.key,
                                models
                            }
                        });
                    } else {
                        this.dispatch({
                            type: "grid/model/put",
                            value: {
                                modelPath: this.modelPath,
                                key: this.key,
                                model: models
                            }
                        });
                    }
                }
                return models;
        },(e)=>{
            if(!this.isCustomFilterPresent)
                this.lastGetAll = null;
            return this.errorHandler(e);
        });
        if(!id && !this.isCustomFilterPresent)
            this.lastGetAll = pending;
        return pending;
    }
    count():Promise<number>{
        return this.fetch(this.url+'/' + 'count'+this.getQueryString(),this.config)
            .then(res=>res.json()).then((res)=>{
                const count = this.mapResToData(res,'count');
                this.dispatch({
                    type:"grid/model/count",
                    value:{
                        modelPath:this.modelPath,
                        gridName:this.gridName,
                        key:this.key,
                        count
                    }
                });
            return count;
        },this.errorHandler.bind(this))
    }
    delete(data):Promise<boolean>{
        return this.fetch(this.url+'/' + this.key(data), Object.assign({},this.config,{
            method:"DELETE"
        })).then(res=>res.json()).then((res)=>{
            if(this.mapResToData(res,'delete',data)) {
                this.dispatch({
                    type: "grid/model/delete",
                    value: {
                        modelPath: this.modelPath,
                        key: this.key,
                        model: data
                    }
                });
                this.markAsDirty();
                return true;
            }
            return false;
        },this.errorHandler.bind(this))
    }
    put(data):Promise<Model>{
        if(!this.key(data))
            return this['post'](data);
        else
            return this.fetch(this.url+'/' +this.key(data), Object.assign({},this.config,{
                method:"PUT",
                body:JSON.stringify(data)
            })).then(res=>res.json()).then((res)=>{
                const model = this.mapResToData(res,'put',data);
                this.dispatch({
                    type:"grid/model/put",
                    value:{
                        modelPath:this.modelPath,
                        key:this.key,
                        model
                    }
                });
                this.markAsDirty();
                return model;
            },this.errorHandler.bind(this))
    }
    post(data):Promise<Model>{
        return this.fetch(this.url, Object.assign({},this.config,{
            method:"POST",
            body:JSON.stringify(data)
        })).then(res=>res.json()).then((res)=>{
            const model = this.mapResToData(res,'post',data);
            this.dispatch({
                type:"grid/model/post",
                value:{
                    modelPath:this.modelPath,
                    key:this.key,
                    model
                }
            });
            this.markAsDirty();
            return model;
        },this.errorHandler.bind(this))
    }
    errorHandler(e){
        throw e;
    }
    getQueryString(){
        return keyValueToQueryParams(Object.assign({},this._filter,this._query));
    }
    filter(_filter:GridFilter){
        this._filter = this.mapFilterToQuery(_filter);
        return this;
    }
    query(query){
        if(!query || !Object.keys(query).length){
            this._query = {};
            this.isCustomFilterPresent = false;
        }else{
            this._query = query;
            this.isCustomFilterPresent = true;
        }
        return this;
    }
    markAsDirty(){
        this.LastCachedTime = -Infinity;
        return this;
    }
}