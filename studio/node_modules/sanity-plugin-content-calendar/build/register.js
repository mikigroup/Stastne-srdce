"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addActions = addActions;
exports.addBadge = addBadge;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _documentActions = require("part:@sanity/base/document-actions");

var _ScheduledBadge = require("./badges/ScheduledBadge");

var _schedule = require("./actions/schedule");

var _scheduling = require("./scheduling");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function CustomDeleteAction(params) {
  var metadata = (0, _scheduling.useScheduleMetadata)(params.id);

  var onComplete = function onComplete() {
    metadata["delete"]();
    params.onComplete();
  };

  var result = (0, _documentActions.DeleteAction)(_objectSpread(_objectSpread({}, params), {}, {
    onComplete: onComplete
  }));
  return result;
}

function CustomPublishAction(params) {
  var metadata = (0, _scheduling.useScheduleMetadata)(params.id);
  var result = (0, _documentActions.PublishAction)(params);
  return _objectSpread(_objectSpread({}, result), {}, {
    onHandle: function onHandle() {
      result.onHandle();
      metadata["delete"]();
    }
  });
}

function addActions(_ref) {
  var type = _ref.type;
  var actions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

  if ((0, _scheduling.schedulingEnabled)(type)) {
    var pluginActions = [_schedule.scheduleAction, _schedule.unScheduleAction, CustomPublishAction, CustomDeleteAction];
    var defaultActions = actions.filter(function (action) {
      return action !== _documentActions.DeleteAction && action !== _documentActions.PublishAction;
    });
    return [].concat(pluginActions, (0, _toConsumableArray2["default"])(defaultActions));
  }

  return actions;
}

function addBadge(_props, badges) {
  return [].concat((0, _toConsumableArray2["default"])(badges), [_ScheduledBadge.ScheduledBadge]);
}