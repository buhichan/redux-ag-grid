/**
 * Created by YS on 2016/11/4.
 */
export declare function getImmuOrPOJO(target: any, key: any): any;
export declare function setImmuOrPOJO(target: any, data: any, key: any): any;
export declare function deepGet(obj: any, path: string): any;
export declare function deepGetState(rootState: any, ...keys: any[]): any;
export declare function deepSetState(state: any, data: any, ...keys: any[]): any;
export declare function keyValueToQueryParams(params?: {
    [id: string]: any;
}): string;
