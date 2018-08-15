"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var noop = function noop() {};
var isEmpty = function isEmpty(arr) {
  return !arr || arr.length === 0;
};
var last = function last(arr) {
  return arr[arr.length - 1];
};

function deepWalk(root, _ref) {
  var _ref$process = _ref.process,
      process = _ref$process === undefined ? noop : _ref$process,
      _ref$enter = _ref.enter,
      enter = _ref$enter === undefined ? noop : _ref$enter,
      _ref$leave = _ref.leave,
      leave = _ref$leave === undefined ? noop : _ref$leave;

  var stack = [root];
  var visitied = [];
  var item = void 0;
  var level = 0;
  while (stack.length) {
    item = stack.shift();
    enter(item, level);
    process(item, level);
    visitied.push(item);
    if (isEmpty(item.children)) {
      var popitem = visitied.pop();
      leave(popitem, level);
      while (visitied.length) {
        var lastVisited = last(visitied);
        if (lastVisited && popitem === last(lastVisited.children)) {
          popitem = lastVisited;
          visitied.pop();
          level--;
          leave(lastVisited, level);
        } else {
          break;
        }
      }
    }
    var children = item.children;
    // 如果该节点有子节点，继续添加进入栈顶
    if (!isEmpty(children)) {
      level++;
      stack = children.concat(stack);
    }
  }
  while (visitied.length) {
    level--;
    leave(visitied.pop(), level);
  }
}

exports.default = {
  deep: deepWalk
};