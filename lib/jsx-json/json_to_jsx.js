'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = jsonToJsx;

var _walktree = require('./walktree');

var _walktree2 = _interopRequireDefault(_walktree);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var space = function space(num) {
  var s = '';
  while (num--) {
    s = s + '  ';
  }
  return s;
};
var getTagName = function getTagName(node) {
  if (node.parentType) {
    return node.parentType + '.' + node.type;
  }
  return node.type;
};

var generatePropsStr = function generatePropsStr(props, prefix) {
  var propKeys = Object.keys(props);
  return propKeys.map(function (propKey) {
    var propValue = props[propKey];
    var valueType = typeof propValue === 'undefined' ? 'undefined' : _typeof(propValue);
    var ret = void 0;
    if (valueType === 'object') {
      ret = '' + prefix + propKey + '={' + JSON.stringify(propValue) + '}';
    } else if (['boolean', 'number', 'undefined'].indexOf(valueType) >= 0 || propValue === null) {
      ret = '' + prefix + propKey + '={' + propValue + '}';
    } else {
      var v = propValue.replace(/"/g, '\\"');
      ret = '' + prefix + propKey + '={"' + v + '"}';
    }
    return ret;
  }).join('\n');
};

function jsonToJsx(jsonTree) {
  var str = '';
  _walktree2.default.deep(jsonTree, {
    enter: function enter(node, level) {
      var tagName = getTagName(node);
      var props = node.props;
      var propsStr = '';
      var fillSpace = space(level);
      if (tagName === 'text') {
        return;
      }
      if (props) {
        propsStr = generatePropsStr(props, space(level + 1));
        str += fillSpace + '<' + tagName + '\n' + propsStr + '\n' + fillSpace + '>\n';
      } else {
        str += fillSpace + '<' + tagName + '>\n';
      }
    },
    process: function process(node, level) {
      if (node.type === 'span') {
        str += '' + space(level + 1) + node.text + '\n';
      } else if (node.type === 'text') {
        str += '' + space(level) + node.text + '\n';
      }
    },
    leave: function leave(node, level) {
      // const isSpanFlag = isSpan(node);
      var tagName = getTagName(node);
      if (tagName !== 'text') {
        str += space(level) + '</' + tagName + '>\n';
      }
    }
  });
  return str;
}