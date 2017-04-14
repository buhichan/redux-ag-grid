/**
 * Created by YS on 2016/11/16.
 */
import * as React from "react"
import Chip from "material-ui/Chip"
import RaisedButton from "material-ui/RaisedButton"
import TextField from "material-ui/TextField"
import FlatButton from "material-ui/FlatButton"
import {GridApi} from "ag-grid";
import {setTheme} from "./index";

const tinycolor = require('tinycolor2');
const buttonProps = {
    overlayStyle:{padding:"0 15px"},
    style:{
        margin:'0 5px 5px 0',
        color:"white",
        height:"30px",
        lineHeight:"30px",
        fontSize:"12px"
    }
};
const chipStyle = {
    display:"inlineBlock",
    padding:"0 5px",
    zIndex:0
};

let hardCodedColors = {};
let colors = [
    '#4783fa',
    "#fa5f7e",
    "#a9d26a",
    "#fbc000",
];
let buttonTextColor = '#4783fa';
let buttonBackgroundColor = '#ddedff';

export function setColors(colorArray,hardCodedColorMap?,buttonColor?, buttonBGColor?){
    colors = colorArray;
    hardCodedColors = hardCodedColorMap;
    buttonTextColor = buttonColor;
    buttonBackgroundColor = buttonBGColor;
}

const actionContainerStyle={display:"inline-block",marginRight:'3px'};
const actionButtonStyle={
    height: '21px',
    lineHeight: '20px',
    minWidth: '30px',
    zIndex:0
};
const actionButtonLabelStyle={
    fontSize: '10px',
    padding:"0 8px"
};

class SelectionCheckboxRenderer extends React.PureComponent<any,{}>{
    render(){
        return null;
    }
}
class HeaderSelectionCheckboxRenderer extends React.PureComponent<any,{}>{
    render(){
        return null;
    }
}
setTheme({
    SelectionCheckboxRenderer,
    HeaderSelectionCheckboxRenderer,
    SelectFieldRenderer:(options)=> {
        return class ChipEnumCell extends React.Component<any,any> {
            getColor(value,index){
                return hardCodedColors[value]?hardCodedColors[value]:colors[index%colors.length];
            }
            render() {
                const is_fk = /_id$/.test(this.props.colDef.key);
                let target;
                if (this.props.value instanceof Array)
                    target = this.props.value;
                else
                    target = [this.props.value];
                if(options.length<=2)
                    return <div style={{position:'relative',bottom:3}}>
                        {
                            target.map((value, i) => {
                                const index = options.findIndex(option => option.name == value) || 0;
                                const color = this.getColor(value,index);
                                return is_fk ?<span key={i}>{index < 0 ? "" : value}</span>:
                                    (
                                        index >= 0 ?<Chip
                                            style={chipStyle}
                                            labelStyle={{lineHeight:"25px",fontSize:"10px",color}}
                                            key={i}
                                            backgroundColor={tinycolor(color).setAlpha(0.3).toString()}>
                                            {value}
                                        </Chip>: ""
                                    )
                            })
                        }
                    </div>;
                else return <div style={{position:'relative'}}>
                    {
                        target.map((value, i) => {
                            const index = options.findIndex(option => option.name == value) || 0;
                            const color = this.getColor(value,index);
                            return is_fk ?<span key={i}>{index < 0 ? "" : value}</span>:
                                (
                                    index >= 0 ?<div key={i}>
                                        <span style={{
                                            borderRadius:"50%",
                                            backgroundColor:color,
                                            height:10,
                                            width:10,
                                            marginRight:"0.7em",
                                            display:"inline-block"
                                        }} />
                                        {value}
                                    </div>: ""
                                )
                        })
                    }
                </div>
            };
        }
    },
    GridRenderer:class GridRenderer extends React.Component<any,any>{
        gridApi:GridApi;
        pendingUpdate;
        constructor(props){
            super();
            props.apiRef((api)=>{
                this.gridApi = api;
            })
        }
        onSearch=(e)=>{
            const value = e.target['value'];
            if(this.pendingUpdate)
                clearTimeout(this.pendingUpdate);
            this.pendingUpdate = setTimeout(()=>{
                this.gridApi.setQuickFilter(value);
            },400)
        };
        render() {
            return <div className={"redux-ag-grid ag-material "}>
                <div className="grid-topbar" style={{padding:"15px 0"}}>
                    <div className="grid-static-buttons" style={{zIndex:1}}>
                    {
                        this.props.actions.map((action, i)=>{
                            if(action.enabled && !(action.enabled as any)()) return null;
                            else
                                return <RaisedButton
                                    className="grid-button"
                                    labelColor="white"
                                    key={i}
                                    primary={true}
                                    {...buttonProps}
                                    onClick={(e)=>{
                                        if(action.length)
                                            action(this.gridApi.getSelectedRows(),e as any);
                                        else action()
                                    }}
                                >{action.displayName}</RaisedButton>
                        })
                    }
                    </div>
                    <div className="grid-search">
                        {
                            this.props.noSearch ||<div className="grid-search-field">
                                <input
                                    style={{float:"right",minWidth:140}}
                                    name="quick-filter"
                                    type="search"
                                    onChange={this.onSearch}
                                />
                            </div>
                        }
                    </div>
                </div>
                <div style={{height:(this.props.height||600)+"px"}}>
                    {this.props.children}
                </div>
            </div>
        }
    },
    ActionCellRenderer:(actions)=>{
        class ActionCell extends React.Component<any,any>{
            render() {
                return <div className="action-cell">
                    {
                        actions.filter(action=>!action.enabled || action.enabled(this.props.data)).map((action, i)=>
                            <div
                                style={actionContainerStyle}
                                key={i}
                                ref={(ref)=>{
                                    ref&&ref.addEventListener('click',(e)=>{
                                        action(action.useSelected?this.props.context.getSelected():this.props.data,e);
                                        e.stopPropagation();
                                    })
                                }}
                            >
                                <FlatButton
                                    hoverColor={buttonTextColor}
                                    backgroundColor={buttonBackgroundColor}
                                    style={actionButtonStyle}
                                    labelStyle={actionButtonLabelStyle}
                                    label={action.displayName}
                                />
                            </div>)
                    }
                </div>
            }
        }
        return ActionCell;
    }
});