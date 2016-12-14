import "../node_modules/ag-grid/dist/styles/ag-grid.css";
import { Component } from "react";
import { AbstractColDef, ColDef, GridApi, ColumnApi } from "ag-grid";
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
export declare type columnType = "text" | "number" | "select" | "checkbox" | "date" | "datetime-local" | "group" | null;
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
    gridOptions?: any;
    themeRenderer: ITheme;
    selectAll?: boolean;
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
    storeState?: Immutable.Map<any, any>;
    resource?: RestfulResource<T, any>;
    schema?: GridFieldSchema[];
    actions?: (InstanceAction<T> | StaticAction<T> | string)[];
    gridOptions?: any;
    dispatch?: Dispatch<any>;
    height?: number;
    serverSideFilter?: boolean;
    data?: T[] | Immutable.List<T>;
    noSearch?: boolean;
    noSelect?: boolean;
}
export declare class Grid<T> extends Component<GridProps<T>, GridState<T>> {
    gridApi: GridApi;
    columnApi: ColumnApi;
    shouldComponentUpdate(nextProps: GridProps<T>, nextState: GridState<T>): boolean;
    constructor(props: any);
    componentWillMount(): void;
    componentWillUnmount(): void;
    onReady(schema: any): void;
    setState(P: any, c?: any): void;
    isUnmounting: boolean;
    componentWillReceiveProps(newProps: GridProps<T>): void;
    parseSchema(schema: GridFieldSchema[]): Promise<AbstractColDef[]>;
    getActions(): {
        staticActions: ActionInstance<T>[];
        rowActions: ActionInstance<T>[];
    };
    render(): JSX.Element;
}
