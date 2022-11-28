"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = Warning;

var _react = _interopRequireDefault(require("react"));

var _ui = require("@sanity/ui");

var _icons = require("@sanity/icons");

function Warning() {
  return /*#__PURE__*/_react["default"].createElement(_ui.Card, {
    tone: "caution",
    shadow: 1,
    padding: 3,
    radius: 2
  }, /*#__PURE__*/_react["default"].createElement(_ui.Flex, {
    gap: 3
  }, /*#__PURE__*/_react["default"].createElement(_ui.Text, {
    size: 2
  }, /*#__PURE__*/_react["default"].createElement(_icons.WarningOutlineIcon, null)), /*#__PURE__*/_react["default"].createElement(_ui.Stack, {
    space: 3,
    flex: 1
  }, /*#__PURE__*/_react["default"].createElement(_ui.Box, null, /*#__PURE__*/_react["default"].createElement(_ui.Text, {
    weight: "semibold"
  }, "Warning")), /*#__PURE__*/_react["default"].createElement(_ui.Box, null, /*#__PURE__*/_react["default"].createElement(_ui.Text, {
    size: 1
  }, "The document has changed since it was scheduled for publishing. Please review it and reschedule if needed.")))));
}