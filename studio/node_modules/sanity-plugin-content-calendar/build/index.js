"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _router = require("part:@sanity/base/router");

var _calendarIcon = _interopRequireDefault(require("part:@sanity/base/calendar-icon"));

var _Calendar = _interopRequireDefault(require("./components/Calendar"));

var _default = {
  title: 'Calendar',
  name: 'calendar',
  router: (0, _router.route)('/:selectedDocumentId'),
  icon: _calendarIcon["default"],
  component: _Calendar["default"]
};
exports["default"] = _default;