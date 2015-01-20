var plugin = exports = module.exports = {};
var app;

plugin.name = "Bugs";
plugin.version = "1.0";
plugin.nav = {
    text: "Submit a bug",
    url: "https://github.com/logikaljay/chaosups/issues"
};

plugin.load = function(app) {
    this.app = app;
}
