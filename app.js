// ChaosUPS - a universal points system.
// Copyright (C) 2015  Jay Baker

/**
 * Module dependencies.
 */

var fs = require('fs'),
  path = require('path'),
  mongoose = require('mongoose'),
  express = require('express'),
  SessionStore = require('session-mongoose')(express),
  bodyParser = require('body-parser'),
  engine = require('ejs-locals'),
  moment = require('moment'),
  async = require('async'),
  hash = require('./lib/hash').hash

mongoose.connect('mongodb://localhost/chaosups')
var app = (module.exports = express())

// Load libraries
app.libs = {}
var libsDir = path.join(__dirname, 'lib')
var libs = fs.readdirSync(libsDir)
libs.forEach(function(lib) {
  console.log(lib)
  require(path.join(libsDir, lib))(app)
})

// Load models
app.models = {}
var modelsDir = path.join(__dirname, 'models')
fs.readdir(modelsDir, function(err, files) {
  files.forEach(function(model) {
    require(path.join(__dirname, 'models', model))(app)
  })
})

// Load controllers
app.controllers = {}
var controllersDir = path.join(__dirname, 'controllers')
fs.readdir(controllersDir, function(err, files) {
  files.forEach(function(controller) {
    console.log(controller)
    require(path.join(controllersDir, controller))(app)
  })
})

// Load factories
app.factory = {}
var factoryDir = path.join(__dirname, 'factory')
fs.readdir(factoryDir, function(err, files) {
  files.forEach(function(factory) {
    console.log(factory)
    require(path.join(factoryDir, factory))(app)
  })
})

// Load plugins
app.plugins = []
var pluginsDir = path.join(__dirname, 'plugins')
fs.readdir(pluginsDir, function(err, plugins) {
  plugins.forEach(function(plugin) {
    if (plugin.indexOf('.js') > 0) {
      require(path.join(pluginsDir, plugin))(app)
      console.log('[PLUGIN] Loaded: %s', plugin)
    }
  })
})

// Session store configuration
var sessionStore = new SessionStore({
  interval: 120000, // expiration check worker run interval in millisec (default: 60000)
  modelName: 'session',
  connection: mongoose.connection // <== custom connection
})

// Set local variables views
app.locals.moment = moment
app.locals.title = 'ChaosUPS'

// Configuration
app.engine('ejs', engine)
app.set('port', process.env.PORT || 3000)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.favicon())
app.use(express.logger('dev'))
app.use(express.json())
app.use(express.urlencoded())
app.use(express.bodyParser())
app.use(express.methodOverride())
app.use(express.cookieParser('shhhhh, 1234 secrets inside'))
app.use(
  express.session({
    secret: 'shhhh, 1234 secrets inside',
    store: sessionStore
  })
)
app.use(express.static(path.join(__dirname, 'public')))
app.use(app.router)

var port = process.env.PORT || 3000
app.listen(port, function() {
  console.log('Express server listening')
})
