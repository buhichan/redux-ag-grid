/**
 * Created by YS on 2016/9/24.
 */
"use strict";

import "bootstrap/dist/css/bootstrap.css"
import {ReduxAgGrid,GridFieldSchema,setStore} from "../src"
import * as ReactDOM from "react-dom"
import * as React from "react"
import {createStore} from "redux"
import {GridReducer,RestfulResource} from "../src"
import {Map,fromJS} from "immutable"

let store = createStore((state,action)=>{
    let res = state?state:fromJS({
        people:[],
        grid:{}
    });
    if(state && action && action.type==='jsAction'){
        console.log("received action:\n",action);
    }
    return GridReducer(res,action);
},fromJS({people:[],grid:{}}));

let schema=[
    {key:'name',label:"名字",type:"input"},
    {key:'age',label:"年龄",type:'input',required:true},
    {key:'gender',label:"性别",type:'select',options:[{name:"男",value:1},{name:"女",value:0}]},
    {key:"birthDay",label:"生日",type:"date"}
] as GridFieldSchema[];

let actions = [{
    call:(data)=>{
        store.dispatch({
            type:"jsAction",
            data
        })
    },
    displayName:"jsAction",
    isStatic:false,
    useSelected:false,
},"httpAction"];

let resource = new RestfulResource({
    url:"http://192.168.150.211:3000/api/people",
    modelPath:['people'],
    dispatch:store.dispatch.bind(store),
    apiType:"Loopback",
    actions:[{
        key:"httpAction",
        displayName:"httpAction",
        method:"POST",
        path:":id/customAction2",
        enabled:(data:any)=>{
            return data.gender == 1;
        },
        data:(data)=>{
            return data;
        }
    }]
});

setStore(store);

ReactDOM.render(
    (<div style={{height:"1000px"}} >
        <ReduxAgGrid resource={resource as any} schema={schema} actions={actions} />
    </div>)
    ,document.getElementById('root'));