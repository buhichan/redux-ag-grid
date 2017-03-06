/**
 * Created by YS on 2016/10/13.
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require("react");
var Utils_1 = require("./Utils");
var DateFilter = (function (_super) {
    __extends(DateFilter, _super);
    function DateFilter(params) {
        var _this = _super.call(this) || this;
        _this.params = params;
        return _this;
    }
    DateFilter.prototype.render = function () {
        var _this = this;
        return React.createElement("div", { style: { "margin": "4px" } },
            React.createElement("input", { type: "date", ref: function (ref) { return _this.input = ref; }, value: this.fromAsString, onChange: function (e) { return _this.onChange(e.target.value); } }),
            "-",
            React.createElement("input", { type: "date", value: this.fromAsString, onChange: function (e) { return _this.onChange(undefined, e.target.value); } }));
    };
    DateFilter.prototype.isFilterActive = function () {
        return this.from instanceof Date && !isNaN(this.from.getTime()) || this.to instanceof Date && !isNaN(this.to.getTime());
    };
    DateFilter.prototype.afterGuiAttached = function () {
        this.input.focus();
    };
    DateFilter.prototype.datePassed = function (date) {
        return date >= this.from || !(this.from instanceof Date) && date <= this.to || !(this.to instanceof Date);
    };
    DateFilter.prototype.doesFilterPass = function (params) {
        var value = Utils_1.deepGet(params.data, this.params.colDef['_idGetter']);
        if (value instanceof Date) {
            return this.datePassed(value);
        }
        else if (typeof value === 'number') {
            var date = new Date(value * 1000);
            return this.datePassed(date);
        }
        else if (typeof value === 'string') {
            var date = new Date(value);
            return this.datePassed(date);
        }
    };
    DateFilter.prototype.setModel = function (model) {
        this.from = new Date(model.from * 1000);
        this.to = new Date(model.to * 1000);
    };
    DateFilter.prototype.getModel = function () {
        return {
            from: this.from.getTime() / 1000,
            to: this.to.getTime() / 1000
        };
    };
    DateFilter.prototype.onChange = function (from, to) {
        if (from === void 0) { from = this.fromAsString; }
        if (to === void 0) { to = this.toAsString; }
        this.fromAsString = from;
        this.toAsString = to;
        this.from = new Date(from);
        this.to = new Date(to);
        this.params.filterChangedCallback();
    };
    return DateFilter;
}(React.Component));
exports.DateFilter = DateFilter;
var EnumFilter = (function (_super) {
    __extends(EnumFilter, _super);
    function EnumFilter(params) {
        var _this = _super.call(this) || this;
        _this.options = [];
        _this.selected = [];
        _this.params = params;
        _this.options = params.colDef._options;
        return _this;
    }
    EnumFilter.prototype.render = function () {
        var _this = this;
        return React.createElement("select", { style: { "margin": "4px" }, ref: function (ref) { return _this.select = ref; }, multiple: true, onChange: function () { return _this.onChange(); } }, this.options.map(function (option, i) { return React.createElement("option", { key: i, value: option.value }, option.name); }));
    };
    EnumFilter.prototype.isFilterActive = function () {
        return this.selected.length > 0;
    };
    EnumFilter.prototype.doesFilterPass = function (params) {
        var value = Utils_1.deepGet(params.data, this.params.colDef['_idGetter']);
        return this.selected.some(function (selectedOption) {
            if (value instanceof Array)
                return value.indexOf(selectedOption) >= 0;
            else
                return value == selectedOption;
        });
    };
    EnumFilter.prototype.getModel = function () {
        return {
            options: this.options,
            selected: this.selected
        };
    };
    EnumFilter.prototype.afterGuiAttached = function () {
        this.select.focus();
    };
    EnumFilter.prototype.setModel = function (model) {
        this.options = model._options;
        this.selected = model.selected;
    };
    EnumFilter.prototype.onChange = function () {
        this.selected = [];
        for (var i = 0; i < this.select.selectedOptions.length; i++)
            this.selected.push(this.select.selectedOptions[i].value);
        this.params.filterChangedCallback();
    };
    return EnumFilter;
}(React.Component));
exports.EnumFilter = EnumFilter;
var Filters = {
    'select': EnumFilter,
    'date': DateFilter,
    'datetime-local': DateFilter
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