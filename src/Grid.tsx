/**
 * Created by YS on 2016/9/24.
 */
"use strict";
import "ag-grid/dist/styles/ag-grid.css"
import {Component} from "react"
import * as React from "react"
import {IGetRowsParams} from "ag-grid"
import {AgGridReact} from "ag-grid-react"
import {AbstractColDef,ColDef,GridApi,ColumnApi} from "ag-grid";
import {RestfulResource} from "./RestfulResource"
import {deepGetState, deepGet} from "./Utils";
import {EnumFilter, DateFilter} from "./GridFilters";
import {ActionInstance, BaseActionDef} from "./ActionClassFactory";
import {currentTheme, ITheme} from "./themes"
import "./themes/Bootstrap"
import {List} from "immutable";
import {Store} from "redux"

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

const formatDate = new Intl.DateTimeFormat(['zh-CN'],{
    hour12:false,
    year:"numeric",
    month:"2-digit",
    day:"2-digit"
});

const formatDateTime = new Intl.DateTimeFormat(['zh-CN'],{
    hour12:false,
    year:"numeric",
    month:"2-digit",
    day:"2-digit",
    hour:"2-digit",
    minute:"2-digit",
    second:"2-digit"
});

export type columnType = "text"|"number"|"select"|"checkbox"|"date"|"datetime-local"|"group"|null
export type Options = {name:string,value:string|number}[]
export type AsyncOptions = ()=>Promise<Options>

export interface GridFieldSchema extends ColDef{
    type:columnType,
    key:string,
    label:string,
    options?:Options | AsyncOptions,
    children?:GridFieldSchema[]
}

export interface GridState<T>{
    quickFilterText?:string,
    gridOptions?:any,
    themeRenderer:ITheme,
    selectAll?:boolean,
    models:List<T>,
    staticActions:ActionInstance<T>[]
}

export interface InstanceAction<T> extends BaseActionDef<T>{
    call:(data:T,e?:Event)=>any
}

export interface StaticAction<T> extends BaseActionDef<T> {
    isStatic:true,
    call:(data:T[],e?:Event)=>any
}

export interface GridProps<T>{
    gridName?:string,
    gridApi?:(gridApi:GridApi)=>void,
    resource?:RestfulResource<T,any>,
    schema?:GridFieldSchema[],
    actions?:(InstanceAction<T>|StaticAction<T>|string)[],
    gridOptions?:any,
    dispatch?:any,
    height?:number,
    serverSideFilter?:boolean,
    data?:T[] | List<T>
    noSearch?:boolean
    noSelect?:boolean
}

function getValue(model,field){
    if(/\.|\[|\]/.test(field))
        return deepGet(model,field);
    else return model[field]
}

const formatNumber= new Intl.NumberFormat([],{
    currency:"CNY"
});

let Store:Store<any>;

export function setStore(store){
    Store = store;
}

export class Grid<T> extends Component<GridProps<T>,GridState<T>>{
    gridApi:GridApi;
    columnApi:ColumnApi;
    shouldComponentUpdate(nextProps:GridProps<T>,nextState:GridState<T>){
        if(this.props.schema !== nextProps.schema ||
            this.props.actions !== nextProps.actions ||
            this.state.gridOptions.colDef !== nextState.gridOptions.colDef ||
            this.state.staticActions !== nextState.staticActions
        ) return true;
        if(this.props.resource) { //resource mode
            return nextState.models !== this.state.models;
        }else //data mode
            return this.props.data !== nextProps.data;
    }
    constructor(props,context){
        super(props);
        this.state = {
            quickFilterText:'',
            models:List() as List<T>,
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
                onColumnEverythingChanged:()=>window.innerWidth>=480&&this.gridApi&&this.gridApi.sizeColumnsToFit(),
                rowSelection:"multiple",
                enableSorting:"true",
                enableFilter:"true",
                enableColResize: true
            },
            themeRenderer:currentTheme(),
            selectAll:false,
            staticActions:[]
        };
        Object.assign(this.state.gridOptions,props.gridOptions);
    }
    componentDidMount(){
        if(this.props.resource)
            this.unsubscriber = Store.subscribe(this.handleStoreChange.bind(this));
    }
    handleStoreChange(){
        if(this.props.resource) {
            const models = deepGetState(Store.getState(), ...this.props.resource.modelPath);
            this.setState({
                models
            })
        }
    }
    unsubscriber;
    componentWillUnmount(){
        this.isUnmounting = true;
        if(this.props.gridApi)
            this.props.gridApi(null);
        this.unsubscriber && this.unsubscriber();
    }
    componentWillMount(){
        if(!this.props.resource && !this.props.data) {
            throw new Error("请使用ResourceAdapterService构造一个Resource或传入data");
        }else if(this.props.resource){
            if (!this.props.resource.modelPath)
                throw new Error("请在resource上声明modelPath:string[]");
            this.props.resource.get();
            this.props.resource['gridName'] = this.props.gridName || ('grid' + Math.random());
        }
        this.parseSchema(this.props.schema).then((parsed)=> {
            this.onReady(parsed)
        });
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
                dispatch:this.props.dispatch
            },
        });
        if(this.props.resource) {
            //todo: server side filtering
            if (this.props.serverSideFilter) {
                gridOptions['rowModelType'] = 'virtual';
                gridOptions['datasource'] = {
                    getRows: (params: IGetRowsParams)=> {
                        let data = deepGetState(Store.getState(), ...this.props.resource.modelPath);
                        if (data.length < params.endRow) {
                            const resource = this.props.resource;
                            resource.filter({
                                pagination: {
                                    offset: params.startRow,
                                    limit: params.endRow - params.startRow
                                }
                            });
                            resource.get().then(()=> {
                                let data = deepGetState(Store.getState(), ...this.props.resource.modelPath);
                                params.successCallback(data.slice(params.startRow, params.endRow), data.length <= params.endRow ? data.length : undefined);
                            });
                        }
                        else
                            params.successCallback(data.slice(params.startRow, params.endRow));
                    }
                };
            } else
                gridOptions['rowData'] = deepGetState(Store.getState(), ...this.props.resource.modelPath);
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
    componentWillReceiveProps(newProps:GridProps<T>){
        if(newProps.schema!==this.props.schema)
            this.parseSchema(newProps.schema).then((parsed)=>{
                this.onReady(parsed)
            });
    }
    parseSchema(schema:GridFieldSchema[]):Promise<AbstractColDef[]>{
        return Promise.all(schema.map(column=>{
            let syncParseField:(options:any,children?)=>AbstractColDef = (options,children?)=>{
                let colDef=Object.assign({
                    headerName:column.label
                },column);
                //todo deep key not works with select/date
                switch (column.type){
                    case "select":
                        colDef['valueGetter']= function enumValueGetter({colDef,data}){
                            function getValueByName(entryValue){
                                const i = options.findIndex(x=>x.value==entryValue);
                                if(i<0) return null;
                                else return options[i].name;
                            }
                            const value = getValue(data,colDef.key);
                            if (value instanceof Array)
                                return value.map(getValueByName).filter(null);
                            else
                                return getValueByName(value)
                        };
                        colDef['cellRendererFramework'] = this.state.themeRenderer.SelectFieldRenderer(options);
                        colDef['options'] = options;
                        colDef['filterFramework'] = EnumFilter;
                        break;
                    case "date":
                    case "datetime-local":
                        let formatter:Intl.DateTimeFormat;
                        if(column.type === "date")
                            formatter = formatDate;
                        else
                            formatter = formatDateTime;
                        colDef['valueGetter']= ({colDef,data})=>{
                            const v = getValue(data,colDef.key);
                            return v?formatter.format(new Date(v)): ""
                        };
                        colDef['filterFramework'] = DateFilter;
                        break;
                    case "number":
                        colDef['valueGetter'] = ({colDef,data})=>formatNumber.format(getValue(data,colDef.key));
                        break;
                    case "checkbox":
                        colDef['valueGetter'] = ({colDef,data})=>getValue(data,colDef.key)?"是":"否";
                        break;
                    case "group":
                        colDef['children'] = children;
                        colDef['marryChildren'] = true;
                        break;
                    default:
                        colDef['field']= column.key && column.key.replace(/\[(\d+)\]/g,".$1");
                }
                return colDef;
            };
            if (column.options && typeof column.options === 'function') {
                const asyncOptions = column.options as AsyncOptions;
                return asyncOptions().then(syncParseField);
            } else if(column.type==='group' && column.children){
                return this.parseSchema(column.children).then(children=>{
                    return syncParseField(column.options,children)
                })
            } else
                return Promise.resolve(syncParseField(column.options))
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
            gridOptions['rowData'] = this.state.models.toArray();
        else if(this.props.data)
            gridOptions['rowData'] = this.props.data;
        let GridRenderer = this.state.themeRenderer.GridRenderer;
        return <GridRenderer
            noSearch={this.props.noSearch}
            noSelect={this.props.noSelect}
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

const a = Grid as new()=>Grid<number>;