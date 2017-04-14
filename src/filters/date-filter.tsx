/**
 * Created by buhi on 2017/3/6.
 */
import * as React from "react"
import Calendar from "material-ui/DatePicker/Calendar"
import {IFilterReactComp} from "ag-grid-react/lib/interfaces";
import {IDoesFilterPassParams, IFilterParams} from "ag-grid";
import {DateRangePicker} from "./date-range-picker";

const calendarStyle1 = {
    textAlign:'right',
    display:"inline-block",
    margin:15
};
const calendarStyle2 = {
    textAlign:'left',
    display:"inline-block",
    margin:15
};
const dateStyle = {
    fontSize:"18px",
    padding:"5px 0 15px"
};

export class DateFilter extends React.PureComponent<any,any> implements IFilterReactComp{
    state={
        from:null,
        to:null,
    };
    constructor(private params:IFilterParams){
        super()
    }
    refresh(){}
    checkDate(date){
        return (
            (!this.state.from || this.state.from<=date) &&
            (!this.state.to || this.state.to>=date)
        );
    }
    doesFilterPass(params:IDoesFilterPassParams){
        let value = this.params.valueGetter(params.node);
        if(!(value instanceof Date))
            value = new Date(value);
        return this.checkDate(value)
    }
    isFilterActive(){
        return this.state.from || this.state.to
    }
    getModel(){
        return this.state;
    }
    setModel(model){
        if(!model) return;
        return this.setState(model)
    }
    onChange=(from,to)=>{
        this.setState({
            from,to
        },this.params.filterChangedCallback)
    };
    render(){
        return <DateRangePicker
            to={this.state.to}
            from={this.state.from}
            onChange={this.onChange}
        />
    }
}