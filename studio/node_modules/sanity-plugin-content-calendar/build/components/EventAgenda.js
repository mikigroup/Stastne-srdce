"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = EventDetail;

var _propTypes = _interopRequireDefault(require("prop-types"));

var _react = _interopRequireDefault(require("react"));

var _router = require("part:@sanity/base/router");

var _draftUtils = require("part:@sanity/base/util/draft-utils");

var _schema = _interopRequireDefault(require("part:@sanity/base/schema"));

var _preview = _interopRequireDefault(require("part:@sanity/base/preview"));

var _ui = require("@sanity/ui");

var _icons = require("@sanity/icons");

var _hooks = require("../hooks");

var _config = require("../config");

var _Warning = _interopRequireDefault(require("./Warning"));

var _User = _interopRequireDefault(require("./User"));

function EventDetail(_ref) {
  var event = _ref.event;
  var hasChanges = (0, _hooks.useHasChanges)(event);
  var publishedId = (0, _draftUtils.getPublishedId)(event.doc._id);
  var router = (0, _router.useRouter)();

  var handleEdit = function handleEdit(id, type) {
    return router.navigateIntent('edit', {
      id: id,
      type: type
    });
  };

  return /*#__PURE__*/_react["default"].createElement(_ui.Stack, {
    padding: 2,
    space: 2
  }, hasChanges && /*#__PURE__*/_react["default"].createElement(_Warning["default"], null), /*#__PURE__*/_react["default"].createElement(_ui.Flex, {
    align: "center",
    gap: 4
  }, /*#__PURE__*/_react["default"].createElement(_ui.Box, {
    flex: 1
  }, /*#__PURE__*/_react["default"].createElement(_preview["default"], {
    value: event.doc,
    type: _schema["default"].get(event.doc._type)
  })), _config.showAuthor && /*#__PURE__*/_react["default"].createElement(_ui.Inline, {
    space: 2
  }, /*#__PURE__*/_react["default"].createElement(_ui.Label, {
    muted: true,
    size: 1
  }, "Scheduled By"), /*#__PURE__*/_react["default"].createElement(_User["default"], {
    user: event.user
  })), /*#__PURE__*/_react["default"].createElement(_ui.Flex, {
    gap: 3,
    justify: "space-between"
  }, /*#__PURE__*/_react["default"].createElement(_ui.Button, {
    tone: hasChanges ? 'caution' : 'positive',
    icon: hasChanges ? _icons.HistoryIcon : _icons.EditIcon,
    text: hasChanges ? 'Review' : 'Edit',
    onClick: function onClick() {
      return handleEdit(publishedId, event.doc._type);
    }
  }))));
}

EventDetail.propTypes = {
  event: _propTypes["default"].shape({
    doc: _propTypes["default"].shape({
      _id: _propTypes["default"].string,
      _type: _propTypes["default"].string
    }),
    user: _propTypes["default"].object
  }).isRequired
};