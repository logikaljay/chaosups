
/**
 * Module dependencies.
 */

var fs = require('fs')
  , path = require('path')
  , mongoose = require('mongoose')
  , express = require('express')
  , routes = require('./routes')
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

var users = {
    jay: { name: 'jay' }
}

hash('foobar', function(err, salt, hash) {
    if (err) throw err;

    users.jay.salt = salt;
    users.jay.hash = hash.toString();
});

app.authenticate = function(name, pass, fn) {
    if (!module.parent) console.log('authenticating %s:%s', name, pass);
    var user = users[name];
    
    if (!user) return fn(new Error('cannot find user'));
    
    hash(pass, user.salt, function(err, hash) {
        if (err) return fn(err);
        if (hash.toString() == user.hash) return fn(null, user);
        fn(new Error('invalid password'));
    });
}

function restrict(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        req.session.error = 'Access denied!';
        res.redirect('/login');
    }
}

// Routes
app.get('/', routes.index);
app.get('/login', routes.login);
app.post('/login', routes.login_post(app));
app.get('/restricted', restrict, function(req, res) {
    res.send('Wahoo! restricted area. click to <a href="/logout">logout</a>');
});

app.get('/logout', function(req, res) {
    req.session.destroy(function() {
        res.redirect('/');
    });
});
app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
