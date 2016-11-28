"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * Created by YS on 2016/11/16.
 */
var React = require("react");
require("ag-grid/dist/styles/theme-bootstrap.css");
var index_1 = require("./index");
var Theme = {
    SelectFieldRenderer: function (options) {
        return function SelectFieldRenderer(props) {
            var colors = ['primary', 'success', 'warning', 'info', 'danger'];
            var target;
            if (props.value instanceof Array)
                target = props.value;
            else
                target = [props.value];
            return React.createElement("div", null, 
                target.map(function (value, i) {
                    var index = options.findIndex(function (option) { return option.value == value; }) || 0;
                    return React.createElement("label", {key: i, className: 'label label-' + colors[index % colors.length]}, options[index].name);
                }), 
                ";");
        };
    },
    GridRenderer: function (props) {
        return React.createElement("div", {className: "redux-ag-grid ag-bootstrap panel panel-default"}, 
            React.createElement("div", {className: "panel-heading clearfix"}, 
                React.createElement("div", {className: "pull-left"}, 
                    React.createElement("button", {className: "btn btn-default", onClick: props.onSelectAll}, "全选/取消")
                ), 
                React.createElement("div", {className: "btn-group btn-group-sm pull-right"}, props.actions.map(function (action, i) {
                    return React.createElement("button", {key: i, className: "btn btn-default", onClick: function () { return action(props.gridApi.getSelectedRows()); }}, action.displayName);
                }))), 
            React.createElement("div", {className: "panel-body", style: { height: (props.height || 600) + "px" }}, props.children));
    },
    ActionCellRenderer: function (actions) { return (function (_super) {
        __extends(ActionCell, _super);
        function ActionCell() {
            _super.apply(this, arguments);
        }
        ActionCell.prototype.render = function () {
            var _this = this;
            return React.createElement("div", {className: "btn-actions"}, actions.filter(function (action) { return !action.enabled || action.enabled(_this.props.data); }).map(function (action, i) {
                return React.createElement("button", {key: i, className: "btn btn-sm btn-primary", ref: function (ref) {
                    ref && ref.addEventListener('click', function (e) {
                        action(action.useSelected ? _this.props.context.getSelected() : _this.props.data);
                        e.stopPropagation();
                    });
                }}, action.displayName);
            }));
        };
        return ActionCell;
    }(React.Component)); }
};
index_1.setTheme(Theme);
//# sourceMappingURL=Bootstrap.js.map