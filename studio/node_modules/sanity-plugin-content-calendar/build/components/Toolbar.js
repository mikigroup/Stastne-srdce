"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = Toolbar;

var _propTypes = _interopRequireDefault(require("prop-types"));

var _react = _interopRequireDefault(require("react"));

var _ui = require("@sanity/ui");

var _icons = require("@sanity/icons");

/* eslint-disable react/require-default-props */

/* eslint-disable react/jsx-no-bind */
var nav = [{
  name: 'previous',
  increment: -1
}, {
  name: 'today',
  increment: 0
}, {
  name: 'next',
  increment: 1
}];

function Toolbar(props) {
  var label = props.label,
      views = props.views,
      view = props.view,
      onView = props.onView,
      onNavigate = props.onNavigate,
      localizer = props.localizer,
      date = props.date;

  var changeMonth = function changeMonth() {
    var action = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'next';
    var increment = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    var currentDate;

    if (increment === 0) {
      currentDate = new Date();
    } else {
      currentDate = new Date(date.getFullYear(), date.getMonth() + increment, date.getDate());
    }

    onNavigate(action, currentDate);
  };

  return /*#__PURE__*/_react["default"].createElement(_ui.Box, {
    paddingBottom: 3
  }, /*#__PURE__*/_react["default"].createElement(_ui.Flex, {
    align: "center"
  }, /*#__PURE__*/_react["default"].createElement(_ui.Box, {
    flex: 1
  }, /*#__PURE__*/_react["default"].createElement(_ui.Text, {
    size: 4,
    weight: "bold"
  }, label)), /*#__PURE__*/_react["default"].createElement(_ui.Box, null, /*#__PURE__*/_react["default"].createElement(_ui.Flex, {
    gap: 2,
    align: "center"
  }, /*#__PURE__*/_react["default"].createElement(_ui.Card, {
    radius: 4,
    overflow: "auto",
    padding: 1,
    shadow: 1,
    tone: "primary"
  }, /*#__PURE__*/_react["default"].createElement(_ui.Flex, {
    gap: 1,
    align: "center"
  }, views.map(function (viewOption) {
    return /*#__PURE__*/_react["default"].createElement(_ui.Button, {
      fontSize: 1,
      padding: 3,
      key: viewOption,
      radius: 3,
      tone: "primary",
      icon: viewOption === "month" ? _icons.CalendarIcon : _icons.ThListIcon,
      mode: view === viewOption ? "primary" : "bleed",
      text: localizer.messages[viewOption],
      onClick: function onClick() {
        return onView(viewOption);
      }
    });
  }))), /*#__PURE__*/_react["default"].createElement(_ui.Card, {
    radius: 4,
    overflow: "auto",
    padding: 1,
    shadow: 1,
    tone: "primary"
  }, /*#__PURE__*/_react["default"].createElement(_ui.Flex, {
    gap: 1,
    align: "center"
  }, nav.map(function (_ref) {
    var name = _ref.name,
        increment = _ref.increment;
    return /*#__PURE__*/_react["default"].createElement(_ui.Button, {
      fontSize: 1,
      icon: name === 'previous' ? _icons.ChevronLeftIcon : undefined,
      iconRight: name === 'next' ? _icons.ChevronRightIcon : undefined,
      padding: 3,
      key: name,
      radius: 3,
      tone: "primary",
      mode: "bleed",
      text: localizer.messages[name],
      onClick: function onClick() {
        return changeMonth(name, increment);
      }
    });
  })))))));
}

Toolbar.propTypes = {
  date: _propTypes["default"].instanceOf(Date),
  label: _propTypes["default"].string,
  localizer: _propTypes["default"].shape({
    messages: _propTypes["default"].object
  }),
  onNavigate: _propTypes["default"].func,
  onView: _propTypes["default"].func,
  view: _propTypes["default"].string,
  views: _propTypes["default"].arrayOf(_propTypes["default"].string)
};