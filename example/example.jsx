/**
 * Created by YS on 2016/9/24.
 */
"use strict";

import {Grid} from "../index.ts"
import ReactDOM from "react-dom"
import {createStore} from "redux"
import {Provider} from "react-redux"
import {GridReducer,RestfulResource} from "../index"
import {Map} from "immutable"
let store = createStore(GridReducer,Map({people:[],grid:{}}));
let schema=[
    {key:'name',label:"名字",type:"input"},
    {key:'age',label:"年龄",type:'input',required:true},
    {key:'gender',label:"性别",type:'select',options:[{name:"男",value:1},{name:"女",value:0}]},
    {key:"birthDay",label:"生日",type:"date"}
];
let resource = new RestfulResource("http://192.168.150.211:3000/api/people",['people'],'people',store.dispatch,[],{
    apiType:"Loopback"
});

ReactDOM.render(
    <Provider store={store}>
        <Grid resource={resource} schema={schema} modelPath={['people']}/>
    </Provider>
    ,document.getElementById('root'));