/// <reference types="react" />
/**
 * Created by buhi on 2017/3/7.
 */
import * as React from "react";
import { IHeaderReactComp } from "ag-grid-react/lib/interfaces";
import { IHeaderParams } from "ag-grid";
export declare class CustomGridHeader extends React.PureComponent<{}, {}> implements IHeaderReactComp {
    private params;
    state: {
        sort: any;
    };
    constructor(params: IHeaderParams);
    filterChanged: () => void;
    componentWillMount(): void;
    componentWillUnmount(): void;
    changeSort: () => void;
    refresh(): void;
    filter: any;
    openFilterMenu: () => void;
    bindRef: (ref: any) => any;
    render(): JSX.Element;
}
export declare const defaultGridOptions: {
    rowHeight: number;
    headerHeight: number;
    localeText: {
        filterOoo: string;
        applyFilter: string;
        equals: string;
        lessThan: string;
        greaterThan: string;
        notContains: string;
        notEquals: string;
        contains: string;
        startsWith: string;
        endsWith: string;
    };
    defaultColDef: {
        headerComponentFramework: new () => any;
    };
};
