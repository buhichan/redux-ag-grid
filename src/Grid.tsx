/**
 * Created by YS on 2016/9/24.
 */
"use strict";
import "ag-grid/dist/styles/ag-grid.css"
import {Component} from "react"
import * as React from "react"
import {IGetRowsParams} from "ag-grid"
import {AgGridReact} from "ag-grid-react"
import {AbstractColDef,GridApi,ColumnApi} from "ag-grid";
import {RestfulResource} from "./RestfulResource"
let {connect} =require("react-redux");
import {deepGetState} from "./Utils";
import {EnumFilter, DateFilter} from "./GridFilters";
import {ActionInstance, BaseActionDef} from "./ActionClassFactory";
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

export type columnType = "text"|"number"|"select"|"checkbox"|"date"|"datetime-local"|null
export type Options = {name:string,value:string}[]
export type AsyncOptions = ()=>Promise<Options>
export interface GridFieldSchema{
    type?:columnType,
    key:string,
    label:string,
    options?:Options | AsyncOptions,
    cellRenderer?:any,
    cellRendererParams?:any
}

export interface GridState{
    quickFilterText?:string,
    gridOptions?:any,
    themeRenderer:ITheme,
    selectAll?:boolean,
    staticActions:ActionInstance<any>[]
}

export interface InstanceAction<T> extends BaseActionDef<T>{
    call:(data:T)=>any
}

export interface StaticAction<T> extends BaseActionDef<T> {
    isStatic:true,
    call:(data:T[])=>any
}

export interface GridProp<T>{
    gridName?:string,
    gridApi?:(gridApi:GridApi)=>void,
    store?:Immutable.Map<any,any>,
    resource?:RestfulResource<T,any>,
    modelPath?:string[]
    schema?:GridFieldSchema[],
    actions?:(InstanceAction<T>|StaticAction<T>|string)[],
    gridOptions?:any,
    dispatch?:Dispatch<any>
    height?:number,
    serverSideFilter?:boolean,
    data?:T[] | Immutable.List<T>
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
    constructor(props){
        super(props);
        this.state = {
            quickFilterText:'',
            gridOptions:{
                colDef:[],
                suppressNoRowsOverlay:true,
                rowData:[],
                paginationPageSize:20,
                rowHeight:40,
                onGridReady:params=>{
                    this.gridApi=params.api;
                    this.columnApi=params.columnApi;
                    if(this.props.gridApi)
                        this.props.gridApi(this.gridApi);
                },
                onColumnEverythingChanged:()=>this.gridApi&&this.gridApi.sizeColumnsToFit(),
                rowSelection:"multiple",
                enableSorting:"true",
                enableFilter:"true",
                enableColResize: true
            },
            themeRenderer:currentTheme(),
            selectAll:false,
            staticActions:[]
        };
        Object.assign(this.state.gridOptions,props.gridOptions)
    }
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
        if(this.props.gridApi)
            this.props.gridApi(null);
    }
    onReady(schema){
        let {staticActions,rowActions} = this.getActions();
        let columnDefs;
        if(!schema||!schema.length)
            columnDefs = [];
        else if(rowActions.length)
            columnDefs = schema.concat([{
                headerName:"",
                suppressFilter:true,
                suppressMenu:true,
                suppressSorting:true,
                cellRendererFramework: this.state.themeRenderer.ActionCellRenderer(rowActions)
            }]);
        else
            columnDefs = schema;
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
                            const resource = this.props.resource;
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
                    headerName:column.label,
                    cellRenderer:column.cellRenderer,
                    cellRendererParams:column.cellRendererParams
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
            if (column.options && typeof column.options === 'function') {
                const asyncOptions = column.options as AsyncOptions;
                return asyncOptions().then(parseField);
            } else
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
                } else{
                    const actionInst = action as StaticAction<T>;
                    actionInst.call['isStatic'] = actionInst.isStatic;
                    actionInst.call['enabled'] = actionInst.enabled;
                    actionInst.call['displayName'] = actionInst.displayName;
                    if(actionInst.isStatic)
                        staticActions.push(actionInst.call as any);
                    else
                        rowActions.push(actionInst.call as any);
                }
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
            <AgGridReact {...gridOptions}/>
        </GridRenderer>;
    }
}