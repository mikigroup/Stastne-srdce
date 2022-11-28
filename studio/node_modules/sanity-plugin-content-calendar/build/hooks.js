"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useStickyState = useStickyState;
exports.useHasChanges = exports.useEvents = void 0;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _react = require("react");

var _client = _interopRequireDefault(require("part:@sanity/base/client"));

var _dateFns = require("date-fns");

var _configContentCalendar = _interopRequireDefault(require("config:content-calendar"));

var _dlv = _interopRequireDefault(require("dlv"));

/* eslint-disable react-hooks/exhaustive-deps */
var client = _client["default"];

if (typeof _client["default"].withConfig == 'function') {
  client = _client["default"].withConfig({
    apiVersion: 'v1'
  });
}

var DEFAULT_TITLE = 'Untitled?';

var useEvents = function useEvents() {
  var _useState = (0, _react.useState)([]),
      _useState2 = (0, _slicedToArray2["default"])(_useState, 2),
      events = _useState2[0],
      setEvents = _useState2[1];

  var query = "* [_type == \"schedule.metadata\" && !(_id in path('drafts.**'))] {\n      ...,\n      \"doc\": * [_id == \"drafts.\" + ^.documentId ][0]\n    }\n  ";
  var listenQuery = "* [_type == \"schedule.metadata\" && !(_id in path('drafts.**'))]";

  var types = _configContentCalendar["default"].types.map(function (t) {
    return t.type;
  });

  var titleForEvent = function titleForEvent(doc) {
    if (doc) {
      var typeConfig = _configContentCalendar["default"].types.find(function (t) {
        return t.type === doc._type;
      });

      if (typeConfig) {
        return (0, _dlv["default"])(doc, typeConfig.titleField, DEFAULT_TITLE);
      }
    }

    return DEFAULT_TITLE;
  };

  var fetchWorkflowDocuments = function fetchWorkflowDocuments() {
    client.fetch(query, {
      types: types
    }).then(handleReceiveEvents);
  };

  var handleReceiveEvents = function handleReceiveEvents(documents) {
    var formatEvents = documents.filter(function (d) {
      return !!d.doc;
    }).map(function (event) {
      return {
        start: (0, _dateFns.parseISO)(event.datetime),
        end: (0, _dateFns.parseISO)(event.datetime),
        doc: event.doc,
        title: titleForEvent(event.doc),
        user: event.user,
        scheduledAt: event.scheduledAt
      };
    });
    setEvents(formatEvents);
  };

  (0, _react.useEffect)(function () {
    fetchWorkflowDocuments();
    var subscription = client.observable.listen(listenQuery, {
      types: types
    }).subscribe(function (result) {
      setTimeout(function () {
        fetchWorkflowDocuments();
      }, 2500);
    });
    return function () {
      subscription.unsubscribe();
    }; // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return events || undefined;
};

exports.useEvents = useEvents;

var useHasChanges = function useHasChanges(event) {
  var _event$doc;

  var id = ((_event$doc = event.doc) === null || _event$doc === void 0 ? void 0 : _event$doc._id) || '';
  var filterWarnings = _configContentCalendar["default"].filterWarnings;

  var _useState3 = (0, _react.useState)(false),
      _useState4 = (0, _slicedToArray2["default"])(_useState3, 2),
      hasChanges = _useState4[0],
      setHasChanges = _useState4[1];

  var handleSetDraft = function handleSetDraft(doc) {
    // Check if the document meets a condition to not show a Warning
    if (filterWarnings !== null && filterWarnings !== void 0 && filterWarnings.length) {
      var filterChecks = filterWarnings // Check they're arrays of objects
      .filter(function (filters) {
        var _Object$keys;

        return (_Object$keys = Object.keys(filters)) === null || _Object$keys === void 0 ? void 0 : _Object$keys.length;
      }).map(function (filters) {
        var matches = Object.keys(filters).filter(function (key) {
          return (0, _dlv["default"])(doc, key) === (0, _dlv["default"])(filters, key);
        }); // Were there as many matches as there are keys?

        return matches.length === Object.keys(filters).length;
      }); // Did any of the filters return true?

      if (filterChecks.some(function (check) {
        return check;
      })) {
        return setHasChanges(false);
      }
    } // Otherwise, check if the document was edited after it was scheduled


    if ((0, _dateFns.isAfter)((0, _dateFns.parseISO)(doc._updatedAt), (0, _dateFns.parseISO)(event.scheduledAt))) {
      setHasChanges(true);
    }
  };

  (0, _react.useEffect)(function () {
    var subscription;

    if (id) {
      subscription = client.observable.fetch("*[_id in path(\"drafts.".concat(id, "\") || _id == \"").concat(id, "\"] | order(_updatedAt desc)")).subscribe(function (docs) {
        handleSetDraft(docs[0]);
      });
    }

    return function () {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [id]);
  return hasChanges;
};

exports.useHasChanges = useHasChanges;

function useStickyState(defaultValue, key) {
  var _useState5 = (0, _react.useState)(function () {
    var stickyValue = window.localStorage.getItem(key);
    return stickyValue === null ? defaultValue : JSON.parse(stickyValue);
  }),
      _useState6 = (0, _slicedToArray2["default"])(_useState5, 2),
      value = _useState6[0],
      setValue = _useState6[1];

  (0, _react.useEffect)(function () {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
}