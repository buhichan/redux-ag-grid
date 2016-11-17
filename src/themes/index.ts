import {Options} from "../Grid";
import {GridApi} from "ag-grid"
import * as React from "react"
import {ActionInstance} from "../ActionClassFactory";
import Dispatch = Redux.Dispatch;
/**
 * Created by YS on 2016/11/16.
 */

export type GridRendererProps = {
    onSelectAll:()=>void
    dispatch:Dispatch<any>
    gridApi:GridApi,
    actions:ActionInstance<any>[]
    height:number
    children?:any[]
};

export interface ITheme{
    SelectFieldRenderer:(options:Options)=>React.StatelessComponent<any>|React.ComponentClass<any>
    GridRenderer:React.StatelessComponent<GridRendererProps>|React.ComponentClass<GridRendererProps>
    ActionCellRenderer:(actions:ActionInstance<any>[])=>React.StatelessComponent<any>|React.ComponentClass<any>
}

let theme = null;

export function currentTheme(){return theme}

export function setTheme(newTheme){
    theme = newTheme
}