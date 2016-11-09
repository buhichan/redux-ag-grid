import Dispatch = Redux.Dispatch;
export interface RestfulActionDef<T> extends BaseActionDef<T> {
    name: string;
    displayName: string;
    params: (data: T | T[]) => any;
    data: (data: T | T[]) => any;
}
export declare type ActionInstance<T> = {
    (data?: T | T[], dispatch?: Dispatch<any>): any;
    displayName?: string;
    isStatic?: boolean;
    enabled?: (data: T) => boolean;
    useSelected?: boolean;
};
export interface BaseActionDef<T> {
    isStatic?: boolean;
    displayName: string;
    enabled: (model: T) => boolean;
}
export declare function RestfulActionClassFactory<T>(url: string): (options: RestfulActionDef<T>, configGetter: () => RequestInit & {
    params: any;
}, idGetter?: (x: any) => any) => {
    (data?: T | T[], dispatch?: Dispatch<any>): any;
    displayName?: string;
    isStatic?: boolean;
    enabled?: (data: T) => boolean;
    useSelected?: boolean;
};
