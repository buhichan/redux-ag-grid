/**
 * Created by YS on 2016/9/24.
 */
"use strict";
import "./Grid.css"
import "ag-grid/dist/styles/ag-grid.css"
import "ag-grid/dist/styles/theme-bootstrap.css"
import {Component} from "react"
import * as React from "react"
import {AgGridReact as AgGrid} from "ag-grid-react"
import {AbstractColDef,GridApi,ColumnApi} from "ag-grid";
import {Resource, RestfulResource} from "./RestfulResource"
let {connect} =require("react-redux");
import {deepGetState} from "./Utils";
import {EnumFilter, DateFilter} from "./GridFilters";
import {ActionInstance} from "./ActionClassFactory";
import Dispatch = Redux.Dispatch;

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

export interface GridFieldSchema{
    type?:columnType,
    key:string,
    label:string,
    options?:{
        name:string,
        value:string
    }[] | string
}

export interface GridState{
    quickFilterText?:string,
    parsedSchema?:AbstractColDef[],
    filter?:GridFilter
    selectAll?:boolean
}
export interface GridProp<T>{
    gridName:string,
    store?:Immutable.Map<any,any>,
    resource?:Resource<T>,
    modelPath?:string[]
    schema?:GridFieldSchema[],
    actions?:ActionInstance<T>[],
    onCellClick?:(...args:any[])=>any
    onCellDblClick?:(...args:any[])=>any
    dispatch?:Dispatch<any>
    height?:number
}

@connect(
    store=>({store})
)
export class Grid<T> extends Component<GridProp<T>,GridState>{
    getModels(){
        return deepGetState(this.props.store,...this.props.modelPath||this.props.resource['modelPath'])
    }
    gridApi:GridApi;
    columnApi:ColumnApi;
    state={
        quickFilterText:'',
        parsedSchema:[],
        filter:{
            pagination:{
                limit:20,
                offset:0
            }
        },
        selectAll:false
    };
    componentDidMount(){
        if(!this.props.resource)
            throw new Error("请使用ResourceAdapterService构造一个Resource");
        if(!this.props.modelPath && !this.props.resource['modelPath'])
            throw new Error("请声明modelPath:string[]");
        this.props.resource.filter(this.state.filter);
        this.props.resource.get();
        this.props.resource['gridName'] = this.props.gridName || ('grid'+Math.random());
        this.parseSchema(this.props.schema).then((parsed)=>{
            this.setState({
                parsedSchema:parsed
            })
        });
    }
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
                            colDef['cellRenderer'] = function (params) {
                                let colors = ['primary', 'success', 'warning', 'info', 'danger'];
                                let target;
                                if (params.value instanceof Array)
                                    target = params.value;
                                else
                                    target = [params.value];
                                return target.reduce((prev, cur)=> {
                                    let index = 0;
                                    options.every((option, i)=> {
                                        if (option.value === cur) {
                                            index = i;
                                            return false;
                                        }
                                        return true;
                                    });
                                    return prev + `<label class="label label-${colors[index % colors.length]}">${options[index].name}</label>`
                                }, "");
                            };
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
            if(typeof column.options === "string"){
                return Promise.resolve(fetch(column.options as string,{
                    method:"GET",
                    headers:{
                        "Content-Type":"applicatoin/json"
                    }
                })).then(res=>res.json()).then(parseField)
            }else
                return Promise.resolve(parseField(column.options))
        }))
    }
    getActions(){
        let staticActions:ActionInstance<T>[] = [];
        let rowActions:ActionInstance<T>[] = [];
        let restResource = this.props.resource as RestfulResource<T>;
        if(restResource.actions)
            restResource.actions.forEach(action=>{
                if(action.isStatic)
                    staticActions.push(action);
                else
                    rowActions.push(action);
            });
        if(this.props.actions)
            this.props.actions.forEach(action=>{
                if(action.isStatic)
                    staticActions.push(action);
                else
                    rowActions.push(action);
            });
        return {
            staticActions,
            rowActions
        }
    }
    render(){
        let {staticActions,rowActions} = this.getActions();
        return <div className={"redux-ag-grid ag-bootstrap panel panel-default"}>
            <div className="panel-heading clearfix">
                <div className="pull-left">
                    <button className="btn btn-default" onClick={()=>{
                        this.state.selectAll?this.gridApi.deselectAll():this.gridApi.selectAll();
                        this.state.selectAll = !this.state.selectAll;
                    }}>全选/取消</button>
                </div>
                <div className="btn-group btn-group-sm pull-right">
                    {
                        staticActions.map((action, i)=>
                        <button key={i} className="btn btn-default"
                                onClick={()=>action(this.gridApi.getSelectedRows(),this.props.dispatch)}>{action.displayName}</button>)
                    }
                </div>
            </div>
            <div className="panel-body" style={{height:(this.props.height||600)+"px"}}>
                <AgGrid
                    onRowDblClicked={this.props.onCellDblClick}
                    quickFilterText={this.state.quickFilterText}
                    columnDefs={this.state.parsedSchema.concat([{
                        headerName:"",
                        suppressFilter:true,
                        suppressMenu:true,
                        suppressSorting:true,
                        cellRendererFramework:ActionCell
                    }])}
                    rowData={this.getModels()}
                    rowHeight={40}
                    context={{
                        getSelected:()=>this.gridApi.getSelectedRows(),
                        dispatch:this.props.dispatch,
                        rowActions
                    }}
                    onGridReady={params=>{this.gridApi=params.api;this.columnApi=params.columnApi}}
                    onColumnEverythingChanged={()=>this.gridApi&&this.gridApi.sizeColumnsToFit()}
                    rowSelection="multiple"
                    enableSorting="true"
                    enableFilter="true"/>
            </div>
        </div>
    }
}

class ActionCell extends React.Component<any,any>{
    render(){
        return <div className="btn-actions">
            {
                this.props.context.rowActions.filter(action=>!action.enabled||action.enabled(this.props.data)).map((action, i)=>
                    <button key={i} className="btn btn-sm btn-primary"
                        ref={(ref)=>{
                            ref&&ref.addEventListener('click',(e)=>{
                                action(action.useSelected?this.props.context.getSelected():this.props.data,this.props.context.dispatch)
                                e.stopPropagation();
                            })
                        }}>{action.displayName}</button>)
            }
        </div>
    }
}