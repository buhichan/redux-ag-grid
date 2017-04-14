"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by buhi on 2017/3/6.
 */
var React = require("react");
var date_range_picker_1 = require("./date-range-picker");
var calendarStyle1 = {
    textAlign: 'right',
    display: "inline-block",
    margin: 15
};
var calendarStyle2 = {
    textAlign: 'left',
    display: "inline-block",
    margin: 15
};
var dateStyle = {
    fontSize: "18px",
    padding: "5px 0 15px"
};
var DateFilter = (function (_super) {
    __extends(DateFilter, _super);
    function DateFilter(params) {
        var _this = _super.call(this) || this;
        _this.params = params;
        _this.state = {
            from: null,
            to: null,
        };
        _this.onChange = function (from, to) {
            _this.setState({
                from: from, to: to
            }, _this.params.filterChangedCallback);
        };
        return _this;
    }
    DateFilter.prototype.refresh = function () { };
    DateFilter.prototype.checkDate = function (date) {
        return ((!this.state.from || this.state.from <= date) &&
            (!this.state.to || this.state.to >= date));
    };
    DateFilter.prototype.doesFilterPass = function (params) {
        var value = this.params.valueGetter(params.node);
        if (!(value instanceof Date))
            value = new Date(value);
        return this.checkDate(value);
    };
    DateFilter.prototype.isFilterActive = function () {
        return this.state.from || this.state.to;
    };
    DateFilter.prototype.getModel = function () {
        return this.state;
    };
    DateFilter.prototype.setModel = function (model) {
        if (!model)
            return;
        return this.setState(model);
    };
    DateFilter.prototype.render = function () {
        return React.createElement(date_range_picker_1.DateRangePicker, { to: this.state.to, from: this.state.from, onChange: this.onChange });
    };
    return DateFilter;
}(React.PureComponent));
exports.DateFilter = DateFilter;
//# sourceMappingURL=date-filter.js.map