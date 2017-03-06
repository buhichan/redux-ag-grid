import {Options} from "../Grid";
import {GridApi} from "ag-grid"
import * as React from "react"
import {ActionInstance} from "../ActionClassFactory";
import {ICellRendererReactComp} from "ag-grid-react/lib/interfaces";
/**
 * Created by YS on 2016/11/16.
 */

export type GridRendererProps = {
    onSelectAll:()=>void
    dispatch:(action:any)=>void
    gridApi:GridApi,
    actions:ActionInstance<any>[]
    height:number
    children?:any[]
    noSearch?:boolean
    noSelect?:boolean
};

export interface ITheme{
    HeaderSelectionCheckboxRenderer:ICellRendererReactComp & React.ComponentClass<ICellRendererReactComp>,
    SelectionCheckboxRenderer:ICellRendererReactComp & React.ComponentClass<ICellRendererReactComp>
    SelectFieldRenderer:(options:Options)=>ICellRendererReactComp & React.ComponentClass<ICellRendererReactComp>
    GridRenderer:React.ComponentClass<GridRendererProps>
    ActionCellRenderer:(actions:ActionInstance<any>[])=>ICellRendererReactComp & React.ComponentClass<ICellRendererReactComp>
}

let theme = null;

export function currentTheme(){return theme}

export function setTheme(newTheme:ITheme){
    theme = newTheme
}