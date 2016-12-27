/// <reference types="whatwg-fetch" />
import { RestfulActionDef, ActionInstance } from "./ActionClassFactory";
import { GridFilter } from "./Grid";
export declare type APIType = 'NodeRestful' | 'Loopback' | 'Swagger' | null;
export interface Resource<T> {
    get(): Promise<T[]>;
    get(id: any): Promise<T>;
    post(model: T): Promise<T>;
    put(model: T): Promise<T>;
    delete(model: T): Promise<boolean>;
    count(): Promise<number>;
    query(query: {
        [key: string]: string;
    }): void;
}
export interface ActionResourceOptions<T> {
}
export declare class RestfulResource<Model, Actions> implements Resource<Model> {
    mapFilterToQuery: (filter: GridFilter) => {
        [key: string]: string;
    };
    options: ActionResourceOptions<Model>;
    config: RequestInit;
    actions: Actions & {
        [actionName: string]: ActionInstance<Model>;
    };
    modelPath: string[];
    gridName: string;
    url: string;
    key: (model: Model) => string;
    dispatch: any;
    mapResToData: (resData: any, methodType?: "post" | "get" | "count" | "put" | "delete", reqData?: any) => Model | (Model[]) | number | boolean;
    fetch: typeof window.fetch;
    cacheTime?: number;
    isCustomFilterPresent: boolean;
    _query: {
        [key: string]: string;
    };
    _filter: {
        [key: string]: string;
    };
    constructor({url, modelPath, dispatch, key, mapFilterToQuery, methods, apiType, fetch, mapResToData, actions, cacheTime}: {
        url: string;
        modelPath: string[];
        dispatch: (action: any) => void;
        key?;
        mapFilterToQuery?: (filter: GridFilter) => ({
            [id: string]: any;
        });
        methods?: Resource<Model>;
        apiType?: APIType;
        fetch?: typeof window.fetch;
        mapResToData?;
        actions?: (Actions & {
            [actionName: string]: RestfulActionDef<Model>;
        }) | Array<RestfulActionDef<Model> & {
            name?: string;
            key?: string;
        }>;
        cacheTime?: number;
    });
    lastGetAll: Promise<Model[]> | null;
    LastCachedTime: number;
    get(): Promise<Model[]>;
    get(id: any): Promise<Model>;
    count(): Promise<number>;
    delete(data: any): Promise<boolean>;
    put(data: any): Promise<Model>;
    post(data: any): Promise<Model>;
    errorHandler(e: Response): void;
    getQueryString(): string;
    filter(_filter: GridFilter): this;
    query(query: any): this;
    markAsDirty(): this;
}
