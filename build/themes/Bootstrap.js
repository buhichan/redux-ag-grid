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
index_1.setTheme({
    HeaderSelectionCheckboxRenderer: (function (_super) {
        __extends(HeaderCheckboxCell, _super);
        function HeaderCheckboxCell() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        HeaderCheckboxCell.prototype.render = function () {
            return React.createElement("div", null, "bootstrap\u4E3B\u9898\u7684\u4E0D\u9700\u8981\u81EA\u5B9A\u4E49checkbox,\u8BF7\u5728coldef\u91CC\u52A0\u4E0AheaderCheckboxSelection:true\u4EE3\u66FF");
        };
        return HeaderCheckboxCell;
    }(React.PureComponent)),
    SelectionCheckboxRenderer: (function (_super) {
        __extends(CheckboxCell, _super);
        function CheckboxCell() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        CheckboxCell.prototype.render = function () {
            return React.createElement("div", null, "bootstrap\u4E3B\u9898\u7684\u4E0D\u9700\u8981\u81EA\u5B9A\u4E49checkbox,\u8BF7\u5728coldef\u91CC\u52A0\u4E0AcheckboxSelection:true\u4EE3\u66FF");
        };
        return CheckboxCell;
    }(React.PureComponent)),
    SelectFieldRenderer: function (options) { return (function (_super) {
        __extends(SelectFieldRenderer, _super);
        function SelectFieldRenderer() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        SelectFieldRenderer.prototype.render = function () {
            var colors = ['primary', 'success', 'warning', 'info', 'danger'];
            var value = this.props.value;
            if (!(value instanceof Array))
                value = [value];
            return React.createElement("div", null, value.map(function (value, i) {
                var index = options.findIndex(function (x) { return x.name == value; });
                return React.createElement("label", { key: i, className: 'label label-' + colors[index % colors.length] }, value);
            }));
        };
        return SelectFieldRenderer;
    }(React.PureComponent)); },
    GridRenderer: (function (_super) {
        __extends(GridRenderer, _super);
        function GridRenderer(props) {
            var _this = _super.call(this) || this;
            props.apiRef(function (api) {
                _this.gridApi = api;
            });
            return _this;
        }
        GridRenderer.prototype.render = function () {
            var _this = this;
            var props = this.props;
            return React.createElement("div", { className: "redux-ag-grid ag-bootstrap panel panel-default", style: { height: "100%" } },
                React.createElement("div", { className: "panel-heading clearfix" },
                    props.noSelect || React.createElement("div", { className: "pull-left" },
                        React.createElement("button", { className: "btn btn-default", onClick: function () { return _this.gridApi.selectAll(); } }, "\u5168\u9009/\u53D6\u6D88")),
                    React.createElement("div", { className: "btn-group btn-group-sm pull-right" }, props.actions.map(function (action, i) {
                        return React.createElement("button", { key: i, className: "btn btn-default", onClick: function (e) { return action(_this.gridApi.getSelectedRows(), e); } }, action.displayName);
                    }))),
                React.createElement("div", { className: "panel-body", style: { height: (props.height ? (props.height || 600) + "px" : "100%") } },
                    props.children,
                    React.createElement("div", { className: "pagination" })));
        };
        return GridRenderer;
    }(React.PureComponent)),
    ActionCellRenderer: function (actions) { return (function (_super) {
        __extends(ActionCell, _super);
        function ActionCell() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ActionCell.prototype.render = function () {
            var _this = this;
            return React.createElement("div", { className: "btn-actions" }, actions.filter(function (action) { return !action.enabled || action.enabled(_this.props.data); }).map(function (action, i) {
                return React.createElement("button", { key: i, className: "btn btn-sm btn-primary", ref: function (ref) {
                        ref && ref.addEventListener('click', function (e) {
                            action(action.useSelected ? _this.props.context.getSelected() : _this.props.data, e);
                            e.stopPropagation();
                        });
                    } }, action.displayName);
            }));
        };
        return ActionCell;
    }(React.Component)); }
});
//# sourceMappingURL=Bootstrap.js.map