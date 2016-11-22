import "./Grid.css";
import "ag-grid/dist/styles/ag-grid.css";
import { Component } from "react";
import { AbstractColDef, GridApi, ColumnApi } from "ag-grid";
import { Resource } from "./RestfulResource";
import { ActionInstance } from "./ActionClassFactory";
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
export declare type columnType = "select" | "checkbox" | "date" | "datetime-local" | null;
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
}
export interface GridState {
    quickFilterText?: string;
    gridOptions?: any;
    themeRenderer: ITheme;
    selectAll?: boolean;
    staticActions: ActionInstance<any>[];
}
export interface GridProp<T> {
    gridName?: string;
    store?: Immutable.Map<any, any>;
    resource?: Resource<T>;
    modelPath?: string[];
    schema?: GridFieldSchema[];
    actions?: (ActionInstance<T> | string)[];
    onCellClick?: (...args: any[]) => any;
    onCellDblClick?: (...args: any[]) => any;
    dispatch?: Dispatch<any>;
    height?: number;
    serverSideFilter?: boolean;
    data?: T[];
}
export declare class Grid<T> extends Component<GridProp<T>, GridState> {
    gridApi: GridApi;
    columnApi: ColumnApi;
    state: GridState;
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
