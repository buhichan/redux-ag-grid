/// <reference types="react" />
/**
 * Created by buhi on 2017/3/6.
 */
import * as React from "react";
import { IDoesFilterPassParams, IFilterParams } from "ag-grid";
import { List } from "immutable";
import { IFilterReactComp } from "ag-grid-react/lib/interfaces";
export declare class EnumFilter extends React.PureComponent<any, any> implements IFilterReactComp {
    options: any[];
    state: {
        selected: List<{}>;
    };
    params: IFilterParams;
    constructor(params: any);
    onSelectAll: () => void;
    render(): JSX.Element;
    isFilterActive(): boolean;
    doesFilterPass(params: IDoesFilterPassParams): boolean;
    getModel(): any;
    setModel(model: any): void;
    refresh(): void;
    onChange: ({target}: {
        target: any;
    }) => void;
}
