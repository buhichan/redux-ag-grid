/**
 * Created by buhi on 2017/2/28.
 */
import * as React from "react"
import {ITheme,setTheme} from "../"
import IconButton from "material-ui/IconButton"
import Chip from "material-ui/Chip"
import RaisedButton from "material-ui/RaisedButton"
import TextField from "material-ui/TextField"
import FlatButton from "material-ui/FlatButton"
import ArrowForward from "material-ui/svg-icons/navigation/arrow-forward"
import ArrowBack from "material-ui/svg-icons/navigation/arrow-back"
import Checkbox from 'material-ui/Checkbox'
import "ag-grid/dist/styles/theme-material.css"
import {ICellRendererParams, IHeaderParams, GridApi} from "ag-grid";
import {GridRendererProps} from "./index";
setTheme({
    SelectionCheckboxRenderer:class CheckboxCell extends React.PureComponent<ICellRendererParams,any>{
        refresh(){}
        render(){
            return <div>
                <Checkbox />
                to be implemented
            </div>
        }
    },
    HeaderSelectionCheckboxRenderer:class HeaderCheckboxCell extends React.PureComponent<IHeaderParams,any>{
        refresh(){}
        toggle(){

        }
        render(){
            return <div>
                <Checkbox
                    checked={false}
                />
                to be implemented
            </div>
        }
    },
    SelectFieldRenderer:(options)=> {
        class EnumCell extends React.Component<ICellRendererParams,any> {
            static colors = [
                'rgba(255,0,0,0.2)',
                'rgba(127,127,0,0.2)',
                'rgba(0,255,0,0.2)',
                'rgba(0,127,127,0.2)',
                'rgba(0,0,255,0.2)',
                'rgba(127,0,127,0.2)'
            ];
            refresh(){}
            render() {
                const is_fk = /_id$/.test(this.props.colDef['key']);
                let target;
                if (this.props.value instanceof Array)
                    target = this.props.value;
                else
                    target = [this.props.value];
                return <div style={{position:'relative',bottom:'2px'}}>
                    {
                        target.map((value, i) => {
                            const index = options.findIndex(option => option.name == value) || 0;
                            return is_fk ?<span key={i}>{index < 0 ? "" : value}</span>:
                                (
                                    index >= 0 ?<Chip
                                            style={{display:'inline-block',zIndex:0}}
                                            labelStyle={{lineHeight:"25px",fontSize:"10px",color:"black"}}
                                            key={i}
                                            backgroundColor={EnumCell.colors[index%EnumCell.colors.length]}>
                                            {value}
                                        </Chip>: ""
                                )
                        })
                    }
                </div>
            };
        }
        return EnumCell;
    },
    GridRenderer:class GridRenderer extends React.Component<GridRendererProps,any>{
        pendingUpdate;
        gridApi:GridApi;
        constructor(props){
            super();
            props.apiRef((api)=>{
                this.gridApi = api;
                api.addEventListener('paginationPageLoaded',this.boundForceUpdate);
            })
        }
        boundForceUpdate=()=>this.forceUpdate();
        componentWillUnmount(){
            this.gridApi.removeEventListener('paginationPageLoaded',this.boundForceUpdate);
        }
        onPaginationChange=(e)=>{
            const pageNumber = e.target.value;
            if(isFinite(pageNumber))
                this.gridApi.paginationGoToPage(pageNumber);
        };
        goPrevPage=()=>{
            this.gridApi.paginationGoToPreviousPage();
        };
        goNextPage=()=>{
            this.gridApi.paginationGoToNextPage()
        };
        render() {
            const api = this.gridApi;
            const buttonProps = {
                overlayStyle:{padding:"0 15px"}
            };
            return <div className={"redux-ag-grid ag-material "}>
                <div className="row" style={{padding:"15px 0"}}>
                    <div className="col-xs-12 col-md-9" style={{zIndex:1}}>
                        {
                            this.props.actions.map((action, i)=>{
                                if(action.enabled && !(action.enabled as any)()) return null;
                                else
                                    return <RaisedButton style={{margin:'0 5px 5px 0'}}
                                                         key={i}
                                        {...buttonProps}
                                                         onClick={(e)=>action(api.getSelectedRows(),e as any)}>{action.displayName}</RaisedButton>
                            })
                        }
                    </div>
                    <div className="col-xs-12 col-md-3">
                        {
                            this.props.noSearch ||
                            <TextField
                                fullWidth={true}
                                style={{marginTop:"-39px",top:"9px"}}
                                name="quick-filter"
                                floatingLabelText="搜索..."
                                onChange={(e)=>{
                                const value = e.target['value'];
                                if(this.pendingUpdate)
                                    clearTimeout(this.pendingUpdate);
                                this.pendingUpdate = setTimeout(()=>{
                                    api.setQuickFilter(value);
                                },400)
                            }}
                            />
                        }
                    </div>
                </div>
                <div style={{height:(this.props.height||600)+"px"}}>
                    {this.props.children}
                </div>
                {api?
                <div>
                    <IconButton
                        style={{float:'left'}}
                        onTouchTap={this.goPrevPage}
                    >
                        <ArrowBack />
                    </IconButton>
                    <label style={{
                        marginTop:9,
                        lineHeight:"25px"
                    }}>
                        <input
                            style={{
                                lineHeight:"25px"
                            }}
                            type="text"
                            value={`${api.paginationGetCurrentPage()+1}`}
                            onChange={this.onPaginationChange}
                        />
                        /{api.paginationGetTotalPages()}页
                    </label>
                    <IconButton
                        style={{float:'right'}}
                        onTouchTap={this.goNextPage}
                    >
                        <ArrowForward />
                    </IconButton>
                </div>:null}
            </div>
        }
    },
    ActionCellRenderer:(actions)=>{
        class ActionCell extends React.Component<ICellRendererParams,any>{
            containerStyle={display:"inline-block",marginRight:'3px'};
            buttonStyle={
                height: '21px',
                lineHeight: '20px',
                minWidth: '30px'
            };
            buttonLabelStyle={
                fontSize: '10px',
                paddingLeft:'5px',
                paddingRight:"5px"
            };
            refresh(){}
            render() {
                return <div className="action-cell">
                    {
                        actions.filter(action=>!action.enabled || action.enabled(this.props.data)).map((action, i)=>
                            <div
                                style={this.containerStyle}
                                key={i}
                                ref={(ref)=>{
                                    ref&&ref.addEventListener('click',(e)=>{
                                        action(action.useSelected?this.props.context.getSelected():this.props.data,e);
                                        e.stopPropagation();
                                    })
                                }}
                            >
                                <FlatButton style={this.buttonStyle} labelStyle={this.buttonLabelStyle} label={action.displayName}/>
                            </div>)
                    }
                </div>
            }
        }
        return ActionCell;
    }
});