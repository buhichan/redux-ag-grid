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
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by buhi on 2017/3/7.
 */
var React = require("react");
var sortOrder = [null, 'asc', 'desc'];
var CustomGridHeader = (function (_super) {
    __extends(CustomGridHeader, _super);
    function CustomGridHeader(params) {
        var _this = _super.call(this) || this;
        _this.params = params;
        _this.state = {
            sort: null,
        };
        _this.filterChanged = function () {
            _this.forceUpdate();
        };
        _this.changeSort = function () {
            var i = sortOrder.indexOf(_this.state.sort);
            var newState = sortOrder[(i + 1) % 3];
            _this.params.setSort(newState, true);
            _this.setState({
                sort: newState
            });
        };
        _this.openFilterMenu = function () {
            _this.params.showColumnMenu(_this.filter);
        };
        _this.bindRef = function (ref) { return _this.filter = ref; };
        return _this;
    }
    CustomGridHeader.prototype.componentWillMount = function () {
        this.params.column.addEventListener('filterChanged', this.filterChanged);
    };
    CustomGridHeader.prototype.componentWillUnmount = function () {
        this.params.column.removeEventListener('filterChanged', this.filterChanged);
    };
    CustomGridHeader.prototype.refresh = function () {
        console.log(arguments);
    };
    CustomGridHeader.prototype.render = function () {
        var _a = this.params, displayName = _a.displayName, enableSorting = _a.enableSorting, filterActive = _a.column.filterActive;
        if (!displayName)
            return null;
        return React.createElement("div", { className: "custom-grid-header" },
            React.createElement("span", { className: "header-label" }, displayName),
            React.createElement("span", { className: "grid-filter icon-list_ico4" + (filterActive ? " active" : ""), ref: this.bindRef, onClick: this.openFilterMenu }),
            enableSorting && React.createElement("span", { className: "grid-sort icon-" + getSortClassName(this.state.sort), onClick: this.changeSort }));
    };
    return CustomGridHeader;
}(React.PureComponent));
exports.CustomGridHeader = CustomGridHeader;
function getSortClassName(sort) {
    switch (sort) {
        case 'asc': return "list_ico2 active";
        case 'desc': return "list_ico active";
        default: return "list_ico3";
    }
}
exports.defaultGridOptions = {
    rowHeight: 45,
    headerHeight: 30,
    localeText: {
        filterOoo: "过滤...",
        applyFilter: "应用",
        equals: "=",
        lessThan: '<',
        greaterThan: '>',
        notContains: "不包含",
        notEquals: "≠",
        // for text filter
        contains: '包含',
        startsWith: '以...开始',
        endsWith: '以...结束',
    },
    defaultColDef: {
        headerComponentFramework: CustomGridHeader
    }
};
//# sourceMappingURL=defaultGridOptions.js.map