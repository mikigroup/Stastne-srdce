"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _client = _interopRequireDefault(require("part:@sanity/base/client"));

var client = typeof _client["default"].withConfig === 'function' ? _client["default"].withConfig({
  apiVersion: '2021-09-06'
}) : _client["default"];
var _default = client;
exports["default"] = _default;