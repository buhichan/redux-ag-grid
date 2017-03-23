/**
 * Created by YS on 2016/9/24.
 */
"use strict";
import "ag-grid/dist/styles/ag-grid.css"
import {Component} from "react"
import * as React from "react"
import {IGetRowsParams, GridOptions, ColGroupDef} from "ag-grid"
import {AbstractColDef,ColDef,GridApi,ColumnApi} from "ag-grid";
import {RestfulResource} from "./RestfulResource"
import {deepGetState, deepGet} from "./Utils";
import {getFilter} from "./GridFilters";
import {ActionInstance, BaseActionDef} from "./ActionClassFactory";
import {currentTheme, ITheme} from "./themes"
import {List} from "immutable";
import {Store} from "redux"

export type columnType = "text"|"number"|"select"|"checkbox"|"date"|"datetime-local"|"datetime"|"group"|"time"|null;
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
    gridOptions?:GridOptions,
    themeRenderer:ITheme,
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
    columnApi?:(columnApi:ColumnApi)=>void,
    resource?:RestfulResource<T,any>,
    schema?:GridFieldSchema[],
    actions?:(InstanceAction<T>|StaticAction<T>|string)[],
    gridOptions?:GridOptions,
    dispatch?:any,
    height?:number,
    serverSideFiltering?:boolean,
    data?:T[] | List<T>
    noSearch?:boolean,
    selectionStyle?:"row"|"checkbox",
    actionColDef?:any
}

//todo: 1.3.0:做个selection的prop,表示用表头checkbox还是单击行来选择.

function getValue(model,field){
    if(/\.|\[|\]/.test(field))
        return deepGet(model,field);
    else return model[field]
}
function defaultValueGetter({colDef,data}){
    return getValue(data,colDef.key);
}

let Store:Store<any>;

export function setStore(store){
    Store = store;
}

const timeFormatOptions = {hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false};
const dateFormatOptions = {year:"numeric",month:"2-digit",day:"2-digit"};
const datetimeFormatOptions = {year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false};

export class ReduxAgGrid<T> extends Component<GridProps<T>,GridState<T>>{
    gridApi:GridApi;
    shouldComponentUpdate(nextProps:GridProps<T>,nextState:GridState<T>){
        if(this.props.schema !== nextProps.schema ||
            this.props.actions !== nextProps.actions ||
            this.state.gridOptions.columnDefs !== nextState.gridOptions.columnDefs ||
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
            models: this.props.resource?deepGetState(Store.getState(), ...this.props.resource._modelPath) as List<T>:null,
            gridOptions:{
                columnDefs:[],
                suppressNoRowsOverlay:true,
                rowData:[],
                paginationPageSize:20,
                suppressPaginationPanel:true,
                rowModelType:this.props.serverSideFiltering?"pagination":undefined,
                rowHeight:40,
                onGridReady:(params)=>{
                    this.gridApi=params.api;
                    if(this.props.columnApi)
                        this.props.columnApi(params.columnApi);
                    if(this.apiSender)
                        this.apiSender.forEach(send=>send(params.api));
                },
                onColumnEverythingChanged:()=>window.innerWidth>=480&&this.gridApi&&this.gridApi.sizeColumnsToFit(),
                rowSelection:"multiple",
                enableSorting:true,
                enableFilter:true,
                enableColResize: true
            },
            themeRenderer:currentTheme(),
            staticActions:[]
        };
        Object.assign(this.state.gridOptions,props.gridOptions);
        if(this.props.gridApi)
            this.apiSender.push(this.props.gridApi);
    }
    apiSender=[];
    sendApi=(cb)=>{
        this.apiSender.push(cb);
    };
    componentDidMount(){
        if(this.props.resource)
            this.unsubscriber = Store.subscribe(this.handleStoreChange.bind(this));
    }
    handleStoreChange(){
        if(this.props.resource) {
            const models = deepGetState(Store.getState(), ...this.props.resource._modelPath);
            this.setState({
                models
            })
        }
    }
    unsubscriber;
    pendingResize;
    onResize=()=>{
        if(this.pendingResize)
            clearTimeout(this.pendingResize);
        setTimeout(()=>this.gridApi && this.gridApi.sizeColumnsToFit(),300);
    };
    componentWillUnmount(){
        this.isUnmounting = true;
        if(this.props.gridApi)
            this.props.gridApi(null);
        this.unsubscriber && this.unsubscriber();
        if(this.apiSender)
            this.apiSender.forEach(send=>send(null));
        window.removeEventListener('resize',this.onResize);
    }
    componentWillMount(){
        if(!this.props.resource && !this.props.data) {
            throw new Error("请使用ResourceAdapterService构造一个Resource或传入data");
        }else if(this.props.resource){
            if (!this.props.resource._modelPath)
                throw new Error("请在resource上声明modelPath:string[]");
            this.props.resource._gridName = this.props.gridName || ('grid' + Math.random());
        }
        window.addEventListener('resize',this.onResize);
        this.parseSchema(this.props.schema).then((parsed)=> {
            this.onReady(parsed)
        });
    }
    onReady(schema){
        let {staticActions,rowActions} = this.getActions();
        const gridOptions:GridOptions = {
            ...this.state.gridOptions,
            quickFilterText: this.state.quickFilterText,
            context: {
                getSelected: () => this.gridApi.getSelectedRows(),
                dispatch: this.props.dispatch
            }
        };
        let columnDefs:ColDef[];
        if(!schema||!schema.length)
            columnDefs = [];
        else {
            if (rowActions.length)
                columnDefs = schema.concat({
                    headerName: "",
                    suppressFilter: true,
                    suppressMenu: true,
                    suppressSorting: true,
                    cellRendererFramework: this.state.themeRenderer.ActionCellRenderer(rowActions),
                    ...this.props.actionColDef||{}
                });
            else
                columnDefs = schema;
            if(this.props.selectionStyle === 'checkbox') {
                //todo: if checkbox renderer is defined, use it, otherwise use ag-grid's default
                // if(this.state.themeRenderer.CheckboxRenderer)
                //     columnDefs.unshift({
                //         cellRendererFramework: this.state.themeRenderer.CheckboxRenderer,
                //         headerName: "",
                //         suppressFilter: true,
                //         suppressMenu: true,
                //         suppressSorting: true,
                //         headerComponentFramework: this.state.themeRenderer.CheckboxRenderer
                //     });
                columnDefs.unshift({
                    checkboxSelection: true,
                    valueGetter:()=>"",
                    headerName:"",
                    width:62,
                    suppressResize:true,
                    headerCheckboxSelection: true,
                    headerCheckboxSelectionFilteredOnly: true
                });
                gridOptions.suppressRowClickSelection = true;
            }else if(this.props.selectionStyle === 'row')
                gridOptions.suppressRowClickSelection = false;
        }
        gridOptions.columnDefs = columnDefs;
        if(this.props.resource) {
            if (this.props.serverSideFiltering) {
                gridOptions.datasource = {
                    getRows: (params: IGetRowsParams)=> {
                        const storeState = Store.getState();
                        const resource = this.props.resource;
                        const allData = deepGetState(storeState, ...this.props.resource._modelPath);
                        const gridInfo = deepGetState(storeState, 'grid',resource._gridName);
                        const {count,countedTime} = gridInfo?gridInfo.toObject():{count:null,countedTime:0};
                        const data = allData.slice(params.startRow, params.endRow).toArray();
                        if (
                            Date.now()-countedTime>resource._cacheTime*1000 ||
                            count === null ||
                            data.some(x=>x===null) ||
                            data.length < Math.min(count,params.endRow) - params.startRow
                        ) { // has no total number, or data has some holes
                            resource.filter({
                                pagination: {
                                    offset: params.startRow,
                                    limit: params.endRow - params.startRow
                                }
                            });
                            Promise.all([
                                resource.get(),
                                resource.count(),
                            ]).then(([data,count])=> {
                                params.successCallback(data, count);
                            });
                        }
                        else if (count !== null)
                            params.successCallback(data, count);
                        else // fallback
                            params.successCallback(data);
                    }
                };
            } else {
                this.props.resource.get().then(()=>{
                    this.state.gridOptions.rowData = deepGetState(Store.getState(), ...this.props.resource._modelPath);
                    this.setState({gridOptions:this.state.gridOptions});
                })
            }
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
                        colDef.valueGetter= function enumValueGetter({colDef,data}){
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
                        colDef.cellRendererFramework= this.state.themeRenderer.SelectFieldRenderer(options);
                        colDef['_options'] = options; //may be polluted ?
                        break;
                    case "date":
                        colDef.valueGetter= ({colDef,data})=>{
                            const v = getValue(data,colDef.key);
                            return v?new Date(v).toLocaleDateString(undefined,dateFormatOptions).replace(/\//g,'-'): ""
                        };break;
                    case "time":
                        colDef.valueGetter= ({colDef,data})=>{
                            const v = getValue(data,colDef.key);
                            return v?new Date(v).toLocaleTimeString(undefined,timeFormatOptions): ""
                        };break;
                    case "datetime":
                    case "datetime-local":
                        colDef.valueGetter= ({colDef,data})=>{
                            const v = getValue(data,colDef.key);
                            return v?new Date(v).toLocaleString(undefined,datetimeFormatOptions).replace(/\//g,'-'): ""
                        };break;
                    case "number":
                        colDef.valueGetter = defaultValueGetter;
                        colDef.cellRenderer = ({value})=>Number(value).toLocaleString();
                        break;
                    case "checkbox":
                        colDef.valueGetter = ({colDef,data})=>getValue(data,colDef.key)?"是":"否";
                        break;
                    case "group":
                        (colDef as ColGroupDef).children = children;
                        (colDef as ColGroupDef).marryChildren = true;
                        break;
                    default:
                        colDef.field= column.key && column.key.replace(/\[(\d+)\]/g,".$1");
                }
                const filter = getFilter(column.type);
                if(filter)
                    colDef.filterFramework = filter;
                if(column.key)
                    colDef.colId = column.key;
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
        let staticActions:StaticAction<T>[] = [];
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
                    Object.assign(actionInst.call,actionInst);
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
        const AgGrid = React.Children.only(this.props.children);
        let {staticActions,gridOptions} = this.state;
        if(!this.props.serverSideFiltering && this.props.resource)
            gridOptions.rowData = this.state.models.toArray();
        else if(this.props.data)
            gridOptions.rowData = this.props.data as T[];
        let GridRenderer = this.state.themeRenderer.GridRenderer;
        const AgGridCopy = React.cloneElement(AgGrid,Object.assign(gridOptions,AgGrid.props));
        return <GridRenderer
            noSearch={this.props.noSearch}
            actions={staticActions}
            dispatch={this.props.dispatch}
            apiRef={this.sendApi}
            height={this.props.height}
        >
            {AgGridCopy}
        </GridRenderer>;
    }
}