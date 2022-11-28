"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = resolveDocumentBadges;

var _documentBadges = _interopRequireDefault(require("part:@sanity/base/document-badges"));

var _register = require("./register");

function resolveDocumentBadges(props) {
  var badges = (0, _documentBadges["default"])(props);
  return (0, _register.addBadge)(props, badges);
}