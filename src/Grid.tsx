/**
 * Created by YS on 2016/9/24.
 */
"use strict";
import "./Grid.css"
import "ag-grid/dist/styles/ag-grid.css"
import {Component} from "react"
import * as React from "react"
import {IGetRowsParams} from "ag-grid"
import {AgGridReact as AgGrid} from "ag-grid-react"
import {AbstractColDef,GridApi,ColumnApi} from "ag-grid";
import {Resource, RestfulResource} from "./RestfulResource"
let {connect} =require("react-redux");
import {deepGetState} from "./Utils";
import {EnumFilter, DateFilter} from "./GridFilters";
import {ActionInstance} from "./ActionClassFactory";
import Dispatch = Redux.Dispatch;
import {currentTheme, ITheme} from "./themes"
import "./themes/Bootstrap"

export interface GridFilter{
    quickFilterText?:string,
    pagination?:{
        offset:number,
        limit:number,
        total?:number
    },
    search?:{
        field:string,
        value:any
    }[],
    sort?:{
        field:string,
        reverse:boolean
    }
}

export type columnType = "select"|"checkbox"|"date"|"datetime-local"|null
export type Options = {name:string,value:string}[]
export type AsyncOptions = ()=>Promise<Options>
export interface GridFieldSchema{
    type?:columnType,
    key:string,
    label:string,
    options?:Options | AsyncOptions
}

export interface GridState{
    quickFilterText?:string,
    gridOptions?:any,
    themeRenderer:ITheme,
    selectAll?:boolean,
    staticActions:ActionInstance<any>[]
}

export interface GridProp<T>{
    gridName?:string,
    store?:Immutable.Map<any,any>,
    resource?:Resource<T>,
    modelPath?:string[]
    schema?:GridFieldSchema[],
    actions?:(ActionInstance<T>|string)[],
    onCellClick?:(...args:any[])=>any
    onCellDblClick?:(...args:any[])=>any
    dispatch?:Dispatch<any>
    height?:number,
    serverSideFilter?:boolean,
    data?:T[]
}

function getModel(store,modelPath){
    let data = deepGetState(store,...modelPath);
    if(data.toArray)
        data = data.toArray();
    return data;
}

@connect(
    store=>({store})
)
export class Grid<T> extends Component<GridProp<T>,GridState>{
    gridApi:GridApi;
    columnApi:ColumnApi;
    state:GridState={
        quickFilterText:'',
        gridOptions:{
            colDef:[],
            suppressNoRowsOverlay:true,
            rowData:[],
            onRowDblClicked:this.props.onCellDblClick,
            paginationPageSize:20,
            rowHeight:40,
            onGridReady:params=>{this.gridApi=params.api;this.columnApi=params.columnApi},
            onColumnEverythingChanged:()=>this.gridApi&&this.gridApi.sizeColumnsToFit(),
            rowSelection:"multiple",
            enableSorting:"true",
            enableFilter:"true",
        },
        themeRenderer:currentTheme(),
        selectAll:false,
        staticActions:[]
    };
    componentWillMount(){
        if(!this.props.resource && !this.props.data) {
            throw new Error("请使用ResourceAdapterService构造一个Resource或传入data");
        }else if(this.props.resource){
            if (!this.props.modelPath && !this.props.resource['modelPath'])
                throw new Error("请声明modelPath:string[]");
            this.props.resource.get();
            this.props.resource['gridName'] = this.props.gridName || ('grid' + Math.random());
        }
        this.parseSchema(this.props.schema).then((parsed)=> {
            this.onReady(parsed)
        });
    }
    componentWillUnmount(){
        this.isUnmounting = true;
    }
    onReady(schema){
        let {staticActions,rowActions} = this.getActions();
        let columnDefs = schema && schema.length?schema.concat([{
            headerName:"",
            suppressFilter:true,
            suppressMenu:true,
            suppressSorting:true,
            cellRendererFramework: this.state.themeRenderer.ActionCellRenderer(rowActions)
        }]):[];
        const gridOptions = Object.assign(this.state.gridOptions,{
            quickFilterText:this.state.quickFilterText,
            columnDefs:columnDefs,
            context:{
                getSelected:()=>this.gridApi.getSelectedRows(),
                dispatch:this.props.dispatch,
                rowActions
            },
        });
        if(this.props.resource) {
            if (this.props.serverSideFilter) {
                gridOptions['rowModelType'] = 'virtual';
                gridOptions['datasource'] = {
                    getRows: (params: IGetRowsParams)=> {
                        let data = getModel(this.props.store, this.props.modelPath || this.props.resource['modelPath']);
                        if (data.length < params.endRow) {
                            const resource = this.props.resource as RestfulResource<T,any>;
                            resource.filter({
                                pagination: {
                                    offset: params.startRow,
                                    limit: params.endRow - params.startRow
                                }
                            });
                            resource.get().then(()=> {
                                let data = getModel(this.props.store, this.props.modelPath || this.props.resource['modelPath']);
                                params.successCallback(data.slice(params.startRow, params.endRow), data.length <= params.endRow ? data.length : undefined);
                            });
                        }
                        else
                            params.successCallback(data.slice(params.startRow, params.endRow));
                    }
                };
            } else
                gridOptions['rowData'] = getModel(this.props.store, this.props.modelPath || this.props.resource['modelPath']);
        }
        this.setState({
            staticActions,
            gridOptions,
        })
    }
    setState(P,c?){
        if(this.isUnmounting) return;
        else super.setState(P,c);
    }
    isUnmounting=false;
    componentWillReceiveProps(newProps:GridProp<T>){
        if(newProps.schema!==this.props.schema)
            this.parseSchema(this.props.schema).then((parsed)=>{
                this.setState({
                    parsedSchema:parsed
                })
            });
    }
    parseSchema(schema:GridFieldSchema[]):Promise<AbstractColDef[]>{
        return Promise.all(schema.map(column=>{
            let parseField:(options:any)=>AbstractColDef = (options)=>{
                let colDef={
                    field:column.key,
                    headerName:column.label
                };
                switch (column.type){
                    case "select":
                            colDef['cellRendererFramework'] = this.state.themeRenderer.SelectFieldRenderer(options);
                            colDef['options'] = column.options;
                            colDef['filterFramework'] = EnumFilter;
                    break;
                case "date":
                case "datetime-local":
                    let method;
                    if(column.type === "date")
                        method = "toLocaleDateString";
                    else
                        method = "toLocaleString";
                        colDef['cellRenderer']= params=>{
                            return (params.value!==null&&params.value!==undefined)?new Date(params.value)[method]('zh-cn'): ""
                        };
                        colDef['filterFramework'] = DateFilter;
                    break;
                }
                return colDef;
            };
            if (column.options && typeof column.options === 'function')
                return column.options().then(parseField);
            else
                return Promise.resolve(parseField(column.options))
        }))
    }
    getActions(){
        let staticActions:ActionInstance<T>[] = [];
        let rowActions:ActionInstance<T>[] = [];
        let restResource = this.props.resource as RestfulResource<T,any>;
        if(this.props.actions)
            this.props.actions.forEach(action=>{
                if(action === 'delete') {
                    let deleteAction =(data)=>{
                        return this.props.resource.delete(data)
                    };
                    deleteAction['displayName']='删除';
                    rowActions.push(deleteAction);
                } else if(typeof action === 'string' && restResource.actions[action]){
                    if(restResource.actions[action].isStatic)
                        staticActions.push(restResource.actions[action]);
                    else
                        rowActions.push(restResource.actions[action]);
                } else if((action as ActionInstance<any>).isStatic)
                    staticActions.push((action as ActionInstance<any>));
                else
                    rowActions.push((action as ActionInstance<any>));
            });
        return {
            staticActions,
            rowActions
        }
    }
    render(){
        let {staticActions,gridOptions} = this.state;
        if(!this.props.serverSideFilter && this.props.resource)
            gridOptions['rowData'] = getModel(this.props.store, this.props.modelPath || this.props.resource['modelPath']);
        else if(this.props.data)
            gridOptions['rowData'] = this.props.data;
        let GridRenderer = this.state.themeRenderer.GridRenderer;
        return <GridRenderer
            actions={staticActions}
            onSelectAll={()=>{
                        this.state.selectAll?this.gridApi.deselectAll():this.gridApi.selectAll();
                        this.state.selectAll = !this.state.selectAll;
                    }}
            dispatch={this.props.dispatch}
            gridApi={this.gridApi}
            height={this.props.height}
        >
            <AgGrid {...gridOptions}/>
        </GridRenderer>;
    }
}