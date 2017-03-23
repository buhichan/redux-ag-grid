/**
 * Created by YS on 2016/11/4.
 */
"use strict";
import {RestfulActionClassFactory, RestfulActionDef, ActionInstance} from "./ActionClassFactory"
import {keyValueToQueryParams} from "./Utils";

/**
 * Created by YS on 2016/11/4.
 */

export interface ResourceFilter{
    quickFilterText?:string,
    pagination?:{
        offset:number,
        limit:number,
        total?:number
    },
    search?:{
        field:string,
        value:any
    }[],
    sort?:{
        field:string,
        reverse:boolean
    }
}

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
    constructor({
        url,
        modelPath,
        dispatch,
        key=(x=>x['id']),
        mapFilterToQuery,
        methods={},
        apiType='Loopback',
        fetch = window.fetch.bind(window),
        mapResToData = x=>x,
        actions,
        cacheTime=5,
    }:{
        url:string,
        modelPath:string[],
        dispatch:(action:any)=>void,
        key?,
        mapFilterToQuery?:(filter:ResourceFilter)=>({[id:string]:any}),
        methods?:Partial<Resource<Model>>,
        apiType?:APIType,
        fetch?:typeof window.fetch,
        mapResToData?
        actions?:(Array<RestfulActionDef<Model>&{key:keyof Actions}>),
        cacheTime?:number
    }) {
        if (url.substr(-1) === '/') url=url.slice(0,-1);
        this._idGetter = key;
        this._mapResToData=mapResToData;
        this._modelPath = modelPath;
        this._dispatch = dispatch;
        this._url = url;
        this._fetch = fetch;
        this._cacheTime=cacheTime;
        switch (apiType) {
            case "NodeRestful": {
                this._mapFilterToQuery = mapFilterToQuery || function (filter) {
                        let _filter: NodeRestful.Params = {};
                        filter.search && filter.search.forEach(function (condition) {
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
                this._mapFilterToQuery = mapFilterToQuery || function (filter) {
                        let _filter: Loopback.Params = {where: {}};
                        filter.search && filter.search.forEach(function (condition) {
                            if (/^\/.*\/$/.test(condition.value))
                                _filter.where[condition.field] = {like: condition.value.slice(1, -1)};
                            else
                                _filter.where[condition.field] = condition.value;
                        });
                        if (filter.pagination) {
                            _filter.offset = filter.pagination.offset;
                            _filter.limit = filter.pagination.limit;
                        }
                        if (filter.sort && filter.sort.field)
                            _filter.order = filter.sort.field + (filter.sort.reverse ? " DESC" : " ASC");
                        else
                            _filter.order = null;
                        return {filter: _filter};
                    };
                this.count = methods['count'] || (()=> {
                        if (this._query && this._query['filter'])
                            this._query['where'] = this._query['filter']['where'];
                        return fetch(url + '/count' + keyValueToQueryParams(this._query), this._config)
                            .then(res=>res.json()).then(({count})=> {
                                dispatch({
                                    type: "grid/model/count",
                                    value: {
                                        modelPath,
                                        gridName: this._gridName,
                                        count
                                    }
                                });
                                return count;
                            });
                    });
                break;
            }
            case "Swagger": {
                this._mapFilterToQuery = mapFilterToQuery || ((filter)=> {
                        let params = {};
                        if (filter.pagination) {
                            params['page'] = (filter.pagination.offset / filter.pagination.limit + 1);
                            params['perPage'] = filter.pagination.limit;
                        }
                        if (filter.sort && filter.sort.field)
                            params['order'] = (filter.sort.field + filter.sort.reverse ? " DESC" : " ASC");
                        return params;
                    });
                break;
            }
        }
        if(actions) {
            let MakeAction = RestfulActionClassFactory(this._url);
            this.actions = {} as any;
            if(actions instanceof Array)
                actions.forEach(actionDef=>{
                    this.actions[actionDef.key]=
                        MakeAction(actionDef.key,actionDef,this._gridName,this._config,()=>this._query,this._idGetter,modelPath,fetch,this._mapResToData,this._dispatch)
                });
            else
                Object.keys(actions).forEach((actionName)=> {
                    this.actions[actionName]=
                        MakeAction(actionName,actions[actionName],this._gridName,this._config,()=>this._query,this._idGetter,modelPath,fetch,this._mapResToData,this._dispatch)
                });
        }
        if(methods)
            ['get','count','delete','post','put'].forEach(method=>{
                if(methods[method])
                    this[method] = methods[method].bind(this)
            })
    }

    _mapFilterToQuery:(filter:ResourceFilter)=>{[key:string]:string};
    _options:ActionResourceOptions<Model>;
    _config: RequestInit= {};
    actions: Actions & {[actionName:string]:ActionInstance<Model>};
    _modelPath:string[];
    _gridName:string;
    _url:string;
    _idGetter:(model:Model)=>string;
    _dispatch;
    _mapResToData:(resData:any, methodType?:"post"|"get"|"count"|"put"|"delete", reqData?:any)=>Model|(Model[])|number|boolean;
    _fetch:typeof window.fetch;
    _cacheTime?:number;
    _isCustomFilterPresent=false;
    _query:{[key:string]:string}={};
    _filter:ResourceFilter={};
    //fixme: filter and query is chaotic

    _lastGetAll:Promise<Model[]> | null = null;
    _lastCachedTime:number;
    offset:number = null;
    get():Promise<Model[]>
    get(id):Promise<Model>
    get(id?):Promise<Model[]|Model>{
        if(!id){
            if(!this._isCustomFilterPresent && this._cacheTime && this._lastGetAll && Date.now()-this._lastCachedTime<this._cacheTime*1000){
                return this._lastGetAll;
            }
        }
        this._lastCachedTime = Date.now();
        const pending = this._fetch(this._url+(id!==undefined?("/"+id):"")+this.getQueryString(),this._config)
            .then(res=>res.json()).then((res)=>{
                const models = this._mapResToData(res,'get',id) as any;
                if(!this._isCustomFilterPresent) {
                    if (!id) {
                        this._dispatch({
                            type: "grid/model/get",
                            value: {
                                modelPath: this._modelPath,
                                key: this._idGetter,
                                models,
                                offset:this.offset
                            }
                        });
                    } else {
                        this._dispatch({
                            type: "grid/model/put",
                            value: {
                                modelPath: this._modelPath,
                                key: this._idGetter,
                                model: models
                            }
                        });
                    }
                }
                return models;
        },(e)=>{
            if(!this._isCustomFilterPresent)
                this._lastGetAll = null;
            return this.errorHandler(e);
        });
        if(this.offset===null && !id && !this._isCustomFilterPresent)
            this._lastGetAll = pending;
        return pending;
    }
    count():Promise<number>{
        return this._fetch(this._url+'/' + 'count'+this.getQueryString(),this._config)
            .then(res=>res.json()).then((res)=>{
                const count = this._mapResToData(res,'count');
                this._dispatch({
                    type:"grid/model/count",
                    value:{
                        modelPath:this._modelPath,
                        gridName:this._gridName,
                        key:this._idGetter,
                        count
                    }
                });
            return count;
        },this.errorHandler.bind(this))
    }
    delete(data):Promise<boolean>{
        return this._fetch(this._url+'/' + this._idGetter(data), Object.assign({},this._config,{
            method:"DELETE"
        })).then(res=>res.json()).then((res)=>{
            if(this._mapResToData(res,'delete',data)) {
                this._dispatch({
                    type: "grid/model/delete",
                    value: {
                        modelPath: this._modelPath,
                        key: this._idGetter,
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
        if(!this._idGetter(data))
            return this['post'](data);
        else
            return this._fetch(this._url+'/' +this._idGetter(data), Object.assign({},this._config,{
                method:"PUT",
                body:JSON.stringify(data)
            })).then(res=>res.json()).then((res)=>{
                const model = this._mapResToData(res,'put',data);
                this._dispatch({
                    type:"grid/model/put",
                    value:{
                        modelPath:this._modelPath,
                        key:this._idGetter,
                        model
                    }
                });
                this.markAsDirty();
                return model;
            },this.errorHandler.bind(this))
    }
    post(data):Promise<Model>{
        return this._fetch(this._url, Object.assign({},this._config,{
            method:"POST",
            body:JSON.stringify(data)
        })).then(res=>res.json()).then((res)=>{
            const model = this._mapResToData(res,'post',data);
            this._dispatch({
                type:"grid/model/post",
                value:{
                    modelPath:this._modelPath,
                    key:this._idGetter,
                    model
                }
            });
            this.markAsDirty();
            return model;
        },this.errorHandler.bind(this))
    }
    errorHandler(e:Response){
        throw e
    }
    getQueryString(){
        return keyValueToQueryParams(Object.assign({},this._filter,this._query));
    }
    filter(_filter:ResourceFilter){
        this._filter = this._mapFilterToQuery(_filter);
        if(_filter.pagination)
            this.offset = _filter.pagination.offset;
        return this;
    }
    query(query){
        if(!query || !Object.keys(query).length){
            this._query = {};
            this._isCustomFilterPresent = false;
        }else{
            this._query = query;
            this._isCustomFilterPresent = true;
        }
        return this;
    }
    markAsDirty(){
        this._lastCachedTime = -Infinity;
        return this;
    }
}