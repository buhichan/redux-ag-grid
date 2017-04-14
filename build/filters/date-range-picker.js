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
 * Created by buhi on 2017/3/10.
 */
var React = require("react");
var fromStyle = {
    margin: "15px 10px 0"
};
var toStyle = {
    margin: "0 10px 15px"
};
var labelStyle = {
    marginRight: 5
};
var timeFormatOptions = { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false };
var dateFormatOptions = { year: "numeric", month: "2-digit", day: "2-digit" };
var datetimeFormatOptions = { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false };
var parseInputDate = function (s) {
    var d = new Date(s);
    var timestamp = d.getTime() + d.getTimezoneOffset() * 60000;
    if (isNaN(timestamp))
        return null;
    else
        return d;
};
var formatDate = function (d, type) {
    var options = dateFormatOptions;
    if (type === 'datetime-local')
        options = datetimeFormatOptions;
    else if (type === 'time')
        options = timeFormatOptions;
    return d.toLocaleString([], options).replace(/\//g, '-').replace(' ', 'T');
};
var DateRangePicker = (function (_super) {
    __extends(DateRangePicker, _super);
    function DateRangePicker() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            from: _this.props.from || new Date(),
            to: _this.props.to || new Date()
        };
        _this.onChange = function () {
            _this.props.onChange(_this.state.from, _this.state.to);
        };
        _this.onSetFrom = function (e) {
            _this.setState({
                from: parseInputDate(e.target.value)
            }, _this.onChange);
        };
        _this.onSetTo = function (e) {
            _this.setState({
                to: parseInputDate(e.target.value)
            }, _this.onChange);
        };
        return _this;
    }
    DateRangePicker.prototype.render = function () {
        var type = this.props.type || "date";
        return React.createElement("div", null,
            React.createElement("div", { style: fromStyle },
                React.createElement("label", null,
                    React.createElement("span", { style: labelStyle }, "\u4ECE"),
                    React.createElement("input", { type: type, value: formatDate(this.state.from, type), onChange: this.onSetFrom }))),
            React.createElement("div", { style: toStyle },
                React.createElement("label", null,
                    React.createElement("span", { style: labelStyle }, "\u5230"),
                    React.createElement("input", { type: type, value: formatDate(this.state.to, type), onChange: this.onSetTo }))));
    };
    return DateRangePicker;
}(React.PureComponent));
exports.DateRangePicker = DateRangePicker;
//# sourceMappingURL=date-range-picker.js.map