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
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by YS on 2016/11/16.
 */
var React = require("react");
var Chip_1 = require("material-ui/Chip");
var RaisedButton_1 = require("material-ui/RaisedButton");
var FlatButton_1 = require("material-ui/FlatButton");
var index_1 = require("./index");
var tinycolor = require('tinycolor2');
var buttonProps = {
    overlayStyle: { padding: "0 15px" },
    style: {
        margin: '0 5px 5px 0',
        color: "white",
        height: "30px",
        lineHeight: "30px",
        fontSize: "12px"
    }
};
var chipStyle = {
    display: "inlineBlock",
    padding: "0 5px",
    zIndex: 0
};
var hardCodedColors = {};
var colors = [
    '#4783fa',
    "#fa5f7e",
    "#a9d26a",
    "#fbc000",
];
var buttonTextColor = '#4783fa';
var buttonBackgroundColor = '#ddedff';
function setColors(colorArray, hardCodedColorMap, buttonColor, buttonBGColor) {
    colors = colorArray;
    hardCodedColors = hardCodedColorMap;
    buttonTextColor = buttonColor;
    buttonBackgroundColor = buttonBGColor;
}
exports.setColors = setColors;
var actionContainerStyle = { display: "inline-block", marginRight: '3px' };
var actionButtonStyle = {
    height: '21px',
    lineHeight: '20px',
    minWidth: '30px',
    zIndex: 0
};
var actionButtonLabelStyle = {
    fontSize: '10px',
    padding: "0 8px"
};
var SelectionCheckboxRenderer = (function (_super) {
    __extends(SelectionCheckboxRenderer, _super);
    function SelectionCheckboxRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SelectionCheckboxRenderer.prototype.render = function () {
        return null;
    };
    return SelectionCheckboxRenderer;
}(React.PureComponent));
var HeaderSelectionCheckboxRenderer = (function (_super) {
    __extends(HeaderSelectionCheckboxRenderer, _super);
    function HeaderSelectionCheckboxRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    HeaderSelectionCheckboxRenderer.prototype.render = function () {
        return null;
    };
    return HeaderSelectionCheckboxRenderer;
}(React.PureComponent));
index_1.setTheme({
    SelectionCheckboxRenderer: SelectionCheckboxRenderer,
    HeaderSelectionCheckboxRenderer: HeaderSelectionCheckboxRenderer,
    SelectFieldRenderer: function (options) {
        return (function (_super) {
            __extends(ChipEnumCell, _super);
            function ChipEnumCell() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            ChipEnumCell.prototype.getColor = function (value, index) {
                return hardCodedColors[value] ? hardCodedColors[value] : colors[index % colors.length];
            };
            ChipEnumCell.prototype.render = function () {
                var _this = this;
                var is_fk = /_id$/.test(this.props.colDef.key);
                var target;
                if (this.props.value instanceof Array)
                    target = this.props.value;
                else
                    target = [this.props.value];
                if (options.length <= 2)
                    return React.createElement("div", { style: { position: 'relative', bottom: 3 } }, target.map(function (value, i) {
                        var index = options.findIndex(function (option) { return option.name == value; }) || 0;
                        var color = _this.getColor(value, index);
                        return is_fk ? React.createElement("span", { key: i }, index < 0 ? "" : value) :
                            (index >= 0 ? React.createElement(Chip_1.default, { style: chipStyle, labelStyle: { lineHeight: "25px", fontSize: "10px", color: color }, key: i, backgroundColor: tinycolor(color).setAlpha(0.3).toString() }, value) : "");
                    }));
                else
                    return React.createElement("div", { style: { position: 'relative' } }, target.map(function (value, i) {
                        var index = options.findIndex(function (option) { return option.name == value; }) || 0;
                        var color = _this.getColor(value, index);
                        return is_fk ? React.createElement("span", { key: i }, index < 0 ? "" : value) :
                            (index >= 0 ? React.createElement("div", { key: i },
                                React.createElement("span", { style: {
                                        borderRadius: "50%",
                                        backgroundColor: color,
                                        height: 10,
                                        width: 10,
                                        marginRight: "0.7em",
                                        display: "inline-block"
                                    } }),
                                value) : "");
                    }));
            };
            ;
            return ChipEnumCell;
        }(React.Component));
    },
    GridRenderer: (function (_super) {
        __extends(GridRenderer, _super);
        function GridRenderer(props) {
            var _this = _super.call(this) || this;
            _this.onSearch = function (e) {
                var value = e.target['value'];
                if (_this.pendingUpdate)
                    clearTimeout(_this.pendingUpdate);
                _this.pendingUpdate = setTimeout(function () {
                    _this.gridApi.setQuickFilter(value);
                }, 400);
            };
            props.apiRef(function (api) {
                _this.gridApi = api;
            });
            return _this;
        }
        GridRenderer.prototype.render = function () {
            var _this = this;
            return React.createElement("div", { className: "redux-ag-grid ag-material " },
                React.createElement("div", { className: "grid-topbar", style: { padding: "15px 0" } },
                    React.createElement("div", { className: "grid-static-buttons", style: { zIndex: 1 } }, this.props.actions.map(function (action, i) {
                        if (action.enabled && !action.enabled())
                            return null;
                        else
                            return React.createElement(RaisedButton_1.default, __assign({ className: "grid-button", labelColor: "white", key: i, primary: true }, buttonProps, { onClick: function (e) {
                                    if (action.length)
                                        action(_this.gridApi.getSelectedRows(), e);
                                    else
                                        action();
                                } }), action.displayName);
                    })),
                    React.createElement("div", { className: "grid-search" }, this.props.noSearch || React.createElement("div", { className: "grid-search-field" },
                        React.createElement("input", { style: { float: "right", minWidth: 140 }, name: "quick-filter", type: "search", onChange: this.onSearch })))),
                React.createElement("div", { style: { height: (this.props.height || 600) + "px" } }, this.props.children));
        };
        return GridRenderer;
    }(React.Component)),
    ActionCellRenderer: function (actions) {
        var ActionCell = (function (_super) {
            __extends(ActionCell, _super);
            function ActionCell() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            ActionCell.prototype.render = function () {
                var _this = this;
                return React.createElement("div", { className: "action-cell" }, actions.filter(function (action) { return !action.enabled || action.enabled(_this.props.data); }).map(function (action, i) {
                    return React.createElement("div", { style: actionContainerStyle, key: i, ref: function (ref) {
                            ref && ref.addEventListener('click', function (e) {
                                action(action.useSelected ? _this.props.context.getSelected() : _this.props.data, e);
                                e.stopPropagation();
                            });
                        } },
                        React.createElement(FlatButton_1.default, { hoverColor: buttonTextColor, backgroundColor: buttonBackgroundColor, style: actionButtonStyle, labelStyle: actionButtonLabelStyle, label: action.displayName }));
                }));
            };
            return ActionCell;
        }(React.Component));
        return ActionCell;
    }
});
//# sourceMappingURL=material.js.map