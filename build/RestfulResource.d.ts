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
    key?: (model: T) => string;
    params?: (filter: GridFilter) => ({
        [id: string]: any;
    });
    methods?: Resource<T>;
    apiType?: APIType;
    fetch?: typeof fetch;
    mapResToData?: (data: any, methodType?: "post" | "get" | "count" | "put" | "delete") => any;
}
export declare class RestfulResource<Model, Actions> implements Resource<Model> {
    params: {};
    options: ActionResourceOptions<Model>;
    config: RequestInit;
    actions: Actions & {
        [actionName: string]: ActionInstance<Model>;
    };
    modelPath: string[];
    gridName: string;
    get?: (id?) => Promise<void>;
    post?: (model: Model) => Promise<void>;
    put?: (model: Model) => Promise<void>;
    delete?: (model: Model) => Promise<void>;
    count?: () => Promise<void>;
    constructor({url, modelPath, dispatch, options, actions}: {
        url: string;
        modelPath: string[];
        dispatch: Dispatch<any>;
        options: ActionResourceOptions<Model>;
        actions?: Actions & {
            [actionName: string]: RestfulActionDef<Model>;
        };
    });
    errorHandler(err: any): void;
    filter(_filter: any): void;
}
