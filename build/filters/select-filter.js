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
var immutable_1 = require("immutable");
var material_ui_1 = require("material-ui");
var Divider_1 = require("material-ui/Divider");
var Checkbox_1 = require("material-ui/Checkbox");
var listItemStyle = {
    padding: "8px 12px 8px 72px",
    fontWeight: 'normal',
    fontSize: "12px",
    marginBottom: 0
};
var checkboxStyle = {
    top: 4
};
var EnumFilter = (function (_super) {
    __extends(EnumFilter, _super);
    function EnumFilter(params) {
        var _this = _super.call(this) || this;
        _this.options = [];
        _this.state = {
            selected: immutable_1.List()
        };
        _this.onSelectAll = function () {
            if (_this.state.selected.size < _this.options.length)
                _this.setState({
                    selected: immutable_1.List(_this.options.map(function (x) { return x.name; }))
                }, _this.params.filterChangedCallback);
            else
                _this.setState({
                    selected: _this.state.selected.clear()
                }, _this.params.filterChangedCallback);
        };
        _this.onChange = function (_a) {
            var target = _a.target;
            var value = target.dataset.value;
            if (target.checked)
                _this.setState({
                    selected: _this.state.selected.push(value)
                }, _this.params.filterChangedCallback);
            else {
                var i = _this.state.selected.findIndex(function (x) { return x == value; });
                if (i >= 0)
                    _this.setState({
                        selected: _this.state.selected.remove(i)
                    }, _this.params.filterChangedCallback);
            }
        };
        _this.params = params;
        _this.options = params.colDef._options;
        return _this;
    }
    EnumFilter.prototype.render = function () {
        var _this = this;
        return React.createElement(material_ui_1.List, { style: {
                padding: "0 0 5px 0",
                maxHeight: 250
            } },
            React.createElement(material_ui_1.ListItem, { key: "$$select//all", style: listItemStyle, leftCheckbox: React.createElement(Checkbox_1.default, { style: checkboxStyle, checked: this.state.selected.size === this.options.length }), onChange: this.onSelectAll, primaryText: "全选" }),
            React.createElement(Divider_1.default, null),
            this.options.map(function (option) {
                return React.createElement(material_ui_1.ListItem, { key: option.name, style: listItemStyle, leftCheckbox: React.createElement(Checkbox_1.default, { style: checkboxStyle, "data-value": option.name, checked: _this.state.selected.some(function (x) { return x == option.name; }) }), onChange: _this.onChange, primaryText: option.name });
            }));
    };
    EnumFilter.prototype.isFilterActive = function () {
        return this.state.selected.size > 0;
    };
    EnumFilter.prototype.doesFilterPass = function (params) {
        var value = this.params.valueGetter(params.node); //todo: this only support shallow key;
        if (value instanceof Array)
            return this.state.selected.some(function (selectedOption) { return value.indexOf(selectedOption) >= 0; });
        else
            return this.state.selected.some(function (selectedOption) { return value == selectedOption; });
    };
    EnumFilter.prototype.getModel = function () {
        return {
            options: this.options,
            selected: this.state.selected
        };
    };
    EnumFilter.prototype.setModel = function (model) {
        if (!model)
            return;
        this.options = model._options;
        this.state.selected = model.selected;
    };
    EnumFilter.prototype.refresh = function () { };
    return EnumFilter;
}(React.PureComponent));
exports.EnumFilter = EnumFilter;
//# sourceMappingURL=select-filter.js.map