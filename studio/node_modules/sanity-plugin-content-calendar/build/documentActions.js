"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = resolveDocumentActions;

var _documentActions = _interopRequireDefault(require("part:@sanity/base/document-actions"));

var _register = require("./register");

function resolveDocumentActions(props) {
  var actions = (0, _documentActions["default"])(props);
  return (0, _register.addActions)(props, actions);
}