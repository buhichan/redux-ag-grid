/**
 * Created by YS on 2016/10/13.
 */
import { IDoesFilterPassParams } from "ag-grid";
import * as React from "react";
export declare class DateFilter extends React.Component<any, any> {
    private params;
    to: Date;
    toAsString: string;
    from: Date;
    fromAsString: string;
    input: HTMLInputElement;
    render(): JSX.Element;
    constructor(params: any);
    isFilterActive(): boolean;
    afterGuiAttached(): void;
    datePassed(date: any): boolean;
    doesFilterPass(params: IDoesFilterPassParams): boolean;
    setModel(model: any): void;
    getModel(): {
        from: number;
        to: number;
    };
    onChange(from?: string, to?: string): void;
}
export declare class EnumFilter extends React.Component<any, any> {
    options: any[];
    selected: any[];
    params: any;
    select: HTMLSelectElement;
    constructor(params: any);
    render(): JSX.Element;
    isFilterActive(): boolean;
    doesFilterPass(params: IDoesFilterPassParams): boolean;
    getModel(): any;
    afterGuiAttached(): void;
    setModel(model: any): void;
    onChange(): void;
}
