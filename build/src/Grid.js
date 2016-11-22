/**
 * Created by YS on 2016/9/24.
 */
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
var react_1 = require("react");
var React = require("react");
var ag_grid_react_1 = require("ag-grid-react");
var connect = require("react-redux").connect;
var Utils_1 = require("./Utils");
var GridFilters_1 = require("./GridFilters");
var themes_1 = require("./themes");
require("./themes/Bootstrap");
function getModel(store, modelPath) {
    var data = Utils_1.deepGetState.apply(void 0, [store].concat(modelPath));
    if (data.toArray)
        data = data.toArray();
    return data;
}
var Grid = (function (_super) {
    __extends(Grid, _super);
    function Grid(props) {
        var _this = this;
        _super.call(this, props);
        this.isUnmounting = false;
        this.state = {
            quickFilterText: '',
            gridOptions: {
                colDef: [],
                suppressNoRowsOverlay: true,
                rowData: [],
                paginationPageSize: 20,
                rowHeight: 40,
                onGridReady: function (params) { _this.gridApi = params.api; _this.columnApi = params.columnApi; },
                onColumnEverythingChanged: function () { return _this.gridApi && _this.gridApi.sizeColumnsToFit(); },
                rowSelection: "multiple",
                enableSorting: "true",
                enableFilter: "true",
            },
            themeRenderer: themes_1.currentTheme(),
            selectAll: false,
            staticActions: []
        };
        Object.assign(this.state.gridOptions, props.gridOptions);
    }
    Grid.prototype.componentWillMount = function () {
        var _this = this;
        if (!this.props.resource && !this.props.data) {
            throw new Error("请使用ResourceAdapterService构造一个Resource或传入data");
        }
        else if (this.props.resource) {
            if (!this.props.modelPath && !this.props.resource['modelPath'])
                throw new Error("请声明modelPath:string[]");
            this.props.resource.get();
            this.props.resource['gridName'] = this.props.gridName || ('grid' + Math.random());
        }
        this.parseSchema(this.props.schema).then(function (parsed) {
            _this.onReady(parsed);
        });
    };
    Grid.prototype.componentWillUnmount = function () {
        this.isUnmounting = true;
    };
    Grid.prototype.onReady = function (schema) {
        var _this = this;
        var _a = this.getActions(), staticActions = _a.staticActions, rowActions = _a.rowActions;
        var columnDefs = schema && schema.length ? schema.concat([{
                headerName: "",
                suppressFilter: true,
                suppressMenu: true,
                suppressSorting: true,
                cellRendererFramework: this.state.themeRenderer.ActionCellRenderer(rowActions)
            }]) : [];
        var gridOptions = Object.assign(this.state.gridOptions, {
            quickFilterText: this.state.quickFilterText,
            columnDefs: columnDefs,
            context: {
                getSelected: function () { return _this.gridApi.getSelectedRows(); },
                dispatch: this.props.dispatch,
                rowActions: rowActions
            },
        });
        if (this.props.resource) {
            if (this.props.serverSideFilter) {
                gridOptions['rowModelType'] = 'virtual';
                gridOptions['datasource'] = {
                    getRows: function (params) {
                        var data = getModel(_this.props.store, _this.props.modelPath || _this.props.resource['modelPath']);
                        if (data.length < params.endRow) {
                            var resource = _this.props.resource;
                            resource.filter({
                                pagination: {
                                    offset: params.startRow,
                                    limit: params.endRow - params.startRow
                                }
                            });
                            resource.get().then(function () {
                                var data = getModel(_this.props.store, _this.props.modelPath || _this.props.resource['modelPath']);
                                params.successCallback(data.slice(params.startRow, params.endRow), data.length <= params.endRow ? data.length : undefined);
                            });
                        }
                        else
                            params.successCallback(data.slice(params.startRow, params.endRow));
                    }
                };
            }
            else
                gridOptions['rowData'] = getModel(this.props.store, this.props.modelPath || this.props.resource['modelPath']);
        }
        this.setState({
            staticActions: staticActions,
            gridOptions: gridOptions,
        });
    };
    Grid.prototype.setState = function (P, c) {
        if (this.isUnmounting)
            return;
        else
            _super.prototype.setState.call(this, P, c);
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
        var _this = this;
        return Promise.all(schema.map(function (column) {
            var parseField = function (options) {
                var colDef = {
                    field: column.key,
                    headerName: column.label
                };
                switch (column.type) {
                    case "select":
                        colDef['cellRendererFramework'] = _this.state.themeRenderer.SelectFieldRenderer(options);
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
            if (column.options && typeof column.options === 'function') {
                var asyncOptions = column.options;
                return asyncOptions().then(parseField);
            }
            else
                return Promise.resolve(parseField(column.options));
        }));
    };
    Grid.prototype.getActions = function () {
        var _this = this;
        var staticActions = [];
        var rowActions = [];
        var restResource = this.props.resource;
        if (this.props.actions)
            this.props.actions.forEach(function (action) {
                if (action === 'delete') {
                    var deleteAction = function (data) {
                        return _this.props.resource.delete(data);
                    };
                    deleteAction['displayName'] = '删除';
                    rowActions.push(deleteAction);
                }
                else if (typeof action === 'string' && restResource.actions[action]) {
                    if (restResource.actions[action].isStatic)
                        staticActions.push(restResource.actions[action]);
                    else
                        rowActions.push(restResource.actions[action]);
                }
                else if (action.isStatic)
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
        var _a = this.state, staticActions = _a.staticActions, gridOptions = _a.gridOptions;
        if (!this.props.serverSideFilter && this.props.resource)
            gridOptions['rowData'] = getModel(this.props.store, this.props.modelPath || this.props.resource['modelPath']);
        else if (this.props.data)
            gridOptions['rowData'] = this.props.data;
        var GridRenderer = this.state.themeRenderer.GridRenderer;
        return React.createElement(GridRenderer, {actions: staticActions, onSelectAll: function () {
            _this.state.selectAll ? _this.gridApi.deselectAll() : _this.gridApi.selectAll();
            _this.state.selectAll = !_this.state.selectAll;
        }, dispatch: this.props.dispatch, gridApi: this.gridApi, height: this.props.height}, 
            React.createElement(ag_grid_react_1.AgGridReact, __assign({}, gridOptions))
        );
    };
    Grid = __decorate([
        connect(function (store) { return ({ store: store }); }), 
        __metadata('design:paramtypes', [Object])
    ], Grid);
    return Grid;
}(react_1.Component));
exports.Grid = Grid;
//# sourceMappingURL=Grid.js.map