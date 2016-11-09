/**
 * Created by YS on 2016/9/24.
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
require("./Grid.css");
require("ag-grid/dist/styles/ag-grid.css");
require("ag-grid/dist/styles/theme-bootstrap.css");
var react_1 = require("react");
var React = require("react");
var ag_grid_react_1 = require("ag-grid-react");
var connect = require("react-redux").connect;
var Utils_1 = require("./Utils");
var GridFilters_1 = require("./GridFilters");
var Grid = (function (_super) {
    __extends(Grid, _super);
    function Grid() {
        _super.apply(this, arguments);
        this.state = {
            quickFilterText: '',
            parsedSchema: [],
            filter: {
                pagination: {
                    limit: 20,
                    offset: 0
                }
            },
            selectAll: false
        };
    }
    Grid.prototype.getModels = function () {
        return Utils_1.deepGetState.apply(void 0, [this.props.store].concat(this.props.modelPath || this.props.resource['modelPath']));
    };
    Grid.prototype.componentDidMount = function () {
        var _this = this;
        if (!this.props.resource)
            throw new Error("请使用ResourceAdapterService构造一个Resource");
        if (!this.props.modelPath && !this.props.resource['modelPath'])
            throw new Error("请声明modelPath:string[]");
        this.props.resource.filter(this.state.filter);
        this.props.resource.get();
        this.props.resource['gridName'] = this.props.gridName || ('grid' + Math.random());
        this.parseSchema(this.props.schema).then(function (parsed) {
            _this.setState({
                parsedSchema: parsed
            });
        });
    };
    Grid.prototype.componentWillReceiveProps = function (newProps) {
        var _this = this;
        if (newProps.schema !== this.props.schema)
            this.parseSchema(this.props.schema).then(function (parsed) {
                _this.setState({
                    parsedSchema: parsed
                });
            });
    };
    Grid.prototype.parseSchema = function (schema) {
        return Promise.all(schema.map(function (column) {
            var parseField = function (options) {
                var colDef = {
                    field: column.key,
                    headerName: column.label
                };
                switch (column.type) {
                    case "select":
                        colDef['cellRenderer'] = function (params) {
                            var colors = ['primary', 'success', 'warning', 'info', 'danger'];
                            var target;
                            if (params.value instanceof Array)
                                target = params.value;
                            else
                                target = [params.value];
                            return target.reduce(function (prev, cur) {
                                var index = 0;
                                options.every(function (option, i) {
                                    if (option.value === cur) {
                                        index = i;
                                        return false;
                                    }
                                    return true;
                                });
                                return prev + ("<label class=\"label label-" + colors[index % colors.length] + "\">" + options[index].name + "</label>");
                            }, "");
                        };
                        colDef['options'] = column.options;
                        colDef['filterFramework'] = GridFilters_1.EnumFilter;
                        break;
                    case "date":
                    case "datetime-local":
                        var method_1;
                        if (column.type === "date")
                            method_1 = "toLocaleDateString";
                        else
                            method_1 = "toLocaleString";
                        colDef['cellRenderer'] = function (params) {
                            return (params.value !== null && params.value !== undefined) ? new Date(params.value)[method_1]('zh-cn') : "";
                        };
                        colDef['filterFramework'] = GridFilters_1.DateFilter;
                        break;
                }
                return colDef;
            };
            if (typeof column.options === "string") {
                return Promise.resolve(fetch(column.options, {
                    method: "GET",
                    headers: {
                        "Content-Type": "applicatoin/json"
                    }
                })).then(function (res) { return res.json(); }).then(parseField);
            }
            else
                return Promise.resolve(parseField(column.options));
        }));
    };
    Grid.prototype.getActions = function () {
        var staticActions = [];
        var rowActions = [];
        var restResource = this.props.resource;
        if (restResource.actions)
            restResource.actions.forEach(function (action) {
                if (action.isStatic)
                    staticActions.push(action);
                else
                    rowActions.push(action);
            });
        if (this.props.actions)
            this.props.actions.forEach(function (action) {
                if (action.isStatic)
                    staticActions.push(action);
                else
                    rowActions.push(action);
            });
        return {
            staticActions: staticActions,
            rowActions: rowActions
        };
    };
    Grid.prototype.render = function () {
        var _this = this;
        var _a = this.getActions(), staticActions = _a.staticActions, rowActions = _a.rowActions;
        return React.createElement("div", {className: "redux-ag-grid ag-bootstrap panel panel-default"}, 
            React.createElement("div", {className: "panel-heading clearfix"}, 
                React.createElement("div", {className: "pull-left"}, 
                    React.createElement("button", {className: "btn btn-default", onClick: function () {
                        _this.state.selectAll ? _this.gridApi.deselectAll() : _this.gridApi.selectAll();
                        _this.state.selectAll = !_this.state.selectAll;
                    }}, "全选/取消")
                ), 
                React.createElement("div", {className: "btn-group btn-group-sm pull-right"}, staticActions.map(function (action, i) {
                    return React.createElement("button", {key: i, className: "btn btn-default", onClick: function () { return action(_this.gridApi.getSelectedRows(), _this.props.dispatch); }}, action.displayName);
                }))), 
            React.createElement("div", {className: "panel-body", style: { height: (this.props.height || 600) + "px" }}, 
                React.createElement(ag_grid_react_1.AgGridReact, {onRowDblClicked: this.props.onCellDblClick, quickFilterText: this.state.quickFilterText, columnDefs: this.state.parsedSchema.concat([{
                        headerName: "",
                        suppressFilter: true,
                        suppressMenu: true,
                        suppressSorting: true,
                        cellRendererFramework: ActionCell
                    }]), rowData: this.getModels(), rowHeight: 40, context: {
                    getSelected: function () { return _this.gridApi.getSelectedRows(); },
                    dispatch: this.props.dispatch,
                    rowActions: rowActions
                }, onGridReady: function (params) { _this.gridApi = params.api; _this.columnApi = params.columnApi; }, onColumnEverythingChanged: function () { return _this.gridApi && _this.gridApi.sizeColumnsToFit(); }, rowSelection: "multiple", enableSorting: "true", enableFilter: "true"})
            ));
    };
    Grid = __decorate([
        connect(function (store) { return ({ store: store }); }), 
        __metadata('design:paramtypes', [])
    ], Grid);
    return Grid;
}(react_1.Component));
exports.Grid = Grid;
var ActionCell = (function (_super) {
    __extends(ActionCell, _super);
    function ActionCell() {
        _super.apply(this, arguments);
    }
    ActionCell.prototype.render = function () {
        var _this = this;
        return React.createElement("div", {className: "btn-actions"}, this.props.context.rowActions.filter(function (action) { return !action.enabled || action.enabled(_this.props.data); }).map(function (action, i) {
            return React.createElement("button", {key: i, className: "btn btn-sm btn-primary", ref: function (ref) {
                ref && ref.addEventListener('click', function (e) {
                    action(action.useSelected ? _this.props.context.getSelected() : _this.props.data, _this.props.context.dispatch);
                    e.stopPropagation();
                });
            }}, action.displayName);
        }));
    };
    return ActionCell;
}(React.Component));
//# sourceMappingURL=Grid.js.map