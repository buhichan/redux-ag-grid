/**
 * Created by YS on 2016/11/4.
 */
"use strict";
var ActionClassFactory_1 = require("./ActionClassFactory");
var Utils_1 = require("./Utils");
var RestfulResource = (function () {
    function RestfulResource(_a) {
        var _this = this;
        var url = _a.url, modelPath = _a.modelPath, dispatch = _a.dispatch, _b = _a.options, options = _b === void 0 ? {} : _b, actions = _a.actions;
        this.params = {};
        this.config = {};
        if (url.substr(-1) !== '/')
            url += '/';
        options.methods = options.methods || {};
        options.key = options.key || (function (x) { return x['id']; });
        options.mapResToData = options.mapResToData || (function (x) { return x; });
        this._fetch = options.fetch || window.fetch;
        this.options = options;
        this.modelPath = modelPath;
        switch (options.apiType) {
            case "NodeRestful": {
                options.params = options.params || function (filter) {
                    var _filter = {};
                    filter.search.forEach(function (condition) {
                        var key = condition.field.replace(/\[[^\]]*\]/, '');
                        if (/^\/.*\/$/.test(condition.value))
                            _filter[key + "__regex"] = condition.value;
                        else
                            _filter[key + "__equals"] = condition.value;
                    });
                    if (filter.pagination) {
                        _filter.offset = filter.pagination.offset;
                        _filter.limit = filter.pagination.limit;
                    }
                    if (filter.sort && filter.sort.field) {
                        var field = filter.sort.field.replace(/\[[^\]]*\]/, '');
                        _filter.sort = (filter.sort.reverse ? "-" : "") + field;
                    }
                    return _filter;
                };
                options.key = (function (x) { return x["_id"]; });
                break;
            }
            case "Loopback": {
                options.params = options.params || function (filter) {
                    var _filter = { where: {} };
                    filter.search.forEach(function (condition) {
                        if (/^\/.*\/$/.test(condition.value))
                            _filter.where[condition.field] = { like: condition.value.slice(1, -1) };
                        else
                            _filter.where[condition.field] = condition.value;
                    });
                    if (filter.pagination) {
                        _filter.offset = filter.pagination.offset;
                        _filter.limit = filter.pagination.limit;
                    }
                    if (filter.sort.field)
                        _filter.order = filter.sort.field + (filter.sort.reverse ? " DESC" : " ASC");
                    else
                        _filter.order = null;
                    return { filter: _filter };
                };
                options.methods.count = options.methods.count || (function () {
                    if (_this.params && _this.params['filter'])
                        _this.params['where'] = _this.params['filter'].where;
                    return _this._fetch(url + '/count' + Utils_1.keyValueToQueryParams(options.params(_this.params)), _this.config)
                        .then(function (res) { return res.json(); }).then(options.mapResToData).then(function (res) {
                        dispatch({
                            type: "grid/model/count",
                            value: {
                                modelPath: modelPath,
                                gridName: _this.gridName,
                                count: res
                            }
                        });
                    });
                });
                break;
            }
            case "Swagger": {
                options.params = options.params || (function (filter) {
                    var params = {};
                    if (filter.pagination) {
                        params['page'] = (filter.pagination.offset / filter.pagination.limit + 1);
                        params['perPage'] = filter.pagination.limit;
                    }
                    if (filter.sort)
                        params['order'] = (filter.sort.field + filter.sort.reverse ? " DESC" : " ASC");
                    return params;
                });
                break;
            }
        }
        //TODO catch exception
        this.get = options.methods.get || (function (id) {
            return _this._fetch(url + (id !== undefined ? id : "") + Utils_1.keyValueToQueryParams(_this.params), _this.config)
                .then(function (res) { return res.json(); }).then(function (res) {
                dispatch({
                    type: "grid/model/get",
                    value: {
                        modelPath: modelPath,
                        key: options.key,
                        models: options.mapResToData(res, 'get')
                    }
                });
                return res;
            }, _this.errorHandler.bind(_this));
        });
        this.count = options.methods.count || (function () {
            return _this._fetch(url + 'count' + Utils_1.keyValueToQueryParams(_this.params), _this.config)
                .then(function (res) { return res.json(); }).then(function (res) {
                dispatch({
                    type: "grid/model/count",
                    value: {
                        modelPath: modelPath,
                        gridName: _this.gridName,
                        key: options.key,
                        count: options.mapResToData(res, 'count')
                    }
                });
                return res;
            }, _this.errorHandler.bind(_this));
        });
        this.delete = options.methods.delete || (function (data) {
            return _this._fetch(url + options.key(data), Object.assign({}, _this.config, {
                method: "DELETE"
            })).then(function (res) { return res.json(); }).then(function (res) {
                if (options.mapResToData(res, 'delete'))
                    dispatch({
                        type: "grid/model/delete",
                        value: {
                            modelPath: modelPath,
                            key: options.key,
                            model: data
                        }
                    });
                return res;
            }, _this.errorHandler.bind(_this));
        });
        this.put = options.methods.put || (function (data) {
            if (!options.key(data))
                return _this['post'](data);
            else
                return _this._fetch(url + options.key(data), Object.assign({}, _this.config, {
                    method: "PUT",
                    body: JSON.stringify(data)
                })).then(function (res) { return res.json(); }).then(function (res) {
                    dispatch({
                        type: "grid/model/put",
                        value: {
                            modelPath: modelPath,
                            key: options.key,
                            model: options.mapResToData(res, 'put')
                        }
                    });
                    return res;
                }, _this.errorHandler.bind(_this));
        });
        this.post = options.methods.post || (function (data) {
            return _this._fetch(url, Object.assign({}, _this.config, {
                method: "POST",
                body: JSON.stringify(data)
            })).then(function (res) { return res.json(); }).then(function (res) {
                dispatch({
                    type: "grid/model/post",
                    value: {
                        modelPath: modelPath,
                        key: options.key,
                        model: options.mapResToData(res, 'post')
                    }
                });
                return res;
            }, _this.errorHandler.bind(_this));
        });
        if (actions) {
            var MakeAction_1 = ActionClassFactory_1.RestfulActionClassFactory(url);
            this.actions = {};
            if (actions instanceof Array)
                actions.forEach(function (actionDef) {
                    _this.actions[actionDef.key || actionDef.name] = MakeAction_1(actionDef.name, actionDef, _this.gridName, _this.config, _this.params, _this.options.key, modelPath, _this._fetch, _this.options.mapResToData);
                });
            else
                Object.keys(actions).forEach(function (actionName) {
                    _this.actions[actionName] = MakeAction_1(actionName, actions[actionName], _this.gridName, _this.config, _this.params, _this.options.key, modelPath, _this._fetch, _this.options.mapResToData);
                });
        }
    }
    RestfulResource.prototype.errorHandler = function (err) {
        throw err;
    };
    RestfulResource.prototype.filter = function (_filter) {
        this.params = this.options.params ? this.options.params(_filter) : _filter;
    };
    return RestfulResource;
}());
exports.RestfulResource = RestfulResource;
//# sourceMappingURL=RestfulResource.js.map