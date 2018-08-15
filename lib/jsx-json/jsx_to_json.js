'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; 


/*
 * convert jsx to json
 * @export
 * @param {string} jsxString  jsx string
 * @return {object} component tree
 */


exports.default = jsxToJson;

var _babelTraverse = require('babel-traverse');


var _babelTraverse2 = _interopRequireDefault(_babelTraverse);

var _babelGenerator = require('babel-generator');

var _babelGenerator2 = _interopRequireDefault(_babelGenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var types = require('babel-types');
var babylon = require('babylon');


var defaultOptions = {
  sourceType: 'module',
  plugins: ['jsx', 'flow']
};

function getParentType(node) {
  var type = void 0;
  if (types.isJSXIdentifier(node)) {
    type = node.name;
  } else if (types.isJSXMemberExpression(node)) {
    type = getParentType(node.object) + '.' + node.property.name;
  }
  return type;
}

function jsxToJson(jsxString, userOptions) {
  var options = _extends({}, defaultOptions, userOptions);
  var ast = babylon.parse(jsxString, options);
  var jsonTree = void 0;
  var JSXlevel = 0;
  var JSXCount = 0;

  (0, _babelTraverse2.default)(ast, {
    JSXElement: {
      enter: function enter() {
        JSXlevel++;
        JSXCount++;
      },
      exit: function exit() {
        JSXlevel--;
        JSXCount++;
      }
    },

    JSXOpeningElement: {
      enter: function enter(path) {
        //console.log(JSXlevel);
        
        var nodeName = path.node.name;
        if(nodeName.name == 'Text'){
          //console.log('[74]',path.node)
        }
        var jsonNode = void 0;
        if (types.isJSXIdentifier(nodeName)) {
          var type = nodeName.name;
          jsonNode = {
            id: type+'-'+JSXCount+'-'+JSXlevel,
            type: type,
            code: {
              cross_platform: {
                tag: type
              }
            }
          };
        } else if (types.isJSXMemberExpression(nodeName)) {
          var _type = nodeName.property.name;
          var parentType = getParentType(nodeName.object);
          jsonNode = { type: _type, parentType: parentType };
        }
        if (JSXlevel === 1) {
          jsonTree = jsonNode;
          path.parent.__jsonNode = jsonNode;
        } else if (JSXlevel > 1) {
          path.parent.__jsonNode = jsonNode;
          if(path.parentPath.parentPath.node.__jsonNode){
            try {
              var parentJsonNode = path.parentPath.parentPath.node.__jsonNode;
              if (!parentJsonNode.child) {
                parentJsonNode.child = [];
              }
              parentJsonNode.child.push(jsonNode);
            } catch (e) {
              console.log(e);
            }
          }
        }
      }
    },

    JSXExpressionContainer: function(path){
      var node = path.node;
      if(path.parent.__jsonNode){
        if (path.parent.__jsonNode.type === 'Text') {
          path.parent.__jsonNode['content'] = (0, _babelGenerator2.default)(node).code;
        }
      }
    },

    JSXText: function JSXText(path) {
      var text = path.node.value;
      text = text.replace(/[\n]/g, '').trim();
      if (text) {
        var parentNode = path.parent.__jsonNode;
        if (path.parent.__jsonNode.type !== 'span') {
          // init children if parent node doesn't have it.
          if (!parentNode.child) {
            parentNode['content'] = text;
          }
        } else {
          parentNode['content'] = text;
        }
      }
    },
    JSXAttribute: function JSXAttribute(path) {
      var node = path.node;
      var key = node.name.name;
      var value = getPropValue(node.value);
      var parent = path.findParent(function (path) {
        return types.isJSXElement(path.node);
      });
      var parentJsonNode = parent.node.__jsonNode;

      if (!parentJsonNode.properties) {
        parentJsonNode.properties = [];
      }
      
      switch (key) {
        case 'id':
          parentJsonNode[key] = value;
          break;
        case 'source':
        case 'ref':
          var strvalue;
          if(typeof(value) == 'object'){
            strvalue = JSON.stringify(value).replace(/\"+/g, '');
          }
          if(typeof(value) == 'string'){
            strvalue = 'require(\''+value+'\')';
          }
          parentJsonNode.properties.push({
            cross_platform: {
              tag: key,
              value: strvalue
            }
          })
          break;
        case 'type':
          //console.log('[130]',key);
          break;
        case 'code':
          parentJsonNode.code.cross_platform = Object.assign(value, parentJsonNode.code.cross_platform);
          break;
        case 'renderItem':
          parentJsonNode['render_item'] = {
              cross_platform: {
                item_view: value
              }
            }
          break;
        case 'style':
          var styles = Object.keys(value).map(function(key) {
            if(key == 'marginLeft'){
              //console.log(value[key]);
            }
            return {
              cross_platform: {
                tag: key,
                value: value[key]
              }
            };
          });
          parentJsonNode['styles'] = styles;
          break;
        default:
          parentJsonNode.properties.push({
            cross_platform: {
              tag: key,
              value: value
            }
          })
      }

    }
  });
  return jsonTree;
}

function mapPropValue(values){
  var obj = {};

  if(typeof(values) == 'undefined'){
    return '';
  }

  var length =  parseInt(values.length);

  for (var i = 0; i <= length; i++) {

    if(typeof(values[i]) == 'undefined'){
      break;
    }

    var key = values[i].key.name;
    var value;
    //console.log('[142]',values[i].value.type);
    switch (values[i].value.type) {
      case 'ObjectExpression':
        value = mapPropValue(values[i].value.properties);
        break;
      case 'Identifier':
        value = values[i].value.name;
        break;
      case 'StringLiteral':
        value = "'"+values[i].value.value+"'";
        break;
      case 'NumericLiteral':
        value = values[i].value.value.toString();
        break;
      case 'MemberExpression':
        value = (0, _babelGenerator2.default)(values[i].value).code;
        break;
      case 'UnaryExpression':
        value = values[i].value.operator + values[i].value.argument.value;
        break;
      default:
        value = "'"+values[i].value.value+"'";
        break;
    }
    
    /* if(key == 'uri'){
      console.log('---',key);
      console.log(values[i]);
    } */
    
    obj[key] = value
  };
  //console.log('===',obj);
  return obj;
}

function getPropValue(node) {
  var value = void 0;
  //console.log('-------',node.expression.type,'--------------');
  if (types.isJSXExpressionContainer(node)) {
    var expression = node.expression;
    var exp_type = expression.type;
    //console.log('[172] ',expression.type)
    switch (expression.type) {
      case 'CallExpression':
        //console.log(expression.arguments[0].value)
        return expression.arguments[0].value;
      case 'MemberExpression':
        var code = (0, _babelGenerator2.default)(expression).code;
        //console.log('[171] ',code)
        return code;
      case 'ObjectExpression':
        return mapPropValue(expression.properties);
      case 'StringLiteral':
        //console.log('[184]', expression);
        return "'"+expression.value+"'";
      case 'NumericLiteral':
        return expression.value.toString();
      case 'TemplateLiteral':
        var code = (0, _babelGenerator2.default)(expression).code;
        console.log('[289]',code);
        return code.replace(/(\r\n\t|\n|\r\t)/gm,"");
      case 'ArrowFunctionExpression':
        if(expression.body.type == 'MemberExpression'){
          var code = (0, _babelGenerator2.default)(expression).code;
          console.log('[294]',code);
          //console.log('[187] ',code)
          return code;
        }
        if(expression.body.type == 'JSXElement'){
          var code = (0, _babelGenerator2.default)(expression).code;
          value = jsxToJson(code);
          //console.log('[173] ',value)
          return value;
        }
        if(expression.body.body && expression.body.body[0]){
          var exp = expression.body.body[0].expression
          console.log('[305]',exp)
          if(!exp.callee){
            return (0, _babelGenerator2.default)(expression).code.replace(/(\r\n\t|\n|\r\t)/gm,"");
          }
          return {
            name: exp.callee.name,
            value: exp.arguments[0].value.replace(/(\r\n\t|\n|\r\t)/gm,"")
          }
        }
        if(!expression.body.body){
          //console.log()
          try {
            var code = (0, _babelGenerator2.default)(expression.body).code;
            value =  code;
          } catch(err) {
            console.log(err);
          }
          return value;
        }
        try {
          var code = (0, _babelGenerator2.default)(expression).code;
          value =  eval('(' + code + ')');
        }
        catch(err) {
          console.log(err);
        }
        return value; /* eslint no-eval: "off"*/
      default:
        //console.log(exp_type);
        //console.log(expression.properties);
        var code = (0, _babelGenerator2.default)(expression).code;
        return code;

    }
  } else {
    //console.log('[224]',node)
    value = node.value;
  }
  return value;
}
