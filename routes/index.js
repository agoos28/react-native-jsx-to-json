import { jsxToJson } from '../lib/jsx-json';
var express = require('express');
var dJSON = require('dirty-json');
var router = express.Router();
var formatJson = require('format-json-pretty');
var readline = require('readline');
var path = require('path');
var fs = require('fs');


function renderDebug(debug){
  console.log(typeof(debug))
  if(typeof(debug) == 'object' || typeof(debug) == 'array'){
    return ''
  }else{
    return ''
  }
}

function processFile(inputFile) {
  var instream = fs.createReadStream(inputFile),
      outstream = new (require('stream'))(),
      rl = readline.createInterface(instream, outstream),
      code = '', start = false, lineCount = 0, lineStart = 0, lineEnd = 0;
   
  rl.on('line', function (line) {
    lineCount++
    if(start === true && line != '//-----'){
      code += line + '\n';
    }
    if(line === '//-----'){
      if(start == false){
        start = true;
        lineStart = lineCount;
      }else{
        start = false;
        lineEnd = lineCount;
      }
    }
  });
  
  rl.on('close', function (line) {
      console.log(code);
      console.log('done reading file.');
  });
}


function parseState(state){
  if(!state){
    return '';
  }
  var values = dJSON.parse(state);
  var result = [];

  for (var key in values) {
    result.push({
      tag: key,
      value: JSON.stringify(values[key]).replace(/\"+/g, '\\\"')
    })
  }
  return result;
}

/* GET home page. */
router.get('/', function(req, res, next) {
  var debug
  debug = req
  res.render('index', {
    title: 'Express',
    debug: renderDebug('')
  });
});
router.post('/', function(req, res, next) {
  var debug;
  debug = req;
  var viewJSX = jsxToJson(req.body.viewJSX);
  var headerJSX = jsxToJson(req.body.headerJSX);
  var tmpl = {
    image: "",
    name: req.body.screenName,
    options: {
      header: headerJSX,
      on_navigation: true,
      screen_analytic: "'"+req.body.screenName+"'",
      screen_icon: "../img/icon-home.png",
      screen_title: req.body.screenName,
    },
    state: parseState(req.body.state),
    view: [
      viewJSX
    ]
  }
  //C:\Project\codigo\cs-sencillo-app-template\src\main.js
  //processFile('../cs-sencillo-app-template/src/main.js');
  //console.log(req.body)

  res.render('index', {
    title: 'Express',
    screenName: req.body.screenName,
    headerJSX: req.body.headerJSX,
    viewJSX: req.body.viewJSX,
    state: req.body.state,
    json: formatJson(tmpl),
    stringify: JSON.stringify(formatJson(tmpl).replace(/\s\s+/g, ' ')),
    debug: renderDebug('')
  });
});

module.exports = router;
