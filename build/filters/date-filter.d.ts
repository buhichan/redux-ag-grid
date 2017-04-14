/// <reference types="react" />
/**
 * Created by buhi on 2017/3/6.
 */
import * as React from "react";
import { IFilterReactComp } from "ag-grid-react/lib/interfaces";
import { IDoesFilterPassParams, IFilterParams } from "ag-grid";
export declare class DateFilter extends React.PureComponent<any, any> implements IFilterReactComp {
    private params;
    state: {
        from: any;
        to: any;
    };
    constructor(params: IFilterParams);
    refresh(): void;
    checkDate(date: any): boolean;
    doesFilterPass(params: IDoesFilterPassParams): boolean;
    isFilterActive(): any;
    getModel(): {
        from: any;
        to: any;
    };
    setModel(model: any): void;
    onChange: (from: any, to: any) => void;
    render(): JSX.Element;
}
