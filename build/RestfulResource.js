/**
 * Created by YS on 2016/11/4.
 */
"use strict";
var ActionClassFactory_1 = require("./ActionClassFactory");
var Utils_1 = require("./Utils");
var RestfulResource = (function () {
    function RestfulResource(_a) {
        var url = _a.url, modelPath = _a.modelPath, dispatch = _a.dispatch, _b = _a.key, key = _b === void 0 ? (function (x) { return x['id']; }) : _b, mapFilterToQuery = _a.mapFilterToQuery, _c = _a.methods, methods = _c === void 0 ? {} : _c, _d = _a.apiType, apiType = _d === void 0 ? 'Loopback' : _d, _e = _a.fetch, fetch = _e === void 0 ? window.fetch.bind(window) : _e, _f = _a.mapResToData, mapResToData = _f === void 0 ? function (x) { return x; } : _f, actions = _a.actions, _g = _a.cacheTime, cacheTime = _g === void 0 ? 5 : _g;
        var _this = this;
        this._config = {};
        this._isCustomFilterPresent = false;
        this._query = {};
        this._filter = {};
        //fixme: filter and query is chaotic
        this._lastGetAll = null;
        this.offset = null;
        if (url.substr(-1) === '/')
            url = url.slice(0, -1);
        this._idGetter = key;
        this._mapResToData = mapResToData;
        this._modelPath = modelPath;
        this._dispatch = dispatch;
        this._url = url;
        this._fetch = fetch;
        this._cacheTime = cacheTime;
        switch (apiType) {
            case "NodeRestful": {
                this._mapFilterToQuery = mapFilterToQuery || function (filter) {
                    var _filter = {};
                    filter.search && filter.search.forEach(function (condition) {
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
                this._mapFilterToQuery = mapFilterToQuery || function (filter) {
                    var _filter = { where: {} };
                    filter.search && filter.search.forEach(function (condition) {
                        if (/^\/.*\/$/.test(condition.value))
                            _filter.where[condition.field] = { like: condition.value.slice(1, -1) };
                        else
                            _filter.where[condition.field] = condition.value;
                    });
                    if (filter.pagination) {
                        _filter.offset = filter.pagination.offset;
                        _filter.limit = filter.pagination.limit;
                    }
                    if (filter.sort && filter.sort.field)
                        _filter.order = filter.sort.field + (filter.sort.reverse ? " DESC" : " ASC");
                    else
                        _filter.order = null;
                    return { filter: _filter };
                };
                this.count = methods['count'] || (function () {
                    if (_this._query && _this._query['filter'])
                        _this._query['where'] = _this._query['filter']['where'];
                    return fetch(url + '/count' + Utils_1.keyValueToQueryParams(_this._query), _this._config)
                        .then(function (res) { return res.json(); }).then(function (_a) {
                        var count = _a.count;
                        dispatch({
                            type: "grid/model/count",
                            value: {
                                modelPath: modelPath,
                                gridName: _this._gridName,
                                count: count
                            }
                        });
                        return count;
                    });
                });
                break;
            }
            case "Swagger": {
                this._mapFilterToQuery = mapFilterToQuery || (function (filter) {
                    var params = {};
                    if (filter.pagination) {
                        params['page'] = (filter.pagination.offset / filter.pagination.limit + 1);
                        params['perPage'] = filter.pagination.limit;
                    }
                    if (filter.sort && filter.sort.field)
                        params['order'] = (filter.sort.field + filter.sort.reverse ? " DESC" : " ASC");
                    return params;
                });
                break;
            }
        }
        if (actions) {
            var MakeAction_1 = ActionClassFactory_1.RestfulActionClassFactory(this._url);
            this.actions = {};
            if (actions instanceof Array)
                actions.forEach(function (actionDef) {
                    _this.actions[actionDef.key] =
                        MakeAction_1(actionDef.key, actionDef, _this._gridName, _this._config, function () { return _this._query; }, _this._idGetter, modelPath, fetch, _this._mapResToData, _this._dispatch);
                });
            else
                Object.keys(actions).forEach(function (actionName) {
                    _this.actions[actionName] =
                        MakeAction_1(actionName, actions[actionName], _this._gridName, _this._config, function () { return _this._query; }, _this._idGetter, modelPath, fetch, _this._mapResToData, _this._dispatch);
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
        if (!id) {
            if (!this._isCustomFilterPresent && this._cacheTime && this._lastGetAll && Date.now() - this._lastCachedTime < this._cacheTime * 1000) {
                return this._lastGetAll;
            }
        }
        this._lastCachedTime = Date.now();
        var pending = this._fetch(this._url + (id !== undefined ? ("/" + id) : "") + this.getQueryString(), this._config)
            .then(function (res) { return res.json(); }).then(function (res) {
            var models = _this._mapResToData(res, 'get', id);
            if (!_this._isCustomFilterPresent) {
                if (!id) {
                    _this._dispatch({
                        type: "grid/model/get",
                        value: {
                            modelPath: _this._modelPath,
                            key: _this._idGetter,
                            models: models,
                            offset: _this.offset
                        }
                    });
                }
                else {
                    _this._dispatch({
                        type: "grid/model/put",
                        value: {
                            modelPath: _this._modelPath,
                            key: _this._idGetter,
                            model: models
                        }
                    });
                }
            }
            return models;
        }, function (e) {
            if (!_this._isCustomFilterPresent)
                _this._lastGetAll = null;
            return _this.errorHandler(e);
        });
        if (this.offset === null && !id && !this._isCustomFilterPresent)
            this._lastGetAll = pending;
        return pending;
    };
    RestfulResource.prototype.count = function () {
        var _this = this;
        return this._fetch(this._url + '/' + 'count' + this.getQueryString(), this._config)
            .then(function (res) { return res.json(); }).then(function (res) {
            var count = _this._mapResToData(res, 'count');
            _this._dispatch({
                type: "grid/model/count",
                value: {
                    modelPath: _this._modelPath,
                    gridName: _this._gridName,
                    key: _this._idGetter,
                    count: count
                }
            });
            return count;
        }, this.errorHandler.bind(this));
    };
    RestfulResource.prototype.delete = function (data) {
        var _this = this;
        return this._fetch(this._url + '/' + this._idGetter(data), Object.assign({}, this._config, {
            method: "DELETE"
        })).then(function (res) { return res.json(); }).then(function (res) {
            if (_this._mapResToData(res, 'delete', data)) {
                _this._dispatch({
                    type: "grid/model/delete",
                    value: {
                        modelPath: _this._modelPath,
                        key: _this._idGetter,
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
        if (!this._idGetter(data))
            return this['post'](data);
        else
            return this._fetch(this._url + '/' + this._idGetter(data), Object.assign({}, this._config, {
                method: "PUT",
                body: JSON.stringify(data)
            })).then(function (res) { return res.json(); }).then(function (res) {
                var model = _this._mapResToData(res, 'put', data);
                _this._dispatch({
                    type: "grid/model/put",
                    value: {
                        modelPath: _this._modelPath,
                        key: _this._idGetter,
                        model: model
                    }
                });
                _this.markAsDirty();
                return model;
            }, this.errorHandler.bind(this));
    };
    RestfulResource.prototype.post = function (data) {
        var _this = this;
        return this._fetch(this._url, Object.assign({}, this._config, {
            method: "POST",
            body: JSON.stringify(data)
        })).then(function (res) { return res.json(); }).then(function (res) {
            var model = _this._mapResToData(res, 'post', data);
            _this._dispatch({
                type: "grid/model/post",
                value: {
                    modelPath: _this._modelPath,
                    key: _this._idGetter,
                    model: model
                }
            });
            _this.markAsDirty();
            return model;
        }, this.errorHandler.bind(this));
    };
    RestfulResource.prototype.errorHandler = function (e) {
        throw e;
    };
    RestfulResource.prototype.getQueryString = function () {
        return Utils_1.keyValueToQueryParams(Object.assign({}, this._filter, this._query));
    };
    RestfulResource.prototype.filter = function (_filter) {
        this._filter = this._mapFilterToQuery(_filter);
        if (_filter.pagination)
            this.offset = _filter.pagination.offset;
        return this;
    };
    RestfulResource.prototype.query = function (query) {
        if (!query || !Object.keys(query).length) {
            this._query = {};
            this._isCustomFilterPresent = false;
        }
        else {
            this._query = query;
            this._isCustomFilterPresent = true;
        }
        return this;
    };
    RestfulResource.prototype.markAsDirty = function () {
        this._lastCachedTime = -Infinity;
        return this;
    };
    return RestfulResource;
}());
exports.RestfulResource = RestfulResource;
//# sourceMappingURL=RestfulResource.js.map