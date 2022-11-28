"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ScheduledBadge = ScheduledBadge;

var _scheduling = require("../scheduling");

function ScheduledBadge(_ref) {
  var id = _ref.id,
      draft = _ref.draft;
  var metadata = (0, _scheduling.useScheduleMetadata)(id);

  if (draft && metadata.data && metadata.data.datetime) {
    return {
      label: 'Scheduled',
      title: "Scheduled to publish at ".concat(metadata.data.datetime),
      color: 'warning'
    };
  }

  return null;
}