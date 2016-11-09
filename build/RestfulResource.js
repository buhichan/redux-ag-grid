/**
 * Created by YS on 2016/11/4.
 */
"use strict";
var ActionClassFactory_1 = require("./ActionClassFactory");
var Utils_1 = require("./Utils");
var RestfulResource = (function () {
    function RestfulResource(_a) {
        var _this = this;
        var url = _a.url, modelPath = _a.modelPath, dispatch = _a.dispatch, actions = _a.actions, _b = _a.options, options = _b === void 0 ? {} : _b;
        this.params = {};
        this.config = { params: {} };
        if (url.substr(-1) !== '/')
            url += '/';
        options.methods = options.methods || {};
        options.key = options.key || (function (x) { return x['id']; });
        options.mapResToData = options.mapResToData || (function (x) { return x; });
        var fetch = options.fetch || window.fetch;
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
                    if (_this.config.params && _this.config.params.filter)
                        _this.config.params.where = _this.config.params.filter.where;
                    return fetch(url + '/count' + Utils_1.keyValueToQueryParams(options.params(_this.config.params)), _this.config)
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
        this['get'] = options.methods.get || (function () {
            return fetch(url + Utils_1.keyValueToQueryParams(_this.config.params), _this.config)
                .then(function (res) { return res.json(); }).then(options.mapResToData).then(function (res) {
                dispatch({
                    type: "grid/model/get",
                    value: {
                        modelPath: modelPath,
                        gridName: _this.gridName,
                        key: options.key,
                        models: res
                    }
                });
            }, _this.errorHandler.bind(_this));
        });
        this['count'] = options.methods.count || (function () {
            return fetch(url + '/count' + Utils_1.keyValueToQueryParams(_this.config.params), _this.config)
                .then(function (res) { return res.json(); }).then(options.mapResToData).then(function (res) {
                dispatch({
                    type: "grid/model/count",
                    value: {
                        modelPath: modelPath,
                        gridName: _this.gridName,
                        key: options.key,
                        count: res
                    }
                });
            }, _this.errorHandler.bind(_this));
        });
        this['delete'] = options.methods.delete || (function (data) {
            return fetch(url + '/' + options.key(data) + Utils_1.keyValueToQueryParams(_this.config.params), Object.assign(_this.config, {
                method: "DELETE"
            })).then(function (res) { return res.json(); }).then(options.mapResToData).then(function (res) {
                if (res)
                    dispatch({
                        type: "grid/model/delete",
                        value: {
                            modelPath: modelPath,
                            gridName: _this.gridName,
                            key: options.key,
                            model: data
                        }
                    });
            }, _this.errorHandler.bind(_this));
        });
        this['put'] = options.methods.put || (function (data) {
            if (!options.key(data))
                return _this['post'](data);
            else
                return fetch(url + '/' + options.key(data) + Utils_1.keyValueToQueryParams(_this.config.params), Object.assign(_this.config, {
                    body: JSON.stringify(data)
                })).then(function (res) { return res.json(); }).then(options.mapResToData).then(function (res) {
                    dispatch({
                        type: "grid/model/put",
                        value: {
                            modelPath: modelPath,
                            gridName: _this.gridName,
                            key: options.key,
                            model: res
                        }
                    });
                }, _this.errorHandler.bind(_this));
        });
        this['post'] = options.methods.post || (function (data) {
            return fetch(url + Utils_1.keyValueToQueryParams(_this.config.params), Object.assign(_this.config, {
                body: JSON.stringify(data)
            })).then(function (res) { return res.json(); }).then(options.mapResToData).then(function (res) {
                dispatch({
                    type: "grid/model/post",
                    value: {
                        modelPath: modelPath,
                        gridName: _this.gridName,
                        key: options.key,
                        model: res
                    }
                });
            }, _this.errorHandler.bind(_this));
        });
        if (actions) {
            var Action_1 = ActionClassFactory_1.RestfulActionClassFactory(url);
            this.actions = actions.map(function (action) {
                return Action_1(action, function () { return _this.config; }, _this.options.key);
            });
        }
    }
    RestfulResource.prototype.errorHandler = function (err) {
        throw err;
    };
    RestfulResource.prototype.filter = function (_filter) {
        this.config.params = this.options.params ? this.options.params(_filter) : _filter;
    };
    return RestfulResource;
}());
exports.RestfulResource = RestfulResource;
//# sourceMappingURL=RestfulResource.js.map