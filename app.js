
/**
 * Module dependencies.
 */

var fs = require('fs')
  , path = require('path')
  , mongoose = require('mongoose')
  , express = require('express')
  , hash = require('./lib/hash').hash;

mongoose.connect('mongodb://localhost/chaosups');
var app = module.exports = express.createServer();

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

// Load libraries
app.libs = {};
var libsDir = path.join(__dirname, 'lib');
fs.readdir(libsDir, function(err, files) {
    files.forEach(function(lib) {
        console.log(lib);
        require(path.join(libsDir, lib))(app);
    });
});

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.cookieParser('shhhhh, 1234 secrets inside'));
  app.use(express.session({secret: 'shhhhh, 1234 secrets inside'}));
  app.use(express.methodOverride());
  app.use(express.compiler({ src : __dirname + '/public', enable: ['less']}));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.use(function(req, res, next) {
    var err = req.session.error
      , msg = req.session.success;
    delete req.session.error;
    delete req.session.success;
      
    res.locals.message = '';
    if (err) res.locals.message = '<p class="msg error">' + err + '</p>';
    if (msg) res.locals.message = '<p class="msg success">' + msg + '</p>';
    next();
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Compatible

// Now less files with @import 'whatever.less' will work(https://github.com/senchalabs/connect/pull/174)
var TWITTER_BOOTSTRAP_PATH = './vendor/twitter/bootstrap/less';
express.compiler.compilers.less.compile = function(str, fn){
  try {
    var less = require('less');var parser = new less.Parser({paths: [TWITTER_BOOTSTRAP_PATH]});
    parser.parse(str, function(err, root){fn(err, root.toCSS());});
  } catch (err) {fn(err);}
}

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
