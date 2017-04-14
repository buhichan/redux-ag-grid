/**
 * Created by YS on 2016/10/13.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var select_filter_1 = require("./filters/select-filter");
var date_filter_1 = require("./filters/date-filter");
var Filters = {
    'select': select_filter_1.EnumFilter,
    'date': date_filter_1.DateFilter,
    'datetime-local': date_filter_1.DateFilter
};
function setFilter(type, component) {
    Filters[type] = component;
}
exports.setFilter = setFilter;
function getFilter(type) {
    return Filters[type];
}
exports.getFilter = getFilter;
//# sourceMappingURL=GridFilters.js.map