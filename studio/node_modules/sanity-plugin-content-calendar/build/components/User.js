"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = User;

var _propTypes = _interopRequireDefault(require("prop-types"));

var _react = _interopRequireDefault(require("react"));

var _components = require("@sanity/base/components");

var _ui = require("@sanity/ui");

function User(_ref) {
  var user = _ref.user,
      _ref$minimal = _ref.minimal,
      minimal = _ref$minimal === void 0 ? false : _ref$minimal;
  return /*#__PURE__*/_react["default"].createElement(_ui.Flex, null, minimal ? /*#__PURE__*/_react["default"].createElement(_components.UserAvatar, {
    userId: user.id
  }) : /*#__PURE__*/_react["default"].createElement(_ui.Box, null, /*#__PURE__*/_react["default"].createElement(_ui.Inline, {
    space: 1
  }, /*#__PURE__*/_react["default"].createElement(_components.UserAvatar, {
    userId: user.id
  }), /*#__PURE__*/_react["default"].createElement(_ui.Text, null, user.displayName))));
}

User.defaultProps = {
  minimal: false
};
User.propTypes = {
  minimal: _propTypes["default"].bool,
  user: _propTypes["default"].shape({
    displayName: _propTypes["default"].string.isRequired,
    id: _propTypes["default"].string.isRequired
  }).isRequired
};