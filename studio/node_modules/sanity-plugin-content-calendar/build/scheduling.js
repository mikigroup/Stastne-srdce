"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.schedulingEnabled = schedulingEnabled;
exports.publishAt = publishAt;
exports.publishInFuture = publishInFuture;
exports.isScheduled = isScheduled;
exports.useScheduleMetadata = useScheduleMetadata;

var _reactHooks = require("@sanity/react-hooks");

var _dateFns = require("date-fns");

var _configContentCalendar = _interopRequireDefault(require("config:content-calendar"));

var _user = _interopRequireDefault(require("part:@sanity/base/user"));

var _client = _interopRequireDefault(require("./client"));

var _dlv = _interopRequireDefault(require("dlv"));

/* eslint-disable react-hooks/rules-of-hooks */
function schedulingEnabled(type) {
  return !!_configContentCalendar["default"].types.find(function (t) {
    return t.type === type;
  });
}

function publishAt(_ref) {
  var draft = _ref.draft;
  if (!draft) return null;

  var typeConfig = _configContentCalendar["default"].types.find(function (t) {
    return t.type === draft._type;
  });

  if (typeConfig) {
    return (0, _dlv["default"])(draft, typeConfig.field);
  }

  return null;
}

function publishInFuture(_ref2) {
  var draft = _ref2.draft;
  var datetime = publishAt({
    draft: draft
  });

  if (datetime) {
    var then = (0, _dateFns.parseISO)(datetime);
    return (0, _dateFns.isFuture)(then);
  }

  return false;
}

function isScheduled(_ref3) {
  var id = _ref3.id;
  var metadata = useScheduleMetadata(id);
  return metadata && metadata.data && !!metadata.data.datetime && !!metadata.data.rev;
}

function useScheduleMetadata(id) {
  var metadataId = "schedule-metadata.".concat(id);
  var metadataType = 'schedule.metadata';
  var editState = (0, _reactHooks.useEditState)(metadataId, metadataType);
  var ops = (0, _reactHooks.useDocumentOperation)(metadataId, metadataType);
  var data = editState && editState.published ? editState.published : {
    _id: metadataId,
    _type: metadataType
  };
  return {
    commit: commit,
    data: data,
    "delete": deleteMetadata,
    setData: setData
  };

  function commit() {
    ops.commit.execute();
  }

  function deleteMetadata() {
    ops["delete"].execute();
  }

  function setData(datetime, rev) {
    _user["default"].getUser('me').then(function (user) {
      return _client["default"].createOrReplace({
        _id: metadataId,
        _type: metadataType,
        documentId: id,
        datetime: datetime,
        rev: rev,
        user: user,
        scheduledAt: new Date().toISOString()
      });
    });
  }
}