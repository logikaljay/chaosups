
/**
 * Module dependencies.
 */

var fs = require('fs')
  , path = require('path')
  , mongoose = require('mongoose')
  , express = require('express')
  , bodyParser = require('body-parser')
  , engine = require('ejs-locals')
  , hash = require('./lib/hash').hash;

mongoose.connect('mongodb://localhost/chaosups');
var app = module.exports = express();

// Load libraries
app.libs = {};
var libsDir = path.join(__dirname, 'lib');
fs.readdir(libsDir, function(err, files) {
    files.forEach(function(lib) {
        console.log(lib);
        require(path.join(libsDir, lib))(app);
    });
});

// Load models
app.models = {};
var modelsDir = path.join(__dirname, 'models');
fs.readdir(modelsDir, function(err, files) {
    files.forEach(function(model) {
        require(path.join(__dirname, 'models', model))(app);
    });
});

// Load controllers
app.controllers = {};
var controllersDir = path.join(__dirname, 'controllers');
fs.readdir(controllersDir, function(err, files) {
    files.forEach(function(controller) {
        console.log(controller);
        require(path.join(controllersDir, controller))(app);
    });
});

// Load factories
app.factory = {};
var factoryDir = path.join(__dirname, 'factory');
fs.readdir(factoryDir, function(err, files) {
    files.forEach(function(factory) {
        console.log(factory);
        require(path.join(factoryDir, factory))(app);
    });
});

// Configuration
app.engine('ejs', engine);
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('shhhhh, 1234 secrets inside'));
app.use(express.session({secret: 'shhhhh, 1234 secrets inside'}));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

app.listen(3000, function(){
  console.log("Express server listening");
});
