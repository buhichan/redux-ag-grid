/**
 * Created by YS on 2016/11/4.
 */
"use strict";
var ActionClassFactory_1 = require("./ActionClassFactory");
var Utils_1 = require("./Utils");
var RestfulResource = (function () {
    function RestfulResource(_a) {
        var _this = this;
        var url = _a.url, modelPath = _a.modelPath, dispatch = _a.dispatch, key = _a.key, mapFilterToQuery = _a.mapFilterToQuery, methods = _a.methods, apiType = _a.apiType, fetch = _a.fetch, mapResToData = _a.mapResToData, actions = _a.actions, cacheTime = _a.cacheTime;
        this.config = {};
        this._query = {};
        if (url.substr(-1) === '/')
            url = url.slice(0, -1);
        this.key = key || (function (x) { return x['id']; });
        this.mapResToData = mapResToData || (function (x) { return x; });
        this.fetch = fetch || window.fetch;
        this.modelPath = modelPath;
        this.dispatch = dispatch;
        this.url = url;
        this.cacheTime = cacheTime;
        switch (apiType) {
            case "NodeRestful": {
                this.mapFilterToQuery = mapFilterToQuery || function (filter) {
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
                key = (function (x) { return x["_id"]; });
                break;
            }
            case "Loopback": {
                this.mapFilterToQuery = mapFilterToQuery || function (filter) {
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
                this.count = methods.count || (function () {
                    if (_this._query && _this._query['filter'])
                        _this._query['where'] = _this._query['filter']['where'];
                    return fetch(url + '/count' + Utils_1.keyValueToQueryParams(_this._query), _this.config)
                        .then(function (res) { return res.json(); }).then(function (res) { return mapResToData(res, 'count'); }).then(function (res) {
                        dispatch({
                            type: "grid/model/count",
                            value: {
                                modelPath: modelPath,
                                gridName: _this.gridName,
                                count: res
                            }
                        });
                        return res;
                    });
                });
                break;
            }
            case "Swagger": {
                this.mapFilterToQuery = mapFilterToQuery || (function (filter) {
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
        if (actions) {
            var MakeAction_1 = ActionClassFactory_1.RestfulActionClassFactory(this.url);
            this.actions = {};
            if (actions instanceof Array)
                actions.forEach(function (actionDef) {
                    _this.actions[actionDef.key || actionDef.name] =
                        MakeAction_1(actionDef.name, actionDef, _this.gridName, _this.config, _this._query, _this.key, modelPath, fetch, _this.mapResToData, _this.dispatch);
                });
            else
                Object.keys(actions).forEach(function (actionName) {
                    _this.actions[actionName] =
                        MakeAction_1(actionName, actions[actionName], _this.gridName, _this.config, _this._query, _this.key, modelPath, fetch, _this.mapResToData, _this.dispatch);
                });
        }
        if (methods)
            ['get', 'count', 'delete', 'post', 'put'].forEach(function (method) {
                if (methods[method])
                    _this[method] = methods[method].bind(_this);
            });
    }
    RestfulResource.prototype.get = function (id) {
        var _this = this;
        if (this.cacheTime) {
            if (!id && Date.now() - this.LastCachedTime < this.cacheTime * 1000) {
                return Promise.resolve(this.GetAllCache);
            }
        }
        return this.fetch(this.url + (id !== undefined ? ("/" + id) : "") + Utils_1.keyValueToQueryParams(this._query), this.config)
            .then(function (res) { return res.json(); }).then(function (res) {
            var models = _this.mapResToData(res, 'get', id);
            if (!id) {
                _this.dispatch({
                    type: "grid/model/get",
                    value: {
                        modelPath: _this.modelPath,
                        key: _this.key,
                        models: models
                    }
                });
                _this.GetAllCache = models;
                _this.LastCachedTime = Date.now();
            }
            else {
                _this.dispatch({
                    type: "grid/model/put",
                    value: {
                        modelPath: _this.modelPath,
                        key: _this.key,
                        model: models
                    }
                });
            }
            return models;
        }, this.errorHandler.bind(this));
    };
    RestfulResource.prototype.count = function () {
        var _this = this;
        return this.fetch(this.url + '/' + 'count' + Utils_1.keyValueToQueryParams(this._query), this.config)
            .then(function (res) { return res.json(); }).then(function (res) {
            var count = _this.mapResToData(res, 'count');
            _this.dispatch({
                type: "grid/model/count",
                value: {
                    modelPath: _this.modelPath,
                    gridName: _this.gridName,
                    key: _this.key,
                    count: count
                }
            });
            return count;
        }, this.errorHandler.bind(this));
    };
    RestfulResource.prototype.delete = function (data) {
        var _this = this;
        return this.fetch(this.url + '/' + this.key(data), Object.assign({}, this.config, {
            method: "DELETE"
        })).then(function (res) { return res.json(); }).then(function (res) {
            if (_this.mapResToData(res, 'delete', data)) {
                _this.dispatch({
                    type: "grid/model/delete",
                    value: {
                        modelPath: _this.modelPath,
                        key: _this.key,
                        model: data
                    }
                });
                _this.markAsDirty();
                return true;
            }
            return false;
        }, this.errorHandler.bind(this));
    };
    RestfulResource.prototype.put = function (data) {
        var _this = this;
        if (!this.key(data))
            return this['post'](data);
        else
            return this.fetch(this.url + '/' + this.key(data), Object.assign({}, this.config, {
                method: "PUT",
                body: JSON.stringify(data)
            })).then(function (res) { return res.json(); }).then(function (res) {
                var model = _this.mapResToData(res, 'put', data);
                _this.dispatch({
                    type: "grid/model/put",
                    value: {
                        modelPath: _this.modelPath,
                        key: _this.key,
                        model: model
                    }
                });
                _this.markAsDirty();
                return model;
            }, this.errorHandler.bind(this));
    };
    RestfulResource.prototype.post = function (data) {
        var _this = this;
        return this.fetch(this.url, Object.assign({}, this.config, {
            method: "POST",
            body: JSON.stringify(data)
        })).then(function (res) { return res.json(); }).then(function (res) {
            var model = _this.mapResToData(res, 'post', data);
            _this.dispatch({
                type: "grid/model/post",
                value: {
                    modelPath: _this.modelPath,
                    key: _this.key,
                    model: model
                }
            });
            _this.markAsDirty();
            return model;
        }, this.errorHandler.bind(this));
    };
    RestfulResource.prototype.errorHandler = function (err) {
        throw err;
    };
    RestfulResource.prototype.filter = function (_filter) {
        this.query(this.mapFilterToQuery(_filter), true);
        return this;
    };
    RestfulResource.prototype.query = function (query, extend) {
        if (extend === void 0) { extend = false; }
        if (extend)
            Object.assign(this._query, query);
        else
            this._query = query;
        return this;
    };
    RestfulResource.prototype.markAsDirty = function () {
        this.LastCachedTime = -Infinity;
        return this;
    };
    return RestfulResource;
}());
exports.RestfulResource = RestfulResource;
//# sourceMappingURL=RestfulResource.js.map