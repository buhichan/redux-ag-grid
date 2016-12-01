import "ag-grid/dist/styles/ag-grid.css";
import { Component } from "react";
import { AbstractColDef, GridApi, ColumnApi } from "ag-grid";
import { RestfulResource } from "./RestfulResource";
import { ActionInstance, BaseActionDef } from "./ActionClassFactory";
import Dispatch = Redux.Dispatch;
import { ITheme } from "./themes";
import "./themes/Bootstrap";
export interface GridFilter {
    quickFilterText?: string;
    pagination?: {
        offset: number;
        limit: number;
        total?: number;
    };
    search?: {
        field: string;
        value: any;
    }[];
    sort?: {
        field: string;
        reverse: boolean;
    };
}
export declare type columnType = "text" | "number" | "select" | "checkbox" | "date" | "datetime-local" | null;
export declare type Options = {
    name: string;
    value: string;
}[];
export declare type AsyncOptions = () => Promise<Options>;
export interface GridFieldSchema {
    type?: columnType;
    key: string;
    label: string;
    options?: Options | AsyncOptions;
    cellRenderer?: any;
    cellRendererParams?: any;
}
export interface GridState {
    quickFilterText?: string;
    gridOptions?: any;
    themeRenderer: ITheme;
    selectAll?: boolean;
    staticActions: ActionInstance<any>[];
}
export interface InstanceAction<T> extends BaseActionDef<T> {
    call: (data: T) => any;
}
export interface StaticAction<T> extends BaseActionDef<T> {
    isStatic: true;
    call: (data: T[]) => any;
}
export interface GridProp<T> {
    gridName?: string;
    gridApi?: (gridApi: GridApi) => void;
    store?: Immutable.Map<any, any>;
    resource?: RestfulResource<T, any>;
    modelPath?: string[];
    schema?: GridFieldSchema[];
    actions?: (InstanceAction<T> | StaticAction<T> | string)[];
    gridOptions?: any;
    dispatch?: Dispatch<any>;
    height?: number;
    serverSideFilter?: boolean;
    data?: T[] | Immutable.List<T>;
}
export declare class Grid<T> extends Component<GridProp<T>, GridState> {
    gridApi: GridApi;
    columnApi: ColumnApi;
    constructor(props: any);
    componentWillMount(): void;
    componentWillUnmount(): void;
    onReady(schema: any): void;
    setState(P: any, c?: any): void;
    isUnmounting: boolean;
    componentWillReceiveProps(newProps: GridProp<T>): void;
    parseSchema(schema: GridFieldSchema[]): Promise<AbstractColDef[]>;
    getActions(): {
        staticActions: ActionInstance<T>[];
        rowActions: ActionInstance<T>[];
    };
    render(): JSX.Element;
}
