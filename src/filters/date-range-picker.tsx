/**
 * Created by buhi on 2017/3/10.
 */
import * as React from "react"
const fromStyle = {
    margin:"15px 10px 0"
};

const toStyle = {
    margin:"0 10px 15px"
};

const labelStyle ={
    marginRight:5
};

const timeFormatOptions = {hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false};
const dateFormatOptions = {year:"numeric",month:"2-digit",day:"2-digit"};
const datetimeFormatOptions = {year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false};

const parseInputDate = (s)=>{
    const d = new Date(s);
    const timestamp = d.getTime()+d.getTimezoneOffset()*60000;
    if(isNaN(timestamp)) return null;
    else return d;
};

const formatDate = (d,type)=>{
    let options:any = dateFormatOptions;
    if(type === 'datetime-local')
        options = datetimeFormatOptions;
    else if(type === 'time')
        options = timeFormatOptions;
    return d.toLocaleString([],options).replace(/\//g,'-').replace(' ','T')
};

export class DateRangePicker extends React.PureComponent<{
    onChange:(from:Date|null,to:Date|null)=>void,
    from:Date|null,
    to:Date|null,
    type?
},{}>{
    state={
        from:this.props.from || new Date(),
        to:this.props.to || new Date()
    };
    onChange=()=>{
        this.props.onChange(this.state.from, this.state.to);
    };
    onSetFrom=(e)=>{
        this.setState({
            from:parseInputDate(e.target.value)
        },this.onChange);
    };
    onSetTo=(e)=>{
        this.setState({
            to:parseInputDate(e.target.value)
        },this.onChange);

    };
    render(){
        const type = this.props.type || "date";
        return <div>
            <div style={fromStyle}>
                <label>
                    <span style={labelStyle}>从</span>
                    <input type={type} value={formatDate(this.state.from,type)} onChange={this.onSetFrom} />
                </label>
            </div>
            <div style={toStyle}>
                <label>
                    <span style={labelStyle}>到</span>
                    <input type={type} value={formatDate(this.state.to,type)} onChange={this.onSetTo} />
                </label>
            </div>
        </div>;
    }
}