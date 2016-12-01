import Dispatch = Redux.Dispatch;
export interface RestfulActionDef<T> extends BaseActionDef<T> {
    path?: string;
    method?: string;
    params?: (data: T | T[]) => any;
    data?: (data: T | T[]) => any;
    then?: (data: T | T[], res: any) => any;
    cacheTime?: number;
}
export interface ActionInstance<T> {
    (data?: T | T[]): any;
    displayName?: string;
    isStatic?: boolean;
    enabled?: (data: T) => boolean;
    useSelected?: boolean;
}
export interface BaseActionDef<T> {
    isStatic?: boolean;
    displayName?: string;
    enabled?: (model: T) => boolean;
}
export declare function RestfulActionClassFactory<T>(url: string): (actionName: string, actionDef: RestfulActionDef<T>, gridName: string, config: RequestInit, params: {
    [key: string]: string;
}, idGetter: any, modelPath: string[], fetch: (url: RequestInfo, init?: RequestInit) => Promise<Response>, mapResToData: any, dispatch: Dispatch<any>) => ActionInstance<T>;
