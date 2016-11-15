/**
 * Created by YS on 2016/9/24.
 */
"use strict";

import {Grid} from "../index.ts"
import ReactDOM from "react-dom"
import {createStore} from "redux"
import {Provider} from "react-redux"
import {GridReducerFactory,RestfulResource} from "../index"
import {Map} from "immutable"

let GridReducer = GridReducerFactory(x=>x._id);

let store = createStore((state,action)=>{
    let res = state?state:{
        people:[],
        grid:{}
    };
    if(state && action && action.type==='jsAction'){
        console.log("received action:\n",action);
    }
    return GridReducer(res,action);
},Map({people:[],grid:{}}));

let schema=[
    {key:'name',label:"名字",type:"input"},
    {key:'age',label:"年龄",type:'input',required:true},
    {key:'gender',label:"性别",type:'select',options:[{name:"男",value:1},{name:"女",value:0}]},
    {key:"birthDay",label:"生日",type:"date"}
];

let httpActions = [{
    name:'customAction2',
    displayName:"httpAction",
    isStatic:false,
    enabled:(data)=>{
        return data.gender == 1;
    },
    data:(data)=>{
        return data;
    }
}];

let action1 = (data,dispatch)=>{
    dispatch({
        type:"jsAction",
        data
    })
};

let jsActions = [Object.assign(action1,{
    displayName:"jsAction",
    isStatic:false,
    useSelected:false,
})];

let resource = new RestfulResource("http://192.168.150.211:3000/api/people",['people'],'people',store.dispatch,httpActions,{
    apiType:"Loopback"
});

ReactDOM.render(
    <Provider store={store}>
        <Grid resource={resource} schema={schema} modelPath={['people']} actions={jsActions}/>
    </Provider>
    ,document.getElementById('root'));