/**
 * Created by YS on 2016/11/16.
 */
import * as React from "react"
import "ag-grid/dist/styles/theme-bootstrap.css"
import {ITheme, setTheme} from "./index";

const Theme:ITheme = {
    SelectFieldRenderer:(options)=>{
        return function SelectFieldRenderer(props) {
            let colors = ['primary', 'success', 'warning', 'info', 'danger'];
            let target;
            if (props.value instanceof Array)
                target = props.value;
            else
                target = [props.value];
            return <div>
                {
                    target.map((value,i)=> {
                        const index = options.findIndex(option=>option.value==value) || 0;
                        return <label key={i} className={'label label-'+colors[index%colors.length]}>{options[index].name}</label>
                    })
                };
            </div>
        };
    },
    GridRenderer:(props)=>{
        return <div className={"redux-ag-grid ag-bootstrap panel panel-default"}>
            <div className="panel-heading clearfix">
                <div className="pull-left">
                    <button className="btn btn-default" onClick={props.onSelectAll}>全选/取消</button>
                </div>
                <div className="btn-group btn-group-sm pull-right">
                    {
                        props.actions.map((action, i)=>
                            <button key={i} className="btn btn-default"
                                    onClick={()=>action(props.gridApi.getSelectedRows(),props.dispatch)}>{action.displayName}</button>)
                    }
                </div>
            </div>
            <div className="panel-body" style={{height:(props.height||600)+"px"}}>
                {props.children}
            </div>
        </div>
    },
    ActionCellRenderer:(actions)=>class ActionCell extends React.Component<any,any> {
        render() {
            return <div className="btn-actions">
                {
                    actions.filter(action=>!action.enabled || action.enabled(this.props.data)).map((action, i)=>
                        <button key={i} className="btn btn-sm btn-primary"
                                ref={(ref)=>{
                            ref&&ref.addEventListener('click',(e)=>{
                                action(action.useSelected?this.props.context.getSelected():this.props.data,this.props.context.dispatch);
                                e.stopPropagation();
                            })
                        }}>{action.displayName}</button>)
                }
            </div>
        }
    }
};

setTheme(Theme);