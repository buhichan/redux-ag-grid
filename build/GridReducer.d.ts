/**
 * Created by YS on 2016/11/4.
 */
export interface GridActionPayload<T> {
    gridName: string;
    modelPath: string[];
    key: (T: T) => string;
}
export declare type GridActionTypes = "grid/model/get" | "grid/model/count" | "grid/model/post" | "grid/model/put" | "grid/model/delete";
export interface GridGetPayload<T> extends GridActionPayload<T> {
    models: T[];
}
export interface GridPutPayload<T> extends GridActionPayload<T> {
    model: T;
}
export interface GridDeletePayload<T> extends GridActionPayload<T> {
    model: T;
}
export interface GridPostPayload<T> extends GridActionPayload<T> {
    model: T;
}
export interface GridCountPayload<T> extends GridActionPayload<T> {
    count: number;
}
export declare function GridReducer<T>(prevState: any, action: {
    type: GridActionTypes;
    value: GridActionPayload<T>;
}): any;
