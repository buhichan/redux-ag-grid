/**
 * Created by YS on 2016/9/24.
 */
"use strict";

import "ag-grid/dist/styles/ag-grid.css"
import "ag-grid/dist/styles/theme-bootstrap.css"
import {Component} from "react"
import * as React from "react"
import {AgGridReact as AgGrid} from "ag-grid-react"
import {AbstractColDef} from "ag-grid";
import {Resource} from "./RestfulResource"
let {connect} =require("react-redux");
import {deepGetState} from "./Utils";

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
    icons?:string,
    parsedSchema?:AbstractColDef[],
    filter?:GridFilter
}
export interface GridProp<T>{
    store:Immutable.Map<any,any>,
    resource:Resource<T>,
    modelPath?:string[]
    schema:GridFieldSchema[],
    onCellDblClick:(...args:any[])=>any
}

@connect(
    store=>({store})
)
export class Grid<T> extends Component<GridProp<T>,GridState>{
    getModels(){
        return deepGetState(this.props.store,...this.props.modelPath)
    }
    state={
        quickFilterText:'',
        icons:"haha",
        parsedSchema:[],
        filter:{
            pagination:{
                limit:20,
                offset:0
            }
        }
    };
    componentDidMount(){
        if(!this.props.resource)
            throw new Error("请使用ResourceAdapterService构造一个Resource");
        this.props.resource.filter(this.state.filter);
        this.props.resource.get();
        this.parseSchema(this.props.schema).then((parsed)=>{
            this.setState({
                parsedSchema:parsed
            })
        });
    }
    parseSchema(schema):Promise<AbstractColDef[]>{
        return Promise.all(schema.map(column=>{
            let parseField:(options:any)=>AbstractColDef = (options)=>({
                field:column.key,
                headerName:column.label
            });
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
    render(){
        return <div className="ag-bootstrap" style={{height:"600px"}}>
            <AgGrid
            onRowDblClicked={this.props.onCellDblClick}
            quickFilterText={this.state.quickFilterText}
            icons={this.state.icons}
            columnDefs={this.state.parsedSchema}
            rowData={this.getModels()}

            rowSelection="multiple"
            enableSorting="true"
            enableFilter="true"/>
        </div>
    }
}