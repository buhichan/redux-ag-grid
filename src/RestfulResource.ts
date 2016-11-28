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
    filter(filter:GridFilter):void
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
    mapResToData:(resData:any,methodType?:"post"|"get"|"count"|"put"|"delete",reqData?:any)=>Model|(Model[])|number|boolean;
    fetch:typeof window.fetch;
    cacheTime?:number;
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
        cacheTime,
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
        cacheTime?:number
    }) {
        if (url.substr(-1) !== '/') url += '/';
        this.key = key || (x=>x['id']);
        this.mapResToData = mapResToData || (x=>x);
        this.fetch = fetch || window.fetch;
        this.modelPath = modelPath;
        this.dispatch = dispatch;
        this.url = url;
        this.cacheTime=cacheTime;
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
                    this.actions[actionDef.key||actionDef.name]=
                        MakeAction(actionDef.name,actionDef,this.gridName,this.config,this.params,this.key,modelPath,fetch,this.mapResToData,this.dispatch)
                });
            else
                Object.keys(actions).forEach((actionName)=> {
                    this.actions[actionName]=
                        MakeAction(actionName,actions[actionName],this.gridName,this.config,this.params,this.key,modelPath,fetch,this.mapResToData,this.dispatch)
                });
        }
        if(methods)
            ['get','count','delete','post','put'].forEach(method=>{
                if(methods[method])
                    this[method] = methods[method].bind(this)
            })
    }
    GetAllCache:Model[];
    LastCachedTime:number;
        //TODO catch exception
    get():Promise<Model[]>
    get(id):Promise<Model>
    get(id?):Promise<Model[]|Model>{
        if(this.cacheTime){
            if(!id && Date.now()-this.LastCachedTime<this.cacheTime*1000){
                return Promise.resolve(this.GetAllCache);
            }
        }
        return this.fetch(this.url+(id!==undefined?id:"")+keyValueToQueryParams(this.params),this.config)
            .then(res=>res.json()).then((res)=>{
                const models = this.mapResToData(res,'get',id) as any;
                if(!id) {
                    this.dispatch({
                        type: "grid/model/get",
                        value: {
                            modelPath: this.modelPath,
                            key: this.key,
                            models
                        }
                    });
                    this.GetAllCache = models as Model[];
                    this.LastCachedTime = Date.now();
                }else{
                    this.dispatch({
                        type: "grid/model/put",
                        value:{
                            modelPath:this.modelPath,
                            key:this.key,
                            model:models
                        }
                    });
                }
                return models;
        },this.errorHandler.bind(this));
    }
    count():Promise<number>{
        return this.fetch(this.url + 'count'+keyValueToQueryParams(this.params),this.config)
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
        return this.fetch(this.url + this.key(data), Object.assign({},this.config,{
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
            return this.fetch(this.url +this.key(data), Object.assign({},this.config,{
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
    errorHandler(err){
        throw err;
    }
    filter(_filter){
        this.params = this.params?this.params(_filter):_filter;
    }
    markAsDirty(){
        this.LastCachedTime = -Infinity;
    }
}