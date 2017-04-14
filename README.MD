# A component using redux and ag-grid

Usage:

```typescript jsx
import {AgGridReact} from "ag-grid-react";
import {AgGridReact} from "ag-grid-react";
import {RestfulResource,ReduxAgGrid,setStore,GridReducer,GridFieldSchema} from "redux-ag-grid";
import "ag-grid-react/build/themes/Bootstrap" //or ".../Material"
const schema=[
    {
        key:"username",
        type:"text",
        label:"Username foo"
    },{
        key:"role",
        type:"select",
        label:"Role",
        options:[
            {
                name:"Admin",
                value:"0"
            },{
                name:"Guest",
                value:"1"
            }
        ]
    }
];

function NoneReduxStyle(){
    return <ReduxAgGrid data={[]} schema={schema}>
        <AgGridReact />
    </ReduxAgGrid>
}

import {createStore,Store} from "redux";
import {fromJS} from "immutable";

let store:Store = createStore((state,action)=>{
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
        } as any)
    },
    displayName:"jsAction",
    isStatic:false,
    useSelected:false,
},"httpAction"];

let UserResource = new RestfulResource({
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

function ReduxStyle(){
    return <ReduxAgGrid resource={UserResource} schema={schema}>
        <AgGridReact />
    </ReduxAgGrid>
}
```

Please refer to the example and typescript definition file as a simple document.

You'll need to import u-icon font icon to make grid header icon appear.