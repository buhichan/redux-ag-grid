/**
 * Created by YS on 2016/10/13.
 */

import * as React from "react"
import {EnumFilter} from "./filters/select-filter";
import {DateFilter} from "./filters/date-filter";

const Filters = {
    'select':EnumFilter,
    'date':DateFilter,
    'datetime-local':DateFilter
};

export function setFilter(type,component){
    Filters[type] = component;
}
export function getFilter(type){
    return Filters[type]
}