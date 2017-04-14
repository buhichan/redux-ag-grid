/**
 * Created by YS on 2016/9/24.
 */
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
require("ag-grid/dist/styles/ag-grid.css");
var react_1 = require("react");
var React = require("react");
var Utils_1 = require("./Utils");
var GridFilters_1 = require("./GridFilters");
var themes_1 = require("./themes");
var redux_1 = require("redux");
var defaultGridOptions_1 = require("./defaultGridOptions");
//todo: 1.3.0:做个selection的prop,表示用表头checkbox还是单击行来选择.
function getValue(model, field) {
    if (/\.|\[|\]/.test(field))
        return Utils_1.deepGet(model, field);
    else
        return model[field];
}
function defaultValueGetter(_a) {
    var colDef = _a.colDef, data = _a.data;
    return getValue(data, colDef.key);
}
var Store;
function setStore(store) {
    redux_1.Store = store;
}
exports.setStore = setStore;
var timeFormatOptions = { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false };
var dateFormatOptions = { year: "numeric", month: "2-digit", day: "2-digit" };
var datetimeFormatOptions = { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false };
var ReduxAgGrid = (function (_super) {
    __extends(ReduxAgGrid, _super);
    function ReduxAgGrid(props, context) {
        var _this = _super.call(this, props) || this;
        _this.apiSender = [];
        _this.sendApi = function (cb) {
            _this.apiSender.push(cb);
        };
        _this.onResize = function () {
            if (_this.pendingResize)
                clearTimeout(_this.pendingResize);
            setTimeout(function () { return _this.gridApi && _this.gridApi.sizeColumnsToFit(); }, 300);
        };
        _this.isUnmounting = false;
        _this.state = {
            quickFilterText: '',
            models: _this.props.resource ? Utils_1.deepGetState.apply(void 0, [redux_1.Store.getState()].concat(_this.props.resource._modelPath)) : null,
            gridOptions: __assign({ columnDefs: [], suppressNoRowsOverlay: true, rowData: [], paginationPageSize: 200, suppressPaginationPanel: true, rowModelType: _this.props.serverSideFiltering ? "pagination" : undefined, onGridReady: function (params) {
                    _this.gridApi = params.api;
                    if (_this.props.columnApi)
                        _this.props.columnApi(params.columnApi);
                    if (_this.apiSender)
                        _this.apiSender.forEach(function (send) { return send(params.api); });
                }, onColumnEverythingChanged: function () { return window.innerWidth >= 480 && _this.gridApi && _this.gridApi.sizeColumnsToFit(); }, rowSelection: "multiple", enableSorting: true, enableFilter: true, enableColResize: true }, defaultGridOptions_1.defaultGridOptions),
            themeRenderer: themes_1.currentTheme(),
            staticActions: []
        };
        Object.assign(_this.state.gridOptions, props.gridOptions);
        if (_this.props.gridApi)
            _this.apiSender.push(_this.props.gridApi);
        return _this;
    }
    ReduxAgGrid.prototype.shouldComponentUpdate = function (nextProps, nextState) {
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
    ReduxAgGrid.prototype.componentDidMount = function () {
        if (this.props.resource)
            this.unsubscriber = redux_1.Store.subscribe(this.handleStoreChange.bind(this));
    };
    ReduxAgGrid.prototype.handleStoreChange = function () {
        if (this.props.resource) {
            var models = Utils_1.deepGetState.apply(void 0, [redux_1.Store.getState()].concat(this.props.resource._modelPath));
            this.setState({
                models: models
            });
        }
    };
    ReduxAgGrid.prototype.componentWillUnmount = function () {
        this.isUnmounting = true;
        if (this.props.gridApi)
            this.props.gridApi(null);
        this.unsubscriber && this.unsubscriber();
        if (this.apiSender)
            this.apiSender.forEach(function (send) { return send(null); });
        window.removeEventListener('resize', this.onResize);
    };
    ReduxAgGrid.prototype.componentWillMount = function () {
        var _this = this;
        if (!this.props.resource && !this.props.data) {
            throw new Error("请使用ResourceAdapterService构造一个Resource或传入data");
        }
        else if (this.props.resource) {
            if (!this.props.resource._modelPath)
                throw new Error("请在resource上声明modelPath:string[]");
            this.props.resource._gridName = this.props.gridName || ('grid' + Math.random());
        }
        window.addEventListener('resize', this.onResize);
        this.parseSchema(this.props.schema).then(function (parsed) {
            _this.onReady(parsed);
        });
    };
    ReduxAgGrid.prototype.onReady = function (schema) {
        var _this = this;
        var _a = this.getActions(), staticActions = _a.staticActions, rowActions = _a.rowActions;
        var gridOptions = __assign({}, this.state.gridOptions, { quickFilterText: this.state.quickFilterText, context: {
                getSelected: function () { return _this.gridApi.getSelectedRows(); },
                dispatch: this.props.dispatch
            } });
        var columnDefs;
        if (!schema || !schema.length)
            columnDefs = [];
        else {
            if (rowActions.length)
                columnDefs = schema.concat(__assign({ headerName: "", suppressFilter: true, suppressMenu: true, suppressSorting: true, cellRendererFramework: this.state.themeRenderer.ActionCellRenderer(rowActions) }, this.props.actionColDef || {}));
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
                columnDefs.unshift({
                    checkboxSelection: true,
                    valueGetter: function () { return ""; },
                    headerName: "",
                    width: 62,
                    minWidth: 62,
                    suppressResize: true,
                    headerCheckboxSelection: true,
                    headerCheckboxSelectionFilteredOnly: true
                });
                gridOptions.suppressRowClickSelection = true;
            }
            else if (this.props.selectionStyle === 'row')
                gridOptions.suppressRowClickSelection = false;
        }
        gridOptions.columnDefs = columnDefs;
        if (this.props.resource) {
            if (this.props.serverSideFiltering) {
                gridOptions.datasource = {
                    getRows: function (params) {
                        var storeState = redux_1.Store.getState();
                        var resource = _this.props.resource;
                        var allData = Utils_1.deepGetState.apply(void 0, [storeState].concat(_this.props.resource._modelPath));
                        var gridInfo = Utils_1.deepGetState(storeState, 'grid', resource._gridName);
                        var _a = gridInfo ? gridInfo.toObject() : { count: null, countedTime: 0 }, count = _a.count, countedTime = _a.countedTime;
                        var data = allData.slice(params.startRow, params.endRow).toArray();
                        if (Date.now() - countedTime > resource._cacheTime * 1000 ||
                            count === null ||
                            data.some(function (x) { return x === null; }) ||
                            data.length < Math.min(count, params.endRow) - params.startRow) {
                            resource.filter({
                                pagination: {
                                    offset: params.startRow,
                                    limit: params.endRow - params.startRow
                                }
                            });
                            Promise.all([
                                resource.get(),
                                resource.count(),
                            ]).then(function (_a) {
                                var data = _a[0], count = _a[1];
                                params.successCallback(data, count);
                            });
                        }
                        else if (count !== null)
                            params.successCallback(data, count);
                        else
                            params.successCallback(data);
                    }
                };
            }
            else {
                this.props.resource.get().then(function () {
                    _this.state.gridOptions.rowData = Utils_1.deepGetState.apply(void 0, [redux_1.Store.getState()].concat(_this.props.resource._modelPath));
                    _this.setState({ gridOptions: _this.state.gridOptions });
                });
            }
        }
        this.setState({
            staticActions: staticActions,
            gridOptions: gridOptions,
        });
    };
    ReduxAgGrid.prototype.setState = function (P, c) {
        if (this.isUnmounting)
            return;
        else
            _super.prototype.setState.call(this, P, c);
    };
    ReduxAgGrid.prototype.componentWillReceiveProps = function (newProps) {
        var _this = this;
        if (newProps.schema !== this.props.schema)
            this.parseSchema(newProps.schema).then(function (parsed) {
                _this.onReady(parsed);
            });
    };
    ReduxAgGrid.prototype.parseSchema = function (schema) {
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
                        break;
                    case "date":
                        colDef.valueGetter = function (_a) {
                            var colDef = _a.colDef, data = _a.data;
                            var v = getValue(data, colDef.key);
                            return v ? new Date(v).toLocaleDateString(undefined, dateFormatOptions).replace(/\//g, '-') : "";
                        };
                        break;
                    case "time":
                        colDef.valueGetter = function (_a) {
                            var colDef = _a.colDef, data = _a.data;
                            var v = getValue(data, colDef.key);
                            return v ? new Date(v).toLocaleTimeString(undefined, timeFormatOptions) : "";
                        };
                        break;
                    case "datetime":
                    case "datetime-local":
                        colDef.valueGetter = function (_a) {
                            var colDef = _a.colDef, data = _a.data;
                            var v = getValue(data, colDef.key);
                            return v ? new Date(v).toLocaleString(undefined, datetimeFormatOptions).replace(/\//g, '-') : "";
                        };
                        break;
                    case "number":
                        colDef.valueGetter = defaultValueGetter;
                        colDef.cellRenderer = function (_a) {
                            var value = _a.value;
                            return Number(value).toLocaleString();
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
                var filter = GridFilters_1.getFilter(column.type);
                if (filter)
                    colDef.filterFramework = filter;
                if (column.key)
                    colDef.colId = column.key;
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
    ReduxAgGrid.prototype.getActions = function () {
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
    ReduxAgGrid.prototype.render = function () {
        var AgGrid = React.Children.only(this.props.children);
        var _a = this.state, staticActions = _a.staticActions, gridOptions = _a.gridOptions;
        if (!this.props.serverSideFiltering && this.props.resource)
            gridOptions.rowData = this.state.models.toArray();
        else if (this.props.data)
            gridOptions.rowData = this.props.data;
        var GridRenderer = this.state.themeRenderer.GridRenderer;
        var AgGridCopy = React.cloneElement(AgGrid, Object.assign(gridOptions, AgGrid.props));
        return React.createElement(GridRenderer, { noSearch: this.props.noSearch, actions: staticActions, dispatch: this.props.dispatch, apiRef: this.sendApi, height: this.props.height }, AgGridCopy);
    };
    return ReduxAgGrid;
}(react_1.Component));
exports.ReduxAgGrid = ReduxAgGrid;
//# sourceMappingURL=Grid.js.map