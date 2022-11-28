"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof = require("@babel/runtime/helpers/typeof");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = Calendar;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _react = _interopRequireWildcard(require("react"));

var _ui = require("@sanity/ui");

require("react-big-calendar/lib/css/react-big-calendar.css?raw");

var _reactBigCalendar2 = require("react-big-calendar");

var _dateFns = require("date-fns");

var _hooks = require("../hooks");

var _config = require("../config");

var _EventDialog = _interopRequireDefault(require("./EventDialog"));

var _Event = _interopRequireDefault(require("./Event"));

var _EventAgenda = _interopRequireDefault(require("./EventAgenda"));

var _Calendar = _interopRequireDefault(require("./Calendar.css"));

var _Toolbar = _interopRequireDefault(require("./Toolbar"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

// eslint-disable-next-line import/no-unresolved, import/no-unassigned-import

/* TODO
  - Add loading states to event dialog and agenda events
  - Put preview into component for reuse 
  - Document calendar config
  - Create a component for day view
  - Add params to edit links when there are changes in order to open changes panel
  - Save _rev when scheduled is clicked in order to enable point above
  - Make event text customizeable? Warning title and description, button text, 
*/
var locales = {
  'en-US': require('date-fns/locale/en-US')
};
var localizer = (0, _reactBigCalendar2.dateFnsLocalizer)({
  format: _dateFns.format,
  parse: _dateFns.parse,
  startOfWeek: _dateFns.startOfWeek,
  getDay: _dateFns.getDay,
  locales: locales
});
var components = {
  event: _Event["default"],
  toolbar: _Toolbar["default"],
  agenda: {
    event: _EventAgenda["default"]
  }
};

function Calendar() {
  var events = (0, _hooks.useEvents)();

  var _useState = (0, _react.useState)(false),
      _useState2 = (0, _slicedToArray2["default"])(_useState, 2),
      isOpen = _useState2[0],
      setIsOpen = _useState2[1];

  var _useState3 = (0, _react.useState)(null),
      _useState4 = (0, _slicedToArray2["default"])(_useState3, 2),
      selectedEvent = _useState4[0],
      setSelectedEvent = _useState4[1];

  var _useStickyState = (0, _hooks.useStickyState)('month', 'sanity-calendar-view'),
      _useStickyState2 = (0, _slicedToArray2["default"])(_useStickyState, 2),
      view = _useStickyState2[0],
      setView = _useStickyState2[1];

  var handleOpenDialog = function handleOpenDialog(event) {
    setIsOpen(true);
    setSelectedEvent(event);
  };

  var handleCloseDialog = function handleCloseDialog() {
    setIsOpen(false);
    setSelectedEvent(null);
  };

  var handleViewChange = function handleViewChange(viewName) {
    setView(viewName);
  };

  return /*#__PURE__*/_react["default"].createElement(_ui.ThemeProvider, null, /*#__PURE__*/_react["default"].createElement("div", {
    className: _Calendar["default"].container
  }, /*#__PURE__*/_react["default"].createElement(_reactBigCalendar2.Calendar, (0, _extends2["default"])({
    components: components,
    className: _Calendar["default"].calendar,
    defaultView: view,
    onView: handleViewChange,
    localizer: localizer,
    events: events,
    startAccessor: "start",
    endAccessor: "end",
    onSelectEvent: handleOpenDialog
  }, _config.nativeOptions)), isOpen && /*#__PURE__*/_react["default"].createElement(_EventDialog["default"], {
    event: selectedEvent,
    isOpen: isOpen,
    onClose: handleCloseDialog
  })));
}