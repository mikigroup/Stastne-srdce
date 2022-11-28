"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dialogTitle = exports.timeFormat = exports.dateFormat = exports.showAuthor = exports.nativeOptions = exports.events = exports.filterWarnings = exports.calendar = exports.types = void 0;

var _configContentCalendar = _interopRequireDefault(require("config:content-calendar"));

var _config$types = _configContentCalendar["default"].types,
    types = _config$types === void 0 ? [] : _config$types,
    _config$calendar = _configContentCalendar["default"].calendar,
    calendar = _config$calendar === void 0 ? {} : _config$calendar,
    _config$filterWarning = _configContentCalendar["default"].filterWarnings,
    filterWarnings = _config$filterWarning === void 0 ? {} : _config$filterWarning;
exports.filterWarnings = filterWarnings;
exports.calendar = calendar;
exports.types = types;
var _calendar$events = calendar.events,
    events = _calendar$events === void 0 ? {
  dateFormat: 'MMMM dd, yyyy',
  timeFormat: 'HH:mm',
  dialogTitle: dialogTitle
} : _calendar$events,
    _calendar$nativeOptio = calendar.nativeOptions,
    nativeOptions = _calendar$nativeOptio === void 0 ? {
  views: ['month', 'agenda']
} : _calendar$nativeOptio,
    _calendar$showAuthor = calendar.showAuthor,
    showAuthor = _calendar$showAuthor === void 0 ? true : _calendar$showAuthor;
exports.showAuthor = showAuthor;
exports.nativeOptions = nativeOptions;
exports.events = events;
var dateFormat = events.dateFormat,
    timeFormat = events.timeFormat,
    dialogTitle = events.dialogTitle;
exports.dialogTitle = dialogTitle;
exports.timeFormat = timeFormat;
exports.dateFormat = dateFormat;