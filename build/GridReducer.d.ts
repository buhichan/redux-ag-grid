export interface GridActionPayload<T> {
    modelPath: string[];
    key: (T: T) => string;
}
export declare type GridActionTypes = "grid/model/get" | "grid/model/count" | "grid/model/post" | "grid/model/put" | "grid/model/delete" | "grid/model/change";
export interface GridGetPayload<T> extends GridActionPayload<T> {
    models: T[];
    offset: number;
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
export interface GridChangePayload<T> extends GridActionPayload<T> {
    data: {
        id: string;
        changes: {
            [key: string]: any;
        };
    };
}
export declare function GridReducer<T>(rootState: any, action: {
    type: GridActionTypes;
    value: GridActionPayload<T>;
}): any;
