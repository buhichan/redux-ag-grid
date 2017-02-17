/**
 * Created by YS on 2016/11/16.
 */
import * as React from "react"
import "ag-grid/dist/styles/theme-bootstrap.css"
import {ITheme, setTheme, GridRendererProps} from "./index";

const Theme:ITheme = {
    SelectFieldRenderer:(options)=>function SelectFieldRenderer(props) {
        let colors = ['primary', 'success', 'warning', 'info', 'danger'];
        let {value} = props;
        if(!(value instanceof Array))
            value = [value];
        return <div>
            {
                value.map((value,i)=> {
                    const index= options.findIndex(x=>x.name==value);
                    return <label key={i} className={'label label-'+colors[index%colors.length]}>{value}</label>
                })
            }
        </div>
    },
    GridRenderer:(props:GridRendererProps)=>{
        return <div className={"redux-ag-grid ag-bootstrap panel panel-default"}>
            <div className="panel-heading clearfix">
                {props.noSelect || <div className="pull-left">
                    <button className="btn btn-default" onClick={props.onSelectAll}>全选/取消</button>
                </div>}
                <div className="btn-group btn-group-sm pull-right">
                    {
                        props.actions.map((action, i)=>
                            <button key={i} className="btn btn-default"
                                    onClick={(e)=>action(props.gridApi.getSelectedRows(),e as any)}>{action.displayName}</button>)
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
                        <button
                            key={i}
                            className="btn btn-sm btn-primary"
                            ref={(ref)=>{
                                ref&&ref.addEventListener('click',(e)=>{
                                    action(action.useSelected?this.props.context.getSelected():this.props.data,e);
                                    e.stopPropagation();
                                })
                            }}
                        >{action.displayName}</button>)
                }
            </div>
        }
    }
};

setTheme(Theme);