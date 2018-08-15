'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _jsx_to_json = require('./jsx_to_json');

var _jsx_to_json2 = _interopRequireDefault(_jsx_to_json);

var _json_to_jsx = require('./json_to_jsx');

var _json_to_jsx2 = _interopRequireDefault(_json_to_jsx);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var out = {
  jsxToJson: _jsx_to_json2.default,
  jsonToJsx: _json_to_jsx2.default
};

module.exports = out;
exports.default = out;