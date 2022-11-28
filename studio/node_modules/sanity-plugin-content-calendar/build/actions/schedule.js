"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.scheduleAction = exports.unScheduleAction = void 0;

var _icons = require("@sanity/icons");

var _dateFns = require("date-fns");

var _reactHooks = require("@sanity/react-hooks");

var _scheduling = require("../scheduling");

/* eslint-disable react-hooks/rules-of-hooks */
var unScheduleAction = function unScheduleAction(_ref) {
  var id = _ref.id,
      draft = _ref.draft,
      onComplete = _ref.onComplete;
  var scheduled = (0, _scheduling.isScheduled)({
    draft: draft,
    id: id
  });
  var metadata = (0, _scheduling.useScheduleMetadata)(id);
  if (!scheduled) return null;
  return {
    disabled: !scheduled,
    icon: _icons.CalendarIcon,
    color: 'danger',
    label: 'Unschedule',
    onHandle: function onHandle() {
      metadata["delete"]();
      onComplete();
    }
  };
};

exports.unScheduleAction = unScheduleAction;

var scheduleAction = function scheduleAction(_ref2) {
  var id = _ref2.id,
      draft = _ref2.draft,
      onComplete = _ref2.onComplete,
      type = _ref2.type,
      liveEdit = _ref2.liveEdit;
  var metadata = (0, _scheduling.useScheduleMetadata)(id);
  var validationStatus = (0, _reactHooks.useValidationStatus)(id, type);
  var scheduled = (0, _scheduling.isScheduled)({
    draft: draft,
    id: id
  });
  if (liveEdit || !(0, _scheduling.schedulingEnabled)(type)) return null;
  if (!draft) return null;
  var datetime = (0, _scheduling.publishAt)({
    draft: draft
  });
  if (!datetime) return null;
  if (!(0, _dateFns.isFuture)((0, _dateFns.parseISO)(datetime))) return null;
  var hasValidationErrors = validationStatus.markers.some(function (marker) {
    return marker.level === 'error';
  });
  var enabled = (0, _scheduling.publishInFuture)({
    draft: draft
  }) && !hasValidationErrors;
  var isNewScheduleDate = datetime !== metadata.data.datetime;
  var isNewContent = draft._rev !== metadata.data.rev;
  if (!isNewScheduleDate && !isNewContent) return null;
  return {
    disabled: !enabled,
    icon: _icons.CalendarIcon,
    label: scheduled ? 'Reschedule' : 'Schedule',
    color: scheduled ? 'warning' : 'success',
    onHandle: function onHandle() {
      metadata.setData(datetime, draft._rev);
      onComplete();
    }
  };
};

exports.scheduleAction = scheduleAction;