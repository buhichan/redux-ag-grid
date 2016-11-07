/**
 * Created by YS on 2016/10/13.
 */

import {IDoesFilterPassParams, IFilterParams} from "ag-grid";

import * as deepGet from "lodash/get";
import * as React from "react"
import FormEvent = __React.FormEvent;


export class DateFilter extends React.Component<any,any>{
    private params:IFilterParams;
    to:Date;
    toAsString:string;
    from:Date;
    fromAsString:string;
    input:HTMLInputElement;
    render(){
        return <div style={{"margin":"4px"}}>
            <input type="date" ref={ref=>this.input = ref} value={this.fromAsString} onChange={(e:any)=>this.onChange(e.target.value)}/>
            -
            <input type="date" value={this.fromAsString} onChange={(e:any)=>this.onChange(undefined,e.target.value)}/></div>
    }
    constructor(params) {
        super();
        this.params = params;
    }

    isFilterActive(): boolean {
        return this.from instanceof Date && !isNaN((this.from as any).getTime()) || this.to instanceof Date && !isNaN(this.to.getTime());
    }

    afterGuiAttached():void {
        this.input.focus();
    }

    datePassed(date){
        return date>=this.from || !(this.from instanceof Date) && date<=this.to || !(this.to instanceof Date);
    }

    doesFilterPass(params: IDoesFilterPassParams): boolean {
        let value = deepGet(params.data,this.params.colDef.field);
        if(value instanceof Date){
            return this.datePassed(value)
        }else if(typeof value === 'number'){
            let date = new Date((value as number)*1000);
            return this.datePassed(date);
        }else if(typeof value === 'string'){
            let date = new Date(value);
            return this.datePassed(date);
        }
    }
    setModel(model:any){
        this.from = new Date(model.from*1000);
        this.to = new Date(model.to*1000);
    }
    getModel(){
        return {
            from:this.from.getTime()/1000,
            to:this.to.getTime()/1000
        }
    }
    onChange(from=this.fromAsString,to=this.toAsString){
        this.fromAsString = from;
        this.toAsString = to;
        this.from = new Date(from);
        this.to = new Date(to);
        this.params.filterChangedCallback();
    }
}

export class EnumFilter extends React.Component<any,any>{
    options:any[]=[];
    selected=[];
    params;
    select:HTMLSelectElement;
    constructor(params) {
        super();
        this.params = params;
        this.options = params.colDef.options;
    }

    render(){
        return <select style={{"margin":"4px"}} ref={ref=>this.select=ref} multiple onChange={()=>this.onChange()}>
            {
                this.options.map((option,i)=><option key={i} value={option.value}>{option.name}</option>)
            }
        </select>
    }

    isFilterActive(): boolean {
        return this.selected.length>0;
    }

    doesFilterPass(params: IDoesFilterPassParams): boolean {
        return this.selected.some(selectedOption=>{
            let value = deepGet(params.data,this.params.colDef.field);
            if(value instanceof Array)
                return value.indexOf(selectedOption)>=0;
            else
                return value == selectedOption;
        });
    }

    getModel(): any {
        return {
            options:this.options,
            selected:this.selected
        };
    }

    afterGuiAttached():void {
        this.select.focus();
    }

    setModel(model: any): void {
        this.options = model.options;
        this.selected = model.selected;
    }

    onChange(){
        this.selected = [];
        for(let i =0;i<this.select.selectedOptions.length;i++)
            this.selected.push(this.select.selectedOptions[i].value);
        this.params.filterChangedCallback();
    }
}