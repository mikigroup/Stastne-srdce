"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = EventDialog;

var _propTypes = _interopRequireDefault(require("prop-types"));

var _react = _interopRequireDefault(require("react"));

var _ui = require("@sanity/ui");

var _format = _interopRequireDefault(require("date-fns/format"));

var _config = require("../config");

var _EventDetail = _interopRequireDefault(require("./EventDetail"));

function EventDialog(_ref) {
  var event = _ref.event,
      isOpen = _ref.isOpen,
      onClose = _ref.onClose;
  var title = _config.dialogTitle === 'date' ? (0, _format["default"])(event.start, _config.dateFormat) : 'Schedule details';
  if (!isOpen) return null;
  return /*#__PURE__*/_react["default"].createElement(_ui.Dialog, {
    header: _config.dialogTitle ? _config.dialogTitle : title,
    onClose: onClose,
    width: 1
  }, /*#__PURE__*/_react["default"].createElement(_EventDetail["default"], {
    event: event,
    onClose: onClose
  }));
}

EventDialog.propTypes = {
  event: _propTypes["default"].shape({
    start: _propTypes["default"].instanceOf(Date)
  }).isRequired,
  isOpen: _propTypes["default"].bool.isRequired,
  onClose: _propTypes["default"].func.isRequired
};