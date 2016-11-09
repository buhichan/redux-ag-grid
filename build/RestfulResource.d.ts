import { RestfulActionDef, ActionInstance } from "./ActionClassFactory";
import { GridFilter } from "./Grid";
import { Dispatch } from "redux";
export declare type APIType = 'NodeRestful' | 'Loopback' | 'Swagger' | null;
export interface Resource<T> {
    get?: () => Promise<void>;
    post?: (model: T) => Promise<void>;
    put?: (model: T) => Promise<void>;
    delete?: (model: T) => Promise<void>;
    count?: () => Promise<void>;
    filter?: (filter: GridFilter) => void;
}
export interface ActionResourceOptions<T> {
    key?: (model: T) => string;
    params?: (filter: GridFilter) => ({
        [id: string]: any;
    });
    methods?: Resource<T>;
    apiType?: APIType;
    fetch?: typeof fetch;
    mapResToData?: (any) => any;
}
export declare class RestfulResource<T> implements Resource<T> {
    params: {};
    options: any;
    config: RequestInit & {
        params: any;
    };
    actions: ActionInstance<T>[];
    modelPath: string[];
    gridName: string;
    constructor({url, modelPath, dispatch, actions, options}: {
        url: string;
        modelPath: string[];
        dispatch: Dispatch<any>;
        actions: RestfulActionDef<T>[];
        options: ActionResourceOptions<T>;
    });
    errorHandler(err: any): void;
    filter(_filter: any): void;
}
