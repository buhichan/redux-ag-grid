/// <reference types="react" />
import "ag-grid/dist/styles/ag-grid.css";
import { Component } from "react";
import { GridOptions } from "ag-grid";
import { AbstractColDef, ColDef, GridApi, ColumnApi } from "ag-grid";
import { RestfulResource } from "./RestfulResource";
import { ActionInstance, BaseActionDef } from "./ActionClassFactory";
import { ITheme } from "./themes";
import { List } from "immutable";
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
export declare type columnType = "text" | "number" | "select" | "checkbox" | "date" | "datetime-local" | "datetime" | "group" | "time" | null;
export declare type Options = {
    name: string;
    value: string | number;
}[];
export declare type AsyncOptions = () => Promise<Options>;
export interface GridFieldSchema extends ColDef {
    type: columnType;
    key: string;
    label: string;
    options?: Options | AsyncOptions;
    children?: GridFieldSchema[];
}
export interface GridState<T> {
    quickFilterText?: string;
    gridOptions?: GridOptions;
    themeRenderer: ITheme;
    selectAll?: boolean;
    models: List<T>;
    staticActions: ActionInstance<T>[];
}
export interface InstanceAction<T> extends BaseActionDef<T> {
    call: (data: T, e?: Event) => any;
}
export interface StaticAction<T> extends BaseActionDef<T> {
    isStatic: true;
    call: (data: T[], e?: Event) => any;
}
export interface GridProps<T> {
    gridName?: string;
    gridApi?: (gridApi: GridApi) => void;
    columnApi?: (columnApi: ColumnApi) => void;
    resource?: RestfulResource<T, any>;
    schema?: GridFieldSchema[];
    actions?: (InstanceAction<T> | StaticAction<T> | string)[];
    gridOptions?: GridOptions;
    dispatch?: any;
    height?: number;
    serverSideFilter?: boolean;
    data?: T[] | List<T>;
    noSearch?: boolean;
    selectionStyle?: "row" | "checkbox";
    actionColDef?: any;
}
export declare function setStore(store: any): void;
export declare class ReduxAgGrid<T> extends Component<GridProps<T>, GridState<T>> {
    gridApi: GridApi;
    columnApi: ColumnApi;
    shouldComponentUpdate(nextProps: GridProps<T>, nextState: GridState<T>): boolean;
    constructor(props: any, context: any);
    componentDidMount(): void;
    handleStoreChange(): void;
    unsubscriber: any;
    pendingResize: any;
    onResize: () => void;
    componentWillUnmount(): void;
    componentWillMount(): void;
    onReady(schema: any): void;
    setState(P: any, c?: any): void;
    isUnmounting: boolean;
    componentWillReceiveProps(newProps: GridProps<T>): void;
    parseSchema(schema: GridFieldSchema[]): Promise<AbstractColDef[]>;
    getActions(): {
        staticActions: StaticAction<T>[];
        rowActions: ActionInstance<T>[];
    };
    onSelectAll: () => void;
    render(): JSX.Element;
}
