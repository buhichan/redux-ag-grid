import { RestfulActionDef, ActionInstance } from "./ActionClassFactory";
import { GridFilter } from "./Grid";
import { Dispatch } from "redux";
export declare type APIType = 'NodeRestful' | 'Loopback' | 'Swagger' | null;
export interface Resource<T> {
    get?: (id?) => Promise<void>;
    post?: (model: T) => Promise<void>;
    put?: (model: T) => Promise<void>;
    delete?: (model: T) => Promise<void>;
    count?: () => Promise<void>;
    filter?: (filter: GridFilter) => void;
}
export interface ActionResourceOptions<T> {
}
export declare class RestfulResource<Model, Actions> implements Resource<Model> {
    params: (...args: any[]) => any;
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
    mapResToData: (data: any, methodType?: "post" | "get" | "count" | "put" | "delete") => any;
    fetch: typeof window.fetch;
    constructor({url, modelPath, dispatch, key, params, methods, apiType, fetch, mapResToData, actions}: {
        url: string;
        modelPath: string[];
        dispatch: Dispatch<any>;
        key?;
        params?: (filter: GridFilter) => ({
            [id: string]: any;
        });
        methods?: Resource<Model>;
        apiType?: APIType;
        fetch?: typeof window.fetch;
        mapResToData?;
        actions?: (Actions & {
            [actionName: string]: RestfulActionDef<Model>;
        }) | Array<RestfulActionDef<Model> & {
            name: string;
            key?: string;
        }>;
    });
    get(id?: any): Promise<any>;
    count(): Promise<any>;
    delete(data: any): Promise<any>;
    put(data: any): Promise<any>;
    post(data: any): Promise<any>;
    errorHandler(err: any): void;
    filter(_filter: any): void;
}
