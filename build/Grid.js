/**
 * Created by YS on 2016/9/24.
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
require("ag-grid/dist/styles/ag-grid.css");
var react_1 = require("react");
var React = require("react");
var Utils_1 = require("./Utils");
var GridFilters_1 = require("./GridFilters");
var themes_1 = require("./themes");
var redux_1 = require("redux");
var formatDate = new Intl.DateTimeFormat(['zh-CN'], {
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
});
var formatDateTime = new Intl.DateTimeFormat(['zh-CN'], {
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
});
//todo: 1.3.0:做个selection的prop,表示用表头checkbox还是单击行来选择.
function getValue(model, field) {
    if (/\.|\[|\]/.test(field))
        return Utils_1.deepGet(model, field);
    else
        return model[field];
}
var formatNumber = new Intl.NumberFormat([], {
    currency: "CNY"
});
var Store;
function setStore(store) {
    redux_1.Store = store;
}
exports.setStore = setStore;
var Grid = (function (_super) {
    __extends(Grid, _super);
    function Grid(props, context) {
        var _this = _super.call(this, props) || this;
        _this.onResize = function () {
            if (_this.pendingResize)
                clearTimeout(_this.pendingResize);
            setTimeout(function () { return _this.gridApi && _this.gridApi.sizeColumnsToFit(); }, 300);
        };
        _this.isUnmounting = false;
        _this.onSelectAll = function () {
            _this.state.selectAll ? _this.gridApi.deselectAll() : _this.gridApi.selectAll();
            _this.state.selectAll = !_this.state.selectAll;
        };
        _this.state = {
            quickFilterText: '',
            models: _this.props.resource ? Utils_1.deepGetState.apply(void 0, [redux_1.Store.getState()].concat(_this.props.resource._modelPath)) : null,
            gridOptions: {
                columnDefs: [],
                suppressNoRowsOverlay: true,
                rowData: [],
                paginationPageSize: 20,
                rowHeight: 40,
                onGridReady: function (params) {
                    _this.gridApi = params.api;
                    _this.columnApi = params.columnApi;
                    if (_this.props.gridApi)
                        _this.props.gridApi(_this.gridApi);
                    if (_this.props.columnApi)
                        _this.props.columnApi(_this.columnApi);
                },
                onColumnEverythingChanged: function () { return window.innerWidth >= 480 && _this.gridApi && _this.gridApi.sizeColumnsToFit(); },
                rowSelection: "multiple",
                enableSorting: true,
                enableFilter: true,
                enableColResize: true
            },
            themeRenderer: themes_1.currentTheme(),
            selectAll: false,
            staticActions: []
        };
        Object.assign(_this.state.gridOptions, props.gridOptions);
        return _this;
    }
    Grid.prototype.shouldComponentUpdate = function (nextProps, nextState) {
        if (this.props.schema !== nextProps.schema ||
            this.props.actions !== nextProps.actions ||
            this.state.gridOptions.columnDefs !== nextState.gridOptions.columnDefs ||
            this.state.staticActions !== nextState.staticActions)
            return true;
        if (this.props.resource) {
            return nextState.models !== this.state.models;
        }
        else
            return this.props.data !== nextProps.data;
    };
    Grid.prototype.componentDidMount = function () {
        if (this.props.resource)
            this.unsubscriber = redux_1.Store.subscribe(this.handleStoreChange.bind(this));
    };
    Grid.prototype.handleStoreChange = function () {
        if (this.props.resource) {
            var models = Utils_1.deepGetState.apply(void 0, [redux_1.Store.getState()].concat(this.props.resource._modelPath));
            this.setState({
                models: models
            });
        }
    };
    Grid.prototype.componentWillUnmount = function () {
        this.isUnmounting = true;
        if (this.props.gridApi)
            this.props.gridApi(null);
        this.unsubscriber && this.unsubscriber();
        window.removeEventListener('resize', this.onResize);
    };
    Grid.prototype.componentWillMount = function () {
        var _this = this;
        if (!this.props.resource && !this.props.data) {
            throw new Error("请使用ResourceAdapterService构造一个Resource或传入data");
        }
        else if (this.props.resource) {
            if (!this.props.resource._modelPath)
                throw new Error("请在resource上声明modelPath:string[]");
            this.props.resource.get();
            this.props.resource['_gridName'] = this.props.gridName || ('grid' + Math.random());
        }
        window.addEventListener('resize', this.onResize);
        this.parseSchema(this.props.schema).then(function (parsed) {
            _this.onReady(parsed);
        });
    };
    Grid.prototype.onReady = function (schema) {
        var _this = this;
        var _a = this.getActions(), staticActions = _a.staticActions, rowActions = _a.rowActions;
        var gridOptions = Object.assign(this.state.gridOptions, {
            quickFilterText: this.state.quickFilterText,
            context: {
                getSelected: function () { return _this.gridApi.getSelectedRows(); },
                dispatch: this.props.dispatch
            },
        });
        var columnDefs;
        if (!schema || !schema.length)
            columnDefs = [];
        else {
            if (rowActions.length)
                columnDefs = schema.concat({
                    headerName: "",
                    suppressFilter: true,
                    suppressMenu: true,
                    suppressSorting: true,
                    cellRendererFramework: this.state.themeRenderer.ActionCellRenderer(rowActions)
                });
            else
                columnDefs = schema;
            if (this.props.selectionStyle === 'checkbox') {
                //todo: if checkbox renderer is defined, use it, otherwise use ag-grid's default
                // if(this.state.themeRenderer.CheckboxRenderer)
                //     columnDefs.unshift({
                //         cellRendererFramework: this.state.themeRenderer.CheckboxRenderer,
                //         headerName: "",
                //         suppressFilter: true,
                //         suppressMenu: true,
                //         suppressSorting: true,
                //         headerComponentFramework: this.state.themeRenderer.CheckboxRenderer
                //     });
                Object.assign(columnDefs[0], {
                    checkboxSelection: true,
                    headerCheckboxSelection: true,
                    headerCheckboxSelectionFilteredOnly: true
                });
                gridOptions.suppressRowClickSelection = true;
            }
            else if (this.props.selectionStyle === 'row') {
                gridOptions.suppressRowClickSelection = false;
            }
        }
        gridOptions.columnDefs = columnDefs;
        if (this.props.resource) {
            //todo: server side filtering
            if (this.props.serverSideFilter) {
                gridOptions['rowModelType'] = 'virtual';
                gridOptions['datasource'] = {
                    getRows: function (params) {
                        var data = Utils_1.deepGetState.apply(void 0, [redux_1.Store.getState()].concat(_this.props.resource._modelPath));
                        if (data.length < params.endRow) {
                            var resource = _this.props.resource;
                            resource.filter({
                                pagination: {
                                    offset: params.startRow,
                                    limit: params.endRow - params.startRow
                                }
                            });
                            resource.get().then(function () {
                                var data = Utils_1.deepGetState.apply(void 0, [redux_1.Store.getState()].concat(_this.props.resource._modelPath));
                                params.successCallback(data.slice(params.startRow, params.endRow), data.length <= params.endRow ? data.length : undefined);
                            });
                        }
                        else
                            params.successCallback(data.slice(params.startRow, params.endRow));
                    }
                };
            }
            else
                gridOptions['rowData'] = Utils_1.deepGetState.apply(void 0, [redux_1.Store.getState()].concat(this.props.resource._modelPath));
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
            this.parseSchema(newProps.schema).then(function (parsed) {
                _this.onReady(parsed);
            });
    };
    Grid.prototype.parseSchema = function (schema) {
        var _this = this;
        return Promise.all(schema.map(function (column) {
            var syncParseField = function (options, children) {
                var colDef = Object.assign({
                    headerName: column.label
                }, column);
                //todo deep key not works with select/date
                switch (column.type) {
                    case "select":
                        colDef.valueGetter = function enumValueGetter(_a) {
                            var colDef = _a.colDef, data = _a.data;
                            function getValueByName(entryValue) {
                                var i = options.findIndex(function (x) { return x.value == entryValue; });
                                if (i < 0)
                                    return null;
                                else
                                    return options[i].name;
                            }
                            var value = getValue(data, colDef.key);
                            if (value instanceof Array)
                                return value.map(getValueByName).filter(null);
                            else
                                return getValueByName(value);
                        };
                        colDef.cellRendererFramework = _this.state.themeRenderer.SelectFieldRenderer(options);
                        colDef['_options'] = options; //may be polluted ?
                        colDef.filterFramework = GridFilters_1.EnumFilter;
                        break;
                    case "date":
                    case "datetime-local":
                        var formatter_1;
                        if (column.type === "date")
                            formatter_1 = formatDate;
                        else
                            formatter_1 = formatDateTime;
                        colDef.valueGetter = function (_a) {
                            var colDef = _a.colDef, data = _a.data;
                            var v = getValue(data, colDef.key);
                            return v ? formatter_1.format(new Date(v)) : "";
                        };
                        colDef.filterFramework = GridFilters_1.DateFilter;
                        break;
                    case "number":
                        colDef.valueGetter = function (_a) {
                            var colDef = _a.colDef, data = _a.data;
                            return formatNumber.format(getValue(data, colDef.key));
                        };
                        break;
                    case "checkbox":
                        colDef.valueGetter = function (_a) {
                            var colDef = _a.colDef, data = _a.data;
                            return getValue(data, colDef.key) ? "是" : "否";
                        };
                        break;
                    case "group":
                        colDef.children = children;
                        colDef.marryChildren = true;
                        break;
                    default:
                        colDef.field = column.key && column.key.replace(/\[(\d+)\]/g, ".$1");
                }
                return colDef;
            };
            if (column.options && typeof column.options === 'function') {
                var asyncOptions = column.options;
                return asyncOptions().then(syncParseField);
            }
            else if (column.type === 'group' && column.children) {
                return _this.parseSchema(column.children).then(function (children) {
                    return syncParseField(column.options, children);
                });
            }
            else
                return Promise.resolve(syncParseField(column.options));
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
                else {
                    var actionInst = action;
                    Object.assign(actionInst.call, actionInst);
                    if (actionInst.isStatic)
                        staticActions.push(actionInst.call);
                    else
                        rowActions.push(actionInst.call);
                }
            });
        return {
            staticActions: staticActions,
            rowActions: rowActions
        };
    };
    Grid.prototype.render = function () {
        var AgGrid = React.Children.only(this.props.children);
        var _a = this.state, staticActions = _a.staticActions, gridOptions = _a.gridOptions;
        if (!this.props.serverSideFilter && this.props.resource)
            gridOptions['rowData'] = this.state.models.toArray();
        else if (this.props.data)
            gridOptions['rowData'] = this.props.data;
        var GridRenderer = this.state.themeRenderer.GridRenderer;
        var AgGridCopy = React.cloneElement(AgGrid, Object.assign(gridOptions, AgGrid.props));
        return React.createElement(GridRenderer, { noSearch: this.props.noSearch, actions: staticActions, onSelectAll: this.onSelectAll, dispatch: this.props.dispatch, gridApi: this.gridApi, height: this.props.height }, AgGridCopy);
    };
    return Grid;
}(react_1.Component));
exports.Grid = Grid;
var a = Grid;
//# sourceMappingURL=Grid.js.map