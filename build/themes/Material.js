"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
/**
 * Created by buhi on 2017/2/28.
 */
var React = require("react");
var _1 = require("../");
var Chip_1 = require("material-ui/Chip");
var RaisedButton_1 = require("material-ui/RaisedButton");
var TextField_1 = require("material-ui/TextField");
var FlatButton_1 = require("material-ui/FlatButton");
var Checkbox_1 = require("material-ui/Checkbox");
require("ag-grid/dist/styles/theme-material.css");
_1.setTheme({
    CheckboxRenderer: (function (_super) {
        __extends(CheckboxCell, _super);
        function CheckboxCell() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        CheckboxCell.prototype.refresh = function () { };
        CheckboxCell.prototype.render = function () {
            return React.createElement("div", null,
                React.createElement(Checkbox_1.default, null),
                "to be implemented");
        };
        return CheckboxCell;
    }(React.PureComponent)),
    HeaderCheckboxRenderer: (function (_super) {
        __extends(HeaderCheckboxCell, _super);
        function HeaderCheckboxCell() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        HeaderCheckboxCell.prototype.refresh = function () { };
        HeaderCheckboxCell.prototype.toggle = function () {
        };
        HeaderCheckboxCell.prototype.render = function () {
            return React.createElement("div", null,
                React.createElement(Checkbox_1.default, { checked: false }),
                "to be implemented");
        };
        return HeaderCheckboxCell;
    }(React.PureComponent)),
    SelectFieldRenderer: function (options) {
        var EnumCell = (function (_super) {
            __extends(EnumCell, _super);
            function EnumCell() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            EnumCell.prototype.refresh = function () { };
            EnumCell.prototype.render = function () {
                var is_fk = /_id$/.test(this.props.colDef['key']);
                var target;
                if (this.props.value instanceof Array)
                    target = this.props.value;
                else
                    target = [this.props.value];
                return React.createElement("div", { style: { position: 'relative', bottom: '2px' } }, target.map(function (value, i) {
                    var index = options.findIndex(function (option) { return option.name == value; }) || 0;
                    return is_fk ? React.createElement("span", { key: i }, index < 0 ? "" : value) :
                        (index >= 0 ? React.createElement(Chip_1.default, { style: { display: 'inline-block', zIndex: 0 }, labelStyle: { lineHeight: "25px", fontSize: "10px", color: "black" }, key: i, backgroundColor: EnumCell.colors[index % EnumCell.colors.length] }, value) : "");
                }));
            };
            ;
            return EnumCell;
        }(React.Component));
        EnumCell.colors = [
            'rgba(255,0,0,0.2)',
            'rgba(127,127,0,0.2)',
            'rgba(0,255,0,0.2)',
            'rgba(0,127,127,0.2)',
            'rgba(0,0,255,0.2)',
            'rgba(127,0,127,0.2)'
        ];
        return EnumCell;
    },
    GridRenderer: (function (_super) {
        __extends(GridRenderer, _super);
        function GridRenderer() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        GridRenderer.prototype.render = function () {
            var _this = this;
            var buttonProps = {
                overlayStyle: { padding: "0 15px" }
            };
            return React.createElement("div", { className: "redux-ag-grid ag-material " },
                React.createElement("div", { className: "row", style: { padding: "15px 0" } },
                    React.createElement("div", { className: "col-xs-12 col-md-9", style: { zIndex: 1 } }, this.props.actions.map(function (action, i) {
                        if (action.enabled && !action.enabled())
                            return null;
                        else
                            return React.createElement(RaisedButton_1.default, __assign({ style: { margin: '0 5px 5px 0' }, key: i }, buttonProps, { onClick: function (e) { return action(_this.props.gridApi.getSelectedRows(), e); } }), action.displayName);
                    })),
                    React.createElement("div", { className: "col-xs-12 col-md-3" }, this.props.noSearch ||
                        React.createElement(TextField_1.default, { fullWidth: true, style: { marginTop: "-39px", top: "9px" }, name: "quick-filter", floatingLabelText: "搜索...", onChange: function (e) {
                                var value = e.target['value'];
                                if (_this.pendingUpdate)
                                    clearTimeout(_this.pendingUpdate);
                                _this.pendingUpdate = setTimeout(function () {
                                    _this.props.gridApi.setQuickFilter(value);
                                }, 400);
                            } }))),
                React.createElement("div", { style: { height: (this.props.height || 600) + "px" } }, this.props.children));
        };
        return GridRenderer;
    }(React.Component)),
    ActionCellRenderer: function (actions) {
        var ActionCell = (function (_super) {
            __extends(ActionCell, _super);
            function ActionCell() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.containerStyle = { display: "inline-block", marginRight: '3px' };
                _this.buttonStyle = {
                    height: '21px',
                    lineHeight: '20px',
                    minWidth: '30px'
                };
                _this.buttonLabelStyle = {
                    fontSize: '10px',
                    paddingLeft: '5px',
                    paddingRight: "5px"
                };
                return _this;
            }
            ActionCell.prototype.refresh = function () { };
            ActionCell.prototype.render = function () {
                var _this = this;
                return React.createElement("div", { className: "action-cell" }, actions.filter(function (action) { return !action.enabled || action.enabled(_this.props.data); }).map(function (action, i) {
                    return React.createElement("div", { style: _this.containerStyle, key: i, ref: function (ref) {
                            ref && ref.addEventListener('click', function (e) {
                                action(action.useSelected ? _this.props.context.getSelected() : _this.props.data, e);
                                e.stopPropagation();
                            });
                        } },
                        React.createElement(FlatButton_1.default, { style: _this.buttonStyle, labelStyle: _this.buttonLabelStyle, label: action.displayName }));
                }));
            };
            return ActionCell;
        }(React.Component));
        return ActionCell;
    }
});
//# sourceMappingURL=Material.js.map