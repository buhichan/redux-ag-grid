/**
 * Created by buhi on 2017/3/7.
 */
import * as React from "react"
import {IHeaderReactComp} from "ag-grid-react/lib/interfaces";
import {IHeaderParams} from "ag-grid";

const sortOrder = [null,'asc','desc'];

export class CustomGridHeader extends React.PureComponent<{},{}> implements IHeaderReactComp{
    state={
        sort:null,
    };
    constructor(private params:IHeaderParams){
        super();
    }
    filterChanged=()=>{
        this.forceUpdate();
    };
    componentWillMount(){
        this.params.column.addEventListener('filterChanged',this.filterChanged)
    }
    componentWillUnmount(){
        this.params.column.removeEventListener('filterChanged',this.filterChanged)
    }
    changeSort=()=>{
        const i = sortOrder.indexOf(this.state.sort);
        const newState = sortOrder[(i+1)%3];
        this.params.setSort(newState,true);
        this.setState({
            sort:newState
        })
    };
    refresh(){
        console.log(arguments);
    }
    filter;
    openFilterMenu=()=>{
        this.params.showColumnMenu(this.filter)
    };
    bindRef=ref=>this.filter=ref;
    render(){
        const {displayName,enableSorting,column:{filterActive}} = this.params;
        if(!displayName) return null;
        return <div className="custom-grid-header">
            <span className="header-label">{displayName}</span>
            <span className={"grid-filter icon-list_ico4"+(filterActive?" active":"")} ref={this.bindRef} onClick={this.openFilterMenu}/>
            {enableSorting && <span className={"grid-sort icon-"+getSortClassName(this.state.sort)} onClick={this.changeSort}/>}
        </div>
    }
}

function getSortClassName(sort){
    switch(sort){
        case 'asc': return "list_ico2 active";
        case 'desc': return "list_ico active";
        default: return "list_ico3";
    }
}

export const defaultGridOptions = {
    rowHeight:45,
    headerHeight:30,
    localeText:{
        filterOoo:"过滤...",
        applyFilter:"应用",
        equals:"=",
        lessThan: '<',
        greaterThan: '>',
        notContains:"不包含",
        notEquals:"≠",

        // for text filter
        contains: '包含',
        startsWith: '以...开始',
        endsWith: '以...结束',
    },
    defaultColDef:{
        headerComponentFramework:CustomGridHeader as new()=>any
    }
};