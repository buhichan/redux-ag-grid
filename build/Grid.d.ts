import "./Grid.css";
import "ag-grid/dist/styles/ag-grid.css";
import "ag-grid/dist/styles/theme-bootstrap.css";
import { Component } from "react";
import { AbstractColDef, GridApi, ColumnApi } from "ag-grid";
import { Resource } from "./RestfulResource";
import { ActionInstance } from "./ActionClassFactory";
import Dispatch = Redux.Dispatch;
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
export interface GridFieldSchema {
    type?: columnType;
    key: string;
    label: string;
    options?: {
        name: string;
        value: string;
    }[] | string;
}
export interface GridState {
    quickFilterText?: string;
    parsedSchema?: AbstractColDef[];
    filter?: GridFilter;
    selectAll?: boolean;
}
export interface GridProp<T> {
    gridName: string;
    store?: Immutable.Map<any, any>;
    resource?: Resource<T>;
    modelPath?: string[];
    schema?: GridFieldSchema[];
    actions?: ActionInstance<T>[];
    onCellClick?: (...args: any[]) => any;
    onCellDblClick?: (...args: any[]) => any;
    dispatch?: Dispatch<any>;
    height?: number;
}
export declare class Grid<T> extends Component<GridProp<T>, GridState> {
    getModels(): any;
    gridApi: GridApi;
    columnApi: ColumnApi;
    state: {
        quickFilterText: string;
        parsedSchema: any[];
        filter: {
            pagination: {
                limit: number;
                offset: number;
            };
        };
        selectAll: boolean;
    };
    componentDidMount(): void;
    componentWillReceiveProps(newProps: GridProp<T>): void;
    parseSchema(schema: GridFieldSchema[]): Promise<AbstractColDef[]>;
    getActions(): {
        staticActions: ActionInstance<T>[];
        rowActions: ActionInstance<T>[];
    };
    render(): JSX.Element;
}
