module.exports = function(app) {
    app.locals.plugins = app.locals.plugins || [];

    app.locals.plugins.push({
        text: "Submit a bug",
        url: "https://github.com/logikaljay/chaosups/issues"
    });
}