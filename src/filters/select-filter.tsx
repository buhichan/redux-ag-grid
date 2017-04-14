/**
 * Created by buhi on 2017/3/6.
 */
import * as React from "react"
import {IDoesFilterPassParams,IFilterParams} from "ag-grid";
import {List } from "immutable"
import {List as MuiList,ListItem} from "material-ui"
import Divider from "material-ui/Divider"
import Checkbox from "material-ui/Checkbox"
import {IFilterReactComp} from "ag-grid-react/lib/interfaces";
import FilterIcon from "material-ui/svg-icons/content/filter-list"

const listItemStyle:React.CSSProperties = {
    padding:"8px 12px 8px 72px",
    fontWeight:'normal',
    fontSize:"12px",
    marginBottom:0
};
const checkboxStyle:React.CSSProperties = {
    top:4
};
export class EnumFilter extends React.PureComponent<any,any> implements IFilterReactComp{
    options:any[]=[];
    state={
        selected:List()
    };
    params:IFilterParams;
    constructor(params) {
        super();
        this.params = params;
        this.options = params.colDef._options;
    }
    onSelectAll=()=>{
        if(this.state.selected.size < this.options.length)
            this.setState({
                selected:List(this.options.map(x=>x.name))
            },this.params.filterChangedCallback);
        else
            this.setState({
                selected:this.state.selected.clear()
            },this.params.filterChangedCallback);
    };
    render(){
        return <MuiList style={{
            padding:"0 0 5px 0",
            maxHeight:250
        }}>
            <ListItem
                key={"$$select//all"}
                style={listItemStyle}
                leftCheckbox={
                   <Checkbox
                       style={checkboxStyle}
                       checked={this.state.selected.size===this.options.length}
                   />
                }
                onChange={this.onSelectAll}
                primaryText={"全选"}
            />
            <Divider />
            {
                this.options.map((option)=>{
                    return <ListItem
                        key={option.name}
                        style={listItemStyle}
                        leftCheckbox={
                           <Checkbox
                               style={checkboxStyle}
                               data-value={option.name}
                               checked={this.state.selected.some(x=>x==option.name)}
                           />
                        }
                        onChange={this.onChange}
                        primaryText={option.name}
                    />
                })
            }
        </MuiList>;
    }

    isFilterActive(): boolean {
        return this.state.selected.size>0;
    }

    doesFilterPass(params: IDoesFilterPassParams): boolean {
        let value = this.params.valueGetter(params.node); //todo: this only support shallow key;
        if(value instanceof Array)
            return this.state.selected.some(selectedOption=>value.indexOf(selectedOption)>=0);
        else
            return this.state.selected.some(selectedOption=>value == selectedOption);

    }

    getModel(): any {
        return {
            options:this.options,
            selected:this.state.selected
        };
    }

    setModel(model: any): void {
        if(!model) return;
        this.options = model._options;
        this.state.selected = model.selected;
    }
    refresh(){}
    onChange=({target})=>{
        const value = target.dataset.value;
        if(target.checked)
            this.setState({
                selected:this.state.selected.push(value)
            },this.params.filterChangedCallback);
        else{
            const i = this.state.selected.findIndex(x=>x==value);
            if(i>=0)
                this.setState({
                    selected:this.state.selected.remove(i)
                },this.params.filterChangedCallback)
        }
    };
}